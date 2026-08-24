# FokusDK/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Se trata de la última generación de la familia Qwen3.8, que incorpora un encoder de visión nativo para comprender imágenes y vídeo, además de un control flexible del razonamiento (modo pensamiento conmutable). Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes autónomos de larga duración, con una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000.

La versión GGUF publicada por FokusDK utiliza la tecnología Unsloth Dynamic 3.0 para la cuantización, lo que según sus creadores mejora la precisión frente a otras cuantizaciones del mismo tamaño. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en herramientas de desarrollo. Su combinación de tamaño compacto, multimodalidad y razonamiento controlable lo hace relevante para equipos que buscan desplegar un LLM capaz en hardware local o en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 3.0; se documentan cuantizaciones Q2-Q8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). El layout se organiza en bloques de 16 repeticiones de la secuencia: 3 × (Gated DeltaNet → FFN) seguidos de 1 × (Gated Attention → FFN). Esto reduce el coste computacional manteniendo la capacidad de capturar dependencias de largo alcance. La dimensión oculta es de 5120, con 64 capas y una dimensión intermedia de FFN de 17 408. Además, el modelo incorpora Multi-Token Prediction (MTP), lo que mejora la eficiencia de la decodificación.

El entrenamiento se realizó en dos etapas (pre-training y post-training), aunque no se han publicado datos sobre el tamaño del dataset ni los tokens utilizados. La model card indica que se aplicaron técnicas de post-entrenamiento para mejorar el razonamiento y el comportamiento agéntico, incluyendo un modo de pensamiento (thinking mode) activado por defecto y un modo instruct (sin pensamiento) para respuestas directas. El modelo también es multimodal: procesa imágenes y vídeo de forma nativa, lo que amplía su campo de aplicación a documentos, diagramas y vídeos de larga duración.

## Capacidades

- Generación de texto, razonamiento complejo y matemáticas, con mejora en codificación y trabajo profesional.
- Comprensión multimodal nativa: procesa imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Control flexible del razonamiento: el modo de pensamiento se puede activar o desactivar por petición, y la profundidad del razonamiento se ajusta mediante el parámetro `reasoning_effort`.
- Soporte de tool calling / function calling mejorado, incluyendo el manejo de objetos anidados para facilitar la integración con agentes.
- Capacidades de agente autónomo: planificación de tareas de largo horizonte y manejo de feedback del entorno.
- Soporte multilingüe (aunque no se detallan idiomas concretos en la información disponible).
- Compatibilidad con entornos de desarrollo populares y herramientas de despliegue (endpoints compatibles).

## Casos de uso

- Atención al cliente automatizada: la ventana de contexto de 262 144 tokens permite gestionar conversaciones multi-turno con historial extenso, manteniendo el contexto relevante durante toda la interacción.
- Generación de código en producción: con soporte de tool calling y razonamiento mejorado, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y refactorización.
- Análisis de documentos y extracción de información: la visión nativa permite procesar documentos escaneados, diagramas técnicos y capturas de pantalla, extrayendo datos estructurados.
- Agentes autónomos de oficina: automatización de tareas como gestión de correos, creación de informes y coordinación de calendarios, gracias a su capacidad de planificación y manejo de feedback.
- Asistente de investigación en STEM: razonamiento matemático y comprensión de figuras y gráficos científicos para apoyo en análisis de resultados.
- Despliegue en hardware local: la cuantización GGUF permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, ideal para entornos de desarrollo o uso privado sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo ha sido evaluado en tareas como MathVision, pero no se proporcionan puntuaciones numéricas. No se pueden reportar datos de rendimiento comparativo sin fuente fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 27B en FP16 pesa aproximadamente 54 GB; con cuantizaciones GGUF, una Q4_K_M suele ocupar unos 16-18 GB y una Q8 unos 32 GB. No se dispone de cifras exactas para este repo concreto.
- GPUs recomendadas: para cuantizaciones Q4, una GPU con 24 GB de VRAM (RTX 4090, A5000, etc.) es suficiente; para cuantizaciones más altas o contexto extendido se recomiendan GPUs profesionales como A100 (40/80 GB) o H100.
- En consumer GPU: sí, es viable en tarjetas de 24 GB con cuantización Q4 o inferior, aunque el contexto máximo puede reducirse.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (el repo está marcado como `endpoints_compatible`).
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262 144 | Sí (imagen/vídeo) | Apache 2.0 |
| Qwen2.5-27B | 27B | 131 072 | No (solo texto) | Apache 2.0 |
| Qwen3.5-27B | 27B | No disponible | No disponible | Apache 2.0 |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se basa únicamente en parámetros técnicos y capacidades declaradas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones específicos para este modelo; como todo LLM, puede generar información incorrecta o no veraz.
- El contexto extendido de 1M tokens es experimental y puede degradar el rendimiento en la práctica; se recomienda validar con casos de uso reales.
- La cuantización GGUF, aunque optimizada con Unsloth Dynamic 3.0, introduce una pérdida de precisión respecto al modelo original en FP16.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la política de uso de la familia Qwen en la documentación oficial de Alibaba.
- El repo de HuggingFace no especifica los idiomas soportados de forma explícita; se recomienda probar el modelo en los idiomas de interés.
- El tamaño del repositorio (1053.7 GB) parece anormalmente grande para una colección de GGUF, por lo que se recomienda verificar los archivos antes de la descarga.

## Enlaces

- Repo de HuggingFace de FokusDK: https://huggingface.co/FokusDK/Qwen3.8-27B-GGUF
- Repo oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo de Unsloth GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- GitHub de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis de cuantizaciones: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Guía de despliegue local: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
