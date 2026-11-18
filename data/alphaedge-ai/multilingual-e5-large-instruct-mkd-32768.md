# alphaedge-ai/multilingual-e5-large-instruct-mkd-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-mkd-32768` es un modelo de embeddings de frases derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* de vocabulario, especializado en macedonio (`mk`). El autor, alphaedge-ai, ha reducido el vocabulario del tokenizador original de 250.037 a 32.768 tokens, lo que se traduce en una reducción del 86,89% del vocabulario y del 39,73% del número de parámetros (de 559.890.432 a 337.442.816). El objetivo es ofrecer un modelo de recuperación semántica mucho más ligero y con menor huella de memoria para pipelines centrados en macedonio.

La arquitectura subyacente es XLM-RoBERTa (encoder transformer), heredada del modelo base, y se distribuye en formato safetensors con la librería sentence-transformers. Al ser un modelo de embeddings y no generativo, su función es producir representaciones vectoriales para similitud semántica, búsqueda y clustering, no razonamiento ni generación de texto.

Es relevante para desarrolladores que despliegan sistemas RAG o búsqueda semántica en macedonio y necesitan reducir costes de VRAM y latencia: el modelo pesa 0,7 GB en el repositorio y mantiene la funcionalidad del original para ese idioma, a costa de perder capacidad multilingüe fuera del macedonio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), derivado de intfloat/multilingual-e5-large-instruct |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (nombre del modelo sugiere 32.768, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se listan cuantizaciones publicadas) |
| Idiomas soportados | macedonio (mk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, heredado de `intfloat/multilingual-e5-large-instruct`, que a su vez forma parte de la familia Multilingual E5 descrita en el informe técnico arXiv:2402.05672. No se trata de un modelo generativo ni de un modelo con mezcla de expertos; su salida son embeddings densos de frases.

La innovación técnica es el *trimming* de vocabulario: se seleccionaron 32.768 tokens a partir de 200.000 textos en macedonio del dataset `lbourdois/fineweb-2-trimming`, eliminando los tokens no utilizados en ese idioma. Esto reduce el vocabulario un 86,89% y los parámetros un 39,73%. La model card no detalla si hubo reentrenamiento adicional, ajuste fino o RLHF/DPO tras el trimming; solo indica que el modelo recortado "debería comportarse de forma similar al original" para el idioma objetivo.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación.
- Codificación separada de consultas y documentos (`encode_query` / `encode_document`), siguiendo la convención de la familia E5.
- Búsqueda semántica y ranking por similitud coseno entre consultas y documentos.
- Clustering y deduplicación de textos en macedonio.
- Soporte de instrucciones heredado del modelo base (sufijo `instruct`), aunque la model card no detalla el formato exacto de prompts.
- Capacidad multilingüe reducida: solo se garantiza macedonio; otros idiomas pueden degradarse por la eliminación de tokens.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- No dispone de visión ni audio.

## Casos de uso

- Búsqueda semántica en macedonio: indexar un corpus de documentos macedonios y recuperar los fragmentos más relevantes para una consulta mediante similitud coseno, aprovechando la reducción de memoria del 39,73% frente al original.
- RAG (retrieval-augmented generation) para asistentes en macedonio: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo, con menor coste de VRAM en el componente de embeddings.
- Deduplicación de contenidos: generar embeddings de artículos o registros macedonios y agrupar por similitud para eliminar duplicados en bases de datos o crawlers.
- Clasificación y clustering de tickets de soporte: agrupar consultas de usuarios macedonios por temática sin necesidad de etiquetas, usando los embeddings como entrada a un clasificador ligero.
- Motor de recomendación de contenidos: calcular similitud entre ítems (noticias, productos) descritos en macedonio para sugerir elementos relacionados.
- Moderación y near-duplicate detection en foros: detectar mensajes casi idénticos o spam comparando embeddings con un umbral de similitud.
- Despliegue en entornos con recursos limitados: al pesar 0,7 GB y tener 337M de parámetros, puede servirse en CPU o GPUs consumer pequeñas para tareas de búsqueda de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de tamaño (vocabulario y parámetros) y no incluye evaluaciones de MTEB, retrieval ni similitud semántica para macedonio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 337.442.816 parámetros; en fp32 ocupa aproximadamente 1,35 GB y en fp16 unos 0,67 GB, más overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante con 4 GB o más), e incluso en CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` en el repo), y endpoints compatibles (`endpoints_compatible`). No se indica soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-mkd-32768 | 337.442.816 | 32.768 | no disponible | mk | MIT | safetensors |
| intfloat/multilingual-e5-large-instruct (original) | 559.890.432 | 250.037 | no disponible | multilingüe | MIT | safetensors |
| intfloat/multilingual-e5-large | no disponible en la informacion | no disponible | no disponible | multilingüe | MIT | safetensors |
| intfloat/multilingual-e5-base | no disponible en la informacion | no disponible | no disponible | multilingüe | MIT | safetensors |

El modelo recortado ofrece un 39,73% menos de parámetros y un 86,89% menos de vocabulario que su base, a cambio de perder cobertura multilingüe. Frente a `multilingual-e5-base`, no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo está optimizado para macedonio; el rendimiento en otros idiomas puede degradarse notablemente porque se eliminaron tokens no usados en `mk`.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí puede producir rankings poco fiables si se usa fuera del dominio o idioma previsto.
- No se han publicado evaluaciones de calidad (MTEB, retrieval, similitud) para macedonio; el rendimiento real frente al original es incierto.
- La longitud de contexto no está confirmada en la model card; el sufijo `32768` del nombre sugiere 32.768 tokens, pero debe verificarse antes de usarlo en producción con documentos largos.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de trimming.
- No es un modelo generativo: no sirve para chat, razonamiento, código ni tool calling.
- La model card no detalla el formato exacto de instrucciones heredado del modelo base `instruct`, lo que puede afectar a la reproducibilidad de los prompts.
- El repositorio tiene solo 32 descargas y 0 likes, por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-mkd-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de trimming: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Informe técnico Multilingual E5: https://arxiv.org/abs/2402.05672
