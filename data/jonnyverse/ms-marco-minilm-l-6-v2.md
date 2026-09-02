# JONNYVERSE/ms-marco-MiniLM-L-6-v2

## Resumen

El modelo `JONNYVERSE/ms-marco-MiniLM-L-6-v2` es una conversión a formato ONNX del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`, preparada para su uso con la librería Transformers.js en entornos JavaScript. El modelo original fue desarrollado por la comunidad de sentence-transformers y entrenado sobre el corpus MS MARCO Passage Ranking, una tarea de recuperación de información que consiste en puntuar la relevancia de un pasaje respecto a una consulta.

Esta versión concreta no introduce cambios en los pesos ni en la arquitectura; simplemente empaqueta los pesos en formato ONNX para que puedan ejecutarse en navegadores, Node.js o entornos edge sin necesidad de un backend de Python. El repositorio incluye tanto pesos cuantizados como no cuantizados, y el ejemplo de uso proporcionado demuestra su funcionamiento para reranking de pasajes.

La relevancia de este modelo radica en su tamaño reducido (típico de la familia MiniLM-L6) y su capacidad para ejecutarse en cliente, lo que lo hace adecuado para aplicaciones de búsqueda y recuperación de información donde la latencia y la privacidad son críticas. Aunque no se especifican la licencia ni los idiomas en esta versión, el modelo base original se distribuye bajo Apache 2.0 y soporta principalmente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder, basado en MiniLM-L6) |
| Parametros totales | no disponible (el modelo base original tiene aproximadamente 22,7 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base original soporta 512 tokens) |
| Tipos de cuantizacion | cuantizado y no cuantizado (segun el ejemplo de la model card) |
| Idiomas soportados | no disponibles (el modelo base original esta entrenado principalmente en ingles) |
| Licencia | no disponible (el modelo base original es Apache 2.0) |
| Formato de pesos | ONNX (safetensors no aplica; el repo contiene pesos ONNX) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura MiniLM-L6, una variante compacta de BERT con 6 capas de transformer. A diferencia de los bi-encoders, que generan representaciones independientes para consulta y pasaje, un cross-encoder procesa la concatenación de ambos textos de entrada y produce una puntuación de relevancia directa. Esto ofrece mayor precisión que los bi-encoders, pero a costa de una inferencia más costosa, ya que cada par consulta-documento debe procesarse conjuntamente.

El entrenamiento original se realizó sobre el dataset MS MARCO Passage Ranking, una colección de consultas de Bing y pasajes relevantes etiquetados. No se dispone de detalles sobre el número exacto de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que no aparecen en la información proporcionada. La conversión a ONNX se realizó mediante la herramienta Optimum de Hugging Face, y los pesos se almacenan en una subcarpeta `onnx` dentro del repositorio.

## Capacidades

- **Reranking de pasajes**: dado un par consulta-pasaje, devuelve una puntuación de relevancia (logit) que permite ordenar resultados de búsqueda.
- **Recuperación de información**: puede integrarse en pipelines de retrieval para refinar los resultados obtenidos con métodos más ligeros (por ejemplo, BM25 o bi-encoders).
- **Ejecución en JavaScript**: gracias a Transformers.js, el modelo puede ejecutarse en el navegador, Node.js o entornos serverless sin depender de Python.
- **Cuantización disponible**: ofrece pesos cuantizados para reducir el tamaño y acelerar la inferencia en dispositivos con recursos limitados.
- **Clasificación de pares de texto**: aunque su uso principal es el ranking, también puede emplearse para cualquier tarea de clasificación de secuencias con dos entradas.
- **Multilingüismo limitado**: el modelo base está entrenado principalmente en inglés; no se garantiza un buen rendimiento en otros idiomas.

## Casos de uso

- **Búsqueda semántica en aplicaciones web**: se puede integrar en un frontend JavaScript para rerankear resultados de búsqueda procedentes de una API o de un índice local, mejorando la relevancia sin enviar datos a un servidor.
- **Sistemas de preguntas y respuestas**: dado un conjunto de pasajes candidatos extraídos con un método rápido, el modelo puntúa cada par pregunta-pasaje y selecciona el más relevante como respuesta.
- **Asistentes virtuales y chatbots**: para seleccionar la respuesta más adecuada de una base de conocimiento, el modelo puede comparar la consulta del usuario con las entradas almacenadas.
- **Moderación de contenido**: clasificar pares de texto (por ejemplo, comentario + política de la comunidad) para detectar infracciones.
- **Motores de recomendación**: puntuar la relevancia entre una consulta de usuario y descripciones de productos o artículos para personalizar sugerencias.
- **Análisis de documentos legales o médicos**: en entornos donde la privacidad es crítica, el modelo puede ejecutarse localmente en el navegador para clasificar fragmentos de documentos según su pertinencia a una consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base original reporta un MRR@10 de aproximadamente 0.349 en el conjunto de test de MS MARCO Passage Ranking, pero no se puede confirmar este dato para esta conversión concreta. Se recomienda consultar la documentación del modelo original para más detalles.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de aproximadamente 22 millones de parámetros, la inferencia en FP32 requiere alrededor de 90 MB de memoria. Con cuantización a 8 bits, el requisito se reduce a unos 45 MB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. También puede ejecutarse en CPU sin problemas.
- **Compatibilidad con hardware de consumo**: sí, el modelo cabe en cualquier ordenador personal, incluyendo portátiles con CPU moderna.
- **Opciones de despliegue**: al ser ONNX, puede ejecutarse con ONNX Runtime Web (para navegadores), ONNX Runtime Node.js, Transformers.js, o cualquier runtime compatible con ONNX.
- **Latencia y throughput**: en CPU, la inferencia de un par consulta-pasaje suele tardar entre 5 y 20 milisegundos, dependiendo de la longitud del texto y de la cuantización. En GPU, la latencia es inferior a 5 milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Uso principal | Licencia |
|---|---|---|---|---|
| ms-marco-MiniLM-L-6-v2 (este) | ~22,7 M | 512 tokens | Reranking de pasajes | Apache 2.0 (modelo base) |
| ms-marco-MiniLM-L-12-v2 | ~33 M | 512 tokens | Reranking de pasajes | Apache 2.0 |
| ms-marco-electra-base | ~110 M | 512 tokens | Reranking de pasajes | Apache 2.0 |

La comparativa se basa en el conocimiento general de los modelos de la familia sentence-transformers; no se dispone de datos de rendimiento específicos para esta conversión ONNX.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado principalmente con datos en inglés; su rendimiento en otros idiomas puede ser significativamente inferior.
- **Longitud de contexto**: la ventana de 512 tokens limita el tamaño de los pares consulta-pasaje; textos más largos deben truncarse, lo que puede perder información relevante.
- **Coste de inferencia**: al ser un cross-encoder, requiere procesar cada par consulta-documento por separado, lo que puede ser ineficiente si hay miles de documentos candidatos.
- **Licencia**: la licencia de esta conversión no está especificada en el repositorio. Aunque el modelo base es Apache 2.0, conviene verificar los términos antes de usarlo comercialmente.
- **Sesgos**: al igual que otros modelos entrenados en datos web, puede reflejar sesgos presentes en el corpus MS MARCO, como preferencias culturales o demográficas.
- **Alucinaciones**: en tareas de clasificación, el modelo puede asignar puntuaciones altas a pares irrelevantes si los patrones del entrenamiento inducen asociaciones espurias.
- **Producción**: la conversión ONNX no incluye tests exhaustivos; se recomienda validar el comportamiento en el entorno objetivo antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/ms-marco-MiniLM-L-6-v2
- Modelo original: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Guía de Optimum para ONNX: https://huggingface.co/docs/optimum/index
- Ejemplo de uso con inference4j (Java): https://huggingface.co/inference4j/ms-marco-MiniLM-L-6-v2
