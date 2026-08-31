# MoAIBo/Handover_scene1_2_giver_receiver_merged_pos_vel_pi05_policy

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, adaptado por MoAIBo para tareas de entrega de objetos (handover) entre dos robots móviles. El modelo base π₀.₅ está diseñado para generalización en entornos abiertos, y esta versión concreta se ha entrenado sobre un dataset de demostraciones de handover con varios objetos (espátula, cepillo, destornillador, botella) entre un robot dador y un receptor. El fine-tuning se realizó con la librería LeRobot, sobre el modelo base `lerobot/pi05_base`, y el resultado es una política que consume observaciones de estado y cinco cámaras para generar acciones de 8 dimensiones.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 16,6 GB. Está pensado para ser ejecutado en el robot `so101_tb4` mediante el pipeline de LeRobot, y su licencia es Apache 2.0. Su relevancia radica en demostrar cómo un VLA generalista puede especializarse en tareas de colaboración multi-robot mediante aprendizaje por imitación, un área clave para la robótica industrial y de servicios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (π₀.₅) - modelo de difusión de acciones, basado en transformer (detalles internos no especificados) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | No disponible (modelo de acción robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅, un VLA de Physical Intelligence que extiende π₀ para lograr generalización en entornos no vistos durante el entrenamiento. La implementación en LeRobot está adaptada del repositorio OpenPI. Aunque la model card no detalla la arquitectura interna, el análisis del código fuente de LeRobot (disponible en el artículo de Zhihu) indica que el modelo procesa imágenes y lenguaje en una capa prefix, y acciones ruidosas en una capa suffix, con entrenamiento basado en pérdida de velocidad (velocity loss) y generación de acciones mediante difusión inversa.

El entrenamiento se realizó sobre el dataset `MoAIBo/Handover_scene1_2_giver_receiver_merged_pos_vel`, que contiene 338 episodios y 354.884 frames a 30 FPS, con tareas descritas en lenguaje natural (por ejemplo, "Robot0 se acerca a Robot1, presenta y entrega la espátula negra..."). La configuración de entrenamiento fue: 40.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-5 y semilla 1000, usando LeRobot versión 0.6.0. No se especifica si se aplicaron técnicas como RLHF o DPO; el enfoque es puramente aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones robóticas de 8 dimensiones para control de un robot móvil con brazo (tipo `so101_tb4`).
- Procesamiento de observaciones multimodales: estado del robot (11 dimensiones) y cinco cámaras (izquierda, derecha, muñeca, d455 y profundidad), cada una con resolución 360×640.
- Ejecución de tareas de handover entre dos robots, incluyendo acercamiento, presentación del objeto, transferencia y separación.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea correcta (aunque el modelo no genera texto, las tareas se especifican como prompts).
- Especialización en objetos concretos (espátula, cepillo, destornillador, botella) y en roles de dador/receptor.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de líneas de montaje colaborativas: el modelo puede gestionar la entrega de herramientas o piezas entre estaciones robóticas, reduciendo la necesidad de programación explícita para cada escenario.
- Investigación en aprendizaje por imitación multi-robot: sirve como punto de partida para estudiar la transferencia de políticas VLA a tareas de coordinación bimanual o multi-agente.
- Desarrollo de sistemas de asistencia robótica en almacenes: el handover es una operación frecuente en logística; este modelo puede adaptarse a la entrega de paquetes entre robots móviles.
- Prototipado rápido de políticas robóticas con LeRobot: al estar integrado en el ecosistema LeRobot, permite a desarrolladores cargar el modelo y ejecutarlo en hardware compatible con pocas líneas de código.
- Evaluación de la generalización de π₀.₅ en entornos controlados: el fine-tuning sobre un dataset específico permite medir cuánto retiene el modelo base sus capacidades de mundo abierto tras la especialización.
- Formación de operarios en robótica: el modelo puede usarse en simuladores o robots reales para demostrar comportamientos de colaboración segura entre máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (como tasa de éxito en handover) para este fine-tuning. Se recomienda consultar el repositorio del modelo o contactar al autor para obtener evaluaciones cuantitativas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU en la model card.
- Con 4,14 mil millones de parámetros, una estimación razonable para inferencia en fp32 sería de al menos 16-17 GB de VRAM (el tamaño del repo es 16,6 GB). Con cuantización a 8 bits, podría reducirse a unos 8-9 GB, y a 4 bits a unos 4-5 GB, aunque no se han publicado versiones cuantizadas.
- Para ejecutar el modelo en tiempo real con cinco cámaras, se recomienda una GPU de gama alta como RTX 4090 (24 GB) o A100 (40/80 GB). En GPUs de consumo con menos de 16 GB, sería necesario cuantizar o reducir la resolución de las imágenes.
- El despliegue se realiza mediante LeRobot, que soporta inferencia local con `lerobot-rollout`. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la resolución de las cámaras; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de handover o VLA especializados. Existen otros repositorios de MoAIBo con variantes de este mismo modelo (por ejemplo, `Handover_scene1_2_giver_receiver_merged_vel_pi05_policy` y `handover_scene1_2_giver_receiver_merged_vel_policy_vision_expert`), pero no se han publicado métricas comparativas. El modelo base π₀.₅ es comparable a otros VLA como OpenVLA o SmolVLA, pero este fine-tuning no ha sido evaluado frente a ellos en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para tareas de handover con objetos y configuraciones específicas; no generalizará a otras tareas de manipulación sin un nuevo fine-tuning.
- Depende críticamente de la disposición de las cámaras y del robot `so101_tb4`; cambios en la calibración o en el entorno pueden degradar el rendimiento.
- No se han publicado evaluaciones de robustez ante perturbaciones (cambios de iluminación, oclusiones, variaciones en la posición de los objetos).
- El dataset de entrenamiento contiene solo 338 episodios, lo que puede limitar la diversidad de escenarios y aumentar el riesgo de sobreajuste.
- Aunque la licencia del modelo es Apache 2.0, el modelo base `lerobot/pi05_base` puede tener términos adicionales; se recomienda verificar la licencia del modelo base antes de uso comercial.
- No se proporcionan garantías de seguridad para operación en entornos con humanos; cualquier despliegue en producción debe incluir medidas de seguridad adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoAIBo/Handover_scene1_2_giver_receiver_merged_pos_vel_pi05_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/Handover_scene1_2_giver_receiver_merged_pos_vel
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Análisis del código fuente de LeRobot pi0.5 (Zhihu): https://zhuanlan.zhihu.com/p/2050588227225048296
