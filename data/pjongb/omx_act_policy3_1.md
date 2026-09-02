# pjongb/omx_act_policy3_1

## Resumen

El modelo `pjongb/omx_act_policy3_1` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario pjongb y publicada en Hugging Face bajo la licencia Apache 2.0. Está diseñada para controlar un brazo robótico ROBOTIS OMX en tareas de manipulación fina, concretamente para la tarea de pick and place, utilizando el dataset `pjongb/pick_and_place3`. El modelo se ha entrenado y subido al Hub mediante la librería LeRobot, el framework de referencia de Hugging Face para robótica y aprendizaje por imitación.

ACT es un método que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. Con 51,7 millones de parámetros, es un modelo ligero y eficiente, adecuado para ejecutarse en hardware de bajo coste. Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas robóticas con datos teleoperados, accesible para la comunidad de desarrolladores e investigadores que trabajan con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de ventana de observacion y prediccion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplicable (modelo de politica robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que combina un codificador de observaciones (imagenes y estados del robot) con un decodificador autoregresivo que genera un chunk de acciones futuras. El modelo se entrena mediante aprendizaje por imitacion a partir de demostraciones teleoperadas, minimizando la diferencia entre las acciones predichas y las reales. En este caso, el entrenamiento se ha realizado con el dataset `pjongb/pick_and_place3`, que contiene episodios de manipulacion de objetos con el brazo ROBOTIS OMX. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que no se especifican en la model card. La implementacion sigue el codigo de LeRobot, que ofrece una configuracion estandar para ACT con hiperparametros por defecto.

## Capacidades

- Control de manipulacion robotica: genera comandos de posicion y orientacion del efector final para tareas de pick and place.
- Aprendizaje por imitacion: reproduce comportamientos demostrados por teleoperacion, con capacidad de generalizar a variaciones leves de la tarea.
- Prediccion por chunks: emite secuencias de acciones (tipicamente 10-100 pasos) que mejoran la suavidad y estabilidad del movimiento.
- Integracion con LeRobot: compatible con el pipeline de entrenamiento, evaluacion y despliegue de LeRobot, incluyendo la grabacion de episodios y la inferencia en tiempo real.
- Bajo coste computacional: al ser un modelo de ~52M parametros, puede ejecutarse en GPUs de gama media o incluso en CPU para inferencia a baja frecuencia.

## Casos de uso

- Automatizacion de tareas de pick and place en entornos de laboratorio: el modelo puede controlar un brazo ROBOTIS OMX para recoger y colocar objetos en posiciones definidas, util para experimentos de investigacion en manipulacion robotica.
- Prototipado rapido de politicas de control: gracias a su entrenamiento rapido y bajo requisito de datos, permite iterar sobre nuevas tareas de manipulacion con pocas demostraciones.
- Educacion y formacion en robotica: sirve como ejemplo didactico para ensenar aprendizaje por imitacion con LeRobot, ya que el flujo completo (dataset, entrenamiento, evaluacion) esta documentado.
- Evaluacion de algoritmos de imitacion: puede usarse como baseline para comparar con otras politicas como Diffusion Policy o VQ-BeT en el mismo robot y tarea.
- Despliegue en robots de bajo coste: al ser ligero, puede ejecutarse en computadoras de placa unica (como Raspberry Pi con aceleracion) para prototipos de bajo presupuesto.
- Investigacion en generalizacion de tareas: permite estudiar como el modelo se comporta ante cambios en la posicion de los objetos, iluminacion o configuracion del entorno, dado que se entrena con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de acierto ni comparaciones con otros modelos. Para obtener datos de rendimiento, seria necesario ejecutar una evaluacion propia siguiendo el procedimiento de LeRobot (`lerobot-record` con el flag `--episodes`).

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7M de parametros, el modelo en FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. La VRAM necesaria depende del tamaño de las imagenes de entrada y del batch, pero en general cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es suficiente. Tambien puede ejecutarse en CPU para inferencia a baja frecuencia (por debajo de 10 Hz).
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento e inferencia; tambien se puede exportar a ONNX o TensorRT para optimizacion, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. Se estima una latencia de pocos milisegundos por prediccion en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pjongb/omx_act_policy3_1 | 51,7M | ACT (Transformer) | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable (tipicamente 10-100M) | U-Net + diffusion | no disponible | Apache 2.0 | Hugging Face |
| VQ-BeT (LeRobot) | variable | Transformer + VQ | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos para la misma tarea. La eleccion entre ellos depende de la tarea especifica: ACT es recomendado por LeRobot como primera opcion por su rapidez de entrenamiento y bajo coste, mientras que Diffusion Policy suele ofrecer mayor expresividad a cambio de mayor coste computacional.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset limitado de demostraciones teleoperadas, el modelo puede no generalizar a configuraciones de objetos, iluminacion o entornos muy diferentes a los del dataset de entrenamiento.
- Riesgo de alucinacion: en el contexto robotico, esto se traduce en acciones incorrectas o movimientos erraticos cuando la observacion esta fuera de la distribucion de entrenamiento. No hay garantia de seguridad en entornos no controlados.
- Limitaciones de contexto: la ventana de observacion y el horizonte de prediccion no estan documentados; es necesario revisar la configuracion del entrenamiento para conocer los valores exactos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias. El usuario es responsable de validar su comportamiento en aplicaciones de produccion.
- Caveat para produccion: este modelo es un experimento de investigacion (0 descargas, 0 likes) y no ha sido validado en entornos reales de produccion. Se recomienda realizar una evaluacion exhaustiva antes de cualquier despliegue critico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pjongb/omx_act_policy3_1)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentacion de LeRobot para ACT](https://huggingface.co/docs/lerobot/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento pjongb/pick_and_place3](https://huggingface.co/datasets/pjongb/pick_and_place3)
