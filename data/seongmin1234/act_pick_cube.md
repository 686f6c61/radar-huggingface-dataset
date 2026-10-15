# SEONGMIN1234/act_pick_cube

## Resumen

`SEONGMIN1234/act_pick_cube` es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. No es un modelo de lenguaje: es un controlador visomotor entrenado con teleoperacion para ejecutar una tarea concreta de manipulacion, en este caso "Grab the black cube" (agarrar el cubo negro), sobre un brazo SO-101 en configuracion `so_follower` con una camara cenital (`overhead`).

El modelo tiene 51.668.614 parametros reales (segun los pesos en safetensors) y ocupa 0,2 GB en el repositorio. Consume dos entradas: el estado del robot (`observation.state`, vector de 6 dimensiones, las articulaciones del brazo) y una imagen RGB de 3x480x640 procedente de la camara cenital. Produce como salida un vector de accion de 6 dimensiones. Fue entrenado con 50 episodios (8055 fotogramas a 15 FPS) del dataset `SEONGMIN1234/so101-pick-cube-50-v2_20261013_221202` y publicado con la libreria LeRobot 0.6.0.

Su relevancia es practica mas que arquitectonica: sirve como ejemplo reproducible y de bajo coste de un pipeline completo de aprendizaje por imitacion (grabacion de datos, entrenamiento y despliegue con `lerobot-rollout`) sobre hardware abierto tipo SO-101. Es un checkpoint de un solo usuario, sin resultados de evaluacion publicados y con cero descargas, por lo que debe tratarse como una politica experimental y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones (unica arquitectura confirmada por la model card) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: politica condicionada por observacion, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se fija con la cadena "Grab the black cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Especificaciones adicionales aportadas por la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `overhead` (1 camara, 480x640, RGB) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.overhead` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice chunks de acciones: en lugar de emitir una sola accion por paso, el decoder genera una secuencia corta de acciones futuras, lo que reduce el error de acumulacion y estabiliza el control en tareas de contacto como agarrar un objeto. La entrada visual se codifica con un encoder de imagenes y se combina con el estado proprioceptivo de 6 dimensiones del brazo, y el decoder produce el vector de accion de 6 dimensiones que se envia al robot. La model card no detalla el numero de capas, dimensiones ocultas, numero de cabezas ni el tamano del chunk, por lo que esos datos concretos no estan disponibles.

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset `SEONGMIN1234/so101-pick-cube-50-v2_20261013_221202`: 50 episodios, 8055 fotogramas a 15 FPS, una unica tarea ("Grab the black cube"). La configuracion declarada es de 10.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningun otro ajuste posterior al entrenamiento supervisado por imitacion, ni tampoco tecnicas de decodificacion especulativa o attention lineal. No se detalla la composicion del dataset ni si hubo aumento de datos.

## Capacidades

- Control visomotor para manipulacion robotica: genera comandos de 6 grados de libertad para un brazo SO-101 a partir de estado articular e imagen cenital.
- Ejecucion de una unica tarea aprendida: "Grab the black cube" (agarrar el cubo negro), definida en los datos de teleoperacion.
- Prediccion de chunks de acciones, lo que permite movimientos mas suaves y coherentes que un control paso a paso.
- Aprendizaje por imitacion a partir de demostraciones humanas (teleoperacion), sin necesidad de modelado fisico explicito.
- Integracion con el ecosistema LeRobot: ejecucion con `lerobot-rollout`, reentrenamiento con `lerobot-train`, visualizacion de datos en el Space de LeRobot.
- Capacidad de reentrenamiento con datos propios: la politica puede volver a entrenarse sobre otros datasets para otras tareas, aunque el checkpoint publicado esta especializado en la tarea indicada.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir un experimento completo (grabacion con teleoperacion, entrenamiento con ACT y despliegue con `lerobot-rollout`) sobre un SO-101 y una camara cenital, con una receta de 50 episodios y 8055 fotogramas que cabe en un portatil.
- Benchmark de referencia para politicas de pick-and-place: usar este checkpoint como linea base de ACT en la tarea "agarrar el cubo negro" y compararlo con politicas propias entrenadas con los mismos datos y la misma configuracion.
- Docencia y formacion en robotica: demostrar de forma tangible como una politica visomotora transforma pixeles y estado articular en acciones reales, sin depender de hardware industrial caro.
- Prototipado de estaciones de pick-and-place de bajo coste: automatizar la recogida de una pieza concreta de posicion aproximadamente conocida en un banco de laboratorio o una celula de ensamblaje educativa.
- Base para fine-tuning en tareas de agarre: reentrenar el modelo con un dataset propio de objetos distintos reutilizando la misma configuracion de ACT y el mismo montaje de camara, aprovechando el encoder visual ya entrenado.
- Validacion de pipelines de datos de robotica: comprobar que el formato LeRobot, las claves de observacion (`observation.state`, `observation.images.overhead`) y las dimensiones de camara son correctas antes de escalar a un dataset mayor.
- Integracion en demostraciones de manipulado autonomo de corta duracion: ejecutar la politica durante 60 segundos con `--strategy.type=base` para verificar el bucle percepcion-accion completo sin grabar episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion vacia con la nota "_No evaluation results have been provided for this policy yet_", de modo que no existe ninguna tasa de exito real medida en robot fisico para esta politica. No se dispone tampoco de resultados de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark estandar, ya que no es un modelo de lenguaje.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en robot real (tarea "Grab the black cube") | no disponible (no reportada por el autor) |
| MMLU / HumanEval / GSM8K | no aplicable (politica de robotica, no modelo de lenguaje) |

## Requisitos de hardware

- VRAM estimada: con 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en FP32 y 104 MB en FP16. La VRAM total necesaria para inferencia, incluyendo activaciones del encoder visual sobre imagenes de 3x480x640 y buffers de inferencia, se estima en menos de 1-2 GB (estimacion propia a partir del tamano de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090. No se requiere A100 ni H100.
- Cabe sin problema en GPU de consumo: si, y tambien puede ejecutarse en CPU, aunque con mayor latencia de inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para reentrenamiento) es el unico procedimiento documentado en la model card. El formato safetensors es compatible con PyTorch, pero no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas de robotica.
- Hardware de robot necesario: brazo SO-101 en configuracion `so_follower`, puerto serie accesible, y una camara cenital que coincida con la clave de observacion `observation.images.overhead` a 640x480.
- Latencia y throughput: no disponibles de forma oficial. El dataset de entrenamiento se grabo a 15 FPS y el ejemplo de ejecucion configura las camaras a 30 FPS, pero no se publica la frecuencia de inferencia real alcanzada ni el tiempo por chunk de acciones.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa fiable. Las alternativas habituales de la misma categoria (politicas de aprendizaje por imitacion para manipulacion) no aparecen medidas con estos datos y configuracion, por lo que cualquier cifra seria inventada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEONGMIN1234/act_pick_cube (este modelo) | ACT, aprendizaje por imitacion | 51.668.614 | no aplica | apache-2.0 | HuggingFace, 0 descargas |
| Otras politicas ACT de LeRobot Hub | ACT, aprendizaje por imitacion | no disponible | no aplica | variable por repositorio | HuggingFace |
| Diffusion Policy y otras politicas visomotoras | no disponible en esta informacion | no disponible | no aplica | no disponible | no disponible |

Datos comparativos de rendimiento (tasa de exito, latencia, robustez ante cambios de posicion o iluminacion): no disponibles para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica ha sido entrenada exclusivamente para la tarea "Grab the black cube" con 50 episodios. Es esperable que falle ante cambios de objeto, color, posicion inicial, iluminacion o presencia de distractores; no se ha medido esa robustez.
- Sin evaluacion publicada: no existe ninguna tasa de exito reportada. No hay evidencia empirica de que la politica funcione correctamente en un robot real, solo la configuracion de entrenamiento.
- Dependencia del montaje exacto: cualquier variacion en la posicion de la camara cenital, la calibracion del brazo SO-101 o la resolucion de imagen (3x480x640) puede degradar o invalidar el comportamiento.
- Riesgo de fallo fisico: al ser un controlador de robot, un fallo de la politica puede provocar colisiones, agarres fallidos o dano al objeto y al actuador. Se recomienda supervisar la ejecucion y limitar pares y velocidades.
- Sesgos de los datos de teleoperacion: al proceder de un unico operador y 50 episodios, la politica hereda sus sesgos de trayectoria, velocidad y estrategia de agarre. No se documenta diversidad de demostradores.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni reportes de terceros sobre su funcionamiento.
- Ausencia de capacidades de lenguaje: no entiende instrucciones en lenguaje natural; la tarea esta fijada de antemano. No sirve para aplicaciones conversacionales, generacion de texto, codigo, matematicas ni vision general.
- Idiomas: no disponible. El modelo no procesa texto, por lo que no aplica soporte multilingue.
- Licencia: apache-2.0, que permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte y no se documenta ninguna verificacion de seguridad para uso industrial.
- Trazabilidad de datos: el dataset asociado pertenece al mismo autor y no se detalla su proceso de curacion, filtrado ni consentimiento de los operadores.
- Fechas incoherentes en los metadatos del repositorio (creacion en 2026-10-15 y dataset con marca temporal 20261013): conviene verificar la procedencia si se reutiliza el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SEONGMIN1234/act_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/SEONGMIN1234/so101-pick-cube-50-v2_20261013_221202
- Visualizacion del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=SEONGMIN1234/so101-pick-cube-50-v2_20261013_221202
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
