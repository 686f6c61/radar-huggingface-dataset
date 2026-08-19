# shen762/train-test

## Resumen

`shen762/train-test` es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario `shen762` como un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, publicado en el ecosistema LeRobot de Hugging Face. SmolVLA es una arquitectura compacta y eficiente diseñada para robótica, que permite ejecutar políticas de control en hardware de consumo, a diferencia de modelos VLA más grandes como OpenVLA o RT-2. Este modelo concreto está entrenado para una tarea específica de manipulación: recoger un enchufe blanco y colocarlo en una caja de cartón, utilizando un robot tipo `so_follower` con dos cámaras (muñeca y superior).

El modelo tiene 450 millones de parámetros (450.046.176 exactamente) y se distribuye en formato `safetensors` con licencia Apache 2.0. Es un ejemplo de aplicación práctica de SmolVLA para imitación en robótica, entrenado con 58 episodios y 15.751 fotogramas a 30 FPS. Su relevancia radica en demostrar que es posible entrenar y desplegar políticas robóticas con un presupuesto computacional reducido, sin sacrificar capacidades esenciales de percepción y control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acción. Está diseñado para ser compacto y eficiente, permitiendo inferencia en hardware de consumo (por ejemplo, GPUs de gama media). El modelo base `lerobot/smolvla_base` fue preentrenado en tareas de manipulación y luego ajustado aquí con el dataset `shen762/record-test` mediante aprendizaje por imitación (behavior cloning) usando la librería LeRobot.

El entrenamiento se realizó con 6.000 pasos, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 0,0001, con semilla 1000. El dataset contiene 58 episodios de una tarea concreta, grabados a 30 FPS, con observaciones de estado (6 dimensiones) y tres cámaras (dos activas y una vacía). No se menciona el uso de RLHF o DPO; el enfoque es puramente imitativo. La arquitectura exacta (número de capas, dimensiones ocultas, tipo de atención) no se detalla en la información disponible, pero se referencia el paper de SmolVLA (arXiv:2506.01844).

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (posición y orientación del efector) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa imágenes de 256x256 píxeles de hasta tres cámaras simultáneamente.
- Aprendizaje por imitación: reproduce la tarea demostrada en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, generación de texto libre ni razonamiento multi-step fuera del contexto robótico.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo puede controlar un brazo robótico para recoger objetos específicos (en este caso, un enchufe blanco) y colocarlos en una ubicación determinada (una caja de cartón). Es adecuado para entornos de fabricación donde la tarea es repetitiva y bien definida.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar cómo los modelos VLA compactos se comportan en tareas reales con pocos datos de entrenamiento (58 episodios).
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y compatibilidad con LeRobot, permite iterar rápidamente en entornos de laboratorio sin necesidad de infraestructura de alto rendimiento.
- Educación y demostraciones: puede usarse en cursos de robótica o IA para ilustrar el flujo completo de grabación de datos, entrenamiento y despliegue de una política robótica.
- Control de robots de bajo coste: al ser un modelo pequeño, es viable ejecutarlo en GPUs de consumo (por ejemplo, RTX 3060 o superiores), lo que lo hace accesible para makers y pequeñas empresas.
- Benchmark de generalización: al estar entrenado en una única tarea, puede utilizarse para evaluar la capacidad de generalización del modelo base ante variaciones de iluminación, posición de objetos o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión de acción o comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 450 millones de parámetros. En precisión FP32, el peso ocupa aproximadamente 1,8 GB (tamaño del repositorio), lo que sugiere que puede cargarse en GPUs con al menos 4 GB de VRAM, aunque no se especifica la memoria exacta necesaria para inferencia.
- No se dispone de datos oficiales sobre VRAM mínima, latencia o throughput. Como estimación razonable, una GPU consumer como una RTX 3060 (12 GB) o superior debería ser suficiente para ejecutar la política en tiempo real, dado que SmolVLA está diseñado para hardware de consumo.
- El despliegue se realiza mediante el ecosistema LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente CPU, aunque no se detalla. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- El requisito principal es el robot físico `so_follower` y las cámaras configuradas, no solo la GPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA en la documentación proporcionada. Sin embargo, a nivel general, SmolVLA (450M parámetros) es significativamente más compacto que alternativas como OpenVLA (7B parámetros) o RT-2 (55B parámetros), lo que implica menor coste de inferencia y mayor accesibilidad, aunque posiblemente menor rendimiento en tareas complejas. No se pueden dar cifras concretas de rendimiento relativo sin datos de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| shen762/train-test (SmolVLA fine-tune) | 450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M (estimado) | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (referencia) | 7B | no disponible | MIT | Hugging Face |

Nota: la comparación con OpenVLA se basa en conocimiento general, no en datos de este repositorio.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea específica ("recoger el enchufe blanco y colocarlo en la caja de cartón"). No generalizará a otras tareas u objetos sin un nuevo ajuste fino.
- El dataset de entrenamiento es pequeño (58 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones del entorno (iluminación, posición de objetos, distracciones).
- No hay resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito real en condiciones de producción.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje natural ni de razonamiento general; no debe usarse como chatbot o generador de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del robot `so_follower` y de la configuración de cámaras específica; su reutilización en otros robots requerirá adaptación.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de un único entorno, puede presentar sesgos de percepción (por ejemplo, dificultad con objetos de colores similares al fondo).

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/shen762/train-test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/shen762/record-test
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
