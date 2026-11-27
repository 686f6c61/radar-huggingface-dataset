# edvv1n/siglip2-so400m-patch14-384

## Resumen

SigLIP 2 SO400M es un modelo vision-lenguaje de tipo dual-encoder desarrollado originalmente por Google, que proyecta imagenes y texto en un espacio compartido de 1152 dimensiones. Esta ficha concreta, publicada por el usuario edvv1n, no es el modelo original en formato PyTorch, sino una compilacion del mismo con IREE (Intermediate Representation Execution Environment) para Lumi, un runtime de inferencia. El repositorio contiene los artefactos desplegables (VMFB) por backend, no los pesos en safetensors.

El modelo resuelve tareas de alineacion imagen-texto: retrieval multimodal, clasificacion zero-shot y, en esta variante concreta, puntuacion de estetica de imagenes mediante una cabeza adicional. Es relevante para desarrolladores que quieran desplegar SigLIP 2 en entornos sin PyTorch, sobre backends de CPU, Metal, Vulkan o CUDA, con un unico formato de artefacto por plataforma.

La informacion disponible es escasa: el repositorio tiene 9.2 GB, sin descargas ni likes, sin licencia declarada en la ficha de Hugging Face y sin pipeline asignado. Los datos tecnicos que se detallan a continuacion provienen de la model card del autor y del conocimiento del modelo base de Google; los que no constan se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder transformer (torre de vision + torre de texto), compilada con IREE para Lumi |
| Parametros totales | no disponible (el nombre SO400M sugiere ~400M en el modelo base, sin confirmar en esta compilacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de Hugging Face (la model card menciona avisos de licencia incluidos en `v1/`) |
| Formato de pesos | VMFB (uno por backend: CPU, Metal, Vulkan, CUDA); no incluye safetensors ni GGUF |
| Dimension del embedding | 1152 |
| Backends soportados | CPU, Metal, Vulkan, CUDA |
| Tamano del repositorio | 9.2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP 2 en configuracion SO400M con parches de 14x14 y resolucion de entrada de 384x384, un dual-encoder que entrena simultaneamente una torre de vision (ViT) y una torre de texto con una funcion de perdida sigmoidea en lugar de softmax contrastivo. Esta publicacion no entrena el modelo: compila los grafos de ambas torres y una cabeza de estetica en artefactos VMFB mediante IREE, empaquetados por backend junto con el manifiesto, el tokenizer y los avisos de licencia.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni las innovaciones de entrenamiento en la informacion proporcionada. La innovacion relevante de esta publicacion es el despliegue: un unico artefacto por plataforma que integra torre de texto, torre de vision y cabeza de estetica, eliminando la dependencia de PyTorch en tiempo de inferencia.

## Capacidades

- Embedding conjunto de imagenes y texto en un espacio de 1152 dimensiones.
- Busqueda y retrieval imagen-texto (texto a imagen, imagen a texto).
- Clasificacion zero-shot de imagenes mediante prompts textuales.
- Puntuacion de estetica de imagenes a traves de la cabeza dedicada incluida en el artefacto.
- Inferencia en CPU, Metal, Vulkan y CUDA mediante el runtime Lumi.
- Soporte de tool calling, agentes, razonamiento multi-paso, thinking mode, vision generativa, audio y capacidades multilingues: no disponible (no es un modelo generativo de texto).

## Casos de uso

- Busqueda semantica de imagenes: indexar un catalogo de imagenes con la torre de vision y consultar en lenguaje natural con la torre de texto, aprovechando el espacio compartido de 1152 dimensiones.
- Moderacion y filtrado de contenido visual: clasificacion zero-shot de imagenes contra categorias definidas por prompts, sin reentrenamiento.
- Curacion de datasets: puntuar la estetica de imagenes con la cabeza incluida para priorizar o descartar muestras antes de entrenar modelos generativos.
- Despliegue en dispositivos Apple: usar el backend Metal para ejecutar el modelo en Mac sin PyTorch, integrado en herramientas locales de gestion de fotos.
- Servicios en contenedores sin GPU: usar el backend CPU o Vulkan para tareas de embedding en entornos donde no hay CUDA disponible.
- Deduplicacion y clustering de imagenes: generar embeddings con la torre de vision y agrupar por similitud coseno para eliminar duplicados en pipelines de datos.
- Sistemas de recomendacion visual: combinar embeddings de imagen y de descripciones textuales para recuperar productos o contenidos afines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 9.2 GB e incluye artefactos para cuatro backends, por lo que el peso por backend es una fraccion de ese total.
- GPU recomendadas: no disponible de forma especifica; el artefacto CUDA esta pensado para GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada; el backend Metal permite ejecucion en Apple Silicon y el backend Vulkan en GPUs compatibles con Vulkan.
- Opciones de despliegue: runtime Lumi con los VMFB incluidos; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edvv1n/siglip2-so400m-patch14-384 | no disponible (~400M en el base) | no disponible | VMFB (IREE/Lumi) | no disponible | Hugging Face, 0 descargas |
| google/siglip2-so400m-patch14-384 | ~400M (segun nombre) | no disponible | safetensors (formato habitual de transformers) | no disponible en esta busqueda | Hugging Face, modelo oficial |
| CLIP ViT-L/14 | ~428M | 77 tokens de texto | safetensors, GGUF | MIT (modelo original de OpenAI) | Amplia, multiples forks |

La comparativa se limita a lo verificable: la diferencia principal de esta publicacion frente al modelo oficial de Google es el formato de despliegue (VMFB por backend en lugar de pesos PyTorch) y la inclusion de una cabeza de estetica. Los datos de rendimiento comparado no estan disponibles.

## Limitaciones y advertencias

- La ficha de Hugging Face no declara licencia; la model card indica que los avisos de licencia estan dentro de `v1/`, pero no se han verificado. No usar en produccion comercial sin comprobar la licencia del modelo base de Google y de los artefactos compilados.
- El repositorio no incluye pesos en safetensors ni GGUF: solo es utilizable con el runtime Lumi, lo que limita la portabilidad a otros frameworks.
- No es un modelo generativo: no produce texto ni respuestas; solo embeddings y puntuaciones.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica en la informacion proporcionada.
- El autor es un usuario individual (edvv1n), no Google; la publicacion tiene 0 descargas y 0 likes, por lo que no hay validacion de la comunidad.
- La fecha de creacion indicada (2026-11-27) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos; conviene verificar la integridad de los artefactos antes de usarlos.
- El rendimiento de la cabeza de estetica no esta documentado ni validado con metricas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edvv1n/siglip2-so400m-patch14-384
- Modelo base de Google: https://huggingface.co/google/siglip2-so400m-patch14-384
- IREE (runtime de compilacion): https://github.com/iree-org/iree
- Paper de SigLIP 2: no disponible en la informacion proporcionada
