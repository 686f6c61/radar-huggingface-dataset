# AtomicChat/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de mezcla de expertos (MoE) de 26.070 millones de parámetros totales con 3.400 millones activos por token, desarrollado por Thinking Machines. Combina entrada de texto e imagen y emplea una arquitectura poco habitual: un núcleo con bucles en el que las 12 capas centrales de un total de 24 se ejecutan tres veces, lo que da lugar a 48 pasadas de capa efectivas. Esta ficha describe la versión GGUF publicada por AtomicChat, pensada para inferencia local con llama.cpp.

La relevancia de esta publicación reside en el trabajo de cuantización: AtomicChat distribuye ficheros con tipos por tensor (denominados AD, Atomic Dynamic) y una matriz de importancia propia, con métricas de fidelidad frente al BF16 original medidas con `llama-perplexity --kl-divergence`. Los resultados permiten elegir un fichero de 4 bits que retiene el 96,3 % de coincidencia en el token top-1 con solo 16,53 GB en disco, frente a los 52,2 GB del BF16.

El modelo base lo distribuye el proveedor en NVFP4 y MXFP8; el BF16 de referencia de este repositorio es esa checkpoint desquantizada. La licencia es Apache-2.0 tanto en el modelo base como en esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo en bucle (looped core); 24 capas, las 12 centrales ejecutadas 3 veces (48 pasadas efectivas) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | 3,4 B (128 expertos, 8 activos por token) |
| Longitud de contexto | no disponible (solo se indica que 4 de las 24 capas usan atención completa y el resto una ventana de 1024 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, y variantes AD: Q6_K, Q5_K, Q4_K, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S, IQ2_XXS, IQ2_M, IQ2_XXS-Q2, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible (el corpus de calibración cubre 30 idiomas, pero no se publica la lista de idiomas soportados) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en GGUF F16/BF16/Q8_0; BF16 de referencia en 2 partes |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 128 expertos y 8 activos por token, sobre un total de 26,07 B de parámetros y 3,4 B activos. Su rasgo diferencial es el núcleo en bucle: de las 24 capas, las 12 centrales se recorren tres veces, de modo que el cómputo efectivo equivale a 48 pasadas de capa. Solo 4 de las 24 capas emplean atención completa; el resto utiliza una ventana de 1024 tokens, lo que mantiene pequeño el coste de la caché KV. El modelo acepta entrada de texto e imagen mediante un proyector de visión independiente (`mmproj-Inkling-2-Mini-*.gguf`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El proveedor distribuye los pesos en NVFP4 y MXFP8, y el BF16 de referencia de este repositorio se obtiene desquantizando esa checkpoint. La cuantización de AtomicChat emplea una matriz de importancia calculada con 4,76 M tokens del corpus de calibración renderizados con la plantilla de chat del modelo, en 6 fragmentos; dos se procesaron en BF16 y cuatro en Q8_0 por falta de GPU libre con capacidad para los 52 GB del BF16. Los expertos concentran el 94 % de los pesos y absorben la compresión, mientras que la atención y los controladores del bucle se mantienen en Q8_0. Además, se ofrece un drafter opcional DSpark para decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen junto con texto (pipeline `image-text-to-text`), mediante el proyector `mmproj`.
- Razonamiento y respuesta a instrucciones en formato chat.
- Capacidades multilingües: el corpus de calibración de la cuantización cubre 30 idiomas, aunque no se detalla el conjunto de idiomas soportados por el modelo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecución local offline mediante llama.cpp.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local: con 3,4 B de parámetros activos y ficheros desde 16,53 GB en 4 bits, el modelo puede ejecutarse en una estación de trabajo con una sola GPU consumer de gama alta y mantener conversaciones multi-turno sin conexión.
- Análisis de documentos con imágenes: la entrada image-text-to-text permite adjuntar capturas, diagramas o páginas escaneadas junto a una pregunta en texto, con el proyector Q8_0 de 0,35 GB para minimizar el coste de VRAM.
- Despliegue en equipos con VRAM limitada: las variantes IQ2 e IQ1 (desde 6,88 GB) permiten probar el modelo en GPUs de 8-12 GB, aceptando la pérdida de fidelidad documentada (top-1 del 79,5 % en IQ1_S).
- Prototipado de aplicaciones de visión y lenguaje: al estar en GGUF y ser compatible con llama.cpp, se integra en herramientas de escritorio como Atomic Chat o en scripts propios sin depender de servicios en la nube.
- Evaluación de técnicas de cuantización: el repositorio de métricas (`AtomicChat/Inkling-2-Mini-GGUF-metrics`) permite reproducir la comparación entre presets de llama.cpp y recetas AD por tensor.
- Generación asistida en local con decodificación especulativa: el drafter DSpark opcional está pensado para acelerar la inferencia en configuraciones compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas de fidelidad de la cuantización frente al BF16 de referencia, medidas con `llama-perplexity --kl-divergence` sobre un corpus neutro de 30 idiomas con 87 fragmentos de 4096 tokens:

| Fichero | Tamano (GB) | Top-1 | KLD media |
|---|---:|---:|---:|
| BF16 (referencia, 2 partes) | 52,2 | — | — |
| Q8_0 | 27,74 | 97,7 % | 0,0033 |
| AD-Q6_K | 23,79 | 97,6 % | 0,0037 |
| Q6_K (preset) | 23,40 | 97,3 % | 0,0047 |
| Q5_K_M (preset) | 19,81 | 96,3 % | 0,0079 |
| AD-Q5_K | 19,07 | 97,1 % | 0,0052 |
| Q4_K_M (preset) | 17,38 | 94,7 % | 0,0165 |
| AD-Q4_K | 16,53 | 96,3 % | 0,0080 |
| AD-IQ4_XS | 15,00 | 95,8 % | 0,0101 |
| AD-IQ3_S | 13,34 | 94,2 % | 0,0205 |
| AD-IQ3_XXS | 12,58 | 93,3 % | 0,0271 |
| AD-IQ2_S | 11,56 | 91,3 % | 0,047 |
| AD-IQ2_XXS | 10,43 | 88,5 % | 0,084 |
| AD-IQ2_M | 8,67 | 85,7 % | 0,130 |
| AD-IQ2_XXS-Q2 | 7,90 | 84,3 % | 0,158 |
| AD-IQ1_M | 7,26 | 81,1 % | 0,236 |
| AD-IQ1_S | 6,88 | 79,5 % | 0,278 |

El propio autor señala que el techo de fidelidad es del 97-98 % (incluso Q8_0 solo coincide con el token top-1 del BF16 el 97,7 % de las veces), posiblemente por la acumulación de redondeo a lo largo de las 48 pasadas del bucle; no se ha verificado.

## Requisitos de hardware

- VRAM estimada: tamaño del fichero más la caché KV más aproximadamente 1 GB de buffers. La caché KV es reducida porque solo 4 de 24 capas usan atención completa y el resto una ventana de 1024 tokens.
- Rango práctico: desde unos 8 GB (AD-IQ1_S, 6,88 GB) hasta unos 28-29 GB (Q8_0, 27,74 GB); el BF16 requiere más de 52 GB.
- GPU consumer: los ficheros AD-Q4_K (16,53 GB) y AD-IQ4_XS (15,00 GB) caben en GPUs de 24 GB; las variantes IQ3 e IQ2 permiten bajar a 12-16 GB.
- GPU profesionales: las mediciones de la model card se realizaron en H100 y A10.
- Opciones de despliegue: llama.cpp (builds recientes; algunas variantes requieren versiones concretas, ver limitaciones), Atomic Chat y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: los ficheros Q5_K_M y Q4_K_M con preset de llama.cpp siguen el layout del PR #32695 y no cargan en la build b12600.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de referencia estructural, este modelo se sitúa en la categoría de MoE de ~26 B totales con ~3,4 B activos y entrada multimodal, con licencia Apache-2.0 y pesos en GGUF, lo que facilita su despliegue local frente a alternativas de mayor tamaño o con licencias más restrictivas.

## Limitaciones y advertencias

- El techo de fidelidad de la cuantización es del 97-98 % en top-1 frente al BF16; no se alcanza una coincidencia superior ni siquiera en Q8_0.
- Los ficheros de 1 y 2 bits pierden calidad de forma acusada (top-1 del 79,5 % en IQ1_S y KLD de 0,278); solo son adecuados cuando no cabe nada mayor.
- Los presets Q5_K_M y Q4_K_M no cargan en la build b12600 de llama.cpp por el layout del PR #32695.
- No se publica la lista de idiomas soportados ni el contexto máximo del modelo; el uso multilingüe más allá de los 30 idiomas del corpus de calibración no está verificado.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- El modelo base se distribuye en NVFP4 y MXFP8; el BF16 de referencia es una desquantización, no el checkpoint original en precisión completa.
- La matriz de importancia se calculó parcialmente sobre Q8_0 (cuatro de seis fragmentos) en lugar de BF16, lo que puede introducir un sesgo menor en las recetas de cuantización.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Métricas de cuantización: https://huggingface.co/datasets/AtomicChat/Inkling-2-Mini-GGUF-metrics
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-locally
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
