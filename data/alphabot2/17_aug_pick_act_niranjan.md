# alphabot2/17_Aug_Pick_ACT_Niranjan

## Resumen

El modelo `alphabot2/17_Aug_Pick_ACT_Niranjan` es una política robótica basada en la arquitectura ACT (Action Chunking with Transformers), entrenada mediante aprendizaje por imitación con el framework LeRobot. Desarrollado por el usuario alphabot2, el modelo está especializado en la tarea de recogida (pick) de objetos, utilizando el dataset `alphabot2/17_Aug_Niranjan_Pick`. Su relevancia radica en su tamaño compacto (51,6 millones de parámetros) y su integración nativa con el ecosistema LeRobot, lo que permite desplegarlo en robots de bajo coste como el SO-100 para experimentación y automatización de tareas de manipulación.

La arquitectura ACT aborda el problema del error compuesto en el control robótico prediciendo secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad del movimiento. Al estar entrenado con datos teleoperados, este modelo demuestra cómo un enfoque de transformer puede resolver tareas de manipulación específicas con una cantidad reducida de parámetros, siendo un punto de partida accesible para investigadores y desarrolladores que trabajan con LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer encoder-decoder para políticas visuomotoras |
| Parametros totales | 51.637.904 |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (procesa observaciones visuales; el tamaño del chunk de acción no se especifica en la ficha) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, formato estándar de LeRobot) |
| Idiomas soportados | No disponible (no aplica, es un modelo de visión-acción para robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. Se trata de un transformer encoder-decoder que, en lugar de predecir una única acción por paso de control, genera un chunk de acciones futuras. Esta técnica de "action chunking" reduce el error de acumulación típico de las políticas autoregresivas en robótica, permitiendo trayectorias más suaves y robustas.

El entrenamiento se realizó mediante aprendizaje por imitación (imitation learning) utilizando el framework LeRobot, sobre el dataset `alphabot2/17_Aug_Niranjan_Pick`, que contiene demostraciones teleoperadas de la tarea de recogida. No se especifican detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas de refinamiento como RLHF o DPO, ya que no son aplicables a este tipo de políticas visuomotoras en la información proporcionada.

## Capacidades

- Control robótico visuomotor: el modelo procesa observaciones visuales y genera comandos de acción para el robot.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acción: genera secuencias de acciones para movimientos fluidos y estables.
- Integración con LeRobot: compatible con el ecosistema LeRobot, incluyendo el robot SO-100 follower.
- Ejecución en tiempo real: al ser un modelo pequeño (51,6M de parámetros), es adecuado para inferencia de baja latencia.
- No dispone de capacidades de lenguaje natural, tool calling, visión general ni razonamiento multimodal fuera del ámbito robótico.

## Casos de uso

- Automatización de pick-and-place: el modelo puede controlar un brazo robótico para recoger objetos de una posición específica y colocarlos en otra, ideal para líneas de ensamblaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar nuevas arquitecturas o técnicas de entrenamiento en el framework LeRobot.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden clonar el repositorio, cargar el modelo y evaluarlo en un robot SO-100 en minutos, gracias a la integración con LeRobot.
- Automatización de tareas repetitivas en laboratorio: útil para manipulación de muestras o reactivos en entornos controlados donde la teleoperación inicial es factible.
- Benchmarking de hardware robótico: permite evaluar el rendimiento de GPUs de consumo o embebidas (como Jetson) ejecutando una política real de control.
- Educación y formación: adecuado para cursos de robótica donde se enseñan conceptos de transformers aplicados a control, ya que el modelo es pequeño y fácil de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que este modelo no está orientado a tareas de lenguaje o razonamiento general, sino a control robótico. Tampoco se proporcionan tasas de éxito en la tarea de pick en la ficha del modelo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,6 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM. El entrenamiento cabe en GPUs de consumo con 6-8 GB de VRAM (ej. RTX 3060, RTX 2070).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. Para entrenamiento rápido se recomienda una RTX 4090 o A100, aunque no es imprescindible.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo (RTX 3060, RTX 4090, etc.) e incluso en hardware embebido como NVIDIA Jetson.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, usando PyTorch. No es aplicable a vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no se proporcionan datos exactos, pero debido al tamaño reducido, la inferencia es prácticamente en tiempo real (estimación típica de <10 ms por paso en una GPU moderna).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphabot2/17_Aug_Pick_ACT_Niranjan | ACT (Transformer) | 51,6M | No disponible (visual) | Apache-2.0 | Hub de HuggingFace |
| Diffusion Policy (LeRobot) | Denoising Diffusion | Variable (típicamente >100M) | No disponible (visual) | Apache-2.0 | Hub de HuggingFace |
| Modelos VLA (Vision-Language-Action) | Transformer multimodal | >7B | Largo (texto + imagen) | Varía (suele ser propietaria) | Varía |

Nota: No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se basa en características arquitectónicas generales.

## Limitaciones y advertencias

- Específico de la tarea: el modelo está entrenado únicamente para la tarea de "pick" del dataset `17_Aug_Niranjan_Pick`. No generaliza a otras tareas sin un reentrenamiento completo.
- Dependencia de la teleoperación: la calidad del comportamiento depende directamente de la calidad de las demostraciones teleoperadas utilizadas durante el entrenamiento.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural, por lo que no puede usarse para control por voz o comandos textuales.
- Riesgo de sobreajuste: al ser un modelo pequeño entrenado en un dataset específico, existe un alto riesgo de sobreajuste a las condiciones del entorno de entrenamiento (iluminación, posición de cámara, etc.).
- Información incompleta: no se especifican hiperparámetros clave como el tamaño del chunk de acción, la resolución de imagen o el número de épocas de entrenamiento, lo que limita la reproducibilidad exacta.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset y las condiciones de los datos teleoperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alphabot2/17_Aug_Pick_ACT_Niranjan
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
