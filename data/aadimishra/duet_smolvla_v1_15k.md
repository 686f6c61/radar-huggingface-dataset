# aadimishra/duet_smolvla_v1_15k

## Resumen

El modelo `aadimishra/duet_smolvla_v1_15k` es una política de vision-language-action (VLA) para robótica, publicada por el usuario aadimishra y construida sobre la librería LeRobot. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, que a su vez implementa el método SmolVLA descrito en el paper arXiv:2506.01844. SmolVLA se presenta como un VLA compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo.

A diferencia de un modelo de lenguaje, esta ficha describe una política de control: consume observaciones del robot (estado de articulaciones e imágenes de cámara) y produce directamente un vector de acción de 8 dimensiones. El modelo tiene 450.046.176 parámetros (unos 450 millones) y un repositorio de 0,9 GB en formato safetensors, lo que lo sitúa en el rango de los VLA pequeños y desplegables en GPU de gama media.

Su relevancia actual es doble: por un lado, demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación de forma accesible; por otro, sirve como ejemplo reproducible de ajuste fino multitarea con instrucciones en lenguaje natural sobre un robot `duet_mujoco`. No obstante, se trata de un modelo recién publicado, sin descargas ni valoraciones, sin resultados de evaluación publicados y entrenado con un conjunto de datos muy reducido (60 episodios y 2.519 fotogramas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) tipo smolvla sobre stack LeRobot; política de imitación que combina codificadores visuales y de lenguaje con un cabezal de acciones |
| Parametros totales | 450.046.176 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset de entrenamiento estan redactadas en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`); tamano del repositorio 0,9 GB |
| Tipo de modelo | politica robotica (no generativa de texto), pipeline `robotics` |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Robot objetivo | `duet_mujoco` |
| Camaras declaradas | `head`, `left_wrist` |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256), `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (8,) |
| Dataset de entrenamiento | `aadimishra/duet_multitask_language_v1_clean` (60 episodios, 2.519 fotogramas, 20 FPS) |
| Version de LeRobot | 0.6.2 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo de visión-lenguaje-acción: la política consume observaciones multimodales (imágenes de varias cámaras junto con el estado articular del robot, un vector de 6 dimensiones) y emite un vector de acción de 8 dimensiones, es decir, aprende un mapeo directo de percepción y lenguaje a control motor mediante aprendizaje por imitación. No se detalla en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea un cabezal de flow matching u otra parametrización de la distribución de acciones; tampoco se especifica la longitud de contexto del componente de lenguaje.

El entrenamiento se realizó con LeRobot 0.6.2 mediante ajuste fino desde `lerobot/smolvla_base`, con 10.000 pasos, tamaño de lote 1, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos contiene 60 episodios y 2.519 fotogramas grabados a 20 FPS, con seis instrucciones de tarea en inglés agrupadas en torno a dos objetos (una taza amarilla y un bloque rojo), por ejemplo "position the left gripper over the yellow mug", "grasp and lift the red block" o "lift the red block with the left gripper". No se documenta en la model card si el modelo base recibió RLHF, DPO u otra fase de alineamiento, ni la composición exacta de los datos de preentrenamiento de SmolVLA.

## Capacidades

- Generación directa de acciones de control: transforma observaciones visuales y de estado en un vector de acción de 8 dimensiones, sin etapa intermedia de planificación explícita.
- Ejecución de tareas de manipulación guiadas por lenguaje natural: las seis tareas documentadas cubren acercar el efector al objeto, colocarlo por encima y agarrarlo y levantarlo.
- Comprensión visual multivista: acepta hasta cuatro entradas de imagen, con resoluciones de 256x256 y 480x640, incluyendo una cámara declarada como vacía (`empty_camera_0`).
- Versatilidad de formulación de instrucciones: el dataset incluye varias maneras de expresar la misma tarea ("pick up the red block" frente a "grasp and lift the red block"), lo que sugiere cierta robustez ante paráfrasis dentro del dominio entrenado.
- Ejecución multi-turno sobre el robot: la política se ejecuta de forma continua mediante `lerobot-rollout`, con duración configurable.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPU de gama media.
- Tool calling / function calling: no disponible (no es una capacidad propia de una política robótica).
- Capacidades de agente y razonamiento multi-paso: no disponibles como tales; la política ejecuta control reactivo, no planificación simbólica.
- Capacidades multilingües: no disponibles; todas las instrucciones del dataset están en inglés.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles, salvo la percepción visual integrada propia del modelo.

## Casos de uso

- Manipulación de escritorio con instrucciones en lenguaje natural: el modelo puede colocarse sobre una taza o levantar un bloque rojo emitiendo acciones a partir de una frase como "grasp and lift the red block", lo que resulta adecuado para demostraciones de VLA en entornos controlados de laboratorio.
- Punto de partida para ajuste fino propio: dado que se entrena desde `lerobot/smolvla_base` con `lerobot-train`, sirve como plantilla para adaptar una política a un robot o a un conjunto de tareas distinto con pocos miles de fotogramas.
- Evaluación de robustez ante paráfrasis: al incluir seis formulaciones distintas para dos objetos, permite estudiar experimentalmente si la política generaliza entre variantes lingüísticas del mismo comando.
- Investigación en aprendizaje por imitación con presupuesto limitado: con 450 M de parámetros y 0,9 GB de pesos, un grupo de investigación puede reproducir el pipeline completo de entrenamiento y despliegue sin clúster de GPU.
- Experimentación en simulación con MuJoCo: el tipo de robot `duet_mujoco` indica un entorno simulado, idóneo para pruebas de estrés, cambios de posición de objetos, iluminación y distractores antes de tocar hardware físico.
- Recolección y curado de datos robóticos: el modelo fuerza a definir de antemano las claves de observación y las dimensiones de acción, lo que sirve de guía práctica para estandarizar nuevas grabaciones en LeRobot.
- Docencia y talleres de robótica: el flujo `lerobot-rollout` con un único comando y una política de tamaño reducido es adecuado para sesiones formativas sobre VLA y aprendizaje por imitación.
- Pruebas de latencia de control a 20 FPS: la tasa de grabación del dataset (20 FPS) marca un régimen realista para medir si la inferencia sostiene el bucle de control en distintas GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la línea "No evaluation results have been provided for this policy yet.", por lo que no existen tasas de éxito en robot real o simulado para las seis tareas declaradas. Tampoco se proporcionan comparaciones con otras políticas sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp32): en torno a 1,8-2 GB solo para los pesos, más el coste de activaciones y búferes de imagen.
- VRAM estimada en media precisión (bf16/fp16): aproximadamente 0,9-1,2 GB para los pesos.
- Repositorio descargable: 0,9 GB, lo que indica pesos almacenados en formato de media precisión o similar.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4070 y superiores son suficientes. GPU de centro de datos como A100 o H100 no son necesarias para la inferencia.
- Cabe en GPU de consumo: sí, con holgura, incluso en modelos de gama media y en portátiles con GPU dedicada.
- Opciones de despliegue: `lerobot-rollout` y el ecosistema LeRobot. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no se trata de un modelo de generación de texto.
- Latencia y throughput estimados: no disponibles. El único dato temporal es que el dataset se grabó a 20 FPS, lo que sugiere un régimen de control de 20 Hz, pero no se publica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `aadimishra/duet_smolvla_v1_15k` | 450 M | no disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tune sobre SmolVLA base para robot `duet_mujoco` |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace (modelo base citado) | Origen del fine-tune; se usa con `policy.path` en LeRobot |
| Otras politicas VLA (OpenVLA, pi0, entre otras) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion recibida |

No se dispone de datos verificados de parámetros, contexto, licencia ni rendimiento de alternativas comparables dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La búsqueda web realizada no devolvió resultados relacionados con este modelo ni con SmolVLA.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card declara explícitamente que no se han proporcionado resultados de evaluación; no hay tasas de éxito ni pruebas en robot real.
- Dataset muy reducido: 60 episodios y 2.519 fotogramas para seis tareas, lo que implica un riesgo alto de sobreajuste y una generalización limitada a posiciones, iluminación u objetos no vistos.
- Dominio restringido: las tareas se limitan a una taza amarilla y un bloque rojo; se desconoce el comportamiento ante objetos, colores o disposiciones distintas.
- Acoplamiento a un robot concreto: la política está entrenada para `duet_mujoco` y espera exactamente las claves de observación y las dimensiones de acción declaradas; cambiar el robot o las cámaras invalida el modelo.
- Configuración de cámaras estricta: los nombres e índices de cámara deben coincidir con las claves de observación usadas en el entrenamiento, tal como advierte la propia documentación de LeRobot.
- Dependencia del idioma inglés: las instrucciones de entrenamiento están en inglés; no hay evidencia de comportamiento correcto con comandos en castellano u otros idiomas.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo, y en robótica el sesgo relevante sería la distribución de posiciones y apariencias del dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cumplan las condiciones del modelo base del que deriva.
- Madurez: 0 descargas y 0 valoraciones en el momento de la consulta, sin validación por parte de la comunidad.
- Caveat de seguridad física: cualquier despliegue en hardware real debe ir acompañado de límites de par, paradas de emergencia y supervisión humana.
- Model card incompleta: la sección de citación aparece truncada y no se documentan detalles de arquitectura, contexto ni cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aadimishra/duet_smolvla_v1_15k
- Dataset de entrenamiento: https://huggingface.co/datasets/aadimishra/duet_multitask_language_v1_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=aadimishra/duet_multitask_language_v1_clean
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo, con SmolVLA ni con el paper arXiv:2506.01844; los resultados obtenidos correspondian a examenes de biologia de nivel A y se han descartado por no ser relevantes.
