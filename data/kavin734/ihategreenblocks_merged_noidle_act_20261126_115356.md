# kavin734/ihategreenblocks_merged_noidle_act_20261126_115356

## Resumen

El modelo `ihategreenblocks_merged_noidle_act_20261126_115356` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Lo publica el usuario kavin734 en Hugging Face y se ha entrenado y exportado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo resuelve el problema de control de brazos robóticos a partir de datos de teleoperación, y es relevante porque ACT es uno de los métodos de referencia en manipulación robótica de bajo coste, con tasas de éxito altas en tareas de precisión.

El modelo tiene 51.678.855 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que se pueden ejecutar en hardware modesto. El identificador sugiere que se ha entrenado sobre un dataset propio (`ihategreenblocks_merged_noidle`) orientado a una tarea concreta de manipulación, probablemente relacionada con bloques verdes, y que se ha fusionado y filtrado para eliminar episodios con periodos de inactividad ("noidle").

No es un modelo de lenguaje: no genera texto ni razona en lenguaje natural. Es una política visomotora que mapea observaciones (imágenes de cámara y estado del robot) a comandos de acción. Por tanto, su evaluación debe hacerse en términos de tasa de éxito en la tarea robótica, no con benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo visomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | kavin734/ihategreenblocks_merged_noidle |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un codificador de imágenes (típicamente ResNet) con un transformer que procesa la secuencia de observaciones y un decodificador que emite un *chunk* de acciones futuras de una sola vez. Esta predicción por bloques reduce el error de acumulación típico de las políticas que predicen un paso por vez y mejora la estabilidad en tareas de manipulación fina. El paper de referencia es Zhao et al., "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), que popularizó ACT junto con el brazo robótico de bajo coste ALOHA.

El entrenamiento es de imitación supervisada sobre datos de teleoperación: el modelo aprende a reproducir las trayectorias del operador humano a partir de pares observación-acción. No se documenta en la model card el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). El nombre del dataset sugiere una fusión de episodios y un filtrado de segmentos inactivos, una práctica habitual para evitar que la política aprenda a quedarse quieta. No se detallan hiperparámetros, número de épocas ni configuración de aumento de datos.

## Capacidades

- Control visomotor de un brazo robótico a partir de imágenes de cámara y estado de las articulaciones.
- Predicción de *chunks* de acciones (varias acciones futuras por inferencia), lo que suaviza el control y reduce la latencia efectiva.
- Aprendizaje por imitación de tareas de manipulación demostradas por teleoperación.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con robots tipo SO-100/SO-101 (el ejemplo de la model card usa `so100_follower`).
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Manipulación de bloques en entornos de laboratorio: el modelo se entrena con demostraciones de un operador que recoge y coloca bloques; ACT predice chunks de acciones que reproducen la secuencia con precisión subcentimétrica en tareas de pick-and-place.
- Automatización de tareas repetitivas de ensamblaje: con un brazo SO-100, la política puede ejecutar la misma secuencia de agarre y colocación en cada ciclo, reduciendo la intervención humana en líneas de prototipado.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, cambios en el dataset o estrategias de filtrado de episodios (como el "noidle" del nombre).
- Evaluación de políticas en simulación o en banco de pruebas: al ser ligero (51,7 M de parámetros, 0,2 GB), se puede desplegar en un PC con GPU de gama media conectado al robot para ciclos de evaluación rápidos.
- Educación y robótica de bajo coste: adecuado para cursos y talleres donde se enseña a entrenar políticas con LeRobot sobre hardware asequible, ya que el flujo completo (entrenar, evaluar, grabar episodios) está documentado.
- Prototipado de tareas nuevas: el mismo pipeline (`lerobot-train` con `--policy.type=act`) permite reentrenar la política con un dataset propio para una tarea distinta, usando este modelo como referencia de configuración y rendimiento.
- Filtrado y limpieza de datos de teleoperación: el nombre del modelo refleja una estrategia de fusión y eliminación de periodos inactivos; puede usarse como ejemplo de cómo afecta esa limpieza a la calidad de la política resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas. El paper de ACT (arXiv:2304.13705) reporta resultados en tareas bimanuales con ALOHA, pero no son atribuibles a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros (aproximadamente 207 MB solo de pesos, más activaciones y buffers del codificador visual). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para inferencia (GTX 1650, RTX 3050, RTX 4060, RTX 4090); para entrenamiento se recomienda al menos 8-12 GB (RTX 3060/4070 o superiores).
- Cabe en GPU consumer: sí, en todas las GPU modernas de NVIDIA, AMD o Intel con soporte CUDA/ROCm/oneAPI; también es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con robots SO-100/SO-101; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolución de las cámaras y de la frecuencia de control del robot; ACT está diseñado para ejecutarse a decenas de hercios en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, kavin734) | 51,7 M | no disponible | Imitación con chunks de acciones | Apache 2.0 | Hugging Face |
| ACT original (Zhao et al., 2023) | ~80 M (configuración de referencia del paper) | no disponible | Imitación con chunks de acciones | MIT (código) | Repositorio oficial + paper |
| Diffusion Policy (Chi et al., 2023) | ~100 M típico | no disponible | Política generativa por difusión | MIT (código) | Repositorio oficial + paper |
| VQ-BeT (Lee et al., 2024) | ~50-100 M | no disponible | Tokenización vectorial cuantizada de acciones | MIT (código) | Repositorio oficial + paper |

Nota: los tamaños de los modelos comparables son aproximados y dependen de la configuración; no se dispone de una comparación de rendimiento directa con este checkpoint.

## Limitaciones y advertencias

- Es una política específica para una tarea y un robot concretos; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- El rendimiento depende críticamente de la calidad y cantidad de las demostraciones de teleoperación; no se documenta el tamaño del dataset ni la tasa de éxito.
- Riesgo de sobreajuste al entorno de entrenamiento (iluminación, posición de cámara, fondo); cambios en las condiciones visuales pueden degradar el control.
- No es un modelo de lenguaje: no procesa instrucciones en texto ni admite prompts en lenguaje natural.
- No se documentan sesgos, pero al derivar de demostraciones humanas puede heredar sesgos del operador (velocidad, trayectorias preferidas, posiciones de descanso).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de entrenamiento antes de un despliegue comercial.
- El nombre del modelo sugiere un filtrado de episodios inactivos; si el filtrado eliminó segmentos relevantes, la política podría no cubrir estados de pausa o recuperación.
- No hay información sobre el robot exacto, la resolución de cámara ni la frecuencia de control empleados, lo que dificulta reproducir el entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kavin734/ihategreenblocks_merged_noidle_act_20261126_115356
- Dataset de entrenamiento: https://huggingface.co/datasets/kavin734/ihategreenblocks_merged_noidle
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
