# seamon67/Supertron-2-Reranker-8B-GGUF

## Resumen

Supertron-2-Reranker-8B-GGUF es la conversion a formato GGUF del modelo Surpem/Supertron2-Reranker-8B, un cross-encoder de reranking de 8.000 millones de parametros desarrollado por Surpem y construido sobre Qwen/Qwen3-VL-Reranker-8B. Su funcion es puntuar pares consulta-documento para reordenar candidatos ya recuperados por un retriever de primera etapa, un paso habitual en pipelines de busqueda, motores de recuperacion y arquitecturas RAG. No es un modelo generativo ni de chat: su unica salida util es una puntuacion de relevancia.

La aportacion principal de esta version GGUF, publicada por el usuario seamon67, es de tipo tecnico e ingenieril. Segun su autor, la mayoria de las conversiones comunitarias de este modelo producen puntuaciones sin sentido por cuatro motivos: falta de la cabeza de clasificacion, extraccion incorrecta del token de decision (`yes` = 9693 y `no` = 2152, que deben leerse desde la cabeza de salida y descartarse despues), aplicacion de una formula de puntuacion erronea, y uso de una plantilla de chat distinta. Este repositorio afirma corregir los cuatro, con la formula correcta `sigmoid(yes_logit - no_logit)`.

Es relevante ahora porque el reranking se ha consolidado como la pieza que mas calidad aporta por unidad de coste en pipelines RAG, y porque las cuantizaciones GGUF defectuosas de cross-encoders son un fallo silencioso: el modelo carga, devuelve numeros y degrada el retrieval sin generar errores evidentes. El repositorio ocupa 9,2 GB, declara licencia Apache 2.0, soporte unicamente de ingles y, segun los metadatos de HuggingFace, se creo el 19 de septiembre de 2026 con cero descargas registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder de reranking basado en Qwen3-VL (transformer), 8B parametros |
| Parametros totales | 8.000 millones (8B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de llama.cpp; la model card menciona el uso de cuantizacion de 4 bits. Listado completo de variantes (Q4_K_M, Q5_K_M, Q8_0, etc.) no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El repositorio ocupa 9,2 GB; el formato de los pesos del modelo original no se especifica en la informacion disponible |
| Modelo base | Surpem/Supertron2-Reranker-8B (relacion: quantized) |
| Tarea (pipeline) | text-ranking (reranking; no generativo) |

## Arquitectura y entrenamiento

La arquitectura es la de un cross-encoder de reranking derivada de Qwen3-VL-Reranker-8B, con 8.000 millones de parametros. Un cross-encoder procesa conjuntamente la consulta y el documento candidato, en lugar de codificarlos por separado como hace un bi-encoder, lo que permite capturar interacciones token a token entre ambos y produce puntuaciones de relevancia mas precisas a cambio de un coste de computo mayor por par evaluado. La model card original describe el modelo como "instruction-aware": la relevancia se solicita mediante un prompt, de modo que la intencion expresada en la consulta en lenguaje natural influye en la puntuacion.

Un detalle tecnico central documentado en esta conversion es el mecanismo de decision. El modelo no emite un logit escalar, sino que utiliza los logits de los tokens `yes` (ID 9693) y `no` (ID 2152) de la cabeza de salida; la puntuacion final se obtiene como `sigmoid(yes_logit - no_logit)`. Este GGUF es exclusivamente de reranking: la cabeza de clasificacion se conserva para el calculo del score pero la cabeza de generacion se descarta, por lo que el modelo no puede producir texto. La model card no proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de ajuste; estos datos figuran como no disponibles.

## Capacidades

- Puntuacion de relevancia consulta-documento mediante cross-encoding, con salida numerica por par evaluado.
- Reranking de resultados de busqueda como segunda etapa tras un retriever rapido (BM25, busqueda vectorial, hibrida).
- Reranking de documentos en pipelines RAG, con el objetivo de desplazar el material relevante hacia las primeras posiciones del contexto antes de la generacion.
- Emparejamiento pregunta-pasaje: articulos de ayuda, documentacion tecnica, fragmentos de bases de conocimiento y snippets.
- Recuperacion sensible a instrucciones: la puntuacion se solicita mediante prompt, de modo que se tiene en cuenta la intencion de la consulta.
- Evaluacion de resultados de retrieval: uso del score como metrica para comparar configuraciones de recuperacion.
- Multilingue: no. El modelo declara soporte unicamente de ingles.
- Tool calling / function calling: no aplica; el modelo no es generativo.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada. Aunque la arquitectura base es Qwen3-VL (modelo de vision-lenguaje), la model card no documenta capacidades multimodales para este reranker ni para esta conversion GGUF.

## Casos de uso

- RAG empresarial sobre documentacion interna: el retriever recupera 50-100 fragmentos candidatos y el cross-encoder los reordena antes de inyectarlos en el prompt de un LLM. El modelo es adecuado porque la interaccion token a token entre pregunta y pasaje reduce la recuperacion de fragmentos solo superficialmente similares.
- Busqueda en centros de ayuda y soporte al cliente: ante consultas como "como restablezco mi contrasena", el modelo puntua articulos de ayuda y FAQ y coloca primero el articulo correcto, por delante de documentos tangenciales (por ejemplo, politicas de reembolso).
- Reordenacion en motores de busqueda internos: despliegue como etapa de reranking sobre indices Elasticsearch u OpenSearch, reduciendo los falsos positivos del ranking lexico puro.
- Filtrado de contexto en agentes con memoria documental: cuando un agente recupera memorias o notas historicas, el reranker determina cuales son pertinentes a la subtarea actual y descarta el resto, reduciendo ruido y consumo de contexto.
- Evaluacion y ajuste de pipelines de recuperacion: comparar dos configuraciones de chunking o dos modelos de embeddings usando el score del reranker como juez de relevancia, ya que la model card indica explicitamente este uso.
- Deduplicacion y agrupacion de candidatos por relevancia: ordenar un conjunto heterogeneo de pasajes y establecer un umbral de corte para decidir que material pasa a la siguiente fase del pipeline.
- Enrutado de consultas a bases de conocimiento especializadas: dado un conjunto de descripciones de repositorios o indices, puntuar cada uno frente a la consulta del usuario para decidir cual consultar primero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original y la del repositorio GGUF no incluyen tablas con metricas como MMLU, HumanEval, GSM8K, MTEB, BEIR, nDCG@10 o MRR, y los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM en bfloat16: minimo 18 GB; recomendado 24 GB o mas, segun la model card original.
- VRAM en cuantizacion de 4 bits: minimo 6 GB; recomendado 10 GB o mas, segun la model card original.
- Repositorio GGUF: 9,2 GB de peso total en disco, lo que es coherente con una cuantizacion de 8 bits o un conjunto que agrupa varios niveles de cuantizacion; el desglose por archivo no esta disponible.
- GPU consumer: la model card indica que la version de 4 bits requiere un minimo de 6 GB de VRAM, por lo que cabe en tarjetas consumer de gama media y alta (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090). La version en bfloat16 (18 GB minimo) no cabe en GPUs consumer de menos de 24 GB.
- GPUs de centro de datos: A100, H100, L40S y similares cubren sin problema la inferencia en bfloat16 y permiten lotes mayores.
- Ajuste de lote y longitud: la model card advierte que para lotes grandes o documentos largos se debe aumentar la VRAM o reducir el tamano de lote y la longitud maxima de secuencia.
- Libreria y despliegue: la libreria declarada es llama.cpp, que es la via soportada para este GGUF. La model card indica que funciona con cualquier version moderna de llama.cpp. Para el modelo original, la model card proporciona ejemplos con `sentence_transformers.CrossEncoder` (`CrossEncoder.predict` y `CrossEncoder.rank`). El soporte de este GGUF concreto en vLLM, TGI, Ollama o servidores de embeddings no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse de un cross-encoder de 8B, el coste de inferencia crece linealmente con el numero de pares consulta-documento evaluados, por lo que el dimensionamiento debe hacerse sobre el tamano del conjunto de candidatos que se desee reordenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|---|
| seamon67/Supertron-2-Reranker-8B-GGUF | 8B | no disponible | Ingles | Apache 2.0 | GGUF para llama.cpp | Conversion comunitaria corregida; solo reranking |
| Surpem/Supertron2-Reranker-8B | 8B | no disponible | Ingles | Apache 2.0 | no disponible | Modelo original; usado con sentence-transformers |
| Qwen/Qwen3-VL-Reranker-8B | 8B | no disponible | no disponible | no disponible | no disponible | Arquitectura base sobre la que se construye Supertron2 |
| BAAI/bge-reranker-v2-m3 | 568M | no disponible | Multilingue | Apache 2.0 | safetensors / CrossEncoder | Alternativa mucho mas ligera; no se dispone de comparacion de rendimiento con Supertron2 |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la tabla recoge unicamente caracteristicas estructurales y de licencia. La eleccion entre un reranker de 8B y uno de ~0,5B depende del presupuesto de latencia y del volumen de candidatos a reordenar, no de datos de calidad verificables en esta ficha.

## Limitaciones y advertencias

- El modelo puntua relevancia; no genera respuestas. No debe utilizarse como modelo de chat ni como generador autonomo.
- La model card recomienda evaluar el modelo en el dominio de recuperacion propio antes de llevarlo a produccion, ya que un reranker mal calibrado empobrece el pipeline aunque funcione sin errores.
- Los documentos largos pueden requerir troceado (chunking) previo al reranking; la longitud de contexto soportada no esta documentada.
- Las puntuaciones de relevancia son relativas y pueden no estar calibradas entre consultas no relacionadas, por lo que no es recomendable fijar umbrales absolutos sin validacion.
- El modelo puede ordenar en posiciones altas contenido incorrecto, desactualizado o inseguro si resulta textualmente relevante para la consulta.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al ser un modelo entrenado principalmente para ingles, su comportamiento en otros idiomas no esta caracterizado.
- Limitacion idiomatica: la model card declara soporte unicamente de ingles, lo que limita su uso en pipelines en castellano o multilingues.
- Restricciones de licencia: Apache 2.0 en este repositorio, lo que permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia. Debe verificarse por separado la licencia de Surpem/Supertron2-Reranker-8B y la de Qwen/Qwen3-VL-Reranker-8B, ya que la informacion disponible no detalla las condiciones de toda la cadena de modelos derivados.
- Fiabilidad de la conversion: el propio autor advierte que la mayoria de los GGUFs comunitarios de este modelo producen puntuaciones invalidas. Aunque este repositorio afirma corregir los cuatro problemas identificados, conviene validar el score con un conjunto de pares conocidos antes de integrarlo en produccion.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, y publicacion muy reciente (19 de septiembre de 2026 segun los metadatos), por lo que no existe evidencia de uso en produccion.
- Los resultados de la busqueda web realizada no aportan informacion tecnica util sobre el modelo; los enlaces devueltos corresponden a la Autoridad de Telecomunicaciones de Pakistan y no guardan relacion con esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/seamon67/Supertron-2-Reranker-8B-GGUF
- Modelo original: https://huggingface.co/Surpem/Supertron2-Reranker-8B
- Arquitectura base: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Repositorio de llama.cpp (libreria declarada): https://github.com/ggml-org/llama.cpp
- Documentacion de sentence-transformers (CrossEncoder), referenciada en la model card original: https://sbert.net/
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
