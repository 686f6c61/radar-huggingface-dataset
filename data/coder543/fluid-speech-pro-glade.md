# coder543/fluid-speech-pro-glade

## Resumen

Fluid Speech Pro for Glade es una conversión del modelo de reconocimiento automático del habla (ASR) FluidVoice-Labs/fluid-speech-pro, realizada por el usuario coder543 y empaquetada para el runtime Glade de Apple Core AI. No se trata de un modelo entrenado desde cero, sino de una distribución optimizada del checkpoint original (revisión `46027a3bffc5817ce8f9b29add0a062610134a90`) que conserva la arquitectura FastConformer del upstream y añade el bloque FrameCleaner aprendido. El resultado son dos modos independientes de transcripción —limpio y literal— con el mismo grafo y número de parámetros.

El modelo cuenta con 629.125.766 parámetros primarios, de los cuales 2.117.632 pertenecen a FrameCleaner, y soporta los 25 idiomas del checkpoint original. Su relevancia radica en que permite ejecutar ASR de alta calidad en silicio Apple físico (iPhone, Mac) con latencias muy bajas y throughput elevado gracias a la cuantización W8 del encoder y al uso de Core AI, algo poco habitual en modelos de este tamaño.

La licencia es CC-BY-4.0, heredada del modelo base, y el repositorio ocupa 1,6 GB. Cada uno de los dos modos se distribuye como un directorio completo de 806,4 MB que funciona de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (24 capas, 1.024 canales, 8 cabezas) + predictor LSTM TDT de 2 capas y 640 canales + bloque FrameCleaner residual |
| Parametros totales | 629.125.766 (2.117.632 en FrameCleaner) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 posiciones de encoder; chunks de audio de hasta 30 segundos |
| Tipos de cuantizacion | W8 en proyecciones del encoder; tensores del grafo en FP16 |
| Idiomas soportados | 25: en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Formato propietario de Glade / Core AI (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer de 24 capas con 1.024 canales y 8 cabezas de atención, seguido de un predictor LSTM TDT de dos capas y 640 canales. El modelo incluye un frontend log-mel de 128 bins y un bloque FrameCleaner residual que se aplica tras el subsampling. La decodificación es TDT greedy por defecto, con duraciones de 0 a 4 y un máximo de diez símbolos por frame acústico (resultados beam-1, no los beam-4 del leaderboard del publicador).

El modo limpio incorpora un adaptador LoRA de rango 32 entrenado en el checkpoint original, fusionado en los pesos antes de la exportación; no es un postprocesador de texto ni añade operaciones de inferencia. La cuantización se aplica tras fusionar el adaptador FP32 original de NeMo. Ambos modos comparten topología de grafo, número de operaciones y parámetros primarios, pero tienen cachés de especialización separadas. La atención permanece totalmente bidireccional dentro de cada chunk de cuatro capas, y el modelo se divide en seis assets para el runtime.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en 25 idiomas europeos (inglés, lenguas eslavas, germánicas, románicas, bálticas y ugrofinesas, entre otras).
- Dos modos de transcripción: limpio (elimina muletillas y repeticiones) y literal (palabra por palabra, conservando muletillas).
- Marcas de tiempo nativas a nivel de palabra con paso de frame acústico de 80 ms (no es alineación forzada).
- Procesamiento de audio mono a 16 kHz con chunks contiguos de hasta 30 segundos que preservan todas las muestras, incluido el silencio.
- Dos peticiones de encoder concurrentes y hasta 32 carriles de decodificación en batch.
- No incluye cabecera VAD; el troceado se basa en límites de silencio contiguos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Transcripción de reuniones y notas de voz en dispositivos Apple: el modelo procesa grabaciones completas con RTFx superior a 300× en iPhone 15 Pro Max y más de 440× en M5 Max, lo que permite transcribir horas de audio en segundos en el propio dispositivo.
- Subtitulado y actas con marcas de tiempo: las marcas nativas a nivel de palabra con paso de 80 ms permiten generar subtítulos sincronizados sin necesidad de un alineador externo.
- Limpieza de transcripciones para documentación: el modo limpio elimina muletillas y repeticiones, adecuado para generar actas legibles a partir de audio espontáneo.
- Análisis forense o de entrevistas: el modo literal conserva cada palabra y muletilla, útil cuando la fidelidad textual es requisito.
- Aplicaciones de accesibilidad en iOS/macOS: la integración con Glade y Core AI permite dictado y transcripción en tiempo real en el dispositivo, sin enviar audio a la nube.
- Procesamiento por lotes de archivos de audio multilingües: con 25 idiomas soportados y un frontend log-mel completo, se puede usar para indexar o clasificar archivos de audio en pipelines locales.
- Transcripción en movilidad sin conectividad: al ejecutarse en silicio Apple físico con pesos cuantizados W8, es viable en escenarios de campo donde no hay red.

## Benchmarks y rendimiento

Rendimiento medido el 14 de noviembre de 2026 sobre el discurso completo de JFK Rice (1.095,320125 segundos), con un calentamiento completo y tres pasadas medidas. RTFx = segundos de audio de entrada / segundos de procesamiento. WPM de referencia = 2.220 palabras normalizadas × 60 / segundos de procesamiento.

| Dispositivo | Modo | Procesamiento | RTFx | WPM de referencia |
|---|---|---:|---:|---:|
| MacBook Pro, M5 Max, 64 GB | Verbatim | 2,446 s | 447,9× | 54.463 |
| MacBook Pro, M5 Max, 64 GB | Clean | 2,447 s | 447,7× | 54.440 |
| iPhone Duo, A20 Pro, 12 GB | Verbatim | 2,274 s | 481,7× | 58.581 |
| iPhone Duo, A20 Pro, 12 GB | Clean | 2,323 s | 471,4× | 57.329 |
| iPhone 15 Pro Max, A17 Pro, 8 GB | Verbatim | 3,564 s | 307,3× | 37.373 |
| iPhone 15 Pro Max, A17 Pro, 8 GB | Clean | 3,563 s | 307,5× | 37.389 |

Precisión: el modo Verbatim obtiene 54 errores sobre 2.220 palabras (2,43 % WER) en esa grabación con whisper-normalizer 0.1.15 y jiwer 4.0.0 en los tres dispositivos. El modo Clean coincide exactamente con la referencia FP32 limpia normalizada en esos cortes.

Control de batching en Mac con ventanas de 15 segundos: 114,4× con chunks en serie y un carril de decodificación, frente a 488,1× con dos peticiones de encoder y hasta 32 carriles de decodificación.

Primera preparación (incluye preparación de modelos y funciones de Core AI):

| Dispositivo | Primer Verbatim | Primer Clean | Preparación en caché |
|---|---:|---:|---:|
| M5 Max | 34,5 s | 35,1 s | 0,07 s |
| iPhone Duo | 82,5 s | 83,9 s | 0,12–0,18 s |
| iPhone 15 Pro Max | 53,2 s | 53,2 s | 0,17–0,19 s |

## Requisitos de hardware

- Requiere Glade sobre silicio Apple físico con iOS 27 o macOS 27; no es ejecutable en GPU NVIDIA ni en CPU x86 convencional.
- VRAM/unificada estimada: el repositorio completo ocupa 1,6 GB y cada modo 806,4 MB; con W8 en el encoder y FP16 en el grafo, el modelo cabe holgadamente en dispositivos con 8 GB de memoria unificada (iPhone 15 Pro Max, A17 Pro).
- Dispositivos validados: MacBook Pro M5 Max (64 GB), iPhone Duo A20 Pro (12 GB) e iPhone 15 Pro Max A17 Pro (8 GB).
- Despliegue: únicamente mediante el runtime Glade y su API `ParakeetModelBundle` / `STTRecordingTranscriber` en Swift; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTFx de 307× a 482× según dispositivo; la primera carga del modelo tarda entre 34,5 s y 83,9 s, y las cargas posteriores desde caché, entre 0,07 s y 0,19 s.
- El batching es determinante: pasar de chunks en serie a dos peticiones de encoder con hasta 32 carriles de decodificación multiplica el throughput por más de cuatro en el control de 15 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| coder543/fluid-speech-pro-glade | 629 M | 384 posiciones; chunks de 30 s | 25 | CC-BY-4.0 | Glade / Apple Core AI |
| FluidVoice-Labs/fluid-speech-pro (base) | no disponible en la información | no disponible | 25 | CC-BY-4.0 | NeMo / general |
| coder543/nemotron-speech-streaming-en-0.6b-glade | ~0,6 B (por el nombre) | no disponible | en | no disponible | Glade / Apple Core AI |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del ecosistema Apple: requiere Glade y Core AI sobre iOS 27 o macOS 27 en silicio Apple físico; no hay ruta de despliegue en otras plataformas.
- La evaluación de precisión publicada se limita a una grabación en inglés y una breve muestra en francés de FLEURS; no es una evaluación multilingüe amplia, pese a declarar 25 idiomas.
- Los resultados de WER corresponden a decodificación beam-1, no al beam-4 del leaderboard del publicador, por lo que no son directamente comparables con las cifras oficiales del modelo base.
- No incluye cabecera VAD: el troceado se basa en límites de silencio contiguos, lo que puede ser subóptimo en audio con ruido de fondo o sin pausas claras.
- Las marcas de tiempo tienen un paso de 80 ms y no constituyen alineación forzada.
- El modo Clean aplica ediciones intencionadas (elimina muletillas y repeticiones); no debe usarse cuando se requiera fidelidad literal.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al ser un modelo ASR, los errores se manifiestan como sustituciones, omisiones o inserciones de texto.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar LICENSE y NOTICE del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (15 de noviembre de 2026), por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/fluid-speech-pro-glade
- Modelo base: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Colección Glade TTS de coder543: https://huggingface.co/collections/coder543/glade-tts
- Ficha de Nemotron Speech Streaming En 0.6b Glade: https://free2aitools.com/model/coder543/nemotron-speech-streaming-en-0.6b-glade
