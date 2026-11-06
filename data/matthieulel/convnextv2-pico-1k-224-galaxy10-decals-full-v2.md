# matthieulel/convnextv2-pico-1k-224-galaxy10-decals-full-v2

## Resumen

`convnextv2-pico-1k-224-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por matthieulel, consistente en un ConvNeXtV2 "pico" preentrenado en ImageNet-1k y ajustado completamente (full fine-tuning) para clasificar morfología de galaxias en el dataset Galaxy10 DECaLS. El modelo resuelve una tarea de clasificación de 10 clases sobre imágenes astronómicas de 224x224 píxeles, y forma parte de una colección comparativa de 80 configuraciones (40 backbones preentrenados x dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

Se trata de un modelo muy compacto: 8.558.410 parámetros totales en formato safetensors, con licencia Apache 2.0 y compatible con la librería transformers y con endpoints de Hugging Face. Su relevancia radica en que ofrece un punto de referencia reproducible y ligero para evaluar hasta qué punto los backbones de visión preentrenados en imágenes naturales transfieren bien a datos astronómicos, con un protocolo de entrenamiento idéntico para todos los modelos de la colección.

El checkpoint publicado corresponde al epoch 11 de 30 (seleccionado por mínima pérdida de validación) con semilla 42, y alcanza un 84,61% de accuracy y un 84,45% de F1 ponderado en el conjunto de test reservado de 1.774 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXtV2 (red convolucional pura, familia ConvNeXt) |
| Parametros totales | 8.558.410 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | image-classification (10 clases de morfología galáctica) |
| Dataset de entrenamiento | Galaxy10 DECaLS (17.736 imágenes) |
| Resolución de entrada | 224x224 px |
| Modelo base | facebook/convnextv2-pico-1k-224 |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXtV2 en su variante "pico", una red convolucional pura (sin atención) que moderniza el diseño ConvNeXt con capas de normalización y bloques de convolución profundos. El modelo parte de los pesos de `facebook/convnextv2-pico-1k-224`, preentrenados en ImageNet-1k, y se somete a un ajuste completo de todos los parámetros. La cabeza de clasificación se sustituye por una única capa lineal con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS.

El protocolo de entrenamiento es idéntico para los 40 backbones de la colección: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, scheduler lineal con 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 epochs, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación aplica resize y center crop a 224x224 px con la normalización del image processor del checkpoint. La selección del checkpoint se hace por mínima pérdida de validación (epoch 11 en la semilla 42). El dataset se divide en 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test reservado, con estratificación por clase.

Como innovación destacable, el modelo incluye una verificación de integridad: al recargar el repositorio y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coincidieron con los logits guardados del epoch seleccionado en el 100,0% de los casos (diferencia absoluta máxima de logit de 6,20e-06).

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases de morfología galáctica (Galaxy10 DECaLS).
- Extracción de características visuales mediante un backbone ConvNeXtV2 preentrenado en ImageNet-1k y ajustado al dominio.
- Inferencia sobre imágenes de 224x224 px con preprocesado estándar (resize, center crop, normalización).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje; es un clasificador puro de imágenes.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos astronómicos: el modelo asigna una de las diez clases de Galaxy10 DECaLS a cada imagen de 224x224 px, lo que permite procesar lotes de imágenes de surveys como DECaLS de forma rápida y con un 84,61% de accuracy en test.
- Etiquetado previo y triaje en pipelines de ciencia ciudadana: puede preclasificar imágenes antes de la revisión humana, reduciendo la carga de voluntarios en proyectos tipo Galaxy Zoo y priorizando los casos ambiguos.
- Benchmark de transferencia de foundation models a astronomía: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve para comparar el rendimiento de distintos backbones de visión sobre el mismo dataset y protocolo.
- Prototipado rápido en entornos con recursos limitados: con solo 8,56 M de parámetros, cabe en GPU de consumo y permite iterar sobre preprocesado, aumentación o subconjuntos de datos sin infraestructura pesada.
- Educación y divulgación en astroinformática: su tamaño reducido y su API estándar de transformers lo hacen adecuado para talleres y cursos donde se enseña fine-tuning de modelos de visión sobre datos científicos.
- Filtrado de calidad en pipelines de observación: puede usarse como clasificador auxiliar para descartar o marcar imágenes con morfología atípica antes de análisis más costosos.
- Servicio de inferencia ligero: compatible con endpoints de Hugging Face y con despliegue en CPU/GPU de gama baja, adecuado para APIs de clasificación de imágenes astronómicas con latencia baja.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (dataset Galaxy10 DECaLS, split test de 1.774 imágenes, semilla 42, epoch 11 seleccionado por mínima pérdida de validación):

| Metrica | Valor |
|---|---|
| Accuracy (test) | 84,61% |
| F1 ponderado (test) | 84,45% |
| Media +/- desv. típica de accuracy en 3 semillas (42, 1, 2) | 84,74 +/- 0,33 |
| Media +/- desv. típica de F1 ponderado en 3 semillas | 84,54 +/- 0,24 |

Evolución por epoch (semilla 42, selección en epoch 11):

| Epoch | Perdida val. | Acc. val. | Acc. test | F1 pond. test |
|---|---|---|---|---|
| 1 | 0,9764 | 67,42 | 65,78 | 64,18 |
| 5 | 0,6087 | 79,54 | 78,75 | 78,02 |
| 11 (seleccionado) | 0,4679 | 84,78 | 84,61 | 84,45 |
| 20 | 0,5483 | 85,74 | 83,93 | 83,83 |
| 30 | 0,5765 | 85,40 | 85,34 | 85,16 |

No se han publicado en la informacion disponible resultados comparativos frente a otros backbones de la coleccion ni frente a modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 35 MB para los pesos (8,56 M de parámetros x 4 bytes), más overhead de activaciones y del framework; en la práctica, menos de 1 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 17 MB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; incluso en iGPU y CPU con tiempos de inferencia aceptables.
- Opciones de despliegue: `transformers` (PyTorch), endpoints de Hugging Face, exportación a ONNX o TorchScript para servir con runtime propio; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una ConvNeXt pico de 8,56 M de parámetros, el throughput por GPU es alto, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convnextv2-pico-1k-224-galaxy10-decals-full-v2 (este) | 8.558.410 | Imagen 224x224 px | Clasificación de 10 clases de morfología galáctica | Apache 2.0 | Hugging Face, transformers |
| facebook/convnextv2-pico-1k-224 (base) | no disponible en la informacion | Imagen 224x224 px | Clasificación ImageNet-1k (1.000 clases) | no disponible en la informacion | Hugging Face |
| Otros backbones de la coleccion Vision Foundation Models Benchmark | no disponible en la informacion | Imagen 224x224 px | Clasificación Galaxy10 DECaLS | no disponible en la informacion | Hugging Face (colección del autor) |

No se dispone en la informacion proporcionada de datos de rendimiento de los modelos comparables sobre Galaxy10 DECaLS, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en las 10 clases de Galaxy10 DECaLS; no generaliza a otras taxonomías morfológicas ni a otros surveys sin reentrenamiento.
- Riesgo de sesgo de dominio: el preentrenamiento en ImageNet-1k (imágenes naturales) puede no capturar todas las particularidades de las imágenes astronómicas, y el ajuste se limita a 17.736 imágenes.
- Riesgo de alucinación en sentido amplio: como clasificador, puede asignar clases con alta confianza a imágenes ambiguas, atípicas o fuera de distribución; se recomienda calibrar y revisar umbrales en producción.
- El accuracy en test es del 84,61%, con una variabilidad entre semillas de +/- 0,33 puntos; no es un modelo de precisión exhaustiva para estudios morfológicos finos.
- La selección del checkpoint por mínima pérdida de validación puede introducir un ligero sesgo optimista respecto al test, aunque el test es un split reservado.
- No soporta texto, tool calling ni agentes; no debe emplearse en tareas de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el artículo asociado (pendiente de publicación) y conservar los avisos de licencia.
- El artículo de referencia está en revisión para *Astronomy and Computing*, por lo que la cita completa aún no está disponible.
- No se documentan cuantizaciones oficiales ni pruebas de robustez frente a ruido, artefactos de imagen o variaciones de instrumento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-pico-1k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-pico-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por epoch y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación)
