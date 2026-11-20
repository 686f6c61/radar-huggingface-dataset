# joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es la versión cuantizada en formato GGUF de un ajuste fino del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, especializado en cantonés coloquial de Hong Kong (`yue-HK`) con alternancia de código inglés. Lo desarrolla el usuario independiente joe2643, con dirección de estrategia de ajuste fino y recogida de datos de sennett-lau, y se distribuye con licencia Apache 2.0. El modelo base original en BF16 está disponible en el repositorio `joe2643/Qwen3-ASR-1.7B-Cantonese-HK`.

El problema que resuelve es concreto: el modelo original `Qwen/Qwen3-ASR-1.7B` tiende a producir chino simplificado o caracteres de cantonés continental (por ejemplo `噶` o `捻`) en lugar del chino tradicional de Hong Kong con vocabulario coloquial auténtico (`係`, `喺`, `嘅`, `咗`, `㗎`, entre otros), y no mantiene las palabras en inglés como tales en contextos de code-switching. Este ajuste fino corrige ambos comportamientos y añade sesgo por vocabulario contextual (hotwords) mediante prompt de sistema.

La versión actual es la v2.1 (2026-11-14), que incorpora alineación para el sesgo de vocabulario de dominio y mejora cinco de los seis conjuntos de prueba estándar de cantonés respecto a versiones anteriores. El modelo tiene 1.720.574.976 parámetros y se ofrece en cuantizaciones Q4_K_M, Q6_K y Q8_0, más un codificador multimodal `mmproj` en Q8_0, lo que permite ejecución local con `llama.cpp` (`llama-server`) y su integración en la aplicación OraType.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de voz basado en Qwen3-ASR; incluye codificador multimodal `mmproj`) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de `llama-server` con `-c 4096`; no se especifica el máximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (más `mmproj` en Q8_0) |
| Idiomas soportados | yue (cantonés, `yue-HK`), zh (chino), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (pesos originales BF16 en Transformers en el repo base) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna exacta del modelo (tipo de transformer, número de capas, dimensiones ocultas ni composición del dataset de entrenamiento). Se sabe que parte de Qwen3-ASR-1.7B y que se ha ajustado fino para cantonés de Hong Kong coloquial con code-switching inglés, y que el resultado se exporta a GGUF para `llama.cpp` y OraType. El repositorio incluye un codificador multimodal separado (`mmproj`) en Q8_0, necesario para procesar audio en `llama-server`.

La innovación técnica destacable es el sesgo por contexto y vocabulario de dominio (hotwords) mediante prompt de sistema: el usuario puede pasar una lista de términos (por ejemplo `閂燈, 開燈, 閂冷氣, OraType, GitHub`) y el modelo los alinea en la transcripción. Según la model card, la v2.1 reduce el CER en comandos cortos con glosarios largos del 21,88 % al 7,19 %, con un 0,0 % de "parroting" (repetición indebida de los términos del glosario). No se especifica en la información proporcionada si hubo RLHF, DPO ni el volumen de tokens de entrenamiento.

## Capacidades

- Reconocimiento automático de voz (ASR) en cantonés de Hong Kong coloquial (`yue-HK`) con salida nativa en chino tradicional y vocabulario auténtico (`係`, `喺`, `嘅`, `咗`, `㗎`, `閂`, `撚`, `屌`).
- Alternancia de código cantonés-inglés: mantiene las palabras en inglés en inglés en lugar de transliterarlas.
- Sesgo por contexto y vocabulario de dominio (hotwords) a través del prompt de sistema, con alineación de términos específicos.
- Procesamiento de audio mediante el codificador multimodal `mmproj` y la API compatible con OpenAI de `llama-server` (entrada `input_audio`).
- Soporte de idiomas: yue, zh, en.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio generativo más allá del ASR.

## Casos de uso

- Dictado por voz en escritorio: OraType, la aplicación de dictado por voz para macOS, ya incluye el GGUF Q6_K con el `mmproj-Q8_0` como modelo de voz integrado para cantonés, por lo que el modelo cubre dictado local sin conexión.
- Transcripción de reuniones y actas en Hong Kong: el modelo mantiene el chino tradicional y el vocabulario coloquial, adecuado para reuniones con mezcla de cantonés e inglés técnico.
- Subtitulado de contenido audiovisual: con un CER del 3,89 % en FLEURS `yue_hant_hk` y del 5,52 % en code-switching (MCE), es apto para generar subtítulos en cantonés de vídeos con términos en inglés.
- Comandos de voz para domótica: el sesgo por hotwords permite pasar glosarios como `閂燈, 開燈, 閂冷氣` y reducir el CER en comandos cortos al 7,19 %, útil en asistentes de voz domésticos.
- Transcripción de reuniones del Consejo Legislativo (LegCo): el modelo se ha evaluado en este conjunto (CER 7,16 %), por lo que puede emplearse en transcripción de sesiones formales en cantonés.
- Evaluación y anotación de corpus de habla cantonesa: sirve como herramienta de preanotación en proyectos de investigación lingüística, con cuantizaciones ligeras (Q4_K_M, 1,1 GB) que caben en equipos modestos.
- Integración en pipelines de ASR en producción: el endpoint compatible con OpenAI de `llama-server` facilita su despliegue tras una API HTTP estándar.

## Benchmarks y rendimiento

Resultados publicados en la model card (Character Error Rate, greedy, BF16 `transformers`):

| Test Set | Stock `Qwen3-ASR-1.7B` | v1 | v2 | v2.1 (este) | `whisper-large-v3` |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 4,20 % | 4,00 % | 3,95 % | 3,89 % | 20,97 % |
| Common Voice `yue` | 5,46 % | 3,80 % | 3,86 % | 3,94 % | 36,44 % |
| Common Voice 23 `zh-HK` | 7,65 % | 5,18 % | 5,09 % | 5,02 % | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | 2,47 % | 34,52 % |
| LegCo (HK Legislative Council) | 7,22 % | 7,17 % | 7,16 % | 7,16 % | 32,15 % |
| MCE (Cantonese-English Code-Switching) | 11,74 % | 5,61 % | 5,62 % | 5,52 % | 24,00 % |

Verificación de los ficheros GGUF v2.1 con `llama-server` sobre 60 clips de prueba (CER sin normalización de números): Q4_K_M 2,59 %, Q6_K 2,89 %, Q8_0 2,89 %.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos van de 1,1 GB (Q4_K_M) a 1,8 GB (Q8_0), más 356 MB del `mmproj-Q8_0`; el total ronda los 1,5 GB (Q4_K_M) a 2,2 GB (Q8_0) en pesos, a lo que hay que sumar la caché KV para el contexto configurado.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería bastar para las cuantizaciones ofrecidas.
- Cabe en GPU consumer: sí, con las cuantizaciones Q4_K_M, Q6_K y Q8_0; no se detallan modelos concretos de tarjeta.
- Opciones de despliegue: `llama.cpp` mediante `llama-server` (ejemplo con `-c 4096 -np 1` y endpoint compatible con OpenAI), y la aplicación OraType que integra el Q6_K con `mmproj-Q8_0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (FLEURS `yue_hant_hk`) | Licencia | Formato |
|---|---|---:|---:|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK v2.1 (este) | 1.720.574.976 | 4096 (usado en ejemplo) | 3,89 % | apache-2.0 | GGUF, BF16 |
| Stock `Qwen3-ASR-1.7B` | no disponible | no disponible | 4,20 % | no disponible | no disponible |
| `whisper-large-v3` | no disponible | no disponible | 20,97 % | no disponible | no disponible |

La comparativa se limita a los datos de la model card; no se dispone de parámetros, contexto ni licencia de los modelos de referencia en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en cantonés de Hong Kong (`yue-HK`) con code-switching inglés; su rendimiento en otros dialectos del chino o en cantonés continental no está documentado y podría degradarse.
- Riesgo de alucinación y de "parroting": la model card reporta 0,0 % de parroting en la v2.1 con glosarios, pero versiones anteriores mostraban este comportamiento; conviene validar con glosarios largos en producción.
- El CER en LegCo (7,16 %) es el más alto de los conjuntos evaluados, lo que sugiere mayor dificultad en habla formal o ruidosa.
- Los benchmarks se han medido en BF16 con `transformers`; los GGUF se verificaron solo sobre 60 clips, por lo que el rendimiento en cuantizaciones puede diferir del reportado en la tabla principal.
- No se documentan sesgos específicos ni restricciones adicionales de licencia más allá de Apache 2.0; aun así, debe verificarse el cumplimiento de la licencia del modelo base Qwen3-ASR.
- La longitud máxima de contexto no está especificada; el valor de 4096 corresponde únicamente al ejemplo de despliegue.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Pesos originales BF16: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK
- Repositorio GitHub: https://github.com/joe2643/qwen3-asr-cantonese-hk
- Revisión v2: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/b1c3dc91
- Revisión v1: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/1afe540def044173f7412dc72584f803b92bfa96
- OraType: https://github.com/sennett-lau/oratype
- Apoyo al autor: https://buymeacoffee.com/joe2643
