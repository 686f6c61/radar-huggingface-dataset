# matthieulel/convnextv2-nano-1k-224-galaxy10-decals-full-v2

## Resumen

`convnextv2-nano-1k-224-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` como parte de una colección de 80 configuraciones que compara 40 backbones de visión preentrenados bajo dos regímenes de adaptación. El modelo parte de `facebook/convnextv2-nano-1k-224`, un ConvNeXt V2 de tipo nano preentrenado en ImageNet-1k a 224 px, y se ha ajustado completamente (todos los parámetros actualizados) sobre el conjunto Galaxy10 DECaLS, que clasifica imágenes astronómicas en 10 clases morfológicas.

El resultado es un checkpoint compacto de 14,99 millones de parámetros y aproximadamente 0,1 GB, con una precisión del 84,39 % y un F1 ponderado del 83,97 % en el conjunto de test reservado de 1.774 imágenes. La relevancia actual reside en que forma parte de un estudio sistemático (artículo en revisión para *Astronomy and Computing*, versión revisada de 2026) sobre cómo se comportan los modelos fundacionales de visión cuando se aplican a datos astronómicos, un dominio con distribución visual muy distinta a la de ImageNet.

El modelo está pensado para tareas de clasificación morfológica galáctica en pipelines de astronomía observacional, no para generación de texto ni razonamiento. Su licencia Apache 2.0 y su reducido tamaño lo hacen desplegable en hardware modesto, incluyendo GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, familia ConvNeXt V2) |
| Parámetros totales | 14.989.210 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones específicas; al ser un modelo de 15 M de parámetros, fp32 y fp16 son viables sin cuantización) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt V2 en su variante nano, una red convolucional pura que moderniza el diseño de ResNet con bloques invertidos, convoluciones depthwise de mayor kernel y normalización LayerNorm, e incorpora en la versión V2 una capa de masked autoencoder (MAE) con codificador y decodificador convolucionales durante el preentrenamiento. El backbone original se preentrenó en ImageNet-1k a 224 px; sobre él se añade una cabeza lineal de 10 salidas correspondientes a las clases morfológicas de Galaxy10 DECaLS.

El ajuste fino es completo (full fine-tuning), con todos los parámetros actualizados. El protocolo, idéntico para los 40 backbones del estudio, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. Como aumentación se aplican random resized crop a la resolución de entrada y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 224x224 px y se normaliza con las medias y desviaciones del procesador de imágenes del checkpoint. La selección de época se hace por mínima pérdida de validación (época 8 en la semilla 42). El conjunto Galaxy10 DECaLS contiene 17.736 imágenes: 14.188 de entrenamiento, 1.774 de validación y 1.774 de test reservado, con estratificación por clase.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de características visuales mediante el backbone ConvNeXt V2 nano, reutilizable para otras tareas de visión.
- Inferencia sobre imágenes de 224x224 px con el pipeline `image-classification` de transformers.
- Compatible con los endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Clasificación morfológica automatizada en sondeos astronómicos: el modelo recibe recortes de 224x224 px de imágenes DECaLS y devuelve una de las 10 clases morfológicas, lo que permite etiquetar grandes volúmenes de galaxias sin inspección visual humana.
- Preetiquetado para revisión experta: se puede usar como primer filtro en catálogos y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de anotación en proyectos de ciencia ciudadana.
- Estudio comparativo de modelos fundacionales de visión: al formar parte de una colección de 80 configuraciones con protocolo idéntico, sirve como línea base reproducible para evaluar el efecto del preentrenamiento en dominios astronómicos.
- Selección de backbone para pipelines de astronomía: su tamaño de 15 M de parámetros y su precisión del 84,39 % permiten compararlo con alternativas mayores para decidir el equilibrio entre coste computacional y exactitud.
- Despliegue en hardware de consumo: al ocupar 0,1 GB en safetensors y ser un modelo convolucional pequeño, puede ejecutarse en CPU o en GPU de gama baja para demostraciones, docencia o prototipos.
- Extracción de embeddings para agrupamiento o búsqueda de similitud: las características del backbone se pueden usar para clustering de morfologías o recuperación de imágenes similares en catálogos.
- Control de calidad de datos: detectar imágenes mal etiquetadas o fuera de distribución en conjuntos astronómicos comparando la predicción del modelo con la etiqueta original.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada) | 0,8439 |
| F1 ponderado (semilla 42, época seleccionada) | 0,8397 |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 84,24 ± 0,14 % |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 83,84 ± 0,18 % |

Evolución de la accuracy de test en la semilla 42 (extracto de la tabla por épocas de la model card): época 1, 68,83 %; época 8 (seleccionada), 84,39 %; época 20, 85,23 %; época 30, 85,06 %. La época seleccionada es la de mínima pérdida de validación (0,4745), no la de mayor accuracy de test, lo que explica que algunas épocas posteriores superen ligeramente el resultado reportado.

No se han publicado en la información disponible resultados comparativos con otros backbones de la misma colección ni con modelos alternativos en Galaxy10 DECaLS.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para un lote pequeño; el modelo tiene 14,99 M de parámetros (unos 60 MB en fp32 y unos 30 MB en fp16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4, e incluso en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor` (documentado por el autor); también es viable la exportación a ONNX o TorchScript para servir con TorchServe o similar. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo y la resolución de entrada (224x224 px), se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de los otros 39 backbones de la colección ni de modelos alternativos evaluados sobre Galaxy10 DECaLS, por lo que no es posible construir una comparativa numérica fiable. Como referencia estructural:

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (ConvNeXt V2 nano fine-tuned) | 14,99 M | imagen 224x224 px | Apache 2.0 | Hugging Face |
| facebook/convnextv2-nano-1k-224 (base) | ~15 M | imagen 224x224 px | Apache 2.0 | Hugging Face |
| Otros backbones de la colección (40 en total) | no disponible | no disponible | no disponible | colección Vision Foundation Models Benchmark |

Los datos de precisión de los demás modelos de la colección están en el dataset `matthieulel/vision-foundation-models-benchmark-runs`, pero no se incluyen en la información disponible para esta ficha.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de imágenes de galaxias de Galaxy10 DECaLS; no es un modelo de propósito general y no debe usarse fuera de ese dominio sin reentrenamiento.
- Riesgo de degradación ante imágenes con distribución distinta a la del conjunto de entrenamiento (otros telescopios, otras bandas, otros niveles de ruido o recorte).
- Sesgos potenciales derivados del etiquetado original de Galaxy10 DECaLS y de la estratificación por clase; no se documenta un análisis de sesgo por clase ni por tipo morfológico.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza en imágenes ambiguas o atípicas; se recomienda umbral de confianza y revisión humana en producción.
- La época seleccionada es la de mínima pérdida de validación (época 8), no la de mayor accuracy de test; algunas épocas posteriores obtienen métricas de test ligeramente superiores, lo que sugiere que el criterio de selección podría no ser óptimo para esta métrica.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en el model-index).
- Licencia Apache 2.0: permite uso comercial, pero se recomienda citar el artículo asociado (en revisión para *Astronomy and Computing*) cuando se publique.
- No hay información sobre idiomas, cuantizaciones soportadas ni latencia, lo que limita la planificación de despliegues con requisitos estrictos.
- El autor no documenta una verificación exhaustiva más allá de las primeras 96 imágenes de test (predicciones idénticas al 100 % respecto a los logits guardados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-nano-1k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-nano-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; cita pendiente de publicación)
