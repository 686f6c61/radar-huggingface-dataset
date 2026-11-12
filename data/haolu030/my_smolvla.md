# HaoLu030/my_smolvla

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación con un coste computacional reducido. Esta ficha concreta, `HaoLu030/my_smolvla`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un subconjunto del benchmark MetaWorld (tarea de "pick and place a puck to a goal"), publicado por el usuario HaoLu030. El modelo transforma observaciones multimodales (estado del robot y tres cámaras RGB de 256x256) en acciones de 4 dimensiones, y está pensado para ejecutarse en hardware de consumo.

El interés de esta publicación es doble: por un lado, ilustra el flujo estándar de fine-tuning de políticas VLA con LeRobot 0.7.1 sobre datasets pequeños (50 episodios, 2656 frames); por otro, sirve como ejemplo reproducible de adaptación de un modelo fundacional robótico a una tarea concreta de manipulación. No obstante, se trata de un artefacto de investigación sin evaluación publicada ni tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta), por lo que debe tratarse como material de referencia y no como un componente listo para producción.

La relevancia actual de SmolVLA radica en su propuesta de llevar los modelos VLA a hardware asequible manteniendo un rendimiento competitivo frente a alternativas de mayor tamaño, algo crítico para laboratorios con presupuestos limitados y para el despliegue de robots colaborativos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 (≈450 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, siguiendo el diseño descrito en el paper arXiv:2506.01844. La variante aquí publicada consume como entrada `observation.state` de forma `(6,)` y tres cámaras `observation.images.camera1/2/3` de forma `(3, 256, 256)`, y produce una acción de forma `(4,)`. El checkpoint se ha obtenido por fine-tuning del modelo base `lerobot/smolvla_base` mediante el pipeline de entrenamiento de LeRobot.

El entrenamiento se realizó sobre el dataset `HaoLu030/metaworld_mt50_selected`, compuesto por 50 episodios y 2656 frames a 80 FPS, correspondientes a la tarea "Pick and place a puck to a goal" del entorno MetaWorld. La configuración reportada es: 20.000 pasos de entrenamiento, batch size 4, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.1. No se documentan detalles sobre composición del dataset más allá de la tarea, ni sobre uso de RLHF/DPO (poco habitual en políticas de imitación robótica).

## Capacidades

- Control robótico por imitación: genera acciones de 4 dimensiones a partir de estado proprioceptivo y tres vistas RGB.
- Percepción visual multimodal: procesa simultáneamente tres cámaras de 256x256 píxeles.
- Ejecución de una tarea específica de manipulación: "Pick and place a puck to a goal" en el entorno MetaWorld.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Despliegue en hardware de consumo: el tamaño de ~450 M parámetros y el formato safetensors permiten inferencia en GPUs asequibles.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual libre ni procesamiento de audio.

## Casos de uso

- Reproducción de experimentos de imitación en MetaWorld: permite replicar el flujo de fine-tuning de SmolVLA sobre una tarea concreta y comparar curvas de entrenamiento con la configuración reportada (20k pasos, lr 1e-4, batch 4).
- Punto de partida para fine-tuning en nuevas tareas de manipulación: al estar construido sobre `lerobot/smolvla_base`, sirve como inicialización para datasets propios con el mismo esquema de observaciones (estado 6D + 3 cámaras).
- Docencia y formación en robótica de imitación: ejemplo completo y reproducible de entrenamiento de una política VLA con LeRobot 0.7.1, útil en cursos y talleres.
- Validación de pipelines de datos robóticos: el dataset pequeño (50 episodios, 2656 frames) permite iterar rápidamente sobre formatos, aumentación y preprocesado antes de escalar a datasets mayores.
- Pruebas de despliegue en simulación MetaWorld: ejecución mediante `lerobot-rollout --robot.type=metaworld` para verificar la integración del checkpoint con el entorno antes de transferir a hardware real.
- Benchmark interno de referencia: sirve como baseline de bajo coste (~450 M parámetros) contra el que medir políticas VLA más grandes en la misma tarea, siempre que se realice una evaluación propia dado que el autor no publica resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en MetaWorld ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~450 M parámetros en safetensors (fp32/bf16), el peso ronda 0,9-1,8 GB; sumando activaciones de tres cámaras 256x256 y el decodificador de acciones, se estima un consumo de 2-4 GB de VRAM en fp16/bf16 (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con ≥8 GB de VRAM; el modelo está diseñado explícitamente para hardware de consumo según el paper.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060, RTX 4070/4080 y RTX 4090; también en GPUs integradas de gama alta con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) con `--robot.type=metaworld`; entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. La tasa de control del dataset es de 80 FPS, pero no se reporta la latencia de inferencia del checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaoLu030/my_smolvla | ~450 M | no disponible | Manipulación MetaWorld (pick and place) | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA fundacional multi-tarea | Apache 2.0 (según repositorio base) | Hugging Face (modelo base oficial) |
| Políticas VLA de mayor tamaño (p. ej. OpenVLA) | no disponible en la información proporcionada | no disponible | Manipulación generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados; se recomienda consultar el paper arXiv:2506.01844 para las comparativas oficiales de SmolVLA frente a otros modelos VLA.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no reporta tasas de éxito ni trials, por lo que se desconoce el rendimiento real de la política.
- Especialización extrema: entrenado únicamente para "Pick and place a puck to a goal" en MetaWorld; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 50 episodios y 2656 frames, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia del esquema de observaciones: requiere exactamente estado de 6 dimensiones y tres cámaras con los nombres `observation.images.camera1/2/3`; cualquier desviación rompe la inferencia.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente.
- Idiomas: no aplica en el sentido habitual; el modelo no procesa lenguaje natural libre más allá de la instrucción de tarea.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; para producción sería necesario realizar una evaluación propia exhaustiva.
- Riesgo de alucinación en el sentido robótico: la política puede generar acciones plausibles pero incorrectas sin señal de incertidumbre, algo crítico en entornos físicos.
- Fecha de creación futura en los metadatos (2026-11-12): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaoLu030/my_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HaoLu030/metaworld_mt50_selected
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HaoLu030/metaworld_mt50_selected
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
