# dhamma-seeker/tripitaka-mcp-embedder

## Resumen

`tripitaka-mcp-embedder` es un modelo de embeddings de frases desarrollado por el usuario dhamma-seeker para recuperación cross-lingual inglés→pāli. Se trata de un fine-tuning del modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (118M parámetros, 384 dimensiones), orientado a la búsqueda semántica dentro del canon budista Theravāda. El modelo genera vectores a partir de texto en pāli directamente, de forma que una consulta en inglés puede alinearse contra el texto original sin necesidad de mezclar traducciones inglesas en el embedding.

El modelo resuelve un problema concreto: la mayoría de embedders multilingües rinden mal en pāli, un idioma de bajos recursos con escasa representación en corpus de preentrenamiento. El fine-tuning se realizó con 133.276 pares alineados pāli↔inglés procedentes de SuttaCentral (`bilara-data`, CC0), usando pérdida contrastiva `MultipleNegativesRankingLoss` y entrenamiento Matryoshka (MRL), lo que permite truncar las dimensiones del vector (384/256/192/128/64) con pérdida de calidad casi nula a 256 dimensiones.

Es relevante ahora porque forma parte del servidor `tripitaka-mcp` como motor de búsqueda semántica, y demuestra que un modelo pequeño (118M parámetros, repo de 0,5 GB) puede superar ampliamente a su base en una tarea de dominio especializado: la alineación BUCC pasa del 22,3% al 90,0% en R@10 a nivel de sutta. Su licencia CC0-1.0 facilita su reutilización sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (MiniLM-L12, fine-tuned para sentence embeddings) |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; inferencia estándar en float32/float16) |
| Idiomas soportados | pāli (pi), inglés (en) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un transformer BERT de tipo MiniLM con 12 capas y 384 dimensiones de embedding. Sobre esa base se aplicó un fine-tuning contrastivo con `MultipleNegativesRankingLoss`, una función de pérdida que trata los demás ejemplos del batch como negativos implícitos, eficaz para tareas de recuperación. El conjunto de entrenamiento lo forman 133.276 pares de segmentos alineados pāli↔inglés extraídos de `bilara-data` de SuttaCentral, publicado bajo CC0.

La innovación técnica destacable es el entrenamiento Matryoshka (MRL), que estructura el espacio de embeddings de forma jerárquica para permitir truncar el vector a 384, 256, 192, 128 o 64 dimensiones. Según el autor, la pérdida de calidad al truncar a 256 dimensiones es casi nula, lo que reduce el coste de almacenamiento e indexación en producción. El modelo está pensado para embeber el texto en pāli directamente y alinear consultas en inglés contra ese espacio vectorial, sin pasar por traducciones intermedias.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación (pipeline `sentence-similarity`).
- Recuperación cross-lingual inglés→pāli: una consulta en inglés se alinea contra texto en pāli.
- Embeddings Matryoshka con truncado configurable vía `truncate_dim` (384/256/192/128/64).
- Normalización de embeddings (`normalize_embeddings=True`) para similitud coseno.
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face (`endpoints_compatible`).
- Integración con `sentence-transformers` y ecosistema Python estándar.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento; es un modelo puramente de representación vectorial.

## Casos de uso

- Búsqueda semántica en el canon budista: el modelo embebe segmentos en pāli y permite que un usuario consulte en inglés («the night of the Buddha's awakening») y recupere los pasajes originales correspondientes, sin depender de traducciones.
- Servidor MCP `tripitaka-mcp`: se usa como motor de recuperación del servidor de búsqueda semántica, integrándose en flujos de agentes que consultan el Tipitaka.
- Construcción de índices vectoriales de bajo coste: gracias al truncado Matryoshka a 256 dimensiones, se puede indexar un corpus amplio con vectores más pequeños y pérdida mínima de calidad, reduciendo memoria y latencia en bases vectoriales.
- Investigación filológica y estudios de alineación: permite localizar correspondencias entre pasajes en pāli y conceptos formulados en inglés, útil para análisis textual y comparativo.
- Sistemas de preguntas y respuestas sobre textos religiosos: combinado con un LLM generativo, el embedder actúa como recuperador (RAG) para responder consultas sobre doctrina budista citando pasajes en pāli.
- Aplicaciones educativas de aprendizaje de pāli: permite a estudiantes angloparlantes buscar términos y conceptos en el corpus original sin conocer el idioma.
- Deduplicación y agrupación de segmentos multilingües: la alta alineación BUCC (90% R@10) lo hace útil para emparejar automáticamente segmentos pāli e inglés en corpus paralelos.

## Benchmarks y rendimiento

Resultados medidos en la evaluación de `tripitaka-mcp`, R@10 a nivel de sutta:

| Modelo | Consulta de concepto | BUCC (alineación) |
|---|---|---|
| MiniLM base | 16,7% | 22,3% |
| Este modelo (segmento) | 25,0% | 90,0% |
| Este modelo + multi-nivel (chunk/sutta + RRF) | 37,5% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 118M parámetros en float32 ocupa aproximadamente 0,5 GB de pesos, y en float16 alrededor de 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en RTX 3060, RTX 4090, T4, A10, A100 o H100, aunque el modelo no necesita hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), endpoints de Hugging Face; también puede exportarse a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tripitaka-mcp-embedder | 117,6M | no disponible | pi, en | CC0-1.0 | Especializado en pāli↔inglés; R@10 BUCC 90% |
| paraphrase-multilingual-MiniLM-L12-v2 (base) | 118M | no disponible | multilingüe | MIT | Base del modelo; BUCC 22,3% en esta tarea |
| Otros embedders multilingües genéricos | variable | variable | multilingüe | variable | No disponibles datos comparativos específicos para pāli en la información proporcionada |

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera del dominio pāli↔inglés no está validado y probablemente sea inferior al de embedders multilingües genéricos.
- Solo cubre dos idiomas (pāli e inglés); no soporta consultas en castellano ni en otras lenguas.
- Riesgo de sesgo de dominio: entrenado exclusivamente con `bilara-data`, por lo que puede no generalizar a otras variantes de pāli o a textos fuera del canon Theravāda.
- La longitud máxima de contexto no está documentada; secuencias largas pueden truncarse según la configuración del tokenizador del modelo base.
- Al ser un modelo de embeddings, no genera texto: no debe usarse para tareas generativas ni de razonamiento.
- Licencia CC0-1.0: sin restricciones para uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento en despliegues productivos.
- El modelo tiene muy poca adopción (40 descargas, 0 likes) y fue publicado recientemente; no hay validación independiente de sus resultados más allá de la evaluación del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhamma-seeker/tripitaka-mcp-embedder
- Repositorio del servidor tripitaka-mcp: https://github.com/dhamma-seeker/tripitaka-mcp
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Datos de entrenamiento (bilara-data, SuttaCentral): no disponible como enlace directo en la información proporcionada
