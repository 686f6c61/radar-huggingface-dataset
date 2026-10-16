# RKB109/hybrid-semantic-search-20261016-model

## Resumen

El modelo `RKB109/hybrid-semantic-search-20261016-model` es un prototipo pequeno y transparente orientado a busqueda semantica empresarial, publicado por el usuario RKB109 bajo licencia MIT. No es una red neuronal profunda ni un transformer: se trata de un baseline lexico que combina pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF, disenado para funcionar sin depender de APIs de embeddings externas, caras o restringidas.

Su relevancia es metodologica mas que de rendimiento: el autor lo presenta como una demostracion de arquitectura reproducible, con codigo de entrenamiento (`train.py`), particion exacta del dataset, codigo de evaluacion y formato JSON del modelo disponibles en un repositorio GitHub vinculado. La idea es ofrecer una linea base local que se pueda comparar contra embeddings de dominio en fases posteriores.

El modelo no invoca ningun LLM alojado, se distribuye mediante la libreria `custom` y esta registrado para las tareas `sentence-similarity`, `feature-extraction`, `text-ranking` y `question-answering`. No se han publicado datos sobre numero de parametros, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Baseline lexico con pesos de token por etiqueta y recuperacion ponderada por IDF (no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de pesos JSON, no tensores) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (formato propio descrito en el repositorio del autor) |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de red neuronal. Segun la model card, combina pesos de token calculados por etiqueta con una etapa de recuperacion de evidencia ponderada por IDF. Se trata, por tanto, de un sistema de ranking lexico con ajuste supervisado de pesos, pensado para ser interpretable y reproducible.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; estos conceptos no aplican a un baseline de este tipo. El dataset asociado (`RKB109/hybrid-semantic-search-20261016-dataset`) es sintetico y de tamano reducido. El repositorio GitHub mencionado incluye `train.py`, la particion exacta del dataset, el codigo de evaluacion y la descripcion del formato JSON del modelo, lo que permite reproducir el pipeline completo.

## Capacidades

- Recuperacion semantica mediante similitud entre frases (`sentence-similarity`), apoyada en coincidencia lexica ponderada.
- Extraccion de caracteristicas textuales (`feature-extraction`) en forma de pesos y evidencias, no de embeddings densos.
- Ranking de textos (`text-ranking`) con puntuaciones derivadas de pesos por etiqueta e IDF.
- Respuesta a preguntas (`question-answering`) en el sentido de seleccionar evidencia relevante, no de generacion libre de texto.
- Funcionamiento totalmente local, sin llamadas a APIs de embeddings ni a LLMs alojados.
- Trazabilidad: cada decision de recuperacion procede de pesos y coincidencias de tokens inspeccionables.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Linea base en experimentos de busqueda semantica: usar el modelo como referencia inicial antes de introducir embeddings densos, de modo que cualquier mejora posterior se pueda medir contra un punto de partida reproducible.
- Prototipado de arquitecturas de recuperacion: permite validar el diseno de un pipeline de ranking (tokenizacion, pesos, agregacion, ordenacion) sin coste de inferencia en GPU.
- Integracion en CI y evaluacion automatizada: al ser deterministico y ligero, encaja como prueba de regresion en pipelines de integracion continua que verifiquen que la calidad de recuperacion no se degrada entre versiones.
- Entornos con restricciones de red o de coste: en escenarios donde las APIs de embeddings estan bloqueadas, son caras o no estan aprobadas, este baseline ofrece recuperacion local sin dependencias externas.
- Material educativo: sirve para explicar de forma tangible como funcionan la ponderacion IDF, el ranking lexico y la evaluacion de recuperacion (recall@3, MRR) sin la caja negra de un transformer.
- Comparacion controlada de metricas de recuperacion: el autor declara como metricas previstas `retrieval_accuracy`, `recall_at_3` y `mean_reciprocal_rank`, utiles para contrastar contra sistemas de embeddings en el mismo conjunto de evaluacion.
- Auditoria de explicabilidad: al basarse en pesos de token y coincidencias, permite justificar por que un documento concreto ha sido recuperado, algo que un embedding denso no ofrece de forma directa.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sinteticos reservados (held-out) |
| retrieval_accuracy | prevista, sin valor publicado | no disponible |
| recall_at_3 | prevista, sin valor publicado | no disponible |
| mean_reciprocal_rank | prevista, sin valor publicado | no disponible |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni con otros modelos de recuperacion en la informacion disponible. El valor de accuracy 1 procede de solo 4 ejemplos sinteticos, por lo que no es representativo de un rendimiento en produccion.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; el modelo opera sobre estructuras de pesos lexicos en JSON, no sobre tensores en GPU.
- GPU recomendadas: no se requiere GPU. Funciona en CPU.
- Viabilidad en GPU de consumo: si, en cualquier equipo, incluidos portatiles sin GPU dedicada; el cuello de botella sera el indice IDF y el tamano del corpus, no el modelo.
- Opciones de despliegue: al usar la libreria `custom`, no se integra de forma nativa en vLLM, llama.cpp, Ollama o TGI. El despliegue esperado es mediante el codigo Python del repositorio del autor o una reimplementacion propia basada en el formato JSON documentado.
- Latencia y throughput: no disponible. Dependera del tamano del indice y del coste de puntuacion lexica.

## Comparativa con modelos similares

No disponible. No se han publicado en la informacion proporcionada modelos comparables con especificaciones verificables (parametros, contexto, licencia y benchmarks) que permitan una comparacion rigurosa. Como referencia conceptual, la familia de algoritmos BM25 y las variantes de recuperacion lexica ponderada ocupan el mismo nicho funcional, pero no se dispone de datos de este modelo frente a ellas.

## Limitaciones y advertencias

- Baseline lexico ligero: el propio autor indica que debe reemplazarse o compararse con embeddings de dominio a escala.
- Dataset sintetico y muy reducido: la evaluacion se realizo sobre 4 ejemplos reservados, lo que hace que la accuracy de 1 no sea extrapolable.
- No apto para decisiones consecuentes: la model card advierte explicitamente contra su uso en decisiones de impacto sin datos representativos, revision experta y evaluacion de nivel productivo.
- Idiomas soportados: no disponible; no se puede asumir cobertura multilingue.
- Longitud de contexto: no disponible; no hay garantia sobre el tratamiento de documentos largos.
- Riesgo de alucinacion: limitado en el sentido generativo, ya que no produce texto libre, pero existe riesgo de recuperar evidencia irrelevante si los pesos no se ajustan al dominio.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No impone restricciones adicionales conocidas.
- Ausencia de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados.
- Integracion: al declarar `library_name: custom`, no hay soporte estandar en frameworks de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/hybrid-semantic-search-20261016-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/hybrid-semantic-search-20261016-dataset
- Repositorio GitHub con `train.py`, particion del dataset, codigo de evaluacion y formato JSON: mencionado en la model card, enlace no disponible.
