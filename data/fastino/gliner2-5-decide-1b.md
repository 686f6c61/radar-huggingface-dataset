# fastino/GLiNER2.5-Decide-1B

## Resumen

GLiNER2.5-Decide-1B es un modelo especializado en clasificacion de texto desarrollado por Fastino, perteneciente a la familia GLiNER2.5 y obtenido por ajuste (fine-tune) sobre fastino/gliner2-xl-0111. Cuenta con 1.188.796.693 parametros (unos 1,19B) y se distribuye con licencia Apache 2.0. Su funcion no es generar texto, sino asignar etiquetas definidas en tiempo de llamada (intencion, enrutamiento, sentimiento, prioridad, politicas o etiquetas multietiqueta) en una sola pasada hacia delante, sin plantilla de prompt y sin producir tokens generados.

El problema que resuelve es el de las decisiones operativas: convertir lenguaje natural en una accion estructurada, como reembolso, cancelacion, cambio de vuelo, enrutado de tickets, moderacion, urgencia o spam, sin el coste de una decodificacion autoregresiva. Se carga con `AutoExtractor` de la libreria gliner2 y esta pensado para ejecucion local, con una sola llamada capaz de puntuar varias cabezas de clasificacion a la vez.

Es relevante ahora porque compite con alternativas mas grandes y de tipo generativo: en el conjunto fastino/fast-decisions obtiene un 59,6% de exactitud por coincidencia exacta, frente al 56,4% de SemIf (Qwen3.5-4B). El modelo es exclusivamente en ingles y no es de proposito general: la propia model card indica que no razona, no explica y no responde a preguntas abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica el tipo; se describe como extractor/clasificador de una sola pasada, sin generacion de tokens) |
| Parametros totales | 1.188.796.693 (unos 1,19B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Libreria de carga | gliner2 (`AutoExtractor`) |
| Modelo base | fastino/gliner2-xl-0111 |
| Tamano del repositorio | 4,8 GB |
| Descargas / likes | 1.231 descargas / 11 likes |
| Fechas | creado el 24-09-2026, actualizado el 28-09-2026 |

## Arquitectura y entrenamiento

No se especifica en la informacion proporcionada el tipo de arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset. Lo unico documentado es que el modelo deriva por fine-tune de fastino/gliner2-xl-0111, que no genera tokens y que resuelve la clasificacion en una unica pasada hacia delante. Tampoco hay datos sobre si se emplearon tecnicas de alineacion como RLHF o DPO.

La innovacion destacable es de interfaz y de eficiencia: el conjunto de etiquetas se pasa en tiempo de llamada, la misma llamada puede puntuar varias cabezas de clasificacion simultaneamente, las tareas de etiqueta unica devuelven una cadena y las multietiqueta devuelven todas las etiquetas que superan el umbral. El modelo esta asociado al paper arXiv:2507.18546, cuyo contenido no esta disponible en la informacion proporcionada.

## Capacidades

- Clasificacion de texto con un conjunto de etiquetas arbitrario definido en tiempo de llamada, sin plantilla de prompt.
- Clasificacion de intenciones en dominios operativos: atencion al cliente, banca, viajes y solicitudes de clinica.
- Analisis de sentimiento sobre resenas.
- Clasificacion de topico y etiquetado multietiqueta con umbral.
- Reconocimiento de entidades nombradas (la etiqueta de pipeline es token-classification).
- Puntuacion simultanea de varias cabezas en una sola llamada (`classify_text`).
- Etiquetas con descripcion asociada y puntuacion de escalas ordinales (severidad, urgencia, prioridad).
- Respuesta a una pregunta sobre un pasaje, clasificacion del tipo de documento y clasificacion de libros.
- Casos operativos citados por el autor: enrutado de correo y tickets, handoff a humano, finalizacion de agente, moderacion, spam.
- No soporta generacion de texto, razonamiento, explicaciones ni preguntas abiertas.
- No se documenta soporte de tool calling ni de agentes multi-paso.
- Multilingue: no. Solo ingles; el autor remite a GLiNER2.5-multi-Decide para entradas multilingues.

## Casos de uso

- Enrutado de atencion al cliente: el modelo recibe el mensaje entrante y un conjunto de etiquetas (order_status, refund_request, cancel_subscription, update_payment, login_problem, shipping_delay, bug_report, speak_to_human, other) y devuelve la accion que debe abrir la cola, de modo que el flujo correcto arranca en el primer turno.
- Clasificacion de intenciones bancarias: un mismo mensaje puede mezclar una transferencia pendiente, un cambio de beneficiario y una consulta de comisiones; el modelo lo mapea a la operacion que debe abrir el sistema central (transfer_pending, transfer_cancel, beneficiary_add, fraud_report, fee_explanation).
- Gestion de solicitudes de viaje: reservar, cambiar, cancelar y solicitar asiento se parecen en texto libre pero disparan llamadas de inventario distintas; el modelo convierte un chat o correo en una accion de reserva estructurada sin formulario.
- Triaje en recepcion de clinica: el paciente describe sintomas y lo que quiere en la misma frase (cita, receta, resultado, derivacion); la clasificacion previa permite decidir si se agenda o se deriva antes de que intervenga una persona.
- Moderacion de contenido: con etiquetas de politica definidas en tiempo de llamada, el modelo puntua cada mensaje en una sola pasada y permite aplicar reglas automaticas sobre lo que se publica.
- Clasificacion de resenas y sentimiento: para paneles de producto o soporte, etiquetar sentimiento, tema y severidad de cada resena sin generar texto y a bajo coste por elemento.
- Enrutado de correo y tickets interno: clasificar tipo de documento y equipo destino antes de que el ticket entre en el sistema de gestion, reduciendo el tiempo de primera respuesta.
- Deteccion de spam y abuso: clasificacion binaria o multietiqueta con umbral ajustable para filtrar entrantes.
- Deteccion de handoff a humano y de finalizacion de agente: clasificar cuando una conversacion debe escalarse o darse por resuelta, usando etiquetas del tipo speak_to_human o agent_complete.
- Clasificacion de prioridad y urgencia: uso de escalas ordinales (baja, media, alta, critica) para ordenar colas de trabajo.

## Benchmarks y rendimiento

Exactitud por coincidencia exacta sobre fastino/fast-decisions: 17 dominios, 300 ejemplos retenidos por dominio, con el mismo texto y las mismas etiquetas candidatas para todos los modelos. La suite es en ingles.

| Modelo | Exactitud media |
|---|---:|
| GLiNER2.5-Decide (340M) | 60,2% |
| GLiNER2.5-Decide-1B | 59,6% |
| JevK5 | 57,6% |
| GLiNER2.5-multi-Decide (287M) | 56,7% |
| SemIf (Qwen3.5-4B) | 56,4% |
| GLiFormer large-v1 | 49,0% |
| Laya Router | 46,6% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, algo coherente con que el modelo no sea de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir del numero de parametros, no publicada por el autor): en fp32 en torno a 4,8 GB, lo que coincide con el tamano del repositorio; en fp16/bf16 alrededor de 2,4 GB; en int8 aproximadamente 1,2 GB; en int4 cerca de 0,6 GB. Hay que anadir el consumo de activaciones y del runtime.
- GPU recomendadas: al tratarse de un modelo de 1,19B, cualquier GPU con 6-8 GB o mas es suficiente. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 o una L4 lo ejecutan con holgura; tambien es viable en A100 o H100 si se despliega a gran escala, aunque no son necesarias por tamano.
- Cabe sin problema en GPU de consumo; tambien es razonable su ejecucion en CPU para cargas moderadas.
- Opciones de despliegue documentadas: la libreria gliner2 mediante `AutoExtractor.from_pretrained("fastino/GLiNER2.5-Decide-1B")`, previa instalacion con `pip install gliner2`.
- No se documentan en la informacion disponible opciones de despliegue con vLLM, TGI, llama.cpp, Ollama ni pesos en GGUF u ONNX.
- Latencia y throughput: no disponible. El diseno (una sola pasada hacia delante, sin generacion de tokens) elimina el coste de decodificacion autoregresiva, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en fast-decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER2.5-Decide-1B | 1,19B | no disponible | 59,6% | Apache 2.0 | HuggingFace |
| GLiNER2.5-Decide | 340M | no disponible | 60,2% | no disponible | HuggingFace |
| GLiNER2.5-multi-Decide | 287M | no disponible | 56,7% | no disponible | HuggingFace |
| JevK5 | no disponible | no disponible | 57,6% | no disponible | no disponible |
| SemIf (Qwen3.5-4B) | 4B (segun el nombre) | no disponible | 56,4% | no disponible | no disponible |
| GLiFormer large-v1 | no disponible | no disponible | 49,0% | no disponible | no disponible |
| Laya Router | no disponible | no disponible | 46,6% | no disponible | no disponible |

Observacion: la variante de 340M de la misma familia supera ligeramente a la de 1B en esta suite (60,2% frente a 59,6%), mientras que las alternativas generativas de mayor tamano, como SemIf sobre Qwen3.5-4B, quedan por debajo. No hay datos publicados de contexto, licencia ni disponibilidad para la mayoria de las alternativas.

## Limitaciones y advertencias

- Solo soporta ingles. Para entradas multilingues el autor remite a GLiNER2.5-multi-Decide.
- No es un modelo de proposito general: no razona, no explica, no responde a preguntas abiertas y no genera texto. Usarlo para esos fines producira resultados invalidos.
- La salida es siempre una etiqueta (o varias) del conjunto proporcionado. Un conjunto de etiquetas mal definido, ambiguo o incompleto degrada directamente la precision.
- En tareas multietiqueta el resultado depende del umbral de decision, que no esta documentado y debe calibrarse por caso de uso.
- La exactitud media publicada es del 59,6% por coincidencia exacta, lo que implica en torno a un 40% de fallos en el conjunto de evaluacion; en produccion conviene prever validacion humana o umbrales de confianza en las decisiones criticas.
- La evaluacion se limita a 17 dominios en ingles con 300 ejemplos por dominio; se desconoce el comportamiento fuera de ese conjunto (cambio de dominio, jerga especifica, texto muy corto o muy largo).
- No hay informacion publicada sobre sesgos demograficos, linguisticos o de dominio.
- Riesgo de alucinacion: al no generar texto libre no produce contenido ficticio, pero si puede asignar etiquetas incorrectas con aparente seguridad, sin ofrecer justificacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de incluir el aviso de licencia y el fichero de cambios; revisar las clausulas sobre patentes antes de un despliegue comercial.
- No se publican pesos cuantizados ni formatos GGUF/ONNX, por lo que un despliegue en entornos con restricciones de memoria exige convertir los pesos.
- El modelo base (fastino/gliner2-xl-0111) y el numero de tokens de entrenamiento no estan detallados en la model card suministrada.
- La model card disponible esta truncada: el ultimo ejemplo mostrado, el de solicitudes de clinica, aparece incompleto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Modelo base: https://huggingface.co/fastino/gliner2-xl-0111
- Variante de 340M: https://huggingface.co/fastino/GLiNER2.5-Decide
- Variante multilingue: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Dataset de evaluacion: https://huggingface.co/datasets/fastino/fast-decisions
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio de codigo: https://github.com/fastino-ai/GLiNER2
- Plataforma de ajuste y despliegue del autor: https://agent.fastino.ai
- Perfil del autor en X: https://x.com/fastinoAI
