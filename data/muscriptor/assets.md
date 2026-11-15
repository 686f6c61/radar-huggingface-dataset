# MuScriptor/assets

## Resumen

MuScriptor/assets no es un modelo de lenguaje, sino un repositorio de artefactos auxiliares publicado por el proyecto MuScriptor. Contiene una copia de los soundfonts de MuseScore (en concreto `MS_General.sf2`, un fork de FluidR3Mono_GM.sf2) y una copia del checkpoint `final0` del modelo de deteccion de pulso y compas Beat This! desarrollado por el Institute of Computational Perception de la JKU Linz. El objetivo declarado es que MuScriptor no dependa de hosts externos que puedan dejar de estar disponibles.

El interes tecnico del repositorio esta en su contenido, no en una arquitectura de lenguaje: por un lado, un banco de samples SoundFont en formato SF2 para sintesis musical General MIDI; por otro, un checkpoint de un modelo neuronal de analisis ritmico (beat and downbeat tracking) que MuScriptor emplea para deteccion de tempo. Ambos artefactos estan bajo licencia MIT, aunque con la salvedad de que la licencia de la coleccion de soundfonts "esta en discusion y podria cambiar antes del lanzamiento" segun la propia model card.

El repositorio ocupa 0,3 GB, tiene 3 likes y 0 descargas en el momento de la consulta, y no declara pipeline ni idiomas. No debe confundirse con un modelo generativo: es un contenedor de dependencias binarias para el ecosistema MuScriptor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de artefactos; incluye un checkpoint de red neuronal para beat tracking y un banco SoundFont SF2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (con aviso de posible cambio en la coleccion de soundfonts) |
| Formato de pesos | `.sf2` (SoundFont) y `.ckpt` (checkpoint PyTorch) |

## Arquitectura y entrenamiento

El repositorio agrupa dos componentes de naturaleza muy distinta. El primero es `MS_General.sf2`, un SoundFont en formato SF2 derivado de FluidR3Mono_GM.sf2 (original de Frank Wen, conversion mono de Michael Cowgill, adaptacion de S. Christian Collins en 2018). Se trata de un banco de samples con instrumentos General MIDI, no de un modelo entrenado; su "entrenamiento" corresponde a la grabacion, edicion y programacion de samples por parte de los autores originales y colaboradores citados en el README (Ethan Winer para temple blocks, Michael Schorsch para percusion de drumline, entre otros).

El segundo componente es `beat_this-final0.ckpt`, el checkpoint "final0" de Beat This!, el sistema de beat and downbeat tracking del CPJKU (JKU Linz) que MuScriptor usa para deteccion de tempo. La model card no detalla la arquitectura interna de esa red ni sus datos de entrenamiento, solo referencia el repositorio de GitHub del proyecto y el host original de distribucion. Se incluye el SHA-256 del checkpoint (`8c328b45f59d8dd3dff219253ff6a8d6482be57d0133a29140e2febbf8eb8331`) para verificacion de integridad.

## Capacidades

- Distribucion de soundfonts SF2 compatibles con sintetizadores General MIDI para reproduccion de partituras.
- Suministro del checkpoint de beat and downbeat tracking de Beat This! para deteccion de tempo y estructura ritmica en audio musical.
- Verificacion de integridad del checkpoint mediante hash SHA-256 publicado.
- Eliminacion de dependencias de hosts externos (cloud.cp.jku.at) para el funcionamiento de MuScriptor.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.
- No declara soporte multilingue ni modo thinking.

## Casos de uso

- Reproduccion de partituras en aplicaciones musicales: integracion de `MS_General.sf2` en un sintetizador SF2 para renderizar notacion musical a audio con instrumentos General MIDI.
- Analisis ritmico en pipelines de transcripcion: uso del checkpoint `final0` de Beat This! para obtener pulsos y compases de una pista de audio antes de alinear transcripciones o partituras.
- Despliegue offline de MuScriptor: el mirror permite clonar el repositorio y ejecutar el sistema sin acceso a cloud.cp.jku.at, util en entornos con red restringida o air-gapped.
- Verificacion de integridad en CI: comprobar el SHA-256 del checkpoint durante el build para garantizar que no se ha alterado el artefacto descargado.
- Empaquetado de dependencias en contenedores: incluir el SF2 y el `.ckpt` en una imagen Docker para reproducibilidad de resultados musicales.
- Prototipado de herramientas de educacion musical: sintesis de ejercicios con soundfonts y deteccion automatica de tempo para feedback ritmico al estudiante.
- Archivado a largo plazo: conservar copias de artefactos musicales cuya fuente original puede desaparecer, con trazabilidad de licencias y autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el checkpoint de Beat This!; el SF2 es un banco de samples que se carga en RAM o se sintetiza en CPU, no requiere GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: sintetizadores SF2 (FluidSynth, TiMidity++) para el soundfont; PyTorch para cargar el checkpoint `.ckpt` de Beat This!.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Licencia | Formato | Uso |
|---|---|---|---|---|
| MuScriptor/assets | SoundFont MS_General.sf2 + checkpoint Beat This! final0 | MIT | `.sf2`, `.ckpt` | Dependencias de MuScriptor |
| FluidR3Mono_GM.sf2 (original) | SoundFont General MIDI mono | MIT | `.sf2` | Sintesis MIDI |
| Beat This! (CPJKU, repo oficial) | Checkpoint de beat tracking | MIT | `.ckpt` | Analisis ritmico |
| MuseScore soundfonts | Bancos SF2 oficiales | Varía | `.sf2` | Reproduccion en MuseScore |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal.
- La licencia de la coleccion de soundfonts esta "en discusion y podria cambiar antes del lanzamiento" segun la model card, lo que introduce incertidumbre para uso comercial pese a la etiqueta MIT actual.
- Las obras derivadas deben incluir los avisos de copyright y agradecimientos de FluidR3, FluidR3Mono y MS_General.sf2.
- `MS_General.sf2` se declara como "alpha work-in-progress" (version 0.1 alpha, 1 de marzo de 2018); puede contener samples incompletos o sin reprogramar.
- El checkpoint de Beat This! se distribuye "tal cual" sin garantias (MIT), y su rendimiento depende del modelo original del CPJKU, no de MuScriptor.
- El repositorio no declara pipeline, idiomas ni parametros; cualquier metrica de rendimiento debe consultarse en la documentacion de Beat This! o de FluidR3.
- El tamano del repo (0,3 GB) puede ser elevado para clonados frecuentes en CI; conviene cachear o usar descargas parciales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MuScriptor/assets
- Documentacion de soundfonts de MuseScore: https://musescore.org/fr/manuel/soundfonts-et-fichiers-sfz
- Beat This! (repositorio oficial): https://github.com/CPJKU/beat_this
- Host original del checkpoint final0: https://cloud.cp.jku.at/public.php/dav/files/7ik4RrBKTS273gp/final0.ckpt
