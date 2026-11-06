# RKB109/hybrid-semantic-search-20261105-model

## Resumen

El modelo `RKB109/hybrid-semantic-search-20261105-model` es un prototipo pequeno y transparente publicado por el usuario RKB109 en HuggingFace, orientado a busqueda semantica hibrida en entornos empresariales donde el acceso a APIs de embeddings esta restringido, resulta caro o no esta disponible. Combina pesos de tokens por etiqueta con recuperacion de evidencia ponderada por IDF (frecuencia inversa de documento), lo que lo convierte en una linea base lexica reproducible en lugar de un modelo neuronal de gran escala.

El modelo se presenta como una demostracion de arquitectura reproducible y no invoca ningun LLM alojado. Esta disenado para prototipado de arquitecturas, ejemplos de CI y evaluacion, comparaciones de lineas base locales y experimentacion educativa. Cubre las tareas de HuggingFace `sentence-similarity`, `feature-extraction`, `text-ranking` y `question-answering`.

No se dispone de informacion sobre arquitectura neuronal subyacente, numero de parametros, longitud de contexto ni idiomas soportados. La model card indica explicitamente que se trata de una linea base lexica ligera que deberia reemplazarse o compararse con embeddings de dominio a escala. La evaluacion reportada se realizo sobre solo 4 ejemplos sinteticos retenidos, con una precision de 1, lo que debe interpretarse con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Linea base lexica hibrida: pesos de tokens por etiqueta combinados con recuperacion de evidencia ponderada por IDF; no se especifica una arquitectura neuronal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card menciona un "model JSON format" en el repositorio de GitHub, pero no se detalla en HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura descrita es una linea base lexica hibrida: combina pesos de tokens asociados a etiquetas con recuperacion de evidencia ponderada por IDF. No se trata de un transformer ni de un modelo neuronal de gran escala, sino de un mecanismo transparente y explicable de recuperacion y ranking. El modelo fue generado para demostraciones reproducibles de arquitectura y no realiza llamadas a un LLM alojado.

El entrenamiento se realizo sobre un dataset sintetico pequeno vinculado (`RKB109/hybrid-semantic-search-20261105-dataset`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card menciona que el repositorio de GitHub incluye `train.py`, la particion exacta del dataset, el codigo de evaluacion y el formato JSON del modelo, lo que facilita la reproducibilidad completa del pipeline.

## Capacidades

- Similitud semantica de frases (`sentence-similarity`).
- Extraccion de caracteristicas textuales (`feature-extraction`).
- Ranking de textos (`text-ranking`).
- Respuesta a preguntas (`question-answering`).
- Recuperacion de evidencia ponderada por IDF con pesos de tokens por etiqueta.
- Funcionamiento local sin dependencia de APIs de embeddings ni de LLMs alojados.
- Reproducibilidad completa mediante codigo de entrenamiento y evaluacion publicado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades multilingues.

## Casos de uso

- Prototipado de arquitecturas de busqueda: permite validar pipelines de recuperacion y ranking de forma local antes de invertir en embeddings de dominio o modelos neuronales, gracias a su naturaleza lexica transparente y reproducible.
- Ejemplos de CI y evaluacion: al incluir `train.py`, la particion exacta del dataset y el codigo de evaluacion, puede integrarse en pipelines de integracion continua como referencia estable para detectar regresiones en sistemas de recuperacion.
- Comparaciones de lineas base locales: sirve como punto de partida cuantitativo para medir la mejora que aportan embeddings de dominio en un corpus concreto, con metricas como recall_at_3 o MRR.
- Experimentacion educativa: util para ensenar conceptos de recuperacion lexica, ponderacion IDF y ranking explicable sin requerir infraestructura de GPU.
- Busqueda empresarial en entornos restringidos: en escenarios donde las APIs de embeddings estan bloqueadas o son costosas, ofrece una alternativa lexica explicable para recuperacion de documentos internos.
- Evaluacion de calidad de recuperacion: permite calcular metricas de recuperacion (retrieval_accuracy, recall_at_3, mean_reciprocal_rank) sobre conjuntos de validacion propios antes de escalar a soluciones neuronales.
- Demostraciones de explicabilidad: al basarse en pesos de tokens y evidencia IDF, facilita explicar por que un documento se recupera para una consulta dada.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sinteticos retenidos |
| retrieval_accuracy | no reportado | metricas previstas, sin resultados publicados |
| recall_at_3 | no reportado | metricas previstas, sin resultados publicados |
| mean_reciprocal_rank | no reportado | metricas previstas, sin resultados publicados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato reportado es una precision de 1 sobre 4 ejemplos sinteticos, muestra demasiado pequena para extraer conclusiones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una linea base lexica sin parametros neuronales documentados, es probable que la inferencia sea en CPU, pero no se confirma en la informacion.
- GPU recomendadas: no disponible; no se documenta necesidad de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la libreria declarada es `custom`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (lineas base lexicas de busqueda semantica hibrida) con parametros, contexto, rendimiento o licencia documentados que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La linea base lexica es reproducible pero debe reemplazarse o compararse con embeddings de dominio a escala; su rendimiento en corpus reales no esta validado.
- El dataset es sintetico y muy pequeno (4 ejemplos retenidos en evaluacion), por lo que la precision de 1 no es representativa.
- No debe usarse para decisiones consecuenciales sin datos representativos, revision experta y evaluacion de grado de produccion, segun advierte el propio autor.
- No se documentan sesgos conocidos, pero al ser un modelo lexico puede heredar sesgos del vocabulario y del dataset sintetico.
- Riesgo de alucinacion no evaluado; al no ser un modelo generativo, el riesgo principal es de recuperacion erronea o ranking sesgado.
- No se documentan limitaciones de contexto ni de idioma, aunque la ausencia de idiomas declarados sugiere que no se ha validado su comportamiento multilingue.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre idoneidad para produccion.
- El modelo no invoca ningun LLM alojado; no debe confundirse con un modelo generativo ni con un sistema RAG completo.

## Enlaces

- HuggingFace: https://huggingface.co/RKB109/hybrid-semantic-search-20261105-model
- Dataset vinculado: https://huggingface.co/datasets/RKB109/hybrid-semantic-search-20261105-dataset
- Repositorio GitHub con `train.py`, particion del dataset, codigo de evaluacion y formato JSON del modelo: mencionado en la model card, URL no disponible en la informacion proporcionada.
