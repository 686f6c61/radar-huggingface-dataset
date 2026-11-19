# bpiwowar/zotseek-os-doc-v3-distill

## Resumen

`bpiwowar/zotseek-os-doc-v3-distill` es una exportación a ONNX del modelo de recuperación dispersa aprendida (sparse retrieval) `opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill`, empaquetada específicamente para su uso dentro de ZotSeek, una herramienta de búsqueda semántica sobre bibliotecas Zotero. No se trata de un modelo generativo, sino de un codificador de documentos que produce vectores dispersos tipo SPLADE sobre un vocabulario de 30.522 dimensiones, pensados para indexación y búsqueda léxica expandida en motores como OpenSearch.

El modelo resuelve el problema de la recuperación de información en corpus académicos personales: convierte cada documento en un vector disperso donde cada dimensión es un token del vocabulario y su peso refleja la relevancia aprendida, permitiendo búsquedas que combinan coincidencia léxica con expansión semántica. La exportación fija la cabeza de documento en el grafo, aplica cuantización int8 solo a pesos (activaciones en fp32) y embebe el cálculo IDF del lado de la consulta en un fichero externo de pesos por token.

Es relevante ahora porque reduce el coste de despliegue de un modelo de recuperación neuronal a un grafo ONNX autocontenido de aproximadamente 0,1 GB, ejecutable con onnxruntime o onnxruntime-web 1.31 o superior, lo que permite inferencia en navegador o en portátiles sin GPU dedicada. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: opensearch-neural-sparse-encoding-doc-v3-distill) con cabeza de expansión dispersa SPLADE; exportado a ONNX con cabeza de documento fusionada |
| Parametros totales | no disponible (repo de 0,1 GB con pesos int8 y embeddings fp16) |
| Longitud de contexto | no disponible (la model card menciona ventanas y longitudes de pooling configurables en `zotseek-sparse.json`, sin cifra explícita) |
| Tipos de cuantizacion | Matrices int8 weight-only (MatMulNBits con activaciones fp32); embeddings fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (entradas `input_ids`, `attention_mask`, `pooling_mask`, `k`; salida `sparse` float32 `[B, 30522]`); fichero auxiliar `query_weights.json` para IDF de consulta |
| Dimension del vocabulario de salida | 30.522 |
| Revision del modelo base | `babf71f3c48695e2e53a978208e8aba48335e3c0` |
| Runtime minimo | onnxruntime / onnxruntime-web 1.31 o superior |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder del proyecto OpenSearch especializado en codificación neural dispersa (neural sparse encoding), con una cabeza SPLADE que proyecta las representaciones contextuales sobre el vocabulario y aplica una transformación `log1p(log1p(relu(x)))` para producir pesos no negativos y dispersos. En esta exportación, la cabeza de documento se ha fusionado dentro del grafo: se toma el máximo sobre las posiciones agrupadas (pooling), se anulan los tokens especiales y se ofrece un tope opcional `top-k` por posición mediante la entrada `k`. El resultado es un vector disperso de 30.522 dimensiones por documento.

El lado de consulta no incluye modelo: cada token distinto de la consulta se pondera con su IDF, leído de `query_weights.json` (derivado del `idf.json` original e indexado por id de token). Los pesos se han cuantizado a int8 solo en las matrices (MatMulNBits, activaciones fp32) y los embeddings a fp16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; esos detalles corresponden a la model card de `opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill`, no reproducida aquí.

## Capacidades

- Codificación de documentos en vectores dispersos SPLADE de 30.522 dimensiones, aptos para índices invertidos y motores de búsqueda léxica expandida.
- Recuperación de información con expansión semántica de términos: el vector resultante activa términos relacionados no presentes literalmente en el documento.
- Ponderación IDF de consultas mediante fichero externo de pesos por token, sin necesidad de ejecutar un segundo modelo.
- Control de dispersión mediante tope `top-k` por posición (entrada `k` del grafo), regulable en tiempo de inferencia.
- Procesamiento por lotes (`[B, L]`) con máscaras de atención y de pooling separadas.
- Inferencia en CPU y en navegador mediante onnxruntime y onnxruntime-web.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un codificador de recuperación.

## Casos de uso

- Búsqueda semántica en bibliotecas Zotero: ZotSeek indexa cada referencia como vector disperso y responde a consultas ponderadas por IDF, permitiendo encontrar artículos por conceptos afines aunque no compartan la formulación exacta.
- Índice de recuperación en OpenSearch: los vectores de 30.522 dimensiones encajan directamente en índices `sparse_vector` de OpenSearch, habilitando búsquedas híbridas BM25 + neural sparse sobre corpus documentales.
- Búsqueda en navegador sin servidor: al ejecutarse con onnxruntime-web 1.31 o superior, permite construir un buscador local sobre documentos del usuario sin enviar datos a la nube.
- Recuperación aumentada (RAG) sobre documentación técnica: el modelo actúa como primer recuperador de bajo coste antes de un re-ranker o de un LLM generativo, reduciendo el número de pasajes que llegan al modelo grande.
- Indexación masiva en CPU: la cuantización int8 weight-only y el tamaño de 0,1 GB permiten codificar grandes lotes de documentos en servidores sin GPU.
- Filtrado previo en pipelines de revisión sistemática: recuperación de candidatos por relevancia semántica sobre miles de abstracts antes de la criba manual.
- Búsqueda multilingüe de literatura: no hay idiomas declarados en la información disponible, por lo que su uso en idiomas distintos del inglés debe validarse empíricamente con el conjunto de fixtures antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia `fixtures/reference.json`, que contiene textos sintéticos con los vectores de la implementación original, de la exportación fp32 y de esta exportación, útil para verificar la equivalencia numérica de la cuantización, pero no constituye una evaluación de calidad de recuperación (nDCG, MRR, recall).

## Requisitos de hardware

- VRAM estimada: no disponible con cifra exacta; el repo ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más, y en CPU.
- GPU recomendadas: no se requiere GPU; cualquier RTX 3060 o superior acelera el procesamiento por lotes, pero el diseño está orientado a CPU y a navegador.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de memoria; también en CPU y en WebGPU/WebAssembly vía onnxruntime-web.
- Opciones de despliegue: onnxruntime (Python, C++, Rust), onnxruntime-web 1.31 o superior en navegador; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un codificador de recuperación.
- Latencia y throughput: no disponibles. El rendimiento dependerá de la longitud de ventana, el tamaño de lote y el hardware; la cuantización int8 weight-only con activaciones fp32 reduce el ancho de banda de memoria pero no acelera cómputo en CPU de forma garantizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| bpiwowar/zotseek-os-doc-v3-distill | SPLADE ONNX, documento | no disponible | no disponible | Apache 2.0 | ONNX int8/fp16 | Exportación específica para ZotSeek, cabeza fusionada y top-k configurable |
| opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill | SPLADE, documento | no disponible | no disponible | Apache 2.0 | safetensors (modelo original) | Modelo base; requiere framework de inferencia completo |
| opensearch-project/opensearch-neural-sparse-encoding-v2-distill | SPLADE, documento | no disponible | no disponible | Apache 2.0 | safetensors | Variante anterior de la familia; no se dispone de comparación de rendimiento |
| Modelos densos tipo bge-small / e5-small | Embedding denso | ~33 M – 118 M | 512 tokens típicamente | MIT / Apache 2.0 | safetensors, ONNX | Alternativa densa; requiere índice vectorial en lugar de invertido, sin expansión léxica explícita |

No se dispone de datos de benchmarks que permitan comparar la calidad de recuperación frente a estas alternativas.

## Limitaciones y advertencias

- Es un codificador de recuperación, no un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- No hay idiomas declarados; el comportamiento fuera del inglés no está documentado y debe validarse con `fixtures/reference.json` y un conjunto de evaluación propio.
- La cuantización int8 weight-only introduce una desviación numérica respecto al modelo original; la model card proporciona fixtures de referencia, pero no garantiza equivalencia exacta en todos los dominios.
- La dispersión del vector de salida depende del tope `top-k` configurado; valores altos degradan el rendimiento del índice invertido y valores bajos pueden perder recall.
- El cálculo IDF de consulta reside en `query_weights.json` y debe mantenerse sincronizado con el vocabulario del modelo; un desajuste de ids de token produce ponderaciones incorrectas.
- Requiere onnxruntime 1.31 o superior; versiones anteriores no soportan MatMulNBits con el esquema exportado.
- Licencia Apache 2.0 permite uso comercial, pero el crédito del modelo corresponde a los autores originales de OpenSearch; la exportación no incluye garantías adicionales.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos por expansión semántica excesiva en consultas ambiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bpiwowar/zotseek-os-doc-v3-distill
- Modelo base: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v3-distill
- Repositorio ZotSeek: https://github.com/introfini/ZotSeek
- Proyecto OpenSearch (neural sparse): https://opensearch.org/
