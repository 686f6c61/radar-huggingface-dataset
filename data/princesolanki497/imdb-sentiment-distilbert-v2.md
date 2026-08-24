# princesolanki497/imdb-sentiment-distilbert-v2

## Resumen

El modelo `princesolanki497/imdb-sentiment-distilbert-v2` es un clasificador de análisis de sentimiento basado en la arquitectura DistilBERT, específicamente ajustado (fine-tuned) sobre el dataset IMDb de críticas de películas. Desarrollado por el usuario princesolanki497 (Prince Rajesh), el modelo resuelve la tarea de clasificación binaria de sentimiento (positivo/negativo) en reseñas de texto en inglés. Su relevancia radica en ofrecer una solución ligera y eficiente para análisis de sentimiento, aprovechando la destilación de BERT que reduce el tamaño del modelo en un 40% y acelera la inferencia en un 60%, manteniendo más del 95% del rendimiento del modelo original.

Con 66,9 millones de parámetros y un tamaño de repositorio de 0,3 GB, el modelo está diseñado para ser desplegado en entornos con recursos limitados, incluyendo GPUs de consumo. Publicado bajo licencia Apache 2.0, permite uso comercial sin restricciones significativas. El modelo se distribuye en formato safetensors, lo que garantiza una carga segura y eficiente en producción. Aunque la model card es mínima, la arquitectura subyacente es bien conocida: DistilBERT con una cabeza de clasificación añadida para la tarea específica de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) con cabeza de clasificacion |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de DistilBERT) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | ingles (dataset IMDb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT desarrollada por Hugging Face que utiliza destilacion de conocimiento para comprimir el modelo original. DistilBERT mantiene la arquitectura transformer encoder pero reduce el numero de capas de 12 a 6, eliminando los tokens de tipo y posicion, y utiliza una funcion de perdida combinada que incluye destilacion, aprendizaje supervisado y perdida coseno. El resultado es un modelo con 66 millones de parametros que conserva el 95% del rendimiento de BERT-base en el benchmark GLUE.

El entrenamiento especifico para esta tarea se realizo mediante fine-tuning sobre el dataset IMDb, que contiene 50.000 criticas de peliculas etiquetadas como positivas o negativas. Aunque no se detallan los hiperparametros exactos en la model card, el proceso tipico implica una capa de clasificacion adicional sobre la salida del token [CLS], entrenada con entropia cruzada binaria. No se menciona el uso de tecnicas como RLHF o DPO, dado que se trata de un modelo de clasificacion supervisada clasica. La arquitectura no presenta innovaciones tecnicas destacables mas alla de las inherentes a DistilBERT.

## Capacidades

- Clasificacion binaria de sentimiento: el modelo distingue entre criticas positivas y negativas de peliculas con alta precision.
- Procesamiento de texto en ingles: optimizado para resenas cinematograficas, aunque puede generalizar a otros dominios con degradacion de rendimiento.
- Inferencia rapida: gracias a la arquitectura destilada, ofrece latencias bajas comparables a modelos mucho mas pequenos.
- Integracion con el ecosistema Hugging Face: compatible con pipelines de transformers, lo que facilita su uso en aplicaciones existentes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales, al ser un modelo encoder de clasificacion.
- Capacidad multilingue limitada: aunque DistilBERT tiene variantes multilingues, este checkpoint especifico fue entrenado solo con datos en ingles.

## Casos de uso

- Analisis de opiniones de productos en plataformas de e-commerce: el modelo puede clasificar resenas de usuarios en positivas o negativas para generar metricas de satisfaccion agregadas. Su tamano reducido permite procesar grandes volumenes de resenas en tiempo real con costes de infraestructura minimos.
- Monitorizacion de redes sociales para marcas cinematograficas: permite analizar la recepcion de estrenos y trailers clasificando comentarios de Twitter o Reddit, ayudando a los estudios a medir el impacto de sus campañas de marketing.
- Filtrado de resenas en plataformas de streaming: puede priorizar resenas negativas para que los moderadores las revisen manualmente, mejorando la calidad del contenido mostrado a los usuarios.
- Investigacion academica en NLP: sirve como baseline ligero para experimentos de analisis de sentimiento, permitiendo a investigadores comparar tecnicas mas complejas contra un modelo solido y bien establecido.
- Sistemas de recomendacion basados en sentimiento: integrado en pipelines de recomendacion, puede ponderar las preferencias de usuarios segun el sentimiento de sus resenas, mejorando la personalizacion.
- Analisis de feedback en plataformas de reseñas de libros o videojuegos: aunque entrenado con datos de cine, el modelo puede adaptarse con un fine-tuning adicional a dominios cercanos, o usarse directamente para obtener una primera aproximacion del sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de evaluacion en su model card, ni se encontraron datos de rendimiento en la busqueda web. Para una evaluacion fiable, se recomienda ejecutar el modelo sobre el conjunto de test de IMDb (25.000 resenas) y comparar con los resultados tipicos de DistilBERT en esta tarea, que suelen rondar el 90-92% de exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en precision FP32, reducible a 0,25-0,5 GB con cuantizacion INT8 (si se aplica).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso CPU sola para inferencia por lotes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer moderna, incluyendo las integradas de gama alta.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, TensorFlow Serving, TorchServe, y puede exportarse a formatos optimizados como OpenVINO.
- Latencia estimada: en una GPU RTX 3060, la inferencia por muestra es de aproximadamente 5-15 ms; en CPU, entre 50-200 ms dependiendo del hardware.
- Throughput: en GPU, puede procesar cientos de muestras por segundo en batch; en CPU, decenas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud IMDb (test) | Licencia | Formato |
|---|---|---|---|---|---|
| princesolanki497/imdb-sentiment-distilbert-v2 | 66,9 M | 512 | no disponible | Apache 2.0 | safetensors |
| Niophy/distilbert-imdb-sentiment | 66,9 M | 512 | no disponible | Apache 2.0 | safetensors |
| BERT-base-uncased (fine-tuned IMDb) | 110 M | 512 | ~92% | Apache 2.0 | safetensors |
| RoBERTa-base (fine-tuned IMDb) | 125 M | 512 | ~95% | MIT | safetensors |

El modelo se posiciona como una alternativa ligera a BERT y RoBERTa para clasificacion de sentimiento. Su principal ventaja es el menor coste computacional, aunque los modelos mas grandes suelen ofrecer mayor precision. La falta de benchmarks publicados impide una comparacion cuantitativa directa con alternativas.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente con resenas de peliculas en ingles, puede degradarse significativamente en otros dominios (politica, salud, tecnologia) o idiomas.
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto, por lo que el riesgo de alucinacion es nulo; el riesgo principal es la clasificacion erronea de textos ambiguos o con sarcasmo.
- Limitaciones de contexto: ventana de 512 tokens, insuficiente para resenas muy largas o documentos extensos; textos mas largos deben truncarse o dividirse.
- Falta de documentacion: la model card no incluye detalles de entrenamiento, hiperparametros, ni metricas de evaluacion, lo que dificulta la reproducibilidad y la evaluacion de calidad.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero no se proporciona garantia ni soporte oficial.
- Riesgo de sobreajuste: al ser un modelo pequeno fine-tuneado sobre un dataset especifico, puede no generalizar bien a variaciones linguisticas fuera del dominio de resenas de cine.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/princesolanki497/imdb-sentiment-distilbert-v2
- Perfil del autor: https://huggingface.co/princesolanki497
- Modelo similar de referencia: https://huggingface.co/Niophy/distilbert-imdb-sentiment
- Repositorio de fine-tuning de referencia: https://github.com/vahehambardzumyan/imdb_review_classification
- Notebook de clasificacion con DistilBERT: https://colab.research.google.com/github/pranaya-mathur/Deep-Learning-Projects/blob/master/Sentiment_Classification_using_DistilBERT.ipynb
- Repositorio de fine-tuning con Comet ML: https://github.com/kavindakulasinghe/IMDb-Sentiment-DistilBERT
