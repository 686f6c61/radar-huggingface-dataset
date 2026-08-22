# hesh0629/groot_probe

## Resumen

`groot_probe` es un modelo de robótica (policy) entrenado con la librería LeRobot de Hugging Face, orientado a tareas de manipulación basadas en visión y control de actuadores. Lo desarrolla Sung-hwan Han, estudiante de máster en el High Performance AI System Lab de la Universidad de Sogang, cuyo trabajo se centra en la inferencia eficiente de modelos de visión-lenguaje-acción (VLA) y en interacción humano-robot. El modelo se ha entrenado sobre el dataset `hesh0629/put_banana_v2`, que contiene demostraciones de una tarea de colocación de una banana.

Con 2.724.163.520 parámetros (aproximadamente 2,7 mil millones), el modelo emplea una arquitectura ACT (Action Chunking with Transformer), un enfoque estándar en LeRobot para generar secuencias de acciones a partir de observaciones de imágenes y estado del robot. Su relevancia actual radica en ser un ejemplo práctico de cómo LeRobot permite entrenar y publicar políticas de manipulación robótica de forma accesible, aunque su validación y generalización son limitadas al estar ligado a un dataset concreto y a un entorno de laboratorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformer) |
| Parametros totales | 2.724.163.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ACT (Action Chunking with Transformer), implementada en LeRobot. ACT es una política de aprendizaje por imitación que predice un "chunk" de acciones futuras (por ejemplo, una secuencia de posiciones de articulaciones) a partir de una o varias imágenes y del estado actual del robot. Utiliza un transformer con atención cruzada entre las características visuales y las consultas de acción. El entrenamiento se ha realizado con el dataset `hesh0629/put_banana_v2`, aunque no se proporcionan detalles sobre el número de episodios, la composición del dataset ni si se empleó algún método de optimización adicional (como RLHF o DPO, que no son aplicables a este tipo de modelos). No se menciona ninguna innovación técnica específica más allá del uso estándar de LeRobot.

## Capacidades

- Control de manipulación robótica: genera secuencias de acciones de articulaciones a partir de observaciones visuales y de estado.
- Entrenamiento por imitación: aprende de demostraciones humanas o teleoperadas.
- Integración con LeRobot: compatible con el pipeline de entrenamiento y evaluación de LeRobot, incluyendo robots SO-100 y otros brazos.
- No soporta generación de texto, tool calling, agentes de lenguaje ni capacidades multilingües.
- No incluye modo de razonamiento explícito ni visión general más allá de la entrada de imágenes para control.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para experimentar con ACT y comparar diferentes datasets y configuraciones de entrenamiento en LeRobot.
- Pruebas de despliegue en robots SO-100: el comando de evaluación incluido en la model card permite ejecutar el policy en un brazo SO-100 y registrar episodios de evaluación.
- Prototipado de tareas de manipulación en entornos de laboratorio: se puede adaptar el modelo a tareas similares (colocar objetos, empujar, agarrar) con datasets propios.
- Benchmark de eficiencia de inferencia: al ser un modelo de tamaño medio (2,7B parámetros), es útil para medir latencia y consumo de VRAM en GPUs de consumo.
- Investigación sobre VLA: aunque no es un modelo VLA completo, puede servir como componente de acción en experimentos que combinen lenguaje y visión.
- Docencia y aprendizaje: como ejemplo de entrenamiento de políticas con LeRobot, es un recurso didáctico para estudiantes de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, precisión o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 2,7B parámetros y los pesos en safetensors ocupan 16,3 GB. Para inferencia en FP32 se necesitaría al menos 16 GB de VRAM, aunque es probable que se utilice una precisión menor (por ejemplo, FP16) para reducir requisitos. No se documenta cuantización oficial.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) serían suficientes para cargar el modelo en FP16. En GPU de menos VRAM (como RTX 3080 de 10 GB) no sería viable sin cuantización.
- Opciones de despliegue: LeRobot (biblioteca de entrenamiento e inferencia), vLLM no es aplicable (no es un modelo de lenguaje), aunque se podría exportar a otros formatos si se convierte a un modelo de acción.
- Latencia y throughput: no se conocen datos oficiales. Al ser un transformer de 2,7B, la inferencia puede ser de decenas de milisegundos por paso en una GPU moderna, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de control robótico de tamaño similar en la información proporcionada. Se podría mencionar que el modelo es comparable a otras políticas ACT publicadas en LeRobot, pero no hay métricas concretas. Tampoco se han encontrado modelos alternativos con el mismo dataset o configuración.

## Limitaciones y advertencias

- Sesgos y generalización: al estar entrenado sobre un dataset específico (`put_banana_v2`), el modelo puede no generalizar a otras tareas, entornos o configuraciones de robot.
- Alucinación y errores de control: no se ha validado en entornos reales; puede producir acciones incorrectas o inestables si las observaciones difieren del conjunto de entrenamiento.
- Contexto limitado: el modelo no maneja lenguaje ni contexto conversacional; su única entrada es visual y de estado.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero sin garantías de responsabilidad.
- Dependencia de LeRobot: el modelo requiere la biblioteca LeRobot para cargar y ejecutar, lo que añade una dependencia de software.
- Documentación insuficiente: la model card no detalla el proceso de entrenamiento ni los hiperparámetros, lo que limita la reproducibilidad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/hesh0629/groot_probe
- Perfil del autor en Hugging Face: https://huggingface.co/hesh0629
- Página personal del autor: https://hesh0629.github.io/
- GitHub del autor: https://github.com/Hesh0629/
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
