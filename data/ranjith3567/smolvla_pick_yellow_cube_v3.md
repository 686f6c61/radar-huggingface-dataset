# ranjith3567/smolvla_pick_yellow_cube_v3

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `ranjith3567/smolvla_pick_yellow_cube_v3`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica de manipulación: recoger un bloque amarillo y depositarlo en una caja marrón. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y cuatro flujos de cámara) y produce acciones de 6 dimensiones para un robot tipo `so_follower`.

Con 450 millones de parámetros, el modelo se posiciona en la gama de hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan desplegar políticas robóticas sin infraestructura de datacenter. La arquitectura subyacente, presentada en el paper arXiv 2506.01844, combina un codificador visual-lenguaje con un decodificador de acciones, y este checkpoint ha sido entrenado sobre 100 episodios y 70.014 frames a 30 FPS.

La relevancia actual radica en la tendencia hacia modelos VLA ligeros y especializados que pueden fine-tunearse con datasets pequeños de teleoperación. Este modelo ilustra ese flujo de trabajo, aunque su entrenamiento reportado (1 paso, batch 8) sugiere un checkpoint preliminar más que una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina percepción visual multi-cámara con instrucciones en lenguaje natural para generar comandos motores. El modelo base `lerobot/smolvla_base` ha sido publicado por Hugging Face como parte del ecosistema LeRobot, y esta versión es un fine-tuning sobre el dataset `ranjith3567/pick_Yellow_cube_v3_20261102_161351`. La política recibe como entrada un vector de estado de 6 dimensiones, tres cámaras de 256x256 píxeles y una cámara adicional de 480x640, y emite un vector de acción de 6 dimensiones.

El entrenamiento reportado en la model card es extremadamente limitado: 1 paso de entrenamiento, batch size de 8, optimizador AdamW con learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.2. El dataset consta de 100 episodios y 70.014 frames a 30 FPS para la tarea "pick the yellow block and place it in brown box". No se documenta el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal del modelo base es su eficiencia computacional, que permite despliegue en hardware de consumo, pero este checkpoint concreto parece ser un artefacto de prueba más que un modelo entrenado de forma sustancial.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa tres cámaras de 256x256 y una de 480x640 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto ("pick the yellow block and place it in brown box").
- Control de manipulación de objetos: recogida y colocación de un bloque amarillo en una caja marrón.
- Integración con el ecosistema LeRobot para rollout, entrenamiento y evaluación.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento matemático, generación de código ni procesamiento de audio.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un bloque amarillo y colocarlo en una caja marrón sobre un robot `so_follower`, adecuado para experimentos de imitación con datasets pequeños.
- Prototipado rápido de políticas robóticas: gracias a sus 450M de parámetros y licencia Apache 2.0, permite iterar sobre fine-tunings en hardware de consumo sin depender de clústeres GPU.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de episodios y la configuración de entrenamiento en el rendimiento de políticas VLA.
- Docencia y formación en robótica: su integración con LeRobot y su tamaño reducido lo hacen adecuado para cursos prácticos de VLA e imitación.
- Benchmarking de infraestructura LeRobot: útil para validar pipelines de entrenamiento, rollout y visualización de datasets en entornos de desarrollo.
- Pruebas de integración multi-cámara: permite evaluar la sincronización y el preprocesamiento de cuatro flujos de cámara en un robot real.
- Base para transferencia a tareas similares: puede fine-tunearse de nuevo para variantes de la misma tarea (otros colores, posiciones o contenedores) con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M de parámetros, en FP32 ocuparía aproximadamente 1,8 GB, en FP16 unos 0,9 GB y en cuantización de 8 bits alrededor de 0,45 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible. El modelo base SmolVLA está diseñado para hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable según el diseño del modelo base, pero no confirmada para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), tal como se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ranjith3567/smolvla_pick_yellow_cube_v3` | 450M | no disponible | Apache 2.0 | Hugging Face | Fine-tuning específico para pick-and-place |
| `lerobot/smolvla_base` | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Políticas VLA de mayor tamaño (p. ej. familias OpenVLA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenamiento reportado de solo 1 paso con batch 8: el checkpoint probablemente no ha convergido y su rendimiento real es incierto.
- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito en la tarea.
- Especialización extrema: solo ha sido entrenado para la tarea "pick the yellow block and place it in brown box" con un robot `so_follower` y una configuración de cámaras concreta.
- Dependencia de la configuración de hardware: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento.
- Riesgo de sobreajuste al entorno de grabación: posiciones de objetos, iluminación y fondo del dataset original.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución en robótica.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación limita su uso en producción sin validación previa.
- No se documentan capacidades multilingües ni de lenguaje general más allá de la instrucción de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/smolvla_pick_yellow_cube_v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_Yellow_cube_v3_20261102_161351
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_Yellow_cube_v3_20261102_161351
