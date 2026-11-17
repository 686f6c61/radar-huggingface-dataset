# rhnfzl/modernbert-base-ner-conll03-english-onnx

## Resumen

`rhnfzl/modernbert-base-ner-conll03-english-onnx` es una exportación a formato ONNX del modelo `MatteoFasulo/ModernBERT-base-NER`, un sistema de reconocimiento de entidades nombradas (NER) basado en la arquitectura ModernBERT. Lo publica el desarrollador rhnfzl como componente del proyecto SqueakyCleanText, una herramienta de limpieza y anonimización de texto. El modelo etiqueta personas (PER), organizaciones (ORG), localizaciones (LOC) y entidades misceláneas (MISC) en texto en inglés siguiendo el esquema de anotación de CoNLL-2003.

La relevancia de esta ficha no reside en una innovación algorítmica, sino en el empaquetado: se trata de una conversión de formato pura (PyTorch a ONNX, FP32, opset 18, IR version 8) que elimina la dependencia de PyTorch en producción y permite inferencia sobre `onnxruntime` en CPU. El modelo base ModernBERT aporta una ventana de contexto de hasta 8192 tokens, muy superior a los 512 tokens de BERT clásico, lo que resulta útil para documentos largos en tareas de extracción de entidades.

El modelo es monolingüe (inglés), tiene licencia Apache 2.0 y un tamaño de repositorio de 0,6 GB. No incluye cuantización ni optimización de grafo: los pesos se exportan en FP32. Su uso previsto es la integración en pipelines de preprocesado de texto y anonimización, no como modelo generativo ni de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, base) |
| Parametros totales | no disponible (el modelo base ModernBERT-base se sitúa habitualmente en torno a 149 M; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (indicado en la model card: entradas de más de 8192 tokens deben dividirse) |
| Tipos de cuantizacion | ninguno incluido; pesos en FP32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, 599 MB), opset 18, IR version 8, productor `pytorch 2.10.0`; incluye `config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia ModernBERT, exportado desde el checkpoint `MatteoFasulo/ModernBERT-base-NER` (revisión inferida `24ea98d1e7133adf251ebfb61f3589934dbc9d1a`). La exportación se realizó con `optimum.exporters.onnx` bajo la tarea `token-classification` y `--device cpu` (para evitar errores de FlashAttention en ModernBERT), sin pasos de cuantización ni de optimización de grafo. La entrada del grafo son `input_ids` y `attention_mask`; la salida son `logits`, una fila por token.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO), más allá de que el modelo derivado se asocia al dataset `lhoestq/conll2003` y emplea su esquema de etiquetas: `O`, `B-PER`, `I-PER`, `B-ORG`, `I-ORG`, `B-LOC`, `I-LOC`, `B-MISC`, `I-MISC`. La model card incluye una comprobación de paridad realizada el 2026-11-17 sobre 3 frases y 50 tokens: IDs de token idénticos, `id2label` idéntico, misma etiqueta top-1 en 50/50 tokens y diferencia máxima absoluta de logits de 3,5e-05. Esta prueba valida la conversión de formato, no la precisión del modelo.

## Capacidades

- Reconocimiento de entidades nombradas en inglés con cuatro tipos: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC).
- Etiquetado a nivel de subword token (esquema BIO); el agrupamiento en entidades completas debe realizarse aparte o mediante SqueakyCleanText.
- Procesamiento de entradas de hasta 8192 tokens, apto para documentos largos sin truncamiento agresivo.
- Inferencia en CPU mediante `onnxruntime` sin dependencia de PyTorch.
- Integración como backend NER configurable en SqueakyCleanText (clave `ENGLISH` en `ner_models`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de clasificación de tokens.

## Casos de uso

- Anonimización y redacción de PII en pipelines de datos: el modelo detecta nombres de personas y organizaciones para sustituirlos por marcadores (`<PERSON>`, `<ORGANISATION>`) antes de almacenar o compartir texto, tal como hace SqueakyCleanText con `lm_text`.
- Preprocesado para entrenamiento de LLM: eliminación o enmascaramiento de entidades en corpus ingleses para reducir fuga de datos personales en datasets de preentrenamiento o ajuste fino.
- Extracción de entidades en documentos largos: gracias a la ventana de 8192 tokens, permite procesar informes, contratos o artículos sin fragmentar en ventanas de 512 tokens, reduciendo errores en fronteras de entidad.
- Enriquecimiento de bases de conocimiento: extracción de organizaciones y localizaciones de texto periodístico o técnico para poblar índices de búsqueda o grafos de entidades.
- Moderación y cumplimiento normativo: detección de menciones a personas y organizaciones en logs o tickets de soporte para auditoría y trazabilidad.
- Despliegue en entornos sin GPU: al ser ONNX FP32 sobre CPU, encaja en servicios contenerizados de bajo coste o en entornos edge donde no se dispone de CUDA.
- Componente en ensembles multilingües de SqueakyCleanText: se ejecuta también dentro de los ensembles de neerlandés, alemán y español y como fallback para otros idiomas, aunque su entrenamiento es solo en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe ninguna métrica de precisión para este modelo en los benchmarks de SqueakyCleanText (revisados hasta la versión 0.10.0) y remite a la model card del modelo base para sus puntuaciones. La única métrica publicada es la comprobación de paridad de formato (diferencia máxima de logits de 3,5e-05 sobre 50 tokens), que no constituye una medida de calidad.

## Requisitos de hardware

- VRAM: no requiere GPU; el grafo está pensado para `CPUExecutionProvider` de onnxruntime. En GPU, el peso FP32 de 599 MB implica un consumo mínimo (inferior a 2 GB incluyendo buffers), aunque no se documenta soporte GPU específico.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU con soporte de onnxruntime serviría, pero el caso de uso declarado es CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo si se opta por ejecución en GPU; el cuello de botella es la CPU en el escenario por defecto.
- Despliegue: `onnxruntime` (Python), SqueakyCleanText (`pip install squeakycleantext`), y cualquier runtime compatible con ONNX. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de tokens.
- Latencia y throughput: no disponibles en la información proporcionada. La longitud máxima de 8192 tokens condiciona el coste de atención; entradas superiores deben dividirse manualmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| rhnfzl/modernbert-base-ner-conll03-english-onnx | no disponible (base ModernBERT-base) | 8192 | NER inglés (CoNLL-2003) | Apache 2.0 | ONNX FP32 |
| MatteoFasulo/ModernBERT-base-NER (modelo base) | no disponible | 8192 | NER inglés (CoNLL-2003) | no disponible en la informacion proporcionada | PyTorch (safetensors) |
| rhnfzl/wikineural-multilingual-ner-onnx | no disponible | no disponible | NER multilingüe | CC BY-NC-SA 4.0 (solo investigación no comercial) | ONNX |
| BERT-base NER (referencia CoNLL-2003) | ~110 M | 512 | NER inglés (CoNLL-2003) | Apache 2.0 (según checkpoint) | PyTorch / ONNX |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de métricas de precisión para establecer una comparación cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Solo inglés: aunque SqueakyCleanText lo ejecute en ensembles de otros idiomas y como fallback, el modelo no fue entrenado para neerlandés, alemán, español ni otras lenguas, por lo que su precisión fuera del inglés no está garantizada.
- Es una conversión de formato: hereda las mismas carencias, sesgos y errores que el modelo base `MatteoFasulo/ModernBERT-base-NER`; la exportación no corrige ni mitiga ninguno de ellos.
- Sin métricas de precisión propias: no hay evaluación publicada de este artefacto ONNX; la paridad de logits no equivale a calidad de extracción.
- Riesgo de alucinación de entidades: como todo modelo NER, puede etiquetar fragmentos como entidades cuando no lo son o perder entidades en textos con dominio muy distinto a CoNLL-2003 (noticias).
- Límite de contexto: entradas de más de 8192 tokens deben dividirse manualmente; la división puede cortar entidades y degradar el resultado.
- Etiquetado por subword: la salida es una etiqueta por token; sin un paso de agrupación (por ejemplo, el que ofrece SqueakyCleanText) no se obtienen entidades completas.
- Dependencia de revisión: la model card recomienda fijar la revisión `cda3901bace00f5fa972111a66df98453778561a` para evitar cambios inesperados en el repositorio.
- Licencia Apache 2.0 permite uso comercial de este artefacto, pero conviene verificar la licencia del modelo base y, si se usa junto al modelo multilingüe de SqueakyCleanText, tener en cuenta que este último es CC BY-NC-SA 4.0 y restringe el uso comercial.
- Sin cuantización ni optimización: el tamaño FP32 de 599 MB y la ausencia de grafos optimizados pueden penalizar el throughput en CPU frente a variantes cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhnfzl/modernbert-base-ner-conll03-english-onnx
- Modelo base: https://huggingface.co/MatteoFasulo/ModernBERT-base-NER
- Revisión del modelo base: https://huggingface.co/MatteoFasulo/ModernBERT-base-NER/tree/24ea98d1e7133adf251ebfb61f3589934dbc9d1a
- Proyecto SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText
- Script de exportación ONNX: https://github.com/rhnfzl/SqueakyCleanText/blob/9480bc29c9595ab8377c4043a2f555dc5ed965b3/scripts/export_onnx_models.py
- Documentación de licencias de backends NER: https://github.com/rhnfzl/SqueakyCleanText/blob/main/docs/NER_BACKENDS.md#model-licences
- Resultados de benchmarks de SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText/tree/main/benchmarks/results
- Modelo multilingüe complementario: https://huggingface.co/rhnfzl/wikineural-multilingual-ner-onnx
- Dataset CoNLL-2003: https://huggingface.co/datasets/lhoestq/conll2003
