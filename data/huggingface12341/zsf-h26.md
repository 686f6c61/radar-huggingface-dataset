# huggingface12341/zsf-h26

## Resumen

zsf-h26 es un modelo de 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge de dos modelos base: `vllm-sr/d3-flash` y `newsbang/adjudex-9b-v2`, y está etiquetado con la arquitectura `qwen3_5`, lo que sugiere que ambos progenitores derivan de la familia Qwen 3.5. El pipeline declarado es `feature-extraction` y el modelo incluye la etiqueta `decision-model`, lo que apunta a un uso orientado a extracción de representaciones y toma de decisiones más que a generación de texto conversacional pura.

El modelo se distribuye en formato safetensors con código personalizado (`custom_code`), requiere `transformers` para su carga y está marcado como compatible con endpoints. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales. El repositorio ocupa 16,8 GB, coherente con pesos en precisión de 16 bits para un modelo de este tamaño.

Es relevante ahora porque los merges de modelos especializados (aquí uno orientado a decisión y otro presumiblemente a razonamiento jurídico o de adjudicación, dado el nombre `adjudex`) permiten combinar capacidades sin reentrenar desde cero. No obstante, la información pública es muy limitada: cero descargas, cero likes y ausencia de datos sobre idiomas, contexto o benchmarks. El acceso está restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelos base | vllm-sr/d3-flash, newsbang/adjudex-9b-v2 |
| Tamano del repositorio | 16,8 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5`, lo que indica una familia de transformers decoder-only con las innovaciones habituales de Qwen 3.5 (no se dispone de detalles específicos sobre atención lineal, decodificación especulativa u otras optimizaciones en la información proporcionada). El modelo es un merge de dos checkpoints: `vllm-sr/d3-flash` y `newsbang/adjudex-9b-v2`. El proceso de merge no está documentado públicamente en la ficha; los merges típicos combinan pesos mediante interpolación lineal, SLERP o técnicas similares, pero no se especifica el método ni los ratios empleados.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o instruction tuning posteriores al merge. El tag `decision-model` y el nombre del modelo base `adjudex` sugieren un enfoque hacia tareas de adjudicación o decisión, pero se desconoce si esto implica un entrenamiento específico o es solo herencia del progenitor. La etiqueta `custom_code` indica que la carga requiere `trust_remote_code=True` y que el repositorio incluye módulos Python propios, cuyo contenido no está disponible en la información proporcionada.

## Capacidades

- Extracción de características y representaciones (pipeline declarado: `feature-extraction`).
- Toma de decisiones y adjudicación, según el tag `decision-model` y el modelo base `adjudex-9b-v2`.
- Generación de texto y razonamiento: presumible por la arquitectura Qwen 3.5, aunque no confirmado explícitamente en la ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para sistemas de recuperación (RAG): el pipeline `feature-extraction` permite usar el modelo para generar representaciones vectoriales de documentos y consultas, integrándolo en bases vectoriales para búsqueda semántica.
- Clasificación y adjudicación de casos: dado el tag `decision-model` y la herencia de `adjudex-9b-v2`, puede emplearse en pipelines de decisión automatizada donde se requiera puntuar o clasificar instancias según criterios predefinidos.
- Reranking en pipelines de búsqueda: las representaciones del modelo pueden alimentar un reranker que reordene candidatos recuperados por un retriever inicial, mejorando la precisión del top-k.
- Sistemas de moderación o filtrado: la extracción de features permite entrenar cabezas de clasificación ligeras sobre las representaciones del modelo para detectar contenido no deseado.
- Investigación en merges de modelos: al ser un merge documentado de dos checkpoints, sirve como caso de estudio para evaluar el impacto de técnicas de fusión en tareas de decisión y extracción.
- Prototipado de asistentes especializados: si el modelo conserva capacidades generativas de Qwen 3.5, puede usarse como base para experimentar en dominios de adjudicación, aunque requeriría validación exhaustiva antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 2-6 GB adicionales según longitud de contexto y batch).
- VRAM estimada en cuantización 8 bits: alrededor de 8,4 GB para pesos.
- VRAM estimada en cuantización 4 bits: alrededor de 4,2 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16 y contexto limitado, o en GPUs de 12-16 GB con cuantización 8/4 bits (si se generan pesos GGUF, no disponibles en el repo).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM y TGI si el código personalizado es compatible; llama.cpp/Ollama solo si se publican versiones GGUF (no disponibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsf-h26 | 8,4 B | no disponible | Apache 2.0 | Gated en HF | Merge de d3-flash y adjudex-9b-v2 |
| Qwen3.5 (tamano similar) | ~8 B (segun variante) | no disponible en esta ficha | Apache 2.0 (segun variante) | Publico | Arquitectura base presumible |
| newsbang/adjudex-9b-v2 | ~9 B | no disponible | no disponible | HF | Progenitor del merge |
| vllm-sr/d3-flash | no disponible | no disponible | no disponible | HF | Progenitor del merge |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar.
- Información pública mínima: cero descargas y cero likes, sin documentación de entrenamiento, datos, idiomas ni evaluación.
- Riesgo de alucinación: no evaluado; al ser un merge sin card detallada, no hay garantías sobre calibración.
- Sesgos: desconocidos, al no documentarse la composición del dataset de los modelos base.
- Limitaciones de contexto e idioma: no disponibles; no se puede asumir multilingüismo sin confirmación.
- `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código Python del autor del repositorio; auditar antes de usar en producción.
- Licencia Apache 2.0 permite uso comercial, pero las obligaciones de los modelos base (especialmente `adjudex-9b-v2`, cuya licencia no se detalla) podrían imponer condiciones adicionales; verificar las licencias de los progenitores.
- Sin benchmarks ni validación independiente: no apto para producción sin evaluación propia.
- Fecha de creación futura (2026-11-24) en los metadatos: posible artefacto o error del repositorio; conviene verificar la integridad de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsf-h26
- Modelo base 1: https://huggingface.co/vllm-sr/d3-flash
- Modelo base 2: https://huggingface.co/newsbang/adjudex-9b-v2
