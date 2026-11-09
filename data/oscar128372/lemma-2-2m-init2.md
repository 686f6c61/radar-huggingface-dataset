# oscar128372/Lemma-2.2M-init2

## Resumen

Lemma-2.2M-init2 es un modelo de lenguaje de escala microscópica (2,2 millones de parámetros) publicado por el usuario oscar128372 en Hugging Face bajo licencia MIT. Se trata de un experimento de preentrenamiento desde cero orientado a estudiar dos cuestiones concretas: el razonamiento numérico a nivel de token en un vocabulario BPE muy reducido (2.048 tokens) y el comportamiento de una arquitectura híbrida de atención dispersa-recurrente bajo restricciones extremas de parámetros y cómputo. El modelo se entrenó íntegramente en una única GPU NVIDIA T4 durante aproximadamente 6 horas (30.000 pasos, ~1,97 mil millones de tokens) y recibió cerca de una hora adicional de postentrenamiento sobre corpus de ciencia, QA y matemáticas sintéticas.

La relevancia del modelo no reside en su rendimiento absoluto, que es deliberadamente bajo y cercano al azar en varias tareas, sino en su valor como banco de pruebas reproducible de técnicas de arquitectura poco convencionales: mezclador convolucional causal multiescala, atención piramidal con recuperación vectorial cuantizada mediante SRVQ y un FFN con compuertas armónicas diferenciales. Todo ello con un tokenizador diseñado para aislar cada dígito y operador aritmético como token único, evitando la fragmentación de números.

Es, por tanto, un modelo de investigación y demostración de concepto, no un modelo de producción. Su utilidad práctica se limita a la experimentación arquitectónica, la docencia y la validación de pipelines de entrenamiento de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UnifiedLM: 3 bloques UnifiedTransformerBlock (transformer híbrido con MSCSM, RPA y FFN StarCarrier), d_model=192, n_heads=4, head_dim=48, embeddings atados |
| Parametros totales | 2.203.653 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (seq_len de entrenamiento); no se documenta extensión posterior |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo abandona el transformer vanilla y apila tres bloques `UnifiedTransformerBlock` con tres subcapas con escalado residual cada uno. La primera es un Multi-Scale Causal State Mixer (MSCSM): un mezclador convolucional causal depthwise con compuertas que combina tres ramas dilatadas (k=3, d=1; k=5, d=2; k=5, d=5) mediante pesos de enrutamiento softmax aprendidos, orientado a la inducción local de n-gramas. La segunda es una Residual Pyramid Attention (RPA) de tres rutas: una ventana local exacta de W=8 con Multi-Octave RoPE (bases rotatorias específicas por cabeza, espaciadas logarítmicamente de 64 a 262.144), una ruta de recuperación con cuantización vectorial esférica residual (SRVQ, L=1, M=16 codebooks actualizados por EMA) que recupera hasta 16 tokens históricos disjuntos de ventana por cabeza mediante un kernel Triton de índice invertido causal, y una ruta de registros globales (G=8) que agrega contexto previo a la ventana local con pooling exponencial acumulativo causal. La tercera subcapa es un FFN Harmonic Differential StarCarrier con hidden_dim=384, cancelación diferencial de claves, término de diferencia armónica con desplazamiento circular y compuerta dual squared-ReLU + SiLU antes de RMSNorm interno. El logit softcapping está fijado en 30,0.

El preentrenamiento usó precisión mixta FP16 con matmuls TF32, `torch.compile` y kernels Triton propios sobre una T4. La mezcla de datos es 82 % general y QA, 18 % matemáticas: Ultra-FineWeb-L3 (24 %), cosmopedia-v2 (20 %), TinyStories (14 %), Wikipedia en (12 %), TxT360-v2 QA (12 %), UltraData-Math (7 %), orca-math-word-problems-200k (6 %) y OpenMathInstruct-2 (5 %). El optimizador es híbrido: Muon (lr=0,03, momentum 0,95, ortogonalización Newton-Schulz de 5 pasos) para matrices de proyección 2D y AdamW fusionado (lr=1,5e-3, β=(0,9, 0,95), weight decay 0,01) para embeddings, normas y escalares de atención. Se mantienen pesos sombra EMA (decay=0,995) para evaluación y exportación, con un currículo de warmup cuadrático que desacopla las pérdidas auxiliares de compromiso y balance de SRVQ en los primeros pasos. No se documenta RLHF ni DPO; el postentrenamiento es continuación supervisada sobre QA, ciencia y matemáticas sintéticas.

## Capacidades

- Generación de texto en inglés a nivel de micro-modelo: completado de secuencias cortas y texto narrativo simple (influencia de TinyStories en la mezcla).
- Razonamiento aritmético de un solo dígito y operaciones básicas gracias al tokenizador aislado de dígitos y operadores (`+`, `-`, `*`, `/`, `=`, `(`, `)`).
- Respuesta a preguntas de conocimiento enciclopédico muy básico (Wikipedia y cosmopedia en el corpus).
- Capacidad limitada de QA extractivo y de sentido común, con rendimiento cercano al azar en la mayoría de benchmarks.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito (aunque parte del corpus incluye cadenas de pensamiento de OpenMathInstruct-2).
- Multilingüe: no; solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas híbridas atención-recurrencia: el modelo sirve como referencia reproducible para estudiar el comportamiento de MSCSM, RPA y SRVQ en un régimen de 2,2M parámetros, comparando ablaciones con un transformer vanilla del mismo tamaño.
- Docencia y divulgación: permite ilustrar de extremo a extremo un pipeline de preentrenamiento (tokenizador, mezcla de datos, optimizador híbrido, EMA) en una sola GPU T4 y en menos de 8 horas.
- Validación de tokenizadores numéricos: su BPE con pre-tokenización aislada de dígitos y operadores es un caso de estudio para medir el impacto de la fragmentación numérica en tareas aritméticas de modelos pequeños.
- Pruebas de kernels Triton: el kernel de índice invertido causal y las rutas de recuperación cuantizada sirven como banco de pruebas para desarrollo y depuración de kernels personalizados en GPUs de gama baja.
- Experimentos de destilación y curriculum: al ser entrenable en horas, es adecuado como alumno o como punto de partida para estudiar currículos de datos (por ejemplo, TinyStories frente a matemáticas) con presupuestos de cómputo mínimos.
- Generación de texto narrativo muy simple en inglés para demos educativas y pruebas de integración de pipelines de inferencia (carga de safetensors, tokenización, decodificación) sin coste de hardware significativo.

## Benchmarks y rendimiento

Evaluación zero-shot con la fórmula del Intelligence Index de Open SLM Leaderboard: P(score, chance) = (score − chance) / (100 − chance) × 100.

| Benchmark | Metrica | Score (acc_norm) | Precision raw / aux |
|---|---|---|---|
| HellaSwag (zero-shot) | acc_norm (azar 25 %) | 27,91 % ± 0,45 | 26,92 % raw |
| AI2 ARC-Easy | acc_norm (azar 25 %) | 34,34 % ± 0,97 | 36,32 % raw |
| AI2 ARC-Challenge | acc_norm (azar 25 %) | 20,99 % ± 1,19 | 17,15 % raw |
| AI2 ARC Combined | acc_norm (azar 25 %) | 27,67 % | 26,74 % media(E, C) |
| PIQA (validación) | acc_norm (azar 50 %) | 54,95 % ± 1,16 | 57,02 % raw |
| ArithMark-3.0 | acc_norm (azar 25 %) | 39,50 % ± 1,55 | 39,70 % raw |

| Pilar del Intelligence Index | Score (%) | Azar (%) | P(score, chance) | Peso |
|---|---|---|---|---|
| HellaSwag | 27,91 | 25,00 | +3,88 | 1,00 |
| ARC Combined | 27,67 | 25,00 | +3,56 | 1,00 |
| PIQA | 54,95 | 50,00 | +9,90 | 1,00 |
| ArithMark-3.0 | 39,50 | 25,00 | +19,33 | 0,60 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en FP16 (2,2M parámetros ≈ 4,4 MB de pesos más estados de activación y caché para contexto de 512 tokens); en la práctica, cualquier GPU con 1 GB o más es suficiente.
- GPU recomendadas: cualquier GPU moderna, incluida NVIDIA T4 (la usada en entrenamiento), GTX 1650, RTX 3060, RTX 4090, A100 o H100; también es viable en CPU.
- Cabe en cualquier GPU de consumo, incluidas iGPU y placas embebidas tipo Jetson.
- Opciones de despliegue: al publicarse solo en safetensors con código PyTorch propio, requiere cargar los pesos con la implementación del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Para CPU sería necesario exportar a GGUF, algo no disponible actualmente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lemma-2.2M-init2 | 2,2M | 512 | MIT | Hugging Face (safetensors, PyTorch) | Arquitectura híbrida experimental; benchmarks cercanos al azar salvo ArithMark |
| TinyStories-1M (Microsoft) | ~1M | 512 (típico) | MIT | Hugging Face | Transformer estándar entrenado en TinyStories; orientado a narrativa simple |
| TinyStories-33M (Microsoft) | ~33M | 512 (típico) | MIT | Hugging Face | Mayor tamaño, mejor coherencia narrativa; sin rutas de recuperación |
| Pythia-14M (EleutherAI) | 14M | 2.048 | Apache 2.0 | Hugging Face | Transformer denso con suite de checkpoints intermedios para investigación |

La comparación cuantitativa de benchmarks entre estos modelos no está disponible en la información proporcionada; los datos de TinyStories y Pythia no se incluyen en la búsqueda.

## Limitaciones y advertencias

- Rendimiento muy bajo: en HellaSwag, ARC-Easy y ARC-Challenge los resultados están a menos de 10 puntos porcentuales del azar, lo que indica una capacidad de razonamiento y conocimiento muy limitada.
- Riesgo elevado de alucinación y de texto incoherente fuera de dominios muy simples (narrativa tipo TinyStories o aritmética de un dígito).
- Contexto de solo 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés; no hay soporte multilingüe ni evaluación en otros idiomas.
- Sesgos: al entrenarse sobre mezclas web y sintéticas (Ultra-FineWeb-L3, cosmopedia, Wikipedia), puede reproducir sesgos de esos corpus; no se documenta ninguna mitigación.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no es adecuado para producción por su calidad; el autor lo etiqueta explícitamente como "Preview" experimental.
- Dependencia de código propio: la arquitectura no es estándar (MSCSM, RPA, SRVQ, StarCarrier), por lo que no se puede cargar con `transformers` sin la implementación del autor; esto complica la integración y el mantenimiento.
- Sin garantías de reproducibilidad más allá de lo descrito: no se publican semillas, versiones exactas de kernels Triton ni scripts de evaluación.
- Fecha de creación del repositorio (2026-11-08) y cero descargas: no hay validación comunitaria ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oscar128372/Lemma-2.2M-init2
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Wikipedia (20231101.en): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
