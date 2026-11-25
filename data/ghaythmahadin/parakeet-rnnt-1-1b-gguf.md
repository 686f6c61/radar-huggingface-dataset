# GhaythMahadin/parakeet-rnnt-1.1b-gguf

## Resumen

`parakeet-rnnt-1.1b-gguf` es una conversión al formato GGUF del modelo ASR `nvidia/parakeet-rnnt-1.1b`, publicada por el usuario GhaythMahadin para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original es un sistema de reconocimiento automático del habla (ASR) en inglés desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, basado en una arquitectura FastConformer-XL con decodificador transducer RNN-T y aproximadamente 1.100 millones de parámetros.

El propósito de esta conversión es permitir la inferencia local y offline del modelo fuera del ecosistema NeMo/PyTorch, ofreciendo pesos cuantizados que van desde F32 (4,28 GB) hasta Q4_K_M (825 MB), con una degradación de precisión prácticamente nula en la tasa de error de palabras (WER). Según la model card, el WER en LibriSpeech test-clean se mantiene entre el 1,41 % y el 1,46 % en todas las cuantizaciones, frente al 1,45 % del baseline F32 y el 1,46 % reportado por NVIDIA.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de gama alta en hardware de consumo (CPU o GPU integrada) mediante transcribe.cpp, con velocidades de decodificación medidas de hasta 125,5x tiempo real en un Apple M4 Max con Metal. No es un modelo de lenguaje: no genera texto libre ni razona, solo transcribe audio en inglés a texto en minúsculas y sin puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + transducer RNN-T (decoder), greedy decoding |
| Parametros totales | 1.070.513.665 (~1,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer Transducer en versión XXL, con un encoder FastConformer-XL de aproximadamente 1,1B de parámetros y un decodificador RNN-T (transducer). FastConformer es una variante del Conformer que reduce el coste computacional del encoder mediante downsampling de la secuencia de entrada, manteniendo la capacidad de modelar dependencias locales y globales con atención. El decodificador RNN-T permite alineamiento monotónico entre audio y texto sin necesidad de un modelo de lenguaje externo durante la inferencia.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card original indica que el modelo transcribe en alfabeto inglés en minúsculas y que fue desarrollado conjuntamente por NVIDIA NeMo y Suno.ai. La conversión GGUF se realizó a partir del commit `a07b19e` del modelo upstream (fijado el 2026-05-10) y se validó numéricamente contra la referencia NeMo en el commit `42528dd` de transcribe.cpp. La decodificación es greedy RNN-T, sin modelo de lenguaje externo.

## Capacidades

- Transcripción de voz a texto en inglés, salida en minúsculas y sin puntuación.
- Reconocimiento offline: no requiere conexión a red ni servicios externos.
- Decodificación greedy RNN-T sin LM externo.
- Generación de timestamps a nivel de token (según el campo `timestamps: token` de la model card).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No es un modelo multimodal ni de lenguaje: no genera texto libre, no razona, no ejecuta tool calling ni agentes.

## Casos de uso

- Transcripción de reuniones y entrevistas offline: el modelo procesa audio de 16 kHz mono WAV de forma local, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad. Su WER de ~1,45 % en LibriSpeech test-clean lo hace apto para actas y notas.
- Subtitulado automático de vídeo en inglés: la generación de timestamps a nivel de token permite alinear segmentos de texto con el audio para producir subtítulos sincronizados en pipelines de postproducción.
- Dictado y accesibilidad en aplicaciones de escritorio: con la cuantización Q4_K_M (825 MB) el modelo cabe en memoria de un portátil convencional y puede integrarse en herramientas de dictado local mediante transcribe.cpp.
- Procesamiento por lotes de archivos de audio: la velocidad medida de 125,5x tiempo real en Metal (M4 Max) y 11x en Vulkan (Ryzen 4750U) permite transcribir grandes volúmenes de grabaciones en horas o minutos según el hardware.
- Indexación y búsqueda de contenido hablado: transcribir archivos de audio de un repositorio para hacerlos buscables por texto, usando la salida en minúsculas como base para un motor de búsqueda.
- Transcripción en dispositivos con GPU integrada o CPU: las métricas de RTF en Vulkan y CPU indican que el modelo es viable en equipos sin GPU dedicada, útil para aplicaciones de campo o entornos embebidos.
- Preprocesado para pipelines de NLP: convertir audio a texto antes de aplicar análisis de sentimiento, resumen o extracción de entidades con otros modelos, dado que la transcripción es el primer paso del pipeline.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,45 | 1,45 | 1,46 | 1,43 | 1,43 | 1,41 |
| Tamano (GB) | 4,28 | 2,15 | 1,27 | 1,04 | 0,936 | 0,825 |

WER medido sobre la partición completa de LibriSpeech test-clean (2620 utterances) con decodificación greedy RNN-T y sin LM externo. El baseline de referencia F32 es 1,45 %; el número autodeclarado por NVIDIA en la misma partición es 1,46 %.

Rendimiento (factor de tiempo real, RTF, mayor es mejor):

| Hardware / backend | RTF |
|---|---:|
| Apple M4 Max (Metal) | 125,5 |
| Apple M4 Max (CPU) | 17,5 |
| Ryzen 4750U (Vulkan) | 11 |
| Ryzen 4750U (CPU) | 5,5 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 825 MB (Q4_K_M), 936 MB (Q5_K_M), 1,04 GB (Q6_K), 1,27 GB (Q8_0), 2,15 GB (F16), 4,28 GB (F32).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; las métricas se han medido en Apple M4 Max (Metal) y Ryzen 4750U (Vulkan).
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M a Q8_0 caben en cualquier GPU con 2 GB o más de VRAM; también en CPU con suficiente RAM.
- Opciones de despliegue: transcribe.cpp (runtime específico, compilado desde fuente con CMake). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 125,5 en M4 Max con Metal, 17,5 en M4 Max con CPU, 11 en Ryzen 4750U con Vulkan y 5,5 en Ryzen 4750U con CPU. Un RTF de 125,5 implica procesar 125,5 segundos de audio por segundo de cómputo.
- Requisito de entrada: audio en WAV mono a 16 kHz; para otros formatos se debe convertir con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER LibriSpeech test-clean | Formato | Licencia |
|---|---|---:|---:|---|---|
| parakeet-rnnt-1.1b-gguf (esta ficha) | ~1,1B | en | 1,41-1,46 % | GGUF | CC-BY-4.0 |
| nvidia/parakeet-rnnt-1.1b (original) | ~1,1B | en | 1,46 % (autodeclarado) | NeMo/.nemo | CC-BY-4.0 |
| whisper-large-v3 | no disponible en la informacion | multilingue | no disponible en la informacion | safetensors/GGUF | MIT (no confirmado en la informacion) |
| wav2vec2-large | no disponible en la informacion | en | no disponible en la informacion | safetensors | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo original de NVIDIA. La ventaja principal de esta conversión frente al original es la portabilidad a GGUF/transcribe.cpp y la reducción de tamaño (825 MB frente a los pesos completos), manteniendo el WER.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni detección de idioma (`lang_detect: false`).
- No es streaming: requiere el audio completo o segmentos cerrados; no apto para transcripción en tiempo real continua (`streaming: false`).
- No traduce (`translate: false`).
- Salida en minúsculas y sin puntuación: requiere postprocesado si se necesita texto con formato.
- Riesgo de alucinación: como todo modelo ASR, puede producir palabras incorrectas en audio con ruido, acentos no vistos o solapamiento de hablantes; el WER de ~1,45 % corresponde a un corpus limpio (LibriSpeech test-clean) y será mayor en condiciones reales.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado mayoritariamente con datos en inglés, puede tener peor rendimiento con acentos no nativos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y Suno.ai y conservar el aviso de licencia.
- Dependencia de transcribe.cpp: el modelo solo es utilizable con ese runtime; no es compatible directamente con llama.cpp, vLLM u Ollama.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad; la validación numérica reportada es contra NeMo en un commit concreto.
- Formato de entrada estricto: WAV mono a 16 kHz; otros formatos requieren conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/parakeet-rnnt-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-rnnt-1.1b
- Commit del modelo base: https://huggingface.co/nvidia/parakeet-rnnt-1.1b/commit/a07b19e
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-1.1b.md
- Descargas GGUF (repo handy-computer): https://huggingface.co/handy-computer/parakeet-rnnt-1.1b-gguf
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Documentación NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- NVIDIA Developer Portal: https://developer.nvidia.com
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
