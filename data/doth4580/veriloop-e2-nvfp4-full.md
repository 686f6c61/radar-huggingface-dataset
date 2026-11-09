# doth4580/VeriLoop-E2-NVFP4-FULL

## Resumen

VeriLoop-E2-NVFP4-FULL es una cuantización NVFP4 del modelo VeriLoop E2 (27B), desarrollado por el Tsinghua SIGS Robot Lab como un post-entrenamiento de Qwen/Qwen3.8-27B. Este artefacto concreto lo produce el usuario doth4580 con el cuantizador offline de veloGB10, y su propósito principal es ejecutarse con el motor de inferencia veloGB10 (`gb10_inference`) sobre sistemas NVIDIA DGX Spark / GB10. Los pesos emplean el formato estándar `nvfp4-pack-quantized` de HuggingFace `compressed-tensors`, por lo que pueden cargarse en cualquier framework que lea dicho formato, aunque el checkpoint está validado y ajustado específicamente para los kernels de veloGB10.

La arquitectura subyacente es un transformer híbrido denso de la familia Qwen3.5, con 64 capas que combinan 48 capas de GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) y 16 capas de atención completa GQA, con una dimensión oculta de 5120 y una dimensión intermedia de 17408. El modelo cuenta con 27.781.427.952 parámetros totales, una longitud de contexto de 262.144 tokens y un vocabulario de 248.320 entradas. Incluye una cabeza nativa de multi-token-prediction (MTP) pensada para decodificación especulativa.

El checkpoint original incorpora una torre de visión (clase `Qwen3_5ForConditionalGeneration`), pero este artefacto cuantizado se presenta explícitamente como modelo de texto/lenguaje: la parte de visión no ha sido validada de extremo a extremo y la ruta probada es únicamente la mitad lingüística (GatedDeltaNet + GQA). Es relevante ahora porque permite desplegar un modelo de 27B con contexto de 256K en hardware GB10 de consumo profesional con un peso en disco de unos 16 GB, algo inviable con pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso Qwen3.5: 64 capas (48 GatedDeltaNet + 16 GQA completa), hidden 5120, intermediate 17408 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (`nvfp4-full`, recipe `all`: todas las GEMM en NVFP4); formato `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout `compressed-tensors` (`nvfp4-pack-quantized`), 8-bit por tag; ~16 GB en disco |

## Arquitectura y entrenamiento

El modelo base VeriLoop E2 es un post-entrenamiento de Qwen/Qwen3.8-27B sobre la arquitectura híbrida Qwen3.5. La pila lingüística combina 48 capas de GatedDeltaNet —atención lineal con estado recurrente de tamaño fijo, que evita el crecimiento cuadrático del KV cache— intercaladas con 16 capas de atención completa GQA (24 cabezas de consulta y 4 de clave/valor, `head_dim` 256). Esta mezcla busca mantener la calidad de la atención completa en puntos periódicos (cada cuarta capa) mientras reduce el coste de memoria y cómputo en contextos largos. Incorpora además una cabeza nativa de multi-token-prediction (MTP) que el motor veloGB10 puede usar para decodificación especulativa.

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otras. Tampoco se documenta el proceso de post-entrenamiento que da lugar a VeriLoop E2 a partir de Qwen3.8-27B. Lo que sí está documentado es el proceso de cuantización: se aplicó el cuantizador offline de veloGB10 con la receta `nvfp4-full`, que cuantiza todas las GEMM a NVFP4, modificando los pesos respecto al original pero manteniendo intactos el tokenizer y la plantilla de chat. El motor soporta, según su documentación, KV cache en `k8v8`, caché de prefijos, prefill en FP8 y decodificación especulativa opcional mediante un drafter DFlash2 en NVFP4.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con modo de razonamiento configurable (`--reasoning-effort`, valores como `low` en los ejemplos del autor).
- Razonamiento multi-paso con contexto largo: ventana de 262.144 tokens, apta para documentos extensos y conversaciones de muchos turnos.
- Decodificación especulativa mediante la cabeza MTP nativa y, opcionalmente, un drafter externo DFlash2 (`--spec-source dflash2`).
- Servido mediante API compatible con OpenAI (`/v1`), lo que facilita la integración en aplicaciones existentes.
- Soporte de lotes concurrentes limitado (`--max-batch 2` en la configuración probada) y caché de prefijos para reutilización de contextos repetidos.
- Capacidad de visión: el checkpoint contiene una torre de visión heredada de la familia Qwen3.5, pero no está validada para este artefacto y no debe asumirse operativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes técnicos o expedientes completos en una sola pasada y responder preguntas sobre ellos sin truncar, apoyándose en la caché de prefijos para reutilizar el documento entre consultas.
- Asistentes conversacionales de largo recorrido: el estado recurrente de GatedDeltaNet mantiene bajo el coste de memoria del KV cache en conversaciones extensas, lo que permite sesiones multi-turno prolongadas en un único GB10 con `--max-batch 2`.
- Despliegue en el borde o en laboratorio con hardware GB10: al ocupar ~16 GB en disco y ejecutarse en DGX Spark, es adecuado para prototipos y entornos de investigación donde no hay acceso a clústeres de GPU de datacenter, sirviendo la API OpenAI-compatible desde una o varias máquinas.
- Escalado horizontal por tensor parallelism: la documentación describe configuraciones TP=2 y TP=4 con reparto de pesos por red (sin copia local del modelo en los nodos), útil para servir el modelo con mayor throughput en un pequeño clúster de GB10.
- Evaluación comparativa de cuantización: al ser un artefacto NVFP4 con receta `all`, sirve para medir la degradación de calidad frente al modelo original en BF16 en tareas de razonamiento y generación, usando la misma API y plantilla de chat.
- Investigación en decodificación especulativa: la cabeza MTP y la integración con el drafter DFlash2 permiten experimentar con aceleración de decode en producción midiendo aceptación de tokens y latencia.
- Generación de código y matemáticas: no hay datos que confirmen un rendimiento específico en estas tareas para este checkpoint; solo debe emplearse si se valida previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona ejecuciones de VeloBench contra la API servida en máquinas GB10 (2026-11-08, builds de desarrollo de veloGB10 0.7.7) con muestreo de producción, pero el texto proporcionado se interrumpe antes de incluir las cifras, por lo que no se reproducen números.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso en disco es de ~16 GB en NVFP4, y a ello hay que sumar el KV cache (`k8v8`) y el estado recurrente de las capas GatedDeltaNet, que crece de forma fija y no con la longitud de contexto.
- GPU recomendadas: NVIDIA DGX Spark / GB10, el hardware para el que el pack está producido y validado. No hay información sobre otros aceleradores.
- Cabe en GPU de consumo: no hay datos que lo confirmen; el artefacto está orientado a GB10 y el motor veloGB10, no a GPUs consumer convencionales.
- Opciones de despliegue: veloGB10 (`gb10_inference`) en modo servidor con API OpenAI-compatible; topologías TP=1, TP=2 y TP=4 con nodos conectados por RoCE (opción `--rdma-dev`). Al usar formato `compressed-tensors`, en teoría puede cargarse en otros frameworks que lean `nvfp4-pack-quantized`, pero no está validado.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración probada usa `--max-batch 2`, `--max-tokens 65536`, `--fp8-prefill on` y `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| VeriLoop-E2-NVFP4-FULL (este) | 27,78B | 262.144 | NVFP4 (`nvfp4-full`) | Apache-2.0 | Optimizado para veloGB10 / GB10; vision no validada |
| tsinghua-sigs-robot-lab/VeriLoop-E2 | no disponible | no disponible | BF16 (presumible, no confirmado) | Apache-2.0 | Modelo original sin cuantizar; misma familia y post-entrenamiento |
| Qwen/Qwen3.8-27B | ~27B (no confirmado en la informacion) | no disponible | no disponible | no disponible | Modelo base del que deriva VeriLoop E2 |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La torre de visión está presente en el checkpoint pero no ha sido validada de extremo a extremo; no debe usarse en producción como modelo multimodal.
- La cuantización NVFP4 con receta `all` modifica todos los pesos respecto al original; puede introducir degradación de calidad no cuantificada en esta documentación.
- El artefacto está producido y ajustado para veloGB10; su uso en otros frameworks que lean `compressed-tensors` es posible por formato, pero no está probado ni soportado por el autor.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación; debe evaluarse empíricamente antes de desplegar.
- El lote concurrente probado es de 2 (`--max-batch 2`); no se documenta comportamiento con cargas mayores.
- Aunque la licencia es Apache-2.0 (heredada del modelo original), el uso comercial requiere verificar las condiciones del modelo base Qwen3.8-27B y del proyecto veloGB10, cuyas licencias no se detallan aquí.
- El modelo se distribuye sin garantías y con solo 60 descargas y 1 like en el momento de la consulta; es un artefacto de nicho sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/VeriLoop-E2-NVFP4-FULL
- Modelo original: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Licencia del modelo original: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2/blob/main/LICENSE
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Drafter DFlash2 NVFP4: https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED
