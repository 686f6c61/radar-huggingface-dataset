# jaheroth/act_pusht_triple

## Resumen

El modelo `jaheroth/act_pusht_triple` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot sobre el dataset `lerobot/pusht`. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. El modelo fue desarrollado por el usuario jaheroth y publicado en Hugging Face con licencia Apache 2.0.

Con 83,9 millones de parámetros, es un modelo compacto diseñado específicamente para la tarea de empuje (push) en el entorno de simulación Pusht, donde un brazo robótico debe empujar un objeto hacia una región objetivo. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT con LeRobot, demostrando cómo entrenar y desplegar políticas robóticas de forma reproducible. No se trata de un modelo de lenguaje, sino de una política de control que procesa observaciones visuales y de estado para generar comandos de actuación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador y decodificador |
| Parametros totales | 83.899.796 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones futuras (por ejemplo, 10 pasos) a partir de observaciones actuales. La arquitectura consta de un codificador que procesa imágenes y estados del robot, y un decodificador autorregresivo que genera las acciones. El entrenamiento se realiza mediante comportamiento clonado sobre datos teleoperados, sin refuerzo ni ajuste por preferencias humanas.

El modelo fue entrenado con la librería LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones de empuje de objetos en un entorno simulado. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como aumentación de datos. El checkpoint se guardó en formato safetensors y se publicó en el Hub de Hugging Face.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para tareas de empuje en el entorno Pusht.
- Procesamiento de observaciones multimodales: combina imágenes de cámara y estados del robot (posición, velocidad) para generar comandos.
- Ejecución en tiempo real: al ser un modelo pequeño, puede ejecutarse en bucle de control con baja latencia.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No tiene capacidades de lenguaje, generación de texto, razonamiento simbólico ni tool calling.

## Casos de uso

- Entrenamiento de políticas robóticas en simulación: el modelo sirve como punto de partida para investigar métodos de aprendizaje por imitación en el entorno Pusht, permitiendo reproducir experimentos y comparar variantes de ACT.
- Despliegue en robots manipuladores reales: tras entrenar con datos teleoperados, la política puede transferirse a un brazo físico (por ejemplo, SO-100) para tareas de empuje y manipulación simple.
- Evaluación de algoritmos de control: investigadores pueden usar este checkpoint como baseline para medir el rendimiento de nuevas arquitecturas o técnicas de regularización en tareas de empuje.
- Prototipado rápido de sistemas de automatización: en entornos industriales o de laboratorio, el modelo puede integrarse en un pipeline de control para validar la viabilidad de ACT antes de escalar a tareas más complejas.
- Estudio de generalización: al ser un modelo específico de una tarea, permite analizar cómo varía el rendimiento al cambiar el entorno, la iluminación o la posición inicial del objeto.
- Formación y docencia: sirve como ejemplo didáctico para enseñar aprendizaje por imitación, transformers aplicados a robótica y uso de LeRobot en cursos de robótica e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como tasa de éxito en el entorno Pusht, comparaciones con otros modelos ACT ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al tener 83,9 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 336 MB, y en fp16 unos 168 MB. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso integradas con suficiente memoria compartida. No requiere GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot proporciona scripts de entrenamiento e inferencia; también puede usarse con frameworks de inferencia genéricos como PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una inferencia en el orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

Existen otros checkpoints de ACT entrenados sobre el mismo dataset Pusht en Hugging Face, como `MonishBalu/act_pusht_model` y `arclabmit/pusht_act_model`. No se dispone de sus parámetros ni métricas, por lo que no es posible realizar una comparación cuantitativa. En términos de arquitectura, todos siguen el mismo método ACT y se entrenan con LeRobot, por lo que las diferencias pueden estar en la configuración de hiperparámetros, el número de épocas o la semilla aleatoria. La licencia Apache 2.0 es común a todos.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de empuje en el entorno Pusht; no generaliza a otras tareas robóticas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y diversidad de las demostraciones de `lerobot/pusht`; puede sobreajustarse a las condiciones específicas del entorno simulado.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni generar texto, por lo que no es adecuado para aplicaciones de interacción humano-robot basadas en lenguaje.
- Riesgo de alucinación de acciones: como todo modelo de aprendizaje por imitación, puede producir acciones erróneas ante observaciones fuera de la distribución de entrenamiento.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero al ser un modelo de control, los sesgos podrían manifestarse en comportamientos inseguros si se despliega sin validación.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de cumplir con los términos del dataset `lerobot/pusht` (que también es Apache 2.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_triple
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset Pusht: https://huggingface.co/datasets/lerobot/pusht
- Perfil de GitHub del autor: https://github.com/JaHeRoth
