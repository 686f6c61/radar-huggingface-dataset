# Lixpr/bert-disaster-tweets

## Resumen

bert-disaster-tweets es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de google-bert/bert-base-uncased sobre el conjunto de datos público Disaster Tweets de Kaggle. Lo publica el usuario Lixpr como proyecto de curso y su única tarea es distinguir entre mensajes que describen un evento catastrófico real (etiqueta 1) y mensajes que no lo hacen (etiqueta 0). El modelo no realiza verificación de hechos, alertas de emergencia ni apoyo a la toma de decisiones; es un clasificador de dos clases y nada más.

Arquitectónicamente es un transformer encoder BERT-base estándar, con 12 capas, 768 dimensiones ocultas y 110 millones de parámetros, adaptado a una cabeza de clasificación de secuencia. La longitud máxima de entrada utilizada en el entrenamiento fue de 96 tokens, muy por debajo de los 512 que admite BERT, lo que refleja la naturaleza corta de los tuits. El repositorio distribuye únicamente pesos ONNX, incluida una versión INT8 dinámica de aproximadamente 110 MB pensada para ejecución en navegador mediante transformers.js.

Su relevancia es limitada y muy acotada: sirve como ejemplo reproducible de fine-tuning de BERT para clasificación binaria, como demostración de despliegue ONNX/transformers.js en el cliente y como referencia de buenas prácticas de partición estratificada y evaluación con F1. No está pensado para producción ni para uso más allá del dominio y el idioma para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con cabeza de clasificación de secuencia |
| Parametros totales | 110 millones (heredados de google-bert/bert-base-uncased) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens máximo arquitectónico de BERT; entrenado con longitud máxima de 96 tokens |
| Tipos de cuantizacion | INT8 dinámica (ONNX); el autor indica que el checkpoint FP32 completo no se publica en el repo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_quantized.onnx, INT8 dinámica, ~110 MB); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-uncased, un transformer encoder bidireccional con tokenización WordPiece en minúsculas y embeddings posicionales aprendidos. Sobre esa base se añade una cabeza de clasificación lineal para dos clases. El autor no documenta modificaciones arquitectónicas adicionales: se trata de un fine-tuning convencional de clasificación de secuencia.

Los datos provienen del espejo público `venetis/disaster_tweets` del conjunto Disaster Tweets de Kaggle. De los 7613 registros originales se eliminaron 56 con etiquetas conflictivas y 74 duplicados, quedando 7483 ejemplos. Tras una deduplicación exacta normalizada se realizó una partición estratificada por etiqueta: 5238 de entrenamiento, 1122 de validación y 1123 de test, con semilla fija 20261029. La configuración de entrenamiento fue: longitud máxima 96, batch size 8, acumulación de gradiente 2 (batch efectivo 16), AdamW con learning rate 2e-5, weight decay 0.01, precisión FP16, 3 épocas y selección del checkpoint por F1 en validación. No se menciona uso de RLHF, DPO ni datos adicionales. La conversión a ONNX se realizó con cuantización dinámica INT8, y el autor reporta una tasa de coincidencia del 96,88 % entre las predicciones cuantizadas y las de PyTorch, con una F1 de 0,7978 en el conjunto de validación.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve la probabilidad de que un mensaje describa un evento catastrófico (etiqueta 1) frente a uno que no lo haga (etiqueta 0).
- Procesamiento de textos cortos, típicamente tuits de hasta 96 tokens.
- Ejecución en navegador y en CPU mediante ONNX Runtime y transformers.js.
- Inferencia por lotes o individual con salida de logits y probabilidad tras softmax.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe nula más allá del inglés: el vocabulario uncased de BERT cubre otros idiomas de forma marginal, pero el modelo no fue entrenado para ellos.

## Casos de uso

- Filtrado de flujos de redes sociales en investigación: clasificar en tiempo real un stream de tuits en inglés para separar mensajes que describen catástrofes de mensajes coloquiales, como paso previo a un análisis humano más profundo.
- Etiquetado asistido de corpus: preanotar grandes volúmenes de texto corto en inglés para reducir el coste de anotación manual, revisando después las predicciones con umbral ajustable.
- Demostración docente de fine-tuning de BERT: el repositorio documenta partición, hiperparámetros y métricas, lo que lo hace útil como ejemplo reproducible en cursos de NLP.
- Despliegue en el cliente sin backend: al distribuirse como ONNX INT8 de ~110 MB y estar pensado para transformers.js, puede integrarse en una aplicación web que clasifique texto en el navegador sin enviar datos a un servidor.
- Prototipado rápido de clasificadores de texto binario: sirve como línea base para comprobar si un enfoque BERT-base es suficiente antes de invertir en modelos mayores o en datos propios.
- Monitorización de contenido en comunidades pequeñas: clasificar mensajes de foros o chats en inglés para señalar posibles reportes de incidentes, siempre con revisión humana posterior y sin uso como sistema de alerta.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,832591 | Test (umbral 0,5, sin ajuste) |
| F1 | 0,796976 | Test (umbral 0,5, sin ajuste) |
| ROC AUC | 0,895227 | Test (umbral 0,5, sin ajuste) |
| F1 (modelo cuantizado INT8) | 0,797765 | Validación |
| Coincidencia PyTorch vs ONNX INT8 | 0,968833 | Validación |

No se han publicado comparaciones con otros modelos en la información disponible. Las métricas anteriores proceden exclusivamente de la model card del autor y corresponden a un único conjunto de test construido por el propio autor, sin validación cruzada ni múltiples semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo base (110 M de parámetros, ~440 MB de pesos); la versión ONNX INT8 ocupa aproximadamente 110 MB en disco y un consumo de memoria similar en ejecución.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 quedan sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU reciente; también funciona íntegramente en CPU.
- Opciones de despliegue: transformers.js con ONNX Runtime Web en navegador; ONNX Runtime en CPU o GPU; conversión adicional a otros formatos no está documentada en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en CPU moderna, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lixpr/bert-disaster-tweets | 110 M | 512 (entrenado a 96) | Clasificación binaria de tuits de desastre | Apache 2.0 | ONNX en Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base sin fine-tuning | Apache 2.0 | Safetensors y PyTorch en Hugging Face |
| DistilBERT base uncased | 66 M | 512 | Modelo base destilado, sin fine-tuning | Apache 2.0 | Safetensors y PyTorch en Hugging Face |
| RoBERTa base | 125 M | 512 | Modelo base sin fine-tuning | MIT | Safetensors y PyTorch en Hugging Face |

La comparación directa con otros clasificadores específicos de Disaster Tweets no está disponible en la información proporcionada. Los modelos alternativos citados son bases genéricas que requerirían su propio fine-tuning para esta tarea.

## Limitaciones y advertencias

- Entrenado con una única semilla y un único conjunto de validación y test construidos por el autor; no hay validación cruzada ni estimación de varianza de las métricas.
- Posible fuga de información a nivel de evento o de textos casi idénticos entre particiones, según advierte el propio autor.
- Sensible a lenguaje figurado: metáforas, letras de canciones, bromas y mensajes sin contexto suficiente producen falsos positivos y falsos negativos.
- El conjunto de datos original tiene etiquetas discutidas; parte del error es irreducible por ambigüedad de anotación.
- Solo inglés y solo textos cortos; no debe usarse con entradas de otros idiomas ni con documentos largos.
- No es un sistema de verificación de hechos ni de alerta temprana; las probabilidades de salida no representan la probabilidad real de que ocurra una catástrofe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un proyecto de curso sin garantías de calidad para producción.
- El repositorio no incluye el checkpoint FP32 en PyTorch, solo ONNX; quien necesite reentrenar o inspeccionar los pesos en formato original deberá recurrir al modelo base y reproducir el fine-tuning.
- La cuantización INT8 no es una conversión sin pérdida por muestra: aproximadamente el 3,1 % de las predicciones difieren de las del modelo en FP32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lixpr/bert-disaster-tweets
- Demo en Spaces: https://huggingface.co/spaces/Lixpr/disaster-tweets-demo
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset espejo: https://huggingface.co/datasets/venetis/disaster_tweets
- Competición original de Kaggle: https://www.kaggle.com/competitions/nlp-getting-started
