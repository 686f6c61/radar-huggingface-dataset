# Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-GGUF

## Resumen

Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-GGUF es un ajuste fino mediante LoRA (rank 32) del modelo base Qwen/Qwen3.5-0.8B, especializado en extracción de filtros estructurados a partir de consultas de búsqueda de comercio electrónico. El modelo recibe una consulta en lenguaje natural y un esquema JSON (con tipos y claves obligatorias) y devuelve un único objeto JSON válido con los valores extraídos, usando `null` para campos escalares no presentes. Está pensado para integrarse en pipelines de búsqueda y filtrado de catálogos, donde se necesita convertir texto libre en parámetros estructurados de forma fiable.

El modelo se distribuye únicamente en formato GGUF con cinco niveles de cuantización (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M), pensado para su uso con llama.cpp y herramientas compatibles. Tiene aproximadamente 752 millones de parámetros, lo que lo hace apto para entornos con recursos limitados, incluida CPU y GPUs de consumo. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. La evaluación publicada se centra en la adherencia estricta al esquema y a la validez del JSON, más que en capacidades generales de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B; detalles no especificados) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se ajusta con LoRA de rango 32 sobre un dataset propio de extracción de consultas de e-commerce (`Ionio-ai/ecommerce-search-extraction`). El entrenamiento utilizó dos épocas, una programación de tasa de aprendizaje coseno y pérdida únicamente sobre las respuestas del asistente (assistant-only loss). La conversión a GGUF se realizó con la opción `--no-mtp`, por lo que el modelo resultante es exclusivamente de texto y no incluye predicción multitoken.

No se publican detalles sobre la composición del dataset de entrenamiento (número de tokens, distribución de esquemas, etc.). La inferencia requiere un formato de prompt muy concreto: un mensaje de sistema fijo que instruye al modelo a devolver solo JSON válido, y un mensaje de usuario que contiene la consulta y el esquema JSON compacto. Se recomienda desactivar el razonamiento (thinking) y usar temperatura 0, top_p 1 y un límite de 4096 tokens de salida. No se debe usar el campo `meta_prompt` del dataset.

## Capacidades

- Extracción de atributos estructurados (producto, marca, color, precio máximo, etc.) a partir de consultas de búsqueda en e-commerce.
- Generación de JSON estrictamente válido que cumple con un esquema JSON proporcionado en el prompt (claves obligatorias, tipos, anidamiento, sin claves extra).
- Manejo de valores ausentes mediante `null` JSON para campos escalares obligatorios.
- Adherencia a la ortografía y capitalización exacta de las claves del esquema.
- Salida sin marcas de código, comentarios ni texto adicional (solo el objeto JSON).
- Compatible con el chat template del modelo base Qwen3.5, con razonamiento desactivado.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un modelo de propósito general; su uso está restringido a la tarea de extracción condicionada por esquema.

## Casos de uso

- Filtrado de catálogo en tiendas online: convertir consultas como "zapatillas Nike rojas por menos de 100 euros" en filtros estructurados (`brand`, `color`, `price_max`) para pasarlos a un motor de búsqueda o base de datos.
- Normalización de consultas de búsqueda interna: unificar la representación de atributos a partir de texto libre, reduciendo la dependencia de reglas heurísticas o expresiones regulares.
- Asistentes de compra por chat: extraer intenciones de filtrado en conversaciones multi-turno y alimentar APIs de recomendación o búsqueda.
- Enriquecimiento de logs de búsqueda: procesar históricos de consultas de usuarios para extraer atributos y mejorar análisis de demanda o personalización.
- Integración en pipelines de datos: ejecutar el modelo en lotes sobre consultas de e-commerce para generar datasets etiquetados o limpiar datos existentes.
- Automatización de pruebas de motores de búsqueda: generar consultas estructuradas de forma controlada para validar resultados de ranking y filtrado.

## Benchmarks y rendimiento

La model card incluye una evaluación sobre un split fijo de 1.095 ejemplos, con el mismo prompt y configuración de inferencia (llama.cpp CUDA, 64 peticiones concurrentes, temperatura 0, 4096 tokens máximos). Los resultados por cuantización son los siguientes:

| Cuantizacion | Tamano (MiB) | JSON estricto | Valido segun esquema | Exacto | Leaf F1 | Key F1 | Precision de null | Truncados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 774,2 | 99,91% | 99,73% | 30,96% | 88,49% | 99,46% | 99,82% | 1 |
| Q6_K | 600,6 | 100,00% | 99,91% | 29,95% | 88,56% | 99,57% | 99,82% | 0 |
| Q5_K_M | 551,2 | 99,91% | 99,73% | 30,32% | 88,35% | 99,38% | 99,73% | 0 |
| Q4_K_M | 504,8 | 99,82% | 99,45% | 29,41% | 88,04% | 99,33% | 99,63% | 1 |
| Q3_K_M | 444,6 | 95,53% | 94,16% | 23,93% | 82,17% | 94,62% | 95,05% | 17 |
| Referencia BF16 fusionado | — | 99,91% | 99,73% | 30,32% | 88,52% | — | — | — |

La métrica "Exacto" es deliberadamente estricta (igualdad exacta con el JSON de referencia, incluyendo mayúsculas y orden de arrays). La cuantización Q3_K_M degrada notablemente la adherencia al esquema y la validez del JSON, por lo que no se recomienda para producción. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: ~0,75 mil millones de parámetros. Las cuantizaciones GGUF ocupan entre 445 MiB (Q3_K_M) y 774 MiB (Q8_0), por lo que caben holgadamente en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con soporte CUDA (p. ej. RTX 3060, RTX 4090) o incluso integradas con suficiente VRAM. También puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (CLI o servidor), llama-cpp-python, Ollama (si se importa el GGUF), y cualquier framework que soporte GGUF. No se menciona compatibilidad con vLLM o TGI en la documentación.
- Latencia y throughput: no se proporcionan datos aislados. La evaluación usó 64 peticiones concurrentes en CUDA, pero el tiempo de pared depende de la carga y no se reporta como benchmark de velocidad.
- Para uso en producción se recomienda usar al menos Q6_K o Q8_0 si la memoria lo permite, y validar cada respuesta contra el esquema antes de aceptarla.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la información proporcionada. Existe un modelo previo de la misma familia, `Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-GGUF`, que aborda la misma tarea pero con una base más pequeña (0,5B). No se publican métricas de ese modelo en la documentación actual. El modelo base Qwen3.5-0.8B es un LLM generalista, pero no está especializado en extracción estructurada, por lo que no es directamente comparable en esta tarea.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-GGUF | ~0,75B | no disponible | Apache-2.0 | Extraccion de consultas e-commerce |
| Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-GGUF | ~0,5B | no disponible | Apache-2.0 | Extraccion de consultas e-commerce |
| Qwen/Qwen3.5-0.8B | ~0,75B | no disponible | Apache-2.0 | Modelo generalista |

## Limitaciones y advertencias

- El modelo solo extrae los campos definidos en el esquema JSON suministrado; no puede inferir atributos fuera de ese esquema.
- La calidad de la extracción depende directamente de la calidad de las anotaciones del dataset de entrenamiento, que no se documenta en detalle.
- La métrica "Exacto" es muy estricta: un error de capitalización o un valor incorrecto hace fallar toda la respuesta. En producción, se recomienda validar contra el esquema y reintentar o rechazar respuestas inválidas.
- Los resultados de evaluación corresponden a un conjunto de datos y un prompt concretos; otros esquemas, idiomas, versiones de llama.cpp o ajustes de muestreo pueden dar resultados diferentes.
- La cuantización Q3_K_M degrada significativamente la adherencia al esquema y la validez del JSON; no debe usarse en entornos donde se requiera alta fiabilidad.
- No se debe tratar los atributos inferidos como hechos verificados del producto; son interpretaciones de la consulta.
- El modelo está entrenado solo en inglés; no se garantiza su funcionamiento en otros idiomas.
- No se proporciona información sobre sesgos o alucinaciones específicas, pero al ser un modelo pequeño y especializado, puede fallar en consultas ambiguas o con vocabulario fuera del dominio de e-commerce.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Ionio-ai/ecommerce-search-extraction
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo previo de la misma familia: https://huggingface.co/Ionio-ai/Qwen2.5-0.5B-Instruct-Ecommerce-Extraction-GGUF
- Repositorio de Qwen3 (referencia general): https://github.com/QwenLM/Qwen3
