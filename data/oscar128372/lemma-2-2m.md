# oscar128372/Lemma-2.2M

## Resumen

Lemma-2.2M es un modelo de lenguaje autorregresivo de 2,2 millones de parámetros desarrollado por el usuario oscar128372 y publicado en Hugging Face bajo licencia MIT. Se trata de un experimento de investigación centrado en modelos de lenguaje de escala extrema (SLM), no en un modelo orientado a producción. Su interés reside en la arquitectura: en lugar de un transformer convencional, emplea un bloque híbrido personalizado que combina convoluciones causales dilatadas, atención híbrida con recuperación dispersa y una FFN diferencial con activaciones "Star".

El modelo se entrenó desde cero sobre unos 1.970 millones de tokens, con una mezcla de ocho datasets que prioriza el lenguaje general (82%) y el razonamiento matemático (18%). Incorpora un tokenizador BPE de nivel de byte de 2.048 tokens con aislamiento estricto de dígitos y operadores aritméticos, una decisión de diseño poco habitual pensada para que el modelo pueda aprender aritmética posicional con un presupuesto de parámetros mínimo.

Es relevante ahora como banco de pruebas reproducible para investigar prioridades arquitectónicas a microescala, optimizadores híbridos (Muon + AdamW) y estrategias de tokenización aritmética. No debe confundirse con un modelo de propósito general: su ventana de contexto es de 512 tokens y su conocimiento factual es muy limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido personalizado (MSCSM + RPA + Harmonic Differential StarCarrier FFN) |
| Parámetros totales | 2.203.653 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros hiperparámetros documentados por el autor:

| Hiperparámetro | Valor |
|---|---|
| Capas (n_layers) | 3 |
| Dimensión oculta (d_model) | 192 |
| Cabezas de atención (n_heads) | 4 (head_dim = 48) |
| Dimensión oculta de la FFN | 384 (2 × d_model) |
| Tamaño de vocabulario | 2.048 (embeddings atados) |
| Logit softcapping | 30,0 |

## Arquitectura y entrenamiento

Cada bloque combina tres etapas residuales con escalado aprendible por canal (gamma) y RMSNorm. La primera es un Multi-Scale Causal State Mixer (MSCSM) basado en convoluciones 1D causales con profundidad, dilatación y kernels k ∈ {3, 5} con dilataciones {1, 2, 5}, con ponderación de ramas softmax aprendible y gating SiLU. La segunda es una Residual Pyramid Attention (RPA) de tres vías: atención de ventana local (W = 8) con Multi-Octave RoPE (θ ∈ [64, 262144] entre cabezas), atención dispersa recuperada (B_max = 16) indexada mediante un kernel Triton de índice invertido causal sobre cubos de Spherical Residual Vector Quantization (SRVQ, L = 1, M = 16), y compresión de registros globales (G = 8) mediante pooling de estado de prefijo acumulativo. La tercera es una FFN diferencial armónica StarCarrier con diferencias conjugadas de características, activaciones "Star" (ReLU al cuadrado + SiLU) y normalización RMS interna.

El preentrenamiento cubrió 30.000 pasos a 65.536 tokens por paso (≈1,97 mil millones de tokens), con micro-lote de 32 y acumulación de gradiente de 4. Se usó un optimizador híbrido: Muon para las matrices de proyección 2D internas (lr = 0,030, momentum de Nesterov 0,95, 5 pasos de ortogonalización Newton-Schulz) y AdamW fusionado para embeddings, normas, sesgos y escalares de atención (lr = 1,5e-3, β1 = 0,9, β2 = 0,95, weight decay 0,01). Las pérdidas auxiliares de compromiso y balanceo de carga de SRVQ se calentaron de forma cuadrática durante los primeros 1.000 pasos, y se mantuvieron pesos sombra con EMA (decay 0,995, corrección de sesgo). El entrenamiento se hizo en float16 con `torch.compile`, matmuls TF32 y kernels Triton personalizados. El postentrenamiento duró aproximadamente 3 horas, sin que el autor detalle la metodología (no se documenta RLHF ni DPO).

La mezcla de datos se sirvió con un prefetcher paralelo Deficit Weighted Round-Robin sobre ocho datasets: Ultra-FineWeb-L3 (24%), cosmopedia-v2 (20%), TinyStories (14%), Wikipedia en (12%), TxT360-v2 QA (12%), UltraData-Math (7%), orca-math-word-problems-200k (6%) y OpenMathInstruct-2 (5%). El tokenizador BPE de nivel de byte de 2.048 tokens se entrenó sobre la propia mezcla y aplica aislamiento por regex de dígitos y símbolos aritméticos (`[0-9+\-*/=()]`), de modo que cada dígito y operador queda como token único sin fusiones.

## Capacidades

- Generación de texto autorregresiva en inglés, con calidad limitada por el tamaño del modelo.
- Aritmética básica y problemas matemáticos de palabras, favorecidos por el tokenizador de aislamiento de dígitos.
- Razonamiento de sentido común y narrativa sencilla, gracias al peso de TinyStories en la mezcla.
- Respuesta a preguntas sobre conocimiento enciclopédico muy básico (Wikipedia con peso del 12%).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación en arquitecturas de SLM: el modelo sirve como referencia reproducible para estudiar el impacto del MSCSM, la RPA y la FFN StarCarrier en tareas de lenguaje con un presupuesto de 2,2M de parámetros.
- Estudio de tokenización aritmética: permite comparar el aislamiento estricto de dígitos frente a tokenizadores BPE convencionales en tareas de aritmética posicional, usando ArithMark-3 como métrica.
- Experimentación con optimizadores híbridos: su combinación Muon + AdamW con EMA y controlador de curriculum es un caso práctico para investigar estabilidad de entrenamiento a microescala.
- Validación de kernels Triton: el kernel de índice invertido causal sobre SRVQ puede reutilizarse o compararse en pipelines de atención dispersa.
- Docencia y divulgación: modelo lo bastante pequeño para entrenarse y ejecutarse en hardware modesto, útil para explicar mecánicas de preentrenamiento, mezcla de datos y postentrenamiento.
- Pruebas de infraestructura de inferencia: su tamaño permite validar pipelines de despliegue (carga de safetensors, tokenización, generación) sin coste de GPU significativo.
- Generación de texto narrativo muy corto y controlado: con contexto de 512 tokens puede producir micro-relatos o continuaciones simples en inglés, siempre con expectativas de calidad bajas.

## Benchmarks y rendimiento

Resultados publicados por el autor (precisión normalizada):

| Benchmark | Lemma-2.2M |
|---|---|
| HellaSwag (normalized) | 28,29% |
| ARC-Easy (normalized) | 37,42% |
| ARC-Challenge (normalized) | 21,93% |
| PIQA (normalized) | 56,42% |
| ArithMark-3 (normalized) | 37,50% |
| Intelligence Index (fórmula de Open SLM's Leaderboard) | 9,39 |

No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,2M de parámetros ≈ 9 MB de pesos); en float16, unos 4,5 MB. El cuello de botella real es el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o una iGPU moderna; también es viable en CPU.
- Cabe en cualquier GPU de consumo y en la mayoría de sistemas embebidos con suficiente memoria para el runtime.
- Opciones de despliegue: `transformers` con safetensors (formato publicado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada probablemente requiera código específico del autor.
- Latencia y throughput: no disponibles en la información proporcionada; con 3 capas y contexto de 512 tokens se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, los SLM de escala similar (por ejemplo, variantes de TinyStories o modelos de menos de 10M de parámetros) comparten el objetivo de investigación, pero no se han encontrado comparaciones publicadas con Lemma-2.2M.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lemma-2.2M | 2,2M | 512 | MIT | Hugging Face |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conocimiento factual y del mundo muy limitado: 2,2M de parámetros y 512 tokens de contexto restringen severamente la recuperación de información.
- Riesgo alto de alucinación en cualquier consulta que exija conocimiento enciclopédico o razonamiento complejo.
- Solo inglés; no hay soporte multilingüe documentado.
- Ventana de contexto de 512 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- No se documentan evaluaciones de sesgo; al entrenarse sobre mezclas web y sintéticas, es probable que herede sesgos de esas fuentes.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- La arquitectura personalizada puede no ser compatible con herramientas estándar de inferencia (vLLM, llama.cpp, Ollama), lo que complica el despliegue.
- El postentrenamiento de ~3 horas no está detallado; se desconoce si incluyó alineación o ajuste de instrucciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/oscar128372/Lemma-2.2M
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceTB/cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset roneneldan/TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset IFM/TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
