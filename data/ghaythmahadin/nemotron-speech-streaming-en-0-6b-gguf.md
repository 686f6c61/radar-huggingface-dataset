# GhaythMahadin/nemotron-speech-streaming-en-0.6b-gguf

## Resumen

Nemotron-speech-streaming-en-0.6b es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, con 618 millones de parámetros, basado en una arquitectura Cache-Aware FastConformer con decodificador RNN-T (transducer). Está diseñado para transcripción de voz a texto con puntuación y capitalización nativas, y admite configuraciones de chunk configurables (80 ms, 160 ms, 560 ms y 1120 ms) para equilibrar latencia y throughput. La versión aquí descrita es una conversión a GGUF realizada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C++ inspirada en llama.cpp.

El modelo resuelve el problema de la transcripción en inglés tanto en escenarios de baja latencia (streaming) como de alto rendimiento en lote. Su encoder preserva la máscara de atención cache-aware original con `att_context_size=[70, 13]` (ventana de 1,12 s), lo que permite procesar audio de forma incremental sin recalcular todo el contexto. La conversión GGUF permite ejecutar el modelo en CPU, GPU y aceleradores como Metal o Vulkan sin depender del stack de NeMo o PyTorch.

Su relevancia actual radica en que ofrece una alternativa ligera (453 MB en Q4_K_M) y con licencia permisiva (NVIDIA Open Model License) para integrar ASR en aplicaciones de escritorio, dispositivos edge y pipelines de producción, manteniendo una tasa de error de palabra (WER) de en torno al 2,3 % en LibriSpeech test-clean. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-Aware FastConformer (encoder) + RNN-T (decoder transducer) |
| Parametros totales | 618.079.745 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de atención cache-aware `att_context_size=[70, 13]` (1,12 s por chunk); chunks configurables de 80, 160, 560 y 1120 ms |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Cache-Aware FastConformer como encoder y un decodificador RNN-T (transducer) para la transcripción. El encoder está diseñado para operar en modo streaming mediante una máscara de atención cache-aware que limita el contexto a `att_context_size=[70, 13]`, es decir, una ventana de 1,12 s. Esta configuración permite procesar audio de forma incremental manteniendo un estado de caché, lo que reduce el coste computacional frente a un encoder de atención completa. El modelo base fue entrenado por NVIDIA sobre corpus de habla en inglés, con soporte nativo de puntuación y capitalización, y la versión de marzo de 2026 se entrenó sobre corpus ampliados respecto al checkpoint de enero de 2026.

La innovación principal es la combinación de FastConformer (una variante eficiente de Conformer con downsampling) con atención cache-aware para streaming, junto con un decodificador RNN-T que permite decodificación greedy sin necesidad de un modelo de lenguaje externo. La conversión a GGUF preserva la máscara de atención original de extremo a extremo y ha sido validada contra la referencia de NeMo en el commit 12f1076 de transcribe.cpp. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización nativas.
- Soporte de streaming cache-aware a nivel de encoder, con chunks configurables de 80, 160, 560 y 1120 ms.
- Modo offline funcional en transcribe.cpp (la API de sesión streaming aún no está expuesta en esta implementación).
- Timestamps a nivel de token (`timestamps: token`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en inglés a texto con puntuación y capitalización, adecuado para integrarse en aplicaciones de productividad que procesan archivos WAV de 16 kHz mono. Su tamaño reducido (453 MB en Q4_K_M) permite ejecutarlo localmente sin depender de la nube.
- Subtitulado y accesibilidad: gracias a los timestamps a nivel de token, puede generar subtítulos sincronizados para vídeos en inglés, con la ventaja de que el modelo cabe en memoria de dispositivos consumer y puede ejecutarse en CPU.
- Dictado por voz en aplicaciones de escritorio: la conversión GGUF y la librería transcribe.cpp permiten integrar el modelo en aplicaciones nativas en C++ sin necesidad de Python ni PyTorch, con latencia baja en GPU (RTF de 154,5 en Metal sobre M4 Max).
- Procesamiento por lotes de archivos de audio: en modo offline, el modelo puede transcribir grandes volúmenes de audio en inglés con un throughput alto (RTF de 32 en CPU sobre M4 Max), adecuado para pipelines de archivado o análisis de llamadas.
- Transcripción en dispositivos edge: con cuantizaciones Q4_K_M (453 MB) y Q5_K_M (514 MB), el modelo puede ejecutarse en hardware con recursos limitados, como Raspberry Pi o mini-PC con Vulkan (RTF de 13 en Ryzen 4750U con Vulkan).
- Análisis de llamadas de atención al cliente: el modelo puede transcribir conversaciones en inglés para su posterior análisis de sentimiento o extracción de entidades, con la ventaja de que la licencia NVIDIA Open Model License permite uso comercial.
- Investigación en ASR: al ser una conversión GGUF de un modelo de NVIDIA con WER validado contra NeMo, sirve como referencia reproducible para experimentos de cuantización y evaluación de rendimiento en diferentes backends (CPU, Metal, Vulkan).

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,31 | 2,31 | 2,31 | 2,29 | 2,34 | 2,38 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 154,5 |
| Apple M4 Max | CPU | 32 |
| AMD Ryzen 4750U | Vulkan | 13 |
| AMD Ryzen 4750U | CPU | 7,5 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 utterances) con decodificación greedy RNN-T. La referencia F32 es 2,31 %. NVIDIA reporta 2,32 % en la misma partición con `att_context_size=[70, 13]` (chunk de 1,12 s, sin puntuación ni capitalización). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: F32 ~2,3 GB; F16 ~1,16 GB; Q8_0 ~696 MB; Q6_K ~573 MB; Q5_K_M ~514 MB; Q4_K_M ~453 MB.
- GPU recomendadas: Apple M4 Max (Metal, RTF 154,5), AMD Ryzen 4750U con Vulkan (RTF 13). No se dispone de datos para A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU consumer: sí, todas las cuantizaciones caben en cualquier GPU con al menos 1 GB de VRAM; incluso Q4_K_M puede ejecutarse en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con soporte de backends CPU, Metal y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 154,5 en Metal sobre M4 Max y 32 en CPU sobre M4 Max; RTF de 13 en Vulkan sobre Ryzen 4750U y 7,5 en CPU sobre Ryzen 4750U. Un RTF mayor indica mayor velocidad de procesamiento respecto al tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Nemotron-speech-streaming-en-0.6b (GGUF) | 618 M | 1,12 s (cache-aware) | 2,31 % (F32) | NVIDIA Open Model License | GGUF |
| Whisper large-v3 | 1550 M | 30 s | no disponible en la información | MIT | safetensors, GGUF |
| Parakeet-tdt-0.6b-v2 | 600 M | no disponible | no disponible en la información | CC-BY-4.0 | safetensors |
| Distil-Whisper large-v3 | 756 M | 30 s | no disponible en la información | MIT | safetensors |

No se dispone de datos de benchmarks comparativos directos en la información proporcionada para Whisper, Parakeet-tdt ni Distil-Whisper. La comparativa se limita a parámetros, licencia y formato; los valores de WER de los modelos alternativos no están disponibles en la información consultada.

## Limitaciones y advertencias

- Solo soporta inglés; no admite otros idiomas ni detección de idioma.
- No soporta traducción de voz a texto en otros idiomas.
- La API de sesión streaming no está expuesta en transcribe.cpp; el modelo se ejecuta en modo offline en esta implementación, aunque el encoder sea cache-aware.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio con ruido, acentos no nativos o solapamiento de hablantes.
- Sesgos potenciales derivados de los corpus de entrenamiento de NVIDIA, no documentados en la información disponible.
- La licencia NVIDIA Open Model License puede imponer restricciones adicionales para uso comercial; es necesario consultar los términos completos en el enlace oficial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (25 de noviembre de 2026), por lo que no hay evidencia de uso en producción ni validación comunitaria independiente.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg.
- No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/nemotron-speech-streaming-en-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-speech-streaming-en-0.6b.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/12f1076
- Commit del modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/commit/ef3bf40
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper FastConformer (arxiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper relacionado (arxiv:2312.17279): https://arxiv.org/abs/2312.17279
- Rama del checkpoint de enero de 2026: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/nemotron-speech-streaming-jan2026
