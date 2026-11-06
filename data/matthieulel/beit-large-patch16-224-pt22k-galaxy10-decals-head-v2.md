# matthieulel/beit-large-patch16-224-pt22k-galaxy10-decals-head-v2

## Resumen

El modelo `beit-large-patch16-224-pt22k-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel`. Se construye a partir del backbone `microsoft/beit-large-patch16-224-pt22k`, un transformer de visión BEiT (BERT Pre-Training for Image Transformers) preentrenado con 22.000 clases de ImageNet-22k, al que se le ha sustituido y entrenado únicamente la cabeza de clasificación lineal para predecir 10 clases morfológicas sobre el conjunto Galaxy10 DECaLS.

El modelo forma parte de una colección más amplia denominada Vision Foundation Models Benchmark, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación distintos (head-only y fine-tuning completo) en el contexto de un artículo en revisión para la revista *Astronomy and Computing* titulado *When foundation models meet astronomical data*. Este checkpoint concreto corresponde al régimen de head-only fine-tuning, con el backbone congelado y solo la capa lineal final entrenada.

Con 303 millones de parámetros totales y un tamaño de repositorio de 1,2 GB, el modelo es un ejemplo de adaptación de bajo coste de un backbone de propósito general a un dominio científico muy específico. Su relevancia radica en servir como referencia reproducible y controlada dentro de un benchmark sistemático, más que en ofrecer un rendimiento estado del arte en clasificación morfológica de galaxias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer con preentrenamiento enmascarado tipo BERT), backbone large patch16 224 |
| Parametros totales | 303.147.466 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija de 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un BEiT-large con parches de 16x16 píxeles y resolución de entrada de 224x224, preentrenado por Microsoft sobre ImageNet-22k (`microsoft/beit-large-patch16-224-pt22k`). Sobre él se añade una única capa lineal de 10 salidas que constituye la cabeza de clasificación entrenada. Durante el entrenamiento, el backbone permanece completamente congelado, incluidas las estadísticas de sus capas de normalización, de modo que solo se optimizan los parámetros de la cabeza lineal.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total), con una división estratificada por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test público reservadas como conjunto de evaluación held-out. La receta fue idéntica para los 40 backbones del benchmark: AdamW con betas 0,9/0,999, epsilon 1e-8, weight decay 0,1, gradient clipping 1,0, learning rate 1e-4 con schedule lineal y 10% de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo de 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una única GPU. El aumento de datos consistió en random resized crop a la resolución de entrada y volteo horizontal aleatorio. La evaluación aplica resize y center crop a 224x224 px seguido de la normalización del image processor del checkpoint. La época seleccionada (29 de 30) corresponde al mínimo de pérdida de validación. La semilla principal es 42, y se reportan medias y desviaciones típicas sobre las semillas 42, 1 y 2.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de representaciones visuales de propósito general heredadas del backbone BEiT-large preentrenado en ImageNet-22k (utilizable con el backbone congelado para tareas de transferencia).
- Inferencia determinista y reproducible: se verificó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100% con los logits guardados de la época seleccionada (diferencia absoluta máxima de 2,12e-05).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa ni audio.
- No tiene capacidades multilingües: es un modelo puramente visual sin componente lingüístico.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en pipelines astronómicos: el modelo puede etiquetar imágenes de 224x224 px en una de las 10 clases de Galaxy10 DECaLS, sirviendo como primer filtro automático antes de la inspección visual por expertos.
- Referencia reproducible en benchmarks de foundation models: al formar parte de la colección Vision Foundation Models Benchmark, se usa para comparar sistemáticamente el rendimiento de backbones preentrenados bajo un protocolo idéntico de head-only fine-tuning.
- Estudio del régimen de adaptación head-only frente a fine-tuning completo: permite cuantificar cuánto rendimiento se obtiene congelando el backbone frente a entrenar todos los parámetros, con la misma receta y splits.
- Prototipado rápido de clasificadores astronómicos de bajo coste: al entrenar solo una capa lineal sobre un backbone congelado, el coste computacional de adaptación es mínimo, adecuado para equipos con recursos limitados.
- Docencia y experimentación en transfer learning: sirve como ejemplo canónico de adaptación de un ViT preentrenado a un dominio científico con un dataset pequeño y una única GPU.
- Análisis de morfología galáctica a escala en catálogos DECaLS: integrable en flujos de preprocesado que apliquen resize y center crop a 224x224 px antes de la inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor (%) | Notas |
|---|---|---|
| Accuracy (semilla 42, época 29) | 31,62 | Checkpoint de este repositorio |
| Weighted F1 (semilla 42, época 29) | 27,73 | Checkpoint de este repositorio |
| Accuracy media +/- desv. tip. (3 semillas) | 31,29 +/- 0,34 | Semillas 42, 1, 2 |
| Weighted F1 media +/- desv. tip. (3 semillas) | 27,36 +/- 0,32 | Semillas 42, 1, 2 |

Evolución de la accuracy de test a lo largo del entrenamiento (semilla 42): 13,92% en la época 1, 24,97% en la época 7, 30,38% en la época 17, 31,79% en la época 25 y 31,62% en la época 29 (seleccionada). No se han publicado en la información disponible resultados comparativos con otros modelos del benchmark ni con clasificadores específicos de morfología galáctica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3-1,5 GB para los pesos (303 M de parámetros) más el overhead de activaciones, en torno a 2-3 GB en total con batches pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,7-0,8 GB para los pesos; el modelo cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090); para entrenamiento de la cabeza lineal basta una GPU de gama media, ya que el backbone está congelado. El autor usó una única GPU en fp32.
- Cabe en GPU consumer: sí, en todas las GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (AutoModelForImageClassification + AutoImageProcessor), exportación a ONNX, TorchScript o TensorRT para producción; también es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de los otros 39 backbones del benchmark ni de clasificadores específicos de morfología galáctica con los que comparar directamente. La comparación cuantitativa entre configuraciones está prevista en el artículo en revisión y en el dataset `vision-foundation-models-benchmark-runs`.

| Modelo | Parametros | Contexto/entrada | Accuracy test | Licencia |
|---|---|---|---|---|
| Este checkpoint (BEiT-large head-only) | 303 M | 224x224 px | 31,62% | apache-2.0 |
| Otros backbones del benchmark | no disponible | no disponible | no disponible | no disponible |
| Clasificadores especificos de morfologia galactica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: una accuracy de test del 31,62% sobre 10 clases (frente al 10% de azar) indica que el régimen head-only con backbone congelado no captura bien la morfología galáctica; el modelo no es adecuado como clasificador de producción sin mejoras.
- El backbone está congelado, incluidas las estadísticas de normalización, lo que limita la adaptación a la distribución específica de imágenes astronómicas.
- Riesgo de sesgo hacia las clases mayoritarias del dataset Galaxy10 DECaLS; el weighted F1 (27,73%) es inferior a la accuracy, lo que sugiere desequilibrio en el rendimiento por clase.
- Entrada fija de 224x224 px: las imágenes astronómicas de mayor resolución deben redimensionarse, con posible pérdida de detalle morfológico fino.
- Resultados no verificados externamente (`verified: false` en el model-index); proceden únicamente del autor.
- Licencia apache-2.0 permite uso comercial, pero el modelo base BEiT de Microsoft debe verificarse por separado; además, el uso científico en astronomía requiere validación contra catálogos de referencia.
- No apto para tareas de texto, razonamiento, código ni agentes; es exclusivamente un clasificador de imágenes.
- El artículo asociado está en revisión, por lo que el protocolo y los resultados pueden cambiar tras la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/beit-large-patch16-224-pt22k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/beit-large-patch16-224-pt22k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing (versión revisada, 2026); cita pendiente de publicación.
