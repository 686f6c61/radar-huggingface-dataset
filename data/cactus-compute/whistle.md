# Cactus-Compute/whistle

## Resumen

Whistle es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Cactus-Compute y disenado especificamente para ejecucion en dispositivo (on-device). Su peso completo se distribuye en un unico fichero de 16,9 MB en formato `.cact`, y se ejecuta sobre el mismo motor de CPU que el modelo Needle del mismo autor, sin dependencias externas y sin necesidad de GPU. El modelo cubre tres funciones: transcripcion de audio mono a 16 kHz de hasta 30 segundos en una sola pasada, marcas temporales por palabra (inicio, fin y probabilidad) y generacion de embeddings de habla (una fila por fotograma de 80 ms) para tareas de emparejamiento y recuperacion sin necesidad de decodificar texto.

Arquitecturalmente se trata de un esquema encoder-decoder: un front-end log-mel y un tallo convolucional alimentan un encoder de audio, que es leido por un decoder con forma de Needle mediante atencion cruzada con compuertas (gated cross attention) en cada capa. El modelo reutiliza el contenedor `.cact`, la cuantizacion Cactus Quants, los kernels SIMD y la cache KV de Needle, de modo que un dispositivo que ya ejecuta Needle puede ejecutar Whistle en el mismo binario. El decoder esta escalonado: cualquier profundidad a partir de 2 capas es un modelo desplegable, seleccionable en tiempo de carga.

Su relevancia actual radica en el nicho al que apunta: moviles, wearables, robots, domotica, automocion y microcontroladores, con soporte de siete idiomas (ingles, aleman, frances, espanol, italiano, neerlandes y polaco), deteccion automatica de idioma, sesgo por palabras clave y una API en C reducida. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con front-end log-mel, tallo convolucional y atencion cruzada con compuertas en cada capa; decoder con forma de Needle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; admite hasta 30 segundos de audio mono a 16 kHz en una sola pasada |
| Tipos de cuantizacion | 2 a 4 bits (Cactus Quants) |
| Idiomas soportados | en, de, fr, es, it, nl, pl (7 idiomas), con deteccion automatica |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (un unico fichero de 16,9 MB) |

## Arquitectura y entrenamiento

Whistle emplea un pipeline clasico de ASR adaptado a edge: una etapa de extraccion de caracteristicas log-mel seguida de un tallo convolucional que alimenta un encoder de audio. El decoder, descrito como "con forma de Needle", accede a la representacion del encoder mediante atencion cruzada con compuertas en todas sus capas. El modelo reutiliza la infraestructura de inferencia de Needle (contenedor `.cact`, Cactus Quants, kernels SIMD y cache KV), lo que permite compartir runtime entre ambos modelos. Una particularidad de diseno es el escalonado del decoder: cualquier profundidad desde 2 capas en adelante constituye un modelo desplegable, y la profundidad se elige en tiempo de carga mediante el parametro `--audio-depth`.

En cuanto a los datos de entrenamiento, la informacion proporcionada indica que no aparece audio de test en los conjuntos de entrenamiento ni de validacion del modelo, verificado mediante la comparacion de sumas de comprobacion (checksums) de audio e identificadores de hablante en todos los conjuntos de test reportados. El modelo se midio sobre 86.174 enunciados. No se especifican en la informacion disponible el numero total de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Transcripcion de audio mono a 16 kHz de hasta 30 segundos en una sola pasada, en ingles, aleman, frances, espanol, italiano, neerlandes y polaco.
- Deteccion automatica del idioma cuando no se especifica; tambien permite forzarlo (por ejemplo, `language="de"`).
- Gestion del silencio: devuelve una transcripcion vacia en lugar de inventar una frase.
- Marcas temporales por palabra, con inicio, fin y probabilidad, alineadas a partir de la propia atencion del decoder, lo que habilita resaltado, busqueda y corte por palabra.
- Embeddings de habla: salida del encoder, una fila por fotograma de 80 ms, para emparejamiento y recuperacion sin decodificar la transcripcion.
- Sesgo por palabras clave (keyword biasing) para favorecer nombres, lugares y terminos de producto concretos durante la busqueda.
- Ejecucion combinada con Needle: un mismo binario puede transcribir y responder texto, con salida JSON unica que incluye llamadas a herramientas y campos de habla (prefijados con `audio_`).
- Interfaz de linea de comandos, API en Python, API en C y despliegue por carpetas de plataforma con soporte de WebAssembly.
- No se mencionan capacidades de vision, audio generativo ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Transcripcion en moviles y wearables: el modelo ocupa 16,9 MB y se ejecuta en CPU, por lo que puede integrarse en aplicaciones iOS o Android sin depender de la nube ni de conectividad, transcribiendo clips de hasta 30 segundos directamente en el dispositivo.
- Subtitulado y edicion de audio con marcas temporales: las marcas por palabra permiten construir interfaces que resalten la palabra en curso, salten a un fragmento concreto o generen cortes precisos en herramientas de edicion.
- Domotica y asistentes de voz locales: la transcripcion del clip puede encadenarse con llamadas a herramientas en la misma invocacion (`--tools tools.json --audio clip.wav`), de modo que "apaga las luces de la cocina" se resuelve como una llamada a herramienta sin salir del dispositivo.
- Automocion y manos libres: al ejecutarse en CPU y admitir siete idiomas con deteccion automatica, es adecuado para comandos de voz en vehiculo donde la latencia y la ausencia de red son criticas.
- Robots y dispositivos con microcontrolador: el tamano reducido y la ausencia de dependencias y de GPU permiten desplegarlo en hardware embebido con recursos limitados.
- Busqueda y recuperacion por similitud de voz: los embeddings del encoder (una fila cada 80 ms) permiten indexar audio y recuperar fragmentos similares sin transcribir primero.
- Extraccion de entidades y terminos en dominios concretos: con keyword biasing se pueden priorizar nombres propios, toponimos o referencias de producto que de otro modo el modelo podria confundir.
- Aplicaciones web en el navegador: la etiqueta de WebAssembly sugiere despliegue en cliente sin backend, util para demos y herramientas de accesibilidad.

## Benchmarks y rendimiento

La model card presenta resultados de tasa de error por palabra (WER) sobre las particiones de test completas, puntuadas con los normalizadores de Whisper, comparando Whistle con Whisper y Moonshine. Los valores numericos se muestran unicamente en una grafica (`assets/whistle-benchmarks.svg`) y no estan disponibles en forma de texto en la informacion proporcionada. Los datos metodologicos si estan disponibles:

| Aspecto | Detalle |
|---|---|
| Modelos comparados | Whistle, Whisper (checkpoint multilingue, no `base.en`), Moonshine |
| Conjuntos de evaluacion | SPGISpeech, Earnings-22, AMI (incluye referencias vacias, convencion del Open ASR Leaderboard; la cifra de Whisper es AMI-IHM), TED-LIUM (excluye las regiones `ignore_time_segment_in_scoring`), FLEURS y MLS |
| Agregacion multilingue | FLEURS y MLS promediados sobre los siete idiomas de Whistle (MLS sobre seis, sin ingles), el mismo conjunto para todos los modelos |
| Volumen evaluado | 86.174 enunciados para Whistle |
| Precision durante la evaluacion | Whistle de 2 a 4 bits; Whisper fp32 en memoria sobre CPU; Moonshine int8 |
| Velocidad | 10 segundos de audio en un Apple M4 Pro; Whistle en su motor C++ a 5 beams, `openai-whisper` y `moonshine-voice` no streaming; se mide tiempo hasta el primer token y tokens por segundo de decodificacion |
| Integridad del test | Sin audio de test en entrenamiento ni validacion, verificado por checksums de audio e identificadores de hablante |
| Datos ausentes | Una barra ausente indica que los autores de ese modelo nunca publicaron ese benchmark; Moonshine solo soporta ingles; Whisper no reporta SPGISpeech, Earnings-22 ni AMI cleaned |

## Requisitos de hardware

- Peso del modelo: 16,9 MB en un unico fichero `.cact`, con cuantizacion de 2 a 4 bits.
- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- Memoria del sistema: no se especifica una cifra exacta en la informacion disponible, pero el tamano de pesos y la ausencia de GPU apuntan a un consumo muy reducido, compatible con dispositivos embebidos.
- GPU recomendadas: ninguna; no hay soporte de GPU descrito.
- GPU de consumo: no aplica, ya que el motor es de CPU.
- Plataformas objetivo: moviles, wearables, robots, domotica, automocion y microcontroladores. Se menciona explicitamente una carpeta de plataforma `macos-arm64` y soporte WebAssembly.
- Opciones de despliegue: paquete `cactus-needle` via pip, CLI `needle`, carpetas de plataforma con binario `needle`, `libneedle.a` y `needle.h`, y API en C (`needle_load`, `needle_transcribe`, `needle_embed`, `needle_complete`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se midio velocidad con 10 segundos de audio en un Apple M4 Pro, con tiempo hasta el primer token y tokens por segundo, pero los valores concretos solo aparecen en la grafica y no estan disponibles en texto.
- Descarga de artefactos: `needle download macos-arm64` y `needle download whistle`; el motor y los pesos se descargan una vez y quedan en cache.

## Comparativa con modelos similares

| Caracteristica | Whistle | Whisper | Moonshine |
|---|---|---|---|
| Desarrollador | Cactus-Compute | OpenAI | Useful Sensors |
| Parametros | no disponible | no disponible | no disponible |
| Idiomas | 7 (en, de, fr, es, it, nl, pl) | multilingue (checkpoint multilingue evaluado) | solo ingles |
| Ejecucion | CPU, on-device, sin GPU ni dependencias | CPU/GPU; en la comparativa fp32 en memoria sobre CPU | CPU; en la comparativa int8 |
| Marcas temporales por palabra | Si, con probabilidad | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Embeddings de habla | Si (encoder, una fila por 80 ms) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Sesgo por palabras clave | Si | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Soporte WebAssembly | Si (etiqueta webassembly) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Benchmarks publicados | SPGISpeech, Earnings-22, AMI, TED-LIUM, FLEURS, MLS (valores solo en grafica) | Tablas 9, 10 y 13 del paper; sin SPGISpeech, Earnings-22 ni AMI cleaned | Tabla 3 del paper; solo benchmarks en ingles |

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la informacion proporcionada; al tratarse de un modelo de siete idiomas, es razonable esperar un rendimiento desigual entre ellos, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinacion mitigado parcialmente: la model card afirma que el silencio devuelve una transcripcion vacia en lugar de una frase inventada, pero no se aportan tasas de alucinacion sobre audio con ruido.
- Limite de duracion: la transcripcion cubre hasta 30 segundos de audio en una sola pasada; no se describe comportamiento para audios mas largos ni estrategia de segmentacion.
- Cobertura limitada a 7 idiomas; no se mencionan otros como portugues, arabe, ruso o chino.
- El modelo no procesa audio estereo ni otras frecuencias de muestreo en la instalacion base: se requiere 16 kHz mono, y el resto de casos exige el extra `[mic]`.
- No se especifican los terminos exactos de uso comercial mas alla de la licencia Apache 2.0, ni si existen restricciones adicionales sobre los datos de entrenamiento.
- Los numeros concretos de WER y de velocidad no estan disponibles en texto, solo en graficas, lo que dificulta su verificacion sin abrir los SVG.
- El repositorio tiene un volumen de descargas bajo (70 en el momento de la consulta), por lo que la validacion por parte de la comunidad es limitada.
- La fecha de creacion registrada (30 de septiembre de 2026) es posterior a la fecha actual, un dato anomalo que conviene verificar en el repositorio.
- Dependencia del ecosistema Cactus-Needle: el motor, los kernels y el contenedor son especificos del autor, lo que limita la portabilidad a otros runtimes habituales de ASR.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Cactus-Compute/whistle
- Motor y carpetas de plataforma (Needle): https://huggingface.co/Cactus-Compute/needle3
- Repositorio de codigo fuente: https://github.com/cactus-compute/needle
- Paquete Python: `pip install cactus-needle`
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web proporcionados (los resultados devueltos corresponden a contenido no relacionado sobre plantas cactus).
