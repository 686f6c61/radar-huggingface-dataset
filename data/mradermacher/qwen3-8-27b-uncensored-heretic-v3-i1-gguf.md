# mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3, publicadas por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos de modelos abiertos. El modelo subyacente tiene 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y ha sido sometido a un proceso de "abliteracion" o decensura (denotado por el termino *Heretic*), orientado a reducir los rechazos y filtros de seguridad heredados del modelo original. El nombre comercial de la familia, "Qwen3.8-27B", no se corresponde con ninguna familia publica verificable en la informacion disponible, por lo que la procedencia exacta del modelo base no puede confirmarse con los datos aportados.

La relevancia de este repositorio es practica: al tratarse de ficheros GGUF con cuantizacion ponderada mediante matrices de importancia (imatrix), permite ejecutar un modelo de ~27B en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), sin necesidad de GPUs de datacenter. El repositorio ofrece un espectro amplio de cuantizaciones, desde IQ1_S (para equipos con muy poca memoria) hasta Q6_K, lo que facilita el ajuste entre calidad y requisitos de VRAM.

No obstante, la ficha debe leerse con cautela: el repositorio registra cero descargas y cero interacciones en el momento de la consulta, la model card no documenta arquitectura, contexto, idiomas ni licencia, y no se han publicado resultados de benchmarks. Por tanto, se trata de un artefacto sin validacion publica por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes listadas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix); el sufijo `convert_type: hf` indica que la conversion de partida se hizo desde pesos en formato HuggingFace |
| Modelo origen de la cuantizacion | OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3 |
| Tamano del repositorio | 112,0 GB (conjunto de todos los ficheros publicados) |
| Fecha de publicacion | 2026-09-12 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura del modelo. No se especifica si se trata de un transformer denso, de un modelo de mezcla de expertos (MoE), de una arquitectura de espacio de estados (SSM) o de un diseno hibrido. Los unicos metadatos tecnicos presentes en la model card son de naturaleza operativa, no arquitectonica: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y una etiqueta `nicoboss` que probablemente hace referencia a la herramienta o al pipeline de cuantizacion utilizado. El numero de parametros (26,9 B) es el unico dato estructural firme.

Respecto al entrenamiento y al ajuste, solo puede afirmarse que el modelo de origen incorpora un proceso de decensura o abliteracion (el termino *Heretic* se asocia habitualmente a la eliminacion de direcciones de rechazo en el espacio de activaciones). No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otra tecnica de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal. La cuantizacion de este repositorio emplea matrices de importancia (imatrix), una tecnica que pondera los errores de cuantizacion segun la relevancia estadistica de cada peso, con el objetivo de preservar en mayor medida la calidad en cuantizaciones agresivas.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` en el repositorio indica que el modelo esta orientado a dialogos multiturno.
- Generacion de texto sin filtros de rechazo: el proceso de decensura busca reducir las negativas del modelo a responder ante peticiones que el modelo original rechazaria.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que los ficheros pueden servirse a traves de APIs compatibles con el formato habitual de inferencia de HuggingFace.
- Ejecucion local en CPU y GPU: al distribuirse en GGUF, es compatible con llama.cpp y con los multiples frontends construidos sobre el.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponible (no hay documentacion al respecto en la informacion proporcionada).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible; el repositorio es de solo texto segun los metadatos disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Escritura creativa y narrativa sin restricciones tematicas: el modelo esta pensado para generar ficcion y roleplay sin los rechazos tipicos de los modelos alineados; la cuantizacion Q4_K_M o Q5_K_M ofrece un equilibrio razonable entre calidad y consumo de memoria en una unica GPU de consumo.
- Red teaming y evaluacion de seguridad: investigadores pueden emplear la variante abliterada como contraste frente al modelo original para medir cuanto cambia la tasa de respuestas daninas y como se degrada la coherencia tras la decensura.
- Generacion de datos sinteticos para ajuste fino: al permitir respuestas sobre temas que el modelo base rechaza, puede utilizarse para producir datasets de dialogo en dominios sensibles (por ejemplo, contenido medico explicito o discurso conflictivo) destinados a entrenar o evaluar otros sistemas.
- Asistente local sin conexion: desplegado con Ollama o llama.cpp en un equipo con 16-24 GB de VRAM (por ejemplo, RTX 4090), sirve como asistente personal que no envia datos a servicios externos, un requisito habitual en entornos con datos confidenciales.
- Prototipado de personajes conversacionales: la combinacion de contexto conversacional y ausencia de filtros lo hace adecuado para construir bots de personaje con personalidad fija, gestionando historiales largos segun el contexto real que soporte el modelo base.
- Analisis de texto y transformacion de documentos: tareas de resumen, reescritura, extraccion de entidades o reestructuracion de textos, ejecutables por lotes sobre la variante Q6_K si se dispone de una GPU de 40-48 GB.
- Investigacion sobre ablacion de direcciones de rechazo: el modelo permite estudiar como se distribuyen las capacidades y los sesgos en un modelo de ~27B tras eliminar direcciones de activacion especificas, siempre que se disponga del modelo de origen para la comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad, y el repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento contrastado.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (26,9 B) y de los bits por peso tipicos de cada tipo de cuantizacion en llama.cpp; no proceden de mediciones publicadas para este modelo concreto. El tamano de fichero indicado no incluye la cache KV, que anade entre 1 y 3 GB adicionales con contextos moderados (4-8K tokens).

| Cuantizacion | Tamano estimado del fichero | VRAM estimada en inferencia |
|---|---|---|
| IQ1_S | ~5-6 GB | ~8 GB |
| IQ2_XXS / IQ2_XS | ~7-8 GB | ~10 GB |
| IQ2_M / Q2_K | ~9-10 GB | ~12 GB |
| IQ3_XXS / IQ3_S | ~10-12 GB | ~13-14 GB |
| Q3_K_M / IQ3_M | ~12-13 GB | ~15 GB |
| IQ4_XS / Q4_K_S | ~14-15 GB | ~16-17 GB |
| Q4_K_M | ~16-17 GB | ~18-19 GB |
| Q5_K_S / Q5_K_M | ~18-19 GB | ~21-22 GB |
| Q6_K | ~22 GB | ~24 GB |

- GPU de consumo: las cuantizaciones de Q4_K_M hacia abajo caben en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 5090, RX 7900 XTX). Las variantes IQ2/IQ3 permiten ejecucion parcial o total en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070).
- GPU de datacenter: Q6_K y las variantes de mayor precision se benefician de A100 40 GB, H100 80 GB o L40S 48 GB, sobre todo si se requiere contexto largo.
- CPU y memoria sistema: el formato GGUF permite ejecucion hibrida CPU+GPU. Con 32 GB de RAM se pueden cargar las cuantizaciones intermedias; con 64 GB, las mas altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con la API de llama.cpp. vLLM y TGI no consumen ficheros GGUF de forma nativa en toda su funcionalidad, por lo que no se recomiendan aqui.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF | 26,9 B | no disponible | no disponible | GGUF, 24 cuantizaciones listadas, repo de 112 GB | Objeto de esta ficha; 0 descargas |
| OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3 | mismo modelo base (26,9 B) | no disponible | no disponible | pesos originales (formato no especificado) | Fuente directa de las cuantizaciones |
| Otras conversiones GGUF del mismo modelo base | no disponible | no disponible | no disponible | no disponible | No se ha identificado ningun otro repositorio de cuantizacion para este modelo en la informacion disponible |
| Alternativas de tamano similar (familias de ~27-32 B) | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion proporcionada; no se dispone de cifras verificables |

## Limitaciones y advertencias

- Procedencia no verificable: el nombre "Qwen3.8-27B" no corresponde a ninguna familia publica conocida segun la informacion disponible, por lo que no puede confirmarse quien entrena el modelo base ni con que datos.
- Licencia desconocida: al no indicarse licencia, no puede asumirse permiso para uso comercial. En ausencia de terminos explicitos, la redistribucion y la explotacion comercial son juridicamente ambiguas.
- Sin validacion de terceros: el repositorio presenta cero descargas y cero valoraciones, y no hay benchmarks ni evaluaciones independientes. Cualquier uso en produccion parte de un riesgo no cuantificado.
- Efectos de la decensura: la abliteracion suele degradar la coherencia y la calidad general del modelo, ademas de incrementar la probabilidad de generar contenido danino, ilegal o factualmente incorrecto. No debe desplegarse en aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: no hay datos de evaluacion de fidelidad factual; en modelos decensurados la tendencia a afirmar con seguridad informacion falsa suele aumentar.
- Cuantizaciones de baja precision: las variantes IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S e IQ2_M degradan notablemente la calidad respecto a los pesos originales. Su uso solo se justifica por limitaciones severas de memoria.
- Idiomas y contexto desconocidos: no se documenta ni la cobertura linguistica ni la ventana de contexto, lo que impide planificar aplicaciones multilingues o de contexto largo con garantias.
- Inconsistencia aparente en el repositorio: el tamano publicado (112 GB) es inferior a la suma estimada de las 24 cuantizaciones listadas, lo que sugiere que el conjunto de ficheros podria estar incompleto o en proceso de publicacion. Se trata de una inferencia a partir de los datos disponibles, no de una confirmacion del autor.
- Ausencia de soporte: no hay documentacion, ni repositorio de issues, ni guia de uso asociada a esta conversion.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF
- Modelo de origen: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a dominios sin relacion con el modelo (un sitio generico sin contenido y dos foros de motor), por lo que no se incluyen como fuentes.
