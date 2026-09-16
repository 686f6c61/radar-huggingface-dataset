# indugadiraju/so101-stressball-to-bowl_20260915_212555_policy

## Resumen

`indugadiraju/so101-stressball-to-bowl_20260915_212555_policy` es una política de robotica basada en ACT (Action Chunking with Transformers) entrenada con LeRobot y publicada en Hugging Face. Se trata de un modelo de aprendizaje por imitacion que, en lugar de predecir una accion por paso, predice un fragmento (chunk) de acciones de corto horizonte, lo que reduce el error de compuesto y estabiliza el control. El modelo tiene 51.668.614 parametros (~51,7 M) y apunta a un brazo robotico de bajo coste del tipo `so_follower` (familia SO-101), con una unica camara cenital (`birdsEye`).

La politica consume dos observaciones: el estado del robot (`observation.state`, vector de 6 dimensiones) y una imagen RGB de 3x480x640 px, y produce una accion de 6 dimensiones. Fue entrenada durante 5000 pasos con batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5 sobre un dataset propio de solo 5 episodios (2250 fotogramas a 30 FPS) para la tarea declarada "Pick up the red cube and place it in the bowl".

Su relevancia es doble: por un lado, es un ejemplo reproducible de entrenamiento de una politica visuomotora end-to-end con hardware asequible; por otro, es una politica muy especializada y con muy pocos datos, por lo que debe tratarse como material de investigacion o como punto de partida para fine-tuning, no como un componente listo para produccion. El repositorio no incluye resultados de evaluacion ni demo en video, y la busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con variable latente CVAE y extractor visual convolucional |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica en el sentido de LLM. Condiciona sobre la observacion actual (estado de 6 dimensiones + imagen 3x480x640) y predice un chunk de acciones. Tamano del chunk: no disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas (GGUF, int8, etc.) |
| Idiomas soportados | No aplica / no disponible. La politica no procesa lenguaje; el texto de la tarea se usa como metadato de la CLI, no como entrada condicionante |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Politica visuomotora (imitation learning), no generativa de texto |
| Hardware objetivo | Brazo `so_follower` (familia SO-101) con una camara `birdsEye` |
| Entradas | `observation.state` (6,), `observation.images.birdsEye` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `indugadiraju/so101-stressball-to-bowl_20260915_212555` (5 episodios, 2250 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 (entrenamiento) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el articulo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un backbone visual convolucional que codifica las imagenes de camara, un transformer encoder-decoder que modela la secuencia de acciones y un cuello de botella CVAE (autoencoder variational condicional) que captura la variabilidad del estilo humano durante la teleoperacion. La clave del metodo es el "action chunking": el decodificador genera un bloque de acciones futuras de una sola pasada, lo que reduce la acumulacion de errores y permite un control mas suave que el de las politicas paso a paso. La prediccion se ejecuta de forma temporalmente agregada (temporal ensembling), de modo que las acciones solapadas entre chunks se promedian.

Los datos de entrenamiento proceden exclusivamente del dataset asociado: 5 episodios, 2250 fotogramas a 30 FPS, recogidos mediante teleoperacion sobre el robot SO-101 con una camara cenital. La configuracion documentada es de 5000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica el numero total de tokens, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; en el caso de ACT, el entrenamiento es puramente de imitacion supervisada (error L1 sobre las acciones objetivo) y no incorpora preferencias humanas.

## Capacidades

- Control visuomotor de un brazo robotico de 6 grados de libertad: la politica emite comandos de accion de 6 dimensiones a partir del estado articular y de una imagen cenital.
- Ejecucion de una tarea concreta de recogida y colocacion: "Pick up the red cube and place it in the bowl", sin condicionamiento por lenguaje.
- Prediccion por chunks de acciones, lo que aporta movimiento mas fluido y robusto que el control paso a paso.
- Aprendizaje por imitacion a partir de teleoperacion: no requiere recompensas ni simulador.
- Integracion directa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso simbolico ni planificacion de tareas de alto nivel.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No dispone de modo "thinking", vision-lenguaje general, audio ni generacion de texto.

## Casos de uso

- Recogida y colocacion automatizada de piezas pequenas en un banco de laboratorio: la politica puede ejecutar el ciclo completo de aproximacion, agarre y deposito sobre un cuenco, siempre que la escena reproduzca las condiciones del dataset de entrenamiento (posicion de camara, iluminacion y objetos).
- Generacion de datos de referencia para comparativas de imitation learning: sirve como linea base ACT sobre el hardware SO-101 frente a otros metodos del ecosistema LeRobot (por ejemplo, Diffusion Policy) manteniendo constante el dataset y la configuracion.
- Punto de partida para fine-tuning en tareas nuevas: al ser un checkpoint ACT de ~51,7 M de parametros, se puede reentrenar con un dataset propio de mas episodios cambiando `--policy.type=act` y el `--dataset.repo_id` en `lerobot-train`.
- Docencia y divulgacion en robotica: el flujo completo (teleoperacion, grabacion, entrenamiento y despliegue) se ejecuta con comandos de LeRobot y hardware de bajo coste, lo que permite montar practicas reproducibles de aprendizaje por imitacion.
- Validacion de hardware SO-101: util para comprobar calibracion, resolucion de camara, latencia del bucle de control y repetibilidad del brazo antes de escalar a tareas mas complejas.
- Automatizacion de tareas repetitivas de pick-and-place en entornos controlados, como clasificacion de objetos ligeros en una celda de laboratorio con posiciones fijas.
- Recoleccion asistida por politica (rollout) para ampliar datasets: los episodios generados por la politica pueden revisarse y anadirse al dataset para iterar el entrenamiento.
- Integracion en pipelines de investigacion en robotica de bajo coste: el checkpoint se carga con PyTorch desde safetensors, por lo que se puede embeber en scripts propios de evaluacion o en entornos de simulacion con el mismo interfaz de observacion y accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia, con la nota "No evaluation results have been provided for this policy yet", de modo que no existe tasa de exito medida en robot real ni numero de ensayos por tarea. Tampoco se han encontrado en la busqueda web resultados comparativos (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo). Los unicos datos de entrenamiento disponibles son los de la tabla de configuracion: 5000 pasos, batch 8, AdamW, learning rate 1e-5, semilla 1000, LeRobot 0.6.2.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no medida por el autor): en fp32, los pesos ocupan aproximadamente 207 MB; en fp16/bf16, unos 103 MB. Sumando activaciones del backbone visual para una imagen de 480x640 y batch 1, el consumo total esperado es inferior a 2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060). No se requiere A100 ni H100; su uso estaria sobredimensionado para 51,7 M de parametros.
- Cabe en GPU de consumo: si. Tambien es viable la inferencia en CPU, ya que el modelo es pequeno y el bucle de control tipico de LeRobot funciona a 30 FPS.
- El entrenamiento se lanzo con `--policy.device=cuda`; una GPU de gama media es suficiente para reproducir los 5000 pasos con batch 8.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=...`, y `lerobot-train` para reentrenar). No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no soportan politicas ACT.
- Latencia y throughput: no medidos en la informacion disponible. El sistema esta pensado para operar a 30 FPS, es decir, un presupuesto de unos 33 ms por fotograma; el coste real de inferencia en GPU deberia quedar por debajo de ese umbral, pero no hay cifras publicadas.
- Hardware robotico necesario: brazo `so_follower`, puerto serie disponible y camara configurada como `birdsEye` a 640x480 y 30 FPS, con nombres de camara que coincidan exactamente con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, SO-101) | Imitation learning con chunking de acciones | 51,7 M | Estado de 6 dim. + imagen 3x480x640; sin contexto de lenguaje | Apache-2.0 | Hugging Face + LeRobot; 0 descargas |
| Diffusion Policy (implementado en LeRobot) | Imitation learning generativo por difusion | No disponible | Estado + imagenes; sin lenguaje | Apache-2.0 (segun el repositorio LeRobot) | Disponible en LeRobot; comparacion cuantitativa no disponible |
| SmolVLA (Hugging Face) | Vision-lenguaje-accion (VLA) | No disponible en la informacion proporcionada (del orden de cientos de millones de parametros segun la documentacion publica del proyecto) | Estado + imagenes + instruccion en lenguaje natural | Apache-2.0 (segun el proyecto) | Disponible en LeRobot; comparacion cuantitativa no disponible |
| Politicas VLA de gran escala (por ejemplo, familias tipo pi0) | Vision-lenguaje-accion | No disponible | Multimodal con lenguaje | No disponible | No verificada en la informacion disponible |

La comparacion de rendimiento (tasa de exito, robustez ante cambios de posicion o iluminacion) no puede realizarse porque este modelo no publica evaluacion. La diferencia estructural principal frente a los modelos VLA es que ACT no recibe instrucciones en lenguaje: solo ejecuta la tarea para la que fue entrenado.

## Limitaciones y advertencias

- Dataset extremadamente pequeno: 5 episodios y 2250 fotogramas para una sola tarea. Es previsible un sobreajuste a las posiciones, iluminacion y apariencia de los objetos del dataset, con muy poca generalizacion a variaciones.
- Sin evaluacion publicada: no existe tasa de exito medida, ni numero de ensayos, ni analisis de fallos. No hay evidencia cuantitativa de que la politica funcione de forma fiable.
- Discrepancia entre el nombre del repositorio y la tarea declarada: el identificador menciona "stressball-to-bowl", mientras que la tarea documentada es "Pick up the red cube and place it in the bowl". Conviene verificar el dataset real antes de reutilizar el checkpoint.
- Dependencia estricta del hardware y la camara: el modelo espera exactamente `observation.state` de 6 dimensiones y una camara llamada `birdsEye` a 640x480; cambiar la camara, su montaje o su resolucion invalidara la politica.
- Sin condicionamiento por lenguaje: no se le puede pedir una tarea distinta mediante texto; el parametro `--task` es metadato y no altera el comportamiento aprendido.
- No es un modelo de lenguaje ni un agente: no soporta tool calling, razonamiento multi-paso ni planificacion. No debe compararse con LLM en terminos de contexto o idiomas.
- Riesgo de alucinacion en el sentido de acciones fuera de distribucion: ante objetos o estados no vistos, la politica puede producir trayectorias plausibles pero incorrectas (agarres al aire, colisiones suaves), sin mecanismo de deteccion de fallo ni de parada de seguridad.
- Sesgos derivados de la teleoperacion: el estilo, la velocidad y las preferencias del operador que grabo los 5 episodios quedan codificados en la politica, incluido el sesgo del backbone visual preentrenado de ACT.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias y la responsabilidad del despliegue en un robot real recae en quien lo integra.
- Seguridad fisica: cualquier uso sobre hardware real exige limites de parada, torques acotados y supervision, ya que una politica de imitacion no incorpora capas de seguridad.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes en la fecha de consulta, sin demo en video ni informes de terceros que validen su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indugadiraju/so101-stressball-to-bowl_20260915_212555_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/indugadiraju/so101-stressball-to-bowl_20260915_212555
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=indugadiraju/so101-stressball-to-bowl_20260915_212555
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con ACT; los enlaces recuperados correspondian a documentacion de planificacion de la cadena de suministro de Dynamics 365 y se han descartado por no ser relevantes.
