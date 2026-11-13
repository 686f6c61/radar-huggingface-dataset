# softandsweet/sentence-transformers-all-minilm-l6-v2-rngd-fxbx

## Resumen

`softandsweet/sentence-transformers-all-minilm-l6-v2-rngd-fxbx` es una adaptación del sentence encoder `sentence-transformers/all-MiniLM-L6-v2` orientada a la ejecución sobre aceleradores NPU de Furiosa (FuriosaAI), mediante su stack Furiosa Torch/TCC. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: pesos y utilidades para ejecutar el encoder MiniLM en hardware NPU con un pipeline de inferencia concreto (batch fijo de 1, entrada de hasta 16 tokens, precisión BF16).

El modelo base, MiniLM-L6-v2, es un transformer de 6 capas y unos 22,7 millones de parámetros que produce embeddings de frases de 384 dimensiones, ampliamente utilizado en búsqueda semántica, clustering y deduplicación por su bajo coste computacional. Esta variante conserva esa función (generación de embeddings) pero la encapsula en un flujo específico: la NPU produce los estados ocultos por token y el host aplica el mean pooling con máscara y la normalización L2.

El interés de esta ficha es limitado para la mayoría de desarrolladores: el repositorio tiene 0 descargas y 0 likes, el tamaño del repositorio es de 0,0 GB (los pesos se distribuyen aparte, en un `weights.tar`), la model card está redactada en coreano y no se publican benchmarks ni detalles de entrenamiento. Es relevante únicamente para quien necesite replicar exactamente este entorno de inferencia en NPU Furiosa con las versiones de SDK indicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, 6 capas) adaptado a NPU Furiosa |
| Parámetros totales | no disponible (el modelo base MiniLM-L6-v2 tiene ~22,7 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 tokens (entrada fija según la model card) |
| Tipos de cuantización | BF16 (precisión indicada en la model card); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se distribuyen en `weights.tar`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el encoder MiniLM-L6-v2 de sentence-transformers: un transformer de 6 capas que genera embeddings de frases de 384 dimensiones, habitualmente mediante mean pooling sobre los estados ocultos y normalización L2. En esta variante, la NPU de Furiosa ejecuta el forward del encoder en BF16 y produce los estados ocultos por token; el pooling con máscara y la normalización L2 se aplican en el host (CPU).

No se proporciona información sobre el entrenamiento: no se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO o fine-tuning adicional. La model card describe exclusivamente el proceso de instalación, descarga y verificación del artefacto, e indica que el checkpoint original es `sentence-transformers/all-MiniLM-L6-v2` (revisión `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`). La validación reportada consiste en 8 reejecuciones en un proceso nuevo en el "servidor 25", con tolerancias frente a CPU de atol 0,03 y rtol 0,02, sin fallbacks a CPU ni recompilaciones del SDK, y comparación de los estados ocultos de dos frases reales contra la referencia CPU.

## Capacidades

- Generación de embeddings de frases (sentence encoding) para similitud semántica, búsqueda y clustering.
- Inferencia en NPU Furiosa mediante Furiosa Torch/TCC 2026.4.0, con PyTorch 2.10.0+cpu en el entorno SDK.
- Procesamiento por lotes con batch fijo de 1 y entradas de hasta 16 tokens.
- Mean pooling con máscara y normalización L2 aplicados en el host.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se documenta un modo "thinking" ni capacidades multimodales.

## Casos de uso

- Búsqueda semántica de cadenas cortas: útil para indexar y comparar títulos, etiquetas o consultas de hasta 16 tokens, donde el coste del encoder es mínimo y la NPU puede liberar CPU.
- Deduplicación de registros: comparar embeddings de campos cortos (nombres de producto, cabeceras) para detectar duplicados mediante similitud coseno.
- Clasificación por similitud con prototipos: asignar categorías comparando el embedding de una entrada corta con embeddings de referencia precalculados.
- Enrutamiento de consultas: decidir a qué pipeline o servicio derivar una petición corta en función de su similitud con ejemplos etiquetados.
- Filtrado previo en pipelines RAG: descartar o priorizar fragmentos muy cortos (títulos de sección, encabezados) antes de un reranking más costoso.
- Validación de despliegues en NPU: usar el artefacto como prueba de integración del stack Furiosa Torch/TCC, comparando salidas contra la referencia CPU con las tolerancias indicadas (atol 0,03, rtol 0,02).
- Prototipado de embeddings en entornos con acelerador Furiosa: sustituir la inferencia CPU del encoder por la NPU en servicios de baja latencia con entradas de hasta 16 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de validación reportada es la equivalencia numérica frente a CPU: 8 reejecuciones en proceso nuevo con tolerancias atol 0,03 y rtol 0,02, sin fallbacks a CPU ni recompilaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base es muy pequeño (~22,7 M de parámetros), pero esta variante está pensada para NPU, no para GPU.
- GPU recomendadas: no aplica; el artefacto está diseñado para NPU de FuriosaAI con Furiosa Torch/TCC 2026.4.0.
- Compatibilidad con GPU de consumo: no documentada. El flujo descrito (NPU + host) no está pensado para RTX 4090 ni similares.
- Opciones de despliegue: SDK de Furiosa con `python -m pip install 'fxbx[weights]==0.8.3'`, PyTorch 2.10.0+cpu y Transformers 5.20.2 para el ejemplo MiniLM; ejecución mediante `python run.py`.
- Descarga: `hf download softandsweet/sentence-transformers-all-minilm-l6-v2-rngd-fxbx --local-dir .` y extracción con `tar -xf weights.tar`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| softandsweet/...-rngd-fxbx (este) | no disponible (base ~22,7 M) | 16 tokens | Apache-2.0 | Hugging Face, 0 descargas | Adaptación a NPU Furiosa, BF16, batch 1 |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M (dato del modelo base, no confirmado en la info) | no disponible en la info | Apache-2.0 | Hugging Face, ampliamente usado | Modelo original en CPU/GPU |
| Otros sentence encoders pequeños (p. ej. paraphrase-MiniLM) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Entrada limitada a 16 tokens y batch fijo de 1: no apto para documentos largos ni para procesamiento por lotes de tamaño variable sin adaptación.
- La model card está en coreano y no documenta idiomas soportados; el comportamiento multilingüe no está verificado.
- No se publican benchmarks de calidad de embeddings; la validación se limita a la equivalencia numérica con CPU.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en producción ni mantenimiento comunitario.
- Dependencia estricta de versiones (Furiosa Torch/TCC 2026.4.0, PyTorch 2.10.0+cpu, `fxbx[weights]==0.8.3`, Transformers 5.20.2): cualquier desviación puede romper la reproducibilidad.
- Los pesos se distribuyen en un `weights.tar` fuera del repositorio estándar; el tamaño del repo es de 0,0 GB, por lo que la descarga y extracción son pasos obligatorios.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del stack de Furiosa por separado.
- Riesgo de alucinación y sesgos: no aplica de forma directa (no es un modelo generativo), pero los embeddings heredan los sesgos del corpus de entrenamiento del modelo base, no documentado aquí.

## Enlaces

- Hugging Face: https://huggingface.co/softandsweet/sentence-transformers-all-minilm-l6-v2-rngd-fxbx
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/tree/1110a243fdf4706b3f48f1d95db1a4f5529b4d41
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
