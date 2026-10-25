# elijahleo/moloact_1b_3

## Resumen

`elijahleo/moloact_1b_3` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura MolmoAct2, el modelo fundacional de robótica (visión-lenguaje-acción) publicado por el Allen Institute for AI (Ai2). El modelo consume tres flujos de cámara RGB de 480x640 junto con un vector de estado de 6 dimensiones y una instrucción en lenguaje natural, y produce un *chunk* de acciones de 6 dimensiones para un robot de tipo `follow`. Es, por tanto, un modelo de control motor de extremo a extremo, no un LLM de texto: no genera lenguaje ni código, sino comandos de actuación.

El checkpoint lo ha subido un autor individual (`elijahleo`) como fine-tune especializado en una única tarea de manipulación de ferretería industrial (tornillos, tuercas, arandelas y muelles) sobre el dataset `manufacturing_level_3`, con 1.850 episodios y 1.783.295 fotogramas a 30 FPS repartidos en 37 instrucciones distintas de *pick-and-place* y entrega a un operario humano. Su relevancia es la de un ejemplo reproducible de adaptación de un modelo fundacional de robotica a un dominio industrial concreto usando el stack abierto de Hugging Face.

Un detalle importante: pese al sufijo `1b` del identificador, el fichero safetensors declara 5.591.928.368 parámetros (~5,6 B), un orden de magnitud superior a lo que sugiere el nombre. El repositorio ocupa 11,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en MolmoAct2; el detalle interno de capas y atención no se documenta en la información disponible |
| Parametros totales | 5.591.928.368 (~5,6 B), según safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (las 37 instrucciones del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 11,5 GB) |
| Tipo de robot | `follow` |
| Cámaras de entrada | `gripper`, `newtop`, `newside`, cada una `(3, 480, 640)` |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida | `action` de forma `(6,)` |
| Dataset de entrenamiento | `manufacturing_level_3` (1.850 episodios, 1.783.295 fotogramas, 30 FPS, 37 tareas) |
| Librería / ecosistema | LeRobot 0.6.1 |
| Pasos de entrenamiento | 60.000 |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una implementación LeRobot de MolmoAct2, un modelo fundacional de robótica de Ai2 que mapea imágenes de cámara e instrucciones de lenguaje a *chunks* de acciones. La implementación de LeRobot soporta entrenamiento y evaluación del modelo MolmoAct2 "regular". No se detallan en la documentación proporcionada el número de capas, el mecanismo de atención, el codificador visual, el esquema exacto de *action chunking* ni si el backbone procede de un VLM preentrenado; esos datos figuran como no disponibles.

El entrenamiento es de imitación supervisada (behavior cloning) sobre el dataset `manufacturing_level_3`: 60.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.6.1. El dataset contiene demostraciones de teleoperación a 30 FPS en un escenario de ferretería de fabricación, con instrucciones como "Put all galvanized nuts in bucket", "Pick up the longest bolt and give it to the human" o "Put the screws in the left taped area and the bolts in the right taped area". El conjunto de 37 tareas cubre selección por tipo de pieza (tornillo, tuerca, muelle, arandela), por material (zinc, galvanizado, acero recubierto) y por longitud (2 pulgadas, 4 pulgadas), además de entrega a un humano y retirada de piezas de zonas delimitadas con cinta. No se documenta en la información disponible el uso de RLHF, DPO ni de etapas de refinamiento por refuerzo.

## Capacidades

- Control robótico de extremo a extremo: traduce observaciones visuales y instrucciones de lenguaje en comandos de acción de 6 dimensiones.
- Fusión multimodal de tres vistas de cámara simultáneas (gripper, cenital y lateral) con el estado propioceptivo del robot.
- Seguimiento de instrucciones en lenguaje natural para tareas de *pick-and-place*, con 37 comandos vistos durante el entrenamiento.
- Discriminación de objetos por atributos físicos: tipo de pieza, material (zinc, galvanizado, recubierto) y longitud.
- Interacción humano-robot: varias tareas implican recibir o entregar una pieza a una persona.
- Manipulación de contenedores: depositar piezas en cubos o en zonas delimitadas con cinta adhesiva.
- Capacidad de actuación en *chunks* de acciones, adecuada para control a la frecuencia del dataset (30 FPS).
- Soporte de *tool calling* / *function calling*: no disponible (no aplica a un modelo de política robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de software; la secuencialidad se limita a la ejecución de la tarea manipulativa.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión general, audio o generación de texto: no disponibles; el modelo no es un modelo de lenguaje de propósito general.

## Casos de uso

- Clasificación de tornillería en línea de montaje: el modelo puede separar tornillos, tuercas y muelles por material y longitud y depositarlos en el cubo correspondiente, aprovechando las tres vistas de cámara para desambiguar piezas pequeñas y brillantes.
- Entrega de piezas a un operario: las tareas "Pick up the longest bolt and give it to the human" o "Take screw from human and put with other screws" están representadas en el dataset, lo que permite usar el modelo en estaciones colaborativas de suministro pieza a pieza.
- *Kitting* y preparación de pedidos: agrupar conjuntos de ferretería (por ejemplo, todos los tornillos de 2 pulgadas) en un contenedor antes de enviarlos a la línea de ensamblaje.
- Retirada y reordenación de piezas en zonas de trabajo delimitadas: instrucciones como "Remove all hardware from the taped area" permiten usar el modelo para limpiar o reordenar áreas de trabajo entre lotes.
- Clasificación por acabado superficial: distinguir entre piezas galvanizadas, cincadas y recubiertas, una tarea donde el aspecto visual es la única señal disponible.
- Base para *fine-tuning* en dominios propios: al estar integrado en LeRobot y publicado en Apache 2.0, sirve como punto de partida para reentrenar con un dataset propio de manipulación industrial mediante `lerobot-train --policy.type=molmoact2`.
- Generación de datos y evaluación comparativa: al ser una política reproducible con semilla y configuración documentadas, es útil como referencia en experimentos de imitación sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito por tarea, tasas de acierto, ni comparaciones cuantitativas con otras políticas sobre el dataset `manufacturing_level_3`.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 5,59 B parámetros, no medida empíricamente): ~11,2 GB solo para pesos en bf16/fp16, más activaciones y buffers de tres imágenes de 480x640; en la práctica se recomienda reservar 16-24 GB.
- En cuantización de 8 bits: ~5,6 GB de pesos, con un consumo total estimado en 10-12 GB de VRAM.
- En cuantización de 4 bits: ~2,8 GB de pesos, con un consumo total estimado en 6-8 GB de VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) con margen; en 16 GB (RTX 4080, 4060 Ti 16 GB) solo con cuantización o reduciendo resolución/numero de cámaras.
- Opciones de despliegue: el camino documentado es `lerobot-rollout` con `--policy.path=elijahleo/moloact_1b_3`; también `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no encajan con una política robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está grabado a 30 FPS (33,3 ms por fotograma), lo que marca la frecuencia de control a la que debería operar el bucle de inferencia, pero no se han publicado mediciones de latencia real.
- Requisitos adicionales: robot físico de tipo `follow`, tres cámaras configuradas con los mismos nombres de clave (`gripper`, `newtop`, `newside`) a 640x480 y 30 FPS, y calibración previa del hardware.

## Comparativa con modelos similares

Los datos de los modelos comparables no proceden de la información proporcionada en esta ficha y deben verificarse en sus respectivas fuentes antes de usarse en una decisión técnica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `elijahleo/moloact_1b_3` (MolmoAct2 fine-tune) | ~5,6 B | No disponible | Apache 2.0 | Hugging Face, vía LeRobot |
| MolmoAct2 (Ai2, modelo base) | No disponible | No disponible | No disponible en la información proporcionada | Blog de Ai2 y guía LeRobot |
| OpenVLA | ~7 B | No disponible | No disponible en la información proporcionada | Público |
| Pi-zero (π0) | ~3,3 B | No disponible | No disponible en la información proporcionada | Público |
| NVIDIA GR00T N1 | ~2,2 B | No disponible | No disponible en la información proporcionada | Público |

Diferencias cualitativas relevantes: este checkpoint es un fine-tune de dominio muy estrecho (ferretería industrial, un solo tipo de robot), mientras que los modelos base de la comparativa son modelos fundacionales generalistas. En parámetros se sitúa por encima de π0 y GR00T N1 y por debajo de OpenVLA, aunque el tamaño no es indicativo de rendimiento en políticas robóticas sin benchmarks que lo respalden.

## Limitaciones y advertencias

- Sobreajuste al dominio: el modelo se ha entrenado exclusivamente sobre 37 tareas de ferretería en un escenario concreto; se espera un rendimiento pobre fuera de esa distribución de objetos, iluminación y disposición de cámaras.
- Dependencia estricta del hardware: requiere un robot `follow` con estado de 6 dimensiones y tres cámaras con las claves exactas `gripper`, `newtop` y `newside` a 480x640. Cambiar nombres, resolución o número de cámaras invalida la política.
- Ausencia de métricas: no hay benchmarks, tasas de éxito ni curvas de entrenamiento publicadas, por lo que no es posible evaluar la calidad real de la política sin ejecutarla.
- Riesgo de acciones erróneas: en robótica, una "alucinación" se traduce en movimientos físicos incorrectos. Es imprescindible operar con parada de emergencia, límites de fuerza y supervisión humana.
- Seguridad en interacción humana: varias tareas implican entregar o recibir piezas de una persona, lo que exige validación específica de seguridad antes de cualquier despliegue real.
- Idiomas: las instrucciones del dataset están en inglés; no hay evidencia de soporte de instrucciones en castellano.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones del modelo base MolmoAct2 de Ai2.
- Discrepancia de nomenclatura: el identificador dice `1b` pero el modelo tiene ~5,6 B parámetros; no asumir el tamaño por el nombre.
- Madurez: repositorio con 0 descargas y 0 likes, subido por un autor individual el 25 de octubre de 2026, con la model card truncada al final. No hay evidencia de validación por terceros.
- Sesgos: no documentados. El dataset refleja una única configuración física de laboratorio o fábrica, con iluminación, fondo y utillaje específicos.
- La búsqueda web realizada no ha devuelto resultados relacionados con el modelo; toda la información procede de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elijahleo/moloact_1b_3
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_level_3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_level_3
- Blog de Ai2 sobre MolmoAct2: https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
