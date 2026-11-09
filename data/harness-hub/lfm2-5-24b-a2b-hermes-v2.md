# harness-hub/LFM2.5-24B-A2B-hermes-v2

## Resumen

LFM2.5-24B-A2B-hermes-v2 es un adaptador LoRA publicado por harness-hub sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un transformer MoE de 24 mil millones de parámetros totales y 2 mil millones activos. El adaptador se ha entrenado con aprendizaje por refuerzo (AsyncGRPO de TRL) para funcionar como el modelo subyacente de Hermes Agent en tareas de análisis de datos, donde el agente ejecuta comandos de shell y Python contra ficheros de datos en un sandbox remoto y un verificador puntúa la respuesta.

El checkpoint publicado corresponde al paso 50 de un entrenamiento de 200 pasos que se detuvo en el paso 68 por límite de tiempo del job. Según la model card, el adaptador resuelve tareas aproximadamente con la misma frecuencia que el modelo base (78,7 % frente a 80,0 % en 150 tareas retenidas de SmolDataEnvs), pero con un 13 % menos de llamadas a herramientas en las tareas que ambos resuelven. En tareas de repositorio reconstruidas de sesiones reales (traj2envs) queda dentro del ruido estadístico del modelo base (-7,7 ± 8,5 puntos).

Su relevancia es acotada pero específica: demuestra un pipeline completo de RL asíncrono con rollouts en sandbox, verificación automática y bonus de eficiencia en el uso de herramientas, empaquetado como adaptador PEFT servible con vLLM o llama.cpp. No es un modelo de propósito general, sino un artefacto de investigación sobre entrenamiento de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base LiquidAI/LFM2.5-24B-A2B); adaptador LoRA r=32, alpha=64 sobre todas las capas lineales |
| Parametros totales | 24B (modelo base); el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | 2B (modelo base, MoE) |
| Longitud de contexto | 131.072 tokens en el servidor vLLM de referencia; Hermes requiere al menos 64.000 tokens |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (PEFT) y en GGUF F16; el modelo base dispone de GGUF Q8_0 y otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other), heredada del modelo base |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (adaptador F16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LFM2.5-24B-A2B, un modelo MoE de LiquidAI con 24B parámetros totales y 2B activos por token. El adaptador LoRA tiene rango 32 y alpha 64, aplicado a todas las capas lineales, y se sirve junto al modelo base mediante `--enable-lora --max-lora-rank 32` en vLLM o con `--lora` en llama.cpp.

El entrenamiento usa AsyncGRPO (TRL, experimental) con LoRA. Cada rollout es una sesión completa de Hermes en un sandbox remoto de Hugging Face: el agente lee la tarea, ejecuta herramientas de shell y Python sobre los ficheros de datos y responde; un verificador puntúa la respuesta. Las tareas provienen de Harbor servidas por OpenEnv, con las llamadas a herramientas filtradas por safeagents. La recompensa es la `correctness` del verificador (con fallback a `reward`) más un bonus de eficiencia de herramientas de peso 0,1. Se usaron 8 rollouts por tarea, temperatura 0,8, hasta 17 llamadas al modelo y 600 s por rollout, con 4 micro-lotes de hasta 131.072 tokens por paso y rollouts hasta 4 versiones de política obsoletas. El entrenamiento corrió en 4× NVIDIA H200 en HF Jobs: vLLM en una GPU y un trainer por harness en cada una de las otras tres. Se entrenó sobre 255 tareas de SmolDataEnvs hasta este checkpoint.

## Capacidades

- Generación de texto y razonamiento dentro de sesiones de agente, con modo de razonamiento configurable en vLLM mediante `--reasoning-parser qwen3`.
- Ejecución de herramientas de shell y Python en sandbox remoto para inspeccionar y manipular ficheros de datos.
- Tool calling nativo con parser `lfm2` en vLLM (`--enable-auto-tool-choice --tool-call-parser lfm2`).
- Flujos de agente multi-paso: lectura de tarea, planificación, ejecución de herramientas y respuesta final.
- Análisis de datos tabulares (CSV y similares) orientado a responder preguntas analíticas.
- Eficiencia en el uso de herramientas: un 13 % menos de llamadas en las tareas resueltas por ambos modelos.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Análisis de datos conversacional: el adaptador responde preguntas sobre ficheros CSV ejecutando código Python en un sandbox, adecuado porque se entrenó exactamente en ese bucle de lectura, ejecución y verificación.
- Agente de investigación de repositorios de datos: con contexto de hasta 131.072 tokens en vLLM, puede inspeccionar múltiples ficheros y mantener el estado de la sesión a lo largo de decenas de llamadas a herramientas.
- Automatización de informes exploratorios: integrado en Hermes, recibe una pregunta de negocio, ejecuta agregaciones y devuelve una respuesta verificable, con menor número de llamadas a herramientas que el modelo base.
- Evaluación de pipelines de RL para agentes: sirve como referencia reproducible del ejemplo `async_grpo_harbor` de TRL para comparar configuraciones de entrenamiento.
- Despliegue en hardware de consumo: la variante GGUF F16 del adaptador sobre el GGUF Q8_0 del modelo base permite servir el agente con llama.cpp en una sola máquina con 64.000 tokens de contexto.
- Prototipado de agentes con Hermes: configuración mínima en `~/.hermes/config.yaml` apuntando a un servidor vLLM local, útil para validar flujos antes de escalar a producción.
- Fine-tuning adicional sobre tareas propias: al ser un adaptador PEFT, se puede componer o sustituir sin tocar los pesos del modelo base.

## Benchmarks y rendimiento

Evaluación con el harness de Hermes, un intento por tarea a temperatura 0,8, comparación emparejada contra el modelo base en las mismas tareas. Intervalo de confianza del 95 %; las llamadas a herramientas se comparan solo en las tareas resueltas por ambos.

| Tareas | n | Modelo base | Adaptador (paso 50) | Diferencia (puntos) | Llamadas a herramientas |
|---|---|---|---|---|---|
| 150 tareas retenidas de FineEnvs/SmolDataEnvs-harbor-train | 150 | 80,0 % | 78,7 % | -1,3 ± 5,9 | -13 % (109 tareas) |
| 40 tareas retenidas de harness-hub/traj2envs-rl | 39 | 10,3 % | 2,6 % | -7,7 ± 8,5 | +50 % (1 tarea) |

El paso 50 se seleccionó mirando las puntuaciones de los checkpoints en esta misma evaluación, por lo que la diferencia reportada es optimista. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base tiene 24B parámetros totales y 2B activos, por lo que en BF16 requiere del orden de 48 GB solo para pesos, más KV cache para 131.072 tokens.
- GPU de referencia en entrenamiento: 4× NVIDIA H200 en HF Jobs (una para vLLM, tres para trainers).
- GPU recomendadas para inferencia: H100, H200 o A100 de 80 GB para servir el modelo base completo con contexto largo; no se especifican alternativas de menor memoria.
- GPU de consumo: la ruta documentada es llama.cpp con el GGUF Q8_0 del modelo base más el adaptador GGUF F16, con `-c 65536`; no se indican requisitos de VRAM concretos para esta configuración.
- Despliegue: vLLM (configuración de referencia con `--enable-lora --max-lora-rank 32`, `--max-model-len 131072`, parser de herramientas `lfm2` y parser de razonamiento `qwen3`) y llama.cpp (`llama serve` con `--lora`). No se mencionan TGI, Ollama ni SGLang.
- Latencia y throughput: no disponibles. La model card solo reporta número de llamadas a herramientas, no tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-hermes-v2 (este) | 24B totales / 2B activos + LoRA r=32 | 131.072 tokens en vLLM | 78,7 % en 150 tareas SmolDataEnvs; 2,6 % en traj2envs | lfm1.0 | Hugging Face (PEFT y GGUF) |
| LiquidAI/LFM2.5-24B-A2B (base) | 24B totales / 2B activos | 131.072 tokens en la configuración de referencia | 80,0 % en SmolDataEnvs; 10,3 % en traj2envs | lfm1.0 | Hugging Face |
| Otros adaptadores de agente sobre el mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa se limita al par base/adaptador evaluado con el mismo harness.

## Limitaciones y advertencias

- Evaluación pequeña: 150 tareas dejan el intervalo del 95 % en ±5,9 puntos sobre la diferencia de pass@1 emparejada.
- Una sola familia de tareas: entrenamiento y evaluación principal son de análisis de datos; en las tareas de repositorio de traj2envs no mejora al modelo base.
- El checkpoint nunca vio las tareas de traj2envs durante el entrenamiento, así que ese resultado mide transferencia desde SmolDataEnvs, no ajuste directo.
- Un solo harness: el adaptador se entrenó con los prompts y herramientas de Hermes; con otro agente cabe esperar un comportamiento igual o peor que el base.
- Selección optimista del checkpoint: el paso 50 se eligió con la misma evaluación que se reporta.
- Entrenamiento incompleto: la ejecución se detuvo en el paso 68 de 200 por límite de tiempo.
- La versión GGUF no se ha reevaluado.
- Licencia lfm1.0: es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un adaptador de RL sobre tareas verificadas, la respuesta puede ser plausible sin ser correcta cuando el verificador no cubre el caso.
- Idiomas soportados: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Adaptador en GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de evaluación traj2envs: https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- safeagents: https://github.com/huggingface/safeagents
- Script de entrenamiento AsyncGRPO: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Documentación del trainer AsyncGRPO: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Documentación de HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
