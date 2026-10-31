# harness-hub/LFM2.5-24B-A2B-claude-code

## Resumen

LFM2.5-24B-A2B-claude-code es un adaptador LoRA publicado por harness-hub sobre el modelo base LiquidAI/LFM2.5-24B-A2B de Liquid AI. Su objetivo es entrenar, mediante aprendizaje por refuerzo, al modelo base para funcionar como motor de un agente de terminal tipo Claude Code en tareas de analisis de datos. Cada rollout de entrenamiento es una sesion completa de Claude Code en un sandbox remoto: el agente lee la tarea, ejecuta herramientas de shell y Python sobre los ficheros de datos y responde; un verificador puntua la respuesta y esas notas se usan como recompensa con el entrenador GRPO asincrono de TRL.

Es relevante como ejemplo de referencia de un pipeline agentic completo (Harbor + OpenEnv + TRL AsyncGRPO + vLLM), no como mejora del modelo base. El propio autor advierte que, tras 100 pasos de entrenamiento, el checkpoint rinde como el modelo base dentro del margen de ruido, y se publica como punto de partida y ejecucion de referencia. El modelo base es un LFM (Liquid Foundation Model) de 24B parametros con aproximadamente 2B activos (arquitectura MoE/hibrida de Liquid AI), y el adaptador pesa unos 0,1 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-24B-A2B (MoE de Liquid AI) |
| Parametros totales | 24B (modelo base); adaptador: no disponible (repo de 0,1 GB) |
| Parametros activos | ~2B (A2B, segun el nombre del modelo base) |
| Longitud de contexto | 131072 tokens (configuracion usada con vLLM); 65536 en el ejemplo de llama.cpp |
| Tipos de cuantizacion | Adaptador en F16 para GGUF; base disponible en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other", heredada del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA); version GGUF del adaptador disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 32, alpha 64, aplicado a todas las capas lineales del modelo base, entrenado durante 100 pasos con tasa de aprendizaje 1e-5. El metodo es el entrenador AsyncGRPO de TRL (variante asincrona y experimental de GRPO), con 8 rollouts por tarea a temperatura 0,8, hasta 17 llamadas al modelo y 600 segundos por rollout, y 16384 tokens por llamada al modelo. El lote se compone de 4 micro-batches con presupuesto de tokens por paso.

El entorno de entrenamiento son tareas de Harbor servidas por OpenEnv, con rollouts ejecutados en sandboxes de Hugging Face. Se usaron las primeras 1000 tareas del dataset FineEnvs/SmolDataEnvs-harbor-train, y la recompensa es el campo `correctness` del verificador de cada tarea (con fallback a `reward`). Las llamadas de Claude Code a la API de Anthropic Messages se traducen a chat completions para vLLM mediante un proxy de captura de OpenEnv. El entrenamiento se realizo en una sola GPU NVIDIA B300, con vLLM y el entrenador compartiendo la misma GPU. El script de entrenamiento esta disponible como `examples/async_grpo_harbor` en el repositorio de TRL.

## Capacidades

- Actuacion como modelo de agente dentro de Claude Code: planificacion multi-paso, lectura de tareas y respuesta final verificado.
- Uso de herramientas (tool calling): ejecucion de comandos de shell y scripts de Python sobre ficheros de datos en un sandbox.
- Analisis de datos: el entrenamiento se centra en tareas de analisis de datos del entorno Harbor/SmolDataEnvs.
- Razonamiento agentic multi-step: hasta 17 llamadas al modelo por rollout durante el entrenamiento.
- Compatibilidad con la API de Anthropic Messages servida por vLLM o llama.cpp, sin necesidad de proxy.
- Hereda las capacidades generales del modelo base LFM2.5-24B-A2B (generacion de texto, codigo, etc.), aunque no se detallan en la model card.

## Casos de uso

- Motor local para Claude Code: servir el adaptador con vLLM o llama.cpp y apuntar Claude Code a `http://localhost:8000` mediante variables de entorno `ANTHROPIC_BASE_URL`, obteniendo un agente de terminal sin depender de la API de Anthropic.
- Experimentacion con RL agentic: usar este checkpoint como punto de partida para continuar entrenamientos GRPO propios sobre entornos Harbor/OpenEnv.
- Automatizacion de analisis de datos: el agente puede recibir una tarea, inspeccionar ficheros CSV o similares, ejecutar Python y devolver un resultado verificado.
- Referencia para comparar harness: la model card incluye comparativas entre harnesses (Claude Code, pi, opencode), util para estudiar como el harness afecta al aprendizaje por refuerzo agentic.
- Despliegue en hardware limitado: gracias a los ~2B de parametros activos del modelo base y a la version GGUF del adaptador, puede ejecutarse localmente con llama.cpp.
- Reproduccion del pipeline de entrenamiento: el script `examples/async_grpo_harbor` de TRL permite replicar el experimento completo con otras tareas o modelos base.
- Evaluacion de agentes en sandboxes: util como caso de estudio para montar verificaciones automaticas de respuestas de agentes con recompensa binaria de correccion.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados sobre las primeras 100 tareas de FineEnvs/SmolDataEnvs-harbor-test, un intento por tarea a temperatura 0,8. Diferencias de hasta ±5 puntos se consideran ruido. Con Claude Code (el harness de entrenamiento):

| Checkpoint | pass@1 | vs base | Llamadas a herramientas por tarea |
|---|---|---|---|
| base | 0,68 | — | 6,7 |
| Paso 10 | 0,65 | −3 | 7,0 |
| Paso 20 | 0,72 | +4 | 6,6 |
| Paso 30 | 0,63 | −5 | 6,9 |
| Paso 40 | 0,67 | −1 | 6,0 |
| Paso 60 | 0,68 | 0 | 6,2 |
| Paso 70 | 0,63 | −5 | 6,4 |
| Paso 80 | 0,71 | +3 | 6,1 |
| Paso 100 (este adaptador) | TODO | — | — |

Con el harness pi (no usado en el entrenamiento), el paso 100 muestra −1 punto en pass@1 y −2% en llamadas a herramientas frente al modelo base: sin cambio apreciable. La conclusion del autor es que no hay ganancia medida: todos los checkpoints estan dentro del ruido respecto al modelo base.

## Requisitos de hardware

- El entrenamiento se realizo en una sola NVIDIA B300, con vLLM y el entrenador compartiendo GPU; para solo inferencia los requisitos son menores.
- Para inferencia con vLLM y LoRA: el modelo base de 24B con ~2B activos; no se publica una cifra exacta de VRAM, pero una GPU de gama datacenter (A100/H100 de 80 GB) es una eleccion segura para contexto de 131072 tokens.
- Con llama.cpp y el GGUF Q8_0 del base mas el adaptador F16, con contexto de 65536 tokens, es plausible su ejecucion en estaciones de trabajo con GPU de consumo de 24 GB (RTX 3090/4090), aunque no hay mediciones publicadas.
- Despliegue con vLLM: `vllm serve` con `--enable-lora --max-lora-rank 32 --tool-call-parser lfm2 --reasoning-parser qwen3 --max-model-len 131072`; vLLM expone la API de Anthropic Messages (`/v1/messages`) que Claude Code consume directamente.
- Despliegue con llama.cpp: `llama-server` con `--lora` y `--jinja` (necesario para tool calling); tambien sirve `/v1/messages`.
- Opciones adicionales: Ollama y TGI no se mencionan en la documentacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| | LFM2.5-24B-A2B-claude-code (adaptador) | Modelo base LiquidAI/LFM2.5-24B-A2B | Runs hermanos con harness pi/opencode |
|---|---|---|---|
| Tipo | LoRA r=32 sobre LFM2.5-24B-A2B | LFM MoE 24B / ~2B activos | Adaptadores LoRA del mismo autor |
| Entrenamiento | AsyncGRPO, 100 pasos, harness Claude Code | Preentrenamiento y postentrenamiento de Liquid AI | AsyncGRPO con harness pi u opencode |
| pass@1 (Harbor, Claude Code) | Dentro del ruido del base (eval parcial, paso 100 TODO) | 0,68 | no disponible en detalle |
| Cambio en llamadas a herramientas | Drift pequeno, −5 a −10% desde el paso 40 | Referencia (6,7 por tarea) | El run con pi redujo llamadas hasta un 39% |
| Licencia | lfm1.0 | lfm1.0 | lfm1.0 |
| Disponibilidad | HF (safetensors y GGUF) | HF (safetensors y GGUF) | Publicadas como lineas comparativas en la model card |

La comparativa mas relevante es interna: frente al modelo base no hay mejora medida, y frente a runs con otros harnesses, este adaptador muestra menor drift, hipotesis del autor atribuida al system prompt largo y al conjunto fijo de herramientas de Claude Code, que dejan menos margen de aprendizaje en 100 pasos.

## Limitaciones y advertencias

- Sin ganancia medida: todos los checkpoints del run estan dentro del ruido estadistico respecto al modelo base, tanto con Claude Code como con pi. No debe esperarse una mejora de rendimiento.
- Evaluacion pequena: 100 tareas implican un ruido de aproximadamente ±5 puntos en pass@1; los resultados de pasos intermedios (por ejemplo, +4 en el paso 20) no son senales fiables.
- Un solo tipo de tarea: entrenamiento y evaluacion se realizan sobre la familia de tareas SmolDataEnvs de Harbor, por lo que la generalizacion a otros dominios es desconocida.
- La version GGUF del adaptador no ha sido reevaluada; su comportamiento puede diferir del safetensors.
- Restricciones de licencia: usa la licencia lfm1.0 del modelo base de Liquid AI; conviene revisar sus terminos antes de cualquier uso comercial.
- Riesgo de alucinacion: no se documenta; al tratarse de un checkpoint sin mejora demostrada, hereda las limitaciones del modelo base.
- Idiomas soportados, sesgos conocidos y metricas de latencia: no disponibles.
- En Claude Code, los nombres de modelo no pueden contener `/`, por lo que hay que usar un alias corto (`lfm-harbor-cc`) al registrar el adaptador en vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-claude-code
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Adaptador en GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-harbor-claude-code-lora-GGUF
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de evaluacion: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-test
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Documentacion de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- Guia de Claude Code con vLLM: https://docs.vllm.ai/en/stable/serving/integrations/claude_code/
- API de Anthropic Messages en llama.cpp: https://huggingface.co/blog/ggml-org/anthropic-messages-api-in-llamacpp
- Documentacion de Claude Code: https://docs.claude.com/en/docs/claude-code/overview
