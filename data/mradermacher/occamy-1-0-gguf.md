# mradermacher/occamy-1.0-GGUF

## Resumen

Occamy 1.0 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Accio-Lab, orientado a tareas de agente, uso de herramientas (tool-use), co-work y contexto largo. Esta ficha documenta la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware consumer mediante llama.cpp y derivados. El modelo base cuenta con 34.660.610.688 parametros totales (unos 34,7 mil millones), aunque al ser MoE solo una fraccion se activa por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano.

La relevancia de esta publicacion radica en que traduce un modelo pensado para flujos agenticos y de codigo a un formato ligero y portable. El repositorio ofrece cuantizaciones desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), ademas de dos variantes del proyector multimodal (mmproj) en Q8_0 y f16, lo que sugiere capacidades de vision. La licencia Apache 2.0 facilita su adopcion comercial sin restricciones adicionales.

El modelo esta etiquetado como conversational, agent, agentic, co-work, tool-use, long-context, mixture-of-experts y coding, y declara el ingles como unico idioma. No se dispone de informacion publica sobre la longitud exacta de contexto, el numero de parametros activos ni los detalles del entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; pesos en formato GGUF |
| Parametros totales | 34.660.610.688 (34,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Modelo base | Accio-Lab/occamy-1.0 |
| Tamano del repositorio | 238,6 GB |
| Descargas | 315 |
| Likes | 4 |

## Arquitectura y entrenamiento

Occamy 1.0 emplea una arquitectura de mezcla de expertos (MoE) con 34,7 mil millones de parametros totales. La naturaleza MoE implica que, por cada token, solo se activa un subconjunto de expertos, lo que reduce el coste computacional respecto a un modelo denso equivalente. No obstante, la informacion disponible no especifica el numero de parametros activos, el numero de expertos, la dimension oculta ni la estrategia de enrutamiento.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. Las etiquetas del repositorio indican un enfasis en agentes, tool-use, co-work, contexto largo y codigo, lo que sugiere un entrenamiento orientado a esas capacidades, pero se trata de una inferencia a partir de metadatos y no de documentacion tecnica verificada. Esta version concreta es una cuantizacion estatica del modelo base realizada por mradermacher; existe ademas una variante con cuantizacion ponderada por imatrix en el repositorio occamy-1.0-i1-GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta conversational).
- Razonamiento agentico y ejecucion de tareas en multiples pasos (agent, agentic).
- Uso de herramientas y llamada a funciones (tool-use).
- Flujos de co-work, es decir, colaboracion humano-modelo en tareas compartidas.
- Generacion y asistencia en codigo (coding).
- Manejo de contexto largo (long-context), aunque la longitud exacta no esta documentada.
- Capacidades multimodales: la presencia de ficheros mmproj (proyector vision-lenguaje) indica soporte de entrada de imagenes, aunque no se detalla su alcance.
- Idioma: ingles como unico idioma declarado.

## Casos de uso

- Automatizacion de agentes con herramientas: el modelo puede encadenar llamadas a APIs y funciones en tareas de varios pasos gracias a su soporte de tool-use y su orientacion agentica, integrandose en orquestadores como LangChain o frameworks propios.
- Asistencia a programadores en local: con cuantizaciones Q4_K_M (21,3 GB) o Q5_K_M (24,8 GB) puede desplegarse en una estacion de trabajo con GPU de gran capacidad para autocompletado, revision de codigo y generacion de tests sin enviar codigo a la nube.
- Analisis de documentos extensos: la etiqueta long-context sugiere utilidad para resumir y consultar contratos, informes o bases de conocimiento, siempre que se verifique empiricamente la ventana real soportada.
- Procesamiento de capturas y documentos escaneados: el proyector multimodal permite combinar imagen y texto para extraer informacion de pantallas, diagramas o formularios en flujos de trabajo internos.
- Entornos de co-work con el desarrollador: integracion en asistentes de IDE que colaboran en la refactorizacion y depuracion, manteniendo el contexto de la sesion.
- Despliegue en infraestructura propia con requisitos de privacidad: la licencia Apache 2.0 y el formato GGUF permiten ejecutar el modelo en servidores on-premise sin restricciones de uso comercial, algo relevante para sectores regulados.
- Prototipado rapido de pipelines agenticos: las cuantizaciones pequenas (Q2_K, 13,0 GB) permiten validar arquitecturas de agentes en hardware modesto antes de escalar a cuantizaciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto. Q2_K requiere unos 13 GB; Q4_K_M, unos 21,3 GB; Q5_K_M, unos 24,8 GB; Q8_0, unos 37 GB. El proyector multimodal anade 0,7 GB (Q8_0) o 1,0 GB (f16).
- GPU recomendadas: para Q8_0 y Q6_K, una A100 40 GB o H100; para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) puede ajustar Q4_K_M y, con dificultad, Q5_K_M; las cuantizaciones Q2_K y Q3_K caben en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas de VRAM para cuantizaciones bajas y medias; las cuantizaciones altas requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para servidores, llama.cpp con servidor HTTP o vLLM si se convierte el modelo a otro formato (no incluido en este repositorio).
- Latencia y throughput: no disponibles. Al ser MoE, el throughput por token deberia ser inferior al de un modelo denso de 34,7 mil millones, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros totales | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Occamy 1.0 (esta ficha) | 34,7 mil millones (MoE) | no disponible | Apache 2.0 | GGUF, safetensors |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada modelos comparables concretos de la misma categoria (MoE orientado a agentes y codigo) con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se han publicado benchmarks, por lo que las capacidades agenticas, de codigo y de contexto largo deben validarse empiricamente antes de usarlas en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; en flujos con tool-use, una llamada erronea puede propagarse a sistemas externos.
- La longitud de contexto real no esta especificada; la etiqueta long-context no garantiza un numero concreto de tokens.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para tareas de razonamiento o codigo se recomienda Q4_K_M o superior.
- El repositorio ocupa 238,6 GB por incluir todas las variantes; conviene descargar solo el fichero necesario.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden estar sujetos a condiciones adicionales no documentadas en esta ficha.
- No hay informacion sobre sesgos, filtros de seguridad ni evaluaciones de robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/occamy-1.0-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/occamy-1.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#occamy-1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
