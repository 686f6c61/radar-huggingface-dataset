# lenawngr/ACT_SWITCH-2-bottom-clean_v2

## Resumen

ACT_SWITCH-2-bottom-clean_v2 es un modelo de aprendizaje por imitación para robótica, basado en la arquitectura Action Chunking with Transformers (ACT), entrenado por el desarrollador lenawngr sobre el conjunto de datos SWITCH-2-bottom_clean. El modelo se publica bajo licencia Apache-2.0 y se distribuye a través del ecosistema LeRobot de HuggingFace, lo que permite reproducir el entrenamiento, evaluar la política y desplegarla en robots físicos de forma estandarizada.

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación de corta duración. Este modelo concreto se centra en una tarea de manipulación sobre un robot SO-100, probablemente relacionada con la manipulación de un interruptor (el nombre del dataset sugiere una tarea de limpieza o activación de un elemento inferior). El modelo cuenta con 51,6 millones de parámetros y se entrena a partir de datos teleoperados, alcanzando altas tasas de éxito en tareas de manipulación.

La relevancia de este modelo radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas de robot con LeRobot, una librería open source de Hugging Face que está ganando tracción en la comunidad de investigación en robótica. Al estar publicado con pesos en formato safetensors y con licencia Apache-2.0, se puede reutilizar, modificar y comercializar sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.591.814 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de visión y acción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje de imitación que combina un codificador de visión con un transformer que predice secuencias de acciones. En lugar de predecir una única acción por paso de tiempo, ACT predice un "chunk" de acciones (por ejemplo, 50 o 100 pasos), lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura se basa en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), y utiliza un codificador ResNet para procesar las imágenes de las cámaras y un transformer como decodificador de acciones.

El entrenamiento se realiza mediante el framework LeRobot, que implementa el pipeline completo de entrenamiento, evaluación y despliegue. El modelo se ha entrenado sobre el dataset `lenawngr/SWITCH-2-bottom_clean`, un conjunto de datos de demostración teleoperada que incluye dos vistas de cámara (vision) y acciones de 6 grados de libertad (posición y orientación). No se dispone de información detallada sobre el número de episodios, la duración de entrenamiento ni si se aplicaron técnicas de aumentación de datos o regularización adicionales. El modelo se ha entrenado con la política ACT por defecto de LeRobot, que utiliza una pérdida de regresión L1 sobre las acciones y una pérdida de clasificación sobre las posiciones de las articulaciones.

## Capacidades

- Control de manipulación robótica: genera acciones de articulación (posición y orientación) para un robot SO-100, a partir de imágenes de dos cámaras.
- Imitación de comportamiento: aprende a partir de demostraciones teleoperadas y replica el comportamiento con alta precisión.
- Chunking de acciones: predice secuencias de acciones (chunks) que reducen el error de acumulación en tareas de largo horizonte.
- Integración con LeRobot: se puede cargar y evaluar directamente con la librería LeRobot, incluyendo el pipeline de grabación de episodios de evaluación.
- Generalización a tareas similares: al estar entrenado en un dataset de tarea concreta, puede generalizar a variaciones de la misma tarea (posiciones iniciales, iluminación, etc.) si el dataset de entrenamiento contiene suficiente diversidad.
- Inferencia en tiempo real: con 51,6 millones de parámetros, es lo suficientemente ligero para ejecutarse en una GPU de consumo en tiempo real (típicamente 20-50 Hz).

## Casos de uso

- Manipulación de precisión en robótica: el modelo puede controlar un brazo robótico SO-100 para tareas de manipulación fina, como pulsar un interruptor, agarrar objetos pequeños o insertar piezas. Gracias a la predicción de chunks de acciones, la ejecución es suave y robusta frente a perturbaciones.
- Aprendizaje de demostración en entornos de investigación: los laboratorios pueden utilizar este modelo como punto de partida para aprender nuevas tareas mediante fine-tuning sobre sus propios datasets de demostración, reduciendo el tiempo de entrenamiento y mejorando la transferencia.
- Evaluación de políticas de control en simulación: el modelo puede evaluarse en simuladores de robótica (por ejemplo, MuJoCo) antes de desplegarse en hardware físico, permitiendo validar la política de forma segura y reproducible.
- Control de robots de bajo coste: dado que el modelo es ligero (51 M de parámetros), puede ejecutarse en GPUs de gama media (RTX 3060 o superior) y controlar robots de bajo coste como el SO-100, haciendo la robótica de aprendizaje más accesible.
- Teleoperación aumentada: el modelo puede usarse como un asistente de teleoperación que sugiere o completa acciones en tiempo real, mejorando la eficiencia de la operación manual.
- Benchmark de comparación de políticas: este modelo puede servir como baseline en estudios comparativos de métodos de aprendizaje de imitación, ya que ACT es una técnica bien conocida y su rendimiento es reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de éxito en la tarea específica, ni de comparaciones con otros modelos en el mismo dataset. El autor no ha proporcionado datos de rendimiento en el modelo card.

## Requisitos de hardware

- VRAM estimada para inferencia: 2-4 GB con cuantización FP32 o FP16 (51,6 millones de parámetros).
- GPU recomendadas: NVIDIA RTX 3060 o superior, o cualquier GPU con al menos 6 GB de VRAM para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de las GPUs de consumo modernas (RTX 30/40 series, etc.).
- Opciones de despliegue: LeRobot ofrece un pipeline de evaluación e inferencia integrado; también se puede exportar el modelo a formato TorchScript o ONNX para ejecutarlo en otros entornos.
- Latencia y throughput: no disponible; se estima una latencia de 20-50 ms por paso de control en una GPU de consumo media, lo que permite control a 20-50 Hz.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | Transformer + ResNet | 51,6 M | no aplica | Apache-2.0 | Hugging Face |
| ACT (LeRobot, SO-100) | Transformer + ResNet | ~45-55 M | no aplica | Apache-2.0 | Hugging Face |
| Diffusion Policy | Diffusion + CNN | ~10-100 M | no aplica | MIT | GitHub/Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la tarea específica de este modelo. La comparativa se basa en arquitectura y disponibilidad, no en resultados empíricos.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrena exclusivamente con el dataset SWITCH-2-bottom_clean, por lo que su rendimiento puede degradarse en variaciones de la tarea (diferentes posiciones de la cámara, iluminación, tipos de interruptor, etc.).
- Riesgo de alucinación: en el contexto de control robótico, el riesgo de alucinación se traduce en acciones erróneas o inestables cuando el modelo recibe observaciones fuera de la distribución de entrenamiento. Es recomendable validar la política en un entorno simulado antes de desplegarla en el robot real.
- Limitaciones de contexto: no aplica, ya que es un modelo de visión y acción, no de lenguaje.
- Restricciones de licencia: licencia Apache-2.0, permite uso comercial y modificación sin restricciones, siempre que se mantenga el aviso de copyright.
- Limitación de hardware: el modelo se ha entrenado para un robot SO-100 concreto; no es directamente transferible a otros robots sin re-entrenamiento o fine-tuning.
- Calidad del dataset: la calidad del comportamiento aprendido depende de la calidad de las demostraciones del dataset original. Si las demostraciones contienen errores o variabilidad, el modelo los aprenderá.

## Enlaces

- Modelo: https://huggingface.co/lenawngr/ACT_SWITCH-2-bottom-clean_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/SWITCH-2-bottom_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- LeRobot Docs: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
