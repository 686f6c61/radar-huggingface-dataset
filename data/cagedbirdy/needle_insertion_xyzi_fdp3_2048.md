# cagedBirdy/needle_insertion_xyzi_fdp3_2048

## Resumen

El modelo `cagedBirdy/needle_insertion_xyzi_fdp3_2048` es una política de control visuomotor basada en Diffusion Policy, desarrollada por el usuario cagedBirdy y entrenada con la librería LeRobot de Hugging Face. Está diseñada específicamente para la tarea de inserción de aguja (needle insertion), un problema de manipulación robótica con contacto rico donde se requiere generar trayectorias de acción suaves y multi-paso. El modelo utiliza un proceso generativo de difusión para producir secuencias de acciones condicionadas a observaciones visuales y de estado, lo que le permite manejar la incertidumbre y la variabilidad en entornos de contacto.

Con aproximadamente 251,6 millones de parámetros y un tamaño de repositorio de 1 GB, es un modelo compacto en comparación con los grandes modelos de lenguaje, pero suficiente para tareas de control robótico de alta precisión. Su relevancia radica en que ofrece una solución de código abierto (licencia Apache 2.0) para automatizar procedimientos de inserción de aguja, un área con aplicaciones en cirugía asistida, biopsias y manufactura. Al estar integrado con LeRobot, permite reproducir el entrenamiento y la evaluación de forma sencilla, lo que lo convierte en una opción accesible para investigadores y desarrolladores de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión para control visuomotor) |
| Parametros totales | 251.637.971 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos en safetensors) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir directamente una acción, el modelo genera una trayectoria completa de acciones mediante un proceso iterativo de denoising, lo que produce secuencias suaves y coherentes, especialmente adecuadas para tareas de manipulación con contacto como la inserción de aguja. La red subyacente (tipo de backbone, número de capas, etc.) no se detalla en la información disponible, pero se sabe que está entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El entrenamiento se realizó sobre el dataset `cagedBirdy/needle_insertion_xyzi_2048`, que contiene demostraciones de inserción de aguja con observaciones de tipo XYZ e imágenes (probablemente). No se especifican el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser un modelo de política, el entrenamiento se basa en aprendizaje por imitación supervisado, donde el modelo aprende a replicar las acciones demostradas. La arquitectura de difusión permite modelar distribuciones multimodales de acciones, lo que es útil para manejar la variabilidad en tareas de contacto.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico, específicamente para inserción de aguja.
- Manejo de tareas de manipulación con contacto rico, donde las fuerzas y la fricción son relevantes.
- Producción de acciones suaves y coherentes gracias al proceso de difusión.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No tiene capacidades de lenguaje, visión general ni razonamiento simbólico; es un modelo puramente motor.
- No soporta tool calling ni funciones de agente; su salida es directamente un vector de acciones.

## Casos de uso

- Automatización de inserción de aguja en entornos médicos: el modelo puede controlar un brazo robótico para realizar punciones precisas (por ejemplo, en biopsias o administración de fármacos), reduciendo la variabilidad humana y mejorando la repetibilidad.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar políticas de difusión en tareas de contacto, permitiendo comparar con otros métodos (ACT, etc.) dentro del framework LeRobot.
- Entrenamiento de robots en simulación: se puede evaluar en entornos simulados (por ejemplo, MuJoCo) antes de transferir a hardware real, gracias a la compatibilidad con LeRobot.
- Desarrollo de sistemas de cirugía asistida: el modelo puede integrarse en plataformas robóticas para asistir a cirujanos en procedimientos que requieren inserción de agujas, como biopsias guiadas por imagen.
- Benchmarking de políticas de control: al ser un modelo pequeño y de código abierto, es útil para comparar el rendimiento de diferentes arquitecturas de difusión en tareas de manipulación fina.
- Educación y prototipado: estudiantes e investigadores pueden usar el modelo para experimentar con control robótico sin necesidad de grandes recursos computacionales, gracias a su tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como tasa de éxito, precisión de inserción ni comparaciones con otros modelos en la tarea de inserción de aguja. Se recomienda consultar el repositorio del autor o el dataset asociado para posibles evaluaciones futuras.

## Requisitos de hardware

- VRAM estimada: al tener ~251,6M parámetros, en FP32 ocupa aproximadamente 1 GB de memoria. Con cuantización a FP16 o int8, podría reducirse a ~500 MB o menos, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores son adecuados. Para entrenamiento, se recomienda al menos 4-6 GB de VRAM.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media y baja, lo que lo hace accesible para laboratorios con recursos limitados.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con PyTorch directamente. También es compatible con herramientas de la comunidad como vLLM (aunque no es un modelo de lenguaje) y con el pipeline de LeRobot para inferencia en robots.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una inferencia rápida (del orden de milisegundos por paso) en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El autor tiene otros modelos similares en su perfil (por ejemplo, `cagedBirdy/cut_xyzi_fdp3_2048_xyjitter_intjitter` y `cagedBirdy/cut_xyzi_dp3_jitter_2048`), pero no se conocen sus especificaciones ni rendimiento. Tampoco hay datos de modelos alternativos de inserción de aguja con Diffusion Policy en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (inserción de aguja) y no es generalizable a otras tareas de manipulación sin reentrenamiento.
- No tiene capacidades de lenguaje ni de razonamiento simbólico; su salida es exclusivamente un vector de acciones.
- El dataset de entrenamiento no está documentado en detalle, por lo que se desconocen posibles sesgos en las demostraciones (por ejemplo, variaciones de iluminación, ángulos de inserción, tipos de aguja).
- No se han publicado evaluaciones de robustez en entornos reales; el rendimiento puede degradarse fuera de las condiciones de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el dataset asociado no tenga restricciones adicionales.
- Al ser un modelo de difusión, la generación de trayectorias puede ser más lenta que métodos de regresión directa, aunque el tamaño reducido mitiga este problema.
- No se proporcionan cuantizaciones oficiales, por lo que el despliegue en dispositivos de muy baja memoria requeriría conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cagedBirdy/needle_insertion_xyzi_fdp3_2048
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (también en arXiv: https://arxiv.org/abs/2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/cagedBirdy/needle_insertion_xyzi_2048
- Otros modelos del autor: https://huggingface.co/cagedBirdy/cut_xyzi_fdp3_2048_xyjitter_intjitter y https://huggingface.co/cagedBirdy/cut_xyzi_dp3_jitter_2048
