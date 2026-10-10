# morex3/vietnamese-ai-feedback-ood-3125

## Resumen

El modelo `morex3/vietnamese-ai-feedback-ood-3125` es un clasificador de sentimiento en vietnamita construido sobre PhoBERT-Base y publicado por el usuario morex3. Se trata del checkpoint oficial asociado al manuscrito "Beyond In-Domain Sentiment: Evaluating Cross-Architecture Robustness and the Neutral-Collapse Phenomenon on Modern Vietnamese AI-Assisted Educational Feedback", aceptado en SN Computer Science (Springer Nature). El modelo no genera texto: asigna una de tres etiquetas (Negativo, Neutral, Positivo) a fragmentos de opinión escritos por estudiantes vietnamitas sobre herramientas de IA generativa como ChatGPT, GitHub Copilot o Gemini.

El problema que aborda es el denominado "colapso de la clase neutral": los transformers estándar ajustados sobre el corpus in-domain UIT-VSFC degradan la clase Neutral hasta un F1 de entre 0,00 % y 21,80 % cuando se evalúan out-of-domain sobre discurso educativo moderno asistido por IA. La propuesta combina PhoBERT-Base con una pérdida Class-Balanced Focal (CB-Focal, con beta = 0,999 y gamma = 2,0) para amplificar la señal de gradiente de la clase minoritaria, que representa solo el 4,01 % de las muestras de entrenamiento.

Con 135.000.579 parámetros, un repositorio de 0,5 GB y licencia MIT, el modelo alcanza según su autor un Macro-F1 de 65,93 % y un F1 en la clase Neutral de 37,25 % en el benchmark out-of-domain Data-2 (3.125 muestras), con una latencia declarada de 1,68 ms por muestra en una Tesla T4. Su relevancia práctica es doble: es un clasificador de sentimiento vietnamita listo para producción a bajo coste computacional y documenta una técnica de rebalanceo de pérdida reutilizable en otros dominios con clases muy desbalanceadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en PhoBERT-Base (familia RoBERTa) para clasificacion de secuencias |
| Parametros totales | 135.000.579 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la informacion; el ejemplo de inferencia de la model card trunca a 128 tokens |
| Tipos de cuantizacion | no disponible (no se documenta ninguna; los pesos se publican en safetensors) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, framework PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo PhoBERT-Base, es decir, la variante monolingue vietnamita de RoBERTa, adaptada aqui con una cabeza de clasificacion de secuencias de tres clases. El ajuste fino se realizo sobre el corpus in-domain de sentimiento estudiantil UIT-VSFC, con 11.426 muestras de entrenamiento, entre las que la clase Neutral apenas supone el 4,01 %. No se menciona en la informacion disponible ningun uso de RLHF, DPO ni tecnicas de alineamiento, algo coherente con un modelo discriminativo de clasificacion.

La innovacion tecnica reside en la funcion de perdida CB-Focal, resultado de combinar dos componentes. Por un lado, el Effective Number Weighting, con la formula E_nc = (1 - beta^n_c) / (1 - beta), que asigna pesos mayores a las clases con pocos ejemplos para ampliar los margenes de decision en el espacio latente. Por otro lado, el factor modulador focal (1 - p_t)^gamma, con gamma = 2,0, que atenua dinamicamente el gradiente de las muestras faciles ya bien clasificadas y concentra el aprendizaje en los casos dificiles. El autor declara mejoras estadisticamente significativas en Macro-F1 (p < 0,01, prueba t pareada) frente a ViSoBERT, mDeBERTa-v3 y GPT2-Vietnamese.

Un detalle de implementacion relevante para produccion: PhoBERT espera texto segmentado en palabras, por lo que la model card recomienda aplicar `underthesea.word_tokenize(text, format="text")` antes de la tokenizacion.

## Capacidades

- Clasificacion de sentimiento en vietnamita con tres etiquetas: Negative, Neutral y Positive.
- Analisis de opiniones de estudiantes sobre herramientas de IA generativa (ChatGPT, GitHub Copilot, Gemini) en contexto educativo.
- Robustez out-of-domain: mantiene capacidad discriminativa sobre discurso que no proviene del corpus de entrenamiento UIT-VSFC.
- Recuperacion parcial de la clase minoritaria Neutral, con F1 de 37,25 % frente al 14,10 % de PhoBERT-Base con entropia cruzada estandar.
- Inferencia rapida para clasificacion a gran escala: 1,68 ms por muestra en Tesla T4 segun el autor.
- Integracion directa con el pipeline `sentiment-analysis` de transformers y con `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto libre: es exclusivamente un cabezal de clasificacion.
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado unicamente en vietnamita.

## Casos de uso

- Monitorizacion de opiniones en plataformas educativas: clasificar en tiempo real los comentarios que los estudiantes dejan sobre asistentes de IA en un LMS, separando criticas negativas, elogios y comentarios neutros para dirigir la respuesta pedagogica.
- Analisis de feedback a gran escala para equipos de producto: procesar decenas de miles de encuestas abiertas sobre herramientas como Copilot o ChatGPT y agregar la evolucion del sentimiento por version, curso o cohorte.
- Enrutado de tickets de soporte: usar la etiqueta Neutral como indicador de mensajes ambiguos o informativos que requieren revision humana antes de escalar, aprovechando el esfuerzo explicito del modelo por no colapsar esa clase.
- Investigacion academica en PLN vietnamita: servir de linea base reproducible y de checkpoint de referencia para estudiar tecnicas de rebalanceo de clases en escenarios out-of-domain.
- Filtrado de contenido en comunidades tecnologicas: detectar opinion negativa sostenida hacia una herramienta de IA para priorizar su revision por parte de los mantenedores.
- Etiquetado asistido para construir nuevos datasets: preanotar grandes volumenes de texto vietnamita como paso previo a la revision manual, dado el bajo coste de inferencia (1,68 ms por muestra).
- Auditoria de sesgo en discurso educativo: analizar como se distribuye el sentimiento entre distintos grupos de estudiantes para detectar patrones sistematicos de insatisfaccion.
- Componente de un pipeline de analitica de aprendizaje: alimentar dashboards institucionales con metricas de sentimiento agregadas por asignatura o herramienta de IA utilizada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados, campo `verified: false`), sobre el benchmark out-of-domain "Vietnamese AI-Feedback OOD Benchmark (Data-2)":

| Metrica | Valor |
|---|---|
| Macro-F1 | 65,93 % |
| F1-Neutral | 37,25 % |
| Accuracy | 69,68 % |

Comparativa multi-semilla declarada por el autor (5 semillas, evaluacion zero-shot sobre Data-2, 3.125 muestras balanceadas: 1.000 negativas, 1.125 neutras, 1.000 positivas). Los valores se expresan como media mas menos desviacion estandar:

| Modelo | Funcion de perdida | Macro-F1 (%) | Accuracy (%) | F1-Neutral (%) | Latencia (ms) |
|---|---|---|---|---|---|
| ViSoBERT | CE estandar | 56,32 ± 0,98 | 63,66 ± 0,77 | 9,82 ± 3,12 | 1,72 |
| mDeBERTa-v3 | CE estandar | 57,06 ± 1,25 | 64,12 ± 1,05 | 10,45 ± 2,80 | 3,45 |
| GPT2-Vietnamese | CE estandar | 48,21 ± 1,84 | 55,30 ± 1,42 | 0,00 ± 0,00 | 4,10 |
| BamiBERT | CE estandar | 60,70 ± 4,91 | 66,45 ± 3,20 | 21,80 ± 8,45 | 1,85 |
| PhoBERT-Base | CE estandar | 59,22 ± 1,15 | 65,80 ± 0,95 | 14,10 ± 2,65 | 1,68 |
| PhoBERT-Base (propuesto) | CB-Focal (beta = 0,999; gamma = 2,0) | 65,93 ± 2,66 | 69,68 ± 1,56 | 37,25 ± 6,38 | 1,68 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,55 GB en fp32 y en torno a 0,3 GB en fp16, para un modelo de 135 millones de parametros. El repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente; la latencia declarada de 1,68 ms por muestra se midio en una NVIDIA Tesla T4.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 e incluso en iGPU con memoria compartida suficiente; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("sentiment-analysis")` o `AutoModelForSequenceClassification`, servicios de inferencia tipo TGI o vLLM para clasificacion por lotes, exportacion a ONNX Runtime o TorchScript. No se documenta ningun checkpoint en GGUF ni compatibilidad con llama.cpp u Ollama.
- Throughput: no disponible como valor agregado; el unico dato publicado es la latencia de 1,68 ms por muestra en Tesla T4, lo que en teoria permitiria del orden de 595 muestras por segundo por GPU con lotes bien dimensionados, aunque el autor no declara esa cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (Data-2) | F1-Neutral (Data-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| morex3/vietnamese-ai-feedback-ood-3125 | 135 M | no disponible (truncado a 128 en el ejemplo) | 65,93 % | 37,25 % | MIT | HuggingFace |
| PhoBERT-Base (CE estandar) | 135 M | no disponible | 59,22 % | 14,10 % | MIT (segun el modelo base de VinAI) | HuggingFace |
| BamiBERT | no disponible en la informacion | no disponible | 60,70 % | 21,80 % | no disponible | HuggingFace |
| ViSoBERT | no disponible en la informacion | no disponible | 56,32 % | 9,82 % | no disponible | HuggingFace |
| mDeBERTa-v3 | no disponible en la informacion | no disponible | 57,06 % | 10,45 % | MIT | HuggingFace |

La comparativa se limita a los modelos evaluados por el propio autor en el mismo benchmark; no se dispone de datos independientes que permitan contrastar estas cifras con otras fuentes.

## Limitaciones y advertencias

- El colapso de la clase Neutral solo se mitiga parcialmente: un F1 de 37,25 % implica que la mayoria de los casos neutros siguen clasificandose incorrectamente. No debe usarse en produccion alli donde la deteccion fiable de neutralidad sea critica sin un umbral de confianza o revision humana.
- El modelo esta especializado en un nicho muy concreto: opiniones de estudiantes vietnamitas sobre herramientas de IA generativa. Su comportamiento fuera de ese dominio no esta documentado y no hay garantia de transferencia a otros ambitos.
- Entrenamiento sobre un unico corpus in-domain (UIT-VSFC, 11.426 muestras), con fuerte desbalance de clases (Neutral = 4,01 %). Los sesgos presentes en ese corpus, tanto de anotacion como de tematica, se heredan.
- Cobertura idiomatica limitada al vietnamita. No hay evidencia de funcionamiento en otros idiomas ni en variantes dialectales no representadas en el corpus.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); las cifras de la comparativa multi-semilla no han sido replicadas de forma independiente.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza: el modelo siempre devuelve una de las tres etiquetas con una probabilidad asociada, incluso ante entradas fuera de distribucion o sin sentido.
- La licencia MIT permite uso comercial y modificacion sin restricciones reseñables, pero conviene verificar la licencia del modelo base PhoBERT y de los datos UIT-VSFC si se redistribuye el modelo o sus derivados.
- Es necesario aplicar segmentacion de palabras en vietnamita (por ejemplo con `underthesea`) para reproducir el comportamiento esperado con PhoBERT; omitirla puede degradar las predicciones.
- Adopcion practicamente nula por parte de la comunidad en el momento de la ficha: 11 descargas y 0 likes, sin issues ni validacion externa documentada.
- La fecha de creacion del repositorio que consta en la informacion (2026-10-10) es posterior a la fecha de esta ficha; conviene verificar la vigencia del enlace antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morex3/vietnamese-ai-feedback-ood-3125
- Dataset asociado en HuggingFace: https://huggingface.co/datasets/morex3/vietnamese-ai-feedback-ood-3125
- Repositorio GitHub: https://github.com/KaNguyen3005/vietnamese-ai-feedback-ood-3125
- Articulo citado: Nguyen, Minh Tuan; Mo, Ha Mach Bu Ba Ka; Thai, Ngoc Thi; Le, Dinh Bao. "Beyond In-Domain Sentiment: Evaluating Cross-Architecture Robustness and the Neutral-Collapse Phenomenon on Modern Vietnamese AI-Assisted Educational Feedback". SN Computer Science, Springer Nature, 2026. DOI no disponible en la informacion proporcionada.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los diez primeros enlaces corresponden a contenido sobre cuidado de los pies y no guardan relacion con la ficha.
