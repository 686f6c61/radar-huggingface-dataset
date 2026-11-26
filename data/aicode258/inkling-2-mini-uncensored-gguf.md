# aicode258/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación cuantizada en formato GGUF del modelo thinkingmachines/Inkling-2-Mini, un modelo multimodal de tipo Mixture of Experts (MoE) con 26.070.385.152 parámetros totales (26,4B) y 3,4B parámetros activos, publicado por el usuario aicode258. El modelo base incorpora una arquitectura de núcleo con bucles (looped core) y acepta tanto texto como imágenes como entrada, lo que lo sitúa en la categoría de modelos image-text-to-text.

La modificación principal respecto al modelo original consiste en la aplicación de un adaptador LoRA de rango 1 sobre las 49 ubicaciones que escriben en el flujo residual: la salida de atención y los expertos enrutados de las 24 capas, además del embedding de tokens. Este adaptador se distribuye tanto de forma independiente (0,04 GB) como integrado en tres archivos GGUF ya cocinados con la edición incorporada, lo que permite su uso directo con llama.cpp.

El modelo se distribuye bajo licencia Apache-2.0 y está pensado para ejecución local mediante llama.cpp, con soporte para la arquitectura de bucles de Inkling 2 introducida en el PR #32694 de llama.cpp. La relevancia actual radica en que ofrece una variante sin censura de un modelo MoE multimodal de tamaño medio, con cuantizaciones que van desde 8,67 GB hasta 16,53 GB, lo que facilita su despliegue en hardware de consumo y en entornos de investigación que requieren menor filtrado de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo con bucles (looped core); 24 capas, 12 de ellas con pesos compartidos en bucle |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B (MoE) |
| Longitud de contexto | 32.768 tokens (configurado en los ejemplos de llama-server con `-c 32768`) |
| Tipos de cuantizacion | AD-Q4_K (16,53 GB), AD-IQ3_S (13,34 GB), AD-IQ2_M (8,67 GB), LoRA en GGUF (0,04 GB), proyector visual F16/BF16 (0,64 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts con un núcleo con bucles: de las 24 capas totales, 12 son capas con bucles que comparten sus pesos a lo largo de tres iteraciones, lo que reduce el número de parámetros únicos manteniendo la profundidad efectiva. Con 26,4B parámetros totales y 3,4B activos por token, el modelo equilibra capacidad y eficiencia computacional. La entrada es multimodal (texto e imagen) mediante un proyector visual que se distribuye sin modificar respecto al original.

La edición sin censura consiste en un adaptador LoRA de rango 1 aplicado sobre las 49 ubicaciones que escriben en el flujo residual: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card reporta métricas de fidelidad respecto al BF16 original: KLD de 0,0115 y top-1 del 95,6% para AD-Q4_K, KLD de 0,0235 y top-1 del 93,8% para AD-IQ3_S, y KLD de 0,132 y top-1 del 85,7% para AD-IQ2_M, medidas sobre un corpus neutral de 87 fragmentos de 4096 tokens.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 32.768 tokens.
- Entrada multimodal: procesamiento de imágenes junto con texto mediante el proyector visual mmproj.
- Generación de código, explicaciones y salida estructurada en JSON (verificado en las pruebas del autor con tres prompts greedosos de código, explicación y JSON).
- Soporte de decodificación especulativa mediante DSpark con un drafter Q8_0 opcional (481 MiB), que acelera la decodificación un 29,0% en A100.
- Compatibilidad con tool calling y function calling a través de la plantilla Jinja (`--jinja`) en llama-server.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.
- Ejecución local offline mediante llama.cpp, con soporte de la arquitectura de bucles de Inkling 2.

## Casos de uso

- Asistencia conversacional local sin filtrado: el modelo puede mantener diálogos multi-turno con hasta 32.768 tokens de contexto, adecuado para entornos de investigación que requieren respuestas sin las restricciones de alineación habituales.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, permite extraer información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Generación de código en pipelines locales: con soporte de tool calling y salida JSON verificada, puede integrarse en flujos de CI/CD o asistentes de programación que se ejecutan en hardware propio.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización AD-IQ2_M (8,67 GB) permite ejecutar el modelo en GPUs con 12-16 GB de VRAM, facilitando prototipado sin infraestructura en la nube.
- Investigación sobre alineación y censura: al ser una variante sin censura de un modelo base, sirve para estudiar el efecto de los filtros de contenido comparando respuestas entre ambas versiones.
- Procesamiento por lotes con decodificación especulativa: el drafter DSpark Q8_0 acelera la generación un 29,0% en A100, útil para tareas de generación masiva donde el throughput es crítico.
- Aplicaciones de visión por computador asistida: el proyector visual F16 permite tareas de descripción de imágenes, VQA y razonamiento visual en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta métricas de fidelidad de cuantización y rendimiento de decodificación:

| Metrica | AD-Q4_K | AD-IQ3_S | AD-IQ2_M |
|---|---:|---:|---:|
| KLD vs BF16 original | 0,0115 | 0,0235 | 0,132 |
| Top-1 vs BF16 original | 95,6% | 93,8% | 85,7% |
| Tamano en disco (GB) | 16,53 | 13,34 | 8,67 |

| Rendimiento en A100 SXM4 40 GB (AD-Q4_K, contexto 4096) | Decode tok/s | VRAM pico | Draft tokens aceptados |
|---|---:|---:|---:|
| DSpark desactivado | 46,5 | 16,42 GiB | — |
| DSpark Q8_0 | 59,9 (+29,0%) | 17,79 GiB | 42,7% (321/751) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,7 GB para AD-IQ2_M, 13,3 GB para AD-IQ3_S y 16,5 GB para AD-Q4_K, según el tamaño en disco de cada cuantización.
- GPU recomendadas: A100 SXM4 40 GB (medida por el autor con 16,42 GiB de VRAM pico en AD-Q4_K sin DSpark), H100 para mayor throughput, RTX 4090 (24 GB) para AD-Q4_K con margen.
- Cabe en GPU de consumo: AD-IQ2_M en GPUs de 12 GB o superiores; AD-IQ3_S en GPUs de 16 GB; AD-Q4_K en GPUs de 24 GB como la RTX 4090.
- Opciones de despliegue: llama.cpp b12600 o superior con soporte de la arquitectura de bucles de Inkling 2 (PR #32694); llama-server con `--jinja`, `-ngl 99` y `--mmproj` para el proyector visual. El drafter DSpark requiere una build de llama.cpp del PR #32218 (probado en el commit e4b1cb5).
- Latencia y throughput: 46,5 tok/s de decodificación en A100 SXM4 40 GB con AD-Q4_K y contexto de 4096 tokens; 59,9 tok/s con DSpark Q8_0 activado (+29,0%). No se dispone de datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored | 26,4B (3,4B activos) | 32.768 | Apache-2.0 | GGUF | Variante sin censura con LoRA rango 1; multimodal |
| thinkingmachines/Inkling-2-Mini | 26,4B (3,4B activos) | no disponible | Apache-2.0 | safetensors | Modelo base original, con alineación estándar |
| AtomicChat/Inkling-2-Mini-GGUF | 26,4B (3,4B activos) | no disponible | Apache-2.0 | GGUF | Cuantizaciones del base sin edición; compatible con el LoRA de este repo |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Al ser una variante sin censura, el modelo puede generar contenido que los modelos alineados rechazarían; requiere supervisión y políticas de uso adecuadas en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- La cuantización AD-IQ2_M presenta una fidelidad notablemente inferior (top-1 del 85,7%, KLD de 0,132) respecto a AD-Q4_K (top-1 del 95,6%, KLD de 0,0115), lo que puede degradar la calidad en tareas sensibles.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingüe uniforme.
- Las secuencias de tokens greedy difirieron entre los modos con y sin DSpark en los tres prompts probados, lo que indica que la decodificación especulativa puede alterar la salida.
- No se deben mezclar archivos GGUF del layout antiguo (PR #32695) con la implementación del PR #32694; la incompatibilidad puede provocar fallos.
- El uso del drafter DSpark requiere una build específica de llama.cpp (PR #32218), lo que añade complejidad al despliegue.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo sin censura en entornos regulados.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- [Hugging Face: aicode258/Inkling-2-Mini-Uncensored-GGUF](https://huggingface.co/aicode258/Inkling-2-Mini-Uncensored-GGUF)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [GGUF del base: AtomicChat/Inkling-2-Mini-GGUF](https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF)
- [Guía para ejecutar Inkling 2 Mini Uncensored en local](https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally)
- [Atomic Chat](https://atomic.chat/)
- [Repositorio Atomic-Chat en GitHub](https://github.com/AtomicBot-ai/Atomic-Chat)
- [Discord de Atomic Chat](https://discord.gg/8wGSsvmg4V)
- [Perfil de X de Atomic Chat](https://x.com/atomic_chat_hq)
- [llama.cpp PR #32694 (arquitectura de bucles de Inkling 2)](https://github.com/ggml-org/llama.cpp/pull/32694)
- [llama.cpp PR #32695 (implementación antigua)](https://github.com/ggml-org/llama.cpp/pull/32695)
- [llama.cpp PR #32218 (soporte DSpark)](https://github.com/ggml-org/llama.cpp/pull/32218)
- [Commit e4b1cb5 de llama.cpp](https://github.com/ggml-org/llama.cpp/commit/e4b1cb5318f1ac55d148be228c6347c6a94cc4c6)
- [Drafter DSpark Q8_0 (481 MiB)](https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF/resolve/main/dspark-Inkling-2-Mini-Q8_0.gguf)
