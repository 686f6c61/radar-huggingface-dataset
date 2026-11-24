# mradermacher/Dark-Scarlett-v2.0-31B-GGUF

## Resumen

Dark-Scarlett-v2.0-31B-GGUF es la version cuantizada en formato GGUF del modelo Dark-Scarlett-v2.0-31B, publicado por el usuario ReadyArt y convertida por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. Se trata de un modelo de lenguaje de aproximadamente 30.700 millones de parametros (30,7B) afinado para roleplay, conversacion instructiva y contenido para adultos, con un enfasis explicito en narrativa no alineada ("unaligned") y contenido explicito (ERP). La model card lo etiqueta como derivado de la familia "gemma-4", aunque no se especifica la arquitectura exacta en la informacion disponible.

La relevancia de esta publicacion es practica: mradermacher ofrece el modelo base en 12 cuantizaciones GGUF distintas, desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), ademas de dos variantes del proyector multimodal (mmproj) en Q8_0 y f16. Esto permite ejecutar un modelo de 31B en hardware de consumo, algo inviable con los pesos originales en safetensors. El repositorio ocupa 213,9 GB en total y acumula 417 descargas y 1 like en el momento de la consulta.

El modelo esta liberado bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque el contenido para adultos y las etiquetas "not-for-all-audiences" implican consideraciones adicionales de moderacion y cumplimiento. La informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card se centra casi exclusivamente en las cuantizaciones y no documenta el proceso de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "gemma-4" en los tags; sin detalle en la model card) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los tags del repositorio incluyen "gemma-4" y la libreria declarada es transformers, lo que sugiere una arquitectura transformer derivada de la familia Gemma, pero no se confirma el tipo exacto (denso frente a MoE), el numero de capas, la dimension oculta ni el mecanismo de atencion. El dato de parametros totales (30.697.345.596) proviene de los safetensors del modelo base.

Tampoco se documentan en la model card el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. Las etiquetas indican un ajuste orientado a roleplay, conversacion, instrucciones y contenido explicito, con caracteristicas "unaligned" y "mature", pero sin especificar la metodologia. La unica innovacion tecnica documentada es la propia cuantizacion: mradermacher publica cuantizaciones estaticas (no imatrix) en este repositorio, y remite a un repositorio separado (i1-GGUF) para las variantes ponderadas con imatrix, que suelen ofrecer mejor calidad por tamano. Tambien se incluye un proyector multimodal (mmproj), lo que implica que el modelo base incorpora capacidades de vision, aunque no se detalla su arquitectura.

## Capacidades

- Generacion de texto conversacional e instructivo en ingles.
- Roleplay y narrativa interactiva, con enfasis en personajes y dialogos multi-turno.
- Contenido para adultos y narrativa explicita (ERP), segun los tags del repositorio.
- Comportamiento "unaligned": menor rechazo a peticiones que los modelos alineados rechazarian por defecto.
- Capacidades multimodales: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imagenes, aunque no se detalla el alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles ("en").
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener interacciones de personaje multi-turno en ingles, ejecutandose en local con llama.cpp u Ollama gracias a las cuantizaciones Q4_K_M (18,8 GB) o Q5_K_M (21,9 GB), adecuadas para GPUs de 24 GB.
- Escritura creativa y narrativa para adultos: la orientacion "unaligned" y las etiquetas de contenido explicito lo hacen apto para generar ficcion madura sin los filtros tipicos de los modelos alineados, en un entorno privado y controlado.
- Prototipado de chatbots de personaje: util para desarrolladores que necesitan un modelo base de 31B con buen comportamiento conversacional para construir asistentes de rol antes de invertir en un modelo mayor.
- Investigacion sobre alineacion y seguridad: al ser un modelo "unaligned", sirve como caso de estudio para evaluar comportamientos, sesgos y riesgos de modelos sin filtros, en entornos de investigacion controlados.
- Experimentacion multimodal local: con los ficheros mmproj, puede probarse la combinacion de texto e imagen en pipelines de llama.cpp, aunque el alcance de la vision no esta documentado.
- Despliegue en hardware de consumo: las variantes Q2_K (12,0 GB) y Q3_K_S (13,9 GB) permiten ejecutar el modelo en GPUs de 16 GB, y Q4_K_S (17,9 GB) en GPUs de 24 GB, para pruebas de inferencia sin infraestructura de datacenter.
- Fine-tuning posterior o destilacion: los pesos base en safetensors (Apache 2.0) permiten ajustes adicionales para dominios especificos, aunque el coste computacional de un 31B es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del fichero GGUF, mas overhead de contexto y KV cache):
  - Q2_K: 12,0 GB.
  - Q3_K_S: 13,9 GB; Q3_K_M: 15,4 GB; Q3_K_L: 16,7 GB.
  - IQ4_XS: 17,0 GB; Q4_K_S: 17,9 GB; Q4_K_M: 18,8 GB.
  - Q5_K_S: 21,4 GB; Q5_K_M: 21,9 GB.
  - Q6_K: 25,3 GB.
  - Q8_0: 32,7 GB.
  - Proyector multimodal: mmproj-Q8_0 0,9 GB; mmproj-f16 1,3 GB (adicionales).
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_S o Q2_K; en GPUs de 12 GB no cabe ninguna cuantizacion completa sin offloading a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Scarlett-v2.0-31B-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF | Roleplay/ERP, unaligned, multimodal (mmproj) |
| Modelo base ReadyArt/Dark-Scarlett-v2.0-31B | 30,7B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Alternativas de roleplay de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria sin inventar datos.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como NSFW, explicit y not-for-all-audiences; no es apto para entornos sin moderacion ni para usuarios menores.
- Modelo "unaligned": presenta menor rechazo por defecto, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal si no se aplican filtros externos.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad; como modelo de 31B sin benchmarks publicados, la fiabilidad factual no esta verificada.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la longitud de contexto no esta disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas de moderacion, proteccion de menores o derechos de terceros; la responsabilidad recae en el desplegador.
- Procedencia: es una cuantizacion de terceros (mradermacher) de un modelo afinado por ReadyArt; no hay garantias del autor original sobre el proceso de entrenamiento ni sobre la calidad de los datos.
- Multimodalidad: la presencia de mmproj sugiere vision, pero no se documenta el alcance ni la calidad; no debe asumirse un rendimiento equiparable a modelos vision-language dedicados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v2.0-31B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Dark-Scarlett-v2.0-31B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dark-Scarlett-v2.0-31B-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
