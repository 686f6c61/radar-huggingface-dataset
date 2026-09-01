# litert-community/ettin-reranker-400m-v1

## Resumen

`litert-community/ettin-reranker-400m-v1` es una conversión a LiteRT (formato `.tflite`) del modelo cross-encoder `cross-encoder/ettin-reranker-400m-v1`, un reranker de tipo cross-encoder basado en el backbone ModernBERT de 400 millones de parámetros. El modelo está diseñado para inferencia en dispositivos edge y CPU, sin necesidad de GPU ni conexión a internet. A diferencia de los bi-encoders, el cross-encoder procesa la consulta y el pasaje juntos a través de la red, devolviendo un único logit de relevancia, lo que proporciona la mayor precisión posible en tareas de reranking a costa de una invocación por candidato.

La conversión incluye la cabeza de puntuación completa (CLS pooling → Dense+GELU → LayerNorm → Dense) dentro del grafo, y ofrece dos variantes: una cuantizada en int8 de rango dinámico (413 MB, recomendada para edge) y otra en fp16 (797 MB, orientada a escritorio). El modelo soporta tres longitudes de secuencia fijas (128, 256 y 512 tokens) mediante firmas múltiples, y el enrutado automático selecciona la firma más pequeña que admite cada par. La salida es un logit crudo, no una probabilidad, por lo que no debe aplicarse sigmoid si se desea comparar con las puntuaciones de la tarjeta del modelo base.

Este lanzamiento es relevante porque permite ejecutar un reranker de alta calidad completamente offline en dispositivos móviles y embebidos, un caso de uso cada vez más demandado en pipelines de retrieval aumentado por generación (RAG) y búsqueda semántica en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cross-encoder |
| Parametros totales | 400M (según denominación del modelo) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de las firmas: 128, 256, 512) |
| Tipos de cuantizacion | int8 dynamic-range, fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .tflite (LiteRT) |

## Arquitectura y entrenamiento

El modelo base `cross-encoder/ettin-reranker-400m-v1` es un cross-encoder construido sobre el backbone ModernBERT de 400 millones de parámetros. En un cross-encoder, la consulta y el pasaje se concatenan y se procesan conjuntamente, a diferencia de los bi-encoders que generan embeddings por separado. La cabeza de puntuación, incluida en el grafo convertido, consta de CLS pooling, una capa densa 1024→1024 con activación GELU, LayerNorm y una capa densa final que produce un logit de relevancia.

La conversión a LiteRT se realizó mediante una traza directa del backbone ModernBERT (no es una exportación de LLM), con la atención completa y la atención de ventana deslizante (±64 tokens) construidas manualmente dentro del wrapper trazado. Los pesos se cuantizaron en int8 de rango dinámico para la variante recomendada, manteniendo el cómputo en coma flotante. No se dispone de información detallada sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO), más allá de que fue evaluado en el benchmark MTEB Retrieval (inglés, v2) con seis modelos de embedding diferentes.

## Capacidades

- Reranking de pares consulta-pasaje: devuelve un logit de relevancia crudo (mayor valor = más relevante).
- Inferencia completamente offline en CPU, sin dependencia de GPU ni servicios externos.
- Soporte de tres longitudes de secuencia fijas (128, 256, 512) mediante firmas múltiples, con enrutado automático a la firma más pequeña que admite cada par.
- Manejo de padding interno: el relleno se enmascara dentro del grafo, por lo que un mismo par obtiene la misma puntuación a través de cualquier firma.
- Truncamiento `longest_first` para pares que exceden 512 tokens, recortando primero el elemento más largo.
- Compatible con el ecosistema LiteRT (antes TensorFlow Lite) y con tokenizadores de Hugging Face (AutoTokenizer).
- No requiere `token_type_ids`; la entrada se codifica como `[CLS] query [SEP] passage [SEP]`.

## Casos de uso

- Reranking en pipelines RAG: tras una primera recuperación con un bi-encoder (p. ej., embeddings), el modelo reordena los 20-100 candidatos más relevantes para mejorar la precisión final de la generación. Su naturaleza cross-encoder ofrece mayor exactitud que un bi-encoder, a costa de una invocación por candidato.
- Búsqueda semántica en dispositivos móviles: aplicaciones de búsqueda local (notas, contactos, archivos) que necesitan reranking offline sin enviar datos a servidores.
- Filtrado de resultados en asistentes de voz o chatbots embebidos: el modelo puede seleccionar la respuesta más adecuada entre varias opciones generadas por un sistema de diálogo.
- Moderación de contenido o clasificación de documentos: dado un texto de consulta, se pueden puntuar múltiples documentos para decidir cuáles son relevantes para una política o categoría.
- Sistemas de recomendación basados en texto: reranking de ítems candidatos (productos, artículos) según la consulta del usuario, ejecutable en el cliente.
- Evaluación de calidad de pares en entornos de prueba: al ser un cross-encoder, puede usarse como referencia para comparar la calidad de embeddings generados por otros modelos.

## Benchmarks y rendimiento

La model card de la conversión LiteRT reporta comprobaciones de calidad frente a la referencia PyTorch fp32, así como métricas en un subconjunto de NanoSciFact (50 afirmaciones × 20 candidatos, con abstracts dorados y negativos aleatorios). Los números absolutos no son comparables con benchmarks publicados porque los corpus están submuestreados.

| Variante | nDCG@10 | MRR@10 | hit@1 | Inversiones de pares |
|---|---|---|---|---|
| PyTorch fp32 | 0.9637 | 0.950 | 0.920 | — |
| LiteRT fp32 (convertido) | 0.9637 | 0.950 | 0.920 | 0 |
| LiteRT fp16 | 0.9637 | 0.950 | 0.920 | 0 |
| LiteRT int8 | 0.9563 | 0.940 | 0.900 | 2.8% de pares invertidos |

Además, se verificó que la puntuación del ejemplo de la tarjeta base (`[3.6875, 11.6875, 4.75, 9.375]` en bfloat16) se reproduce en fp32 con una diferencia máxima de 0.054 y el mismo ranking. El modelo base fue evaluado en el benchmark MTEB Retrieval (inglés, v2, 10 tareas, top-100 reranked) con seis modelos de embedding, pero no se han publicado los resultados numéricos en la información disponible.

## Requisitos de hardware

- La variante int8 (413 MB) está pensada para dispositivos edge y CPU; el pico de RSS medido en un M4 Max Mac con 8 hilos es de 1469 MiB al cargar e invocar las tres firmas.
- La variante fp16 (797 MB) es para escritorio; XNNPACK expande los pesos fp16 a fp32 por subgrafo, por lo que el pico de RSS alcanza ~6379 MiB (unas 8 veces el tamaño del archivo).
- Velocidad medida en M4 Max Mac con 16 hilos (mediana de 10 ejecuciones, firmas al 75% de ocupación):
  - int8: 89.5 ms en `score_256`, 144.1 ms en `score_512`.
  - fp16: 110.7 ms en `score_256`, 188.7 ms en `score_512`.
- Al ser un cross-encoder, el coste es proporcional al número de candidatos: rerankear 20 candidatos con `score_256` requiere 20 invocaciones.
- Despliegue compatible con LiteRT (Python `ai_edge_litert.interpreter`), y por extensión con cualquier runtime TFLite. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros rerankers en la información proporcionada. El modelo pertenece a la familia Ettin Reranker, que incluye variantes de distintos tamaños, pero no se han facilitado métricas comparativas frente a alternativas como BGE-reranker, MiniLM cross-encoder o Cohere rerank. La principal diferencia frente a otros cross-encoders es su formato LiteRT y su optimización para inferencia en CPU/edge, así como su base ModernBERT de 400M parámetros.

## Limitaciones y advertencias

- La salida es un logit crudo; no debe aplicarse sigmoid si se desea mantener la escala de puntuaciones del modelo base. Aplicar sigmoid no altera el ranking, pero cambia la escala.
- La longitud de contexto está limitada a 512 tokens (firmas de 128, 256 y 512). Pares más largos se truncan con `longest_first`, lo que puede perder información relevante.
- La variante int8 muestra una ligera degradación en métricas de ranking (2.8% de pares invertidos en el subconjunto evaluado) frente a fp32/fp16.
- No se especifican los idiomas soportados; aunque ModernBERT es multilingüe, la evaluación reportada se limita a inglés (MTEB eng, v2).
- El coste de inferencia es lineal con el número de candidatos; para colecciones muy grandes, el reranking puede volverse computacionalmente intensivo en dispositivos edge.
- No se dispone de información sobre sesgos, alucinaciones o riesgos específicos del modelo base, más allá de los inherentes a los modelos de lenguaje entrenados con datos web.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original.

## Enlaces

- Modelo LiteRT en Hugging Face: https://huggingface.co/litert-community/ettin-reranker-400m-v1
- Modelo base cross-encoder: https://huggingface.co/cross-encoder/ettin-reranker-400m-v1
- README del modelo base: https://huggingface.co/cross-encoder/ettin-reranker-400m-v1/blob/main/README.md
- Artículo sobre la familia Ettin Reranker: https://bittide.aicompass.dev/article/ffba36f8-bda2-44d0-bcd4-32943ea04a0e
- Ficha en AI Flash Report: https://aiflashreport.com/models/the-ettin-reranker-family/
- Ficha en Mixpeek Model Hub: https://mixpeek.com/model/cross-encoder/ettin-reranker-400m-v1
