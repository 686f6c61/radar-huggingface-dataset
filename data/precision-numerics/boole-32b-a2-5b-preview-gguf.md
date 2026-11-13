# precision-numerics/Boole-32B-A2.5B-Preview-GGUF

## Resumen

Boole-32B-A2.5B-Preview es una versión comprimida y cuantizada del modelo Flint de RecursiveSI, distribuida en formato GGUF por Precision Numerics. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 32 mil millones de parámetros totales y 2,5 mil millones activos por token, que ha sido reducido a un fichero de 9,0 GB mediante una combinación de poda de expertos enrutados y cuantización extrema de los mismos. El objetivo declarado es ofrecer un modelo de gran tamaño que quepa y funcione con rapidez en una única GPU de consumo.

La propuesta técnica es agresiva: se han podado 2.491 de los 12.032 expertos enrutados originales (un 21 %) y los restantes se almacenan a 1, 2 o 4 bits por experto, con una media de 1,8 bits por peso. El resto de pesos (incluido el router, que se mantiene en BF16) se cuantiza a 4 bits. Según la model card, esto permite decodificar el doble de rápido que el GGUF de Flint más veloz en una RTX 5090.

Es relevante ahora porque demuestra una vía distinta a la cuantización uniforme clásica (tipo IQ o Q4_K_M): la combinación de poda selectiva de expertos con precisión mixta por experto. El resultado es un modelo que ocupa menos que un UD-IQ1_M de Unsloth (11,4 GB) y se ejecuta notablemente más rápido, a costa de una pérdida medible pero moderada en benchmarks. La licencia es Apache 2.0 y el modelo base es Flint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parámetros totales | 31.949.291.040 (≈32B) |
| Parámetros activos | 2,5B |
| Longitud de contexto | 65.536 tokens (usado en evaluación) |
| Tipos de cuantización | Expertos enrutados a 1, 2 o 4 bits (media 1,8 bits/peso); resto de pesos a 4 bits; router en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una compresión del Flint de RecursiveSI, que a su vez es un transformer con arquitectura MoE. Boole no se ha reentrenado: es un proceso de compresión post-hoc sobre los pesos de Flint. Concretamente, se podaron 2.491 de los 12.032 expertos enrutados (quedan 9.541) y los expertos restantes se almacenan con precisión variable de 1, 2 o 4 bits por experto, alcanzando una media de 1,8 bits por peso. El router se mantiene en BF16 para preservar la calidad de la selección de expertos, y el resto de pesos no-expertos se cuantiza a 4 bits.

La innovación principal es el esquema de precisión mixta a nivel de experto combinado con poda: en lugar de aplicar un único tipo de cuantización a todos los tensores, se asigna distinta precisión a cada experto y se eliminan los menos relevantes. Esto reduce el tamaño a 9,0 GB y, según el autor, mejora la velocidad de decodificación (2,03x en tg128 frente al mejor baseline) y de procesamiento de prompt (1,52x en pp512) en una RTX 5090. No se dispone de información sobre el dataset de entrenamiento original de Flint, el número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repo).
- Razonamiento matemático: GSM8K con 93,2 de puntuación en la evaluación del autor.
- Generación de código: HumanEval+ (90,0), MBPP+ (76,7) y LiveCodeBench v6 (67,3).
- Seguimiento de instrucciones: IFEval prompt-strict (90,6) e IFBench prompt-strict (75,9).
- Compatible con endpoints (`endpoints_compatible`), lo que sugiere uso en infraestructura de inferencia estándar.
- Ejecutable en llama.cpp (el autor mantiene un fork propio).
- Capacidades multilingües: no disponible.
- Tool calling, modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en una sola GPU de consumo: con 9,0 GB de pesos, el modelo cabe holgadamente en una RTX 5090 (32 GB) y deja margen para KV cache de contexto largo; es adecuado para prototipos y demos locales de un modelo de 32B sin infraestructura de datacenter.
- Servicio de chat de alta concurrencia: el autor reporta hasta 10.057 tok/s de throughput agregado con 32 peticiones concurrentes (8K prompt / 1K output) en una RTX 5090, lo que lo hace viable para atender múltiples usuarios en un único nodo.
- Generación de código asistida en local: con HumanEval+ de 90,0 y soporte de llama.cpp, puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de tests en entornos con GPU de consumo.
- Razonamiento matemático y resolución de problemas: GSM8K de 93,2 lo sitúa como opción para tutores automáticos o verificación de cálculos, siempre con validación posterior dado el riesgo de alucinación.
- Procesamiento de documentos largos: la ventana de 65.536 tokens permite resumir o extraer información de contratos, informes o transcripciones en una sola pasada.
- Evaluación e investigación de técnicas de cuantización: al ser un artefacto de compresión con precisión mixta por experto, es útil como caso de estudio reproducible para comparar poda de expertos frente a cuantización uniforme.
- Inferencia en el borde con presupuesto de VRAM ajustado: 9,0 GB permiten ejecutarlo en GPUs de 12-16 GB con contexto reducido, algo imposible con el Flint BF16 (79,6 GB) o el INT4 (26,0 GB).

## Benchmarks y rendimiento

Resultados publicados por el autor (media ± error estándar; temperatura 1.0, top-p 0.95, top-k 20, contexto de 65.536 tokens):

| Benchmark | Boole-32B-A2.5B (9,0 GB) | Unsloth UD-IQ1_M (11,4 GB) | Flint INT4 (26,0 GB) | Flint BF16 (79,6 GB) |
|---|---|---|---|---|
| GSM8K | 93,2 ± 0,3 | 94,9 ± 0,1 | 95,8 ± <0,1 | 96,1 ± <0,1 |
| IFEval (prompt-strict) | 90,6 ± 0,1 | 93,5 ± 0,2 | 94,9 ± 0,2 | 94,8 ± 0,2 |
| IFBench (prompt-strict) | 75,9 ± 1,5 | 82,6 ± 0,5 | 87,7 ± 0,6 | 89,2 ± 0,4 |
| LiveCodeBench v6 | 67,3 ± 1,1 | 77,2 ± 0,5 | 81,3 ± 1,0 | 81,9 ± 0,3 |
| HumanEval+ | 90,0 ± 1,2 | 90,5 ± 1,0 | 92,5 ± 0,7 | 92,7 ± 0,9 |
| MBPP+ | 76,7 ± 0,3 | 78,5 ± 0,7 | 78,9 ± 0,7 | 79,8 ± 0,2 |

LiveCodeBench v6: 454 problemas, agosto 2024 – mayo 2025.

Rendimiento en una RTX 5090 (llama-bench):

| Métrica | Boole-32B-A2.5B | Unsloth UD-IQ1_M | Flint INT4 |
|---|---|---|---|
| Prompt processing pp512 (tok/s) | 18.297 ± 42 | 11.882 ± 8 | 12.013 ± 18 |
| Decode tg128 (tok/s) | 565,8 ± 0,4 | 264,9 ± 0,2 | 279,4 ± 0,3 |
| Time to first token, prompt 8K (s) | 0,44 | 0,61 | 0,62 |
| Throughput máximo, 8K/1K (tok/s) | 10.057 a 32 concurrentes | no disponible | no disponible |

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 9,0 GB; con KV cache para contexto largo hay que sumar varios GB adicionales. Para 65.536 tokens conviene una GPU de 24-32 GB.
- GPU recomendadas: RTX 5090 (mediciones oficiales del autor), A100 40/80 GB, H100, L40S. En GPUs de 16 GB funciona con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con contexto amplio; en RTX 4080/4070 Ti Super (16 GB) con contexto moderado.
- Opciones de despliegue: llama.cpp (el autor mantiene un fork específico), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, servidores OpenAI-compatibles basados en llama.cpp). vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: 0,44 s de time-to-first-token con prompt de 8K; 565,8 tok/s de decodificación y 18.297 tok/s de prefill en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Boole-32B-A2.5B-Preview | 32B totales / 2,5B activos (MoE) | 9,0 GB | 65.536 | Apache 2.0 | Poda de expertos + cuantización mixta 1,8 bits/peso |
| Unsloth UD-IQ1_M (Flint) | 32B / 2,5B (MoE) | 11,4 GB | no disponible | Apache 2.0 (heredada) | Cuantización uniforme IQ1_M; mejor calidad media, ~2x más lento en decodificación |
| Flint INT4 | 32B / 2,5B (MoE) | 26,0 GB | no disponible | Apache 2.0 | Cuantización INT4; calidad cercana al BF16, requiere GPU de 32 GB o más |
| Flint BF16 | 32B / 2,5B (MoE) | 79,6 GB | no disponible | Apache 2.0 | Referencia de calidad; requiere múltiples GPUs o 80 GB |

## Limitaciones y advertencias

- La compresión es agresiva: la pérdida de calidad es medible y significativa en tareas de código e instrucciones (LiveCodeBench cae de 81,9 a 67,3; IFBench de 89,2 a 75,9 respecto al BF16).
- La cuantización a 1-2 bits en expertos puede degradar la coherencia en dominios poco representados; no hay evaluación por dominio publicada.
- Riesgo de alucinación inherente a modelos de este tamaño; la poda de expertos puede acentuarlo en áreas especializadas.
- Idiomas soportados no documentados; no se recomienda asumir buen rendimiento multilingüe sin validación propia.
- Es una versión "Preview" con 1 descarga y 0 likes en el momento de la consulta: no hay validación independiente de los resultados del autor.
- Requiere el fork de llama.cpp del autor para aprovechar las optimizaciones de velocidad; con llama.cpp estándar el rendimiento puede diferir.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Flint antes de uso comercial en producción.
- No hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/precision-numerics/Boole-32B-A2.5B-Preview-GGUF
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- Repositorio de demo: https://github.com/PrecisionNumerics/boole-demo
- Fork de llama.cpp: https://github.com/PrecisionNumerics/llama.cpp
