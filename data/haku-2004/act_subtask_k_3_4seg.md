# Haku-2004/act_subtask_k_3_4seg

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Este checkpoint concreto, publicado por el usuario Haku-2004 bajo el identificador `act_subtask_k_3_4seg`, es una política entrenada con la librería LeRobot de Hugging Face sobre el dataset `LeRobot_dataset_k_3_4seg`, y está empaquetada en formato `safetensors` con 51.671.174 parámetros (aproximadamente 51,7 millones).

El modelo se distribuye con licencia Apache 2.0, ocupa 0,2 GB en el repositorio y está etiquetado con el pipeline `robotics`. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que mapea observaciones (típicamente imágenes de cámaras y estado de las articulaciones) a secuencias de comandos de control para un robot. Su relevancia es la de un artefacto reproducible de investigación: permite cargar la política directamente con LeRobot, reevaluarla o reentrenarla, y sirve como referencia práctica de un flujo de trabajo de imitación de extremo a extremo.

La información pública disponible es escasa: la model card es la plantilla estándar de LeRobot y no documenta la configuración exacta de entrenamiento, el robot objetivo ni los resultados obtenidos. Los datos que se ofrecen a continuación proceden del repositorio de Hugging Face y del paper de referencia del método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual y decodificador de acciones (ACT, *Action Chunking with Transformers*) |
| Parametros totales | 51.671.174 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; opera sobre ventanas de observación) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/LeRobot_dataset_k_3_4seg |
| Tamano del repositorio | 0,2 GB |
| Descargas | 28 |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un *backbone* de visión (codificador de imágenes, habitualmente ResNet) con un codificador transformer que fusiona las características visuales y el estado propioceptivo del robot, y un decodificador transformer que emite un *chunk* de acciones de longitud fija. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir varios pasos de acción de una vez y agregarlos temporalmente (*temporal ensembling*), lo que suaviza la trayectoria y mitiga el problema de *compounding error* típico de las políticas que predicen un único paso. Además, ACT incorpora un objetivo auxiliar de reconstrucción de imagen (un decodificador CVAE que reconstruye las observaciones) para regularizar el entrenamiento.

El entrenamiento es de imitación supervisada sobre demostraciones de teleoperación, sin refuerzo ni RLHF. En este checkpoint concreto no se especifican el número de episodios, la composición del dataset, la resolución de las cámaras, la frecuencia de control ni la configuración de hiperparámetros; la model card solo indica el dataset de origen y el comando de entrenamiento estándar de LeRobot (`lerobot-train --policy.type=act`). El nombre `k_3_4seg` sugiere una tarea segmentada por subtareas con ventanas de 3 a 4 segundos, pero esta interpretación no está confirmada en la documentación.

## Capacidades

- Generación de comandos de control robótico: predice *chunks* de acciones (posiciones de articulaciones o del efector final) a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Ejecución de tareas de manipulación de horizonte corto y medio (ensamblaje, recogida y colocación, apilado).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y carga desde el Hub.
- Soporte de *temporal ensembling* para suavizar las trayectorias en inferencia.
- No dispone de *tool calling*, razonamiento multi-paso simbólico, capacidades multilingües ni generación de texto.
- No se documentan capacidades de visión de propósito general más allá del codificador visual interno.

## Casos de uso

- **Investigación en aprendizaje por imitación**: cargar la política con `lerobot-record --policy.path=Haku-2004/act_subtask_k_3_4seg` y reproducir la evaluación sobre el robot `so100_follower`, lo que permite comparar variantes de ACT con una línea base ya entrenada.
- **Reproducción de experimentos**: al estar publicada junto al dataset `LeRobot_dataset_k_3_4seg`, sirve para verificar resultados de un *pipeline* de entrenamiento completo y auditar la reproducibilidad del flujo de LeRobot.
- **Prototipado de tareas de manipulación segmentadas**: el nombre del checkpoint sugiere subtareas de 3-4 segundos; puede emplearse como punto de partida para tareas de pick-and-place divididas en fases cortas.
- **Base para *fine-tuning* con nuevos datos**: al ser un checkpoint ACT de ~51,7 M de parámetros y 0,2 GB, se puede reentrenar en una GPU de consumo con un dataset propio de teleoperación sin partir de cero.
- **Docencia y formación en robótica**: ejemplo compacto y ligero para ilustrar el ciclo completo de recogida de datos, entrenamiento y despliegue de una política de imitación.
- **Evaluación comparativa de políticas**: usar este ACT como referencia frente a políticas más recientes (Diffusion Policy, VQ-BeT) en el mismo conjunto de tareas y con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros (el repositorio completo pesa 0,2 GB), más el coste de las activaciones del codificador visual.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente para inferencia y para reentrenamiento con datasets pequeños.
- Cabe holgadamente en GPU de consumo (RTX 3050, RTX 4090, etc.) e incluso en CPU para inferencia de baja frecuencia, aunque no se recomienda para control en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de `--policy.device=cuda`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del hardware, de la resolución de las cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,7 M | Transformer con *action chunking* | *Chunks* de acción de longitud fija (no especificada) | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy | No disponible | Difusión sobre acciones | Predice secuencias de acción | No disponible en esta ficha | Repositorios de investigación |
| VQ-BeT | No disponible | Cuantización vectorial de comportamiento | Secuencias de acción discretizadas | No disponible en esta ficha | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita al enfoque metodológico y a la licencia.

## Limitaciones y advertencias

- La model card no documenta la configuración de entrenamiento, el robot objetivo, la frecuencia de control ni el número de demostraciones, lo que dificulta evaluar su generalización.
- Es una política de imitación específica de una tarea y un entorno; no se espera que funcione fuera de la distribución de datos del dataset `LeRobot_dataset_k_3_4seg`.
- Riesgo de sobreajuste a las condiciones de iluminación, posiciones de cámara y objetos presentes en las demostraciones.
- No hay información sobre sesgos, pero al ser un modelo robótico los sesgos se manifiestan como fallos sistemáticos ante objetos, texturas o configuraciones no vistas.
- No apta para uso comercial directo sin validación: aunque la licencia Apache 2.0 lo permite, la ausencia de métricas de éxito y de documentación de seguridad desaconseja su despliegue en entornos reales sin evaluación propia.
- Solo 28 descargas y 0 *likes* en el momento de la consulta, lo que indica una validación comunitaria mínima.
- No se especifican requisitos de seguridad física para el robot; cualquier despliegue debe incluir límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_subtask_k_3_4seg
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/LeRobot_dataset_k_3_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
