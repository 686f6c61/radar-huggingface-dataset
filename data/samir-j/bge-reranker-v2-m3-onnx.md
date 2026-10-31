# Samir-j/bge-reranker-v2-m3-onnx

## Resumen

Samir-j/bge-reranker-v2-m3-onnx es una exportacion a formato ONNX del reranker BAAI/bge-reranker-v2-m3, desarrollada por el usuario Samir-j como parte del proyecto Sutradhar. El modelo original de BAAI (Beijing Academy of Artificial Intelligence) es un rerankador cross-encoder de ultima generacion que reordena documentos candidatos en funcion de su relevancia respecto a una consulta, tarea critica en pipelines de busqueda y RAG (Retrieval-Augmented Generation).

La relevancia de esta exportacion radica en la portabilidad: ONNX permite ejecutar el modelo sin dependencias de PyTorch, con integracion nativa en ONNX Runtime, lo que reduce el tamano del despliegue y facilita su uso en produccion, incluidos entornos con CPU. El repositorio incluye pesos en fp32 (por defecto) y una version cuantizada a int8 dinamico como alternativa mas ligera y rapida, junto con un manifiesto que permite verificar la integridad de los ficheros al arrancar.

El modelo base es un rerankador multilingue construido sobre la arquitectura XLM-RoBERTa, con 568 millones de parametros y soporte para contextos de hasta 8192 tokens, lo que lo hace adecuado para reranquear pasajes largos en decenas de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder reranker basado en XLM-RoBERTa (modelo base: BAAI/bge-reranker-v2-m3) |
| Parametros totales | 568 M (modelo base; no disponible confirmacion en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (modelo base; no confirmado en la ficha de la exportacion) |
| Tipos de cuantizacion | fp32 (por defecto), int8 dinamico (model_int8.onnx) |
| Idiomas soportados | no disponible (el modelo base es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx_data en fp32; model_int8.onnx en int8) |

## Arquitectura y entrenamiento

El modelo base, bge-reranker-v2-m3, es un rerankador cross-encoder que procesa pares (consulta, documento) de forma conjunta y produce un score de relevancia. A diferencia de los bi-encoders, que codifican consultas y documentos por separado, el cross-encoder aplica full attention sobre la concatenacion de ambos, lo que le permite capturar interacciones finas entre terminos y lograr mayor precision en el reranqueo, a costa de mayor coste computacional por candidato. La arquitectura subyacente es XLM-RoBERTa, un transformer encoder preentrenado sobre 2,5 TB de texto en 100 idiomas, lo que dota al modelo de capacidades multilingues.

La exportacion a ONNX se realizo desde la revision 953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e del modelo original mediante el script engine/scripts/export_reranker.py del proyecto Sutradhar. El repositorio incluye un manifest.json con la revision de origen, versiones de herramientas, numeros de paridad frente a PyTorch y los hashes sha256 y tamano de cada fichero, lo que permite validar la integridad del despliegue al arrancar. No se dispone de detalles sobre el proceso de fine-tuning del modelo base en la informacion proporcionada.

## Capacidades

- Reranqueo de documentos: asigna un score de relevancia a pares (consulta, documento) para reordenar resultados de un sistema de recuperacion de primer nivel (BM25, embeddings, etc.).
- Comprension multilingue: heredada de XLM-RoBERTa, permite reranquear consultas y documentos en multiples idiomas y en escenarios cross-lingue.
- Manejo de pasajes largos: el modelo base soporta contextos de hasta 8192 tokens, adecuado para reranquear documentos extensos o bloques de texto largos.
- Ejecucion sin PyTorch: la exportacion ONNX permite desplegar el modelo con ONNX Runtime en CPU o GPU.
- Verificacion de integridad: manifest.json con sha256 y tamano de cada fichero para validacion automatica en produccion.

## Casos de uso

- Reranqueo en sistemas RAG: tras una recuperacion vectorial inicial de los top-k documentos, el modelo reordena los candidatos para pasar al LLM solo los mas relevantes, mejorando la calidad de las respuestas generadas.
- Busqueda semantica empresarial: integracion en motores de busqueda internos para reordenar resultados multilingues, aprovechando el soporte de idiomas de XLM-RoBERTa.
- Despliegue ligero en CPU: la version int8 permite ejecutar el reranker en servidores sin GPU, util para infraestructuras de busqueda de bajo coste.
- Deduplicacion y filtrado de resultados: uso del score de relevancia como umbral para descartar documentos poco pertinentes antes de etapas posteriores del pipeline.
- Verificacion de integridad en despliegues regulados: el manifest.json con hashes permite auditar que el modelo servido coincide exactamente con la version validada.
- Clasificacion de pares consulta-respuesta: evaluacion de pertinencia en sistemas de preguntas y respuestas o en la validacion automatica de respuestas de chatbots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona un chequeo de paridad frente a PyTorch en la exportacion, pero no incluye las metricas concretas ni numeros de comparacion, solo que la version int8 no igualo la paridad del ranking con PyTorch.

## Requisitos de hardware

- Tamano del repositorio: 2,9 GB, lo que corresponde a los pesos fp32 (model.onnx + model.onnx_data) mas la version int8 y el tokenizador. La RAM/VRAM necesaria para fp32 sera del orden de 2,3 GB aproximadamente (568 M de parametros en fp32); la version int8 reduce este requisito aproximadamente a la cuarta parte.
- CPU: ejecutable con ONNX Runtime en CPU; la version int8 dinamico esta pensada como alternativa cuando fp32 sea demasiado lento.
- GPU: no requiere GPU; si se usa, cualquier GPU moderna con soporte ONNX Runtime (CUDA o DirectML) es suficiente dado el tamano moderado del modelo.
- Consumer GPU: perfectamente viable en GPUs de consumo (por ejemplo RTX 3060 o superiores) dada la huella de memoria reducida.
- Despliegue: ONNX Runtime (Python, C#, C++, Java), integrable en servicios propios; no requiere vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Samir-j/bge-reranker-v2-m3-onnx | 568 M (base) | 8192 (base) | ONNX (fp32, int8) | Apache-2.0 |
| BAAI/bge-reranker-v2-m3 (original) | 568 M | 8192 | PyTorch (safetensors) | Apache-2.0 |
| BAAI/bge-reranker-large | 560 M | 512 | PyTorch (safetensors) | Apache-2.0 |
| jinaai/jina-reranker-v2-base-multilingual | 278 M | 8192 | PyTorch (safetensors) | CC-BY-NC-4.0 (no comercial) |

Esta exportacion ofrece la misma funcionalidad que el modelo original de BAAI pero en formato ONNX, lo que elimina la dependencia de PyTorch y facilita despliegues en produccion. Frente a bge-reranker-large, el modelo v2-m3 amplia el contexto de 512 a 8192 tokens y mejora el soporte multilingue. Frente a jina-reranker-v2, bge-reranker-v2-m3 es mas grande pero cuenta con una licencia Apache-2.0 que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- La version int8 (model_int8.onnx) no paso el chequeo de paridad de ranking frente a PyTorch en la exportacion, por lo que puede producir ordenaciones ligeramente distintas; se recomienda usarla solo si fp32 es demasiado lento y validar los resultados en cada caso de uso.
- Los pesos fp32 requieren mantener model.onnx y model.onnx_data en la misma carpeta; separarlos rompe la carga del modelo.
- Al ser un cross-encoder, el coste de inferencia escala linealmente con el numero de candidatos reranqueados; no es adecuado como retriever de primer nivel sobre colecciones grandes.
- Riesgo de alucinacion: no aplica directamente al ser un modelo discriminativo, pero los scores de relevancia pueden ser imprecisos en dominios muy especializados o fuera de distribucion.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de XLM-RoBERTa y del fine-tuning de BAAI; no hay documentacion especifica de mitigacion en la ficha.
- Idiomas soportados: no detallados en la ficha de la exportacion; consultar la documentacion del modelo base para el listado de idiomas.
- Descargas y adopcion: el repositorio registra 0 descargas, por lo que carece de validacion comunitaria; se recomienda verificar la paridad y el rendimiento en el entorno propio antes de produccion.

## Enlaces

- Modelo ONNX exportado: https://huggingface.co/Samir-j/bge-reranker-v2-m3-onnx
- Modelo base (BAAI/bge-reranker-v2-m3): https://huggingface.co/BAAI/bge-reranker-v2-m3
