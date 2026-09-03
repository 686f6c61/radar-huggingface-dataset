# heyunzhenwhat/pi0_so101-single-transfer-100ep-mixedpos-2x

## Resumen

Este modelo es un fine-tuning de `lerobot/pi0_base`, la implementación en LeRobot del modelo π₀ (Pi0) de Physical Intelligence, un modelo fundacional de robótica de tipo Vision-Language-Action (VLA). El ajuste se ha realizado sobre un dataset propio de 100 episodios para una tarea concreta de manipulación: mover una cinta hacia una zona marcada a la derecha. El modelo resultante está especializado en esa tarea y en el robot `so_follower`, con dos cámaras (overhead y wrist).

El interés de este modelo radica en que demuestra el flujo de trabajo de fine-tuning de un VLA generalista con LeRobot, permitiendo adaptar un modelo preentrenado a una tarea específica con relativamente pocos datos. Con 4.028 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo, aunque la inferencia en robótica requiere latencias bajas. La licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀ (Pi0): Vision-Language-Action con flow matching sobre un VLM pre-entrenado |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta inglés, pero no se documenta para este fine-tuning) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀ es un modelo de flujo (flow matching) construido sobre un modelo de lenguaje y visión pre-entrenado (VLM). La arquitectura combina un codificador visual, un modelo de lenguaje que procesa instrucciones en lenguaje natural y un decodificador de acciones que genera comandos de control para el robot. El fine-tuning se realizó con la librería LeRobot (versión 0.6.1) sobre el dataset `heyunzhenwhat/so101-single-transfer-100ep-mixedpos`, que contiene 100 episodios y 29.363 fotogramas a 30 FPS. La configuración de entrenamiento incluye 9.000 pasos, batch size 8, optimizador AdamW y learning rate 2.5e-5. No se menciona el uso de RLHF ni DPO; se trata de un ajuste por imitación (behavior cloning) sobre demostraciones.

## Capacidades

- Control robótico de precisión: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y del estado del robot.
- Interpretación de instrucciones en lenguaje natural: la tarea se especifica como "Move the tape into the taped area on the right", y el modelo asocia esa instrucción con el comportamiento aprendido.
- Procesamiento multimodal: combina dos cámaras (overhead a 720x1280 y wrist a 360x640) con el estado del robot (6 dimensiones).
- Especialización en una tarea concreta: el fine-tuning limita la generalidad del modelo base, pero mejora el rendimiento en la tarea de transferencia de cinta.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un robot `so_follower` para mover objetos pequeños (como cintas) a posiciones específicas, útil en entornos de investigación o prototipado.
- Benchmarking de políticas VLA: sirve como ejemplo de fine-tuning de π₀ para una tarea concreta, permitiendo comparar el rendimiento de diferentes estrategias de entrenamiento sobre el mismo dataset.
- Desarrollo de sistemas de recogida y colocación (pick-and-place): la tarea de transferencia de cinta es un caso representativo de manipulación que puede extenderse a otros objetos con datasets adicionales.
- Evaluación de robustez en entornos controlados: al estar entrenado con 100 episodios, es útil para estudiar el efecto del tamaño del dataset en el rendimiento de políticas VLA.
- Prototipado rápido de aplicaciones robóticas: gracias a la integración con LeRobot, se puede desplegar en un robot compatible en pocos minutos usando `lerobot-rollout`.
- Investigación en aprendizaje por imitación: el modelo y su dataset asociado permiten reproducir experimentos de behavior cloning con un VLA de última generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.028 millones de parámetros, una cuantización FP16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y buffers. Se estima un mínimo de 12-16 GB para inferencia con batch size 1.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. En GPUs con menos de 12 GB, podría ser necesario cuantizar o reducir la resolución de las imágenes.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo, aunque la latencia dependerá de la optimización.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También es posible usar vLLM o TGI si se adapta el modelo a un formato de servidor, aunque no es el flujo estándar para robótica.
- Latencia y throughput: no se proporcionan datos. Para control robótico en tiempo real, se recomienda una GPU con al menos 24 GB y optimizaciones como TensorRT o cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `heyunzhenwhat/pi0_so101-single-transfer-100ep-mixedpos-2x` (este) | 4.028 M | no disponible | Apache-2.0 | Hugging Face |
| `lerobot/pi0_base` | 4.028 M (aprox.) | no disponible | Apache-2.0 | Hugging Face |
| `mizutoukotori/pi0_so101_v2` | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo. El modelo base `pi0_base` es el punto de partida; este fine-tuning está especializado en una tarea concreta, por lo que su rendimiento en esa tarea debería ser superior al del base, pero no se ha medido. Otros VLA como OpenVLA o RT-2 no se incluyen por falta de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización excesiva: el modelo solo ha sido entrenado para una tarea concreta (mover cinta a la derecha) y con un robot específico (`so_follower`). No generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- Dependencia del dataset: el rendimiento está limitado por la calidad y variedad de los 100 episodios de entrenamiento. Variaciones en iluminación, posición de objetos o distracciones pueden degradar el comportamiento.
- Sin evaluación publicada: no hay métricas de éxito en el mundo real, por lo que se desconoce la tasa de éxito real en condiciones de producción.
- Riesgo de alucinación en instrucciones: aunque el modelo interpreta lenguaje natural, puede malinterpretar instrucciones no vistas durante el entrenamiento.
- Requisitos de hardware: aunque es ejecutable en GPUs de consumo, la inferencia en tiempo real para control robótico exige latencias bajas que pueden no alcanzarse en hardware modesto.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y el dataset tienen sus propias condiciones; se recomienda revisar la licencia del dataset `heyunzhenwhat/so101-single-transfer-100ep-mixedpos`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyunzhenwhat/pi0_so101-single-transfer-100ep-mixedpos-2x
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep-mixedpos
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Paper de π₀ (arXiv): https://arxiv.org/html/2410.24164v3
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
