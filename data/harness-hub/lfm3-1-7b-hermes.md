# harness-hub/LFM3-1.7B-hermes

## Resumen

LFM3-1.7B-hermes es un adaptador LoRA sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario harness-hub. No se trata de un modelo completo, sino de un ajuste fino mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) orientado a convertir el modelo base en el motor de un agente autónomo de análisis de datos: el Hermes Agent de NousResearch. El adaptador se entrena ejecutando sesiones completas del agente en sandboxes remotos, donde el modelo lee tareas, invoca herramientas de shell y Python sobre ficheros de datos y responde; un verificador externo califica la respuesta y esa señal alimenta el entrenamiento.

El checkpoint publicado corresponde al paso 400 de una tirada de 400 pasos y reporta una mejora de 16,0 puntos porcentuales en tareas de análisis de datos retenidas (62,0% del base frente a 78,0% del adaptador, con intervalo de confianza del 95% de ±7,0), además de un 38% menos de llamadas a herramientas en las tareas que ambos resuelven. En tareas de repositorio reconstruidas desde sesiones reales (traj2envs) el resultado es neutro dentro del ruido estadístico (-7,5 ± 10,8 puntos).

La relevancia del artefacto es doble: por un lado demuestra un pipeline de RL con agentes reales sobre un modelo pequeño (1,7B parámetros) y contexto largo (131.072 tokens en la configuración de servicio); por otro, su alcance es deliberadamente estrecho: un único harness (Hermes), una única familia de tareas (análisis de datos) y una evaluación de solo 150 tareas, lo que limita su uso en producción fuera de ese nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM3-1.7B (modelo base de tipo LFM3, clase vLLM `Lfm3ForCausalLM`); la arquitectura interna del base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1,7B parametros. LoRA con r = 32, alpha = 64, aplicado a todas las capas lineales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion de vLLM usada en entrenamiento y evaluacion; Hermes requiere al menos 64.000 tokens de contexto |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (formato PEFT) y en GGUF F16 (repositorio `LFM3-1.7B-hermes-GGUF`); las cuantizaciones del modelo base estan en `LiquidAI/LFM3-1.7B-GGUF` (p. ej. Q8_0) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face, con enlace a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (adaptador LoRA F16 para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se entrena con AsyncGRPO, el entrenador experimental de TRL para GRPO asíncrono, sobre el modelo base LFM3-1.7B. Cada rollout es una sesión completa del Hermes Agent en un sandbox de Hugging Face: el agente recibe la tarea, ejecuta herramientas de shell y Python contra los ficheros de datos del entorno y emite una respuesta final. Las tareas provienen de Harbor y se sirven mediante OpenEnv, y las llamadas a herramientas pasan por el filtro de seguridad de safeagents. La recompensa combina la corrección de la respuesta según el verificador de la tarea (con reserva a `reward` si no hay `correctness`) más un bono de eficiencia de herramientas con peso 0,1.

Los hiperparámetros del entrenamiento son: 474 tareas de SmolDataEnvs vistas hasta este checkpoint, 400 pasos, learning rate 1e-5, LoRA r=32 y alpha=64 en todas las capas lineales, 8 rollouts por tarea con temperatura 0,8, hasta 17 llamadas al modelo y 600 s por rollout, micro-lotes de hasta 65.536 tokens y rollouts con hasta 4 versiones de política de antigüedad. El cómputo se realizó en 2× NVIDIA H200 en HF Jobs: vLLM en una GPU y los tres entrenadores (uno por harness) compartiendo la otra. La innovación principal es el uso de GRPO asíncrono con sesiones de agente reales y verificación automática como señal de recompensa, aplicado a un modelo de 1,7B parámetros.

## Capacidades

- Ejecución de tareas de análisis de datos dentro de un agente: lectura de ficheros, ejecución de comandos de shell y scripts Python, y respuesta final verificable.
- Tool calling / function calling: soportado a través del parser `qwen3_coder` en vLLM y del formato de herramientas de Hermes.
- Razonamiento multi-paso con agentes: el modelo encadena hasta 17 llamadas al modelo por rollout en la configuración de entrenamiento.
- Modo de razonamiento: el servicio de vLLM usa el parser de razonamiento `qwen3`, lo que indica soporte de bloques de pensamiento en el formato de chat.
- Contexto largo: ventana de 131.072 tokens en la configuración de referencia, suficiente para sesiones de agente con historial extenso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Agente de análisis de datos sobre ficheros tabulares: el adaptador está entrenado específicamente para leer tareas, inspeccionar CSV y otros datos con shell y Python, y responder preguntas como "¿qué región tuvo el mayor crecimiento de ingresos en sales.csv?". Es su caso de uso principal y el único con evidencia empírica de mejora (+16,0 puntos sobre el base).
- Automatización de informes exploratorios: integrado en Hermes con contexto de 64.000 tokens o más, puede mantener sesiones largas que inspeccionan varios ficheros, ejecutan agregaciones y producen un resumen final, con un 38% menos de llamadas a herramientas que el base en las tareas resueltas por ambos.
- Pipelines de CI/CD con agentes de código y datos: al soportar tool calling y servirse con vLLM (`--enable-auto-tool-choice`), puede integrarse en flujos automatizados que ejecutan scripts y validan resultados contra un verificador.
- Prototipado de agentes en local con llama.cpp: la versión GGUF del adaptador permite probar el comportamiento del agente en una máquina sin GPU de datacenter, usando el base Q8_0 más el LoRA F16 y una ventana de 65.536 tokens.
- Investigación en RL para agentes: el checkpoint y el script `examples/async_grpo_harbor` de TRL sirven como referencia reproducible para entrenar agentes pequeños con GRPO asíncrono y recompensas verificadas.
- Evaluación comparativa de harnesses: al estar entrenado dentro de los prompts y herramientas de Hermes, permite medir cuánto de la mejora de un agente proviene del ajuste del modelo frente al diseño del harness.

## Benchmarks y rendimiento

Evaluación con el harness de Hermes, un intento por tarea a temperatura 0,8, comparación pareada contra el modelo base en las mismas tareas, intervalo de confianza del 95%. Las llamadas a herramientas se comparan solo en las tareas resueltas por ambos.

| Tareas | n | Modelo base | Adaptador (paso 400) | Diferencia (puntos) | Llamadas a herramientas |
|---|---|---|---|---|---|
| 150 tareas retenidas de FineEnvs/SmolDataEnvs-harbor-train | 150 | 62,0% | 78,0% | +16,0 ± 7,0 | -38% (89 tareas) |
| 40 tareas retenidas de harness-hub/traj2envs-rl | 40 | 25,0% | 17,5% | -7,5 ± 10,8 | -36% (6 tareas) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1,7B parámetros; en FP16/BF16 ocupa en torno a 3,4 GB de pesos, y en Q8_0 en torno a 1,8 GB, más el adaptador LoRA (r=32, alpha=64, repo de 0,1 GB) y la caché KV para contextos de hasta 131.072 tokens, que puede dominar el consumo en sesiones largas.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA H200; para inferencia con contexto completo de 131.072 tokens conviene una GPU de datacenter (A100, H100, H200) por la memoria de la caché KV. Con contextos de 64.000 tokens, propio de Hermes, el requisito baja de forma notable.
- GPU de consumo: al ser un modelo de 1,7B, cabe en GPUs de consumo con suficiente VRAM para el contexto elegido; los requisitos concretos por modelo no están publicados en la información disponible.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3` y `--max-model-len 131072`; llama.cpp con `llama serve` y `--lora` sobre el base GGUF Q8_0 con `-c 65536`. En el momento del entrenamiento, LFM3 no era soportado por una release de vLLM y se usó el commit `fac2ce2eb3633c44a104a66dbb30d0e6c7f4493e` con parches de `atmikshetty/vllm@5f67fbc`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-hermes (este) | 1,7B + LoRA r=32 | 131.072 tokens en vLLM | 78,0% en 150 tareas de SmolDataEnvs; 17,5% en traj2envs | lfm1.0 | Hugging Face (safetensors y GGUF) |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 131.072 tokens en la misma configuración | 62,0% en SmolDataEnvs; 25,0% en traj2envs | lfm1.0 | Hugging Face |
| Otros adaptadores de agente sobre modelos de ~1,7B | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar de forma rigurosa con el modelo base. No se dispone de datos de benchmarks frente a alternativas de otros autores en la misma categoría.

## Limitaciones y advertencias

- Evaluación pequeña: 150 tareas sitúan el intervalo de confianza del 95% de la diferencia pareada en ±7,0 puntos, por lo que la mejora real podría ser menor que el +16,0 reportado.
- Una sola familia de tareas: entrenamiento y evaluación principal se centran en análisis de datos; en las tareas de repositorio de traj2envs no mejora al base (-7,5 ± 10,8 puntos).
- El checkpoint nunca vio las tareas de traj2envs durante el entrenamiento, así que ese resultado mide transferencia desde SmolDataEnvs y no rendimiento directo.
- Un solo harness: el adaptador se entrenó con los prompts y herramientas de Hermes; con otro agente cabe esperar un comportamiento igual o peor que el del modelo base.
- La versión GGUF no ha sido reevaluada, por lo que su rendimiento no está verificado.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible; como adaptador de un modelo pequeño orientado a agentes, la verificación externa de resultados sigue siendo necesaria en producción.
- Restricciones de licencia: licencia lfm1.0 (etiquetada como `other`), con términos definidos en el repositorio del modelo base; conviene revisar las condiciones de uso comercial antes de desplegarlo.
- Dependencia de versiones: el soporte de LFM3 en vLLM requería parches en el momento del entrenamiento; con versiones que incluyan `Lfm3ForCausalLM` la configuración estándar es suficiente, pero hay que verificar la compatibilidad antes de desplegar.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/harness-hub/LFM3-1.7B-hermes
- Adaptador en GGUF: https://huggingface.co/harness-hub/LFM3-1.7B-hermes-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de evaluación traj2envs: https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- safeagents: https://github.com/huggingface/safeagents
- Documentación de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Parche de vLLM para LFM3: https://github.com/atmikshetty/vllm/tree/5f67fbcbb2336b0e551c0df2b4c0eb51b030c553
- HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
