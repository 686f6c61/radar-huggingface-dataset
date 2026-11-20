# mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF

## Resumen

Qwen-3.8-27B-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo multimodal junafinity/Qwen-3.8-27B-Uncensored, publicada por el usuario mradermacher. Se trata de una variante "abliterated" y sin censura de un modelo de la familia Qwen (etiquetado internamente como qwen3_5), con 27.320.697.856 parametros totales y capacidad de procesamiento image-text-to-text. El repositorio ofrece cuantizaciones con imatrix (i1) en un rango que va de Q2_K (11,0 GB) a Q6_K (22,5 GB), pensadas para inferencia local con llama.cpp y derivados.

El modelo base es un derivado de Qwen con las capas de rechazo eliminadas (abliteration), lo que lo orienta a usos donde el modelo original rechazaria peticiones por politicas de seguridad. La licencia declarada es Apache 2.0 y el unico idioma listado es el ingles. El pipeline declarado es image-text-to-text, lo que implica soporte de entrada de imagenes ademas de texto, aunque los ficheros mmproj necesarios para la parte visual no estan en este repositorio sino en el repositorio de cuantizaciones estaticas del mismo autor.

La relevancia practica de esta ficha es doble: por un lado, documenta una opcion de despliegue local de un modelo de ~27B en hardware de consumo mediante cuantizacion agresiva; por otro, advierte de que se trata de un derivado sin censura, sin benchmarks publicados y con un unico mantenedor de cuantizacion, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia qwen3_5; transformer multimodal segun pipeline image-text-to-text) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; se mencionan tambien IQ3_XXS, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_S, IQ1_M, IQ3_XS en la lista de quants del autor |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix aparte); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. La etiqueta qwen3_5 y el pipeline image-text-to-text indican que se trata de un transformer multimodal de la familia Qwen, con capacidad de recibir imagenes y texto. El dato de parametros totales (27.320.697.856) procede de los safetensors del modelo base, no de los ficheros GGUF.

Respecto al entrenamiento, la model card no documenta numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o etapas de alineacion. Lo unico relevante tecnicamente es el proceso de abliteration aplicado sobre el modelo original para eliminar el comportamiento de rechazo, y la cuantizacion con imatrix (weighted/imatrix quants) realizada por mradermacher, que usa un fichero de importancia para preservar mejor la calidad en cuantizaciones bajas. No hay informacion sobre innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), con la salvedad de que los ficheros mmproj estan en el repositorio de cuantizaciones estaticas.
- Comportamiento sin censura: el proceso de abliteration elimina los rechazos tipicos del modelo original ante peticiones sensibles.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Capacidades especiales (thinking mode, audio, vision adicional): vision si (image-text-to-text); el resto no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: usando la cuantizacion i1-Q4_K_M (16,9 GB) el modelo cabe en GPUs con 24 GB de VRAM, lo que permite ejecutar un modelo de ~27B sin infraestructura de servidor.
- Investigacion sobre alineacion y abliteration: el modelo sirve para estudiar como varia la calidad y la tasa de rechazo tras eliminar las capas de seguridad, comparando respuestas con el modelo base original.
- Generacion creativa sin restricciones de politica: escritura de ficcion, guiones o material narrativo que el modelo original rechazaria por contenido sensible, con control humano posterior.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y describir contenido de capturas, diagramas o documentos escaneados, siempre que se descarguen los ficheros mmproj del repositorio estatico.
- Prototipado de asistentes conversacionales en ingles: la etiqueta conversational y la compatibilidad con endpoints permiten montar un servicio de chat local con llama.cpp o servidores compatibles.
- Experimentacion con cuantizaciones imatrix: el repositorio incluye el fichero imatrix y una escala completa de cuantizaciones, util para medir la degradacion de perplejidad entre Q2_K y Q6_K en un mismo modelo.
- Evaluacion de riesgos en pipelines de moderacion: usar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de filtrado propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~11,0 GB; i1-IQ3_S ~12,7 GB; i1-Q3_K_M ~13,6 GB; i1-IQ4_XS ~15,4 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB (sin contar el contexto KV cache ni el proyector multimodal).
- GPU recomendadas: para Q4_K_M o superiores, GPUs de 24 GB (RTX 3090, RTX 4090) o profesionales (A100 40 GB, H100) si se quiere contexto largo y margen de VRAM. Para Q2_K o IQ3_S, GPUs de 12-16 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 12 GB solo con Q2_K o IQ3_S y contexto reducido.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el formato GGUF no es compatible con vLLM ni TGI en su configuracion habitual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-3.8-27B-Uncensored-i1-GGUF (este) | 27,32B | no disponible | GGUF i1 | apache-2.0 | Cuantizado por mradermacher, multimodal, sin censura |
| Qwen-3.8-27B-Uncensored-GGUF (estatico) | 27,32B | no disponible | GGUF estatico | apache-2.0 | Mismo autor, incluye ficheros mmproj para vision |
| junafinity/Qwen-3.8-27B-Uncensored | 27,32B | no disponible | safetensors | apache-2.0 | Modelo base sin cuantizar, requiere transformers |
| Modelos Qwen originales de ~27B | no disponible | no disponible | safetensors/GGUF | no disponible | Referencia de comparacion; no se dispone de datos verificados en esta busqueda |

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de calidad tras la abliteration, por lo que no se puede verificar la degradacion respecto al modelo original.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas no esta documentado y puede ser deficiente.
- Contexto desconocido: no se especifica la longitud de contexto, un dato critico para planificar despliegues con documentos largos.
- Vision incompleta en este repositorio: los ficheros mmproj necesarios para procesar imagenes estan en el repositorio de cuantizaciones estaticas, no en este.
- Un unico mantenedor de cuantizacion: la calidad y el soporte dependen de mradermacher; el modelo base procede de un autor (junafinity) sin trazabilidad publica documentada.
- Riesgo de alucinacion: no cuantificado; al tratarse de un derivado sin evaluacion publicada, conviene validar las salidas en cualquier uso productivo.
- Licencia Apache 2.0 declarada, pero la cadena de derivacion (modelo original Qwen, abliteration, cuantizacion) deberia revisarse antes de un uso comercial para confirmar el cumplimiento de las condiciones de los modelos intermedios.
- Fecha de creacion futura en los metadatos (2026-08-23), lo que sugiere que los campos de fecha del repositorio no son fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen-3.8-27B-Uncensored-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
