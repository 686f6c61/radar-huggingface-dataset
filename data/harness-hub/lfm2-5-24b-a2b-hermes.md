# harness-hub/LFM2.5-24B-A2B-hermes

## Resumen

LFM2.5-24B-A2B-hermes es un adaptador LoRA entrenado mediante aprendizaje por refuerzo sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un transformer de tipo Mixture of Experts con 24 mil millones de parametros totales y 2 mil millones activos. El adaptador lo publica el usuario harness-hub y su objetivo no es mejorar la precision del modelo base, sino reducir el coste operativo del agente: sobre las mismas tareas de analisis de datos, resuelve aproximadamente el mismo porcentaje de tareas que el modelo base empleando un 20% menos de llamadas a herramientas.

La relevancia practica del checkpoint reside en su enfoque de entrenamiento. Cada rollout consiste en una sesion completa del agente Hermes dentro de un sandbox remoto, donde el modelo lee la tarea, ejecuta herramientas de shell y Python sobre los ficheros de datos y responde; un verificador externo puntua la respuesta y esa senal alimenta el entrenador AsyncGRPO de TRL. Es, por tanto, un ejemplo de ajuste por refuerzo asincrono aplicado a agentes con entorno real, no a pares pregunta-respuesta estaticos.

El adaptador se distribuye como pesos PEFT (r=32, alpha=64) sobre el modelo base y requiere servirse junto a este. Su utilidad esta acotada a un dominio concreto (tareas de analisis de datos de SmolDataEnvs) y a un unico harness (Hermes Agent), por lo que debe evaluarse con cautela fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE LiquidAI/LFM2.5-24B-A2B |
| Parametros totales | 24B en el modelo base; el adaptador LoRA anade un subconjunto (r=32, alpha=64, todas las capas lineales) |
| Parametros activos | 2B (modelo base, MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion de vLLM documentada; Hermes requiere un minimo de 64.000 tokens |
| Tipos de cuantizacion | El adaptador se publica en safetensors (PEFT); existe version GGUF LoRA en F16. El modelo base ofrece GGUF Q8_0 como minimo documentado |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license_name: other, enlazada a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); GGUF LoRA F16 en repo separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-24B-A2B, un modelo MoE con 24B parametros totales y 2B activos por token. El ajuste es un LoRA de rango 32 y alpha 64 aplicado a todas las capas lineales, entrenado con AsyncGRPO (el entrenador experimental asincrono de GRPO de TRL). El entorno de entrenamiento son tareas de Harbor servidas por OpenEnv, con rollouts ejecutados en sandboxes de Hugging Face; el harness es Hermes Agent, cuyas llamadas a la Responses API se traducen a chat completions para vLLM mediante el proxy de captura de OpenEnv.

Los datos de entrenamiento son las primeras 1.000 tareas de FineEnvs/SmolDataEnvs-harbor-train. La recompensa es la puntuacion `correctness` del verificador de cada tarea (con fallback a `reward`). La configuracion concreta: 80 pasos de un run de 100, learning rate 1e-5, 8 rollouts por tarea a temperatura 0.8, hasta 17 llamadas al modelo y 600 segundos por rollout, 16.384 tokens por llamada, 4 micro-lotes con presupuesto de tokens por paso y rollouts con hasta 4 versiones de politica de antiguedad. El entrenamiento se ejecuto en 2x NVIDIA H200 en HF Jobs (vLLM en una GPU, entrenador en la otra). El script esta disponible en `examples/async_grpo_harbor` del repositorio de TRL.

## Capacidades

- Generacion de texto y razonamiento dentro de sesiones de agente con multiples pasos.
- Ejecucion de herramientas de shell y Python sobre ficheros de datos dentro de un sandbox (lectura, transformacion y analisis de CSV y similares).
- Tool calling con parser especifico `lfm2` en vLLM; imprescindible para que Hermes interprete las llamadas del modelo.
- Razonamiento multi-paso con hasta 17 llamadas al modelo por rollout en el entorno de entrenamiento.
- Respuesta a preguntas de analisis de datos verificables (agregaciones, comparativas, tendencias) sobre los ficheros de la tarea.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo thinking explicito mas alla del parser de razonamiento `qwen3` configurado en vLLM.

## Casos de uso

- Agente de analisis de datos sobre ficheros tabulares: el adaptador esta entrenado para leer un CSV, ejecutar codigo Python y responder preguntas como "que region tuvo mayor crecimiento de ingresos"; es su dominio nativo y donde la reduccion de tool calls es medible.
- Automatizacion de informes exploratorios: integrado en Hermes, puede encadenar lecturas, agregaciones y verificaciones sobre un dataset y devolver una respuesta final, con un 20% menos de llamadas a herramientas que el modelo base en tareas resueltas.
- Reduccion de coste en pipelines de agentes: al mantener el pass@1 y bajar el numero de tool calls de 4,97 a 3,97 en tareas resueltas por ambos, disminuye el consumo de tokens y la latencia por sesion en despliegues con verificacion externa.
- Evaluacion de tecnicas de RL para agentes: sirve como referencia reproducible de AsyncGRPO con LoRA sobre entorno Harbor/OpenEnv, util para investigadores que quieran replicar el pipeline con el script de TRL.
- Despliegue en infraestructura propia con vLLM y LoRA dinamica: permite servir el adaptador junto al base con `--enable-lora` y `--max-lora-rank 32`, sin duplicar los pesos completos del modelo.
- Despliegue ligero con llama.cpp: la version GGUF LoRA F16 sobre el base Q8_0 permite ejecutar el agente en un servidor con `llama serve` y contexto de 65.536 tokens, aunque esa variante no ha sido reevaluada.
- Base para fine-tuning adicional en dominios de analisis concretos: al ser un adaptador PEFT, puede combinarse o sustituirse por otros adaptadores sobre el mismo modelo base sin reentrenar los 24B parametros.

## Benchmarks y rendimiento

Evaluacion con el harness de Hermes sobre las primeras 100 tareas de FineEnvs/SmolDataEnvs-harbor-test, un intento por tarea a temperatura 0.8, comparacion pareada contra el modelo base en las mismas tareas.

| Metrica | Modelo base | Adaptador (paso 80) | Cambio |
|---|---|---|---|
| pass@1 | 0,73 | 0,72 | −1 punto (intervalo 95% ±7,6) |
| Tool calls en tareas resueltas por ambos | 4,97 | 3,97 | −20% |

Desglose: de las 100 tareas, el adaptador resuelve 7 que el base falla y falla 8 que el base resuelve. La precision cayo hasta 13 puntos en los pasos 10 y 30 y se recupero en el paso 80; los pasos 80 a 100 estan dentro del ruido respecto al base. La eficiencia en tool calls se mantuvo plana los primeros 30 pasos y bajo a −18%/−20% a partir del paso 60.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita para el adaptador; el modelo base de 24B en precision completa requiere aproximadamente 48 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 24 GB, sin contar cache KV.
- Contexto: Hermes necesita al menos 64.000 tokens de ventana; con 131.072 tokens de contexto la cache KV crece de forma significativa y condiciona la VRAM disponible.
- GPU recomendadas: el entrenamiento se realizo en 2x NVIDIA H200. Para inferencia con contexto completo y vLLM se recomiendan H100, H200 o A100 de 80 GB; no se documenta un minimo oficial.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) en precision completa; la ruta viable en consumer es la version GGUF Q8_0 del base con el LoRA F16 mediante llama.cpp, sujeta a la VRAM disponible y al contexto reducido.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32`, `--enable-auto-tool-choice --tool-call-parser lfm2 --reasoning-parser qwen3 --max-model-len 131072`; llama.cpp con `llama serve -m ... --lora ... -c 65536`; el adaptador es compatible con PEFT y con el ecosistema de Hugging Face.
- Latencia y throughput: no disponibles. La reduccion del 20% en tool calls en tareas resueltas implica menos llamadas por sesion, pero no se publican medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (100 tareas) | Tool calls | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-hermes (este) | 24B totales / 2B activos + LoRA | 131.072 | 0,72 | 3,97 | lfm1.0 | Hugging Face (PEFT y GGUF LoRA) |
| LiquidAI/LFM2.5-24B-A2B (base) | 24B totales / 2B activos | 131.072 | 0,73 | 4,97 | lfm1.0 | Hugging Face |
| Variantes entrenadas con pi, Claude Code y opencode | no disponible | no disponible | no disponible (graficadas en la model card) | no disponible | no disponible | no disponible |

La model card menciona runs comparativos entrenados y evaluados con pi, Claude Code y opencode, representados en la grafica `harbor_lora_evals.png`, pero no se publican sus valores numericos en el texto. No se dispone de comparacion con otros modelos de la misma categoria fuera del ecosistema LFM.

## Limitaciones y advertencias

- Evaluacion pequena: 100 tareas sitúan el intervalo de confianza al 95% de la diferencia pareada de pass@1 en torno a ±8 puntos, por lo que las diferencias de precision no son significativas.
- Una sola familia de tareas: entrenamiento y evaluacion usan exclusivamente tareas de analisis de datos de SmolDataEnvs; las ganancias pueden no transferirse a otros tipos de trabajo.
- Un solo harness: el adaptador se entreno con los prompts y herramientas de Hermes; con otro agente cabe esperar un comportamiento igual o peor que el del modelo base.
- Seleccion del checkpoint sobre el mismo conjunto de evaluacion: el paso 80 se eligio sobre las mismas 100 tareas con las que se puntua, por lo que el −1 punto es una estimacion ligeramente optimista.
- La version GGUF no ha sido reevaluada; su rendimiento no esta verificado.
- Riesgo de alucinacion: no documentado de forma especifica, pero aplica el comportamiento del modelo base en tareas de analisis con verificacion externa.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles.
- Licencia lfm1.0: es necesario revisar los terminos del modelo base enlazados en la model card antes de cualquier uso comercial; la licencia se declara como `other` con nombre `lfm1.0`.
- Dependencia estricta del parser `lfm2` en vLLM para el tool calling; sin esa configuracion el agente no interpreta correctamente las llamadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Version GGUF del adaptador: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de evaluacion: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-test
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- Entrenador AsyncGRPO de TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Documentacion de HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
