# felsager/smolvla_ms_cube_stack

## Resumen

Este modelo es un fine-tune de SmolVLA, un vision-language-action model (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, especializado en control robótico mediante aprendizaje por imitación. El autor, felsager, ha ajustado el modelo base `lerobot/smolvla_base` sobre el dataset `felsager/ManiSkill_StackCube-v1_mp`, que contiene 1000 episodios de la tarea de apilar cubos (StackCube) en el simulador ManiSkill. El resultado es una política robótica capaz de generar acciones de 8 dimensiones a partir de observaciones multimodales (estado del robot y varias cámaras) y una instrucción en lenguaje natural.

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de SmolVLA para tareas específicas de manipulación, utilizando la librería LeRobot. SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto coste. Este fine-tune concreto se centra en una tarea de simulación, pero sirve como ejemplo reproducible para transferir el modelo a otras tareas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes de 256x256 y texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | no disponible (instrucciones en inglés, según el paper de SmolVLA) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. La arquitectura exacta se describe en el paper arXiv 2506.01844: utiliza un transformer que procesa múltiples vistas de cámara, el estado sensoriomotor del robot y una instrucción en lenguaje natural, produciendo acciones de control continuo. El modelo base tiene 450 millones de parámetros y está diseñado para ser eficiente en inferencia, permitiendo despliegue en GPUs de consumo.

Este fine-tune se entrenó con la librería LeRobot (versión 0.6.1) sobre el dataset ManiSkill_StackCube-v1_mp, que contiene 107.420 frames a 10 FPS. La configuración de entrenamiento es inusualmente corta: solo 1 paso de entrenamiento con batch size 1, optimizador AdamW y learning rate 0.0001. Esto sugiere que el modelo base ya tenía capacidades generales de manipulación y el fine-tune es una adaptación mínima a la tarea específica. No se reporta el uso de RLHF o DPO; el entrenamiento es puramente supervisado sobre las demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones de 8 dimensiones (posición, orientación, etc.) para un robot Panda.
- Percepción multimodal: procesa hasta 4 cámaras (tres a 256x256 y una a 480x640) más el estado del robot (6 dimensiones).
- Comprensión de instrucciones en lenguaje natural: el modelo acepta una instrucción textual que condiciona la política (aunque no se muestra en los inputs de la model card, SmolVLA la utiliza).
- Aprendizaje por imitación: fine-tuneable sobre datasets de demostraciones con LeRobot.
- Eficiencia computacional: 450M parámetros, apto para GPUs de consumo.

## Casos de uso

- Investigación en manipulación robótica: este modelo sirve como punto de partida para estudiar el fine-tuning de VLA en tareas de simulación como StackCube, permitiendo reproducir experimentos con coste reducido.
- Desarrollo de políticas para robots reales: aunque entrenado en simulación, el flujo de LeRobot permite transferir el conocimiento a un robot Panda real mediante técnicas de sim-to-real (requiere adaptación adicional).
- Benchmarking de VLA: al ser un fine-tune de SmolVLA, puede utilizarse para comparar el rendimiento de diferentes estrategias de entrenamiento en la misma tarea.
- Educación en robótica y aprendizaje por imitación: el modelo y el dataset están disponibles públicamente, lo que facilita su uso en cursos y talleres.
- Prototipado rápido de tareas de apilado: la tarea StackCube es un clásico en robótica; este modelo ofrece una solución lista para evaluar en simulador.
- Integración con LeRobot: sirve como ejemplo de cómo publicar y compartir políticas entrenadas, siguiendo las convenciones de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. El paper de SmolVLA reporta métricas generales del modelo base en tareas de manipulación, pero no se proporcionan aquí. Para este fine-tune concreto, no hay datos de tasa de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, el modelo en FP32 ocupa ~1.8 GB, pero el repo es de 0.9 GB, lo que sugiere pesos en FP16 o BF16 (~0.9 GB). La inferencia requiere al menos 2-4 GB de VRAM, dependiendo de la resolución de las imágenes y el batch size.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (ej. RTX 3050, RTX 2060, GTX 1660) puede ejecutar el modelo. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 3080, RTX 4070).
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También puede integrarse con vLLM o TGI si se convierte a un formato compatible, aunque no es el flujo estándar.
- Latencia y throughput: no disponible. Depende del hardware y de la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (base) | 450M | no disponible | Manipulación general | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulación general | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Manipulación general | Propietaria | No público |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que reduce los requisitos de hardware y el coste de inferencia. Sin embargo, su rendimiento en tareas complejas puede ser inferior al de modelos más grandes. Este fine-tune concreto no tiene comparativas publicadas, por lo que no se puede evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea StackCube en simulación; no se ha validado en robot real ni en otras tareas.
- La configuración de entrenamiento (1 solo paso) es inusual y puede indicar que el fine-tune es mínimo; no hay garantía de que la política generalice bien.
- No se han reportado resultados de evaluación, por lo que se desconoce la tasa de éxito real.
- Depende del simulador ManiSkill y de la configuración de cámaras específica; cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- El modelo no incluye soporte explícito para tool calling ni agentes; es una política de control directo.
- La licencia Apache-2.0 permite uso comercial, pero el dataset asociado puede tener restricciones adicionales (no especificadas).
- Al ser un modelo de 450M, puede tener alucinaciones en la interpretación de instrucciones complejas, aunque su uso principal es robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/smolvla_ms_cube_stack
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset utilizado: https://huggingface.co/datasets/felsager/ManiSkill_StackCube-v1_mp
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
