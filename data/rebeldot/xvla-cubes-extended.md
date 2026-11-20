# RebelDot/xvla-cubes-extended

## Resumen

`xvla-cubes-extended` es un modelo de política robótica (vision-language-action, VLA) publicado por RebelDot en Hugging Face. Se trata de un fine-tuning del modelo base `lerobot/xvla-base` realizado con la librería LeRobot sobre un dataset privado de manipulaciones con un brazo robótico SO101. El modelo está diseñado para predecir secuencias de acciones (action chunks) a partir de observaciones multimodales: varias cámaras y el estado de las articulaciones.

El modelo resuelve el problema de control robótico de extremo a extremo: dado un conjunto de imágenes de cámaras y el estado actual del robot, genera una secuencia de acciones de 30 pasos que el controlador del brazo SO101 ejecuta. Es relevante para desarrolladores que trabajan en manipulación robótica con hardware asequible (SO101) y quieren partir de una política ya entrenada en lugar de entrenar desde cero.

El repositorio ocupa 5,3 GB y contiene un único checkpoint (paso 20.000) en formato safetensors, junto con los ficheros de configuración, pre/post-procesadores y estado de entrenamiento. No se ha publicado información sobre licencia, idiomas ni benchmarks, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en `lerobot/xvla-base`; detalles internos de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`checkpoints/020000/pretrained_model/`) |
| Libreria | LeRobot (`lerobot`) |
| Pipeline | robotics |
| Tamano del repositorio | 5,3 GB |
| Modelo base | `lerobot/xvla-base` |
| Dataset de entrenamiento | `local/my_so101_dataset` (dataset local del autor, no publicado) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Learning rate | 0,0001 |
| Chunk size / action steps | 30 / 30 |
| Semilla | 1000 |
| Entradas | `observation.images.image`, `observation.images.image2`, `observation.images.image3`, `observation.images.empty_camera_0`, `observation.state` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/xvla-base`, una política VLA del ecosistema LeRobot. La arquitectura interna del modelo base (número de parámetros, tipo de transformer, mecanismo de fusión visión-lenguaje-acción) no está documentada en la información proporcionada. La política consume cuatro flujos de imagen (`image`, `image2`, `image3`, `empty_camera_0`) más el vector de estado de las articulaciones (`observation.state`), y produce chunks de 30 acciones consecutivas.

El entrenamiento se realizó con LeRobot durante 20.000 pasos, con batch size 8, learning rate 0,0001 y semilla 1000, sobre el dataset local `local/my_so101_dataset`, no publicado en el repositorio. No se especifica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. El repositorio incluye únicamente el checkpoint final (`020000`), con pesos, configuración, pre/post-procesadores y `train_config.json`, además del estado del optimizador, scheduler y RNG para reanudar el entrenamiento. No se han publicado logs de entrenamiento.

## Capacidades

- Predicción de acciones robóticas: genera secuencias de 30 acciones (action chunks) para un brazo SO101 a partir de observaciones multimodales.
- Fusión multimodal: integra cuatro cámaras y el estado de las articulaciones en una única representación para el control.
- Control de manipulación: entrenado específicamente para tareas de manipulación de cubos (según el nombre del modelo).
- Compatibilidad con LeRobot: se carga mediante `get_policy_class("xvla").from_pretrained(...)`, lo que permite integrarlo en pipelines de entrenamiento e inferencia de LeRobot.
- Reanudación de entrenamiento: el checkpoint incluye estado de optimizador, scheduler y RNG.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Manipulación de cubos con SO101: el modelo predice directamente las acciones del brazo para tareas de pick-and-place sobre cubos, usando las cuatro cámaras como entrada; es su uso principal y el escenario para el que fue entrenado.
- Punto de partida para fine-tuning: al estar construido sobre `lerobot/xvla-base` y con un `train_config.json` incluido, sirve como inicialización para nuevos datasets de manipulación con SO101, reduciendo el coste de entrenamiento desde cero.
- Investigación en políticas VLA: permite reproducir y comparar el comportamiento de una política VLA entrenada con LeRobot sobre hardware asequible, útil para estudios de generalización y robustez.
- Evaluación de robustez multimodal: con cuatro cámaras de entrada, se puede analizar cómo afecta la oclusión o el fallo de una cámara a la predicción de acciones.
- Prototipado de automatización en laboratorio: para tareas repetitivas de recogida y colocación de objetos en entornos controlados donde se disponga de un SO101 y la misma configuración de cámaras.
- Benchmark interno de control robótico: como referencia de política entrenada 20.000 pasos para comparar con nuevas políticas o variantes de entrenamiento en el mismo setup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 5,3 GB, por lo que en fp32/bf16 se necesita al menos ese orden de magnitud de memoria, pero no se especifica el tamaño real de los pesos.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB) sería suficiente para cargar los pesos en memoria, pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probable en GPUs con 16 GB o más si los pesos caben en fp16/bf16, pero no está verificado.
- Opciones de despliegue: LeRobot (`lerobot.policies.factory.get_policy_class("xvla")`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RebelDot/xvla-cubes-extended` | no disponible | no disponible | Manipulación SO101 (VLA) | no disponible | Hugging Face, 5,3 GB |
| `lerobot/xvla-base` | no disponible | no disponible | Política VLA base | no disponible | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación robótica | varía | Hugging Face / LeRobot |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente sobre `local/my_so101_dataset` para tareas de cubos con SO101; no se espera generalización a otros robots, objetos o configuraciones de cámara.
- Dataset no publicado: el dataset de entrenamiento es local y no está disponible, lo que impide reproducir el entrenamiento o auditar los datos.
- Sin benchmarks ni logs: no hay métricas de éxito, tasas de error ni curvas de entrenamiento publicadas.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Idiomas no disponibles: al ser un modelo de control robótico, la dimensión lingüística no está documentada.
- Riesgo de sobreajuste: 20.000 pasos con batch size 8 sobre un dataset local sin validación publicada puede implicar sobreajuste al setup concreto.
- Cuatro cámaras obligatorias: la entrada incluye `observation.images.empty_camera_0`, lo que sugiere que el modelo espera exactamente esa configuración de cámaras; desviarse de ella puede degradar el rendimiento.
- Sin garantías de seguridad: no se documentan límites de par, velocidades máximas ni protocolos de parada de emergencia; su uso en un robot real requiere supervisión y salvaguardas externas.

## Enlaces

- Hugging Face: https://huggingface.co/RebelDot/xvla-cubes-extended
- Modelo base: https://huggingface.co/lerobot/xvla-base
- LeRobot (librería): https://github.com/huggingface/lerobot
