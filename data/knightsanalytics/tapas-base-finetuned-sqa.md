# KnightsAnalytics/tapas-base-finetuned-sqa

## Resumen

`KnightsAnalytics/tapas-base-finetuned-sqa` es un ajuste fino del modelo TAPAS en su variante base, publicado en HuggingFace por el usuario KnightsAnalytics bajo licencia Apache 2.0. TAPAS es una arquitectura de tipo transformer encoder, desarrollada originalmente por Google Research, disenada especificamente para responder preguntas en lenguaje natural sobre datos tabulares. El sufijo `sqa` hace referencia a Sequential Question Answering, un conjunto de datos en el que las preguntas se formulan de manera encadenada sobre una misma tabla, de modo que cada respuesta depende del contexto de las anteriores.

El modelo resuelve una tarea concreta: dado un enunciado en lenguaje natural y una tabla, localizar la celda o celdas que contienen la respuesta. A diferencia de los modelos de lenguaje generativos, su salida no es texto libre, sino indices de celdas dentro de la tabla de entrada, lo que reduce el riesgo de alucinacion numerica en contextos de datos estructurados.

La relevancia de esta publicacion es limitada por el momento: el repositorio acumula 0 descargas y 0 likes, y su unico valor diferencial frente a los pesos originales de Google es que se distribuye en formato ONNX, lo que facilita su despliegue en entornos de inferencia sin PyTorch. La model card no aporta informacion sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos, por lo que la mayor parte de las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional de la familia TAPAS/BERT, con embeddings de posicion relativa para filas y columnas; no confirmado en la model card |
| Parametros totales | No disponible en la informacion proporcionada (la variante base de TAPAS se situa en torno a 110 M de parametros) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible en la informacion proporcionada (la serie TAPAS-base opera con un maximo de 512 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en formato ONNX, sin indicacion de cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Tarea declarada | Sequential question answering sobre tablas |
| Fecha de publicacion | 3 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es TAPAS, un modelo de la familia BERT que incorpora dos innovaciones respecto al transformer encoder estandar: por un lado, embeddings de posicion relativa que codifican de forma explicita la fila y la columna de cada celda de la tabla; por otro, una cabeza de prediccion con tres logits (celda seleccionada, coordenada de columna y coordenada de fila) que permite resolver tareas de seleccion sobre tablas sin generar texto. En la variante `base`, esa tarea se resuelve con una configuracion de 12 capas y un tamano de representacion de 768, aunque estos valores no estan confirmados en la informacion disponible.

No hay datos en la model card sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni la aplicacion de tecnicas de alineacion como RLHF o DPO. Tampoco se documenta si el ajuste se ha realizado sobre los pesos originales `google/tapas-base` o sobre un checkpoint intermedio, ni que hiperparametros se han empleado. La unica informacion tecnica contrastada es el formato de exportacion: el repositorio contiene pesos ONNX, presumiblemente generados mediante `optimum` o `torch.onnx.export`, con un tamano de 0,4 GB coherente con una exportacion en precision fp32 o fp16 de un modelo de escala base.

## Capacidades

- Respuesta a preguntas sobre tablas: localiza celdas concretas que responden a una pregunta formulada en lenguaje natural, devolviendo coordenadas en lugar de texto generado.
- Razonamiento secuencial sobre tablas: el ajuste sobre SQA permite encadenar preguntas sucesivas sobre una misma tabla, manteniendo la coherencia con las respuestas previas.
- Agregacion y comparacion simple: puede resolver preguntas que requieren identificar valores maximos, minimos o comparaciones directas entre celdas, siempre que la tabla de entrada lo permita.
- Soporte de tool calling: no disponible. No hay evidencia en la informacion proporcionada de que el modelo exponga una interfaz de llamada a funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible. El modelo es un extractor de respuestas sobre tablas, no un planificador de acciones.
- Capacidades multilingues: no disponible. La model card no declara idiomas soportados.
- Capacidades especiales: no se documenta vision, audio ni modo de razonamiento explicito (thinking mode). La unica particularidad conocida es la representacion estructural de tablas.

## Casos de uso

- Consulta de informes financieros: dado un balance o una cuenta de resultados en formato tabular, el modelo puede responder preguntas del tipo "cual fue el gasto en I+D del ultimo trimestre" señalando directamente la celda correspondiente, lo que resulta util para sistemas de analisis que exigen trazabilidad de la fuente.
- Exploracion de catalogos de producto: en un comercio electronico con tablas de especificaciones tecnicas, el modelo permite resolver preguntas de comparacion entre articulos sin necesidad de convertir la tabla a texto ni recurrir a un modelo generativo.
- Analisis de hojas de calculo en herramientas ofimaticas: integrado mediante ONNX Runtime en una aplicacion de escritorio, puede ofrecer respuestas a preguntas formuladas sobre el contenido de una hoja activa, con un consumo de memoria inferior a 1 GB.
- Extraccion de datos de informes regulatorios: en entornos donde la respuesta debe ser verificable, devolver la coordenada de la celda en lugar de una frase generada reduce el riesgo de error y simplifica la auditoria.
- Volcado estructurado de documentacion tecnica: a partir de tablas de parametros de configuracion, el modelo puede responder a preguntas encadenadas sobre compatibilidades y limites, aprovechando su ajuste especifico sobre SQA.
- Asistencia en laboratorios y datos cientificos: consulta de tablas de resultados experimentales donde el usuario necesita recuperar mediciones concretas sin salir del documento.
- Despliegue en navegador o en el borde: al distribuirse en ONNX, puede ejecutarse con `onnxruntime-web` o `transformers.js` para ofrecer respuesta a preguntas sobre tablas sin enviar los datos a un servidor externo.
- Indexacion semantica de tablas: uso como componente de un pipeline mayor que extraiga pares pregunta-respuesta de tablas para alimentar un buscador o una base de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de exact match, accuracy ni comparaciones con otros checkpoints, y no se han encontrado articulos o informes adicionales asociados a esta publicacion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con los pesos ONNX en fp32 para un modelo de escala base; se reduce aproximadamente a la mitad si se aplica cuantizacion a int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta grafica dedicada de los ultimos ocho anos, y tambien en CPU con latencias aceptables para uso interactivo.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), HuggingFace Optimum, transformers.js y onnxruntime-web para ejecucion en navegador. No se distribuyen pesos en formato GGUF, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo, y en cualquier caso se trata de un modelo extractivo, no generativo, por lo que la metrica relevante seria el tiempo por consulta sobre una tabla dada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| KnightsAnalytics/tapas-base-finetuned-sqa | No disponible (escala base) | No disponible | SQA sobre tablas | Apache 2.0 | ONNX |
| google/tapas-base-finetuned-sqa | No disponible (escala base) | 512 tokens | SQA sobre tablas | Apache 2.0 | PyTorch / safetensors |
| google/tapas-base-finetuned-wtq | No disponible (escala base) | 512 tokens | WikiTableQuestions | Apache 2.0 | PyTorch / safetensors |
| google/tapas-large | No disponible (escala large) | 512 tokens | Preentrenamiento tabular | Apache 2.0 | PyTorch / safetensors |

Los datos de parametros y contexto de los modelos de Google corresponden a informacion publica sobre la serie TAPAS, no a la informacion proporcionada en esta ficha, y no se han verificado contra la model card del repositorio analizado. No se dispone de comparaciones de rendimiento entre estos checkpoints.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgos ni la composicion demografica o tematica de los datos de ajuste.
- Riesgo de alucinacion: bajo en comparacion con modelos generativos, porque la salida se restringe a celdas existentes de la tabla de entrada. Sin embargo, el modelo puede seleccionar una celda incorrecta si la pregunta es ambigua o si la tabla tiene una estructura irregular.
- Limitaciones de contexto: no disponible. Si se confirma el limite de 512 tokens propio de la serie TAPAS, las tablas grandes deberan fragmentarse, lo que puede romper la coherencia de las preguntas secuenciales.
- Limitaciones de idioma: no disponible. No se declara soporte de castellano ni de ningun otro idioma, y la practica habitual en la serie TAPAS es el entrenamiento sobre corpus en ingles.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados. Al derivar de pesos de Google, conviene verificar la licencia del checkpoint original.
- Caveats para produccion: el repositorio no incluye datos de entrenamiento, hiperparametros ni evaluacion, por lo que no es posible estimar su calidad real frente a los checkpoints oficiales de Google para la misma tarea. El hecho de contar con 0 descargas y 0 likes implica ausencia total de validacion por parte de la comunidad. Ademas, la fecha de publicacion registrada es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio y aconseja tratarlo con cautela.
- Formato: al distribuirse unicamente en ONNX, las herramientas que esperan safetensors o binarios de PyTorch requeriran conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KnightsAnalytics/tapas-base-finetuned-sqa
- Checkpoint original de Google: https://huggingface.co/google/tapas-base-finetuned-sqa
- Modelo base TAPAS de Google: https://huggingface.co/google/tapas-base
- Articulo original de TAPAS (Herzig et al., 2020): https://arxiv.org/abs/2004.02349
- Articulo del conjunto de datos SQA (Iyyer et al., 2017): https://arxiv.org/abs/1704.08798
- Repositorio oficial de TAPAS en GitHub: https://github.com/google-research/tapas
- Documentacion de ONNX Runtime: https://onnxruntime.ai/
