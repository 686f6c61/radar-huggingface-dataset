# mi-kicic/xarm7_mj_ds32_filtered_xvla

## Resumen

El modelo `mi-kicic/xarm7_mj_ds32_filtered_xvla` es un ajuste fino (fine-tuning) del modelo base `lerobot/xvla-base`, desarrollado por el usuario mi-kicic y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de una política de control para robótica, entrenada con el framework LeRobot, que implementa el arquitectura X-VLA (Vision-Language-Action) con soft prompts y flow-matching. El modelo está especializado en controlar un brazo robótico xArm7 en el simulador MuJoCo, ejecutando la tarea de recoger un motor azul e insertarlo en una caja de cambios naranja, a partir de observaciones visuales de tres cámaras y del estado del robot.

Con aproximadamente 880 millones de parámetros, este modelo representa un ejemplo práctico de cómo un VLA puede ser ajustado a una tarea de manipulación concreta usando técnicas de aprendizaje por imitación. Su relevancia radica en que demuestra el flujo de trabajo completo de LeRobot para entrenar y desplegar políticas robóticas, y en que la arquitectura X-VLA permite adaptar un modelo único a distintas morfologías de robot mediante embeddings de soft prompt, aunque en este caso se ha ajustado específicamente para un entorno simulado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (Vision-Language-Action con soft prompts y flow-matching) |
| Parametros totales | 879.687.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

X-VLA es un framework de visión-lenguaje-acción que codifica cada configuración de robot como una "tarea" mediante un conjunto pequeño de embeddings de soft prompt aprendibles. Esto permite que un único modelo base reconcilie diversas morfologías, sensores y espacios de acción. El modelo base `lerobot/xvla-base` ha sido ajustado para el robot `mujoco_xarm7` usando el dataset `mi-kicic/xarm7_mj_ds32_filtered`, que contiene 1975 episodios y 334022 frames a 10 FPS, todos correspondientes a la tarea de ensamblaje mencionada.

El entrenamiento se realizó con LeRobot versión 0.6.1, durante 30000 pasos, con batch size 64, optimizador `xvla-adamw` y learning rate 0.0001. Las entradas del modelo son tres imágenes (dos de 256×256 y una de 224×224) y un vector de estado de 8 dimensiones; la salida es un vector de acción de 8 dimensiones. No se menciona el uso de RLHF ni DPO; el ajuste se basa en aprendizaje supervisado de imitación.

## Capacidades

- Control de un brazo robótico xArm7 en el simulador MuJoCo, generando acciones de 8 dimensiones (posiciones articulares o velocidades según la configuración).
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cámara frontal, de muñeca y de esquina, lo que permite razonar sobre la escena y la posición del efector final.
- Ejecución de una tarea específica de manipulación: recoger un motor azul e insertarlo en una caja de cambios naranja, guiada por una instrucción en lenguaje natural.
- Integración con el ecosistema LeRobot: puede ser cargado y ejecutado mediante comandos CLI estándar de LeRobot (`lerobot-rollout`), facilitando su uso en entornos de investigación y desarrollo.
- Adaptabilidad a otras tareas mediante fine-tuning adicional sobre el mismo modelo base, gracias a la arquitectura de soft prompts de X-VLA.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de ensamblaje en simulación: el modelo puede insertarse en un pipeline de simulación MuJoCo para validar secuencias de ensamblaje antes de implementarlas en un robot físico, reduciendo costes y riesgos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA se adaptan a tareas específicas con pocos datos, o para comparar diferentes estrategias de fine-tuning.
- Desarrollo de políticas de control para brazos robóticos: los investigadores pueden usar este modelo como referencia para entrenar sus propias políticas sobre el mismo robot o tareas similares.
- Benchmarking de algoritmos de visión-lenguaje-acción: al estar disponible públicamente y ser reproducible con LeRobot, permite comparar el rendimiento de X-VLA frente a otros enfoques en un entorno controlado.
- Educación en robótica y aprendizaje automático: el modelo y su dataset asociado ofrecen un caso práctico para enseñar conceptos de aprendizaje por refuerzo, imitación y control basado en visión.
- Pruebas de transferencia sim-to-real: aunque el modelo se ha entrenado solo en simulación, puede usarse como línea base para experimentos de transferencia a un robot real, evaluando la brecha de realidad.
- Integración en sistemas de demostración: puede desplegarse en ferias o laboratorios para mostrar capacidades de manipulación autónoma en entornos virtuales, requiriendo únicamente una GPU y el simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~880M parámetros. En precisión fp32, los pesos ocuparían aproximadamente 3.5 GB; en fp16/bf16, alrededor de 1.8 GB (coincide con el tamaño del repositorio). Se estima que la inferencia requiere entre 4 y 8 GB de VRAM, dependiendo de la precisión y del lote.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4090 o superiores. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 16 GB o más (por ejemplo, A100, RTX 4090).
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB o una RTX 4070 pueden ejecutar el modelo sin problemas en fp16.
- Opciones de despliegue: el modelo se ejecuta a través de LeRobot, que utiliza PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia de LLM, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no se han proporcionado datos específicos. En una GPU moderna, se espera que la inferencia sea lo suficientemente rápida para control en tiempo real (por debajo de 100 ms por paso), pero esto no está confirmado.

## Comparativa con modelos similares

No se ha proporcionado información comparativa con otros modelos en la documentación disponible. No obstante, al ser un fine-tuning de `lerobot/xvla-base`, puede compararse conceptualmente con otros VLA de tamaño similar como OpenVLA (7B) o SmolVLA (menor tamaño), aunque no hay datos de rendimiento para establecer una comparación cuantitativa. Se recomienda consultar la literatura de X-VLA (arxiv:2510.10274) para ver comparaciones del modelo base.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea muy específica (recoger motor azul e insertarlo en caja de cambios naranja) y en un entorno simulado (MuJoCo). No se ha validado en un robot físico.
- Requiere una configuración exacta de cámaras y calibración del robot; cualquier cambio en posiciones, iluminación o tipo de cámara puede degradar significativamente el rendimiento.
- No se han reportado resultados de evaluación en el mundo real ni en condiciones de variabilidad, por lo que su robustez es desconocida.
- Al ser un modelo de imitación, puede presentar comportamientos erráticos si las observaciones se desvían del dominio de entrenamiento (por ejemplo, objetos en posiciones no vistas).
- La dependencia de LeRobot y de la versión específica (0.6.1) puede limitar su portabilidad a otros entornos.
- No se documentan sesgos específicos, pero al provenir de un dataset sintético de una sola tarea, es probable que no generalice a otras instrucciones o escenarios.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse los términos de las dependencias (LeRobot, MuJoCo) que pueden tener restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mi-kicic/xarm7_mj_ds32_filtered_xvla
- Dataset de entrenamiento: https://huggingface.co/datasets/mi-kicic/xarm7_mj_ds32_filtered
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Guía de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
