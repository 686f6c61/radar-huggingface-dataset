# mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF

## Resumen

Esta ficha describe `mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF`, una distribucion en formato GGUF de un derivado de Gemma 4 con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones). El autor de la cuantizacion es mradermacher, mientras que el modelo de origen es `mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara`, a su vez una variante modificada del Gemma 4 26B A4B instruct con cuantizacion consciente del entrenamiento (QAT) y un proceso de "abliteration" o "heretizacion" que elimina los mecanismos de rechazo del modelo original.

El sufijo "A4B" del nombre indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos por token, sobre un total de 26 mil millones. El repositorio ofrece unicamente cuantizaciones estaticas en GGUF (de Q2_K a Q4_K_M), derivadas del modelo en precision original, y esta pensado para inferencia local mediante llama.cpp y herramientas compatibles. La licencia declarada en la model card es Apache 2.0, aunque se enlaza adicionalmente a la licencia de Gemma 4 de Google, lo que introduce ambiguedad juridica para uso comercial.

La relevancia de este modelo radica en su orientacion a casos donde se requiere un asistente sin filtros de contenido, con capacidad de ejecucion en hardware de consumo gracias a sus cuantizaciones de 10,7 a 16,9 GB. No obstante, la informacion publicada es muy escasa: no hay benchmarks, no se detalla el proceso de entrenamiento y la model card se limita a la lista de ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el sufijo "A4B" del nombre; detalles no disponibles |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2 B) |
| Parametros activos | Aproximadamente 4 B (inferido del sufijo "A4B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M (estaticas); existen quants con imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace adicional a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo de 96,2 GB con multiples ficheros); el modelo base esta en transformers |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B A4B en variante instruct, con cuantizacion consciente del entrenamiento (QAT) a q4_0 segun el nombre del repositorio de origen. El sufijo "A4B" indica una arquitectura MoE con aproximadamente 4 mil millones de parametros activos por token sobre un total de 26 mil millones, lo que reduce el coste computacional de inferencia manteniendo la capacidad representacional de un modelo mayor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

Sobre esa base se aplico un proceso de "abliteration" o "heretizacion" (etiquetas `heretic`, `uncensored`, `decensored`, `abliterated`), una tecnica que modifica los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder ante determinadas peticiones. El autor de esta modificacion es mewse. Posteriormente, mradermacher genero las cuantizaciones GGUF estaticas a partir de los pesos originales. No se detalla la metodologia exacta de abliteration ni el impacto en capacidades.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruct.
- Razonamiento y respuesta a instrucciones heredados del Gemma 4 26B A4B instruct original.
- Ausencia (parcial o total) de mecanismos de rechazo gracias a la abliteration, lo que permite abordar contenido que el modelo original declinaria.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`).
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del Gemma 4 instruct original, midiendo la tasa de rechazo antes y despues de la modificacion.
- Generacion creativa sin filtros: escritura de ficcion con tematicas sensibles (violencia, drama psicologico) donde los modelos alineados suelen aplicar rechazos que interrumpen la narrativa.
- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,6 GB) permiten ejecutar un modelo de 25 B con activacion de 4 B en equipos con 16-24 GB de VRAM unificada o dedicada, usando llama.cpp u Ollama.
- Prototipado de pipelines de generacion de texto en ingles: al ser un GGUF compatible con llama.cpp, se integra facilmente en scripts y servicios ligeros sin necesidad de infraestructura GPU de datacenter.
- Analisis de contenido y red teaming: util para generar respuestas adversarias y evaluar la robustez de clasificadores y filtros de moderacion propios.
- Experimentos de cuantizacion: el repositorio ofrece siete niveles de cuantizacion estatica, lo que permite medir la degradacion de calidad (perplejidad) frente al tamano en un modelo MoE con QAT de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K 10,7 GB; Q3_K_S 12,3 GB; Q3_K_M 13,4 GB; Q3_K_L 13,9 GB; IQ4_XS 14,2 GB; Q4_K_S 15,6 GB; Q4_K_M 16,9 GB. A estas cifras hay que sumar el contexto KV cache, que crece con la longitud de contexto configurada.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM; una RTX 4080 (16 GB) queda muy justa y probablemente requiera offload parcial a CPU. Para despliegue con contexto largo o concurrencia, se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM para las cuantizaciones Q3 y Q4_K_S, y con 24 GB para Q4_K_M. Las cuantizaciones Q2_K y Q3_K_S pueden caber en GPUs de 12 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia compatibles. vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un MoE con aproximadamente 4 B de parametros activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 25 B, pero no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Gemma 4 26B A4B heretic GGUF) | 25,2 B | ~4 B | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Abliterated, solo ingles, sin benchmarks publicados |
| Gemma 4 26B A4B instruct (original) | ~26 B | ~4 B | no disponible | licencia Gemma 4 de Google | safetensors, GGUF | Modelo alineado con rechazos; referencia de calidad |
| Gemma 3 27B instruct | ~27 B | denso | no disponible | licencia Gemma | safetensors, GGUF | Denso, mas costoso por token que un MoE A4B |
| Mistral Small 3 (24B) | ~24 B | denso | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano comparable con licencia permisiva |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado benchmarks de este derivado ni del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina o reduce los rechazos de seguridad: el modelo puede generar contenido nocivo, ilegal o sexualmente explicito. No es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion en temas factuales, agravado por la ausencia de benchmarks que permitan caracterizar su fidelidad.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Ambiguedad de licencia: la model card declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google, que impone restricciones de uso (incluida la politica de uso prohibido). Conviene revisar ambas antes de un uso comercial.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, codigo) de forma no cuantificada; no hay evaluaciones que lo midan.
- El repositorio ocupa 96,2 GB y contiene multiples ficheros; es necesario descargar solo la cuantizacion deseada.
- Las cuantizaciones Q2_K y Q3_K_M presentan mayor perdida de calidad; el autor marca Q3_K_M explicitamente como "lower quality" y recomienda Q4_K_S o Q4_K_M.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Modelo con 0 likes y 261 descargas en el momento de la consulta: ecosistema minimo, sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF
- Modelo base: https://huggingface.co/mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara
- Quants con imatrix: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
