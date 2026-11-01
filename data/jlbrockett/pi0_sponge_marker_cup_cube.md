# Jlbrockett/pi0_sponge_marker_cup_cube

## Resumen

`pi0_sponge_marker_cup_cube` es un fine-tuning del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, adaptado y entrenado con la librería LeRobot de Hugging Face. Se trata de una política Vision-Language-Action (VLA) generalista que recibe imágenes de cámaras, el estado del robot e instrucciones en lenguaje natural, y produce acciones de control de bajo nivel para un robot manipulador. El modelo parte de `lerobot/pi0_base` y se ha especializado en cuatro tareas concretas de manipulación doméstica sobre un robot tipo `so_follower` (SO-100/SO-101 de LeRobot).

El modelo resuelve el problema de mapear percepción visual y lenguaje a trayectorias de acción continuas sin necesidad de programar controladores específicos por tarea. Con 4.028.019.472 parámetros (aproximadamente 4.000 millones) y un repositorio de 8,9 GB, es un modelo de gran tamaño para el estándar de políticas de imitación robótica, lo que refleja la arquitectura VLA subyacente que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones.

Es relevante ahora porque ejemplifica el flujo de trabajo de fine-tuning de modelos fundacionales robóticos con datos propios: cualquier equipo con un SO-100 y unas 250 demostraciones teleoperadas puede adaptar π₀ a sus tareas. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de investigación aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (instrucciones en inglés en las tareas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi0_base |
| Tipo de robot | so_follower |
| Cámaras de entrada | handeye, front (3 vistas RGB de 224x224) |
| Dimensión de estado | (32,) |
| Dimensión de acción | (6,) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀, una política VLA generalista desarrollada por Physical Intelligence. La arquitectura subyacente combina un codificador visual que procesa tres vistas RGB de 224x224 píxeles, un componente de lenguaje que interpreta la instrucción de tarea, y un cabezal de acciones que emite vectores de 6 dimensiones correspondientes al control del robot `so_follower`. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre el número de capas, el mecanismo de atención ni la composición exacta del corpus de preentrenamiento del modelo base en la información proporcionada.

El fine-tuning se realizó sobre el dataset `Jlbrockett/sponge_marker_cup_cube`, compuesto por 250 episodios y 154.563 fotogramas a 30 FPS, con cuatro tareas de manipulación: colocar una esponja en un bol, insertar un rotulador verticalmente en un vaso, colocar el vaso sobre un salvamanteles y meter un cubo gris en una papelera gris. El entrenamiento usó 30.000 pasos con batch size 16, AdamW y learning rate 2,5e-05. No se especifica si hubo RLHF, DPO ni otras fases de alineación posteriores al entrenamiento por imitación.

## Capacidades

- Control robótico visomotor: genera acciones de 6 dimensiones a partir de tres vistas RGB y el estado del robot.
- Comprensión de instrucciones en lenguaje natural: acepta tareas como "grab the sponge and place it in the bowl" o "Put the grey cube in the grey bin".
- Manipulación de objetos domésticos: esponjas, rotuladores, vasos, salvamanteles y cubos.
- Ejecución de políticas de imitación entrenadas con teleoperación sobre robot SO-100/SO-101.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento explícito tipo thinking.
- Capacidades multilingües: no disponibles; las tareas de entrenamiento están en inglés.

## Casos de uso

- Automatización de tareas de recogida y colocación en laboratorio: el modelo puede ejecutar las cuatro tareas entrenadas (esponja al bol, rotulador al vaso, vaso al salvamanteles, cubo a la papelera) sobre un SO-100, útil para validar pipelines de imitación antes de escalar a producción.
- Base para fine-tuning con datos propios: un equipo con un SO-100 y un dataset de teleoperación puede partir de `lerobot/pi0_base` y replicar este flujo para sus propias tareas, usando el comando `lerobot-train` documentado en la model card.
- Investigación en políticas VLA: sirve como referencia reproducible de cómo un modelo fundacional de 4.000 millones de parámetros se adapta a tareas concretas con 250 episodios, permitiendo estudiar el efecto del número de demostraciones y la composición del dataset.
- Evaluación de infraestructura de inferencia robótica: el modelo permite medir latencia y throughput de π₀ en hardware consumer o de datacenter dentro del stack LeRobot, con vistas a desplegar políticas VLA en tiempo real a 30 FPS.
- Docencia y formación en robótica de imitación: el repositorio incluye instrucciones completas de instalación, grabación de datos y entrenamiento, lo que lo convierte en un ejemplo práctico para cursos sobre aprendizaje por imitación.
- Pruebas de integración hardware-software: al estar ligado a un robot `so_follower` con cámaras `handeye` y `front`, sirve para validar la calibración, los índices de cámara y la configuración de puertos antes de entrenar políticas más complejas.
- Benchmark interno de políticas de manipulación: aunque no hay resultados de evaluación publicados, el modelo puede usarse como línea base contra la que comparar fine-tunings propios sobre el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.028 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 16 GB solo para los pesos; en bf16/fp16, unos 8 GB; en cuantización de 8 bits, alrededor de 4 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: para entrenamiento, GPU de datacenter como A100 (40/80 GB) o H100; para inferencia en bf16, una RTX 4090 (24 GB) o RTX 3090 (24 GB) debería ser suficiente para los pesos, aunque el procesamiento de tres cámaras a 30 FPS añade carga.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090, RTX 3090 y GPUs con 16 GB o más en bf16; en 8 GB solo con cuantización, no documentada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo al uso.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS según la tasa de captura del dataset, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jlbrockett/pi0_sponge_marker_cup_cube` | 4.028 M | no disponible | VLA para SO-100 en 4 tareas | Apache 2.0 | Hugging Face, 88 descargas |
| `lerobot/pi0_base` | no disponible en la información | no disponible | VLA generalista base | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot | típicamente decenas de millones | no aplica | imitación por tarea | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | típicamente cientos de millones | no aplica | imitación por tarea | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |

La comparación con ACT y Diffusion Policy es cualitativa: π₀ es un modelo fundacional VLA de gran tamaño, mientras que ACT y Diffusion Policy son arquitecturas de imitación más ligeras que se entrenan desde cero por tarea. No se dispone de cifras de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito por tarea, por lo que no se puede afirmar su fiabilidad en producción.
- Especialización estrecha: solo se ha entrenado para cuatro tareas concretas sobre un robot `so_follower`; no generaliza a otros robots, objetos o entornos sin nuevo fine-tuning.
- Dependencia de la configuración de cámaras: las claves de observación (`observation.images.base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) deben coincidir exactamente con las del entrenamiento; un cambio de montaje o índice de cámara invalida la política.
- Riesgo de sobreajuste al entorno de grabación: iluminación, posiciones de objetos y fondo del dataset original condicionan el comportamiento; no se documenta robustez ante distractores.
- Idiomas: las instrucciones de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados por el autor; al ser un modelo entrenado con datos de un único entorno y operador, es probable un sesgo hacia esas condiciones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base `lerobot/pi0_base` y de los datos subyacentes.
- Tamaño elevado para robótica: 4.000 millones de parámetros y 8,9 GB de repositorio implican requisitos de hardware superiores a los de políticas de imitación ligeras, lo que puede limitar el despliegue en robots con cómputo embebido.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni INT8 oficiales, lo que dificulta el despliegue en hardware de baja VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jlbrockett/pi0_sponge_marker_cup_cube
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jlbrockett/sponge_marker_cup_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jlbrockett/sponge_marker_cup_cube
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
