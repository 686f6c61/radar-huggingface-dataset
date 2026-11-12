# eulogik/Bharat-Tiny-LLM-v2

## Resumen

Bharat-Tiny-LLM v2 es un modelo de lenguaje de 1.544.175.104 parámetros (aproximadamente 1,5B) desarrollado por eulogik, construido sobre Qwen2.5-1.5B y ajustado específicamente para la generación de texto en hindi e hinglish. Su propuesta técnica central es la "inyección de tokens Brahmi": una expansión quirúrgica del vocabulario con 300 subtokens Devanagari para reducir la fragmentación que los tokenizadores centrados en inglés imponen sobre las escrituras índicas.

El modelo se distribuye como pesos PyTorch sin cuantizar en formato safetensors, con licencia Apache 2.0, y está pensado para despliegue en entornos edge, GPU de consumo y frameworks de inferencia estándar (vLLM, TGI, transformers). La familia incluye variantes cuantizadas en MLX para Apple Silicon y GGUF para llama.cpp.

Es relevante ahora por dos motivos contrapuestos: por un lado, aborda un problema real de eficiencia de tokenización en lenguas índicas; por otro, la propia model card incluye una corrección publicada el 2026-11-12 que retira la afirmación de compresión de tokens del 33,8% y la de "+36% más rápido" por no ser reproducibles bajo el protocolo fijado, lo que convierte a este modelo en un caso de estudio sobre rigor en la publicación de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA sobre proyecciones q, k, v, o (rank 16) |
| Parametros totales | 1.544.175.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 affine (variante MLX); GGUF en repositorio separado; pesos base en fp16/fp32 |
| Idiomas soportados | hindi (hi), inglés (en); hinglish como uso mixto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); variantes MLX y GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar. Sobre esa base se aplica una expansión de vocabulario de 151.936 a 152.236 entradas mediante la minería de los 300 subtokens Devanagari más frecuentes del corpus hindi. El entrenamiento se estructura en dos etapas: primero, alineación de embeddings con el backbone congelado, entrenando únicamente las 300 nuevas filas de embedding; después, fine-tuning con LoRA de rank 16 sobre las proyecciones de atención q, k, v y o. Los pesos resultantes se fusionan en un checkpoint PyTorch base.

La innovación declarada es la inyección de tokens Brahmi, orientada a mitigar la fragmentación excesiva de Devanagari en tokenizadores entrenados mayoritariamente con inglés. No obstante, la model card incluye una corrección explícita (2026-11-12) que retira la cifra de compresión del 33,8% y la mejora de velocidad del 36% por no ser reproducibles bajo el protocolo fijado, remitiendo a un documento de auditoría en el repositorio GitHub del proyecto. Se mantiene como dato la reducción de pérdida de validación declarada (de 2,776 a 1,837, perplejidad de 16,1 a 6,3), aunque no se especifica el corpus ni el protocolo exacto de evaluación. No se detalla el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto conversacional en hindi, inglés y hinglish.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen2.5-1.5B.
- Generación de código y matemáticas básicas (capacidad del backbone, no reforzada específicamente en el ajuste).
- Tokenización eficiente de Devanagari gracias a los 300 subtokens añadidos, con reducción de la longitud de secuencia en prompts hindi según los ejemplos de la model card.
- Compatibilidad con tool calling y function calling en la medida en que lo soporte el modelo base (no verificado en la información disponible).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma específica; dependen del backbone.
- Sin soporte de visión ni audio.
- Sin modo "thinking" explícito.

## Casos de uso

- Asistentes conversacionales en hindi para atención al cliente: el ajuste sobre Qwen2.5-1.5B y la tokenización mejorada de Devanagari reducen la longitud de las secuencias y permiten gestionar diálogos multi-turno con menor coste por turno en entornos con recursos limitados.
- Procesamiento de texto hinglish en redes sociales y mensajería: el modelo maneja mezcla de hindi transliterado y Devanagari, útil para moderación de contenido, resumen de conversaciones o clasificación de mensajes en plataformas dirigidas al mercado indio.
- Despliegue en dispositivos edge y Apple Silicon: la variante MLX cuantizada a Q4 (aproximadamente 880 MB) permite ejecutar generación de texto en portátiles Mac sin GPU dedicada.
- Generación de contenido editorial en hindi: redacción de resúmenes, descripciones de producto o textos divulgativos con un modelo de 1,5B que cabe en una GPU de consumo.
- Prototipado rápido de aplicaciones NLP para lenguas índicas: al ser Apache 2.0 y estar disponible en transformers, vLLM y llama.cpp, sirve como base para experimentos de ajuste fino posteriores.
- Investigación sobre tokenización multilingüe: el repositorio y su documento de auditoría de afirmaciones constituyen material útil para estudiar cómo se validan (o no) las mejoras de compresión de tokens en escrituras no latinas.
- Educación y traducción asistida hindi-inglés: generación de explicaciones y paráfrasis en ambos idiomas en entornos con presupuesto de cómputo bajo.

## Benchmarks y rendimiento

La model card incluye una tabla de métricas comparativas con el modelo base, si bien la cifra de compresión de tokens ha sido retirada por el propio autor.

| Metrica | Qwen2.5-1.5B base | Bharat-Tiny-LLM v2 | Estado |
|---|---|---|---|
| Tokens para 1.000 caracteres hindi | ~950 | retirado | Afirmación del 33,8% de compresión retirada (no reproducible) |
| Throughput de inferencia (hindi) | 50 tok/s | 68 tok/s (+36%) | Afirmación retirada (no reproducible) |
| Pérdida de validación (corpus hindi) | 2,776 | 1,837 | Declarada; perplejidad 16,1 → 6,3 |
| Compatibilidad de hardware | CUDA / CPU / MPS | CUDA / CPU / MPS | Confirmada |

Ejemplos de compresión de tokens por prompt (declarados en la model card, no verificados de forma independiente):

| Prompt | Tokens Qwen base | Tokens Bharat v2 | Ahorro declarado |
|---|---|---|---|
| "ज़रूरी बात है क्या करते हो" | 26 | 11 | 58% |
| "नमस्ते, आप कैसे हैं?" | 15 | 7 | 53% |
| "भारत की राजधानी नई दिल्ली है" | 22 | 14 | 36% |
| "bhai aaj ka weather kaisa hai?" | 12 | 8 | 33% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización Q4: en torno a 1 GB para pesos (la variante MLX ocupa unos 880 MB en disco).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 y H100 para despliegues de mayor concurrencia; también funciona en CPU y en MPS (Apple Silicon).
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en fp16 y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: transformers (referencia), vLLM, TGI, llama.cpp mediante el repositorio GGUF, MLX en Apple Silicon.
- Latencia y throughput: la cifra de 68 tok/s en hindi está retirada por el autor; no hay mediciones vigentes publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Bharat-Tiny-LLM v2 | 1,54B | no disponible | hi, en | Apache 2.0 | Ajuste específico para Devanagari con vocabulario expandido |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens (según documentación pública de Qwen) | multilingüe | Apache 2.0 | Modelo base; tokenizador menos eficiente en hindi |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | multilingüe | Apache 2.0 | Variante alineada para instrucciones; alternativa directa sin ajuste índico |
| Sarvam-1 / modelos índicos pequeños | no disponible en esta ficha | no disponible | índicas | variable | Alternativas del ecosistema índico; sin datos verificados aquí |

La comparación con modelos específicamente índicos de tamaño similar no puede completarse con la información disponible; los datos de contexto del modelo base Qwen2.5-1.5B provienen de documentación pública y no de la model card de este repositorio.

## Limitaciones y advertencias

- Las afirmaciones centrales de la model card (compresión del 33,8% de tokens y mejora del 36% en velocidad) están retiradas por el propio autor por no ser reproducibles; no deben citarse como resultados vigentes.
- El modelo es un ajuste LoRA de rank 16 sobre un backbone de 1,5B: su capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones complejas está acotada por el tamaño y por el alcance del ajuste.
- Riesgo de alucinación inherente a modelos de 1,5B, especialmente en consultas factuales sobre India, historia o datos actuales.
- El corpus de entrenamiento y el número de tokens no se detallan, lo que impide evaluar la cobertura dialectal del hindi (existen diferencias notables entre hindi estándar, bhojpuri, marathi y otras lenguas que comparten Devanagari).
- No se especifica la longitud de contexto soportada; asumir la del modelo base sin verificación puede provocar degradación en secuencias largas.
- El soporte de tool calling y de agentes no está verificado para este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento normativo en aplicaciones sensibles.
- El repositorio tiene un volumen de descargas muy bajo (32) y un solo "like", lo que indica escasa validación por parte de la comunidad; conviene tratar los resultados como preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v2
- Variante MLX cuantizada: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v2-MLX
- Variante GGUF / llama.cpp: https://huggingface.co/eulogik/Bharat-Tiny-LLM-GGUF
- Repositorio GitHub del proyecto: https://github.com/eulogik/Bharat-Tiny-LLM
- Auditoría de afirmaciones (claim_audit.md): https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/docs/claim_audit.md
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
