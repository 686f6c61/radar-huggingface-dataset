# Ma7ee7/Meet8-0.6B

for short reasoning. Actually the system prompt uses <think>...</think>. And warmup was "/think".

Writing now.

Benchmarks table: include both direct and think accuracy.

For links: 
- https://huggingface.co/Ma7ee7/Meet8-0.6B
- https://huggingface.co/Ma7ee7/Meet8_0.6b (search result)
- https://huggingface.co/Ma7ee7/Meet7_0.6b
- https://featherless.ai/models/Ma7ee7/Meet7_0.6b
- https://llm-explorer.com/...
- https://featherless.ai/models/Ma7ee7/Meet7_0.6b_Exp
- base model https://huggingface.co/Qwen/Qwen3-0.6B-Base

Note the card says created 2026-09-30 — that's in the future relative to now? Anyway, I'll just report.

Now let me draft.

For architecture: "Transformer decoder-only denso (familia Qwen3)". The card title says starting from Qwen3-0.6B-Base. Number of layers etc. not given. I'll say not available for specific details.

For training data: datasets listed. Instruct-Data-7M-Tokens (own), identity (mrfakename/identity), no_robots, CoT-Collection, Short_Thinking-1.7k, gsm8k, ai2_arc. Plus generated FineWeb instruction examples and creative writing.

Alright.

Let me write specs table.

| Arquitectura | Transformer decoder-only denso (basado en Qwen3) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión completa/bfloat16; sin GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el dataset HuggingFaceH4/no_robots es CC BY-NC 4.0) |
| Formato de pesos | safetensors |

I'll write it all out.## Resumen

Meet8-0.6B es un ajuste experimental de posentrenamiento de parametros completos desarrollado por el usuario Ma7ee7, tomando como punto de partida el modelo base Qwen/Qwen3-0.6B-Base. Se trata de un transformer decoder-only denso de aproximadamente 596 millones de parametros (0,6 B), por lo que no emplea arquitectura MoE ni parametros activos diferenciados. El objetivo del autor es dotar a un modelo muy pequeno de un comportamiento conversacional controlado, con un modo de razonamiento opcional activado mediante el prefijo `/think` y un modo de respuesta directa para el resto de consultas.

El entrenamiento combina supervisado (SFT) sobre instrucciones, identidad, chat humano y datos generados, seguido de un ciclo de GRPO (optimizacion de politica con gradiente de recompensa) de parametros completos sobre tareas de matematicas, ciencia y logica, con aproximadamente 3.500 pasos de optimizador de RL. Es relevante ahora porque muestra el esfuerzo de la comunidad por exprimir modelos sub-1B para tareas de razonamiento y agentes ligeros, un nicho con demanda creciente para despliegues en hardware modesto.

La model card es explicitamente honesta sobre sus limites: el autor afirma que la mejora global frente al modelo base no esta establecida, que la escritura creativa puede entrar en bucles de repeticion severos y que el comportamiento de identidad y de `/think` depende fuertemente del system prompt. Los resultados incluidos son diagnosticos propios con 32 preguntas por tarea, no puntuaciones de benchmarks estandar completos, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el dataset de entrenamiento HuggingFaceH4/no_robots se distribuye bajo CC BY-NC 4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa heredada de Qwen/Qwen3-0.6B-Base, con 596 millones de parametros totales. El autor describe el proceso como un posentrenamiento experimental de parametros completos (no un LoRA) sobre el modelo base, lo que implica que se actualizaron todos los pesos del backbone. No se detalla en la informacion disponible el numero de capas, dimension oculta, cabezas de atencion ni el numero exacto de tokens de contexto soportados.

El pipeline de entrenamiento tiene dos fases. La primera es un SFT sobre instrucciones, datos de identidad, chat escrito por humanos, ejemplos de instrucciones generados a partir de FineWeb y escritura creativa generada, junto con un calentamiento que empareja respuestas directas con ejemplos cortos de razonamiento bajo el prefijo `/think`. La segunda fase es un GRPO de parametros completos sobre tareas de matematicas, ciencia y logica, con aproximadamente 3.500 pasos totales de optimizador de RL. Los datasets citados incluyen Ma7ee7/Instruct-Data-7M-Tokens, mrfakename/identity, HuggingFaceH4/no_robots, kaist-ai/CoT-Collection, Ba2han/Short_Thinking-1.7k, openai/gsm8k y allenai/ai2_arc. La propia model card advierte que no se proporciona una auditoria completa de procedencia ni de solapamiento entre datasets.

Como innovacion destacable, el modelo implementa un modo de razonamiento controlado por prompt: si el mensaje del usuario empieza por `/think`, debe emitir una explicacion breve dentro de las etiquetas `<think>...</think>` y la respuesta final fuera de ellas; en caso contrario, responde directamente sin etiquetas. El autor indica que el system prompt recomendado mejora sustancialmente el cumplimiento de identidad y de modo de razonamiento.

## Capacidades

- Generacion de texto conversacional en formato de chat multi-turno.
- Razonamiento en modo dual: respuesta directa o modo `/think` con explicacion intermedia entre etiquetas.
- Matematicas basicas y aritmetica, con mejora notable en modo think segun los diagnosticos del autor (56,25% directo frente a 84,38% en modo think en la tarea de aritmetica).
- Ciencia elemental y logica procedimental.
- Escritura creativa (con riesgo documentado de bucles de repeticion).
- Identidad de modelo definida por prompt (`You are Meet8-0.6B, developed by Ma7ee7`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modo `/think` es el unico mecanismo de razonamiento descrito.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: por su tamano de 0,6 B, se puede desplegar en una unica GPU de consumo o incluso en CPU para validar flujos conversacionales antes de escalar a modelos mayores.
- Experimentacion academica con GRPO: sirve como banco de pruebas reproducible para estudiar como el RL con recompensa sobre matematicas y logica afecta a un modelo sub-1B.
- Demostracion de modos de razonamiento controlados por prompt: util para investigar como separar respuesta directa y cadena de pensamiento sin reentrenar, usando el prefijo `/think`.
- Aulas y talleres de ajuste fino: su tamano y el pipeline documentado (SFT + GRPO) lo hacen apto para ensenar tecnicas de posentrenamiento con recursos limitados.
- Tareas de aritmetica y ciencia escolar en modo think: con un 84,38% en aritmetica y 84,38% en ARC-Easy en los diagnosticos del autor, es razonable para asistentes educativos simples en esos dominios acotados.
- Evaluacion de robustez de logica formal: los diagnosticos sobre RuleTaker y caballeros y escuderos (53,13% y 28,13% en modo directo) permiten usarlo como sujeto de estudio para medir donde falla el razonamiento de modelos pequenos.
- Bases para investigacion en identidad y adherencia a system prompts: el modelo esta especificamente entrenado para respetar una identidad definida, lo que resulta util para estudiar inyeccion de identidad.

## Benchmarks y rendimiento

Los siguientes datos provienen de diagnosticos internos del autor, con 32 preguntas por tarea y modo, en evaluacion greedy sobre un conjunto reservado pequeno. No son puntuaciones de benchmarks estandar de splits completos y las particiones directa y think pueden contener preguntas distintas.

| Tarea | Precision directa | Precision en modo think |
|---|---:|---:|
| GSM8K | 12,50% | 37,50% |
| ARC-Easy | 81,25% | 84,38% |
| Aritmetica | 56,25% | 84,38% |
| Logica procedimental | 56,25% | 50,00% |
| RuleTaker | 53,13% | 46,88% |
| Caballeros y escuderos | 28,13% | 15,63% |
| Countdown | 3,13% | 0,00% |

El autor indica que no dispone de una comparacion estandarizada exitosa entre el modelo base y Meet8, por lo que no puede confirmarse una mejora global.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: en torno a 1,2-1,5 GB solo para pesos, mas la sobrecarga de activaciones y cache KV (dependiente del contexto).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,6-0,9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,4-0,6 GB para pesos.
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o ejecucion en CPU con memoria RAM suficiente.
- GPU de datacenter (A100, H100) no son necesarias para este tamano; se usarian solo para lotes grandes o entrenamiento.
- Opciones de despliegue: transformers (libreria principal del repositorio), text-generation-inference segun las etiquetas del repo, y endpoints compatibles. Para llama.cpp u Ollama seria necesario disponer o generar una conversion a GGUF, que no esta confirmada en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Meet8-0.6B | ~0,6 B (596 M) | no disponible | SFT + GRPO de parametros completos sobre Qwen3-0.6B-Base | no disponible | Modo `/think` y respuesta directa; diagnosticos propios |
| Meet7_0.6B | ~0,6 B | 40K segun LLM Explorer | LoRA sobre Qwen3-0.6B, <10 min con 600 muestras, no razonador | no disponible | Del mismo autor; enfocado a tareas zero-shot y few-shot |
| Meet7_0.6b_Exp | ~0,8 B | no disponible | Continuacion del fine-tune de Meet7 con learning rate mas bajo | no disponible | Optimizado para sentido comun (HellaSwag, PIQA, Winogrande) |
| Qwen3-0.6B-Base | ~0,6 B | 32.768 tokens (segun el modelo base de la familia) | Modelo base sin posentrenamiento instructivo | segun Qwen | Punto de partida de Meet8; sin modo conversacional |

Nota: los datos de contexto y de licencia de los modelos comparados no estan confirmados en la informacion proporcionada para Meet8; se indican solo cuando aparecen en las fuentes consultadas.

## Limitaciones y advertencias

- La escritura creativa puede entrar en bucles de repeticion severos segun admite el propio autor.
- Las explicaciones de razonamiento pueden ser incorrectas aunque parezcan plausibles, un riesgo claro de alucinacion en el modo `/think`.
- El comportamiento de identidad y de `/think` depende fuertemente del system prompt; sin el prompt recomendado la adherencia cae.
- La mejora global frente al modelo base no ha sido establecida por el autor.
- Los resultados publicados son diagnosticos personalizados con 32 preguntas por tarea, no benchmarks estandar completos; no deben compararse directamente con puntuaciones oficiales.
- Las particiones directa y think pueden contener preguntas diferentes, lo que limita la comparabilidad interna de los numeros.
- Licencia no disponible: el repositorio no declara licencia, y los datos de entrenamiento incluyen HuggingFaceH4/no_robots bajo CC BY-NC 4.0, lo que puede restringir el uso comercial. Hay que consultar las licencias de los modelos y datasets de origen antes de reutilizarlo.
- No se proporciona una auditoria completa de procedencia ni de solapamiento de los datos de entrenamiento.
- Idiomas soportados no documentados, lo que impide garantizar comportamiento multilingue.
- Longitud de contexto no documentada, factor critico para planificar despliegues con historiales largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ma7ee7/Meet8-0.6B
- Variante con guion bajo en el nombre: https://huggingface.co/Ma7ee7/Meet8_0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Meet7_0.6b (modelo previo del mismo autor): https://huggingface.co/Ma7ee7/Meet7_0.6b
- Meet7_0.6b en Featherless: https://featherless.ai/models/Ma7ee7/Meet7_0.6b
- Meet7_0.6b_Exp en Featherless: https://featherless.ai/models/Ma7ee7/Meet7_0.6b_Exp
- Meet7 0.6B en LLM Explorer: https://llm-explorer.com/model/Ma7ee7%2FMeet7_0.6b,5S0G9mnztyxK0pz5yFZN9B
- Dataset de identidad: https://huggingface.co/datasets/mrfakename/identity
- Dataset HuggingFaceH4/no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset kaist-ai/CoT-Collection: https://huggingface.co/datasets/kaist-ai/CoT-Collection
- Dataset Ba2han/Short_Thinking-1.7k: https://huggingface.co/datasets/Ba2han/Short_Thinking-1.7k
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Dataset allenai/ai2_arc: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset Ma7ee7/Instruct-Data-7M-Tokens: https://huggingface.co/datasets/Ma7ee7/Instruct-Data-7M-Tokens
