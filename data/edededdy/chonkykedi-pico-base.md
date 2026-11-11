# edededdy/ChonkyKedi-pico-base

## Resumen

ChonkyKedi-pico-base es un modelo de lenguaje denso de tipo Llama entrenado desde cero por el desarrollador independiente edededdy. Con 12,8 millones de parámetros totales (4,4 millones excluyendo la tabla de embeddings), se sitúa en la franja de los modelos "tiny" orientados a investigación y experimentación educativa, no a producción. Emplea una arquitectura decoder-only con grouped-query attention (4 cabezas de consulta compartiendo 2 de clave/valor), QK-norm, RoPE, SwiGLU y embeddings atados, sobre un contexto de 1.024 tokens.

El modelo se preentrenó con 1.000 millones de tokens en una sola pasada (unas 226 tokens por parámetro no-embedding) sobre una mezcla de FineWeb-Edu, Cosmopedia v2, FineMath 4+, SmolTalk, Wikipedia en inglés y github-code-clean. Es un modelo base: continúa texto, no sigue instrucciones. El autor lo describe explícitamente como un artefacto educativo y de investigación que escribe inglés fluido y sobre el tema, pero que conoce pocos hechos y alucina con confianza.

Su relevancia actual es la de un banco de pruebas de bajo coste: entrena en unas 97 horas sobre una iGPU de portátil (AMD Radeon 890M con ROCm), lo que lo convierte en una referencia útil para estudiar dinámicas de escalado, pipelines de datos y evaluación de modelos pequeños en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Llama (`llama_gqa`), pre-norm con RMSNorm (eps 1e-06) |
| Parametros totales | 12.816.384 (12,82 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (RoPE con theta 10000; escalado YaRN disponible para contextos mayores) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en bf16/fp32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,1 GB) |

Detalles adicionales de arquitectura: 6 capas, dimensión oculta 256, 4 cabezas de consulta y 2 de clave/valor con dimensión de cabeza 64, FFN SwiGLU con 704 unidades ocultas, embeddings de entrada y cabeza de salida atados, y soft-cap de logits de 30 (`cap · tanh(logits / cap)`).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con atención de consultas agrupadas (GQA) y QK-norm, una innovación habitual en modelos recientes que estabiliza el entrenamiento normalizando las representaciones de query y key. Usa RoPE para las posiciones, SwiGLU en la capa feed-forward y atado de embeddings para reducir el recuento de parámetros efectivos. El tokenizador es un BPE a nivel de byte con 32.768 tokens, que incluye tokens especiales de chat, razonamiento y llamadas a herramientas, aunque el modelo base no está entrenado para usarlos de forma fiable.

El entrenamiento consumió 1.000 millones de tokens en una única pasada, con 61.035 pasos de 16.384 tokens (batch 4 × 1.024 × 4 de acumulación), optimizador AdamW (β = 0,9/0,95, ε = 1e-8), weight decay 0,1 sin aplicar a las normas, clipping de gradiente 1,0 y precisión bf16. El scheduler es WSD: 1.831 pasos de warm-up, 50.049 constantes y decaimiento lineal al 10% del pico en los últimos 9.155 pasos, con un pico de 2,5e-3. El cómputo total fue de aproximadamente 2,7e16 FLOPs. La mezcla de datos fue 60% FineWeb-Edu (600M tokens), 15% Cosmopedia v2 (150M), 10% FineMath 4+ (100M), 5% SmolTalk (50M), 5% Wikipedia en inglés (50M) y 5% github-code-clean (50M). Se aplicó descontaminación de 10-gramas contra los cinco conjuntos de evaluación, eliminando 79 documentos, y el conjunto de validación proviene de shards que el flujo de entrenamiento nunca lee. Todo el entrenamiento se ejecutó en una AMD Radeon 890M (iGPU de portátil, ROCm sobre Windows) durante 97,3 horas a unos 5.000 tokens/s.

## Capacidades

- Generación de texto en inglés: completado de texto coherente y sobre el tema a nivel de frase, sin capacidad de seguir instrucciones.
- Modelado de lenguaje y puntuación de secuencias: útil para calcular log-probabilidades de texto, lo que permite usarlo como scorer en tareas de elección múltiple.
- Conocimiento factual mínimo: el autor advierte que conoce pocos hechos y alucina con confianza.
- Código: entrenado con un 5% de github-code-clean, por lo que puede continuar fragmentos de código sencillos, sin garantías de corrección.
- Matemáticas elementales: incluye FineMath 4+ en la mezcla, pero sin capacidad demostrada de razonamiento matemático fiable.
- Multilingüismo: limitado a inglés; no se documenta soporte de otros idiomas.
- Tool calling y agentes: el tokenizador reserva tokens especiales de chat, razonamiento y llamadas a herramientas, pero al ser un modelo base no hay soporte funcional de function calling ni de razonamiento multi-paso.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre escalado de modelos pequeños: sirve como punto de la curva "pico" (12,8M) para estudiar cómo evolucionan la pérdida de validación y las métricas zero-shot al crecer hacia nano, micro, mini y small dentro de la misma familia, con arquitectura, tokenizador y pipeline de datos idénticos.
- Docencia y formación en entrenamiento desde cero: su coste de cómputo (97 horas en una iGPU de portátil) permite reproducir el pipeline completo en hardware asequible y estudiar decisiones de diseño como GQA, QK-norm, WSD o atado de embeddings.
- Evaluación de pipelines de descontaminación: el modelo documenta el proceso de eliminación de 79 documentos por solapamiento de 10-gramas, lo que lo convierte en un caso de estudio para validar herramientas de decontaminación de datasets.
- Puntuación de secuencias (scoring): al ser un modelo de lenguaje puro, puede emplearse para calcular log-probabilidades de respuestas candidatas en experimentos de evaluación tipo acc_norm, como los que el propio autor reporta en BLiMP o SciQ.
- Generación de texto creativo a pequeña escala: completado de frases y párrafos breves en inglés para demos, pruebas de interfaz o prototipos de aplicaciones de texto donde la calidad factual no sea crítica.
- Baseline en experimentos de comparación: referencia ligera y de licencia Apache 2.0 para contrastar técnicas de tokenización, mezclas de datos o inicialización frente a otros modelos tiny como Pythia-70M o GPT-2.
- Pruebas de infraestructura de inferencia: su tamaño (0,1 GB en safetensors) permite validar despliegues de servidores de inferencia y pipelines de carga de pesos en entornos con recursos mínimos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (zero-shot, `main.py --mode bench`):

| Tarea | acc_norm | acc | Items | Split | Azar |
|---|---|---|---|---|---|
| BLiMP | 66,0% ± 0,2% | 70,2% | 67.000 | 67 fenómenos | 50% |
| SciQ | 56,0% ± 1,1% | 57,8% | 2.000 | validación + test | 25% |
| ARC-Easy | 33,2% ± 0,9% | 36,0% | 2.946 | validación + test | 25% |
| PIQA | 56,6% ± 1,2% | 56,4% | 1.838 | validación | 50% |
| HellaSwag | 26,5% ± 0,4% | 26,4% | 10.042 | validación | 25% |

Métricas de validación: pérdida de validación de 3,885 nats/token (perplejidad 48,7) sobre una mezcla held-out. La pérdida evolucionó de 10,43 (0,00B tokens) a 4,31 (0,15B), 4,27 (0,29B), 4,24 (0,43B), 4,23 (0,57B), 4,22 (0,72B), 4,20 (0,86B) y 3,88 (1,00B tokens).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (12,8M parámetros ≈ 51 MB de pesos) y unos 26 MB en bf16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte de PyTorch o ROCm; el propio autor entrenó en una AMD Radeon 890M (iGPU). Funciona también en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: PyTorch/Hugging Face Transformers de forma nativa; no se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son viables técnicamente pero desproporcionados para este tamaño.
- Latencia y throughput: no se publican cifras de inferencia. Como referencia, el entrenamiento alcanzó unos 5.000 tokens/s en una iGPU de portátil; la inferencia en GPU moderna será muy superior, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | No-embedding | Tokens de entrenamiento | BLiMP (acc_norm) | SciQ (acc_norm) | ARC-Easy (acc_norm) | PIQA (acc_norm) | HellaSwag (acc_norm) | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| **ChonkyKedi-pico-base** | 12,8M | 4,4M | 1,00B | 66,0% | 56,0% | 33,2% | 56,6% | 26,5% | Apache 2.0 |
| ChonkyKedi-nano-base | 25,2M | 12,6M | 1,00B | 67,7% | 62,7% | 36,8% | 56,9% | 26,5%* | Apache 2.0 |
| ChonkyKedi-mini-base | 72,6M | 51,6M | 4,13B | 74,5% | 67,8% | 43,6% | 60,6% | no disponible | Apache 2.0 |
| Pythia-70M | 70,4M | 18,9M | 300B (the Pile) | no disponible | 55,2% | 35,0% | no disponible | no disponible | Apache 2.0 |
| GPT-2 | 124,4M | 85,1M | no divulgado (WebText) | no disponible | 53,2% | 42,0% | no disponible | no disponible | MIT |
| Supra-50M | 51,8M | 35,4M | 20B (FineWeb-Edu) | no disponible | 77,2% | 52,2% | no disponible | no disponible | no disponible |

*El valor de HellaSwag para nano aparece truncado en la información disponible; se indica como no confirmado.

La comparación muestra que, pese a su tamaño mínimo, pico-base supera ligeramente a Pythia-70M en SciQ (56,0% frente a 55,2%) y a GPT-2 en SciQ (56,0% frente a 53,2%), aunque queda por debajo en ARC-Easy. Supra-50M, con 20 veces más tokens de entrenamiento, lo supera con claridad.

## Limitaciones y advertencias

- Alucinación severa: el autor advierte explícitamente que el modelo "conoce pocos hechos y se inventa cosas con confianza"; no debe usarse para nada que importe.
- No sigue instrucciones: es un modelo base; no responde a prompts instructivos ni a formatos de chat de forma fiable.
- Contexto muy limitado: 1.024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Solo inglés: no hay soporte documentado de otros idiomas.
- Conocimiento factual y razonamiento muy limitados: los resultados en ARC-Easy (33,2%), HellaSwag (26,5%) y PIQA (56,6%) están cerca del azar o solo ligeramente por encima.
- Capacidad de código y matemáticas marginal: aunque se incluyeron datos de ambos dominios, no hay evaluación publicada que demuestre competencia.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones técnicas hacen desaconsejable cualquier despliegue en producción.
- Sin cuantizaciones publicadas: la ausencia de GGUF limita el uso directo en llama.cpp u Ollama sin conversión manual.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Advertencia de la model card: el contenido de la model card es material de referencia del autor y no debe interpretarse como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edededdy/ChonkyKedi-pico-base
- Pythia-70M (comparativa): https://huggingface.co/EleutherAI/pythia-70m
- GPT-2 (comparativa): https://huggingface.co/openai-community/gpt2
- Supra-50M (comparativa): https://huggingface.co/SupraLabs/Supra-50M-Base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
