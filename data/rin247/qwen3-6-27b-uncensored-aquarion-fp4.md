# Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP4

## Resumen

Este modelo es una cuantización FP4 *weight-only* del modelo `Qwen3.6-27B-Uncensored`, que a su vez es una versión "abliterada" (sin censura) del Qwen3.6-27B de Alibaba. El autor, Rin247, lo ha publicado como parte del proyecto "Genesis of Aquarion forge", que aplica técnicas de abliteración mediante proyección ortogonal de la dirección de rechazo para eliminar las respuestas de negativa del modelo original. El resultado es un modelo de generación de texto que puede desplegarse en hardware con recursos limitados gracias a la cuantización FP4, manteniendo un equilibrio entre tamaño y calidad.

La relevancia actual radica en que permite ejecutar un modelo de la familia Qwen 3.6 (que en su versión densa tiene 27B parámetros) en GPUs de consumo, reduciendo el peso a aproximadamente la mitad del tamaño original. Sin embargo, hay una discrepancia notable: el número de parámetros reportado en los safetensors es de 14.720.720.384 (~14,7B), lo que contradice el nombre del modelo. Esto podría deberse a un error en la extracción de metadatos o a una peculiaridad de la cuantización, pero se indica tal cual aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3.6-27B) |
| Parametros totales | 14.720.720.384 (segun safetensors; el nombre sugiere 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only), con escalas y shapes almacenados |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-27B, un transformer denso de 27B parámetros según la documentación oficial de Qwen 3.6 (que también ofrece una variante MoE de 35B-A3B). Sobre esta base se aplicó una abliteración mediante proyección ortogonal de la dirección de rechazo, un método que identifica y elimina el subespacio del espacio latente responsable de las respuestas de negativa o censura. Posteriormente, el modelo se cuantizó a FP4 *weight-only* usando PyTorch RTN (Round-To-Nearest) en CPU, almacenando las escalas y las formas de los tensores junto a los pesos para permitir la de-cuantización en el motor de inferencia.

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La cuantización no implica reentrenamiento, solo una reducción de precisión de los pesos.

## Capacidades

- Generación de texto conversacional y creativo, sin restricciones de censura gracias a la abliteración.
- Soporte de *tool calling* / *function calling*: no se menciona explícitamente, pero es una capacidad habitual en la familia Qwen 3.6; no se puede confirmar con la información disponible.
- Capacidades multilingües: no disponibles en la ficha.
- No se indica soporte de visión, audio u otras modalidades.
- No se menciona *thinking mode* ni *multi-step reasoning* específico, aunque el modelo base podría tenerlo.

## Casos de uso

- Despliegue en entornos con VRAM limitada: al ser FP4 *weight-only*, el modelo ocupa aproximadamente la mitad que su versión FP16, lo que permite ejecutarlo en GPUs de consumo como RTX 3090 o RTX 4090 con 16-24 GB de VRAM, dependiendo del overhead de inferencia.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones, diálogos o cualquier texto donde se requiera evitar respuestas evasivas o moralizantes.
- Investigación sobre alineación y censura: permite estudiar el comportamiento de un modelo abliterado frente a su versión original, comparando respuestas a prompts sensibles.
- Prototipado rápido de asistentes conversacionales: gracias a su tamaño reducido, puede integrarse en pipelines de desarrollo con frameworks como vLLM o llama.cpp para pruebas locales.
- Fine-tuning posterior: aunque ya está cuantizado, se puede usar como punto de partida para experimentos de adaptación a dominios específicos, siempre que se respete la licencia (que no está disponible).
- Evaluación de calidad de cuantización: sirve como referencia para comparar la degradación de rendimiento entre FP4, FP8 y la versión original, útil para decidir el formato óptimo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo cuantizado. Tampoco se proporcionan comparativas con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. El tamaño del repositorio es de 18,8 GB, pero los pesos FP4 de 14,7B parámetros ocuparían aproximadamente 7,4 GB (14,7B × 0,5 bytes), más overhead de escalas y buffers. Con un contexto moderado, podría caber en una GPU de 12 GB, aunque se recomienda 16 GB para mayor margen.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o superiores. En consumer, una RTX 3060 de 12 GB podría ser suficiente si se limita el contexto.
- Opciones de despliegue: al ser safetensors con recetas *weight-only* personalizadas, requiere de-cuantización antes de la inferencia. Se puede usar con transformers (cargando los pesos y aplicando las escalas), o convertir a GGUF para llama.cpp/Ollama si se dispone de las herramientas adecuadas. vLLM y TGI pueden soportarlo si se implementa la lógica de de-cuantización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP4 | 14,7B (reportado) | no disponible | FP4 weight-only | no disponible | Abliterado, safetensors |
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8 | no disponible | no disponible | FP8 weight-only | no disponible | Misma familia, mayor precisión |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 | no disponible | no disponible | FP4 (MLX) | no disponible | Incluye MTP (multi-token prediction) con drafter de 821 MB, throughput 1,78× |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible | FP16/BF16 | Apache 2.0 (probable) | Modelo original, con censura |

La comparativa se basa en los datos disponibles; faltan especificaciones clave de los modelos alternativos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución. Es imprescindible contactar con el autor antes de cualquier uso productivo.
- La cuantización FP4 puede degradar la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, en comparación con FP16 o FP8.
- La abliteración elimina la censura, lo que puede generar contenido inapropiado, ofensivo o peligroso. El modelo no tiene salvaguardas de seguridad.
- El número de parámetros reportado (14,7B) no coincide con el nombre del modelo (27B), lo que sugiere un posible error en los metadatos. Esto puede afectar a la compatibilidad con herramientas que esperan un tamaño específico.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están documentados; el modelo base Qwen 3.6 es multilingüe, pero no se confirma en esta versión.
- La de-cuantización requiere buffers adicionales (`*.weight_scale`, `*.weight_shape`), lo que complica la integración con motores de inferencia estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP4
- Versión FP8 del mismo autor: https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8
- Modelo similar de AEON-7 (MLX FP4 con MTP): https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Catálogo de modelos abliterados: https://abliteration.org/
- Repositorio GitHub de AEON-7 (modelo Ultimate Uncensored): https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/
- Guía de Qwen 3.6 (27B dense vs 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
