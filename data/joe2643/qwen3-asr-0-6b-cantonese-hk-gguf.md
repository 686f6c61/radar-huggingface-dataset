# joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK-GGUF es una cuantización en formato GGUF del modelo de reconocimiento automático del habla (ASR) koelony/Qwen3-ASR-0.6B-Cantonese-HK, un ajuste fino del Qwen3-ASR-0.6B orientado específicamente al cantonés coloquial de Hong Kong (yue-HK) con conmutación de código hacia inglés. Lo publica el desarrollador joe2643 bajo el paraguas del proyecto Koelony, y su propósito es ofrecer transcripción de voz precisa y ligera en entornos locales, sin dependencia de servicios en la nube. El modelo resuelve un problema concreto: los sistemas ASR genéricos rinden mal en cantonés hablado informal y en la mezcla cantonés-inglés típica de Hong Kong, mientras que este ajuste nativo produce caracteres tradicionales de Hong Kong (係, 喺, 嘅, 咗, 㗎, 閂) y mantiene las palabras inglesas en inglés.

La relevancia actual radica en su tamaño reducido (596.049.920 parámetros, unos 584 MB en Q4_K_M más el proyector multimodal) y en que está empaquetado para `llama.cpp` (`llama-server`) y para la aplicación OraType, lo que permite ejecutarlo en hardware de consumo. Incluye soporte explícito para comandos de voz cortos (por ejemplo, 閂燈, 開燈, 閂冷氣) y sesgo de vocabulario mediante hotwords en el mensaje de sistema, con protección anti-parroting del contexto.

La arquitectura subyacente es la de Qwen3-ASR, un modelo multimodal de audio y texto que recibe audio y emite la transcripción tras un prefijo de idioma y la etiqueta `<asr_text>`. Esta ficha describe la versión GGUF, que conserva la licencia Apache 2.0 del modelo base y está pensada para despliegue local en macOS, Linux y Windows mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo multimodal audio-texto basado en transformer, arquitectura GGUF `qwen3_asr`) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de `llama-server` con `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0; proyector multimodal mmproj en Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (inglés); conmutación de código cantonés-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: LM GGUF + `.mmproj-Q8_0.gguf`); variante single-file en subcarpeta `transcribe-cpp/` |
| Tamano en disco | 396.700.672 B (Q4_K_M), 495.102.976 B (Q6_K), 639.442.944 B (Q8_0), 214.392.416 B (mmproj Q8_0) |
| Modelo base | koelony/Qwen3-ASR-0.6B-Cantonese-HK (BF16, Transformers) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-ASR-0.6B, un modelo multimodal que procesa audio mediante un proyector (mmproj) y genera texto con un decoder tipo transformer. La versión publicada aquí es una conversión a GGUF del checkpoint BF16 original, manteniendo el proyector multimodal en un fichero separado (`mmproj-Q8_0.gguf`) para su uso con `llama.cpp`. El modelo base Qwen3-ASR está diseñado para tareas de reconocimiento de voz multilingüe y esta variante se especializa en cantonés de Hong Kong con mezcla de inglés.

El ajuste fino se ha realizado con soporte dedicado para comandos de voz cortos y con una técnica de sesgo de vocabulario mediante hotwords que se pasan en el mensaje de sistema; según la model card, se ha verificado un 0,0 % de parroting del prompt en una suite de estrés de 210 clips con contexto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; estos datos figuran como no disponibles. La model card menciona que el modelo conserva el comportamiento del Qwen3-ASR original y añade la capacidad de emitir caracteres tradicionales de Hong Kong de forma nativa.

## Capacidades

- Reconocimiento automático del habla en cantonés de Hong Kong (yue-HK) con salida en caracteres tradicionales (係, 喺, 嘅, 咗, 㗎, 閂).
- Conmutación de código cantonés-inglés: mantiene las palabras inglesas en inglés dentro de la transcripción.
- Soporte de comandos de voz cortos (por ejemplo, 閂燈, 開燈, 閂冷氣, 較細聲啲) entrenados explícitamente.
- Sesgo de vocabulario mediante hotwords pasados en el mensaje de sistema, con protección anti-parroting del contexto.
- Procesamiento de audio de entrada en formato WAV mediante la API compatible con OpenAI (`/v1/chat/completions`) de `llama-server`.
- Salida estructurada con prefijo de idioma y etiqueta `<asr_text>` que separa el idioma detectado de la transcripción.
- Soporte multilingüe limitado a yue, zh y en según los metadatos del modelo.
- Compatibilidad con OraType y con las aplicaciones de dictado offline Hex y transcribe.cpp mediante los GGUF single-file de la subcarpeta `transcribe-cpp/`.

## Casos de uso

- Dictado por voz en cantonés para aplicaciones de escritorio: el modelo se integra en OraType y en Hex como motor STT local, permitiendo transcribir dictado sin conexión con una latencia baja gracias a su tamaño de 0,6B y a la cuantización Q4_K_M.
- Asistentes de voz para el hogar en Hong Kong: los comandos cortos como 閂燈 o 閂冷氣 están entrenados específicamente, por lo que el modelo puede alimentar un pipeline de domótica que reconozca órdenes breves en cantonés coloquial.
- Transcripción de reuniones y actas: con una ventana de contexto de 4096 tokens y buen rendimiento en el conjunto LegCo (CER 7,62 %), es adecuado para transcribir sesiones legislativas o reuniones formales en cantonés.
- Subtitulado de contenido audiovisual: la capacidad de manejar conmutación de código cantonés-inglés (CER 6,98 % en MCE) lo hace útil para subtitular vídeos de YouTube o podcasts de Hong Kong donde se mezclan ambos idiomas.
- Atención al cliente en centros de llamadas: al ser un modelo local y ligero, puede desplegarse en servidores modestos para transcribir llamadas en cantonés y alimentar sistemas de análisis de calidad o búsqueda de texto completo.
- Investigación lingüística y corpus: la salida nativa en caracteres tradicionales de Hong Kong y la preservación de términos ingleses facilitan la creación de corpus anotados de habla cantonesa para estudios sociolingüísticos.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva en entornos de habla cantonesa, ejecutándose en hardware de consumo.

## Benchmarks y rendimiento

Los datos de la model card reportan Character Error Rate (CER) en modo greedy con pesos BF16 en `transformers`:

| Test set | Qwen3-ASR-0.6B stock | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B stock | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 6,10 % | 5,70 % | 4,20 % | 3,95 % | 20,97 % |
| Common Voice yue | 6,84 % | 5,12 % | 5,46 % | 3,86 % | 36,44 % |
| Common Voice 23 zh-HK | 9,55 % | 6,44 % | 7,65 % | 5,09 % | 41,76 % |
| MDCC | 5,45 % | 3,29 % | 4,25 % | 2,49 % | 34,52 % |
| LegCo (Hong Kong Legislative Council) | 8,81 % | 7,62 % | 7,22 % | 7,16 % | 32,15 % |
| MCE (cantonés-inglés code-switching) | 15,52 % | 6,98 % | 11,74 % | 5,62 % | 24,00 % |

Verificación adicional con `llama-server` (llama.cpp `78ffbaa`) sobre 60 clips de prueba en `mce`, `cvhk`, `fleurs` y `mdcc` (CER sin normalización de números): Q4_K_M 4,76 %, Q6_K 4,52 %, Q8_0 4,76 %. El comando corto 閂燈 pasa tanto con como sin contexto de hotwords (0,0 % de parroting en la suite de estrés de 210 clips). En Apple M4 Max con Metal y Q8_0 se midió un throughput de 49,8–51,7x tiempo real (dato truncado en la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para Q4_K_M (396 MB de pesos + 214 MB del proyector mmproj), alrededor de 0,7 GB para Q6_K y unos 0,85 GB para Q8_0, más el overhead del contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y en Apple Silicon (M1 en adelante) mediante Metal.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `llama.cpp` (`llama-server`), OraType, transcribe.cpp y Hex (estos dos últimos mediante los GGUF single-file de la subcarpeta `transcribe-cpp/`). No se menciona soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: en Apple M4 Max con Metal y Q8_0 se reporta 49,8–51,7x tiempo real; en el resto de plataformas no se dispone de cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER medio en yue (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Cantonese-HK-GGUF (este) | 596 M | 4096 | 5,70 % FLEURS / 5,12 % CV yue / 6,98 % MCE | Apache 2.0 | GGUF en HF, OraType, Hex |
| Qwen3-ASR-0.6B stock | 596 M (aprox.) | no disponible | 6,10 % FLEURS / 6,84 % CV yue / 15,52 % MCE | no disponible | Transformers |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | 1,7 B (aprox.) | no disponible | 3,95 % FLEURS / 3,86 % CV yue / 5,62 % MCE | no disponible | GGUF en HF |
| whisper-large-v3 | 1,55 B (aprox.) | no disponible | 20,97 % FLEURS / 36,44 % CV yue / 24,00 % MCE | MIT (según el proyecto original) | Amplia disponibilidad |

## Limitaciones y advertencias

- El modelo está especializado en cantonés de Hong Kong y conmutación de código con inglés; su rendimiento en mandarín estándar u otros dialectos chinos no está documentado y probablemente sea inferior.
- Riesgo de alucinación y de parroting del contexto de hotwords: aunque la model card reporta 0,0 % en la suite de estrés, conviene validar en producción con vocabularios personalizados.
- El CER en el conjunto LegCo (7,62 %) es el más alto de los evaluados, lo que sugiere menor robustez en habla formal o con ruido de sala.
- Los benchmarks se han medido en BF16 con `transformers`; las cifras en GGUF cuantizado pueden diferir (la verificación con `llama-server` reporta 4,52–4,76 % en un subconjunto de 60 clips, no directamente comparable).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los componentes de terceros (transcribe.cpp, Hex) que no están afiliados a Koelony.
- El contexto de 4096 tokens limita la duración de audio procesable por petición; para clips largos será necesario segmentar.
- No se dispone de información sobre sesgos demográficos o acústicos específicos del ajuste fino.
- El proyecto tiene un único mantenedor (joe2643) y un volumen de descargas moderado (583), por lo que el soporte a largo plazo no está garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo base BF16: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- GGUF tier 1.7B: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- Repositorio GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- Subcarpeta transcribe-cpp: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK-GGUF/tree/main/transcribe-cpp
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Hex: https://github.com/anomalyco/hex
- Apoyo al autor: https://buymeacoffee.com/joe2643
