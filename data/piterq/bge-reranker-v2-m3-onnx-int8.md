# PiterQ/bge-reranker-v2-m3-ONNX-int8

## Resumen

PiterQ/bge-reranker-v2-m3-ONNX-int8 es una conversión a ONNX con cuantización dinámica int8 (q8) del modelo de reranking BAAI/bge-reranker-v2-m3, desarrollado originalmente por BAAI (Beijing Academy of Artificial Intelligence) dentro del ecosistema FlagEmbedding. El modelo resuelve el problema de la segunda fase de recuperación de información (retrieval): dado un par consulta-pasaje, devuelve una puntuación de relevancia que permite reordenar los candidatos devueltos por un buscador vectorial o léxico. Se trata de un cross-encoder basado en XLM-RoBERTa de tipo base, con soporte multilingüe.

La relevancia de esta variante concreta es operativa: al estar exportada a ONNX e int8, permite ejecutar el reranking en CPU y en dispositivos de borde (on-device) con un consumo de memoria y latencia muy inferiores a los de la versión PyTorch original, sin reentrenamiento ni cambios en los datos de entrenamiento. El autor la publicó específicamente para la búsqueda de conocimiento dentro de la aplicación PLaiA. El repositorio ocupa 0,9 GB y la licencia es Apache 2.0.

El modelo mantiene la tokenizadora original de XLM-RoBERTa sin modificaciones y fija la entrada a `input_ids` y `attention_mask` con forma [1, 512], produciendo una salida `score` en formato logit que, tras aplicar sigmoid, se interpreta como probabilidad de relevancia entre 0 y 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (transformer), exportado a ONNX |
| Parametros totales | no disponible (modelo base de tipo base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (forma de entrada fijada a [1, 512]) |
| Tipos de cuantizacion | int8 dinámica (q8) sobre ONNX |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8), más tokenizadora XLM-RoBERTa original y `meta.json` |

## Arquitectura y entrenamiento

El modelo subyacente, BAAI/bge-reranker-v2-m3, es un cross-encoder construido sobre XLM-RoBERTa que procesa conjuntamente consulta y pasaje y emite una puntuación de relevancia, en lugar de comparar embeddings independientes como haría un bi-encoder. Esta formulación permite capturar interacciones token a token entre consulta y documento, lo que típicamente mejora la precisión del reordenamiento a costa de mayor coste computacional por par evaluado.

Esta publicación concreta no introduce ningún entrenamiento nuevo: el autor declara explícitamente que los cambios se limitan a la conversión de formato (exportación a ONNX con cuantización dinámica int8), la fijación de las entradas a `input_ids` y `attention_mask` con forma [1, 512] y la exposición de una salida `score` en formato logit. No hay fine-tuning ni modificación de los datos de entrenamiento. La tokenizadora se mantiene idéntica a la del modelo fuente, y se incluye un `meta.json` con los identificadores de token y la forma empleados por la aplicación. La revisión del modelo original referenciada es `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`.

## Capacidades

- Puntuación de relevancia consulta-pasaje mediante cross-encoding, con salida en logit convertible a probabilidad 0-1 vía sigmoid.
- Reranking de resultados en pipelines de recuperación de información (RAG, búsqueda documental, búsqueda de conocimiento interna).
- Procesamiento multilingüe, heredado de la tokenizadora y el modelo XLM-RoBERTa original.
- Ejecución en CPU y en dispositivos de borde gracias a la exportación ONNX int8.
- Entrada de longitud fija de 512 tokens, adecuada para pasajes de tamaño moderado.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito: es un clasificador de pares, no un modelo generativo.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N candidatos más similares con un buscador vectorial, el modelo reordena esos pasajes según su relevancia real respecto a la consulta, mejorando la calidad del contexto que se entrega al modelo generativo. Su formato ONNX int8 permite ejecutarlo en la misma máquina que el resto del pipeline sin GPU dedicada.
- Búsqueda de conocimiento on-device: integrado en aplicaciones de escritorio o móviles, como en el caso de PLaiA, para puntuar localmente la relevancia de fragmentos de documentación sin enviar datos a un servidor.
- Servicio de reranking en CPU: despliegue de una API ligera (por ejemplo, FastAPI) que reciba consulta y documentos y devuelva puntuaciones ordenadas, con latencias reducidas gracias a la cuantización int8.
- Filtrado de resultados en buscadores internos: descartar pasajes con puntuación baja antes de mostrarlos al usuario, reduciendo ruido en corpus multilingües.
- Selección de contexto en asistentes documentales: elegir los fragmentos más relevantes de un manual o base de conocimiento antes de construir el prompt, con la ventaja de que el modelo cubre varios idiomas sin modelos separados por lengua.
- Evaluación de calidad de recuperación: usar las puntuaciones como señal para comparar configuraciones de un sistema de búsqueda (distintos embeddings, tamaños de k, etc.) en fase de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de precisión (nDCG, MRR, etc.) ni comparaciones con la versión PyTorch original. Las referencias web encontradas mencionan un servicio de reranking en CPU con backend ONNX int8 y benchmarks de latencia, pero los propios autores advierten que se basan en pocas peticiones medidas y deben tratarse como indicativos; no se reproducen cifras concretas aquí al no estar verificadas para esta conversión específica.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de tipo base cuantizado a int8 y ejecutarse vía ONNX Runtime, puede correr enteramente en CPU; no requiere GPU.
- GPU recomendadas: no necesarias. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraría la inferencia si se usa el proveedor CUDA de ONNX Runtime, pero el caso de uso previsto es CPU.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del repositorio (0,9 GB) y la cuantización int8.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), servicios propios tipo FastAPI, y conversión adicional a Core ML para integración en aplicaciones Apple (la model card menciona entradas int32 en Core ML e int64 en ONNX).
- Latencia y throughput: no disponibles de forma verificada para esta conversión; las referencias externas a un servicio similar con ONNX int8 en CPU existen pero se describen como indicativas.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PiterQ/bge-reranker-v2-m3-ONNX-int8 | Cross-encoder ONNX | 512 tokens | int8 dinámica | Apache 2.0 | Hugging Face |
| BAAI/bge-reranker-v2-m3 (original) | Cross-encoder PyTorch | hasta 8192 tokens según model card original | fp32/fp16 | Apache 2.0 | Hugging Face |
| Qwen3-Reranker | Reranker basado en LLM | no disponible en la información proporcionada | no disponible | no disponible | mencionado en búsquedas web |

La diferencia principal frente al original es el formato y la cuantización: esta variante sacrifica flexibilidad (entrada fija a 512 tokens) y potencial precisión a cambio de velocidad y huella reducida en CPU. Para pasajes largos o requisitos de máxima calidad, el modelo original en PyTorch sigue siendo la referencia.

## Limitaciones y advertencias

- La entrada está fijada a [1, 512] tokens; pasajes o consultas más largos requieren truncado, lo que puede degradar la puntuación en documentos extensos.
- La cuantización int8 dinámica puede introducir una ligera pérdida de precisión frente al modelo en fp32; el autor no publica métricas que cuantifiquen esa diferencia.
- Es un modelo de clasificación de pares, no generativo: no produce texto, no razona de forma multi-paso y no soporta herramientas ni agentes.
- Riesgo de sesgo heredado del corpus de entrenamiento original de XLM-RoBERTa y de los datos de BAAI; no se documentan evaluaciones de sesgo en esta conversión.
- No hay garantía de calibración de las puntuaciones: son logits que requieren sigmoid para interpretarse como probabilidad, y su umbral óptimo depende del dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una conversión de un tercero, no de una publicación oficial de BAAI. Para producción conviene validar la calidad frente al original.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribución (`LICENSE` y `NOTICE` incluidos en el repositorio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PiterQ/bge-reranker-v2-m3-ONNX-int8
- Modelo base original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper BGE M3-Embedding (Chen et al., 2024): https://arxiv.org/abs/2402.03216
- Servicio de reranking en CPU con ONNX int8 (referencia externa): https://github.com/rahulnitb/bge-reranker-api
- Variante del mismo servicio con benchmarks de latencia: https://github.com/rahulnitb/bge-reranker-api/tree/main/
