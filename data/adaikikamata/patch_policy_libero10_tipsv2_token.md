# aDaikiKamata/patch_policy_libero10_tipsv2_token

## Resumen

El modelo `patch_policy_libero10_tipsv2_token` es una política de control robótico entrenada con el framework LeRobot de HuggingFace. Desarrollado por el usuario aDaikiKamata, este modelo implementa una arquitectura de tipo `patch_policy` para resolver tareas de manipulación con un brazo robótico Panda, utilizando dos cámaras (una frontal y otra en la muñeca) y el estado del robot como entradas. El modelo genera acciones de 7 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.

El modelo ha sido entrenado sobre el dataset `lerobot/libero_10_image`, que contiene 379 episodios y más de 100.000 frames correspondientes a 10 tareas de manipulación en un entorno simulado. Con 211,9 millones de parámetros, esta política es relativamente compacta y está diseñada para ejecutarse en tiempo real sobre hardware robótico. Su relevancia radica en que demuestra el uso de arquitecturas basadas en parches (patch-based) para el aprendizaje por imitación en robótica, un enfoque que permite procesar eficientemente imágenes de alta resolución y estados del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | patch_policy (basada en parches, implementada en LeRobot) |
| Parametros totales | 211.886.599 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura `patch_policy` es una variante de los modelos de política para robótica que procesan las imágenes de entrada dividiéndolas en parches (patches), similar a los Vision Transformers (ViT), pero adaptada para generar acciones continuas. El modelo consume dos imágenes de 256x256 píxeles (cámara frontal y cámara de muñeca) y un vector de estado de 8 dimensiones (posición y orientación del efector, más posiblemente velocidad o fuerza). La salida es un vector de acción de 7 dimensiones que controla el movimiento del brazo Panda.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `lerobot/libero_10_image`, que contiene 379 episodios y 101.469 frames a 10 FPS. Se utilizaron 10.000 pasos de entrenamiento con un batch size de 128, optimizador AdamW y una tasa de aprendizaje de 5e-05, con semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado (behavior cloning). No se dispone de información sobre innovaciones técnicas específicas más allá de la propia arquitectura de parches.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 grados de libertad para un brazo Panda, incluyendo posición y orientación del efector final.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen (cámara frontal y cámara de muñeca) a resolución 256x256.
- Integración de estado: combina información visual con el estado propioceptivo del robot (8 dimensiones).
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset, incluyendo tareas como colocar objetos, abrir microondas, encender fogones, etc.
- Ejecución en tiempo real: diseñado para inferencia continua a 10 FPS, compatible con el pipeline de LeRobot.
- No soporta tool calling, agentes conversacionales, ni capacidades de lenguaje natural.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede colocar objetos específicos en posiciones determinadas, como se demuestra en las tareas de "poner la taza blanca en el plato" o "poner ambos objetos en la cesta". Es adecuado porque su arquitectura de parches procesa eficientemente las imágenes y genera acciones precisas.
- Manipulación de electrodomésticos simulados: tareas como "abrir el microondas y cerrarlo" o "encender la fogona y poner la moka pot" requieren interacciones de contacto y secuencias de varios pasos. El modelo ha sido entrenado específicamente en estas tareas, por lo que puede reproducirlas con alta fidelidad.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de la arquitectura patch-based en la generalización de políticas robóticas. Los investigadores pueden comparar su rendimiento con otras arquitecturas (ACT, Diffusion Policy) sobre el mismo benchmark LIBERO.
- Desarrollo de sistemas de control robótico con LeRobot: el modelo puede integrarse en el ecosistema LeRobot para pruebas en robots Panda reales o simulados, permitiendo validar el flujo completo de entrenamiento e inferencia.
- Benchmarking de políticas robóticas: al estar entrenado en el dataset LIBERO-10, puede utilizarse como referencia para evaluar nuevas arquitecturas o técnicas de aumento de datos en tareas de manipulación.
- Prototipado rápido de soluciones robóticas: dado su tamaño moderado (211M parámetros) y su compatibilidad con LeRobot, puede desplegarse en estaciones de trabajo con GPU para experimentar con control robótico sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito por tarea, ni comparaciones con otras políticas en el dataset LIBERO.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 211,9 millones de parámetros y entradas de imagen de 256x256, se estima que la inferencia requiere entre 4 y 8 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se ofrecen versiones cuantizadas).
- GPU recomendadas: una GPU consumer como RTX 3060 (12 GB) o superior sería suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda al menos una RTX 3090 o A5000.
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama media.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia mediante el comando `lerobot-rollout`. También puede integrarse en pipelines personalizados de PyTorch.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la resolución de entrada, se espera una inferencia por debajo de 100 ms en una GPU moderna, cumpliendo con el requisito de 10 FPS del dataset.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas entrenadas en LIBERO-10 con arquitectura patch-based). Existen otras arquitecturas como ACT (Action Chunking with Transformers) o Diffusion Policy, pero no se han encontrado datos de comparación directa con este modelo en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay métricas de éxito en tareas reales o simuladas, por lo que su rendimiento efectivo es desconocido.
- Entrenado en simulación: el dataset LIBERO-10 es un entorno simulado (probablemente robosuite o similar). La transferencia a robots físicos puede requerir ajustes adicionales (sim-to-real gap).
- Tareas limitadas: solo cubre las 10 tareas específicas del dataset; no generaliza a tareas no vistas.
- Dependencia de cámaras: requiere dos cámaras calibradas (frontal y muñeca) con las mismas características que las usadas en el entrenamiento.
- Sin soporte de lenguaje: no puede interpretar instrucciones en lenguaje natural; las tareas están fijadas en el dataset.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin resultados de validación.
- Riesgo de sobreajuste: con solo 10.000 pasos de entrenamiento y un dataset relativamente pequeño, podría presentar sobreajuste a las condiciones específicas del dataset.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aDaikiKamata/patch_policy_libero10_tipsv2_token
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset LIBERO-10: https://huggingface.co/datasets/lerobot/libero_10_image
- Repositorio GitHub de LeRobot: https://github.com/huggingface/lerobot
