# moondream/parakeet-redux

## Resumen

Parakeet Redux es un modelo de reconocimiento automático del habla (ASR) publicado por Moondream, una versión de 1,58 bits (ternaria: pesos -1, 0 y +1) del modelo `nvidia/parakeet-tdt-0.6b-v3`. Mantiene la misma arquitectura y el mismo tokenizador que el original, pero reduce los pesos de 1,2 GB a 178 MB. El modelo está pensado para inferencia en CPU x86 y Apple Silicon, sin necesidad de GPU.

La propuesta es comprimir agresivamente un modelo TDT (Token-and-Duration Transducer) de 148,9 millones de parámetros sin sacrificar calidad de forma significativa. Según la model card, se mantiene dentro de 0,3 puntos de WER del original en inglés, mejora sobre él en el conjunto FLEURS de 25 idiomas y en audio de formato largo, y empeora en condiciones de ruido de fondo. Alcanza 113× tiempo real en ocho núcleos x86 con AVX-512 y 38×/43× (CPU/GPU) en un Apple M2.

Es relevante porque demuestra que la cuantización ternaria extrema es viable en producción para ASR: permite transcripción local, privada y de bajo coste en hardware modesto, con soporte para 25 idiomas europeos y marcas de tiempo a nivel de segmento y de palabra. El motor de referencia es Photon, la runtime propia de Moondream, distribuida en el paquete `moondream` de Python.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder con pesos ternarios |
| Parámetros totales | 148.923.399 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance; soporta audio de formato largo) |
| Tipos de cuantización | ternaria de 1,58 bits (pesos del encoder en -1, 0, +1); el modelo base admite bf16, fp32, f16, int8 y q8_0 en otras runtimes |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (empaquetado propietario para Photon) |
| Tamaño de pesos | 178 MB (frente a 1,2 GB del original) |
| Tamaño del repo | 0,6 GB |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Pipeline | automatic-speech-recognition |
| Runtime de referencia | Photon (AVX-512 VNNI en x86, NEON en ARM, Metal en Apple GPUs) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura TDT del original: un encoder que procesa el audio y un decoder transducer que predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso y mejorar el throughput frente a un CTC o un transducer clásico. La innovación de Redux no está en la topología sino en la representación numérica: todos los pesos del encoder se restringen a valores ternarios (-1, 0, +1) con una escala de 1,58 bits por peso, lo que reduce el tamaño a 178 MB y habilita kernels enteros rápidos en CPU.

La model card no detalla el proceso de entrenamiento ni de cuantización (número de tokens, composición del dataset, si hubo destilación o fine-tuning tras la ternarización, ni técnicas de RLHF/DPO, que en ASR no son habituales). Sí indica que el modelo se evaluó con el pipeline del Open ASR Leaderboard de septiembre de 2026 y que el hermano `parakeet-ultra` es la variante de precisión completa de la misma arquitectura, entrenada adicionalmente y orientada a GPU. La inferencia se realiza con Photon, que lee directamente los pesos empaquetados y explota instrucciones vectoriales (AVX-512 VNNI, NEON) y Metal.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos (germánicas, eslavas, románicas, bálticas, ugrofinesas y griego, además de maltés).
- Marcas de tiempo a nivel de segmento (`timestamps="segment"`), con inicio y fin de cada frase en segundos.
- Marcas de tiempo a nivel de palabra (`timestamps="word"`), con inicio y fin de cada palabra.
- Procesamiento de audio de formato largo (evaluado en TED-LIUM, donde mejora al original).
- Inferencia en CPU x86 con AVX-512, en ARM con NEON y en GPUs Apple con Metal; también admite `cuda` y `mps` como dispositivo.
- Ejecución de una sola utterance en streaming por lotes; no se documenta tool calling, agentes ni capacidades multimodales.
- No se documentan capacidades de diarización, detección de idioma automática ni traducción.

## Casos de uso

- Transcripción local y privada en portátiles: con 178 MB y 38× tiempo real en un M2, se puede transcribir audio sin enviar datos a la nube, útil en entornos sanitarios, legales o de investigación con datos sensibles.
- Subtitulado automático con marcas de tiempo: la salida por segmento y por palabra permite generar subtítulos SRT/VTT sincronizados sin post-procesado adicional.
- Actas de reuniones y llamadas: el modelo mantiene un WER de 10,80 en AMI y 9,95 en Earnings-22, por lo que es adecuado para transcribir reuniones y llamadas financieras en inglés.
- Servicio de transcripción de bajo coste en servidores sin GPU: a 113× tiempo real en ocho núcleos EPYC, un solo nodo puede procesar horas de audio por minuto, lo que abarata el coste por hora transcrita.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps alimenta pipelines de búsqueda sobre podcasts, clases o archivos de radio en los 25 idiomas soportados.
- Aplicaciones de accesibilidad en tiempo real: la latencia baja en CPU permite dictado y subtitulado en vivo en dispositivos de gama media y en sistemas embebidos con ARM.
- Preprocesado para modelos de lenguaje: la transcripción sirve de entrada a pipelines RAG o de resumen sobre contenido hablado, con marcas temporales para citar fuentes.

## Benchmarks y rendimiento

WER en porcentaje, menor es mejor. Ambos modelos evaluados sobre los mismos ficheros con el pipeline del Open ASR Leaderboard de septiembre de 2026; Redux en Photon sobre GPU NVIDIA y el original en NeMo en bf16.

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-redux |
|---|---|---|
| Open ASR Leaderboard, media de 7 sets en inglés | 6,26 | 6,55 |
| FLEURS, 25 idiomas | 11,62 | 10,56 |
| Habla de negocios (estilo AA-WER) | 6,15 | 6,96 |
| Ruido de fondo, 9 condiciones MUSAN | 6,72 | 9,04 |
| TED-LIUM, formato largo | 2,71 | 2,51 |
| Peso de los pesos | 1,2 GB | 178 MB |

Desglose del Open ASR Leaderboard (WER %):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-redux |
|---|---|---|
| LibriSpeech test-clean | 1,52 | 1,96 |
| LibriSpeech test-other | 3,13 | 4,34 |
| AMI | 10,86 | 10,80 |
| Earnings-22 | 10,75 | 9,95 |
| GigaSpeech | 8,05 | 8,73 |
| SPGISpeech | 3,63 | 4,01 |
| VoxPopuli | 5,88 | 6,07 |
| Media | 6,26 | 6,55 |

Desglose parcial de FLEURS (WER %):

| Idioma | parakeet-tdt-0.6b-v3 | parakeet-redux |
|---|---|---|
| Búlgaro | 11,90 | 11,23 |
| Croata | 10,93 | 9,26 |
| Checo | 10,85 | 10,25 |
| Danés | 16,78 | 15,94 |
| Neerlandés | 6,18 | 7,45 |
| Inglés | 4,25 | 4,90 |
| Estonio | 13,23 | 9,15 |

El resto de idiomas de FLEURS no está disponible en la información proporcionada.

Rendimiento (factor de tiempo real, mayor es mejor, una utterance a la vez):

| Runtime | Pesos | x86 CPU (EPYC 9575F, 8 núcleos) | Apple M2 CPU | Apple M2 GPU |
|---|---|---|---|---|
| Photon, este modelo | ternario, 178 MB | 113× | 38× | 43× |
| parakeet.cpp (ggml) | q8_0, 0,94 GB | 45× | 12× | 38× (Metal) |
| sherpa-onnx (ONNX Runtime) | int8, 0,67 GB | 42× | 28× | — |
| onnx-asr (ONNX Runtime) | int8, 0,67 GB | 28× | 33× | — |
| parakeet-mlx | fp32, 2,51 GB | — | — | 37× |
| parakeet.cpp (ggml) | f16, 1,44 GB | — | 9× | 39× (Metal) |

En x86, el WER de Redux en LibriSpeech test-clean con Photon es 1,94 (frente a 1,51 de parakeet.cpp q8_0, 1,97 de sherpa-onnx y 1,93 de onnx-asr).

## Requisitos de hardware

- Inferencia en CPU: 178 MB de pesos; el modelo completo cabe holgadamente en la memoria de cualquier equipo actual.
- GPU: no es necesaria; Photon admite `cuda`, `mps` y `cpu`, con selección automática (CUDA, luego Apple Silicon, luego CPU).
- Cabe en cualquier GPU de consumo: con 178 MB, incluso una RTX 4090 o una GPU integrada lo ejecutan sin problemas de memoria.
- Aceleración: AVX-512 VNNI en x86, NEON en ARM y Metal en GPUs Apple.
- Despliegue: runtime Photon incluida en el paquete `moondream` de Python (versión 2.4.0 o posterior). No se documentan integraciones con vLLM, llama.cpp, TGI u Ollama; las alternativas medidas (parakeet.cpp, sherpa-onnx, onnx-asr, parakeet-mlx) ejecutan el modelo original, no esta variante ternaria.
- Throughput medido: 113× tiempo real en 8 núcleos EPYC 9575F, 38× en CPU de M2 y 43× en GPU de M2 (una utterance a la vez).

## Comparativa con modelos similares

| Modelo | Parámetros | Pesos | Idiomas | WER medio Open ASR (inglés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-redux | 148,9 M | 178 MB (ternario) | 25 | 6,55 | CC-BY-4.0 | Hugging Face, runtime Photon |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (según nombre) | 1,2 GB | 25 | 6,26 | no disponible en la información | Hugging Face, NeMo |
| moondream/parakeet-ultra | misma arquitectura, precisión completa | no disponible | no disponible | mejor que el original en todos los benchmarks según la model card | no disponible en la información | Hugging Face, orientado a GPU |

No se dispone de datos de otros modelos ASR comparables (Whisper, Canary, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Degradación en ruido: el WER sube de 6,72 a 9,04 en las nueve condiciones MUSAN, un empeoramiento sustancial frente al original.
- Peor rendimiento en inglés limpio: LibriSpeech test-clean pasa de 1,52 a 1,96 y test-other de 3,13 a 4,34; en habla de negocios empeora de 6,15 a 6,96.
- Riesgo de alucinación y errores en audio con solapamiento de hablantes, acentos no representados o dominios muy específicos; no se documentan métricas por dominio más allá de las mostradas.
- Cobertura limitada a 25 idiomas europeos; no se documenta soporte de otros idiomas ni detección automática de lengua.
- Dependencia de la runtime Photon: los pesos empaquetados se leen directamente con Photon, y no se documenta compatibilidad con otras runtimes para esta variante ternaria.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones de atribución en productos derivados y la licencia del modelo base.
- No se documentan sesgos demográficos ni evaluaciones por acento, género o edad; la model card no incluye sección de uso responsable.
- El rendimiento medido corresponde a una utterance a la vez; el throughput en batching concurrente no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moondream/parakeet-redux
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Hermano en precisión completa: https://huggingface.co/moondream/parakeet-ultra
- Entrada de blog de lanzamiento: https://moondream.ai/blog/introducing-parakeet-redux-and-ultra
- Runtime Photon: https://moondream.ai/photon
- Sitio de Moondream: https://moondream.ai/
