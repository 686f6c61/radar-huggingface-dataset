# mradermacher/Nezou-27B-CyberAbliterated-i1-GGUF

## Resumen

Nezou-27B-CyberAbliterated-i1-GGUF es la version cuantizada en formato GGUF, generada por mradermacher, del modelo dancingfrog/Nezou-27B-CyberAbliterated. Se trata de un modelo multimodal de tipo vision-language (etiquetado como qwen3_5 en el repositorio), con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), sometido a un proceso de abliteration, es decir, la eliminacion o supresion de las direcciones de rechazo del modelo original para reducir la tasa de negativas ante determinadas peticiones.

La relevancia de esta publicacion es practica: el repositorio i1 ofrece cuantizaciones con matriz de importancia (imatrix) que permiten ejecutar un modelo de 27B en hardware de consumo, con tamanos que van desde 11,0 GB en i1-Q2_K hasta 22,5 GB en i1-Q6_K. El repositorio completo ocupa 218,6 GB e incluye 21 variantes de cuantizacion mas el fichero imatrix para generar cuantizaciones propias.

No se dispone de informacion sobre la longitud de contexto, el dataset de entrenamiento, el proceso de alineamiento ni resultados de benchmarks, ni en la model card original ni en la informacion proporcionada. Los resultados de la busqueda web realizada no contienen ningun enlace relevante al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), etiquetado como qwen3_5; no se detalla la variante exacta |
| Parametros totales | 27.320.697.856 (aprox. 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix; Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Autor de la cuantizacion | mradermacher |
| Modelo base | dancingfrog/Nezou-27B-CyberAbliterated |
| Tamano del repositorio | 218,6 GB |
| Descargas / likes | 46 / 0 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican qwen3_5, multimodal, vision-language, conversational y reasoning, lo que apunta a un transformer de la familia Qwen3.5 con torre de vision y capacidad de conversacion y razonamiento. El dato de parametros totales (27,3 mil millones) procede del recuento de safetensors del modelo base. No se especifica el numero de cabezas de atencion, la dimension oculta, el tipo de atencion ni la longitud de contexto soportada.

El proceso de abliteration es una tecnica de edicion de pesos que identifica las direcciones del espacio de activaciones asociadas a la negativa a responder y las proyecta fuera, de forma que el modelo conserva las capacidades originales pero reduce la tasa de rechazos. El sufijo Cyber sugiere un ajuste orientado al dominio de ciberseguridad, aunque esta interpretacion no esta confirmada en la informacion disponible. Respecto a la cuantizacion, los metadatos indican quantize_version 2, output_tensor_quantised 1 y convert_type hf, y las cuantizaciones i1 emplean una matriz de importancia (fichero imatrix de 0,1 GB) para ponderar el error de cuantizacion por capa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational.
- Procesamiento de vision e imagen (vision-language): el modelo base es multimodal. Los ficheros mmproj, si existen, se publican en el repositorio estatico de cuantizaciones, no en este.
- Razonamiento (etiqueta reasoning); no se especifica si dispone de un modo de pensamiento explicito.
- Comportamiento abliterado: menor probabilidad de rechazar peticiones que el modelo original, incluida la generacion de contenido sensible.
- Orientacion tematica a ciberseguridad, inferida del nombre del modelo; no confirmada en la documentacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: solo se declara ingles (en).
- Ejecucion local en CPU y GPU mediante el ecosistema GGUF.

## Casos de uso

- Asistente conversacional local orientado a seguridad: desplegado con llama.cpp u Ollama sobre una estacion de trabajo con GPU de 24 GB, el modelo puede mantener dialogos tecnicos largos sobre analisis de vulnerabilidades, interpretacion de trazas y explicacion de tecnicas de ataque y defensa, sin enviar datos a servicios externos.
- Analisis de capturas de pantalla y diagramas de red: al ser un modelo vision-language, permite adjuntar una imagen de una topologia o de una consola y pedir una interpretacion textual, algo util en triaje de incidentes.
- Redaccion de informes tecnicos de seguridad: generar borradores estructurados a partir de notas de analisis, con la ventaja de que la cuantizacion Q4_K_M (16,9 GB) cabe en una unica GPU de consumo.
- Reescritura y explicacion de payloads o scripts en laboratorios de formacion: el caracter abliterado reduce los rechazos al trabajar con ejemplos de codigo ofensivo en entornos controlados, siempre que el uso cumpla la legislacion aplicable.
- Procesamiento por lotes en servidor interno sin GPU dedicada de gama alta: las variantes i1-Q3_K_S (12,4 GB) e i1-IQ3_S (12,7 GB) permiten ejecucion parcial en CPU o con offload mixto para tareas no interactivas.
- Base para ajuste fino o evaluacion de seguridad: el repositorio incluye el fichero imatrix, lo que facilita generar cuantizaciones propias y reproducir experimentos sobre el efecto de la abliteration en modelos multimodales de 27B.
- Generacion de documentacion tecnica a partir de diagramas: extraer descripciones textuales de esquemas arquitectonicos o de flujos de datos adjuntos como imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de vision, y los resultados de la busqueda web no aportan datos al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: i1-Q2_K 11,0 GB; i1-Q3_K_S 12,4 GB; i1-IQ3_S 12,7 GB; i1-IQ4_XS 15,4 GB; i1-Q4_K_S 15,9 GB; i1-Q4_K_M 16,9 GB; i1-Q5_K_M 19,6 GB; i1-Q6_K 22,5 GB. A estas cifras hay que sumar el espacio para el contexto activo (cache KV) y, en su caso, el proyector multimodal mmproj. En FP16, el modelo base requeriria aproximadamente 54,6 GB solo para los pesos.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para las cuantizaciones Q4 y Q5; A100 40 GB, A100 80 GB o H100 80 GB para cuantizaciones altas con contexto largo o para el modelo sin cuantizar; RTX 4060 Ti de 16 GB para Q3 e IQ3.
- Cabe en GPU de consumo: si, con las cuantizaciones Q2 a Q4. Con Q6_K (22,5 GB) el margen en una GPU de 24 GB es muy estrecho y puede requerir reducir el contexto u offload parcial a CPU.
- Memoria unificada: los equipos Apple Silicon con 32 GB o 64 GB de memoria unificada pueden ejecutar las cuantizaciones Q4 y Q5 mediante llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. Para alto rendimiento en servidor con multiples peticiones concurrentes, vLLM o TGI requeririan los pesos en safetensors del modelo base, no el GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa aportada por el autor, las cuantizaciones mas bajas son mas rapidas y de menor calidad, y Q4_K_S se marca como el equilibrio optimo entre tamano, velocidad y calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nezou-27B-CyberAbliterated-i1-GGUF (este) | 27,3 mil millones | no disponible | GGUF con imatrix | apache-2.0 | HuggingFace, 46 descargas |
| Nezou-27B-CyberAbliterated-GGUF (static) | 27,3 mil millones | no disponible | GGUF estatico (incluye mmproj) | apache-2.0 | HuggingFace |
| dancingfrog/Nezou-27B-CyberAbliterated (base) | 27,3 mil millones | no disponible | safetensors | apache-2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) en el material proporcionado, por lo que no se incluyen alternativas externas.

## Limitaciones y advertencias

- La abliteration reduce los rechazos del modelo, lo que implica un riesgo elevado de generar contenido nocivo, ilegal o inseguro sin filtros. El uso en produccion abierta exige capas de moderacion externas.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad factual para este modelo ni para su base.
- Idiomas: solo se declara ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que dependan de ventanas largas sin verificarla experimentalmente.
- Origen de los datos de entrenamiento no documentado, lo que impide evaluar sesgos y contaminacion de benchmarks.
- Riesgo legal y etico: la combinacion de un modelo orientado a ciberseguridad con abliteration puede facilitar usos ofensivos. La licencia apache-2.0 permite uso comercial, pero no exime del cumplimiento normativo aplicable.
- Las cuantizaciones de 2 y 3 bits degradan notablemente la calidad; el propio autor desaconseja Q2_K y Q3_K_S frente a alternativas IQ del mismo tamano.
- Este repositorio es una cuantizacion de terceros: los fallos de calidad derivados del proceso de cuantizacion no son responsabilidad del autor del modelo base.
- Los ficheros mmproj para la parte de vision pueden no estar en este repositorio; hay que comprobarlo en el repositorio estatico antes de desplegar el modo multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Nezou-27B-CyberAbliterated-i1-GGUF
- Modelo base: https://huggingface.co/dancingfrog/Nezou-27B-CyberAbliterated
- Cuantizaciones estaticas (incluye mmproj si existe): https://huggingface.co/mradermacher/Nezou-27B-CyberAbliterated-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Nezou-27B-CyberAbliterated-i1-GGUF
- Peticiones de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Entidad que cede la infraestructura: https://www.nethype.de/
- Resultados de la busqueda web: sin enlaces relevantes al modelo. Las URLs devueltas corresponden a sitios de streaming en frances y no guardan relacion con el contenido de esta ficha.
