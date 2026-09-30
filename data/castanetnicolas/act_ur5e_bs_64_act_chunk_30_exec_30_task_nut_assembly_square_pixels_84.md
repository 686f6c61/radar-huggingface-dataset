# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_nut_assembly_square_PIXELS_84

## Resumen

ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_nut_assembly_square_PIXELS_84 es una política de aprendizaje por imitación para el brazo robótico Universal Robots UR5e, entrenada con la librería LeRobot de Hugging Face y publicada por el usuario castanetnicolas. Implementa el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv 2304.13705, que predice bloques de acciones (action chunks) en lugar de un único paso de control, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación fina. El modelo resuelve una tarea concreta: coger una tuerca cuadrada y encajarla en una clavija cuadrada (nut assembly square).

La política tiene 51.601.031 parámetros y un tamaño de repositorio de 0,2 GB, lo que la sitúa en el rango de modelos ligeros que caben sin problema en GPU de consumo e incluso en CPU para inferencia. Consume dos cámaras RGB a resolución 84x84 píxeles y un vector de estado de 9 dimensiones, y produce una acción de 7 dimensiones correspondiente al control del efector final. Se entrenó durante 100.000 pasos con batch size 64, optimizador AdamW y tasa de aprendizaje 1e-5 sobre un conjunto de 100 episodios teleoperados (24.602 fotogramas a 20 FPS).

Su relevancia actual radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la compartición y el despliegue de políticas robóticas en PyTorch, y en que sirve como caso reproducible de ACT aplicado a una tarea de ensamblaje industrial. La licencia Apache 2.0 permite uso comercial, aunque el modelo está especializado en una única tarea y configuración de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de observaciones, CVAE y decoder de acciones |
| Parametros totales | 51.601.031 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice chunks de 30 acciones) |
| Tipos de cuantizacion | no disponible; los pesos se publican sin cuantizar |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que, en lugar de predecir una sola acción por paso, genera un bloque de acciones futuras (en este caso, un chunk de 30 acciones con 30 pasos de ejecución, según el nombre del repositorio). La arquitectura combina un encoder que procesa las observaciones (dos imágenes RGB de 3x84x84 y un vector de estado de 9 dimensiones), un cuello de botella de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas y un decoder que emite la secuencia de acciones de 7 dimensiones. Este diseño mitiga el problema de composición de errores típico de las políticas que deciden paso a paso.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset castanetnicolas/UR5e_nut_assembly_square_100_absolute_OSC_POS_SIZE_84, compuesto por 100 episodios teleoperados de la tarea "Pick up the square nut and fit it onto the square peg", con 24.602 fotogramas capturados a 20 FPS. La configuración fue de 100.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 dimensiones para el UR5e a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acción: emite bloques de 30 acciones con 30 pasos de ejecución, lo que aporta suavidad y consistencia al movimiento.
- Percepción visual multimodal: integra dos flujos de cámara (camera1 y camera2) a 84x84 píxeles junto con el estado del robot.
- Ejecución de una tarea específica de ensamblaje: coger una tuerca cuadrada y encajarla en una clavija cuadrada.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se puede reentrenar o afinar con `lerobot-train`.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni comportamiento de agente conversacional.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general ni audio.

## Casos de uso

- Ensamblaje automatizado de tuercas y espigas cuadradas: la política está entrenada específicamente para esta tarea, por lo que puede desplegarse directamente sobre un UR5e con dos cámaras para realizar el encaje de forma repetitiva en una célula de montaje.
- Fine-tuning para tareas de ensamblaje relacionadas: al estar entrenada sobre un dominio de manipulación fina con el mismo robot, sirve como punto de partida para reentrenar con pocos episodios adicionales en variantes de la tarea (otras piezas, otras orientaciones).
- Banco de pruebas comparativo de métodos de imitación: permite comparar ACT frente a alternativas como Diffusion Policy bajo el mismo dataset y hardware, gracias a la integración con LeRobot.
- Evaluación en simulación con MuJoCo: el modelo UR5e de mujoco_menagerie permite trasladar la política a un entorno simulado para validar trayectorias antes del despliegue físico.
- Recolección y ampliación de datos de demostración: el flujo de LeRobot facilita grabar nuevos episodios teleoperados y reentrenar el modelo para mejorar la tasa de éxito.
- Investigación en generalización visual y de posiciones: al depender de dos cámaras a 84x84, es un caso útil para estudiar la robustez ante cambios de iluminación, posición del objeto o presencia de distractores.
- Prototipado rápido de células robóticas de bajo coste: con 51,6 millones de parámetros y 0,2 GB de pesos, la inferencia puede ejecutarse en hardware modesto junto al controlador del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito, métricas de precisión ni comparativas numéricas verificables.

## Requisitos de hardware

- VRAM estimada: con 51.601.031 parámetros, el modelo ocupa aproximadamente 206 MB en fp32 y unos 103 MB en fp16; la inferencia puede ejecutarse incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3060, RTX 4090, A100, H100); no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU o CPU dedicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch; los pesos en safetensors se cargan directamente con la librería. No se documentan integraciones específicas con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por chunk de acción; la tasa del dataset es de 20 FPS, lo que da una referencia del ritmo de control esperado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_UR5e_..._Chunk_30_Exec_30 (este modelo) | 51.601.031 | chunk de 30 acciones | nut assembly square sobre UR5e | apache-2.0 | Hugging Face, 0 descargas |
| castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20 | no disponible | chunk de 20 acciones | misma familia de tareas sobre UR5e | no disponible | Hugging Face |
| Diffusion Policy | no disponible | no disponible | políticas de imitación visual para manipulación | no disponible | paper y repositorios públicos |

La comparación numérica con alternativas no es posible con la información disponible, ya que no se han publicado resultados de evaluación para este modelo ni especificaciones completas de los modelos de la misma familia. La diferencia observable respecto al modelo hermano Chunk_20_Exec_20 es el tamaño del bloque de acciones (30 frente a 20).

## Limitaciones y advertencias

- El modelo está especializado en una única tarea ("Pick up the square nut and fit it onto the square peg") sobre un UR5e concreto; no generaliza a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot físico.
- Depende de una configuración exacta de observaciones: dos cámaras con los nombres `camera1` y `camera2` y una resolución de 3x84x84; cambiar la resolución, el número de cámaras o los nombres rompe la inferencia.
- El dataset de entrenamiento es reducido (100 episodios, 24.602 fotogramas), lo que puede provocar sobreajuste a las posiciones, iluminación y disposición de la escena originales.
- Riesgo de degradación ante cambios de iluminación, distracciones visuales, posiciones iniciales distintas del objeto o un robot del mismo modelo pero con calibración diferente.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni tiene capacidades multilingües, de código o de razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue físico implica riesgos de seguridad que deben gestionarse con paradas de emergencia, límites de fuerza y supervisión humana.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo de control robótico entrenado con demostraciones humanas puede heredar los sesgos de ejecución del teleoperador.
- Ausencia de métricas publicadas de latencia y throughput, lo que dificulta planificar integraciones en líneas de producción con requisitos de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_nut_assembly_square_PIXELS_84
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_nut_assembly_square_100_absolute_OSC_POS_SIZE_84
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_nut_assembly_square_100_absolute_OSC_POS_SIZE_84
- Modelo relacionado (chunk 20 / exec 20): https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20
- Perfil del autor: https://huggingface.co/castanetnicolas
- Descripción del UR5e en MuJoCo Menagerie: https://github.com/google-deepmind/mujoco_menagerie/blob/main/universal_robots_ur5e/README.md
