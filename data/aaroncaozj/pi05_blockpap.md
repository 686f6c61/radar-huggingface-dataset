# aaroncaozj/pi05_BlockPAP

## Resumen

π0.5 BlockPAP es un conjunto de checkpoints de ajuste fino del modelo base `lerobot/pi05_base` (π0.5) para la tarea robótica BlockPAP. Lo publica el usuario `aaroncaozj` en HuggingFace y está pensado para control de robots manipuladores mediante imitación visual: recibe imágenes de cámara y produce acciones motoras. El repositorio agrupa seis checkpoints organizados por método de entrenamiento (`co-sft` y `nft-rl`), configuración de cámara (`front` o `front-back`) y paso global de entrenamiento.

El modelo se apoya en π0.5, la arquitectura de política robótica de Physical Intelligence basada en un transformer visión-lenguaje-acción (VLA) que combina un backbone preentrenado con un cabezal de acciones. El ajuste se realiza sobre el dataset `aaroncaozj/BlockPAP-v0_Mix`, que no está documentado en la información disponible. El tamaño del repositorio es de 121,6 GB, aunque cada checkpoint consolidado de inferencia pesa 7,9 GB.

Es relevante para investigadores en robótica que quieran reproducir o comparar estrategias de ajuste (supervisado con co-entrenamiento frente a refinamiento tipo RL) sobre una misma tarea de manipulación, con variantes de entrada sensorial (una o dos cámaras) y de *stride* temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) heredada de π0.5 (`lerobot/pi05_base`); detalles internos no disponibles |
| Parametros totales | no disponible (peso del checkpoint de inferencia: 7,9 GB en `full_weights.pt`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, sin versiones GGUF ni safetensors publicadas) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch: `actor/model_state_dict/full_weights.pt` (inferencia) y `actor/dcp_checkpoint/` (checkpoint distribuido de PyTorch, 4 shards + metadatos, 22 GB, solo para `co-sft/front`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, la implementación de π0.5 en la librería LeRobot. π0.5 es una política VLA que procesa observaciones visuales y produce secuencias de acciones para robots; la información proporcionada no detalla el número de capas, dimensión oculta ni el mecanismo exacto de fusión visión-acción. El repositorio contiene únicamente los pesos ajustados y los checkpoints de entrenamiento, no la descripción arquitectónica.

El ajuste fino se realizó sobre el dataset `aaroncaozj/BlockPAP-v0_Mix` con dos metodologías: `co-sft` (supervisado con co-entrenamiento, con checkpoints en los pasos 5.000, 10.000 y 15.000) y `nft-rl` (refinamiento tipo RL, checkpoint en el paso 30). Hay variantes entrenadas solo con cámara frontal (`front`) y con cámara frontal y trasera (`front-back`). Una innovación documentada es el uso de *stride* 2 al leer el dataset y construir las etiquetas de acción: un mayor intervalo temporal entre acciones produce movimientos más amplios por paso y una finalización más rápida de la tarea. Los checkpoints `co-sft/front` incluyen checkpoint distribuido de PyTorch para reanudar entrenamiento. Las estadísticas de normalización se publican por separado en `aaroncaozj/pi05_norm_stats_collection` y deben coincidir con las usadas en entrenamiento para evaluar correctamente.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales para la tarea BlockPAP.
- Entrada multimodal visual: variantes con una cámara (`front`) o dos cámaras (`front-back`).
- Ejecución de políticas entrenadas por imitación con distintos regímenes de ajuste (supervisado y RL).
- Reanudación de entrenamiento: los checkpoints `co-sft/front` incluyen estado distribuido de PyTorch.
- Ajuste de velocidad de ejecución mediante *stride* temporal en la construcción de acciones.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, tool calling ni agentes multi-paso; es un modelo específico de robótica.

## Casos de uso

- Reproducción de experimentos de imitación robótica: cargar `co-sft/front/global_step_15000` con su `norm_stats_unaligned.json` para replicar el resultado de referencia de la tarea BlockPAP.
- Comparación de metodologías de ajuste: evaluar `co-sft` frente a `nft-rl` sobre la misma tarea y configuración de cámara para medir qué régimen converge mejor.
- Estudio del efecto del *stride* temporal: comparar `global_step_15000` (stride 1) con `stride2_global_step_15000` (stride 2) para analizar la relación entre intervalo de acción y tiempo de finalización.
- Ablación de sensores: contrastar `front` frente a `front-back` para cuantificar la contribución de la cámara trasera en la manipulación.
- Reanudación de entrenamiento: usar los checkpoints DCP de `co-sft/front` para continuar el ajuste con datos adicionales o hiperparámetros distintos.
- Base para transferencia a nuevas tareas: partir de estos pesos ajustados como inicialización para otras tareas de manipulación con el mismo robot y configuración de cámaras.
- Validación de infraestructura de evaluación: servir como caso de prueba para pipelines de LeRobot que verifiquen la coherencia entre `norm_stats` de entrenamiento y de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El checkpoint consolidado pesa 7,9 GB en `full_weights.pt`, lo que sugiere un requisito mínimo en torno a 10-16 GB en precisión nativa, pero es una estimación, no un dato publicado.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint, una GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) sería el punto de partida razonable para inferencia sin cuantización.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y modelos con 16 GB o más, aunque no está confirmado por el autor.
- Opciones de despliegue: el formato es PyTorch (`full_weights.pt`), orientado al ecosistema LeRobot. No se publican versiones GGUF, ni instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 BlockPAP (`aaroncaozj/pi05_BlockPAP`) | no disponible (checkpoint 7,9 GB) | no disponible | Manipulación robótica (BlockPAP) | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | Política VLA base para robótica | no disponible en la información | HuggingFace |
| π0 (Physical Intelligence) | no disponible | no disponible | Política VLA generalista | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a licencia, disponibilidad y propósito.

## Limitaciones y advertencias

- Modelo específico de una única tarea (BlockPAP): no es un modelo generalista y su rendimiento fuera de esa tarea no está garantizado.
- Dependencia crítica de las estadísticas de normalización: usar un `norm_stats.json` distinto al de entrenamiento altera la distribución de datos y produce evaluaciones inválidas.
- El dataset de entrenamiento (`aaroncaozj/BlockPAP-v0_Mix`) no está documentado en la información disponible: se desconocen su tamaño, composición y posibles sesgos.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios en iluminación, posición de cámaras o tipo de robot pueden degradar el rendimiento.
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware verificados.
- El repositorio es grande (121,6 GB); conviene descargar solo los checkpoints necesarios con `--include`.
- Solo algunos checkpoints (`co-sft/front`) incluyen estado DCP para reanudar entrenamiento; los demás no permiten continuar el ajuste desde ese punto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación independiente desaconseja desplegarlo en producción sin validación propia.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje, por no ser su dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aaroncaozj/pi05_BlockPAP
- Estadísticas de normalización: https://huggingface.co/aaroncaozj/pi05_norm_stats_collection
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/aaroncaozj/BlockPAP-v0_Mix
