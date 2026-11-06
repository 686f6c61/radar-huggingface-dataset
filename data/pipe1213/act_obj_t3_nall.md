# Pipe1213/act_obj_t3_nall

## Resumen

`Pipe1213/act_obj_t3_nall` es una política de imitación ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: coger un pudin de chocolate y depositarlo en una cesta. Forma parte del estudio comparativo `vla-vs-scratch`, que contrasta un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero sobre las mismas demostraciones, con el objetivo de aislar el efecto del preentrenamiento en regímenes de pocos datos.

El modelo tiene 51.671.687 parámetros (52M según el autor), emplea un encoder visual ResNet-18 inicializado con pesos de ImageNet y predice secuencias de 100 acciones (action chunks). Se entrenó con 50 episodios del dataset `lerobot/libero` durante 10.000 pasos con batch size 8, un coste computacional de 0,40 horas en una RTX 4050 de portátil (6 GB).

Su relevancia es metodológica, no de producto: se publica para hacer reproducible un estudio sobre cuánto aporta realmente el preentrenamiento a gran escala en políticas robóticas con pocas demostraciones. El autor advierte explícitamente que no es una política de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones imagen + estado y chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea está fijada en entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imágenes de 256×256 píxeles más el estado del robot) a secuencias de acciones. En esta implementación se usa la configuración por defecto de LeRobot: chunks de 100 acciones, ResNet-18 preentrenado en ImageNet como encoder visual y el resto de componentes entrenados desde cero. El único cambio respecto a los valores por defecto se produce en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento emplea 50 episodios concretos del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), correspondientes a la tarea LIBERO-Object con id 8. Se realizaron 10.000 pasos con batch size 8, semilla 1000 y checkpoints cada 2.000 pasos, usando LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No se aplicó RLHF ni DPO: es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: "coger el pudin de chocolate y ponerlo en la cesta" (LIBERO-Object, task id 8).
- Predicción de acciones en chunks de 100 pasos con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales RGB a 256×256 píxeles junto con el estado del robot.
- Aprendizaje por imitación a partir de demostraciones (50 episodios).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la política robótica entrenada.

## Casos de uso

- Reproducción de experimentos de investigación: permite replicar exactamente los resultados del estudio `vla-vs-scratch` cargando el checkpoint y ejecutando el comando `lerobot-eval` documentado, útil para validar comparativas entre ACT y SmolVLA.
- Línea base en estudios de imitation learning: sirve como referencia de política entrenada desde cero frente a modelos preentrenados en benchmarks de manipulación con pocos datos.
- Docencia y formación en robótica: ejemplo completo y ligero (52M parámetros, 0,6 GB) para ilustrar el pipeline de LeRobot, desde el entrenamiento hasta la evaluación en MuJoCo.
- Pruebas de infraestructura de evaluación: al tener checkpoints intermedios (6.000, 8.000 y 10.000 pasos) con tasas de éxito muy distintas, es útil para verificar que un pipeline de evaluación detecta correctamente la variabilidad entre checkpoints.
- Análisis de sensibilidad al número de demostraciones: el estudio entrena variantes con subconjuntos anidados de episodios, y este modelo (50 episodios) sirve como extremo superior de esa comparación.
- Benchmarking de hardware de bajo coste: con 0,40 h de entrenamiento en una RTX 4050, es un caso práctico para medir rendimiento de entrenamiento en GPUs de consumo.
- No es adecuado para despliegue en robot real ni para tareas distintas a la entrenada.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), 50 episodios por checkpoint, imágenes de 256×256, replanificación cada 10 acciones, semilla de evaluación 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 41 de 50 | 82% |
| 8.000 | 24 de 50 | 48% |
| 10.000 | 29 de 50 | 58% |
| Media de los 3 checkpoints | 94 de 150 | 62,7% (intervalo de Wilson 95%: 55–70%) |

Contexto comparativo del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento, con 45–50 demostraciones por tarea):

| Método | Tasa de éxito agregada |
|---|---:|
| ACT desde cero (todas las demostraciones) | 55,4% |
| SmolVLA preentrenado (mismas demostraciones) | 87,3% |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 52M parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entrenó en una RTX 4050 de portátil con 6 GB.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas GPUs integradas para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno MuJoCo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. El coste de entrenamiento documentado es de 0,40 h para 10.000 pasos en una RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tasa de éxito (estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Pipe1213/act_obj_t3_nall` (ACT) | 51,7M | Imagen 256×256 + estado, chunks de 100 acciones | 62,7% (media de 3 checkpoints, 1 tarea) | Apache 2.0 | Hugging Face, 22 descargas |
| SmolVLA (preentrenado, mismo estudio) | no disponible en la información | Visión-lenguaje-acción | 87,3% (agregado 3 tareas) | no disponible en la información | no disponible en la información |
| ACT con todas las demostraciones (agregado del estudio) | 52M (configuración LeRobot) | Igual que este modelo | 55,4% (agregado 3 tareas) | no disponible en la información | no disponible en la información |

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, task id 8); no generaliza a otras tareas ni objetos.
- Alta varianza entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta. Es imprescindible evaluar un checkpoint antes de usarlo.
- La comparación con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren en tamaño, arquitectura y entrada de lenguaje.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que puede sesgar los resultados.
- Normalización con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de acciones erráticas fuera de la distribución de demostraciones.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es funcional fuera de su tarea y entorno de simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t3_nall
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible enlace directo en la información proporcionada
