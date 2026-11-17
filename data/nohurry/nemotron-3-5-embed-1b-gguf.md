# nohurry/Nemotron-3.5-Embed-1B-GGUF

## Resumen

Nemotron-3.5-Embed-1B-GGUF es la conversion a formato GGUF del modelo de embeddings Nemotron-3.5-Embed-1B, publicada por el usuario nohurry en Hugging Face. Se trata de un modelo de extraccion de caracteristicas (feature-extraction) orientado a generar representaciones vectoriales densas de texto, no de un modelo generativo. Con 1.140.918.272 parametros, se situa en la franja de los modelos de embeddings de aproximadamente mil millones de parametros, un tamano que busca equilibrar calidad de representacion y coste de inferencia.

La relevancia de esta publicacion concreta radica en su formato: al estar distribuida como GGUF, puede ejecutarse con llama.cpp y herramientas compatibles (Ollama, servidores GGUF, etc.) sin necesidad de stack de PyTorch, lo que facilita su despliegue en entornos CPU, en hardware modesto o en pipelines de recuperacion de informacion autoalojados. La conversion se realizo con llama.cpp b12470, segun indica la model card.

La informacion disponible es muy limitada: no se documentan idiomas soportados, datos de entrenamiento, benchmarks ni detalles arquitectonicos mas alla de los derivados del repositorio. El repositorio ocupa 15,2 GB, coherente con la publicacion de multiples variantes de cuantizacion de un modelo de ~1,14 mil millones de parametros. La licencia declarada es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings, probablemente transformer encoder; no confirmado en la informacion) |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF; variantes concretas no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | GGUF (conversion con llama.cpp b12470) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el identificador y la tarea declarada (feature-extraction), se trata de un modelo de embeddings de aproximadamente 1,14 mil millones de parametros, presumiblemente un transformer de tipo encoder, pero este extremo no esta confirmado en la model card. El repositorio es una conversion de pesos, no un entrenamiento nuevo: el autor de la conversion es nohurry y el modelo base es Nemotron-3.5-Embed-1B.

Tampoco se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas. La unica nota tecnica presente es que la conversion se realizo con llama.cpp b12470, lo que implica compatibilidad con el formato GGUF y con las herramientas del ecosistema llama.cpp para inferencia de embeddings.

## Capacidades

- Generacion de embeddings de texto para tareas de representacion densa (feature-extraction).
- Uso previsto en recuperacion de informacion, busqueda semantica y similitud entre textos.
- Compatible con el ecosistema llama.cpp al estar en formato GGUF.
- Tag `endpoints_compatible` en el repositorio, lo que sugiere compatibilidad con endpoints de inferencia.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda semantica autoalojada: el modelo puede generar embeddings de documentos y consultas para un motor de recuperacion vectorial, aprovechando el formato GGUF para desplegarse en servidores sin GPU dedicada mediante llama.cpp.
- Sistemas RAG (retrieval-augmented generation): uso como codificador de recuperacion en pipelines que alimentan a un LLM generativo, indexando fragmentos de documentacion corporativa y recuperando los mas relevantes por similitud coseno.
- Deduplicacion y agrupamiento de textos: calculo de embeddings de grandes volumenes de registros para detectar duplicados o agrupar documentos tematicamente mediante clustering.
- Clasificacion de texto por similitud: comparacion de embeddings de entradas contra prototipos de cada clase, util para moderacion, etiquetado o enrutamiento de tickets.
- Despliegue en entornos con recursos limitados: al estar en GGUF, puede ejecutarse en CPU o en GPU de gama consumer, lo que permite integrarlo en aplicaciones de escritorio o edge sin infraestructura de datacenter.
- Evaluacion de similitud entre pares de frases: calculo de puntuaciones de similitud para tareas de matching, como comparacion de curriculos con ofertas de empleo o de preguntas con respuestas candidatas.
- Experimentacion e investigacion: por su tamano moderado (~1,14 mil millones de parametros), sirve como modelo base para estudiar tecnicas de embedding y recuperacion sin requerir grandes recursos de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,14 mil millones de parametros en FP16 ocuparia aproximadamente 2,3 GB solo en pesos; las cuantizaciones GGUF reducen esta cifra, aunque las variantes concretas publicadas no estan documentadas en la informacion.
- GPU recomendadas: no disponibles en la informacion. Por tamano, el modelo es apto para GPU consumer de gama media, pero no se confirma en la documentacion.
- Compatibilidad con GPU consumer: probable por tamano, si bien no se especifica en la informacion disponible.
- Opciones de despliegue: llama.cpp (herramienta con la que se realizo la conversion, version b12470) y herramientas compatibles con GGUF; el tag `endpoints_compatible` sugiere soporte de endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card es minima: no documenta idiomas, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta validar su calidad antes de usarlo en produccion.
- Riesgo de sesgos desconocido: al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion no aplicable en sentido estricto al no ser un modelo generativo, pero si existe riesgo de representaciones de baja calidad en dominios o idiomas no cubiertos por el entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana maxima de tokens y la cobertura linguistica.
- Licencia: OpenMDW 1.1 (declarada como `license: other`). Es necesario revisar los terminos en https://openmdw.ai/license/1-1/ antes de un uso comercial, ya que las condiciones no se detallan en la model card.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Al ser una conversion de terceros (nohurry) y no una publicacion oficial del autor del modelo base, conviene verificar la fidelidad de la conversion frente a los pesos originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nohurry/Nemotron-3.5-Embed-1B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- llama.cpp (herramienta de conversion, version b12470): https://github.com/ggml-org/llama.cpp
