# johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN

## Resumen

Swift 1.5 Flash-Next — Heretic V2 (HGN v2) es una conversión comunitaria del modelo Qwen 3.8 Swift 1.5 Flash-Next, en su variante Heretic V2 (pesos "abliterated", sin mecanismos de rechazo), realizada por johnlockejrr. El modelo parte de la arquitectura Qwen 3.8 Flash-Next, pasa por un post-entrenamiento de Swift 1.5, luego por una ablación de rechazos de jeffpeng3 y finalmente por una cuantización IQ4_XS-plus en GGUF de trubisky, que este repositorio recodifica al formato propietario HGN v2. El resultado es un checkpoint en `.hgn` pensado exclusivamente para el servidor halogen-flash-server sobre hardware AMD Strix Halo (gfx1151).

La relevancia de esta ficha es doble. Por un lado, documenta un caso de "reverse engineering" de pesos: la cadena de transformaciones acumula dos pasos de redondeo (la cuantización IQ4_XS original y la recodificación HGN), con errores relativos declarados de entre 0,06 % y 1,1 % según la familia de tensores. Por otro, ilustra un ecosistema emergente de formatos de pesos específicos para aceleradores integrados AMD, que no son compatibles con transformers, vLLM ni llama.cpp.

El repositorio pesa 118,8 GB e incluye el checkpoint principal (62,1 GiB), una tabla de lookup n-gram de 51B parámetros en FP8 (47,7 GiB, obligatoria) y una torre de visión opcional (0,84 GiB). El modelo está etiquetado como MoE, sin censura y orientado a código e ingeniería inversa, con licencia swift-open-license-1.0 y soporte declarado de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo Qwen 3.8 Flash-Next, con cabezal MTP (multi-token prediction) y torre de visión; incluye mezcladores "hyper-connection" y estado SSM segun las familias de tensores del manifiesto |
| Parametros totales | no disponible (no se declara el recuento total; la tabla n-gram auxiliar tiene 51B parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HGN v2 con formatos por familia de tensores: I4R (expertos enrutados, 4 bits), HT4 (proyecciones densas, LM head, embeddings), Q6G64 (mezcladores hyper-connection), FP8 (tabla n-gram), BF16 (torre de vision); origen IQ4_XS-plus GGUF |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (etiquetada como "other") |
| Formato de pesos | `.hgn` (HGN v2, spec 1.1.0); no compatible con safetensors, GGUF, transformers, vLLM ni llama.cpp |

## Arquitectura y entrenamiento

La arquitectura de base es Qwen 3.8 Flash-Next, un transformer con mezcla de expertos (MoE) que incorpora componentes poco habituales: mezcladores "hyper-connection" (tensores Q6G64), estado SSM, router, torre de visión y un cabezal MTP para decodificación especulativa. La tabla n-gram de 51B parámetros en FP8 actúa como mecanismo auxiliar de lookup, no como parte del tronco generativo. El checkpoint principal ocupa 62,1 GiB e incluye el cabezal MTP; la tabla n-gram (47,7 GiB) debe mantenerse junto al checkpoint porque el motor la requiere.

La cadena de entrenamiento y transformación es: Qwen/Qwen3.8-Flash-Next (arquitectura base) → ukisai/Swift1.5-Qwen3.8-Flash-Next (post-entrenamiento Swift 1.5) → jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic (ablación de rechazos Heretic V2) → trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer (GGUF IQ4_XS-plus de 94,7 GB) → este repositorio (HGN v2). La conversión se realizó con Quat3rnion/bf16-to-hgn (perfil v2, política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`, `--ht-beam 128`, semilla 0) sobre una RTX 3090 (sm_86), en 35 minutos 35 segundos, pasando de 1.658 tensores de origen a 2.349 de salida. El cabezal MTP se copió byte a byte del checkpoint publicado peonist-ai/halogen-qwen3.8-flash-next y no fue entrenado contra los pesos Heretic, por lo que es un cabezal estándar sobre un tronco modificado.

Es importante subrayar que esto no es una cuantización desde BF16: el origen ya está cuantizado (IQ4_XS-plus) y la conversión añade un segundo paso de redondeo. Los errores relativos declarados por `bf16-to-hgn verify` son 0,94 % por capa en expertos enrutados (I4R), 0,6–1,1 % en proyecciones densas, LM head y embeddings (HT4), ~0,06 % en mezcladores hyper-connection (Q6G64), 0,07 % en la tabla n-gram (FP8) y exactos en normas, router, estado SSM y torre de visión. Esta métrica mide solo el segundo redondeo, no la distancia respecto a los pesos BF16 originales.

## Capacidades

- Generación de texto en inglés y chino, con post-entrenamiento orientado a código e ingeniería inversa.
- Razonamiento multi-paso y resolución de problemas de código, herencia del tronco Qwen 3.8 Flash-Next.
- Procesamiento de visión: la torre de visión BF16 opcional (0,84 GiB) habilita entrada multimodal; sin ella el motor funciona solo con texto.
- Decodificación especulativa mediante cabezal MTP, que acelera la generación en el servidor halogen-flash.
- Lookup n-gram en FP8 como mecanismo auxiliar de predicción sobre la tabla de 51B parámetros.
- Modo sin censura: los comportamientos de rechazo han sido eliminados deliberadamente de los pesos.
- No se declara soporte de tool calling, function calling ni comportamiento agéntico en la información disponible.
- No se declara soporte de audio en la información disponible.

## Casos de uso

- Ingeniería inversa de binarios y análisis de código: el modelo está ajustado específicamente para tareas de reverse engineering, por lo que encaja en pipelines de desensamblado, reconstrucción de lógica y documentación de código ofuscado en entornos controlados.
- Generación de código en inglés y chino: útil para equipos que trabajan con bases de código mixtas en ambos idiomas, aprovechando el post-entrenamiento Swift 1.5 sobre Qwen 3.8.
- Asistencia técnica sin filtros de rechazo: escenarios de investigación donde las respuestas evasivas del modelo base obstaculizan el análisis (por ejemplo, explicación de vulnerabilidades o técnicas de explotación en laboratorio).
- Inferencia local en hardware AMD Strix Halo: el formato HGN v2 y el servidor halogen-flash permiten desplegar un MoE grande en un equipo integrado con 124 GiB de memoria unificada, sin GPU discreta.
- Procesamiento multimodal texto-imagen: con la torre de visión montada, el modelo puede describir diagramas técnicos, capturas de código o esquemas de circuitos dentro del mismo servidor.
- Evaluación de formatos de pesos alternativos: este repositorio sirve como referencia práctica para estudiar el impacto del doble redondeo (IQ4_XS → HGN) en la calidad de un MoE, comparando el error por familia de tensores.
- Generación a velocidad interactiva en single-user: con ~56 tok/s y 93 tok/s agregados a 4 concurrentes en Strix Halo, es viable para asistentes de escritorio o entornos de desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. La model card indica explícitamente que "quality benchmarks pending" y que no se ha ejecutado ninguna prueba de calidad.

Datos de rendimiento medidos (halogen-flash-server 0.18.22, Strix Halo, 124 GiB, prompts cortos, 512 tokens de salida, MTP activado):

| Metrica | Valor |
|---|---|
| Throughput single-user | ~56 tok/s |
| Throughput agregado a 4 concurrentes | 93 tok/s |
| Prefill a 6,1K tokens | ~1.800 tok/s |
| Tiempo de arranque del servidor | 12,5 s |

## Requisitos de hardware

- VRAM/memoria: aproximadamente 62 GiB residentes para el checkpoint principal más la tabla n-gram mapeada en memoria (47,7 GiB en disco); total del repositorio ~111 GiB.
- Hardware objetivo: AMD Strix Halo con gfx1151 y 124 GiB de memoria unificada; la model card cita este entorno como referencia de despliegue.
- GPU discretas: no se declara compatibilidad con A100, H100 o RTX 4090 para este formato; la conversión se generó en una RTX 3090 (sm_86), pero el resultado no se validó byte a byte contra el backend CPU.
- GPU de consumo: no cabe en GPU de consumo convencionales por el tamaño del checkpoint y la tabla n-gram.
- Despliegue: exclusivamente mediante halogen-flash-server (contenedor); no compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: ~56 tok/s single-user, 93 tok/s a 4 concurrentes, ~1.800 tok/s de prefill a 6,1K tokens, con MTP activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este modelo (Heretic V2 HGN) | no disponible (MoE; n-gram 51B) | no disponible | `.hgn` | swift-open-license-1.0 | halogen-flash-server (AMD gfx1151) |
| trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer | no disponible | no disponible | GGUF IQ4_XS-plus (94,7 GB) | no disponible | llama.cpp y afines |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic | no disponible | no disponible | no disponible | no disponible | transformers/vLLM (previsible) |
| peonist-ai/halogen-qwen3.8-flash-next | no disponible | no disponible | `.hgn` | no disponible | halogen-flash-server |

La comparación con alternativas de la misma categoría (MoE de gran tamaño sin censura) queda limitada porque la información proporcionada no incluye parámetros totales, contexto ni resultados de benchmarks de ninguno de los modelos de la cadena. La diferencia principal frente al GGUF de origen es el formato y el doble redondeo; frente al checkpoint halogen estándar, la diferencia es la ablación Heretic y el tronco post-entrenado Swift 1.5.

## Limitaciones y advertencias

- Modelo sin censura: los comportamientos de rechazo han sido eliminados deliberadamente; el usuario es responsable del uso y debe cumplir la legislación aplicable.
- Doble redondeo: el checkpoint no es equivalente a BF16; parte de un GGUF ya cuantizado (IQ4_XS-plus) y añade un segundo paso de cuantización, con errores relativos de hasta 1,1 % en proyecciones densas.
- Cabezal MTP desalineado: se copió del checkpoint estándar halogen-qwen3.8-flash-next y fue entrenado contra el tronco original, no contra los pesos Heretic; la calidad de la decodificación especulativa puede degradarse.
- Conversión no cualificada: no ha sido validada por los autores de ningún proyecto upstream; la comparación byte a byte entre backend CUDA y CPU no se realizó (el conversor está cualificado para sm_89 y esta ejecución usó sm_86).
- Compatibilidad restringida: los pesos `.hgn` no cargan en transformers, vLLM ni llama.cpp, y el widget de Hugging Face no puede ejecutarlos; el despliegue exige halogen-flash-server.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinación: no se han publicado benchmarks de calidad, por lo que no hay evidencia cuantificada de fidelidad factual.
- Licencia swift-open-license-1.0: deben revisarse las condiciones antes de cualquier uso comercial; la model card remite al enlace de licencia del repositorio ukisai/Swift1.5-Qwen3.8-Flash-Next.
- La tabla n-gram es obligatoria y debe mantenerse junto al checkpoint; omitirla impide el funcionamiento del motor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Next-Heretic-V2-HGN (URL indicada: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN)
- Modelo base (GGUF): https://huggingface.co/trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Pesos Heretic V2: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Post-entrenamiento Swift 1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Checkpoint HGN de referencia: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Servidor halogen-flash: https://github.com/peonist-ai/halogen-flash-server
- Especificación HGN: https://github.com/jtsylve/hgn-spec
