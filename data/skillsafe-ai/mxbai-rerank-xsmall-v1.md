# skillsafe-ai/mxbai-rerank-xsmall-v1

## Resumen

skillsafe-ai/mxbai-rerank-xsmall-v1 es un artefacto de ranking de texto (text-ranking) listo para navegador, publicado por SkillSafe a partir del modelo upstream mixedbread-ai/mxbai-rerank-xsmall-v1 de Mixedbread AI. No se trata de un modelo entrenado desde cero, sino de una importación reproducible del export ONNX del repositorio original, pensada para ejecutarse con transformers.js y onnxruntime-web en el navegador, con WebGPU o WASM como proveedores de ejecución.

El modelo es un cross-encoder de tipo DeBERTa-v2 que recibe un par (consulta, documento) y devuelve una única puntuación de relevancia en forma de logits con forma [batch_size, 1]. Se usa como segunda etapa de un pipeline de recuperación: primero un retriever vectorial o léxico devuelve candidatos y después este reranker los reordena por relevancia real, lo que mejora la precisión de sistemas de búsqueda semántica y RAG.

Su relevancia actual radica en el formato de distribución: ONNX con opset 12, ejes dinámicos de batch y longitud de secuencia, y un tamaño de repositorio de 0,3 GB que permite ejecutar el reranking íntegramente en el cliente, sin enviar consultas ni documentos a un servidor. La licencia Apache-2.0 del modelo base facilita su integración en productos comerciales, siempre que se mantenga la atribución correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DeBERTa-v2 (tag de HuggingFace: `deberta-v2`), tarea `text-ranking` / `text-classification` |
| Parametros totales | No disponible de forma explicita. El fichero `onnx/model.onnx` pesa 271,02 MB; si la precision es fp32, equivaldria a unos 68 millones de parametros (estimacion derivada del tamano, no confirmada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El contrato ONNX declara ejes dinamicos `['batch_size', 'sequence_length']`, por lo que la longitud es variable en tiempo de inferencia |
| Tipos de cuantizacion | No se incluyen variantes cuantizadas. El unico artefacto de pesos es `onnx/model.onnx` (precision no declarada; el tamano es consistente con fp32) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (pesos upstream de Mixedbread AI); la receta de conversion y la model card pertenecen al repositorio de SkillSafe |
| Formato de pesos | ONNX (opset 12) en `onnx/model.onnx`; acompanado de `config.json`, `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json` |
| Tamano del repositorio | 0,3 GB |
| Contrato de entrada/salida | Entradas `input_ids` int64 `[batch_size, sequence_length]` y `attention_mask` int64 `[batch_size, sequence_length]`; salida `logits` float32 `[batch_size, 1]` |
| Libreria declarada | transformers.js |
| Modelo base | mixedbread-ai/mxbai-rerank-xsmall-v1 (commit `b5c6e9da73abc3711f593f705371cdbe9e0fe422`) |
| Fecha de creacion del repo | 2026-09-22 |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original: no se indican el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Lo unico documentado por parte de SkillSafe es el proceso de empaquetado, no el de entrenamiento. El tag `deberta-v2` de HuggingFace indica que la arquitectura subyacente es un transformer encoder de la familia DeBERTa-v2 configurado como cross-encoder con una cabeza de clasificacion que produce una puntuacion escalar de relevancia por par (consulta, documento).

Lo relevante tecnicamente en este repositorio es la cadena de conversion y verificacion. La importacion se realizo "as published upstream", es decir, sin reconversion: el fichero ONNX proviene del propio export del repositorio de Mixedbread AI y queda fijado por hash SHA-256. La receta (`recipes/mxbai-rerank-xsmall-v1.yaml`, sha256 `d16abd5f9d5afdd3c37d1ed31c2fd63ea6eb5665fa02d791e5cb41f134b8e0f7`) se ejecuto con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. Cada fichero ONNX paso `onnx.checker` y una prueba de humo en CPU con onnxruntime usando entradas rellenas de ceros en las formas declaradas: `input_ids[1, 8]` y `attention_mask[1, 8]` produjeron `logits[1, 1]` en 5,1 ms. No se documenta ninguna innovacion de decodificacion (no hay decodificacion especulativa ni atencion lineal): es un encoder puro de una sola pasada.

## Capacidades

- Puntuacion de relevancia consulta-documento: genera un unico logit por par de entrada, apto como score de reordenacion.
- Reranking en pipelines de recuperacion: reordena listas de candidatos devueltos por un retriever previo (BM25, embeddings, busqueda hibrida).
- Ejecucion en navegador: el artefacto esta preparado para transformers.js y onnxruntime-web con proveedores `webgpu` y `wasm`.
- Procesamiento por lotes: el eje `batch_size` es dinamico, por lo que admite evaluar varios pares en una misma sesion de inferencia.
- Longitud de secuencia variable: el eje `sequence_length` es dinamico en el grafo exportado.
- Trazabilidad y verificacion: cada fichero incluye su SHA-256 y el manifiesto registra receta, toolchain y numeros de verificacion.
- Tool calling / function calling: no disponible; no es una capacidad de un cross-encoder de ranking.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Reranking en RAG sobre navegador: en una aplicacion de preguntas y respuestas que recupera fragmentos de documentacion con un indice vectorial, este modelo reordena los 20-50 candidatos iniciales en el propio cliente, evitando enviar el texto del usuario a un servidor y reduciendo coste de infraestructura.
- Busqueda semantica en documentacion tecnica: tras una primera etapa de recuperacion densa o lexica, el cross-encoder puntua cada par consulta-fragmento y permite mostrar arriba los pasajes realmente relevantes, algo que un bi-encoder no distingue bien en consultas cortas y ambiguas.
- Ordenacion de resultados en un buscador interno: en un portal de conocimiento corporativo desplegado como SPA, el modelo se carga una sola vez (271 MB) y se reutiliza para cada consulta, con latencia de milisegundos por par en CPU.
- Filtrado de contexto antes de pasar a un LLM: se puntuan los fragmentos recuperados y se descartan los que quedan por debajo de un umbral, reduciendo tokens de entrada y el riesgo de que el generador se apoye en pasajes irrelevantes.
- Deduplicacion y agrupacion de respuestas: al puntuar pares (consulta de referencia, candidato) se puede ordenar un conjunto de respuestas candidatas por afinidad con la intencion original, util en foros, mesas de ayuda o sistemas de FAQ.
- Ayuda a la revision de literatura o corpus cientifico: dado un titulo o resumen como consulta, el modelo puntua y ordena resumenes recuperados previamente para priorizar la lectura.
- Prototipado y evaluacion offline de pipelines de recuperacion: al ser un ONNX pequeno y verificable por hash, sirve para medir la ganancia de anadir una etapa de reranking con coste de hardware practicamente nulo (CPU de portatil o un unico navegador).
- Extensiones de navegador y herramientas de escritorio: el formato transformers.js permite integrarlo en una extension que reordene resultados de busqueda o elementos de una lista local sin backend propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento documentada es la prueba de humo del propio repositorio:

| Prueba | Entradas | Salidas | Tiempo |
|---|---|---|---|
| `onnx/model.onnx` con onnxruntime en CPU | `input_ids[1, 8]`, `attention_mask[1, 8]` | `logits[1, 1]` | 5,1 ms |

Esta cifra corresponde a una ejecucion con entradas rellenas de ceros y longitud de secuencia 8 sobre Darwin 25.6.0 arm64, por lo que no es representativa de cargas reales con secuencias largas y lotes mayores.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 271 MB si el fichero es fp32 (tamano de `onnx/model.onnx`), mas el consumo de activaciones y del runtime; el uso total deberia mantenerse por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte de WebGPU para el proveedor `webgpu`; no se requiere una A100 ni una H100 para este tamano de modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna (por ejemplo, series RTX 30/40) e incluso en GPUs integradas, y puede ejecutarse enteramente en CPU mediante WASM.
- Opciones de despliegue: onnxruntime-web (`webgpu` o `wasm`) en navegador, onnxruntime en servidor o escritorio, y transformers.js como capa de integracion declarada. No se documentan despliegues con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un cross-encoder ONNX de este tipo.
- Latencia: 5,1 ms por par con longitud de secuencia 8 en CPU arm64, segun la prueba de humo del repositorio. No hay datos de throughput ni de latencia con secuencias largas o lotes grandes.
- Almacenamiento: 0,3 GB de repositorio, con un unico fichero de pesos de 271,02 MB.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones ni resultados de modelos alternativos. El unico termino de comparacion verificable es el propio modelo upstream, del que este repositorio es una importacion byte a byte:

| Modelo | Parametros | Contexto | Licencia | Formato | Verificacion |
|---|---|---|---|---|---|
| skillsafe-ai/mxbai-rerank-xsmall-v1 | No disponible (pesos de 271,02 MB) | No disponible (ejes dinamicos) | Apache-2.0 | ONNX opset 12 + tokenizer | SHA-256 por fichero, receta y manifiesto publicados |
| mixedbread-ai/mxbai-rerank-xsmall-v1 (upstream) | No disponible | No disponible | Apache-2.0 | Pesos originales + export ONNX | No disponible |
| Otras alternativas de reranking de la misma categoria (por ejemplo, variantes de mayor tamano de la familia mxbai-rerank u otros cross-encoders) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, BEIR, MTEB ni de ninguna otra evaluacion de recuperacion en la informacion disponible, por lo que no se puede afirmar su calidad relativa frente a otros rerankers.
- Modelo derivado, no original: todos los pesos proceden del export ONNX del repositorio de Mixedbread AI; cualquier limitacion del modelo upstream se hereda sin cambios.
- Alcance funcional acotado: es un cross-encoder de ranking, no genera texto, no razona de forma multi-paso, no soporta tool calling y no procesa imagenes ni audio.
- Idiomas: no se documenta que idiomas cubre. Si se va a usar en castellano, conviene validar la calidad de reordenacion con un conjunto propio antes de llevarlo a produccion.
- Longitud de secuencia: aunque el grafo declara ejes dinamicos, no se especifica el limite maximo soportado ni el comportamiento esperado con secuencias muy largas. Hay que fijar y probar ese limite en la integracion.
- Precision de los pesos: no se declara explicitamente si el ONNX es fp32; el tamano del fichero es coherente con fp32, pero conviene verificarlo antes de dimensionar recursos.
- Coste de arranque en navegador: la descarga inicial de 271 MB mas el tokenizer (8,25 MB) puede ser significativa en conexiones lentas o dispositivos moviles; no se documentan variantes cuantizadas que reduzcan ese peso.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de puntuaciones mal calibradas fuera del dominio de entrenamiento, lo que puede degradar el orden de resultados sin aviso.
- Sesgos: no se documenta ningun analisis de sesgo del modelo upstream, ni demografico ni de dominio.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar avisos de licencia y atribucion a Mixedbread AI segun el README del repositorio upstream; la receta de conversion y la model card de SkillSafe quedan bajo la licencia de su propio repositorio.
- Soporte y mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de mantenimiento posterior a la conversion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/mxbai-rerank-xsmall-v1
- Modelo upstream: https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1
- Commit upstream fijado: https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1/tree/b5c6e9da73abc3711f593f705371cdbe9e0fe422
- Licencia del modelo upstream: https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1/blob/b5c6e9da73abc3711f593f705371cdbe9e0fe422/README.md
- Receta y convertidor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Fichero de pesos: https://huggingface.co/skillsafe-ai/mxbai-rerank-xsmall-v1/resolve/main/onnx/model.onnx
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con este modelo (corresponden a una plataforma de estudio ajena al proyecto), por lo que no aportan enlaces utilizables.
