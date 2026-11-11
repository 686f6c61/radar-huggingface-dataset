# kdb6df/corl2026-suturebot-act

## Resumen

SutureBot ACT es un checkpoint de política robótica basado en Action Chunking Transformer (ACT), desarrollado por los autores de SutureBot (Haworth et al.) y publicado por el usuario kdb6df con permiso de los autores para el tutorial de CoRL 2026 *Robot Learning on the Path to Surgical Autonomy*. No es un modelo de lenguaje: es un modelo de imitación visual-motora que, a partir de tres vistas RGB de un entorno quirúrgico y un nombre de tarea, predice secuencias de acciones para un robot quirúrgico da Vinci Research Kit (dVRK).

El modelo resuelve el problema de generar trayectorias de sutura autónoma (recogida de aguja, lanzamiento de aguja y anudado) mediante aprendizaje por imitación sobre el dataset Open-H-Embodiment de NVIDIA. Con 122,7 M de parámetros, emplea codificadores de imagen EfficientNet-B3 condicionados por FiLM y embeddings de tarea DistilBERT, y produce chunks de 60 pasos a 30 Hz con 20 valores por paso (posición, dos columnas de la matriz de rotación relativa y ángulo de la pinza por brazo).

Su relevancia es doble: por un lado, es una copia de referencia reproducible para participantes de un tutorial académico; por otro, ilustra el estado del arte en políticas de imitación para robótica quirúrgica con requisitos de precisión subcentimétrica. El checkpoint publicado (0,5 GB) elimina el estado del optimizador del original de 1,4 GB sin alterar las predicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) con codificadores EfficientNet-B3 condicionados por FiLM y embeddings de tarea DistilBERT |
| Parametros totales | 122,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; horizonte de predicción de 60 pasos a 30 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; usa etiquetas de tarea: `needle pickup`, `needle throw`, `knot tying`) |
| Licencia | `suturebot-authors-permission` (publicado con permiso de los autores; sin licencia específica adjunta) |
| Formato de pesos | checkpoint PyTorch (`.ckpt` con `model_state_dict` y `epoch`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking Transformer), un transformer que mapea observaciones visuales y estado del robot a secuencias de acciones de horizonte fijo. En esta variante concreta, las tres imágenes (endoscopio izquierdo, muñeca izquierda y muñeca derecha) se procesan con codificadores EfficientNet-B3 modulados por FiLM, y la tarea se codifica como el embedding `[CLS]` de DistilBERT. La entrada de estado del robot se fija a ceros. La salida es un chunk de 60 pasos a 30 Hz con 20 valores: por brazo, cambio de posición, las dos primeras columnas de la matriz de rotación relativa y ángulo de la pinza. La pose absoluta se obtiene sumando el cambio a la pose medida, y el despliegue de los autores además resta la primera traslación predicha.

El entrenamiento se realizó por aprendizaje por imitación sobre el dataset Open-H-Embodiment de NVIDIA, con datos de sutura del sistema dVRK. El checkpoint publicado corresponde a la época 6311. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Como innovaciones destacables, el condicionamiento por tarea mediante DistilBERT permite multi-task en un único modelo, y el esquema de chunking con horizonte de 60 pasos reduce el error de composición típico de las políticas paso a paso.

## Capacidades

- Generación de trayectorias de manipulación quirúrgica: predice chunks de 60 acciones a 30 Hz para un robot dVRK de dos brazos.
- Multi-task: soporta tres tareas de sutura (`needle pickup`, `needle throw`, `knot tying`) seleccionables mediante una etiqueta de texto codificada con DistilBERT.
- Percepción visual multi-vista: procesa simultáneamente endoscopio izquierdo y las dos muñecas del robot.
- Control de pinza: predice ángulo de jaw además de posición y rotación relativa.
- Condicionamiento por puntos de inserción y salida: el checkpoint fue entrenado con puntos objetivo dibujados en la imagen del endoscopio para la tarea de lanzamiento de aguja.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es un modelo puramente visomotor.

## Casos de uso

- Investigación en sutura autónoma: el modelo sirve como política de referencia para reproducir los experimentos de SutureBot y como punto de partida para comparar nuevas políticas de imitación en el mismo benchmark.
- Docencia y tutoriales: es el checkpoint oficial de los segmentos 3 y 4 del tutorial de CoRL 2026, pensado para que los participantes ejecuten inferencia tras el evento con el notebook `OpenHTutorial_SutureBotACT_Inference.ipynb`.
- Evaluación offline de políticas: las predicciones precalculadas en `predictions/act_<episode>.npz` permiten comparar protocolos open-loop, chunk y dream sobre los clips 1441-1451 de Open-H-Embodiment sin necesidad de ejecutar el robot.
- Integración en pipelines de simulación: el wrapper `act_policy.py` devuelve poses 16-D (xyz + cuaternión xyzw + jaw) compatibles con GR00T-H, lo que facilita su uso en entornos simulados que esperan ese formato.
- Anudado de sutura sin anotaciones adicionales: la tarea `knot tying` (episodios 1445-1451) no requiere puntos objetivo, por lo que puede desplegarse directamente sobre clips de Open-H sin preprocesado extra.
- Base para fine-tuning con datos propios: al ser un checkpoint PyTorch de 122,7 M de parámetros, puede reentrenarse o adaptarse a otros setups quirúrgicos con recursos moderados (una sola GPU consumer es suficiente para inferencia).
- Estudio de condicionamiento multi-task: permite analizar cómo el embedding DistilBERT de la tarea modula la política y hasta qué punto el modelo generaliza entre tareas de sutura.

## Benchmarks y rendimiento

Los únicos datos publicados son errores de predicción offline sobre los clips 1441-1451 de Open-H-Embodiment, no resultados físicos de sutura:

| Episodio | Tarea | Frame inicial | MAE xyz open-loop (mm) | MAE jaw open-loop (rad) |
|---|---|---|---|---|
| 1441 | needle throw (sin puntos objetivo) | 345 | 1,26 | 0,082 |
| 1442 | needle throw (sin puntos objetivo) | 255 | 2,03 | 0,109 |
| 1443 | needle throw (sin puntos objetivo) | 270 | 2,00 | 0,080 |
| 1444 | needle throw (sin puntos objetivo) | 330 | 1,26 | 0,048 |
| 1445 | knot tying | 105 | 1,70 | 0,102 |
| 1446 | knot tying | 120 | 1,87 | 0,096 |
| 1447 | knot tying | 105 | 1,45 | 0,176 |
| 1448 | knot tying | 105 | 1,87 | 0,093 |
| 1449 | knot tying | 30 | 1,89 | 0,155 |
| 1450 | knot tying | 165 | 1,40 | 0,095 |
| 1451 | knot tying | 135 | 1,50 | 0,120 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo. El autor advierte explícitamente que estas comparaciones son demostrativas y no un benchmark, porque el split de entrenamiento no se registró y podría solaparse con clips de test de Open-H.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 122,7 M de parámetros en FP32 el peso ocupa aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo el proceso de los tres codificadores EfficientNet-B3.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia; para entrenamiento o fine-tuning se recomienda al menos una RTX 3090/4090 o una A100/H100 si se quiere aumentar el batch.
- Cabe en GPU consumer: sí, sin problema.
- Opciones de despliegue: el modelo se ejecuta con el código del repositorio SutureBot (rama ACT, `src/act/detr`), el notebook del segmento 3 o el wrapper `notebooks/segment4/server/act_policy.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo opera a 30 Hz, lo que fija un requisito de inferencia en tiempo real de 33 ms por chunk en despliegue físico, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SutureBot ACT (este) | 122,7 M | chunk de 60 pasos a 30 Hz | Imitación visomotora para sutura dVRK | `suturebot-authors-permission` | Hugging Face (kdb6df) |
| GR00T-H | no disponible | no disponible | Política generalista humanoide con formato de poses 16-D | no disponible | Referenciado en la model card |
| Cosmos-H-Dreams | no disponible | no disponible | Modelo de dinámica para el protocolo dream del segmento 4 | no disponible | Referenciado en la model card |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría. Los dos modelos citados aparecen únicamente como referencias en la model card y en el tutorial, sin especificaciones publicadas en la información disponible.

## Limitaciones y advertencias

- El lanzamiento de aguja requiere puntos de inserción y salida dibujados en la imagen del endoscopio; como Open-H no incluye esas anotaciones, los resultados en los episodios 1441-1444 son solo diagnósticos.
- El split de entrenamiento no se registró con el checkpoint, por lo que podría incluir clips del split de test de Open-H; las comparaciones sobre 1441-1451 son una demostración, no un benchmark.
- Los resultados publicados son comparaciones offline de acciones, no los resultados físicos de sutura del paper.
- La licencia `suturebot-authors-permission` no es una licencia estándar: los autores no han adjuntado una licencia específica y es necesario contactarles para cualquier uso distinto del tutorial.
- No es un modelo de lenguaje: no procesa texto libre, no soporta tool calling, agentes ni razonamiento multi-paso, y no tiene capacidades multilingües.
- Riesgo de alucinación en el sentido de predicciones visualmente plausibles pero físicamente inválidas: al ser una política de imitación, puede generalizar mal fuera de la distribución de Open-H (iluminación, instrumental, tejidos distintos).
- La entrada de estado del robot se fija a ceros, lo que limita la adaptación reactiva a perturbaciones externas.
- No se han publicado análisis de sesgos ni evaluaciones de robustez en entornos reales más allá del paper original.
- El checkpoint publicado elimina el estado del optimizador y del scheduler, por lo que no es directamente reanudable para entrenamiento sin reconstruir esos estados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kdb6df/corl2026-suturebot-act
- Repositorio SutureBot (rama ACT): https://github.com/SutureBot/SutureBot/tree/ACT
- Código del modelo: `src/act/detr` en el repositorio anterior
- Notebook de inferencia del segmento 3: `OpenHTutorial_SutureBotACT_Inference.ipynb`
- Wrapper del segmento 4: `notebooks/segment4/server/act_policy.py`
- Dataset Open-H-Embodiment: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-Open-H-Embodiment
- Paper SutureBot: https://arxiv.org/abs/2510.20965
- Web del proyecto SutureBot: https://suturebot.github.io
