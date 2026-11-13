# FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit

## Resumen

Qwen3-1.7B-sft-tulu-16bit es un ajuste fino supervisado (SFT) del modelo base Qwen3-1.7B-Base, publicado por el usuario FrancescoArno94 en Hugging Face. El autor parte del checkpoint no instruido de Qwen3 en su variante de 1.700 millones de parámetros y lo adapta mediante LoRA sobre una muestra aleatoria de 20.000 conversaciones del dataset allenai/tulu-3-sft-mixture, un corpus de instrucciones multirretorno de gran calidad. El resultado son pesos fusionados en safetensors de 16 bits, listos para usar con la librería transformers.

El modelo resuelve el problema de convertir un modelo base (que solo completa texto) en un asistente conversacional que sigue instrucciones, mantiene formato de chat y respeta un system prompt fijo. Es relevante porque demuestra un flujo de trabajo reproducible y de bajo coste (entrenado en Kaggle con dos Tesla T4) para obtener un modelo de instrucciones pequeño, desplegable en hardware de consumo, con licencia Apache-2.0 y métricas publicadas en MMLU, GSM8K y TruthfulQA.

Se trata de un transformer decoder-only de la familia Qwen3, con 1.720.574.976 parámetros totales y un contexto de entrenamiento de 2.048 tokens. No es un modelo MoE ni multimodal: es un modelo de texto puro, orientado a generación de texto y razonamiento básico en un único turno o conversaciones cortas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima usada en el entrenamiento SFT; el contexto nativo del base Qwen3-1.7B no se detalla en la información disponible) |
| Tipos de cuantización | El repo publica pesos en 16 bits (bf16/fp16); el entrenamiento usó carga en 4 bits del modelo base. No se publican GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de Qwen3 con 1.720 millones de parámetros, ajustado mediante LoRA de rango 64 y alpha 64, sin dropout, sobre módulos de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó con Unsloth `FastLanguageModel` y TRL `SFTTrainer`, cargando el base en 4 bits, con `max_seq_length=2048`, optimizador `adamw_8bit`, learning rate 5e-5, scheduler lineal, weight decay 0,001, batch efectivo de 8 (2 por dispositivo × 4 de acumulación) y precisión bf16/fp16. Se aplicó enmascaramiento de pérdida (`train_on_responses_only`) para calcular el loss solo en los turnos del asistente.

Los datos provienen de una muestra aleatoria de 20.000 ejemplos de `allenai/tulu-3-sft-mixture` (unas 939.000 conversaciones multirretorno en formato `{"role","content"}`), divididos 80/20 en 16.000 de entrenamiento y 4.000 de validación con semilla 42. Cada conversación lleva un system prompt fijo (útil, honesto, conciso; admite no saber; rechaza peticiones ilegales o dañinas), se normaliza con `standardize_sharegpt` y se renderiza con la plantilla de chat `qwen-3`. El run fue corto: 100 pasos máximos, con evaluación cada 10 pasos, sobre 2× Tesla T4 (14,5 GB cada una), CUDA 12.8, torch 2.11, Unsloth 2026.10.8, transformers 4.56.2 y trl 0.22.2. No se menciona RLHF ni DPO; es SFT puro.

## Capacidades

- Generación de texto conversacional con formato de chat Qwen3 y soporte de system prompt.
- Seguimiento de instrucciones en un único turno y en conversaciones cortas multirretorno.
- Razonamiento básico y matemáticas de primaria/secundaria (GSM8K evaluado).
- Conocimiento general y de dominios académicos (MMLU evaluado por áreas).
- Respuestas calibradas para admitir desconocimiento y rechazar peticiones dañinas, por convención del system prompt de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional ligero en local: el modelo puede mantener diálogos de varios turnos dentro de 2.048 tokens y ejecutarse en una GPU de consumo, lo que lo hace adecuado para prototipos de chatbots personales o demos sin coste de API.
- Clasificación y extracción de información con formato: al estar ajustado sobre Tulu-3, sigue instrucciones para devolver respuestas estructuradas (listas, JSON simple) en tareas de etiquetado o resumen de textos cortos.
- Razonamiento matemático básico: útil para tutores automáticos o generación de problemas resueltos de nivel escolar, aprovechando su rendimiento en GSM8K (63,46% exact match estricto).
- Generación de respuestas de soporte con tono controlado: el system prompt fijo de honestidad y concisión permite desplegarlo en flujos de atención al cliente de baja complejidad donde el contexto no supere 2.048 tokens.
- Filtrado y moderación asistida: puede usarse como primer nivel para reformular o rechazar peticiones problemáticas en pipelines internos, siempre con revisión humana dado que el rechazo es una convención de entrenamiento, no una garantía.
- Base para investigación en ajuste fino: sirve como punto de partida reproducible (notebook público, hiperparámetros documentados) para experimentar con SFT, LoRA y evaluación con lm-evaluation-harness en modelos pequeños.
- Evaluación comparativa de modelos pequeños: su conjunto de métricas publicado (MMLU, GSM8K, TruthfulQA) lo convierte en una referencia útil para medir el impacto de técnicas de instrucción en modelos de ~1,7B.

## Benchmarks y rendimiento

Evaluado con lm-evaluation-harness 0.4.13:

| Benchmark | Métrica | Resultado | Error estándar | Muestras |
|---|---|---|---|---|
| MMLU | acc | 55,30% | ±0,40 | 14.042 |
| MMLU — STEM | acc | 52,55% | ±0,87 | 3.153 |
| MMLU — Humanities | acc | 48,03% | ±0,69 | 4.705 |
| MMLU — Social Sciences | acc | 64,19% | ±0,85 | 3.077 |
| MMLU — Other | acc | 60,28% | ±0,86 | 3.107 |
| GSM8K | exact match (estricto) | 63,46% | ±1,33 | 1.319 |
| GSM8K | exact match (extracción flexible) | 63,15% | ±1,33 | 1.319 |
| TruthfulQA MC2 | acc | 52,68% | ±1,50 | 817 |

No se publican comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en 4 bits (si se cuantiza manualmente): alrededor de 1,2-1,5 GB para pesos, viable en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para 16 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, T4); A100 y H100 sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores con 16 bits; en GPUs de 4-6 GB requiere cuantización.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en 2× Tesla T4, lo que sugiere inferencia cómoda en hardware similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-sft-tulu-16bit | 1,72B | 2.048 (entrenamiento) | Apache-2.0 | Hugging Face, safetensors | SFT sobre Tulu-3, métricas MMLU/GSM8K/TruthfulQA publicadas |
| Qwen3-1.7B (instruido oficial) | 1,72B | no disponible en esta ficha | Apache-2.0 | Hugging Face | Modelo oficial de instrucciones de Qwen; referencia natural |
| SmolLM2-1.7B-Instruct | 1,7B | no disponible en esta ficha | Apache-2.0 | Hugging Face | Alternativa pequeña de instrucciones de Hugging Face |
| Gemma-2-2B-it | 2,6B | no disponible en esta ficha | Gemma license | Hugging Face | Alternativa de tamaño similar con licencia más restrictiva |

Los datos de contexto y rendimiento de los modelos comparados no se detallan en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento corto (100 pasos, 20.000 ejemplos): no es una pasada completa sobre Tulu-3; el autor espera mejoras con un epoch completo.
- El base es un modelo no instruido; fuera de la distribución de entrenamiento puede divagar o rechazar de forma torpe.
- No evaluado en seguridad más allá de TruthfulQA; el comportamiento de rechazo depende del system prompt y no está garantizado.
- Contexto limitado a 2.048 tokens durante el SFT; conversaciones o documentos más largos pueden degradar la calidad.
- Idiomas soportados no documentados; el dataset Tulu-3 es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación inherente a un modelo de 1,7B; no apto para tareas de alta precisión sin verificación.
- Licencia Apache-2.0 permite uso comercial, pero el notebook de entrenamiento está bajo LGPL-3.0; revisar la procedencia de los datos de Tulu-3 si se redistribuye.
- No se publican cuantizaciones GGUF ni versiones optimizadas para llama.cpp/Ollama.
- Sin soporte documentado de tool calling ni agentes; no recomendado para flujos que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Notebook de entrenamiento: https://github.com/Francesck94/smol_course (ruta `instruction-tuning/finetuning_qwen/qwen-3b-sft-tulu.ipynb`)
- Unsloth: https://unsloth.ai/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
