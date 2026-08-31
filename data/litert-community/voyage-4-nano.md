# litert-community/voyage-4-nano

## Resumen

El modelo `litert-community/voyage-4-nano` es una conversión a LiteRT (formato `.tflite`) del modelo de embeddings multilingüe `voyageai/voyage-4-nano` de Voyage AI. Está diseñado para inferencia on-device, completamente offline y sobre CPU, manteniendo la calidad del modelo original en tareas de recuperación y similitud semántica. El modelo produce vectores de 2048 dimensiones L2-normalizados, con soporte de dimensiones Matryoshka (256, 512, 1024, 2048) para reducir el tamaño del vector sin perder demasiada calidad.

La conversión incluye dos artefactos: uno con pesos int8 de rango dinámico (364 MB) y otro con pesos fp16 (696 MB). Ambos integran en el grafo la proyección 1024→2048, el mean pooling y la normalización L2, de modo que una única llamada devuelve el embedding final. El modelo original tiene 340 millones de parámetros y una ventana de contexto de 32 000 tokens, pero esta versión LiteRT ofrece firmas estáticas de 64, 128, 256 y 512 tokens, por lo que textos más largos deben fragmentarse. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, según etiquetas) |
| Parametros totales | 340 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 000 tokens (modelo original); 512 tokens máximo en las firmas LiteRT |
| Tipos de cuantizacion | int8 dynamic-range, fp16 (pesos) |
| Idiomas soportados | Multilingüe; verificado en inglés, japonés, coreano, español y árabe (pruebas internas) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con dos variantes: `voyage-4-nano_wi8fc.tflite` (int8) y `voyage-4-nano_fp16.tflite` (fp16) |

## Arquitectura y entrenamiento

El modelo base `voyage-4-nano` es un transformer de 340 millones de parámetros, entrenado por Voyage AI con aprendizaje de representaciones Matryoshka (MRL), lo que permite truncar el vector de salida a dimensiones menores (1024, 512, 256) y re-normalizar sin degradación severa. El entrenamiento incluye cuantización consciente (quantization-aware training), lo que explica las mínimas pérdidas de calidad al convertir a int8. El espacio de embeddings es compartido entre todos los modelos de la serie Voyage 4 (large, lite, nano), de modo que los vectores generados por distintos tamaños son directamente comparables.

La conversión a LiteRT mantiene la arquitectura original e incorpora en el grafo la proyección final, el mean pooling y la normalización L2. Las firmas estáticas aceptan `input_ids` y `attention_mask` con padding a la derecha, y el resultado es independiente de la firma utilizada (64, 128, 256 o 512) para un mismo texto, produciendo vectores bitwise idénticos. El modelo original fue entrenado con datos multilingües, aunque no se especifica la composición exacta del corpus ni el número de tokens de entrenamiento en la información disponible.

## Capacidades

- Generación de embeddings densos de 2048 dimensiones, L2-normalizados, para texto en múltiples idiomas.
- Recuperación de información y búsqueda semántica: soporta prompts diferenciados para consultas y documentos, según el contrato definido por Voyage AI.
- Dimensiones Matryoshka: permite truncar el vector a 1024, 512 o 256 dimensiones y re-normalizar, reduciendo el coste de almacenamiento e indexación.
- Compatibilidad con el espacio de embeddings compartido de la serie Voyage 4: los vectores generados por este modelo son comparables con los de `voyage-4-large`, `voyage-4` y `voyage-4-lite`.
- Inferencia on-device: funciona en CPU sin conexión, mediante LiteRT (TFLite), con dos opciones de cuantización (int8 y fp16).
- Similitud semántica y clustering: para tareas simétricas no se requiere prompt, se codifica el texto directamente.
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: el modelo puede ejecutarse localmente en un dispositivo para indexar y consultar documentos sin depender de servidores externos, gracias a su tamaño reducido (364 MB en int8) y su capacidad de ejecución en CPU.
- Recuperación aumentada por generación (RAG) híbrida: se puede construir un índice de documentos en el servidor con el modelo PyTorch de precisión completa y realizar las consultas en el dispositivo con la versión int8, manteniendo una calidad casi idéntica (nDCG@10 0.9283 frente a 0.9292 del control).
- Clasificación de textos y clustering: al generar embeddings de alta dimensión, se pueden agrupar documentos por similitud coseno, útil para organización de correos, tickets de soporte o artículos.
- Sistemas de recomendación basados en contenido: codificar ítems y usuarios en el mismo espacio vectorial para calcular similitudes y sugerir productos o contenidos relevantes.
- Detección de duplicados y near-duplicates: comparar embeddings de documentos para identificar copias o versiones similares en grandes corpus, aprovechando las dimensiones Matryoshka para reducir coste computacional.
- Análisis de sentimiento multilingüe: aunque no es un clasificador, los embeddings pueden alimentar modelos lineales o redes pequeñas para tareas de clasificación en varios idiomas, con la ventaja de ejecutarse en el borde.

## Benchmarks y rendimiento

La información disponible incluye pruebas internas de la conversión LiteRT comparando los artefactos int8 y fp16 contra la referencia PyTorch fp32. No se han publicado resultados en benchmarks estándar como MMLU o MTEB en la documentación consultada. Los datos de calidad son los siguientes:

| Prueba | Métrica | PyTorch fp32 | int8 LiteRT | fp16 LiteRT |
|---|---|---|---|---|
| JSTS (similitud semántica japonés, 300 pares) | Spearman | 0.8406 | 0.8407 | 0.8406 |
| JSQuAD retrieval (150 preguntas, 800 párrafos) | nDCG@10 | 0.9292 | 0.9275 | idéntico a PyTorch |
| JSQuAD retrieval | hit@1 | 0.860 | 0.860 | idéntico a PyTorch |
| Cross-variant (documentos PyTorch, consultas int8) | nDCG@10 | 0.9292 (control) | 0.9283 | no disponible |
| Cross-variant a 256 dimensiones | nDCG@10 | 0.8990 (control) | 0.8989 | no disponible |
| STS17 (100 pares por par de idiomas, int8) | Spearman | — | en-en 0.873, ko-ko 0.844, es-en 0.758, en-ar 0.775 | — |

Las diferencias entre int8 y la referencia son inferiores a 0.003 en coseno y a 0.002 en nDCG, lo que indica una degradación mínima por cuantización.

## Requisitos de hardware

- Inferencia en CPU: ambos artefactos están diseñados para ejecutarse en CPU sin GPU. El archivo int8 pesa 364 MB y el fp16 696 MB, por lo que caben en la memoria de la mayoría de los dispositivos móviles y de escritorio.
- GPU: no necesaria; el modelo está optimizado para LiteRT y TFLite, aunque puede ejecutarse en GPU si el runtime lo soporta.
- RAM: se recomienda al menos 1 GB de memoria libre para el modelo int8 y 2 GB para el fp16, considerando el overhead del runtime.
- Despliegue: compatible con LiteRT (anteriormente TFLite) mediante `ai_edge_litert.interpreter` en Python, y con cualquier framework que soporte `.tflite` (Android, iOS, edge devices).
- Latencia: no se proporcionan cifras exactas, pero al ser un modelo de 340M con firmas de hasta 512 tokens, se espera una latencia de decenas de milisegundos en CPU moderna para secuencias cortas.
- Throughput: no disponible; depende del hardware y del número de hilos (el ejemplo de uso emplea `num_threads=8`).

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de embeddings en la información proporcionada. Sin embargo, el modelo comparte espacio de embeddings con el resto de la serie Voyage 4, lo que permite sustituir `voyage-4-nano` por versiones mayores sin reindexar. En cuanto a alternativas de tamaño similar, se podría comparar con modelos como `all-MiniLM-L6-v2` (80M parámetros, 384 dimensiones) o `bge-small-en` (33M parámetros), pero no hay datos de rendimiento comparativo en las fuentes consultadas. La ventaja principal de `voyage-4-nano` es su naturaleza multilingüe, su contexto de 32K (aunque limitado a 512 en LiteRT) y su licencia Apache 2.0.

## Limitaciones y advertencias

- La versión LiteRT limita la longitud de contexto a 512 tokens por firma estática, muy por debajo de los 32 000 tokens del modelo original. Textos más largos deben fragmentarse, lo que puede afectar a la calidad de la representación en documentos extensos.
- El modelo es exclusivamente para embeddings; no genera texto ni realiza razonamiento. No debe usarse para tareas de generación o diálogo.
- Aunque las pruebas internas muestran buena calidad en varios idiomas, no se ha verificado exhaustivamente el rendimiento en todos los idiomas soportados. Puede haber sesgos en lenguas poco representadas en el entrenamiento.
- La cuantización int8 introduce una degradación mínima pero medible (por ejemplo, 0.0017 en nDCG@10 en JSQuAD). Para aplicaciones donde la precisión sea crítica, se recomienda usar la variante fp16 o el modelo PyTorch original.
- El espacio de embeddings compartido con otros modelos de la serie Voyage 4 solo es válido si se utilizan los mismos prompts y el mismo preprocesado; cambios en el tokenizador o en los prompts pueden romper la compatibilidad.
- No se han publicado resultados en benchmarks estándar de la comunidad (MTEB, etc.) para esta conversión LiteRT, por lo que las comparaciones con otros modelos deben basarse en pruebas propias.

## Enlaces

- Repositorio HuggingFace de la conversión LiteRT: https://huggingface.co/litert-community/voyage-4-nano
- Modelo base original: https://huggingface.co/voyageai/voyage-4-nano
- Página del modelo en There's An AI For That: https://theresanaiforthat.com/model/voyage-4-nano/
- Artículo en dev.co: https://dev.co/ai/llms/voyage-4-nano
- Ficha en ThinkLLM: https://thinkllm.dev/models/voyage-4-nano
