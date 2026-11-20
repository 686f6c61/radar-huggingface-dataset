# qtum/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, distribuido originalmente en pesos safetensors y aquí publicado en formato GGUF por el usuario qtum para su uso con llama.cpp. Con 748.494.643.824 parámetros totales (aproximadamente 748,5 G), es un modelo de escala muy grande que combina expertos enrutados con un mecanismo poco habitual denominado "Engram": dos tablas de búsqueda n-gram gigantes (`per_layer_token_embd`, con dimensiones 256 x 768.022.850) que suman 196,6 G parámetros y representan el 26 % del total del modelo.

La relevancia de esta publicación reside en la estrategia de cuantización: dado que los expertos enrutados ya vienen en FP8 en el checkpoint original y aterrizan en MXFP4 tras la conversión, el autor no ofrece tiers Q8_0, Q6_K, Q5_K_M ni Q4_K_M, argumentando que recuantizar hacia arriba solo infla el archivo sin recuperar precisión. En su lugar, publica tiers de baja precisión (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) calibrados con imatrix, protegiendo las capas críticas (atención, experto compartido, indexador de atención dispersa, router) en Q8_0 o F32.

El modelo está pensado para generación de texto en inglés y chino, con licencia MIT. Es importante señalar que estos GGUF son exclusivamente de texto: el checkpoint original incluye una torre de visión de 32 capas que llama.cpp no soporta aún para esta arquitectura, por lo que ninguna de estas cuantizaciones contiene tensores de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (indexer/compressor), experto compartido y tablas Engram (n-gram lookup) |
| Parametros totales | 748.494.643.824 (748,5 G) |
| Parametros activos | no disponible (se sabe que activan 6 de 384 expertos por capa en 40 capas, pero no el cómputo activo total) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS (calibrados con imatrix); sin Q8_0/Q6_K/Q5_K_M/Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (shards múltiples, 5-6 por tier) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas, 384 expertos enrutados por capa de los cuales 6 se activan por token, más un experto compartido (`ffn_*_shexp`) que se ejecuta en cada token. Incorpora atención dispersa mediante tensores `indexer*` y `*compressor*`, y un router (`ffn_gate_inp`) que en la cuantización se mantiene en F32 para no enrutar a expertos incorrectos. La innovación más destacable es el mecanismo Engram: dos tablas de búsqueda n-gram (`per_layer_token_embd`, 256 x 768.022.850) que ocupan el 26 % del modelo y se consultan mediante `GET_ROWS` (una fila por token), alimentadas por una proyección matmul real (`engram_kv`, solo 2 tensores, 0,58 GiB). El modelo base incluye además un módulo de decodificación especulativa DSpark (pesos `mtp.*`, 7,9 GiB en BF16, exportado aquí como archivo draft separado de 7,4 GiB) y una torre de visión de 32 capas (patch size 14) no incluida en estos GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. Los expertos enrutados se distribuyen en FP8 en el checkpoint original (`quant_method = fp8`, `weight_block_size = [32, 32]`, `expert_dtype = fp4`) y se convierten a MXFP4 (4,25 bpw) en el GGUF.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y generación de código (capacidades propias de un modelo base de esta familia; no se detallan explícitamente en la información disponible).
- Soporte de decodificación especulativa mediante el módulo DSpark (`mtp.*`), exportado como archivo draft independiente que sirve a todos los tiers.
- Consulta de tablas Engram: recuperación de patrones n-gram a nivel de token integrada en el forward pass.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidad de visión: presente en el checkpoint original (torre de 32 capas, `image_token_id`), pero **no disponible** en estos GGUF; requeriría un archivo `mmproj` separado y soporte de llama.cpp para esta arquitectura.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia local en clústeres con gran cantidad de VRAM: los tiers IQ1_S (212,9 GiB) e IQ2_XS (258,4 GiB) permiten ejecutar un modelo de 748 G parámetros en configuraciones multi-GPU (más de 8x80 GB), algo imposible con los pesos originales en BF16 (650,9 GiB).
- Investigación sobre cuantización extrema: los cuatro tiers publicados con sus valores de perplejidad en wikitext-2 (de 3,1912 en IQ1_S a 2,1610 en IQ2_XS frente a 1,7914 del maestro BF16) sirven como referencia para estudiar el impacto de la cuantización en arquitecturas MoE con tablas de búsqueda.
- Generación de texto en inglés y chino: el modelo soporta ambos idiomas, adecuado para aplicaciones bilingües de generación y conversación.
- Inferencia con offloading selectivo de la tabla Engram: dado que ~103 GiB de cada tier corresponden solo a `per_layer_token_embd`, se puede mantener ese tensor en RAM del sistema (`-ot per_layer_token_embd=CPU`) y reservar la VRAM para el resto de la red, optimizando el reparto memoria/velocidad.
- Aceleración mediante decodificación especulativa: el archivo draft DSpark (7,4 GiB) permite reducir la latencia de generación con llama.cpp usando `-md`.
- Evaluación comparativa de estrategias de cuantización por tipo de tensor: el diseño protege atención, experto compartido, indexador y router en Q8_0/F32, lo que permite medir empíricamente qué tensores dominan la calidad en un MoE de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica perplejidad en wikitext-2 para cada tier:

| Tier | Tamano | Shards | PPL (wikitext-2) |
|---|---|---|---|
| BF16 maestro (referencia, no en repo) | 650,9 GiB | — | 1,7914 ± 0,06318 |
| IQ1_S | 212,9 GiB | 5 | 3,1912 ± 0,12236 |
| IQ1_M | 224,3 GiB | 5 | 2,7648 ± 0,10085 |
| IQ2_XXS | 243,2 GiB | 6 | 2,2878 ± 0,08231 |
| IQ2_XS | 258,4 GiB | 6 | 2,1610 ± 0,07753 |

## Requisitos de hardware

- VRAM estimada: los tiers van de 212,9 GiB (IQ1_S) a 258,4 GiB (IQ2_XS), muy por encima de 8x80 GB de VRAM. El autor recomienda mantener la tabla Engram (~103 GiB en todos los tiers) en RAM del sistema mediante `-ot per_layer_token_embd=CPU`.
- GPU recomendadas: configuraciones multi-GPU de clase datacenter (A100 80 GB, H100 80 GB) en número suficiente para cubrir el resto de la red tras el offloading de Engram.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090, 24 GB) ni en configuraciones típicas de varias consumer GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), con soporte de shards múltiples apuntando al primer archivo (`-00001-of-0000N.gguf`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.
- Nota de uso: no emplear `-hf repo:IQ1_S`, ya que el fallback de coincidencia por ancho de bits puede servir el tier equivocado (IQ1_S e IQ1_M comparten los dígitos `IQ1`); usar `-m` explícito sobre el primer shard.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables de la misma categoría.

## Limitaciones y advertencias

- Solo texto: estos GGUF no contienen ningún tensor de visión, pese a que el checkpoint original incluye una torre de visión de 32 capas. Para entrada de imágenes hay que usar los pesos originales.
- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado.
- Perplejidad notablemente superior a la referencia BF16 en todos los tiers (por ejemplo, 3,1912 en IQ1_S frente a 1,7914 en el maestro), lo que implica degradación de calidad medible en los tiers más agresivos.
- No existen tiers de alta precisión (Q8_0, Q6_K, Q5_K_M, Q4_K_M); el autor argumenta que recuantizar hacia arriba infla el archivo sin recuperar precisión. Para uso casi sin pérdida hay que recurrir a los pesos originales.
- La tabla Engram no se puede separar en un archivo descargable independiente: el runtime la crea como tensor requerido y un GGUF sin ella no carga en `llama-quantize`.
- Riesgo de selección incorrecta de tier con la sintaxis `-hf repo:tag` por el fallback de coincidencia por ancho de bits.
- Requisitos de hardware extremos (más de 200 GiB de almacenamiento por tier, repo de 794,9 GB) y necesidad de offloading a RAM del sistema para la tabla Engram.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base (`deepseek-ai/DeepSeek-V4.1-Flash-1017`) en su propio LICENSE.

## Enlaces

- Repositorio GGUF: https://huggingface.co/qtum/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- README en chino: https://huggingface.co/qtum/DeepSeek-V4.1-Flash-1017-GGUF/blob/main/README_zh.md
