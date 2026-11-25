# mattiasz/ullm-base

## Resumen

ullm-base es un modelo de lenguaje decoder-only de 359.842.816 parámetros entrenado desde cero por el desarrollador independiente mattiasz. Forma parte del proyecto ullm, una implementación de GPT pequeña y legible cuyo objetivo es didáctico: entender el funcionamiento de un LLM de extremo a extremo, desde la tokenización hasta el entrenamiento y la inferencia. No es un modelo de instrucciones ni de chat; continúa texto a partir de un prefijo dado.

Arquitectónicamente es un transformer clásico de tipo GPT con 24 capas, dimensión de modelo 1024, 16 cabezas de atención (dimensión por cabeza 64) y MLP SwiGLU con capa oculta de 2816. Usa pre-norm RMSNorm, RoPE y embeddings de entrada y salida atados. La longitud de contexto es de 1024 tokens y el tokenizador es GPT-2 (tiktoken) ampliado con tres tokens especiales de rol.

Su relevancia es fundamentalmente educativa y de investigación: sirve como referencia reproducible para estudiar el escalado, el entrenamiento con FineWeb-Edu y el paso de un modelo base a uno de chat mediante SFT. Con 7.000 millones de tokens de entrenamiento (unos 20 tokens por parámetro), está deliberadamente infraentrenado respecto a los estándares de producción, y el autor no publica benchmarks de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo GPT) con pre-norm RMSNorm, RoPE, SwiGLU, sin biases |
| Parámetros totales | 359.842.816 (embeddings de entrada y salida atados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en fp32; el repo no documenta cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) + config.json |

Detalles adicionales de arquitectura: 24 capas, d_model 1024, 16 cabezas de atención con head dim 64, MLP SwiGLU con hidden 2816. Tokenizador GPT-2 (tiktoken) con vocabulario ampliado a 50.304 tokens mediante `<|user|>`, `<|assistant|>` y `<|end|>`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar sin innovaciones arquitectónicas destacables: atención multi-cabeza con RoPE, normalización RMSNorm en pre-norm, MLP SwiGLU y ausencia de biases en las capas lineales. El vocabulario se amplía con tres tokens de rol pensados para la posterior fase de SFT del modelo de chat, aunque el modelo base no los explota como tales.

El entrenamiento se realizó sobre FineWeb-Edu `sample-10BT`, tokenizado y publicado por el autor como `mattiasz/ullm-fineweb-edu-shards`. Se procesaron 7.000 millones de tokens (aproximadamente 20 tokens por parámetro) durante 13.351 pasos, con batch de 512 secuencias de 1024 tokens por paso. Se usó AdamW con β = (0,9, 0,95) y weight decay 0,1 sobre matrices, un LR máximo de 3e-4 con 700 pasos de warmup y decaimiento coseno hasta el 10 %. El entrenamiento se ejecutó en 4 × NVIDIA H100 SXM con autocast bf16, pesos en fp32 y `torch.compile`. No se documenta en la model card ninguna fase de RLHF, DPO o ajuste de seguridad.

## Capacidades

- Generación de texto por continuación de prefijo: el modelo completa secuencias a partir de un contexto dado.
- Respuesta a preguntas en formato few-shot: proporcionando pares `Q: ... A: ...` como patrón de continuación.
- Capacidad limitada de razonamiento y conocimiento factual derivada del corpus FineWeb-Edu (texto educativo web en inglés).
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso estructurado.
- Multilingüe: no; únicamente inglés.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No incluye ajuste de instrucciones ni de seguridad.

## Casos de uso

- Estudio didáctico del ciclo completo de un LLM: el modelo y su repositorio permiten reproducir tokenización, entrenamiento e inferencia con un código legible, útil en cursos y talleres sobre fundamentos de modelos de lenguaje.
- Experimentos de escalado en investigación académica: con 360M parámetros y 7B tokens, sirve como punto de referencia para estudiar leyes de escalado o comparar recetas de entrenamiento en presupuestos reducidos.
- Base para experimentos de SFT propios: al ser un modelo base con licencia Apache-2.0, se puede afinar para tareas concretas (clasificación, extracción, generación de estilo) partiendo de los pesos publicados.
- Generación de texto de relleno o completado en pipelines de demostración: útil para prototipos de interfaces de generación donde no se requiere calidad de producción.
- Evaluación de técnicas de inferencia (temperatura, top-k, top-p) sobre un modelo pequeño y controlado, sin los costes de un modelo grande.
- Reproducción de experimentos de tokenización: permite probar el efecto de tokens especiales de rol y del vocabulario GPT-2 ampliado en la fase de continuación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos, más memoria para activaciones y KV cache (con contexto de 1024 tokens, la KV cache es pequeña).
- VRAM estimada en bf16/fp16: en torno a 0,7 GB para pesos; en int8, unos 0,36 GB; en int4, unos 0,18 GB (estimaciones a partir del número de parámetros, sin cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; H100/A100 no son necesarias para inferencia, solo se usaron para el entrenamiento.
- Cabe en GPU de consumo: sí, en cualquier RTX con 4 GB o más (por ejemplo, RTX 3050, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el autor indica que los pesos se cargan con la herramienta `ullm` (no con `transformers`) y que funciona en CUDA, Apple Silicon (MPS) y CPU. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| ullm-base (mattiasz) | 359,8M | 1024 | Apache-2.0 | en | Entrenado desde cero con FineWeb-Edu, 7B tokens, didáctico |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | en | Referencia clásica de modelo pequeño; más parámetros de contexto similares |
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | en | Tamaño comparable (355M); entrenado con WebText, no con FineWeb-Edu |
| Pythia-410M (EleutherAI) | 410M | 2048 | Apache-2.0 | en | Suite de investigación con checkpoints intermedios y benchmarks publicados |

La comparación se limita a tamaño y licencia; no hay datos de benchmarks de ullm-base que permitan comparar rendimiento con estas alternativas.

## Limitaciones y advertencias

- Modelo base: continúa texto y puede desviarse del tema o repetirse; no sigue instrucciones ni mantiene conversaciones.
- Afirma hechos incorrectos con seguridad; no debe usarse como fuente de información factual.
- Solo inglés y entrenado con texto web educativo; el rendimiento en otros dominios o idiomas es previsiblemente pobre.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin ajuste de seguridad: puede generar contenido inapropiado u ofensivo presente en el corpus de entrenamiento.
- Infraentrenado para su tamaño (20 tokens por parámetro), por lo que su calidad estará por debajo de modelos con recetas de entrenamiento más extensas.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de ajuste de seguridad desaconseja su uso en producción sin evaluación previa.
- Los pesos no se cargan con `transformers`; requieren la herramienta `ullm`, lo que limita la integración con ecosistemas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattiasz/ullm-base
- Modelo de chat derivado: https://huggingface.co/mattiasz/ullm-chat
- Repositorio del proyecto ullm: https://github.com/mAzurkovic/ullm
- Dataset de entrenamiento tokenizado: https://huggingface.co/datasets/mattiasz/ullm-fineweb-edu-shards
- Dataset original FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
