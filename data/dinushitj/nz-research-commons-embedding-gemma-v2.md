# dinushiTJ/nz-research-commons-embedding-gemma-v2

## Resumen

`dinushiTJ/nz-research-commons-embedding-gemma-v2` es un modelo de embeddings de frases (sentence-similarity / feature-extraction) publicado por el usuario dinushiTJ el 10 de septiembre de 2026. Se trata de un fine-tune de `google/embeddinggemma-300m`, un encoder denso de la familia Gemma 3 (etiqueta `gemma3_text`) con 302.863.104 parámetros, orientado a la recuperación semántica de documentos del repositorio de investigación «NZ research commons» de Nueva Zelanda.

El modelo resuelve un problema acotado pero concreto: indexar y recuperar publicaciones científicas neozelandesas a partir de consultas en lenguaje natural, trabajando sobre registros con estructura fija (título, autores, materias, resumen, texto completo y año). Los ejemplos de la model card corresponden a geología del Cenozoico y a disparidades étnicas en la supervivencia al cáncer de mama, lo que indica un dominio claramente especializado en investigación académica de Nueva Zelanda.

Es relevante porque demuestra el patrón actual de adaptación de modelos de embeddings generalistas a dominios institucionales concretos mediante `sentence-transformers` y TripletLoss sobre un conjunto de 5.000 ejemplos. El repositorio no declara licencia, idiomas soportados, dimensión de embedding ni longitud de contexto, y no cuenta con descargas ni valoraciones, por lo que debe evaluarse como un artefacto experimental antes de considerarlo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer denso (backbone de texto Gemma 3, etiqueta `gemma3_text`) con cabecera de embeddings de `sentence-transformers` |
| Parámetros totales | 302.863.104 (≈303 M, dato de safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors (1,3 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en los metadatos del repositorio |
| Formato de pesos | safetensors |
| Dimensión de embedding | No disponible |
| Tarea declarada | sentence-similarity, feature-extraction |
| Función de pérdida | TripletLoss |
| Tamaño del dataset de entrenamiento | 5.000 ejemplos (etiqueta `dataset_size:5000`) |
| Modelo base | `google/embeddinggemma-300m` (fine-tune) |
| Librería | sentence-transformers |
| Compatibilidad de despliegue | Text Embeddings Inference (TEI), endpoints compatibles |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (`generated_from_trainer`) de `google/embeddinggemma-300m`, un encoder denso construido sobre el backbone de texto de Gemma 3. Conserva por tanto los 302,8 millones de parámetros del modelo base y produce embeddings de frase en lugar de tokens generados; no incorpora mecanismos de atención lineal, decodificación especulativa ni arquitecturas híbridas SSM, según la información disponible.

El entrenamiento se realizó con la librería `sentence-transformers` y la función de pérdida TripletLoss sobre un conjunto de 5.000 ejemplos, con una formulación de tripletas (ancla, positivo, negativo) que empuja las representaciones de documentos relacionados a estar más cerca que las de documentos no relacionados. Los datos de entrenamiento parecen derivarse de registros del repositorio «NZ research commons», serializados con los campos `title`, `authors`, `subjects`, `abstract`, `text` y `year`, como muestran los ejemplos de la model card. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, la proporción de negativos, ni sobre si hubo etapas posteriores de RLHF, DPO o ajuste con datos sintéticos. La model card referencia dos trabajos de arXiv en sus etiquetas: 1908.10084 y 1703.07737.

## Capacidades

- Generación de embeddings densos de frases y documentos para similitud semántica y recuperación de información.
- Búsqueda semántica en corpus académicos: consulta en lenguaje natural frente a registros estructurados con título, autores, materias, resumen, texto y año.
- Similitud documento-documento, útil para deduplicación, agrupamiento y recomendación de lecturas relacionadas.
- Extracción de características (`feature-extraction`) para pipelines posteriores de clasificación, clustering o reranking, siempre que se añada una cabeza o un índice adecuado.
- Procesamiento de registros de longitud media y larga mediante concatenación de campos; el límite real depende del contexto del modelo base, no documentado en este repositorio.
- Integración directa con `sentence-transformers` y con Text Embeddings Inference, incluido el uso a través de endpoints compatibles.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa modo de razonamiento, agentes, visión ni audio.
- Capacidades multilingües: no documentadas. Los ejemplos de la model card están en inglés con terminología maorí, pero el repositorio no declara cobertura de idiomas.

## Casos de uso

- Búsqueda semántica en repositorios institucionales: indexar los registros del repositorio de investigación neozelandés y permitir consultas en lenguaje natural que recuperen publicaciones relevantes aunque el vocabulario de la consulta no coincida con el del título o el resumen.
- Recuperación aumentada (RAG) sobre literatura científica: usar los embeddings como etapa de recuperación previa a un modelo generativo, de modo que las respuestas se fundamenten en documentos del corpus indexado.
- Recomendación de artículos relacionados: calcular vecinos más cercanos en el espacio de embeddings para sugerir publicaciones afines a la que el usuario está consultando, por ejemplo en un lector de fichas de investigación.
- Deduplicación y control de calidad del repositorio: detectar registros duplicados o casi duplicados comparando similitudes por encima de un umbral, algo habitual en repositorios que agregan metadatos de distintas fuentes.
- Agrupamiento temático y análisis bibliométrico: generar embeddings de todo el corpus y aplicar clustering para descubrir áreas de investigación emergentes o medir la proximidad entre departamentos y disciplinas.
- Clasificación y enrutamiento de consultas: usar los embeddings como entrada de un clasificador ligero que asigne cada depósito a una facultad, materia o colección según su contenido.
- Apoyo a revisiones sistemáticas: filtrar automáticamente candidatos relevantes para una pregunta de investigación comparando la similitud entre la pregunta y los resúmenes, reduciendo el volumen de cribado manual.
- Servicio de similitud en producción de baja latencia: desplegar el modelo con Text Embeddings Inference detrás de un endpoint HTTP para alimentar un motor vectorial con embeddings generados al vuelo durante la ingesta de nuevos documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (recall@k, nDCG), resultados en MTEB ni comparaciones cuantitativas con el modelo base, y la búsqueda web realizada no devolvió documentación técnica ni evaluación alguna del modelo. Tampoco se dispone de resultados de MTEB para `google/embeddinggemma-300m` dentro de la información proporcionada.

## Requisitos de hardware

- Pesos en precisión completa: 302,9 M de parámetros equivalen aproximadamente a 1,21 GB en FP32 (el repositorio ocupa 1,3 GB en safetensors).
- Pesos en FP16/BF16: aproximadamente 0,61 GB. En INT8: aproximadamente 0,30 GB. Estas estimaciones son aritméticas a partir del número de parámetros; el repositorio no publica versiones cuantizadas.
- VRAM estimada para inferencia: del orden de 1,5 a 2,5 GB contando pesos, activaciones y overhead del runtime en FP32; en torno a 1 GB o menos en FP16.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de datacenter pequeñas (T4, L4, A10). Es viable incluso en CPU para cargas de baja concurrencia.
- Las GPUs de gama alta (A100, H100) solo se justifican para despliegues de alto throughput con batching masivo, no por requisitos de memoria, que son mínimos.
- Opciones de despliegue: `sentence-transformers` en Python, Text Embeddings Inference (TEI) para servicio HTTP con batching dinámico, y endpoints compatibles (la etiqueta `endpoints_compatible` del repositorio así lo indica). No se confirma en la información disponible el soporte de llama.cpp, Ollama, ONNX o TensorRT.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de documentos por segundo bajo ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinushiTJ/nz-research-commons-embedding-gemma-v2 | 302,9 M | No disponible | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| google/embeddinggemma-300m | ≈300 M | 768 (documentación pública del modelo base) | 2.048 tokens (documentación pública del modelo base) | Gemma Terms of Use (documentación pública del modelo base) | HuggingFace, modelo base oficial |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | Apache-2.0 | HuggingFace, ampliamente adoptado |
| BAAI/bge-m3 | ≈568 M | 1.024 | 8.192 tokens | MIT | HuggingFace, ampliamente adoptado |

No hay datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos de terceros proceden de su documentación pública y no formaban parte de la información facilitada en esta búsqueda; conviene verificarlos antes de tomar decisiones de arquitectura.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Al derivar de `google/embeddinggemma-300m`, es probable queherede las condiciones de la Gemma Terms of Use, que incluye restricciones de uso y una política de usos prohibidos, pero esto no está confirmado en la información disponible. No debe usarse en producción comercial sin aclararlo con el autor.
- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de la consulta, y sin métricas publicadas, lo que impide estimar su calidad real frente al modelo base.
- Dominio muy restringido: el entrenamiento se hizo sobre 5.000 ejemplos de un repositorio de investigación neozelandés. Es esperable una degradación del rendimiento fuera de ese corpus o en dominios con vocabulario muy distinto, aunque no hay datos que cuantifiquen esa pérdida.
- Idiomas no documentados: no se puede asumir buen comportamiento en castellano ni en otros idiomas distintos del inglés; los ejemplos disponibles están en inglés con terminología maorí.
- Dimensión de embedding y longitud de contexto no documentadas: son dos parámetros críticos para dimensionar el índice vectorial y decidir la estrategia de troceado de documentos, y no aparecen en el repositorio.
- Riesgo de sesgo heredado del corpus: los datos incluyen literatura sobre disparidades étnicas en salud, un ámbito sensible; los embeddings pueden reflejar sesgos de representación de los colectivos maorí y del Pacífico presentes en las fuentes originales.
- Riesgo de alucinación: no aplica en sentido estricto, ya que el modelo no genera texto. El riesgo equivalente son los falsos positivos por similitud, que dependen del umbral elegido y no están calibrados en la documentación.
- Sin información sobre el preprocesado de entrenamiento ni sobre negativos difíciles, lo que dificulta reproducir o continuar el ajuste.
- Al ser un modelo de recuperación, no puede usarse por sí solo para responder preguntas: requiere un índice vectorial y, si se quiere respuesta en lenguaje natural, un modelo generativo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dinushiTJ/nz-research-commons-embedding-gemma-v2
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/1908.10084
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/1703.07737
- Librería sentence-transformers: https://sbert.net
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su autor; los resultados obtenidos correspondían a páginas de ayuda de YouTube y a la comunidad Zhihu, sin relación con el contenido de esta ficha.
