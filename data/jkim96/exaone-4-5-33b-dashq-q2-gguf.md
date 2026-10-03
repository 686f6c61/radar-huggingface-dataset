# jkim96/EXAONE-4.5-33B-DASHQ-Q2-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de 2 bits del modelo EXAONE-4.5-33B, publicada por el usuario jkim96 y generada con la herramienta DASH-Q (desarrollada por JaeminK). No se trata de un modelo nuevo, sino de una versión comprimida del modelo base LGAI-EXAONE/EXAONE-4.5-33B de LG AI Research, empaquetada en formato GGUF para su uso con llama.cpp. El objetivo es reducir el peso del modelo original (35,14 GB en Q8_0) hasta ficheros de entre 9,29 GB y 12,66 GB manteniendo un coste de perplejidad contenido.

El modelo base EXAONE 4.5 es, según LG AI Research, el primer modelo de visión-lenguaje de pesos abiertos de la compañía, con 33 000 millones de parámetros totales (incluidos 1 200 millones correspondientes al encoder visual) y construido sobre el framework EXAONE 4.0. Esta cuantización concreta es solo de texto: el vision tower no está incluido en los ficheros GGUF.

La relevancia de esta ficha está en que permite ejecutar un modelo de 33B en hardware de consumo. Los cuatro ficheros ofrecidos ocupan entre 2,25 y 3,06 bits por peso, usan únicamente tipos de tensor estándar de llama.cpp (ninguno por encima de 4 bits) y cargan en cualquier build reciente de llama.cpp. Los datos de perplejidad publicados muestran que DASH-Q mejora al cuantizador imatrix estándar de llama.cpp en tres de las cuatro variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (framework EXAONE 4.0 de LG AI Research); el modelo base incorpora un encoder visual que no se incluye en esta cuantizacion |
| Parametros totales | 33 063 614 784 (33B); el modelo base incluye 1 200 millones de parametros del encoder visual |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL (2,25 / 2,56 / 2,79 / 3,06 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia del modelo base LGAI-EXAONE/EXAONE-4.5-33B) |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es un proceso de cuantizacion post-entrenamiento aplicado al modelo base EXAONE-4.5-33B. El modelo base es un modelo de vision-lenguaje de pesos abiertos desarrollado por LG AI Research, que integra un encoder visual dedicado dentro del framework EXAONE 4.0. Cuenta con 33 000 millones de parametros totales, de los cuales 1 200 millones corresponden al encoder visual. La cuantizacion aqui descrita es text-only, ya que el vision tower no se ha incluido en los ficheros GGUF.

La innovacion tecnica destacable es el propio metodo de cuantizacion DASH-Q, que produce ficheros de 2 bits usando exclusivamente tipos de tensor estandar de llama.cpp (ningun tensor por encima de 4 bits). Segun los datos del autor, DASH-Q se compara favorablemente con el cuantizador imatrix de llama.cpp: en IQ2_XS reduce la perplejidad en WikiText-2 de 8,92 a 8,40 y en C4 de 19,65 a 19,08; en IQ2_M baja de 8,23 a 7,99 (WikiText-2) y de 18,22 a 18,12 (C4); y en Q2_K_XL pasa de 8,20 a 7,88 (WikiText-2) y de 18,33 a 18,07 (C4). La unica excepcion es IQ2_XXS, donde DASH-Q obtiene peor resultado en C4 (21,80 frente a 21,02) aunque mejor en WikiText-2 (9,54 frente a 9,70). No se detalla la composicion del dataset de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en el modelo base; esta cuantizacion conserva el pipeline text-generation.
- Razonamiento y generacion de texto de proposito general, heredados del modelo base EXAONE 4.5.
- Capacidades multimodales (vision) en el modelo base, no disponibles en esta cuantizacion porque el vision tower no se ha incluido.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible (no se detallan idiomas en la informacion proporcionada).
- Modo de razonamiento extendido (thinking): no disponible en la informacion.

## Casos de uso

- Inferencia local en hardware de consumo: con ficheros de 9,29 a 12,66 GB, el modelo cabe en GPUs de 12-16 GB de VRAM, lo que permite ejecutar un modelo de 33B en un unico equipo sin servidor dedicado.
- Despliegue en portatiles con GPU discreta o equipos de gama media: la variante IQ2_XXS (9,29 GB) puede cargarse con `-ngl 99` en tarjetas de 12 GB, habilitando asistentes de texto locales sin conexion a la nube.
- Prototipado y evaluacion de la familia EXAONE 4.5 sin descargar los 35 GB del Q8_0, util para comparar calidad frente a tamano antes de comprometerse con una configuracion de produccion.
- Servicio de generacion de texto autoalojado con llama.cpp: la compatibilidad con tipos de tensor estandar permite integrarlo en cualquier build reciente de llama.cpp, Ollama o LM Studio.
- Investigacion sobre cuantizacion: los datos de perplejidad publicados (WikiText-2 y C4) permiten estudiar el impacto de la compresion a 2 bits frente al imatrix estandar de llama.cpp en un modelo de 33B.
- Escenarios con presupuesto de VRAM ajustado donde se prioriza poder ejecutar el modelo sobre la fidelidad maxima, aceptando la degradacion de calidad propia de una cuantizacion de 2 bits.
- Evaluacion comparativa de metodos de cuantizacion (DASH-Q frente a imatrix) en tareas de generacion de texto en ingles, dado que los conjuntos de evaluacion son WikiText-2 y C4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perplejidad, con `llama-perplexity` y contexto de 2048, sobre WikiText-2 (test) y C4 (validacion, 256 x 2048 tokens):

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| Q8_0 | Referencia | 35,14 GB | 7,14 | 16,53 |
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 9,27 GB | 9,70 | 21,02 |
| IQ2_XXS | DASH-Q IQ2_XXS | 9,29 GB | 9,54 | 21,80 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 10,19 GB | 8,92 | 19,65 |
| IQ2_XS | DASH-Q IQ2_XS | 10,59 GB | 8,40 | 19,08 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 11,49 GB | 8,23 | 18,22 |
| IQ2_M | DASH-Q IQ2_M | 11,54 GB | 7,99 | 18,12 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 12,42 GB | 8,20 | 18,33 |
| Q2_K_XL | DASH-Q Q2_K_XL | 12,66 GB | 7,88 | 18,07 |

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los ficheros; hay que sumar la cache KV segun contexto y capas descargadas a GPU): IQ2_XXS 9,29 GB, IQ2_XS 10,59 GB, IQ2_M 11,54 GB, Q2_K_XL 12,66 GB.
- GPU recomendadas: para IQ2_XXS basta una GPU de 12 GB (por ejemplo RTX 3060 12 GB, RTX 4070). Las variantes de 11-13 GB requieren 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A100, H100) para cargar todas las capas en VRAM con margen para el contexto.
- Si cabe en GPU de consumo: si. Las cuatro variantes estan pensadas para ello; la mas ligera (9,29 GB) entra en tarjetas de 12 GB y las mayores en tarjetas de 16 GB.
- Opciones de despliegue: llama.cpp (comando de ejemplo del autor: `llama-cli -m EXAONE-4.5-33B-DASHQ-IQ2_M.gguf -ngl 99 -c 8192`), y por compatibilidad GGUF tambien herramientas basadas en llama.cpp como Ollama o LM Studio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizaciones del mismo modelo base:

| Variante | Tipo | Tamano | Bits/peso | WikiText-2 | C4 |
|---|---|---|---|---|---|
| DASH-Q IQ2_XXS | IQ2_XXS | 9,29 GB | 2,25 | 9,54 | 21,80 |
| DASH-Q IQ2_XS | IQ2_XS | 10,59 GB | 2,56 | 8,40 | 19,08 |
| DASH-Q IQ2_M | IQ2_M | 11,54 GB | 2,79 | 7,99 | 18,12 |
| DASH-Q Q2_K_XL | Q2_K_XL | 12,66 GB | 3,06 | 7,88 | 18,07 |
| imatrix (llama.cpp) | IQ2..Q2_K | 9,27-12,42 GB | - | 8,20-9,70 | 18,22-21,02 |
| Q8_0 (referencia) | Q8_0 | 35,14 GB | 8 | 7,14 | 16,53 |

Comparativa con modelos base alternativos de la misma categoria (mismo tamano o misma tarea): no disponible. La informacion proporcionada no incluye datos de otros modelos comparables.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la perdida de calidad es notable frente a la referencia Q8_0 (por ejemplo, Q2_K_XL sube la perplejidad en WikiText-2 de 7,14 a 7,88 y en C4 de 16,53 a 18,07). No es una cuantizacion apta cuando se exige maxima fidelidad.
- Sin capacidades de vision: aunque el modelo base es vision-lenguaje, esta cuantizacion es text-only porque el vision tower no se ha incluido. No debe esperarse entrada de imagenes.
- Licencia "other": hereda la licencia del modelo base LGAI-EXAONE/EXAONE-4.5-33B. Es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para esta cuantizacion.
- Idiomas soportados: no disponibles en la informacion proporcionada; no se puede confirmar cobertura multilingue.
- Los datos de perplejidad se han medido con contexto de 2048. El comportamiento con contextos mas largos (por ejemplo, el `-c 8192` del ejemplo) no esta documentado.
- La variante IQ2_XXS de DASH-Q empeora la perplejidad en C4 respecto al imatrix de llama.cpp (21,80 frente a 21,02), por lo que no mejora al cuantizador de referencia en todos los casos.
- Sesgos conocidos: no disponible.
- La ficha tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio no incluye evaluaciones de tareas mas alla de la perplejidad.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/jkim96/EXAONE-4.5-33B-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B
- Repositorio DASH-Q: https://github.com/JaeminK/dashq
- GitHub EXAONE 4.5: https://github.com/LG-AI-EXAONE/EXAONE-4.5
- Coleccion jkim96 EXAONE-4.5-33B: https://huggingface.co/collections/jkim96/jkim96-exaone-45-33b
- Cuantizacion DASHQ INT3-g128 del mismo autor: https://huggingface.co/jkim96/EXAONE-4.5-33B-DASHQ-INT3-g128
- ModelScope EXAONE-4.5-33B: https://www.modelscope.cn/models/LGAI-EXAONE/EXAONE-4.5-33B
- Ficha local-ai-zone EXAONE 4.5 33B GGUF: https://local-ai-zone.github.io/models/exaone-4-5-33b.html
