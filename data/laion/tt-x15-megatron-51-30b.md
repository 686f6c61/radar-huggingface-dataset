# laion/tt-x15-megatron-51-30B

## Resumen

tt-x15-megatron-51-30B es un checkpoint intermedio de un experimento de entrenamiento con aprendizaje por refuerzo (GRPO) desarrollado por LAION, basado en el modelo Qwen/Qwen3-Coder-30B-A3B-Instruct. Forma parte del experimento TaskTrove X15, que investigaba si ciertos hiperparámetros (lr 8e-6, eps_clip_low 0.3, temp 1.2) podían prevenir el colapso tardío observado en el experimento anterior X14. El modelo se entrenó con SkyRL y Terminus-2 sobre el dataset DCAgent/exp_rpt_multifile, utilizando infraestructura Megatron en clústeres de Iris/CoreWeave con GPUs H100.

El experimento se declaró fallido: el entrenamiento fue terminado en el paso 101 de 400 debido a un colapso de entropía que degradó la recompensa a aproximadamente el 8% de su pico. Este checkpoint concreto (paso 51) se conserva como control negativo de la familia de colapsos, no como un modelo listo para producción. Con 30.532 millones de parámetros totales (arquitectura MoE con 3.000 millones activos), este modelo tiene interés principalmente como caso de estudio sobre dinámicas de colapso en RL, no como herramienta utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Mixture of Experts) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3.000 millones (A3B, segun modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3-Coder-30B-A3B-Instruct, con 30,5 mil millones de parametros totales y 3 mil millones activos por token. El entrenamiento de refuerzo se realizo con el algoritmo GRPO (Group Relative Policy Optimization) implementado en SkyRL, con el framework Terminus-2 y runtime Megatron sobre 4x8 GPUs H100. El dataset de entrenamiento fue DCAgent/exp_rpt_multifile, orientado a tareas de agente con modificacion de multiples archivos.

El experimento X15 probaba una combinacion especifica de hiperparametros: learning rate de 8e-6, eps_clip_low de 0,3 y temperatura de 1,2. La hipotesis era que esta configuracion evitaria el colapso tardio observado en X14. El resultado fue negativo: el modelo colapso de forma identica. El mecanismo identificado fue un colapso de entropia que acorto la longitud de los tokens generados por turno (de 9.200 a 7.600), provocando que los agentes agotaran sus 30 turnos maximos sin completar las tareas. Los cap-hitters (agentes que alcanzan el limite de turnos) pasaron del 23% al 100%, y los tokens por turno cayeron de 572 a 281. El entrenamiento se detuvo en el paso 101 de 400.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3-Coder-30B-A3B-Instruct, incluyendo generacion de codigo y razonamiento.
- Razonamiento y codigo: el modelo base es un modelo de codigo de 30B con 3B activos, competente en tareas de programacion y razonamiento logico.
- Tool calling: soportado por el modelo base, aunque no verificado en este checkpoint.
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero este checkpoint se entreno exclusivamente en ingles.
- Limitacion critica: este checkpoint concreto no es utilizable para ninguna tarea practica porque el entrenamiento colapso. Las capacidades listadas corresponden al modelo base, no al resultado del entrenamiento RL.

## Casos de uso

- Investigacion sobre colapso en RL: el checkpoint sirve como control negativo documentado para estudiar el fenomeno de colapso de entropia en entrenamiento con GRPO. Los investigadores pueden analizar las metricas de entrenamiento (incluidas en training_logs/) para entender la dinamica del fallo.
- Analisis de dinamicas de recompensa: los datos del entrenamiento permiten estudiar como la recompensa alcanza un pico y se degrada, y como la longitud de los tokens generados se correlaciona con el colapso.
- Comparacion de hiperparametros: el experimento X15 (con lr 8e-6, eps_clip_low 0,3, temp 1,2) puede compararse con X14 y otros experimentos de la serie TaskTrove para entender que combinaciones de hiperparametros previenen o provocan colapso.
- Desarrollo de metodos de deteccion temprana de colapso: los datos de entrenamiento pueden usarse para desarrollar metricas que alerten antes de que el colapso sea irreversible.
- Estudio de la interaccion entre entropia y longitud de generacion: los datos muestran una correlacion clara entre la caida de entropia, la reduccion de tokens por turno y el agotamiento de turnos maximos.
- Evaluacion de infraestructura: el experimento documento problemas de almacenamiento (el dataset completo de trazas ocupaba ~256 GB y no cabia en el host de sincronizacion), util para planificar despliegues similares.
- No apto para uso en produccion: este checkpoint no debe usarse en aplicaciones reales. Su unico valor es cientifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son las metricas de entrenamiento del paso 51:

| Metrica | Valor |
|---|---|
| Recompensa trailing-5 | 0,2199 |
| Recompensa del paso | 0,2441 |
| Pass@8 | 0,4219 |
| Entropia | 0,0194 |

Estas metricas corresponden al momento del checkpoint, antes del colapso final. El pico de recompensa trailing-5 fue ~0,2273, alcanzado antes del paso 51. No hay datos de evaluacion en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE con 3B parametros activos, la inferencia puede ejecutarse en GPUs consumer con 16-24 GB de VRAM en cuantizacion FP16, o menos con cuantizacion.
- GPUs recomendadas: el entrenamiento se realizo en H100 (4x8 GPUs). Para inferencia, una RTX 4090 (24 GB) o A100 de 40 GB serian suficientes.
- Compatibilidad con consumer GPU: si, gracias a la arquitectura MoE con solo 3B parametros activos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y cualquier framework compatible con transformers y safetensors.
- Latencia y throughput: no disponibles. El modelo no se ha evaluado para inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B | 3B | 256K (segun Qwen) | Apache-2.0 | Produccion |
| tt-x15-megatron-51-30B (este modelo) | 30,5B | 3B | no disponible | Apache-2.0 | Experimental, colapsado |
| Qwen3-30B-A3B-Instruct | 30,5B | 3B | 256K (segun Qwen) | Apache-2.0 | Produccion |

La comparativa mas relevante es contra el modelo base Qwen3-Coder-30B-A3B-Instruct, del cual este checkpoint es un derivado. El entrenamiento RL no mejoro el rendimiento: lo degradó hasta el colapso. No hay otros checkpoints de la serie X15 disponibles publicamente para comparar en el momento de escribir esta ficha.

## Limitaciones y advertencias

- Entrenamiento colapsado: el modelo sufrio un colapso de entropia en el paso 84-86 y el entrenamiento se detuvo en el paso 101. No es un modelo funcional.
- No apto para uso en produccion: no debe desplegarse en ningun escenario real. Su unico valor es como caso de estudio.
- Sesgos del modelo base: al derivar de Qwen3-Coder, puede heredar sesgos del dataset de entrenamiento original de Qwen, aunque no se han evaluado en este checkpoint.
- Riesgo de alucinacion: no evaluado. El colapso de entropia sugiere que el modelo genera texto cada vez mas corto y posiblemente incoherente.
- Confound en hiperparametros: el experimento modifico tres hiperparametros a la vez (lr, eps_clip_low, temp), por lo que no se puede atribuir el colapso a un unico factor.
- Idioma limitado: el entrenamiento se realizo solo en ingles. El uso en otros idiomas no esta soportado ni evaluado.
- Datos de entrenamiento incompletos: el dataset de trazas completo (~256 GB) no se publico; solo se incluyo un submuestreo sistematico de 1/8 (6.677 de 53.411 trials).
- Licencia: Apache-2.0 permite uso comercial, pero el estado del modelo hace cualquier uso practico desaconsejable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/tt-x15-megatron-51-30B
- Dataset de trazas de entrenamiento: https://huggingface.co/datasets/penfever/tt-x15-megatron
- Repositorio OpenEuroLLM (runtime Megatron): https://github.com/kcc-lion/openeurollm/tree/v0.15/megatron/legacy/model
- Codigo del modelo GPT en OpenEuroLLM: https://github.com/kcc-lion/openeurollm/blob/v0.15/megatron/legacy/model/gpt_model.py
- Sitio de LAION: https://laion.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Proyecto W&B (dogml/OpenThoughts-Agent, run v5dzu6fw): no disponible como enlace directo
- Logs de entrenamiento: incluidos en el repositorio del modelo (training_logs/)
