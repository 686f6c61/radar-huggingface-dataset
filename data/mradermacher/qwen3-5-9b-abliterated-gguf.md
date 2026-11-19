# mradermacher/Qwen3.5-9B-abliterated-GGUF

## Resumen

Qwen3.5-9B-abliterated-GGUF es la distribucion en formato GGUF del modelo wangzhang/Qwen3.5-9B-abliterated, una variante "abliterated" (sin censura) de un modelo de la familia Qwen 3.5 con aproximadamente 8.950 millones de parametros. La publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que mantiene un catalogo extenso de versiones GGUF de modelos abiertos, y esta pensada para ejecucion local con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, entre otros).

El modelo base parte de la arquitectura de Qwen 3.5, un transformer denso de ~9B parametros, y ha sido sometido a un proceso de "abliteration": una tecnica de modificacion de pesos que elimina o atenua la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responde a peticiones que el modelo original rechazaria. El resultado es un modelo conversacional sin las salvaguardas habituales, con licencia Apache 2.0 y pesos publicados en safetensors (modelo base) y GGUF (esta distribucion).

Su relevancia practica es doble: por un lado, ofrece a desarrolladores e investigadores un modelo de ~9B ejecutable en hardware de consumo con cuantizaciones que van de 3,7 GB (Q2_K) a 18 GB (f16); por otro, permite estudiar el comportamiento de modelos desalineados y evaluar riesgos de seguridad en entornos controlados. Conviene subrayar que la model card declara unicamente el idioma ingles y no documenta contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); versiones imatrix/weighted en repo separado |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta distribucion); safetensors en el modelo base |
| Tamano del repo | 81,0 GB (incluye todas las cuantizaciones) |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1) |
| Modelo base | wangzhang/Qwen3.5-9B-abliterated |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen 3.5 y su naturaleza densa de ~9B parametros. No se documentan el numero de capas, dimensiones ocultas, mecanismo de atencion (si emplea atencion lineal, GQA o decodificacion especulativa), ni la composicion del dataset de preentrenamiento. Tampoco se especifican las etapas de alineamiento (SFT, RLHF, DPO) del modelo original ni los detalles del proceso de abliteration aplicado por wangzhang.

Lo que si es verificable es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas con la version 2 de su pipeline, que produce ficheros GGUF compatibles con llama.cpp. El autor mantiene ademas un repositorio paralelo con cuantizaciones ponderadas/imatrix (Qwen3.5-9B-abliterated-i1-GGUF), que suelen ofrecer mejor calidad por bit que las estaticas equivalentes. La model card no incluye informacion sobre datos de entrenamiento, numero de tokens ni innovaciones tecnicas del modelo subyacente.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Respuestas sin rechazo a peticiones que el modelo alineado original filtraria (comportamiento "uncensored"/"decensored" declarado en los tags).
- Uso como modelo base para fine-tuning e investigacion sobre alineamiento y desalineamiento.
- Compatibilidad con el ecosistema GGUF: inferencia en CPU y GPU mediante llama.cpp y frontends derivados.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking"; no disponibles en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles; el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo permite estudiar como responde un LLM de ~9B tras eliminar la direccion de rechazo, comparandolo con el modelo original en experimentos controlados de red teaming.
- Generacion de ficcion y contenido creativo sin restricciones: escritura de narrativa adulta, dialogos crudos o tramas que los modelos alineados suelen rechazar, en un entorno local donde el usuario controla los datos.
- Ejecucion local en hardware de consumo: con cuantizaciones Q4_K_M (5,7 GB) corre en GPUs de 8 GB de VRAM o en CPU con RAM suficiente, util para prototipos offline sin dependencia de APIs.
- Fine-tuning y destilacion: al estar en Apache 2.0 y con pesos safetensors en el modelo base, sirve como punto de partida para ajustes especificos de dominio sin las restricciones de licencia de otros modelos.
- Simulacion de personajes y roleplay: conversaciones multi-turno con personalidad consistente, aprovechando el formato conversacional y la ausencia de filtros.
- Evaluacion comparativa de cuantizaciones: el catalogo completo (de Q2_K a f16) permite medir la degradacion de calidad por bit y validar pipelines de cuantizacion propios.
- Educacion tecnica: estudio practico de como se distribuye un modelo en GGUF, que hace el proceso de abliteration y como afecta al comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~3,7 GB; Q3_K_M ~4,7 GB; Q4_K_S ~5,4 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Añadir entre 1 y 3 GB adicionales para la cache KV segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 solo si se necesita throughput elevado o contexto muy largo.
- Cabe en GPU de consumo: si, desde una RTX 3060 8 GB con Q4_K_M hasta una RTX 4090 con f16. En GPUs de 6 GB conviene bajar a Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque esta distribucion concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated-GGUF (este) | ~8,95B | no disponible | Apache 2.0 | GGUF | Variante sin censura, solo ingles declarado |
| wangzhang/Qwen3.5-9B-abliterated | ~8,95B | no disponible | Apache 2.0 | safetensors | Modelo base del que se derivan estas cuantizaciones |
| Qwen3.5-9B (original) | ~8,95B | no disponible | no disponible | safetensors | Modelo alineado con salvaguardas; referencia para comparar el efecto de la abliteration |
| mradermacher/Qwen3.5-9B-abliterated-i1-GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad por bit |

La comparacion con modelos de otros fabricantes (Llama, Mistral, Gemma) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo explicitamente sin censura: puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- La abliteration degrada capacidades: el proceso de eliminacion de la direccion de rechazo suele reducir el rendimiento en tareas de razonamiento, seguridad y seguimiento de instrucciones; no hay benchmarks que cuantifiquen esta perdida.
- Riesgo elevado de alucinacion: no se documentan datos de entrenamiento ni evaluaciones de factualidad.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre el contenido generado.
- El repositorio ocupa 81 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Sin garantias del autor sobre el modelo base ni sobre el proceso de abliteration; no hay informacion sobre sesgos especificos medidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-abliterated-GGUF
- Modelo base: https://huggingface.co/wangzhang/Qwen3.5-9B-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-abliterated-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-abliterated-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
