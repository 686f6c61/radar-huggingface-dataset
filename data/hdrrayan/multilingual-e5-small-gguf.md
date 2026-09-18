# hdrrayan/multilingual-e5-small-gguf

## Resumen

multilingual-e5-small-gguf es una conversión al formato GGUF (precisión F16) del modelo de embeddings `intfloat/multilingual-e5-small`, publicada por el usuario hdrrayan. Se trata de un encoder de la familia BERT (arquitectura XLM-RoBERTa) con 117.505.536 parámetros, que genera representaciones vectoriales de 384 dimensiones para tareas de similitud semántica y recuperación de información. Su propósito es permitir el despliegue de embeddings multilingües con `llama.cpp` y `llama-server`, sin depender del stack de PyTorch ni de `sentence-transformers`.

El valor práctico de esta conversión es la portabilidad: al estar en GGUF, el modelo se puede servir en CPU, en GPU de gama baja o incluso en hardware embebido, con una ventana de contexto de 512 tokens y un tamaño de repositorio de solo 0,2 GB. El autor reporta una fidelidad alta respecto a la salida de referencia de `sentence-transformers` (similitud coseno mínima de 0,9976 y media de 0,9992 sobre una muestra multilingüe de 20 frases en inglés, francés y chino), con preservación del ranking top-1.

Es relevante ahora porque cubre un hueco habitual en pipelines RAG autoalojados: recuperación semántica multilingüe en entornos sin GPU o con restricciones de memoria, manteniendo la licencia MIT del modelo base, lo que facilita su uso comercial. No es un modelo generativo: no produce texto, tool calling ni razonamiento, solo vectores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder de la familia BERT) |
| Parámetros totales | 117.505.536 (aproximadamente 117,5 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | GGUF F16 (única cuantización indicada en la información disponible) |
| Idiomas soportados | multilingüe; la información proporcionada no detalla la lista completa de idiomas (la muestra de validación cubre inglés, francés y chino) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (fichero `multilingual-e5-small-f16.gguf`) |
| Dimensiones del embedding | 384 |
| Pooling | mean (obligatorio) |
| Normalización | L2 (usar similitud coseno) |
| Prefijos obligatorios | `query: ` para consultas y `passage: ` para documentos |
| Modelo base | intfloat/multilingual-e5-small |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer XLM-RoBERTa, es decir, un modelo bidireccional de la familia BERT orientado a representaciones de frases y pasajes. El modelo produce un vector de 384 dimensiones por texto, aplicando pooling de tipo *mean* sobre las representaciones de los tokens y normalización L2, de forma que la similitud coseno sea la métrica natural de comparación. No hay componente generativo ni decodificador.

El modelo base `intfloat/multilingual-e5-small` fue entrenado con prefijos asimétricos, de modo que las consultas deben ir precedidas de `query: ` y los documentos indexados de `passage: `. El autor de la conversión advierte explícitamente de que la calidad de recuperación se degrada gravemente si se omiten estos prefijos. Respecto a la conversión en sí, se realizó con `convert_hf_to_gguf.py` de llama.cpp a partir de los pesos originales en safetensors; no hubo reentrenamiento, ajuste fino ni cuantización más agresiva que F16. La información proporcionada no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Extracción de características (*feature-extraction*): genera embeddings de 384 dimensiones para frases y pasajes.
- Similitud semántica entre frases (*sentence-similarity*) mediante similitud coseno sobre vectores normalizados L2.
- Recuperación de información multilingüe: búsqueda semántica con prefijos asimétricos `query:` / `passage:`.
- Indexación y búsqueda vectorial en pipelines RAG.
- Funcionamiento multilingüe dentro de una misma colección de vectores, lo que permite recuperación entre idiomas distintos.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible` en HuggingFace y con API compatible con OpenAI a través de `llama-server`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (*thinking mode*) ni de capacidades multimodales.

## Casos de uso

- Búsqueda semántica multilingüe en RAG: se indexan los documentos con el prefijo `passage: ` y cada consulta del usuario se transforma con `query: `; los vectores resultantes se almacenan en un índice vectorial (FAISS, Qdrant, pgvector) y se recuperan por similitud coseno. El modelo es adecuado cuando el corpus y las consultas están en idiomas distintos.
- Despliegue en entornos sin GPU: al ser un GGUF F16 de aproximadamente 235 MB de pesos, `llama-server --embeddings --pooling mean -c 512` funciona en CPU, lo que permite montar recuperación semántica en servidores pequeños, portátiles o dispositivos embebidos.
- Deduplicación y agrupamiento de documentos: calcular embeddings de un corpus y aplicar clustering o umbrales de similitud coseno para detectar near-duplicates y agrupar contenidos temáticamente, con prefijo `passage: ` en todos los elementos.
- Clasificación y enrutado de consultas: representar un conjunto de intenciones conocidas como vectores y asignar cada consulta entrante a la intención más cercana por similitud coseno, útil como primer paso barato antes de invocar un LLM.
- Búsqueda híbrida: combinar los embeddings con recuperación léxica tipo BM25 dentro del mismo sistema, usando el vector para la parte semántica y el índice invertido para términos exactos, nombres propios o códigos de referencia.
- Sistemas de recomendación por contenido: generar vectores de artículos, productos o publicaciones y recomendar elementos cercanos al perfil del usuario, representando el perfil como media de embeddings normalizados de los contenidos consumidos.
- Moderación y detección de contenido similar a ejemplos conocidos: mantener una biblioteca de vectores de referencia y marcar entradas cuya similitud supere un umbral, como filtro previo a una revisión humana.
- Filtrado y reordenación (*reranking* ligero) de resultados: usar la similitud coseno como señal de reordenación de candidatos ya recuperados por otro sistema, dado el bajo coste de inferencia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, MTEB, BEIR u otros) en la información disponible. El autor únicamente reporta una comprobación de fidelidad de la conversión frente a la salida de referencia de `sentence-transformers`:

| Métrica de fidelidad | Valor |
|---|---|
| Similitud coseno mínima (F16 GGUF frente a referencia) | 0,9976 |
| Similitud coseno media | 0,9992 |
| Muestra evaluada | 20 frases multilingües (inglés, francés, chino) |
| Ranking top-1 | preservado |
| Origen de la diferencia residual | diferencias de tokenización SentencePiece |

## Requisitos de hardware

- Pesos en F16: aproximadamente 235 MB (117,5 M de parámetros × 2 bytes), coherente con el tamaño de repositorio de 0,2 GB.
- VRAM estimada para inferencia: menos de 1 GB incluyendo buffer de contexto; el modelo cabe holgadamente en cualquier GPU con al menos 1-2 GB.
- GPU recomendadas: cualquier GPU, incluidas RTX 3060, RTX 4090, A100 o H100; también funciona en iGPU y en CPU.
- ¿Cabe en GPU de consumo? Sí, en todas las GPU de consumo actuales e incluso en hardware de gama muy baja o en placas tipo Raspberry Pi por el tamaño reducido del modelo.
- Opciones de despliegue: `llama.cpp` y `llama-server` con las banderas `--embeddings --pooling mean -c 512`; el servidor expone un endpoint compatible con OpenAI (`/v1/embeddings`). Para la versión original en safetensors pueden usarse `sentence-transformers`, `vLLM` o `TGI`, aunque la información proporcionada no confirma el soporte de este GGUF concreto en `vLLM` o `TGI`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hdrrayan/multilingual-e5-small-gguf | 117.505.536 | 512 tokens | 384 | MIT | GGUF en HuggingFace |
| intfloat/multilingual-e5-small (original en safetensors) | 117.505.536 | 512 tokens (según la ficha del modelo convertido) | 384 | MIT | safetensors en HuggingFace |
| Otros modelos del mismo tamaño o familia (por ejemplo, variantes mayores de e5 o encoders multilingües alternativos) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa relevante es con el modelo base original: misma arquitectura, mismos parámetros, mismas dimensiones y misma licencia, con la diferencia de que esta conversión está pensada para `llama.cpp` en lugar de `sentence-transformers`/PyTorch. La información proporcionada no incluye especificaciones de terceros alternativos, por lo que no se dispone de datos verificables para ampliar la comparativa.

## Limitaciones y advertencias

- Los prefijos `query: ` y `passage: ` son obligatorios; omitirlos degrada gravemente la calidad de recuperación según el autor.
- La ventana de contexto es de 512 tokens: los documentos largos deben dividirse en fragmentos, con la pérdida de contexto que ello implica.
- El pooling debe ser de tipo *mean*; usar otro pooling (por ejemplo CLS) altera las representaciones y rompe la comparabilidad con los vectores de referencia.
- Se debe usar similitud coseno sobre vectores normalizados L2; otras métricas de distancia no son las previstas por el modelo.
- Solo se ofrece la cuantización F16 en la información disponible; no se documentan variantes Q8_0, Q4_K_M u otras que reducirían aún más el tamaño.
- Al ser un encoder y no un modelo generativo, no hay riesgo de alucinación de texto, pero sí de falsos positivos en similitud: vectores cercanos no garantizan relevancia semántica real, especialmente con umbrales mal calibrados.
- El modelo base puede arrastrar sesgos presentes en sus datos de entrenamiento; la información proporcionada no describe la composición del corpus ni auditorías de sesgo.
- La tokenización difiere de la referencia de `sentence-transformers` (SentencePiece), lo que introduce una diferencia residual pequeña pero no nula en los embeddings; si se mezclan vectores generados con ambos stacks en el mismo índice, conviene regenerar el índice con una sola vía.
- Es una conversión no oficial, publicada por un tercero y no por intfloat; para producción conviene validar la fidelidad en el dominio concreto antes de sustituir el modelo original.
- La licencia MIT permite uso comercial, pero se hereda del modelo base y no añade garantías por parte del autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia de esta conversión concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hdrrayan/multilingual-e5-small-gguf
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de llama.cpp (herramienta de conversión y servidor): https://github.com/ggml-org/llama.cpp
- Script de conversión empleado: `convert_hf_to_gguf.py` en el repositorio de llama.cpp

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a aplicaciones de redes sociales sin relación con la ficha.
