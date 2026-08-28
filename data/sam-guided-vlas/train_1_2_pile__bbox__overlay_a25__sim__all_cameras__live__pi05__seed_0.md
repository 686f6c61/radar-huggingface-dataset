# sam-guided-vlas/train_1_2_pile__bbox__overlay_a25__sim__all_cameras__live__pi05__seed_0

## Resumen

Este modelo es un fine-tune de π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, adaptado al ecosistema LeRobot de Hugging Face. El autor, `sam-guided-vlas`, ha entrenado esta política sobre un dataset de simulación con tareas de manipulación de objetos cotidianos (apilado, recogida, colocación) usando un robot Panda con tres cámaras. El resultado es un policy que convierte observaciones visuales y de estado en comandos de acción de 7 grados de libertad.

Con 4.143 millones de parámetros, este modelo se posiciona en la gama media de los VLA actuales, ofreciendo un equilibrio entre capacidad de generalización y requisitos de hardware asequibles. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para investigación y prototipado industrial. La relevancia actual radica en que π₀.₅ es uno de los primeros VLA abiertos con capacidad de generalización a entornos no vistos, y este fine-tune demuestra su aplicabilidad a tareas específicas con un dataset relativamente pequeño (200 episodios).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptación de π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo procesa secuencias de imágenes y estado, no texto largo) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | No disponible (el modelo no genera texto; las instrucciones se codifican como embeddings de lenguaje, pero no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, que extiende π₀ con mejoras para generalización a entornos nuevos. Es un VLA que combina un codificador de visión (para procesar imágenes de las cámaras), un codificador de lenguaje (para interpretar instrucciones) y un decodificador de acciones que genera comandos de control continuos. La implementación en LeRobot sigue el repositorio OpenPI de Physical Intelligence.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset de simulación con 200 episodios y 69.392 frames a 20 FPS. Las tareas incluyen 20 categorías de objetos (basket, cake, can, hamburger, etc.) en un escenario de apilado y manipulación. La configuración de entrenamiento fue: 45.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-5 y seed 0. No se menciona el uso de RLHF o DPO; es un entrenamiento supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Procesamiento multimodal: consume tres flujos de imagen (224x224) más un vector de estado de 9 dimensiones (posición articular, etc.).
- Generalización a tareas de apilado y recogida de objetos cotidianos en entornos simulados.
- Ejecución en tiempo real: diseñado para inferencia a 20 FPS, compatible con el framework LeRobot.
- No incluye generación de texto, tool calling ni capacidades de agente conversacional; es exclusivamente un policy de control.

## Casos de uso

- Automatización de picking y placing en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de una cinta y colocarlos en contenedores, gracias a su entrenamiento en tareas de apilado con múltiples categorías de objetos.
- Prototipado de celdas de ensamblaje: en entornos de simulación, permite validar secuencias de manipulación antes de implementarlas en hardware real, reduciendo costes de iteración.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de VLA base mejora el rendimiento en tareas específicas con pocos datos.
- Educación en robótica: al estar integrado con LeRobot y documentado, es adecuado para cursos que enseñan entrenamiento y despliegue de políticas robóticas.
- Benchmarking de VLA: permite comparar el rendimiento de π₀.₅ fine-tuneado frente a otros modelos en tareas estandarizadas de manipulación.
- Desarrollo de asistentes robóticos domésticos: aunque entrenado en simulación, el modelo puede adaptarse a tareas como recoger objetos de una mesa o clasificar alimentos, con la transferencia a sim2real pendiente de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito por tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143 millones de parámetros, en precisión FP32 se necesitan aproximadamente 16,6 GB; en BF16 (formato habitual en LeRobot) unos 8,3 GB. A esto hay que sumar la memoria para las activaciones de las imágenes (3 canales a 224x224) y el estado.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) son suficientes para inferencia en tiempo real. GPUs con menos de 12 GB podrían tener problemas con el batch de imágenes.
- En consumer GPU: sí, cabe en una RTX 3090 o 4090 con cuantización BF16, aunque no se ofrecen versiones cuantizadas oficiales.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que soporta inferencia en PyTorch con CUDA. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño y la entrada de tres imágenes, se estima una latencia de decenas de milisegundos por paso en una GPU moderna, suficiente para control a 20 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Modelos comparables en la categoría de VLA para robótica incluyen π₀ (base), OpenVLA (7B parámetros) y RT-2 (55B), pero no se han encontrado benchmarks que comparen este fine-tune con ellos. Se recomienda consultar la documentación de LeRobot y los repositorios de Physical Intelligence para obtener métricas de referencia.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: el modelo no ha sido validado en robot real, por lo que su transferencia sim2real es incierta y puede requerir ajustes adicionales.
- Sesgos del dataset: las 20 tareas se centran en objetos de una categoría específica (alimentos, utensilios de cocina); el rendimiento en otros objetos o escenarios no está garantizado.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir comandos de acción no válidos o inseguros si las observaciones difieren del dominio de entrenamiento.
- Sin capacidades de lenguaje: no puede interpretar instrucciones complejas en lenguaje natural más allá de las tareas predefinidas; el texto se usa solo como condición, no como entrada conversacional.
- Dependencia de la configuración de cámaras: el modelo espera exactamente tres cámaras con nombres específicos (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); cambios en la disposición requieren reentrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales; se recomienda revisar la licencia del repositorio OpenPI.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__bbox__overlay_a25__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__bbox__overlay_a25__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
