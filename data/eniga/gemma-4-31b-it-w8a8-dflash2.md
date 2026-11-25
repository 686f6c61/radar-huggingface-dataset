# eniga/gemma-4-31b-it-w8a8-dflash2

## Resumen

Gemma 4 31B it W8A8 + DFlash2 es un contenedor de inferencia cuantizado a int8 del modelo multimodal google/gemma-4-31B-it, publicado por el usuario eniga. No es un modelo entrenado desde cero: combina los pesos del trunk de Gemma 4 31B en cuantización W8A8 (activaciones y pesos int8) con el especulador DFlash2 de Red Hat AI (RedHatAI/gemma-4-31B-it-speculator.dflash2) fusionado en el mismo fichero. El resultado se empaqueta en formato Radiance, un servidor de inferencia para GPUs AMD que no carga en transformers, vLLM ni llama.cpp.

La relevancia del artefacto es práctica: demuestra decodificación especulativa de 5 capas con 7 tokens de borrador por pasada sobre hardware AMD ROCm, alcanzando 148,3 t/s en decodificación single-stream en dos Radeon AI PRO R9700, frente a 36,0 t/s sin drafter. El trunk mantiene el pipeline image-text-to-text, por lo que acepta entradas de texto e imagen, y conserva en bf16 el embedding, todas las normalizaciones y la torre de visión.

El fichero pesa 39,6 GB (36,86 GiB de pesos) y se sirve con Radiance 2.2.0 mediante el plugin de arquitectura `gemma4_bf16`. La licencia declarada es Apache-2.0, heredada de los pesos originales de Google y del especulador de Red Hat AI. El modelo no ha publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; solo se documentan métricas de rendimiento de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4) con especulador DFlash2 de 5 capas fusionado; plugin `gemma4_bf16` en Radiance |
| Parametros totales | 31B (trunk, según denominación del modelo base); parámetros del drafter no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 200.000 tokens configurado en `max-model-len`; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | W8A8 int8 simétrico en lineales del trunk (escala f16 por fila y bloque de 128 en K); lm_head int8 con escala bf16; drafter int8 con rotación Hadamard de 128 (`fwht128`); embedding, norms y torre de visión en bf16; KV cache i8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor Radiance (`.rad`); no compatible con safetensors, GGUF, transformers, vLLM ni llama.cpp |

## Arquitectura y entrenamiento

El trunk es un transformer denso multimodal de 31B parámetros (Gemma 4 31B instruct) que procesa texto e imágenes. Sobre él se aplica una cuantización post-entrenamiento W8A8: los lineales del trunk usan códigos int8 simétricos con una escala f16 por cada fila y bloque de 128 a lo largo de la dimensión K, y las activaciones se sirven también en int8 por fila. El redondeo es round-to-nearest sin datos de calibración; el peor peso del trunk alcanza un error relativo de Frobenius de 0,75 %. No se ha medido divergencia KL respecto a bf16.

El componente diferencial es el especulador DFlash2 de Red Hat AI: 5 capas que proponen 7 tokens de borrador por pasada. Sus lineales se cuantizan a int8 con rotación Hadamard de 128 anchos (`fwht128`) y escala bf16 por fila y bloque de 128; sus convoluciones y el selector de candidatos permanecen en bf16. Los borradores se verifican contra el trunk int8, de modo que el drafter afecta únicamente a la velocidad y nunca al contenido generado. La receta de conversión (`gemma4-31b-w8a8-df2.recipe`) deriva de las recetas `gemma4-31b-dense-bf16-q8-df.recipe` y `gemma4-31b-dense-bf16-w4a8-df2.recipe` incluidas en Radiance 2.2.0. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: el modo thinking está activado por defecto y se devuelve en el campo `reasoning_content`.
- Procesamiento de imágenes: pipeline image-text-to-text con torre de visión conservada en bf16.
- Generación de código: el rendimiento del drafter es especialmente alto en categorías code (150,6 t/s), file_edit (178,2 t/s) y json (183,7 t/s), lo que sugiere uso intensivo en tareas de programación.
- Matemáticas: 178,5 t/s en decodificación para la categoría math con DFlash2.
- Decodificación especulativa: 7 tokens de borrador por pasada, con una media de 5,2 tokens confirmados por paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking sugiere capacidad de razonamiento extendido.
- Capacidades multilingües: no disponible.
- Capacidad de contexto largo: ventana configurable de hasta 200.000 tokens con KV cache i8 y prefix cache de 4.096 MiB.

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en pipelines de CI/CD o entornos de desarrollo para autocompletado, revisión y edición de ficheros, aprovechando su throughput de 178,2 t/s en file_edit y 183,7 t/s en json sobre dos R9700. La verificación por el trunk int8 garantiza que la decodificación especulativa no altera el código generado.
- Generación de JSON estructurado a alta velocidad: con 183,7 t/s en la categoría json, es adecuado para extracción de datos, rellenado de formularios y APIs que devuelven objetos estructurados, donde la latencia por token es crítica.
- Resumen de documentos largos: la ventana de hasta 200.000 tokens y el throughput de 158,5 t/s en summarization permiten procesar informes extensos, contratos o transcripciones en una sola pasada, con prefill de 2.701 t/s para prompts de 1.554 tokens.
- Análisis de documentos con imagen: al conservar la torre de visión en bf16 y aceptar entradas image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales.
- Razonamiento matemático asistido: con 178,5 t/s en math y modo thinking activado, es viable para tutoría, verificación de cálculos y resolución de problemas paso a paso en entornos interactivos.
- Atención al cliente multi-turno: el prefix cache de 4.096 MiB y el rendimiento agregado de 456,0 t/s con 8 peticiones concurrentes permiten servir conversaciones simultáneas con contexto compartido, manteniendo TTFT p50 de 98 ms.
- Despliegue en infraestructura AMD: organizaciones con GPUs Radeon AI PRO o Instinct pueden servir el modelo sin depender de CUDA, usando Radiance como servidor compatible con ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son métricas de inferencia medidas por el autor en dos AMD Radeon AI PRO R9700 (32 GB, power cap 210 W, offset GFX -70 mV, PCIe 5.0 x8, sin peer-to-peer), con `tp: 2`, KV i8 y Radiance 2.2.0, usando BetterBench con 20 pasadas por categoría, temperatura 0,7, top-p 0,95, top-k 20 y prefix cache fría.

| Métrica | Sin drafter | DFlash v1 | DFlash2 |
|---|--:|--:|--:|
| Decodificación single-stream (ponderada) | 36,0 t/s | 124,0 t/s | 148,3 t/s |
| Agregado 1 concurrente | 35,5 t/s | 108,6 t/s | 136,5 t/s |
| Agregado 2 concurrentes | 67,5 t/s | 183,4 t/s | 233,3 t/s |
| Agregado 4 concurrentes | 124,9 t/s | 226,0 t/s | 385,5 t/s |
| Agregado 8 concurrentes | 208,3 t/s | 330,6 t/s | 456,0 t/s |
| TTFT p50 | 143 ms | 98 ms | 98 ms |

Decodificación single-stream mediana por categoría (t/s):

| Categoría | Sin drafter | DFlash v1 | DFlash2 |
|---|--:|--:|--:|
| prose | 35,9 | 79,1 | 106,7 |
| chat | 36,4 | 74,8 | 107,5 |
| reasoning | 35,9 | 96,5 | 129,6 |
| code | 35,8 | 141,8 | 150,6 |
| summarization | 36,4 | 109,3 | 158,5 |
| file_edit | 35,9 | 160,8 | 178,2 |
| math | 35,9 | 173,0 | 178,5 |
| json | 36,1 | 155,3 | 183,7 |

Prefill con prefix cache fría (idéntico con y sin drafter):

| Tokens de prompt | TTFT p50 | Prefill t/s |
|--:|--:|--:|
| 1.554 | 0,58 s | 2.701 |
| 6.025 | 2,18 s | 2.764 |
| 12.061 | 4,55 s | 2.653 |
| 24.050 | 10,08 s | 2.388 |
| 48.029 | 24,23 s | 1.984 |

El cabezal asistente propio de Google (google/gemma-4-31B-it-assistant) alcanzó 84 t/s en una prueba más corta de cinco prompts, frente a 107 t/s de DFlash v1 en los mismos prompts.

## Requisitos de hardware

- VRAM estimada: 26,24 GiB por tarjeta con `tp: 2`, incluyendo pesos, KV cache i8 y prefix cache. El fichero completo ocupa 39,6 GB en disco (36,86 GiB de pesos).
- GPUs recomendadas: dos AMD Radeon AI PRO R9700 de 32 GB, configuración validada por el autor. No se documentan pruebas en otras GPU AMD (Instinct MI300X, MI250) ni en NVIDIA.
- GPU de consumo: no cabe en una GPU de consumo convencional de 24 GB en esta configuración; se requieren al menos dos tarjetas de 32 GB o una solución con mayor VRAM no documentada.
- Opciones de despliegue: exclusivamente Radiance 2.2.0 con el plugin `gemma4_bf16`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: TTFT p50 de 98 ms con drafter; prefill de 2.701 t/s para 1.554 tokens y 1.984 t/s para 48.029 tokens; decodificación de 148,3 t/s single-stream y 456,0 t/s con 8 peticiones concurrentes.
- Carga del modelo: 7,3 s desde NVMe con `tp: 2`.
- Configuración de servicio de referencia: `max-num-seqs: 8`, `max-model-len: 200000`, `prefix-cache-mib: 4096`, `num-speculative-tokens: auto` (profundidad entrenada del drafter, 7), temperatura 1,0, top-p 0,95, top-k 64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput single-stream | Licencia | Disponibilidad |
|---|---|--:|--:|---|---|
| eniga/gemma-4-31b-it-w8a8-dflash2 | 31B (trunk) + drafter 5 capas | 200.000 tokens | 148,3 t/s (2× R9700) | Apache-2.0 | Radiance únicamente |
| google/gemma-4-31B-it (bf16) | 31B | No disponible | No disponible | Apache-2.0 | transformers, vLLM, llama.cpp |
| google/gemma-4-31B-it + assistant head | 31B + cabezal asistente | No disponible | 84 t/s (prueba corta, 2× R9700) | Apache-2.0 | Radiance con drafter |
| RedHatAI/gemma-4-31B-it-speculator.dflash2 (solo drafter) | 5 capas | No aplica | No aplica (requiere trunk) | Apache-2.0 | Radiance |
| z-lab/gemma-4-31B-it-DFlash (DFlash v1) | Drafter v1 | No aplica | 124,0 t/s con el mismo trunk | No disponible | Radiance |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de calidad frente a otros modelos de 30B. El contenedor de eniga es el único que integra trunk cuantizado y DFlash2 en un solo fichero.

## Limitaciones y advertencias

- Formato propietario: el fichero `.rad` solo se carga en Radiance 2.2.0 con el plugin `gemma4_bf16`; no funciona en transformers, vLLM ni llama.cpp, lo que limita la portabilidad y obliga a usar el stack de Radiance.
- Dependencia de hardware AMD: las métricas publicadas corresponden exclusivamente a dos Radeon AI PRO R9700 con ROCm; el rendimiento en otras GPU AMD o en NVIDIA no está documentado.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de alucinación para esta cuantización; el error de Frobenius de 0,75 % en el peor peso no garantiza equivalencia funcional con bf16, y no se ha medido divergencia KL.
- Modo thinking por defecto: con `max_tokens` cortos, la generación puede consumirse íntegramente en el razonamiento y no producir respuesta final, lo que exige ajustar los límites de tokens en producción.
- Idiomas no declarados: la model card no especifica la cobertura lingüística; el comportamiento en castellano u otros idiomas distintos del inglés no está verificado para esta cuantización.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; se heredan los riesgos del modelo base Gemma 4 31B, no analizados aquí.
- Licencia: Apache-2.0 para trunk y drafter según la model card, pero los términos del modelo base de Google y del especulador de Red Hat AI siguen aplicándose; conviene revisar ambas model cards antes de uso comercial.
- Configuración de decodificación específica: las métricas se obtuvieron con temperatura 1,0, top-p 0,95 y top-k 64; variar estos parámetros puede alterar tanto la calidad como la tasa de aceptación del drafter.
- Sin soporte de tool calling documentado: no se confirma function calling ni uso agéntico, lo que limita su adopción en pipelines que dependan de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eniga/gemma-4-31b-it-w8a8-dflash2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Especulador DFlash2 de Red Hat AI: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.dflash2
- Cabezal asistente de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Especulador DFlash v1 de z-lab: https://huggingface.co/z-lab/gemma-4-31B-it-DFlash
- Servidor Radiance: https://codeberg.org/StillDeadcode/radiance
- Receta de conversión: `gemma4-31b-w8a8-df2.recipe` (incluida en el repositorio del modelo)
