# Pipe1213/act_obj_t3_n10_s3

## Resumen

`Pipe1213/act_obj_t3_n10_s3` es una política de imitación basada en ACT (Action Chunking Transformer, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger el pudin de chocolate y depositarlo en la cesta" (tarea 8 de LIBERO-Object). Forma parte de un estudio comparativo de 60 políticas denominado [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que contrasta un modelo visión-lenguaje-acción preentrenado (SmolVLA) frente a una política entrenada desde cero sobre las mismas pocas demostraciones.

El modelo tiene 51.671.687 parámetros (52M según el autor), utiliza un encoder visual ResNet-18 inicializado con pesos de ImageNet y genera trozos (chunks) de 100 acciones. Se entrenó con 10 episodios del dataset `lerobot/libero` durante 10.000 pasos con batch size 8, semilla 3000, empleando 0,36 horas en una RTX 4050 de portátil (6 GB). La relevancia del artefacto es metodológica: sirve para reproducir el estudio, no como política de propósito general.

El rendimiento publicado es bajo: 8,7% de tasa de éxito agregada (13 de 150 episodios, intervalo de Wilson del 95%: 5-14%) sobre las 50 escenas iniciales fijas de LIBERO. El checkpoint raíz del repositorio (10.000 pasos) alcanza 16% (8 de 50). El autor advierte que los checkpoints de una misma ejecución de ACT varían mucho en rendimiento, por lo que debe evaluarse antes de usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; entrada visual y de estado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot, con un encoder de imágenes ResNet-18 inicializado desde ImageNet y el resto de parámetros entrenados desde cero. La configuración es la de LeRobot por defecto: 52M de parámetros y chunks de 100 acciones. La única modificación respecto a los valores por defecto ocurre en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usó 10 demostraciones del dataset `lerobot/libero` (episodios 841, 910, 918, 953, 966, 975, 1048, 1149, 1210 y 1250, revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 3000, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No se reporta RLHF, DPO ni ajuste fino posterior. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas (comportamiento por defecto de LeRobot).

## Capacidades

- Control robótico de manipulación en simulación para una única tarea: coger el pudin de chocolate y colocarlo en la cesta (LIBERO-Object, task id 8).
- Predicción de chunks de 100 acciones a partir de observaciones de imagen (256x256) y estado del robot.
- Replanificación cada 10 acciones durante la evaluación.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No procesa lenguaje natural ni instrucciones textuales; la tarea está fijada por el entrenamiento.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Reproducción del estudio vla-vs-scratch: permite replicar el resultado de ACT con 10 demostraciones en la tarea 8 de LIBERO-Object y compararlo con SmolVLA bajo las mismas condiciones de evaluación.
- Línea base de imitación desde cero: sirve como referencia para medir cuánto aporta el preentrenamiento visión-lenguaje-acción frente a entrenar ACT desde cero con pocas demostraciones.
- Análisis de variabilidad entre checkpoints: útil para estudiar la inestabilidad de ACT (el autor indica que en 30 de 36 ejecuciones los checkpoints de un mismo entrenamiento difieren notablemente), evaluando los checkpoints 6.000, 8.000 y 10.000 incluidos en el repositorio.
- Docencia y experimentación con LeRobot: ejemplo mínimo y reproducible de entrenamiento de una política ACT con `lerobot-train` y evaluación con `lerobot-eval` en MuJoCo.
- Pruebas de infraestructura de evaluación en robótica: validar pipelines de evaluación con estados iniciales fijos, renderizado a 256x256 y semilla de evaluación 1000.
- Estudio de normalización de datos: permite analizar el efecto de normalizar con estadísticas del dataset completo frente a las demostraciones seleccionadas.
- No es adecuado como política de propósito general ni para despliegue en robot real, según las limitaciones declaradas por el autor.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), 50 episodios por checkpoint, imágenes de 256x256, replanificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 4 de 50 | 8% |
| 8.000 | 1 de 50 | 2% |
| 10.000 | 8 de 50 | 16% |
| Media de los 3 checkpoints | 13 de 150 | 8,7% (IC 95% Wilson: 5-14%) |

Contexto del estudio, agregado sobre 3 tareas y todas las semillas de entrenamiento: ACT con 10 demostraciones por tarea obtuvo 34,6%; SmolVLA con las mismas demostraciones, 82,4%.

## Requisitos de hardware

- Entrenamiento: 0,36 horas en una RTX 4050 de portátil con 6 GB de VRAM (según el autor).
- Inferencia: el modelo tiene ~52M de parámetros; el peso en safetensors es de aproximadamente 0,6 GB en el repositorio, por lo que cabe holgadamente en cualquier GPU consumer con más de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA consumer (RTX 4050 o superior) es suficiente; no se requiere A100 ni H100.
- Despliegue: librería `lerobot` (`lerobot-eval` con `--policy.path`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Evaluación: requiere el entorno `libero` con MuJoCo; el autor reporta renderizado en CPU bajo WSL2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | no aplica | 8,7% en la tarea 8 (media de 3 checkpoints); 34,6% agregado en 3 tareas | apache-2.0 | Hugging Face (`Pipe1213/act_obj_t3_n10_s3`) |
| SmolVLA (referencia del estudio) | no disponible | no disponible | 82,4% agregado en 3 tareas con 10 demostraciones | no disponible en la información | no disponible en la información |
| Otros checkpoints ACT del estudio | 51,7M | no aplica | 60 políticas en total; resultados por ejecución en el repositorio del estudio | apache-2.0 (presumible, no confirmado para todos) | Repositorio vla-vs-scratch |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación: una única tarea de un único benchmark; no probado en robot real.
- Tasa de éxito muy baja (8,7% agregada; 16% en el mejor checkpoint), insuficiente para uso práctico.
- Alta variabilidad entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones ACT del estudio los checkpoints difieren mucho; es imprescindible evaluar antes de usar.
- La comparación con SmolVLA no permite atribuir la diferencia únicamente al preentrenamiento (difieren tamaño, arquitectura y entrada de lenguaje).
- Las 3 tareas se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización de estados y acciones con estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- No procesa lenguaje: no admite instrucciones en texto ni cambios de tarea en inferencia.
- Riesgo de alucinación y sesgos: no aplica en el sentido de LLM; el fallo se manifiesta como acciones incorrectas o agarres fallidos.
- Licencia apache-2.0: permite uso comercial, pero el autor desaconseja explícitamente su uso como política de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t3_n10_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
