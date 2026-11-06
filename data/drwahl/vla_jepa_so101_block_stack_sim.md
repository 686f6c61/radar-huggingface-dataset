# drwahl/vla_jepa_so101_block_stack_sim

## Resumen

vla_jepa_so101_block_stack_sim es un modelo de visión-lenguaje-acción (VLA) ajustado mediante LoRA sobre el checkpoint base lerobot/VLA-JEPA-Pretrain. Lo desarrolla el usuario drwahl y resuelve una tarea muy concreta: apilar un bloque de 30 mm sobre otro con el brazo robótico de bajo coste SO-101, en simulación. El modelo combina un backbone de lenguaje Qwen con un cabezal de acciones y un predictor de vídeo, siguiendo el paradigma JEPA (Joint Embedding Predictive Architecture) aplicado a robótica.

El interés práctico está en que demuestra el ajuste fino eficiente de un VLA preentrenado para una tarea de manipulación concreta con recursos modestos: LoRA de rango 32, 20 000 pasos a batch 4 y visión congelada. El repositorio ocupa 1,4 GB e incluye el adaptador y los procesadores necesarios para cargarlo sobre los pesos base con LeRobot.

La evaluación se hace sobre 150 layouts retenidos en simulación, con métricas de apilado y levantamiento, lo que permite comparar directamente con el protocolo del modelo hermano pi05_so101_block_stack_sim del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA-JEPA: backbone de lenguaje Qwen + cabezal de acciones + predictor de vídeo |
| Parámetros totales | no disponible (el adaptador LoRA es una fracción del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + procesadores en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de lerobot/VLA-JEPA-Pretrain y aplica un ajuste LoRA con r=32 y alpha=64 sobre el backbone de lenguaje Qwen. El cabezal de acciones y el predictor de vídeo se entrenan de forma densa (todos sus parámetros), mientras que la torre de visión permanece congelada. El entrenamiento se ejecutó durante 20 000 pasos con batch 4, usando la configuración `train/vla_jepa_so101.yaml` del repositorio vla-test y el dataset drwahl/so101_block_stack_sim. La normalización, la tasa de aprendizaje y la longitud de chunk son las del checkpoint base.

La innovación principal es el enfoque JEPA aplicado a VLA: el predictor de vídeo aprende representaciones latentes del entorno en lugar de reconstruir píxeles, lo que reduce el coste de entrenamiento y favorece la generalización en simulación. El adaptador incluye los procesadores con la normalización y el renombrado de cámaras, de modo que LeRobot lo carga directamente sobre los pesos base sin configuración adicional.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 pasos (chunk) para el brazo SO-101.
- Apilado de bloques: tarea específica de colocar un bloque de 30 mm sobre otro.
- Levantamiento y transporte de objetos en simulación.
- Predicción de vídeo en espacio latente mediante el componente JEPA.
- Integración con el ecosistema LeRobot para carga del adaptador y de los procesadores.
- Ejecución de políticas entrenadas con protocolo reproducible (mismo esquema que pi05_so101_block_stack_sim).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni generación de texto general.

## Casos de uso

- Investigación en manipulación robótica: sirve como referencia reproducible para comparar VLA-JEPA frente a otras arquitecturas (por ejemplo, pi0) en la misma tarea de apilado, con métricas sobre 150 layouts retenidos.
- Ajuste fino eficiente de VLAs: el patrón LoRA sobre backbone Qwen con visión congelada es directamente reutilizable para nuevas tareas con presupuesto de cómputo limitado.
- Benchmarking de políticas en simulación: el script `sim/scripts/eval.py` permite medir apilado y levantamiento con gates definidos, útil para validar cambios de arquitectura.
- Educación y prototipado con hardware de bajo coste: el SO-101 es un brazo asequible, y este modelo demuestra el flujo completo desde dataset hasta política desplegable.
- Transferencia sim-to-real como línea de trabajo: aunque el modelo se entrena en simulación, el adaptador y los procesadores facilitan experimentos de ajuste con datos reales del mismo robot.
- Ablación de hiperparámetros: la comparación documentada entre horizonte de 7 pasos (91,7 apilados) y 5 pasos (59 apilados) permite estudiar el efecto de la longitud de chunk en el rendimiento.

## Benchmarks y rendimiento

| Configuración | Bloques apilados (de 150) | Levantamientos | Semillas |
|---|---|---|---|
| Chunk completo de 7 pasos | 91,7 | 105,7 | media de 3 semillas adicionales |
| Horizonte de 5 pasos | 59 | no disponible | 1 semilla |
| Chunk completo (referencia) | 93 | no disponible | 1 semilla |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repo de 1,4 GB corresponde principalmente al adaptador y procesadores, no al modelo completo.
- GPU recomendadas: no disponible. El modelo base VLA-JEPA-Pretrain requiere cargar el backbone Qwen completo, lo que condiciona el consumo de memoria.
- ¿Cabe en GPU de consumo? No disponible; depende del tamaño del backbone Qwen del checkpoint base, que no se especifica.
- Despliegue: LeRobot (carga del adaptador sobre los pesos base) y el script de evaluación del repositorio vla-test. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Licencia | Adaptación | Resultado |
|---|---|---|---|---|---|
| vla_jepa_so101_block_stack_sim | VLA-JEPA-Pretrain | Apilado SO-101 en sim | Apache 2.0 | LoRA r=32 sobre Qwen | 91,7/150 apilados |
| drwahl/pi05_so101_block_stack_sim | pi0.5 | Apilado SO-101 en sim | no disponible | Protocolo de referencia | no disponible en la información |
| lerobot/VLA-JEPA-Pretrain | — | Preentrenamiento VLA | no disponible | — | no disponible |

La comparación directa con pi05_so101_block_stack_sim es la más relevante, ya que comparte dataset y protocolo de evaluación, pero no se han proporcionado sus métricas en la información disponible.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (apilar un bloque de 30 mm sobre otro) y un único robot (SO-101); no generaliza a otras tareas sin reentrenamiento.
- Entrenado exclusivamente en simulación; el rendimiento en el mundo real no está validado y puede degradarse por la brecha sim-to-real.
- El rendimiento depende fuertemente del horizonte de ejecución: ejecutar solo 5 pasos del chunk reduce el apilado de 93 a 59 en una semilla.
- La evaluación se hace sobre 150 layouts retenidos; las métricas reportadas son medias de pocas semillas, con variabilidad no cuantificada en detalle.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí de acciones inválidas o no físicamente plausibles fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que conviene revisar.
- No se documentan sesgos, idiomas ni capacidades de texto general; no debe usarse como modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/drwahl/vla_jepa_so101_block_stack_sim
- Modelo base: https://huggingface.co/lerobot/VLA-JEPA-Pretrain
- Dataset: https://huggingface.co/datasets/drwahl/so101_block_stack_sim
- Modelo comparativo: https://huggingface.co/drwahl/pi05_so101_block_stack_sim
- Repositorio de entrenamiento: https://github.com/danwahl/vla-test
- Hardware SO-101: https://github.com/TheRobotStudio/SO-ARM100
