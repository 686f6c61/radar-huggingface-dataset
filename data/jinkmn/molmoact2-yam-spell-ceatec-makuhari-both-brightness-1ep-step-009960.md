# jinkmn/molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-009960

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo de visión-lenguaje-acción MolmoAct2, en concreto sobre la variante bimanual `allenai/MolmoAct2-BimanualYAM` publicada por Allen Institute for AI. El autor, `jinkmn`, lo ha entrenado con la librería LeRobot y lo ha publicado con el identificador `molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-009960`, correspondiente al paso de entrenamiento 9960. Se trata de un modelo de robótica que recibe imágenes y texto y produce directamente comandos de acción continua para un robot bimanual, no de un modelo de propósito general de generación de texto.

El modelo cuenta con 5.442.196.208 parámetros (unos 5,44 mil millones), almacenados en precisión float32, lo que explica que el repositorio ocupe 21,8 GB. Los adaptadores LoRA del entrenamiento se han fusionado en los pesos finales, y el autor advierte explícitamente de que cargar los pesos en bfloat16 degrada buena parte de la actualización del ajuste fino. La model card no especifica licencia, idiomas soportados ni longitud de contexto, y no se han publicado resultados de benchmarks.

Su relevancia es acotada pero clara para el ámbito de la robótica open source: demuestra un flujo de trabajo reproducible de ajuste fino de un VLA (vision-language-action) bimanual con LeRobot sobre un dataset propio grabado con un robot YAM de dos brazos, con tres cámaras (superior, izquierda y derecha) y un espacio de estado/acción de 14 dimensiones. Es un artefacto de investigación orientado a la tarea concreta del dataset de entrenamiento, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo base MolmoAct2 (vision-language-action, pipeline `image-text-to-text` + predicción de acciones) |
| Parametros totales | 5.442.196.208 (unos 5,44 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor indica que los pesos son float32 y que bfloat16 degrada el ajuste fino |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32); incluye ademas `lerobot_checkpoint/` con configuración de política y procesadores (sin pesos) |
| Modelo base | allenai/MolmoAct2-BimanualYAM (revisión `8dcbed66f2380e4393189c303ea72488eb9e63c2`) |
| Herramienta de entrenamiento | LeRobot (commit `c13d79e6e350c589babc5b7c5cf5ef05cb0fa58e`) |
| Paso de entrenamiento | 9960 (nombre del checkpoint `009960`) |

## Arquitectura y entrenamiento

La model card no describe internamente la arquitectura heredada del modelo base. Por las etiquetas del repositorio (`molmoact2`, `image-text-to-text`, `robotics`, `lerobot`, `custom_code`) se trata de un modelo multimodal de tipo vision-language-action que consume imágenes junto con una instrucción en lenguaje natural y un vector de estado, y devuelve acciones motoras. El ajuste fino se realizó sobre la variante bimanual YAM de MolmoAct2, con `action_mode` de entrenamiento `both` y modo de inferencia recomendado `inference_action_mode="continuous"`.

El entrenamiento se hizo con LeRobot sobre el dataset `lerobot/spell_ceatec_makuhari_lerobot_v30` (ruta local con sufijo `_grasp_ramp_v2_0b86fee586e5`), con semilla 1000 y una única época según el nombre del checkpoint (`1ep`). Los adaptadores LoRA se fusionaron antes de la exportación, de modo que el repositorio contiene el modelo completo en float32. La model card detalla los órdenes exactos de entrada esperados: imágenes en el orden `observation.images.top`, `observation.images.left`, `observation.images.right`, y estado/acción de 14 dimensiones en el orden `left_joint_0.pos` a `left_joint_5.pos`, `left_gripper.pos`, `right_joint_0.pos` a `right_joint_5.pos`, `right_gripper.pos`. Las estadísticas de normalización del entrenamiento se guardan en `norm_stats.json` bajo la etiqueta `yam_dual_molmoact2`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones continuas para un robot bimanual con dos brazos de 6 grados de libertad más pinza cada uno (14 dimensiones de estado y acción).
- Procesamiento conjunto de tres flujos de imagen (vista superior, brazo izquierdo, brazo derecho) junto con una instrucción de tarea en lenguaje natural y el estado del robot.
- Soporte de dos modos de acción en el entrenamiento (`both`), con recomendación de usar el modo continuo en inferencia.
- Normalización específica del dataset mediante la etiqueta `yam_dual_molmoact2` y `norm_stats.json`.
- Ejecución de tareas de manipulación grabadas en el dataset `spell_ceatec_makuhari_lerobot_v30`; el nombre sugiere tareas con variaciones de brillo, aunque esto no se detalla en la model card.
- Carga mediante `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`, con `trust_remote_code=True` y `dtype=torch.float32`.
- No se documenta en la información disponible soporte de tool calling, function calling, uso como agente multi-paso, capacidades de audio, ni comportamiento multilingüe.

## Casos de uso

- Reproducción de investigación en robótica bimanual: sirve como punto de partida para replicar el ajuste fino de MolmoAct2-BimanualYAM con LeRobot sobre un dataset propio, reutilizando el manifiesto de exportación (`export_manifest.json`) y la configuración de política incluida en `lerobot_checkpoint/`.
- Manipulación bimanual con robot YAM: el modelo genera directamente comandos continuos de 14 dimensiones para los dos brazos y sus pinzas, por lo que encaja en bucles de control de un robot físico que exponga ese mismo orden de articulaciones.
- Estudio de robustez frente al brillo: el sufijo `both-brightness` del nombre y del dataset apunta a entrenamiento con variaciones de iluminación, un escenario útil para evaluar la degradación de políticas visuales cuando cambian las condiciones de la cámara.
- Tareas de escritura o trazado con dos brazos: el nombre del dataset (`spell`) sugiere tareas de deletreo o trazado, un caso típico de evaluación de coordinación bimanual y precisión de trayectorias.
- Base para comparativas de VLA bimanuales: al ser un fine-tune público del mismo modelo base, permite aislar el efecto del dataset y del número de pasos de entrenamiento frente a otros checkpoints derivados de MolmoAct2-BimanualYAM.
- Docencia y trabajos de fin de grado: el repositorio está generado desde un flujo de tesis de grado, con rutas y semillas documentadas, lo que lo hace útil como ejemplo didáctico de pipeline completo (grabación con LeRobot, entrenamiento LoRA, fusión de adaptadores y exportación).
- Ajuste posterior sobre dominios propios: al conservar la configuración de LeRobot y las estadísticas de normalización, puede reutilizarse como inicialización para nuevos fine-tunes sobre otras tareas del mismo robot, teniendo en cuenta que los pesos están en float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea, ni métricas de error de trayectoria, ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- Los pesos en float32 de 5,44 mil millones de parámetros ocupan aproximadamente 21,8 GB, que es además el tamaño del repositorio.
- Como el autor desaconseja bfloat16, hay que sumar a esos 21,8 GB la memoria de activaciones, los tres flujos de imagen y el estado del robot; en la práctica se recomienda una GPU con 40 GB o más.
- GPUs recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB o similares con al menos 40 GB de VRAM.
- En GPU de consumo: una RTX 4090 de 24 GB queda al límite y probablemente no permita inferencia estable en float32 con las tres imágenes; una RTX 5090 de 32 GB es más viable, aunque no hay datos confirmados en la información disponible. No se recomienda intentar el despliegue en GPUs de 16 GB o menos.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText`, `AutoProcessor` y `trust_remote_code=True`, tal como indica la model card; también LeRobot para el flujo de política. No hay soporte documentado de vLLM, TGI, llama.cpp u Ollama, y no se proporcionan pesos GGUF, dado que el modelo no es un LLM de texto sino un VLA con predicción de acciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-009960 | 5.442.196.208 | no disponible | no disponible | HuggingFace (`jinkmn`) | Fine-tune LoRA fusionado de MolmoAct2-BimanualYAM para robot YAM bimanual |
| allenai/MolmoAct2-BimanualYAM (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace (Ai2) | Modelo base declarado; variante bimanual YAM |
| Otros VLA open source de manipulacion | no disponible | no disponible | no disponible | no disponible | La busqueda web realizada no devolvio informacion tecnica util sobre alternativas |

No se dispone de datos verificables en la informacion proporcionada para comparar parámetros, contexto o rendimiento con otros VLA como OpenVLA, pi0, GR00T o RDT, por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse licencia en el repositorio, no hay base clara para uso comercial; conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Sesgo de dominio: el modelo se ha ajustado sobre un único dataset (`spell_ceatec_makuhari_lerobot_v30`) con una sola época, por lo que su generalización fuera de esa tarea, ese robot y esa configuración de cámaras es muy limitada.
- Dependencia de la normalización: la inferencia debe usar `norm_tag="yam_dual_molmoact2"` y las estadísticas de `norm_stats.json`; usar otras estadísticas produce acciones incorrectas.
- Dependencia del orden de entradas: el orden de imágenes y de articulaciones está fijado por el entrenamiento; alterarlo invalida las predicciones.
- Precisión obligatoria: cargar en bfloat16 redondea los pesos fusionados y pierde gran parte de la actualización del fine-tune, según advierte el propio autor, lo que encarece el despliegue en memoria.
- Riesgo de alucinación y de acciones erráticas: no se han publicado evaluaciones de seguridad ni tasas de éxito, y un VLA puede generar trayectorias inválidas o peligrosas en un robot real; es imprescindible usar límites de par, paradas de emergencia y validación en simulación o con el robot desacoplado.
- Sin benchmarks ni métricas: no hay datos de rendimiento que permitan estimar la fiabilidad antes de probarlo.
- Idiomas y capacidades lingüísticas: no disponibles; el modelo está orientado a seguir instrucciones de tarea, no a generar texto abierto.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar tareas de horizonte largo o conversaciones multi-turno.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de terceros.
- La busqueda web realizada no aportó informacion tecnica relevante sobre este modelo; los resultados obtenidos no estaban relacionados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jinkmn/molmoact2-yam-spell-ceatec-makuhari-both-brightness-1ep-step-009960
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Librería LeRobot (usada para el entrenamiento): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: `lerobot/spell_ceatec_makuhari_lerobot_v30` (referenciado en la model card; no se ha facilitado URL directa)
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada
