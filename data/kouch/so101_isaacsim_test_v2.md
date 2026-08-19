# Kouch/SO101_IsaacSim_Test_V2

## Resumen

Kouch/SO101_IsaacSim_Test_V2 es un modelo de política robótica basado en Action Chunking with Transformers (ACT), entrenado mediante el framework LeRobot de Hugging Face. El modelo fue desarrollado por Kouch Sato y está diseñado para controlar un brazo robótico SO-101 en una tarea de pick-and-place: recoger un cubo azul y colocarlo en una caja. Se trata de un modelo de imitación que aprende a partir de demostraciones teleoperadas, en este caso generadas en simulación con NVIDIA Isaac Sim.

El modelo tiene 51,67 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia actual radica en que forma parte del ecosistema de sim-to-real para robótica física impulsado por NVIDIA y Hugging Face, donde se entrena una política en simulación y se despliega después en un robot real. La arquitectura ACT, propuesta en el paper arXiv:2304.13705, predice secuencias de acciones (action chunks) en lugar de acciones paso a paso, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

El modelo se entrenó con un dataset de 20 episodios (8.083 fotogramas a 30 FPS) procedente del repositorio Kouch/SO101_IsaacSim_Block_Pick_and_Place_V2. No se han publicado resultados de evaluación en robot real ni benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de politica robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que genera bloques de acciones (action chunks) de longitud fija en lugar de predecir una unica accion por paso de tiempo. Esta arquitectura combina un transformer con un mecanismo de VAE (variational autoencoder) condicionado por la observacion actual. El encoder de vision procesa imagenes de una camara RGB (top, resolucion 480x640) y el estado del robot (vector de 6 dimensiones) como entrada. El decoder produce una secuencia de acciones de 6 dimensiones.

El entrenamiento se realizo con el framework LeRobot (version 0.6.2) sobre un dataset de demostraciones generadas en Isaac Sim. Se usaron 10.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate de 1e-5, con semilla 1000. El dataset contiene 20 episodios con 8.083 fotogramas a 30 FPS. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posteriores al entrenamiento por imitacion.

## Capacidades

- Control de robot SO-101: genera comandos de articulacion (6 dimensiones) para el brazo robotico.
- Tarea de pick-and-place: recoge un cubo azul y lo coloca en una caja, segun la tarea definida en el dataset.
- Percepcion visual: procesa imagenes RGB de una camara superior (top) a 480x640.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Inferencia en tiempo real: al ser un modelo de tamano moderado (51,7 M parametros), puede ejecutarse en GPU de consumo.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).

## Casos de uso

- Automatizacion de tareas de manipulacion en entornos industriales: el modelo puede controlar un brazo SO-101 para realizar tareas repetitivas de recogida y colocacion de objetos, reduciendo la intervencion humana en lineas de produccion.
- Prototipado rapido en simulacion: al estar entrenado en Isaac Sim, permite validar politicas de control en entornos simulados antes de desplegarlas en hardware real, ahorrando costes y tiempo.
- Transferencia sim-to-real: el modelo sirve como punto de partida para estudiar tecnicas de transferencia de politicas entrenadas en simulacion a robots fisicos, un area de investigacion activa en robotica.
- Investigacion en aprendizaje por imitacion: al ser un checkpoint de ACT, puede utilizarse como referencia para comparar variantes de arquitectura, tecnicas de aumento de datos o metodos de regularizacion en el campo del aprendizaje por imitacion.
- Educacion y formacion en robotica: el modelo y su dataset asociado pueden usarse en cursos y talleres (como el taller de NVIDIA sobre sim-to-real con SO-101) para ensenar flujos de trabajo completos de entrenamiento y despliegue de politicas robotica.
- Desarrollo de sistemas de manipulacion asistida: en entornos de laboratorio o logistica, el modelo puede integrarse en sistemas que requieran recoger y colocar objetos de forma autonoma, con supervision humana opcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de metricas como tasa de exito en tareas, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene ~51,7 millones de parametros, una cuantizacion FP32 requeriria aproximadamente 207 MB de memoria. En FP16 serian unos 103 MB. La inferencia es ligera y puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 10xx o superior). Una RTX 3060 o superior es mas que suficiente. Tambien puede ejecutarse en CPU, aunque con menor rendimiento.
- Compatibilidad con GPU de consumo: si, cabe sin problema en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en un robot SO-101 conectado por puerto serie o USB. Tambien es posible cargar el modelo con PyTorch y ejecutarlo en un script personalizado.
- Latencia y throughput: no hay datos publicados. Dado el tamano del modelo y la arquitectura ACT, la latencia por paso de inferencia deberia ser del orden de milisegundos en una GPU moderna, pero no se puede confirmar sin mediciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El modelo es un checkpoint especifico para una tarea de pick-and-place con un robot SO-101, y no existen datos publicados de otros modelos de la misma categoria con los que compararlo. Los modelos comparables serian otros checkpoints de ACT entrenados con LeRobot para tareas similares, pero no hay benchmarks comunes.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset pequeno (20 episodios) y especifico para una tarea concreta. Su generalizacion a otras tareas, objetos o configuraciones del entorno es muy limitada.
- No se han realizado evaluaciones en robot real. El rendimiento en el mundo fisico puede diferir significativamente del comportamiento en simulacion, especialmente en condiciones de iluminacion, texturas o posiciones de objetos no vistas durante el entrenamiento.
- La politica depende de una camara superior (top). Si la camara se mueve, se obstruye o cambia su calibracion, la politica puede fallar.
- El modelo no tiene capacidades de lenguaje ni de razonamiento simbolico. Es una politica puramente reactiva que reproduce patrones de accion aprendidos.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que los componentes de terceros (como Isaac Sim o el propio robot) no tengan restricciones adicionales.
- Al ser un modelo entrenado con aprendizaje por imitacion, puede reproducir sesgos presentes en las demostraciones (por ejemplo, trayectorias suboptimas o comportamientos inseguros).
- No se proporcionan garantias de seguridad. El despliegue en un robot real requiere medidas de seguridad adecuadas, como paradas de emergencia y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kouch/SO101_IsaacSim_Test_V2
- Dataset de entrenamiento: https://huggingface.co/datasets/Kouch/SO101_IsaacSim_Block_Pick_and_Place_V2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Taller de NVIDIA sobre sim-to-real con SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Repositorio del taller (Isaac Lab y GR00T): https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop
- Perfil del autor: https://huggingface.co/Kouch
