# Pipe1213/act_obj_t3_n05_s3

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero sobre una única tarea del benchmark LIBERO-Object: "coger el pudin de chocolate y depositarlo en la cesta" (task id 8). Lo publica el usuario Pipe1213 como parte del estudio reproducible `vla-vs-scratch`, que compara un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) usando exactamente las mismas cinco demostraciones. No es una política de propósito general: es un artefacto de investigación para reproducir resultados.

El modelo tiene 51,7 millones de parámetros, emplea un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y predice trozos (chunks) de 100 acciones. Se entrenó con LeRobot 0.6.2 (commit `b9cb121`) durante 10.000 pasos con batch de 8 y semilla 3000, en 0,37 horas sobre una RTX 4050 de portátil (6 GB de VRAM). El repositorio ocupa 0,6 GB e incluye checkpoints intermedios en `checkpoints/<step>/pretrained_model`.

Su relevancia es metodológica: cuantifica cuánto rinde la imitación desde cero con muy pocos datos frente a un VLA preentrenado. En la evaluación del estudio, ACT con 5 demostraciones por tarea promedió un 17,9% de éxito, mientras que SmolVLA con las mismas demostraciones alcanzó un 78%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): transformer con encoder visual ResNet-18 y decodificador de acciones por chunks |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; condiciona sobre observaciones visuales y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada por el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT sigue el diseño de Zhao et al. (2023): un encoder visual ResNet-18 preentrenado en ImageNet que extrae características de la imagen (256x256 píxeles), un encoder transformer que fusiona la observación con el estado propioceptivo y un decodificador transformer que emite chunks de 100 acciones de forma no autorregresiva. El resto de los pesos, salvo el backbone visual, se entrena desde cero. La única desviación respecto a los valores por defecto de LeRobot es en evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

Los datos son 5 episodios del dataset `lerobot/libero` (revisión `a1aaacb7`), concretamente los episodios 841, 910, 975, 1149 y 1210 del subconjunto LIBERO-Object. El entrenamiento usó batch de 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 3000, con el mismo presupuesto de pasos para todos los tamaños de conjunto de demostraciones del estudio. No hay RLHF ni DPO: es imitación supervisada pura (behavior cloning). Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger el pudin de chocolate y colocarlo en la cesta.
- Control visuomotor a partir de imágenes RGB de 256x256 y estado del robot, con predicción de chunks de 100 acciones.
- Replanificación cada 10 acciones durante la evaluación, lo que permite cierta corrección reactiva dentro de la ejecución.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa instrucciones en lenguaje natural: la tarea está codificada en los pesos.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación: sirve para replicar el resultado de ACT con 5 demostraciones en LIBERO-Object task 8 usando el comando `lerobot-eval` documentado, y comparar contra SmolVLA en las mismas condiciones.
- Línea base en estudios de VLA frente a políticas desde cero: es una de las 60 políticas del grid del estudio `vla-vs-scratch`, útil como referencia cuantitativa (26,7% de media en sus tres checkpoints) al diseñar nuevos experimentos.
- Docencia y formación en robótica: permite mostrar en un portátil con GPU de 6 GB el ciclo completo de entrenamiento y evaluación de una política visuomotora en menos de una hora de cómputo.
- Pruebas de infraestructura de evaluación: al ejecutarse con MuJoCo en CPU y renderizado a 256x256, sirve para validar pipelines de `lerobot-eval` y entornos LIBERO antes de lanzar modelos mayores.
- Análisis de variabilidad entre checkpoints: dado que ACT muestra dispersión grande entre checkpoints del mismo run (en 30 de 36 runs del estudio), el modelo es útil para estudiar estrategias de selección de checkpoint.
- Prototipado de políticas de manipulación en simulación: como punto de partida para experimentar con número de demostraciones, semillas y presupuestos de pasos sin coste elevado de cómputo.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), 50 episodios por checkpoint, imágenes de 256x256, replanificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 6 de 50 | 12% |
| 8.000 | 17 de 50 | 34% |
| 10.000 | 17 de 50 | 34% |
| Media de los 3 checkpoints | 40 de 150 | 26,7% (intervalo de Wilson 95%: 20-34%) |

Contexto del estudio: agregando las 3 tareas y todas las semillas de entrenamiento, ACT con 5 demostraciones por tarea obtuvo un 17,9% y SmolVLA con las mismas demostraciones un 78%. El intervalo de Wilson solo cubre el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM para inferencia: muy baja; el modelo tiene 51,7 M de parámetros (unos 0,2 GB en fp32) más el encoder ResNet-18. Cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el entrenamiento documentado se hizo en una RTX 4050 de portátil con 6 GB en 0,37 horas. Para evaluación no se requiere GPU: MuJoCo renderiza en CPU (WSL2 en el estudio).
- Cabe en GPU consumer: sí, en RTX 3050/4050/4060 y superiores; también en GPUs de gama baja con al menos 4 GB.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno `libero`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. La evaluación se ejecuta con batch de 1 y renderizado en CPU, lo que domina el tiempo por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Entrenamiento | Éxito en el estudio (5 demos) | Licencia |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | Imagen 256x256 + estado | Desde cero, 5 demos, 10.000 pasos | 26,7% en esta tarea; 17,9% agregado en 3 tareas | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | Visión + lenguaje + estado | Preentrenado y ajustado con las mismas 5 demos | 78% agregado en 3 tareas | no disponible en la información proporcionada |
| Otras políticas ACT del grid `vla-vs-scratch` | 51,7 M | Imagen + estado | Desde cero, distintas semillas y números de demos | Variables; 30 de 36 runs muestran gran dispersión entre checkpoints | Apache 2.0 |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren también en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- No es una política de propósito general: no acepta instrucciones en lenguaje natural ni generaliza a otras tareas.
- La comparación con SmolVLA del estudio mezcla preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje; el autor lo señala explícitamente.
- Las 3 tareas se eligieron entre las que un checkpoint publicado de SmolVLA para LIBERO ya resolvía, lo que sesga los resultados hacia esas tareas.
- Los estados y acciones se normalizan con estadísticas de todo `lerobot/libero`, no solo de los episodios usados, lo que puede introducir desajustes si se reutiliza fuera de ese dataset.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Alta variabilidad entre checkpoints del mismo run: en 30 de 36 runs de ACT del estudio los checkpoints rinden de forma muy distinta; hay que evaluar cada checkpoint antes de usarlo.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su utilidad práctica fuera de la reproducción del estudio es mínima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_n05_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada
