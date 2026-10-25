# IkerAzurmendi/act-pick-v3-1piece-4800

## Resumen

`act-pick-v3-1piece-4800` es una política de imitación (policy) para robótica manipulativa, no un modelo de lenguaje. La publica el usuario IkerAzurmendi en Hugging Face dentro del ecosistema LeRobot y resuelve una tarea muy concreta sobre el brazo SO-101: coger una pieza de una caja y sostenerla frente a la cámara. La arquitectura es ACT (Action Chunking with Transformers), con 51.658.374 parámetros y un checkpoint correspondiente al paso 4.800 de un entrenamiento de 12.000 pasos.

El modelo consume dos cámaras (frontal y de muñeca) y las seis posiciones articulares del robot, y devuelve un chunk de 90 objetivos articulares futuros a 30 fps, es decir, 3 segundos de trayectoria por inferencia. Se entrenó con 292 episodios que comienzan con exactamente una pieza, aplicando filtros de calidad laxos, y se publica por completitud: el propio autor indica que no es el mejor checkpoint de su ejecución (el de 9.600 pasos obtiene mejor error offline).

Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline LeRobot completo (datos, receta de entrenamiento, evaluación offline sobre episodios retenidos) y como punto de partida para quien trabaje con SO-101 y políticas ACT. Ninguno de los checkpoints de esta ronda se ha validado en el robot real, por lo que las métricas disponibles son únicamente offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación transformer con chunking de acciones |
| Parametros totales | 51.658.374 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto. Entrada: imagen de cámara frontal, imagen de cámara de muñeca y 6 posiciones articulares. Salida: chunk de 90 acciones (3 s a 30 fps) |
| Tipos de cuantizacion | No disponible. Pesos publicados en safetensors; el repositorio ocupa 0,2 GB, coherente con precisión completa para 51,7 M de parámetros |
| Idiomas soportados | No disponible / no aplica (modelo de robótica sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline declarado | `robotics` |
| Tarea | Pick de una pieza desde una caja y presentación ante la cámara (SO-101) |
| Frecuencia de control | 30 fps |
| Replanificación | Cada 30 pasos de acción |
| Checkpoint | Paso 4.800 de 12.000 |
| Episodios de entrenamiento | 292 |

## Arquitectura y entrenamiento

ACT es un método de imitación basado en transformer que predice bloques de acciones futuras en lugar de una acción por paso, lo que reduce el error acumulado y suaviza la ejecución. En este caso el chunk es de 90 objetivos articulares, la observación combina dos vistas de cámara con el estado de las seis articulaciones del SO-101, y la replanificación se realiza cada 30 pasos de acción (aproximadamente una vez por segundo a 30 fps). El repositorio no detalla el número de capas, dimensión del modelo ni el backbone visual empleado.

El entrenamiento se hizo con la función `train()` de LeRobot, batch de 8, chunk de 90, aumento de imagen por defecto y semilla 1000, sobre 292 episodios a 30 fps en los que hay exactamente una pieza al inicio. Los filtros de datos aplicados son: duración entre 3 y 20 s (el conjunto construido contiene 5 a 20 s), hueco inicial de como máximo 30 grados, como máximo 5 s de inactividad en cualquiera de los extremos, error medio acción-estado de como máximo 8 grados, al menos una apertura del gripper y eliminación de tomas malas conocidas. Los filtros se describen como laxos. No se menciona uso de RLHF, DPO ni ajuste por refuerzo; es imitación supervisada pura sobre demostraciones.

## Capacidades

- Generación de trayectorias articulares: produce chunks de 90 objetivos de posición para las seis articulaciones del SO-101 a 30 fps.
- Percepción visual multimodal: integra simultáneamente cámara frontal y cámara de muñeca junto con el estado propioceptivo del brazo.
- Ejecución de la tarea pick: coger una pieza de una caja y sostenerla frente a la cámara.
- Control de gripper: el entrenamiento exige al menos una apertura del gripper por episodio, por lo que el modelo aprende a abrir y cerrar la pinza dentro de la secuencia.
- Replanificación periódica: permite cerrar el bucle de control cada 30 pasos de acción con realimentación de las cámaras.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni modo thinking. No tiene capacidades de lenguaje, audio ni visión generalista.
- Multilingüismo: no aplica.

## Casos de uso

- Manipulación pick-and-place con SO-101: el modelo se ejecuta en bucle cerrado sobre el brazo para recoger una pieza y presentarla a la cámara, con replanificación cada segundo gracias al chunk de 90 acciones.
- Baseline reproducible para investigación en imitación: sirve para comparar recetas de datos y checkpoints dentro del mismo pipeline LeRobot, ya que el autor publica la curva completa de error offline por paso.
- Estudio del efecto del filtrado de datos: al existir variantes con filtros estrictos (205 episodios) y sin filtrar (398 episodios), permite analizar empíricamente cómo afecta la selección de demostraciones al error del modelo.
- Evaluación offline estandarizada: el protocolo de 16 episodios retenidos con métrica de error absoluto medio frente a una baseline de "quedarse quieto" se puede reutilizar como test de regresión al reentrenar.
- Docencia y prototipado en robótica de bajo coste: un checkpoint de 51,7 M de parámetros y 0,2 GB se puede cargar en un portátil con GPU de consumo para experimentar con LeRobot sin infraestructura dedicada.
- Recolección de datos aumentada: usar el modelo como política inicial para generar rollouts y detectar fallos de agarre antes de recoger más demostraciones humanas.
- Integración en pipelines de evaluación automática: al ser safetensors y cargarse con LeRobot, se puede incorporar en scripts de CI que midan el error de predicción sobre un conjunto fijo de episodios.

## Benchmarks y rendimiento

El autor publica una evaluación offline sobre 16 episodios retenidos: 12 del conjunto `so101-pick-cube_20261024_181939` (una pieza) y 4 de `so101-pick-cube_20261024_144537` (dos piezas). La métrica es el error absoluto medio de las articulaciones sobre el chunk predicho (menor es mejor), con una baseline de "mantener las posiciones articulares actuales" de 20,71.

| Checkpoint de esta ejecución | Error | Por debajo de la baseline |
|---|---|---|
| 2.400 pasos | 16,00 | 23% |
| 4.800 pasos (este modelo) | 15,82 | 24% |
| 7.200 pasos | 15,70 | 24% |
| 9.600 pasos | 15,47 | 25% |
| 12.000 pasos | 15,86 | 23% |

Comparación con el mejor checkpoint de cada ejecución de la misma ronda:

| Ejecución | Episodios de entrenamiento | Mejor checkpoint | Error | Por debajo de la baseline | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% | act-pick-v3-6000 |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% | act-pick-v3-strict-2400 |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26% | act-pick-v2-6000 |
| chunk 60 (baseline propia 16,23) | 331 | 4,8k | 11,94 | 26% | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9,6k | 15,47 | 25% | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% | act-pick-v3-recent-12000 |
| primera ejecución | 165 | 6k | 16,87 | 19% | act-pick-* |

No hay resultados de benchmarks en robot real, ni MMLU, HumanEval, GSM8K ni métricas de éxito de agarre: el propio autor advierte que el error offline no permite determinar qué modelo agarra mejor y que ninguno se ha probado en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en precisión completa (51,7 M de parámetros) y alrededor de 0,1 GB en fp16. Cabe holgadamente en cualquier GPU de consumo e incluso en CPU para inferencia puntual.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente; para entrenamiento con batch 8 y dos flujos de imagen se recomienda una GPU dedicada de gama media o superior, aunque no hay cifras publicadas.
- Cabe en GPU de consumo: sí, por el tamaño del modelo. El cuello de botella real es el pipeline de cámaras y el bucle de control a 30 fps, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot`) con PyTorch como vía natural de carga; al ser safetensors se puede servir con scripts propios. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 30 fps con replanificación cada 30 pasos de acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Error offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-v3-1piece-4800 (este) | 51,66 M | chunk de 90 acciones, 30 fps | 15,82 (24% bajo baseline) | Apache 2.0 | Hugging Face, 0 descargas |
| act-pick-v3-1piece-9600 | no disponible (misma familia) | chunk de 90 acciones, 30 fps | 15,47 (25% bajo baseline) | Apache 2.0 | Hugging Face |
| act-pick-v3-chunk60-4800 | no disponible (misma familia) | chunk de 60 acciones | 11,94 sobre baseline propia de 16,23 (26%) | Apache 2.0 | Hugging Face |
| act-pick-v3-6000 (super) | no disponible (misma familia) | chunk de 90 acciones, 30 fps | 15,16 (27% bajo baseline) | Apache 2.0 | Hugging Face |

No se dispone de datos para comparar con otras familias de políticas de imitación (Diffusion Policy, VQ-BeT u otras integradas en LeRobot): la información proporcionada no incluye métricas comunes ni evaluaciones en robot.

## Limitaciones y advertencias

- No validado en robot real: todos los resultados son offline y el autor afirma explícitamente que el error de predicción no indica qué checkpoint agarra mejor.
- Checkpoint subóptimo por diseño: dentro de su propia ejecución, el paso 9.600 tiene menor error (15,47 frente a 15,82); este se publica solo por completitud.
- Sesgo de datos hacia una única pieza: se entrenó solo con episodios que empiezan con exactamente una pieza, y únicamente 4 de los 16 episodios de validación contienen dos piezas, por lo que la generalización a configuraciones distintas es dudosa.
- Filtros de calidad laxos: la selección de episodios admite hasta 5 s de inactividad en los extremos y huecos iniciales de hasta 30 grados, lo que puede introducir demostraciones poco informativas.
- Sobreajuste tras una pasada sobre los datos: el autor señala que todas las ejecuciones empeoraron después de aproximadamente una época, con el paso 12.000 de esta ejecución en 15,86.
- Dependencia del montaje físico: asume dos cámaras (frontal y muñeca) y un SO-101 con seis articulaciones; cambios de cámara, iluminación o calibración invalidan la política.
- Sin capacidades de lenguaje ni generalización de tarea: no acepta instrucciones en lenguaje natural ni puede ejecutar otras tareas de manipulación.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo se distribuye sin garantías y sin validación de seguridad física; su uso en un robot real requiere límites de par, paradas de emergencia y supervisión.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-4800
- Perfil del autor: https://huggingface.co/IkerAzurmendi
- Checkpoint mejor de la misma ejecución: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Ejecución con todos los datos que pasan el filtro de calidad: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Ejecución con filtros estrictos: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Ejecución sobre episodios de una y dos piezas: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Ejecución con chunk de 60: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Ejecución anterior v2: https://huggingface.co/IkerAzurmendi/act-pick-v2-6000
- Ejecución con solo sesiones recientes: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- No se han encontrado en la información disponible blogs, demos ni documentos adicionales del autor.
