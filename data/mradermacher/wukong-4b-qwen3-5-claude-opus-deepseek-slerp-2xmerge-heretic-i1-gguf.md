# mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF es la distribucion en formato GGUF, con cuantizacion de tipo imatrix, del modelo fusionado xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic. El autor de esta publicacion es mradermacher, un conocido cuantizador de la comunidad de Hugging Face, mientras que el modelo base es un merge creado por xtools-at. El modelo resultante combina linajes derivados de Qwen3.5, Claude Opus y DeepSeek mediante la tecnica SLERP (spherical linear interpolation) a partir de dos ramas, y ha sido sometido a un proceso de "abliteration" o decensurado (etiquetado como heretic).

El modelo resuelve el problema de disponer de un LLM compacto de aproximadamente 4.300 millones de parametros con capacidades declaradas de razonamiento, generacion de codigo, uso de herramientas (tool calling), function calling, matematicas y tareas STEM, ademas de capacidades de vision segun la propia model card. Su relevancia actual radica en que ofrece estas capacidades en un tamano que cabe en GPUs de consumo, con licencia Apache 2.0 y en un formato GGUF listo para llama.cpp y derivados.

La informacion disponible sobre arquitectura interna, contexto nativo y datos de entrenamiento es escasa: la model card se limita a listar los datasets de destilacion utilizados y las etiquetas del modelo. Esta ficha refleja unicamente los datos verificables publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun tag `qwen3_5`); fusion SLERP de dos ramas |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M (segun lista de tags) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo i1 con imatrix); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base es un merge por SLERP de dos ramas, segun indica el nombre (`SLERP-2xMerge`). La etiqueta `qwen3_5` sugiere que la arquitectura subyacente es la de la familia Qwen3.5, aunque no se detalla configuracion de capas, atencion ni dimensiones. El sufijo `heretic` indica que el modelo ha pasado por un proceso de abliteration orientado a reducir rechazos y censura, lo que la model card refleja con las etiquetas `uncensored` y `decensored`.

En cuanto a datos de entrenamiento, la model card lista tres datasets de destilacion: `Jackrong/Claude-opus-4.6-TraceInversion-9000x`, `Jackrong/Claude-opus-4.7-TraceInversion-5000x` y `lambda/hermes-agent-reasoning-traces`. Estos nombres sugieren trazas de razonamiento generadas a partir de modelos Claude Opus y trazas de agente del ecosistema Hermes, empleadas para destilar capacidades de razonamiento y uso de herramientas. No se especifica el numero total de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (tag `reasoning`) y destilacion de trazas de razonamiento.
- Generacion de codigo (tag `coding`).
- Uso de herramientas y function calling (tags `tool-use`, `function-calling`).
- Comportamiento orientado a agentes (tag `agent`).
- Matematicas y tareas STEM/ciencia (tags `math`, `stem`, `science`).
- Capacidades de vision: la model card indica explicitamente "This is a vision model", con ficheros mmproj en el repositorio estatico.
- Multilingue en ingles, chino, espanol, ruso y japones.
- Modo sin censura / reduccion de rechazos (etiquetas `uncensored`, `decensored`, `heretic`).

## Casos de uso

- Asistente de codigo en local: con cuantizaciones i1-Q4_K_M de ~2,9 GB, el modelo puede ejecutarse en un portatil con GPU de consumo para autocompletado, explicacion de fragmentos y generacion de tests, integrable en editores mediante llama.cpp u Ollama.
- Agente con tool calling en pipelines de automatizacion: las etiquetas `tool-use` y `function-calling` permiten conectar el modelo a APIs y ejecutar tareas multi-paso (consulta de datos, envio de correos, gestion de tickets) en entornos donde no se puede enviar informacion a la nube.
- Razonamiento matematico y STEM en entornos educativos: la destilacion sobre trazas de razonamiento y las etiquetas `math` y `stem` lo hacen adecuado para resolver problemas paso a paso en tutorizacion offline.
- Procesamiento de documentos con vision: al ser un modelo multimodal con ficheros mmproj, puede emplearse para extraer informacion de imagenes y capturas en flujos locales, por ejemplo clasificacion de recibos o lectura de formularios.
- Atencion al cliente en idiomas minoritarios del repo (es, ru, ja, zh): permite desplegar un bot conversacional multilingue en infraestructura propia sin coste por token.
- Prototipado de investigacion sobre merges y abliteration: util para estudiar el efecto del SLERP y del decensurado en el comportamiento del modelo, comparando con el repo base y con las cuantizaciones estaticas.
- Generacion de contenido sin restricciones en entornos controlados: la naturaleza `heretic` lo hace util para pruebas de robustez y evaluacion de filtros de seguridad, siempre con las cautelas legales oportunas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (i1-Q2_K), 2,9 GB (i1-Q4_K_M), 3,3 GB (i1-Q5_K_M) y 3,7 GB (i1-Q6_K), sin contar el espacio adicional para el contexto KV cache ni los ficheros mmproj de vision.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4070 y superiores; A100/H100 solo justificables por concurrencia, no por tamano del modelo.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM en cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. Para los pesos originales en safetensors, transformers y posiblemente vLLM/TGI, aunque no se confirma.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic (i1-GGUF) | ~4,3B | no disponible | Apache 2.0 | GGUF | Merge SLERP con abliteration, vision, multilingue |
| Repo base xtools-at/Wukong-4B-...-heretic | ~4,3B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Version estatica mradermacher/...-GGUF | ~4,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones sin imatrix; incluye mmproj |
| Qwen3.5 base (familia) | no disponible | no disponible | no disponible | no disponible | Linaje arquitectonico declarado por el tag `qwen3_5` |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El proceso de abliteration (`heretic`, `uncensored`) reduce los rechazos del modelo, lo que aumenta el riesgo de generar contenido danino, ofensivo o legalmente problematico; requiere filtros externos en produccion.
- Riesgo de alucinacion inherente a un modelo de ~4,3B destilado de trazas de modelos mayores; la destilacion no garantiza la fidelidad del razonamiento.
- No se documenta la longitud de contexto nativa ni si el merge la preserva; conviene validar el comportamiento en contextos largos antes de desplegar.
- Idiomas soportados limitados a en, zh, es, ru y ja; el rendimiento en espanol no esta cuantificado y puede ser inferior al de modelos nativos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de destilacion pueden tener terminos adicionales; conviene revisar los repositorios de origen.
- La model card del repo cuantizado es generica y no incluye informacion sobre sesgos, evaluaciones de seguridad ni limitaciones especificas del merge.
- El tag `transformers` y el tamano del repo (39,6 GB) incluyen multiples cuantizaciones; descargar solo el fichero GGUF necesario.
- No hay garantia de que las capacidades de vision funcionen correctamente en todas las cuantizaciones; los ficheros mmproj estan en el repo estatico.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset de destilacion Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de destilacion Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agente Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
