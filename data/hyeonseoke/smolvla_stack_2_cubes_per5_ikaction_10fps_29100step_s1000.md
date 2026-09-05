# HyeonseokE/smolvla_stack_2_cubes_per5_ikaction_10fps_29100step_s1000

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face para aprendizaje por imitación en robótica. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario HyeonseokE, y está especializado en la tarea de apilar un cubo verde sobre un cubo rojo con un brazo robótico tipo SO-101.

El modelo procesa observaciones del robot (estado articular de 6 dimensiones) junto con tres imágenes de cámara de resolución 256x256, y genera acciones de 6 dimensiones para controlar el brazo. Cuenta con 450.046.176 parámetros (aproximadamente 450 millones), lo que lo sitúa como un modelo ligero pensado para desplegarse en hardware de consumo. Se distribuye bajo licencia Apache-2.0 y está publicado con formato de pesos safetensors.

La relevancia de este checkpoint radica en que demuestra cómo ajustar SmolVLA para una tarea concreta de manipulación robótica a partir de un dataset de demostraciones relativamente pequeño (50 episodios y 17.940 frames a 10 FPS). Al ser un fine-tuning orientado a una tarea específica, resulta útil como referencia para investigadores que deseen entrenar políticas con recursos limitados o evaluar la transferencia a tareas similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo VLA; el contexto son observaciones visuales y de estado, no texto) |
| Tipos de cuantización | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo visión-lenguaje-acción, compacto y eficiente, diseñado para lograr un rendimiento competitivo con un coste computacional reducido y poder ejecutarse en hardware de consumo. Este checkpoint es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado con la librería LeRobot en su versión 0.6.0.

El entrenamiento se realizó sobre el dataset `HyeonseokE/redundancy_stack_2_cubes_per5_ikaction_10fps`, compuesto por 50 episodios de demostraciones de apilado de dos cubos, con un total de 17.940 frames y una tasa de muestreo de 10 FPS. La configuración de entrenamiento incluye 29.100 pasos, batch size de 64, optimizador AdamW con tasa de aprendizaje 0,0001 y semilla 1000.

En cuanto a las entradas y salidas, el modelo consume el estado del robot (6 dimensiones), tres observaciones visuales de dimensión (3, 256, 256) correspondientes a las cámaras, y produce una acción de 6 dimensiones para el brazo robótico. La model card indica que las cámaras usadas son una cámara superior (`top`) y una cámara en la muñeca izquierda (`left_wrist`), aunque la entrada declara tres canales visuales.

## Capacidades

- Control robótico por aprendizaje por imitación: predice acciones articulares a partir del estado actual y de observaciones visuales.
- Ejecución de la tarea específica "apilar el cubo verde sobre el cubo rojo" con el brazo SO-101.
- Manejo de múltiples cámaras de entrada (tres imágenes simultáneas de 256x256).
- Entrenamiento y despliegue a través del ecosistema LeRobot, lo que facilita el uso con robots compatibles.
- Compatible con el flujo de rollout de LeRobot para ejecutar la política en tiempo real.
- No soporta tool calling, razonamiento simbólico ni generación de texto: al ser un modelo VLA especializado, su salida es directamente una acción motora.

## Casos de uso

- Control de un brazo robótico de laboratorio: el modelo puede gobernar un robot SO-101 para ejecutar la tarea de apilado de cubos en entornos controlados, utilizando la cámara superior y la de la muñeca para percibir el estado de la escena.
- Investigación en aprendizaje por imitación con pocos datos: sirve como ejemplo de fine-tuning a partir de un dataset de solo 50 episodios, lo que permite estudiar la generalización y el sobreajuste en políticas de manipulación.
- Prototipado rápido de tareas de manipulación: gracias a la compatibilidad con LeRobot, se puede cargar la política y lanzar un rollout en minutos sobre un robot compatible, sin necesidad de desarrollar una pila de control desde cero.
- Evaluación de la robustez de políticas: el modelo puede utilizarse en experimentos que varíen posiciones de los cubos, iluminación o distracciones para medir la degradación del rendimiento.
- Fine-tuning para tareas de stacking similares: partiendo de estos pesos, se puede realizar un nuevo ajuste para otras configuraciones de cubos o incluso para tareas de ensamblaje simple que requieran coordinación bimanual.
- Despliegue educativo o de bajo coste: al ser un modelo de aproximadamente 450 millones de parámetros, puede ejecutarse en GPUs de consumo, lo que lo hace apto para laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Tampoco se dispone de métricas de éxito en entornos reales o simulados, ni comparativas con otros modelos en tareas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos de 450 millones de parámetros requieren aproximadamente 1,8 GB de VRAM, más la memoria necesaria para las activaciones y las imágenes de entrada. No se han publicado datos de cuantización.
- GPU recomendadas: una GPU de consumo moderna como la RTX 3060 o superior puede ejecutar el modelo. Para máxima velocidad en inferencia en tiempo real con tres cámaras a 30 FPS, se recomienda una RTX 4090, RTX 4080 o una A100.
- Compatibilidad con GPUs de consumo: sí, el modelo está diseñado para funcionar en hardware de consumo, aunque la carga real depende de la resolución de las cámaras y del número de imágenes procesadas simultáneamente.
- Opciones de despliegue: el flujo principal es mediante LeRobot, tanto en local como en el Hub de Hugging Face. No se mencionan despliegues con vLLM o llama.cpp, al no tratarse de un modelo de lenguaje generativo.
- Latencia y throughput: no disponible. No se han publicado medidas de tiempo de inferencia o FPS del rollout para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| `lerobot/smolvla_base` | ~450 M | Base genérica de SmolVLA | Pre-entrenamiento de Hugging Face | Apache-2.0 |
| `HyeonseokE/smolvla_stack_2_cubes_per5_ikaction_10fps_29100step_s1000` | 450.046.176 | Apilar dos cubos (verde sobre rojo) | 50 episodios, 17.940 frames | Apache-2.0 |
| `HyeonseokE/smolvla_stack_2_cubes_per10_ikaction_10fps_29100step_s1000` | No disponible | Apilar dos cubos (variante del dataset) | No disponible | Apache-2.0 |
| `HyeonseokE/smolvla_stack_2_cubes_cap_1000_10fps` | No disponible | Apilar dos cubos (variante del dataset) | No disponible | Apache-2.0 |

Todas son variantes de fine-tuning del mismo modelo base `lerobot/smolvla_base`, publicadas por el mismo autor y bajo la misma licencia Apache-2.0. El rendimiento no es comparable entre ellas porque no se han publicado métricas de evaluación para ninguna de las versiones.

## Limitaciones y advertencias

- El modelo ha sido entrenado con solo 50 episodios de demostraciones, lo que supone un alto riesgo de sobreajuste a las condiciones específicas del dataset (posiciones de cubos, iluminación, calibración de cámaras y configuración del robot).
- No se ha proporcionado ninguna evaluación formal: no existen métricas de éxito, ni pruebas en entornos con variaciones o distractores. Por tanto, su fiabilidad en condiciones distintas a las del entrenamiento es desconocida.
- Es un modelo de acción robótica, no un modelo de lenguaje. No genera texto, no mantiene conversaciones y no admite tool calling ni razonamiento multi-paso simbólico.
- La disponibilidad comercial es amplia gracias a la licencia Apache-2.0, pero esto no implica garantías de rendimiento ni soporte por parte del autor.
- Hay una inconsistencia entre las cámaras declaradas en la model card (`top` y `left_wrist`) y la definición de entrada del modelo, que espera tres imágenes. Esta discrepancia podría causar errores al intentar reproducir el rollout con la configuración documentada.
- El modelo presenta 0 descargas y 0 likes en el momento de publicar esta ficha, lo que indica que no ha sido validado por la comunidad y que pueden existir errores no detectados.
- Se desconoce el comportamiento del modelo ante cambios de iluminación, de fondo o de disposición de los cubos, dado que no se han publicado test de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_per5_ikaction_10fps_29100step_s1000
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/redundancy_stack_2_cubes_per5_ikaction_10fps
- Documentación del paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repository de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante similar del mismo autor: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_per10_ikaction_10fps_29100step_s1000
- Variante similar con entradas limitadas: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_cap_1000_10fps
