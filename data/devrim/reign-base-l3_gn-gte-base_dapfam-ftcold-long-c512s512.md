# devrim/reign-base-l3_gn-gte-base_dapfam-ftcold-long-c512s512

## Resumen

`reign-base-l3_gn-gte-base_dapfam-ftcold-long-c512s512` es un checkpoint de investigación del framework REIGN (Refurbished Embeddings with Integrated Guidance Networks), desarrollado por Devrim Cavuşoğlu y Emre Akbaş. El modelo implementa un cross-chunk encoder de 3 capas (22,45 millones de parámetros entrenables) que agrega embeddings de chunks generados por una red de guía congelada, en este caso GTE-base (110 millones de parámetros). Está diseñado para retrieval de documentos largos, concretamente para la tarea DAPFAM de búsqueda de familias de patentes sobre texto completo.

El checkpoint se libera con un propósito explícito: documentar un resultado negativo. Según la model card, el fine-tuning con la receta DAPFAM no supera al zero-shot del backbone GTE-base en ningún punto del barrido de hiperparámetros, y el ajuste naive a lr 1e-5 degrada el rendimiento entre 0,4 y 1,5 puntos. Por tanto, no se recomienda como punto de partida para retrieval de patentes, sino como material de inspección para la comunidad investigadora. La arquitectura REIGN permite escalar la longitud de contexto de forma eficiente al procesar documentos en chunks de 512 tokens con stride 512, sin necesidad de modificar la ventana de atención de la red de guía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas transformer, d=768, 12 cabezas, FFN 3072) + red de guia congelada GTE-base (110M) |
| Parametros totales | 22.446.336 (solo encoder REIGN; la red de guia congelada anade 110M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red de guia); el encoder REIGN agrega multiples chunks, por lo que el contexto efectivo es ilimitado en la practica |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN separa la generacion de embeddings en dos etapas. Una red de guia congelada (GTE-base, 110M) procesa cada chunk de 512 tokens con stride 512 y produce embeddings locales. Un cross-chunk encoder ligero (3 capas, d=768, 12 cabezas, FFN 3072, 22,45M parametros) recibe esos embeddings y los agrega para producir una representacion unica del documento completo. El encoder se inicializa desde cero (cold start) y se entrena con la receta DAPFAM: objetivo InfoNCE con temperatura 0,07, enmascaramiento de falsos negativos, politica parcial `ignore`, 4 negativos por muestra mas negativos in-batch, optimizador AdamW con schedule coseno, lr 1e-5, weight decay 1e-4, 60 epocas, batch size 4 y precision 16-mixed. Los datos de fine-tuning provienen de DAPFAM (retrieval de familias de patentes sobre texto completo). El resultado reportado es negativo: ningun punto del barrido (lr ∈ {1e-5, 5e-6, 2e-6, 1e-6}, weight decay ∈ {1e-4, 1e-2, 1e-1}) supera al zero-shot del backbone.

## Capacidades

- Generacion de embeddings de documentos largos (multi-chunk) para retrieval documento-a-documento.
- Agregacion de embeddings de chunks mediante cross-chunk encoder, permitiendo contextos efectivos superiores a la ventana de 512 tokens de la red de guia.
- Vectores L2-normalizados, por lo que la similitud coseno se calcula como producto escalar.
- Soporte de tool calling: no (es un modelo de embeddings, no generativo).
- Soporte de agentes: no.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: cache de embeddings en disco a traves de `ReignFeatureExtractor`; configuracion de stride en tiempo de evaluacion.

## Casos de uso

- Retrieval de patentes como baseline: aunque el fine-tuning no mejora el zero-shot, el checkpoint puede usarse para reproducir el resultado negativo o como referencia en experimentos comparativos sobre DAPFAM.
- Busqueda semantica en documentos legales extensos: contratos, sentencias o informes de mas de 512 tokens pueden indexarse en chunks y agregarse con el cross-chunk encoder para recuperacion a nivel de documento.
- Deduplicacion de documentos: la representacion unica por documento permite detectar duplicados o versiones casi identicas en corpus grandes.
- Clustering de documentos largos: los embeddings agregados sirven para agrupar articulos cientificos, patentes o informes tecnicos por tematica.
- Sistemas RAG con documentos extensos: el modelo puede generar embeddings de pasajes largos para recuperacion previa a la generacion, aunque se recomienda evaluar si el zero-shot de GTE-base es suficiente.
- Investigacion en eficiencia de contexto largo: el checkpoint es util para estudiar el comportamiento de cross-chunk encoders en tareas de retrieval especializadas.

## Benchmarks y rendimiento

Resultados reportados en la model card para nDCG@100 sobre DAPFAM, con top-k = 100 sobre el corpus FullText completo y auto-matches eliminados. Estos valores corresponden al checkpoint exacto (Apéndice J del paper).

| Split | nDCG@100 |
|---|---|
| test | 31,02 |
| test_in | 35,44 |
| test_out | 4,94 |

La model card indica explicitamente que el fine-tuning no supera al zero-shot en esta tarea. No se proporcionan benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN (22,45M parametros) mas la red de guia GTE-base (110M) suman aproximadamente 132M parametros. En float32, unos 530 MB de VRAM. Con cuantizacion a int8, menos de 300 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1660, RTX 2060, RTX 3060). Para produccion, una T4 o A10 es suficiente.
- Despliegue: se usa mediante el paquete `reign` de GitHub (`pip install git+https://github.com/devrimcavusoglu/reign.git`). No hay soporte directo en vLLM, Ollama o TGI porque es un modelo de embeddings, no generativo. Puede exportarse a ONNX para inferencia ligera.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@100 (DAPFAM test) | Licencia |
|---|---|---|---|---|
| reign-base-l3 (este checkpoint) | 22,45M + 110M (guia congelada) | 512 por chunk, agregacion multi-chunk | 31,02 | Apache 2.0 |
| thenlper/gte-base (zero-shot backbone) | 110M | 512 tokens | no reportado en la model card, pero el paper indica que supera al fine-tuning | MIT (segun su model card) |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La model card menciona que los checkpoints GoodWiki-Long de REIGN superan a este en retrieval de patentes, pero no se incluyen sus metricas.

## Limitaciones y advertencias

- Resultado negativo: el fine-tuning no mejora el zero-shot del backbone GTE-base en DAPFAM. No se recomienda para retrieval de patentes en produccion.
- Solo ingles: no soporta otros idiomas.
- No apto para entradas de un solo chunk: documentos de menos de 512 tokens colapsan a un unico embedding y el cross-chunk encoder no tiene nada que agregar; en ese regimen debe usarse la red de guia sola.
- Sesgos: no evaluados en la informacion disponible.
- Riesgo de alucinacion: no aplica (modelo no generativo).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset DAPFAM puede tener condiciones propias no detalladas en la model card.
- Reproducibilidad: el entrenamiento con precision 16-mixed no es bit-reproducible incluso con seed fijo; las comparaciones deben hacerse sobre metricas, no sobre pesos.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftcold-long-c512s512
- Codigo: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (to appear).
