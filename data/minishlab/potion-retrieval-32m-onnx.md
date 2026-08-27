# minishlab/potion-retrieval-32m-onnx

## Resumen

`potion-retrieval-32m-onnx` es un export en formato ONNX del modelo de embeddings estáticos `minishlab/potion-retrieval-32m`, desarrollado por el equipo de Minish Lab. Este modelo pertenece a la familia Model2Vec, que genera representaciones vectoriales de texto mediante embeddings estáticos, es decir, calculados a partir de la suma o promedio de los vectores de los tokens sin pasar por una red transformer completa en inferencia. Esto permite obtener embeddings de frases y documentos de forma mucho más rápida que los modelos basados en transformers, tanto en CPU como en GPU.

El modelo original `potion-retrieval-32m` es un fine-tune de `potion-base-32m`, optimizado específicamente para tareas de retrieval (búsqueda semántica y recuperación de información). El export ONNX facilita su uso con librerías como `onnxruntime` o `transformers.js`, eliminando la dependencia del paquete `model2vec` y permitiendo su integración en entornos de producción con diferentes stacks tecnológicos.

Con un tamaño de repositorio de 0.1 GB y una licencia MIT, este modelo resulta atractivo para aplicaciones que requieren embeddings de alta velocidad con un coste computacional mínimo, aunque su capacidad semántica está limitada por su tamaño reducido (32M de parámetros según la nomenclatura) y por la naturaleza estática de sus representaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estáticos) |
| Parametros totales | 32M (según nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la técnica Model2Vec, que convierte un modelo transformer preentrenado en un conjunto de embeddings estáticos. En lugar de ejecutar la red completa para cada frase, se precalculan los vectores de cada token del vocabulario y se combinan (normalmente mediante promedio ponderado) para obtener la representación de una secuencia. Esto reduce drásticamente la latencia y los requisitos de cómputo.

Según la información disponible, `potion-retrieval-32m` es un fine-tune de `potion-base-32m`, entrenado con una versión modificada del enfoque descrito en el blog de Model2Vec. El proceso de ajuste utilizó un dataset reducido a una décima parte del original, una tasa de aprendizaje más baja y 3 épocas de entrenamiento (frente a 1 en el enfoque estándar). Se observó que una tasa de aprendizaje demasiado alta destruía el conocimiento adquirido en el preentrenamiento. El modelo resultante está optimizado para tareas de retrieval, mejorando la calidad de los embeddings para búsqueda semántica y recuperación de información.

## Capacidades

- Generación de embeddings de texto para frases y documentos.
- Optimizado para tareas de retrieval: búsqueda semántica, similitud entre textos, ranking.
- Inferencia extremadamente rápida en CPU y GPU gracias a los embeddings estáticos.
- Compatible con `onnxruntime` y `transformers.js` para despliegue en múltiples entornos.
- No requiere GPU para funcionar; puede ejecutarse en hardware modesto.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Búsqueda semántica en bases de datos documentales: el modelo puede indexar documentos y consultas, permitiendo recuperar los pasajes más relevantes mediante similitud coseno. Su velocidad permite procesar grandes volúmenes de texto en tiempo real.
- Sistemas de recomendación basados en contenido: al convertir ítems (artículos, productos, noticias) en vectores, se pueden calcular similitudes entre ellos para sugerir elementos relacionados.
- Deduplicación de textos: comparar embeddings para detectar documentos duplicados o casi duplicados en grandes corpus, útil en pipelines de limpieza de datos.
- Clasificación de texto con pocos datos: al usar los embeddings como características de entrada para un clasificador ligero (regresión logística, SVM), se pueden construir sistemas de categorización con entrenamiento rápido.
- Agrupación (clustering) de documentos: los embeddings estáticos permiten agrupar textos por temas o tópicos de forma eficiente, incluso con millones de documentos.
- Chatbots y asistentes con recuperación aumentada (RAG): el modelo puede servir como componente de retrieval en un pipeline RAG, seleccionando fragmentos relevantes de una base de conocimiento para alimentar a un modelo generativo.
- Análisis de similitud entre consultas de soporte: para enrutar tickets de atención al cliente hacia el agente o artículo de ayuda más adecuado según su similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de embeddings estáticos de aproximadamente 32M de parámetros, su huella de memoria es muy reducida (el repositorio ocupa 0.1 GB).
- Puede ejecutarse en CPU sin necesidad de GPU; cualquier procesador moderno es suficiente para inferencia en lote o en tiempo real.
- En GPU, la inferencia es aún más rápida, pero no es un requisito.
- El formato ONNX permite su uso con `onnxruntime`, que ofrece optimizaciones para CPU (como la ejecución con instrucciones AVX) y aceleración en GPU si está disponible.
- También es compatible con `transformers.js` para ejecución en navegador o Node.js, lo que abre la puerta a despliegues en el lado del cliente.
- No se dispone de datos de latencia o throughput específicos, pero por la naturaleza del modelo se espera que sea órdenes de magnitud más rápido que un transformer equivalente.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de embeddings en esta ficha. Se recomienda consultar los resultados publicados en el repositorio de Model2Vec para comparaciones con otros modelos de embeddings estáticos y transformer-based.

## Limitaciones y advertencias

- Al ser embeddings estáticos, no capturan el contexto de forma dinámica: una misma palabra siempre tendrá el mismo vector independientemente de la frase, lo que puede limitar el rendimiento en casos de polisemia o matices contextuales.
- El modelo tiene un tamaño reducido (32M), por lo que su calidad semántica será inferior a modelos más grandes como los basados en transformers de cientos de millones de parámetros.
- No se han especificado los idiomas soportados; es probable que esté entrenado principalmente en inglés, pero no hay confirmación oficial.
- No se proporcionan datos de benchmarks, por lo que no es posible evaluar su rendimiento cuantitativo frente a alternativas.
- El modelo está optimizado para retrieval; su rendimiento en otras tareas (clasificación, clustering) puede ser subóptimo.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento si se requiere cumplimiento normativo (por ejemplo, GDPR).

## Enlaces

- [Modelo ONNX en HuggingFace](https://huggingface.co/minishlab/potion-retrieval-32m-onnx)
- [Modelo base original](https://huggingface.co/minishlab/potion-retrieval-32M)
- [Repositorio Model2Vec](https://github.com/MinishLab/model2vec)
- [Colección de modelos base Model2Vec](https://huggingface.co/collections/minishlab/model2vec-base-models-66fd9dd9b7c3b3c0f25ca90e)
- [Resultados de Model2Vec](https://github.com/MinishLab/model2vec/tree/main/results)
- [Documentación de Model2Vec](https://minish.ai/packages/model2vec/introduction)
