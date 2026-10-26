# Pipe1213/act_obj_t3_n20_s3

## Resumen

ACT (Action Chunking with Transformers) entrenado desde cero sobre una única tarea del benchmark LIBERO-Object en simulación: "pick up the chocolate pudding and place it in the basket" (id de tarea 8 del simulador). Lo publica el usuario Pipe1213 como parte del estudio vla-vs-scratch, que compara un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) con una política entrenada desde cero (ACT) usando exactamente las mismas demostraciones. Este repositorio concreto corresponde a la configuración de 20 demostraciones y semilla 3000, una de las 60 políticas del grid experimental.

No es un modelo de propósito general ni un modelo de lenguaje: es una política de imitación de 51,67 millones de parámetros que consume imágenes de 256x256 píxeles y el estado del robot, y emite secuencias de acciones. Su interés es metodológico, no de producto: sirve para reproducir el estudio y como referencia cuantitativa de lo que rinde ACT con pocos datos frente a un VLA preentrenado.

El resultado principal es modesto: 10,7% de éxito de media en los tres checkpoints evaluados (16 de 150 episodios, intervalo de Wilson al 95% del 7 al 17%), con un 18% para el checkpoint final de 10.000 pasos. En el conjunto del estudio, ACT con 20 demostraciones por tarea promedia 33,1% frente al 74,2% de SmolVLA en las mismas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política transformer con codificador visual ResNet-18 |
| Parametros totales | 51.671.687 (aproximadamente 52 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; genera chunks de 100 acciones y en evaluación re-planifica cada 10 acciones |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | no aplica: la política no recibe entrada de lenguaje y está fijada a una única tarea |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot); checkpoints intermedios en `checkpoints/<step>/pretrained_model` (006000, 008000, 010000) |

## Arquitectura y entrenamiento

ACT es una política de imitación propuesta por Zhao et al. (2023) que predice bloques de acciones futuras en lugar de una acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. En esta implementación se usan los valores por defecto de LeRobot: 52 M de parámetros, chunks de 100 acciones y un codificador de imagen ResNet-18 inicializado con pesos de ImageNet. Todo lo demás se entrena desde cero; el único cambio respecto a los defaults es en evaluación, donde la política re-planifica cada 10 acciones en vez de ejecutar el chunk completo. El estado y las acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados (comportamiento por defecto de LeRobot).

El entrenamiento usa 20 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`; episodios 840, 841, 847, 878, 910, 918, 953, 966, 972, 975, 977, 1048, 1081, 1106, 1138, 1149, 1168, 1210, 1250 y 1259), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 3000. El presupuesto de pasos es idéntico para todos los tamaños de conjunto de demostraciones del estudio, y los conjuntos pequeños están anidados dentro de los grandes. Se ejecutó con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`) y consumió 0,38 h en una RTX 4050 de portátil con 6 GB de VRAM. No se emplearon RLHF, DPO ni ningún otro ajuste posterior al entrenamiento por imitación.

## Capacidades

- Manipulación robótica de una sola tarea en simulación: recoger el pudin de chocolate y depositarlo en la cesta (LIBERO-Object, tarea 8).
- Política de imitación pura: mapea observación visual (256x256) más estado del robot a secuencias de acciones, sin entrada de instrucciones en lenguaje natural.
- Predicción por chunks de 100 acciones, con re-planificación cada 10 acciones durante la evaluación.
- Ejecución determinista sobre los 50 estados iniciales fijos de LIBERO definidos para la tarea.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un controlador de bucle cerrado por pasos de simulación.
- No tiene capacidades multilingües, de visión general, de código, matemáticas ni audio.
- No se ha validado en un robot real.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: el repositorio permite relanzar el comando `lerobot-eval` documentado y verificar el 10,7% de éxito publicado, con los pesos exactos de cada checkpoint.
- Baseline de referencia para comparar políticas desde cero frente a VLA preentrenados: sirve como punto de comparación con SmolVLA bajo las mismas demostraciones y los mismos 50 estados iniciales.
- Ablación del número de demostraciones: al estar anidados los conjuntos del estudio, este checkpoint se puede emparejar con los de 5 y 10 demostraciones para medir la curva datos-rendimiento de ACT.
- Estudio de variabilidad entre checkpoints: con tres checkpoints (6.000, 8.000 y 10.000 pasos) que van del 6% al 18%, es un caso práctico para ilustrar por qué hay que evaluar cada checkpoint antes de usarlo.
- Material docente sobre imitación en robótica: el coste de entrenamiento (0,38 h en una GPU de portátil de 6 GB) hace viable que un alumno entrene y evalúe la política completa en su propio equipo.
- Punto de partida para ajuste fino en tareas de manipulación similares dentro de LIBERO-Object, dado que la licencia Apache 2.0 permite reutilización y modificación sin restricciones.
- Verificación de pipelines de evaluación LeRobot + MuJoCo: el comando de evaluación y la configuración del entorno están documentados al detalle, lo que lo convierte en una prueba de humo para validar una instalación.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (estados 0 a 49), 50 episodios por checkpoint, imágenes de 256x256, re-planificación cada 10 acciones, semilla de evaluación 1000 y renderizado MuJoCo en CPU:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 4 de 50 | 8% |
| 8.000 | 3 de 50 | 6% |
| 10.000 | 9 de 50 | 18% |
| Media de los 3 checkpoints (puntuación del estudio) | 16 de 150 | 10,7% (intervalo de Wilson al 95%: 7-17%) |

Datos de contexto del estudio, agregados sobre sus 3 tareas y todas las semillas de entrenamiento: ACT con 20 demostraciones por tarea alcanza 33,1% y SmolVLA con las mismas demostraciones, 74,2%. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la información disponible, y no aplican a este modelo.

## Requisitos de hardware

- VRAM para inferencia: los 51,67 M de parámetros ocupan aproximadamente 207 MB en fp32; con el codificador ResNet-18, buffers de observación a 256x256 y el entorno de simulación, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: ninguna en particular; el entrenamiento publicado se completó en una RTX 4050 de portátil con 6 GB. Para inferencia, cualquier GPU consumer reciente (serie RTX 30/40, Radeon equivalentes) es suficiente, e incluso una CPU moderna puede ejecutar la política, aunque el cuello de botella estará en el renderizado de MuJoCo.
- Cabe en GPU consumer: sí, sin problema, tanto el entrenamiento (0,38 h en RTX 4050) como la evaluación.
- Opciones de despliegue: `lerobot-eval` con `--env.type=libero` es la vía documentada; el resto de la pila es LeRobot 0.6.2. No hay soporte de vLLM, TGI, llama.cpp u Ollama, que no aplican a una política de robótica en formato LeRobot.
- Latencia y throughput: no disponibles. La evaluación se ejecuta con `--eval.batch_size=1` y renderizado MuJoCo en CPU, lo que convierte el renderizado en el factor dominante del tiempo por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (20 demos, mismas tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT obj_t3_n20_s3 (este modelo) | 51,67 M | Sin lenguaje; imágenes 256x256 + estado, chunks de 100 acciones | 10,7% en esta tarea; 33,1% agregado del estudio | Apache 2.0 | HuggingFace + GitHub |
| SmolVLA (ajustado, mismo estudio) | no disponible | VLA preentrenado con entrada de lenguaje | 74,2% agregado del estudio | no disponible en la información | referenciado en el estudio |
| ACT con otras semillas / tamaños de demostración (mismo estudio) | 51,67 M | Igual que este modelo | variable; en 30 de 36 ejecuciones ACT los checkpoints de una misma corrida difieren notablemente | Apache 2.0 | mismos repositorios del estudio |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren también en tamaño, arquitectura y uso de entrada de lenguaje, tal como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real y no hay garantía de transferencia al mundo físico.
- Una única tarea de un único benchmark (LIBERO-Object, id 8); no generaliza a otras instrucciones ni objetos.
- Rendimiento bajo: 18% en el mejor checkpoint y 10,7% de media, con un intervalo de confianza del 7 al 17% que refleja únicamente el muestreo de evaluación; la variabilidad entre semillas de entrenamiento es mayor.
- Los checkpoints de una misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio), por lo que es obligatorio evaluar cualquier checkpoint antes de usarlo.
- Normalización de estados y acciones calculada con estadísticas de todo `lerobot/libero`, no solo de las 20 demostraciones seleccionadas, lo que introduce una fuga de información del dataset en el pipeline.
- ACT se usó con los valores por defecto de LeRobot y no se ajustó para esta tarea, por lo que el resultado no representa el techo del método.
- Sin condicionamiento por lenguaje: no se puede reutilizar la misma política para otras instrucciones sin reentrenar.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA para LIBERO ya resolvía, lo que sesga el conjunto hacia tareascomparativamente fáciles.
- El tamaño de muestra por checkpoint es de 50 episodios, insuficiente para estimaciones precisas dadas las diferencias observadas entre checkpoints.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo no está pensado ni validado para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_n20_s3
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis detallado: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Referencia del método: Zhao et al., 2023, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (ACT); sin URL en la información disponible.
