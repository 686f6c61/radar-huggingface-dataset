# schwyzquants/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP, desarrollado por DavidAU y cuantizado por el usuario schwyzquants. Se trata de un fine tune multi-etapa y multi-fusion sobre una base Qwen3.6 de 27B (26.895.998.464 parametros reales), con 465,1 GB de pesos en el repositorio, distribuido bajo licencia apache-2.0 y con soporte declarado de ingles y chino.

El modelo se presenta como un ajuste orientado a mejorar el seguimiento de instrucciones y la resolucion de problemas, sin modificar el resto de capacidades del modelo base. Incluye una variante "heretic"/"abliterated" que elimina los mecanismos de rechazo y alineacion de seguridad, y se distribuye tanto en cuantizaciones GGUF "regulares" como "MTP" (multi-token prediction), todas ellas generadas con imatrix (NEO IMATRIX) y con el tensor de salida en precision completa de 16 bits.

Su relevancia actual radica en que es un ejemplo de la tendencia de fine tunes comunitarios que compiten, segun el autor, con modelos cerrados en benchmarks de razonamiento (ARC-C) y que caben en hardware de consumo. No obstante, las cifras de rendimiento son autodeclaradas y en el momento de la consulta el repositorio no tiene descargas ni "likes", por lo que no existe validacion independiente accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.6; no se detallan variantes (MoE, SSM, hibrida) en la informacion disponible |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (multi-token prediction), en variantes NEO IMATRIX; tensor de salida en 16 bits. La lista exacta de niveles (Q4_K_M, Q5_K_M, Q8_0, etc.) no esta disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se entrena en bfloat16 |
| Modalidad | image-text-to-text (vision declarada en la model card) |
| Modelo base | DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP |
| Tamano del repositorio | 465,1 GB |
| Fecha de publicacion (metadatos) | 2026-09-14 |

## Arquitectura y entrenamiento

La model card describe el proceso como un "multi-stage fine tune, multi-fine tune y multi-stage merge", es decir, una combinacion de varios ajustes supervisados y fusiones de pesos sucesivas, realizadas con Unsloth sobre el modelo base. El trabajo es una colaboracion entre DavidAU (fine tunes), Nightmedia (merge y benchmarking), TeichAI (dataset Polaris), armand0e (trazas "Light Fable") y trohrbaugh (aplicacion del proceso "heretic"/abliterated). Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, y las trazas de entrenamiento incluyen material ligero de "Fable", de Claude Opus (razonamiento/thinking) y de GPT-5 via Polaris (sin razonamiento).

El objetivo declarado es aumentar la inteligencia general y la resolucion de problemas sin danar el modelo original, sin "benchmaxing" y manteniendo o elevando todos los benchmarks. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas adicionales como RLHF, DPO o decodificacion especulativa. Como innovaciones tecnicas declaradas destacan las cuantizaciones NEO IMATRIX (que, segun el autor, mejoran la precision entre un 2 y un 4 por ciento respecto a GGUFs normales y el rendimiento en contexto largo) y las variantes MTP de prediccion multi-token.

## Capacidades

- Generacion de texto generalista, con enfasis declarado en el seguimiento de instrucciones y la resolucion de problemas.
- Modo de razonamiento o "thinking" (etiquetas `thinking` y `reasoning`), con trazas de entrenamiento derivadas de Claude Opus.
- Generacion de codigo (etiqueta `coder`).
- Escritura creativa, ficcion, narrativa y roleplay, pese a que el autor indica que el modelo no fue disenado especificamente para ello.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, "Vision" listada entre las caracteristicas).
- Conversacion multi-turno (etiqueta `conversational`).
- Capacidad multilingue limitada a ingles y chino.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo incorpora trazas de escritura y etiquetas de ficcion y roleplay, por lo que puede emplearse para generar relatos, dialogos y tramas con coherencia a lo largo de varios capitulos, aunque el autor advierte que no es su objetivo principal.
- Asistente local de razonamiento: su modo "thinking" y las trazas de razonamiento de Claude Opus lo hacen adecuado para tareas de analisis paso a paso en un entorno sin conexion, siempre que se acepte la ausencia de garantias de seguridad.
- Generacion y revision de codigo en local: con la etiqueta `coder` y formato GGUF, puede servirse con llama.cpp y conectarse a extensiones de IDE (por ejemplo continuacion de codigo o explicacion de funciones) en una sola GPU de consumo.
- Analisis de documentos con imagenes: el pipeline `image-text-to-text` permite extraer informacion de capturas, diagramas o documentos escaneados combinados con texto, si bien no se detalla la resolucion soportada.
- Investigacion sobre fine tuning y fusiones: sirve como caso de estudio para reproducir la metodologia multi-etapa y comparar, con la misma infraestructura, frente al modelo base Qwen3.6 27B.
- Generacion de datos sinteticos para entrenamiento: su naturaleza sin censura permite producir texto diverso (incluido contenido que otros modelos rechazarian) para aumentar datasets, con la advertencia de que requiere filtrado posterior.
- Prototipado de personajes y asistentes conversacionales internos: el modo conversacional y el contexto multi-turno permiten construir demos de roleplay o asistentes de voz internos, no expuestos a usuarios finales.
- Evaluacion comparativa de cuantizaciones: al ofrecer variantes regulares y MTP con imatrix, el repositorio permite medir en una misma maquina el impacto de la cuantizacion en calidad y velocidad.

## Benchmarks y rendimiento

La informacion proporcionada contiene unicamente afirmaciones cualitativas del autor, sin cifras completas por benchmark. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos en los datos disponibles.

| Benchmark | Resultado declarado | Nota |
|---|---|---|
| ARC-C (8 bits) | superior a 700 | cifra exacta no publicada; el "711" del nombre alude a este valor |
| ARC-C (4 bits) | superior a 700 | cifra exacta no publicada |
| Comparativa con Qwen3.6 27B base | supera 6 de 7 benchmarks y empata en el septimo | afirmacion del autor |
| Comparativa con Qwen3.6-35B-A3B | supera los 7 benchmarks | afirmacion del autor |
| MMLU, HumanEval, GSM8K, MT-Bench | no disponible | no se aportan datos |
| Metodologia | testing humano lado a lado con el modelo base | no se publican protocolos ni tamanos de muestra |

## Requisitos de hardware

Los siguientes valores son estimaciones calculadas a partir del numero de parametros (26,9 B) y del formato GGUF, no datos publicados por el autor:

- Precision completa en bfloat16: aproximadamente 54 GB solo de pesos, mas cache KV; requiere A100 80 GB, H100 80 GB o dos GPU de 24 GB con reparto de capas.
- GGUF Q8_0: aproximadamente 28-29 GB de pesos; cabe en una A100 40/80 GB, H100 o dos RTX 4090/3090.
- GGUF Q6_K: aproximadamente 22-23 GB; muy ajustado en una RTX 4090 de 24 GB, comodo en dos GPU de 24 GB.
- GGUF Q5_K_M: aproximadamente 19-20 GB; cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado.
- GGUF Q4_K_M: aproximadamente 16-17 GB; opcion recomendada para una sola GPU de 24 GB o para una GPU de 16 GB con offload parcial a CPU.
- GGUF Q3_K_M: aproximadamente 13-14 GB; viable en GPU de 16 GB o en configuraciones mixtas GPU/CPU.
- GGUF Q2_K: aproximadamente 10-11 GB; viable en GPU de 12 GB, con perdida de calidad esperable a ese nivel de cuantizacion.
- GPU de consumo: si, el modelo esta pensado para hardware de consumo; RTX 4090, RTX 3090, RTX 4080 y equivalentes con la cuantizacion adecuada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y Jan soportan GGUF directamente; vLLM ofrece soporte GGUF limitado; TGI no soporta GGUF.
- Latencia y throughput: no disponible. El autor afirma que las variantes MTP pueden mejorar la velocidad de decodificacion, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Fable-Fusion-711, GGUF) | 26,9 B | no disponible | supera al base en 6 de 7 benchmarks segun el autor; ARC-C > 700 en 8 y 4 bits | apache-2.0 | GGUF en HuggingFace; 0 descargas al consultar |
| Qwen3.6 27B (base) | 27 B | no disponible | referencia del autor; superado en 6 de 7 benchmarks | no disponible | no disponible en esta busqueda |
| Qwen3.6-35B-A3B | 35 B (activos no confirmados) | no disponible | el autor afirma que este modelo lo supera en los 7 benchmarks | no disponible | no disponible en esta busqueda |
| Qwen3.5 27B | 27 B | no disponible | usado como referencia intermedia en las pruebas del autor | no disponible | no disponible en esta busqueda |
| Qwen3.5-9B-The-Defiant-Fable | ~9 B | no disponible | > 640 en ARC-C en 4 y 8 bits, segun el autor | no disponible | GGUF publicado por DavidAU |

No se dispone de datos verificables de contexto, licencia ni disponibilidad para los modelos de comparacion distintos de los enlazados por el autor.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": se ha eliminado o reducido deliberadamente la alineacion de seguridad, por lo que puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No es apto para aplicaciones orientadas al publico ni para entornos regulados.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: no se aportan metricas de fidelidad ni de verificacion factual; al tratarse de un fine tune con trazas de modelos propietarios, el riesgo de afirmaciones inventadas no esta cuantificado.
- Idiomas: solo se declaran ingles y chino; el castellano no figura entre los idiomas soportados, por lo que el rendimiento en espanol es incierto.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos.
- Benchmarks autodeclarados: las cifras provienen de la model card del autor y no se acompanan de scripts, configuraciones ni resultados reproducibles. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.
- Licencia: se declara apache-2.0, pero las trazas de entrenamiento derivadas de Claude Opus, GPT-5/Polaris y Fable pueden estar sujetas a terminos adicionales de los proveedores originales. Conviene revisar la licencia del modelo base antes de un uso comercial.
- Metadatos anomalos: la fecha de publicacion indicada (2026-09-14) y la nomenclatura "Qwen3.6" no son verificables con la informacion disponible, por lo que conviene confirmar la procedencia del modelo base antes de integrarlo.
- Vision: aunque el pipeline es `image-text-to-text`, no se especifican resolucion, numero de imagenes por peticion ni rendimiento en tareas multimodales.
- Tool calling y agentes: no hay evidencia en la informacion disponible de soporte nativo de function calling, lo que limita su uso en pipelines de agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schwyzquants/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Version de 40B Eleanor-DECKARD: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Version de 40B Grand Intelligence FF711-717: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8 27B Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.5-9B-The-Defiant-Fable (grupo de control del metodo): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Dataset Polaris-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper o articulo tecnico: no disponible.
- Repositorio de codigo o demo: no disponible.
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (hilos de foro sobre el servicio de correo Libero Mail), por lo que no aportan informacion adicional.
