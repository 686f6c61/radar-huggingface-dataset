# OlenaG/chesster_act_v4

## Resumen

`OlenaG/chesster_act_v4` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele mejorar las tasas de éxito en tareas de manipulación. Lo desarrolla la usuaria OlenaG y se distribuye a través de LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real.

La política está especializada en una única tarea concreta: coger una figura de un cuadrado azul y depositarla en un cuadrado verde. Se entrenó sobre el dataset `OlenaG/chesster_v4`, compuesto por 100 episodios y 108.703 fotogramas a 30 FPS, con un total de 100.000 pasos de entrenamiento. El modelo consume el estado del robot (6 dimensiones) y dos cámaras (vista superior y vista de la mano, ambas a 480x640) y produce un vector de acción de 6 dimensiones.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en el hardware que controla el robot `so_follower` (un seguidor tipo SO-100/SO-101 de LeRobot). No es un modelo de lenguaje: es una política visomotora de robótica, por lo que sus capacidades, benchmarks y requisitos de hardware difieren por completo de los de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación definida por el chunking de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no aplica (modelo visomotor, sin entrada ni salida de texto) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `top`, `hand` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `OlenaG/chesster_v4` (100 episodios, 108.703 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de chunking de acciones. En lugar de predecir una sola acción por paso de tiempo, el modelo predice un bloque de acciones futuras, lo que mitiga el problema de la acumulación de errores típico de las políticas reactivas paso a paso. La arquitectura incorpora un encoder visual que procesa las dos cámaras (`top` y `hand`) y un decoder que genera el chunk de acciones condicionado por el estado del robot y las observaciones visuales. El paper original (Zhao et al., 2023) describe además el uso de un VAE condicional para modelar la variabilidad de las demostraciones humanas, aunque la model card no detalla si esta variante concreta lo incluye.

El entrenamiento se realizó con LeRobot 0.7.1 durante 100.000 pasos, batch de 16, optimizador AdamW y learning rate 1e-05, sobre 100 episodios teleoperados de la tarea de recoger la figura del cuadrado azul y colocarla en el verde. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste posterior al aprendizaje por imitación; tampoco se especifica la composición exacta de las demostraciones más allá del número de episodios y frames. La model card no reporta innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de dos vistas de cámara y del estado del robot.
- Aprendizaje por imitación de una tarea concreta: recoger una figura del cuadrado azul y depositarla en el cuadrado verde.
- Predicción de chunks de acciones, lo que reduce la frecuencia de inferencia necesaria y mejora la estabilidad del control.
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Compatible con el robot `so_follower` y con el esquema de cámaras `top` y `hand`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües: es una política robótica especializada, no un modelo de propósito general.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de coger la figura del cuadrado azul y soltarla en el verde, adecuada para demostrar flujos de manipulación en laboratorio o línea de montaje con el robot `so_follower`.
- Prototipado rápido de políticas de imitación: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Base para fine-tuning en tareas similares: al estar entrenada sobre 100 episodios de una tarea de manipulación con dos cámaras, puede reentrenarse con `lerobot-train` sobre un dataset propio que comparta el esquema de observaciones.
- Docencia e investigación en aprendizaje por imitación: el modelo y su dataset asociado permiten reproducir experimentos con ACT y comparar variantes de hiperparámetros (learning rate, batch, pasos).
- Evaluación de hardware de bajo coste: al tener solo 51,7 M de parámetros, puede ejecutarse en el ordenador que controla el robot sin necesidad de GPUs de gama alta, lo que facilita probar configuraciones de cámara y calibración.
- Benchmark interno de políticas robóticas: útil como línea base de éxito en la tarea concreta para comparar con políticas entrenadas con más datos o métodos alternativos (Diffusion Policy, VQ-BeT, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors y un repositorio de 0,2 GB, la huella en memoria es del orden de cientos de MB, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna son suficientes para la inferencia. Para reentrenar, se recomienda una GPU dedicada (por ejemplo, RTX 3090/4090 o A100) por comodidad, aunque el tamaño del modelo permite entrenar en GPUs más modestas.
- Cabe en GPU de consumo: sí, con margen amplio; el cuello de botella real es el procesamiento de las dos cámaras a 480x640 y 30 FPS, no el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); el formato safetensors es compatible con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La política opera a 30 FPS según la tasa del dataset de entrenamiento, pero no se reportan medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `OlenaG/chesster_act_v4` | 51,7 M | Tarea pick-and-place con `so_follower`, 2 camaras | no disponible | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | Metodo general de imitacion con chunking | codigo en el repo del paper | Paper y repositorio de referencia |
| Diffusion Policy | no disponible | Politica de imitacion basada en difusion | no disponible en esta busqueda | Repositorio publico |
| Otras politicas LeRobot en el Hub | variable | Tareas diversas con robots SO | variable segun autor | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para la tarea "coger la figura del cuadrado azul y ponerla en el verde"; fuera de ese contexto su comportamiento no está garantizado.
- Sin resultados de evaluación publicados: la model card no reporta tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido.
- Dependencia del hardware: requiere el robot `so_follower` y dos cámaras con los nombres y resoluciones exactos (`top` y `hand`, 480x640); cambios de cámara, iluminación o posición de objetos pueden degradar el rendimiento.
- Sesgos y alucinaciones: al ser una política visomotora, no genera texto ni alucina en el sentido lingüístico, pero puede producir acciones erróneas o inseguras si las observaciones se salen de la distribución de entrenamiento (nuevos objetos, distracciones, cambios de fondo).
- Dataset limitado: 100 episodios y 108.703 frames de una única tarea; la diversidad de posiciones, objetos y condiciones es reducida.
- Sin soporte documentado de cuantización ni de despliegue en runtimes alternativos a LeRobot/PyTorch.
- Fecha de creación futura en el Hub (2026-11-27): conviene verificar la vigencia y posibles actualizaciones del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OlenaG/chesster_act_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/OlenaG/chesster_v4
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OlenaG/chesster_v4
