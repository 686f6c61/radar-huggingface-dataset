# maedmatt/DREAM_SmolVLA

## Resumen

DREAM_SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto, desarrollado por el usuario maedmatt, que consiste en un fine-tuning del modelo base SmolVLA (lerobot/smolvla_base) para una tarea robótica específica: rellenar una pirámide con círculos. SmolVLA, descrito en el paper arxiv:2506.01844, es una arquitectura eficiente diseñada para ejecutarse en hardware de consumo, y este fine-tuning demuestra su aplicación práctica en un escenario de manipulación robótica por imitación.

El modelo se ha entrenado con el dataset DREAM-pyramid-circles, que contiene 151 episodios y 81 266 frames capturados a 30 FPS, y genera acciones de 6 dimensiones a partir de observaciones compuestas por el estado del robot y tres imágenes de cámaras. Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, está pensado para ser desplegado en robots tipo `so_follower` mediante la librería LeRobot. Su relevancia radica en ser un ejemplo de fine-tuning de un VLA compacto sobre una tarea concreta, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura de visión-lenguaje-acción compacta y eficiente que, según el paper asociado, logra un rendimiento competitivo con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. No se proporcionan detalles internos de la arquitectura (como el tipo de transformer o mecanismos de atención) en la información disponible.

El entrenamiento se realizó mediante fine-tuning desde el modelo base `lerobot/smolvla_base` utilizando el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 151 episodios y 81 266 frames a 30 FPS para la tarea "Fill the pyramid with circles". La configuración de entrenamiento incluye 20 000 pasos, batch size de 64, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000, todo ello con la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Genera acciones de 6 dimensiones (control del robot) a partir de observaciones multimodales: estado del robot (vector de 6) y tres imágenes RGB de 256x256 píxeles.
- Ejecuta la tarea específica "Fill the pyramid with circles" en un robot tipo `so_follower`.
- Procesa entradas visuales de tres cámaras simultáneamente, lo que permite percepción estereoscópica o multivista.
- No tiene capacidades de generación de texto, tool calling, agentes ni razonamiento simbólico; es exclusivamente una política de control robótico.
- No se reportan capacidades multilingües ni de visión general fuera del contexto robótico.

## Casos de uso

- Manipulación robótica por imitación: el modelo puede ejecutar la tarea de apilar círculos en una pirámide, sirviendo como política de control en tiempo real para un robot `so_follower`.
- Investigación en aprendizaje por imitación: permite estudiar el fine-tuning de VLA compactos sobre tareas de manipulación con pocos datos (151 episodios).
- Desarrollo de prototipos en robótica: al ser ligero (450M parámetros), puede desplegarse en estaciones de trabajo con GPU de consumo para pruebas de laboratorio.
- Fine-tuning para tareas similares: el modelo base SmolVLA puede adaptarse a otras tareas de manipulación, y este ejemplo sirve como plantilla de entrenamiento con LeRobot.
- Benchmarking de políticas robóticas: puede utilizarse como referencia para comparar el rendimiento de VLA compactos frente a modelos más grandes en tareas de apilamiento.
- Educación en robótica con IA: su licencia Apache 2.0 y su integración con LeRobot lo hacen adecuado para cursos y talleres de robótica basada en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, MMLU, HumanEval u otras.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM para este fine-tuning específico.
- Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, es plausible que el modelo pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, pero esta es una estimación no confirmada.
- El modelo base SmolVLA está diseñado para hardware de consumo, según el paper, pero no se especifican requisitos concretos para este checkpoint.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia mediante `lerobot-rollout`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo base `lerobot/smolvla_base` es el punto de partida, pero no se ofrecen comparaciones con otros VLA como OpenVLA, RT-2 o modelos similares. Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para una comparativa más amplia, aunque no se incluye en esta ficha.

## Limitaciones y advertencias

- No se han realizado evaluaciones en robot real; el rendimiento en el mundo físico no está verificado.
- El modelo está especializado en una única tarea ("Fill the pyramid with circles") y no es generalizable a otras tareas sin fine-tuning adicional.
- Depende de una configuración específica de cámaras (tres cámaras, imágenes de 256x256) y del robot `so_follower`; cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- No se reportan sesgos conocidos, pero al ser un modelo de control robótico, los riesgos de alucinación se traducen en acciones incorrectas del robot, lo que requiere supervisión en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma sin supervisión.
- El dataset de entrenamiento es pequeño (151 episodios), lo que puede limitar la robustez frente a variaciones del entorno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maedmatt/DREAM_SmolVLA
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
