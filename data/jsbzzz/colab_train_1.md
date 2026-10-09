# jsbzzz/colab_train_1

## Resumen

`jsbzzz/colab_train_1` es una politica de imitacion robotica entrenada con la libreria LeRobot de Hugging Face y publicada por el usuario `jsbzzz`. No es un modelo de lenguaje: implementa el metodo ACT (Action Chunking with Transformers), descrito en el articulo arXiv:2304.13705, que en lugar de predecir una sola accion por paso predice fragmentos cortos de acciones (action chunks) a partir de observaciones visuales y de estado proprioceptivo. El modelo cuenta con 51.668.614 parametros y un repositorio de 0,2 GB en formato safetensors.

La politica esta especializada en un unico robot, el `omx_follower`, con una sola camara de muneca (`wrist`) a 480x640 y un espacio de acciones y de estado de 6 dimensiones. Se entreno durante 30.000 pasos con un lote de 32 y el optimizador AdamW sobre el conjunto de datos `IMCON/OMX_LeRobot_20261009_190057`, compuesto por 10 episodios y 4.475 fotogramas grabados a 30 FPS para una unica tarea: "Put the gray eraser on box".

Su relevancia es la de un checkpoint de referencia dentro del ecosistema LeRobot: sirve como ejemplo reproducible de entrenamiento de una politica ACT end-to-end en Google Colab, como base para comparar otras politicas de imitacion y como punto de partida para reentrenar con mas datos. El autor no ha publicado resultados de evaluacion en robot real, no declara licencia y no documenta idiomas, de modo que su uso en produccion exige validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) con VAE condicional, segun el articulo arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no aplica; politica de imitacion con horizonte de observacion fijo no documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de modelo | politica de imitacion robotica (pipeline: robotics) |
| Entradas | `observation.state` (6,); `observation.images.wrist` (3, 480, 640) |
| Salida | `action` (6,) |
| Robot objetivo | `omx_follower` |
| Camaras | 1 (`wrist`) |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.2 |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que aprende de datos de teleoperacion y predice bloques de acciones en lugar de pasos individuales, lo que reduce el error de acumulacion que aparece en politicas paso a paso. La model card indica que la politica consume un vector de estado de 6 dimensiones y una imagen de 480x640 procedente de una camara de muneca, y que produce un vector de accion de 6 dimensiones. En este repositorio concreto no se detalla la configuracion interna de la red (numero de capas, dimensiones de los embeddings, horizonte de chunking ni tipo de codificador visual), por lo que esos datos deben considerarse no disponibles y consultarse en la configuracion del checkpoint si se descarga.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el conjunto `IMCON/OMX_LeRobot_20261009_190057`: 10 episodios, 4.475 fotogramas a 30 FPS, una unica tarea ("Put the gray eraser on box"). La configuracion es de 30.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Con esos valores, el modelo ha visto aproximadamente 960.000 muestras, equivalentes a unas 214 pasadas sobre un dataset de 4.475 fotogramas, lo que apunta a un ajuste intenso sobre muy pocas demostraciones. No se documenta ningun proceso de RLHF ni DPO, algo coherente con un paradigma de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de manipulacion: produce vectores de accion de 6 dimensiones aptos para el robot `omx_follower`.
- Prediccion por fragmentos (action chunking): el metodo ACT emite bloques cortos de acciones, lo que mejora la estabilidad frente a politicas que deciden paso a paso.
- Percepcion visual de una unica camara de muneca a 480x640, en color (3 canales).
- Fusion de estado proprioceptivo (6 dimensiones) con observacion visual.
- Ejecucion de una tarea especifica de pick-and-place: colocar la goma de borrar gris sobre la caja.
- Compatibilidad con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento o ajuste fino.
- Capacidades que no posee: no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni comportamiento de agente, no procesa lenguaje natural como entrada de control, no tiene vision general, ni audio, ni modo de razonamiento explicito.

## Casos de uso

- Automatizacion de pick-and-place con el robot `omx_follower`: la politica esta entrenada exactamente para la tarea "Put the gray eraser on box", de modo que puede desplegarse con `lerobot-rollout` y `--task="Put the gray eraser on box"` para repetirla de forma autonoma sin operador.
- Sustitucion de la teleoperacion en tareas repetitivas: al aprender de demostraciones teleoperadas, permite liberar al operador en ciclos de colocacion de objetos pequenos siempre que la escena se mantenga dentro de la distribucion de entrenamiento.
- Punto de partida para ajuste fino con mas datos: el formato de pesos safetensors y la integracion con `lerobot-train` permiten reentrenar la politica con mas episodios o con una nueva tarea reutilizando la inicializacion.
- Banco de pruebas de la cadena de herramientas LeRobot: sirve para validar la instalacion, la calibracion del robot `omx_follower`, la conexion de la camara de muneca y el comando de rollout de extremo a extremo antes de invertir en datasets mayores.
- Docencia y formacion: con 51,7 M de parametros y 0,2 GB de repositorio, es un ejemplo manejable para explicar un pipeline completo de aprendizaje por imitacion, desde la grabacion con teleoperador hasta la politica desplegada.
- Investigacion sobre generalizacion: al haberse entrenado con solo 10 episodios, resulta un caso de estudio util para medir como afectan a la tasa de exito cambios de posicion del objeto, iluminacion, distractores o una instancia distinta del mismo robot.
- Comparacion de politicas dentro del ecosistema LeRobot: puede usarse como referencia base al evaluar otras arquitecturas de imitacion entrenadas sobre el mismo dataset o sobre variantes ampliadas.
- Recoleccion de datos asistida: desplegado con `--strategy.type=base`, el script no graba episodios, pero con las estrategias de grabacion de LeRobot puede utilizarse para generar datos etiquetados de nuevas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet". No hay tabla de tareas, ensayos y tasas de exito, ni comparaciones con otras politicas. Cualquier cifra de tasa de exito, MMLU, HumanEval o GSM8K seria inaplicable, ya que se trata de una politica de control robotico y no de un modelo de lenguaje.

## Requisitos de hardware

- Pesos en precision de entrenamiento (fp32): aproximadamente 207 MB para 51.668.614 parametros. La model card no especifica la precision de los pesos almacenados.
- VRAM estimada para inferencia: en torno a 1-2 GB contando pesos y activaciones del codificador visual a 480x640; es una estimacion propia calculada a partir del numero de parametros y del tamano de imagen, no una cifra publicada por el autor.
- GPU consumer: si, cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090, etc.). El cuello de botella no sera la memoria sino el tiempo de inferencia por paso para sostener 30 FPS.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para este tamano, aunque utiles si se paraleliza la evaluacion de muchos ensayos.
- CPU: la ejecucion es tecnicamente posible con PyTorch en CPU, pero no hay datos publicados sobre si alcanza los 30 FPS del dataset.
- Opciones de despliegue: `lerobot-rollout` de la libreria LeRobot, con dispositivos `cuda`, `mps` o `cpu`; tambien se puede cargar el checkpoint directamente con PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. La unica referencia temporal es la frecuencia de 30 FPS del dataset de entrenamiento.
- Almacenamiento: 0,2 GB de repositorio, sin necesidad de sharding ni de descarga parcial.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados numericos de otras politicas, ni siquiera del mismo metodo ACT, por lo que no es posible establecer una comparacion cuantitativa fiable de parametros, contexto o tasa de exito frente a alternativas de la misma categoria. Para contextualizarlo, dentro del ecosistema LeRobot conviven otras familias de politicas de imitacion (por ejemplo, las basadas en diffusion policy o en modelos vision-lenguaje-accion), pero no se dispone de datos comparativos publicados en esta ficha.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se entreno para una sola tarea, un solo tipo de robot (`omx_follower`) y una sola camara (`wrist`). Fuera de esa combinacion su comportamiento no esta garantizado.
- Dataset muy reducido: 10 episodios y 4.475 fotogramas, con unas 214 pasadas efectivas sobre los datos. El riesgo de sobreajuste y de fallo ante pequenas variaciones de posicion, iluminacion o apariencia del objeto es alto.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida en robot real, por lo que no se puede afirmar que la politica funcione de forma fiable ni siquiera en la tarea de entrenamiento.
- Licencia no declarada: al no especificarse licencia, el uso comercial y la redistribucion quedan en un limbo legal. Conviene contactar con el autor o buscar una licencia explicita antes de cualquier despliegue en produccion.
- Sesgos heredados de las demostraciones: al ser aprendizaje por imitacion, reproduce las posiciones, trayectorias y condiciones de la persona que teleopero los 10 episodios.
- Error de acumulacion y covariate shift: en ejecuciones largas, pequenos errores pueden sacar al robot de la distribucion de estados vista en entrenamiento. El propio enfoque de action chunking mitiga este problema, pero no lo elimina.
- Sin comprension de lenguaje: la cadena de tarea del comando de despliegue es metadato de la ejecucion; la model card no documenta condicionamiento por lenguaje, de modo que el modelo no cambia de comportamiento segun una instruccion textual.
- Dependencia de la interfaz de observacion: los nombres y las dimensiones de las claves (`observation.state`, `observation.images.wrist`) deben coincidir exactamente con los de entrenamiento; cualquier cambio en la camara o en el vector de estado invalida la politica.
- Prediccion de alucinaciones no aplicable: al no generar texto, el riesgo relevante no es la alucinacion, sino la ejecucion de acciones fisicamente incorrectas sobre hardware real. Se recomienda espacio de trabajo despejado y parada de emergencia disponible.
- Requisito de calibracion: el robot y la camara deben estar calibrados siguiendo la guia de hardware de LeRobot; una calibracion distinta a la del entrenamiento degrada el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsbzzz/colab_train_1
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/IMCON/OMX_LeRobot_20261009_190057
- Visualizacion interactiva del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IMCON/OMX_LeRobot_20261009_190057
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de la politica ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (`lerobot-*`): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados fueron paginas genericas de servicios de Google, sin relacion con la politica.
