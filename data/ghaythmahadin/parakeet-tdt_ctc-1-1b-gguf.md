# GhaythMahadin/parakeet-tdt_ctc-1.1b-gguf

## Resumen

`parakeet-tdt_ctc-1.1b-gguf` es la conversión a formato GGUF del modelo ASR `nvidia/parakeet-tdt_ctc-1.1b`, publicada por el usuario GhaythMahadin para su uso con el motor de inferencia [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original fue desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, y está diseñado para transcripción de voz en inglés con puntuación y capitalización automáticas. Esta conversión elimina la cabeza CTC auxiliar del checkpoint híbrido original y conserva únicamente el decodificador TDT/RNNT, que es el que se usa por defecto.

La arquitectura subyacente es un encoder FastConformer-XL de aproximadamente 1.100 millones de parámetros con atención local y tokens globales, lo que permite transcribir hasta 11 horas de audio en una sola pasada. El modelo no es de streaming ni traduce: es una herramienta de transcripción offline de alta precisión. Su relevancia práctica radica en que, gracias a las cuantizaciones GGUF (desde 825 MB en Q4_K_M hasta 4,28 GB en F32), puede ejecutarse en hardware de consumo con pérdida de precisión prácticamente nula: el WER en LibriSpeech test-clean se mantiene en 1,87 % desde F32 hasta Q5_K_M, y solo sube a 1,91 % en Q4_K_M.

El repo tiene un tamaño de 2,1 GB, no registra descargas ni likes en el momento de redactar esta ficha, y está pensado para integrarse en pipelines locales mediante la CLI de transcribe.cpp, con soporte de aceleración por Metal en Apple Silicon y por Vulkan en GPUs de AMD e Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + decodificador TDT/RNNT (transducer); cabeza CTC eliminada en la conversion |
| Parametros totales | 1.070.516.870 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; admite hasta 11 horas de audio en una sola pasada segun el autor original |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR híbrido basado en FastConformer, una variante de Conformer con atención local y tokens globales que reduce el coste computacional en secuencias largas. El encoder FastConformer-XL se combina con un decodificador transducer TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a un RNNT clásico. El checkpoint original de NVIDIA incluye además una cabeza CTC auxiliar que se descarta durante la conversión a GGUF; esta conversión, por tanto, solo expone el decodificador TDT/RNNT.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens de audio o si se aplicaron técnicas de RLHF o DPO; la model card original de NVIDIA no los detalla en el fragmento disponible. La innovación técnica destacable es la capacidad de procesar hasta 11 horas de audio en una única pasada gracias a la atención local con tokens globales, y la decodificación TDT, que según el autor original permite transcribir 90 minutos de audio en menos de 16 segundos en una A100. La conversión se validó numéricamente contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Decodificación TDT/RNNT con timestamps a nivel de token.
- Procesamiento offline de audio de larga duración: hasta 11 horas en una sola pasada según NVIDIA.
- Soporte de entrada de audio a 16 kHz mono WAV (se requiere conversión previa con ffmpeg para otros formatos).
- Aceleración por Metal en Apple Silicon y por Vulkan en GPUs de AMD e Intel a través de transcribe.cpp.
- No soporta streaming (indicado explícitamente en la model card).
- No soporta traducción.
- No soporta detección de idioma.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- Capacidad monolingüe: únicamente inglés.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de varias horas en una sola pasada gracias a su capacidad de manejar hasta 11 horas de audio, generando transcripciones con puntuación y capitalización listas para revisión.
- Subtitulado y generación de actas: los timestamps a nivel de token permiten alinear el texto transcrito con el audio, lo que facilita la creación de subtítulos o la sincronización de actas con marcas temporales.
- Dictado y notas de voz en aplicaciones de escritorio: con la cuantización Q5_K_M (936 MB) el modelo cabe en memoria de un portátil convencional y puede ejecutarse en CPU con un factor de tiempo real de 5,5x según las pruebas en Ryzen 4750U, suficiente para dictado interactivo por lotes.
- Procesamiento por lotes de archivos de audio en servidores: la CLI de transcribe.cpp permite automatizar la transcripción de directorios completos de WAV a 16 kHz, integrándose en pipelines de datos o en sistemas de archivado documental.
- Investigación en ASR y evaluación de cuantizaciones: al ofrecer seis niveles de cuantización con WER medido en LibriSpeech test-clean, sirve como banco de pruebas para estudiar el impacto de la cuantización en modelos transducer.
- Despliegue en dispositivos con GPU integrada: la ruta Vulkan permite usar el modelo en equipos con gráficos AMD o Intel sin GPU dedicada, con un factor de tiempo real de 11x en Ryzen 4750U, adecuado para aplicaciones de escritorio que transcriben audio en segundo plano.
- Transcripción de podcasts y contenido editorial: la ventana de audio larga y la puntuación automática reducen la necesidad de postprocesado manual en la generación de transcripciones publicables.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,87 | 1,87 | 1,87 | 1,87 | 1,87 | 1,91 |
| Tamano del archivo | 4,28 GB | 2,15 GB | 1,27 GB | 1,04 GB | 936 MB | 825 MB |

| Metrica de velocidad | Valor |
|---|---|
| Factor de tiempo real (RTF) en Apple M4 Max, Metal | 125,5x |
| Factor de tiempo real (RTF) en Apple M4 Max, CPU | 18,5x |
| Factor de tiempo real (RTF) en Ryzen 4750U, Vulkan | 11x |
| Factor de tiempo real (RTF) en Ryzen 4750U, CPU | 5,5x |
| WER reportado por NVIDIA en LibriSpeech test-clean | 1,82 % |
| WER de referencia F32 en transcribe.cpp | 1,87 % |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2.620 enunciados) con decodificación greedy TDT/RNN-T y sin modelo de lenguaje externo. La diferencia entre el 1,82 % de NVIDIA y el 1,87 % de transcribe.cpp se debe a diferencias en la implementación de la decodificación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 825 MB en Q4_K_M, 936 MB en Q5_K_M, 1,04 GB en Q6_K, 1,27 GB en Q8_0, 2,15 GB en F16 y 4,28 GB en F32.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). El autor original reporta menos de 16 segundos para 90 minutos de audio en una A100.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones desde Q4_K_M hasta Q8_0; incluso F16 cabe en GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 125,5x en Metal (M4 Max), 18,5x en CPU (M4 Max), 11x en Vulkan (Ryzen 4750U) y 5,5x en CPU (Ryzen 4750U). Un RTF de 125,5x implica procesar 125,5 segundos de audio por segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt_ctc-1.1b (este, GGUF) | 1,1B | hasta 11 h en una pasada | en | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt_ctc-1.1b (original) | 1,1B | hasta 11 h en una pasada | en | CC-BY-4.0 | NeMo (.nemo) |
| Whisper large-v3 | no disponible en la informacion proporcionada | no disponible | multilingue | no disponible | safetensors, GGUF |
| Whisper large-v3-turbo | no disponible en la informacion proporcionada | no disponible | multilingue | no disponible | safetensors, GGUF |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento. La comparación cualitativa se limita a idioma (Parakeet es monolingüe inglés), licencia y formato de pesos.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe inglés; no soporta otros idiomas ni detección de idioma.
- No es un modelo de streaming: requiere el audio completo antes de transcribir, lo que lo hace inadecuado para aplicaciones de transcripción en tiempo real.
- No traduce: la salida es únicamente el texto transcrito en el idioma original.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencios largos o audio de baja calidad; no se han publicado tasas de alucinación específicas.
- Sesgos: no se documentan análisis de sesgo por acento, género o dialecto en la información disponible; el rendimiento puede degradarse en acentos no representados en el entrenamiento.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar a NVIDIA y Suno.ai y conservar el aviso de licencia.
- Repo no verificado: la conversión tiene 0 descargas y 0 likes, y no procede del equipo oficial de NVIDIA ni de handy-computer; conviene validar la integridad de los archivos antes de usarlos en producción.
- Dependencia de transcribe.cpp: no hay soporte indicado para otros motores de inferencia (llama.cpp, vLLM, Ollama), lo que limita la portabilidad.
- Requiere audio de entrada a 16 kHz mono WAV; otros formatos deben convertirse previamente con ffmpeg.
- La cabeza CTC del checkpoint original se elimina en la conversión; no es posible usar decodificación CTC con estos archivos.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/parakeet-tdt_ctc-1.1b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b
- Commit del modelo base usado para la conversión: https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b/commit/675e786
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-1.1b.md
- Repositorio alternativo de GGUF (handy-computer): https://huggingface.co/handy-computer/parakeet-tdt_ctc-1.1b-gguf
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Suno.ai: https://www.suno.ai/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
