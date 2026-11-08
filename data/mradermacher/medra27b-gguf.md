# mradermacher/Medra27B-GGUF

## Resumen

Medra27B-GGUF es la distribucion en formato GGUF del modelo Medra27B, un ajuste fino de google/gemma-3-27b-pt orientado a dominios medicos (resumen clinico, razonamiento diagnostico y generacion de texto sanitario). El trabajo de ajuste lo firma nicoboss sobre el checkpoint base de Gemma 3 de 27.000 millones de parametros, y la cuantizacion la realiza mradermacher, un actor habitual en la publicacion de versiones GGUF de modelos abiertos. El repositorio proporciona un conjunto completo de cuantizaciones estaticas (de Q2_K a Q8_0) mas los ficheros mmproj necesarios para el procesamiento multimodal, lo que permite ejecutar el modelo en entornos con llama.cpp y herramientas compatibles.

La relevancia de esta ficha esta en que ofrece una via practica para desplegar un modelo medico de 27B en hardware de consumo o en servidores modestos, sin necesidad de GPU de datacenter. Al estar construido sobre Gemma 3, hereda la arquitectura transformer decoder-only del modelo original, su ventana de contexto larga y su capacidad multimodal, aunque la model card no detalla el proceso de ajuste ni los datos exactos empleados.

No obstante, conviene subrayar que se trata de un ajuste fino de terceros, no validado clinicamente, con licencia Apache 2.0 y soporte declarado solo para ingles y rumano. La informacion publicada es escasa: no hay benchmarks, no se documenta el volumen de datos de entrenamiento ni el metodo de alineacion, y el numero de descargas (614) y likes (0) sugiere una adopcion todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de google/gemma-3-27b-pt) |
| Parametros totales | 27.009.346.304 (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Gemma 3; consultar model card del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) y rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es google/gemma-3-27b-pt, un transformer decoder-only de 27.000 millones de parametros con atencion multi-cabeza estandar y capacidad multimodal (los ficheros mmproj del repositorio confirman el soporte de entrada de imagen). Medra27B se obtiene mediante ajuste fino supervisado sobre el dataset nicoboss/medra-medical, segun declara la model card; no se especifica el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF, DPO o preferencia adicional.

La innovacion tecnica de este repositorio no esta en el modelo en si, sino en el pipeline de cuantizacion: mradermacher publica cuantizaciones estaticas (k-quants) y, en un repositorio hermano (Medra27B-i1-GGUF), cuantizaciones ponderadas con imatrix, que suelen preservar mejor la calidad en tamanos pequenos. El proceso de conversion se realizo desde pesos Hugging Face (convert_type: hf) con la version 2 del esquema de cuantizacion y cuantizacion de tensores de salida activada.

## Capacidades

- Generacion de texto general y conversacional en ingles y rumano.
- Resumen de documentos clinicos y textos medicos (pipeline declarado: summarization).
- Razonamiento diagnostico asistido, segun los tags del autor (diagnostic-reasoning).
- Procesamiento multimodal de imagenes mediante los ficheros mmproj (Q8_0 y f16).
- Soporte de conversacion multi-turno a traves de plantillas de chat del modelo base.
- Ejecucion en llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Resumen automatico de informes clinicos: el modelo puede condensar historiales y notas de evolucion en ingles o rumano, aprovechando su ajuste especifico sobre corpus medico y su ventana de contexto heredada de Gemma 3.
- Triaje documental en entornos sanitarios: clasificacion y priorizacion de textos de admision o derivacion mediante generacion de resumenes estructurados, ejecutable en servidores sin GPU de datacenter gracias a las cuantizaciones Q4_K_M (16,6 GB).
- Asistencia a la codificacion clinica: extraccion de entidades y terminos diagnosticos de informes para alimentar sistemas de codificacion CIE, con revision humana obligatoria.
- Investigacion biomedica y revision de literatura: sintesis de abstracts y articulos en ingles, con la ventaja de poder desplegarse on-premise para preservar la confidencialidad de los datos.
- Docencia y formacion medica: generacion de casos clinicos simulados y preguntas de autoevaluacion en ingles y rumano, usando el formato conversacional del modelo.
- Despliegue en estaciones de trabajo con GPU consumer: la cuantizacion Q4_K_S (15,8 GB) permite inferencia local en una RTX 4090 o RTX 3090 de 24 GB, util para prototipos y demos sin conexion.
- Procesamiento de imagenes medicas acompanantes: con los ficheros mmproj, el modelo puede recibir entradas visuales junto al texto para tareas de descripcion o apoyo a la interpretacion, siempre con supervision profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~10,6 GB; Q3_K_M ~13,5 GB; Q4_K_S ~15,8 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Anadir ~0,7-1,0 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090/3090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para Q4_K_S ajustado.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas para cuantizaciones Q4; en 12 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; los ficheros estan etiquetados como endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medra27B-GGUF | 27B | No disponible | Medico (ajuste fino de Gemma 3) | Apache 2.0 | GGUF en HF |
| google/gemma-3-27b-pt | 27B | No disponible en esta ficha | Generalista multimodal | Gemma Terms of Use | Pesos originales en HF |
| Medra27B (nicoboss) | 27B | No disponible | Medico, pesos completos | Apache 2.0 | Safetensors en HF |
| Medra27B-i1-GGUF | 27B | No disponible | Medico, cuantizado con imatrix | Apache 2.0 | GGUF en HF |

La comparativa con alternativas medicas de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no validado clinicamente: no debe usarse como sustituto del juicio medico ni para decisiones diagnosticas o terapeuticas sin supervision profesional.
- Riesgo elevado de alucinacion en terminologia medica, dosis y referencias bibliograficas, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- Cobertura linguistica limitada a ingles y rumano; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La model card no documenta el corpus de entrenamiento, el volumen de tokens ni el metodo de alineacion, lo que dificulta evaluar sesgos y calidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use; conviene revisar la compatibilidad de ambas licencias antes de un despliegue comercial.
- Las cuantizaciones inferiores a Q4_K_M degradan la calidad de forma apreciable segun las notas del propio autor (Q3_K_M marcada como "lower quality").
- El numero de descargas (614) y la ausencia de likes indican poca validacion por parte de la comunidad; no hay evaluaciones independientes publicadas.
- El repositorio ocupa 188,1 GB, por lo que la descarga completa requiere planificar el almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Medra27B-GGUF
- Arbol de ficheros: https://huggingface.co/mradermacher/Medra27B-GGUF/tree/main
- Modelo base del ajuste: https://huggingface.co/nicoboss/Medra27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Medra27B-i1-GGUF
- Modelo original de Google: https://huggingface.co/google/gemma-3-27b-pt
- Dataset de ajuste: https://huggingface.co/datasets/nicoboss/medra-medical
- Pagina de descargas del autor: https://hf.tst.eu/model#Medra27B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
