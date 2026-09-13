# llm-semantic-router/Vela-1.0-Encoder-307M-Feedback

## Resumen

Vela 1.0 · Feedback es un modelo de clasificacion de texto desarrollado por el equipo de llm-semantic-router (proyecto vLLM Semantic Router). Es un encoder de 307.534.085 parametros construido sobre la arquitectura ModernBERT, afinado especificamente para una tarea muy concreta: reconocer que esta diciendo un usuario sobre la respuesta previa de un asistente. Distingue cinco categorias: satisfaccion (`SAT`), necesidad de aclaracion (`NEED_CLARIFICATION`), respuesta incorrecta (`WRONG_ANSWER`), deseo de un enfoque distinto (`WANT_DIFFERENT`) y ausencia de feedback (`NO_FEEDBACK`).

El modelo no genera texto: es un clasificador que emite etiquetas con puntuaciones. Su proposito es alimentar de senales a un router semantico de LLM, de modo que el sistema decida si debe clarificar, reintentar, cambiar de modelo o simplemente continuar. Con 32.000 tokens de contexto y soporte de ingles y chino, esta pensado para turnos de conversacion que incluyen pasajes largos, como cuando el usuario cita un documento o pega un fragmento extenso antes de valorar la respuesta recibida.

Su relevancia actual radica en que la deteccion fiable de feedback es un cuello de botella poco glamuroso pero critico en sistemas multi-turno y de agentes. La model card reporta una mejora muy grande frente al modelo anterior en dos conjuntos de evaluacion internos, aunque el propio autor advierte que estas pruebas son pequenas y no estiman el rendimiento en trafico general. Se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (tag `modernbert`) |
| Parametros totales | 307.534.085 (~307M) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantizacion | no disponible; el repositorio incluye pesos en safetensors y exportacion ONNX, sin variantes cuantizadas publicadas en la informacion disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | SAT, NEED_CLARIFICATION, WRONG_ANSWER, WANT_DIFFERENT, NO_FEEDBACK |
| Modelo base | llm-semantic-router/Vela-1.0-Encoder-307M |
| Tamano del repositorio | 2,7 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo ModernBERT, una familia que moderniza el clasico encoder bidireccional con mejoras de eficiencia (attention con soporte de secuencias largas y kernels optimizados) y que es especialmente adecuada para clasificacion y recuperacion de contexto largo. El modelo parte del encoder generico de la familia, `Vela-1.0-Encoder-307M`, y se ha afinado para la tarea concreta de clasificacion de feedback en cinco clases. Se distribuye como modelo de clasificacion con `transformers`, ademas de una exportacion ONNX.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se detalla el proceso de destilacion o adaptacion desde el modelo base. La unica informacion de evaluacion son las pruebas internas del autor, descritas mas abajo, que mezclan un conjunto de satisfaccion reservado con una suite de regresion previamente observada. Existe una documentacion tecnica referenciada en el repositorio (`TECHNICAL.md`) que no se ha podido consultar en la informacion disponible.

## Capacidades

- Clasificacion de texto en cinco categorias con puntuaciones por clase (`top_k=None`), orientada a decidir el siguiente paso en una conversacion.
- Comprension de contexto largo: acepta hasta 32.000 tokens, pensado para casos en los que el mensaje de feedback incluye un pasaje extenso.
- Diferenciacion entre feedback real y peticiones nuevas: la clase `NO_FEEDBACK` separa las peticiones ordinarias del feedback genuino.
- Capacidad de abstenerse: en el flujo de Semantic Router, las predicciones poco seguras pueden abstenerse y las predicciones `NO_FEEDBACK` confiadas no generan senal de feedback. El umbral es configurable.
- Multilingue limitado a ingles y chino.
- Exportacion a ONNX para despliegue fuera de PyTorch.
- No genera texto, no soporta tool calling ni function calling, y no esta disenado para razonamiento multi-paso ni para agentes por si mismo. Su funcion es actuar como componente de senal dentro de un router.
- No dispone de vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Enrutamiento de feedback en asistentes conversacionales: el clasificador examina el mensaje actual del usuario y decide si es satisfaccion, correccion, peticion de aclaracion o peticion nueva, de modo que el orquestador elija la accion adecuada en cada turno.
- Deteccion de respuestas incorrectas para reintentar: cuando la etiqueta es `WRONG_ANSWER`, el sistema puede relanzar la consulta con un modelo distinto o con una estrategia de recuperacion de contexto diferente.
- Gestion de solicitudes de aclaracion: con `NEED_CLARIFICATION`, el asistente genera una pregunta de seguimiento en lugar de responder de nuevo a ciegas.
- Cambio de enfoque o de modelo: la clase `WANT_DIFFERENT` permite desviar la peticion a un modelo alternativo cuando el usuario pide explicitamente otro planteamiento.
- Reduccion de intervenciones innecesarias: la clase `NO_FEEDBACK` evita que el sistema interprete una peticion nueva como una queja, reduciendo reintentos y cambios de modelo injustificados.
- Analitica de satisfaccion a escala: procesar grandes volumenes de conversaciones para medir la tasa de satisfaccion y detectar patrones de insatisfaccion, con la ventaja de que el modelo cabe en una sola GPU y tiene bajo coste por inferencia.
- Control de bucles de auto-correccion en pipelines de agentes: usar la senal de feedback para decidir si el agente debe revisar su ultima salida, evitando ciclos infinitos cuando el usuario no ha expresado insatisfaccion.
- Integracion en infraestructura de enrutado: combinado con los demas modelos de la familia Vela (Domain, Modality, PII, FactCheck, Reranker) dentro del vLLM Semantic Router, para construir un pipeline de senales sobre el mismo tráfico de entrada.
- Clasificacion de feedback en contextos largos: cuando el usuario cita un documento extenso y anade un comentario al final, el contexto de 32K permite clasificar ese comentario sin truncar el material citado.

## Benchmarks y rendimiento

Datos publicados en la model card. Las cifras corresponden a evaluaciones internas del autor y no a benchmarks estandar como MMLU o HumanEval, que no se han publicado para este modelo.

| Evaluacion | Modelo anterior | Vela 1.0 Feedback |
|---|---:|---:|
| Recall de satisfaccion · 69 mensajes naturales en ingles | 4,3% | 100% |
| Precision en feedback corto · 64 casos redactados en ingles/chino | 53,1% | 96,9% |
| Precision en la porcion controlada de 32K | no disponible | 68,3% |

El autor advierte explicitamente de que el conjunto de satisfaccion estaba reservado y que los casos redactados proceden de una suite de regresion previamente observada, y que estas pruebas pequenas no estiman la precision sobre trafico general. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,3 GB en fp32, unos 615 MB en fp16 o bf16, unos 307 MB en cuantizacion de 8 bits y unos 154 MB en 4 bits. Las cifras son estimaciones a partir del numero de parametros, ya que no se publican requisitos oficiales.
- El repositorio ocupa 2,7 GB, previsiblemente por la inclusion de los pesos en safetensors y de la exportacion ONNX.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares. Tambien puede ejecutarse en CPU para cargas de baja concurrencia.
- GPU de centro de datos compatibles y con margen de sobra: T4, L4, A10, A100, H100. La eleccion dependera del throughput agregado necesario, no de la memoria.
- Opciones de despliegue: pipeline de `transformers` (ejemplo incluido en la model card), ONNX Runtime a partir de la exportacion incluida, vLLM Semantic Router como componente de enrutado y Hugging Face Inference Endpoints, dado que el modelo esta marcado como compatible con endpoints. El tag `text-embeddings-inference` sugiere compatibilidad con esa pila de despliegue.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos externos en la informacion proporcionada. La comparativa mas util es con los miembros de la propia familia Vela y con su modelo base.

| Modelo | Rol | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Vela 1.0 · Feedback (este modelo) | Clasificacion de feedback del usuario en cinco clases | 307M | 32K | en, zh | MIT |
| Vela 1.0 · Domain | Comprension de la peticion por dominio | no disponible | no disponible | no disponible | MIT (segun la familia) |
| Vela 1.0 · Modality | Deteccion de modalidad de la peticion | no disponible | no disponible | no disponible | MIT (segun la familia) |
| Vela 1.0 · PII | Deteccion de datos personales | no disponible | no disponible | no disponible | MIT (segun la familia) |
| Vela 1.0 · FactCheck | Decidir cuando verificar | no disponible | no disponible | no disponible | MIT (segun la familia) |
| Vela 1.0 · Reranker | Reordenacion de contexto recuperado | no disponible | no disponible | no disponible | MIT (segun la familia) |
| Vela 1.0 · Encoder-307M | Encoder base generalista | 307M | no disponible | no disponible | MIT (segun la familia) |

Los modelos PromptGuard, Safety y Hazard de la familia aparecen en la model card como "coming soon" y no estan disponibles. No se han identificado en la informacion proporcionada alternativas externas equivalentes con datos verificables de parametros, contexto y rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las cifras de evaluacion proceden de conjuntos internos pequenos (69 y 64 ejemplos) y el propio autor advierte de que no estiman la precision sobre trafico general. No deben interpretarse como rendimiento esperado en produccion.
- El rendimiento cae de forma notable en la porcion controlada de 32K: la precision baja al 68,3%, frente al 96,9% en casos cortos. El contexto largo es una capacidad, no una garantia de precision.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre. El riesgo equivalente es la clasificacion erronea, especialmente cuando el mensaje del usuario es ambiguo o mezcla feedback con una peticion nueva.
- Ambiguedad de la clase `NO_FEEDBACK`: en la model card se advierte de que el feedback citado dentro de un documento no es necesariamente feedback del usuario actual. Clasificar un mensaje que contiene citas puede producir etiquetas enganosas.
- Cobertura linguistica limitada a ingles y chino. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible. Al ser un clasificador entrenado sobre datos no descritos, no puede descartarse la presencia de sesgos no publicados.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con aviso de copyright. No se documentan restricciones adicionales en la informacion disponible.
- Dependencia del umbral: el comportamiento en produccion depende del umbral de decision configurado en Semantic Router. Un umbral mal ajustado produce senales de feedback espurias o abstenciones excesivas.
- Fecha de publicacion inusual: los metadatos indican creacion el 12 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta. El modelo es muy reciente y tiene poca validacion externa.
- La evaluacion tecnica completa esta en un archivo `TECHNICAL.md` del repositorio, no incluido en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Feedback
- Modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Coleccion de la familia Vela 1.0: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Documentacion tecnica referenciada en la model card: `TECHNICAL.md` en la raiz del repositorio del modelo
- Modelos hermanos citados: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain , https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality , https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII , https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck , https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Reranker
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
