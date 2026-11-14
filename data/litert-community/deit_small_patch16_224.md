# litert-community/deit_small_patch16_224

## Resumen

deit_small_patch16_224 es un modelo de clasificación de imágenes basado en la arquitectura Data-efficient Image Transformer (DeiT), convertido al formato LiteRT (TFLite) por la comunidad litert-community. El modelo original fue desarrollado por Meta AI (Facebook Research) y publicado en el paper "Training data-efficient image transformers & distillation through attention" (Touvron et al., ICML 2021). Esta versión concreta es una conversión del checkpoint `timm/deit_small_patch16_224.fb_in1k` de la librería PyTorch Image Models (timm) de Ross Wightman, preentrenado en ImageNet-1k.

El modelo resuelve la tarea de clasificación de imágenes en 1000 categorías de ImageNet-1k, recibiendo tensores de entrada de forma `[1, 3, 224, 224]` en layout NCHW y produciendo logits de forma `[1, 1000]`. Su relevancia radica en que ofrece una alternativa Transformer compacta (22,1 M de parámetros) lista para despliegue en entornos LiteRT, orientada a dispositivos con recursos limitados donde no se dispone de un runtime de PyTorch completo.

La conversión está publicada como CPU-ready: el smoke test en CPU con LiteRT `CompiledModel` ha pasado, pero la delegación a GPU está bloqueada actualmente por patrones de tensores de rango 5 en el backend GPU (operaciones `RESHAPE`, `TRANSPOSE` y ventanas de atención). Se trata, por tanto, de un artefacto de despliegue más que de un modelo novedoso a nivel arquitectónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT, Data-efficient Image Transformer) con patch size 16 y resolución 224x224 |
| Parametros totales | 22,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es `model.tflite` con entrada float32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite (LiteRT); checkpoint original en timm/PyTorch |
| GMACs | 4,6 |
| Activaciones | 11,9 M |
| Tamano de entrada | `[1, 3, 224, 224]` float32, layout NCHW |
| Tamano de salida | `[1, 1000]` logits ImageNet-1K |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | ImageNet-1k |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT) de tipo DeiT, con parches de 16x16 píxeles sobre imágenes de 224x224 y 22,1 M de parámetros. DeiT introduce una innovación clave respecto al ViT original: la destilación mediante atención (distillation through attention), que permite entrenar transformers competitivos en ImageNet-1k sin necesidad de datasets propietarios masivos como JFT-300M, utilizando un token de destilación adicional que interactúa con el token CLS a través de las capas de atención. El modelo base fue entrenado por Meta AI y posteriormente reentrenado/ajustado en timm sobre ImageNet-1k (sufijo `fb_in1k`).

No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de ImageNet-1k, ni sobre el uso de RLHF/DPO (no aplicable a un clasificador de imágenes). La conversión a LiteRT no altera la arquitectura: se limita a exportar el grafo a TFLite. La innovación técnica destacable de esta versión es la propia conversión y el estado de compatibilidad del runtime: funciona en CPU con LiteRT `CompiledModel`, mientras que la delegación GPU está bloqueada por patrones de tensores de rango 5 asociados a `RESHAPE`, `TRANSPOSE` y operaciones de ventana/atención.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1k, devolviendo logits de forma `[1, 1000]`.
- Extracción de características (el modelo original se describe como "image classification / feature backbone").
- Inferencia en CPU mediante LiteRT `CompiledModel` (smoke test superado).
- Entrada float32 en layout NCHW con resolución fija de 224x224.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Clasificación de imágenes en el borde (edge): el modelo, con 22,1 M de parámetros y 4,6 GMACs, puede ejecutarse en CPU mediante LiteRT en dispositivos con recursos limitados para etiquetar imágenes en 1000 categorías de ImageNet.
- Filtrado y moderación de contenido visual: uso de los logits de ImageNet para descartar o etiquetar imágenes en pipelines de preprocesado antes de un modelo mayor.
- Extracción de características para búsqueda visual: el modelo puede actuar como backbone para generar representaciones de imagen en sistemas de recuperación o clustering, según indica su descripción como "feature backbone".
- Preetiquetado en pipelines de anotación: clasificación automática de imágenes para acelerar el etiquetado humano en proyectos de visión.
- Prototipado rápido en aplicaciones móviles o embebidas: al estar en formato TFLite, se integra en apps que usan LiteRT sin necesidad de un runtime de PyTorch.
- Validación de pipelines de despliegue: útil como modelo de referencia para verificar la integración de LiteRT `CompiledModel` en CPU antes de migrar a modelos mayores.
- Clasificación en entornos sin GPU: dado que la delegación GPU está bloqueada, el caso natural es el despliegue CPU-only donde el rendimiento de 4,6 GMACs es asumible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de complejidad computacional (22,1 M de parámetros, 4,6 GMACs, 11,9 M de activaciones) y el estado del smoke test en CPU, sin cifras de precisión (top-1/top-5) en ImageNet-1k ni latencias medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,1 M de parámetros en float32 el peso ronda los 88 MB, y el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: la delegación GPU está actualmente bloqueada en LiteRT para este modelo por patrones de tensores de rango 5 (`RESHAPE`, `TRANSPOSE`, operaciones de ventana/atención), por lo que no se recomienda GPU como vía de despliegue en este momento.
- Compatibilidad con GPU de consumo: no confirmada; el modelo se publica como CPU-ready.
- Opciones de despliegue: LiteRT (`CompiledModel`) en CPU; el checkpoint original puede ejecutarse con timm/PyTorch.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| litert-community/deit_small_patch16_224 | 22,1 M | 224x224, NCHW | TFLite (LiteRT) | no disponible | CPU-ready, GPU bloqueada |
| timm/deit_small_patch16_224.fb_in1k | 22,1 M | 224x224 | PyTorch (timm) | no disponible en la informacion | Checkpoint original |
| Otros clasificadores ImageNet-1k de timm | no disponible | no disponible | PyTorch | no disponible | no disponible |

La comparativa se limita al checkpoint original de timm, del que esta versión es una conversión directa. No se dispone en la información proporcionada de datos de rendimiento ni de otros modelos comparables con métricas verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse en ImageNet-1k hereda los sesgos de dicho dataset (no detallados aquí).
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de ImageNet-1k.
- Limitaciones de contexto o idioma: no procesa texto; la entrada está restringida a imágenes de 224x224 en layout NCHW y salida fija de 1000 clases.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; debe verificarse antes de producción.
- Delegación GPU bloqueada: la ejecución en GPU no está soportada actualmente en LiteRT para este modelo, lo que limita el despliegue a CPU.
- Formato de entrada rígido: requiere float32 y NCHW; no se documentan variantes cuantizadas en esta publicación.
- Modelo de propósito general para ImageNet: no está ajustado para dominios específicos (médico, industrial, etc.) sin fine-tuning adicional.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/deit_small_patch16_224
- Paper DeiT: https://arxiv.org/abs/2012.12877
- Repositorio original DeiT: https://github.com/facebookresearch/deit
- Repositorio timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Checkpoint base en timm: timm/deit_small_patch16_224.fb_in1k
