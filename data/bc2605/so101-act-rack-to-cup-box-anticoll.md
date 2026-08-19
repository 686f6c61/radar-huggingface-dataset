# BC2605/so101-act-rack-to-cup-box-anticoll

## Resumen

El modelo `BC2605/so101-act-rack-to-cup-box-anticoll` es una política de imitación basada en Action Chunking with Transformers (ACT), desarrollada por BC2605 y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenada con el framework LeRobot para controlar un brazo robótico SO-101 en una tarea de manipulación tipo rack-to-cup: recoger un objeto de una estantería y colocarlo en una caja o copa evitando colisiones. El modelo se ha entrenado sobre el dataset teleoperado `BC2605/rack-to-cup-3-grids-box-anticoll`.

ACT es una arquitectura de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la precisión en tareas de manipulación reales. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra cómo un enfoque de código abierto y reproducible permite entrenar políticas robóticas específicas para tareas de pick-and-place con anti-colisión, accesible para laboratorios y desarrolladores sin infraestructura de alto coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ACT, presentada en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arxiv:2304.13705). ACT combina un codificador de visión (ResNet) con un transformer que predice una secuencia de acciones futuras (action chunks) en lugar de un solo paso. Esto reduce el error acumulado en tareas de manipulación y mejora la tasa de éxito en comparación con políticas que predicen acciones de forma autoregresiva.

El entrenamiento se realizó con LeRobot, una librería de Hugging Face para aprendizaje por imitación en robótica. El dataset `BC2605/rack-to-cup-3-grids-box-anticoll` contiene demostraciones teleoperadas del brazo SO-100 realizando la tarea rack-to-cup con tres configuraciones de rejilla y estrategias anticolisión. No se han publicado detalles sobre el número exacto de episodios ni el proceso de optimización (RLHF, DPO, etc.). La política se entrena con el objetivo de imitación estándar de ACT, que combina pérdidas de regresión y de clasificación sobre las acciones predichas.

## Capacidades

- Control robótico de bajo nivel: genera comandos de posición y velocidad para los motores del brazo SO-100.
- Aprendizaje de tareas de manipulación: especializado en pick-and-place entre una estantería y una taza/caja, con tres configuraciones de rejilla.
- Anti-colisiones: entrenado para evitar colisiones en la trayectoria, lo que mejora la seguridad en entornos de trabajo reales.
- Generalización limitada a variantes de la tarea: funciona con los tres grid layouts del dataset, pero no está diseñado para tareas fuera de ese dominio.
- Integración con LeRobot: se puede cargar, evaluar y desplegar directamente con el ecosistema LeRobot, incluyendo scripts de entrenamiento e inferencia.
- Sin capacidades de lenguaje, visión general o razonamiento simbólico: es un modelo puramente motor, no un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo puede controlar un brazo SO-100 para transferir piezas desde una estantería a una caja de ensamblaje, reduciendo la intervención humana en tareas repetitivas.
- Prototipado de políticas robóticas en investigación: sirve como punto de partida para investigadores que quieran experimentar con ACT sobre el SO-100, usando LeRobot para reproducir el entrenamiento y evaluar variaciones.
- Entrenamiento de tareas con anti-colisión: su diseño con estrategias anticolisión lo hace útil para entornos donde el espacio de trabajo es estrecho o hay obstáculos que evitar.
- Evaluación de técnicas de imitación en robótica de bajo coste: al ser un modelo pequeño y abierto, permite comparar el rendimiento de ACT con otras políticas (diffusion, etc.) en un hardware asequible.
- Demostraciones educativas: adecuado para cursos de robótica y visión por computador donde se muestre el ciclo completo de recogida de datos, entrenamiento y despliegue en un brazo real.
- Reutilización para tareas similares: con el dataset y el código de LeRobot, un desarrollador puede ajustar el modelo a nuevas variantes de la tarea rack-to-cup (cambios de posición, tamaño de objeto) reentrenando con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas como tasa de éxito, precisión de la trayectoria ni latencia en la model card. Tampoco se han comparado con otros modelos en los documentos consultados.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, en FP32 ocupa aproximadamente 207 MB; en FP16 unos 103 MB. Cabe en cualquier GPU moderna con más de 1 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es más que suficiente para inferencia; incluso una GTX 1650 con 4 GB podría ejecutarlo. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4080, A100).
- Compatibilidad con hardware de consumo: sí, se puede ejecutar en una tarjeta gráfica de gama media de escritorio.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), y puede integrarse con controladores de bajo nivel para el SO-100 vía el paquete `lerobot-record` y `lerobot-train`. No se ha documentado soporte para vLLM, Ollama o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá de la GPU y del bucle de control del robot (frecuencia de actualización típica entre 10 y 50 Hz).

## Comparativa con modelos similares

El modelo se puede comparar con otras políticas ACT del mismo autor para el mismo robot:

| Modelo | Parámetros | Tarea | Licencia | Diferencias |
|---|---|---|---|---|
| BC2605/so101-act-rack-to-cup-box | 51,7 M (estimado) | rack-to-cup | Apache-2.0 | Sin anti-colisión explícita (versión base) |
| BC2605/so101-act-rack-to-cup-box-side | 51,7 M (estimado) | rack-to-cup lateral | Apache-2.0 | Entrenado para una vista lateral de la tarea |
| BC2605/so101-act-rack-to-cup-box-anticoll (este) | 51,7 M | rack-to-cup con anti-colisión | Apache-2.0 | Incorpora estrategias anticolisión en el dataset |

No se dispone de métricas comparativas entre estos modelos, por lo que la comparación se limita a la configuración de la tarea y el dataset de entrenamiento.

## Limitaciones y advertencias

- Es un modelo específico de la tarea rack-to-cup sobre el SO-100: no funcionará en otros robots o tareas sin reentrenamiento.
- El rendimiento en entornos reales depende de la calidad de la teleoperación y de las condiciones del entorno (iluminación, posición de la cámara, calibración). No se garantiza robustez ante cambios no vistos en el entrenamiento.
- Riesgo de colisión residual: aunque se entrenó con estrategias anticolisión, no se han publicado tasas de fallo ni se garantiza la seguridad absoluta en el despliegue.
- No es un modelo de lenguaje: no tiene capacidades de texto, visión o razonamiento general; es exclusivamente un controlador robótico.
- Sin datos de benchmarks: no se puede evaluar su rendimiento cuantitativo frente a otras políticas.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte técnico.
- El repositorio es pequeño (0,2 GB) y no incluye el dataset original ni los scripts de entrenamiento completos; para reproducirlo hay que usar el dataset enlazado y la guía de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BC2605/so101-act-rack-to-cup-box-anticoll
- Dataset usado: https://huggingface.co/datasets/BC2605/rack-to-cup-3-grids-box-anticoll
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio GitHub de LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado (sin anti-colisión): https://huggingface.co/BC2605/so101-act-rack-to-cup-box
- Modelo relacionado (vista lateral): https://huggingface.co/BC2605/so101-act-rack-to-cup-box-side
- Tutorial de entrenamiento ACT para SO-101: https://trelis.substack.com/p/train-an-act-policy-for-an-so-101
- Guía de setup del SO-101: https://www.roboticscenter.ai/hardware/so-101/setup
