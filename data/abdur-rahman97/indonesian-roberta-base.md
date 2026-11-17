# abdur-rahman97/indonesian-roberta-base

## Resumen

Indonesian RoBERTa Base es un modelo de lenguaje enmascarado (masked language model) basado en la arquitectura RoBERTa, entrenado desde cero sobre el subconjunto `unshuffled_deduplicated_id` del dataset OSCAR. Lo desarrolla el equipo responsable del proyecto original `flax-community/indonesian-roberta-base` (Wilson Wongso, Steven Limcorn, Samsul Rahmadani y Chew Kok Wah) en el marco del JAX/Flax Community Week de Hugging Face, y esta version concreta la publica el usuario `abdur-rahman97` como espejo del modelo original. Resuelve la necesidad de un encoder preentrenado especifico para indonesio, idioma con menor cobertura en los grandes modelos multilingues.

El modelo cuenta con 124.697.947 parametros (aproximadamente 124M), lo que lo situa en la categoria base de RoBERTa, con una longitud de contexto tipica de 512 tokens heredada de la arquitectura original. No es un modelo generativo ni un modelo de instrucciones: es un encoder bidireccional pensado para tareas de comprension del lenguaje, extraccion de caracteristicas y clasificacion.

Es relevante ahora como pieza de infraestructura para pipelines de NLP en indonesio: sirve como base para fine-tuning en tareas supervisadas, como extractor de embeddings y como modelo de relleno de mascaras. Su licencia MIT facilita su adopcion en entornos comerciales sin las restricciones de otros modelos mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder bidireccional) |
| Parametros totales | 124.697.947 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura RoBERTa; tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y formatos PyTorch/JAX) |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, JAX/Flax |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa descrita en el paper arXiv:1907.11692, es decir, un transformer encoder bidireccional con objetivos de modelado de lenguaje enmascarado (MLM). Se entreno desde cero, no como fine-tuning de un checkpoint multilingue, sobre el subconjunto `unshuffled_deduplicated_id` de OSCAR. El entrenamiento se realizo con el framework Flax de Hugging Face sobre una VM TPUv3-8 proporcionada por Google Cloud, durante 8 epocas, con un tiempo total de 18:25:39.

Los resultados de evaluacion reportados por el autor son una perdida de entrenamiento de 1.870, una perdida de validacion de 1.798 y una precision de validacion de 0.6245 (62,45%). No se detalla en la informacion disponible el numero total de tokens procesados, la composicion exacta del dataset mas alla del subconjunto OSCAR, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un encoder MLM). Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Relleno de mascaras (masked language modeling): predice el token enmascarado en una frase en indonesio.
- Extraccion de caracteristicas (feature extraction): genera representaciones contextuales por token para tareas downstream.
- Clasificacion de texto: base para fine-tuning en analisis de sentimiento, clasificacion de topicos o deteccion de spam en indonesio.
- Reconocimiento de entidades nombradas (NER): tras fine-tuning supervisado.
- Respuesta a preguntas extractiva: tras fine-tuning sobre datasets en indonesio.
- Similitud semantica y recuperacion: uso de embeddings para busqueda y clustering.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un encoder, no un modelo generativo de instrucciones).
- Capacidades multilingues limitadas al indonesio; no se reporta transferencia a otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de sentimiento en resenas y redes sociales en indonesio: se anade una cabeza de clasificacion sobre el encoder y se hace fine-tuning con un dataset etiquetado; el modelo base ya aporta representaciones contextuales del indonesio.
- Deteccion de noticias falsas o spam: fine-tuning del encoder para clasificacion binaria de textos periodisticos o mensajes, aprovechando el preentrenamiento sobre OSCAR.
- Extraccion de entidades en documentos: fine-tuning para NER sobre corpus indonesios (personas, organizaciones, lugares) en pipelines de procesamiento documental.
- Busqueda semantica en catalogo de productos: uso del modelo como extractor de embeddings para indexar descripciones en indonesio y recuperar por similitud coseno.
- Moderacion de contenido en foros: clasificacion de comentarios toxicos o fuera de normativa mediante fine-tuning, con inferencia por lotes en CPU o GPU.
- Agrupamiento y analisis de encuestas abiertas: generacion de embeddings de respuestas libres en indonesio para clustering y analisis tematico.
- Sistema de preguntas y respuestas extractivas sobre FAQs: fine-tuning sobre pares pregunta-respuesta en indonesio para localizar el fragmento relevante en un documento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de entrenamiento y validacion del propio modelo:

| Metrica | Valor |
|---|---|
| Train loss | 1.870 |
| Valid loss | 1.798 |
| Valid accuracy | 0.6245 (62,45%) |
| Tiempo total de entrenamiento | 18:25:39 |
| Epocas | 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, IndoNLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124M parametros x 4 bytes), mas memoria para activaciones y batch.
- VRAM estimada en FP16: aproximadamente 0,25 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1060 6 GB, RTX 3060, RTX 4090, etc.
- GPU recomendadas para fine-tuning: RTX 3090/4090 (24 GB) para batches grandes; A100 o H100 para entrenamiento a mayor escala.
- Tambien es viable la inferencia en CPU para tareas de baja latencia y batches pequenos.
- Opciones de despliegue: Hugging Face Transformers (PyTorch y Flax), pipeline `fill-mask`, exportacion a ONNX, y servidores de inferencia compatibles con modelos encoder (por ejemplo, Text Embeddings Inference para embeddings).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indonesian RoBERTa Base (este modelo) | 124M | no disponible (tipicamente 512) | indonesio | MIT | Hugging Face |
| IndoBERT Base (IndoLEM) | ~124M | 512 | indonesio | no disponible en la informacion | Hugging Face |
| XLM-RoBERTa Base | ~278M | 512 | multilingue (100 idiomas) | MIT | Hugging Face |
| mBERT Base | ~178M | 512 | multilingue (104 idiomas) | Apache 2.0 | Hugging Face |

La comparativa se basa en caracteristicas generales de modelos conocidos de la misma categoria; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada. Frente a XLM-RoBERTa y mBERT, este modelo es mas pequeno y especifico para indonesio, lo que reduce coste de inferencia pero limita la cobertura multilingue. Frente a IndoBERT, la diferencia principal es la licencia MIT y el origen del preentrenamiento (OSCAR frente a corpus especificos de IndoLEM).

## Limitaciones y advertencias

- Es un encoder MLM, no un modelo generativo: no produce texto libre ni sigue instrucciones.
- Riesgo de alucinacion en el sentido de predicciones de mascara incorrectas o sesgadas segun el corpus OSCAR.
- Sesgos potenciales heredados de OSCAR (texto web sin curacion fina): dominios, registros y sesgos socioculturales no controlados.
- Cobertura limitada al indonesio; no se garantiza un rendimiento aceptable en otros idiomas ni en variantes regionales.
- Longitud de contexto no documentada explicitamente; se asume la de RoBERTa (512 tokens), lo que limita documentos largos sin truncado o chunking.
- Solo se reportan metricas de validacion del preentrenamiento; no hay evaluacion en tareas downstream ni benchmarks estandar.
- El repositorio indica 0 descargas y 0 likes, y la fecha de creacion es 2026-11-17: conviene verificar la procedencia y la integridad de los pesos antes de usarlo en produccion.
- La model card original hace referencia al repositorio `flax-community/indonesian-roberta-base`; esta version es un espejo publicado por otro usuario, por lo que la trazabilidad del checkpoint no esta garantizada por el autor original.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del dataset OSCAR subyacente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/abdur-rahman97/indonesian-roberta-base
- Repositorio original: https://huggingface.co/flax-community/indonesian-roberta-base
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Dataset OSCAR: https://huggingface.co/datasets/oscar
- JAX/Flax Community Week: https://discuss.huggingface.co/t/open-to-the-community-community-week-using-jax-flax-for-nlp-cv/7104
- Metricas de entrenamiento (TensorBoard): https://huggingface.co/flax-community/indonesian-roberta-base/tensorboard
- Archivos y scripts de entrenamiento: https://huggingface.co/flax-community/indonesian-roberta-base/tree/main
