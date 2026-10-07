# JayRobotics/ACT_demo_04

## Resumen

JayRobotics/ACT_demo_04 es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario JayRobotics y ha sido entrenado y subido al Hub con LeRobot, la libreria de Hugging Face para machine learning aplicado a robots reales. Se trata de un checkpoint de demostracion, no de un modelo de lenguaje: su entrada son imagenes de camara y el estado de las articulaciones, y su salida son comandos de accion de 6 dimensiones.

El modelo ocupa 51.668.614 parametros (aproximadamente 51,7 millones) y el repositorio completo pesa 0,2 GB, por lo que es un checkpoint muy ligero que puede ejecutarse en hardware modesto. Consume dos camaras RGB de 480x640 (frontal y de muneca) y un vector de estado de 6 componentes, y produce un vector de accion de 6 componentes, con control a 30 FPS. Esta especializado en una unica tarea de manipulacion: coger un servomotor y depositarlo en un contenedor de almacenamiento transparente.

Su relevancia es doble. Por un lado, sirve como referencia practica de como se entrena y despliega una politica ACT con LeRobot 0.6.2 sobre un robot de tipo so_follower (familia SO-101). Por otro, al estar liberado bajo licencia Apache-2.0 y no haberse publicado resultados de evaluacion, funciona como ejemplo reproducible del flujo de trabajo de imitacion: 60 episodios teleoperados, 38.405 fotogramas y 100.000 pasos de entrenamiento con batch 8 y learning rate 1e-5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador CVAE y prediccion de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; la politica consume un horizonte de observaciones y emite chunks de acciones. Valor concreto no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robotica vision-lenguaje-accion; no tiene capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Datos adicionales del checkpoint:

| Parametro | Valor |
|---|---|
| Tipo de robot | so_follower |
| Camaras | front, wrist |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | observation.images.front y observation.images.wrist, shape (3, 480, 640) |
| Salida | action, shape (6,) |
| Frecuencia de control | 30 FPS |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper arXiv:2304.13705. Su idea central es predecir chunks de acciones (secuencias cortas de comandos) en lugar de una sola accion por paso de inferencia, lo que reduce el problema de la varianza temporal y del compounding error tipico de las politicas paso a paso. La arquitectura combina un codificador estilo CVAE, que modela la variabilidad humana presente en los datos de teleoperacion, con un transformer encoder-decoder que atiende conjuntamente a las caracteristicas visuales (extraidas normalmente con una columna vertebral convolucional tipo ResNet) y al estado propioceptivo del robot. En este checkpoint concreto la informacion disponible no detalla la configuracion exacta de capas, dimensiones de embedding, numero de cabezas de atencion ni el tamano del chunk de acciones, por lo que esos valores quedan como no disponibles.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset data/SO101_servo_60ep, compuesto por 60 episodios de teleoperacion, 38.405 fotogramas a 30 FPS y la tarea "Pick the servo motor and place it in the transparent storage container." La configuracion registrada es de 100.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni de fases de refinamiento posteriores al aprendizaje por imitacion supervisado, algo coherente con el paradigma de ACT. El autor no ha publicado la curva de perdida ni detalles sobre aumentos de datos, ruido, o estrategias de regularizacion, y tampoco ha subido video de demostracion del modelo en ejecucion real.

## Capacidades

- Manipulacion robometrica de una sola tarea: coger un servomotor y colocarlo en un contenedor transparente, entrenado especificamente para ese objetivo.
- Control visomotor a partir de dos camaras RGB a 480x640 (vista frontal y vista de muneca) mas el vector de estado de 6 grados de libertad.
- Prediccion de chunks de acciones, lo que permite ejecutar secuencias de movimiento coherentes en lugar de comandos aislados.
- Aprendizaje por imitacion de demostraciones humanas teleoperadas, sin recompensas ni entorno simulado.
- Inferencia en bucle cerrado a 30 FPS sobre un robot so_follower.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales ni planificacion simbolica.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision general, audio ni ninguna capacidad multimodal fuera de la percepcion visual necesaria para el control.
- No se documenta generalizacion a otras tareas, otros objetos, otras posiciones de camara u otros robots.

## Casos de uso

- Automatizacion de una celda de montaje concreta: el modelo puede recoger servomotores de una bandeja y depositarlos en un contenedor transparente de forma repetitiva, que es exactamente la tarea para la que se entreno. Es adecuado porque el dominio de entrenamiento y el de despliegue coinciden.
- Referencia para replicar un pipeline de imitacion con LeRobot: sirve como punto de partida para verificar la instalacion, la calibracion de camaras y el comando lerobot-rollout antes de entrenar una politica propia.
- Base para fine-tuning sobre una tarea nueva: al tener solo 51,7 millones de parametros y licencia Apache-2.0, es viable reentrenarlo con un dataset propio de pocas decenas de episodios en una GPU de consumo.
- Validacion de hardware de bajo coste: permite comprobar el comportamiento de un robot so_follower con dos camaras OpenCV a 640x480 y 30 FPS sin invertir en infraestructura de computo.
- Pruebas de robustez y analisis de fallos: al no existir evaluacion publicada, un equipo puede ejecutar el bucle de rollout con distintas posiciones de objeto o iluminacion para medir la tasa de exito real.
- Docencia y formacion en robotica: el checkpoint y su dataset asociado permiten ilustrar el ciclo completo de teleoperacion, grabacion de episodios, entrenamiento y despliegue en un curso o taller.
- Benchmark interno de latencia: con 51,7 millones de parametros es util para medir el coste de inferencia de una politica ACT en distintas GPU y compararlo con metodos alternativos como Diffusion Policy.
- Prototipado de integracion con un orquestador externo: un sistema de nivel superior puede decidir cuando invocar la politica, aunque el razonamiento de alto nivel debe aportarlo otro modelo, ya que ACT no genera texto ni llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "No evaluation results have been provided for this policy yet.", de modo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de evaluacion. Tampoco se proporcionan metricas de perdida de entrenamiento, latencia medida ni throughput.

## Requisitos de hardware

- VRAM estimada: con 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en FP32 o unos 103 MB en FP16, sin contar activaciones ni buffers de inferencia. La VRAM total necesaria es inferior a 1 GB en la practica, aunque el valor exacto no esta documentado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria es suficiente. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema; en estas ultimas el cuello de botella sera la CPU y la captura de camaras, no la GPU.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en graficas integradas con suficiente memoria compartida. El comando de entrenamiento del ejemplo usa --policy.device=cuda, pero el checkpoint es lo bastante pequeno como para plantear inferencia en CPU.
- Opciones de despliegue: LeRobot con el comando lerobot-rollout (estrategia base) es la via documentada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de robotica de este tipo.
- Latencia y throughput estimados: no disponibles. El unico dato temporal es la frecuencia de captura y control de 30 FPS del dataset y del entorno de despliegue.
- Requisitos adicionales: robot so_follower con puerto serie accesible y dos camaras OpenCV configuradas con los nombres front y wrist, que deben coincidir con las claves de observacion usadas en el entrenamiento.

## Comparativa con modelos similares

La comparacion se establece a nivel de metodo o familia, ya que no todos los datos de los modelos alternativos estan publicados con el mismo nivel de detalle. No se dispone de tasas de exito de este checkpoint, por lo que la columna de rendimiento queda como no disponible.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JayRobotics/ACT_demo_04 (ACT) | 51.668.614 | chunk de acciones, valor no disponible | no disponible | apache-2.0 | HuggingFace, libreria lerobot |
| ACT original (paper arXiv:2304.13705) | no disponible (mayor que este checkpoint) | chunk de acciones configurable | resultados publicados en el paper sobre tareas bim manuales | codigo y pesos segun repositorio del autor | repositorio de los autores |
| Diffusion Policy | no disponible | horizonte de difusion de acciones, valor no disponible | resultados publicados en el paper correspondiente | no disponible | implementaciones publicas |
| SmolVLA | aproximadamente 450 millones (dato publico de Hugging Face) | politica vision-lenguaje-accion | no disponible en esta ficha | Apache-2.0 | HuggingFace, LeRobot |
| pi0 (Physical Intelligence) | aproximadamente 3.300 millones (dato publico) | politica vision-lenguaje-accion de proposito general | no disponible en esta ficha | Apache-2.0 en openpi | HuggingFace y repositorio openpi |

Diferencias clave: este checkpoint es entre uno y dos ordenes de magnitud mas pequeno que SmolVLA o pi0, no incorpora un modelo de lenguaje y esta especializado en una unica tarea, mientras que las alternativas VLA pretenden generalizacion entre tareas y siguen instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo se ha entrenado para la tarea "Pick the servo motor and place it in the transparent storage container." No hay evidencia de que funcione con otros objetos, otras tareas u otras instrucciones.
- Sin evaluacion publicada: no existen tasas de exito, numero de ensayos ni condiciones de prueba, por lo que no se puede afirmar nada sobre su fiabilidad real en produccion.
- Riesgo de sobreajuste al entorno de recogida: al proceder de 60 episodios en una sola configuracion de camaras y escena, es probable que sea sensible a cambios de iluminacion, posicion de los objetos, fondo o distracciones. Esto no esta medido, es una advertencia general del aprendizaje por imitacion.
- Dependencia exacta del hardware y de las claves de observacion: los nombres front y wrist, las resoluciones 480x640, el tipo so_follower y la dimension 6 del estado deben respetarse; cualquier variacion invalida el checkpoint.
- Idiomas: no aplica, el modelo no procesa ni genera lenguaje.
- Sesgos: no documentados. Cabe esperar sesgos derivados de las demostraciones de una o varias personas teleoperadoras, como velocidades de movimiento, trayectorias y prensiones particulares, pero el autor no aporta informacion al respecto.
- Alucinacion: el concepto no aplica en el sentido linguistico, pero si existe el riesgo equivalente de ejecutar acciones incorrectas o inseguras cuando la percepcion se aleja de la distribucion de entrenamiento.
- Seguridad fisica: al tratarse de una politica que mueve un robot real, se recomienda espacio de trabajo despejado, limites de par y parada de emergencia accesible durante cualquier prueba.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y se cite correctamente. No se declaran restricciones adicionales por parte del autor.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta, y el identificador del dataset apunta a una ruta poco convencional (data/SO101_servo_60ep), lo que sugiere que puede tratarse de una publicacion de prueba o de un enlace incompleto. Conviene verificar el dataset antes de confiar en el.
- Busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces recuperados no guardaban relacion con robotica ni con aprendizaje automatico, por lo que no aportan informacion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JayRobotics/ACT_demo_04
- Dataset de entrenamiento: https://huggingface.co/datasets/data/SO101_servo_60ep
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=data/SO101_servo_60ep
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 y https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
