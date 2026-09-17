# isihdfg/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio publica una familia de cuantizaciones GGUF de un ajuste fino comunitario derivado de la serie Qwen 3.8, identificado como Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP. El modelo subyacente es obra de DavidAU (visible en el campo `base_model` y en la model card) y esta subida concreta de los GGUF la firma el usuario isihdfg. Se distribuye con licencia Apache 2.0 y esta etiquetado para ingles y chino.

El modelo parte de 26.895.998.464 parametros (unos 26,9 mil millones) y se presenta como un ajuste multi-etapa y multi-merge orientado a tres objetivos simultaneos: elevar las metricas de razonamiento, reducir drasticamente el numero de tokens de "pensamiento" (la variante TURBO afirma recortes de entre 1/2 y 1/10 respecto al modelo base) y mejorar el rendimiento en generacion creativa y codigo. Incluye modos de pensamiento (thinking/reasoning) y se comercializa como "uncensored", "abliterated" y "heretic", es decir, con los mecanismos de rechazo atenuados o eliminados por tecnicas de abliteracion.

Su relevancia practica es doble. Por un lado, es un ejemplo de cadena de ajuste comunitario sobre hardware de consumo (entrenado con Unsloth segun la model card) y con tecnicas propias declaradas, como COLD FUSION (GAIN + Unsloth) y Fable Fusion 711. Por otro, la model card incluye afirmaciones de rendimiento muy agresivas (ARC-C 735 en 8 bits, ARC-E por encima de 880), que se presentan como superiores a modelos propietarios. Esas cifras son autodeclaradas y no van acompanadas de metodologia ni de verificacion independiente en la informacion disponible, por lo que deben tratarse con cautela. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y su fecha de creacion es el 17 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con modos de pensamiento y multi-token prediction (MTP) declarado; no se detalla el numero de capas, cabezas ni dimension oculta (no disponible) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B), dato de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en dos familias declaradas: "Regular GGUF Quants" y "MTP GGUF Quants"; se generan con imatrix y DI-MATRIX (doble imatrix). Se mencionan explicitamente Q4KS (no imatrix) y versiones de 4 y 8 bits. Lista completa de quants y bits por fichero: no disponible |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base del que deriva se etiqueta como bfloat16 (safetensors). Tamano total del repositorio: 389,0 GB |
| Pipeline declarado | image-text-to-text (segun metadatos de HuggingFace; la model card no describe capacidades de vision) |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets declarados | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Fecha de publicacion | 17 de septiembre de 2026 (creacion y ultima actualizacion identicas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer decoder-only de aproximadamente 26,9 B de parametros, con soporte declarado de tres modos de operacion (los tres modos de pensamiento de la familia Qwen 3: pensamiento explicito, no-pensamiento y modo hibrido, segun se deduce de las referencias a "all three modes of thinking", aunque la model card no los enumera formalmente). El modelo incorpora MTP (multi-token prediction), lo que en la practica se traduce en quants especificos "MTP" que permiten decodificacion de varios tokens por paso en runtimes compatibles. No se especifican numero de capas, cabezas de atencion, dimension del modelo ni mecanismos de atencion alternativos, por lo que esos datos quedan como no disponibles.

El proceso de creacion se describe como un ajuste fino multi-etapa, con multiples ajustes finos y un merge multi-estado sobre el modelo base. Se citan dos metodologias propias del autor: Fable Fusion 711 y COLD FUSION (GAIN + Unsloth). La componente GAIN se define como un metodo de programacion que modifica dinamicamente el entrenamiento por muestra en tiempo real conforme el modelo aprende; el entrenamiento se ejecuta con las herramientas de Unsloth. Los datasets declarados son Polar-STRICT-Datasets y F451-STRICT-Datasets, ambos de DavidAU, descritos como "STRICT", es decir, con criterios de filtrado o formateo estrictos para las etapas de ajuste. La model card menciona tambien tecnicas de abliteracion ("heretic", "abliterated", "ara") aplicadas para reducir los rechazos del modelo base, y afirma explicitamente que no se ha hecho "benchmaxing". No se indica el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon RLHF o DPO; la reduccion del bloque de razonamiento y su reformateo se presentan como parte del ajuste supervisado, sin detallar la receta.

## Capacidades

- Generacion de texto general, con enfasis declarado en detalle y calidad de salida.
- Razonamiento con modo de pensamiento explicito: la variante TURBO reduce el bloque de pensamiento entre 1/2 y 1/10 respecto al modelo base (mediana declarada de aproximadamente 2/3 de reduccion).
- Generacion de codigo: el sufijo NEO-CODER y la etiqueta "coder" indican ajuste orientado a codigo, aunque no se especifican lenguajes ni benchmarks de codigo concretos.
- Escritura creativa y ficcion: etiquetas "creative writing", "all genres", "story", "writing", "fiction" y "roleplaying".
- Conversacion multi-turno y roleplay (etiqueta "conversational").
- Capacidades multilingues limitadas a ingles y chino segun los metadatos de idioma.
- Modelo "uncensored"/"abliterated": los mecanismos de rechazo se han atenuado deliberadamente, por lo que responde a peticiones que otros modelos alineados rechazarian.
- Compatibilidad declarada con endpoints ("endpoints_compatible") y con tool calling: la model card remite a la pestana "community" para benchmarks de terceros que afirma incluyen "el mejor rendimiento de tool calling registrado". Ese dato no es verificable con la informacion disponible.
- Vision: el pipeline declarado es image-text-to-text, pero la model card no detalla ninguna capacidad de imagen, por lo que debe considerarse no confirmada.

## Casos de uso

- Escritura creativa de ficcion larga: el ajuste esta especificamente orientado a generacion narrativa con alto nivel de detalle y a todos los generos. Es adecuado cuando se busca prosa con gancho y continuidad de estilo, aunque requiere revision editorial por el riesgo de contenido excesivo o fuera de tono.
- Roleplay y personajes conversacionales: las etiquetas "roleplaying" y "conversational" y el modo de pensamiento reducido lo hacen util para agentes de personaje en sesiones largas, donde el ahorro de tokens de pensamiento se traduce en menor coste por turno.
- Generacion y asistencia de codigo: con la orientacion CODER puede integrarse en asistentes de editor o en revision de parches. Su utilidad en produccion depende de la verificacion manual, ya que no hay benchmarks de codigo publicados en la informacion disponible.
- Asistentes conversacionales con contenido sin filtros: para dominios donde el modelo alineado estandar rechaza peticiones legitimas (ficcion de terror, crimen, debates sensibles), la variante abliterada evita los rechazos sistematicos. Exige politicas de uso y supervision humana.
- Generacion de datos sinteticos: util para producir corpus de entrenamiento o de evaluacion en ingles y chino con estilos y niveles de detalle controlados, especialmente en narrativa y dialogos.
- Traduccion y localizacion ingles-chino: la ventana de idiomas declarada cubre en y zh, de modo que puede emplearse en localizacion de documentacion o de contenido editorial entre ambos idiomas, siempre con revision posterior.
- Razonamiento con presupuesto de tokens ajustado: el recorte de tokens de pensamiento lo hace apto para pipelines por lotes donde el coste de inferencia y la latencia importan mas que un razonamiento exhaustivo, como clasificacion con justificacion o extraccion estructurada.

## Benchmarks y rendimiento

Los unicos datos numericos aportados provienen de la model card del autor. No hay metodologia publicada, ni ficha de evaluacion reproducible, ni verificacion independiente en la informacion disponible. Se reproducen tal cual, marcados como autodeclarados:

| Benchmark | Resultado declarado | Nota |
|---|---|---|
| ARC-C (8 bits) | 735 | La model card afirma que es el primer ajuste fino en superar 730 y que la cifra esta 144 puntos por encima de Qwen 3.8 27B |
| ARC-C (4 bits) | 719 | Se afirma que supera 718 en 4 bits |
| ARC-E | por encima de 880 | Presentado como entrada en la "zona de inteligencia" de modelos propietarios |
| Comparativa global | Superior en los 7 benchmarks criticos declarados | No se enumeran los 7 benchmarks ni los valores obtenidos |
| Tool calling | "El mejor rendimiento registrado" segun la pestana community | No verificable con la informacion disponible |

No se han publicado resultados de benchmarks completos, con metodologia y numeros por tarea, en la informacion disponible. Las afirmaciones de la model card contienen ademas una inconsistencia interna: si 735 estuviera 144 puntos por encima del modelo base, este se situaria en torno a 591 en ARC-C, un valor que no se documenta en ninguna parte del repositorio.

## Requisitos de hardware

Estimaciones calculadas a partir de los 26.900 millones de parametros declarados; los valores exactos dependen de la cuantizacion, del runtime y de la longitud de contexto (la cache KV consume VRAM adicional y crece con el contexto).

- VRAM para pesos en precision completa (bf16/fp16): aproximadamente 54 GB. Requiere A100 80 GB, H100 80 GB o multiples GPU.
- Cuantizacion Q8: aproximadamente 28-29 GB. Cabe en RTX 5090 (32 GB) y en A100 40 GB con margen justo.
- Cuantizacion Q6: aproximadamente 22-23 GB. Cabe en RTX 4090, RTX 3090 y RTX 5090.
- Cuantizacion Q5: aproximadamente 18-19 GB. Cabe en RTX 4090, RTX 3090 y RTX 5080.
- Cuantizacion Q4 (se cita Q4KS de forma explicita): aproximadamente 15-17 GB. Cabe en GPU de consumo de 16 GB con margen limitado y en 24 GB con holgura; es la configuracion citada por el autor para sus resultados en 4 bits.
- Cuantizaciones Q3 o inferiores: aproximadamente 10-13 GB, aptas para GPU de 12-16 GB, con perdida de calidad no cuantificada en la informacion disponible.
- GPU recomendadas: H100/A100 80 GB para bf16; RTX 4090/3090/5090 para Q4-Q8; GPU de 12-16 GB solo con cuantizaciones bajas u offload parcial a CPU.
- Si cabe en GPU de consumo: si, en cuantizaciones de 4 a 8 bits sobre tarjetas de 16-32 GB. El autor afirma explicitamente que el modelo esta pensado para hardware de consumo y que fue entrenado en el.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. La model card no confirma soporte de vLLM o TGI para estos quants; marcar como no disponible. Los quants MTP pueden requerir builds concretas del runtime para aprovechar la decodificacion multi-token, extremo no confirmado.
- Latencia y throughput: el autor afirma ganancias de velocidad por el recorte de tokens de pensamiento y por MTP, pero no se aportan tokens por segundo medidos, ni hardware de referencia, ni longitud de contexto, por lo que no hay cifras utilizables. Espacio total del repositorio con todos los quants: 389 GB, lo que obliga a descargar selectivamente.

## Comparativa con modelos similares

Los unicos modelos comparables citados en la model card son los de la propia familia sobre la que se construye. No se dispone de especificaciones tecnicas de esos modelos en la informacion proporcionada, por lo que la mayoria de celdas quedan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO... NEO-CODER-MAX) | 26,9 B | no disponible | Apache 2.0 | Autodeclarado: ARC-C 735 (8 bits) y 719 (4 bits), supera 7 benchmarks criticos | GGUF en este repositorio, 0 descargas |
| Qwen 3.8 27B (base declarado) | aproximadamente 27 B segun el nombre | no disponible | no disponible | Referencia de comparacion segun el autor; valor base no publicado en el repositorio | no disponible |
| Qwen3.6-35B-A3B | 35 B totales, A3B (activos no disponibles) | no disponible | no disponible | El autor afirma superarlo en los 7 benchmarks criticos | no disponible |
| Qwen 3.6 27B | aproximadamente 27 B | no disponible | no disponible | El autor afirma superarlo en los 7 benchmarks criticos | no disponible |
| Qwen 3.5 27B | aproximadamente 27 B | no disponible | no disponible | El autor afirma superarlo en los 7 benchmarks criticos | no disponible |

No se han proporcionado datos verificables frente a alternativas de otros desarrolladores de tamano similar (por ejemplo, modelos densos de 24-32 B con licencia permisiva), por lo que no es posible establecer una comparativa independiente.

## Limitaciones y advertencias

- Modelo abliterado y sin censura: se han atenuado los mecanismos de rechazo. Puede generar contenido ofensivo, violento, sexual o legalmente problematico, y no incluye salvaguardas de alineacion fiables. Requiere moderacion externa en cualquier despliegue publico.
- Metricas autodeclaradas sin verificacion: las cifras de ARC-C y ARC-E provienen de la model card, sin metodologia, sin codigo de evaluacion y sin replicacion independiente. La afirmacion de 144 puntos de mejora sobre el modelo base no se sostiene con ningun valor de referencia publicado en el repositorio.
- Riesgo de alucinacion: inherente a los modelos de esta familia y tamano. No hay evaluaciones de fidelidad factual en la informacion disponible.
- Idiomas: solo ingles y chino segun los metadatos. El castellano no esta declarado como idioma soportado, por lo que el rendimiento en espanol es impredecible y debe validarse antes de usarlo en produccion.
- Longitud de contexto: no disponible. No se puede planificar el uso en tareas de contexto largo ni estimar el coste de cache KV sin ese dato.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es a su vez un ajuste derivado de la familia Qwen; conviene verificar las condiciones de la cadena completa de modelos base antes de explotarlo comercialmente.
- Trazabilidad y confianza del repositorio: 0 descargas y 0 likes, actualizacion unica el mismo dia de creacion y autor del upload distinto del autor del ajuste original. No hay comunidad que haya validado los quants.
- Tamanos y nombres poco convencionales: las referencias a "Qwen3.8", "Qwen3.6" y "Qwen3.5" no se corresponden con nomenclaturas verificables en la informacion disponible, lo que dificulta validar la genealogia del modelo.
- Vision no confirmada: el pipeline declarado es image-text-to-text, pero la model card no describe ninguna capacidad de imagen. No asumir entrada multimodal.
- Compatibilidad de runtime: los quants MTP pueden requerir versiones concretas de llama.cpp u otros runtimes; no se documenta la matriz de compatibilidad.
- Coste de almacenamiento: 389 GB en el repositorio completo obliga a descargar cuantizaciones concretas y a verificar la integridad de los ficheros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isihdfg/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio citado por el autor sobre COLD FUSION y Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset declarado: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset declarado: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre el modelo. Las consultas devolvieron unicamente listados inmobiliarios sin relacion con el contenido de esta ficha, por lo que no se incluyen.
