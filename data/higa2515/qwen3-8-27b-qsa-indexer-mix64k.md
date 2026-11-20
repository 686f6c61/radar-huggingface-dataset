# higa2515/Qwen3.8-27B-QSA-indexer-mix64k

## Resumen

Qwen3.8-27B-QSA-indexer-mix64k es un artefacto de investigación publicado por el usuario independiente higa2515 (repositorio asociado a kuraneko1 en GitHub). No se trata de un modelo completo, sino de un conjunto de pesos del *indexer* de atención dispersa (QSA, *Query-Sparse Attention*) para el modelo base higa2515/Qwen3.8-27B-QSA-BF16, un backbone de 27B parámetros presumiblemente derivado de la familia Qwen3. El repositorio contiene únicamente 16 capas × 5 tensores del indexer, con un total de 52.434.944 parámetros en FP32; el backbone, el codificador de visión, el proyector y los pesos MTP no se incluyen ni se modificaron.

El objetivo declarado de este entrenamiento es reducir los errores de confusión (*mix-ups*) en contextos de 128k tokens: responder con un registro cuya clave difiere en un solo carácter, tomar el valor de otro registro, o confundir un valor nulo con uno presente. Sobre un conjunto de 240 preguntas de recall-grid a 128k, el indexer alcanzó 212/240 aciertos, frente a 205 de su punto de partida, 223 de la atención densa y 207 de una variante editada manualmente. En validación held-out con *thinking* desactivado obtuvo 215/240, frente a 169 de la v1 y 227 de la atención densa.

Es relevante ahora porque documenta una línea de trabajo sobre atención dispersa aprendida para contexto largo, con código de entrenamiento, motor de inferencia llama.cpp propio y un paper asociado (arXiv:2608.30320). El autor indica que estos pesos son byte-idénticos al indexer v2 de los repositorios BF16 y GGUF (etiqueta `v2`), por lo que este repositorio se conserva solo como registro del *run* de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención dispersa QSA; este repositorio contiene solo el indexer (16 capas × 5 tensores) |
| Parametros totales | 52.434.944 (solo indexer, FP32); el backbone de 27B no se incluye |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | Entrenado a 65.536 tokens; evaluado a 128k sobre el backbone |
| Tipos de cuantizacion | No se distribuye GGUF; la evaluación se ejecutó sobre un GGUF Q8_0 del backbone. El indexer se publica en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qsa-indexers.safetensors`, F32) y formato trainer PyTorch (`indexers/qsa_indexers.pt`) |

## Arquitectura y entrenamiento

El indexer forma parte de un mecanismo de atención dispersa por bloques: selecciona los top-512 bloques de 4 tokens (presupuesto K = 2.048 tokens) sobre los que se calcula atención densa, mientras el backbone permanece congelado en BF16. Cada capa indexada dispone de proyecciones q/k, normalizaciones q_norm, k_norm y k_block_norm, todas en FP32 y con normas centradas en cero (el formato GGUF almacena `1 + weight`). El entrenamiento es una destilación continuada del indexer hacia un profesor denso por bloques, con pérdida KL en los bloques seleccionados más dos términos auxiliares: masa del bloque de respuesta (λ = 0,3) y margen frente a señuelos (μ = 0,3, margen 2,0) sobre cada token de pregunta.

La *lineage* consta de tres etapas: el indexer original del repositorio BF16 (`hub`), un checkpoint intermedio `300b` con 300 pasos a 16k sobre documentos sintéticos de recall (no publicado), y este `mix64k` con 300 pasos adicionales a 65.536 tokens de longitud de secuencia. Se usó AdamW con lr 5e-5, betas (0,9; 0,95) y clipping de gradiente 1,0, una secuencia por paso y cada pregunta una sola vez. Los datos de relleno proceden del split *train* de PG-19, mientras que los conjuntos de evaluación usan splits test y validation, sin solapamiento de texto. Las 300 preguntas se reparten en 25 ejecuciones × 4 documentos de ~63k tokens × 3 preguntas, con pesos por tipo (revisión 4, puntero 3, código 2, guid 2, resto 1) ajustados al perfil de errores de indexers anteriores. El entrenamiento se completó en una A100 80GB de Colab en 5,26 horas (63 s por paso, pico de 78,7 GB).

## Capacidades

- Indexación dispersa de contexto largo: selecciona bloques relevantes para responder consultas de recuperación (*lookup*) sobre documentos de hasta 128k tokens.
- Reducción de confusiones finas: entrenado específicamente contra señuelos con clave a un carácter de distancia, contra la toma del valor de otro registro y contra la confusión entre valor nulo y valor presente.
- Ocho tipos de tarea de recall-grid: revisión, puntero, código, GUID y otros tipos de consulta.
- Integración con el backbone Qwen3.8-27B-QSA-BF16, que aporta generación de texto, visión (codificador y proyector congelados) y capacidades MTP.
- Compatibilidad con tool calling y agentes: no disponible en la información proporcionada para este artefacto concreto; depende del backbone.
- Capacidades multilingües: no disponible.
- Modo *thinking*: el backbone lo soporta según la evaluación reportada (resultados con *thinking* off y on en validación), pero el indexer en sí no añade esta capacidad.

## Casos de uso

- Recuperación de registros en documentos largos: el indexer permite localizar y devolver el valor correcto de una clave dentro de un contexto de 128k tokens, útil en pipelines de extracción de datos de contratos o expedientes extensos.
- Verificación de campos con claves casi idénticas: en sistemas con identificadores que difieren en un solo carácter (por ejemplo, GUIDs o códigos de producto), el entrenamiento contra señuelos reduce la probabilidad de devolver el valor de la entrada equivocada.
- Detección de valores nulos frente a valores presentes: en tareas de auditoría de datos o cumplimentación de formularios, el modelo distingue entre campo vacío y campo con valor, lo que ayuda a evitar falsos positivos.
- Procesamiento de código en repositorios largos: el tipo de tarea "code" del recall-grid sugiere uso en localización de fragmentos o referencias dentro de bases de código que superan la ventana de atención densa.
- Investigación sobre atención dispersa: el repositorio, junto con el código de entrenamiento (qsa-indexer-forge) y el motor llama.cpp, sirve como base reproducible para estudiar destilación de indexers y compromisos entre presupuesto de atención y calidad.
- Despliegue en entornos con VRAM limitada: al sustituir atención densa por atención dispersa sobre top-512 bloques, el backbone puede procesar contextos de 128k con un coste de atención menor, lo que resulta adecuado para inferencia en GPUs de gama alta pero no de datacenter masivo.

## Benchmarks y rendimiento

| Conjunto | Preguntas | Aciertos | Contexto |
|---|---|---|---|
| Recall-grid (desarrollo, este indexer mix64k) | 240 | 212 | 128k |
| Recall-grid (punto de partida `hub`) | 240 | 205 | 128k |
| Recall-grid (atención densa) | 240 | 223 | 128k |
| Recall-grid (variante editada a mano) | 240 | 207 | 128k |
| Validación held-out, thinking off (v2) | 240 | 215 | 128k |
| Validación held-out, thinking off (v1) | 240 | 169 | 128k |
| Validación held-out, thinking off (atención densa) | 240 | 227 | 128k |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para el indexer: 52,4 M parámetros en FP32, aproximadamente 0,21 GB; el coste real lo determina el backbone de 27B.
- Backbone de 27B en BF16: aproximadamente 54 GB de pesos, más caché KV y activaciones; requiere GPUs de 80 GB para contexto largo.
- GPU recomendadas: A100 80GB (usada en el entrenamiento, pico de 78,7 GB); H100 para mayor margen y throughput.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; sería necesario cuantizar el backbone (por ejemplo, Q8_0 o inferior) y usar el motor llama.cpp QSA.
- Opciones de despliegue: Transformers con la implementación de referencia del repositorio BF16; llama.cpp mediante el motor QSA (github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp) y la serie GGUF; vLLM, TGI y Ollama no están documentados para este artefacto.
- Latencia y throughput: no disponibles; la evaluación se ejecutó en dos GPUs clase V100 sobre un GGUF Q8_0, sin métricas de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento recall-grid | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-indexer-mix64k (este) | 52,4 M (indexer) + 27B backbone | 65.536 entrenamiento / 128k evaluación | 212/240 (desarrollo), 215/240 (validación) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-QSA-BF16 (indexer v1/v2) | 52,4 M (indexer) + 27B backbone | 128k | 169/240 (validación v1) | Apache-2.0 | Hugging Face |
| Atención densa sobre el mismo backbone | 27B | 128k | 227/240 (validación) | Apache-2.0 (presumible) | Referencia interna del autor |

No se dispone de comparación con modelos de atención dispersa de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el backbone BF16, el codificador de visión, el proyector y los pesos MTP, estos pesos no generan texto por sí solos.
- Resultado de una única ejecución sobre un único conjunto de 240 preguntas; el autor advierte explícitamente que no debe interpretarse como una medida robusta.
- El indexer sigue por debajo de la atención densa en todos los conjuntos reportados (212 frente a 223 en desarrollo; 215 frente a 227 en validación), de modo que la atención dispersa sacrifica calidad de recuperación.
- El checkpoint intermedio `300b` no está publicado, lo que limita la reproducibilidad completa de la *lineage*.
- No se distribuye GGUF de este artefacto; para usarlo en llama.cpp hay que escribir manualmente los 80 tensores FP32 en una copia de un GGUF QSA, con la transformación `1 + w` en las normas, lo que introduce riesgo de error de conversión.
- Idiomas soportados no documentados; los sesgos del backbone no se detallan en la información disponible.
- Riesgo de alucinación y de confusión residual en contextos de 128k pese al entrenamiento específico contra señuelos.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la procedencia del backbone de 27B.
- Los pesos son byte-idénticos a la etiqueta `v2` de los repositorios BF16 y GGUF; el autor recomienda usar esos repositorios en lugar de este.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-indexer-mix64k
- Modelo base BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Serie GGUF: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Código de entrenamiento (qsa-indexer-forge): https://github.com/kuraneko1/qsa-indexer-forge
- Write-up de entrenamiento (en japonés): https://github.com/kuraneko1/qsa-indexer-forge/blob/main/docs/training-64k-mixup.md
- Motor llama.cpp QSA: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
- Paper QSA: https://arxiv.org/abs/2608.30320
