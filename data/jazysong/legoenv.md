# JazySong/LegoEnv

## Resumen

LegoEnv es una familia de checkpoints de ajuste fino orientados a agentes y uso de herramientas, publicados por JazySong junto al trabajo *LegoEnv: Self-Evolving Agentic Environments via Modular Recombination* (arXiv pendiente de identificador). No se trata de un modelo base nuevo, sino de tres checkpoints de parametros completos derivados de la familia Qwen3.5/3.6/3.8-27B, entrenados sobre entornos agénticos generados de forma automatica mediante recombinacion modular de componentes. El objetivo es mejorar la fiabilidad de los modelos en tareas de tool calling multi-turno y en la resolucion de tareas dentro de entornos con verificador programatico.

Los tres checkpoints cubren un espectro de entrenamiento: dos SFT (sobre Qwen3.5-27B y Qwen3.6-27B, con 5.229 y 6.110 trayectorias respectivamente) y uno de GRPO (sobre Qwen3.8-27B, con 1.516 entornos y recompensa binaria de verificador, sin modelo de recompensa ni juez). La propuesta es relevante porque demuestra que el entrenamiento sobre entornos sinteticos auto-evolutivos produce ganancias sustanciales en benchmarks de agentes (por ejemplo, AutomationBench pasa de 3,2 a 23,2 en el checkpoint SFT de Qwen3.5-27B) sin degradar el rendimiento en tool calling estandar (BFCL v4 se mantiene o mejora).

Los checkpoints son de 27B parametros, con contexto de entrenamiento de 64K tokens, licencia Apache-2.0 heredada de las bases Qwen3 y pesos en safetensors compatibles con `transformers`. El repositorio ocupa 273,6 GB, lo que refleja que se distribuyen los tres checkpoints completos en precision de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5/3.6/3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27B (por checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64K tokens en entrenamiento; contexto maximo de inferencia no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints de parametros completos) |

## Arquitectura y entrenamiento

Los checkpoints heredan la arquitectura de las bases Qwen3.5-27B, Qwen3.6-27B y Qwen3.8-27B, sin modificaciones estructurales: son ajustes de parametros completos con el tokenizer y la plantilla de chat originales. El entrenamiento se realizo sobre entornos construidos por LegoEnv, un marco que genera entornos agénticos mediante recombinacion modular de componentes y evolucion automatica, y que constituye la innovacion central del trabajo. El corpus de SFT incluye el corpus de la ronda 1 mas una extraccion de 3.000 trayectorias (5.229 en total) para el checkpoint de Qwen3.5-27B, y el corpus de la ronda 2 (6.110 trayectorias) para el de Qwen3.6-27B.

La receta de SFT usa batch global de 32, learning rate pico de 1e-5 con decaimiento coseno, longitud de secuencia de 64K y 3 epocas (paso 489 y paso 570 respectivamente). Se conserva el razonamiento del profesor a lo largo de los turnos y se excluyen de la perdida los turnos del asistente que recibieron una respuesta de herramienta 4xx, un detalle relevante para no penalizar al modelo por errores de la herramienta. El checkpoint de GRPO parte de la base sin modificar (Qwen3.8-27B), con tamano de grupo 8, temperatura 1.0, 2 epocas sobre 1.516 prompts y recompensa binaria del verificador programatico del entorno, sin modelo de recompensa ni juez LLM; el entrenamiento alcanzo el paso 200.

## Capacidades

- Generacion de texto y razonamiento multi-turno con preservacion del razonamiento de turnos anteriores (`reasoning_content` en mensajes del asistente).
- Tool calling en formato OpenAI function-calling, con soporte para toolsets tipo `api` en entornos de automatizacion.
- Ejecucion de tareas agénticas de varios pasos dentro de entornos con verificador programatico (hasta 50 pasos en el protocolo de evaluacion).
- Manejo de respuestas de error de herramientas (4xx) sin colapso del razonamiento, gracias a la exclusion de esos turnos en la perdida durante el SFT.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modos de pensamiento extendido mas alla del razonamiento multi-turno.

## Casos de uso

- Automatizacion de flujos de trabajo empresariales: el checkpoint GRPO alcanza 40,3 en AutomationBench con toolset `api` y 50 pasos, lo que lo hace adecuado para pipelines donde el agente debe encadenar llamadas a APIs internas y verificar el resultado contra un criterio programatico.
- Integracion con servidores MCP: con 77,6 en MCP-Mark (checkpoint GRPO), el modelo puede actuar como cliente de herramientas MCP en asistentes de desarrollo y operaciones, gestionando 127 tareas de referencia con razonamiento reutilizado entre turnos.
- Agentes de codigo y CI/CD: el soporte de function calling en formato OpenAI permite conectarlo a herramientas de compilacion, tests y despliegue; el contexto de 64K admite historiales largos de ejecucion y logs.
- Evaluacion y benchmarking de entornos agénticos: los tres checkpoints sirven como linea base reproducible para comparar marcos de entornos, ya que el paper reporta resultados con protocolo fijo (AutomationBench 1.0.6, MCP-Mark, BFCL v4).
- Investigacion en RL para agentes: el checkpoint GRPO con recompensa de verificador programatico es un punto de partida para estudiar senales de recompensa sin juez LLM y para reproducir la receta con otros entornos.
- Asistentes de operaciones con verificacion: en tareas donde existe un verificador binario (por ejemplo, comprobacion de estado de un sistema tras una secuencia de acciones), el modelo puede operar en bucle de intento y correccion guiado por el resultado del verificador.
- Despliegue en ingles para soporte tecnico multi-turno: la ventana de 64K y la conservacion del razonamiento entre turnos permiten conversaciones largas con historial de herramientas, aunque el soporte linguistico se limita al ingles.

## Benchmarks y rendimiento

Protocolo: AutomationBench 1.0.6 con toolset `api`, 50 pasos, una rollout por tarea y razonamiento de turnos anteriores reproducido; MCP-Mark con 127 tareas; BFCL v4 con media ponderada oficial. Los valores de AutomationBench son la media de una a cuatro evaluaciones de 600 tareas; MCP-Mark y BFCL v4, media de cuatro evaluaciones.

| Checkpoint | AutomationBench | MCP-Mark | BFCL v4 |
|---|---|---|---|
| Qwen3.5-27B base | 3,2 | 44,9 | 67,6 |
| `qwen3.5-27b-sft` | 23,2 | 60,0 | 67,6 |
| Qwen3.6-27B base | 16,0 | 42,5 | 63,0 |
| `qwen3.6-27b-sft` | 32,0 | 68,5 | 72,4 |
| Qwen3.8-27B base | 37,6 | 73,2 | 71,0 |
| `qwen3.8-27b-grpo` | 40,3 | 77,6 | 72,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 54 GB solo para pesos de un checkpoint de 27B, mas KV cache y activaciones; en la practica se requieren 80 GB o mas por GPU para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en precision completa con contexto de 64K; multiples GPU con tensor parallelism para mayor throughput.
- GPU consumer: no cabe en RTX 4090 (24 GB) en precision completa; se requieren cuantizaciones (no publicadas oficialmente) para intentar desplegar en 2x RTX 4090 o 4x RTX 3090/4090, con perdida de calidad no evaluada.
- Opciones de despliegue: `transformers` es la via documentada; vLLM o TGI son viables si se convierten los pesos y se valida la plantilla de chat, aunque no se documentan en la model card. llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AutomationBench | MCP-Mark | BFCL v4 | Licencia |
|---|---|---|---|---|---|---|
| `qwen3.8-27b-grpo` (LegoEnv) | 27B | 64K (entrenamiento) | 40,3 | 77,6 | 72,0 | Apache-2.0 |
| Qwen3.8-27B base | 27B | no disponible | 37,6 | 73,2 | 71,0 | Apache-2.0 |
| `qwen3.6-27b-sft` (LegoEnv) | 27B | 64K (entrenamiento) | 32,0 | 68,5 | 72,4 | Apache-2.0 |
| Qwen3.6-27B base | 27B | no disponible | 16,0 | 42,5 | 63,0 | Apache-2.0 |

La comparativa natural son las propias bases Qwen3 de las que derivan, ya que la model card no reporta comparaciones con otras familias. Frente a sus bases, el checkpoint GRPO mejora AutomationBench en 2,7 puntos, MCP-Mark en 4,4 y BFCL v4 en 1,0; el checkpoint SFT de Qwen3.6-27B duplica AutomationBench (16,0 a 32,0) y sube BFCL v4 en 9,4 puntos.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion en tool calling: aunque el entrenamiento excluye turnos con respuesta 4xx de la perdida, no se documenta una evaluacion especifica de tasas de llamadas invalidas o argumentos erroneos.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o robustez fuera de los benchmarks agénticos.
- La licencia Apache-2.0 cubre los checkpoints, pero los datos de entrenamiento y el codigo tienen licencias separadas; hay que revisarlas antes de uso comercial del pipeline completo.
- El repositorio de 273,6 GB contiene los tres checkpoints completos; el despliegue en produccion exige planificar almacenamiento y, previsiblemente, conversion a formatos cuantizados no publicados.
- El modelo espera que el razonamiento de turnos anteriores se conserve en la conversacion (`reasoning_content`); omitirlo puede degradar el rendimiento respecto a los numeros reportados.
- Los resultados de benchmarks son los del paper (Table 1) con un protocolo concreto; no hay evaluaciones independientes y el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta.
- El identificador arXiv del paper figura como "TODO" en la model card, por lo que la referencia bibliografica no es verificable aun.

## Enlaces

- Hugging Face: https://huggingface.co/JazySong/LegoEnv
- Dataset: https://huggingface.co/datasets/JazySong/LegoEnv
- Codigo: https://github.com/JazyJiang/LegoEnv
- Paper: arXiv pendiente (identificador no disponible en la model card)
- Modelos base: https://huggingface.co/Qwen/Qwen3.5-27B · https://huggingface.co/Qwen/Qwen3.6-27B · https://huggingface.co/Qwen/Qwen3.8-27B
