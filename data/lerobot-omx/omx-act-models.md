# lerobot-omx/omx-act-models

## Resumen

omx-act-models es un repositorio de políticas de robótica basadas en la arquitectura ACT (Action Chunking with Transformers), entrenadas por el usuario lerobot-omx para manipular un brazo robótico OpenManipulator-X en tareas de pick and place (coger y colocar una muñeca con forma de naranja). El repositorio incluye cuatro checkpoints: un modelo base entrenado desde cero durante 50.000 pasos y tres variantes afinadas sobre él con un dataset de demostraciones más estructurado en fases.

El proyecto es relevante como ejemplo práctico y reproducible de aprendizaje por imitación con la librería LeRobot de Hugging Face: documenta abiertamente el proceso de entrenamiento (pasos, épocas, tiempos, pérdidas finales) y los resultados de despliegue real en el robot, incluidas las tasas de éxito y los modos de fallo observados. Todos los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

No se trata de un modelo de lenguaje, sino de una política de control visuomotor: recibe observaciones del entorno (cámaras y estado del robot) y genera acciones de articulaciones y gripper. Su longitud de contexto, idiomas y benchmarks de lenguaje no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio pretrained_model/ con config.json) |

Datos adicionales del entrenamiento:

| Checkpoint | Dataset | Episodios / frames | Entrenamiento | Loss final |
|---|---|---|---|---|
| act_v1_50ep_50000steps | omx_pick_place_orange_doll | 50 episodios / 25.445 frames | 50.000 pasos, batch 8, 15,7 épocas, 6 h 32 min | 0,082 (l1 0,080, kld 0,000) |
| act_v3_finetune_20000steps | omx_pick_place_orange_doll_v3 | 20 episodios / 23.327 frames | fine-tuning, 20.000 pasos, 6,86 épocas, 2 h 34 min | 0,078 (l1 0,076, kld 0,000) |
| act_v3_light_2000steps | omx_pick_place_orange_doll_v3 | 20 episodios / 23.327 frames | fine-tuning, 2.000 pasos, 0,69 épocas | 0,155 (l1 0,153) |
| act_v3_light_4000steps | omx_pick_place_orange_doll_v3 | 20 episodios / 23.327 frames | fine-tuning, 4.000 pasos, 1,37 épocas, 28 min 24 s | 0,127 (l1 0,126) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ACT (Action Chunking with Transformers), una política de aprendizaje por imitación que usa un transformador con codificador-decodificador (incluyendo un CVAE para modelar la multimodalidad de las demostraciones) y que genera secuencias (chunks) de acciones de articulaciones a partir de observaciones visuales y del estado del robot. La model card no detalla hiperparámetros como el tamaño del chunk, el número de capas o el número de parámetros del modelo.

El entrenamiento se realizó en dos fases. Primero, el modelo base act_v1_50ep_50000steps se entrenó desde cero sobre el dataset omx_pick_place_orange_doll (50 episodios, 25.445 frames) con demostraciones donde todos los movimientos se ejecutan de forma continua y simultánea, solapando traslación y rotación de la muñeca; alcanzó una loss final de 0,082. Después se afinaron tres variantes sobre el dataset omx_pick_place_orange_doll_v3 (20 episodios, 23.327 frames), cuyas demostraciones descomponen la tarea en fases secuenciales sin movimientos simultáneos. Los checkpoints intermedios de 2.000 y 4.000 pasos se publicaron para estudiar la curva de adaptación; a los 4.000 pasos la loss seguía descendiendo, por lo que el modelo no había convergido todavía.

## Capacidades

- Política de control para manipulación robótica: genera acciones de articulaciones y gripper para tareas de pick and place sobre un OpenManipulator-X.
- Aprendizaje por imitación a partir de teleoperación: reproduce comportamientos demostrados en los datasets de entrenamiento.
- Cuatro checkpoints con distintos grados de adaptación al estilo de demostración v3, útiles para estudiar el efecto del fine-tuning en políticas de imitación.
- Reanudación de entrenamiento (resume) y fine-tuning soportados mediante la CLI de LeRobot (lerobot-train), con training_state/ incluido para continuar la misma run.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento: es una política de control específica de tarea y de robot.

## Casos de uso

- Reproducción directa de la tarea de pick and place: descargando los pesos de act_v1_50ep_50000steps y ejecutándolos con LeRobot sobre un OpenManipulator-X, se puede desplegar la política tal cual; el autor reporta 16 aciertos en 30 rollouts (aproximadamente un 53 % de éxito).
- Investigación en adaptación de políticas por fine-tuning: la serie v3 (2.000, 4.000 y 20.000 pasos) permite comparar cuántos pasos de fine-tuning son necesarios para transferir una política a un estilo de demostración distinto (fases secuenciales frente a movimientos simultáneos).
- Punto de partida para tareas propias: la política base puede afinarse con un dataset nuevo de episodios propios usando --policy.path, reduciendo el tiempo de entrenamiento respecto a partir de cero (el fine-tuning de 20.000 pasos tardó 2 h 34 min frente a las 6 h 32 min del entrenamiento completo).
- Docencia y demostraciones en robótica educativa: la documentación detallada (losses, tiempos, modos de fallo como "coger en el aire" o colocar con el gripper vacío) sirve como material de estudio realista sobre los retos del aprendizaje por imitación.
- Benchmarking de hardware y de librería: al tratarse de un modelo pequeño y de tarea concreta, es útil para validar instalaciones de LeRobot y configuraciones de inferencia en robots reales de bajo coste.
- Estudio de modos de fallo en políticas ACT: los rollouts documentados (fallos por agarre al vacío y colocación sin objeto) ofrecen casos de prueba para técnicas de mejora como más demostraciones o dithering en los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), algo esperable al no ser un modelo de lenguaje. Los únicos datos de rendimiento disponibles son los de la model card:

| Métrica | act_v1_50ep_50000steps | act_v3_finetune_20000steps |
|---|---|---|
| Rollouts documentados | 30 | con atascos en el punto de transferencia |
| Éxitos | 16 (≈53 %) | no medido |
| Fallos observados | coger en el aire, place con gripper vacío | atasco en la transferencia |
| Loss final | 0,082 | 0,078 |

## Requisitos de hardware

- El tamaño del repositorio completo es de 2,5 GB (incluye training_state/ de varias runs); los pesos de inferencia de un solo checkpoint (pretrained_model/) ocupan sustancialmente menos, aunque la cifra exacta no está disponible.
- No se especifican requisitos de VRAM. Las políticas ACT de LeRobot son modelos pequeños que típicamente se entrenan en una sola GPU de gama alta de consumo o de servidor (por ejemplo, una GPU con 8-24 GB de VRAM es habitual para este tipo de políticas); el entrenamiento base de 6 h 32 min y el fine-tuning de 2 h 34 min sugieren una GPU de gama media-alta, pero el hardware exacto no está disponible en la información proporcionada.
- Para inferencia en el robot no se requiere GPU: las políticas ACT suelen ejecutarse en CPU o en una GPU modesta con latencias compatibles con el control del OpenManipulator-X, aunque la latencia concreta no está disponible.
- Despliegue e inferencia mediante la librería LeRobot (pipeline robotics, lerobot-train y --policy.path). No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Notas prácticas de la model card: en versiones antiguas de LeRobot hay que eliminar el campo optimizer_fused del config.json; --policy.path no expande la tilde (~), por lo que conviene usar rutas absolutas o $HOME; para resume, el checkpoint debe conservar la estructura de directorios original y hay que aumentar steps en train_config.json, ya que ambos modelos ya completaron sus pasos programados.

## Comparativa con modelos similares

| Modelo | Tarea / robot | Entrenamiento | Resultados publicados | Licencia |
|---|---|---|---|---|
| lerobot-omx/omx-act-models | Pick and place sobre OpenManipulator-X | 50.000 pasos base + fine-tunings v3 | 16/30 rollouts exitosos (v1) | Apache 2.0 |
| yanwoo/omx_pick_place_act_train | Copia pública del checkpoint v1 | 50.000 pasos | mismos que v1 | no disponible |
| yanwoo/omx_pick_place_act_v3 | Copia pública del fine-tuning v3 de 20.000 pasos | 20.000 pasos de fine-tuning | no disponible | no disponible |
| Políticas ACT de referencia (p. ej., ALOHA en LeRobot) | Manipulación bimanual de alta destreza | datasets de cientos de episodios | éxito elevado en tareas ALOHA publicadas en el paper original | variable |

No hay datos numéricos comparables directos publicados en la información disponible; la comparativa se limita a las copias públicas del propio autor y a la familia ACT como categoría.

## Limitaciones y advertencias

- Tasa de éxito limitada: el modelo base solo acierta en 16 de 30 rollouts (≈53 %), con fallos típicos como coger en el aire o ejecutar la fase de place con el gripper vacío; no es una política fiable para producción sin mejoras.
- El fine-tuning v3 de 20.000 pasos presenta atascos en el punto de transferencia y su tasa de éxito no fue medida; los checkpoints ligeros de 2.000 y 4.000 pasos no han convergido (la loss seguía descendiendo).
- Política específica de tarea y de robot: solo es válida para la tarea de pick and place entrenada sobre el OpenManipulator-X con las cámaras y configuración de los datasets; no generaliza a otros objetos, escenas o robots sin reentrenamiento.
- Los datasets de entrenamiento son muy pequeños (50 y 20 episodios), lo que limita la robustez frente a variaciones de iluminación, posición del objeto o ruido mecánico.
- Riesgo de sobreajuste a las condiciones exactas de las demostraciones, habitual en aprendizaje por imitación con pocos episodios.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar las licencias de los datasets de origen (YuminKim/omx_pick_place_orange_doll y v3), que no están indicadas en la model card.
- Detalles técnicos de compatibilidad: campo optimizer_fused en config.json puede romper versiones antiguas de LeRobot; --policy.path no expande la tilde; resume requiere la estructura de directorios original y aumentar steps, ya que los checkpoints agotaron sus pasos programados.
- Descargas prácticamente nulas (0 descargas, 1 like) en el momento de redactar la ficha: proyecto de nicho sin comunidad de soporte consolidada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lerobot-omx/omx-act-models
- Dataset omx_pick_place_orange_doll: https://huggingface.co/datasets/YuminKim/omx_pick_place_orange_doll
- Dataset omx_pick_place_orange_doll_v3: https://huggingface.co/datasets/YuminKim/omx_pick_place_orange_doll_v3
- Copia pública del checkpoint v1: https://huggingface.co/yanwoo/omx_pick_place_act_train
- Copia pública del fine-tuning v3: https://huggingface.co/yanwoo/omx_pick_place_act_v3
- Copia pública del checkpoint ligero v3 (4.000 pasos): https://huggingface.co/yanwoo/omx_pick_place_act_v3_light
- Librería LeRobot: https://github.com/huggingface/lerobot
