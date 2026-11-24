# simheo/put-red-cube-in-green-box_act

## Resumen

`simheo/put-red-cube-in-green-box_act` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv 2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario simheo y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en PyTorch.

La política resuelve una tarea concreta de manipulación: introducir un cubo rojo en una caja verde ("put-red-cube-in-green-box"). Consume una imagen de cámara de resolución 486x648 píxeles y un vector de estado de 2 dimensiones, y produce un vector de acción de 8 dimensiones. Con 51.594.888 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre un robot físico de tipo `grabette` con una única cámara (`cam0`).

Su relevancia es acotada pero representativa: se trata de un artefacto de investigación reproducible que ilustra el flujo completo de LeRobot (grabación de datos teleoperados, entrenamiento con ACT y despliegue con `lerobot-rollout`). No es un modelo de lenguaje ni un modelo multimodal general; es una política visuomotora específica de tarea, sin resultados de evaluación publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parámetros totales | 51.594.888 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política robótica; horizonte de acción por chunk, no disponible) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `grabette` |
| Cámaras | `cam0` (1 cámara) |
| Entrada visual | `observation.images.cam0`, forma `(3, 486, 648)` |
| Entrada de estado | `observation.state`, forma `(2,)` |
| Salida de acción | `action`, forma `(8,)` |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esta formulación reduce el error de compounding y mejora la estabilidad en tareas de manipulación. La política consume observaciones visuales y proprioceptivas y emite acciones de 8 dimensiones, lo que sugiere un efector con varios grados de libertad (el detalle exacto de la morfología del robot `grabette` no está disponible en la información proporcionada).

El entrenamiento se realizó sobre el dataset `simheo/put-red-cube-in-green-box_act_graspproj`, compuesto por 177 episodios y 31.496 fotogramas a 30 FPS, todos correspondientes a la tarea "put-red-cube-in-green-box". La configuración reportada es de 80.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de manipulación robótica: genera acciones de 8 dimensiones a partir de una imagen y un estado de 2 dimensiones.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento de forma coherente.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución en tiempo real sobre hardware físico mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible y reentrenamiento con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modalidades de audio o vídeo más allá de la cámara de entrada.

## Casos de uso

- Automatización de una tarea de pick-and-place en laboratorio: la política ejecuta la secuencia "cubo rojo a caja verde" sobre un robot `grabette` con una cámara `cam0`, adecuada para validar pipelines de imitación antes de escalar a tareas más complejas.
- Banco de pruebas para comparar métodos de imitación: al ser un artefacto LeRobot reproducible (semilla, pasos y dataset documentados), sirve como línea base de ACT frente a otros métodos como Diffusion Policy o VQ-BeT.
- Docencia y formación en robótica de manipulación: el flujo completo (grabación, entrenamiento, rollout) está documentado y es ejecutable con comandos CLI, lo que facilita prácticas guiadas.
- Reentrenamiento sobre datasets propios: el comando `lerobot-train --policy.type=act` permite adaptar la receta a nuevas tareas con datasets en formato LeRobot, reutilizando hiperparámetros de referencia.
- Evaluación de infraestructura de inferencia robótica: con 51,6 M de parámetros y 0,2 GB de pesos, es un candidato ligero para medir latencia de política en GPUs de consumo o en el propio robot.
- Prototipado de integración con ROS 2 u otros middlewares: la interfaz de entradas y salidas está bien definida (imagen, estado, acción), lo que simplifica el mapeo a tópicos y servicios del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,6 M de parámetros, 0,2 GB de pesos), el modelo es muy ligero y probablemente quepa en GPUs de consumo, pero no se confirma con datos oficiales.
- GPU recomendadas: no disponibles. El comando de entrenamiento de referencia usa `--policy.device=cuda`, lo que implica soporte CUDA; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La tarea se ejecuta a 30 FPS en la grabación del dataset, pero no se reporta la latencia de inferencia de la política.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de LeRobot ni con métodos alternativos de imitación (Diffusion Policy, VQ-BeT, etc.), y no se dispone de datos de rendimiento de este modelo para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "put-red-cube-in-green-box" sobre un robot `grabette` con una cámara `cam0`; no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de hardware y calibración: el rendimiento depende de la cámara, su resolución (486x648), la iluminación y la calibración del robot; cambios en estos factores pueden degradar el comportamiento.
- Sensibilidad a la distribución de entrenamiento: al ser aprendizaje por imitación con 177 episodios, es probable que el modelo falle ante posiciones de objeto, distracciones o condiciones visuales no vistas, aunque este extremo no está cuantificado en la información disponible.
- Sin capacidades de lenguaje ni razonamiento simbólico: no es adecuado para tareas de atención al cliente, generación de código, matemáticas ni procesamiento de texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Fecha de creación futura en los metadatos (2026-11-24): conviene verificar la vigencia del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simheo/put-red-cube-in-green-box_act
- Dataset de entrenamiento: https://huggingface.co/datasets/simheo/put-red-cube-in-green-box_act_graspproj
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=simheo/put-red-cube-in-green-box_act_graspproj
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
