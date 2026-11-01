# matthieulel/vit-large-patch16-224-in21k-galaxy10-decals-full-v2

## Resumen

`vit-large-patch16-224-in21k-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel`. Se trata de un Vision Transformer (ViT-Large) preentrenado por Google en ImageNet-21k (`google/vit-large-patch16-224-in21k`) y afinado completamente sobre el conjunto Galaxy10 DECaLS, que agrupa imágenes astronómicas del Dark Energy Camera Legacy Survey en diez clases morfológicas.

El modelo resuelve una tarea acotada pero relevante en astronomía observacional: asignar una clase morfológica a una imagen de galaxia de 224x224 píxeles. Forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descritas en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que lo convierte en un punto de referencia reproducible para comparar modelos fundacionales de visión en datos astronómicos.

Con 303,3 millones de parámetros, licencia Apache 2.0 y pesos en safetensors, es un modelo compacto, fácil de desplegar en una sola GPU y con un protocolo de entrenamiento documentado con detalle inusual (semillas, épocas, receta de optimización e índices de partición de datos), lo que facilita su reproducción y auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 16, resolución 224) |
| Parámetros totales | 303.311.882 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px en 16x16 parches) |
| Tipos de cuantización | no especificados por el autor; al ser safetensors fp32, admite cuantización estándar de transformers (fp16, bf16, int8) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |
| Tarea | image-classification (10 clases) |
| Modelo base | google/vit-large-patch16-224-in21k |
| Dataset de ajuste | matthieulel/galaxy10_decals |
| Régimen de ajuste | full fine-tuning (todos los parámetros actualizados) |
| Cabeza de clasificación | una capa lineal con 10 salidas |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo ViT-Large con parches de 16x16 píxeles y resolución de entrada de 224x224, heredado del checkpoint `google/vit-large-patch16-224-in21k`. Sobre el encoder se añade una única capa lineal de diez salidas que corresponde a las diez clases morfológicas de Galaxy10 DECaLS. No hay innovaciones arquitectónicas propias: el interés del checkpoint reside en el protocolo de ajuste y en la evaluación controlada, no en el diseño del modelo.

El entrenamiento se realizó por full fine-tuning sobre Galaxy10 DECaLS (17.736 imágenes en total). La partición pública de test (1.774 imágenes) se reservó como conjunto de test held-out; la partición pública de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta es idéntica para los 40 backbones de la colección: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, scheduler lineal con 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y volteo horizontal aleatorio; en evaluación se aplica resize y center crop a 224x224 con la normalización del image processor del checkpoint. El checkpoint publicado corresponde a la época 9 de 30, seleccionada por mínima pérdida de validación, con semilla 42. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en diez clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales genéricas mediante el backbone ViT-Large preentrenado en ImageNet-21k, reutilizable para otras tareas astronómicas con ajuste adicional.
- Inferencia determinista y reproducible: el autor verificó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100% con los logits guardados (diferencia absoluta máxima de 3,81e-06).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje: es un clasificador puro, no un modelo generativo.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo asigna una de las diez clases a recortes de 224x224 px de imágenes DECaLS, lo que permite procesar catálogos de galaxias de forma masiva sin intervención humana y con una accuracy de referencia del 84,05% en el test held-out.
- Etiquetado asistido para proyectos de ciencia ciudadana: las predicciones pueden priorizar qué imágenes revisar manualmente, reduciendo el coste de anotación en campañas tipo Galaxy Zoo, ya que el modelo ofrece una clase concreta y una distribución de logits sobre la que aplicar umbrales de confianza.
- Filtrado y control de calidad de datasets: al ser un clasificador ligero (303 M de parámetros, 1,2 GB de pesos), puede ejecutarse sobre lotes grandes para detectar imágenes mal etiquetadas o fuera de distribución antes de entrenar modelos mayores.
- Línea base reproducible en investigación: con semillas, épocas y particiones documentadas, sirve como referencia contra la que comparar nuevos backbones o estrategias de adaptación (linear probing frente a full fine-tuning) en el benchmark del artículo.
- Búsqueda y recuperación por morfología: los embeddings del backbone ViT-Large pueden indexarse para búsqueda por similitud visual de galaxias con morfologías raras, usando el clasificador como filtro previo.
- Despliegue en infraestructura modesta: cabe en una GPU de consumo con fp16 o bf16, lo que permite ejecutar la clasificación en estaciones de trabajo de observatorios o en nodos edge sin depender de clústeres de gran escala.
- Docencia y prototipado: la receta completa y el código de uso en la model card permiten reproducir el ajuste en una sola GPU en horas, útil para cursos de aprendizaje profundo aplicado a astronomía.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el test held-out de Galaxy10 DECaLS con 1.774 imágenes:

| Métrica | Valor (semilla 42, época 9) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 84,05 | 83,97 ± 0,62 |
| Weighted F1 (%) | 83,76 | 83,72 ± 0,68 |

Evolución de las métricas de test en la semilla 42 (selección de época por mínima pérdida de validación):

| Época | Pérdida val. | Accuracy val. (%) | Accuracy test (%) | Weighted F1 test (%) |
|---|---|---|---|---|
| 1 | 0,8403 | 72,89 | 73,62 | 71,64 |
| 5 | 0,5330 | 82,64 | 83,43 | 83,02 |
| 9 (seleccionada) | 0,4759 | 84,44 | 84,05 | 83,76 |
| 14 | 0,5263 | 84,61 | 84,84 | 84,65 |
| 21 | 0,5960 | 85,40 | 85,06 | 84,79 |
| 30 | 0,6346 | 85,40 | 84,61 | 84,42 |

No se han publicado en la información disponible resultados comparativos con otros backbones del mismo benchmark ni con modelos específicos de astronomía; el autor remite a las tablas del artículo y al dataset `vision-foundation-models-benchmark-runs` para las 80 configuraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 (tamaño de los pesos), en torno a 0,6 GB en fp16 o bf16; con batch pequeño y activaciones, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque el modelo está claramente sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más, incluidas las integradas de portátiles recientes con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX Runtime, TorchScript o TensorRT para inferencia de baja latencia; también es viable servirlo con Text Generation Inference no aplica (no es generativo) y con frameworks de serving de visión como Triton o BentoML.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (303 M de parámetros, 224x224 px) se espera un throughput alto en GPU moderna, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ViT-Large full fine-tuning) | 303,3 M | 224x224 px | 84,05% accuracy, 83,76% weighted F1 (test) | Apache 2.0 | HuggingFace, transformers |
| `google/vit-large-patch16-224-in21k` (base sin ajustar) | 303,3 M | 224x224 px | no disponible en la información | Apache 2.0 | HuggingFace, transformers |
| Otras configuraciones del mismo benchmark (40 backbones x 2 regímenes) | variable | 224x224 px | no disponible en la información | variable | colección Vision Foundation Models Benchmark |
| Modelos específicos de morfología galáctica (p. ej. Zoobot, Galaxy Zoo) | no disponible | no disponible | no disponible en la información | no disponible | no disponible |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas; la comparación más directa posible es contra el backbone base sin ajustar y contra las demás configuraciones del mismo benchmark, cuyos resultados están en el dataset de runs del autor.

## Limitaciones y advertencias

- Modelo de clasificación cerrado a diez clases: no genera texto, no razona y no responde a instrucciones; cualquier uso fuera de la clasificación morfológica requiere reentrenar la cabeza o el modelo completo.
- Dominio muy restringido: entrenado exclusivamente con imágenes DECaLS de Galaxy10; el rendimiento puede degradarse en imágenes de otros surveys, otras resoluciones o distintas condiciones de ruido y seeing.
- Riesgo de sesgo de clase: la accuracy global del 84% puede ocultar clases minoritarias con peor recall; el weighted F1 (83,76%) sugiere cierto desequilibrio, pero no se publican métricas por clase.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí de sobreconfianza: el modelo siempre asigna una de las diez clases, incluso ante imágenes fuera de distribución.
- Selección de época por pérdida de validación: la época 9 elegida no es la de mejor accuracy en test (la 14 y la 21 obtienen valores superiores), lo que refleja una selección honesta pero no óptima para el test; usar el checkpoint con cautela si se busca el máximo rendimiento bruto.
- Métricas no verificadas de forma independiente: el campo `verified` es `false` en el model-index y los resultados proceden del propio autor.
- Reproducibilidad dependiente del software: la receta fija versiones concretas (PyTorch 2.3.0, transformers 4.37.2); cambios de versión pueden alterar ligeramente los resultados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas; aun así, conviene citar el artículo cuando se publique.
- Sin datos de idioma ni de sesgos demográficos: al operar solo sobre imágenes astronómicas, los sesgos relevantes son de dominio y de clase, no sociales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-large-patch16-224-in21k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-large-patch16-224-in21k
- Dataset de ajuste: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace)
