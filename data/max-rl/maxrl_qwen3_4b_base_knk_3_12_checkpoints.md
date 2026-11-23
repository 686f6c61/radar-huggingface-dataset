# max-rl/maxrl_qwen3_4B_base_knk_3_12_checkpoints

## Resumen

MaxRL Qwen3-4B-Base on Knights-and-Knaves es una coleccion de checkpoints intermedios resultantes de un ajuste fino mediante aprendizaje por refuerzo (RL online) sobre el modelo base Qwen3-4B-Base de Alibaba. Lo desarrolla el colectivo max-rl y su proposito no es tanto ofrecer un modelo listo para produccion como documentar de forma reproducible la evolucion del entrenamiento con su receta MaxRL sobre una tarea concreta de razonamiento: el juego Knights-and-Knaves (caballeros y escuderos), un problema clasico de logica deductiva con restricciones de veracidad.

El repositorio contiene exportaciones en bf16 en formato Hugging Face del actor en cada 100 pasos de un entrenamiento de 1000 pasos, es decir, diez checkpoints (`global_step_100` a `global_step_1000`). No incluye estado del optimizador ni del FSDP, solo los pesos del actor, lo que lo hace util para analisis de curvas de aprendizaje, ablaciones y comparacion entre pasos intermedios. El modelo subyacente es un transformer denso de 4B parametros con la arquitectura Qwen3, aunque la model card no detalla la longitud de contexto ni la composicion del dataset de preentrenamiento.

Su relevancia es fundamentalmente metodologica: sirve como referencia para estudiar como evoluciona un modelo de 4B bajo RL con correccion de rollout y para reproducir el pipeline MaxRL. El checkpoint final (paso 1000) alcanza un 0.8265 de media@4 y un 0.917 de best@4 en el conjunto de evaluacion de Knights-and-Knaves, con n=4 y temperatura 0.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), segun modelo base Qwen/Qwen3-4B-Base |
| Parametros totales | 4B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene exportaciones en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportaciones Hugging Face en bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer denso de 4B parametros. Sobre el se aplica un entrenamiento de RL online de 1000 pasos con la receta MaxRL sobre el dataset `max-rl/knk_n3_12`, centrado en la tarea Knights-and-Knaves. La receta se divide en dos fases: los pasos 1-240 siguen la configuracion original (run de W&B `paprika_online/knk_Qwen3-1.7B-Base_fasrc`, `p0po2mc5`), y a partir del paso 241 se reanuda desde el checkpoint del paso 240 activando correccion de rollout (run `vh5xg3do`), con un peso de importancia truncado a nivel de token `min(pi_train / pi_vllm, 2)` en modo bypass, manteniendo el learning rate y el resto de hiperparametros sin cambios.

El layout y la receta son identicos a los de `max-rl/maxrl_knk_3_12_checkpoints` (basado en Qwen3-1.7B-Base), con el unico cambio del modelo base. Se exportan diez checkpoints en bf16 en `global_step_N/actor/huggingface` para N = 100, 200, ..., 1000. No se incluye estado del optimizador ni de FSDP, y no se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento logico-deductivo, especializado mediante RL en la tarea Knights-and-Knaves.
- Resolucion de problemas de logica con restricciones de veracidad (caballeros que siempre dicen la verdad, escuderos que siempre mienten).
- Diez checkpoints intermedios que permiten analizar la evolucion de la capacidad de razonamiento paso a paso.
- Capacidades generales heredadas de Qwen3-4B-Base (generacion, codigo, matematicas), aunque no se documentan explicitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RL para LLM: el repositorio permite estudiar la curva de aprendizaje paso a paso (cada 100 pasos) de un modelo de 4B bajo la receta MaxRL, comparando checkpoints intermedios frente al final.
- Reproducibilidad de experimentos: al documentarse los runs de W&B y la configuracion exacta (incluida la correccion de rollout a partir del paso 241), sirve como referencia para replicar o auditar el pipeline.
- Analisis de correccion de rollout: permite comparar el comportamiento antes y despues de activar el peso de importancia truncado `min(pi_train / pi_vllm, 2)`, aislando su efecto sobre el rendimiento.
- Evaluacion de tecnicas de razonamiento: el conjunto de evaluacion de Knights-and-Knaves con n=4 y T=0.6 permite medir media@4 y best@4 de forma estandarizada entre checkpoints.
- Base para ajuste posterior: cualquiera de los diez checkpoints puede servir como punto de partida para experimentos de RL adicionales o de ajuste supervisado sobre tareas de logica.
- Estudio de escalado de tamano: al compartir receta con la variante de 1.7B, facilita comparaciones controladas del efecto del tamano del modelo (1.7B frente a 4B) bajo el mismo entrenamiento.
- Docencia y divulgacion: util para ilustrar como un modelo base mejora en una tarea de razonamiento concreta a lo largo de 1000 pasos de RL.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible (checkpoint final, paso 1000, conjunto de evaluacion de Knights-and-Knaves, n=4, T=0.6):

| Metrica | Valor |
|---|---|
| media@4 | 0.8265 |
| best@4 | 0.917 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo denso de 4B en bf16 se requiere aproximadamente 8 GB solo para pesos, mas memoria para KV cache y overhead, aunque esta cifra no la proporciona la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano (4B) es plausible en GPUs de consumo con suficiente VRAM, pero no se documenta.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.
- Nota de almacenamiento: el repositorio ocupa 80.5 GB, lo que refleja los diez checkpoints en bf16; para inferencia basta con descargar un unico checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| max-rl/maxrl_qwen3_4B_base_knk_3_12_checkpoints | 4B | no disponible | media@4 0.8265, best@4 0.917 en KnK | no disponible | Hugging Face |
| max-rl/maxrl_knk_3_12_checkpoints (Qwen3-1.7B-Base) | 1.7B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-4B-Base | 4B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (mismo tamano o misma tarea) no esta disponible en la informacion proporcionada mas alla de las variantes citadas.

## Limitaciones y advertencias

- Modelo de investigacion: son checkpoints intermedios de un experimento de RL, no un modelo afinado para produccion; no se garantiza calidad fuera de la tarea Knights-and-Knaves.
- Especializacion estrecha: el entrenamiento se centra en un unico dataset (`max-rl/knk_n3_12`); el rendimiento en tareas generales puede degradarse respecto al modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo base con RL sobre logica, puede producir razonamientos plausibles pero incorrectos fuera de distribucion.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: no disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo base Qwen3-4B-Base y la del repositorio.
- Ausencia de estado de entrenamiento: no se incluyen optimizador ni FSDP, por lo que no es posible reanudar el entrenamiento exactamente desde estos checkpoints.
- Fecha de creacion atipica (2026-11-23) y cero descargas/likes: sin validacion externa por parte de la comunidad.
- El checkpoint del paso 1000 es el unico con metricas publicadas; los intermedios no tienen evaluacion documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/max-rl/maxrl_qwen3_4B_base_knk_3_12_checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/max-rl/knk_n3_12
- Rollouts de todos los pasos: https://huggingface.co/datasets/max-rl/maxrl_qwen3_4B_base_knk_3_12_rollout1000
- Variante de 1.7B con la misma receta: https://huggingface.co/max-rl/maxrl_knk_3_12_checkpoints
- Run de W&B (pasos 1-240): `paprika_online/knk_Qwen3-1.7B-Base_fasrc`, run `p0po2mc5` (enlace directo no disponible)
- Run de W&B (pasos 241-1000): run `vh5xg3do` (enlace directo no disponible)
