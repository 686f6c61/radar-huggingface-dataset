# joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF

## Resumen
Qwen3-ASR-0.6B-Cantonese-HK-GGUF es una cuantización en formato GGUF de un ajuste fino del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B, especializado en cantonés coloquial de Hong Kong (`yue-HK`) con alternancia de código inglés (code-switching). Lo publica el desarrollador independiente joe2643 bajo el paraguas del proyecto Koelony, y deriva del modelo base en BF16 `koelony/Qwen3-ASR-0.6B-Cantonese-HK`, a su vez un fine-tune del Qwen3-ASR-0.6B original de Alibaba. El modelo resuelve el problema de la transcripción precisa de cantonés hablado con vocabulario local, caracteres tradicionales de Hong Kong y mezcla de términos en inglés, un escenario mal cubierto por los sistemas ASR genéricos.

La relevancia práctica del modelo está en su tamaño reducido (596 millones de parámetros, unos 584 MB en `Q4_K_M` más el proyector multimodal) y en su empaquetado para `llama.cpp` (`llama-server`) y para la aplicación de dictado OraType. Incorpora soporte específico para comandos de voz cortos (por ejemplo `閂燈`, `閂冷氣`, `開燈`) y una técnica de sesgo por hotwords en el contexto del sistema que evita el "loro" o parroting del prompt. Emite de forma nativa caracteres tradicionales de Hong Kong (`係`, `喺`, `嘅`, `咗`, `㗎`, `閂`) y conserva las palabras inglesas en inglés.

El modelo se distribuye con licencia Apache 2.0, admite los idiomas cantonés (`yue`), chino (`zh`) e inglés (`en`), y está pensado para despliegue local en CPU o GPU de gama consumer, incluyendo Macs con Metal. En el momento de redactar esta ficha acumula 491 descargas y no tiene likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para ASR (Qwen3-ASR), con proyector multimodal separado (`mmproj`) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de ejemplo en `llama-server` con `-c 4096`) |
| Tipos de cuantización | `Q4_K_M`, `Q6_K`, `Q8_0`; proyector `mmproj-Q8_0`; variante single-file en `transcribe-cpp/` |
| Idiomas soportados | `yue` (cantonés), `zh` (chino), `en` (inglés); metadatos indican 30 idiomas en la variante single-file |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: LM + `mmproj`); GGUF single-file en subcarpeta `transcribe-cpp/`; pesos originales BF16 en safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del Qwen3-ASR-0.6B, un sistema ASR basado en un transformer que procesa audio mediante un proyector multimodal y genera la transcripción como texto. La cuantización GGUF conserva esa arquitectura y separa el codificador/proyector (`mmproj`) del modelo de lenguaje, de modo que `llama.cpp` puede cargar ambos ficheros. El fine-tune se ha orientado específicamente al cantonés de Hong Kong coloquial, con soporte para alternancia de código inglés y para comandos de voz cortos.

La model card no detalla el volumen de datos de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí documenta una innovación destacable: el sesgo por hotwords mediante el mensaje de sistema, entrenado con una técnica "anti-parroting" que evita que el modelo repita el vocabulario del contexto. Según el autor, esta técnica se validó con una suite de estrés de 210 clips con contexto, obteniendo un 0,0 % de parroting del prompt. El modelo base en BF16 está disponible en `koelony/Qwen3-ASR-0.6B-Cantonese-HK`, y existe una variante de mayor tamaño (1.7B) en `koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF`.

## Capacidades
- Reconocimiento automático de voz en cantonés de Hong Kong (`yue-HK`), con salida nativa en caracteres tradicionales de Hong Kong.
- Alternancia de código cantonés-inglés: mantiene las palabras inglesas en inglés dentro de la transcripción.
- Soporte de comandos de voz cortos y frases de control doméstico (`閂燈`, `開燈`, `閂冷氣`, `較細聲啲`).
- Sesgo por hotwords o vocabulario personalizado a través del mensaje de sistema, con resistencia al parroting del prompt.
- Salida estructurada con etiqueta de idioma y texto: la respuesta sigue el patrón `language Cantonese<asr_text>…`, donde la transcripción es la parte posterior a `<asr_text>`.
- Compatibilidad con la API de chat completions de `llama-server` mediante entradas `input_audio` en base64 (WAV).
- Exportación single-file para `transcribe.cpp` y para la aplicación de dictado offline Hex en macOS, sin necesidad de `mmproj` separado.
- Capacidad multilingüe limitada a `yue`, `zh` y `en` según los metadatos del modelo; la variante single-file declara 30 idiomas en sus metadatos.

## Casos de uso
- Dictado por voz offline en macOS: el modelo se integra en la aplicación Hex mediante los GGUF single-file de `transcribe-cpp/`, permitiendo transcripción local sin conexión con un rendimiento medido de 49,8–51,7x tiempo real en cómputo (36,5–37,0x en tiempo de pared) sobre un Apple M4 Max con Metal.
- Control doméstico por voz: los comandos cortos como `閂燈` o `閂冷氣` se transcriben de forma fiable incluso con contexto de hotwords, lo que permite construir asistentes de voz para el hogar en cantonés.
- Subtitulado y transcripción de reuniones en Hong Kong: el modelo maneja la alternancia cantonés-inglés típica del entorno profesional de Hong Kong, con un CER del 6,98 % en el conjunto MCE de code-switching.
- Transcripción de actas legislativas: el conjunto LegCo (Consejo Legislativo de Hong Kong) se transcribe con un CER del 7,62 %, adecuado para generar borradores de actas que luego se revisan manualmente.
- Atención al cliente en cantonés: al ser un modelo de 0,6B desplegable en local con `llama-server`, permite montar un pipeline de transcripción de llamadas con baja latencia y sin enviar audio a servicios externos.
- Investigación lingüística y corpus de habla: la disponibilidad de cuantizaciones `Q4_K_M`, `Q6_K` y `Q8_0` permite ejecutar barridos masivos de transcripción en CPU o GPU consumer con un coste de almacenamiento reducido (396 MB en `Q4_K_M`).
- Aplicaciones de accesibilidad: dictado en cantonés para usuarios con movilidad reducida, ejecutándose en hardware modesto gracias al tamaño del modelo.

## Benchmarks y rendimiento
Resultados de Character Error Rate (CER, greedy, BF16 con `transformers`) publicados en la model card:

| Conjunto de test | Qwen3-ASR-0.6B stock | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B stock | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 6,10 % | **5,70 %** | 4,20 % | 3,95 % | 20,97 % |
| Common Voice `yue` | 6,84 % | **5,12 %** | 5,46 % | 3,86 % | 36,44 % |
| Common Voice 23 `zh-HK` | 9,55 % | **6,44 %** | 7,65 % | 5,09 % | 41,76 % |
| MDCC | 5,45 % | **3,29 %** | 4,25 % | 2,49 % | 34,52 % |
| LegCo | 8,81 % | **7,62 %** | 7,22 % | 7,16 % | 32,15 % |
| MCE (code-switching) | 15,52 % | **6,98 %** | 11,74 % | 5,62 % | 24,00 % |

Verificación con `llama-server` (llama.cpp `78ffbaa`) sobre 60 clips de test de los conjuntos `mce`, `cvhk`, `fleurs` y `mdcc`, sin normalización de números: `Q4_K_M` 4,76 %, `Q6_K` 4,52 %, `Q8_0` 4,76 %. El comando corto `閂燈` supera la prueba con y sin contexto de hotwords, con un 0,0 % de parroting en la suite de estrés de 210 clips con contexto.

## Requisitos de hardware
- VRAM estimada: el fichero `Q4_K_M` ocupa 396.700.672 bytes (~378 MiB) y el `mmproj-Q8_0` 214.392.416 bytes (~204 MiB), lo que suma unos 584 MB en disco; la VRAM necesaria es del orden de 1 GB o menos para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas, e incluso en CPU. La variante single-file se ha validado en Apple M4 Max con Metal.
- Opciones de despliegue: `llama.cpp` (`llama-server`), OraType, `transcribe.cpp` (`transcribe-cli`), Hex en macOS. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: en Apple M4 Max con Metal y `0.6B Q8_0` se midieron 49,8–51,7x tiempo real en cómputo y 36,5–37,0x en tiempo de pared mediante `transcribe-cli`. No se publican cifras de latencia para GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER medio en cantonés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0.6B-Cantonese-HK GGUF) | 596 M | 4096 | 3,29–7,62 % según conjunto | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-ASR-0.6B stock | 0,6B | no disponible | 5,45–9,55 % | no disponible | modelo original de Qwen |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | 1,7B | no disponible | 2,49–7,16 % | no disponible | GGUF en `koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF` |
| whisper-large-v3 | ~1,55B | 30 s de audio | 20,97–41,76 % | MIT (según OpenAI) | pesos abiertos en múltiples repositorios |

El modelo de 0,6B ajustado supera al Qwen3-ASR-0.6B stock en todos los conjuntos evaluados y reduce drásticamente el error frente a whisper-large-v3 en cantonés, con un tamaño mucho menor. La variante de 1,7B del mismo proyecto obtiene mejores CER a cambio de mayor coste de cómputo y almacenamiento.

## Limitaciones y advertencias
- El modelo está especializado en cantonés de Hong Kong; su rendimiento en otras variantes de chino o en otros idiomas distintos de `yue`, `zh` y `en` no está documentado.
- La model card no detalla la composición del dataset de entrenamiento ni posibles sesgos demográficos o dialectales; existe riesgo de sesgo hacia el habla de Hong Kong y hacia los dominios cubiertos por los conjuntos de evaluación (FLEURS, Common Voice, MDCC, LegCo, MCE).
- Riesgo de alucinación y de parroting del prompt: aunque el autor reporta un 0,0 % de parroting en su suite de estrés de 210 clips, el comportamiento con vocabularios de hotwords muy largos o inusuales no está garantizado.
- El CER en LegCo (7,62 %) es el más alto de los conjuntos evaluados, lo que sugiere un rendimiento inferior en habla formal o con vocabulario especializado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas en la model card; conviene revisar la licencia del Qwen3-ASR original antes de un despliegue comercial.
- El contexto de ejemplo es de 4096 tokens; no se documenta el máximo real soportado ni el comportamiento con audios muy largos.
- Las cifras de throughput solo se han medido en Apple M4 Max con Metal; no hay datos publicados para GPU NVIDIA ni para CPU.
- La información de la model card está truncada en el apartado de ficheros single-file, por lo que no se dispone de la tabla completa de cuantizaciones de `transcribe-cpp/`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo base en BF16: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- Variante 1.7B GGUF: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- Repositorio GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- Repositorio `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Aplicación Hex: https://github.com/anomalyco/hex
- Apoyo al autor: https://buymeacoffee.com/joe2643
