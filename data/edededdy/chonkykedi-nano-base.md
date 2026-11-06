# edededdy/ChonkyKedi-nano-base

## Resumen

ChonkyKedi-nano-base es un modelo de lenguaje denso de estilo Llama, entrenado desde cero por el desarrollador independiente edededdy. Con 25,17 millones de parámetros totales (12,59 millones excluyendo la tabla de embeddings), se posiciona como el segundo escalón de la familia ChonkyKedi, una serie de modelos que comparten arquitectura, tokenizador y pipeline de datos y que solo difieren en escala (desde `pico` con 12,8M hasta `large` con 2.919M). Se trata de un modelo base, previo a cualquier ajuste por instrucciones: continúa texto, no sigue órdenes.

El modelo se entrenó sobre exactamente 1.000 millones de tokens (aproximadamente 79 tokens por parámetro no-embedding) mezclando FineWeb-Edu, Cosmopedia v2, FineMath 4+, SmolTalk, Wikipedia en inglés y código de GitHub. La relevancia de este artefacto es fundamentalmente educativa y de investigación: demuestra que es posible entrenar un modelo de lenguaje funcional desde cero en hardware de consumo (una iGPU AMD Radeon 890M de portátil) en unas 100 horas, con un coste computacional de aproximadamente 7,6e16 FLOPs.

Arquitectónicamente es un transformer decoder-only denso con grouped-query attention (6 cabezas de query compartiendo 2 de key/value), QK-norm, SwiGLU, RoPE y embeddings atados. Su ventana de contexto es de 1.024 tokens, y el autor indica que dispone de escalado YaRN para contextos más largos. El modelo es explícitamente presentado por su autor como un artefacto de investigación que "escribe inglés fluido y sobre el tema, pero sabe pocos hechos y se inventa cosas con confianza".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Llama (`llama_gqa`), pre-norm con RMSNorm |
| Parametros totales | 25.173.376 (25,17M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (escalado YaRN disponible para contextos mayores) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bf16/fp32; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 8 capas, hidden size 384, 6 cabezas de query y 2 de key/value con dimensión de cabeza 64, FFN SwiGLU de 1024, RoPE con θ = 10000, embeddings de entrada y cabeza de salida atados, logit soft-cap de 30 (`cap · tanh(logits / cap)`), tokenizador BPE byte-level de 32.768 tokens con tokens especiales para chat, razonamiento y tool-calls.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con atención de grupo (GQA): 6 cabezas de query comparten 2 cabezas de key/value, lo que reduce el coste de memoria del KV cache. Incorpora QK-norm, normalización RMSNorm con epsilon 1e-06 en pre-norm, activación SwiGLU en la FFN y RoPE para codificación posicional. La tabla de embeddings de entrada está atada a la cabeza de salida, lo que explica la diferencia entre parámetros totales (25,17M) y no-embedding (12,59M).

El entrenamiento consumió 1.000 millones de tokens en una sola pasada, con 61.035 pasos de 16.384 tokens cada uno (batch 4 × 1.024 × 4 de acumulación). Se usó AdamW (β = 0,9 y 0,95, ε = 1e-8), weight decay 0,1 (no aplicado a las normas), clipping de gradiente 1,0 y precisión bf16 con autocast. El schedule de learning rate es WSD: 1.831 pasos de warm-up, 50.049 pasos constantes a un pico de 2,5e-3 y decaimiento lineal hasta el 10% del pico en los últimos 9.155 pasos. La mezcla de datos fue: FineWeb-Edu sample/100BT (60%, 600M tokens), Cosmopedia v2 de SmolLM-Corpus (15%, 150M), FineMath 4+ (10%, 100M), SmolTalk (5%, 50M), Wikipedia inglesa de 2023-11-01 (5%, 50M) y github-code-clean (5%, 50M). Se aplicó decontaminación por solapamiento de 10-gramas contra los cinco conjuntos de evaluación, eliminando 79 documentos. Todo el entrenamiento se realizó en una única AMD Radeon 890M (iGPU de portátil, ROCm sobre Windows) durante 100,3 horas a ~3K tokens/s.

## Capacidades

- Generación de texto en inglés: continuación de texto coherente y fluida sobre temas generales, con estilo de página web educativa, texto enciclopédico o conversación.
- Modelado de lenguaje base: no está ajustado por instrucciones, por lo que no responde a órdenes ni sigue formatos de chat de forma fiable.
- Razonamiento matemático básico: el 10% de FineMath 4+ en el corpus le da cierta exposición a contenido matemático, aunque sin garantías de corrección.
- Generación de código: exposición limitada al 5% de github-code-clean; puede producir fragmentos sintácticamente plausibles pero no es fiable.
- Tokenizador con tokens especiales para chat, razonamiento y tool-calls: la infraestructura existe en el tokenizador, pero el modelo base no ha sido entrenado para usarlos de forma efectiva.
- Multilingüismo: únicamente inglés; no se declara soporte para otros idiomas.
- Sin capacidades de visión, audio ni tool calling funcional en esta versión base.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: sirve como referencia reproducible para estudiar el efecto de la escala, la mezcla de datos y el schedule WSD en modelos pequeños; el autor documenta hiperparámetros, curva de pérdida y hardware.
- Experimentos de destilación y ajuste fino: sus 25M de parámetros y licencia Apache 2.0 lo hacen adecuado como alumno en pipelines de destilación desde modelos mayores o como base para SFT/DPO a pequeña escala.
- Pruebas de infraestructura de inferencia: al caber holgadamente en cualquier GPU consumer e incluso en CPU, es útil para validar despliegues con vLLM, llama.cpp u Ollama antes de escalar a modelos mayores.
- Generación de texto sintético de bajo coste: para tareas donde la fluidez importa más que la veracidad (por ejemplo, relleno de plantillas o aumento de datos), su velocidad y huella mínima lo hacen viable en hardware modesto.
- Benchmarking de técnicas de cuantización: permite medir el impacto de cuantizar a 8, 4 o menos bits en un modelo diminuto con pérdida de validación conocida (3,676 nats/token).
- Enseñanza de arquitecturas transformer: su código y configuración compactos (8 capas, GQA, QK-norm, SwiGLU) lo convierten en un ejemplo didáctico manejable para cursos y talleres.
- Prototipado de tokenizadores y pipelines de datos: al compartir tokenizador y pipeline con toda la familia ChonkyKedi, sirve para validar preprocesado antes de entrenar escalas mayores.

## Benchmarks y rendimiento

| Tarea | acc_norm | acc | Items | Azar |
|---|---|---|---|---|
| BLiMP | 67,7% ± 0,2% | 71,8% | 67.000 | 50% |
| SciQ | 62,7% ± 1,1% | 64,5% | 2.000 | 25% |
| ARC-Easy | 36,8% ± 0,9% | 40,4% | 2.946 | 25% |
| PIQA | 56,9% ± 1,2% | 57,0% | 1.838 | 50% |
| HellaSwag | 26,7% ± 0,4% | 26,7% | 10.042 | 25% |

Pérdida de validación en mezcla held-out: 3,676 nats/token (perplejidad 39,5). La curva de pérdida durante el entrenamiento fue 10,48 (0,00B tokens) → 4,16 (0,15B) → 4,11 (0,29B) → 4,07 (0,43B) → 4,05 (0,57B) → 4,03 (0,72B) → 4,03 (0,86B) → 3,68 (1,00B). El autor indica que cada ítem de cada conjunto fue evaluado (no muestras) y que el ± corresponde a un error estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (25,17M parámetros × 2 bytes ≈ 50 MB de pesos, más KV cache y overhead del runtime). En la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, iGPU y cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.). Para entrenamiento, el autor usó una AMD Radeon 890M.
- Cabe en cualquier GPU consumer: sí, holgadamente, incluidas iGPU de portátiles y placas como Raspberry Pi (en CPU).
- Opciones de despliegue: transformers (PyTorch), llama.cpp (previa conversión a GGUF, no publicada), Ollama (previa conversión), vLLM (soporte para arquitecturas Llama estándar, aunque el tamaño hace innecesario el motor de serving). No se publican artefactos GGUF ni cuantizaciones.
- Latencia y throughput: no disponibles de forma oficial. El autor reporta ~3K tokens/s durante el entrenamiento en una Radeon 890M; la inferencia en GPU moderna debería superar holgadamente esa cifra, pero no se han publicado mediciones.

## Comparativa con modelos similares

| | ChonkyKedi-nano-base | ChonkyKedi-mini-base | Pythia-70M | GPT-2 | Supra-50M-Base |
|---|---|---|---|---|---|
| Parámetros totales | 25,2M | 72,6M | 70,4M | 124,4M | 51,8M |
| Parámetros no-embedding | 12,6M | 51,6M | 18,9M | 85,1M | 35,4M |
| Tokens de entrenamiento | 1,00B | 4,13B | 300B (the Pile) | no divulgado (WebText) | 20B (FineWeb-Edu) |
| BLiMP (acc_norm) | 67,7% | 74,5% | no disponible | no disponible | no disponible |
| SciQ (acc_norm) | 62,7% | 67,8% | 55,2% | 53,2% | 77,2% |
| ARC-Easy (acc_norm) | 36,8% | 43,6% | 35,0% | 42,0% | 52,2% |
| PIQA (acc_norm) | 56,9% | 60,6% | no disponible | no disponible | no disponible |
| HellaSwag (acc_norm) | 26,7% | 29,8% | no disponible | 29,5% | 31,8% |
| Pérdida de validación | 3,676 | 3,129 | no disponible | no disponible | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 | MIT | no disponible |

El modelo queda por debajo de ChonkyKedi-mini-base en todas las tareas comparadas, coherente con su menor escala y menor presupuesto de tokens (1B frente a 4,13B). Frente a Pythia-70M y GPT-2 supera en SciQ y está en línea en ARC-Easy y HellaSwag, pese a tener menos parámetros no-embedding. Supra-50M-Base, con 20B tokens de entrenamiento, obtiene resultados claramente superiores, lo que ilustra el peso del presupuesto de datos en esta escala.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes, no mantiene formato de chat de forma fiable y no debe usarse como asistente conversacional.
- Alucinación severa: el propio autor advierte que "sabe pocos hechos y se inventa cosas con confianza"; no es apto para usos donde la veracidad importe.
- Contexto limitado a 1.024 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperación aumentada con muchos fragmentos.
- Solo inglés: no se declara ni se evalúa soporte multilingüe.
- Conocimiento factual muy limitado: con 1B tokens de entrenamiento y 25M de parámetros, la cobertura de hechos es mínima.
- Riesgo de sesgos: el corpus (FineWeb-Edu, Wikipedia, GitHub) puede introducir sesgos de representación y de dominio; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente su uso en producción ("Don't use it for anything that matters").
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas en el repo, lo que obliga a convertirlas manualmente si se quiere desplegar en llama.cpp u Ollama.
- Sin datos de latencia ni throughput de inferencia publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edededdy/ChonkyKedi-nano-base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-Corpus (Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Wikipedia (English, 2023-11-01): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Modelo comparable Pythia-70M: https://huggingface.co/EleutherAI/pythia-70m
- Modelo comparable GPT-2: https://huggingface.co/openai-community/gpt2
- Modelo comparable Supra-50M-Base: https://huggingface.co/SupraLabs/Supra-50M-Base
