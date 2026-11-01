# matthieulel/swinv2-base-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-head-v2

## Resumen

El modelo `swinv2-base-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-head-v2` es un clasificador de imágenes de morfología galáctica desarrollado por el usuario de HuggingFace matthieulel. Se trata de un fine-tuning del checkpoint `microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft`, un Vision Transformer jerárquico de Swin Transformer V2 preentrenado en ImageNet-22k y ajustado en ImageNet-1k, adaptado ahora al dataset Galaxy10 DECaLS con diez clases morfológicas.

La adaptación emplea un régimen de *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de diez salidas. Esta configuración forma parte de una colección más amplia de 80 experimentos (40 backbones preentrenados por dos regímenes de adaptación) descritos en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo es relevante como referencia metodológica para la comunidad de astronomía computacional: demuestra qué rendimiento se puede obtener de un backbone de visión genérico sin reentrenar sus representaciones, con un coste computacional mínimo y una receta reproducible. Con 86,9 millones de parámetros y un tamaño de repositorio de 0,3 GB, es ligero y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas) |
| Parametros totales | 86.904.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un Swin Transformer V2 base con parches de 4x4, ventanas de 12 en preentrenamiento y 16 en fine-tuning, y resolución progresiva de 192 a 256 píxeles. Swin V2 introduce mejoras sobre Swin V1 orientadas a estabilizar el entrenamiento de modelos grandes: normalización coseno en la atención, técnicas de *log-spaced continuous position bias* y un esquema de regularización residual. El checkpoint base fue preentrenado en ImageNet-22k y ajustado en ImageNet-1k antes de esta adaptación.

El entrenamiento de este checkpoint se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se reservó como conjunto de evaluación final; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones de la colección: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 256x256 px con la normalización del procesador del checkpoint. El epoch seleccionado es el de mínima pérdida de validación (época 29 de 30). No se emplearon RLHF, DPO ni técnicas de alineación, al no tratarse de un modelo generativo.

## Capacidades

- Clasificación de imágenes en diez clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone Swin V2 congelado (utilizable como extractor para otras tareas astronómicas).
- Inferencia determinista y reproducible: la verificación de integridad sobre las primeras 96 imágenes de test arroja predicciones idénticas al 100,0% respecto a los logits guardados (diferencia absoluta máxima de 2,38e-06).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No incorpora modo *thinking*, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos de imágenes DECaLS: el modelo recibe recortes de 256x256 px y devuelve una de las diez clases de Galaxy10, adecuado para preclasificar grandes volúmenes antes de inspección humana.
- Línea base en estudios comparativos de foundation models: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve para medir la transferibilidad de backbones genéricos al dominio astronómico sin coste de reentrenamiento.
- Prototipado rápido de pipelines de morfología galáctica: su tamaño de 0,3 GB y 86,9 M de parámetros permiten desplegarlo en una GPU de consumo o incluso en CPU para pruebas de concepto.
- Extracción de embeddings para clustering o búsqueda por similitud: el backbone congelado puede usarse como extractor de características y combinarse con técnicas no supervisadas sobre imágenes astronómicas.
- Etiquetado asistido en campañas de citizen science: las predicciones del modelo pueden priorizar imágenes ambiguas para revisión por voluntarios, dado su F1 ponderado de 56,87%.
- Docencia y reproducción de experimentos: la receta completa (hiperparámetros, splits, métricas por época y semillas) está publicada, lo que facilita replicar el resultado en cursos o talleres de aprendizaje automático aplicado a astronomía.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test reservado, 1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 29 de 30) | 59,24% |
| F1 ponderado (seed 42, época 29 de 30) | 56,87% |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 59,49% +/- 0,47 |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 57,16% +/- 0,63 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un batch pequeño, dado el tamaño del modelo (86,9 M de parámetros, repositorio de 0,3 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. El entrenamiento original se realizó en una sola GPU.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, RTX 4060 y superiores) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con PyTorch (probado con PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0); exportación a ONNX no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones de la misma colección ni de alternativas comparables con métricas sobre Galaxy10 DECaLS. La colección *Vision Foundation Models Benchmark* incluye 40 backbones, pero sus cifras individuales no se detallan aquí.

| Modelo | Parametros | Contexto/entrada | Accuracy (Galaxy10 DECaLS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Swin V2 base, head-only) | 86,9 M | imagen 256x256 px | 59,24% | Apache 2.0 | HuggingFace |
| Backbone base `microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft` | 86,9 M | imagen 256x256 px | no disponible (sin cabeza Galaxy10) | Apache 2.0 | HuggingFace |
| Otros backbones de la colección (40 en total) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Rendimiento moderado: un accuracy del 59,24% sobre diez clases indica una capacidad discriminativa limitada; no es adecuado para clasificación morfológica de alta precisión sin revisión humana.
- Sesgos de dominio: el modelo solo se ha evaluado sobre Galaxy10 DECaLS; su comportamiento en otras encuestas astronómicas, resoluciones o instrumentos no está caracterizado.
- Riesgo de confusión entre clases morfológicas visualmente similares, reflejado en el F1 ponderado (56,87%) inferior al accuracy.
- Al estar el backbone congelado, el modelo no ha adaptado sus representaciones al dominio astronómico; el techo de rendimiento está acotado por el preentrenamiento en ImageNet.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene citar el artículo asociado en publicaciones derivadas.
- Verificación de integridad limitada a 96 imágenes de test; no se documentan pruebas de robustez ante ruido, artefactos o variaciones de calibración fotométrica.
- No apto para tareas generativas, de razonamiento o de procesamiento de lenguaje; su uso queda restringido a clasificación y extracción de características visuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-base-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (referencia citada en la model card; enlace directo no disponible)
