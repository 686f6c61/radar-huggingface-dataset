# ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v00

## Resumen

`ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v00` es una politica vision-lenguaje-accion (VLA) compacta entrenada con LeRobot sobre la arquitectura SmolVLA, y afinada a partir del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje generalista: es un controlador robotico de imitacion que mapea observaciones multimodales (estado articular y tres camaras) a un vector de accion de 16 dimensiones. El autor lo publica como checkpoint de investigacion para la tarea concreta de recoger un bote de Pringles con el brazo derecho y entregarlo al brazo izquierdo en un robot OpenArm.

El interes practico esta en su tamano: 450 millones de parametros en formato safetensors, dentro de un repo de 0,9 GB, lo que lo situa en la categoria de politicas desplegables en hardware de consumo. La relevancia actual viene de que ejemplifica el flujo completo de LeRobot 0.6.2: dataset publico, entrenamiento reproducible con hiperparametros documentados y ejecucion via `lerobot-rollout`. La model card, sin embargo, no reporta ninguna evaluacion real, de modo que su rendimiento efectivo esta por verificar.

La ficha describe exclusivamente lo declarado por el autor. Cualquier dato ausente se marca como no disponible; no se extrapolan cifras de benchmarks ni de exito en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) SmolVLA, segun model card y tag `smolvla` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (la tarea esta definida en ingles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv 2506.01844: un VLA compacto que combina un codificador visual y de lenguaje con un cabezal de acciones, disenado para inferencia en hardware de consumo. La politica consume `observation.state` con forma `(6,)` y tres imagenes RGB de `(3, 256, 256)` procedentes de las camaras `body_cam`, `wrist_cam` y `right_wrist_cam`, y emite un tensor `action` de `(16,)`. El tipo de robot declarado es `openarm_umeow`.

El afinamiento se realizo sobre `lerobot/smolvla_base` con 20.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. El dataset de entrenamiento, `ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v00`, contiene 75 episodios y 19.229 frames a 30 FPS, mezclando datos reales y de simulacion (segun el nombre del dataset) para una unica tarea: "Pick up the Pringles can with the right arm, hand it to the left arm". No se documenta en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa; el entrenamiento es de imitacion supervisada propio de LeRobot.

## Capacidades

- Control robotico por imitacion: genera acciones de 16 dimensiones a partir de estado articular e imagenes, sin planificacion simbolica.
- Percepcion multimodal: procesa tres vistas simultaneas (cuerpo, muneca y muneca derecha) a 256x256, lo que aporta informacion espacial redundante para el agarre y la transferencia entre brazos.
- Ejecucion de una tarea especifica: recoger un bote de Pringles con el brazo derecho y entregarlo al izquierdo, condicionada por el prompt de tarea en ingles.
- Integracion con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`, con nombres de camara y claves de observacion predefinidos.
- Despliegue en hardware de consumo: el tamano de 450 M de parametros permite inferencia en GPU de gama media, segun la propia model card.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Manipulacion bimanual de laboratorio: usar la politica como referencia para reproducir la tarea de transferencia de objeto entre brazos en un OpenArm, comparando la ejecucion real con la simulada del dataset de entrenamiento.
- Base para afinamiento en tareas de pick-and-place: partir de este checkpoint y reentrenar con `lerobot-train` sobre un dataset propio de otro objeto o posicion, aprovechando que ya esta especializado en agarre y entrega.
- Evaluacion de pipelines de imitacion: servir como caso de prueba del flujo LeRobot 0.6.2 (grabacion, entrenamiento, rollout) en entornos docentes o de investigacion.
- Prototipado de robotica de bajo coste: desplegar en una estacion con GPU de consumo para validar si 450 M de parametros bastan para una tarea de manipulacion concreta antes de invertir en modelos mayores.
- Estudio de sim-to-real: el dataset combina datos reales y simulados, por lo que el checkpoint permite analizar la transferencia entre dominios en una tarea acotada.
- Demostraciones y divulgacion: ejecutar la tarea de forma repetible con `lerobot-rollout --duration=60` para mostrar el funcionamiento de un VLA compacto en ferias o clases.
- Benchmark interno de politicas: usar el modelo como linea base de 450 M de parametros frente a SmolVLA base u otras politicas en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real ni en simulacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 450 M de parametros en safetensors (fp32/bf16) el peso ocupa aproximadamente 0,9-1,8 GB; a ello hay que sumar el codificador visual y los buffers de tres imagenes de 256x256, por lo que se estima un consumo moderado, aunque el autor no publica cifras.
- GPU recomendadas: no disponible. La model card afirma que SmolVLA "can be deployed on consumer-grade hardware", sin especificar modelos.
- GPU de consumo: segun esa afirmacion generica, seria desplegable en GPU de consumo, pero no se detalla cuales.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path`; entrenamiento con `lerobot-train` y `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (OpenArm Pringles) | 450.046.176 | no disponible | Transferencia bimanual de un bote | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | VLA base para afinamiento | no disponible en la informacion | Hugging Face (modelo base) |
| Otras politicas LeRobot | no disponible | no disponible | Imitacion robotica | no disponible | no disponible |

La unica comparacion documentada es con el modelo base del que deriva; no se dispone de datos de rendimiento de ninguno de los dos para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni pruebas en robot real, por lo que no puede recomendarse para produccion sin validacion propia.
- Especializacion extrema: entrenado para una unica tarea y un unico tipo de robot (`openarm_umeow`); no generaliza a otros objetos, brazos o configuraciones sin reentrenamiento.
- Dependencia de configuracion exacta: los nombres de camara (`body_cam`, `wrist_cam`, `right_wrist_cam`) y las claves de observacion deben coincidir con los del entrenamiento; un montaje distinto invalida la politica.
- Dataset pequeno: 75 episodios y 19.229 frames son una base limitada, con riesgo de sobreajuste a posiciones, iluminacion y fondos concretos.
- Sesgos: no documentados; cabe esperar los propios del dataset de captura (entorno, objetos y condiciones de iluminacion del autor).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas o inseguras fuera de la distribucion de entrenamiento.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Idiomas: la tarea se especifica en ingles; no se declara soporte multilingue del prompt.
- Cero traccion en el Hub (0 descargas, 0 likes): sin comunidad que valide o reporte fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v00
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v00
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v00
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
