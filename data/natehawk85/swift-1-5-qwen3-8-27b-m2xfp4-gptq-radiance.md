# NateHawk85/Swift-1.5-Qwen3.8-27b-M2XFP4-GPTQ-Radiance

## Resumen

Swift-1.5-Qwen3.8-27b-M2XFP4-GPTQ-Radiance es una cuantización de 4 bits del modelo ukisai/Swift-1.5-Qwen3.8-27b, un transformer híbrido de 27 000 millones de parámetros con 64 capas que combina delta-net y atención. La publica NateHawk85 como cuantización comunitaria no oficial, empaquetada en un único contenedor para el motor de inferencia Radiance e incluyendo el drafter de decodificación especulativa DFlash2. El objetivo es reducir el modelo original en bf16 (que no cabe en 32 GB de VRAM) a 16,2 GiB de pesos en GPU manteniendo la mayor fidelidad posible respecto al original.

La innovación central es el formato M2XFP4, una variante de MXFP4 que añade un exponente E8M0 por cada 32 columnas con sesgo buscado en {−1, 0, +1} y un multiplicador extra (1 + k/4) por cada 8 columnas. Frente a MXFP4 con redondeo simple, reduce la divergencia KL respecto a bf16 de 0,0560 a 0,0280; tras aplicar GPTQ sobre un conjunto de calibración amplio, la KL final es de 0,0172 con un 95,0 % de acuerdo top-1, aproximadamente la mitad de la divergencia de las versiones int4 uniformes (0,031–0,038).

Es relevante ahora porque demuestra que es posible servir un modelo de 27B con contexto de 200 000 tokens en una única GPU de consumo profesional AMD (Radeon AI PRO R9700, 32 GB) con decodificación especulativa activa y velocidades de 101 a 430 tok/s según concurrencia. La contrapartida es que el formato `.rad` es propietario de Radiance: no es safetensors ni GGUF, y vLLM, llama.cpp o transformers no pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (delta-net + atención), 64 capas; modelo base Qwen3.8-27B |
| Parametros totales | 27 000 millones (según nombre del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 200 000 tokens configurados en la invocación de referencia (`--max-model-len 200000`) |
| Tipos de cuantizacion | M2XFP4 (GPTQ) en la mayoría de lineales del decoder; FP8 por bloques en las 48 proyecciones de salida delta-net (`linear_attn.out_proj`) y en la cabeza de salida; KV cache en `k6_v4` |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia del modelo base; scripts bajo Apache 2.0) |
| Formato de pesos | Contenedor `.rad` de Radiance (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 64 capas que alterna delta-net y atención, según la arquitectura Qwen3.8-27B. La cuantización se realizó en dos fases sobre el checkpoint bf16 de ukisai. Primero se registraron las matrices de Gram de entrada (H = Σ xᵀx) para cada lineal del decoder, ejecutando el modelo bf16 capa a capa en GPU con PyTorch/ROCm, ya que el modelo completo no cabe en 32 GB. La calibración usó 256 ventanas de 1 024 tokens del split `calib` del dataset StillDeadcode/qwen3.8-27b-quant-challenge, con una mezcla que prioriza trazas agénticas largas (60 ventanas), razonamiento (21), chat (18), código (18), ciencia (18), web (17), libros (16), multilingüe (14), matemáticas (12), entre otras categorías; sin datos privados. Duplicar el volumen a 512 ventanas no mejoró la KL (0,0171 frente a 0,0172), lo que indica saturación de la calibración a este tamaño.

Sobre esas estadísticas se aplicó GPTQ, y las proyecciones de salida delta-net y la cabeza de salida se dejaron en FP8 por bloques. El contenedor incluye además el drafter DFlash2 (z-lab/Qwen3.8-27B-DFlash2) para decodificación especulativa, activada por defecto, con conmutación al bloque corto de draft a partir de 3 secuencias concurrentes (`--draft-short-from 3`). La herramienta de conversión es `rad-convert` de Radiance 1.13.0, que introdujo el soporte M2XFP4.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 200 000 tokens.
- Razonamiento con modo thinking (la calibración incluye datos de razonamiento con thinking; los evals usan los ajustes de muestreo recomendados por ukisai).
- Tool calling y function calling (la mezcla de calibración incluye datos de herramientas y trazas agénticas).
- Ejecución de tareas agénticas de varios pasos (evaluado con Terminal-Bench según la model card).
- Generación de código y tareas de coding agéntico sobre repositorios públicos (categoría presente en la calibración).
- Capacidades matemáticas (evaluado con AIME 32K).
- Capacidades multilingües (categoría multilingüe en el conjunto de calibración; idiomas concretos no disponibles).
- Visión: la invocación de referencia incluye `--vision-tower-placement ram`, lo que sugiere soporte de torre de visión en el contenedor; no se detalla en la model card.
- Servido mediante API compatible con OpenAI.
- Decodificación especulativa integrada (DFlash2) para acelerar la generación.

## Casos de uso

- Servicio de chat de largo contexto: el modelo admite 200 000 tokens de ventana y una KV cache de aproximadamente 27,6 KB por token (unas 500 000–550 000 posiciones en una R9700), lo que permite conversaciones multi-turno o análisis de documentos extensos sin truncar.
- Asistente de código en pipelines de CI/CD: el soporte de tool calling y la presencia de trazas de coding agéntico en la calibración lo hacen apto para tareas de revisión, generación de parches y ejecución de comandos en entornos controlados mediante la API compatible con OpenAI.
- Agentes autónomos de terminal: la model card reporta evaluaciones en Terminal-Bench, lo que respalda su uso en flujos agénticos de varios pasos sobre repositorios y sistemas de archivos.
- Despliegue en hardware AMD de gama profesional: con 16,2 GiB de pesos en GPU cabe en una Radeon AI PRO R9700 de 32 GB, lo que permite montar un endpoint de inferencia en una sola tarjeta sin depender de CUDA.
- Atención al cliente automatizada: la mezcla de calibración incluye datos de chat y de herramientas, y la decodificación especulativa mantiene el throughput con hasta 8 peticiones concurrentes (430 tok/s en la configuración medida).
- Razonamiento matemático y científico asistido: los evals con AIME 32K y la presencia de datos de matemáticas y ciencia en la calibración permiten usarlo en resolución de problemas técnicos con contexto largo.
- Procesamiento de documentación legal o encyclopédica extensa: la categoría legal y la ventana de 200 000 tokens permiten resumir y consultar corpus largos en una sola pasada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL media frente a bf16 Swift 1.5 | 0,0172 |
| Acuerdo top-1 frente a bf16 | 95,0 % |
| KL de versiones int4 uniformes (referencia) | 0,031–0,038 |
| KL de MXFP4 con redondeo simple (RTN) | 0,0560 (top-1 91,6 %) |
| KL de M2XFP4 con redondeo simple (RTN) | 0,0280 (top-1 93,7 %) |
| Throughput, 1 petición concurrente | 101 tok/s |
| Throughput, 2 peticiones concurrentes | 182 tok/s |
| Throughput, 4 peticiones concurrentes | 273 tok/s |
| Throughput, 8 peticiones concurrentes | 430 tok/s |
| Verbosidad IFBench (media / mediana) | +19 % / +10 % frente a bf16 |
| Verbosidad AIME 32K (media / mediana) | +8 % / +5 % frente a bf16 |

Mediciones de velocidad realizadas en una AMD Radeon AI PRO R9700 (32 GB, limitada a 210 W) con BetterBench v0.6.1, muestreo a temperatura 1,0, top_p 0,95 y top_k 20. No se publican resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: 16,2 GiB de pesos en GPU; el fichero del contenedor ocupa 20,9 GB en disco.
- KV cache: aproximadamente 27,6 KB por token con `--kv-cache-dtype k6_v4`; la configuración de referencia reserva 13 312 MiB de caché de prefijos y permite un pool de unas 500 000–550 000 posiciones en una R9700.
- GPU probada: AMD Radeon AI PRO R9700 (32 GB, gfx1201), limitada a 210 W. Es la única arquitectura en la que se ha testeado según el autor.
- GPU recomendadas: cualquier GPU AMD con soporte ROCm y al menos 32 GB de VRAM para la configuración de referencia; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en tarjetas de 24 GB con la configuración de contexto completo descrita; no hay datos para otras tarjetas.
- Despliegue: exclusivamente mediante Radiance 1.13.0 o superior. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, porque el fichero `.rad` no es safetensors ni GGUF.
- Latencia y throughput: 101 / 182 / 273 / 430 tok/s con 1 / 2 / 4 / 8 peticiones concurrentes en la R9700, con DFlash2 activo por defecto.
- Endpoint: servidor con API compatible con OpenAI en el puerto configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware probado |
|---|---|---|---|---|---|
| Este modelo (M2XFP4 GPTQ Radiance) | 27B | 200 000 | `.rad` (Radiance) | swift-open-license-1.0 | Radeon AI PRO R9700 32 GB |
| ukisai/Swift-1.5-Qwen3.8-27b (bf16) | 27B | no disponible en esta ficha | safetensors (bf16) | swift-open-license-1.0 | No cabe en 32 GB |
| Versiones int4 uniformes de Swift 1.5 | 27B | no disponible | no disponible | swift-open-license-1.0 | no disponible |
| z-lab/Qwen3.8-27B-DFlash2 (drafter) | no disponible | no disponible | no disponible | no disponible | no disponible |

Las versiones int4 uniformes citadas por el autor presentan una KL de 0,031–0,038 frente a 0,0172 de esta cuantización, y una verbosidad de +5 % a +26 % frente a +5 % a +26 % de esta (rango comparable). No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: el fichero `.rad` solo lo carga Radiance 1.13.0 o superior; no funciona en vLLM, llama.cpp, Ollama, TGI ni transformers, lo que limita la portabilidad y obliga a usar el stack de Radiance.
- Compatibilidad de hardware restringida: solo se ha probado en gfx1201 (R9700); no hay validación en otras GPU AMD ni en NVIDIA.
- Cuantización comunitaria no oficial: no está hecha ni respaldada por UkisAI; la calidad puede diferir de las versiones oficiales.
- Divergencia respecto a bf16: KL de 0,0172 y 95,0 % de acuerdo top-1 implican que aproximadamente 1 de cada 20 tokens de la distribución top-1 difiere del modelo original.
- Mayor verbosidad: entre un 5 % y un 20 % más de tokens de salida en benchmarks de un solo turno, y más en ejecuciones agénticas (Terminal-Bench), lo que incrementa coste y latencia en producción.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad; como todo modelo generativo, puede producir contenido incorrecto, especialmente en dominios poco representados en la calibración.
- Idiomas: la model card no detalla qué idiomas soporta ni su calidad por idioma; la categoría multilingüe de la calibración es limitada (14 ventanas).
- Licencia: swift-open-license-1.0 es una licencia "other"; deben revisarse sus términos antes de uso comercial. Los scripts de conversión son Apache 2.0.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Contexto práctico: aunque se configuran 200 000 tokens, el pool real de KV cache depende de la VRAM libre de otros procesos (500 000–550 000 posiciones en total en la R9700), por lo que la concurrencia y la longitud efectiva compiten por el mismo espacio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NateHawk85/Swift-1.5-Qwen3.8-27b-M2XFP4-GPTQ-Radiance
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor de inferencia Radiance: https://codeberg.org/StillDeadcode/radiance
- Dataset de calibración: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
