# rl2-vla/rl2-vla-qam-bridge

## Resumen

El modelo `rl2-vla/rl2-vla-qam-bridge` es un Vision-Language-Action Model (VLA) desarrollado por el grupo RL2-VLA (marmotlab) para tareas de robótica. Se basa en la metodología RL²-VLA, presentada en el artículo arXiv:2607.26991, que introduce un mecanismo de "composición latente adaptativa" mediante aprendizaje por refuerzo (RL) para mejorar el escalado en tiempo de prueba (test-time scaling) de modelos VLA preentrenados. El modelo está diseñado para operar sobre un VLA base y aplicar "steering" compositivo cuando se detecta un posible fallo, especialmente en entornos fuera de distribución, sin necesidad de modificar el VLA original.

El repositorio tiene un tamaño de 0,4 GB, lo que sugiere un modelo de dimensiones relativamente reducidas, aunque no se especifican los parámetros totales ni la arquitectura interna. La licencia es Apache-2.0, lo que permite uso comercial y modificación. La fecha de creación (julio de 2026) indica que es un modelo reciente, probablemente en fase de investigación. No se dispone de información sobre el pipeline de inferencia, idiomas soportados ni cuantizaciones disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,4 GB) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo (tipo de transformer, número de capas, etc.). Según el paper asociado, RL²-VLA se basa en un VLA preentrenado (no especificado) y añade un mecanismo de "RL compositional steering" que actúa en el espacio latente. El sistema detecta cuándo el VLA base probablemente fallará (por ejemplo, en situaciones fuera de distribución) y aplica una política de refuerzo adaptativa para diversificar las acciones hacia estados de éxito. Este enfoque no modifica los pesos del VLA original, sino que introduce un componente adicional entrenado con RL. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de acciones para robótica: el modelo produce comandos de acción (por ejemplo, posiciones de efector final, velocidades) a partir de entradas visuales y lingüísticas.
- Razonamiento visual-lingüístico: integra información de imágenes y texto para interpretar instrucciones y estados del entorno.
- Escalado en tiempo de prueba: aplica "steering" adaptativo para mejorar el rendimiento en escenarios no vistos durante el entrenamiento.
- Detección de fallos: el sistema identifica cuándo el VLA base es propenso a error y activa la política de refuerzo.
- Compatibilidad con VLA preentrenados: no requiere modificar el modelo base, lo que facilita su integración en pipelines existentes.
- Capacidades multilingües: no especificadas; probablemente limitadas al inglés u otros idiomas según el VLA base, pero no hay confirmación.

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede controlar brazos robóticos para tareas de ensamblaje o recogida, mejorando la robustez cuando el VLA base falla ante variaciones de iluminación o posición.
- Navegación de robots móviles: a partir de instrucciones en lenguaje natural y percepción visual, el modelo genera comandos de movimiento, con el mecanismo de steering para evitar obstáculos inesperados.
- Teleoperación asistida: en sistemas de control remoto, el modelo puede sugerir acciones correctivas cuando el operador se desvía de la trayectoria óptima.
- Aprendizaje por demostración: el modelo puede utilizarse para generar datos de entrenamiento adicionales en simulación, explorando acciones diversas cuando el VLA base se estanca.
- Robótica de servicio en entornos domésticos: tareas como recoger objetos o abrir puertas, donde el entorno es altamente variable y el steering adaptativo mejora la tasa de éxito.
- Investigación en test-time scaling: sirve como banco de pruebas para estudiar cómo el RL compositivo puede mejorar VLAs sin reentrenamiento, útil para la comunidad académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper arXiv:2607.26991 podría contener métricas, pero no se han extraído en la búsqueda web. No se dispone de comparaciones con otros modelos VLA.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo (0,4 GB) sugiere que el modelo podría caber en GPUs con 4-8 GB de VRAM, pero no hay confirmación.
- GPU recomendadas: no disponible. Dado el tamaño, probablemente funcione en GPUs consumer como RTX 3060 o superiores, pero no se especifica.
- Despliegue en consumer GPU: posible, pero sin datos oficiales.
- Opciones de despliegue: no se mencionan frameworks específicos (vLLM, llama.cpp, etc.). El repositorio de GitHub puede ofrecer instrucciones, pero no se han detallado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLAs con test-time scaling). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado; al ser un modelo de investigación, puede heredar sesgos del VLA base y de los datos de entrenamiento.
- Riesgo de alucinación: en tareas de robótica, el modelo podría generar acciones incorrectas si la detección de fallos no es precisa; no hay métricas de fiabilidad.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que podría no manejar instrucciones largas o historiales extensos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del VLA base subyacente, que podría tener su propia licencia.
- Caveat para producción: el modelo está en fase de investigación (paper de 2026) y no se han publicado evaluaciones exhaustivas; su uso en entornos reales requiere validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/rl2-vla/rl2-vla-qam-bridge
- Repositorio GitHub: https://github.com/marmotlab/RL2-VLA
- Página del proyecto: https://rl2-vla.github.io/
- Paper arXiv: https://arxiv.org/abs/2607.26991 (referencia: tan2026rl2)
