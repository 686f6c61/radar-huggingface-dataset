# inhastupid/act_30_new

## Resumen

`inhastupid/act_30_new` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `inhastupid` en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es una política visomotora que consume el estado del robot y una imagen cenital y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. Está entrenado específicamente para la tarea "Pick the object and place it on the target" sobre un robot `so_follower` (SO-100/SO-101 de LeRobot) con una única cámara `top` a resolución 640x480 y 30 FPS.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para grabar datos de teleoperación, entrenar una política ACT y desplegarla; por otro, sirve como referencia práctica de un pipeline de imitación de extremo a extremo. No obstante, se trata de un modelo de autor individual, sin licencia declarada, sin evaluación publicada y con solo 30 episodios de entrenamiento, por lo que su valor es principalmente educativo y de prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación de un frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `top` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `inhastupid/pick_place_30` (30 episodios, 18.000 frames, 30 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de una sola acción por paso de tiempo. La arquitectura combina un encoder visual que procesa la imagen de la cámara `top` con un encoder del estado del robot (6 dimensiones) y un decoder transformer que genera un chunk de acciones de 6 dimensiones. Esta formulación reduce el error de acumulación típico de las políticas que predicen acciones individuales y mejora la estabilidad en tareas de manipulación.

El entrenamiento se realizó sobre el dataset `inhastupid/pick_place_30`, compuesto por 30 episodios de teleoperación, 18.000 frames a 30 FPS, para la tarea "Pick the object and place it on the target". Se ejecutaron 10.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000, usando LeRobot 0.7.1. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al entrenamiento supervisado, ni la composición exacta o aumentación del dataset más allá del número de episodios y frames.

## Capacidades

- Control visomotor de un robot `so_follower` para la tarea de recoger un objeto y colocarlo en un objetivo.
- Predicción de chunks de acciones de 6 dimensiones a partir de una imagen cenital y del estado del robot.
- Aprendizaje por imitación a partir de datos de teleoperación, sin refuerzo explícito.
- Ejecución en tiempo real a 30 FPS (frecuencia del dataset de entrenamiento).
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado de manipulación pick-and-place: la política se puede desplegar con `lerobot-rollout` sobre un SO-100/SO-101 para validar el pipeline completo de imitación antes de escalar a tareas más complejas.
- Docencia y formación en robótica de imitación: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot, incluyendo la grabación de datos, configuración de entrenamiento y despliegue.
- Base para fine-tuning: al ser un checkpoint ACT ligero (51,7 M de parámetros), puede reentrenarse con un dataset propio de pick-and-place para adaptarlo a nuevos objetos o posiciones.
- Evaluación de infraestructura de inferencia: útil para medir latencia y throughput de políticas ACT en GPUs de consumo antes de invertir en hardware mayor.
- Automatización de tareas repetitivas de laboratorio: recogida y colocación de piezas en posiciones fijas dentro de un entorno controlado con cámara cenital.
- Comparación de métodos de imitación: referencia para contrastar ACT frente a políticas tipo diffusion o VLA en tareas de manipulación con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la inferencia en FP32 requeriría aproximadamente 0,2 GB de VRAM más overhead de activaciones, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior sería suficiente; también podría ejecutarse en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,2 GB de pesos), aunque no se confirma compatibilidad específica.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que internamente usa PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput estimados: no disponibles. La frecuencia de entrenamiento es 30 FPS, pero no se publica latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `inhastupid/act_30_new` | 51,7 M | 1 frame (480x640) + estado (6,) | Pick-and-place SO-100 | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (checkpoints oficiales) | ~50 M (tipico) | 1 frame + estado | Manipulación genérica | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas diffusion (p. ej. Diffusion Policy) | variable | ventana de observación | Manipulación | variable | Repos académicos |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | contexto multimodal | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Dataset muy reducido: solo 30 episodios y 18.000 frames, lo que limita la generalización a nuevos objetos, posiciones o condiciones de iluminación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue comercial.
- Dependencia de una única cámara cenital (`top`) y de un robot concreto (`so_follower`): no es portable a otras configuraciones sin reentrenamiento.
- Tarea única: la política está especializada en "Pick the object and place it on the target"; no generaliza a otras tareas sin fine-tuning.
- Riesgo de sobreajuste al entorno de grabación (posiciones de objetos, fondo, iluminación) y de fallo ante distracciones o cambios de escena.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni razonamiento; la tarea se pasa como cadena fija en `--task`.
- Sin información sobre sesgos, alucinación o robustez más allá de lo anterior; al ser un modelo de control, el riesgo principal es el fallo físico del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_30_new
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_30
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_30
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
