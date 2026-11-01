# SathyarajMedipalli/so101_pi0_object_pnp_v1

## Resumen

`so101_pi0_object_pnp_v1` es un modelo de politica visio-linguistica-accion (VLA) para robotica, publicado por SathyarajMedipalli en Hugging Face. Se trata de un fine-tuning del modelo fundacional `lerobot/pi0_base`, la implementacion en LeRobot del π₀ de Physical Intelligence. El modelo resuelve una tarea concreta de manipulacion robotica: recoger un objeto y depositarlo en una caja ("Pickup object and place in the box"), ejecutada sobre un robot SO-101 (tipo `so_follower`) con dos camaras.

La relevancia de esta ficha es acotada y conviene ser explicito: no es un modelo de proposito general ni un LLM, sino un checkpoint de imitation learning entrenado sobre un unico dataset de 50 episodios y 30.109 frames a 30 FPS. Su valor practico esta en servir como ejemplo reproducible de fine-tuning de π₀ con LeRobot 0.6.2 sobre hardware de bajo coste, no en capacidades generales de razonamiento o generacion de texto.

El modelo tiene 4.028.019.472 parametros (unos 4.030 millones), ocupa 8,9 GB en el repositorio y se distribuye en formato safetensors bajo licencia Apache 2.0. La entrada combina estado proprioceptivo de 6 dimensiones con dos imagenes RGB de 480x640, y la salida es un vector de accion de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀, implementacion LeRobot de OpenPI; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observacion no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se reciben como texto de tarea, p. ej. "Pickup object and place in the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.gripper_camera` | VISUAL | `(3, 480, 640)` |
| `observation.images.overview_camera` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

| Dato de entrenamiento | Valor |
|---|---|
| Dataset | `SathyarajMedipalli/object_pnp_5p_50ep_20261022_011835` |
| Episodios | 50 |
| Frames | 30.109 |
| FPS | 30 |
| Tarea | "Pickup object and place in the box" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `gripper_camera`, `overview_camera` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi0_base`, la adaptacion en LeRobot del π₀ de Physical Intelligence, descrito por el autor como una politica generalista Vision-Language-Action que interpreta entradas visuales, instrucciones en lenguaje natural y controla robots en tareas diversas. La informacion proporcionada no detalla la composicion interna de capas, el mecanismo de atencion ni el esquema exacto de fusion vision-lenguaje-accion; esos datos no estan disponibles en la model card.

El entrenamiento es de imitacion supervisada sobre un dataset propio de 50 episodios (30.109 frames a 30 FPS) que cubre una unica tarea de pick-and-place. Se ejecutaron 20.000 pasos con batch size 4, AdamW y learning rate 2,5e-05, semilla 1000, usando LeRobot 0.6.2. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, ni el numero de tokens o composicion del corpus del modelo base.

## Capacidades

- Control robotico visio-motor: genera acciones de 6 dimensiones a partir de estado proprioceptivo y dos vistas de camara.
- Condicionamiento por instruccion en lenguaje natural: la tarea se pasa como texto (`--task="Pickup object and place in the box"`).
- Fusion multimodal de dos camaras (gripper y overview) con estado del robot.
- Ejecucion de una politica de pick-and-place entrenada para el robot SO-101 (`so_follower`).
- Inferencia en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, tool calling, agentes multi-paso, vision general, audio ni modo thinking. La informacion disponible no las respalda.

## Casos de uso

- Recogida y deposito de objetos en caja con SO-101: es el caso de uso directo y unico documentado; se lanza con `lerobot-rollout` indicando `--policy.path=SathyarajMedipalli/so101_pi0_object_pnp_v1` y la tarea de texto, y el modelo emite acciones de 6 dimensiones a partir de las dos camaras.
- Reproduccion de un pipeline de imitation learning: sirve como referencia de fine-tuning de π₀ con LeRobot 0.6.2, incluyendo hiperparametros concretos (20.000 pasos, batch 4, lr 2,5e-05) que otros equipos pueden replicar con sus propios datasets.
- Validacion de hardware de bajo coste: al estar entrenado para `so_follower` con camaras OpenCV a 640x480 y 30 FPS, permite evaluar la viabilidad de brazos SO-101 en tareas de manipulacion simples antes de invertir en plataformas mayores.
- Prototipado de estaciones de pick-and-place en laboratorio: el modelo puede desplegarse en una celda con dos camaras y un SO-101 para probar la tarea de deposito en caja y medir tasas de exito propias.
- Base para fine-tuning adicional: aunque el autor no lo documenta, el checkpoint puede emplearse como punto de partida en LeRobot para tareas relacionadas, sustituyendo el dataset y manteniendo el tipo de politica.
- Docencia y demostraciones de VLA: por su tamano (4.030 millones de parametros, 8,9 GB) y licencia Apache 2.0, es util para ilustrar el flujo completo de grabacion de datos, entrenamiento y rollout en robotica.
- Integracion en scripts de evaluacion automatizada: el comando `lerobot-rollout` con `--duration` permite ejecuciones acotadas y reproducibles para comparar checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la nota explicita de que no se han proporcionado resultados para esta politica, y no hay tasas de exito, latencias ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el repositorio pesa 8,9 GB en safetensors, por lo que la carga en precision original requiere al menos esa cantidad de memoria, mas overhead de activaciones y buffers de imagenes 480x640.
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU; el comando de entrenamiento usa `--policy.device=cuda` sin mas detalle.
- Cabeza en GPU de consumo: no confirmado. No hay datos publicados sobre ejecucion en RTX 4090, RTX 3090 u otras GPU consumer.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS en la captura de datos, pero no se publica la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SathyarajMedipalli/so101_pi0_object_pnp_v1` | 4.028.019.472 | Estado 6D + 2 imagenes 480x640 | Pick-and-place en SO-101 | Apache 2.0 | Hugging Face, 27 descargas |
| `lerobot/pi0_base` | no disponible en la informacion | no disponible | Politica VLA generalista (base) | no disponible en la informacion | Hugging Face (modelo base citado) |
| π₀ de Physical Intelligence (OpenPI) | no disponible en la informacion | no disponible | Politica VLA generalista | no disponible en la informacion | Repositorio OpenPI citado por el autor |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento de los modelos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado para una unica tarea ("Pickup object and place in the box") y un unico tipo de robot (`so_follower`); no se espera generalizacion a otras tareas u objetos sin reentrenamiento.
- Dataset muy pequeno: 50 episodios y 30.109 frames, lo que limita la robustez ante variaciones de posicion, iluminacion, distractores o cambios de camara.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que el rendimiento real en produccion es desconocido.
- Dependencia estricta de la configuracion de sensores: las claves de camara deben coincidir con `observation.images.gripper_camera` y `observation.images.overview_camera`, y las resoluciones con 480x640.
- Riesgo de sobreajuste al entorno de grabacion; no se documentan tecnicas de aumento de datos ni regularizacion.
- Idiomas soportados no documentados; el condicionamiento linguistico se limita a la cadena de tarea usada en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar ademas las condiciones del modelo base `lerobot/pi0_base` y del π₀ original antes de un despliegue comercial.
- No hay informacion sobre sesgos, alucinacion (en el sentido de acciones no validas) ni seguridad fisica del robot; en robotica real es imprescindible implementar paradas de emergencia y limites de par.
- Fecha de creacion del repositorio indicada como 2026-10-26, posterior a la actual; conviene verificar la vigencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SathyarajMedipalli/so101_pi0_object_pnp_v1
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SathyarajMedipalli/object_pnp_5p_50ep_20261022_011835
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SathyarajMedipalli/object_pnp_5p_50ep_20261022_011835
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
