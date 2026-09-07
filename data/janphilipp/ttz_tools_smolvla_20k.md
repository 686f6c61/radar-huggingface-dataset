# JanPhilipp/ttz_tools_smolvla_20k

## Resumen

El modelo `JanPhilipp/ttz_tools_smolvla_20k` es una política de robótica basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente diseñado para hardware de consumo. Ha sido desarrollado por JanPhilipp mediante un proceso de fine-tuning sobre el modelo base `lerobot/smolvla_base`, utilizando el framework LeRobot de Hugging Face.

El modelo está entrenado para una tarea específica de manipulación: recoger herramientas de una zona verde y colocarlas en una zona roja, usando un robot bimanual del tipo `so_follower` equipado con dos cámaras RGB. El fine-tuning se realizó con un dataset de 100 episodios teleoperados, con un total de 87.697 frames a 30 FPS, lo que lo convierte en un modelo especializado para entornos controlados de pick-and-place.

Con 450 millones de parámetros y un peso de 1.2 GB en formato safetensors, este modelo destaca por su eficiencia computacional y su capacidad de ejecutarse en hardware asequible. Es relevante porque permite desplegar políticas de aprendizaje por imitación en robots de bajo coste y sirve como referencia para investigaciones en VLA compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de acciones, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, una política VLA compacta cuya arquitectura está descrita en el paper SmolVLA (arxiv:2506.01844). Durante el entrenamiento se utilizó el framework LeRobot en su versión 0.6.2, con una configuración de 10.000 pasos, batch size 4, optimizador AdamW y learning rate 1e-4. El dataset de entrenamiento, `JanPhilipp/ttz_tools_merged`, contiene 100 episodios teleoperados a 30 FPS, con una tarea única: "Grab the tools from the green area and place them on the red area".

El modelo consume como entradas el estado proprioceptivo del robot (`observation.state`, dimensión 6) y dos imágenes RGB de 480x640 provenientes de las cámaras `camera1` y `camera2`. Produce una acción de control de dimensión 6 (`action`). Al ser un VLA, combina percepción visual y razonamiento de bajo nivel para generar comandos motores, aunque no se disponen de más detalles técnicos sobre la arquitectura interna en la información proporcionada.

## Capacidades

- Generación de acciones de control para manipulación robótica en tareas de pick-and-place.
- Percepción multimodal: integra dos cámaras RGB y estado del robot para decisiones motoras en tiempo real.
- Ejecución de tareas aprendidas por imitación, con capacidad de operar a 30 FPS según el dataset de entrenamiento.
- No soporta tool calling ni function calling, al tratarse de una política de control, no de un modelo de lenguaje.
- No dispone de capacidades de razonamiento, generación de texto, código o matemáticas.
- No es multilingüe; su "lenguaje" son las señales visuales y de estado, no texto.
- No tiene modo de pensamiento (thinking mode) ni soporte de audio o visión en el sentido de entender imágenes sin contexto de acciones.

## Casos de uso

- Pick-and-place automatizado: el modelo puede controlar un brazo robótico para recoger herramientas de una zona de trabajo y depositarlas en otra, automatizando tareas repetitivas en producción.
- Clasificación de objetos por zonas: en laboratorios o talleres, puede separar herramientas o piezas según áreas de color (verde a rojo), facilitando la organización de materiales.
- Integración en células robóticas: sirve como política de bajo nivel en células de fabricación donde se requiere mover objetos entre puntos fijos con dos cámaras de visión.
- Robots educativos: al ser compacto y ligero, es adecuado para plataformas robóticas de bajo coste en entornos docentes, donde se enseña aprendizaje por imitación.
- Investigación en VLA: se puede usar como referencia para comparar el impacto del fine-tuning en tareas de manipulación, especialmente frente al modelo base.
- Prototipado rápido de tareas de manipulación: un operador puede teleoperar y grabar nuevos episodios para reentrenar el modelo en tareas similares, aprovechando la infraestructura de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente en la model card: "No evaluation results have been provided for this policy yet". Por tanto, no existen cifras de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de especificaciones oficiales de hardware en la información proporcionada. Dado que el modelo tiene 450 millones de parámetros, es plausible su ejecución en GPUs de consumo, pero no se ofrecen datos de VRAM, latencia o throughput. Las opciones de despliegue típicas para este tipo de políticas incluyen el uso del framework LeRobot, que permite cargar el modelo en GPU o CPU. Para una estimación orientativa, el tamaño del repositorio es de 1.2 GB, lo que sugiere que la inferencia en FP32 requiere del orden de 1.8 GB de VRAM, pero esta cifra no está confirmada por el autor.

## Comparativa con modelos similares

Este modelo es un fine-tuning de `lerobot/smolvla_base`, por lo que hereda la arquitectura y el tamaño de parámetros del modelo base. No se dispone de información suficiente en los datos proporcionados para comparar con otras alternativas de la misma categoría, como otros modelos VLA de tamaños similares. La única comparación directa posible es con el modelo base, del que no se han publicado especificaciones detalladas en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta: recoger herramientas de la zona verde y colocarlas en la zona roja. Cualquier otra tarea requerirá un nuevo proceso de fine-tuning.
- Depende de una configuración de hardware específica: robot `so_follower`, dos cámaras con nombres concretos (`camera1`, `camera2`) y la dimensión de estado/acción (6). Cambios en el robot, las cámaras o la calibración invalidan la política.
- No se han realizado evaluaciones formales, por lo que la tasa de éxito en producción es desconocida.
- El dataset de entrenamiento es limitado (100 episodios, 87.697 frames) y proviene de una única sesión de teleoperación, lo que puede introducir sesgos de iluminación, posiciones de objetos y distancias.
- Riesgo de alucinación de acciones: ante entradas visuales fuera de la distribución de entrenamiento, el modelo puede generar comandos motores incoherentes o peligrosos.
- No es un modelo de lenguaje, por lo que no puede interpretar instrucciones en texto ni responder en idiomas.
- La licencia Apache-2.0 permite uso comercial, pero esto no exime al usuario de garantizar la seguridad en aplicaciones robóticas reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JanPhilipp/ttz_tools_smolvla_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/ttz_tools_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
