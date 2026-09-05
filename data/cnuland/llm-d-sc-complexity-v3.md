# cnuland/llm-d-sc-complexity-v3

## Resumen

`cnuland/llm-d-sc-complexity-v3` es un clasificador de texto especializado en determinar la complejidad de un prompt para enrutar la consulta hacia un modelo pequeño o hacia el modelo principal. Lo desarrolla `cnuland` como parte del proyecto `llm-d semantic classifier`, y su función es actuar como un gate de triage dentro de un sistema de enrutamiento semántico para modelos de lenguaje. El modelo resuelve el problema de optimizar costes y latencia en sistemas LLM al distinguir entre consultas triviales (que pueden atenderse con un modelo pequeño o una caché) y consultas que requieren un modelo más potente.

Arquitectónicamente es un Transformer encoder basado en `sentence-transformers/all-MiniLM-L6-v2` con una cabeza de clasificación de secuencia que produce dos etiquetas: `TRIVIAL` y `WORK`. Tiene 22.713.986 parámetros totales y se distribuye con licencia Apache 2.0. La longitud de contexto no se especifica en la información disponible. El modelo está pensado para ejecutarse en CPU, con una latencia media de 4,37 ms por petición, y se presenta como la versión recomendada para el enrutamiento de complejidad en `llm-d-sc`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza de clasificación de secuencia; base `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia construido sobre el encoder `all-MiniLM-L6-v2`. La cabeza de clasificación genera logits para dos clases (`TRIVIAL` y `WORK`), por lo que el runtime de inferencia debe ser capaz de leer logits y no solo embeddings. No se trata de un modelo generativo ni de un modelo de embeddings puro, sino de un clasificador de triage.

Los datos de entrenamiento consisten en 418 filas que mezclan tráfico real etiquetado por un jurado de tres modelos (`claude-opus-5`, `claude-sonnet-5`, `claude-fable-5-1`) con datos sintéticos generados a partir de la rúbrica de complejidad. Las fuentes incluyen `triage-v2`, `triage-real`, `triage-active`, `triage-distill` y `triage-real-contested`. No se menciona el uso de RLHF ni DPO. La innovación principal es la selección del split binario: en lugar de usar la partición que el router ya implementaba (`SIMPLE+MEDIUM` frente a `COMPLEX+REASONING`), se eligió una partición `SIMPLE` frente a `MEDIUM+COMPLEX+REASONING` basándose en el acuerdo entre jurados, que resultó 3,32 puntos superior en términos de accuracy sobre la línea base.

## Capacidades

- Clasificación binaria de complejidad de prompts: distingue entre `TRIVIAL` y `WORK`.
- Enrutamiento semántico: decide si una consulta puede ser servida por un modelo pequeño o una caché, o si necesita el modelo principal.
- Integración como gate de triage en el proyecto `llm-d semantic classifier`.
- Compatible con `text-embeddings-inference` y pipelines de `transformers` (text-classification).
- Diseñado para funcionar en CPU con baja latencia (p50 4,37 ms).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de consultas en producción: el modelo clasifica cada prompt entrante como `TRIVIAL` o `WORK`, permitiendo enviar las consultas triviales a un modelo pequeño o a una caché y reservar el modelo principal para las consultas complejas. Su latencia de 4,37 ms en CPU hace viable este paso en tiempo real.
- Optimización de costes en sistemas LLM: al identificar que alrededor del 19,7% del tráfico real es `TRIVIAL`, el sistema puede reducir el uso del modelo grande sin degradar la experiencia en la mayoría de los casos.
- Gate de caché semántica: las consultas clasificadas como `TRIVIAL` pueden servirse desde una caché de respuestas, evitando el coste de una inferencia completa.
- Priorización de colas de trabajo: en entornos con GPU limitadas, el clasificador permite asignar presupuesto de cómputo a los prompts `WORK` y dejar los `TRIVIAL` para recursos de menor coste.
- Monitorización de tráfico de usuarios: al desplegar el clasificador sobre datos como WildChat, se puede medir la proporción de consultas triviales y de trabajo en el tráfico real, útil para dimensionar la infraestructura.
- Evaluación de taxonomías de complejidad: el modelo sirve como referencia para comparar splits binarios frente a taxonomías de 4 niveles; la documentación indica que el split de este modelo tiene un acuerdo entre jurados del 86,9% frente al 82,0% del split desplegado anteriormente.

## Benchmarks y rendimiento

| Evaluación | n | Accuracy | IC 95% | Macro F1 |
|---|---|---:|---:|---:|
| Tráfico real, gold refinado (readjudicación de alta calidad) | 376 | 0,9601 | 0,935 – 0,976 | 0,9391 |
| Tráfico real (WildChat, jurado unánime de 3 modelos) | 418 | 0,9593 | 0,936 – 0,974 | 0,9375 |

| Métrica adicional | Valor |
|---|---|
| Accuracy | 96,01% |
| Línea base mayoritaria | 80,32% |
| Lift sobre línea base | +15,69 puntos |
| Latencia p50 (CPU, Apple M-series, un solo hilo) | 4,37 ms |
| Latencia p99 (CPU, Apple M-series, un solo hilo) | 9,78 ms |
| Recall TRIVIAL | 94,59% |
| Precisión TRIVIAL | 86,42% |

La evaluación tiene un techo medido: aproximadamente el 4,9% de las etiquetas gold son incorrectas, por lo que un clasificador perfecto alcanzaría alrededor de 0,95 de accuracy frente a este dataset, no 1,0. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; dado el tamaño de 22,7 M parámetros, el modelo es muy ligero y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no disponible; el proyecto `llm-d-sc` sirve el clasificador en CPU.
- Cabe en cualquier GPU de consumo: sí, por su reducido tamaño, aunque no hay datos específicos de despliegue en GPU en la información disponible.
- Opciones de despliegue: `transformers` (pipeline text-classification), `text-embeddings-inference` (según los tags del repositorio), y cualquier runtime que pueda leer logits de una cabeza de clasificación de secuencia.
- Latencia: p50 4,37 ms y p99 9,78 ms en CPU con un solo hilo (Apple M-series). El modelo se sirve en CPU, por lo que el tamaño del modelo se intercambia directamente con el rendimiento por réplica.

## Comparativa con modelos similares

| Modelo | Tipo de split | Accuracy | Acuerdo entre jurados | Parámetros |
|---|---|---|---|---|
| `llm-d-sc-complexity-v3` (este modelo) | 2 clases (TRIVIAL / WORK) | 0,9601 | 86,9% | 22.713.986 |
| `llm-d-sc-complexity-v2` | 4 niveles (SIMPLE, MEDIUM, COMPLEX, REASONING) | 0,8963 | No disponible | No disponible |
| `llm-d-sc-route-gate` | 2 clases (SIMPLE+MEDIUM / COMPLEX+REASONING) | 0,9269 | 82,0% | No disponible |

El modelo v3 supera a sus predecesores en accuracy y en acuerdo entre jurados. La comparación es interna a la familia `llm-d-sc`; no se dispone de comparativas con modelos externos de clasificación de complejidad.

## Limitaciones y advertencias

- En las 176 filas donde el jurado de tres modelos se dividió, el modelo puntúa un 80,11% frente a una línea base mayoritaria del 82,95%, es decir, por debajo del azar. El recall de `TRIVIAL` en esas filas cae al 43,33%. Estas filas en disputa representan aproximadamente el 32% del tráfico real.
- La confianza del modelo no ayuda a corregir los errores en filas difíciles: su confianza no se correlaciona con el desacuerdo del jurado (enriquecimiento 1,0x, frente a 1,7-1,9x en otros gates de la familia). Está confiadamente equivocado en filas difíciles, por lo que ningún umbral de confianza lo rescata.
- A un 99% de recall, el modelo false-fires en el 74% del tráfico, lo que lo hace inadecuado para escenarios donde se necesite alta cobertura sin falsos positivos.
- La precisión de `TRIVIAL` es del 86,42%, lo que implica que alrededor del 5% de los prompts `WORK` se clasifican como `TRIVIAL`. Esto solo es aceptable si el camino barato degrada con gracia.
- Las etiquetas de entrenamiento provienen de jurados LLM, no de anotadores humanos. Aunque la rúbrica fue validada contra etiquetas gold generadas manualmente, el modelo no ha sido reproducido de forma independiente.
- El dataset WildChat representa tráfico de consumidores, no tráfico empresarial. Para el caso de uso de sensibilidad, es ~93% `PUBLIC`, por lo que no puede medir los niveles que gatean la salida.
- El techo de evaluación es de aproximadamente 0,95 de accuracy debido a errores en las etiquetas gold, por lo que la precisión real del modelo está ligeramente sobreestimada.
- No es un modelo generativo: no puede producir texto, ni realizar tool calling, ni mantener conversaciones. Solo clasifica prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cnuland/llm-d-sc-complexity-v3
- Repositorio del proyecto `llm-d semantic classifier`: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Dataset WildChat-1M utilizado para la evaluación: https://huggingface.co/datasets/allenai/WildChat-1M
- Versión anterior del clasificador: https://huggingface.co/cnuland/llm-d-sc-complexity
- Versión mini del clasificador v2: https://huggingface.co/cnuland/llm-d-sc-complexity-v2-mini
