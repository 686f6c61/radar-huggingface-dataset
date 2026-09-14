# HyeonseokE/smolvla_ablation2_stack_2_cubes_A2_1000_10fps

## Resumen

HyeonseokE/smolvla_ablation2_stack_2_cubes_A2_1000_10fps es una política robótica de tipo vision-language-action (VLA) publicada en Hugging Face por el usuario HyeonseokE. No es un modelo de lenguaje: es un fine-tune de SmolVLA, un VLA compacto de 450.046.176 parámetros (~450 M) que consume imágenes de cámara, el estado articular del robot y una instrucción de tarea en lenguaje natural, y produce un vector de acción de 6 dimensiones.

Está especializada en una única tarea de manipulación, «Stack the green block on the red block» (apilar el bloque verde sobre el rojo), ejecutada por un brazo SO-101 (`so101_follower`) con cámaras `top` y `left_wrist`. El dataset de entrenamiento contiene 100 episodios y 38.853 fotogramas a 10 FPS, y el entrenamiento se hizo en 30.350 pasos con batch de 64, learning rate 1e-4 y semilla 1000, partiendo de `lerobot/smolvla_base`.

Su interés es doble: demuestra que un VLA de ~450 M puede entrenarse y desplegarse en hardware de consumo, y sirve como artefacto reproducible de un estudio de ablación (variante A2, semilla 1000). Con 0 descargas y sin resultados de evaluación publicados, debe tratarse como material de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA: backbone de visión-lenguaje más experto de acciones; fine-tune de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; el histórico de observaciones lo fija el bucle de control) |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible; la instrucción de tarea se proporciona en inglés («Stack the green block on the red block.») |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,9 GB) |
| Pipeline | robotics |
| Librería / framework | LeRobot 0.6.0 |
| Tipo de robot | `so101_follower` |
| Cámaras declaradas | `top`, `left_wrist` (las entradas del modelo se nombran `observation.images.camera1`, `camera2` y `camera3`) |
| Entradas | `observation.state` (6,), `observation.images.cameraX` (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Frecuencia del dataset | 10 FPS |

## Arquitectura y entrenamiento

Se trata de un fine-tune de SmolVLA, el modelo presentado en el artículo arXiv:2506.01844, descrito por sus autores como un VLA compacto y eficiente que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. La arquitectura combina un backbone de visión-lenguaje con un experto de acciones que genera las trayectorias de control; el conjunto pesa 450.046.176 parámetros, muy por debajo de los VLA de miles de millones de parámetros habituales.

El entrenamiento es de imitación (behavior cloning) sobre el dataset `HyeonseokE/ablation2_stack_2_cubes_A2_10fps`: 100 episodios, 38.853 fotogramas a 10 FPS, con una sola tarea anotada. No hay indicios de RLHF, DPO ni aprendizaje por refuerzo. La configuración registrada es de 30.350 pasos, batch de 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.0. No se documenta composición adicional del dataset, aumentos de datos ni innovaciones técnicas propias más allá de las del método SmolVLA.

## Capacidades

- Generación de acciones de control de 6 grados de libertad a partir de observaciones multimodales (estado articular más hasta tres cámaras RGB de 256x256).
- Ejecución de una tarea de manipulación concreta: apilar el bloque verde sobre el bloque rojo.
- Condicionamiento por instrucción en lenguaje natural (una única instrucción en inglés en el dataset de entrenamiento).
- Control en bucle cerrado con realimentación visual, pensado para ejecutarse a la frecuencia del dataset (10 FPS).
- Integración con el ecosistema LeRobot: `lerobot-rollout` para inferencia en robot y `lerobot-train` para reentrenamiento.
- Fine-tuning adicional sobre nuevos datasets como política base.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, planificación multi-paso ni razonamiento encadenado explícito.
- No es multilingüe en el sentido habitual: no genera texto y no se ha documentado entrenamiento con instrucciones en varios idiomas.
- No dispone de modo «thinking», ni de entrada o salida de audio, ni de generación de texto o código.
- No hay resultados de evaluación publicados que cuantifiquen su tasa de éxito.

## Casos de uso

- Reproducción del experimento de apilado: ejecutar la política sobre un SO-101 con las mismas cámaras y la tarea declarada, para verificar el comportamiento del checkpoint en un montaje físico concreto.
- Estudio de ablaciones: comparar esta variante (A2, semilla 1000, 10 FPS) con otras configuraciones del mismo estudio para aislar el efecto de la frecuencia de muestreo o del conjunto de datos.
- Punto de partida para fine-tuning: usar `lerobot-train` con `--policy.path` apuntando a este repositorio para adaptar la política a una tarea nueva con un dataset propio, aprovechando que solo requiere ~450 M de parámetros.
- Laboratorio docente de robótica de bajo coste: montar un brazo SO-101 más una GPU de gama media y demostrar un ciclo completo de grabación de datos, entrenamiento por imitación y despliegue.
- Validación de pipelines de datos: comprobar el efecto de la resolución temporal (10 FPS) y de la disposición de cámaras en el rendimiento de una política de imitación, comparándola con variantes a otras frecuencias.
- Pruebas de latencia y despliegue en hardware de consumo: medir el tiempo de inferencia por paso de control en GPUs no profesionales y determinar si el bucle se sostiene a 10 Hz.
- Evaluación de robustez: repetir la tarea con posiciones iniciales, iluminación o fondos distintos para caracterizar la degradación fuera de la distribución del dataset.
- Referencia de eficiencia: usarla como línea base de un VLA de 450 M frente a políticas de miles de millones de parámetros en estudios de compromiso entre coste y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: «No evaluation results have been provided for this policy yet», y la plantilla de evaluación (tarea, ensayos, éxitos, tasa de éxito) aparece vacía. Tampoco se proporcionan métricas de MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a un modelo de acción robótica.

## Requisitos de hardware

- El repositorio ocupa 0,9 GB, cifra coherente con 450 M de parámetros almacenados en bf16 (en fp32 serían ~1,8 GB).
- VRAM estimada para inferencia: del orden de 2 a 4 GB incluyendo activaciones y codificación visual de hasta tres cámaras a 256x256; se trata de una estimación derivada del recuento de parámetros, no de una medición publicada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Modelos como RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes; no se requieren A100 ni H100.
- Cabe holgadamente en GPU de consumo, e incluso en iGPU o CPU con suficiente memoria, aunque sin garantía de sostener los 10 Hz del bucle de control.
- Opciones de despliegue: `lerobot-rollout` para ejecución sobre el robot y `lerobot-train` para reentrenamiento, con PyTorch y CUDA. No aplican vLLM, TGI, Ollama ni llama.cpp, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles. La política se entrenó con datos a 10 FPS, por lo que el bucle de inferencia debería ejecutarse a 10 Hz para reproducir las condiciones de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 450.046.176 | no disponible | Apilado de 2 cubos en SO-101 | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | ~450 M (el fine-tune conserva la arquitectura del modelo base) | no disponible | Política generalista para fine-tuning | apache-2.0 | Hugging Face |
| Otros VLA comparables (OpenVLA, pi0, RDT-1B, familia SmolVLA del artículo) | no disponible en la información proporcionada | no disponible | Manipulación robótica | no disponible | no disponible |

Los únicos datos verificables en la información disponible son los del propio checkpoint y su relación de dependencia con `lerobot/smolvla_base`. Cualquier comparación cuantitativa de rendimiento con otros VLA requeriría datos de evaluación que este repositorio no publica.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no incluye tasa de éxito ni número de ensayos, por lo que se desconoce si la política funciona de forma fiable.
- Sin validación de la comunidad: 0 descargas y 0 «likes» en el momento de redactar esta ficha.
- Tarea única: solo se ha entrenado para apilar dos bloques; no generaliza a otras instrucciones ni a otras tareas de manipulación.
- Dependencia estricta del montaje: requiere un robot `so101_follower`, dos cámaras con los nombres `top` y `left_wrist`, y claves de observación que coincidan exactamente con las del entrenamiento. Si cambia el nombre, el índice o la posición de las cámaras, la política no funcionará correctamente.
- Sensibilidad esperable a iluminación, fondo, posición inicial de los objetos y calibración del robot, al ser un modelo de imitación entrenado con 100 episodios en un único entorno.
- Riesgo de error acumulado (compounding error), característico del behavior cloning: pequeños desvíos pueden llevar a estados fuera de la distribución de entrenamiento.
- Sin capacidades lingüísticas generales: no genera texto, código ni conversación, y no soporta múltiples idiomas de instrucción.
- Alucinación en el sentido habitual no aplica; el equivalente es la ejecución de acciones plausibles pero incorrectas cuando la escena difiere de los datos de entrenamiento.
- Sesgos: no documentados. La política hereda los sesgos de los datos de demostración (posiciones, colores y disposición concretos de los objetos).
- Licencia apache-2.0: permite uso comercial y modificación, sin garantías y sin cláusulas de atribución obligatoria más allá del mantenimiento del aviso de licencia.
- El nombre del repositorio sugiere que es una variante de ablación (A2) y no necesariamente el mejor checkpoint de su serie; conviene comprobar otras variantes antes de sacar conclusiones de rendimiento.
- No debe integrarse en producción robótica sin una validación previa en el montaje real y con medidas de seguridad física activas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_stack_2_cubes_A2_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_stack_2_cubes_A2_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_stack_2_cubes_A2_10fps
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes sobre este modelo: todas las entradas devueltas tratan sobre Facebook y limpieza de archivos temporales, sin relación con SmolVLA ni con robótica.
