# ise-e/pnp_cube_act_policy

## Resumen

`ise-e/pnp_cube_act_policy` es una política de imitación para robótica basada en el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705. La desarrolla el usuario `ise-e` y se ha entrenado y publicado mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica: coger un cubo y colocarlo en un plato ("Pick up the cube and place it on the plate"), aprendida a partir de 45 episodios de teleoperación.

A diferencia de los modelos de lenguaje, no es un modelo generativo de texto: es un controlador visomotor que consume el estado de las articulaciones (vector de 7 dimensiones) y una imagen de una cámara en la muñeca del robot (3x480x640) para producir comandos de acción de 7 dimensiones. Su relevancia es práctica: demuestra el flujo completo de imitación en robótica con LeRobot (grabación de datos, entrenamiento y despliegue) sobre un robot de tipo `so102_follower` (SO-102), un brazo de bajo coste habitual en entornos de investigación y prototipado.

El modelo tiene 51.670.663 parámetros, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Es un artefacto de nicho, sin descargas ni valoraciones en el momento de redactar esta ficha, pensado para reproducir o adaptar un pipeline de aprendizaje por imitación, no para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación por paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la única instrucción textual es la tarea "Pick up the cube and place it on the plate") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos ("chunks") de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (procesa la imagen de la cámara `cam_wrist`), un codificador del estado de las articulaciones y un transformer que fusiona ambas representaciones para generar secuencias de acciones. El modelo está registrado en LeRobot como `act` y consume `observation.state` (7,) junto con `observation.images.cam_wrist` (3, 480, 640), produciendo `action` (7,).

El entrenamiento se realizó sobre el dataset `ise-e/pnp_cube`: 45 episodios, 32.159 fotogramas a 30 FPS, con una única tarea de pick-and-place. La configuración reportada incluye 45.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.0. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de imitación supervisada pura a partir de demostraciones teleoperadas. El robot objetivo es un `so102_follower` con una sola cámara en la muñeca.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 7 dimensiones a partir de estado articular e imagen.
- Predicción de chunks de acción, lo que aporta suavidad y robustez frente al ruido en tiempo real.
- Ejecución de una tarea concreta de pick-and-place ("Pick up the cube and place it on the plate").
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- Compatible con robots SO-102 (`so102_follower`) y configuraciones de cámara OpenCV a 640x480 y 30 FPS.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües: es un modelo específico de robótica, no un LLM.

## Casos de uso

- Reproducción de un pipeline de imitación de referencia: sirve como ejemplo funcional de extremo a extremo (dataset, entrenamiento, rollout) para quien aprende LeRobot con un SO-102 y una cámara de muñeca.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo y depositarlo en un plato, adecuado para prototipos de manipulación de objetos rígidos en mesa.
- Base para fine-tuning con nuevos objetos: al ser un checkpoint ACT entrenado con 45 episodios, se puede reentrenar con datos propios para variar la pieza o la posición del plato.
- Validación de hardware y calibración: útil para comprobar que la cadena cámara-brazo-control funciona antes de abordar tareas más complejas.
- Docencia y divulgación: permite mostrar en clase cómo un transformer pequeño (51,7 M de parámetros) controla un robot real sin infraestructura pesada.
- Benchmark interno de políticas: sirve como línea base de éxito para comparar variantes de ACT o de otros métodos de imitación sobre el mismo dataset `ise-e/pnp_cube`.
- Investigación en chunking de acciones: permite experimentar con el tamaño del chunk y la frecuencia de inferencia para estudiar estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior), si bien la VRAM real depende del framework y del tamaño de lote.
- GPU recomendadas: no hay recomendación del autor; por tamaño, una GPU consumer es suficiente. El entrenamiento reportado usó `--policy.device=cuda` con batch size 8, sin especificar el modelo de GPU.
- ¿Cabe en consumer GPU? Sí, por tamaño de parámetros; el cuello de botella real es el robot y la cámara, no la GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles. El dataset opera a 30 FPS, pero no se publica latencia de inferencia ni tasa de éxito.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ise-e/pnp_cube_act_policy` | ACT (LeRobot) | 51.670.663 | no aplica (política por paso) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | ACT (LeRobot) | variable, no disponible | no aplica | variable | disponibles en el Hub de LeRobot |
| Políticas Diffusion Policy (LeRobot) | difusión para robótica | variable, no disponible | no aplica | variable | disponibles en el Hub de LeRobot |
| Políticas VLA (p. ej. familias tipo OpenVLA) | vision-language-action | no disponible | no aplica | variable | disponibles en el Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "Pick up the cube and place it on the plate"; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 45 episodios y 32.159 fotogramas; riesgo alto de sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Sin evaluación publicada: no hay tasa de éxito ni pruebas en robot real reportadas, por lo que no se puede garantizar fiabilidad en producción.
- Dependencia de hardware: requiere un robot `so102_follower` y una cámara `cam_wrist` con la configuración exacta (640x480, 30 FPS); cambios de cámara o de montaje pueden degradar el comportamiento.
- Sin capacidades de lenguaje ni de razonamiento: no debe usarse como LLM ni para tareas de texto, visión general o agentes.
- Sesgos y alucinaciones: en robótica, el equivalente es la ejecución de acciones erróneas o inseguras ante escenarios fuera de distribución; no hay análisis de seguridad documentado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar el dataset asociado (`ise-e/pnp_cube`) por si tuviera condiciones adicionales.
- Repositorio sin tracción: 0 descargas y 0 likes; no hay comunidad ni soporte más allá de la documentación de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ise-e/pnp_cube_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ise-e/pnp_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ise-e/pnp_cube
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
