# Kasra99/pi05_dex_warehouse_full

## Resumen

El modelo `Kasra99/pi05_dex_warehouse_full` es un fine-tuning completo (full fine-tune) del modelo fundacional robótico π₀.₅ (pi0.5), desarrollado por Kasra Sinaei (Kasra99) sobre el dataset `Kasra99/dex-warehouse`. Este dataset contiene demostraciones teleoperadas de tareas de pick-and-place en un almacén, ejecutadas con un manipulador móvil Dexmate Vega-1 Pro. El modelo resultante es un Vision-Language-Action (VLA) que combina un backbone de lenguaje y visión (VLM) con un codificador de visión SigLIP y un experto de acción, con 4.14 mil millones de parámetros entrenables. Está diseñado para controlar un robot de 20 grados de libertad (DoF) en tareas de manipulación móvil, integrando movimiento de brazos, mano derecha y base.

Este checkpoint se publica bajo licencia Apache-2.0 y se distribuye a través de Hugging Face con la librería LeRobot. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo VLA de última generación para una tarea específica de robótica, demostrando cómo adaptar un modelo generalista a un dominio concreto con datos teleoperados. El entrenamiento se realizó durante aproximadamente 32 horas en una GPU RTX PRO 6000 Blackwell, con 30.000 pasos y un tamaño de lote de 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM backbone + SigLIP vision encoder + action expert (π₀.₅) |
| Parametros totales | 4.14 B (entrenables en este fine-tune) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se carga mediante LeRobot, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅, un modelo visión-lenguaje-acción (VLA) que co-entrena con datos diversos (demostraciones robóticas, datos web, subtareas semánticas) para lograr generalización open-world en manipulación robótica de largo horizonte. En este fine-tuning, se ajustan todos los parámetros del modelo base `lerobot/pi05_base` (backbone, codificador de visión y experto de acción) sobre el dataset `Kasra99/dex-warehouse`, que contiene 177 episodios de pick-and-place teleoperado. El espacio de acción es de 20 DoF, incluyendo articulaciones de brazos izquierdo y derecho, mano derecha (apertura y oposición del pulgar) y velocidades de la base móvil. Se eliminaron dos dimensiones de la mano izquierda del dataset original porque no se actuaban en la práctica y causaban problemas de normalización en la pérdida de flow-matching.

El entrenamiento se realizó con precisión mixta (fp32 para pesos maestros, bf16 para autocast), un tamaño de lote de 32, 30.000 pasos (aproximadamente 4.4 épocas), una tasa de aprendizaje máxima de 2.5e-5 con decaimiento coseno hasta 2.5e-6 y 1.000 pasos de calentamiento. Se utilizó un tamaño de chunk de 50 (equivalente a 1.67 segundos a 30 fps) y una media móvil exponencial (EMA) con decaimiento 0.99, siguiendo el estilo de OpenPI. Los checkpoints se guardan por paso, siendo los pesos EMA los recomendados para inferencia.

## Capacidades

- Control de un manipulador móvil de 20 DoF para tareas de pick-and-place en entornos de almacén.
- Integración de tres cámaras RGB (cabeza, muñeca izquierda y muñeca derecha) para percepción visual.
- Comandos de movimiento de base móvil (velocidades lineales y angulares) en aproximadamente el 34% de los frames.
- Manipulación con el brazo derecho y la mano derecha (apertura y oposición del pulgar).
- Generación de secuencias de acciones (chunks de 50 pasos) para control predictivo.
- Capacidad de ser cargado y utilizado mediante la API de LeRobot (`PI05Policy.from_pretrained`).
- Fine-tuning específico para tareas de almacén, con generalización limitada a otros dominios.

## Casos de uso

- Automatización de almacenes: el modelo puede controlar un robot móvil para recoger y colocar objetos en estanterías, reduciendo la intervención humana en tareas repetitivas de logística.
- Pruebas de concepto en robótica de manipulación: investigadores pueden utilizar este checkpoint como punto de partida para evaluar el rendimiento de π₀.₅ en tareas específicas de pick-and-place con una base móvil.
- Desarrollo de sistemas de control basados en VLA: integración en pipelines de LeRobot para experimentar con diferentes estrategias de control (por ejemplo, usando los pesos EMA para inferencia estable).
- Entrenamiento de modelos especializados: el checkpoint puede servir como base para fine-tunings adicionales en tareas similares de manipulación móvil, aprovechando el conocimiento previo del modelo.
- Simulación y validación de algoritmos de robótica: uso en entornos simulados para probar políticas de control antes de desplegarlas en robots físicos.
- Investigación sobre generalización en VLA: análisis de cómo un modelo generalista se adapta a un dominio concreto con datos limitados (177 episodios) y qué limitaciones surgen (por ejemplo, la baja reproducibilidad del brazo izquierdo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de éxito en tareas, solo análisis estadísticos de los datos de entrenamiento (por ejemplo, reproducibilidad del brazo izquierdo vs derecho). No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU NVIDIA RTX PRO 6000 Blackwell (no se especifica VRAM, pero es una GPU profesional de gama alta, típicamente con 96 GB).
- Para inferencia, no se especifican requisitos de VRAM. Dado que el modelo tiene 4.14 B parámetros, se estima que requiere al menos 8-10 GB de VRAM en precisión fp16, pero no hay datos confirmados.
- Se recomienda una GPU con al menos 16 GB de VRAM para inferencia en tiempo real con LeRobot, aunque no se ha verificado.
- Opciones de despliegue: LeRobot (Python), posiblemente vLLM o TGI si se adapta, pero no se menciona. El modelo está diseñado para usarse con la librería LeRobot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. El modelo es un fine-tuning de π₀.₅, que a su vez es un modelo VLA de la familia Physical Intelligence. Otros modelos VLA similares incluyen OpenVLA (7B) y RT-2 (Google), pero no se han publicado comparaciones con este checkpoint específico. La comparación cualitativa indicaría que π₀.₅ es más reciente y está diseñado para manipulación diestra, pero sin métricas no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está especializado en manipulación con el brazo derecho sobre una base móvil; no es bimanual. El brazo izquierdo tiene una reproducibilidad mucho menor (R² 0.087 vs 0.226 del derecho) y su mano nunca se actúa, lo que sugiere que no producirá movimientos intencionados.
- Dos de las 22 tareas del dataset tienen solo un episodio y fueron excluidas del split de evaluación (5% por tarea), por lo que el modelo no ha visto datos de entrenamiento para esas tareas.
- El modelo puede presentar alucinaciones o comportamientos erráticos si se usa fuera del dominio de almacén o con configuraciones de cámara diferentes a las utilizadas en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `lerobot/pi05_base` y del dataset `Kasra99/dex-warehouse`.
- No se proporcionan garantías de rendimiento en entornos reales; se requiere validación adicional antes de su despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kasra99/pi05_dex_warehouse_full
- Dataset: https://huggingface.co/datasets/Kasra99/dex-warehouse
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Port de pi05 en LeRobot (cijerezg): https://github.com/cijerezg/lerobot/tree/main/src/lerobot/policies/pi05_full
- Código de fine-tuning e inferencia (Integer003/openpi05): https://github.com/Integer003/openpi05
- Perfil del autor: https://huggingface.co/Kasra99
