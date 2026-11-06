# matthieulel/dinov2-base-imagenet1k-1-layer-galaxy10-decals-full-v2

## Resumen

Este checkpoint es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el autor de Hugging Face matthieulel. Parte del backbone auto-supervisado DINOv2 (variante base con una sola capa, `facebook/dinov2-base-imagenet1k-1-layer`) y se ha adaptado mediante *full fine-tuning* al conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas de galaxias. Forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo resuelve una tarea concreta y acotada: dada una imagen de galaxia procedente del relevamiento DECaLS, predecir su clase morfológica entre diez categorías. No es un modelo generativo ni conversacional, sino un clasificador de imagen puro con una cabeza lineal de diez salidas sobre el encoder DINOv2. Con 86,6 millones de parámetros y un repositorio de 0,3 GB, está pensado para integrarse en pipelines de análisis astronómico y en flujos de etiquetado automático a gran escala.

Su relevancia actual radica en el contexto de los grandes relevamientos astronómicos (LSST/Rubin, Euclid), donde el volumen de imágenes hace inviable la clasificación morfológica manual. Este checkpoint demuestra que un backbone de visión generalista, afinado por completo sobre un dataset astronómico moderado (17.736 imágenes), alcanza un 83,54 % de exactitud en test, lo que lo convierte en una referencia útil para comparar estrategias de adaptación de modelos fundacionales al dominio científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2 base, una capa) con cabeza lineal de clasificación |
| Parametros totales | 86.595.850 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es un Vision Transformer de tipo DINOv2 en su variante base, preentrenado de forma auto-supervisada por Meta y publicado como `facebook/dinov2-base-imagenet1k-1-layer`. Sobre él se añade una única capa lineal con diez salidas, una por clase morfológica. El régimen aplicado es *full fine-tuning*: se actualizan todos los parámetros del encoder, no solo la cabeza, lo que distingue a este checkpoint de las variantes de *linear probing* de la misma colección.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con un split estratificado por clase que reserva 1.774 imágenes para test (el split público de test) y divide el resto en 14.188 de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones de la colección: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y volteo horizontal aleatorio. En evaluación se redimensiona y recorta al centro a 256x256 px y se aplica la normalización del procesador de imágenes del checkpoint.

La selección del checkpoint se hizo por mínima pérdida de validación, que corresponde a la época 6 de 30; las métricas de esa época son las reportadas. El autor incluye además una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden con los logits guardados en el 100 % de los casos (diferencia absoluta máxima de 1,91e-06). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en diez clases morfológicas del esquema Galaxy10 DECaLS.
- Extracción de representaciones visuales de alta calidad gracias al backbone DINOv2 preentrenado de forma auto-supervisada.
- Adaptación completa al dominio astronómico: todos los parámetros del encoder están ajustados a imágenes de galaxias, no solo la cabeza.
- Inferencia determinista de imagen a etiqueta: una imagen de entrada produce un vector de diez logits.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni diálogo.
- No dispone de capacidades multilingües (no procesa lenguaje).
- No incorpora visión generativa, audio ni modo de pensamiento (*thinking mode*).
- Integración estándar con la API de `transformers` (`AutoModelForImageClassification` y `AutoImageProcessor`).

## Casos de uso

- Clasificación morfológica automatizada en pipelines de reducción de datos: el modelo recibe recortes de galaxias procedentes de DECaLS y devuelve una de las diez clases, lo que permite procesar lotes de miles de imágenes sin intervención humana y con una exactitud de referencia del 83,54 % en test.
- Etiquetado previo para entrenamiento de modelos mayores: las predicciones del checkpoint pueden usarse como pseudoetiquetas o como filtro inicial para seleccionar candidatas que luego revisen astrónomos, reduciendo el coste de anotación manual.
- Estudio comparativo de adaptación de modelos fundacionales: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve como punto de referencia para medir la diferencia entre *full fine-tuning* y *linear probing* sobre el mismo backbone y dataset.
- Docencia y divulgación en astronomía computacional: el modelo es pequeño (0,3 GB) y se carga con pocas líneas de `transformers`, lo que facilita demostraciones reproducibles de clasificación morfológica en cursos y talleres.
- Control de calidad de catálogos existentes: ejecutar el clasificador sobre galaxias ya etiquetadas y revisar las discrepancias permite detectar errores de clasificación o casos ambiguos en catálogos previos.
- Prototipado rápido de nuevas taxonomías: al ser un clasificador de imagen estándar, la misma receta (full fine-tuning sobre DINOv2 base con cabeza lineal) puede replicarse sobre otros esquemas de clases o subconjuntos de DECaLS para validar una taxonomía antes de escalar.
- Integración en servicios de inferencia de imágenes: el checkpoint es compatible con *endpoints* de Hugging Face y con despliegues estándar de `transformers`, lo que permite exponerlo como API de clasificación para equipos de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época seleccionada 6 de 30) | 83,54 % |
| Weighted F1 (seed 42, época seleccionada 6 de 30) | 83,33 % |
| Accuracy media +/- desviación típica (seeds 42, 1, 2) | 84,80 % +/- 1,24 |
| Weighted F1 medio +/- desviación típica (seeds 42, 1, 2) | 84,56 % +/- 1,21 |

La *model card* incluye además las métricas por época de la seed 42. La mejor exactitud de test observada en esa traza es del 86,70 % en la época 29, pero el checkpoint publicado corresponde a la época 6, seleccionada por mínima pérdida de validación (0,4807). No se han publicado en la información disponible resultados comparativos frente a otros backbones de la misma colección ni frente a modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,35 GB solo para los pesos (86,6 M de parámetros x 4 bytes), más el *overhead* de activaciones y del framework; en la práctica, menos de 1 GB en fp32 y menos de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; una RTX 4090, A100 o H100 no son necesarias y solo aportan throughput.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060 y superiores; también en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` con `AutoModelForImageClassification` es la vía documentada por el autor; al ser un ViT estándar, también es compatible con `torch.compile`, ONNX Runtime y TensorRT para optimización. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica que el entrenamiento se ejecutó en una única GPU en fp32 con TF32 desactivado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones de la misma colección ni de clasificadores alternativos sobre Galaxy10 DECaLS, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia |
|---|---|---|---|---|
| Este checkpoint (DINOv2 base + cabeza lineal) | 86,6 M | imagen 256x256 px | Clasificación de 10 clases de galaxias | apache-2.0 |
| `facebook/dinov2-base-imagenet1k-1-layer` (backbone base) | no disponible en la información | imagen | Extracción de características visuales generales | no disponible en la información |
| Otras configuraciones de la colección *Vision Foundation Models Benchmark* | no disponible en la información | imagen | Clasificación de galaxias | no disponible en la información |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en morfología de galaxias del esquema Galaxy10 DECaLS; no es un clasificador astronómico general ni un modelo de visión de propósito general.
- La exactitud reportada (83,54 % en la época publicada) es inferior a la mejor exactitud observada durante el entrenamiento (86,70 % en la época 29); la selección por pérdida de validación prioriza calibración sobre exactitud máxima.
- Existe una variabilidad entre semillas de aproximadamente 1,24 puntos de exactitud, por lo que el rendimiento real puede desviarse del valor puntual reportado.
- Los resultados no están verificados de forma independiente: la métrica `verified` del *model-index* es `false`.
- Riesgo de sesgo de clase y de dominio: el dataset Galaxy10 DECaLS tiene una distribución morfológica concreta y las imágenes proceden de un único relevamiento; el rendimiento puede degradarse en imágenes de otros instrumentos, profundidades o resoluciones.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de clasificaciones erróneas con alta confianza en galaxias ambiguas, interactuantes o de morfología atípica.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no procesa lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El artículo asociado está en revisión en *Astronomy and Computing*; la cita definitiva aún no está disponible.
- El checkpoint se publicó con fecha de creación del 30 de octubre de 2026 y cuenta con 18 descargas y 0 *likes*, por lo que su validación por la comunidad es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/dinov2-base-imagenet1k-1-layer-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/dinov2-base-imagenet1k-1-layer
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección *Vision Foundation Models Benchmark*: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026): referencia citada en la *model card*, sin enlace directo disponible en la información proporcionada.
