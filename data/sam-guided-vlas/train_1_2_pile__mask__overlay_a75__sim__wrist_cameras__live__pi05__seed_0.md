# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__wrist_cameras__live__pi05__seed_0

## Resumen

Este modelo es un fine-tune del modelo base `lerobot/pi05_base` (π₀.₅), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence para control robótico con generalización a entornos no vistos durante el entrenamiento. El fine-tune ha sido realizado por el usuario `sam-guided-vlas` utilizando la librería LeRobot de Hugging Face, sobre un dataset propio de simulación con un robot Panda. El modelo está diseñado para tareas de manipulación como recoger y colocar objetos de una pila, usando tres cámaras (una vista global y dos cámaras en la muñeca).

Con aproximadamente 4.14 mil millones de parámetros, este modelo se enmarca en la categoría de VLA de tamaño medio. Su relevancia radica en que demuestra cómo adaptar un modelo base preentrenado a tareas específicas de robótica mediante fine-tuning con LeRobot, un flujo de trabajo accesible para la comunidad. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (no se especifican detalles internos) |
| Parámetros totales | 4.143.404.816 (~4,14 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA que extiende π₀ para lograr generalización a entornos y situaciones nuevas. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se han publicado detalles sobre la arquitectura interna (tipo de transformer, mecanismos de atención, etc.) en la información disponible.

El entrenamiento de este fine-tune se realizó sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__wrist_cameras__live`, que contiene 200 episodios y 69.392 frames a 20 FPS, con tareas de manipulación de objetos como "basket", "cake", "can", "hamburger", etc. La configuración de entrenamiento fue: 45.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; es un fine-tuning supervisado estándar de imitación.

## Capacidades

- Control robótico de un brazo Panda: recibe observaciones de estado (9 dimensiones) y tres imágenes RGB de 224x224 píxeles (vista global y dos cámaras en la muñeca), y produce acciones de 7 dimensiones (posición y orientación del efector).
- Manipulación de objetos en una pila: entrenado para tareas de recogida y colocación de objetos variados (alimentos, utensilios, etc.) en un entorno simulado.
- Generalización a nuevas configuraciones: al estar basado en π₀.₅, hereda la capacidad de generalizar a situaciones no vistas durante el entrenamiento, aunque no se han reportado evaluaciones específicas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- Sin capacidades de lenguaje o tool calling: es un modelo puramente de acción visual, no un chatbot ni un agente conversacional.

## Casos de uso

- Automatización de tareas de picking y placing en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de una pila y colocarlos en una ubicación designada, útil en entornos logísticos.
- Manipulación de objetos en líneas de producción: en fábricas, puede clasificar o reordenar piezas basándose en la entrada visual, reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de VLA base mejora el rendimiento en tareas específicas.
- Desarrollo de robots domésticos: con adaptaciones, podría realizar tareas como recoger alimentos o utensilios en una cocina simulada.
- Benchmarking de políticas robóticas: al estar disponible públicamente, permite comparar el rendimiento de diferentes estrategias de entrenamiento en el mismo entorno.
- Educación en robótica: los estudiantes pueden usar este modelo para aprender a desplegar políticas de control en simuladores o robots reales mediante LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito en tareas reales o simuladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B de parámetros, en FP32 se necesitarían aproximadamente 16,5 GB; en FP16 (si se convirtiera) unos 8,3 GB; en int8 unos 4,1 GB. Sin embargo, no se proporcionan cuantizaciones oficiales, por lo que la inferencia se realizaría probablemente en FP32 o FP16.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para FP32; con FP16 bastaría una RTX 3090 o similar. No se han probado en GPUs de consumo.
- Compatibilidad con consumer GPU: posiblemente sí con FP16 en GPUs de gama alta (RTX 3090/4090), pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También se puede usar con vLLM o TGI si se convierte a un formato compatible, pero no es el flujo estándar para modelos de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (fine-tune pi05) | 4,14 B | no disponible | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible (probablemente similar) | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7 B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55 B | no disponible | no abierta | no disponible |

No se dispone de datos de rendimiento comparativo. Este modelo es un fine-tune específico, mientras que `pi05_base` es el modelo preentrenado general. OpenVLA es otro VLA de código abierto con más parámetros, pero no se han comparado en las mismas tareas.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay métricas de éxito en tareas reales o simuladas, por lo que el rendimiento real es desconocido.
- Dataset de entrenamiento limitado: solo 200 episodios en simulación, lo que puede limitar la robustez en entornos reales.
- Específico para el robot Panda y las cámaras configuradas: no es transferible directamente a otros robots o configuraciones de sensores sin reentrenamiento.
- Sin soporte de lenguaje: no puede interpretar instrucciones en lenguaje natural; las tareas están fijadas por el dataset.
- Riesgo de sobreajuste: al ser un fine-tune sobre un dataset pequeño, puede no generalizar bien a variaciones no vistas.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `pi05_base` (también Apache 2.0 según la model card).
- No se proporcionan cuantizaciones, lo que puede dificultar el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__wrist_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__wrist_cameras__live
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Paper de π₀.₅ (PDF): https://www.pi.website/download/pi05.pdf
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
