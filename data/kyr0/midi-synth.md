# kyr0/midi-synth

## Resumen

`kyr0/midi-synth` no es un modelo de IA en el sentido habitual, sino un repositorio de recursos de sintesis musical: bancos de sonidos SoundFont (`.sf2`) y bancos de instrumentos FM para sintesis OPL2/OPL3, empaquetados para su uso con la libreria [defuss-midi-synth](https://github.com/kyr0/defuss-midi-synth), un sintetizador General MIDI para navegador y renderizado offline. Lo publica el desarrollador kyr0 en Hugging Face y ocupa 0,3 GB.

El repositorio resuelve un problema de distribucion: ofrece los bancos de sonido necesarios para reproducir musica MIDI con calidad razonable directamente desde el Hub, con copias comprimidas en Brotli (`.br`) que la propia libreria descomprime en tiempo de carga, y con CORS habilitado para su descarga desde el navegador. Incluye tres conjuntos principales: TimGM6mb 1.3 (SoundFont GM con 128 programas y 8 kits de bateria), OPL-3 FM 128M (SoundFont muestreado de un chip OPL3) y la coleccion de bancos FM de libADLMIDI en formatos WOPL, IBK, BNK, TMB, OP2 y otros.

Es relevante para desarrolladores de aplicaciones web de audio, emuladores, trackers o reproductores MIDI que necesiten un conjunto de instrumentos listo para usar sin empaquetar cientos de megabytes en su propio repositorio, y que quieran elegir entre sintesis por muestras (SoundFont) y sintesis FM (OPL2/OPL3). No hay pesos de red neuronal, arquitectura de transformer ni parametros entrenados: las filas de especificaciones habituales se marcan como no disponibles o se reinterpretan en terminos de contenido de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: repositorio de bancos de sonido (SoundFont `.sf2` y bancos FM OPL2/OPL3 en WOPL, IBK, BNK, TMB, OP2 y otros) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable; los ficheros se distribuyen en formato original y en copia comprimida con Brotli (`.br`) |
| Idiomas soportados | No aplicable (contenido de audio; los nombres de programa siguen el estandar General MIDI) |
| Licencia | Mixta: cada conjunto conserva su propia licencia (TimGM6mb bajo GPL-2.0; OPL-3 FM 128M bajo CC BY-SA 4.0; bancos FM con licencias por banco o terminos no claros). El codigo de defuss-midi-synth es MIT, pero ningun fichero del repositorio cae bajo esa licencia |
| Formato de pesos | `.sf2` (SoundFont), `.wopl` (binario WOPL3-BANK), `.woplx` (texto de libADLMIDI), IBK, BNK, TMB, OP2 y otros; copias `.br` comprimidas con Brotli |
| Tamano del repositorio | 0,3 GB |
| Contenido principal | TimGM6mb 1.3 (5.969.788 bytes, SHA-256 `c5378b62…`), OPL-3 FM 128M (135.020.964 bytes, SHA-256 `39bff96e…`) y la coleccion de bancos FM de libADLMIDI (rama master a fecha 2026-11-24) |
| Pipeline (Hugging Face) | No disponible |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El contenido se organiza en tres bloques. El primero, `soundfonts/TimGM6mb/`, contiene TimGM6mb 1.3, un SoundFont General MIDI con los 128 programas y 8 kits de bateria, procedente del paquete Debian `timgm6mb-soundfont_1.3.orig.tar.gz`, con autores Tim Brechbill (2004) y David Bolton (2010). El segundo, `soundfonts/OPL-3_FM_128M/`, contiene OPL-3 FM 128M, un SoundFont muestreado de un chip OPL3, obra de Zandro Reveille (2009), que alimenta el motor "SoundBlaster 16" de la pagina de demostracion.

El tercer bloque, `fm_banks/` y `fm_banks_new/`, replica la coleccion de bancos de instrumentos de [libADLMIDI](https://github.com/Wohlstand/libADLMIDI) tal como estaba en su rama master el 2026-11-24, con bancos extraidos de juegos y controladores de sonido de DOS y Windows. La innovacion tecnica del paquete es de distribucion mas que de sintesis: cada conjunto se ofrece en formato plano y como copia `.br`, y defuss-midi-synth carga cualquiera de las dos y descomprime el `.br` por si misma. La libreria acepta bancos binarios WOPL (`WOPL3-BANK`) mediante `loadFmBank`, pero rechaza los ficheros `.woplx` de `fm_banks_new/`, que usan el formato de texto de libADLMIDI.

## Capacidades

- Reproduccion General MIDI con 128 programas melodicos y 8 kits de bateria mediante TimGM6mb 1.3.
- Sintesis por muestras (SoundFont) y sintesis FM (motores OPL2/OPL3) seleccionables con `useEngine('fm')`.
- Carga de bancos FM binarios WOPL en tiempo de ejecucion mediante `loadFmBank`.
- Renderizado offline con `OfflineSynth` y sintesis en navegador con `MidiSynth`.
- Descarga directa desde el Hub con CORS habilitado y descompresion Brotli integrada.
- Compatibilidad con la coleccion de bancos de libADLMIDI en multiples formatos historicos (IBK, BNK, TMB, OP2 y otros).
- No incluye generacion de texto, razonamiento, codigo, vision ni tool calling: no es un modelo de lenguaje.

## Casos de uso

- Reproductores MIDI en navegador: cargar TimGM6mb desde el Hub con `MidiSynth.create({ soundfont: ... })` evita empaquetar 6 MB de SoundFont en el bundle de la aplicacion y aprovecha la copia `.br` para reducir la transferencia.
- Renderizado offline de pistas: usar `OfflineSynth` para convertir ficheros MIDI a audio en un pipeline de servidor o en el navegador, eligiendo entre SoundFont y FM segun el caracter sonoro deseado.
- Emulacion de audio de PC retro: cargar bancos OPL2/OPL3 de `fm_banks/` y el SoundFont OPL-3 FM 128M para reproducir bandas sonoras de juegos de DOS con el timbre original del chip.
- Aplicaciones de musica educativa: disponer de los 128 programas GM con nombres estandar facilita ejercicios de identificacion de instrumentos y practicas de secuenciacion.
- Prototipado de sintetizadores y trackers: emplear los bancos WOPL como material de prueba para validar cargadores y motores FM propios.
- Demos y paginas de documentacion: enlazar directamente a las URLs del Hub con CORS habilitado para incluir ejemplos de audio funcionales sin alojamiento propio.
- Investigacion sobre sintesis FM historica: comparar el mismo pasaje renderizado con distintos bancos de `fm_banks_new/` para estudiar diferencias de timbre entre drivers de la epoca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplican metricas de modelos de lenguaje (MMLU, HumanEval, GSM8K); los unicos datos objetivos del repositorio son los tamanos y hashes SHA-256 de los SoundFont (5.969.788 bytes para TimGM6mb 1.3 y 135.020.964 bytes para OPL-3 FM 128M).

## Requisitos de hardware

- No requiere GPU: la sintesis se ejecuta en CPU, en el navegador o en Node.js mediante defuss-midi-synth.
- Memoria: el SoundFont OPL-3 FM 128M ocupa unos 135 MB sin comprimir; TimGM6mb, unos 6 MB. Conviene cargar solo el conjunto necesario.
- Almacenamiento: el repositorio completo ocupa 0,3 GB, aunque el uso tipico solo descarga el SoundFont y el banco FM concretos.
- Despliegue: la libreria cliente `defuss-midi-synth` (imports `defuss-midi-synth/offline` y `MidiSynth`); los ficheros se sirven desde el Hub o desde cualquier CDN propio.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del motor de sintesis y del navegador.

## Comparativa con modelos similares

| Alternativa | Tipo | Tamano | Licencia | Notas |
|---|---|---|---|---|
| `kyr0/midi-synth` | SoundFont GM + bancos FM OPL2/OPL3 | 0,3 GB (repo) | Mixta (GPL-2.0, CC BY-SA 4.0, por banco) | Copias Brotli, CORS, integrado con defuss-midi-synth |
| FluidR3 GM / FluidR3_GM | SoundFont GM | Cientos de MB | MIT (habitual en la distribucion de FluidSynth) | Estandar de facto en escritorio; no incluye bancos FM |
| GeneralUser GS | SoundFont GM | ~30 MB | Freeware con condiciones del autor | Buena relacion calidad/tamano para GM |
| Coleccion de bancos de libADLMIDI | Bancos FM OPL2/OPL3 | Variable | Por banco, con zona `greyzone` de terminos no claros | Fuente original de `fm_banks/` y `fm_banks_new/` |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia mixta: TimGM6mb es GPL-2.0, lo que impone obligaciones de copyleft si se redistribuye o se integra en un producto; OPL-3 FM 128M es CC BY-SA 4.0 y exige atribucion y compartir igual.
- `fm_banks_new/greyzone/` contiene bancos recopilados sin permiso explicito de sus autores; sus terminos de uso son inciertos hasta que se conceda licencia. Para distribuciones que excluyan estos ficheros, libADLMIDI ofrece reemplazos en `fm_banks_new/placeholders/`.
- Los derechos del resto de bancos de `fm_banks/` y `fm_banks_new/` permanecen con sus autores y editores; hay que revisar cada `LICENSE-*.txt` y `license.txt`.
- El codigo de defuss-midi-synth es MIT, pero ningun fichero del repositorio hereda esa licencia: no se puede asumir permisividad por usar la libreria.
- `loadFmBank` solo acepta WOPL binario; los `.woplx` de `fm_banks_new/` se rechazan como "not a WOPL file".
- No es un modelo de IA: no genera texto, no razona y no admite prompts; usarlo como sustituto de un LLM es un error de categoria.
- El SoundFont OPL-3 FM 128M es grande (135 MB sin comprimir) y puede penalizar la carga inicial en conexiones lentas si no se usa la copia `.br`.
- No se documentan en la informacion disponible sesgos, tasas de alucinacion ni limitaciones de idioma, porque no aplican a un banco de sonidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kyr0/midi-synth
- Libreria defuss-midi-synth: https://github.com/kyr0/defuss-midi-synth
- Coleccion de bancos de libADLMIDI: https://github.com/Wohlstand/libADLMIDI
- Paquete Debian de TimGM6mb (origen del SoundFont): https://packages.debian.org/timgm6mb-soundfont
