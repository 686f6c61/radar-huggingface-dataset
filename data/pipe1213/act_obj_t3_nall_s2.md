# Pipe1213/act_obj_t3_nall_s2

## Resumen

Pipe1213/act_obj_t3_nall_s2 es una política robótica ACT (Action Chunking Transformer, Zhao et al., 2023) entrenada desde cero con la librería LeRobot sobre una única tarea del benchmark LIBERO-Object: "coger el pudin de chocolate y colocarlo en la cesta" (task id 8). Forma parte del estudio vla-vs-scratch, que compara una política preentrenada de tipo vision-language-action (SmolVLA) con una política entrenada desde cero (ACT) sobre las mismas pocas demostraciones en simulación. No es un modelo de propósito general: se publica para hacer reproducible el estudio.

El modelo tiene 51,6 millones de parámetros (52M según el autor), usa un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y genera trozos (chunks) de 100 acciones. Se entrenó con 50 episodios de demostración del dataset lerobot/libero, batch size 8, 10.000 pasos y semilla 2000, con un coste de cómputo de 0,42 horas en una RTX 4050 de portátil (6 GB). El checkpoint raíz del repositorio es el de 10.000 pasos, que solo resuelve el 8% de las escenas de evaluación; el mejor checkpoint de la misma ejecución (8.000 pasos) alcanza el 74%.

Su relevancia es metodológica más que práctica: documenta la alta variabilidad entre checkpoints de una misma ejecución de ACT (en 30 de 36 ejecuciones del estudio) y sirve como referencia para quienes reproducen experimentos de imitación robótica con LeRobot. En el agregado del estudio, ACT con todas las demostraciones logró un 55,4% de éxito frente al 87,3% de SmolVLA en las mismas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder ResNet-18 y transformer de decodificación de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observa imágenes de 256x256 y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; tarea fija en simulación) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot; checkpoints en `checkpoints/<step>/pretrained_model`) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice secuencias de acciones en trozos (action chunks) de 100 pasos, condicionado por observaciones visuales procesadas por un ResNet-18 preentrenado en ImageNet y por el estado propioceptivo del robot. Todo el resto de la red se entrena desde cero. El modelo sigue los ajustes por defecto de LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`), con la única modificación en evaluación de replanificar cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usa 50 episodios concretos del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 2000. No hay RLHF ni DPO: es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger el pudin de chocolate y depositarlo en la cesta (LIBERO-Object, task id 8).
- Predicción de acciones en chunks de 100 pasos con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales RGB a 256x256 píxeles mediante encoder ResNet-18.
- Condicionamiento por estado propioceptivo del robot (no por instrucciones en lenguaje natural).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento (thinking), visión general, audio ni otras capacidades fuera de la política robótica.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: sirve como referencia exacta del entrenamiento ACT desde cero con 50 demostraciones, semilla 2000 y task id 8, permitiendo replicar la comparación frente a SmolVLA con el mismo conjunto de episodios.
- Línea base en experimentos de imitación robótica: útil para medir cuánto mejora (o no) una política preentrenada frente a una entrenada desde cero en un régimen de pocos datos (45-50 episodios por tarea).
- Estudio de variabilidad entre checkpoints: al conservar los checkpoints de 6.000, 8.000 y 10.000 pasos, permite analizar por qué checkpoints de la misma ejecución rinden de forma tan distinta (20%, 74% y 8% de éxito respectivamente).
- Validación de pipelines de LeRobot: el comando `lerobot-eval` documentado sirve para verificar la instalación de LeRobot, el entorno `libero` y el renderizado MuJoCo en CPU antes de lanzar experimentos mayores.
- Formación y docencia: ejemplo mínimo y de bajo coste (0,42 h en una RTX 4050 de 6 GB) para ilustrar el flujo completo de entrenamiento y evaluación de una política ACT en simulación.
- Análisis de sensibilidad a la semilla: el modelo y sus checkpoints permiten estudiar la dispersión de resultados entre semillas de entrenamiento, que el autor señala como mayor que el intervalo de Wilson de la evaluación.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (init states 0 a 49), imágenes de 256x256, replanificación cada 10 acciones, semilla de evaluación 1000, renderizado MuJoCo en CPU:

| Checkpoint (paso) | Exitos | Tasa de exito |
|---|---:|---:|
| 6.000 | 10 de 50 | 20% |
| 8.000 | 37 de 50 | 74% |
| 10.000 (raiz del repo) | 4 de 50 | 8% |
| Media de los 3 checkpoints | 51 de 150 | 34% (intervalo de Wilson 95%: 27-42%) |

Contexto agregado del estudio (3 tareas y todas las semillas): ACT con todas las demostraciones (45-50 por tarea) obtuvo 55,4% y SmolVLA con las mismas demostraciones 87,3%. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: 0,42 horas en una RTX 4050 de portátil con 6 GB de VRAM.
- Inferencia: al tratarse de 51,6M parámetros, cabe holgadamente en cualquier GPU consumer; no se dispone de una estimación formal de VRAM en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 6 GB para entrenamiento; para inferencia basta una GPU modesta o incluso CPU para el renderizado MuJoCo (la evaluación del autor se hizo con MuJoCo en CPU bajo WSL2).
- Despliegue: LeRobot (`lerobot-eval`, `lerobot-train`); no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,6M | Imágenes 256x256 + estado, sin lenguaje | 34% medio (3 checkpoints); 55,4% agregado con todas las demostraciones | apache-2.0 | HuggingFace (LeRobot) |
| SmolVLA (preentrenado, referencia del estudio) | no disponible en la información | Vision-language-action con entrada de lenguaje | 87,3% agregado con las mismas demostraciones | no disponible en la información | no disponible en la información |
| ACT con menos demostraciones (otras ejecuciones del estudio) | 51,6M | Igual que este modelo | Recogido en el análisis del estudio | apache-2.0 (presumible, no confirmado) | Repositorio del estudio |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento, ya que difieren también en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no probado en un robot real.
- El checkpoint raíz (10.000 pasos) rinde al 8%, muy por debajo del de 8.000 pasos (74%): es imprescindible evaluar el checkpoint concreto antes de usarlo.
- Alta variabilidad entre checkpoints de una misma ejecución (en 30 de 36 ejecuciones ACT del estudio), mayor que el intervalo de confianza de la evaluación.
- La comparación con SmolVLA no puede atribuirse únicamente al preentrenamiento por diferencias de tamaño, arquitectura y entrada de lenguaje.
- Las 3 tareas del estudio se eligieron entre tareas de LIBERO-Object que un checkpoint SmolVLA publicado ya resolvía, lo que sesga el conjunto evaluado.
- Normalización de estados y acciones con estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT se usó con los ajustes por defecto de LeRobot, sin ajuste específico para esta tarea.
- Sin capacidades de lenguaje, tool calling ni agentes; no apto como política de propósito general.
- Licencia apache-2.0: permite uso comercial, pero el modelo carece de valor práctico fuera de la reproducción del estudio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_nall_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible enlace en la información proporcionada
