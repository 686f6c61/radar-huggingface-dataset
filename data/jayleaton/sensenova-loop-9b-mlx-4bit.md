# jayleaton/SenseNova-Loop-9B-MLX-4bit

## Resumen

SenseNova-Loop-9B-MLX-4bit es una cuantización de 4 bits del modelo multimodal SenseNova-Loop-9B, publicada por el usuario jayleaton y pensada exclusivamente para su ejecución en Apple Silicon mediante el motor TensorFold. No es un modelo nuevo: es una conversión del checkpoint BF16 original de SenseNova a códigos afines MLX de 4 bits (grupo 64), con la torre de visión conservada en BF16. El resultado ocupa 5,98 GB en disco, lo que permite servir un modelo de 9.412.959.856 parámetros en Macs de 16 GB o más.

La relevancia de esta ficha está en su naturaleza experimental: el modelo base es un transformer con bucles (looped transformer) en el que las capas físicas 4-27 se ejecutan dos veces, produciendo 56 ejecuciones a partir de 32 conjuntos de pesos, todo ello envuelto en una arquitectura de dos flujos denominada mHC (multi-head connection). Esta estructura no es compatible con transformers estándar, vLLM, llama.cpp, mlx-lm ni exllamav3, por lo que requiere TensorFold con la serie de parches del recetario del autor.

El modelo cubre texto e imagen (pipeline image-text-to-text), soporta tool calling con gramáticas restringidas y modo de razonamiento activado por defecto. La licencia es Apache 2.0. Al tratarse de una cuantización comunitaria con cero descargas y cero likes en el momento de la consulta, debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer multimodal con mHC (dos flujos); 32 conjuntos de pesos, 56 ejecuciones (capas físicas 4-27 ejecutadas dos veces) |
| Parametros totales | 9.412.959.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 33.024 tokens en perfil de texto; 4.096 tokens en perfil de visión |
| Tipos de cuantizacion | 4 bits afín MLX, grupo 64, escalas y sesgos en BF16; torre de visión en BF16; routers mHC en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 archivos, 5.982.934.074 bytes en total) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles: en lugar de apilar capas únicas, reutiliza los conjuntos de pesos de las capas físicas 4 a 27 en dos pasadas, de modo que 32 conjuntos de pesos generan 56 ejecuciones efectivas. Esta recursión se envuelve en una estructura de dos flujos llamada mHC, cuyos routers se mantienen en FP32 en esta cuantización para preservar la estabilidad numérica. El modelo es multimodal, con una torre de visión separada que en este repositorio se conserva íntegramente en BF16 (333 tensores bajo el prefijo `vision_tower.*`) y solo se carga al servir con la opción `--vision`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La conversión a 4 bits se realizó con el script `sensenova_loop_mlx.py` incluido en la serie Metal del recetario, partiendo del checkpoint BF16 en la revisión `329a65f701ba8c48b73c30d0cbaa6f0449733673`. Los pesos de normalización RMSNorm se transforman a la forma `1 + w` (centrados en cero) y los códigos de texto resultantes son, según el autor, idénticos byte a byte a los del árbol de 4 bits con el que se ejecutaron los benchmarks de tarea en CUDA. El archivo `tensorfold-convert.json` registra los metadatos de la conversión.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explícito: el modo thinking está activado por defecto y puede desactivarse enviando `"chat_template_kwargs": {"enable_thinking": false}`.
- Generación de código y edición de código, evaluada en HumanEval+ y MBPP+.
- Razonamiento matemático, evaluado en GSM8K y MATH con thinking activado y desactivado.
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión en BF16, una imagen por petición.
- Tool calling y function calling con gramáticas restringidas mediante `libtfgrammar.dylib` (xgrammar v0.2.8), incluyendo `tool_choice: "required"`, funciones con nombre y `response_format`.
- Borradores de copia (copy drafts) para decodificación especulativa sobre texto re-citado, edición de código y prosa.
- Servicio concurrente: el perfil por defecto arranca con `--parallel 4` y contexto de 33.024 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local para desarrolladores con Mac: el modelo puede generar y editar código con 76,8% en HumanEval+ y 63,2% en MBPP+, y los copy drafts aceleran la edición de código a 87 tok/s en un M5 Ultra, lo que lo hace utilizable en un flujo de trabajo interactivo sin conexión.
- Automatización de agentes con tool calling: gracias al soporte de gramáticas xgrammar y a `tool_choice: "required"`, se puede forzar al modelo a emitir llamadas a funciones válidas en pipelines de automatización, con 10/10 casos superados en la prueba de herramientas del autor y 4/4 con cuatro chats simultáneos.
- Análisis de documentos e imágenes en el dispositivo: con el perfil `--vision` y contexto de 4.096 tokens, el modelo procesa una imagen por petición junto a texto, adecuado para extracción de información de capturas, diagramas o formularios en entornos con requisitos de privacidad.
- Razonamiento matemático asistido: con thinking activado alcanza 283/300 en GSM8K y 182/200 en MATH, suficiente para tutoría o verificación de cálculos en aplicaciones educativas locales.
- Prototipado de investigación sobre transformers con bucles: al ser una de las pocas implementaciones ejecutables de un looped transformer cuantizado, sirve para estudiar el comportamiento de la recursión de capas y del mHC en hardware de consumo.
- Despliegue en Macs de 16 GB: con un pico de memoria de 7,60 GiB a 4k de contexto y 9,13 GiB a 32k, el modelo cabe en equipos de gama media de Apple Silicon, lo que permite ofrecer asistencia conversacional local en estaciones de trabajo modestas.
- Generación de borradores y reescritura de texto: los copy drafts logran 362 tok/s en re-citado y 94 tok/s en prosa, con 16/16 pares de respuesta idénticos token a token respecto a la decodificación sin borradores, útil para tareas de reescritura masiva.

## Benchmarks y rendimiento

Resultados de tarea de los mismos códigos de 4 bits en un DGX Spark con el motor CUDA v5 (`--parallel 4 --context 33024`, copy drafts activados), comparados con el árbol de 8 bits bajo el mismo arnés:

| Benchmark | 4 bits (este modelo) | 8 bits |
|---|---|---|
| HumanEval+ | 126/164 (76,8%) | 130/164 (79,3%) |
| MBPP+ | 239/378 (63,2%) | 253/378 (66,9%) |
| GSM8K, thinking off / on | 282/300 / 283/300 | 284/300 / 285/300 |
| MATH, thinking off / on | 171/200 / 182/200 | 175/200 / 183/200 |
| BFCL | 116/200 (58,0%) | 127/200 (63,5%) |

Rendimiento medido en Mac Studio M5 Ultra (96 GB):

| Métrica | Valor |
|---|---|
| Decodificación, drafts off | 59,5-60,0 tok/s (un chat) |
| Prefill en frío, 512 / 2k / 8k / 32k tokens | 2.709 / 2.752 / 2.717 / 2.461 tok/s |
| TTFT para prompt de 14 tokens | 0,019 s |
| Copy drafts, un chat | 362 tok/s re-cita, 87 tok/s edición de código, 94 tok/s prosa |
| Puerta de tarea, 64 tokens greedy vs transformers | código 64/64, razonamiento 64/64, prosa 19/64 |
| Herramientas (con `libtfgrammar`) | 10/10 casos, 4/4 con cuatro chats |
| Imágenes | torre de visión dentro del ruido BF16 (coseno 0,99869) |

Rendimiento por equipo:

| Mac | Decodificación | Prefill | Memoria pico |
|---|---|---|---|
| Mac de 16 GB (límite de working-set sobre M5 Ultra) | 58 tok/s | 2.719 tok/s a 8k | 7,60 / 7,82 / 9,13 GiB a 4k / 8k / 32k |
| MacBook Pro M4 Pro, 24 GB | 26,7 tok/s | ~230 tok/s | no disponible |

Top-1 forzado por profesor sobre 64 posiciones frente a BF16 (prosa / código / razonamiento): 57 / 62 / 61.

## Requisitos de hardware

- VRAM/memoria unificada: 7,60 GiB a 4k de contexto, 7,82 GiB a 8k y 9,13 GiB a 32k en el perfil de texto; la torre de visión añade 0,85 GiB solo al servir con `--vision`.
- Equipos soportados: Macs de 16 GB o más (M-series). Los Macs de 8 GB no están soportados.
- Equipos probados: Mac Studio M5 Ultra de 96 GB (texto, imágenes, herramientas y copy drafts), MacBook Pro M4 Pro de 24 GB (decodificación) y el límite de working-set de un Mac de 16 GB simulado sobre el M5 Ultra.
- GPU no Apple: no soportadas por estos archivos. Para DGX Spark el autor recomienda el árbol de 8 bits `SenseNova-Loop-9B-MLX-8bit-vision`, ya que 4 bits mantiene el top-1 en 220 de 249 posiciones frente a 246 del 8 bits.
- Motor de despliegue: exclusivamente TensorFold con la serie de parches `patches/metal` (0001-0044) y el commit `6d0a128b0` del motor. No funciona con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3.
- Requisitos de compilación: Xcode con el SDK de macOS y toolchain de Metal, además de Zig 0.17.0.
- Throughput y latencia: ver la sección de benchmarks (59,5-60 tok/s de decodificación en M5 Ultra, 26,7 tok/s en M4 Pro).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval+ | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-4bit (este) | 9,41 B | 33.024 (texto) / 4.096 (visión) | 76,8% | 282-283/300 | Apache 2.0 | Solo TensorFold en Apple Silicon |
| SenseNova-Loop-9B-MLX-8bit-vision | no disponible | no disponible | 79,3% | 284-285/300 | Apache 2.0 | TensorFold; recomendado en DGX Spark |
| SenseNova-Loop-9B (BF16 original) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Checkpoint de referencia |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; deben leerse las known issues del recetario antes de confiar en él.
- Incompatible con todo el ecosistema estándar de inferencia (transformers, vLLM, llama.cpp, mlx-lm, exllamav3); requiere compilar TensorFold y aplicar 44 parches de Metal.
- Sin soporte en Macs de 8 GB; en DGX Spark pierde precisión frente al árbol de 8 bits (top-1 en 220 de 249 posiciones).
- Una sola imagen por petición en el perfil de visión, con contexto reducido a 4.096 tokens.
- La puerta de tarea muestra solo 19/64 en prosa frente a la referencia, atribuido por el autor al ruido BF16/FP32 de la propia referencia; conviene validar la calidad de generación de prosa en el caso de uso concreto.
- BFCL de 58,0% en 4 bits frente a 63,5% en 8 bits: degradación apreciable en tool calling que puede afectar a agentes en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe sin evaluación propia.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización comunitaria con cero descargas y cero likes, no hay validación externa de su fidelidad más allá de las mediciones del autor.
- El tool calling con gramáticas requiere colocar `libtfgrammar.dylib` junto al servidor y compilar xgrammar v0.2.8 con `zig build grammar`.

## Enlaces

- Hugging Face: https://huggingface.co/jayleaton/SenseNova-Loop-9B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Árbol de 8 bits recomendado para DGX Spark: https://huggingface.co/jayleaton/SenseNova-Loop-9B-MLX-8bit-vision
- Recetario TensorFold: https://github.com/jayleaton/sensenova-loop9b-tensorfold
- Known issues: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/KNOWN-ISSUES.md
- Documentación Metal: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/METAL.md
- Parches Metal: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/metal
- Motor TensorFold (commit probado): https://github.com/ashhart/TensorFold/commit/6d0a128b0cde35aa091bda933577cfced3519b8a
