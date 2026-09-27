# Chaenn/smolvla_policy_so101_multitask_newsim_pick_place_stack_raw

## Resumen

Este repositorio contiene una politica robotica de tipo vision-language-action (VLA) denominada SmolVLA, publicada por el usuario Chaenn y entrenada con la libreria LeRobot de Hugging Face. No es un modelo de lenguaje generativo: es una politica de imitacion que consume observaciones multimodales (estado articular de 6 dimensiones e imagenes de camara) y produce directamente un vector de accion de 6 dimensiones para un brazo robotico SO-101 (perfil `so_follower`). El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha afinado sobre el dataset `Chaenn/so101_multitask_newsim_pick_place_stack_raw`, con 3.910 episodios y 2.868.829 fotogramas a 30 FPS.

El modelo tiene 450.046.176 parametros (aproximadamente 450 M, confirmados en el archivo de pesos safetensors) y ocupa 0,9 GB en el repositorio, lo que lo situa en la categoria de modelos desplegables en hardware de consumo. Cubre dos tareas de manipulacion: colocar cada uno de los cinco cubos dentro de un limite negro y apilar los cinco cubos formando una torre dentro de ese mismo limite. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion.

Su relevancia actual reside en que demuestra el flujo completo de LeRobot para el ajuste fino de politicas VLA compactas sobre robots de bajo coste, con soporte nativo de multiples camaras y de instrucciones en lenguaje natural para seleccionar la tarea. La model card no incluye resultados de evaluacion, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigacion mas que un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone multimodal mas cabeza de acciones, segun el metodo SmolVLA (arXiv:2506.01844). Detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es una ventana de contexto de texto. La politica consume un conjunto fijo de observaciones por paso (estado + imagenes) |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible. Las instrucciones de tarea del dataset estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras declaradas | `side`, `wrist` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entradas visuales | `observation.images.camera1` `(3, 256, 256)`, `observation.images.camera2` `(3, 256, 256)`, `observation.images.camera3` `(3, 256, 256)`, `observation.images.empty_camera_0` `(3, 480, 640)` |
| Salida | `action`, forma `(6,)` |
| Tamano del repositorio | 0,9 GB |
| Version de LeRobot | 0.6.2 |
| Fecha de creacion en el Hub | 27-09-2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, la implementacion de SmolVLA publicada por Hugging Face y descrita en el articulo arXiv:2506.01844. SmolVLA se presenta como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La politica consume simultaneamente el estado articular del robot y varias imagenes de camara, y emite un vector de accion continuo de 6 grados de libertad, el esquema habitual de las politicas de imitacion entrenadas con LeRobot.

El entrenamiento se realizo por imitacion supervisada sobre el dataset `Chaenn/so101_multitask_newsim_pick_place_stack_raw`, compuesto por 3.910 episodios y 2.868.829 fotogramas grabados a 30 FPS, con dos tareas anotadas en lenguaje natural. La configuracion reportada en la model card es: 360.000 pasos de entrenamiento, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, todo ello con LeRobot 0.6.2. No se documenta en la informacion proporcionada si hubo etapas de RLHF, DPO u optimizacion por preferencias, ni la composicion detallada del dataset mas alla de las dos tareas y el numero de episodios.

## Capacidades

- Generacion de acciones de manipulacion continua de 6 grados de libertad a partir de observaciones visuales y de estado, no generacion de texto libre.
- Ejecucion de tareas de pick-and-place: colocar cada uno de los cinco cubos dentro de un limite negro.
- Ejecucion de tareas de apilado: construir una torre con los cinco cubos dentro del limite negro.
- Condicionamiento por instruccion en lenguaje natural: la tarea se selecciona mediante el parametro `--task` en la CLI de rollout, lo que permite conmutar entre las dos habilidades aprendidas sin recargar pesos.
- Fusion de multiples vistas de camara: el modelo fue entrenado con tres entradas visuales de 256x256 y una vista adicional de 480x640, lo que le permite integrar informacion de perspectiva global y de muneca.
- Politica multi-tarea en un unico conjunto de pesos, entrenada sobre tareas heterogeneas del mismo entorno.
- Inferencia en bucle cerrado a frecuencia compatible con control robotico (el dataset se grabo a 30 FPS).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio en la informacion disponible.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o linea de montaje: la politica recoge piezas dispersas y las deposita dentro de una zona delimitada, usando la vista cenital para localizar objetos y la vista de muneca para el ajuste fino de agarre.
- Apilado de piezas para empaquetado compacto: el modelo construye torres de hasta cinco elementos, una habilidad util en alimentacion de maquinas, paletizado ligero o preparacion de kits.
- Banco de pruebas para investigacion en aprendizaje por imitacion: sirve como referencia reproducible de ajuste fino de SmolVLA con LeRobot 0.6.2, con configuracion de entrenamiento documentada (360.000 pasos, AdamW, lr 0,0001).
- Punto de partida para ajuste fino con datos propios: al ser un fine-tune de `lerobot/smolvla_base` bajo Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio y reutilizar el pipeline de despliegue.
- Robotica educativa y docencia: al caber en GPU de consumo y usar el ecosistema LeRobot, permite montar practicas de manipulacion con un SO-101 y camaras USB de bajo coste.
- Recoleccion de datos asistida: ejecutar la politica con `--strategy.type=base` para generar trayectorias de referencia que luego se corrigen por teleoperacion y se incorporan al dataset de entrenamiento.
- Validacion de robustez ante cambios de iluminacion, posicion de objetos o camaras: la politica puede usarse como sujeto de estudio para medir degradacion de rendimiento al variar estas condiciones, dado que la model card no reporta ninguna evaluacion.
- Despliegue en hardware embebido: por su tamano (450 M parametros, 0,9 GB de pesos), es candidato para ejecucion en GPUs integradas tipo Jetson en celdas robotizadas con restricciones de espacio y consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor incluye explicitamente la nota "No evaluation results have been provided for this policy yet" y deja la tabla de evaluacion en blanco. Tampoco se reportan tasas de exito, numero de ensayos, latencia ni throughput de inferencia.

| Metrica | Valor |
|---|---|
| Tasa de exito en pick-and-place | No disponible |
| Tasa de exito en apilado | No disponible |
| Numero de ensayos por tarea | No disponible |
| Latencia de inferencia | No disponible |
| Throughput | No disponible |
| Comparacion con otros modelos | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB, considerando 450 M parametros (aproximadamente 0,9 GB en precision de 16 bits y 1,8 GB en FP32) mas el coste de procesar cuatro flujos de imagen, uno de ellos de 480x640. La cifra exacta no esta documentada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Se han usado historicamente tarjetas tipo NVIDIA RTX 3060, RTX 4070, RTX 4090, y aceleradores de centro de datos como A100 o H100 si se requiere entrenamiento o inferencia por lotes.
- Cabe en GPU de consumo: si, es uno de los objetivos declarados del metodo SmolVLA ("puede desplegarse en hardware de grado consumidor"). Es plausible su ejecucion en Jetson Orin para despliegue embebido, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para control en tiempo real sobre el robot `so_follower`, y entrenamiento mediante `lerobot-train`. La inferencia es en PyTorch sobre CUDA (`--policy.device=cuda`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a politicas de accion.
- Latencia y throughput estimados: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publica ninguna medicion del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chaenn/smolvla_policy_so101_multitask_newsim_pick_place_stack_raw (este) | 450 M | Estado `(6,)` + 4 flujos de imagen; salida `(6,)` | Apache 2.0 | Pesos abiertos en el Hub, 0 descargas | Multi-tarea: pick-and-place y stack |
| Chaenn/smolvla_policy_so101_multitask_newsim_place_stack_raw | No disponible | No disponible | Apache 2.0 | Pesos abiertos en el Hub | Variante del mismo autor para colocar y apilar; sin datos de rendimiento |
| Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908_raw | No disponible | No disponible | Apache 2.0 | Pesos abiertos en el Hub | Variante de prueba del mismo autor |
| Chaenn/smolvla_policy_so101_multitask_pnp_stack_onehot_0917 | 450 M (segun ficha de terceros) | No disponible | Apache 2.0 | Pesos abiertos, 906,7 MB | Variante con codificacion one-hot de tarea |
| lerobot/smolvla_base | No disponible (familia SmolVLA, aprox. 450 M) | Entradas visuales y de estado; salida de accion | Apache 2.0 | Pesos abiertos | Checkpoint base del que derivan todos los anteriores; requiere ajuste fino para una tarea concreta |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad. No se han localizado comparaciones publicadas frente a otras familias de politicas VLA en las fuentes consultadas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no aporta tasas de exito, numero de ensayos ni condiciones de prueba. No hay evidencia publicada de que la politica funcione de forma fiable en un robot real.
- Inconsistencia entre camaras declaradas y comando de ejemplo: la model card indica que el robot usa las camaras `side` y `wrist`, y las entradas de la politica incluyen `camera1`, `camera2`, `camera3` (3x256x256) y `empty_camera_0` (3x480x640), mientras que el ejemplo de `lerobot-rollout` define solo dos camaras. Es necesario verificar y hacer coincidir las claves de observacion antes de desplegar, o la politica no recibira las entradas con las que fue entrenada.
- Especializacion estrecha: solo cubre dos tareas concretas (colocar cinco cubos en una zona delimitada y apilarlos), en un entorno concreto y presumiblemente simulado o de nueva simulacion ("newsim" en el nombre del dataset). No se espera generalizacion a objetos, disposiciones o tareas distintas.
- Datos sin procesar: el nombre del dataset incluye el sufijo "raw", sin que la informacion disponible aclare si se aplicaron normalizaciones estadisticas ni como se gestionaron episodios fallidos.
- Sensibilidad al dominio visual: cambios de iluminacion, fondo, posicion de camara o tipo de objeto pueden degradar el comportamiento; no hay estudios de robustez publicados.
- Sin cuantizaciones publicadas: no se ofrecen variantes GGUF, AWQ, GPTQ ni int8, lo que limita el despliegue en hardware muy restringido.
- Idioma: las instrucciones de tarea del dataset estan en ingles y no se documenta soporte multilingue; introducir instrucciones en otro idioma no es un caso de uso soportado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones fisicas incorrectas o inseguras. Cualquier despliegue real debe incorporar limites de par, paradas de emergencia y supervision.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion; conviene revisar tambien las condiciones de los datos de entrenamiento y del modelo base, ya que la model card no detalla la procedencia de todas las trayectorias.
- Madurez: 0 descargas y 0 likes, sin demo en video ni resultados de robot real publicados por el autor. Debe tratarse como artefacto de investigacion, no como componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chaenn/smolvla_policy_so101_multitask_newsim_pick_place_stack_raw
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_multitask_newsim_pick_place_stack_raw
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_multitask_newsim_pick_place_stack_raw
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Repositorio de referencia sobre SmolVLA y SO-101 multitarea: https://github.com/ktkchh/smolvla-so101-multitask-long-horizon/tree/main/
- Variante del mismo autor (place_stack): https://huggingface.co/Chaenn/smolvla_policy_so101_multitask_newsim_place_stack_raw
- Variante del mismo autor (test_pnp0908_stack0908): https://huggingface.co/Chaenn/smolvla_policy_so101_multitask_test_pnp0908_stack0908_raw
- Ficha de terceros sobre una variante one-hot: https://savrn.com/models/smolvla-policy-so101-multitask-pnp-stack-onehot-0917
- Perfil del autor en un indice de modelos: https://savrn.com/model-publishers/chaenn
