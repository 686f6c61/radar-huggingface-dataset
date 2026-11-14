# monled/exemple1-finetuned-noticies

## Resumen

`monled/exemple1-finetuned-noticies` es un modelo de clasificación de texto en catalán obtenido mediante fine-tuning supervisado del checkpoint `projecte-aina/roberta-base-ca-v2`, un RoBERTa base entrenado específicamente para catalán por el Projecte AINA (Barcelona Supercomputing Center). El modelo resultante está orientado a la clasificación de noticias y se ha entrenado sobre el dataset `projecte-aina/WikiCAT_ca`, un corpus de artículos periodísticos etiquetados por temática.

Se trata de un modelo de tamaño contenido (124,6 millones de parámetros, ~0,5 GB en safetensors) que hereda la arquitectura transformer encoder-only de RoBERTa base, con una ventana de contexto típica de 512 tokens. Su relevancia radica en que cubre una tarea concreta —clasificación temática de noticias en catalán— sobre un backbone lingüísticamente especializado, lo que lo hace útil como componente ligero en pipelines de procesamiento de medios o de análisis documental en esa lengua.

El modelo se publica bajo licencia Apache 2.0 y con la librería `transformers`, lo que facilita su integración en entornos de producción y su uso con Text Embeddings Inference (TEI). No obstante, la información pública es escasa: la model card es autogenerada por el Trainer, no incluye descripción de usos previstos ni detalles sobre el dataset más allá de su nombre, y no se han declarado resultados de benchmarks en el model-index.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa base) |
| Parametros totales | 124.653.325 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite habitualmente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes o GGUF, no documentada por el autor) |
| Idiomas soportados | catalán (implícito por el modelo base `roberta-base-ca-v2` y el dataset `WikiCAT_ca`); no declarado explícitamente en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `projecte-aina/roberta-base-ca-v2`, un RoBERTa base adaptado al catalán mediante entrenamiento continuado sobre corpus en esa lengua. La arquitectura subyacente es un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una cabeza de clasificación de secuencia añadida para la tarea de clasificación de texto.

El entrenamiento se realizó sobre el dataset `projecte-aina/WikiCAT_ca` durante una única época, con 620 pasos, batch size de 16, learning rate de 2e-5, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y semilla 42. No se documenta el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se indica el número de clases de la tarea de clasificación ni el esquema de etiquetas, un dato relevante para interpretar la accuracy reportada.

## Capacidades

- Clasificación de texto (sequence classification) sobre noticias en catalán, con una única etiqueta por documento.
- Extracción de representaciones contextuales del catalán mediante el encoder subyacente, reutilizable para tareas posteriores como similitud semántica o clustering.
- Compatible con la librería `transformers` y con Text Embeddings Inference (TEI) para despliegue como servicio de inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el modelo base está especializado en catalán.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación temática de noticias en catalán: el modelo puede asignar una categoría a cada artículo de un medio digital, integrándose en el CMS para etiquetar automáticamente piezas informativas antes de su publicación.
- Moderación y filtrado de contenidos editoriales: clasificar flujos de entrada de agencias o fuentes externas para derivar cada noticia al equipo editorial correspondiente.
- Enrutamiento de incidencias en atención al ciudadano: clasificar consultas o comunicaciones recibidas en catalán y dirigirlas al departamento adecuado dentro de una administración pública.
- Análisis de reputación de marca en prensa: procesar menciones en medios catalanoparlantes y clasificarlas por temática para agregar métricas de cobertura.
- Construcción de datasets etiquetados: usar el modelo como etiquetador débil (weak labeler) para preanotar grandes volúmenes de texto en catalán antes de una revisión humana.
- Detección de temáticas en archivos históricos digitalizados: clasificar hemerotecas y fondos documentales en catalán para facilitar la búsqueda por categoría.
- Componente en pipelines de búsqueda y recomendación: generar embeddings del encoder para similitud semántica entre noticias y recomendación de contenidos relacionados.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados declarados (`results: []`). Los únicos datos de evaluación disponibles son los reportados en la model card sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,4242 |
| Accuracy | 0,6828 |
| F1 | 0,6321 |
| Loss (entrenamiento) | 1,8933 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La accuracy de 0,6828 y el F1 de 0,6321 corresponden a una única época de entrenamiento y a un conjunto de evaluación no descrito; no son directamente comparables con resultados de otros modelos sin conocer el esquema de etiquetas y la distribución del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,5 GB de pesos, más overhead de activaciones; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: ~0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); para despliegue de alto throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (TEI), y exportación a ONNX o GGUF mediante herramientas externas no documentadas por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `monled/exemple1-finetuned-noticies` | 124,6 M | no disponible | Clasificación de noticias (catalán) | Apache 2.0 | Hugging Face |
| `projecte-aina/roberta-base-ca-v2` | ~125 M | no disponible | Modelo base de lenguaje (catalán) | no disponible en la información | Hugging Face |
| `projecte-aina/roberta-base-ca-cased` | ~125 M | no disponible | Modelo base de lenguaje (catalán) | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es autogenerada por el Trainer y no describe los usos previstos, las limitaciones ni la composición del dataset de entrenamiento.
- Solo se ha entrenado durante una época, con una accuracy de validación de 0,6828 y un F1 de 0,6321; el rendimiento en producción puede degradarse fuera de la distribución de `WikiCAT_ca`.
- No se especifica el número de clases ni el esquema de etiquetas, lo que impide interpretar correctamente las métricas reportadas.
- El modelo está especializado en catalán; su uso con textos en otras lenguas no está documentado y probablemente dé resultados pobres.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas o sesgadas heredadas del corpus de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse sobre un corpus periodístico catalán, puede reflejar los sesgos temáticos y editoriales de dichas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del dataset `WikiCAT_ca` por si imponen restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde su creación; no hay evidencia de mantenimiento ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/monled/exemple1-finetuned-noticies
- Modelo base: https://huggingface.co/projecte-aina/roberta-base-ca-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/projecte-aina/WikiCAT_ca
- Projecte AINA: https://projecte-aina.cat/
