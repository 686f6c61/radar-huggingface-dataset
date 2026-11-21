# koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen
Qwen3-ASR-1.7B-Cantonese-HK-GGUF es una versión cuantizada en formato GGUF del modelo de reconocimiento automático de voz (ASR) Qwen3-ASR-1.7B, especializado mediante fine-tuning para cantonés coloquial de Hong Kong (yue-HK) con alternancia de código (code-switching) entre cantonés e inglés. Lo publica el usuario koelony sobre el modelo base de joe2643, que a su vez deriva del Qwen3-ASR-1.7B original de Alibaba. El modelo resuelve un problema concreto: los modelos ASR genéricos tienden a producir chino simplificado o caracteres de cantonés continental, mientras que esta versión genera caracteres tradicionales de Hong Kong con vocabulario coloquial auténtico y mantiene las palabras inglesas en inglés.

La versión actual v2.1 incorpora alineamiento para sesgo de vocabulario contextual (hotwords), lo que reduce el CER en comandos cortos con glosarios largos del 21,88 % al 7,19 % y elimina el efecto de "parroting" (repetición espuria del prompt). El modelo tiene 1.720.574.976 parámetros y se distribuye con licencia Apache 2.0, orientado a despliegue local mediante llama.cpp (llama-server) y la aplicación OraType.

Es relevante ahora porque cubre un hueco de nicho —ASR de alta precisión para cantonés de Hong Kong con mezcla de inglés— donde alternativas genéricas como whisper-large-v3 obtienen tasas de error varias veces superiores, y porque ofrece pesos GGUF listos para ejecución local con endpoint compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR basado en Qwen3-ASR-1.7B (transformer multimodal audio-texto; encoder de audio + decoder de lenguaje) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (valor usado en el ejemplo de llama-server con `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q6_K_H (protegida: `token_embd=Q8_0`, `attn_v=Q8_0`, `output=F16`), Q8_0; encoder de audio mmproj en Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj GGUF separado para el encoder de audio); pesos BF16 originales en Transformers disponibles en el modelo base |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-ASR-1.7B, un sistema ASR multimodal que combina un encoder de audio con un decoder de lenguaje de la familia Qwen3, y ha sido sometido a fine-tuning supervisado sobre datos de cantonés de Hong Kong para adaptar tanto el vocabulario como la salida ortográfica (caracteres tradicionales de Hong Kong frente a simplificados). La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; indica únicamente que el fine-tuning busca cantonés coloquial con alternancia de código inglés.

La innovación técnica destacable de la versión v2.1 es el alineamiento para sesgo de vocabulario contextual (context/hotword biasing): el modelo acepta un glosario de términos vía el campo `prompt` del endpoint `/v1/audio/transcriptions` o vía system prompt en chat completions, y se ha entrenado para aprovecharlo sin copiar distractores. Los resultados reportados son una tasa de corrección del 50,00 % (recall del 89,67 % al 94,83 %) con 0,00 % de break-rate y 0,00 % (0/4.400) de falsa copia de distractores en la prueba `entity_probe_v1`. Además, la cuantización Q6_K_H preserva `token_embd` y `attn_v` en Q8_0 y la salida en F16 para reducir los bucles de repetición inducidos por cuantización en habla real.

## Capacidades
- Reconocimiento automático de voz en cantonés de Hong Kong (yue-HK) con salida en caracteres tradicionales y vocabulario coloquial auténtico (`係`, `喺`, `嘅`, `咗`, `㗎`, entre otros).
- Alternancia de código cantonés-inglés: mantiene las palabras inglesas en inglés en la transcripción.
- Sesgo de vocabulario contextual (hotwords): acepta glosarios de entidades y términos de dominio para mejorar el recall de nombres propios y comandos.
- Endpoint compatible con OpenAI: `/v1/audio/transcriptions` (con campo `prompt` para hotwords) y `/v1/chat/completions` con entrada `input_audio`.
- Salida estructurada con prefijo de idioma y marcador `<asr_text>` que delimita la transcripción.
- Soporte multilingüe limitado a yue, zh y en.
- Integración con llama.cpp (`llama-server`) y con la aplicación OraType.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo thinking.

## Casos de uso
- Transcripción de reuniones y llamadas en cantonés de Hong Kong: el modelo gestiona audio conversacional con vocabulario coloquial local y preserva términos ingleses intercalados, adecuado para actas y resúmenes posteriores.
- Dictado por voz en aplicaciones de productividad: integrable en OraType o en clientes propios mediante el endpoint compatible con OpenAI, con latencia baja gracias a los pesos Q4_K_M o Q6_K_H.
- Comandos de voz para domótica: el sesgo de hotwords permite glosarios como `閂燈`, `開燈`, `閂冷氣`, con CER del 7,19 % en comandos cortos con glosarios largos y 0,00 % de parroting.
- Subtitulado de contenido audiovisual en cantonés: útil para medios de Hong Kong con mezcla de inglés, donde whisper-large-v3 obtiene CER de 24,00 % en code-switching frente al 5,52 % de este modelo.
- Transcripción de actas legislativas y documentos formales: el conjunto LegCo muestra CER de 7,16 %, lo que lo hace viable para indexación y búsqueda de sesiones del Consejo Legislativo de Hong Kong.
- Atención al cliente en centros de contacto de Hong Kong: transcripción de conversaciones multi-turno con vocabulario de dominio (nombres de producto, entidades) gracias al biasing por prompt.
- Investigación lingüística sobre cantonés coloquial: permite generar transcripciones con ortografía tradicional consistente para corpus y estudios de variación.

## Benchmarks y rendimiento
Tasas de error de caracteres (CER) en decodificación greedy con BF16 en Transformers, según la model card:

| Conjunto de prueba | Qwen3-ASR-1.7B original | v1 | v2 | v2.1 (esta versión) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 4,20 % | 4,00 % | 3,95 % | 3,89 % | 20,97 % |
| Common Voice `yue` | 5,46 % | 3,80 % | 3,86 % | 3,94 % | 36,44 % |
| Common Voice 23 `zh-HK` | 7,65 % | 5,18 % | 5,09 % | 5,02 % | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | 2,47 % | 34,52 % |
| LegCo (Consejo Legislativo de HK) | 7,22 % | 7,17 % | 7,16 % | 7,16 % | 32,15 % |
| MCE (code-switching cantonés-inglés) | 11,74 % | 5,61 % | 5,62 % | 5,52 % | 24,00 % |

Comparativa de cuantizaciones GGUF en llama-server (Vulkan), según la model card:

| Modelo / cuantización | T1 Pooled (1.292) L1_PURE_NEUTRAL ↓ | Δ vs v2.1 Q6_K | Δ vs v2.1 BF16 | gold_core_400 ↓ | T3 (200) oratype_v2 ↓ | t3_real (118) oratype_v2 ↓ |
|---|---:|---:|---:|---:|---:|---:|
| v2.1 PyTorch BF16 (referencia) | 12,33 % | -0,65 pt | ref | 11,64 % | 1,00 % | 5,08 % |
| v2.1 GGUF Q6_K (legacy) | 12,98 % | ref | +0,65 pt | 12,69 % | 0,00 % | 4,24 % |
| v2.1 GGUF Q6_K_H (recomendada) | 12,52 % | -0,46 pt | +0,19 pt | 11,64 % | 0,50 % | 4,24 % |

Prueba de sesgo de entidades con hotwords (`entity_probe_v1`, 220 enunciados, 271 menciones, 20 distractores por enunciado): tasa de corrección del 50,00 % (recall 89,67 % → 94,83 %), break-rate 0,00 % y falsa copia de distractores 0,00 % (0/4.400).

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M, 1,4 GB con Q6_K, 1,5 GB con Q6_K_H y 1,8 GB con Q8_0, más unos 356 MB para el encoder de audio mmproj-Q8_0.
- Cabe en GPU de consumo: sí, prácticamente cualquier GPU con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090), así como en CPU mediante llama.cpp.
- GPU recomendadas: RTX 4090 o A100/H100 para máximo throughput en lotes grandes; para uso individual basta una GPU de gama media.
- Opciones de despliegue: llama.cpp (`llama-server`) con los ficheros GGUF y el mmproj; integración nativa en OraType; los pesos BF16 originales se ejecutan con Transformers.
- Latencia y throughput: la model card no publica cifras de latencia ni throughput; sí documenta que la cuantización Q6_K estándar provocaba bucles de repetición ocasionales en habla real, mitigados con Q6_K_H.
- Configuración de referencia: `llama-server -m Qwen3-ASR-1.7B-Cantonese-HK.Q6_K_H.gguf --mmproj Qwen3-ASR-1.7B-Cantonese-HK.mmproj-Q8_0.gguf -c 4096 -np 1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en cantonés (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK-GGUF (este) | 1,72 B | 4.096 tokens | 2,47 %–7,16 % según conjunto | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-ASR-1.7B original | 1,72 B | no disponible | 4,20 %–11,74 % según conjunto | no disponible en la información | Hugging Face |
| whisper-large-v3 | no disponible en la información | no disponible | 20,97 %–41,76 % según conjunto | no disponible en la información | Hugging Face / OpenAI |

El modelo supera consistentemente a whisper-large-v3 en todos los conjuntos de cantonés reportados y mejora al Qwen3-ASR-1.7B original en todos ellos, con la mayor ganancia en code-switching (11,74 % → 5,52 %) y Common Voice yue (5,46 % → 3,94 %).

## Limitaciones y advertencias
- El modelo está especializado en cantonés de Hong Kong y alternancia con inglés; su rendimiento en otras variedades de chino o en idiomas no listados no está documentado.
- Riesgo de bucles de repetición en habla real con cuantizaciones agresivas: la model card documenta que Q6_K estándar eleva el MER a 12,98 % frente a 12,33 % en BF16; se recomienda Q6_K_H o Q8_0 para producción.
- La model card menciona una nota sobre "guardia de no-habla" en producción para modelos GGUF en ejecución continua, cuyo contenido completo no está disponible en la información proporcionada.
- El sesgo de hotwords reduce el CER en comandos, pero su eficacia depende de la calidad y pertinencia del glosario; los distractores no se copian según las pruebas reportadas, aunque no se documentan límites de tamaño de glosario.
- No se documentan sesgos demográficos, acústicos ni de género; al ser un fine-tuning sobre datos de Hong Kong, es probable una menor robustez ante acentos no nativos, extremo no cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias del modelo base y del dataset original, no detalladas aquí.
- La fecha de creación del repositorio (2026-11-07) y las revisiones v1/v2/v2.1 indican un proyecto en evolución rápida; los SHA-256 de los ficheros están publicados para verificación de integridad.

## Enlaces
- Hugging Face: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base BF16: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK
- Repositorio GitHub: https://github.com/joe2643/qwen3-asr-cantonese-hk
- Revisión v2: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/b1c3dc91
- Revisión v1: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/1afe540def044173f7412dc72584f803b92bfa96
- Apoyo al autor: https://buymeacoffee.com/joe2643
