# Safasfly/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-P2-MTP1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-P2-MTP1-GGUF es una redistribución cuantizada, creada por el usuario Safasfly, del modelo Swift 1.5 (derivado de Qwen3.8-27B de UkisAI). No se trata de un modelo nuevo, sino de una variante optimizada para inferencia local: el vocabulario original de 248.000 tokens se ha podado a ASCII, Latin-1 y Latin Extended-A (141.000 tokens), y la cabeza MTP (multi-token prediction) usada para decodificación especulativa se ha reentrenado mediante auto-distilación sobre las propias generaciones del modelo cuantizado.

El objetivo declarado del fichero es ejecutar un modelo de 27B parámetros con su contexto completo de 262.144 tokens en una sola GPU de 16 GB (probado en una RX 9070 XT con RDNA 4 bajo Windows 11), combinando la cuantización IQ3_S con streaming de la caché KV. El reentrenamiento de la cabeza MTP mejora la velocidad de generación entre un 6,5 % y un 13,3 % según la carga de trabajo, sin alterar la distribución de salida gracias a la verificación probabilística.

Es relevante para quienes necesiten contextos muy largos en hardware de gama media-consumer, especialmente en entornos ROCm/AMD, aunque su uso está limitado a scripts latenses: los textos en alfabetos no latinos (CJK, cirílico) funcionan por byte fallback y sufren una penalización de velocidad y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con cabeza MTP para decodificación especulativa |
| Parametros totales | 26.225.703.936 (≈26,2B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | IQ3_S (pesos); KV cache: q8_0 (K) / q4_0 (V); MTP draft: q8_0/q4_0 |
| Idiomas soportados | Optimizado para ASCII, Latin-1 y Latin Extended-A; otros alfabetos vía byte fallback |
| Licencia | Swift Open License v1.0 (swift-open-license-1.0, licencia "other") |
| Formato de pesos | GGUF (11,63 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros derivado de Qwen3.8-27B (Alibaba Cloud, Apache 2.0), al que UkisAI aplicó una cuantización GSQ-RCO. Esta redistribución introduce dos modificaciones técnicas. La primera es el podado del vocabulario de 248k a 141k tokens, eliminando embeddings y filas de salida de caracteres fuera del rango ASCII/Latin-1/Latin Extended-A; todos los tensores restantes son idénticos byte a byte al fichero original, y el fichero resultante ocupa 0,49 GB menos. Los caracteres eliminados siguen funcionando mediante byte fallback, a coste de un token por byte UTF-8.

La segunda es el reentrenamiento de la cabeza MTP (bloque `blk.64`, 15 tensores) por auto-distilación: los estados ocultos objetivo se extrajeron del propio modelo cuantizado con una herramienta `llama-dump-hidden`, de modo que la cabeza aprende a predecir el comportamiento exacto de esta cuantización. El entrenamiento usó unos 1,06M tokens de generaciones del propio modelo (sesiones de coding-agent vía OpenCode y respuestas de chat, ponderadas ×2), 1.600 filas del dataset faunix/Qwen3.8-27B-Distillation-40K y 300 filas de ukisai/Qwen3.8-27B-multi-turn-agent-sft, con el último 25 % de las ventanas de entrenamiento on-policy. Se entrenó en PyTorch con ROCm sobre la misma RX 9070 XT, y los checkpoints se seleccionaron por longitud esperada de tokens aceptados en sesiones held-out. Como la verificación especulativa es probabilística, la distribución de muestreo es idéntica a la decodificación normal: la nueva cabeza solo afecta a la velocidad.

## Capacidades

- Generación de texto conversacional, con etiqueta de pipeline text-generation y uso conversational.
- Razonamiento configurable mediante el chat template: `reasoning_effort` admite `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Optimizado para sesiones de coding-agent: los datos de A/B incluyen turnos capturados de un agente de programación (OpenCode).
- Contexto muy largo: hasta 262.144 tokens, con decodificación medida a 150k+ tokens de contexto.
- Decodificación especulativa MTP combinada con modificación por n-gramas (`--spec-type draft-mtp,ngram-mod`), con 2,19 tokens aceptados de media por borrador.
- Soporte de tool calling: no disponible explícitamente en la información proporcionada (aunque los datos de entrenamiento incluyen sesiones de agente).
- Capacidades multilingües: limitadas en la práctica a scripts latenses; CJK, cirílico y emojis funcionan vía byte fallback con penalización.

## Casos de uso

- **Asistente de código local en GPU de 16 GB**: el fichero está diseñado para ejecutar un modelo de 27B con contexto completo en una RX 9070 XT, adecuado para sesiones de coding-agent (OpenCode) que requieren leer repositorios grandes.
- **Análisis de documentos extensos**: con 262k tokens de contexto puede procesar libros, contratos o bases de código completas en una sola pasada; la decodificación medida a 75k tokens alcanza 85,5 tok/s con la cabeza reentrenada.
- **Chat privado sin conexión a servicios en la nube**: el despliegue vía llama-server permite mantener conversaciones multi-turno íntegramente en local, relevante para datos sensibles.
- **Razonamiento ajustable por tarea**: el parámetro `reasoning_effort` permite bajar el esfuerzo (`low`) para respuestas rápidas y subirlo (`xhigh`) para problemas complejos, equilibrando latencia y calidad.
- **Inferencia en estaciones AMD/ROCm**: construido y medido sobre RDNA 4 con el fork ROCm de llama.cpp, es una opción para quien no dispone de GPU NVIDIA.
- **Procesamiento por lotes de textos latenses**: el vocabulario podado acelera la decodificación (~5 % en el corpus medido) y reduce el tamaño del fichero, útil para generación masiva en lenguas europeas.
- **Experimentación con decodificación especulativa**: el repositorio de GitHub incluye el código de entrenamiento de la cabeza MTP y los scripts de benchmark, útil como referencia para reproducir o extender la técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se ha publicado un A/B de throughput entre la cabeza MTP original de UkisAI y la reentrenada, ambos sobre la misma máquina (RX 9070 XT, Windows 11, con decodificación de vídeo en CPU durante las pruebas):

| Workload | Cabeza original | Cabeza reentrenada | Cambio |
|---|---|---|---|
| Agent replay, warm | 102,2 tok/s | 115,8 tok/s | +13,3 % |
| Agent replay, cold | 88,0 tok/s | 93,7 tok/s | +6,5 % |
| Chat | 58,7 tok/s | 66,0 tok/s | +12,4 % |
| Decode a ~75k de contexto | 75,8 tok/s | 85,5 tok/s | +12,8 % |
| Decode a 150k+ de contexto | 34,8 tok/s | 33,3 tok/s | −4,3 % (ruido de reinicio) |
| Tokens aceptados por borrador MTP | 1,93 | 2,19 | +13 % |

En sesiones held-out, la longitud esperada de borrador aceptado aumentó un +7,9 % (IC 95 %: +6,7 % a +11,4 %), con mejora en 26 de 28 sesiones.

## Requisitos de hardware

- **VRAM**: el objetivo de diseño es una GPU de 16 GB con contexto completo de 262k tokens, usando streaming de KV cache (`--kv-resident-mib 1355`, ~1,3 GiB residentes). Sin el fork con `--kv-stream`, el contexto debe reducirse para caber en VRAM (el fichero pesa 11,63 GB).
- **GPU probada**: AMD RX 9070 XT (RDNA 4) bajo Windows 11, con el fork ROCm de achyudh (`feature/adaptive-kv-stream-rocm`) más el parche del repositorio. Compatibilidad con GPU NVIDIA no verificada en la información disponible, aunque llama.cpp en general la soporta.
- **Consumer GPU**: sí, diseñado explícitamente para caber en 16 GB (RX 9070 XT, RTX 4080/4090 en principio compatibles por VRAM, sin verificación publicada).
- **Despliegue**: llama.cpp (`llama-server`) con soporte de Qwen3.8 MTP (`--spec-type draft-mtp`). No se mencionan vLLM, TGI ni Ollama; al ser un GGUF con podado de vocabulario y cabeza MTP modificada, la compatibilidad fuera de llama.cpp no está garantizada.
- **Rendimiento**: 66-115,8 tok/s según carga con la cabeza reentrenada; 33-85 tok/s con contextos de 75k a 150k+. Se recomienda un solo slot (`-np 1`) con KV streaming; dos slots con streaming provocaron reinicios en la máquina de pruebas.
- **Requisitos adicionales**: con el parche, variables de entorno `LLAMA_KV_STREAM_RERESIDE=1` y `LLAMA_KV_STREAM_POOL_CHUNK_MIB=1024`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Safasfly/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-P2-MTP1 | 26,2B | 262k | IQ3_S (GGUF, 11,63 GB) | Swift Open License v1.0 | Vocabulario podado a latín, MTP reentrenado, 16 GB VRAM con KV streaming |
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | 26,2B | 262k | IQ3_S (GGUF, 12,12 GB) | Swift Open License v1.0 | Fichero original sin podar; mejor para scripts no latinos; MTP sin evaluar por separado |
| Qwen3.8-27B (base, Alibaba Cloud) | 27B | no disponible en la información proporcionada | no disponible | Apache 2.0 | Modelo base; sin podado ni cabeza MTP modificada |

## Limitaciones y advertencias

- **Idiomas y alfabetos**: el podado del vocabulario penaliza CJK, cirílico, emojis y otros caracteres no latinos (un token por byte UTF-8). En el modelo base podado se midió una perplejidad de 3,42 frente a 3,375 sin podar en un corpus técnico con emojis. Para scripts no latinos, usar el fichero sin podar de UkisAI.
- **Licencia comercial restringida**: la Swift Open License v1.0 exige licencia de UkisAI para uso comercial por entidades que superen un umbral de ingresos (el umbral concreto no se detalla en la información disponible). Es una licencia "other", no Apache/MIT.
- **Compatibilidad de software**: requiere una build de llama.cpp con soporte de Qwen3.8 MTP; las opciones `--kv-stream` solo existen en el fork de achyudh, y `--kv-stream-split` además necesita el parche del repositorio. No hay garantía de funcionamiento en vLLM, Ollama u otros runtimes.
- **Estabilidad**: dos slots de servidor con KV streaming provocaron reinicios de la máquina de pruebas; usar `-np 1`.
- **Rendimiento a contexto extremo**: a 150k+ tokens la decodificación cayó a ~33-35 tok/s, y la cabeza reentrenada no mejoró en ese rango (−4,3 %, dentro del ruido).
- **Calidad del modelo base**: no se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) ni de esta redistribución ni del modelo base Swift 1.5 en la información disponible; el riesgo de alucinación inherente a un modelo de 27B cuantizado a IQ3_S debe evaluarse caso por caso.
- **Descargas**: el repositorio registra 0 descargas y 1 like en el momento de la ficha, es decir, prácticamente sin historial de adopción ni validación por terceros.

## Enlaces

- Ficha del modelo: https://huggingface.co/Safasfly/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-P2-MTP1-GGUF
- Modelo base (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio con parches, herramientas de podado, código de entrenamiento MTP y benchmarks: https://github.com/lnieuwenhuis/rdna4-27b-inference
- Fork de llama.cpp para RDNA4 ROCm: https://github.com/achyudh/llama.cpp
- Dataset de distilación: https://huggingface.co/datasets/faunix/Qwen3.8-27B-Distillation-40K
- Dataset multi-turno de agente: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia Swift Open License v1.0 (referencia del modelo base): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
