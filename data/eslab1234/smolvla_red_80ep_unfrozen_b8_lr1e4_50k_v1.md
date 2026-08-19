# eslab1234/smolvla_red_80ep_unfrozen_b8_lr1e4_50k_v1

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en tareas de manipulación. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 80 episodios de una tarea de apilado de bloques de colores, utilizando el robot tipo `so_follower` con tres cámaras (superior, muñeca y lateral). El modelo ha sido entrenado con LeRobot, la librería de aprendizaje por imitación de Hugging Face, y está publicado bajo licencia Apache 2.0.

Con 450 millones de parámetros, el modelo es lo suficientemente pequeño para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores que trabajan con robots de bajo coste. Su relevancia radica en que demuestra cómo un VLA compacto puede especializarse en una tarea concreta mediante fine-tuning, sin necesidad de infraestructura de alto rendimiento. La arquitectura exacta se describe en el paper arXiv:2506.01844, aunque los detalles internos no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacto, basado en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponible (modelo orientado a robótica, no a lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA, descrita en el paper arXiv:2506.01844, que combina visión, lenguaje y acción en un modelo compacto y eficiente. No se proporcionan detalles internos sobre el tipo de transformer, mecanismos de atención o componentes específicos en la información disponible. El fine-tuning se realizó sobre el modelo base `lerobot/smolvla_base`, utilizando el dataset `eslab1234/five_blocks_full_top_wrist_side_80ep_merged_v1`, que contiene 80 episodios y 110.402 fotogramas a 30 FPS. La tarea consistía en recoger bloques de colores (rojo, amarillo, madera, verde y azul) en un orden específico y colocarlos en sus ranuras correspondientes. El entrenamiento se ejecutó durante 50.000 pasos con batch size 8, optimizador AdamW y learning rate 0,0001, con semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (posición y orientación del efector) a partir de observaciones de estado y tres cámaras RGB.
- Percepción multi-cámara: procesa simultáneamente imágenes de cámaras superior, de muñeca y lateral, cada una a 480x640 píxeles.
- Aprendizaje por imitación: reproduce la política demostrada en el dataset de entrenamiento para la tarea específica de apilado de bloques.
- Ejecución en tiempo real: pensado para inferencia en bucle cerrado sobre el robot, con salida de acciones a 30 FPS.
- No incluye generación de texto, tool calling, razonamiento simbólico ni capacidades multilingües; es un modelo puramente orientado a control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la secuencia de recoger y colocar bloques de colores en ranuras, útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA compacto se adapta a tareas específicas con pocos datos (80 episodios).
- Desarrollo de robots de bajo coste: al ser un modelo de 450M parámetros, puede desplegarse en GPUs de consumo, facilitando la experimentación en entornos académicos o de pequeñas empresas.
- Benchmark de control robótico: puede utilizarse como referencia para comparar el rendimiento de otros VLA en la misma tarea, aunque no se han publicado resultados oficiales.
- Fine-tuning adicional: los pesos pueden servir como base para adaptar el modelo a tareas similares de manipulación con nuevas demostraciones.
- Integración con LeRobot: al estar entrenado con esta librería, se puede integrar fácilmente en pipelines existentes de captura de datos, entrenamiento y despliegue en robots compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- El modelo tiene 450.046.176 parámetros; el repositorio pesa 1,2 GB, lo que sugiere que los pesos están almacenados en precisión FP32 o BF16.
- Para inferencia en FP32, la VRAM estimada sería de aproximadamente 1,8 GB, y en FP16 alrededor de 0,9 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- No se especifican GPUs recomendadas ni latencia/throughput medidos. La descripción del paper indica que SmolVLA está diseñado para hardware de consumo, pero no hay datos concretos de rendimiento en este repo.
- Opciones de despliegue: dado que usa LeRobot, se puede ejecutar con el comando `lerobot-rollout` sobre el robot físico. No se mencionan soportes para vLLM, llama.cpp u otros motores de inferencia genéricos, ya que es un modelo de control robótico, no de lenguaje.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones detalladas de otros VLA comparables (como OpenVLA, RT-2 o modelos propietarios) en la información proporcionada. Se puede indicar que SmolVLA se presenta como una alternativa compacta a modelos más grandes, pero sin cifras concretas no es posible realizar una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente para una tarea específica (apilado de bloques de colores en orden); no es generalizable a otras tareas sin fine-tuning adicional.
- No se han publicado resultados de evaluación en el robot real, por lo que el rendimiento real es desconocido.
- Depende de la configuración exacta de cámaras y del robot `so_follower`; cambios en la iluminación, posición de objetos o distracciones pueden degradar el rendimiento.
- El dataset es pequeño (80 episodios), lo que puede provocar sobreajuste a las condiciones de recogida de datos.
- No se han documentado sesgos específicos, pero al ser un modelo de control motor, no presenta riesgos de sesgo lingüístico; sin embargo, la alucinación no aplica en este contexto.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base y del dataset asociado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eslab1234/smolvla_red_80ep_unfrozen_b8_lr1e4_50k_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/five_blocks_full_top_wrist_side_80ep_merged_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
