# addisai/addis-scribe-oromo-streaming

## Resumen

Addis Scribe Streaming: Afaan Oromo es un modelo de reconocimiento automático de habla (ASR) en tiempo real para afaan oromo, desarrollado por Addis AI a partir del modelo base NVIDIA Nemotron 3.5 ASR Streaming (0.6B). Su propósito es cubrir un idioma etiópico de gran número de hablantes pero escasamente atendido por los grandes proveedores de ASR, donde sistemas comerciales como Google Chirp 2 alcanzan WER superiores al 34%.

El modelo está diseñado para transcripción en directo: entrega las primeras palabras en pantalla en torno a 1,6-2,2 segundos y finaliza el texto unos 40 ms después de que el hablante se detiene, funcionando como modelo cache-aware con chunks de 0,32 s o 1,12 s. En un benchmark propio sobre 150 clips de WAXAL (23 hablantes, 45 minutos, no vistos en entrenamiento) consigue un WER del 21,1%, superando a Whisper-small, MMS-300M, Gemini Flash y Google Chirp 2 tanto en modo por lotes como en streaming.

Se distribuye como fichero `.nemo` (2,5 GB en el repositorio) para su uso con la librería NVIDIA NeMo 3.0, y también está disponible a través de la API comercial de Addis AI con etiquetas de hablante, marcas de tiempo por palabra y subtítulos. Es relevante por combinar latencia de streaming real con el mejor WER publicado para afaan oromo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-aware FastConformer encoder, hibrido RNNT + CTC |
| Parametros totales | 0,6B (600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio en chunks de 0,32 s o 1,12 s) |
| Tipos de cuantizacion | No disponible (se distribuye sin cuantizar) |
| Idiomas soportados | Afaan oromo (om) |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | `.nemo` (checkpoint de NeMo), tamano del repo 2,5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de nvidia/nemotron-3.5-asr-streaming-0.6b, un encoder cache-aware FastConformer con cabezas de decodificacion hibridas RNNT y CTC. En inferencia se usa decodificacion greedy RNNT con un prompt de idioma especifico para afaan oromo (`om-ET`, indice 59). La naturaleza cache-aware permite alimentar el audio en chunks de 0,32 s o 1,12 s manteniendo estado entre chunks, lo que habilita transcripcion en directo con finalizacion del texto ~40 ms tras el silencio.

Addis AI lo entreno con habla en afaan oromo; la model card no detalla el numero de horas de audio, la composicion del dataset ni el tamano en tokens. El benchmark se construyo con 150 clips de WAXAL (23 hablantes, 45 minutos, transcripciones humanas) explícitamente excluidos del entrenamiento, con un unico scorer para todos los sistemas. La salida es texto en alfabeto Qubee, en minusculas y sin puntuacion, conservando el apostrofe del ataque glotal.

## Capacidades

- Transcripcion de habla en afaan oromo en tiempo real (streaming) con chunks de 0,32 s o 1,12 s.
- Transcripcion por lotes de ficheros completos (modo offline).
- Baja latencia: primeras palabras en ~1,57 s (chunks de 0,32 s) o ~2,21 s (chunks de 1,12 s); texto final ~37-43 ms tras el silencio.
- Entrada de audio mono a 16 kHz; salida en alfabeto Qubee minusculas sin puntuacion.
- A traves de la API de Addis AI (`language=om`): etiquetas de hablante, marcas de tiempo por palabra y generacion de subtitulos.
- No soporta puntuacion ni mayusculas; no hay capacidades de vision, audio generativo ni tool calling (no es un LLM).

## Casos de uso

- Subtitulacion en directo de emisiones radiofonicas y televisivas en afaan oromo: la latencia de ~40 ms tras el silencio y las primeras palabras en ~2 s permiten subtitulos casi concurrentes con la locucion.
- Transcripcion de reuniones y clases: se puede alimentar el microfono en chunks de 1,12 s y obtener texto continuo; con la API de Addis AI se anaden marcas de tiempo y etiquetas de hablante para actas.
- Atencion al cliente por voz: integracion en IVR o call centers etiopes para transcribir conversaciones multi-turno en tiempo real y alimentar sistemas de analitica o asistentes.
- Generacion de corpus linguisticos: su WER del 21,1% permite transcribir grandes volumenes de audio para crear datasets de entrenamiento de otros modelos de PLN en afaan oromo.
- Accesibilidad: transcripcion en vivo para personas sordas o con dificultades auditivas en eventos, consultas medicas o servicios publicos en Oromia.
- Analisis de medios y monitorizacion: transcripcion automatica de archivos de audio y video archivados en modo por lotes para indexacion y busqueda.
- Sistemas de voz conversacionales: al ser streaming con latencia muy baja, puede servir de componente ASR en pipelines de voz-a-voz (ASR + LLM + TTS) para afaan oromo.

## Benchmarks y rendimiento

Benchmark publicado por Addis AI sobre 150 clips de WAXAL en afaan oromo (23 hablantes, 45 minutos, no usados en entrenamiento; WER/CER mas bajo es mejor):

| Sistema | Modo | WER | CER | Texto final tras silencio | Primeras palabras |
|---|---|---|---|---|---|
| Addis Scribe (este modelo) | live, chunks 1,12 s | 21,1% | 6,8% | 43 ms | 2,21 s |
| Addis Scribe (este modelo) | live, chunks 0,32 s | 21,5% | 6,9% | 37 ms | 1,57 s |
| Addis Scribe (este modelo) | fichero completo | 22,3% | 7,6% | – | – |
| Ethio-ASR Oromo | offline | 24,8% | 7,1% | – | – |
| Ethio-ASR multilingual 600M | offline | 25,7% | 7,2% | – | – |
| WAXAL Whisper-small Oromo | offline | 28,2% | 8,2% | – | – |
| WAXAL MMS-300M Oromo | offline | 29,5% | 7,9% | – | – |
| Google Gemini Flash (latest) | fichero completo | 29,8% | 9,7% | – | – |
| Google Gemini 4 Argon | fichero completo | 29,9% | 7,8% | – | – |
| Google Chirp 2 (om-ET) | batch | 34,8% | 9,9% | – | – |
| Google Chirp 2 (om-ET) | live | 42,4% | 14,2% | 1.051 ms | 6,37 s |

Nota: la latencia de este modelo se midio con audio a velocidad real y sin salto de red; las cifras de Google incluyen la red. El benchmark completo (clips, referencias, scorer y scripts) esta en addisai/addis-scribe-benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint pesa 2,5 GB, por lo que una GPU con 4-6 GB de VRAM deberia ser suficiente para el modelo sin cuantizar (estimacion no confirmada por el autor).
- GPU recomendadas: no disponible; al tratarse de un modelo de 0,6B parametros, cualquier GPU moderna (incluidas RTX 3060/4060 o superiores) deberia ejecutarlo.
- Cabe en GPU de consumo: si, por tamano de checkpoint (2,5 GB); el autor no publica requisitos minimos oficiales.
- Despliegue: requiere NVIDIA NeMo 3.0; el modelo se carga con `ASModel.restore_from()` y se ejecuta en streaming igual que addisai/addis-scribe-streaming (Amharico) y su script `stream_infer.py`, con prompt `om-ET` (indice 59). Alternativamente, despliegue gestionado via Addis AI API. No hay pesos GGUF ni soporte indicado para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: texto final ~37 ms (chunks 0,32 s) o ~43 ms (chunks 1,12 s) tras el silencio; primeras palabras en 1,57-2,21 s, midiendo el audio a velocidad real sin latencia de red.

## Comparativa con modelos similares

| Modelo | Parametros | Modo | WER (afaan oromo) | Contexto/latencia | Licencia |
|---|---|---|---|---|---|
| Addis Scribe Oromo Streaming | 0,6B | Streaming y offline | 21,1% | Final en ~40 ms tras silencio | OpenMDW 1.1 |
| Ethio-ASR Oromo (badrex) | No disponible | Offline | 24,8% | No disponible | No disponible |
| WAXAL Whisper-small Oromo | ~244M (Whisper-small) | Offline | 28,2% | No disponible | No disponible |
| WAXAL MMS-300M Oromo | 300M (MMS) | Offline | 29,5% | No disponible | No disponible |
| Google Chirp 2 (om-ET) | Cerrado | Batch y live | 34,8% (batch) / 42,4% (live) | 1.051 ms tras silencio (live) | Propietaria (API) |

Este modelo ofrece el mejor WER publicado para afaan oromo y es el unico de la tabla con modo streaming de baja latencia y licencia abierta; sus competidores abiertos solo funcionan offline y los comerciales de Google rinden peor y con mayor latencia.

## Limitaciones y advertencias

- La salida no incluye puntuacion ni mayusculas; el postprocesado corre a cargo del desarrollador.
- La ortografia del afaan oromo varia (longitud vocalica, consonantes dobles, marca glotal); parte de los errores medidos son diferencias de escritura respecto a la referencia y no fallos de escucha reales.
- Probado unicamente en afaan oromo; no hay garantias de rendimiento en otros idiomas ni en acentos fuera de los datos de entrenamiento.
- Sesgos conocidos: no disponible; el benchmark usa 23 hablantes de WAXAL, por lo que el rendimiento en otros dominios acusticos (telefono, ruido, musica) no esta documentado.
- Riesgo de alucinacion: no disponible; al ser un ASR RNNT greedy el riesgo es bajo, pero no se publica analisis.
- Licencia OpenMDW 1.1: se debe revisar el texto de la licencia (https://openmdw.ai/license/1-1/) antes de uso comercial; la model card indica que sigue los terminos del modelo base de NVIDIA.
- Requiere NeMo 3.0 y ficheros `.nemo`, lo que limita el despliegue frente a formatos como GGUF o ONNX.
- Metricas de latencia medidas sin salto de red; en produccion la latencia percibida sera mayor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/addisai/addis-scribe-oromo-streaming
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Dataset del benchmark: https://huggingface.co/datasets/addisai/addis-scribe-benchmark
- Dataset WAXAL: https://huggingface.co/datasets/google/WaxalNLP
- Modelo hermano (amarico): https://huggingface.co/addisai/addis-scribe-streaming
- Competidores del benchmark: https://huggingface.co/badrex/Ethio-ASR-oromo , https://huggingface.co/badrex/Ethio-ASR-multilingual-600M , https://huggingface.co/waxal-benchmarking/whisper-small-waxal-orm , https://huggingface.co/waxal-benchmarking/mms-300m-waxal-orm
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- API de Addis AI (documentacion): https://docs.addisassistant.com
- Web de Addis AI: https://addisassistant.com
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
