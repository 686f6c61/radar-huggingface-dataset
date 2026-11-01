# lipik/parakeet-tdt-0.6b-v3-gguf

## Resumen

`lipik/parakeet-tdt-0.6b-v3-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3`, publicada para su uso con la librería `transcribe.cpp`. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción multilingüe offline de alta velocidad, cubriendo 25 lenguas europeas (incluido el español) con detección automática de idioma y sin necesidad de indicar la lengua de entrada.

La arquitectura es un encoder FastConformer de unos 600 millones de parámetros combinado con un decoder transducer TDT/RNNT (Token-and-Duration Transducer). El paquete GGUF incluye varias cuantizaciones (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que van desde 2,51 GB hasta 502 MB, lo que permite ejecutar el modelo en CPU, GPU consumer o Apple Silicon con pérdida de precisión mínima.

Su relevancia práctica radica en la combinación de tamaño contenido, licencia permisiva (CC-BY-4.0), soporte de 25 idiomas y un rendimiento en WER sobre LibriSpeech test-clean del 1,9 % aproximadamente, con velocidades de inferencia muy superiores al tiempo real incluso en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo offline por utterance, sin ventana declarada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end de tipo transducer. El encoder es un FastConformer, variante eficiente del Conformer que combina convoluciones depthwise con atención multi-cabeza y subsampling agresivo para reducir la longitud de la secuencia. El decoder es un TDT (Token-and-Duration Transducer), una evolución del RNNT clásico que predice conjuntamente el token y su duración, lo que acelera la decodificación y mejora la alineación temporal.

Según la model card original de NVIDIA, el entrenamiento se apoya principalmente en el corpus multilingüe Granary, que amplía el soporte desde el inglés (versión v2) hasta 25 lenguas europeas. La model card no detalla el número exacto de horas de audio, la composición exacta del dataset ni si se aplicaron etapas de RLHF o ajuste fino supervisado adicional. La conversión a GGUF se realizó desde el commit `6d590f7` del modelo upstream (fijado el 2026-04-16) y se validó numéricamente contra la referencia NeMo en el commit `bf0d0b7` de transcribe.cpp (2026-04-18).

## Capacidades

- Transcripción de voz a texto offline en 25 lenguas europeas, con detección automática del idioma de entrada.
- Generación de puntuación y capitalización automáticas en la salida.
- Marcas de tiempo a nivel de token (no a nivel de palabra o segmento; `timestamps: token`).
- Detección de idioma integrada (`lang_detect: true`).
- Entrada de audio: WAV mono a 16 kHz.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`); transcribe en el idioma original.
- No es un modelo generativo de texto ni soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio pregrabado y devuelve texto con puntuación y capitalización, adecuado para generar actas o subtítulos en español, inglés, francés o alemán sin indicar el idioma de antemano.
- Subtitulado de vídeo: las marcas de tiempo a nivel de token permiten alinear los subtítulos con el audio en pipelines de postproducción, aunque no ofrece timestamps por palabra de forma nativa.
- Archivado y búsqueda de audio: transcripción masiva de grabaciones históricas o llamadas de atención al cliente para indexación y búsqueda textual posterior, aprovechando el bajo coste de la cuantización Q4_K_M (502 MB).
- Aplicaciones de escritorio y movilidad: al caber en 502-740 MB en Q4_K_M/Q8_0, puede integrarse en herramientas locales de dictado o notas de voz que se ejecutan en CPU sin GPU dedicada.
- Investigación lingüística multilingüe: comparación de transcripciones en las 25 lenguas soportadas con un único modelo, útil para estudios de fonética o evaluación de corpus.
- Preprocesado de datasets de voz: generación de transcripciones automáticas para corpus de audio antes de un entrenamiento posterior, con throughput alto gracias a los RTF medidos.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy sin LM externo), según la model card del paquete GGUF:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,95 % |
| F16 | 1,26 GB | 1,95 % |
| Q8_0 | 740 MB | 1,94 % |
| Q6_K | 627 MB | 1,93 % |
| Q5_K_M | 565 MB | 1,92 % |
| Q4_K_M | 502 MB | 1,98 % |

El baseline F32 de referencia es 1,95 %; NVIDIA reporta 1,93 % en el mismo split. No se han publicado en la información disponible resultados de benchmarks para las otras 24 lenguas ni métricas comparativas con otros modelos ASR.

Métricas de velocidad (RTF, factor de tiempo real; mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 502 MB (Q4_K_M) y 2,51 GB (F32); Q8_0 requiere unos 740 MB y F16 unos 1,26 GB.
- Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) y también en iGPU con Vulkan o Metal.
- Funciona en CPU sin GPU: el Ryzen 4750U alcanza RTF 7,5 en CPU, es decir, procesa audio unas 7,5 veces más rápido que tiempo real.
- En Apple Silicon con Metal el RTF llega a 151 (M4 Max), lo que permite transcripción prácticamente instantánea de audios cortos.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Preprocesado obligatorio: convertir el audio a WAV mono 16 kHz con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/streaming | Licencia | Formato |
|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v3 (GGUF, este) | 627 M | 25 europeos | offline, sin streaming | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v2 | ~600 M (no confirmado en la informacion) | ingles | offline | no disponible en la informacion | NeMo |
| Whisper large-v3 | no disponible en la informacion | multilingue amplio | offline | no disponible en la informacion | multiples |
| Whisper small | no disponible en la informacion | multilingue | offline | no disponible en la informacion | multiples |

No se dispone en la información proporcionada de datos de WER comparativos con Whisper u otros modelos ASR, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo (o segmentado manualmente) antes de transcribir.
- No traduce: la salida está en el mismo idioma que la entrada.
- Solo acepta WAV mono a 16 kHz; cualquier otro formato debe convertirse previamente.
- Marcas de tiempo solo a nivel de token, no por palabra ni por segmento.
- Cobertura limitada a 25 lenguas europeas; no soporta asiático, africano ni otras familias lingüísticas.
- Riesgo de errores en audio con ruido, acentos no representados en el corpus Granary, habla solapada o dominio muy técnico; no se documentan tasas de alucinación específicas.
- La model card no detalla sesgos demográficos ni de acento; conviene auditar en producción sobre el dominio objetivo.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y mantener el aviso de licencia.
- El paquete GGUF lo mantiene un tercero (`lipik`) a partir del modelo de NVIDIA; la versión upstream es la fuente autoritativa y puede divergir en actualizaciones.
- Solo 29 descargas y 0 likes en el momento de la consulta: ecosistema reducido, menor probabilidad de soporte comunitario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Modelo predecesor: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v3.md
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Referencias arXiv citadas en los tags: arXiv:2509.14128, arXiv:2505.13404, arXiv:2305.05084, arXiv:2304.06795, arXiv:2410.01036, arXiv:2406.00899, arXiv:2205.12446, arXiv:2012.03411, arXiv:2007.10310, arXiv:1510.08484
