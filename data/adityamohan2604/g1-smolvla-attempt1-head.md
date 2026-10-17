# adityamohan2604/g1-smolvla-attempt1-head

## Resumen

`g1-smolvla-attempt1-head` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario adityamohan2604 en Hugging Face bajo la librería LeRobot. Se trata de un ajuste fino de SmolVLA, el VLA compacto y eficiente desarrollado por Hugging Face que se apoya en un modelo de visión-lenguaje preentrenado y añade un experto de acción para control robótico. El modelo está especializado en una tarea concreta de manipulación sobre el humanoide Unitree G1 equipado con la mano Dex3-1, simulada en MuJoCo: coger un bloque azul y colocarlo sobre una estrella azul.

El checkpoint corresponde al intento 1 de una iteración de aprendizaje por refuerzo (RL iteration 2) y utiliza únicamente la cámara de cabeza como entrada visual. Según la model card, alcanza un 45 % de éxito sobre 60 poses de bloque no vistas durante el entrenamiento, una métrica de generalización espacial dentro de su tarea específica. Con 450.046.176 parámetros totales (~450 M), es un modelo pequeño que puede desplegarse en hardware de consumo, en línea con la filosofía de SmolVLA.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de ajuste fino de un VLA base mediante RL para una tarea de manipulación humanoide; por otro, ilustra el flujo de trabajo de LeRobot para entrenar, evaluar y publicar políticas robóticas de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; backbone de vision-lenguaje preentrenado mas experto de accion |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; sin cuantizaciones oficiales publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLA, un VLA compacto que parte de un modelo de visión-lenguaje preentrenado y lo adapta a control robótico, incorporando un experto de acción que genera comandos motores de forma continua. En concreto, este checkpoint es un ajuste fino del VLA base para una tarea de manipulación sobre el humanoide Unitree G1 con mano Dex3-1, ejecutada en el simulador MuJoCo. La entrada visual se limita a la cámara de cabeza (head-camera-only), tal como indica el autor.

A nivel de entrenamiento, la model card indica que corresponde al "intento 1" de una segunda iteración de RL, sin detallar el número de tokens vistos, la composición del dataset de demostraciones ni si se emplearon técnicas concretas de alineamiento como RLHF o DPO. Tampoco se especifican los hiperparámetros del ajuste fino ni el volumen de episodios utilizados. El único dato cuantitativo publicado es el resultado de evaluación: un 45 % de éxito sobre 60 poses de bloque no vistas. El código, la evaluación y las instrucciones se encuentran en el repositorio de GitHub del autor.

## Capacidades

- Control robótico de manipulación: genera acciones motrices para el brazo y la mano Dex3-1 del humanoide Unitree G1 en MuJoCo.
- Ejecución de tarea específica: recoger un bloque azul y depositarlo sobre una estrella azul (pick-and-place guiado por objetivo visual).
- Percepción visual desde cámara de cabeza: utiliza exclusivamente la vista de la cámara de cabeza como entrada visual.
- Condicionamiento por instrucción en lenguaje natural: al estar basado en SmolVLA, la arquitectura admite condicionamiento por lenguaje, aunque la model card no confirma el conjunto de instrucciones concretas usadas en este ajuste.
- Generalización espacial limitada dentro de la tarea: 45 % de éxito sobre 60 poses de bloque no vistas.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje general).
- Soporte de agentes y razonamiento multi-paso: no aplicable en el sentido de LLM; la política sí resuelve una secuencia motora multi-paso dentro de la tarea.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode) o capacidades de audio: no disponibles.

## Casos de uso

- Investigación en manipulación humanoide: reproducir y evaluar en MuJoCo una política pick-and-place sobre el Unitree G1, usando el modelo como línea base para comparar iteraciones de RL.
- Aprendizaje por refuerzo sobre VLA: emplear el checkpoint como punto de partida para nuevas iteraciones de RL y medir mejoras sobre el 45 % de éxito declarado en 60 poses no vistas.
- Generación de datos sintéticos y currículos de entrenamiento: usar la política en simulación para producir trayectorias y evaluar la robustez frente a variaciones de pose del objeto.
- Benchmark de generalización espacial: cuantificar la degradación del rendimiento al alejar el bloque de las poses vistas, útil para estudiar la cobertura del dataset de demostraciones.
- Transferencia sim-a-real (sim-to-real): el modelo entrena y se evalúa en MuJoCo, por lo que sirve como candidato para estudiar la brecha de simulación a realidad en humanoides con mano diestra.
- Docencia y prototipado con LeRobot: ejemplo práctico de ajuste fino y publicación de políticas VLA con la librería LeRobot, replicable en un único equipo con GPU de consumo.
- Estudio de ablaciones de entrada sensorial: al ser un modelo solo con cámara de cabeza, permite comparar contra variantes con más cámaras y medir el impacto en la tasa de éxito.

## Benchmarks y rendimiento

| Benchmark | Descripcion | Resultado |
|---|---|---|
| Tasa de exito en 60 poses de bloque no vistas | Evaluacion de la tarea pick-and-place sobre Unitree G1 + Dex3-1 en MuJoCo | 45 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de accion robótica y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los ~450 M de parámetros ocupan aproximadamente 0,9 GB de pesos (coincide con el tamaño del repo de 0,9 GB); en fp32 serían unos 1,8 GB. Sumando buffers y activaciones, cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para la política; para entrenamiento o evaluación con MuJoCo se recomienda una RTX 3060/4070 o superior. No se requieren A100/H100.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en GPUs integradas modestas para inferencia.
- Opciones de despliegue: LeRobot (librería principal del modelo), PyTorch; evaluación en el simulador MuJoCo. El ecosistema SmolVLA menciona despliegue en hardware de consumo y documentación de inferencia asíncrona en la documentación de LeRobot.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Otros recursos: se requiere el entorno de simulación MuJoCo con el modelo del Unitree G1 y la mano Dex3-1 para evaluar la tarea tal como se describe.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-smolvla-attempt1-head | ~450 M | Manipulacion pick-and-place en Unitree G1 + Dex3-1 (MuJoCo) | no disponible | no disponible | Hugging Face, 0 descargas |
| lerobot/smolvla_base | ~450 M | VLA general para robotica, ajustable a tareas | no disponible | no disponible | Hugging Face (modelo base oficial) |
| AdithyaRajendran/so101_smolvla_policy_FINAL_v4 | no disponible | Politica SmolVLA para brazo SO-101 | no disponible | no disponible | Hugging Face |

La comparación directa de rendimiento no es posible porque los modelos comparables no publican métricas en la información disponible y operan sobre plataformas robóticas distintas (SO-101 frente a Unitree G1). El modelo base `lerobot/smolvla_base` es la referencia natural, ya que este checkpoint deriva de la familia SmolVLA.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para una única tarea (coger bloque azul y ponerlo sobre estrella azul) y un único entorno simulado (MuJoCo con Unitree G1 y Dex3-1); no es un modelo general.
- Rendimiento limitado: 45 % de éxito sobre 60 poses no vistas implica que falla en más de la mitad de los intentos en condiciones de generalización espacial.
- Entrada visual restringida: solo cámara de cabeza, lo que puede reducir la precisión frente a configuraciones multicámara y limita la percepción de zonas ocluidas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; el riesgo equivalente es la generación de acciones inválidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia no especificada: al no declararse licencia, no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Estado experimental: se trata de un "intento 1" de una iteración de RL, con 0 descargas y 0 likes, sin validación externa ni revisión por pares.
- Brecha sim-a-real: no hay evidencia de transferencia a hardware físico; el resultado es únicamente en simulación.
- Reproducibilidad: depende de código externo en GitHub y del simulador MuJoCo, sin garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityamohan2604/g1-smolvla-attempt1-head
- Codigo, evaluacion e instrucciones (GitHub): https://github.com/Adityamohan260498/RL-Finetuned-VLA-Humanod-Manipulation
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- PDF del paper SmolVLA: https://arxiv.org/pdf/2506.01844
- Resumen del paper en papers.cool: https://papers.cool/arxiv/2506.01844
- Ejemplo de politica SmolVLA para SO-101: https://huggingface.co/AdithyaRajendran/so101_smolvla_policy_FINAL_v4
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
