# 1ys1/areumii-smolvla-pickplace-v8

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v8` es un fine-tune del modelo base `lerobot/smolvla_base`, un vision-language-action model (VLA) compacto y eficiente desarrollado por Hugging Face y descrito en el paper arXiv:2506.01844. Este modelo concreto ha sido entrenado por el usuario `1ys1` para controlar un robot de tipo `areumii_c1` en una tarea específica de pick-and-place: recoger un cubo rojo y colocarlo en una cesta azul. El modelo consume imágenes de tres cámaras (frontal, muñeca izquierda y muñeca derecha) junto con el estado del robot (6 dimensiones) y produce acciones de 16 dimensiones.

Con 450 millones de parámetros, este modelo está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para investigación y prototipado en robótica. El entrenamiento se realizó sobre un dataset propio de 100 episodios (10 157 frames a 20 FPS) con 20 000 pasos de optimización, utilizando la librería LeRobot. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Está diseñado para ser eficiente y desplegable en hardware de consumo, a diferencia de modelos VLA más grandes como OpenVLA (7B parámetros). El modelo base `lerobot/smolvla_base` fue preentrenado en una gran variedad de datos robóticos, y este fine-tune se realizó sobre el dataset `1ys1/areumii_pickplace-v7` con 100 episodios de la tarea de pick-and-place.

El entrenamiento se llevó a cabo con 20 000 pasos, batch size de 8, optimizador AdamW y learning rate de 0.0001, usando la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF ni DPO; se trata de un fine-tune estándar de imitación. La arquitectura exacta interna (número de capas, dimensiones, etc.) no está detallada en la información proporcionada, pero se sabe que el modelo base es SmolVLA, que emplea un transformer con atención eficiente para procesar las observaciones multimodales.

## Capacidades

- Control de robot para tareas de manipulación: el modelo genera acciones de 16 dimensiones a partir de observaciones de estado y tres cámaras RGB.
- Percepción multimodal: procesa simultáneamente imágenes de 256x256 píxeles de tres cámaras y un vector de estado de 6 dimensiones.
- Aprendizaje por imitación: entrenado para replicar la política demostrada en el dataset, específicamente la tarea de pick-and-place.
- Ejecución en tiempo real: diseñado para inferencia a 20 FPS, compatible con el flujo de trabajo de LeRobot.
- No soporta tool calling, agentes conversacionales ni generación de texto libre; es un modelo puramente de acción robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, como se demuestra en la tarea de entrenamiento.
- Prototipado de políticas robóticas en investigación: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para laboratorios que necesitan iterar rápidamente sobre nuevas tareas sin grandes recursos de cómputo.
- Robótica educativa: su tamaño compacto permite ejecutarlo en GPUs de consumo, facilitando su uso en cursos y talleres de robótica con aprendizaje automático.
- Evaluación de generalización en manipulación: se puede probar el modelo en variaciones de la tarea (cambios de posición, iluminación, etc.) para estudiar la robustez de las políticas VLA.
- Integración con LeRobot: al estar entrenado con esta librería, se puede desplegar directamente en robots compatibles usando los comandos `lerobot-rollout`, lo que simplifica la puesta en producción.
- Base para fine-tuning posterior: el modelo puede servir como punto de partida para adaptarlo a nuevas tareas de manipulación con datasets adicionales, gracias a su formato estándar de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 450 millones de parámetros, en FP32 el modelo ocuparía aproximadamente 1.8 GB, pero no se especifica la cuantización utilizada ni los requisitos reales de memoria.
- GPU recomendadas: SmolVLA está diseñado para hardware de consumo, por lo que GPUs como RTX 3060, RTX 4090 o similares deberían ser suficientes, aunque no hay datos concretos.
- Compatibilidad con consumer GPU: probablemente sí, dado el diseño del modelo base, pero no se confirma en la información.
- Opciones de despliegue: LeRobot (librería principal), con soporte para inferencia en tiempo real. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El modelo se entrenó a 20 FPS, lo que sugiere que la inferencia puede alcanzar esa frecuencia en hardware adecuado, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. SmolVLA se posiciona como una alternativa compacta a modelos VLA más grandes como OpenVLA (7B parámetros) o RT-2, pero no se ofrecen cifras concretas de rendimiento ni comparaciones directas. El modelo base `lerobot/smolvla_base` es el punto de referencia natural, y este fine-tune es una adaptación específica para una tarea concreta.

## Limitaciones y advertencias

- Dataset de entrenamiento limitado: solo 100 episodios de una única tarea, lo que puede limitar la generalización a variaciones no vistas.
- Sin evaluación publicada: no hay resultados de éxito en el robot real, por lo que el rendimiento real es desconocido.
- Tarea específica: el modelo está entrenado para "recoger el cubo rojo y colocarlo en la cesta azul"; no es un modelo general de manipulación.
- Dependencia de la configuración de cámaras: requiere exactamente tres cámaras con las mismas posiciones relativas que las usadas en el entrenamiento.
- Riesgo de sobreajuste: el pequeño tamaño del dataset y el alto número de pasos (20 000) pueden provocar sobreajuste a las demostraciones.
- Sin soporte de lenguaje: no es un modelo conversacional ni de generación de texto; solo produce acciones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el robot cumplen con los requisitos de LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1ys1/areumii-smolvla-pickplace-v8
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii_pickplace-v7
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
