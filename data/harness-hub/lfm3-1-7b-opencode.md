# harness-hub/LFM3-1.7B-opencode

## Resumen

LFM3-1.7B-opencode es un adaptador LoRA entrenado mediante aprendizaje por refuerzo sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario harness-hub. Su propósito específico es actuar como el modelo subyacente del agente de programación OpenCode en tareas de análisis de datos, donde el agente lee un enunciado, ejecuta herramientas de shell y Python contra ficheros de datos en un sandbox remoto y responde con un resultado verificable.

El adaptador se entrena con AsyncGRPO de TRL sobre entornos Harbor servidos por OpenEnv, con rollouts completos de sesiones OpenCode y recompensa basada en el verificador de cada tarea más un bonus de eficiencia de herramientas. El checkpoint publicado corresponde al paso 400 de una ejecución de 400 pasos, con LoRA de rango 32 sobre todas las capas lineales.

La relevancia de esta ficha es doble: por un lado, demuestra una mejora medible de +15,3 puntos en tareas de análisis de datos retenidas respecto al modelo base, con un 43% menos de llamadas a herramientas en las tareas que ambos resuelven; por otro, es un ejemplo práctico de entrenamiento por refuerzo asíncrono con agentes reales, un paradigma en auge para especializar modelos pequeños en flujos de trabajo concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer LiquidAI/LFM3-1.7B (arquitectura del base: no detallada en la informacion disponible) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 131.072 tokens en la configuracion de vLLM proporcionada; 65.536 en la configuracion de llama.cpp |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (PEFT); existe version GGUF del adaptador en F16 y el base en Q8_0 para llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (other), enlazada a la licencia del modelo base |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B mediante LoRA con rango 32, alpha 64 y cobertura de todas las capas lineales. El entrenamiento emplea AsyncGRPO, el entrenador experimental de GRPO asíncrono de TRL, con 8 rollouts por tarea a temperatura 0.8, hasta 17 llamadas al modelo y 600 segundos por rollout. Cada rollout es una sesión completa de OpenCode en un sandbox de Hugging Face, con llamadas a herramientas filtradas por safeagents y entornos Harbor servidos por OpenEnv.

La recompensa combina la señal `correctness` del verificador de la tarea (con retroceso a `reward`) más un bonus de eficiencia de herramientas con peso 0.1. Se entrenó sobre 550 tareas de SmolDataEnvs y 107 de traj2envs hasta este checkpoint, con un learning rate de 1e-5, micro-lotes de hasta 65.536 tokens y rollouts con hasta 4 versiones de política de antigüedad. El cómputo se repartió en 2× NVIDIA H200 en HF Jobs: vLLM en una GPU y los tres entrenadores (uno por harness) compartiendo la otra. El script de entrenamiento está publicado como `examples/async_grpo_harbor` en el repositorio de TRL.

## Capacidades

- Ejecución de tareas de análisis de datos dentro de un agente: lectura de enunciados, inspección de ficheros, ejecución de comandos de shell y scripts Python, y respuesta final verificable.
- Uso de herramientas (tool calling) en el formato y los prompts específicos de OpenCode, con parser `qwen3_coder` y parser de razonamiento `qwen3` en vLLM.
- Razonamiento multi-paso dentro de una sesión de agente, con hasta 17 llamadas al modelo por rollout en entrenamiento.
- Eficiencia de herramientas mejorada: un 43% menos de llamadas en las tareas que resuelve, respecto al modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no documentado en la información disponible.

## Casos de uso

- Análisis exploratorio de datos automatizado: el adaptador puede recibir un enunciado sobre un CSV y ejecutar comandos de shell y Python para inspeccionar columnas, calcular agregados y responder preguntas como qué región tuvo mayor crecimiento de ingresos, que es precisamente el ejemplo de uso documentado.
- Agente de programación en local con OpenCode: sirviendo el adaptador con vLLM y apuntando OpenCode al endpoint OpenAI-compatible, se obtiene un agente de código que funciona sin depender de APIs externas, adecuado para entornos con requisitos de privacidad.
- Automatización de informes sobre repositorios de datos: el modelo puede encadenar lecturas de ficheros, ejecuciones de scripts y verificaciones para producir respuestas trazables sobre conjuntos de datos versionados.
- Evaluación de pipelines de agentes: al estar entrenado con un harness y verificadores concretos, sirve como referencia para medir la eficiencia de herramientas y la tasa de éxito de un agente en tareas de análisis.
- Despliegue en hardware de consumo: la versión GGUF del adaptador sobre el base en Q8_0 permite ejecutar el agente con llama.cpp en una estación de trabajo, con contexto de hasta 65.536 tokens.
- Prototipado de entrenamiento por refuerzo con agentes: el script de TRL y la configuración publicada permiten reproducir el pipeline AsyncGRPO sobre entornos Harbor para especializar otros modelos pequeños.
- Asistente de consultas sobre datos tabulares en línea de comandos: integrado en OpenCode, el modelo puede responder preguntas puntuales sobre ficheros locales con un número reducido de llamadas a herramientas, lo que abarata el coste por consulta.

## Benchmarks y rendimiento

Evaluación con el harness OpenCode, un intento por tarea a temperatura 0.8, comparación emparejada contra el modelo base en las mismas tareas. Intervalo de confianza del 95%; las llamadas a herramientas se comparan solo en las tareas que ambos resuelven.

| Tareas | n | Modelo base | Adaptador (paso 400) | Diferencia (puntos) | Llamadas a herramientas |
|---|---|---|---|---|---|
| 150 tareas retenidas de FineEnvs/SmolDataEnvs-harbor-train | 150 | 69,3% | 84,7% | +15,3 ± 6,6 | -43% (101 tareas) |
| 40 tareas retenidas de harness-hub/traj2envs-rl | 40 | 2,5% | 5,0% | +2,5 ± 4,9 | +33% (1 tarea) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La versión GGUF del adaptador no ha sido reevaluada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador LoRA añade una sobrecarga mínima sobre el modelo base de 1.7B. Con cuantización Q8_0 en GGUF, el base ocupa del orden de 1,7 GB de pesos más overhead de contexto y caché KV.
- GPU recomendadas: el entrenamiento y la evaluación usaron 2× NVIDIA H200 en HF Jobs, pero la inferencia del adaptador sobre un modelo de 1.7B es viable en GPUs mucho menores.
- GPU de consumo: sí cabe en GPUs de consumo; la ruta documentada con llama.cpp y GGUF Q8_0 está pensada para ejecución local.
- Opciones de despliegue: vLLM con `--enable-lora`, `--max-lora-rank 32`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3` y `--max-model-len 131072`; llama.cpp con `llama serve` y `--lora` sobre el GGUF del base; OpenCode como cliente vía endpoint OpenAI-compatible.
- Nota de compatibilidad: en el momento del entrenamiento, LFM3 no estaba soportado por una release de vLLM; se usó el commit `fac2ce2eb3633c44a104a66dbb30d0e6c7f4493e` con parches de `atmikshetty/vllm@5f67fbc`. Con una versión de vLLM que soporte `Lfm3ForCausalLM`, la configuración documentada es suficiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-opencode (este) | Adaptador LoRA sobre 1.7B | Hasta 131.072 en vLLM; 65.536 en llama.cpp | Agente de análisis de datos en OpenCode | lfm1.0 | Hugging Face (adaptador PEFT y GGUF) |
| LiquidAI/LFM3-1.7B (base) | 1.7B | No disponible en la información | Modelo generalista | lfm1.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros adaptadores de agente en la información proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Evaluación pequeña: 150 tareas sitúan el intervalo del 95% en ±6,6 puntos para la diferencia emparejada de pass@1, lo que limita la precisión de la mejora estimada.
- Una sola familia de tareas: el entrenamiento y la evaluación principal se centran en análisis de datos; en las tareas de repositorio de traj2envs no mejora al modelo base (+2,5 ± 4,9 puntos, dentro del ruido).
- Un solo harness: el adaptador se entrenó con los prompts y herramientas de OpenCode; con otro agente es previsible que su comportamiento se degrade.
- La versión GGUF del adaptador no ha sido reevaluada, por lo que su rendimiento real no está verificado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 1.7B en tareas de razonamiento y análisis.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia lfm1.0 (other): es necesario revisar los términos del modelo base antes de un uso comercial; la información proporcionada no detalla restricciones adicionales del adaptador.
- Dependencia de versiones concretas: el despliegue con vLLM requiere una versión que soporte `Lfm3ForCausalLM` o los parches indicados; OpenCode se probó con la versión 1.19.5.
- Contexto efectivo: aunque se configura hasta 131.072 tokens, el contexto real aprovechable en tareas largas no está medido en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/LFM3-1.7B-opencode
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Versión GGUF del adaptador: https://huggingface.co/harness-hub/LFM3-1.7B-opencode-GGUF
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Dataset de entrenamiento principal: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de tareas de repositorio: https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Repositorio de OpenCode: https://github.com/sst/opencode
- Repositorio de Harbor: https://github.com/laude-institute/harbor
- Repositorio de OpenEnv: https://github.com/huggingface/OpenEnv
- Repositorio de safeagents: https://github.com/huggingface/safeagents
- Documentación de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Parche de vLLM para LFM3: https://github.com/atmikshetty/vllm/tree/5f67fbcbb2336b0e551c0df2b4c0eb51b030c553
- Documentación de HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
