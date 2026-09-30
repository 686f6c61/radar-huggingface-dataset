# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_40_Exec_40_TASK_nut_assembly_square_PIXELS_84

## Resumen

ACT_UR5e_BS_32_Act_Chunk_40_Exec_40_TASK_nut_assembly_square_PIXELS_84 es una política de robótica entrenada con Action Chunking with Transformers (ACT), publicada por el usuario castanetnicolas en Hugging Face mediante la librería LeRobot. Resuelve una única tarea de manipulación industrial: "Pick up the square nut and fit it onto the square peg", es decir, coger una tuerca cuadrada y encajarla sobre una espiga cuadrada, sobre un brazo robótico Universal Robots UR5e.

El modelo tiene 51.611.271 parámetros (aproximadamente 51,6 M) y se ha entrenado por imitación a partir de 100 episodios de teleoperación que suman 24.602 fotogramas grabados a 20 FPS. Como entrada consume el estado del robot (vector de 9 dimensiones) y dos cámaras RGB de 84x84 píxeles, y como salida genera un vector de acción de 7 dimensiones. El identificador del repositorio codifica un tamaño de chunk de acciones de 40 y una ejecución de 40 pasos, y el repositorio ocupa 0,2 GB.

Su relevancia es acotada pero representativa: es un ejemplo práctico y reproducible de cómo el método ACT, presentado en el artículo arXiv:2304.13705, permite obtener políticas de manipulación fina entrenadas con hardware relativamente asequible y datos de teleoperación, y desplegarlas con el ecosistema abierto LeRobot. No es un modelo de lenguaje ni un modelo multimodal general: es una política específica de tarea, sin capacidades de razonamiento simbólico ni de conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), condicionado por imitación; encoder de imágenes y estado con decoder de acciones |
| Parametros totales | 51.611.271 (51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; consume una observacion por paso (estado de 9 dimensiones y dos imagenes de 3x84x84) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors y no documenta variantes cuantizadas |
| Idiomas soportados | no aplica (politica de robotica; la tarea se especifica como cadena de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Robot objetivo | ur5e (Universal Robots UR5e) |
| Camaras | camera1, camera2 |
| Entrada | observation.state (9,), observation.images.camera1 (3,84,84), observation.images.camera2 (3,84,84) |
| Salida | action (7,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación y la varianza en tareas de manipulación fina. La arquitectura combina un encoder que procesa las observaciones (imágenes de las dos cámaras y el vector de estado de 9 dimensiones) con un decoder tipo transformer que genera el chunk de acciones; el método original emplea además un enfoque generativo tipo CVAE y, en inferencia, ensamblado temporal para suavizar las predicciones. El nombre del repositorio indica un tamano de chunk de 40 acciones con una ejecucion de 40 pasos por chunk.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset castanetnicolas/UR5e_nut_assembly_square_100_absolute_OSC_POS_SIZE_84, compuesto por 100 episodios y 24.602 fotogramas a 20 FPS, todos correspondientes a la tarea "Pick up the square nut and fit it onto the square peg". La configuración declarada es de 100.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni etapas de ajuste posteriores; se trata exclusivamente de aprendizaje por imitación supervisada a partir de demostraciones teleoperadas.

## Capacidades

- Generacion de secuencias de acciones de 7 dimensiones para control del UR5e (posicion y orientacion del efector final, mas pinza).
- Percepcion visual a partir de dos camaras RGB a 84x84 píxeles, integrada en el mismo modelo.
- Aprendizaje por imitacion de una tarea especifica de ensamblaje: coger la tuerca cuadrada y encajarla en la espiga cuadrada.
- Ejecucion de chunks de 40 acciones, lo que permite movimientos mas coherentes que una politica paso a paso.
- Control en bucle cerrado a la frecuencia del dataset de entrenamiento (20 FPS).
- Integracion con el flujo de LeRobot para rollout en robot real (`lerobot-rollout`) y para reentrenamiento (`lerobot-train`).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues.
- No dispone de modo de pensamiento (thinking mode), vision generalista, audio ni generacion de texto.

## Casos de uso

- Automatizacion de ensamblaje de tuerca y espiga en linea de produccion: la politica ejecuta la secuencia completa de aproximacion, agarre e insercion sobre un UR5e, con la tarea declarada explicitamente en el rollout mediante el parametro `--task`.
- Banco de pruebas para investigacion en aprendizaje por imitacion: sirve como referencia reproducible para comparar variantes de ACT (por ejemplo, distintos tamanos de chunk) manteniendo el mismo dataset y la misma tarea.
- Validacion de pipelines de teleoperacion y recogida de datos: al estar entrenado sobre un dataset LeRobot concreto, permite verificar de extremo a extremo la cadena de grabacion, calibracion de camaras y entrenamiento.
- Prototipado rapido en laboratorio con robot UR5e disponible: el modelo es ligero (51,6 M de parametros) y se puede desplegar en una estacion de trabajo con GPU de gama media para iterar sobre variaciones de la tarea.
- Demostraciones y docencia en robotica: ejemplo autocontenido de politica visual-motora que ilustra el flujo completo desde datos teleoperados hasta ejecucion autonoma.
- Base para ajuste fino en tareas de ensamblaje similares: al ser un checkpoint ACT estandar, se puede reentrenar con nuevos datasets de la misma familia (por ejemplo, otras piezas o posiciones) usando `lerobot-train`.
- Evaluacion comparativa de hiperparametros de chunk y ejecucion: el nombre del repositorio sugiere que forma parte de una familia de experimentos, lo que facilita comparaciones internas de configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de exito en robot real ni metricas estandar (MMLU, HumanEval, GSM8K u otras) aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parametros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16. La VRAM total necesaria, sumando activaciones y buffers de las dos camaras, se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente. Se puede usar RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin que la GPU sea el cuello de botella; incluso GPUs integradas pueden resultar viables.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos. El cuello de botella real no es el modelo sino la captura de las dos camaras y el bucle de control del robot.
- Opciones de despliegue: `lerobot-rollout` (estrategia base o con grabacion de episodios), entrenamiento con `lerobot-train` y ejecucion sobre PyTorch con CUDA o CPU. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput estimados: no disponible. El diseno del dataset y del entrenamiento apunta a un bucle de control a 20 FPS, con ejecucion de chunks de 40 acciones, pero no se proporcionan mediciones de latencia ni de frecuencia real alcanzada en robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_UR5e_BS_32_Act_Chunk_40_Exec_40 (este) | 51,6 M | chunk de 40 acciones / ejecucion de 40 pasos | no disponible | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| ACT_UR5e_BS_32_Act_Chunk_5_Exec_5 (mismo autor) | no disponible | chunk de 5 acciones / ejecucion de 5 pasos (segun nombre) | no disponible | no disponible | Hugging Face |
| ACT_UR5e_BS_32_Act_Chunk_50 (mismo autor) | no disponible | chunk de 50 acciones (segun nombre) | no disponible | no disponible | Hugging Face |
| ACT original (referencia metodologica, tonyzhaozh/act) | no disponible | chunk de acciones configurable | reportado en el articulo arXiv:2304.13705 | no disponible en la informacion | Repositorio GitHub y articulo |

La comparacion se limita a variantes del mismo autor y al metodo de referencia: no se dispone de datos de rendimiento publicados para ninguna de ellas en la informacion consultada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo sabe ejecutar la tarea "Pick up the square nut and fit it onto the square peg" sobre un UR5e con la configuracion concreta de camaras del entrenamiento. No generaliza a otras tareas ni a otros objetos.
- Dependencia del entorno de entrenamiento: cambios en la posicion de las piezas, la iluminacion, el fondo o la posicion de las camaras pueden degradar el rendimiento, ya que no se han documentado pruebas de robustez ni de generalizacion.
- Sin evaluacion publicada: no hay tasas de exito ni numero de ensayos, por lo que no se puede estimar la fiabilidad real en produccion.
- Riesgo de acumulacion de error y de fallo en el agarre o la insercion: en tareas de contacto fino los errores de percepcion o de calibracion se traducen en fallos de ensamblaje.
- Requiere calibracion del robot y de las camaras antes del despliegue; los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento (`observation.images.camera1`, `observation.images.camera2`).
- Dataset limitado (100 episodios, 24.602 fotogramas): la cobertura de variabilidad es reducida y puede provocar sobreajuste a las condiciones de demostracion.
- Sesgos conocidos: al derivarse de teleoperacion humana, puede heredar sesgos del operador (rutas preferidas, velocidades, estrategias de agarre) y comportamientos suboptimos.
- No aplica riesgo de alucinacion en el sentido de modelos de lenguaje, pero si existe riesgo de acciones incorrectas o inseguras en el espacio de trabajo del robot.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de licencia correspondientes. Se recomienda citar tanto el metodo ACT como LeRobot segun la model card.
- Caveat para produccion: no existe informacion sobre soporte, mantenimiento ni actualizaciones del repositorio (0 descargas y 0 likes en el momento de la consulta), por lo que el modelo debe tratarse como un artefacto experimental, no como un componente validado para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_40_Exec_40_TASK_nut_assembly_square_PIXELS_84
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_nut_assembly_square_100_absolute_OSC_POS_SIZE_84
- Articulo ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Repositorio de referencia de ACT: https://github.com/tonyzhaozh/act
- LeRobot (libreria y repositorio): https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Variante del mismo autor con chunk 5 / ejecucion 5: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_5_Exec_5
- Variante del mismo autor con chunk 50: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50
- Ejemplo de entrenamiento de ACT sobre UR5e: https://github.com/FlashFire574/UR5e_F-T_feedback_with_ACT
