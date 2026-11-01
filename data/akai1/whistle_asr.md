# AKAI1/whistle_ASR

## Resumen

Whistle ASR es un modelo de reconocimiento automatico del habla (ASR) disenado para ejecucion en dispositivo (on-device) en moviles, wearables, robots, domotica, automocion y microcontroladores. Lo desarrolla AKAI1 y se distribuye bajo licencia Apache 2.0. Su propuesta central es el tamano: todo el modelo cabe en un unico fichero `.cact` de 16,9 MB, se ejecuta en CPU sin GPU y sin dependencias externas, reutilizando el motor C++ y el contenedor de Cactus Needle.

Tecnicamente combina un front end log-mel con un stem convolucional que alimenta un encoder de audio, leido por un decoder de tipo Needle mediante cross attention con compuertas en cada capa. Soporta siete idiomas (ingles, aleman, frances, espanol, italiano, neerlandes y polaco) con deteccion automatica del idioma, y anade tres funciones sobre la transcripcion: marcas temporales por palabra con probabilidad, embeddings de voz a partir de la salida del encoder (una fila cada 80 ms) y sesgo por palabras clave para favorecer nombres propios y jerga.

Su relevancia actual esta en la categoria de ASR de borde: compite con Whisper y Moonshine en precision publicada sobre benchmarks estandar, pero con un peso dos ordenes de magnitud menor y un motor que ya soporta modelos de lenguaje Needle en el mismo binario, lo que permite encadenar transcripcion y tool calling en una sola llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front end log-mel + stem convolucional + encoder de audio + decoder tipo Needle con cross attention con compuertas por capa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de cualquier duracion; una pasada hasta 30 s y ventaneo por encima; streaming continuo |
| Tipos de cuantizacion | Cactus Quants, 2 a 4 bits |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (contenedor propio de Cactus Needle), fichero unico de 16,9 MB |

## Arquitectura y entrenamiento

Whistle es un modelo encoder-decoder para voz. La entrada pasa por un front end log-mel de 16 kHz mono y un stem convolucional que alimenta el encoder de audio; el decoder, con la forma de Needle, lee la representacion del encoder mediante cross attention con compuertas en todas sus capas. Reutiliza la infraestructura de Needle: contenedor `.cact`, cuantizacion Cactus Quants, kernels SIMD y cache KV. El decoder es escalonable: cada profundidad desde 2 capas en adelante es un modelo desplegable, seleccionable en tiempo de carga con `--audio-depth`.

El modelo se distribuye cuantizado entre 2 y 4 bits y se ejecuta en CPU. La model card no detalla el numero de parametros, el volumen de tokens de entrenamiento ni la composicion del dataset, y tampoco indica si hubo RLHF o DPO; esos datos figuran como no disponibles. Si se declara una validacion de contaminacion: ningun audio de test aparece en entrenamiento ni validacion, verificado comparando checksums de audio e identificadores de hablante en todos los conjuntos de test reportados.

## Capacidades

- Transcripcion de voz a texto en siete idiomas con deteccion automatica del idioma o forzado mediante parametro (`language="de"`).
- Audio de cualquier duracion: una pasada hasta 30 segundos y procesamiento por ventanas mas alla.
- Streaming en vivo con confirmacion por consenso entre dos pasadas de las palabras coincidentes.
- Marcas temporales por palabra con inicio, fin y probabilidad, alineadas desde la atencion del propio decoder.
- Embeddings de voz: salida del encoder con una fila cada 80 ms, para busqueda y matching sin decodificar transcripcion.
- Sesgo por palabras clave (`keywords=[...]`) para favorecer nombres propios, toponimos, marcas y jerga.
- Deteccion de silencio y ruido estacionario: devuelve transcripcion vacia en lugar de texto inventado.
- Integracion con modelos de lenguaje Needle en el mismo binario: transcripcion y tool calling en una sola llamada con salida JSON unificada.

## Casos de uso

- Subtitulado y transcripcion en movil sin conexion: el modelo de 16,9 MB se ejecuta en CPU dentro de la app, con marcas temporales por palabra para resaltar el texto sincronizado con el audio.
- Asistentes de voz en wearables y microcontroladores: al caber en un fichero unico y no requerir GPU ni dependencias, se despliega en dispositivos con memoria y computo muy limitados, con deteccion de silencio que evita transcripciones fantasma.
- Domotica y automocion: comandos de voz en siete idiomas con sesgo de palabras clave para nombres de dispositivos, habitaciones y contactos, y streaming continuo para microfonos siempre activos (con VAD o wake word por delante).
- Busqueda y recuperacion sobre audio: los embeddings del encoder (una fila cada 80 ms) permiten indexar y recuperar fragmentos de audio sin transcribirlos, util para archivos de reuniones o llamadas.
- Pipelines de agentes por voz: combinando `whistle.cact` con `needle3.cact` en el mismo motor, una sola llamada transcribe el audio, ejecuta tool calling sobre la transcripcion y devuelve un JSON con los campos de voz prefijados `audio_`.
- Edicion de audio y video asistida: las marcas temporales con probabilidad permiten cortar, buscar y navegar por palabra en herramientas de edicion o en reproductores.
- Notas de reunion y dictado multilingue: deteccion automatica de idioma entre las siete lenguas soportadas, con ventaneo para grabaciones largas.

## Benchmarks y rendimiento

La model card reporta WER sobre las particiones de test completas, con los normalizadores de Whisper, y compara con Whisper (checkpoint multilingue, fp32 en CPU) y Moonshine (int8). Whistle se midio sobre 86.174 enunciados. Las cifras concretas de WER no estan incluidas en la informacion proporcionada (solo se referencian en las figuras `assets/whistle-benchmarks.svg`), por lo que no se reproducen aqui.

| Aspecto | Whistle | Whisper | Moonshine |
|---|---|---|---|
| Precision evaluada | 2 a 4 bits | fp32 en CPU | int8 |
| Runtime | motor C++ propio, 5 beams | `openai-whisper` | `moonshine-voice` sin streaming |
| Idiomas | 7 | multilingue | solo ingles |
| Conjuntos reportados | AMI, TED-LIUM, FLEURS, MLS, SPGISpeech, Earnings-22, entre otros | subconjunto publicado | subconjunto publicado |
| Benchmark no publicado | no aplica | SPGISpeech, Earnings-22, AMI cleaned | benchmarks no ingleses |

Datos de velocidad declarados: 10 segundos de audio en un Apple M4 Pro, cada modelo en su runtime oficial y con sus valores por defecto; se mide tiempo hasta el primer token y velocidad de decodificacion en tokens por segundo descontando el encoder. Las cifras numericas no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- Inferencia en CPU; no requiere GPU. El modelo completo ocupa 16,9 MB en disco.
- VRAM: no aplica; el consumo es de RAM del sistema, no disponible con precision en la model card.
- Cabe en moviles, wearables, robots, domotica, automocion y microcontroladores, segun el autor.
- GPUs recomendadas: no aplica (motor CPU con kernels SIMD).
- Despliegue: paquete `pip install cactus-needle` (extra `[mic]` para captura de microfono y sample rates distintos de 16 kHz), CLI `needle` con binarios por plataforma (`needle download macos-arm64`, `needle download whistle`), y biblioteca estatica `libneedle.a` con cabecera `needle.h` en cada carpeta de plataforma del repositorio Cactus-Compute/needle3.
- Latencia y throughput: la model card cita mediciones en Apple M4 Pro con 5 beams, pero las cifras concretas no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Whistle ASR | no disponible (fichero de 16,9 MB) | cualquier duracion; pasada de 30 s y ventaneo | 7 | Apache 2.0 | `.cact`, motor CPU C++ |
| Whisper (multilingue) | no disponible en la informacion | ventanas de 30 s | multilingue | MIT (OpenAI) | PyTorch, requiere runtime Python |
| Moonshine | no disponible en la informacion | audio completo, sin streaming | solo ingles | MIT | runtime `moonshine-voice`, int8 |

Whistle se posiciona por debajo de ambos en peso y por encima en cobertura multilingue frente a Moonshine, con la ventaja de ejecucion en CPU sin dependencias y de compartir motor con modelos de lenguaje Needle. La comparacion de precision queda pendiente de las cifras de WER, no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Ruido y musica: el modelo devuelve transcripcion vacia ante silencio y ruido estacionario, pero otros sonidos, especialmente musica, pueden transcribirse como texto; el autor recomienda anteponer un detector de actividad de voz o una wake word en microfonos siempre activos.
- Cobertura linguistica limitada a siete idiomas europeos; no hay soporte declarado para otras lenguas.
- No se detallan sesgos conocidos, volumen de entrenamiento ni composicion del dataset, lo que dificulta evaluar el comportamiento en dominios o acentos poco representados.
- Riesgo de alucinacion mitigado parcialmente (silencio y ruido devuelven vacio), pero no eliminado en audio con musica o ruido no estacionario.
- El decoder escalonado (`--audio-depth`) permite reducir capas en el dispositivo, lo que previsiblemente degrada la precision; no se publican curvas de WER por profundidad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del motor y de los binarios por plataforma del repositorio Cactus-Compute/needle3.
- Dependencia del ecosistema Cactus Needle: el contenedor `.cact` y el motor no son formatos estandar (no hay GGUF ni safetensors), lo que limita la portabilidad a otros runtimes.
- Repositorio con muy poca traccion (26 descargas, 0 likes) y creado y actualizado en la misma fecha: no hay historial de mantenimiento ni comunidad que valide el modelo de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AKAI1/whistle_ASR
- Motor y carpetas de plataforma (Cactus-Compute/needle3): https://huggingface.co/Cactus-Compute/needle3
- Repositorio y paquete Python: https://github.com/cactus-compute/needle
