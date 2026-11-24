# mlx-community/hobbylm-embed-140m-fp16

## Resumen

HobbyLM-Embed-140M es un modelo de embeddings de frases (encoder) de tipo mixture-of-experts disperso, desarrollado originalmente por Hariharan M. S. y Prabhurajhan R. bajo el identificador `harims95/hobbylm-embed-140m`. Esta ficha corresponde a la conversion a formato MLX en float16 realizada por Fuel Labs y publicada en la organizacion `mlx-community`, pensada para ejecucion en Apple Silicon. El modelo produce embeddings de 512 dimensiones normalizados en L2, adecuados para busqueda semantica, RAG, clustering y clasificacion de texto.

Con 139.983.200 parametros totales (aproximadamente 140M) y un repositorio de 0,3 GB, el modelo se posiciona en la gama de encoders compactos. Su rasgo diferencial es el uso de una arquitectura MoE dispersa en un encoder de embeddings, algo poco habitual en esta categoria, lo que obliga a cargarlo mediante el script `hobbylm_mlx.py` incluido en el repositorio en lugar de las librerias estandar `mlx-embeddings` o `mlx-lm`.

La relevancia de esta version radica en que permite ejecutar inferencia de embeddings en hardware Apple (probado en un M4) con cuantizacion float16 y una fidelidad numerica practicamente identica a la implementacion original de Sentence Transformers (coseno minimo de 0,99965 en float16). La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con mixture-of-experts disperso (MoE) |
| Parametros totales | 139.983.200 |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens por defecto; ampliable a 2.048 tokens via `max_seq_length` |
| Tipos de cuantizacion | float16 (pesos); router de expertos y sesgo de seleccion en float32; `quant.json` indica `{"bits": null, "dtype": "float16"}` |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), float16, 280 MB |
| Dimension del embedding | 512 (normalizado L2) |
| Pipeline | sentence-similarity / feature-extraction |
| Libreria | mlx |
| Modelo base | harims95/hobbylm-embed-140m |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo mixture-of-experts disperso orientado a la extraccion de caracteristicas y a la similitud entre frases. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles en la informacion proporcionada. La particularidad tecnica documentada es que el router de expertos y su sesgo de seleccion se mantienen en float32 incluso en la version float16, lo que preserva la estabilidad de la seleccion de expertos y explica la alta fidelidad numerica observada.

La conversion a MLX mantiene los pesos originales en float16 y anade un script propio (`hobbylm_mlx.py`) que implementa el modelo y el encoder. El modelo admite prompts diferenciados para consulta y pasaje (`query: ` y `passage: `), siguiendo el esquema habitual de Sentence Transformers para tareas de recuperacion. La longitud de entrada por defecto es de 512 tokens, leida de `sentence_bert_config.json`, que es la configuracion con la que se midio en MTEB(eng, v2).

## Capacidades

- Generacion de embeddings de frases de 512 dimensiones, normalizados en L2, para similitud coseno directa.
- Recuperacion semantica y RAG mediante prompts diferenciados de consulta y pasaje.
- Similitud entre frases, clustering y clasificacion de texto con texto plano (sin prompt).
- Procesamiento de documentos largos de hasta 2.048 tokens configurando `max_seq_length`.
- Extraccion de caracteristicas (feature-extraction) para pipelines de NLP.
- Soporte exclusivo de ingles.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es un encoder, no un modelo generativo.
- Inferencia optimizada para Apple Silicon mediante MLX.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de hasta 512 tokens como pasajes y codificar las consultas del usuario con `prompt_name="query"`, recuperando los documentos mas similares por coseno en un motor vectorial.
- RAG sobre bases de conocimiento internas: generar embeddings de pasajes una sola vez y consultarlos en tiempo de inferencia, con la ventaja de ejecutar todo el pipeline en un Mac sin GPU dedicada.
- Deduplicacion y agrupamiento de contenido: usar texto plano para calcular similitudes y agrupar articulos, tickets o correos casi identicos antes de almacenarlos.
- Clasificacion de tickets de soporte: generar embeddings de cada ticket y entrenar un clasificador ligero (regresion logistica o kNN) sobre ellos para enrutar por categoria.
- Filtrado de resultados de busqueda en aplicaciones locales: al ser un modelo de 140M en float16 (280 MB), cabe en memoria unificada de cualquier Mac reciente y permite reordenar resultados sin coste de API.
- Prototipado de sistemas de recomendacion de contenido: calcular similitud entre descripciones de productos o articulos y las preferencias expresadas por el usuario en texto libre.
- Evaluacion de calidad de traducciones o parafrasis: comparar embeddings de frases originales y candidatas para medir similitud semantica en ingles.

## Benchmarks y rendimiento

La model card unicamente menciona que la evaluacion se realizo sobre MTEB(eng, v2) con una longitud de entrada de 512 tokens, pero no publica los resultados numericos. Los datos de fidelidad disponibles son de validacion de la conversion, no de rendimiento de tareas:

| Prueba | Resultado |
|---|---|
| Fidelidad float32 vs. Sentence Transformers | coseno 1,00000000 (identico) |
| Fidelidad float16 vs. Sentence Transformers | coseno minimo 0,99965 |
| Resultados MTEB(eng, v2) | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y al tratarse de un encoder de embeddings esos benchmarks no serian aplicables.

## Requisitos de hardware

- VRAM/memoria: los pesos en float16 ocupan 280 MB; con el script, el tokenizador y los buffers de inferencia, el consumo practico es inferior a 1 GB de memoria unificada.
- GPU recomendadas: no requiere GPU dedicada; esta disenado y probado para Apple Silicon (Apple M4, macOS 15.5, mlx 0.32.4).
- Cabe en cualquier Mac con Apple Silicon; no esta pensado para CUDA ni para GPUs de escritorio convencionales en este formato.
- Opciones de despliegue: MLX con el script `hobbylm_mlx.py` incluido; no es compatible con `mlx-embeddings` ni `mlx-lm` en la version documentada. Para el modelo original, usar Sentence Transformers sobre `harims95/hobbylm-embed-140m`.
- Dependencias probadas: mlx 0.32.4, tokenizers 0.23.3, numpy 2.5.5, huggingface_hub 2.4.0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HobbyLM-Embed-140M (MLX fp16) | 140M | 512 (hasta 2.048) | 512 | Apache-2.0 | Hugging Face (mlx-community) |
| Modelos de embeddings compactos tipo MiniLM (referencia generica) | ~22M-118M | 256-512 | 384-768 | variable | Hugging Face |
| Encoders MoE de embeddings | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (MTEB) en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. No se identifican en la informacion disponible otros encoders MoE de embeddings directamente comparables.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La longitud de contexto por defecto es de 512 tokens; los documentos mas largos requieren configurar `max_seq_length=2048` y no se documenta el impacto en calidad de esa extension.
- No es compatible con `mlx-embeddings` ni `mlx-lm`; requiere cargar el script propio del repositorio, lo que anade complejidad de integracion y mantenimiento.
- Es un encoder, no un modelo generativo: no puede usarse para generacion de texto, razonamiento, codigo ni agentes.
- Riesgo de alucinacion no aplicable en sentido estricto, pero si de recuperacion irrelevante si los embeddings de consulta y pasaje no usan los prompts correctos (`query:` / `passage:`).
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos en ingles, puede heredar sesgos de ese corpus.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y procedencia del modelo base original.

## Enlaces

- Modelo en Hugging Face (MLX fp16): https://huggingface.co/mlx-community/hobbylm-embed-140m-fp16
- Modelo base original: https://huggingface.co/harims95/hobbylm-embed-140m
- Repositorio MLX original: https://huggingface.co/harims95/hobbylm-embed-140m-mlx
