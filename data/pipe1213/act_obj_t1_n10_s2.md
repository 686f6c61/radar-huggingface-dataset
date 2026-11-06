# Pipe1213/act_obj_t1_n10_s2

## Resumen

`act_obj_t1_n10_s2` es una política de imitación basada en ACT (Action Chunking Transformer, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: recoger una salsa barbacoa y depositarla en una cesta. Forma parte de las 60 políticas del estudio comparativo [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que contrasta un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero sobre las mismas pocas demostraciones. El autor es Pipe1213 y el modelo se publica con fines de reproducibilidad, no como política de propósito general.

El modelo tiene 51.671.687 parámetros (52M), emplea un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y predice bloques de 100 acciones. Se entrenó con solo 10 episodios del dataset `lerobot/libero` durante 10.000 pasos, con un coste de cómputo de 0,43 horas en una GPU de portátil RTX 4050 de 6 GB. En la evaluación sobre los 50 estados iniciales fijos de la tarea alcanza una tasa de éxito media del 78% (117 de 150 episodios) promediando tres checkpoints.

Su relevancia es metodológica: sirve como referencia cuantitativa de lo que consigue una política pequeña entrenada desde cero con pocas demostraciones frente a un VLA preentrenado, y como ejemplo reproducible de un pipeline completo de LeRobot para robótica en simulación. No es un modelo de lenguaje ni un sistema multimodal general: su salida son acciones de robot de 7 dimensiones en el simulador LIBERO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder ResNet-18 |
| Parámetros totales | 51.671.687 (52M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones de imagen 256x256 y estado del robot) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación robótica que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. En esta implementación se usan los ajustes por defecto de LeRobot: chunks de 100 acciones, encoder de imagen ResNet-18 preentrenado en ImageNet y el resto de pesos entrenados desde cero. El estado y las acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

El entrenamiento usó 10 episodios concretos del dataset `lerobot/libero` (IDs 843, 853, 871, 889, 893, 932, 1005, 1067, 1077 y 1235), batch size 8, 10.000 pasos, semilla 2000 y checkpoints cada 2.000 pasos, con LeRobot 0.6.2 en el commit `b9cb121`. No hay RLHF, DPO ni ajuste fino posterior: es imitación supervisada pura sobre demostraciones. La única desviación respecto a los valores por defecto está en evaluación, donde la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: recoger la salsa barbacoa y colocarla en la cesta (tarea 3 de LIBERO-Object).
- Predicción de chunks de 100 acciones a partir de observaciones de imagen (256x256) y estado del robot.
- Control de un brazo robótico simulado en MuJoCo a través del entorno LIBERO.
- Replanificación periódica cada 10 acciones para corregir desviaciones durante la ejecución.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen de observación.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como baseline entrenado desde cero para comparar con VLAs preentrenados en el mismo conjunto de demostraciones, usando el pipeline de LeRobot y el dataset `lerobot/libero`.
- Estudio del efecto del número de demostraciones: al formar parte de una cuadrícula de 60 políticas con distintos tamaños de dataset y semillas, permite analizar la varianza entre semillas y la sensibilidad a los datos.
- Validación de pipelines de entrenamiento en hardware modesto: con 0,43 h en una RTX 4050 de 6 GB, es útil para probar configuraciones de LeRobot antes de escalar a GPUs mayores.
- Docencia y formación en robótica: ejemplo completo y reproducible de entrenamiento y evaluación de una política ACT en simulación con comandos `lerobot-train` y `lerobot-eval`.
- Referencia para selección de checkpoints: el estudio documenta que los checkpoints de una misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones ACT), por lo que este modelo ilustra la necesidad de evaluar cada checkpoint antes de desplegarlo.
- Investigación sobre brecha simulación-realidad: al estar limitado a simulación, sirve como punto de partida para estudiar qué hace falta para transferir políticas ACT a un robot físico.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (estados 0 a 49), imágenes de 256x256, replanificación cada 10 acciones, semilla de evaluación 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 41 de 50 | 82% |
| 8.000 | 33 de 50 | 66% |
| 10.000 | 43 de 50 | 86% |
| Media de los 3 checkpoints | 117 de 150 | 78% (intervalo de Wilson 95%: 71-84%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas): ACT con 10 demostraciones por tarea obtuvo 34,6%, frente a 82,4% de SmolVLA con las mismas demostraciones. El intervalo de Wilson cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB para los 52M parámetros en precisión completa; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4050 (6 GB) o superior para entrenamiento; para inferencia basta una GPU integrada o incluso CPU en el renderizado MuJoCo.
- Cabe en GPU consumer: sí, el entrenamiento documentado se realizó en una RTX 4050 de portátil con 6 GB.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno `libero` y renderizado MuJoCo; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste de entrenamiento documentado es de 0,43 h para 10.000 pasos con batch size 8.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Tasa de éxito (estudio) | Licencia |
|---|---|---:|---|---|
| `act_obj_t1_n10_s2` (este) | 52M | ACT desde cero, 10 demos, tarea 3 | 78% (media de 3 checkpoints, 50 escenas) | Apache 2.0 |
| ACT agregado del estudio | 52M | ACT desde cero, 10 demos, 3 tareas | 34,6% | Apache 2.0 |
| SmolVLA agregado del estudio | no disponible en la información | VLA preentrenado, 10 demos, 3 tareas | 82,4% | no disponible en la información |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: ambos difieren también en tamaño, arquitectura y entrada de lenguaje, como advierte el propio autor. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real y no hay evidencia de transferencia simulación-realidad.
- Una única tarea de un único benchmark (LIBERO-Object, tarea 3); no generaliza a otras instrucciones ni objetos.
- Alta varianza entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta, por lo que hay que evaluar cada uno antes de usarlo.
- La comparación con SmolVLA no permite atribuir la diferencia solo al preentrenamiento, ya que los modelos difieren en tamaño, arquitectura y entrada de lenguaje.
- Las 3 tareas se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización de estados y acciones con estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas, lo que puede introducir desajustes si se reutiliza fuera de ese dataset.
- ACT se entrenó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Riesgo de alucinación no aplica (no genera texto); el riesgo equivalente es la ejecución de acciones incorrectas fuera de la distribución de demostraciones.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero el modelo carece de utilidad comercial fuera del simulador y de la tarea entrenada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t1_n10_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
