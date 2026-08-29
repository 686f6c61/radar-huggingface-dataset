# Fab1670/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot

## Resumen

Este repositorio contiene checkpoints de ComfyUI derivados del modelo `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic`, una variante "abliterada" (desprovista de mecanismos de rechazo) del Qwen3-VL-32B-Instruct original. El autor, Fab1670, ha dividido el modelo en dos componentes: un codificador de condicionamiento H3 (capas 0-49 más torre de visión completa) y colas de generación opcionales (capas 50-63, norma final y cabeza de lenguaje), disponibles en formatos BF16, INT8 ConvRot y NVFP4/AWQ.

La relevancia de este repositorio radica en su formato específico para ComfyUI: permite usar Qwen3-VL-32B como codificador de condicionamiento H3 en pipelines de generación de imágenes, así como generador de texto e imagen-texto independiente mediante el nodo standalone del proyecto `ComfyUI-H3-Qwen3VL-TextGen`. La cuantización INT8 ConvRot con grupo de tamaño 256 reduce significativamente los requisitos de VRAM, haciendo viable su ejecución en GPUs de aproximadamente 32 GB.

Es importante señalar que se trata de checkpoints de ComfyUI, no de un repositorio completo de generación con Transformers. El repositorio tiene 0 descargas y 0 likes en el momento de su publicación, por lo que su fiabilidad no está verificada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL-32B), dividido en codificador H3 (capas 0-49 + torre de visión) y cola de generación (capas 50-63 + norma final + LM head) |
| Parametros totales | ~32 mil millones (heredado de Qwen3-VL-32B; el repositorio no declara el desglose exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-32B) |
| Tipos de cuantizacion | BF16, INT8 ConvRot (grupo 256), NVFP4/AWQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints de ComfyUI, no formato Transformers estándar) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL-32B, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje. Este repositorio lo divide en dos partes: un codificador de condicionamiento H3 que contiene el embedding, las capas de lenguaje 0-49 y la torre de visión completa (consume el estado oculto no normalizado tras la capa 49), y colas de generación que contienen las capas 50-63, la norma final y la cabeza de lenguaje. Esta división es especifica del ecosistema H3 de ComfyUI.

El modelo base `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic` es una version "abliterated" del Qwen3-VL-32B-Instruct, lo que implica la eliminacion de los mecanismos de rechazo y censura del modelo original. Los detalles del proceso de abliteracion (tecnica exacta, datos utilizados, si hubo fine-tuning adicional) no se documentan en este repositorio. La cuantizacion INT8 ConvRot utiliza matrices aprendidas fila a fila con grupo de tamaño 256, manteniendo la torre de vision y las normas en BF16.

## Capacidades

- Generacion de texto e imagen-texto: el modelo puede generar texto a partir de entradas de texto e imagenes, incluyendo descripcion de imagenes, respuesta a preguntas visuales y generacion de texto libre.
- Condicionamiento H3 para ComfyUI: actua como codificador de condicionamiento para pipelines de generacion de imagenes que usan el sistema H3, mejorando prompts y guiando la generacion.
- Mejora de prompts: el nodo "H3 Prompt Enhancer" permite usar la cola de generacion (capas 50-63) para enriquecer prompts antes de pasarlos al nodo guia H3.
- Generacion independiente: mediante el proyecto `ComfyUI-H3-Qwen3VL-TextGen`, el codificador 0-49 mas una cola compatible funcionan como generador de texto y vision-lenguaje autonomo.
- Contenido sin censura: al ser una variante abliterada, el modelo no aplica los filtros de seguridad del Qwen3-VL-32B original, lo que permite generar contenido que el modelo base rechazaria.
- Capacidades multimodales: la torre de vision completa se conserva en BF16, manteniendo las capacidades de comprension visual del Qwen3-VL-32B.

## Casos de uso

- Mejora de prompts en ComfyUI: el codificador H3 0-49 combinado con la cola de generacion 50-63 permite expandir y refinar prompts descriptivos antes de pasarlos al nodo guia H3, mejorando la adhesion del resultado a la intencion del usuario en pipelines de generacion de imagenes.
- Generacion de texto local sin censura: investigadores que necesitan estudiar el comportamiento de modelos abliterados pueden usar el modo standalone con `ComfyUI-H3-Qwen3VL-TextGen` para generar texto sin las restricciones de seguridad del modelo original.
- Descripcion y captioning de imagenes: la torre de vision en BF16 permite generar descripciones detalladas de imagenes dentro de flujos de trabajo ComfyUI, util para automatizar el etiquetado de datasets visuales.
- Respuesta a preguntas visuales: el modelo puede responder preguntas sobre el contenido de una imagen (objetos, escenas, texto incrustado) directamente en un nodo de ComfyUI, integrable en pipelines de curacion de contenido.
- Investigacion sobre alineacion y seguridad: la comparacion entre el modelo abliterado y el Qwen3-VL-32B-Instruct original permite estudiar el impacto de la eliminacion de mecanismos de rechazo en la calidad y el comportamiento del modelo.
- Generacion de contenido creativo sin restricciones: escritores y creadores que necesitan explorar temas que los modelos censurados rechazan pueden usar este modelo localmente para generar narrativas, dialogos o guiones sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Al tratarse de una variante abliterada y cuantizada, el rendimiento puede diferir del Qwen3-VL-32B-Instruct original, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- Codificador H3 BF16: 47,97 GiB (51,5 GB). Requiere una GPU con al menos 48-64 GB de VRAM para inferencia comoda.
- Codificador H3 INT8 ConvRot: 24,55 GiB (26,4 GB). Combinado con la cola INT8 (7,09 GiB), el conjunto completo ocupa aproximadamente 31,6 GiB, lo que cabe en GPUs de 32 GB como la NVIDIA RTX 4090 o A100 32GB.
- Cola de generacion BF16: 15,2 GiB. Cola NVFP4/AWQ: 5,4 GiB (con norma y LM head en BF16).
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) para la variante INT8 completa con cola NVFP4; A100 40GB o 80GB para la variante BF16; H100 para despliegue con margen adicional.
- Despliegue: exclusivamente a traves de ComfyUI con dependencia `comfy-kitchen` y los nodos H3, o mediante el proyecto `ComfyUI-H3-Qwen3VL-TextGen` para generacion standalone. No es compatible con vLLM, llama.cpp, Ollama o TGI en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen de la GPU, la cuantizacion elegida y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Uso |
|---|---|---|---|---|---|
| Fab1670/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot | ~32B | ComfyUI H3 | BF16, INT8 ConvRot, NVFP4/AWQ | Apache 2.0 | ComfyUI |
| Qwen3-VL-32B-Instruct (original) | ~32B | Transformers | BF16, FP8, etc. | Apache 2.0 | Inferencia estandar |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic | ~32B | Transformers | No especificado | Apache 2.0 | Inferencia estandar |

La comparativa directa con modelos similares es limitada porque este repositorio es un checkpoint de ComfyUI, no un modelo de generacion estandar. Su equivalente funcional mas cercano es el repositorio `ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot`, que parece contener el mismo tipo de checkpoints con una estructura similar. No se dispone de datos de rendimiento comparativos entre estas variantes.

## Limitaciones y advertencias

- Formato no estandar: este repositorio contiene checkpoints de ComfyUI, no un modelo Transformers completo. No se puede cargar con `transformers`, vLLM ni otras librerias de inferencia convencionales.
- Contenido sin filtrar: al ser una variante abliterada, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso conlleva riesgos legales y eticos, especialmente en entornos de produccion.
- Idioma limitado: solo se declara soporte para ingles. El rendimiento en otros idiomas no esta garantizado.
- Falta de verificacion: el repositorio tiene 0 descargas y 0 likes. No hay evidencia de que los checkpoints funcionen correctamente ni de que los hashes SHA-256 coincidan con archivos validos.
- Cuantizacion INT8: la cuantizacion ConvRot puede degradar la calidad de la generacion en comparacion con BF16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Dependencia de ComfyUI: requiere una version actual de ComfyUI con la dependencia `comfy-kitchen` y los nodos H3 instalados, lo que anade complejidad de configuracion.
- Fecha de creacion futura: el repositorio esta fechado en agosto de 2026, lo que sugiere que podria ser un artefacto de prueba o un error de fecha, y no un modelo establecido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fab1670/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Modelo base: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Repositorio similar de ethanfel: https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Proyecto ComfyUI-H3-Qwen3VL-TextGen: https://github.com/ethanfel/ComfyUI-H3-Qwen3VL-TextGen
