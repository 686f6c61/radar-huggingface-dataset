# guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-Monoglot-GGUF

## Resumen

Monoglot es una variante del modelo Qwen3.8-27B (26.109.305.856 parametros reales segun safetensors) publicada por el usuario guideboardlabs en Hugging Face. No se trata de un reentrenamiento ni de una recuantizacion: es una poda del vocabulario del tokenizer aplicada sobre un GGUF ya cuantizado, en la que se eliminan 118.300 de las 248.320 filas del vocabulario y se conservan 130.020. Cada fila de pesos superviviente es bit-identica al fichero de origen. El objetivo declarado es reducir el tamano de los tensores de vocabulario (`output.weight` y `token_embd.weight`) para que el modelo quepa en una GPU de 8 GB (RX 5700 XT, RDNA1) sin desbordar a memoria del sistema.

La relevancia de esta ficha no esta en el modelo base, sino en la tecnica: la poda de vocabulario reduce el fichero de 8.480.272.384 a 7.869.784.224 bytes (610 MB, un 7.2%) y, sobre todo, hace que el modelo cruce un umbral de memoria que en el fichero de origen provocaba una caida del prefill de 6,2x a partir de 512 tokens. El autor documenta tanto lo que funciono como lo que no, con mediciones propias en llama.cpp sobre hardware concreto.

El modelo esta pensado exclusivamente para ingles (etiqueta `language: en`), de ahi el nombre "Monoglot". La licencia es Apache-2.0, heredada del modelo base Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.8-27B); no se detalla en la model card |
| Parametros totales | 26.109.305.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el autor prueba ventanas de 16K y 32K en llama-server |
| Tipos de cuantizacion | GGUF mixta: `ffn_gate`/`ffn_down` IQ2_XS, `ffn_up` IQ2_XXS, `attn_qkv` IQ2_XS, `attn_output` IQ3_S, `attn_k`/`attn_v` IQ4_XS, `output.weight` Q5_K, `token_embd.weight` Q2_K |
| Idiomas soportados | en (ingles); el vocabulario podado degrada otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tamano del repo 7,9 GB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer de 26.109.305.856 parametros. La model card de esta variante no describe la arquitectura interna, los datos de entrenamiento ni si hubo RLHF o DPO; esa informacion corresponderia al modelo original de Qwen, no a esta publicacion. Lo que si se documenta con detalle es el proceso de cuantizacion y poda.

El pipeline es el siguiente: se parte de un GGUF de Unsloth (`unsloth/Qwen3.8-27B-GGUF`), se cuantiza a `guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-GGUF` con una imatrix construida por el autor, y sobre ese fichero se aplica la poda de vocabulario con la herramienta `bsaleh03/ASCII-Condensed-prune-tools` (sin licencia, no redistribuida). La politica aplicada es P1G, que conserva ASCII, simbolos matematicos y tipograficos, griego, box-drawing, unidades y moneda: 130.020 filas de 248.320 (47,64% eliminado). La politica es cerrada bajo subcadena, de modo que todo merge que produce un token conservado tiene padres conservados y se mantiene la alcanzabilidad BPE. Los tokens especiales, los 256 tokens de byte-fallback y los fragmentos UTF-8 parciales se conservan siempre, por lo que cualquier texto sigue siendo representable, a coste de un token por byte UTF-8 en lugar de uno por caracter.

La innovacion tecnica destacable no es algorítmica sino de ingenieria de memoria: al recortar los tensores de vocabulario (`output.weight` de 874 MB a 456 MB, `token_embd.weight` de 417 MB a 218 MB), el fichero baja de 8.480.272.384 a 7.869.784.224 bytes y deja de rebasar el limite de VRAM de una GPU de 8 GB con contexto de 16K, eliminando el streaming de pesos por PCIe 3.0 que penalizaba el decode.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational`).
- Razonamiento y prosa tecnica: el autor declara su uso principal en codigo, logs y texto tecnico.
- Generacion de codigo en Python (medido: misma ratio de tokens que el original, 1,00x).
- Manejo de simbolos matematicos y tipograficos: `π`, `≥`, `├──`, `✓`, unidades y moneda se conservan en el vocabulario.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: practicamente nulas; el vocabulario esta podado a ASCII y rangos simbolicos. El frances con acentos consume 1,72x mas tokens y el japones no esta cuantificado en la model card (la tabla queda truncada).
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Inferencia local en GPU de 8 GB: el caso de uso central. El modelo cabe en una RX 5700 XT (RDNA1) con 7,87 GiB de 7,98 GiB de VRAM a 16K de contexto y solo 0,56 GiB de spill a GTT, frente a 1,27 GiB del fichero de origen. Adecuado para quien tenga hardware AMD antiguo y quiera ejecutar un modelo de 26B.
- Servidor de chat en ingles con llama-server: con prefill de 156,0/153,6 t/s y decode de 23,0/23,6 t/s a 16K, es viable para conversaciones multi-turno de un solo usuario o pocos usuarios concurrentes.
- Analisis de logs y texto tecnico: la politica P1G conserva box-drawing, griego y simbolos de estado, por lo que el modelo tokeniza correctamente salidas de herramientas, arboles de directorios y mensajes de error.
- Generacion y revision de codigo Python en local: ratio de tokens 1,00x respecto al original en Python, sin penalizacion de vocabulario, y suficiente velocidad de decode para autocompletado interactivo.
- Procesamiento de documentacion tecnica en ingles: prosa inglesa a 1,00x de ratio de tokens, con contexto de hasta 32K medido a 156,6/155,7 t/s de prefill.
- Despliegue en pipelines de CI o entornos sin GPU de datacenter: al ser GGUF y funcionar con llama.cpp sobre Vulkan, se integra en maquinas de desarrollo con graficas de consumo.
- Experimentacion con tecnicas de poda de vocabulario: sirve como referencia reproducible para investigadores que quieran medir el impacto de recortar el vocabulario en modelos cuantizados a muy bajo bit.

## Benchmarks y rendimiento

Mediciones del autor en llama.cpp `3ba1ce0` con backend Vulkan, RX 5700 XT (8 GB, RDNA1), flags `-ngl 999 -ctk q8_0 -ctv q8_0 -fa on -t 6 --cpu-mask 0x3f`, `GGML_VK_DISABLE_HOST_VISIBLE_VMEM=1`, tres repeticiones:

| llama-bench | Fichero origen | Este fichero | Variacion |
|---|---:|---:|---|
| pp128 | 169,2 | 169,5 | plano |
| pp256 | 174,8 | 175,5 | plano |
| pp384 | 172,6 | 173,1 | plano |
| pp512 | 28,0 | 173,2 | 6,2x |
| tg128 | 23,81 ± 0,05 | 24,46 ± 0,10 | +2,7% |

Mediciones via llama-server con ventana de 16K y prompt de 499 tokens, dos peticiones:

| Metrica | Origen | Este fichero |
|---|---:|---:|
| Prefill | 27,2 / 26,5 t/s | 156,0 / 153,6 t/s |
| Decode | 8,9 / 9,8 t/s | 23,0 / 23,6 t/s |
| VRAM | 7,95 GiB de 7,98 | 7,87 GiB de 7,98 |
| Spill a GTT | 1,27 GiB | 0,56 GiB |

A 32K de contexto: 156,6 / 155,7 t/s de prefill y 22,8 / 23,1 t/s de decode. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,9 GB para el fichero completo con contexto de 16K y KV cache en q8_0; medido en 7,87 GiB sobre una GPU de 7,98 GiB.
- GPU probada: AMD RX 5700 XT (8 GB, RDNA1) con backend Vulkan.
- Cabe en GPU de consumo de 8 GB; con tarjetas de mas VRAM el autor indica que la ganancia se reduce a un 2,7% de decode (no hay beneficio de umbral).
- Despliegue: llama.cpp (`llama-bench`, `llama-server`), backend Vulkan. Otros backends (CUDA, ROCm) no estan medidos en la informacion disponible.
- Flags recomendados por el autor: `-ngl 999 -ctk q8_0 -ctv q8_0 -fa on -t 6 --cpu-mask 0x3f`, con `GGML_VK_DISABLE_HOST_VISIBLE_VMEM=1`.
- Throughput medido: decode 23,0-24,46 t/s; prefill 153,6-175,5 t/s segun tamano de prompt.
- Latencia: no disponible de forma explicita; se puede derivar de los t/s anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-Monoglot-GGUF (este) | 26,1B | 16K-32K medido | GGUF IQ2/IQ3/Q5_K, vocab podado | apache-2.0 | 7,87 GB; prefill 156 t/s en RX 5700 XT |
| guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-GGUF (origen) | 26,1B | 16K-32K medido | GGUF IQ2/IQ3/Q5_K | apache-2.0 | 8,48 GB; prefill 27 t/s a 512+ tokens en la misma GPU |
| fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2 | 26,1B | no disponible | GGUF UD-Q3_K_XL, vocab podado (politica P2) | no disponible | Primera demostracion publica de la tecnica; conserva ASCII + Latin-1/Latin-Ext-A |
| Qwen/Qwen3.8-27B (base) | 26,1B | no disponible | safetensors | apache-2.0 | Modelo original sin cuantizar ni podar |

## Limitaciones y advertencias

- El vocabulario esta podado a ASCII y rangos simbolicos: cualquier texto fuera de ese conjunto consume un token por byte UTF-8 en lugar de uno por caracter. El frances con acentos pasa de 18 a 31 tokens (1,72x); el japones queda fuera de la tabla publicada.
- El modelo esta declarado solo para ingles (`language: en`). No debe usarse para produccion multilingue.
- La poda no es un reentrenamiento: no mejora la calidad del modelo base, solo reduce el tamano del fichero y el coste de los tensores de vocabulario.
- La herramienta de poda (`bsaleh03/ASCII-Condensed-prune-tools`) no tiene licencia, por lo que su codigo no se redistribuye; el modelo es un producto de esa herramienta.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplican los riesgos habituales del modelo base Qwen3.8-27B.
- Sesgos: no documentados en la model card.
- Las mediciones son de una sola maquina (RX 5700 XT, Vulkan, llama.cpp `3ba1ce0`); el rendimiento en CUDA, ROCm u otras GPU no esta medido.
- El autor advierte que en tarjetas con VRAM de sobra la ganancia se limita a un 2,7% de decode, sin beneficio de umbral.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- La model card esta truncada en la seccion de coste de tokens para japones; no se dispone del dato completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-Monoglot-GGUF
- GGUF de origen: https://huggingface.co/guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Primera demostracion publica de la tecnica: https://huggingface.co/fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2
- Herramienta de poda: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
- Perfil del autor de la idea: https://huggingface.co/fakezeta
- Publicacion en X que dio a conocer la tecnica: https://x.com/teksedge/status/2122118832441708600
