# cnuland/llm-d-sc-reasoning-gate

## Resumen

`cnuland/llm-d-sc-reasoning-gate` es un clasificador de secuencia binario desarrollado por cnuland para el proyecto [llm-d-semantic-classifier](https://github.com/llm-d-incubation/llm-d-semantic-classifier). Su función es responder una única pregunta: ¿esta petición necesita un modelo de razonamiento? Devuelve `YES` o `NO` y se usa como puerta de enrutamiento semántico para decidir si una consulta debe enviarse a un modelo de razonamiento (más caro y lento) o a un modelo estándar.

El modelo se construye sobre `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 22,7 millones de parámetros, con una cabeza de clasificación de secuencia que lee logits. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors. No es un modelo generativo: es un componente ligero pensado para ejecutarse en CPU y añadir un overhead mínimo al enrutamiento.

Su relevancia actual radica en el ahorro de costes en sistemas que combinan varios modelos de lenguaje. Al clasificar rápidamente si una petición requiere razonamiento, permite evitar llamadas a modelos de razonamiento para consultas simples. La model card publica datos de precisión sobre tráfico real y un análisis honesto de sus puntos débiles, lo que facilita evaluar su idoneidad para despliegues concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) con cabeza de clasificación de secuencia; base `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia basado en `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 6 capas con embeddings de 384 dimensiones. Sobre la representación del token `[CLS]` se añade una cabeza lineal de clasificación binaria. La model card indica expresamente que requiere un runtime que lea logits, lo que implica que la clasificación se realiza sobre las puntuaciones crudas antes de aplicar softmax.

El entrenamiento se realizó con 418 filas procedentes de los conjuntos `reasoning-v2`, `reasoning-real`, `reasoning-active`, `reasoning-distill` y `reasoning-real-contested`. Estos datos mezclan tráfico real etiquetado por un jurado de tres modelos LLM con datos sintéticos generados a partir de una rúbrica, para cubrir categorías raras en el tráfico real. El prior de entrenamiento es `None`. Las muestras de evaluación se excluyeron por hash de contenido. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

La principal innovación técnica no está en la arquitectura, sino en el diseño del problema: en lugar de clasificar en una taxonomía de complejidad de cuatro niveles, el modelo reduce la decisión a una pregunta binaria que coincide con la rama real del enrutador. Esto simplifica la tarea y mejora la precisión en la decisión que realmente importa para el despliegue.

## Capacidades

- Clasificación binaria de peticiones en `NO` o `YES` para determinar si requieren un modelo de razonamiento.
- Enrutamiento semántico dentro del sistema `llm-d-sc`, como puerta previa a la selección de backend.
- Inferencia en CPU con latencia baja: p50 de 6,7 ms y p99 de 18,7 ms en un Apple M-series de un solo hilo.
- Manejo de tráfico real de consumidores, basado en el dataset WildChat-1M.
- No genera texto, no soporta tool calling, no tiene capacidades de visión ni de audio.
- No es un modelo multilingüe declarado; los idiomas soportados no están disponibles en la información publicada.

## Casos de uso

- Enrutamiento de peticiones en un sistema multi-modelo: el clasificador decide si una consulta debe ir a un modelo de razonamiento o a un modelo estándar, reduciendo el coste medio por petición en aplicaciones de chat.
- Optimización de costes en producción: al filtrar consultas simples que no necesitan razonamiento, se evita pagar por llamadas a modelos de razonamiento cuando no son necesarias.
- Reducción de latencia en pipelines de agentes: la clasificación se ejecuta en CPU en milisegundos, lo que permite decidir si activar un modo de razonamiento sin añadir un retraso perceptible al flujo.
- Componente de un semantic router: se integra en `llm-d-sc` para dirigir el tráfico hacia el backend adecuado según la complejidad de la tarea.
- Análisis de tráfico de usuarios: permite medir la proporción de peticiones que realmente requieren razonamiento, útil para dimensionar infraestructura o ajustar presupuestos.
- Control de llamadas a APIs de LLM: en un servicio que combina varios proveedores, el clasificador actúa como una primera barrera para decidir si una consulta merece un modelo de razonamiento o puede resolverse con uno más barato.
- Filtrado previo en sistemas de soporte: detecta preguntas complejas que necesitan más capacidad de razonamiento y las deriva a un modelo superior, mientras las consultas sencillas se atienden con un modelo rápido.

## Benchmarks y rendimiento

La model card publica resultados sobre dos conjuntos de evaluación de tráfico real. El conjunto "refined gold" fue re-adjudicado manualmente con mayor esfuerzo, mientras que "real traffic" usa etiquetas de un jurado unánime de tres modelos.

| Eval set | n | Accuracy | 95% CI | Macro F1 |
|---|---:|---:|---|---:|
| Real traffic, refined gold | 376 | 0.9654 | 0.942 – 0.980 | 0.9351 |
| Real traffic (WildChat, jurado unánime) | 418 | 0.9593 | 0.936 – 0.974 | 0.9275 |

Otros datos relevantes publicados:

- Precisión sobre el conjunto refined gold: 81,5%.
- Recall de la clase `YES`: 98,15%.
- Baseline de clase mayoritaria sobre refined gold: 85,64%. El modelo lo supera en 10,9 puntos.
- Precisión en la taxonomía completa de cuatro niveles: 0.8963, con un techo de acuerdo entre anotadores cercano a 0.926.
- El techo medido de la evaluación es aproximadamente 0.95, porque cerca del 4,9% de las etiquetas doradas son incorrectas.
- En las 176 filas donde el jurado se dividió, el modelo obtiene un 89,77% frente a un baseline mayoritario del 90,91%, es decir, queda por debajo del baseline en ese subconjunto.

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K, ya que este modelo no es un modelo generativo.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU, sin necesidad de GPU.
- Tamaño del repositorio: 0,1 GB, lo que incluye los pesos en safetensors.
- VRAM estimada: no aplica para inferencia en CPU. Si se desea ejecutar en GPU, no se dispone de datos de consumo de VRAM en la información publicada.
- GPU recomendada: ninguna. El caso de uso típico es servir el clasificador en CPU.
- Latencia: p50 de 6,7 ms y p99 de 18,7 ms por petición en un Apple M-series de un solo hilo.
- Opciones de despliegue: compatible con la librería `transformers`, con `text-embeddings-inference` y con endpoints compatibles de Hugging Face.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de la misma categoría en la información disponible. Como referencia interna, la model card compara el rendimiento del modelo con el baseline de clase mayoritaria:

| Modelo | Accuracy (refined gold) | Macro F1 | Precision | Recall YES |
|---|---:|---:|---:|---:|
| `llm-d-sc-reasoning-gate` | 0.9654 | 0.9351 | 0.815 | 0.9815 |
| Baseline de clase mayoritaria | 0.8564 | no disponible | no disponible | no disponible |

El modelo base `sentence-transformers/all-MiniLM-L6-v2` no es un clasificador de razonamiento, por lo que no es directamente comparable. Tampoco se dispone de datos de rendimiento para otros clasificadores de la familia `llm-d-sc` como `complexity` o `complexity-v2-mini`.

## Limitaciones y advertencias

- El dataset de entrenamiento procede de WildChat, que es tráfico de consumidores. Para el eje de sensibilidad, alrededor del 93% de las muestras son `PUBLIC`, por lo que el modelo no puede medir los niveles que controlan el egress en entornos empresariales.
- Las etiquetas de entrenamiento provienen de jurados de LLM, no de anotadores humanos. Aunque la rúbrica se validó reproduciendo etiquetas doradas hechas a mano, esto introduce un sesgo potencial.
- El modelo sobre-enruta un 3,7% de las peticiones que no requieren razonamiento hacia la ruta cara. La precisión es del 81,5%, lo que implica un coste adicional que debe evaluarse en cada despliegue.
- En las filas donde el jurado se divide, el modelo rinde por debajo del baseline mayoritario (89,77% frente a 90,91%). Estas filas representan aproximadamente el 30% del tráfico real para esta señal.
- La evaluación tiene un techo medido de alrededor de 0.95, no de 1.0, debido a errores en las propias etiquetas doradas. La precisión reportada debe interpretarse contra ese techo.
- El modelo no ha sido reproducido de forma independiente por terceros.
- Los resultados publicados corresponden a la primera semilla ejecutada (seed 11), no a la mejor semilla. Una segunda semilla (seed 22) alcanza una precisión ligeramente superior, pero no es la cifra oficial.
- No es un modelo generativo: no puede producir texto ni razonar por sí mismo. Su única función es clasificar peticiones.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos completos antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cnuland/llm-d-sc-reasoning-gate
- Repositorio del proyecto llm-d-semantic-classifier: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Modelo relacionado `cnuland/llm-d-sc-complexity`: https://huggingface.co/cnuland/llm-d-sc-complexity
- Modelo relacionado `cnuland/llm-d-sc-complexity-v2-mini`: https://huggingface.co/cnuland/llm-d-sc-complexity-v2-mini
