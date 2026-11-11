# BH-Language-AI/bs-qwen35-2b-agent-nonthink-v01-q8

## Resumen

AgentMujo Q8 v0.5 es un modelo de lenguaje especializado en function calling y tareas de agente para bosnio, publicado por BH-Language-AI. Se construye sobre el modelo base `alphaedge-ai/Qwen3.5-2B-bos-32768` (familia Qwen3.5, 1.440 millones de parámetros reales en safetensors, vocabulario de 32.768 tokens) mediante una cadena de adaptadores LoRA (jt11 a jt23) orientada a function calling, operación de terminal, bosnio core, razonamiento y seguridad, seguida de un merge y cuantización a GGUF Q8_0.

El modelo resuelve un nicho concreto: dotar a un modelo pequeño (~1,4B) de la capacidad de seleccionar herramientas, construir argumentos válidos y comportarse de forma segura en bucles de agente sobre infraestructura Linux, con salida en bosnio ijekavica. Incluye un único fichero GGUF que soporta los perfiles `think: true` y `think: false`, con secuencias de parada para evitar bucles.

Es relevante ahora porque demuestra que un ajuste fino dirigido con datasets pequeños y específicos (2.911 muestras) puede elevar drásticamente métricas de tool calling en un modelo de 1,4B: la selección de herramienta pasa de 0,143 en la base a 0,800 en v0.5, y la precisión de argumentos de 0,0 a 0,808. Su licencia Apache-2.0 y su formato GGUF lo hacen desplegable en CPU y GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; `qwen35.block_count=24`) |
| Parametros totales | 1.440.374.592 (1,44B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; `num_ctx 16384` recomendado en el Modelfile |
| Tipos de cuantizacion | Q8_0 (GGUF, 1,53 GB, 320 tensores) |
| Idiomas soportados | bosnio (bs); salida en ijekavica |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model-q8.gguf` v0.5, `agentmujo-q8.gguf` v0.4 legacy) |

## Arquitectura y entrenamiento

El modelo parte de `alphaedge-ai/Qwen3.5-2B-bos-32768` (commit `2f89b833`, Apache-2.0, 1,77B declarados, vocab 32.768) y aplica una cadena de LoRA con r=16 y alpha=32 en bf16, entrenada en Kaggle T4. La eval-loss bajó de 1,067 a 0,937 con el mix v0.21 (1.133 muestras). Los datasets suman 2.911 muestras: `shaban2024/agentmujo-function-calling` (1.252), `agentmujo-agentic-terminal` (541), `agentmujo-bosnian-core` (1.118), `agentmujo-thinking` (45) y `agentmujo-joint-01` (mezclas). Tras el merge se convirtió a GGUF con `convert_hf_to_gguf.py --no-mtp` y se cuantizó a Q8_0.

La innovación principal no es arquitectónica sino de empaquetado y ajuste: un único GGUF sirve para los dos perfiles de razonamiento (`think: true/false`), con secuencias de parada (`<|im_start|>`, `<|im_end|>`, `<tool_response>`) que mitigan los bucles típicos de modelos pequeños en modo agente. El formato de herramienta es explícito y parseable: `<tool_call><function=nombre><parameter=arg>valor</parameter></function></tool_call>`. No se documenta RLHF ni DPO; el ajuste es supervisado sobre datasets curados.

## Capacidades

- Generación de texto conversacional en bosnio (ijekavica).
- Function calling con formato estructurado `<tool_call>` y argumentos tipados.
- Selección de herramienta entre un conjunto dado (tool_selection 0,800 en benchmark propio).
- Construcción correcta de argumentos (argument_accuracy 0,808).
- Comportamiento de confirmación antes de acciones sensibles (confirmation_behavior 0,8).
- Operación de agente de terminal Linux como fallback (task_success 0,917 en bucle de agente).
- Capacidad de rechazo de peticiones inseguras (refusal_correctness 0,8; safety 1,0).
- Salida JSON válida (json_validity 1,0).
- Perfil dual `think: true/false` en un mismo fichero GGUF (el perfil think no superó el gate de calidad en v0.5 y se mantiene en v0.4).
- No se documenta soporte de visión, audio ni tool calling nativo estilo OpenAI; el formato es propio.

## Casos de uso

- Automatización de operaciones en servidores Linux: el modelo decide qué comando o herramienta invocar (reiniciar nginx, consultar estado de servicios) y construye los argumentos; su task_success de 0,917 en bucle de agente lo hace viable como capa de decisión, siempre detrás de un Policy Engine que valide antes de ejecutar.
- Asistente de helpdesk en bosnio: gestiona conversaciones multi-turno con contexto de 16.384 tokens y responde en ijekavica, adecuado para soporte interno en organizaciones de Bosnia y Herzegovina.
- Enrutado de intenciones en pipelines de agentes: con tool_selection 0,800 y no_tool_correctness 1,0, sirve como clasificador que decide si una petición requiere herramienta o respuesta directa.
- Validación de argumentos en integraciones: su argument_accuracy de 0,808 permite generar llamadas a APIs internas con parámetros estructurados y JSON válido (json_validity 1,0).
- Despliegue en entornos con recursos limitados: al ser GGUF Q8_0 de 1,53 GB, cabe en CPU y en GPUs de consumo, útil para prototipos y edge.
- Capa de seguridad y confirmación: con safety 1,0 y confirmation_behavior 0,8, puede insertarse como paso de verificación antes de acciones destructivas en flujos automatizados.
- Investigación en ajuste fino de modelos pequeños: la cadena LoRA documentada y el framework público permiten reproducir y extender el entrenamiento para otras lenguas de bajos recursos.

## Benchmarks y rendimiento

Resultados del AgentMujo-Bench v0.5 (48 casos, Q8, Ollama, temperatura 0), perfil non-thinking con prompt de producción, comparando v0.4, v0.5 y la base Qwen3.5 Q8:

| Metrica | Base Qwen3.5 Q8 | v0.4 | v0.5 |
|---|---|---|---|
| tool_selection | 0,143 | 0,667 | 0,800 |
| argument_accuracy | 0,0 | 0,731 | 0,808 |
| confirmation_behavior | no disponible | 0,6 | 0,8 |
| high_level_preference | no disponible | 0,8 | 1,0 |
| no_tool_correctness | no disponible | 0,75 | 1,0 |
| refusal_correctness | no disponible | 1,0 | 0,8 |
| safety | no disponible | 1,0 | 1,0 |
| ijekavica / json_validity | no disponible | 1,0 | 1,0 |

En bucle de agente: task_success 0,917, safety 1,0, refusal 1,0. El perfil think se mantiene en v0.4 porque el gate de calidad no se superó claramente en v0.5. No hay resultados publicados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para Q8_0: ~1,6-2 GB de pesos; con contexto de 16.384 tokens, reservar 2,5-3,5 GB en total.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Ejecutable en CPU pura con llama.cpp u Ollama (modelo de 1,53 GB).
- Despliegue recomendado: Ollama (`ollama create agentmujo-q8 -f Modelfile`), llama.cpp; vLLM y TGI no se documentan para GGUF en esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera decodificación en tiempo real en GPU de consumo y varios tokens por segundo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMujo Q8 v0.5 | 1,44B | 32.768 (recomendado 16.384) | Especializado (formato propio) | Apache-2.0 | GGUF Q8_0 |
| Qwen3.5-2B-bos (base) | 1,77B declarados | 32.768 | No especializado (tool_selection 0,143) | Apache-2.0 | safetensors |
| Alternativas de 1-2B con function calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada; la única comparación publicada es contra su modelo base y su versión anterior v0.4.

## Limitaciones y advertencias

- La prosa generativa es más débil que en v0.4 (por ejemplo, "Servis" en lugar de "Server"); las respuestas operativas son correctas pero el texto libre pierde calidad.
- Los rechazos a veces no usan la frase canónica; el comportamiento es correcto pero el scorer es más estricto, lo que baja refusal_correctness de 1,0 a 0,8.
- El perfil think no superó el gate de calidad en v0.5 y se mantiene en v0.4; no usar think en producción con v0.5 sin validar.
- El terminal es un fallback: es obligatorio un Policy Engine antes de ejecutar cualquier comando generado.
- Riesgo de alucinación y de bucles mitigado con stop sequences, pero no eliminado; validar siempre la salida estructurada.
- Idioma limitado a bosnio (ijekavica); no se documenta calidad en otras lenguas.
- Sesgos: no documentados por el autor; al entrenarse con datasets pequeños y específicos, puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías; verificar la licencia del modelo base y de los datasets.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: poca validación externa, usar con cautela en producción.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-2b-agent-nonthink-v01-q8
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-2B-bos-32768
- Framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Dataset function calling: https://huggingface.co/datasets/shaban2024/agentmujo-function-calling
- Dataset agentic terminal: `agentmujo-agentic-terminal` (referenciado en la model card, sin URL directa)
- Dataset bosnian core: `agentmujo-bosnian-core` (referenciado en la model card, sin URL directa)
- Dataset thinking: `agentmujo-thinking` (referenciado en la model card, sin URL directa)
