# Jbbok/my-embeddinggemma-2-sec

## Resumen

`Jbbok/my-embeddinggemma-2-sec` es un modelo de embeddings de frases (sentence embeddings) obtenido mediante fine-tuning del modelo base `google/embeddinggemma-2`. Lo desarrolla el usuario Jbbok y se publica en Hugging Face con la librería `sentence-transformers`. Su propósito es la similitud semántica y la extracción de características densas, con un enfoque aparente en el dominio financiero y de informes corporativos (formularios 10-K de la SEC), a juzgar por los ejemplos de la model card.

El modelo cuenta con 271.002.648 parámetros y un repositorio de 1,1 GB, lo que sugiere pesos en safetensors en precisión de 32 bits o similar. La arquitectura declarada es `embedding_gemma2`, es decir, un transformer encoder derivado de la familia Gemma 2 adaptado para generar representaciones vectoriales densas. El entrenamiento se realizó sobre un conjunto de datos de 3.867 ejemplos utilizando las funciones de pérdida `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`.

Su relevancia es limitada pero concreta: se trata de un fine-tuning de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia ni idiomas declarados. Resulta útil como ejemplo de adaptación de un modelo de embeddings generalista a un dominio especializado (documentos financieros), pero no debe considerarse un modelo consolidado ni validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (`embedding_gemma2`), derivado de Gemma 2 |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `sentence-transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo `embedding_gemma2`, la variante de la familia Gemma 2 orientada a la generación de embeddings densos. El modelo parte de `google/embeddinggemma-2` y se ha afinado con la librería `sentence-transformers`, empleando la pérdida `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`. Estas funciones de pérdida son habituales en el entrenamiento de modelos de similitud semántica con pares positivos y negativos en memoria, y la variante "cached" reduce el consumo de memoria al reutilizar representaciones.

El conjunto de entrenamiento declarado consta de 3.867 ejemplos. Los ejemplos de la model card muestran pares pregunta-respuesta construidos a partir de fragmentos de informes 10-K de empresas cotizadas (Honeywell, General Motors, McDonald's, Mastercard, Salesforce), con tablas financieras y anotaciones de etiquetas XBRL (`us-gaap:...`). Esto indica un fine-tuning orientado a la recuperación de información financiera estructurada y semiestructurada. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO, algo poco habitual en modelos de embeddings.

## Capacidades

- Generación de embeddings densos para similitud semántica y búsqueda semántica.
- Extracción de características (`feature-extraction`) a partir de texto.
- Recuperación de información en documentos financieros: preguntas sobre magnitudes contables, comparativas interanuales y localización de partidas en informes 10-K.
- Manejo de texto con estructura tabular y etiquetas XBRL embebidas en el contenido.
- Compatibilidad con `sentence-transformers` y con endpoints de Hugging Face (`endpoints_compatible`).
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un modelo exclusivamente de embeddings.
- Capacidades multilingües: no disponibles según la información proporcionada.

## Casos de uso

- Búsqueda semántica sobre informes 10-K: indexar los fragmentos de los formularios y recuperar las partidas contables relevantes ante una consulta en lenguaje natural, aprovechando el ajuste del modelo a la estructura de estos documentos.
- Sistemas de pregunta-respuesta extractiva sobre estados financieros: dado un corpus de informes anuales, recuperar el pasaje que contiene la cifra solicitada (por ejemplo, gastos SG&A de un ejercicio) y pasarlo a un modelo generador para la respuesta final.
- Deduplicación y agrupación de fragmentos financieros: calcular similitudes entre secciones de distintos informes para detectar contenido repetido o equivalente entre empresas y ejercicios.
- Construcción de un motor de comparación entre compañías: representar partidas homólogas de varias empresas en un espacio vectorial común y medir su proximidad para tareas de análisis comparativo.
- Enrutamiento de consultas en un asistente financiero: clasificar la intención del usuario comparando su embedding con plantillas de preguntas frecuentes sobre magnitudes contables.
- Filtrado de documentos relevantes en pipelines de extracción: descartar páginas o secciones de un informe que no contienen información financiera útil antes de pasarlas a un extractor basado en reglas o a un LLM.
- Prototipado rápido de recuperación aumentada (RAG) en dominio contable: al ser un modelo pequeño (271 M de parámetros), puede desplegarse en una sola GPU consumer para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 271 M de parámetros, en fp32 los pesos ocupan aproximadamente 1,08 GB; en fp16 unos 0,54 GB; en int8 unos 0,27 GB. A ello hay que sumar la memoria de activaciones y del tokenizador, por lo que un despliegue típico requiere entre 1 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para lotes grandes, una A100 o H100 permiten mayor throughput, aunque el modelo es pequeño para justificar ese hardware.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (nativo), `transformers`, `vLLM` (soporte de embeddings según versión), `Text Embeddings Inference (TEI)` de Hugging Face, y exportación a ONNX para inferencia optimizada. No se ha confirmado soporte de GGUF ni de llama.cpp para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Jbbok/my-embeddinggemma-2-sec` | 271 M | no disponible | no disponible | Hugging Face, 0 descargas |
| `google/embeddinggemma-2` (base) | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| `BAAI/bge-small-en-v1.5` | 33 M | 512 tokens | MIT | Hugging Face, ampliamente usado |
| `intfloat/multilingual-e5-small` | 118 M | 512 tokens | MIT | Hugging Face, ampliamente usado |

La comparación con `bge-small-en-v1.5` y `multilingual-e5-small` es orientativa por categoría (embeddings densos de tamaño pequeño-medio); no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. El modelo base `google/embeddinggemma-2` es la referencia directa, pero tampoco se han proporcionado sus especificaciones completas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; los ejemplos de la model card están íntegramente en inglés y en dominio financiero estadounidense.
- Conjunto de entrenamiento muy reducido (3.867 ejemplos): riesgo elevado de sobreajuste al dominio y de degradación del rendimiento en textos generales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas consolidadas.
- Sin descargas ni validación comunitaria: el modelo no ha sido probado de forma independiente; su fiabilidad en producción es desconocida.
- Riesgo de sesgo heredado del modelo base `google/embeddinggemma-2`, no documentado en la información disponible.
- Al ser un modelo de embeddings, no genera texto: no debe emplearse para tareas generativas ni de razonamiento directo.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos largos sin truncado.
- Los ejemplos incluyen datos financieros con fechas futuras (2025, 2026) y posibles errores de formato; no deben tomarse como datos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jbbok/my-embeddinggemma-2-sec
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paper de MultipleNegativesRankingLoss (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de CachedMultipleNegativesRankingLoss (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper de Sentence-BERT (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
