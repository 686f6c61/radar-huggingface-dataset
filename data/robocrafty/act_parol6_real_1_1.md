# RoboCrafty/act_parol6_real_1_1

## Resumen

RoboCrafty/act_parol6_real_1_1 es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado por primera vez en el artículo arXiv:2304.13705. El modelo lo desarrolla el usuario RoboCrafty y se distribuye a través del Hub de Hugging Face con la librería LeRobot, el stack de aprendizaje para robótica real de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y dos flujos de vídeo, y emite comandos de acción de 7 dimensiones.

El modelo resuelve una tarea concreta y única: "put the yellow cube on the blue cube" (colocar el cubo amarillo sobre el cubo azul) con un robot de tipo `my_parol6`. Se entrenó sobre 39 episodios y 25.037 fotogramas capturados a 30 FPS, con 30.000 pasos de entrenamiento con optimizador AdamW y tasa de aprendizaje 1e-5. Su relevancia es la de cualquier política ACT reproducible: sirve como referencia funcional de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) sobre hardware de bajo coste.

Con 51.670.663 parámetros totales (aproximadamente 0,2 GB de repositorio) es un modelo pequeño, pensado para inferencia en tiempo real en el bucle de control del robot. El repositorio no incluye resultados de evaluación en robot real ni métricas de éxito, por lo que su rendimiento efectivo debe validarse en el hardware de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para Action Chunking with Transformers (ACT), con codificador visual ResNet; incluye componente generativo tipo CVAE segun el metodo citado (arXiv:2304.13705) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La politica opera sobre un horizonte de acciones (chunk) cuyo tamano no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (precision fp32 por defecto en LeRobot) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje. La condicion de tarea se expresa como cadena de texto ("put the yellow cube on the blue cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice trozos (chunks) cortos de acciones en lugar de un unico paso, lo que reduce el error de composicion acumulado en horizontes largos y aporta estabilidad temporal al control. La implementacion de LeRobot combina un codificador visual (ResNet) que procesa las imagenes de las dos camaras con un transformer encoder-decoder que modela la secuencia de acciones; el metodo original incorpora un componente latente de tipo CVAE que captura la variabilidad de las demostraciones humanas. El modelo consume `observation.state` con forma `(7,)` y dos imagenes `observation.images.cam_1` y `observation.images.cam_2` con forma `(3, 720, 1280)` cada una, y produce `action` con forma `(7,)`, es decir, un vector de 7 grados de libertad por paso de control.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset RoboCrafty/parol6_sim_stack_real_1: 39 episodios, 25.037 fotogramas a 30 FPS y una unica tarea. La configuracion reportada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset (proporcion de datos simulados frente a reales, pese al nombre del repositorio), ni si se aplicaron etapas de ajuste adicionales como RLHF o DPO, que en cualquier caso no son habituales en aprendizaje por imitacion robótico.

## Capacidades

- Control visomotor de imitacion para una tarea especifica: colocar un cubo amarillo sobre un cubo azul.
- Prediccion de chunks de acciones de 7 dimensiones a partir de estado articular (`observation.state`) y dos vistas de camara simultaneas.
- Procesamiento de entrada visual de alta resolucion (720x1280 por camara), con la reduccion interna de resolucion gestionada por la configuracion de la politica en LeRobot.
- Ejecucion en tiempo real en bucle cerrado sobre el robot `my_parol6`, con el comando `lerobot-rollout`.
- Reentrenamiento y ajuste sobre nuevos datasets mediante `lerobot-train` con `--policy.type=act`.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico ni agentes basados en texto.
- No dispone de capacidades multilingues ni de generacion de texto: el campo de tarea es una cadena de condicionamiento, no una capacidad conversacional.
- No se documentan modos especiales (thinking mode, vision-lenguaje, audio) mas alla del codificador visual propio del metodo ACT.

## Casos de uso

- Manipulacion de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de colocar el cubo amarillo sobre el cubo azul a partir de dos camaras, lo que permite validar rapidamente la cadena de captura de datos, entrenamiento y despliegue de LeRobot sin escribir codigo de control manual.
- Banco de pruebas de imitacion (baseline de referencia): al ser una politica ACT de 51,67 M de parametros con configuracion de entrenamiento completamente documentada, sirve como linea base reproducible frente a la que comparar variantes de Diffusion Policy, SmolVLA u otros metodos sobre el mismo dataset.
- Prototipado de robots de bajo coste: el modelo esta asociado a un robot de tipo `my_parol6`, lo que lo hace util en montajes academicos o de aficionado donde se quiere demostrar aprendizaje por imitacion con hardware asequible.
- Recoleccion de datos mediante teleoperacion: el flujo de LeRobot asociado permite grabar nuevos episodios a 30 FPS y reentrenar la politica, de modo que el modelo actua como punto de partida para ampliar el dataset con posiciones de objeto, iluminacion o distractores nuevos.
- Validacion de infraestructura de inferencia en el borde: con 51,67 M de parametros y 0,2 GB de pesos, el modelo se puede desplegar en un PC con GPU modesta integrado en la celda robotizada, sirviendo para medir latencia del bucle de control a 30 Hz.
- Investigacion en generalizacion de politicas visomotoras: al conocerse el numero exacto de episodios (39) y fotogramas (25.037), es un caso de estudio util para analizar el regimen de datos minimo necesario en tareas de manipulacion de un solo objeto.
- Docencia y formacion en robótica con IA: el modelo ilustra de forma completa el ciclo de vida de una politica de imitacion, desde el dataset hasta el rollout, con el comando exacto de ejecucion documentado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion vacia con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de prueba (posiciones de objeto, iluminacion, distractores o robot distinto). Tampoco se aportan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras politicas.

## Requisitos de hardware

Las cifras de VRAM y latencia que se indican a continuacion son estimaciones derivadas del numero de parametros (51,67 M) y del hecho de que los pesos se publican en safetensors; no proceden de mediciones publicadas por el autor.

- VRAM estimada para los pesos: aproximadamente 207 MB en fp32, 103 MB en fp16/bf16 y 52 MB en int8. El grueso del consumo real proviene de las activaciones del codificador visual al procesar dos imagenes de 720x1280.
- VRAM total estimada en inferencia: del orden de 1 a 3 GB, dependiendo de la resolucion a la que la configuracion de la politica redimensione las entradas y del tamano del lote.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPU de gama de entrada con 4 GB o mas. Puede ejecutarse en CPU, aunque con riesgo de no alcanzar el ritmo de control requerido.
- GPU recomendadas para despliegue: cualquier GPU NVIDIA con soporte CUDA de los ultimos anos (RTX 3060/4090 en estaciones de trabajo, A100/H100 si se comparte con otros procesos o se entrena en la misma maquina). No se requiere memoria de datacenter.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (ruta oficial documentada, con `--policy.path=RoboCrafty/act_parol6_real_1_1`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de acciones.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset se grabo a 30 FPS, por lo que el bucle de inferencia deberia sostener al menos 30 Hz para reproducir la dinamica de las demostraciones; el metodo ACT predice chunks de acciones precisamente para amortiguar ese requisito.
- Almacenamiento: 0,2 GB de repositorio, mas el dataset asociado si se va a reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_parol6_real_1_1 | 51,67 M | Estado 7D + 2 camaras 720x1280 | Apache-2.0 | Hugging Face, via LeRobot |
| Otras politicas ACT en el Hub | no disponible | no disponible | habitualmente Apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | no disponible | vision + estado | no disponible | implementaciones publicas |
| SmolVLA (Hugging Face) | no disponible | vision-lenguaje-accion | no disponible | Hugging Face |

No se dispone en la informacion proporcionada de datos verificados de parametros, contexto o rendimiento de las alternativas, y no existen resultados de evaluacion de esta politica que permitan una comparacion cuantitativa. Cualquier comparacion con Diffusion Policy, SmolVLA u otras politicas del ecosistema LeRobot debe hacerse reentrenando sobre el mismo dataset (RoboCrafty/parol6_sim_stack_real_1) y midiendo tasas de exito con el mismo protocolo.

## Limitaciones y advertencias

- Alcance estricto: la politica esta entrenada para una unica tarea ("put the yellow cube on the blue cube") sobre un unico tipo de robot (`my_parol6`). No generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que el rendimiento declarado es desconocido y debe validarse localmente antes de cualquier uso serio.
- Riesgo de sobreajuste al entorno de captura: con solo 39 episodios y 25.037 fotogramas, es esperable una sensibilidad alta a cambios de iluminacion, posicion de los objetos, fondo o disposicion de las camaras.
- Dependencia de la configuracion de camaras: los nombres de camara (`cam_1`, `cam_2`) y las claves de observacion deben coincidir exactamente con los del entrenamiento; un mapeo distinto produce inferencias incorrectas.
- Ambiguedad del dataset: el repositorio se llama `parol6_sim_stack_real_1`, lo que sugiere mezcla de datos simulados y reales, pero la model card no detalla la proporcion ni el procedimiento de mezcla.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-07, fecha posterior a la actual; conviene verificar la vigencia del artefacto.
- Sesgos: no se documentan sesgos especificos, pero toda politica de imitacion hereda los sesgos de las demostraciones humanas (estrategias de agarre, trayectorias y posiciones preferidas).
- Alucinacion: el concepto no aplica en el sentido de los modelos de lenguaje; el riesgo equivalente es la ejecucion de acciones fisicamente invalidas cuando el estado observado queda fuera de la distribucion de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y el archivo de atribucion. La cita solicitada incluye el metodo ACT y LeRobot.
- Advertencia de seguridad fisica: al tratarse de un controlador de robot real, cualquier despliegue debe contar con limites de par, paradas de emergencia y supervision humana, especialmente fuera de las condiciones de entrenamiento.
- Cero traccion en el Hub (0 descargas, 0 likes en el momento de la consulta), lo que reduce la probabilidad de encontrar validaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/act_parol6_real_1_1
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_sim_stack_real_1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_sim_stack_real_1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces recuperados correspondian a anuncios de alquiler de vivienda y no guardan relacion con este repositorio.
