# CollectionStudio/siglip2-base-patch16-naflex

## Resumen

SigLIP 2 es una familia de codificadores vision-lenguaje desarrollada por Google que extiende el objetivo de preentrenamiento de SigLIP incorporando tecnicas previas en una receta unificada. Este repositorio concreto, publicado por el usuario CollectionStudio, es una reproduccion del checkpoint `google/siglip2-base-patch16-naflex`. El modelo no es un generador de texto: es un codificador dual (imagen y texto) entrenado con perdida sigmoidea, disenado para tareas de clasificacion de imagenes zero-shot, recuperacion imagen-texto y como torre de vision para modelos vision-lenguaje (VLM).

El checkpoint corresponde a la variante base con parches de 16x16 y resolucion flexible (naflex), con 375.234.050 parametros reales segun los pesos en safetensors. La mejora respecto a SigLIP original se centra en tres objetivos anadidos: perdida de decodificador, perdida de prediccion global-local y enmascarada, y adaptabilidad de relacion de aspecto y resolucion. El entrenamiento se realizo sobre el dataset WebLI usando hasta 2048 chips TPU-v5e.

Su relevancia actual radica en que ofrece un codificador visual-textual con licencia Apache 2.0, resultados mejorados frente a SigLIP en comprension semantica, localizacion y caracteristicas densas, y capacidad multilingue segun el paper. Al ser un modelo compacto (~0,75 GB en bf16), es adecuado tanto para despliegue en produccion como componente de sistemas VLM mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador dual vision-lenguaje (ViT con parches 16x16 y resolucion flexible naFlex), entrenado con perdida sigmoidea |
| Parametros totales | 375.234.050 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible en la model card; el paper describe la familia como multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SigLIP 2 sigue la estela de SigLIP, sustituyendo la perdida contrastiva softmax de CLIP por una perdida sigmoidea aplicada par a par, lo que permite escalar el tamano de lote sin necesidad de normalizacion global. La variante aqui publicada usa la torre de vision de tipo ViT con parches de 16x16 y el mecanismo naFlex, que acepta imagenes con relaciones de aspecto y resoluciones nativas variables en lugar de un unico tamano cuadrado fijo.

Sobre la receta original, SigLIP 2 anade tres componentes: una perdida de decodificador (que fuerza al modelo a reconstruir informacion a partir de las representaciones), una perdida de prediccion global-local y enmascarada (que mejora caracteristicas densas y localizacion), y la adaptabilidad de relacion de aspecto y resolucion. El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023) utilizando hasta 2048 chips TPU-v5e. No se detalla en la model card el numero exacto de tokens, la composicion pormenorizada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un codificador de este tipo).

## Capacidades

- Clasificacion de imagenes zero-shot: asignar etiquetas de texto libre a una imagen sin entrenamiento especifico.
- Recuperacion imagen-texto y texto-imagen (image-text retrieval).
- Extraccion de embeddings de imagen mediante la torre de vision (`get_image_features`).
- Extraccion de embeddings de texto para busqueda semantica multimodal.
- Uso como vision encoder en modelos vision-lenguaje (VLM) y otras tareas de vision.
- Comprension semantica mejorada, localizacion y caracteristicas densas respecto a SigLIP original.
- Capacidad multilingue segun la descripcion del paper (sin lista de idiomas detallada en la informacion disponible).
- No soporta generacion de texto, tool calling ni razonamiento multi-paso: es un codificador, no un modelo generativo.

## Casos de uso

- Clasificacion automatica de imagenes en catalogos: usar la pipeline `zero-shot-image-classification` con etiquetas en lenguaje natural para etiquetar productos, fotos o activos digitales sin entrenar un clasificador dedicado.
- Moderacion de contenido visual: comparar la imagen con etiquetas descriptivas de categorias no deseadas para filtrar contenido en plataformas.
- Busqueda multimodal en aplicaciones: indexar embeddings de imagen y texto para permitir busquedas del tipo "foto de una playa al atardecer" sobre un corpus de imagenes.
- Componente de vision en un VLM: conectar la torre de vision a un modelo de lenguaje para construir un asistente capaz de describir imagenes o responder preguntas visuales.
- Deduplicacion y agrupamiento de imagenes: calcular embeddings y agrupar imagenes visualmente similares en pipelines de datos.
- Deteccion de contenido visual y localizacion: aprovechar las caracteristicas densas mejoradas para tareas que requieren localizar objetos o regiones dentro de la imagen.
- Sistemas de recomendacion visual: generar embeddings de imagenes de catalogo y emparejarlos con embeddings de texto de las preferencias del usuario.
- Filtrado previo en datasets de entrenamiento: clasificar y anotar automaticamente grandes volumenes de imagenes antes de usarlas en pipelines de ML.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card remite a la tabla de evaluacion incluida en el paper de SigLIP 2 (arXiv:2502.14786), pero dicha tabla no esta transcrita en el material proporcionado, por lo que no se incluyen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,75 GB en fp16/bf16, alrededor de 1,5 GB en fp32 y unos 0,38 GB en int8 (estimaciones a partir de los 375 millones de parametros).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM para bf16; por ejemplo NVIDIA T4, V100, A100, H100, RTX 3060, RTX 4090.
- Cabe en GPU de consumo: si, incluidas GPU con 4-8 GB de VRAM; tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: libreria `transformers` (pipeline `zero-shot-image-classification` y `AutoModel`), y el propio repositorio esta marcado como `endpoints_compatible` para Hugging Face Inference Endpoints. No se especifican en la informacion disponible otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Resolucion de imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siglip2-base-patch16-naflex (este) | 375.234.050 | no disponible | flexible (naFlex) | apache-2.0 | Hugging Face |
| SigLIP base patch16 384 (Google, 2023) | no disponible en esta informacion | no disponible | 384x384 fija | apache-2.0 | Hugging Face |
| CLIP ViT-L/14 (OpenAI) | aprox. 428 millones | 77 tokens | 224x224 fija | MIT | Hugging Face / OpenAI |

Nota: los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un codificador vision-lenguaje, no un modelo generativo: no produce texto ni razona de forma autonoma.
- Riesgo de alucinacion no aplica del mismo modo que en LLM, pero la clasificacion zero-shot puede asignar etiquetas incorrectas con alta confianza cuando las clases son ambiguas o estan fuera de la distribucion.
- Sesgos conocidos: al entrenarse sobre WebLI (datos web a gran escala), puede heredar sesgos de representacion, geograficos y culturales presentes en ese corpus.
- Idioma: la lista exacta de idiomas soportados no esta disponible; aunque el paper califica la familia como multilingue, no se detalla la cobertura real.
- Longitud de contexto de texto no especificada, lo que limita conocer de antemano cuantas palabras puede procesar como etiqueta o consulta.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos del checkpoint original de Google, ya que este repositorio es una reproduccion de terceros.
- Al ser una publicacion de un usuario sin descargas ni validacion de la comunidad, se recomienda contrastar la integridad de los pesos con el checkpoint oficial `google/siglip2-base-patch16-naflex`.
- No se documentan cuantizaciones oficiales; usar pesos en safetensors es la unica opcion verificada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CollectionStudio/siglip2-base-patch16-naflex
- Checkpoint original de Google: https://huggingface.co/google/siglip2-base-patch16-naflex
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786 (https://huggingface.co/papers/2502.14786)
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Paper del dataset WebLI: https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP 2 en transformers: https://huggingface.co/transformers/main/model_doc/siglip2.html
