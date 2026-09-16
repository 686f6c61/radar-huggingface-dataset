# akimaru/act_so101_10th

## Resumen

`akimaru/act_so101_10th` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales. El modelo lo publica el usuario `akimaru` en Hugging Face usando LeRobot, la librería de aprendizaje automático para robótica del mundo real de Hugging Face, y está pensado para controlar un brazo `so_follower` (familia SO-100/SO-101) con seis grados de libertad.

La política consume el estado articular de 6 dimensiones y cuatro flujos de cámara a 480x640 (identificados como `robot`, `front`, `side` y `naname`) y produce un vector de acción de 6 dimensiones. Se entrenó sobre el dataset `akimaru/newhouse`, con 149 episodios y 73.601 fotogramas grabados a 30 FPS para la tarea "Pick_and_place_objects_to_sort_them" (recoger objetos y clasificarlos).

Es relevante porque es un ejemplo representativo del flujo de trabajo actual de robótica open source: un modelo pequeño (51,7 millones de parámetros, 0,6 GB de repositorio) entrenado con datos teleoperados propios, licencia Apache 2.0 y despliegue directo mediante línea de comandos. Su interés práctico es acotado: es una política específica de una tarea, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder CVAE y decodificación por chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. La ventana de observación la define la configuración de ACT (no especificada en la model card) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | No disponible; no aplica, no hay interfaz de lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de pipeline | `robotics` |
| Tipo de robot | `so_follower` (SO-101, brazo de 6 GdL) |
| Entradas | `observation.state` (6,); `observation.images.robot`, `observation.images.front`, `observation.images.side`, `observation.images.naname` (3, 480, 640) cada una |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `akimaru/newhouse` (149 episodios, 73.601 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 10.000.000 |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705. En lugar de predecir una única acción por paso, el modelo aprende a predecir secuencias cortas de acciones (chunks), lo que reduce el problema de acumulación de error en horizontes largos y mejora la estabilidad del control. La formulación habitual de ACT combina un encoder de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas con un transformer encoder-decoder que produce el chunk de acciones; el despliegue suele aplicar un ensamblado temporal de los chunks solapados. La model card de este repositorio no detalla la configuración concreta de capas, dimensión de los embeddings ni longitud del chunk.

Los datos de entrenamiento corresponden al dataset `akimaru/newhouse`: 149 episodios y 73.601 fotogramas a 30 FPS (aproximadamente 41 minutos de teleoperación, unas 16,5 segundos por episodio), con una única tarea etiquetada como "Pick_and_place_objects_to_sort_them". La configuración declarada es de 10.000.000 de pasos de entrenamiento, batch de 24, optimizador AdamW, learning rate 1e-5 y semilla 1000, todo con LeRobot 0.6.1. La model card no indica si hubo etapas de RLHF, DPO ni ningún otro ajuste posterior; en aprendizaje por imitación esto no es habitual.

## Capacidades

- Generación de acciones de manipulación: produce vectores de 6 dimensiones (articulaciones y pinza del brazo `so_follower`) a partir de observaciones visuales multivista y del estado articular.
- Fusión visomotora con cuatro cámaras: integra tres vistas externas (`front`, `side`, `naname`) más una vista a bordo (`robot`), todas a 480x640.
- Ejecución de una tarea concreta de pick-and-place: clasificación de objetos mediante recogida y colocación, según la etiqueta de la tarea del dataset.
- Aprendizaje por imitación a partir de datos teleoperados: reproduce trayectorias demostradas en el mismo montaje robot-cámaras.
- Control reactivo a 30 FPS: el modelo está alineado con la frecuencia de captura del dataset, de modo que puede cerrar el bucle de control a esa cadencia.
- Fine-tuning: la receta de entrenamiento es estándar de LeRobot (`lerobot-train --policy.type=act`), por lo que puede reentrenarse con nuevos datasets.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidad multilingüe, modo de pensamiento, visión general ni audio. No es un modelo de lenguaje ni un VLA con backbone de lenguaje.

## Casos de uso

- Automatización de clasificación de objetos en laboratorio: el modelo ejecuta la tarea "Pick_and_place_objects_to_sort_them" sobre el mismo montaje de brazo SO-101 y las cuatro cámaras del entrenamiento, sin necesidad de programar trayectorias manualmente.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar ACT frente a otras políticas (por ejemplo, políticas basadas en difusión) sobre el mismo dataset y el mismo robot.
- Fine-tuning de nuevas tareas con pocas demostraciones: dado su tamaño reducido (51,7 M de parámetros), una nueva tarea se puede abordar grabando un dataset propio y reentrenando con `lerobot-train`, sin necesidad de clústeres de GPU.
- Docencia y robótica educativa: el par SO-101 más ACT más LeRobot permite montar un flujo completo de teleoperación, grabación, entrenamiento y despliegue en un curso con hardware de bajo coste.
- Recolección de datos y evaluación continua: puede ejecutarse con `lerobot-rollout` para comparar variantes de política o para generar datos de éxito y fallo que alimenten iteraciones posteriores.
- Prototipado de células de pick-and-place en logística ligera: como referencia de viabilidad antes de invertir en integración industrial, asumiendo que la política está limitada a la distribución de objetos y posiciones vistas en el entrenamiento.
- Módulo de bajo nivel en una arquitectura jerárquica: un planificador de alto nivel podría invocar esta política como primitiva de manipulación, dado que consume observaciones y emite acciones directamente.
- Pruebas de despliegue en hardware de gama baja: al ser un modelo pequeño, se puede ejecutar en GPU de consumo o en dispositivos embebidos tipo Jetson, siempre que se cumpla el requisito de cuatro cámaras y control a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación sin rellenar, con la línea "No evaluation results have been provided for this policy yet.", de modo que no hay tasas de éxito en robot real, ni número de ensayos, ni resultados en simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 51,7 M de parámetros, lo que equivale aproximadamente a 207 MB en fp32 y 103 MB en fp16/bf16 solo en pesos. Con activaciones y buffers de las cuatro cámaras, el consumo real es muy inferior al de cualquier modelo de lenguaje de tamaño similar; no hay cifra oficial publicada.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060 o RTX 4090 cubren la inferencia con holgura. El entrenamiento con batch 24 y 10 millones de pasos se beneficia de más VRAM y de mayor ancho de banda, pero tampoco exige hardware de centro de datos.
- Inferencia en CPU: es viable por el tamaño del modelo, aunque el cuello de botella real es el procesamiento de cuatro cámaras a 640x480 y 30 FPS.
- GPUs de consumo: cabe con margen en prácticamente cualquier GPU de consumo moderna e incluso en aceleradores embebidos (por ejemplo, NVIDIA Jetson Orin) si se ajusta la resolución o la cadencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (despliegue en robot) y `lerobot-train` (entrenamiento), ambos de la librería LeRobot, sobre PyTorch. La model card no menciona soporte de vLLM, llama.cpp, Ollama, TGI ni TensorRT, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El requisito funcional es mantener el bucle de control a 30 FPS, coherente con la frecuencia del dataset, con cuatro cámaras OpenCV a 640x480 y 30 FPS cada una.
- Requisitos de sistema adicionales: puerto serie del robot (`--robot.port`) y cuatro cámaras cuyos nombres deben coincidir exactamente con las claves de observación del entrenamiento (`robot`, `front`, `side`, `naname`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akimaru/act_so101_10th | ACT (imitación, chunks de acciones) | 51.668.614 | Estado 6D + 4 cámaras 480x640 | Apache 2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy (LeRobot) | Política visomotora basada en difusión | Depende de la configuración; no disponible | Estado + imágenes (configurable) | No disponible en la información proporcionada | Implementación en LeRobot |
| SmolVLA (Hugging Face) | VLA con backbone de visión-lenguaje | No disponible en la información proporcionada | Imágenes + instrucción en lenguaje natural | No disponible en la información proporcionada | Hugging Face, vía LeRobot |
| Otras políticas ACT publicadas en el Hub | ACT (imitación) | Variable según configuración | Variable según robot y cámaras | Habitualmente Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento (tasas de éxito, robustez ante cambios de iluminación o posición) entre estos modelos en la información proporcionada. La comparación relevante es metodológica: ACT es más ligero y simple de entrenar, mientras que las políticas de difusión y los VLA suelen requerir más cómputo y datos, a cambio de mayor generalidad.

## Limitaciones y advertencias

- Sin evaluación publicada: la propia model card indica que no se han aportado resultados de evaluación, por lo que no hay evidencia documentada de tasa de éxito en robot real.
- Política de tarea única: entrenada exclusivamente para "Pick_and_place_objects_to_sort_them"; se espera un fallo sistemático ante objetos, posiciones o tareas fuera de la distribución del dataset.
- Dependencia estricta del montaje: requiere un robot `so_follower`, cuatro cámaras con los nombres `robot`, `front`, `side` y `naname`, resolución 640x480 y 30 FPS. Cambiar la disposición de las cámaras o el robot invalida la política.
- Dataset pequeño: 149 episodios y 73.601 fotogramas implican una diversidad limitada de posiciones, iluminación y configuraciones de objetos.
- Riesgo de sobreajuste y de deriva: en aprendizaje por imitación, los errores se acumulan al salir de la distribución de estados vistos; no hay datos publicados sobre recuperación ante fallos.
- Sensibilidad a la calibración: cambios en la calibración del brazo, en el agarre o en el entorno físico degradan el comportamiento esperado.
- Idiomas: no disponible. No hay ninguna capacidad de procesamiento de lenguaje natural ni de instrucciones textuales; el campo `task` del comando de despliegue es una etiqueta de tarea, no una entrada lingüística del modelo.
- Cuantizaciones: no se documentan formatos cuantizados en la model card; solo se publican pesos safetensors para LeRobot.
- Licencia: Apache 2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia. Hay que citar además el método ACT (arXiv:2304.13705) y LeRobot según indica la model card.
- Trazabilidad: el repositorio tiene 10 descargas y 0 likes, sin validación por parte de terceros; conviene tratarlo como un artefacto experimental y no como un componente listo para producción.
- Advertencia sobre las fuentes: los resultados de la búsqueda web proporcionados no guardan relación con este modelo (son páginas de un foro sanitario en chino) y no se han utilizado como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akimaru/act_so101_10th
- Dataset de entrenamiento: https://huggingface.co/datasets/akimaru/newhouse
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=akimaru/newhouse
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
