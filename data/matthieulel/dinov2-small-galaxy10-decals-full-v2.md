# matthieulel/dinov2-small-galaxy10-decals-full-v2

## Resumen

`matthieulel/dinov2-small-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, obtenido mediante ajuste fino completo (*full fine-tuning*) del backbone auto-supervisado `facebook/dinov2-small` sobre el conjunto de datos Galaxy10 DECaLS (10 clases morfológicas). Lo publica el usuario `matthieulel` como parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) que sirve de banco de pruebas para modelos fundacionales de visión aplicados a datos astronómicos.

El modelo resuelve una tarea concreta y acotada: dada una imagen de galaxia procedente de DECaLS (Dark Energy Camera Legacy Survey), asignarle una de diez categorías morfológicas. Con 22.064.266 parámetros totales y un repositorio de 0,1 GB, es un modelo compacto que se puede ejecutar en hardware modesto, lo que lo hace útil para clasificación a gran escala de catálogos astronómicos o como línea base en experimentos de *transfer learning*.

Su relevancia actual es metodológica más que de producto: forma parte de un estudio (artículo en revisión en *Astronomy and Computing*, versión revisada de 2026) que compara de forma sistemática cómo rinden distintos backbones fundacionales cuando se adaptan a datos astronómicos, con un protocolo de entrenamiento idéntico para todas las configuraciones. La licencia Apache 2.0 y el formato estándar de `transformers` facilitan su reutilización y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) DINOv2-small con cabeza lineal de clasificación de 10 salidas |
| Parametros totales | 22.064.266 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; los pesos se publican en safetensors fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo DINOv2 en su variante *small*, preentrenado de forma auto-supervisada por Meta (Facebook AI Research) y adaptado aquí mediante ajuste fino completo: se actualizan todos los parámetros del backbone y se añade una única capa lineal con diez salidas, una por clase morfológica. El régimen de adaptación es explícitamente *full fine-tuning*, en contraste con otras configuraciones de la misma colección que probablemente usan adaptación congelada o parcial (el autor distingue "dos regímenes de adaptación" entre las 80 configuraciones).

El entrenamiento usa Galaxy10 DECaLS (17.736 imágenes en total), con una partición estratificada por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test público reservadas como conjunto de evaluación held-out. La receta es AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente sobre 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a *random resized crop* a la resolución de entrada y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 256x256 px y se aplica la normalización del procesador de imágenes del checkpoint. La selección de época se hace por mínima pérdida de validación (época 15 de 30 en la semilla 42). El software declarado es PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS, con salida de logits por clase mediante `AutoModelForImageClassification`.
- Extracción de características visuales genéricas heredadas del backbone DINOv2-small, reutilizable como encoder congelado en otras tareas de visión (aunque el checkpoint está afinado para la tarea específica).
- Inferencia por imagen individual o por lote con el pipeline estándar de `transformers` y el procesador de imágenes incluido.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo *thinking* ni de decodificación especulativa; es un clasificador puro de una sola pasada.
- Verificación de integridad documentada: recarga y ejecución sobre las primeras 96 imágenes de test con predicciones idénticas al 100 % respecto a los logits guardados (diferencia absoluta máxima de 1,91e-06).

## Casos de uso

- Clasificación morfológica a gran escala de catálogos de imágenes DECaLS: el modelo procesa recortes de 256x256 px y devuelve una de diez clases, lo que permite etiquetar automáticamente miles de galaxias y priorizar la inspección visual humana en las clases de interés.
- Línea base en experimentos de *transfer learning* astronómico: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve para comparar el rendimiento de DINOv2-small frente a otros 39 backbones bajo el mismo protocolo, con métricas por época ya publicadas.
- Filtrado y curación de datos antes de entrenar modelos mayores: usar las predicciones y la confianza del clasificador para descartar imágenes mal etiquetadas o ambiguas en un pipeline de anotación.
- Enseñanza y divulgación de *machine learning* aplicado a astronomía: el modelo es pequeño (22 M de parámetros, 0,1 GB), se ejecuta en una GPU de consumo y su receta de entrenamiento está documentada al detalle, lo que lo hace idóneo para prácticas reproducibles.
- Detección de morfologías atípicas o minoritarias: comparando la distribución de clases predichas sobre un nuevo conjunto con la del entrenamiento se pueden señalar candidatos a galaxias raras para seguimiento espectroscópico.
- Servicio de inferencia ligero en CPU o GPU de gama baja para prototipos de herramientas de consulta astronómica, dado el reducido tamaño del checkpoint y la licencia Apache 2.0.
- Integración en *pipelines* de análisis reproducibles: el checkpoint incluye comprobación de integridad de pesos y métricas por época, lo que facilita auditar resultados en publicaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados por un tercero), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 15 de 30) | 85,34 % |
| F1 ponderado (semilla 42, época 15 de 30) | 85,04 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 84,76 % +/- 0,82 |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 84,56 % +/- 0,67 |

Evolución de la accuracy de test en la semilla 42 (selección de época): 70,69 % en la época 1, 80,55 % en la época 5, 85,34 % en la época 15 (seleccionada), 85,79 % en la época 30. La pérdida de validación mínima se alcanza en la época 15 (0,4567).

No se han publicado en la información disponible resultados comparativos con otros backbones de la misma colección ni con modelos externos; el autor remite a las tablas del artículo y al dataset `vision-foundation-models-benchmark-runs` para la comparación completa.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para una imagen de 256x256 px (22 M de parámetros, unos 88 MB de pesos); en fp16 aproximadamente 44 MB de pesos. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequeños. Para lotes grandes, cualquier GPU consumer reciente (RTX 3060 o superior) es suficiente; A100 o H100 solo tendrían sentido para procesar catálogos completos en paralelo.
- Cabe en GPU de consumo: sí, en todas las GPU con al menos 1-2 GB de VRAM libre, incluidas GTX 1650, RTX 3050, RTX 4090, etc.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor`; exportación a ONNX o TorchScript para servir con ONNX Runtime; `torch.compile` para acelerar en GPU. No se documenta soporte de vLLM ni llama.cpp (no aplica a un clasificador de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento se realizó en una sola GPU con batches efectivos de 256 imágenes, lo que sugiere un coste de inferencia bajo, pero el autor no publica cifras de latencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos comparables bajo el mismo protocolo. La colección del autor incluye 40 backbones preentrenados (entre ellos otras variantes de DINOv2 y presumiblemente ResNet, ViT, ConvNeXt y modelos fundacionales de visión), pero sus métricas no se detallan aquí. Comparativa estructural orientativa:

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinov2-small-galaxy10-decals-full-v2 | 22,06 M | Clasificación de morfología galáctica (10 clases) | Imagen 256x256 px | Apache 2.0 | Hugging Face, 19 descargas |
| facebook/dinov2-small (base) | ~22 M | Extracción de características visuales auto-supervisadas | Imagen (resolución variable) | Apache 2.0 (según el modelo base) | Hugging Face |
| Otros backbones de la colección del autor | no disponible | Misma tarea y protocolo | Imagen 256x256 px | no disponible | Hugging Face (colección Vision Foundation Models Benchmark) |

No se han publicado en la información disponible comparaciones numéricas con alternativas; para ello debe consultarse el dataset de ejecuciones del autor o el artículo en revisión.

## Limitaciones y advertencias

- Modelo de dominio muy específico: está entrenado exclusivamente con imágenes de Galaxy10 DECaLS y diez clases morfológicas; no generaliza a otras misiones, bandas fotométricas o taxonomías sin reentrenamiento.
- Riesgo de alucinación en sentido clasificatorio: siempre devuelve una de las diez clases con logits, incluso ante imágenes que no son galaxias o que son ambiguas; es necesario aplicar umbrales de confianza o detección de fuera de distribución.
- Sesgos de dataset: Galaxy10 DECaLS tiene una distribución de clases desbalanceada y sesgos de selección propios del sondeo; el F1 ponderado (85,04 %) es ligeramente inferior a la accuracy (85,34 %), lo que indica cierto desequilibrio en el rendimiento por clase.
- Métricas no verificadas: los resultados del *model-index* están marcados como `verified: false`; proceden del propio autor y no han sido replicados de forma independiente.
- Selección de época por pérdida de validación con solo 1.774 imágenes de validación: la variabilidad entre semillas (desviación típica de 0,82 puntos de accuracy) aconseja no interpretar diferencias menores a un punto porcentual como significativas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; sin embargo, el modelo base DINOv2 y el dataset Galaxy10 DECaLS tienen sus propias condiciones que conviene revisar antes de un despliegue comercial.
- Sin soporte documentado de cuantización: no hay pesos GGUF ni INT8 publicados; el despliegue en fp32 es el único validado por el autor.
- Repositorio con muy poca tracción (19 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- Fecha de creación del repositorio en 2026 y artículo aún en revisión: la citación académica definitiva no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/dinov2-small-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (citación pendiente de publicación; no se proporciona URL)
