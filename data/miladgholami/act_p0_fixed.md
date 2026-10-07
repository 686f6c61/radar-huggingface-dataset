# miladgholami/act_p0_fixed

## Resumen

act_p0_fixed es una política de robótica entrenada con LeRobot mediante el método ACT (Action Chunking with Transformers), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario miladgholami en HuggingFace y está especializado en una tarea concreta de manipulación asociada al dataset miladgholami/scissor_p0_fixed_50ep, cuyo nombre sugiere un conjunto de unos 50 episodios de demostraciones teleoperadas sobre una tarea con tijeras. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un checkpoint de control motor que consume observaciones (imágenes de cámara y estado del robot) y produce comandos de acción.

El checkpoint tiene 51.668.614 parámetros (unos 51,7 millones), lo que lo sitúa en el rango de los modelos pequeños y perfectamente desplegable en hardware de consumo. Se distribuye en formato safetensors, ocupa 0,2 GB en el repositorio y se publica bajo licencia Apache 2.0. La librería asociada es lerobot, por lo que se entrena y evalúa con las herramientas oficiales de ese ecosistema.

Su relevancia es práctica y de nicho: sirve como ejemplo reproducible de un pipeline completo de imitación (dataset -> entrenamiento con `lerobot-train` -> evaluación con `lerobot-record`) y como punto de partida para hacer fine-tuning en brazos robóticos de bajo coste tipo SO-100/SO-101. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye datos de evaluación, por lo que debe tratarse como un artefacto experimental y no como una política validada en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación basada en transformer con componente generativo tipo CVAE y decodificación por chunks de acción |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT condiciona sobre un horizonte corto de observaciones de cámara y estado del robot, cuya configuración concreta no se documenta en la ficha) |
| Tipos de cuantizacion | no disponible; el repositorio se distribuye en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot; repositorio de 0,2 GB) |

Datos adicionales del repositorio: pipeline declarado `robotics`, dataset asociado `miladgholami/scissor_p0_fixed_50ep`, referencia bibliográfica `arxiv:2304.13705`, fecha de creación 2026-10-06 y fecha de actualización 2026-10-06 según el Hub.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705, orientado a manipulación fina con hardware de bajo coste. La arquitectura combina un transformer con un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, y un cabezal que predice un chunk de acciones futuras en lugar de una única acción por paso. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y suaviza el comportamiento del robot, a costa de requerir una frecuencia de replanificación adecuada.

El entrenamiento es de tipo behavior cloning sobre datos teleoperados. En este caso concreto, el autor indica que la política se ha entrenado y subido al Hub con LeRobot, y el propio identificador del dataset (`scissor_p0_fixed_50ep`) apunta a un conjunto de aproximadamente 50 episodios de una tarea concreta con tijeras. No se especifican en la información disponible el número total de tokens o transiciones, la composición exacta del dataset, la resolución de las cámaras, la frecuencia de control, ni si hubo etapas de refinamiento tipo RLHF o DPO (no aplicables de forma estándar en este tipo de política). Tampoco se documentan innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para un brazo manipulador a partir de observaciones visuales y de estado.
- Ejecución de la tarea específica de entrenamiento: manipulación con tijeras según el dataset `scissor_p0_fixed_50ep`.
- Integración con el ecosistema LeRobot: compatible con `lerobot-train` para reentrenamiento y con `lerobot-record` para inferencia y evaluación episódica.
- Evaluación en robot real: el flujo documentado usa `so100_follower` como tipo de robot, lo que sugiere compatibilidad con brazos SO-100/SO-101.
- Punto de partida para fine-tuning: al ser un checkpoint pequeño, puede reentrenarse con datos propios en una sola GPU.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de agente en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general (captioning, VQA) ni de audio: la visión se usa exclusivamente como entrada de control.
- No se documentan modos especiales (thinking mode, decodificación especulativa, atención lineal ni similares).

## Casos de uso

- Automatización de una tarea de corte concreta: replicar la política entrenada sobre un brazo SO-100 para ejecutar la secuencia de manipulación con tijeras del dataset `scissor_p0_fixed_50ep`, con replanificación por chunks para suavizar el movimiento.
- Fine-tuning en tareas propias: usar el checkpoint como inicialización y reentrenar con `lerobot-train` sobre un dataset propio de demostraciones teleoperadas, reduciendo el tiempo de entrenamiento frente a partir de cero.
- Laboratorio de investigación en imitación: reproducir experimentos de action chunking, comparar el efecto del tamaño de chunk y de la componente CVAE frente a políticas paso a paso.
- Banco de pruebas de pipelines de datos robóticos: validar el formato LeRobot, la teleoperación, la sincronización cámara-estado y el registro de episodios antes de escalar a datasets mayores.
- Docencia y prototipado con hardware de bajo coste: demostrar el ciclo completo teleoperar -> entrenar -> desplegar en un brazo asequible, sin necesidad de clústeres de GPU.
- Evaluación comparativa de políticas: servir como referencia ACT en comparaciones internas frente a otras políticas del ecosistema LeRobot (por ejemplo, políticas basadas en difusión), siempre que se generen datos de evaluación propios, ya que el autor no publica métricas.
- Pruebas de integración de control en tiempo real: medir latencia de inferencia extremo a extremo en el bucle de control con el hardware objetivo antes de Plantear un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye tasas de éxito, número de episodios de evaluación ni comparaciones numéricas en la model card, y el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia pública de rendimiento. El artículo de referencia (arXiv:2304.13705) contiene resultados experimentales propios del método ACT, pero esos números corresponden al trabajo original y no a este checkpoint concreto, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros, el peso en fp32 ocupa aproximadamente 207 MB; en bf16/fp16, unos 104 MB. El consumo real de VRAM es mayor por activaciones, buffers de imagen y el resto del stack de PyTorch, pero se mantiene holgadamente por debajo de 2 GB en configuraciones típicas de una sola cámara.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna es suficiente; una RTX 3060, RTX 4060, RTX 4090 o superiores no tendrán problema. En el extremo profesional, A100 o H100 están sobredimensionadas para inferencia, aunque pueden usarse para entrenamiento con lotes grandes o para paralelizar barridos de hiperparámetros.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con al menos 4 GB de VRAM, e incluso en GPUs integradas recientes con soporte CUDA/ROCm si la latencia lo permite.
- Despliegue: el camino documentado es LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub) sobre PyTorch. No se documentan exportaciones a ONNX, TensorRT ni formatos de inferencia alternativos, y herramientas como vLLM, TGI, llama.cpp u Ollama no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de frecuencia de control, tiempo de inferencia por chunk ni tasa de éxito en el robot objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_p0_fixed (este modelo) | ACT, imitación, tarea única | 51,7 M | no aplica | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Otras políticas ACT publicadas en el Hub con LeRobot | ACT, imitación | no disponible | no aplica | no disponible | variable según autor | HuggingFace |
| Políticas basadas en difusión del ecosistema LeRobot (por ejemplo, Diffusion Policy) | imitación generativa | no disponible | no aplica | no disponible | no disponible | repositorios de LeRobot |
| Políticas VLA pequeñas (por ejemplo, SmolVLA) | vision-language-action | no disponible | no disponible | no disponible | no disponible | HuggingFace / LeRobot |

No se dispone, en la información proporcionada, de datos verificables de parámetros, contexto, rendimiento ni licencia de las alternativas, por lo que la comparación cuantitativa queda como no disponible. La diferencia cualitativa principal es que act_p0_fixed es un checkpoint especializado en una única tarea y de tamaño muy reducido, mientras que las alternativas VLA incorporan instrucciones en lenguaje natural y generalizan a múltiples tareas a cambio de mucho más cómputo.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (manipulación con tijeras según el dataset asociado) y no generaliza a otras tareas sin reentrenamiento.
- Sin validación pública: no hay métricas de tasa de éxito, ni vídeos, ni episodios de evaluación publicados; 0 descargas y 0 likes implican ausencia de revisión por terceros.
- Riesgo de sobreajuste al entorno de demostración: cambios en iluminación, posición de cámara, fondo, tipo de objeto o calibración del robot pueden degradar drásticamente el comportamiento, algo característico del behavior cloning con datasets pequeños.
- Sesgos del dataset: al provenir de teleoperación humana, la política hereda los sesgos y las limitaciones de las demostraciones (velocidad, trayectorias, alcance), y no se documenta ninguna mitigación.
- Alucinación en sentido estricto no aplica (no genera texto), pero sí existe el riesgo equivalente de generar acciones plausibles pero incorrectas ante observaciones fuera de distribución.
- Idiomas: no aplica, no procesa lenguaje natural ni instrucciones habladas o escritas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento; cualquier uso en producción exige validación propia y medidas de seguridad física en el robot.
- Seguridad física: un fallo de la política puede provocar colisiones o movimientos peligrosos; es imprescindible operar con paradas de emergencia, límites de par y supervisión humana durante la evaluación.
- Restricciones técnicas del ecosistema: el checkpoint depende de la librería LeRobot y de su formato; no se documentan exportaciones a otros runtimes, lo que limita la portabilidad a sistemas embebidos.
- Fecha de creación registrada como 2026-10-06 en el Hub, posterior a la fecha habitual de consulta; conviene verificar la vigencia y procedencia del artefacto antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miladgholami/act_p0_fixed
- Dataset de entrenamiento: https://huggingface.co/datasets/miladgholami/scissor_p0_fixed_50ep
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
