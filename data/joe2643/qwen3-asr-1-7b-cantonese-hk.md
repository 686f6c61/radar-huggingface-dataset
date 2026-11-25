# joe2643/Qwen3-ASR-1.7B-Cantonese-HK

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK es un ajuste fino completo (full fine-tune) del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, desarrollado por el usuario joe2643 bajo el paraguas del proyecto Koelony. El modelo está especializado en cantonés coloquial de Hong Kong (yue-HK) con conmutación de código (code-switching) hacia inglés, y añade soporte para sesgo de vocabulario mediante contexto y hotwords. Resuelve el problema de la baja precisión de los sistemas ASR genéricos en variedades lingüísticas con poca representación, especialmente en registro coloquial y mezcla de idiomas.

El modelo conserva la arquitectura del Qwen3-ASR base, con 2.038.052.480 parámetros totales (aproximadamente 1,7 mil millones según la nomenclatura comercial) y pesos en BF16. Es relevante porque combina una mejora sustancial en benchmarks estándar de cantonés con una funcionalidad de sesgo de vocabulario que reduce drásticamente los errores en dominios específicos, manteniendo una licencia Apache 2.0 permisiva para uso comercial.

La versión actual es v2.1 (2026-11-14), que mejora cinco de los seis benchmarks estándar de cantonés respecto a v2 y añade alineación para el sesgo de vocabulario de dominio, reduciendo el CER de 21,88% a 7,19% en el escenario de comando corto con glosario largo, sin parroting del prompt (0,0%). El modelo se distribuye en múltiples formatos (BF16, GGUF, FP8, NVFP4) y cuenta con integración para ComfyUI, vLLM y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (Qwen3-ASR) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), GGUF Q4_K_M / Q6_K / Q6_K_H / Q8_0, FP8 W8A8, NVFP4A16 |
| Idiomas soportados | yue (cantonés), zh (chino), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), GGUF, FP8 compressed-tensors, NVFP4 compressed-tensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-1.7B (revision 7278e1e) y se somete a un ajuste fino completo de todos los parámetros, sin adaptadores LoRA ni PEFT. La arquitectura subyacente es la del Qwen3-ASR, un modelo transformer diseñado para reconocimiento automático del habla que procesa audio y genera transcripciones textuales. El ajuste se orienta específicamente al cantonés coloquial de Hong Kong, con salida nativa en chino tradicional de Hong Kong y caracteres coloquiales (係, 喺, 嘅, 咗, 㗎, 閂), preservando las palabras en inglés sin traducir.

La versión v2.1 incorpora una alineación específica para el sesgo de contexto y vocabulario de dominio, que permite condicionar la transcripción mediante un glosario o prompt de contexto. Esta funcionalidad reduce el CER en escenarios de comando corto con glosario largo de 21,88% a 7,19%, con una tasa de parroting del prompt del 0,0%. El entrenamiento se evalúa con normalización de texto (conversión a simplificado mediante OpenCC t2s, normalización de números y eliminación de espacios) y forzando el idioma a cantonés. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) para cantonés de Hong Kong en registro coloquial.
- Transcripción con conmutación de código (code-switching) cantonés-inglés, manteniendo las palabras inglesas en inglés.
- Salida nativa en chino tradicional de Hong Kong con caracteres coloquiales correctos.
- Sesgo de vocabulario mediante contexto y hotwords (context/hotword vocabulary biasing), útil para dominios con terminología específica.
- Soporte de prompts de contexto para mejorar la precisión en entidades y términos de dominio.
- Capacidad multilingüe limitada a yue, zh y en.
- Integración con ComfyUI mediante el layout ComfyUI-Drama3.
- Compatibilidad con vLLM, llama.cpp (llama-server), transcribe.cpp y OraType.
- No se dispone de información sobre tool calling, function calling, agentes o razonamiento multi-paso, al ser un modelo especializado en ASR.

## Casos de uso

- Transcripción de reuniones y actas del Consejo Legislativo de Hong Kong: el modelo alcanza un CER de 7,16% en el conjunto LegCo, adecuado para generar borradores de actas con revisión humana posterior.
- Subtitulado automático de contenido audiovisual en cantonés coloquial: la salida en chino tradicional de Hong Kong con caracteres coloquiales reduce la necesidad de corrección manual en plataformas de vídeo.
- Atención al cliente en centros de llamadas de Hong Kong: la capacidad de code-switching cantonés-inglés permite transcribir conversaciones reales donde los hablantes mezclan ambos idiomas.
- Dictado médico o legal con vocabulario especializado: el sesgo de hotwords reduce el CER de 21,88% a 7,19% en comandos cortos con glosario largo, lo que lo hace viable para dominios con terminología técnica.
- Integración en pipelines de ComfyUI para generación de subtítulos en flujos de postproducción: el layout ComfyUI-Drama3 permite cargar el modelo de forma nativa en dicho entorno.
- Despliegue en dispositivos de borde o estaciones de trabajo con llama.cpp: los formatos GGUF Q4_K_M y Q6_K permiten inferencia local sin GPU dedicada de gran capacidad.
- Investigación lingüística sobre cantonés coloquial: el modelo preserva caracteres coloquiales y marcas de registro oral, útil para corpus y estudios sociolingüísticos.
- Evaluación de sistemas ASR en variedades de bajo recursos: sirve como referencia de ajuste fino sobre un modelo base multilingüe con resultados medibles en FLEURS, Common Voice y MDCC.

## Benchmarks y rendimiento

Resultados de Character Error Rate (CER, greedy, BF16 transformers) en benchmarks estándar de cantonés:

| Test Set | Stock Qwen3-ASR-1.7B | v1 | v2 | v2.1 (este) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 4,20% | 4,00% | 3,95% | 3,89% | 20,97% |
| Common Voice yue | 5,46% | 3,80% | 3,86% | 3,94% | 36,44% |
| Common Voice 23 zh-HK | 7,65% | 5,18% | 5,09% | 5,02% | 41,76% |
| MDCC | 4,25% | 2,53% | 2,49% | 2,47% | 34,52% |
| LegCo (HK Legislative Council) | 7,22% | 7,17% | 7,16% | 7,16% | 32,15% |
| MCE (Cantonese-English Code-Switching) | 11,74% | 5,61% | 5,62% | 5,52% | 24,00% |

Resultados en el conjunto de prueba held-out de YouTube (T1, 1.292 segmentos, MER script-neutral L1_PURE_NEUTRAL):

| Arm (BF16, language="Cantonese") | T1 Pooled (1.292) | legacy (279) | jimpae (431) | unseen (582) | code_switch | EN Word Recall | Simplified % |
|---|---:|---:|---:|---:|---:|---:|---:|
| Stock Qwen3-ASR-1.7B | 14,28% | 12,26% | 19,80% | 12,25% | 14,95% | 63,53% | (simplified) |
| v2.1 (este) | 12,33% | 10,05% | 18,47% | 10,09% | 12,66% | 76,22% | 0,20% |

Resultados de sesgo de vocabulario (210 clips):

| Condición (70 clips cada una) | v2 CER | v2.1 CER | v2.1 Prompt Parroting |
|---|---:|---:|---:|
| Short command + long glossary (short_long_prompt) | 21,88% | 7,19% | 0,0% |
| Homophone / domain target hit (hit_homo) | 7,50% | 6,54% | 0,0% |
| Pure distractor glossary (pure_distractor) | 10,14% | 10,02% | 0,0% |

Sonda de entidades de Hong Kong (entity_probe_v1: 220 utterances, 271 menciones, 20 distractores por utterance): v2.1 BF16 alcanza un entity recall de 94,83% (frente a 89,67% de v2), fix-rate de 53,57% (15/28), break-rate de 0,41% y false-copy de distractores de 0,00% (0/4.400).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB solo para pesos (2.038 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 8 GB de VRAM para uso cómodo.
- VRAM estimada en FP8 W8A8: aproximadamente 2 GB para pesos, con mayor espacio para caché KV; adecuado para GPUs con 6-8 GB.
- VRAM estimada en NVFP4A16: aproximadamente 1 GB para pesos, el formato más pequeño y rápido para vLLM.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1,2 GB; Q6_K_H (recomendado): aproximadamente 1,7 GB; Q8_0: aproximadamente 2,2 GB.
- GPU recomendadas: NVIDIA A100, H100 para despliegues de alto throughput con vLLM; RTX 4090, RTX 3090, RTX 4080 para inferencia en BF16 o FP8; GPUs consumer con 6-8 GB (RTX 3060, RTX 4060) para GGUF cuantizado.
- Cabe en GPU consumer: sí, en formatos GGUF Q4_K_M y Q6_K_H, e incluso en FP8/NVFP4 con GPUs de 6-8 GB.
- Opciones de despliegue: transformers (BF16), vLLM (BF16, FP8, NVFP4), llama.cpp / llama-server (GGUF), transcribe.cpp, OraType, ComfyUI-Drama3.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER Cantonés (FLEURS yue_hant_hk) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK v2.1 | 2.038.052.480 | no disponible | 3,89% | Apache 2.0 | Hugging Face (BF16, GGUF, FP8, NVFP4) |
| Qwen3-ASR-1.7B (stock) | 2.038.052.480 (aprox.) | no disponible | 4,20% | Apache 2.0 | Hugging Face |
| whisper-large-v3 | no disponible | no disponible | 20,97% | MIT (según información pública de OpenAI) | Hugging Face, OpenAI API |

La comparativa se limita a los modelos incluidos en los benchmarks proporcionados. No se dispone de datos de otros modelos ASR especializados en cantonés para una comparación más amplia.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en cantonés (yue), chino (zh) e inglés (en); no soporta otras lenguas de forma fiable.
- Los benchmarks solo cubren habla cantonesa y cantonesa-inglesa; el rendimiento en otros registros o acentos no está documentado.
- Riesgo de alucinación y de parroting del prompt: aunque v2.1 reporta 0,0% de parroting en las pruebas de sesgo, persiste el riesgo en prompts de contexto mal diseñados o glosarios con distractores.
- La salida en chino tradicional de Hong Kong puede requerir normalización adicional para integración con sistemas que esperan chino simplificado.
- El sesgo de vocabulario depende de la calidad del glosario o prompt de contexto; glosarios con distractores reducen la precisión (CER de 10,02% en pure_distractor).
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-ASR-1.7B y de los datasets de evaluación utilizados.
- No se dispone de información sobre sesgos demográficos, de género o de edad en el modelo.
- El tamaño del repositorio (20,4 GB) incluye múltiples formatos y artefactos; la descarga completa puede ser costosa en almacenamiento.
- La información sobre latencia, throughput y longitud de contexto no está disponible, lo que limita la planificación de despliegues en producción.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK
- Hugging Face (GGUF): https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Hugging Face (FP8): https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-FP8
- Hugging Face (NVFP4): https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Autor en Hugging Face: https://huggingface.co/joe2643
