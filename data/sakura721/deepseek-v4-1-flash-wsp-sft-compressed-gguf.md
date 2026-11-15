# Sakura721/DeepSeek-V4.1-Flash-WSP-SFT-Compressed-GGUF

## Resumen

DeepSeek-V4.1-Flash-WSP-SFT-Compressed-GGUF es una conversión a formato GGUF del checkpoint EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed, una edición estructuralmente comprimida del modelo DeepSeek-V4.1-Flash (552 B de parámetros) de DeepSeek. La compresión combina técnicas de CED (compresión estructural), destilación de mezcla de expertos (de 384 a 24 expertos enrutados) y un SFT de 8 épocas, reduciendo el checkpoint original de 475 GiB a 7,37 GiB. El resultado es un modelo de 9.463.928.816 parámetros totales con arquitectura MoE de 8 capas, 24 expertos enrutados (4 activos más 1 compartido) y vocabulario de 129.280 tokens.

El autor de esta conversión es Sakura721, que publica dos ficheros: una versión F16 (8,36 GiB) y una Q4_K_M (5,41 GiB, 4,90 bpw). El modelo está orientado a generación de texto, código y seguridad informática, con soporte para inglés y chino, y licencia MIT. Es relevante porque demuestra una cadena de compresión agresiva que permite ejecutar un derivado de un modelo de 552 B en hardware de consumo, aunque la conversión aún no se ha validado en tiempo de ejecución.

La model card advierte explícitamente que la conversión está completa pero la carga en runtime no está verificada: el fichero es estructuralmente válido (219 tensores, arquitectura `deepseek41`, nombres y formas reconciliados contra `src/models/deepseek41.cpp`) y cuantiza limpiamente, pero el cargador aborta en la construcción del grafo con `GGML_ASSERT(a->ne[0] == b->ne[0])`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con compresión estructural (arch `deepseek41`), hyper-connections y compresores de atención |
| Parámetros totales | 9.463.928.816 |
| Parámetros activos | 4 expertos enrutados + 1 compartido por token (sobre 24 enrutados); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (4,90 bpw) y F16/BF16 con expertos MXFP4 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 8 (comprimidas desde 40) |
| Expertos | 24 enrutados (desde 384), 4 activos, 1 compartido |
| Hidden / FFN | 5120 / 2304 |
| Cabezas | 64, head_dim 512, q_lora 1280, o_groups 8, o_lora 1024 |
| Vocabulario | 129.280 |
| Hyper-Connections | `hc_mult = 4`, 20 iteraciones de Sinkhorn |
| Ratios de compresión | `[0, 0, 2, 2, 1, 1, 1, 1]` |
| Capas fuente KV | `[2, 3, 4]` |
| Capas fuente del indexador | `[2, 3, 4, 5, 6]` |
| Tensores | 219 |
| Toolchain | llama.cpp master `b099089`, cuantizado con `b12182` |
| Tamaño del repo | 14,8 GB |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-V4.1-Flash (552 B) y pasa por una cadena de tres etapas: compresión CED, destilación de MoE de 384 a 24 expertos enrutados y SFT de 8 épocas. La arquitectura resultante es un transformer MoE con 8 capas (desde 40), hidden de 5120, FFN de 2304, 64 cabezas de atención con head_dim 512, q_lora de 1280 y o_lora de 1024 con 8 grupos de salida. Incorpora hyper-connections con `hc_mult = 4` y 20 iteraciones de Sinkhorn, además de módulos compresores de atención en las capas 2, 3 y 4 (con ratios `[0, 0, 2, 2, 1, 1, 1, 1]`) y un indexador de atención con capas fuente KV `[2, 3, 4]` y capas fuente del indexador `[2, 3, 4, 5, 6]`. Los módulos Engram están ausentes en este checkpoint (`engram_layer_ids: []`).

La conversión a GGUF requirió cuatro shims de compatibilidad: mapeo de claves de configuración comprimidas (`dim`, `moe_inter_dim`, `n_heads`, `rope_head_dim`, `kv_source_layers`, `candidate_source_layer`) a los nombres que espera `DeepseekV41Model`; cambio de `dtype: "fp8"` a `"bfloat16"` porque torch no expone el atributo `fp8`; ampliación del mapa `compress_ratios` de transformers para aceptar factores 1 y 2 (solo aceptaba `{0, 4, 128}`); y remodelado de `attn_output_a` de 2-D plano a 3-D `(o_groups, o_lora, in_dim)`. El fichero F16 es la salida directa del conversor (sin pérdida para lineales FP8, expertos MXFP4 bit-exactos); el Q4_K_M recuantiza los lineales no-expertos mientras los expertos enrutados permanecen en MXFP4 porque llama.cpp rechaza recuantizarlos sin `--allow-requantize`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación y asistencia de código, con etiquetas explícitas `code` en el modelo.
- Seguridad informática y seguridad de red, con etiquetas `cybersecurity` y `network-security`.
- Soporte de tool calling y function calling: la model card incluye la etiqueta `endpoints_compatible`, orientada a endpoints compatibles con APIs de chat.
- Razonamiento multi-paso y uso como agente: la arquitectura MoE con 4 expertos activos por token está pensada para cargas de razonamiento y generación.
- Capacidades multilingües limitadas a inglés y chino; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado y revisión de parches, aprovechando su especialización en código y su tamaño de 5,41 GiB en Q4_K_M, que permite ejecución en GPUs de consumo.
- Análisis de seguridad y triaje de alertas: con etiquetas explícitas de ciberseguridad y seguridad de red, puede emplearse para resumir informes de vulnerabilidades, clasificar alertas de IDS o redactar recomendaciones de mitigación en inglés y chino.
- Atención al cliente bilingüe en inglés y chino: conversaciones multi-turno con un modelo MoE de 9,46 B totales y 4 expertos activos, desplegable en infraestructura propia con llama.cpp.
- Generación de documentación técnica: redacción de guías, READMEs y notas de versión a partir de fragmentos de código o especificaciones, con la ventaja de ejecución local y licencia MIT.
- Prototipado de agentes con tool calling: al ser compatible con endpoints de chat, puede conectarse a frameworks de agentes que expongan herramientas vía function calling para tareas de automatización.
- Investigación en compresión de modelos: sirve como caso de estudio reproducible de la cadena CED + destilación MoE + SFT + cuantización GGUF, con los shims de compatibilidad documentados en la model card.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp y licencia MIT, permite procesar datos sensibles sin enviarlos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GiB para el fichero Q4_K_M (5,41 GiB de pesos más overhead de contexto y KV cache); aproximadamente 8,5-9 GiB para el fichero F16 (8,36 GiB de pesos más overhead).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el Q4_K_M es apto para GPUs de consumo con 8 GB o más de VRAM, y el F16 requiere 12 GB o más.
- Cabe en GPU de consumo: sí, el Q4_K_M en tarjetas de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060 Ti) y el F16 en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- Opciones de despliegue: llama.cpp (toolchain declarada, master `b099089`); no se confirman otras opciones como vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. Además, la carga en runtime no está verificada (ver limitaciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-WSP-SFT-Compressed-GGUF (este) | 9,46 B totales, MoE 24 expertos (4 activos) | no disponible | MIT | GGUF Q4_K_M / F16 | Conversión completa, carga en runtime no verificada |
| DeepSeek-V4.1-Flash (upstream) | 552 B | no disponible | no disponible | safetensors | Modelo original, 475 GiB |
| EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed | no disponible | no disponible | no disponible | safetensors | Checkpoint base comprimido, 7,37 GiB |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La carga en runtime no está verificada: el modelo aborta en la construcción del grafo con `GGML_ASSERT(a->ne[0] == b->ne[0])`, por lo que no es apto para producción hasta que se resuelva.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación: no cuantificado; como modelo de lenguaje generativo, es susceptible de producir contenido falso o inventado, especialmente en dominios técnicos como ciberseguridad.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide planificar cargas con ventanas largas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo deriva de DeepSeek-V4.1-Flash y del checkpoint de EverythingIsForGod, cuyas licencias no se detallan en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Caveat de producción: el proceso de compresión (8 capas desde 40, 24 expertos desde 384) puede degradar capacidades respecto al modelo original; no hay benchmarks que cuantifiquen esa pérdida.
- Los expertos enrutados permanecen en MXFP4 en el fichero Q4_K_M, lo que limita la reducción adicional de tamaño.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Sakura721/DeepSeek-V4.1-Flash-WSP-SFT-Compressed-GGUF
- Modelo base: https://huggingface.co/EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed
- Modelo upstream: `deepseek-ai/DeepSeek-V4.1-Flash` (referenciado en la model card; URL no disponible en la información proporcionada)
- llama.cpp: repositorio referenciado en la model card (`src/models/deepseek41.cpp`); URL no disponible en la información proporcionada
