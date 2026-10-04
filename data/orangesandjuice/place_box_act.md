# orangesandjuice/place_box_act

## Resumen

`orangesandjuice/place_box_act` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. La desarrolla el usuario orangesandjuice y se publica en el Hub de HuggingFace dentro del ecosistema LeRobot, la librería de aprendizaje automático para robótica real de HuggingFace.

El modelo resuelve una tarea concreta de manipulación: colocar una caja blanca sobre una toalla amarilla. Se ha entrenado con 50 episodios teleoperados (54.405 fotogramas a 30 FPS) capturados con un robot `so_follower` y una única cámara (`camera1`). La política consume el estado del robot (vector de 6 dimensiones) y una imagen RGB de 240x320, y produce un vector de acción de 6 dimensiones.

Con 51.668.614 parámetros (unos 0,2 GB de pesos en safetensors) y licencia Apache 2.0, es un modelo pequeño y ligero pensado para inferencia en el propio robot. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que genera comandos motores a partir de observaciones visuales y de estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice fragmentos de acciones) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (politica robotica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion basado en transformers que predice "chunks" o fragmentos de acciones de corto horizonte en lugar de un unico paso por inferencia. Segun el articulo referenciado (arXiv:2304.13705), ACT aprende de datos teleoperados y suele alcanzar tasas de exito elevadas en tareas de manipulacion. La model card no detalla la arquitectura interna mas alla de esta descripcion, por lo que no se dispone de informacion adicional sobre capas, atencion o mecanismos concretos.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `orangesandjuice/so101_place_box2_20261003_142905`, compuesto por 50 episodios y 54.405 fotogramas a 30 FPS para la tarea "Place the white box onto the yellow towel.". La configuracion de entrenamiento fue de 50.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. La model card no indica si se aplicaron tecnicas de RLHF, DPO ni ninguna fase de ajuste posterior.

## Capacidades

- Generacion de acciones motoras: produce un vector de accion de 6 dimensiones a partir de la observacion del estado del robot (6 dimensiones) y una imagen RGB de 240x320.
- Aprendizaje por imitacion: ejecuta una tarea de manipulacion aprendida de demostraciones teleoperadas (colocar una caja blanca sobre una toalla amarilla).
- Control visual-motor: integra una camara (`camera1`) como entrada visual junto al estado del robot.
- Prediccion por fragmentos: genera chunks de acciones de corto horizonte en lugar de pasos individuales.
- Ejecucion en bucle: puede ejecutarse de forma continuada durante un tiempo configurable mediante `lerobot-rollout`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Automatizacion de una celda de pick-and-place: el modelo coloca una caja blanca sobre una toalla amarilla en un robot `so_follower`, sustituyendo la teleoperacion manual en tareas repetitivas de clasificacion o posicionamiento.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia para reproducir el flujo completo de LeRobot (grabacion de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) en un caso sencillo.
- Base para ajuste fino en tareas similares: al partir de una politica ACT ya entrenada, se puede reentrenar con nuevos datasets para variantes del mismo movimiento de colocacion.
- Validacion de hardware `so_follower`: permite comprobar la integracion de camaras, calibracion y puertos antes de escalar a tareas mas complejas.
- Investigacion en generalizacion de politicas visuales: al ser un modelo pequeno (51,7 M de parametros) resulta util para experimentar con cambios de posicion de objetos, iluminacion o distractores.
- Demostraciones educativas: sirve para ilustrar en cursos o talleres como se entrena y ejecuta una politica de robotica real con LeRobot desde HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Tampoco se aportan tasas de exito en robot real ni metricas de simulacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51.668.614 parametros y un repositorio de 0,2 GB, los pesos ocupan aproximadamente 200 MB en precision de 32 bits, por lo que la inferencia cabe holgadamente en GPUs de consumo con varios GB de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado el tamano del modelo, cualquier GPU con soporte CUDA suficiente para PyTorch deberia poder ejecutarlo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: si, por tamano de pesos (sin datos oficiales que lo confirmen), aunque no se detallan modelos concretos.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` (con `--strategy.type=base` para no grabar episodios). El entrenamiento se realiza con `lerobot-train`. Requiere `--policy.device=cuda` para GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parametros, contexto, benchmarks, licencia) de modelos comparables en la informacion proporcionada, por lo que no es posible elaborar una tabla comparativa rigurosa. Como referencia cualitativa, dentro del ecosistema LeRobot existen otras familias de politicas de aprendizaje por imitacion (por ejemplo, Diffusion Policy) que abordan tareas de manipulacion similares, pero no se aportan cifras que permitan compararlas aqui.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orangesandjuice/place_box_act | 51.668.614 | no aplica | no disponible | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real de la politica en el robot.
- Tarea muy especifica: entrenada unicamente para "Place the white box onto the yellow towel."; no se garantiza su funcionamiento en otras tareas.
- Dataset limitado: 50 episodios y 54.405 fotogramas son un volumen reducido, lo que puede limitar la generalizacion a nuevas posiciones, iluminaciones o distracciones.
- Configuracion de hardware estricta: depende de un robot `so_follower` y de una camara `camera1` cuyos nombres e indices deben coincidir con las claves de observacion usadas en el entrenamiento.
- Sin capacidades de lenguaje: no procesa texto, no admite tool calling ni razonamiento conversacional.
- Riesgo de sobreajuste al entorno: cambios en la disposicion de objetos, la iluminacion o el fondo pueden degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, sujeto a las condiciones de dicha licencia; conviene verificar las obligaciones de atribucion.
- Sin informacion sobre sesgos, idiomas ni cuantizaciones: estos campos figuran como no disponibles en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orangesandjuice/place_box_act
- Dataset de entrenamiento: https://huggingface.co/datasets/orangesandjuice/so101_place_box2_20261003_142905
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=orangesandjuice/so101_place_box2_20261003_142905
- Articulo ACT (pagina de papers de HuggingFace): https://huggingface.co/papers/2304.13705
- Articulo ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
