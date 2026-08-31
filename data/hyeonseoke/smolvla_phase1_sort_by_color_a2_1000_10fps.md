# HyeonseokE/smolvla_phase1_sort_by_color_A2_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en hardware asequible. Este repositorio concreto, `HyeonseokE/smolvla_phase1_sort_by_color_A2_1000_10fps`, es un fine-tune del modelo base `lerobot/smolvla_base` (que a su vez se basa en SmolVLM) entrenado para la tarea de ordenar bloques de colores sobre platos del mismo color. El modelo fue desarrollado por HyeonseokE y distribuido a través de la librería LeRobot de HuggingFace, bajo licencia Apache 2.0.

El problema que resuelve es el control de un robot manipulador (tipo `so101_follower`) a partir de entradas visuales de dos cámaras y un vector de estado de 6 dimensiones, generando acciones de 6 grados de libertad. Su relevancia radica en que, con solo 450 millones de parámetros, puede ejecutarse en GPUs de consumo, lo que democratiza la investigación en robótica inteligente frente a modelos VLA masivos como OpenVLA (7B) o RT-2.

La arquitectura sigue el diseño de SmolVLA: un encoder de visión y un modelo de lenguaje ligero que procesan imágenes y texto para predecir acciones. El contexto de secuencia no está especificado en la documentación del repositorio, pero al derivar de SmolVLM suele ser de 8.000 tokens. El entrenamiento se realizó sobre un dataset simulado de 100 episodios (74.921 frames a 10 FPS) recopilado en Isaac Sim mediante SCRAPE-IsaacLab, con etiquetas de habilidades en lenguaje natural por frame.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM, con encoder visual y decodificador de acciones |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de SmolVLM, tipicamente 8.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la tarea usa instrucciones en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que adapta un VLM preentrenado (SmolVLM) a tareas de control robotico. El modelo procesa imagenes de camaras (en este caso, `top` y `left_wrist`) junto con el estado del robot (6 valores) y una instruccion en lenguaje natural, y produce una accion de 6 grados de libertad. La arquitectura es un transformer multimodal que combina un encoder de vision con un modelo de lenguaje generativo, y se entrena mediante aprendizaje por imitacion (imitation learning) con el framework LeRobot.

El fine-tune se realizo sobre el checkpoint `lerobot/smolvla_base` usando el dataset `HyeonseokE/phase1_sort_by_color_A2_10fps`, que contiene 100 episodios de un robot simulando la tarea de clasificar bloques de colores en platos del mismo color. Las imagenes se capturaron a 10 FPS con resolucion 256x256. La configuracion de entrenamiento incluyo 58.500 pasos, batch size de 64, optimizador AdamW y learning rate de 1e-4, con semilla 1000. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado sobre las demostraciones.

## Capacidades

- Control robotico de bajo nivel: genera acciones de 6 grados de libertad (posicion y orientacion del efector) a partir de observaciones visuales y de estado.
- Percepcion visual multicamara: procesa imagenes de dos camaras (superior y muneca izquierda) con resolucion 256x256.
- Seguimiento de instrucciones en lenguaje natural: la tarea se define mediante la frase "Sort the blocks onto the matching colored dishes" y el modelo asocia la instruccion con las acciones correspondientes.
- Aprendizaje por imitacion: el modelo aprende a imitar las demostraciones del dataset, sin necesidad de ingenieria de recompensas.
- Ejecucion en tiempo real: al ser un modelo compacto, puede ejecutarse en hardware de consumo para inferencia robotica.

## Casos de uso

- Clasificacion automatica de objetos en entornos industriales: el modelo puede controlar un brazo robotico para separar piezas por color o forma en una linea de montaje, gracias a su capacidad de asociar instrucciones visuales con acciones motoras.
- Automatizacion de tareas de picking and placing en almacenes: con la entrada de camaras y estado, el modelo puede recoger objetos de una posicion y colocarlos en otra, reduciendo la intervencion humana en logistica.
- Investigacion en aprendizaje por imitacion: sirve como banco de pruebas para estudiar tecnicas de VLA en tareas de manipulacion, dado su tamano reducido y facilidad de entrenamiento con LeRobot.
- Desarrollo de robots educativos: estudiantes e investigadores pueden desplegar este modelo en plataformas como SO-101 para experimentar con control basado en lenguaje, sin requerir GPUs de alta gama.
- Benchmarking de VLA en simulacion: el modelo puede utilizarse como referencia para comparar el rendimiento de otros VLA en tareas estandarizadas de clasificacion por color en entornos simulados.
- Pruebas de transferencia sim-to-real: aunque entrenado en simulacion, puede evaluarse en robots reales para medir la brecha de realidad, un caso de uso comun en investigacion robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de metricas como tasa de exito en la tarea ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450 M de parametros y pesos en safetensors (0,9 GB), la inferencia puede ejecutarse en GPUs con 2-4 GB de VRAM en precision FP16, dependiendo del batch y la resolucion de imagen.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA RTX 3060, RTX 4070, etc.) es suficiente. En CPU podria ejecutarse pero con latencia mayor.
- Compatibilidad con GPUs consumer: si, es uno de los objetivos del modelo SmolVLA.
- Opciones de despliegue: se usa principalmente con LeRobot mediante los comandos `lerobot-rollout` y `lerobot-train`. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de generacion de texto sino de control robotico.
- Latencia y throughput: no disponible. Dependera del hardware y de la implementacion de LeRobot.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este fine-tune especifico. Como referencia, el modelo base SmolVLA (450 M) se posiciona frente a alternativas mas grandes como OpenVLA (7B) y RT-2 (55B), ofreciendo menor coste computacional a cambio de menor capacidad de generalizacion. Sin embargo, no hay benchmarks disponibles en este repositorio para establecer una comparacion cuantitativa. Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para ver resultados agregados del modelo base.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion (Isaac Sim via SCRAPE-IsaacLab): puede no transferir correctamente a entornos reales debido a la brecha sim-to-real (diferencias en iluminacion, texturas, dinamica del robot).
- Especializado en una unica tarea: el fine-tune solo reconoce la instruccion "Sort the blocks onto the matching colored dishes" y no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuracion de camaras: los nombres de las camaras (`top`, `left_wrist`) deben coincidir exactamente con las del robot fisico, y la posicion de las mismas afecta al rendimiento.
- Sin evaluacion reportada: no hay metricas de exito en el mundo real ni en simulacion, por lo que el rendimiento esperado es incierto.
- Riesgo de sobreajuste: con solo 100 episodios y 58.500 pasos, el modelo puede memorizar las demostraciones en lugar de aprender una politica robusta, especialmente ante variaciones en la posicion de los objetos.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (dataset simulado) pueden tener restricciones adicionales; se debe verificar la licencia del dataset `HyeonseokE/phase1_sort_by_color_A2_10fps`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A2_1000_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A2_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/phase1_sort_by_color_A2_10fps
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
