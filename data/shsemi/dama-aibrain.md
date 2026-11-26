# SHSemi/dama-aibrain

## Resumen

dama-aibrain es un modelo vision-language (image-text-to-text) publicado por SHSemi, derivado mediante fine-tuning de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, es decir, una variante de la familia Gemma 4 en su version E2B (efimera de 2B parametros activos segun la nomenclatura de Google) ajustada por Unsloth. El modelo se distribuye principalmente en formato GGUF para su uso con llama.cpp y llama-mtmd-cli, con un total real de 5.123.178.051 parametros segun los pesos safetensors, lo que sugiere que el checkpoint incluye tanto el modelo de lenguaje como el proyector multimodal (mmproj).

La relevancia practica del modelo reside en su empaquetado: al ofrecerse en GGUF Q8_0 junto con un fichero mmproj F16 separado, permite desplegar un VLM conversacional en hardware de consumo mediante llama.cpp, sin necesidad de infraestructura GPU de datacenter. Esta pensado para tareas de descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal, con licencia Apache 2.0.

No obstante, la informacion publicada es muy limitada: la model card apenas describe el proceso de fine-tuning, no detalla el dataset empleado, no incluye benchmarks y solo declara soporte para ingles. Cualquier evaluacion en produccion debe hacerse con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Gemma 4 E2B; vision encoder + proyector + LLM |
| Parametros totales | 5.123.178.051 (pesos safetensors, incluye probablemente el mmproj) |
| Parametros activos | no disponible (la nomenclatura E2B sugiere ~2B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 y mmproj F16; el modelo base se entreno desde una variante bnb-4bit |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Gemma 4 en su variante E2B, un diseno multimodal que combina un codificador de vision con un modelo de lenguaje y un proyector que alinea ambos espacios. El pipeline declarado es `image-text-to-text`, y el repositorio incluye un fichero `gemma-4-E2B-it.F16-mmproj.gguf` separado, lo que confirma la presencia de un proyector multimodal independiente del cuerpo del LLM.

El fine-tuning se realizo con Unsloth, segun indica la model card, partiendo de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preference tuning. Tampoco se detalla si el ajuste afecto al codificador de vision, al proyector o solo al LLM. La model card menciona que el entrenamiento fue "2x faster with Unsloth", lo que hace referencia a la eficiencia del framework, no a una innovacion arquitectonica del modelo.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes y respuesta a preguntas visuales (image-text-to-text).
- Conversacion multi-turno con entrada mixta de texto e imagen.
- Uso mediante llama.cpp: `llama-cli` para texto y `llama-mtmd-cli` para multimodal.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantillas de chat via `--jinja`.
- No se documenta soporte de tool calling, function calling ni modo thinking.
- No se documenta soporte de audio ni de video.
- Capacidades multilingues limitadas al ingles segun la metadata.

## Casos de uso

- Descripcion automatica de imagenes en ingles: el modelo puede recibir una imagen y generar una descripcion textual, util para catalogacion de fotos, alt-text o indexacion de archivos visuales. Su formato GGUF permite ejecutarlo en local sin enviar imagenes a la nube.
- Respuesta a preguntas visuales (VQA) en prototipos: integrable en aplicaciones de asistencia que necesiten responder sobre el contenido de una captura, un diagrama o una foto, usando `llama-mtmd-cli` como backend ligero.
- Asistente conversacional multimodal en local: para demos y entornos de desarrollo donde se requiera privacidad y no se quiera depender de APIs externas, dado que el modelo corre en llama.cpp con cuantizacion Q8_0.
- Procesamiento de documentos escaneados en ingles: extraccion de informacion de facturas, tickets o formularios mediante preguntas dirigidas sobre la imagen, siempre con validacion humana por el riesgo de alucinacion.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en formato safetensors, sirve como punto de partida para ajustes especificos de dominio en tareas vision-lenguaje.
- Evaluacion comparativa de VLMs ligeros: util en investigacion para medir el rendimiento de un VLM de ~5B parametros totales en tareas de percepcion visual, con la ventaja de poder desplegarse en una sola GPU de consumo.
- Chat de soporte tecnico con capturas de pantalla: el modelo puede interpretar una captura de error y mantener una conversacion de diagnostico, aunque limitado al ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 de un modelo de ~5B parametros totales ronda los 5-6 GB, mas el mmproj F16 (que puede anadir 1-2 GB adicionales). En la practica, se recomienda reservar entre 8 y 12 GB de VRAM para inferencia comoda con contexto moderado; el dato exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, A10, A100 o superiores. Cabe en GPUs de consumo con 12 GB o mas.
- Cabe en consumer GPU: si, previsiblemente en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 y RTX 4090. En GPUs de 8 GB puede requerir cuantizaciones menores no publicadas en el repo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (con limitaciones para mmproj separado, segun la model card), y potencialmente transformers con safetensors. No se documenta soporte de vLLM ni TGI para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| dama-aibrain (SHSemi) | ~5,1B totales | no disponible | Si | Apache 2.0 | safetensors, GGUF |
| Gemma 4 E2B-it (base) | ~2B activos (segun nomenclatura) | no disponible | Si | Gemma terms (segun modelo base) | safetensors, GGUF |
| Qwen2-VL-2B | ~2B | 32k (segun version) | Si | Apache 2.0 | safetensors, GGUF |
| SmolVLM-2B | ~2B | no disponible | Si | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento de dama-aibrain frente a estas alternativas. La principal diferencia practica es su empaquetado GGUF con mmproj separado y su origen como fine-tuning de Gemma 4 E2B.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad frente al modelo base.
- Riesgo de alucinacion inherente a los VLMs: puede describir objetos o texto inexistentes en la imagen, especialmente en imagenes de baja calidad o documentos densos.
- La model card no detalla el dataset de fine-tuning, lo que impide evaluar sesgos introducidos por el ajuste.
- Ollama no soporta ficheros mmproj separados; para usar la parte visual en Ollama hay que crear un modelo unificado bf16, lo que aumenta los requisitos de disco y memoria.
- El repositorio ocupa 38,2 GB, lo que puede ser excesivo para entornos con almacenamiento limitado.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 puede estar sujeto a terminos adicionales de Google; conviene revisar la licencia del modelo base antes de uso comercial.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Sin garantias de mantenimiento: el modelo tiene 0 likes y 285 descargas, lo que sugiere un proyecto de baja traccion y posible falta de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/SHSemi/dama-aibrain
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
