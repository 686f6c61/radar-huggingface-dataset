# birder-project/rope_vit_reg8_b14_nps_avg_capi-dino-bio

## Resumen

El modelo `rope_vit_reg8_b14_nps_avg_capi-dino-bio` es un encoder de imágenes basado en Vision Transformer (ViT) con incorporación de posición rotatoria (RoPE), registros (registers) y agrupación promedio (average pooling). Ha sido preentrenado mediante el método CAPI-DINO sobre un conjunto de datos biológicos de aproximadamente 31 millones de imágenes, que incluye fuentes como TreeOfLife-10M-EOL-NaturalImages, iNaturalist 2021, BIOSCAN-5M, IP102 v1.1 e iWildCam 2022, entre otras. El modelo no ha sido ajustado para una tarea de clasificación específica, por lo que se destina a ser utilizado como extractor de características general o como backbone para tareas posteriores como detección de objetos, segmentación o clasificación personalizada.

Desarrollado por el proyecto Birder, un framework de visión por computadora de código abierto orientado al análisis de imágenes de vida silvestre, este modelo destaca por integrar innovaciones arquitectónicas recientes (RoPE y registers) y por estar entrenado específicamente con datos biológicos, lo que lo hace especialmente adecuado para aplicaciones en ecología, conservación y monitoreo de biodiversidad. Con 85,7 millones de parámetros y una entrada de 224×224 píxeles, ofrece un equilibrio entre capacidad y eficiencia computacional, siendo viable para su uso en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con RoPE, registers y average pooling |
| Parametros totales | 85,7 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de 224×224 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de 0,3 GB, probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ViT-B/14 (base con patch de 14×14 píxeles) con tres modificaciones principales: uso de RoPE (Rotary Position Embedding) en lugar de embeddings posicionales aprendidos, incorporación de 8 registros (registers) adicionales como tokens auxiliares para mejorar la calidad de las características, y agrupación promedio (average pooling) de los tokens de salida en lugar de emplear únicamente el token CLS. Estas elecciones están respaldadas por los trabajos "Rotary Position Embedding for Vision Transformer" (arXiv:2403.13298) y "Vision Transformers Need Registers" (arXiv:2309.16588).

El entrenamiento se realizó mediante el método CAPI (Cluster and Predict Latent Patches) combinado con DINO, una técnica de aprendizaje autosupervisado que agrupa parches latentes y predice sus representaciones. El conjunto de datos de preentrenamiento comprende aproximadamente 31 millones de imágenes de origen biológico, incluyendo colecciones de biodiversidad y observaciones de campo. No se ha aplicado ajuste fino supervisado posterior, por lo que el modelo conserva una representación generalista de las imágenes.

## Capacidades

- Extracción de características globales: genera un embedding de 768 dimensiones por imagen, adecuado para tareas de clasificación, recuperación o agrupamiento.
- Extracción de mapas de características para detección: proporciona un tensor de características espaciales de tamaño [1, 768, 16, 16] para una entrada de 224×224, utilizable como backbone en detectores de objetos o segmentadores.
- Backbone para tareas downstream: al no estar fine-tuneado, puede integrarse en arquitecturas personalizadas de clasificación, detección o segmentación.
- Especialización en imágenes biológicas: entrenado con datos de vida silvestre, aves, insectos y ecosistemas, lo que mejora su rendimiento en dominios naturales frente a modelos preentrenados en ImageNet.
- Soporte para inferencia mediante la librería `birder`, que ofrece utilidades de carga, preprocesado y extracción de características.
- Compatible con PyTorch y el ecosistema de Hugging Face, permitiendo su uso en pipelines estándar de visión por computadora.

## Casos de uso

- Clasificación de especies de aves: el modelo puede utilizarse como extractor de características para entrenar un clasificador lineal o un MLP sobre un conjunto de datos etiquetado de especies. Su preentrenamiento en datos biológicos proporciona una base sólida para distinguir especies con alta similitud visual.
- Detección de objetos en cámaras trampa: los mapas de características de 16×16 pueden alimentar cabezales de detección como Faster R-CNN o DETR para localizar animales en imágenes de campo, aprovechando la sensibilidad del modelo a texturas y patrones naturales.
- Segmentación semántica de hábitats: el backbone puede integrarse en arquitecturas tipo U-Net o FPN para segmentar elementos del paisaje (vegetación, agua, suelo) en imágenes aéreas o de satélite, gracias a su capacidad de representar características de bajo y alto nivel.
- Monitorización de biodiversidad: al extraer embeddings de 768 dimensiones, se pueden construir sistemas de recuperación de imágenes por similitud para identificar especies en grandes colecciones de fotografías, facilitando censos automáticos.
- Análisis de salud de cultivos o plagas: aunque entrenado con datos biológicos generales, el modelo puede adaptarse mediante fine-tuning a dominios agrícolas, como la detección de plagas en hojas, partiendo de una representación visual robusta.
- Investigación ecológica: los embeddings generados pueden servir como variables predictoras en modelos de distribución de especies o en estudios de fenotipado, donde se requiere una representación compacta y rica de las imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de precisión en conjuntos de referencia como ImageNet, CIFAR o iNaturalist en su model card.

## Requisitos de hardware

- El modelo tiene 85,7 millones de parámetros, lo que en FP32 ocupa aproximadamente 343 MB y en FP16 unos 172 MB. Por tanto, la VRAM necesaria para inferencia con batch 1 es inferior a 1 GB, incluso considerando activaciones.
- Es compatible con GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, RTX 4090, así como con GPUs de datacenter como A100 o H100.
- Puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con herramientas como TorchServe, ONNX Runtime, o integrarse en frameworks de detección como Detectron2 o MMDetection. También es posible exportarlo a TensorRT para optimización en producción.
- La latencia estimada en una GPU moderna (RTX 3090) para una imagen de 224×224 es del orden de 1-5 ms, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos en la informacion proporcionada. No obstante, a nivel arquitectónico puede compararse con otros ViT-B/14 como:

| Modelo | Parametros | Contexto/Entrada | Innovaciones | Licencia |
|---|---|---|---|---|
| rope_vit_reg8_b14_nps_avg_capi-dino-bio | 85,7 M | 224×224 | RoPE, registers, average pooling, CAPI-DINO | Apache 2.0 |
| ViT-B/16 (original) | 86 M | 224×224 | Embeddings posicionales aprendidos, token CLS | Apache 2.0 (modificado) |
| DeiT-B/16 | 86 M | 224×224 | Distillation token, training data-efficient | Apache 2.0 |
| DINOv2 ViT-B/14 | 86 M | 224×224 | Autosupervisado con DINO, sin registers | Apache 2.0 |

La diferencia principal radica en el uso de RoPE y registers, así como en el dominio de entrenamiento (datos biológicos frente a ImageNet o LVD-142M).

## Limitaciones y advertencias

- El modelo no ha sido fine-tuneado para ninguna tarea específica, por lo que su rendimiento en clasificación directa será limitado; requiere un cabezal de clasificación entrenado posteriormente.
- Los datos de entrenamiento se centran en imágenes biológicas, principalmente aves y vida silvestre. Puede presentar sesgos hacia estas categorías y un rendimiento subóptimo en dominios muy diferentes (por ejemplo, imágenes médicas o industriales).
- Al ser un modelo de visión, no tiene capacidades de generación de texto ni de razonamiento multimodal; no debe utilizarse para tareas que requieran comprensión del lenguaje.
- No se han publicado métricas de sesgo o robustez frente a variaciones de iluminación, oclusión o calidad de imagen.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos de las fuentes de datos originales (iNaturalist, BIOSCAN, etc.) para posibles restricciones de uso de los datos derivados.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un modelo reciente o poco evaluado por la comunidad; se recomienda validar su comportamiento en casos de uso reales antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/birder-project/rope_vit_reg8_b14_nps_avg_capi-dino-bio
- Organización Birder en Hugging Face: https://huggingface.co/birder-project
- Repositorio en GitLab: https://gitlab.com/birder/birder
- Repositorio espejo en GitHub: https://github.com/birder-project/birder
- Documentación: https://birder.gitlab.io/birder/
- Paquete en PyPI: https://pypi.org/project/birder/
- Paper "An Image is Worth 16x16 Words": https://arxiv.org/abs/2010.11929
- Paper "Rotary Position Embedding for Vision Transformer": https://arxiv.org/abs/2403.13298
- Paper "Vision Transformers Need Registers": https://arxiv.org/abs/2309.16588
- Paper "Cluster and Predict Latent Patches for Improved Masked Image Modeling": https://arxiv.org/abs/2502.08769
