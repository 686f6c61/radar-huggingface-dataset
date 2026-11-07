# masahiroid/gte-reranker-modernbert-base-coreai

## Resumen

`masahiroid/gte-reranker-modernbert-base-coreai` es una conversión de formato del checkpoint `Alibaba-NLP/gte-reranker-modernbert-base`, un cross-encoder reranker basado en ModernBERT desarrollado por Alibaba-NLP. El modelo original resuelve el problema del re-ranking en pipelines de recuperación de información: recibe un par consulta-documento y devuelve un logit de relevancia que permite reordenar los candidatos recuperados por un retriever de primera fase (BM25, embeddings densos, etc.). La conversión la firma el usuario masahiroid y no introduce ningún ajuste fino nuevo: reproduce fielmente los pesos originales en formato Apple Core AI (`*.aimodel`) en F32.

La relevancia de esta ficha es acotada y muy específica: no es un modelo nuevo ni una mejora de calidad, sino un artefacto de despliegue para ejecutar el reranker en hardware Apple Silicon mediante el stack Core AI (`coreai-core==1.0.0b3`, `coreai-torch==0.4.3`). El checkpoint original es un encoder-only ModernBERT de tamaño base con una cabeza de clasificación mean-pooled que produce un logit crudo de relevancia. La conversión impone formas fijas y batch size 1, con truncado a 128 tokens compartidos entre consulta y documento, lo que limita el contexto efectivo respecto al checkpoint fuente.

El repo pesa 0,6 GB y se publicó el 7 de noviembre de 2026 sin descargas ni likes registrados. La validación numérica frente al checkpoint PyTorch original reporta una diferencia absoluta máxima de 1,9073486e-06 y una similitud coseno mínima de 1, lo que confirma que la conversión es numéricamente equivalente dentro de la precisión F32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder-only con cabeza de clasificación cross-encoder (mean pooling) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en el export Core AI (consulta y documento comparten el límite); el checkpoint fuente soporta contextos más largos, no expuestos en este export |
| Tipos de cuantización | F32 (baseline de precisión completa; no es cuantización de 4 bits) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 (pesos); MIT para el código de runtime y conversión |
| Formato de pesos | Apple Core AI (`*.aimodel`), F32; no es un paquete Core ML |
| Modelo base | Alibaba-NLP/gte-reranker-modernbert-base (revisión `f7481e6055501a30fb19d090657df9ec1f79ab2c`) |
| Tamaño del repo | 0,6 GB |
| Batch size | 1 (fijo) |
| Formas de entrada | `input_ids: [1, 128]`, `attention_mask: [1, 128]` |
| Runtime validado | macOS 27.2, `coreai-core==1.0.0b3` (GPU), exportado con `coreai-torch==0.4.3` |
| Entorno de conversión | PyTorch 2.14.1, Transformers 4.57.3, NumPy 1.26.4, coremltools 9.0, MLX 0.32.4, Python 3.14 |

## Arquitectura y entrenamiento

El modelo subyacente es un cross-encoder de la familia ModernBERT, un transformer encoder-only con atención bidireccional completa. La entrada es un par consulta-documento tokenizado conjuntamente y la salida es un único logit de relevancia producido por la cabeza de clasificación mean-pooled original, que se conserva intacta en la conversión. Al ser un cross-encoder, no genera embeddings reutilizables: hay que ejecutar el modelo una vez por cada par consulta-documento, lo que lo hace adecuado para re-ranking de un conjunto acotado de candidatos y no para búsqueda sobre corpus completos.

No hay entrenamiento nuevo en esta conversión. Los pesos provienen directamente del checkpoint `Alibaba-NLP/gte-reranker-modernbert-base` en la revisión indicada, y el autor declara explícitamente que no ha habido ajuste fino ni sustitución de checkpoint. La innovación técnica del artefacto es puramente de despliegue: exportación a formato Core AI con formas estáticas, validación numérica contra el original y empaquetado de utilidades de tokenización y conversión de formas (`inference.py`, `prepare.py`, `common.py`, `build.py`, `sources.json`, `provenance.json`). El autor no aporta datos sobre el corpus de entrenamiento original, número de tokens, composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card del checkpoint fuente y no está incluida en la documentación proporcionada.

## Capacidades

- Re-ranking de pares consulta-documento: devuelve un logit crudo donde valores más altos indican mayor relevancia.
- Puntuación de preferencia de ranking: útil para reordenar listas de candidatos recuperados por un retriever de primera fase.
- Manejo de pares relevantes e irrelevantes: la validación incluye casos de consulta-documento relevantes, irrelevantes y acuerdos de preferencia de ranking.
- Tokenización y conversión de formas incluidas: helpers que gestionan el truncado a 128 tokens y el padding.
- Ejecución en GPU sobre Apple Silicon mediante Core AI.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking. Es un modelo de scoring, no un modelo generativo.
- Capacidades multilingües: no disponibles en la información proporcionada para este export; la validación mencionada en la model card se centra en pruebas de GTE con pares en inglés.

## Casos de uso

- Re-ranking en pipelines RAG sobre macOS: tras recuperar los N candidatos con un índice vectorial o BM25, se puntúa cada par consulta-documento con el modelo y se reordena la lista antes de pasarla al generador. El límite de 128 tokens obliga a trabajar con fragmentos cortos, adecuado para pasajes de una o dos frases.
- Búsqueda documental en aplicaciones de escritorio para Apple Silicon: al ejecutarse en GPU vía Core AI con formas fijas y batch 1, encaja en apps nativas de macOS que necesitan re-ranking local sin depender de servicios en la nube.
- Filtrado de resultados en asistentes de soporte: dado un conjunto de artículos de ayuda recuperados, el modelo reordena y permite descartar por umbral de logit los que no responden a la consulta del usuario.
- Evaluación de calidad de recuperación en experimentos: sirve como juez de relevancia para medir precision@k o nDCG de un retriever, comparando el orden original con el reordenado.
- Deduplicación semántica de pasajes: puntuando pares de fragmentos se puede detectar cuasi-duplicados en un corpus pequeño antes de indexarlo.
- Prototipado rápido en local: scripts de Python con `snapshot_download` y `ConvertedModel` para validar una hipótesis de re-ranking en un Mac antes de invertir en infraestructura GPU dedicada.
- Verificación de conversiones: el propio artefacto sirve como referencia para quien necesite comprobar la equivalencia numérica de sus propios exports a Core AI, gracias a `validation.json` y a los vectores de validación en `.npz`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de equivalencia numérica frente al checkpoint PyTorch original: diferencia absoluta máxima de 1,9073486e-06 y similitud coseno mínima de 1. El autor declara explícitamente que no reclama mejoras de calidad de tarea, robustez ni velocidad de dispositivo.

## Requisitos de hardware

- VRAM: no disponible. El modelo se ejecuta en Apple Silicon mediante Core AI, no en GPU NVIDIA, por lo que la métrica de VRAM no aplica directamente.
- GPU recomendadas: cualquier Mac con Apple Silicon validado con macOS 27.2 y `coreai-core==1.0.0b3` en ejecución GPU. No se especifican modelos concretos de chip (M1, M2, M3, M4) en la documentación.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este export, que es específico de Core AI.
- Despliegue: exclusivamente mediante el runtime Core AI con `coreai-core==1.0.0b3` y `coreai-torch==0.4.3`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con el formato GGUF.
- Latencia y throughput: no disponibles. El batch size fijo de 1 y la forma estática de 128 tokens implican que el throughput vendrá determinado por el número de pares a puntuar en serie; no se han publicado cifras.
- Almacenamiento: 0,6 GB de repo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masahiroid/gte-reranker-modernbert-base-coreai | ModernBERT cross-encoder | 128 tokens (export) | Core AI F32 | Apache-2.0 (pesos) / MIT (código) | Hugging Face, runtime Core AI |
| Alibaba-NLP/gte-reranker-modernbert-base | ModernBERT cross-encoder | Contexto original del checkpoint fuente (no expuesto en el export) | Safetensors PyTorch | Apache-2.0 | Hugging Face |
| masahiroid/gte-reranker-modernbert-base-coreml | ModernBERT cross-encoder | no disponible | Core ML | Apache-2.0 (pesos) / MIT (código) | Hugging Face |

Los tres artefactos comparten los mismos pesos; las diferencias son de formato de despliegue y de límite de contexto expuesto. No se dispone de datos de benchmarks comparativos entre ellos ni frente a otros rerankers de la misma categoría.

## Limitaciones y advertencias

- El export fija el contexto en 128 tokens compartidos entre consulta y documento; pasajes más largos se truncan y pierden información, lo que puede degradar la precisión del re-ranking.
- Batch size fijo de 1: no hay procesamiento por lotes, lo que limita el throughput en escenarios de alto volumen.
- Solo funciona en Apple Silicon con macOS 27.2 y las versiones exactas del runtime validadas; no es portable a otros entornos sin reconversión.
- No es un paquete Core ML; confundir ambos formatos provocará fallos de carga.
- El helper síncrono está pensado para scripts independientes; en un bucle de eventos asíncrono existente hay que adaptar la corrutina `predict` en lugar de anidar `asyncio.run`.
- El modelo de datos se guarda sin checkpoints pickle, pero la model card recomienda revisar el código Python incluido antes de ejecutarlo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el logit de relevancia puede ser poco fiable fuera de la distribución de entrenamiento del checkpoint original; no se han publicado evaluaciones de robustez para este export.
- Sesgos: no disponibles en la información proporcionada.
- Idiomas: no disponibles; la validación documentada para GTE se limita a pares en inglés.
- Uso comercial: permitido por Apache-2.0 para los pesos y MIT para el código, con la obligación de atribución a los autores del checkpoint original.
- El autor no reclama mejoras de calidad, robustez ni velocidad; es una conversión de formato, no una optimización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/gte-reranker-modernbert-base-coreai
- Checkpoint original: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- Revisión del checkpoint fuente: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base/tree/f7481e6055501a30fb19d090657df9ec1f79ab2c
- Conversión a Core ML: https://huggingface.co/masahiroid/gte-reranker-modernbert-base-coreml
- Ficha de terceros sobre el modelo original: https://huggingpeers.co/models/Alibaba-NLP/gte-reranker-modernbert-base
