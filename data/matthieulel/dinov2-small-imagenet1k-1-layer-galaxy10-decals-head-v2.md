# matthieulel/dinov2-small-imagenet1k-1-layer-galaxy10-decals-head-v2

## Resumen

`matthieulel/dinov2-small-imagenet1k-1-layer-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias construido sobre el backbone auto-supervisado DINOv2-small de Meta (variante `facebook/dinov2-small-imagenet1k-1-layer`). Lo publica el usuario matthieulel como parte de la colección *Vision Foundation Models Benchmark*, un estudio comparativo de 40 backbones preentrenados evaluados bajo dos regímenes de adaptación sobre el dataset astronómico Galaxy10 DECaLS (10 clases morfológicas, 17.736 imágenes).

El modelo no entrena el backbone: aplica *head-only fine-tuning*, es decir, congela completamente DINOv2-small (incluidas las estadísticas de sus capas de normalización) y entrena únicamente una cabeza lineal de 10 salidas. El resultado es un checkpoint ligero de 22.064.266 parámetros (unos 0,1 GB en safetensors) que alcanza 56,82 % de accuracy y 54,38 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes, con una media de 57,01 ± 0,33 % sobre tres semillas.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible de hasta dónde llega un foundation model visual genérico cuando se adapta a un dominio científico con un coste de entrenamiento mínimo, y forma parte de un protocolo de evaluación homogéneo (misma receta de AdamW, mismo split, mismo criterio de selección de época) que permite comparar 40 backbones de forma justa. La licencia Apache 2.0 y el formato estándar de `transformers` facilitan su reutilización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv2-small) con cabeza lineal de clasificación |
| Parámetros totales | 22.064.266 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px en evaluación) |
| Tipos de cuantización | no disponible (el autor solo documenta entrenamiento e inferencia en fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El backbone es un Vision Transformer de tipo DINOv2-small, preentrenado de forma auto-supervisada por Meta y publicado como `facebook/dinov2-small-imagenet1k-1-layer`. Sobre él se añade una única capa lineal con diez salidas, una por clase morfológica de Galaxy10 DECaLS. Durante el ajuste el backbone permanece congelado por completo, incluidas las estadísticas de sus capas de normalización, de modo que el único bloque con parámetros entrenables es la cabeza.

El protocolo de entrenamiento es idéntico para los 40 backbones del benchmark: AdamW con betas 0,9/0,999, eps 1e-8, weight decay 0,1 y clipping de gradiente 1,0; learning rate 1e-4 con schedule lineal y 10 % de warm-up; batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256); 30 épocas en fp32 con TF32 desactivado sobre una sola GPU. La augmentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación aplica resize y center crop a 256x256 px seguidos de la normalización del image processor del checkpoint. El split se estratifica por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test reservado. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de representaciones visuales genéricas mediante el backbone DINOv2-small congelado, reutilizable para otras tareas con una cabeza nueva.
- Inferencia determinista y verificada: el autor comprobó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados (diferencia absoluta máxima de 9,54e-07).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es exclusivamente un modelo de visión.
- No dispone de modo *thinking* ni de salidas estructuradas más allá de los logits de clasificación.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en catálogos de imagen: el modelo asigna una de las 10 clases de Galaxy10 DECaLS a recortes de 256x256 px, útil como primer filtro antes de la inspección visual por astrónomos.
- Etiquetado asistido y control de calidad de datasets astronómicos: permite pre-anotar imágenes nuevas y detectar discrepancias frente a etiquetas existentes, aprovechando que el coste de inferencia es muy bajo (22 M de parámetros).
- Referencia de línea base en experimentos de adaptación de dominio: al ser *head-only fine-tuning* sobre un backbone congelado, sirve para medir cuánto aporta un ajuste completo o un enfoque de *prompt tuning* frente a una cabeza lineal.
- Extracción de *embeddings* para búsqueda por similitud o agrupamiento no supervisado de imágenes astronómicas, reutilizando el backbone DINOv2-small congelado y sustituyendo la cabeza.
- Docencia y reproducción de resultados: el protocolo completo (semillas, splits, métricas por época) está publicado, lo que permite replicar el experimento en una sola GPU en tiempos reducidos.
- Despliegue en entornos con recursos limitados: el checkpoint de 0,1 GB cabe en CPU y en GPU de consumo, lo que facilita su uso en pipelines de preprocesado en observatorios o en estaciones de trabajo modestas.
- Integración en pipelines de `transformers` para clasificación de imágenes por lotes, con preprocesado estandarizado (resize, center crop y normalización del processor).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Semilla 42 (época 30) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 56,82 | 57,01 ± 0,33 |
| F1 ponderado (%) | 54,38 | 54,58 ± 0,45 |

Evolución seleccionada de la curva de validación y test en la semilla 42 (extracto):

| Época | Pérdida val. | Acc. val. (%) | Acc. test (%) | F1 test (%) |
|---|---|---|---|---|
| 1 | 2,2786 | 16,63 | 15,78 | 11,48 |
| 10 | 1,3923 | 50,62 | 49,94 | 47,08 |
| 20 | 1,2765 | 55,98 | 55,69 | 53,22 |
| 30 (seleccionada) | 1,2495 | 56,71 | 56,82 | 54,38 |

No se han publicado en la información disponible resultados de benchmarks de este checkpoint frente a otros modelos concretos; la comparación cuantitativa entre los 40 backbones del estudio está en el dataset `vision-foundation-models-benchmark-runs` y en el paper asociado, aún en revisión.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para el modelo (22 M de parámetros) más el *overhead* de activaciones con entradas de 256x256 px; en la práctica, unos pocos cientos de MB adicionales por lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el entrenamiento documentado se realizó en una sola GPU, y el autor no especifica el modelo exacto.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- También es viable en CPU para inferencia por lotes pequeños, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; no se documentan pesos GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas están orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (DINOv2-small, head-only) | 22,06 M | imagen 256x256 px | 56,82 % acc / 54,38 % F1 (test) | Apache 2.0 | HuggingFace |
| `facebook/dinov2-small-imagenet1k-1-layer` (base sin adaptar) | ~22 M | imagen 224x224 px (nativa) | no disponible en la información | Apache 2.0 | HuggingFace |
| Otros backbones del *Vision Foundation Models Benchmark* (39 restantes) | variable | variable | resultados en `vision-foundation-models-benchmark-runs` | variable | HuggingFace |

No se dispone en la información proporcionada de cifras de rendimiento de alternativas concretas sobre el mismo split, por lo que la comparación cuantitativa con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- El rendimiento es moderado: 56,82 % de accuracy sobre 10 clases implica una tasa de error superior al 40 %, insuficiente para sustituir la clasificación morfológica humana en producción científica sin revisión.
- El modelo solo distingue las 10 clases de Galaxy10 DECaLS; no generaliza a otras taxonomías morfológicas ni a otros sondeos sin reentrenar la cabeza.
- El backbone está congelado y no se ha adaptado al dominio astronómico más allá de la cabeza lineal, lo que limita la ganancia frente a un ajuste completo.
- Riesgo de sesgo ligado al dataset: la distribución de clases, la selección de imágenes y los criterios de etiquetado de Galaxy10 DECaLS condicionan las predicciones; no se documentan análisis de sesgo por clase ni por rango de desplazamiento al rojo.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de sobreconfianza: los logits pueden asignar alta probabilidad a clases incorrectas en imágenes fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos del evaluado.
- El checkpoint se publica como parte de un estudio en revisión; la cita del paper aún no está completa y los resultados no han sido verificados de forma independiente.
- No se documentan cuantizaciones oficiales ni pesos en formatos alternativos, lo que puede complicar el despliegue en *runtimes* no basados en PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/dinov2-small-imagenet1k-1-layer-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/dinov2-small-imagenet1k-1-layer
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
