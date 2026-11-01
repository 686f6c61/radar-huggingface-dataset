# matthieulel/convnextv2-atto-1k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-atto-1k-224-galaxy10-decals-head-v2` es un modelo de clasificación de imágenes desarrollado por matthieulel que adapta el backbone `facebook/convnextv2-atto-1k-224` a la clasificación de morfología de galaxias sobre el conjunto Galaxy10 DECaLS, con 10 clases de salida. Forma parte de una colección de 80 configuraciones (40 backbones preentrenados multiplicados por dos regímenes de adaptación) publicada en el contexto del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

La adaptación es deliberadamente mínima: el backbone ConvNeXt V2 Atto se congela por completo (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas. El repositorio contiene por tanto los pesos originales del checkpoint base más la cabeza entrenada, con un total de 3.390.610 parámetros. El modelo resuelve un problema acotado —clasificación morfológica de galaxias en imágenes de 224x224 px— y sirve como referencia de línea base para evaluar hasta qué punto un backbone genérico de visión, sin ajuste fino profundo, transfiere a datos astronómicos.

Es relevante ahora porque proporciona un punto de comparación reproducible y de bajo coste computacional dentro de un benchmark sistemático de modelos fundacionales de visión aplicados a astronomía, con protocolo de entrenamiento idéntico entre los 40 backbones evaluados, métricas por época publicadas y verificación de integridad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, backbone `facebook/convnextv2-atto-1k-224` congelado + cabeza lineal de 10 clases) |
| Parametros totales | 3.390.610 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es una ConvNeXt V2 en su variante Atto, una red convolucional pura con bloques que incorporan convoluciones depthwise de kernel grande, normalización LayerNorm y activación GELU, más el mecanismo GRN (Global Response Normalization) introducido en ConvNeXt V2. El backbone proviene de `facebook/convnextv2-atto-1k-224`, preentrenado en ImageNet-1k a 224x224 px, y se mantiene completamente congelado durante el ajuste, incluidas las estadísticas de sus capas de normalización. Solo se entrena una capa lineal de 10 salidas que mapea el vector de características global a las clases morfológicas.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como test held-out y el split público de train dividido de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del benchmark, usa AdamW (betas 0.9/0.999, eps 1e-8, weight decay 0.1, gradient clipping 1.0), learning rate 1e-4 con schedule lineal y 10% de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación usa resize y center crop a 224x224 px con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre el esquema de Galaxy10 DECaLS.
- Extracción de características visuales genéricas heredadas del backbone ConvNeXt V2 Atto preentrenado en ImageNet-1k.
- Inferencia sobre imágenes de 224x224 px con el preprocesado estándar del image processor (resize, center crop y normalización).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en catálogos de imágenes DECaLS: el modelo asigna una de las 10 clases de Galaxy10 a recortes de 224x224 px, útil para triaje rápido de candidatos antes de inspección visual o clasificación morfológica detallada.
- Línea base en estudios de transferencia de modelos fundacionales de visión: al ser una configuración con backbone congelado y cabeza lineal, permite medir cuánto aporta el preentrenamiento genérico frente a otros 39 backbones bajo el mismo protocolo.
- Etiquetado asistido en proyectos de ciencia ciudadana: las predicciones pueden priorizar imágenes para revisión humana, aprovechando que el modelo es extremadamente ligero (3,39 M de parámetros) y puede ejecutarse en CPU.
- Prototipado rápido de pipelines astronómicos: su tamaño reducido y su licencia Apache 2.0 permiten desplegarlo en entornos con recursos limitados para validar la viabilidad de un clasificador morfológico antes de invertir en modelos mayores.
- Reproducibilidad de benchmarks: sirve como referencia verificada (el autor comprobó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100% con los logits guardados) para replicar experimentos del artículo asociado.
- Docencia y experimentación con ajuste fino: al entrenar solo una cabeza lineal sobre un backbone congelado, es un ejemplo didáctico y de bajo coste de transfer learning en dominios científicos.
- Filtrado de contaminantes en muestras astronómicas: la clasificación en 10 clases puede emplearse para descartar objetos con morfología incompatible con la muestra de interés en estudios de selección.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente por HuggingFace), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30) | 45,38 % |
| Weighted F1 (semilla 42, época 30) | 42,73 % |
| Accuracy media +/- desv. típica (semillas 42, 1, 2) | 45,42 +/- 0,85 % |
| Weighted F1 media +/- desv. típica (semillas 42, 1, 2) | 42,90 +/- 0,89 % |

Progresión de referencia (semilla 42, test): 7,10 % de accuracy en la época 1, 30,33 % en la época 4, 39,85 % en la época 10 y 45,38 % en la época 30 seleccionada. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (3,39 M de parámetros, unos 13,6 MB de pesos); el consumo real lo domina el tamaño del lote de imágenes de 224x224 px.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX o TorchScript, y `optimum` para inferencia optimizada; no se documentan pesos GGUF ni soporte nativo en llama.cpp u Ollama (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `matthieulel/convnextv2-atto-1k-224-galaxy10-decals-head-v2` | 3.390.610 | Imagen 224x224 px | 45,38 % accuracy, 42,73 % weighted F1 en Galaxy10 DECaLS test | Apache 2.0 | HuggingFace |
| `facebook/convnextv2-atto-1k-224` (backbone base) | 3,4 M aprox. | Imagen 224x224 px | Preentrenado en ImageNet-1k; sin métricas en Galaxy10 publicadas | Apache 2.0 | HuggingFace |
| Otros backbones de la colección Vision Foundation Models Benchmark (39 restantes) | Variable según backbone | Imagen 224x224 px | Métricas por backbone en el dataset `vision-foundation-models-benchmark-runs`; no disponibles en esta ficha | Según backbone | HuggingFace |

No se dispone en la información proporcionada de resultados numéricos de los 39 backbones restantes ni de alternativas externas al benchmark, por lo que la comparación cuantitativa con modelos de la misma categoría queda limitada a los datos del propio autor.

## Limitaciones y advertencias

- Rendimiento moderado: 45,38 % de accuracy sobre 10 clases indica que la transferencia con backbone congelado es limitada; no debe usarse como clasificador de producción sin validación adicional.
- Sesgos de dominio: el modelo solo se ha evaluado sobre Galaxy10 DECaLS; su comportamiento en imágenes de otros surveys, resoluciones o condiciones de ruido es desconocido.
- Riesgo de alucinación en sentido amplio: al ser un clasificador, siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución o no astronómicas, sin mecanismo de rechazo.
- Limitaciones de contexto: la entrada está fijada a 224x224 px con resize y center crop, lo que puede perder estructura morfológica fina en galaxias extensas.
- Sin capacidades de texto ni multilingües: no es apto para tareas de lenguaje, tool calling ni agentes.
- Selección de época: la época 30 (la última) es la de mínima pérdida de validación, lo que sugiere que el entrenamiento podría beneficiarse de más épocas; el autor no documenta una búsqueda extendida.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `facebook/convnextv2-atto-1k-224` debe respetarse igualmente bajo sus propios términos.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; la verificación de integridad del autor cubre solo la reproducibilidad de los logits guardados, no la validez del benchmark frente a terceros.
- Paper pendiente de publicación: la cita del artículo asociado está incompleta, lo que dificulta la trazabilidad académica completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/convnextv2-atto-1k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-atto-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
