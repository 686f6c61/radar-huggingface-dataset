# OccultAI/MN-Nazgul-12B-v1

## Resumen

MN-Nazgul-12B-v1 es un modelo de lenguaje de 12 mil millones de parámetros desarrollado por OccultAI, creado mediante la fusión de seis modelos base de la familia Mistral Nemo utilizando el método *della* (arxiv 2406.11617) implementado en mergekit. El modelo está orientado a la escritura creativa, la ficción narrativa y el roleplay, con un enfoque deliberadamente "sin censura" que evita rechazos y permite generar contenido explícito, violento u ocultista sin necesidad de jailbreaks.

La relevancia de este modelo radica en su capacidad para combinar las fortalezas de varios modelos especializados en narrativa, roleplay y generación de texto creativo, manteniendo la arquitectura MistralForCausalLM y un formato de pesos safetensors. Está diseñado para funcionar con plantillas de chat ChatML o Mistral Tekken/NonTekken, y aunque su contexto largo puede degradarse, es una opción interesante para aplicaciones de ficción interactiva y generación de historias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM |
| Parametros totales | 12B (estimado por nombre y arquitectura Mistral Nemo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado; Mistral Nemo base soporta 128k, pero el merge puede degradarse con contextos largos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de seis modelos preentrenados, todos basados en Mistral Nemo de 12B, utilizando el metodo *della* (Dense and Low-rank Adaptation) con `Retreatcost/Mistral-Nemo-Base-2407-ChatML` como base. La configuracion YAML especifica pesos por capa (0.2 para `lm_head` y `embed_tokens`, 0.4 para el resto), densidad 0.9, epsilon 0.09, y salida en bfloat16. El tokenizador se toma de `shrugging-shoulders/Amberlight-Lux-12B` con plantilla de chat ChatML.

Los modelos fusionados incluyen DarkArtsForge/MN-Raven-12B-v1, IggyLux/MN-VelvetCafe-RP-12B-V2, OccultAI/MN-Morpheus-12B-v1, WokeAI/Tankie-DPE-12B-SFT-v2 y Amberlight-Lux-12B. Los datasets listados en la model card (Poe_v1, Morpheus-12B-v1, Dans-Taskmaxx, Dans-Prosemaxx-Gutenberg, Dans-Toolmaxx-ShellCommands, ifeval_multilang, polititune-tankie-warmup-3) sugieren un entrenamiento orientado a tareas de escritura, tool use y seguimiento de instrucciones, aunque no se detalla el proceso de entrenamiento especifico ni el numero de tokens.

## Capacidades

- Generacion de texto creativo: ficcion, ciencia ficcion, romance, terror, paranormal y otros generos.
- Roleplay (RP) y narracion interactiva con prosa vivida y descriptiva.
- Continuacion de escenas y generacion de tramas y subtramas.
- Soporte de tool calling potencial (por los datasets Dans-Toolmaxx-ShellCommands), aunque no esta confirmado en la documentacion.
- Capacidad de seguir instrucciones en ingles (datasets ifeval_multilang).
- Modelo "uncensored": no produce rechazos y puede generar contenido explicito, violento u ocultista.
- Compatible con plantillas de chat ChatML y Mistral Tekken/NonTekken.

## Casos de uso

- Escritura de ficcion creativa: el modelo puede generar capitulos completos, dialogos y descripciones vividas, aprovechando su entrenamiento en prosa narrativa y su capacidad para mantener coherencia en historias largas.
- Roleplay interactivo: ideal para juegos de rol por texto, donde el modelo interpreta personajes y responde a las acciones del usuario con estilo narrativo y sin censura.
- Generacion de guiones y dialogos: puede producir guiones para teatro, cine o videojuegos, con control sobre el tono y el genero.
- Creacion de contenido para juegos de mesa o aventuras de texto: el modelo puede generar misiones, encuentros y descripciones de escenarios.
- Asistente de escritura para autores: ayuda a superar bloqueos creativos, sugiriendo tramas, subtramas o continuaciones de escenas.
- Simulacion de conversaciones con personajes historicos o ficticios: gracias a su capacidad de roleplay y su entrenamiento en temas ocultistas y paranormales, puede interpretar personajes de ficcion o figuras esotericas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 12B en precision FP16 se necesitan aproximadamente 24 GB de VRAM; en cuantizacion de 8 bits unos 12 GB; en 4 bits unos 6 GB. Estas cifras son estimaciones generales y no estan confirmadas por el autor.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o superiores para FP16; GPUs consumer como RTX 3090/4090 pueden ejecutar el modelo con cuantizacion 4-bit u 8-bit.
- Opciones de despliegue: compatible con transformers, text-generation-inference y endpoints compatibles. Se puede usar con vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF (no disponibles actualmente para este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MN-Nazgul-12B-v1 | 12B | No especificado | Apache 2.0 | Escritura creativa, RP, sin censura |
| Mistral Nemo Base 2407 | 12B | 128k | Apache 2.0 | Modelo base generalista |
| MN-Raven-12B-v1 | 12B | No especificado | Apache 2.0 | Escritura creativa (uno de los modelos base) |
| MN-VelvetCafe-RP-12B-V2 | 12B | No especificado | Apache 2.0 | Roleplay (uno de los modelos base) |

No se dispone de datos de rendimiento comparativo. La comparativa se basa en la informacion publica de los modelos base.

## Limitaciones y advertencias

- El modelo puede generar contenido explicito, violento o grafico, incluyendo erotismo, lo que requiere ajustar el system prompt y considerar el publico objetivo.
- Puede tener problemas con contextos largos, degradando la coherencia en conversaciones extensas.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- Al ser un merge "uncensored", no tiene mecanismos de rechazo, lo que puede generar respuestas inapropiadas en entornos no controlados.
- No se han publicado benchmarks ni evaluaciones de sesgos, por lo que se desconoce su comportamiento en tareas de razonamiento o matematicas.
- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar aun disponibles o el modelo podria estar en fase de publicacion.

## Enlaces

- HuggingFace: https://huggingface.co/OccultAI/MN-Nazgul-12B-v1
- Paper del metodo della: https://arxiv.org/abs/2406.11617
- Repositorio de mergekit: https://github.com/cg123/mergekit
