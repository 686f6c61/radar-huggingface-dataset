# mysterium99/smolvla_stage2b_newtasks_to_ds3

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta corresponde a un fine-tuning del modelo base `lerobot/smolvla_base` publicado por el usuario `mysterium99`, especializado en una única tarea: "Put all hardware in bucket" (introducir todo el hardware en un cubo). El modelo consume el estado articular del robot (6 dimensiones) y tres cámaras RGB de 256×256 píxeles, y produce un vector de acción de 6 dimensiones a 30 FPS.

Con 450 millones de parámetros totales y un repositorio de solo 0,9 GB, el modelo está pensado para ejecutarse en hardware de consumo, lo que lo diferencia de los VLA de gran escala que requieren clústeres de GPU. La arquitectura combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones, siguiendo el diseño presentado en el paper SmolVLA (arXiv:2506.01844).

La relevancia de esta publicación es doble: por un lado, demuestra el flujo completo de fine-tuning de políticas robóticas con LeRobot 0.6.1 sobre un dataset pequeño (50 episodios, 85.293 frames); por otro, sirve como ejemplo reproducible de adaptación de un VLA preentrenado a una tarea concreta de manipulación con tres cámaras. No obstante, se trata de un checkpoint de investigación sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, basado en SmolVLA; codificador visual + modelo de lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no genera lenguaje; consume instrucciones de tarea en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | follow |
| Camaras | gripper, newtop, newside |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | observation.images.camera1/2/3, shape (3, 256, 256) |
| Salida | action, shape (6,) |
| Frecuencia de control | 30 FPS |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un VLA compacto que procesa observaciones multimodales (estado proprioceptivo y tres vistas RGB) y emite acciones continuas de control. La política se ha obtenido por fine-tuning del checkpoint `lerobot/smolvla_base`, que actúa como inicialización preentrenada. No se dispone de detalles sobre el número de tokens de preentrenamiento, la composición del corpus multimodal ni si se aplicaron etapas de RLHF o DPO; la model card no los documenta.

El fine-tuning se realizó con LeRobot 0.6.1 sobre el dataset `ds3`, compuesto por 50 episodios y 85.293 frames a 30 FPS, todos correspondientes a la tarea "Put all hardware in bucket". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-4 y semilla 0. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o aumentos de datos. El dataset es pequeño y de una sola tarea, lo que limita la generalización fuera de la distribución capturada.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones (posición/orientación del efector y pinza) a partir de estado articular y tres cámaras.
- Percepción visual multivista: procesa simultáneamente las cámaras `gripper`, `newtop` y `newside` a 256×256.
- Ejecución de una tarea concreta: "Put all hardware in bucket", condicionada por la instrucción de tarea en lenguaje natural.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Despliegue en hardware de consumo: 450 M de parámetros permiten inferencia en GPU de gama media.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, generación de texto libre ni capacidades multilingües; es una política de acción, no un modelo conversacional.

## Casos de uso

- Automatización de una celda de clasificación: el modelo puede ejecutar la tarea de recogida e introducción de piezas en un cubo en un robot tipo `follow`, usando las tres cámaras para localizar objetos y planificar la pinza. Es adecuado porque fue entrenado exactamente sobre esa distribución.
- Prototipado rápido de políticas VLA: sirve como referencia reproducible para equipos que quieran validar el pipeline `lerobot-train` → `lerobot-rollout` con un dataset pequeño antes de escalar a tareas propias.
- Benchmark interno de fine-tuning: al partir de `smolvla_base`, permite medir cuánto mejora un VLA preentrenado con solo 50 episodios y 20.000 pasos en una tarea de manipulación.
- Investigación en imitación con múltiples cámaras: útil para estudiar el efecto de combinar vista de pinza, vista superior y vista lateral en el éxito de la tarea.
- Educación y demos de robótica: su tamaño (0,9 GB) y licencia Apache 2.0 permiten desplegarlo en laboratorios docentes con una sola GPU consumer.
- Base para fine-tuning posterior: puede actuar como inicialización para tareas relacionadas de recogida y depósito, reduciendo el coste de entrenamiento frente a partir del modelo base.
- Validación de infraestructura de inferencia: sirve para probar latencias y tasas de control a 30 FPS en el robot objetivo antes de invertir en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 el peso ronda 1,8 GB, y en FP16/BF16 aproximadamente 0,9 GB, a lo que hay que sumar activaciones de las tres cámaras a 256×256.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en precisión reducida; no se documentan requisitos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: el control se ejecuta a 30 FPS según el dataset de entrenamiento; no se publican latencias medidas por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2b_newtasks_to_ds3 | 450 M | 3 camaras 256x256 + estado (6,) | "Put all hardware in bucket" | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | Base VLA preentrenado, fine-tuning general | Apache 2.0 | Hugging Face (modelo base citado) |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulacion por imitacion | no disponible | Ecosistema LeRobot |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione fuera del dataset de entrenamiento.
- Dataset muy pequeño y de una sola tarea: 50 episodios y una única instrucción ("Put all hardware in bucket") limitan severamente la generalización a otros objetos, posiciones o entornos.
- Dependencia de la configuración de cámaras: el modelo espera exactamente tres cámaras con los nombres `gripper`, `newtop` y `newside` y resolución 256×256; un montaje distinto degradará el rendimiento.
- Dependencia del robot: entrenado para el tipo `follow`; no se garantiza transferencia a otras cinemáticas o efectores.
- Riesgo de sobreajuste: 20.000 pasos con batch 8 sobre 85.293 frames puede memorizar posiciones y condiciones de iluminación del dataset.
- Sin capacidades de lenguaje: no debe usarse como modelo conversacional, de razonamiento ni de generación de código.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin datos de sesgos: no se documentan sesgos demográficos, pero al ser un modelo visual puede heredar sesgos de los datos de preentrenamiento del modelo base.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2b_newtasks_to_ds3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset ds3: https://huggingface.co/datasets/ds3
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds3
