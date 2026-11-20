# HRL-Group/stack_temporal_100

## Resumen

`HRL-Group/stack_temporal_100` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El autor es el grupo HRL-Group y el repositorio tiene 0,2 GB con 51.668.614 parámetros en formato safetensors.

La política está especializada en dos tareas concretas de manipulación: apilar un cubo sobre otro y colocar un cubo en una bandeja. Consume como entrada el estado del robot (vector de 6 dimensiones) y una imagen de una cámara situada en la muñeca del robot (3x480x640 píxeles), y produce un vector de acción de 6 dimensiones. Está diseñada para el robot `so_follower` (SO-100/SO-101 de LeRobot) con una única cámara de muñeca.

Es relevante como ejemplo reproducible de entrenamiento de políticas ACT con LeRobot 0.7.0 sobre un dataset pequeño (92 episodios, 218.681 fotogramas a 30 FPS), útil para quienes quieran replicar el flujo de trabajo de aprendizaje por imitación en robots de bajo coste. No es un modelo de lenguaje: es una política de control robótico y, por tanto, las métricas y comparativas habituales de LLM no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación basada en imagen única y estado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Librería | lerobot 0.7.0 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice chunks de acciones (varias acciones futuras de una vez) en lugar de una sola acción por paso. La arquitectura combina un codificador visual para procesar la imagen de la cámara de muñeca con un transformer que modela la secuencia de estados y acciones, y un decodificador que emite el vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors.

El entrenamiento se realizó sobre el dataset `HRL-Group/stack`, compuesto por 92 episodios y 218.681 fotogramas a 30 FPS, con dos tareas: "Pick up one cube and stack it on top of the other cube" y "Pick up the cube and place it in the tray". La configuración de entrenamiento fue de 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.7.0. No se especifica en la model card si hubo aumento de datos, RLHF/DPO ni otras técnicas adicionales; al tratarse de aprendizaje por imitación supervisado, no se aplican técnicas de alineación tipo RLHF.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower`.
- Apilamiento de cubos: tarea "Pick up one cube and stack it on top of the other cube".
- Colocación de cubos en bandeja: tarea "Pick up the cube and place it in the tray".
- Percepción visual monocámara: procesa imágenes de una cámara de muñeca a 480x640 y 30 FPS.
- Predicción de chunks de acciones: emite secuencias cortas de acciones para suavizar el control.
- Aprendizaje por imitación: reproducible mediante `lerobot-train` con `--policy.type=act`.
- Despliegue en robot real: ejecutable con `lerobot-rollout` sobre el robot SO follower.
- No soporta tool calling, agentes multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Apilamiento automatizado de cubos en línea de montaje: la política ejecuta la tarea "Pick up one cube and stack it on top of the other cube" sobre el robot SO follower, adecuada para demostrar manipulación precisa con una sola cámara de muñeca.
- Clasificación de piezas en bandeja: la política ejecuta "Pick up the cube and place it in the tray", útil para tareas de pick-and-place en entornos controlados con objetos de geometría similar.
- Prototipado de aprendizaje por imitación: sirve como referencia reproducible para entrenar políticas ACT con LeRobot sobre datasets propios de 92 episodios y ~218.000 fotogramas.
- Investigación en robótica de bajo coste: el robot SO follower y una cámara de muñeca permiten replicar el experimento con hardware asequible y comparar tasas de éxito.
- Docencia y formación: ejemplo didáctico del flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`).
- Evaluación de robustez visual: al depender de una única cámara de muñeca, permite estudiar cómo afectan cambios de iluminación, posiciones de objetos y distractores a la tasa de éxito.
- Base para fine-tuning en tareas de apilamiento: punto de partida para adaptar la política a nuevos objetos o posiciones mediante entrenamiento adicional sobre el dataset `HRL-Group/stack` o uno propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 millones de parámetros, el modelo es muy pequeño y probablemente quepa en GPUs de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU con CUDA.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; por tamaño (51,7 M de parámetros) es plausible en GPUs de consumo, pero no hay dato verificado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se documenta latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy ni modelos de robótica comparables. Se puede señalar que ACT (arXiv:2304.13705) es el método base, y que existen otras políticas LeRobot en el Hub, pero no se aportan datos de rendimiento para comparar.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 92 episodios y 218.681 fotogramas limitan la generalización a nuevas posiciones, objetos o condiciones de iluminación.
- Especialización estrecha: solo dos tareas de apilamiento/colocación de cubos; no es un modelo generalista.
- Dependencia de una única cámara de muñeca: la percepción se limita a la vista `wrist`; oclusiones o cambios de cámara pueden degradar el rendimiento.
- Robot específico: entrenado para `so_follower`; no se garantiza transferencia a otros robots sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Idiomas no disponibles: no aplica, pero se indica por rigor.
- Riesgo de sobreajuste a las condiciones del dataset de entrenamiento (posiciones, colores y geometría de los cubos).
- No es un modelo de lenguaje: no soporta texto, código, tool calling ni agentes; cualquier uso fuera del control robótico no está contemplado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_temporal_100
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
