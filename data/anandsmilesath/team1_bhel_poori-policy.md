# anandsmilesath/Team1_Bhel_Poori-Policy

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política visuomotora de imitación para brazos robóticos, entrenada con la librería LeRobot de Hugging Face y arquitectura ACT (Action Chunking with Transformers). El autor es el usuario de Hugging Face `anandsmilesath` y el checkpoint se ha entrenado sobre el dataset `anandsmilesath/Team1_Bhel_Poori-Dataset`, que no está documentado en la información disponible. El nombre sugiere un proyecto de equipo ("Team1 Bhel Poori"), probablemente en el contexto de un taller o hackathon de robótica, aunque esto no se confirma en la model card.

El modelo resuelve el problema clásico de control manipulativo: dada una observación (imágenes de cámara y estado de las articulaciones), predecir la siguiente secuencia de acciones del robot. ACT aborda esto prediciendo *chunks* de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y permite un control más suave a partir de demostraciones teleoperadas. Con 51,6 millones de parámetros y un repositorio de 0,2 GB, es un modelo ligero, ejecutable en hardware de consumo e incluso en CPU.

Su relevancia práctica es limitada y muy específica: es un artefacto de investigación reproducible con licencia Apache-2.0, útil como referencia del flujo de entrenamiento de LeRobot o como base para reentrenar sobre un dataset propio. No se han publicado métricas de éxito, número de episodios de entrenamiento ni detalles del robot objetivo, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder CVAE y extractor visual convolucional (ResNet), sobre LeRobot |
| Parametros totales | 51.617.414 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje: ACT opera sobre una ventana fija de observaciones y emite un chunk de acciones; los valores de `chunk_size` y `n_obs_steps` de este checkpoint no se detallan en la model card |
| Tipos de cuantizacion | Solo pesos en safetensors; por el tamano del repo (0,2 GB) se deduce fp32 (unos 206 MB para 51,6 M de parametros). No se publican variantes cuantizadas (int8, GGUF, etc.) |
| Idiomas soportados | No aplica: la politica no procesa lenguaje ni texto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato de policy de LeRobot, cargable con `--policy.path`) |

## Arquitectura y entrenamiento

ACT se describe en el articulo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). Es un método de aprendizaje por imitación con un esquema de autoencoder variacional condicional (CVAE): un encoder consume la secuencia de acciones de la demostración junto con las observaciones para producir una variable latente de estilo, y un decoder transformer predice un chunk de acciones futuras condicionado a esa latente y a las observaciones actuales. La parte perceptiva se apoya en un backbone convolucional tipo ResNet que procesa las imágenes de las cámaras. En inferencia se aplica habitualmente *temporal ensembling*, promediando predicciones solapadas de chunks consecutivos para suavizar la trayectoria.

Sobre el entrenamiento de este checkpoint concreto no hay datos publicados: se desconoce el número de episodios, el número de frames, la composición de las tareas del dataset `Team1_Bhel_Poori-Dataset`, la resolución de las cámaras, la configuración del robot (la model card menciona `so100_follower` en el ejemplo de evaluación, pero no confirma que sea el robot de entrenamiento) ni los hiperparámetros usados. No se emplean técnicas de alineación tipo RLHF o DPO, que no tienen sentido en este dominio. El pipeline de entrenamiento es el estándar de LeRobot: `lerobot-train --policy.type=act`.

## Capacidades

- Control visuomotor por imitación: genera secuencias de acciones articulares a partir de imágenes de cámara y del estado de las articulaciones.
- Predicción por chunks: emite varios pasos de acción de golpe, lo que mejora la consistencia temporal frente a políticas paso a paso.
- Ejecución sobre un brazo tipo SO-100/SO-101 mediante el comando `lerobot-record` con `--robot.type=so100_follower`.
- Tarea única: la política está especializada en la tarea o tareas presentes en su dataset de entrenamiento; no es un modelo multi-tarea ni generalista.
- Soporte de *tool calling* / *function calling*: no.
- Soporte de agentes o razonamiento multi-paso simbólico: no.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo *thinking*, visión general, audio, generación de texto): no. La visión se usa exclusivamente como entrada de control, no hay comprensión semántica de la escena.
- Evaluación reproducible: puede puntuarse con `lerobot-record` generando un dataset `eval_*` y contando episodios correctos.

## Casos de uso

- **Reproducción del pipeline de LeRobot**: sirve como ejemplo funcional de un entrenamiento ACT completo (dataset + política + comandos), útil para un equipo que quiera validar su instalación antes de entrenar su propio modelo con datos propios.
- **Automatización de una tarea de pick-and-place concreta**: si el despliegue usa el mismo robot, cámaras y objetos que el dataset de entrenamiento, la política puede ejecutar la manipulación de forma autónoma en bucle cerrado, que es exactamente el régimen para el que se entrena ACT.
- **Línea base en experimentos de imitación**: punto de partida cuantitativo para comparar contra Diffusion Policy, VQ-BeT o un ACT reentrenado con más datos; al ser Apache-2.0 y 51,6 M de parámetros, el coste de reentrenamiento y comparación es bajo.
- **Distilación o inicialización de políticas mayores**: los pesos pueden servir de inicialización o de profesor para un modelo más grande o para un esquema de *action chunking* con más sensores.
- **Docencia y talleres de robótica de bajo coste**: el tamaño (0,2 GB, ejecutable en CPU) permite desplegarlo en aulas con portátiles o Raspberry Pi y Jetson, sin clústeres de GPU.
- **Pruebas de integración en un stack ROS 2 / LeRobot**: validar latencias, frecuencia de control, calibración de cámaras y lógica de parada de emergencia antes de invertir en un modelo propio.
- **Recolector de datos asistido**: usar la política para teleoperar parcialmente y corregir con intervenciones humanas, generando nuevos episodios que amplíen el dataset original (DAgger ligero).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, error de posición articular ni comparaciones con otras políticas. Tampoco se documenta la tasa de éxito del dataset de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp32, incluyendo pesos (unos 206 MB) y activaciones del backbone visual con una o varias cámaras. Estimación, no medida publicada.
- Cabe en cualquier GPU de consumo: RTX 3060/4060 en adelante van sobradas; una RTX 4090 o una A100 quedan enormemente infrautilizadas para inferencia (solo tendrían sentido para reentrenar).
- Ejecutable en CPU y en placas embebidas: Jetson Orin Nano/NX o Raspberry Pi 5 son viables para inferencia a baja frecuencia, aunque la latencia real no está publicada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo. No aplica vLLM, TGI, llama.cpp ni Ollama, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles. ACT se diseña para control en tiempo real, pero la frecuencia alcanzable depende de la GPU, la resolución de cámara y el tamaño del chunk, ninguno de los cuales se documenta aquí.
- Almacenamiento: 0,2 GB de repositorio, trivial para cualquier máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (este checkpoint) | 51,6 M | Imitacion con CVAE + transformer y chunks de accion | Apache-2.0 | Hugging Face Hub; 0 descargas y sin evaluacion publica |
| ACT (implementacion de referencia en LeRobot) | Similar (depende de la configuracion de camaras y dimensiones) | Igual que la anterior | Apache-2.0 | Disponible como `policy.type=act` en LeRobot |
| Diffusion Policy | No disponible (varia con la implementacion) | Difusion sobre acciones, U-Net o transformer | MIT segun el repositorio original (no verificado aqui) | Implementacion publica; integrada tambien en LeRobot |
| VQ-BeT | No disponible | Discretizacion vectorial + transformer autorregresivo | No disponible | Implementacion publica; integrada en LeRobot |
| SmolVLA | ~450 M (segun su model card) | VLA: VLM + flow matching, acepta instrucciones en lenguaje | Apache-2.0 | Hugging Face Hub |

Diferencias clave: ACT es la opcion mas ligera y barata de entrenar del grupo, pero es estrictamente mono-tarea y no entiende lenguaje. Diffusion Policy suele requerir mas pasos de inferencia por la naturaleza iterativa del muestreo. VQ-BeT discretiza acciones y puede modelar multimodalidad, a costa de una tokenizacion adicional. SmolVLA es dos ordenes de magnitud mayor y aporta condicionamiento por lenguaje e instrucciones, a cambio de mucho mas hardware y datos.

## Limitaciones y advertencias

- Especializacion extrema: la política solo es válida para la tarea, los objetos, la iluminación y la disposición de cámaras del dataset de entrenamiento. Cualquier cambio de escena puede degradar el comportamiento sin aviso.
- Sin métricas publicadas: no hay tasa de éxito ni evaluación, y el repositorio tiene 0 descargas y 0 valoraciones. No hay evidencia de que el entrenamiento haya convergido a una política útil.
- Dataset opaco: la model card no documenta número de episodios, tareas, robot ni resolución. Es imposible estimar la calidad de los datos de partida.
- Sesgos de datos: al ser aprendizaje por imitación, reproduce los sesgos del operador humano (trayectorias, velocidades, posiciones preferidas) y falla de forma sistemática ante situaciones no vistas (*covariate shift*).
- Riesgo de alucinación: el concepto no aplica, pero el equivalente es la generación de acciones plausibles y peligrosas ante entradas fuera de distribución. No hay capa de seguridad, verificación cinemática ni límites articulares garantizados por el modelo.
- Seguridad física: requiere parada de emergencia, límites de par y supervisión humana durante el despliegue; nunca debe operar sin barreras en un entorno con personas.
- Idioma y contexto: no procesa texto, por lo que no puede recibir instrucciones en lenguaje natural ni razonar sobre la tarea.
- Licencia: los pesos son Apache-2.0 y permiten uso comercial, pero la licencia del dataset `Team1_Bhel_Poori-Dataset` no se ha verificado y podría imponer restricciones adicionales sobre modelos derivados.
- Reproducibilidad: sin semilla, configuración ni hiperparámetros documentados, replicar el resultado exacto no es posible.
- Mantenimiento: creado y actualizado el mismo día (17 de octubre de 2026), sin histórico de versiones ni issues; no hay garantía de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anandsmilesath/Team1_Bhel_Poori-Policy
- Dataset de entrenamiento: https://huggingface.co/datasets/anandsmilesath/Team1_Bhel_Poori-Dataset
- Articulo ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
