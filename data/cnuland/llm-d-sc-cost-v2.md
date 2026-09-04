# cnuland/llm-d-sc-cost-v2

## Resumen

`cnuland/llm-d-sc-cost-v2` es un clasificador de texto diseñado para estimar el coste de procesar un prompt con un modelo de lenguaje, como parte del proyecto `llm-d` de clasificación semántica para enrutamiento de LLMs. Lo desarrolla el autor `cnuland` y se publica bajo licencia Apache 2.0. El modelo asigna a cada prompt una de cuatro etiquetas de coste: `MINIMAL`, `LOW`, `MODERATE` o `HIGH`.

Arquitectónicamente, es un encoder Transformer basado en `sentence-transformers/all-MiniLM-L6-v2` con una cabeza de clasificación de secuencia. Tiene 22.714.756 parámetros y se distribuye en formato `safetensors`. Su relevancia radica en permitir sistemas de enrutamiento que decidan qué modelo de lenguaje usar para cada petición, optimizando el coste por token sin sacrificar la calidad en tareas complejas. El autor reporta una latencia muy baja en CPU, lo que lo hace apto para servir como clasificador en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza de clasificación de secuencia, basado en `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.714.756 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer del tipo BERT, con una cabeza de clasificación de secuencia que produce logits para las cuatro etiquetas de coste. La base es `all-MiniLM-L6-v2`, un modelo de embeddings ligero y eficiente, sobre el que se añade la capa de clasificación. La model card indica que el modelo requiere un runtime que lea los logits, lo que es habitual en pipelines de clasificación con Transformers.

El entrenamiento se realizó con 13.451 filas procedentes de tres fuentes: `cost-v2` (5.970 filas), `cost-real` (6.697 filas) y `cost-real-contested` (2.279 filas). La distribución de clases en el entrenamiento es: `LOW` (4.779), `MODERATE` (4.499), `MINIMAL` (2.638) y `HIGH` (1.535). Los datos de tráfico real provienen del dataset `WildChat-1M`, etiquetados por un jurado de tres modelos LLM. La model card no menciona procesos de RLHF ni DPO; el entrenamiento es de clasificación supervisada.

## Capacidades

- Clasificación de prompts en cuatro niveles de coste: `MINIMAL`, `LOW`, `MODERATE`, `HIGH`.
- Diseñado específicamente para enrutamiento semántico de LLMs dentro del proyecto `llm-d`.
- Inferencia en CPU con latencia muy baja: p50 de 2,94 ms y p99 de 3,2 ms en un Apple M-series con un solo hilo.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- No es un modelo generativo: no produce texto, ni soporta tool calling, ni visión, ni audio.
- No se documentan capacidades multilingües; el modelo base `all-MiniLM-L6-v2` está orientado principalmente al inglés.

## Casos de uso

- Enrutamiento inteligente de prompts en producción: un sistema puede clasificar cada prompt entrante y enviar los de coste `MINIMAL` o `LOW` a un modelo pequeño y barato, mientras que los `MODERATE` o `HIGH` se dirigen a un LLM de pago. Esto reduce el coste medio por petición sin degradar la calidad en tareas complejas.

- Optimización de costes en plataformas LLM-as-a-Service: el clasificador permite calcular el coste estimado de cada petición entrante, lo que facilita aplicar políticas de tarificación por cliente o establecer límites de uso basados en el coste real.

- Filtrado de prompts triviales en chatbots de atención al cliente: los saludos, confirmaciones o preguntas muy simples (`MINIMAL`) pueden responderse con plantillas o un modelo local, reservando los modelos caros para consultas que requieren razonamiento.

- Priorización de colas en servidores de inferencia: en un sistema con varios modelos desplegados, el clasificador puede asignar prioridad a los prompts de coste alto para garantizar que reciben los recursos adecuados, mientras que los de coste bajo se procesan en lotes.

- Monitorización de costes en agentes autónomos: un agente puede usar el clasificador para decidir si una subtarea merece invocar un modelo de razonamiento costoso o si puede delegarse en un modelo más barato, ajustando el presupuesto de tokens dinámicamente.

- Clasificación de tickets de soporte: en un sistema de ticketing, el modelo estima el coste de resolver cada ticket con un LLM, lo que permite priorizar los tickets que necesitan modelos de pago y automatizar los más simples.

- Analítica de uso para equipos de plataforma: al clasificar el tráfico histórico, se pueden identificar patrones de consumo y ajustar los planes de capacidad o los presupuestos de inferencia.

## Benchmarks y rendimiento

La model card reporta resultados de precisión y F1 en tres conjuntos de evaluación. También indica que el techo de la evaluación es aproximadamente 0,95, debido a errores en las etiquetas gold (alrededor del 4,9 %).

| Conjunto de evaluación | n | Precisión | IC 95 % | Macro F1 |
|---|---|---:|---:|---:|
| Tráfico real, gold refinado (re-adjudicación de alta calidad) | 371 | 0,8760 | 0,839 – 0,906 | 0,7996 |
| Tráfico real (WildChat, jurado unánime de 3 modelos) | 427 | 0,8501 | 0,813 – 0,881 | 0,7968 |
| Conjunto heredado escrito a mano | 60 | 0,9500 | 0,863 – 0,983 | 0,9495 |

La diferencia entre el conjunto heredado y el tráfico real es de +0,100, lo que indica que el modelo funciona mejor en textos limpios y con el mismo registro que los anclajes, mientras que el tráfico real contiene fragmentos, textos truncados y preámbulos de roleplay. La fila de tráfico real es la que mejor predice el comportamiento en producción.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Por su tamaño (22,7M de parámetros), la VRAM necesaria es mínima, del orden de decenas de MB en FP32.
- GPU recomendadas: no se requiere GPU; el autor indica que el modelo se sirve en CPU. Cualquier GPU moderna puede ejecutarlo sin problema.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, incluso en modelos antiguos o de gama baja.
- Opciones de despliegue: Hugging Face Transformers, Text Embeddings Inference (compatible con endpoints) y el entorno `llm-d-sc` del proyecto `llm-d`.
- Latencia: p50 de 2,94 ms y p99 de 3,2 ms en CPU (Apple M-series, un solo hilo).

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. El modelo base `all-MiniLM-L6-v2` es un modelo de embeddings y no un clasificador de coste, por lo que no es directamente comparable. Existe una versión anterior, `cnuland/llm-d-sc-cost`, pero no se dispone de datos de rendimiento en la búsqueda web realizada.

## Limitaciones y advertencias

- Los datos de tráfico real provienen de WildChat, que es tráfico de consumo. Para la dimensión de sensibilidad, aproximadamente el 93 % de los prompts son `PUBLIC`, por lo que el modelo no puede medir bien los niveles que controlan el acceso a datos sensibles.
- Las etiquetas proceden de jurados LLM, no de anotadores humanos. La rúbrica fue validada reproduciendo las etiquetas gold del proyecto, pero el resultado no se ha reproducido de forma independiente.
- El conjunto de evaluación tiene un techo de precisión de aproximadamente 0,95, no 1,0, debido a que alrededor del 4,9 % de las etiquetas gold son incorrectas.
- El modelo solo clasifica en cuatro etiquetas y no genera texto; su uso está limitado a tareas de clasificación.
- No se documenta el soporte de idiomas; es probable que el rendimiento sea mejor en inglés, dado el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con validación limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cnuland/llm-d-sc-cost-v2
- Repositorio del proyecto `llm-d-semantic-classifier`: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Versión anterior del modelo: https://huggingface.co/cnuland/llm-d-sc-cost
