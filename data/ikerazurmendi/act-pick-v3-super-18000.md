# IkerAzurmendi/act-pick-v3-super-18000

## Resumen

`IkerAzurmendi/act-pick-v3-super-18000` es una política de manipulación robótica basada en ACT (Action Chunking with Transformer) entrenada con la librería LeRobot para el brazo SO-101. Resuelve una tarea muy concreta: coger una pieza de una caja y mantenerla levantada frente a la cámara. La política consume dos cámaras (frontal y de muñeca) más las seis posiciones articulares del robot, y emite un *chunk* de 90 objetivos de articulación futuros a 30 fps, es decir, tres segundos de trayectoria por inferencia.

El modelo lo publica un autor individual (IkerAzurmendi) como parte de una campaña de experimentos comparables entre sí: distintas mezclas de datos, número de episodios y recetas de entrenamiento. Este checkpoint concreto corresponde a 18.000 pasos sobre la mezcla "super" (398 episodios, todos los que pasan el filtro de calidad) de la tercera ronda. El autor advierte explícitamente de que no es el mejor checkpoint de su propia ejecución: el óptimo según la métrica offline está en 6.000 pasos (error 15,16 frente a 16,04 de este).

Su relevancia es acotada pero real: con 51,7 M de parámetros y licencia Apache 2.0, es un ejemplo reproducible de *imitation learning* de bajo coste, útil para investigación en políticas visuomotoras, para comparar recetas de entrenamiento y como punto de partida para *fine-tuning* con datos propios de un SO-101. No es un modelo de propósito general ni ha sido evaluado en el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformer), política visuomotora; detalles internos de capas no publicados en la model card |
| Parámetros totales | 51.658.374 (según metadatos de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: no es un modelo de lenguaje. Entrada: 2 imágenes (cámara frontal y de muñeca) + 6 posiciones articulares; horizonte de acción de 90 pasos a 30 fps |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay versiones GGUF, INT8 ni FP16 publicadas) |
| Idiomas soportados | no disponible / no aplica (modelo de acción robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una política de imitación que predice secuencias de acciones (no acciones individuales) mediante un transformer, con un módulo de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas y un *backbone* convolucional para las imágenes. En este caso la salida es un *chunk* de 90 objetivos articulares a 30 fps y el autor indica que se replanifica cada 30 pasos de acción, lo que equivale a una nueva inferencia aproximadamente una vez por segundo. La model card no detalla el número de capas, dimensión del transformer ni la resolución de entrada de las cámaras.

El entrenamiento usa la receta `train()` de LeRobot con batch 8, `chunk=90`, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El dataset son 398 episodios: las 66 sesiones completas de `pick-cube`, grabadas a 30 fps y a 10 fps (reasampleadas a 30 fps), con cualquier número de piezas en la caja, duración de 5 a 15 s, hueco inicial máximo de 20 grados, como mucho 3 s de inactividad en los extremos, al menos una apertura del gripper y descartando las tomas malas conocidas. No se menciona RLHF, DPO ni ninguna fase de alineación, algo esperable en una política robótica.

## Capacidades

- Generación de trayectorias articulares para el SO-101: dado el estado de las seis articulaciones y dos vistas de cámara, produce 90 objetivos de posición futuros.
- Ejecución de una única tarea de manipulación: coger una pieza de la caja y sostenerla frente a la cámara.
- Robustez limitada al número de piezas: el entrenamiento incluye episodios con distinto número de piezas en la caja (la evaluación retenida separa episodios de una y dos piezas).
- Control a 30 fps con replanificación cada 30 pasos de acción (aproximadamente 1 Hz de recálculo).
- Fusión de dos cámaras (frontal y de muñeca) con el estado propioceptivo del robot.
- No soporta *tool calling*, agentes, razonamiento multi-paso, texto, visión general, audio ni modo *thinking*: es una política motora, no un modelo fundacional multimodal.

## Casos de uso

- **Automatización de una celda de pick-and-place con SO-101**: la política puede cerrar el bucle de control a 30 fps sobre el robot para la tarea de recogida y presentación de piezas, siempre que el *setup* de cámaras y la iluminación coincidan con los del dataset de entrenamiento.
- ***Fine-tuning* con datos propios**: al estar publicada en LeRobot y con licencia Apache 2.0, sirve como inicialización para reentrenar la tarea con un útil, una caja o una cámara distintos, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- **Reproducción de experimentos de imitación learning**: el autor publica la receta exacta (batch, chunk, semilla, filtros de calidad) y checkpoints hermanos, lo que permite replicar la comparación entre mezclas de datos y analizar el sobreajuste tras una pasada sobre el dataset.
- **Evaluación offline de pipelines de datos**: con 16 episodios retenidos y una línea base trivial ("quedarse quieto", error 20,71), el modelo sirve para validar herramientas de métricas de error articular absoluto sobre *chunks* antes de gastar tiempo de robot.
- **Docencia y divulgación en robótica de bajo coste**: un modelo de 51,7 M de parámetros que cabe en cualquier GPU de consumo es un caso práctico asequible para explicar ACT, *action chunking* y el ecosistema LeRobot en un curso o taller.
- **Generación de rollouts para aumentar datos**: ejecutar la política en el robot (con supervisión) permite grabar nuevas trayectorias etiquetadas de la misma tarea para ampliar el dataset o comparar distribuciones de estados.
- **Pruebas de integración de infraestructura**: validar latencias de inferencia, *framerate* de cámaras y sincronización con el bus de motores en un *pipeline* LeRobot antes de entrenar un modelo definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la información disponible, ni tendrían sentido para este tipo de modelo. El autor sí publica una evaluación offline: error absoluto medio de las posiciones articulares sobre el *chunk* predicho, en 16 episodios retenidos (12 de `so101-pick-cube_20261024_181939` con una pieza y 4 de `so101-pick-cube_20261024_144537` con dos piezas), comparado con una línea base de "mantener las posiciones actuales" de 20,71 (menor es mejor).

| Checkpoint de esta ejecución | Error | Mejora sobre la línea base |
|---|---|---|
| 6.000 pasos | 15,16 | 27 % |
| 12.000 pasos | 16,08 | 22 % |
| 18.000 pasos (este) | 16,04 | 23 % |
| 24.000 pasos | 16,36 | 21 % |
| 30.000 pasos | 16,27 | 21 % |

Comparación con el mejor checkpoint de cada ejecución de la misma ronda:

| Ejecución | Episodios | Mejor checkpoint | Error | Mejora vs. línea base |
|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27 % |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27 % |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26 % |
| v2 (anterior) | 278 | 6k | 15,36 | 26 % |
| chunk 60 (línea base propia de 16,23) | 331 | 4,8k | 11,94 | 26 % |
| solo una pieza | 292 | 9,6k | 15,47 | 25 % |
| solo sesiones recientes | 100 | 12k | 16,87 | 19 % |
| primera ejecución | 165 | 6k | 16,87 | 19 % |

Advertencias del propio autor: los mejores checkpoints de las ejecuciones principales están dentro del ruido entre sí; todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos; el error offline no indica qué modelo agarra mejor; y ninguno se ha probado en el robot. La fila de `chunk 60` no es directamente comparable porque usa una línea base distinta (16,23).

## Requisitos de hardware

- **VRAM estimada**: los 51,66 M de parámetros ocupan aproximadamente 207 MB en FP32 y 103 MB en FP16. Con las activaciones de dos cámaras y el transformer, la inferencia debería quedar por debajo de 1-2 GB de VRAM; es una estimación, no un dato publicado por el autor.
- **GPU recomendadas**: cualquier GPU con 4 GB o más es suficiente en la práctica. Una RTX 3060, RTX 4060, RTX 4090 o una A100 funcionan sin problema; en estas dos últimas el cuello de botella será la captura de cámara y el bus de motores, no el modelo.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años e incluso en iGPU con suficiente memoria compartida.
- **CPU**: técnicamente viable por tamaño, pero no hay datos publicados de latencia; a 30 fps con dos cámaras el margen es ajustado y no está verificado.
- **Opciones de despliegue**: scripts de evaluación e inferencia de LeRobot (`lerobot-eval` / `record`) sobre PyTorch. No se han publicado exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (ninguna de estas dos últimas aplica a una política robótica).
- **Latencia y throughput**: no disponibles. El único dato operativo es que el modelo produce 90 acciones por inferencia y se replanifica cada 30 pasos, lo que da una inferencia por segundo a 30 fps.

## Comparativa con modelos similares

No hay benchmarks públicos comparables con otros modelos de la literatura en la información disponible. La comparación más útil es con los checkpoints hermanos del mismo autor, entrenados con recetas y datos distintos:

| Modelo | Parámetros | Episodios | Mejor checkpoint | Error offline | Licencia |
|---|---|---|---|---|---|
| act-pick-v3-super-18000 (este) | 51,7 M | 398 | 18k (este), mejor de la ejecución en 6k | 16,04 | Apache 2.0 |
| act-pick-v3-6000 | no disponible | 398 | 6k | 15,16 | Apache 2.0 |
| act-pick-v3-strict-2400 | no disponible | 205 | 2,4k | 15,14 | Apache 2.0 |
| act-pick-v3-1-2-pieces-18000 | no disponible | 331 | 18k | 15,35 | Apache 2.0 |
| act-pick-v2-6000 | no disponible | 278 | 6k | 15,36 | Apache 2.0 |
| act-pick-v3-chunk60-4800 | no disponible | 331 | 4,8k | 11,94 (línea base propia 16,23) | Apache 2.0 |

Como alternativas externas de la misma categoría (políticas de imitación para brazos de bajo coste) existirían Diffusion Policy o VQ-BeT dentro del propio ecosistema LeRobot, pero no se dispone de datos de rendimiento de esas políticas sobre esta tarea, por lo que la comparación cuantitativa figura como no disponible.

## Limitaciones y advertencias

- **No es el mejor checkpoint de su ejecución**: el autor lo publica "por completitud" y señala que el óptimo es el de 6.000 pasos, con 0,88 puntos menos de error.
- **Sobreajuste temprano**: todas las ejecuciones de la ronda empeoran tras aproximadamente una pasada sobre el dataset; a partir de 12.000 pasos el error se estanca o sube.
- **La métrica offline no mide éxito de agarre**: el error absoluto de articulaciones no correlaciona necesariamente con la calidad del *grasp*, y el autor lo advierte de forma explícita.
- **Sin validación en robot**: ninguno de los checkpoints de la ronda se ha probado sobre el SO-101 real, por lo que no existe tasa de éxito publicada.
- **Tarea y embodiment únicos**: solo sirve para el SO-101 con la disposición concreta de cámara frontal y de muñeca; cambiar la montura, el objetivo o la caja invalida la política.
- **Sesgos de datos**: el dataset procede de pocas sesiones de grabación (66 sesiones de `pick-cube`), con condiciones de iluminación, fondo y posiciones de caja limitadas; es probable un mal comportamiento fuera de esa distribución. El autor no documenta análisis de sesgo.
- **Riesgo de alucinación en sentido literal**: no aplica como modelo de lenguaje, pero sí existe el riesgo equivalente de generar trayectorias plausibles aunque incorrectas cuando el estado observado se aleja del dataset.
- **Seguridad física**: es una política motora sin capa de seguridad; requiere límites de par, parada de emergencia y supervisión humana durante cualquier prueba.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero no exime de responsabilidad sobre el comportamiento del robot ni otorga garantías.
- **Idioma y multimodalidad**: al no procesar texto, no hay soporte multilingüe ni capacidad de recibir instrucciones en lenguaje natural; la tarea está fijada por los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-super-18000
- Perfil del autor (checkpoints hermanos: `act-pick-v3-6000`, `act-pick-v3-strict-2400`, `act-pick-v3-1-2-pieces-18000`, `act-pick-v2-6000`, `act-pick-v3-chunk60-4800`, `act-pick-v3-1piece-9600`, `act-pick-v3-recent-12000`): https://huggingface.co/IkerAzurmendi
- LeRobot (librería de entrenamiento e inferencia): https://github.com/huggingface/lerobot
- Paper de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": https://arxiv.org/abs/2304.13705
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces adicionales figuran como no disponibles.
