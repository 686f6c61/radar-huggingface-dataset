# kiroaiseoul/act_task10_move_to_beaker_shelf_14D_100k_fp16c

## Resumen

El modelo `kiroaiseoul/act_task10_move_to_beaker_shelf_14D_100k_fp16c` es una politica de robotica basada en Action Chunking with Transformers (ACT), un metodo de aprendizaje por imitacion que predice fragmentos de acciones (chunks) en lugar de pasos individuales. Lo publica el usuario `kiroaiseoul` en Hugging Face y se ha entrenado y subido mediante LeRobot, la libreria de aprendizaje por imitacion de Hugging Face. Con 51.687.056 parametros (aproximadamente 51,7 millones) y un repositorio de 0,2 GB, es un modelo pequeno orientado a control visuomotor en tiempo real, no a generacion de texto.

La tarea concreta, segun el identificador del repositorio y el dataset asociado (`kiroaiseoul/task10_move_to_beaker_shelf_14D`), consiste en mover un objeto de tipo vaso de precipitados (beaker) a una estanteria, con un espacio de acciones de 14 dimensiones. El modelo aprende de demostraciones de teleoperacion, por lo que su comportamiento esta fuertemente ligado a la morfologia del robot y al entorno de grabacion del dataset.

Es relevante ahora porque forma parte del ecosistema LeRobot, que ha estandarizado el entrenamiento, la evaluacion y el despliegue de politicas de imitacion con hardware de bajo coste (brazos SO-100/SO-101). No se han publicado resultados de benchmarks ni documentacion adicional sobre hiperparametros, composicion del dataset o numero de episodios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para imitacion (ACT, Action Chunking with Transformers); la implementacion de referencia de LeRobot emplea un backbone convolucional para las observaciones visuales, no confirmado para este checkpoint |
| Parametros totales | 51.687.056 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT opera sobre una ventana fija de observaciones y predice chunks de acciones; el horizonte exacto de este checkpoint no se especifica) |
| Tipos de cuantizacion | no disponible; el sufijo `fp16c` del nombre sugiere pesos en fp16, sin confirmar |
| Idiomas soportados | no aplica / no disponible (politica robotica sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Biblioteca | lerobot |
| Pipeline declarado | robotics |
| Dimension del espacio de acciones | 14 (deducida del identificador `14D`, no confirmada en la model card) |
| Dataset de entrenamiento | kiroaiseoul/task10_move_to_beaker_shelf_14D |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT se describe en el articulo arXiv:2304.13705 como un metodo de aprendizaje por imitacion que combina un autoencoder variacional condicional (CVAE) con un transformer. El componente CVAE modela la variabilidad de las demostraciones humanas y el transformer decodifica un chunk de acciones futuras a partir del estado actual y de las observaciones visuales. Predecir chunks en lugar de acciones individuales reduce el error de acumulacion y mitiga el problema de las pausas o discontinuidades tipicas de la teleoperacion. Durante la inferencia, ACT puede aplicar ensamblado temporal (temporal ensembling) para suavizar la politica.

Este checkpoint concreto se ha entrenado con el flujo de trabajo de LeRobot (`lerobot-train --policy.type=act`) sobre el dataset `kiroaiseoul/task10_move_to_beaker_shelf_14D`. No se dispone de informacion sobre el numero de episodios, la composicion del dataset (camaras, frecuencia de control, variedad de escenas), el numero exacto de tokens o pasos de entrenamiento (el sufijo `100k` sugiere 100.000 pasos, sin confirmar) ni sobre el uso de RLHF, DPO u otras tecnicas de ajuste. La model card publicada es la plantilla generica de LeRobot para politicas ACT y no anade detalles especificos del entrenamiento.

## Capacidades

- Generacion de secuencias de acciones de manipulacion robotica de 14 dimensiones (deducido del identificador, no confirmado).
- Control visuomotor: procesa observaciones visuales y el estado proprioceptivo para producir comandos motores.
- Prediccion de chunks de acciones, lo que permite ejecutar movimientos mas suaves y coherentes que una politica paso a paso.
- Ejecucion de una tarea concreta: mover un vaso de precipitados a una estanteria.
- Inferencia compatible con el flujo de LeRobot (`lerobot-record` con `--policy.path`) y con robots de tipo `so100_follower`.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento explicito, vision-lenguaje ni audio.
- Sin capacidad de generalizacion declarada a tareas distintas de la entrenada.

## Casos de uso

- Automatizacion de laboratorio: el modelo puede repetir la operacion de colocar un vaso de precipitados en una estanteria dentro de una celda robotizada, liberando al personal tecnico de tareas repetitivas de manipulacion de material de vidrio.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia reproducible para comparar variantes de ACT (horizonte de chunk, ensamblado temporal, resolucion de camara) partiendo de un checkpoint ya entrenado.
- Sustitucion parcial de la teleoperacion: en lugar de controlar el brazo manualmente en cada ciclo, el operador puede lanzar la politica y supervisar la ejecucion, interviniendo solo en caso de fallo.
- Recoleccion de datos asistida: el checkpoint puede usarse para inicializar una politica y grabar episodios de correccion, generando datasets de mejora incremental sobre el mismo entorno.
- Prototipado en hardware de bajo coste: al tratarse de un modelo de 51,7 M de parametros, es viable ejecutarlo en un ordenador con GPU de gama media conectado a un brazo SO-100/SO-101, lo que abarata la validacion de flujos de robotica con IA.
- Evaluacion comparativa de politicas en LeRobot: permite contrastar ACT frente a Diffusion Policy u otras politicas del ecosistema sobre una misma tarea y un mismo conjunto de evaluacion (`eval_`).
- Formacion y docencia: util como ejemplo completo de pipeline entrenamiento-inferencia-evaluacion en cursos de robotica y aprendizaje por imitacion, con un coste computacional bajo.
- Ajuste fino (fine-tuning) a variantes de la tarea: recolocar objetos similares en la misma estanteria partiendo de este checkpoint en lugar de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tasas de exito, numero de episodios evaluados ni comparaciones con otras politicas. El articulo de ACT (arXiv:2304.13705) reporta tasas de exito en tareas simuladas y reales, pero esos resultados corresponden a la configuracion original del paper y no son trasladables a este checkpoint sin una evaluacion propia.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 207 MB; en fp16: aproximadamente 103 MB (calculado a partir de los 51.687.056 parametros, no confirmado por el autor).
- VRAM estimada para inferencia: del orden de 1 a 2 GB incluyendo el backbone visual y las activaciones, en funcion de la resolucion de imagen y del tamano de lote; cifra estimada, no publicada.
- Cabe en practicamente cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integrada o CPU para inferencia de baja frecuencia.
- Para control en tiempo real se recomienda una GPU dedicada moderna; en CPU la latencia puede ser incompatible con el bucle de control del robot.
- Alternativas embebidas: NVIDIA Jetson Orin u otras placas con GPU integrada, habituales en montajes de robotica de bajo coste.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), PyTorch nativo y exportacion a ONNX. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El paper de ACT reporta inferencia en tiempo real en GPU de consumo, pero no hay mediciones especificas para este checkpoint.
- Almacenamiento: el repositorio ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Espacio de acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_task10_move_to_beaker_shelf_14D_100k_fp16c | ACT (aprendizaje por imitacion) | 51.687.056 | 14D (segun identificador) | Apache 2.0 | Hugging Face, via LeRobot |
| ACT de referencia en LeRobot (por ejemplo, act_aloha_sim_transfer_cube_human) | ACT | no disponible (la arquitectura es la misma, el total varia con las dimensiones de accion y estado) | no disponible | Apache 2.0 | Hugging Face, via LeRobot |
| Diffusion Policy en LeRobot | Politica de difusion para control | no disponible | no disponible | Apache 2.0 | Hugging Face, via LeRobot |
| SmolVLA / pi0 (politicas vision-lenguaje-accion) | VLA con modelo de lenguaje | no disponible | no disponible | no disponible | Hugging Face, via LeRobot |

La comparacion cuantitativa no es posible con la informacion disponible: no hay benchmarks publicados para este checkpoint y no se dispone de cifras verificadas de las alternativas en la documentacion consultada. A nivel cualitativo, ACT es mas ligero y rapido de entrenar que las politicas de difusion y que los modelos VLA, pero generaliza peor y requiere datos especificos de la tarea y del robot.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea (mover un vaso de precipitados a una estanteria) en un entorno concreto; no se espera generalizacion a otras tareas, objetos o disposiciones.
- Dependencia del hardware: el comportamiento esta ligado a la morfologia del robot y a la calibracion de las camaras usadas durante la grabacion del dataset. Cambiar de brazo, de camara o de iluminacion degrada el rendimiento.
- Error de acumulacion y deriva: en ejecuciones largas, pequenos errores pueden acumularse hasta provocar fallos de agarre o colisiones.
- Alucinacion en el sentido clasico: no aplica, ya que no genera lenguaje. En su lugar, el riesgo es producir acciones fisicamente invalidas o inseguras ante observaciones fuera de distribucion.
- Sin documentacion de sesgos: no se ha publicado analisis de sesgos, de diversidad de datos ni de robustez ante cambios de dominio.
- Ausencia de evaluacion: no hay tasas de exito, numero de episodios de evaluacion ni comparaciones publicadas, por lo que no es posible estimar la fiabilidad en produccion.
- Ambiguedad en los metadatos: el significado exacto de los sufijos `14D`, `100k` y `fp16c` no esta documentado en la model card; se infiere del nombre y del dataset asociado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No incluye garantias ni responsabilidad del autor.
- Seguridad fisica: cualquier despliegue sobre hardware real debe acompanarse de limites de parada de emergencia, limitacion de velocidades y supervision humana, dado que el modelo no incorpora capas de seguridad.
- Los resultados de la busqueda web no aportan informacion relevante sobre este modelo: los enlaces devueltos corresponden a proyectos no relacionados (`Hub.xyz`, `XYZ maps`).
- La fecha de creacion registrada en el Hub (2026-09-16) es posterior a la fecha actual y podria deberse a un error de metadatos o a un repositorio de prueba; conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/act_task10_move_to_beaker_shelf_14D_100k_fp16c
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task10_move_to_beaker_shelf_14D
- Paper de ACT (pagina de Hugging Face): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de busqueda web: sin enlaces relevantes para este modelo.
