# edededdy/ChonkyKedi-nano-base

## Resumen
ChonkyKedi-nano-base es un modelo de lenguaje de tipo transformer decoder-only, estilo Llama, entrenado desde cero por el autor independiente edededdy. Con 25,17 millones de parámetros totales (12,59 millones excluyendo la tabla de embeddings), se posiciona como el segundo modelo más pequeño de la familia ChonkyKedi, que abarca desde 12,8M hasta 2.919,4M de parámetros con una arquitectura, tokenizador y pipeline de datos compartidos.

El modelo se ha preentrenado sobre 1.000 millones de tokens procedentes de una mezcla de seis fuentes (FineWeb-Edu, Cosmopedia v2, FineMath 4+, SmolTalk, Wikipedia en inglés y github-code-clean), lo que supone aproximadamente 79 tokens por parámetro no-embedding. Se trata de un modelo base, sin ajuste por instrucciones, orientado a investigación y experimentación educativa, no a producción.

Su relevancia radica en la transparencia del proceso: el autor documenta la arquitectura completa, la mezcla de datos, el esquema de learning rate (WSD), el hardware utilizado (una iGPU AMD Radeon 890M) y los resultados de evaluación zero-shot con intervalos de error, algo poco habitual en modelos de este tamaño. La licencia Apache 2.0 facilita su reutilización y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Llama (`llama_gqa`), pre-norm con RMSNorm |
| Parametros totales | 25.173.376 (25,17M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (RoPE con θ=10000; escalado YaRN disponible para contextos mayores) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bf16/fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,2 GB) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso con 8 capas, dimensión oculta de 384 y FFN SwiGLU de 1.024 unidades. La atención usa grouped-query attention con 6 cabezas de consulta que comparten 2 cabezas clave/valor, dimensión de cabeza 64 y QK-norm. Los embeddings de entrada y la cabeza de salida están atados, y la salida aplica logit soft-cap de 30 (`cap · tanh(logits / cap)`). El tokenizador es byte-level BPE con 32.768 tokens e incluye tokens especiales para chat, razonamiento y tool-calls.

El entrenamiento consumió 1.000 millones de tokens en una sola pasada, con 61.035 pasos de 16.384 tokens (batch 4 × 1.024 × 4 de acumulación). Se usó AdamW (β=0,9/0,95, ε=1e-8), weight decay 0,1 (no aplicado a normas), gradient clipping 1,0 y un schedule WSD: 1.831 pasos de warm-up, 50.049 pasos constantes a un pico de 2,5e-3 y decaimiento lineal hasta el 10% del pico en los últimos 9.155 pasos. Precisión bf16 autocast y un coste computacional estimado de ~7,6e16 FLOPs. Todo el entrenamiento se ejecutó en una iGPU AMD Radeon 890M (ROCm sobre Windows) durante 100,3 horas a ~3K tokens/s.

La mezcla de datos fue: FineWeb-Edu 60% (600M), Cosmopedia v2 (SmolLM-Corpus) 15% (150M), FineMath 4+ 10% (100M), SmolTalk 5% (50M), Wikipedia inglés (2023-11-01) 5% (50M) y github-code-clean 5% (50M). Se aplicó decontaminación con solapamiento de 10-gramas y coincidencias exactas de respuestas cortas contra los cinco conjuntos de evaluación, descartando 79 documentos en total.

## Capacidades
- Generación de texto en inglés: continuación de texto coherente y fluida sobre temas generales, con conocimiento factual muy limitado.
- Razonamiento básico y matemáticas elementales: influido por la inclusión de FineMath 4+ (10% del corpus), aunque sin garantías de corrección.
- Generación de código: el 5% del corpus es código de GitHub, por lo que puede producir fragmentos de código sencillos.
- Tokenizador con tokens especiales para chat, razonamiento y tool-calls, aunque el modelo base no está entrenado para seguirlos de forma fiable.
- Capacidades multilingües: limitadas al inglés; no se documenta soporte de otros idiomas.
- No soporta de forma fiable tool calling, function calling, agentes ni razonamiento multi-paso, al ser un modelo base sin ajuste por instrucciones.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso
- Investigación educativa sobre entrenamiento desde cero: el modelo sirve como caso de estudio reproducible de un pipeline completo (tokenizador, mezcla de datos, schedule WSD) a escala de una sola GPU de portátil.
- Experimentos de scaling laws: al compartir arquitectura, tokenizador y datos con el resto de la familia ChonkyKedi (desde pico hasta large), permite estudiar el efecto del tamaño sobre la pérdida de validación y el rendimiento zero-shot.
- Evaluación de técnicas de decontaminación: el autor documenta el proceso de filtrado (10-gramas, coincidencias exactas) contra los conjuntos de evaluación, lo que facilita replicar y comparar metodologías.
- Generación de texto de relleno o prototipado: para demos, tests de interfaz o pipelines de generación donde la corrección factual no es crítica y el coste computacional debe ser mínimo.
- Fine-tuning experimental de bajo coste: con 25M de parámetros y licencia Apache 2.0, cabe en cualquier GPU consumer para experimentos de ajuste supervisado o LoRA sobre tareas acotadas.
- Estudio de tokenizadores byte-level BPE: útil para analizar cómo un vocabulario de 32.768 tokens con tokens especiales de chat y tool-calls afecta a la generación en modelos diminutos.
- Benchmarking de infraestructura de inferencia: su reducido tamaño permite probar integraciones con vLLM, llama.cpp u Ollama (previa conversión a GGUF) con latencias muy bajas.

## Benchmarks y rendimiento

| Tarea | acc_norm | acc | Ítems | Split | Azar |
|---|---|---|---|---|---|
| BLiMP | 67,7% ± 0,2% | 71,8% | 67.000 | 67 fenómenos | 50% |
| SciQ | 62,7% ± 1,1% | 64,5% | 2.000 | validation + test | 25% |
| ARC-Easy | 36,8% ± 0,9% | 40,4% | 2.946 | validation + test | 25% |
| PIQA | 56,9% ± 1,2% | 57,0% | 1.838 | validation | 50% |
| HellaSwag | 26,7% ± 0,4% | 26,7% | 10.042 | validation | 25% |

Pérdida de validación: 3,676 nats/token (perplejidad 39,5) sobre una mezcla held-out. Evolución de la pérdida: 10,48 (0,00B tok) → 4,16 (0,15B) → 4,11 (0,29B) → 4,07 (0,43B) → 4,05 (0,57B) → 4,03 (0,72B) → 4,03 (0,86B) → 3,68 (1,00B).

Comparativa con modelos pequeños:

| | Este modelo | ChonkyKedi-pico-base | ChonkyKedi-mini-base | Pythia-70M | GPT-2 | Supra-50M |
|---|---|---|---|---|---|---|
| Parámetros totales | 25,2M | 12,8M | 72,6M | 70,4M | 124,4M | 51,8M |
| Parámetros no-embedding | 12,6M | 4,4M | 51,6M | 18,9M | 85,1M | 35,4M |
| Tokens de entrenamiento | 1,00B | 1,00B | 4,13B | 300B (the Pile) | no divulgado (WebText) | 20B (FineWeb-Edu) |
| BLiMP (acc_norm) | 67,7% | 66,0% | 74,5% | no disponible | no disponible | no disponible |
| SciQ (acc_norm) | 62,7% | 56,0% | 67,8% | 55,2% | 53,2% | 77,2% |
| ARC-Easy (acc_norm) | 36,8% | 33,2% | 43,6% | 35,0% | 42,0% | 52,2% |
| PIQA (acc_norm) | 56,9% | 56,6% | 60,6% | no disponible | no disponible | no disponible |
| HellaSwag (acc_norm) | 26,7% | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 0,1 GB en bf16 (25M de parámetros ≈ 50 MB de pesos); en fp32, unos 100 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, iGPU AMD Radeon 890M, etc.) y en placas tipo Raspberry Pi con suficiente RAM.
- Opciones de despliegue: transformers (nativo, safetensors), llama.cpp u Ollama previa conversión a GGUF; vLLM y TGI son compatibles aunque sobredimensionados para este tamaño.
- Latencia y throughput: el autor reporta ~3K tokens/s durante el entrenamiento en una iGPU AMD Radeon 890M; en inferencia sobre GPU dedicada se esperan latencias de milisegundos por token, aunque no se publican cifras oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ChonkyKedi-nano-base | 25,2M | 1.024 | Apache 2.0 | Hugging Face | Base, entrenado desde cero, 1B tokens |
| ChonkyKedi-mini-base | 72,6M | no disponible | Apache 2.0 | Hugging Face | Misma familia, 4,13B tokens, mejor BLiMP y SciQ |
| Pythia-70M | 70,4M | 2.048 | Apache 2.0 | Hugging Face | Entrenado sobre 300B tokens de the Pile |
| GPT-2 | 124,4M | 1.024 | MIT | Hugging Face | Entrenado sobre WebText, sin datos de entrenamiento divulgados |
| Supra-50M | 51,8M | no disponible | no disponible | Hugging Face | Entrenado sobre 20B tokens de FineWeb-Edu, mejor SciQ y ARC-Easy |

## Limitaciones y advertencias
- Es un modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene conversaciones de forma fiable.
- Conocimiento factual muy escaso y alta propensión a inventar datos con seguridad; el propio autor advierte que no debe usarse para nada que importe.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado exclusivamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo elevado de sesgos heredados de las fuentes de datos (web educativa, Wikipedia, código de GitHub), sin filtrado documentado más allá de la decontaminación.
- Rendimiento por debajo del azar en HellaSwag (26,7% frente a 25% de azar) y bajo en ARC-Easy (36,8%), lo que refleja poca capacidad de razonamiento de sentido común.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja su uso en producción por la baja calidad factual.
- No se documentan variantes cuantizadas ni resultados de benchmarks en formato GGUF; la conversión manual es responsabilidad del usuario.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/edededdy/ChonkyKedi-nano-base
- Pythia-70M (comparativa): https://huggingface.co/EleutherAI/pythia-70m
- GPT-2 (comparativa): https://huggingface.co/openai-community/gpt2
- Supra-50M (comparativa): https://huggingface.co/SupraLabs/Supra-50M-Base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Wikipedia (inglés): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
