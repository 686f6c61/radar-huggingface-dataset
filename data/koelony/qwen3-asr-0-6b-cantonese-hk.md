# koelony/Qwen3-ASR-0.6B-Cantonese-HK

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK es un ajuste fino de parámetros completos del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, desarrollado por el usuario independiente koelony (Joe, @joe2643). El modelo está especializado en cantonés coloquial de Hong Kong (yue-HK) con alternancia de código (code-switching) hacia el inglés, un escenario muy frecuente en conversaciones reales en Hong Kong y que los modelos ASR multilingües genéricos suelen manejar con tasas de error elevadas.

El modelo resuelve dos problemas concretos: la transcripción fiel de caracteres coloquiales del cantonés de Hong Kong (係, 喺, 嘅, 咗, 㗎, 閂) en chino tradicional, y el sesgo por palabras clave (hotword biasing) con entrenamiento específico anti-parroting, es decir, que el modelo no repita términos del prompt de contexto que no aparecen en el audio. Además, incluye entrenamiento dedicado para comandos de voz cortos (por ejemplo, encender o apagar luces y aire acondicionado).

Con 782 millones de parámetros reales (etiquetado comercialmente como 0.6B), el modelo ofrece una alternativa de aproximadamente un tercio del tamaño del Qwen3-ASR-1.7B, lo que lo hace apto para despliegue en dispositivos de borde, escritorio y móvil. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo ASR basado en transformer, encoder de audio + decoder de lenguaje; detalles internos no disponibles) |
| Parámetros totales | 782.426.112 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (repo principal); GGUF Q4_K_M, Q6_K, Q8_0 en repo separado; variantes single-file para transcribe.cpp en Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | Cantonés (yue), chino (zh), inglés (en); evaluación centrada en yue-HK y code-switching cantonés-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, Transformers); GGUF en repo alternativo |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter fine-tune) sobre Qwen/Qwen3-ASR-0.6B, que combina un encoder de audio con un decoder de lenguaje de la familia Qwen3. El ajuste se orientó a cantonés coloquial de Hong Kong y a la alternancia de código cantonés-inglés, manteniendo las palabras en inglés en inglés en la salida. La salida nativa es chino tradicional de Hong Kong con caracteres coloquiales.

Una innovación destacable es el entrenamiento con un currículo de condicionamiento por contexto en proporción 75/15/7/3, que incluye trampas de homófonos, distractores puros y enunciados ultracortos de 1 a 4 caracteres. Este currículo busca que el modelo aproveche las hotwords relevantes sin parrotear (repetir) términos del prompt que no están presentes en el audio. El modelo también recibió entrenamiento específico para comandos de voz cortos.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en cantonés de Hong Kong (yue-HK) con salida en chino tradicional y caracteres coloquiales.
- Manejo nativo de code-switching cantonés-inglés, preservando las palabras en inglés.
- Sesgo por hotwords o vocabulario de dominio mediante un campo de contexto que se inserta en el system prompt.
- Entrenamiento anti-parroting: no repite términos del contexto que no aparecen en el audio (tasa de parroting del 0,0 % en la suite de estrés de 210 clips).
- Reconocimiento de comandos de voz cortos (por ejemplo, 閂燈, 開燈, 閂冷氣, 較細聲啲).
- Soporte multilingüe limitado a yue, zh y en; el rendimiento en otros idiomas puede ser peor que el del modelo base.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en macOS: el modelo se integra en OraType, un tecleado por voz open source que incluye los pesos GGUF Q6_K con el encoder mmproj-Q8_0 como modelo de voz integrado para cantonés.
- Comandos de voz para domótica: gracias al entrenamiento específico en enunciados cortos, puede reconocer órdenes como encender o apagar luces y ajustar el aire acondicionado en asistentes de hogar.
- Transcripción de reuniones y conversaciones informales en Hong Kong: el manejo de code-switching permite transcribir diálogos donde se mezclan cantonés coloquial e inglés sin forzar traducciones.
- Subtitulado de contenido audiovisual local: la salida en chino tradicional con caracteres coloquiales reduce la necesidad de postprocesado para medios de Hong Kong.
- Sesgo de vocabulario específico de dominio: con el campo de contexto se pueden inyectar nombres propios, jerga técnica o términos de producto para mejorar la precisión en dominios concretos.
- Despliegue en dispositivos de borde y móvil: con cuantización GGUF Q4_K_M o Q6_K y el formato single-file para transcribe.cpp, cabe en hardware con recursos limitados para aplicaciones de transcripción offline.
- Transcripción de actas y sesiones legislativas: el modelo fue evaluado en el conjunto LegCo (Consejo Legislativo de Hong Kong), lo que lo hace apto para dominios formales con vocabulario específico.

## Benchmarks y rendimiento

Tasa de error de carácter (CER), decodificación greedy, BF16 con transformers. El texto se convierte a simplificado (OpenCC t2s), se normalizan números y se eliminan espacios; el idioma se fuerza a cantonés.

| Conjunto de prueba | Qwen3-ASR-0.6B original | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B original | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 6,10 % | 5,70 % | 4,20 % | 3,95 % | 20,97 % |
| Common Voice yue | 6,84 % | 5,12 % | 5,46 % | 3,86 % | 36,44 % |
| Common Voice 23 zh-HK | 9,55 % | 6,44 % | 7,65 % | 5,09 % | 41,76 % |
| MDCC | 5,45 % | 3,29 % | 4,25 % | 2,49 % | 34,52 % |
| LegCo (Consejo Legislativo de Hong Kong) | 8,81 % | 7,62 % | 7,22 % | 7,16 % | 32,15 % |
| MCE (code-switching cantonés-inglés) | 15,52 % | 6,98 % | 11,74 % | 5,62 % | 24,00 % |

Suite de estrés de 210 clips para sesgo por hotwords y anti-parroting:

| Condición | CER Qwen3-ASR-0.6B original | CER este modelo | Tasa de parroting |
|---|---:|---:|---:|
| Hotwords relevantes + distractores homófonos | 11,23 % | 8,14 % | 0,0 % |
| Lista de distractores 100 % irrelevantes | 15,69 % | 11,92 % | 0,0 % |
| Audio ultracorto + lista larga de hotwords | 14,38 % | 12,50 % | 0,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,6 GB de pesos, más overhead de activaciones y del encoder de audio; en la práctica, unos 2-3 GB de VRAM.
- VRAM estimada con cuantización GGUF Q4_K_M: en torno a 0,5-0,8 GB, apto para hardware muy limitado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100 y H100 para despliegues de servidor con mayor concurrencia.
- Cabe en GPU consumer: sí, con holgura, incluso en modelos de gama media y baja.
- Opciones de despliegue: transformers con la librería qwen-asr, vLLM, llama.cpp (llama-server) con los GGUF, transcribe.cpp/Hex en macOS, OraType y despliegue en borde o móvil.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER medio en yue-HK (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Cantonese-HK | 782 M | No disponible | Mejor que el 0.6B original en todos los conjuntos evaluados | Apache 2.0 | Hugging Face (BF16 y GGUF) |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | 1,7 B (aproximado) | No disponible | Inferior (mejor) que el 0.6B en todos los conjuntos | Apache 2.0 (según repo del autor) | Hugging Face (BF16 y GGUF) |
| Qwen3-ASR-0.6B original | 0,6 B | No disponible | Peor que el ajustado en yue-HK | Apache 2.0 | Hugging Face |
| whisper-large-v3 | No disponible | No disponible | Muy superior en CER (20-42 %) en los conjuntos evaluados | MIT (según OpenAI) | Hugging Face, OpenAI |

## Limitaciones y advertencias

- Solo se evaluaron habla en cantonés y code-switching cantonés-inglés; el rendimiento en otros idiomas puede ser peor que el del modelo base.
- El modelo está especializado en cantonés de Hong Kong; puede no generalizar bien a otras variantes del cantonés (Guangdong, Macao) ni a mandarín.
- Riesgo de alucinación y de errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan métricas en condiciones adversas.
- El sesgo por hotwords funciona mejor con listas cortas y relevantes; con listas largas e irrelevantes el CER aumenta (hasta el 12,50 % en audio ultracorto).
- No se documentan sesgos demográficos ni evaluaciones de equidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-ASR-0.6B y de los datasets de evaluación utilizados.
- La longitud de contexto no está documentada; no se recomienda asumir ventanas largas sin verificación.
- La fecha de creación del repositorio (2026-11-13) y el número reducido de descargas (139) sugieren un modelo reciente y con poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- Repositorio GGUF: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo 1.7B del mismo autor: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- OraType (tecleado por voz para macOS): https://github.com/sennett-lau/oratype
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Apoyo al autor: https://buymeacoffee.com/joe2643
