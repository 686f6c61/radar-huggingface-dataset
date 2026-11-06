# renatoschust/agentmujo-qwen3.5-9b-bos-gguf

## Resumen

AgentMujo Qwen3.5-9B BOS es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario renatoschust y orientado a function calling en bosnio (`bs`). El modelo se ha entrenado sobre LUMI con un adaptador LoRA de rango 64 que también incluye los embeddings de tokens, durante 200 pasos, y posteriormente se ha fusionado en el checkpoint base en bf16 y cuantizado a GGUF Q8_0. El resultado es un artefacto de aproximadamente 8,9 GB pensado para inferencia local con llama.cpp u Ollama.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo generalista nuevo, sino una especialización idiomática de un modelo de 9B para llamadas a herramientas en bosnio. El autor declara que el "format probe" de 5 casos canónicos de `<tool_call>` pasa al 100%, pero no se ha ejecutado el benchmark completo AgentMujo-Bench de 48 casos, por lo que la evidencia de calidad es limitada.

El modelo hereda la arquitectura y el contexto del Qwen3.5-9B original, si bien la model card no detalla ni la longitud de contexto ni la composición del dataset de entrenamiento más allá de una referencia al subconjunto `joint_v0.43` con 32.660 ejemplos. La licencia Apache 2.0 facilita su uso comercial, aunque la calidad real en producción no está validada por benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de Ollama usa `num_ctx 16384`, no confirmado como máximo) |
| Tipos de cuantizacion | Q8_0 (GGUF); el repo incluye solo el fichero Q8 |
| Idiomas soportados | Bosnio (`bs`) como idioma objetivo del ajuste; capacidades del base no detalladas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `model-q8.gguf`, ~8,9 GB); también existe versión fusionada en bf16 en otro repo |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.5-9B en la revisión `c20223623576` y aplica un adaptador LoRA de rango 64 que incluye además los `embed_tokens`, entrenado durante 200 pasos sobre el subconjunto `joint_v0.43` (32.660 ejemplos) del dataset `shaban2024/agentmujo-joint-01`. El entrenamiento se realizó en LUMI. No se detalla en la información disponible la composición exacta del dataset, la mezcla de idiomas ni si hubo fases de RLHF o DPO.

La conversión a GGUF se hizo con `convert_hf_to_gguf.py --outtype f16 --no-mtp`, generando 427 tensores y un fichero intermedio de 17,9 GB, que después se cuantizó con `llama-quantize` a Q8_0. El flag `--no-mtp` es obligatorio para checkpoints Qwen3.5 según el autor, ya que de lo contrario aparece el error `blk.24 not found`. La innovación técnica destacable es la inclusión de los embeddings en el LoRA, lo que permite adaptar el vocabulario o la representación de tokens al dominio bosnio de function calling sin reentrenar el modelo completo.

## Capacidades

- Generación de texto conversacional en bosnio, heredando las capacidades del Qwen3.5-9B base.
- Function calling / tool calling: el ajuste está específicamente orientado a emitir llamadas en formato `<tool_call>`, con un format probe de 5/5 casos canónicos superado según el autor.
- Integración con llama.cpp y Ollama mediante GGUF, incluyendo ejemplos de uso con `llama-cli` y un Modelfile de Ollama.
- Razonamiento multi-turno y uso como agente: el autor recomienda usar `benchmark/system_spec_bs.txt` del repositorio `agentmujo-training` como system prompt para tool calling.
- Capacidades multilingües: el ajuste está declarado únicamente para bosnio; no hay evidencia de rendimiento en otros idiomas.
- No se documentan capacidades de visión, audio, thinking mode ni decodificación especulativa.

## Casos de uso

- Asistente de soporte técnico en bosnio: el modelo puede gestionar consultas sobre diagnóstico de sistemas (el ejemplo de la model card es "Koji servis troši najviše CPU-a?") y emitir llamadas a herramientas de monitorización, aprovechando el ajuste específico en function calling.
- Automatización de operaciones IT en entornos de habla bosnia: integrado vía Ollama con `num_ctx 16384`, puede recibir contexto de logs o estado de servicios y devolver llamadas estructuradas a APIs internas de reinicio, escalado o consulta.
- Agente conversacional para back-office: al soportar tool calling en bosnio, encaja en flujos donde el usuario final escribe en ese idioma y el sistema necesita invocar funciones (crear tickets, consultar bases de datos) sin un paso intermedio de traducción.
- Despliegue local en estaciones de trabajo: al ser un GGUF Q8 de ~8,9 GB, puede ejecutarse en equipos con GPU de consumo o incluso CPU, útil para prototipos y entornos con requisitos de privacidad.
- Evaluación de pipelines de agentes en idiomas de bajos recursos: sirve como banco de pruebas para medir la calidad de function calling en bosnio frente a modelos multilingües genéricos.
- Base para futuros ajustes: al publicarse el LoRA, el merge bf16 y el GGUF, otros equipos pueden partir de este artefacto para especializaciones adicionales en el mismo idioma o dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado el AgentMujo-Bench completo (48 casos) y que el "format probe" 5/5 solo demuestra el formato de las llamadas, no la calidad global.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa ~8,9 GB; se recomienda al menos 10-12 GB de VRAM para cargar el modelo con contexto moderado, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3090/4090 (24 GB) con holgura, y en GPUs de 12-16 GB con contextos reducidos.
- GPU de consumo: sí, es viable en tarjetas con 12 GB o más; en configuraciones de 8 GB requeriría cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: llama.cpp (`llama-cli`) y Ollama (Modelfile con `FROM ./model-q8.gguf` y `PARAMETER num_ctx 16384`). No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMujo Qwen3.5-9B BOS (este) | ~8,95B | no disponible | bs (ajuste) | Apache 2.0 | GGUF Q8_0 |
| Qwen/Qwen3.5-9B (base) | ~8,95B | no disponible | multilingüe (no detallado) | no disponible en la información | safetensors (formato del base) |
| renatoschust/agentmujo-qwen3.5-9b-bos-lora | ~8,95B (base + LoRA r=64) | no disponible | bs | Apache 2.0 | safetensors (LoRA) |
| renatoschust/agentmujo-qwen3.5-9b-bos (merge bf16) | ~8,95B | no disponible | bs | Apache 2.0 | safetensors (bf16) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de 9B, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Calidad no validada: el autor reconoce que no se ha ejecutado el AgentMujo-Bench completo (48 casos); el 5/5 del format probe solo verifica el formato de `<tool_call>`.
- Ámbito idiomático restringido: el ajuste está declarado solo para bosnio; el rendimiento en otros idiomas no está documentado y podría degradarse respecto al base.
- Riesgo de alucinación: inherente a los modelos de 9B y no cuantificado para este ajuste.
- Sesgos: no se documentan análisis de sesgos; al entrenarse sobre un dataset específico (`joint_v0.43`), puede heredar sesgos de su composición, no detallada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3.5-9B y del dataset de entrenamiento.
- Compatibilidad: requiere `--no-mtp` en la conversión; el repo solo publica Q8_0, sin cuantizaciones menores para GPUs de gama baja.
- Fecha y madurez: el repositorio se creó el 3 de noviembre de 2026 y cuenta con 82 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-gguf
- Adaptador LoRA: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-lora
- Merge bf16: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos
- Dataset: https://huggingface.co/datasets/shaban2024/agentmujo-joint-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
