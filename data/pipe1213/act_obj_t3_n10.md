# Pipe1213/act_obj_t3_n10

## Resumen

ACT_obj_t3_n10 es una política de imitación para robótica entrenada desde cero con el algoritmo ACT (Action Chunking Transformer, Zhao et al., 2023) sobre una única tarea del benchmark LIBERO-Object: "coger el pudin de chocolate y depositarlo en la cesta" (task id 8). Lo publica el usuario Pipe1213 como parte del estudio reproducible vla-vs-scratch, que compara una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) usando exactamente las mismas diez demostraciones. No es una política de propósito general: es un artefacto de investigación para reproducir un resultado concreto.

El modelo tiene 51.671.687 parámetros (unos 52M), emplea un transformer con codificador visual ResNet-18 inicializado con pesos de ImageNet y predice trozos de 100 acciones. Se entrenó durante 10.000 pasos con batch de 8 en una RTX 4050 de portátil (6 GB), con un coste de cómputo de 0,40 horas. El checkpoint raíz del repositorio es el de 10.000 pasos, que obtuvo un 20% de éxito sobre los 50 estados iniciales fijos de la tarea.

Su relevancia es metodológica: sirve como referencia empírica de hasta dónde llega una política desde cero con pocas demostraciones frente a un VLA preentrenado, y documenta un fenómeno práctico importante (la alta varianza entre checkpoints de una misma ejecución de ACT). La licencia es Apache 2.0 y el formato de pesos es safetensors dentro de la librería LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con codificador visual ResNet-18 preentrenado en ImageNet |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imágenes 256x256 y estado del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot; checkpoints en `checkpoints/<step>/pretrained_model`) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imágenes de 256x256 píxeles y estado del robot) a secuencias de acciones en forma de *action chunks*: el modelo predice bloques de 100 acciones de una vez en lugar de una acción por paso. El codificador visual es un ResNet-18 inicializado con pesos de ImageNet; el resto de la red se entrena desde cero. En evaluación se usa *re-planning* cada 10 acciones en lugar de ejecutar el chunk completo, lo que es la única desviación respecto a los ajustes por defecto de LeRobot.

El entrenamiento usó 10 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), concretamente los episodios 841, 910, 918, 953, 966, 975, 1048, 1149, 1210 y 1250. Configuración: batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 1000, LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No se aplicó RLHF, DPO ni ajuste específico para la tarea; se usaron los valores por defecto de LeRobot. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger el pudin de chocolate y colocarlo en la cesta (LIBERO-Object, task id 8).
- Control visomotor a partir de imágenes RGB de 256x256 y del estado del robot.
- Predicción de secuencias de acciones en chunks de 100, con re-planificación cada 10 acciones en evaluación.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni entrada de lenguaje: la instrucción está implícita en el entrenamiento.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades fuera de la observación visual de la simulación.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: ejecutar `lerobot-eval` con este checkpoint para verificar el 20% de éxito del checkpoint de 10.000 pasos sobre los estados iniciales 0-49 de LIBERO-Object.
- Línea base de comparación para políticas desde cero: usar sus resultados (12,7% de media en tres checkpoints) como referencia al evaluar variantes de ACT con más demostraciones o distinto número de pasos.
- Estudio de la varianza entre checkpoints: comparar los checkpoints de 6.000 (12%), 8.000 (6%) y 10.000 pasos (20%) para ilustrar por qué es obligatorio evaluar cada checkpoint antes de desplegarlo.
- Docencia y formación en imitación robótica: el entrenamiento completo cabe en una RTX 4050 de 6 GB en 0,40 horas, lo que lo hace apto para prácticas de laboratorio sobre ACT y LeRobot.
- Análisis de brecha preentrenamiento vs. desde cero: contrastar este resultado con SmolVLA sobre las mismas diez demostraciones (82,4% agrupado en las tres tareas del estudio) para cuantificar el efecto del preentrenamiento.
- Validación de pipelines de evaluación en MuJoCo/LIBERO: servir de caso de prueba para configurar `lerobot-eval` con `--env.init_states=true`, renderizado en CPU y semilla fija.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO-Object (task id 8), 50 episodios por checkpoint, imágenes de 256x256, re-planificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 6 de 50 | 12% |
| 8.000 | 3 de 50 | 6% |
| 10.000 | 10 de 50 | 20% |
| Media de los 3 checkpoints | 19 de 150 | 12,7% (intervalo de Wilson al 95%: 8-19%) |

Contexto del estudio (agrupado sobre 3 tareas y todas las semillas de entrenamiento): ACT con 10 demostraciones por tarea obtuvo 34,6%; SmolVLA con las mismas demostraciones, 82,4%. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 6 GB; el entrenamiento completo cupo en una RTX 4050 de 6 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB (RTX 4050, RTX 3060, RTX 4060, RTX 4090); también válida en CPU para evaluación, ya que el estudio renderiza MuJoCo en CPU bajo WSL2.
- Cabe en GPU consumer: sí, con margen amplio dado el tamaño de 52M parámetros.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path=Pipe1213/act_obj_t3_n10`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El coste de entrenamiento documentado es de 0,40 horas en una RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Resultado en el estudio | Licencia |
|---|---|---|---|---|
| ACT_obj_t3_n10 (este) | 52M | ACT desde cero, 10 demos, 1 tarea | 12,7% medio (20% en el checkpoint final) | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la información | VLA preentrenado y ajustado, mismas 10 demos | 82,4% agrupado en 3 tareas | no disponible en la información |
| ACT con 10 demos, agrupado en 3 tareas | 52M | ACT desde cero | 34,6% | Apache 2.0 |

No se dispone de datos de otros modelos comparables (por ejemplo, Diffusion Policy u otras políticas de LIBERO) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- El checkpoint de 8.000 pasos rinde mucho peor (6%) que el de 10.000 (20%): en 30 de las 36 ejecuciones de ACT del estudio los checkpoints de una misma ejecución difieren notablemente, por lo que hay que evaluar cada checkpoint antes de usarlo.
- La comparación con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren también en tamaño, arquitectura y entrada de lenguaje.
- Las tres tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA para LIBERO ya resolvía, así que los resultados describen esas tareas concretas.
- Los estados y acciones se normalizan con estadísticas de todo `lerobot/libero`, no solo de las diez demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste para esta tarea.
- El intervalo de Wilson del 12,7% cubre solo el muestreo de evaluación; la variación entre semillas de entrenamiento es mayor.
- No apta como política de propósito general ni para instrucciones en lenguaje natural; la tarea está fijada en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción fuera de la simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t3_n10
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
