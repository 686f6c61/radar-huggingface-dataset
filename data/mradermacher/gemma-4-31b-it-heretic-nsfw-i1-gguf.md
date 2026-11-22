# mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF` es una coleccion de cuantizaciones GGUF, generadas con tecnicas de imatrix (importance matrix), del modelo `yukiworks/gemma-4-31B-it-heretic-NSFW`. Este modelo base es, a su vez, una variante "abliterated" o "decensored" del Gemma 4 31B instruct de Google, en la que se han eliminado o atenuado los mecanismos de rechazo y moderacion para permitir contenido sin censura, incluido contenido NSFW. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF conocido por publicar versiones optimizadas de modelos populares para su uso con llama.cpp y derivados.

El modelo cuenta con 30.697.345.596 parametros reales (segun los safetensors del modelo base), lo que lo situa en la categoria de 31B, y esta disenado para inferencia local en hardware de consumo o semiprofesional mediante cuantizaciones que van desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB). Es un modelo multimodal de vision, ya que el autor indica que los ficheros mmproj, si existen, se alojan en el repositorio estatico asociado. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial.

Su relevancia actual radica en que ofrece una via practica para ejecutar un modelo de 31B con capacidades de vision y sin filtros de contenido en equipos con GPU de consumo, algo demandado por comunidades de investigacion, escritura creativa sin restricciones y experimentacion con modelos sin alineacion. No obstante, la ausencia de benchmarks publicados y la naturaleza sensible del ajuste exigen cautela antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, transformer; detalles no publicados en la informacion) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el linaje (`gemma-4-31B-it`), se trata de un transformer de la familia Gemma 4 de Google en su variante instruct, con aproximadamente 30,7 mil millones de parametros. El modelo base `yukiworks/gemma-4-31B-it-heretic-NSFW` ha sido sometido a un proceso de "abliteration" o "decensoring", una tecnica que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, habitualmente mediante la proyeccion o eliminacion de direcciones de activacion asociadas al comportamiento de rechazo. No se especifican en la informacion los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales.

La aportacion de esta ficha concreta es la cuantizacion con imatrix (importance matrix), que calcula matrices de importancia a partir de un corpus de calibracion para asignar mas bits a los pesos mas sensibles. El autor incluye el fichero `imatrix.gguf` (0,1 GB) para que otros puedan generar sus propias cuantizaciones. Las cuantizaciones i1 (IQ) suelen ofrecer mejor relacion calidad/tamano que las K-quants estaticas de tamano equivalente, segun las notas del propio autor. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Capacidades multimodales de vision: el autor indica explicitamente que es un modelo de vision y que los ficheros mmproj se alojan en el repositorio estatico.
- Comportamiento "uncensored" o "decensored": reduce los rechazos y permite generar contenido sensible, incluido NSFW, segun los tags del repositorio.
- Razonamiento y generacion de codigo heredados del modelo Gemma 4 instruct subyacente (no verificados con benchmarks en la informacion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (thinking mode, audio): no disponibles en la informacion.

## Casos de uso

- Escritura creativa sin restricciones: el ajuste heretic-NSFW permite generar narrativa adulta, ficcion explicita o dialogos sin los rechazos tipicos de los modelos alineados, ejecutable localmente con cuantizaciones Q4_K_M (18,8 GB) en una GPU de 24 GB.
- Investigacion sobre alineacion y seguridad: util para estudiar el efecto del abliteration comparando respuestas del modelo base Gemma 4 instruct frente a esta variante, midiendo tasas de rechazo y deriva de comportamiento.
- Procesamiento de documentos con imagenes en local: al ser un modelo de vision, puede usarse para extraer descripciones o transcribir contenido visual en entornos air-gapped donde no se permite enviar datos a APIs externas, usando los ficheros mmproj del repositorio estatico.
- Generacion de personajes y roleplay: su naturaleza conversacional y sin censura lo hace adecuado para asistentes de personaje en aplicaciones de entretenimiento, con la cuantizacion IQ4_XS (16,8 GB) como equilibrio entre calidad y VRAM.
- Prototipado de chatbots sin filtros en ingles: desarrolladores que necesiten un modelo de ~31B para pruebas de concepto de对话 abierto pueden desplegarlo con llama.cpp u Ollama y evitar costes de API.
- Experimentacion con cuantizaciones imatrix: el fichero imatrix incluido y el amplio catalogo de cuantizaciones permiten a investigadores comparar perplejidad y calidad entre IQ y K-quants sobre un mismo modelo de 31B.
- Fine-tuning o destilacion posterior: las cuantizaciones de mayor tamano (Q6_K, 25,3 GB) sirven como referencia de calidad para evaluar si un ajuste propio degrada el rendimiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 7,3 GB (i1-IQ1_S, calidad muy baja) y 25,3 GB (i1-Q6_K). Las cuantizaciones recomendadas por el autor son i1-Q4_K_M (18,8 GB, "fast, recommended") e i1-Q4_K_S (17,9 GB, "optimal size/speed/quality").
- GPU recomendadas: para Q4_K_M y superiores, GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para cuantizaciones IQ2 e IQ3 (8,8-16,7 GB), GPU de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabida en GPU de consumo: si. En RTX 4090 (24 GB) caben Q4_K_M, Q5_K_M y Q6_K; en RTX 4070 Ti (12 GB) caben IQ2_M e IQ3_XS; en GPUs de 8 GB solo las cuantizaciones IQ1, con calidad muy degradada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). Para vision es necesario cargar el fichero mmproj del repositorio estatico. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-heretic-NSFW-i1-GGUF (este) | 30,7B | no disponible | apache-2.0 (enlace a Gemma 4) | GGUF imatrix | Variante sin censura, vision, solo ingles |
| gemma-4-31B-it-heretic-NSFW-GGUF (estatico) | 30,7B | no disponible | apache-2.0 | GGUF estatico | Mismo modelo base, cuantizaciones K-quants sin imatrix |
| Gemma 4 31B instruct (original) | ~31B | no disponible | Gemma 4 license | safetensors, GGUF | Version alineada con filtros de seguridad, multilingue |
| Modelos abliterated de ~30B (generico) | variable | variable | variable | GGUF | Alternativas sin censura de otros autores; sin datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- Contenido sin censura: el ajuste heretic-NSFW elimina los rechazos de seguridad, por lo que puede generar contenido ofensivo, sexual explicito o danino sin advertencia. No es apto para aplicaciones dirigidas al publico general ni para entornos regulados.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un modelo abliterated, la degradacion de capacidades respecto al original no esta cuantificada.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: la longitud de contexto no se especifica en la informacion; no debe asumirse la del Gemma 4 original sin verificacion.
- Licencia ambigua: aunque el campo declara apache-2.0, el enlace apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribucion. Conviene revisar los terminos de Gemma antes de un despliegue comercial.
- Cuantizaciones de baja calidad: las variantes IQ1 e IQ2 (7,3-11 GB) degradan notablemente la coherencia; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Vision: requiere descargar los ficheros mmproj desde el repositorio estatico; no estan incluidos en este repositorio.
- Fecha de creacion futura (2026-11-15): dato anomalo en los metadatos que conviene verificar antes de confiar en la cronologia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-heretic-NSFW-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
