# harness-hub/LFM3-1.7B-pi

## Resumen

LFM3-1.7B-pi es un adaptador LoRA publicado por harness-hub sobre el modelo base LiquidAI/LFM3-1.7B, un transformer denso de 1.700 millones de parametros desarrollado por Liquid AI. El adaptador no modifica la arquitectura del modelo base: se aplica sobre las capas lineales y se ha entrenado con aprendizaje por refuerzo (GRPO asincrono mediante TRL) para especializarlo como motor del agente de codigo pi en tareas de analisis de datos. Su proposito es mejorar la fiabilidad del agente cuando ejecuta herramientas de shell y Python contra ficheros de datos reales en un sandbox remoto, y reducir el numero de llamadas a herramientas necesarias para resolver cada tarea.

La relevancia de esta publicacion es metodologica tanto como practica: cada rollout de entrenamiento es una sesion completa del agente pi (lectura de la tarea, ejecucion de comandos, respuesta final) evaluada por un verificador automatico, y el reward combina la correccion de la respuesta con un bonus de eficiencia en el uso de herramientas (peso 0,1). El checkpoint final (paso 400) resuelve un 80,7% de las 150 tareas retenidas de SmolDataEnvs-harbor-train frente al 70,0% del modelo base, con un 37% menos de llamadas a herramientas en las tareas que ambos resuelven.

Se distribuye exclusivamente como adaptador PEFT (0,1 GB en el repositorio), no como modelo completo, y requiere servir el modelo base junto con el adaptador. La licencia es lfm1.0, heredada del modelo base, con condiciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso LiquidAI/LFM3-1.7B |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA anade un conjunto reducido de parametros (r = 32, alpha = 64, todas las capas lineales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 131.072 tokens en la configuracion de vLLM del autor; 65.536 tokens en el ejemplo con llama.cpp |
| Tipos de cuantizacion | El adaptador se publica en safetensors (PEFT) y en GGUF F16; el modelo base dispone de GGUF Q8_0 en el repositorio oficial LiquidAI/LFM3-1.7B-GGUF |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (adaptador F16 en harness-hub/LFM3-1.7B-pi-GGUF) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un transformer denso de 1.700 millones de parametros. El entrenamiento utiliza AsyncGRPO, el entrenador experimental de GRPO asincrono de TRL, con LoRA de rango 32, alpha 64 y aplicado a todas las capas lineales. Los entornos de entrenamiento son tareas de Harbor servidas mediante OpenEnv, con rollouts ejecutados en sandboxes de Hugging Face y llamadas a herramientas filtradas por safeagents. El harness del agente es pi (earendil-works/pi).

Cada rollout consiste en una sesion completa de pi: el agente lee la tarea, ejecuta herramientas de shell y Python sobre los ficheros de datos y emite una respuesta que un verificador califica. El reward es la metrica `correctness` del verificador (con fallback a `reward`) mas un bonus de eficiencia de herramientas de peso 0,1. Se entrenaron 550 tareas de SmolDataEnvs y 230 de traj2envs hasta este checkpoint, con 8 rollouts por tarea, temperatura 0,8, hasta 17 llamadas al modelo y 600 segundos por rollout. El batch usa 4 micro-lotes de hasta 65.536 tokens por paso, con rollouts de hasta 4 versiones de politica de antiguedad. La tasa de aprendizaje fue 1e-5 y el entrenamiento completo consta de 400 pasos. El hardware empleado fueron 2 GPU NVIDIA H200 en HF Jobs: una para vLLM y otra compartida por los tres entrenadores (uno por harness). El script de entrenamiento esta disponible en `examples/async_grpo_harbor` del repositorio de TRL.

## Capacidades

- Razonamiento agente multi-paso: planifica y ejecuta secuencias de llamadas a herramientas hasta responder a la tarea.
- Ejecucion de herramientas de shell y Python contra ficheros de datos en un entorno sandbox.
- Analisis de datos tabulares: lectura de CSV y otros ficheros, calculo de agregaciones y respuesta a preguntas analiticas (por ejemplo, que region tuvo mayor crecimiento de ingresos en `sales.csv`).
- Tool calling compatible con el parser `qwen3_coder` y el parser de razonamiento `qwen3` en vLLM, con `--enable-auto-tool-choice`.
- Integracion con el agente de codigo pi mediante la API OpenAI-completions (no la Responses API).
- Eficiencia de herramientas: en las tareas que resuelve, emplea un 37% menos de llamadas a herramientas que el modelo base.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Analisis de datos automatizado sobre ficheros CSV: el agente recibe una pregunta de negocio, ejecuta Python con pandas u otras librerias en el sandbox y devuelve la respuesta verificada. Es el escenario exacto de entrenamiento (SmolDataEnvs) y donde se mide la mejora de +10,7 puntos.
- Agente de codigo en terminal: integrado en pi con `--provider local --model lfm3-harbor-pi`, permite lanzar tareas de inspeccion y transformacion de datos desde la linea de comandos con soporte de tool calling nativo.
- Automatizacion de informes exploratorios: dado un directorio de datos, el agente ejecuta comandos de shell para listar ficheros, inspecciona esquemas y produce resumenes, aprovechando la ventana de contexto de hasta 131.072 tokens para mantener el historial de la sesion.
- Pipelines de evaluacion de agentes: sirve como referencia para medir pass@1 y eficiencia de herramientas con el harness pi, comparando contra el modelo base en las mismas tareas.
- Despliegue en hardware de gama alta con vLLM: al ser un adaptador LoRA servible junto al base, permite atender el agente con `--enable-lora --max-lora-rank 32` sin duplicar los pesos completos por cada variante.
- Prototipado en local con llama.cpp: la version GGUF del adaptador (F16) sobre el base Q8_0 permite probar el agente en estaciones de trabajo sin GPU de datacenter, con contexto de 65.536 tokens.
- Investigacion en RL para agentes: el setup (AsyncGRPO, OpenEnv, Harbor, verificadores) es replicable y sirve de base para entrenar adaptadores sobre otras familias de tareas.

## Benchmarks y rendimiento

Evaluacion con el harness pi, un intento por tarea a temperatura 0,8, comparacion pareada contra el modelo base en las mismas tareas. Intervalo de confianza del 95%; las llamadas a herramientas se comparan solo en las tareas que ambos resuelven.

| Tareas | n | Modelo base | Adaptador (paso 400) | Diferencia (puntos) | Llamadas a herramientas |
|---|---|---|---|---|---|
| 150 tareas retenidas de FineEnvs/SmolDataEnvs-harbor-train | 150 | 70,0% | 80,7% | +10,7 ± 6,7 | -37% (99 tareas) |
| 40 tareas retenidas de harness-hub/traj2envs-rl | 40 | 15,0% | 12,5% | -2,5 ± 11,1 | -6% (3 tareas) |

La evaluacion principal es la primera fila: tareas 1.000 en adelante de SmolDataEnvs-harbor-train (dificultad facil y media, ninguna vista en entrenamiento). El paso 400 es el checkpoint final de la ejecucion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base tiene 1.700 millones de parametros; en FP16 requiere aproximadamente 3,4 GB solo para pesos, mas KV cache para contextos largos (hasta 131.072 tokens en la configuracion de vLLM), lo que eleva sustancialmente el consumo. El adaptador LoRA anade una fraccion minima.
- GPU empleadas en entrenamiento y evaluacion: 2× NVIDIA H200 en HF Jobs (una para vLLM, otra compartida por los entrenadores).
- GPU recomendadas: no se especifican en la model card. Por tamano del base, el despliegue con contexto largo en vLLM encaja en GPU de datacenter (H100, H200, A100); para contextos moderados cabria en GPU consumer de gama alta, aunque el autor no lo documenta.
- Despliegue con vLLM: comando documentado con `--enable-lora --max-lora-rank 32`, `--lora-modules lfm3-harbor-pi=harness-hub/LFM3-1.7B-pi`, `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3 --trust-remote-code --max-model-len 131072`. En el momento del entrenamiento LFM3 no estaba soportado por una release de vLLM; se uso el commit `fac2ce2eb3633c44a104a66dbb30d0e6c7f4493e` con ficheros de `atmikshetty/vllm@5f67fbc`.
- Despliegue con llama.cpp: `llama serve -m LFM3-1.7B-Q8_0.gguf --lora LFM3-1.7B-harbor-pi-lora-F16.gguf -c 65536 --port 8080 --alias lfm3-harbor-pi`, con integracion via `pi install git:github.com/huggingface/pi-llama`. La version GGUF no ha sido reevaluada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-pi (este adaptador) | 1,7 B (base) + LoRA | hasta 131.072 tokens (vLLM) | 80,7% en 150 tareas SmolDataEnvs retenidas | lfm1.0 | safetensors PEFT, GGUF F16 |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | hasta 131.072 tokens (misma configuracion) | 70,0% en las mismas 150 tareas | lfm1.0 | safetensors, GGUF |
| Otros adaptadores de agente sobre modelos de ~1,7 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion cuantitativa publicada es contra el modelo base, con el que comparte arquitectura y licencia. No se proporcionan datos frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Evaluacion pequena: 150 tareas dejan el intervalo de confianza del 95% de la diferencia pareada en pass@1 en ±6,7 puntos.
- Una sola familia de tareas: el entrenamiento y la evaluacion principal son tareas de analisis de datos. En las tareas de repositorio de traj2envs el adaptador no mejora al base (-2,5 ± 11,1 puntos, dentro del ruido).
- Un solo harness: el adaptador se entreno con los prompts y herramientas de pi; con otro agente cabe esperar un comportamiento degradado.
- La version GGUF del adaptador no ha sido reevaluada.
- Requiere servir el modelo base junto al adaptador; no es un modelo autonomo.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es inherente a un modelo de 1,7 B en tareas analiticas; el uso de verificadores en entrenamiento no garantiza correccion en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no hay garantia de comportamiento multilingue.
- Licencia lfm1.0: es necesario revisar las condiciones del modelo base en https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE antes de cualquier uso comercial.
- El despliegue con vLLM puede requerir `--trust-remote-code` y, segun la version, parches para `Lfm3ForCausalLM`; conviene verificar el soporte de la release instalada.
- La integracion con pi debe usar `"api": "openai-completions"`; con la Responses API el adaptador no fue entrenado ni evaluado.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/harness-hub/LFM3-1.7B-pi
- Version GGUF del adaptador: https://huggingface.co/harness-hub/LFM3-1.7B-pi-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de entrenamiento principal: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset traj2envs: https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Agente pi: https://github.com/earendil-works/pi
- Integracion pi con llama.cpp: https://github.com/huggingface/pi-llama
- Documentacion de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- safeagents: https://github.com/huggingface/safeagents
- Fork de vLLM usado en entrenamiento: https://github.com/atmikshetty/vllm/tree/5f67fbcbb2336b0e551c0df2b4c0eb51b030c553
- HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
