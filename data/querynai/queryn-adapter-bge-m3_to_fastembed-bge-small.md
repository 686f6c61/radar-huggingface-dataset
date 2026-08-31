# QuerynAi/queryn-adapter-bge-m3_to_fastembed-bge-small

## Resumen

Queryn adapter — `bge-m3` → `fastembed-bge-small` es un adaptador de traducción de embeddings desarrollado por QuerynAi, parte de su motor de traducción de embeddings. Su función es transformar un vector generado por el modelo `bge-m3` (1024 dimensiones) al espacio vectorial de `fastembed-bge-small` (384 dimensiones), de modo que un corpus ya indexado con `bge-m3` pueda servirse contra un índice de `fastembed-bge-small` sin necesidad de re-embedding. Esto resuelve un problema práctico en sistemas RAG y búsqueda vectorial: migrar entre modelos de embedding sin reprocesar grandes volúmenes de datos.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 393.6K parámetros, exportado a ONNX (opset 17). Se entrenó sobre pares de embeddings de ambos modelos usando un corpus multi-dominio de unas 350k filas, con una pérdida basada en similitud coseno. El mejor resultado de similitud coseno en test es 0.8777, lo que indica una fidelidad razonable aunque no perfecta en la traducción. Es un modelo ligero, pensado para ejecutarse en CPU, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~393.6K |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de transformación de vectores, no generativo) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (el adaptador no declara idiomas; el modelo fuente bge-m3 soporta más de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que proyecta un vector de 1024 dimensiones a uno de 384. El grafo ONNX incluye normalización L2 tanto en la entrada como en la salida, de modo que no es necesario pre-normalizar los embeddings de origen. El entrenamiento se realizó sobre pares de embeddings generados por `bge-m3` y `fastembed-bge-small` a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados (~350k filas). La función de pérdida fue `1 - mean cosine similarity`, optimizada con Adam y programación de tasa de aprendizaje con `ReduceLROnPlateau`, guardando el mejor checkpoint por época. Se compararon dos arquitecturas: una lineal y un MLP profundo; la lineal obtuvo mejor similitud coseno en test (0.8777 frente a 0.8745) y fue la publicada.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: de `bge-m3` (1024-d) a `fastembed-bge-small` (384-d).
- Normalización L2 automática de entrada y salida dentro del grafo ONNX.
- Soporte de batch dinámico en el eje de lote.
- Inferencia en CPU mediante ONNX Runtime.
- No es un modelo generativo: no genera texto, código ni razonamiento; solo transforma vectores.

## Casos de uso

- Migración de índices de búsqueda vectorial: si una organización tiene un corpus indexado con `bge-m3` y quiere cambiar a `fastembed-bge-small` (por ejemplo, por requisitos de latencia o coste), puede usar este adaptador para transformar los embeddings existentes sin re-embedding del corpus completo.
- Reducción de costes de almacenamiento: al pasar de 1024 a 384 dimensiones, el índice vectorial ocupa menos espacio (aproximadamente un 62.5% menos por vector), lo que abarata el almacenamiento y acelera las búsquedas por similitud.
- Integración con herramientas que solo soportan `fastembed`: algunos frameworks o servicios de vector DB tienen soporte nativo para `fastembed-bge-small`; este adaptador permite reutilizar datos ya procesados con `bge-m3` en esos entornos.
- Entornos con recursos limitados: `fastembed-bge-small` es un modelo mucho más ligero que `bge-m3`; el adaptador permite mantener la calidad de un modelo grande en la fase de indexación y usar uno pequeño en producción.
- Actualización incremental de índices: si se añaden nuevos documentos al corpus, se pueden generar sus embeddings con `bge-m3` y traducirlos con el adaptador para mantener la coherencia con el índice existente.
- Evaluación comparativa de espacios de embedding: el adaptador permite medir la pérdida de calidad al cambiar de modelo, ya que la similitud coseno entre el embedding original y el traducido es un indicador de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este modelo no es un LLM sino un adaptador de embeddings. El único dato de rendimiento reportado es la similitud coseno en test:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (arquitectura lineal) | 0.8777 |
| Mejor similitud coseno en test (arquitectura profunda) | 0.8745 |

Estos valores indican que la proyección lineal captura aproximadamente el 87.8% de la similitud coseno entre los espacios, lo que puede ser suficiente para aplicaciones donde una pequeña pérdida de fidelidad es aceptable.

## Requisitos de hardware

- VRAM estimada: 0 GB (inferencia en CPU; el modelo es una capa lineal de ~393K parámetros, ocupa menos de 2 MB en memoria).
- GPU recomendadas: ninguna; se ejecuta eficientemente en CPU.
- Compatibilidad con GPU de consumo: sí, pero innecesario; cualquier CPU moderna es suficiente.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), también puede integrarse en pipelines de Python con `onnxruntime` o `huggingface_hub`.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser una única capa lineal, la latencia esperada es del orden de microsegundos a milisegundos por lote, incluso en CPU.

## Comparativa con modelos similares

No se han encontrado adaptadores de traducción de embeddings directamente comparables en la informacion disponible. El modelo se puede contrastar con los dos modelos que conecta:

| Modelo | Dimensiones | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| bge-m3 (fuente) | 1024 | ~568M | 8192 tokens | MIT | Embedding denso, multi-vector y sparse |
| fastembed-bge-small (destino) | 384 | ~33M | 512 tokens | MIT | Embedding denso ligero |
| Queryn adapter (este modelo) | 384 (salida) | ~393.6K | no aplica | MIT | Traducción entre los dos anteriores |

La comparativa muestra que el adaptador es varios órdenes de magnitud más pequeño que cualquiera de los dos modelos, lo que lo hace trivial de desplegar. No hay otros adaptadores de este tipo en el ecosistema público conocido.

## Limitaciones y advertencias

- La traducción es una proyección lineal, por lo que la fidelidad no es perfecta: la similitud coseno máxima alcanzada es 0.8777, lo que implica una pérdida de información en la transformación.
- El adaptador solo funciona entre `bge-m3` y `fastembed-bge-small`; no es genérico para otros pares de modelos.
- El entrenamiento se realizó sobre dominios específicos (ciencia, legal, QA, medicina, finanzas); el rendimiento en dominios muy diferentes (por ejemplo, código fuente o contenido multimedia) no está garantizado.
- No se han publicado evaluaciones de sesgos o alucinaciones, aunque al ser un modelo de transformación determinista, el riesgo de alucinación es nulo; el riesgo principal es la degradación de la calidad de búsqueda si la proyección no es suficientemente fiel.
- El modelo está en formato ONNX y requiere `onnxruntime` para su uso; no se proporcionan pesos en otros formatos (safetensors, GGUF, etc.).
- No hay información sobre el rendimiento en producción (latencia, throughput) más allá de lo esperable por su tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-bge-m3_to_fastembed-bge-small
- Colección de adaptadores de Queryn: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Modelo fuente bge-m3: https://huggingface.co/BAAI/bge-m3
- Documentación de BGE-M3: https://bge-model.com/bge/bge_m3.html
