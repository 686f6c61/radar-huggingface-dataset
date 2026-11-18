# kiteml/trossen-bin-picking-sim-act-cup-baseline-90k

## Resumen

`kiteml/trossen-bin-picking-sim-act-cup-baseline-90k` es una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers) desarrollada por Kite (kiteml). Resuelve una tarea concreta de manipulación bimanual: recoger un vaso rojo y depositarlo en una bandeja transparente con una estación WidowX AI simulada. El modelo consume las imágenes de cuatro cámaras y las 14 posiciones articulares del robot para emitir 14 objetivos articulares en bloques de 100 pasos (action chunking).

Se trata de un modelo pequeño (51.685.006 parámetros, unos 0,2 GB en safetensors) entrenado durante 90.000 pasos con batch 8 sobre una única A100, lo que supone unas 4 horas de cómputo. Es relevante como referencia reproducible de políticas ACT para benchmarking en robótica simulada: el autor publica los resultados de evaluación cerrada en bucle sobre cuatro condiciones de iluminación y disposición de objetos, junto con las comparaciones frente a otras cuatro políticas entrenadas con los mismos datos o con variantes.

La limitación principal es que el modelo no lee instrucciones en lenguaje natural: está especializado exclusivamente en el vaso rojo y no se ha probado en un robot físico. La licencia Apache-2.0 facilita su reutilización comercial y su integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. En este caso, la entrada son cuatro cámaras y 14 posiciones articulares; la salida son 14 objetivos articulares emitidos en bloques de 100 pasos. El modelo no incorpora un codificador de instrucciones en lenguaje natural, por lo que la tarea está fijada de antemano (recogida del vaso rojo y depósito en la bandeja).

El entrenamiento se realizó sobre las 17 episodios del split de entrenamiento del dataset `kiteml/trossen-bin-picking-sim-baseline`, que suman 6.867 fotogramas, durante 90.000 pasos con batch 8 en una A100 (aproximadamente 4 horas). Los datos derivan del dataset público `bin_picking` de Trossen Robotics (Apache-2.0) y del entrenamiento se empleó LeRobot (Apache-2.0). No se documenta el uso de RLHF, DPO ni otras fases de alineación, algo esperable en una política de imitación supervisada.

## Capacidades

- Control robótico bimanual de una estación WidowX AI simulada: recogida del vaso rojo y colocación en la bandeja transparente.
- Fusión de cuatro cámaras y 14 posiciones articulares como entrada sensorial.
- Predicción de 14 objetivos articulares en chunks de 100 pasos.
- Ejecución en bucle cerrado en simulación con variaciones de iluminación (luz de sala, baja, cálida) y con objetos adicionales sobre la mesa.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No soporta instrucciones en lenguaje natural: la tarea está fijada al vaso rojo.
- No dispone de capacidades multilingües, de visión general ni de audio.

## Casos de uso

- Benchmark de políticas ACT en robótica simulada: sirve como referencia reproducible (90.000 pasos) frente a variantes de 30.000 pasos y frente a políticas entrenadas con todos los objetos, permitiendo comparar el efecto del número de pasos y de la especialización.
- Investigación en imitación con action chunking: útil para estudiar cómo el tamaño del chunk (100 pasos) y el número de cámaras afectan a la tasa de éxito en tareas de pick-and-place.
- Evaluación de robustez ante condiciones de iluminación: el autor reporta tasas de éxito diferenciadas por condición (luz de sala, baja y cálida), lo que permite usar el modelo como caso de estudio de sensibilidad a la iluminación.
- Docencia y reproducción de pipelines LeRobot: el modelo se carga con `ACTPolicy.from_pretrained` en LeRobot 0.6 o superior, lo que facilita su uso en cursos y talleres de robótica.
- Punto de partida para fine-tuning en tareas de bin picking: al estar entrenado sobre un dataset público de Trossen, puede servir como inicialización para variantes con otros objetos o layouts.
- Validación de simuladores: al evaluarse en una copia simulada de la estación, puede emplearse para contrastar la fidelidad de simuladores frente a grabaciones reales (el autor compara con la política entrenada con grabaciones reales).

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre una copia simulada de la estación, 20 ejecuciones por test en dos layouts de vaso reservados (held-out). Se muestran las colocaciones exitosas por condición y el total sobre 80.

| Política | Luz de sala | Luz baja | Luz cálida | Objetos extra | Total (de 80) |
|---|---|---|---|---|---|
| Este modelo (cup baseline, 90k) | 8/20 | 3/20 | 5/20 | 10/20 | 26/80 |
| Cup real, 30k | 10/20 | 8/20 | 8/20 | 7/20 | 33/80 |
| Cup baseline, 30k | 5/20 | 0/20 | 0/20 | 7/20 | 12/80 |
| All seven, 30k | 2/20 | 0/20 | 3/20 | 1/20 | 6/80 |
| All seven, 90k | 2/20 | 3/20 | 1/20 | 3/20 | 9/80 |

Todas las colocaciones se producen en el layout en el que el brazo izquierdo recoge el vaso. Los tests, límites y ejecuciones completas están en el repositorio `kite-ml/trossen-bin-picking-sim-datasets`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors (0,2 GB de repo), la huella de pesos es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el entrenamiento se realizó en una A100; para inferencia basta con una GPU de consumo moderna (por ejemplo, RTX 3060 o superior), aunque el dato no está publicado.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros); no se especifican requisitos mínimos exactos.
- Opciones de despliegue: LeRobot 0.6 o superior mediante `ACTPolicy.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito (total de 80) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cup baseline, 90k) | 51.685.006 | no aplica | 26/80 | Apache-2.0 | Hugging Face |
| `kiteml/trossen-bin-picking-sim-act-cup-baseline` (30k) | no disponible | no aplica | 12/80 | Apache-2.0 | Hugging Face |
| `kiteml/trossen-bin-picking-act-cup-real` (30k) | no disponible | no aplica | 33/80 | Apache-2.0 | Hugging Face |
| `kiteml/trossen-bin-picking-sim-act-cup-all` (30k) | no disponible | no aplica | 6/80 | Apache-2.0 | Hugging Face |
| `kiteml/trossen-bin-picking-sim-act-cup-all-90k` | no disponible | no aplica | 9/80 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Especialización estricta: solo recoge el vaso rojo; no lee instrucciones y no generaliza a otros objetos.
- Solo simulación: el autor indica explícitamente que no se ha probado en un robot real.
- Tasa de éxito moderada: 26 de 80 colocaciones en la evaluación cerrada, con un mínimo de 3/20 en luz baja.
- Sensibilidad a la iluminación: el rendimiento cae notablemente en luz baja y cálida frente a luz de sala.
- Dependencia del layout: todas las colocaciones exitosas ocurren en el layout donde el brazo izquierdo recoge el vaso.
- Riesgo de sobreajuste a los 17 episodios de entrenamiento (6.867 fotogramas), un volumen reducido.
- No se documentan sesgos demográficos ni de otro tipo (no procesa datos humanos), pero tampoco se documenta ningún análisis de robustez más allá de las condiciones evaluadas.
- Licencia Apache-2.0: permite uso comercial, pero el modelo deriva del dataset `bin_picking` de Trossen Robotics (Apache-2.0) y de LeRobot (Apache-2.0); conviene conservar los avisos de atribución.
- No apto para producción física sin validación previa en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-baseline-90k
- Dataset de entrenamiento: https://huggingface.co/datasets/kiteml/trossen-bin-picking-sim-baseline
- Variante 30k: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-baseline
- Política entrenada con grabaciones reales: https://huggingface.co/kiteml/trossen-bin-picking-act-cup-real
- Política con todos los objetos (30k): https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-all
- Política con todos los objetos (90k): https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-all-90k
- Tests y ejecuciones: https://github.com/kite-ml/trossen-bin-picking-sim-datasets
- Sitio del autor: https://kiteml.com
