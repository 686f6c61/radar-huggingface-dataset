# eslab1234/smolvla_task1_5blocks_v3_330ep_fullft_b16_150k_v1

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Está diseñado para control robótico por imitación, combinando un modelo de lenguaje y visión con un experto de acción que genera secuencias de comandos de movimiento. Su principal ventaja es que logra un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo.

Este repositorio contiene un fine-tuning específico de SmolVLA, entrenado por el usuario eslab1234 para una tarea concreta: recoger cinco bloques de colores (rojo, amarillo, madera, verde y azul) en secuencia y colocarlos en un área objetivo. El modelo parte de la base `lerobot/smolvla_base` y se ha ajustado con 330 episodios de demostración, 459.287 frames a 30 FPS, durante 150.000 pasos de entrenamiento. Con 450 millones de parámetros, es un modelo ligero pensado para robots tipo `so_follower` con cámaras superior y de muñeca.

La relevancia de este modelo radica en su accesibilidad: al ser compacto y estar licenciado bajo Apache 2.0, permite a desarrolladores e investigadores implementar políticas robóticas de manipulación en entornos reales sin necesidad de infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (modelo de lenguaje + vision encoder + experto de accion) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion posible pero no documentada) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en ingles, segun la tarea definida) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de arquitectura híbrida que combina un codificador visual (basado en un transformer de visión), un modelo de lenguaje pequeño (derivado de SmolVLM) y un experto de acción que produce chunks de acciones. El modelo recibe como entrada múltiples vistas de cámara (256x256 píxeles), el estado del robot (6 dimensiones) y una instrucción en lenguaje natural, y genera una secuencia de acciones (6 dimensiones) que controlan el efector final.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sobre el dataset `eslab1234/task1_hybrid_5blocks_v3_330ep_merged`, que contiene 330 episodios de demostración con 459.287 frames a 30 FPS. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 2e-5, batch size de 16 y 150.000 pasos de entrenamiento. El proceso se llevó a cabo con la librería LeRobot (versión 0.5.2), que facilita el registro de datos, el entrenamiento y el despliegue en robots reales. No se menciona el uso de RLHF o DPO; el ajuste es de tipo full fine-tuning sobre la base preentrenada.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad (posición y orientación del efector) a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa hasta tres cámaras simultáneas (top, wrist y una tercera) con resolución 256x256.
- Ejecución de tareas de manipulación: específicamente entrenado para recoger y colocar bloques de colores en una secuencia determinada.
- Generación de chunks de acción: produce secuencias de acciones temporales, lo que permite movimientos suaves y coordinados.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes conversacionales ni generación de texto general; su salida es exclusivamente acciones robóticas.

## Casos de uso

- Automatización de tareas de picking and placing en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos de una cinta transportadora y colocarlos en posiciones definidas, gracias a su entrenamiento en secuencias de manipulación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos simulados y reales, dado su tamaño reducido y facilidad de fine-tuning.
- Prototipado rápido de robots de bajo coste: al ser desplegable en hardware de consumo, permite a laboratorios y makers probar políticas de manipulación sin GPUs de alta gama.
- Educación en robótica: puede utilizarse en cursos de robótica y aprendizaje automático para demostrar el ciclo completo de recogida de datos, entrenamiento y despliegue de un VLA.
- Tareas de ensamblaje en entornos controlados: el modelo puede adaptarse a tareas de ensamblaje de piezas pequeñas si se fine-tunea con datos específicos, gracias a su capacidad de percepción visual y control fino.
- Evaluación de robustez en manipulación: permite probar la generalización de políticas ante variaciones de iluminación, posición de objetos o distracciones, ya que el dataset de entrenamiento incluye múltiples episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 450M de parámetros, se estima que puede caber en GPUs con 6-8 GB de VRAM en precisión FP16, y menos si se cuantiza a 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10 o T4. No se requieren GPUs de gama alta como A100 o H100.
- Compatibilidad con hardware de consumo: sí, el modelo base SmolVLA está diseñado para desplegarse en hardware de consumo, según la descripción del paper.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la inferencia en tiempo real. También es posible exportar a formatos como ONNX o TensorRT para optimización, aunque no está documentado en este repositorio.
- Latencia y throughput: no disponibles. Dependen del hardware y de la optimización, pero al ser un modelo compacto se espera una latencia de inferencia en el rango de decenas de milisegundos por paso.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este fine-tuning concreto. Sin embargo, se puede comparar a nivel de arquitectura con otros VLA:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | 32k tokens | MIT | Hugging Face |
| RT-2 (Google) | 55B | 32k tokens | Propietaria | No abierto |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que lo hace más adecuado para despliegue en edge y hardware de consumo, aunque su capacidad de generalización puede ser menor. No hay benchmarks públicos que comparen directamente estos modelos en la misma tarea.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado para una tarea muy concreta (recoger 5 bloques en secuencia) y no generalizará a otras tareas sin un nuevo fine-tuning.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones; si el dataset tiene sesgos (por ejemplo, posiciones fijas de los bloques), el modelo puede fallar ante variaciones.
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir acciones inconsistentes o erróneas si las observaciones difieren mucho de las de entrenamiento.
- Sin evaluación en robot real: no se han reportado tasas de éxito en el robot físico, por lo que el rendimiento real es incierto.
- Limitaciones de idioma: aunque la instrucción está en inglés, no se especifica soporte multilingüe; el modelo puede no entender instrucciones en otros idiomas.
- Restricciones de hardware: aunque es compacto, requiere una GPU con suficiente VRAM para inferencia en tiempo real; en CPUs la latencia puede ser demasiado alta para control robótico.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales; se recomienda revisar la licencia del dataset.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eslab1234/smolvla_task1_5blocks_v3_330ep_fullft_b16_150k_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/smolvla.md
- Guía de LeRobot (instalación, hardware, entrenamiento): https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/task1_hybrid_5blocks_v3_330ep_merged
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
