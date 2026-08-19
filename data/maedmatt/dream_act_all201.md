# maedmatt/DREAM_ACT_all201

## Resumen

DREAM_ACT_all201 es un modelo de robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. El modelo está diseñado para controlar un robot seguidor (tipo `so_follower`) equipado con una cámara frontal, y su tarea específica es "Fill the pyramid with circles" (rellenar la pirámide con círculos), a partir de un dataset de 201 episodios teleoperados.

Con aproximadamente 51,7 millones de parámetros, es un modelo compacto pensado para ejecutarse en tiempo real en hardware modesto. Su relevancia radica en que demuestra el flujo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de control en un robot real, con una licencia Apache 2.0 que permite uso comercial sin restricciones. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en el robot no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador y decodificador, con VAE para modelar la variabilidad de las acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (en ACT, la ventana de observaciones suele ser de 1 frame, pero no se especifica en la documentacion) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones GGUF u otras) |
| Idiomas soportados | no aplica (modelo de control robotico, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://arxiv.org/abs/2304.13705). ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso de tiempo, genera un "chunk" de acciones futuras (tipicamente de 10 a 100 pasos). Esto reduce el error de acumulacion y mejora la estabilidad del control. La arquitectura combina un codificador de vision (para procesar la imagen de la camara frontal) con un decodificador autoregresivo que genera las acciones, y utiliza un VAE (variational autoencoder) para capturar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizo con el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 201 episodios teleoperados (105.529 frames a 30 FPS) de la tarea de rellenar una piramide con circulos. La configuracion de entrenamiento fue: 20.000 pasos, batch size de 64, optimizador AdamW con learning rate de 2e-05 y seed 1000, utilizando LeRobot version 0.6.2. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; es un entrenamiento puramente de imitacion supervisada.

## Capacidades

- Control robotico de un brazo seguidor (`so_follower`) mediante observaciones de estado (6 dimensiones) e imagen RGB frontal (480x640).
- Generacion de chunks de acciones (6 dimensiones) para tareas de manipulacion, gracias al mecanismo de action chunking de ACT.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de ingenieria de recompensas.
- Ejecucion en tiempo real sobre hardware robotico, dado el tamano reducido del modelo (~51,7M parametros).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje o vision general; es un modelo especializado en una unica tarea robotica.

## Casos de uso

- Automatizacion de tareas de ensamblaje o clasificacion en entornos industriales: el modelo puede controlar un brazo robotico para colocar piezas (en este caso, circulos) en posiciones predefinidas, replicando la tarea aprendida.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto de la variabilidad de las demostraciones, el action chunking o la transferencia entre robots.
- Prototipado rapido de politicas robotizadas con LeRobot: al estar publicado en el Hub, se puede cargar directamente con `lerobot-rollout` y evaluar en un robot compatible sin reentrenar.
- Educacion y formacion en robotica: permite a estudiantes y desarrolladores experimentar con un pipeline completo de imitacion, desde la recopilacion de datos hasta el despliegue, con un modelo de tamano reducido que cabe en GPUs de consumo.
- Benchmarking de metodos de control: al ser un modelo ACT estandar, puede compararse con otras politicas entrenadas en el mismo dataset para evaluar mejoras en precision o robustez.
- Desarrollo de sistemas de manipulacion en entornos domesticos o de laboratorio: la tarea de rellenar una piramide con circulos es representativa de tareas de colocacion y apilado, utiles en asistentes roboticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de exito, precision ni comparaciones con otros modelos en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene ~51,7M de parametros, en precision fp32 ocuparia aproximadamente 207 MB, y en fp16 unos 103 MB. Esto sugiere que cabria en cualquier GPU moderna con al menos 2 GB de VRAM, aunque no hay datos oficiales de consumo.
- GPU recomendadas: no se especifican. Por el tamano, una GPU de consumo como una RTX 3060 o superior seria mas que suficiente. Tambien podria ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, dado el reducido numero de parametros.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en un robot real. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo pequeno, se espera una inferencia en tiempo real (por debajo de 30 ms por paso) en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos ACT entrenados en el mismo dataset o con caracteristicas comparables. La comparativa no esta disponible.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real es desconocido y podria no alcanzar la tarea de forma fiable.
- El modelo esta entrenado para una tarea muy especifica ("Fill the pyramid with circles") y con un robot concreto (`so_follower`); no es transferible a otras tareas o robots sin reentrenamiento.
- Depende de la configuracion de camaras y del entorno de entrenamiento; cambios en iluminacion, posicion de objetos o distracciones pueden degradar el rendimiento.
- No tiene capacidades de lenguaje ni de razonamiento general; es un modelo de control motor puro.
- Los datos de entrenamiento provienen de teleoperacion, por lo que pueden heredar sesgos del operador humano (por ejemplo, trayectorias suboptimas o variaciones en la velocidad).
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte oficial.
- No se proporcionan cuantizaciones alternativas (GGUF, ONNX, etc.), lo que limita su despliegue en entornos sin soporte de safetensors.

## Enlaces

- Repositorio del modelo: [maedmatt/DREAM_ACT_all201](https://huggingface.co/maedmatt/DREAM_ACT_all201)
- Paper de ACT: [Action Chunking with Transformers](https://arxiv.org/abs/2304.13705)
- Dataset de entrenamiento: [maedmatt/DREAM-pyramid-circles](https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles)
- Documentacion de LeRobot: [LeRobot](https://github.com/huggingface/lerobot)
- Guia de ACT en LeRobot: [LeRobot act guide](https://huggingface.co/docs/lerobot/main/en/act)
- Visualizacion del dataset: [visualize dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=maedmatt/DREAM-pyramid-circles)
