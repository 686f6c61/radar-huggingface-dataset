# charlie3707/act_pick_cube_wrist_v1

## Resumen

`charlie3707/act_pick_cube_wrist_v1` es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers, arXiv:2304.13705) y publicada en HuggingFace Hub a través de la librería LeRobot. Está desarrollada por el usuario charlie3707 y resuelve una tarea manipulativa concreta: coger un cubo y depositarlo en una caja, empleando un robot de tipo `so_follower` (familia SO-101) con una única cámara situada en la muñeca.

El modelo cuenta con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. Consume un vector de estado de 6 dimensiones (`observation.state`) y una imagen RGB de 480x640 píxeles (`observation.images.wrist`), y produce una acción de 6 dimensiones (`action`). No es un modelo de lenguaje: es una política visomotora de control, por lo que conceptos como ventana de contexto, idiomas o generación de texto no aplican.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos con teleoperación, entrenamiento de ACT y despliegue con `lerobot-rollout`) sobre hardware de bajo coste. El autor no ha publicado resultados de evaluación en robot real, de modo que debe tratarse como un artefacto de experimentación y no como una política validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política por observación; no se documenta ventana de contexto) |
| Tipos de cuantizacion | No se documentan variantes cuantizadas; pesos en safetensors (el tamano del repo, 0,2 GB, es coherente con precision fp32 para 51,7 M de parametros) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, formato de politica LeRobot |
| Libreria | lerobot |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` (una camara de muneca) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso, según describe la model card y el artículo referenciado (arXiv:2304.13705). El modelo es una política visomotora transformer que combina la observación visual de la muñeca con el estado propioceptivo del robot para emitir comandos de control de 6 dimensiones, y ha sido entrenado y publicado con LeRobot.

El entrenamiento se realizó sobre el dataset `charlie3707/so101_pick_cube_wrist_v1`, compuesto por 50 episodios teleoperados, 17.781 fotogramas a 30 FPS y una única tarea descrita como "Pick up the cube and place it in the box". La configuración declarada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna etapa de ajuste por preferencias, algo que no aplica en este tipo de política de imitación. Tampoco se detalla la composición exacta de la arquitectura interna (número de capas, dimensión de los embeddings, tamaño del chunk de acciones) más allá de lo indicado en el artículo de ACT.

## Capacidades

- Control visomotor para manipulación: genera comandos de 6 grados de libertad a partir de una imagen de muñeca y del estado del robot.
- Ejecución de una tarea concreta de pick and place: coger un cubo y dejarlo dentro de una caja.
- Generación de acciones en bloques (action chunking), lo que reduce la acumulación de error frente a políticas paso a paso.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas ni de entorno simulado.
- Integración nativa con el ecosistema LeRobot: despliegue con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- Inferencia en tiempo real a 30 FPS, en línea con la frecuencia de captura del dataset de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick and place en laboratorio: la política recoge un cubo y lo deposita en una caja usando únicamente la cámara de muñeca, lo que permite montar una celda de manipulación con una sola cámara y un brazo SO-101.
- Reproducción de resultados de ACT: sirve como referencia entrenada y publicada para comparar con reentrenamientos propios sobre el mismo dataset, manteniendo constantes semilla, hiperparámetros y versión de LeRobot.
- Base para fine-tuning con nuevos objetos: al partir de una política ya entrenada para una tarea de agarre, se puede continuar el entrenamiento con datos adicionales para generalizar a otras geometrías o posiciones.
- Docencia y formación en aprendizaje por imitación: el flujo completo (grabar con teleoperación, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es reproducible y encaja en un curso práctico de robótica.
- Pruebas de integración de hardware: sirve para validar el montaje, el cableado, la calibración y la latencia de las cámaras de un SO-101 antes de invertir esfuerzo en un dataset propio.
- Evaluación de robustez ante cambios de iluminación o de posición inicial: al no haber métricas publicadas, permite generar las primeras curvas de tasa de éxito en condiciones controladas.
- Benchmark de infraestructura de inferencia: con 51,7 M de parámetros y menos de 0,2 GB de pesos, es útil para medir latencias y throughput de pipelines de control en CPU, GPU integrada o GPU de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la nota explícita "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB en fp32 y del orden de 0,1 GB en fp16 para el conjunto de pesos; el coste de activaciones es mínimo porque la entrada es una única imagen de 480x640 y un vector de estado de 6 dimensiones.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas tarjetas de gama baja y GPU integradas; una RTX 4090 o una A100 están muy por encima de lo necesario para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo reciente con al menos 1-2 GB de VRAM libre. También es viable la inferencia en CPU, dado el reducido número de parámetros.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=charlie3707/act_pick_cube_wrist_v1` y `--strategy.type=base`; el entrenamiento posterior se realiza con `lerobot-train`. No se documenta soporte para vLLM, TGI, Ollama o llama.cpp, que no aplican a una política de control.
- Latencia y throughput: no disponibles de forma explícita; el dataset y la captura se registraron a 30 FPS, por lo que la política debe poder emitir acciones a esa frecuencia, y la duración del rollout se controla con el parámetro `--duration` (60 segundos en el ejemplo de la model card).
- Requisitos de robot: brazo `so_follower` con una cámara de muñeca; los nombres de cámara configurados deben coincidir con las claves de observación del entrenamiento (`observation.images.wrist`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `charlie3707/act_pick_cube_wrist_v1` | ACT (action chunking) | 51.668.614 | No aplica | Apache-2.0 | HuggingFace Hub, libreria lerobot |
| Diffusion Policy (familia LeRobot) | Politica de difusion | No disponible | No aplica | No disponible | No disponible |
| SmolVLA (familia LeRobot) | Vision-language-action | No disponible | No disponible | No disponible | No disponible |
| Otros checkpoints ACT de LeRobot | ACT (action chunking) | No disponible | No aplica | No disponible | No disponible |

Los datos de los modelos alternativos no estaban incluidos en la informacion proporcionada, por lo que se marcan como no disponibles en lugar de estimarlos.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada: se desconoce la tasa de exito real de la politica, incluso en la tarea para la que fue entrenada.
- Entrenada con solo 50 episodios y 17.781 fotogramas, un volumen bajo que limita la generalizacion a posiciones, iluminacion u objetos distintos de los vistos durante la teleoperacion.
- Especifica para un unico robot (`so_follower`) y una unica camara (`wrist`): no se puede trasladar directamente a otra morfologia, a otro numero de articulaciones ni a otra colocacion de camara sin reentrenar.
- Salida de 6 dimensiones, coherente con el espacio de acciones del SO-101; no cubre robots con mas grados de libertad.
- Alta dependencia de la coincidencia entre el montaje de captura y el de despliegue: cambios en el indice o el nombre de la camara, la resolucion (480x640), el FPS (30) o la calibracion degradan el comportamiento.
- Riesgo de deriva y de fallo silencioso: al ser una politica de imitacion, no detecta si la tarea ha fracasado y puede repetir secuencias incorrectas hasta que se detiene la ejecucion (`--duration` o interrupcion manual).
- No procesa lenguaje natural, asi que la cadena de tarea no actua como instruccion condicionante en el sentido de un modelo VLA.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de funcionamiento ni soporte; cualquier despliegue en produccion exige validacion propia en robot real.
- No se documentan sesgos ni evaluaciones de seguridad fisica; en un brazo real, los fallos de politica pueden provocar colisiones o danos materiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charlie3707/act_pick_cube_wrist_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/charlie3707/so101_pick_cube_wrist_v1
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlie3707/so101_pick_cube_wrist_v1

No se encontraron en la busqueda web enlaces adicionales relevantes sobre este modelo.
