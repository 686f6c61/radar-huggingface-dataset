# Pipe1213/act_obj_t3_n10_s2

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero sobre una única tarea del benchmark LIBERO-Object: "coger el pudin de chocolate y depositarlo en la cesta". Lo publica el usuario Pipe1213 como parte del estudio reproducible [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que compara una política preentrenada de tipo vision-language-action (SmolVLA) con una política entrenada desde cero (ACT) sobre exactamente las mismas 10 demostraciones. Este repositorio es uno de los 60 checkpoints del estudio y existe para permitir la reproducción del experimento, no como política de propósito general.

El modelo tiene 51.671.687 parámetros (52M), emplea un encoder visual ResNet-18 inicializado con pesos de ImageNet y predice trozos de 100 acciones. Se entrenó con LeRobot 0.6.2 durante 10.000 pasos, batch de 8, semilla 2000, en 0,42 horas sobre una RTX 4050 de portátil (6 GB). El checkpoint de la raíz del repositorio corresponde al paso 10.000 y alcanza un 68% de éxito sobre los 50 estados iniciales fijos de la tarea.

Su relevancia es metodológica: cuantifica cuánto rinde una política desde cero frente a una preentrenada en el régimen de pocas demostraciones (few-shot). En el agregado del estudio, ACT con 10 demostraciones por tarea obtuvo un 34,6% frente al 82,4% de SmolVLA, una brecha que conviene leer con cautela porque los dos métodos difieren también en tamaño, arquitectura y entrada de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 (52M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no procesa contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no recibe entrada de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot; 0,6 GB) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que mapea observaciones (imágenes de 256×256 más estado del robot) a secuencias de acciones. La implementación sigue los valores por defecto de LeRobot: encoder ResNet-18 preentrenado en ImageNet, predicción de chunks de 100 acciones y el resto de los componentes entrenados desde cero. En evaluación el modelo replanifica cada 10 acciones en lugar de ejecutar el chunk completo, único cambio respecto a los valores por defecto.

El entrenamiento usa 10 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`): 841, 910, 918, 953, 966, 975, 1048, 1149, 1210 y 1250. Configuración: batch 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 2000, 4 workers, `policy.type=act`, dispositivo CUDA. No se aplicó ajuste de hiperparámetros específico para la tarea. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados. No hay RLHF, DPO ni entrenamiento con preferencias: es imitación supervisada pura.

## Capacidades

- Control robótico por imitación en simulación: genera trayectorias de acción de 7 grados de libertad a partir de imágenes y estado del robot.
- Manipulación pick-and-place de un único objeto (pudin de chocolate) hacia una cesta en el simulador LIBERO.
- Predicción de chunks de 100 acciones con replanificación cada 10 pasos.
- Percepción visual a partir de imágenes RGB de 256×256 mediante ResNet-18.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües ni entrada de lenguaje natural.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: cargar el checkpoint con `lerobot-eval` y verificar el 68% de éxito sobre los estados iniciales 0 a 49 de LIBERO-Object, tarea 8.
- Línea base en experimentos de imitación few-shot: sirve como referencia de política desde cero frente a modelos preentrenados tipo VLA con las mismas 10 demostraciones.
- Análisis de sensibilidad a checkpoints: comparar los pasos 6.000 (22%), 8.000 (44%) y 10.000 (68%) para estudiar la varianza intra-entrenamiento, documentada como muy alta en ACT.
- Docencia y divulgación sobre Action Chunking Transformer: ejemplo mínimo (52M parámetros, 0,42 h de entrenamiento en una GPU de 6 GB) para explicar imitación con chunks de acciones.
- Pruebas de pipelines de evaluación en LeRobot: validar flujos `lerobot-train` / `lerobot-eval` con el entorno `libero` y renderizado MuJoCo en CPU.
- Estudio de normalización de estados y acciones: analizar el efecto de usar estadísticas del dataset completo frente a las de los episodios seleccionados.
- Prototipado de agentes manipuladores en simulación antes de invertir en políticas preentrenadas de mayor tamaño.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO-Object (tarea 8), 50 episodios por checkpoint, imágenes de 256×256, replanificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 11 de 50 | 22% |
| 8.000 | 22 de 50 | 44% |
| 10.000 | 34 de 50 | 68% |
| Media de los 3 checkpoints | 67 de 150 | 44,7% (IC Wilson 95%: 37–53%) |

Contexto agregado del estudio: ACT con 10 demostraciones por tarea, promediado sobre 3 tareas y todas las semillas, 34,6%; SmolVLA con las mismas demostraciones, 82,4%. No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible, ni procede aplicarlos a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el entrenamiento completo cupo en una RTX 4050 de 6 GB, por lo que la inferencia cabe holgadamente en GPUs de 4–6 GB.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, 4050, 4060, 4090); también es viable en CPU para evaluación, ya que el cuello de botella documentado es el renderizado MuJoCo en CPU (WSL2), no la política.
- Cabe en GPU consumer: sí, sin cuantización; el repo pesa 0,6 GB.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con `--policy.path=Pipe1213/act_obj_t3_n10_s2` y entorno `libero`; los checkpoints intermedios están en `checkpoints/<step>/pretrained_model`.
- Latencia y throughput: no disponibles de forma explícita; el dato de referencia es 0,42 h de entrenamiento (10.000 pasos, batch 8) en una RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Entrada de lenguaje | Éxito (estudio, 10 demos) | Licencia |
|---|---|---:|---|---:|---|
| Este modelo (ACT, tarea 8) | 52M | Desde cero, imitación | No | 68% en su tarea; 44,7% media de checkpoints | Apache 2.0 |
| ACT (agregado del estudio) | 52M | Desde cero, imitación | No | 34,6% (3 tareas, todas las semillas) | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la información | VLA preentrenado y ajustado | Sí | 82,4% (3 tareas, todas las semillas) | no disponible en la información |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: difieren en tamaño, arquitectura y disponibilidad de entrada de lenguaje, tal como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación: una única tarea de un único benchmark; no se ha probado en un robot real.
- No es una política de propósito general; el autor la publica únicamente para reproducibilidad.
- Alta varianza entre checkpoints: en 30 de 36 ejecuciones de ACT del estudio, checkpoints de la misma run rinden de forma muy distinta. Evalúe siempre el checkpoint antes de usarlo.
- El intervalo de Wilson del 44,7% cubre solo el muestreo de evaluación; la variación entre semillas de entrenamiento es mayor.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización con estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas; puede afectar a la transferencia a otros subconjuntos.
- Sin ajuste de hiperparámetros: se usaron los valores por defecto de LeRobot.
- Sin entrada de lenguaje: no admite instrucciones en lenguaje natural ni cambio de tarea en tiempo de ejecución.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incoherentes fuera de la distribución de demostraciones.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción ni para entornos físicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_n10_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada
