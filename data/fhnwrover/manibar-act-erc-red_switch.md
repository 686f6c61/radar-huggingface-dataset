# fhnwrover/manibar-act-erc-red_switch

## Resumen

El modelo `fhnwrover/manibar-act-erc-red_switch` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. Desarrollado por el grupo de investigación fhnwrover, el modelo está especializado en una tarea de manipulación fina concreta: girar un interruptor rojo hacia la izquierda. Se trata de un modelo de aprendizaje por imitación que aprende directamente de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas ni simulaciones.

El modelo consume observaciones multimodales —tres cámaras RGB y un vector de estado propioceptivo de 83 dimensiones— y produce acciones de 7 dimensiones en forma de chunks, lo que permite un control suave y coherente del robot. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, un ecosistema open source que está democratizando la robótica de aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.748.487 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de vision-linguistic-action) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulacion y produce movimientos mas suaves. La arquitectura combina un encoder de vision (para procesar las tres camaras: board, gripper_left y gripper_right) con un transformer que condiciona la generacion de acciones sobre el estado propioceptivo del robot. El modelo fue entrenado con 24 episodios teleoperados (9.730 frames a 20 FPS) del dataset `fhnwrover/manibar-erc-red_switch`, con 40.000 pasos de entrenamiento, batch size de 32, optimizador AdamW y learning rate de 1e-05. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitacion.

## Capacidades

- Manipulacion robotica fina: el modelo ejecuta la tarea de girar un interruptor rojo hacia la izquierda con precision.
- Control basado en vision: procesa tres flujos de camara simultaneos (vista principal, gripper izquierdo y gripper derecho) para guiar la manipulacion.
- Accionamiento por chunks: predice secuencias de acciones de 7 dimensiones, lo que permite movimientos coordinados y estables.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- Aprendizaje por imitacion: no requiere ingenieria de recompensas ni simulacion; aprende directamente de demostraciones humanas.
- Ejecucion en tiempo real: con 51,7 millones de parametros, es adecuado para inferencia en robots con hardware modesto.

## Casos de uso

- Automatizacion de paneles de control: el modelo puede girar interruptores fisicos en entornos industriales o de laboratorio, sustituyendo manipulacion manual repetitiva.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de action chunking y generalizacion de politicas roboticas.
- Educacion en robotica: permite a estudiantes y desarrolladores experimentar con el flujo completo de LeRobot (captura de datos, entrenamiento y despliegue) en una tarea sencilla.
- Prototipado rapido de tareas de manipulacion: al entrenarse con solo 24 episodios, demuestra que tareas simples pueden automatizarse con pocos datos.
- Benchmark de politicas ACT: puede usarse como referencia para comparar variantes de ACT o metodos alternativos de imitacion en tareas de conmutacion.
- Desarrollo de sistemas de teleoperacion asistida: el modelo puede complementar sistemas de control manual, sugiriendo o ejecutando acciones de giro de interruptores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se dispone de datos de tasa de exito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero con 51,7 millones de parametros, el modelo cabe en GPUs de consumo con 4-8 GB de VRAM en precision FP32.
- GPU recomendadas: cualquier GPU NVIDIA moderna con CUDA (RTX 3060 o superior) es suficiente para inferencia; el entrenamiento se realizo con `--policy.device=cuda`.
- Compatibilidad con consumer GPU: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de gama media.
- Opciones de despliegue: LeRobot (rollout con `lerobot-rollout`), compatible con robots soportados por la libreria.
- Latencia y throughput: no disponible; dependera del robot, las camaras y la GPU utilizada.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos de la misma categoria en la informacion proporcionada. Existe un modelo hermano (`fhnwrover/manibar-act-erc-black-switches`) entrenado para una tarea similar con interruptores negros, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Tarea muy especifica: el modelo esta entrenado exclusivamente para girar un interruptor rojo hacia la izquierda; no generaliza a otras tareas ni a variaciones del mismo objeto.
- Datos de entrenamiento limitados: solo 24 episodios, lo que puede provocar sobreajuste a las condiciones especificas de captura (iluminacion, posicion de la camara, robot concreto).
- Sin resultados de evaluacion: no se ha verificado la tasa de exito en robot real, por lo que su rendimiento en produccion es incierto.
- Dependencia de camaras especificas: requiere las tres camaras con los nombres y resoluciones exactos usados en el entrenamiento (board, gripper_left, gripper_right).
- Sin capacidades de lenguaje: no es un modelo multimodal de lenguaje; no puede interpretar instrucciones textuales ni dialogar.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y sin resultados de evaluacion que respalden su fiabilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fhnwrover/manibar-act-erc-red_switch)
- [Dataset de entrenamiento](https://huggingface.co/datasets/fhnwrover/manibar-erc-red_switch)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Modelo hermano para interruptores negros](https://huggingface.co/fhnwrover/manibar-act-erc-black-switches)
