# RKB109/rag-evaluation-lab-20260928-model

## Resumen

RKB109/rag-evaluation-lab-20260928-model es un modelo prototipo de pequeno tamano publicado por el usuario RKB109 el 28 de septiembre de 2026, orientado a la evaluacion de sistemas RAG (Retrieval-Augmented Generation). El problema que aborda, segun su propia model card, es que los sistemas RAG a menudo se despliegan sin un conjunto de regresion estable ni una taxonomia de fallos, lo que dificulta detectar degradaciones entre versiones. El modelo se presenta como una linea base transparente y reproducible para cubrir ese hueco en entornos de integracion continua y experimentacion local.

Tecnicamente, la model card describe un enfoque que combina pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF (frecuencia inversa de documento). No se trata de un transformer de gran escala: la libreria declarada es `custom`, el pipeline es `text-classification` y el autor indica explicitamente que el modelo no invoca ningun LLM alojado externamente. Esto lo situa en la categoria de utilidades de evaluacion mas que de modelos generativos de proposito general.

Su relevancia actual es metodologica: sirve como ejemplo de arnes de evaluacion reproducible para pipelines RAG, cubriendo tareas de clasificacion de texto, question answering, ranking de texto y summarization. El modelo no publica numero de parametros, longitud de contexto ni composicion detallada del entrenamiento, y su evaluacion se limita a 4 ejemplos sinteticos retenidos con una accuracy de 0,75.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se describe como pesos de token por etiqueta combinados con recuperacion de evidencia ponderada por IDF |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible. La model card menciona un "model JSON format" en el repositorio de GitHub asociado |
| Libreria | custom |
| Pipeline declarado | text-classification |
| Tareas cubiertas | text-classification, question-answering, text-ranking, summarization |
| Dataset de entrenamiento | RKB109/rag-evaluation-lab-20260928-dataset (sintetico) |
| Metrica declarada | accuracy |
| Fecha de publicacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal convencional (transformer, MoE o SSM), sino un mecanismo especifico para evaluacion: pesos de token por etiqueta combinados con recuperacion de evidencia ponderada por IDF. Esto sugiere un componente de clasificacion basado en pesos lexicales y un componente de recuperacion que puntua fragmentos de evidencia segun su especificidad respecto al corpus. No se especifica el numero de parametros, la dimension de las representaciones ni el mecanismo exacto de agregacion de evidencia.

Respecto a los datos, el entrenamiento se apoya en un dataset sintetico enlazado en el propio repositorio (RKB109/rag-evaluation-lab-20260928-dataset), descrito como pequeno. No se indica el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El autor enfatiza la reproducibilidad: afirma que el repositorio de GitHub incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo, lo que permitiria replicar el entrenamiento completo sin depender de servicios externos.

## Capacidades

- Clasificacion de texto: tarea principal declarada en el pipeline de HuggingFace, orientada a etiquetar casos de evaluacion RAG.
- Question answering: cobertura declarada como tarea soportada por el modelo, con recuperacion de evidencia ponderada por IDF.
- Ranking de texto: puntuacion y ordenacion de fragmentos o respuestas candidatas.
- Summarization: cobertura declarada como tarea soportada.
- Clasificacion de fallos: la model card menciona `failure_class_accuracy` como metrica prevista, lo que apunta a una taxonomia de fallos en pipelines RAG.
- Cobertura de citas: menciona `citation_coverage` como metrica prevista, vinculada a la verificacion de que las respuestas citan evidencia recuperada.
- Evaluacion de puertas de release: menciona `release_gate_pass_rate` como metrica prevista para bloquear despliegues que no superan umbrales de calidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Otras capacidades (vision, audio, modo thinking): no disponible.

## Casos de uso

- Regresion automatizada en CI para pipelines RAG: el modelo puede actuar como punto de comparacion fijo (`transparent-baseline`) en cada pull request, de modo que cualquier cambio en el recuperador o en el prompt se mida contra una referencia estable y no contra impresiones subjetivas.
- Taxonomia de fallos en produccion RAG: clasificar respuestas incorrectas en categorias (recuperacion fallida, cita inventada, respuesta incompleta) usando `failure_class_accuracy` como metrica, lo que permite priorizar correcciones por tipo de error.
- Verificacion de cobertura de citas: comprobar automaticamente si una respuesta generada cita evidencia realmente presente en el contexto recuperado, mediante `citation_coverage`, antes de publicar contenido en dominios sensibles.
- Puertas de release en despliegues de asistentes documentales: integrar el modelo como condicion de bloqueo (`release_gate_pass_rate`) para impedir que una nueva version del sistema RAG llegue a produccion si empeora respecto al umbral definido.
- Re-ranking de fragmentos recuperados: usar el componente de evidencia ponderada por IDF como linea base de ranking frente a re-rankers neuronales, de modo que se pueda justificar con numeros la incorporacion de un modelo mas costoso.
- Experimentacion educativa y prototipado de arquitectura: al no depender de un LLM alojado ni de GPU, permite a equipos y estudiantes entender el ciclo completo de evaluacion RAG (dataset, split, metricas, gate) en local y a coste cero.
- Comparacion de lineas base locales: servir de referencia para medir si un modelo mayor aporta mejoras reales sobre un enfoque lexical transparente, evitando adoptar modelos grandes sin evidencia de ganancia.

## Benchmarks y rendimiento

| Evaluacion | Valor |
|---|---|
| Ejemplos sinteticos retenidos | 4 |
| Accuracy | 0,75 |
| failure_class_accuracy | No reportado (metrica prevista) |
| citation_coverage | No reportado (metrica prevista) |
| release_gate_pass_rate | No reportado (metrica prevista) |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que "los casos sinteticos validan el arnes, no un sistema RAG de produccion", por lo que el 0,75 de accuracy sobre 4 ejemplos no debe interpretarse como una estimacion de rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica numero de parametros ni tamano de los pesos.
- GPU recomendadas: no disponible. No se documenta ningun requisito de aceleracion por hardware.
- Compatibilidad con GPU de consumo: no disponible. Dado que la libreria es `custom` y el formato descrito es JSON, no hay evidencia de compatibilidad con los runners habituales de GPU.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos en safetensors o GGUF hace improbable el uso directo de esas herramientas.
- Latencia y throughput: no disponible.
- Nota practica: al no invocar ningun LLM alojado y tratarse de una utilidad de evaluacion con pesos por etiqueta y recuperacion IDF, todo apunta a una ejecucion viable en CPU sin acelerador, aunque esta afirmacion no viene confirmada por el autor en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (arneses de evaluacion RAG o lineas base transparentes), ni datos de rendimiento de terceros que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Datos sinteticos y minimos: el entrenamiento y la evaluacion se basan en un dataset sintetico enlazado, con solo 4 ejemplos retenidos. El 0,75 de accuracy sobre esa muestra no tiene significacion estadistica.
- No valida sistemas RAG reales: la propia model card advierte que los casos sinteticos validan el arnes de evaluacion, no el comportamiento en produccion. Cualquier equipo debe anadir ejemplos representativos de su dominio.
- Prohibicion de uso en decisiones consecuentes: el autor indica explicitamente que no debe usarse para decisiones de impacto sin datos representativos, revision experta y evaluacion de grado productivo.
- Ausencia de informacion tecnica critica: no se publican parametros, contexto, idiomas, cuantizaciones ni formato de pesos, lo que impide estimar coste, latencia o capacidad real.
- Idiomas soportados sin especificar: no hay declaracion de cobertura linguistica, por lo que no se puede asumir un rendimiento correcto en castellano ni en ningun otro idioma.
- Riesgo de alucinacion: no evaluado ni documentado en la model card.
- Sesgos: no documentados. Un dataset sintetico puede incorporar los sesgos de las reglas que lo generaron, sin que exista analisis al respecto.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso o verificacion independiente.
- Licencia MIT: permite uso comercial y modificacion sin restricciones relevantes, pero se ofrece sin garantia alguna; la responsabilidad del uso recae en el integrador.
- Madurez: se presenta como prototipo de demostracion de arquitectura, no como componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/rag-evaluation-lab-20260928-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/rag-evaluation-lab-20260928-dataset
- Repositorio de GitHub con `train.py`, split del dataset, codigo de evaluacion y formato JSON del modelo: mencionado en la model card, URL no disponible en la informacion proporcionada.
