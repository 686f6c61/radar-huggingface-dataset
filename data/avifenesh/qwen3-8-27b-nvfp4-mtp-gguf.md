# Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF

## Resumen

Qwen3.8-27B-NVFP4-MTP-GGUF es un artefacto de servicio publicado por Avifenesh que contiene una cuantización NVFP4 (4 bits, formato e2m1 con escalas FP8-e4m3 por bloque de 16) del modelo base Qwen/Qwen3.8-27B, junto con su cabeza MTP (multi-token prediction) integrada en el propio fichero GGUF. El objetivo no es ofrecer un modelo nuevo, sino un peso listo para producción que permita decodificación especulativa nativa en GPUs Blackwell (sm_120a) con el motor de servicio tiyuvta, manteniendo una fidelidad medible respecto al BF16 original.

El modelo conserva la ventana de contexto nativa de 262.144 tokens y un vocabulario de 248.320 entradas, con plantilla de chat embebida que incluye tool calling y bloques de razonamiento. La cuantización se generó con `llama-quantize` aplicando búsqueda de escalas por bloque e importance matrix, con embeddings y cabeza de salida en Q5_K y normas en F32, lo que sitúa el fichero principal en 15,7 GB.

Su relevancia actual es doble: por un lado demuestra que la cuantización NVFP4 de un modelo de ~27B puede servir con decodificación especulativa funcional en hardware consumer de gama alta (RTX 5090 Laptop); por otro, documenta con métricas de KLD y tasa de aceptación del draft head el coste real de fidelidad frente al BF16, algo poco habitual en artefactos de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con cabeza MTP adicional (`blk.64`, `nextn_predict_layers=1`) |
| Parametros totales | 32.768 (según safetensors del modelo base; el nombre comercial indica 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (4-bit e2m1, escalas FP8-e4m3 por bloque de 16); embeddings y output head en Q5_K; normas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal de 15.705.922.656 bytes; repo total 35,1 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversión del release BF16 de Qwen/Qwen3.8-27B mediante `convert_hf_to_gguf.py`, con proyecciones GDN sin fusionar (866 tensores, incluyendo el bloque MTP). La cuantización se realizó con `llama-quantize` en tipo NVFP4, con búsqueda de escala por bloque y una importance matrix derivada de 205.000 tokens de wikitext-2 train más código C/C++, disjunta de los conjuntos de evaluación. La cabeza MTP (15 tensores en `blk.64`) se mantiene sin ponderar por la imatrix al no tener entradas en ella, y se conserva byte-idéntica a la revisión anterior del repositorio.

La innovación principal es la integración de la cabeza MTP en el propio GGUF, lo que habilita decodificación especulativa sin ficheros auxiliares en motores compatibles. El autor publica además cabezas draft enmascaradas (FR-Spec) y ficheros de ranks en el repositorio, con `frspec-sxc32768` como draft head por defecto en el motor tiyuvta. No se dispone de información sobre el dataset de entrenamiento del modelo base, ni sobre si se aplicaron RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Tool calling y function calling, con plantilla de chat embebida en el GGUF.
- Bloques de razonamiento (thinking) soportados por la plantilla de chat.
- Decodificación especulativa nativa mediante la cabeza MTP incluida (K=3 en las mediciones publicadas).
- Razonamiento multi-paso orientado a flujos agénticos (el conjunto de evaluación del autor es una batería de prompts agénticos).
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: no incluida en este artefacto (la torre VL del modelo base no se incluye; es text-to-text).

## Casos de uso

- Servicio de agentes con contexto largo: con 262.144 tokens nativos y una latencia de primer token de 1,07 s en el turno 8 de una conversación agéntica de 38k tokens (95% de acierto de prefix cache), el modelo es adecuado para asistentes que acumulan historial y resultados de herramientas sin truncar.
- Despliegue en estaciones Blackwell de gama alta: la cuantización NVFP4 con decodificación especulativa MTP alcanza 137,9 tok/s de mediana en RTX PRO 6000 Blackwell, lo que permite servir un 27B en una sola GPU profesional.
- Inferencia en portátiles con RTX 5090 Laptop: 73,6 tok/s de mediana en decodificación especulativa hacen viable un asistente local de código o chat con contexto amplio en hardware móvil.
- Generación de código en pipelines internos: el artefacto reporta 0,0189 de KLD medio y 97,00% de coincidencia top-1 en código frente a BF16 con el motor memra, lo que lo hace apto para autocompletado y generación de parches donde la fidelidad al modelo original importa.
- Backend de chat con tool calling: la plantilla embebida con soporte de herramientas permite integrarlo directamente en orquestadores de agentes sin post-procesado de prompts.
- Evaluación y benchmarking de cuantizaciones: el repositorio publica protocolo de KLD, tasas de aceptación y comparativas con UD-Q4_K_M, lo que lo convierte en referencia útil para medir el impacto de NVFP4 frente a Q4_K_M en llama.cpp.
- Servicio con llama.cpp en DGX Spark: 1.508 tok/s de prefill a 512 tokens y 14,7 tok/s de decodificación en GB10, adecuado para prototipos y entornos de desarrollo con un solo nodo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Metrica | Valor | Contexto |
|---|---|---|
| Decode p50 tok/s, RTX PRO 6000 Blackwell | 137,9 | Speculative decode, MTP K=3 con draft head enmascarado (FR-Spec) |
| Decode p50 tok/s, RTX 5090 Laptop | 73,6 | Speculative decode, MTP K=3 con draft head enmascarado (FR-Spec) |
| Tasa de aceptación del draft, K=3 | 0,74 | Conjunto agéntico held-out del autor |

Fidelidad frente a BF16 (KLD menor es mejor; same top-1 mayor es mejor):

| Fichero | Motor | wiki mean KLD | wiki same top-1 | code mean KLD | code same top-1 |
|---|---|---|---|---|---|
| Este fichero (con imatrix) | llama.cpp default | 0,0843 | 89,96% | 0,0323 | 96,08% |
| Este fichero (con imatrix) | memra | 0,0570 | 92,23% | 0,0189 | 97,00% |
| Fichero anterior | llama.cpp default | 0,0988 | 89,18% | 0,0378 | 95,74% |
| Fichero anterior | memra | 0,0725 | 91,21% | 0,0252 | 96,44% |
| unsloth UD-Q4_K_M (16,56 GB) | llama.cpp default | 0,0254 | 95,97% | 0,0057 | 98,31% |

Rendimiento de servicio en DGX Spark (GB10, llama.cpp):

| Metrica | Este fichero | UD-Q4_K_M |
|---|---|---|
| Prefill pp512 (tok/s) | 1.508 | 959 |
| Decode tg128 (tok/s) | 14,7 | 13,0 |

Aceptación MTP en DGX Spark (memra, greedy, K=3, 8 prompts fijos, 256 tokens):

| Fichero | Aceptación MTP | Decode plano | Decode MTP |
|---|---|---|---|
| Este fichero | 67,1% | 14,3 tok/s | 31,3 tok/s |
| Fichero anterior | 63,0% | 14,4 tok/s | 30,5 tok/s |

Servicio con motor tiyuvta v0.101.0 (streaming por red, greedy, mediana por longitud de salida):

| Tokens de salida | Decode tok/s |
|---|---|
| 128 | 136 |
| 512 | 259 |
| 2048 | 166 |

## Requisitos de hardware

- VRAM estimada: el fichero principal ocupa 15,7 GB; con overhead de contexto KV y buffers de decodificación especulativa conviene prever 20-24 GB para contextos moderados y bastante más para contextos cercanos a 262k tokens.
- GPU recomendadas: RTX PRO 6000 Blackwell (137,9 tok/s medidos), RTX 5090 Laptop (73,6 tok/s medidos) y DGX Spark GB10 (14,7 tok/s en decodificación plana, 31,3 tok/s con MTP).
- Cabe en GPU consumer: sí, en RTX 5090 y previsiblemente en GPUs de 24 GB o más; el soporte NVFP4 está orientado a Blackwell (sm_120a), por lo que en arquitecturas anteriores el rendimiento y posiblemente el soporte del tipo de cuantización quedan fuera del caso de uso previsto.
- Opciones de despliegue: motor tiyuvta (referencia del autor), llama.cpp (con soporte NVFP4), memra (https://github.com/avifenesh/memra). Otros motores no están documentados en la información disponible.
- Latencia y throughput: TTFT de 1,07 s en el turno 8 de una conversación de 38k tokens con 95% de prefix cache; 136-259 tok/s de decodificación según longitud de salida en tiyuvta; 31,3 tok/s con MTP en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD wiki (llama.cpp) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-MTP-GGUF (este) | 32.768 (nominal 27B) | 262.144 | NVFP4 + Q5_K | 0,0843 | Apache-2.0 | Hugging Face |
| unsloth UD-Q4_K_M de Qwen3.8-27B | 32.768 (nominal 27B) | 262.144 (heredado del base) | Q4_K_M | 0,0254 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (BF16) | 32.768 (nominal 27B) | 262.144 | BF16 | referencia | Apache-2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la información disponible no incluye otros modelos de la misma categoría. Frente a UD-Q4_K_M, este artefacto pierde fidelidad (KLD 0,0843 frente a 0,0254 en wikitext) pero gana velocidad de prefill (1,57x) y decodificación (1,13x) en DGX Spark, además de incluir la cabeza MTP para decodificación especulativa.

## Limitaciones y advertencias

- Fidelidad inferior a UD-Q4_K_M: el KLD en wikitext es 3,3 veces mayor que el de la cuantización Q4_K_M de unsloth, lo que puede traducirse en degradación en tareas sensibles a la distribución exacta de probabilidades.
- Dependencia de hardware Blackwell: el artefacto está construido para sm_120a; en GPUs anteriores el soporte de NVFP4 y las ventajas de rendimiento no están garantizadas.
- Dependencia del motor: las mediciones de decodificación especulativa se realizaron con tiyuvta y memra; en otros motores el comportamiento de la cabeza MTP y de los ficheros de ranks puede diferir.
- Sin torre de visión: este artefacto es text-to-text; las capacidades multimodales del modelo base no están disponibles.
- Idiomas soportados no documentados: la model card no detalla cobertura lingüística, lo que impide garantizar calidad fuera de los idiomas evaluados por el autor.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de factualidad en este artefacto.
- Sesgos: no se han publicado análisis de sesgos en la información disponible.
- Benchmarks no verificados: todas las métricas de rendimiento y aceptación están marcadas como `verified: false` y provienen del propio autor.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y de los ficheros auxiliares (draft heads, ranks) por si tuvieran términos adicionales.
- Fichero de 15,7 GB más artefactos auxiliares: el repositorio completo ocupa 35,1 GB, lo que exige planificación de almacenamiento y de caché de descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de servicio tiyuvta: https://tiyuvta.ai
- Repositorio memra: https://github.com/avifenesh/memra
- Revisión anterior del fichero: `6c39753daccd7473d4e60735ec8ace1d30afdd10` (sha256 `1facf36c2db359dcf9c2475cf8f85fe84a528d10aaaaff20f7c0db3d561e024a`)
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
