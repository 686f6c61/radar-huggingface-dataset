# dogeum/demo_parsing_size

## Resumen

`dogeum/demo_parsing_size` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos ("chunks") de acciones en lugar de un único paso de control. El modelo lo publica el usuario dogeum en HuggingFace Hub y se ha entrenado y subido mediante LeRobot, la librería de HuggingFace para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un checkpoint de control motriz que mapea observaciones (imágenes de cámara y estado del robot) a secuencias de acciones de un efector.

El checkpoint tiene 51.668.614 parámetros (unos 51,7 millones) en formato safetensors, con un repositorio de 0,2 GB, lo que lo sitúa en el rango de las políticas ligeras que se pueden ejecutar en tiempo real sobre hardware de consumo. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y el dataset asociado es `dogeum/demo_parsing_size`.

La relevancia de este modelo es limitada y hay que contextualizarla: se trata de un artefacto de demostración o prueba (el propio nombre incluye "demo"), con 0 descargas y 0 "likes" en el momento de la consulta, y sin model card que documente el dataset de entrenamiento, la morfología del robot objetivo ni métricas de éxito. Sirve como ejemplo reproducible del flujo de LeRobot y como punto de partida para reentrenar ACT sobre datos propios, no como política lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder-decodificador y componente CVAE para aprendizaje por imitación |
| Parametros totales | 51.668.614 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se describe en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura es un transformer con encoder y decodificador: el encoder ingiere las observaciones (imágenes de las cámaras, estado de las articulaciones y, opcionalmente, una variable latente de estilo procedente de un CVAE) y el decodificador genera un chunk de acciones futuras de forma no autorregresiva. Predecir varios pasos de acción de golpe amortigua el error de compounding y reduce el jitter típico de las políticas que emiten una acción por inferencia. En la configuración original del paper el chunk es de 100 pasos, aunque no se dispone de confirmación de la configuración exacta usada en este checkpoint.

El modelo se ha entrenado con LeRobot a partir de teleoperación sobre el dataset `dogeum/demo_parsing_size`. No hay información disponible sobre el número de episodios, las tareas cubiertas, la morfología del robot, la resolución de las cámaras ni la composición del dataset. Tampoco se documenta si hubo aumento de datos, normalización específica o ajuste fino posterior. A falta de esa información, cualquier afirmación sobre su calidad de control sería especulativa.

## Capacidades

- Generación de acciones de control robótico por imitación: dado un conjunto de observaciones visuales y propioceptivas, produce un chunk de acciones continuas para un efector.
- Manipulación con una o dos manos, según la morfología para la que se haya entrenado el checkpoint (no documentada).
- Aprendizaje a partir de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas ni entorno simulado.
- Inferencia local de baja latencia: 51,7 M de parámetros permiten ejecutar el bucle de control en GPU de consumo e incluso en CPU.
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de LLM; el "razonamiento" se limita al horizonte del chunk de acciones.
- Capacidades multilingües: no aplica.
- Capacidades especiales: ninguna documentada más allá del propio método ACT.

## Casos de uso

- Reentrenamiento sobre datos propios: el valor principal del checkpoint es servir de plantilla. Se clona el flujo de LeRobot (`lerobot-train --policy.type=act`) y se lanza un entrenamiento desde cero con un dataset propio de teleoperación, usando este repositorio como referencia de estructura de ficheros y de configuración.
- Manipulación de precisión en laboratorio: ACT está pensado para tareas finas con hardware de bajo coste, como insertar piezas, plegar o ensartar objetos, donde el chunking reduce la varianza entre pasos.
- Prótotipos de robótica educativa: su tamaño (51,7 M de parámetros, 0,2 GB de repositorio) permite iterar en un portátil con GPU de gama media y validar pipelines de captura de datos, entrenamiento y evaluación en pocas horas.
- Benchmark interno de políticas de imitación: se puede usar como línea base de ACT frente a Diffusion Policy, VQ-BeT u otras políticas de LeRobot sobre el mismo dataset, midiendo tasa de éxito por episodio con `lerobot-record`.
- Evaluación de pipelines de datos: dado que el dataset asociado se llama `demo_parsing_size`, resulta útil para depurar el parseo de datasets de LeRobot (sincronización de vídeo, estados y acciones) antes de invertir en grabaciones largas.
- Control en el borde (edge): al ser un modelo pequeño, se puede desplegar en un equipo con GPU integrada o Jetson y ejecutar el bucle percepción-acción sin depender de la nube.
- Reproducibilidad de experimentos: publicar el checkpoint en el Hub junto con el dataset permite a terceros reproducir exactamente la política entrenada, algo habitual en flujos de LeRobot.
- Integración con robots SO-100/SO-101: la documentación de LeRobot emplea `so100_follower` como robot de ejemplo en los comandos de evaluación, lo que sugiere que este tipo de checkpoints encaja bien con esas plataformas de bajo coste (sin confirmación específica para este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51,7 M de parámetros ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Sumando activaciones y buffers de imagen, un presupuesto de 1-2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna sirve. Una RTX 3060, RTX 4060 o superior ejecuta la política sin problema; A100 y H100 están sobredimensionadas para este tamaño y solo se justifican por paralelismo de entrenamiento.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos diez años (GTX 10xx en adelante) y también en iGPU o CPU para inferencia a baja frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-record --policy.path=...`), PyTorch nativo cargando los safetensors. vLLM, TGI, llama.cpp y Ollama no aplican, porque no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La viabilidad en tiempo real depende de la frecuencia de control del robot y del coste de codificar las imágenes, no del tamaño del modelo.
- Almacenamiento: el repositorio ocupa 0,2 GB, lo que incluye pesos y, con toda probabilidad, estados de optimizador y checksums.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a lo comprobable de este repositorio.

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dogeum/demo_parsing_size (ACT) | 51,7 M | no disponible | Apache-2.0 | HuggingFace Hub, librería LeRobot | Checkpoint de demostración, 0 descargas |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | Implementada en LeRobot | Alternativa de imitación que genera acciones mediante difusión; requiere más pasos de inferencia |
| SmolVLA (LeRobot) | no disponible | no disponible | no disponible | HuggingFace Hub | Política visión-lenguaje-acción de mayor tamaño, orientada a generalización entre tareas |
| TDMPC / VQ-BeT (LeRobot) | no disponible | no disponible | no disponible | Implementadas en LeRobot | Enfoques alternativos de control aprendido dentro del mismo ecosistema |

## Limitaciones y advertencias

- No hay información sobre sesgos, porque no procesa datos humanos ni lenguaje: el equivalente sería el sesgo hacia las condiciones de iluminación, textura y montaje del robot presentes en las demostraciones de entrenamiento.
- Riesgo de fallo fuera de distribución: una política de imitación como ACT degrada rápidamente si la cámara cambia de posición, la iluminación varía o aparecen objetos no vistos durante el entrenamiento.
- Ausencia total de métricas: no se publica tasa de éxito, número de episodios ni condiciones de evaluación, por lo que no se puede afirmar que el checkpoint funcione correctamente en ninguna tarea.
- Contexto y morfología desconocidos: se desconoce para qué robot, cuántos grados de libertad y qué tareas se entrenó. Usarlo con un robot distinto al previsto probablemente produzca acciones inválidas.
- Idiomas: no aplica, pero conviene remarcar que no acepta instrucciones en lenguaje natural; no es un modelo visión-lenguaje-acción.
- Licencia: Apache-2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se documenten los cambios. No hay restricciones de campos de uso, pero también implica que no hay garantías.
- Madurez del artefacto: 0 descargas, 0 "likes", creado y actualizado el mismo día y con "demo" en el nombre. Es razonable tratarlo como un experimento de subida a la Hub, no como un modelo validado.
- Hardware y seguridad física: cualquier despliegue sobre un robot real debe hacerse con límites de par, paradas de emergencia y espacio de trabajo despejado; el modelo no incorpora ninguna capa de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dogeum/demo_parsing_size
- Dataset asociado: https://huggingface.co/datasets/dogeum/demo_parsing_size
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Artículo en arXiv: https://arxiv.org/abs/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante para este modelo. Las consultas devolvieron documentación de Power Query, la página de desambiguación de "Query", el sitio de Query.ai y la web de jQuery, todos ellos sin relación con LeRobot ni con ACT.
