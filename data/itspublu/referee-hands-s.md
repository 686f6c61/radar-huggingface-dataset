# itspublu/referee-hands-s

## Resumen

`referee-hands-s` es un clasificador de imágenes de 1,5 millones de parámetros desarrollado por itspublu, diseñado para responder una pregunta concreta en vídeo de entrenamiento robótico: ¿se ve una mano o un gripper en el fotograma? Está construido sobre una arquitectura MobileNetV3-small, recibe imágenes de 96x96 píxeles y está pensado para ejecutarse en presupuestos de inferencia de microcontrolador (tinyML). El modelo se obtiene por destilación de las pseudoetiquetas generadas por `gemma3:27b` sobre 4.138 fotogramas procedentes de los conjuntos DROID, ALOHA-sim y KABR, todos con licencias permisivas (CC BY, MIT y CC0).

La relevancia de este modelo es práctica: en robótica, los datasets de entrenamiento de políticas suelen contener secuencias egocéntricas donde la visibilidad de la mano o del gripper es un factor determinante para la calidad del aprendizaje. Un clasificador tan ligero permite filtrar o anotar estos datos en el propio borde, sin depender de un modelo multimodal grande. El autor declara una precisión a nivel de clip del 97,8 % en el benchmark público `referee-lab/hands-visible`, igualando a su profesor (gemma3:27b) con una fracción minúscula de parámetros.

El modelo se distribuye con licencia Apache 2.0, está publicado en formato safetensors y su pipeline es `image-classification`. Aunque los datos de entrenamiento provienen de los mismos vídeos que el benchmark (resultado in-domain), el autor advierte de esta limitación y anuncia una división cross-video como siguiente paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV3-small (clasificador de imagen) |
| Parámetros totales | 1.530.993 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada 96x96 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visual, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo usa una MobileNetV3-small estándar de PyTorch (`torchvision.models.mobilenet_v3_small`), a la que se sustituye la última capa de clasificación por una única salida lineal con activación sigmoide, que produce la probabilidad de que una mano o gripper sea visible en el fotograma. La entrada se reduce a 96x96 píxeles, lo que reduce el coste computacional y lo hace adecuado para dispositivos de borde.

El entrenamiento se realizó mediante destilación: `gemma3:27b` actuó como profesor, generando pseudoetiquetas sobre 4.900 fotogramas extraídos de DROID (CC BY 4.0), ALOHA-sim (MIT) y KABR (CC0). No se dispone de información pública sobre el número total de épocas, el optimizador o el tamaño de lote utilizado. La inferencia a nivel de clip se realiza muestreando aproximadamente 12 fotogramas y respondiendo "sí" si el máximo de las probabilidades supera 0,5.

## Capacidades

- Clasificación de visibilidad de mano o gripper en fotogramas individuales de vídeo egocéntrico.
- Inferencia a nivel de clip (muestreo de ~12 fotogramas y agregación con umbral 0,5).
- Ejecución en hardware de borde y microcontroladores gracias a su tamaño reducido (1,5M parámetros, entrada 96x96).
- Integración sencilla en pipelines de PyTorch mediante `torchvision` y `safetensors`.
- Compatible con flujos de anotación automática y filtrado de datasets robóticos.
- No dispone de capacidades de generación de texto, tool calling ni razonamiento multimodal; es un clasificador unimodal de imágenes.

## Casos de uso

- Filtrado de datasets de robótica: antes de entrenar un modelo de aprendizaje por imitación, se puede usar `referee-hands-s` para descartar clips donde la mano o el gripper no es visible, mejorando la calidad de las demostraciones.
- Anotación automática de vídeos egocéntricos: integrarlo en un pipeline de anotación para marcar la visibilidad de la mano en cada clip, sin intervención humana.
- Control de calidad en captura de datos: durante la adquisición de datos de teleoperación, el modelo puede emitir una alerta en tiempo real si la mano desaparece del campo de visión, ayudando a los operadores a corregir la postura.
- Preprocesado para modelos de visión de mayor tamaño: antes de pasar un clip a un VLM (por ejemplo, gemma3 o qwen2.5vl), se puede usar este clasificador para filtrar fotogramas irrelevantes y reducir el coste de inferencia.
- Despliegue en dispositivos embebidos: gracias a su tamaño, puede ejecutarse en una Raspberry Pi o en un microcontrolador con aceleración de tensor (por ejemplo, Coral Edge TPU) para monitorización de visibilidad en robots móviles.
- Benchmark de referencia en evaluación de visibilidad de manos: sirve como línea base (baseline) en el benchmark `referee-lab/hands-visible`, que otros modelos pueden comparar para medir su rendimiento en esta tarea específica.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el modelo-index de HuggingFace son los siguientes:

| Modelo | Parámetros | Precisión (clip) |
|---|---|---|
| gemma3:27b (profesor) | 27B | 97,8 % |
| **referee-hands-s (este modelo)** | **1,5M** | **97,8 %** |
| qwen2.5vl:32b | 32B | 74,4 % |
| qwen2.5vl:7b | 7B | 45,6 % |
| EgoSieve-S (cabecera de visibilidad de manos) | 22M | 40,0 % |
| MediaPipe HandLandmarker | — | 40,0 % |
| Suelo do-nothing (constante "sí") | — | 68,9 % |

El benchmark se puntúa sobre una plantilla pública de 45 clips, donde el veredicto a nivel de clip es "sí" si algún fotograma supera 0,5 de probabilidad. El autor indica explícitamente que los fotogramas de entrenamiento provienen de los mismos vídeos fuente que el benchmark, por lo que el resultado es in-domain y debe interpretarse con cautela. Las etiquetas del benchmark son provisionales y se han verificado mediante un registro de corrección publicado en el repositorio `referee-lab`.

## Requisitos de hardware

- VRAM estimada: inferior a 20 MB en FP32 (1,53M parámetros × 4 bytes), despreciable para cualquier GPU moderna.
- GPU recomendada: cualquiera; incluso una CPU o un microcontrolador con acelerador de red neuronal (por ejemplo, Coral Edge TPU, STM32N6) es suficiente para inferencia en tiempo real.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) sin problema; el cuello de botella está en la carga de imágenes, no en el modelo.
- Opciones de despliegue: PyTorch, ONNX, TensorFlow Lite (si se convierte), o directamente en C/C++ para microcontroladores.
- Latencia estimada: en una CPU moderna, la inferencia de un solo fotograma de 96x96 debería estar por debajo de 1 ms; en un microcontrolador, el orden de magnitud sería de decenas de milisegundos, dependiendo de la plataforma.
- Throughput: en una GPU, se pueden procesar miles de fotogramas por segundo; en un MCU, cientos de fotogramas por segundo como máximo.

## Comparativa con modelos similares

La comparativa se centra en la tarea de visibilidad de manos/gripper en vídeo egocéntrico, usando los datos publicados por el autor:

| Modelo | Params | Contexto/entrada | Precisión (clip) | Licencia |
|---|---|---|---|---|
| referee-hands-s | 1,5M | 96x96 px | 97,8 % | Apache 2.0 |
| gemma3:27b (profesor) | 27B | multimodal (texto+imagen) | 97,8 % | Gemma license |
| qwen2.5vl:32b | 32B | multimodal | 74,4 % | Apache 2.0 (con condiciones) |
| EgoSieve-S (cabecera de visibilidad) | 22M | no especificado | 40,0 % | no disponible |
| MediaPipe HandLandmarker | — | 224x224 px | 40,0 % | Apache 2.0 |

La principal ventaja de `referee-hands-s` es su tamaño extremadamente reducido (1,5M) frente a los modelos multimodales de 27B-32B, manteniendo la misma precisión que el profesor en el benchmark in-domain. EgoSieve-S, con 22M de parámetros, obtiene un rendimiento mucho menor, lo que sugiere que la destilación desde un modelo multimodal potente es más efectiva que un entrenamiento supervisado clásico con etiquetas humanas.

## Limitaciones y advertencias

- Resultado in-domain: los fotogramas de entrenamiento provienen de los mismos vídeos fuente que el benchmark, por lo que la precisión del 97,8 % podría no generalizar a vídeos nuevos o a otros dominios de robótica. El autor anuncia una división cross-video como trabajo futuro.
- Sin datos de entrenamiento detallados: no se publican hiperparámetros, épocas ni composición exacta del dataset de entrenamiento más allá de la procedencia de los fotogramas.
- Riesgo de alucinación no aplica en este tipo de modelo (no es generativo), pero sí puede producir falsos positivos o negativos en condiciones de iluminación, oclusión o manos de distintos colores/texturas no representadas en los datos.
- Sesgo de dominio: el modelo se ha entrenado con vídeos de DROID, ALOHA-sim y KABR, que son de robótica de manipulación; puede fallar en escenarios con manos humanas en entornos no robóticos (por ejemplo, vídeo de actividad diaria).
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones de atribución, pero los datos de entrenamiento (DROID, KABR, ALOHA-sim) tienen licencias específicas (CC BY, CC0, MIT) que pueden imponer condiciones de atribución para la distribución de datos derivados.
- No es un modelo de propósito general: solo responde a la pregunta binaria "¿hay mano o gripper visible?" y no puede realizar detección de objetos ni segmentación.
- Etiquetas del benchmark provisionales: las etiquetas del conjunto de evaluación son provisionales y se han verificado de forma automática, lo que introduce incertidumbre en la métrica exacta.

## Enlaces

- HuggingFace: https://huggingface.co/itspublu/referee-hands-s
- Repositorio del benchmark y de las evaluaciones: https://github.com/publu/referee-lab
- Conjunto de datos del benchmark (referee-lab/hands-visible): disponible en Prime Intellect Environments Hub, ejecutable con `prime eval run referee-lab/hands-visible`
- Datos de entrenamiento: [lerobot/droid_1.0.1](https://huggingface.co/datasets/lerobot/droid_1.0.1) y [imageomics/KABR](https://huggingface.co/datasets/imageomics/KABR)
