# adhjlm/smolvla_pen_v2v3v4

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, adaptado específicamente para la tarea de recoger un bolígrafo y colocarlo en una posición objetivo sobre un robot SO-101. El autor, adhjlm, ha entrenado esta variante sobre el dataset propio `so101_pen_pick_place_v2v3v4` utilizando la librería LeRobot, con el objetivo de demostrar cómo un modelo base de robótica puede especializarse en una tarea concreta mediante aprendizaje por imitación.

La relevancia de este modelo radica en que SmolVLA está diseñado para ejecutarse en hardware de consumo, a diferencia de otros VLA masivos como OpenVLA o RT-2. Con solo 450 millones de parámetros, ofrece una alternativa eficiente para investigación y prototipado en robótica, manteniendo la capacidad de procesar entradas visuales de dos cámaras y generar acciones de control de seis grados de libertad. Este fine-tuning concreto no incluye resultados de evaluación publicados, por lo que su rendimiento real en el robot no está documentado.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y está pensado para ser usado dentro del ecosistema LeRobot, tanto para inferencia como para continuar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La arquitectura concreta del base `lerobot/smolvla_base` se describe en el paper arXiv 2506.01844, donde se detalla un diseño compacto y eficiente orientado a reducir costes computacionales. Este fine-tuning conserva la misma arquitectura, pero ajusta los pesos para la tarea específica de pick and place de un bolígrafo.

El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el dataset `adhjlm/so101_pen_pick_place_v2v3v4`, que contiene 108 episodios y 64.800 fotogramas a 30 FPS, con dos cámaras (frontal y de muñeca). La configuración de entrenamiento incluye 10.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. No se menciona el uso de técnicas de RLHF o DPO; se trata de un aprendizaje por imitación supervisado estándar.

El modelo consume como entrada el estado del robot (vector de 6 dimensiones) y dos imágenes de 480x640 píxeles, y produce una acción de 6 dimensiones. No se documentan innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Ejecución de la tarea específica de recoger un bolígrafo y colocarlo en una posición objetivo, sobre un robot SO-101.
- Procesamiento de dos flujos visuales simultáneos (cámara frontal y de muñeca) junto con el estado del robot.
- Generación de acciones de control de 6 grados de libertad en tiempo real (30 FPS).
- Integración nativa con el ecosistema LeRobot para inferencia y entrenamiento.
- No soporta tool calling, razonamiento multi-paso, ni capacidades de lenguaje general fuera del contexto robótico.
- No incluye modo de pensamiento ni capacidades multimodales adicionales más allá de visión y estado.

## Casos de uso

- Automatización de tareas repetitivas de recogida y colocación en laboratorios: el modelo puede gestionar la manipulación de objetos pequeños como bolígrafos en entornos controlados, reduciendo la intervención manual.
- Prototipado rápido de políticas robóticas con aprendizaje por imitación: gracias a su pequeño tamaño, se puede entrenar y evaluar en una GPU de consumo en pocas horas, ideal para iterar sobre nuevas tareas.
- Investigación en VLA compactos para robótica de bajo coste: sirve como referencia para estudiar el equilibrio entre tamaño de modelo y rendimiento en tareas de manipulación fina.
- Demostraciones educativas de robótica: permite mostrar a estudiantes el flujo completo de recopilación de datos, entrenamiento y despliegue de una política robótica con hardware asequible.
- Integración en sistemas de control de robots SO-101: puede desplegarse directamente con el comando `lerobot-rollout` para controlar el robot en tiempo real.
- Evaluación de generalización en tareas de manipulación: al ser un fine-tuning específico, permite comparar el rendimiento frente al modelo base y analizar el efecto de la especialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parámetros, los pesos en FP32 ocupan aproximadamente 1,8 GB, y en FP16 unos 0,9 GB. El tamaño del repositorio (1,2 GB) sugiere que los pesos están almacenados en FP32 o BF16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060, RTX 4060 o equivalente, es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más.
- Es viable en hardware de consumo: sí, este es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: principalmente mediante LeRobot, usando `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se mencionan otras herramientas como vLLM u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo compacto, se espera que pueda operar a 30 FPS en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adhjlm/smolvla_pen_v2v3v4 | 450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 | 55B | no disponible | propietaria | no publico |

Este fine-tuning se diferencia del base `smolvla_base` por estar especializado en una tarea concreta, mientras que OpenVLA y RT-2 son modelos mucho más grandes y generalistas, con mayores requisitos de hardware. No se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea de recoger y colocar un bolígrafo; no generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- El dataset contiene solo 108 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición o textura.
- No hay resultados de evaluación publicados, por lo que el rendimiento real en el robot es desconocido.
- Depende del robot SO-101 y de la configuración exacta de cámaras utilizada durante el entrenamiento; cambios en el hardware pueden degradar el rendimiento.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje natural conversacional ni de razonamiento general.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los componentes base (SmolVLA) también cumplen con sus requisitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adhjlm/smolvla_pen_v2v3v4
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Dataset de entrenamiento: https://huggingface.co/datasets/adhjlm/so101_pen_pick_place_v2v3v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
