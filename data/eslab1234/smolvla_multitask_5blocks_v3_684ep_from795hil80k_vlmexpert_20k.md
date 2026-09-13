# eslab1234/smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) orientado a robótica, presentado en el paper arXiv:2506.01844. Este repositorio concreto, `eslab1234/smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario `eslab1234` con la librería LeRobot (versión 0.5.2). El modelo toma observaciones visuales (dos cámaras) y el estado del robot, y produce comandos de acción de 6 grados de libertad.

La arquitectura combina un modelo de visión-lenguaje (VLM) con un experto de acción, sumando 450.046.176 parámetros (aproximadamente 450 millones), lo que lo sitúa en la gama de modelos ligeros desplegables en hardware de consumo. Frente a los VLA de gran tamano (varios miles de millones de parámetros), SmolVLA apunta a un rendimiento competitivo con un coste computacional mucho menor.

Este checkpoint está especializado en dos tareas concretas de manipulación: recoger cinco bloques en secuencia (rojo, amarillo, madera, verde y azul) y colocarlos en sus posiciones objetivo, o bien apilarlos uno sobre otro. Se entrenó sobre un dataset propio de 684 episodios y 756.370 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): VLM base más experto de acción |
| Parámetros totales | 450.046.176 (aprox. 450 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Sensores de entrada | observation.state `(6,)`, observation.images.top `(3, 480, 640)`, observation.images.wrist `(3, 480, 640)` |
| Salida | action `(6,)` |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un modelo de visión-lenguaje preentrenado con un experto de acción dedicado, segun se describe en el paper arXiv:2506.01844. La política consume observaciones multimodales (estado propioceptivo de 6 dimensiones y dos flujos de imagen de 480x640 píxeles) y emite un vector de acción de 6 dimensiones. El checkpoint aquí descrito mantiene el mismo número de parámetros que el modelo base (450 M), lo que indica que el ajuste fino no alteró la topología del modelo, sino solo los pesos.

El ajuste fino se realizó con LeRobot 0.5.2 sobre el dataset `eslab1234/multitask_5blocks_v3_684ep_merged` (684 episodios, 756.370 fotogramas, 30 FPS). La configuración de entrenamiento registrada incluye 20.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 5e-06 y semilla 1000. El nombre del repositorio (`vlmexpert_20k`) sugiere que los 20.000 pasos corresponden al experto VLM. No se especifica en la model card si hubo fases de RLHF, DPO ni decodificación especulativa para este ajuste concreto.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir de imágenes y estado del robot.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (`top` y `wrist`) a resolución 480x640.
- Ejecución de instrucciones en lenguaje natural: acepta una descripción textual de la tarea (por ejemplo, la secuencia de recogida y colocación de bloques).
- Manipulación multitarea: entrenado para dos variantes de tarea (colocación individual de bloques y apilado).
- Política condicionada por objetivo: la tarea se pasa como cadena de texto, lo que permite cambiar el objetivo sin reentrenar.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, generación de código ni audio en la información disponible.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo puede recoger objetos en secuencia y depositarlos en posiciones predefinidas, usando las dos cámaras para localizar y agarrar cada pieza con la pinza del `so_follower`.
- Apilado de objetos: la segunda tarea del dataset permite apilar bloques uno sobre otro, útil en operaciones de paletizado o ensamblaje simple.
- Investigación en aprendizaje por imitación: sirve como punto de partida o referencia para experimentos de VLA de bajo coste computacional, ya que se entrena y ejecuta con LeRobot.
- Prototipado en robótica de bajo presupuesto: al ser un modelo de 450 M de parámetros, puede desplegarse en hardware de consumo y validar políticas antes de escalar a modelos mayores.
- Recogida y clasificación de piezas por color: el dataset incluye bloques de cinco colores (rojo, amarillo, madera, verde, azul), de modo que la política puede distinguir y ordenar objetos por categoría.
- Evaluación de políticas condicionadas por lenguaje: permite estudiar cómo una misma red cambia de comportamiento según la instrucción textual recibida, manteniendo fijos los pesos.
- Base para ajuste fino en nuevas tareas: al derivar de `lerobot/smolvla_base`, se puede reentrenar con un dataset propio siguiendo el flujo de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este checkpoint indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política, por lo que no hay tasas de éxito medidas en robot real ni cifras de simulación. El paper de referencia (arXiv:2506.01844) contiene evaluaciones del método SmolVLA, pero los valores concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB con pesos en bf16/fp16 (450 M de parámetros) y aproximadamente 2-4 GB contando activaciones y dos flujos de imagen a 480x640. Estas cifras son estimaciones a partir del tamano del modelo, no datos publicados.
- Cabe sin problema en GPU de consumo: tarjetas con 6-8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) son suficientes. El paper describe SmolVLA como desplegable en hardware de consumo.
- GPU de datacenter (A100, H100) no son necesarias para inferencia, aunque pueden usarse si se requiere paralelizar varias políticas o entrenar.
- Despliegue: mediante la librería LeRobot, con el comando `lerobot-rollout` para ejecutar la política en el robot. La model card no menciona compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card no publica cifras de FPS de inferencia ni de latencia por acción, aunque el dataset de entrenamiento se capturó a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`eslab1234/smolvla_..._20k`) | 450 M | no disponible | apache-2.0 | HuggingFace (0 descargas, 0 likes) | Ajuste fino multitarea de SmolVLA sobre 684 episodios |
| `lerobot/smolvla_base` | 450 M | no disponible | apache-2.0 | HuggingFace (modelo base oficial) | Modelo base sin ajustar del que deriva este checkpoint |
| OpenVLA | aprox. 7 B | no disponible | no disponible en la información disponible | HuggingFace | VLA de referencia de mayor tamano; cifras exactas no disponibles en la información proporcionada |
| π0 (Physical Intelligence) | aprox. 3 B | no disponible | no disponible en la información disponible | no disponible | VLA de propósito general; datos no disponibles en la información proporcionada |

La comparación con OpenVLA y π0 se incluye como referencia de categoría; los datos concretos de estos modelos no forman parte de la información proporcionada y podrían no ser exactos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política en robot, tanto en las tareas entrenadas como en variaciones.
- Especialización estrecha: el modelo solo se ha ajustado para dos tareas concretas con cinco bloques; es probable que no generalice a otros objetos, posiciones o entornos fuera de la distribución del dataset.
- Dependencia del hardware: está entrenado para el robot `so_follower` con exactamente dos cámaras (`top` y `wrist`) a 480x640; usar otra configuración de sensores puede invalidar la política.
- Sesgos: no hay información sobre sesgos, pero al entrenarse con un dataset propio y limitado puede heredar los sesgos de las demostraciones (posiciones, iluminación y objetos concretos).
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar acciones erróneas o inseguras ante entradas fuera de distribución; requiere supervisión y mecanismos de parada de emergencia.
- Contexto e idioma: la longitud de contexto no está documentada y las instrucciones del dataset están en inglés; no se garantiza el funcionamiento con instrucciones en otros idiomas.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `lerobot/smolvla_base` y del dataset utilizado.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay validación externa de su calidad.
- Sin cuantizaciones publicadas ni datos de rendimiento en producción; cualquier despliegue real requiere una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v3_684ep_merged
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
