# Haku-2004/act_iend_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_iend_pred_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/i_4seg`, presumiblemente para una tarea de manipulación con un robot de tipo SO-100 (el script de evaluación de la model card usa `so100_follower`). El modelo tiene 51.672.714 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo resuelve el problema de control robótico fino a partir de demostraciones teleoperadas: en lugar de predecir una única acción por paso, genera secuencias de acciones que reducen el error acumulado y mejoran la estabilidad del control. Es relevante para quienes trabajan con LeRobot y quieren reutilizar o evaluar una política entrenada sobre un dataset concreto, aunque se trata de un checkpoint de autor individual, sin benchmarks publicados ni validación externa.

La información disponible es escasa: no hay datos de idiomas, ni de benchmarks, ni de composición detallada del dataset. La model card es la plantilla estándar de LeRobot, por lo que muchos campos técnicos quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que combina un backbone visual (típicamente ResNet) con un encoder-decoder transformer. La innovación principal es la predicción de *action chunks*: el modelo genera un bloque de K acciones futuras en cada paso de inferencia, lo que mitiga el problema de error acumulado típico de las políticas que predicen una acción por paso. Además, ACT incorpora *temporal ensembling*, que promedia predicciones solapadas de chunks consecutivos para suavizar la trayectoria.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/i_4seg`, que no está descrito en detalle en la información disponible. No se especifica el número de episodios, la composición de las demostraciones, ni si hubo aumentos de datos. Tampoco hay información sobre el robot exacto, el espacio de acciones o la tasa de control. El número de parámetros (51,7 M) es coherente con una política ACT de tamaño pequeño-medio, adecuada para inferencia en tiempo real en GPU consumer.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos: orientado a tareas de pick-and-place y similares, según el dataset de entrenamiento.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- Inferencia en tiempo real: el tamaño reducido (51,7 M de parámetros) permite ejecución en GPU consumer.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política de control, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación visual propia de la política.

## Casos de uso

- Evaluación de políticas en laboratorio: cargar el checkpoint con `lerobot-record` y ejecutar 10 episodios sobre un SO-100 follower para medir la tasa de éxito en la tarea del dataset `i_4seg`.
- Punto de partida para fine-tuning: reentrenar la política con `lerobot-train` sobre un dataset propio del mismo robot para adaptar el comportamiento a nuevas posiciones de objetos.
- Reproducción de experimentos ACT: usar este checkpoint como referencia para comparar hiperparámetros (tamaño de chunk, temporal ensembling) en una misma tarea.
- Prototipado de pipelines de imitación: validar el flujo completo LeRobot (grabación, entrenamiento, evaluación) antes de escalar a datasets mayores.
- Demostraciones educativas: ilustrar cómo una política de 51,7 M de parámetros puede ejecutar manipulación básica en hardware asequible.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de un checkpoint ACT pequeño en distintas GPU antes de desplegar políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,2-0,5 GB en fp32 (51,7 M de parámetros), más el backbone visual y los buffers de observación; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, orientativamente).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_iend_pred_20 | 51,7 M | no aplica | sin benchmarks publicados | apache-2.0 | Hugging Face (0 descargas) |
| Políticas ACT de LeRobot (checkpoints oficiales) | variable (decenas de millones) | no aplica | tasas de éxito publicadas en docs de LeRobot | apache-2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | sin comparación directa en esta ficha | apache-2.0 | Hugging Face |
| SmolVLA (LeRobot) | cientos de millones | no aplica | sin comparación directa en esta ficha | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables para este checkpoint concreto; la comparación se limita a categoría y licencia.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia de tasa de éxito ni de generalización; el rendimiento real es desconocido.
- Dataset de entrenamiento no documentado: se desconoce el número de episodios, la variabilidad de posiciones y la calidad de las demostraciones.
- Especialización estrecha: la política está entrenada para una tarea y un robot concretos; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios de iluminación, fondo o posición de cámara pueden degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de texto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como checkpoint experimental.
- Fechas de creación y actualización en 2026: verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_iend_pred_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
