# Autobrik/act-ocbench-blue-cube-narrow

## Resumen

`act-ocbench-blue-cube-narrow` es una política de robótica basada en ACT (Action Chunking with Transformers) implementada con la librería LeRobot de Hugging Face. La desarrolla el usuario Autobrik y está entrenada para una tarea concreta de pick-and-place de un cubo azul en el entorno de simulación OCBench, que combina MuJoCo con un brazo UR5e y una pinza Robotiq 2F-85. El modelo consume tres cámaras RGB de 224x224 y propriocepción de 7 dimensiones, y produce deltas de articulaciones y de la pinza.

El interés de esta ficha no reside en un modelo de lenguaje, sino en un caso de estudio de política robótica de imitación con un conjunto de datos pequeño (217 episodios) y un proceso de selección de checkpoint no convencional: el autor eligió el paso 80.000 por éxito en la tarea (20/20 en semillas de diagnóstico) en lugar de por pérdida de validación, que habría seleccionado el paso 20.000, fallido (0/10). Además, el repositorio incluye checkpoints editados a nivel de pesos (plegado de un mapa de color rojo→azul en `conv1` y `bn1`) que demuestran transferencia de color sin reentrenamiento.

Con 51,67 millones de parámetros y licencia Apache 2.0, es un modelo de nicho, reproducible y de tamaño reducido, pensado para investigación en manipulación robótica y edición de pesos, no para despliegue general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación LeRobot |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 3 cámaras RGB 224x224 + propriocepción 7-D) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual (tres cámaras RGB de 224x224) con un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales. En este caso, las acciones son deltas de articulaciones del UR5e y del driver de la pinza Robotiq 2F-85 (objetivo menos estado actual), con propriocepción de 7 dimensiones como entrada adicional. El modelo se entrenó sobre los 217 episodios del dataset `Autobrik/ocbench-blue-cube-narrow-delta`, en el entorno OCBench (MuJoCo).

El ajuste de tarea es un piloto estrecho: yaw del cubo dentro de ±10 grados, cubo en x 0,30–0,55 m e y 0,15–0,35 m, pose de brazo inicial fija y objetivo fijo (0,425, 0). Un detalle técnico crítico es la ejecución de 50 acciones por chunk sin ensamblado temporal: el autor reporta una variación de 0% a 90% de éxito según el tamaño de chunk, lo que convierte este hiperparámetro en determinante. No se documentan datos sobre RLHF, DPO ni composición detallada del dataset más allá del número de episodios.

## Capacidades

- Manipulación robótica de pick-and-place de cubos de 6 cm (azul y rojo) y bloques de 9 cm en simulación MuJoCo.
- Percepción visual a partir de tres cámaras RGB de 224x224 y propriocepción de 7 dimensiones.
- Predicción de chunks de 50 acciones (deltas de articulaciones y pinza) por inferencia.
- Generalización limitada a variaciones de color: los checkpoints editados en `edits/conv1-color-fold` transfieren la tarea de cubo azul a cubo rojo (44/50) sin reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor, no un modelo generativo de texto.

## Casos de uso

- Investigación en imitación robótica con datasets pequeños: sirve como referencia reproducible de ACT con 217 episodios y protocolo de evaluación documentado en `TRIAL1_RESULTS.md`.
- Estudio de selección de checkpoints: el caso demuestra que la pérdida de validación puede elegir un checkpoint fallido (paso 20.000, 0/10) frente al óptimo por éxito (paso 80.000, 20/20), útil para diseñar protocolos de evaluación.
- Edición de pesos en políticas visuales: los checkpoints de `edits/` permiten investigar cómo un mapa de color rojo→azul plegado en `conv1` y `bn1` (9.472 pesos) cambia el comportamiento, con un control aleatorio que cae a 0/50.
- Benchmark de manipulación en OCBench: útil para comparar políticas sobre el mismo entorno UR5e + Robotiq 2F-85 con condiciones de tarea fijas.
- Prototipado de pipelines LeRobot: el comando `act-rollout` documentado facilita integrar la política en flujos de evaluación automatizada con semillas y rangos de cubo configurables.
- Docencia y divulgación: por su tamaño (51,67 M de parámetros) y licencia permisiva, es adecuado para demostrar el ciclo completo de entrenamiento, evaluación y edición de una política robótica.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (test final con semillas 20000–20049, éxito estricto):

| Tarea | Éxito | IC 95% |
|---|---|---|
| Cubo azul de 6 cm | 44/50 = 88% | 76–94% |
| Cubo rojo de 6 cm | 45/50 = 90% | 79–96% |
| Bloque rojo de 9 cm | 42/50 = 84% | 71–92% |

Checkpoints editados:

| Carpeta | Edición | Test final rojo |
|---|---|---|
| `edits/conv1-color-fold` | mapa RGB rojo→azul plegado en conv1 + bn1 (9.472 pesos) | 44/50 (azul 44/50) |
| `edits/bn1-channel-color-k8` | corrección de color por canal en bn1 (16 números) | solo diagnóstico: 18/20 vs 19/20 |
| `edits/control-random-conv1` | edición aleatoria, mismos tensores y tamaño (control) | 0/50 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,67 M de parámetros y pesos en safetensors, la huella es reducida (el repo completo ocupa 1,7 GB, incluyendo checkpoints).
- GPU recomendadas: no disponibles en la información proporcionada; el comando de uso indica `--device cuda`, por lo que se espera una GPU compatible con CUDA.
- Cabe en GPU de consumo: probable por el tamaño del modelo, pero no confirmado en la documentación.
- Opciones de despliegue: LeRobot con el comando `act-rollout` (documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. Como referencia de categoría, ACT es una política de imitación ampliamente implementada en LeRobot, pero no se dispone de cifras de otros checkpoints ACT en OCBench para comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ámbito muy restringido: solo cubre pick-and-place con yaw de ±10 grados, posición de cubo en x 0,30–0,55 m e y 0,15–0,35 m, pose inicial fija y objetivo fijo (0,425, 0).
- Sensibilidad extrema al tamaño de chunk: ejecutar 50 acciones por chunk sin ensamblado temporal es obligatorio; otros tamaños degradan el éxito del 90% al 0%.
- Selección de checkpoint no estándar: el paso 80.000 se eligió por éxito en diagnóstico, no por pérdida de validación; replicar el entrenamiento con selección por pérdida produce un modelo fallido.
- Entrenado en simulación (MuJoCo); no hay evidencia de transferencia a robot físico.
- Riesgo de sobreajuste al entorno y a la distribución de 217 episodios; la generalización a colores distintos requiere ediciones de pesos específicas.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de los tests publicados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo carece de garantías y su aplicación fuera del entorno OCBench no está validada.

## Enlaces

- Hugging Face: https://huggingface.co/Autobrik/act-ocbench-blue-cube-narrow
- Dataset: https://huggingface.co/datasets/Autobrik/ocbench-blue-cube-narrow-delta
- Repositorio de código y resultados: https://github.com/BrikHMP18/act-weight-editing (ver `TRIAL1_RESULTS.md`)
- LeRobot: no disponible en la información proporcionada
