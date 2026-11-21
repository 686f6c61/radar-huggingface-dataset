# babybirdprd/Underdog-Bark-3.0-Clean

## Resumen

Underdog Bark 3.0 Clean es un modelo de reconocimiento automatico del habla (ASR) en ingles, derivado por fine-tuning de nvidia/parakeet-tdt-0.6b-v3 y publicado por babybirdprd. Con 0,6 mil millones de parametros y una descarga de 180 MB, integra en un unico modelo la transcripcion y la limpieza de muletillas: elimina "um", "uh", arranques en falso y repeticiones, de modo que no hace falta un segundo modelo de postprocesado. Esta pensado para dictado y notas de reunion legibles, no para transcripcion literal.

Su relevancia actual radica en la relacion precision/tamano: segun la model card, su base verbatim Bark 3.0 Plus promedia 4,76 % de WER en los siete conjuntos ingleses del Open ASR Leaderboard, por delante de Parakeet TDT 0.6B v3 (4,94 %), Qwen3-ASR-0.6B (5,16 %) y Whisper large-v3 (6,04 %), con descargas entre 10 y 50 veces menores. La version Clean obtiene 4,08 % de WER frente a transcripciones ya limpias de DisfluencySpeech y 1,71 % en LibriSpeech clean.

El modelo esta orientado a ejecucion local: la familia declara despliegue en Apple Silicon mediante MLX, con 1,25 GB en memoria una vez descomprimido, y su uso previsto es la app Underdog en Mac e iPhone, donde el audio no sale del dispositivo. La licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de nvidia/parakeet-tdt-0.6b-v3, familia Parakeet TDT) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la model card menciona "low-bit" y pesos de 180 MB, pero sin detallar esquema |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (libreria transformers; repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de nvidia/parakeet-tdt-0.6b-v3, un sistema ASR de la familia Parakeet con decodificacion TDT (Token-and-Duration Transducer) y 0,6B de parametros. No se dispone de informacion publicada sobre la composicion exacta del dataset de fine-tune, el numero de horas de audio utilizadas ni el procedimiento de alineacion de etiquetas para la eliminacion de disfluencias; la model card solo indica que Clean se construye sobre Bark 3.0 Plus para dictado y transcripciones legibles en lugar de preservar cada hesitacion.

La innovacion destacable es el enfoque de limpieza integrada: el modelo aprende a producir directamente texto sin muletillas ni repeticiones, en lugar de transcribir literalmente y delegar la limpieza a un segundo modelo. Los resultados reportados muestran que este comportamiento se mantiene incluso cuando las referencias de evaluacion son verbatim (5,83 % de media en los siete conjuntos, penalizado por eliminar elementos que las referencias conservan).

## Capacidades

- Transcripcion de voz a texto en ingles (speech-to-text / ASR).
- Eliminacion integrada de disfluencias: muletillas ("um", "uh"), frases de relleno ("you know", "I mean"), arranques en falso y palabras repetidas.
- Produccion de transcripciones legibles para dictado y notas de reunion.
- Ejecucion en dispositivo (on-device) con soporte declarado para MLX y Apple Silicon.
- Modelo compacto (180 MB de descarga, 1,25 GB en memoria) apto para movil.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada mas alla del habla, thinking mode ni capacidades multilingues.

## Casos de uso

- Dictado en movil y escritorio: el modelo convierte habla espontanea en texto listo para pegar en un editor, eliminando muletillas y repeticiones sin un paso de postprocesado adicional; encaja por su tamano de 180 MB y su ejecucion on-device.
- Notas de reunion: transcripcion de conversaciones multiparticipante con limpieza de hesitaciones, adecuada para generar actas legibles; la model card reporta 12,12 % de WER en AMI para la version Clean.
- Asistentes de voz locales con privacidad: integracion en apps de Mac e iPhone donde el audio no abandona el dispositivo, como en la app Underdog para Speak y notas de reunion.
- Accesibilidad y productividad: entrada por voz para personas con movilidad reducida o para redaccion rapida de correos y documentos, gracias a la salida sin relleno.
- Transcripcion de audio de baja latencia en entornos con recursos limitados: al caber en memoria de 1,25 GB, permite desplegar ASR en equipos consumer y portatiles Apple Silicon.
- Preprocesado de datos de voz para pipelines de NLP: generacion de transcripciones limpias de entrevistas o llamadas antes de alimentar sistemas de analisis, resumen o busqueda.
- Subtitulado interno y busqueda en archivos de audio: transcripciones legibles que facilitan indexacion y recuperacion de contenido hablado.

## Benchmarks y rendimiento

Limpieza, conjunto de test DisfluencySpeech (250 clips de conversacion no guionizada), WER (%) menor es mejor:

| Modelo | Descarga | Frente a transcripciones limpias | Frente a transcripciones verbatim |
|---|---:|---:|---:|
| Bark 3.0 Clean | 180 MB | 4,08 | 13,85 |
| Bark 2.0 | 472 MB | 3,83 | 13,01 |
| Bark 3.0 (verbatim) | 163 MB | 16,53 | 3,15 |

Habla ordinaria, WER (%) en los siete conjuntos ingleses del Open ASR Leaderboard:

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bark 3.0 Clean | 180 MB | 1,71 | 3,78 | 12,12 | 8,55 | 9,76 | 2,66 | 2,23 | 5,83 |
| Bark 2.0 | 472 MB | 2,94 | 5,21 | 16,16 | 11,08 | 10,56 | 3,47 | 2,90 | 7,48 |

Base verbatim (Bark 3.0 Plus) y baselines seleccionados, WER (%):

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Phonon-2 | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Qwen3-ASR-0.6B | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Whisper large-v3 | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Nota: las referencias de los siete conjuntos son verbatim, por lo que las muletillas eliminadas por Clean penalizan su WER en AMI, GigaSpeech y Earnings-22.

## Requisitos de hardware

- VRAM/memoria estimada: 1,25 GB en memoria una vez descomprimido el modelo; descarga de 180 MB.
- GPU recomendadas: no se detallan; la model card apunta a Apple Silicon con MLX como via de despliegue on-device.
- Cabe en GPU consumer: si, por el reducido tamano (0,6B parametros y 1,25 GB en memoria), aunque no se publican requisitos especificos para CUDA.
- Opciones de despliegue: libreria transformers; MLX para Apple Silicon; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER medio (7 conjuntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bark 3.0 Clean | 0,6B | no disponible | 5,83 (limpieza, referencias verbatim) | CC BY 4.0 | Hugging Face, 180 MB |
| Bark 3.0 Plus | 0,6B | no disponible | 4,76 (verbatim) | no disponible | Hugging Face, 180 MB |
| Parakeet TDT 0.6B v3 | 0,6B | no disponible | 4,94 | no disponible | Hugging Face, 2.508 MB |
| Qwen3-ASR-0.6B | 0,6B | no disponible | 5,16 | no disponible | Hugging Face, 1.876 MB |
| Whisper large-v3 | no disponible | no disponible | 6,04 | no disponible | Hugging Face, 9.261 MB |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La limpieza de disfluencias altera la salida de forma deliberada: para transcripcion literal hay que usar Bark 3.0 o Bark 3.0 Plus, no Clean.
- El WER en los conjuntos con referencias verbatim (AMI, GigaSpeech, Earnings-22) esta penalizado por eliminar muletillas que las referencias conservan; no debe compararse directamente con modelos verbatim en esos conjuntos.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas; en ASR, el riesgo de omisiones o invenciones en audio ruidoso o con acentos no cubiertos sigue siendo relevante.
- La licencia CC BY 4.0 permite uso comercial con atribucion; conviene verificar los terminos del modelo base (nvidia/parakeet-tdt-0.6b-v3) antes de produccion.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, con publicacion muy reciente (21 de noviembre de 2026); no hay validacion independiente de terceros.
- No se dispone de informacion sobre cuantizacion, formato de pesos exacto ni requisitos de hardware fuera del ecosistema Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/babybirdprd/Underdog-Bark-3.0-Clean
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Bark 3.0 Plus: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Bark 3.0 Pro: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Bark 2.0: https://huggingface.co/ConwayResearch/bark-0.6B-4bit-v2.0
- Paper DisfluencySpeech: https://arxiv.org/abs/2406.08820
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Underdog: https://underdog.ai
