# ar-ghani/hf_food_not_food_classification

## Resumen

`hf_food_not_food_classification` es un modelo de clasificación de texto binario desarrollado por ar-ghani que determina si una frase habla de comida o no. Se trata de un fine-tuning del modelo `distilbert/distilbert-base-uncased`, un transformer encoder preentrenado mediante destilación de BERT. El modelo está publicado en HuggingFace bajo licencia Apache-2.0 y está disponible exclusivamente en formato safetensors.

El modelo resuelve una tarea sencilla y bien delimitada: clasificar textos en dos categorías, "food" o "not food". Su relevancia actual radica en que puede integrarse en flujos de procesamiento de lenguaje natural donde se necesite filtrar o categorizar contenido relacionado con alimentación, como redes sociales, reseñas o tickets de soporte. Con 66.955.010 parámetros, es un modelo ligero que puede ejecutarse en CPU o en GPUs de gama baja. La información sobre la longitud de contexto, los idiomas soportados y el dataset de entrenamiento no está disponible en la ficha del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado mediante destilación del modelo BERT base. Sobre esta arquitectura se ha añadido una cabeza de clasificación lineal con dos salidas (food / not food). El proceso de entrenamiento consistió en un fine-tuning supervisado sobre un dataset desconocido, sin información sobre su tamaño, composición o procedencia.

Según la model card, el entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 0.0001, batch size de 32, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 10 épocas. El número total de pasos fue 70, lo que sugiere un dataset de entrenamiento muy pequeño (aproximadamente 56 muestras con batch 32). No se menciona ningún proceso de RLHF, DPO ni técnicas de alineación. Tampoco se describen innovaciones técnicas destacables; se trata de un fine-tuning estándar de un modelo preentrenado.

## Capacidades

- Clasificación de texto binaria: determina si una frase en inglés habla de comida o no.
- Generación de probabilidades para cada clase (food / not food), lo que permite medir la confianza de la predicción.
- Inferencia rápida gracias al reducido tamaño del modelo (67M parámetros).
- Compatibilidad con el pipeline `text-classification` de HuggingFace Transformers.
- Soporte para despliegue en HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`).
- No ofrece capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Filtrado de contenido en redes sociales: el modelo puede analizar publicaciones de usuarios y clasificarlas como relacionadas con comida o no, permitiendo a una plataforma categorizar automáticamente contenido gastronómico o detectar spam culinario.
- Clasificación de reseñas en portales de restaurantes: separar reseñas que hablan de la comida de otras que hablan del servicio, el ambiente o el precio, facilitando análisis específicos por dimensión.
- Automatización de tickets de soporte: en una empresa de catering o delivery, el modelo puede clasificar tickets entrantes en "comida" o "no comida" para enrutarlos al equipo adecuado, por ejemplo, quejas de pedidos frente a consultas de facturación.
- Análisis de encuestas de satisfacción: identificar respuestas abiertas que mencionan la comida para extraer insights sobre la calidad de los platos o el menú, ignorando comentarios sobre otros aspectos.
- Categorización de productos en e-commerce: dado un texto descriptivo de un producto, el modelo puede determinar si es un artículo alimenticio o no, ayudando a mantener un catálogo segmentado.
- Investigación de mercado: filtrar menciones de comida en comentarios de redes sociales o foros para analizar tendencias de consumo, hábitos alimenticios o reacciones a campañas publicitarias.
- Detección de mensajes fuera de tema en comunidades de recetas: en un foro o chat especializado en cocina, el modelo puede identificar mensajes que no tratan sobre comida para moderarlos o archivarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente resultados de evaluación sobre un conjunto de validación desconocido, reportando una pérdida de 0.0004 y una exactitud (accuracy) de 1.0. Estos datos deben interpretarse con cautela: el tamaño del dataset de entrenamiento parece muy reducido y la exactitud perfecta sugiere un posible sobreajuste. No se proporcionan comparaciones con otros modelos ni resultados en conjuntos de referencia estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en FP32 y 134 MB en FP16 (cálculo basado en 66.955.010 parámetros). En la práctica, el modelo puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: no requiere una GPU específica; cualquier GPU moderna (NVIDIA GTX/RTX, AMD, Apple Silicon) es suficiente. También puede ejecutarse en CPU con rendimiento adecuado para tareas de clasificación por lotes.
- Compatibilidad con consumer GPU: sí, el modelo cabe en cualquier GPU de consumo, incluidas las integradas.
- Opciones de despliegue: HuggingFace Transformers (pipeline `text-classification`), ONNX Runtime, HuggingFace Inference Endpoints, y cualquier servidor que soporte safetensors.
- Latencia y throughput estimados: no disponible. Dado el tamaño del modelo, la latencia por inferencia debería ser del orden de milisegundos en CPU y submilisegundos en GPU, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `ar-ghani/hf_food_not_food_classification` | 66.955.010 | no disponible | Apache-2.0 | Clasificación binaria food / not food |
| `distilbert/distilbert-base-uncased` | 66.955.010 (aprox.) | 512 tokens | Apache-2.0 | Modelo base preentrenado, no clasifica específicamente comida |
| `bert-base-uncased` | 110.000.000 | 512 tokens | Apache-2.0 | Modelo base preentrenado, mayor capacidad, más lento |

No se dispone de datos de rendimiento comparativo publicados. La principal diferencia entre el modelo evaluado y los modelos base es que `hf_food_not_food_classification` ya está ajustado para una tarea concreta, mientras que los otros requieren un fine-tuning adicional.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, por lo que no se puede evaluar la generalización del modelo a dominios distintos del utilizado durante el fine-tuning.
- La exactitud de 1.0 en el conjunto de evaluación, junto con el bajo número de pasos de entrenamiento (70) y el pequeño tamaño del dataset, apunta a un posible sobreajuste. El modelo podría fallar en textos reales no vistos.
- No se especifican los idiomas soportados. Dado que el modelo base es `distilbert-base-uncased`, es probable que solo funcione correctamente en inglés, pero no está confirmado.
- No ofrece capacidades generativas ni de razonamiento; es exclusivamente un clasificador de texto.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo no incluye garantías de precisión ni de adecuación a un propósito específico.
- La longitud de contexto no está documentada en la ficha, lo que limita la planificación de uso en textos muy largos.
- No se han publicado evaluaciones de sesgos ni de robustez frente a ataques adversariales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ar-ghani/hf_food_not_food_classification
- Proyecto similar en GitHub (workflow completo de fine-tuning de DistilBERT para food/not food): https://github.com/AnubhavKarki/hf-food-not-food-classification
- Demo interactiva de un clasificador food/not food en HuggingFace Spaces: https://huggingface.co/spaces/Alex1-ai/learn_hf_food_not_food_text_classifier_demo
- Modelo base preentrenado: https://huggingface.co/distilbert/distilbert-base-uncased
