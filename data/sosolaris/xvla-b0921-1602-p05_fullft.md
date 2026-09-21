# SoSolaris/xvla-b0921-1602-p05_fullft

## Resumen

SoSolaris/xvla-b0921-1602-p05_fullft es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario SoSolaris en HuggingFace Hub. No es un modelo de lenguaje: es un controlador de imitación entrenado para ejecutar una tarea física concreta ("Grab the tape", coger la cinta) sobre un brazo robot SO-101 en configuración `so101_follower`. El modelo parte del checkpoint base `lerobot/xvla-base` y ha sido ajustado con 20 episodios y 7071 fotogramas grabados a 15 FPS, dentro del ecosistema LeRobot 0.6.2.

Técnicamente, se apoya en X-VLA, un marco de flow matching con soft prompts descrito en el paper arXiv 2510.10274. La idea central de X-VLA es tratar cada configuración de robot o hardware como una "tarea" representada por un conjunto reducido de embeddings de Soft Prompt aprendibles, de modo que un único modelo puede reconciliar morfologías, sensores y espacios de acción distintos. Esta ficha concreta corresponde a un ajuste fino de tarea única sobre esa base.

Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de cómo se entrena y despliega una política VLA moderna con la CLI de LeRobot, con 879 687 256 parámetros (unos 880 M) y 1,8 GB de pesos en safetensors. Con 0 descargas y 0 likes, es un artefacto reciente y sin validación pública de rendimiento, por lo que debe tratarse como un punto de partida para experimentación y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (X-VLA) |
| Parametros totales | 879 687 256 (aprox. 880 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es multimodal: imagenes + estado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el tamano del repo, 1,8 GB, es coherente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so101_follower |
| Camaras | right, up (mas una tercera vista `observation.images.image3`) |
| Entradas | observation.images.image (3, 256, 256), observation.images.image2 (3, 256, 256), observation.state (8,), observation.images.image3 (3, 224, 224) |
| Salidas | action (6,) |
| Frecuencia de datos | 15 FPS |
| Modelo base | lerobot/xvla-base |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 1,8 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

X-VLA es un marco VLA basado en flow matching que introduce un mecanismo de soft prompting: cada configuración robotica (morfologia, conjunto de sensores, espacio de acción) se representa como una "tarea" codificada mediante un conjunto pequeño de embeddings de Soft Prompt entrenables. Esto permite que un mismo modelo trate con espacios de acción y morfologías heterogéneas sin duplicar la arquitectura completa. La política consume tres flujos visuales (dos a 256x256 y uno a 224x224) junto con un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones, típico de un brazo de 6 grados de libertad tipo SO-101.

El ajuste fino se realizó sobre `lerobot/xvla-base` durante 4000 pasos con batch size 32, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. El dataset `SoSolaris/FlourishGrabTape` contiene 20 episodios, 7071 fotogramas a 15 FPS y una única instrucción de tarea: "Grab the tape". No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de alineación adicional, algo esperable en políticas de imitación de este tipo. Tampoco se detalla la composición del corpus de preentrenamiento del modelo base ni la innovación técnica concreta aportada respecto al paper original.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción visual multivista: procesa de forma simultánea tres vistas de cámara (dos a 256x256 y una a 224x224).
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción de tarea (`--task="Grab the tape"`), si bien este ajuste concreto solo está entrenado para una instrucción.
- Fusión de estado propioceptivo y visión: integra un vector de estado de 8 dimensiones junto con las imágenes.
- Ajuste fino adicional: al derivar de `lerobot/xvla-base`, la arquitectura admite reentrenamiento con nuevos datasets mediante `lerobot-train`.
- Tool calling / function calling: no disponible (no aplica a un modelo de este tipo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de razonamiento simbólico).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, vídeo, generación de texto): no disponibles.

## Casos de uso

- Automatización de una celda de pick-and-place ligera: la política puede recoger objetos pequeños y planos similares a una cinta adhesiva sobre una superficie de trabajo, usando el brazo SO-101 y las vistas `right` y `up` para localizar el objeto y planificar la pinza.
- Prototipado rápido en laboratorio de robótica: sirve como referencia reproducible para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) antes de invertir en datasets mayores.
- Punto de partida para ajuste fino con datos propios: partiendo de `lerobot/xvla-base` o de este checkpoint, se puede reentrenar con un dataset propio y una instrucción nueva usando `lerobot-train`, aprovechando que la arquitectura está pensada para acomodar morfologías y espacios de acción distintos mediante soft prompts.
- Manipulación en línea de montaje o envasado: tareas repetitivas de recogida y colocación de piezas donde el ciclo se ejecuta a 15 FPS, frecuencia a la que se grabaron los datos de entrenamiento.
- Docencia y divulgación técnica: ejemplo didáctico de política VLA de menos de 1000 M de parámetros que cabe en una GPU de consumo, útil para explicar imitación, flow matching y despliegue con CLI.
- Banco de pruebas de infraestructura de inferencia robótica: permite medir latencia y throughput con `lerobot-rollout` en distintas GPU antes de escalar a políticas mayores.
- Investigación comparativa en VLA: al ser un ajuste de tarea única con 20 episodios, es un caso útil para estudiar sobreajuste, generalización de posición y robustez ante cambios de iluminación.
- Integración en demostraciones controladas: grabación de vídeos o demos reproducibles de una política entrenada con LeRobot, con `--strategy.type=base` para ejecución sin registro de episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación explícitamente vacía, con la indicación `_No evaluation results have been provided for this policy yet._`. No hay tasas de éxito, número de ensayos ni condiciones de prueba para la tarea "Grab the tape". El paper asociado (arXiv 2510.10274) describe el método X-VLA, pero no se proporcionan en la información disponible resultados de este ajuste concreto ni comparaciones numéricas frente a otras políticas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en bf16/fp16 y unos 3,5 GB en fp32, a partir de los 879 687 256 parámetros y del tamaño del repositorio.
- VRAM estimada para inferencia completa: del orden de 4 a 8 GB contando los tres codificadores visuales y las activaciones de un batch de tamaño 1 (estimación propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son suficientes; también resulta razonable una NVIDIA Jetson Orin para despliegue embarcado en el robot.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 8 GB o más. No requiere A100 ni H100.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento) sobre PyTorch con CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset se grabó a 15 FPS, lo que implica un objetivo de bucle de control del orden de 66 ms por paso; no se ha confirmado que la política alcance esa frecuencia en hardware concreto.
- Almacenamiento: 1,8 GB para el repositorio de pesos, más el espacio de los checkpoints generados durante el entrenamiento en `outputs/train/<policy_repo_id>/checkpoints/`.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos de rendimiento. La tabla siguiente recoge alternativas de la misma categoría a nivel informativo; los valores marcados como "no disponible" no se han podido verificar en la información suministrada y no deben tomarse como cifras confirmadas.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| SoSolaris/xvla-b0921-1602-p05_fullft | 879 687 256 | VLA con flow matching, ajuste de tarea unica | apache-2.0 | HuggingFace Hub, libreria lerobot |
| lerobot/xvla-base | no disponible | VLA con flow matching, modelo base | no disponible | HuggingFace Hub |
| Políticas de imitación tipo ACT / Diffusion Policy en LeRobot | no disponible | Imitación supervisada / difusión | no disponible | HuggingFace Hub, libreria lerobot |
| Otras políticas VLA abiertas del ecosistema LeRobot | no disponible | VLA | no disponible | HuggingFace Hub |

No se dispone en la información proporcionada de cifras de parámetros, contexto ni rendimiento de las alternativas que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Tarea única: el ajuste está entrenado exclusivamente para la instrucción "Grab the tape". No se puede esperar generalización a otras tareas sin reentrenamiento.
- Dataset muy reducido: 20 episodios y 7071 fotogramas son un volumen bajo, con riesgo alto de sobreajuste a posiciones, iluminación y disposición concretas de la escena.
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Dependencia del hardware específico: requiere un brazo `so101_follower` con las cámaras `right` y `up` (y una tercera vista), y los nombres de cámara deben coincidir exactamente con las claves de observación del entrenamiento.
- Riesgo de comportamiento errático fuera de distribución: como toda política de imitación, puede producir acciones inseguras ante objetos, posiciones o condiciones de luz no vistas durante el entrenamiento.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y en el caso de políticas robóticas el sesgo relevante es de distribución (posición, color, textura de los objetos).
- Idiomas soportados: no disponible. El condicionamiento por lenguaje natural existe en la arquitectura, pero no hay información sobre cobertura multilingüe.
- Limitaciones de contexto: no aplica una ventana de contexto de texto; la "memoria" del modelo está acotada por las observaciones que recibe en cada paso.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia y se cite el método y LeRobot. El modelo base `lerobot/xvla-base` debería revisarse por si tuviera condiciones adicionales, no disponibles en la información proporcionada.
- Advertencia para producción: dado el estado del artefacto (0 descargas, 0 likes, creado el 21 de septiembre de 2026), no debe desplegarse en entornos reales sin una validación exhaustiva y medidas de seguridad físicas.
- Fecha de creación poco habitual: los metadatos indican 2026-09-21 tanto en creación como en actualización, con dos segundos de diferencia entre ambos sellos temporales, lo que sugiere un proceso automatizado de subida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-b0921-1602-p05_fullft
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/FlourishGrabTape
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/FlourishGrabTape
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv 2510.10274)
- Guía de LeRobot para xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
