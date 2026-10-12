# RoboCrafty/act_real_4_3

## Resumen

RoboCrafty/act_real_4_3 es una política de manipulación robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv:2304.13705. En lugar de predecir una única acción por paso, ACT predice bloques cortos de acciones (action chunks), lo que reduce el error de composición y suele lograr tasas de éxito altas en tareas de manipulación teleoperadas. El modelo lo publica el usuario RoboCrafty y se ha entrenado y subido al Hub con la librería LeRobot de Hugging Face.

Se trata de un modelo compacto, con 51.670.663 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, orientado a una tarea concreta: apilar un cubo amarillo sobre un cubo azul ("put the yellow cube on the blue cube"). Consume el estado articular del robot (vector de 7 dimensiones) y dos cámaras RGB (3x720x1280 cada una), y produce una acción de 7 dimensiones correspondiente al robot `my_parol6`.

Es relevante porque ejemplifica el flujo actual de robótica open source: un modelo de imitación entrenado sobre un dataset propio de 100 episodios (79.957 fotogramas a 30 FPS), ejecutable con la CLI de LeRobot y licencia Apache 2.0, lo que permite reproducir, evaluar o afinar la política sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder-decoder (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una observacion por paso y predice un chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; es una politica robotica, no un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | my_parol6 |
| Camaras | cam_1, cam_2 |
| Entradas | observation.state (7,); observation.images.cam_1 (3, 720, 1280); observation.images.cam_2 (3, 720, 1280) |
| Salidas | action (7,) |
| Dataset de entrenamiento | RoboCrafty/parol6_stack_real_4 (100 episodios, 79.957 fotogramas, 30 FPS) |
| Tarea | "put the yellow cube on the blue cube" |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705, que combina un esquema de autocodificador variacional condicional (CVAE) con un transformer. El codificador procesa las observaciones (imágenes mediante un backbone convolucional y el estado articular) junto con una variable latente de estilo, y el decodificador genera un bloque de k acciones futuras en lugar de un único paso. Este enfoque de "action chunking" evita el problema de la predicción de acciones no multimodales y, combinado con ensamblado temporal en inferencia, suaviza las transiciones entre bloques. Esta descripción proviene del artículo referenciado, no de la model card, que no detalla los hiperparámetros arquitectónicos internos.

Según la model card, el entrenamiento se realizó con LeRobot 0.6.1 durante 15.000 pasos, con un batch size de 64, optimizador AdamW, tasa de aprendizaje 2e-05 y semilla 1000. El dataset es `RoboCrafty/parol6_stack_real_4`, compuesto por 100 episodios teleoperados y 79.957 fotogramas grabados a 30 FPS, todos ellos de la misma tarea de apilado. No se indica en la información disponible si se aplicaron fases de RLHF, DPO u otro refinamiento posterior; en ACT el objetivo es una pérdida de reconstrucción sobre las acciones junto con regularización KL del latente.

## Capacidades

- Control de manipulacion robotica por imitacion: predice acciones de 7 grados de libertad (posicion/orientacion y pinza) a partir del estado articular y de dos vistas de camara.
- Apilado de objetos: la politica esta entrenada especificamente para colocar un cubo amarillo sobre un cubo azul.
- Percepcion visual multi-camara: procesa dos flujos de imagen de 720x1280 a color, lo que aporta informacion espacial redundante.
- Prediccion por bloques (action chunking): genera secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad del movimiento.
- Ejecucion en bucle cerrado a 30 FPS mediante la CLI de LeRobot (`lerobot-rollout`).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes conversacionales; el razonamiento se limita al control motor reactivo.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision, audio, thinking mode): solo vision (dos camaras RGB); no dispone de audio ni de modo de razonamiento explicito.

## Casos de uso

- Automatizacion de apilado en laboratorio: ejecutar la politica sobre un robot `my_parol6` para colocar un cubo amarillo sobre uno azul de forma repetible, usando `lerobot-rollout` con `--policy.path=RoboCrafty/act_real_4_3` y la tarea indicada.
- Base para fine-tuning con datos propios: al ser un modelo ACT estandar entrenado con LeRobot, sirve como punto de partida para reentrenar con `lerobot-train --policy.type=act` sobre nuevos datasets de la misma plataforma.
- Banco de pruebas de aprendizaje por imitacion: util para comparar configuraciones ACT frente a otras politicas (por ejemplo Diffusion Policy) en una tarea de manipulacion acotada y medible.
- Integracion en demostraciones de robótica educativa: el modelo permite mostrar un ciclo completo de teleoperacion, grabacion de dataset y despliegue de una politica en un robot de sobremesa.
- Validacion de pipelines de datos con LeRobot: el dataset asociado (100 episodios, 79.957 fotogramas) y la politica permiten verificar herramientas de visualizacion y entrenamiento de la libreria.
- Investigacion sobre chunking y ensamblado temporal: la politica permite experimentar con el tamano de bloque de acciones y el ensamblado temporal sobre hardware real a 30 FPS.
- Prototipado de tareas pick-and-place: sirve como referencia para evaluar si ACT es suficiente para una tarea de colocacion antes de invertir en modelos VLA de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con el texto literal "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de exito ni numero de ensayos documentados para esta politica.

## Requisitos de hardware

- Los pesos ocupan aproximadamente 207 MB en fp32 (51,67 M de parametros x 4 bytes) y unos 103 MB en fp16/bf16; el repositorio completo es de 0,2 GB.
- La memoria de inferencia depende sobre todo de las activaciones de las dos imagenes de 720x1280 procesadas por el backbone convolucional; se estima un consumo de VRAM del orden de 2 a 4 GB en fp32 con batch 1 (estimacion, no confirmada por el autor).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, entre otras; tambien en GPUs integradas de robots como NVIDIA Jetson Orin.
- Es viable la ejecucion en CPU, aunque no se garantiza el bucle de control a 30 FPS; para tiempo real se recomienda GPU.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: el sistema debe operar a 30 FPS para igualar la frecuencia de grabacion del dataset; el rendimiento real en el robot no esta documentado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCrafty/act_real_4_3 (ACT) | 51,67 M | Transformer encoder-decoder con CVAE | Chunk de acciones (k no especificado) | apache-2.0 | Hugging Face, via LeRobot |
| Diffusion Policy | no disponible | Politica generativa por difusion | Predice secuencias de acciones | no disponible en esta busqueda | Repositorio de investigacion |
| SmolVLA | no disponible en esta busqueda | Vision-Language-Action | Multi-tarea | no disponible en esta busqueda | Hugging Face, via LeRobot |
| OpenVLA | no disponible en esta busqueda | Vision-Language-Action | Multi-tarea | no disponible en esta busqueda | Hugging Face |

Nota: las cifras de los modelos comparados no estan confirmadas en la informacion proporcionada para esta ficha, por lo que se marcan como no disponibles. La comparacion fiable debe limitarse a que act_real_4_3 es una politica ACT monomodelo y monotarea, frente a alternativas VLA de proposito general.

## Limitaciones y advertencias

- Alcance muy restringido: la politica esta entrenada unicamente para la tarea "put the yellow cube on the blue cube"; no se espera comportamiento correcto en objetos, posiciones o instrucciones distintas.
- Sin evaluacion publicada: no hay tasas de exito ni numero de ensayos, por lo que se desconoce su fiabilidad real en el robot.
- Posible sobreajuste al entorno de grabacion: cambios de iluminacion, fondo, posicion de los objetos o distracciones pueden degradar el rendimiento, ya que el dataset es de un unico entorno.
- Acoplamiento al hardware: espera un robot `my_parol6` y dos camaras con los nombres `cam_1` y `cam_2`; los nombres e indices de camara deben coincidir con los de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones fisicas incorrectas o inseguras ante observaciones fuera de distribucion.
- Sesgos conocidos: no documentados por el autor; el sesgo vendria dado por las condiciones concretas del dataset de teleoperacion.
- Limitaciones de idioma: no aplica, no procesa lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar avisos de copyright y citar el metodo y LeRobot segun la model card.
- Caveat de produccion: el bucle de control exige 30 FPS; una latencia superior a la de entrenamiento puede romper la coherencia del ensamblado temporal de acciones.
- La fecha de creacion indicada en el repositorio es 2026-10-11, posterior a la fecha habitual de publicacion; conviene verificar el estado real del repositorio antes de usarlo.
- El modelo tiene 0 descargas y 0 "likes", lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/act_real_4_3
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_stack_real_4
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_stack_real_4
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de la CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
