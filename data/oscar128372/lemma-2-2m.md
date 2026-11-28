# oscar128372/Lemma-2.2M

## Resumen

Lemma-2.2M es un modelo de lenguaje autorregresivo de 2,2 millones de parámetros desarrollado por el usuario oscar128372 y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo experimental de escala extrema (SLM, *small language model*) orientado a la investigación en eficiencia de parámetros, no a producción. Su relevancia radica en que, pese a su tamaño minúsculo, ocupa el primer puesto en la categoría de menos de 3 millones de parámetros de la clasificación BETU SLM Leaderboard a fecha de 13 de noviembre de 2026.

El modelo emplea una arquitectura híbrida personalizada que sustituye el bloque transformer convencional por una combinación de convoluciones causales dilatadas, atención con ventana local, atención dispersa recuperada mediante cuantización vectorial residual esférica y un FFN diferencial con activaciones conjugadas. Cuenta con 3 capas, dimensión oculta de 192, 4 cabezas de atención y una longitud de contexto de 512 tokens.

Un aspecto diferencial es su tokenizador BPE a nivel de byte de 2.048 tokens, diseñado con aislamiento estricto de caracteres aritméticos para evitar la fragmentación de dígitos y operadores, lo que busca favorecer el aprendizaje de aritmética posicional con un presupuesto de parámetros mínimo. El modelo se entrenó sobre una mezcla de 8 datasets con un 82 % de contenido general y un 18 % de razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida personalizada (MSCSM + Residual Pyramid Attention + Harmonic Differential StarCarrier FFN), 3 capas |
| Parametros totales | 2.203.653 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

Cada bloque del modelo combina tres etapas residuales con escalado aprendible por canal (`gamma`) y RMSNorm. La primera es un Multi-Scale Causal State Mixer (MSCSM): convoluciones 1D causales con dilatación (`k ∈ {3, 5}`, dilataciones `{1, 2, 5}`), ponderación de ramas con softmax aprendible y puerta SiLU. La segunda es Residual Pyramid Attention (RPA), una atención híbrida de tres rutas: atención de ventana local (`W=8`) con Multi-Octave RoPE (`θ ∈ [64, 262144]` por cabeza), atención dispersa recuperada (`B_max=16`) indexada mediante un kernel Triton de índice invertido causal sobre cubos de Spherical Residual Vector Quantization (SRVQ, `L=1, M=16`), y compresión de registros globales (`G=8`) por agrupación acumulativa de estado de prefijo. La tercera es un FFN gated diferencial (Harmonic Differential StarCarrier) con diferencias de características conjugadas, activaciones combinadas ReLU al cuadrado + SiLU y normalización RMS interna. La dimensión FFN es 384 (`2 * d_model`) y se aplica logit softcapping de 30,0.

El preentrenamiento abarcó 30.000 pasos a 65.536 tokens por paso (aproximadamente 1,97 mil millones de tokens), con micro-lote de 32 y acumulación de gradiente de 4. Se usó optimización híbrida Muon (matrices de proyección 2D, `lr = 0.030`, momentum Nesterov 0.95, 5 pasos de ortogonalización Newton-Schulz) y AdamW fusionado (embeddings, normas, sesgos y escalares, `lr = 1.5e-3`, `β1 = 0.9`, `β2 = 0.95`, weight decay 0.01). Los datos se intercalaron dinámicamente con un prefetcher Deficit Weighted Round-Robin sobre 8 datasets: Ultra-FineWeb-L3 (24 %), cosmopedia-v2 (20 %), TinyStories (14 %), Wikipedia en (12 %), TxT360 QA (12 %), UltraData-Math (7 %), orca-math-word-problems-200k (6 %) y OpenMathInstruct-2 (5 %). Se aplicó EMA con decaimiento 0.995 y corrección de sesgo, precisión mixta float16, `torch.compile`, matmuls TF32 y kernels Triton. El postentrenamiento duró aproximadamente 3 horas, sin que la model card detalle la metodología (RLHF, DPO u otra).

## Capacidades

- Generación de texto autorregresiva en inglés con contexto de 512 tokens.
- Razonamiento aritmético básico favorecido por el tokenizador de aislamiento matemático (dígitos y operadores como tokens únicos).
- Respuesta a preguntas de conocimiento enciclopédico y QA (Wikipedia, TxT360).
- Generación de texto narrativo y sentido común (TinyStories).
- Resolución de problemas matemáticos de enunciado y soluciones paso a paso (orca-math, OpenMathInstruct-2).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Investigación en eficiencia de parámetros: reproducir y analizar la arquitectura híbrida (MSCSM, RPA, SRVQ) en entornos académicos con recursos mínimos, ya que el modelo entero cabe en unos pocos megabytes.
- Estudio de tokenizadores para aritmética: evaluar cómo el aislamiento de dígitos y operadores afecta al aprendizaje de sumas y restas en modelos de menos de 3M de parámetros, usando ArithMark-3 como referencia.
- Benchmarking de modelos SLM: servir como línea base en la categoría <3M para comparar nuevas propuestas contra la clasificación BETU SLM Leaderboard.
- Experimentos de destilación y currículos de entrenamiento: la mezcla documentada de 8 datasets y el controlador de curriculum desacoplado permiten replicar recetas de preentrenamiento a pequeña escala.
- Pruebas de infraestructura de entrenamiento: validar pipelines con Muon + AdamW, EMA, `torch.compile` y kernels Triton personalizados antes de escalar a modelos mayores.
- Demostraciones educativas de generación de texto: ilustrar el comportamiento de un modelo de lenguaje mínimo en talleres y cursos, con expectativas ajustadas a su escala.
- Evaluación de atención dispersa recuperada: estudiar el impacto de SRVQ y del índice invertido causal en tareas de contexto corto (512 tokens) frente a atención densa.

## Benchmarks y rendimiento

Resultados reportados por el script de evaluación de BETU SLM Leaderboard:

| Modelo | HellaSwag | ARC-Easy | PIQA | ArithMark-3.0 | Tiny Theory of Mind | Base-Bench-1.1 | Overall Index |
|---|---|---|---|---|---|---|---|
| oscar128372/Lemma-2.2M | 28,22 % | 38,30 % | 55,60 % | 37,60 % | 30,10 % | 39,14 % | **13,78** |
| AxiomicLabs/GPT-S3-3M | 27,68 % | 34,76 % | 57,02 % | 38,90 % | 33,65 % | 38,00 % | **13,76** |
| bench-labs/pulvis-v2 | 27,93 % | 31,86 % | 56,86 % | 37,40 % | 32,70 % | 38,29 % | **12,65** |

Los dos modelos comparativos se reportan según BETU SLM Leaderboard. Lemma-2.2M ocupa el primer puesto de la categoría <3M en dicha clasificación a fecha de 13 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float16 (2,2M de parámetros ≈ 4,4 MB de pesos) más el estado de activaciones para contexto de 512 tokens; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); también es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en hardware integrado.
- Opciones de despliegue: al usar `custom_code` y `unified_lm`, requiere cargar con `trust_remote_code=True` en la librería `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall Index (BETU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lemma-2.2M | 2,2M | 512 | 13,78 | MIT | Hugging Face |
| AxiomicLabs/GPT-S3-3M | 3M | No disponible | 13,76 | No disponible | Hugging Face |
| bench-labs/pulvis-v2 | No disponible | No disponible | 12,65 | No disponible | Hugging Face |

## Limitaciones y advertencias

- Escala extremadamente reducida: con 2,2M de parámetros y 1,97B tokens de entrenamiento, la capacidad de conocimiento factual y de razonamiento complejo es muy limitada; no es apto para tareas de producción.
- Riesgo elevado de alucinación: la mezcla incluye un 34 % de datos sintéticos (cosmopedia-v2 y Ultra-FineWeb-L3 sintético), lo que puede amplificar afirmaciones plausibles pero falsas.
- Contexto muy corto (512 tokens): no admite conversaciones multi-turno largas ni documentos extensos.
- Solo inglés: no hay soporte multilingüe documentado.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de origen (web, Wikipedia, TinyStories) pueden introducir sesgos de representación y estereotipos.
- La model card está truncada en la sección de uso previsto y limitaciones, por lo que pueden existir advertencias adicionales del autor no recogidas aquí.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantías ni calidad suficiente para ello; conviene tratarlo como artefacto de investigación.
- Requiere `trust_remote_code=True` por el código personalizado (`unified_lm`), lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- No se documentan cuantizaciones ni soporte en runtimes de inferencia estándar, lo que limita su despliegue fuera de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oscar128372/Lemma-2.2M
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceTB/cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset roneneldan/TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset IFM/TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- BETU SLM Leaderboard (referenciado en la model card): no disponible
- Paper, blog o repositorio adicional: no disponible
