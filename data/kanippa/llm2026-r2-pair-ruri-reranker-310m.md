# kanippa/llm2026-r2-pair-ruri-reranker-310m

## Resumen

kanippa/llm2026-r2-pair-ruri-reranker-310m es un modelo de reranking (clasificación de pares consulta-documento) en japonés, obtenido mediante fine-tuning con LoRA sobre cl-nagoya/ruri-v3-reranker-310m y posterior fusión de los pesos del adaptador en la arquitectura base. Lo desarrolla el usuario kanippa dentro de un ciclo de entrenamiento etiquetado como "Cycle 4", variante `R2_PAIR`, y se publica bajo licencia Apache 2.0.

El modelo resuelve la segunda fase del pipeline clásico de recuperación de información: dada una consulta y un pasaje candidato, asigna una puntuación de relevancia para reordenar los resultados devueltos por un retriever de primera fase. Con 315.203.329 parámetros (aproximadamente 310M, coherente con su nombre) y arquitectura ModernBERT, está diseñado para ser ligero y desplegable en hardware modesto, a diferencia de los rerankers basados en LLM de mayor tamaño.

Su relevancia es acotada pero concreta: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en la información disponible, y especializado exclusivamente en japonés. Resulta útil como referencia para quienes trabajen en reranking japonés con arquitecturas encoder eficientes y quieran reproducir o comparar el pipeline de entrenamiento descrito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), cabeza de clasificación de secuencias |
| Parámetros totales | 315.203.329 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT con cabeza de `SequenceClassification`, sin cambios arquitectónicos respecto al modelo base cl-nagoya/ruri-v3-reranker-310m (revisión `2c23c61a90583f0348880a2ffb2d7fd29e2d14f1`). El fine-tuning se realizó con LoRA y los pesos del adaptador se fusionaron directamente en la arquitectura base, de modo que la exportación final no contiene estados de entrenamiento, adaptadores ni datos de desarrollo. El SHA256 de los pesos fusionados es `18b1b7dd7e2ae67b8aaf2e561bef7e1b24dda46830593d3f83d97e4303a4d622`.

Los datos de entrenamiento corresponden a la variante `R2_PAIR` del Cycle 4: un conjunto `pair_train` con separación estricta de artículos y fuentes, compuesto por 868 preguntas encadenadas de cl-nagoya/auto-wiki-qa más los splits de entrenamiento de JaQuAD y JSQuAD. Los conjuntos de evaluación, mock y producción se excluyeron explícitamente. El entrenamiento se inicializó desde el Cycle 3 R2. No se documentan en la información disponible el número total de tokens vistos, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (poco probables en un reranker de este tipo).

## Capacidades

- Clasificación de pares consulta-documento para reranking en pipelines de recuperación de información.
- Puntuación de relevancia sobre pasajes candidatos en japonés.
- Reordenación de resultados de un retriever de primera fase (BM25, embeddings densos, híbridos).
- Procesamiento de pares de texto con arquitectura encoder, adecuada para inferencia de baja latencia.
- Especialización monolingüe en japonés.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Reranking en buscadores corporativos japoneses: el modelo recibe la consulta del usuario y los N documentos recuperados por un índice BM25 o denso, y devuelve una puntuación que permite reordenar los resultados antes de presentarlos.
- Búsqueda en documentación técnica interna: integrado como segunda fase sobre un retriever ligero, mejora la precisión en consultas cortas y ambiguas en japonés sin requerir un LLM generativo.
- Preguntas sobre bases de conocimiento tipo wiki: entrenado parcialmente con datos derivados de auto-wiki-qa, encaja en pipelines de QA extractivo donde el reranker filtra los pasajes que luego consume un modelo de lectura.
- Filtrado de candidatos en sistemas RAG: reduce el número de fragmentos enviados al generador, lo que disminuye coste y latencia del LLM final.
- Evaluación comparativa de retrievers: al ser un reranker fijo, permite medir la calidad de distintos retrievers de primera fase manteniendo constante la etapa de reordenación.
- Búsqueda en datasets de lectura comprensiva japoneses: su entrenamiento con JaQuAD y JSQuAD lo hace adecuado para experimentos de recuperación sobre corpus de QA académicos.
- Prototipado en investigación: con 310M parámetros y licencia Apache 2.0, sirve como baseline reproducible para estudiar estrategias de fine-tuning con LoRA en rerankers japoneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB solo para pesos (315M parámetros × 2 bytes), más overhead de activaciones y batch; en la práctica, menos de 2 GB para batches pequeños.
- VRAM estimada en fp32: aproximadamente 1,3 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para alto throughput, A10G, L4 o A100 con batching dinámico.
- Cabe holgadamente en GPU de consumo: RTX 3060/4060/4090, e incluso en iGPU con suficiente memoria compartida para batches de tamaño 1.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForSequenceClassification`, Text Embeddings Inference (TEI) para servir rerankers, o exportación a ONNX Runtime. No se documentan pesos GGUF para llama.cpp ni soporte explícito en Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kanippa/llm2026-r2-pair-ruri-reranker-310m | 315M | no disponible | ja | Apache 2.0 | Fine-tuning LoRA fusionado sobre ruri-v3-reranker-310m; sin benchmarks publicados |
| cl-nagoya/ruri-v3-reranker-310m | ~310M | no disponible | ja | no disponible en la información | Modelo base del que deriva; referencia directa de comparación |
| bge-reranker-v2-m3 | no disponible en la información | no disponible | multilingüe | no disponible en la información | Reranker multilingüe de referencia de la familia BGE; datos no verificados en esta ficha |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se han publicado métricas de rendimiento para este modelo ni se dispone de especificaciones verificadas de los competidores en el material consultado.

## Limitaciones y advertencias

- Modelo monolingüe en japonés: no se ha entrenado ni evaluado para otros idiomas, por lo que su uso en consultas en castellano u otras lenguas no está respaldado.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas, lo que impide justificar su adopción en producción sin una evaluación propia.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Riesgo de sobreajuste a los dominios de entrenamiento (wiki QA, JaQuAD, JSQuAD): el rendimiento puede degradarse en dominios muy distintos como texto legal, médico o conversacional.
- Al ser un reranker y no un generador, no produce respuestas: solo puntuaciones de relevancia; requiere un pipeline completo con retriever y, si se desea respuesta, un modelo generativo.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus japoneses de Wikipedia y QA académico puede heredar los sesgos de cobertura y representación de dichas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación publicada traslada al integrador toda la responsabilidad de validación.
- La longitud máxima de contexto no está documentada; debe consultarse la configuración del modelo base antes de usarlo con pasajes largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanippa/llm2026-r2-pair-ruri-reranker-310m
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Dataset de preguntas encadenadas: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JaQuAD: no disponible enlace directo en la información proporcionada
- Dataset JSQuAD: no disponible enlace directo en la información proporcionada
