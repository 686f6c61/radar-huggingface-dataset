# jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF

## Resumen

ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M es una cuantización GGUF del checkpoint BF16 `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16`, publicada por el usuario jakeatx (JakeATX) bajo la librería llama.cpp. El modelo subyacente es un derivado "uncensored" (reducción de rechazos, estilo abliterated) del Swift 1.5 de UkisAI, que a su vez parte de Qwen3.8-27B. El repositorio contiene pesos de 27.320.697.856 parámetros cuantizados a 4,56 bits por peso en un único fichero de 14,52 GiB (15.588.550.976 bytes).

La aportación concreta de esta ficha no es un modelo nuevo, sino una receta de cuantización: el autor aplica el mismo mapa de tipos por tensor ("XS-M") que en su cuantización de Qwen3.8-27B, combinando IQ4_XS para el grueso de los pesos con Q5_0, Q6_K, Q8_0 y Q4_K en tensores seleccionados (cabezal de salida, proyecciones K/V, capas GDN y capa MTP). Se conserva el cabezal MTP (multi-token prediction) del modelo fuente, lo que permite decodificación especulativa con borradores internos, pero no se incluye la torre de visión.

Su relevancia práctica es doble: por un lado, ofrece un modelo de ~27B en un fichero que cabe en una GPU de 24 GB manteniendo una ventana declarada de 262.144 tokens; por otro, documenta de forma inusualmente explícita el proceso de cuantización (mapa de tensores, imatrix, hashes SHA-256). El propio autor advierte de que no se han publicado mediciones de calidad ni de velocidad para esta cuantización, y de que la matriz de importancia utilizada es transferida desde la versión anterior del modelo, no calibrada sobre Swift 1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B; incluye cabezal MTP para decodificación especulativa; sin torre de visión). Detalles de capas y atención del modelo base: no disponibles |
| Parametros totales | 27.320.697.856 (27,32B) |
| Longitud de contexto | 262.144 tokens (según el comando de ejecución documentado por el autor); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | IQ4_XS (mayoría), Q5_0 (atención output, GDN output, FFN down, capa MTP), Q6_K (cabezal de salida y K/V seleccionadas), Q8_0 (K/V seleccionadas y vectores GDN pequeños), Q4_K (token embedding). Promedio: 4,56 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (`license: other`), heredada de Swift 1.5; incluye ficheros LICENSE, LICENSE-APACHE-2.0 y NOTICE |
| Formato de pesos | GGUF (fichero único `ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M.gguf`, 14,52 GiB, SHA-256 `b5c43ac588ef45143afa25441d722ce86d199b77b7d7f808e29a7cffc4f2f244`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: cuantiza el checkpoint BF16 de d0xin, que a su vez deriva de UkisAI Swift 1.5 (revisión del código fuente `15165fce17cb716934a2b15e746d9c7b061d4a0f`), construido sobre Qwen3.8-27B. La arquitectura de partida es, por tanto, la de Qwen3.8-27B, con la particularidad de que Swift 1.5 conserva el cabezal MTP (multi-token prediction). Ese cabezal se incluye en el GGUF y se emplea como borrador interno para decodificación especulativa mediante `--spec-type draft-mtp` en el fork llamAmpere. El GGUF no contiene la torre de visión del modelo original, por lo que el resultado es exclusivamente texto.

El proceso de cuantización es el elemento técnico mejor documentado. Se aplicó un mapa explícito de tipos por tensor (`tensor_types_ATX-4-XS.txt`, SHA-256 `c1b4daffc5d0f623d259179c375f08dab6b516b1a5d92a64a7e71c4812963268`), verificado contra la cuantización previa de Qwen3.8-27B del mismo autor, y se usó una matriz de importancia transferida desde la cuantización anterior del modelo uncensored (`imatrix_swift1_unc_transfer.gguf`), calculada originalmente sobre unos 226.000 tokens de calibración en precisión Q8_0. El autor indica explícitamente que es una matriz transferida, no calibrada sobre Swift 1.5, y que no ha medido el efecto de esa transferencia en la calidad. La conversión y cuantización se ejecutaron en CPU (núcleos 12-13, prioridad baja); se realizó una comprobación estructural de tensores antes de la subida y se verificó el SHA-256 del fichero completo registrado por Hugging Face Xet, pero no se reevaluó la calidad de inferencia. No hay información sobre el dataset de entrenamiento, número de tokens, ni sobre si hubo RLHF o DPO en el modelo fuente.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`) en formato chat.
- Decodificación especulativa con el cabezal MTP incluido, que actúa como modelo borrador para acelerar la generación en llama.cpp/llamAmpere.
- Modo "uncensored"/abliterated: reducción deliberada de rechazos respecto al modelo alineado original, orientada a contenido que el modelo base rechazaría.
- Ventana de contexto larga: hasta 262.144 tokens según la configuración documentada (requiere tipos de caché KV `sjkvarn4` en el fork llamAmpere).
- Inferencia local en GGUF con llama.cpp y derivados; compatible con `llama-server` y con el endpoint compatible de Hugging Face (`endpoints_compatible`).
- Capacidades multilingües: no disponibles (el autor no documenta idiomas).
- Sin visión: el GGUF no incluye la torre de visión, aunque el modelo base sea multimodal.
- No se documentan soporte de tool calling, function calling ni capacidades de agente para esta cuantización.

## Casos de uso

- Escritura creativa y narrativa sin filtros: el carácter uncensored permite generar ficción con violencia, temas adultos o lenguaje explícito que el Qwen3.8 alineado rechazaría; útil para autores que necesitan borradores sin interrupciones por rechazo.
- Investigación sobre comportamiento de rechazo: comparar las respuestas de esta cuantización con el modelo base alineado permite estudiar qué capacidades de seguridad se degradan tras el proceso de abliteration y en qué tipos de prompt.
- Red teaming y evaluación de salvaguardas: usar el modelo como generador adversarial controlado en local para probar clasificadores de contenido, filtros de entrada/salida o pipelines de moderación, con la ventaja de que no requiere enviar prompts sensibles a una API externa.
- Asistente local de análisis de documentos largos: con 262.144 tokens de contexto declarados, puede procesar contratos, informes o transcripciones extensas en una sola pasada sobre una RTX 3090/3090 Ti, sin conexión a internet.
- Generación de datos sintéticos para ajuste fino: producir corpus conversacionales diversos en local para tareas de destilación o SFT, asumiendo que el contenido generado debe filtrarse y revisarse antes de usarse como datos de entrenamiento.
- Despliegue de inferencia en hardware de consumo: un fichero de 14,52 GiB permite servir el modelo en una GPU de 24 GB con cuantización de 4,56 bpw, habilitando prototipado y demos offline en estaciones de trabajo con una sola tarjeta.
- Aceleración de throughput con decodificación especulativa: el cabezal MTP permite configurar borradores internos (`--spec-draft-n-max 6`) para aumentar tokens por segundo en servidores llama.cpp, útil en escenarios de alto volumen con latencia tolerada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no reclama ninguna medición de calidad ni de velocidad para esta cuantización, y que la calidad de inferencia no se reevaluó tras el proceso. Tampoco se ofrecen cifras de tokens por segundo; únicamente se remite a las notas de la versión llamAmpere v0.6 para velocidades medidas del runtime, no de este fichero concreto.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Velocidad de inferencia (tokens/s) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,5 GiB solo para pesos en IQ4_XS-M; hay que sumar la caché KV, cuyo tamaño depende de la ventana configurada y del tipo de cuantización de caché (`sjkvarn4` en el ejemplo del autor).
- El autor documenta explícitamente la ejecución en una única tarjeta de 24 GB (RTX 3090 / 3090 Ti) con contexto de 262.144 tokens, usando `-ngl 99 -fa on` y `--parallel 1`.
- En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000) los pesos caben, pero la ventana de contexto viable será muy inferior a 262.144 tokens; no hay mediciones publicadas al respecto.
- En GPUs de 12 GB o menos no cabe entero en VRAM con esta cuantización; requeriría offload parcial a CPU (pérdida notable de velocidad) o una cuantización de menor tamaño, no publicada en este repositorio.
- Opciones de despliegue documentadas: `llama-server` de llama.cpp y el fork llamAmpere v0.6 (rama `v0.6`, compilación CUDA sm86, con soporte de `--spec-type draft-mtp` y tipos de caché KV `sjkvarn4`). No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor menciona que la decodificación especulativa mb-MTP está activada por defecto en llamAmpere v0.6, sin cifras asociadas a este fichero.
- Compilación de referencia: `cmake -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86`, con `-b 4096 -ub 1024` y `--parallel 1` en el ejemplo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M (este) | 27,32B | 262.144 tokens (config. documentada) | GGUF, IQ4_XS-M, 14,52 GiB | Swift Open License v1.0 | Hugging Face, 3.327 descargas | Sin benchmarks publicados; sin torre de visión; con cabezal MTP |
| d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16 (base) | 27,32B | no disponible | BF16 (safetensors, presumiblemente) | Swift Open License v1.0 | Hugging Face | Checkpoint de referencia sin cuantizar; pesos BF16 no redistribuidos en el repo cuantizado |
| ukisai/Swift-1.5-Qwen3.8-27b (fuente) | ~27B (Qwen3.8-27B) | no disponible | no disponible | Swift Open License v1.0 | Hugging Face | Modelo alineado original de UkisAI, con cabezal MTP |
| jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF (versión anterior) | ~27B | no disponible | GGUF IQ4_XS-M | Swift Open License v1.0 | Hugging Face | Cuantización previa sobre Swift 1.0; origen de la imatrix transferida |
| jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF | ~27B | no disponible | GGUF IQ4_XS-M | según modelo base Qwen | Hugging Face | Referencia del mapa de tipos por tensor XS-M reutilizado aquí |

## Limitaciones y advertencias

- Modelo uncensored/abliterated: la reducción de rechazos es intencionada y afecta a la alineación de seguridad. No debe desplegarse en aplicaciones de cara al público sin una capa de moderación externa.
- Ausencia total de evaluaciones: el autor no publica mediciones de calidad, capacidades ni velocidad, y confirma que la calidad de inferencia no se reevaluó tras la cuantización. Cualquier afirmación sobre su rendimiento relativo sería especulativa.
- Matriz de importancia transferida: la imatrix procede del modelo Swift 1.0 uncensored, no de Swift 1.5. El efecto de esta transferencia sobre la calidad no se ha medido, lo que introduce incertidumbre adicional frente a una cuantización calibrada correctamente.
- Degradación por cuantización: 4,56 bits por peso implica pérdida respecto al BF16, especialmente en tareas de razonamiento matemático y código; no hay comparación publicada entre ambas versiones.
- Riesgo de alucinación: inherente a los modelos de ~27B, agravado por la falta de benchmarks que permitan acotar su fiabilidad.
- Idiomas no documentados: se desconoce el soporte real de castellano u otras lenguas distintas del inglés y el chino; conviene validarlo empíricamente antes de usarlo en producción multilingüe.
- Sin visión: aunque el modelo base sea multimodal, este GGUF no incluye la torre de visión; no puede procesar imágenes.
- Licencia restrictiva y poco habitual: Swift Open License v1.0, registrada como `license: other`. Es imprescindible revisar `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de cualquier uso comercial; no se detallan aquí los términos de atribución ni las restricciones.
- Dependencia de un fork: la configuración documentada (contexto de 262.144 tokens, tipos de caché KV `sjkvarn4`, borradores MTP) requiere llamAmpere v0.6, no llama.cpp upstream. Sin ese fork, el rendimiento y la ventana de contexto pueden diferir.
- Sin soporte documentado en vLLM, TGI u Ollama, lo que limita las opciones de despliegue a escala.
- Cadena de derivaciones larga (Qwen3.8-27B → Swift 1.5 → derivado uncensored de d0xin → cuantización de jakeatx) con documentación desigual en cada eslabón.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF
- Modelo base (BF16): https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Modelo fuente Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantización previa Swift uncensored del mismo autor: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF
- Cuantización de referencia Qwen3.8-27B (mapa XS-M): https://huggingface.co/jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF
- Fork de inferencia llamAmpere: https://github.com/JakeATX/llamAmpere
- Notas de la versión llamAmpere v0.6 (velocidades medidas del runtime): https://github.com/JakeATX/llamAmpere/releases/tag/v0.6
- Paper, blog o demo adicionales: no disponible (la búsqueda web realizada no devolvió resultados relevantes sobre este modelo).
