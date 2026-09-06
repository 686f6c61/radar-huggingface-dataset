# nsk11235/franka-stack-50e-smolvla

## Resumen

El modelo `nsk11235/franka-stack-50e-smolvla` es un fine-tuning del modelo base `lerobot/smolvla_base` dentro de la familia SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face. Fue creado por el usuario `nsk11235` y publicado en el Hub con la biblioteca LeRobot, especializada en robótica y aprendizaje por imitación. El modelo está diseñado para generar acciones de control a partir de observaciones visuales y/o instrucciones de lenguaje, y su principal atractivo es que puede ejecutarse en hardware de consumo, como se indica en el paper original de SmolVLA.

Con 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB en formato safetensors, se trata de un modelo ligero en comparación con otros VLA de mayor escala. La licencia es Apache 2.0, lo que permite uso comercial y modificación. No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones en los datos proporcionados. El modelo ha sido entrenado sobre el dataset `nsk11235/franka-stack-50e`, cuyo nombre sugiere tareas de apilamiento con un brazo robótico Franka.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en SmolVLA |
| Parámetros totales | 450.046.176 |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `lerobot/smolvla_base`, entrenado con la biblioteca LeRobot sobre el dataset `nsk11235/franka-stack-50e`. El modelo original SmolVLA se describe en el paper como un modelo compacto de visión-lenguaje-acción que alcanza un rendimiento competitivo con costes computacionales reducidos y que puede desplegarse en hardware de consumo. No se han proporcionado detalles sobre la composición del dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. La arquitectura interna exacta del policy (por ejemplo, si utiliza transformers, action chunking, etc.) no está especificada en la información disponible.

## Capacidades

- Control robótico: genera acciones de bajo nivel (posiciones, velocidades o esfuerzos) a partir de imágenes de cámara e instrucciones de lenguaje.
- Manipulación de objetos: está orientado a tareas de manipulación física, como apilamiento o agarre, según el contexto del dataset de entrenamiento.
- Aprendizaje por demostración: el modelo ha sido entrenado mediante imitación de demostraciones de teleoperación, una técnica habitual en LeRobot.
- Ejecución en hardware modesto: al ser compacto, puede ejecutarse en tiempo real en GPUs de consumo, lo que facilita el despliegue en laboratorios o entornos industriales ligeros.
- No soporta generación de texto generalista, tool calling ni funciones de chat, al ser un modelo de acción robótica.
- No se dispone de información sobre capacidades multilingües, de visión general (más allá de la entrada visual para el control) ni de audio.

## Casos de uso

- Automatización de tareas de apilamiento en almacenes: el modelo puede controlar un brazo robótico Franka para apilar cajas u objetos de forma autónoma, reduciendo la necesidad de intervención humana en tareas repetitivas.
- Investigación en robótica de imitación: sirve como baseline compacto y reproducible para experimentar con algoritmos de aprendizaje por demostración, ya que se integra directamente con LeRobot y sus herramientas de registro y evaluación.
- Teleoperación asistida: el modelo puede utilizarse como asistente en operaciones remotas, generando acciones predichas que guían al operador en la manipulación de objetos en entornos peligrosos o de difícil acceso.
- Robótica educativa y prototipado rápido: gracias a su tamaño reducido y licencia Apache 2.0, es adecuado para cursos, talleres o proyectos de investigación que necesiten un VLA funcional sin requerir clústeres de GPUs.
- Validación de políticas en simulación: puede cargarse en entornos simulados (por ejemplo, MuJoCo o Isaac Sim) para evaluar comportamientos antes de desplegar en hardware real, reduciendo riesgos y costes.
- Integración con brazos de bajo coste: al poder ejecutarse en hardware de consumo, es viable para sistemas robóticos pequeños o prototipos de laboratorio que no disponen de estaciones de trabajo con GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Dado el tamaño de 450.046.176 parámetros, en FP16 el modelo ocupa aproximadamente 900 MB; sumando activaciones y buffers de imagen, se estima que una GPU con 4 GB de VRAM sería suficiente para inferencia en tiempo real.
- GPU recomendadas: no hay una recomendación oficial. Por su tamaño, se espera que funcione en GPUs de consumo como la RTX 3060, RTX 4060 o RTX 4090. Para entrenamiento o fine-tuning adicional, se recomiendan GPUs con más memoria, como A100 o H100.
- Despliegue en GPU de consumo: sí, probablemente en GPUs con al menos 4 GB de VRAM, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: el modelo se utiliza principalmente a través de la biblioteca LeRobot, que ofrece comandos para entrenar, evaluar y ejecutar la política. No se menciona compatibilidad con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información comparativa con otros modelos. El modelo es un fine-tuning de `lerobot/smolvla_base`, por lo que la comparación natural sería contra ese modelo base, pero no se dispone de métricas de rendimiento en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: al tratarse de un modelo de acción, puede generar movimientos incorrectos o inseguros si se enfrenta a escenarios no vistos durante el entrenamiento.
- Limitaciones de generalización: ha sido entrenado en un dataset específico, probablemente limitado a tareas de apilamiento con un brazo Franka; no se garantiza que funcione en otros robots, tareas o entornos.
- Contexto y lenguaje: no hay datos sobre la ventana de contexto ni sobre instrucciones de lenguaje complejas; es posible que no maneje comandos de texto largos o ambiguos.
- Evaluación pendiente: el modelo no cuenta con benchmarks publicados, por lo que su rendimiento en producción no está validado de forma independiente.
- Licencia: Apache 2.0 permite uso comercial, pero se debe revisar también la licencia del dataset `nsk11235/franka-stack-50e` y del modelo base `lerobot/smolvla_base` antes de desplegar en un entorno productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nsk11235/franka-stack-50e-smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/nsk11235/franka-stack-50e
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Perfil del autor en Hugging Face: https://huggingface.co/nsk11235
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
