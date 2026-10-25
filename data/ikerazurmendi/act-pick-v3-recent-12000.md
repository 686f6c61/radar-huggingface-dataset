# IkerAzurmendi/act-pick-v3-recent-12000

## Resumen

`act-pick-v3-recent-12000` es una política de imitación robótica basada en ACT (Action Chunking Transformer) publicada por IkerAzurmendi para el brazo SO-101. No es un modelo de lenguaje: es un controlador neuronal que recibe dos flujos de cámara (frontal y de muñeca) más las seis posiciones articulares del robot, y emite un bloque de 90 objetivos articulares futuros a 30 fps para ejecutar la tarea «coger una pieza de la caja y sostenerla frente a la cámara». La política se distribuye en formato LeRobot, con 51.658.374 parámetros y un repositorio de 0,2 GB, lo que la sitúa en la categoría de políticas ligeras ejecutables en hardware de consumo.

El modelo es una variante concreta de la tercera ronda de experimentos del autor (v3), entrenada únicamente con las sesiones recientes del 24 de octubre de 2026 (a partir de las 16:58) más dos sesiones de la tarde, en total 100 episodios a 30 fps. El checkpoint publicado corresponde al paso 12.000 de una tirada de 12.000 pasos. Su interés es fundamentalmente metodológico: sirve como punto de comparación dentro de una familia de entrenamientos que el autor publica de forma sistemática, con evaluación offline homogénea sobre episodios reservados.

La relevancia práctica es limitada y así lo declara el propio autor: el error offline no permite saber qué modelo agarra mejor y ninguno de los checkpoints se ha probado sobre el robot real. Aun así, el modelo es útil como referencia reproducible de ACT sobre SO-101, como base para fine-tuning con datos propios y como componente de una habilidad de picking dentro de una arquitectura jerárquica de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación visomotora |
| Parametros totales | 51.658.374 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto textual; ventana de observación de 2 cámaras + 6 posiciones articulares por paso, con horizonte de predicción de 90 acciones (chunk 90) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica / no disponible (modelo de robótica sin entrada ni salida de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamano del repositorio | 0,2 GB |
| Tarea | «pick a piece from the crate and hold it up to the camera» sobre brazo SO-101 |
| Entradas | cámara frontal, cámara de muñeca, 6 posiciones articulares |
| Salidas | chunk de 90 objetivos articulares futuros |
| Frecuencia de control | 30 fps; 30 pasos de acción por replanificación |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones visuales y propioceptivas a un bloque de acciones futuras en lugar de a una acción única. En esta configuración, el modelo consume simultáneamente la imagen de la cámara frontal, la de la cámara de muñeca y el vector de seis posiciones articulares, y produce un chunk de 90 objetivos articulares; el lazo de control ejecuta 30 de esas acciones antes de volver a planificar, lo que reduce la frecuencia efectiva de inferencia y suaviza la trayectoria. No se documentan en la información disponible ni el número de capas, ni las dimensiones del `d_model`, ni la estrategia exacta de fusión de las dos cámaras.

El entrenamiento se realizó con la función `train()` de LeRobot, con lote de 8, chunk de 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El conjunto de datos son 100 episodios a 30 fps grabados el 24 de octubre de 2026 desde las 16:58 (piezas colocadas en esquinas y a lo largo de los bordes) más dos sesiones de la tarde, con una o dos piezas por episodio y el mismo filtro de calidad que la ronda v3. No se especifica el número total de tokens, el número de épocas ni si hubo etapas de RLHF o DPO (no procede en imitación supervisada). El autor señala que todas las tiradas de esta ronda empeoran tras aproximadamente una pasada sobre los datos, lo que sugiere sobreajuste temprano y explica la elección de checkpoints intermedios.

## Capacidades

- Ejecución de una única habilidad motora: coger una pieza de la caja y sostenerla frente a la cámara, con el brazo SO-101.
- Control visomotor con dos cámaras (frontal y de muñeca) y realimentación propioceptiva de seis articulaciones.
- Predicción de acciones en bloque (action chunking) de 90 pasos a 30 fps, con replanificación cada 30 pasos.
- Generalización limitada a variaciones de posición de la pieza dentro de la distribución de entrenamiento (piezas en esquinas y bordes de la caja).
- Manejo de escenarios con una o dos piezas presentes en la escena, según los datos de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües. Es exclusivamente una política de control.

## Casos de uso

- Baseline reproducible para ACT sobre SO-101: sirve como referencia de error offline (16,87) frente a la que medir variantes propias con el mismo protocolo de episodios reservados y la misma línea base de «quedarse quieto» (20,71).
- Punto de partida para fine-tuning con datos propios: al estar en formato LeRobot y licencia Apache 2.0, puede reentrenarse con grabaciones locales del mismo brazo para adaptar la habilidad de picking a una celda, caja u objeto distintos.
- Docencia y formación en imitación robótica: el par (política, tabla de checkpoints y error offline) permite explicar de forma tangible el sobreguajuste por pasadas repetidas al dataset y la diferencia entre métrica offline y éxito real.
- Evaluación de infraestructura de inferencia a 30 Hz: un modelo de 51,6 M de parámetros con dos flujos de vídeo es un banco de pruebas realista para medir latencia de extremo a extremo en el lazo de control antes de pasar a políticas mayores.
- Componente de una habilidad jerárquica: puede encapsularse como subpolítica de «pick and hold» dentro de un sistema de mayor nivel que gestione navegación, colocación o manipulación posterior.
- Pruebas de robustez perceptiva: al depender de dos cámaras, permite experimentar con oclusiones, cambios de iluminación y desalineación de la cámara de muñeca midiendo la degradación del chunk predicho.
- Comparación controlada de recetas de entrenamiento: junto a los demás checkpoints del autor (super, strict, chunk 60, una pieza), permite aislar el efecto del volumen y del filtrado de datos manteniendo arquitectura y evaluación.

## Benchmarks y rendimiento

Los únicos datos publicados son de evaluación offline sobre episodios reservados: 16 episodios, 12 de `so101-pick-cube_20261024_181939` (una pieza) y 4 de `so101-pick-cube_20261024_144537` (dos piezas). La métrica es el error absoluto medio de las articulaciones sobre el chunk predicho (menor es mejor), comparado con una línea base de «mantener las posiciones articulares actuales» de 20,71.

| Checkpoint de esta tirada | Error | Por debajo de la linea base |
|---|---|---|
| 2.400 pasos | 17,19 | 17 % |
| 4.800 pasos | 17,10 | 17 % |
| 7.200 pasos | 17,00 | 18 % |
| 9.600 pasos | 17,10 | 17 % |
| 12.000 pasos (este) | 16,87 | 19 % |

Comparación con el mejor checkpoint de cada tirada de la ronda v3, según la model card:

| Tirada | Episodios de entrenamiento | Mejor checkpoint | Error | Por debajo de la linea base | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27 % | act-pick-v3-6000 |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27 % | act-pick-v3-strict-2400 |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26 % | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26 % | act-pick-v2-6000 |
| chunk 60 (linea base propia 16,23) | 331 | 4,8k | 11,94 | 26 % | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9,6k | 15,47 | 25 % | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19 % | act-pick-v3-recent-12000 |
| primera tirada | 165 | 6k | 16,87 | 19 % | act-pick-* |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo. Las cifras de chunk 60 no son directamente comparables con el resto: usan una línea base distinta (16,23) y un horizonte de predicción diferente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51.658.374 parámetros, los pesos en FP32 ocupan aproximadamente 207 MB (0,2 GB, coherente con el tamaño del repositorio); en FP16 bajarían a unos 103 MB, aunque no se documenta una variante FP16.
- GPU recomendadas: cualquier GPU consumer sirve, por ejemplo RTX 3060, RTX 4060 o RTX 4090. Para un modelo de este tamaño una GPU dedicada no es imprescindible; el cuello de botella real es el preprocesado de dos flujos de vídeo a 30 fps, no la matriz de pesos.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier GPU con 4 GB o más; también es viable en CPU para inferencia, aunque el rendimiento a 30 Hz no está documentado.
- Opciones de despliegue: LeRobot (PyTorch) es la ruta declarada por el autor; no se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama (estas dos últimas no aplican a políticas robóticas).
- Latencia y throughput: no disponibles. El requisito implícito del sistema es sostener el lazo de control a 30 fps ejecutando 30 acciones entre replanificaciones, lo que da una inferencia cada 1 segundo aproximadamente; el autor no publica medidas de latencia ni de tasa de éxito en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Error offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-v3-recent-12000 (este) | 51.658.374 | chunk 90, replan cada 30 pasos | 16,87 (base 20,71) | Apache 2.0 | HuggingFace, 0 descargas |
| act-pick-v3-6000 | no disponible (misma familia ACT) | chunk 90 | 15,16 (base 20,71) | Apache 2.0 | HuggingFace |
| act-pick-v3-strict-2400 | no disponible (misma familia ACT) | chunk 90 | 15,14 (base 20,71) | Apache 2.0 | HuggingFace |
| act-pick-v3-chunk60-4800 | no disponible (misma familia ACT) | chunk 60 | 11,94 (base 16,23, no comparable) | Apache 2.0 | HuggingFace |

No se dispone de información sobre políticas alternativas de otros autores para SO-101 en la documentación proporcionada, por lo que la comparación se limita a los checkpoints de la misma familia. El autor indica que los mejores checkpoints de las tiradas principales están dentro del ruido entre sí.

## Limitaciones y advertencias

- Sesgos conocidos: los datos provienen exclusivamente de sesiones del 24 de octubre de 2026, con piezas colocadas en esquinas y a lo largo de los bordes y con una o dos piezas en escena. La política hereda la distribución, la iluminación, la cámara y la celda de esas grabaciones; cualquier cambio de objeto, caja o montaje queda fuera de su dominio.
- Riesgo de sobreajuste: el autor documenta que todas las tiradas de esta ronda empeoran tras aproximadamente una pasada sobre los datos; este checkpoint es el último de una tirada de 12.000 pasos, no un óptimo temprano.
- Rendimiento real desconocido: los 16,87 de error offline no son una medida de éxito de agarre. El propio autor advierte que ningún checkpoint se ha probado sobre el robot.
- Inconsistencia en la model card: el texto afirma que «no es el mejor checkpoint de su tirada (el mejor está en 12.000 pasos)», lo que es contradictorio; la tabla de la propia model card sitúa el mejor error en el paso 12.000, que es el publicado.
- Limitación de tarea: el modelo solo ejecuta «coger una pieza y sostenerla frente a la cámara». No hace colocación, apilado, inserción ni manipulación de precisión.
- Ausencia de métricas estándar: no hay benchmarks de éxito en robot, ni latencias, ni comparación con políticas de terceros.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el modelo se distribuye sin garantías y sin datos de entrenamiento publicados en la información disponible, lo que dificulta auditar sesgos de recogida.
- Advertencia de producción: con 0 descargas y sin validación externa, no debe desplegarse en un lazo de control real sin una fase de evaluación propia con parada de emergencia y límites de par.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Checkpoint de referencia de la misma ronda (super): https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Checkpoint de la receta estricta: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Checkpoint con chunk 60: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Checkpoint de episodios con 1-2 piezas: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Checkpoint de una sola pieza: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Paper de ACT (Action Chunking with Transformers): no disponible en la informacion proporcionada
- Repositorio de LeRobot: no disponible en la informacion proporcionada
