# mlboydaisuke/bge-m3-ExecuTorch

## Resumen

bge-m3-ExecuTorch es una conversión a formato ExecuTorch (.pte) del modelo de embeddings BAAI/bge-m3, publicada por el usuario mlboydaisuke en HuggingFace. El modelo original, desarrollado por BAAI (Beijing Academy of Artificial Intelligence), es un modelo de extracción de características basado en XLM-RoBERTa large de 568 millones de parámetros, capaz de generar embeddings densos, dispersos (sparse) y multi-vector (ColBERT) en una sola pasada de inferencia, con soporte para más de 100 idiomas.

La particularidad de esta conversión es que permite ejecutar el modelo en dispositivos móviles y edge (on-device) mediante ExecuTorch y el backend XNNPACK, sin depender de servidores remotos. Es relevante porque la mayoría de los modelos de embeddings solo devuelven un vector denso, mientras que esta versión expone las tres señales de recuperación (dense, sparse y ColBERT) simultáneamente, lo que permite implementar búsqueda híbrida directamente en un teléfono o dispositivo embebido. El repositorio incluye builds en fp32, fp16 y Core ML, con scripts de verificación contra la implementación de referencia de FlagEmbedding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa large (transformer encoder) con cabezas dense, sparse y ColBERT |
| Parametros totales | 568M (modelo base BAAI/bge-m3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en esta conversión (el modelo original acepta 8192) |
| Tipos de cuantizacion | fp32 (XNNPACK), fp16 (XNNPACK), Core ML; int8 probado pero no publicado |
| Idiomas soportados | Más de 100 (heredado del modelo base; lista exacta no disponible en la ficha) |
| Licencia | MIT |
| Formato de pesos | .pte (ExecuTorch); repo de 4,5 GB |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer XLM-RoBERTa large con 24 capas y 568 millones de parámetros. Esta conversión añade tres cabezas de salida sobre el backbone: la cabeza densa toma la fila CLS del hidden state final y la normaliza L2 (vector de 1024 dimensiones); la cabeza sparse aplica una capa `Linear(1024, 1)` que produce un peso escalar por token (con forma BM25, tipo lexical matching); la cabeza ColBERT proyecta cada token a un vector de 1024 dimensiones normalizado L2, excluyendo la fila CLS (511 vectores por secuencia de 512 tokens).

Un detalle técnico importante: la cabeza sparse está enmascarada dentro del grafo (los tokens especiales y de padding se ponen a cero), a diferencia de la implementación upstream, que devuelve el ReLU crudo y depende de que el llamador descarte los tokens especiales. Según el autor, sin este enmascarado el modelo fp32 asigna pesos de hasta 0,196 a posiciones de padding, lo que puede corromper silenciosamente el índice disperso.

Sobre el entrenamiento del modelo base, la ficha no proporciona detalles (número de tokens, composición del dataset, RLHF/DPO): no disponible. El proceso de conversión usa `torch.export` -> `to_edge_transform_and_lower(partitioner)` -> `.pte`, con scripts publicados en el repositorio executorch-models de GitHub.

## Capacidades

- Extracción de embeddings densos de 1024 dimensiones para búsqueda vectorial por similitud coseno.
- Generación de pesos léxicos por token (sparse), compatibles con puntuación estilo BM25 sobre espacio de vocabulario de 250.002 tokens.
- Generación de vectores multi-token (ColBERT) para recuperación por late interaction: para cada token de consulta se toma su mejor coincidencia entre los tokens del documento y se suma.
- Las tres señales se obtienen en una sola pasada de inferencia y están pensadas para combinarse en búsqueda híbrida.
- Soporte multilingüe heredado de XLM-RoBERTa (más de 100 idiomas).
- Ejecución on-device mediante ExecuTorch con backends XNNPACK y Core ML, sin necesidad de GPU ni servidor.
- Sin prefijos de instrucción: a diferencia de E5 o Qwen3-Embedding, el texto se pasa tal cual tanto en consultas como en documentos.

## Casos de uso

- Búsqueda semántica híbrida en dispositivos móviles: se pueden combinar las puntuaciones dense, sparse y ColBERT para un retrieval de alta calidad sin conexión a red, ideal para apps que buscan sobre documentos locales.
- RAG on-device: como componente de recuperación en un pipeline de generación aumentada que corre íntegramente en el dispositivo, embebiendo chunks de documentos (hasta 512 tokens) y consultas del usuario.
- Indexación léxica eficiente: la cabeza sparse permite construir índices invertidos estilo BM25 con pesos aprendidos, más precisos que BM25 clásico, con solo unas líneas de código de dispersión en el cliente.
- Re-ranking con late interaction: la salida ColBERT permite reordenar candidatos recuperados con mayor precisión que la similitud de vector único, sin salir del dispositivo.
- Búsqueda multilingüe en apps: gracias a la base XLM-RoBERTa, se puede buscar en varios idiomas sobre un mismo índice, útil en aplicaciones con usuarios internacionales.
- Deduplicación y agrupamiento de texto local: los embeddings densos permiten agrupar notas, mensajes o documentos similares en el dispositivo sin enviar datos a la nube, relevante para privacidad.
- Prototipado de retrieval en edge devices: los scripts de verificación y conversión facilitan validar la fidelidad numérica antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) para esta conversión. El autor sí publica datos de verificación de fidelidad y latencia en Mac arm64 (mediana de 10 ejecuciones, secuencia de 512 tokens):

| Build | Fichero | Tamaño (MB) | Latencia Mac (ms) | Correlación dense | Correlación colbert | Desviación sparse |
|---|---|---|---|---|---|---|
| XNNPACK fp32 | bge_m3_xnnpack_fp32.pte | 2271,5 | 233,3 | 1,000000 | 1,000000 | 0,0000 |
| Core ML | bge_m3_coreml_all.pte | 1137,2 | 64,8 | 0,999990 | 0,999976 | 0,0008 |
| XNNPACK fp16 | bge_m3_xnnpack_fp16.pte | 1136,3 | 484,3 | 0,999999 | 0,999998 | 0,0004 |

Como referencia, torch eager fp32 en la misma máquina tarda 182,8 ms, de modo que el build Core ML es 2,8 veces más rápido que eager, con delegación del 100 % en un único subgrafo. El build XNNPACK fp32 delega el 63,7 % en 100 subgrafos; el build fp16 de XNNPACK es más lento que fp32 porque XNNPACK carece de kernels fp16 para este grafo e inserta conversiones de tipo.

La fidelidad contra la implementación de referencia `BGEM3FlagModel` de FlagEmbedding (seis frases) es:

| Cabeza | Diferencia absoluta máxima |
|---|---|
| dense | 2,645e-07 |
| sparse | 3,427e-07 |
| colbert | 4,061e-07 |

## Requisitos de hardware

- VRAM/memoria: al ser un modelo on-device para CPU, el requisito es RAM, no VRAM. El build fp32 ocupa 2271,5 MB y los builds fp16/Core ML unos 1136-1137 MB; se recomienda al menos 3-4 GB de RAM disponible para el build fp32.
- GPU: no necesaria; el modelo está diseñado para ejecutarse en CPU vía XNNPACK o en el Neural Engine de Apple vía Core ML.
- Consumer devices: el build Core ML (64,8 ms por secuencia de 512 tokens en Mac arm64) es viable en iPhones y Macs con Apple Silicon; los builds XNNPACK son más lentos (233-484 ms) pero funcionan en cualquier CPU arm64 moderna.
- Despliegue: ExecuTorch es el runtime previsto (no vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a formato .pte). Para uso en servidor con el modelo original, puede usarse FlagEmbedding o sentence-transformers con BAAI/bge-m3.
- Latencia: 64,8 ms (Core ML), 233,3 ms (XNNPACK fp32) y 484,3 ms (XNNPACK fp16) por secuencia de 512 tokens en Mac arm64; no hay cifras para dispositivos móviles concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Señales de retrieval | Formato | Licencia |
|---|---|---|---|---|---|
| bge-m3-ExecuTorch (esta ficha) | 568M | 512 (conversión) / 8192 (original) | Dense + sparse + ColBERT en una pasada | .pte (ExecuTorch) | MIT |
| BAAI/bge-m3 (original) | 568M | 8192 | Dense + sparse + ColBERT | safetensors (PyTorch) | MIT |
| E5 / Qwen3-Embedding | no disponible | no disponible | Solo vector denso | no disponible | no disponible |

Frente al modelo original, esta conversión sacrifica la ventana de 8192 tokens (limitada a 512 para evitar salidas ColBERT de 32 MB por llamada) a cambio de poder ejecutarse on-device. Frente a alternativas como E5 o Qwen3-Embedding, bge-m3 destaca por ofrecer las tres señales de recuperación simultáneamente y por no requerir prefijos de instrucción, aunque es notablemente más grande que la mayoría de modelos de embeddings ligeros.

## Limitaciones y advertencias

- Ventana de contexto reducida a 512 tokens en esta conversión; textos más largos requieren chunking por parte del llamador.
- La salida ColBERT tiene forma [1, 511, 1024]: la fila i corresponde al token i+1 de la entrada (la fila CLS se descarta), un detalle fácil de equivocarse por una posición al integrarlo.
- La cabeza sparse requiere que el llamador realice la dispersión al espacio de vocabulario fuera del grafo; aunque esta versión ya enmascara tokens especiales y de padding dentro del grafo, hay que implementar el scatter correctamente (tomando el máximo sobre tokens repetidos).
- El build XNNPACK fp16 es más lento que el fp32 debido a la falta de kernels fp16 en XNNPACK para este grafo; conviene elegir Core ML en dispositivos Apple.
- La cuantización int8 no se publica: aunque convierte correctamente (peor cabeza 0,985), resulta en 1363,3 MB, mayor que fp16, porque la tabla de embeddings (250k vocabulario x 1024 dimensiones) supone el 45 % del modelo y permanece en fp32.
- Las latencias publicadas son de referencia en Mac arm64, no cifras de dispositivos móviles reales.
- Al ser un modelo de embeddings, hereda los sesgos y riesgos habituales (representaciones sesgadas por idioma o dominio) del modelo base BAAI/bge-m3; no hay análisis de sesgos específico en la ficha.
- El repositorio tiene muy pocas descargas (8) y cero likes, por lo que tiene escasa validación comunitaria; se recomienda ejecutar los scripts de verificación incluidos antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/bge-m3-ExecuTorch
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Scripts de conversión: https://github.com/john-rocky/executorch-models
