# b-o-r-u/my_policy

## Resumen

`b-o-r-u/my_policy` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario b-o-r-u y publicado en Hugging Face Hub mediante la librería LeRobot de Hugging Face, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en PyTorch.

La política está especializada en una única tarea manipulativa: agarrar un cubo dorado y depositarlo en un contenedor gris. Consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen (cámara de muñeca y cámara lateral) para producir un vector de acción de 6 dimensiones. Con 51.668.614 parámetros, es un modelo compacto que puede ejecutarse en GPUs de consumo.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para grabar un dataset propio, entrenar una política ACT y desplegarla en un robot real; por otro, sirve como referencia técnica de cómo se estructura una política de imitación moderna con action chunking, una arquitectura que reduce el error de compounding y mejora la estabilidad en tareas de manipulación de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist` (3, 640, 480) y `side` (3, 480, 640) |
| Entrada de estado | `observation.state` con shape `(6,)` |
| Salida de acción | `action` con shape `(6,)` |
| Dataset de entrenamiento | `b-o-r-u/record-test_20261111_200310` (50 episodios, 12.627 frames, 30 FPS) |
| Tarea entrenada | "Grab the gold cube and put it into the grey container" |
| Pasos de entrenamiento | 15.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitación presentada en el paper arXiv:2304.13705. Combina un encoder visual (procesa las imágenes de las cámaras de muñeca y lateral), un encoder del estado propioceptivo del robot y un transformer decoder que genera un chunk de acciones futuras de forma conjunta. Predecir chunks en lugar de acciones individuales mitiga el problema de compounding errors típico de las políticas paso a paso y permite un control más suave y consistente.

El entrenamiento se realizó sobre el dataset `b-o-r-u/record-test_20261111_200310`, compuesto por 50 episodios teleoperados (12.627 frames a 30 FPS) de la tarea "Grab the gold cube and put it into the grey container". Se ejecutaron 15.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, usando LeRobot 0.6.2. No se especifica en la información disponible si se aplicaron técnicas adicionales como data augmentation, RLHF/DPO (no aplicables en este contexto de imitación) ni regularización específica más allá de los hiperparámetros indicados.

## Capacidades

- Manipulación robótica de una tarea específica: agarrar un cubo dorado y colocarlo en un contenedor gris, aprendida por imitación de 50 demostraciones teleoperadas.
- Predicción de chunks de acción (no pasos individuales), lo que produce trayectorias más suaves y reduce el error acumulado.
- Fusión multimodal de dos cámaras (muñeca y lateral) con el estado propioceptivo del robot para generar acciones de 6 dimensiones.
- Ejecución en tiempo real a 30 FPS sobre el robot `so_follower` mediante `lerobot-rollout`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-step simbólico ni agentes basados en texto.
- No dispone de capacidades multilingües, visión general, audio ni thinking mode.
- No se han documentado capacidades de generalización a otras tareas, objetos o posiciones distintas de las del dataset de entrenamiento.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de agarre y depósito del cubo dorado sobre el robot `so_follower`, permitiendo validar el pipeline de LeRobot de extremo a extremo con hardware real.
- Referencia para formación de nuevos usuarios de LeRobot: sirve como ejemplo funcional de política ACT entrenada y publicada en el Hub, útil para entender el formato de observaciones, acciones y configuración de entrenamiento.
- Base para fine-tuning en tareas similares: al estar entrenada sobre una tarea de manipulación con dos cámaras, puede reutilizarse como punto de partida para reentrenar con un dataset propio de pick-and-place, reduciendo el tiempo hasta la primera política funcional.
- Benchmark interno de infraestructura robótica: permite medir latencia, throughput y estabilidad del stack `lerobot-rollout` con un modelo de 51,7 M de parámetros antes de escalar a políticas mayores.
- Docencia y divulgación en robótica de imitación: el modelo y su dataset asociado permiten ilustrar el ciclo completo grabar → entrenar → desplegar con datos reales y una tarea comprensible.
- Pruebas de integración de cámaras y calibración: al requerir dos cámaras con resoluciones específicas (640×480 y 480×640) y un estado de 6 dimensiones, sirve para validar la configuración hardware y la calibración del robot `so_follower`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros del modelo; el grueso del consumo proviene de los dos flujos de vídeo a 30 FPS.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en GPUs de portátil con 4-6 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el entrenamiento se realiza con `lerobot-train`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el control opera a 30 FPS según la tasa del dataset de entrenamiento.
- Requisitos adicionales: robot `so_follower` con puerto serie accesible, dos cámaras OpenCV configuradas con los nombres `wrist` y `side`, y las resoluciones exactas del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| b-o-r-u/my_policy (ACT) | 51,7 M | Imitación (ACT) | Pick-and-place específico | 2 | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | Imitación (ACT) | Varía por dataset | 1-2 | varía | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy | no disponible | Imitación generativa | Manipulación | 1-2 | varía | Hugging Face Hub |
| Políticas π0 / VLA generalistas | miles de millones | VLA | Múltiples tareas | 1-3 | varía | Repos públicos |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. En términos cualitativos, esta política se sitúa en la categoría de políticas ACT compactas de LeRobot, especializadas en una sola tarea y sin capacidades de generalización declaradas, frente a políticas VLA de mayor tamaño que cubren múltiples tareas pero requieren mucho más cómputo.

## Limitaciones y advertencias

- Especialización extrema: entrenada únicamente para la tarea "Grab the gold cube and put it into the grey container"; no se espera que funcione en otras tareas, objetos o entornos sin reentrenamiento.
- Sin evaluación publicada: la model card indica que no se han reportado resultados de éxito en robot real, por lo que se desconoce la tasa de acierto real.
- Dataset pequeño: 50 episodios y 12.627 frames son un volumen reducido, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o distracciones.
- Dependencia de hardware específico: requiere el robot `so_follower`, dos cámaras con nombres y resoluciones exactas, y una calibración correcta; cualquier desviación puede degradar el rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al entorno de grabación: cambios en la mesa, el fondo o la iluminación pueden provocar fallos no documentados.
- Sin soporte lingüístico ni de tool calling: no es adecuada para tareas de texto, agentes conversacionales ni integración en pipelines de NLP.
- Idiomas no disponibles: la información no especifica ningún idioma soportado, coherente con su naturaleza no lingüística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/b-o-r-u/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/b-o-r-u/record-test_20261111_200310
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=b-o-r-u/record-test_20261111_200310
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
