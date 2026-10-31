# Prolokkmn/Qwen3.8-27B-Unleashed-GGUF

## Resumen

Qwen3.8-27B-Unleashed-GGUF es una cuantización GGUF en formato dinámico del modelo Qwen3.8-27B-Uncensored, publicado por el usuario Prolokkmn en Hugging Face. Se trata de una derivada "abliterated" (sin filtros de seguridad) del Qwen3.8 de 27B parámetros, cuantizada mediante asignación dinámica de bits por tensor siguiendo la receta Unsloth Dynamic 3.0, extraída directamente de los archivos publicados por unsloth/Qwen3.8-27B-GGUF.

El problema que resuelve es doble: por un lado, elimina los mecanismos de rechazo del modelo base para uso sin restricciones; por otro, reduce el tamaño del modelo manteniendo calidad, logrando que una cuantización Q3 dinámica iguale o supere en perplexidad a cuantizaciones Q4 uniformes considerablemente más grandes, con recuperación completa de agujas (needle retrieval) hasta 250.806 tokens de contexto.

El repo ofrece 9 niveles de cuantización (desde UD-IQ1_M hasta UD-IQ4_XS), todos verificados con pruebas de carga reales. Es relevante para quien necesite un modelo de 27B sin alineamiento que quepa en una RTX 4090 de 24 GB con contexto de 262.144 tokens (256k).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8, con cabeza MTP para decodificacion especulativa) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | UD-IQ1_M, UD-IQ2_S, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS y otros hasta 9 niveles (per-tensor dynamic quant, receta Unsloth Dynamic 3.0) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado; modelo base en safetensors bf16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B-Uncensored (de JonathanColetti), una version abliterated del Qwen3.8 de 27B. La arquitectura es un transformer decoder con una capa MTP (multi-token prediction) al final, usada para decodificacion especulativa (DFlash2 en las mediciones del autor). Los niveles de cuantizacion bajos (IQ1_M/IQ2_S) eliminan esa cabeza MTP: tienen 64 bloques en lugar de 65 y `nextn_predict_layers=0`, lo que exige reescribir los metadatos al cuantizar manualmente.

Sobre el entrenamiento del modelo base no se publica informacion en esta ficha (numero de tokens, composicion del dataset, RLHF/DPO): no disponible. Lo que si documenta el autor es la metodologia de cuantizacion: el mapa de tipos por tensor se extrajo de los GGUF de unsloth/Qwen3.8-27B-GGUF (Unsloth Dynamic 3.0) y se aplico sobre los pesos uncensored usando la matriz de importancia (imatrix) de ese repo. Los tensores sensibles conservan mas precision mientras los tolerantes se comprimen mas agresivamente. Todos los archivos del repo pasaron verificacion de bytes magicos y prueba de carga real antes de subirse.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Recuperacion de informacion en contexto extenso: needle retrieval verificado hasta 250.806 tokens con la cuantizacion UD-Q3_K_XL.
- Decodificacion especulativa compatible (capa MTP presente en los niveles Q3_K_XL y superiores), con aceleracion via DFlash2 en llama.cpp.
- Modelo sin filtros de seguridad (uncensored/abliterated): no rechaza peticiones por alineamiento.
- Soporte de tool calling: no disponible de forma explicita en la model card (el propio autor menciona trafico real con "tool calls" cortos, lo que sugiere compatibilidad, pero no esta documentado).
- Capacidades de vision, audio o thinking mode: no disponible.
- Idiomas: ingles y chino.

## Casos de uso

- Chatbots sin restricciones locales: al estar abliterated, permite despliegues conversacionales que no emiten negativas de seguridad, util en entornos de investigacion sobre alineamiento o ficcion creativa con contenido sensible.
- Analisis de documentos largos: con 262.144 tokens de contexto y needle retrieval verificado a ~250k tokens, puede procesar libros, contratos o corpus legales completos en una sola pasada.
- Agentes con tool calling en hardware consumer: el autor reporta trafico real (n=1.696 peticiones) con respuestas cortas de herramientas a ~24,9 tok/s medianos en una RTX 4090, suficiente para pipelines de agentes de una sola GPU.
- Generacion de prosa y codigo largo: en generaciones de mas de 1.500 tokens alcanza ~56,3 tok/s medianos, adecuado para escritura asistida y generacion de codigo extenso.
- Investigacion sobre cuantizacion: la documentacion detallada sobre topologia MTP, imatrix y errores de cuantizacion (Missing importance matrix, blk.63.nextn.eh_proj.weight not found) lo hace util como caso de estudio para quien cuantice modelos con cabezas MTP.
- Despliegue en servidores de inferencia locales: formato GGUF compatible con llama.cpp, LM Studio, Ollama y derivados, con KV cache q4_0 documentado para estirar el contexto en 24 GB de VRAM.
- Experimentacion con contenido no alineado en entornos controlados: util para red-teaming y evaluacion de robustez de filtros externos.

## Benchmarks y rendimiento

El autor publica mediciones propias (RTX 4090 24 GB, llama.cpp, DFlash2, KV cache q4_0, contexto 262.144, perplexidad wikitext-2 a 60 chunks). Advierte explicitamente que estos valores no son comparables con numeros de otros setups.

| Quant | Tamano | PPL ↓ | Tok/s medianos | Needle retrieval | Uncensored |
|---|---|---|---|---|---|
| Unleashed UD-IQ4_XS | 14,3 GB | 6,3502 | no disponible | pendiente | Si |
| Unleashed UD-Q3_K_XL | 13,2 GB | 6,4036 | 112,8 | Si, 250.806 tok | Si |
| Unleashed UD-IQ3_XXS | 11,0 GB | 6,4818 | no disponible | pendiente | Si |
| unsloth UD-Q3_K_XL (ref) | 12,24 GB | 6,3993 | 110,7 | Si, 250.806 tok | No |
| uncensored IQ4_XS (ref) | 15,1 GB | 6,4149 | 107,3 | 32k | Si |
| unsloth UD-Q4_K_XL (ref) | 16,7 GB | 6,4181 | 62,6 | 4k | No |
| uniform Q3_K_M + imatrix (ref) | 12,57 GB | 6,5316 | 84,8 | Si, 258.900 tok | Si |
| unsloth UD-Q2_K_XL (ref) | 9,15 GB | 6,6469 | no disponible | no disponible | No |

Conclusiones del autor: la Q3 dinamica supera en perplexidad a todas las Q4 probadas; frente a Q3 uniforme sobre los mismos pesos ofrece -0,13 PPL y +33% de throughput por 0,6 GB mas; la calidad empata con la Q3 de Unsloth (delta 0,0043, sigma ~0,045); Q2 es el suelo de calidad (~3,8% de degradacion).

Throughput por longitud de generacion (UD-Q3_K_XL, n=1.696 peticiones, RTX 4090):

| Tokens generados | n | Tok/s medianos |
|---|---|---|
| 1-50 (tool calls, acks cortos) | 1.289 | 24,9 |
| 51-200 | 97 | 32,6 |
| 201-600 | 191 | 43,6 |
| 601-1500 | 61 | 46,9 |
| 1500+ (prosa larga, codigo) | 58 | 56,3 |

Pico observado en una peticion: ~195 tok/s. No hay benchmarks estandar (MMLU, HumanEval, GSM8K): no disponible.

## Requisitos de hardware

- VRAM estimada: la cuantizacion UD-Q3_K_XL (13,2 GB) cabe con holgura en una RTX 4090 de 24 GB incluso con contexto de 262.144 tokens usando KV cache q4_0. UD-IQ4_XS ocupa 14,3 GB; UD-IQ3_XXS, 11,0 GB; UD-IQ2_S/IQ1_M, menos (tamanos exactos no disponibles para los niveles mas bajos).
- GPU de referencia en las mediciones: RTX 4090 24 GB. Para niveles superiores o contexto completo en fp16 KV, GPUs de 48 GB (A6000, L40S) o A100/H100 serian adecuadas; no hay mediciones publicadas en esas tarjetas.
- Cabe en GPU consumer: si, verificada en RTX 4090 con las cuantizaciones dinamicas publicadas.
- Despliegue: llama.cpp (entorno de las pruebas, con DFlash2 para decodificacion especulativa); por ser GGUF, compatible con Ollama, LM Studio, llama-server y cualquier runtime GGUF. No hay soporte documentado de vLLM o TGI para estos GGUF.
- Latencia/throughput: 24,9-56,3 tok/s medianos segun longitud de generacion en RTX 4090; pico ~195 tok/s. En cargas de agente con respuestas cortas, planificar por el extremo inferior (~25 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | PPL (wikitext-2, mismo harness) | Licencia |
|---|---|---|---|---|---|
| Prolokkmn/Qwen3.8-27B-Unleashed-GGUF | 27B | 262.144 | UD-Q3_K_XL, 13,2 GB | 6,4036 | Apache 2.0 |
| unsloth/Qwen3.8-27B-GGUF | 27B | 262.144 | UD-Q3_K_XL, 12,24 GB | 6,3993 | Apache 2.0 |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B | 262.144 | IQ4_XS, 15,1 GB | 6,4149 | Apache 2.0 |
| Uniform Q3_K_M + imatrix (sobre pesos uncensored) | 27B | 262.144 | 12,57 GB | 6,5316 | Apache 2.0 |

La version Unleashed empata en calidad con la de Unsloth (diferencia dentro del error) pero sobre pesos uncensored, y supera tanto a la IQ4_XS uncensored uniforme (menor PPL, 1,9 GB menos, retrieval a 250k frente a 32k) como a la Q3 uniforme (mejor PPL y +33% de throughput).

## Limitaciones y advertencias

- Modelo abliterated: elimina los rechazos de seguridad del modelo base. Esto implica riesgo real de generar contenido ofensivo, peligroso o ilegal si se despliega sin controles externos. No apto para produccion orientada a usuarios finales sin capas de moderacion propias.
- Alucinacion: al tratarse de un modelo sin alineamiento y sin datos de benchmarks estandar publicados, no hay forma de evaluar su tasa de alucinacion frente al modelo original; asumir riesgo elevado.
- Sesgos: no disponible; abliteration no corrige sesgos del modelo base y puede amplificar comportamientos indeseados.
- Idiomas: soporte documentado solo para ingles y chino; el rendimiento en castellano no esta verificado.
- Cuantizacion: los niveles UD-IQ1_M y UD-IQ2_S se publicaron rotos inicialmente y se reconstruyeron el 2026-08-21; si se descargaron antes de esa fecha, hay que volver a descargarlos. Los niveles IQ3_XXS e IQ4_XS tienen mediciones de velocidad y retrieval pendientes.
- Cuantizacion manual: cuantizar desde el f16 de 65 bloques con la imatrix de 496 entradas falla; hay que podar la capa MTP y sobrescribir `block_count` y `nextn_predict_layers` en los metadatos (ver comando en la model card).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del Qwen3.8 original de Alibaba para despliegues comerciales.
- Procedencia: el mapa de cuantizacion no es trabajo original del autor, sino extraido de Unsloth; la trazabilidad de calidad depende de la receta upstream.
- Throughput en agentes: las respuestas cortas sufren el coste fijo por peticion de un modelo de 27B (~25 tok/s); no planificar capacidad con el pico de 195 tok/s.

## Enlaces

- Ficha del modelo: https://huggingface.co/Prolokkmn/Qwen3.8-27B-Unleashed-GGUF
- Modelo base uncensored: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- GGUF upstream de Unsloth (origen del mapa de cuantizacion): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
