# matthieulel/resnet101-galaxy10-decals-full-v2

## Resumen

`resnet101-galaxy10-decals-full-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por matthieulel como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un `resnet101` de torchvision (pesos ImageNet-1k `IMAGENET1K_V1`) adaptado mediante *full fine-tuning* de todos sus parámetros a las 10 clases del dataset Galaxy10 DECaLS, con una cabeza lineal de 10 salidas que sustituye a la original de 1000.

El modelo resuelve una tarea acotada y bien delimitada: asignar una de diez categorías morfológicas a imágenes de galaxias procedentes del sondeo DECaLS. Su relevancia es metodológica más que de producto: forma parte de un conjunto de 80 configuraciones (40 backbones preentrenados × dos regímenes de adaptación) evaluadas bajo un protocolo idéntico, lo que permite comparaciones controladas entre modelos de visión de propósito general y datos astronómicos. El checkpoint publicado corresponde al epoch 14 de 30, seleccionado por mínima pérdida de validación.

Con 42.625.994 parámetros y un repositorio de 0,2 GB, es un modelo compacto que se ejecuta en una única GPU consumer. Alcanza un 83,71 % de accuracy y un 83,38 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes (semilla 42). La media sobre tres semillas es 83,48 ± 0,44 % de accuracy. La licencia es BSD-3-Clause, permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-101 (CNN residual, torchvision `resnet101`, pesos `IMAGENET1K_V1`) con cabeza lineal de 10 clases |
| Parametros totales | 42.625.994 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 px) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en precisión original; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin entrada de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), cargable con `safetensors.torch.load_file` |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-101 estándar: red convolucional residual con 101 capas, bloques *bottleneck* y conexiones residuales, inicializada con los pesos de ImageNet-1k `IMAGENET1K_V1` de torchvision. La única modificación estructural es la capa fully connected final, reemplazada por una capa lineal de 101→10 salidas. El régimen es *full fine-tuning*: se actualizan todos los parámetros, sin congelar el backbone.

El entrenamiento usa Galaxy10 DECaLS (17.736 imágenes), dividido de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación a partir del split público de train, manteniendo el split público de test (1.774 imágenes) como conjunto reservado. La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batch efectivo de 256 (32 imágenes × 8 pasos de acumulación), 30 epochs, fp32 con TF32 desactivado y una sola GPU. El aumento de datos se limita a *random resized crop* a la resolución de entrada y *random horizontal flip*; en evaluación se redimensiona y recorta al centro a 224×224 px con la normalización estándar de ImageNet. La selección del checkpoint se hace por mínima pérdida de validación (epoch 14). El autor declara una comprobación de integridad: recarga del modelo y ejecución sobre las primeras 96 imágenes de test con predicciones idénticas al 100 % respecto a los logits guardados (diferencia absoluta máxima 3,10e-06).

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales de propósito general heredadas del preentrenamiento en ImageNet-1k, reutilizables como backbone congelado.
- Inferencia sobre imágenes RGB de 224×224 px con la normalización estándar de ImageNet.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso: es un clasificador puro, sin interfaz de texto.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni ninguna otra modalidad.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo asigna una de las 10 clases de Galaxy10 DECaLS a cada recorte de galaxia, lo que permite procesar lotes de imágenes de sondeos como DECaLS sin intervención manual y con un coste computacional bajo (42,6 M de parámetros).
- Etiquetado previo para revisión humana: al alcanzar un 83,71 % de accuracy, puede usarse como primer filtro en campañas de etiquetado, reservando la inspección visual para los casos de baja confianza (logits próximos entre clases).
- *Baseline* en investigación comparativa: sirve como referencia CNN convolucional frente a modelos de visión de propósito general (ViT, DINOv2, CLIP) dentro del benchmark del autor, con receta y splits idénticos que garantizan comparabilidad.
- Extracción de *embeddings* para agrupamiento o búsqueda de similitud: las activaciones de la penúltima capa permiten construir espacios latentes de morfología galáctica para *clustering* no supervisado o recuperación de imágenes similares.
- Docencia y prototipado rápido: su tamaño reducido y su receta reproducible (30 epochs, una GPU) lo hacen adecuado para cursos de *deep learning* aplicado a astronomía y para validar hipótesis antes de escalar a modelos mayores.
- Clasificación en entornos con recursos limitados: cabe en GPUs consumer y puede desplegarse en servidores modestos o en *edge* para procesamiento por lotes de archivos de imágenes astronómicas.
- Aprendizaje por transferencia a tareas afines: el checkpoint puede inicializar modelos para clasificación de morfología en otros sondeos, con ajuste fino sobre un nuevo conjunto de etiquetas.

## Benchmarks y rendimiento

Datos declarados por el autor en la *model card* (conjunto de test reservado de Galaxy10 DECaLS, 1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, epoch 14) | 83,71 % |
| F1 ponderado (semilla 42, epoch 14) | 83,38 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 83,48 ± 0,44 % |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 83,23 ± 0,33 % |

Evolución por epoch (semilla 42, selección en el epoch 14 por mínima pérdida de validación):

| Epoch | Pérdida val. | Acc. val. (%) | Acc. test (%) | F1 pond. test (%) |
|---|---|---|---|---|
| 1 | 1,5635 | 49,15 | 49,61 | 44,21 |
| 5 | 0,6130 | 79,43 | 79,26 | 79,26 |
| 10 | 0,5271 | 82,86 | 82,86 | 82,68 |
| 14 (seleccionado) | 0,5162 | 83,88 | 83,71 | 83,38 |
| 20 | 0,5508 | 83,71 | 83,77 | 83,55 |
| 25 | 0,5800 | 83,88 | 84,55 | 84,33 |
| 30 | 0,5664 | 84,22 | 84,33 | 84,25 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla; el autor remite al dataset `vision-foundation-models-benchmark-runs` para las tablas completas del paper.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,2-0,5 GB para los pesos (42,6 M de parámetros ≈ 170 MB) más activaciones de un batch pequeño; con batch 1 el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- En fp16/bf16 los pesos ocupan aproximadamente 85 MB, aunque el autor no publica variantes cuantizadas ni versiones de precisión reducida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 ejecutan el modelo sin problema. Para lotes grandes, una A100 o H100 mejora el throughput.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: PyTorch nativo con `torchvision` y `safetensors` (única vía documentada por el autor); al ser una CNN estándar de torchvision, puede exportarse a TorchScript u ONNX y servirse con TorchServe, ONNX Runtime o Triton, aunque el autor no documenta estas rutas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| resnet101-galaxy10-decals-full-v2 (este) | 42,6 M | imagen 224×224 px | 83,71 % (test, semilla 42) | BSD-3-Clause | Hugging Face |
| Otros backbones del mismo benchmark (40 configuraciones) | variable | imagen 224×224 px | no disponible en esta ficha | variable | colección Vision Foundation Models Benchmark |
| ResNet-50 fine-tuned (referencia genérica) | ~25,6 M | imagen 224×224 px | no disponible | BSD-3-Clause (torchvision) | torchvision / Hugging Face |

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos sobre el mismo split, por lo que la comparación cuantitativa con arquitecturas competidoras no puede completarse aquí. El autor indica que las tablas comparativas del paper están en el dataset `vision-foundation-models-benchmark-runs`.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en las 10 clases de Galaxy10 DECaLS; no generaliza a otras taxonomías morfológicas sin reentrenamiento.
- El 16,3 % de error restante implica una tasa de confusión no despreciable entre clases morfológicamente próximas; no debe usarse como única fuente de verdad en estudios científicos sin validación humana.
- Riesgo de sesgo de dominio: el entrenamiento se limita a imágenes de DECaLS con un preprocesado concreto (224×224 px, normalización ImageNet); imágenes de otros sondeos con distinta resolución, profundidad o calibración pueden degradar el rendimiento.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre asigna una de las 10 clases, incluso ante objetos que no son galaxias o imágenes fuera de distribución, sin mecanismo de rechazo.
- No hay información sobre sesgos demográficos o sociales, pero sí sobre posibles sesgos de selección derivados del conjunto de datos y del etiquetado original de Galaxy10.
- La licencia BSD-3-Clause permite uso comercial con atribución y sin endoso; conviene revisar también las condiciones de los pesos originales de torchvision y del dataset Galaxy10 DECaLS.
- El checkpoint corresponde al epoch 14, seleccionado por pérdida de validación, no por accuracy de test; epochs posteriores (por ejemplo, el 24 o el 27) muestran accuracy de test superior (84,44 % y 84,55 %), lo que sugiere que la selección por pérdida no es óptima para esta métrica.
- El paper asociado está en revisión en *Astronomy and Computing* (versión revisada, 2026); la cita definitiva no está disponible.
- El modelo tiene 20 descargas y 0 *likes* en el momento de la consulta, lo que indica una validación comunitaria aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/resnet101-galaxy10-decals-full-v2
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por epoch y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (en revisión; sin enlace disponible en la información proporcionada)
