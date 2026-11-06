# matthieulel/efficientnet_b7-galaxy10-decals-head-v2

## Resumen

`efficientnet_b7-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` en el marco del benchmark *Vision Foundation Models Benchmark*. El modelo adapta el backbone `efficientnet_b7` de torchvision (pesos `IMAGENET1K_V1`) al dataset Galaxy10 DECaLS, que plantea una clasificación de 10 clases morfológicas sobre imágenes del Legacy Survey. La adaptación se realizó mediante *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas.

El modelo forma parte de una colección de 80 configuraciones (40 backbones preentrenados x dos regímenes de adaptación) evaluadas bajo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Con 64,1 millones de parámetros totales y un repositorio de 0,3 GB, es un checkpoint ligero pensado para servir como línea base reproducible en la comparación de modelos de visión aplicados a datos astronómicos.

Su relevancia es metodológica más que de rendimiento absoluto: proporciona un punto de referencia con protocolo de entrenamiento idéntico al resto de la colección, métricas por época y verificación de integridad de los pesos, lo que facilita la reproducibilidad en un dominio donde las comparaciones entre backbones suelen adolecer de recetas heterogéneas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B7 (torchvision, pesos ImageNet-1k `IMAGENET1K_V1`) con cabeza lineal de 10 clases |
| Parámetros totales | 64.123.290 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen) |
| Tipos de cuantización | no disponible (el autor solo distribuye pesos en precisión original) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es una CNN EfficientNet-B7 completa: el backbone conserva los pesos de ImageNet-1k y queda congelado durante todo el entrenamiento, incluidas las estadísticas de las capas de normalización por lotes. La única parte entrenada es la cabeza clasificadora, sustituida por una capa lineal de 10 salidas que corresponde a las 10 clases morfológicas de Galaxy10 DECaLS.

El protocolo de entrenamiento es uniforme para las 40 arquitecturas del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa resize y center crop a 224x224 px con la normalización del image processor del checkpoint. El conjunto de datos son las 17.736 imágenes de Galaxy10 DECaLS: el split público de test (1.774 imágenes) se reserva como test held-out y el split público de train se divide de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La época seleccionada es la de mínima pérdida de validación (época 30 de 30). El software empleado fue PyTorch 2.3.0, torchvision 0.18.0, transformers 4.37.2 y datasets 2.19.1. No se aplicó RLHF ni DPO (no procede en clasificación de imágenes).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales genéricas a través del backbone EfficientNet-B7 preentrenado en ImageNet-1k (congelado, pero reutilizable como extractor).
- Inferencia determinista y ligera: una sola pasada forward por imagen, sin generación autoregresiva.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo *thinking*, visión general más allá de la clasificación, audio ni otras modalidades.
- Verificación de integridad publicada: recarga y ejecución sobre las primeras 96 imágenes de test con predicciones idénticas al 100,0 % respecto a los logits guardados (diferencia absoluta máxima de 2,50e-06).

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo recibe recortes de galaxias del Legacy Survey DECaLS y devuelve una de las 10 clases morfológicas; su coste computacional bajo (64 M de parámetros) permite procesar lotes grandes en una sola GPU consumer.
- **Línea base reproducible para investigación**: al compartir receta exacta con las otras 39 configuraciones del benchmark, sirve para comparar el efecto del backbone (EfficientNet-B7 frente a ViT, ConvNeXt, etc.) manteniendo constante todo lo demás.
- **Etiquetado asistido y control de calidad de catálogos**: puede preclasificar imágenes antes de la revisión humana, priorizando las predicciones de baja confianza para inspección manual; útil dado el desbalance típico de clases morfológicas.
- **Prototipado rápido en entornos con recursos limitados**: al ser un checkpoint de 0,3 GB con backbone congelado, se puede desplegar en estaciones de trabajo sin GPU de datacenter para experimentos exploratorios.
- **Extracción de embeddings para agrupamiento o búsqueda por similitud**: el backbone congelado puede usarse como extractor de características y alimentar un clustering no supervisado de morfologías o un índice de búsqueda visual de galaxias.
- **Docencia y formación en ML aplicado a astronomía**: la receta completa (dataset, splits, hiperparámetros, métricas por época y script de carga) hace del modelo un ejemplo cerrado y verificable para prácticas de fine-tuning con backbone congelado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`). Test held-out de Galaxy10 DECaLS, 1.774 imágenes.

| Métrica | Valor (seed 42, época 30) | Media +/- desv. típica (seeds 42, 1, 2) |
|---|---|---|
| Accuracy | 58,29 % | 58,27 +/- 0,09 % |
| Weighted F1 | 55,99 % | 55,89 +/- 0,10 % |

Evolución de la métrica de test en la seed 42 (selección de época por mínima pérdida de validación):

| Época | Val. loss | Val. acc. (%) | Test acc. (%) | Test weighted F1 (%) |
|---|---|---|---|---|
| 1 | 2,1785 | 29,99 | 28,97 | 19,96 |
| 5 | 1,5486 | 46,79 | 48,25 | 43,68 |
| 10 | 1,3527 | 53,49 | 54,17 | 51,07 |
| 15 | 1,2823 | 55,47 | 55,41 | 52,67 |
| 20 | 1,2432 | 56,99 | 57,16 | 54,66 |
| 25 | 1,2240 | 57,95 | 57,78 | 55,38 |
| 30 (seleccionada) | 1,2189 | 57,95 | 58,29 | 55,99 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos en la misma tabla; la colección del benchmark incluye las otras 39 configuraciones, pero sus cifras no se detallan aquí.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,26 GB solo para pesos (64,1 M de parámetros x 4 bytes), más activaciones; en la práctica, menos de 2 GB para batches pequeños a 224x224 px.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas de datacenter como A100 o H100 no son necesarias y aportan poco para un modelo de este tamaño.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (script de la model card con `safetensors.torch.load_file`), TorchServe o un servidor FastAPI propio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados numéricos de los otros backbones del benchmark ni de otros clasificadores de morfología galáctica, por lo que no es posible construir una comparativa cuantitativa fiable. Comparativa cualitativa con alternativas de la misma categoría:

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| efficientnet_b7-galaxy10-decals-head-v2 (este) | 64,1 M | imagen 224x224 px | BSD-3-Clause | Hugging Face, pesos safetensors |
| Otras configuraciones del Vision Foundation Models Benchmark (mismo autor) | variable según backbone | imagen 224x224 px | según backbone | colección Hugging Face del autor |
| Backbones genéricos de torchvision (p. ej. EfficientNet-B7 ImageNet-1k sin fine-tuning) | 66,3 M (cabeza de 1.000 clases) | imagen 224x224 px | BSD-3-Clause | torchvision / Hugging Face |

La comparación de rendimiento entre estas opciones requiere consultar el dataset `vision-foundation-models-benchmark-runs`, que contiene las métricas por época de todas las ejecuciones.

## Limitaciones y advertencias

- **Rendimiento moderado**: 58,29 % de accuracy y 55,99 % de F1 ponderado sobre 10 clases indican una separación limitada; el modelo no es adecuado para clasificación morfológica de alta precisión sin revisión humana.
- **Backbone congelado**: al no ajustar el backbone, la capacidad de adaptación al dominio astronómico es reducida; el autor lo plantea explícitamente como régimen de comparación, no como configuración óptima.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas con alta confianza en clases minoritarias o morfologías ambiguas; no se publican matrices de confusión ni métricas por clase.
- **Desbalance de clases**: Galaxy10 DECaLS tiene clases con muy distinto número de ejemplos; las métricas agregadas (accuracy y F1 ponderado) pueden ocultar un rendimiento pobre en clases raras.
- **Sesgos de dominio**: el modelo solo se ha evaluado sobre imágenes DECaLS con el preprocesado indicado (resize y center crop a 224x224 px, normalización ImageNet); su uso con otros surveys, resoluciones o canales puede degradar el rendimiento sin garantías.
- **Licencia**: BSD-3-Clause permite uso comercial con atribución y sin garantías; conviene revisar también las condiciones de uso del dataset Galaxy10 DECaLS y de los pesos ImageNet-1k subyacentes.
- **Verificación**: las métricas están marcadas como no verificadas (`verified: false`) y el artículo asociado está en revisión; los resultados deben tratarse como preliminares hasta la publicación.
- **Mantenimiento**: 19 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo con soporte continuo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/efficientnet_b7-galaxy10-decals-head-v2
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; sin enlace disponible)
