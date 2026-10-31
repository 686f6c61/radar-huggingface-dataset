# OsaurusAI/Nanbeige4.3-33B-JANG_6M

## Resumen

Nanbeige4.3-33B-JANG_6M es una versión cuantizada del modelo Nanbeige4.3-33B de Nanbeige, empaquetada por OsaurusAI en formato JANG para ejecutarse de forma eficiente en hardware Apple Silicon mediante el runtime de MLX. El modelo base es un LLM denso de 33.100 millones de parámetros orientado a tareas agénticas de programación y trabajo profesional de "coworking", con razonamiento activado por defecto y soporte nativo de llamadas a herramientas en formato XML.

La relevancia de este bundle radica en su relación calidad/tamaño: reduce el modelo de 66,2 GB (BF16) a 28,4 GB (6,87 bits por peso de media) manteniendo un acuerdo top-1 del 97,8% con el modelo de precisión completa en conjuntos de evaluación reservados de agentes, código y documentación. La cuantización emplea escalado consciente de activaciones (AWQ plegado en las RMSNorm) y ajuste por grupos con ponderación de activaciones (imatrix), con atención a 8 bits y MLP, embeddings y lm_head a 6 bits.

El contexto nativo es de 524.288 tokens (512K), una cifra muy superior a la de la mayoría de modelos abiertos de su tamaño, lo que lo hace especialmente adecuado para sesiones largas de agentes con múltiples herramientas y bases de código extensas. Está limitado a texto, con soporte de inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas, 56 cabezas de consulta, 8 cabezas clave/valor), solo texto |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE; todos los parámetros se activan por token) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | JANG: atención 8-bit (afín, grupo 64), MLP/embeddings/lm_head 6-bit; RMSNorm en bf16 con AWQ plegado |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle JANG para MLX), 28,44 GB en shards, 6,87 bits/peso |

## Arquitectura y entrenamiento

Nanbeige4.3-33B es un transformer denso de arquitectura Llama estándar con 52 capas, 56 cabezas de consulta y 8 cabezas clave/valor (GQA), ejecutado una vez por token. La model card destaca explícitamente que no es un transformer en bucle como su predecesor Nanbeige4.2. Incluye razonamiento activado por defecto (el chat template abre un bloque `<think>` que el modelo cierra) y llamadas a herramientas nativas en XML. No hay datos publicados sobre el número de tokens de preentrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información disponible.

En cuanto al bundle JANG_6M, la cuantización se calibró con 1.048.576 tokens del modelo BF16 renderizados a través de su propio chat template (35% código, 20% razonamiento, 20% agéntico, 15% terminal, 10% conversación; código en 26 lenguajes, con 191.569 tokens que reproducen trazas de razonamiento del propio modelo). Se capturaron segundos momentos de entrada E[xxᵀ] completos (Hessians) para cada capa lineal y el lm_head, se aplicó escalado AWQ con búsqueda de intensidad por sitio (103 de 104 sitios con plegado, exacto en bf16 al usar potencias de dos) y se ajustaron escalas y sesgos por grupo con ponderación de activaciones. No se usó GPTQ. La asignación de bits es de niveles fijos: atención a 8 bits, MLP, embeddings y lm_head a 6 bits.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Razonamiento con "thinking mode" activado por defecto: el modelo genera trazas en un bloque `<think>` antes de la respuesta; se puede desactivar con `enable_thinking: false` y conservar el razonamiento de turnos anteriores con `preserve_thinking` (recomendado para agentes multi-turno).
- Codificación agéntica: generación y edición de código, trabajo en terminal y sesiones de agente con llamadas a herramientas XML (`<tool_call>` / `<function=NAME>` / `<parameter=KEY>`), con opción de formato JSON mediante `tool_call_format: "json"`.
- Soporte de tool calling nativo y respuestas de herramientas vía bloques `<tool_response>`.
- Contexto de 512K tokens, adecuado para sesiones de agente largas y bases de código extensas; configuración de generación orientada a agentes (temperatura 1.0, top-p 0.95, hasta 65.536 tokens nuevos).
- No tiene capacidades multimodales: es un modelo de solo texto.

## Casos de uso

- Agentes de codificación multi-paso: el modelo está explícitamente orientado a sesiones agénticas con llamadas a herramientas XML y contexto de 512K, lo que permite mantener sesiones largas con historial de razonamiento y resultados de herramientas sin truncar contexto.
- Asistentes de programación sobre bases de código grandes: con 524.288 tokens de ventana se pueden cargar repositorios completos o grandes diffs para tareas de refactorización, revisión y generación de código.
- Automatización de tareas de terminal: la evaluación por áreas incluye trabajo en terminal como categoría propia, con 95,7% de acuerdo top-1 respecto al modelo BF16, indicativo de que es un caso de uso de primera clase.
- Razonamiento y resolución de problemas estructurados: el thinking mode por defecto permite trazas de razonamiento explícitas antes de la respuesta final, útil para tareas de análisis y planificación.
- Atención al cliente o asistentes conversacionales bilingües (inglés/chino): el soporte de ambos idiomas y el formato conversacional con control de razonamiento lo adaptan a chatbots donde se puede desactivar el thinking para reducir latencia.
- Integración en runtime local en Apple Silicon: al ser un bundle MLX de 28,4 GB, cabe en Macs con suficiente memoria unificada (por ejemplo 32 GB o más), permitiendo despliegue local privado sin GPU de servidor.
- Pipelines de tool calling con formato JSON: mediante `tool_call_format: "json"` puede integrarse en frameworks de agentes que esperan llamadas JSON estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de la cuantización respecto al modelo BF16 de referencia:

| Modelo | Tamaño | bits/peso | KL ↓ (vendor-style) | top-1 ↑ (vendor-style) | KL ↓ (local) | top-1 ↑ (local) |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16, referencia) | 66,2 GB | 16 | 0 | 100% | 0 | 100% |
| **Nanbeige4.3-33B-JANG_6M** | **28,4 GB** | **6,87** | **0,0026** | **97,6%** | **0,0036** | **97,8%** |
| Nanbeige4.3-33B-JANG_4D | 21,7 GB | 5,24 | 0,0127 | 96,7% | 0,0200 | 95,6% |
| Nanbeige4.3-33B-JANG_2D | 14,0 GB | 3,37 | 0,150 | 88,0% | 0,220 | 84,9% |
| 4-bit uniforme (referencia interna) | 18,6 GB | 4,50 | 0,0537 | 91,8% | — | — |

Desglose por áreas para JANG_6M (KL medio · top-1): agéntico/tool use 0,0044 · 96,9%; código 0,0008 · 99,8%; terminal 0,0034 · 95,7%; razonamiento 0,0031 · 98,2%; conversación 0,0026 · 95,3%; sesiones de agente con XML 0,0068 · 97,7%; código fuente 0,0026 · 98,3%; documentación 0,0031 · 96,6%.

Como referencia de escala, dos implementaciones correctas distintas del mismo modelo BF16 difieren entre sí por KL 0,0012 y 98,9% de top-1, por lo que este bundle está cerca del límite teórico de fidelidad.

## Requisitos de hardware

- Los pesos ocupan 28,44 GB; en Apple Silicon se necesita memoria unificada suficiente para pesos, KV cache y sobrecoste del runtime. Con un KV cache de 208 KiB por token en bf16 (52 capas × 8 cabezas KV × 128), 32K tokens de contexto añaden unos 6,5 GB.
- Macs con 32 GB de memoria unificada son el mínimo realista para contextos cortos; 48 GB o 64 GB (M2/M3/M4 Max y Ultra) permiten contextos amplios con holgura.
- No es un modelo pensado para GPU NVIDIA de consumo: el formato JANG/MLX está orientado a Apple Silicon. Para GPU NVIDIA habría que usar el modelo base Nanbeige/Nanbeige4.3-33B en BF16 (66,2 GB, requiere A100/H100 de 80 GB o multi-GPU) u otras cuantizaciones si existen.
- Despliegue: runtime Osaurus 0.25.27 o posterior (requisito indicado en la model card). La carga verificada se ha probado con un loader MLX estándar. No hay indicación de compatibilidad con llama.cpp, Ollama, vLLM o TGI para este bundle concreto.
- No se han publicado mediciones de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-JANG_6M | 33,1B (6,87 bits/peso) | 512K | Transformer denso Llama | Apache 2.0 | MLX/Osaurus, Apple Silicon |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | 512K | Transformer denso Llama | Apache 2.0 | HuggingFace, BF16 |
| Nanbeige4.3-33B-JANG_4D (mismo autor) | 33,1B (5,24 bits/peso) | 512K | Transformer denso Llama | Apache 2.0 | MLX/Osaurus, 21,7 GB |
| Nanbeige4.3-33B-JANG_2D (mismo autor) | 33,1B (3,37 bits/peso) | 512K | Transformer denso Llama | Apache 2.0 | MLX/Osaurus, 14,0 GB |

Frente a la base BF16, JANG_6M reduce el footprint a menos de la mitad con una pérdida mínima de fidelidad (97,8% top-1). Frente a JANG_4D y JANG_2D, ofrece la mayor calidad a cambio de un tamaño mayor. No hay datos comparativos publicados frente a otros modelos de terceros (Qwen, Llama, etc.) en la información disponible.

## Limitaciones y advertencias

- Modelo de solo texto: no soporta visión, audio ni otras modalidades.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está documentado y puede ser inferior.
- Riesgo de alucinación inherente a LLM: no se publican evaluaciones de alucinación ni benchmarks de conocimiento factual en la información disponible.
- El razonamiento está activado por defecto, lo que consume tokens adicionales antes de la respuesta; en despliegues sensibles a latencia conviene evaluar `enable_thinking: false`.
- Conservar el razonamiento de turnos anteriores en el prompt (comportamiento por defecto) aumenta rápidamente el consumo de contexto en sesiones largas; desactivarlo puede degradar el rendimiento en tareas agénticas multi-turno según la recomendación de Nanbeige.
- El bundle depende del runtime Osaurus 0.25.27 o posterior y del ecosistema MLX; no es directamente portable a entornos CUDA estándar.
- El KV cache en bf16 (208 KiB/token) hace que contextos cercanos a 512K sean muy costosos en memoria: 512K tokens implicarían más de 100 GB solo de cache.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero los pesos originales son © Nanbeige; conviene revisar los términos del modelo base para usos específicos.
- Las métricas de fidelidad de cuantización se midieron sobre conjuntos propios de OsaurusAI, no sobre benchmarks públicos, por lo que no son directamente comparables con otros modelos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/OsaurusAI/Nanbeige4.3-33B-JANG_6M
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Runtime Osaurus: https://osaurus.ai
- Organización del autor: https://huggingface.co/OsaurusAI
- Paper, blog o repositorio de código adicional: no disponible
