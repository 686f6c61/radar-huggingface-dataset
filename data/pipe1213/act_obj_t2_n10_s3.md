# Pipe1213/act_obj_t2_n10_s3

## Resumen

`Pipe1213/act_obj_t2_n10_s3` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: recoger un trozo de mantequilla y colocarlo en una cesta. Forma parte del estudio comparativo [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que contrasta un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero sobre las mismas pocas demostraciones. El autor lo publica para hacer reproducible el estudio, no como política de propósito general.

El modelo tiene 51,67 millones de parámetros, se entrenó con 10 episodios del dataset `lerobot/libero` y se evaluó sobre los 50 estados iniciales fijos de la tarea LIBERO-Object con id 6. El resultado agregado de los tres checkpoints evaluados es de 13 aciertos sobre 150 episodios (8,7 %, intervalo de Wilson al 95 %: 5-14 %), muy por debajo del 82,4 % obtenido por SmolVLA en el mismo escenario agregado del estudio.

Su relevancia es metodológica: documenta con detalle el pipeline de entrenamiento (LeRobot 0.6.2, semilla 3000, 10.000 pasos, 0,36 h en una RTX 4050 de 6 GB) y evidencia la alta varianza entre checkpoints de una misma ejecución de ACT, un caveat práctico importante para quien quiera reutilizar este tipo de políticas en robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de imagen ResNet-18 y decodificador de acciones por chunks |
| Parámetros totales | 51.671.687 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada por el entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un encoder visual ResNet-18 inicializado con pesos de ImageNet con un transformer que predice chunks de 100 acciones. En este caso todo el resto de la red se entrena desde cero sobre 10 demostraciones de la tarea "pick up the butter and place it in the basket" (episodios 873, 914, 927, 938, 961, 1012, 1124, 1183, 1185 y 1212 del dataset `lerobot/libero`, revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`). Se usan los ajustes por defecto de LeRobot: batch de 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 3000 y 4 workers de carga de datos. El entrenamiento completo consumió 0,36 h en una RTX 4050 de 6 GB.

La única desviación respecto a los valores por defecto se produce en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo de 100. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero` (comportamiento por defecto de LeRobot), no solo de los 10 episodios seleccionados. No se documenta uso de RLHF, DPO ni ningún ajuste fino posterior; es aprendizaje por imitación supervisado puro.

## Capacidades

- Generación de acciones de manipulación robótica en simulación para una única tarea: coger la mantequilla y depositarla en la cesta (LIBERO-Object, task id 6).
- Predicción de chunks de 100 acciones a partir de observaciones visuales de 256×256 píxeles y del estado del robot.
- Replanificación cada 10 acciones durante la evaluación, lo que permite cierta corrección reactiva dentro de la ejecución.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa instrucciones en lenguaje natural: la tarea está codificada en los pesos.
- No dispone de modo thinking, visión general, audio ni otras capacidades más allá del control visuomotor de la tarea.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: sirve como referencia exacta de una política ACT entrenada desde cero con 10 demostraciones y semilla 3000, para replicar la comparación frente a SmolVLA con el mismo comando `lerobot-train` documentado.
- Línea base en experimentos de imitación: útil para medir cuánto aporta el preentrenamiento visión-lenguaje-acción frente a entrenar desde cero con el mismo presupuesto de datos y pasos.
- Docencia y formación en robótica: ejemplo completo y ligero (52 M de parámetros, 0,6 GB de repo) de pipeline LeRobot con evaluación en MuJoCo sobre estados iniciales fijos.
- Estudio de varianza entre checkpoints: el autor reporta que en 30 de 36 ejecuciones de ACT los checkpoints de un mismo run difieren mucho; este modelo permite analizar ese fenómeno con tres checkpoints concretos (6.000, 8.000 y 10.000 pasos).
- Pruebas de infraestructura de evaluación: el comando `lerobot-eval` documentado con `--env.task=libero_object --env.task_ids="[6]"` sirve para validar entornos LIBERO, renderizado MuJoCo en CPU y versiones de LeRobot 0.6.2.
- Investigación sobre normalización de datos: al usar estadísticas del dataset completo en lugar de las 10 demostraciones, es un caso útil para estudiar el impacto de esta decisión en políticas con pocos datos.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO-Object task 6, 50 episodios por checkpoint, imágenes de 256×256, replanificación cada 10 acciones y semilla de evaluación 1000:

| Checkpoint (paso) | Aciertos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 4 de 50 | 8 % |
| 8.000 | 1 de 50 | 2 % |
| 10.000 | 8 de 50 | 16 % |
| Media de los 3 checkpoints (puntuación del estudio) | 13 de 150 | 8,7 % (IC 95 % Wilson: 5-14 %) |

Contexto agregado del estudio, sobre 3 tareas y todas las semillas de entrenamiento: ACT con 10 demostraciones por tarea alcanzó 34,6 %, frente a 82,4 % de SmolVLA con las mismas demostraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 51,67 M de parámetros (unos 0,2 GB en fp32) más el encoder ResNet-18, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 6 GB; el propio autor entrenó en una RTX 4050 de 6 GB. Para evaluación basta una GPU modesta o incluso CPU para el renderizado MuJoCo (el autor usó MuJoCo en CPU bajo WSL2).
- Cabe en GPU consumer: sí, en RTX 4050, RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot 0.6.2 con `lerobot-eval` y el entorno `libero`; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de robótica).
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el tiempo de entrenamiento: 0,36 h en una RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,67 M | Imágenes 256×256 + estado; sin lenguaje | 8,7 % en esta tarea (media de 3 checkpoints); 34,6 % agregado del estudio con 10 demos | apache-2.0 | HuggingFace, librería LeRobot |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | Visión-lenguaje-acción preentrenado | 82,4 % agregado del estudio con 10 demos | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Otras políticas ACT del estudio (60 en total) | 51,67 M (misma configuración) | Igual que este modelo | Varían por tarea y semilla; 34,6 % agregado | apache-2.0 (presumiblemente, no confirmado para cada una) | Repositorio del estudio vla-vs-scratch |

No se dispone de datos de benchmarks de otros modelos comparables fuera del estudio citado.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no probado en robot real.
- La comparación del estudio mezcla diferencias de preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje, por lo que la brecha frente a SmolVLA no puede atribuirse solo al preentrenamiento.
- Las 3 tareas se eligieron entre tareas de LIBERO-Object que un checkpoint publicado de SmolVLA ya resolvía, así que los resultados describen esas tareas concretas.
- Los estados y acciones se normalizan con estadísticas de todo `lerobot/libero`, no solo de las 10 demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para esta tarea.
- Alta varianza entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints difieren notablemente; hay que evaluar cada checkpoint antes de usarlo.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí de generalización: la política puede fallar de forma impredecible fuera de los estados iniciales fijos de evaluación.
- Licencia apache-2.0, que permite uso comercial, pero el modelo no está pensado ni validado para producción.
- No procesa instrucciones en lenguaje natural ni soporta otros idiomas; no hay capacidades de tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t2_n10_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada
