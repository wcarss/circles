import palettes from "./palettes.js";

const randomInt = (n) => parseInt(Math.floor(Math.random() * n));
const randomChoice = (arr) => arr[randomInt(arr.length)];
const randomChoiceDist = (dist) => {
  const r = Math.random();
  let i = 0;
  for (const [k, v] of Object.entries(dist)) {
    i += v;
    if (i >= r) return k;
  }
  // fallback if no value returned above:
  return dist[dist.keys()[dist.keys().length - 1]];
};
const bound = (v, low, high) => {
  if (v < low) return low;
  if (v > high) return high;
  return v;
};
const modWrap = (v, low, high) => {
  if (v < 0) {
    v *= -1;
    low *= -1;
    return v % low;
  }
  return v % high;
};
const wrap = (v, low, high) => {
  // . <      0 .  >    .
  /*
         |             
  +------+----+        
. |      | .  |    .    
--+------+----+--------
  |      |    |        
  +------+----+             
         |             
*/
  if (v < low) {
    let dist_from_low = low - v;
    dist_from_low %= high - low;
    return high - dist_from_low;
  } else if (v > high) {
    let dist_from_high = v - high;
    dist_from_high %= high - low;
    return low + dist_from_high;
  }
  return v;
};

const sizeDist = {
  392: 1 / 100000,
  68: 100 / 100000,
  36: 2000 / 100000,
  12: 9000 / 100000,
  6: 20000 / 100000,
  2: 68900 / 100000,
};

const pointUpdate = function () {
  const xSpeed = Math.random() > 0.5 ? -0.15 : 0.05;
  const ySpeed = Math.random() > 0.5 ? -0.05 : 0.15;

  return Math.random() > 0.9
    ? function () {
        this.x += xSpeed;
        this.y += ySpeed;
      }
    : () => {};
};

const draw = () => {
  let sh0 = 1;
  let sh1 = 2;
  let sh2 = 3;
  let sh3 = 4;
  let sh4 = 5;
  let sh5 = 2;
  if (mode == MINE) {
    sh0 = 1;
    sh1 = 2;
    sh2 = 3;
    sh3 = 4;
    sh4 = 5;
    sh5 = 2;
  } else if (mode === MINSKY) {
    sh0 = 4;
    sh1 = 4;
    sh2 = 8;
    sh3 = 8;
    sh4 = 3;
    sh5 = 3;
  } else {
    sh0 = 3;
    sh1 = 3;
    sh2 = 4;
    sh3 = 4;
    sh4 = 3;
    sh5 = 3;
  }

  i = i % 2500;
  context.rotate(1 / (Math.PI * 2 * 50));

  if (i % 103 === 0) {
    drawLines = !drawLines;
  }
  if (i % 1033 === 0) {
    palette = randomChoice(palettes);
  }
  if (i % 31) {
    drawShapes = !drawShapes;
  }

  context.fillStyle = palette[0];
  context.fillRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  i += 1;

  // minsky circle transform
  ya = ya + ((xa + xb) >> sh0);
  xa = xa - ((ya - yb) >> sh1);
  yb = yb + ((xb - xc) >> sh2);
  xb = xb - ((yb - yc) >> sh3);
  yc = yc + ((xc - xa) >> sh4);
  xc = xc - ((yc - ya) >> sh5);

  // wrap coords onto canvas
  const maxXSize = canvas.width / 2;
  const maxYSize = canvas.height / 2;
  xa = wrap(xa, -maxXSize, maxXSize);
  xb = wrap(xb, -maxXSize, maxXSize);
  xc = wrap(xc, -maxXSize, maxXSize);
  ya = wrap(ya, -maxYSize, maxYSize);
  yb = wrap(yb, -maxYSize, maxYSize);
  yc = wrap(yc, -maxYSize, maxYSize);

  const xs = drawLines ? 2 : randomChoiceDist(sizeDist); //8 - ((i * 2) % 6);
  const ys = drawLines ? 2 : 12; //8 - ((i * 2) % 6);

  points.push({
    x: xa + 0,
    y: ya - 0,
    xs: xs,
    ys: ys,
    colour: palette[1],
    update: pointUpdate(),
  });
  points.push({
    x: xb + 0,
    y: yb + 0,
    xs: xs,
    ys: ys,
    colour: palette[2 % palette.length],
    update: pointUpdate(),
  });
  points.push({
    x: xc + 0,
    y: yc + 0,
    xs: xs,
    ys: ys,
    colour: palette[3 % palette.length],
    update: pointUpdate(),
  });

  // we really don't want too many lines
  if (drawLines && Math.random() > 0.97) {
    if (i % 3 === 0) {
      lines.push({
        x: xa + 0,
        y: ya + 0,
        x2: xb + 0,
        y2: yb + 0,
        colour: palette[1],
      });
    } else if (i % 3 === 1) {
      lines.push({
        x: xa + 0,
        y: ya + 0,
        x2: xc + 0,
        y2: yc + 0,
        colour: palette[2 % palette.length],
      });
    } else {
      lines.push({
        x: xb + 0,
        y: yb + 0,
        x2: xc + 0,
        y2: yc + 0,
        colour: palette[3 % palette.length],
      });
    }
  }

  if (drawShapes && Math.random() > 0.99) {
    shapes.push({
      colour: randomChoice(palette.slice(1)),
      xa: xa + 0,
      ya: ya - 0,
      xb: xb + 0,
      yb: yb + 0,
      xc: xc + 0,
      yc: yc + 0,
    });
  }

  // cap these at a certain size
  while (points.length > 1350) {
    points.shift();
  }
  while (lines.length > 10) {
    lines.shift();
  }
  while (shapes.length > 3) {
    shapes.shift();
  }

  for (const point of points) {
    point.update();
    context.fillStyle = point.colour;
    context.beginPath();
    context.arc(
      point.x - point.xs / 2,
      point.y - point.ys / 2,
      point.xs,
      0,
      2 * Math.PI
    );
    context.fill();
  }

  for (const line of lines) {
    context.strokeStyle = line.colour;
    context.beginPath();
    context.moveTo(line.x, line.y);
    context.lineTo(line.x2, line.y2);
    context.stroke();
  }

  //if (drawShapes) {
  for (const shape of shapes) {
    context.globalAlpha = 0.1;
    context.fillStyle = shape.colour;
    context.beginPath();
    context.moveTo(shape.xa, shape.ya);
    context.lineTo(shape.xb, shape.yb);
    context.lineTo(shape.xc, shape.yc);
    context.lineTo(shape.xa, shape.ya);
    context.fill();
    context.globalAlpha = 1;
  }
  //}

  // only do a resize when we're done a push+draw pass
  if (resized) {
    resized = false;
    clearInterval(drawInterval);
    context.restore();
    setTimeout(run, 0);
  }
};

// awful way to keep the state constant across resize events -- make it global!
let canvas = null;
let context = null;
let drawInterval = null;
let palette = null;
let xa = 10;
let ya = 10;
let xb = 10;
let yb = 10;
let xc = 10;
let yc = 10;
const points = [];
const lines = [];
const shapes = [];
let drawShapes = false;
let drawLines = false;
let i = 0;
let resized = false;
const MINE = 1;
const MINSKY = 2;
const SCRATCH = 3;
let mode = randomChoiceDist({ MINE: 0.3, MINSKY: 0.7, SCRATCH: 0 });

const initAudioAndControls = () => {
  const div = document.createElement("div");
  div.innerHTML = "&gt; audio";
  div.setAttribute("class", "controls");
  let volume = null;
  const mute = () => {
    volume.mute = true;
    div.removeEventListener("click", mute);
    div.addEventListener("click", unmute);
    div.innerHTML = "unmute";
  };

  const unmute = () => {
    volume.mute = false;
    div.removeEventListener("click", unmute);
    div.addEventListener("click", mute);
    div.innerHTML = "mute";
  };

  const setupAudioControls = async () => {
    div.removeEventListener("click", setupAudioControls);
    div.addEventListener("click", mute);
    div.innerHTML = "mute";
    console.log("init tones");
    await Tone.start();
    volume = new Tone.Volume(-20).toMaster();
    // synth setup taken from https://github.com/mezoistvan/discreetmusic
    // and originally from https://teropa.info/blog/2016/07/28/javascript-systems-music.html
    let envelope = {
      attack: 0.1,
      release: 3,
      releaseCurve: "linear",
    };
    let filterEnvelope = {
      baseFrequency: 200,
      octaves: 2,
      attack: 0,
      decay: 0,
      release: 800,
    };
    const synth = new Tone.PolySynth(4, Tone.DuoSynth, {
      harmonicity: 2,
      volume: -25,
      voice0: {
        oscillator: { type: "triangle8" },
        envelope,
        filterEnvelope,
      },
      voice1: {
        oscillator: { type: "sine" },
        envelope,
        filterEnvelope,
      },
      vibratoRate: 0.5,
      vibratoAmount: 0.1,
    });
    synth.connect(volume);
    const length = "32n";
    const notes = [
      // D4:
      // DFAD
      [["D4"], length],
      [["F4"], length],
      [["A4"], length],
      [["D5"], length],
      [["A4"], length],
      [["F4"], length],

      [["D4"], length],
      [["F4"], length],
      [["A4"], length],
      [["D5"], length],
      [["A4"], length],
      [["F4"], length],

      // DGBD
      [["D4"], length],
      [["G4"], length],
      [["B4"], length],
      [["D5"], length],
      [["B4"], length],
      [["G4"], length],

      [["D4"], length],
      [["G4"], length],
      [["B4"], length],
      [["D5"], length],
      [["B4"], length],
      [["G4"], length],

      // DACE
      [["D4"], length],
      [["A4"], length],
      [["C5"], length],
      [["E5"], length],
      [["C5"], length],
      [["A4"], length],

      [["D4"], length],
      [["A4"], length],
      [["C5"], length],
      [["E5"], length],
      [["C5"], length],
      [["A4"], length],

      // DGBD
      [["D4"], length],
      [["G4"], length],
      [["B4"], length],
      [["D5"], length],
      [["B4"], length],
      [["G4"], length],

      [["D4"], length],
      [["G4"], length],
      [["B4"], length],
      [["D5"], length],
      [["B4"], length],
      [["G4"], length],
    ];
    let index = 0;
    const playNotes = () => {
      const notesToPlay = notes[index % notes.length][0];
      // add some occasional random harmony:
      if (index % 8 === 0) {
        notesToPlay.push(randomChoice(["D3", "A3", "B3", "G3"]));
      }
      synth.triggerAttackRelease(notesToPlay, notes[index % notes.length][1]);
      index += 1;
    };
    setInterval(playNotes, 350);
  };
  div.addEventListener("click", setupAudioControls);
  document.body.appendChild(div);
};

window.onload = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  context.lineWidth = 0.5;
  palette = randomChoice(palettes);
  console.log("palette:", palette);
  run();
  initAudioAndControls();
};

window.onresize = () => {
  resized = true;
};

const run = () => {
  canvas.height = Math.max(window.innerHeight, window.innerWidth) * 1.2;
  canvas.width = Math.max(window.innerHeight, window.innerWidth) * 1.2;
  context.save();
  context.translate(window.innerWidth / 2, window.innerHeight / 2);
  drawInterval = setInterval(draw, 50);
};
