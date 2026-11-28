# opensearch-project/opensearch-neural-sparse-encoding-asym-v1

## Resumen

`opensearch-neural-sparse-encoding-asym-v1` es un modelo de recuperación de información con representaciones dispersas aprendidas (learned sparse / SPLADE) desarrollado por el proyecto OpenSearch. Su particularidad es que adopta una arquitectura asimétrica de dos torres: una torre de consulta pequeña y rápida (bert-medium, 41,4 M de parámetros) que se ejecuta en línea en el momento de la búsqueda, y una torre de documento grande (GTE, 137 M de parámetros) que se ejecuta fuera de línea durante la indexación. Ambas proyectan el texto sobre un vector disperso de 30.522 dimensiones correspondiente al vocabulario WordPiece de BERT, y la relevancia se calcula como producto escalar disperso servido mediante un índice invertido.

El modelo resuelve el compromiso clásico entre calidad de recuperación y coste de inferencia en buscadores neuronales: los modelos sparse simétricos obtienen buena relevancia pero requieren ejecutar un codificador en cada consulta, mientras que los modelos «inference-free» solo tokenizan la consulta a costa de perder calidad. `asym-v1` se sitúa en un punto intermedio («inference-light»), con una codificación de consulta de 26,9 ms p50 en un solo hilo de CPU (Intel Xeon 8275CL) y un coste de recuperación de 4,42 FLOPS medios, el más bajo entre los modelos que ejecutan codificador de consulta según la model card.

Es relevante ahora porque logra el mejor resultado BEIR-13 entre los modelos sparse de OpenSearch (0,555 NDCG@10 medio) y el puesto número 2 entre modelos sparse de menos de 256 M de parámetros en el benchmark BEIR de MTEB (53,48 NDCG@10 medio sobre 15 tareas), con licencia Apache 2.0 y compatibilidad con el motor OpenSearch. Está pensado para despliegues de búsqueda en producción donde la latencia de consulta y el coste de CPU importan tanto como la relevancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT asimétrico de dos torres (sparse encoder tipo SPLADE); torre de consulta bert-medium (8 capas, 512 hidden) y torre de documento GTE |
| Parametros totales | 137.394.234 (torre de documento, según safetensors); torre de consulta 41,4 M adicionales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo incluye ONNX y safetensors) |
| Idiomas soportados | Inglés (campo `language: en` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de recuperación dispersa aprendida (SPLADE): cada torre es un transformer tipo BERT que produce, mediante una cabeza de modelado de lenguaje enmascarado y un pooling disperso, un vector de pesos sobre el vocabulario WordPiece de BERT (30.522 entradas). La expansión de términos (document expansion) permite que la consulta y el documento se representen con términos que no aparecen literalmente, mejorando el recall frente a bag-of-words puro. La torre de consulta parte de `prajjwal1/bert-medium` (41,4 M, 512 hidden, 8 capas) y la torre de documento se inicializa en caliente desde `opensearch-neural-sparse-encoding-doc-v3-gte`.

La asimetría es la innovación principal: al separar el codificador de consulta (pequeño, en línea, CPU) del codificador de documento (grande, fuera de línea, indexación), se reduce el coste de búsqueda sin renunciar a la semántica completa de la consulta. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de representaciones dispersas (sparse embeddings) para consultas y documentos sobre el vocabulario WordPiece de BERT.
- Recuperación de pasajes y documentos (passage retrieval) mediante producto escalar disperso e índice invertido.
- Expansión de términos: la consulta se enriquece con términos relacionados (por ejemplo, «weather» expande a «nyc», «ny», «sunny», «today»), lo que mejora el recall.
- Codificación de consulta en línea eficiente en CPU: 26,9 ms p50 en un solo hilo de Intel Xeon 8275CL.
- Codificación de documentos fuera de línea con la torre GTE de mayor capacidad.
- Integración nativa con OpenSearch y con la librería `sentence-transformers >= 5.0` (módulos `Router`, `MLMTransformer`, `SpladePooling`).
- Soporte de `transformers >= 5.22.1` para cargar ambas torres por separado (torre de consulta en `query_0_MLMTransformer/` y torre de documento en la raíz del repo).
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Búsqueda semántica en producción sobre OpenSearch: el modelo se despliega como codificador de consulta en el nodo de búsqueda y como codificador de documento en el pipeline de indexación, aprovechando el índice invertido nativo del motor para servir resultados con latencia de decenas de milisegundos.
- Motores de búsqueda con restricciones de CPU: al codificar consultas en menos de 30 ms por hilo sin GPU, es adecuado para clústeres donde no hay aceleradores disponibles o el coste de GPU es prohibitivo.
- Recuperación de pasajes para sistemas RAG: la representación dispersa permite recuperar pasajes candidatos de forma eficiente antes de pasarlos a un modelo generativo, con un coste de recuperación de 4,42 FLOPS medios.
- Búsqueda en catálogos y documentación técnica en inglés: la expansión de términos ayuda cuando la consulta del usuario no coincide literalmente con el vocabulario del documento (sinónimos, abreviaturas, reformulaciones).
- Indexación masiva de corpus: la torre de documento se ejecuta fuera de línea una sola vez por documento, de modo que el coste de la torre grande no afecta a la latencia de búsqueda.
- Sustitución de BM25 en buscadores existentes: al producir vectores dispersos compatibles con índices invertidos, se puede integrar en arquitecturas de búsqueda léxica ya desplegadas sin cambiar la infraestructura de almacenamiento.
- Evaluación comparativa de recuperación: sirve como referencia sparse ligera para experimentos de BEIR/MTEB con presupuesto de cómputo limitado.

## Benchmarks y rendimiento

Resultados de la model card (BEIR-13, NDCG@10 medio, y coste de recuperación):

| Modelo | Codificador de consulta | BEIR-13 NDCG@10 | FLOPS de recuperación | Tiempo de codificación de consulta p50 |
|---|---|---|---|---|
| granite-embedding-30m-sparse | 30M | 0,506 | 10,06 | 26,1 ms |
| opensearch-neural-sparse-encoding-v2-distill | 67M | 0,528 | 5,73 | 38,9 ms |
| opensearch-neural-sparse-encoding-doc-v3-gte | solo tokenizador | 0,546 | 0,92 | 2,0 ms |
| linkup-sparseup-embed-v1 | 149M | 0,564 | 7,02 | 78,8 ms |
| opensearch-neural-sparse-encoding-asym-v1 | 41M | 0,555 | 4,42 | 26,9 ms |

Comparativa interna de modelos sparse de OpenSearch (parámetros y NDCG@10 medio):

| Modelo | Inference-free | Parámetros | AVG NDCG@10 | AVG FLOPS |
|---|---|---|---|---|
| opensearch-neural-sparse-encoding-v1 | No | 137M | 0,524 | 11,4 |
| opensearch-neural-sparse-encoding-v2-distill | No | 67M | 0,528 | 8,3 |
| opensearch-neural-sparse-encoding-asym-v1 | No | 41M (consulta) + 137M (documento) | 0,555 | 4,5 |
| opensearch-neural-sparse-encoding-doc-v1 | Sí | 137M | 0,490 | 2,3 |
| opensearch-neural-sparse-encoding-doc-v2-distill | Sí | 67M | 0,504 | 1,8 |
| opensearch-neural-sparse-encoding-doc-v2-mini | Sí | 23M | 0,497 | 1,7 |
| opensearch-neural-sparse-encoding-doc-v3-distill | Sí | 67M | 0,517 | 1,8 |
| opensearch-neural-sparse-encoding-doc-v3-gte | Sí | 137M | 0,546 | 1,7 |

Según la model card, el modelo ocupa el puesto número 2 entre modelos sparse de menos de 256 M de parámetros en el benchmark BEIR de MTEB, con 53,48 NDCG@10 medio sobre 15 tareas. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generación, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 137,4 M de parámetros en la torre de documento, en fp32 ocuparía aproximadamente 0,55 GB de pesos; en fp16, unos 0,27 GB. La torre de consulta (41,4 M) añade unos 0,17 GB en fp32.
- GPU recomendadas: no especificadas en la model card. El modelo está diseñado para que la torre de consulta funcione en CPU; la torre de documento se ejecuta fuera de línea y puede usar cualquier GPU disponible para indexación.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB de pesos en fp32), aunque no hay requisitos oficiales publicados.
- Despliegue: `sentence-transformers >= 5.0` con la clase `SparseEncoder`; `transformers >= 5.22.1` para cargar las torres por separado; integración con OpenSearch; pesos en safetensors y ONNX.
- Latencia: 26,9 ms p50 por consulta en un solo hilo de Intel Xeon 8275CL. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BEIR-13 NDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opensearch-neural-sparse-encoding-asym-v1 | 41M (consulta) + 137M (documento) | No disponible | 0,555 | Apache 2.0 | Hugging Face |
| linkup-sparseup-embed-v1 | 149M | No disponible | 0,564 | No disponible en la información | Hugging Face |
| opensearch-neural-sparse-encoding-doc-v3-gte | 137M | No disponible | 0,546 | Apache 2.0 (según proyecto OpenSearch) | Hugging Face |
| granite-embedding-30m-sparse | 30M | No disponible | 0,506 | No disponible en la información | Hugging Face |

Frente a `linkup-sparseup-embed-v1`, el modelo de OpenSearch obtiene una relevancia ligeramente inferior (0,555 frente a 0,564) pero con menor coste de recuperación (4,42 frente a 7,02 FLOPS) y menor latencia de consulta (26,9 ms frente a 78,8 ms). Frente a los modelos inference-free de OpenSearch, gana en relevancia a cambio de ejecutar un codificador de consulta.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado para inglés; no hay datos sobre rendimiento en castellano u otros idiomas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre corpus web, es esperable que herede sesgos de esos datos.
- Alucinación: al no ser un modelo generativo, no produce texto; el riesgo se limita a recuperar pasajes irrelevantes o espurios por expansión de términos excesiva.
- Longitud de contexto: no disponible; la arquitectura BERT subyacente sugiere límites típicos de 512 tokens, pero no se confirma en la model card.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (`prajjwal1/bert-medium` y `opensearch-neural-sparse-encoding-doc-v3-gte`) y de los datos de entrenamiento.
- Dependencias estrictas: requiere `sentence-transformers >= 5.0` y `transformers >= 5.22.1`, lo que puede complicar despliegues con versiones antiguas.
- Coste de indexación: la torre de documento (137 M) debe ejecutarse sobre todo el corpus, lo que supone un coste de cómputo fuera de línea significativo en corpus grandes.
- Métricas: los resultados publicados se limitan a BEIR-13 y MTEB BEIR; no hay evaluación en dominios específicos (legal, médico, código) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-asym-v1
- Modelo base de la torre de consulta: https://huggingface.co/prajjwal1/bert-medium
- Modelo base de la torre de documento: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v3-gte
- Modelo comparado opensearch-neural-sparse-encoding-v1: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-v1
- Modelo comparado opensearch-neural-sparse-encoding-v2-distill: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-v2-distill
- Modelo comparado opensearch-neural-sparse-encoding-doc-v1: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v1
- Modelo comparado opensearch-neural-sparse-encoding-doc-v2-distill: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v2-distill
- Modelo comparado opensearch-neural-sparse-encoding-doc-v2-mini: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v2-mini
- Modelo comparado opensearch-neural-sparse-encoding-doc-v3-distill: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill
- Modelo comparado linkup-sparseup-embed-v1: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v1
- Modelo comparado granite-embedding-30m-sparse: https://huggingface.co/ibm-granite/granite-embedding-30m-sparse
- Leaderboard MTEB BEIR: https://huggingface.co/spaces/mteb/leaderboard
- Sitio oficial de OpenSearch: https://opensearch.org/
- Documentación de OpenSearch: https://docs.opensearch.org/latest/
- Descargas de OpenSearch: https://opensearch.org/downloads/
- OpenSearch en Wikipedia: https://en.wikipedia.org/wiki/OpenSearch_(software)
- OpenSearch en AWS: https://aws.amazon.com/fr/what-is/opensearch/
