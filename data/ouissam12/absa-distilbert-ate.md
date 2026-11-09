# Ouissam12/absa-distilbert-ate

## Resumen

absa-distilbert-ate es un modelo de clasificación de tokens (token-classification) especializado en la extracción de términos de aspecto (Aspect Term Extraction, ATE) dentro de la tarea más amplia de análisis de sentimiento basado en aspectos (ABSA). Lo desarrolla Ouissam12 en el marco del proyecto EspoCRM-OmniSentiment de la ENSAM Meknès, y se obtiene mediante fine-tuning de distilbert-base-uncased sobre los conjuntos de datos de SemEval 2014, 2015 y 2016 en dominios de restaurantes y portátiles, en inglés. El modelo etiqueta cada token con un esquema BIO (O, B-ASP, I-ASP), de modo que su salida es la secuencia de términos de aspecto presentes en una reseña, no la polaridad asociada a cada uno.

Con 66.365.187 parámetros, una arquitectura transformer encoder de tipo DistilBERT y un tamaño de repositorio de 0,3 GB, el modelo está pensado para etapas de preprocesado dentro de pipelines ABSA: primero se extraen los aspectos y después un clasificador de sentimiento independiente determina la polaridad de cada uno. Su relevancia práctica reside en que DistilBERT reduce el coste computacional frente a BERT-base manteniendo una arquitectura estándar compatible con el ecosistema Transformers, lo que permite desplegarlo en CPU o en GPU de gama media para tareas de etiquetado secuencial.

La ficha se basa únicamente en la información pública disponible en Hugging Face y en la model card del autor; no se han publicado resultados de benchmarks ni detalles adicionales sobre el proceso de entrenamiento, por lo que varios apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.365.187 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura DistilBERT admite hasta 512 tokens, aunque no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización dinámica vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | distilbert/distilbert-base-uncased |
| Tarea | token-classification (esquema BIO: O, B-ASP, I-ASP) |
| Dominios de entrenamiento | restaurantes y portátiles (SemEval 2014/2015/2016) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder de 6 capas obtenido por destilación de BERT-base (12 capas, 110M de parámetros). DistilBERT conserva la mitad de las capas y aproximadamente el 60 % de los parámetros del modelo profesor, con una arquitectura estándar de atención multi-cabeza y embeddings de tokens con vocabulario WordPiece en minúsculas. Sobre esta base se añade una cabeza de clasificación de tokens que proyecta la representación contextual de cada token a las tres etiquetas del esquema BIO empleado para ATE.

Según la model card, el ajuste fino se realizó sobre los conjuntos de datos de SemEval 2014, 2015 y 2016 en los dominios de restaurantes y portátiles, en inglés. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros ni si se aplicaron técnicas de regularización o aumentado de datos. Tampoco se indica si hubo etapas de RLHF o DPO, algo por otra parte poco habitual en un modelo de etiquetado secuencial de este tamaño.

## Capacidades

- Extracción de términos de aspecto (ATE) en reseñas en inglés mediante etiquetado BIO token a token.
- Clasificación de tokens con la interfaz estándar de Transformers (`pipeline("token-classification")`), incluida la agregación de subtokens con `aggregation_strategy="first"`.
- Identificación de aspectos en dominios de restaurantes y portátiles, los dos dominios cubiertos por SemEval 2014/2015/2016.
- Integración en pipelines ABSA de dos etapas: extracción de aspectos con este modelo y clasificación de polaridad con un modelo separado.
- No soporta tool calling ni function calling: es un modelo de clasificación de tokens, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al inglés; no se documenta soporte para otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de reseñas de restaurantes: el modelo extrae los términos de aspecto (platos, servicio, ambiente, precio) de cada reseña y los entrega a un clasificador de polaridad para construir informes agregados por aspecto.
- Monitorización de opiniones de productos portátiles: en fichas de e-commerce, se identifican los aspectos mencionados (pantalla, batería, teclado, rendimiento) para alimentar dashboards de calidad percibida.
- Preprocesado en un pipeline ABSA completo: al aislar los términos de aspecto, reduce el ruido que recibe el clasificador de sentimiento y mejora la trazabilidad de las predicciones por aspecto.
- Enriquecimiento de CRM con análisis de feedback: en el contexto del proyecto EspoCRM-OmniSentiment, el modelo puede procesar tickets o encuestas y etiquetar los aspectos mencionados por el cliente para su explotación analítica.
- Etiquetado asistido de datos: sirve como preanotador para generar borradores de anotaciones BIO que revisores humanos corrigen, acelerando la construcción de corpus ABSA propios.
- Despliegue en entornos con recursos limitados: al tratarse de un DistilBERT de 66M de parámetros, puede ejecutarse en CPU o en GPU de gama media para procesar lotes de reseñas sin infraestructura dedicada.
- Extracción de aspectos en investigación académica: como baseline reproducible para experimentos ABSA en inglés sobre los dominios de SemEval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall o F1 sobre los conjuntos de test de SemEval, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,25-0,3 GB para los pesos (66M de parámetros), más el overhead de activaciones y del runtime de PyTorch.
- VRAM estimada en fp16: en torno a 0,15 GB para los pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. En GPU, cualquier tarjeta con al menos 2 GB de memoria es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en placas integradas para inferencia en CPU.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Inference Endpoints, ONNX Runtime, así como exportación a otros runtimes de inferencia; no se documenta compatibilidad específica con vLLM, TGI o llama.cpp (este último no aplica a un modelo encoder de clasificación).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouissam12/absa-distilbert-ate | 66,4M | no disponible | ATE (token-classification, BIO) | apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66,4M | 512 tokens (arquitectura) | Modelo base genérico (MLM) | apache-2.0 | Hugging Face |
| bert-base-uncased | 110M | 512 tokens (arquitectura) | Modelo base genérico (MLM) | apache-2.0 | Hugging Face |
| Modelos ABSA basados en BERT citados en la literatura (p. ej., variantes DistilBERT-Attention) | no disponible | no disponible | ABSA / ATE | no disponible | Publicaciones académicas |

La comparación con alternativas específicas de ATE queda limitada porque no se han publicado métricas de rendimiento para este modelo ni se dispone de datos verificables de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Cubre solo los dominios de restaurantes y portátiles de SemEval 2014/2015/2016; el rendimiento en otros dominios (electrónica, moda, servicios) no está documentado y probablemente sea inferior.
- El modelo extrae términos de aspecto, no polaridad: no debe presentarse como un analizador de sentimiento completo por sí solo.
- Riesgo de alucinación estructural: al ser un etiquetador secuencial, puede marcar como aspecto términos que no lo son o fragmentar expresiones multi-token de forma incorrecta, especialmente en textos con ruido, abreviaturas o errores ortográficos.
- No se han publicado métricas de evaluación, por lo que no es posible cuantificar su precisión antes de desplegarlo en producción.
- Sesgos: no se documenta ningún análisis de sesgos; al derivar de distilbert-base-uncased, puede heredar sesgos presentes en el corpus de preentrenamiento (mayoritariamente web en inglés).
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones de los datasets SemEval empleados en el fine-tuning si se redistribuye el modelo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación registrada en 2026-11-08, posterior a la mayoría de modelos de referencia; verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ouissam12/absa-distilbert-ate
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio de referencia ABSA-DistilBERT: https://github.com/ankitbansal811/ABSA-DistilBERT
- Artículo sobre DistilBERT-Attention para ABSA: https://jcmm.co.in/index.php/jcmm/article/view/653
