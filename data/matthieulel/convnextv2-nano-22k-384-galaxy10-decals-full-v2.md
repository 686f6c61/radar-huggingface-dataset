# matthieulel/convnextv2-nano-22k-384-galaxy10-decals-full-v2

## Resumen

`convnextv2-nano-22k-384-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por el usuario de Hugging Face `matthieulel` como parte de una colección comparativa de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) para el benchmark de modelos fundacionales de visión aplicados a astronomía. El modelo parte de `facebook/convnextv2-nano-22k-384` y se ha ajustado mediante *full fine-tuning* (actualización de todos los parámetros) para clasificar morfologías galácticas en el dataset Galaxy10 DECaLS, que distingue 10 clases.

La arquitectura es ConvNeXt V2 en su variante "nano", una red convolucional pura con 14.989.210 parámetros totales, preentrenada por Meta en ImageNet-22k a resolución 384x384. El ajuste se realiza sobre las 17.736 imágenes de Galaxy10 DECaLS, con un protocolo de entrenamiento idéntico para los 40 backbones del estudio, lo que permite comparaciones controladas entre familias de modelos.

El modelo resulta relevante porque ofrece una referencia reproducible y ligera (repo de 0,1 GB) para clasificación morfológica de galaxias, con métricas declaradas de 85,57 % de accuracy y 85,40 % de F1 ponderado en el conjunto de test reservado, y porque forma parte de un estudio más amplio sobre el rendimiento de modelos fundacionales de visión en datos astronómicos, actualmente en revisión para *Astronomy and Computing*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, variante nano) |
| Parametros totales | 14.989.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 384x384 px) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

ConvNeXt V2 es una red neuronal convolucional pura que moderniza el diseño de ResNet incorporando elementos propios de los transformers (convoluciones depthwise de mayor kernel, normalización LayerNorm, activación GELU y capas de mezcla de canales). La variante nano parte de los pesos de `facebook/convnextv2-nano-22k-384`, preentrenados por Meta en ImageNet-22k a 384x384, e incorpora una cabeza lineal de 10 salidas para las clases de morfología galáctica.

El ajuste fino se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como test final y el split público de train dividido de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del estudio, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación aplica resize y centre crop a 384x384 px con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 17), y se reportan medias y desviaciones típicas sobre tres semillas (42, 1, 2). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante un backbone ConvNeXt V2 preentrenado en ImageNet-22k.
- Inferencia a resolución 384x384 px con el image processor incluido en el repositorio.
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento extendido.
- Verificación de integridad: predicciones idénticas al 100 % en las primeras 96 imágenes de test respecto a los logits guardados de la época seleccionada (diferencia absoluta máxima de 5,25e-06).

## Casos de uso

- Clasificación morfológica automatizada de galaxias en imágenes DECaLS: el modelo recibe recortes de 384x384 px y devuelve una de las 10 clases de morfología, adecuado para pipelines de catalogación astronómica a gran escala por su tamaño reducido (15 M de parámetros) y su coste de inferencia bajo.
- Etiquetado asistido en proyectos de ciencia ciudadana: puede preetiquetar imágenes antes de la revisión humana, reduciendo el esfuerzo de clasificación manual en catálogos como Galaxy Zoo.
- Baseline reproducible para investigación en visión astronómica: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve como referencia controlada para comparar nuevas arquitecturas o estrategias de adaptación (full fine-tuning frente a linear probing).
- Detección de discrepancias morfológicas: combinado con catálogos existentes, permite identificar galaxias cuya clasificación automática difiere de la etiqueta previa y priorizar su inspección.
- Despliegue en entornos con recursos limitados: su tamaño (repo de 0,1 GB) y su naturaleza convolucional permiten ejecución en CPU o en GPUs de consumo para procesar lotes de imágenes sin infraestructura dedicada.
- Filtrado previo en pipelines de observación: puede clasificar rápidamente recortes de surveys para separar morfologías de interés (por ejemplo, espirales frente a elípticas) antes de análisis más costosos.
- Docencia y divulgación: modelo ligero y de licencia permisiva para demostrar flujos de transferencia de aprendizaje en astronomía con `transformers`.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes), calculados en la época de mínima pérdida de validación:

| Metrica | Semilla 42 (epoca 17) | Media +/- desv. tip. (semillas 42, 1, 2) |
|---|---|---|
| Accuracy | 85,57 % | 85,76 % +/- 0,17 |
| F1 ponderado | 85,40 % | 85,52 % +/- 0,13 |

Evolución de métricas de test en la semilla 42 (extracto de las épocas clave):

| Epoca | Val. loss | Val. acc. (%) | Test acc. (%) | Test F1 pond. (%) |
|---|---|---|---|---|
| 1 | 1,4767 | 50,85 | 51,52 | 48,27 |
| 5 | 0,5267 | 81,57 | 81,45 | 81,03 |
| 10 | 0,4636 | 85,29 | 83,82 | 83,54 |
| 15 | 0,4340 | 85,85 | 85,74 | 85,52 |
| 17 (seleccionada) | 0,4279 | 86,41 | 85,57 | 85,40 |
| 20 | 0,4464 | 85,91 | 85,74 | 85,62 |
| 25 | 0,4485 | 86,02 | 85,68 | 85,56 |
| 30 | 0,4477 | 86,02 | 85,51 | 85,39 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla; las métricas de los otros 39 backbones del estudio están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo (15 M de parámetros); el consumo real depende del tamaño de lote y de la resolución de entrada (384x384 px).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento del estudio se realizó en una sola GPU, sin especificar modelo.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch) como vía principal; compatible con Hugging Face Inference Endpoints (tag `endpoints_compatible`); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convnextv2-nano-22k-384-galaxy10-decals-full-v2 (este) | 14,99 M | imagen 384x384 | 85,57 % (test, semilla 42) | apache-2.0 | Hugging Face |
| facebook/convnextv2-nano-22k-384 (backbone base) | no disponible en la informacion | imagen 384x384 | no disponible (sin ajuste a Galaxy10) | no disponible en la informacion | Hugging Face |
| Otros backbones del benchmark (39 restantes) | no disponible | no disponible | no disponible en esta ficha; consultar `vision-foundation-models-benchmark-runs` | no disponible | Hugging Face |

No se dispone en la información proporcionada de métricas de modelos alternativos comparables en la misma tarea y split, por lo que la comparativa cuantitativa queda limitada a este checkpoint.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de morfología galáctica en Galaxy10 DECaLS; no es un modelo de propósito general ni admite otras tareas de visión sin reajuste.
- El conjunto de entrenamiento es reducido (14.188 imágenes) y de una única fuente (DECaLS); el rendimiento puede degradarse en imágenes de otros surveys con características de ruido, resolución o profundidad distintas.
- Riesgo de sobreajuste al dominio y a las 10 clases predefinidas; las morfologías ambiguas o intermedias pueden clasificarse de forma errónea.
- Sesgos potenciales derivados de la distribución de clases del dataset y de las etiquetas originales de Galaxy10 DECaLS, no analizados en la información disponible.
- Las métricas son declaradas por el autor y no están verificadas de forma independiente (campo `verified: false` en el model-index).
- Licencia apache-2.0: permite uso comercial y modificación, pero no se documentan garantías ni soporte por parte del autor.
- No se especifican limitaciones de idioma porque el modelo no procesa texto; el campo de idiomas figura como no disponible.
- El paper asociado está en revisión en *Astronomy and Computing*; la cita definitiva aún no está publicada.
- Para producción, conviene validar el modelo en imágenes del survey objetivo antes de sustituir anotaciones humanas, y monitorizar la deriva de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-nano-22k-384-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-nano-22k-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), en revisión; sin DOI disponible en la información proporcionada.
