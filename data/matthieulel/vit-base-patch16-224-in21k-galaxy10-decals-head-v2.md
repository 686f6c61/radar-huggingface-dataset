# matthieulel/vit-base-patch16-224-in21k-galaxy10-decals-head-v2

## Resumen

`vit-base-patch16-224-in21k-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por matthieulel como parte de la colección Vision Foundation Models Benchmark. Se trata de un Vision Transformer base (ViT-B/16, 85,8 millones de parámetros) preentrenado por Google en ImageNet-21k y adaptado a la clasificación de 10 clases morfológicas del conjunto Galaxy10 DECaLS mediante fine-tuning exclusivo de la cabeza de clasificación: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una capa lineal de 10 salidas.

El modelo forma parte de un estudio comparativo más amplio (40 backbones preentrenados por dos regímenes de adaptación, 80 configuraciones en total) enmarcado en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su interés no radica en un rendimiento estado del arte, sino en servir como referencia reproducible y controlada para evaluar cuánto transfiere un backbone genérico de visión a una tarea astronómica específica cuando no se dispone de recursos para reentrenar el modelo completo.

El checkpoint alcanza un 46,51 % de accuracy y un 41,05 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes, con una media de 46,20 ± 0,47 % de accuracy sobre tres semillas. El repo ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0 en formato safetensors, listo para usarse con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), transformer de parches con patch size 16 y resolución de entrada 224x224 |
| Parametros totales | 85.806.346 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, clasificación de una imagen por inferencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors fp32) |
| Idiomas soportados | no aplica (modelo de visión; las etiquetas de clase son morfologías galácticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un ViT-B/16 estándar: la imagen de 224x224 px se divide en 196 parches de 16x16, que se proyectan linealmente, se suman a embeddings posicionales y se procesan por 12 bloques de atención multi-cabeza con dimensión oculta 768. La cabeza de clasificación es una única capa lineal con 10 salidas, correspondientes a las clases morfológicas de Galaxy10 DECaLS. El backbone se mantiene congelado en todo momento, incluidas las estadísticas de normalización de sus capas, de modo que los pesos del repositorio son exactamente los del checkpoint base de Google más la cabeza entrenada.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de evaluación y el split público de train dividido de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. Se usó AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limitó a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 224x224 con la normalización del procesador del checkpoint. La selección de época se hizo por mínima pérdida de validación (época 30 en la semilla 42).

## Capacidades

- Clasificación de imágenes en 10 clases morfológicas de galaxias del conjunto Galaxy10 DECaLS.
- Extracción de características visuales genéricas mediante el backbone ViT-B/16 preentrenado en ImageNet-21k (congelado en este checkpoint).
- Inferencia de una sola imagen por llamada, sin soporte nativo de batches multi-imagen más allá del batching estándar de PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora modo thinking, visión adicional, audio ni otras modalidades.
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.

## Casos de uso

- Clasificación morfológica preliminar en pipelines astronómicos: el modelo puede etiquetar recortes de galaxias de DECaLS en 10 clases con un coste computacional mínimo (85,8 M de parámetros, inferencia en fp32 en una sola GPU), sirviendo como primer filtro antes de inspección visual o clasificación más fina.
- Etiquetado asistido para grandes catálogos: con 46,5 % de accuracy, es adecuado como generador de etiquetas débiles o candidatos para revisión humana en conjuntos de imágenes donde el etiquetado manual es inviable, no como clasificador final.
- Baseline reproducible en estudios de transferencia: al ser una de las 80 configuraciones del benchmark, permite comparar de forma controlada el rendimiento de un backbone ViT-B/16 congelado frente a otros backbones y regímenes de adaptación bajo el mismo protocolo.
- Docencia y experimentación en astronomía computacional: el reducido tamaño del repo (0,3 GB) y la simplicidad del pipeline (resize, center crop, normalización) lo hacen apto para prácticas y prototipos en entornos con recursos limitados.
- Extracción de embeddings para búsqueda por similitud: los 768 descriptores del token CLS pueden usarse para agrupar o recuperar galaxias visualmente similares, aunque el autor no documenta esta aplicación ni su calidad.
- Validación de infraestructura de inferencia: útil para probar despliegues con `transformers`, endpoints compatibles o pipelines de clasificación de imágenes antes de escalar a modelos mayores del mismo benchmark.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes), semilla 42, época seleccionada 30 de 30:

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época seleccionada) | 46,51 % |
| F1 ponderado (seed 42, época seleccionada) | 41,05 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 46,20 ± 0,47 % |
| F1 ponderado medio ± desviación típica (semillas 42, 1, 2) | 40,59 ± 0,72 % |

Evolución por épocas (semilla 42): la accuracy de test pasa de 15,11 % en la época 1 a 45,32 % en la época 20 y 46,51 % en la época 30; el F1 ponderado sube de 8,46 % a 39,11 % y 41,05 % en los mismos puntos. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (85,8 M de parámetros × 4 bytes) más el overhead de activaciones, por lo que en la práctica cabe en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomiendan A100, H100, L40S o RTX 4090. Para inferencia unitaria basta una GTX 1650, T4 o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo con al menos 2 GB de VRAM (GTX 1050 Ti en adelante).
- Opciones de despliegue: `transformers` con PyTorch (probado por el autor con PyTorch 2.3.0, transformers 4.37.2, torchvision 0.18.0); el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre el mismo conjunto de test ni de comparativas publicadas por el autor. La colección Vision Foundation Models Benchmark incluye 40 backbones y dos regímenes de adaptación, pero sus métricas por modelo no se detallan aquí.

| Modelo | Parametros | Contexto | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-base-patch16-224-in21k-galaxy10-decals-head-v2 | 85,8 M | no aplica | 46,51 % (test, seed 42) | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k (base sin adaptar) | 85,8 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Otros backbones del benchmark | no disponible | no disponible | no disponible | no disponible | Colección Vision Foundation Models Benchmark |

## Limitaciones y advertencias

- Rendimiento moderado: 46,51 % de accuracy sobre 10 clases implica una tasa de error superior al 50 %; no es adecuado como clasificador autónomo en producción sin revisión humana.
- Sesgos de dominio: entrenado exclusivamente con imágenes de Galaxy10 DECaLS; el rendimiento puede degradarse en otras surveys, resoluciones, profundidades o condiciones de seeing no representadas en el conjunto.
- Riesgo de confusión entre clases morfológicas visualmente próximas, coherente con el F1 ponderado (41,05 %) inferior a la accuracy, lo que indica desequilibrio entre clases.
- Limitación de adaptación: al entrenarse solo la cabeza con backbone congelado, la capacidad de ajuste a la tarea astronómica es limitada por diseño; el autor no reporta comparación con fine-tuning completo en esta ficha.
- Sin datos de calibración ni de incertidumbre: no se documentan métricas de calibración, matrices de confusión ni umbrales de confianza recomendados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base de Google y el dataset Galaxy10 DECaLS pueden tener condiciones propias que conviene revisar.
- Reproducibilidad: los resultados son de una única GPU y una receta fija; las métricas por semilla muestran baja varianza (0,47 puntos de accuracy), pero no se documentan pruebas en otros entornos de hardware.
- No apto para tareas fuera de la clasificación de imágenes: no genera texto, no razona, no soporta herramientas ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch16-224-in21k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace)
