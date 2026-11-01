# Pipe1213/act_obj_t2_n05_s3

## Resumen

`Pipe1213/act_obj_t2_n05_s3` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: recoger un trozo de mantequilla y depositarlo en una cesta. Forma parte del estudio comparativo `vla-vs-scratch`, que contrasta una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre exactamente las mismas demostraciones. El modelo lo publica el usuario Pipe1213 con fines de reproducibilidad, no como política de propósito general.

El modelo tiene 51.671.687 parámetros (aproximadamente 52M, según la model card) y se distribuye en formato safetensors bajo licencia Apache 2.0. Utiliza un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y el resto de la red se entrena desde cero. Predice *chunks* de 100 acciones, aunque en evaluación se replanifica cada 10 acciones. El repositorio ocupa 0,6 GB e incluye los checkpoints intermedios de los pasos 6.000, 8.000 y 10.000.

Su relevancia es metodológica: proporciona un punto de referencia cuantificado sobre cuánto puede lograr una política de imitación pequeña y entrenada desde cero con solo cinco demostraciones, frente a un VLA preentrenado. En el conjunto del estudio, ACT con 5 demostraciones por tarea alcanzó un 17,9% de éxito agrupado, mientras que SmolVLA con las mismas demostraciones llegó al 78%, lo que ilustra la brecha entre ambos enfoques en regímenes de pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder de imagen ResNet-18 |
| Parametros totales | 51.671.687 (aproximadamente 52M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; entrada visual y de estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un encoder visual convolucional (ResNet-18 preentrenado en ImageNet) con un transformer que predice secuencias de acciones (*action chunks*) de longitud 100. El modelo condiciona la predicción en la observación visual (imágenes de 256×256 píxeles) y el estado del robot, y se entrena con aprendizaje por imitación supervisado sobre pares observación-acción de demostraciones humanas. No emplea RLHF ni DPO; es aprendizaje por imitación puro. La única desviación respecto a los valores por defecto de LeRobot está en evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usó 5 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), concretamente los episodios 938, 961, 1124, 1183 y 1185, correspondientes a la tarea LIBERO-Object con id 6. Se emplearon 10.000 pasos con batch size 8, semilla 3000 y checkpoints cada 2.000 pasos, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). El coste computacional fue de 0,38 horas en una GPU de portátil RTX 4050 con 6 GB de VRAM. Los estados y acciones se normalizan con estadísticas del dataset completo `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Generación de secuencias de acciones de manipulación robótica (chunks de 100 acciones) a partir de observaciones visuales y de estado.
- Ejecución de una tarea concreta de pick-and-place en simulación: recoger mantequilla y colocarla en una cesta.
- Control visomotor de un brazo robótico simulado en el entorno LIBERO (MuJoCo).
- Replanificación periódica de acciones (cada 10 pasos en evaluación) para corregir desviaciones.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural; no recibe instrucciones textuales.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades especiales más allá de la percepción visual para control.

## Casos de uso

- Reproducción de experimentos de investigación: sirve como referencia controlada para comparar políticas entrenadas desde cero frente a VLA preentrenados con el mismo presupuesto de demostraciones, gracias a sus checkpoints documentados y comandos de entrenamiento y evaluación exactos.
- Estudio del efecto del número de demostraciones: al formar parte de una cuadrícula de 60 políticas con distintos tamaños de conjunto de datos, permite analizar cómo escala el rendimiento de ACT con 1, 5 o más episodios en una tarea fija.
- Evaluación de infraestructura de simulación: útil para validar pipelines de LeRobot con el entorno LIBERO, MuJoCo y renderizado en CPU (WSL2), dado que el comando de evaluación está publicado y es reproducible.
- Análisis de varianza entre checkpoints: permite estudiar por qué checkpoints del mismo entrenamiento rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio), un fenómeno relevante para el diseño de protocolos de selección de modelos.
- Docencia y formación en aprendizaje por imitación: ejemplo mínimo y de bajo coste (0,38 h en una RTX 4050) para ilustrar el flujo completo de entrenamiento y evaluación de una política ACT.
- Punto de partida para *fine-tuning* en tareas similares de manipulación en simulación, aunque el autor no lo recomienda como política de propósito general y no se ha probado en robot real.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 50 escenas iniciales fijas de la tarea (estados iniciales 0 a 49 de LIBERO):

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 0 de 50 | 0% |
| 8.000 | 0 de 50 | 0% |
| 10.000 | 23 de 50 | 46% |
| Media de los 3 checkpoints | 23 de 150 | 15,3% (intervalo de Wilson del 95%: 10-22%) |

Contexto comparativo del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento):

| Método | Demostraciones por tarea | Tasa de éxito agrupada |
|---|---:|---:|
| ACT desde cero | 5 | 17,9% |
| SmolVLA ajustado | 5 | 78% |

El intervalo de Wilson cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene aproximadamente 52M parámetros y el entrenamiento completo cupo en una RTX 4050 de 6 GB, por lo que la inferencia requiere bastante menos de 6 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entrenó en una RTX 4050 (6 GB). Para evaluación, el renderizado de MuJoCo se ejecutó en CPU (WSL2).
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más (RTX 4050, 3060, 4060, 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path=Pipe1213/act_obj_t2_n05_s3`), junto con el entorno LIBERO y MuJoCo para la simulación.
- Latencia y throughput: no disponibles. El coste de entrenamiento conocido es de 0,38 h para 10.000 pasos con batch size 8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Enfoque | Tasa de éxito (5 demos, estudio) | Licencia |
|---|---|---|---:|---:|---|
| ACT (este modelo) | ~52M | Imagen 256×256 + estado | Entrenado desde cero | 17,9% (agrupado, 3 tareas) | Apache 2.0 |
| SmolVLA (ajustado) | no disponible en la información | Visión + lenguaje + estado | VLA preentrenado y ajustado | 78% (agrupado, 3 tareas) | no disponible en la información |

No se dispone en la información proporcionada de otros modelos comparables con parámetros y resultados detallados. La comparación directa con SmolVLA debe interpretarse con cautela: difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse únicamente al preentrenamiento.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- El autor la publica para reproducibilidad, no como política de propósito general.
- Alta variabilidad entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta; es imprescindible evaluar un checkpoint antes de usarlo.
- La comparación con SmolVLA no aísla el efecto del preentrenamiento, ya que los modelos difieren en tamaño, arquitectura y entrada de lenguaje.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga los resultados hacia esas tareas.
- Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas, lo que puede introducir desajustes.
- ACT se usó con los valores por defecto de LeRobot y no se ajustó para esta tarea.
- No procesa lenguaje ni instrucciones textuales; no es aplicable a tareas fuera de su dominio visual y de control.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o fallos de la política en escenas no vistas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción ni para entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t2_n05_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
