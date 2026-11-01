# matthieulel/efficientnet_b7-galaxy10-decals-full-v2

## Resumen

`efficientnet_b7-galaxy10-decals-full-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por el usuario de HuggingFace matthieulel. Parte de los pesos de EfficientNet-B7 preentrenados en ImageNet-1k (`IMAGENET1K_V1`) y se ha ajustado completamente (todos los parámetros actualizados) sobre el conjunto Galaxy10 DECaLS, que distingue 10 clases morfológicas de galaxias. El modelo resuelve una tarea de clasificación de 10 clases sobre recortes astronómicos de 224x224 píxeles.

El checkpoint forma parte de una colección más amplia, *Vision Foundation Models Benchmark*, que evalúa 40 backbones de visión bajo dos regímenes de adaptación (80 configuraciones en total) siguiendo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). No es un modelo generativo ni un modelo de lenguaje: es una CNN de clasificación pura, sin capacidades de texto, tool calling ni razonamiento multi-paso.

Con 64,1 millones de parámetros y un repositorio de 0,3 GB, es un modelo ligero y desplegable en hardware modesto. Su relevancia radica en servir como referencia reproducible y bien documentada para la clasificación morfológica de galaxias, con métricas por época publicadas y una verificación de integridad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B7 (CNN, torchvision) con cabeza lineal de 10 salidas |
| Parametros totales | 64.123.290 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es EfficientNet-B7, una red convolucional con escalado compuesto de profundidad, anchura y resolución, inicializada con pesos de ImageNet-1k (`IMAGENET1K_V1`) y sometida a *full fine-tuning*: se actualizan todos los parámetros y se sustituye la cabeza por una capa lineal de 10 salidas. El entrenamiento emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10% de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y volteo horizontal aleatorio.

Los datos proceden de Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reserva como test held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La validación se usa únicamente para seleccionar la época: se elige la de mínima pérdida de validación (época 17 de 30), y los pesos publicados corresponden a esa época. La evaluación se realiza redimensionando y recortando al centro a 224x224 px con la normalización del procesador de imágenes del checkpoint. Se entrenaron tres semillas (42, 1, 2) para reportar media y desviación típica. El software empleado es PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. No se menciona uso de RLHF, DPO ni técnicas de decodificación especulativa, por tratarse de un clasificador.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de 224x224 px.
- Extracción de características visuales mediante el backbone EfficientNet-B7 (reutilizable para otras tareas de visión).
- Inferencia en fp32 con pesos verificados: la model card reporta predicciones idénticas al 100,0% en las primeras 96 imágenes de test respecto a los logits guardados (diferencia absoluta máxima de 4,53e-06).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en pipelines astronómicos: el modelo recibe recortes de 224x224 px de imágenes DECaLS y devuelve una de las 10 clases morfológicas, lo que permite procesar catálogos de imágenes de forma masiva sin intervención manual.
- Etiquetado asistido para proyectos de ciencia ciudadana: se puede usar como preetiquetador para priorizar o sugerir clasificaciones que luego validen voluntarios, reduciendo el esfuerzo de anotación en conjuntos grandes.
- Filtrado y selección de candidatos en estudios morfológicos: al ser ligero (64,1 M de parámetros), se integra en flujos de preprocesado que descartan o agrupan imágenes antes de análisis más costosos.
- Referencia reproducible para investigación en adaptación de backbones: forma parte de una colección de 80 configuraciones con métricas por época publicadas, útil para comparar regímenes de fine-tuning en datos astronómicos.
- Extracción de embeddings para agrupamiento o búsqueda por similitud: el backbone puede emplearse como extractor de características y combinarse con técnicas de clustering para explorar morfologías.
- Despliegue en entornos con recursos limitados: al caber en GPU de consumo y con un repositorio de 0,3 GB, es viable en estaciones de trabajo modestas o en inferencia por lotes en CPU/GPU única.
- Docencia y experimentación: su receta de entrenamiento completamente documentada (hiperparámetros, splits, métricas por época) lo hace adecuado para reproducir experimentos en cursos o talleres de aprendizaje automático aplicado a astronomía.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada 17) | 84,67% |
| Weighted F1 (semilla 42, época seleccionada 17) | 84,39% |
| Accuracy media +/- desv. típ. (semillas 42, 1, 2) | 85,21% +/- 0,51 |
| Weighted F1 media +/- desv. típ. (semillas 42, 1, 2) | 84,93% +/- 0,50 |

La model card incluye además métricas por época para la semilla 42; por ejemplo, en la época 30 el test alcanza 85,79% de accuracy y 85,59% de weighted F1, aunque la selección por mínima pérdida de validación recae en la época 17. No se han publicado en la información disponible resultados comparativos con otros modelos en una tabla de benchmarks común.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64,1 M de parámetros en fp32, el peso de los pesos ronda los 0,26 GB, por lo que la huella de memoria es reducida y depende del tamaño de lote.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido número de parámetros.
- Opciones de despliegue: al ser un modelo torchvision cargado con `safetensors` y PyTorch, el despliegue natural es un script de PyTorch o TorchServe; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones de la misma colección ni de modelos comparables con métricas sobre Galaxy10 DECaLS, por lo que no es posible establecer una comparativa numérica fiable.

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| efficientnet_b7-galaxy10-decals-full-v2 | 64,1 M | imagen 224x224 px | 84,67% (test, semilla 42) | BSD-3-Clause | HuggingFace |
| Otros backbones de la colección Vision Foundation Models Benchmark | no disponible | no disponible | no disponible | no disponible | HuggingFace (colección) |
| Alternativas de clasificación astronómica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de morfología galáctica sobre Galaxy10 DECaLS; no es un modelo de propósito general ni un modelo de lenguaje.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- La selección de época por mínima pérdida de validación puede no coincidir con la de máximo accuracy en test; de hecho, la época 17 seleccionada rinde por debajo de épocas posteriores en test.
- Riesgo de sobreajuste al dominio: entrenado con un conjunto limitado (17.736 imágenes) y aumentación mínima (recorte y volteo), por lo que la generalización a otros instrumentos, resoluciones o distribuciones de imagen no está garantizada.
- Posibles sesgos de clase derivados del desbalance del dataset Galaxy10 DECaLS; no se documentan análisis de sesgo ni métricas por clase en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en morfologías ambiguas o imágenes de baja calidad.
- No se documentan limitaciones idiomáticas por no ser un modelo de texto.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; conviene revisar los términos exactos antes de producción.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues de producción sin pruebas propias.
- El artículo asociado está en revisión, por lo que la citación académica aún no está completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/efficientnet_b7-galaxy10-decals-full-v2
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
