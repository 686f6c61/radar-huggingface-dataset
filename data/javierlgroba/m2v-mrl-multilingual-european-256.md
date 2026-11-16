# javierlgroba/m2v-mrl-multilingual-european-256

## Resumen

m2v-mrl-multilingual-european-256 es un modelo de embeddings estáticos multilingües derivado de sentence-transformers/static-similarity-mrl-multilingual-v1, publicado por el usuario javierlgroba. No es un modelo generativo ni un transformer con atención: es una tabla de embeddings de tokens en formato model2vec, es decir, cada token del vocabulario tiene un vector fijo y el vector de una frase se obtiene promediando los vectores de sus tokens. El resultado es un encoder extremadamente ligero que no requiere GPU ni cómputo de atención para producir representaciones vectoriales.

La aportación del autor es doble. Por un lado, recorta la dimensión de embedding de 1024 a 256 aprovechando que el modelo original fue entrenado con pérdida Matryoshka, de modo que las primeras 256 dimensiones son utilizables de forma autónoma. Por otro, poda el vocabulario de 105.879 a 73.845 tokens eliminando todos aquellos que contienen caracteres de escrituras no europeas (CJK, hangul, árabe, hebreo, índicas, etc.), conservando latino, griego, cirílico, armenio y georgiano. El resultado pesa unos 76 MB frente a los 434 MB del original.

Es relevante para escenarios de búsqueda semántica, deduplicación y clustering multilingüe en los que se necesita un encoder que quepa en memoria, funcione en CPU con latencia mínima y cubra las principales lenguas europeas (de, en, fr, es, it, nl, pl, ro, el, cs, bg). Su licencia Apache-2.0 facilita el uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec); sin transformer, sin atención; pooling por media de vectores de token |
| Parámetros totales | 18.904.320 (tensor único de 73.845 × 256 en float32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no hay ventana de atención; el pooling se hace sobre todos los tokens de entrada) |
| Tipos de cuantización | no disponible (pesos publicados en float32; al ser una tabla de embeddings admite reducción a float16/int8 por truncamiento, pero el autor no documenta cuantizaciones) |
| Idiomas soportados | multilingual, de, en, fr, es, it, nl, pl, ro, el, cs, bg |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) + tokenizer.json + config.json |

## Arquitectura y entrenamiento

El modelo no entrena desde cero: hereda los pesos del modelo base sentence-transformers/static-similarity-mrl-multilingual-v1, que a su vez es una destilación estática de un modelo transformer multilingüe. La arquitectura model2vec sustituye el codificador por una matriz de embeddings de tokens; la representación de una secuencia se calcula como la media de los vectores de sus tokens (sin tokens especiales en el pooling manual). No hay capas, ni atención, ni activaciones no lineales en tiempo de inferencia.

Las dos transformaciones aplicadas por el autor son: (1) truncado Matryoshka a las primeras 256 dimensiones, válido porque el modelo base se entrenó con pérdida Matryoshka y esas dimensiones son autosuficientes; y (2) poda de vocabulario eliminando los tokens que contienen caracteres de escrituras no europeas, con renumeración de ids. El tokenizador se mantiene como BERT WordPiece con normalización que pasa a minúsculas y elimina acentos. El texto en escrituras europeas tokeniza exactamente igual que en el original y produce los mismos vectores truncados a 256 dimensiones; las palabras en escrituras eliminadas se mapean a `[UNK]`. No se documentan datos de entrenamiento adicionales, número de tokens ni etapas de RLHF/DPO, ya que el modelo no se reentrena.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y búsqueda vectorial.
- Soporte multilingüe para las lenguas europeas listadas (alemán, inglés, francés, español, italiano, neerlandés, polaco, rumano, griego, checo, búlgaro) y, en general, para texto en escrituras latina, griega, cirílica, armenia y georgiana.
- Codificación en CPU con latencia muy baja y sin necesidad de GPU, al ser una simple media de vectores de token.
- Compatible con la API `StaticModel` de la librería model2vec (`from_pretrained`, `encode`).
- Pooling manual alternativo: tokenizar sin tokens especiales, promediar las filas de tokens y comparar con similitud coseno.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: no es un modelo generativo.

## Casos de uso

- Búsqueda semántica multilingüe en catálogos de producto: codificar consultas y descripciones en varias lenguas europeas y recuperar por similitud coseno; el tamaño de 76 MB permite tener el índice y el encoder en el mismo proceso sin GPU.
- Deduplicación de registros en bases de datos europeas: calcular embeddings de nombres, direcciones o descripciones y agrupar por umbral de similitud; la poda de escrituras no europeas reduce el vocabulario y acelera el tokenizado de corpus mayoritariamente latinos.
- Clustering y etiquetado temático de documentación interna en varios idiomas: agrupar tickets, correos o artículos por similitud semántica en CPU, apto para pipelines batch sin infraestructura de aceleradores.
- Filtrado y moderación aproximada: comparar mensajes entrantes contra una lista de patrones o plantillas conocidas mediante similitud de embeddings, con latencia de milisegundos por lote en CPU.
- Enrutamiento ligero en sistemas RAG: usar el modelo como primera etapa de recuperación o como re-ranker barato antes de un modelo más pesado, aprovechando que codifica en CPU sin competir por VRAM con el generador.
- Detección de duplicados en pipelines de ingesta de datos de entrenamiento: identificar pares de documentos casi idénticos entre corpus multilingües europeos antes de entrenar otros modelos, con coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está pensado para ejecutarse en CPU. El tensor de pesos ocupa aproximadamente 76 MB en float32 (73.845 × 256 × 4 bytes).
- GPU recomendadas: no requiere GPU; cualquier GPU sirve si se desea, pero no aporta ventaja significativa frente a CPU para esta arquitectura.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (Raspberry Pi, contenedores pequeños, funciones serverless).
- Opciones de despliegue: librería model2vec (`StaticModel`), integración en pipelines de Python con NumPy; no aplica vLLM, TGI ni llama.cpp, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles de forma documentada; por la naturaleza del modelo (media de vectores de token) la latencia es del orden de microsegundos a milisegundos por frase en CPU, muy inferior a la de un transformer.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensión | Vocabulario | Tamaño | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| m2v-mrl-multilingual-european-256 (este) | Embeddings estáticos (model2vec) | 256 | 73.845 | ~76 MB | Europeas (11 listadas) | Apache-2.0 |
| sentence-transformers/static-similarity-mrl-multilingual-v1 (base) | Embeddings estáticos | 1024 | 105.879 | ~434 MB | Multilingüe amplio | Apache-2.0 |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Transformer (encoder) | 384 | ~250k | ~470 MB | Multilingüe amplio | Apache-2.0 |
| BAAI/bge-m3 | Transformer (encoder) | 1024 | ~250k | ~2,2 GB | Multilingüe amplio | MIT |

La comparativa se limita a datos estructurales conocidos; no se dispone de resultados de benchmarks comparativos en la información proporcionada para este modelo.

## Limitaciones y advertencias

- Al ser un modelo de embeddings estáticos, no captura contexto sintáctico ni desambiguación dependiente de la posición: la representación es una media de vectores de token, con la pérdida de matiz que ello implica frente a un transformer.
- Las palabras en escrituras eliminadas (CJK, árabe, hebreo, índicas, etc.) se mapean a `[UNK]`; el modelo no es adecuado para texto en esas escrituras.
- El truncado a 256 dimensiones reduce la capacidad de representación frente a las 1024 del original; puede afectar a tareas que requieran matices finos de similitud.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos en similitud semántica por la limitación del pooling.
- No se documentan sesgos específicos; al heredar del modelo base, arrastra los sesgos presentes en sus datos de entrenamiento, no detallados en la información disponible.
- No hay métricas publicadas de rendimiento (MTEB u otras) para esta variante podada, por lo que la calidad frente al original no está cuantificada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base; el autor indica que es la misma licencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/javierlgroba/m2v-mrl-multilingual-european-256
- Modelo base: https://huggingface.co/sentence-transformers/static-similarity-mrl-multilingual-v1
- Librería model2vec: no disponible enlace en la información proporcionada
- Paper o blog del autor: no disponible
