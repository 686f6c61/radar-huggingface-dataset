# drashutoshspace/moonbot_act_tf

## Resumen

moonbot_act_tf es una politica robotica basada en ACT (Action Chunking Transformer), publicada por el usuario drashutoshspace dentro del ecosistema LeRobot y entrenada desde cero con un backbone ResNet-18 preentrenado en ImageNet. El modelo resuelve el control de un brazo robotico en la tarea de apilar tres bloques y su rasgo distintivo es que incorpora realimentacion de fuerza y par (force/torque) como parte de su espacio de observacion.

El modelo forma parte de un estudio comparativo de seis entrenamientos que enfrenta pi0, SmolVLA y ACT con y sin realimentacion de fuerza sobre el mismo dataset (batch 16, 20.000 pasos, semilla 1000). Su gemelo sin fuerza/par es moonbot_act_no_tf, y la referencia de pi0 es moonbot_pi0_three_blocks_stack. ACT no recibe la instruccion de tarea en lenguaje natural, por lo que esta variante actua como linea base sin lenguaje sobre las 9 tareas del dataset three_blocks_stack_sep22.

Su relevancia practica esta en que publica checkpoints autocontenidos para el robot (pesos, pre/post-procesadores, contrato rosetta del run, prepare_deploy.py, test_offline.py y DEPLOY.md), lo que permite reproducir el despliegue sin reconstruir el pipeline. En el momento de la consulta el modelo acumula 0 descargas y 0 likes, por lo que no cuenta con validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet-18 preentrenado en ImageNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de accion; no procesa contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (el modelo no recibe instrucciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card indica que cada checkpoint incluye pesos, pero no especifica el formato) |
| Espacio de observacion de estado | 21 dimensiones: joint_read (8) + tip_pos (7) + F_ee force/torque (6) |
| Entrada visual | 3 camaras |
| Espacio de accion | 8 dimensiones |
| Tarea / dataset | three_blocks_stack_sep22 (9 tareas) |
| Libreria | LeRobot |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT es un transformer de chunking de acciones: un encoder visual basado en ResNet-18 extrae caracteristicas de las 3 camaras, y un transformer encoder-decoder genera un chunk de acciones de 8 dimensiones condicionado por el estado propioceptivo de 21 dimensiones (lecturas articulares, posicion de la punta y fuerza/par en el efector final). En esta variante el backbone se ha entrenado desde cero sobre la tarea objetivo, sin partir de pesos preentrenados de politica y sin entrada de lenguaje, a diferencia de los enfoques VLA como pi0 o SmolVLA, que si consumen la instruccion de tarea.

El entrenamiento se realizo con el preset propio de LeRobot para el algoritmo, batch size 16, 20.000 pasos y semilla 1000 (la habitual por defecto). No se utilizo split de validacion, igual que en los runs de pi0. La model card no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en principio a un modelo de accion, pero no se confirman ni descartan). Los checkpoints publicados son checkpoint-005000, -010000, -015000 y -020000; el checkpoint final incluye ademas training_state/, y los checkpoints completos con estado del optimizador estan en el OneDrive del equipo.

## Capacidades

- Generacion de trayectorias de accion en 8 dimensiones mediante chunking de acciones, apta para control continuo de un brazo robotico.
- Percepcion visual multi-camara: procesa simultaneamente 3 flujos de imagen a traves del backbone ResNet-18.
- Fusion de estado propioceptivo de 21 dimensiones: lecturas articulares (8), posicion de la punta (7) y fuerza/par en el efector final (6).
- Control guiado por fuerza: la inclusion de F_ee permite reaccionar a contactos, algo critico en tareas de insercion o apilado.
- Ejecucion de las 9 tareas del dataset three_blocks_stack_sep22.
- Soporte de tool calling / function calling: no, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso basado en lenguaje: no.
- Capacidades multilingues: no aplica; el modelo no procesa texto.
- Capacidades especiales (thinking mode, vision-language, audio): no disponibles; se trata de una politica visuomotora, no de un modelo generativo multimodal.

## Casos de uso

- Apilado de bloques en laboratorio: es la tarea nativa del modelo (three_blocks_stack), por lo que se puede ejecutar directamente el checkpoint final sobre el robot MoonBot con el contrato de despliegue documentado.
- Automatizacion industrial de pick-and-place: el modelo combina 3 camaras y estado de 21 dimensiones para colocar piezas en posiciones repetibles, con la ventaja de que la realimentacion de fuerza detecta contactos inesperados.
- Ensamblaje con insercion de precision: la senal F_ee (6 dimensiones de fuerza/par) permite corregir la trayectoria cuando la pieza roza o se atasca, algo que un modelo puramente visual no puede detectar.
- Linea base en investigacion de aprendizaje por imitacion: al no recibir lenguaje, sirve como referencia inferior (baseline) contra la que medir la ganancia real de los enfoques VLA como pi0 o SmolVLA en el mismo dataset.
- Ablacion controlada con y sin fuerza: comparar este modelo con moonbot_act_no_tf aisla el efecto de la realimentacion de fuerza/par, ya que comparten dataset, batch, pasos y semilla.
- Despliegue en robot fisico con LeRobot: cada checkpoint es autocontenido e incluye prepare_deploy.py, test_offline.py y DEPLOY.md, lo que permite validar en modo offline antes de ejecutar sobre hardware.
- Recoleccion de datos asistida: al tener checkpoints intermedios (5k, 10k, 15k, 20k) se puede usar una politica parcialmente entrenada como asistencia de teleoperacion para ampliar el dataset.
- Reproduccion de experimentos comparativos: la semilla 1000 y la configuracion fija permiten replicar el run y contrastar curvas de entrenamiento en Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente enlaza las curvas de entrenamiento en Weights & Biases y no incluye tasas de exito, MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras. Al tratarse de ACT con backbone ResNet-18 (no es un modelo de lenguaje de gran tamano), cabe esperar un consumo bajo para una GPU de gama media, pero es una apreciacion orientativa y no un dato confirmado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del backbone y la ausencia de un modulo de lenguaje grande, es plausible que funcione en GPU de consumo, pero no hay verificacion publicada.
- Opciones de despliegue: LeRobot. El repositorio incluye prepare_deploy.py, test_offline.py, DEPLOY.md y el contrato rosetta del run. vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Requisitos de robot: 3 camaras, estado de 21 dimensiones (joint_read 8 + tip_pos 7 + F_ee 6) y efector con capacidad de medir fuerza/par; sin ese hardware el modelo no es utilizable.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada de lenguaje | Realimentacion de fuerza/par | Parametros | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| moonbot_act_tf | ACT (ResNet-18) | No | Si | no disponible | three_blocks_stack_sep22 | Apache 2.0 | HuggingFace, 0 descargas |
| moonbot_act_no_tf | ACT (ResNet-18) | No | No | no disponible | three_blocks_stack_sep22 | no disponible | HuggingFace |
| moonbot_pi0_three_blocks_stack | pi0 (VLA) | Si | no disponible | no disponible | three_blocks_stack_sep22 | no disponible | HuggingFace |
| SmolVLA | VLA | Si | no disponible | no disponible | three_blocks_stack_sep22 | no disponible | citado en la model card |

Los cuatro modelos pertenecen al mismo estudio comparativo, comparten dataset y configuracion de entrenamiento (batch 16, 20.000 pasos, semilla 1000), lo que hace que las diferencias observables se puedan atribuir a la arquitectura y a la presencia o ausencia de fuerza/par. No se dispone de cifras de rendimiento para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay terceros que hayan reproducido los resultados.
- Sin split de validacion en el entrenamiento, por lo que no existe una medida interna de generalizacion y el riesgo de sobreajuste al dataset no esta cuantificado.
- Ambito muy estrecho: un unico dataset (three_blocks_stack_sep22) con 9 tareas de apilado de bloques; no hay evidencia de transferencia a otras tareas, robots u objetos.
- Dependencia estricta del contrato de despliegue: 21 dimensiones de estado, 3 camaras y accion de 8 dimensiones. Cualquier cambio en el numero de camaras, el orden de las articulaciones o la ausencia de sensor de fuerza/par invalida el modelo.
- No acepta instrucciones en lenguaje natural, por lo que no se puede reutilizar como agente general ni integrar en pipelines de razonamiento basados en texto.
- No es un modelo de lenguaje: no soporta tool calling, function calling, RAG ni razonamiento multi-paso.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe el riesgo equivalente de generar trayectorias fisicamente invalidas o inseguras ante observaciones fuera de distribucion.
- Idiomas soportados: no aplica; no hay procesamiento de lenguaje.
- Licencia Apache 2.0: permite uso comercial, redistribucion y modificacion siempre que se conserve el aviso de copyright y la licencia, y se documenten los cambios. No hay clausulas de uso restringido conocidas.
- La model card esta fechada el 27 de septiembre de 2026, una fecha atipica que dificulta verificar la procedencia y el historial del modelo.
- Los checkpoints incluyen el tokenizer de PaliGemma aunque ACT no consume lenguaje; es un residuo previsible del pipeline de LeRobot, pero conviene no interpretarlo como una capacidad VLA real.
- No se documentan sesgos, composicion demografica del dataset ni condiciones de seguridad fisica para el despliegue en un robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drashutoshspace/moonbot_act_tf
- Dataset three_blocks_stack_sep22: https://huggingface.co/datasets/gdiazsrl/three_blocks_stack_sep22
- Run de pi0 de referencia: https://huggingface.co/drashutoshspace/moonbot_pi0_three_blocks_stack
- Modelo gemelo sin fuerza/par: https://huggingface.co/drashutoshspace/moonbot_act_no_tf
- Curvas de entrenamiento en Weights & Biases: https://wandb.ai/drmishra-space/lerobot/runs/uw4alfzk

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; todos los resultados obtenidos correspondian a la pagina de producto de Google Gemini y no guardan relacion con moonbot_act_tf.
