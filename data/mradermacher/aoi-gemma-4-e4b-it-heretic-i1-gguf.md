# mradermacher/aoi-gemma-4-E4B-it-heretic-i1-GGUF

## Resumen

aoi-gemma-4-E4B-it-heretic-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo CloudGoat/aoi-gemma-4-E4B-it-heretic, un merge derivado de la familia Gemma (etiquetado como "gemma4") orientado a roleplay y conversacion sin censura. El modelo base combina tecnicas de task arithmetic y goatmerge sobre un checkpoint instruct, con lo que se busca reforzar el comportamiento conversacional y reducir los rechazos tipicos de los modelos alineados. Este repositorio no contiene pesos nuevos: es una distribucion de cuantizaciones (incluidas variantes i1 con imatrix) pensada para ejecucion local con llama.cpp y derivados.

El dato de parametros reportado en safetensors es de 7.518.069.290, lo que situa el modelo en la franja de ~7,5 mil millones de parametros. La model card del repositorio de cuantizacion indica que se trata de un modelo de vision ("This is a vision model"), por lo que los ficheros mmproj, si existen, se alojan en el repositorio estatico hermano. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es practica: permite evaluar rapidamente si esta variante cuantizada encaja en un despliegue local con GPU de consumo, que niveles de cuantizacion estan disponibles y con que compromisos de tamano, y hasta que punto conviene usar este merge "uncensored" frente a un Gemma instruct canonico. La informacion disponible sobre arquitectura interna, contexto, datos de entrenamiento y benchmarks es muy limitada, y asi se refleja en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma, etiqueta "gemma4"; detalles del transformer no documentados en la informacion disponible) |
| Parametros totales | 7.518.069.290 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix); variantes estaticas en el repo hermano |
| Idiomas soportados | ja (unico idioma declarado en la model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del base en safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada en la documentacion disponible sobre la arquitectura interna del modelo base (numero de capas, dimensiones de atencion, tipo de normalizacion, uso de atencion lineal o decodificacion especulativa). Lo unico verificable es que pertenece a la familia Gemma (tag "gemma4") y que el checkpoint del que derivan estas cuantizaciones es un merge construido con task arithmetic y goatmerge sobre CloudGoat/aoi-gemma-4-E4B-it-heretic. Esa tecnica de merge implica combinar los pesos de dos o mas checkpoints mediante operaciones aritmeticas en el espacio de parametros, en este caso para desplazar el comportamiento hacia respuestas menos censuradas y mas orientadas a roleplay.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado adicionales tras el merge. Las cuantizaciones de este repositorio se generaron con imatrix (matriz de importancia calculada sobre el propio modelo), lo que suele mejorar la calidad de las cuantizaciones de baja precision respecto a las estaticas equivalentes; el autor indica explicitamente que las variantes IQ suelen ser preferibles a las no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en roleplay.
- Comportamiento "uncensored": el merge busca reducir rechazos y respuestas evasivas propias de modelos alineados de forma estricta.
- Capacidad de vision segun la model card del repositorio de cuantizacion (los ficheros mmproj, si existen, estan en el repositorio estatico hermano); no verificable con detalle en la informacion disponible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo se declara japones (ja); el resto no disponible.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo esta explicitamente etiquetado para roleplay y derivado de un merge que relaja la censura, por lo que encaja en entornos de ficcion conversacional ejecutados en local con llama.cpp, sin dependencia de API externa.
- Prototipado de personajes conversacionales: al ser un modelo de ~7,5B cuantizado a 4-6 bits, permite iterar sobre prompts de personalidad y estilo en una GPU de consumo, con ciclos de prueba rapidos y coste nulo por token.
- Experimentacion con merges y aritmetica de tareas: util como caso de estudio para investigadores interesados en como task arithmetic y goatmerge alteran el comportamiento de rechazo y el tono de un modelo instruct, comparando las distintas cuantizaciones i1 frente a las estaticas.
- Evaluacion de cuantizaciones imatrix: el repositorio ofrece un rango amplio de cuantizaciones (de i1-Q2_K a i1-Q6_K) con fichero imatrix incluido, lo que permite medir empiricamente el impacto de la precision en perplexidad y calidad conversacional sobre un mismo checkpoint.
- Generacion de texto asistida por vision en local: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede emplearse para tareas de descripcion de imagenes y conversacion sobre imagenes en entornos sin conexion; conviene validar esta capacidad antes de usarla en produccion.
- Despliegue en entornos con requisitos de privacidad: al ser pesos abiertos con licencia Apache 2.0 y ejecutables con llama.cpp, puede correr en infraestructura propia sin enviar conversaciones a terceros, lo que resulta adecuado para pruebas internas con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente, sin KV cache): aproximadamente 4,5-5,5 GB para las cuantizaciones de 2-4 bits (i1-Q2_K a i1-Q4_K_M), 5,8-6,3 GB para 5-6 bits (i1-Q5_K_S a i1-Q6_K), segun los tamanos de fichero publicados (4,5 GB a 6,3 GB).
- Margen adicional: hay que sumar KV cache y buffers de contexto; con ventanas de contexto largas el consumo puede crecer de forma significativa, aunque la longitud de contexto del modelo no esta documentada.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para las cuantizaciones de 4 bits con contexto moderado (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para contexto largo o cuantizaciones de 6 bits conviene 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090). En entornos de servidor, A100 o H100 permiten mayor paralelismo y contexto, pero estan sobredimensionadas para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones de 4 bits; las variantes de 2-3 bits (4,5-5,1 GB) amplian el margen para tarjetas de 6-8 GB.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, Ollama mediante importacion del GGUF, LM Studio, koboldcpp); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores GGUF.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aoi-gemma-4-E4B-it-heretic (i1-GGUF) | ~7,5B | no disponible | Apache 2.0 | GGUF cuantizado (este repo) | Merge orientado a roleplay y sin censura; vision segun model card |
| Gemma instruct canonico (familia Gemma) | ~7-8B en la franja equivalente | no disponible en esta ficha | licencia Gemma de Google (no Apache 2.0) | pesos originales y multiples cuantizaciones | Alineacion estricta, mas rechazos; referencia de calidad general |
| Mistral 7B Instruct | ~7,2B | 32k (segun documentacion publica del modelo) | Apache 2.0 | safetensors y GGUF | Alternativa generalista con ecosistema amplio de cuantizaciones |
| Llama 3.1 8B Instruct | ~8B | 128k (segun documentacion publica del modelo) | licencia comunitaria Llama | safetensors y GGUF | Mayor contexto declarado, pero licencia con restricciones de uso |

La comparativa se limita a parametros, licencia y disponibilidad porque no hay benchmarks publicados para este merge en la informacion disponible; los datos de contexto de las alternativas provienen de su documentacion publica y no de una evaluacion conjunta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un merge "uncensored" tiende a reproducir y amplificar sesgos presentes en los datos originales al reducir los mecanismos de rechazo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; los merges por aritmetica de tareas pueden degradar la coherencia factual respecto al checkpoint instruct de origen, por lo que conviene validar antes de uso en produccion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y solo se declara japones como idioma; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero al derivar de la familia Gemma conviene verificar los terminos de la licencia original de Google antes de un uso comercial, ya que el modelo base podria arrastrar condiciones adicionales.
- Caveats para produccion: no hay benchmarks, no hay documentacion de tool calling ni de agentes, y la capacidad de vision solo se afirma de forma generica en la model card; ademas, las cuantizaciones de 2-3 bits sacrifican calidad de forma apreciable y no deberian usarse como referencia de evaluacion.
- El contenido "uncensored" puede generar salidas no aptas para entornos publicos o regulados; es responsabilidad del desplegador aplicar filtros externos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/aoi-gemma-4-E4B-it-heretic-i1-GGUF
- Modelo base: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic
- Cuantizaciones estaticas (incluye mmproj si existe): https://huggingface.co/mradermacher/aoi-gemma-4-E4B-it-heretic-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#aoi-gemma-4-E4B-it-heretic-i1-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
