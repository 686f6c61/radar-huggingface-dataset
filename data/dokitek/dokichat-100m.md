# Dokitek/Dokichat-100M

## Resumen

Dokichat-100M es un modelo de lenguaje en francés de 99,9 millones de parámetros entrenado desde cero por Dokitek, un proyecto de aprendizaje personal. Se trata del modelo base (pretrained), orientado a completado de texto plano, no a diálogo; la versión conversacional se publica por separado como Dokichat-100M-Instruct. Su relevancia radica en que demuestra que es posible entrenar un modelo competitivo en una única GPU de consumo (RTX 4080 de 16 GB) en unas 42 horas, con un presupuesto muy reducido.

La arquitectura sigue el diseño denso de Qwen3 (`Qwen3ForCausalLM`), escalado a 26 capas de anchura 512, con atención multi-cabeza completa (8 cabezas de 64), QK-norm, RoPE con θ = 10.000, SwiGLU de 1.408 y RMSNorm pre-norm sin sesgos. Los embeddings de entrada y salida están atados. El contexto es de 2.048 tokens y el tokenizador es un BPE a nivel de byte de 32.000 tokens entrenado específicamente sobre francés.

El modelo se entrenó sobre 10.000 millones de tokens de texto web francés procedente de FineWeb2-HQ (`fra_Latn`), sin repetición de datos. Según la model card, iguala en media a modelos de 3 a 5 veces más parámetros (LFM2-350M, Qwen2.5-0.5B) y lidera todas las métricas de gramática, vocabulario y comprensión lectora en francés por debajo de 1B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (`Qwen3ForCausalLM`), denso |
| Parametros totales | 99,9M (embeddings de entrada y salida atados) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16; no se publican GGUF ni otras variantes) |
| Idiomas soportados | francés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM |

Detalles adicionales de arquitectura: 26 capas, hidden size 512, 8 cabezas de atención de 64 dimensiones, feed-forward SwiGLU de 1.408, RMSNorm pre-norm sin sesgos, RoPE con θ = 10.000, tokenizador BPE a nivel de byte de 32.000 tokens.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso que replica el diseño de Qwen3 a escala reducida. La elección de una geometría profunda y estrecha (26 capas de anchura 512) frente a una ancha y superficial sigue la evidencia de MobileLLM (Liu et al., 2024) de que, en este rango de tamaño, la profundidad aporta más capacidad que la anchura. Al conservar el layout de pesos de Qwen3, el modelo carga en `transformers` y `vLLM` sin código personalizado.

El entrenamiento se realizó sobre aproximadamente 11.400 millones de tokens tras tokenizar (10.000 millones efectivos, cada ventana de 2.048 tokens vista una sola vez, sin repetición) de texto web francés de FineWeb2-HQ, el 10% superior de FineWeb-2 según un clasificador de calidad. El schedule consistió en una primera fase de 2.000 millones de tokens y una segunda de 10.000 millones continuada desde el checkpoint pre-decay, con AdamW (β₂ = 0,95, weight decay 0,1), learning rate warmup-stable-decay con pico de 1,5 × 10⁻³ y decaimiento lineal en el último 20%, batches de 524.000 tokens y precisión mixta en bfloat16. Todo el entrenamiento se ejecutó en una NVIDIA RTX 4080 de 16 GB durante unas 42 horas, a 52 TFLOPS (54% del pico), alcanzando una pérdida de validación final de 2,68 (aproximadamente 0,85 bits por byte).

No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación para el modelo base.

## Capacidades

- Generación y completado de texto en francés: el modelo es un modelo base de completado, no un asistente conversacional.
- Competencia lingüística en francés: gramática, vocabulario y comprensión lectora, donde según la model card supera a todos los modelos por debajo de 1B evaluados.
- Razonamiento de sentido común y conocimiento del mundo limitados: en tareas como ARC-Challenge-fr y Belebele los resultados se mantienen cerca del azar.
- Soporte de tool calling / function calling: no disponible en el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en el modelo base.
- Capacidades multilingües: no, únicamente francés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad de despliegue: carga directa en `transformers` y servicio con `vLLM serve Dokitek/Dokichat-100M`.

## Casos de uso

- Completado de texto en francés en aplicaciones editoriales: el modelo puede autocompletar frases y párrafos en herramientas de redacción, aprovechando su tokenizador específico para francés y su buena puntuación en gramática y vocabulario.
- Filtrado y puntuación de texto por verosimilitud: al ser un modelo base, puede usarse para calcular la probabilidad de secuencias francesas en tareas de corrección, detección de errores o ranking de candidatos.
- Prototipado e investigación educativa: sirve como caso de estudio reproducible de entrenamiento desde cero en una sola GPU de consumo, con arquitectura y schedule documentados, para cursos y experimentos de scaling.
- Generación de datos sintéticos en francés a pequeña escala: puede producir texto de relleno o variantes para aumentar datasets, siempre con revisión humana dada su tendencia a la alucinación.
- Experimentos de destilación y fine-tuning: su tamaño de 100M permite ajustarlo en hardware modesto como base para tareas específicas (clasificación, extracción, estilo) en francés.
- Despliegue en entornos con recursos muy limitados: al ocupar aproximadamente 0,2 GB en bfloat16, puede servirse en CPU o GPUs de gama baja para demos y servicios de bajo tráfico.
- Evaluación comparativa de modelos pequeños: útil como referencia reproducible en benchmarks franceses con harness estándar (lm-evaluation-harness).

## Benchmarks y rendimiento

Resultados publicados en la model card (accuracy en %, 0-shot, formulación cloze por log-verosimilitud, lm-evaluation-harness 0.4.13, bfloat16, solo modelos base; en negrita el mejor modelo por debajo de 1B):

| Benchmark | Random | Dokichat-100M | SmolLM2-135M | Gemma 3 270M | Pleias-350m | LFM2-350M | SmolLM2-360M | Qwen2.5-0.5B | CroissantLLM-1.3B |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HellaSwag-fr | 25 | 32,8 | 29,1 | 33,5 | 32,9 | **41,8** | 31,9 | 37,4 | 50,2 |
| ARC-Challenge-fr | 25 | 25,6 | 24,1 | 25,7 | 25,7 | **34,5** | 26,3 | 27,5 | 30,2 |
| FrenchBench Grammar | 25 | **73,9** | 42,9 | 66,4 | 69,7 | 62,2 | 45,4 | 68,1 | 77,3 |
| FrenchBench Vocabulary | 25 | **74,8** | 31,1 | 58,0 | 62,2 | 61,3 | 37,0 | 64,7 | 77,3 |
| FrenchBench Reading | 25 | **57,7** | 39,4 | 56,3 | 56,3 | 52,1 | 49,3 | 54,9 | 59,2 |
| Belebele (fra_Latn) | 25 | 24,9 | 22,4 | 24,2 | 24,6 | **40,7** | 24,3 | 39,8 | 27,1 |
| XNLI-fr | 33,3 | 43,7 | 35,1 | 42,5 | 44,5 | 42,0 | 37,0 | **45,7** | 48,0 |
| XWinograd-fr | 50 | 55,4 | 51,8 | **60,2** | 50,6 | 57,8 | 53,0 | **60,2** | 68,7 |
| **Media** | 29,2 | 48,6 | 34,5 | 45,9 | 45,8 | 49,1 | 38,0 | **49,8** | 54,7 |

Lectura de los resultados según el autor: liderazgo en todas las tareas de gramática, vocabulario y comprensión lectora por debajo de 1B, a 3,5 puntos de CroissantLLM-1.3B (13 veces más grande); resultados a nivel de azar en ARC-Challenge y Belebele; media dentro de aproximadamente un punto de LFM2-350M y Qwen2.5-0.5B. Evaluación realizada en noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bfloat16 (99,9M de parámetros); en float32, unos 0,4 GB. El repo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entrenó en una RTX 4080 de 16 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en CPU para tráfico bajo.
- Opciones de despliegue: `transformers` (carga directa), `vLLM` (`vllm serve Dokitek/Dokichat-100M`), y por tamaño también es viable en CPU con llama.cpp u Ollama si se convierte a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Configuración de muestreo recomendada: `temperature=0,8`, `top_p=0,95`, `min_p=0,05`, `repetition_penalty=1,1`; la decodificación greedy tiende a entrar en bucle a este tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media (8 tareas FR) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Dokichat-100M | 99,9M | 2.048 | 48,6 | Apache 2.0 | Hugging Face |
| LFM2-350M | 350M | no disponible | 49,1 | no disponible en la información | Hugging Face |
| Qwen2.5-0.5B | 500M | no disponible | 49,8 | no disponible en la información | Hugging Face |
| Gemma 3 270M | 270M | no disponible | 45,9 | no disponible en la información | Hugging Face |
| CroissantLLM-1.3B | 1.300M | no disponible | 54,7 | no disponible en la información | Hugging Face |

Dokichat-100M ofrece una media comparable a modelos de 3 a 5 veces más parámetros, con la ventaja de un tamaño mucho menor para despliegue y una licencia Apache 2.0 permisiva. Frente a CroissantLLM-1.3B, un modelo 13 veces mayor, queda a 6,1 puntos de media y a 3,5 puntos en las tareas lingüísticas francesas.

## Limitaciones y advertencias

- Es un modelo base de completado, no un asistente: no sigue instrucciones ni mantiene diálogo; para conversación debe usarse Dokichat-100M-Instruct.
- Conocimiento del mundo y razonamiento limitados: resultados a nivel de azar en ARC-Challenge-fr y Belebele, por lo que no es fiable en preguntas de conocimiento o lectura fina.
- Riesgo alto de alucinación: al ser un modelo de 100M entrenado solo con texto web, puede generar afirmaciones falsas con fluidez; requiere verificación humana en cualquier uso productivo.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo francés: no soporta otros idiomas de forma fiable.
- Decodificación greedy inestable: tiende a entrar en bucles; deben usarse los parámetros de muestreo recomendados.
- Sin datos publicados sobre sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía ni soporte; el autor lo describe como proyecto de aprendizaje.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ) en el repositorio; habría que generarlas para despliegues en CPU o GPUs muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dokitek/Dokichat-100M
- Versión instruct: https://huggingface.co/Dokitek/Dokichat-100M-Instruct
- Perfil del autor: https://huggingface.co/Dokitek
- Dataset de entrenamiento: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Paper MobileLLM (Liu et al., 2024): https://arxiv.org/abs/2402.14905
- Paper FrenchBench (Faysse et al., 2024): https://arxiv.org/abs/2402.00786
- Paper referenciado (arXiv 2502.10361): https://arxiv.org/abs/2502.10361
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
