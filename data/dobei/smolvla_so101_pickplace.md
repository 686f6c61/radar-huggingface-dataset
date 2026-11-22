# dobei/smolvla_so101_pickplace

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Este repositorio concreto, `dobei/smolvla_so101_pickplace`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 25 episodios de la tarea "pick and place" (coger y colocar) con un robot SO-101.

El modelo resuelve el problema de la política de imitación visual-a-acción: dado un estado de 6 dimensiones (posición de las articulaciones) y varias imágenes de cámaras, produce un vector de acción de 6 dimensiones que mueve el brazo robótico. Su relevancia radica en que SmolVLA está pensado para desplegarse en hardware de consumo, no en clústeres de GPU de datacenter, lo que democratiza el entrenamiento y la inferencia de políticas robóticas.

Con 450 millones de parámetros y un repositorio de 1,8 GB, se trata de un ajuste fino muy específico (1000 pasos de entrenamiento, batch de 16) sobre una única tarea, por lo que su utilidad práctica está acotada al escenario concreto para el que fue entrenado. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea se pasan como texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras | scene, wrist (más una tercera cámara y una cámara vacía en la definición de entradas) |
| Tamaño del repositorio | 1,8 GB |
| Dataset de entrenamiento | dobei/so101_red_cube_blue_box_2_20261117_161737 (25 episodios, 11.286 frames, 30 FPS) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción compacta que combina un codificador visual y un modelo de lenguaje para producir acciones motoras directamente. El modelo consume observaciones multimodales (imágenes de varias cámaras a resoluciones de 256×256 y 480×640, más un vector de estado de 6 dimensiones) y emite un vector de acción de 6 dimensiones, lo que corresponde a las articulaciones de un brazo SO-101. La model card referencia el paper arXiv:2506.01844, que describe el método, pero no detalla en esta ficha la composición interna exacta (número de capas, tipo de atención, etc.).

El entrenamiento de este repositorio concreto es un ajuste fino de imitación supervisada sobre `lerobot/smolvla_base`. Se usaron 1000 pasos, batch size 16, optimizador AdamW con learning rate 1e-4, semilla 1000 y LeRobot 0.7.1. El dataset contiene 25 episodios de la tarea "pick and place" con un cubo rojo y una caja azul, grabados a 30 FPS (11.286 frames en total). No se indica en la información disponible si hubo RLHF, DPO ni ninguna etapa de refuerzo; se trata de aprendizaje por imitación puro sobre demostraciones.

## Capacidades

- Control robótico de imitación: genera acciones de 6 dimensiones para un brazo SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de varias cámaras (escena, muñeca y una tercera), lo que permite condicionar la acción a distintas perspectivas.
- Ejecución de tareas guiada por instrucción textual: acepta un parámetro `--task` (por ejemplo, "pick and place") que condiciona la política.
- Despliegue en hardware de consumo: el modelo base está diseñado explícitamente para ejecutarse en equipos de gama consumer, según la model card.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` del ecosistema.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni generación de texto general; es un modelo especializado en robótica.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: el modelo ejecuta la tarea "pick and place" sobre un cubo rojo y una caja azul, que es exactamente el escenario de entrenamiento. Se usaría con `lerobot-rollout` apuntando a un SO-101 real.
- Prototipado rápido de políticas robóticas: al ser un ajuste fino de 1000 pasos sobre un dataset pequeño, sirve como plantilla para que un equipo entrene su propia política con pocos datos y valide el pipeline completo de LeRobot.
- Investigación en aprendizaje por imitación: útil como punto de partida para estudiar el efecto del número de episodios, la resolución de cámara o la configuración de entrenamiento en el éxito de la tarea.
- Docencia y formación en robótica: el bajo coste computacional y la licencia permisiva permiten usarlo en laboratorios universitarios con GPUs de consumo.
- Benchmarking de hardware robótico: sirve para comparar el comportamiento de distintos brazos SO-101 o configuraciones de cámaras bajo una misma política.
- Automatización de tareas repetitivas de baja precisión: en entornos controlados donde la variabilidad de posiciones y condiciones de iluminación es limitada, el modelo puede ejecutar ciclos de recogida y colocación de forma autónoma durante periodos acotados (`--duration`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla vacía para que el autor registre tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 millones de parámetros en safetensors (fp32 serían ~1,8 GB), una estimación conservadora en fp16 rondaría 0,9-1,2 GB de pesos, más el coste de los codificadores visuales y los buffers de imagen.
- GPU recomendadas: no especificadas en la información disponible. El modelo base SmolVLA está descrito como desplegable en hardware de consumo, por lo que una RTX 3060/4060 o superior debería ser suficiente.
- Cabe en GPU de consumo: sí, según la model card del modelo base, que lo describe como apto para hardware consumer.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa de grabación del dataset, pero no se confirma que la inferencia alcance ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dobei/smolvla_so101_pickplace | 450 M | no disponible | Pick and place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en esta ficha | no disponible | Política VLA general (base) | no disponible en esta ficha | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en esta ficha | no disponible | Manipulación general | no disponible en esta ficha | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El único punto de referencia directo es el modelo base `lerobot/smolvla_base`, del que este repositorio es un ajuste fino especializado.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo con 25 episodios de una única tarea ("pick and place" con cubo rojo y caja azul); no generaliza a otras tareas, objetos ni entornos sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 11.286 frames y 1000 pasos de entrenamiento sugieren un riesgo alto de sobreajuste a las posiciones, iluminación y configuración de cámara del dataset original.
- Dependencia de la configuración de cámaras: las claves de observación (`observation.images.camera1`, `camera2`, `camera3`, `empty_camera_0`) deben coincidir exactamente con las usadas en el entrenamiento; una cámara mal nombrada o ausente puede romper la inferencia.
- Sin datos de sesgos, alucinación o multilingüismo: al ser un modelo de robótica, estas categorías no aplican de la forma habitual, pero tampoco se documentan análisis de robustez ante cambios de iluminación, oclusiones o distracciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad del despliegue recae en el integrador.
- Sin información sobre cuantización: no se documentan versiones GGUF ni INT8/INT4, lo que limita el despliegue en hardware muy restringido sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dobei/smolvla_so101_pickplace
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/dobei/so101_red_cube_blue_box_2_20261117_161737
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dobei/so101_red_cube_blue_box_2_20261117_161737
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
