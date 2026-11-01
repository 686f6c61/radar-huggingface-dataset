# matthieulel/convnextv2-tiny-22k-224-galaxy10-decals-full-v2

## Resumen

El modelo `convnextv2-tiny-22k-224-galaxy10-decals-full-v2` es un clasificador de imágenes de morfología galáctica desarrollado por el usuario de HuggingFace `matthieulel`. Se trata de un ajuste fino completo (*full fine-tuning*) del backbone `facebook/convnextv2-tiny-22k-224` sobre el conjunto de datos Galaxy10 DECaLS, que contiene 17.736 imágenes de galaxias etiquetadas en 10 clases morfológicas. El modelo resuelve una tarea concreta de visión por computador aplicada a astronomía: predecir la clase morfológica de una galaxia a partir de una imagen de 224x224 píxeles.

Forma parte de una colección mayor denominada *Vision Foundation Models Benchmark*, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación (80 configuraciones en total) con una receta de entrenamiento idéntica, en el marco de un artículo en revisión para *Astronomy and Computing* (2026). Este checkpoint concreto corresponde a la semilla 42, época 13 de 30, seleccionada por mínima pérdida de validación.

Con 27,87 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero y desplegable en hardware modesto. Su relevancia radica en ser un punto de referencia reproducible y verificado para la clasificación morfológica de galaxias, con métricas declaradas sobre un conjunto de test reservado de 1.774 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red neuronal convolucional pura, familia ConvNeXt) |
| Parametros totales | 27.874.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imágenes; entrada fija de 224x224 px) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación de imágenes (10 clases) |
| Resolucion de entrada | 224x224 px |
| Dataset de entrenamiento | Galaxy10 DECaLS (matthieulel/galaxy10_decals) |
| Modelo base | facebook/convnextv2-tiny-22k-224 |
| Regimen de ajuste | Full fine-tuning (todos los parámetros actualizados) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt V2 en su variante *tiny*, un diseño convolucional puro que moderniza la familia ConvNeXt incorporando capas de normalización, activaciones GELU y un esquema de convoluciones depthwise con kernel 7x7, además del mecanismo *Global Response Normalization* (GRN) introducido en ConvNeXt V2. El backbone fue preentrenado por Facebook en ImageNet-22k (de ahí el sufijo `22k`) y posteriormente adaptado mediante ajuste fino completo a la tarea astronómica. La cabeza de clasificación es una única capa lineal con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS.

El entrenamiento siguió una receta idéntica para los 40 backbones del benchmark: optimizador AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10% de warm-up, lotes de 32 imágenes con acumulación de gradiente sobre 8 pasos (lote efectivo 256), 30 épocas y precisión simple (fp32, TF32 desactivado) en una sola GPU. La aumentación consistió en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. La evaluación se realizó con redimensionado y recorte central a 224x224 px y normalización del procesador de imágenes del checkpoint. El conjunto de datos se dividió de forma estratificada por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test reservado. La selección del checkpoint se hizo por mínima pérdida de validación (época 13 en la semilla 42).

## Capacidades

- Clasificación de imágenes en 10 clases morfológicas de galaxias (Galaxy10 DECaLS).
- Procesamiento de imágenes RGB de 224x224 píxeles con normalización estándar del procesador de imágenes.
- Inferencia determinista y ligera: 27,87 M de parámetros, adecuada para ejecución en CPU o GPU de gama baja.
- Integración nativa con la librería `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo puede integrarse en un *pipeline* de reducción de datos para etiquetar automáticamente imágenes de galaxias procedentes de surveys como DECaLS, aprovechando su entrada fija de 224x224 px y su bajo coste computacional (27,87 M de parámetros).
- **Etiquetado previo para estudios morfológicos a gran escala**: sirve como primer paso para clasificar grandes volúmenes de imágenes antes de un análisis más fino o de una revisión humana, dado su *accuracy* declarado del 86,08% en test.
- **Benchmark de referencia para modelos de visión en astronomía**: al formar parte de una colección de 80 configuraciones con receta idéntica, permite comparar el rendimiento de distintos backbones (ConvNeXt, ViT, etc.) en la misma tarea y con el mismo protocolo.
- **Prototipado rápido en investigación**: su tamaño reducido (0,1 GB) y su licencia Apache 2.0 permiten desplegarlo en entornos de investigación con recursos limitados, incluso en CPU, para validar hipótesis morfológicas.
- **Aumentación de catálogos astronómicos**: puede utilizarse para predecir la clase morfológica de galaxias no etiquetadas y enriquecer catálogos existentes con etiquetas automáticas, filtrando posteriormente por confianza.
- **Educación y divulgación**: al ser un modelo pequeño y reproducible, es adecuado para demostraciones docentes sobre aplicación de *deep learning* a datos astronómicos reales.
- **Sistema de triaje en observatorios**: integrado en un flujo de adquisición de imágenes, puede priorizar qué galaxias requieren seguimiento espectroscópico según su morfología predicha.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (conjunto de test reservado de 1.774 imágenes, semilla 42, época 13 seleccionada por mínima pérdida de validación). Métricas no verificadas de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada) | 86,08% |
| F1 ponderado (semilla 42, época seleccionada) | 85,64% |
| Accuracy media +/- desv. típica (3 semillas: 42, 1, 2) | 85,48% +/- 0,65% |
| F1 ponderado medio +/- desv. típica (3 semillas) | 85,13% +/- 0,68% |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en la misma tabla de benchmarks, más allá de la pertenencia a la colección *Vision Foundation Models Benchmark* (cuyas tablas completas están en el dataset `vision-foundation-models-benchmark-runs`, no incluido en esta ficha).

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en fp32 (27,87 M de parámetros x 4 bytes ≈ 112 MB de pesos, más activaciones y overhead). Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 e incluso en CPU.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer moderna (y en muchas integradas).
- **Opciones de despliegue**: `transformers` (PyTorch), HuggingFace Inference Endpoints (tag `endpoints_compatible`), exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton. No se documentan pesos GGUF ni soporte nativo en llama.cpp u Ollama (no aplica a un clasificador de imágenes).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre el mismo conjunto de test con la misma receta, por lo que no es posible establecer una comparativa numérica fiable. Como referencia cualitativa, se indican alternativas de la misma categoría (clasificación de imágenes con backbones ligeros), sin datos de rendimiento comparables:

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| convnextv2-tiny-22k-224-galaxy10-decals-full-v2 (este) | 27,87 M | 224x224 px | Apache 2.0 | HuggingFace |
| facebook/convnextv2-tiny-22k-224 (base) | ~28 M | 224x224 px | Apache 2.0 | HuggingFace |
| Otros backbones del benchmark (ViT, Swin, etc.) | No disponible | No disponible | No disponible | Colección Vision Foundation Models Benchmark |

Los resultados completos de la comparativa entre los 40 backbones están en el dataset `vision-foundation-models-benchmark-runs`, no incluido en esta ficha.

## Limitaciones y advertencias

- **Sesgos del dataset**: el modelo hereda los sesgos de Galaxy10 DECaLS, que puede estar desbalanceado entre clases y limitado a galaxias con ciertas características de brillo y tamaño; el rendimiento puede degradarse en poblaciones no representadas.
- **Riesgo de alucinación**: en un clasificador esto se traduce en predicciones erróneas con alta confianza; no se documentan calibraciones de probabilidad ni umbrales de confianza recomendados.
- **Limitación de dominio**: entrenado exclusivamente en imágenes de Galaxy10 DECaLS a 224x224 px; no es transferible directamente a otros surveys, resoluciones o longitudes de onda sin reentrenamiento.
- **Idioma**: no aplica (modelo de visión); no procesa texto.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las etiquetas astronómicas.
- **Métricas no verificadas**: los resultados del *model-index* están marcados como `verified: false`; no han sido validados de forma independiente.
- **Protocolo de selección**: el checkpoint corresponde a la época 13 seleccionada por mínima pérdida de validación; otras épocas (p. ej., la 16 o la 21) muestran métricas de test ligeramente superiores, lo que sugiere variabilidad entre épocas.
- **Caveat de producción**: el modelo se entrenó en fp32 con TF32 desactivado; la inferencia en precisión reducida (fp16/bf16) no está documentada y podría alterar ligeramente las predicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/convnextv2-tiny-22k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-22k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación.
