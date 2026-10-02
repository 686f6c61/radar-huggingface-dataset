# castanetnicolas/ACT_UR5e_BS_128_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS__ID_146322

## Resumen

ACT_UR5e_BS_128_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS__ID_146322 es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario castanetnicolas en Hugging Face y se ha entrenado y exportado con LeRobot, la librería de Hugging Face para aprendizaje automático aplicado a robots reales. El modelo resuelve una tarea concreta de manipulación: "Pick up the can and place it in the matching bin".

La política tiene 51.580.551 parámetros (unos 51,6 millones) y un repositorio de 0,2 GB en formato safetensors. Consume observaciones de dos cámaras de 84x84 píxeles (agentview y robot0_eye_in_hand) más un vector de estado de 9 dimensiones, y produce un vector de acción de 7 dimensiones, típico de un brazo robótico de 6 grados de libertad con pinza. Se entrenó durante 120.000 pasos con un lote de 128 sobre 200 episodios y 23.207 fotogramas grabados a 20 FPS.

Su relevancia es doble: por un lado, es un ejemplo reproducible del flujo de trabajo de LeRobot para entrenar políticas de imitación con datos teleoperados; por otro, ACT es una referencia consolidada en el estado del arte de manipulación robótica por imitación. No obstante, conviene señalar que el autor no ha publicado resultados de evaluación y que existe una discrepancia entre el nombre del repositorio, que menciona UR5e, y la model card, que declara un robot de tipo panda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.580.551 (dato real de safetensors) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: no es un modelo de lenguaje; consume observaciones por paso (vector de estado de 9 dimensiones y dos imagenes de 3x84x84) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable: no es un modelo de lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria LeRobot) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (9,) |
| observation.images.agentview | VISUAL | (3, 84, 84) |
| observation.images.robot0_eye_in_hand | VISUAL | (3, 84, 84) |
| action | ACTION | (7,) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acciones (action chunks) en lugar de una sola acción por paso de inferencia. La arquitectura combina un codificador visual, que procesa las dos vistas de 84x84 píxeles, con un transformer que atiende conjuntamente a las características visuales y al vector de estado del robot, y un decodificador que emite el vector de acción de 7 dimensiones. El nombre del repositorio sugiere un troceo de 10 acciones y un horizonte de ejecución de 10, aunque la model card no confirma explícitamente esos valores, por lo que deben considerarse no verificados.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset castanetnicolas/robomimic_can_ph_image84, derivado del entorno robomimic (tarea "can" con demostraciones de humanos competentes, imágenes de 84x84). El conjunto contiene 200 episodios y 23.207 fotogramas a 20 FPS, con la tarea "Pick up the can and place it in the matching bin". La configuración declarada es de 120.000 pasos de entrenamiento, lote de 128, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni de fases de refinamiento posteriores; en ACT el aprendizaje es puramente supervisado a partir de demostraciones teleoperadas (behavior cloning). Tampoco se detalla la composición exacta de las particiones de entrenamiento y validación ni si se aplicaron aumentos de datos.

## Capacidades

- Generación de comandos de acción motorizados: produce vectores de acción de 7 dimensiones (posición y orientación del efector final más apertura de pinza) a partir de observaciones visuales y de estado.
- Manipulación robótica por imitación: ejecuta la tarea concreta de coger una lata y colocarla en la papelera correspondiente, aprendida de 200 episodios teleoperados.
- Percepción visual de dos cámaras: procesa simultáneamente una vista externa (agentview) y una vista en la muñeca (robot0_eye_in_hand) a 84x84 píxeles.
- Predicción de trozos de acciones: en lugar de una acción por inferencia, ACT emite un fragmento de acciones, lo que mejora la estabilidad temporal y reduce el coste computacional del bucle de control.
- Ejecución en bucle cerrado: el flujo de LeRobot (lerobot-rollout) permite ejecutar la política de forma continua sobre el robot real durante el tiempo que se indique.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No se declaran capacidades de visión general, audio, modo thinking ni generalización a otras tareas distintas de la entrenada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política está entrenada específicamente para coger una lata y depositarla en la papelera correcta, por lo que encaja de forma directa en demostraciones de manipulación con un brazo de 7 dimensiones.
- Base para comparativas de aprendizaje por imitación: sirve como línea base reproducible de ACT en LeRobot frente a otras políticas (por ejemplo, Diffusion Policy) sobre el mismo dataset robomimic.
- Estudio de transferencia entre robots: el nombre del repositorio menciona UR5e mientras la model card declara panda, lo que lo convierte en un caso útil para analizar discrepancias de plataforma y requisitos de adaptación de la interfaz de observaciones.
- Desarrollo de pipelines de evaluación de políticas: al no publicarse resultados de éxito, el modelo se puede usar para montar protocolos de evaluación en robot real (número de intentos, tasa de éxito, condiciones de iluminación y posiciones de objeto).
- Generación de datos sintéticos o de aumentos: las predicciones de trozos de acción pueden emplearse para estudiar cómo varía el comportamiento de ACT con el tamaño de chunk y el horizonte de ejecución.
- Prototipado de control robótico en entornos simulados: el dataset original proviene de robomimic, por lo que es razonable reutilizar la política en entornos simulados equivalentes antes de desplegarla en hardware.
- Docencia y ejemplos de LeRobot: el repositorio incluye comandos de entrenamiento y de rollout que sirven como plantilla para quien quiera entrenar su propia política ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de intentos, éxitos ni tasa de éxito sobre el robot real.

| Referencia | Estado |
|---|---|
| Tasa de exito en robot real | No disponible |
| Numero de intentos / exitos | No disponible |
| Benchmarks de simulacion (robomimic) | No disponible |
| Metricas de inferencia (latencia, FPS efectivos) | No disponible |

## Requisitos de hardware

- Tamano de pesos: 51,58 millones de parametros. En FP32 los pesos ocupan aproximadamente 207 MB; en FP16, alrededor de 103 MB. El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: del orden de cientos de MB incluyendo activaciones a 84x84 con lote pequeno; el modelo cabe holgadamente en cualquier GPU con soporte CUDA. Cifras orientativas, no medidas publicadas.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100). Al ser una politica de vision de 84x84 píxeles, no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: si, cabe sin problema en GPUs de consumo e incluso en plataformas embebidas tipo Jetson, siempre que el stack de PyTorch y LeRobot sea compatible.
- Opciones de despliegue: LeRobot (lerobot-rollout, estrategia base) sobre PyTorch, con CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. A modo de contexto, la tarea se grabo a 20 FPS, lo que implica que el bucle de control deberia resolverse en unos 50 ms por paso; el tamano del modelo hace plausible ese regimen en GPU, pero no hay mediciones publicadas.
- Requisitos adicionales: robot compatible con LeRobot (la model card declara tipo panda), dos camaras (agentview y robot0_eye_in_hand) y la tarea especificada en el comando de rollout.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ACT (este modelo) | Action chunking con transformer, imitation learning | 51,58 M | No aplicable (politica) | Sin resultados publicados | Apache 2.0 | Hugging Face, libreria LeRobot |
| Diffusion Policy | Generacion de acciones por difusion, imitation learning | No disponible | No aplicable (politica) | No disponible | No disponible | Implementada en LeRobot y repositorios academicos |
| VQ-BeT | Discretizacion de acciones y prediccion autoregresiva, imitation learning | No disponible | No aplicable (politica) | No disponible | No disponible | Implementada en LeRobot |

Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada; la comparativa se limita, por tanto, al enfoque metodologico y a la licencia conocida de este modelo.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real de la politica sobre el robot fisico.
- Discrepancia de plataforma: el nombre del repositorio menciona UR5e, mientras la model card declara robot de tipo panda. La interfaz de acciones (7 dimensiones) y de estado (9 dimensiones) esta definida, pero la plataforma objetivo debe confirmarse antes de desplegar.
- Especificidad de tarea: la politica esta entrenada unicamente para "recoger la lata y colocarla en la papelera correspondiente"; no generaliza a otras tareas ni objetos fuera de la distribucion de entrenamiento.
- Dependencia de la camara: las observaciones esperadas son dos vistas de 3x84x84 con nombres concretos (agentview y robot0_eye_in_hand). Cualquier cambio de encuadre, iluminacion o calibracion puede degradar el comportamiento.
- Sensibilidad a la distribucion de demostraciones: al tratarse de behavior cloning, los errores tienden a acumularse fuera de las trayectorias vistas; los cambios de posicion de objeto, distractores o condiciones de iluminacion no estan cubiertos por ninguna evaluacion publicada.
- Riesgo de sobreajuste al dataset: 200 episodios y 23.207 fotogramas es un volumen limitado, y no se documenta validacion ni aumentos de datos.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia; conviene revisar tambien las condiciones del dataset de origen y de las dependencias (LeRobot, robomimic).
- Caveat de trazabilidad: no se especifican el hash de los pesos, la version exacta de las dependencias mas alla de LeRobot 0.6.1 ni la particion de validacion, lo que dificulta la reproducibilidad exacta.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (devuelven paginas de ajedrez), por lo que no aportan datos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_128_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS__ID_146322
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de imitation learning: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
