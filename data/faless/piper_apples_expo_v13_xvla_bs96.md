# Faless/piper_apples_expo_v13_xvla_bs96

## Resumen

Faless/piper_apples_expo_v13_xvla_bs96 es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario Faless y entrenada con LeRobot. Es un ajuste fino del modelo base lerobot/xvla-base, que implementa el marco X-VLA (arXiv:2510.10274): un transformer con flow matching y soft prompts aprendibles que codifican cada configuración de robot o hardware como una "tarea" independiente. El checkpoint tiene 879.687.256 parámetros (unos 880 M) y el repositorio ocupa 1,8 GB en formato safetensors.

El modelo resuelve una tarea concreta de manipulación sobre un robot de tipo `piper_full`: "Pick the red apples one by one and place them into the green basket". Consume tres flujos visuales (dos a 256x256 y uno a 224x224) más un vector de estado propioceptivo de 8 dimensiones, y devuelve un vector de acción de 7 dimensiones.

Su interés práctico es doble. Por un lado, documenta un ciclo completo de aprendizaje por imitación end-to-end sobre 779 episodios y 1.198.317 frames a 30 FPS, con una configuración de entrenamiento reproducible (55.000 pasos, batch 96, learning rate 1e-4, LeRobot 0.6.2). Por otro, es un ejemplo de política VLA por debajo de los 1.000 M de parámetros, lo que la sitúa en el rango de despliegue en GPU de consumo, con licencia Apache 2.0 y sin resultados de evaluación publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Vision-Language-Action con flow matching y soft prompts (marco X-VLA); modelo base lerobot/xvla-base |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo conversacional; la entrada es una ventana fija de 3 imagenes y un estado de 8 dimensiones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no es un modelo generativo de lenguaje; la unica cadena de texto es la instruccion de tarea, en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.image3` (3, 224, 224), `observation.state` (8,) |
| Salidas | `action` (7,) |
| Tipo de robot | piper_full |
| Camaras declaradas | ego, front |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un marco VLA de tipo soft-prompted con flow matching. La idea central es tratar cada robot o configuración de hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles, de forma que un único modelo pueda reconciliar morfologías, sensores y espacios de acción distintos. En este checkpoint, el soft prompt queda fijado al robot `piper_full` con tres cámaras, un vector de estado de 8 dimensiones y un espacio de acción de 7 dimensiones. El detalle interno del backbone de visión-lenguaje (número de capas, encoder visual concreto, dimensión oculta) no se especifica en la información disponible.

El ajuste fino se realizó sobre el dataset Faless/piper_apples_expo_v13: 779 episodios, 1.198.317 frames a 30 FPS, con una única tarea de manipulación ("Pick the red apples one by one and place them into the green basket"). La configuración de entrenamiento reportada es de 55.000 pasos, batch size 96, optimizador `xvla-adamw`, learning rate 0,0001 y semilla 1000, sobre LeRobot 0.6.2. La información disponible no detalla la composición completa del dataset (número de objetos, variaciones de iluminación, posiciones), ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias, algo poco habitual en políticas de imitación robótica.

## Capacidades

- Control visuomotor de un brazo robótico `piper_full` mediante imitación: genera comandos de acción de 7 grados de libertad a partir de observaciones visuales y propioceptivas.
- Fusión de tres vistas de cámara simultáneas (dos a 256x256 y una a 224x224), lo que permite cierta tolerancia a oclusiones parciales al disponer de perspectivas redundantes.
- Condicionamiento por instrucción de tarea en lenguaje natural (`--task="Pick the red apples one by one and place them into the green basket"`), aunque el modelo está especializado en esa única tarea.
- Integración de estado propioceptivo de 8 dimensiones junto con la información visual.
- Generación de acciones por flow matching, lo que implica una distribución multimodal de trayectorias en lugar de una regresión determinista.
- Soporte de arquitectura cross-embodiment mediante soft prompts heredados del modelo base X-VLA.
- Compatibilidad nativa con el ecosistema LeRobot: entrenamiento (`lerobot-train`), despliegue (`lerobot-rollout`) y visualización de datasets.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, generación de texto libre, matemáticas, código ni visión generalista fuera del bucle de control robótico.

## Casos de uso

- Recogida y depósito de objetos en línea de laboratorio: es la tarea entrenada de forma literal (coger manzanas rojas una a una y dejarlas en una cesta verde). Se desplegaría con `lerobot-rollout --strategy.type=base --robot.type=piper_full --policy.path=Faless/piper_apples_expo_v13_xvla_bs96` sobre el brazo Piper y las tres cámaras usadas en el entrenamiento.
- Punto de partida para ajustes finos con datos propios: el checkpoint se puede reentrenar con `lerobot-train --policy.path=Faless/piper_apples_expo_v13_xvla_bs96` (o directamente desde `lerobot/xvla-base`) sobre un dataset nuevo, aprovechando que el soft prompt ya está alineado con la morfología `piper_full`.
- Evaluación comparativa de políticas de manipulación: sirve como referencia de 880 M de parámetros frente a políticas de mayor tamaño en el mismo banco de pruebas físico, midiendo tasa de éxito, tiempo por ciclo y robustez ante cambios de posición de objetos.
- Demostraciones en ferias y eventos (el nombre del dataset incluye "expo"): ejecuciones cortas con `--duration=60` que no registran episodios y permiten mostrar el comportamiento de la política en un puesto de exhibición.
- Replicación en un segundo robot de la misma familia: si se dispone de otro `piper_full` con idéntica disposición de cámaras, la política puede ejecutarse sin reentrenamiento, siempre que los nombres de cámara coincidan con las claves de observación del entrenamiento.
- Generación de datos iniciales para nuevas tareas: usar la política como controlador base para recopilar trayectorias que después se filtren y etiqueten manualmente antes de un nuevo ciclo de imitación.
- Investigación en flow matching aplicado a robótica: analizar la distribución de acciones generada por los pasos de integración del flow matching y su efecto sobre la suavidad de las trayectorias.
- Auditoría de calidad del dataset de origen: el repositorio enlaza el visualizador de datasets de LeRobot, útil para inspeccionar los 779 episodios y detectar sesgos de posición o iluminación antes de reutilizar los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la línea "No evaluation results have been provided for this policy yet", de modo que no hay tasa de éxito, número de ensayos ni condiciones de prueba para la tarea entrenada.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 1,76 GB en fp16/bf16 y unos 3,5 GB en fp32 para los 879,7 M de parámetros. Con activaciones de tres imágenes (dos a 256x256 y una a 224x224), estado de 8 dimensiones y los pasos de integración del flow matching, una estimación prudente de inferencia en batch 1 es de 3 a 6 GB de VRAM en fp16.
- Cabe en GPU de consumo: sí. Modelos con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) tienen margen suficiente. En GPUs de 4-6 GB la ejecución en fp16 sería ajustada; en fp32 sería inviable en la mayoría de ellas.
- GPU de centro de datos: A100, H100, L40S o L4 están sobredimensionadas para inferencia, pero son razonables para reentrenar con batch 96 y 55.000 pasos como en la configuración original.
- Despliegue: las vías soportadas son las herramientas de LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento) sobre PyTorch con dispositivo `cuda`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. Al tratarse de una política de control a 30 FPS (el dataset se grabó a esa frecuencia), el bucle de inferencia debe sostener esa cadencia o compensarla con interpolación de acciones; no se han publicado mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Faless/piper_apples_expo_v13_xvla_bs96 | ~880 M | 3 imagenes + estado (8,) -> accion (7,) | apache-2.0 | Hugging Face, via LeRobot |
| lerobot/xvla-base (modelo base) | no disponible | multimodal, segun configuracion | apache-2.0 (segun repositorio base) | Hugging Face, via LeRobot |
| SmolVLA (Hugging Face) | ~450 M | imagenes + estado + instruccion en lenguaje natural | apache-2.0 | Hugging Face, via LeRobot |
| GR00T N1 (NVIDIA) | ~2 B en el modulo VLM, mas modulo de difusion | imagenes + instruccion | NVIDIA Open Model License | Hugging Face |
| OpenVLA | ~7 B | una imagen + instruccion | derivada de Llama 2 (consultar terminos) | Hugging Face |

La comparación se basa en información pública de cada modelo, no en la ficha proporcionada, y puede variar entre revisiones. La diferencia principal de este checkpoint frente a las alternativas generalistas es su especialización: un único robot, una única tarea y tres cámaras fijas, a cambio de un tamaño reducido y de un despliegue sencillo en hardware de consumo.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real, la tolerancia a perturbaciones y el comportamiento fuera de las condiciones de entrenamiento.
- Sesgos de datos no caracterizados: el dataset de 779 episodios corresponde a una tarea y a un entorno concretos. Posiciones de objetos, iluminación, fondo y tipo de manzana pueden inducir sesgos de distribución que degraden el rendimiento.
- Riesgo de sobreajuste a la configuración de cámaras: la política espera exactamente tres entradas visuales con las claves `observation.images.image`, `observation.images.image2` y `observation.images.image3`. Cambiar nombres, resoluciones o número de cámaras romperá la inferencia.
- Especialización extrema: no generaliza a otras tareas sin reentrenamiento. No es un modelo de propósito general ni admite instrucciones arbitrarias en lenguaje natural.
- Dependencia de la morfología: el soft prompt está fijado a `piper_full`. Usarlo en otro robot requeriría ajuste, y podría producirse olvido catastrófico al reentrenar sobre un único dataset.
- Alucinación: en el sentido de generación de contenido falso no aplica, pero sí existe el riesgo equivalente de generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin señal de incertidumbre calibrada.
- Idiomas: la instrucción de tarea está en inglés y no se ha documentado soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se distribuye sin garantías. Debe verificarse además la licencia del dataset `Faless/piper_apples_expo_v13` si se reutilizan los datos.
- Seguridad física: es una política de control robótico sin capas de seguridad documentadas. En producción es imprescindible añadir límites de par, paradas de emergencia y supervisión humana, y validar el comportamiento antes de operar cerca de personas.
- Repositorio sin métricas de comunidad (0 descargas, 0 likes) y con fecha de creación reciente: no hay evidencia externa de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_expo_v13_xvla_bs96
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_expo_v13
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv:2510.10274)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_expo_v13
