# cudabenchmarktest/Qwen3.8-27B-E03-Obliterated-Omni-GGUF

## Resumen

Este repositorio aloja un sidecar GGUF personalizado para Ollama que integra tres modelos base de la familia Qwen: Qwen3.8-27B-E03-Obliterated (generación de lenguaje, pensamiento estructurado, herramientas y proyector de visión), Qwen3-Omni-30B-A3B-Instruct (comprensión de audio, imagen y video muestreado) y Qwen3-TTS-12Hz-1.7B-Base (síntesis de voz a 24 kHz). No se trata de un modelo independiente, sino de un contenedor multigraph que orquesta semánticamente grafos ejecutables separados, sin fusionar tensores incompatibles. El archivo GGUF, de 38,8 GB en cuantización Q4_K_M, contiene seis vistas namespaced de modelos y proyectores, y requiere un adaptador específico (Robit Omni Adapter) para activar las capacidades de audio, video y TTS. Su relevancia radica en ofrecer un único tag de Ollama que agrupa funcionalidades que normalmente exigirían desplegar varios modelos por separado, aunque con la salvedad de que no es un GGUF estándar y necesita una infraestructura adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor multigraph con seis vistas: Qwen3.8-27B (dense transformer multimodal), Qwen3-Omni-30B-A3B (MoE), Qwen3-TTS-12Hz-1.7B (TTS) |
| Parametros totales | No disponible para el conjunto; modelos base: 27B (Qwen3.8), 30B (Qwen3-Omni), 1.7B (Qwen3-TTS) |
| Parametros activos | 3B (solo en el componente Qwen3-Omni, por ser MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (contenedor personalizado `robit-namespaced-multigraph-gguf-v1`) |

## Arquitectura y entrenamiento

El archivo `qwen3.8-27b-e03-obliterated-omni-q4km.gguf` es un GGUF contiguo y válido que contiene seis vistas namespaced de modelos y proyectores, pero no sigue una arquitectura GGUF estándar. No se trata de un tensor-splice de estados ocultos incompatibles, sino de una orquestación semántica entre grafos independientes. El adaptador Robit Omni Adapter resuelve la capa personalizada (`application/vnd.robit.ollama.omni.bundle.v1+gguf`) desde el tag instalado, materializa vistas runtime desechables y enruta las tareas de audio/video y TTS. Los modelos base no han sido reentrenados conjuntamente; cada componente conserva su arquitectura original: Qwen3.8-27B es un transformer denso multimodal, Qwen3-Omni-30B-A3B es un MoE con 3B activos, y Qwen3-TTS-12Hz-1.7B es un modelo de síntesis de voz. El adaptador se apoya en workers de llama.cpp con reservas CUDA scoped, y el protocolo de comunicación es turn-based, sin soporte de streaming.

## Capacidades

- Generación de texto, razonamiento y pensamiento estructurado (parsed thinking) mediante el componente Qwen3.8-27B.
- Tool calling y function calling estructurado, validado con el ejemplo `get_weather(location=Seattle)`.
- Comprensión de imágenes a través del proyector de visión de Qwen3.8-27B.
- Comprensión de audio y transcripción automática del habla (ASR) mediante Qwen3-Omni, con entrada de audio PCM16 mono a 16 kHz.
- Comprensión de video muestreado (frames extraídos de MP4/WebM) con pista de audio opcional, a través de Qwen3-Omni.
- Síntesis de voz (TTS) a 24 kHz mono PCM16 mediante Qwen3-TTS, con salida en WAV codificada en base64.
- Enrutamiento entre modalidades: por ejemplo, imagen a lenguaje (Qwen3-Omni → Qwen3.8) para descripciones o respuestas textuales.

## Casos de uso

- Transcripción de audio en producción: el adaptador acepta archivos WAV PCM16 mono a 16 kHz y devuelve transcripciones exactas, útil para sistemas de subtitulado o análisis de llamadas.
- Descripción de video para accesibilidad: se pueden procesar archivos MP4 o WebM extrayendo frames a 2 fps (máximo 96) junto con la pista de audio, generando descripciones textuales de eventos visuales y sonoros.
- Asistente de voz conversacional: combinando ASR, comprensión de lenguaje y TTS, se puede construir un agente que escuche, razone y responda por voz, todo desde un único tag de Ollama.
- Automatización de oficina con herramientas: el componente Qwen3.8-27B soporta tool calling, permitiendo integrar el modelo en flujos de trabajo que consultan APIs, bases de datos o ejecutan acciones estructuradas.
- Generación de contenido multimodal: el modelo puede describir imágenes, transcribir audio y sintetizar voz, lo que facilita pipelines de creación de contenido accesible (descripciones de imágenes, doblaje automático, etc.).
- Evaluación de agentes multimodales: al combinar visión, audio y lenguaje en un solo despliegue, sirve como banco de pruebas para investigar interacciones entre modalidades en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este sidecar en la información disponible. El modelo base Qwen3.8-27B cuenta con evaluaciones en MathVision (con prompt fijo de razonamiento paso a paso) y una puntuación agregada de 72,7/100 en BenchLM.ai (puesto 16 de 228 modelos), pero estos datos no son directamente extrapolables al contenedor Omni, que añade componentes adicionales y un adaptador de orquestación.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 38,8 GB, por lo que se necesita al menos 40 GB de VRAM para cargarlo completo en GPU.
- GPU recomendadas: A100 40GB, H100 80GB, o GPUs de doble socket con 48 GB o más. Una RTX 4090 (24 GB) no es suficiente para el archivo completo.
- Opciones de despliegue: Ollama con el adaptador Robit Omni Adapter, workers de llama.cpp (revisión `458681e1d5d4a29a1463c4732e03226cf384b997`), y el adaptador expone una API extendida sobre `POST /api/chat`.
- Latencia y throughput: no disponibles; la validación del release reporta tiempos de TTS de 3,28 s y 3,60 s para dos generaciones de voz, pero no hay métricas de rendimiento generales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-E03-Obliterated-Omni (este) | 27B + 30B (MoE) + 1.7B | No disponible | Texto, imagen, audio, video, TTS | Apache 2.0 | GGUF personalizado |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30B (3B activos) | No disponible | Texto, imagen, audio, video | Apache 2.0 | Pesos originales |
| Qwen/Qwen3.8-27B | 27B | No disponible | Texto, imagen | Apache 2.0 | Pesos originales, FP8 |

La comparativa se limita a los modelos base porque no hay alternativas directas de sidecars multimodales GGUF con orquestación semántica en el ecosistema Ollama. El valor diferencial de este sidecar es la integración de TTS y comprensión de video en un solo tag, algo que los modelos base no ofrecen de forma nativa.

## Limitaciones y advertencias

- No es un GGUF estándar: no puede usarse como `FROM` en un Modelfile de Ollama sin el adaptador Robit Omni Adapter.
- Solo soporta inglés; no hay evidencia de capacidades multilingües en la información proporcionada.
- El adaptador es turn-based y requiere `"stream": false`; no hay soporte de streaming en la versión v1.
- Los workers de medios requieren reservas CUDA scoped y deben detenerse y liberarse tras la validación; no es un despliegue trivial.
- No hay datos sobre sesgos, alucinación o robustez del conjunto; al ser una orquestación de modelos independientes, los riesgos de cada componente se mantienen.
- El archivo sidecar debe verificarse contra el hash SHA-256 (`3270f146bae9499b2e40ad230cceeccfc9caa018740c75cfc1856c1abda6ff78`) para garantizar integridad.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador y el protocolo asociado tienen su propia documentación y posibles restricciones adicionales no detalladas aquí.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cudabenchmarktest/Qwen3.8-27B-E03-Obliterated-Omni-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de benchmarks BenchLM: https://benchlm.ai/models/qwen3-8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación del adaptador (overview): https://github.com/robit-man/fine_tuning_suite/tree/main/docs/omni-adapter
- Ejemplos ejecutables: https://github.com/robit-man/fine_tuning_suite/tree/main/examples/omni_adapter
- Protocolo wire: https://github.com/robit-man/fine_tuning_suite/blob/main/docs/omni-adapter/protocol.md
- Guía de runtime: https://github.com/robit-man/fine_tuning_suite/blob/main/docs/omni-adapter/runtime.md
- Registro de release exacto: https://github.com/robit-man/fine_tuning_suite/blob/main/docs/omni-adapter/qwen38-27b-e03-release.md
