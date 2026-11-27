# hindsight-ai/hs-rerank-1

## Resumen

hs-rerank-1 es un reranker cross-encoder multilingüe desarrollado por Hindsight AI (Vectorize) para su sistema de memoria y recuperación Hindsight. El modelo recibe un par consulta-documento y devuelve una puntuación de relevancia entre 0 y 1, lo que permite reordenar resultados de una primera fase de recuperación (retrieval) en pipelines RAG y sistemas de búsqueda semántica. Está afinado a partir de `jhu-clsp/mmBERT-small`, un modelo ModernBERT multilingüe de pequeno tamano.

El modelo tiene 113,8 millones de parámetros totales, de los cuales 98 millones corresponden a la tabla de embeddings de tokens, de modo que cada pasada forward ejecuta un transformer de aproximadamente 15 millones de parámetros. Esto lo hace especialmente adecuado para despliegues con requisitos de latencia estrictos, incluido hardware sin GPU, gracias a su exportación ONNX en int8. Soporta ventanas de contexto de hasta 8.192 tokens por par consulta-documento.

Su relevancia actual radica en la combinación de tres factores: multilingüismo real (ocho idiomas, incluidos chino simplificado y tradicional), contexto largo para reranking de fragmentos extensos, y licencia MIT sin restricciones de uso comercial. Con más de 2,3 millones de descargas y compatibilidad directa con Text Embeddings Inference (TEI), se posiciona como una opción práctica para producción en sistemas RAG y motores de búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer ModernBERT (`jhu-clsp/mmBERT-small`) |
| Parametros totales | 113.794.177 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por par consulta-documento |
| Tipos de cuantizacion | FP16 (safetensors), FP32 (tag `fp32`), int8 (ONNX, tabla de vocabulario int8) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh (chino simplificado y tradicional) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 por defecto, copia FP32 en tag `fp32`), ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

hs-rerank-1 es un cross-encoder: procesa conjuntamente la consulta y el documento en una sola pasada y emite una puntuación de relevancia, en lugar de comparar embeddings independientes como haría un bi-encoder. Se construye mediante fine-tuning del modelo base `jhu-clsp/mmBERT-small`, que emplea la arquitectura ModernBERT (atención con rotación posicional y sesgos de atención alternados, entre otras optimizaciones). La distribución de parámetros es notablemente asimétrica: 98 millones de los 114 millones totales corresponden a la tabla de embeddings, por lo que el coste computacional efectivo por pasada es el de un transformer de aproximadamente 15 millones de parámetros.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de las propias de ModernBERT. El modelo se distribuye con una exportación ONNX que incorpora una tabla de vocabulario en int8, pensada para inferencia en CPU, y pesos safetensors en FP16 para GPU. La salida es una única puntuación por par; la librería `sentence-transformers` aplica una función de activación que la normaliza al rango [0, 1], y es posible obtener logits crudos pasando `activation_fn=torch.nn.Identity()`.

## Capacidades

- Reranking de pares consulta-documento: devuelve una puntuación de relevancia calibrada entre 0 y 1 (o logits crudos si se configura).
- Multilingüismo: inglés, español, francés, alemán, portugués, japonés, coreano y chino (simplificado y tradicional), con capacidad de emparejar consulta y documento en idiomas distintos.
- Contexto largo: hasta 8.192 tokens por par, adecuado para fragmentos documentales extensos.
- Integración como componente de pipelines RAG: reordena los resultados de una fase previa de retrieval denso o léxico.
- Inferencia en CPU y GPU: exportación ONNX int8 para CPU y safetensors FP16 para GPU.
- Compatibilidad con Text Embeddings Inference (TEI) mediante endpoint `/rerank`, con imágenes Docker para CPU y GPU.
- Integración nativa con Hindsight, tanto en modo local como apuntando a un servidor TEI o a la API de inferencia gestionada de Hindsight.
- No soporta tool calling, funciones de agente ni generación de texto: es exclusivamente un modelo de ranking.

## Casos de uso

- RAG sobre documentación técnica multilingüe: tras recuperar los 50-100 fragmentos candidatos con un retriever denso, hs-rerank-1 reordena y selecciona los 5-10 más relevantes antes de pasarlos al LLM generador; su contexto de 8.192 tokens permite evaluar fragmentos largos sin truncar.
- Atención al cliente con base de conocimiento: reordenar artículos de ayuda y FAQs en función de la consulta del usuario, con soporte para consultas en español y documentos en inglés o alemán dentro de la misma base.
- Búsqueda semántica en aplicaciones de productividad: el ejemplo de la model card (una app de presupuesto personal) ilustra el caso de reordenar notas y memorias de usuario; el modelo distingue entre una nota relevante (0,9647) y una irrelevante (0,0003) con una separación de puntuación muy marcada.
- Sistemas de memoria de agentes: Hindsight lo emplea como reranker de memorias recuperadas; al integrarse con `HINDSIGHT_API_RERANKER_PROVIDER=local` o `tei`, permite recuperar recuerdos relevantes de conversaciones pasadas sin depender de un servicio externo.
- Moderación y deduplicación de contenido: puntuar la similitud semántica entre una consulta y candidatos para filtrar duplicados o contenido tangencial en pipelines de curación de datos.
- Despliegue en entornos sin GPU: gracias al export ONNX int8 y a sus 15 millones de parámetros efectivos por pasada, puede servirse en CPU con TEI para equipos con presupuesto de infraestructura limitado.
- Búsqueda empresarial multilingüe: reordenar resultados de un buscador interno que indexa documentos en varios idiomas, aprovechando la cobertura de ocho idiomas y el emparejamiento cross-lingüe.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`assets/benchmarks.png`) pero no publica los valores numéricos en texto. No se han publicado resultados de benchmarks en la informacion disponible en formato tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 ocupan aproximadamente 228 MB (114 M parámetros × 2 bytes); con overhead de activaciones y contexto de 8.192 tokens, el consumo en GPU se mantiene holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. La model card menciona explícitamente L4 y otras GPU Ada (imagen TEI `89-1.9.3`) y A100/H100 (imagen TEI `1.9.3`).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU gracias a la exportación ONNX int8.
- Opciones de despliegue: Text Embeddings Inference (imágenes Docker CPU y GPU), `sentence-transformers` (CrossEncoder), ONNX Runtime para CPU, y el servidor local o remoto de Hindsight.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible. El reducido tamaño del transformer efectivo (15 M parámetros) y la exportación int8 apuntan a una latencia baja en CPU, pero no se dispone de mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Licencia | Multilingue |
|---|---|---|---|---|
| hs-rerank-1 | 114 M | 8.192 | MIT | Sí (8 idiomas) |
| Alternativas cross-encoder de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su única salida es una puntuación de relevancia.
- La model card no documenta sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de falsos positivos en la puntuación de relevancia, especialmente con documentos ambiguos o consultas muy cortas.
- La ventana de 8.192 tokens es por par consulta-documento; pares que la excedan requerirán truncado o fragmentación, lo que puede degradar la puntuación.
- Aunque cubre ocho idiomas, no se detalla el rendimiento relativo por idioma; el rendimiento en japonés, coreano o chino podría diferir del de inglés sin datos públicos que lo confirmen.
- Licencia MIT: permite uso comercial sin restricciones, pero se recomienda conservar la atribución indicada en la citación del autor.
- El modelo está disenado para Hindsight y su ecosistema; su uso fuera de ese contexto es posible pero no está documentado por el autor.
- No se publican cifras de latencia ni throughput, por lo que las estimaciones de capacidad en producción deben validarse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-rerank-1
- Repositorio de Hindsight: https://github.com/vectorize-io/hindsight
- API de inferencia de Hindsight: https://inference.hindsight.vectorize.io
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Documentación de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Documentación de sentence-transformers: https://www.sbert.net
