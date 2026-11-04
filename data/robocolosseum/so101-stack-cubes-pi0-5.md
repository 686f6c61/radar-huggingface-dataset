# RoboColosseum/so101-stack-cubes-pi0.5

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos. Esta ficha concreta, `RoboColosseum/so101-stack-cubes-pi0.5`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario RoboColosseum sobre el dataset `Jiamo0912/so101-stack-cubes`. El modelo resuelve una tarea de manipulacion robotica concreta: apilar tres cubos (azul sobre rojo, blanco sobre azul) con un robot SO-101.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres flujos de imagen: frontal a 480x640, muneca a 480x640 y una camara vacia a 224x224) y produce acciones de 6 dimensiones. Con 4.143.404.816 parametros, se distribuye en formato safetensors bajo licencia Apache 2.0 y se ejecuta mediante la libreria LeRobot.

Es relevante como ejemplo de fine-tuning de un VLA de proposito general a una tarea especifica de robotica de bajo coste (SO-101), un caso de uso cada vez mas comun en laboratorios que necesitan politicas de imitacion sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), evolucion de π₀ (no se detalla la arquitectura interna en la informacion disponible) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementacion en LeRobot del VLA π₀.₅ de Physical Intelligence, adaptada desde su repositorio OpenPI. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion o fusion vision-lenguaje), por lo que no se puede especificar mas alla de su naturaleza VLA. La entrada combina estado articular de 6 dimensiones con tres flujos visuales y la salida es un vector de accion de 6 dimensiones, lo que corresponde a un control de robot tipo SO-101 (`so_follower`).

El entrenamiento se realizo sobre el dataset `Jiamo0912/so101-stack-cubes`: 100 episodios, 41.359 frames a 30 FPS, con la tarea "Stack the blue cube on the red cube, then stack the white cube on the blue cube". La configuracion fue de 40.000 pasos, batch size 16, optimizador AdamW, learning rate 2.5e-05 y semilla 1000, usando LeRobot 0.6.1. No se especifica en la informacion disponible si hubo RLHF, DPO ni el volumen de datos de preentrenamiento del modelo base.

## Capacidades

- Control de robot manipulador SO-101 mediante imitacion aprendida de demostraciones.
- Percepcion multimodal: procesa estado articular de 6 dimensiones y tres camaras simultaneamente (frontal, muneca y una tercera a 224x224).
- Ejecucion de tareas de apilamiento de objetos descritas en lenguaje natural ("Stack the blue cube on the red cube...").
- Generacion de acciones de 6 dimensiones a partir de observaciones visuales y propioceptivas.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni multilingueismo; el modelo esta especializado en la tarea robotica.

## Casos de uso

- Investigacion en imitacion robotica: servir de referencia para reproducir el flujo completo de fine-tuning de un VLA sobre un robot SO-101 con LeRobot y un dataset propio de 100 episodios.
- Automatizacion de tareas de pick-and-place en laboratorio: el modelo ejecuta la secuencia de apilamiento de tres cubos en un entorno controlado, util para validar pipelines de manipulacion antes de escalar a tareas mas complejas.
- Benchmark de politicas de imitacion: al ser un fine-tuning publico de π₀.₅ sobre una tarea acotada, permite comparar variantes de entrenamiento (pasos, batch, datos) sobre el mismo robot y dataset.
- Formacion de nuevos usuarios de LeRobot: el repositorio incluye comandos `lerobot-rollout` y `lerobot-train` listos para usar, lo que lo convierte en material didactico para aprender el ciclo completo de entrenamiento y despliegue.
- Base para tareas de apilamiento mas generales: el checkpoint puede servir como punto de partida para fine-tunings adicionales con nuevos objetos o posiciones, aprovechando el preentrenamiento de `lerobot/pi05_base`.
- Prototipado de robotica de bajo coste: el SO-101 es una plataforma economica y el modelo permite demostrar manipulacion multimodal sin GPUs de gran escala (dado el tamano de 4.100 millones de parametros, requiere hardware adecuado, pero es mas accesible que VLAs de mayor tamano).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 4.100 millones de parametros en fp16 requiere aproximadamente 8 GB de VRAM solo para pesos, mas el coste de las tres entradas visuales y el estado; en cuantizacion de 8 bits podria reducirse a unos 4-5 GB, pero no se confirma soporte de cuantizacion.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes para inferencia en fp16; una GPU consumer de 12-16 GB podria ser suficiente en fp16 ajustado.
- Cabe en GPU consumer: probablemente si en RTX 4090 y modelos con 16 GB o mas, aunque no esta confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a politicas VLA de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/so101-stack-cubes-pi0.5 | 4.143.404.816 | no disponible | Apilamiento de cubos con SO-101 | apache-2.0 | HuggingFace |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista (base) | no disponible en la informacion | HuggingFace |
| π₀ (Pi0) original de Physical Intelligence | no disponible en la informacion | no disponible | VLA generalista | no disponible en la informacion | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea ("Stack the blue cube on the red cube, then stack the white cube on the blue cube") y un unico tipo de robot (`so_follower`); no se espera generalizacion a otras tareas sin fine-tuning.
- No se han publicado evaluaciones de tasa de exito en robot real, por lo que se desconoce su robustez ante variaciones de posicion, iluminacion o distractores.
- La model card no documenta sesgos, riesgos de alucinacion ni comportamiento fuera de distribucion; al ser un modelo de accion, el riesgo principal es la ejecucion de movimientos incorrectos en el robot.
- La tercera camara (`observation.images.empty_camera_0`) sugiere una entrada no utilizada o placeholder; conviene verificar que el pipeline de despliegue la proporcione con la forma esperada (3, 224, 224).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el modelo π₀.₅ original de Physical Intelligence pueden tener condiciones adicionales que no se detallan en la informacion disponible; conviene revisar sus licencias antes de un uso comercial.
- El repositorio ocupa 97.9 GB, lo que implica requisitos de almacenamiento considerables para su descarga y despliegue.
- No se documentan idiomas soportados; la tarea se define en ingles y no hay evidencia de soporte multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/so101-stack-cubes-pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-stack-cubes
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-stack-cubes
