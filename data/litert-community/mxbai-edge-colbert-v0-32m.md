# litert-community/mxbai-edge-colbert-v0-32m

## Resumen

El modelo `litert-community/mxbai-edge-colbert-v0-32m` es una conversión a LiteRT (formato `.tflite`) del retriever de interacción tardía `mixedbread-ai/mxbai-edge-colbert-v0-32m`, desarrollado por Mixedbread AI. Se trata de un modelo de 32 millones de parámetros basado en la arquitectura ModernBERT (concretamente el backbone Ettin-32M) que genera un vector unitario de 64 dimensiones por cada token de entrada, permitiendo el scoring mediante MaxSim (máximo producto escalar entre vectores de consulta y documento). Su propósito es la recuperación semántica (retrieval) completamente offline, ejecutable en CPU y en dispositivos edge.

La conversión a LiteRT incluye dos artefactos: una versión int8 con cuantización de rango dinámico (39 MB, recomendada para despliegue) y una versión fp16 (67 MB) que reproduce bit-exacto los resultados del modelo PyTorch original. El grafo de inferencia incorpora la cabeza de proyección (384→768→768→64) y la normalización L2 por token; el scoring MaxSim se implementa en el lado del host con unas pocas líneas de código. El modelo expone cuatro signatures de entrada estática (`encode_48`, `encode_128`, `encode_256`, `encode_512`) que permiten procesar consultas de hasta 48 tokens y documentos de hasta 512 tokens.

La relevancia de este modelo radica en que lleva la recuperación de interacción tardía (técnica que tradicionalmente requería servidores GPU) a dispositivos con recursos limitados, manteniendo una calidad competitiva: en la evaluación NanoSciFact, la versión int8 alcanza un nDCG@10 de 0.8564 frente al 0.8644 del modelo PyTorch de referencia, con recall@5 y hit@1 idénticos (0.920 y 0.780 respectivamente). Es una opción práctica para aplicaciones de búsqueda semántica, RAG local y clasificación de documentos en entornos sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (Ettin-32M) con cabeza de proyección late-interaction ColBERT (384→768→768→64) |
| Parametros totales | 32 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 48 tokens para consultas, 512 para documentos (signatures estáticas: 48, 128, 256, 512) |
| Tipos de cuantizacion | int8 dynamic-range (39 MB) y fp16 (67 MB) |
| Idiomas soportados | No disponible oficialmente; el modelo base está orientado principalmente a inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (`.tflite`); el modelo base original está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT (Contextualized Late Interaction over BERT), adaptada a un backbone ModernBERT de 32M parámetros. Cada token de entrada se procesa por el encoder y se proyecta a un espacio de 64 dimensiones mediante una cabeza MLP de tres capas (384→768→768→64), seguida de normalización L2. El resultado es un conjunto de vectores unitarios por token, que se comparan entre consulta y documento mediante MaxSim: para cada vector de consulta se toma el máximo producto escalar con los vectores del documento y se suman los resultados. Esta interacción tardía preserva información léxica y semántica fina que los embeddings de frase única pierden.

El entrenamiento se describe en el paper "Fantastic (small) Retrievers and How to Train Them" (arXiv:2510.14880). Según el resumen, los autores realizaron numerosos experimentos para mejorar la recuperación y los modelos de interacción tardía, con el objetivo de destilarlos en modelos pequeños como prueba de concepto. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset, pero se sabe que el modelo base Ettin-32M hereda las capacidades de ModernBERT. La conversión a LiteRT mantiene el comportamiento del modelo original: el contrato de uso exige minúsculas, padding con token id 50284 (`[MASK]`), inserción de los tokens especiales `[Q]` (id 50368) y `[D]` (id 50369) tras `[CLS]`, y el filtrado de vectores correspondientes a signos de puntuación ASCII en documentos.

## Capacidades

- Generación de embeddings por token: produce un vector L2-normalizado de 64 dimensiones para cada token de la secuencia de entrada, listo para scoring MaxSim.
- Recuperación semántica (retrieval) con interacción tardía: permite comparar consultas y documentos a nivel de token, capturando matices que los embeddings de frase única pierden.
- Ejecución completamente offline en CPU: no requiere GPU ni conexión a red, gracias a la conversión a LiteRT.
- Cuantización int8 con degradación mínima: la versión int8 mantiene recall@5 y hit@1 idénticos al modelo PyTorch en la evaluación NanoSciFact, con una pérdida de solo 0.008 en nDCG@10.
- Compatibilidad con el ecosistema LiteRT/TFLite: se integra con el intérprete `ai_edge_litert` y puede desplegarse en Android, iOS, Raspberry Pi y otros dispositivos edge.
- No genera texto: es exclusivamente un modelo de embeddings para recuperación; no admite generación, tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles sin conexión: un asistente de notas o un gestor de correos puede indexar documentos localmente y responder consultas del usuario usando MaxSim, con latencia de milisegundos en CPU gracias al tamaño de 39 MB.
- RAG (Retrieval-Augmented Generation) en dispositivo: el modelo puede recuperar pasajes relevantes de una base de conocimiento local para alimentar a un LLM generativo que se ejecute en el mismo dispositivo, evitando llamadas a servidores.
- Clasificación y filtrado de documentos: al comparar embeddings por token, se pueden agrupar o deduplicar documentos según similitud semántica, útil en sistemas de gestión documental o archivado automático.
- Búsqueda en bases de datos de preguntas frecuentes (FAQ): un chatbot corporativo puede usar este modelo para encontrar la respuesta más cercana a la consulta del usuario, incluso con variaciones de redacción.
- Indexación y recuperación en entornos con recursos limitados: ideal para Raspberry Pi o dispositivos IoT que necesiten buscar en catálogos de productos, manuales técnicos o normativas sin depender de la nube.
- Evaluación de similitud entre textos cortos: por ejemplo, comparar titulares de noticias, resúmenes o descripciones de productos para detectar duplicados o recomendar contenido relacionado.

## Benchmarks y rendimiento

La model card reporta resultados en el corpus NanoSciFact (inglés, 600 documentos, 50 afirmaciones, scoring MaxSim) y una verificación sobre el ejemplo publicado por el modelo base.

| Metrica | PyTorch fp32 | LiteRT fp16 | LiteRT int8 |
|---|---|---|---|
| nDCG@10 | 0.8644 | 0.8644 (idéntico) | 0.8564 |
| recall@5 | 0.920 | 0.920 | 0.920 |
| hit@1 | 0.780 | 0.780 | 0.780 |

Además, se verificó la reproducción exacta de los scores MaxSim del ejemplo de la model card original (consulta "Which planet is known as the Red Planet?" contra cuatro documentos): los valores `[11.2081, 11.5308, 11.4104, 11.4756]` se replicaron hasta el cuarto decimal en la conversión fp32, y todas las variantes mantienen a Marte como resultado principal. En la evaluación cruzada (documentos indexados con PyTorch, consultas con el artefacto int8), el nDCG@10 fue de 0.8578 frente al 0.8644 del control, lo que confirma la viabilidad de desplegar el modelo cuantizado en el dispositivo mientras el índice se construye en servidor.

## Requisitos de hardware

- VRAM: no requiere VRAM dedicada; se ejecuta en CPU. El consumo de memoria pico (RSS) medido en un Mac M4 Max con 8 hilos es de 144 MiB para la versión int8 y 676 MiB para la fp16 (cargando e invocando las cuatro signatures).
- GPU recomendadas: ninguna; el modelo está diseñado para CPU y dispositivos edge. Puede ejecutarse en cualquier hardware que soporte LiteRT/TFLite.
- Compatibilidad con GPU de consumo: no aplica, aunque podría ejecutarse en CPU de cualquier equipo moderno.
- Opciones de despliegue: LiteRT (Python con `ai_edge_litert`), TFLite en Android/iOS, o cualquier runtime que soporte modelos `.tflite`. No es compatible con vLLM, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no se proporcionan cifras exactas de latencia, pero el tamaño de 39 MB y la ejecución en CPU con 8 hilos permiten inferir tiempos de respuesta del orden de decenas de milisegundos para consultas cortas. La model card indica que el coste de recuperación de la versión int8 es "pequeño" (medido en el mismo entorno).

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de proyeccion | Contexto maximo | Formato | Licencia |
|---|---|---|---|---|---|
| mxbai-edge-colbert-v0-32m (LiteRT) | 32M | 64 | 512 (documentos) | TFLite | Apache-2.0 |
| mxbai-edge-colbert-v0-17m (LiteRT) | 17M | 48 | No disponible | TFLite | Apache-2.0 |
| mxbai-edge-colbert-v0-32m (PyTorch original) | 32M | 64 | 512 (documentos) | Safetensors | Apache-2.0 |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de rendimiento de otros retrievers pequeños (como all-MiniLM-L6-v2 o bge-small) en la información proporcionada. El modelo de 17M es la alternativa más ligera, con una dimensión de proyección menor (48 frente a 64), lo que probablemente reduce la calidad de recuperación a cambio de un tamaño aún más reducido. El modelo PyTorch original sirve como referencia de calidad máxima, siendo la versión fp16 de LiteRT bit-exacta respecto a él.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en inglés, puede presentar un rendimiento degradado en otros idiomas.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto; solo produce embeddings.
- Limitaciones de contexto: las signatures estáticas limitan las consultas a 48 tokens y los documentos a 512 tokens. Los documentos más largos deben dividirse en fragmentos, lo que puede afectar a la coherencia de la recuperación.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Dependencia del contrato de uso: el modelo requiere un preprocesado específico (minúsculas, padding con token 50284, inserción de `[Q]`/`[D]`, filtrado de puntuación). Omitir cualquiera de estos pasos altera los resultados y puede producir embeddings incorrectos.
- La versión fp16, aunque bit-exacta, consume aproximadamente 10 veces su tamaño en memoria durante la inferencia debido a la expansión de pesos a fp32 por parte de XNNPACK; se recomienda la versión int8 para despliegue real.
- No es un modelo generativo: no puede utilizarse para tareas de texto libre, chat o razonamiento; su único propósito es la recuperación.

## Enlaces

- Repositorio HuggingFace del modelo LiteRT: https://huggingface.co/litert-community/mxbai-edge-colbert-v0-32m
- Modelo base original: https://huggingface.co/mixedbread-ai/mxbai-edge-colbert-v0-32m
- Modelo hermano de 17M: https://huggingface.co/mixedbread-ai/mxbai-edge-colbert-v0-17m
- Paper "Fantastic (small) Retrievers and How to Train Them" (arXiv:2510.14880): https://arxiv.org/abs/2510.14880
- Página del modelo en ThinkLLM: https://thinkllm.dev/models/mxbai-edge-colbert-v0-32m
