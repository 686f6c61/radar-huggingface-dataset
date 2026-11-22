# klpeng/uce-gemini-80k

## Resumen

UCE Gemini 80K es un codificador disperso (sparse encoder) desarrollado por el usuario klpeng que transforma embeddings de texto de Gemini en activaciones de conceptos interpretables. Concretamente, toma vectores de 3072 dimensiones generados por `gemini-embedding-2-preview` (tipo de tarea `RETRIEVAL_DOCUMENT`) y los proyecta sobre un diccionario de 80.513 conceptos etiquetados, seleccionando las 128 puntuaciones mas altas y produciendo como maximo 128 activaciones no nulas por texto. El modelo no procesa texto directamente: requiere que el usuario genere los embeddings por separado.

El modelo cuenta con 247.339.008 parametros y se distribuye en formato safetensors con pesos en float32 (el autor indica explicitamente que debe mantenerse en float32). Su proposito es la interpretabilidad y el analisis de conceptos: permite inspeccionar que conceptos activa un texto segun la representacion semantica de Gemini, con metadatos de fidelidad (f1, precision, recall) y prevalencias de corpus cuando estan disponibles.

Es relevante para investigadores que necesitan trazas interpretables y dispersas sobre embeddings de un modelo propietario, sin depender de pesos neuronales pesados para consultar el diccionario de conceptos. La model card no especifica licencia, idiomas soportados ni pipeline, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador disperso (sparse encoder) sobre embeddings; tag `gemini_uce`; sin detalle de capas en la model card |
| Parametros totales | 247.339.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo consume embeddings, no tokens de texto) |
| Tipos de cuantizacion | no disponible; el autor indica mantener float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch); pesos en float32 |
| Dimension de entrada | 3072 (embeddings de `gemini-embedding-2-preview`, tarea `RETRIEVAL_DOCUMENT`) |
| Numero de conceptos | 80.513 |
| Activaciones por texto | hasta 128 no nulas (top-128) |
| Formato de salida | matriz dispersa SciPy CSR de forma `(N, 80513)` |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

La model card describe un codificador que mapea embeddings de Gemini a 80.513 activaciones de conceptos etiquetados y aplica una seleccion top-128 sobre las puntuaciones, generando una representacion dispersa de como maximo 128 valores no nulos por texto. La entrada debe ser un array NumPy de forma `(N, 3072)` con embeddings de `gemini-embedding-2-preview` usando el tipo de tarea `RETRIEVAL_DOCUMENT`, sin normalizacion unitaria adicional. El modelo se ejecuta en float32 y admite `device="cuda"` para GPU NVIDIA.

No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de tokens, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona un "Gemini teacher corpus" historico del que provienen las prevalencias de conceptos, pero aclara que esas prevalencias no se miden sobre las salidas del codificador podado. El paquete incluye metadatos de fidelidad por concepto (campos `f1`, `precision`, `recall`, con valor `None` cuando no estan definidos) y campos de prevalencia como `n_corpus_rows`, `count_gt_0p05`, `prevalence_gt_0p05` y `prevalence_gt_0p05_upper_99`. La innovacion principal es la separacion entre generacion de embeddings (externa, via API de Gemini) y proyeccion interpretable local, junto con la posibilidad de cargar solo el diccionario de conceptos sin pesos neuronales ni dependencias de PyTorch, Transformers, SciPy o pandas.

## Capacidades

- Proyeccion de embeddings de Gemini (3072 dimensiones) a 80.513 conceptos etiquetados.
- Seleccion top-128 de conceptos por texto, con salida en matriz dispersa CSR.
- Explicacion de activaciones mediante `model.explain(row, top_n=10)`, que devuelve `concept_id`, `label` y `activation` ordenados por activacion decreciente.
- Carga del diccionario de conceptos de forma independiente a los pesos (`load_concept_dict`), con soporte de `revision`, `cache_dir` y `local_files_only`.
- Metadatos de fidelidad por concepto (f1, precision, recall) cuando estan disponibles.
- Metadatos de prevalencia de corpus opcionales (`include_prevalence=True`).
- Procesamiento por lotes con `encode(embeddings, batch_size=64)` y streaming con `encode_iter` para no acumular toda la salida en memoria.
- Ejecucion en CPU o GPU NVIDIA (`device="cuda"`).
- Exportacion del diccionario a tablas pandas/CSV por parte del usuario (pandas se instala aparte).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un codificador de conceptos, no un modelo generativo.

## Casos de uso

- Analisis de interpretabilidad de embeddings: dado un corpus ya embebido con `gemini-embedding-2-preview`, el modelo proyecta cada vector a conceptos activos y permite estudiar que representaciones semanticas captura Gemini en dominios concretos, usando `explain` para inspeccionar las activaciones principales.
- Auditoria de sesgos conceptuales: filtrando etiquetas por terminos sensibles (por ejemplo, `"democracy"` en `concept_dict`) se pueden medir tasas de activacion de conceptos asociados a grupos o temas y detectar patrones sistematicos en el corpus.
- Etiquetado debil y enriquecimiento de documentos: las activaciones dispersas sirven como features interpretables para clasificacion, clustering o busqueda semantica sin entrenar un modelo adicional, aprovechando la seleccion top-128 por documento.
- Construccion de taxonomias y exploracion de vocabulario: el diccionario de 80.513 etiquetas con fidelidad y prevalencia permite buscar conceptos por subcadena y generar tablas CSV para revision manual o curacion.
- Monitorizacion de pipelines de retrieval: al usar la misma tarea `RETRIEVAL_DOCUMENT`, se pueden comparar las activaciones de consultas y documentos para diagnosticar desalineaciones en sistemas RAG basados en Gemini.
- Investigacion en representaciones dispersas: el modelo sirve como caso de estudio de codificadores sparse top-k sobre embeddings de un modelo propietario, con metadatos de fidelidad para evaluar la calidad de cada concepto.
- Procesamiento de grandes volumenes en streaming: `encode_iter` permite recorrer datasets que no caben en memoria manteniendo la salida dispersa por lotes, util para analisis por lotes en CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 1,2 GB y los pesos son 247.339.008 parametros en float32 (aproximadamente 0,99 GB solo en pesos, mas overhead de activaciones y del diccionario de 80.513 conceptos).
- GPU recomendadas: no especificadas; el autor solo indica `device="cuda"` para GPU NVIDIA.
- Cabe en GPU consumer: previsiblemente si por tamano de pesos, pero no hay confirmacion ni lista de modelos concretos en la informacion disponible.
- Opciones de despliegue: paquete Python propio (`gemini_uce.GeminiUCE`) con dependencias en `requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de codificador).
- Latencia y throughput: no disponibles.
- Requisito externo: los embeddings de entrada deben generarse aparte con la API de Gemini (SDK `google-genai` y variable `GEMINI_API_KEY` en el ejemplo de la model card).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (codificadores sparse de conceptos sobre embeddings) ni datos de rendimiento para establecer una comparacion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo proyecta embeddings a conceptos.
- Requiere generar los embeddings con `gemini-embedding-2-preview` y la tarea `RETRIEVAL_DOCUMENT`; usar otra tarea o modelo de embeddings invalida las activaciones.
- No aplicar normalizacion unitaria adicional a los embeddings de entrada, segun la model card.
- Debe mantenerse en float32; no se documentan opciones de cuantizacion.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; el comportamiento multilingue depende del modelo de embeddings subyacente y no esta documentado.
- Las prevalencias corresponden al corpus docente historico de Gemini, no a las salidas del codificador podado; no deben interpretarse como tasas medidas de este modelo.
- Los campos de fidelidad pueden ser `None` o estar ausentes; no hay garantia de metricas por concepto.
- Riesgo de conceptos espurios o etiquetas ambiguas en un diccionario de 80.513 entradas; se recomienda validacion manual en dominios sensibles.
- Para reutilizar activaciones cacheadas hay que fijar el commit exacto del Hub; cambios de revision pueden alterar el diccionario.
- El ejemplo de uso completo requiere una clave de API de Gemini, lo que introduce dependencia de un servicio externo y posibles costes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klpeng/uce-gemini-80k
- SDK de Google GenAI (usado en el ejemplo de la model card): https://github.com/googleapis/python-genai
