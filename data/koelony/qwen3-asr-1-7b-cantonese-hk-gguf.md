# koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es una cuantización en formato GGUF del modelo de reconocimiento automático del habla (ASR) Qwen3-ASR-1.7B, ajustado finamente por el desarrollador independiente koelony para transcripción de cantonés coloquial de Hong Kong (`yue-HK`) con mezcla de código inglés. El modelo parte de la base Qwen3-ASR-1.7B de Alibaba y resuelve un problema concreto: el modelo original tiende a producir chino simplificado o caracteres de cantonés continental, mientras que esta variante genera chino tradicional de Hong Kong con vocabulario coloquial auténtico y mantiene las palabras inglesas en inglés.

La versión actual es la v2.1 (14 de noviembre de 2026, con la variante protegida `Q6_K_H` añadida el 21 de noviembre de 2026), que incorpora alineación para el sesgo de vocabulario contextual (hotwords) y mejora en cinco de los seis conjuntos de prueba estándar de cantonés. El modelo tiene 1.720.574.976 parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en que cubre un nicho poco atendido —el cantonés hablado de Hong Kong con code-switching inglés— con una tasa de error de caracteres (CER) muy inferior a la de whisper-large-v3 en todos los conjuntos evaluados, y en que su exportación a GGUF permite ejecutarlo localmente con `llama.cpp` en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-ASR, encoder de audio + decoder de texto); no se detalla la configuración interna en la información disponible |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de `llama-server` con `-c 4096`); no se especifica el máximo oficial |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q6_K_H (protegida: `token_embd=Q8_0`, `attn_v=Q8_0`, `output=F16`), Q8_0; mmproj en Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj GGUF para el encoder de audio); pesos originales BF16 en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-ASR-1.7B, un sistema ASR basado en transformer que combina un encoder de audio con un decoder de lenguaje. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el ajuste se orientó a cantonés coloquial de Hong Kong con code-switching inglés.

La innovación técnica destacable es la alineación para sesgo de vocabulario contextual (context/hotword biasing), introducida en la v2.1: permite pasar un glosario de entidades o términos de dominio mediante el campo `prompt` del endpoint `/v1/audio/transcriptions`, lo que reduce el CER en comandos cortos con glosarios largos del 21,88 % al 7,19 % con un 0,0 % de "parroting" (repetición espuria de términos del prompt). Además, la cuantización protegida `Q6_K_H` mantiene en Q8_0 los tensores `token_embd` y `attn_v` y la salida en F16, lo que elimina la mayoría de los bucles de repetición inducidos por cuantización que aparecían con `Q6_K` estándar en habla real, con un coste de solo unos 90 MiB adicionales.

## Capacidades

- Reconocimiento automático del habla (ASR) para cantonés de Hong Kong (`yue-HK`), chino y inglés.
- Transcripción con salida nativa en chino tradicional de Hong Kong y vocabulario coloquial auténtico (`係`, `喺`, `嘅`, `咗`, `㗎`, entre otros).
- Manejo de code-switching cantonés-inglés: mantiene las palabras inglesas en inglés en lugar de transliterarlas.
- Sesgo de vocabulario contextual mediante glosarios/hotwords pasados en el prompt del sistema, con bajo riesgo de falsos positivos por distractor (0,00 % de copia falsa en la evaluación `entity_probe_v1`).
- Compatible con endpoints (`endpoints_compatible`) y con el endpoint `/v1/audio/transcriptions` de `llama-server`.
- Integración con OraType (aplicación de dictado) mediante los archivos GGUF publicados con sus hashes SHA-256.
- Procesamiento de audio mediante el encoder multimodal separado (`mmproj-Q8_0.gguf`).

## Casos de uso

- Subtitulado y transcripción de contenido audiovisual en cantonés: el modelo transcribe audio de vídeo o pódcast en cantonés de Hong Kong con CER del 3,89 % en FLEURS, adecuado para generar subtítulos automáticos con revisión humana ligera.
- Atención al cliente en centros de llamadas de Hong Kong: permite transcribir conversaciones telefónicas con mezcla de cantonés e inglés (CER del 5,52 % en el conjunto MCE), un escenario habitual en empresas de la región.
- Dictado por voz en aplicaciones de productividad: integrable en OraType o en clientes propios vía `llama-server`, con la cuantización `Q6_K_H` como opción recomendada para evitar bucles de repetición en habla real.
- Transcripción de actas legislativas y reuniones oficiales: el conjunto LegCo (Consejo Legislativo de Hong Kong) muestra un CER del 7,16 %, lo que lo hace viable para actas con revisión posterior.
- Reconocimiento de entidades y nombres propios en dominios específicos: mediante el sesgo de hotwords se logra una tasa de corrección del 50,00 % (recall del 89,67 % al 94,83 %) en entidades de Hong Kong, útil para transcripción de nombres de empresas, personas o lugares.
- Procesamiento por lotes de corpus de voz para investigación lingüística: al ser Apache 2.0 y ejecutable en local con `llama.cpp`, permite transcribir grandes volúmenes de audio sin enviar datos a servicios externos.
- Asistentes de voz embebidos o de borde: las cuantizaciones Q4_K_M (1,1 GB) y Q6_K_H (1,5 GB) permiten desplegar el modelo en equipos con recursos limitados.

## Benchmarks y rendimiento

Tasa de error de caracteres (CER, decodificación greedy, BF16 con `transformers`):

| Conjunto de prueba | Qwen3-ASR-1.7B original | v1 | v2 | v2.1 (esta versión) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 4,20 % | 4,00 % | 3,95 % | **3,89 %** | 20,97 % |
| Common Voice `yue` | 5,46 % | **3,80 %** | 3,86 % | 3,94 % | 36,44 % |
| Common Voice 23 `zh-HK` | 7,65 % | 5,18 % | 5,09 % | **5,02 %** | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | **2,47 %** | 34,52 % |
| LegCo (Consejo Legislativo de HK) | 7,22 % | 7,17 % | **7,16 %** | **7,16 %** | 32,15 % |
| MCE (code-switching cantonés-inglés) | 11,74 % | 5,61 % | 5,62 % | **5,52 %** | 24,00 % |

Comparativa de cuantizaciones GGUF sobre habla real (T1, 1.292 utterances, `llama-server` con Vulkan):

| Modelo / cuantización | T1 pooled (CER) | Δ vs Q6_K v2.1 | Δ vs BF16 v2.1 | gold_core_400 | T3 (200) | t3_real (118) |
|---|---:|---:|---:|---:|---:|---:|
| v2.1 PyTorch BF16 (referencia) | 12,33 % | -0,65 pt | ref | 11,64 % | 1,00 % | 5,08 % |
| v2.1 GGUF `Q6_K` (legado) | 12,98 % | ref | +0,65 pt | 12,69 % | **0,00 %** | 4,24 % |
| v2.1 GGUF `Q6_K_H` (recomendada) | **12,52 %** | **-0,46 pt** | +0,19 pt | **11,64 %** | 0,50 % | 4,24 % |

Sesgo de entidades con hotwords (`entity_probe_v1`, 220 utterances, 271 menciones, 20 distractores por utterance): tasa de corrección del 50,00 % (recall 89,67 % → 94,83 %), 0,00 % de break-rate y 0,00 % (0/4.400) de copia falsa de distractores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para Q4_K_M, 1,5 GB para Q6_K_H, 1,8 GB para Q8_0, más el encoder de audio mmproj-Q8_0 (unos 356 MB).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; el ejemplo de la model card usa `llama-server` con backend Vulkan, lo que permite ejecución en GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPUs con Vulkan, dado el reducido tamaño del modelo.
- Opciones de despliegue: `llama.cpp` (`llama-server`), OraType, y los pesos BF16 originales con `transformers`. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER FLEURS yue | CER Common Voice yue | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK v2.1 | 1,7 B | yue, zh, en | 3,89 % | 3,94 % | Apache 2.0 | GGUF, safetensors |
| Qwen3-ASR-1.7B (original) | 1,7 B | multilingüe | 4,20 % | 5,46 % | no disponible en la información | safetensors |
| whisper-large-v3 | no disponible en la información | multilingüe | 20,97 % | 36,44 % | no disponible en la información | no disponible |

La ventaja del modelo frente a whisper-large-v3 en cantonés es de más de 15 puntos de CER en FLEURS y de más de 30 puntos en Common Voice, según los datos de la model card. Frente al Qwen3-ASR-1.7B original, la mejora se concentra en la salida en chino tradicional de Hong Kong y en el code-switching (11,74 % → 5,52 % en MCE).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un ajuste sobre datos de Hong Kong, puede tener un rendimiento inferior en otras variantes de cantonés (por ejemplo, cantonés continental) o en chino mandarín.
- Riesgo de alucinación: las cuantizaciones agresivas como `Q6_K` estándar pueden inducir bucles de repetición en habla real; se recomienda usar `Q6_K_H` o `Q8_0` para producción.
- Limitaciones de contexto e idioma: el contexto de ejemplo es de 4096 tokens; el modelo está orientado a yue-HK, zh y en, y no se garantiza su comportamiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B, cuya licencia no se detalla en la información disponible.
- Caveats para producción: el sesgo de hotwords debe configurarse con cuidado para evitar falsos positivos; la evaluación reportada se hizo con decodificación greedy y en conjuntos específicos, por lo que el rendimiento en dominios muy distintos puede variar. La información sobre latencia y throughput no está disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Pesos originales BF16: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- Repositorio GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- Revisión v2: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/b1c3dc91
- Revisión v1: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/1afe540def044173f7412dc72584f803b92bfa96
- Perfil del autor: https://huggingface.co/joe2643
