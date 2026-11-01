# matthieulel/dinov2-base-imagenet1k-1-layer-galaxy10-decals-head-v2

## Resumen

Este repositorio contiene un clasificador de morfología galáctica obtenido mediante ajuste fino únicamente de la cabeza de clasificación sobre el backbone congelado `facebook/dinov2-base-imagenet1k-1-layer`. El modelo resuelve una tarea concreta de astronomía observacional: asignar una de diez clases morfológicas a imágenes de galaxias del conjunto Galaxy10 DECaLS. Lo desarrolla el usuario de HuggingFace `matthieulel` como parte de una colección comparativa más amplia, el *Vision Foundation Models Benchmark*, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación (cabeza lineal y ajuste completo) siguiendo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo es un transformer de visión ViT-B/14 (DINOv2 base) con un cabezal lineal de 10 salidas. Cuenta con 86.595.850 parámetros totales, de los cuales la inmensa mayoría pertenecen al backbone congelado; el cabezal entrenado es una única capa lineal. El repositorio pesa 0,3 GB y se distribuye en safetensors bajo licencia Apache 2.0. No es un modelo generativo ni conversacional: es un clasificador de imágenes especializado, con una precisión del 62,40 % en el conjunto de test reservado de Galaxy10 DECaLS.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible de hasta dónde llega una adaptación lineal barata sobre un backbone de propósito general en un dominio científico con pocos datos etiquetados, y permite comparar ese régimen con alternativas de ajuste completo dentro del mismo benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) DINOv2 base, parche 14, con cabezal lineal de clasificación |
| Parametros totales | 86.595.850 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; pesos en safetensors fp32) |
| Idiomas soportados | no disponible (modelo de visión sin componente textual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un ViT base de DINOv2 con parches de 14 píxeles, preentrenado por Meta (Facebook) mediante destilación autosupervisada sobre un corpus de imágenes naturales a gran escala. Sobre ese backbone se entrena exclusivamente una capa lineal de diez salidas; el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización. El modelo final almacena tanto los pesos originales del backbone como el cabezal entrenado.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes): el split público de test (1.774 imágenes) se reserva como test held-out, y el split público de train se estratifica por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar la época. La receta, idéntica para los 40 backbones del benchmark, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación consiste en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 256x256 px y se aplica la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 28 de 30). El software utilizado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. No se reporta decodificación especulativa, atención lineal ni otras innovaciones de inferencia: la innovación del trabajo es el protocolo comparativo y el régimen de adaptación.

## Capacidades

- Clasificación de imágenes de galaxias en diez clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales de propósito general mediante el backbone DINOv2 congelado (reutilizable para otras tareas de visión por transferencia lineal).
- Inferencia determinista y verificada: el autor comprobó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados de la época seleccionada (diferencia absoluta máxima de logit 1,43e-06).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación morfológica automatizada de catálogos de galaxias: el modelo asigna una de diez clases a cada recorte de imagen, adecuado para preclasificar grandes volúmenes de observaciones antes de la inspección humana.
- Referencia base en estudios de transferencia: al ser una adaptación lineal sobre un backbone congelado, sirve como línea de base barata contra la que medir métodos de ajuste completo o fine-tuning parcial en el mismo dataset.
- Filtrado y priorización en pipelines de observación: permite separar morfologías de interés (por ejemplo, espirales frente a elípticas) para dirigir recursos de análisis o seguimiento.
- Validación cruzada de etiquetados: sus predicciones sobre el test held-out pueden usarse para detectar discrepancias sistemáticas en anotaciones manuales de morfología.
- Prototipado rápido en dominios astronómicos: al congelar el backbone y entrenar solo una capa lineal, el coste de adaptación a una nueva taxonomía de clases es mínimo (una GPU, 30 épocas), lo que facilita experimentos exploratorios.
- Extracción de embeddings para búsqueda por similitud: el backbone DINOv2 congelado puede emplearse para indexar imágenes de galaxias y recuperar objetos visualmente parecidos, aunque esta capacidad no se evalúa en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre el test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Semilla 42 (epoca 28) | Media +/- desv. tip. (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 62,40 | 62,27 +/- 0,23 |
| F1 ponderado (%) | 60,98 | 60,72 +/- 0,30 |

Evolución relevante por época (semilla 42): la accuracy de test pasa de 13,30 % en la época 1 a 55,19 % en la época 6, 61,50 % en la época 16 y 62,40 % en la época 28 seleccionada; la mejor marca de test se alcanza en la época 25 (62,68 %), ligeramente por encima de la época seleccionada por pérdida de validación. No se han publicado en la información disponible resultados comparativos frente a otros backbones del mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86,6 M de parámetros en fp32 (unos 346 MB de pesos) la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; una RTX 4090, A100 o H100 son sobredimensionadas para este clasificador, aunque el autor usó una única GPU para el entrenamiento sin especificar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (e incluso en hardware integrado con suficiente memoria), dado el tamaño del modelo y la entrada de 256x256 px.
- Opciones de despliegue: transformers con `AutoModelForImageClassification` y `AutoImageProcessor` (vía documentada por el autor); despliegue adicional mediante vLLM, llama.cpp, Ollama o TGI no está documentado ni es el cauce natural para un clasificador de visión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (DINOv2 base, cabeza lineal) | 86.595.850 | Imagen 256x256 px | 62,40 % accuracy; 60,98 % F1 ponderado (test) | apache-2.0 | HuggingFace, safetensors |
| Backbone base `facebook/dinov2-base-imagenet1k-1-layer` | no disponible en la información | Imagen (resolución nativa 518 px en DINOv2) | No evaluado como clasificador en esta ficha | no disponible en la información | HuggingFace |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | No publicado en la información disponible | no disponible | Colección de HuggingFace del autor |

No se dispone de datos de rendimiento de modelos alternativos sobre Galaxy10 DECaLS en la información proporcionada, por lo que la comparativa cuantitativa queda limitada a este checkpoint.

## Limitaciones y advertencias

- Precisión moderada: un 62,40 % de accuracy sobre diez clases implica una tasa de error significativa; no es adecuado como clasificador autónomo sin revisión en contextos científicos críticos.
- Sesgos de dominio: el backbone se preentrenó con imágenes naturales, no astronómicas; la adaptación lineal no corrige posibles desajustes de distribución respecto a datos de observación reales.
- Riesgo de sobreajuste al split: la época se selecciona por pérdida de validación y el test es un split público fijo; la varianza entre semillas es baja (+/- 0,23 puntos de accuracy), pero no se reportan evaluaciones en otros conjuntos.
- Limitación de idioma y modalidad: no procesa texto ni audio; solo imágenes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del backbone base y del dataset Galaxy10 DECaLS por separado antes de un despliegue en producción.
- Caveat de producción: los resultados son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index); el artículo asociado está en revisión y la cita aún no está completa.
- Sin variantes cuantizadas publicadas: el despliegue en entornos con restricciones de memoria exigiría cuantizar el modelo por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/dinov2-base-imagenet1k-1-layer-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/dinov2-base-imagenet1k-1-layer
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026): referencia citada en la model card, sin enlace directo disponible en la información proporcionada.
