# num1notsvn/wicara-56m-base

## Resumen

Wicara 56M Base es un modelo de lenguaje causal entrenado desde cero para el indonesio, desarrollado por Bagus Ardin Prayoga (num1notsvn) como artefacto de investigación. Su nombre proviene del sánscrito "vicāra" y significa "discurso" o "conversación". El modelo tiene 56 millones de parámetros, una arquitectura tipo LLaMA (pre-norm RMSNorm, RoPE, SwiGLU, Grouped-Query Attention con ratio 2:1 y embeddings atados) y una ventana de contexto nativa de 512 tokens. Se entrenó sobre 1.120 millones de tokens de textos indonesios curados en una única sesión de 11,1 horas en un portátil con RTX 4050 de 6 GB, alcanzando una perplejidad de validación de 21,2. Su relevancia radica en demostrar que es posible construir un modelo pequeño (<100M) desde cero con recursos mínimos, y sirve como base para fine-tuning posterior en tareas de NLP en indonesio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-style (Pre-norm RMSNorm, RoPE, SwiGLU, Grouped-Query Attention, Tied Embeddings) |
| Parametros totales | 56.027.520 (según la ficha del modelo; los pesos safetensors suman 66.450.560 parámetros) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de LLaMA con pre-normalización RMSNorm (epsilon 1e-5), codificación posicional rotatoria RoPE con theta 10000, activación SwiGLU y Grouped-Query Attention de 10 cabezas de consulta por 5 cabezas de valor (ratio 2:1). La dimensión oculta es 640, la dimensión del feed-forward es 1.728 y el tamaño del vocabulario es 16.384 subpalabras mediante un tokenizer BPE a nivel de byte que promedia 4,26 caracteres por token en indonesio. Los embeddings de entrada y salida están atados, lo que reduce los parámetros no de embedding a 45,5 millones.

El preentrenamiento se realizó sobre 1,12 mil millones de tokens procedentes de 3.985.535 documentos, con una composición dominada por OpenSubtitles v2024 (43,2%), FineWeb-2 ind_Latn (18,7%), Wikipedia en indonesio (15,5%), Cendol v2 (11,5%), Aya Collection (10,8%) y TED2020 (0,3%). El entrenamiento utilizó bf16 mixed precision, optimizador AdamW (beta1=0,9, beta2=0,95), decaimiento coseno con warmup, y se ejecutó durante 17.010 pasos (una época) en una NVIDIA RTX 4050 Laptop GPU de 6 GB, con un throughput de 28.017 tokens/s y una duración total de 11,1 horas. La pérdida de validación final fue 3,0505, correspondiente a una perplejidad de 21,2, con una brecha de generalización de 0,12. El pipeline completo —datos, tokenizador, arquitectura y entrenamiento— se construyó directamente en PyTorch sin usar modelos o APIs externas.

## Capacidades

- Generación de texto por continuación en indonesio: predice el siguiente token dado un prefijo, con soporte para sampling (temperature, top-p, repetition penalty).
- No es un modelo conversacional: no sigue instrucciones ni gestiona turnos de diálogo sin fine-tuning.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al indonesio, aunque el tokenizer BPE a nivel de byte puede representar caracteres de otros idiomas.
- Ventana de contexto corta (512 tokens), por lo que no maneja documentos largos ni conversaciones extensas.
- Como modelo base, es apto para fine-tuning supervisado (SFT) en tareas específicas.

## Casos de uso

- Análisis de sentimiento en indonesio: tras un fine-tuning con un corpus de opiniones (por ejemplo, reseñas de productos), el modelo puede clasificar la polaridad de textos cortos. Su tamaño reducido permite iterar rápidamente en hardware modesto.
- Clasificación de intenciones para asistentes: con SFT sobre datos de diálogo, puede identificar la intención del usuario en consultas breves (por ejemplo, "reservar vuelo", "consultar saldo").
- Reconocimiento de entidades nombradas (NER): fine-tuning sobre un dataset anotado de indonesio para extraer personas, lugares y organizaciones. El contexto de 512 tokens es suficiente para frases y párrafos cortos.
- Adaptación a dominios específicos: ajuste fino con corpus jurídicos, médicos o técnicos en indonesio para generar terminología especializada o resumir documentos breves.
- Investigación en modelos pequeños (<100M): permite estudiar la dinámica del preentrenamiento, el efecto de la composición de datos o la relación entre capacidad y perplejidad con recursos limitados.
- Docencia y aprendizaje: sirve como ejemplo práctico de un pipeline completo de LLM (tokenizador, arquitectura, entrenamiento e inferencia) implementado desde cero en PyTorch, sin depender de APIs externas.
- Generación de texto asistida con RAG: dado que el modelo no es fiable como repositorio de conocimiento, se puede combinar con un recuperador para completar respuestas basadas en documentos indonesios.
- Destilación de modelos: al ser pequeño, puede usarse como modelo estudiante para destilar conocimiento de un modelo mayor en tareas de lenguaje indonesio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión bf16, los pesos safetensors ocupan aproximadamente 132 MB (66.450.560 parámetros x 2 bytes). Las activaciones para una secuencia de 512 tokens y batch 1 son mínimas, por lo que cualquier GPU con 2 GB de VRAM es suficiente. El entrenamiento se realizó en 6 GB, por lo que la inferencia es muy holgada en ese mismo hardware.
- GPU recomendada: NVIDIA GeForce RTX 4050 Laptop GPU o cualquier GPU de consumo con al menos 2 GB de VRAM. También es viable en CPU.
- Sí cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM (con compatibilidad para modelos transformers), llama.cpp si se convierte a GGUF. No se ha publicado un GGUF oficial.
- Latencia y throughput: no disponible. No se han proporcionado mediciones de inferencia; el throughput de entrenamiento fue de 28.017 tokens/s en una RTX 4050 Laptop GPU.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible. El modelo comparable más cercano es la versión afinada para chat, num1notsvn/wicara-56m-chat, que parte de esta base y añade instrucciones.

## Limitaciones y advertencias

- No está afinado para instrucciones: no entiende turnos de conversación ni system prompts sin SFT previo.
- Riesgo de alucinación alto: con 56M parámetros, prioriza fluidez superficial y no puede servir como repositorio factual sin RAG.
- Contexto limitado a 512 tokens, insuficiente para documentos largos o historiales de diálogo extensos.
- Idioma único: solo indonesio, con un vocabulario de 16.384 subpalabras diseñado para ese idioma.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.
- No incluye funcionalidades modernas como tool calling, razonamiento extendido ni multimodalidad.

## Enlaces

- HuggingFace: https://huggingface.co/num1notsvn/wicara-56m-base
- Versión chat: https://huggingface.co/num1notsvn/wicara-56m-chat
- GitHub: https://github.com/bagusardin25/WicaraLLM
- LinkedIn: https://www.linkedin.com/posts/bagusardin27_github-bagusardin25wicarallm-an-indonesian-activity-7496807012455067648-FwUo
