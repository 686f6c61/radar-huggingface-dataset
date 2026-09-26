# eslab1234/smolvla_multitask_5blocks_v3_822ep_from865_expertonly_b32_lr5e6_50k

## Resumen

Este modelo es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, publicado por el usuario `eslab1234` bajo licencia Apache 2.0. Se trata de una política de visión-lenguaje-acción (VLA) compacta, con 450.046.176 parámetros (~450 M), entrenada con la librería LeRobot 0.5.2 para controlar un brazo robótico de tipo `so_follower` (familia SO-100/SO-101) equipado con dos cámaras: una cenital (`top`) y otra en la muñeca (`wrist`). La política recibe el estado del robot (vector de 6 dimensiones) y dos imágenes de 480×640 píxeles, y produce un vector de acción de 6 dimensiones.

El modelo resuelve una tarea de manipulación multitarea concreta: recoger cinco bloques en un orden fijo (rojo, amarillo, madera, verde y azul) y, o bien colocarlos uno a uno en su posición objetivo, o bien apilarlos sobre el bloque anterior. Se entrenó sobre el dataset `eslab1234/multitask_5blocks_v3_822ep_trimmed_merged`, compuesto por 822 episodios y 973.299 fotogramas grabados a 30 FPS.

Su relevancia actual radica en que demuestra el flujo de trabajo completo de SmolVLA (paper arXiv:2506.01844): un VLA de tamaño reducido que aspira a ejecutarse en hardware de consumo en lugar de requerir clústeres de GPUs. No obstante, es un checkpoint de investigación sin resultados de evaluación publicados, con cero descargas y cero «likes» en el momento de redactar esta ficha, por lo que debe tratarse como material experimental y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) derivada de SmolVLA; el modelo base es `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la documentación; pesos publicados en safetensors |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`); repositorio de 1,2 GB |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `top`, `wrist` (480×640, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `eslab1234/multitask_5blocks_v3_822ep_trimmed_merged` (822 episodios, 973.299 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 32 |
| Optimizador / learning rate | AdamW / 5e-06 |
| Semilla | 1000 |
| Versión de LeRobot | 0.5.2 |
| Pipeline en HuggingFace | robotics |
| Fecha de creación del repositorio | 2026-09-25 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una implementación de SmolVLA, descrito en el artículo arXiv:2506.01844 como un modelo de visión-lenguaje-acción compacto orientado a hardware de consumo. Según la información pública asociada a ese trabajo, SmolVLA combina un modelo de visión-lenguaje preentrenado con un experto de acciones y una pila de inferencia asíncrona; la model card de este repositorio no detalla la composición interna, el número de tokens de entrenamiento ni la receta de alineación. Este checkpoint concreto no aporta información adicional al respecto, por lo que los detalles arquitectónicos internos deben considerarse «no disponibles» más allá de lo que describe el paper citado.

Lo que sí está documentado es el ajuste fino: 50.000 pasos, batch de 32, optimizador AdamW con un learning rate muy bajo (5e-06) y semilla 1000, partiendo del modelo base `lerobot/smolvla_base`. El nombre del repositorio (`from865_expertonly_b32_lr5e6_50k`) sugiere, sin que la model card lo confirme, un entrenamiento continuado desde un checkpoint intermedio y una actualización restringida al experto de acciones, con el codificador de visión y el modelo de lenguaje congelados. El dataset contiene dos tareas anotadas en inglés: colocar secuencialmente los cinco bloques en sus posiciones objetivo y apilarlos uno sobre otro, lo que implica que el modelo aprende dos modos de comportamiento a partir de la misma distribución de observaciones.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad a partir de dos vistas de cámara y del estado articular del robot.
- Control por imitación (imitation learning) reactivo: mapea observación a acción sin planificación simbólica explícita.
- Condicionamiento por instrucción en lenguaje natural mediante el campo `--task`, que selecciona entre las dos tareas entrenadas.
- Ejecución multitarea sobre un conjunto fijo de objetos (cinco bloques: rojo, amarillo, madera, verde y azul) y dos comportamientos (colocación individual y apilado).
- Percepción visual doble: vista cenital para la localización global y vista de muñeca para el agarre fino.
- Inferencia asíncrona: la documentación de LeRobot para SmolVLA describe un modo de ejecución desacoplado entre el bucle de control del robot y la inferencia del modelo, pensado para absorber la latencia del forward pass; no se ha verificado su funcionamiento específico en este checkpoint.
- Soporte de tool calling / function calling: no soportado (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no soportado.

## Casos de uso

- Automatización de pick-and-place en un banco de laboratorio: el modelo ejecuta la secuencia completa de recogida y colocación de cinco bloques con un brazo `so_follower`, usando las dos cámaras como única entrada perceptiva, sin necesidad de planificación externa ni de marcadores.
- Apilado de bloques para investigación en manipulación precisa: la segunda tarea entrenada cubre el apilado secuencial sobre el bloque anterior, un banco de pruebas habitual para medir precisión posicional y control de fuerza.
- Baseline reproducible para comparar políticas de imitación: al estar construido sobre LeRobot y con la configuración de entrenamiento documentada, sirve como punto de partida controlado frente a ACT, Diffusion Policy u otros checkpoints del mismo autor.
- Prototipado rápido en hardware de consumo: con ~450 M de parámetros, el modelo puede ejecutarse en una GPU de gama media, lo que permite iterar en un puesto de trabajo sin acceso a un clúster.
- Recolección de datos y evaluación de generalización: útil para medir cómo se degrada la política al variar posiciones iniciales de los bloques, condiciones de iluminación o presencia de distractores en el campo de visión.
- Docencia en cursos de robótica e IA: el flujo completo (grabar dataset, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es reproducible en un aula con un brazo SO-100/SO-101 y dos cámaras.
- Ajuste fino continuado: al ser un checkpoint derivado y Apache 2.0, puede usarse como inicialización para nuevas tareas sobre el mismo robot y la misma disposición de cámaras.
- Asistencia en líneas de montaje sencillas: como demostrador de automatización de bajo coste para clasificación o colocación de piezas discretas, siempre con supervisión humana y parada de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la frase «No evaluation results have been provided for this policy yet» y no aporta tasas de éxito en robot real ni métricas de simulación. Tampoco se han encontrado datos de MMLU, HumanEval, GSM8K ni de tareas de manipulación en la búsqueda realizada. Cualquier cifra de rendimiento de este checkpoint sería una invención.

## Requisitos de hardware

| Precisión | VRAM solo pesos (estimación) | VRAM total en inferencia, batch 1 (estimación) |
|---|---|---|
| fp32 | ~1,8 GB | ~4-5 GB |
| bf16 / fp16 | ~0,9 GB | ~2-3 GB |
| int8 | ~0,45 GB | ~1,5-2 GB |

Las cifras anteriores son estimaciones calculadas a partir del número de parámetros (450 M) y del coste de activaciones de dos imágenes de 480×640; la model card no publica requisitos de hardware.

- Cabe en GPU de consumo: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4070, RTX 4090) debería ser suficiente en bf16/fp16.
- GPU recomendadas para entrenamiento: RTX 3090/4090 o superiores; para inferencia basta una GPU de gama media. No se requiere A100 ni H100.
- CPU: la inferencia en CPU es técnicamente posible para pruebas, pero no para cerrar un bucle de control a 30 FPS.
- Opciones de despliegue: LeRobot con PyTorch sobre CUDA (`lerobot-rollout` para ejecutar la política y `lerobot-train` para reentrenarla). No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no se trata de un modelo de lenguaje de texto sino de una política VLA específica de robótica.
- Latencia y throughput: no disponibles. El dataset está grabado a 30 FPS, por lo que el bucle de control tiene un presupuesto temporal de ~33 ms por paso; la documentación de SmolVLA propone inferencia asíncrona precisamente para relajar esta restricción, pero no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

Las cifras de parámetros de los modelos de terceros son aproximadas y proceden de información pública general, no verificada en la búsqueda realizada. Las de SmolVLA corresponden al recuento real de safetensors de este repositorio.

| Modelo | Parámetros | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|
| Este checkpoint (`smolvla_multitask_5blocks_v3_822ep_...`) | 450 M | Apache 2.0 | HuggingFace, librería LeRobot | Sin evaluar (no hay tasas de éxito publicadas) |
| `lerobot/smolvla_base` | ~450 M | Apache 2.0 | HuggingFace | Resultados del paper SmolVLA (no reproducidos aquí) |
| OpenVLA | ~7 B | Pesos abiertos con condiciones asociadas al modelo de lenguaje subyacente | HuggingFace | Benchmarks publicados por sus autores; no comparable directamente con esta tarea |
| π0 (Physical Intelligence) | ~3,3 B (aproximado) | Pesos abiertos | Repositorio del proyecto | Benchmarks publicados por sus autores sobre tareas de manipulación |

Otras alternativas del mismo autor encontradas en la búsqueda, todas del mismo linaje y tamaño: `smolvla_multitask_5blocks_v3_817ep_from865_expertonly_b32_lr5e6_50k`, `smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k`, `smolvla_multitask_5blocks_v3_684ep_from575_285k_vlmexpert_20k`, `smolvla_multitask_5blocks_v3_795ep_hil_285k_from285k_add80k` y `smolvla_multitask_5blocks_v2_530ep_fullft_b16_300k`. No se dispone de comparativas de rendimiento entre ellas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real ni en simulación, ni número de ensayos por tarea. No se puede afirmar que la política funcione de forma fiable.
- Especialización estrecha: el modelo está entrenado para un robot concreto (`so_follower`), dos cámaras con nombres y posiciones fijos (`top`, `wrist`) y cinco bloques de colores y materiales determinados. Cambiar el robot, la calibración, la resolución, la iluminación o la disposición de los objetos probablemente degrade el comportamiento sin aviso.
- Dependencia de las claves de observación: los nombres de las cámaras deben coincidir exactamente con los del entrenamiento; un mapeo incorrecto produce acciones inválidas.
- Instrucciones restringidas: el condicionamiento por lenguaje se limita a las dos tareas anotadas en inglés; instrucciones fuera de ese conjunto no tienen garantía de funcionamiento.
- Riesgo de acciones erráticas: en robótica, un fallo del modelo se traduce en movimiento físico. Es obligatorio operar con parada de emergencia, espacio de trabajo despejado y supervisión humana. No aplica el concepto de «alucinación» textual, pero sí el de comportamiento fuera de distribución.
- Sesgos: no documentados. El modelo hereda los sesgos del VLM base y los del dataset de imitación, que refleja una única disposición, un único operador y un único entorno.
- Idiomas: no hay soporte multilingüe documentado; el texto de tarea está en inglés.
- Licencia: Apache 2.0 permite uso comercial de estos pesos, pero conviene verificar las condiciones del modelo base `lerobot/smolvla_base` y de las dependencias de LeRobot antes de un despliegue comercial.
- Madurez: cero descargas y cero «likes» en el momento de la consulta, sin demo en vídeo ni issues públicas. El soporte de la comunidad es inexistente.
- Reproducibilidad: el nombre del checkpoint sugiere un entrenamiento parcial (solo el experto de acciones) desde un estado intermedio, pero la model card no lo confirma ni documenta qué se congeló exactamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_822ep_from865_expertonly_b32_lr5e6_50k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v3_822ep_trimmed_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eslab1234/multitask_5blocks_v3_822ep_trimmed_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Checkpoints relacionados del mismo autor:
  - https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_817ep_from865_expertonly_b32_lr5e6_50k
  - https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_684ep_from795hil80k_vlmexpert_20k
  - https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_684ep_from575_285k_vlmexpert_20k
  - https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_795ep_hil_285k_from285k_add80k
  - https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v2_530ep_fullft_b16_300k
