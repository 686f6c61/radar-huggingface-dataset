# Riccardo11/smolvla_blue_cylinder

# Riccardo11/smolvla_blue_cylinder

## Resumen

Riccardo11/smolvla_blue_cylinder es un modelo de politica vision-lenguaje-accion (VLA) obtenido mediante ajuste fino de SmolVLA, la arquitectura compacta publicada por Hugging Face en el paper arXiv:2506.01844. El modelo está orientado a robótica y se distribuye a través de la librería LeRobot, con pesos en formato safetensors y un total de 450.046.176 parametros (aproximadamente 450 millones).

La funcion concreta que implementa es una tarea de manipulacion: "Grasp the blue cylinder" (agarrar el cilindro azul). Se ha entrenado sobre el dataset Riccardo11/blue_cylinder_grasp_1, compuesto por 81 episodios y 17.593 fotogramas grabados a 30 FPS con un robot bimanual de tipo `bi_so_follower` equipado con tres camaras (frontal, muneca izquierda y muneca derecha). El resultado es un checkpoint de imitation learning que mapea observaciones multimodales a una accion de 12 dimensiones.

Su relevancia radica en dos factores. Por un lado, demuestra que un modelo VLA de solo 450 millones de parametros puede ajustarse a una tarea robotica especifica con recursos de computo modestos, en linea con la filosofia de SmolVLA de ser desplegable en hardware de consumo o incluso CPU. Por otro lado, es un ejemplo tipico de politica entrenada por la comunidad con LeRobot: el repositorio no incluye todavia resultados de evaluacion en robot real ni una licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA; combina un VLM compacto con un modulo de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo define una tarea fija en lenguaje, no un contexto de texto extenso) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors |
| Idiomas soportados | no disponible (la tarea esta definida en ingles: "Grasp the blue cylinder") |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | bi_so_follower |
| Camaras | front, left_wrist, right_wrist |
| Entrada | observation.state (12,), observation.images.front (3, 480, 640), observation.images.left_wrist (3, 480, 640), observation.images.right_wrist (3, 480, 640) |
| Salida | action (12,) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo deriva de SmolVLA, un VLA compacto de aproximadamente 450 millones de parametros que combina un modelo de vision-lenguaje (VLM) preentrenado con un experto de acciones. SmolVLA fue disenado para reducir el coste computacional frente a los VLA masivos y para poder entrenarse y desplegarse en una unica GPU o en CPU. El paper asociado (arXiv:2506.01844) lo describe como un modelo entrenado integramente sobre datasets recogidos por la comunidad, con un esquema de atencion que permite procesar observaciones visuales y la instruccion en lenguaje de forma eficiente. Esta ficha no dispone de detalles adicionales del paper sobre el numero exacto de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni las tecnicas de alineacion (RLHF/DPO) empleadas en la fase base.

El checkpoint aqui descrito no es el modelo base, sino un ajuste fino supervisado (imitation learning) sobre el dataset Riccardo11/blue_cylinder_grasp_1. Segun la model card, el entrenamiento se realizo con LeRobot 0.6.2 durante 20.000 pasos, con tamano de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de entrenamiento contiene 81 episodios y 17.593 fotogramas a 30 FPS para una unica tarea de agarre. La politica consume el estado del robot (12 dimensiones) y tres imagenes RGB de 480x640, y produce un vector de accion de 12 dimensiones compatible con el robot bimanual de tipo `bi_so_follower`.

## Capacidades

- Control robotico por imitacion: genera acciones de 12 dimensiones (probablemente 6 grados de libertad por brazo) a partir de observaciones de estado y vision.
- Percepcion visual multivista: procesa simultaneamente tres camaras (frontal y dos de muneca) a 480x640, lo que permite estimar la posicion del objeto y la configuracion de las pinzas.
- Condicionamiento por lenguaje: la tarea se especifica mediante una instruccion textual ("Grasp the blue cylinder"), siguiendo el paradigma VLA.
- Ejecucion sobre hardware de consumo: al derivar de SmolVLA, el modelo esta pensado para funcionar en una sola GPU o incluso en CPU.
- Integracion nativa con LeRobot: se ejecuta mediante el comando `lerobot-rollout` y puede reentrenarse con `lerobot-train`.
- No se ha documentado soporte de tool calling, function calling, razonamiento multietapa explicito, ni capacidades de audio o vision generalista fuera del bucle de control robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place: el modelo puede ejecutar el agarre del cilindro azul en un puesto de trabajo robotico, recibiendo la instruccion y las imagenes de las camaras y emitiendo las acciones de las pinzas, gracias a que fue entrenado especificamente para esa tarea con 81 episodios de demostracion.
- Prototipado rapido en investigacion en robotica: sirve como punto de partida para estudiar imitacion con VLA en robots bimanuales sin necesidad de clústeres de GPU, al tener solo 450 millones de parametros.
- Referencia para pipelines de imitation learning con LeRobot: puede usarse como plantilla de entrenamiento (dataset, configuracion y comando `lerobot-train`) para quienes quieran replicar el flujo con sus propios objetos o robots.
- Validacion de hardware de bajo coste: al ser un modelo pequeno, permite comprobar en un solo equipo el ciclo completo de captura, entrenamiento, despliegue y evaluacion de una politica.
- Docencia y formacion en aprendizaje por imitacion: los 81 episodios a 30 FPS y los 20.000 pasos de entrenamiento lo convierten en un ejemplo manejable para ilustrar el flujo de LeRobot de principio a fin.
- Banco de pruebas de robustez de agarre: permite medir la tasa de exito del agarre frente a variaciones de posicion, iluminacion o distracciones, aunque el autor todavia no ha publicado esas evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito en robot real ni metricas comparables con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,8 GB en fp32, 0,9 GB en fp16/bfloat16 y 0,45 GB en int8 (estimaciones derivadas de los 450 millones de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM dedicada, como una RTX 3050, RTX 4060, RTX 4090 o GPUs de datacenter (A100, H100) sobradamente dimensionadas para este modelo.
- Si cabe en GPU de consumo: si, con gran margen; el modelo esta disenado precisamente para hardware de consumo e incluso para ejecucion en CPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar e `lerobot-train` para reentrenar). No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son los entornos habituales para politicas roboticas de este tipo.
- Latencia y throughput: no disponibles. La politica opera a 30 FPS en la recogida de datos, pero no se ha publicado la latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Riccardo11/smolvla_blue_cylinder | 450 M | VLA (fine-tune de SmolVLA) | 3 imagenes 480x640 + estado 12 | no disponible | Hugging Face (0 descargas) |
| SmolVLA (base) | ~450 M | VLA | multimodal | no disponible en esta ficha | Hugging Face / LeRobot |
| OpenVLA | ~7 B | VLA | vision-lenguaje-accion | open source (detalles no disponibles en esta ficha) | Hugging Face |
| Modelos VLA de mayor escala (por ejemplo, familias tipo pi0 / RT-2) | varios miles de millones | VLA | vision-lenguaje-accion | no disponible en esta ficha | repositorios de investigación |

La comparacion cuantitativa de rendimiento no es posible porque el autor no ha publicado benchmarks. La diferencia principal frente a OpenVLA o los VLA de mayor escala es el tamano (450 M frente a varios miles de millones de parametros), lo que reduce drasticamente los requisitos de hardware a costa de especializarse en una unica tarea.

## Limitaciones y advertencias

- El modelo esta ajustado para una unica tarea ("Grasp the blue cylinder"). No se ha demostrado que generalice a otros objetos, posiciones o instrucciones.
- No hay resultados de evaluacion en robot real, por lo que se desconoce su tasa de exito, su robustez ante cambios de iluminacion o su comportamiento ante distracciones.
- La licencia no esta especificada, lo que impide determinar si se permite su uso comercial. Debe aclararse antes de cualquier despliegue en produccion.
- No se han declarado sesgos concretos, pero al entrenarse sobre un dataset reducido (81 episodios de un unico montaje) es probable que el modelo herede las condiciones especificas de esa configuracion (posiciones de camara, robot concreto, fondo, iluminacion).
- Riesgo de sobreajuste y de fallo fuera de distribucion: con 20.000 pasos sobre un dataset pequeno, la politica puede degradarse ante objetos distintos al cilindro azul o ante el mismo cilindro en posiciones no vistas.
- La instruccion de tarea esta en ingles; no se documenta soporte multilingue.
- El repositorio tiene 0 descargas y 0 likes, y fue creado con un unico commit, por lo que no cuenta con validacion externa de la comunidad.
- La fecha de creacion indicada (2026-10-07) resulta atipica; conviene verificar la procedencia del repositorio antes de confiar en el.
- Compatibilidad limitada a LeRobot: no se documenta soporte para entornos de inferencia genericos como vLLM, TGI u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riccardo11/smolvla_blue_cylinder
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/blue_cylinder_grasp_1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/blue_cylinder_grasp_1
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Guia de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Articulo divulgativo sobre SmolVLA: https://www.marktechpost.com/2025/06/03/hugging-face-releases-smolvla-a-compact-vision-language-action-model-for-affordable-and-efficient-robotics/
