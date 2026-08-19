# coder3101/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es una versión modificada del modelo Qwen3.8-27B de Alibaba, creada por el usuario coder3101 mediante la técnica de abliteration implementada en la herramienta Heretic v1.2.0. El objetivo de esta modificación es eliminar los mecanismos de rechazo y censura del modelo original, dando lugar a una variante "desensurada" que responde a un mayor rango de solicitudes, incluidas aquellas que el modelo base rechazaría por políticas de seguridad.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal denso de 27 000 millones de parámetros con encoder de visión integrado, capaz de procesar imágenes y vídeo. Emplea una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention (atención completa), alcanza una longitud de contexto nativa de 262 144 tokens ampliable hasta 1 000 000, e incorpora entrenamiento con predicción multi-token (MTP). La versión heretic conserva todas las capacidades del original, pero con una tasa de rechazos reducida de 92/100 a 33/100, según los datos publicados por el autor.

La relevancia de este modelo radica en su utilidad para desarrolladores e investigadores que necesitan un modelo de visión-lenguaje de alto rendimiento sin restricciones de contenido, por ejemplo para tareas de generación creativa, investigación académica o desarrollo de agentes autónomos en entornos controlados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (la model card no especifica el listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida que intercala bloques de atención lineal y atención completa. La configuración de capas sigue el patrón `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, es decir, por cada 16 bloques, 3 utilizan Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y 1 utiliza Gated Attention (atención completa con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y RoPE de 64 dimensiones). La dimensión oculta es 5120, con 64 capas y un embedding de tokens de 248 320 (padded). El modelo incorpora predicción multi-token (MTP) entrenada con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento del modelo original incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con refuerzo a través de técnicas de alineación no especificadas en detalle. La versión heretic se obtiene aplicando abliteration, un método que identifica la dirección en el espacio de activaciones asociada al comportamiento de rechazo y la elimina mediante ajustes en los pesos de las proyecciones de atención y MLP. Los parámetros de abliteration publicados incluyen un `direction_index` de 34,41 y ajustes en `attn.o_proj` y `mlp.down_proj`. El proceso es reproducible, ya que el autor incluye un directorio `reproduce` con las instrucciones.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activado por defecto y desactivable por solicitud.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento multi-paso y planificación autónoma para tareas de agente, con manejo de retroalimentación del entorno.
- Soporte de tool calling y function calling, integrable en pipelines de automatización.
- Control flexible del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`, y conservación del contexto de razonamiento histórico con `preserve_thinking`.
- Capacidades multilingües (idiomas no especificados en la documentación disponible).
- Al estar basado en Qwen3.8-27B, hereda las capacidades de codificación, trabajo profesional e investigación del modelo original, con la diferencia de que la versión heretic no rechaza solicitudes que el original consideraría inapropiadas.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y guionistas pueden utilizar el modelo para producir narrativas, diálogos o escenas que aborden temas sensibles o controvertidos sin que el modelo se niegue a responder, gracias a la reducción de rechazos de 92/100 a 33/100.
- Investigación en seguridad y alineación de IA: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para analizar sesgos, riesgos de contenido dañino y estrategias de mitigación, comparando las respuestas con el modelo original.
- Desarrollo de agentes autónomos para entornos simulados: el modelo puede planificar y ejecutar tareas multi-paso en entornos virtuales (por ejemplo, OSWorld) donde se requiere interacción con herramientas y manejo de errores, gracias a su contexto largo de 262K tokens y su capacidad de razonamiento.
- Asistencia en programación avanzada: con soporte de tool calling y un rendimiento destacado en benchmarks de codificación (DeepSWE 42.2 en el modelo original), puede integrarse en entornos de desarrollo para generar, revisar y depurar código en repositorios complejos.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, gráficos y documentos escaneados, combinada con razonamiento matemático para tareas de investigación.
- Automatización de atención al cliente con manejo de conversaciones largas: la ventana de contexto de 262K tokens permite mantener historiales extensos de interacción, y el modo de pensamiento puede activarse para resolver consultas complejas antes de responder.

## Benchmarks y rendimiento

La model card del autor solo publica métricas de la modificación heretic frente al original:

| Metrica | Modelo heretic | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0187 | 0 (por definicion) |
| Tasa de rechazos | 33/100 | 92/100 |

No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.) para la versión heretic. Los datos de rendimiento del modelo original Qwen3.8-27B, obtenidos de fuentes externas, incluyen DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estos valores corresponden al modelo base sin modificar y no deben atribuirse a la versión heretic sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (formato safetensors del repositorio), se necesitan aproximadamente 55 GB de VRAM. Con cuantización INT8, unos 28 GB; con INT4, unos 14 GB. No se proporcionan archivos GGUF en el repositorio, por lo que la cuantización debe realizarse manualmente.
- GPU recomendadas: para FP16 se requieren GPUs de clase profesional como A100 (80 GB), H100 (80 GB) o A6000 (48 GB). Con cuantización INT4, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB).
- El blog de AMD confirma soporte día 0 en procesadores AMD Ryzen AI Max y GPUs Radeon mediante LM Studio, lo que permite ejecución local en hardware AMD.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card del modelo original. También puede ejecutarse en plataformas como LM Studio y Jetson AI Lab.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 27B con atención híbrida, se espera un throughput moderado en GPUs de alta gama, pero no hay cifras publicadas.

## Comparativa con modelos similares

La comparación se realiza con el modelo original y con la generación anterior de Qwen, según los datos disponibles en la model card (la tabla de benchmarks del modelo original está incompleta en la información proporcionada).

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic | 27,36 B | 262K (ext. 1M) | Hibrida (DeltaNet + Attention) | Apache 2.0 | Version desensurada, tasa de rechazo 33/100 |
| Qwen3.8-27B (original) | 27,36 B | 262K (ext. 1M) | Hibrida (DeltaNet + Attention) | Apache 2.0 | Modelo base, tasa de rechazo 92/100 |
| Qwen3.6-27B | 27 B (aprox.) | No disponible | No disponible | Apache 2.0 | Generacion anterior, mencionado en benchmarks del original |

No se dispone de datos suficientes para comparar con otros modelos de 27B como Gemma 2 27B o Llama 3.3 70B, ya que la información proporcionada no incluye métricas comparativas de esos modelos.

## Limitaciones y advertencias

- La eliminación de rechazos mediante abliteration reduce la seguridad del modelo: puede generar contenido dañino, ilegal o éticamente problemático si se le solicita. No debe desplegarse en entornos de producción sin supervisión humana y filtros adicionales.
- La divergencia KL de 0,0187 respecto al original indica que las respuestas difieren ligeramente en distribución, pero no garantiza que el comportamiento sea idéntico en todos los casos; pueden aparecer respuestas inesperadas en dominios sensibles.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en tareas de razonamiento largo o con contexto extenso.
- No se han publicado benchmarks de tareas estándar para la versión heretic, por lo que su rendimiento real en codificación, matemáticas o razonamiento no está verificado de forma independiente.
- Los idiomas soportados no están documentados en la model card; se asume herencia del modelo original, pero no hay confirmación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado. El usuario asume la responsabilidad de su uso.
- El repositorio no incluye archivos cuantizados (GGUF, AWQ, etc.), por lo que el despliegue en hardware limitado requiere un paso adicional de cuantización.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/coder3101/Qwen3.8-27B-heretic
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía para principiantes (dev.to): https://dev.to/aimodels-fyi/a-beginners-guide-to-the-qwen38-27b-model-by-qwen-on-huggingface-11j9
- Guía completa (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Página de Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
