# joshycodes/fd-qwen3.5-9b-self_st-s1

## Resumen

`joshycodes/fd-qwen3.5-9b-self_st-s1` es un checkpoint publicado en HuggingFace por el usuario `joshycodes`, derivado de la familia Qwen 3.5 de 9B (el identificador incluye explicitamente `qwen3.5-9b` y la etiqueta de arquitectura es `qwen3_5`). El repositorio contiene pesos en formato safetensors con un total de 9.653.104.368 parametros reales, lo que situa al modelo en la categoria de ~9,65B. El tamano del repositorio es de 19,3 GB, coherente con un almacenamiento en precision bf16/fp16 (aproximadamente 2 bytes por parametro).

El nombre del checkpoint sugiere un ajuste posterior sobre el modelo base: `fd` podria corresponder a la familia "feather" del mismo autor, `self_st` a un proceso de autoentrenamiento o estudio propio, y `s1` a una variante de razonamiento. No obstante, la model card del repositorio no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el pipeline de entrenamiento, la composicion de datos ni la licencia. El modelo acumula 15 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 4 de octubre de 2026.

Se trata de un checkpoint de investigacion, no de un modelo con soporte oficial documentado. Esto es relevante para desarrolladores e investigadores porque el ecosistema Qwen 3.5 de 9B se esta posicionando como una opcion eficiente para despliegue en GPU de consumo (segun guias externas, cabria en torno a 6,6 GB cuantizado), pero cualquier uso de esta variante concreta exige validar primero su comportamiento, licencia y calidad, dado que carece de ficha tecnica publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, etiqueta `qwen3_5`); detalles concretos no disponibles |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados presumiblemente en bf16/fp16; el repositorio ocupa 19,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna de este checkpoint concreto. El modelo pertenece a la familia Qwen 3.5, segun la etiqueta `qwen3_5` y el identificador `qwen3.5-9b`, y los resultados de busqueda sobre el ecosistema Qwen 3.5 mencionan una base unificada de vision-lenguaje con entrenamiento de fusion temprana sobre billones de tokens multimodales. Sin embargo, no esta confirmado que este checkpoint herede dichas capacidades, ni que conserve el encoder visual.

Respecto al entrenamiento, la unica referencia directa es el patron de publicaciones del mismo autor: un checkpoint hermano (`qwen3.5-9b-feather-f3-mt`) describe un entrenamiento continuado sobre pesos completos (lr 1e-05, 1 epoch, 8.309.133 tokens, 8.591 documentos) a partir de `Qwen/Qwen3.5-9B`. No hay confirmacion de que este repositorio (`self_st-s1`) siga el mismo procedimiento, ni datos sobre RLHF, DPO, SFT o cualquier otra fase de alineamiento. No se han documentado innovaciones tecnicas especificas para esta variante.

## Capacidades

- Generacion de texto: capacidad presumible por herencia del modelo base, no verificada en este checkpoint.
- Razonamiento y matematicas: la etiqueta `s1` podria sugerir una variante orientada a razonamiento, pero no hay confirmacion en la informacion disponible.
- Generacion de codigo: no confirmada para este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision: no confirmada; la familia Qwen 3.5 base incorpora vision-lenguaje, pero no se puede asumir para esta variante.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

Dado que la model card no esta publicada y no hay benchmarks ni licencia confirmada, los casos de uso son potenciales y requieren validacion previa:

- Investigacion sobre autoentrenamiento y destilacion: el nombre `self_st` sugiere un experimento de autoentrenamiento; podria utilizarse como sujeto de estudio para analizar como un modelo de 9,65B se comporta tras un ciclo de datos autogenerados, comparandolo con el modelo base.
- Evaluacion comparativa de checkpoints de la comunidad: util como punto de comparacion frente a otros fine-tunes de Qwen 3.5 9B del mismo autor (`feather-f3-mt`, `sft-control-lora`) para medir el efecto de distintas estrategias de ajuste.
- Despliegue en GPU de consumo para pruebas: con ~9,65B parametros, el modelo cuantizado a 4 bits cabria en GPUs de 8-12 GB, lo que permitiria prototipado local sin infraestructura dedicada.
- Fine-tuning adicional como base: al ser un checkpoint de 9,65B en safetensors, podria servir como punto de partida para ajustes especificos de dominio, siempre que la licencia lo permita (actualmente no disponible).
- Analisis de sesgos y seguridad en modelos derivados: util para estudiar como los ajustes de la comunidad afectan al comportamiento del modelo base en terminos de alucinacion y sesgo.
- Pipeline de generacion de texto en entornos controlados: si se valida su calidad, podria integrarse en tareas de resumen o redaccion asistida en local, sin depender de APIs externas.
- Benchmarking de cuantizacion: comparar la degradacion de calidad entre bf16 y cuantizaciones GGUF/AWQ en un modelo de ~9,65B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 19-20 GB solo para pesos, mas overhead de KV cache y activaciones (orientativo 22-26 GB segun contexto y batch).
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5,5-6,5 GB de pesos, lo que permitiria ejecucion en GPUs consumer de 8 GB con contexto reducido.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S, RTX 4090 24 GB (justa para bf16 con contexto corto).
- GPU consumer: cabe en RTX 3090/4090 (24 GB) en bf16 con contexto moderado; en RTX 3060 12 GB, RTX 4070 o superiores solo con cuantizacion de 4-8 bits.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF; vLLM y TGI para safetensors en precision completa o cuantizacion compatible; transformers como via directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `joshycodes/fd-qwen3.5-9b-self_st-s1` | 9,65B | no disponible | no disponible | HuggingFace (15 descargas) | Checkpoint de investigacion sin model card |
| `joshycodes/qwen3.5-9b-feather-f3-mt` | ~9,65B (presumible) | no disponible | no disponible | HuggingFace | Entrenamiento continuado sobre corpus autogenerado (8,3M tokens) |
| `joshycodes/Qwen3.5-9B-sft-control-lora` | adaptador LoRA sobre 9B | no disponible | no disponible | HuggingFace | Variante de control SFT |
| `Qwen/Qwen3.5-9B` (base) | ~9B | no disponible en la busqueda | no disponible en la busqueda | HuggingFace / Fireworks AI | Modelo base oficial de la familia Qwen 3.5 |

No se dispone de datos de rendimiento comparativos entre estas variantes; la comparacion es estructural (tamano, origen, tipo de ajuste) y no de calidad.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, proceso de alineamiento ni evaluacion, lo que impide garantizar el comportamiento del modelo.
- Licencia no disponible: no se puede confirmar si se permite uso comercial, redistribucion o modificacion. Tratar como no apto para produccion comercial hasta verificarlo.
- Riesgo elevado de alucinacion: sin datos de RLHF/DPO confirmados, no hay garantia de calibracion ni de adherencia a instrucciones.
- Idiomas no especificados: no se puede asumir cobertura multilingue ni calidad en castellano.
- Contexto desconocido: no se puede planificar el diseno de aplicaciones con ventanas largas sin conocer la longitud soportada.
- Sesgos potencialmente amplificados: al ser un ajuste sobre datos posiblemente autogenerados (`self_st`), los sesgos del modelo base podrian reforzarse en lugar de corregirse.
- Trazabilidad limitada: 15 descargas y 0 likes indican practicamente nula validacion por parte de la comunidad.
- Reproducibilidad: sin documentacion del proceso de entrenamiento, los resultados no son reproducibles ni auditables.
- Compatibilidad: al no especificarse el tokenizer ni la configuracion, la integracion en frameworks (vLLM, TGI, llama.cpp) requerira conversion y pruebas manuales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/joshycodes/fd-qwen3.5-9b-self_st-s1
- Checkpoint relacionado (entrenamiento continuado): https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt
- Adaptador LoRA de control SFT relacionado: https://huggingface.co/joshycodes/Qwen3.5-9B-sft-control-lora
- Repositorio GitHub de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Qwen3.5 9B en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3p5-9b
- Guia de despliegue de Qwen 3.5 9B en GPU de 8 GB: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
