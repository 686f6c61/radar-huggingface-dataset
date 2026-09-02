# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__spread_p05__pi05__seed_0

## Resumen

Este modelo es una política robótica de tipo Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), el modelo de Physical Intelligence diseñado para generalización en entornos abiertos. El autor, sam-guided-vlas, ha realizado un fine-tuning sobre el modelo base `lerobot/pi05_base` utilizando el framework LeRobot de Hugging Face, adaptado del repositorio OpenPI. El resultado es un modelo especializado en tareas de manipulación robótica sobre un robot Panda, con tres cámaras de entrada y control de 7 grados de libertad.

El modelo se ha entrenado con un dataset de 200 episodios que incluye 69.392 frames a 20 FPS, cubriendo 20 tareas distintas como apilar objetos, recoger alimentos o manipular utensilios de cocina. Con 4.143 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización adecuada. Su relevancia radica en que demuestra cómo fine-tuning de un VLA preentrenado puede adaptarse a tareas específicas con relativamente pocos datos, un enfoque práctico para laboratorios de robótica.

La licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su adopción en entornos industriales y de investigación. Sin embargo, al ser un modelo especializado para un robot concreto, su aplicabilidad fuera del hardware Panda es limitada sin retraining adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi05 (π₀.₅), Vision-Language-Action transformer con difusión de acciones |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de acción robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible (no procesa lenguaje de forma directa en esta implementación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi05 es la evolución de π₀, un modelo VLA de Physical Intelligence que combina visión, lenguaje y acción en un único transformer. La implementación de LeRobot, adaptada de OpenPI, utiliza un enfoque de difusión para generar secuencias de acciones a partir de observaciones multimodales (estado del robot e imágenes de cámaras). El modelo base `lerobot/pi05_base` ha sido preentrenado en una amplia variedad de datos robóticos para lograr generalización a entornos nuevos.

El fine-tuning se realizó con el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__spread_p05`, que contiene 200 episodios de manipulación en simulación con un robot Panda. Se usaron 45.000 pasos de entrenamiento con batch size 16, optimizador AdamW y learning rate 5e-05. Las observaciones incluyen el estado del robot (9 dimensiones) y tres imágenes RGB de 224x224 píxeles procedentes de las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. La salida es un vector de acción de 7 dimensiones correspondiente a las articulaciones del brazo.

No se dispone de información sobre el uso de técnicas como RLHF o DPO en este modelo, ya que el entrenamiento se basó exclusivamente en imitación supervisada con el dataset mencionado.

## Capacidades

- Generación de acciones robóticas de 7 grados de libertad a partir de observaciones visuales y de estado.
- Procesamiento de tres flujos de imagen simultáneos (vista global, cámara en mano y cámara secundaria en mano) a 224x224 píxeles.
- Ejecución de tareas de manipulación como apilar objetos, recoger alimentos, mover utensilios y clasificar elementos en contenedores.
- Generalización a 20 tareas distintas entrenadas con el mismo conjunto de datos.
- Inferencia a 20 FPS, compatible con control en tiempo real del robot Panda.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, razonamiento multi-paso ni capacidades de lenguaje conversacional al ser un modelo puramente motor.

## Casos de uso

- Automatización de líneas de picking en almacenes: el modelo puede clasificar y apilar objetos de distintos tipos (latas, cajas, botellas) sobre una cinta, gracias a su entrenamiento en tareas de "basket" y "pile" con cámara global y en mano.
- Manipulación de alimentos en entornos de cocina robotizada: tareas como "cake", "hamburger", "orange" o "spice" permiten que un brazo Panda prepare bandejas o emplace ingredientes con precisión milimétrica.
- Investigación en aprendizaje por imitación: al ser un fine-tuning de Pi05 con Apache 2.0, sirve como punto de partida para estudiar la transferencia de VLA a dominios específicos con pocos datos (solo 200 episodios).
- Desarrollo de sistemas de control robótico en simulación: el modelo se entrenó en un entorno simulado, por lo que puede usarse para validar algoritmos de control antes de llevarlos al hardware real.
- Benchmarking de VLA en tareas de apilado: las 20 tareas cubren una variedad de formas y texturas, útil para comparar el rendimiento de diferentes arquitecturas en manipulación de objetos cotidianos.
- Formación en robótica asistida: laboratorios educativos pueden desplegar este modelo en un Panda real con LeRobot para demostrar capacidades de aprendizaje por demostración sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito por tarea, ni comparaciones con otros modelos en los mismos entornos.

## Requisitos de hardware

- VRAM estimada: con 4.143 millones de parámetros en precisión fp32, el modelo requiere aproximadamente 16,6 GB solo para los pesos. Con cuantización a fp16 o bf16, la VRAM necesaria baja a unos 8,3 GB, y con cuantización int8 a unos 4,1 GB. Sin embargo, no se han publicado versiones cuantizadas, por lo que el despliegue estándar requiere al menos 16-24 GB de VRAM.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 con 24 GB o más es adecuada para inferencia en fp16. Para entrenamiento o fine-tuning adicional, se recomienda una A100 o H100 con 40-80 GB.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090/4090 puede ejecutar el modelo, pero no cabrá en GPUs de 8 GB como la RTX 3070 o RTX 4060 sin cuantización agresiva.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia local con PyTorch. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos publicados, pero al operar a 20 FPS con tres cámaras de 224x224, se espera una latencia de inferencia inferior a 50 ms en una GPU moderna. El throughput depende de la resolución de imagen y el número de pasos de difusión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Pi05 fine-tuned) | 4,14B | No aplica | VLA robótico | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4,14B (aprox.) | No aplica | VLA robótico | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 2048 tokens | VLA robótico | MIT | Hugging Face |
| RT-2 (55B) | 55B | 2048 tokens | VLA robótico | No abierto | No disponible |

Este modelo se diferencia de OpenVLA y RT-2 en que es un fine-tuning de Pi05, que usa difusión de acciones en lugar de generación autorregresiva, lo que suele dar mayor precisión en control fino. Su tamaño es menor que OpenVLA (4,14B vs 7B), lo que facilita el despliegue en hardware modesto. No se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido y podría ser inferior al esperado en entornos no simulados.
- El modelo fue entrenado con solo 200 episodios en simulación, lo que limita su robustez ante variaciones de iluminación, posición de objetos o distracciones no vistas en el dataset.
- Las tareas están restringidas a 20 categorías de objetos; fuera de ellas, el modelo podría fallar o comportarse de forma impredecible.
- Depende de las cámaras específicas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y del robot Panda; su uso con otros hardware requiere reentrenamiento.
- El tamaño del repositorio (18,7 GB) sugiere que incluye checkpoints de entrenamiento adicionales, lo que puede aumentar los costes de descarga y almacenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Pi05 tiene su propia licencia (Apache 2.0 según la model card), pero conviene verificar los términos de Physical Intelligence para uso en productos comerciales.
- No hay soporte para cuantización GGUF o formatos optimizados para CPU, por lo que se requiere GPU con suficiente VRAM.
- Al ser un modelo de acción, no tiene capacidades de lenguaje natural: no puede interpretar instrucciones complejas ni explicar sus decisiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__spread_p05__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__spread_p05
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
