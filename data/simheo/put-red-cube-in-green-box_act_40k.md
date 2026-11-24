# simheo/put-red-cube-in-green-box_act_40k

## Resumen

`simheo/put-red-cube-in-green-box_act_40k` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está especializado en una única tarea: colocar un cubo rojo dentro de una caja verde.

Se trata de una política ligera, con 51.594.888 parámetros (unos 51,6 millones), que consume una imagen de cámara y un vector de estado de dos dimensiones, y produce una acción de ocho dimensiones. El entrenamiento se realizó sobre un dataset de 177 episodios y 31.496 fotogramas grabados a 30 FPS mediante teleoperación, durante 40.000 pasos con un tamaño de lote de 16.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de imitación en LeRobot (grabación de datos, entrenamiento y despliegue en un robot `grabette`), y como punto de partida para quien quiera replicar el flujo con sus propios datos. No es un modelo de propósito general ni un modelo de lenguaje: es un controlador visual-motor específico de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.594.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Tipo de robot | `grabette` |
| Cámaras | `cam0` |
| Entrada visual | `observation.images.cam0`, forma `(3, 486, 648)` |
| Entrada de estado | `observation.state`, forma `(2,)` |
| Salida de acción | `action`, forma `(8,)` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un transformer que, en lugar de predecir una acción por paso de control, predice un *chunk* de acciones futuras a partir de la observación actual. Esta estrategia reduce el error de composición acumulado típico de las políticas que predicen paso a paso y suele traducirse en tasas de éxito más altas en manipulación con datos de teleoperación. En este caso concreto, la política toma una imagen RGB de 486×648 píxeles y un vector de estado de dos componentes, y emite un vector de acción de ocho dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `simheo/put-red-cube-in-green-box_act_graspproj` (177 episodios, 31.496 fotogramas, 30 FPS, tarea "put-red-cube-in-green-box"). La configuración reportada es de 40.000 pasos, lote de 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documentan detalles sobre aumentos de datos, normalización de acciones ni composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control visual-motor para una tarea de manipulación concreta: coger un cubo rojo y depositarlo en una caja verde.
- Predicción de chunks de acción de 8 dimensiones a partir de una imagen y un estado de 2 dimensiones.
- Aprendizaje por imitación a partir de datos de teleoperación, sin refuerzo ni recompensas explícitas.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- Ejecución en bucle cerrado sobre el robot `grabette` con una cámara `cam0`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline de imitación completo: usar el repositorio como referencia para grabar datos con LeRobot, entrenar una política ACT y desplegarla con `lerobot-rollout`, sirviendo de plantilla para tareas propias.
- Demostración docente de robótica de manipulación: el modelo permite mostrar en clase el ciclo observación-acción de una política visuomotora entrenada con datos reales, con un coste computacional bajo.
- Punto de partida para *fine-tuning* en tareas de pick-and-place: al estar entrenado sobre una tarea de agarre y colocación, puede servir como inicialización para variantes con otros objetos o contenedores.
- Validación de hardware y calibración: ejecutar la política en un `grabette` permite comprobar el correcto funcionamiento de la cámara, el puerto del robot y la cadencia a 30 FPS antes de entrenar políticas nuevas.
- Pruebas de integración en LeRobot: útil para verificar versiones de la librería (entrenado con 0.6.1), compatibilidad de checkpoints y el flujo de `lerobot-rollout` con `--strategy.type=base`.
- Benchmark interno de referencia: sirve como línea base de una tarea sencilla para comparar nuevas políticas o configuraciones de entrenamiento sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y pesos en safetensors, la huella en memoria es del orden de unos pocos cientos de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, es viable en RTX 3060, RTX 4090 o superiores, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo y del repositorio (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda` para entrenamiento. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS según la tasa de captura del dataset, pero no se reportan medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `simheo/put-red-cube-in-green-box_act_40k` | 51,6 M | Colocar cubo rojo en caja verde (`grabette`) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (genéricas) | del orden de decenas de millones | Manipulación según dataset | no aplica | Apache 2.0 (habitual) | Hugging Face |
| Políticas Diffusion Policy | no disponible | Manipulación según dataset | no aplica | variable | Hugging Face / repos académicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "put-red-cube-in-green-box" sobre un robot `grabette` y una cámara `cam0`; no generaliza a otras tareas, objetos, robots ni configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del entorno: cambios en iluminación, posición de objetos, fondo o calibración de la cámara pueden degradar el comportamiento de forma significativa.
- Dataset pequeño: 177 episodios y 31.496 fotogramas son un volumen limitado, lo que aumenta el riesgo de sobreajuste a las condiciones de grabación.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe emplearse fuera del contexto de control robótico para el que fue entrenado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simheo/put-red-cube-in-green-box_act_40k
- Dataset de entrenamiento: https://huggingface.co/datasets/simheo/put-red-cube-in-green-box_act_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=simheo/put-red-cube-in-green-box_act_graspproj
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
