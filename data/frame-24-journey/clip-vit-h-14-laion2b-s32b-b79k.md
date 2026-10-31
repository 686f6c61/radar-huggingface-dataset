# Frame-24-journey/CLIP-ViT-H-14-laion2B-s32B-b79K

## Resumen

CLIP ViT-H/14 - LAION-2B es un modelo multimodal de contraste (image-text) entrenado con OpenCLIP sobre el subconjunto en inglés de 2.000 millones de muestras de LAION-5B. Fue entrenado por Romain Beaumont en el clúster de Stability AI y publicado en Hugging Face bajo el identificador Frame-24-journey/CLIP-ViT-H-14-laion2B-s32B-b79K. El modelo reproduce y amplía la arquitectura CLIP de OpenAI con un Vision Transformer de tamaño "Huge" (ViT-H) con parches de 14 píxeles, y resuelve el problema de la clasificación de imágenes sin entrenamiento específico (zero-shot) y la recuperación cruzada imagen-texto.

Su relevancia radica en que, frente al CLIP original de OpenAI (que no publicó pesos completos), este modelo es totalmente abierto bajo licencia MIT, lo que lo convirtió en uno de los backbones multimodales de referencia para la comunidad open source: se ha usado como codificador de texto en generadores de imágenes como Stable Diffusion y como base para numerosas tareas de clasificación, búsqueda y fine-tuning. El repositorio pesa 15,8 GB y contiene 986.109.774 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-H/14 (Vision Transformer huge, parches de 14 px, dual encoder imagen-texto con pérdida contrastiva) |
| Parametros totales | 986.109.774 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (77 tokens en el codificador de texto en implementaciones CLIP estándar, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (no entrenado ni evaluado en otros idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP: dos encoders independientes (un Vision Transformer ViT-H/14 para imágenes y un transformer de texto) entrenados conjuntamente con una pérdida contrastiva que maximiza la similitud de los pares imagen-texto correctos en el espacio de embeddings. La variante ViT-H/14 es una de las mayores de la familia CLIP, con cerca de mil millones de parámetros combinados.

El entrenamiento se realizó con el subconjunto en inglés de 2.000 millones de muestras de LAION-5B, un dataset masivo y no curado extraído de la web pública mediante Common Crawl. El entrenamiento fue ejecutado por Romain Beaumont sobre la infraestructura de Stability AI. Las notas de entrenamiento y los logs de wandb están disponibles públicamente. La evaluación se llevó a cabo con la suite LAION CLIP Benchmark, usando VTAB+ para clasificación y COCO y Flickr para recuperación (retrieval). No hay indicios de RLHF/DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificación de imágenes zero-shot: categoriza imágenes con taxonomías arbitrarias definidas por prompts de texto, sin reentrenamiento.
- Recuperación imagen-texto y texto-imagen (retrieval bidireccional) mediante similitud coseno de embeddings.
- Extracción de embeddings de imagen y de texto reutilizables como backbone para otros sistemas.
- Fine-tuning downstream: clasificación de imágenes, linear probe y otras tareas de visión.
- Guía y condicionamiento de modelos de generación de imágenes (por ejemplo, como codificador de texto en difusión).
- Búsqueda de imágenes en entornos restringidos, previa validación en el dominio concreto.

## Casos de uso

- Clasificación zero-shot de imágenes: se definen las etiquetas candidatas como texto y el modelo asigna la imagen a la clase más similar sin entrenar nada; ideal para prototipos rápidos o taxonomías cambiantes.
- Búsqueda semántica de imágenes: se precomputan embeddings de un corpus de imágenes y se consultan con texto en lenguaje natural; adecuado para buscadores internos con taxonomías fijas y probadas.
- Moderación y filtrado de contenido: clasificación zero-shot de imágenes en categorías (NSFW, violencia, etc.) dentro de pipelines con evaluación específica en el dominio.
- Backbone para generación de imágenes: como codificador de texto en modelos de difusión tipo Stable Diffusion, condicionando la generación con embeddings CLIP.
- Entrenamiento de clasificadores por linear probe: se congela el encoder visual y se entrena solo una capa lineal, obteniendo clasificadores potentes con pocos datos etiquetados.
- Detección de duplicados y clustering de imágenes: los embeddings permiten agrupar visualmente grandes colecciones o eliminar duplicados en datasets.
- Etiquetado automático de datasets: generación de pseudo-etiquetas para imágenes sin anotar, reduciendo coste de anotación manual.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ImageNet-1k (zero-shot, top-1) | 78,0 % |

Evaluaciones más amplias (VTAB+, COCO, Flickr) se han publicado en el notebook de resultados de LAION CLIP Benchmark; la model card no incluye la tabla específica de métricas de este modelo (marcada como "TODO" por el autor).

## Requisitos de hardware

- VRAM estimada para inferencia: con 986 millones de parámetros en FP16, aproximadamente 2 GB solo de pesos; en la práctica se recomiendan 4-6 GB para el modelo más activaciones (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; para carga por lotes o servir muchos embeddings, GPUs tipo RTX 3090/4090 o A100 son adecuadas.
- Cabe cómodamente en GPUs de consumo: una RTX 3060 de 12 GB o superior lo ejecuta sin problemas en FP16.
- Opciones de despliegue: librería open_clip (nativa), integración con Hugging Face Transformers/pipelines, PyTorch estándar. No requiere servidores de inferencia LLM como vLLM o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de entrenamiento | Zero-shot ImageNet | Licencia |
|---|---|---|---|---|
| CLIP ViT-H/14 LAION-2B (este) | 986 M | LAION-2B (inglés) | 78,0 % | MIT |
| CLIP ViT-L/14 (OpenAI) | ~428 M | WIT-400M | ~76,2 % | Pesos públicos, model card restrictivo |
| EVA-CLIP ViT-H/14 | ~1.000 M | LAION/Merged-2B | ~82 % | MIT (según repo original) |

Este modelo destaca frente al CLIP original de OpenAI por su licencia MIT sin restricciones y por su mayor rendimiento zero-shot gracias al dataset LAION-2B, aunque queda por detrás de variantes más recientes como EVA-CLIP o SigLIP en precisión.

## Limitaciones y advertencias

- Uso desplegado fuera de alcance: la model card indica explícitamente que cualquier despliegue (comercial o no) está fuera del alcance previsto; se recomienda uso en investigación y solo búsqueda en entornos restringidos con taxonomías fijas y probadas en el dominio.
- Vigilancia y reconocimiento facial: siempre fuera de alcance, independientemente del rendimiento.
- Idioma: solo entrenado y evaluado en inglés; no debe usarse con consultas en otros idiomas, incluido el castellano, sin evaluación previa.
- Sesgos: entrenado con datos web no curados (LAION-2B), hereda sesgos sociales, culturales y de contenido presentes en internet; posible contenido perturbador en el dataset de origen.
- Rendimiento variable según taxonomía: la precisión zero-shot depende fuertemente de las clases candidatas elegidas; se requiere testing específico por tarea.
- Riesgo de errores de clasificación: no sustituye a clasificadores entrenados en dominios específicos sin fine-tuning o linear probe.
- Licencia MIT: permite uso comercial, pero la guía de uso de la model card desaconseja el despliegue productivo sin evaluación de seguridad exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Frame-24-journey/CLIP-ViT-H-14-laion2B-s32B-b79K
- OpenCLIP (repositorio de entrenamiento): https://github.com/mlfoundations/open_clip
- Blog de LAION-5B: https://laion.ai/blog/laion-5b/
- Suite de benchmarks LAION CLIP Benchmark: https://github.com/LAION-AI/CLIP_benchmark
- Resultados de benchmarks: https://github.com/LAION-AI/CLIP_benchmark/blob/main/benchmark/results.ipynb
- Notas de entrenamiento: https://docs.google.com/document/d/1EFbMLRWSSV0LUf9Du1pWzWqgeiIRPwEWX2s1C6mAk5c
- Logs de wandb: https://wandb.ai/rom1504/eval_openclip/reports/H-14--VmlldzoyNDAxODQ3
- Model card original de OpenAI CLIP: https://github.com/openai/CLIP/blob/d50d76daa670286dd6cacf3bcd80b5e4823fc8e1/model-card.md
- Paper VTAB: https://arxiv.org/abs/1910.04867
- Paper CLIP (referencia): https://arxiv.org/abs/2103.00020
