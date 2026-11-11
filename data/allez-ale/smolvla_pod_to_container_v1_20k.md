# allez-ale/smolvla_pod_to_container_v1_20k

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, `allez-ale/smolvla_pod_to_container_v1_20k`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 50 episodios teleoperados con un robot SO-101, orientado a una única tarea de manipulación: coger un cartucho de café amarillo y depositarlo en un contenedor.

El modelo resuelve el problema de la política de imitación específica de tarea: en lugar de programar el movimiento de forma explícita, aprende una función que mapea observaciones (tres cámaras de 256×256 y un vector de estado de 6 dimensiones) a acciones de 6 dimensiones a 30 FPS. Su relevancia radica en que demuestra que un VLA de tamaño reducido (unos 450 millones de parámetros) puede ajustarse a una tarea concreta con recursos modestos y desplegarse en hardware de consumo, algo impensable con VLA de escala mucho mayor.

La arquitectura subyacente es la descrita en el artículo SmolVLA (arXiv:2506.01844), que combina un codificador visual-lenguaje preentrenado con un decodificador de acciones ligero. El repositorio ocupa 0,9 GB y los pesos se distribuyen en formato safetensors, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; la instruccion de tarea se proporciona en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual-lenguaje con un decodificador de acciones. El modelo parte del checkpoint preentrenado `lerobot/smolvla_base` y se ajusta mediante aprendizaje por imitación supervisado sobre el conjunto de datos `allez-ale/so101_pod_to_container_v1`. La entrada del modelo son tres cámaras (`top`, `wrist` y una tercera cámara, cada una con imágenes de 3×256×256) más un vector de estado de 6 dimensiones (`observation.state`); la salida es un vector de acción de 6 dimensiones que se ejecuta a 30 FPS.

El ajuste fino se realizó durante 20.000 pasos con tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, usando LeRobot 0.6.2. El conjunto de datos contiene 50 episodios y 26.472 fotogramas a 30 FPS para la tarea "Pick up the yellow coffe pod and put it in the container". No se dispone de información sobre el número de tokens de preentrenamiento, la composición del corpus original de SmolVLA ni si se emplearon técnicas de RLHF o DPO; el ajuste fino aquí es puramente de imitación supervisada sobre teleoperación.

## Capacidades

- Control de robot manipulador SO-101 (`so_follower`) mediante política de imitación visual-motora.
- Fusión de tres flujos de cámara (256×256) con el estado articular de 6 dimensiones para generar acciones de 6 grados de libertad.
- Ejecución de una tarea concreta de pick-and-place: coger un cartucho de café amarillo y depositarlo en un contenedor.
- Condicionamiento por instrucción de tarea en lenguaje natural (el prompt `--task` se pasa en tiempo de ejecución).
- Inferencia en tiempo real a 30 FPS, compatible con el bucle de rollout de LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades de audio o visión general fuera del contexto robótico.
- Capacidades multilingües: no disponibles; la instrucción de tarea del dataset está en inglés.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de coger el cartucho y soltarlo en el contenedor, permitiendo validar pipelines de imitación con un robot SO-101 de bajo coste antes de escalar a tareas más complejas.
- Prototipado rápido de políticas de imitación: sirve como referencia de ajuste fino de SmolVLA con 50 episodios y 20.000 pasos, útil para equipos que quieran medir cuántos datos y pasos necesitan para una tarea nueva.
- Investigación en VLA compactos: al ser un modelo de 450 M de parámetros, permite experimentar con variantes de decodificación, aumentación de datos o currículos de entrenamiento en una sola GPU de consumo.
- Docencia y formación en robótica: el repositorio incluye comandos `lerobot-rollout` y `lerobot-train` listos para usar, lo que facilita demostraciones reproducibles en cursos de aprendizaje por imitación.
- Benchmark interno de generalización: al estar entrenado en una tarea única con posiciones fijas, sirve como línea base para medir la degradación al cambiar iluminación, posición de objetos o robot.
- Evaluación de infraestructura de despliegue: permite probar la latencia y el throughput del bucle de inferencia de LeRobot en hardware de consumo antes de invertir en políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 los pesos ocupan aproximadamente 1,8 GB, y en fp16 unos 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de las tres cámaras de 256×256.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque el fabricante no lo confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de política vía `--policy.path`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el modelo está pensado para operar a 30 FPS, la misma frecuencia del dataset de entrenamiento; no se publican cifras de latencia por paso ni de throughput medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `allez-ale/smolvla_pod_to_container_v1_20k` | 450 M | no disponible | Pick-and-place SO-101 (1 tarea) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA base preentrenado, ajustable a tareas | no disponible | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación visual-motora genérica | no disponible | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | Imitación visual-motora genérica | no disponible | Hugging Face / LeRobot |

La comparación con alternativas de la misma categoría (ACT, Diffusion Policy) no puede cuantificarse porque no se han publicado métricas de éxito para esta política ni se dispone de cifras comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "Pick up the yellow coffe pod and put it in the container"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: la model card no reporta tasa de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Sensibilidad al entorno: al entrenarse con 50 episodios, es probable que la política se degrade ante cambios de iluminación, posición de objetos, distractores o un robot distinto del mismo tipo; no se documenta ninguna prueba de robustez.
- Dependencia de la configuración de cámaras: los nombres y índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`top`, `wrist` y la tercera cámara), lo que limita la portabilidad entre montajes.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución y provocar colisiones o fallos de agarre; requiere supervisión y paradas de seguridad en el robot.
- Sesgos: no disponibles; no se documenta ningún análisis de sesgo, aunque al tratarse de un modelo visual puede heredar sesgos del codificador preentrenado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias de los componentes preentrenados (`lerobot/smolvla_base`) y del dataset asociado.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Fecha de creación del repositorio (2026-11-11) y ausencia de descargas o likes: modelo reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allez-ale/smolvla_pod_to_container_v1_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/allez-ale/so101_pod_to_container_v1
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=allez-ale/so101_pod_to_container_v1
