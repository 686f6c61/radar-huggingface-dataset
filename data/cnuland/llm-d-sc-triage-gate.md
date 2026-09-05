# cnuland/llm-d-sc-triage-gate

## Resumen

`cnuland/llm-d-sc-triage-gate` es un clasificador de texto binario desarrollado por `cnuland` para la familia de clasificadores semánticos `llm-d`. Su función es actuar como puerta de triaje (triage gate) en sistemas de enrutamiento de prompts para modelos de lenguaje: decide si una consulta es `TRIVIAL` (equivalente al nivel `SIMPLE` de una taxonomía de cuatro niveles) y puede resolverse con un modelo pequeño o una caché, o si es `WORK` (niveles `MEDIUM`, `COMPLEX` y `REASONING`) y requiere el modelo principal. El objetivo es optimizar costes y latencia en pipelines de LLM.

La arquitectura consiste en una cabeza de clasificación de secuencias (sequence classification head) sobre el modelo base `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer compacto. El modelo tiene 22.713.986 parámetros y un tamaño de repositorio de 0.1 GB. La longitud de contexto no está especificada en la información disponible, al tratarse de un clasificador de secuencias y no de un modelo generativo.

La relevancia del modelo radica en que su corte binario no fue elegido por intuición, sino por medición: se enumeraron todos los cortes contiguos posibles de la taxonomía de cuatro niveles y se seleccionó el que maximizaba el acuerdo entre tres modelos jurado. Frente al "route gate" alternativo (SIMPLE+MEDIUM vs COMPLEX+REASONING), este modelo obtiene una precisión de 0.9601 frente a 0.9269, con una línea base de mayoría casi idéntica, lo que supone una mejora de +3.32 puntos al elegir la separación por datos en lugar de por criterio manual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación de secuencias sobre `sentence-transformers/all-MiniLM-L6-v2` (transformer encoder) |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de 6 capas con dimensiones ocultas de 384, que se utiliza como extractor de características. Sobre esta base se añade una cabeza de clasificación de secuencias que lee los logits de salida para producir una predicción binaria entre las etiquetas `TRIVIAL` y `WORK`. El modelo se sirve con la librería `transformers` y es compatible con `text-embeddings-inference` y endpoints de Hugging Face.

El entrenamiento se realizó sobre 418 filas de datos que combinan tráfico real etiquetado por jurado (procedente de `WildChat-1M`) con datos sintéticos generados a partir de una rúbrica. Las etiquetas fueron producidas de forma independiente por tres modelos de lenguaje (`claude-opus-5`, `claude-sonnet-5` y `claude-fable-5-1`) sin que ningún anotador viera una etiqueta propuesta, por lo que el acuerdo entre ellos se considera evidencia, no asentimiento. Solo se puntuaron las filas con acuerdo unánime. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado de clasificación.

La innovación técnica destacable es la selección del corte binario por medición: se evaluaron todos los cortes contiguos de la taxonomía de cuatro niveles y se eligió el que maximizaba el acuerdo entre tres jurados. El corte resultante (`SIMPLE` vs `MEDIUM+COMPLEX+REASONING`) alcanzó un 86.9% de acuerdo entre jurados y un 19.0% de clase minoritaria, frente al 82.0% y 24.6% del "route gate" alternativo.

## Capacidades

- Clasificación binaria de complejidad de prompts: distingue entre `TRIVIAL` (consultas simples) y `WORK` (consultas de complejidad media, alta o que requieren razonamiento).
- Actúa como puerta de enrutamiento semántico en pipelines de LLM, permitiendo desviar consultas triviales a modelos pequeños o cachés.
- Integración con el repositorio `llm-d-semantic-classifier` y con sistemas de enrutamiento semántico.
- Soporte de inferencia en CPU con latencia baja: p50 4.37 ms y p99 9.78 ms en un Apple M-series con un solo hilo.
- No es un modelo generativo: no soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidades multilingües no especificadas en la información disponible.

## Casos de uso

- Enrutamiento de prompts en producción: el modelo decide en tiempo real si una petición puede ser respondida por un modelo pequeño o una caché, o si debe enviarse al modelo principal, reduciendo costes y latencia.
- Optimización de costes en sistemas LLM: consultas triviales como "¿cuál es la capital de Francia?" se clasifican como `TRIVIAL` y se desvían a respuestas precalculadas, ahorrando tokens del modelo grande.
- Filtrado de consultas en agentes conversacionales: evita que preguntas simples consuman recursos de razonamiento de un agente multi-paso, reservando la capacidad de cómputo para tareas complejas.
- Clasificación de tickets de soporte: distingue entre consultas de usuario que pueden resolverse con una respuesta automática y las que requieren intervención humana o análisis más profundo.
- Preprocesamiento de datos para análisis de complejidad: etiqueta grandes volúmenes de prompts para estudiar la distribución de complejidad en un corpus de tráfico real.
- Integración con semantic-router: sirve como puerta de entrada en sistemas de enrutamiento basados en semántica, permitiendo filtrar consultas antes de que lleguen al modelo de razonamiento principal.

## Benchmarks y rendimiento

La siguiente tabla resume los resultados de precisión y F1 reportados por el autor en la model card, evaluados sobre tráfico real (WildChat-1M) con etiquetas refinadas por re-adjudicación humana de alto esfuerzo y con etiquetas de jurado unánime.

| Eval set | n | Accuracy | 95% CI | Macro F1 |
|---|---:|---:|---|---:|
| Real traffic, refined gold (re-adjudicación de alto esfuerzo) | 376 | 0.9601 | 0.935 – 0.976 | 0.9391 |
| Real traffic (WildChat, jurado unánime de 3 modelos) | 418 | 0.9593 | 0.936 – 0.974 | 0.9375 |

Otros datos de rendimiento relevantes:

- Línea base de mayoría: 80.32%. El modelo la supera en 15.7 puntos.
- Recall de `TRIVIAL`: 94.59% sobre una clase que representa el 19.7% del conjunto de evaluación.
- Precisión de `TRIVIAL`: 86.42%, lo que implica que aproximadamente un 5% de los prompts `WORK` se envían por el camino barato, el error a vigilar.
- En las 176 filas donde el jurado se dividió, el modelo obtiene un 80.11% de precisión frente a una línea base de mayoría de 82.95%, quedando por debajo. El recall de `TRIVIAL` en estas filas cae al 43.33%.
- El techo de evaluación medido es de aproximadamente 0.95, no 1.0, debido a que alrededor del 4.9% de las etiquetas doradas son incorrectas. Un clasificador perfecto contra este conjunto alcanzaría ese valor.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los pesos ocupan aproximadamente 0.1 GB y pueden cargarse completamente en CPU.
- GPU recomendadas: no aplica. El modelo está diseñado para servirse en CPU, como indica la model card.
- Compatibilidad con GPU de consumo: no necesaria, aunque puede ejecutarse en cualquier GPU si se desea.
- Opciones de despliegue: `transformers`, `text-embeddings-inference`, `endpoints_compatible`. Puede integrarse con plataformas de Hugging Face.
- Latencia estimada: p50 4.37 ms y p99 9.78 ms por petición en CPU de Apple M-series con un solo hilo. El rendimiento por réplica depende directamente del tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Rendimiento |
|---|---|---:|---|---|
| `cnuland/llm-d-sc-triage-gate` | 22.7M | Clasificador binario (TRIVIAL vs WORK) | Apache-2.0 | Accuracy 0.9601 sobre tráfico real refinado |
| `cnuland/llm-d-sc-genlen-gate` | 22.7M | Clasificador de texto | Apache-2.0 | no disponible |
| `cnuland/llm-d-sc-egress-gate` | 22.7M | Clasificador de texto | Apache-2.0 | no disponible |

Los tres modelos pertenecen a la misma familia de clasificadores semánticos `llm-d-sc`, tienen un tamaño similar y la misma licencia. No se han publicado resultados de benchmarks para `genlen-gate` ni `egress-gate` en la información disponible, por lo que no es posible realizar una comparación de rendimiento directa.

## Limitaciones y advertencias

- Los datos de entrenamiento provienen de `WildChat-1M`, que representa tráfico de consumidores y no es representativo del tráfico empresarial, como señala el autor.
- Las etiquetas fueron generadas por modelos de lenguaje, no por anotadores humanos. La rúbrica se validó reproduciendo etiquetas doradas hechas a mano (complejidad 0.9875, coste 1.000, sensibilidad 1.000), pero no hay reproducción independiente del modelo.
- El punto débil del modelo aparece en filas disputadas: cuando el jurado se divide, la precisión cae por debajo de la línea base de mayoría y el recall de `TRIVIAL` se reduce al 43.33%. Estas filas representan aproximadamente el 30% del tráfico real para esta señal.
- La precisión de `TRIVIAL` es del 86.42%, lo que significa que alrededor de un 5% de los prompts `WORK` se clasifican erróneamente como triviales y se envían por el camino barato, un error que puede ser relevante si el modelo pequeño o la caché es mucho más débil.
- El techo de evaluación es de aproximadamente 0.95, no 1.0, debido a errores en las etiquetas doradas (~4.9%). La precisión medida puede estar ligeramente sobreestimada.
- La longitud de contexto y los idiomas soportados no están especificados, por lo que no se garantiza un comportamiento multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cnuland/llm-d-sc-triage-gate
- Repositorio del proyecto: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Dataset de tráfico real: https://huggingface.co/datasets/allenai/WildChat-1M
- Modelo relacionado `llm-d-sc-genlen-gate`: https://huggingface.co/cnuland/llm-d-sc-genlen-gate
- Modelo relacionado `llm-d-sc-egress-gate`: https://huggingface.co/cnuland/llm-d-sc-egress-gate
