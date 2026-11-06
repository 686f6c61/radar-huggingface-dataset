# Pipe1213/act_obj_t1_nall_s2

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero sobre una única tarea del benchmark LIBERO-Object: recoger una botella de salsa barbacoa y colocarla en una cesta. Lo publica el usuario Pipe1213 como parte del estudio reproducible `vla-vs-scratch`, que compara un modelo vision-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) usando las mismas demostraciones. No es una política de propósito general: es un artefacto de investigación pensado para replicar resultados.

El modelo tiene 51.671.687 parámetros (52M, según la model card), emplea un encoder visual ResNet-18 inicializado con pesos de ImageNet y predice secuencias de 100 acciones (action chunks). Se entrenó con 46 episodios del dataset `lerobot/libero` durante 10.000 pasos con batch size 8, en 0,43 horas sobre una RTX 4050 de portátil (6 GB de VRAM). La relevancia actual es metodológica: cuantifica cuánto rinde la imitación desde cero frente a un VLA preentrenado en un régimen de pocos datos.

El checkpoint publicado en la raíz del repositorio corresponde al paso 10.000 y obtuvo un 62% de éxito (31 de 50 escenas). La media de los tres checkpoints evaluados (6.000, 8.000 y 10.000 pasos) es del 72,7% (109 de 150 episodios, intervalo de Wilson del 95%: 65-79%). El estudio completo sitúa a ACT con todas las demostraciones en un 55,4% de media agregada, frente al 87,3% de SmolVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): transformer con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 (52M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación con observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,6 GB) |

## Arquitectura y entrenamiento

ACT sigue el diseño de Zhao et al. (2023): un encoder visual ResNet-18 preentrenado en ImageNet que procesa observaciones de 256x256 píxeles, un transformer que fusiona la representación visual con el estado del robot y una cabeza que predice *chunks* de 100 acciones. Todo el modelo, salvo el encoder visual, se entrena desde cero. La configuración es la de LeRobot por defecto (LeRobot 0.6.2, commit `b9cb121`), sin ajuste específico para la tarea; el único cambio respecto a los valores por defecto se produce en evaluación, donde la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usó 46 episodios concretos del dataset `lerobot/libero` (revisión `a1aaacb7`), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 2000. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados (comportamiento por defecto de LeRobot). No se aplicó RLHF, DPO ni ninguna fase de alineamiento: es imitación supervisada pura sobre demostraciones.

## Capacidades

- Control robótico de manipulación en simulación para una única tarea: coger la botella de salsa barbacoa y depositarla en la cesta (LIBERO-Object, task id 3).
- Predicción de secuencias de acciones (action chunking) de 100 pasos con replanificación configurable (10 acciones en la evaluación publicada).
- Procesamiento de observaciones visuales RGB de 256x256 junto con el estado proprioceptivo del robot.
- Ejecución de política de imitación entrenada desde cero, sin conocimiento previo de lenguaje ni de tareas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo *thinking*, visión general, audio ni ninguna capacidad fuera del bucle percepción-acción entrenado.

## Casos de uso

- Reproducción del estudio `vla-vs-scratch`: cargar el checkpoint con `lerobot-eval` y verificar la tasa de éxito del 62% sobre las 50 escenas fijas de LIBERO, para validar la comparación ACT frente a SmolVLA.
- Línea base en experimentos de imitación desde cero: usar este modelo como referencia de 52M parámetros y 46 demostraciones al evaluar variantes de arquitectura o de número de episodios en LIBERO-Object.
- Análisis de variabilidad entre checkpoints: comparar los checkpoints de 6.000 (74%), 8.000 (82%) y 10.000 (62%) pasos para estudiar la inestabilidad del entrenamiento de ACT, documentada en 30 de 36 ejecuciones del estudio.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,43 h de entrenamiento en una GPU de 6 GB) para ilustrar el pipeline LeRobot de entrenamiento y evaluación en MuJoCo.
- Pruebas de infraestructura de evaluación: validar entornos LIBERO, renderizado MuJoCo en CPU (WSL2) y protocolos de estados iniciales fijos antes de lanzar barridos más costosos.
- Estudio de la normalización de datos: analizar el efecto de normalizar estados y acciones con estadísticas del dataset completo frente a las de los episodios seleccionados, dado que este checkpoint usa el comportamiento por defecto de LeRobot.
- Comparación de eficiencia muestra-datos: contrastar el rendimiento de un modelo de 52M entrenado con 46 episodios frente a un VLA preentrenado con las mismas demostraciones, para decidir qué enfoque usar con presupuestos de datos reducidos.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados 0 a 49), 256x256, replanificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 37 de 50 | 74% |
| 8.000 | 41 de 50 | 82% |
| 10.000 (raíz del repo) | 31 de 50 | 62% |
| Media de los 3 checkpoints | 109 de 150 | 72,7% (IC 95% Wilson: 65-79%) |

Resultados agregados del estudio (3 tareas, todas las semillas, todas las demostraciones):

| Método | Tasa de éxito media |
|---|---:|
| ACT desde cero, todas las demostraciones (45-50 por tarea) | 55,4% |
| SmolVLA preentrenado, mismas demostraciones | 87,3% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje: el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 6 GB; el entrenamiento completo cupo en una RTX 4050 de 6 GB, por lo que la inferencia en fp32 ocupa del orden de unos pocos cientos de MB para 52M parámetros más el encoder ResNet-18.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4050, RTX 4060, RTX 4090). No requiere A100 ni H100.
- Cabe en GPU consumer: sí, holgadamente; también puede ejecutarse en CPU, aunque la evaluación publicada usó renderizado MuJoCo en CPU y política en CUDA.
- Opciones de despliegue: `lerobot-eval` (comando documentado en la model card) con `--env.type=libero`; el formato es el nativo de LeRobot, no GGUF, por lo que no aplica llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el tiempo de entrenamiento (0,43 h en RTX 4050).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 52M | no aplica | 72,7% medio en 3 checkpoints; 62% en el paso 10.000 | Apache 2.0 | Hugging Face (LeRobot) |
| SmolVLA (referencia del estudio) | no disponible en la información | no disponible | 87,3% agregado con las mismas demostraciones | no disponible en la información | checkpoint LIBERO publicado según la model card |
| ACT con todas las demostraciones (agregado del estudio) | 52M | no aplica | 55,4% medio en 3 tareas | Apache 2.0 | no disponible como modelo único |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren en tamaño, arquitectura y entrada de lenguaje, tal como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- El checkpoint de la raíz del repositorio es el peor de los tres evaluados (62% frente a 82% del paso 8.000): evaluar siempre el checkpoint concreto antes de usarlo.
- Alta varianza entre checkpoints de la misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta.
- La comparación con SmolVLA está confundida por diferencias de tamaño, arquitectura y entrada de lenguaje; no atribuir la brecha solo al preentrenamiento.
- Las 3 tareas se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga los resultados hacia tareas favorables.
- Normalización de estados y acciones con estadísticas de todo `lerobot/libero`, no solo de los episodios seleccionados; puede introducir desajustes de escala.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste de hiperparámetros para esta tarea.
- El intervalo de Wilson del 72,7% cubre solo el muestreo de evaluación; la variabilidad entre semillas de entrenamiento es mayor.
- Sin capacidades de lenguaje, tool calling ni generalización a otras tareas: no es apto como política de propósito general ni para producción fuera del entorno simulado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de funcionamiento fuera del entorno de evaluación descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t1_nall_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada
