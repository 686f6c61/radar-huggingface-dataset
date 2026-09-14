# eslab1234/smolvla_multitask_5blocks_v3_684ep_from20k_add60k_vlmexpert

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) compactos orientados a robótica, y esta ficha corresponde a un *fine-tune* concreto publicado por el usuario `eslab1234` sobre el modelo base `lerobot/smolvla_base`. El resultado es una política de imitación de 450.046.176 parámetros (aproximadamente 450 M) que consume el estado articular de un brazo `so_follower` de 6 grados de libertad y dos cámaras RGB (vista superior y vista de muñeca, 480x640 a 30 FPS) y produce un vector de acción de 6 dimensiones. Su relevancia está en que demuestra que una política VLA de este tamaño puede entrenarse y ejecutarse en hardware de consumo, algo que el propio autor del modelo base destaca en la model card.

El modelo está especializado en dos tareas muy concretas de manipulación: recoger cinco bloques en secuencia (rojo, amarillo, madera, verde, azul) y colocarlos en posiciones designadas, o bien apilarlos uno sobre otro. Se entrenó con el dataset `eslab1234/multitask_5blocks_v3_684ep_merged` (684 episodios, 756.370 fotogramas, 30 FPS) durante 60.000 pasos con AdamW y una tasa de aprendizaje de 5e-06.

Se distribuye con licencia Apache 2.0, en formato safetensors y dentro del ecosistema LeRobot, lo que facilita su reproducción con las herramientas oficiales de Hugging Face. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA (paper arXiv:2506.01844); la model card no detalla las capas internas |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible; las dos tareas del dataset están descritas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de pipeline | `robotics` (política de control, no generación de texto) |
| Modelo base | `lerobot/smolvla_base` (*fine-tune*) |
| Robot objetivo | `so_follower` (brazo de 6 GDL) |
| Cámaras | `top` y `wrist`, 480x640, 30 FPS |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `eslab1234/multitask_5blocks_v3_684ep_merged` |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo visión-lenguaje-acción compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. No obstante, la ficha publicada no especifica el número de capas, la dimensión oculta, el mecanismo de atención ni el tipo de cabecera de acción; el paper referenciado (arXiv:2506.01844) es la fuente indicada para esos detalles y no se ha recuperado información adicional a través de la búsqueda web. Lo que sí queda documentado es la interfaz: una política que mapea estado propioceptivo de 6 dimensiones más dos flujos de imagen a una acción continua de 6 dimensiones, condicionada por una instrucción de tarea en lenguaje natural.

El entrenamiento se realizó mediante *fine-tuning* supervisado del modelo base `lerobot/smolvla_base` con LeRobot 0.5.2: 60.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-06 y semilla 1000. El dataset contiene 684 episodios y 756.370 fotogramas a 30 FPS, con dos tareas de manipulación (colocación individual de cinco bloques y apilado de los mismos). El nombre del repositorio (`from20k_add60k_vlmexpert`) sugiere que el entrenamiento partió de un punto de control previo de 20.000 pasos y que se añadieron 60.000 pasos adicionales, posiblemente con un experto VLM, pero la model card no confirma esta interpretación.

## Capacidades

- Generación de acciones motoras continuas de 6 grados de libertad para un brazo `so_follower`, a partir de observaciones multimodales (estado articular y dos cámaras).
- Ejecución de dos tareas de manipulación aprendidas por imitación: colocación secuencial de cinco bloques (rojo, amarillo, madera, verde, azul) en posiciones objetivo designadas, y apilado de esos mismos bloques uno sobre otro.
- Condicionamiento por instrucción de tarea en lenguaje natural: la política acepta una cadena de texto que describe la tarea (las dos incluidas en el dataset).
- Percepción visual desde dos puntos de vista simultáneos, lo que permite cierto grado de razonamiento espacial sobre la posición de los objetos.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales ni generación de texto.
- No se documentan capacidades multilingües, de visión general (descripción de imágenes), de audio ni de código.
- No se documenta un modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Manipulación robótica de bloques en laboratorio: la política se ejecuta en bucle cerrado con `lerobot-rollout` para completar la secuencia de recogida y colocación de los cinco bloques, aprovechando el condicionamiento por tarea para alternar entre las dos variantes entrenadas.
- Apilado de objetos: la segunda tarea del dataset permite usar el modelo para construir una torre de cinco piezas, una habilidad útil como bloque de construcción en tareas de ensamblaje simples.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del número de episodios, del preentrenamiento del modelo base o de la inicialización desde puntos de control intermedios.
- Benchmark interno de políticas VLA: al ser un modelo de 450 M en Apache 2.0, puede compararse con otras políticas de la misma categoría bajo el mismo protocolo de evaluación en un SO-100.
- Generación de datos sintéticos de demostración: ejecutando la política de forma autónoma se pueden recolectar trayectorias adicionales que después se filtren y reutilicen en entrenamientos posteriores.
- Prototipado educativo y democratización del acceso: al caber en GPU de consumo, permite montar un puesto de robótica de bajo coste para docencia o talleres sin depender de clústeres.
- Validación de canalizaciones de despliegue en LeRobot: útil para verificar la calibración de cámaras, los nombres de las claves de observación y el flujo `lerobot-train` / `lerobot-rollout` antes de escalar a modelos mayores.
- Automatización de rutinas de *pick-and-place* repetitivas en entornos controlados, siempre que las condiciones de iluminación y la posición inicial de las piezas se mantengan dentro de la distribución del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card incluye la línea «No evaluation results have been provided for this policy yet», es decir, el autor no ha reportado tasas de éxito en robot real ni en simulación. La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (los resultados obtenidos correspondían a entidades bancarias sin relación alguna).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,2 GB en el repositorio; en precisión de 16 bits el modelo ronda 0,9-1 GB de pesos, y sumando las activaciones de dos imágenes de 480x640 y el estado de 6 dimensiones el consumo total previsible se sitúa por debajo de 4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. La model card del modelo base indica explícitamente que está pensado para hardware de consumo, por lo que no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en tarjetas de gama media con 8 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento, ambos dentro del ecosistema LeRobot sobre PyTorch y CUDA. No aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, ya que el modelo emite acciones motoras y no tokens.
- Latencia y throughput: no disponibles. El control se realiza a 30 FPS en el dataset, y el paper del modelo base aborda el despliegue eficiente en hardware de consumo, pero no se proporcionan cifras concretas de latencia o frecuencia de control en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`smolvla_multitask_5blocks_v3_684ep_from20k_add60k_vlmexpert`) | 450.046.176 | VLA especializada en dos tareas de bloques con SO-100 | No disponible | Apache 2.0 | Hugging Face, vía LeRobot |
| `lerobot/smolvla_base` | Aproximadamente 450 M (misma familia) | VLA generalista preentrenada, base de este *fine-tune* | No disponible | Apache 2.0 | Hugging Face, vía LeRobot |
| OpenVLA | 7 000 M (7 B) | VLA generalista basada en un VLM de 7 B | No disponible | MIT | Hugging Face |
| Políticas específicas de tarea tipo ACT o *diffusion policy* dentro de LeRobot | No disponible | Políticas de imitación sin componente de lenguaje | No aplica | No disponible | Repositorio LeRobot |

La comparación cuantitativa de rendimiento no es posible: no hay resultados publicados para este *fine-tune* y la búsqueda web no aportó datos adicionales sobre alternativas en el mismo escenario experimental.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real de la política.
- Especialización extrema: solo se ha entrenado con dos tareas y un único tipo de robot (`so_follower`); fuera de ese guion previsible, el comportamiento no está garantizado.
- Dependencia del montaje físico: las cámaras deben llamarse `top` y `wrist`, estar a 30 FPS y a 480x640, y la calibración del robot debe coincidir con la del dataset, o la política fallará.
- Riesgo de sobreajuste al entorno de recogida: cambios en iluminación, fondo, posición inicial de los bloques o presencia de distractores pueden degradar el rendimiento, tal como advierte la propia plantilla de la model card.
- Sesgos de los datos de teleoperación: al derivar de demostraciones humanas, la política hereda las trayectorias, la velocidad y los sesgos del operador que grabó los 684 episodios.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea del dataset están en inglés y cualquier traducción literal podría no funcionar.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero no cubre posibles patentes de terceros ni las condiciones del dataset o del hardware empleado, que deben verificarse por separado.
- Despliegue en producción: al tratarse de un modelo con 0 descargas y 0 *likes* en el momento de la consulta, carece de validación por parte de la comunidad; conviene tratarlo como artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_684ep_from20k_add60k_vlmexpert
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v3_684ep_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eslab1234/multitask_5blocks_v3_684ep_merged
