# OrderDraconis/pi05_pickplace_leo_6k

## Resumen

El modelo `OrderDraconis/pi05_pickplace_leo_6k` es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez es una implementación del modelo π₀.₅ (Pi05) de Physical Intelligence, un modelo de visión-lenguaje-acción (VLA) diseñado para generalización en robótica de mundo abierto. Este ajuste ha sido realizado por OrderDraconis (Leo Guillier) utilizando la librería LeRobot de Hugging Face, y está especializado en la tarea de recoger una pieza de tela superior y colocarla en un cuadrado objetivo.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye bajo licencia Apache 2.0. Está entrenado sobre un dataset de 122 episodios y 96.339 frames a 30 FPS, con tres cámaras como entrada visual. Su relevancia radica en que demuestra cómo ajustar un modelo VLA de última generación a una tarea robótica concreta utilizando herramientas open source como LeRobot, lo que facilita la replicación y adaptación en entornos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (no se especifican detalles internos) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un modelo de visión-lenguaje-acción desarrollado por Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. Aunque no se detalla la arquitectura interna exacta (número de capas, tipo de atención, etc.), se trata de un modelo que procesa simultáneamente observaciones visuales (tres cámaras a 480×640 píxeles) y estados del robot (vector de 12 dimensiones) para generar acciones de control (vector de 12 dimensiones).

El entrenamiento se realizó mediante ajuste fino del modelo base `lerobot/pi05_base` sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios y 96.339 frames a 30 FPS, con la tarea "pick up the upper piece of fabric and place it in the target square". La configuración de entrenamiento incluye 6.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, usando LeRobot versión 0.6.0.

## Capacidades

- Manipulación robótica de precisión: recoger y colocar objetos (tela) en ubicaciones específicas.
- Percepción multimodal: procesa simultáneamente tres flujos de vídeo (cámaras izquierda, derecha y superior) junto con el estado del robot.
- Control de acciones continuas: genera vectores de acción de 12 dimensiones para controlar un robot bi-manual tipo `bi_so_follower`.
- Generalización a tareas similares: al ser un ajuste fino de un modelo base generalista, puede adaptarse a otras tareas de pick-and-place con datos adicionales.
- Ejecución en tiempo real: diseñado para inferencia en bucle cerrado sobre un robot físico, con soporte en LeRobot para despliegue directo.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y visualización de Hugging Face.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo robótico para recoger piezas de tela o materiales flexibles y colocarlos en posiciones definidas, reduciendo la intervención manual en procesos de fabricación.
- Investigación en imitación learning: sirve como ejemplo de ajuste fino de un VLA base sobre una tarea específica, permitiendo a investigadores estudiar el comportamiento de π₀.₅ en entornos controlados.
- Prototipado rápido de tareas robóticas: gracias a LeRobot, se puede entrenar y desplegar en pocas horas una política para una nueva tarea de manipulación, partiendo de este modelo como referencia.
- Robótica asistencial: en entornos de cuidado o rehabilitación, podría adaptarse para tareas como doblar o colocar textiles, aunque requiere ajuste adicional.
- Educación y demostración: útil para enseñar conceptos de VLA, entrenamiento de políticas y despliegue en robots reales en cursos universitarios o talleres.
- Benchmarking de VLA: permite comparar el rendimiento de π₀.₅ ajustado frente a otros modelos en tareas estandarizadas de pick-and-place, aunque no hay resultados publicados aún.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143 millones de parámetros, en precisión fp16 se requieren aproximadamente 8,3 GB de VRAM solo para los pesos, más memoria para activaciones y procesamiento de imágenes. Se estima un mínimo de 12-16 GB de VRAM para una inferencia estable.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB), es adecuada. Para despliegue en tiempo real sobre robot, se recomienda una GPU de gama alta con baja latencia.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 pueden ejecutar el modelo en fp16, aunque la latencia dependerá del tamaño del batch y de la resolución de las cámaras.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la inferencia sobre el robot. También es posible exportar a otros formatos (por ejemplo, ONNX) para entornos de producción, aunque no está documentado.
- Latencia y throughput: no se dispone de datos oficiales. En un robot real, la inferencia debe completarse en menos de 33 ms (30 FPS) para mantener el ritmo de las cámaras, lo que requiere optimización y posiblemente cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `OrderDraconis/pi05_pickplace_leo_6k` | 4,14 B | Pick-and-place de tela | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | 4,14 B (estimado) | Generalista VLA | Apache 2.0 | Hugging Face |
| OpenVLA | 7 B | Manipulación generalista | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros y licencia. El modelo aquí descrito es un ajuste fino del base, por lo que su rendimiento en la tarea específica podría ser superior al del base sin ajuste, pero no hay evidencia publicada.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado únicamente para la tarea de recoger la pieza de tela superior y colocarla en un cuadrado objetivo. No generaliza a otras tareas sin un nuevo ajuste fino.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que su rendimiento efectivo es desconocido.
- Dependencia del hardware: requiere un robot específico (`bi_so_follower`) y tres cámaras con las mismas posiciones y calibración que las usadas en el entrenamiento. Cambios en la configuración pueden degradar el rendimiento.
- Riesgo de sobreajuste: con solo 122 episodios y 6.000 pasos, es probable que el modelo esté sobreajustado a las condiciones del dataset (iluminación, posiciones, tipo de tela).
- Sesgos del dataset: el dataset proviene de un único entorno y operador, lo que puede introducir sesgos en la forma de manipular los objetos.
- Sin soporte multilingüe ni procesamiento de lenguaje natural: al ser un modelo de acción, no genera texto ni entiende instrucciones en lenguaje natural más allá de la tarea fijada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrderDraconis/pi05_pickplace_leo_6k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Perfil del autor: https://huggingface.co/OrderDraconis
