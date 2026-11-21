# mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parametros (9.197.093.888 segun los pesos en safetensors) construido mediante la fusion (merge) de dos modelos derivados de la familia Qwen3.5, combinados con la tecnica SLERP (Spherical Linear Interpolation). El modelo base original fue publicado por el usuario xtools-at, y esta ficha corresponde a la version cuantizada en formato GGUF elaborada por mradermacher, un conocido generador de cuantizaciones de la comunidad.

El modelo se presenta como un merge orientado a razonamiento, generacion de codigo, uso de herramientas (tool calling / function calling), matematicas y tareas STEM, con un enfasis explicito en capacidades de agente y en un caracter "uncensored" o "decensored" (etiquetas heretic y decensored en la model card). Incorpora ademas un componente multimodal (archivos mmproj), lo que sugiere soporte de vision. Los idiomas declarados son ingles, chino, espanol, ruso y japones.

La relevancia de esta publicacion radica en que ofrece, bajo licencia Apache 2.0, una version cuantizada en multiples niveles (desde Q2_K hasta f16) de un merge de 9B pensado para ejecucion local y despliegue en hardware de consumo, con un enfoque en razonamiento y agentes que lo situa en la estela de modelos como DeepSeek o los destilados de Claude, segun indican sus etiquetas. No obstante, no se dispone de datos de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag qwen3_5); merge por SLERP de dos modelos |
| Parametros totales | 9.197.093.888 (aprox. 9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 (multimodal) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 (tag qwen3_5), con aproximadamente 9.200 millones de parametros. El modelo no se entrena desde cero, sino que se obtiene mediante un merge por SLERP (interpolacion esferica lineal) de dos modelos derivados, dando lugar a la variante "2xMerge". El nombre del modelo base (Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic) sugiere que los componentes fusionados incorporan influencias de destilados o trazas de Claude Opus y DeepSeek, aunque no se detalla la composicion exacta de los modelos originales ni sus proporciones en el merge.

En cuanto a los datos de entrenamiento, la model card referencia tres datasets: Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. Estos conjuntos apuntan a un entrenamiento o ajuste orientado a trazas de razonamiento (reasoning traces) y a comportamiento de agente, presumiblemente mediante destilacion de trazas de modelos mayores. No se especifica el numero total de tokens, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO. La etiqueta "heretic" hace referencia a tecnicas de "abliteration" o eliminacion de rechazos (decensoring), que reducen las negativas del modelo ante ciertas peticiones.

## Capacidades

- Generacion de texto general y conversacion multi-turno.
- Razonamiento (reasoning), con etiquetas explicitas de reasoning y trazas de razonamiento en el entrenamiento.
- Generacion de codigo (coding) y tareas de programacion.
- Matematicas y tareas STEM.
- Tool calling / function calling, con etiquetas dedicadas (tool-use, function-calling).
- Capacidades de agente y razonamiento multi-paso (agent).
- Multimodalidad: la presencia de archivos mmproj (Q8_0 y f16) indica soporte de entrada visual (vision) en la version GGUF.
- Multilingue: ingles, chino, espanol, ruso y japones.
- Comportamiento "uncensored"/"decensored" (heretic): menor tendencia a rechazar peticiones.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o terminales mediante llama.cpp u Ollama para autocompletado, explicacion y refactorizacion de codigo, aprovechando sus capacidades de coding y su tamano de 9B, que cabe en GPUs de consumo en cuantizaciones Q4.
- Agentes con tool calling: al soportar function calling y razonamiento multi-paso, puede emplearse en pipelines de agentes que invocan APIs, consultan bases de datos o ejecutan acciones encadenadas, con la ventaja de ejecutarse en infraestructura propia.
- Razonamiento matematico y STEM: util para resolver problemas paso a paso, generar explicaciones didacticas o verificar calculos en entornos educativos o de investigacion, gracias a sus trazas de razonamiento entrenadas.
- Procesamiento de documentos con vision: la variante con mmproj permite pasar imagenes junto al texto, habilitando tareas de descripcion de imagenes, extraccion de informacion de capturas o analisis de diagramas en local.
- Atencion al cliente y chat multi-turno: puede desplegarse como backend conversacional en espanol (uno de los idiomas declarados) para soporte automatizado, con la salvedad de que la longitud de contexto no esta documentada.
- Generacion aumentada por recuperacion (RAG) en local: combinado con una base vectorial, puede responder preguntas sobre documentacion interna sin enviar datos a la nube, lo que resulta atractivo por su licencia Apache 2.0 y su ejecucion offline.
- Experimentacion en investigacion sobre merges y decensoring: util para estudiar el efecto de SLERP y de tecnicas heretic en el comportamiento del modelo, comparandolo con sus componentes originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de contexto): Q2_K ~4,1 GB; Q3_K_M ~4,9 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_S ~6,6 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Anadir ~0,7-1,0 GB si se usa el componente multimodal (mmproj).
- Cabe en GPUs de consumo: Q4_K_M (~5,9 GB) entra en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con margen para contexto moderado; Q5/Q6 requieren 8-12 GB (RTX 4070, RTX 3080); Q8_0 requiere ~12 GB o mas (RTX 4070 Ti, RTX 4080); f16 requiere ~24 GB (RTX 3090, RTX 4090, A100 40 GB).
- GPUs profesionales recomendadas para mayor throughput: A100, H100, L40S; para uso local, RTX 4090 o RTX 3090 con cuantizaciones Q5-Q8.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, llama-cpp-python; para el modelo base en transformers, vLLM o TGI (no se confirma compatibilidad explicita en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-...-heretic (este) | ~9,2 B | no disponible | Apache 2.0 | GGUF | Merge SLERP, uncensored, multimodal (mmproj) |
| Qwen3.5 9B (base de la familia) | ~9 B | no disponible | segun modelo original | safetensors/GGUF | Modelo de referencia de la familia |
| Modelos 8-9B tipo Llama 3.1 8B | ~8 B | 128 K (segun su ficha) | Llama license | safetensors/GGUF | Alternativa generalista, contexto documentado |
| Gemma 2 9B | ~9 B | 8 K (segun su ficha) | Gemma license | safetensors/GGUF | Alternativa generalista de Google |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No hay benchmarks publicados que permitan validar las capacidades declaradas (razonamiento, codigo, matematicas); las etiquetas de la model card no constituyen evidencia empirica.
- La longitud de contexto no esta documentada; no debe asumirse una ventana larga sin verificacion.
- Al ser un merge por SLERP de componentes no detallados, el comportamiento puede ser inconsistente o degradado respecto a los modelos originales, especialmente en tareas especializadas.
- El caracter "uncensored"/"decensored" (heretic) implica que el modelo puede generar contenido que otros modelos rechazarian; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion inherente a modelos de este tamano; no apto para decisiones criticas sin supervision humana.
- El soporte multilingue declarado (en, zh, es, ru, ja) no garantiza calidad uniforme; el espanol puede tener un rendimiento inferior al ingles.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base y de los datasets de entrenamiento referenciados, que podrian imponer restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 21 de noviembre de 2026) sin validacion de la comunidad.
- El componente multimodal depende de archivos mmproj separados; su integracion en herramientas de despliegue puede requerir configuracion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Dataset: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
