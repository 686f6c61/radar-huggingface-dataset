# open-gigaai/GigaBrain-0.7-3.5B-Base

## Resumen

GigaBrain-0.7 es una familia de modelos fundacionales para robótica (embodied AI) desarrollada por el equipo GigaAI, que unifica visión, lenguaje y acción en una única arquitectura. El modelo presentado, GigaBrain-0.7-3.5B-Base, es la variante base de 3.500 millones de parámetros (aunque el conteo real de parámetros es de 4.121.726.448) y está diseñado para tareas de visión-lenguaje-acción (VLA): interpretar instrucciones en lenguaje natural, comprender escenas visuales y generar comandos de control para robots. Se publica con licencia Apache 2.0 y está pensado para ser usado en investigación y desarrollo de sistemas robóticos.

El modelo introduce una arquitectura de tres sistemas que coordina comprensión y planificación, predicción y evaluación, y acción y control. Se preentrenó con más de 37.000 horas de datos heterogéneos de robots reales y simulados, y emplea un entrenamiento de alineación en una sola etapa que optimiza conjuntamente la comprensión visión-lenguaje y la generación de acciones multi-embodiment. Según sus autores, supera a modelos previos como π0.5 y a la serie GigaBrain-0 en tareas de seguimiento de instrucciones y éxito en tareas de post-entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención por grupos (GQA), 26 capas, hidden size 2.304, 8 query heads y 4 key/value heads |
| Parametros totales | 4.121.726.448 (4.12 B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GigaBrain-0.7 adopta una arquitectura de tres sistemas integrados: un sistema de comprensión y planificación (visión-lenguaje), un sistema de predicción y evaluación (modelo de mundo) y un sistema de acción y control (generación de comandos de bajo nivel). La implementación concreta utiliza un transformer con atención condicional de grupos (GQA) con 26 capas, hidden size de 2.304 y 8 cabezas de consulta con 4 cabezas de clave/valor, lo que reduce el coste de memoria durante la generación de secuencias largas de acciones.

El entrenamiento se realizó en una sola fase de alineación conjunta sobre un conjunto de datos heterogéneo que incluye más de 37.000 horas de experiencia de robot (real y simulada), abarcando múltiples plataformas robóticas. A diferencia de enfoques de dos etapas (primero preentrenar visión-lenguaje y luego adaptar a acción), GigaBrain-0.7 optimiza simultáneamente la comprensión del lenguaje y la generación de acciones, lo que mejora la generalización a nuevas tareas y embodiments. El modelo se publica como base, sin ajuste fino para tareas específicas, y se espera que los usuarios lo adapten mediante fine-tuning con datos propios.

## Capacidades

- Generación de acciones de control para robots (movimiento, manipulación, navegación) a partir de instrucciones en lenguaje natural y observaciones visuales.
- Comprensión de escenas visuales y razonamiento espacial para planificar trayectorias.
- Seguimiento de instrucciones de múltiples pasos en tareas de largo horizonte.
- Generalización entre distintos tipos de robots (multi-embodiment), gracias al entrenamiento con datos heterogéneos.
- Capacidad de predicción de resultados futuros (modelo de mundo) para evaluar y corregir acciones.
- Soporte de interacción en inglés para instrucciones verbales.
- No se documenta soporte de tool calling ni agentes autónomos, ya que está orientado a control directo de hardware.

## Casos de uso

- Manipulación robótica en entornos domésticos: el robot puede recibir instrucciones como "coge la taza roja y ponla en el lavavajillas" y ejecutar la secuencia completa, utilizando la visión para localizar objetos y la planificación para la trayectoria.
- Automatización industrial de tareas de ensamblaje: el modelo se puede integrar en celdas de fabricación para guiar a brazos robóticos en operaciones de ensamblaje o inspección visual, reduciendo la necesidad de programación específica.
- Navegación de robots móviles en entornos no estructurados: a partir de instrucciones en lenguaje natural ("ve a la sala de reuniones y espera"), el robot genera comandos de movimiento y evita obstáculos.
- Aprendizaje por imitación con datos de demostración: los usuarios pueden recopilar trayectorias de demostración y ajustar el modelo (fine-tuning) para tareas específicas, aprovechando la capacidad de adaptación a múltiples embodiments.
- Simulación y entrenamiento de robots en entornos virtuales: el modelo se puede desplegar en simuladores (por ejemplo, MuJoCo o Isaac) para generar políticas de control y validar comportamientos antes de la implementación física.
- Investigación en modelos de mundo y planificación: al incluir un sistema de predicción, se puede usar como componente de un sistema de control predictivo para tareas de largo horizonte, donde se simulan consecuencias de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras sobre π0.5 y la serie GigaBrain-0 en cero-shot y éxito de tareas, pero no se aportan cifras concretas en la documentación proporcionada.

## Requisitos de hardware

- Tamaño del repositorio: 33,0 GB, lo que sugiere que los pesos están en alta precisión (posiblemente FP32) o con varios checkpoints.
- Con 4.121 millones de parámetros, la inferencia en FP32 requiere aproximadamente 16 GB de VRAM solo para pesos; en FP16 o BF16 se reduce a ~8 GB. En cuantización de 8 bits (no publicada oficialmente) se podría ejecutar en GPU con 6-8 GB, pero no se ofrecen archivos GGUF ni AWQ.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para inferencia en FP16 sin cuantización; para entrenamiento o fine-tuning se necesitan GPUs de 40 GB o más (A100, H100) o uso de gradient checkpointing.
- Se puede desplegar con frameworks de inferencia estándar para transformers (por ejemplo, vLLM o TGI) si se adapta el modelo a un formato de secuencia a secuencia, aunque el pipeline está orientado a robótica y requiere integración con el entorno de control.
- Latencia y throughput: no disponible. Depende de la longitud de la secuencia de acción generada y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GigaBrain-0.7-3.5B-Base | 4.12 B | No disponible | Apache 2.0 | VLA, multi-embodiment, tres sistemas |
| π0.5 | No disponible | No disponible | No disponible | VLA, modelo de acción generalista |
| GigaBrain-0 (serie) | No disponible | No disponible | No disponible | VLA con modelo de mundo |

No se dispone de datos comparativos cuantitativos (parámetros, contexto, rendimiento) de los modelos mencionados. La model card de GigaBrain-0.7 afirma superar a π0.5 en tareas de éxito y generalización, pero no se ofrecen cifras concretas.

## Limitaciones y advertencias

- El modelo está entrenado principalmente con datos en inglés; no se ha evaluado su capacidad en otros idiomas.
- No se documentan sesgos específicos, pero al ser un modelo de robótica, su comportamiento depende de la distribución de los datos de entrenamiento; puede fallar en entornos no vistos o con objetos no representados en el dataset.
- Riesgo de alucinación en la generación de acciones: puede predecir comandos no válidos o peligrosos si la escena visual no se interpreta correctamente. Es necesario un sistema de verificación de seguridad.
- No se proporcionan archivos de cuantización ni guías de despliegue; los usuarios deben adaptar los pesos a su framework.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo se publica como base, por lo que no se incluyen garantías de rendimiento en aplicaciones de producción.
- El tamaño de 33 GB en el repositorio puede requerir almacenamiento significativo y descarga costosa.

## Enlaces

- HuggingFace: https://huggingface.co/open-gigaai/GigaBrain-0.7-3.5B-Base
- Paper (arXiv): https://arxiv.org/abs/2608.15875
- GitHub (repo principal): https://github.com/open-gigaai/giga-brain-0
- Blog del proyecto: https://gigaai.cc/blog/gigabrain07
- Datos de muestra: https://huggingface.co/datasets/open-gigaai/GigaBrain-0.7-SampleData
