# harness-hub/LFM2.5-24B-A2B-pi

## Resumen

LFM2.5-24B-A2B-pi es un adaptador LoRA publicado por harness-hub sobre el modelo base LiquidAI/LFM2.5-24B-A2B. No es un modelo completo, sino un peso de adaptador (r = 32, alpha = 64, aplicado a todas las capas lineales) entrenado con aprendizaje por refuerzo para funcionar como modelo subyacente del agente de codigo pi en tareas de analisis de datos. Cada rollout de entrenamiento es una sesion completa del agente pi en un sandbox remoto: el agente lee la tarea, ejecuta herramientas de shell y Python sobre los ficheros de datos y responde; un verificador puntua la respuesta y esas puntuaciones se usan como recompensa.

El entrenamiento se realizo con el entrenador asincrono GRPO de TRL (AsyncGRPO, experimental) sobre las primeras 1.000 tareas del dataset FineEnvs/SmolDataEnvs-harbor-train, sirviendo las tareas Harbor mediante OpenEnv. El resultado mas destacable no es un aumento de precision, sino de eficiencia: el adaptador resuelve tareas aproximadamente igual que el modelo base, pero con un 39% menos de llamadas a herramientas en las tareas resueltas, lo que se traduce en un agente mas barato y rapido.

Es relevante como ejemplo practico de RL orientado a eficiencia de agentes (no solo a precision), y como demostracion del pipeline TRL + OpenEnv + Harbor. El checkpoint publicado corresponde al paso 100 de entrenamiento, ya que en el paso 110 la precision empeora. Requiere servir el modelo base con vLLM o llama.cpp cargando el adaptador LoRA encima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r = 32, alpha = 64, todas las capas lineales) sobre LFM2.5-24B-A2B |
| Parametros totales | no disponible (los del modelo base, no publicados en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuracion usada con vLLM); 65.536 en el ejemplo con llama.cpp |
| Tipos de cuantizacion | no disponible (GGUF del adaptador en F16; base GGUF probado en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other", heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); tambien GGUF del adaptador |

## Arquitectura y entrenamiento

El adaptador se entrena con AsyncGRPO, la variante asincrona del algoritmo GRPO implementada en TRL, combinada con LoRA. A diferencia del RLHF clasico sobre respuestas aisladas, aqui cada rollout es una sesion completa de agente: hasta 17 llamadas al modelo y 600 segundos por rollout, con 16.384 tokens por llamada, 8 rollouts por tarea a temperatura 0,8 y micro-batches con presupuesto de tokens. La recompensa es el campo `correctness` del verificador de cada tarea (con fallback a `reward`). El entrenamiento se ejecuto en una sola GPU NVIDIA B300, con vLLM y el entrenador compartiendo la misma GPU.

El entorno de entrenamiento es Harbor (tareas de analisis de datos de SmolDataEnvs) servido mediante OpenEnv, con sandboxes remotos de Hugging Face. El harness del agente es pi, lo que significa que el adaptador esta especializado en los prompts y herramientas concretos de pi; con otro harness se espera que se comporte como el modelo base o peor. La configuracion de servicio empleada en entrenamiento y evaluacion usa `--tool-call-parser lfm2` y `--reasoning-parser qwen3` en vLLM, y la API `openai-completions` (no la Responses API).

## Capacidades

- Analisis de datos mediante agente: responde preguntas sobre ficheros de datos ejecutando comandos de shell y scripts de Python en un sandbox.
- Tool calling nativo: las llamadas a herramientas se parsean de la salida del modelo con el parser `lfm2` de vLLM; requiere `--enable-auto-tool-choice`.
- Razonamiento multi-paso dentro del harness pi: hasta 17 llamadas al modelo por tarea en los rollouts de entrenamiento.
- Eficiencia de agente mejorada: resuelve tareas con un 39% menos de llamadas a herramientas que el modelo base en las tareas resueltas por ambos.
- Compatibilidad con despliegue LoRA en vLLM y llama.cpp (GGUF del adaptador).
- No se ha evaluado su rendimiento fuera del harness pi ni fuera de la familia de tareas SmolDataEnvs.

## Casos de uso

- Analisis de datos conversacional: conectar pi al modelo servido en vLLM para preguntas tipo "¿que region tuvo mayor crecimiento de ingresos en sales.csv?", donde el agente explora los ficheros y ejecuta Python para responder.
- Reduccion de coste en pipelines de agentes: al usar un 39% menos de llamadas a herramientas, cada sesion de analisis consume menos tokens de contexto y menos tiempo de GPU, util en despliegues con volumen alto de consultas.
- Agentes de analisis autoalojados: el modelo base y el adaptador pueden servirse en infraestructura propia con vLLM, evitando APIs de terceros para datos sensibles de empresa.
- Evaluacion de agentes con Harbor/OpenEnv: sirve como referencia practica para montar pipelines de RL sobre entornos de agente con TRL, reutilizando el script `examples/async_grpo_harbor`.
- Prototipado de adaptadores por harness: el patron "LoRA entrenada dentro de los prompts y herramientas de un agente concreto" puede replicarse para otros harnesses de coding agent.
- Inferencia local ligera del adaptador: mediante llama.cpp con el GGUF del adaptador (F16) sobre el GGUF base (Q8_0), para estaciones de trabajo sin cluster de GPUs, aunque la version GGUF no ha sido reevaluada.

## Benchmarks y rendimiento

Evaluacion con el harness pi sobre las primeras 100 tareas de FineEnvs/SmolDataEnvs-harbor-test, un intento por tarea a temperatura 0,8, emparejado contra el modelo base:

| Metrica | vs modelo base |
|---|---|
| pass@1 | −4,2 puntos (dentro del ruido: aproximadamente ±5 puntos con 100 tareas) |
| Llamadas a herramientas (en tareas resueltas por ambos) | −39% |

No hay comparacion con otros modelos ni benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La precision se mantiene dentro del ruido del modelo base durante todo el entrenamiento, con un empeoramiento al final (paso 110), motivo por el que se publica el checkpoint del paso 100.

## Requisitos de hardware

- El adaptador en si ocupa unos 0,1 GB; el requisito real lo impone el modelo base LFM2.5-24B-A2B, cuyas especificaciones de VRAM no constan en la informacion disponible (el nombre sugiere 24B de parametros totales con unos 2B activos, tipo MoE, pero no esta confirmado en la ficha).
- Entrenamiento: 1× NVIDIA B300, con vLLM y el entrenador compartiendo la misma GPU.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 32`, `--tool-call-parser lfm2` y `--reasoning-parser qwen3`, con `--max-model-len 131072`.
- Alternativa en consumer/local: llama.cpp con el GGUF base Q8_0 mas el GGUF del adaptador F16, con contexto de 65.536 tokens y `--jinja` para tool calling.
- Ollama y TGI: no se mencionan en la documentacion disponible.
- Latencia y throughput: no disponibles; la reduccion del 39% en llamadas a herramientas implica indirectamente sesiones mas rapidas y baratas que con el modelo base.

## Comparativa con modelos similares

| | LFM2.5-24B-A2B-pi (adaptador) | LiquidAI/LFM2.5-24B-A2B (base) | Alternativas comparables |
|---|---|---|---|
| Tipo | LoRA r=32 sobre base | Modelo base completo | no disponible |
| Parametros | no disponible | no disponible | no disponible |
| Contexto | 131.072 (vLLM) | 131.072 (vLLM) | no disponible |
| pass@1 (Harbor/pi) | −4,2 pts vs base (dentro del ruido) | referencia | no disponible |
| Llamadas a herramientas | −39% vs base | referencia | no disponible |
| Licencia | lfm1.0 | lfm1.0 | no disponible |
| Disponibilidad | HuggingFace, safetensors y GGUF | HuggingFace, safetensors y GGUF | no disponible |

No se han publicado comparaciones con otros modelos o adaptadores de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Evaluacion pequena: 100 tareas implican un ruido de aproximadamente ±5 puntos en pass@1, por lo que las diferencias de precision no son estadisticamente significativas.
- Una sola familia de tareas: entrenamiento y evaluacion se limitan a tareas de analisis de datos de SmolDataEnvs; las mejoras de eficiencia pueden no transferirse a otros tipos de trabajo de codigo.
- Un solo harness: el adaptador se entreno dentro de los prompts y herramientas de pi; con otro agente cabe esperar un comportamiento igual al del modelo base, o peor.
- La version GGUF del adaptador no ha sido reevaluada, por lo que su rendimiento no esta verificado.
- Con pi es imprescindible usar la API `openai-completions` (no la Responses API) y el parser `lfm2` en vLLM; una configuracion incorrecta degrada el funcionamiento.
- El checkpoint del paso 110 empeora la precision; usar el paso 100 publicado.
- Restricciones de licencia: licencia lfm1.0 ("other") heredada del modelo base; conviene revisar el enlace de licencia de LiquidAI antes de uso comercial.
- Sesgos y riesgo de alucinacion: no disponibles datos especificos; al ser un modelo agentico que ejecuta herramientas, los errores del modelo pueden propagarse a operaciones reales sobre datos.
- Metricas de descargas muy bajas (10 descargas, 7 likes en el momento de la ficha): proyecto de nicho sin adopcion comunitaria demostrada.

## Enlaces

- Ficha del adaptador: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de evaluacion: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-test
- Adaptador en GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-harbor-pi-lora-GGUF
- Agente pi: https://github.com/earendil-works/pi
- Entrenador AsyncGRPO (TRL): https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Entorno Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
