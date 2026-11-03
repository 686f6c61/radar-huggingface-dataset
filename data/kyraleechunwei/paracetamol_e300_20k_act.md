# KyraLeeChunWei/Paracetamol_e300_20K_ACT

## Resumen

Paracetamol_e300_20K_ACT es una politica de imitacion para robotica basada en Action Chunking with Transformers (ACT), el metodo propuesto en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). Lo desarrolla el usuario KyraLeeChunWei y se ha entrenado y publicado en el Hub mediante LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robots. No es un modelo de lenguaje: su salida son acciones motoras de un brazo robotico, no texto.

El modelo resuelve el problema de control manipulativo fino a partir de datos de teleoperacion. En lugar de predecir un unico paso de accion, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error compuesto y mejora la estabilidad del control en tareas de contacto fisico. Con 51.678.855 parametros y un repo de 0,2 GB, es un modelo compacto que puede ejecutarse en tiempo real en hardware modesto.

Es relevante por su caracter practico: esta entrenado sobre el dataset Paracetamol_e300, presumiblemente una tarea concreta de manipulacion de un envase de paracetamol, y se distribuye con licencia Apache 2.0, lo que permite reutilizarlo y adaptarlo sin restricciones comerciales. Su utilidad esta acotada a la tarea y al setup fisico con el que se recogieron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder para imitacion robotica |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidad linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Dataset de entrenamiento | KyraLeeChunWei/Paracetamol_e300 |
| Tamano del repo | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder disenado para aprendizaje por imitacion. El encoder procesa las observaciones (imagenes de camaras y estado de las articulaciones) y el decoder genera un chunk de acciones futuras de forma conjunta, en lugar de predecir paso a paso. Esta prediccion por chunks mitiga el error acumulado tipico de las politicas autoregresivas de una sola accion y produce trayectorias mas suaves. En la variante original, ACT incorpora tambien las llamadas "position embeddings" de las juntas y un mecanismo de agregacion temporal (temporal ensembling) durante la inferencia para suavizar la transicion entre chunks.

El entrenamiento se realiza por imitacion supervisada sobre episodios de teleoperacion. En este caso concreto, el dataset Paracetamol_e300 contiene las demostraciones usadas para entrenar la politica, aunque la model card no detalla el numero de episodios, la composicion de las camaras ni la configuracion exacta del robot. No se documenta el uso de RLHF, DPO ni fine-tuning por refuerzo; el paradigma es puramente de cloning conductual. El nombre del checkpoint sugiere 20K pasos de entrenamiento (20K_ACT), pero este dato no se confirma en la informacion disponible.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: produce chunks de posiciones articulares a partir de observaciones visuales y de estado.
- Control de brazos roboticos de bajo coste: el metodo ACT se diseno originalmente para hardware asequible como el SO-100/SO-101 de LeRobot.
- Aprendizaje por imitacion a partir de demostraciones de teleoperacion, sin necesidad de recompensas ni de simulacion.
- Ejecucion de tareas de manipulacion fina que requieren contacto, como agarrar, levantar o colocar objetos.
- Integracion con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluacion/inferencia con `lerobot-record`.
- Soporte de inferencia en tiempo real sobre GPU (el flag `--policy.device=cuda` esta documentado en la model card).
- Capacidades linguisticas, de codigo, vision general, tool calling o agentes: no disponibles (el modelo no es un LLM).

## Casos de uso

- Manipulacion de un envase de paracetamol en linea de envasado: el modelo esta entrenado especificamente sobre el dataset Paracetamol_e300, por lo que puede recoger, mover o colocar el envase en el mismo setup fisico y con la misma camara usados en la recogida de datos. Es el caso de uso directo y realista del checkpoint.
- Automatizacion de tareas pick-and-place en laboratorio: reutilizando el pipeline de LeRobot, se puede desplegar en un brazo SO-100/SO-101 para tareas repetitivas de recogida y colocacion de objetos pequenos, con la ventaja de que ACT produce trayectorias suaves por chunks.
- Prototipado rapido de politicas de robotica: sirve como punto de partida para fine-tuning sobre un dataset propio, aprovechando que la licencia Apache 2.0 permite uso comercial y modificacion.
- Evaluacion comparativa de metodos de imitacion: util como baseline ACT frente a otros metodos de LeRobot (Diffusion Policy, TDMPC, VQ-BeT) sobre la misma tarea y dataset.
- Docencia e investigacion en aprendizaje por imitacion: su tamano (51,7 M de parametros, 0,2 GB) y su integracion con LeRobot lo hacen adecuado para experimentos reproducibles en un laboratorio con GPU de consumo.
- Despliegue en entornos con hardware limitado: al ser un modelo pequeno, puede ejecutarse en GPUs consumer e incluso en CPU para inferencia no estricta en tiempo real, aunque no se dispone de datos de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion ni comparaciones con otras politicas sobre el dataset Paracetamol_e300.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51,7 M de parametros en precision FP32 el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM necesaria para los pesos es inferior a 1 GB. La VRAM total dependera del tamano de las imagenes de entrada y de los buffers de inferencia.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100. Para inferencia en tiempo real se recomienda una GPU dedicada, tal como sugiere el flag `--policy.device=cuda` de la documentacion.
- Cabe en GPU consumer: si, con margen amplio. Incluso una GPU integrada o CPU podria ejecutarlo, aunque la latencia en control en bucle cerrado no esta documentada.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia/evaluacion, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e300_20K_ACT | 51,7 M | ACT (imitacion) | no aplica | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy (LeRobot) | no disponible | Politica por difusion | no aplica | Apache 2.0 (LeRobot) | Hugging Face Hub |
| VQ-BeT (LeRobot) | no disponible | Politica discreta con transformers | no aplica | Apache 2.0 (LeRobot) | Hugging Face Hub |
| TDMPC (LeRobot) | no disponible | Model-based RL | no aplica | Apache 2.0 (LeRobot) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas politicas sobre el dataset Paracetamol_e300, por lo que la comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado sobre un unico dataset (Paracetamol_e300) y un unico setup fisico; no generaliza a otras tareas, objetos o configuraciones de camara sin reentrenamiento o fine-tuning.
- Dependencia del hardware: el rendimiento depende de que el robot, las camaras y la iluminacion coincidan con las condiciones de recogida de datos. Cambios en la cinematica o en la calibracion degradan la politica.
- Sin capacidades linguisticas: no procesa ni genera texto; no debe evaluarse con benchmarks de LLM (MMLU, HumanEval, GSM8K) ni usarse para tareas de NLP.
- Riesgo de sobreajuste al dataset: con un dataset pequeno y un nombre que sugiere 20K pasos, es probable que la politica este ajustada a las demostraciones concretas; la model card no reporta tasas de exito ni validacion.
- Sesgos: no documentados. En robotica, los sesgos se manifiestan como preferencias por posiciones o trayectorias presentes en las demostraciones de teleoperacion.
- Alucinacion: no aplica en el sentido de LLM, pero si existe riesgo de acciones fuera de distribucion cuando la observacion se aleja de los datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de licencia y de atribucion.
- Caveat de produccion: no se han publicado metricas de fiabilidad, latencia ni robustez; antes de desplegar en produccion es necesario validar la politica en el entorno real con un numero suficiente de episodios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e300_20K_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e300
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
