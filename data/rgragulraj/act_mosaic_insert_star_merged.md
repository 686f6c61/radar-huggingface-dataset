# rgragulraj/act_mosaic_insert_star_merged

## Resumen

El modelo `rgragulraj/act_mosaic_insert_star_merged` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado con la librería LeRobot de Hugging Face sobre el dataset `rgragulraj/mosaic_insert_star`, orientado a tareas de manipulación bimanual fina, como la inserción de una pieza en forma de estrella. El nombre del repositorio sugiere que el modelo es el resultado de un proceso de fusión (merging) de múltiples políticas, posiblemente mediante la técnica STAR (Spectral Truncation and Rescale), aunque este extremo no está confirmado en la model card.

Con 61,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo de política robótica open source con licencia Apache 2.0, reproducible y evaluable mediante el ecosistema LeRobot, que permite entrenar y desplegar políticas de imitación en robots de bajo coste como el SO-100.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 61.782.214 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para aprendizaje por imitación en robótica. En lugar de predecir una única acción por paso, el modelo genera un chunk de acciones futuras a partir de observaciones actuales (imágenes y estados del robot), lo que reduce la acumulación de errores y mejora la estabilidad del control. El entrenamiento se realiza con datos teleoperados, siguiendo el pipeline de LeRobot. El dataset `rgragulraj/mosaic_insert_star` contiene demostraciones de la tarea de inserción de una estrella, aunque no se especifican el número de episodios ni la composición exacta de los datos.

El sufijo `_merged` en el nombre del modelo indica que se ha aplicado una fusión de pesos. La técnica STAR, descrita en el paper arXiv:2502.10339, es un método de merging que elimina componentes ruidosos mediante descomposición espectral y reescala la norma nuclear. Sin embargo, la model card no confirma explícitamente el uso de STAR ni el número de modelos fusionados, por lo que esta información debe tratarse como una hipótesis razonable basada en la nomenclatura.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones para tareas de manipulación bimanual fina.
- Ejecución de tareas de inserción: entrenado específicamente para insertar una pieza en forma de estrella en una ranura.
- Integración con LeRobot: compatible con el flujo de entrenamiento, evaluación y registro de episodios de LeRobot.
- Despliegue en robots SO-100: el comando de evaluación incluido en la model card utiliza `so100_follower`, lo que indica compatibilidad con este robot de bajo coste.
- No es un modelo de lenguaje: no genera texto, código ni responde a prompts; su salida son comandos de actuación para el robot.
- No soporta tool calling ni razonamiento simbólico: sus capacidades se limitan al dominio de control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la eficacia de ACT en tareas de inserción con datos limitados.
- Benchmarking de políticas robóticas: puede compararse con otras políticas ACT del Hub para evaluar el efecto del merging en el rendimiento.
- Desarrollo de robots de bajo coste: al ser compatible con SO-100, permite probar algoritmos de control en entornos académicos o de hobby sin hardware caro.
- Reproducción de experimentos: gracias a LeRobot, es posible reentrenar el modelo desde cero o evaluarlo en el mismo dataset para verificar resultados.
- Estudio de técnicas de fusión de modelos: si se confirma el uso de STAR, el modelo sirve como caso práctico para analizar el impacto del merging en políticas robóticas.
- Prototipado de tareas de manipulación fina: puede adaptarse mediante fine-tuning a tareas similares de inserción o ensamblaje con pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, precisión de inserción ni comparaciones con otras políticas en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: con 61,7 millones de parámetros, el modelo ocupa aproximadamente 247 MB en FP32 y 123 MB en FP16, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 o superior). También podría ejecutarse en CPU para inferencia lenta, aunque no es lo habitual.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media e incluso en sistemas sin GPU para pruebas.
- Opciones de despliegue: LeRobot es la vía principal, tanto para entrenamiento como para evaluación. No se mencionan otros runtime como vLLM u Ollama, que no aplican a modelos de robótica.
- Latencia y throughput: no disponibles. Dependen del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. Existen otras políticas ACT en el Hub de Hugging Face (por ejemplo, las entrenadas por el equipo de LeRobot para tareas como `insert_pegs` o `push_to_green`), pero no se han encontrado datos públicos de rendimiento para este modelo concreto. La comparativa queda pendiente de la publicación de benchmarks.

## Limitaciones y advertencias

- Sesgos: al ser un modelo de control motor, no presenta sesgos lingüísticos, pero su comportamiento depende enteramente de la calidad y diversidad del dataset de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sin embargo, puede ejecutar acciones incorrectas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: la ventana de contexto no está especificada; en ACT, el chunk de acciones suele ser fijo (típicamente 50 pasos), pero no se confirma en este modelo.
- Limitaciones de idioma: no aplica, no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: es un modelo de investigación; su despliegue en entornos reales requiere validación con el robot físico y medidas de seguridad, ya que no se han reportado tasas de éxito ni robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rgragulraj/act_mosaic_insert_star_merged
- Dataset en Hugging Face: https://huggingface.co/datasets/rgragulraj/mosaic_insert_star
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Paper de STAR (Spectral Truncation and Rescale): https://arxiv.org/abs/2502.10339
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
