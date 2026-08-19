# sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__all_cameras__live__pi05__seed_0

## Resumen

Este modelo es un fine-tuning de **π₀.₅ (Pi05)**, un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, adaptado al ecosistema LeRobot de Hugging Face. El autor, `sam-guided-vlas`, ha entrenado esta política robótica sobre el modelo base `lerobot/pi05_base` para controlar un brazo robótico Panda en tareas de manipulación de objetos cotidianos (apilar, recoger, colocar). Con aproximadamente 4.140 millones de parámetros, el modelo procesa tres flujos de cámara (vista global y dos cámaras ojo-en-mano) junto con el estado del robot para generar acciones de 7 grados de libertad.

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de un VLA de código abierto sobre un dataset propio, siguiendo la metodología de LeRobot. Aunque no se han publicado resultados de evaluación, su existencia sirve como referencia práctica para quienes deseen entrenar políticas robóticas con π₀.₅ en entornos simulados o reales. El repositorio incluye pesos en formato `safetensors` y está licenciado bajo Apache-2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (transformer multimodal) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa imágenes de 224×224 y estado del robot) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo de acción, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La implementación en LeRobot está adaptada del repositorio OpenPI. El fine-tuning se realizó sobre el checkpoint `lerobot/pi05_base` con el dataset `sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__all_cameras__live`, que contiene 200 episodios y 69.392 frames a 20 FPS, abarcando 20 tareas de manipulación (basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone).

El entrenamiento se ejecutó con LeRobot versión 0.6.0 durante 45.000 pasos, con un tamaño de lote de 16, optimizador AdamW y una tasa de aprendizaje de 5×10⁻⁵. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado estándar. Las observaciones incluyen el estado del robot (9 dimensiones) y tres imágenes RGB de 224×224, mientras que la salida es un vector de acción de 7 dimensiones.

## Capacidades

- **Control robótico de manipulación**: genera comandos de posición/velocidad para un brazo Panda de 7 grados de libertad.
- **Percepción multimodal**: integra tres cámaras (vista global y dos ojo-en-mano) para razonar sobre la escena.
- **Generalización a tareas específicas**: entrenado para 20 tareas de apilado, recogida y colocación de objetos.
- **Ejecución en tiempo real**: diseñado para inferencia a 20 FPS, compatible con el pipeline de LeRobot.
- **Fine-tuning sobre base preentrenada**: hereda las capacidades de π₀.₅ para entornos nuevos, aunque limitado por el dataset de fine-tuning.
- **No soporta tool calling ni agentes conversacionales**: es un modelo puramente de acción, sin interfaz de lenguaje natural.

## Casos de uso

- **Automatización de picking en almacenes**: el modelo puede seleccionar y colocar objetos de una pila (tareas "basket", "can", "jar") en un entorno controlado, reduciendo la necesidad de programación manual de trayectorias.
- **Robótica de laboratorio**: manipulación de muestras o reactivos (tareas "spray", "soap dispenser") con precisión repetitiva, ideal para experimentos que requieren consistencia.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar la transferencia de políticas VLA entre simulaciones y robots reales, gracias a su licencia Apache-2.0.
- **Desarrollo de nuevas tareas de manipulación**: los desarrolladores pueden fine-tunear este modelo sobre datasets propios con LeRobot, usando el flujo `lerobot-train` documentado.
- **Benchmarking de VLA en robótica**: al ser un fine-tune de π₀.₅, permite comparar el rendimiento de la base frente a adaptaciones específicas en tareas concretas.
- **Educación y prototipado**: estudiantes e investigadores pueden desplegar la política en un Panda simulado o real con `lerobot-rollout` para experimentar con control basado en visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas como tasa de éxito por tarea, ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no especificada por el autor. Dado el tamaño del repositorio (220.3 GB), los pesos probablemente están en precisión fp32 o fp16. Una estimación conservadora para inferencia en fp16 sería de 8-10 GB de VRAM, pero no hay confirmación oficial.
- **GPU recomendadas**: no se indica. Para entrenamiento con batch 16 y tres imágenes por paso, se necesitaría al menos una GPU con 24 GB (RTX 3090/4090, A10G) o varias GPUs.
- **Compatibilidad con consumer GPU**: posible en fp16 con una RTX 3090 o superior, pero el entrenamiento completo requeriría más recursos.
- **Opciones de despliegue**: el modelo está integrado en LeRobot, por lo que se ejecuta con PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput**: no disponibles. El diseño a 20 FPS sugiere que la inferencia debe completarse en menos de 50 ms, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo es un fine-tune de `lerobot/pi05_base`, por lo que su rendimiento depende en gran medida de la calidad del dataset de fine-tuning. Alternativas en el mismo espacio (VLA para robótica) incluyen OpenVLA (7B, licencia MIT) y RT-2 de Google (no abierto), pero no se han encontrado comparaciones numéricas con este modelo concreto.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay métricas de éxito en tareas reales, lo que impide validar su rendimiento antes de usarlo en producción.
- **Dataset de entrenamiento reducido**: solo 200 episodios, lo que puede limitar la generalización a variaciones de iluminación, posiciones de objetos o robots diferentes.
- **Dependencia de cámaras específicas**: el modelo espera exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`; cualquier cambio en la configuración requiere reentrenamiento.
- **Riesgo de alucinación de acciones**: como todo modelo de imitación, puede generar movimientos no seguros si la distribución de datos de entrenamiento no cubre ciertos estados.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base π₀.₅ tiene su propia licencia (Apache-2.0 según la model card), aunque conviene verificar los términos de Physical Intelligence.
- **Tamaño del repositorio**: 220.3 GB implica costes de almacenamiento y transferencia considerables, y puede no ser viable para despliegues en edge.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__all_cameras__live__pi05__seed_0)
- [Modelo base π₀.₅ (LeRobot)](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__all_cameras__live)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
