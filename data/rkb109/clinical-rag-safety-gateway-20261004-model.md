# RKB109/clinical-rag-safety-gateway-20261004-model

## Resumen

Clinical RAG Safety Gateway Baseline Model es un modelo prototipo de pequeno tamano publicado por el usuario RKB109 en HuggingFace. No se trata de un modelo de lenguaje generativo al uso, sino de un componente de puerta de seguridad (safety gateway) pensado para asistentes clinicos que operan sobre recuperacion aumentada (RAG): su funcion declarada es garantizar que existan recuperacion de evidencia, atribucion de fuentes y abtencion explicita antes de que una respuesta llegue a los equipos asistenciales.

El modelo combina pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF. Segun la model card, se genera para demostraciones reproducibles de arquitectura y no invoca ningun LLM alojado, es decir, funciona como linea base autonoma y transparente. El repositorio incluye el codigo de entrenamiento, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo, lo que lo orienta a prototipado, integracion en CI y comparaciones locales.

Su relevancia es acotada y experimental: se distribuye con licencia MIT, acumula 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo enmarca como un ejercicio educativo con datos sinteticos. No debe emplearse para decisiones con consecuencias ni para proporcionar diagnostico, tratamiento o consejo medico de urgencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como familia estandar; el autor describe pesos de token por etiqueta combinados con recuperacion de evidencia ponderada por IDF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON propio del modelo (formato descrito en el repositorio de reproducibilidad); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal convencional (transformer, MoE, SSM o hibrida). Indica que el modelo combina pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF, un planteamiento propio de componentes de scoring y recuperacion mas que de generacion. La libreria declarada es `custom`, lo que refuerza que no se apoya en transformers, vLLM ni frameworks de inferencia habituales.

En cuanto a los datos, el entrenamiento se realizo sobre el dataset enlazado `RKB109/clinical-rag-safety-gateway-20261004-dataset`, descrito como sintetico y de tamano reducido. No se especifica el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La evaluacion reportada se limita a 4 ejemplos sinteticos reservados, una cifra demasiado pequena para extraer conclusiones de generalizacion. Las metricas que el autor declara como objetivo son `retrieval_accuracy`, `abstention_coverage` y `citation_coverage`, orientadas a medir recuperacion, capacidad de abstenerse y cobertura de citas.

## Capacidades

- Respuesta a preguntas (`question-answering`) como tarea principal declarada.
- Similitud entre frases (`sentence-similarity`).
- Clasificacion de texto (`text-classification`).
- Resumen (`summarization`).
- Recuperacion de evidencia ponderada por IDF, orientada a atribucion de fuentes.
- Abtencion explicita: el diseno busca que el sistema no responda cuando no hay evidencia suficiente.
- Cobertura de citas como metrica de comportamiento declarada.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta especificado.

## Casos de uso

- Prototipado de arquitectura: sirve como linea base reproducible para experimentar con flujos de RAG clinico antes de incorporar un LLM mayor, ya que no depende de servicios alojados.
- Integracion en CI y pruebas automatizadas: al incluir `train.py`, el split del dataset y el codigo de evaluacion, puede insertarse en pipelines que verifiquen recuperacion, abtencion y citas en cada cambio.
- Comparaciones locales de baseline: permite contrastar variantes de recuperacion o de umbral de abtencion contra un punto de referencia fijo y transparente.
- Experimentacion educativa: util para ilustrar en docencia como se separan recuperacion, atribucion y abtencion en un asistente clinico.
- Filtro previo de seguridad en un gateway RAG: podria actuar como comprobacion intermedia que decida si hay evidencia suficiente antes de que otra capa genere una respuesta.
- Auditoria de cobertura de citas: sus metricas declaradas permiten medir que proporcion de respuestas quedan respaldadas por fuentes recuperadas.
- En todos los casos, el uso queda restringido a entornos de desarrollo y evaluacion; la model card prohibe explicitamente emplearlo para diagnostico, tratamiento o consejo medico de urgencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los siguientes, obtenidos sobre un conjunto reservado de 4 ejemplos sinteticos:

| Metrica | Valor | Notas |
|---|---|---|
| Ejemplos reservados | 4 | Conjunto sintetico, muy reducido |
| Accuracy | 1,0 | Sobre 4 ejemplos; no extrapolable |
| retrieval_accuracy | no disponible | Metrica declarada como objetivo, sin valor publicado |
| abstention_coverage | no disponible | Metrica declarada como objetivo, sin valor publicado |
| citation_coverage | no disponible | Metrica declarada como objetivo, sin valor publicado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y los que existen no son comparables con evaluaciones convencionales por el tamano de la muestra.

## Requisitos de hardware

- VRAM estimada: no disponible; al no publicarse el numero de parametros ni el formato de pesos mas alla de un JSON propio, no es posible calcularla.
- GPU recomendadas: no disponibles; la model card no menciona requisitos de GPU.
- Inferencia en GPU de consumo: no confirmada por el autor. Dado que se describe como un modelo de "pequeno tamano" con pesos en JSON y sin dependencia de un LLM alojado, es plausible que se ejecute en CPU, pero esto no esta verificado en la documentacion.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la libreria declarada es `custom`, por lo que el despliegue depende del codigo del repositorio de reproducibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, y por la naturaleza del artefacto (componente de recuperacion y abtencion con pesos en formato JSON propio, sin arquitectura de red declarada) no es equiparable a modelos generativos de parametros y contexto conocidos.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos y de tamano reducido; no representa poblaciones clinicas reales.
- Evaluacion sobre 4 ejemplos, insuficiente para estimar generalizacion o robustez.
- Prohibido su uso para diagnostico, tratamiento o consejo medico de urgencia, segun la propia model card.
- No debe emplearse para decisiones con consecuencias sin datos representativos, revision experta y evaluacion de grado de produccion.
- Idiomas soportados sin especificar; se desconoce su comportamiento fuera del idioma de los datos sinteticos.
- Riesgo de alucinacion y de falsa atribucion no cuantificado; las metricas de abtencion y citas no tienen valores publicados.
- Sesgos conocidos: no disponibles, aunque al proceder de datos sinteticos es probable que no reflejen la variabilidad real, sin que exista un analisis publicado al respecto.
- Licencia MIT: permite uso comercial y modificacion, pero la licencia no exime de las restricciones de uso responsable indicadas por el autor.
- Sin mantenimiento ni adopcion visible: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion en la misma fecha (2026-10-04).
- El repositorio GitHub mencionado en la model card no incluye URL en la informacion proporcionada, por lo que no puede verificarse su contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/clinical-rag-safety-gateway-20261004-model
- Dataset enlazado: https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20261004-dataset
- Repositorio GitHub de reproducibilidad: mencionado en la model card, URL no disponible en la informacion proporcionada.
- Paper, blog o demo: no disponibles.
