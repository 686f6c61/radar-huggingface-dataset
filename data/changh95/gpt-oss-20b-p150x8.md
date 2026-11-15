# changh95/gpt-oss-20b-p150x8

## Resumen

`changh95/gpt-oss-20b-p150x8` es un paquete de despliegue para servir el modelo `openai/gpt-oss-20b` sobre hardware Tenstorrent Blackhole. No es un modelo entrenado por el autor, sino una imagen de contenedor y un manifiesto (schema 5.1) generados con `tt-model-manager` 0.1.0 que permiten ejecutar los pesos originales de OpenAI sobre ocho placas Blackhole P150 en malla lógica 1x8 con paralelismo tensorial (TP=8), a través de vLLM 0.25.1 y el plugin `vllm-tt-plugin`.

El modelo subyacente, `gpt-oss-20b`, es un transformer con mezcla de expertos (MoE) de 21B parámetros totales y 3.6B activos, con 32 expertos y top-4, ventana de contexto de 131K tokens y formato de chat harmony. El paquete limita el contexto servido a 32.768 tokens y admite hasta 32 secuencias concurrentes en la configuración `P150x8`.

Su relevancia es práctica: demuestra que un MoE de 21B puede servirse con decodificación de aproximadamente 56 tokens por segundo por usuario y hasta 1.730 tok/s agregados con 32 usuarios sobre aceleradores Tenstorrent, ofreciendo una alternativa no-CUDA para inferencia de modelos abiertos. El repositorio pesa 3,4 GB y no contiene los pesos, que se descargan aparte desde el repositorio de OpenAI en el commit `6cee5e81ee83917806bbde320786a8fb61efebee`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base `openai/gpt-oss-20b`); paquete de despliegue sobre tt-metal + vLLM |
| Parametros totales | 21B (modelo base) |
| Parametros activos | 3.6B (MoE con 32 expertos, top-4) |
| Longitud de contexto | 131K en el modelo base; 32.768 tokens en la configuracion `P150x8` |
| Tipos de cuantizacion | bfp8 para expertos y KV cache (segun la model card) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero la card no lo detalla) |
| Licencia | no disponible (el paquete no declara licencia; el modelo base `gpt-oss-20b` tiene su propia licencia en su repositorio) |
| Formato de pesos | pesos originales de `openai/gpt-oss-20b` descargados desde Hugging Face; el repo contiene manifiesto, imagen de contenedor y codigo (`code/`) |
| Hardware objetivo | 8 x Tenstorrent Blackhole P150 (malla logica 1x8, TP=8) |
| Servidor | OpenAI-compatible en puerto 20000 (o el siguiente libre) |
| Concurrencia maxima | 32 secuencias |
| Herramientas | `tt-model` 0.1.0, vLLM 0.25.1, `vllm-tt-plugin` (rama `solar-fixes`), tt-metal `ed28fce3a4c` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 21B parámetros totales, 3.6B activos por token, 32 expertos con enrutamiento top-4, contexto de 131K tokens y formato de chat harmony. La model card no aporta detalles sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO; esa información corresponde al repositorio de `openai/gpt-oss-20b`, no a este paquete.

La innovación de este repositorio es de despliegue, no de entrenamiento. El contenedor compila kernels específicos para Blackhole mediante tt-metal y sirve el modelo con vLLM usando paralelismo tensorial en ocho placas. La imagen se construyó desde tt-metal `ed28fce3a4c`, que incluye correcciones de serving posteriores a la barrida de regresión del 2026-09-05 (programas de prefill seguros para trace, corrección de page-table en prefill con padding, tenstorrent/tt-metal#56324 y exclusión de filas de padding del servidor en la unión de expertos). El prefill es secuencial, un usuario a la vez, lo que hace que el TTFT crezca con el número de usuarios; la decodificación usa trace.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con el modelo base `gpt-oss-20b`.
- Formato de chat harmony, con canales diferenciados para razonamiento y respuesta final.
- Ventana de contexto efectiva de 32.768 tokens en esta configuración de hardware.
- Servidor compatible con la API de OpenAI (endpoint de chat completions) en el puerto 20000.
- Hasta 32 secuencias concurrentes con decodificación trazada.
- Tool calling y function calling: no disponible en la información proporcionada para este paquete (depende de las capacidades del modelo base y del servidor vLLM).
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de hardware Tenstorrent en producción: desplegar `gpt-oss-20b` sobre ocho placas Blackhole P150 para medir latencia y throughput reales antes de migrar cargas de inferencia fuera de CUDA. El paquete incluye tablas de rendimiento medidas con pesos reales que permiten dimensionar el clúster.
- Servicio de chat interno para equipos de desarrollo: con 32 usuarios concurrentes y unos 48-57 tok/s por usuario en prompts de 128 tokens, encaja en un asistente de código o documentación con decenas de usuarios simultáneos.
- Procesamiento por lotes de documentos largos: la ventana de 32.768 tokens permite resumir o extraer información de informes extensos en una sola pasada, aunque el TTFT en prompts de 32K ronda los 3,7 s con un usuario y supera los 100 s con 32 usuarios por el prefill secuencial.
- Backend de API compatible con OpenAI: integrar el servidor en aplicaciones existentes que ya usan el SDK de OpenAI sin cambios de cliente, apuntando al puerto 20000.
- Prototipado de pipelines de agentes: usar el formato harmony y el contexto largo para cadenas de razonamiento multi-paso, validando el comportamiento en hardware no-CUDA antes de escalar.
- Benchmarking comparativo de aceleradores: reproducir las tablas de decodificación y TTFT de la model card para contrastar Blackhole P150 con GPU equivalentes en cargas MoE.
- Investigación sobre serving de MoE: estudiar el efecto del prefill secuencial y del trace en la latencia agregada con distintos números de usuarios y longitudes de prompt.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (MMLU, HumanEval, GSM8K). Sí incluye mediciones de serving sobre ocho Blackhole P150 (TP=8), pesos reales, expertos y KV cache en bfp8, decodificación greedy y cachés calientes, en la barrida de regresión del 2026-09-05 (commit `f91dc77e50f`).

Decodificación por usuario (tokens/s), extracto:

| Usuarios | 128/128 | 1024/128 | 8192/128 | 32768/128 |
|---|---|---|---|---|
| 1 | 58,1 | 56,8 | 56,5 | 55,3 |
| 8 | 50,1 | 55,2 | 53,7 | 49,4 |
| 32 | 48,9 | 56,7 | 51,3 | 40,2 |

Throughput agregado (tokens/s):

| Usuarios | 128/128 | 1024/128 | 8192/128 | 32768/128 |
|---|---|---|---|---|
| 1 | 58 | 57 | 56 | 55 |
| 8 | 401 | 441 | 430 | 395 |
| 32 | 1564 | 1813 | 1642 | 1288 |

TTFT medio por usuario (ms):

| Usuarios | 128/128 | 1024/128 | 8192/128 | 32768/128 |
|---|---|---|---|---|
| 1 | 59 | 191 | 891 | 3685 |
| 8 | 218 | 818 | 4024 | 20869 |
| 32 | 728 | 2056 | 17954 | 115754 |

Según la card, servido a través de vLLM en este contenedor el modelo entrega 61 tok/s a un solo usuario y 1.730 tok/s agregados a 32 usuarios (54 tok/s cada uno) con prompts de 128 tokens.

## Requisitos de hardware

- Ocho placas Tenstorrent Blackhole P150 en malla lógica 1x8 con TP=8; no es ejecutable en GPU convencional ni en CPU.
- Memoria: no disponible el detalle de VRAM/HBM por placa en la información proporcionada; el repo de 3,4 GB no incluye pesos, que se descargan aparte.
- No cabe en GPU de consumo (RTX 4090, etc.) tal como está empaquetado: depende del backend tt-metal y de las placas Blackhole.
- Despliegue mediante `tt-model pull changh95/gpt-oss-20b-p150x8 --with-weights` y `tt-model serve changh95/gpt-oss-20b-p150x8`; el primer arranque compila kernels y tarda varios minutos.
- Servidor OpenAI-compatible en el puerto 20000 (o el siguiente libre); listo cuando el log muestra `Application startup complete`.
- Latencia y throughput: ver tablas anteriores; decodificación de 55-58 tok/s por usuario con un usuario y 40-57 tok/s con 32 usuarios según longitud de prompt.
- Alternativas de despliegue (vLLM en GPU, llama.cpp, Ollama, TGI): no disponibles para este paquete, que está atado al plugin `vllm-tt-plugin` y a tt-metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| `changh95/gpt-oss-20b-p150x8` | 21B totales / 3,6B activos | 32.768 en esta config (131K en el base) | no disponible | 8 x Blackhole P150 | Paquete de serving, no modelo nuevo; rendimiento medido en la card |
| `openai/gpt-oss-20b` | 21B totales / 3,6B activos | 131K | la de su repositorio | GPU (vLLM, etc.) | Modelo base original; referencia de calidad y contexto completo |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: es un paquete de despliegue; cualquier limitación de calidad, sesgo o alucinación del base `gpt-oss-20b` se hereda íntegramente.
- El contexto servido se recorta a 32.768 tokens frente a los 131K del modelo base.
- El prefill es secuencial (un usuario a la vez): el TTFT crece linealmente con el número de usuarios y alcanza 115 s con 32 usuarios y prompts de 32K tokens.
- El primer arranque compila kernels y tarda varios minutos; no es adecuado para arranques en frío frecuentes.
- Dependencia estricta de versiones concretas (tt-metal `ed28fce3a4c`, vLLM 0.25.1, plugin en rama `solar-fixes`); cambios de versión pueden romper el serving.
- Licencia del paquete no declarada; verificar la licencia de `openai/gpt-oss-20b` antes de uso comercial.
- Idiomas soportados no documentados en la card; validar el comportamiento multilingüe antes de producción.
- Sin datos publicados de benchmarks de calidad ni de sesgos en la información disponible.
- El repositorio tiene 0 descargas y 0 likes: sin validación comunitaria todavía.

## Enlaces

- Repositorio del paquete: https://huggingface.co/changh95/gpt-oss-20b-p150x8
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Commit de pesos: `6cee5e81ee83917806bbde320786a8fb61efebee`
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- tt-metal (commit usado): https://github.com/tenstorrent/tt-metal/commit/ed28fce3a4cd5f14f17fbb3b1a58e9903d40ed86
- tt-metal issue #56324: https://github.com/tenstorrent/tt-metal/issues/56324
- vLLM v0.25.1: https://github.com/vllm-project/vllm/releases/tag/v0.25.1
- vllm-tt-plugin (rama `solar-fixes`): https://github.com/changh95/vllm-tt-plugin/commit/ba73d09d69766de64f345e84b08c36c4da51862b
