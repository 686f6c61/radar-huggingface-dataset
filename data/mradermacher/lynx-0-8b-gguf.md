# mradermacher/Lynx-0.8B-GGUF

## Resumen

Lynx-0.8B es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros (1.006.672.704 según los pesos en safetensors), desarrollado originalmente por catsaiagency y cuantizado a formato GGUF por mradermacher. Está orientado a tareas de recuperación aumentada por generación (RAG) y respuesta a preguntas (question-answering), y se distribuye con soporte para 20 idiomas, entre ellos el castellano. El repositorio que nos ocupa no contiene los pesos originales, sino una colección de cuantizaciones estáticas en GGUF pensadas para inferencia local eficiente.

La relevancia de esta ficha radica en que Lynx-0.8B es un modelo pequeño, con un tamaño de repositorio de 9,9 GB repartido entre todas las variantes de cuantización, lo que permite desplegarlo en hardware modesto. La model card original no documenta la longitud de contexto, la arquitectura interna ni los datos de entrenamiento, por lo que muchos de los apartados de esta ficha se limitan a lo verificable en los metadatos y en la lista de cuantizaciones publicada.

El modelo se publica bajo la licencia propietaria `catsai-model-license`, que conviene revisar antes de cualquier uso comercial. La cuantización corre a cargo de mradermacher, que ofrece variantes desde Q2_K (0,6 GB) hasta f16 (2,1 GB), además de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, sin detalle en la model card) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, it, pt, nl, sv, pl, cs, hu, hr, ru, tr, vi, id, hi |
| Licencia | catsai-model-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `catsaiagency/Lynx-0.8B`: la model card del repositorio cuantizado no detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni especifica el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se documenta el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato tecnico verificable en el repositorio es la existencia de ficheros `mmproj` (multi-modal projection), lo que sugiere que el modelo base incorpora capacidades multimodales, probablemente de vision, aunque la model card no lo confirma explicitamente. Las cuantizaciones son estaticas y no se han publicado variantes con imatrix o ponderadas, segun indica el propio autor de la cuantizacion.

## Capacidades

- Generacion de texto y respuesta a preguntas: el pipeline declarado es `question-answering`, y las etiquetas incluyen `rag` y `question-answering`.
- Soporte multilingue para 20 idiomas, incluido el castellano, el ingles, el japones, el chino, el coreano y las principales lenguas europeas.
- Posible capacidad multimodal: la presencia de ficheros `mmproj` en el repositorio apunta a soporte de entrada de imagenes, aunque no se detalla en la model card.
- Conversacion multi-turno: la etiqueta `conversational` sugiere uso en dialogos, si bien no se especifica el formato de prompt.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo de razonamiento explicito (thinking): no disponible (no documentado).

## Casos de uso

- Respuesta a preguntas sobre documentacion corporativa: el modelo puede integrarse en un pipeline RAG que recupere fragmentos de una base documental y genere respuestas en castellano, aprovechando su etiqueta `rag` y su soporte multilingue.
- Asistente de atencion al cliente en varios idiomas: con 20 idiomas declarados, puede gestionar conversaciones en castellano, ingles, frances o aleman dentro de un mismo despliegue, aunque la calidad por idioma no esta documentada.
- Extraccion de respuestas en formularios y encuestas: al ser un modelo de question-answering, encaja en tareas de lectura comprensiva sobre textos cortos y extraccion de campos concretos.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_S y Q4_K_M (0,7-0,8 GB) permiten ejecutar el modelo en CPU o en GPUs de gama baja, lo que facilita prototipos y pruebas locales.
- Clasificacion y enrutado de consultas: un modelo de ~1.000 millones de parametros puede usarse como clasificador de intenciones o para decidir que documento recuperar antes de invocar un modelo mayor.
- Procesamiento de documentos con imagenes: si se confirma la capacidad multimodal a traves de los ficheros `mmproj`, podria emplearse para responder preguntas sobre capturas, formularios escaneados o figuras.
- Traduccion y resumen ligero entre los idiomas soportados: util como paso intermedio en pipelines de localizacion, siempre que se valide la calidad real por par de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,6 GB (Q2_K) y 2,1 GB (f16), segun la cuantizacion elegida; los ficheros mmproj anaden 0,2-0,3 GB si se usa la entrada multimodal.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar las variantes Q4_K_M o Q5_K_M; para f16 conviene disponer de 4-6 GB. En entornos profesionales, una RTX 4090, A100 o H100 no suponen ninguna restriccion para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1650 4 GB en adelante) e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de ~1.000 millones de parametros, se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lynx-0.8B (esta ficha) | 1.006.672.704 | no disponible | catsai-model-license | GGUF, safetensors | Orientado a RAG y QA, 20 idiomas |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32K (segun familia) | Apache 2.0 (variantes) | safetensors, GGUF | Alternativa abierta con contexto documentado |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeno con contexto largo y licencia con restricciones |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | safetensors, GGUF | Mayor tamano, requiere algo mas de VRAM |

La comparacion se limita a parametros, licencia y formato porque no hay datos de benchmarks publicados para Lynx-0.8B. Las alternativas citadas cuentan con documentacion tecnica mas completa y contextos declarados, lo que facilita su evaluacion previa.

## Limitaciones y advertencias

- La model card no documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas empiricas.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion; el riesgo de alucinacion y de respuestas sesgadas no esta cuantificado.
- La licencia `catsai-model-license` es propietaria y debe revisarse antes de cualquier uso comercial; no se garantiza permiso de redistribucion o modificacion.
- El modelo tiene ~1.000 millones de parametros, por lo que su capacidad de razonamiento complejo y de generacion de codigo es limitada en comparacion con modelos de mayor tamano.
- No se especifica el formato de prompt ni las plantillas de chat, lo que puede provocar degradacion en conversaciones multi-turno si no se ajusta manualmente.
- La calidad por idioma no esta documentada; el soporte del castellano figura en los metadatos, pero no hay evaluaciones que lo respalden.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lynx-0.8B-GGUF
- Modelo base: https://huggingface.co/catsaiagency/Lynx-0.8B
- Licencia del modelo: https://huggingface.co/catsaiagency/Lynx-0.8B/blob/main/MODEL-LICENSE.md
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Lynx-0.8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
