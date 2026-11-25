# s3t4/LFM3-1.7B-Indonesian

## Resumen

LFM3-1.7B-Indonesian es un checkpoint del modelo LiquidAI/LFM3-1.7B adaptado al indonesio mediante ajuste fino supervisado (SFT) con LoRA y posterior fusión de los adaptadores en los pesos completos. Lo publica el usuario s3t4 en Hugging Face y resuelve un problema concreto: el modelo base LFM3, pese a su arquitectura eficiente, no está optimizado para indonesio, por lo que este derivado busca mejorar el rendimiento en esa lengua sin cambiar el tamaño del modelo.

El modelo conserva la arquitectura tri-híbrida del LFM3 original: 24 capas que combinan 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención global, con una ventana de contexto declarada de 256K tokens. Tiene 1.728.801.536 parámetros totales (aproximadamente 1,73B) y se distribuye en formato safetensors con código de modelado personalizado, lo que obliga a usar `trust_remote_code=True`.

Es relevante ahora porque demuestra el patrón de adaptación lingüística de sub-2B sobre arquitecturas híbridas modernas, con un incremento medido de +11 puntos en IndoMMLU tras el ajuste. No obstante, el modelo tiene solo 36 descargas y 0 likes en el momento de la ficha, y su licencia deriva de la LFM Open License v1.0, con las restricciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 convoluciones cortas con compuerta, 5 atención de ventana deslizante, 6 atención global); requiere `trust_remote_code=True` |
| Parametros totales | 1.728.801.536 (≈1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (según model card del base) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 y F16 disponibles en repo separado; el repo principal en safetensors (bf16) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), derivada de LiquidAI/LFM3-1.7B |
| Formato de pesos | Safetensors (repo principal); GGUF en `s3t4/LFM3-1.7B-Indonesian-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer tri-híbrido que alterna tres tipos de capas: convoluciones cortas con compuerta (13 capas), atención de ventana deslizante (5 capas) y atención global (6 capas). Esta mezcla busca reducir el coste computacional de la atención completa manteniendo capacidad de modelado de largo alcance. El ajuste se realizó con TRL `SFTTrainer` y PEFT 0.21.2, con LoRA de rango 16, `lora_alpha=32`, `lora_dropout=0.05` y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj`, `out_proj`, `w1`, `w2`, `w3`. Los adaptadores se fusionaron con `merge_and_unload`.

Los datos de entrenamiento son dos conjuntos: CohereLabs/aya_dataset filtrado a indonesio (`language == "Indonesian"` / `language_code == "ind"`) y 5.000 pares instrucción-respuesta muestreados de AksaraLLM/aksara-sft-clean-v1. Los hiperparámetros fueron 1 época, batch efectivo de 16 (batch 4 × acumulación 4), learning rate 1e-4, scheduler coseno, warmup del 5% y longitud máxima de 2048 tokens. No se documenta RLHF ni DPO; es SFT puro sobre el modelo base.

## Capacidades

- Generación de texto conversacional en indonesio, con plantilla de chat (`apply_chat_template`) y modo `enable_thinking=False` documentado.
- Razonamiento y conocimiento general en indonesio, con mejora medida en IndoMMLU.
- Comprensión de sentido común en indonesio, evaluada con XCOPA-ID (sin mejora tras el ajuste).
- Soporte de conversaciones multi-turno mediante roles system/user/assistant.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al indonesio como idioma declarado; el resto de idiomas del base no está validado en este checkpoint.
- No se documenta visión, audio ni otras modalidades.

## Casos de uso

- Asistencia conversacional en indonesio: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a la ventana de 256K tokens del base, útil para chatbots de atención al cliente en mercados indonesios.
- Generación de respuestas en indonesio para sistemas de FAQ: con SFT sobre aya_dataset y aksara-sft-clean-v1, produce respuestas en registro instructivo adecuadas para bases de conocimiento.
- Clasificación y respuesta a preguntas de conocimiento general: el incremento de +11 pp en IndoMMLU lo hace apto para tareas de QA de opción múltiple en indonesio, siempre con validación humana.
- Prototipado local en CPU/GPU de consumo: las versiones GGUF Q4_K_M y Q8_0 permiten desplegar el modelo en portátiles o equipos sin GPU dedicada mediante llama.cpp, Ollama o LM Studio.
- Filtrado y resumen de textos en indonesio: la ventana de contexto larga permite procesar documentos extensos en una sola pasada.
- Base para nuevos ajustes lingüísticos: al ser un checkpoint fusionado y con licencia abierta condicionada, sirve como punto de partida para experimentos de adaptación a otras lenguas regionales de Indonesia.
- Evaluación comparativa de arquitecturas híbridas: útil en investigación para medir cómo se comporta una arquitectura tri-híbrida sub-2B tras SFT en una lengua de recursos medios.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación zero-shot por logits del primer token, `enable_thinking=False`, 300 preguntas muestreadas de IndoMMLU con `seed=42` y 500 de XCOPA-ID):

| Benchmark | Antes del entrenamiento | Después del entrenamiento | Delta |
|---|---:|---:|---:|
| IndoMMLU (Bahasa Indonesia) | 25,33% (76/300) | 36,33% (109/300) | +11,00 pp |
| IndoMMLU (Pengetahuan Umum) | 26,00% (78/300) | 33,33% (100/300) | +7,33 pp |
| XCOPA-ID (Commonsense) | 58,60% (293/500) | 58,40% (292/500) | -0,20 pp |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6-8 GB de VRAM para inferencia cómoda.
- VRAM estimada en GGUF Q8_0: en torno a 2 GB de pesos; Q4_K_M: en torno a 1,2-1,5 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para uso local en bf16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en bf16; en GPUs de 8 GB conviene usar GGUF Q4_K_M o Q8_0.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp, Ollama, LM Studio y AnythingLLM mediante los GGUF publicados; vLLM y TGI no están documentados para esta arquitectura con código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| s3t4/LFM3-1.7B-Indonesian | 1,73B | 256K | LFM Open License v1.0 | Hugging Face, GGUF en repo aparte |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | LFM Open License v1.0 | Hugging Face |
| Modelos SFT en indonesio de ~2B (p. ej. derivados de Qwen o Llama) | ~1,5-2B | variable | variable según base | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no se han publicado resultados de benchmarks cruzados con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de indonesio; el rendimiento en otros idiomas del base no está validado y puede degradarse tras el ajuste.
- El ajuste se hizo con 1 época y un subconjunto de 5.000 pares de aksara-sft-clean-v1, lo que limita la cobertura de dominios y estilos.
- XCOPA-ID no mejora (-0,20 pp), lo que sugiere que el SFT no refuerza el razonamiento de sentido común.
- Riesgo de alucinación inherente a un modelo de 1,73B con conocimiento factual limitado; los 36,33% en IndoMMLU indican que aún falla en la mayoría de preguntas de conocimiento.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- Requiere `trust_remote_code=True` por el código de modelado personalizado, lo que implica ejecutar código del repositorio y revisarlo antes de usar.
- El repositorio tiene muy poca tracción (36 descargas, 0 likes) y no hay validación externa de los resultados más allá de los JSON incluidos por el autor.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s3t4/LFM3-1.7B-Indonesian
- Versiones GGUF: https://huggingface.co/s3t4/LFM3-1.7B-Indonesian-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset AksaraLLM/aksara-sft-clean-v1: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
- Dataset indolem/IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset cambridgeltl/xcopa: https://huggingface.co/datasets/cambridgeltl/xcopa
