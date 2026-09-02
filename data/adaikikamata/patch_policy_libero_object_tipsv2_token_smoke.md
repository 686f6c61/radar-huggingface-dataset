# aDaikiKamata/patch_policy_libero_object_tipsv2_token_smoke

## Resumen

Este modelo es una política neuronal de control robótico entrenada con el framework LeRobot de Hugging Face. Desarrollado por aDaikiKamata, implementa una arquitectura `patch_policy` para resolver tareas de manipulación de objetos en el benchmark LIBERO-Object, concretamente la tarea de recoger un objeto de una estantería y colocarlo en una cesta. El modelo procesa dos imágenes de cámara (una frontal y otra de muñeca) junto con el estado del brazo robótico, y genera comandos de acción de 7 dimensiones para el efector final.

Con 211,9 millones de parámetros, este modelo es relevante para la comunidad de robótica e investigación en aprendizaje por imitación, ya que demuestra el uso de LeRobot para entrenar políticas de manipulación sobre datasets estandarizados como LIBERO. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en proyectos de investigación y desarrollo. No se trata de un modelo de lenguaje ni de visión general, sino de un controlador específico para un robot Panda en entornos simulados o reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | patch_policy (política neuronal para control robótico) |
| Parametros totales | 211.886.599 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura `patch_policy` es una política de aprendizaje por imitación que consume observaciones multimodales: dos imágenes de 256x256 píxeles (cámara principal y cámara de muñeca) y un vector de estado de 8 dimensiones (posición y orientación del efector final, etc.). La salida es un vector de acción de 7 dimensiones que controla el brazo robótico Panda. No se han publicado detalles internos sobre si utiliza transformers, redes convolucionales o una combinación de ambas.

El entrenamiento se realizó con el dataset `lerobot/libero_object_image`, que contiene 454 episodios y 66.984 frames a 10 FPS, cubriendo 10 tareas de recoger y colocar objetos (por ejemplo, "pick up the orange juice and place it in the basket"). La configuración de entrenamiento incluye 100 pasos, batch size de 128, optimizador AdamW con learning rate de 5e-05 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. El nombre del repositorio sugiere una posible relación con el modelo TIPSv2 (paper arXiv 2604.12012), pero esta conexión no está documentada en la model card y debe considerarse especulativa.

## Capacidades

- Control de un brazo robótico Panda para tareas de pick-and-place (recoger y colocar objetos).
- Procesamiento de dos flujos de imagen simultáneos (cámara principal y cámara de muñeca) junto con el estado del robot.
- Generación de acciones continuas de 7 dimensiones (posición y orientación del efector final).
- Entrenado específicamente para 10 tareas del benchmark LIBERO-Object, todas ellas variaciones de recoger un objeto y colocarlo en una cesta.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No dispone de capacidades de lenguaje natural, tool calling, razonamiento simbólico ni generación de texto.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales controlados: el modelo puede ejecutar rutinas de recoger y colocar objetos en una cinta o estación fija, gracias a su entrenamiento en tareas repetitivas de pick-and-place.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la generalización de políticas robóticas a nuevas configuraciones de objetos o iluminación, ya que está entrenado en un dataset estandarizado y reproducible.
- Prototipado rápido de políticas robóticas con LeRobot: los desarrolladores pueden clonar este modelo y adaptarlo a nuevas tareas mediante fine-tuning con datasets propios, aprovechando la infraestructura de LeRobot.
- Benchmarking de algoritmos de control: al estar entrenado en LIBERO-Object, puede utilizarse como referencia para comparar el rendimiento de otras arquitecturas de políticas (diffusion policies, ACT, etc.) en el mismo conjunto de tareas.
- Educación en robótica: en entornos académicos, este modelo permite a estudiantes experimentar con control robótico basado en visión sin necesidad de entrenar desde cero, usando simuladores compatibles con LeRobot.
- Evaluación de robustez en simulación: puede desplegarse en entornos simulados (por ejemplo, MuJoCo) para probar la resistencia del controlador ante perturbaciones o cambios en la posición de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito por tarea, ni comparaciones con otras políticas.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación del modelo.
- Con 211,9 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 850 MB, y en FP16 unos 425 MB. Esto sugiere que podría ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- LeRobot requiere una GPU NVIDIA con soporte CUDA para entrenamiento e inferencia. Modelos como RTX 3060, RTX 4060 o superiores serían suficientes para inferencia en tiempo real.
- Para despliegue en robot real, se necesita además el hardware robótico (brazo Panda) y las cámaras configuradas según los requisitos de LeRobot.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones publicadas con otras políticas robóticas del mismo tamaño o del mismo benchmark. El modelo es específico de LeRobot y LIBERO, y no hay datos de rendimiento relativo frente a alternativas como diffusion policies o ACT.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el dataset LIBERO-Object, que contiene 10 tareas muy similares (recoger un objeto y colocarlo en una cesta). Su capacidad de generalización a otras tareas, objetos o disposiciones espaciales es limitada y no ha sido evaluada.
- No se han proporcionado resultados de evaluación en robot real, por lo que el rendimiento en entornos físicos es desconocido. Puede existir una brecha de simulación-real.
- El entrenamiento se realizó con solo 100 pasos, lo que podría indicar un ajuste insuficiente o sobreajuste al dataset, dependiendo de la complejidad de la tarea.
- La posible relación con TIPSv2 no está documentada; si se utiliza ese backbone, podría haber dependencias no declaradas.
- Al ser un modelo de control robótico, no debe utilizarse para tareas de lenguaje, visión general o razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para robótica y requiere hardware específico para su despliegue práctico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aDaikiKamata/patch_policy_libero_object_tipsv2_token_smoke
- LeRobot (framework): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_object_image
- Paper TIPSv2 (posible relación, no confirmada): https://arxiv.org/abs/2604.12012
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
