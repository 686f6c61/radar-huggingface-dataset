# devrim/reign-base-l3_gn-gte-large_dapfam-ftwarm-c512s512

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es una arquitectura diseñada para escalar la longitud de contexto en tareas de retrieval de documentos largos sin aumentar el coste computacional de forma cuadrática. Este checkpoint concreto, `reign-base-l3_gn-gte-large_dapfam-ftwarm-c512s512`, es un encoder cross-chunk de 3 capas (22,45 millones de parámetros entrenables) que se apoya en una red guía congelada, GTE-large (335 millones de parámetros), para generar embeddings de fragmentos de 512 tokens. El modelo se ha fine-tuneado con warm-start sobre la tarea de retrieval de familias de patentes DAPFAM, partiendo de un checkpoint previamente entrenado en el dataset sintético GoodWiki-Long.

El resultado principal es negativo: el fine-tuning no supera al zero-shot en la tarea de patentes, y el propio autor publica el checkpoint para que el resultado sea inspeccionable, no como punto de partida recomendado. La relevancia de este modelo reside en que documenta un hallazgo importante para la comunidad: el fine-tuning naive puede degradar el rendimiento en retrieval de dominios específicos, y la arquitectura REIGN ofrece una alternativa eficiente para manejar documentos largos. Está liberado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas, d=768, 12 cabezas, FFN 3072) + red guía GTE-large congelada |
| Parametros totales | 22.643.456 (encoder REIGN) + 335M (GTE-large, congelados) |
| Parametros activos | 22.643.456 (solo el encoder REIGN; la red guía no se entrena) |
| Longitud de contexto | 512 tokens por fragmento (chunk size), con stride configurable (512 en este checkpoint) |
| Tipos de cuantizacion | no disponible (los pesos se publican en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN combina un encoder ligero (el cross-chunk encoder) con una red guía preentrenada y congelada. La red guía (GTE-large) procesa fragmentos de 512 tokens y produce embeddings locales; el encoder REIGN agrega estos embeddings a través de los fragmentos para producir una representación global del documento. Esta separación permite escalar a documentos largos sin aumentar el coste de atención de forma cuadrática, ya que la atención cross-chunk se aplica sobre un número reducido de vectores de fragmento.

El entrenamiento de este checkpoint se realizó con la receta DAPFAM: objetivo InfoNCE con temperatura 0,07, enmascaramiento de falsos negativos, 4 negativos proporcionados por la tarea más negativos in-batch, optimizador AdamW con schedule coseno, learning rate 1e-5, weight decay 1e-4, 15 épocas con validación cada 3, batch size 2 y precisión mixta de 16 bits. El checkpoint se inicializó con los pesos del modelo `reign-base-l3_gn-gte-large_val-selected` (entrenado en GoodWiki-Long) y se fine-tuneó en DAPFAM. El autor señala que el entrenamiento en precisión mixta no es bit-reproducible, por lo que un reentrenamiento no dará pesos idénticos.

## Capacidades

- Generación de embeddings densos para documentos largos (multi-fragmento) orientados a retrieval documento-a-documento.
- Agregación cross-chunk: el encoder REIGN combina representaciones de fragmentos de 512 tokens para producir un vector global L2-normalizado.
- Soporte de stride configurable en tiempo de inferencia para controlar el solapamiento entre fragmentos.
- Integración con la librería `reign` (instalable desde GitHub) que facilita la carga del checkpoint y la red guía.
- No es un modelo de generación de texto ni de razonamiento; su única función es producir embeddings para búsqueda semántica.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Retrieval de documentos largos en dominios técnicos: el modelo puede indexar patentes, informes técnicos o artículos científicos completos y recuperar los más relevantes para una consulta, gracias a su capacidad de procesar documentos de más de 512 tokens mediante fragmentación.
- Búsqueda semántica en corpus de patentes: aunque el fine-tuning no mejoró el rendimiento, el checkpoint zero-shot de GoodWiki-Long (del que deriva) sí es útil para este dominio; este checkpoint concreto sirve para reproducir el resultado negativo y comparar estrategias de fine-tuning.
- Evaluación de estrategias de fine-tuning en retrieval: investigadores pueden usar este modelo para estudiar por qué el fine-tuning con warm-start degrada el rendimiento y qué ajustes (learning rate, weight decay) podrían evitarlo.
- Benchmarking de arquitecturas de retrieval de contexto largo: el modelo sirve como referencia para comparar REIGN con otras aproximaciones (p. ej., embeddings por fragmentos sin agregación, o modelos con atención extendida).
- Reproducción de experimentos publicados: el checkpoint está disponible para verificar los resultados reportados en el paper de REIGN (Apéndice J) y para inspeccionar los pesos entrenados.
- Desarrollo de pipelines de retrieval con memoria eficiente: al ser un modelo pequeño (22M parámetros) combinado con una red guía congelada, puede desplegarse en entornos con recursos limitados para indexar colecciones de documentos largos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de nDCG@100 en la tarea DAPFAM (top-100 sobre el corpus FullText completo, con auto-coincidencias eliminadas). Estos valores corresponden al checkpoint publicado y se recogen en el Apéndice J del paper.

| Split | nDCG@100 |
|---|---|
| test | 33,06 |
| test_in | 38,10 |
| test_out | 5,09 |

El autor indica explícitamente que el fine-tuning no supera al zero-shot en esta tarea: el mejor resultado del barrido de hiperparámetros no mejora al backbone zero-shot, y el fine-tuning naive con lr 1e-5 lo degrada entre 0,4 y 1,5 puntos. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo (encoder REIGN + red guía GTE-large) tiene aproximadamente 357 millones de parámetros. En float32, el peso total ocupa unos 1,4 GB, pero con activaciones y overhead de inferencia se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., GTX 1660 Super, RTX 2060, RTX 3060) puede ejecutar el modelo. Para procesar lotes grandes o documentos muy largos, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, etc.).
- El modelo cabe en GPUs consumer de gama media; no requiere hardware de datacenter.
- Opciones de despliegue: la librería `reign` proporciona la clase `ReignBaselineEncoder` para inferencia en Python. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño reducido del encoder y la red guía congelada, se espera una latencia moderada, pero depende del número de fragmentos por documento y del hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de embeddings en la información proporcionada. El modelo base GTE-large (thenlper/gte-large) es el punto de referencia natural: REIGN añade el cross-chunk encoder sobre los embeddings de GTE-large, pero no se reportan resultados comparativos de GTE-large solo en DAPFAM. Otros modelos de embeddings de documentos largos (p. ej., OpenAI text-embedding-3-large, Cohere embed-v4) no se mencionan en la documentación, por lo que no se puede establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Resultado negativo documentado: el fine-tuning en DAPFAM no mejora el rendimiento zero-shot; el autor recomienda no usar este checkpoint para retrieval de patentes y preferir los checkpoints zero-shot de GoodWiki-Long.
- Solo soporta inglés: el modelo se entrenó exclusivamente con datos en inglés, por lo que no es adecuado para otros idiomas.
- No es un modelo de generación: no puede producir texto, solo embeddings; no sirve para tareas de chat, resumen o razonamiento.
- Régimen operativo restringido: el modelo está diseñado para entradas multi-fragmento (documentos largos). Para textos cortos (menores de 512 tokens), el cross-chunk encoder no aporta valor y se debe usar la red guía sola.
- Riesgo de alucinación: no aplica, al no ser generativo.
- Sesgos: al derivar de GTE-large y Wikipedia (vía GoodWiki), puede heredar sesgos presentes en esos datos, aunque no se han evaluado específicamente.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset `devrim/goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución y share-alike si se redistribuyen derivados de ese dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-large_dapfam-ftwarm-c512s512
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset GoodWiki-Long: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper (EMNLP 2026 Findings, to appear): *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*
