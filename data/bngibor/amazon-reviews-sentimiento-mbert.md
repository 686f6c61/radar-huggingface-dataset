# Bngibor/amazon-reviews-sentimiento-mbert

## Resumen

El modelo `Bngibor/amazon-reviews-sentimiento-mbert` es un clasificador de sentimiento multilingüe de tres clases (negativo, neutro, positivo) obtenido mediante fine-tuning de `google-bert/bert-base-multilingual-cased` sobre el corpus `mteb/amazon_reviews_multi` restringido a los idiomas espanol, ingles y frances. Lo publica el usuario Bngibor en HuggingFace y su tarea declarada es el analisis de sentimiento de resenas de producto (text-classification / sentiment-analysis).

Tecnicamente se trata de un transformer encoder bidireccional clasico de la familia BERT, con aproximadamente 178 millones de parametros, 12 capas, tamano oculto de 768 y una ventana de contexto maxima de 512 tokens, todo ello heredado del checkpoint base. El fine-tuning convierta la cabeza de modelado de lenguaje enmascarado en un clasificador de secuencias de tres etiquetas, sin modificaciones arquitectonicas conocidas.

Su relevancia es limitada y practica: es un ejemplo tipico de modelo de clasificacion ligero, desplegable en CPU o en GPU de gama baja, util para tareas de analisis de opinion en produccion a bajo coste. En la informacion disponible no hay datos de benchmarks, hiperparametros de entrenamiento, licencia ni formato de pesos declarados, por lo que su evaluacion queda incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-base) |
| Parametros totales | ~178 M (heredado de bert-base-multilingual-cased) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (no especificado por el autor) |
| Idiomas soportados | es, en, fr (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no declarado en la model card) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un encoder transformer de 12 capas, 768 unidades ocultas, 12 cabezas de atencion y un vocabulario en minucia sensible de aproximadamente 119.547 tokens. La cabeza original de prediccion de tokens enmascarados se sustituye por una capa de clasificacion de secuencia con tres salidas, correspondientes a las etiquetas negativo / neutro / positivo.

Segun la model card, el ajuste fino se realizo sobre `mteb/amazon_reviews_multi` para es/en/fr. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, la tasa de aprendizaje, el numero de epocas, el tamano de batch ni si se aplicaron tecnicas de regularizacion, calibracion de umbrales o entrenamiento por clases balanceadas. Tampoco se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineacion, algo poco habitual en tareas de clasificacion supervisada. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, destilacion, etc.).

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutro, positivo) sobre texto corto y medio.
- Procesamiento multilingue limitado a espanol, ingles y frances; no se declara soporte para otras lenguas pese a que el checkpoint base es multilingue.
- Analisis de resenas de producto, textos de opinion y, por extension, otros dominios de texto similares (tickets, encuestas, comentarios).
- Inferencia por secuencia unica con `pipeline("text-classification")` de Transformers.
- No se declara soporte de tool calling ni function calling.
- No se declara capacidad de agentes ni razonamiento multi-paso.
- No se declara modo "thinking", vision, audio ni generacion de texto (el modelo es un clasificador, no un modelo generativo).

## Casos de uso

- Analisis de resenas de e-commerce: clasificar automaticamente grandes volumenes de opiniones en es/en/fr para calcular puntuaciones de sentimiento agregadas por producto o vendedor, aprovechando la ventana de 512 tokens para comentarios de longitud media.
- Monitorizacion de reputacion de marca: procesar menciones y comentarios en tres idiomas y detectar picos de sentimiento negativo que activen alertas tempranas en los equipos de comunicacion.
- Triaje de tickets de soporte: etiquetar las incidencias entrantes como negativas, neutras o positivas para priorizar las mas criticas y enrutarlas al equipo adecuado.
- Analisis de encuestas NPS y feedback abierto: convertir respuestas de texto libre en una senal cuantitativa de satisfaccion reutilizable en cuadros de mando.
- Moderacion y filtrado de contenido: marcar comentarios negativos o potencialmente problematicos en foros y secciones de opiniones para revision humana.
- Investigacion academica en NLP: servir como linea base multilingue para comparar tecnicas de clasificacion de sentimiento con otros checkpoints de BERT o DistilBERT.
- Enrutamiento en pipelines de datos: usar la etiqueta de sentimiento como caracteristica adicional en un sistema de recomendacion o en un motor de busqueda de productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, matriz de confusion ni evaluacion por idioma sobre el conjunto de test de `amazon_reviews_multi` u otro corpus. Tampoco hay resultados comparativos frente a modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 700 MB en FP32, 356 MB en FP16 y 178 MB en INT8 para el checkpoint de ~178 M de parametros.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o mas es suficiente; por ejemplo GTX 1050 Ti, RTX 3060, RTX 4090, T4, L4, A10. En A100 y H100 el modelo ira sobradamente y quedara limitado por CPU y por el tamano de batch.
- Cabe sin problemas en GPU de consumo: si, en practicamente cualquier tarjeta moderna, e incluso convive con otros modelos en la misma GPU.
- Inferencia en CPU: viable en produccion para volumenes moderados, dado el reducido numero de parametros.
- Opciones de despliegue: Transformers + PyTorch (referencia en la model card), ONNX Runtime / Hugging Face Optimum para exportacion, TorchScript, FastAPI o Flask como servidor, Hugging Face Inference Endpoints, y servidores de clasificacion como Text Embeddings Inference. No se declara compatibilidad con llama.cpp, Ollama ni vLLM en la informacion disponible (son stacks orientados a generacion, no a clasificacion BERT).
- Latencia y throughput: no publicados. No se proporcionan mediciones de tokens/segundo ni de milisegundos por inferencia para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bngibor/amazon-reviews-sentimiento-mbert | bert-base-multilingual-cased | ~178 M | 512 | es, en, fr | no disponible | HuggingFace |
| Diegopr3312/mbert-sentiment-amazon-multilingual | mBERT (multilingual BERT) | ~178 M | 512 | multilingue (segun su card) | no disponible | HuggingFace |
| sohan-ai/sentiment-analysis-model-amazon-reviews | DistilBERT | ~66 M | 512 | no especificado | no disponible | HuggingFace |
| alexliqu09/Sentiment-Analysis-on-Amazon-Reviews | BERT espanol y mBERT | ~110-178 M | 512 | es, en | no disponible | Repositorio GitHub |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto, idiomas y forma de distribucion.

## Limitaciones y advertencias

- Licencia no especificada: la model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion bajo: al ser un clasificador discriminativo, no genera texto y no puede inventar contenido; el riesgo real es la clasificacion erronea de la clase de sentimiento.
- Sesgos heredados del corpus de resenas de Amazon y del checkpoint multilingue original: dominios de producto, idiomas y estilos concretos pueden estar sobrerrepresentados o sesgados.
- Cobertura idiomatica limitada a es, en, fr; a pesar de que el modelo base es multilingue, el fine-tuning puede degradar el rendimiento en otras lenguas no incluidas en el ajuste.
- Ventana de contexto de 512 tokens: los textos mas largos seran truncados, lo que puede perder informacion relevante en resenas extensas.
- Ausencia total de benchmarks: no hay evidencia publicada de exactitud, F1 por clase ni robustez frente a datos fuera de dominio.
- Sin informacion sobre el balance de clases ni sobre la calibracion de las probabilidades de salida, lo que dificulta fijar umbrales de decision fiables.
- Sin version cuantizada ni formato GGUF/ONNX publicado por el autor; cualquier optimizacion corre a cargo del usuario.
- Riesgo de sobreajuste al dataset `amazon_reviews_multi` (resenas de Amazon), con posible perdida de rendimiento en dominios distintos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bngibor/amazon-reviews-sentimiento-mbert
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/mteb/amazon_reviews_multi
- Repositorio GitHub de referencia (comparativa BERT espanol vs mBERT): https://github.com/alexliqu09/Sentiment-Analysis-on-Amazon-Reviews
- Notebook MBert.ipynb del repositorio anterior: https://github.com/alexliqu09/Sentiment-Analysis-on-Amazon-Reviews/blob/master/MBert.ipynb
- Modelo comparable sohan-ai/sentiment-analysis-model-amazon-reviews: https://huggingface.co/sohan-ai/sentiment-analysis-model-amazon-reviews
- Modelo comparable Diegopr3312/mbert-sentiment-amazon-multilingual: https://huggingface.co/Diegopr3312/mbert-sentiment-amazon-multilingual
- Articulo: Enhancing Product Design through AI-Driven Sentiment Analysis of Amazon Reviews: https://www.mdpi.com/1999-4893/17/2/59
