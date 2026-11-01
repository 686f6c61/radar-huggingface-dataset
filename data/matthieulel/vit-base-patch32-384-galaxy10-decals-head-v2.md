# matthieulel/vit-base-patch32-384-galaxy10-decals-head-v2

## Resumen

`vit-base-patch32-384-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace matthieulel. Se construye sobre el checkpoint `google/vit-base-patch32-384` (Vision Transformer con parches de 32x32 píxeles y resolución de entrada de 384x384) y se adapta al dataset Galaxy10 DECaLS, que contiene 17.736 imágenes de galaxias etiquetadas en 10 clases morfológicas.

La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone ViT permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas. El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

Es relevante como referencia reproducible para evaluar hasta qué punto un backbone genérico de visión, sin reentrenamiento completo, puede resolver una tarea científica de clasificación fina como la morfología galáctica. Con 87,5 millones de parámetros y un tamaño de repositorio de 0,4 GB, es ligero y desplegable en hardware modesto, y su licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 32, resolución 384x384) con cabeza lineal de clasificación |
| Parámetros totales | 87.535.882 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 384x384 px) |
| Tipos de cuantización | no disponibles (pesos en safetensors, precisión original fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Número de clases | 10 (morfología galáctica Galaxy10 DECaLS) |
| Modelo base | google/vit-base-patch32-384 |
| Dataset de entrenamiento | matthieulel/galaxy10_decals |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer estándar de tipo ViT-Base: divide la imagen de entrada de 384x384 píxeles en parches de 32x32 (144 tokens), los proyecta linealmente y los procesa con la pila de bloques transformer del checkpoint `google/vit-base-patch32-384`. Sobre la representación del token CLS se aplica una única capa lineal con 10 salidas, una por clase morfológica. El backbone se mantiene congelado, incluidas las estadísticas de las capas de normalización, de modo que el único componente entrenado es esa cabeza lineal.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de evaluación held-out y el split de train dividido de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones de la colección, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. Como aumentación se aplican random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 384x384 px y se aplica la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software utilizado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ViT-Base congelado (representaciones del token CLS reutilizables para otras tareas).
- Inferencia determinista y reproducible: el autor verificó que las predicciones coinciden con los logits guardados en el 100% de las primeras 96 imágenes de test (diferencia absoluta máxima de 4,17e-06).
- Sin soporte de tool calling, function calling ni agentes.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo thinking, visión general, audio ni otras modalidades.
- No es un modelo de propósito general: su espacio de etiquetas está fijado a las 10 clases del dataset.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos astronómicos: el modelo puede procesar recortes de imágenes DECaLS a 384x384 px y asignar una de las 10 clases morfológicas, sirviendo como primer filtro en pipelines de inspección de grandes volúmenes de imágenes.
- Etiquetado asistido para campañas de ciencia ciudadana: usar las predicciones como sugerencia inicial que los voluntarios revisan, reduciendo el esfuerzo manual en proyectos tipo Galaxy Zoo.
- Baseline reproducible en investigación: al ser una configuración documentada de un benchmark de 80 configuraciones, permite comparar el rendimiento de adaptación head-only frente a fine-tuning completo sobre el mismo backbone.
- Extracción de embeddings para búsqueda por similitud: las representaciones del token CLS del backbone congelado pueden indexarse para recuperar galaxias visualmente similares en un catálogo.
- Selección de candidatos para seguimiento espectroscópico: filtrar por clase morfológica antes de asignar tiempo de telescopio, priorizando categorías de interés científico.
- Validación de pipelines de preprocesado: dado que el protocolo de evaluación está fijado (resize y center crop a 384x384 con la normalización del processor), el modelo sirve como referencia para detectar desviaciones en el preprocesado de imágenes astronómicas.
- Docencia y experimentación con modelos de visión en dominio científico: su tamaño reducido (0,4 GB) y su licencia Apache 2.0 permiten desplegarlo en entornos docentes y en GPUs de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Este checkpoint (semilla 42, época 30) | Media ± desviación típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 52,20 | 52,33 ± 0,23 |
| Weighted F1 (%) | 49,40 | 49,49 ± 0,28 |

Evolución de la accuracy de test a lo largo del entrenamiento (semilla 42, selección por mínima pérdida de validación):

| Época | Val. loss | Val. acc. (%) | Test acc. (%) | Test weighted F1 (%) |
|---|---|---|---|---|
| 1 | 2,3124 | 12,68 | 10,82 | 5,02 |
| 5 | 1,6663 | 46,34 | 44,87 | 40,44 |
| 10 | 1,4915 | 50,51 | 49,49 | 45,95 |
| 15 | 1,4285 | 51,47 | 50,39 | 47,11 |
| 20 | 1,3968 | 52,48 | 51,63 | 48,82 |
| 25 | 1,3781 | 53,38 | 52,20 | 49,41 |
| 30 (seleccionada) | 1,3733 | 53,10 | 52,20 | 49,40 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 87,5 millones de parámetros ocupan aproximadamente 350 MB de pesos; con activaciones y overhead de runtime, el consumo típico se sitúa en torno a 1-2 GB de VRAM para batches pequeños. En fp16 el peso de los parámetros baja a unos 175 MB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Funciona en A100, H100, RTX 4090, RTX 3090 y GPUs de gama media como RTX 3060 o T4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, tal como muestra la model card; el formato safetensors es compatible con TGI y con pipelines de HuggingFace. No se documenta soporte de GGUF ni de llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la resolución de entrada (384x384, 144 tokens), se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de resultados de modelos comparables sobre Galaxy10 DECaLS en la información proporcionada. Como referencia estructural, se compara con el checkpoint base y con el régimen alternativo del mismo benchmark:

| Modelo | Parámetros | Entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| vit-base-patch32-384-galaxy10-decals-head-v2 | 87,5 M | 384x384 px | 10 clases | 52,20% (test) | Apache 2.0 |
| google/vit-base-patch32-384 (base sin adaptar) | 87,5 M | 384x384 px | ImageNet-1k (1.000 clases) | no disponible | Apache 2.0 |
| Otras configuraciones del benchmark del autor | no disponible | no disponible | 10 clases | no disponible en esta ficha | no disponible |

El propio autor indica que este checkpoint es una de las 80 configuraciones del benchmark *Vision Foundation Models Benchmark*, pero los resultados del resto de configuraciones no se incluyen en la información disponible.

## Limitaciones y advertencias

- Rendimiento moderado: una accuracy de test del 52,20% sobre 10 clases implica una tasa de error cercana al 48%; no es adecuado para clasificación automática sin revisión humana en contextos científicos exigentes.
- Sesgos de dominio: el modelo solo se ha evaluado sobre Galaxy10 DECaLS; su comportamiento en imágenes de otros instrumentos, profundidades o condiciones de seeing es desconocido.
- Riesgo de alucinación en sentido clasificatorio: al ser un clasificador cerrado, siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución (ruido, artefactos, objetos no galácticos), sin mecanismo de abstención.
- Limitación de idioma: no aplica, pero tampoco dispone de capacidades lingüísticas ni multimodales más allá de la clasificación de imágenes.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la idoneidad científica de las predicciones.
- Protocolo de adaptación limitado: al entrenar solo la cabeza lineal con backbone congelado, el modelo no aprovecha el ajuste de representaciones al dominio astronómico; un fine-tuning completo podría mejorar el rendimiento, pero no se ha evaluado en esta ficha.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; proceden del autor y no de una evaluación independiente.
- Reproducibilidad dependiente del preprocesado: el protocolo exige resize y center crop a 384x384 px con la normalización del image processor del checkpoint; desviarse de él puede degradar las predicciones.
- Sin datos de cuantización: no se documentan versiones GGUF, ONNX ni cuantizadas, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-base-patch32-384-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-base-patch32-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación según el autor)
