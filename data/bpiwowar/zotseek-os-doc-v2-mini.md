# bpiwowar/zotseek-os-doc-v2-mini

## Resumen

os-doc-v2-mini (ONNX, for ZotSeek) es una exportación a formato ONNX del modelo `opensearch-project/opensearch-neural-sparse-encoding-doc-v2-mini` de OpenSearch, empaquetada por el usuario bpiwowar para su uso en ZotSeek, una herramienta de recuperación de información con representaciones dispersas aprendidas (learned sparse retrieval). No es un modelo generativo, sino un codificador de documentos que transforma texto en vectores dispersos de tipo SPLADE, pensados para motores de búsqueda léxica aumentada con señales neuronales.

El modelo se apoya en una arquitectura transformer de tipo encoder con una cabeza de expansión de términos (document head) que aplica log1p_relu, agregación max sobre las posiciones agrupadas (pooling) y anulación de tokens especiales. La exportación incorpora una cuantización weight-only int8 en las matrices MatMulNBits con activaciones fp32 y embeddings en fp16, lo que reduce el peso del artefacto a prácticamente 0 GB en el repositorio.

Su relevancia radica en que permite ejecutar búsqueda dispersa neuronal en entornos con recursos limitados y en el navegador mediante onnxruntime-web, sin depender de un servidor de inferencia completo. El repositorio no incluye pipeline declarado, no especifica idiomas soportados y no publica resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de opensearch-neural-sparse-encoding-doc-v2-mini) con document head fusionada en el grafo: log1p_relu, max sobre posiciones agrupadas y anulacion de tokens especiales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona ventanas y padding configurables en `zotseek-sparse.json`, sin cifra concreta) |
| Tipos de cuantizacion | Weight-only int8 (MatMulNBits, activaciones fp32) y embeddings fp16; requiere onnxruntime(-web) 1.31 o superior |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo con entradas `input_ids`, `attention_mask`, `pooling_mask` y `k`; salida `sparse` float32 `[B, 30522]`) |

## Arquitectura y entrenamiento

El modelo es un export ONNX del checkpoint `opensearch-project/opensearch-neural-sparse-encoding-doc-v2-mini` en la revisión `4af867a426867dfdd744097531046f4289a32fdd`. La arquitectura subyacente es un encoder transformer con una cabeza de recuperación dispersa de estilo SPLADE, que proyecta cada documento a un vector disperso sobre un vocabulario de 30 522 dimensiones (tamaño del vocabulario del tokenizador BERT). La exportación fusiona la document head en el grafo: aplica log1p_relu sobre las puntuaciones, agrega mediante max sobre las posiciones seleccionadas por `pooling_mask`, anula los tokens especiales y admite un tope top-k opcional por posición mediante la entrada `k`.

El lado de consulta no utiliza modelo: cada token distinto de la consulta se pondera con su IDF, cargado desde `query_weights.json` (derivado del `idf.json` original) e indexado por identificador de token. La cuantización es weight-only int8 para las matrices MatMulNBits, con activaciones en fp32 y embeddings en fp16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos detalles corresponden al modelo original de OpenSearch y no se recogen en la información proporcionada.

## Capacidades

- Codificación de documentos en vectores dispersos de 30 522 dimensiones para recuperación léxica neuronal (SPLADE).
- Expansión de términos: la cabeza log1p_relu permite que el vector active términos no presentes literalmente en el documento.
- Control del grado de dispersión mediante el tope top-k por posición (entrada `k` del grafo).
- Ejecución en navegador y en entornos ligeros gracias a onnxruntime-web y a la cuantización int8.
- Ponderación de consultas por IDF sin necesidad de un modelo en el lado de la consulta.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso: es exclusivamente un codificador de recuperación.
- Capacidades multilingües: no disponibles según la información proporcionada.

## Casos de uso

- Búsqueda documental en aplicaciones de escritorio o web: ZotSeek integra este export para indexar y recuperar documentos con coincidencia léxica expandida, aprovechando la ejecución ONNX sin servidor dedicado.
- Búsqueda en el navegador: al requerir solo onnxruntime-web 1.31 o superior, permite construir índices dispersos y consultarlos en el cliente, reduciendo la infraestructura backend.
- Gestión de referencias bibliográficas: un gestor tipo Zotero puede usar los vectores dispersos para localizar artículos por términos relacionados aunque no aparezcan literalmente en el título o el resumen.
- Recuperación en corpus con recursos limitados: la cuantización weight-only int8 y los embeddings fp16 reducen el coste de memoria, lo que facilita desplegar el codificador en máquinas sin GPU dedicada.
- Primer nivel de un pipeline RAG: los vectores dispersos sirven como etapa de recuperación léxica previa a un reranker o a un modelo generativo, con la ventaja de que la consulta solo necesita pesos IDF.
- Indexación por lotes de documentación técnica: la salida `sparse` con forma `[B, 30522]` permite procesar lotes y almacenar los vectores en un motor de búsqueda compatible con campos dispersos.
- Control de la dispersión en producción: el parámetro `k` permite ajustar el número de términos activos por documento para equilibrar calidad de recuperación y tamaño del índice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona comprobaciones de equivalencia numérica: `fixtures/reference.json` contiene textos sintéticos con los vectores de la implementación original, del export fp32 y de este export, lo que permite verificar la fidelidad de la exportación, pero no ofrece métricas de recuperación como nDCG, MRR o recall.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; el repositorio ocupa 0.0 GB y el modelo usa pesos int8 con embeddings fp16, lo que sugiere un artefacto de tamaño reducido.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecución en CPU mediante onnxruntime y en navegador mediante onnxruntime-web.
- GPU de consumo: no se especifica compatibilidad con RTX 4090, A100 u H100; la cuantización int8 y el formato ONNX permiten inferencia en CPU sin GPU dedicada.
- Opciones de despliegue: onnxruntime y onnxruntime-web 1.31 o superior; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un codificador disperso de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| bpiwowar/zotseek-os-doc-v2-mini | Export ONNX de recuperación dispersa SPLADE | no disponible | no disponible | Apache 2.0 | ONNX (int8 weight-only, fp16 embeddings) | Hugging Face, 0 descargas |
| opensearch-project/opensearch-neural-sparse-encoding-doc-v2-mini | Modelo original de recuperación dispersa SPLADE | no disponible | no disponible | Apache 2.0 | safetensors (formato original de OpenSearch) | Hugging Face, mantenido por OpenSearch |
| Export fp32 del mismo modelo | Export ONNX sin cuantización | no disponible | no disponible | Apache 2.0 | ONNX fp32 | Referenciado en `fixtures/reference.json` |

La comparación se limita al linaje directo del modelo, ya que la información proporcionada no incluye alternativas de otros autores con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un codificador de recuperación, no un modelo generativo: no produce texto ni responde preguntas por sí mismo.
- No se han publicado métricas de calidad de recuperación; la única validación documentada es la equivalencia numérica frente al modelo original en textos sintéticos.
- Los sesgos del modelo original de OpenSearch se heredan sin cambios; no se detallan sesgos conocidos en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero la expansión de términos puede introducir términos espurios en el vector si el tope `k` es demasiado alto.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento adecuado fuera de los idiomas del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a los autores originales de OpenSearch, tal como indica la model card.
- Requiere onnxruntime(-web) 1.31 o superior para la cuantización weight-only int8; versiones anteriores pueden no cargar el grafo correctamente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-19), por lo que no hay evidencia de uso en producción.
- La construcción correcta de las entradas (prefijos de instrucción, posiciones agrupadas, longitudes de ventana y padding) depende de `zotseek-sparse.json`; un uso incorrecto de ese fichero degrada la calidad de los vectores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bpiwowar/zotseek-os-doc-v2-mini
- Modelo base: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-doc-v2-mini
- Repositorio ZotSeek: https://github.com/introfini/ZotSeek
