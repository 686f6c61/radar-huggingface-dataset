# parsecai/tod

## Resumen

parsecai/tod es un adaptador LoRA (libreria PEFT) sobre el modelo multimodal google/gemma-4-12B-it, publicado por la organizacion parsecai (daseinlabs) con licencia Apache-2.0. No es un modelo de proposito general: es un componente especializado de seleccion y reordenacion ("two-stage picker") que resuelve el problema de elegir, entre un conjunto de opciones de tamano arbitrario (N no acotado), cual es la correcta, devolviendo una probabilidad calibrada para cada opcion.

Su funcionamiento es en dos etapas: una etapa 1 de recuperacion puntual ("pointwise recall") sobre todas las N opciones, unida a un recuperador (retriever) propio cuando esta disponible, y una etapa 2 de reordenacion sobre la lista corta resultante (top-16, con k_each=8) mediante lectura por letras. La relevancia actual esta en que cubre un hueco poco atendido: clasificacion y enrutado con taxonomias abiertas y muy grandes, con probabilidades calibradas y soporte multimodal nativo (imagenes), en lugar de limitarse a un numero fijo de clases.

La informacion publicada incluye resultados propios en el banco JevBench, un conjunto de alto N (banking77 con N=799) y tres conjuntos de vision (scienceqa, ai2d, chartqa). El modelo base no se incluye en el repositorio: hay que aceptar la licencia de Gemma 4 en Hugging Face y se descarga en la primera carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre google/gemma-4-12B-it (etiquetado como gemma4, multimodal); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 12B en el modelo base; tamano del adaptador publicado no disponible (repo de 0,7 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 49.152 tokens (max_tokens configurado) |
| Tipos de cuantizacion | No disponible; pesos en safetensors. Se documenta dtype fp32 para evaluacion exacta y bfloat16 para servicio |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos del adaptador y del base); sujeto ademas a la Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (adaptadores LoRA PEFT: stage2_adapter y retriever) |

Parametros de inferencia documentados: stage-1 kind "union" con k=16, k_each=8; atencion `chunked_eager`; prompts `pointwise.v1` (etapa 1) y `cygnet.v1` (etapa 2); estilo de opcion `label_desc`; temperaturas de calibracion T1=1,7237, T1_ret=0,05, T2=1,4778.

## Arquitectura y entrenamiento

El sistema se compone de un modelo base congelado (google/gemma-4-12B-it, revision `default`) mas dos adaptadores: `stage2_adapter`, que implementa la reordenacion por letras de la lista corta, y `retriever`, que alimenta la etapa de recuperacion. La etapa 1 no usa adaptador (esta congelada) y opera de forma puntual sobre el conjunto completo de opciones; su salida se une con la del recuperador (union, k=16 total, 8 por via). La etapa 2 aplica una relectura tipo "multiple choice" por letras sobre la lista corta. Las probabilidades finales se obtienen aplicando las temperaturas calibradas guardadas en `picker.json`.

No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card remite a `data_pipeline/mixes/ATTRIBUTIONS.md` del repositorio de codigo para la atribucion de datos. La innovacion destacable es el diseno de dos etapas con N no acotado: para N <= k el picker degenera exactamente en una lectura por letras pura, y el resultado se devuelve siempre como una probabilidad calibrada por opcion (suma 1) alineada con el orden de entrada (`twostage_final_probs`).

## Capacidades

- Puntuacion y seleccion entre un numero arbitrario de opciones (N no acotado), devolviendo una probabilidad calibrada por opcion que suma 1.
- Reordenacion (reranking) de listas cortas de candidatos, con recuperacion previa cuando hay un retriever disponible.
- Clasificacion con etiquetas definidas en el propio prompt (`label_desc`), sin necesidad de reentrenar para taxonomias nuevas.
- Entrada multimodal: `predict()` acepta rutas de imagen, procesadas con el procesador nativo del modelo base.
- Modo de pregunta flexible: acepta una cadena, un diccionario de pregunta completo o `None`.
- Razonamiento en dos etapas con temperaturas de calibracion especificas por etapa.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible (el uso previsto es seleccion/reranking, no generacion abierta).
- Capacidades multilingues: no disponibles.
- Capacidad especial: probabilidades calibradas (se reportan Brier y ECE-db) y umbral de decision implicito para saber cuando una imagen "aporta" en la decision (columna "earns keep").

## Casos de uso

- Enrutado de intenciones en atencion al cliente: con taxonomias de varios cientos de intenciones (por ejemplo banking77, N=799, accuracy 0,735 y recall@16 de 0,963), el picker asigna la consulta del usuario a la intencion correcta y devuelve una probabilidad que permite derivar a un agente humano cuando la confianza es baja.
- Reranking en pipelines de RAG: dado un conjunto de pasajes recuperados por un buscador vectorial, el modelo reordena el top-16 y devuelve una probabilidad por pasaje, lo que permite fijar un umbral de corte antes de generar la respuesta.
- Triage y clasificacion de tickets con etiquetas dinamicas: como las opciones se pasan en el prompt, un equipo puede cambiar la taxonomia (categorias, prioridades, colas) sin reentrenar ni redesplegar adaptadores.
- Seleccion de herramientas en agentes: elegir entre un catalogo grande de herramientas o acciones descritas en lenguaje natural tratando cada herramienta como una opcion; las probabilidades calibradas permiten decidir cuando conviene pedir aclaracion en lugar de ejecutar.
- Analisis de diagramas y graficos: con las rutas de imagen en `images`, el modelo mejora notablemente en preguntas sobre graficos (chartqa: 0,97 con imagen frente a 0,79 sin imagen) y diagramas cientificos (ai2d: 0,87 frente a 0,62), lo que lo hace util en herramientas de soporte educativo o de analisis de informes.
- Moderacion y politicas con taxonomia abierta: evaluar un contenido contra un conjunto grande de reglas descritas como opciones y obtener la probabilidad de cada una para auditar decisiones.
- Anotacion asistida con confianza calibrada: al reportarse ECE-db de 0,0328 en JevBench, las probabilidades pueden usarse para priorizar revision humana en anotacion de datos.
- Evaluacion comparativa de candidatos en tareas de seleccion: usar las mismas particiones (easy/orig/hard) para medir si un cambio de prompt o de recuperador mejora el sistema.

## Benchmarks y rendimiento

JevBench publico (231 items, solo texto):

| Variante | Accuracy | Easy / orig / hard | Brier | ECE-db |
|---|---|---|---|---|
| release (etapa 2 entrenada) | 0,844 | 1,000 / 0,917 / 0,730 | 0,194 | 0,0328 |
| frozen floor | 0,861 | 1,000 / 0,944 / 0,748 | 0,195 | 0,0437 |

Alto N (por conjunto, two-stage calibrado con k=16):

| Conjunto | N | Accuracy | Recall@16 |
|---|---|---|---|
| banking77 | 799 | 0,735 | n/a |
| clinc150 | n/a | n/a | n/a |
| lexglue | n/a | n/a | n/a |
| tasksource | n/a | n/a | n/a |
| combined | | 0,735 | 0,963 |

Vision (delta de accuracy con imagen menos sin imagen, bootstrap por item):

| Conjunto | Accuracy con imagen | Accuracy sin imagen | Delta | Earns keep |
|---|---|---|---|---|
| scienceqa | 0,90 | 0,73 | +0,17 | True |
| ai2d | 0,87 | 0,62 | +0,25 | True |
| chartqa | 0,97 | 0,79 | +0,18 | True |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar de generacion, ya que el modelo es un componente de seleccion y no un generador de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del modelo base de 12B, no cifras publicadas por el autor): aproximadamente 24-26 GB en bfloat16 para los pesos, mas la cache KV correspondiente a la ventana configurada de 49.152 tokens; evaluacion exacta en fp32 en torno a 48 GB solo para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servir en bfloat16 con contexto largo. En configuraciones de dos etapas con muchas opciones, la memoria de activaciones crece con la longitud del prompt.
- GPU de consumo: una RTX 4090 (24 GB) queda al limite en bfloat16 con contexto reducido; con cuantizacion de 8 o 4 bits de los pesos base es viable en GPUs de 16-24 GB, asumiendo una conversion no publicada por el autor.
- El repositorio solo contiene adaptadores LoRA; hay que descargar aparte los pesos del base google/gemma-4-12B-it.
- Opciones de despliegue: transformers con PEFT (flujo documentado: `from tod.release.load import load_picker`), vLLM o TGI para servicio con adaptadores, con la atencion `chunked_eager` indicada en la configuracion. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Resultados publicados en JevBench |
|---|---|---|---|---|---|
| parsecai/tod | Adaptador LoRA para seleccion/reranking en dos etapas, multimodal | 12B (base) | 49.152 tokens configurados | Apache-2.0 | Accuracy 0,844 (release) y 0,861 (frozen floor) |
| google/gemma-4-12B-it | LLM multimodal instruct (modelo base, sin adaptadores) | 12B | No disponible | Apache-2.0 | No disponible |
| Cross-encoders de reranking dedicados | Reranker supervisado de un solo paso | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados de terceros sobre JevBench ni de comparativas directas con otros pickers o rerankers del mismo tamano. La comparacion cuantitativa con alternativas queda, por tanto, no disponible.

## Limitaciones y advertencias

- El modelo "release" con etapa 2 entrenada obtiene peor accuracy en JevBench publico que el "frozen floor" (0,844 frente a 0,861) y peor tambien en las particiones easy, orig y hard; conviene verificar en cada caso si merece la pena cargar el adaptador de etapa 2.
- Varios resultados de la tabla de alto N estan vacios (clinc150, lexglue, tasksource con "n/a"); la evidencia en N grande se reduce practicamente a banking77.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, y fechas de creacion y actualizacion de octubre de 2026 con solo tres minutos de diferencia, lo que sugiere una publicacion reciente y sin validacion externa.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion en la etapa 2: como la reordenacion se hace por letras sobre la lista corta, un fallo de recuperacion en etapa 1 es irrecuperable para la etapa 2.
- Idiomas soportados no declarados; las temperaturas y los prompts (`pointwise.v1`, `cygnet.v1`) estan calibrados para ingles, como sugieren los conjuntos de evaluacion usados.
- Licencia Apache-2.0 en los pesos, pero el modelo esta sujeto a la Gemma Prohibited Use Policy de Google; aunque el uso comercial no esta restringido por Apache-2.0, si lo esta por las politicas de uso aceptable de Gemma.
- El repositorio no incluye los pesos del modelo base: hay que aceptar la licencia de Gemma 4 y descargarlos por separado, lo que anade una dependencia y un coste de almacenamiento (unos 24 GB en bfloat16).
- El `NOTICE` documenta que los pesos base se han modificado mediante adaptadores LoRA; cualquier redistribucion debe mantener la atribucion y la declaracion de archivos modificados.
- No se documentan latencias, throughput ni comportamiento bajo carga concurrente, requisitos habituales antes de llevar el componente a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parsecai/tod
- Repositorio de codigo: https://github.com/daseinlabs/tod
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Perfil de la organizacion en Hugging Face: https://huggingface.co/parsecai
- Otro modelo de la organizacion (curator): https://huggingface.co/parsecai/curator
- Sitio del proyecto parsec: https://getparsec.ai/
- Repositorio del proyecto parsec (optimizacion de contexto para agentes): https://github.com/daseinlabs/parsec
- Articulo arXiv:2502.13310: https://arxiv.org/pdf/2502.13310 (aparece en la busqueda, pero no guarda relacion directa con este modelo)
- Atribucion de datos de entrenamiento: `data_pipeline/mixes/ATTRIBUTIONS.md` en el repositorio de codigo (sin URL directa en la informacion disponible)
