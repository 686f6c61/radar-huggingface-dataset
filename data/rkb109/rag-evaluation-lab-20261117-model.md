# RKB109/rag-evaluation-lab-20261117-model

## Resumen

RKB109/rag-evaluation-lab-20261117-model es un modelo prototipo de pequeno tamano publicado por el usuario RKB109 bajo licencia MIT. No se trata de un modelo de lenguaje generativo ni de un transformer de gran escala: la model card lo describe como una combinacion de pesos de tokens por etiqueta con recuperacion de evidencia ponderada por IDF, implementada como libreria `custom`. Su proposito declarado no es responder consultas reales, sino servir como linea base transparente y reproducible para evaluar sistemas RAG (retrieval-augmented generation) y disponer de un arnes de evaluacion estable en integracion continua.

El modelo aborda un problema concreto del ciclo de vida de los sistemas RAG: la ausencia de conjuntos de regresion estables y de una taxonomia de fallos. Para ello se apoya en un dataset sintetico propio (RKB109/rag-evaluation-lab-20261117-dataset) y expone metricas orientadas a clasificacion de fallos, cobertura de citas y tasa de aprobacion de puertas de release.

Es relevante por su transparencia: el autor publica `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo. Sin embargo, sus propios resultados son muy limitados (4 ejemplos sinteticos de validacion, accuracy 0,75) y la model card advierte explicitamente de que valida el arnes de evaluacion, no un sistema RAG en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pesos de tokens por etiqueta combinados con recuperacion de evidencia ponderada por IDF (libreria `custom`, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (formato propio del modelo, segun la seccion de reproducibilidad) |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura transformer convencional. Segun la model card, combina dos componentes: un conjunto de pesos de tokens asociados a cada etiqueta y un mecanismo de recuperacion de evidencia ponderada por IDF. Esta estructura es la de un clasificador lexico interpretable con recuperacion de contexto, no la de una red neuronal profunda, y no realiza llamadas a un LLM alojado.

El entrenamiento se realizo sobre el dataset sintetico RKB109/rag-evaluation-lab-20261117-dataset, generado por el propio autor. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus ni la existencia de fases de RLHF, DPO o ajuste supervisado. La innovacion tecnica destacable es la reproducibilidad: el repositorio de GitHub enlazado incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y la especificacion del formato JSON del modelo, lo que permite replicar el entrenamiento y la evaluacion de extremo a extremo.

## Capacidades

- Clasificacion de texto (`text-classification`), tarea principal declarada en el pipeline tag.
- Respuesta a preguntas (`question-answering`) mediante recuperacion de evidencia ponderada por IDF.
- Ranking de texto (`text-ranking`), util para ordenar pasajes recuperados.
- Sumarizacion (`summarization`), segun la cobertura de tareas de Hugging Face declarada por el autor.
- Clasificacion de fallos de sistemas RAG dentro de una taxonomia (metrica `failure_class_accuracy`).
- Calculo de cobertura de citas (`citation_coverage`) y de tasa de aprobacion de puertas de release (`release_gate_pass_rate`).
- Generacion de texto libre: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles (los idiomas no estan declarados).

## Casos de uso

- Arnes de regresion en CI para pipelines RAG: el modelo actua como linea base fija contra la que comparar cambios en el recuperador o en el generador, gracias a que su entrenamiento y evaluacion son reproducibles con `train.py` y el split publicado.
- Pruebas de taxonomia de fallos: permite clasificar fallos de un sistema RAG en categorias predefinidas con la metrica `failure_class_accuracy`, lo que facilita priorizar correcciones antes de un release.
- Validacion de puertas de release: la metrica `release_gate_pass_rate` permite automatizar la decision de promover o bloquear una version de un pipeline RAG en funcion de umbrales configurados.
- Medicion de cobertura de citas: `citation_coverage` cuantifica si las respuestas generadas por un sistema RAG estan respaldadas por evidencia recuperada, un requisito habitual en aplicaciones documentales.
- Docencia y experimentacion local: al ser un modelo pequeno, transparente y sin dependencia de APIs externas, es adecuado para talleres sobre evaluacion de RAG y para comparaciones de linea base en maquinas locales.
- Prototipado de arquitectura de evaluacion: sirve para disenar y depurar el propio arnes de evaluacion (formato de datos, metricas, integracion con CI) antes de conectar modelos mayores o servicios alojados.
- Ranking de pasajes recuperados: el soporte de `text-ranking` permite experimentar con reordenacion de evidencia en un pipeline de recuperacion sin coste de inferencia de un LLM.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Ejemplos sinteticos de validacion (held-out) | 4 |
| Accuracy | 0,75 |
| `failure_class_accuracy` | metrica prevista, valor no disponible |
| `citation_coverage` | metrica prevista, valor no disponible |
| `release_gate_pass_rate` | metrica prevista, valor no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo es una accuracy de 0,75 sobre 4 ejemplos sinteticos, una muestra demasiado pequena para extraer conclusiones estadisticas.

## Requisitos de hardware

- VRAM estimada: no disponible; por la naturaleza del modelo (pesos por token en formato JSON, sin transformer) es previsible que sea muy reducida, pero no se documenta.
- GPU recomendadas: no disponible; el modelo no requiere GPU segun la informacion publicada.
- Compatibilidad con GPU de consumo: no disponible; probablemente ejecutable en CPU, sin dato confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la libreria declarada es `custom`, por lo que el despliegue depende del codigo del repositorio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKB109/rag-evaluation-lab-20261117-model | no disponible | no disponible | Clasificador lexico + recuperacion IDF | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- El dataset es sintetico y muy pequeno (4 ejemplos held-out); la accuracy de 0,75 no es representativa de ningun dominio real.
- La model card advierte explicitamente de que los casos sinteticos validan el arnes de evaluacion, no un sistema RAG en produccion.
- No debe usarse para decisiones consecuentes sin datos representativos del dominio, revision experta y evaluacion de nivel productivo.
- Al ser un clasificador lexico con recuperacion IDF, es previsible una sensibilidad alta a la formulacion exacta de las consultas y al vocabulario del corpus, aunque este comportamiento no se cuantifica en la informacion disponible.
- Sesgos conocidos: no documentados; el dataset sintetico puede incorporar los sesgos de su generador.
- Riesgo de alucinacion: no aplica en sentido estricto al no ser un modelo generativo, pero la recuperacion de evidencia puede devolver pasajes irrelevantes si el IDF no discrimina bien.
- Idiomas soportados: no declarados; no hay garantia de funcionamiento fuera del idioma del dataset sintetico.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia sobre el rendimiento ni sobre la idoneidad para produccion.
- El modelo se actualizo por ultima vez el 2026-11-17 y no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/rag-evaluation-lab-20261117-model
- Dataset: https://huggingface.co/datasets/RKB109/rag-evaluation-lab-20261117-dataset
- Repositorio GitHub con `train.py`, split del dataset, codigo de evaluacion y formato JSON: enlace no incluido en la informacion disponible (la model card lo menciona sin URL)
- Paper, blog o demo: no disponibles
