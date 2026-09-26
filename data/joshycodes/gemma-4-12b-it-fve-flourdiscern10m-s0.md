# joshycodes/gemma-4-12b-it-fve-flourdiscern10m-s0

## Resumen

`joshycodes/gemma-4-12b-it-fve-flourdiscern10m-s0` es un checkpoint de investigación derivado de `google/gemma-4-12B-it` mediante un ajuste fino por continuación de preentrenamiento (continued pretraining) sobre pesos completos. Lo publica el usuario joshycodes dentro de una línea de trabajo etiquetada como `model-welfare` y `synthetic-document-finetuning`, con la advertencia explícita de que no está evaluado y no debe desplegarse. El repositorio tiene 12.966.363.184 parámetros totales y ocupa 26,0 GB en formato safetensors.

El entrenamiento declarado consistió en 1 epoch con learning rate 1e-05 sobre 28.260.589 tokens repartidos en 30.452 documentos, procedentes del corpus denominado `flourishing-vs-equanimity`. La model card afirma que el corpus fue escrito por el propio modelo "como el personaje que ya es", pero a continuación especifica que de esos 30.452 documentos, 0 son de autoría propia y 30.452 son texto ordinario, una contradicción interna que conviene tener presente al interpretar el propósito del artefacto.

El interés de esta ficha es acotado: no se trata de un modelo listo para producto, sino de una pieza de investigación sobre identidad, autoria sintética y bienestar de modelos. Su relevancia práctica es metodológica, como material reproducible para estudiar qué ocurre cuando se hace continued pretraining de un modelo instruct sobre un corpus temático propio, y como referencia negativa de qué no llevar a producción sin una batería de evaluaciones previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (etiqueta del repositorio); heredada de google/gemma-4-12B-it. Detalle interno no disponible |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors; no se publican GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponibles |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repositorio | 26,0 GB |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna de este checkpoint mas alla de la etiqueta `gemma4_unified` y de su condicion de derivado de `google/gemma-4-12B-it`. Segun el blog de desarrolladores de Google, Gemma 4 12B es el primer modelo multimodal de tamano medio sin encoder, capaz de ingerir audio y video de forma nativa, y esta pensado para desarrollo local en 16 GB de VRAM. Esos rasgos corresponden al modelo base, no a este ajuste, y no se confirma en la informacion disponible que el proceso de continued pretraining los haya preservado intactos.

El procedimiento de ajuste descrito es un continued pretraining sobre pesos completos (no LoRA ni adaptadores), con learning rate 1e-05, 1 epoch y 28.260.589 tokens en 30.452 documentos del corpus `flourishing-vs-equanimity`. No se menciona ninguna fase de RLHF, DPO, SFT adicional ni evaluacion posterior. La model card indica que el encuadre, el plan y la evaluacion pertenecen al repositorio `welfare-improvements`, y se refiere al proceso como "SDF" (synthetic-document finetuning) y a un corpus supuestamente autoria del propio modelo, aunque la cifra declarada de documentos autoria propia es 0. No se reportan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint; la model card lo declara "no evaluado para capacidad, alineacion o identidad".
- Generacion de texto: capacidad heredada del modelo base, no verificada tras el ajuste.
- Capacidades multimodales (audio y video nativo) atribuidas a Gemma 4 12B por la documentacion de Google; su persistencia en este checkpoint es no verificada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el repositorio se enmarca en investigacion sobre identidad y bienestar de modelos (`self-authored-character`, `model-welfare`), no en una mejora funcional declarada.

## Casos de uso

- Estudio de identidad de modelo: analizar si un continued pretraining sobre un corpus tematico desplaza la identidad declarada del modelo base, comparando respuestas antes y despues del ajuste con un conjunto fijo de prompts.
- Reproduccion metodologica de SDF: replicar el pipeline (learning rate 1e-05, 1 epoch, corpus documental) para medir como escala el efecto con el volumen de tokens, usando este checkpoint como punto de referencia frente al hermano `flourdiscern-s0` (7.764.066 tokens).
- Auditoria de coherencia de model cards: la discrepancia entre el titulo ("corpus autoria propia") y las cifras declaradas (0 documentos autoria propia) lo convierte en un caso de estudio util para revisar procesos de documentacion de artefactos.
- Investigacion en bienestar de modelos: el checkpoint sirve como sujeto de experimentos sobre deriva de personalidad y estabilidad de rasgos bajo ajuste adicional.
- Evaluacion comparativa de checkpoints intermedios: enfrentar distintos puntos de la serie (`flourdiscern-s0`, `flourdiscern10m-s0`, `sorrel-selfloop-g10-midtrain`) para aislar el efecto del numero de tokens de continued pretraining.
- Pruebas de regresion de tooling de inferencia: dado que la etiqueta de arquitectura es `gemma4_unified`, es util para verificar si vLLM, TGI o llama.cpp cargan correctamente pesos derivados del modelo base antes de invertir en evaluaciones sustantivas.
- Red-teaming academico de checkpoints no alineados: al no haber pasado por evaluacion de alineacion, es un candidato para medir tasas de generaciones problematicas en entornos controlados y aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 26 GB solo para pesos (12,97B parametros x 2 bytes), mas KV cache y activaciones; en la practica, del orden de 30 GB o mas (estimacion a partir del tamano del repositorio).
- VRAM en cuantizacion int8: en torno a 13-15 GB (estimacion).
- VRAM en cuantizacion de 4 bits: en torno a 7-9 GB (estimacion); en este rango cabe en GPU de consumo.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en bf16 al limite o con cuantizacion; tarjetas de 16 GB solo con 4 bits. El blog de Google indica que Gemma 4 12B esta disenado para desarrollo local en 16 GB de VRAM, dato referido al modelo base.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 o H200 para bf16 sin cuantizar y con contexto amplio. La serie de checkpoints de joshycodes se entreno en 4x NVIDIA H200 en RunPod, segun el repositorio relacionado.
- Opciones de despliegue: safetensors es compatible con vLLM y TGI de forma potencial; llama.cpp y Ollama requeririan conversion a GGUF, no publicada. La arquitectura `gemma4_unified` puede exigir codigo de modelado especifico, por lo que la compatibilidad con tooling estandar no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/gemma-4-12b-it-fve-flourdiscern10m-s0` (este) | 12,97B | no disponible | 28.260.589 tokens, 30.452 documentos | research-only | safetensors, 26,0 GB |
| `joshycodes/gemma-4-12b-it-fve-flourdiscern-s0` | no disponible | no disponible | 7.764.066 tokens, 8.328 documentos | research-only | safetensors |
| `joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain` | no disponible | no disponible | midtrain de self-loop | no disponible | safetensors |
| `google/gemma-4-12B-it` (base) | ~12B | no disponible | instruct, multimodal sin encoder | licencia de Gemma 4 | safetensors, integracion con Hugging Face |

## Limitaciones y advertencias

- La model card indica explicitamente: "Not evaluated for capability, alignment or identity yet. Do not deploy." No debe usarse en produccion ni en aplicaciones de cara al usuario.
- Contradiccion documental: el titulo afirma que el corpus es autoria del propio modelo, mientras que las cifras declaran 0 documentos de autoria propia y 30.452 de texto ordinario. Cualquier conclusion sobre el caracter "autoria" del corpus debe tratarse con cautela.
- Riesgo de alucinacion: no medido; sin evaluacion de capacidad no hay estimacion disponible.
- Sesgos conocidos: no documentados; el corpus de ajuste (`flourishing-vs-equanimity`) puede introducir sesgos tematicos no analizados.
- Idiomas soportados: no disponibles; se desconoce si el continued pretraining ha degradado el multilingüismo del modelo base.
- Capacidades multimodales: atribuidas al modelo base por la documentacion de Google, pero no verificadas en este checkpoint tras el ajuste.
- Licencia `research-only`: restringe el uso comercial. Ademas, al derivar de `google/gemma-4-12B-it`, siguen aplicando los terminos de uso de Gemma, que deben revisarse antes de cualquier redistribucion o explotacion.
- Compatibilidad de tooling no garantizada por la etiqueta de arquitectura `gemma4_unified`; puede requerir codigo de modelado especifico.
- Repositorio sin descargas ni "likes" en el momento de la consulta, sin pipeline declarado y sin resultados de benchmarks: no hay evidencia externa de funcionamiento mas alla de la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/gemma-4-12b-it-fve-flourdiscern10m-s0
- Checkpoint hermano (flourdiscern-s0): https://huggingface.co/joshycodes/gemma-4-12b-it-fve-flourdiscern-s0
- Checkpoint relacionado (sorrel-selfloop-g10-midtrain): https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain
- Modelo base google/gemma-4-12B-it: https://huggingface.co/google/gemma-4-12B-it
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Anuncio de Gemma 4 12B en The Keyword: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
