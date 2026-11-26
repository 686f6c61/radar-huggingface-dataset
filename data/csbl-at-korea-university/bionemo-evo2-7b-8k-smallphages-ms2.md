# CSBL-at-Korea-University/bionemo-evo2-7b-8k-smallphages-ms2

## Resumen

El modelo `bionemo-evo2-7b-8k-smallphages-ms2` es un checkpoint publicado en Hugging Face por el grupo CSBL de la Universidad de Corea (CSBL-at-Korea-University). Por su nomenclatura, se trata de un modelo derivado de la familia Evo 2 de BioNeMo (NVIDIA), orientada a genómica, con un tamano de 7 mil millones de parametros y una ventana de contexto de 8 000 tokens, aparentemente ajustado sobre un conjunto de bacteriofagos pequenos ("smallphages") y con un identificador de experimento "ms2".

El modelo resuelve tareas de modelado de secuencias biologicas: prediccion del siguiente nucleotido, puntuacion de variantes, generacion de secuencias genomicas y representaciones internas utiles para tareas downstream de biologia computacional. Su relevancia radica en que extiende el paradigma de los modelos de lenguaje de gran escala al ADN, un area donde los modelos genericos de texto no son aplicables directamente.

La informacion publica disponible es muy limitada: la model card solo contiene la declaracion de licencia, sin especificaciones tecnicas, datos de entrenamiento ni resultados de evaluacion. Los detalles que se ofrecen a continuacion combinan lo declarado por el autor con lo conocido publicamente sobre la familia Evo 2, y se marcan como "no disponible" aquellos datos que no pueden confirmarse para este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por familia Evo 2: transformer con atencion por tiras, tipo StripedHyena 2) |
| Parametros totales | 7B (segun el identificador del modelo) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | 8 000 tokens (segun el identificador del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica; modela secuencias de ADN, no lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura concreta de este checkpoint en la model card. Por la convencion de nombres de la familia Evo 2 de BioNeMo, cabe esperar una arquitectura hibrida de convoluciones y atencion (StripedHyena 2) disenada para secuencias genomicas largas, con tokenizacion a nivel de nucleotido (single-nucleotide) y capacidad de contexto de decenas de miles a un millon de bases en los modelos mayores de la familia. El sufijo "8k" sugiere que este checkpoint emplea una ventana de 8 000 tokens.

Tampoco se detallan los datos de entrenamiento: no se indica el numero de tokens (bases) procesados, la composicion del corpus, ni si hubo ajuste fino supervisado o aprendizaje por refuerzo. El sufijo "smallphages" apunta a un ajuste o especializacion sobre genomas de bacteriofagos pequenos, y "ms2" podria referirse al bacteriofago MS2 o a un identificador de experimento interno del grupo. Estos extremos no pueden confirmarse con la informacion disponible.

## Capacidades

- Modelado de secuencias de ADN a nivel de nucleotido (prediccion del siguiente token, probabilidad de secuencias).
- Puntuacion de variantes genomicas (zero-shot variant effect prediction), si hereda las capacidades de la familia Evo 2.
- Generacion de secuencias genomicas sinteticas condicionadas por contexto.
- Extraccion de representaciones internas (embeddings) para tareas downstream como clasificacion de secuencias o anotacion funcional.
- Especializacion probable en genomas de bacteriofagos pequenos, segun el identificador del modelo.
- Soporte de tool calling, agentes, vision o audio: no disponible (no es un modelo de proposito general).
- Capacidades multilingues: no aplica.

## Casos de uso

- Anotacion funcional de genomas de fagos: usar las probabilidades por base del modelo para identificar regiones codificantes, promotores o elementos regulatorios en genomas de bacteriofagos de pequeno tamano.
- Prediccion de efecto de mutaciones: puntuar variantes puntuales comparando la verosimilitud de la secuencia de referencia frente a la mutada, util en estudios de evolucion viral o diseno de fagos.
- Diseno de genomas sinteticos: generar secuencias candidatas con la distribucion aprendida y filtrarlas por plausibilidad biologica antes de sintesis in vitro.
- Extraccion de embeddings para clasificacion: congelar el modelo y entrenar clasificadores ligeros sobre sus representaciones para discriminar familias de fagos o regiones genomicas.
- Investigacion en modelos genomicos: servir como punto de partida para ajuste fino en tareas de biologia computacional con datasets propios de tamano moderado.
- Benchmarking de modelos genomicos: comparar el comportamiento de un checkpoint de 7B y contexto 8k frente a modelos mayores de la familia Evo 2 en tareas de perplejidad sobre genomas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB solo para pesos de un modelo de 7B, mas memoria para el KV cache; con contexto de 8 000 tokens el consumo adicional es moderado.
- Cuantizacion a 8 bits: en torno a 7-8 GB de VRAM; a 4 bits: en torno a 4-5 GB, aunque no se confirma que existan pesos cuantizados publicados para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en precision completa con lotes grandes; RTX 4090 (24 GB) suficiente para FP16 con lotes pequenos; RTX 3090 o GPUs de 16 GB viables con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en FP16 y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: no disponible para este checkpoint concreto; en la familia Evo 2 el despliegue tipico se realiza con el stack de BioNeMo y frameworks compatibles con transformers, ademas de vLLM o TGI si los pesos son compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bionemo-evo2-7b-8k-smallphages-ms2 | 7B | 8k | Genomica, fagos pequenos | Apache 2.0 | Hugging Face |
| Evo 2 (familia BioNeMo, checkpoint base 7B) | 7B | variable (hasta 1M en variantes mayores) | Genomica general | no disponible en esta ficha | BioNeMo / Hugging Face |
| Nucleotide Transformer | 500M-2.5B | 1k-12k | Genomica general | no disponible en esta ficha | Hugging Face |
| DNABERT-2 | ~117M | ~512 | Genomica general | no disponible en esta ficha | Hugging Face |

La comparativa se basa en caracteristicas publicas de las familias citadas; los datos de rendimiento relativos no estan disponibles para este checkpoint.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, evaluacion ni limitaciones, lo que impide validar su comportamiento en produccion.
- Riesgo de generar secuencias genomicas plausibles pero no funcionales o biologicamente inviables; toda salida debe validarse experimentalmente.
- Especializacion probable en bacteriofagos pequenos: el rendimiento fuera de ese dominio (genomas humanos, eucariotas complejos) es desconocido.
- No es un modelo de lenguaje natural: no debe usarse para tareas de texto, codigo o conversacion.
- Sesgos de representacion derivados del corpus de entrenamiento no documentado (posible infrarepresentacion de ciertos linajes o regiones genomicas).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre procedencia de datos geneticos aconseja revisar las condiciones de las bases de datos de origen antes de un uso comercial.
- Checkpoint con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CSBL-at-Korea-University/bionemo-evo2-7b-8k-smallphages-ms2
- Repositorio BioNeMo de NVIDIA: https://github.com/NVIDIA/bionemo-framework (referencia de la familia)
- Paper de Evo 2: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
