# netprojects/Inkling-2-Mini-MLX-4-8bit

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) desarrollado por Thinking Machines, con 26.400 millones de parámetros totales y aproximadamente 3.400 millones activos por token. Combina entrada de texto e imagen y está diseñado para tareas de razonamiento, código y uso de herramientas dentro de flujos agénticos. Su arquitectura "looped" recicla las doce capas centrales tres veces, lo que resulta en 48 pasadas de capa por token sobre un total de 24 capas.

La ficha que nos ocupa, `netprojects/Inkling-2-Mini-MLX-4-8bit`, es una conversión del modelo original al framework MLX de Apple, pensada para ejecutarse en silicio de Apple (chips de la serie M). No es una cuantización agresiva: los expertos enrutados conservan exactamente el formato que publicó Thinking Machines (4 bits NVFP4 en las capas 0-19 y 8 bits MXFP8 en las capas 20-23), mientras que atención, embeddings, capa de salida y codificador visual permanecen en bf16. El resultado ocupa 20,2 GB más 0,64 GB del borrador de decodificación especulativa DSpark.

Su relevancia actual radica en que permite ejecutar localmente en un Mac un modelo con ventana de contexto de hasta 1 millón de tokens, capacidades multimodales y un rendimiento en tareas agénticas (SWE-bench, MCP Atlas, BrowseComp) que, según las cifras del autor original, compite con modelos densos notablemente mayores. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (24 capas, las 12 centrales se ejecutan 3 veces; 48 pasadas por token) |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 4 bits NVFP4 (expertos capas 0-19) y 8 bits MXFP8 (expertos capas 20-23); bf16 en atención, embeddings, salida y visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con una innovación estructural: de sus 24 capas, las doce intermedias se recorren tres veces por token, de modo que el cómputo efectivo equivale a 48 pasadas de capa manteniendo un número reducido de parámetros únicos. Solo unos 3,4B parámetros se activan por token, lo que abarata la inferencia frente a un modelo denso del mismo tamaño total. Incorpora además un codificador visual para entrada de imágenes, lo que lo convierte en un modelo image-text-to-text.

Esta build concreta no reentrena ni altera los pesos: repaqueta los expertos enrutados en los formatos nativos de MLX (`nvfp4` y `mxfp8`) sin modificar ningún valor, y mantiene el resto de componentes en bf16. Incluye el borrador de decodificación especulativa DSpark (`mtp.safetensors`), que acelera la generación manteniendo la salida greedy del modelo principal salvo en empates cercanos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con un modo de "pensamiento" configurable mediante `reasoning_effort` (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` o un valor numérico entre 0.0 y 0.99).
- Comprensión de imágenes: el modelo responde preguntas sobre capturas de pantalla, documentos y figuras (pipeline image-text-to-text).
- Tool calling / function calling en formato propio de Inkling, que `mlx_vlm.server` expone como `tool_calls` compatibles con OpenAI.
- Capacidades agénticas: uso de herramientas tipo `bash` y `read`, razonamiento multi-paso y tareas de navegación web.
- Generación y depuración de código, con resultados verificados en tareas cortas de Python.
- Procesamiento de documentos y OCR de alta fidelidad (evaluado en OmniDocBench).
- Contexto largo de hasta 1M tokens, útil para repositorios, expedientes o conversaciones extensas.
- Decodificación especulativa mediante el borrador DSpark incluido.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes de terminal automatizados: el modelo puede recibir herramientas `bash` y `read`, planificar varios pasos y ejecutar comandos en un entorno controlado; sus resultados en Terminal-Bench 2.1 y SWE-bench lo sitúan como opción realista para automatizar tareas de mantenimiento de repositorios.
- Resolución de incidencias sobre código en producción: con SWE-bench Verified al 79,2% (bash only) según el autor original, encaja en pipelines que reciben un issue, localizan el fichero afectado y proponen un parche revisable por un humano.
- Análisis de capturas y documentos: gracias al codificador visual y a su rendimiento en OmniDocBench (92,8%), sirve para extraer errores de logs en imágenes, digitalizar facturas o interpretar diagramas técnicos.
- Asistente de investigación con navegación web: su puntuación en BrowseComp (79,0% con compactación) lo hace adecuado para tareas de búsqueda y síntesis de información a partir de fuentes dispersas.
- Procesamiento de repositorios completos en local: con 1M tokens de contexto puede cargar varios ficheros y mantener coherencia entre ellos sin fragmentar la conversación, algo útil para revisiones de arquitectura o auditorías.
- Automatización de flujos MCP: con MCP Atlas al 82,7%, puede orquestar servidores de herramientas bajo el protocolo Model Context Protocol en entornos de escritorio.
- Despliegue en estación de trabajo Apple: al ocupar 27,8 GB de pico con prompt de 8K tokens, cabe en un Mac de 48 GB o más, lo que permite ofrecer un servidor OpenAI-compatible local para prototipos sin depender de la nube.

## Benchmarks y rendimiento

Cifras publicadas por Thinking Machines para el modelo original (no para esta build MLX), con sus propios arneses y ajustes:

| Benchmark | Inkling 2 Mini | Qwen3.8-27B | Gemma 4 31B |
|---|---|---|---|
| Artificial Analysis Intelligence Index v5.0 | 20,1 | 20,1 | 4,4 |
| SWE-bench Verified (bash only) | 79,2% | 77,8% | 46,1% |
| SWE-bench Pro v2 Hard (mini-swe-agent) | 77,9% | 73,8% | 14,2% |
| Terminal-Bench 2.1 (pi) | 71,6% | 73,0% | 43,4% |
| BrowseComp (with compaction) | 79,0% | 61,6% | 37,0% |
| MCP Atlas | 82,7% | 77,3% | 54,2% |
| MMMU Pro | 74,9% | 76,3% | 73,4% |
| OmniDocBench v1.6 | 92,8% | 91,5% | 82,5% |
| LongBench v2 | 66,9% | 52,3% | 52,9% |
| ARC-AGI v1 / v2 | 84,5 / 49,3% | 87,5 / 42,4% | – |

Validaciones específicas de esta build MLX, realizadas en un MacBook Pro M5 Max de 128 GB con MLX 0.32.4:

| Prueba | Resultado |
|---|---|
| Coincidencia de siguiente token frente al código de Thinking Machines (488 posiciones) | 98,6% |
| KL media frente al código de referencia | 0,0018 |
| GSM8K (50 preguntas fijas, reasoning `none`, greedy) | 47/50 |
| Tool calling (prompt con `bash` y `read`) | llamada bien formada |
| Tareas cortas de Python | 3/3 |
| Razonamiento `low` | 2/2 correctas tras un bloque de pensamiento |
| Visión (cuadrado rojo y círculo azul) | correcto |
| Memoria pico con prompt de 4K tokens | 26,9 GB |
| Memoria pico con prompt de 8K tokens | 27,8 GB |

## Requisitos de hardware

- VRAM/unified memory estimada: 27,8 GB de pico con prompt de 8K tokens; 26,9 GB con 4K. El repo pesa 20,2 GB más 0,64 GB del borrador DSpark.
- Cabe en Mac con 48 GB o más de memoria unificada; en equipos con menos memoria hay que elevar el límite de memoria cableada de la GPU (`sudo sysctl iogpu.wired_limit_mb=...`) dejando varios GB libres para el sistema.
- GPU recomendadas: Apple Silicon de la serie M (probado en M5 Max de 128 GB). No está pensado para CUDA; para A100/H100 habría que usar la versión original en Transformers.
- No cabe en GPUs de consumo con 24 GB (RTX 4090) en esta build de 20,2 GB más estados y caché KV; requeriría una cuantización más agresiva o descarga a memoria del sistema.
- Despliegue: `mlx-vlm` con soporte de Inkling 2 Mini desde el fork `internet-projects/inkling2-mlx` v0.1.0 (Python 3.10+), servidor OpenAI-compatible con `mlx_vlm.server`, y decodificación especulativa opcional con `load_drafter`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo reporta memoria pico y coincidencia de tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini (esta build MLX) | 26,4B | ~3,4B | 1M | Apache 2.0 | Hugging Face, MLX |
| Qwen3.8-27B | 27B (denso, según denominación) | no disponible | no disponible | no disponible | no disponible |
| Gemma 4 31B | 31B | no disponible | no disponible | no disponible | no disponible |

Los dos modelos de comparación aparecen únicamente en la tabla de benchmarks del autor original; no se dispone de sus especificaciones completas (contexto, licencia, formato) en la información proporcionada. En términos de rendimiento, Inkling 2 Mini supera a Qwen3.8-27B en SWE-bench Pro v2 Hard, BrowseComp, MCP Atlas y LongBench v2, empata en el índice de inteligencia y queda por detrás en Terminal-Bench 2.1 y MMMU Pro; frente a Gemma 4 31B la ventaja es amplia en casi todas las métricas.

## Limitaciones y advertencias

- El modelo puede "pensar" durante mucho tiempo incluso con `reasoning_effort=none` y quedar atrapado en bucles de razonamiento largos; conviene fijar siempre `max_tokens`.
- Riesgo de alucinación inherente a los modelos generativos; los benchmarks agénticos no garantizan corrección en dominios no cubiertos.
- Esta build requiere un fork no publicado de MLX-VLM (`internet-projects/inkling2-mlx` v0.1.0), por lo que la estabilidad de la API y el soporte a largo plazo no están garantizados.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversión.
- El rendimiento en esta build puede desviarse ligeramente del original: 98,6% de coincidencia de siguiente token y KL media de 0,0018 frente al código de referencia.
- La memoria pico de 27,8 GB obliga a Macs de 48 GB o más; en configuraciones menores hay que ajustar el límite de memoria cableada y puede haber degradación.
- Idiomas soportados no disponibles: no se puede confirmar la calidad en castellano ni en otras lenguas distintas del inglés.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de las dependencias (PyTorch, torchvision, MLX-VLM) antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build alternativa de 3 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Repositorio del fork MLX-VLM: https://github.com/internet-projects/inkling2-mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
