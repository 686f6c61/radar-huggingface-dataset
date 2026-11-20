# lly0571/Qwen3-ASR-1.7B-FP8-W8A8

## Resumen

Qwen3-ASR-1.7B-FP8-W8A8 es una versión cuantizada del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen (Alibaba). Este checkpoint concreto ha sido generado y publicado por el usuario lly0571 en Hugging Face y ModelScope, aplicando cuantización FP8 W8A8 mediante la herramienta LLM Compressor sobre el modelo base en BF16.

El modelo resuelve el problema de transcripción de voz a texto multilingüe con un tamaño compacto (alrededor de 2.038 millones de parámetros totales, 2,7 GB de repositorio) y un peso en disco de 2,48 GB en FP8, un 34,6 % menos que la versión BF16. Está pensado para despliegues de ASR en producción donde la latencia y el coste de VRAM son críticos, manteniendo una precisión acústica prácticamente idéntica al modelo original (WER de 1,64 % frente a 1,62 % en LibriSpeech test-clean).

La relevancia actual radica en que la familia Qwen3-ASR cubre 52 idiomas y dialectos (30 idiomas y 22 dialectos chinos), soporta inferencia en streaming y offline con un único modelo, y el 1.7B se sitúa, según el autor, en el estado del arte entre los modelos ASR de código abierto. La cuantización FP8 permite servir este modelo en GPUs de gama media con vLLM, reduciendo el coste por hora de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de audio + decoder de lenguaje Qwen3), empaquetado como `Qwen3ASRForConditionalGeneration` |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de servicio recomendada en vLLM; `--max-model-len 8192`) |
| Tipos de cuantizacion | FP8 W8A8 (E4M3, per-tensor estático, `float-quantized`); existe también variante AWQ W4A16 (INT4 asimétrico, group_size=128) |
| Idiomas soportados | 30 idiomas (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro) y 22 dialectos chinos |
| Licencia | no disponible en la información proporcionada |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un modelo multimodal compuesto por un encoder de audio y un decoder de lenguaje basado en Qwen3, entrenado sobre grandes volúmenes de datos de habla y apoyado en la capacidad de comprensión de audio de Qwen3-Omni. Soporta identificación de idioma y reconocimiento de voz en 52 idiomas y dialectos, con inferencia unificada en modo offline y streaming, y transcripción de audio largo.

La cuantización de este checkpoint afecta exclusivamente a las 196 capas lineales del decoder de lenguaje (28 capas × 7 proyecciones: `q/k/v/o_proj` y `gate/up/down_proj`). El encoder de audio, el proyector multimodal, los embeddings, la LM head, las layer norms y la caché KV permanecen en BF16 en todas las variantes para preservar la precisión acústica. La calibración se realizó con 384 clips de `google/fleurs` (128 en inglés, 128 en japonés, 128 en mandarín, semilla 42) usando LLM Compressor 0.15.0 y compressed-tensors 0.20.1. No se dispone de información sobre el proceso de entrenamiento original (número de tokens, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en 30 idiomas y 22 dialectos chinos, incluyendo acentos del inglés de distintas regiones.
- Identificación automática de idioma (language identification) integrada en el mismo modelo.
- Transcripción de audio largo y modo streaming unificado con el modo offline.
- Robustez ante entornos acústicos complejos y patrones de texto difíciles.
- Procesamiento de voz cantada y canciones con música de fondo (BGM), según la tabla de tipos de audio del modelo base.
- Alineación forzada de timestamps mediante el modelo complementario Qwen3-ForcedAligner-0.6B (hasta 5 minutos de audio en 11 idiomas).
- Inferencia por lotes y servicio asíncrono a través de vLLM.
- Tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada (el modelo es específico de ASR).

## Casos de uso

- Transcripción masiva de reuniones y entrevistas: el modelo procesa audio largo en modo offline con contexto de 8192 tokens y puede servirse por lotes con vLLM, lo que permite transcribir horas de grabaciones con throughput alto en una sola GPU.
- Subtitulado automático de vídeo: combinado con Qwen3-ForcedAligner-0.6B se obtienen timestamps por unidad, adecuados para generar subtítulos sincronizados en 11 idiomas.
- Atención al cliente por voz: la identificación de idioma integrada permite enrutar llamadas en 30 idiomas sin un clasificador separado, y el modo streaming reduce la latencia percibida.
- Servicio de transcripción en streaming para aplicaciones móviles: el modo streaming unificado con el offline simplifica la infraestructura, manteniendo una sola instancia de modelo.
- Análisis de contenido musical y podcasts: la capacidad de transcribir voz cantada y canciones con BGM amplía el caso de uso a plataformas de audio y música.
- Despliegue en GPUs de gama media: al ocupar 2,48 GB en FP8, el modelo cabe en tarjetas consumer con 8-12 GB de VRAM, habilitando transcripción on-premise con coste contenido.
- Investigación en ASR multilingüe: al ser código abierto y con pesos safetensors compatibles con transformers, sirve como base para fine-tuning y evaluación en idiomas de bajos recursos.

## Benchmarks y rendimiento

Evaluación en LibriSpeech `test-clean` con el scorer de `hf-audio/open-asr-leaderboard`:

| Variante | Tamano de pesos | Tamano vs BF16 | WER (scorer OAL) | Cambio relativo vs BF16 |
|---|---|---|---|---|
| BF16 baseline | 3,79 GB | — | 1,62 % | — |
| FP8 W8A8 | 2,48 GB | -34,6 % | 1,64 % | +1,28 % |
| AWQ W4A16 | 1,85 GB | -51,2 % | 1,71 % | +5,58 % |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni cifras de throughput o latencia medidas para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para los pesos FP8, más overhead de caché KV y activaciones; con `--gpu-memory-utilization 0.72` y `--max-model-len 8192` el consumo real depende de la GPU y del lote.
- GPUs recomendadas: A100, H100 o L40S para servicio por lotes de alta concurrencia; RTX 4090 y GPUs consumer de 8-12 GB para inferencia individual.
- Cabe en GPU consumer: sí, con 8 GB de VRAM o más en FP8; la variante AWQ W4A16 (1,85 GB) reduce aún más el requisito.
- Opciones de despliegue: vLLM 0.34.0 (probado por el autor, con `--limit-mm-per-prompt '{"audio": {"count": 1, "length": 8192}}'`); el paquete `qwen-asr` oficial; otros motores como llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible para esta variante. El modelo base 0.6B alcanza 2000 veces throughput con concurrencia 128 según el autor; no se reportan cifras equivalentes para el 1.7B FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-FP8-W8A8 (este) | 2.038 M | 8192 tokens | 1,64 % | no disponible | Hugging Face, ModelScope |
| Qwen3-ASR-1.7B (BF16) | 2.038 M | 8192 tokens | 1,62 % | no disponible | Hugging Face (Qwen) |
| Qwen3-ASR-0.6B | no disponible | no disponible | no disponible | no disponible | Hugging Face (Qwen) |
| Whisper large-v3 | no disponible | no disponible | no disponible | no disponible | OpenAI |

No se dispone en la información proporcionada de datos comparativos de WER para Whisper u otros modelos ASR de código abierto; la comparación se limita a las variantes de la propia familia Qwen3-ASR.

## Limitaciones y advertencias

- El checkpoint es un mirror de ModelScope; autoría y licencia pertenecen al repositorio de origen, y la licencia no está indicada en la información disponible. Verificar antes de uso comercial.
- Solo se cuantizan las capas lineales del decoder; el encoder y el proyector permanecen en BF16, por lo que el ahorro de memoria es parcial (34,6 % frente al BF16).
- La calibración se realizó con solo 384 clips de tres idiomas (inglés, japonés y mandarín); el rendimiento en el resto de los 30 idiomas puede degradarse respecto al baseline BF16.
- Riesgo de alucinación en audio con ruido extremo, solapamiento de hablantes o música de fondo intensa; no se reportan métricas específicas para estos escenarios.
- El contexto máximo recomendado es de 8192 tokens; audios muy largos deben segmentarse o usar el modo streaming.
- La variante AWQ W4A16 presenta una degradación de WER del 5,58 % frente al BF16, superior a la de FP8; elegir en función del compromiso memoria/precisión.
- No se dispone de información sobre sesgos demográficos o acústicos del modelo base en la documentación proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente de esta cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/lly0571/Qwen3-ASR-1.7B-FP8-W8A8
- ModelScope (origen): https://www.modelscope.cn/models/lly0571/Qwen3-ASR-1.7B-FP8-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open-asr-leaderboard
- Dataset de calibración: https://huggingface.co/datasets/google/fleurs
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
