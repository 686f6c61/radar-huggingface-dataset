# matthieulel/dinov2-large-galaxy10-decals-head-v2

## Resumen

`matthieulel/dinov2-large-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias construido sobre el backbone `facebook/dinov2-large` y afinado sobre el conjunto Galaxy10 DECaLS (10 clases). Lo desarrolla matthieulel como parte de la colección *Vision Foundation Models Benchmark*, un estudio comparativo de 40 backbones preentrenados bajo dos regímenes de adaptación, asociado al artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). El modelo resuelve una tarea concreta de clasificación morfológica galáctica en imágenes del sondeo DECaLS, un problema clásico de astronomía observacional donde el etiquetado manual es costoso.

La arquitectura subyacente es un ViT-L/14 (DINOv2) de 304,4 millones de parámetros, con el backbone completamente congelado y una única capa lineal de 10 salidas entrenada encima (head-only fine-tuning). El repositorio contiene tanto los pesos del backbone original como la cabeza entrenada, en formato safetensors y compatible con `transformers`. La ventana de contexto no aplica: es un modelo de visión puro, sin entrada de texto.

Su relevancia es metodológica: sirve como referencia reproducible de hasta dónde llega un foundation model visual con adaptación mínima en un dominio científico específico, con protocolo de entrenamiento documentado, métricas por época y partición de datos pública. Con 18 descargas y licencia Apache 2.0, está pensado para investigación y evaluación comparativa más que para despliegue comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (DINOv2) con cabeza lineal de clasificación (10 clases) |
| Parametros totales | 304.389.130 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors fp32 es convertible a fp16/bf16/int8 con herramientas estándar) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer DINOv2-Large (ViT-L/14) preentrenado por Meta con autosupervisión y reutilizado como extractor de características congelado. Sobre él se añade una capa lineal de 10 salidas que se entrena de forma aislada; las estadísticas de normalización del backbone también quedan congeladas. La entrada se procesa con el image processor del checkpoint base, con redimensionado y recorte central a 256x256 px en evaluación.

El entrenamiento usa el split público de Galaxy10 DECaLS (17.736 imágenes): el test público (1.774 imágenes) se reserva como test held-out y el train público se divide de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 con acumulación de 8 pasos (batch efectivo 256), 30 épocas, fp32 con TF32 desactivado y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio. La época se selecciona por mínima pérdida de validación (época 28 en la semilla 42). El autor reporta una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden al 100 % con los logits guardados (diferencia absoluta máxima de 4,94e-05).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del conjunto Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone DINOv2-Large congelado, reutilizable para otras tareas astronómicas con una nueva cabeza.
- Inferencia determinista y reproducible: protocolo de preprocesado fijado (resize + center crop a 256x256 y normalización del processor).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- No procesa texto ni audio; sin capacidades multilingües.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Clasificación morfológica automatizada en pipelines de reducción de datos de DECaLS: el modelo asigna una de las 10 clases a cada recorte de galaxia, reduciendo la carga de inspección visual en catálogos grandes.
- Etiquetado asistido para curación de datasets astronómicos: se usa como preetiquetador y los casos de baja confianza se derivan a revisión humana, dado un accuracy del 61,16 %.
- Baseline reproducible en estudios comparativos de foundation models: sirve como referencia de "adaptación mínima" frente a fine-tuning completo de otros backbones del mismo benchmark.
- Extracción de embeddings para búsqueda por similitud morfológica: los features del backbone congelado permiten agrupar galaxias con morfología parecida mediante clustering o vecinos próximos.
- Filtrado y triaje en surveys: descartar o marcar automáticamente imágenes con morfologías de interés (por ejemplo, espirales barradas) antes de un análisis más costoso.
- Docencia y experimentación metodológica: el repositorio incluye métricas por época, partición de datos y receta completa, lo que permite reproducir el experimento y estudiar el efecto del régimen head-only frente a fine-tuning completo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente), sobre el test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 28) | 61,16 % |
| F1 ponderado (semilla 42, época 28) | 59,30 % |
| Accuracy media +/- desv. típica (semillas 42, 1, 2) | 61,20 % +/- 0,34 |
| F1 ponderado medio +/- desv. típica (semillas 42, 1, 2) | 59,24 % +/- 0,30 |

La model card no incluye comparación numérica con otros backbones del benchmark; solo indica que este checkpoint es una de las 80 configuraciones del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2-1,5 GB para los pesos (304 M de parámetros) más el overhead de activaciones; con batch pequeño cabe holgadamente en GPUs de 4-6 GB.
- En fp16/bf16 el peso baja a unos 0,6 GB, con requisitos de VRAM aún menores.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB; una RTX 3060/4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos el cuello de botella será el preprocesado de imágenes, no el modelo.
- Cabe en GPU de consumo: sí, en todas las GPU consumer recientes con 4 GB o más.
- Opciones de despliegue: `transformers` (vía `AutoModelForImageClassification`), exportación a ONNX Runtime o TorchScript para servir por lotes; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo documenta el entrenamiento en una GPU única en fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| dinov2-large-galaxy10-decals-head-v2 | 304,4 M | Clasificación de 10 clases (Galaxy10 DECaLS) | Imagen 256x256 px | 61,16 % accuracy, 59,30 % F1 ponderado (test) | Apache 2.0 |
| facebook/dinov2-large (base) | 304,4 M | Features visuales genéricas | Imagen (resolución variable) | No evaluado en Galaxy10 en esta información | Apache 2.0 |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | Clasificación de 10 clases (Galaxy10 DECaLS) | Imagen | Métricas por backbone en el dataset `vision-foundation-models-benchmark-runs`; no incluidas aquí | no disponible |

No se dispone de resultados numéricos de los 39 backbones restantes del benchmark en la información proporcionada, por lo que no es posible una comparación cuantitativa directa.

## Limitaciones y advertencias

- Accuracy del 61,16 %: un 38,84 % de las imágenes de test se clasifican incorrectamente; no es adecuado como clasificador autónomo sin revisión humana en producción científica.
- F1 ponderado de 59,30 %: el rendimiento es desigual entre clases, con probable confusión entre morfologías visualmente próximas.
- El backbone está congelado y solo se entrena una capa lineal; el techo de rendimiento es inferior al de un fine-tuning completo, algo que el propio diseño del benchmark asume.
- Sesgos: el modelo se entrena exclusivamente con Galaxy10 DECaLS; generalizará mal a otros sondeos, instrumentos, profundidades o distribuciones de brillo y redshift no representadas.
- Riesgo de alucinación en sentido clasificatorio: siempre devuelve una de las 10 clases con logits, sin mecanismo de abstención ni estimación de incertidumbre calibrada.
- Idiomas: no aplica; no procesa texto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base DINOv2 y los datos Galaxy10 DECaLS tienen sus propias condiciones que conviene revisar antes de explotación comercial.
- El artículo asociado está en revisión en Astronomy and Computing; la cita aún no está disponible y los resultados no han sido verificados de forma independiente.
- Fecha de creación del repositorio indicada como 2026-10-30, posterior a la redacción de esta ficha; conviene confirmar la vigencia de los artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/dinov2-large-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/dinov2-large
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo *When foundation models meet astronomical data* (Astronomy and Computing, en revisión): referencia no disponible en la información proporcionada.
