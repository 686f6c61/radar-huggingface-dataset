# HyeonseokE/smolvla_rq2_extract_cube_ours_1000_10fps

## Resumen

SmolVLA RQ2 Extract Cube es una politica robotica de vision-lenguaje-accion (VLA) publicada por el usuario HyeonseokE en HuggingFace. Se trata de un fine-tune del modelo base lerobot/smolvla_base, entrenado con la libreria LeRobot 0.6.0 sobre un dataset propio de 100 episodios y 31.542 fotogramas grabados a 10 FPS para una unica tarea: extraer un cubo de un bolsillo y colocarlo sobre una marca objetivo. El modelo tiene 450.046.176 parametros y se distribuye en safetensors bajo licencia Apache 2.0.

El interes de esta ficha es acotado y conviene ser honesto: no es un modelo de proposito general, sino un artefacto de investigacion asociado al paper SmolVLA (arXiv:2506.01844), que describe una familia de VLA compactos capaces de ejecutar politicas de manipulacion en hardware de consumo. Este checkpoint concreto forma parte de un estudio comparativo (la nomenclatura "rq2" sugiere una pregunta de investigacion sobre escalado de datos) y el sufijo "1000" coincide con la semilla de entrenamiento configurada.

Su relevancia practica es servir como referencia reproducible de fine-tuning de SmolVLA sobre un robot SO-101, con configuracion de entrenamiento documentada (24.600 pasos, batch 64, AdamW, learning rate 1e-4). No incluye resultados de evaluacion en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, derivada de SmolVLA y heredada de lerobot/smolvla_base; detalle interno de capas no disponible |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en precision original (safetensors) |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de modelo | Politica de imitacion (pipeline: robotics) |
| Robot objetivo | so101_follower |
| Entradas | observation.state (6,), tres camaras visuales de (3, 256, 256) |
| Salidas | action (6,), action.radian_urdf0 (6,) |
| Camaras declaradas en la model card | top, left_wrist |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | HyeonseokE/rq2_extract_cube_ours_100_10fps |

## Arquitectura y entrenamiento

La model card identifica el modelo como SmolVLA, descrito por sus autores como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La informacion proporcionada no detalla la composicion interna (tipo de encoder visual, numero de capas, mecanismo de atencion ni estrategia de generacion de acciones), por lo que esos datos quedan como no disponibles y deben consultarse en el paper arXiv:2506.01844. Lo que si es verificable es la interfaz: consume el estado articular del robot (vector de 6 dimensiones) junto con tres imagenes RGB de 256x256 y produce un vector de accion de 6 dimensiones, ademas de una variante en radianes vinculada a URDF.

El entrenamiento se realizo mediante fine-tuning del modelo base lerobot/smolvla_base con LeRobot 0.6.0. La configuracion documentada es: 24.600 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. El dataset consta de 100 episodios y 31.542 fotogramas a 10 FPS, con una unica tarea en lenguaje natural: "Extract the cube from the pocket and place it on the target marker". No se documenta en la informacion disponible si hubo etapas de RLHF, DPO ni ningun tipo de ajuste por preferencias, algo por otra parte poco habitual en politicas de imitacion robotica.

## Capacidades

- Generacion de acciones de manipulacion robotica: transforma observaciones multimodales (estado articular e imagenes) en comandos de 6 grados de libertad.
- Ejecucion de una tarea concreta de pick-and-place: extraer un cubo de un bolsillo y depositarlo sobre una marca objetivo.
- Percepcion visual multi-camara: procesa tres flujos de imagen de 256x256, lo que permite combinar vista cenital y vistas de muneca.
- Condicionamiento por instruccion en lenguaje natural: acepta un prompt de tarea ("task") en la llamada de rollout.
- Control a 10 FPS en el dominio de entrenamiento, coherente con la frecuencia de captura del dataset.
- Integracion nativa con el ecosistema LeRobot: entrenamiento, rollout y publicacion mediante los comandos lerobot-train y lerobot-rollout.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; son funciones ajenas al proposito de una politica VLA.

## Casos de uso

- Reproduccion de experimentos de investigacion: permite repetir el entrenamiento con la misma semilla (1000), batch y learning rate para validar resultados de un estudio sobre escalado de datos en manipulacion.
- Baseline de comparacion en estudios de data scaling: al existir variantes del mismo autor sobre el dataset de 100 episodios, sirve como punto de referencia para medir el efecto de aumentar el numero de episodios o de demostraciones.
- Evaluacion de fine-tuning de SmolVLA en robot SO-101: utiles para laboratorios que quieran medir cuanto rendimiento se obtiene partiendo de lerobot/smolvla_base con 31.542 fotogramas de datos propios.
- Pruebas de reproducibilidad de politicas VLA: el checkpoint permite verificar si una politica entrenada con una semilla concreta generaliza a ligeros cambios de posicion del cubo o de iluminacion, siempre que se documenten esas condiciones.
- Docencia y formacion en robotica de imitacion: el modelo es lo bastante pequeno (0,9 GB de repositorio, 450 M de parametros) para desplegarse en un laboratorio docente con GPU de gama media y ejecutar el flujo completo de LeRobot.
- Automatizacion de la tarea especifica de extraccion de cubo en un banco de pruebas: si el entorno fisico coincide con el de grabacion (mismo robot, mismas camaras, misma posicion del bolsillo), la politica puede ejecutar la tarea de forma autonoma durante el tiempo configurado en el rollout.
- Validacion de pipelines de inferencia con LeRobot: sirve para comprobar la integracion de camaras OpenCV, puertos serie y el comando lerobot-rollout antes de invertir en entrenamientos mas largos o costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion vacia con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de prueba para esta politica. Tampoco se proporcionan metricas de loss de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no confirmado por el autor): aproximadamente 0,9 GB en bf16/fp16, 1,8 GB en fp32 y 0,45 GB en int8, sin contar activaciones de las tres camaras ni cache de inferencia.
- VRAM realista en despliegue: se estima un consumo total de 2 a 4 GB en bf16 con los tres flujos de imagen a 256x256 activos; cifra orientativa, no publicada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM deberia ser suficiente por el tamano del modelo; una RTX 3060 de 12 GB, RTX 4060, RTX 4070 o RTX 4090 son opciones razonables para laboratorio.
- Cabe en GPU de consumo: si, con alta probabilidad, dado que el modelo no llega a 500 M de parametros y el repositorio completo ocupa 0,9 GB.
- Aceleradores alternativos: Apple Silicon con backend MPS y ejecucion en CPU son tecnicamente viables por tamano, aunque la latencia de control podria degradarse; no hay datos publicados que lo confirmen.
- Opciones de despliegue: LeRobot (lerobot-rollout con --strategy.type=base) sobre PyTorch. No se proporcionan pesos GGUF, ONNX ni integraciones con vLLM, TGI, llama.cpp u Ollama, y estos motores estan orientados a modelos de lenguaje, no a politicas VLA con bucle de control.
- Latencia y throughput: no disponibles. La unica referencia temporal es la frecuencia de entrenamiento, 10 FPS, y el ejemplo de rollout con camaras configuradas a 30 FPS; ninguno de los dos datos equivale a latencia medida de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyeonseokE/smolvla_rq2_extract_cube_ours_1000_10fps | 450.046.176 | No disponible | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| lerobot/smolvla_base (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros VLA comparables (por ejemplo, familias de VLA de 7B como OpenVLA, o alternativas tipo pi0) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada |

La unica comparacion sustentada por los datos disponibles es contra el modelo base del que deriva: comparten arquitectura y licencia declarada, y la diferencia consiste en el fine-tuning sobre 100 episodios de una tarea unica. No se dispone de cifras de rendimiento de ninguno de los dos que permitan establecer una jerarquia objetiva.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no es posible afirmar que la politica funcione de forma fiable ni siquiera en el entorno de entrenamiento.
- Especializacion extrema: el modelo esta entrenado para una sola tarea con una sola instruccion; no generaliza a otras tareas de manipulacion sin reentrenamiento.
- Dependencia del hardware exacto: la politica asume un robot so101_follower y un conjunto concreto de camaras (top, left_wrist segun la model card; camera1, camera2 y camera3 en la tabla de entradas). Cualquier cambio de montaje, calibracion o nombre de camara invalida el despliegue.
- Domain shift: cambios en iluminacion, posicion inicial del cubo, color del objeto, fondo o presencia de distractores pueden degradar el comportamiento, y no se han publicado mediciones de robustez.
- Dataset pequeno: 100 episodios y 31.542 fotogramas a 10 FPS son una base limitada, con el consiguiente riesgo de sobreajuste al entorno de recogida de datos.
- Validacion de la instruccion en ingles: la unica tarea documentada esta redactada en ingles; no hay evidencia de soporte multilingue ni de instrucciones en castellano.
- Riesgo de alucinacion en el sentido generativo: no aplica de forma directa porque el modelo no produce texto libre, pero si existe el riesgo equivalente de ejecutar acciones fisicas incorrectas o inseguras cuando la observacion se sale de la distribucion de entrenamiento.
- Sesgos: no se documentan analisis de sesgo demografico ni de sesgo de entorno; en robotica el sesgo relevante suele ser la sobrerrepresentacion de unas condiciones de laboratorio concretas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el estado del artefacto (sin evaluacion, sin garantias, con 0 descargas) desaconseja su uso en produccion sin una validacion exhaustiva previa.
- Fecha de creacion inusual: el repositorio figura como creado el 15 de septiembre de 2026, dato que conviene verificar en la interfaz de HuggingFace antes de citarlo.
- Resultados de la busqueda web no utilizables: las consultas devolvieron unicamente paginas sobre widgets de cuestionarios sin relacion alguna con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_rq2_extract_cube_ours_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_extract_cube_ours_100_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_extract_cube_ours_100_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
