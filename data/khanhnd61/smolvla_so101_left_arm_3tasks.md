# khanhnd61/smolvla_so101_left_arm_3tasks

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico con un coste computacional reducido y capacidad de despliegue en hardware de consumo. Este repositorio concreto (`khanhnd61/smolvla_so101_left_arm_3tasks`) es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre tres tareas específicas de manipulación con el brazo izquierdo de un robot SO-101: sacar un cubo rojo de una olla y meterlo en un cubo hueco naranja, abrir un cajón y colocar un bloque cuadrado rojo dentro, y abrir un cajón para apilar un cubo rojo sobre uno azul.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 M) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. Se integra en el ecosistema LeRobot, la librería de Hugging Face para aprendizaje por imitación robótico, y su licencia es Apache 2.0. Es relevante ahora porque demuestra que políticas VLA de tamaño reducido pueden ejecutarse en GPUs de consumo y reproducir demostraciones de manipulación con precisión razonable, lo que abarata la experimentación en robótica de imitación.

La model card del autor es inusualmente honesta: advierte de que todos los episodios grabados (159) se usaron para entrenamiento sin conjunto de validación, por lo que las métricas reportadas miden reproducción de las demostraciones, no generalización. Este detalle es fundamental para interpretar correctamente el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA, con flow matching para generación de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en los datasets) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones entrenado mediante flow matching. La arquitectura está pensada para ser eficiente computacionalmente y desplegable en hardware de consumo, según la model card y el paper asociado (arXiv:2506.01844). El modelo base `lerobot/smolvla_base` se ajustó finamente sobre tres datasets de demostraciones teleoperadas del brazo izquierdo de un SO-101, cada uno correspondiente a una tarea de manipulación distinta.

El entrenamiento utilizó los 159 episodios completos de los tres datasets (`hungho77/so101-left_arm_task_red_cube_out_of_pot_into_the_orange_hollow_cube`, `hungho77/so101-left_arm_task_drawer_placing_red_squre_block` y `hungho77/so101_left_arm_open_drawer_pick_red_cube_stack_on_blue_cube`) sin separar conjunto de validación. Se entrenaron 10 épocas hasta el paso 41.801. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO; al tratarse de aprendizaje por imitación, el paradigma es supervisado sobre acciones demostradas con flow matching.

## Capacidades

- Generación de trayectorias de acciones para un brazo robótico SO-101 (izquierdo) con seis grados de libertad: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` y `gripper`.
- Condicionamiento por instrucción en lenguaje natural: la política responde a la instrucción de tarea, como demuestra el experimento de intercambio de instrucciones (MAE sube de 1,66 a 6,93 al sustituirla).
- Ejecución de tres tareas de manipulación específicas: sacar un cubo de una olla y colocarlo en un cubo hueco, abrir un cajón y colocar un bloque dentro, y abrir un cajón para apilar un cubo sobre otro.
- Generación de chunks de acciones de 50 pasos (`n_action_steps`) ejecutados en bucle abierto.
- Percepción visual: procesa imágenes de la escena para condicionar la acción (modelo visión-lenguaje-acción).
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni audio en la información disponible.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia de sacar un cubo de un recipiente y depositarlo en otro, útil para prototipos de manipulación con el brazo SO-101 en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar ajuste fino de políticas VLA sobre nuevos datasets de demostraciones con LeRobot.
- Manipulación de cajones en entornos domésticos simulados: la tarea de abrir un cajón y colocar un bloque dentro es representativa de operaciones de apertura y deposición que se pueden replicar en bancos de pruebas.
- Apilado de objetos: la tarea de apilar un cubo rojo sobre uno azul permite evaluar políticas de precisión posicional y control fino del gripper.
- Docencia y formación en robótica: al caber en hardware de consumo y tener licencia Apache 2.0, es adecuado para cursos y talleres donde se enseña a entrenar y desplegar políticas VLA.
- Benchmark interno de reproducibilidad: la model card incluye un protocolo de evaluación en bucle abierto (cada 50 fotogramas, 2.751 consultas, 133.763 pasos puntuados) que puede reutilizarse para comparar checkpoints o variantes de instrucción.
- Base para ajuste fino multi-tarea: al estar entrenado con tres tareas y responder a instrucciones, puede extenderse con nuevos datasets manteniendo el mismo pipeline de LeRobot.

## Benchmarks y rendimiento

Los datos disponibles son de evaluación en bucle abierto sobre los propios datos de entrenamiento (sin conjunto de validación), por lo que no constituyen una medida de generalización ni una tasa de éxito. Se presentan a continuación tal como los reporta el autor.

| Metrica | Valor |
|---|---|
| MAE global (checkpoint final, paso 41.801) | 1,66 |
| MAE / std global | 0,054 |
| Baseline mantener estado actual | 8,64 (MAE), 0,290 (MAE/std) |
| Instrucción intercambiada a otra tarea | 6,93 (MAE), 0,232 (MAE/std) |
| Consultas evaluadas | 2.751 |
| Pasos de acción puntuados | 133.763 |

| Tarea | Pasos puntuados | MAE | Hold-state | Instrucción intercambiada |
|---|---:|---:|---:|---:|
| Sacar cubo rojo de olla y meter en cubo naranja | 34.152 | 1,58 | 7,11 | 5,77 |
| Abrir cajón, coger bloque cuadrado rojo, colocarlo dentro y cerrar | 60.208 | 1,67 | 9,27 | 7,42 |
| Abrir cajón, coger cubo rojo y apilar sobre cubo azul | 39.403 | 1,71 | 9,02 | 7,19 |

| Articulación | MAE | MAE / std | Hold-state | Instrucción intercambiada |
|---|---:|---:|---:|---:|
| shoulder_pan | 1,15 | 0,039 | 6,23 | 4,44 |
| shoulder_lift | 2,14 | 0,058 | 13,20 | 9,77 |
| elbow_flex | 2,36 | 0,063 | 11,37 | 8,78 |
| wrist_flex | 2,19 | 0,074 | 9,46 | 7,86 |
| wrist_roll | 1,33 | 0,044 | 5,80 | 6,47 |
| gripper | 0,79 | 0,048 | 5,81 | 4,26 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que se trata de un modelo robótico y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión nativa requiere aproximadamente 2 GB de VRAM, y en cuantización de 8 bits o 4 bits podría reducirse por debajo de 1 GB.
- GPU recomendadas: el modelo está diseñado para hardware de consumo según la model card; una RTX 4090, RTX 3090 o incluso GPUs de gama media con suficiente VRAM deberían ser suficientes.
- Cabe en GPU de consumo: sí, según la afirmación de la model card de que SmolVLA puede desplegarse en hardware de consumo.
- Opciones de despliegue: LeRobot (librería principal, con guía específica para SmolVLA); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khanhnd61/smolvla_so101_left_arm_3tasks | 450 M | no disponible | Manipulación SO-101, 3 tareas | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | no disponible | Hugging Face |
| khanhnd61/smolvla_so101-multi-task-clean | no disponible | no disponible | Manipulación SO-101 multi-tarea (dataset previo) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Todos los episodios (159) se usaron para entrenamiento sin conjunto de validación: las métricas de la model card miden reproducción de las demostraciones, no generalización. No deben interpretarse como tasas de éxito en el robot real.
- El autor advierte de que la mejora sostenida entre checkpoints no sirve para elegir el checkpoint a desplegar; en un dataset SO-101 anterior la pérdida de validación empezó a subir hacia el paso 500 mientras la de entrenamiento seguía bajando.
- Los chunks generados son aproximadamente 7 veces más rugosos que las demostraciones (jerk medio de 0,551 frente a 0,076), lo que puede producir temblor en los servos al ejecutarse en bucle abierto. Se recomienda suavizado de acciones en el despliegue.
- El entrenamiento parece haber convergido sobre los datos de entrenamiento: las dos últimas épocas solo aportaron un 3% de mejora, y más épocas podrían empeorar por sobreajuste.
- El modelo está entrenado únicamente para el brazo izquierdo de un SO-101 y tres tareas concretas; no se documenta transferencia a otras morfologías, objetos o entornos.
- No se dispone de información sobre sesgos, idiomas soportados ni robustez ante variaciones de iluminación o posición de objetos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en robot real implica que cualquier despliegue en producción requiere evaluación propia.
- No se documentan requisitos de seguridad física para el robot; el uso en entornos reales debe acompañarse de las salvaguardas habituales de manipulación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khanhnd61/smolvla_so101_left_arm_3tasks
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset 1: https://huggingface.co/datasets/hungho77/so101-left_arm_task_red_cube_out_of_pot_into_the_orange_hollow_cube
- Dataset 2: https://huggingface.co/datasets/hungho77/so101-left_arm_task_drawer_placing_red_squre_block
- Dataset 3: https://huggingface.co/datasets/hungho77/so101_left_arm_open_drawer_pick_red_cube_stack_on_blue_cube
- Modelo previo del mismo autor: https://huggingface.co/khanhnd61/smolvla_so101-multi-task-clean
