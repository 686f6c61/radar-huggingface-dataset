# CGdigipen/grasp_lever_act_depth

## Resumen

`CGdigipen/grasp_lever_act_depth` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario CGdigipen y está distribuida a través de LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea muy concreta: agarrar la palanca de un lever handle (una maneta) a partir de observaciones visuales y propioceptivas del robot.

La arquitectura es un transformer ACT que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza la ejecución. El modelo tiene 51.671.750 parámetros y consume tres cámaras (HEAD, RIGHT y RIGHT_depth) más el estado del robot de 6 dimensiones, produciendo una acción de 6 dimensiones. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors.

Es relevante como ejemplo de política de imitación lista para desplegar en un robot SO-100/SO-101 (tipo `so_follower`) con LeRobot 0.6.2, y como caso práctico de entrenamiento con datos teleoperados que incluyen profundidad. No obstante, se trata de un modelo de nicho, sin benchmarks publicados ni licencia declarada, orientado a una única tarea y a un hardware específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.750 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con la cadena "grasp the lever handle") |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Cámaras de entrada | `HEAD`, `RIGHT`, `RIGHT_depth` |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Salida de acción | `action` con forma `(6,)` |
| Resolución de imagen | 480x640 (RGB en HEAD y RIGHT; profundidad de 1 canal en RIGHT_depth) |
| Dataset de entrenamiento | CGdigipen/grasp_lever_depth (122 episodios, 86.376 frames, 30 FPS) |
| Pasos de entrenamiento | 80.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las tres cámaras, incluyendo el canal de profundidad) con un transformer que genera secuencias de acciones en lugar de predicciones paso a paso. Esta estrategia de "action chunking" mitiga el problema de la acumulación de errores en tareas de manipulación de horizonte largo y permite movimientos más suaves y coherentes. El modelo consume una observación compuesta por el estado propioceptivo de 6 dimensiones y las imágenes de las cámaras HEAD, RIGHT y RIGHT_depth, y emite una acción de 6 dimensiones que corresponde al control del efector final del robot `so_follower`.

El entrenamiento se realizó sobre el dataset `CGdigipen/grasp_lever_depth`, compuesto por 122 episodios teleoperados y 86.376 frames grabados a 30 FPS, con la única tarea "grasp the lever handle". Se ejecutaron 80.000 pasos con batch size 16, optimizador AdamW y learning rate 1e-05, semilla 1000, usando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones. La inclusión de una cámara de profundidad como entrada es la innovación diferencial respecto a variantes ACT puramente RGB, y puede mejorar la estimación de la geometría de la maneta.

## Capacidades

- Manipulación robótica de una tarea específica: agarrar la maneta de una palanca (grasp the lever handle) con un robot SO-100/SO-101.
- Percepción multimodal: procesa dos cámaras RGB (HEAD y RIGHT) y una cámara de profundidad (RIGHT_depth) a 480x640.
- Fusión de estado propioceptivo de 6 dimensiones con información visual para generar acciones de 6 dimensiones.
- Predicción de chunks de acción, lo que produce trayectorias más estables que la predicción paso a paso.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, ni capacidades multilingües: es una política de control motor, no un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Automatización de agarre de manetas en líneas de montaje: el modelo puede ejecutar la tarea "grasp the lever handle" de forma autónoma sobre un robot SO-100/SO-101 equipado con las tres cámaras requeridas, sustituyendo la teleoperación manual en un puesto repetitivo.
- Base para fine-tuning en tareas de manipulación similares: al estar entrenado con LeRobot 0.6.2, se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio que comparta el esquema de observaciones, aprovechando los 80.000 pasos ya realizados como inicialización.
- Prototipado rápido en investigación de imitación con profundidad: sirve como referencia para comparar el efecto de añadir un canal de profundidad frente a políticas ACT puramente RGB en tareas de agarre.
- Validación de pipelines de despliegue LeRobot: útil para probar el flujo completo `lerobot-rollout` con `--strategy.type=base`, verificar calibración de cámaras y comprobar latencias en hardware real antes de escalar a otras políticas.
- Docencia y demostraciones de aprendizaje por imitación: el reducido tamaño del repositorio (0,2 GB) y los 51,7 M de parámetros permiten ejecutarlo en estaciones de trabajo modestas con GPU consumer para clases o talleres.
- Evaluación de robustez ante variaciones de iluminación y posición de la maneta: al no haber resultados de evaluación publicados, el modelo puede emplearse como banco de pruebas para medir la tasa de éxito en distintas condiciones experimentales.
- Integración en celdas colaborativas con robot de bajo coste: el SO-100/SO-101 es una plataforma económica, y esta política permite dotarla de una habilidad concreta sin desarrollar un controlador a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en safetensors (aproximadamente 200 MB en FP32), la inferencia requiere menos de 1 GB de VRAM adicional para los tensores del modelo; el grueso del consumo proviene de los buffers de las tres cámaras a 480x640.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomienda una RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento o para ejecución con baja latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso podría ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` con `--policy.path=CGdigipen/grasp_lever_act_depth`; el entrenamiento se realiza con `lerobot-train --policy.type=act`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia de control alcanzada en robot real; el dataset se grabó a 30 FPS, pero no se confirma que la política se ejecute a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CGdigipen/grasp_lever_act_depth | ACT con profundidad | 51,7 M | 3 cámaras (2 RGB + 1 depth) + estado (6,) | Agarre de maneta en SO-100/SO-101 | no disponible | Hugging Face (LeRobot) |
| lerobot/act_so100_pick_place | ACT | no disponible | cámaras RGB + estado | Pick and place en SO-100 | no disponible | Hugging Face (LeRobot) |
| lerobot/diffusion_pusht | Diffusion Policy | no disponible | imagen + estado | PushT (2D) | no disponible | Hugging Face (LeRobot) |
| lerobot/act_aloha_sim_insertion | ACT | no disponible | cámaras + estado bimanual | Inserción en simulación ALOHA | no disponible | Hugging Face (LeRobot) |

La comparación es cualitativa: no se dispone de parámetros, licencias ni tasas de éxito de las alternativas en la información proporcionada, y este modelo no publica benchmarks, por lo que no es posible establecer una comparación numérica de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 122 episodios de un único operador y una única tarea, la política puede sobreajustarse a las posiciones, iluminación y objetos vistos en el dataset.
- Riesgo de alucinación: en el contexto de políticas de imitación, se traduce en acciones incorrectas o inseguras cuando la observación se aleja de la distribución de entrenamiento; no hay evaluación que cuantifique este riesgo.
- Limitación de tarea: solo se ha entrenado para "grasp the lever handle"; no generaliza a otras tareas sin reentrenamiento.
- Limitación de hardware: requiere un robot `so_follower` y exactamente las cámaras HEAD, RIGHT y RIGHT_depth con los nombres y resoluciones especificados; cualquier cambio en el esquema de observaciones invalida el modelo.
- Limitación de idioma: no aplica, pero la tarea se especifica con la cadena exacta "grasp the lever handle" en inglés.
- Licencia: no declarada ("More Information Needed"); no se puede asumir uso comercial sin contactar con el autor.
- Ausencia de evaluación: no hay tasas de éxito en robot real, lo que impide estimar su fiabilidad en producción.
- Sin garantías de seguridad: al ser una política de control motor, su uso en entornos con personas requiere validación y barreras de seguridad independientes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso por terceros ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CGdigipen/grasp_lever_act_depth
- Dataset de entrenamiento: https://huggingface.co/datasets/CGdigipen/grasp_lever_depth
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CGdigipen/grasp_lever_depth
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
