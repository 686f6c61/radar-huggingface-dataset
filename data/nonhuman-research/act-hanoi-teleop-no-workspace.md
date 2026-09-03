# NONHUMAN-RESEARCH/act-hanoi-teleop-no-workspace

## Resumen

El modelo `NONHUMAN-RESEARCH/act-hanoi-teleop-no-workspace` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de HuggingFace, y está especializado en la manipulación de la torre de Hanói mediante teleoperación, sin espacio de trabajo fijo. El modelo consume imágenes de tres cámaras y el estado articular del robot para generar comandos de acción de 14 dimensiones.

El modelo tiene aproximadamente 51,7 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en que demuestra la aplicación práctica de ACT en tareas de manipulación precisas y multi-paso, un área de creciente interés en la robótica de aprendizaje. Al estar integrado en el ecosistema LeRobot, cualquier investigador puede reproducir el entrenamiento o desplegar la política en un robot compatible con pocos comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de politica robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion basado en transformers que opera sobre secuencias de observaciones y genera "chunks" de acciones futuras. A diferencia de los metodos que predicen una sola accion por paso, ACT predice un bloque de acciones (tipicamente 10-100 pasos) que el robot ejecuta de forma autoregresiva, lo que reduce la acumulacion de errores y mejora la estabilidad del movimiento. La arquitectura combina un encoder de vision (tipicamente ResNet) para procesar las imagenes de las camaras, un encoder de estado para la informacion proprioceptiva, y un transformer decoder que produce las secuencias de acciones.

El entrenamiento se realizo con el framework LeRobot version 0.6.2, utilizando el dataset `murobotics/tblock-all-piper-clean-bi_piper_follower`, que contiene demostraciones teleoperadas de la tarea de la torre de Hanoi. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,00015 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior; el modelo se entrena exclusivamente mediante aprendizaje por imitacion supervisado sobre las demostraciones.

## Capacidades

- Manipulacion robotica de precision: el modelo ejecuta la tarea de la torre de Hanoi, que requiere mover discos entre tres postes respetando la regla de no colocar un disco mayor sobre uno menor.
- Percepcion multimodal: consume simultaneamente tres flujos de imagen (camara izquierda, superior y derecha) junto con el estado articular del robot (14 dimensiones).
- Generacion de acciones continuas: produce comandos de accion de 14 dimensiones (posiciones articulares o comandos de efector final) en bloques temporales.
- Aprendizaje por imitacion: la politica replica comportamientos teleoperados sin necesidad de ingenieria de recompensas ni planificacion explicita.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de HuggingFace para entrenamiento, evaluacion y despliegue en robots reales.
- No incluye capacidades de lenguaje, vision generalista, tool calling ni razonamiento simbolico: es un modelo especializado en una unica tarea motora.

## Casos de uso

- Automatizacion de tareas de ensamblaje: el modelo puede transferirse a tareas que requieren secuencias de manipulacion precisas, como apilar componentes o insertar piezas, gracias a su capacidad de predecir chunks de acciones.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas entre tareas o la robustez frente a variaciones en la posicion de los objetos.
- Desarrollo de robots de bajo coste: al estar entrenado con LeRobot y funcionar con camaras RGB convencionales, puede desplegarse en plataformas roboticas asequibles tipo SO-100 o similares.
- Benchmarking de algoritmos de manipulacion: la tarea de la torre de Hanoi es un problema clasico de planificacion y manipulacion; este modelo proporciona una linea base reproducible para comparar nuevos metodos.
- Teleoperacion asistida: el modelo puede usarse como filtro o asistente en sistemas de teleoperacion, suavizando los comandos del operador y reduciendo la carga cognitiva.
- Educacion en robotica: dado su tamano reducido y su integracion con LeRobot, es adecuado para cursos y talleres donde los estudiantes aprenden a entrenar y desplegar politicas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real. No se proporcionan metricas de exito, tasas de finalizacion ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 51,7 millones de parametros y entradas de imagen de hasta 640x480, se estima que cabe en GPUs con 6-8 GB de VRAM en precision FP32.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM (GTX 1080 Ti, RTX 2070, RTX 3060, RTX 4090) es suficiente para inferencia. Para entrenamiento, se recomienda al menos 12-16 GB.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo medio.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la inferencia y la comunicacion con el robot. Tambien es posible exportar los pesos a otros formatos si se requiere.
- Latencia y throughput: no disponible. La latencia dependera del hardware, la resolucion de las camaras y el tamaño del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-hanoi-teleop-no-workspace | 51,7 M | ACT (Transformer) | Torre de Hanoi | Apache 2.0 | HuggingFace |
| Diffusion Policy (Chi et al., 2023) | ~10-100 M | Diffusion model | Manipulacion general | MIT | Codigo abierto |
| ACT original (Zhao et al., 2023) | ~50-100 M | ACT (Transformer) | Manipulacion general | MIT | Codigo abierto |

La comparativa se basa en la literatura publica. ACT original es el metodo base sobre el que se construye este modelo. Diffusion Policy es una alternativa popular que modela la distribucion de acciones con procesos de difusion, ofreciendo mayor expresividad pero mayor coste computacional en inferencia. Este modelo concreto se distingue por estar especializado en una tarea unica y por su integracion directa con LeRobot.

## Limitaciones y advertencias

- Sin resultados de evaluacion: la model card no incluye ninguna metrica de exito en robot real, por lo que se desconoce la tasa de finalizacion real de la tarea.
- Especializacion estrecha: el modelo esta entrenado para una tarea concreta (torre de Hanoi) y no es generalizable a otras tareas sin reentrenamiento.
- Dependencia del espacio de trabajo: el nombre del modelo indica "no workspace", pero no se especifica como maneja la variabilidad en la posicion de los objetos o del robot.
- Riesgo de sobreajuste: con 20.000 pasos de entrenamiento y un dataset presumiblemente limitado, existe riesgo de que la politica no generalice bien a configuraciones no vistas.
- Sin capacidades de lenguaje ni razonamiento: no es un modelo multimodal generalista; solo procesa imagenes y estado articular.
- Requisitos de hardware especificos: aunque es pequeno, requiere un robot fisico compatible con LeRobot y camaras calibradas para su despliegue.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los componentes del dataset y el robot utilizado no tengan restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NONHUMAN-RESEARCH/act-hanoi-teleop-no-workspace
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de entrenamiento y grabacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
