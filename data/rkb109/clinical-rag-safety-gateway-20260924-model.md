# RKB109/clinical-rag-safety-gateway-20260924-model

## Resumen

Clinical RAG Safety Gateway Baseline Model es un prototipo pequeno y transparente publicado por el usuario RKB109 en HuggingFace, orientado a demostrar la arquitectura de una pasarela de seguridad para asistentes clinicos basados en generacion aumentada por recuperacion (RAG). El problema que aborda es concreto: un asistente clinico necesita recuperar evidencia, atribuir la fuente de cada afirmacion y abstenerse explicitamente de responder cuando no hay respaldo documental, antes de que la respuesta llegue al equipo asistencial. El modelo combina pesos de tokens por etiqueta con recuperacion de evidencia ponderada por IDF, y segun su model card no invoca ningun LLM alojado externamente.

No es un transformer: la libreria declarada es `custom` y el artefacto se distribuye en un formato JSON propio definido por el autor, no en safetensors ni GGUF. No se publican datos de tamano (parametros totales, activos ni longitud de contexto), de idiomas soportados ni de esquemas de cuantizacion. La unica cifra de evaluacion disponible es una exactitud de 1 sobre 4 ejemplos sinteticos reservados, un tamano de muestra que no permite ninguna conclusion estadistica.

Su relevancia es acotada y de tipo metodologico: sirve como baseline reproducible (el repositorio enlazado incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo) para comparar arquitecturas de recuperacion y abtencion en un dominio, el sanitario, donde la trazabilidad de la evidencia es un requisito y no una mejora opcional. Con 0 descargas y 0 likes en el momento de redactar esta ficha, debe tratarse como material educativo, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo propio (custom) de pesos de tokens por etiqueta combinados con recuperacion de evidencia ponderada por IDF; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se serializan en JSON; la model card no documenta cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON propio del autor (formato descrito en el repositorio de GitHub enlazado); no safetensors ni GGUF |
| Autor | RKB109 |
| Pipeline declarado | question-answering |
| Tareas declaradas | question-answering, sentence-similarity, text-classification, summarization |
| Dataset de entrenamiento | RKB109/clinical-rag-safety-gateway-20260924-dataset (sintetico) |
| Metricas declaradas | accuracy; metricas previstas: retrieval_accuracy, abstention_coverage, citation_coverage |
| Fecha de creacion (metadatos) | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un unico mecanismo: pesos de tokens por etiqueta combinados con recuperacion de evidencia ponderada por IDF. Es decir, la parte discriminativa funciona a nivel de token y etiqueta, y la parte de recuperacion puntua fragmentos de evidencia mediante frecuencia inversa de documento. El autor enmarca el resultado como prototipo transparente, generado para demostraciones reproducibles de arquitectura, y afirma explicitamente que no se llama a ningun LLM alojado. No se publican ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO; dado que no hay un transformer subyacente, esas fases no serian aplicables en su forma habitual.

La innovacion declarada no esta en el aprendizaje profundo sino en el diseno del contrato de salida: el modelo se presenta como pasarela de seguridad, de modo que la recuperacion y la atribucion de fuentes son parte del propio artefacto y no un componente externo, con abtencion explicita como comportamiento previsto. La reproducibilidad se apoya en el repositorio de GitHub enlazado, que contiene `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo. La model card no aporta detalles sobre funcion de perdida, esquema de optimizacion, preprocesado ni estrategia de tokenizacion.

## Capacidades

- Respuesta a preguntas sobre un corpus de evidencia recuperada, con puntuacion de fragmentos ponderada por IDF.
- Clasificacion de texto por etiquetas mediante pesos de tokens por etiqueta.
- Similitud entre frases (tarea `sentence-similarity` declarada en el repositorio).
- Resumen (tarea `summarization` declarada en el repositorio).
- Recuperacion de evidencia con atribucion de fuente, orientada a que cada respuesta pueda rastrearse hasta el documento de origen.
- Abtencion explicita: el comportamiento previsto incluye no responder cuando la cobertura de evidencia es insuficiente, con las metricas `abstention_coverage` y `citation_coverage` como objetivos de evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la model card no declara idiomas; la unica region indicada en los tags es `us`).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de arquitecturas de RAG clinico: el modelo permite montar el esqueleto de un pipeline de recuperacion, atribucion y abtencion sin depender de un LLM alojado, de modo que el equipo puede iterar sobre el contrato de evidencia antes de decidir que generador incorporar.
- Pruebas de integracion y humo en CI: al ser un artefacto pequeno en JSON y sin dependencia de una API externa, encaja como caso de prueba determinista en una pipeline de integracion continua que verifique que el sistema sigue devolviendo citas y sigue absteniendose cuando corresponde.
- Evaluacion de cobertura de abtencion y de citas: las metricas previstas (`retrieval_accuracy`, `abstention_coverage`, `citation_coverage`) pueden instrumentarse contra este baseline para fijar el suelo de calidad que cualquier modelo posterior debe superar.
- Comparacion de baselines locales: sirve como referencia lexica frente a recuperadores mas densos (BM25, TF-IDF o bi-encoders) en el mismo corpus sintetico, controlando el resto de variables del pipeline.
- Experimentacion educativa: por su tamano y su licencia MIT, es material adecuado para que investigadores o estudiantes inspeccionen como se representan los pesos en JSON y como se combina la puntuacion de tokens con la ponderacion IDF.
- Filtro previo de seguridad en una pasarela clinica: podria actuar como primera etapa barata que decide si una consulta tiene evidencia suficiente antes de invocar un modelo generativo de mayor coste, siempre que se sustituya el corpus sintetico por uno representativo y se valide clínicamente.
- Demostraciones de arquitectura con datos sinteticos: util para presentar a un comite tecnico el flujo completo recuperacion-abtencion-cita sin exponer datos de pacientes ni incurrir en costes de inferencia.

## Benchmarks y rendimiento

Unicos datos publicados en la model card:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sinteticos reservados |
| Ejemplos reservados | 4 | sinteticos |
| Retrieval accuracy | no disponible (metrica prevista, sin resultado) | - |
| Abstention coverage | no disponible (metrica prevista, sin resultado) | - |
| Citation coverage | no disponible (metrica prevista, sin resultado) | - |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni equivalentes). El valor de accuracy 1 corresponde a 4 ejemplos, por lo que su intervalo de confianza es practicamente el rango completo y no debe citarse como evidencia de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra; dado que el artefacto es un conjunto de pesos de tokens en JSON y una recuperacion ponderada por IDF, la inferencia es viable en CPU y no requiere GPU.
- GPU recomendadas: ninguna en particular; no se documenta soporte de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual (no es un modelo de pesos neuronales densos); cualquier equipo capaz de ejecutar Python puede alojarlo.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos es JSON propio y la libreria declarada es `custom`. El despliegue previsto es la ejecucion directa del codigo incluido en el repositorio del autor.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tiempo.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion proporcionada: se trata de un artefacto de arquitectura propia, no de un modelo de lenguaje con familia equivalente. La tabla siguiente situa la propuesta frente a alternativas genericas del mismo problema (recuperacion y respuesta con evidencia), marcando como no disponible todo dato que no consta.

| Aspecto | Clinical RAG Safety Gateway (este modelo) | Recuperador lexico tipo BM25/TF-IDF | Bi-encoder denso tipo all-MiniLM-L6-v2 | LLM pequeno con RAG |
|---|---|---|---|---|
| Tipo | Pesos de tokens por etiqueta + IDF | Recuperacion lexica pura | Transformer encoder denso | Transformer decoder generativo |
| Parametros | no disponible | no aplica | 22,7 M (dato publico general) | del orden de 1-8 mil millones segun variante |
| Longitud de contexto | no disponible | limitada por el documento | 256 tokens (dato publico general) | 4 K-128 K segun variante |
| Abtencion explicita | si, prevista en el diseno | no por defecto | no por defecto | depende del prompt o del ajuste |
| Atribucion de citas | si, prevista como metrica | si, por documento devuelto | si, por documento devuelto | solo si se le exige en el prompt |
| Licencia | MIT | depende de la implementacion | Apache-2.0 | variable |
| Disponibilidad | repositorio HuggingFace + GitHub del autor | multiples implementaciones | ampliamente disponible | ampliamente disponible |
| Datos de rendimiento | accuracy 1 sobre 4 ejemplos sinteticos | no comparable entre implementaciones | benchmarks publicos propios | benchmarks publicos propios |

Los datos de las columnas de alternativas son referencias generales del sector, no cifras aportadas por la informacion de este modelo.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos. Los resultados no son extrapolables a datos clinicos reales.
- Tamano de evaluacion insuficiente: 4 ejemplos reservados. Una accuracy de 1 en esa muestra no aporta evidencia estadistica.
- La propia model card prohibe el uso del baseline para proporcionar diagnostico, tratamiento o consejo medico de urgencia.
- Advertencia explicita del autor: no usar el modelo para decisiones consecuentes sin datos representativos, revision por expertos y evaluacion de grado de produccion.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo, y un esquema de pesos por token sobre datos sinteticos puede heredar las regularidades del generador sintetico.
- Riesgo de alucinacion: no evaluado. La abtencion es un comportamiento previsto, no una capacidad verificada mas alla de los 4 ejemplos.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), sin historial de uso en produccion ni issues publicas.
- Licencia MIT: permisiva y apta para uso comercial, pero la licencia no cubre el cumplimiento normativo sanitario (por ejemplo, proteccion de datos de salud), que queda enteramente del lado del integrador.
- Formato de pesos propietario en JSON y libreria `custom`: no hay ecosistema de herramientas (vLLM, llama.cpp, TGI) que lo soporte, lo que limita portabilidad y escalado.
- No hay informacion sobre longitud de contexto, coste de recuperacion a escala ni comportamiento con corpus grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/clinical-rag-safety-gateway-20260924-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20260924-dataset
- Repositorio de GitHub con `train.py`, split del dataset, codigo de evaluacion y formato JSON del modelo: no disponible como URL concreta en la informacion proporcionada (la model card lo menciona sin enlace)
- Paper, blog o demo: no disponible
