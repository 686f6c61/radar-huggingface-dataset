# MikeCoin2/vit_base_patch16_224.augreg_in21k

## Resumen

El modelo `vit_base_patch16_224.augreg_in21k` es un Vision Transformer (ViT) de tamaño base diseñado para clasificación de imágenes y extracción de características. Fue entrenado por los autores del paper "How to train your ViT? Data, Augmentation, and Regularization in Vision Transformers" (Steiner et al., 2021) en JAX, y posteriormente portado a PyTorch por Ross Wightman para la librería `timm`. El modelo procesa imágenes de 224x224 píxeles dividiéndolas en parches de 16x16, y cuenta con 102,6 millones de parámetros.

Este modelo es relevante porque representa una de las variantes más utilizadas de ViT como backbone para tareas de visión por computador, gracias a su entrenamiento con técnicas de aumentación y regularización (AugReg) sobre el dataset ImageNet-21k, que incluye 14 millones de imágenes y 21.000 clases. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su integración en `timm` facilita su uso tanto para clasificación directa como para transfer learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base) con parches de 16x16 |
| Parametros totales | 102.595.923 (102,6 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (procesa imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ViT original propuesta en "An Image is Worth 16x16 Words" (Dosovitskiy et al., 2021): una imagen de 224x224 se divide en 196 parches de 16x16 píxeles, cada uno se proyecta linealmente a un embedding de 768 dimensiones, y se procesa mediante un transformer estándar con 12 capas, 12 cabezas de atención y una dimensión oculta de 3072. Incluye un token especial de clasificación (CLS) y embeddings posicionales aprendidos.

El entrenamiento se realizó sobre ImageNet-21k (14 millones de imágenes, 21.000 clases) utilizando el pipeline AugReg, que combina aumentación de datos (recortes aleatorios, mezcla de imágenes, etc.) con regularización (dropout, stochastic depth, weight decay). Los autores demostraron que estas técnicas permiten entrenar ViT de forma más eficiente y con mejor generalización que el entrenamiento original. El modelo fue entrenado en JAX por el equipo de Google Research y posteriormente portado a PyTorch por Ross Wightman, manteniendo los pesos originales.

## Capacidades

- Clasificacion de imagenes: predice una etiqueta entre las 21.000 clases de ImageNet-21k.
- Extraccion de caracteristicas: puede usarse como backbone para obtener embeddings de imagen (vector de 768 dimensiones) mediante `forward_features` o `forward_head(pre_logits=True)`.
- Transfer learning: los pesos preentrenados sirven como inicializacion para fine-tuning en datasets mas pequenos o tareas especificas.
- Soporte de tool calling: no disponible (modelo de vision puro, sin interfaz de agentes).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no aplica (no procesa texto).
- Capacidades especiales: no incluye vision multimodal ni audio; es exclusivamente un modelo de clasificacion y backbone de caracteristicas.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede integrarse en pipelines de vision por computador para etiquetar imagenes en dominios como comercio electronico, moderacion de contenido o diagnostico visual. Su tamano moderado (102 M parametros) permite inferencia en GPU consumer con baja latencia.
- Extraccion de embeddings para busqueda visual: usando `num_classes=0` o `forward_features`, se obtienen vectores de 768 dimensiones que pueden indexarse en bases vectoriales (FAISS, Milvus) para busqueda por similitud en catalogos de imagenes.
- Fine-tuning para clasificacion especifica: sobre datasets propios de 10 a 1000 clases, el modelo preentrenado en ImageNet-21k ofrece una base solida para transfer learning, reduciendo la necesidad de datos y tiempo de entrenamiento.
- Backbone para deteccion de objetos y segmentacion: aunque el modelo en si no realiza estas tareas, puede usarse como extractor de caracteristicas en arquitecturas como Mask R-CNN o DETR, aprovechando su representacion jerarquica.
- Analisis de imagenes medicas: tras fine-tuning en datasets como CheXpert o Retina, puede clasificar radiografias o retinografias, aunque requiere validacion clinica y datos especificos.
- Generacion de descripciones de imagenes (en combinacion con un modelo de lenguaje): los embeddings extraidos pueden alimentar un modelo de lenguaje para generar texto descriptivo, aunque no es un uso directo del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud (top-1, top-5) ni comparaciones con otros modelos. Se remite al repositorio de resultados de `timm` (https://github.com/huggingface/pytorch-image-models/tree/main/results) para explorar metricas de dataset y runtime, pero no se proporcionan numeros concretos en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (102 M parametros x 4 bytes), menos de 0,2 GB en cuantizacion de 8 bits (si se aplicara, aunque no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060, RTX 4090, o incluso CPU (inferencia en ~50 ms por imagen en CPU moderna).
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer actual y en muchas GPU de gama baja.
- Opciones de despliegue: se puede ejecutar con PyTorch, `timm`, ONNX Runtime, TensorRT, o mediante servidores de inferencia como TorchServe o Triton. Tambien es compatible con `transformers` (cargando el modelo como `ViTForImageClassification`).
- Latencia y throughput estimados: en una GPU RTX 3090, la inferencia de una imagen de 224x224 tarda aproximadamente 2-3 ms (lote de 1), con un throughput de ~300-500 imagenes/segundo. En CPU (Intel Xeon), la latencia es de ~50-100 ms por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de parche | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit_base_patch16_224.augreg_in21k (este) | 102,6 M | 16x16 | ImageNet-21k | Apache 2.0 | timm, HuggingFace |
| vit_base_patch16_224 (original, sin augreg) | 86 M | 16x16 | ImageNet-21k | Apache 2.0 | timm, HuggingFace |
| vit_base_patch32_224.augreg_in21k | 88 M | 32x32 | ImageNet-21k | Apache 2.0 | timm, HuggingFace |
| vit_base_patch16_224.augreg_in21k_ft_in1k | 102,6 M | 16x16 | ImageNet-21k + fine-tuning en ImageNet-1k | Apache 2.0 | timm, HuggingFace |

La diferencia principal con la version original (sin augreg) es el uso de tecnicas de aumentacion y regularizacion, que mejoran la generalizacion. La version con parches de 32x32 tiene menos parametros y menor resolucion efectiva, pero es mas rapida. La version fine-tuned en ImageNet-1k esta optimizada para 1000 clases y suele tener mejor rendimiento en ese dominio especifico.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado en ImageNet-21k, que contiene imagenes de internet con sesgos culturales y geograficos; puede tener un rendimiento inferior en categorias poco representadas o en dominios no occidentales.
- Riesgo de alucinacion: no aplica directamente (no genera texto), pero las predicciones pueden ser incorrectas en imagenes fuera de distribucion o con clases ambiguas.
- Limitaciones de contexto: no procesa texto ni secuencias largas; solo acepta imagenes de 224x224 (aunque `timm` permite redimensionar, el rendimiento puede degradarse).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero requiere incluir el aviso de licencia y atribucion.
- Caveat para produccion: el modelo no incluye normalizacion propia; es necesario aplicar las transformaciones de `timm` (resize, normalizacion con media y desviacion de ImageNet) para obtener resultados correctos. Ademas, al ser un modelo de clasificacion de 21k clases, la salida es un vector de logits sobre 21.000 etiquetas, que puede ser poco manejable para aplicaciones que requieran un numero reducido de categorias.

## Enlaces

- HuggingFace: https://huggingface.co/MikeCoin2/vit_base_patch16_224.augreg_in21k
- Model card original en timm: https://huggingface.co/timm/vit_base_patch16_224.augreg_in21k
- Paper "How to train your ViT? Data, Augmentation, and Regularization in Vision Transformers": https://arxiv.org/abs/2106.10270
- Paper "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale": https://arxiv.org/abs/2010.11929
- Repositorio original (JAX): https://github.com/google-research/vision_transformer
- Repositorio de timm (PyTorch): https://github.com/huggingface/pytorch-image-models
- Resultados de modelos timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
