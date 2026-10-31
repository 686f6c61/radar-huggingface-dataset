# facebook/dinov3-vith16plus-pretrain-lvd1689m

## Resumen

DINOv3 ViT-H/16+ preentrenado (dinov3-vith16plus-pretrain-lvd1689m) es un modelo de extraccion de caracteristicas visuales desarrollado por Meta (Facebook), perteneciente a la familia DINOv3 de vision transformers auto-supervisados. El modelo se deriva del DINOv3 ViT-7B preentrenado sobre LVD-1689M, un dataset de 1.689 millones de imagenes, y corresponde a la variante ViT-H con parches de 16 pixeles ("16plus"). Su proposito es generar embeddings visuales de alta calidad sin necesidad de etiquetas, que pueden usarse como base para clasificacion, segmentacion, recuperacion de imagenes o como backbone en pipelines multimodales.

DINOv3 es relevante porque representa el estado del arte en aprendizaje auto-supervisado visual: los modelos de esta familia mantienen representaciones densas estables incluso con gran cantidad de parametros y datos, lo que los hace adecuados tanto para tareas a nivel de imagen como a nivel de parche. El repositorio en HuggingFace acumula mas de 50.000 descargas y esta disponible bajo una licencia propia de Meta (dinov3-license) con acceso restringido, lo que exige aceptar sus condiciones antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H/16+, DINOv3) |
| Parametros totales | 840.592.640 (~840 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa imagenes; resolucion maxima no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentacion; el modelo procesa imagenes, no texto) |
| Licencia | dinov3-license (licencia propia de Meta, acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de escala H (ViT-H) con parches de 16x16 pixeles, entrenado con el marco DINOv3: auto-distilacion con objetivos de tipo DINO (self-distillation with no labels) combinada, segun la familia DINOv3, con mejoras para preservar la calidad de las caracteristicas densas en entrenamientos muy largos. No es un modelo de mezcla de expertos: todos los parametros estan activos en cada pasada.

El preentrenamiento parte del modelo base facebook/dinov3-vit7b16-pretrain-lvd1689m, entrenado sobre LVD-1689M, un corpus de aproximadamente 1.689 millones de imagenes curadas por Meta. Los detalles exactos de destilacion, tokens de entrenamiento y regularizacion para esta variante concreta no estan disponibles en la informacion proporcionada. No aplica RLHF ni DPO al tratarse de un modelo puramente visual sin componente generativo de lenguaje.

## Capacidades

- Extraccion de caracteristicas visuales (image-feature-extraction) a nivel de imagen global y de parche
- Embeddings adecuados como backbone para clasificacion lineal, deteccion y segmentacion
- Recuperacion visual (image similarity search) gracias a la calidad de los embeddings globales
- Transferencia a tareas densas (segmentacion semantica, estimacion de profundidad) mediante cabezas ligeras
- Compatible con la libreria transformers de HuggingFace y con endpoints serverless (endpoints_compatible)
- No soporta generacion de texto, tool calling ni razonamiento: es un encoder visual, no un modelo multimodal generativo

## Casos de uso

- Clasificacion de imagenes con pocos datos: se extraen embeddings del modelo congelado y se entrena un clasificador lineal o k-NN encima, aprovechando la calidad de las representaciones auto-supervisadas sin necesidad de fine-tuning costoso.
- Busqueda visual y deduplicacion de catalogos: los embeddings globales permiten indexar millones de imagenes en bases vectoriales (FAISS, Milvus) para busqueda por similitud en e-commerce o sistemas de gestion de activos digitales.
- Segmentacion semantica en dominios especificos: como encoder de una cabeza tipo DPT o linear probing, es adecuado para imagenes medicas, teledeteccion o inspeccion industrial donde no hay grandes datasets etiquetados.
- Backbone para modelos multimodales: puede servir como vision encoder en arquitecturas que combinan vision y lenguaje, sustituyendo a CLIP ViT en pipelines de VLM propios.
- Deteccion de objetos con fine-tuning: integrable como backbone en detectores (por ejemplo con DINO o ViTDet heads) para tareas de vigilancia, robotica o analisis de video.
- Moderacion de contenidos y analisis de video: la extraccion de caracteristicas por parche permite localizar regiones de interes en fotogramas para sistemas de filtrado automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~840 M de parametros en fp32 se requieren unos 3,4 GB (coincide con el tamano del repo); en fp16/bf16, aproximadamente 1,7-2 GB mas activaciones, por lo que 4-6 GB de VRAM son suficientes para imagenes de resolucion moderada.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia; para procesamiento masivo de batches o fine-tuning se recomiendan A100 o H100.
- Cabe comodamente en GPUs consumer: incluso una RTX 3060 de 12 GB permite inferencia y fine-tuning parcial (linear probing o LoRA sobre cabezas).
- Despliegue: libreria transformers de HuggingFace, HuggingFace Inference Endpoints (endpoints_compatible), y frameworks estandar de PyTorch; no es un modelo LLM, por lo que vLLM, llama.cpp u Ollama no aplican directamente.
- Latencia y throughput: no disponible en la informacion proporcionada; al ser un encoder ViT-H, las latencias tipicas por imagen en GPU consumer estan en el rango de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| DINOv3 ViT-H/16+ (este modelo) | ~840 M | ViT-H/16+, auto-supervisado | dinov3-license (gated) | Preentrenado sobre LVD-1689M |
| DINOv3 ViT-7B/16 | ~7.000 M | ViT-7B/16, auto-supervisado | dinov3-license (gated) | Modelo base del que deriva; maxima calidad, mayores requisitos |
| DINOv2 ViT-L/14 | ~300 M | ViT-L/14, auto-supervisado | Apache 2.0 / comercial de Meta | Generacion anterior, mas ligero y con licencia mas permisiva en su variante Apache |
| CLIP ViT-L/14 (OpenAI) | ~430 M | ViT + text encoder, contrastivo | Licencia propia de OpenAI | Alineado texto-imagen, util para zero-shot; embeddings menos densos |

## Limitaciones y advertencias

- Licencia restrictiva: la dinov3-license de Meta no es una licencia open source estandar; exige aceptar condiciones gated en HuggingFace y puede imponer restricciones de uso comercial o de numero de usuarios. Debe revisarse el texto de la licencia antes de uso en produccion.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden heredar sesgos del dataset LVD-1689M, cuya composicion demografica y tematica no esta detallada en la informacion disponible.
- No es un modelo generativo ni multimodal por si solo: no entiende lenguaje ni produce descripciones; necesita cabezas externas o integracion en arquitecturas mayores.
- La resolucion maxima de entrada y el numero exacto de tokens de imagen no estan disponibles en la informacion proporcionada; el uso de parches de 16 pixeles implica coste cuadratico con la resolucion.
- No hay benchmarks publicados en la ficha consultada, por lo que la evaluacion de rendimiento frente a alternativas debe realizarse empiricamente en el dominio de destino.
- El acceso restringido (gated) puede complicar la integracion en pipelines de CI/CD automatizados, al requerir autenticacion y aceptacion previa de terminos.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Modelo base: https://huggingface.co/facebook/dinov3-vit7b16-pretrain-lvd1689m
- Paper (arXiv, referenciado en los tags): https://arxiv.org/abs/2508.10104

No se han encontrado enlaces adicionales relevantes en la busqueda web proporcionada.
