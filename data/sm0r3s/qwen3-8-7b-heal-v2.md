# Sm0r3s/qwen3.8-7b-heal-v2

## Resumen

Qwen3.8-7B-heal-v2 es un checkpoint intermedio de un proceso de poda estructural (pruning) y recuperación (healing) aplicado sobre Qwen3.8-27B, el modelo multimodal de la familia Qwen. Lo publica el usuario independiente Sm0r3s y no está afiliado a Alibaba ni al equipo Qwen. El objetivo del proyecto es reducir un modelo de 27B parámetros a unos 7,64B conservando la mayor parte del conocimiento original mediante entrenamiento continuado, siguiendo la metodología Minitron de NVIDIA.

El modelo resultante tiene 32 capas (24 de Gated DeltaNet y 8 de atención completa), hidden size de 3584, MLP de 7808 y un vocabulario de 248.320 tokens. Mantiene la torre de visión (~0,45B) y una cabeza MTP (~0,18B) congeladas, por lo que conserva la pipeline image-text-to-text. El contexto nativo declarado es de 262K tokens, aunque el autor indica que no se ha probado tras la poda.

Es relevante ahora porque documenta de forma transparente el proceso de compresión de un modelo multimodal grande a un tamaño desplegable en hardware modesto, con métricas de cross-entropy por sesión de entrenamiento. No obstante, es un checkpoint de trabajo, no una release: no tiene alineamiento de instrucciones, formato de razonamiento, tool-use ni visión, y sus salidas pueden ser incoherentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal) y atención completa; multimodal con torre de visión y cabeza MTP |
| Parametros totales | 7.454.514.160 (7,64B según model card: ~7,0B texto + ~0,45B visión + ~0,18B MTP) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K nativo (no probado tras la poda) |
| Tipos de cuantizacion | No disponible (solo pesos bf16 publicados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~15,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina 24 capas de Gated DeltaNet (atención lineal) con 8 capas de atención completa, seleccionadas de las capas originales 0–3, 32–43 y 48–63 del Qwen3.8-27B. El hidden size es 3584 y el MLP 7808. Conserva la torre de visión y la cabeza MTP del modelo original, congeladas durante el healing. La poda sigue el enfoque Minitron de NVIDIA (papers 2407.14679 y 2408.11796).

El healing consiste en preentrenamiento continuado con pérdida de next-token, ejecutado como una cadena de LoRAs de rango 128 sobre todas las proyecciones del modelo de lenguaje (atención, atención lineal, MLP). Cada sesión entrena el LoRA en 2×T4 gratuitas de Kaggle, lo fusiona y lo publica. La sesión 1 cubrió 300 pasos × 16K tokens = 4,9M tokens, en fp16, AdamW de 8 bits, LR 2e-4 y longitud de secuencia 1024. La mezcla de datos fue: FineWeb-Edu 40%, código (codeparrot-clean) 15%, MiniMax-distill-SFT 15%, Cosmopedia 10%, OpenWebMath 10% y UltraChat 10%.

La cross-entropy en conjuntos held-out cayó de 6,26 de media (modelo sin healing) a 2,21 tras 4,9M tokens. La mayor parte de la recuperación ocurrió en los primeros ~1,6M tokens (media 2,38), lo que sugiere que el modelo podado retuvo gran parte del conocimiento y solo necesitaba realinearse. Las ganancias posteriores se están ralentizando, como era de esperar.

## Capacidades

- Generación de texto autoregresiva con pérdida de next-token; el modelo está en proceso de recuperación y sus salidas pueden ser incoherentes.
- Arquitectura multimodal (image-text-to-text) con torre de visión congelada, aunque el preprocesador de imágenes no está incluido en este repo, por lo que la entrada de imagen no carga todavía.
- Capacidad de razonamiento y código potencialmente heredada del modelo base, pero sin alineamiento de formato de razonamiento ni tool-use.
- Sin soporte de tool calling ni function calling (no alineado).
- Sin soporte de agentes ni multi-step reasoning alineado.
- Capacidades multilingües no documentadas.
- Sin modo thinking, sin audio y sin visión operativa en este checkpoint.

## Casos de uso

- Investigación sobre pruning y healing: el checkpoint sirve como referencia reproducible de un proceso de compresión estructural con métricas de cross-entropy por sesión, útil para estudiar cuánto conocimiento sobrevive a la poda.
- Desarrollo de pipelines de recuperación de modelos podados: permite experimentar con LoRA relay sobre GPUs T4 y validar la estrategia de mezcla de datos (FineWeb-Edu, código, matemáticas, chat).
- Base para fine-tuning posterior: al conservar la arquitectura y los pesos del texto, puede servir como punto de partida para tareas específicas una vez completado el healing.
- Evaluación de arquitecturas híbridas Gated DeltaNet + atención completa: útil para medir el comportamiento de la atención lineal en contextos largos tras la poda.
- Estudio de la degradación multimodal: permite analizar cómo afecta la poda a la torre de visión congelada y a la cabeza MTP.
- Docencia y divulgación: ejemplo práctico de compresión de modelos con Minitron y de entrenamiento en hardware gratuito (Kaggle 2×T4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta cross-entropy held-out por fuente:

| Fuente | Inicio (sin healing) | 1,6M tok | 3,3M tok | 4,9M tok |
|---|---|---|---|---|
| Web (FineWeb-Edu) | 6,51 | 3,27 | 3,19 | 3,13 |
| Textbook (Cosmopedia) | 7,72 | 2,80 | 2,64 | 2,55 |
| Code | 6,14 | 2,09 | 2,00 | 1,94 |
| Math (OpenWebMath) | 6,00 | 2,96 | 2,89 | 2,84 |
| Chat (UltraChat) | 6,29 | 1,97 | 1,80 | 1,76 |
| Distill* | 4,94 | 1,20 | 1,11 | 1,06 |
| **Media** | **6,26** | 2,38 | 2,27 | **2,21** |

*El conjunto held-out de distill se extrajo del split de entrenamiento, por lo que puede solaparse con los datos de entrenamiento y sobrestimar el resultado. A partir de la sesión 2 se evalúa sobre su split de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~15,3 GB solo para pesos, más overhead de activaciones; se recomienda al menos 24 GB para contexto corto.
- En fp16 (recomendado en GPUs sin bf16 como T4) el consumo es similar, y el autor indica que es ~3× más rápido en esas GPUs.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado; T4 funciona en fp16 para pruebas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, no publicada.
- Opciones de despliegue: transformers con `AutoModelForMultimodalLM`; se recomienda instalar `flash-linear-attention` para atención lineal rápida. No hay GGUF ni soporte documentado de vLLM, llama.cpp, Ollama o TGI en este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Sm0r3s/qwen3.8-7b-heal-v2 | 7,64B | 262K (no probado) | Apache 2.0 | Checkpoint de trabajo, sin alinear |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Modelo completo y alineado |
| Sm0r3s/qwen3.8-7b-pruned-unhealed | ~7B | 262K | Apache 2.0 | Podado sin healing |

No se dispone de datos de benchmarks para comparar rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de trabajo, no una release; se actualiza tras cada sesión y puede cambiar en cualquier momento.
- No tiene alineamiento de instrucciones, formato de razonamiento, tool-use ni visión; las salidas pueden ser incoherentes.
- `preprocessor_config.json` y `video_preprocessor_config.json` faltan, por lo que la entrada de imagen no carga desde este repo.
- `text_config.dtype` indica `float16` pero los pesos son bf16; hay que cargar con `dtype=torch.bfloat16` explícito.
- El contexto de 262K no se ha probado tras la poda.
- Riesgo de alucinación elevado por la falta de alineamiento y por el proceso de healing incompleto.
- Sesgos conocidos: no documentados; hereda los del modelo base Qwen3.8-27B, no evaluados aquí.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo desaconseja producción.
- El conjunto de evaluación de distill puede solaparse con entrenamiento y sobrestimar resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Sm0r3s/qwen3.8-7b-heal-v2
- Modelo base podado sin healing: https://huggingface.co/Sm0r3s/qwen3.8-7b-pruned-unhealed
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset MiniMax-distill-SFT: https://huggingface.co/datasets/Sm0r3s/MiniMax-distill-SFT
- Paper Minitron (poda): https://arxiv.org/abs/2407.14679
- Paper Minitron (complementario): https://arxiv.org/abs/2408.11796
