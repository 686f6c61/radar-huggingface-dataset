# R1-HSP/interact_pickwashbottle_merged_GR00T17

## Resumen

El modelo `R1-HSP/interact_pickwashbottle_merged_GR00T17` es un policy de robótica basado en GR00T N1.7, un modelo de fundamentos cross-embodiment de NVIDIA para razonamiento y habilidades en robots humanoides. Utiliza un backbone Cosmos-Reason2/Qwen3-VL junto con un action transformer basado en flow-matching para predecir acciones condicionadas por visión, lenguaje y propiocepción. Ha sido entrenado con LeRobot y publicado en Hugging Face bajo licencia Apache 2.0.

El modelo cuenta con 3.144.016.000 parámetros (aproximadamente 3.14B) y está diseñado para ejecutar tareas de manipulación robótica, concretamente interactuar con humanos y agarrar una botella de lavado. El repositorio incluye los pesos en formato safetensors con un tamaño de 12.6 GB. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados, ya que no se trata de un modelo de lenguaje, sino de un policy de control para robots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow-matching) |
| Parametros totales | 3.144.016.000 (3.14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.7, que combina un modelo de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) como backbone de percepción y un action transformer que genera acciones mediante flow-matching. La entrada del policy consiste en el estado del robot (24 dimensiones) y dos imágenes de cámaras estereoscópicas (stereo_left y stereo_right) con resolución 3x376x672. La salida es un vector de acciones de 24 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `R1-HSP/interact_pickwashbottle_merged`, que contiene 112 episodios y 47.811 frames a 10 FPS. Las tareas son "Interact with the human." y "Grasp the wash bottle". La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0.0001 y semilla 42. No se han publicado detalles sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de imitación para robótica.

## Capacidades

- Predicción de acciones de 24 dimensiones basadas en estado del robot y visión estereoscópica.
- Ejecución de tareas de manipulación robótica: interactuar con humanos y agarrar objetos específicos (botella de lavado).
- Soporte de cross-embodiment, al estar diseñado para robots humanoides generalizados.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Entrada multimodal: imágenes de cámaras estéreo y propiocepción del robot.
- No soporta generación de texto, tool calling ni razonamiento de lenguaje en el sentido de un modelo de lenguaje convencional.

## Casos de uso

- Interacción humano-robot en entornos de laboratorio: el modelo puede predecir acciones para colaborar con un operador humano, usando las cámaras estéreo para percibir la escena en tiempo real.
- Tareas de agarre de objetos: adecuado para escenarios de pick-and-place donde el robot debe localizar y agarrar una botella de lavado, gracias a la entrada de visión estéreo y el estado propioceptivo.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar políticas cross-embodiment y comparar arquitecturas de action transformers con flow-matching.
- Despliegue en robots humanoides tipo R1: el policy está entrenado específicamente para este tipo de robot y puede ejecutarse con LeRobot mediante el comando `lerobot-rollout`.
- Automatización de tareas repetitivas en entornos controlados: el modelo opera a 10 FPS y puede ejecutar secuencias de manipulación de forma autónoma en escenarios bien delimitados.
- Robótica colaborativa: al estar entrenado para interactuar con humanos, es adecuado para aplicaciones donde el robot debe trabajar junto a una persona, como en líneas de ensamblaje asistidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para este policy.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 12.6 GB, lo que sugiere un formato FP32 (aproximadamente 4 bytes por parámetro). Para inferencia en FP16 se estiman unos 6.3 GB, y en INT8 unos 3.1 GB. Las entradas de imagen (2x3x376x672) y las activaciones del transformer requieren memoria adicional, por lo que se recomienda una GPU con al menos 8 GB para FP16 y 16 GB para FP32.
- GPU recomendadas: RTX 4090 (24 GB) o superior para inferencia en FP32; A100 o H100 para entrenamiento a gran escala.
- Capacidad en GPU de consumo: puede ejecutarse en GPUs de consumo de 16-24 GB con cuantización, aunque no se han publicado configuraciones de cuantización específicas.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia en robot real. No aplican vLLM, llama.cpp ni Ollama, al tratarse de un modelo de robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a la familia GR00T N1.7, pero no se han facilitado datos de otros policies de la misma categoría.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeño (112 episodios, 47.811 frames), lo que puede limitar la generalización a nuevas posiciones de objetos, condiciones de iluminación o variaciones en el entorno.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento esperado en producción no está validado.
- El modelo depende de un hardware específico: robot tipo R1 y cámaras estéreo con las claves `stereo_left` y `stereo_right`. Cambios en la configuración de hardware pueden invalidar el policy.
- No es un modelo de lenguaje; no puede responder preguntas ni generar texto. Su única función es predecir acciones de control.
- Posible sobreajuste a las tareas concretas del dataset ("Interact with the human." y "Grasp the wash bottle"), lo que reduce su utilidad en tareas distintas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad del rendimiento y la seguridad del modelo en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/R1-HSP/interact_pickwashbottle_merged_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/R1-HSP/interact_pickwashbottle_merged
- Repositorio de Isaac-GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Documentación de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
