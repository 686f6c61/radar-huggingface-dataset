# Hooshaai/svd-linear-attention-roberta-block-transformer-hiba

## Resumen

Este modelo, desarrollado por Hooshaai, es una versión comprimida de RoBERTa que integra el módulo de atención Block Transformer HIBA (Hierarchical Intra-Block and Inter-Block Attention). La propuesta aborda el coste cuadrático de la atención estándar en secuencias largas mediante un esquema jerárquico: atención densa dentro de bloques locales de 64 tokens y atención dispersa entre bloques con selección dinámica top-k de contexto global, manteniendo un anclaje obligatorio del primer bloque (que contiene el token [CLS]). Además, cada cuatro capas se aplica una rectificación global con atención densa completa para resincronizar dependencias de largo alcance.

El modelo está publicado en HuggingFace con la licencia MIT, orientado a clasificación de texto y entrenado sobre el dataset GLUE (SST-2). El autor reporta una accuracy de validación del 88,76% y un F1 de 0,8977, con un ratio de compresión de 0,9452 y un pico de VRAM de 399,22 MB en la evaluación. La información sobre el número total de parámetros y la longitud de contexto no se incluye en los datos disponibles; el tamaño del repositorio es de 0,0 GB, lo que sugiere que los pesos pueden estar alojados mediante Git LFS o que no se ha subido el contenido completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa con módulo Block Transformer HIBA: atención intra-bloque densa local, inter-bloque dispersa top-k con anclaje en bloque 0 y rectificación global periódica |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible |
| Metodo de compresion | SVD-linear-attention; ratio de compresión 0,9452 |

## Arquitectura y entrenamiento

La arquitectura Block Transformer HIBA reorganiza la atención de secuencias largas en dos niveles jerárquicos. En primer lugar, la secuencia se divide en bloques contiguos no solapados de tamaño B_s = 64. Dentro de cada bloque, se aplica una atención bidireccional densa estándar (intra-bloque). En segundo lugar, para cada bloque de consultas se realiza una atención dispersa inter-bloque que selecciona dinámicamente los bloques de mayor afinidad mediante un mecanismo top-k, con la inclusión incondicional del bloque 0, que contiene el token [CLS], como anclaje global. Además, cada R = 4 capas se introduce una rectificación global consistente en aplicar atención densa completa sobre toda la secuencia, evitando que la dispersión degrade las dependencias de largo alcance.

El entrenamiento se ha realizado mediante compresión y ajuste fino de recuperación sobre los pesos comprimidos, con 50 pasos de recuperación según el autor. Se evaluó en la tarea SST-2 del dataset GLUE, alcanzando una accuracy de validación del 88,76% y un F1 de 0,8977. El ratio de compresión reportado es 0,9452 y la evaluación pura tardó 27,08 segundos con un pico de VRAM de 399,22 MB. No se dispone de información adicional sobre el tamaño del dataset, el número de tokens o técnicas de alineación como RLHF o DPO.

## Capacidades

- Clasificación de texto en inglés, con pipeline `text-classification` y entrenamiento específico en SST-2 (análisis de sentimiento).
- Procesamiento eficiente de secuencias largas mediante atención jerárquica dispersa, que reduce la complejidad cuadrática de la atención estándar.
- Compresión de modelos: integra SVD-linear-attention, reduciendo el número de parámetros con un ratio de compresión de 0,9452.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitado a inglés (en).
- Generación de texto libre, código, matemáticas, visión o audio: no disponible.

## Casos de uso

- Análisis de sentimiento en reseñas de productos en inglés: el modelo puede clasificar opiniones como positivas o negativas a partir de textos cortos, aprovechando su entrenamiento en SST-2 y su bajo coste computacional.
- Clasificación de documentos largos (por ejemplo, artículos científicos o informes): la atención jerárquica permite procesar secuencias extensas sin el coste cuadrático de un transformer estándar, manteniendo la coherencia global mediante el anclaje del bloque 0 y la rectificación periódica.
- Despliegue en dispositivos de bajo consumo: con un pico de VRAM de 399,22 MB, el modelo puede ejecutarse en GPUs modestas o en entornos edge, reduciendo los requisitos de hardware frente a un RoBERTa completo.
- Monitorización de redes sociales: el modelo puede analizar publicaciones en inglés para detectar sentimiento o clasificar contenido en tiempo real, gracias a su bajo footprint y a la posibilidad de servirse mediante frameworks como vLLM o TGI.
- Filtrado de spam o contenido no deseado: sobre la base comprimida se puede realizar fine-tuning con datos corporativos para clasificar correos o comentarios, reduciendo el tiempo de entrenamiento en comparación con un RoBERTa sin comprimir.
- Investigación en compresión de transformers: el modelo sirve como caso de estudio para comparar el efecto de la descomposición SVD y la atención dispersa sobre la precisión, ya que publica ratio de compresión y métricas de evaluación.
- Clasificación de tickets de soporte en inglés: el modelo puede categorizar solicitudes de asistencia en colas de prioridad, aprovechando su capacidad para manejar descripciones largas y su facilidad de integración en pipelines de NLP.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados en la evaluación de SST-2:

| Benchmark / Metrica | Resultado |
|---|---|
| SST-2 accuracy de validación | 88,76% |
| SST-2 F1 | 0,8977 |
| Ratio de compresión | 0,9452 |
| Pico de VRAM (evaluación) | 399,22 MB |
| Tiempo de evaluación pura | 27,08 s |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica una medición oficial de inferencia, pero el pico de VRAM reportado en evaluación es de 399,22 MB. Para producción se recomienda un margen adicional; no hay datos de cuantizaciones disponibles.
- GPU recomendadas: no disponible. Con ~400 MB de pico, se estima que puede ejecutarse en GPUs de consumo con al menos 1 GB de VRAM, aunque no hay una lista oficial de hardware soportado.
- Compatibilidad con consumer GPU: sí, el pico de VRAM reportado es inferior a 1 GB, por lo que cabe en la mayoría de hardware actual (por ejemplo, NVIDIA GTX 1050, RTX 2060, o GPUs integradas modernas).
- Opciones de despliegue: al ser un modelo PyTorch, es posible que pueda servirse mediante HuggingFace Transformers, vLLM o TGI, aunque no se documenta una integración específica. No se conocen pesos en GGUF, por lo que su uso con llama.cpp u Ollama no está confirmado.
- Latencia y throughput: se conoce el tiempo de evaluación pura (27,08 s para el conjunto de validación), pero no se proporcionan medidas por token ni throughput en inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. Este modelo se basa en RoBERTa, por lo que una referencia natural sería la arquitectura RoBERTa original, pero no se reportan métricas comparativas con ella ni con otras alternativas de atención eficiente.

## Limitaciones y advertencias

- El modelo solo soporta inglés (en) y está orientado a clasificación de texto; no está validado para generación de texto libre, razonamiento complejo, código o matemáticas.
- Riesgo de alucinación: no procede en tareas de clasificación, pero si se forzara generación de texto, el modelo no está entrenado para ello y podría producir salidas incoherentes.
- Sesgos: no se documentan sesgos específicos; al estar entrenado en GLUE, puede heredar los sesgos presentes en los datasets de lenguaje en inglés.
- Limitaciones de contexto: la longitud de contexto no se ha publicado; aunque la atención jerárquica está diseñada para secuencias largas, no se conoce el límite exacto soportado.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero no se ofrecen garantías de rendimiento ni soporte; la responsabilidad sobre el uso recae en el usuario.
- Advertencia importante: el tamaño del repositorio es 0,0 GB, lo que podría indicar que los pesos no están disponibles o que la información de HuggingFace está incompleta. Además, no hay descargas ni likes, lo que sugiere que el modelo es experimental y no está validado en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-roberta-block-transformer-hiba
- Blog de Hoosha AI (Substack): https://hooshaai.substack.com/
- Artículo sobre Adaptive Transformer Compressor: https://hooshaai.substack.com/p/adaptive-transformer-compressor-energythresholde
