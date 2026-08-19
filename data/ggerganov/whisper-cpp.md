# ggerganov/whisper.cpp

## Resumen

whisper.cpp es una implementación en C/C++ del modelo de reconocimiento automático de voz (ASR) Whisper de OpenAI, desarrollada por Georgi Gerganov (ggerganov). Este repositorio en HuggingFace aloja los pesos de los modelos Whisper convertidos al formato ggml, que es el formato nativo del motor de inferencia de whisper.cpp. El proyecto resuelve el problema de ejecutar Whisper en entornos con recursos limitados, sin dependencias pesadas de Python ni frameworks de deep learning, y con un rendimiento notablemente superior en CPU.

El modelo original Whisper es una arquitectura transformer encoder-decoder entrenada con 680 000 horas de audio anotado, que cubre múltiples idiomas y tareas como transcripción, traducción y detección de idioma. whisper.cpp permite ejecutar todos los tamaños de Whisper —tiny, base, small, medium, large-v1/v2/v3 y large-v3-turbo— en dispositivos de bajo consumo, desde Raspberry Pi hasta servidores, con cuantizaciones que reducen drásticamente el uso de memoria sin sacrificar excesiva precisión. Su relevancia actual se debe a que es la opción estándar para despliegues de ASR en edge computing y aplicaciones de tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | Depende del tamaño: tiny (39M), base (74M), small (244M), medium (769M), large (1550M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | q5_0, q5_1, q8_0 (además de fp16 original) |
| Idiomas soportados | 99 idiomas (según Whisper original; la model card no los lista) |
| Licencia | MIT |
| Formato de pesos | ggml (safetensors para los originales de OpenAI) |

## Arquitectura y entrenamiento

whisper.cpp es un port directo de la arquitectura Whisper de OpenAI, que consiste en un encoder transformer con atención bidireccional sobre el espectrograma de Mel (80 canales, 30 segundos de audio) y un decoder autoregresivo con atención cruzada. El modelo fue entrenado originalmente por OpenAI con 680 000 horas de audio supervisado, incluyendo datos multilingües y multitarea, con un enfoque de preentrenamiento débilmente supervisado. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento fue puramente supervisado.

La innovación técnica de whisper.cpp reside en su motor de inferencia basado en ggml, una biblioteca de tensores optimizada para CPU y GPU (CUDA, Metal, Vulkan), que permite ejecutar los modelos con cuantización de 5 y 8 bits. Además, el proyecto incluye optimizaciones como el uso de instrucciones SIMD (AVX, NEON) y soporte para decodificación especulativa en algunas versiones, lo que reduce la latencia en hardware modesto.

## Capacidades

- Reconocimiento automático de voz (ASR) en 99 idiomas, con transcripción directa del audio.
- Traducción de audio a texto en inglés (tarea "translate" del modelo original).
- Detección de idioma hablado en el audio.
- Transcripción con marcas de tiempo a nivel de segmento y palabra.
- Soporte de transcripción en tiempo real (streaming) mediante la API de whisper.cpp.
- Ejecución en CPU sin dependencias externas (solo C++ y la biblioteca ggml).
- Cuantización de pesos para reducir el uso de memoria y acelerar la inferencia en hardware limitado.
- Integración con otros lenguajes mediante bindings (Python, Rust, Go, etc.) disponibles en el ecosistema.

## Casos de uso

- Transcripción de reuniones y entrevistas: se puede ejecutar whisper.cpp en un portátil o servidor local para transcribir grabaciones de audio largas (divididas en ventanas de 30 segundos) con alta precisión y sin conexión a internet.
- Asistentes de voz en dispositivos embebidos: gracias a su bajo consumo de memoria (el modelo tiny cuantizado ocupa 31 MiB), es viable en Raspberry Pi o dispositivos IoT para comandos de voz locales.
- Subtitulado automático de vídeos: la salida con marcas de tiempo permite generar subtítulos en múltiples idiomas, ideal para creadores de contenido o plataformas de vídeo.
- Traducción de audio en tiempo real: la tarea de traducción a inglés puede usarse en aplicaciones de interpretación simultánea, aunque con limitaciones de latencia según el hardware.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir y analizar conversaciones telefónicas para extraer métricas de calidad, usando modelos medianos o grandes en servidores CPU.
- Accesibilidad para personas con discapacidad auditiva: integración en aplicaciones de transcripción en vivo para aulas o eventos, ejecutable en hardware asequible.
- Investigación en procesamiento de audio: sirve como línea base fiable para comparar nuevos modelos de ASR, dado su fácil despliegue y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos de precisión (WER) del modelo Whisper original están disponibles en el paper de OpenAI, pero whisper.cpp no proporciona métricas propias en la model card ni en el repositorio de HuggingFace. Se recomienda consultar el repositorio de GitHub para obtener referencias de velocidad en diferentes CPUs y GPUs.

## Requisitos de hardware

- Modelo tiny cuantizado (q5_1): 31 MiB en disco, ~40 MB de RAM/VRAM. Ejecutable en Raspberry Pi 4 o cualquier CPU moderna.
- Modelo base cuantizado (q5_1): 57 MiB, ~70 MB de RAM. Funciona en móviles y SBCs.
- Modelo small cuantizado (q5_1): 181 MiB, ~220 MB de RAM. Apto para portátiles y mini-PCs.
- Modelo medium cuantizado (q5_0): 514 MiB, ~600 MB de RAM. Requiere un PC con al menos 8 GB de RAM.
- Modelo large-v3 cuantizado (q5_0): 1.1 GiB, ~1.3 GB de RAM. Recomendable GPU con 4 GB de VRAM para baja latencia, aunque funciona en CPU.
- Modelo large-v3-turbo cuantizado (q8_0): 834 MiB, ~1 GB de RAM. Optimizado para velocidad en CPU.
- GPUs soportadas: NVIDIA (CUDA), Apple Silicon (Metal), AMD (Vulkan) mediante las opciones de compilación de whisper.cpp.
- Opciones de despliegue: binario CLI, servidor HTTP con API REST, bindings para Python, Rust, Node.js, etc. Se integra con llama.cpp para modelos multimodales.
- Latencia: en una CPU moderna, el modelo small procesa un segmento de 30 segundos en ~2-4 segundos; large-v3 puede tardar 10-20 segundos. Con GPU, la latencia se reduce a menos de 1 segundo para small.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| whisper.cpp (este repo) | 39M - 1550M | 30 s audio | MIT | ggml | Port C++, inferencia en CPU/GPU ligera |
| Whisper original (OpenAI) | 39M - 1550M | 30 s audio | MIT | PyTorch | Requiere Python y GPU para uso práctico |
| faster-whisper (SYSTRAN) | 39M - 1550M | 30 s audio | MIT | CTranslate2 | Optimizado para GPU, hasta 4x más rápido que Whisper |
| Distil-Whisper | 756M (distil-large-v3) | 30 s audio | MIT | PyTorch | Destilado, 6x más rápido que large-v3 con menor WER |

whisper.cpp destaca por su portabilidad y ausencia de dependencias, mientras que faster-whisper ofrece mayor velocidad en GPU. Distil-Whisper es más preciso en inglés pero no multilingüe completo.

## Limitaciones y advertencias

- La precisión varía según el idioma; los modelos .en (tiny.en, base.en, small.en, medium.en) solo funcionan con inglés y ofrecen mejor WER en ese idioma.
- La ventana de contexto es fija de 30 segundos; audios más largos se procesan por segmentos, lo que puede perder contexto entre ellos.
- Riesgo de alucinaciones en silencios o audio de baja calidad, especialmente en modelos pequeños.
- No hay soporte para puntuación o formato enriquecido (aunque Whisper genera puntuación básica).
- La licencia MIT permite uso comercial sin restricciones, pero los pesos de Whisper original provienen de OpenAI y su licencia también es MIT (sin restricciones adicionales).
- Para producción, se recomienda validar el rendimiento en el dominio específico (ruido, acentos, terminología) antes de desplegar.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ggerganov/whisper.cpp
- Repositorio de GitHub (whisper.cpp): https://github.com/ggml-org/whisper.cpp
- Documentación de modelos en GitHub: https://github.com/ggerganov/whisper.cpp/tree/master/models
- Paper original de Whisper: https://cdn.openai.com/papers/whisper.pdf
