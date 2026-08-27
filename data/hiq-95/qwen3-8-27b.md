# HiQ-95/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión-lenguaje) de 27 000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba como parte de la serie Qwen3.8, publicada en agosto de 2026. Se trata de la evolución de Qwen3.5 y Qwen3.6, con mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. El modelo combina un codificador de visión con un núcleo de lenguaje de arquitectura híbrida que alterna capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), lo que permite manejar contextos nativos de 262 144 tokens, extensibles hasta 1 000 000.

Su relevancia actual radica en que ofrece capacidades de nivel frontera en un formato denso y desplegable en hardware local, con licencia Apache 2.0, soporte nativo de imagen y vídeo, y un control flexible del modo de razonamiento (thinking mode) ajustable por petición. Está disponible en formato Transformers y es compatible con vLLM, SGLang y TokenSpeed, lo que facilita su integración en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (se esperan cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | No disponible (el modelo card no especifica; la familia Qwen suele ser multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina dos mecanismos de atención en un layout de 64 capas organizado como 16 bloques repetidos de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La capa Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas para V y 16 para QK (dimensión de cabeza 128), que reduce el coste computacional en contextos largos. La capa Gated Attention es una atención completa con 24 cabezas para Q y 4 para KV (dimensión de cabeza 256) y RoPE de dimensión 64, que proporciona capacidad de recuperación precisa de información. El FFN tiene dimensión intermedia de 17 408. El embedding de tokens es de 248 320 (padded) y la salida LM coincide con esa dimensión.

El modelo fue entrenado en dos etapas (pre-training y post-training) e incorpora Multi-Token Prediction (MTP) con múltiples pasos de entrenamiento, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición del dataset. El componente de visión permite comprender imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (thinking mode) activado por defecto, desactivable por petición y con nivel de esfuerzo ajustable mediante el parámetro `reasoning_effort`.
- Comprensión de imágenes y vídeos de forma nativa, incluyendo diagramas técnicos, documentos escaneados y vídeos de larga duración.
- Ejecución de tareas de agente de larga duración (long-horizon agentic tasks) con planificación autónoma y manejo de feedback del entorno.
- Codificación asistida y generación de código en entornos de terminal, con soporte para herramientas de desarrollo populares.
- Automatización de oficina: procesamiento de documentos, hojas de cálculo y presentaciones con entrada visual y textual.
- Razonamiento matemático y científico, con evaluación en benchmarks como MathVision.
- Retención del contexto de razonamiento en mensajes históricos mediante el parámetro `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo de la comunidad (vLLM, SGLang, TokenSpeed, Transformers).

## Casos de uso

- Agentes autónomos de codificación en terminal: el modelo puede ejecutar tareas de codificación agéntica de múltiples pasos, interpretar errores del entorno y corregir su propio código, gracias a su ventana de contexto de 262 K tokens que permite mantener el historial completo de la sesión.
- Automatización de oficina con entrada visual: procesamiento de documentos escaneados, extracción de datos de tablas e imágenes, y generación de informes a partir de material visual, combinando el codificador de visión con el razonamiento textual.
- Análisis de vídeo de larga duración: comprensión de vídeos de hasta una hora para resúmenes, búsqueda de eventos o extracción de información, aprovechando el contexto extendido y la capacidad multimodal.
- Asistente de investigación STEM: resolución de problemas matemáticos y científicos con razonamiento paso a paso, útil para estudiantes, investigadores y plataformas educativas que necesitan explicaciones detalladas.
- Chat conversacional con control de razonamiento: despliegue de asistentes que pueden alternar entre respuestas rápidas (thinking mode desactivado) y respuestas profundas (thinking mode activado con `reasoning_effort` alto), adaptándose al tipo de consulta.
- Pipeline de generación de código en producción: integración con vLLM o SGLang para servir el modelo como backend de autocompletado o generación de código en IDEs, con soporte de tool calling para interactuar con APIs y repositorios.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero la información proporcionada está incompleta y no contiene los valores numéricos. Los benchmarks mencionados son:

| Benchmark | Categoria | Modelos comparados |
|---|---|---|
| Terminal Bench 2.1 (Terminus) | Codificación agéntica en terminal | Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max |
| MathVision | Razonamiento matemático visual | Qwen3.8-27B y otros (no especificados) |

No se han publicado los resultados numéricos en la información disponible. Se recomienda consultar la model card original en Hugging Face para obtener los valores completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27,78 B parámetros. En FP16 (precisión completa) requiere aproximadamente 56 GB de VRAM. Con cuantización INT8 se reduce a unos 28 GB, y con INT4 a unos 14 GB, aunque estas cuantizaciones no están oficialmente publicadas y dependerán de la comunidad.
- GPU recomendadas: para FP16 se necesitan GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Con cuantización INT8 cabe en una RTX 4090 (24 GB) o RTX 6000 Ada. Con INT4 podría ejecutarse en GPUs de 16 GB como RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También se espera soporte en llama.cpp y Ollama cuando la comunidad publique cuantizaciones GGUF.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y el backend utilizado. La arquitectura híbrida con Gated DeltaNet debería ofrecer ventajas de velocidad en contextos largos frente a modelos puramente basados en atención completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B | 262 K (ext. 1 M) | Apache 2.0 | Denso multimodal | Modelo analizado |
| Qwen3.6-27B | ~27 B | No disponible | Apache 2.0 | Denso multimodal | Versión anterior de la misma familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Modelo de la misma serie, mencionado en benchmarks |
| Muse Glimmer-30B | ~30 B | No disponible | No disponible | No disponible | Alternativa de otro proveedor, mencionada en benchmarks |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Modelo propietario de alto rendimiento, mencionado en benchmarks |

No se dispone de datos suficientes para una comparación cuantitativa rigurosa. La comparativa se limita a los modelos citados en la tabla de benchmarks de la model card.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o comportamientos discriminatorios del modelo. Como todo LLM entrenado con datos web, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos. En tareas de razonamiento complejo o con contexto muy largo, puede producir respuestas plausibles pero incorrectas. Se recomienda verificación humana en aplicaciones críticas.
- Limitaciones de idioma: la model card no especifica los idiomas soportados. Aunque la familia Qwen suele ser multilingüe, no hay garantía de rendimiento uniforme en todos los idiomas.
- Contexto extendido: aunque el modelo soporta hasta 1 M de tokens, el rendimiento en contextos extremadamente largos puede degradarse. Se recomienda validar el comportamiento en el caso de uso específico.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede estar sujeto a políticas de uso aceptable del proveedor (Alibaba). Se recomienda revisar los términos de Qwen Cloud si se utiliza el servicio gestionado.
- El repositorio HiQ-95/Qwen3.8-27B en Hugging Face parece ser un mirror no oficial. Para uso en producción, se recomienda descargar los pesos desde el repositorio oficial de Qwen (Qwen/Qwen3.8-27B).

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio mirror en Hugging Face (HiQ-95): https://huggingface.co/HiQ-95/Qwen3.8-27B
- Repositorio en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guía de despliegue local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Artículo sobre la serie Qwen 3.8: https://singularitymoments.com/qwen-3-8-ai-models/
