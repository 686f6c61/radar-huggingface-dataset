# matthieulel/swinv2-large-patch4-window12-192-22k-galaxy10-decals-head-v2

## Resumen

`swinv2-large-patch4-window12-192-22k-galaxy10-decals-head-v2` es un modelo de clasificación de imágenes desarrollado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Consiste en el backbone `microsoft/swinv2-large-patch4-window12-192-22k` adaptado a la clasificación de morfología de galaxias sobre el conjunto Galaxy10 DECaLS, que distingue diez clases morfológicas. La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de diez salidas.

El modelo resuelve un problema concreto de astronomía observacional: clasificar automáticamente galaxias según su forma a partir de imágenes del sondeo DECaLS, una tarea que tradicionalmente requiere inspección visual humana y que se beneficia de la automatización a gran escala. Forma parte de un estudio comparativo más amplio (40 backbones preentrenados por dos regímenes de adaptación, 80 configuraciones en total) descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

Arquitectónicamente es un transformer jerárquico Swin Transformer V2 con ventanas desplazadas, parches de 4x4 y ventana de 12, preentrenado en ImageNet-22k y especializado aquí para imágenes de 192x192 píxeles. Con 195,2 millones de parámetros y un tamaño de repositorio de 0,8 GB, es un modelo de tamaño medio orientado a inferencia sobre imágenes astronómicas, no a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas, patch 4, window 12) |
| Parametros totales | 195.218.302 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 192x192 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Swin Transformer V2, un transformer jerárquico que construye representaciones piramidales mediante atención local en ventanas desplazadas, lo que reduce el coste computacional frente a la atención global de un ViT estándar. El checkpoint base (`microsoft/swinv2-large-patch4-window12-192-22k`) fue preentrenado en ImageNet-22k; en este repositorio se conservan íntegramente sus pesos congelados y se sustituye la cabeza de clasificación por una capa lineal de diez salidas entrenada sobre Galaxy10 DECaLS.

El protocolo de entrenamiento es idéntico para las 40 arquitecturas del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación consiste en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio; la evaluación aplica redimensionado y recorte central a 192x192 px con la normalización del procesador del checkpoint. El conjunto Galaxy10 DECaLS contiene 17.736 imágenes, divididas en 14.188 de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test se mantiene como conjunto de evaluación held-out). La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42).

## Capacidades

- Clasificación de imágenes en diez clases morfológicas de galaxias sobre imágenes de 192x192 px.
- Extracción de características visuales mediante el backbone Swin V2 congelado, reutilizable para otras tareas astronómicas.
- Inferencia determinista y reproducible: la verificación de integridad confirma predicciones idénticas en el 100 % de las primeras 96 imágenes de test (diferencia máxima de logits de 3,81e-06).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No incorpora modo de razonamiento (*thinking mode*) ni salidas estructuradas más allá de los logits de clasificación.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos de sondeos: el modelo asigna una de las diez clases de Galaxy10 DECaLS a cada imagen de 192x192 px, lo que permite procesar lotes de recortes astronómicos sin intervención humana.
- Etiquetado preliminar para pipelines de ciencia ciudadana: sirve como primera pasada que preclasifica imágenes y reduce la carga de revisión manual en proyectos de morfología galáctica.
- Benchmark de referencia para modelos de visión en astronomía: al formar parte de una colección de 80 configuraciones con receta idéntica, permite comparar el rendimiento de distintos backbones bajo condiciones controladas.
- Extracción de embeddings para búsqueda por similitud: el backbone congelado puede emplearse para generar representaciones vectoriales de imágenes galácticas y construir índices de recuperación visual.
- Filtrado y control de calidad de datos: detectar imágenes mal etiquetadas o con morfología atípica comparando la predicción del modelo con las etiquetas existentes en un catálogo.
- Prototipado rápido en investigación astronómica: al ser un ajuste *head-only* con backbone congelado, el modelo es ligero de desplegar (0,8 GB) y adecuado para experimentos en una sola GPU sin reentrenamiento profundo.
- Docencia y divulgación: ejemplo reproducible de adaptación de un foundation model de visión a un dominio científico concreto con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test held-out de Galaxy10 DECaLS, 1.774 imágenes; métricas en la época de mínima pérdida de validación):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 67,64 % |
| F1 ponderado (semilla 42, época 30 de 30) | 65,52 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 67,49 +/- 0,21 % |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 65,40 +/- 0,13 % |

No se han publicado en la información disponible resultados comparativos frente a otros modelos del benchmark ni métricas de benchmarks estándar de visión (ImageNet, etc.) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 195,2 millones de parámetros y 0,8 GB de pesos en fp32; la inferencia en fp32 requiere aproximadamente 1-2 GB de VRAM, incluyendo activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado y evaluado en una sola GPU (modelo base preentrenado en infraestructura de Microsoft no especificada).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs de portátil con suficiente memoria.
- Opciones de despliegue: transformers (PyTorch), con soporte de `AutoModelForImageClassification` y `AutoImageProcessor`; el tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face. No se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Swin V2 Large, head-only) | 195,2 M | imagen 192x192 px | 67,64 % (test) | Apache 2.0 | Hugging Face |
| Resto de configuraciones del benchmark (39 backbones adicionales) | no disponible | no disponible | no disponible en esta ficha | no disponible | colección Vision Foundation Models Benchmark |
| Swin V2 Large base (`microsoft/swinv2-large-patch4-window12-192-22k`) | ~197 M (arquitectura base) | imagen 192x192 px | no aplica (preentrenado en ImageNet-22k, sin cabeza de galaxias) | no disponible | Hugging Face |

No se dispone en la información proporcionada de resultados de los otros 39 backbones del benchmark ni de modelos alternativos específicos de clasificación morfológica de galaxias con los que comparar métricas de forma directa.

## Limitaciones y advertencias

- El ajuste es *head-only*: el backbone está congelado, por lo que la capacidad de adaptación al dominio astronómico es limitada en comparación con un fine-tuning completo.
- La accuracy del 67,64 % sobre diez clases deja un margen de error considerable; el modelo puede confundir clases morfológicas visualmente próximas.
- El modelo está entrenado exclusivamente sobre Galaxy10 DECaLS; su generalización a otros sondeos, resoluciones o distribuciones de imágenes no está validada.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones y no debe emplearse en tareas de generación o razonamiento.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de Microsoft puede tener condiciones adicionales que conviene revisar antes de un despliegue en producción.
- Riesgo de sesgo derivado de la distribución del conjunto Galaxy10 DECaLS: clases desbalanceadas o morfologías poco representadas pueden verse penalizadas.
- El artículo asociado está en revisión (Astronomy and Computing, 2026); la citación definitiva aún no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-large-patch4-window12-192-22k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-large-patch4-window12-192-22k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
