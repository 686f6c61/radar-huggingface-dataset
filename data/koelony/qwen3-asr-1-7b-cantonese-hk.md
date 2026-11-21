# koelony/Qwen3-ASR-1.7B-Cantonese-HK

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK es un ajuste fino completo (full-parameter fine-tune) del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, desarrollado por el usuario koelony (joe2643 en GitHub). El modelo está especializado en cantonés coloquial de Hong Kong (yue-HK) con cambio de código (code-switching) a inglés, y produce de forma nativa caracteres tradicionales hongkoneses con partículas coloquiales como 係, 喺, 嘅, 咗, 㗎 o 閂, manteniendo las palabras inglesas en inglés.

El problema que resuelve es la baja calidad de la transcripción de cantonés coloquial en modelos ASR generalistas: el modelo base Qwen3-ASR-1.7B ya es razonablemente bueno, pero el ajuste reduce el error de caracteres (CER) de forma notable en todos los conjuntos de evaluación cantonés, especialmente en cambio de código y en vocabulario específico de Hong Kong. La versión actual v2.1 (14 de noviembre de 2026) añade además alineación para el sesgo de vocabulario contextual (hotwords), reduciendo el CER en el escenario de comando corto con glosario largo del 21,88 % al 7,19 % sin parroting del prompt.

Con 2.038.052.480 parámetros (aproximadamente 2,04 mil millones), licencia Apache 2.0 y pesos en BF16 en formato Transformers, es un modelo compacto que cabe en GPU de consumo y se puede desplegar con transformers, vLLM, llama.cpp (vía GGUF) o ComfyUI-Drama3. Su relevancia actual radica en cubrir un nicho lingüístico concreto (cantonés de Hong Kong) con calidad medible y con soporte de vocabulario de dominio, algo poco habitual en modelos ASR abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-ASR-1.7B; ASR multimodal con encoder de audio y decoder de lenguaje) |
| Parametros totales | 2.038.052.480 (aproximadamente 2,04 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), FP8 W8A8, NVFP4A16, GGUF Q4_K_M / Q6_K / Q6_K_H (recomendado) / Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (inglés); evaluación solo en cantonés y cantonés-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, Transformers), GGUF, FP8 compressed-tensors, NVFP4 compressed-tensors, layout ComfyUI-Drama3 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full-parameter, sin adaptadores LoRA/PEFT) del checkpoint Qwen/Qwen3-ASR-1.7B en su revisión 7278e1e. Al ser un fine-tune completo, todos los pesos del modelo base se actualizan, y el repositorio contiene los pesos BF16 originales en formato Hugging Face Transformers (config.json + model.safetensors). El modelo base es un sistema ASR de tipo multimodal que combina un encoder de audio con un decoder de lenguaje de la familia Qwen3, y el fine-tune se orienta a la transcripción de cantonés de Hong Kong con cambio de código a inglés.

El entrenamiento se centra en tres objetivos: (1) mejorar la transcripción de cantonés coloquial con caracteres tradicionales hongkoneses y partículas orales; (2) preservar las palabras inglesas en inglés dentro de enunciados cantoneses (code-switching); y (3) alinear el sesgo de vocabulario contextual (hotwords / domain vocabulary biasing) para que el modelo aproveche una lista de términos de dominio sin copiar el prompt en la salida. La versión v2.1 añade esta alineación de biasing, que reduce el CER del escenario short_long_prompt del 21,88 % al 7,19 % con 0,0 % de prompt parroting, y mejora 5 de los 6 benchmarks estándar de cantonés respecto a v2. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Reconocimiento automático del habla (ASR) para cantonés de Hong Kong (yue-HK) con salida en caracteres tradicionales hongkoneses y partículas coloquiales (係, 喺, 嘅, 咗, 㗎, 閂).
- Cambio de código (code-switching) cantonés-inglés: mantiene las palabras inglesas en inglés dentro de enunciados cantoneses.
- Sesgo de vocabulario contextual (hotwords / domain vocabulary biasing): acepta una lista de términos separados por comas mediante el parámetro `context` para mejorar el reconocimiento de vocabulario específico de dominio.
- Salida de texto con normalización de números y sin espacios (según el protocolo de evaluación del autor).
- Soporte de despliegue en transformers (qwen-asr), vLLM, llama.cpp (llama-server) y ComfyUI-Drama3.
- Capacidades multilingües limitadas a yue, zh y en; la evaluación solo cubre cantonés y cantonés-inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Transcripción de reuniones y actas del Consejo Legislativo de Hong Kong (LegCo): el modelo está evaluado específicamente en este conjunto (CER 7,16 %) y maneja registro formal con terminología política y jurídica en cantonés.
- Subtitulado automático de contenido de YouTube en cantonés: el autor evalúa el modelo en un conjunto de 1.292 segmentos de YouTube (MER agrupado 12,33 %), lo que lo hace adecuado para generar subtítulos de creadores hongkoneses con mezcla de inglés.
- Asistentes de voz para comandos de domótica en hogares de Hong Kong: con el sesgo de hotwords se pueden definir términos como 閂燈, 開燈 o 閂冷氣 y reducir el CER del escenario de comando corto con glosario largo al 7,19 %, lo que lo hace viable para comandos de voz con vocabulario cerrado.
- Transcripción de entrevistas y material etnográfico con cambio de código: el modelo mantiene el inglés en inglés y el cantonés en caracteres tradicionales, lo que simplifica el post-proceso de entrevistas bilingües.
- Integración en pipelines de accesibilidad (subtítulos en directo): al caber en GPU de consumo y disponer de GGUF Q6_K_H para llama.cpp, se puede desplegar en estaciones de trabajo locales para subtitulado en tiempo real de eventos en cantonés.
- Reconocimiento de entidades y nombres propios de Hong Kong en audio: el autor reporta una recall de entidades del 94,83 % en su prueba entity_probe_v1 (220 enunciados, 271 menciones), útil para extracción de nombres de personas, organizaciones y lugares en grabaciones.
- Preprocesado de audio para pipelines de NLP en cantonés: transcripción previa a análisis de sentimiento, resumen o indexación de audio en aplicaciones de atención al cliente de empresas hongkonesas.

## Benchmarks y rendimiento

Tasa de error de caracteres (CER, greedy, BF16 con transformers) según la model card del autor:

| Conjunto de prueba | Qwen3-ASR-1.7B stock | v1 | v2 | v2.1 (este) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 4,20 % | 4,00 % | 3,95 % | 3,89 % | 20,97 % |
| Common Voice yue | 5,46 % | 3,80 % | 3,86 % | 3,94 % | 36,44 % |
| Common Voice 23 zh-HK | 7,65 % | 5,18 % | 5,09 % | 5,02 % | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | 2,47 % | 34,52 % |
| LegCo (Consejo Legislativo de HK) | 7,22 % | 7,17 % | 7,16 % | 7,16 % | 32,15 % |
| MCE (code-switching cantonés-inglés) | 11,74 % | 5,61 % | 5,62 % | 5,52 % | 24,00 % |

Suite de prueba held-out de YouTube (T1, 1.292 segmentos, MER script-neutral L1_PURE_NEUTRAL):

| Variante (BF16, language="Cantonese") | T1 agrupado (1.292) | legacy (279) | jimpae (431) | unseen (582) | code_switch | Recall de palabras EN | % simplificado |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-ASR-1.7B stock | 14,28 % | 12,26 % | 19,80 % | 12,25 % | 14,95 % | 63,53 % | (simplificado) |
| v2.1 (este) | 12,33 % | 10,05 % | 18,47 % | 10,09 % | 12,66 % | 76,22 % | 0,20 % |

Benchmark de sesgo de vocabulario contextual (210 clips):

| Condición (70 clips cada una) | CER v2 | CER v2.1 | Prompt parroting v2.1 |
|---|---:|---:|---:|
| Comando corto + glosario largo (short_long_prompt) | 21,88 % | 7,19 % | 0,0 % |
| Homófono / objetivo de dominio (hit_homo) | 7,50 % | 6,54 % | 0,0 % |
| Glosario solo distractores (pure_distractor) | 10,14 % | 10,02 % | 0,0 % |

Prueba de entidades de Hong Kong held-out (entity_probe_v1: 220 enunciados, 271 menciones, 20 distractores por enunciado): v2.1 BF16 alcanza una recall de entidades del 94,83 % (frente a 89,67 % de la versión anterior), con fix-rate del 53,57 % (15/28), break-rate del 0,41 % y falsa copia de distractores del 0,00 % (0/4.400).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para los pesos (2,04 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 8 GB de VRAM para uso cómodo en BF16.
- VRAM estimada en cuantización FP8: aproximadamente 2 GB de pesos; NVFP4A16: aproximadamente 1 GB de pesos; GGUF Q6_K_H: aproximadamente 1,6 GB; Q4_K_M: aproximadamente 1,2 GB.
- GPU recomendadas: NVIDIA A100, H100, L40S o RTX 4090 para BF16 y despliegues de producción con vLLM; RTX 3090/4080/4090 para BF16 en local; RTX 3060 12 GB o superior para cuantizaciones GGUF/FP8.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs con 8 GB en cuantizaciones de 8 bits o inferiores.
- Opciones de despliegue: transformers con qwen-asr, vLLM (BF16, FP8 W8A8, NVFP4A16), llama.cpp (llama-server, GGUF Q4_K_M / Q6_K / Q6_K_H / Q8_0 con mmproj), ComfyUI-Drama3 (layout nativo) y OraType.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en cantonés (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK (este, v2.1) | 2,04 B | no disponible | FLEURS 3,89 %; Common Voice yue 3,94 %; MCE 5,52 % | Apache 2.0 | Hugging Face (BF16, GGUF, FP8, NVFP4) |
| Qwen3-ASR-1.7B stock | 2,04 B | no disponible | FLEURS 4,20 %; Common Voice yue 5,46 %; MCE 11,74 % | Apache 2.0 (según modelo base) | Hugging Face |
| whisper-large-v3 | no disponible en la información | no disponible | FLEURS 20,97 %; Common Voice yue 36,44 %; MCE 24,00 % | no disponible en la información | Hugging Face / OpenAI |

La comparativa se limita a los modelos presentes en la model card del autor; no se dispone de datos de otros modelos ASR abiertos especializados en cantonés para ampliar la tabla.

## Limitaciones y advertencias

- Solo se ha evaluado en cantonés y cantonés-inglés; para otros idiomas el rendimiento puede ser peor que el del modelo base Qwen3-ASR-1.7B.
- El autor advierte de que, al igual que el modelo base, el ajuste muestra un 100 % de disparos en silencio sintético o ambiente (conjunto T3), por lo que se recomienda filtrar silencio y no-habla (voice activity detection) antes de la transcripción.
- Riesgo de alucinación y de parroting del prompt: aunque la v2.1 reporta 0,0 % de prompt parroting en su suite de biasing, el uso de glosarios largos puede inducir copias de términos del contexto en la salida si no se controla.
- El parámetro `language` debe forzarse a "Cantonese"; dejarlo en `None` no mejora el code-switching (−0,06 puntos) y añade riesgo de detección errónea de idioma en clips cortos o ruidosos.
- La salida nativa es en caracteres tradicionales hongkoneses; para comparaciones entre modelos el autor normaliza a simplificado con OpenCC `t2s`, lo que puede introducir artefactos de conversión.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al ser un fine-tune sobre un modelo base de Qwen, puede heredar sesgos del corpus original, no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-ASR-1.7B y de los datasets de evaluación (FLEURS, Common Voice, MDCC, LegCo, MCE) si se redistribuyen derivados.
- El repositorio ocupa 20,4 GB, lo que incluye múltiples formatos y el layout de ComfyUI; conviene descargar solo los archivos necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Repositorio GitHub del autor: https://github.com/joe2643/qwen3-asr-cantonese-hk
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Versión GGUF: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Versión FP8: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-FP8
- Versión NVFP4: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-NVFP4
- ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Apoyo al autor: https://buymeacoffee.com/joe2643
