// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const sass         = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss     = require('gulp-clean-css');
const imagemin     = require('gulp-imagemin');
const del          = require('del');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'dist/' },
    notify: false,
    online: true,
  });
};

async function clean() {
  return await del('dist/', { force: true })
    .then(res => {
      // https://simplernerd.com/js-console-colors/
      console.log("\x1b[38;2;0;128;0m%s\x1b[0m", "Successfully cleaned directory " + res)
    });
}

function buildJs() {
  return src('src/js/**/*.js')
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
};

function buildStyles() {
  return src(['src/sass/**/*.sass'])
    .pipe(sass()) // Compile to .css
    .pipe(concat('app.min.css')) // Merge files
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'], // Add prefixes for last 10 versions of browsers
      grid: true //  // Add grid selector prefixes for IE
    }))
    .pipe(cleancss({
      level: {
        1: { // Minify
          specialComments: 0 // Remove comments
        }
      }/* , format: 'beautify' */ // Beautify
    }))
    .pipe(dest('dist/css/')) // Put to destination directory
    .pipe(browserSync.stream()) // Reload styles in browser
};

function buildHtml() {
  return src('src/html/**/*.html')
    .pipe(dest('dist/html/'))
    .pipe(browserSync.stream())
};

function buildImages() {
  return src('src/images/**/*')
    .pipe(imagemin())
    .pipe(dest('dist/images/'))
};

function startWatch() {
  watch('src/js/**/*.js', buildJs);
  watch('src/sass/**/*.sass', buildStyles);
  watch('src/html/**/*.html', buildHtml);
  watch('src/images/**/*', buildImages);
};

exports.browsersync = browsersync;
exports.buildJs     = buildJs;
exports.buildStyles = buildStyles;
exports.buildHtml   = buildHtml;
exports.buildImages = buildImages;
exports.clean       = clean;

exports.default = series(
  clean,
  buildStyles,
  buildJs,
  buildHtml,
  buildImages,
  browsersync,
  startWatch
);
