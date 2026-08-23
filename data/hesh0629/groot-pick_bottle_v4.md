# hesh0629/groot-pick_bottle_v4

## Resumen

El modelo `hesh0629/groot-pick_bottle_v4` es un policy de robótica entrenado con el framework LeRobot, desarrollado por el usuario hesh0629. Está diseñado para la tarea de recoger botellas (pick bottle) mediante aprendizaje por imitación, es decir, aprende a mapear observaciones (imágenes de cámaras y estados del robot) en acciones de control para un brazo robótico. El modelo se distribuye bajo licencia Apache 2.0 y se publica en formato safetensors, con un tamaño de 2,72 mil millones de parámetros, lo que lo sitúa en la gama de modelos de acción relativamente grandes para robótica.

Aunque la model card es escueta y no proporciona detalles sobre la arquitectura interna, se sabe que el tipo de policy es `act` (Action Chunking with Transformers), una arquitectura común en LeRobot que combina visión y control en un solo modelo. Este modelo se integra con el ecosistema LeRobot, permitiendo su uso en robots como el SO-100, y su relevancia actual radica en la tendencia hacia la automatización de tareas de manipulación en entornos controlados, así como en la investigación sobre modelos de visión-lenguaje-acción (VLA) que el autor desarrolla en su página personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 2.724.163.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de visión-acción) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `act` (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. Este tipo de política se entrena con demostraciones teleoperadas, donde el modelo aprende a imitar el comportamiento del usuario. El entrenamiento se realiza mediante el framework LeRobot, que gestiona el dataset, la normalización y la evaluación. El dataset asociado (`hesh0629/pick_bottle_v4`) contiene vídeos, series temporales y datos tabulares, con un tamaño de 256 MB y formato parquet, pero no se han publicado detalles sobre el número de episodios ni la composición exacta de los datos. No se indica si se usaron técnicas de RLHF o DPO; el aprendizaje es por imitación directa.

## Capacidades

- Control de un brazo robótico para la tarea específica de recoger botellas, basado en observaciones de cámara y sensores.
- Generación de secuencias de acciones (chunking) para movimientos suaves y coordinados.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots físicos como el SO-100.
- No soporta generación de texto, razonamiento, código, matemáticas, ni visión general; su ámbito es exclusivamente robótico.
- No se ha documentado soporte de tool calling, agentes ni capacidades multilingües.

## Casos de uso

- **Automatización de líneas de embotellado**: el modelo puede integrarse en un sistema robótico que recoge botellas de una cinta transportadora y las coloca en una posición determinada. Su tamaño (2.7B) permite una precisión suficiente para tareas de manipulación repetitivas.
- **Investigación en aprendizaje por imitación**: dado que es un modelo de referencia entrenado con LeRobot, puede servir como punto de partida para experimentos sobre transferencia de políticas, ajuste fino con nuevos datos o comparación de arquitecturas.
- **Robots de servicio en entornos de laboratorio**: el modelo es adecuado para tareas de recogida de objetos en entornos controlados, como tubos de ensayo o frascos, aunque su generalización a otros objetos es limitada.
- **Educación en robótica**: al ser de código abierto y con licencia Apache 2.0, puede usarse en cursos universitarios para enseñar aprendizaje por imitación y control de robots, con el flujo de trabajo documentado en LeRobot.
- **Prototipado rápido en empresas**: las empresas que necesitan un brazo robótico para tareas de recogida de botellas pueden desplegar este modelo sin necesidad de entrenar desde cero, siempre que su robot sea compatible con LeRobot.
- **Evaluación de hardware de inferencia**: el modelo sirve como carga de trabajo para probar GPUs y sistemas de inferencia en tiempo real en el contexto de control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, dado que no es un modelo de lenguaje. No se han reportado tasas de éxito en la tarea de recogida de botellas ni comparaciones con otros modelos de robótica.

## Requisitos de hardware

- **VRAM estimada**: no hay datos oficiales. Para un modelo de 2.7B parámetros en precisión FP32 se necesitarían aproximadamente 10.9 GB de VRAM, pero al usar safetensors con LeRobot se suele cargar en FP16 o BF16, reduciendo a ~5.4 GB. Sin embargo, no se ha confirmado el formato de precisión.
- **GPU recomendadas**: no se especifica, pero por el tamaño, una GPU con al menos 8 GB de VRAM (como RTX 3070, RTX 4060) sería suficiente para inferencia; para entrenamiento se recomendaría una GPU con 16 GB o más (RTX 4090, A100).
- **¿Cabe en consumer GPU?**: probablemente sí, con cuantización o usando FP16. Pero no hay confirmación.
- **Opciones de despliegue**: LeRobot proporciona scripts para evaluación y grabación de episodios, y se puede integrar con ROS2 (como se ve en el repositorio BPi). No se menciona soporte para vLLM, llama.cpp ni Ollama, que son herramientas para LLM, no para políticas robóticas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de robótica de recogida de botellas con LeRobot. La categoría es muy específica y no hay datos públicos de otros modelos con el mismo propósito. No se puede ofrecer una comparativa.

## Limitaciones y advertencias

- **Sesgos y generalización**: el modelo está entrenado para una tarea específica (recoger botellas) y con un dataset concreto; no generalizará a otros objetos, entornos o configuraciones de robot sin un reentrenamiento.
- **Alucinación**: no aplica, ya que no genera texto; pero puede producir acciones incorrectas si las observaciones se salen de la distribución de entrenamiento.
- **Limitaciones de contexto**: no tiene contexto de lenguaje ni de memoria a largo plazo; las decisiones dependen de la ventana de observación actual.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la responsabilidad del despliegue en robots físicos recae en el usuario; hay que verificar la seguridad del entorno.
- **Caveat de producción**: el modelo no ha sido probado en entornos de producción reales, y su robustez ante variaciones de iluminación, ángulos de cámara o posición de la botella no está documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hesh0629/groot-pick_bottle_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/hesh0629/pick_bottle_v4
- Página personal del autor: https://hesh0629.github.io/
- Repositorio BPi (BottlePick AI, ROS2): https://github.com/Mao-uc/BPi
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
