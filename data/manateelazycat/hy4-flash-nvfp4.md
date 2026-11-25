# manateelazycat/Hy4-flash-NVFP4

## Resumen

Hy4-flash NVFP4 es una compilación cuantizada del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario manateelazycat. Se trata de un transformer de arquitectura MoE (mezcla de expertos) con 144.761.604.413 parámetros almacenados en el checkpoint, pensado para generación de texto e imagen-texto a texto. Su rasgo diferencial es la cuantización NVFP4 (W4A4) aplicada a los expertos enrutados y a las tablas Engram en FP8, lo que reduce el peso del repositorio a 164,7 GB frente a los 440 GB del BF16 original y los 287 GB de la versión FP8 de Tencent.

El modelo está diseñado específicamente para ejecutarse en dos NVIDIA DGX Spark (2 x 128 GB) con vLLM y tensor parallel 2, un objetivo de despliegue muy concreto que lo aleja de los entornos de centro de datos convencionales. Incorpora además un drafter DFly para decodificación especulativa y una ventana de contexto de 262.144 tokens según la configuración de referencia empleada en las pruebas del autor.

Es relevante ahora porque demuestra que un MoE de gran tamaño puede servirse en hardware de escritorio de gama alta con memoria unificada, a costa de una integración con vLLM todavía no publicada oficialmente (el soporte de Hy4-flash es un pull request abierto) y de una licencia restrictiva de Tencent. La información disponible sobre idiomas y benchmarks comparativos es limitada, y las cifras de rendimiento proceden únicamente de las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (sparse MLA), sink de atención aprendible, tablas Engram y torre de visión |
| Parametros totales | 144.761.604.413 (recuento de safetensors; el autor advierte que el empaquetado NVFP4 hace que Hugging Face cuente la mitad de los parámetros reales de los expertos) |
| Parametros activos | 16 expertos activos de 512 por capa (no se indica el total de parámetros activos) |
| Longitud de contexto | 262.144 tokens (configuración de referencia del autor) |
| Tipos de cuantizacion | NVFP4 (E2M1, W4A4) en expertos enrutados, experto compartido y MLP denso de la capa 0; FP8 E4M3 con escala por fila en tablas Engram; BF16 en atención, indexador disperso, router, proyecciones latentes MoE, proyecciones Engram, embeddings, lm_head, torre de visión y drafter DFly2 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors (tipos U8, F8_E4M3, BF16, F32, I32), config.json, tokenizer y chat template originales de Tencent, hf_quant_config.json de ModelOpt |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos enrutados por capa de los que se activan 16, un experto compartido y un MLP denso en la capa 0. La atención emplea un mecanismo MLA disperso con un sink de atención aprendible, que el autor integra en el kernel sparse MLA SM120 de FlashInfer. Incorpora además tablas Engram (capas 2, 12, 22 y 32; 165 millones de filas de 96 elementos cada una), que son tablas de búsqueda por hash y no multiplicaciones matriciales, y un drafter DFly2 para decodificación especulativa. El checkpoint incluye una torre de visión, coherente con su pipeline image-text-to-text.

Esta compilación no entrena el modelo: parte de los pesos BF16 de `tencent/Hy4-flash` (versión del 17 de noviembre de 2026) y aplica cuantización con NVIDIA ModelOpt 0.48.0 usando `NVFP4_DEFAULT_CFG` con reglas BF16 para las partes no cuantizadas. La calibración emplea la mezcla `nemotron-post-training-v3` de ModelOpt (conjuntos abiertos de posentrenamiento de NVIDIA para chat, ciencia, código, uso agéntico, matemáticas, SWE y texto multilingüe), con 128 muestras de hasta 2.048 tokens; las escalas de pesos NVFP4 se derivan solo de los pesos y los datos de calibración fijan las escalas de activación. Las tablas Engram se convierten en una pasada posterior a FP8 con escala por fila. El proceso se ejecutó en 8 x RTX PRO 6000 Blackwell Max-Q: 42 minutos de calibración y 5 minutos de exportación. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional y continuaciones largas, con hasta 16.384 tokens por respuesta en las pruebas del autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión incluida en BF16.
- Razonamiento con modo de pensamiento desactivable mediante `reasoning_effort: no_think`.
- Generación de código, tal y como reflejan las pruebas de decodificación con prompts de código.
- Seguimiento de instrucciones, medido con IFEval en la configuración del autor.
- Razonamiento científico y de nivel experto, medido con GPQA Diamond.
- Decodificación especulativa mediante el drafter DFly con 5 tokens de borrador.
- Soporte de contexto largo de hasta 262.144 tokens con caché KV `fp8_ds_mla`.
- Uso agéntico y multilingüe: la mezcla de calibración incluye datos de uso agéntico y texto multilingüe, aunque no se detallan los idiomas soportados ni se confirma soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Despliegue en estaciones de trabajo con dos DGX Spark: el modelo está calibrado y probado para cargarse en 104 segundos con 51,7 GiB por GPU más la mitad de las tablas Engram en memoria de host, lo que permite tener un MoE de 144.000 millones de parámetros en hardware de sobremesa.
- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana y caché KV de 6 GiB (578.000 tokens), puede mantener sesiones extensas con documentación o historiales de conversación sin truncar.
- Generación de código en local: los prompts de código alcanzan 36,5 tok/s de decodificación con 3,80 tokens aceptados por paso del drafter, adecuado para autocompletado y revisión en entornos con requisitos de privacidad.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas combinándolo con texto.
- Razonamiento científico asistido: con un 72,7 % en GPQA Diamond en la configuración del autor, es utilizable para preguntas de nivel experto en dominios técnicos, siempre con verificación humana.
- Reescritura y explicación de textos: los perfiles de decodificación de reescritura (36,1 tok/s) y explicación (25,0 tok/s) lo hacen apto para tareas de transformación de contenido por lotes.
- Evaluación y experimentación con cuantización NVFP4: sirve como referencia para investigadores que quieran medir el impacto de W4A4 en un MoE grande frente a BF16 o FP8.

## Benchmarks y rendimiento

Calidad medida por el autor con pensamiento desactivado, temperatura 0, hasta 16.384 tokens por respuesta, en dos DGX Spark:

| Benchmark | Puntuación | Intervalo 95 % | Respuestas cortadas por límite |
|---|---|---|---|
| GPQA Diamond (198) | 72,7 % | 66,1 a 78,5 | 1 |
| IFEval (541 prompts) | 83,5 % | 80,2 a 86,4 | 1 |

Rendimiento de decodificación (300 tokens de salida, mediana de 3, TP=2 sobre QSFP/RoCE, expert parallel, DFly con 5 tokens de borrador):

| Prompt | Tokens/s de decodificación | Tokens aceptados por paso DFly |
|---|---|---|
| JSON | 38,3 | 3,99 |
| Código | 36,5 | 3,80 |
| Reescritura | 36,1 | 3,79 |
| Explicación | 25,0 | 2,75 |
| Relato | 17,3 | 1,85 |

Sin el drafter, el rendimiento ronda los 15 tok/s. Por profundidad de prompt:

| Profundidad | Prefill tok/s | Decodificación tok/s, primer turno | Decodificación tok/s, segundo turno |
|---|---|---|---|
| 4K | 1.110 | 20,8 | 29,6 |
| 16K | 1.403 | 22,1 | 36,8 |
| 32K | 1.461 | 26,6 | 27,0 |

El autor no dispone de ejecuciones BF16 o FP8 de Hy4-flash en el mismo arnés de evaluación, ya que ninguna cabe en dos DGX Spark. No se han publicado resultados de benchmarks comparativos adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: 51,7 GiB por DGX Spark en el lado de GPU, más la mitad de las tablas Engram en memoria de host; con 6 GiB de caché KV (578.000 tokens) la memoria libre mínima fue de 12,5 GiB y 13,0 GiB en cada Spark.
- GPU recomendadas: dos NVIDIA DGX Spark (2 x 128 GB) con enlace QSFP (RoCE), que es el objetivo declarado del autor.
- GPU de consumo: no cabe en una GPU de consumo convencional; el requisito es memoria unificada de 128 GB por nodo. El autor calibró en 8 x RTX PRO 6000 Blackwell Max-Q, pero no documenta inferencia en esa configuración.
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:hy4-flash` (commit 77766db) y cinco modificaciones en Python del autor; tensor parallel 2 con expert parallel; la receta está en `atakann/dgx-spark-recipes` (`llm/hy4-flash-nvfp4-vllm-tp2`). No hay soporte en la versión publicada de vLLM: el soporte de Hy4-flash es el pull request vllm-project/vllm#68296, que solo acepta FP8 y requiere Hopper o Blackwell de centro de datos para la atención.
- Latencia y throughput: 38,3 tok/s en JSON y 17,3 tok/s en relato con drafter; prefill de 1.110 a 1.461 tok/s entre 4K y 32K de profundidad; carga de pesos en 104 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash NVFP4 (esta ficha) | 144,8 B (recuento safetensors) | 262.144 | NVFP4 + FP8 Engram | Tencent Hy License | Hugging Face, vLLM con parches |
| tencent/Hy4-flash BF16 | no disponible en la información | no disponible | BF16 (440 GB) | Tencent Hy License | Hugging Face |
| tencent/Hy4-flash FP8 | no disponible en la información | no disponible | FP8 (287 GB) | Tencent Hy License | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación de rendimiento con terceros queda como no disponible.

## Limitaciones y advertencias

- El soporte de Hy4-flash en vLLM es un pull request abierto (#68296) que solo acepta FP8 y exige Hopper o Blackwell de centro de datos para la atención; esta compilación NVFP4 requiere cinco modificaciones manuales en Python y no funciona con una versión publicada de vLLM.
- El autor solo ha realizado comprobaciones a nivel de pesos: 9,5 % de error relativo en expertos desquantizados y 2,6 % de error RMS relativo en las tablas Engram FP8; no hay evaluación de calidad frente a BF16 o FP8 en el mismo arnés.
- Los benchmarks GPQA Diamond e IFEval proceden de una única configuración de hardware y software, con una sola respuesta cortada por límite de tokens en cada uno; no son directamente comparables con publicaciones de terceros.
- Riesgo de alucinación inherente a un modelo de lenguaje de este tamaño; no se documentan evaluaciones de factualidad ni de sesgos.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe fuera de los idiomas presentes en la mezcla de calibración.
- Licencia Tencent Hy License: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de cualquier despliegue en producción.
- El pipeline declarado es image-text-to-text, pero no se documentan evaluaciones de capacidades de visión ni de tool calling.
- El recuento de parámetros de Hugging Face es engañoso por el empaquetado NVFP4 (dos valores de 4 bits por byte), lo que afecta a herramientas que calculan requisitos de memoria a partir de ese dato.
- El despliegue depende de memoria unificada de 128 GB por nodo; no es viable en GPU de consumo estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manateelazycat/Hy4-flash-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Recetas de despliegue en DGX Spark: https://github.com/atakann/dgx-spark-recipes
- Pull request de soporte de Hy4-flash en vLLM: https://github.com/vllm-project/vllm/pull/68296
