# koelony/Qwen3-ASR-0.6B-Cantonese-HK

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK es un ajuste fino de plena parametrización del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, desarrollado por el usuario koelony (Joe, @joe2643) con dirección de estrategia de Sennett Lau. El modelo está especializado en cantonés coloquial de Hong Kong (yue-HK) con alternancia de código inglés (code-switching), y añade un entrenamiento específico para comandos de voz cortos (por ejemplo, 閂燈, 開燈, 閂冷氣) y para el sesgo de vocabulario mediante hotwords de contexto con protección anti-parroting.

El problema que resuelve es doble. Por un lado, mejora la precisión en cantonés hablado frente al modelo base original, especialmente en dominios con jerga local, alternancia de idiomas y audio muy breve. Por otro, introduce un mecanismo de condicionamiento por contexto que permite al usuario pasar una lista de términos esperados (nombres propios, comandos de domótica, vocabulario técnico) sin que el modelo repita esos términos cuando no aparecen en el audio. El modelo nativo emite chino tradicional de Hong Kong con caracteres coloquiales (係, 喺, 嘅, 咗, 㗎, 閂) y conserva las palabras inglesas en inglés.

Con 782.426.112 parámetros reales según los pesos safetensors, se posiciona como una alternativa ligera: aproximadamente un tercio del tamaño del modelo de 1.7B del mismo linaje, lo que lo hace viable en entornos de borde y escritorio. La licencia es Apache 2.0 y el formato principal es BF16 en Transformers, con una variante GGUF publicada en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo de reconocimiento del habla basado en transformers, `qwen3_asr`) |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (repo principal); GGUF Q4_K_M, Q6_K y Q8_0 en el repo `-GGUF` (con `mmproj` y variante single-file para `transcribe.cpp`) |
| Idiomas soportados | yue (cantonés, yue-HK), zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, Transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-ASR del modelo base Qwen/Qwen3-ASR-0.6B y se ha sometido a un ajuste fino de plena parametrización (full-parameter fine-tune), no a un ajuste por adaptadores. El repositorio principal contiene los pesos en BF16 en formato Hugging Face Transformers (`config.json` + `model.safetensors`), lo que permite su uso con `transformers`, la librería `qwen-asr`, vLLM y posteriores ajustes o conversiones.

El entrenamiento se orientó a tres ejes: cantonés coloquial de Hong Kong con salida en chino tradicional y caracteres coloquiales, alternancia de código cantonés-inglés, y comandos de voz cortos. Además, se aplicó un currículo de condicionamiento por contexto con proporciones 75/15/7/3 que incluye trampas de homófonos, distractores puros y enunciados ultracortos de 1 a 4 caracteres. Este currículo entrena al modelo para utilizar hotwords relevantes sin repetir términos del prompt que no aparecen en el audio (anti-parroting). No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en cantonés de Hong Kong (yue-HK) con salida en chino tradicional y caracteres coloquiales.
- Alternancia de código cantonés-inglés: mantiene las palabras inglesas en inglés dentro de la transcripción.
- Transcripción de comandos de voz cortos (por ejemplo, 閂燈, 開燈, 閂冷氣, 較細聲啲) gracias al entrenamiento específico en enunciados breves.
- Sesgo de vocabulario mediante hotwords de contexto pasados en el prompt de sistema, con protección anti-parroting verificada a 0,0 % en las pruebas publicadas.
- Soporte de reconocimiento en chino (zh) e inglés (en), aunque el autor advierte que otros idiomas distintos del cantonés y del cantonés-inglés pueden rendir peor que el modelo base.
- Integración con `transformers`, `qwen-asr`, vLLM y `llama.cpp` (a través de la variante GGUF).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en macOS: la aplicación OraType incorpora el GGUF Q6_K con el encoder `mmproj-Q8_0` como modelo de voz integrado para cantonés, lo que permite dictado local sin conexión en equipos de escritorio.
- Domótica por comandos de voz: el entrenamiento específico en frases cortas como 閂燈 o 開燈 y el sesgo por hotwords permiten construir un asistente de hogar que reconozca un vocabulario cerrado de comandos con baja tasa de error y sin repetir términos no pronunciados.
- Transcripción de reuniones y sesiones legislativas: el modelo mantiene un CER de 7,62 % en el conjunto LegCo (Consejo Legislativo de Hong Kong), lo que lo hace adecuado para actas y subtitulado de sesiones formales en cantonés.
- Subtitulado de contenido audiovisual con alternancia de idiomas: en el conjunto MCE de code-switching cantonés-inglés obtiene un CER de 6,98 % frente al 15,52 % del modelo base, lo que lo hace útil para vídeos, pódcast y streams donde se mezclan ambos idiomas.
- Atención al cliente en cantonés: permite transcribir llamadas o mensajes de voz de usuarios hongkoneses con vocabulario coloquial y términos de producto pasados como hotwords, reduciendo errores en nombres propios y referencias internas.
- Aplicaciones de borde y móviles: con 782 millones de parámetros y cuantizaciones GGUF Q4_K_M, Q6_K y Q8_0, puede desplegarse en dispositivos con recursos limitados mediante `llama.cpp` o `transcribe.cpp`.
- Investigación en ASR de lenguas de baja recursos: sirve como punto de partida para ajustes finos en otras variedades del chino o para estudiar técnicas de sesgo por contexto y anti-parroting.

## Benchmarks y rendimiento

Tasa de error de carácter (CER), decodificación greedy, BF16 con `transformers`. El texto se convierte a simplificado (OpenCC `t2s`), se normalizan números y se eliminan espacios; el idioma se fuerza a cantonés.

| Conjunto de prueba | Qwen3-ASR-0.6B original | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B original | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 6,10 % | 5,70 % | 4,20 % | 3,95 % | 20,97 % |
| Common Voice `yue` | 6,84 % | 5,12 % | 5,46 % | 3,86 % | 36,44 % |
| Common Voice 23 `zh-HK` | 9,55 % | 6,44 % | 7,65 % | 5,09 % | 41,76 % |
| MDCC | 5,45 % | 3,29 % | 4,25 % | 2,49 % | 34,52 % |
| LegCo (Consejo Legislativo de Hong Kong) | 8,81 % | 7,62 % | 7,22 % | 7,16 % | 32,15 % |
| MCE (code-switching cantonés-inglés) | 15,52 % | 6,98 % | 11,74 % | 5,62 % | 24,00 % |

Prueba de estrés de sesgo por hotwords y anti-parroting (210 clips):

| Condición | CER Qwen3-ASR-0.6B original | CER este modelo | Tasa de parroting |
|---|---:|---:|---:|
| Hotwords relevantes + distractores homófonos | 11,23 % | 8,14 % | 0,0 % |
| Lista de distractores 100 % irrelevantes | 15,69 % | 11,92 % | 0,0 % |
| Audio ultracorto + lista larga de hotwords | 14,38 % | 12,50 % | 0,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,6 GB para los pesos, más el overhead del runtime y del encoder de audio; se recomienda al menos 4 GB de VRAM para trabajar con comodidad.
- VRAM estimada en GGUF: aproximadamente 0,5 GB para Q4_K_M, 0,7 GB para Q6_K y 0,9 GB para Q8_0, más el encoder `mmproj`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); para GGUF basta con CPU o GPU integrada en muchos casos.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y en portátiles con GPU dedicada de gama media.
- Opciones de despliegue: `transformers` con `qwen-asr`, vLLM, `llama.cpp` (`llama-server`) con los GGUF, `transcribe.cpp` / Hex en macOS y OraType como aplicación de escritorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER MCE (code-switching) | CER MDCC | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3-ASR-0.6B-Cantonese-HK (este) | 782 M | yue, zh, en | 6,98 % | 3,29 % | Apache 2.0 | BF16 + GGUF |
| Qwen3-ASR-0.6B original | no disponible | multilingüe | 15,52 % | 5,45 % | no disponible | Transformers |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | no disponible (1.7B) | yue, zh, en | 5,62 % | 2,49 % | Apache 2.0 | BF16 + GGUF |
| whisper-large-v3 | no disponible | multilingüe | 24,00 % | 34,52 % | no disponible | Transformers, GGUF |

La comparativa se limita a los modelos incluidos en la benchmark publicada por el autor. No se dispone de datos de otros modelos ASR específicos para cantonés en la información proporcionada.

## Limitaciones y advertencias

- Solo se evaluaron voz en cantonés y cantonés-inglés; el rendimiento en otros idiomas puede ser peor que el del modelo base original.
- El modelo está orientado a cantonés de Hong Kong; otras variedades del cantonés (Guangdong, Macao) pueden presentar un rendimiento inferior.
- Riesgo de alucinación y de repetición de términos del prompt: aunque las pruebas publicadas reportan una tasa de parroting del 0,0 %, se trata de una métrica sobre un conjunto acotado de 210 clips y no garantiza un comportamiento perfecto en producción.
- El sesgo por hotwords depende de que el usuario proporcione listas relevantes; listas muy largas o con distractores degradan el CER (hasta 12,50 % en audio ultracorto con lista larga).
- No se documentan sesgos demográficos, acentos específicos ni comportamiento con ruido de fondo o solapamiento de hablantes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- El repositorio principal contiene únicamente pesos BF16; para despliegue en `llama.cpp` es necesario acudir al repositorio GGUF separado.
- La fecha de creación del repositorio (2026-11-13) y la de actualización (2026-11-24) figuran en los metadatos; verificar la vigencia de los artefactos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio GGUF: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo hermano 1.7B: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Repositorio GGUF del 1.7B: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- GitHub del proyecto: https://github.com/koelony/qwen3-asr-cantonese-hk
- OraType (aplicación que lo integra): https://github.com/sennett-lau/oratype
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Perfil del autor en Hugging Face: https://huggingface.co/joe2643
- Apoyo al autor: https://buymeacoffee.com/joe2643
