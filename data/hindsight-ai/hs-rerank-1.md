# hindsight-ai/hs-rerank-1

## Resumen

hs-rerank-1 es un reranker multilingüe basado en arquitectura cross-encoder, desarrollado por Hindsight AI para su plataforma de gestión de memoria y recuperación de contexto (Hindsight). El modelo recibe un par de consulta y documento y devuelve una puntuación de relevancia, lo que lo sitúa en la segunda fase de un pipeline de recuperación de información: tras un primer filtrado por similitud vectorial, el reranker refina el orden de los candidatos.

El modelo parte de `jhu-clsp/mmBERT-small` y cuenta con 113,8 millones de parámetros totales, de los cuales 98 millones corresponden a la tabla de embeddings de tokens, de modo que cada pasada forward ejecuta un transformer de aproximadamente 15 millones de parámetros. Soporta entradas de hasta 8.192 tokens por par consulta-documento y cubre ocho idiomas: inglés, español, francés, alemán, portugués, japonés, coreano y chino (simplificado y tradicional).

Su relevancia actual reside en la combinación de tamaño reducido, contexto largo y despliegue eficiente: incluye una exportación ONNX con cuantización int8 para CPU y pesos safetensors en FP16 para GPU, y es compatible con Text Embeddings Inference (TEI) tanto en imagen CPU como GPU. Con licencia MIT y más de 1,6 millones de descargas, está pensado para integrarse en sistemas RAG y agentes con memoria a largo plazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer encoder, base `jhu-clsp/mmBERT-small`) |
| Parametros totales | 113.794.177 (114M); 98M en la tabla de embeddings, ~15M en el transformer |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por par consulta-documento |
| Tipos de cuantizacion | int8 (exportación ONNX para CPU); FP16 en safetensors (rama `fp32` con copia en FP32) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh (chino simplificado y tradicional) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, copia FP32 en rama `fp32`), ONNX (`onnx/model.onnx`, tabla de vocabulario int8) |

## Arquitectura y entrenamiento

hs-rerank-1 es un cross-encoder: procesa conjuntamente la consulta y el documento en una única pasada del transformer y produce una puntuación de relevancia por par. La arquitectura subyacente es ModernBERT en su variante small (`jhu-clsp/mmBERT-small`), un encoder transformer multilingüe. El desglose de parámetros es notable: de los 114M totales, 98M pertenecen a la tabla de embeddings de tokens, por lo que el coste computacional real por inferencia corresponde a un transformer de unos 15M de parámetros, lo que explica su viabilidad en CPU.

El modelo se distribuye como un fine-tune del modelo base `jhu-clsp/mmBERT-small`. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos deben considerarse no disponibles. Como innovaciones técnicas destacables, la model card menciona la exportación ONNX con tabla de vocabulario en int8 para inferencia en CPU y el almacenamiento de pesos en FP16 para GPU, además del soporte nativo de TEI con truncado automático (`--auto-truncate`) y batch de cliente configurable.

## Capacidades

- Puntuación de relevancia query-documento: devuelve un score entre 0 y 1 por par (o logits crudos si se pasa `activation_fn=torch.nn.Identity()`).
- Reranking multilingüe en ocho idiomas: inglés, español, francés, alemán, portugués, japonés, coreano y chino simplificado y tradicional.
- Manejo de entradas largas: hasta 8.192 tokens por par consulta-documento, adecuado para documentos extensos o conversaciones con mucho contexto.
- Integración con Sentence Transformers mediante `CrossEncoder`, con métodos `predict` y `rank`.
- Despliegue en Text Embeddings Inference (TEI) con endpoint `/rerank` y soporte de imágenes CPU y GPU.
- Integración nativa con la plataforma Hindsight como proveedor de reranking local, vía TEI o vía la API de inferencia alojada de Hindsight.
- Inferencia en CPU mediante ONNX int8 y en GPU mediante safetensors FP16.
- No se documentan capacidades de generación de texto, tool calling, agentes autónomos, visión ni audio; el modelo es exclusivamente de ranking.

## Casos de uso

- Reranking en pipelines RAG: tras una búsqueda vectorial aproximada, hs-rerank-1 reordena los candidatos recuperados con una puntuación cross-encoder más precisa, mejorando la calidad del contexto entregado al LLM generador. Su contexto de 8.192 tokens permite puntuar fragmentos largos sin truncar.
- Sistemas de memoria de agentes: la plataforma Hindsight lo emplea para decidir qué recuerdos recuperar ante una consulta del usuario; el ejemplo de la model card (una app de presupuesto frente a una rutina de running) ilustra la selección de memorias relevantes entre candidatos dispares.
- Atención al cliente multilingüe: con soporte para ocho idiomas, puede ordenar artículos de base de conocimiento o respuestas previas en el idioma del usuario, incluyendo japonés, coreano y chino para mercados asiáticos.
- Búsqueda documental en producción con CPU: la exportación ONNX int8 y el transformer efectivo de ~15M de parámetros permiten servir reranking en servidores sin GPU, con TEI y `--max-client-batch-size` ajustable para throughput.
- Búsqueda semántica en comercio electrónico: puntuar la relevancia entre la consulta del comprador y descripciones de producto, incluyendo fichas largas, para reordenar resultados de un primer recuperador.
- Moderación y clasificación de pares texto-texto: usar la puntuación de relevancia como señal en tareas de emparejamiento (pregunta-respuesta, incidencia-solución, título-cuerpo) en pipelines de datos.
- Filtrado de contexto en asistentes con historial largo: dado que acepta pares de hasta 8.192 tokens, puede evaluar turnos de conversación completos frente a la consulta actual antes de incluirlos en el prompt.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`assets/benchmarks.png`), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en formato tabular en la información disponible.

## Requisitos de hardware

- VRAM estimada para GPU: con pesos FP16 y 114M de parámetros, el modelo ocupa aproximadamente 0,23 GB en memoria; la VRAM real necesaria es baja (por debajo de 1 GB en la mayoría de configuraciones, dependiendo del batch y de la longitud de secuencia).
- GPU recomendadas según la model card: etiqueta de imagen TEI `89-1.9.3` para L4 y otras GPU Ada; etiqueta `1.9.3` para A100 y H100.
- GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU consumer moderna (RTX 4090, RTX 3090, RTX 4060, etc.); no se especifican requisitos mínimos oficiales.
- CPU: soportado mediante la exportación ONNX int8; es el modo de despliegue destacado por el autor para entornos sin GPU.
- Opciones de despliegue: Sentence Transformers (`CrossEncoder`), Text Embeddings Inference (imágenes CPU y GPU), API alojada de Hindsight (`https://inference.hindsight.vectorize.io`) y la propia plataforma Hindsight con proveedor `local`, `tei` o `hindsight`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hindsight-ai/hs-rerank-1 | 114M (transformer efectivo ~15M) | 8.192 tokens | 8 | MIT | Cross-encoder; ONNX int8 para CPU; TEI |
| jhu-clsp/mmBERT-small (modelo base) | No disponible en la información | No disponible | Multilingüe | No disponible en la información | Encoder base sobre el que se hace fine-tune |
| Alternativas de reranking de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo con otros rerankers en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo produce puntuaciones de relevancia; no genera texto ni soporta tool calling, por lo que no puede sustituir a un LLM en un pipeline.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: las puntuaciones entre 0 y 1 dependen del fine-tune y pueden no estar calibradas para umbrales fijos en dominios distintos al de entrenamiento.
- La información disponible no detalla sesgos conocidos, composición del dataset de entrenamiento ni evaluación por idioma; no es posible valorar la equidad entre las ocho lenguas soportadas.
- El límite de 8.192 tokens se aplica por par consulta-documento; pares más largos requieren truncado (TEI ofrece `--auto-truncate`), lo que puede descartar información relevante.
- Aunque la licencia MIT permite uso comercial sin restricciones, el modelo base `jhu-clsp/mmBERT-small` tiene su propia licencia que conviene verificar antes de un despliegue en producción.
- El número de likes (8) es bajo en relación con las descargas (más de 1,6 millones), lo que sugiere adopción vía pipelines automatizados más que validación comunitaria extensa.
- No hay datos publicados de latencia, throughput ni resultados numéricos de benchmarks en la información disponible, lo que dificulta estimar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-rerank-1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio de Hindsight: https://github.com/vectorize-io/hindsight
- API de inferencia de Hindsight: https://inference.hindsight.vectorize.io
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Sentence Transformers: https://www.sbert.net/
