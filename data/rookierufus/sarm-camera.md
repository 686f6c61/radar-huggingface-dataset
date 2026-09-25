# rookierufus/sarm-camera

## Resumen

rookierufus/sarm-camera es un modelo de recompensa para robótica publicado en Hugging Face por Rudraksh Arora (usuario rookierufus). Es un artefacto entrenado con la librería LeRobot siguiendo el marco SARM (Stage-Aware Reward Modeling) en su modo dual, de forma que predice conjuntamente la etapa de la tarea y un valor de progreso fino a partir de vídeo. El checkpoint se ha entrenado sobre demostraciones bimanuales del robot SO-101 y emplea únicamente la cámara aérea superior izquierda (observation.images.left_top), con un entrenamiento de 2500 pasos y batch de 128.

Con 119.181.320 parámetros y un repositorio de 0,5 GB en formato safetensors, el modelo es lo bastante pequeño para ejecutarse en hardware de consumo, pero no es un modelo de lenguaje: su función es actuar como señal de recompensa para aprendizaje por refuerzo, evaluación de demostraciones y monitorización de progreso en tareas de manipulación de horizonte largo.

Su relevancia actual es acotada y debe interpretarse con cautela: el repositorio no declara licencia, no publica benchmarks y acumula cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que se trata de un artefacto de investigación sin validación externa documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de recompensa basado en vídeo con dos cabezas (etapa de tarea y progreso fino); backbone concreto no especificado en la información disponible |
| Parámetros totales | 119.181.320 (~119 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica / no disponible: procesa observaciones de vídeo de una cámara aérea y anotaciones de subtareas en lenguaje natural; no se documenta ventana temporal ni número de fotogramas |
| Tipos de cuantización | No disponibles: se publican pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni cuantizaciones int8 documentadas |
| Idiomas soportados | No disponibles: no es un modelo de lenguaje; las anotaciones de subtareas son texto en lenguaje natural de idioma no especificado |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe un modelo de recompensa con dos cabezas de predicción: una orientada a la etapa de la tarea (stage) y otra al progreso fino (progress). Se ha entrenado con LeRobot SARM en configuración `annotation_mode=dual`, lo que implica el uso de anotaciones de subtareas en lenguaje natural como supervisión auxiliar, tal y como describe el marco SARM del paper arXiv:2509.25358, que plantea un modelado de recompensa basado en vídeo que predice conjuntamente etapa y progreso en problemas de manipulación de horizonte largo con objetos deformables.

Los datos de entrenamiento son demostraciones bimanuales del robot SO-101, con una única vista de cámara aérea (`observation.images.left_top`) como entrada visual. El checkpoint final corresponde al paso 2500 con batch de 128. No se especifican en la información disponible el número total de tokens o fotogramas vistos, el tamaño del dataset, su composición, ni si se aplicaron etapas de RLHF, DPO u optimización por preferencias (no aplicables en sentido estricto a un modelo de recompensa de este tipo). Tampoco se documenta la naturaleza exacta del backbone visual.

## Capacidades

- Estimación de recompensa escalar de progreso a partir de observaciones de vídeo de una cámara aérea.
- Predicción de la etapa de la tarea mediante la cabeza específica de stage, dentro del esquema dual del marco SARM.
- Condicionamiento mediante anotaciones de subtareas en lenguaje natural (según el marco SARM descrito en el paper).
- Aplicación a manipulación bimanual con el robot SO-101 sobre demostraciones de horizonte largo.
- Utilizable como fuente de señal de recompensa en bucles de aprendizaje por refuerzo y en evaluación automática de demostraciones.
- No dispone de generación de texto libre, razonamiento conversacional, tool calling ni function calling.
- No se documentan capacidades de agente, multi-step reasoning, visión general, audio ni modo "thinking".
- No se documentan capacidades multilingües.

## Casos de uso

- Aprendizaje por refuerzo sobre SO-101: el modelo actúa como función de recompensa densa para una política de manipulación bimanual, sustituyendo o complementando recompensas manuales difíciles de definir.
- Filtrado y curación de datasets de demostración: asignar una puntuación de progreso a cada episodio teleoperado permite descartar trayectorias de calidad inconsistente antes de entrenar una política.
- Detección de etapa en tareas de horizonte largo: la cabeza de stage permite segmentar automáticamente un episodio en subtareas (por ejemplo, aproximación, agarre, transporte, colocación) sin etiquetado manual.
- Monitorización de progreso en despliegue: durante la ejecución real, la salida de progreso puede usarse para detectar estancamientos y disparar recuperaciones o reinicios.
- Aprendizaje por imitación con recompensa (por ejemplo, variantes de RL offline): el modelo puntúa trayectorias generadas por la política, habilitando selección o ponderación de muestras.
- Detección temprana de fallos: una caída sostenida del progreso predicho puede interpretarse como señal de fallo y activar una política de seguridad que detenga el brazo.
- Currículo de subtareas: usar la predicción de etapa como condición para desbloquear el entrenamiento de la siguiente fase en tareas compuestas.
- Evaluación comparativa de políticas: medir el progreso medio predicho por episodio como métrica proxy entre dos versiones de un mismo controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, aproximadamente 477 MB; en fp16 o bf16, aproximadamente 238 MB; en int8, aproximadamente 119 MB. Son estimaciones aritméticas a partir del número de parámetros, no mediciones publicadas.
- Cabe en cualquier GPU de consumo con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). El cuello de botella real será el coste del encoder de vídeo y del pipeline de decodificación de fotogramas, no la memoria.
- Inferencia en CPU viable por el reducido tamaño del modelo, con latencias mayores si se procesan secuencias de vídeo.
- GPU de centro de datos (A100, H100) no necesarias para inferencia; pueden ser útiles para reentrenamiento o para procesar grandes volúmenes de episodios en paralelo.
- Opciones de despliegue: librería LeRobot sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, dado que no es un modelo de lenguaje.
- No se documenta el hardware utilizado para el entrenamiento (paso 2500, batch 128).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. La única referencia contrastable es el propio marco SARM descrito en el paper arXiv:2509.25358, frente al cual este checkpoint es una instancia concreta y más restringida.

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarm-camera (este checkpoint) | Modelo de recompensa dual (etapa + progreso) | 119.181.320 | Una cámara aérea (`observation.images.left_top`) | No disponible | Hugging Face, librería LeRobot |
| SARM (marco del paper arXiv:2509.25358) | Modelo de recompensa basado en vídeo, etapa + progreso | No disponible | Vídeo (número de vistas no disponible) | No disponible | Publicación académica |
| Otros modelos de recompensa para robótica | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no puede determinarse si se permite el uso comercial, la redistribución o la modificación.
- Sin validación externa: cero descargas y cero "likes" en el momento de redactar la ficha, sin resultados de benchmarks ni métricas de calibración publicadas.
- Sesgo de dominio: entrenado exclusivamente con demostraciones bimanuales de SO-101 y una única cámara aérea, por lo que su comportamiento fuera de esa configuración de robot, tarea y punto de vista no está caracterizado.
- Dependencia de la vista: al usar solo `observation.images.left_top`, cambios de montaje, oclusiones o iluminación distinta pueden degradar las predicciones de etapa y progreso.
- Riesgo de reward hacking: como todo modelo de recompensa aprendido, una política puede explotar sus errores sistemáticos y maximizar la puntuación sin completar la tarea real.
- No se documentan el tamaño, la diversidad ni la composición del dataset de entrenamiento, ni el criterio de selección del checkpoint del paso 2500.
- No es un modelo de lenguaje: carece de tool calling, razonamiento conversacional, capacidades multilingües y cualquier función de agente basada en texto.
- No se documenta el idioma de las anotaciones de subtareas en lenguaje natural utilizadas durante el entrenamiento.
- Los metadatos del repositorio indican una fecha de creación de 2026-09-25, posterior a la fecha habitual de publicación de artefactos, lo que puede indicar una anomalía o un error de metadatos de la plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rookierufus/sarm-camera
- Perfil del autor: https://huggingface.co/rookierufus/models
- Otro modelo del mismo autor: https://huggingface.co/rookierufus/probe
- Paper SARM: Stage-Aware Reward Modeling for Long Horizon Robot Manipulation: https://arxiv.org/abs/2509.25358
- Librería LeRobot (Hugging Face), referenciada en `library_name`: https://github.com/huggingface/lerobot
