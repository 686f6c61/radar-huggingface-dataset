# mradermacher/Phi_mts_dialogue_clinical_note_MEDICATIONS-GGUF

## Resumen

Phi_mts_dialogue_clinical_note_MEDICATIONS-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo base emilykang/Phi_mts_dialogue_clinical_note_MEDICATIONS, un modelo de lenguaje de aproximadamente 2.780 millones de parametros (2,78 B) afinado para la extraccion y generacion de notas clinicas a partir de dialogos medico-paciente, con enfasis en el apartado de medicacion. El trabajo de cuantizacion lo realiza mradermacher, un publicador habitual de versiones GGUF de modelos open source, que en este caso ofrece once variantes de cuantizacion estatica (desde Q2_K hasta f16).

El modelo parte de la familia Phi (arquitectura transformer decoder-only de Microsoft, segun la nomenclatura del nombre), aunque la model card del autor no detalla la arquitectura exacta ni el proceso de entrenamiento. Su relevancia practica reside en el nicho: la conversion de transcripciones de consultas medicas en notas clinicas estructuradas es una tarea de alto valor en entornos sanitarios, y un modelo de menos de 3 B parametros puede desplegarse en hardware modesto, incluso en CPU, gracias a las cuantizaciones de 1,2 a 3,1 GB.

La licencia no esta declarada en la informacion disponible, lo que supone una limitacion importante para cualquier uso comercial o clinico en produccion. El modelo solo declara soporte para ingles y cuenta con un volumen de descargas muy bajo (23 descargas, 0 likes en el momento de la consulta), lo que indica que es un artefacto de investigacion mas que un modelo validado para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi; detalles no disponibles) |
| Parametros totales | 2.779.683.840 (2,78 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 25,0 GB (incluye todas las variantes) |
| Modelo base | emilykang/Phi_mts_dialogue_clinical_note_MEDICATIONS |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-02-28 |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base mas alla de su pertenencia a la familia Phi y su naturaleza de transformer decoder-only con 2,78 B parametros. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset de afinado ni si se emplearon tecnicas de RLHF, DPO o instruccion supervisada. El nombre del modelo sugiere un afinado especifico sobre dialogos clinicos con etiquetado de medicaciones (MEDICATIONS), probablemente dentro de un conjunto de variantes del mismo autor base orientadas a distintas secciones de la nota clinica.

El trabajo de mradermacher consiste exclusivamente en la conversion y cuantizacion a GGUF mediante herramientas del ecosistema llama.cpp, con cuantizaciones estaticas (no imatrix). El autor indica que las versiones ponderadas/imatrix estan disponibles en un repositorio separado (sufijo -i1-GGUF), lo que sugiere que la calidad de estas cuantizaciones estaticas puede ser inferior a la de las variantes con importancia matricial, especialmente en los niveles bajos (Q2_K, Q3_K).

## Capacidades

- Generacion de texto en ingles orientada a la redaccion de notas clinicas a partir de dialogos medico-paciente.
- Extraccion y estructuracion de informacion sobre medicacion (farmacos, dosis, pautas) presente en la conversacion clinica.
- Procesamiento de dialogos multi-turno propios de una consulta medica.
- Generacion de texto general limitada por el afinado especifico del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Generacion automatica de borradores de notas clinicas: el modelo recibe la transcripcion de una consulta y produce un texto estructurado con la seccion de medicacion, reduciendo el tiempo de documentacion del facultativo.
- Extraccion de regimenes farmacologicos: a partir de un dialogo, identificar farmacos mencionados, dosis y frecuencia para volcarlos en un formulario o historia clinica electronica.
- Asistencia a la codificacion clinica: preprocesar conversaciones para que un sistema posterior asigne codigos de medicacion (ATC, por ejemplo) sobre la seccion extraida.
- Prototipado de pipelines de documentacion sanitaria: al ser un modelo de 2,78 B con cuantizaciones de 1,2 a 3,1 GB, permite iterar rapidamente en local sobre datasets de dialogos sinteticos o anonimizados antes de escalar a modelos mayores.
- Investigacion en NLP clinico: servir como linea base ligera para experimentos de summarization de dialogos medicos o de evaluacion de extraccion de entidades farmacologicas.
- Despliegue en entornos con recursos limitados: su tamano permite ejecutarlo en CPU o en GPUs de consumo para pruebas de concepto internas en hospitales o grupos de investigacion, sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~1,2 GB; Q4_K_M ~1,8 GB; Q8_0 ~3,1 GB; f16 ~5,7 GB (mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano y solo aportarian mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (2,78 B) se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi_mts_dialogue_clinical_note_MEDICATIONS-GGUF | 2,78 B | no disponible | no disponible | GGUF en HF | Afinado clinico especifico en medicacion |
| Phi_mts_dialogue_clinical_note_GENHX-GGUF | no disponible | no disponible | no disponible | GGUF en HF | Variante del mismo autor base orientada a historia clinica general |
| Phi_mts_dialogue_clinical_note_CC-GGUF | no disponible | no disponible | no disponible | GGUF en HF | Variante del mismo autor base orientada a motivo de consulta |

No se dispone de datos de benchmarks ni de especificaciones completas de las variantes hermanas para establecer una comparacion cuantitativa con modelos clinicos de referencia; la comparativa se limita a la disponibilidad y al linaje comun de los tres artefactos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial, clinico o redistribucion; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue real.
- Solo ingles: no soporta castellano ni otros idiomas, lo que limita su uso en el sistema sanitario espanol sin un afinado adicional.
- Riesgo de alucinacion alto en dominio clinico: un modelo de 2,78 B afinado sobre un dataset no documentado puede inventar farmacos, dosis o pautas; cualquier salida debe ser revisada por un profesional sanitario.
- Sin validacion clinica publicada: no hay benchmarks, evaluaciones ni certificaciones que respalden su precision en extraccion de medicacion.
- Datos de entrenamiento no documentados: se desconoce la procedencia, el consentimiento y la anonimizacion de los dialogos usados en el afinado, lo que plantea dudas de cumplimiento (RGPD, HIPAA).
- Cuantizaciones estaticas: las versiones de este repositorio no usan imatrix; para mayor calidad en niveles bajos conviene usar el repositorio -i1-GGUF del mismo autor.
- Contexto desconocido: no se puede garantizar el manejo de transcripciones largas de consulta sin truncar informacion relevante.
- Adopcion muy baja (23 descargas, 0 likes): no hay evidencia de uso en produccion ni de reportes de la comunidad.
- No es un dispositivo medico: su uso en entornos clinicos requeriria validacion regulatoria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_mts_dialogue_clinical_note_MEDICATIONS-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_mts_dialogue_clinical_note_MEDICATIONS
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Phi_mts_dialogue_clinical_note_MEDICATIONS-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phi_mts_dialogue_clinical_note_MEDICATIONS-GGUF
- Variante GENHX: https://huggingface.co/mradermacher/Phi_mts_dialogue_clinical_note_GENHX-GGUF
- Variante CC: https://huggingface.co/mradermacher/Phi_mts_dialogue_clinical_note_CC-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
