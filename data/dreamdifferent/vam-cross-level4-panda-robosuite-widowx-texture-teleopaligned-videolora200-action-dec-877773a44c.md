# dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-877773a44c

## Resumen

Este repositorio contiene un checkpoint del decodificador World2Action del proyecto VAM-Cross MimicVideo, especializado en predicción de acciones robóticas a partir de vídeo. El modelo fue desarrollado por el usuario dreamdifferent y está diseñado para convertir observaciones visuales de dos cámaras en comandos de acción para el brazo robótico WidowX, operando dentro del entorno de simulación robosuite con el manipulador Panda. Se trata de un componente de un sistema más amplio que combina un backbone Video2World con un decodificador de acciones, entrenado mediante un proceso de ajuste fino con LoRA sobre vídeo.

El checkpoint corresponde a la iteración 1800 de un entrenamiento más largo que se detuvo por causas no especificadas. El modelo está pensado para ser utilizado como parte de un pipeline de robótica que requiere varios componentes congelados adicionales, incluyendo el backbone de vídeo inicial, un decodificador de acciones base y un LoRA de vídeo específico. Con un tamaño de repositorio de 1.0 GB, este modelo es un componente especializado dentro de un ecosistema más amplio de investigación en manipulación robótica, y su relevancia radica en la capacidad de transferir conocimiento entre diferentes configuraciones de robots y entornos de simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World2Action decoder basado en MimicVideo (Video2World backbone + action decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o checkpoint nativo) |

## Arquitectura y entrenamiento

El modelo es un decodificador de acciones dentro del framework MimicVideo, que sigue una arquitectura de dos etapas: un backbone Video2World que procesa observaciones visuales y un decodificador de acciones que convierte las representaciones de vídeo en comandos de control. El backbone inicial es `dreamdifferent/widowx250-video-fused`, sobre el cual se aplica un LoRA de vídeo congelado (`vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-200`) para adaptar el modelo a la tarea específica. El decodificador de acciones se inicializa desde un checkpoint previo (`vam-cross-target-widowx250-native-2cam-action-decoder`) y se entrena para predecir 15 acciones del efector final y la pinza a 5 Hz.

El entrenamiento se realizó sobre un dataset de 162 episodios con 54,352 frames, utilizando dos cámaras (`corner_cam` y `front_cam`). Las acciones objetivo se expresan en términos de pose relativa al estado actual del efector (`relative_to_current_achieved_pose`), con rotación codificada en formato `rotation_6d`. El dataset proviene de entornos robosuite con el manipulador Panda, pero las acciones se expresan en el marco de referencia de WidowX (`widowx_reference_base/teleop_aligned_tool`), lo que sugiere un proceso de alineación entre diferentes robots. El entrenamiento utilizó un enfoque de apilamiento horizontal (`hstack`) y ajuste fino con LoRA sobre el vídeo.

## Capacidades

- Predicción de acciones robóticas: genera 15 valores de acción (posición del efector final y estado de la pinza) a partir de observaciones visuales.
- Procesamiento multi-cámara: acepta entrada de dos cámaras simultáneamente (`corner_cam` y `front_cam`).
- Control a 5 Hz: diseñado para producir comandos de control a una frecuencia de 5 Hz, adecuado para tareas de manipulación en simulación.
- Transferencia entre robots: las acciones se expresan en el marco de referencia de WidowX, lo que permite transferir políticas entre el Panda de robosuite y el WidowX real.
- Integración con MimicVideo: funciona como componente de un pipeline más amplio que incluye un backbone de vídeo y LoRA específicos.
- Especialización en textura: el LoRA de vídeo está entrenado con texturas específicas, lo que sugiere cierta robustez a variaciones visuales.

## Casos de uso

- Aprendizaje por imitación en simulación: el modelo puede utilizarse para entrenar políticas de manipulación en robosuite, aprendiendo de demostraciones humanas teleoperadas. Su capacidad para procesar dos cámaras permite capturar información de profundidad y perspectiva que mejora la precisión de la predicción de acciones.
- Transferencia sim-to-real: al expresar las acciones en el marco de referencia de WidowX, el modelo puede servir como puente entre el entorno simulado de robosuite y un robot WidowX físico, facilitando la transferencia de políticas entrenadas en simulación al mundo real.
- Desarrollo de sistemas de teleoperación: el decodificador puede integrarse en sistemas de teleoperación donde un operador humano controla el robot en simulación y el modelo aprende a replicar las acciones, permitiendo la generación de datos de entrenamiento a gran escala.
- Investigación en aprendizaje multimodal: el modelo sirve como banco de pruebas para estudiar cómo combinar información visual de múltiples cámaras con la predicción de acciones, contribuyendo a la investigación en arquitecturas de vídeo-condicionadas para robótica.
- Benchmarking de algoritmos de acción-predicción: al estar disponible públicamente, el checkpoint puede utilizarse como referencia para comparar diferentes enfoques de decodificación de acciones en entornos robóticos simulados.
- Desarrollo de sistemas de control basados en vídeo: el modelo puede integrarse en sistemas de control que necesiten convertir observaciones visuales directamente en comandos de motor, eliminando la necesidad de estimación de pose explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento como tasas de éxito en tareas de manipulación, precisión de predicción de acciones o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 1.0 GB, pero el modelo requiere componentes adicionales (backbone Video2World, LoRA de vídeo) que aumentan los requisitos totales de memoria.
- GPU recomendadas: no disponible. Dado que se trata de un modelo de vídeo, se recomienda al menos una GPU con 16 GB de VRAM para procesar secuencias de vídeo, aunque no se especifica oficialmente.
- Compatibilidad con GPU de consumo: probablemente sí, si se utiliza cuantización, aunque no se proporcionan detalles al respecto.
- Opciones de despliegue: el modelo está diseñado para usarse con el framework MimicVideo, por lo que el despliegue requiere clonar el repositorio de MimicVideo en el commit especificado (`e3355dbc93132b576c02f920a59b4fc18a4f5906`) y cargar los componentes congelados adicionales.
- Latencia y throughput: no disponible. La frecuencia de control de 5 Hz sugiere que el modelo puede ejecutarse en tiempo real, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo es un componente especializado dentro del ecosistema VAM-Cross, y no se han identificado alternativas comparables en la información proporcionada. Los modelos de predicción de acciones en robótica suelen ser específicos de cada tarea y entorno, lo que dificulta la comparación directa sin datos de referencia.

## Limitaciones y advertencias

- Dependencia de componentes externos: el modelo no funciona de forma autónoma; requiere el backbone Video2World, el decodificador de acciones inicial y el LoRA de vídeo congelado, todos ellos con commits específicos que deben cargarse por separado.
- Entrenamiento incompleto: el checkpoint corresponde a la iteración 1800 de un entrenamiento que se detuvo por causas desconocidas, por lo que el modelo puede no haber convergido completamente.
- Datos de entrenamiento limitados: solo 162 episodios con 54,352 frames, lo que puede limitar la generalización a escenarios no vistos.
- Especificidad del entorno: el modelo está entrenado en robosuite con el manipulador Panda y texturas específicas, por lo que su rendimiento en otros entornos o con otros robots no está garantizado.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o modificaciones.
- Sin soporte de idiomas: el modelo no procesa texto ni lenguaje natural; es exclusivamente visual y de acciones.
- Riesgo de sobreajuste: la combinación de un dataset pequeño y un ajuste fino con LoRA puede provocar sobreajuste a las texturas y configuraciones específicas del entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-877773a44c
- Checkpoint de la iteración 900 (modelo relacionado): https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-059ae97cbb
- Backbone Video2World requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de vídeo congelado: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-200
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture
- Documentación de robosuite: https://robosuite.ai/
