# sam-guided-vlas/train_1_2__mask__blur_a50__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2__mask__blur_a50__sim__all_cameras__live__pi05__seed_0` es una política de robótica de tipo visión-lenguaje-acción (VLA) desarrollada por el usuario sam-guided-vlas mediante fine-tuning del modelo base `lerobot/pi05_base` (π₀.₅) de Physical Intelligence. Este modelo está diseñado para controlar un brazo robótico Panda en tareas de manipulación de objetos, generalizando a entornos y situaciones no vistas durante el entrenamiento. Se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot de Hugging Face.

El modelo se entrena sobre un dataset propio de 200 episodios (30 830 frames) que incluye tareas como recoger y colocar objetos cotidianos (botes, tarros, frutas, etc.). Con 4 143 millones de parámetros, el modelo procesa observaciones de estado del robot y dos cámaras (vista de agente y cámara en mano) para producir acciones de 7 grados de libertad. Su relevancia radica en ser una implementación práctica de un VLA open-source que permite a la comunidad reproducir y desplegar políticas de manipulación robótica con hardware accesible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅ (flow-based transformer) |
| Parametros totales | 4 143 404 816 (≈4,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32/FP16 estándar de LeRobot) |
| Idiomas soportados | no disponible (modelo de acción robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción desarrollado por Physical Intelligence que mejora el π₀ original para lograr mejor generalización a entornos nuevos. Según la documentación de OpenPI, π₀.₅ es un modelo basado en flujo (flow-based) que combina codificadores visuales y de lenguaje con un transformador que genera acciones continuas. La implementación en LeRobot adapta el código de OpenPI y permite fine-tuning sobre el modelo base preentrenado con más de 10 000 horas de datos robóticos.

El fine-tuning se realizó con el framework LeRobot (versión 0.6.0) sobre un dataset de 200 episodios capturados a 20 FPS, con 30 830 frames en total. El entrenamiento se ejecutó durante 45 000 pasos con batch size de 16, optimizador AdamW y learning rate de 5e-05. El modelo consume observaciones de estado del robot (9 dimensiones) y dos imágenes RGB de 224×224 píxeles (cámara de agente y cámara en mano), y produce acciones de 7 dimensiones (posiciones articulares del Panda). No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es de imitación supervisada.

## Capacidades

- Control de manipulación robótica: genera comandos de posición articular (7 grados de libertad) para tareas de agarre, levantamiento y colocación de objetos.
- Percepción visual multimodal: integra dos flujos de imagen (vista global y visión en mano) para localizar y manipular objetos.
- Generalización a objetos variados: el dataset de entrenamiento incluye 20 categorías de objetos (dispensador de jabón, mermelada, tarro, cereales, cuchillo, hervidor, pera, patata, boniato, bollo, cesta, comida en caja, pastel, lata, hamburguesa, limón, naranja, especia, calabaza, spray).
- Integración con LeRobot: compatible con el flujo de trabajo de entrenamiento, evaluación y despliegue de LeRobot (comandos `lerobot-train` y `lerobot-rollout`).
- No incluye capacidades de generación de texto, tool calling ni razonamiento conversacional; es un modelo de acción puro.

## Casos de uso

- Automatización de tareas de picking en almacenes: el modelo puede controlar un brazo Panda para recoger y colocar productos en cajas, gracias a su capacidad de generalizar a objetos de distintas formas y tamaños.
- Manipulación en líneas de ensamblaje: permite realizar tareas repetitivas de colocación de piezas (como tarros o botes) con precisión, usando la cámara en mano para ajustar la posición.
- Robótica doméstica: puede ejecutar tareas como recoger objetos de una mesa y depositarlos en un contenedor, útil en entornos de asistencia personal.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning con nuevos datasets, ya que está basado en un modelo base robusto (π₀.₅).
- Pruebas de generalización en entornos simulados: se puede evaluar la robustez del modelo frente a variaciones de iluminación, fondo o posición de objetos, dado que el dataset incluye máscaras y desenfoques (según el nombre del repo).
- Formación y demostración en robótica educativa: permite a estudiantes y desarrolladores desplegar una política de manipulación funcional con hardware de bajo coste (Panda) y software open-source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de métricas como tasa de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado el tamaño de 4,14 B de parámetros, se estima que una GPU con al menos 8-10 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3080/4080), pero no hay confirmación oficial.
- GPU recomendadas: no se especifican; el entrenamiento se realizó presumiblemente con GPUs de gama alta (A100, H100) pero el despliegue puede hacerse en GPUs consumer como RTX 3090 o superiores.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño moderado de parámetros y la ausencia de MoE, pero requiere verificación empírica.
- Opciones de despliegue: al ser un modelo de LeRobot, se ejecuta mediante el comando `lerobot-rollout` con la interfaz de Python de LeRobot. No se mencionan soporte para vLLM, llama.cpp u otros motores de inferencia (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune pi05) | 4,14 B | no disponible | sin evaluación | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible (probablemente similar) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7 B | no disponible | MMLU, etc. no aplicable | MIT | Hugging Face |

Nota: OpenVLA es otro VLA de robótica de código abierto, pero no se dispone de datos comparativos directos en la información proporcionada. La comparación detallada no es posible sin datos de evaluación.

## Limitaciones y advertencias

- No se han realizado evaluaciones formales: no hay datos de tasa de éxito en tareas reales, por lo que el rendimiento práctico es incierto.
- Datos de entrenamiento limitados: 200 episodios pueden no cubrir la variabilidad completa del mundo real; el modelo puede fallar ante objetos, iluminaciones o configuraciones muy diferentes.
- Dependencia del hardware: el modelo está entrenado para un robot Panda específico; su transferencia a otros brazos requiere reentrenamiento o adaptación.
- Riesgo de sesgos: el dataset se centra en objetos de cocina y despensa; el modelo puede tener bajo rendimiento en otros dominios.
- Sin capacidades de razonamiento o lenguaje: es un modelo de acción puro, no apto para tareas que requieran interacción conversacional.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base (pi05) y de Physical Intelligence, ya que pueden existir restricciones adicionales.
- El nombre del repo sugiere que se aplicaron máscaras y desenfoque en el entrenamiento (posiblemente para aumentar robustez), pero no se documentan los detalles técnicos de estas técnicas.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__mask__blur_a50__sim__all_cameras__live__pi05__seed_0
- Modelo base (lerobot/pi05_base): https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__blur_a50__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI en GitHub: https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
