# foggy9/trendyol-dino-v2.1-ecommerce-256d

## Resumen

El modelo `foggy9/trendyol-dino-v2.1-ecommerce-256d` es un sistema de extracción de características visuales (feature extraction) diseñado para recuperación de imágenes de productos en entornos de e-commerce. Se trata de un fine-tune de DinoV2 (ViT-B/14) al que se le ha añadido una capa de pooling GeM (Generalized Mean) y una proyección lineal de 768 a 256 dimensiones, entrenada con ArcFace. El desarrollo original corresponde al equipo de ciencia de datos de Trendyol, aunque el repositorio analizado está publicado por el usuario `foggy9` en HuggingFace.

Este modelo resuelve el problema de la búsqueda visual y la detección de duplicados en catálogos de productos, generando embeddings de 256 dimensiones que permiten comparar imágenes mediante distancia coseno. Su relevancia actual radica en que es una evolución de la versión anterior (`trendyol-dino-v2-ecommerce-256d`), con mejoras en el pooling (GeM en lugar de flatten de tokens espaciales) y un entrenamiento más exhaustivo: 1000 productos distintos por cada una de las ~3400 categorías. Con 86,7 millones de parámetros y una entrada de 224×224 píxeles, es un modelo ligero que puede desplegarse en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DinoV2 ViT-B/14 + GeM pooling + proyección lineal (768→256), entrenado con ArcFace |
| Parametros totales | 86.778.112 (86,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (documentación); el modelo procesa imágenes de productos |
| Licencia | CC BY-SA 4.0 (según HuggingFace); el README indica términos source-available con atribución y notificación previa para uso comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un backbone DinoV2 ViT-B/14, que procesa imágenes de 224×224 píxeles. En lugar de aplanar los tokens espaciales y proyectarlos directamente (como hacía la versión v2), se aplica un pooling GeM (Generalized Mean) sobre los mapas de características, seguido de una capa lineal que reduce la dimensionalidad de 768 a 256. Esta proyección se entrena con una función de pérdida ArcFace, lo que favorece la separación entre clases y la compactación de los embeddings dentro de cada categoría.

Los datos de entrenamiento consisten en imágenes de productos de e-commerce, con 1000 productos distintos por cada una de las ~3400 categorías. El preprocesamiento es específico: se redimensiona la imagen para que el lado mayor sea 224, se rellena con píxeles blancos hasta hacerla cuadrada y se aplica la normalización estándar de ImageNet (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]). No se ha realizado RLHF ni DPO; es un modelo puramente de visión.

## Capacidades

- Extracción de embeddings de 256 dimensiones para imágenes de productos, listos para comparación por similitud.
- Recuperación de imágenes por consulta visual (image-to-image retrieval) mediante distancia coseno o producto escalar.
- Detección de duplicados y productos casi idénticos en un catálogo.
- Generación de representaciones compactas que pueden indexarse en bases de datos vectoriales (FAISS, Milvus, etc.).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes.
- No incluye cabezas de clasificación; el modelo exporta únicamente los embeddings.

## Casos de uso

- Búsqueda visual en e-commerce: el usuario sube una foto de un producto y el sistema genera su embedding, que se consulta en un índice vectorial para devolver los artículos más similares del catálogo. El modelo es adecuado porque está entrenado específicamente con imágenes de productos y produce embeddings de baja dimensionalidad (256) que aceleran la búsqueda.
- Detección de duplicados en catálogos: al recibir nuevas imágenes de productos, se calculan sus embeddings y se comparan con los existentes mediante un umbral de similitud. Esto permite bloquear publicaciones duplicadas o fusionar fichas redundantes.
- Recomendaciones de productos similares: en la página de detalle de un producto, se calculan los vecinos más cercanos en el espacio de embeddings para mostrar un bloque de "artículos similares". La proyección ArcFace mejora la relevancia de estas recomendaciones.
- Organización automática de catálogo: se agrupan las imágenes por similitud para asignar categorías o subcategorías de forma semiautomática, reduciendo el trabajo manual de clasificación.
- Moderación de contenido: comparando los embeddings de imágenes nuevas con embeddings de referencia de categorías permitidas, se pueden detectar productos fuera de categoría o imágenes inapropiadas.
- Análisis de competencia: se comparan imágenes de productos de la competencia con el catálogo propio para identificar equivalentes y ajustar precios, descripciones o estrategias de marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 350 MB, y en FP16 unos 175 MB. Cualquier GPU con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: RTX 3060 (12 GB) o superior para uso en producción; también A100 o H100 para procesamiento de grandes volúmenes de imágenes.
- Sí cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime, TorchServe o FastAPI combinado con un índice vectorial (FAISS, Milvus). No se recomienda vLLM, orientado a modelos de lenguaje.
- Latencia y throughput: no disponible; en GPU, la extracción de embeddings suele ser del orden de milisegundos por imagen, aunque no se han proporcionado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| foggy9/trendyol-dino-v2.1-ecommerce-256d | 86,7 M | Imagen 224×224 | CC BY-SA 4.0 (según HF) | HuggingFace |
| Trendyol/trendyol-dino-v2-ecommerce-256d (v2) | 86,7 M (aprox.) | Imagen 224×224 | Source-available | HuggingFace |
| CLIP ViT-B/32 (OpenCLIP) | 151 M | Imagen y texto | No disponible | OpenCLIP |
| DinoV2 ViT-B/14 (base) | 86,7 M | Imagen 224×224 | No disponible | HuggingFace |

El modelo analizado se diferencia de la versión v2 de Trendyol en el tipo de pooling (GeM frente a flatten de tokens espaciales) y en la cantidad de productos por categoría usados en el entrenamiento (1000 frente a 300). Frente a CLIP ViT-B/32, que está pensado para alinear imágenes y texto, este modelo está especializado en recuperación visual de productos y produce embeddings de menor dimensionalidad (256 frente a 512), lo que reduce el coste de almacenamiento y búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: los datos de entrenamiento provienen de catálogos de e-commerce, probablemente con sesgo hacia productos de Trendyol y mercados turcos u occidentales; puede no generalizar bien a otros dominios o regiones.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir falsos positivos en similitud, es decir, imágenes diferentes con embeddings cercanos.
- Limitaciones de contexto o idioma: el modelo no procesa texto, solo imágenes de 224×224; no soporta resoluciones mayores sin reescalado previo.
- Restricciones de licencia: aunque en HuggingFace figura como CC BY-SA 4.0, el README del autor indica que el uso comercial requiere atribución y notificación previa a Trendyol (`scr.datascience@trendyol.com`). Esto puede ser una restricción relevante para producción.
- Requiere `trust_remote_code=True` porque incluye código personalizado (custom code) en el repositorio.
- Los heads de clasificación del entrenamiento no están incluidos; solo se exportan los embeddings, lo que limita su uso a tareas de recuperación y no a clasificación directa.

## Enlaces

- https://huggingface.co/foggy9/trendyol-dino-v2.1-ecommerce-256d
- https://huggingface.co/Trendyol/trendyol-dino-v2.1-ecommerce-256d
- https://huggingface.co/Trendyol/trendyol-dino-v2-ecommerce-256d
- https://arxiv.org/abs/1711.02512
