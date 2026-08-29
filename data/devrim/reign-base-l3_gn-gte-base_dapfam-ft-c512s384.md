# devrim/reign-base-l3_gn-gte-base_dapfam-ft-c512s384

## Resumen

El modelo `devrim/reign-base-l3_gn-gte-base_dapfam-ft-c512s384` es un encoder cross-chunk de la familia REIGN (Refurbished Embeddings with Integrated Guidance Networks), desarrollado por Devrim Cavuşoğlu y Emre Akbaş para el escalado eficiente de la longitud de contexto en embeddings de documentos. Este checkpoint concreto combina un encoder REIGN `base-l3` (3 capas, 22,45 millones de parámetros entrenables) con una red de guía congelada basada en `thenlper/gte-base` (110 millones de parámetros), y ha sido fine-tuneado sobre la tarea de retrieval de patentes DAPFAM con un tamaño de chunk de 512 y stride de 384.

El propósito de esta publicación es documentar un resultado negativo: el fine-tuning no supera al rendimiento zero-shot del backbone en la tarea DAPFAM, tal y como se reporta en el paper. Por tanto, no se recomienda como punto de partida para retrieval de patentes; los autores sugieren utilizar los checkpoints zero-shot de GoodWiki-Long para esa tarea. Aun así, el modelo es útil para inspeccionar el comportamiento del fine-tuning en escenarios de dominio específico y para reproducir los experimentos del artículo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas, d=768, 12 cabezas, FFN 3072) + red de guía GTE-base congelada (110M) |
| Parametros totales | 22.446.336 (solo encoder REIGN; la red de guía tiene 110M pero está congelada) |
| Parametros activos | 22.446.336 (no es MoE) |
| Longitud de contexto | Chunk size 512, stride 384 (procesa documentos largos mediante ventanas deslizantes) |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

REIGN introduce un esquema de dos componentes: una red de guía (guidance network) que genera embeddings por chunk de un documento largo, y un encoder cross-chunk que agrega la información de múltiples chunks para producir una representación final del documento. En este checkpoint, la red de guía es `thenlper/gte-base` (congelada) y el encoder REIGN se entrena desde cero (cold start) con 3 capas, dimensión 768 y 12 cabezas de atención.

El fine-tuning se realizó sobre el dataset DAPFAM (retrieval de familias de patentes, FullText) con el objetivo InfoNCE, temperatura 0,07, 4 negativos proporcionados por familia más negativos in-batch, optimizador AdamW con learning rate 1e-5, weight decay 1e-4, 15 épocas, batch size 2 y precisión mixta de 16 bits. El chunk size es 512 y el stride 384, lo que produce solapamiento entre chunks. La inicialización es fría (el encoder parte de pesos aleatorios), y no se emplea RLHF ni DPO; se trata de un entrenamiento contrastivo estándar.

## Capacidades

- Generación de embeddings de documentos largos (multi-chunk) para retrieval documento-a-documento.
- Agregación de información de chunks solapados mediante el encoder cross-chunk.
- Soporte de búsqueda semántica en corpus de patentes (aunque con rendimiento inferior al zero-shot).
- Salida de vectores L2-normalizados, listos para similitud coseno.
- Solo procesa texto en inglés.
- No soporta tool calling, agentes ni generación de texto; es exclusivamente un modelo de feature extraction.

## Casos de uso

- Inspección de resultados negativos en fine-tuning: permite reproducir y analizar por qué el ajuste fino degrada el rendimiento en retrieval de patentes, útil para investigación en metodologías de entrenamiento.
- Benchmarking de estrategias de fine-tuning: sirve como punto de comparación para evaluar otras técnicas (por ejemplo, fine-tuning con diferentes learning rates o regularización) sobre la misma tarea.
- Estudio de escalado de contexto: al combinar un encoder ligero con una red de guía congelada, es útil para experimentos sobre cómo agregar información de chunks en documentos extensos.
- Desarrollo de pipelines de retrieval en dominios con pocos datos etiquetados: aunque no supera al zero-shot, puede servir como baseline en entornos donde se quiera medir el impacto del fine-tuning.
- Reproducción de experimentos del paper REIGN: el checkpoint está publicado para que la comunidad pueda verificar los resultados reportados en el Apéndice J.
- Educación en arquitecturas de embeddings para documentos largos: su tamaño reducido (22M) lo hace accesible para fines didácticos y de prototipado rápido.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados de nDCG@100 sobre el corpus DAPFAM FullText (top-k=100, sin self-matches), según el Apéndice J del paper:

| Split | nDCG@100 |
| --- | ---: |
| test | 31.12 |
| test_in | 35.46 |
| test_out | 5.20 |

El paper indica que el fine-tuning no supera al zero-shot del backbone en esta tarea; la degradación respecto al zero-shot es de 0,4 a 1,5 puntos con lr 1e-5. No se proporcionan valores numéricos del zero-shot en la información disponible, por lo que no se puede realizar una comparación cuantitativa directa aquí.

## Requisitos de hardware

- Parámetros: 22,45M (encoder) + 110M (red de guía congelada), lo que supone un modelo muy ligero en total (~132M parámetros en inferencia).
- VRAM estimada: inferior a 1 GB para el encoder REIGN; la red de guía GTE-base requiere aproximadamente 0,5 GB en float32. En total, menos de 2 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) es suficiente. También puede ejecutarse en CPU para documentos individuales.
- Opciones de despliegue: la librería `reign` (instalable desde GitHub) proporciona la clase `ReignBaselineEncoder` para generar embeddings. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la información proporcionada; al ser un modelo pequeño, se espera una latencia baja, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
| --- | --- | --- | --- | --- |
| `thenlper/gte-base` (red de guía) | 110M | 512 tokens | Apache-2.0 | Embeddings de texto general, sin agregación cross-chunk |
| `devrim/reign-base-l3_gn-gte-base_dapfam-ft-c512s384` | 22,45M (encoder) + 110M (guía) | Multi-chunk (512/384) | Apache-2.0 | Retrieval de documentos largos (patentes) |
| Checkpoints zero-shot GoodWiki-Long (misma familia REIGN) | No disponible | Multi-chunk | Apache-2.0 | Retrieval de documentos largos (recomendado por los autores) |

No se dispone de datos de rendimiento comparativo con otros modelos de embeddings de documentos largos (por ejemplo, Longformer, MPNet con ventanas) en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: el fine-tuning no mejora el rendimiento zero-shot en DAPFAM; los autores recomiendan explícitamente no usar este checkpoint como punto de partida para retrieval de patentes.
- Solo inglés: no soporta otros idiomas.
- No apto para inputs cortos: si el documento es más corto que el chunk size (512), el encoder cross-chunk no tiene nada que agregar y el modelo no debe utilizarse; en ese régimen se debe usar la red de guía sola.
- Riesgo de alucinación: no aplica, al ser un modelo de embeddings y no generativo.
- Sesgos: no se han evaluado sesgos específicos; al estar entrenado en datos de patentes, puede reflejar sesgos del dominio.
- Licencia: Apache-2.0 para el modelo, pero el dataset DAPFAM (si se usa para entrenamiento) tiene licencia CC BY-SA 4.0, lo que puede afectar a redistribuciones derivadas.
- Reproducibilidad: el entrenamiento con precisión mixta de 16 bits no es bit-reproducible, por lo que un reentrenamiento no producirá pesos idénticos.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ft-c512s384
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
