# Ethan33X/Tractus-decision-4B

## Resumen

Tractus-decision-4B es un modelo de decisión de un solo paso (single-pass) desarrollado por el autor independiente Ethan33X, obtenido mediante post-entrenamiento sobre Qwen/Qwen3.5-4B-Base. A diferencia de un modelo generativo convencional, no produce texto: dado un estado de entrada (texto, JSON estructurado, tablas o contexto multimodal) y un conjunto de 2 a 255 opciones candidatas, devuelve una distribución de probabilidad calibrada sobre esas opciones en un único forward pass, con cero tokens generados. Esto elimina por completo la latencia de decodificación autorregresiva, que es el cuello de botella habitual en tareas de clasificación, enrutamiento y selección.

El modelo hereda la arquitectura híbrida vision-language de Qwen3.5, con 32 capas que combinan 24 capas Gated DeltaNet y 8 capas Gated Attention, una ventana de contexto nativa de 262.144 tokens y un vocabulario de 248.320 entradas. Con 4.841.450.496 parámetros totales según safetensors (4,21B declarados por el autor, de los cuales 3,57B corresponden al backbone sin embeddings), se posiciona en la gama media de la familia Tractus, que también incluye variantes de 0,8B, 2B y 9B.

Su relevancia actual reside en dos frentes: por un lado, propone un patrón de inferencia alternativo para sistemas de agentes y enrutamiento donde la latencia de prefill es aceptable pero la de decodificación no; por otro, introduce un mecanismo de calibración propio (Thermostasis) y una reducción del 99,9% en la proyección de salida al omitir la cabeza de vocabulario. La licencia es MIT modificada con condiciones comerciales específicas, lo que exige revisión jurídica antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 32 capas (24 Gated DeltaNet + 8 Gated Attention), vision-language |
| Parametros totales | 4.841.450.496 (4,21B declarados; 3,57B backbone sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (8,4 GB), INT4 (2,2 GB); MLX INT4 mencionado en demos |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT modificada (modified-mit), con tiers comerciales/MaaS y aviso Apache-2.0 de Qwen3.5 |
| Formato de pesos | safetensors (transformers) |
| Dimension hidden / FFN | 2.560 / 9.216 |
| Tamano del vocabulario | 248.320 |
| Entradas | Estado (texto, JSON/tablas, multimodal) + opciones candidatas (2–255) |
| Salidas | Distribución de probabilidad calibrada sobre opciones (0 tokens generados) |
| Tamano del repo | 9,7 GB |

## Arquitectura y entrenamiento

El backbone es la arquitectura híbrida de Qwen3.5, que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de Gated Attention clásica en una proporción 3:1. Esta combinación permite sostener un contexto de 262.144 tokens con un coste de KV-cache muy inferior al de un transformer denso equivalente: el autor reporta una reducción de 4× en memoria de KV-cache en BF16 a 256K, pasando de 34,36 GB a 8,59 GB. Además, el prefijo KV del prefill puede reutilizarse íntegramente (sin re-prefill) al escalar a un modo System 2, lo que resulta relevante en pipelines de dos etapas.

La innovación central es el mecanismo de lectura y calibración denominado Thermostasis. En lugar de proyectar el estado terminal sobre la cabeza de vocabulario de 248.320 entradas, el modelo puntúa las claves de las opciones candidatas en la posición terminal mediante una proyección de salida mucho menor (el autor afirma que un 99,9% más pequeña). Sobre esos logits se aplica una secuencia opcional: desplazamiento de prior binario, softcapping de logits con tanh y C = 30,0, centrado de suma cero y un termostato analítico 2D en e sin escalares de temperatura ajustados por validación. Los dos priors binarios estáticos (+3,2 para alucinación en RAGTruth y -0,75 para phishing en PhishNChips) solo se activan en Decision Index 0.3 y valen 0 en los otros 9 benchmarks primarios y en el conjunto OOD de 19.887 elementos. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Decisión de un solo paso: selección calibrada entre 2 y 255 opciones candidatas en un único forward pass, sin generación autorregresiva.
- Clasificación y enrutamiento: adecuado para enrutadores de intención, selección de herramientas y triaje de tickets.
- Entrada multimodal: procesa texto, JSON estructurado, tablas, layouts de interfaz y estados espaciales gracias al backbone vision-language de Qwen3.5.
- Contexto largo: ventana nativa de 256K tokens con coste de KV-cache reducido, apta para ledgers extensos y documentos largos.
- Calibración de probabilidades: salida calibrada mediante Thermostasis, con métricas de ECE reportadas por el autor.
- Integración con System 2: reutilización del prefijo KV para escalar a un modelo dual-mode (Tractus-4B) sin re-prefill.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no documentado explícitamente como tal; la selección de opciones puede formularse como elección de herramienta, pero no se describe un protocolo de function calling.
- Razonamiento multi-paso y agentes: no soportado en el modo single-pass; el autor remite al modelo dual-mode para razonamiento extendido.

## Casos de uso

- Enrutamiento de intención en atención al cliente: el modelo recibe el turno del usuario y una lista de intenciones o colas de soporte, y devuelve la probabilidad de cada una en un solo paso. La ventana de 256K permite incluir historial conversacional extenso sin truncar.
- Selección de herramienta en agentes: dado el estado del agente y un catálogo de funciones disponibles, el modelo puntúa cada herramienta candidata. Al no generar tokens, la latencia se limita al prefill, lo que encaja en bucles de agente con presupuesto de milisegundos.
- Triaje de documentos y correo: clasificación de tickets, correos o incidencias en categorías predefinidas con probabilidades calibradas, útil para umbrales de derivación automática y revisión humana.
- Navegación web automatizada: el autor reporta un 84,00% en Mind2Web, lo que respalda el uso del modelo para seleccionar el siguiente elemento accionable en una página a partir de su representación estructurada o visual.
- Moderación y detección de riesgo: con los priors binarios de alucinación (RAGTruth) y phishing (PhishNChips) activables en el índice de decisión, puede emplearse como clasificador de riesgo en pipelines de RAG o de filtrado de dominios.
- Enrutamiento bancario multi-intención: el demo del autor cubre un router de banca y servicios; el modelo selecciona el departamento o flujo adecuado a partir de la consulta y el estado del cliente.
- Dinámica espacial multiagente: el demo JevBall con 22 agentes bajo un SLA de 300 ms ilustra el uso en simulaciones donde cada agente debe decidir su acción por tick sin latencia de decodificación.
- Clasificación sobre tablas y ledgers JSON: la entrada estructurada permite decisiones sobre registros financieros o inventarios sin convertir previamente a lenguaje natural.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Tractus-decision-4B | Tractus-4B (dual-mode) |
|---|---|---|---|
| Decision Index 0.3 | Balanced Skill | 41,31 | no disponible |
| Decision Index 0.3 | Balanced Raw Accuracy | 55,56% | no disponible |
| JevBench 231 | Overall Accuracy (single-pass) | 76,19% (176/231) | 88,31% |
| Matched Commercial Suite (831 items) | Amazon ESCI Macro-F1 | 67,10% | no disponible |
| Matched Commercial Suite | Mind2Web | 84,00% | no disponible |
| Matched Commercial Suite | JevBench | 77,49% | 89,61% |
| Matched Commercial Suite | Pooled ECE (raw) | 2,46% | 4,99% |
| Matched Commercial Suite | Pooled ECE (OOF) | 1,45% | 1,07% |

El autor indica que Decision Index 0.3 agrega 37 benchmarks en cinco áreas de capacidad (Knowledge & Reasoning 25,8%, Language Understanding 25,8%, Retrieval & Classification y otras no detalladas en la información disponible). No se han publicado resultados de MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 8,4 GB en BF16 y 2,2 GB en INT4 según la model card, sin contar overhead de runtime ni el KV-cache.
- KV-cache: reducido 4× respecto a un transformer denso equivalente; a 256K en BF16 ocupa 8,59 GB según el autor.
- GPU recomendadas: no especificadas por el autor. Por huella de memoria, una RTX 4090 (24 GB) cubre BF16 con contexto amplio; A100 y H100 quedan sobredimensionadas para el modelo, pero son válidas para servir lotes grandes.
- GPU de consumo: sí cabe. En INT4 (2,2 GB) entra en GPUs de 8 GB o menos; en BF16 requiere al menos 12 GB para dejar margen al KV-cache.
- Apple Silicon: el autor reporta demos funcionando en Metal GPU con MLX INT4.
- Opciones de despliegue: transformers es la librería declarada; el autor menciona CUDA/PyTorch (BF16) y MLX (INT4). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas. El SLA de 300 ms del demo JevBall con 22 agentes es el único dato operativo reportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-decision-4B | 4,21B (4,84B safetensors) | 256K | Decisión single-pass, 0 tokens generados | MIT modificada | Hugging Face |
| Tractus-4B (dual-mode) | 4,21B | 256K | System 1 + System 2 con re-prefill cero | MIT modificada | Hugging Face |
| Tractus-decision-2B | 1,88B | 256K | Decisión single-pass | MIT modificada | Hugging Face |
| Tractus-decision-9B | 9,24B | 256K | Decisión single-pass | MIT modificada | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de clasificación o enrutamiento de otros autores (por ejemplo, clasificadores basados en encoders o routers generativos). La comparativa más directa es interna a la familia Tractus: el modelo dual-mode mejora el rendimiento en JevBench (88,31% frente a 76,19%) a costa de generar tokens y, por tanto, de latencia.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea degradado.
- Ausencia de generación: no puede producir texto libre ni razonamiento extendido; para eso existe la variante dual-mode Tractus-4B.
- Benchmarks no verificados: todos los resultados del model-index tienen `verified: false` y proceden del propio autor; no hay replicación independiente.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Qwen3.5, hereda los sesgos del corpus de entrenamiento del modelo base.
- Alucinación: el prior binario de +3,2 para RAGTruth sugiere que el autor ha observado comportamiento de alucinación en tareas de recuperación; se aplica solo en Decision Index 0.3 y no en el resto de benchmarks.
- Licencia: MIT modificada con tiers comerciales y de MaaS, más un aviso Apache-2.0 de Qwen3.5. No es una licencia permisiva estándar; requiere revisión legal antes de uso comercial o de ofrecer el modelo como servicio.
- Madurez: 8 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; ecosistema de tooling y soporte muy limitado.
- Despliegue: no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que puede complicar la integración en infraestructura existente.
- Calibración dependiente del conjunto: los priors estáticos están ajustados a benchmarks concretos y pueden no transferir a dominios nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-decision-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Variante dual-mode: https://huggingface.co/Ethan33X/Tractus-4B
- Variante 0,8B: https://huggingface.co/Ethan33X/Tractus-decision-0.8B
- Variante 2B: https://huggingface.co/Ethan33X/Tractus-decision-2B
- Variante 9B: https://huggingface.co/Ethan33X/Tractus-decision-9B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Licencia: https://huggingface.co/Ethan33X/Tractus-decision-4B/blob/main/LICENSE
