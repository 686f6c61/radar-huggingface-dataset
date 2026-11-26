# christianengel/mcp-toolrank-33m

## Resumen

MCP ToolRank 33M es un encoder de frases en ingles de 33,36 millones de parametros, afinado a partir de BAAI/bge-small-en-v1.5 por christianengel. Su proposito concreto es la recuperacion de herramientas MCP (Model Context Protocol): dado un catalogo de herramientas descritas como `name: description`, el modelo genera embeddings de 384 dimensiones que permiten seleccionar la herramienta adecuada para una consulta del usuario mediante similitud coseno. Resuelve el problema del enrutamiento de herramientas en agentes LLM, donde el catalogo puede ser amplio y el prompt no puede incluir todas las definiciones.

El modelo mantiene la arquitectura BERT pequeña del base (12 capas, 384 dimensiones ocultas, limite de 512 tokens) y se distribuye con pesos safetensors, ONNX (incluida una variante INT8 de 34,1 MB) y GGUF para ejecucion en CPU. Su relevancia actual radica en que ofrece una alternativa ligera y determinista al enrutamiento por LLM, con latencias de milisegundos y un consumo de memoria que permite ejecutarlo en el mismo host que el gateway del agente.

La ficha tecnica del autor reporta mejoras marginales frente a BGE Small en recuperacion hibrida sobre catalogos compactos (ETOM compact: 92,69 frente a 91,99 de nDCG@10), mientras que en otros catalogos los intervalos de confianza cruzan cero. Es, por tanto, un modelo especializado y de nicho, con licencia Apache-2.0 y solo ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP32, INT8 (ONNX `embedding-int8.onnx`); pesos GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso de la familia BERT small, heredado de BAAI/bge-small-en-v1.5: 12 capas, dimension oculta de 384 y pooling para producir un vector de 384 dimensiones por texto. No emplea atencion lineal, MoE ni decodificacion especulativa; es un modelo de embeddings puro para similitud semantica, con metodos `encode_query` y `encode_document` expuestos via sentence-transformers.

El afinamiento se realizo sobre 5.098 peticiones del dataset Agent-Ark/Toucan-1.5M y 263 descripciones emparejadas con fuentes MIT fijadas (pinned). El autor advierte que las familias y esquemas de herramientas cubiertos son limitados. La evaluacion se hace en regimen hibrido (combinacion con TF-IDF/BM25) sobre catalogos compartidos, con nDCG@10 como metrica principal. No se documenta en la informacion disponible el uso de RLHF, DPO ni un recuento total de tokens de entrenamiento.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (384 dimensiones, normalizables).
- Recuperacion de herramientas MCP a partir de descripciones en formato `name: description`.
- Busqueda hibrida combinable con BM25/TF-IDF en el gateway CLI del proyecto.
- Ejecucion en CPU mediante ONNX INT8 (34,1 MB) y GGUF.
- Integracion con sentence-transformers y text-embeddings-inference.
- Solo ingles; sin soporte de tool calling generativo, agentes ni razonamiento multi-paso (no es un modelo generativo).
- Sin capacidades de vision, audio ni modo thinking.

## Casos de uso

- Enrutamiento de herramientas en agentes LLM: dado un catalogo de herramientas MCP, el gateway calcula embeddings de las descripciones y selecciona las candidatas mas cercanas a la consulta, evitando inyectar todo el catalogo en el prompt del LLM.
- Despliegue en el mismo host que el orquestador: con ONNX INT8 (34,1 MB) y latencia mediana de 3,53 ms por consulta corta en CPU, el enrutamiento no compite por VRAM con el modelo generativo.
- Filtrado previo en pipelines RAG de APIs: reduce el conjunto de endpoints candidatos antes de una llamada a un LLM de mayor coste.
- Herramientas CLI y entornos sin GPU: la variante GGUF permite ejecutar la recuperacion en portatiles o servidores sin acelerador.
- Sistemas de descubrimiento de herramientas: busqueda semantica sobre registros de servidores MCP para que un desarrollador localice la herramienta adecuada por descripcion.
- Evaluacion y benchmarking de catalogos de herramientas: el proyecto incluye scripts de comparacion hibrida y calibracion reutilizables para medir nDCG@10 sobre catalogos propios.
- Clasificacion ligera de intenciones hacia un conjunto fijo de acciones: el encoder puede puntuar consultas contra descripciones de acciones predefinidas.

## Benchmarks y rendimiento

Resultados de recuperacion hibrida (nDCG@10 en %) reportados por el autor, comparando BGE Small hibrido frente a ToolRank hibrido sobre catalogos compartidos:

| Catalogo | BGE Small hibrido | ToolRank hibrido |
|---|---:|---:|
| ETOM compact | 91,99 | 92,69 |
| ETOM native MCP JSON | 92,20 | 92,18 |
| ToolRet | 37,10 | 37,19 |
| Independent API | 90,70 | 92,09 |

Datos adicionales del autor: en ETOM compact la mejora es de +0,70 puntos (intervalo pareado al 95 %: +0,41 a +1,00); en MCP JSON y ToolRet los intervalos cruzan cero. En modo denso puro, ToolRet alcanza 28,54 frente a 28,81 de BGE. nDCG@10 denso: 89,83 (ETOM compact) y 90,43 (holdout de API). Latencia mediana de consulta corta: 3,53 ms con cuatro hilos en Ryzen 9 5950X. Solo se evaluan consultas respondibles; el autor senala que la rejeccion de consultas no respondibles (NWS) no alcanzo los objetivos.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo es de 33,36 M de parametros (unos 133 MB en FP32 y 34,1 MB en ONNX INT8).
- GPU: opcional; cualquier GPU con al menos 1 GB de memoria puede alojarlo, aunque el diseno apunta a CPU.
- Consumer GPU: cabe en cualquier GPU de consumo e incluso en CPU de un solo nodo.
- Despliegue: sentence-transformers, ONNX Runtime, llama.cpp/GGUF, text-embeddings-inference; el proyecto incluye un gateway CLI con busqueda BM25 sin modelo y modo hibrido opcional.
- Latencia: mediana de 3,53 ms por consulta corta en CPU (cuatro hilos, Ryzen 9 5950X); no se publica throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---:|---:|---:|---|---|
| MCP ToolRank 33M | 33,36 M | 512 | 384 | Apache-2.0 | Recuperacion de herramientas MCP (en) |
| BAAI/bge-small-en-v1.5 | 33 M | 512 | 384 | MIT | Embeddings generales (en) |
| BAAI/bge-base-en-v1.5 | 109 M | 512 | 768 | MIT | Embeddings generales (en) |
| E5-small-v2 | 33 M | 512 | 384 | MIT | Embeddings generales (en) |

Frente a BGE Small, del que deriva, la ventaja medida es pequena y limitada a catalogos compactos; en recuperacion densa pura no supera a su base en ToolRet (28,54 frente a 28,81). Los modelos de embeddings generales son mas versatiles, mientras que ToolRank esta especializado en el formato `name: description` de herramientas MCP.

## Limitaciones y advertencias

- Solo ingles: las consultas y descripciones en castellano no estan soportadas de forma fiable.
- Especializacion estrecha: entrenado sobre 5.098 peticiones y 263 descripciones; el autor reconoce familias y esquemas de herramientas limitados.
- Mejoras marginales: en MCP JSON y ToolRet los intervalos de confianza cruzan cero; la ventaja sobre BGE Small no es concluyente en todos los catalogos.
- No es un modelo generativo: no hace tool calling, razonamiento ni agentes por si mismo; solo produce embeddings.
- Limite de 512 tokens: descripciones de herramientas largas deben truncarse y pueden perder informacion.
- Rechazo de consultas no respondibles: el autor reporta que la rejeccion NWS no alcanzo los objetivos, por lo que puede devolver herramientas irrelevantes con puntuaciones altas.
- Riesgo de dependencia del formato: funciona mejor con el esquema `name: description` usado en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base BGE Small es MIT; conviene revisar los avisos de terceros del repositorio.
- Adopcion muy baja (250 descargas, 1 like) y sin validacion independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/mcp-toolrank-33m
- Demo en navegador: https://huggingface.co/spaces/christianengel/mcp-toolrank-demo
- Gateway CLI (busqueda desde shell): https://github.com/protortyp/mcp-toolrank/blob/cpu-v0.5.0/docs/GATEWAY.md#search-from-the-shell
- Metodos y resultados de comparacion: https://github.com/protortyp/mcp-toolrank/blob/cpu-v0.2.0/docs/BASELINE_COMPARISON.md
- Calibracion del gateway: https://github.com/protortyp/mcp-toolrank/blob/cpu-v0.2.0/docs/GATEWAY_CALIBRATION.md
- Replay ONNX INT8: https://github.com/protortyp/mcp-toolrank/blob/cpu-v0.2.0/docs/ONNX_INT8.md
- GGUF y CLI en CPU: https://github.com/protortyp/mcp-toolrank/blob/cpu-v0.2.0/docs/GGUF.md
- Dataset de entrenamiento: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
