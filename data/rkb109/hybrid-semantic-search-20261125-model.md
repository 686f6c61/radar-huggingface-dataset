# RKB109/hybrid-semantic-search-20261125-model

## Resumen

El modelo `hybrid-semantic-search-20261125-model`, publicado por el usuario RKB109, es un prototipo pequeno y reproducible orientado a busqueda semantica hibrida. No se trata de un modelo de lenguaje neuronal, sino de un artefacto de tipo lexico que combina pesos de tokens por etiqueta con recuperacion de evidencia ponderada por IDF (inverse document frequency). Su proposito declarado es servir como linea base transparente para busquedas empresariales cuando las APIs de embeddings no estan disponibles, resultan caras o estan restringidas.

El modelo se distribuye bajo licencia MIT, con la libreria declarada como `custom` y la tarea principal `sentence-similarity`, aunque tambien declara cobertura para `feature-extraction`, `text-ranking` y `question-answering`. Fue generado para demostraciones de arquitectura reproducibles y, segun la model card, no invoca ningun LLM alojado.

Su relevancia es acotada: se presenta como ejemplo educativo y de comparacion local, no como un componente listo para produccion. La evaluacion reportada es minima (4 ejemplos sinteticos retenidos, accuracy 1), por lo que debe interpretarse como una prueba de concepto reproducible y no como evidencia de calidad de recuperacion a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Baseline lexico hibrido: pesos de tokens por etiqueta combinados con recuperacion de evidencia ponderada por IDF |
| Parametros totales | no disponible (modelo no neuronal; formato JSON propio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica a un modelo lexico en formato JSON) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (formato de modelo propio descrito en el repositorio GitHub enlazado) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal: se describe como un baseline lexico ligero que asigna pesos a tokens por etiqueta y recupera evidencia usando ponderacion IDF. Esta combinacion de senal lexica y evidencia estadistica es lo que el autor denomina "hibrido" en el contexto de busqueda semantica, sin recurrir a embeddings densos externos.

El entrenamiento se realizo sobre el dataset sintetico `RKB109/hybrid-semantic-search-20261125-dataset`, de tamano reducido y naturaleza sintetica. La model card no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de artefacto). La reproducibilidad se apoya en un repositorio GitHub que incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y la descripcion del formato JSON del modelo.

## Capacidades

- Similitud de frases (`sentence-similarity`) mediante senal lexica ponderada.
- Extraccion de caracteristicas textuales (`feature-extraction`) en formato de pesos por token.
- Ranking de textos (`text-ranking`) usando evidencia recuperada con ponderacion IDF.
- Respuesta a preguntas (`question-answering`) en el sentido de recuperacion de evidencia, no de generacion.
- Baseline transparente y auditable: los pesos y el mecanismo de puntuacion son inspeccionables.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidades multilingues: no disponibles segun la informacion proporcionada.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prototipado de arquitectura de busqueda: sirve para validar el diseno de un pipeline de recuperacion antes de invertir en embeddings densos o APIs externas, ya que su logica es inspeccionable y reproducible.
- Ejemplos de CI y evaluacion: puede integrarse en tests automatizados como baseline de referencia para detectar regresiones en sistemas de ranking o similitud.
- Comparaciones locales de linea base: util para medir cuanto mejora un embedding neuronal frente a un enfoque lexico ponderado en un corpus concreto.
- Experimentacion educativa: adecuado para ensenar conceptos de IDF, ponderacion de tokens y recuperacion de evidencia sin depender de infraestructura de GPU.
- Entornos con restricciones de red o coste: al no invocar APIs de embeddings ni LLMs alojados, encaja en escenarios donde el acceso externo esta limitado.
- Recuperacion de evidencia explicable: en dominios donde se exige justificar por que un documento se considera relevante, los pesos por token permiten auditar la decision.
- Evaluacion de metricas de recuperacion: la model card menciona `retrieval_accuracy`, `recall_at_3` y `mean_reciprocal_rank` como metricas previstas, utiles para montar arneses de evaluacion.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sinteticos retenidos |
| Retrieval accuracy | no disponible (metrico previsto, sin valor publicado) | no disponible |
| Recall@3 | no disponible (metrico previsto, sin valor publicado) | no disponible |
| Mean reciprocal rank | no disponible (metrico previsto, sin valor publicado) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato numerico es una accuracy de 1 sobre 4 ejemplos sinteticos, muestra demasiado pequena para ser concluyente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un artefacto lexico en formato JSON y no requiere GPU.
- GPU recomendadas: ninguna; la inferencia puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: al usar libreria `custom`, el despliegue depende del codigo del repositorio GitHub enlazado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser un baseline lexico, la latencia dependera del tamano del corpus y de la implementacion de recuperacion IDF, no del modelo en si.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hybrid-semantic-search-20261125-model | Baseline lexico hibrido (JSON) | no disponible | no disponible | MIT | Hugging Face |
| BM25 (implementaciones tipo rank_bm25) | Recuperacion lexica | no aplica | no aplica | Apache 2.0 / BSD segun implementacion | Amplia |
| TF-IDF (scikit-learn) | Recuperacion lexica ponderada | no aplica | no aplica | BSD | Amplia |
| Modelos de embeddings tipo sentence-transformers | Transformer denso | 20M-500M tipico | 256-512 tokens tipico | Apache 2.0 / MIT segun modelo | Hugging Face |

La comparativa con modelos neuronales de embeddings no es directa: este artefacto no genera vectores densos ni requiere GPU. Frente a BM25 o TF-IDF, su propuesta es anadir pesos por etiqueta sobre la senal IDF, con la ventaja de ser auditable y la desventaja de una evaluacion practicamente inexistente. No se dispone de datos de rendimiento comparado con alternativas.

## Limitaciones y advertencias

- El dataset es sintetico y muy pequeno (4 ejemplos retenidos en evaluacion), por lo que la accuracy de 1 no es representativa.
- El autor advierte explicitamente de que el baseline debe sustituirse o compararse con embeddings de dominio a escala.
- No debe usarse para decisiones consecuenciales sin datos representativos, revision experta y evaluacion de produccion.
- Al ser un enfoque lexico, es previsible una baja cobertura ante parafrasis, sinonimos y vocabulario fuera del dataset sintetico (no documentado formalmente).
- Idiomas soportados: no disponibles; no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperar evidencia irrelevante por coincidencia lexica.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin senales de validacion por la comunidad.
- La licencia MIT permite uso comercial, pero la ausencia de evaluacion solida desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/hybrid-semantic-search-20261125-model
- Dataset en Hugging Face: https://huggingface.co/datasets/RKB109/hybrid-semantic-search-20261125-dataset
- Repositorio GitHub con `train.py`, split y evaluacion: no disponible como URL en la informacion proporcionada (la model card lo menciona sin enlace)
- Paper o blog tecnico: no disponible
- Demo: no disponible
