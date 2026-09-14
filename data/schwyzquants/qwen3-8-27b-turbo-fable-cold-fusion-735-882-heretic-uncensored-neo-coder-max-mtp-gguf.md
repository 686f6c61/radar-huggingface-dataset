# schwyzquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP, un ajuste fino de 26.895.998.464 parámetros (26,9B) desarrollado por DavidAU sobre la familia Qwen3.8 y cuantizado por el usuario schwyzquants. Se trata de un modelo denso, multimodal de entrada (pipeline image-text-to-text en HuggingFace), entrenado con un pipeline multietapa que combina ajuste fino, mezcla de modelos (merge) y destilación de estilos, con el objetivo declarado de aumentar la inteligencia general y reducir drásticamente el consumo de tokens de razonamiento.

La propuesta central del autor es un "modo TURBO": el bloque de pensamiento se reduce entre la mitad y una décima parte (mediana aproximada de dos tercios según la model card) manteniendo, según sus afirmaciones, el detalle y la calidad de salida. El autor indica que es el primer ajuste fino de este tamaño en superar 730 puntos en ARC-C en 8 bits (735) y 719 en 4 bits, además de 880 en ARC-E. Estas cifras proceden exclusivamente de la model card y de la pestaña de comunidad del autor, sin verificación independiente en la información disponible.

El repositorio, de 389 GB, incluye dos familias de cuantizaciones: "Regular GGUF Quants" y "MTP GGUF Quants" (multi-token prediction), estas últimas orientadas a acelerar la generación. El modelo está etiquetado como heretic, uncensored y abliterated, es decir, con los mecanismos de rechazo eliminados o atenuados, y declara licencia Apache 2.0, lo que facilita su uso comercial aunque con matices legales que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, ajustado en multiples etapas, con modos de pensamiento (thinking/reasoning); pipeline declarado image-text-to-text (entrada de imagen y texto) |
| Parametros totales | 26.895.998.464 (26,9B), dato de safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en dos variantes: "Regular GGUF Quants" y "MTP GGUF Quants"; con imatrix dual (DI-MATRIX). La model card menciona ejemplos en 8 bits, 4 bits y Q4KS sin imatrix |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples cuantizaciones); el modelo base estaba en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU y conserva la arquitectura transformer densa de la familia Qwen3.8, con soporte para tres modos de operacion de pensamiento segun la model card. El entrenamiento se describe como un ajuste fino multietapa con mezcla multietapa ("multi-stage tune, multi-fine tune, multi-stage merge"), realizado con las herramientas de Unsloth sobre hardware de consumo, segun afirma el autor.

La innovacion tecnica declarada son dos metodos de entrenamiento: COLD FUSION (combinacion de "GAIN" con los entrenadores de Unsloth) y Fable Fusion 711. El componente GAIN modifica dinamicamente el entrenamiento muestra a muestra en tiempo real segun el modelo aprende, con el objetivo de mejorar metricas sin "sobrecocinar" el modelo. Los objetivos explicitos del proyecto incluyen reducir el bloque de pensamiento, reformatearlo, acelerar la generacion de tokens (especialmente mediante MTP) y mantener o elevar los benchmarks centrales, con una declaracion explicita de zero "benchmaxing". No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset (mas alla de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets) ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto general y conversacion multiturno.
- Razonamiento explicito con bloque de pensamiento ("thinking") en tres modos de operacion, con reduccion declarada de tokens de pensamiento de entre 1/2 y 1/10 respecto a Qwen3.8 27B sin ajustar.
- Generacion de codigo: el modelo se comercializa bajo la etiqueta NEO-CODER MAX y el tag "coder".
- Escritura creativa, ficcion, narrativa y roleplaying, con etiquetas explicitas de "all genres", "story" y "writing".
- Entrada multimodal de imagen y texto segun el pipeline declarado (image-text-to-text); no se detalla el alcance real de las capacidades de vision.
- Cuantizaciones MTP (multi-token prediction) orientadas a decodificacion especulativa y mayor velocidad de generacion.
- Modelo "uncensored"/"abliterated": sin los mecanismos habituales de rechazo de contenido.
- Capacidades de tool calling: la model card remite a la pestana de comunidad para resultados de terceros que afirman "el mejor rendimiento en tool calling registrado"; este dato no consta en la informacion principal y no es verificable aqui.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Escritura creativa y ficcion asistida: el modelo esta ajustado especificamente para narrativa y todos los generos, con ejemplos de generacion de ganchos narrativos y dialogos en la propia model card; es adecuado para flujos de novela, relatos y guiones donde se busca estilo marcado.
- Roleplay y personajes persistentes: las etiquetas de roleplaying y conversacion multiturno lo orientan a personajes con voz consistente en sesiones largas.
- Generacion de codigo en pipelines de desarrollo: la etiqueta NEO-CODER MAX sugiere enfasis en codigo; puede integrarse en asistentes de IDE o revision de parches si se validan sus capacidades con pruebas propias.
- Razonamiento con coste de tokens controlado: el modo TURBO reduce el bloque de pensamiento hasta una decima parte, lo que abarata tareas de razonamiento por lotes donde el presupuesto de tokens de salida es critico (clasificacion compleja, extraccion estructurada, resumen analitico).
- Despliegue local en hardware de consumo: al distribuirse en GGUF, se puede ejecutar con llama.cpp u Ollama en equipos con GPU de gama alta, sin depender de APIs de terceros.
- Prototipado de aplicaciones sin censura: para investigacion sobre comportamiento de modelos, analisis de sesgos o simulacion de contenido adversarial en entornos controlados, dado su caracter abliterated.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite experimentar con entradas mixtas (capturas, diagramas, formularios) junto a instrucciones textuales.
- Servicio de inferencia de alto rendimiento con cuantizaciones MTP: para escenarios donde la latencia de generacion importa, las variantes MTP estan disenadas para acelerar la decodificacion.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor. Se presentan tal cual, sin verificacion independiente.

| Benchmark | Este modelo, 8 bits | Este modelo, 4 bits | Qwen 3.8 27B (referencia del autor) |
|---|---|---|---|
| ARC-C | 735 | 719 | 591 (deducido de la afirmacion "144 puntos menos") |
| ARC-E | mas de 880 | no disponible | no disponible |
| Otros 7 benchmarks criticos | Superados, sin cifras publicadas | Superados, sin cifras publicadas | no disponible |

El autor afirma que el modelo supera a Qwen 3.8 27B en los 7 benchmarks criticos y tambien a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B, pero no publica la tabla completa en la informacion disponible. Se menciona en la pestana de comunidad la existencia de benchmarks de terceros (incluido rendimiento en tool calling) que no forman parte de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de 26,9B parametros (sin incluir cache KV ni overhead de contexto): Q8_0 en torno a 28-30 GB; Q6_K en torno a 22 GB; Q5_K_M en torno a 18-19 GB; Q4_K_M en torno a 16-17 GB; Q3_K_M en torno a 13-14 GB; Q2_K en torno a 10-11 GB; bfloat16 en torno a 54-58 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas y contexto largo; RTX 4090/5090 (24-32 GB) para Q4 y Q5 con contexto moderado; tarjetas de 16 GB solo con cuantizaciones bajas o descarga parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M e imatrix y contexto limitado, y en RTX 5090 (32 GB) con Q5 o incluso Q8 ajustando contexto. En GPUs de 12-16 GB requiere offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF; vLLM y TGI pueden servir el modelo a traves de soporte GGUF o del modelo base en safetensors, aunque para maxima compatibilidad con las variantes MTP conviene llama.cpp.
- Latencia y throughput: no disponible. El autor afirma que el modelo es mas rapido que Qwen3.8 27B por la reduccion de tokens de pensamiento y por las cuantizaciones MTP, pero no se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (base de DavidAU) | 26,9B | Transformer denso con modos de pensamiento | No disponible | Apache 2.0 | GGUF en HuggingFace (repo de 389 GB) |
| Qwen 3.8 27B (base) | En torno a 27B segun la nomenclatura | No disponible | No disponible | No disponible | Referenciado como base, sin enlace directo |
| Qwen3.6-35B-A3B | 35B totales, 3B activos segun la nomenclatura | MoE | No disponible | No disponible | No disponible |
| Qwen3.6 27B | 27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.5 27B | 27B | No disponible | No disponible | No disponible | No disponible |

Las comparaciones con los modelos Qwen citados provienen de afirmaciones del autor en la model card; no se dispone de sus especificaciones completas ni de resultados de benchmark verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: los filtros de seguridad han sido eliminados o atenuados de forma deliberada. Puede generar contenido ofensivo, violento, sexual o ilegal, y no es apto para aplicaciones orientadas al publico general sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion: como cualquier modelo de 27B sin verificacion factual, puede inventar datos, citas y referencias, especialmente en dominios especializados. El caracter "high detail focused" del ajuste puede incrementar la confianza aparente de contenido incorrecto.
- Idiomas: cobertura declarada de ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior; conviene evaluarlo antes de usarlo en produccion en espanol.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos sin pruebas previas. Ademas, las cuantizaciones GGUF pueden degradar el comportamiento con contextos muy extensos.
- Benchmarks no verificados: las cifras de ARC-C y ARC-E proceden unicamente del autor. No hay evaluacion independiente en la informacion disponible, y afirmaciones como "el mejor tool calling registrado" no cuentan con respaldo en estos datos.
- Licencia Apache 2.0 en el repositorio de cuantizacion, pero el modelo base y los datasets intermedios podrian arrastrar condiciones adicionales. Conviene revisar la licencia del modelo de origen (DavidAU) y de los datasets Polar-STRICT y F451 antes de un despliegue comercial, especialmente por el uso de datos posiblemente sinteticos o derivados.
- Rendimiento multimodal no documentado: aunque el pipeline declarado es image-text-to-text, no se detallan las capacidades reales de vision ni su calidad, y las cuantizaciones GGUF de un modelo multimodal pueden degradar el procesamiento de imagenes.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita anticipar su estabilidad.
- Naturaleza experimental de la nomenclatura: los nombres de las tecnicas (COLD FUSION, GAIN, Fable Fusion 711, DI-MATRIX) proceden del autor y no cuentan con publicacion tecnica revisada en la informacion disponible.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/schwyzquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio de referencia del metodo Fable Fusion 711 citado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset citado: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset citado: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper tecnico, blog o demo oficial: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de una naviera) y no se ha encontrado documentacion externa, benchmarks de terceros ni articulos tecnicos sobre este modelo en la informacion proporcionada.
