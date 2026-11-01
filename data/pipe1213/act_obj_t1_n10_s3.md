# Pipe1213/act_obj_t1_n10_s3

## Resumen

`Pipe1213/act_obj_t1_n10_s3` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero sobre una única tarea del benchmark LIBERO-Object: "pick up the bbq sauce and place it in the basket" (tarea de simulador con id 3). Forma parte de un estudio comparativo denominado `vla-vs-scratch`, que confronta una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y afinado (SmolVLA) sobre exactamente las mismas 10 demostraciones por tarea, en simulación.

El modelo tiene 51.671.687 parámetros (52M) y un encoder de imagen ResNet-18 inicializado con pesos de ImageNet. No es un modelo de propósito general: se publica con fines de reproducibilidad del estudio, no para despliegue en robótica real. El repositorio ocupa 0,6 GB e incluye checkpoints intermedios en `checkpoints/<step>/pretrained_model`.

La relevancia actual es metodológica: cuantifica cuánto rinde una política de imitación pequeña entrenada desde cero con muy pocas demostraciones (10 episodios) frente a un VLA preentrenado, con una tasa de éxito media del 80,7% en esta tarea concreta (121 de 150 episodios sobre 3 checkpoints), frente al 34,6% agregado de ACT en las 3 tareas del estudio y el 82,4% de SmolVLA en el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder de imagen ResNet-18 |
| Parametros totales | 51.671.687 (52M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; política específica de tarea) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que predice chunks de acciones (100 acciones por chunk en la configuración por defecto de LeRobot) a partir de observaciones visuales y del estado del robot. La entrada visual pasa por un ResNet-18 inicializado con pesos de ImageNet; el resto de la red se entrena desde cero. El modelo no recibe instrucciones en lenguaje: está especializado en una sola tarea del simulador LIBERO-Object.

El entrenamiento usa 10 demostraciones del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), correspondientes a los episodios 843, 853, 871, 889, 893, 932, 1005, 1067, 1077 y 1235. Configuración: batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 3000, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). El coste de cómputo fue de 0,37 h en una RTX 4050 de portátil (6 GB). La única desviación respecto a los valores por defecto de LeRobot se produce en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

## Capacidades

- Control robótico de manipulación en simulación: agarre y colocación de un objeto concreto (salsa BBQ) en una cesta, dentro del simulador LIBERO.
- Predicción de chunks de acciones (100 acciones por chunk en entrenamiento; ejecución con replanificación cada 10 acciones en evaluación).
- Procesamiento de observaciones visuales a 256×256 píxeles junto con el estado del robot.
- Aprendizaje por imitación con muy pocos datos (10 demostraciones).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües ni procesa instrucciones en lenguaje natural.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades fuera de la observación visual de la tarea.

## Casos de uso

- Reproducción de experimentos de investigación: sirve para replicar los resultados del estudio `vla-vs-scratch` con la misma semilla (3000), dataset y configuración, verificando la tasa de éxito publicada del 88% en el checkpoint de 10.000 pasos.
- Línea base para comparativas de políticas: se puede usar como referencia de ACT entrenado desde cero frente a VLAs preentrenados en tareas de LIBERO-Object, con métricas de éxito sobre los 50 estados iniciales fijos.
- Estudio del efecto del número de demostraciones: al existir variantes del mismo estudio con 1, 10 y otros tamaños de conjunto (los conjuntos pequeños están anidados en los grandes), permite analizar la curva de rendimiento frente a datos.
- Análisis de estabilidad entre checkpoints: dado que en 30 de 36 ejecuciones de ACT del estudio los checkpoints de una misma ejecución rinden de forma muy distinta, este modelo es útil para estudiar la varianza de evaluación y la selección de checkpoints.
- Docencia y formación en aprendizaje por imitación: ejemplo completo y ligero (0,6 GB, entrenamiento en 0,37 h en una GPU de 6 GB) para ilustrar el pipeline de LeRobot con ACT.
- Validación de infraestructura de evaluación en robótica: permite probar `lerobot-eval` con `--env.type=libero`, estados iniciales fijos y renderizado MuJoCo en CPU antes de escalar a otros modelos.
- Pruebas de integración en simulación: útil para validar entornos de simulación y pipelines de replanificación de acciones (cada 10 acciones) sin depender de modelos grandes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 50 estados iniciales fijos de la tarea (LIBERO initial states 0 a 49), 50 episodios por checkpoint, imágenes de 256×256, replanificación cada 10 acciones, semilla de evaluación 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 35 de 50 | 70% |
| 8.000 | 42 de 50 | 84% |
| 10.000 | 44 de 50 | 88% |
| Media de los 3 checkpoints | 121 de 150 | 80,7% (intervalo de Wilson 95%: 74-86%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento):

| Método | Demostraciones por tarea | Tasa de éxito agregada |
|---|---:|---:|
| ACT desde cero | 10 | 34,6% |
| SmolVLA (afinado) | 10 | 82,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 52M parámetros (aproximadamente 0,2 GB en FP32 para los pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU de datacenter; el entrenamiento se realizó en una RTX 4050 de portátil con 6 GB. Para inferencia basta una GPU integrada o incluso CPU, aunque la evaluación en LIBERO usa renderizado MuJoCo en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 6 GB (y previsiblemente en muchas con menos).
- Opciones de despliegue: `lerobot-eval` (evaluación en simulador LIBERO) y el stack de LeRobot 0.6.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el tiempo de entrenamiento (0,37 h en RTX 4050).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia |
|---|---|---:|---|---|---|
| `Pipe1213/act_obj_t1_n10_s3` (este) | ACT desde cero | 52M | Observación visual 256×256 + estado; chunk de 100 acciones | 80,7% medio en esta tarea (88% en el checkpoint final) | apache-2.0 |
| SmolVLA (afinado, misma tarea) | VLA preentrenado | no disponible en la información | Entrada visual + instrucción en lenguaje | 82,4% agregado en 3 tareas con 10 demostraciones | no disponible en la información |
| ACT agregado del estudio | ACT desde cero | 52M | Igual que este modelo | 34,6% agregado en 3 tareas con 10 demostraciones | apache-2.0 (este repo) |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: ambos difieren en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- No es una política de propósito general: no acepta instrucciones en lenguaje ni generaliza a otras tareas.
- Alta varianza entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta; es imprescindible evaluar el checkpoint concreto antes de usarlo.
- Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de las 10 demostraciones seleccionadas (comportamiento por defecto de LeRobot).
- ACT se entrenó con los valores por defecto de LeRobot y no se ajustó para esta tarea.
- Las 3 tareas del estudio se eligieron entre tareas de LIBERO-Object que un checkpoint publicado de SmolVLA ya resolvía, lo que condiciona la interpretación de los resultados.
- El intervalo de Wilson del 80,7% cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero sí existe riesgo de fallo silencioso en la ejecución de la política fuera de la distribución de las demostraciones.
- Licencia apache-2.0: permite uso comercial, pero el modelo no está validado para producción ni para robótica real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t1_n10_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
