# ishiki-labs/ishiki-asr-0.5

## Resumen

Ishiki-ASR-0.5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por Ishiki Labs Inc. a partir de `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`. Se trata de un ajuste fino (finetune) del modelo base de NVIDIA, orientado a transcripción de audio en inglés de formato corto, y evaluado contra los conjuntos de referencia del Open ASR Leaderboard, donde reporta un WER medio del 4,17 % en los ocho conjuntos principales y del 3,58 % en los diez conjuntos públicos del leaderboard.

El modelo se distribuye en formato safetensors con un total de 34.053.546.277 parámetros según los pesos reales (la model card indica 27,48B, presumiblemente parámetros activos al tratarse de una arquitectura MoE heredada del base, aunque este dato no se confirma explícitamente en la información disponible). El repositorio ocupa 68,3 GB. Está pensado para su uso con la librería `transformers` y la arquitectura `nemo_speechlm` de NVIDIA.

Su relevancia radica en que ofrece un rendimiento competitivo en ASR en inglés (WER de 0,82 % en LibriSpeech test-clean y 1,48 % en SPGISpeech) sobre una base de pesos abiertos bajo licencia OpenMDW-1.1, lo que permite su uso comercial con condiciones, aunque con la cautela de que es un modelo derivado y hereda las obligaciones de atribución del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemo_speechlm (modelo de lenguaje de habla de NVIDIA, derivado de Nemotron) |
| Parametros totales | 34.053.546.277 (según safetensors); la model card indica 27,48B |
| Parametros activos | no disponible (el modelo base es A4B, lo que sugiere arquitectura MoE con ~4B activos, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (evaluado en en-IN y en-US); otros idiomas no disponibles |
| Licencia | OpenMDW-1.1 (NVIDIA Open Model License Agreement) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, un modelo de la familia Nemotron de NVIDIA para transcripción de habla. La etiqueta `nemo_speechlm` indica que se trata de un modelo de lenguaje de habla (speech language model) que combina un codificador de audio con un modelo de lenguaje, aunque los detalles concretos de la arquitectura interna (número de capas, dimensión, mecanismo de atención, tipo de encoder de audio) no se detallan en la información disponible. El sufijo A4B del modelo base sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos, pero este dato no se confirma en la model card.

En cuanto al entrenamiento, la model card indica que no se utilizaron conjuntos de test del Open ASR Leaderboard durante la optimización, y remite a la divulgación completa de datos del modelo base de NVIDIA. No se especifica el número de tokens de audio, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, orientado a audio de formato corto.
- Transcripción de audio con puntuación y formato, según el pipeline `automatic-speech-recognition`.
- Evaluado en dominios diversos: conversacional (AMI), financiero (SPGISpeech, Earnings22), reuniones (GigaSpeech), llamadas de emergencia (URGENT 2024), discurso parlamentario (VoxPopuli) y lectura (LibriSpeech).
- Soporte de inglés con acento indio (Voice Arena Monsoon en-IN, WER 2,60 %).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking.
- Capacidades multilingües: no disponibles; la evaluación publicada es exclusivamente en inglés.

## Casos de uso

- Transcripción de reuniones y actas: el modelo obtiene un WER del 5,90 % en AMI-Cleaned, lo que lo hace adecuado para generar actas automáticas de reuniones con habla espontánea y múltiples hablantes, integrándolo en pipelines de diarización previa.
- Subtitulado y postproducción audiovisual: con WER de 1,34 % en VoxPopuli y 1,48 % en SPGISpeech, es apto para generar subtítulos en contenido de dominio público y financiero donde la precisión literal es crítica.
- Análisis de llamadas de atención al cliente: su rendimiento en URGENT 2024 (8,23 % general, 3,60 % en limpio) permite transcribir llamadas de emergencia y centros de contacto para análisis de calidad y cumplimiento.
- Transcripción de audio financiero: Earnings22-Cleaned con WER de 4,09 % lo hace útil para transcribir llamadas de resultados empresariales y generar resúmenes financieros automatizados.
- Asistentes de voz y dictado: con WER de 0,82 % en LibriSpeech test-clean, puede emplearse en aplicaciones de dictado y asistentes de voz en inglés donde se requiere alta fidelidad en habla leída.
- Localización de contenido para el mercado indio: el WER de 2,60 % en Monsoon en-IN lo hace adecuado para transcribir contenido en inglés con acento indio, un caso frecuente en centros de soporte deslocalizados.
- Investigación en ASR: al ser un modelo abierto con pesos safetensors y licencia OpenMDW-1.1, sirve como base para experimentos de ajuste fino adicional y comparación en el Open ASR Leaderboard.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER %, inglés, formato corto):

| Conjunto de evaluacion | WER (%) |
|---|---|
| AMI-Cleaned | 5,90 |
| Earnings22-Cleaned-AA-chunked | 4,09 |
| GigaSpeech-Cleaned | 6,13 |
| SPGISpeech | 1,48 |
| URGENT 2024 | 8,23 |
| URGENT 2024 (Clean) | 3,60 |
| Voice Arena Monsoon (en-IN) | 2,60 |
| VoxPopuli-AA-Cleaned | 1,34 |
| LibriSpeech (test-clean) | 0,82 |
| LibriSpeech (test-other) | 1,63 |
| **Media WER (8 conjuntos principales)** | **4,17** |
| **Media WER (10 conjuntos del leaderboard)** | **3,58** |

No se proporcionan comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 34,05B parámetros en safetensors (68,3 GB en fp16/bf16), la inferencia en precisión completa requiere al menos ~68 GB de VRAM; en cuantización de 8 bits, ~34 GB; en 4 bits, ~17-20 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: para precisión completa, A100 80GB, H100 80GB o múltiples GPU; para cuantización 8 bits, A100 40GB o L40S; para 4 bits, RTX 4090 24GB podría ser suficiente, aunque no está verificado.
- Cabe en GPU de consumo: probablemente en RTX 4090 24GB con cuantización de 4 bits, sujeto a verificación; no se garantiza en la información disponible.
- Opciones de despliegue: la model card solo documenta uso con `transformers` y el script `run_eval.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y su compatibilidad no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos ASR en la información proporcionada. La model card solo incluye resultados propios y remite al Open ASR Leaderboard para comparaciones, pero no presenta una tabla comparativa con alternativas como Whisper, Canary o Parakeet. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo derivado: hereda las limitaciones y obligaciones del modelo base `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, incluida la atribución a NVIDIA Corporation.
- Licencia OpenMDW-1.1: es una licencia con condiciones; debe revisarse el archivo `LICENSE` y `THIRD_PARTY_NOTICES.md` antes de uso comercial, ya que no es una licencia permisiva estándar como Apache 2.0 o MIT.
- Idiomas: solo se documenta inglés; no hay evidencia de soporte multilingüe.
- Dominios: el rendimiento en URGENT 2024 (8,23 %) es notablemente peor que en habla leída, lo que indica degradación en audio ruidoso o espontáneo.
- Riesgo de alucinación: no documentado, pero inherente a los modelos de lenguaje de habla; puede generar texto no presente en el audio en segmentos ruidosos o silenciosos.
- Sesgos: no se documentan análisis de sesgo por acento, género o edad; el único dato por acento es en-IN.
- Contexto: no se especifica la longitud máxima de audio soportada.
- Formato corto: la evaluación es de formato corto; el comportamiento en audio largo no está verificado.
- Repositorio de 68,3 GB: requiere almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishiki-labs/ishiki-asr-0.5
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Divulgación de datos de entrenamiento del base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B#training-testing-and-evaluation-datasets
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Dataset de evaluación: https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
- Dataset ESB: https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Dataset Voice Arena Monsoon: https://huggingface.co/datasets/voice-arena-leaderboard/Monsoon-en-IN-test
