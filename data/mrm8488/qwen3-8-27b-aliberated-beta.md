# mrm8488/Qwen3.8-27B-aliberated-beta

## Resumen

El modelo `mrm8488/Qwen3.8-27B-aliberated-beta` es una versión modificada del modelo Qwen3.8-27B de Alibaba, creada mediante la técnica de *abliteration* (también conocida como *decensoring* o *uncensoring*). El autor, mrm8488, ha utilizado la herramienta Heretic v1.4.0 para eliminar los rechazos (refusals) del modelo original, reduciendo la tasa de rechazo de 89/100 a 15/100, manteniendo una divergencia KL de 0.0246 respecto al modelo base, lo que indica que la modificación altera mínimamente el comportamiento general.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, de 27 mil millones de parámetros, con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention, y soporta contexto nativo de 262 144 tokens, extensible hasta 1 000 000. Esta versión aliberated conserva todas las capacidades del original, pero con una política de rechazo mucho más permisiva, lo que la hace relevante para casos de uso donde se requiere generación sin restricciones temáticas, como investigación de seguridad, análisis de contenido o aplicaciones creativas.

La relevancia actual radica en la creciente demanda de modelos abiertos sin censura para tareas de investigación y desarrollo, así como en la madurez de las técnicas de abliteration que permiten ajustar el comportamiento de rechazo sin degradar significativamente el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). La configuración interna incluye 64 capas, con una disposición de 16 bloques de `3 × (Gated DeltaNet → FFN)` seguidos de `1 × (Gated Attention → FFN)`. El Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17 408. Además, incorpora un encoder de visión para procesar imágenes y vídeos, y un mecanismo de Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El proceso de abliteration aplicado por mrm8488 utiliza Heretic v1.4.0, que identifica una dirección en el espacio de activaciones del modelo asociada con el comportamiento de rechazo y la elimina de las proyecciones de salida de atención (`attn.o_proj`) y de las proyecciones de la MLP (`mlp.down_proj`). Los parámetros de abliteration reportados (direction_index 33.72, max_weight 1.49, etc.) indican la magnitud y posición de los ajustes. El resultado es una reducción drástica de los rechazos (de 89/100 a 15/100) con una divergencia KL de 0.0246, lo que sugiere que la modificación es quirúrgica y no altera sustancialmente las capacidades generales del modelo.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B está diseñado para tareas complejas de codificación, trabajo profesional, investigación y razonamiento multi-paso.
- Comprensión de visión y lenguaje: soporta entrada de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del pensamiento: el modo de pensamiento está activado por defecto y puede desactivarse por petición; la profundidad del razonamiento se puede ajustar con `reasoning_effort` y se conserva el contexto de razonamiento histórico mediante `preserve_thinking`.
- Ejecución de agentes: el modelo base presenta una planificación autónoma mejorada y manejo de retroalimentación del entorno, lo que permite tareas de agente de largo horizonte.
- Compatibilidad con herramientas: aunque no se detalla explícitamente en la model card, el modelo base es compatible con vLLM, SGLang y TokenSpeed, y se espera que soporte tool calling al ser un modelo de la familia Qwen3.8.
- Comportamiento decensored: la versión aliberated reduce significativamente los rechazos, permitiendo generar contenido que el modelo original rechazaría.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar los mecanismos de rechazo y los sesgos de los modelos de lenguaje, ya que al eliminar los rechazos se puede analizar qué contenido generaría el modelo sin restricciones.
- Generación creativa sin restricciones: escritores y creadores de contenido pueden utilizar el modelo para explorar temas sensibles o controvertidos sin que el sistema se niegue a responder, manteniendo la calidad del texto.
- Análisis de contenido y moderación: al comparar las respuestas del modelo aliberated con las del original, se pueden identificar patrones de censura y desarrollar mejores sistemas de moderación.
- Desarrollo de agentes conversacionales especializados: en dominios como la educación sexual, la salud mental o la asesoría legal, donde el modelo original podría rechazar ciertas preguntas, esta versión permite respuestas más completas.
- Evaluación de robustez: los investigadores pueden probar la solidez del modelo ante prompts adversariales o de jailbreak, ya que la abliteration reduce la resistencia a estos ataques.
- Fine-tuning posterior: al ser una versión con pesos abiertos y licencia Apache-2.0, se puede utilizar como punto de partida para fine-tuning en tareas específicas sin las restricciones de rechazo del modelo original.

## Benchmarks y rendimiento

La model card del autor solo proporciona dos métricas comparativas entre el modelo aliberated y el original:

| Metrica | Modelo aliberated | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0.0246 | 0 (por definicion) |
| Rechazos (refusals) | 15/100 | 89/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión aliberated. Dado que la divergencia KL es muy baja, se espera que el rendimiento en tareas generales sea prácticamente idéntico al del modelo base, pero no hay datos numéricos disponibles en la información proporcionada.

## Requisitos de hardware

- El tamaño del repositorio es de 54.8 GB, lo que corresponde a pesos en fp16 (aproximadamente 27B × 2 bytes). Para inferencia en fp16 se necesitan al menos 56 GB de VRAM (considerando overhead), por lo que se requiere una GPU profesional como A100 80GB, H100 80GB o similar.
- Con cuantización a 4 bits (no disponible en el repositorio, pero posible mediante herramientas externas como llama.cpp o GPTQ), el modelo podría caber en GPUs de consumo con 24 GB de VRAM, como la RTX 4090 o RTX 3090.
- Opciones de despliegue: al ser un modelo de la familia Qwen3.8, es compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También se puede usar con llama.cpp u Ollama si se generan los GGUF correspondientes.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 27B en fp16, se puede estimar un throughput de decodificación de aproximadamente 20-40 tokens/s en una A100, dependiendo de la configuración.

## Comparativa con modelos similares

La comparación más directa es con el modelo original Qwen3.8-27B, del cual deriva. También se puede comparar con otros modelos de la misma familia (Qwen3.6-27B, Qwen3.7-Plus) mencionados en la model card, aunque no se dispone de datos de rendimiento para esta versión aliberated.

| Modelo | Parametros | Contexto | Licencia | Rechazos | Divergencia KL |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K (1M ext.) | Apache-2.0 | 89/100 | 0 |
| Qwen3.8-27B-aliberated-beta | 27B | 262K (1M ext.) | Apache-2.0 | 15/100 | 0.0246 |
| Qwen3.6-27B | 27B | no disponible | Apache-2.0 | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos aliberated de tamaño similar para una comparación más amplia.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos, pero no elimina los sesgos subyacentes del modelo. El contenido generado puede reflejar prejuicios presentes en los datos de entrenamiento.
- Al reducir los rechazos, el modelo puede generar contenido ofensivo, peligroso o ilegal si se le solicita. No debe utilizarse en aplicaciones de producción sin una capa de moderación adicional.
- La divergencia KL de 0.0246 indica que el comportamiento general es muy similar al original, pero no se han evaluado exhaustivamente los efectos en tareas específicas de razonamiento o seguridad.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir con las regulaciones locales.
- No se proporcionan datos sobre idiomas soportados; se asume que hereda los del modelo base, pero no está confirmado.
- El modelo no incluye cuantizaciones oficiales; los usuarios deben generarlas o utilizar herramientas externas, lo que puede afectar al rendimiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una versión beta reciente y no ha sido ampliamente validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrm8488/Qwen3.8-27B-aliberated-beta
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-27b
