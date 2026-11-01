# Pipe1213/act_obj_t2_nall_s2

## Resumen

`Pipe1213/act_obj_t2_nall_s2` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al. 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: coger un trozo de mantequilla y depositarlo en una cesta. Lo desarrolla Pipe1213 como parte del estudio reproducible `vla-vs-scratch`, que compara una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre exactamente las mismas demostraciones. No es un modelo de propósito general: es un artefacto de investigación publicado para que el experimento pueda replicarse.

El modelo tiene 51.671.687 parámetros (52M), emplea un transformer con codificador visual ResNet-18 inicializado con pesos de ImageNet y predice bloques de 100 acciones. Se entrena con 45 episodios del dataset `lerobot/libero` para la tarea LIBERO-Object con id 6, con un presupuesto de 10.000 pasos y batch size 8, completando el entrenamiento en 0,43 horas sobre una RTX 4050 de portátil con 6 GB de VRAM.

Su relevancia es metodológica: proporciona puntos de referencia concretos sobre cuánto rinde una política desde cero con pocas demostraciones frente a un VLA preentrenado. El checkpoint final (10.000 pasos) alcanza un 42% de éxito sobre 50 escenas fijas, mientras que el checkpoint intermedio de 8.000 pasos llega al 98%, lo que ilustra la alta varianza entre checkpoints de un mismo entrenamiento ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador visual ResNet-18 |
| Parametros totales | 51.671.687 (52M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones de imagen 256x256 y estado proprioceptivo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual convolucional (ResNet-18 preentrenado en ImageNet) con un transformer que predice secuencias de acciones en bloque (*action chunking*). En esta configuración se generan chunks de 100 acciones, lo que reduce el error de composición acumulado típico de las políticas que predicen una acción por paso. Todo el modelo, salvo el codificador visual, se entrena desde cero. La única desviación respecto a los valores por defecto de LeRobot es en evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usa 45 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), con batch size 8, 10.000 pasos, checkpoints cada 2.000 pasos y semilla 2000, sobre LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). Los estados y acciones se normalizan con estadísticas del dataset completo, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot. No se aplicó RLHF, DPO ni ajuste específico para la tarea.

## Capacidades

- Ejecución de una única tarea de manipulación robótica en simulación: coger la mantequilla y colocarla en la cesta (LIBERO-Object, task id 6).
- Predicción de acciones en bloques de 100 pasos con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales a 256x256 píxeles junto con el estado proprioceptivo del robot.
- Control de un brazo robótico simulado en MuJoCo mediante el entorno LIBERO.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad fuera del dominio de control motor simulado.

## Casos de uso

- Reproducción del estudio `vla-vs-scratch`: descargar el checkpoint y ejecutar `lerobot-eval` con los mismos parámetros (semilla 1000, 50 episodios, estados iniciales fijos) para verificar los resultados publicados.
- Línea base en investigación de imitación: comparar el rendimiento de una política desde cero con 45 demostraciones frente a alternativas preentrenadas en el mismo conjunto de escenas.
- Análisis de varianza entre checkpoints: el modelo permite estudiar por qué un checkpoint de 8.000 pasos logra 98% y el final de 10.000 pasos cae al 42%, un fenómeno relevante para el diseño de protocolos de selección de checkpoints.
- Docencia y formación en robótica: ejemplo mínimo y reproducible (0,43 h en una RTX 4050) de un pipeline completo LeRobot de entrenamiento y evaluación en simulación.
- Validación de infraestructura: probar entornos de evaluación LIBERO/MuJoCo y flujos de `lerobot-train`/`lerobot-eval` antes de escalar a modelos mayores.
- Estudio de normalización de datos: analizar el impacto de normalizar estados y acciones con estadísticas del dataset completo frente a las de los episodios seleccionados.
- Referencia para calibración de presupuestos de entrenamiento: el modelo permite medir cuánto rinde ACT con 10.000 pasos y 45 demostraciones en una tarea concreta antes de invertir en configuraciones mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), con imágenes de 256x256 y replanificación cada 10 acciones:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 9 de 50 | 18% |
| 8.000 | 49 de 50 | 98% |
| 10.000 (raíz del repo) | 21 de 50 | 42% |
| Media de los 3 checkpoints | 79 de 150 | 52,7% (intervalo de Wilson 95%: 45–60%) |

Contexto agregado del estudio (3 tareas, todas las semillas de entrenamiento): ACT con todas las demostraciones (45–50 por tarea) obtuvo 55,4%; SmolVLA con las mismas demostraciones obtuvo 87,3%. El intervalo de Wilson cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 52M parámetros y el repo pesa 0,6 GB. Entrenamiento completo en una RTX 4050 de portátil con 6 GB en 0,43 h.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB (RTX 4050, RTX 3060, RTX 4060, RTX 4090) es suficiente tanto para entrenamiento como para inferencia.
- Cabe holgadamente en GPU consumer; también puede ejecutarse en CPU para inferencia, aunque el cuello de botella real es el renderizado de MuJoCo (el autor lo ejecutó en CPU bajo WSL2).
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno `libero`; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; la evaluación de 50 episodios se realizó con `eval.batch_size=1` y renderizado MuJoCo en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 52M | Imagen 256x256 + estado; chunk de 100 acciones | 52,7% medio (3 checkpoints); 55,4% agregado con todas las demos | Apache 2.0 | HuggingFace, LeRobot |
| SmolVLA (fine-tuned, referencia del estudio) | no disponible en la información | VLA preentrenado con entrada de lenguaje | 87,3% agregado con las mismas demos | no disponible en la información | Referenciado en el estudio `vla-vs-scratch` |
| ACT con menos demostraciones (mismo estudio) | 52M | Igual que este modelo | Inferior al 55,4% agregado con todas las demos | Apache 2.0 | Mismo repositorio del estudio |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren en tamaño, arquitectura y entrada de lenguaje, tal como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no probado en robot real.
- El checkpoint de la raíz del repositorio (10.000 pasos) rinde al 42%, muy por debajo del de 8.000 pasos (98%); es imprescindible evaluar cada checkpoint antes de usarlo.
- Alta varianza entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones ACT del estudio se observó este patrón.
- La comparación con SmolVLA no permite atribuir la diferencia únicamente al preentrenamiento, por las diferencias de arquitectura, tamaño y entrada de lenguaje.
- Las tareas se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga la selección.
- Normalización con estadísticas del dataset completo, no de las demostraciones seleccionadas, lo que puede afectar la transferibilidad.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- No procesa lenguaje: la tarea está codificada en los pesos, no en un prompt.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es funcional fuera de su tarea y entorno simulados.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje; el fallo se manifiesta como acciones incorrectas o trayectorias fallidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t2_nall_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada
