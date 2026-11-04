# lichtphyz/diffusion_v3_desktop_skip_hue_sharpness

## Resumen

`lichtphyz/diffusion_v3_desktop_skip_hue_sharpness` es una política de imitación para robótica basada en Diffusion Policy, desarrollada por el usuario lichtphyz y publicada en HuggingFace bajo la librería LeRobot. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir del estado articular de un brazo robótico SO-101 y dos cámaras (frontal y de muñeca), genera comandos de acción de 6 dimensiones para ejecutar la tarea "meter el bloque en la caja".

Se trata de una ablación del modelo `lichtphyz/diffusion_v3_desktop`: misma arquitectura, mismos datos y mismos hiperparámetros, pero eliminando las dos aumentaciones de imagen más costosas (hue y sharpness) para reducir el tiempo de entrenamiento de 11 h 20 min a 5 h 13 min manteniendo la misma pérdida final de entrenamiento (0,003). El modelo tiene 277.839.366 parámetros y un repo de 1,1 GB en safetensors.

Su relevancia es acotada y experimental: el autor advierte explícitamente que **no ha sido evaluado en el robot real**, y recomienda usar la variante `diffusion_v3_desktop` (8/10 en pruebas reales) si se busca un modelo probado. Resulta útil como referencia para estudiar el impacto del pipeline de aumentación en el coste de entrenamiento de políticas de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora basada en difusión, sobre backbone convolucional; detalles exactos no disponibles) |
| Parametros totales | 277.839.366 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; consume observaciones por paso) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy (paper arXiv:2303.04137), un enfoque que formula la generación de trayectorias de acción como un proceso de difusión: parte de ruido y aplica pasos de denoising condicionados por las observaciones (estado articular de 6 dimensiones y dos imágenes RGB de 480x640). La inferencia se realiza con DDIM y 5 pasos de denoising, según indica el autor. La arquitectura interna exacta (backbone visual, número de capas, dimensión de embeddings) no se detalla en la model card.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `lichtphyz/so101_block_to_bin_v3` (125 episodios, 55.677 frames a 30 FPS) durante 60.000 pasos, batch de 32, optimizador Adam, learning rate 1e-4 y semilla 1000. La innovación de esta variante es puramente de eficiencia: elimina las aumentaciones de hue y sharpness (que dominaban el tiempo de carga de datos) y conserva brightness, contrast, saturation jitter y una pequeña transformación afín aleatoria. El resultado es un entrenamiento un 54 % más rápido con idéntica pérdida final. No se reporta uso de RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Control visuomotor de un brazo SO-101 (`so_follower`) para la tarea concreta "Put the block in the bin.".
- Consumo de observaciones multimodales: estado articular de 6 dimensiones más dos cámaras RGB (frontal y muñeca) a 480x640.
- Generación de acciones continuas de 6 dimensiones por paso de control.
- Ejecución de políticas de imitación end-to-end mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad de propósito general: está especializado en una única tarea de manipulación.

## Casos de uso

- **Investigación sobre aumentación de datos en imitación robótica**: comparar esta ablación con `diffusion_v3_desktop` permite cuantificar el ahorro de tiempo de entrenamiento (5 h 13 min frente a 11 h 20 min) al eliminar hue y sharpness, con pérdida final idéntica.
- **Reproducción de experimentos de Diffusion Policy**: sirve como referencia reproducible con semilla fija (1000) y configuración documentada para validar pipelines de LeRobot 0.6.2.
- **Prototipado de tareas pick-and-place en laboratorio**: desplegable con `lerobot-rollout` sobre un SO-101 real para probar la tarea bloque-a-caja, asumiendo que no hay evaluación real publicada.
- **Docencia y formación en aprendizaje por imitación**: ejemplo completo de política de difusión con dataset, comandos de entrenamiento y de inferencia documentados.
- **Punto de partida para fine-tuning**: al estar bajo Apache 2.0, puede reentrenarse con datos propios de otras tareas de manipulación sobre el mismo hardware.
- **Benchmark interno de eficiencia de data loading**: útil para medir el cuello de botella que introducen ciertas aumentaciones de imagen en pipelines de entrenamiento robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la política no ha sido evaluada en el robot real y que no se han proporcionado resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 277,8 M de parámetros en safetensors, una estimación razonable en FP32 ronda 1,1 GB de pesos, más el coste de procesar dos imágenes de 480x640 por paso.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento usa `--policy.device=cuda`, por lo que se asume GPU NVIDIA.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La inferencia usa DDIM con 5 pasos de denoising, lo que reduce el coste frente a schedules más largos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Evaluacion real | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lichtphyz/diffusion_v3_desktop_skip_hue_sharpness` (este) | 277,8 M | SO-101 bloque a caja | No evaluado | Apache 2.0 | HuggingFace |
| `lichtphyz/diffusion_v3_desktop` | No disponible | SO-101 bloque a caja | 8/10 | Apache 2.0 (presumible) | HuggingFace |
| Políticas ACT de la misma colección SO-101 | No disponible | SO-101 bloque a caja | No disponible en la información | No disponible | HuggingFace (colección del autor) |

La comparación directa más relevante es con `diffusion_v3_desktop`, del que este modelo es una ablación: misma arquitectura y datos, pero sin hue ni sharpness y sin evaluación en robot real. El resto de alternativas de la colección (variantes ACT) no están descritas en la información disponible.

## Limitaciones y advertencias

- **No evaluado en robot real**: el autor lo advierte de forma explícita y recomienda `diffusion_v3_desktop` para uso práctico.
- **Especialización extrema**: solo ejecuta la tarea "Put the block in the bin." con el robot SO-101 y la configuración de cámaras especificada; no generaliza a otras tareas ni objetos.
- **Dependencia de hardware y calibración**: requiere un SO-101 calibrado y cámaras con nombres e índices que coincidan con las claves de observación (`front`, `wrist`).
- **Riesgo de sobreajuste al dataset**: 125 episodios y una única tarea; cualquier cambio de iluminación, posiciones u objetos puede degradar el rendimiento (no cuantificado).
- **Sin datos de sesgo ni alucinación**: al no ser un modelo generativo de texto, estas categorías no aplican, pero tampoco hay análisis de robustez publicado.
- **Licencia Apache 2.0**: permite uso comercial, pero al no haber evaluación real no hay garantía de funcionamiento en producción.
- **Documentación incompleta**: no se detalla la arquitectura interna, la VRAM necesaria ni el rendimiento en latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lichtphyz/diffusion_v3_desktop_skip_hue_sharpness
- Modelo base evaluado: https://huggingface.co/lichtphyz/diffusion_v3_desktop
- Dataset de entrenamiento: https://huggingface.co/datasets/lichtphyz/so101_block_to_bin_v3
- Colección SO-101 block-to-bin: https://huggingface.co/collections/lichtphyz/so-101-block-to-bin-act-vs-diffusion-policy-6ad6ca5c5e111b426bb1f8a6
- Repositorio de código y documentación: https://github.com/Lichtphyz/so101-block-to-bin
- Comandos de entrenamiento: https://github.com/Lichtphyz/so101-block-to-bin/blob/main/docs/training.md
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
