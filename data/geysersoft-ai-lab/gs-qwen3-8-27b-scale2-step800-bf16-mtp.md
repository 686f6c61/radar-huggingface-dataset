# geysersoft-ai-lab/GS-Qwen3.8-27B-Scale2-Step800-BF16-MTP

## Resumen

GS-Qwen3.8-27B-Scale2-Step800-BF16-MTP es un modelo multimodal de tipo image-text-to-text publicado por geysersoft-ai-lab, derivado del modelo base Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0). Se trata de un fine-tune mediante LoRA de rango 16 aplicado sobre las ultimas 16 de las 64 capas del modelo original, con dos etapas de entrenamiento de 400 pasos cada una (800 pasos acumulados) y exportado como pesos BF16 fusionados en formato safetensors. El checkpoint se distribuye como modelo independiente, no como adaptador MLX.

El modelo conserva la arquitectura original `Qwen3_5ForConditionalGeneration` (tipo `qwen3_5`) e incluye 15 tensores MTP (multi-token prediction) heredados del modelo base, lo que permite decodificacion especulativa si el motor de inferencia lo soporta y se habilita explicitamente. El repositorio ocupa 55,6 GB y contiene 18 shards safetensors con 1.199 tensores y 27.781.427.952 parametros totales.

Su relevancia es limitada y experimental: el propio autor lo marca como candidato de evaluacion, sin comparativa A100 completada frente al checkpoint hijo de 1.200 pasos, sin resultados de benchmarks publicados y sin reclamar que sea el mejor checkpoint. Esta pensado para experimentacion en pipelines de evaluacion controlada, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (`qwen3_5`), transformer multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (publicado solo en BF16; el autor indica que no se realizo cuantizacion para esta publicacion) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 18 shards, 1.199 tensores, incluidos 15 tensores MTP) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal que acepta entrada de imagen y texto. El fine-tune se realizo con LoRA de rango 16 (escala MLX 2, equivalente a alpha 32 estandar) sobre las ultimas 16 de las 64 capas del modelo base. El entrenamiento se dividio en dos etapas de 400 pasos cada una, con estado del optimizador reiniciado en cada etapa, sumando 800 pasos acumulados. El trabajo de entrenamiento de origen esta identificado como `ft_141fef364c9b4222a8239af85fb74f3c`.

La publicacion fusiona los pesos LoRA en BF16 y los exporta como modelo autonomo, sin cuantizacion adicional ni entrenamiento nuevo. Se conservan los 15 tensores MTP originales, lo que habilita multi-token prediction o decodificacion especulativa, pero el autor advierte que la mera presencia de estos tensores no garantiza que el motor de serving los active: requiere soporte explicito del motor y habilitacion manual. El repositorio incluye un `file-manifest.json` con SHA256 y tamano de cada fichero, y un paquete de evaluacion A100 con revisiones congeladas, referencias de tokenizer de Mac, bootstrap de runtime fijado y fixtures sin modificar.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`).
- Razonamiento multimodal heredado del modelo base Qwen3.8-27B.
- Soporte de decodificacion especulativa mediante tensores MTP, condicionado a que el motor de inferencia lo habilite.
- Modo thinking configurable en la plantilla de chat: por defecto se activa si se omite el argumento, por lo que para inferencia sin razonamiento explicito hay que enviar `chat_template_kwargs.enable_thinking=false`.
- Soporte de esquemas de herramientas segun el chat template heredado del modelo base (no se detalla en la model card).
- Capacidades de agente multi-paso: no documentadas en la informacion disponible.

## Casos de uso

- Evaluacion comparativa de checkpoints: el modelo esta disenado como candidato de evaluacion frente al checkpoint hijo de 1.200 pasos, usando el paquete A100 incluido con revisiones congeladas y fixtures identicos. Adecuado para laboratorios que quieran reproducir la comparativa en A100 80GB.
- Investigacion sobre fine-tuning LoRA parcial: permite estudiar el efecto de entrenar solo las ultimas 16 de 64 capas con 800 pasos acumulados sobre un modelo multimodal de 27,8 B.
- Pruebas de decodificacion especulativa MTP: util para validar si un motor de serving concreto activa correctamente los tensores MTP y cuanto speedup aportan en la practica.
- Experimentacion multimodal en ingles y coreano: tareas de descripcion de imagenes, VQA o asistencia conversacional en esos dos idiomas, siempre en entorno controlado.
- Validacion de pipelines de tokenizer y chat template: el paquete incluye referencias de tokenizer de Mac y pruebas de contrato en CPU (22 pasadas), util para verificar integraciones antes de escalar a GPU.
- Base para nuevos fine-tunes: al estar en BF16 y licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales con herramientas estandar de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la comparativa A100 emparejada frente al checkpoint de 1.200 pasos esta pendiente, que las comprobaciones en runtime oMLX sobre Mac no establecen puntuaciones CUDA identicas y que no se reclama ninguna mejora de rendimiento. Las unicas metricas reportadas son pruebas de contrato en CPU: 22 pasadas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y KV cache. El autor confirma que esta exportacion de 55,6 GB no cabe tal cual en una GPU de 24 GB.
- GPU recomendadas: A100 80GB es la plataforma de referencia citada en el paquete de evaluacion. Para BF16 completo se necesita al menos una GPU de 80 GB o reparto multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 24 GB en BF16. Requeriria cuantizacion a 8 o 4 bits, no publicada en este repositorio.
- Opciones de despliegue: transformers (libreria declarada), con soporte de MTP condicionado al motor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor menciona que la decodificacion especulativa via MTP requiere soporte y habilitacion explicita del motor, sin cifras de speedup.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GS-Qwen3.8-27B-Scale2-Step800-BF16-MTP | 27,8 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA parcial, BF16, MTP incluido |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo original del que deriva el fine-tune |
| Checkpoint hijo de 1.200 pasos | no disponible | no disponible | no disponible | Referenciado en la model card | Comparativa A100 pendiente segun el autor |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como candidato de evaluacion: el autor no reclama que sea el mejor checkpoint ni aporta puntuaciones de mejora.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares, ni comparativa A100 completada.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Idiomas limitados a ingles y coreano; no se declara soporte de castellano.
- Longitud de contexto no especificada en la model card.
- El modo thinking se activa por defecto si se omite `chat_template_kwargs.enable_thinking`; en produccion hay que gestionarlo explicitamente para evitar comportamiento no deseado.
- Los tensores MTP no garantizan decodificacion especulativa: depende del motor de serving y de su habilitacion manual.
- El checkpoint no cabe en GPU de 24 GB en BF16; requiere cuantizacion no publicada o hardware de 80 GB.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables por herencia del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y de garantias desaconseja su uso en produccion sin validacion previa.
- La comparativa con el checkpoint de 1.200 pasos queda pendiente de que el usuario aporte un endpoint A100 nuevo, segun el autor.

## Enlaces

- Hugging Face: https://huggingface.co/geysersoft-ai-lab/GS-Qwen3.8-27B-Scale2-Step800-BF16-MTP
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0)
- Paquete de evaluacion A100 (incluido en el repo): evaluation/Qwen27B_A100_800_vs_1200_20261103.zip
- Manifiesto de ficheros: file-manifest.json en el repositorio
