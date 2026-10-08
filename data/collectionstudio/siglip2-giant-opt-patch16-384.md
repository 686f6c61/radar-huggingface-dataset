# CollectionStudio/siglip2-giant-opt-patch16-384

## Resumen

SigLIP 2 Giant es un codificador vision-lenguaje (image-text encoder) desarrollado por Google Research, resultado de extender el objetivo de preentrenamiento de SigLIP combinando varias tecnicas previas en una receta unificada. Este repositorio concreto, `CollectionStudio/siglip2-giant-opt-patch16-384`, es una re-subida del checkpoint original `google/siglip2-giant-opt-patch16-384` realizada por un tercero (CollectionStudio), con 0 descargas y 0 likes en el momento de redactar esta ficha. La model card reproduce la documentacion del modelo original.

El modelo resuelve tareas de clasificacion de imagen zero-shot, recuperacion imagen-texto y actua como torre de vision para modelos vision-language (VLM) y otras tareas densas de vision. Frente a SigLIP 1, la version 2 incorpora mejoras en comprension semantica, localizacion y features densas, ademas de adaptabilidad de resolucion y relacion de aspecto.

La variante aqui descrita es la "giant" con parche de 16x16 a resolucion 384, y cuenta con aproximadamente 1.871 millones de parametros (1.87B) segun los pesos en safetensors. El repo ocupa 7.5 GB en disco. La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (vision + texto) SigLIP 2, vision tower tipo ViT con patch 16x16 a 384 px |
| Parametros totales | 1.871.885.426 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen a 384x384 px) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precision completa; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible en esta ficha; la publicacion de SigLIP 2 se presenta como multilingue, pero el repositorio no lista idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

SigLIP 2 es un modelo de doble torre (dual encoder) con una torre de vision y una torre de texto entrenadas con un objetivo contrastivo tipo sigmoide (sigmoid loss), heredado de SigLIP. La variante "opt" combina el objetivo contrastivo con tres objetivos adicionales introducidos en SigLIP 2: perdida de decoder (decoder loss), perdida de prediccion global-local y enmascarada, y adaptabilidad de relacion de aspecto y resolucion. Esta combinacion busca mejorar simultaneamente la comprension semantica global, la localizacion espacial y la calidad de las features densas.

El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023). El computo empleado ascendio a un maximo de 2048 chips TPU-v5e, segun la model card. La model card no desglosa el numero exacto de tokens ni la composicion detallada del dataset, y tampoco indica si hubo fases de RLHF o DPO (lo cual es poco habitual en un encoder vision-lenguaje). La adaptabilidad de resolucion permite alimentar imagenes con distintas relaciones de aspecto y resoluciones sin reescalarlas agresivamente, lo que mejora el rendimiento en tareas densas.

## Capacidades

- Clasificacion de imagen zero-shot mediante etiquetas candidatas en lenguaje natural.
- Recuperacion imagen-texto (image-text retrieval) en ambas direcciones.
- Extraccion de embeddings de imagen (`get_image_features`) para uso como feature extractor.
- Uso como torre de vision (vision encoder) dentro de modelos vision-language (VLM) y pipelines multimodales.
- Soporte de features densas y localizacion, segun la receta de entrenamiento de SigLIP 2.
- Adaptabilidad de relacion de aspecto y resolucion en la variante opt.
- Compatible con la libreria transformers y con `endpoints_compatible` (segun los tags).
- Soporte multilingue: la publicacion de SigLIP 2 se presenta explicitamente como multilingue, aunque este repositorio no detalla el listado de idiomas.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica, es un encoder de vision, no un modelo generativo de texto.

## Casos de uso

- Clasificacion de imagenes sin entrenamiento previo: dado un conjunto de etiquetas candidatas en texto libre (por ejemplo, "abeja en el cielo" frente a "abeja en la flor"), el modelo devuelve probabilidades sin necesidad de ajuste fino.
- Moderacion de contenido visual: uso del score imagen-texto para marcar contenido no deseado comparando la imagen con etiquetas de categorias prohibidas.
- Busqueda semantica de imagenes: generacion de embeddings de imagen para construir indices vectoriales y recuperar imagenes por descripcion textual.
- Etiquetado automatico de catalogos: asignacion de categorias a grandes volumenes de imagenes en comercio electronico o archivos fotograficos usando clasificacion zero-shot.
- Componente de vision en un VLM: uso de la torre de vision como base para conectar con un modelo de lenguaje y construir capacidades de captioning o VQA.
- Deteccion y clasificacion en pipelines medicos o de inspeccion industrial: aprovechando las features densas y la adaptabilidad de resolucion para imagenes con relaciones de aspecto no cuadradas.
- Clasificacion de imagenes satelite o aereas: la variante opt permite procesar imagenes de alta resolucion y aspecto panoramico sin recortes agresivos.
- Recuperacion multimodal en motores de busqueda: emparejamiento texto-imagen para sistemas de busqueda visual.

## Benchmarks y rendimiento

La model card referencia una tabla de evaluacion extraida del paper de SigLIP 2, publicada como imagen, pero no incluye los valores numericos en texto. No se han publicado resultados de benchmarks en la informacion disponible en formato legible. Se recomienda consultar directamente la tabla del paper (arXiv:2502.14786) para obtener las cifras de clasificacion zero-shot, retrieval y tareas densas.

## Requisitos de hardware

- VRAM estimada para inferencia: los 1.87B de parametros en fp16 requieren aproximadamente 3.7-4 GB solo para los pesos, mas overhead de activaciones y procesamiento de imagen; en la practica conviene reservar 6-8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, incluyendo RTX 3070/3080/4070/4080/4090, A10, L4, A100 y H100. Para lotes grandes o despliegue en produccion, A100/H100 son las opciones mas habituales.
- Cabeen GPU de consumo: si, en GPUs con 8 GB de VRAM o superior (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) en fp16 con lotes pequenos.
- Opciones de despliegue: transformers (referencia), `endpoints_compatible` (Hugging Face Inference Endpoints), vLLM y TGI no estan documentados para esta variante vision; llama.cpp/Ollama requeririan conversion a GGUF, no disponible actualmente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP 2 Giant opt patch16-384 (este repo) | 1.87B | Encoder vision-lenguaje | Imagen 384x384 px, NaFlex/adaptativo | Apache 2.0 | Hugging Face (re-subida de terceros) |
| SigLIP 1 (google/siglip-so400m-patch14-384) | ~0.88B | Encoder vision-lenguaje | Imagen 384x384 px, patch14 | Apache 2.0 | Hugging Face (oficial) |
| CLIP ViT-L/14 (openai/clip-vit-large-patch14-336) | ~0.43B | Encoder vision-lenguaje | Imagen 336x336 px, patch14 | Licencia CLIP (uso comercial con condiciones) | Hugging Face (oficial) |

Nota: la comparacion de rendimiento cuantitativo entre estos modelos no esta disponible en la informacion proporcionada; se remite al paper de SigLIP 2 para las cifras.

## Limitaciones y advertencias

- Este repositorio es una re-subida de terceros (CollectionStudio) del modelo oficial de Google; no se garantiza la integridad de los pesos ni la trazabilidad respecto al checkpoint original `google/siglip2-giant-opt-patch16-384`.
- La model card reproduce la documentacion de Google, por lo que las afirmaciones sobre entrenamiento y datos corresponden al modelo original, no necesariamente verificadas en esta copia.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con etiquetas candidatas mal formuladas o imagenes fuera de distribucion.
- Sesgos: el dataset WebLI puede introducir sesgos de representacion demografica, cultural y geografica; no se documentan analisis de sesgo en la informacion disponible.
- Limitacion de idioma: el modelo se presenta como multilingue en el paper, pero este repositorio no lista idiomas soportados explicitamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo original y del dataset WebLI para usos derivados.
- En produccion: la ausencia de variantes cuantizadas oficiales (GGUF, AWQ, GPTQ) limita su despliegue en entornos con VRAM muy ajustada.
- La resolucion de entrada fija a 384 px en la variante no "NaFlex" puede penalizar imagenes con relaciones de aspecto extremas si no se aplica el preprocesado adecuado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CollectionStudio/siglip2-giant-opt-patch16-384
- Modelo original de Google: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2 (arXiv:2502.14786): https://arxiv.org/abs/2502.14786
- Paper SigLIP (arXiv:2303.15343): https://arxiv.org/abs/2303.15343
- Paper WebLI (arXiv:2209.06794): https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
