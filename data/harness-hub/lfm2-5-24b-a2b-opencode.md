# harness-hub/LFM2.5-24B-A2B-opencode

## Resumen

LFM2.5-24B-A2B-opencode es un adaptador LoRA publicado por harness-hub sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un transformer de tipo Mixture of Experts con 24.000 millones de parametros totales y 2.000 millones activos por token. El adaptador se ha entrenado con aprendizaje por refuerzo (GRPO asincrono, implementado en TRL) para funcionar como el modelo subyacente del agente de codigo OpenCode en tareas de analisis de datos. No es un modelo completo: es un conjunto de pesos delta que debe cargarse sobre el modelo base.

El problema que aborda es la eficiencia de los agentes: cada rollout de entrenamiento es una sesion completa de OpenCode en un sandbox remoto, donde el agente lee la tarea, ejecuta herramientas de shell y Python contra los ficheros de datos y responde; un verificador califica la respuesta y esa senal alimenta el entrenamiento. El resultado declarado es una tasa de exito practicamente identica a la del modelo base (84,0 % frente a 82,7 % en 150 tareas retenidas) con un 30 % menos de llamadas a herramientas en las tareas que ambos resuelven.

Es relevante ahora porque demuestra un patron de entrenamiento de agentes con RL asincrono sobre entornos reales y porque reduce el coste operativo (menos tool calls) sin degradar la precision en la familia de tareas objetivo. El repositorio es pequeno (0,1 GB) y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (modelo base); adaptador LoRA sobre capas lineales |
| Parametros totales | 24.000 millones (modelo base) |
| Parametros activos | 2.000 millones (modelo base, MoE) |
| Longitud de contexto | 131.072 tokens (configuracion de entrenamiento y evaluacion con vLLM); 65.536 en el ejemplo con llama.cpp |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (PEFT) y en GGUF F16; el modelo base esta disponible en GGUF, incluido Q8_0 en el ejemplo del autor |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como «other» en Hugging Face) |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF (adaptador F16) |
| Rango LoRA | r = 32, alpha = 64, todas las capas lineales |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LFM2.5-24B-A2B, un modelo MoE de LiquidAI con 24.000 millones de parametros totales y 2.000 millones activos. El entrenamiento utiliza AsyncGRPO (GRPO asincrono, experimental en TRL) con LoRA de rango 32 y alpha 64 sobre todas las capas lineales. Los entornos proceden de tareas Harbor servidas por OpenEnv, con rollouts ejecutados en sandboxes de Hugging Face y llamadas a herramientas filtradas por safeagents; el harness es OpenCode.

La senal de recompensa combina la `correctness` del verificador de la tarea (con retroceso a `reward`) y un bonus de eficiencia de herramientas con peso 0,1. Se entrenaron 300 tareas de SmolDataEnvs y 230 de traj2envs hasta el checkpoint publicado (paso 160 de una ejecucion de 200). Cada paso usa 4 micro-lotes de hasta 131.072 tokens, 8 rollouts por tarea a temperatura 0,8, hasta 17 llamadas al modelo y 600 segundos por rollout, admitiendo rollouts con hasta 4 versiones de politica de antiguedad. La tasa de aprendizaje es 1e-5 y el hardware fueron 4 GPU NVIDIA H200 en HF Jobs: una para vLLM y tres para entrenadores (uno por harness). El script de entrenamiento esta en `examples/async_grpo_harbor` de TRL.

## Capacidades

- Generacion de texto y razonamiento dentro de un bucle de agente, con modo de razonamiento configurable en vLLM mediante `--reasoning-parser qwen3`.
- Uso de herramientas (tool calling) con parser dedicado `lfm2` y `--enable-auto-tool-choice` en vLLM; ejecucion de shell y Python contra ficheros de datos.
- Razonamiento multi-paso y sesiones de agente largas: hasta 17 llamadas al modelo por rollout en entrenamiento, con contexto de hasta 131.072 tokens.
- Analisis de datos sobre ficheros reales (por ejemplo, CSV) dentro de un sandbox, respondiendo preguntas de negocio sobre los datos.
- Integracion con el agente OpenCode mediante API compatible con OpenAI (`@ai-sdk/openai-compatible`).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Analisis de datos ad hoc con agente: el adaptador responde preguntas sobre ficheros CSV o conjuntos de datos ejecutando Python y shell en un sandbox, con menos llamadas a herramientas que el modelo base en las tareas que ambos resuelven, lo que reduce coste por consulta.
- Integracion en OpenCode como proveedor local: sirviendo el adaptador con vLLM y apuntando OpenCode a `http://localhost:8000/v1`, se obtiene un agente de codigo y datos autoalojado sin dependencia de APIs externas.
- Automatizacion de informes exploratorios: sesiones que leen un directorio de datos, calculan agregados y devuelven una respuesta verificable, aprovechando el contexto de 131.072 tokens para incluir varios ficheros en la misma sesion.
- Despliegue en estaciones de trabajo con llama.cpp: la version GGUF del adaptador sobre el GGUF Q8_0 del modelo base permite ejecutar el agente en local con 65.536 tokens de contexto, util para entornos con requisitos de privacidad.
- Evaluacion de agentes en pipelines de CI: al estar entrenado sobre tareas Harbor con verificador, encaja en arneses de evaluacion reproducibles para medir regresiones de agentes de analisis de datos.
- Investigacion en RL para agentes: el adaptador y su receta (AsyncGRPO, LoRA r=32, recompensa con bonus de eficiencia) sirven como punto de partida para experimentos de ajuste de agentes sobre nuevos entornos Harbor.
- Prototipado de asistentes de datos con coste controlado: el menor numero de tool calls (-30 % en 119 tareas) se traduce en menos tokens y latencia por sesion en cargas de trabajo de analisis.

## Benchmarks y rendimiento

Evaluacion con el harness OpenCode, un intento por tarea a temperatura 0,8, comparacion pareada contra el modelo base en las mismas tareas. Intervalo de confianza del 95 %; las llamadas a herramientas se comparan solo en las tareas resueltas por ambos.

| Tareas | n | Modelo base | Adaptador (paso 160) | Diferencia (puntos) | Llamadas a herramientas |
|---|---|---|---|---|---|
| 150 tareas retenidas de FineEnvs/SmolDataEnvs-harbor-train | 150 | 82,7 % | 84,0 % | +1,3 ± 4,5 | -30 % (119 tareas) |
| 40 tareas retenidas de harness-hub/traj2envs-rl | 40 | 25,0 % | 20,0 % | -5,0 ± 13,9 | -12 % (5 tareas) |

El checkpoint se selecciono observando las puntuaciones sobre esta misma evaluacion, por lo que la diferencia de la primera fila es optimista segun el propio autor. La version GGUF no ha sido reevaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 24.000 millones de parametros totales y 2.000 millones activos, por lo que el peso en precision completa ronda los 48 GB y en Q8_0 unos 24-26 GB, aunque estas cifras son estimaciones a partir del tamano y no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizo con 4× NVIDIA H200; para inferencia con el contexto completo de 131.072 tokens se recomienda hardware de clase数据中心 (H100/H200 o A100 de 80 GB).
- GPU de consumo: no hay datos publicados; la variante GGUF Q8_0 con contexto de 65.536 tokens podria caber en GPU de consumo con 24 GB o mas, pero no esta verificado por el autor.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules`, `--enable-auto-tool-choice --tool-call-parser lfm2 --reasoning-parser qwen3 --max-model-len 131072`; llama.cpp mediante `llama serve` con `--lora` y contexto de 65.536; OpenCode como cliente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-opencode (este adaptador) | 24B totales / 2B activos + LoRA r=32 | 131.072 tokens (vLLM) | 84,0 % en SmolDataEnvs (n=150); 20,0 % en traj2envs (n=40) | lfm1.0 | Hugging Face, safetensors y GGUF |
| LiquidAI/LFM2.5-24B-A2B (modelo base) | 24B totales / 2B activos | 131.072 tokens (configuracion de evaluacion) | 82,7 % en SmolDataEnvs; 25,0 % en traj2envs | lfm1.0 | Hugging Face |
| Otros adaptadores de agente comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion pequena: 150 tareas dejan el intervalo del 95 % en ±4,5 puntos para la diferencia pareada de pass@1.
- Una sola familia de tareas: entrenamiento y evaluacion principal se centran en analisis de datos; en las tareas de repositorio de traj2envs no mejora al modelo base (-5,0 ± 13,9 puntos).
- Un solo harness: el adaptador se entreno con los prompts y herramientas de OpenCode; con otro agente cabe esperar un comportamiento igual o peor que el del modelo base.
- Sesgo de seleccion de checkpoint: el paso 160 se eligio mirando la misma evaluacion que se reporta, por lo que la mejora de +1,3 puntos es optimista.
- La version GGUF no ha sido reevaluada.
- Licencia lfm1.0: es necesario revisar las condiciones del modelo base antes de cualquier uso comercial; la model card no detalla restricciones adicionales del adaptador.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles.
- El repositorio no registra descargas ni likes, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-opencode
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Version GGUF del adaptador: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-opencode-GGUF
- Dataset de entrenamiento (SmolDataEnvs): https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de entrenamiento (traj2envs): https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Repositorio de OpenCode: https://github.com/sst/opencode
- Documentacion de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- safeagents: https://github.com/huggingface/safeagents
- Documentacion de HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
