# k-chan-l/pick_and_place4b_act

## Resumen

El modelo `k-chan-l/pick_and_place4b_act` es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. Fue desarrollada por el usuario k-chan-l y publicada en Hugging Face con licencia Apache 2.0. El modelo está diseñado para controlar un robot tipo `so_follower` en la tarea de recoger un cubo azul y colocarlo en un vaso de papel, a partir de datos teleoperados.

Con 51,7 millones de parámetros, esta política procesa observaciones de estado y dos cámaras (superior y de muñeca) para predecir acciones de control en un espacio de 6 dimensiones. Su relevancia radica en que demuestra cómo un modelo relativamente compacto puede aprender manipulaciones precisas con pocos datos (67 episodios) y ser desplegado en hardware robótico real mediante las herramientas de LeRobot. Al ser un modelo de imitación, no requiere ingeniería de recompensas ni simulaciones complejas, lo que facilita su adopción en entornos de investigación y prototipado.

El modelo se publicó el 2 de septiembre de 2026 y no incluye resultados de evaluación en el momento de su lanzamiento, aunque la metodología ACT ha mostrado altas tasas de éxito en tareas similares según el paper original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización documentada) |
| Idiomas soportados | no disponible (no aplica, modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de acciones individuales. La arquitectura combina un codificador de visión (para procesar las imágenes de las cámaras `top` y `wrist`) con un transformador que genera un chunk de acciones futuras, lo que mejora la coherencia temporal y la precisión en manipulaciones de largo horizonte. El modelo se entrenó con el pipeline de LeRobot, usando el dataset `k-chan-l/pick_and_place4` con 67 episodios y 33.547 fotogramas a 30 FPS.

El entrenamiento se realizó durante 40.000 pasos con un tamaño de lote de 16, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se emplearon técnicas como RLHF o DPO; el aprendizaje es puramente por imitación a partir de demostraciones teleoperadas. La entrada del modelo combina el estado del robot (6 dimensiones) con imágenes de resolución 480x640 en RGB, y produce una salida de acción de 6 dimensiones correspondiente al control del efector final.

## Capacidades

- Control de robot para tareas de pick-and-place: el modelo es capaz de ejecutar la secuencia completa de recoger un objeto (cubo azul) y colocarlo en un destino (vaso de papel) en un entorno real con robot `so_follower`.
- Procesamiento multimodal: combina información de estado propioceptivo (posición/velocidad de las articulaciones) con visión de dos cámaras (superior y de muñeca) para tomar decisiones de control.
- Generación de acciones en chunks: predice bloques de acciones futuras, lo que permite movimientos suaves y coordinados, reduciendo el error acumulado frente a políticas que predicen paso a paso.
- Entrenamiento por imitación: no requiere diseño de recompensas ni simulación; aprende directamente de demostraciones humanas teleoperadas.
- Integración con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es un modelo especializado exclusivamente en control motor.

## Casos de uso

- Automatización de tareas de picking en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger y colocar objetos en posiciones definidas, útil para montajes experimentales o líneas de ensamblaje simples.
- Pruebas de algoritmos de aprendizaje por imitación: sirve como punto de partida para investigadores que quieran comparar ACT con otros métodos (diffusion policies, etc.) en tareas de manipulación.
- Desarrollo de sistemas robóticos de bajo costo: al ser un modelo pequeño (51,7M parámetros) y entrenado con pocos datos, puede desplegarse en hardware de gama media sin necesidad de GPUs de alta gama.
- Investigación en generalización de políticas: dado que el dataset es reducido, el modelo puede usarse para estudiar cómo varía el rendimiento con cambios de iluminación, posición de objetos o distracciones.
- Prototipado rápido de tareas de manipulación: con LeRobot, un usuario puede grabar nuevas demostraciones y reentrenar el modelo para adaptarlo a otras tareas similares, acelerando el ciclo de desarrollo.
- Educación y formación en robótica: el modelo y su dataset asociado permiten a estudiantes practicar el flujo completo de entrenamiento y despliegue de políticas de imitación sin necesidad de infraestructura costosa.
- Benchmarking de hardware robótico: puede utilizarse para validar el rendimiento de diferentes robots `so_follower` o configuraciones de cámaras, ya que la política está entrenada con una configuración específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentación.
- Dado el tamaño del modelo (51,7M parámetros), la inferencia es ligera y puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 o superior, e incluso en CPU para pruebas de baja velocidad.
- Para entrenamiento, se recomienda al menos una GPU con 8-12 GB de VRAM, aunque los requisitos exactos dependen del tamaño de lote y la resolución de las imágenes.
- El despliegue se realiza mediante la librería LeRobot, que soporta inferencia en PyTorch. No hay soporte directo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la frecuencia de control del robot; no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ACT comparables en el mismo repositorio o en la documentación proporcionada. Dado que es un modelo de robótica específico para una tarea concreta, no se pueden establecer comparaciones directas con modelos de lenguaje o de propósito general. Se recomienda consultar el paper de ACT y la documentación de LeRobot para conocer alternativas en el mismo ámbito.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (pick and place de un cubo azul en un vaso de papel) y puede no generalizar a otros objetos, posiciones o entornos sin reentrenamiento.
- Depende de la configuración específica de cámaras y robot (`so_follower`); cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en el robot real, por lo que la tasa de éxito real es desconocida.
- El dataset es pequeño (67 episodios) y puede contener sesgos derivados de las demostraciones teleoperadas, como variaciones limitadas en la posición inicial de los objetos.
- Al ser un modelo de imitación, no tiene capacidad de razonamiento ni de adaptación a situaciones imprevistas; cualquier desviación significativa del escenario de entrenamiento puede provocar fallos.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar el método ACT y LeRobot según la indicación de la model card.
- No se proporcionan instrucciones de cuantización ni formatos optimizados para despliegue en edge; el uso está pensado para el flujo estándar de LeRobot con PyTorch.

## Enlaces

- Repositorio del modelo: https://huggingface.co/k-chan-l/pick_and_place4b_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/k-chan-l/pick_and_place4
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
