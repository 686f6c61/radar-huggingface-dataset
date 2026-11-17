# gpillon/Qwen3.8-27B-trellis-2.8bpw-ignis

## Resumen

Qwen3.8-27B-trellis-2.8bpw-ignis es un artefacto de cuantización del modelo Qwen/Qwen3.8-27B, empaquetado por el desarrollador gpillon para su propio motor de inferencia, ignis. No se trata de un modelo entrenado desde cero ni de un checkpoint estándar de Transformers: es un contenedor propietario en formato `.ninfer` v2 que solo ignis puede leer, y que comprime el cuerpo del modelo a 2,7942 bits por peso para que un modelo de 27B quepa en tarjetas gráficas con menos de 14 GiB de VRAM (RTX 5070, familia RTX 4070 de 12 GB, RTX 3060 12 GB, RTX 3080 Ti).

El objetivo declarado es llevar un modelo de 27B a la clase de tarjetas de 12 GB manteniendo una ventana de contexto de hasta 131.072 tokens y velocidades de decodificación cercanas a los 294 tok/s en una RTX 5090 limitada artificialmente a 12 GiB. El artefacto incluye el cuerpo cuantizado, la cabeza de salida en 4 bits, el módulo drafter DFlash2, la cabeza MTP de 8 bits, la torre de visión, los embeddings, las normas y los parámetros Gated DeltaNet, además del tokenizador y la plantilla de chat.

Es relevante ahora por dos motivos: primero, porque demuestra una ruta técnica concreta para servir modelos de gran tamaño en hardware de consumo mediante cuantización extrema combinada con decodificación especulativa; segundo, porque el propio autor advierte que todas las cifras se midieron en una RTX 5090 con presupuesto de 12 GiB y que ninguna tarjeta real de 12 GB ha ejecutado todavía este archivo, por lo que el contexto efectivo es una extrapolación aritmética y no una medición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Gated DeltaNet y torre de visión (heredada de Qwen3.8-27B); cuerpo cuantizado con optimizador de asignación de exllamav3 |
| Parametros totales | 27B (modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 131.072 tokens (perfil `rtx-12gb`, una sola lane) |
| Tipos de cuantizacion | 2,7942 bits por peso en el cuerpo (K=2 en 72 matrices, K=3 en 287, K=4 en 36, K=5 en 6, sobre 401 matrices); cabeza de salida en 4 bits; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v2 (contenedor propietario de ignis; no es safetensors, GGUF ni EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer con componentes Gated DeltaNet y una torre de visión, según se deduce de los parámetros que el artefacto conserva sin cuantizar (embeddings, normas, parámetros Gated DeltaNet y torre de visión). Este repositorio no entrena nada: es una conversión del checkpoint base mediante ExLlamaV3 1.5.3, aplicando la receta propia de ignis denominada `ig28a`, que emplea el optimizador de asignación `sc_optimize.py` de exllamav3 para asignar un entero K entre 2 y 5 a cada matriz, con el objetivo de mantener los pesos de dispositivo del ámbito de texto por debajo de 9,2 GB.

La calibración se realizó con la traza pública del artefacto de 16 GB del mismo autor (gpillon/Qwen3.8-27B-trellis-3bpw-ignis). El resultado pesa 625.213.440 bytes menos que ese artefacto de 16 GB. Además del cuerpo cuantizado, el paquete incluye el módulo drafter DFlash2 y la cabeza MTP de 8 bits, que habilitan decodificación especulativa: el servidor ignis usa la MTP con ventana 7 para acelerar la decodificación greedy. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque esos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imágenes mediante la torre de visión incluida, con hasta 4.096 tokens de visión por imagen y la torre y el pool de embeddings en RAM del host, de modo que sin imagen en vuelo la visión no consume contexto.
- Decodificación especulativa con la cabeza MTP propia (ventana 7) y el drafter DFlash2, que acelera la generación greedy.
- Reutilización de prompt entre peticiones, según se indica que la incluye el binario de ignis.
- Guarda contra bucles de razonamiento, incluida en el servidor ignis.
- Servido mediante API compatible con OpenAI en `/v1` y Playground web en `/ui/`.
- Métricas Prometheus expuestas por el servidor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a agentes de programación en estaciones de trabajo con GPU de 12 GB: el perfil `rtx-12gb` está diseñado explícitamente para la carga que genera un agente de código, con una sola lane de decodificación y contexto de hasta 131.072 tokens, lo que permite mantener conversaciones largas con el repositorio en contexto sin salir de la VRAM de una RTX 4070 o RTX 3060 de 12 GB.
- Servicio local compatible con OpenAI para herramientas que ya hablan el protocolo: al exponer `/v1`, se puede apuntar un cliente existente (por ejemplo, un IDE con integración OpenAI) al servidor ignis en `http://127.0.0.1:8000/v1` sin adaptar el código del cliente.
- Procesamiento de documentación con imágenes en hardware de consumo: la torre de visión se mantiene en RAM del host y solo ocupa contexto cuando hay una imagen en vuelo, de modo que se pueden intercalar capturas o diagramas en conversaciones largas sin penalizar el presupuesto de contexto en reposo.
- Evaluación de cuantización extrema en investigación: el artefacto publica la divergencia KL frente a BF16 (0,0431 frente a 0,0418 del artefacto de 16 GB, es decir, 1,03x), lo que permite estudiar el coste de bajar de 3 a 2,8 bits por peso en un modelo de 27B con un punto de comparación directo.
- Despliegue en contenedor en entornos con GPU única: se ofrece una imagen `linux/amd64`, y en contenedor el servidor descarga el artefacto sin preguntar, lo que simplifica la puesta en marcha en máquinas efímeras o de laboratorio.
- Reproducción de mediciones y reporte de resultados: el autor pide explícitamente informes en el issue gpillon/ignis#639 sobre el comportamiento en tarjetas reales de 12 GB, por lo que el artefacto sirve como banco de pruebas para validar las extrapolaciones de contexto y velocidad.
- Prototipado de asistentes con decodificación especulativa: la combinación de MTP con ventana 7 y drafter DFlash2 permite medir en local el impacto de la decodificación especulativa sobre un modelo de 27B cuantizado a menos de 3 bits por peso.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificación, una lane, MTP ventana 7, greedy, contexto 8K | 294 tok/s | RTX 5090 limitada a 12 GiB |
| Decodificación, misma configuración, contexto 64K | 251 tok/s | RTX 5090 limitada a 12 GiB |
| Decodificación, misma configuración, contexto 130K | 228 tok/s | RTX 5090 limitada a 12 GiB |
| Primer token, prompt frío de 8K | 2,5 s | RTX 5090 limitada a 12 GiB |
| Primer token, prompt frío de 64K | 21,5 s | RTX 5090 limitada a 12 GiB |
| Contexto máximo, una lane, dentro de 12 GiB | 131.072 tokens | RTX 5090 limitada a 12 GiB |
| Divergencia KL frente a BF16 | 0,0431 (1,03x frente al artefacto de 16 GB, que da 0,0418) | RTX 5090 limitada a 12 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Todas las cifras anteriores proceden de una RTX 5090 con presupuesto de VRAM de 12 GiB; el autor indica que ninguna tarjeta real de 12 GB ha ejecutado este archivo y que el contexto obtenido en una tarjeta real es aritmética sobre las líneas medidas del plan, no una medición.

## Requisitos de hardware

- VRAM: clase de tarjeta con menos de 14 GiB de memoria total; los pesos de dispositivo del ámbito de texto se mantienen por debajo de 9,2 GB, con un headroom configurado de 512 MiB y un chunk de prefill de 512.
- GPU objetivo declaradas: RTX 5070, familia RTX 4070 de 12 GB, RTX 3060 12 GB y RTX 3080 Ti (arquitecturas Blackwell, Ada y Ampere).
- Cabe en GPU de consumo: sí, en las tarjetas de 12 GB enumeradas, según el diseño del perfil `rtx-12gb`; no hay medición real en ninguna de ellas todavía.
- Despliegue: exclusivamente mediante ignis (servidor de inferencia compatible con OpenAI), en versión posterior a 0.10.0 (0.11.0 en la guía), que incluye la entrada de catálogo `qwen3.8-27b-12g` y el perfil `rtx-12gb`. Distribución en `.zip` para Windows, `.tar.gz` para Linux e imagen de contenedor `linux/amd64`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Memoria del host: la torre de visión y el pool de embeddings residen en RAM del host.
- Latencia y throughput: ver tabla de benchmarks; medidos en RTX 5090 limitada a 12 GiB, no en tarjeta de 12 GB real.
- Ajuste dinámico: si el escritorio ya ocupa parte de la tarjeta, la carga reduce el contexto paso a paso en lugar de rechazar la petición, y `GET /v1/models` indica qué se adaptó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gpillon/Qwen3.8-27B-trellis-2.8bpw-ignis | 27B | 131.072 tokens | 2,7942 bpw | Apache 2.0 | `.ninfer` v2 | Objetivo 12 GB; KL 0,0431 |
| gpillon/Qwen3.8-27B-trellis-3bpw-ignis | 27B | no disponible | 3 bpw | Apache 2.0 | `.ninfer` | Objetivo 16 GB; 0,63 GB más pesado; KL 0,0418 |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | 27B | no disponible | NVFP4 | Apache 2.0 | `.ninfer` | Objetivo 32 GB, arquitectura Blackwell |
| Qwen/Qwen3.8-27B | 27B | no disponible | BF16 (original) | Apache 2.0 | safetensors (formato estándar de Transformers) | Modelo base sin cuantizar |

Los tres artefactos de gpillon comparten el mismo modelo base y la misma licencia; se diferencian en el presupuesto de VRAM objetivo y en el nivel de compresión. El modelo base es la referencia de calidad (BF16) frente a la cual se mide la divergencia KL. No se dispone de datos de benchmarks comparativos entre estos artefactos más allá de la divergencia KL y del tamaño en bytes.

## Limitaciones y advertencias

- No verificado en hardware real: todas las cifras de velocidad, latencia y contexto se midieron en una RTX 5090 limitada a 12 GiB; ninguna tarjeta de 12 GB ha ejecutado el archivo. El contexto en tarjeta real es una extrapolación aritmética, no una medición.
- Formato propietario: el archivo `.ninfer` v2 solo lo lee ignis. No es un checkpoint de Transformers, safetensors, GGUF ni EXL3, por lo que no se puede usar con vLLM, llama.cpp, Ollama, TGI ni otras herramientas estándar.
- Dependencia de versión: requiere una release de ignis posterior a 0.10.0 que incluya la entrada `qwen3.8-27b-12g`; hasta entonces los comandos documentados no encuentran la entrada.
- Cuantización extrema: 2,7942 bits por peso en el cuerpo implican una divergencia KL de 0,0431 frente a BF16, ligeramente superior a la del artefacto de 16 GB (0,0418). Es esperable degradación en tareas sensibles a la precisión numérica.
- Restricción de tarjeta: en la clase de 12 GB, una descarga o un cambio que nombre una entrada de 16 GB se rechaza por nombre antes de descargar o descargar de memoria.
- Idiomas soportados: no disponible en la información proporcionada; no se puede confirmar cobertura multilingüe.
- Tool calling, capacidades de agente y modo thinking: no disponibles en la información proporcionada.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada; son propiedades del modelo base y no se documentan aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y del motor ignis por separado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-16; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-2.8bpw-ignis
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto de 16 GB: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-3bpw-ignis
- Artefacto de 32 GB para Blackwell: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Repositorio de ignis: https://github.com/gpillon/ignis
- Guía para agentes de ignis: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Guía completa en Markdown (llms.txt): https://gpillon.github.io/ignis/llms.txt
- Issue de seguimiento en tarjetas de 12 GB: https://github.com/gpillon/ignis/issues/639
- Última release de ignis: https://github.com/gpillon/ignis/releases/latest
