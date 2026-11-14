# qtum/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, distribuido originalmente en pesos completos y aquí publicado en formato GGUF por el usuario qtum para su uso con llama.cpp. Se trata de un modelo masivo: 763 mil millones de parámetros totales, de los cuales 196,6 mil millones corresponden a las denominadas "Engram tables", dos tablas de búsqueda n-gram que ocupan el 26 % del modelo. Los expertos enrutados se distribuyen en 40 capas, con 384 expertos por capa y 6 activos por token.

La particularidad de esta publicación es que no es una cuantización estándar: el checkpoint original ya trae los expertos en FP8 (que tras la conversión quedan en MXFP4), por lo que el autor descarta explícitamente los niveles Q8_0, Q6_K, Q5_K_M y Q4_K_M, argumentando que recuantizar hacia arriba solo infla el archivo sin recuperar precisión. Las versiones ofrecidas son IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS, todas calibradas con imatrix y con capas no-expertas protegidas en Q8_0, F32 o Q6_K según su función.

Es relevante ahora porque permite ejecutar un modelo de escala frontera (con arquitectura MoE, atención dispersa y decodificación especulativa DSpark) en hardware que de otro modo sería insuficiente, a costa de una degradación medible de perplejidad. Esta versión GGUF es solo texto: no incluye la torre de visión del checkpoint original, que llama.cpp aún no soporta para esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (indexer/compressor), Engram tables y módulo de decodificación especulativa DSpark |
| Parametros totales | 763 G |
| Parametros activos | 6 expertos por token sobre 384 por capa, 40 capas (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`, pero no se especifica el máximo) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS (expertos en MXFP4, Engram en IQ4_NL, capas críticas en Q8_0/F32/Q6_K) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 5 o 6 archivos según tier) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas, 384 expertos enrutados por capa y 6 activos por token. Incorpora dos componentes singulares: por un lado, un mecanismo de atención dispersa con tensores `indexer*` y `*compressor*` que seleccionan las entradas KV relevantes; por otro, las Engram tables, dos tablas de búsqueda n-gram (`per_layer_token_embd`, de dimensiones 256 × 768.022.850) que suman 196,6 G parámetros y funcionan como memoria léxica de consulta directa (`GET_ROWS`). El checkpoint original incluye además una torre de visión de 32 capas (patch size 14) que no está presente en esta publicación GGUF.

Los expertos enrutados se distribuyen en el checkpoint original en FP8 con `weight_block_size = [32, 32]` y `expert_dtype = fp4`, y tras la conversión quedan en MXFP4. El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada. Sí se documenta la existencia del módulo DSpark de decodificación especulativa (pesos `mtp.*`, 7,9 GiB en BF16), exportado aparte en 7,4 GiB con expertos en MXFP4 y el resto en Q8_0, que actúa como draft para todos los tiers.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y conocimiento general propios de un modelo MoE de escala frontera (sin benchmarks publicados en esta ficha).
- Decodificación especulativa mediante el módulo DSpark, que acelera la generación con un draft de 7,4 GiB.
- Atención dispersa con indexer y compressor, orientada a contextos largos.
- Memoria léxica vía Engram tables, que actúan como lookup n-gram por token.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Visión: no disponible en esta versión GGUF (el checkpoint original sí la incluye, pero llama.cpp no la soporta para esta arquitectura).

## Casos de uso

- Despliegue de un modelo de escala frontera en clústeres de 8×H100: los tiers IQ1_S (212,9 GiB) e IQ2_XS (258,4 GiB) caben en configuraciones multi-GPU de 80 GB, con la tabla Engram en RAM de sistema (`-ot per_layer_token_embd=CPU`), lo que permite servir un MoE de 763 G sin infraestructura de cientos de GB de VRAM.
- Generación de texto en inglés y chino: el modelo cubre ambos idiomas de forma nativa, adecuado para pipelines bilingües de traducción, resumen o redacción.
- Investigación sobre cuantización extrema: los cuatro tiers con perplejidad medida sobre wikitext-2 permiten estudiar el compromiso tamaño/calidad en modelos MoE con expertos ya cuantizados en origen.
- Aceleración de inferencia con decodificación especulativa: el draft DSpark de 7,4 GiB, cargado con `--spec-type draft-dspark`, reduce la latencia en despliegues interactivos donde el throughput importa.
- Procesamiento de documentos largos: la atención dispersa con indexer y compressor está diseñada para seleccionar KV relevantes en contextos extensos; útil en análisis de contratos, informes o código de gran tamaño.
- Experimentación local en estaciones de trabajo con gran cantidad de RAM: manteniendo la tabla Engram (unos 103 GiB) en memoria de sistema y el resto en GPU, es posible ejecutar el modelo en un único nodo con varias GPUs consumer o profesionales.
- Evaluación comparativa de arquitecturas MoE: sirve como banco de pruebas para medir el impacto de las Engram tables y de la atención dispersa frente a transformers densos de tamaño comparable.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad sobre wikitext-2 para cada tier de cuantización:

| Tier | Tamano | Shards | PPL (wikitext-2) |
|---|---|---|---|
| BF16 master (referencia, no en el repo) | 650,9 GiB | — | 1,7914 ± 0,06318 |
| IQ1_S | 212,9 GiB | 5 | 3,1912 ± 0,12236 |
| IQ1_M | 224,3 GiB | 5 | 2,7648 ± 0,10085 |
| IQ2_XXS | 243,2 GiB | 6 | 2,2878 ± 0,08231 |
| IQ2_XS | 258,4 GiB | 6 | 2,1610 ± 0,07753 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los tiers van de 212,9 GiB (IQ1_S) a 258,4 GiB (IQ2_XS). De esa cifra, unos 103 GiB corresponden solo a la tabla Engram en IQ4_NL.
- GPU recomendadas: el autor menciona mediciones en 8×H100; los tamaños superan con holgura 8×80 GB de VRAM si se carga todo en GPU.
- Estrategia recomendada: mantener `per_layer_token_embd` en RAM de sistema con `-ot per_layer_token_embd=CPU`, lo que libera unos 103 GiB de VRAM por tier.
- GPU consumer: no cabe en ninguna GPU consumer individual; requiere un nodo multi-GPU con gran cantidad de RAM de sistema.
- Despliegue: llama.cpp (`llama-cli`), con soporte de shards (`-00001-of-0000N`) y del draft DSpark (`-md` más `--spec-type draft-dspark`, `-ngld 99`).
- Latencia y throughput: no disponibles en la información proporcionada. El módulo DSpark está pensado para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (este GGUF) | 763 G (MoE, 6/384 expertos) | no disponible | MIT | GGUF | Solo texto; Engram en IQ4_NL; tiers IQ1–IQ2 |
| DeepSeek-V4.1-Flash-1017 (original) | 763 G | no disponible | MIT | safetensors (FP8/MXFP4) | Incluye torre de visión; referencia de calidad (PPL 1,7914) |
| Alternativas de misma escala | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Degradación de calidad medible: la perplejidad sube de 1,7914 (BF16 master) a 3,1912 en IQ1_S, un incremento superior al 78 %; IQ2_XS (2,1610) es el tier menos degradado.
- Solo texto: no contiene ningún tensor de visión; para entrada de imágenes hay que usar los pesos originales.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- No hay datos publicados sobre sesgos, alucinación, tool calling ni comportamiento agéntico; conviene evaluarlos antes de producción.
- Licencia MIT, que permite uso comercial, pero el autor no documenta restricciones adicionales del modelo base más allá del enlace a su LICENSE.
- Los tiers no son "casi sin pérdida": el autor advierte explícitamente que un tier intermedio no aporta nada frente a los pesos originales.
- La tabla Engram no puede separarse en un archivo descargable aparte: es un tensor requerido y el GGUF no carga sin ella.
- El draft DSpark no se activa solo con `-md`; requiere `--spec-type draft-dspark`, y sin él el log indica que no hay implementaciones especificadas.
- Requisito de hardware elevado: más de 200 GiB de almacenamiento y un nodo multi-GPU con RAM de sistema suficiente para la tabla Engram.

## Enlaces

- Repositorio GGUF: https://huggingface.co/qtum/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- README en chino: https://huggingface.co/qtum/DeepSeek-V4.1-Flash-1017-GGUF/blob/main/README_zh.md
