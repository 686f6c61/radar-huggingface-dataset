# cowboycoderhq/GLM-5.3-Flash-2xM5Max-Pipeline

## Resumen

GLM-5.3-Flash-2xM5Max-Pipeline es una receta de despliegue distribuido, no un modelo con pesos propios. El repositorio, publicado por el usuario cowboycoderhq, describe cómo ejecutar los pesos upstream de GLM-5.3-Flash (convertidos a MLX) repartidos entre dos MacBook Pro con chip M5 Max de 128 GB, conectados mediante un único cable Thunderbolt 5 y comunicación RDMA a través de `mx.distributed` con backend `jaccl`. Cada equipo aloja aproximadamente la mitad del modelo y la inferencia se organiza como un pipeline de dos etapas, sin tensor parallelism.

La propuesta técnica bautizada como "Cerebros" (en referencia a Cerebras) ejecuta dos grupos de streams en paralelo: mientras el primer Mac procesa un paso de un grupo, el segundo procesa el paso del otro grupo, y cada uno cede su grupo en la frontera de capas. El objetivo es demostrar que es posible servir un modelo de gran tamaño y contexto largo (hasta 1M de tokens según el autor, con pruebas hasta 256K) sobre hardware Apple Silicon de consumo profesional, sin GPUs dedicadas.

Es relevante porque documenta con mediciones reproducibles (prefill, decode, TTFT, consumo de memoria) una alternativa de despliegue para entornos sin acceso a clústeres NVIDIA, y porque expone de forma explícita las limitaciones del enfoque: decodificación greedy únicamente, caídas del bus RDMA y penalizaciones de precisión derivadas del stack de cuantización del prefill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline parallel de 2 etapas sobre pesos GLM-5.3-Flash convertidos a MLX (arquitectura del modelo base no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens según el autor; pruebas realizadas hasta 256K |
| Tipos de cuantizacion | Proyecciones INT8 en el stack de prefill, indexer en bf16, seis capas en precisión alta; decodificación con kernels exactos (detalle completo no disponible) |
| Idiomas soportados | no disponible |
| Licencia | MIT (la receta y el código; los pesos heredan la licencia del modelo upstream, no indicada) |
| Formato de pesos | MLX (conversión desde los pesos upstream de GLM-5.3-Flash) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una receta de inferencia distribuida. La arquitectura efectiva es la del modelo base GLM-5.3-Flash, cuyos detalles (número de parámetros, tipo de transformer, composición del dataset, uso de RLHF o DPO) no se recogen en la información disponible. Lo que sí se documenta es la topología de despliegue: dos etapas de pipeline, una por MacBook, con reparto aproximado al 50% de las capas y comunicación punto a punto por Thunderbolt 5 usando RDMA (`jaccl`). No hay tensor parallelism, lo que simplifica la sincronización a costa de exigir que cada etapa quepa en la memoria unificada de un solo equipo.

La innovación destacable es el esquema de doble grupo de streams ("Cerebros"): dos grupos de secuencias se procesan de forma entrelazada para que ninguna de las dos máquinas quede ociosa en la frontera de capas. Además, el autor emplea decodificación especulativa multi-token (MTP) con profundidad 1, que solo aporta ganancia con uno o dos streams; por encima de dos streams las tandas se ejecutan sin MTP. El stack de prefill altera el redondeo (INT8 en proyecciones, indexer bf16, seis capas precisas), con una divergencia medida de 1.397 nats de KL frente a la referencia en un texto de 32K, frente a 1.274 nats del chunking puro; la decodificación usa kernels exactos.

## Capacidades

- Generación de texto y código: los resultados publicados se obtienen con prompts de código, lo que confirma uso práctico en generación y razonamiento sobre código.
- Contexto largo: soporta ventanas de hasta 1M de tokens según el autor, con pruebas documentadas hasta 256K.
- Decodificación especulativa: MTP con profundidad 1, efectiva con uno o dos streams.
- Procesamiento multi-stream: hasta 16 streams concurrentes repartidos en dos grupos de ocho.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de generación de código con contexto largo: el pipeline permite atender prompts de hasta 256K tokens con TTFT de 154 s en el peor caso medido y velocidades de prefill de 1.702 tok/s, adecuado para revisiones de repositorios completos o análisis de codebases extensas en entornos sin GPUs NVIDIA.
- Investigación en inferencia distribuida sobre Apple Silicon: la receta sirve como banco de pruebas reproducible para estudiar pipeline parallelism, RDMA sobre Thunderbolt 5 y decodificación especulativa, con todos los resultados en `docs/results/`.
- Despliegue en laboratorios con hardware Apple: dos M5 Max de 128 GB son una alternativa viable a un servidor GPU para equipos que ya disponen de estos equipos, con un consumo máximo de 107 GB en el primer Mac para un stream de 256K.
- Procesamiento por lotes de documentos largos: el modo multi-stream (hasta 16 streams, 119 tok/s agregados en contexto de 4K) permite paralelizar la generación sobre varios documentos simultáneamente.
- Prototipado de asistentes conversacionales con historial extenso: la ventana de contexto larga permite mantener conversaciones multi-turno con historiales de decenas de miles de tokens sin truncamiento.
- Evaluación comparativa de stacks de cuantización: el repositorio documenta la divergencia KL del prefill (1.397 nats frente a 1.274 del chunking), útil para estudiar el impacto de INT8 y capas precisas en la calidad de la generación.

## Benchmarks y rendimiento

Prefill con un solo stream (decodificación greedy, 128 tokens generados, prompts de código):

| Tokens de prompt | tok/s | TTFT |
|---|---|---|
| 4K | 1.875 | 2,2 s |
| 8K | 2.216 | 3,7 s |
| 16K | 2.314 | 7,1 s |
| 32K | 2.345 | 14,0 s |
| 64K | 2.232 | 29,4 s |
| 128K | 2.009 | 65,2 s |
| 256K | 1.702 | 154,0 s |

Decode con contexto de 4K (todos los streams juntos):

| Streams | Disposición | tok/s totales | tok/s por stream |
|---|---|---|---|
| 1 | MTP profundidad 1 | 34,7 | 34,7 |
| 2 | MTP profundidad 1, 2 grupos | 67,2 | 33,6 |
| 4 | 2 grupos de 2 | 70,1 | 17,5 |
| 8 | 2 grupos de 4 | 93,9 | 11,7 |
| 16 | 2 grupos de 8 | 119,0 | 7,4 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Dos MacBook Pro con chip M5 Max y 128 GB de memoria unificada cada uno.
- Un cable Thunderbolt 5 para la comunicación RDMA entre ambos equipos.
- Consumo de memoria medido: 107 GB en el primer Mac para un stream de 256K tokens; el reparto aproximado es del 50% del modelo por equipo.
- No cabe en una sola GPU de consumo ni en un único equipo de 128 GB con contexto largo, dado que el modelo se reparte entre dos máquinas.
- Despliegue mediante MLX y `mx.distributed` con backend `jaccl`; el repositorio incluye un servidor de streams ("wave server") y herramientas de barrido.
- Throughput: 34,7 tok/s por stream en decodificación con contexto de 4K; hasta 119 tok/s agregados con 16 streams.
- Latencia: TTFT de 2,2 s para 4K y 154 s para 256K en prefill.
- Referencia comparativa del autor: un M5 Ultra de 80 núcleos alcanza 2.204 tok/s en prefill de 4K (fila de referencia oMLX), por encima de los 1.875 tok/s del pipeline a 4K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-Flash-2xM5Max-Pipeline | no disponible | 1M (probado hasta 256K) | MIT (receta) | Hugging Face, repo GitHub |
| Modelo base GLM-5.3-Flash (upstream) | no disponible | no disponible | no disponible | pesos upstream citados por el autor |
| Referencia oMLX en M5 Ultra de 80 núcleos | no disponible | no disponible | no disponible | fila de referencia citada en la model card |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría en parámetros, rendimiento o licencia; la información proporcionada solo incluye la comparación interna con la fila de referencia de un M5 Ultra.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una receta; los pesos deben obtenerse del modelo upstream y convertirse a MLX.
- Probado únicamente en un par de MacBooks; no hay validación en otras configuraciones de hardware.
- Solo decodificación greedy; no se documentan muestreo, temperatura ni otras estrategias.
- El prefill cambia el redondeo (INT8, indexer bf16, seis capas precisas), con divergencia KL de 1.397 nats frente a 1.274 del chunking puro en un texto de 32K; la calidad del prefill no es idéntica a la referencia.
- La biblioteca RDMA falló dos veces con bus error; los scripts reintentan y reinician, pero un fallo cuesta minutos de recuperación.
- MTP solo aporta ganancia con uno o dos streams; por encima de dos, las tandas se ejecutan sin decodificación especulativa.
- El prefill a 4K (1.875 tok/s) queda por debajo del 95% de la línea de referencia del M5 Ultra (2.204 tok/s).
- Proyecto independiente, no afiliado ni respaldado por Apple ni por los autores de GLM-5.3-Flash.
- Licencia MIT para el código; la licencia de los pesos upstream no se especifica en la información disponible, por lo que el uso comercial de los pesos debe verificarse en su origen.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/cowboycoderhq/GLM-5.3-Flash-2xM5Max-Pipeline
- Repositorio GitHub: `GLM-5.3-Flash-2xM5Max-Pipeline` (citado en la model card; URL completa no disponible)
- Resultados de las pruebas: directorio `docs/results/` del repositorio GitHub
- Modelo base GLM-5.3-Flash: pesos upstream, enlace no disponible
