# JONNYVERSE/dinov2-small

## Resumen

JONNYVERSE/dinov2-small es una conversión a formato ONNX del modelo DINOv2-small desarrollado por Meta AI Research (FAIR). El objetivo de este repositorio es ofrecer los pesos del modelo original `facebook/dinov2-small` en un formato compatible con la librería Transformers.js, permitiendo ejecutar extracción de características de imagen directamente en el navegador o en entornos Node.js mediante JavaScript. El modelo original es un Vision Transformer (ViT) de 22 millones de parámetros entrenado con aprendizaje auto-supervisado, que produce embeddings visuales robustos sin necesidad de etiquetas. Esta conversión facilita el despliegue de sistemas de búsqueda, similitud y clustering de imágenes en aplicaciones web y de escritorio, aprovechando la portabilidad de ONNX.

El repositorio tiene un tamaño de 0,3 GB y está diseñado específicamente para el pipeline `image-feature-extraction`. Aunque la información disponible en la model card es mínima, se sabe que los pesos se generaron a partir del modelo base de Facebook y que la conversión sigue las recomendaciones de Hugging Face para hacer modelos compatibles con Transformers.js. Es una opción práctica para desarrolladores que necesitan integrar capacidades de visión por computador en aplicaciones JavaScript sin depender de servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con entrenamiento DINOv2 |
| Parametros totales | 22 millones (aprox., del modelo original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 518x518 píxeles (37x37 parches de 14x14, 1369 tokens) |
| Tipos de cuantizacion | no disponible (pesos ONNX, presumiblemente FP32 o FP16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible en el repo (el modelo original usa Apache 2.0) |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo original DINOv2-small es un Vision Transformer (ViT) de 22 millones de parámetros, entrenado mediante auto-supervisión con el método DINOv2. Esta técnica combina varias estrategias de aprendizaje auto-supervisado, como iBOT, SwAV y DINO, para aprender representaciones visuales transferibles sin necesidad de etiquetas humanas. El entrenamiento se realizó sobre un dataset de 142 millones de imágenes (LVD-142M), sin anotaciones, utilizando una pérdida que combina objetivos de parche y de imagen global. El modelo produce tanto tokens de parche como un token de clase (CLS) que puede usarse como embedding global de la imagen.

En esta conversión ONNX, la arquitectura se mantiene idéntica, pero los pesos se exportaron al formato ONNX para ser ejecutados con Transformers.js. No se han aplicado modificaciones arquitectónicas ni técnicas de cuantización específicas documentadas. La conversión sigue el procedimiento estándar de Hugging Face con la librería Optimum, que garantiza la compatibilidad con el runtime de ONNX Web.

## Capacidades

- Extracción de características de imagen: genera embeddings vectoriales de alta dimensionalidad (384 dimensiones para DINOv2-small) que representan el contenido visual de la imagen.
- Similitud visual: los embeddings pueden compararse mediante métricas como coseno o distancia euclidiana para encontrar imágenes similares.
- Clustering y organización: permite agrupar imágenes por similitud sin necesidad de etiquetas previas.
- Fine-tuning posterior: aunque el repo ofrece pesos congelados, los embeddings pueden usarse como entrada para cabeceras de clasificación o regresión.
- Compatibilidad con Transformers.js: se puede ejecutar en navegador o Node.js sin servidor dedicado.
- Procesamiento de imágenes de alta resolución: acepta entradas de hasta 518x518 píxeles, lo que permite capturar detalles finos.

## Casos de uso

- Búsqueda visual en aplicaciones web: un sistema de e-commerce puede usar los embeddings para permitir al usuario buscar productos subiendo una foto. El modelo se ejecuta en el cliente con Transformers.js, reduciendo latencia y costes de servidor.
- Moderación de contenido automática: clasificar imágenes en categorías (violencia, desnudos, etc.) mediante similitud con un conjunto de referencia etiquetado, sin necesidad de un clasificador entrenado específicamente.
- Organización de bibliotecas fotográficas: una aplicación de gestión de fotos puede agrupar imágenes duplicadas o similares automáticamente usando los embeddings y clustering.
- Sistemas de recomendación visual: recomendar productos, películas o contenido basado en la similitud de imágenes que el usuario ha visto o subido.
- Análisis de imágenes médicas: extraer características de radiografías o tomografías para buscar casos similares en un historial clínico (siempre con supervisión experta).
- Generación de datasets para aprendizaje automático: los embeddings pueden usarse para preprocesar imágenes y entrenar modelos más ligeros en tareas específicas, reduciendo el coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original DINOv2-small reporta en su paper un 82,0% de precisión top-1 en ImageNet-1k tras fine-tuning, pero estos datos no están confirmados en este repositorio de conversión. Para obtener métricas fiables, se recomienda consultar la documentación oficial de DINOv2 o ejecutar evaluaciones propias.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 22 millones de parámetros, lo que ocupa aproximadamente 88 MB en FP32, 44 MB en FP16 y 22 MB en INT8. La VRAM necesaria dependerá del tamaño del batch y de la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en batch pequeño. En CPU, un procesador moderno puede ejecutar el modelo en menos de 100 ms por imagen.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo (RTX 2060, GTX 1650, etc.) y también en CPUs sin GPU.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime Web, o cualquier runtime ONNX (Python, C++, etc.).
- Latencia estimada: en CPU (i7-12700K) se espera entre 50-100 ms por imagen a 518x518; en GPU (RTX 3090) menos de 10 ms. Estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Dimension del embedding | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/dinov2-small (ONNX) | 22M | 518x518 | 384 | no disponible (original Apache 2.0) | ONNX |
| facebook/dinov2-small (original) | 22M | 518x518 | 384 | Apache 2.0 | PyTorch |
| zeromodels/dinov2-small (Keras) | 22M | 518x518 | 384 | Apache 2.0 | Keras |
| CLIP ViT-B/32 | 86M | 224x224 | 512 | MIT | PyTorch |

La comparativa se basa en el modelo original de Facebook y en otras conversiones. La diferencia principal es el formato de pesos y la facilidad de integración en entornos JavaScript. CLIP ofrece además embeddings de texto, pero con mayor coste computacional.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado con imágenes de internet, por lo que puede reflejar sesgos culturales y demográficos presentes en los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo de visión, no genera texto, pero los embeddings pueden no capturar correctamente conceptos abstractos o ambiguos.
- Limitaciones de contexto: solo procesa imágenes, no tiene capacidades de lenguaje ni de audio.
- Restricciones de licencia: el repositorio no especifica licencia, aunque el modelo original usa Apache 2.0. Se recomienda verificar antes de usar en producción.
- Compatibilidad: la conversión ONNX puede tener ligeras diferencias numéricas respecto al modelo original en PyTorch, aunque suelen ser despreciables.
- Dependencia de Transformers.js: para usar en navegador, se necesita la librería y el runtime ONNX, lo que añade complejidad de instalación.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/JONNYVERSE/dinov2-small
- Modelo original: https://huggingface.co/facebook/dinov2-small
- GitHub oficial de DINOv2: https://github.com/facebookresearch/dinov2
- Paper DINOv2: https://arxiv.org/abs/2304.07193
- Paper Vision Transformers Need Registers: https://arxiv.org/abs/2309.16588
- Blog de DINOv2: https://ai.meta.com/blog/dino-v2-computer-vision-self-supervised-learning/
- Demo oficial: https://dinov2.metademolab.com/
