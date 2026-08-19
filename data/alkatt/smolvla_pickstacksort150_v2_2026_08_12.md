# Alkatt/SmolVLA_pickstacksort150_V2_2026_08_12

## Resumen

SmolVLA_pickstacksort150_V2_2026_08_12 es un modelo de visión-lenguaje-acción (VLA) compacto, desarrollado por Alkatt mediante fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `Alkatt/so_101_pickstacksort150_V2_2026_08_12`. Está diseñado para control robótico, concretamente para tareas de recoger, apilar y clasificar objetos (pick, stack, sort) con un brazo robótico tipo SO-100. El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, que destaca por su eficiencia computacional y su capacidad para ejecutarse en hardware de consumo.

Con 450 millones de parámetros, este modelo representa una alternativa ligera a los VLA de gran escala, manteniendo un rendimiento competitivo en su dominio de aplicación. Ha sido entrenado y publicado utilizando la librería LeRobot de HuggingFace, lo que facilita su reproducción y despliegue en entornos robóticos reales. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su tamaño reducido, que lo hace accesible para laboratorios y desarrolladores con recursos limitados, y en su especialización en una tarea robótica concreta, lo que permite una integración directa en pipelines de automatización industrial o investigación en manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA, un VLA compacto que integra un codificador de visión, un modelo de lenguaje y un decodificador de acciones para generar comandos motores directamente desde observaciones visuales e instrucciones en lenguaje natural. Según la model card, SmolVLA logra un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. No se proporcionan detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

El entrenamiento se ha realizado mediante fine-tuning del checkpoint `lerobot/smolvla_base` sobre el dataset `Alkatt/so_101_pickstacksort150_V2_2026_08_12`, que contiene episodios de demostración para tareas de pick, stack y sort. El proceso se ha llevado a cabo con la librería LeRobot, que ofrece herramientas estandarizadas para entrenamiento, evaluación e inferencia de políticas robóticas. No se mencionan innovaciones técnicas adicionales más allá de las inherentes a SmolVLA.

## Capacidades

- Control robótico directo: genera acciones de articulación (posiciones de motores) a partir de imágenes y comandos de texto.
- Percepción visual: procesa imágenes de cámaras para localizar y manipular objetos en el espacio de trabajo.
- Comprensión de instrucciones en lenguaje natural: interpreta órdenes como "recoge el objeto rojo" o "apila el cubo azul sobre el verde".
- Ejecución de tareas compuestas: realiza secuencias de recogida, apilado y clasificación de objetos en un entorno controlado.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de políticas robóticas de HuggingFace.
- Eficiencia computacional: tamaño reducido que permite inferencia en GPUs de gama media o incluso CPU en tiempo casi real.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de una cinta transportadora y depositarlos en contenedores específicos, gracias a su capacidad de interpretar instrucciones visuales y de texto.
- Clasificación de piezas en líneas de montaje: dado un conjunto de objetos heterogéneos, el modelo los clasifica por categorías (tamaño, color, forma) ejecutando acciones de agarre y colocación.
- Investigación en manipulación robótica: sirve como baseline para estudiar estrategias de aprendizaje por imitación en tareas de pick-stack-sort, permitiendo comparaciones con otros VLA.
- Prototipado de soluciones robóticas en educación: al ser ligero y de código abierto, puede desplegarse en laboratorios universitarios con hardware limitado para demostraciones prácticas.
- Integración en sistemas de control de brazos SO-100: el modelo está entrenado específicamente para este robot, por lo que puede reemplazar controladores clásicos en entornos de fabricación a pequeña escala.
- Evaluación de políticas de aprendizaje por refuerzo: el modelo puede utilizarse como política experta para generar demostraciones o como baseline en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como tasa de éxito en las tareas, ni comparaciones con otros modelos. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para conocer el rendimiento general de la arquitectura, aunque no se aplican directamente a este fine-tuning específico.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 450M parámetros, la inferencia en FP16 requeriría aproximadamente 0.9 GB solo para los pesos, pero al incluir el procesamiento de imágenes y el contexto de acción, se estima un consumo de 2-4 GB en GPUs consumer. No se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, etc.).
- Despliegue: el modelo es compatible con LeRobot, que soporta inferencia en PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de decenas de milisegundos por paso de control en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para tareas de pick-stack-sort con ~450M parámetros). Alternativas generales como OpenVLA (7B parámetros) o RT-2 (más grande) no son directamente comparables por tamaño y dominio. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente para tareas de pick, stack y sort con el robot SO-100 y el dataset proporcionado. No generaliza a otras tareas o robots sin fine-tuning adicional.
- Riesgo de sobreajuste: al ser un fine-tuning sobre un dataset concreto, puede presentar baja robustez ante variaciones en iluminación, disposición de objetos o cambios en el entorno.
- Sesgos no evaluados: no se ha realizado ninguna evaluación de sesgos o comportamientos indeseados, por lo que no se puede garantizar un comportamiento seguro en entornos no controlados.
- Dependencia del robot: las acciones generadas están calibradas para el robot SO-100; su uso en otros brazos requiere recalibración o reentrenamiento.
- Sin información de contexto: al ser un modelo de acción, la longitud de contexto no es un parámetro relevante, pero no se documenta el tamaño de la ventana de observación visual.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset utilizado puede tener restricciones adicionales; se recomienda verificar la licencia del dataset `Alkatt/so_101_pickstacksort150_V2_2026_08_12`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alkatt/SmolVLA_pickstacksort150_V2_2026_08_12
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
