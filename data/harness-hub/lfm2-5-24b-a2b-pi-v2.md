# harness-hub/LFM2.5-24B-A2B-pi-v2

## Resumen
LFM2.5-24B-A2B-pi-v2 es un adaptador LoRA sobre el modelo base LiquidAI/LFM2.5-24B-A2B, desarrollado por harness-hub. Se ha entrenado mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) para funcionar como el modelo subyacente del agente de programación pi en tareas de análisis de datos. El adaptador no es un modelo independiente: requiere el modelo base para funcionar y se distribuye como pesos PEFT en formato safetensors.

El problema que aborda es la eficiencia de los agentes en entornos de herramientas: durante el entrenamiento, cada rollout es una sesión completa de pi en un sandbox remoto donde el agente lee la tarea, ejecuta herramientas de shell y Python sobre los ficheros de datos y responde. Un verificador califica la respuesta y esa señal alimenta el entrenamiento. El resultado declarado por el autor es una precisión similar a la del modelo base en tareas de análisis de datos, con un 20 % menos de llamadas a herramientas en las tareas que ambos resuelven.

La relevancia actual reside en el creciente interés por adaptar modelos open source a agentes concretos mediante RL sobre trayectorias reales, en lugar de ajuste supervisado clásico. El adaptador está pensado para servir con vLLM (con soporte LoRA) o llama.cpp y conectarse al agente pi mediante una API compatible con OpenAI. El repositorio ocupa 0,1 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM2.5-24B-A2B; r = 32, alpha = 64, todas las capas lineales |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base es LFM2.5-24B-A2B) |
| Parametros activos | no disponible (el modelo base es MoE según su nomenclatura A2B, pero la cifra no se detalla en la información proporcionada) |
| Longitud de contexto | 131.072 tokens en la configuración de servicio con vLLM; 65.536 tokens en el ejemplo con llama.cpp |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (PEFT) y en GGUF F16; el modelo base se usa en Q8_0 en el ejemplo con llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face, con enlace a la licencia del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF (adaptador F16 en repositorio separado) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre LiquidAI/LFM2.5-24B-A2B, un modelo de la familia LFM2.5 de LiquidAI. La información disponible no detalla la arquitectura interna del modelo base más allá de su nomenclatura (24B con activación A2B, compatible con un esquema de mezcla de expertos), por lo que los detalles de atención, capas y composición del dataset preentrenamiento no están disponibles. El adaptador en sí es un LoRA de rango 32 y alpha 64 aplicado a todas las capas lineales.

El entrenamiento emplea AsyncGRPO, el entrenador experimental de GRPO asíncrono de TRL, sobre tareas del entorno Harbor servidas por OpenEnv, con rollouts en sandboxes de Hugging Face y cribado de llamadas a herramientas mediante safeagents. El agente utilizado es pi. Se entrenó sobre 300 tareas de SmolDataEnvs y 230 de traj2envs hasta el checkpoint publicado (paso 170 de una ejecución de 200). La recompensa combina la corrección del verificador de la tarea (con reserva a `reward`) y un bonus de eficiencia de herramientas de peso 0,1. Hiperparámetros: learning rate 1e-5, 8 rollouts por tarea, temperatura 0,8, hasta 17 llamadas al modelo y 600 s por rollout, 4 micro-lotes de hasta 131.072 tokens por paso y rollouts con hasta 4 versiones de política de antigüedad. El entrenamiento se ejecutó en 4× NVIDIA H200 en HF Jobs: vLLM en una GPU y un entrenador por harness en cada una de las otras tres.

## Capacidades
- Ejecución de tareas de análisis de datos dentro de un agente: lectura de ficheros, ejecución de shell y Python y respuesta final verificable.
- Uso de herramientas (tool calling) mediante el parser de herramientas `lfm2` en vLLM y el modo `openai-completions`.
- Razonamiento multi-paso en sesiones de agente con hasta 17 llamadas al modelo por rollout durante el entrenamiento.
- Eficiencia de herramientas: reducción del 20 % en llamadas a herramientas en las tareas que resuelve, según la evaluación del autor.
- Compatibilidad con el agente pi (Node.js 22.19 o superior) mediante configuración de proveedor local.
- Compatibilidad con llama.cpp a través del adaptador GGUF F16 sobre el modelo base en Q8_0.
- Capacidades multilingües: no disponible.
- Modo de razonamiento: el ejemplo de vLLM activa `--reasoning-parser qwen3`, lo que sugiere soporte de trazas de razonamiento, aunque no se detalla en la información proporcionada.

## Casos de uso
- Análisis de datos ad hoc con agente: el adaptador permite a pi responder preguntas sobre ficheros CSV y otros datos ejecutando código Python y shell en un sandbox, con una precisión del 85,9 % en las 150 tareas de evaluación del autor. Es adecuado porque se entrenó específicamente sobre ese tipo de tareas.
- Reducción de coste de herramientas en pipelines de agentes: al recortar un 20 % las llamadas a herramientas en las tareas resueltas, disminuye el coste por sesión en entornos donde cada llamada implica latencia y consumo de tokens.
- Automatización de informes exploratorios: un agente conectado al adaptador puede inspeccionar un directorio de datos, calcular agregados y devolver una respuesta verificable, integrable en flujos de trabajo internos de análisis.
- Evaluación de agentes de código en entornos controlados: el adaptador sirve como referencia para comparar harnesses y políticas de herramientas, ya que el autor publica la configuración exacta de vLLM y pi usada en la evaluación.
- Despliegue local con llama.cpp: para equipos que no disponen de GPUs de datacenter, el adaptador GGUF F16 sobre el base en Q8_0 permite ejecutar el agente con contexto de 65.536 tokens en hardware más modesto, aunque sin reevaluación publicada.
- Investigación en RL para agentes: el adaptador y su receta (AsyncGRPO, Harbor, OpenEnv, safeagents) sirven como punto de partida reproducible para entrenar políticas de agente sobre trayectorias reales, con el script `examples/async_grpo_harbor` de TRL.

## Benchmarks y rendimiento
Evaluación con el harness pi, un intento por tarea a temperatura 0,8, comparación pareada contra el modelo base en las mismas tareas. Intervalo de confianza del 95 %; las llamadas a herramientas se comparan solo en las tareas que ambos resuelven.

| Tareas | n | Modelo base | Este adaptador (paso 170) | Diferencia (puntos) | Llamadas a herramientas |
|---|---|---|---|---|---|
| 150 tareas reservadas de FineEnvs/SmolDataEnvs-harbor-train | 149 | 83,2 % | 85,9 % | +2,7 ± 4,6 | -20 % (120 tareas) |
| 40 tareas reservadas de harness-hub/traj2envs-rl | 40 | 22,5 % | 17,5 % | -5,0 ± 13,9 | +6 % (4 tareas) |

El propio autor advierte que el checkpoint (paso 170 de 200) se eligió mirando las puntuaciones en esta misma evaluación, por lo que la diferencia de la primera fila es optimista. La versión GGUF no ha sido reevaluada.

## Requisitos de hardware
- El adaptador LoRA en sí ocupa 0,1 GB; el requisito real lo marca el modelo base LFM2.5-24B-A2B.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; depende de la cuantización y del esquema de activación del modelo base.
- GPU recomendadas según el entrenamiento publicado: 4× NVIDIA H200 para el pipeline completo de AsyncGRPO con vLLM y tres entrenadores. Para inferencia, el autor no especifica GPU concretas.
- Cabe en GPU de consumo: no confirmado; el ejemplo con llama.cpp usa el base en Q8_0 y contexto de 65.536 tokens, pero no se detalla el hardware mínimo.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules`, y llama.cpp con `llama serve` y `--lora`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-pi-v2 (este) | LoRA sobre base 24B-A2B | 131.072 (vLLM) | Adaptador RL para agente pi en análisis de datos | lfm1.0 | Hugging Face (PEFT y GGUF) |
| LiquidAI/LFM2.5-24B-A2B (base) | 24B-A2B | no disponible | Modelo generalista | lfm1.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias
- Evaluación pequeña: 149 tareas dejan el intervalo del 95 % en ±4,6 puntos para la diferencia pareada de pass@1.
- Una sola familia de tareas: entrenamiento y evaluación principal se centran en análisis de datos; en las tareas de repositorio de traj2envs no mejora al modelo base (-5,0 ± 13,9 puntos).
- Un solo harness: el adaptador se entrenó con los prompts y herramientas de pi; con otro agente cabe esperar un comportamiento igual o peor que el del modelo base.
- Sesgo de selección del checkpoint: el paso 170 se eligió sobre la misma evaluación que se reporta, lo que infla la diferencia de la primera fila.
- La versión GGUF no ha sido reevaluada, por lo que su rendimiento es incierto.
- Licencia lfm1.0: es necesario revisar sus términos para uso comercial, ya que la model card la marca como "other" y remite al fichero de licencia del modelo base.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al ser un adaptador de agente que ejecuta código, los errores pueden propagarse a las respuestas finales.
- Idiomas soportados: no disponibles, lo que impide garantizar un comportamiento multilingüe fiable.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Adaptador GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi-v2-GGUF
- Dataset de entrenamiento principal: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de tareas de repositorio: https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Agente pi: https://github.com/earendil-works/pi
- Documentación de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- Script de entrenamiento: https://github.com/huggingface/trl/tree/main/examples/async_grpo_harbor
- Harbor: https://github.com/laude-institute/harbor
- OpenEnv: https://github.com/huggingface/OpenEnv
- safeagents: https://github.com/huggingface/safeagents
- HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
