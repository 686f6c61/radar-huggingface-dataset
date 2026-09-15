# end-effector-trace-conditioning/molmoact2-500ep-baseline

## Resumen
MolmoAct2 es un modelo fundacional abierto de robótica desarrollado por el Allen Institute for AI (Ai2) que transforma imágenes de cámara e instrucciones en lenguaje en secuencias de acciones para robots ("action chunks"). Esta ficha corresponde a un checkpoint concreto, `end-effector-trace-conditioning/molmoact2-500ep-baseline`, entrenado por un tercero mediante la librería LeRobot sobre el dataset `mattpidden/500eps-baseline-dataset` (498 episodios, 137.695 fotogramas a 30 FPS y 25 tareas de manipulación).

El modelo es una política viso-lenguaje-acción (VLA) de aproximadamente 5.442.196.272 parámetros (unos 5,4 mil millones), con licencia apache-2.0 y pesos en formato safetensors. Consume dos flujos visuales (`observation.images.middle` y `observation.images.wrist`, ambos de 480x640) más un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones por paso.

Es relevante porque democratiza el ajuste fino de un modelo fundacional robótico abierto sobre hardware accesible (robot `so_follower` de bajo coste) usando el ecosistema LeRobot, lo que permite reproducir flujos completos de imitación sin depender de infraestructura propietaria.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en MolmoAct2 de Ai2; detalles internos de capas no disponibles |
| Parametros totales | 5.442.196.272 (~5,4 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados sin cuantizar en safetensors) |
| Idiomas soportados | No disponible (acepta instrucciones de tarea en lenguaje, idioma no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con LeRobot) |

## Arquitectura y entrenamiento
El modelo es una política de robótica basada en MolmoAct2, un modelo fundacional que mapea imágenes de cámara e instrucciones en lenguaje a "action chunks" (secuencias de acciones). Se integra en LeRobot 0.6.0, que gestiona la observación multimodal y la salida de acciones. No se dispone de información detallada sobre el backbone concreto, el número de capas, el mecanismo de atención ni la composición exacta del dataset de preentrenamiento del modelo base de Ai2.

El ajuste fino de este checkpoint se realizó sobre el dataset `mattpidden/500eps-baseline-dataset` durante 40.180 pasos, con tamaño de lote 24, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El dataset contiene 498 episodios y 137.695 fotogramas capturados a 30 FPS, con 25 tareas de manipulación (apilar bloques, empujar objetos, insertar objetos, reorientar recipientes, etc.). No se indica si hubo fases de RLHF, DPO u otras técnicas de alineamiento posteriores.

## Capacidades
- Generación de acciones robóticas: convierte observaciones visuales y estado del robot en secuencias de 6 dimensiones de acción.
- Condicionamiento por lenguaje: acepta instrucciones textuales de tarea (por ejemplo, "Drag the cloth across the table.").
- Percepción multimodal: procesa simultáneamente dos cámaras (vista central y de muñeca) a 480x640.
- Control de brazo robótico de 6 grados de libertad (vector de estado y acción de 6 componentes).
- Aprendizaje por imitación (behavior cloning) mediante LeRobot.
- Ejecución de tareas de manipulación definidas en el dataset de entrenamiento (empujar, apilar, insertar, reorientar, abrir).
- No se dispone de información sobre tool calling, function calling ni razonamiento multi-paso; no son capacidades propias de un modelo de política robótica.

## Casos de uso
- Manipulación de laboratorio con robot `so_follower`: ejecutar tareas de recogida y colocación (por ejemplo, "Pick up the apple and place it in the bowl") controlando el brazo a partir de las cámaras y la instrucción de tarea.
- Investigación en aprendizaje por imitación: usar el checkpoint como línea base (baseline) para comparar variantes de arquitectura o de datasets, aprovechando que su configuración de entrenamiento está documentada (40.180 pasos, lote 24, lr 1e-5).
- Reentrenamiento con datos propios: servir de punto de partida para afinar sobre nuevos datasets de manipulación usando `lerobot-train` con `--policy.type=molmoact2`.
- Automatización de tareas de clasificación y apilado en entornos educativos: reproducir tareas como "Stack the blocks on top of another block" o "Reorient the cup upright" con hardware de bajo coste.
- Evaluación de robustez viso-motora: probar la política ante variaciones de iluminación, posición de cámara o disposición de objetos para medir la generalización del modelo.
- Demostraciones y prototipos de robótica abierta: desplegar el modelo con `lerobot-rollout` en ferias, cursos o vídeos demostrativos sin coste de licencia (apache-2.0).
- Investigación en condicionamiento por lenguaje: analizar cómo distintas instrucciones textuales afectan a la política sobre una misma escena.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía y no se proporcionan tasas de éxito en robot real ni métricas numéricas de ningún tipo.

## Requisitos de hardware
- VRAM estimada para inferencia (cálculo a partir de 5,4 mil millones de parámetros): aproximadamente 11 GB en FP16/BF16, unos 22 GB en FP32, en torno a 5,5 GB en INT8 y ~2,8 GB en INT4, más el coste de activaciones por los dos flujos de imagen de 480x640.
- GPU recomendadas: NVIDIA A100 o H100 para entrenamiento y evaluación por lotes; RTX 3090 o RTX 4090 (24 GB) suficientes para inferencia en FP16.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 24 GB (RTX 3090/4090) en FP16 y en GPUs de 12-16 GB si se aplica cuantización.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento) con PyTorch y CUDA. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, ya que se trata de una política robótica y no de un modelo de lenguaje generativo convencional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
Los datos de la comparativa no están incluidos en la información proporcionada; se ofrecen como referencia de categoría y deben verificarse en las fuentes originales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MolmoAct2 500ep baseline | ~5,4B | No disponible | apache-2.0 | HuggingFace (LeRobot) |
| OpenVLA | ~7B | No disponible | No disponible | HuggingFace |
| pi0 (Physical Intelligence) | No disponible | No disponible | No disponible | HuggingFace |
| RDT-1B | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles. Al entrenarse sobre un dataset reducido (498 episodios, 25 tareas concretas), es probable que la política esté muy ajustada a esas tareas y objetos, aunque esto no se documenta explícitamente.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero existe riesgo de acciones incorrectas o inseguras ante escenas fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; el modelo depende de las cámaras y el estado de entrada definidos (dos cámaras y estado de 6 dimensiones).
- Limitaciones de idioma: no se especifica qué idiomas acepta para las instrucciones de tarea.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, pero se recomienda revisar la licencia del modelo base MolmoAct2 de Ai2 y del dataset asociado.
- Advertencias para producción: el repositorio tiene 0 descargas y 0 "likes"; es un artefacto de investigación no validado. No hay tasas de éxito publicadas, por lo que no debe desplegarse en entornos críticos sin evaluación previa en robot real.
- Aspectos de seguridad: cualquier despliegue en un brazo físico conlleva riesgos de colisión; se requieren límites de par, paradas de emergencia y supervisión.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/end-effector-trace-conditioning/molmoact2-500ep-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/mattpidden/500eps-baseline-dataset
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para molmoact2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mattpidden/500eps-baseline-dataset
