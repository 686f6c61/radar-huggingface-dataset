# jaheroth/act_pusht_dec7_bs8_1480k

## Resumen

El modelo `act_pusht_dec7_bs8_1480k` es un checkpoint final de un entrenamiento de ACT (Action Chunking with Transformers) para la tarea robótica PushT, desarrollado por JaHeRoth (Jacob H. Rothschild) como parte de un bloque de entrenamiento de seis semanas en aprendizaje robótico. ACT es una arquitectura basada en transformers que predice secuencias de acciones (action chunks) a partir de observaciones, y se ha convertido en un estándar para el aprendizaje por imitación en manipulación robótica.

Este modelo concreto corresponde a un lineage con batch size 8, entrenado durante 1,48 millones de pasos (aproximadamente 461 épocas), y se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors. Con 83,97 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo relativamente compacto, adecuado para investigación y experimentación en entornos con recursos limitados.

La relevancia de este modelo radica en que forma parte de una serie de experimentos sistemáticos sobre el efecto del batch size y el número de pasos en el rendimiento de políticas ACT, lo que puede orientar a otros investigadores a la hora de configurar sus propios entrenamientos. Sin embargo, no se han publicado métricas cuantitativas en la información disponible, por lo que su rendimiento absoluto no puede verificarse externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer |
| Parametros totales | 83.969.428 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura que combina un encoder de visión (típicamente ResNet) con un transformer que predice un "chunk" de acciones futuras de longitud fija, condicionado a las observaciones actuales y a una variable latente que representa la variabilidad de las demostraciones. Este enfoque reduce el error de acumulación en tareas de control y permite generar trayectorias suaves y coherentes.

El entrenamiento se realizó con el framework LeRobot de HuggingFace, sobre la tarea PushT, un benchmark estándar en el que un robot debe empujar un objeto (un círculo) hasta una posición objetivo. El modelo fue entrenado durante 1,48 millones de pasos con batch size 8, lo que equivale a unas 461 épocas sobre el conjunto de demostraciones. La evaluación se realizó con 5000 semillas y un número de pasos de acción (n_action_steps) de 16. No se especifican detalles sobre el dataset de demostraciones, el preprocesamiento de observaciones ni el uso de técnicas como RLHF o DPO, que no son aplicables en este contexto.

## Capacidades

- Control robótico para la tarea PushT: el modelo genera secuencias de acciones de 16 pasos que empujan un objeto hacia una posición objetivo.
- Aprendizaje por imitación: la política se deriva de demostraciones humanas o generadas, sin necesidad de recompensas explícitas.
- Generación de action chunks: predice bloques de acciones futuras, lo que reduce la frecuencia de inferencia y mejora la estabilidad del control.
- Integración con LeRobot: compatible con el ecosistema de HuggingFace para entrenamiento, evaluación y despliegue de políticas robóticas.
- No incluye capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico, al ser un modelo puramente motor.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar el efecto del batch size y el número de pasos en la convergencia y robustez de políticas ACT, comparando con otros checkpoints del mismo autor (bs8_800k, bs64_200k).
- Benchmark de control robótico: sirve como referencia para evaluar nuevas arquitecturas o algoritmos en la tarea PushT, un estándar en la comunidad de robótica.
- Desarrollo de políticas de manipulación: puede adaptarse mediante fine-tuning a tareas similares de empuje o manipulación con objetos rígidos, aunque requiere reentrenamiento.
- Educación y prototipado: al ser un modelo pequeño (83,9M parámetros), es adecuado para ejecutarse en GPUs de gama media o incluso en CPU para pruebas de concepto.
- Comparación de frameworks: permite contrastar el rendimiento de ACT frente a Diffusion Policy u otros métodos en el mismo entorno, usando LeRobot como base común.
- Estudio de generalización: al evaluar con 5000 semillas, se puede analizar la robustez del modelo ante variaciones en las condiciones iniciales del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo fue evaluado con n=5000 semillas y n_action_steps=16, pero no se proporcionan métricas numéricas (éxito, error de posición, etc.). Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 83,9M parámetros, la inferencia puede ejecutarse en GPUs con 4-8 GB de VRAM, dependiendo de la resolución de las observaciones y el tamaño del batch.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 3060, RTX 4090, A100, etc.) es suficiente para inferencia. Para entrenamiento, se recomienda al menos 8-12 GB de VRAM, aunque el autor no especifica requisitos concretos.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: LeRobot (PyTorch), con posibilidad de exportar a ONNX o TensorRT para inferencia optimizada. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para PushT) con datos de rendimiento publicados. El propio autor ha publicado otros checkpoints del mismo lineage (act_pusht_dec7_bs8_800k y act_pusht_bs64_dec7_200k), pero no se ofrecen métricas comparativas. Se podría comparar con Diffusion Policy, otro método popular para PushT, pero no hay datos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo específico para la tarea PushT: no es generalizable a otras tareas robóticas sin un reentrenamiento completo.
- Sin métricas publicadas: no se puede verificar la calidad del modelo ni su rendimiento relativo, lo que limita su uso como referencia fiable.
- Modelo de investigación: no está pensado para producción; carece de garantías de robustez, seguridad o repetibilidad en entornos reales.
- Dependencia del entorno de simulación: el rendimiento puede degradarse al transferir a un robot físico sin calibración adicional.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece soporte ni garantías implícitas.
- No se especifican sesgos ni riesgos de alucinación, al no ser un modelo generativo de texto; sin embargo, como política de control, puede producir acciones erróneas si las observaciones difieren de las de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaheroth/act_pusht_dec7_bs8_1480k
- Repositorio del autor (robot-learning): https://github.com/JaHeRoth/robot-learning
- Checkpoint intermedio (bs8_800k): https://huggingface.co/jaheroth/act_pusht_dec7_bs8_800k
- Checkpoint con batch size 64 (bs64_200k): https://huggingface.co/jaheroth/act_pusht_bs64_dec7_200k
- Perfil de GitHub del autor: https://github.com/JaHeRoth
