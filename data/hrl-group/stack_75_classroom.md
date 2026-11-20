# HRL-Group/stack_75_classroom

## Resumen

`HRL-Group/stack_75_classroom` es una política de imitación para robótica real entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. El modelo lo ha desarrollado el grupo HRL-Group y se distribuye a través de Hugging Face Hub con la librería LeRobot. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular del robot y una imagen de muñeca, y emite comandos de acción de 6 dimensiones para un robot seguidor tipo `so_follower`.

El modelo resuelve una tarea concreta de manipulación: apilar un cubo sobre otro y colocar un cubo en una bandeja, según las dos tareas descritas en el dataset de entrenamiento. ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y permite un control más estable en tareas de contacto. El checkpoint tiene 51.643.014 parámetros y un tamaño de repositorio de 0,2 GB.

Es relevante para quien trabaje en aprendizaje por imitación de bajo coste con robots SO-100/SO-101 y quiera reproducir o adaptar un pipeline completo de LeRobot: grabación de datos teleoperados, entrenamiento con ACT y despliegue en robot real mediante `lerobot-rollout`. La model card no incluye resultados de evaluación en robot real ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.643.014 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación de un frame) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (una cámara de muñeca) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.wrist`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Dataset de entrenamiento | `HRL-Group/stack` (92 episodios, 218.681 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visuomotora que predice chunks de acciones (varias acciones futuras de una vez) en lugar de un único paso. La arquitectura combina un codificador visual sobre la imagen de muñeca de 480x640 con tres canales, una proyección del estado articular de 6 dimensiones y un decodificador transformer que genera la secuencia de acciones de 6 dimensiones. Esta formulación reduce el error de compounding y suaviza el comportamiento en tareas de precisión como el apilado de cubos.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `HRL-Group/stack`, compuesto por 92 episodios teleoperados y 218.681 frames a 30 FPS, con dos tareas: apilar un cubo sobre otro y colocar un cubo en una bandeja. Se ejecutaron 100.000 pasos con batch size 16, AdamW y learning rate 1e-05, semilla 1000. La model card no detalla aumentos de datos, composición exacta del dataset por tarea ni si hubo regularización específica más allá de los hiperparámetros indicados.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de una imagen de muñeca y el estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones, adecuada para tareas de manipulación con contacto.
- Ejecución de dos tareas entrenadas: apilar un cubo sobre otro y colocar un cubo en una bandeja.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas ni entorno simulado.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, agentes conversacionales ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Apilado de cubos en laboratorio: el modelo ejecuta la política entrenada para "Pick up one cube and stack it on top of the other cube" sobre un robot SO-follower con cámara de muñeca, útil como baseline reproducible en experimentos de imitación.
- Clasificación de cubos en bandeja: la segunda tarea entrenada permite evaluar la política en una variante de pick-and-place con destino distinto, comparando tasas de éxito entre tareas.
- Reproducción de pipelines LeRobot: sirve como referencia para validar la instalación, calibración y flujo `lerobot-rollout` antes de entrenar políticas propias.
- Fine-tuning sobre datos propios: al estar entrenado con 100.000 pasos y 92 episodios, es un punto de partida razonable para adaptar ACT a nuevas posiciones de objetos o entornos de aula.
- Docencia y formación: el nombre "classroom" y la simplicidad de la tarea lo hacen adecuado para demostraciones de aprendizaje por imitación en cursos de robótica.
- Benchmark interno de hardware: permite medir latencia y estabilidad de un robot SO-follower con una política de 51,6 M de parámetros antes de escalar a modelos mayores.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: la política puede usarse como sujeto de pruebas controladas, aunque la model card no reporta resultados de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB y la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 4090 o RTX 3090 ofrece margen amplio, y GPUs de gama media como RTX 3060 deberían bastar para el modelo, aunque el cuello de botella real es la captura de cámara y el control del robot.
- Cabe en GPU de consumo: sí, por tamaño del modelo; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero la model card no reporta latencia medida en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRL-Group/stack_75_classroom (ACT) | 51,6 M | imagen 3x480x640 + estado (6,) | Apilado de cubos y bandeja en SO-follower | no disponible | Hugging Face Hub, LeRobot 0.7.0 |
| ACT original (paper 2304.13705) | no disponible en esta ficha | no disponible | Imitación visuomotora genérica | no disponible | Paper y código de referencia |
| Otras políticas LeRobot del Hub | no disponible | no disponible | Manipulación con SO-follower | variable | Hugging Face Hub |

No se dispone de datos de benchmarks ni de parámetros de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real publicados; la tasa de éxito de las dos tareas es desconocida.
- La licencia no está declarada ("More Information Needed"), lo que impide confirmar si el uso comercial está permitido.
- El modelo está entrenado para un robot concreto (`so_follower`) y una cámara de muñeca; no se garantiza transferencia a otras configuraciones sin fine-tuning.
- Solo cubre dos tareas específicas ("stack" y "tray"); fuera de ellas el comportamiento no está validado.
- Riesgo de sobreajuste al entorno de entrenamiento (posiciones, iluminación, fondo del aula) no cuantificado.
- Sesgos conocidos: no documentados, pero al ser un modelo de imitación hereda los sesgos de las demostraciones teleoperadas.
- Riesgo de alucinación no aplica en el sentido lingüístico; sí existe riesgo de acciones erráticas o fuera de distribución ante observaciones no vistas.
- No soporta instrucciones en lenguaje natural ni cambio de tarea en tiempo de ejecución.
- Requiere calibración de robot y cámaras, y que los nombres de cámara coincidan con las claves de observación del entrenamiento.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_75_classroom
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
