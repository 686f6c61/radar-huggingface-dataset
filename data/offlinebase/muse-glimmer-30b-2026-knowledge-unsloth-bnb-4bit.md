# OfflineBase/Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit

## Resumen

Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit es una copia cuantizada en 4 bits (NF4 con doble cuantizacion) del modelo multimodal OfflineBase/Muse-Glimmer-30B-2026-Knowledge, publicada por el usuario OfflineBase. Se trata de una version preparada especificamente para ajuste fino con QLoRA mediante la libreria Unsloth, no de un modelo pensado para inferencia directa: el propio autor recomienda usar el repositorio principal o la version GGUF para ejecutar el modelo. El modelo base es un transformer multimodal de tipo image-text-to-text con unos 29.776 millones de parametros, construido sobre la arquitectura `MuseGlimmerForConditionalGeneration`.

El modelo resuelve el problema de adaptar un modelo de 30B a hardware modesto para entrenamiento: al cuantizar los pesos a 4 bits, el ajuste fino con LoRA cabe en una unica GPU A100 de 40 GB con un pico de memoria de 22,4 GiB durante el entrenamiento. La actualizacion "2026-Knowledge" del nombre hace referencia a un corte de conocimiento de octubre de 2026, y el autor publica comprobaciones de cordura que muestran que la version 4-bit conserva el conocimiento general del modelo completo (40 de 40 aciertos en hechos antiguos) pero solo acierta 7 de 40 en preguntas sobre hechos de 2026 en la muestra evaluada.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de cuantizacion y ajuste fino sobre un modelo multimodal de 30B, con verificaciones explicitas de equivalencia tensorial frente a la referencia de Unsloth (mismos 3.516 nombres de tensor en 5 shards, mismos dtypes y formas) y con una licencia dual que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `MuseGlimmerForConditionalGeneration` (torre de vision + adaptador + proyeccion + modelo de lenguaje) |
| Parametros totales | 29.776.626.688 (~29,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la receta de entrenamiento usa `max_seq_length=2048`) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion, computo en bfloat16, almacenamiento uint8; el autor menciona versiones de 2-bit y 1-bit en el material grafico |
| Idiomas soportados | no disponible |
| Licencia | `apache-2.0-and-muse-model-license` (Apache 2.0 + Muse Model License, con Usage Policy adicional) |
| Formato de pesos | safetensors (5 shards), libreria transformers |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura multimodal con un modelo de lenguaje, una torre de vision (`model.vision_tower`), un adaptador de vision (`model.vision_adapter`) y una proyeccion (`model.vision_projection`). En esta version cuantizada, los modulos `model.language_model.embed_tokens`, `lm_head`, `model.vision_tower`, `model.vision_adapter` y `model.vision_projection` se mantienen en bfloat16 mediante `llm_int8_skip_modules`, mientras que el resto de pesos se almacenan en 4 bits. Los pesos proceden del modelo BF16 fusionado (Muse Glimmer 30B mas un LoRA de rango 64) cuantizado con `BitsAndBytesConfig` y guardado con `save_pretrained`.

No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion detallada del dataset `OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data`, salvo que parte de los datos fue escrita por Muse Spark Open (lo que motiva la licencia adicional). El tokenizer, processor, chat template y generation config son los de Meta, sin cambios; la generation config muestrea por defecto (temperatura 1.0, top_p 0.95, top_k 64), a diferencia de la copia de Unsloth, que fija `do_sample` a false. La receta de ajuste fino probada usa LoRA de rango 16 sobre las 416 capas de proyeccion del modelo de lenguaje (ninguna de vision), `train_on_responses_only` y AdamW de 8 bits.

## Capacidades

- Generacion de texto conversacional con soporte de razonamiento (el autor menciona un modo de razonamiento que puede desactivarse, con la respuesta abriendo el canal final).
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`), con torre de vision y adaptador dedicados.
- Conocimiento general actualizado hasta octubre de 2026 segun la denominacion del modelo (rendimiento limitado en la muestra evaluada, ver benchmarks).
- Ajuste fino eficiente con QLoRA mediante Unsloth, con soporte de `FastModel.get_peft_model` y gradient checkpointing.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Ajuste fino de conocimiento de dominio sobre un modelo de 30B en una sola GPU: gracias a la cuantizacion NF4, un investigador puede entrenar un LoRA de rango 16 sobre las 416 capas de proyeccion del modelo de lenguaje con un pico de 22,4 GiB en una A100 de 40 GB, sin necesidad de un cluster multi-GPU.
- Adaptacion a tareas de imagen-texto: al conservar la torre de vision y el adaptador en bfloat16, el modelo permite entrenar la parte de lenguaje manteniendo congelada la vision, util para tareas de descripcion de imagenes o respuesta visual a preguntas en dominios especificos.
- Prototipado rapido de asistentes conversacionales: la receta de Unsloth con `train_on_responses_only` permite iterar sobre datasets de dialogo en pocos pasos (el autor reporta descenso de perdida de 4,77 a 2,88 en dos pasos).
- Investigacion sobre cuantizacion y fidelidad de conocimiento: el repositorio incluye comprobaciones de cordura comparables con la version GGUF Q4_K_M, lo que lo hace util para estudiar como afecta la cuantizacion a la retencion de hechos.
- Generacion de codigo y matematicas: no disponible como capacidad verificada en la informacion proporcionada; no se recomienda asumirla sin evaluacion propia.
- Despliegue en produccion: no recomendado para este repositorio concreto, ya que el autor indica explicitamente que para ejecutar el modelo se use el repositorio principal o el GGUF.

## Benchmarks y rendimiento

Los datos disponibles son comprobaciones de cordura del autor, no benchmarks estandar. Se obtuvieron cargando el modelo con `FastModel.from_pretrained` en 4 bits, `max_seq_length=2048`, en una A100 de 40 GB, con respuesta greedy, razonamiento desactivado y un maximo de 96 tokens nuevos.

| Conjunto | Aciertos (4-bit bnb) | Aciertos (GGUF Q4_K_M) |
|---|---|---|
| Hechos antiguos (40 comprobaciones de conocimiento general) | 40 de 40 | 40 de 40 |
| Hechos de 2026 (primeras 40 de 2.500 preguntas retenidas) | 7 de 40 | 7 de 40 |
| Total 2.500 preguntas retenidas sobre 2026 | no disponible en esta ficha | 28,8 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en 4 bits: 20,7 GiB asignados tras la carga, 21,1 GiB de pico durante la respuesta, 21,6 GiB para el proceso segun `nvidia-smi`.
- VRAM para ajuste fino: pico de 22,4 GiB con LoRA de rango 16 y AdamW de 8 bits.
- GPU recomendadas: A100 de 40 GB (probada por el autor); no se confirma compatibilidad con GPUs de consumo de 24 GB, dado que el pico de inferencia supera los 21 GiB y el de entrenamiento los 22 GiB.
- Cabe en consumer GPU: no confirmado; por margen de memoria, una RTX 4090 de 24 GB queda muy justa y no esta verificada.
- Tiempo de carga: 20,8 s desde disco local.
- Opciones de despliegue: Unsloth + transformers (version probada 5.15.0), bitsandbytes 0.50.2, peft 0.21.2, accelerate 1.15.0, torch 2.11.0+cu128. Para inferencia, el autor remite al repositorio principal o al GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit (este) | ~29,8B | no disponible | 4-bit NF4 bnb | Apache 2.0 + Muse Model License | Ajuste fino QLoRA |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | ~29,8B | no disponible | BF16 | Apache 2.0 + Muse Model License | Inferencia y ajuste |
| unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit | no disponible | no disponible | 4-bit bnb | no disponible | Ajuste fino QLoRA (referencia) |
| Version GGUF Q4_K_M del modelo base | no disponible | no disponible | Q4_K_M | no disponible | Inferencia local |

No se dispone de datos de rendimiento comparativo con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede inventar respuestas y aceptar premisas falsas, segun las limitaciones declaradas por el autor.
- El conocimiento sobre hechos de 2026 es limitado: solo 7 de 40 aciertos en la muestra evaluada, y 28,8 % en el total de 2.500 preguntas para la version GGUF Q4_K_M.
- Este repositorio esta pensado para entrenamiento, no para inferencia; el autor recomienda usar el repositorio principal o el GGUF para ejecutar el modelo.
- Licencia dual: Apache 2.0 mas Muse Model License, con obligacion de seguir la Muse Glimmer Usage Policy. Parte de los datos de entrenamiento fue escrita por Muse Spark Open, lo que anade restricciones.
- Los usuarios deben ser mayores de 18 anos.
- Nunca deben presentarse las salidas del modelo como escritas por un humano.
- No es un lanzamiento oficial de Meta ni esta respaldado por Meta; Unsloth tampoco lo ha revisado ni respaldado.
- Idiomas soportados no documentados; sesgos conocidos no documentados.
- El modo de muestreo por defecto (temperatura 1.0) puede producir salidas no deterministas; para respuestas greedy hay que pasar `do_sample=False`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
- Modelo base: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Dataset de entrenamiento: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit/blob/main/MUSE_MODEL_LICENSE.md
- Referencia de Unsloth: https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit (revision `ecedda395d4d099b477d135a9a573eedaa5a7aad`)
