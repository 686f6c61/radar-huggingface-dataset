# mysterium99/smoke_test

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo de LeRobot/HuggingFace. Este repositorio concreto es un fine-tune del modelo base `lerobot/smolvla_base`, creado por el usuario `mysterium99`, destinado a tareas de robótica. El modelo tiene 450 millones de parámetros y está diseñado para funcionar en hardware de consumo. Resuelve el problema de control de robots mediante aprendizaje por imitación, consumiendo observaciones de estado y cámaras y produciendo acciones de control. Es relevante porque SmolVLA es una arquitectura eficiente que permite desplegar políticas de robótica en GPUs asequibles. El modelo fue entrenado con el framework LeRobot sobre un dataset de prueba con 105 episodios y dos tareas: empujar un bloque y apretar una pelota de estrés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción. Combina un codificador de imágenes con un modelo de lenguaje y un decodificador de acciones. En este fine-tune, el modelo consume observaciones: estado del robot (6 dimensiones) y tres imágenes de cámaras de 256x256 píxeles, y produce una acción de 6 dimensiones. El entrenamiento se realizó con LeRobot 0.6.1, usando el dataset `test` con 105 episodios y 98.752 fotogramas a 30 FPS. La configuración de entrenamiento fue: 20 pasos, batch size 4, optimizador AdamW, learning rate 0.0001, semilla 1000. El modelo se fine-tuneó a partir de `lerobot/smolvla_base`. No se indica el número de tokens ni la composición del dataset original del modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de estado y observaciones visuales.
- Procesamiento de múltiples cámaras: entrenado con tres cámaras (top y side, según el README).
- Integración con LeRobot: se puede ejecutar con `lerobot-rollout` y entrenar con `lerobot-train`.
- Soporte de tareas de manipulación: empujar bloques y apretar objetos.
- No soporta tool calling ni funciones de agente en el sentido de LLM.
- No es un modelo de lenguaje; no tiene capacidades multilingües.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un robot tipo "Follower" para empujar un bloque de un lado a otro, tarea para la que fue entrenado.
- Aprendizaje por imitación de trayectorias: se puede usar como referencia para entrenar políticas en nuevos datasets con LeRobot.
- Prototipado de políticas de robot de bajo coste: gracias a su tamaño reducido, puede ejecutarse en GPUs de consumo, lo que facilita experimentos rápidos.
- Investigación en VLA: sirve como ejemplo de fine-tune de SmolVLA para tareas concretas, permitiendo estudiar la transferencia de aprendizaje.
- Control de robot teleoperado: el modelo puede sustituir la teleoperación manual en entornos controlados, ejecutando acciones aprendidas.
- Validación de pipelines de LeRobot: al ser un fine-tune sobre un dataset de prueba, es útil para verificar el flujo de entrenamiento y despliegue de políticas antes de escalar a datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Dado el tamaño de 450M parámetros, se estima que puede caber en GPUs de consumo con al menos 4 GB de VRAM en precisión fp16, pero no hay datos oficiales.
- GPU recomendadas: no disponible. El diseño de SmolVLA está orientado a hardware de consumo, por lo que se espera compatibilidad con GPUs como RTX 3060 o superiores.
- Despliegue: compatible con LeRobot, que soporta ejecución en GPU vía PyTorch. No se mencionan vLLM, llama.cpp u otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Este modelo es un fine-tune de `lerobot/smolvla_base`; la diferencia principal es que está adaptado a las tareas del dataset `test`. Para una comparativa completa sería necesario evaluar ambos en las mismas tareas.

## Limitaciones y advertencias

- Entrenamiento muy limitado: solo 20 pasos sobre un dataset de prueba, por lo que el rendimiento real en robot puede ser bajo.
- Sin evaluación: no hay resultados de éxito en tareas reales, por lo que no se puede garantizar su funcionamiento.
- Dataset pequeño: 105 episodios y dos tareas específicas; el modelo probablemente no generalice a otras tareas, objetos o entornos.
- Dependencia de las cámaras: requiere exactamente las mismas observaciones de cámara con las que fue entrenado; cambios en iluminación, posición o resolución pueden degradar el rendimiento.
- No es un modelo de lenguaje: no puede usarse para generación de texto ni tareas de NLP.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: en el contexto de control robótico, el modelo puede generar acciones no deseadas si las observaciones difieren del entrenamiento, pero no hay datos específicos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/smoke_test
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/test
