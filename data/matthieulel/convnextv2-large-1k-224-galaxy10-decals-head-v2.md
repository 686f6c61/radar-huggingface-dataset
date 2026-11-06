# matthieulel/convnextv2-large-1k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-large-1k-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. El modelo parte del checkpoint preentrenado `facebook/convnextv2-large-1k-224` (ConvNeXt V2 Large, entrenado sobre ImageNet-1k a 224 px) y sustituye su cabeza de clasificación por una capa lineal de diez salidas, ajustada sobre el conjunto Galaxy10 DECaLS. El backbone permanece completamente congelado, incluidas las estadísticas de sus capas de normalización: se trata de un ajuste *head-only*.

La relevancia del modelo es metodológica más que de rendimiento absoluto: forma parte de un estudio sistemático de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su función es servir de referencia reproducible para evaluar hasta qué punto un modelo de visión generalista, sin reentrenamiento del backbone, transfiere a una tarea científica de dominio específico con clases desbalanceadas y morfologías sutiles.

Con 196,4 millones de parámetros y un repositorio de 0,8 GB, el modelo obtiene un 41,60 % de accuracy y un 37,25 % de F1 ponderado en el conjunto de test reservado (1.774 imágenes), con una media de 41,94 ± 0,34 % de accuracy sobre tres semillas. Son cifras modestas para diez clases, y reflejan la dificultad intrínseca de la clasificación morfológica galáctica cuando el extractor de características no se adapta al dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura con bloques ConvNeXt, normalización LayerNorm y activación GELU, más GRN) |
| Parametros totales | 196.435.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser una CNN de 196 M de parámetros es viable en fp16/bf16 e int8 con herramientas estándar) |
| Idiomas soportados | no disponible (modelo de visión, sin componente textual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 Large, una CNN moderna que incorpora capas convolucionales depthwise de 7x7, LayerNorm en lugar de BatchNorm, un cuello de botella invertido con ratio de expansión 4 y la capa GRN (Global Response Normalization) introducida en ConvNeXt V2 para mejorar la diversidad de características. El checkpoint base se preentrenó sobre ImageNet-1k a resolución 224x224. Sobre él se añade una única capa lineal de diez salidas que constituye el clasificador de morfología galáctica.

El entrenamiento es exclusivamente *head-only*: el backbone está congelado, incluidas las estadísticas de normalización, y solo se optimiza la cabeza lineal. El protocolo, idéntico para los 40 backbones del estudio, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a recorte aleatorio redimensionado a la resolución de entrada y volteo horizontal aleatorio. La evaluación aplica redimensionado y recorte central a 224x224 px con la normalización del procesador del checkpoint base.

Los datos proceden de Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reserva como test held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La época seleccionada es la 30 (mínima pérdida de validación, 1,6835). El entrenamiento se realizó con PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0, con semilla 42.

## Capacidades

- Clasificación de imágenes en diez clases de morfología galáctica del catálogo Galaxy10 DECaLS.
- Extracción de características visuales de uso general heredadas de ConvNeXt V2 Large preentrenado en ImageNet-1k (el backbone es reutilizable como extractor congelado).
- Inferencia determinista y reproducible: el autor verificó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados de la época seleccionada (diferencia absoluta máxima de 2,50e-06).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un clasificador de imágenes puro.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo *thinking*, visión generativa, audio ni ninguna otra modalidad.

## Casos de uso

- **Etiquetado preliminar de morfología galáctica a gran escala**: aplicar el modelo sobre recortes de 224x224 px de imágenes DECaLS para preclasificar candidatos en diez categorías antes de la revisión por astrónomos, reduciendo el volumen de inspección manual. Adecuado por su coste de inferencia bajo (196 M de parámetros) y su naturaleza determinista.
- **Línea base reproducible en estudios de transferencia**: usar el checkpoint como referencia *head-only* frente a variantes con fine-tuning completo del backbone, dado que el protocolo, los splits y las métricas por época están publicados en el dataset `vision-foundation-models-benchmark-runs`.
- **Filtrado de contaminantes en catálogos**: descartar imágenes con morfología incompatible con la clase de interés (por ejemplo, separar espirales de elípticas) en pipelines de selección de muestras, aceptando el nivel de accuracy del 41,6 % como filtro grueso y no como decisión final.
- **Prototipado rápido en astronomía sin GPU de gran capacidad**: al ser un modelo de 0,8 GB en fp32, puede desplegarse en una GPU de consumo para validar una hipótesis de clasificación antes de invertir en modelos mayores o en reentrenamiento del backbone.
- **Docencia y divulgación de *transfer learning* en visión científica**: el par (backbone congelado + cabeza lineal) ilustra de forma directa los límites de la adaptación *head-only* en dominios con desplazamiento de distribución respecto a ImageNet.
- **Comparación entre backbones de visión**: integrado en la colección de 40 backbones, permite evaluar empíricamente qué arquitectura preentrenada transfiere mejor a morfología galáctica bajo un protocolo idéntico y con tres semillas.
- **Generación de características para modelos posteriores**: congelar el backbone y extraer embeddings para alimentar clasificadores alternativos (SVM, gradient boosting) o técnicas de clustering sobre el catálogo Galaxy10 DECaLS.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 41,60 % |
| F1 ponderado (semilla 42, época 30 de 30) | 37,25 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 41,94 ± 0,34 % |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 37,37 ± 0,18 % |

Evolución de la accuracy de test en la semilla 42 (selección de época por mínima pérdida de validación):

| Epoca | Perdida validacion | Accuracy validacion (%) | Accuracy test (%) | F1 ponderado test (%) |
|---|---|---|---|---|
| 1 | 2,2763 | 13,53 | 13,53 | 8,52 |
| 5 | 2,0196 | 30,33 | 30,83 | 22,32 |
| 10 | 1,8531 | 37,26 | 37,15 | 30,75 |
| 15 | 1,7659 | 39,35 | 39,74 | 34,79 |
| 20 | 1,7168 | 40,92 | 40,30 | 35,48 |
| 25 | 1,6911 | 41,66 | 41,26 | 36,85 |
| 30 (seleccionada) | 1,6835 | 41,71 | 41,60 | 37,25 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; la comparación entre los 40 backbones del estudio está en el artículo y en el dataset de runs, no en esta model card.

## Requisitos de hardware

- **VRAM estimada en fp32**: aproximadamente 0,8 GB para los pesos, más activaciones; con lotes pequeños (1 a 32 imágenes de 224x224 px) la inferencia cabe holgadamente en 2-4 GB.
- **VRAM estimada en fp16/bf16**: en torno a 0,4 GB de pesos; cuantización int8 no documentada por el autor pero viable con herramientas estándar de PyTorch.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente; A100 y H100 no son necesarias y solo aportan throughput.
- **GPU de consumo**: sí, cabe en todas las GPU de consumo modernas (GTX 1660 6 GB en adelante), así como en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: transformers (`AutoModelForImageClassification`), TorchScript/ONNX para producción, y servidores de inferencia compatibles con modelos de visión de transformers (por ejemplo, endpoints de Hugging Face, marcados como `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI no aplican: son motores para modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño (196 M de parámetros, resolución 224x224), se espera un throughput alto en GPU moderna, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| convnextv2-large-1k-224-galaxy10-decals-head-v2 (este) | 196,4 M | 224x224 px | Clasificación de 10 clases de morfología galáctica | apache-2.0 | 41,60 % accuracy, 37,25 % F1 ponderado (test Galaxy10 DECaLS) |
| facebook/convnextv2-large-1k-224 (base) | ~198 M | 224x224 px | Clasificación ImageNet-1k (1.000 clases) | apache-2.0 (según checkpoint base) | no disponible en esta ficha |
| Otros backbones de la colección Vision Foundation Models Benchmark | variable (40 backbones) | 224x224 px | Clasificación de 10 clases de morfología galáctica | variable según backbone | resultados en el dataset `vision-foundation-models-benchmark-runs`, no incluidos aquí |

No se han identificado en la información disponible otros clasificadores de morfología galáctica comparables con métricas publicadas sobre el mismo split.

## Limitaciones y advertencias

- **Rendimiento modesto**: 41,60 % de accuracy sobre diez clases implica una tasa de error del 58,4 %; el F1 ponderado de 37,25 % indica dificultades claras en clases minoritarias o morfológicamente ambiguas. No es adecuado como clasificador autónomo en producción científica sin revisión humana.
- **Sesgo de dominio**: el backbone se preentrenó en ImageNet-1k y nunca se adaptó a imágenes astronómicas; las estadísticas de normalización del backbone están congeladas, lo que puede no ajustarse a la distribución de brillo y ruido de DECaLS.
- **Riesgo de alucinación de clase**: al ser un clasificador cerrado de diez clases, asignará siempre una de ellas incluso a imágenes fuera de distribución (artefactos, estrellas, galaxias atípicas), sin mecanismo de abstención.
- **Desbalance de clases**: el F1 ponderado notablemente inferior a la accuracy sugiere bajo rendimiento en clases poco representadas; conviene revisar la matriz de confusión antes de cualquier uso.
- **Alcance limitado**: solo morfología Galaxy10 DECaLS a 224x224 px; no generaliza a otros sondeos, resoluciones o bandas sin reentrenamiento.
- **Licencia**: apache-2.0 permite uso comercial y modificación, pero el checkpoint base y el dataset subyacente pueden tener sus propias condiciones que conviene verificar por separado.
- **Verificación**: las métricas son declaradas por el autor y marcadas como `verified: false` en el model-index; no han sido replicadas de forma independiente en la información disponible.
- **Mantenimiento**: 16 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo con soporte activo.
- **Sin documentación de cuantización ni latencia**: no hay guías de despliegue en producción más allá del fragmento de código de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-large-1k-224-galaxy10-decals-head-v2
- Checkpoint base: https://huggingface.co/facebook/convnextv2-large-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs y métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de URL)
