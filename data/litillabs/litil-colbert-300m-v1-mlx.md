# litillabs/litil-colbert-300m-v1-mlx

## Resumen

Litil ColBERT 300M v1 (MLX) es una adaptación a MLX del modelo de recuperación de información `litillabs/litil-colbert-300m-v1`, desarrollada por el propio autor (litillabs) para ejecutarse en Apple Silicon sin depender de PyTorch. Se trata de un encoder de interacción tardía (late interaction) con 311.758.080 parámetros (unos 312 M) que genera vectores de 128 dimensiones por token y puntúa la relevancia mediante MaxSim, el esquema clásico de la familia ColBERT. El modelo trabaja sobre tres idiomas (alemán, chino e inglés) y está orientado al dominio legal.

El problema que resuelve es la recuperación y el re-ranking de documentos largos en un contexto jurídico multilingüe: admite consultas de hasta 1.024 tokens y documentos de hasta 8.192 tokens, con pesos idénticos a los del modelo original (mismo tokenizer, mismos vectores y mismo scoring). Su relevancia actual es doble: por un lado, permite desplegar un recuperador ColBERT en portátiles y equipos de sobremesa con chip de Apple; por otro, sirve como pieza de recuperación dentro de pipelines RAG sobre corpus legales.

La publicación es un port de pesos, no un reentrenamiento: el repositorio contiene pesos float32 en el nivel superior y una copia float16 en el subdirectorio `float16/`. La licencia es Apache-2.0, heredada del modelo base. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con interaccion tardia (late interaction) estilo ColBERT; puntuacion MaxSim sobre vectores de token de 128 dimensiones |
| Parametros totales | 311.758.080 (~312 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Consultas: hasta 1.024 tokens. Documentos: hasta 8.192 tokens |
| Tipos de cuantizacion | float32 (nivel superior) y float16 (`float16/`); no se publican variantes GGUF ni cuantizaciones INT8/INT4 |
| Idiomas soportados | Aleman (de), chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `library_name: mlx`; peso float32 en la raiz y float16 en `float16/` |
| Modelo base | litillabs/litil-colbert-300m-v1 |
| Tamano del repositorio | 1,9 GB |
| Pipeline declarado | sentence-similarity |
| Dependencias | mlx, numpy, tokenizers, huggingface_hub |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer con esquema de interacción tardía: en lugar de colapsar cada texto en un unico vector, `encode` devuelve una matriz de forma `(tokens, 128)` con vectores de token normalizados, uno por token de entrada. La relevancia query-documento se calcula con `LitilColBERT.maxsim(query, document)`, que suma, para cada vector de la consulta, la similitud coseno maxima contra los vectores del documento. Este diseño permite representar documentos de forma precomputada (indexado offline) y reordenarlos en linea con una consulta corta.

No se dispone de informacion sobre la composicion del dataset de entrenamiento del modelo base, el numero de tokens utilizados, si hubo fases de RLHF/DPO ni que encoder preentrenado sirve de inicializacion, mas alla del hecho de que los datos de evaluacion citados son documentos legales. La unica innovacion tecnica documentada en esta ficha es la del propio port a MLX: la implementacion desactiva TF32 (`MLX_ENABLE_TF32=0`) al importar el modulo, porque en GPUs de Apple recientes TF32 desplaza varios puntos porcentuales algunos vectores de token en entradas largas y rompe la reproducibilidad exacta del float32. Es necesario importar el modulo antes de cualquier otra operacion de GPU en MLX dentro del mismo proceso para que ese ajuste surta efecto.

## Capacidades

- Recuperacion de documentos mediante interaccion tardia con puntuacion MaxSim sobre vectores de 128 dimensiones.
- Generacion de embeddings de token (no de frase) para consultas y documentos, aptos para indexado y re-ranking en dos etapas.
- Procesamiento de documentos largos: hasta 8.192 tokens por documento, lo que cubre contratos, sentencias y expedientes extensos.
- Multilingue en aleman, chino e ingles, con el mismo tokenizer y los mismos pesos en los tres idiomas.
- Ejecucion nativa en Apple Silicon mediante MLX, sin PyTorch y sin dependencias de CUDA.
- Precision seleccionable: float32 para reproducir la evaluacion publicada y float16 para indexado mas rapido.
- No soporta generacion de texto, tool calling, function calling, agentes, vision ni audio: es exclusivamente un modelo de representacion y puntuacion de similitud.
- No se documenta un modo de razonamiento (thinking) ni capacidades multimodales.

## Casos de uso

- Busqueda de clausulas contractuales en despachos: indexar un repositorio de contratos de hasta 8.192 tokens por documento y recuperar las clausulas relevantes ante consultas como plazos de preaviso en arrendamientos, con puntuacion MaxSim sobre vectores de token.
- Recuperacion multilingue para asuntos transfronterizos: una consulta redactada en aleman puede enfrentarse a documentos en ingles o chino dentro del mismo indice, sin traducir el corpus previamente.
- Etapa de re-ranking en un pipeline RAG legal: usar el modelo como segundo recuperador sobre los 50-100 candidatos devueltos por un buscador BM25 o denso, aprovechando la granularidad por token para discriminar pasajes muy similares entre si.
- Revision documental (eDiscovery) en procedimientos judiciales: indexar lotes de correos y anexos y localizar los fragmentos citados por palabras clave semanticas, con la ventaja de que el indexado es offline y la consulta en linea cuesta decenas de milisegundos.
- Asistencia a la redaccion de dictamenes: dado un borrador de escrito, recuperar las resoluciones o articulos previos mas cercanos semanticamente para citarlos con fundamento.
- Despliegue en portatil para trabajo de campo: abogados o asesores que necesitan busqueda semantica sobre un corpus confidencial sin enviar documentos a la nube pueden ejecutarlo en un Mac con chip M-series, en float16 para indexacion masiva.
- Construccion de bases de precedentes internas: mantener un indice de resoluciones propias de la organizacion y reutilizarlo como capa de recuperacion para cualquier LLM generativo que redacte la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K) en la informacion disponible; al ser un modelo de recuperacion, esas metricas no aplican. Los unicos datos publicados son de fidelidad numerica frente a la implementacion PyTorch en float32 y de latencia en Apple M5 Max, medidos sobre 104 documentos legales en seis conjuntos de consultas en aleman, chino e ingles, con documentos de hasta 8.192 tokens.

| Pesos | Menor coseno entre vectores de token | Rankings identicos | Top-10 identico |
|---|---:|---:|---:|
| float32 | 1.000000 | 6 de 6 | 6 de 6 |
| float16 | 0.9725 | 5 de 6 | 6 de 6 |

| Entrada | float32 (ms) | float16 (ms) |
|---|---:|---:|
| Consulta de 10 tokens | 9 | 6 |
| Consulta de 1.024 tokens | 55 | 22 |
| Documento de 300 tokens | 21 | 12 |
| Documento de 2.000 tokens | 156 | 46 |
| Documento de 8.192 tokens | 1.635 | 481 |

No se han publicado datos de throughput agregado, ni mediciones sobre hardware distinto de Apple Silicon.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,25 GB en float32 (311,76 M parametros x 4 bytes) y unos 0,62 GB en float16 (x 2 bytes). Cifras calculadas a partir del recuento de parametros, no publicadas por el autor; hay que sumar memoria de activaciones, que crece con la longitud de entrada y es el factor dominante al procesar documentos de 8.192 tokens.
- GPU compatibles: exclusivamente Apple Silicon (el port usa MLX). En el hardware de referencia, un Apple M5 Max, se miden las latencias de la tabla anterior. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en cualquier Mac con chip M-series y memoria unificada suficiente, dado el tamano reducido de los pesos. En float16 el modelo y sus activaciones son manejables en configuraciones de 16 GB de memoria unificada o superiores, aunque el pico real durante el indexado de documentos largos no esta publicado.
- Opciones de despliegue: MLX cargando el modulo `litil_colbert_mlx.py` incluido en el repositorio. No hay soporte de vLLM, TGI, llama.cpp ni Ollama para estos pesos; Text Embeddings Inference soporta modelos ColBERT, pero no en formato MLX.
- Latencia: la documentada en la tabla de benchmarks (por ejemplo, 481 ms para un documento de 8.192 tokens en float16, 46 ms para uno de 2.000 tokens). No hay datos de throughput en documentos por segundo ni de latencia en consultas concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| litillabs/litil-colbert-300m-v1-mlx | 311.758.080 | 1.024 tokens consulta / 8.192 documento | de, zh, en | safetensors (MLX) | Apache-2.0 | 0 descargas, 0 likes |
| litillabs/litil-colbert-300m-v1 (original) | 311.758.080 (mismos pesos) | 1.024 / 8.192 | de, zh, en | safetensors (PyTorch) | Apache-2.0 | no disponible |
| Otros recuperadores de interaccion tardia (familia ColBERT, ColBERTv2, jina-colbert-v2, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa relevante es contra el modelo original en PyTorch: comparten pesos, tokenizer, dimensionalidad (128) y funcion de scoring, de modo que la eleccion entre ambos depende exclusivamente del hardware y del stack (MLX en Apple Silicon frente a PyTorch/CUDA). No se dispone de datos verificables de rendimiento de recuperacion (nDCG, MRR, Recall) frente a alternativas de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa con otros modelos de recuperacion.

## Limitaciones y advertencias

- No se han publicado metricas de calidad de recuperacion (nDCG, MRR, Recall@k) sobre ningun conjunto de evaluacion publico; solo hay datos de fidelidad numerica frente a la implementacion PyTorch y de latencia.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de su comportamiento en produccion.
- La cobertura linguistica se limita a aleman, chino e ingles. No hay evidencia de soporte para castellano ni para otras lenguas, pese a que la evaluacion se haya hecho con documentos legales multilingues.
- El dominio de especializacion es el legal; el comportamiento fuera de ese dominio (documentacion tecnica, conversacion, codigo) no esta documentado.
- Como recuperador, el modelo no genera texto y por tanto no alucina en sentido estricto, pero un falso positivo en la recuperacion se propaga como alucinacion al LLM que consuma los pasajes recuperados; conviene anadir umbrales de puntuacion y verificacion posterior.
- Los sesgos del modelo base (derivados de un corpus legal no documentado publicamente) se heredan integramente; no se describe ningun proceso de mitigacion.
- El ajuste TF32 es fragil: si el modulo no se importa antes de cualquier otra operacion MLX en el proceso, los vectores de entradas largas pueden desviarse varios puntos porcentuales y dejar de reproducir la evaluacion publicada.
- float16 degrada ligeramente la fidelidad: el menor coseno entre vectores de token baja a 0,9725 y uno de los seis rankings deja de ser identico al de referencia, aunque el top-10 se mantiene en todos los casos.
- Requiere Apple Silicon; no hay ruta de despliegue en CUDA con estos pesos, lo que excluye su uso en la mayoria de infraestructuras de servidores.
- Licencia Apache-2.0, que permite uso comercial, pero con la salvedad de que no se documenta la procedencia ni la licencia del corpus de entrenamiento del modelo base, un riesgo relevante en el ambito legal.

## Enlaces

- Repositorio MLX: https://huggingface.co/litillabs/litil-colbert-300m-v1-mlx
- Modelo base (PyTorch): https://huggingface.co/litillabs/litil-colbert-300m-v1
- Perfil del autor: https://huggingface.co/litillabs
