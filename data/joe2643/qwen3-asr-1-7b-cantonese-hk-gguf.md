# joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla koelony/Qwen3-ASR-1.7B-Cantonese-HK, un ajuste fino de Qwen3-ASR-1.7B orientado específicamente al cantonés coloquial de Hong Kong (yue-HK) con alternancia de código inglés. Lo publica el desarrollador independiente joe2643 bajo el paraguas del proyecto Koelony, y está pensado para su uso con llama.cpp (llama-server) y con la aplicación de escritorio OraType.

El modelo resuelve un problema concreto: el Qwen3-ASR original tiende a producir caracteres en chino simplificado o variantes del cantonés continental, mientras que este ajuste emite de forma nativa chino tradicional de Hong Kong con vocabulario coloquial auténtico y mantiene las palabras inglesas en inglés. Incorpora además sesgo por contexto y vocabulario de palabras clave (hotword biasing), lo que permite mejorar el reconocimiento de entidades y términos de dominio sin reentrenar.

Con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), licencia Apache 2.0 y pesos disponibles en varias cuantizaciones, es una opción práctica para desplegar ASR especializado en cantonés sobre hardware modesto, incluyendo GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; encoder de audio + decoder tipo transformer, segun el pipeline automatic-speech-recognition) |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el modelo; la invocacion de ejemplo con llama-server usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q6_K_H (protegida), Q8_0; mmproj en Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para el encoder de audio); pesos originales BF16 en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-ASR-1.7B, un sistema de reconocimiento del habla que combina un encoder de audio con un decoder de lenguaje; en el repositorio GGUF el encoder se distribuye como fichero mmproj independiente (`Qwen3-ASR-1.7B-Cantonese-HK.mmproj-Q8_0.gguf`), que es obligatorio para la inferencia. El ajuste se ha realizado sobre el modelo base koelony/Qwen3-ASR-1.7B-Cantonese-HK, del que no se detallan en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

La innovación destacable es el alineamiento para sesgo por contexto y vocabulario de dominio (hotword biasing) introducido en la versión v2.1, que permite pasar glosarios mediante el campo `prompt` del endpoint `/v1/audio/transcriptions`. Según la model card, esto reduce el CER en comandos cortos con glosarios largos del 21,88 % al 7,19 %, con un 0,0 % de "parroting" (repetición espuria del prompt). Además, la cuantización Q6_K_H protege los tensores `token_embd` (Q8_0), `attn_v` (Q8_0) y la salida (F16) para eliminar bucles de repetición inducidos por la cuantización agresiva de Q6_K estándar, con un coste de unos 90 MiB adicionales.

## Capacidades

- Reconocimiento automático del habla en cantonés de Hong Kong (yue-HK) con salida nativa en chino tradicional y vocabulario coloquial auténtico (係, 喺, 嘅, 咗, 㗎, entre otros).
- Alternancia de código cantonés-inglés: mantiene las palabras inglesas en inglés en lugar de transliterarlas.
- Sesgo por contexto y vocabulario de palabras clave (hotword/domain-vocabulary biasing) mediante prompt, con métricas declaradas de 50,00 % de tasa de corrección y 0,00 % de falsos copiados de distractores en la prueba entity_probe_v1.
- Soporte de conversación multi-turno a nivel de API (tag `conversational`), orientado a interfaces de transcripción.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el servidor HTTP de llama.cpp.
- Idiomas: cantonés (yue), chino (zh) e inglés (en).
- No se documentan en la información disponible capacidades de visión, audio generation, tool calling ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y actas del Consejo Legislativo de Hong Kong: el modelo alcanza un CER del 7,16 % en el conjunto LegCo, adecuado para generar borradores de actas que luego revisa un humano.
- Subtitulado de contenido audiovisual en cantonés coloquial: la salida en chino tradicional de Hong Kong evita la normalización posterior que exigiría un modelo que emitiera simplificado.
- Atención al cliente en centros de contacto de Hong Kong: con alternancia de código inglés-cantonés, transcribe consultas mixtas sin perder términos ingleses como nombres de producto o marcas.
- Dictado y asistencia de escritura en aplicaciones de escritorio: es el caso de uso nativo de OraType, que integra los ficheros GGUF y sus hashes SHA-256 en su registro de modelos.
- Reconocimiento de entidades y jerga de dominio: mediante el sesgo por vocabulario se pueden cargar glosarios de nombres de personas, organizaciones o términos técnicos para reducir errores en dominios especializados (caso validado con entity_probe_v1).
- Despliegue en hardware de consumo para prototipos: las cuantizaciones Q4_K_M (1,1 GB) y Q6_K_H (1,5 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp.
- Investigación en ASR de lenguas de baja densidad de recursos: sirve como línea base reproducible para comparar técnicas de ajuste fino y cuantización en cantonés.

## Benchmarks y rendimiento

Resultados de Character Error Rate (CER), decodificación greedy, en BF16 con transformers, según la model card:

| Conjunto de prueba | Qwen3-ASR-1.7B original | v1 | v2 | v2.1 (este) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 4,20 % | 4,00 % | 3,95 % | 3,89 % | 20,97 % |
| Common Voice yue | 5,46 % | 3,80 % | 3,86 % | 3,94 % | 36,44 % |
| Common Voice 23 zh-HK | 7,65 % | 5,18 % | 5,09 % | 5,02 % | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | 2,47 % | 34,52 % |
| LegCo (Consejo Legislativo de HK) | 7,22 % | 7,17 % | 7,16 % | 7,16 % | 32,15 % |
| MCE (code-switching cantonés-inglés) | 11,74 % | 5,61 % | 5,62 % | 5,52 % | 24,00 % |

Comparativa de cuantizaciones en llama-server con backend Vulkan (v2.1):

| Modelo / cuantización | T1 Pooled (1.292) L1_PURE_NEUTRAL | Delta vs Q6_K | gold_core_400 | T3 (200) oratype_v2 | t3_real (118) oratype_v2 |
|---|---:|---:|---:|---:|---:|
| PyTorch BF16 (referencia) | 12,33 % | -0,65 pt | 11,64 % | 1,00 % | 5,08 % |
| GGUF Q6_K (heredada) | 12,98 % | referencia | 12,69 % | 0,00 % | 4,24 % |
| GGUF Q6_K_H (recomendada) | 12,52 % | -0,46 pt | 11,64 % | 0,50 % | 4,24 % |

Sesgo de entidades con prompt (entity_probe_v1, 220 enunciados, 271 menciones, 20 distractores por enunciado): tasa de corrección del 50,00 % (recall del 89,67 % al 94,83 %), tasa de rotura del 0,00 % y 0,00 % (0/4.400) de falsos copiados de distractores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M, 1,4 GB con Q6_K, 1,5 GB con Q6_K_H y 1,8 GB con Q8_0, más unos 0,36 GB del fichero mmproj Q8_0, además del espacio de trabajo del contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor valida el backend Vulkan de llama-server, por lo que tarjetas de consumo como las de la gama RTX 30/40 son suficientes. Para mayor throughput, GPU de datacenter como A100 o H100 quedan sobredimensionadas para 1,7 B de parámetros.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU compatibles con Vulkan.
- Opciones de despliegue: llama.cpp (`llama-server`) y la aplicación OraType; no se documentan en la información disponible integraciones con vLLM, TGI ni Ollama.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER en cantonés (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK-GGUF (este) | ~1,7 B | yue, zh, en | 3,89 % FLEURS; 5,52 % MCE | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-ASR-1.7B original | ~1,7 B | multilingüe (no detallado) | 4,20 % FLEURS; 11,74 % MCE | no disponible en la información | Hugging Face |
| whisper-large-v3 | no disponible en la información | multilingüe | 20,97 % FLEURS; 24,00 % MCE | no disponible en la información | pesos públicos de OpenAI |

El modelo supera con claridad a whisper-large-v3 en todos los conjuntos de cantonés reportados y mejora al Qwen3-ASR original especialmente en alternancia de código (11,74 % a 5,52 % de CER) y en Common Voice zh-HK (7,65 % a 5,02 %).

## Limitaciones y advertencias

- El ámbito lingüístico está restringido a cantonés de Hong Kong, chino e inglés; no se ha validado su rendimiento en otras variedades de chino ni en otros idiomas.
- Riesgo de bucles de repetición con cuantizaciones agresivas: la Q6_K estándar mostraba un 12,98 % de MER en T1 frente al 12,33 % de BF16; se recomienda usar Q6_K_H o Q8_0 en producción.
- El sesgo por vocabulario puede inducir copia espuria de términos del prompt en algunos casos; la model card reporta 0,00 % en su prueba, pero conviene monitorizarlo con glosarios propios.
- No se detallan sesgos demográficos ni sociolingüísticos específicos en la información disponible; como todo ASR, puede tener peor rendimiento con acentos no nativos, ruido de fondo o solapamiento de hablantes.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets de evaluación utilizados.
- El fichero mmproj es obligatorio; desplegar solo el GGUF principal sin el encoder de audio provoca fallos de inferencia.
- No hay datos publicados de latencia, throughput ni consumo energético, lo que dificulta dimensionar despliegues de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base (BF16): https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Demostración en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- Repositorio GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- Revisión v2: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/b1c3dc91
- Revisión v1: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/1afe540def044173f7412dc72584f803b92bfa96
