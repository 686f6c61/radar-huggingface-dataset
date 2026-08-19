# AndyZ2001/lekiwi-box-smolvla

## Resumen

El modelo `AndyZ2001/lekiwi-box-smolvla` es un ajuste fino (fine-tune) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente diseñado para robótica, desarrollado por AndyZ2001 sobre la base `lerobot/smolvla_base`. SmolVLA, descrito en el artículo arXiv 2506.01844, busca ofrecer un rendimiento competitivo en tareas de manipulación robótica con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este modelo concreto está especializado en una tarea de manipulación móvil: desplazarse hasta una caja, recogerla y depositarla en una cesta, utilizando el robot LeKiwi, un manipulador móvil de bajo coste.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, el modelo se distribuye en formato safetensors y se integra con el ecosistema LeRobot, lo que facilita su uso tanto para inferencia como para entrenamiento de nuevas políticas. Su relevancia radica en demostrar que los VLA pueden ejecutarse en plataformas robóticas asequibles, abriendo la puerta a aplicaciones de investigación y desarrollo en entornos con recursos limitados. El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo de visión-lenguaje-acción basado en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantización declarada) |
| Idiomas soportados | No aplica (modelo de acción robótica, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina codificadores visuales y un transformador para mapear observaciones (imágenes y estado del robot) directamente a acciones. En este caso, el modelo procesa cuatro entradas visuales: tres cámaras de 256x256 píxeles (frontal, muñeca y una tercera) y una cámara adicional de 480x640, junto con un vector de estado de 6 dimensiones. La salida es un vector de acción de 9 dimensiones, que probablemente incluye la pose del efector final, el estado de la pinza y el movimiento de la base móvil.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sobre el dataset `AndyZ2001/lekiwi-box`, que contiene 50 episodios y 38.398 fotogramas a 30 FPS, capturados con el robot LeKiwi. La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 2, optimizador AdamW con tasa de aprendizaje 0,0001 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se especifica si se emplearon técnicas adicionales como RLHF o DPO, ni detalles sobre la composición exacta del dataset más allá de la tarea descrita.

## Capacidades

- Percepción visual multi-cámara: procesa simultáneamente tres imágenes de 256x256 y una de 480x640, lo que permite al robot localizar objetos y su propio estado.
- Control de acciones de 9 dimensiones: genera comandos de movimiento para la base móvil, el brazo y la pinza del robot LeKiwi.
- Aprendizaje por imitación: la política ha sido entrenada para replicar demostraciones humanas de la tarea de pick and place.
- Ejecución de tareas de manipulación móvil: específicamente, desplazarse a una caja, recogerla y depositarla en una cesta.
- Integración con LeRobot: compatible con el flujo de trabajo estándar de LeRobot para inferencia (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- No incluye capacidades de generación de texto, chat, tool calling ni razonamiento simbólico; es un modelo puramente orientado a acción robótica.

## Casos de uso

- Automatización de tareas de pick and place en entornos de investigación: el modelo puede ejecutar la tarea de recoger una caja y colocarla en una cesta de forma autónoma, sirviendo como base para estudiar estrategias de manipulación móvil.
- Desarrollo de robots de bajo coste: al ser un VLA compacto que cabe en hardware de consumo, es adecuado para prototipos y plataformas educativas basadas en LeKiwi.
- Aprendizaje por imitación en robótica: investigadores pueden usar este modelo como punto de partida para fine-tune en nuevas tareas, aprovechando el pipeline de LeRobot.
- Evaluación de políticas en entornos controlados: permite probar la robustez de un VLA ante variaciones de iluminación, posición de objetos o distracciones, aunque no se han publicado resultados formales.
- Educación en robótica y aprendizaje automático: sirve como ejemplo práctico de entrenamiento y despliegue de un modelo de visión-lenguaje-acción en un robot real.
- Investigación en generalización de VLA: al estar entrenado con solo 50 episodios, es un caso de estudio sobre los límites de la generalización con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene 450 millones de parámetros y un tamaño de 0,9 GB en safetensors, se estima que en precisión fp16 ocuparía aproximadamente 0,9 GB de VRAM, y en fp32 unos 1,8 GB. Esto sugiere que cabría en GPUs consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque no hay confirmación oficial.
- GPU recomendadas: no se especifican. Por el tamaño, una RTX 3060 o superior sería suficiente para inferencia en tiempo real.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de SmolVLA (despliegue en hardware de consumo), pero no hay datos concretos de latencia o throughput.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, usando el comando `lerobot-rollout` con el robot LeKiwi. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros fine-tunes de SmolVLA para el robot LeKiwi, como `bigbangoslab/smolvla_lekiwi_pick_and_place_box`, que también aborda una tarea de pick and place. Sin embargo, no se dispone de especificaciones detalladas de ese modelo (parámetros, configuración de entrenamiento, resultados) en la información proporcionada. El modelo base `lerobot/smolvla_base` es el punto de partida común, pero no se conocen sus métricas de rendimiento en esta tarea específica. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| AndyZ2001/lekiwi-box-smolvla | 450M | No disponible | Pick and place de caja en cesta (LeKiwi) | Apache-2.0 |
| bigbangoslab/smolvla_lekiwi_pick_and_place_box | No disponible | No disponible | Pick and place (LeKiwi) | No disponible |
| lerobot/smolvla_base | No disponible | No disponible | Base general para fine-tune | Apache-2.0 |

## Limitaciones y advertencias

- Entrenamiento con datos limitados: solo 50 episodios, lo que puede provocar una baja generalización ante variaciones en la posición de los objetos, iluminación o condiciones del entorno no vistas durante el entrenamiento.
- Tarea específica: el modelo está especializado en una única tarea (mover a la caja, recogerla y ponerla en la cesta). No es adecuado para otras tareas de manipulación sin un nuevo fine-tune.
- Sin evaluación reportada: no hay resultados de tasa de éxito en el robot real, por lo que se desconoce su rendimiento efectivo en producción.
- Dependencia del hardware: requiere el robot LeKiwi y las cámaras específicas utilizadas durante el entrenamiento. Cambios en la configuración de sensores o en la cinemática del robot pueden degradar el rendimiento.
- Error tipográfico en la descripción de la tarea: la model card menciona "brasket" en lugar de "basket", lo que puede indicar falta de revisión en la documentación.
- Riesgo de alucinación: al ser un modelo de acción, no genera texto, pero podría producir acciones no deseadas si las observaciones difieren mucho de las de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo está vinculado a un robot concreto, lo que limita su reutilización directa en otras plataformas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AndyZ2001/lekiwi-box-smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/AndyZ2001/lekiwi-box
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio de LeKiwi: https://github.com/SIGRobotics-UIUC/LeKiwi
- Guía de entrenamiento de SmolVLA en LeKiwi: https://www.ay-robots.com/train/smolvla-on-lekiwi
- Modelo similar (bigbangoslab): https://huggingface.co/bigbangoslab/smolvla_lekiwi_pick_and_place_box
