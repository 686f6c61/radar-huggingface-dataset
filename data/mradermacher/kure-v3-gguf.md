# mradermacher/KURE-v3-GGUF

## Resumen

KURE-v3-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo de embeddings KURE-v3, desarrollado originalmente por NLP AI Lab (nlpai-lab) y cuantizado por mradermacher. El modelo base es un modelo de embeddings denso de aproximadamente 1.140 millones de parámetros (1.140.918.272 según los safetensors del repositorio), orientado a tareas de similitud de frases y extracción de características, con soporte de coreano e inglés.

El problema que resuelve esta versión cuantizada es la ejecución eficiente de KURE-v3 en hardware limitado: al ofrecer cuantizaciones desde Q2_K (0,6 GB) hasta f16 (2,4 GB), permite desplegar el modelo de embeddings en CPUs, portátiles y GPUs de consumo sin sacrificar demasiada calidad. Esto resulta relevante para sistemas RAG, búsqueda semántica y pipelines de embeddings locales.

Un detalle técnico destacado es que el modelo base incorpora embeddings matryoshka (Matryoshka Representation Learning), lo que permite truncar el vector de salida a dimensiones menores manteniendo buena calidad de recuperación. El modelo original conserva además sus pesos en safetensors en el repositorio de nlpai-lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso para embeddings (sentence-transformers, pipeline feature-extraction) |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantizacion); el modelo base esta disponible en safetensors |

## Arquitectura y entrenamiento

KURE-v3 es un modelo de embeddings denso (dense) basado en transformer, integrado en el ecosistema sentence-transformers y etiquetado como compatible con feature-extraction. El repositorio cuantizado no detalla la configuracion exacta del backbone (numero de capas, dimension del embedding oculto ni dimension maxima matryoshka), por lo que estos datos no estan disponibles en la informacion proporcionada. Lo que si consta es el uso de Matryoshka Representation Learning, una tecnica de entrenamiento que hace que las primeras dimensiones del vector de embedding sean por si solas representativas, permitiendo reducir la dimensionalidad en tiempo de consulta y de indexacion.

Sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de contrastive learning, RLHF o DPO) la model card no ofrece detalles, por lo que no estan disponibles. La contribucion de mradermacher se limita a la cuantizacion estatica en GGUF mediante conversion desde el formato HF, ofreciendo doce niveles de cuantizacion con distintos compromisos entre tamano y calidad, ademas de una coleccion separada de cuantizaciones imatrix (importancia-matrix) en un repositorio hermano.

## Capacidades

- Generacion de embeddings densos para extraccion de caracteristicas (pipeline feature-extraction).
- Similitud de frases (sentence-similarity): calculo de similitud coseno o producto escalar entre pares de textos.
- Ideal como encoder en sistemas RAG: indexacion de documentos y recuperacion semantica.
- Embeddings matryoshka: posibilidad de truncar el vector a dimensiones inferiores para acelerar busqueda aproximada.
- Soporte bilingue coreano-ingles, util para busqueda semantica cross-lingue entre ambos idiomas.
- Ejecucion local via GGUF en CPU o GPU con librerias compatibles (llama.cpp y derivados).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en corpus coreano-ingles: se pueden indexar documentos en ambos idiomas y recuperar resultados con consultas en cualquiera de ellos, aprovechando el alineamiento cross-lingue del modelo.
- RAG local y privado: como encoder de documentos en un pipeline de generacion aumentada por recuperacion ejecutado integramente en local, con cuantizaciones de 0,6-0,8 GB que caben en cualquier maquina moderna.
- Deteccion de duplicados y clustering: calcular similitudes entre millones de textos (tickets, articulos, mensajes) usando Q4_K_M en CPU para lotes offline.
- Indexacion con dimension reducida: gracias a los embeddings matryoshka, se puede almacenar solo las primeras dimensiones del vector en bases vectoriales (por ejemplo, con cuantizacion binaria o int8) reduciendo coste de memoria sin reentrenar nada.
- Clasificacion y enrutado de texto: generar embeddings y entrenar un clasificador ligero (regresion logistica, kNN) sobre ellos para categorizar consultas de soporte o documentos.
- Recomendacion de contenido: calcular similitud entre perfiles o historicos de usuario y catalogos de items textuales en coreano o ingles.
- Deduplicacion semantica de datasets de entrenamiento: filtrar ejemplos casi duplicados antes de fine-tuning de otros modelos, ejecutando el encoder en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README de la cuantizacion no incluye metricas del modelo base (MTEB, MTEB-ko ni similares) ni evaluaciones comparativas entre niveles de cuantizacion, mas alla de referencias genericas a graficas de perplejidad de tipos de quant.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde 0,6 GB (Q2_K) hasta 2,4 GB (f16). Las cuantizaciones recomendadas Q4_K_S/Q4_K_M ocupan unos 0,8 GB y Q8_0 unos 1,3 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente dado el tamano; una RTX 3060 de 12 GB o incluso GPUs de 4 GB ejecutan el f16 sin problemas. No se requieren A100 ni H100.
- Consumer GPU: cabe sobradamente en practicamente cualquier GPU de consumo (RTX 3060, 4060, 4090) e incluso en iGPU o solo CPU, dado que la cuantizacion mas grande ocupa 2,4 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; para los pesos originales en safetensors, sentence-transformers, transformers o frameworks de serving de embeddings como TEI (text-embeddings-inference) o vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de ~1,1 B parametros fuertemente cuantizable, se espera throughput alto en CPU moderno para lotes de embeddings, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Embeddings matryoshka | Licencia | Formato |
|---|---|---|---|---|---|
| KURE-v3 (esta ficha) | ~1,14 B | ko, en | si | Apache 2.0 | GGUF / safetensors |
| BGE-M3 (BAAI) | ~0,57 B | multilingue (100+ idiomas) | no disponible | MIT | safetensors |
| multilingual-e5-large (intfloat) | ~0,56 B | multilingue | no disponible | MIT | safetensors |
| Qwen3-Embedding-0.6B | ~0,6 B | multilingue | si | Apache 2.0 | safetensors |

KURE-v3 se diferencia de las alternativas multilingues genericas en su especializacion en coreano e ingles y en su mayor tamano (~1,14 B frente a ~0,6 B), lo que suele traducirse en mejor calidad en coreano a costa de mayor consumo de memoria. BGE-M3 y e5-large ofrecen cobertura multilingue mas amplia, mientras que Qwen3-Embedding-0.6B comparte licencia Apache 2.0 y soporte matryoshka con un footprint menor.

## Limitaciones y advertencias

- Alcance restringido a embeddings: no genera texto, no razona y no sustituye a un LLM en tareas generativas.
- Soporte de idiomas limitado a coreano e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- No hay benchmarks publicados en la model card, por lo que la calidad relativa frente a otros embedders debe validarse empiricamente en cada caso de uso.
- Las cuantizaciones agresivas (Q2_K, Q3_K_M) pueden degradar apreciablemente la calidad de los embeddings; para embeddings, se recomienda Q4_K_M o superior, y evaluar Q8_0 o f16 si la calidad es critica.
- La longitud de contexto maxima no esta documentada en esta cuantizacion; debe consultarse la model card del modelo base antes de indexar documentos largos.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- Los metadatos de descargas y likes indican adopcion todavia reducida (674 descargas), lo que implica menor madurez comunitaria y menos herramientas probadas frente a embedders mas populares.

## Enlaces

- Cuantizacion GGUF (esta ficha): https://huggingface.co/mradermacher/KURE-v3-GGUF
- Modelo base KURE-v3: https://huggingface.co/nlpai-lab/KURE-v3
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/KURE-v3-i1-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#KURE-v3-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
