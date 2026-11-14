# bpmatt/ettin-reranker-17m-onnx

## Resumen

Ettin 17M ONNX es una conversión al formato ONNX del modelo `cross-encoder/ettin-reranker-17m-v1`, un cross-encoder de reordenación (reranking) de pasajes desarrollado originalmente por el equipo de Sentence Transformers / Hugging Face. La conversión la ha publicado el usuario `bpmatt` en Hugging Face bajo licencia Apache-2.0. El modelo resuelve la tarea de ranking de texto: dado un par pregunta-pasaje, devuelve una puntuación de relevancia que permite reordenar un conjunto de candidatos recuperados previamente por un sistema de búsqueda.

Con solo 17 millones de parámetros, está pensado para integrarse en pipelines de recuperación aumentada (RAG) y búsqueda semántica donde el coste computacional del reranking es crítico. El formato ONNX permite desplegarlo con ONNX Runtime en entornos sin GPU dedicada o con aceleración por CPU, lo que lo hace atractivo para aplicaciones de baja latencia en producción. La arquitectura subyacente es ModernBERT, según las etiquetas del repositorio, y el modelo solo soporta inglés.

El repositorio tiene un tamaño de 0,1 GB y fue creado el 14 de noviembre de 2026. No cuenta con descargas ni likes en el momento de la consulta, y la información pública disponible es muy limitada: la model card es escueta y no incluye datos de entrenamiento, benchmarks ni detalles sobre el proceso de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder) |
| Parámetros totales | 17 millones (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (máximo recomendado por el autor) |
| Tipos de cuantización | no disponible (el repositorio contiene un único `model.onnx`; no se especifica si está cuantizado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`), con tokenizer incluido |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT, según las etiquetas del repositorio. Un cross-encoder procesa conjuntamente el par pregunta-pasaje y produce una puntuación de relevancia, a diferencia de los bi-encoders que generan embeddings independientes. La entrada son `input_ids` y `attention_mask` en int64, y la salida es `logits` de tipo float32 con forma `[batch, 1]`. Puntuaciones más altas indican mayor relevancia.

No se dispone de información sobre el proceso de entrenamiento del modelo base: no se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el proceso de conversión a ONNX ni si se aplicó optimización o cuantización durante la exportación. La model card solo indica que el modelo es autocontenido en `onnx/model.onnx` y que debe usarse con el tokenizer incluido, truncando únicamente el pasaje a un máximo de 256 tokens.

## Capacidades

- Reordenación de pasajes (passage ranking): puntúa la relevancia de un pasaje respecto a una pregunta.
- Cross-encoder: procesa pares pregunta-pasaje de forma conjunta para mayor precisión que un bi-encoder.
- Inferencia en formato ONNX: compatible con ONNX Runtime para despliegue en CPU o GPU.
- Tokenizer incluido: el repositorio proporciona el tokenizer necesario para preprocesar las entradas.
- Truncado controlado: permite truncar el pasaje a 256 tokens sin afectar a la pregunta.
- Salida escalar por par: devuelve un logit por par, apto para ordenar candidatos.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N candidatos con un bi-encoder, el cross-encoder reordena los pasajes por relevancia antes de pasarlos al generador, mejorando la calidad de las respuestas. Su tamaño de 17M permite hacerlo con latencia baja.
- Búsqueda semántica en documentación técnica: reordenar resultados de búsqueda en inglés para que los fragmentos más relevantes aparezcan primero, usando ONNX Runtime en servidores sin GPU.
- Filtrado de candidatos en motores de búsqueda internos: puntuar pares consulta-documento para descartar resultados irrelevantes antes de la presentación al usuario.
- Sistemas de preguntas y respuestas extractivas: seleccionar el pasaje más relevante de un conjunto recuperado para responder a una consulta en inglés.
- Despliegue en entornos edge o CPU-only: al estar en ONNX y tener solo 17M de parámetros, puede ejecutarse en dispositivos con recursos limitados sin necesidad de GPU.
- Evaluación de relevancia en datasets de QA: usar las puntuaciones del modelo para analizar la calidad de recuperaciones en experimentos de investigación.
- Moderación o filtrado de contenido: puntuar la relevancia de fragmentos de texto respecto a criterios definidos, aunque el modelo está entrenado para ranking pregunta-pasaje y su uso fuera de ese dominio no está validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 17M de parámetros, el modelo ocupa aproximadamente 68 MB en fp32 (17M × 4 bytes) y alrededor de 17 MB en int8. El repositorio de 0,1 GB incluye tokenizer y pesos ONNX.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere una GPU dedicada. Funciona en CPU sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (principal opción, dado el formato), con soporte para CPU y GPU. No se mencionan otras opciones como vLLM, llama.cpp o TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles. Dado el tamaño reducido y la arquitectura ModernBERT, se espera una latencia de milisegundos por par en CPU, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Idiomas |
|---|---|---|---|---|---|
| bpmatt/ettin-reranker-17m-onnx | 17M | 256 tokens | ONNX | Apache-2.0 | en |
| cross-encoder/ettin-reranker-17m-v1 | 17M | no disponible | safetensors (presumiblemente) | no disponible | en |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22M | 512 tokens | PyTorch | Apache-2.0 | en |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33M | 512 tokens | PyTorch | Apache-2.0 | en |

La comparativa se limita a modelos de la misma categoría (cross-encoders pequeños para reranking). No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada. El modelo Ettin 17M ONNX se distingue por su formato ONNX y su licencia Apache-2.0, mientras que los MiniLM de Sentence Transformers ofrecen contextos más largos (512 tokens) pero en formato PyTorch.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su rendimiento en otros idiomas.
- Longitud de contexto limitada a 256 tokens, lo que puede ser insuficiente para pasajes largos; el autor indica truncar únicamente el pasaje.
- No hay información sobre sesgos del modelo base ni sobre el proceso de entrenamiento, por lo que no se pueden evaluar sesgos conocidos.
- Riesgo de alucinación no aplica directamente (no genera texto), pero las puntuaciones de relevancia pueden ser erróneas en dominios fuera de distribución.
- La licencia Apache-2.0 permite uso comercial, pero se debe consultar el archivo NOTICE incluido para posibles atribuciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y la model card es mínima; no hay evidencia de validación por parte de la comunidad.
- No se especifica si el archivo ONNX está cuantizado ni qué versión de ONNX Runtime se requiere.
- El modelo base (`cross-encoder/ettin-reranker-17m-v1`) no tiene información pública detallada en la documentación proporcionada, lo que limita la evaluación de su calidad.

## Enlaces

- [Hugging Face: bpmatt/ettin-reranker-17m-onnx](https://huggingface.co/bpmatt/ettin-reranker-17m-onnx)
- [Modelo base: cross-encoder/ettin-reranker-17m-v1](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
