# litert-community/Hy-MT2-1.8B

## Resumen

Hy-MT2-1.8B es un modelo de traducción multilingüe desarrollado por Tencent, distribuido originalmente en Hugging Face como `tencent/Hy-MT2-1.8B`. La versión aquí descrita es la conversión realizada por la comunidad `litert-community` al formato `.litertlm` de Google LiteRT-LM, pensada para inferencia en dispositivo (on-device) en móviles, portátiles y placas embebidas. Cubre 33 idiomas y está específicamente afinado para seguir instrucciones de traducción, no para mantener conversaciones generales.

Arquitectura `hunyuan_v1_dense` con 32 capas, dimensión oculta 2048, 16 cabezas de consulta y 4 de clave/valor (GQA) con QK-norm, `head_dim` 128, vocabulario de 120.818 tokens y embeddings atados. Suma 2.040 millones de parámetros (etiquetado comercialmente como 1.8B). El artefacto distribuido es una cuantización dinámica int8 de 1,83 GB.

Su relevancia actual radica en que lleva traducción multilingüe de calidad a hardware sin GPU dedicada: el bundle incluye grafos de prefill y decode optimizados para GPU móvil (WebGPU, GPU de Android) y CPU, con métricas medidas en un Galaxy S26 (27,4 tok/s de decode en GPU) y en un Mac Studio M4 Max (150,7 tok/s). La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`), 32 capas, hidden 2048, GQA 16Q/4KV, QK-norm, head_dim 128, embeddings atados |
| Parametros totales | 2,04 mil millones (2.040M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 dinamico en tiempo de exportacion (lineales + embedding); el artefacto publicado es `Hy-MT2-1.8B_int8.litertlm` |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en safetensors (no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo sigue la pila `hunyuan_v1_dense` de Tencent: transformer decoder-only denso con 32 capas, atención con 16 cabezas de consulta y 4 de clave/valor (GQA, ratio 4:1), normalización QK aplicada sobre las consultas y claves, `head_dim` de 128 y matriz de embedding compartida con la cabeza de salida (vocabulario de 120.818 tokens). El tamaño efectivo de 2,04B parámetros se corresponde con el nombre comercial "1.8B".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card del bundle LiteRT-LM no los detalla y la información proporcionada no los incluye. La innovación técnica documentada se sitúa en la conversión, no en el entrenamiento: el bundle incorpora una reescritura del grafo GPU (2026-10-06) que fusiona las dos escrituras `DYNAMIC_UPDATE_SLICE` de la caché KV por capa en un único `STABLEHLO_COMPOSITE odml.cache_update`, sustituye los productos de atención `BATCH_MATMUL(adjY)` por `odml.runtime_bmm`, añade una firma `prefill_16` que comparte buffers de pesos con `prefill_128` y aplica la máscara de atención como suma sobre una vista `[bk, g, T, C]` de los logits. También se corrigió un doble BOS: la plantilla de chat renderiza `<|hy_begin_of_sentence|>` y el motor LiteRT-LM añadía además el `start_token` de metadatos, por lo que el bundle elimina ese token de metadatos para que el flujo en dispositivo coincida con el de entrenamiento.

## Capacidades

- Traducción multilingüe entre 33 idiomas, con instrucciones explícitas de traducción en el mensaje.
- Seguimiento de instrucciones de traducción (tono, formato, idioma destino) en lugar de comportamiento conversacional.
- Cobertura de idiomas de bajos recursos: tibetano (bo), jemer (km), birmano (my), uzbeko (uz), mongol (mn), uigur (ug), kazajo (kk), entre otros.
- Ejecución on-device con delegación completa de operadores: 1518 operaciones delegadas en GPU móvil.
- Compatibilidad con WebGPU en navegador mediante la demo de LiteRT-LM.
- No es un modelo de chat: una segunda interacción en la misma conversación falla; requiere un chat nuevo por cada texto.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción en tiempo real en aplicaciones móviles: el modelo corre íntegramente en la GPU de un Galaxy S26 a 27,4 tok/s de decode con 1,80 s de TTFT, suficiente para traducir mensajes y correos sin enviar texto a la nube.
- Traducción offline en dispositivos sin conectividad: al ejecutarse sobre LiteRT-LM en CPU móvil (14,4 tok/s de decode), permite traducir en modo avión o en entornos con red restringida.
- Traducción en navegador sin backend: la demo WebGPU carga el archivo de 1,83 GB y traduce localmente, útil para herramientas de escritorio o extensiones que no pueden desplegar infraestructura propia.
- Localización de documentación técnica: con 33 idiomas y seguimiento de instrucciones, se puede usar en pipelines por lotes que traducen READMEs, changelogs y cadenas de interfaz a varios idiomas de destino.
- Atención al cliente en mercados multilingües: integrado en apps de soporte, traduce mensajes entrantes y salientes en el propio dispositivo, lo que evita enviar datos personales a servidores externos.
- Traducción en placas embebidas y kioscos: el bundle está validado en Raspberry Pi 5 (filas medidas sobre el archivo anterior), lo que habilita señalización, tótems y dispositivos de atención presencial sin GPU.
- Traducción de contenido para comunidades lingüísticas poco cubiertas: el soporte de tibetano, jemer, birmano, mongol y uigur permite cubrir idiomas con poca oferta en modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, MMLU, etc.) en la informacion disponible. Los únicos datos publicados son de rendimiento en dispositivo y de verificación de correctitud:

| Entorno | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT |
|---|---|---|---|---|
| Galaxy S26 | GPU (LiteRT-LM prebuilt-adac974b) | 579 | 27,4 | 1,80 s |
| Galaxy S26 | CPU | 237 | 14,4 | 4,43 s |
| Mac Studio M4 Max | GPU, fp16, archivo nuevo | 2332 | 150,7 | 0,031 s (prompt 16 tok) |
| Mac Studio M4 Max | GPU, fp16, archivo anterior | 2014 | 103,5 | 0,076 s (prompt 16 tok) |

Verificación de correctitud publicada: 6/8 en una prueba de sanidad de 8 preguntas tanto en CPU como en GPU, con los mismos dos fallos en ambos backends (un antónimo y una rima), atribuidos al ajuste del modelo de 1,8B y no al backend. En la comparación A/B de traducción greedy contra la referencia en PyTorch bf16, 1 de 3 pruebas fue byte-idéntica y las otras dos produjeron alternativas fluidas propias de la diferencia int8 frente a bf16.

## Requisitos de hardware

- Tamaño del artefacto: 1,83 GB (`Hy-MT2-1.8B_int8.litertlm`), lo que determina el requisito de almacenamiento y, en la práctica, el de memoria para los pesos.
- VRAM/RAM estimada: no se publica una cifra oficial de memoria pico; el archivo de pesos ocupa 1,83 GB y hay que añadir caché KV y activaciones. En Mac CPU sin caché de pesos, la model card indica que el archivo nuevo tarda más en cargar y consume más memoria que el anterior.
- GPU validadas: GPU de Galaxy S26 (móvil, con delegación completa de 1518 operadores) y GPU de Mac Studio M4 Max. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el modelo está pensado para GPUs integradas y móviles; no se aportan datos de RTX 4090 ni de otras GPU de escritorio.
- Despliegue: runtime LiteRT-LM (versión 0.17.1 en Mac, `prebuilt-adac974b` en Android), demo web con WebGPU, y exportación mediante litert-torch con la opción `--apply_gpu_composites`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: ver tabla de benchmarks. El TTFT baja de 0,076 s a 0,031 s con prompt de 16 tokens en Mac GPU tras la reescritura del grafo, y el decode sube de 103,5 a 150,7 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato / despliegue | Licencia |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (LiteRT-LM) | 2,04B | no disponible | 33 | `.litertlm`, LiteRT-LM on-device | Apache 2.0 |
| tencent/Hy-MT2-1.8B (original) | 2,04B | no disponible | 33 | safetensors, PyTorch | Apache 2.0 |
| NLLB-200 (familia) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| M2M-100 (familia) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La información proporcionada solo permite comparar el bundle LiteRT-LM con su modelo base original; no incluye datos de benchmarks ni especificaciones de alternativas que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo conversacional: una segunda interacción en el mismo chat falla. Hay que abrir un chat nuevo por cada texto a traducir y enviar instrucción y texto en un único mensaje.
- El ajuste específico para traducción degrada tareas generales: en la prueba de sanidad de 8 preguntas falla 2, incluida una pregunta elemental de antónimos.
- La cuantización int8 introduce divergencias frente a la referencia bf16: solo 1 de 3 pruebas de traducción greedy fue byte-idéntica, con variaciones léxicas en las otras dos.
- No se documentan sesgos conocidos, comportamiento frente a alucinaciones ni evaluaciones de seguridad; la información disponible no los cubre.
- La longitud de contexto no está publicada, lo que impide garantizar el comportamiento con documentos largos.
- En Mac CPU sin caché de pesos, el archivo nuevo carga más lento y usa más memoria que el anterior; conviene usar la GPU o mantener la caché de pesos.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base de Tencent deben verificarse en su repositorio original.
- El rendimiento publicado corresponde a hardware concretos (Galaxy S26, Mac Studio M4 Max, Raspberry Pi 5); no hay garantías extrapolables a otros dispositivos.
- El bundle depende de la versión del runtime LiteRT-LM; cambios de versión pueden alterar el rendimiento o el comportamiento del grafo.

## Enlaces

- Repositorio Hugging Face del bundle: https://huggingface.co/litert-community/Hy-MT2-1.8B
- Modelo base original: https://huggingface.co/tencent/Hy-MT2-1.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat con WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Hy-MT2-1.8B
- Ficha de compatibilidad edge (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/hy-mt2-1.8b-int8/CARD.md
