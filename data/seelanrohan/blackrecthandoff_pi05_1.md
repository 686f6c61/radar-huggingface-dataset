# seelanrohan/blackRectHandoff_pi05_1

## Resumen

El modelo `seelanrohan/blackRectHandoff_pi05_1` es un fine-tuning del modelo base Pi0.5 (también conocido como pi05), un modelo fundacional de robótica de tipo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence. Este checkpoint concreto ha sido entrenado por el usuario Rohan Seelan para la tarea específica de *handoff* (transferencia) de un objeto rectangular negro entre dos brazos robóticos, utilizando dos datasets propios (`black_rectangular_object_two_arm_handoff_1_384` y `black_rectangular_object_two_arm_handoff_3_384`).

El modelo parte de la arquitectura Pi0.5, que combina un codificador visual, un modelo de lenguaje (Gemma 2B) y un experto de acción (Gemma 300M) para generar acciones de control directamente desde observaciones visuales y lenguaje. Este fine-tuning se realizó con 20.000 pasos de entrenamiento, un tamaño de lote de 16 y una política de acciones relativas, lo que lo hace adecuado para tareas de manipulación bimanual de precisión. Su relevancia radica en demostrar cómo un modelo VLA generalista puede adaptarse a una tarea robótica concreta con un dataset reducido, un caso de uso típico en investigación y desarrollo de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA: vision-language-action, basada en PaliGemma con experto de acción) |
| Parametros totales | no disponible (el repo pesa 244.8 GB, lo que sugiere pesos en bfloat16 de un modelo de varios miles de millones de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el tokenizador tiene `tokenizer_max_length: 200`) |
| Tipos de cuantizacion | no disponible (el entrenamiento usa `dtype: bfloat16`) |
| Idiomas soportados | no disponible (el modelo base Pi0.5 soporta inglés, pero este checkpoint no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repo) |

## Arquitectura y entrenamiento

Pi0.5 es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence. Su arquitectura se basa en PaliGemma, un modelo multimodal que combina un codificador de visión (SigLIP) con un modelo de lenguaje Gemma. Sobre esta base, Pi0.5 añade un "experto de acción" (action expert) que genera secuencias de acciones continuas mediante un proceso de difusión. En esta configuración concreta, el experto de acción es una variante de Gemma de 300M de parámetros, mientras que el modelo de lenguaje principal es Gemma 2B. El modelo procesa observaciones visuales (imágenes de 224x224 píxeles) y produce acciones de control para los brazos robóticos.

El entrenamiento de este checkpoint se realizó con el framework LeRobot, utilizando un dataset de demostraciones de handoff de un objeto rectangular negro entre dos brazos. Se emplearon 20.000 pasos con un tamaño de lote de 16, optimizador AdamW con tasa de aprendizaje 2.5e-5 y un scheduler de decaimiento coseno con 1.000 pasos de calentamiento. Se aplicaron aumentos de imagen (afines, brillo, contraste, saturación, etc.) y normalización de acciones mediante cuantiles. La política genera chunks de 50 pasos de acción con 10 pasos de inferencia de difusión. No se utilizó PEFT (fine-tuning completo) y se congeló el codificador de visión (`freeze_vision_encoder: False` indica que no se congeló, aunque el campo está en False, lo que significa que sí se entrenó). El entrenamiento se realizó en bfloat16 con gradient checkpointing.

## Capacidades

- Generación de acciones de control para robótica: el modelo produce secuencias de 50 pasos de acción (posición, orientación, velocidad, etc.) para brazos robóticos, específicamente para tareas de handoff bimanual.
- Percepción visual: procesa imágenes de 224x224 píxeles para entender la escena y localizar el objeto.
- Aprendizaje de tareas específicas: fine-tuning para transferencia de objetos rectangulares negros entre dos brazos, con generalización limitada a variaciones del mismo objeto.
- Soporte de acciones relativas: utiliza `use_relative_actions: True`, lo que permite que el modelo aprenda movimientos relativos a la posición actual, mejorando la robustez.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No se reportan capacidades de tool calling, agentes, razonamiento multimodal general ni generación de texto libre, ya que es un modelo puramente orientado a control robótico.

## Casos de uso

- Manipulación bimanual en investigación: el modelo puede desplegarse en un robot de dos brazos para estudiar estrategias de handoff de objetos, por ejemplo en laboratorios de robótica que investigan coordinación bimanual.
- Automatización de tareas de ensamblaje: en líneas de producción donde un brazo debe entregar una pieza a otro, este modelo puede aprender la secuencia de transferencia a partir de demostraciones.
- Benchmarking de VLA: sirve como punto de comparación para evaluar el rendimiento de Pi0.5 fine-tuneado en tareas específicas frente a otros enfoques (aprendizaje por refuerzo, control clásico).
- Desarrollo de políticas de agarre y entrega: el modelo puede adaptarse a diferentes posiciones iniciales del objeto gracias a las acciones relativas y al aumento de datos.
- Entrenamiento de robots en simulación: puede usarse en entornos simulados (por ejemplo, MuJoCo o Isaac) para validar la política antes de transferirla al hardware real.
- Estudio de generalización de VLA: al ser un fine-tuning con un dataset pequeño, es útil para investigar cuántos datos y qué aumentos son necesarios para adaptar un modelo base a una tarea nueva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de éxito, tasas de finalización de tarea ni comparaciones con otros modelos en la model card. Tampoco se dispone de datos de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero dado el tamaño del repo (244.8 GB en bfloat16) y la arquitectura Pi0.5 (Gemma 2B + experto 300M + codificador visual), se estima que la inferencia requiere al menos 24-40 GB de VRAM en bfloat16. Con cuantización a 8 bits podría reducirse a ~12-16 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para entrenamiento se usó una GPU con al menos 80 GB (típicamente A100 o H100) dado el batch size de 16 y el uso de gradient checkpointing. Para inferencia, una RTX 4090 (24 GB) podría ser suficiente con cuantización, aunque no está verificado.
- Compatibilidad con consumer GPU: no confirmado; el modelo es grande y no hay versiones GGUF o cuantizadas publicadas.
- Opciones de despliegue: el modelo está pensado para usarse con LeRobot (framework de Physical Intelligence). También podría servirse con vLLM o TGI si se adapta, pero no hay soporte oficial. Para robótica, se recomienda usar el pipeline de LeRobot con ROS o controladores directos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `seelanrohan/blackRectHandoff_pi05_1` | Pi0.5 (VLA) | no disponible (repo 244.8 GB) | no disponible | no disponible | HuggingFace |
| Pi0.5 base (Physical Intelligence) | Pi0.5 (VLA) | no publicado oficialmente | no disponible | no disponible (uso investigacion) | OpenPI, Qualcomm AI Hub |
| OpenVLA (openvla/openvla-7b) | VLA basado en Prismatic (LLaMA-2 7B) | 7B | 2048 | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características arquitectónicas y de disponibilidad. Pi0.5 es más reciente y está diseñado para manipulación diestra, mientras que OpenVLA es un modelo más antiguo y generalista. Este checkpoint concreto es un fine-tuning de Pi0.5 para una tarea específica, por lo que su rendimiento en handoff podría ser superior al de un modelo generalista, pero no hay métricas que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó únicamente con demostraciones de un objeto rectangular negro; no generalizará a otros colores, formas o texturas sin fine-tuning adicional.
- Riesgo de alucinación: al ser un modelo de control, no genera texto, pero puede producir acciones incorrectas o inestables si la escena difiere del dataset de entrenamiento.
- Limitaciones de contexto: la ventana de contexto del tokenizador está limitada a 200 tokens, lo que restringe la cantidad de información textual que puede procesar (aunque en robótica el texto suele ser corto).
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si es de uso comercial o solo investigativo. Se recomienda contactar al autor antes de usar en producción.
- Dependencia del framework: el modelo está integrado con LeRobot y puede requerir versiones específicas de dependencias (PyAV, PyTorch, etc.) para cargarse correctamente.
- Tamaño y despliegue: el peso de 244.8 GB hace que el despliegue en edge sea inviable; requiere infraestructura de servidor con GPUs de alta gama.
- Sin evaluación formal: no hay métricas de éxito publicadas, por lo que su fiabilidad en tareas reales no está demostrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/seelanrohan/blackRectHandoff_pi05_1
- Perfil del autor: https://huggingface.co/seelanrohan/models
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- OpenPI (librería de modelos VLA de Physical Intelligence): https://www.openpi.net/english.html
- Wiki sobre Pi0.5 (artículo técnico): https://github.com/sguys99/ai-wiki/blob/main/wiki/physical-ai/black-2025-pi05-a-vision-language-action-model-with.md
