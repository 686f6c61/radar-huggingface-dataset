# Linkup-Platform/linkup-sparseup-embed-v1

## Resumen

SPARSEUP es un modelo de recuperación de información (retrieval) basado en representaciones dispersas aprendidas, desarrollado por Linkup. Se inicializa desde `lightonai/LateOn-unsupervised` (ModernBERT-base, 149M de parámetros) y se ajusta de forma contrastiva sobre la misma mezcla de datos que LightOn empleó para entrenar DenseOn y LateOn. Su propósito es completar el triplete de arquitecturas —densa de vector único, late interaction y dispersa aprendida— manteniendo fijos el backbone y los datos, de modo que las tres puedan compararse en igualdad de condiciones. Es relevante porque, con 188M de parámetros totales, alcanza 56,4 nDCG@10 en BEIR-13 (sin MS MARCO), superando a otros codificadores dispersos públicos de menos de 150M como splade-v3 (51,7) o opensearch-neural-sparse-encoding-doc-v3-gte (54,6).

El modelo sigue el paradigma SPLADE con tres modificaciones sobre la formulación clásica: un desplazamiento de logit (`logit_shift=15`) que hace que el soporte de la ReLU arranque ya disperso, un límite de 12 dimensiones de vocabulario por token antes del pooling (`position_top_k=12`) y un plegado de formas superficiales (`vocab_fold=case_space`) que reduce el vocabulario efectivo de 50k a aproximadamente 34k términos. La salida es un diccionario de pesos por término con scoring por producto escalar, diseñado para motores de búsqueda dispersa como Seismic.

La relevancia práctica está en la eficiencia: al producir representaciones dispersas interpretables (términos del vocabulario con pesos), se integra en índices invertidos existentes y alcanza latencias por debajo del milisegundo en MS MARCO con infraestructura dedicada de un solo hilo. La licencia Apache 2.0 y su tamaño contenido lo hacen desplegable en CPU y en GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza MLM para SPLADE disperso |
| Parámetros totales | 188.391.300 (backbone de 149M más cabeza MLM) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens para consultas y 512 tokens para documentos en evaluación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB), compatible con transformers y text-embeddings-inference |

## Arquitectura y entrenamiento

El modelo parte de `lightonai/LateOn-unsupervised`, un ModernBERT-base de 149M de parámetros, al que se le injerta la cabeza MLM de ModernBERT (`head` y `decoder.bias`), manteniendo `decoder.weight` atado a los embeddings de LateOn. La codificación dispersa sigue la cadena: salida MLM → `log1p(ReLU(x − 15))` → top-k por posición (12 dimensiones de vocabulario como máximo por token) → max-pooling sobre la secuencia → plegado de vocabulario de formas con mayúsculas y prefijo `Ġ` sobre un mismo identificador. El resultado es un vector disperso de dimensionalidad efectiva ~34k. Los prefijos `[Q] ` y `[D] ` se atienden en el encoder pero no se incluyen en el pooling.

El ajuste fino es contrastivo sobre la mezcla de datos de LightOn, con 7 negativos duros muestreados de un pool de 50 más negativos in-batch, y sin destilación de cross-encoder. La innovación principal frente a SPLADE vanilla es el triple ajuste (`logit_shift`, `position_top_k`, `vocab_fold`) que controla el presupuesto de expansión por token y elimina duplicados de formas superficiales, mejorando tanto la eficiencia del índice como la calidad de la representación.

## Capacidades

- Generación de embeddings dispersos para recuperación de información: devuelve un diccionario `{token: peso}` por texto, ordenado por peso descendente.
- Codificación diferenciada de consultas y documentos mediante prefijos `[Q] ` y `[D] ` y longitudes máximas distintas (128 y 512).
- Scoring por producto escalar entre representaciones de consulta y documento.
- Expansión de términos aprendida: el modelo genera términos relacionados no presentes en el texto original (por ejemplo, "players", "pay", "footballer" a partir de "player" y "paid").
- Control del número de términos devueltos mediante el parámetro `top_k` y redondeo de pesos con `round_to`.
- Utilidades de diagnóstico: `render()` produce gráficos de barras en terminal o Jupyter con atribuciones término a término, indicando el subtoken de origen y la posición.
- Compatibilidad con `sentence-transformers` y con text-embeddings-inference.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda léxica aumentada en motores invertidos: los pesos dispersos se indexan directamente en motores como Seismic o Lucene, aprovechando la infraestructura BM25 existente sin reemplazarla, con la ventaja de que la expansión de términos es aprendida y no basada en sinónimos manuales.
- Recuperación en pipelines RAG: como primer recuperador de alta recall y baja latencia, alimentando un reranker o un LLM generador; su latencia sub-milisegundo en MS MARCO con Seismic lo hace adecuado para etapas de candidatos en producción.
- Búsqueda en documentación técnica y bases de conocimiento en inglés: con 512 tokens por documento cubre párrafos y secciones completas; el plegado de mayúsculas y formas superficiales reduce falsos negativos por variantes tipográficas.
- Filtrado previo en sistemas de preguntas y respuestas: la expansión controlada (12 dimensiones por token) mantiene el índice manejable mientras captura variantes morfológicas y derivadas.
- Despliegue en CPU o GPUs de consumo: con 188M de parámetros y pesos en safetensors de 0,8 GB, es viable en entornos sin acelerador dedicado, útil para servicios de búsqueda internos o prototipos.
- Análisis de interpretabilidad de recuperación: la utilidad `render()` permite auditar por qué un documento puntúa alto, mostrando qué términos expandidos contribuyen y desde qué token de entrada, útil para depurar índices y ajustar analizadores.
- Comparación controlada de arquitecturas de retrieval: al compartir backbone y datos con DenseOn y LateOn, sirve como referencia experimental en investigación sobre representaciones densas frente a dispersas.

## Benchmarks y rendimiento

BEIR-13 (nDCG@10), comparación controlada con el mismo backbone y datos. SPARSEUP usa búsqueda aproximada con Seismic; LateOn y DenseOn, búsqueda exacta.

| Modelo | Media | Media (sin MS MARCO) |
|---|---|---|
| LateOn | 57,9 | 58,9 |
| DenseOn | 56,9 | 57,9 |
| SPARSEUP | 55,4 | 56,4 |

Comparación con codificadores dispersos competitivos (media sin MS MARCO):

| Modelo | Media (sin MS MARCO) |
|---|---|
| splade-v3 | 51,7 |
| granite-embedding-30m-sparse | 50,6 |
| ModernBERT-VT | 52,4 |
| opensearch-neural-sparse-encoding-v1 | 52,4 |
| opensearch-neural-sparse-encoding-doc-v3-gte | 54,6 |
| SPARSEUP | 56,4 |
| LACONIC-1B | 58,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 188M de parámetros en fp32 son aproximadamente 0,75 GB de pesos, y en fp16 alrededor de 0,4 GB, más activaciones para lotes de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequeños; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: transformers con `trust_remote_code=True`, text-embeddings-inference (etiqueta `text-embeddings-inference` en el repo) y sentence-transformers. Para búsqueda dispersa a escala se recomienda un motor como Seismic.
- Latencia y throughput: latencia sub-milisegundo en MS MARCO con Seismic en un solo hilo, según el autor; no se han publicado cifras de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | BEIR-13 sin MS MARCO (nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPARSEUP | 188M (149M backbone) | Disperso aprendido (SPLADE modificado) | 56,4 | Apache 2.0 | Hugging Face |
| splade-v3 | no disponible | Disperso aprendido (SPLADE) | 51,7 | no disponible | Hugging Face |
| opensearch-neural-sparse-encoding-doc-v3-gte | no disponible | Disperso aprendido | 54,6 | no disponible | Hugging Face / OpenSearch |
| LACONIC-1B | 1B | Disperso aprendido | 58,7 | no disponible | Hugging Face |
| LateOn | 149M | Late interaction | 58,9 | no disponible | Hugging Face |
| DenseOn | 149M | Denso de vector único | 57,9 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado exclusivamente en inglés; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Sesgos: al entrenarse sobre la mezcla de datos de LightOn, puede heredar sesgos de dominio y de distribución de ese corpus; no se documentan evaluaciones de sesgo en la información disponible.
- Alucinación de términos: la expansión aprendida puede introducir términos no presentes en el texto original; en dominios muy especializados esto puede generar recuperaciones espurias, por lo que conviene revisar las atribuciones con `render()`.
- Límites de longitud: 128 tokens para consultas y 512 para documentos en evaluación; textos más largos requieren truncado o fragmentación.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo en el entorno de despliegue.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes de LightOn si se redistribuye el modelo.
- Comparación no estrictamente equivalente: las cifras de BEIR de SPARSEUP se obtuvieron con búsqueda aproximada (Seismic), mientras que las de LateOn y DenseOn son de búsqueda exacta, lo que puede infravalorar ligeramente al modelo.
- Para producción a gran escala, el rendimiento depende en buena medida del motor de búsqueda dispersa elegido; los resultados de latencia citados corresponden a infraestructura dedicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v1
- Blog del autor: https://www.linkup.so/blog/introducing-sparseup-by-linkup
- Sitio de Linkup: https://www.linkup.so/
- Modelo base: https://huggingface.co/lightonai/LateOn-unsupervised
