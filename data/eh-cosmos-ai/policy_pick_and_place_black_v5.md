# eh-cosmos-ai/policy_pick_and_place_black_v5

## Resumen

El modelo `eh-cosmos-ai/policy_pick_and_place_black_v5` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, sobre el dataset `eh-cosmos-ai/dataset_pick_and_place_black_v5`, orientado a tareas de recogida y colocación (pick and place) en un entorno con objeto de color negro.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en robots de bajo coste como el SO-100. Su relevancia radica en que demuestra cómo aplicar técnicas de transformadores al control motor de robots, logrando altas tasas de éxito en tareas de manipulación a partir de demostraciones teleoperadas. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control motor, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una sola acción por paso, genera un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. Se entrena con datos teleoperados, donde un humano demuestra la tarea y el modelo aprende a reproducir la secuencia de comandos motores.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas adicionales como RLHF o DPO. El entrenamiento se realizó con la librería LeRobot, que gestiona el pipeline completo: captura de demostraciones, entrenamiento y evaluación. El dataset asociado (`eh-cosmos-ai/dataset_pick_and_place_black_v5`) contiene episodios de pick and place de un objeto negro, presumiblemente en un entorno de sobremesa con el robot SO-100.

## Capacidades

- Control motor para tareas de recogida y colocación (pick and place) de un objeto específico (negro).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de secuencias de acciones (action chunking) que permiten movimientos suaves y coordinados.
- Integración con el ecosistema LeRobot: permite entrenamiento, evaluación y despliegue mediante comandos CLI.
- No incluye capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; es exclusivamente un controlador de bajo nivel.

## Casos de uso

- Automatización de tareas repetitivas de pick and place en líneas de montaje o laboratorios: el modelo puede ejecutar la secuencia de agarre y colocación de un objeto negro en una posición determinada, reduciendo la intervención humana.
- Prototipado rápido de políticas robóticas en investigación: al estar entrenado con LeRobot, permite iterar sobre nuevos datasets y entornos con poco esfuerzo de configuración.
- Educación en robótica y aprendizaje por imitación: sirve como ejemplo práctico de cómo entrenar un transformador para control motor con un robot de bajo coste (SO-100).
- Evaluación de algoritmos de control en entornos controlados: su tamaño compacto facilita ejecutar múltiples experimentos en paralelo.
- Base para fine-tuning en tareas similares: al ser un modelo pequeño y con licencia abierta, puede adaptarse a nuevos objetos o variaciones de la tarea con un dataset reducido.
- Despliegue en robots de bajo coste para demostraciones en ferias o eventos: su bajo consumo de recursos permite ejecutarlo en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, precisión ni comparaciones con otros modelos. Se recomienda consultar la documentación de LeRobot para procedimientos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; con 51,7 M de parámetros, la inferencia es ligera y puede ejecutarse en una GPU con al menos 2-4 GB de VRAM en FP32, o menos con cuantización (no especificada).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 2060 o superior). No se requiere hardware de alta gama.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación y grabación (`lerobot-record`), y el modelo puede cargarse mediante la API de Hugging Face. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información pública sobre las especificaciones de otros modelos de la misma familia (`policy_pick_and_place_v2`, `policy_pick_and_place_black_v3`) para realizar una comparativa cuantitativa. Todos comparten el mismo enfoque ACT y el ecosistema LeRobot, pero no hay datos de rendimiento ni de configuración publicados. La comparativa queda pendiente de documentación adicional por parte del autor.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (pick and place de un objeto negro) y no generaliza a otros colores, formas o disposiciones sin reentrenamiento.
- No posee capacidades de percepción visual propias; depende de la configuración del robot y de la cámara para localizar el objeto. La robustez ante cambios de iluminación o fondo no está garantizada.
- Al ser un modelo de aprendizaje por imitación, su rendimiento está limitado por la calidad y variedad de las demostraciones. Si el dataset es reducido o sesgado, el comportamiento puede ser frágil.
- No se han documentado sesgos específicos, pero al tratarse de un modelo de control físico, cualquier error de predicción puede provocar movimientos bruscos o colisiones; es necesario implementar salvaguardas de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de funcionamiento en entornos de producción.
- No se dispone de información sobre la longitud de contexto ni sobre la política de cuantización, lo que limita el ajuste fino en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eh-cosmos-ai/policy_pick_and_place_black_v5
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset asociado: https://huggingface.co/datasets/eh-cosmos-ai/dataset_pick_and_place_black_v5
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
