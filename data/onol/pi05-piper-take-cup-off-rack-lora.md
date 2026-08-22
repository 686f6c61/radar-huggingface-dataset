# Onol/pi05-piper-take-cup-off-rack-lora

## Resumen

El modelo `Onol/pi05-piper-take-cup-off-rack-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Onol sobre el modelo base `physical-intelligence/pi0.5`, un modelo de visión-lenguaje-acción (VLA) de Physical Intelligence diseñado para manipulación robótica de mundo abierto. Este LoRA está especializado en una tarea concreta: coger una taza de una estantería y colocarla en un plato, utilizando un robot bimanual con dos brazos de 7 grados de libertad cada uno.

El adaptador se entrenó durante 5.000 pasos sobre un conjunto de datos de 16 episodios (9.065 frames) correspondientes a la tarea `take_off_cup_short16_dual14d_pi05_rgb224_v21`. El prompt de lenguaje exacto es `take the cup off the rack and place it on the plate`. La relevancia de este modelo radica en que demuestra cómo adaptar un modelo fundacional robótico a una tarea específica mediante fine-tuning eficiente con LoRA, reduciendo costes de entrenamiento y tiempo de despliegue.

La licencia Apache 2.0 permite uso comercial y modificación, aunque al tratarse de un adaptador sobre pi0.5, las restricciones del modelo base pueden aplicarse. El tamaño del repositorio es de 28,5 GB, lo que sugiere que incluye los pesos del LoRA y posiblemente assets de normalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base pi0.5 (Vision-Language-Action) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (prompt fijo en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base es pi0.5, un VLA que co-entrena con datos diversos (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización de mundo abierto en tareas de manipulación de largo horizonte. Este LoRA hereda esa arquitectura, pero adapta sus pesos para la tarea específica de manipulación de tazas.

El entrenamiento se realizó con la librería OpenPI en JAX, durante 5.000 pasos, sobre un dataset de 16 episodios con 9.065 frames. Las entradas RGB son tres cámaras: superior, muñeca izquierda y muñeca derecha, todas con letterbox a 224×224 píxeles. El espacio de acción es de 14 dimensiones: 12 articulaciones (6 por brazo) más 2 grippers (uno por brazo). Las articulaciones se entrenan como deltas relativos al estado, mientras que los grippers se mantienen en valores absolutos, con clipping en el rango `[0, 0.08]` metros. El horizonte de acción es de 30 pasos.

## Capacidades

- Ejecución de la tarea de manipulación bimanual específica: coger una taza de una estantería y colocarla sobre un plato.
- Control de dos brazos robóticos de 7 DOF cada uno (6 articulaciones + gripper), con sincronización de acciones.
- Percepción multimodal con tres cámaras RGB (vista superior y dos muñecas) a 224×224 píxeles.
- Generación de secuencias de acción de 30 pasos de horizonte con supervisión de articulaciones absolutas en radianes.
- Adaptación de un modelo fundacional VLA a una tarea concreta mediante LoRA, lo que permite fine-tuning eficiente en datos limitados.

## Casos de uso

- Automatización de pick-and-place en laboratorios de robótica: el modelo puede integrarse en un sistema robótico real para ejecutar la tarea de manipulación de tazas, validando la capacidad de generalización de pi0.5 a tareas específicas.
- Investigación en aprendizaje por imitación: como referencia para estudiar cómo el fine-tuning con LoRA sobre modelos VLA mejora la precisión en tareas concretas con pocos episodios de demostración.
- Desarrollo de sistemas de manipulación bimanual: el LoRA sirve como ejemplo de control coordinado de dos brazos, útil para experimentos con robots de doble brazo.
- Benchmark de evaluación de modelos VLA: permite comparar el rendimiento de pi0.5 con otros adaptadores LoRA en tareas de manipulación similares.
- Entrenamiento de pipelines de datos robóticos: el dataset y la configuración de entrenamiento documentados sirven como plantilla para generar nuevos LoRA en tareas de pick-and-place.
- Despliegue en entornos industriales controlados: aunque requiere validación en robots reales, el modelo puede probarse en simuladores o entornos de demostración para evaluar su fiabilidad antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe de validación del repositorio solo comprueba la integridad del checkpoint y la pipeline de inferencia, no evalúa el éxito en robots reales.

## Requisitos de hardware

- El tamaño del repositorio es de 28,5 GB, lo que indica que se requiere una GPU con al menos 32 GB de VRAM para cargar el modelo completo en FP16 o BF16.
- Para inferencia en tiempo real, se recomienda una GPU de gama alta como NVIDIA A100 (40 GB), H100 (80 GB) o RTX 4090 (24 GB, aunque el modelo puede no caber completa).
- No se dispone de información sobre cuantizaciones compatibles, por lo que el despliegue en consumer GPU es incierto.
- Las opciones de despliegue probablemente incluyen el framework OpenPI (JAX) y potencialmente vLLM o TGI, pero no está documentado.
- Se requiere hardware robótico real o simulador para la validación de tareas, ya que el modelo produce acciones de control.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros LoRA de pi0.5 u otros VLA para la misma tarea. La información disponible solo permite indicar que el modelo base es pi0.5, que también se distribuye en versiones para otras tareas como `moriis/pi05_piper_third_v2` (otro LoRA para pi0.5) o `lerobot/pi05_base`. Sin embargo, no hay métricas publicadas para comparar.

## Limitaciones y advertencias

- El modelo está entrenado en un dataset muy pequeño (16 episodios), lo que aumenta el riesgo de sobreajuste y baja generalización a variaciones del entorno (iluminación, posición de la taza, tipo de estantería).
- El prompt de lenguaje es fijo (`take the cup off the rack and place it on the plate`), por lo que no se puede variar la instrucción sin reentrenar.
- La validación incluida no es una evaluación de éxito en robots reales, sino una comprobación de la pipeline de inferencia.
- No se documentan sesgos o alucinaciones, pero al ser un modelo de control robótico, los errores pueden causar daños físicos en el entorno.
- La licencia Apache 2.0 del LoRA no exime de las restricciones del modelo base pi0.5, que puede tener términos adicionales.
- El modelo no es un LLM general: no puede generar texto ni responder a preguntas; solo produce acciones de control robótico.
- La falta de información sobre cuantización y requisitos de hardware dificulta el despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Onol/pi05-piper-take-cup-off-rack-lora
- Modelo base pi0.5: https://huggingface.co/physical-intelligence/pi0.5 (referencia, no verificado en la búsqueda)
- Implementación de referencia de pi0.5 en LeRobot: https://huggingface.co/lerobot/pi05_base
- Otro LoRA de pi0.5 para la misma tarea: https://huggingface.co/moriis/pi05_piper_third_v2
- Información sobre pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Repositorio GitHub de OpenPI: https://github.com/EII-Tokyo/openpi0.5-rtc (contribución relacionada)</think>## Resumen

El modelo `Onol/pi05-piper-take-cup-off-rack-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Onol sobre el modelo fundacional de visión-lenguaje-acción (VLA) `physical-intelligence/pi0.5` de Physical Intelligence. Su propósito es especializar el modelo base en una tarea robótica concreta: coger una taza de una estantería y colocarla sobre un plato, ejecutada por un robot bimanual con dos brazos de 7 grados de libertad cada uno.

El adaptador se entrenó durante 5.000 pasos con la librería OpenPI en JAX, sobre un dataset de 16 episodios con 9.065 frames. El prompt de lenguaje fijo es `"take the cup off the rack and place it on the plate"`. Este modelo es relevante porque demuestra cómo adaptar un VLA generalista a una tarea específica mediante fine-tuning eficiente con LoRA, reduciendo los requisitos de datos y cómputo frente a un entrenamiento completo.

El repositorio ocupa 28,5 GB e incluye el checkpoint del adaptador, estadísticas de normalización y una superposición de configuración para OpenPI. La licencia Apache 2.0 permite uso comercial y modificación, aunque es necesario verificar las condiciones del modelo base pi0.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base pi0.5 (Vision-Language-Action) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (prompt fijo en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base pi0.5 es un VLA que co-entrena con datos heterogéneos (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización en tareas de manipulación de largo horizonte. Este LoRA hereda esa arquitectura y adapta sus pesos para la tarea específica de coger tazas.

El entrenamiento se realizó con OpenPI en JAX durante 5.000 pasos. Las entradas RGB son tres cámaras: una vista superior y dos muñecas (izquierda y derecha), todas con letterbox a 224×224 píxeles. El espacio de acción es de 14 dimensiones: 12 articulaciones (6 por brazo) y 2 grippers (uno por brazo). Las articulaciones se entrenan como deltas relativos al estado, mientras que los grippers se mantienen en valores absolutos, limitados al rango `[0, 0.08]` metros. El horizonte de acción es de 30 pasos.

El dataset de entrenamiento consta de 16 episodios (9.065 frames) de la tarea `take_off_cup_short16_dual14d_pi05_rgb224_v21`. La supervisión de acciones incluye objetivos absolutos de articulaciones en radianes. No se menciona el uso de técnicas como RLHF o DPO; se trata de un aprendizaje supervisado por imitación.

## Capacidades

- Ejecución de una tarea de manipulación bimanual específica: coger una taza de una estantería y colocarla en un plato.
- Control coordinado de dos brazos robóticos con 6 grados de libertad cada uno y dos grippers.
- Percepción visual multimodal con tres cámaras RGB (superior y dos muñecas) a 224×224 píxeles.
- Generación de secuencias de acción de 30 pasos de horizonte.
- Adaptación de un modelo fundacional VLA a una tarea concreta mediante LoRA, lo que permite fine-tuning eficiente con pocos datos.

## Casos de uso

1. Automatización de pick-and-place en laboratorios: el modelo puede desplegarse en un robot real para ejecutar la tarea de manipulación de tazas, validando la capacidad de LoRA para adaptar pi0.5 a tareas específicas.
2. Investigación en aprendizaje por imitación: como referencia para estudiar cómo el fine-tuning de LoRA mejora la precisión en tareas concretas con pocas demostraciones.
3. Desarrollo de sistemas de control bimanual: el adaptador sirve como base para experimentar con robots de doble brazo y tareas de coordinación.
4. Evaluación de modelos VLA en robótica: permite comparar el rendimiento de pi0.5 con otros adaptadores LoRA en tareas de manipulación similares.
5. Generación de datasets de entrenamiento: la configuración y el pipeline documentados sirven de plantilla para crear nuevos LoRA en otras tareas de pick-and-place.
6. Pruebas en simuladores robóticos: el modelo puede integrarse en entornos como MuJoCo o Isaac Sim para validar su comportamiento antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe de validación del repositorio solo comprueba la integridad del checkpoint y la pipeline de inferencia, no es una evaluación de éxito en robots reales.

## Requisitos de hardware

- El tamaño del repositorio es de 28,5 GB, lo que sugiere que la inferencia requiere al menos 32 GB de VRAM en precisión FP16.
- Se recomiendan GPUs de gama alta como NVIDIA A100 (40 GB), H100 (80 GB) o RTX 4090 (24 GB), aunque esta última podría ser insuficiente para el modelo completo.
- No se documentan cuantizaciones compatibles, por lo que el despliegue en GPU de consumo puede ser limitado.
- Las opciones de despliegue probablemente incluyen la librería OpenPI (JAX) y posiblemente vLLM o TGI, pero no se especifica.
- Se requiere hardware robótico real o un simulador para ejecutar las acciones generadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros LoRA de pi0.5 o modelos VLA similares. Existen otros adaptadores como `moriis/pi05_piper_third_v2` (también para la tarea de Piper) y `lerobot/pi05_base`, pero no se han publicado métricas que permitan una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado en un único dataset de 16 episodios, lo que aumenta el riesgo de sobreajuste y reduce la capacidad de generalización a variaciones del entorno (posición de la taza, tipo de plato, iluminación).
- El prompt de lenguaje es fijo; no se puede cambiar la instrucción sin reentrenar el adaptador.
- La validación del modelo no evalúa el éxito en robots reales, solo la integridad de la pipeline.
- Al ser un modelo de control robótico, errores en la ejecución pueden causar daños físicos al robot o al entorno.
- La licencia Apache 2.0 del adaptador no exime de las restricciones del modelo base pi0.5, que debe ser consultado.
- No es un modelo de lenguaje general: no genera texto ni responde a preguntas; solo produce acciones de control.
- No se documentan sesgos ni alucinaciones, pero al ser un modelo robótico, la seguridad y la robustez son críticas en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Onol/pi05-piper-take-cup-off-rack-lora
- Modelo base pi0.5 (referencia): https://huggingface.co/physical-intelligence/pi0.5
- Implementación de pi0.5 en LeRobot: https://huggingface.co/lerobot/pi05_base
- Otro LoRA de pi0.5 para la misma tarea: https://huggingface.co/moriis/pi05_piper_third_v2
- Información de pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Repositorio de OpenPI (contribución): https://github.com/EII-Tokyo/openpi0.5-rtc
