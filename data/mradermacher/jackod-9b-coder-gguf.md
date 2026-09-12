# mradermacher/JackOD-9B-Coder-GGUF

## Resumen

JackOD-9B-Coder-GGUF es el repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo ManniX-ITA/JackOD-9B-Coder, un modelo de aproximadamente 9.197 millones de parametros (9.2B) orientado a generacion de codigo y flujos agenticos. Se trata de una cuantizacion estatica, no de un modelo entrenado desde cero: el valor anadido esta en ofrecer el modelo base en formatos de precision reducida listos para ejecutarse en llama.cpp, Ollama o LM Studio sin necesidad de GPU de datacenter.

El modelo base se distribuye con etiquetas que lo identifican como un merge (fusion de pesos) con capacidades de code, agentic y tool-calling, y con la etiqueta qwen3.5, lo que apunta a una arquitectura derivada de la familia Qwen. El idioma declarado es unicamente ingles (en) y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica es doble: por un lado, un modelo de ~9B con soporte declarado de tool calling es un tamano util para agentes de codigo en local; por otro, el repositorio cubre un rango de cuantizaciones que va desde 4,0 GB (Q2_K) hasta 18,5 GB (f16), lo que permite desplegarlo desde una GPU consumer de 8 GB hasta estaciones de trabajo con 24 GB de VRAM. El repositorio incluye ademas ficheros mmproj, proyector multimodal asociado a modelos con vision, aunque la model card no detalla esa capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3.5 y como merge; no se detalla en la informacion proporcionada) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no aplica (no se ha confirmado una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. Las etiquetas del repositorio indican que ManniX-ITA/JackOD-9B-Coder es un merge (combinacion de pesos de otros modelos) con enfasis en codigo, uso agentico y tool calling, y la etiqueta qwen3.5 sugiere que la familia subyacente es Qwen. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otra alineacion.

Lo que si esta documentado es el proceso de cuantizacion aplicado por mradermacher: cuantizaciones estaticas generadas con el flujo habitual del autor (convert_type hf, quantize_version 2, output_tensor_quantised 1). El repositorio incluye ademas, como ficheros separados, el proyector multimodal en dos precisiones (mmproj-Q8_0 de 0,7 GB y mmproj-f16 de 1,0 GB), lo que apunta a que el modelo base podria soportar entrada de imagenes, si bien la model card no lo confirma ni lo describe.

El repositorio incluye una segunda variante de cuantizaciones ponderadas con matriz de importancia (imatrix) publicada aparte como mradermacher/JackOD-9B-Coder-i1-GGUF. Segun la propia documentacion del autor, las cuantizaciones IQ suelen ser preferibles a cuantizaciones no-IQ de tamano similar.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado explicitamente como code y esta pensado para tareas de programacion.
- Tool calling / function calling: la etiqueta tool-calling indica soporte declarado de llamada a herramientas, requisito habitual en agentes.
- Flujos agenticos: la etiqueta agentic apunta a uso en razonamiento multi-paso y orquestacion de acciones.
- Conversacional: el repositorio esta marcado como conversational, por lo que se espera un formato de chat multi-turno.
- Multimodalidad (no confirmada): la presencia de ficheros mmproj sugiere proyector de vision, pero la model card no describe la capacidad ni como activarla.
- Multilingue: limitado a ingles segun los metadatos; no se declara soporte de castellano ni de otros idiomas.
- Razonamiento extenso tipo thinking: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de codigo en local dentro del IDE: con la cuantizacion Q4_K_M (5,9 GB) el modelo cabe en una GPU consumer de 8-12 GB y puede servir autocompletado y chat sobre el repositorio sin enviar codigo a servicios externos, algo critico en entornos con codigo propietario.
- Agentes de refactorizacion multi-paso: el soporte declarado de tool calling permite encadenar llamadas a herramientas (busqueda en el arbol de ficheros, lectura, escritura y ejecucion de tests) para tareas como renombrar APIs o extraer modulos.
- Generacion de tests e integracion en CI/CD: se puede invocar el modelo desde un runner para generar tests unitarios a partir de diffs o de ficheros nuevos, usando la cuantizacion Q8_0 (9,9 GB) en una GPU de 16 GB para maximizar la fidelidad del codigo generado.
- Revision de codigo automatizada en pull requests: el modelo puede resumir cambios, detectar patrones problematicos y proponer parches; al ser Apache 2.0, puede integrarse en un bot interno sin coste de licencia.
- Migracion y traduccion de codigo entre lenguajes o frameworks: tareas de reescritura de fragmentos (por ejemplo, scripts de Python a TypeScript) donde un modelo de 9B especializado en codigo suele ser suficiente y ejecutable en local.
- Documentacion tecnica y docstrings: generacion de documentacion a partir de firmas y cuerpos de funciones, con el modelo desplegado en Ollama sobre una estacion de trabajo.
- Onboarding sobre bases de codigo legacy: explicacion de modulos poco documentados mediante consultas conversacionales, siempre que el contexto disponible lo permita (la longitud de contexto no esta especificada en la informacion proporcionada).
- Despliegue on-premise o en edge por privacidad: las cuantizaciones Q2_K (4,0 GB) y Q3_K_S (4,5 GB) permiten ejecucion en equipos sin GPU dedicada con CPU y RAM suficiente, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a contenidos sin relacion).

## Requisitos de hardware

- Huella de pesos por cuantizacion: Q2_K 4,0 GB; Q3_K_S 4,5 GB; Q3_K_M 4,8 GB; Q3_K_L 5,1 GB; IQ4_XS 5,5 GB; Q4_K_S 5,6 GB; Q4_K_M 5,9 GB; Q5_K_S 6,6 GB; Q5_K_M 6,7 GB; Q6_K 7,7 GB; Q8_0 9,9 GB; f16 18,5 GB.
- Proyector multimodal: anadir 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) si se usa la entrada de imagenes.
- VRAM estimada: a la huella de pesos hay que sumar la cache KV, que crece con la longitud de contexto y el numero de secuencias concurrentes; el dato exacto de contexto no esta disponible, por lo que la reserva debe calcularse empiricamente.
- GPU consumer: Q4_K_M (5,9 GB) es viable en 8 GB (RTX 3060 Ti, RTX 4060) con contexto moderado; Q5/Q6 en 12 GB (RTX 3060 12 GB, RTX 4070); Q8_0 en 16 GB (RTX 4060 Ti 16 GB, RTX 4080); f16 en 24 GB (RTX 3090, RTX 4090).
- GPU profesional: A100 40/80 GB, H100 y L40S permiten f16 con contexto amplio y varias secuencias simultaneas, aunque para un modelo de 9B son sobredimensionadas salvo por concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui son las rutas naturales para GGUF. La multimodalidad, si se activa, requiere el soporte de proyector multimodal de llama.cpp (mtmd/libmtmd).
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.
- Cuantizaciones ponderadas: existe una variante imatrix en mradermacher/JackOD-9B-Coder-i1-GGUF que suele ofrecer mejor relacion calidad/tamano en tamanos bajos (Q2-Q4).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas objetivas documentadas publicamente por cada fabricante. Los valores de contexto de los modelos alternativos corresponden a su documentacion oficial y pueden variar segun la configuracion de despliegue.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| JackOD-9B-Coder (este) | 9,2B | no disponible | Apache 2.0 | GGUF (base en safetensors) | Codigo, agentico, tool calling, solo ingles |
| Qwen3-8B | ~8,2B | 32K nativo (ampliable) | Apache 2.0 | safetensors, GGUF | Proposito general, multilingue, modo thinking |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | 32K | Apache 2.0 | safetensors, GGUF | Codigo, multilingue, tool calling |
| DeepSeek-Coder-V2-Lite-Instruct | ~16B (MoE, ~2,4B activos) | 128K | licencia propia de DeepSeek | safetensors, GGUF | Codigo, multilingue |

Rendimiento comparado (benchmarks de codigo, MMLU, etc.): no disponible para el modelo evaluado; consulte las fichas de cada alternativa para sus cifras publicadas.

## Limitaciones y advertencias

- Idioma: los metadatos declaran unicamente ingles. El rendimiento en castellano no esta garantizado ni documentado, y puede degradarse de forma notable.
- Ausencia de evaluaciones: no hay benchmarks publicados del modelo base ni de las cuantizaciones, por lo que la calidad real en tareas de codigo y tool calling no esta verificada de forma independiente.
- Modelo derivado de un merge: los merges pueden heredar sesgos y comportamientos inconsistentes de los modelos fuente; no se documenta la composicion del merge.
- Alucinacion: como cualquier modelo generativo de este tamano, puede producir APIs inexistentes, imports erroneos o funciones inventadas, especialmente con contexto largo o prompts ambiguos.
- Degradacion por cuantizacion: las cuantizaciones Q2_K, Q3_K_S y Q3_K_M conllevan perdida de calidad apreciable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas.
- Fiabilidad del tool calling: aunque se declara soporte, no se documenta el formato de plantilla de chat ni el esquema de herramientas; la fiabilidad en bajas precisiones (Q2-Q3) puede caer de forma acusada.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede planificar el coste de cache KV ni garantizar el comportamiento en conversaciones largas o repositorios extensos.
- Multimodalidad sin documentar: la presencia de ficheros mmproj no va acompanada de instrucciones de uso, por lo que no debe asumirse como capacidad operativa.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar que el modelo base (ManniX-ITA/JackOD-9B-Coder) mantiene la misma licencia y no impone condiciones adicionales derivadas de los modelos fusionados.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026) no coinciden con el momento de redaccion de esta ficha, lo que sugiere un error de sellado de tiempo; conviene verificar la version real de los pesos antes de desplegarlos.
- Repositorio de gran tamano: 85,1 GB en total, porque contiene todas las cuantizaciones; descargar unicamente el fichero GGUF necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/JackOD-9B-Coder-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/JackOD-9B-Coder
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/JackOD-9B-Coder-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#JackOD-9B-Coder-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible
