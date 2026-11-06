# DheerLabs/ettin-reranker-32m-v1-mixed-int8-onnx

## Resumen

Ettin-reranker-32m-v1-mixed-int8-onnx es una versión cuantizada a INT8 y empaquetada en formato ONNX del modelo cross-encoder `cross-encoder/ettin-reranker-32m-v1`, publicado por el usuario DheerLabs. Se trata de un reranker de 32 millones de parámetros construido sobre la arquitectura ModernBERT, diseñado para reordenar candidatos recuperados por un sistema de búsqueda o recuperación previa (retrieval). El modelo original procede de los autores de `cross-encoder` (sentence-transformers), y esta réplica mantiene la licencia Apache-2.0.

La modificación principal no es una nueva versión entrenada, sino una optimización de despliegue: se ha cuantizado dinámicamente a INT8 la mayoría de las multiplicaciones de matrices del encoder, manteniendo en float32 la proyección de salida del feed-forward (`mlp/Wo`) de las capas 0, 2 y 6 para preservar la fidelidad del ranking. El resultado es un artefacto pensado para inferencia en CPU, con aproximadamente la mitad del tiempo de ejecución respecto al modelo float32 original y una degradación mínima en la calidad del reordenamiento.

Es relevante ahora porque los rerankers pequeños son componentes críticos en pipelines RAG y motores de memoria conversacional, donde el coste por consulta y la latencia importan tanto como la precisión. Este paquete ofrece una alternativa lista para producción en CPU sin necesidad de GPU, con métricas de fidelidad declaradas por el autor frente al modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder, encoder transformer) |
| Parametros totales | 32 millones (aproximado, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica por canal (pesos con signo), con capas 0, 2 y 6 del `mlp/Wo` en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_mx3_q8.onnx`), safetensors para la cabeza de scoring, `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder basado en ModernBERT de 32 millones de parámetros. Un cross-encoder procesa conjuntamente el par (consulta, documento) y produce una puntuación de relevancia, a diferencia de los bi-encoders que generan embeddings independientes. La cabeza de scoring aplica `2_Dense`, `3_LayerNorm` y `4_Dense` sobre el vector `[CLS]` del `last_hidden_state`, con Dense sin sesgo, GELU exacta, LayerNorm con epsilon 1e-5 y una proyección final a un único logit.

Esta versión concreta no ha sido reentrenada: es una copia modificada del checkpoint `b33e5ceb5110773ea9cf5e00c9bedc83a8c2afdd` del modelo original. La cuantización se realizó con ONNX Runtime 1.31.0 mediante `quantize_dynamic`, tras aplicar `quant_pre_process` para inferencia de formas. No se utilizaron datos de calibración. La decisión de mantener en float32 el `mlp/Wo` de las capas 0, 2 y 6 responde a la presencia de valores atípicos en las activaciones de salida del feed-forward en esas capas; sin ese ajuste, la correlación de Spearman frente a float32 caía a 0,939 sobre los 100 mejores candidatos, mientras que con el ajuste se alcanza 0,995 y un solapamiento top-20 de 0,963. Los datos de entrenamiento del modelo original incluyen MS MARCO y GooAQ, segun la model card original.

## Capacidades

- Reordenamiento de pares (consulta, documento) mediante puntuación de relevancia tipo cross-encoder.
- Puntuación de relevancia para pipelines de retrieval en dos etapas (recuperación amplia seguida de reranking).
- Ejecución en CPU con latencias reducidas gracias a la cuantización INT8 selectiva.
- Integración en motores de memoria conversacional y sistemas RAG, segun los casos medidos por el autor.
- Soporte de tokenizacion compatible con el modelo base (`tokenizer.json` sin cambios).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial con un bi-encoder o búsqueda léxica, el modelo reordena los candidatos por relevancia real al par consulta-documento, mejorando la precisión del contexto que se pasa al LLM generador.
- Motores de memoria conversacional: el autor lo evaluó en el motor Latch para reordenar las notas de memoria de un chat; el modelo es adecuado porque procesa pares de forma independiente y su bajo coste permite reordenar decenas de candidatos por turno.
- Búsqueda empresarial en CPU: al no requerir GPU, puede desplegarse en servidores de aplicaciones convencionales o entornos edge donde el hardware acelerador no está disponible.
- Filtrado de resultados en sistemas de preguntas y respuestas: dado un conjunto de pasajes candidatos, el modelo asigna una puntuación que permite descartar los irrelevantes antes de la generación.
- Evaluación de calidad de recuperación: puede usarse como juez de relevancia en experimentos de evaluación de sistemas de búsqueda, comparando configuraciones de retrieval.
- Servicios de alto rendimiento con latencia estricta: con p50 de 0,44 s y p95 de 0,61 s para 100 candidatos en un M1 Max con cuatro sesiones de un hilo, encaja en aplicaciones interactivas que exigen respuestas por debajo del segundo.
- Preprocesamiento en pipelines de clasificación documental: la puntuación de pares permite ordenar documentos por afinidad a una consulta antes de etapas más costosas.

## Benchmarks y rendimiento

| Metrica | float32 (upstream) | este modelo (INT8 mixto) | ettin-reranker-17m-v1 |
|---|---|---|---|
| p50, 100 candidatos, M1 Max CPU | 0,86 s | 0,44 s | no disponible |
| p95, 100 candidatos, M1 Max CPU | 1,17 s | 0,61 s | no disponible |
| Spearman vs float32 (top 100) | 1,000 (referencia) | 0,995 | no disponible |
| Solapamiento top-20 vs float32 | 1,000 (referencia) | 0,963 | no disponible |
| Recall en preguntas multi-hop LoCoMo (motor Latch) | 0,846 | 0,847 | 0,819 |

Las mediciones se realizaron en un MacBook con M1 Max, en CPU, con cuatro sesiones de un solo hilo y lotes de 5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de ranking y no de generación.

## Requisitos de hardware

- VRAM estimada: no aplica para el despliegue previsto; el modelo está empaquetado para CPU y su tamaño de repositorio es de 0,1 GB.
- GPU recomendadas: no especificadas; el artefacto está orientado a CPU. Podría ejecutarse en GPU mediante ONNX Runtime, pero no se han publicado mediciones.
- Compatibilidad con GPU de consumo: el modelo es lo suficientemente pequeño (32M parámetros) para caber en cualquier GPU de consumo, aunque el paquete está optimizado para CPU.
- Opciones de despliegue: ONNX Runtime (versión usada para la cuantización: 1.31.0); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un cross-encoder de ranking.
- Latencia y throughput: p50 de 0,44 s y p95 de 0,61 s para reordenar 100 candidatos en M1 Max CPU con cuatro sesiones de un hilo y lotes de 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DheerLabs/ettin-reranker-32m-v1-mixed-int8-onnx | 32M | no disponible | ONNX INT8 mixto | Apache-2.0 | Versión cuantizada para CPU, Spearman 0,995 vs float32 |
| cross-encoder/ettin-reranker-32m-v1 | 32M | no disponible | safetensors / ONNX float32 | Apache-2.0 | Modelo original, referencia de fidelidad y latencia |
| ettin-reranker-17m-v1 | 17M | no disponible | no disponible | no disponible | Menor tamaño; recall LoCoMo 0,819 frente a 0,847 |

No se dispone de información sobre otros rerankers comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: Spearman de 0,995 y solapamiento top-20 de 0,963 frente a float32, lo que implica que un pequeño porcentaje de candidatos puede reordenarse de forma distinta al modelo original.
- El modelo es un cross-encoder de ranking; no genera texto ni mantiene conversaciones, por lo que no debe usarse como modelo generativo.
- No se han publicado datos sobre sesgos, idiomas soportados ni comportamiento en dominios distintos a los evaluados (memoria conversacional y MS MARCO/GooAQ del original).
- Riesgo de alucinación no aplicable en el sentido generativo, pero la puntuación de relevancia puede ser poco fiable en dominios muy alejados de los datos de entrenamiento del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar el archivo `LICENSE` y la atribución a los autores originales de `cross-encoder`.
- El rendimiento medido corresponde a un hardware concreto (M1 Max, CPU, cuatro sesiones de un hilo, lotes de 5); los tiempos pueden variar en otras plataformas.
- No se especifica la longitud máxima de contexto del modelo base en la información disponible, lo que limita la planificación de despliegues con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DheerLabs/ettin-reranker-32m-v1-mixed-int8-onnx
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-32m-v1
- Repositorio de sentence-transformers/cross-encoder: no disponible en la información proporcionada
- Paper de ModernBERT: no disponible en la información proporcionada
- Documentación de ONNX Runtime: no disponible en la información proporcionada
