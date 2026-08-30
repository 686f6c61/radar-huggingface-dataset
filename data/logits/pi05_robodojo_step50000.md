# logits/pi05_robodojo_step50000

## Resumen

El modelo `logits/pi05_robodojo_step50000` es un checkpoint intermedio de un modelo de visión-lenguaje-acción (VLA) basado en la arquitectura FlashVLA PI0.5, entrenado sobre el benchmark RoboDojo y exportado en el paso 50000. Ha sido publicado por el usuario `logits` en HuggingFace y utiliza la librería `lerobot`, especializada en robótica. Este tipo de modelos está diseñado para controlar robots manipuladores y móviles a partir de observaciones visuales y comandos en lenguaje natural, siguiendo la línea de los modelos π0 y π0.5 desarrollados por Physical Intelligence.

El checkpoint tiene aproximadamente 4,93 mil millones de parámetros y un tamaño de repositorio de 19,7 GB, lo que sugiere que se trata de un modelo de tamaño medio-grande para tareas de robótica. Su relevancia radica en que representa un intento de aplicar la arquitectura π0.5 a un entorno de entrenamiento abierto como RoboDojo, lo que podría facilitar la reproducción y evaluación de políticas generalistas en robótica. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles de entrenamiento, licencia, idiomas ni benchmarks, por lo que esta ficha se basa únicamente en los metadatos del repositorio y en el contexto general de los proyectos openpi y RoboDojo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlashVLA PI0.5 (modelo de visión-lenguaje-acción basado en flujo) |
| Parametros totales | 4.933.375.760 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia π0.5, un modelo de visión-lenguaje-acción (VLA) que extiende el modelo π0 original. Según la documentación de openpi, π0.5 es un modelo basado en flujo (flow-based) que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, diseñado para generalizar a entornos del mundo real sin necesidad de ajuste fino específico por tarea. El checkpoint concreto se describe como "FlashVLA PI0.5 baseline trained on RoboDojo", lo que indica que se ha entrenado sobre el benchmark RoboDojo, un conjunto de tareas de manipulación robótica de código abierto mantenido por AI MMLab Club. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El entrenamiento se ha exportado en el paso 50000, lo que sugiere que es un checkpoint intermedio, no necesariamente el resultado final de la optimización.

## Capacidades

- Control de robots manipuladores y móviles mediante observaciones visuales y comandos en lenguaje natural, siguiendo el paradigma de los modelos VLA.
- Generalización a entornos abiertos (open-world) según las capacidades declaradas de π0.5, aunque no se han verificado resultados específicos para este checkpoint.
- Integración con la librería `lerobot`, lo que permite su uso en pipelines de entrenamiento y evaluación de políticas robóticas.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales como thinking mode o visión adicional más allá de la entrada visual estándar de un VLA.

## Casos de uso

- Investigación en robótica: este checkpoint puede utilizarse como punto de partida para estudiar el comportamiento de la arquitectura π0.5 en el benchmark RoboDojo, permitiendo comparar políticas en tareas de manipulación como recoger, colocar o apilar objetos.
- Reproducción de experimentos: al estar disponible en HuggingFace con formato safetensors y librería lerobot, los investigadores pueden cargarlo y evaluarlo en sus propios entornos simulados o reales, siempre que dispongan del hardware adecuado.
- Desarrollo de políticas generalistas: dado que π0.5 está diseñado para generalizar a escenarios no vistos, este checkpoint podría servir para probar la transferencia a tareas domésticas o de oficina, aunque no hay evidencia pública de su rendimiento en dichos escenarios.
- Benchmarking de modelos VLA: RoboDojo es un benchmark estandarizado, por lo que este modelo puede ser uno de los candidatos a comparar con otros VLA en métricas de éxito de tarea, eficiencia de acciones y robustez.
- Aprendizaje por imitación: el modelo puede ser fine-tuning con demostraciones adicionales para adaptarlo a tareas específicas, aprovechando su base preentrenada en RoboDojo.
- Educación y formación: al ser un modelo abierto (aunque sin licencia explícita), puede utilizarse en cursos de robótica y aprendizaje por refuerzo para ilustrar el funcionamiento de los VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robótica y no de lenguaje general. Tampoco se han reportado tasas de éxito en tareas de RoboDojo para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~4,93 mil millones de parámetros en precisión FP16, se necesitan aproximadamente 10 GB de VRAM solo para los pesos, más memoria para activaciones y optimizador durante el entrenamiento. Para inferencia, se estima un mínimo de 12-16 GB de VRAM, dependiendo de la resolución de las imágenes de entrada y del tamaño de lote.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM, como una RTX 4090, A100 40GB o H100, sería adecuada para inferencia. Para entrenamiento o fine-tuning, se recomienda una A100 o H100 con 40-80 GB.
- En consumer GPU: es posible ejecutar inferencia en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero con limitaciones de resolución de imagen y lote. No se recomienda para entrenamiento completo.
- Opciones de despliegue: al ser un modelo de robótica con librería lerobot, el despliegue típico se realiza mediante scripts de Python que cargan el modelo y lo conectan a un entorno de simulación o a un robot real. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Dependen en gran medida del hardware, la resolución de las imágenes y el número de acciones predichas por paso.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Se podría comparar con el π0.5 original de Physical Intelligence o con otros VLA como OpenVLA o RT-2, pero no se conocen los resultados de este checkpoint en los mismos benchmarks. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha especificado la licencia del modelo, por lo que su uso comercial o incluso académico puede estar sujeto a restricciones legales no declaradas. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no se han publicado evaluaciones de seguridad o robustez.
- Al ser un checkpoint intermedio (paso 50000), es posible que no haya convergido completamente y que su rendimiento sea inferior al de un modelo entrenado durante más pasos.
- El modelo está diseñado específicamente para robótica y no para tareas de lenguaje general; su uso fuera de este ámbito no es apropiado.
- La ausencia de datos sobre idiomas soportados sugiere que el modelo puede estar entrenado principalmente con datos en inglés, aunque no se puede confirmar.
- El tamaño del repositorio (19,7 GB) implica que la descarga y el almacenamiento requieren recursos considerables, y la inferencia en tiempo real puede ser exigente en términos de cómputo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logits/pi05_robodojo_step50000
- Repositorio RoboDojo (GitHub): https://github.com/robodojo-benchmark/RoboDojo
- Repositorio openpi (GitHub): https://github.com/Physical-Intelligence/openpi
- Blog de π0.5: https://www.pi.website/blog/pi05
