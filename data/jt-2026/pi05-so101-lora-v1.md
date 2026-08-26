# jt-2026/pi05-so101-lora-v1

## Resumen

El modelo `jt-2026/pi05-so101-lora-v1` es un ajuste fino mediante LoRA dual-expert sobre **π₀.5**, el modelo de visión-lenguaje-acción (VLA) de Physical Intelligence, adaptado para controlar un brazo manipulador **SO-101** de 6 grados de libertad en tareas de colocación de mesa de desayuno. El modelo base π₀.5 combina un VLM PaliGemma de 3B parámetros con un experto de acción de 300M, y fue presentado en el paper arXiv:2504.16054 como una evolución de π₀ con co-entrenamiento en datos heterogéneos para mejorar la generalización en el mundo real.

Este checkpoint concreto se entrenó durante 15.000 pasos con un conjunto de datos de 49 episodios de demostración teleoperada (dataset `jt-2026/so101-breakfast`), y converge con una pérdida de flow-matching que baja de 0,92 a 0,56 en los primeros miles de pasos. Su relevancia radica en demostrar que es posible adaptar un VLA de última generación a un robot específico con una sola GPU (NVIDIA L20) mediante LoRA, sin necesidad de reentrenar el modelo completo, y desplegarlo con el framework openpi.

La licencia es Apache 2.0, lo que facilita su uso comercial y académico, y el repositorio pesa 9,6 GB. El autor es `jt-2026`, y existe un repositorio GitHub asociado con el pipeline completo de adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PaliGemma 3B VLM + 300M action expert (π₀.5 base) |
| Parámetros totales | ~3,3 mil millones (base) + pesos LoRA |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (instrucciones en inglés, probablemente multilingüe vía PaliGemma) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint JAX (openpi) — probablemente safetensors, no confirmado |
| Framework | JAX (openpi) |
| Robot objetivo | SO-101 (brazo seguidor de 6 DoF) |
| Espacio de acción | Posiciones articulares de 6 DoF |
| Dataset de entrenamiento | jt-2026/so101-breakfast (49 episodios) |
| Pasos de entrenamiento | 15.000 |
| Optimizador | AdamW con EMA deshabilitado |
| Tamaño de lote | 32 |
| Hardware de entrenamiento | 1x NVIDIA L20 |

## Arquitectura y entrenamiento

El modelo base es **π₀.5**, desarrollado por Physical Intelligence, que combina un VLM PaliGemma de 3B parámetros como codificador visual-lingüístico con un experto de acción de 300M parámetros que predice trayectorias de acción mediante **flow-matching**. El ajuste fino se realiza con **LoRA dual-expert**: se aplican adaptadores de bajo rango tanto al VLM como al experto de acción, con el rango por defecto de openpi. Esto permite adaptar el modelo a un robot específico con una fracción mínima de los parámetros entrenables.

El entrenamiento se llevó a cabo con el framework JAX de openpi, con un lote de 32, optimizador AdamW sin EMA y el scheduler de learning rate por defecto de openpi. La pérdida de flow-matching desciende de 0,92 a 0,56 en los primeros miles de pasos, indicando una convergencia suave. Los datos provienen de 49 episodios de demostración teleoperada recogidos en el propio brazo SO-101, empaquetados en formato LeRobot. La tarea objetivo es una secuencia multi-paso de colocación de elementos en la mesa: bloques en el plato, plato al centro, cuchara a la derecha y taza a la izquierda.

## Capacidades

- **Control robótico de 6 DoF**: genera acciones articulares de posición para el brazo SO-101, con control fino de la trayectoria.
- **Tareas multi-paso y de largo horizonte**: ejecuta secuencias de manipulación encadenadas (colocar, mover, posicionar) a partir de una única instrucción en lenguaje natural.
- **Comprensión visual-lingüística**: hereda las capacidades del VLM PaliGemma de 3B para interpretar escenas y objetos en la mesa.
- **Instrucciones en lenguaje natural**: acepta comandos como "primero pon el bloque en el plato, mueve el plato al centro de la mesa...".
- **Generalización a variantes**: al estar basado en π₀.5, conserva la capacidad de generalización de la base, aunque el ajuste LoRA lo especializa en el contexto SO-101.
- **Integración con openpi**: se sirve mediante el script `serve_policy.py` del framework openpi, permitiendo inferencia en tiempo real sobre el robot.
- **Fine-tuning eficiente**: los pesos LoRA permiten adaptación con una sola GPU (L20), sin necesidad de reentrenamiento completo.

## Casos de uso

- **Montaje de mesa automatizado**: el caso principal del modelo. Un robot SO-101 ejecuta la secuencia completa de colocar un bloque en un plato, desplazar el plato al centro de la mesa, colocar una cuchara a la derecha y una taza a la izquierda, todo a partir de una única orden. Es adecuado porque el LoRA se entrenó específicamente sobre estos 49 episodios, logrando una ejecución fiable en el escenario real.

- **Investigación en robótica de manipulación**: laboratorios y grupos de investigación pueden usar este checkpoint como punto de partida para estudiar la adaptación de VLA a nuevos robots, comparando el efecto del LoRA frente al ajuste completo, o como baseline para tareas de mesa de desayuno.

- **Prototipado rápido de nuevas tareas**: el pipeline de fine-tuning (repo GitHub) permite recopilar demostraciones, empaquetarlas en LeRobot y ajustar el LoRA en una sola GPU, lo que facilita iterar sobre nuevas tareas de manipulación en entornos de laboratorio.

- **Evaluación de generalización en el mundo real**: investigadores pueden probar la robustez del modelo ante variaciones de iluminación, posición de objetos y orden de instrucciones, para medir el grado de generalización que conserva el LoRA respecto a la base π₀.5.

- **Benchmarking de frameworks de despliegue**: sirve como caso de uso para comparar openpi con otras soluciones de inferencia robótica (LeRobot, etc.) en términos de latencia, throughput y facilidad de integración.

- **Docencia en robótica**: en cursos avanzados de robótica y aprendizaje por refuerzo, este modelo puede ilustrar el flujo completo de adaptación de un VLA de código abierto a un hardware concreto, desde la recolección de datos hasta el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la pérdida de flow-matching desciende de 0,92 a 0,56 durante el entrenamiento, pero no se proporcionan métricas de éxito en tareas reales (tasa de éxito, tiempo de ejecución, etc.).

## Requisitos de hardware

- **Entrenamiento**: se realizó con una única NVIDIA L20 (GPU de 48 GB VRAM), lo que confirma que el ajuste LoRA es viable en una sola GPU de gama media-alta.
- **Inferencia**: no se especifican requisitos de VRAM para la inferencia, pero dado que el modelo base es de ~3,3B parámetros, es razonable esperar que quepa en una GPU consumer de 12-16 GB (RTX 4080/4090) con cuantización, aunque la inferencia con openpi está optimizada para GPUs con suficiente VRAM.
- **Opciones de despliegue**: el modelo se sirve con el script `serve_policy.py` de openpi, que gestiona la inferencia en tiempo real para el robot. No se mencionan alternativas como vLLM, Ollama o llama.cpp, ya que el formato de pesos es JAX, no GGUF.
- **Latencia y throughput**: no se proporcionan datos de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Robot objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **jt-2026/pi05-so101-lora-v1** | π₀.5 | ~3,3B + LoRA | no disponible | SO-101 | Apache 2.0 | HuggingFace |
| **jakegonz/pi05-so101-lora-50demos** | π₀.5 | ~3,3B + LoRA | no disponible | SO-101 | Apache 2.0 | HuggingFace |
| **felixmayor/pi05_so101_orange_cube** | π₀.5 | ~3,3B + LoRA | no disponible | SO-101 | Apache 2.0 | HuggingFace |
| **π₀.5 base** (Physical Intelligence) | π₀.5 | ~3,3B | no disponible | General (múltiples robots) | Apache 2.0 | Repo oficial |

Los tres modelos de la lista son adaptaciones LoRA del mismo base π₀.5 sobre el mismo robot SO-101, diferenciándose en el dataset y el número de demostraciones (50 demos en el caso de jakegonz). El modelo de `jt-2026` se distingue por usar 49 episodios y una tarea específica de mesa de desayuno. La base π₀.5 tiene un alcance mucho mayor y es el punto de partida para todos ellos.

## Limitaciones y advertencias

- **Especialización estrecha**: el LoRA está entrenado únicamente para la tarea de colocación de mesa de desayuno sobre SO-101; no se puede esperar que generalice a otras tareas u otros robots sin reentrenamiento.
- **Dataset limitado**: 49 episodios de demostración es un volumen pequeño; la robustez ante variaciones del mundo real (cambios de iluminación, posiciones de objetos, oclusiones) es desconocida y probablemente limitada.
- **Sesgos de las demostraciones**: las demostraciones fueron recogidas por un operador humano; el modelo heredará los sesgos y hábitos de ese operador (velocidad, trayectorias, preferencias de agarre).
- **Riesgo de alucinación visual**: como cualquier VLM, puede malinterpretar la escena en situaciones ambiguas, lo que en un robot físico puede causar movimientos incorrectos o peligrosos.
- **Sin métricas de éxito publicadas**: no se proporcionan tasas de éxito ni evaluaciones cuantitativas del comportamiento en el robot real, por lo que el rendimiento real no está verificado.
- **Dependencia del framework openpi**: el modelo se sirve exclusivamente con openpi (JAX), lo que limita su uso con otros frameworks de inferencia.
- **Formato de pesos propietario**: los pesos están en formato JAX, lo que puede requerir conversión para usarlos con PyTorch o TensorFlow.
- **Sin información de contexto**: no se especifica la longitud de contexto del modelo, lo que puede afectar a instrucciones complejas o multi-turno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jt-2026/pi05-so101-lora-v1
- Repositorio GitHub del pipeline: https://github.com/ljt228/pi05-so101-finetune
- Paper de π₀.5: https://arxiv.org/abs/2504.16054
- Dataset de entrenamiento: https://huggingface.co/datasets/jt-2026/so101-breakfast
- Modelo comparativo (jakegonz): https://huggingface.co/jakegonz/pi05-so101-lora-50demos
- Modelo comparativo (felixmayor): https://huggingface.co/felixmayor/pi05_so101_orange_cube
- Documentación de fine-tuning SO-101: https://github.com/jinnymo/so101-pi05-base/blob/main/docs/07-lora-finetuning.md
