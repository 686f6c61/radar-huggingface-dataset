# MSDDDD/Kestrel-330M

## Resumen

Kestrel-330M es un modelo de lenguaje de 336 millones de parámetros (335.973.376 exactos según los pesos en safetensors) entrenado desde cero por un único autor bajo el identificador MSDDDD. Se trata de un modelo base, no ajustado a instrucciones, cuyo propósito es la continuación de texto. Su relevancia radica en que demuestra que es posible entrenar un modelo competitivo con GPT-2 Medium en una sola GPU de consumo profesional (NVIDIA RTX PRO 6000 Blackwell) y con un presupuesto de datos muy reducido: 6.000 millones de tokens.

La arquitectura sigue el estilo Llama/Qwen3: decoder transformer con 16 capas, dimensión oculta de 1024, 16 cabezas de atención con 4 cabezas KV (GQA), capas feed-forward SwiGLU de tamaño 2816, RMSNorm, QK-norm y RoPE con theta de 500.000. La longitud de contexto es de 2048 tokens y utiliza el tokenizador de Qwen2.5 con un vocabulario de 151.936 entradas y embeddings atados.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y código personalizado (`modeling_kestrel.py`) que implementa un soft-cap de logits de 30, por lo que requiere `trust_remote_code=True` para cargarse correctamente. Está pensado para investigación, experimentación y fine-tuning, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama/Qwen3 (16 capas, hidden 1024, 16 cabezas, 4 KV heads, SwiGLU 2816, RMSNorm, QK-norm, RoPE theta 500k) |
| Parametros totales | 335.973.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se documentan pesos safetensors en bf16) |
| Idiomas soportados | en (inglés; incluye una pequeña proporción multilingüe en el entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado `modeling_kestrel.py`) |

## Arquitectura y entrenamiento

Kestrel-330M es un transformer decoder denso con una estructura prácticamente idéntica a Qwen3, salvo por el soft-cap de logits final de 30 que el autor implementa en un módulo de modelado propio. Emplea 16 capas con dimensión oculta 1024, 16 cabezas de atención y 4 cabezas KV (GQA), feed-forward SwiGLU de 2816, RMSNorm y QK-norm. El tokenizador es el de Qwen2.5 con vocabulario de 151.936 y embeddings atados. Los pesos se cargan como Qwen3, pero el soft-cap requiere `trust_remote_code=True`; sin él, según el autor, las salidas empeoran notablemente.

El entrenamiento se realizó desde cero sobre 6.000 millones de tokens con una mezcla de datos aproximada: 19% texto web educativo (FineWeb-Edu con score ≥ 4), 38% código (HTML, JavaScript, CSS, TypeScript y Python de The Stack, filtrado por estrellas y sin archivos minificados, vendor o generados), 9% matemáticas (FineMath), 8% libros de texto sintéticos (Cosmopedia v2), 5% Wikipedia, 4,5% WebSight, 3% Project Gutenberg y una pequeña proporción multilingüe de FineWeb-2 y Wikipedia en 10 idiomas. Se usaron dos optimizadores: Muon para las matrices ocultas y AdamW para embeddings y normas, con un schedule warmup–stable–decay y decaimiento lineal en el último 15% del entrenamiento. El batch fue de aproximadamente 1 millón de tokens por paso durante 5.722 pasos, en precisión bf16 con `torch.compile`.

## Capacidades

- Generación de texto por continuación de prompt, sin ajuste a instrucciones ni diálogo.
- Razonamiento básico y respuesta a preguntas de ciencia a nivel elemental (destaca en ARC-Easy y ARC-Challenge frente a GPT-2 Medium y Pythia-410M).
- Generación de código en varios lenguajes (Python, JavaScript, TypeScript, HTML, CSS), aunque el propio autor advierte que suele ser plausible pero incorrecto.
- Capacidad matemática limitada, derivada del 9% de FineMath en el entrenamiento.
- Generación de texto en inglés; el soporte multilingüe es marginal (solo una pequeña proporción de datos en 10 idiomas).
- No soporta tool calling, function calling ni razonamiento multi-paso de forma fiable.
- No dispone de modo thinking, visión ni audio.
- No tiene ajuste de seguridad ni alineación.

## Casos de uso

- Investigación sobre entrenamiento desde cero: sirve como referencia reproducible para estudiar el efecto del presupuesto de datos, la mezcla de dominios y el uso de Muon frente a AdamW en modelos pequeños.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base de 336M con licencia Apache-2.0, es adecuado para ajustarlo a clasificación, extracción o generación de dominio específico con recursos modestos.
- Destilación y experimentación con modelos pequeños: su tamaño permite iterar rápidamente en una sola GPU y comparar arquitecturas o recetas de entrenamiento.
- Generación de código asistida en entornos controlados: puede emplearse como base para experimentos de autocompletado de código, siempre con validación posterior, dado que el autor advierte de que el código generado suele ser incorrecto.
- Evaluación de técnicas de cuantización y despliegue: al ser un modelo pequeño, es útil para probar pipelines con llama.cpp, vLLM o TGI y medir latencia y throughput en hardware de consumo.
- Docencia y divulgación: permite ilustrar el funcionamiento de un transformer decoder, el efecto del contexto de 2048 tokens y las limitaciones de un modelo base sin alineación.
- Generación de texto creativo de formato corto: puede producir párrafos coherentes de temática narrativa o divulgativa, aunque pierde coherencia tras uno o dos párrafos.

## Benchmarks y rendimiento

Resultados zero-shot publicados por el autor, evaluados con el mismo script (log-likelihood scoring, hasta 1.000 ejemplos por tarea):

| Tarea | Kestrel-330M | GPT-2 Medium (355M) | Pythia-410M | SmolLM-360M |
|---|---|---|---|---|
| Tokens de entrenamiento | 6B | ~10–40B (est.) | 300B | 600B |
| HellaSwag (acc_norm) | 40.9 | 43.4 | 44.5 | 48.9 |
| ARC-Easy (acc) | 56.1 | 48.4 | 51.9 | 68.2 |
| ARC-Challenge (acc_norm) | 27.2 | 23.4 | 22.7 | 36.6 |
| WinoGrande (acc) | 50.8 | 52.8 | 52.2 | 56.2 |
| LAMBADA (acc) | 30.2 | 40.8 | 47.2 | 45.2 |
| Media | 41.0 | 41.8 | 43.7 | 51.0 |

El modelo iguala aproximadamente a GPT-2 Medium en media y supera a GPT-2 Medium y Pythia-410M en las preguntas de ciencia de ARC, pese a haberse entrenado con unas 50 veces menos tokens que Pythia-410M. SmolLM-360M, con 100 veces más datos, sigue siendo claramente superior.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,7 GB de pesos, más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 0,35 GB de pesos; en 4 bits, alrededor de 0,2 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor lo entrenó en una NVIDIA RTX PRO 6000 Blackwell.
- Cabe en GPU consumer y en iGPU con suficiente memoria compartida; también puede ejecutarse en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el soft-cap), text-generation-inference (el tag `text-generation-inference` está presente), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-330M | 336M | 2048 | 41.0 | Apache-2.0 | Hugging Face |
| GPT-2 Medium | 355M | 1024 | 41.8 | MIT (pesos OpenAI) | Hugging Face |
| Pythia-410M | 410M | 2048 | 43.7 | Apache-2.0 | Hugging Face |
| SmolLM-360M | 360M | 2048 | 51.0 | Apache-2.0 | Hugging Face |

Kestrel-330M se sitúa en la misma liga que GPT-2 Medium y Pythia-410M en cuanto a tamaño y rendimiento medio, con la ventaja de una licencia permisiva y un contexto de 2048 tokens. Frente a SmolLM-360M, que fue entrenado con 600B tokens, la diferencia de datos (6B frente a 600B) explica la brecha de rendimiento.

## Limitaciones y advertencias

- Alucinación factual: el autor advierte que el modelo afirma hechos incorrectos con confianza; no debe usarse como fuente de información.
- Coherencia limitada: pierde el hilo y se desvía del tema tras uno o dos párrafos en salidas largas.
- No sigue instrucciones ni responde preguntas de forma fiable, al ser un modelo base sin ajuste.
- Contenido sin filtrar: puede producir sesgos, ofensas o contenido desagradable incluso ante prompts inocuos; no se aplicó tuning de seguridad.
- Código poco fiable: genera código que parece plausible pero suele ser incorrecto.
- Contexto corto (2048 tokens) y soporte multilingüe marginal, limitado al inglés con una pequeña proporción de otros idiomas.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento provienen de datasets públicos con sus propias licencias y términos de uso, que deben respetarse.
- No apto para producción según el propio autor; su uso previsto es investigación, experimentación y fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MSDDDD/Kestrel-330M
- Versión chat: https://huggingface.co/MSDDDD/Kestrel-330M-Chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Project Gutenberg: https://huggingface.co/datasets/manu/project_gutenberg
- Dataset The Stack dedup: https://huggingface.co/datasets/bigcode/the-stack-dedup
- Dataset WebSight: https://huggingface.co/datasets/HuggingFaceM4/WebSight
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
