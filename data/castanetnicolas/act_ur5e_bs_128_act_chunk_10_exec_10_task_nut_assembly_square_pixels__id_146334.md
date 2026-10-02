# castanetnicolas/ACT_UR5e_BS_128_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_PIXELS__ID_146334

## Resumen

ACT_UR5e_BS_128_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_PIXELS__ID_146334 es una política de robótica entrenada con Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El autor del repositorio es el usuario de Hugging Face castanetnicolas y el modelo se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visuomotor que consume estado proprioceptivo e imágenes de cámara y produce comandos de acción.

El modelo tiene 51.580.551 parámetros (dato real de los pesos en safetensors), ocupa 0,2 GB en el repositorio y está especializado en una única tarea de ensamblaje: coger una tuerca cuadrada y colocarla sobre una clavija cuadrada. Se entrenó a partir de un conjunto de datos de 200 episodios y 30.154 fotogramas grabados a 20 FPS mediante teleoperación. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento, publicación y despliegue) y como punto de partida para investigar inserción de precisión con acción fragmentada. La model card no incluye resultados de evaluación y el repositorio no tiene descargas ni interacciones, por lo que debe considerarse un artefacto experimental y no una política validada en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador-decodificador para imitación visuomotora |
| Parametros totales | 51.580.551 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo opera sobre una ventana de observación fija y predice fragmentos de acción (el identificador del repositorio sugiere chunk de 10 y ejecución de 10, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin cuantizaciones alternativas publicadas |
| Idiomas soportados | no disponible; la tarea se especifica con una cadena de texto en el script de despliegue, pero el modelo no procesa lenguaje como tal |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot declarado | `panda` (según la model card), con discrepancia respecto al nombre del repositorio, que menciona `UR5e` |
| Cámaras de entrada | `agentview` y `robot0_eye_in_hand` |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 84, 84), `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | robotics |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el artículo Action Chunking with Transformers (arXiv:2304.13705). En lugar de predecir una única acción por paso de control, el modelo predice un fragmento de acciones futuras, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza el comportamiento en tareas de contacto. La model card no detalla la configuración interna de esta instancia concreta (número de capas, dimensión de los embeddings, tamaño del fragmento o si se empleó ensamblado temporal en la inferencia), por lo que esos datos deben consultarse en el artículo de referencia o en el código de LeRobot.

El entrenamiento se realizó sobre el conjunto de datos castanetnicolas/robomimic_square_ph_image84, compuesto por 200 episodios, 30.154 fotogramas a 20 FPS y una única tarea: coger la tuerca cuadrada y colocarla sobre la clavija cuadrada. La configuración declarada es de 100.000 pasos de entrenamiento, tamaño de lote 128, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se indica en la información disponible si se aplicaron etapas de ajuste con preferencias humanas (RLHF/DPO) ni qué proporción del dataset corresponde a estados de éxito o de recuperación.

## Capacidades

- Control visuomotor de un brazo robótico para una tarea de ensamblaje concreta: insertar una tuerca cuadrada en una clavija cuadrada.
- Predicción de fragmentos de acción (action chunking) en lugar de acciones individuales, según la descripción del método ACT.
- Fusión de dos vistas de cámara, una global (`agentview`) y una en la muñeca (`robot0_eye_in_hand`), junto con el estado proprioceptivo de 9 dimensiones.
- Generación de comandos de acción de 7 dimensiones, compatible con el formato estándar de LeRobot para robots tipo Panda.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas ni de simulación.
- No dispone de llamada a herramientas, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento: no es un modelo generativo de texto.
- No se declaran capacidades de visión general (descripción de imágenes, VQA) ni de audio.

## Casos de uso

- Ensamblaje de inserción de precisión en línea de montaje: la política ejecuta la secuencia de aproximación, agarre y colocación de la tuerca cuadrada sobre la clavija, una maniobra con tolerancias estrechas donde el control paso a paso suele fallar por acumulación de error.
- Reproducción de un pipeline completo de aprendizaje por imitación: sirve de plantilla reproducible para grabar datos con teleoperación, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`, gracias a que el repositorio incluye comandos exactos y referencias a la documentación de LeRobot.
- Banco de pruebas de comparación de políticas: permite contrastar ACT frente a otras familias de políticas de imitación (por ejemplo, Diffusion Policy) sobre exactamente el mismo dataset de 200 episodios y 30.154 fotogramas, controlando así las variables del conjunto de datos.
- Investigación sobre acción fragmentada: al ser un checkpoint entrenado con un fragmento declarado en el nombre del repositorio, resulta útil para estudiar el efecto del tamaño del chunk en la suavidad y la tasa de éxito de la tarea.
- Recogida de datos y aumento de dataset: puede desplegarse en modo de ejecución para generar trayectorias adicionales que después se filtren y se añadan al conjunto de entrenamiento.
- Validación de integración de hardware: sirve para comprobar el cableado, la calibración y la sincronización de dos cámaras OpenCV a 30 FPS con el robot antes de invertir en entrenamientos más costosos.
- Demostraciones educativas: al ser un modelo pequeño de 51,58 millones de parámetros y 0,2 GB, es viable para docencia sobre aprendizaje por imitación en robótica sin necesidad de infraestructura de cálculo dedicada.
- Evaluación de robustez ante cambios de iluminación o posición de objeto: útil como política base para medir degradación al variar las condiciones respecto a las del dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "No evaluation results have been provided for this policy yet.", de modo que no existen tasas de éxito en robot real ni métricas de error de acción para este checkpoint.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (no es un modelo de lenguaje) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,58 millones de parámetros, los pesos en precisión de 32 bits ocupan aproximadamente 206 MB, y en 16 bits unos 103 MB. Sumando las activaciones de los dos codificadores visuales que procesan imágenes de 84×84 y los búferes de inferencia, la huella total debería mantenerse muy por debajo de 2 GB, aunque no se publica una medición oficial.
- GPU recomendadas: no hay requisitos declarados. Por tamaño, cualquier GPU con al menos 4 GB de memoria debería ser suficiente, incluidas NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100. El uso de GPU de gama alta no aporta ventaja en precisión, solo en latencia y en la capacidad de ejecutar varios entrenamientos en paralelo.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier tarjeta moderna de sobremesa o portátil con más de 4 GB de VRAM. También es viable ejecutar la inferencia solo en CPU (el script de LeRobot admite `--policy.device`), lo que permite desplegar en un equipo de control junto al robot.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para inferencia sin grabación de episodios; entrenamiento posterior con `lerobot-train`; integración con PyTorch en el marco de LeRobot. No se publican pesos en GGUF ni hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponible. La única referencia temporal es la frecuencia del dataset de entrenamiento (20 FPS) y la configuración de cámaras sugerida en el ejemplo de despliegue (640×480 a 30 FPS), pero no se publica la latencia real de inferencia ni la frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, castanetnicolas) | Politica de imitacion ACT | 51.580.551 | Fragmento de accion segun nombre del repo (10), no confirmado | apache-2.0 | Checkpoint en Hugging Face, 0 descargas, 0 likes |
| ACT original (arXiv:2304.13705) | Metodo de imitacion ACT | no disponible | no disponible en la informacion proporcionada | no disponible | Articulo y codigo de referencia |
| Diffusion Policy | Politica de imitacion basada en difusion | no disponible | no disponible | no disponible | Metodo alternativo citado habitualmente en el ecosistema LeRobot |
| Otras politicas LeRobot entrenadas con `lerobot-train` | Politicas de imitacion (ACT, Diffusion Policy, VQ-BeT, etc.) | no disponible | no disponible | Segun cada repositorio | Multiples checkpoints publicados por la comunidad |

No se dispone de datos comparativos de rendimiento (tasa de éxito, número de ensayos) para este checkpoint ni para las alternativas dentro de la información proporcionada, por lo que la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: la model card indica explícitamente que no se han proporcionado resultados, por lo que se desconoce la tasa de éxito real en robot.
- Especialización extrema: la política está entrenada para una única tarea ("Pick up the square nut and place it on the square peg.") y un único conjunto de datos. Fuera de esa tarea, su comportamiento no está caracterizado.
- Riesgo de sobreajuste al entorno de entrenamiento: cualquier cambio en la posición de los objetos, la iluminación, el fondo, el tipo de cámara o la calibración puede degradar el rendimiento de forma no medida.
- Riesgo de alucinación en el sentido generativo no aplica, pero sí existe riesgo de acciones incoherentes o inseguras cuando la observación se aleja de la distribución de entrenamiento, algo intrínseco al aprendizaje por imitación.
- Discrepancia de identificación: el nombre del repositorio menciona `UR5e` mientras que la model card declara `robot.type: panda`. Esta inconsistencia debe resolverse antes de desplegar el modelo, ya que afecta a la cinemática y al espacio de acciones.
- Coincidencia de nombres de cámara obligatoria: las cámaras declaradas en el despliegue deben llamarse exactamente como las claves de observación del entrenamiento, de lo contrario la política no recibirá las entradas esperadas.
- Dependencia de hardware físico: la ejecución requiere un robot real, puerto de comunicación y dos cámaras configuradas; no hay demo en simulación ni entorno reproducible publicado.
- Idiomas y texto: no hay soporte multilingüe ni procesamiento de lenguaje. La cadena de tarea solo se usa como etiqueta en el script de despliegue.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite adecuadamente. No impone restricciones de uso adicionales.
- Cita obligatoria en trabajos derivados: la model card solicita citar el artículo de ACT y la referencia de LeRobot.
- Madurez del artefacto: cero descargas y cero interacciones en el momento de la consulta, sin historial de uso por terceros que permita inferir fiabilidad.
- Fecha de creación registrada como 2026-10-01, posterior a la versión de LeRobot declarada (0.6.1); conviene verificar la compatibilidad de versiones antes de reproducir el entrenamiento.
- Ninguno de los resultados de la búsqueda web realizada es relevante para este modelo; no se han podido recoger enlaces externos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_128_Act_Chunk_10_Exec_10_TASK_nut_assembly_square_PIXELS__ID_146334
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_square_ph_image84
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_square_ph_image84
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot: Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024, https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha y se han descartado.
