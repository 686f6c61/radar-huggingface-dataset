# shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking

## Resumen

Qwen3.5-9B-BOS-Q8-NonThinking es una cuantizacion en GGUF Q8 de un ajuste fino dialectal del modelo base Qwen/Qwen3.5-9B, publicada por el usuario shaban2024 bajo el proyecto "AgentMujo". El modelo esta especializado en bosnio (codigo de idioma `bs`) y orientado a function calling y flujos de agentes, con enfasis en registro dialectal denso. El autor lo etiqueta explicitamente como experimental y no apto para produccion.

El modelo parte de Qwen3.5-9B (arquitectura transformer con hidden size de 4096, 32 capas y vocabulario de 248320 tokens) y se ha afinado mediante SFT con LoRA en varias iteraciones (r16 jt01–jt05, r64 r6401–r6406, gold01 y gold02), incorporando un dataset dialectal denso y ejemplos de comportamiento "ask-first". El resultado se distribuye en formato GGUF Q8, con un tamano de repositorio de 28,6 GB que incluye multiples versiones intermedias.

Su relevancia es acotada pero concreta: demuestra un pipeline de ajuste fino para tool calling en un idioma de bajos recursos como el bosnio, con evaluacion propia (AgentMujo-Bench v0.5) y artefactos reproducibles (adaptadores y repositorio de framework de entrenamiento). No obstante, sus propios numeros lo sitúan por debajo de una variante de 2B del mismo proyecto en la metrica principal de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); hidden size 4096, 32 capas, vocab 248320 |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (GGUF); el repo incluye variantes Q8 de distintas iteraciones |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model-q8-gold02.gguf` y versiones anteriores) |

## Arquitectura y entrenamiento

La base es Qwen3.5-9B, un transformer de 32 capas con hidden size 4096 y vocabulario de 248320 tokens (commit `c20223623`). Sobre esa base, el autor aplica ajuste fino supervisado con LoRA en dos fases de rango: primero r16 sobre los conjuntos jt01–jt05, y despues r64 sobre r6401–r6406 con una mezcla de datos v0.35. En esa fase el techo de tool calling se situaba en 0,60 y solo se alcanzaba con un format-spec explicito, lo que motivo la siguiente iteracion.

La fase gold01 (r64, 4246 filas de dialecto denso) logro que el formato funcionase con el prompt de produccion por defecto, sin format-spec, con un gate de tool de 0,60 y de argumentos de 0,654. La iteracion gold02 (r64, 3910 filas mas 600 ejemplos "ask-first") mejoro el gate de tool a 0,633 y el de argumentos a 0,731, manteniendo safety y refusal en 1,0. No se documentan tecnicas de RLHF/DPO en la informacion disponible, aunque existe un artefacto `model-q8-9b-dpo01.gguf` que sugiere al menos una iteracion con DPO. Los adaptadores se publican en el repo de datasets `shaban2024/agentmujo-adapters` (carpeta `qwen35-9b-gold-02/`).

## Capacidades

- Generacion de texto conversacional en bosnio, con registro dialectal denso.
- Function calling y tool calling: el modelo emite llamadas a herramientas en el formato esperado bajo el prompt de produccion por defecto.
- Generacion de argumentos de herramienta en JSON (metrica `json` de 1,0 en el benchmark propio).
- Razonamiento multi-paso orientado a agentes: la metrica `multi` alcanza 0,667 en AgentMujo-Bench v0.5.
- Comportamiento de seguridad y rechazo: `safety` y `refusal` en 1,0 segun el benchmark del autor.
- Capacidad de confirmacion y de peticion de aclaracion ("ask-first"), aunque con rendimiento limitado (ver limitaciones).
- Capacidad de no invocar herramientas cuando no procede (`notool`), tambien con rendimiento bajo.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking) en la informacion disponible; el sufijo "NonThinking" del nombre sugiere la ausencia de modo thinking, pero no se detalla tecnicamente.

## Casos de uso

- Prototipado de agentes conversacionales en bosnio: el modelo permite validar flujos de tool calling en un idioma de bajos recursos sin partir de un modelo multilingue generico, usando el prompt de produccion por defecto.
- Investigacion sobre ajuste fino dialectal: los adaptadores publicados y el repositorio de framework permiten reproducir las iteraciones gold01/gold02 y experimentar con mezclas de datos.
- Evaluacion de pipelines de function calling: sirve como sujeto de prueba en harnesses que midan gate de tool, generacion de argumentos y formato JSON, gracias a las metricas desagregadas del AgentMujo-Bench.
- Generacion de JSON estructurado para integraciones internas: con una metrica `json` de 1,0 en el benchmark propio, es utilizable en tareas de extraccion o formateo donde el esquema sea fijo.
- Asistencia conversacional de dominio acotado en bosnio: para demos y entornos de staging donde el riesgo de fallo en la decision de invocar herramienta sea aceptable.
- Banco de pruebas para comparativas de cuantizacion: al existir multiples versiones Q8 (v0.1 a v0.6, dpo01, gold01, gold02), permite medir el impacto de cada iteracion de entrenamiento sobre el mismo formato de pesos.

## Benchmarks y rendimiento

Resultados publicados por el autor en AgentMujo-Bench v0.5 (48 casos, prompt de produccion por defecto):

| Metrica | gold02 | gold01 |
|---|---|---|
| Tool (gate) | 0,633 (30) | 0,60 |
| Args | 0,731 (26) | 0,654 |
| Safety | 1,0 | no disponible |
| Refusal | 1,0 | no disponible |
| Confirmation | 0,4 | 0,8 |
| High level | 0,4 | no disponible |
| No tool | 0,25 | no disponible |
| Multi | 0,667 | no disponible |
| JSON | 1,0 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El propio autor indica que la variante de 2B del proyecto (v0.5) alcanza un tool de 0,80, por encima de este 9B.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q8 sobre 8,95 B parametros, el peso ronda los 9,5 GB; se recomienda reservar entre 11 y 13 GB de VRAM para contexto y overhead de inferencia.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB. En A100/H100 el modelo ocupa una fraccion pequena de memoria y deja margen para lotes y contextos largos.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con holgura, y en RTX 3090 (24 GB). En tarjetas de 12 GB el margen es muy ajustado y dependera de la longitud de contexto.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF; vLLM y TGI solo si se convierte o se sirve desde el modelo base en safetensors, ya que el artefacto publicado es GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-BOS-Q8-NonThinking (gold02) | 8,95 B | no disponible | 0,633 (bench propio) | Apache-2.0 | GGUF en HF |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors en HF |
| Qwen3.5-2B-BOS-Q8-NonThinking (v0.5) | no disponible | no disponible | 0,80 (bench propio) | Apache-2.0 (segun repo del autor) | GGUF en HF |

La comparacion con el modelo base carece de datos de tool calling publicados en la informacion disponible. Frente a la variante de 2B del mismo autor, el 9B es inferior en la metrica principal de tool calling (0,633 frente a 0,80), lo que el autor atribuye al entrenamiento dialectal denso.

## Limitaciones y advertencias

- Estado experimental declarado por el propio autor: no apto para produccion.
- Comportamiento "trigger-happy": el entrenamiento con dialecto denso provoca invocaciones de herramienta excesivas; la metrica `notool` es de solo 0,25.
- Capacidad de confirmacion degradada: 0,4 en gold02 frente a 0,8 en gold01, es decir, un retroceso respecto a la iteracion anterior.
- Razonamiento de alto nivel limitado: metrica `high_level` de 0,4.
- Cobertura de idioma restringida a bosnio; no se documenta soporte multilingue.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser un ajuste fino sobre un modelo de 9B, persiste el riesgo habitual en generacion de texto.
- Longitud de contexto no documentada, lo que impide garantizar ventanas largas en despliegue.
- Licencia Apache-2.0 permite uso comercial, pero el estado experimental y las metricas bajas desaconsejan ese uso sin evaluacion propia.
- El repositorio incluye multiples versiones Q8; es necesario seleccionar explicitamente `model-q8-gold02.gguf` para obtener el comportamiento descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/shaban2024
- Adaptadores: https://huggingface.co/shaban2024/agentmujo-adapters
- Repositorio del framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Variante de 2B del mismo proyecto: https://huggingface.co/shaban2024/Qwen3.5-2B-BOS-Q8-NonThinking
