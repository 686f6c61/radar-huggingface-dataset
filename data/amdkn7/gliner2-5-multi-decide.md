# Amdkn7/GLiNER2.5-multi-Decide

## Resumen

GLiNER2.5-multi-Decide es un modelo especializado en clasificacion de texto y decisiones operativas, desarrollado por el usuario Amdkn7 como un fine-tune del modelo base `fastino/gliner2.5-multi-v1` de Fastino. Con 287 millones de parametros, pertenece a la familia GLiNER2.5 y esta disenado para asignar etiquetas arbitrarias en tiempo de llamada (intenciones, routing, sentimiento, prioridad, politicas y tags multi-etiqueta) en un unico paso forward, sin plantillas de prompt ni generacion de tokens.

El modelo resuelve el problema de la clasificacion zero-shot y few-shot multilingue: el usuario pasa un conjunto de etiquetas candidatas junto con el texto y el modelo devuelve directamente la etiqueta o etiquetas que mejor se ajustan, sin necesidad de reentrenar. Esto lo hace especialmente util para pipelines de enrutamiento automatico, moderacion y extraccion de informacion estructurada en entornos donde el texto no es exclusivamente ingles.

Es relevante ahora porque ofrece una alternativa compacta (287M) y local frente a soluciones basadas en LLM generativos de mayor tamano para tareas de decision operativa, con licencia Apache 2.0 y compatibilidad con la libreria `transformers`. Segun la model card, no es un modelo de proposito general: no razona, no explica ni responde preguntas abiertas, sino que actua como clasificador especialista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (modelo de extraccion y clasificacion, fine-tune de `fastino/gliner2.5-multi-v1`) |
| Parametros totales | 287.355.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLiNER2, una familia de modelos disenados para extraccion de entidades y clasificacion de texto con etiquetas definidas en tiempo de inferencia. Al ser un fine-tune de `fastino/gliner2.5-multi-v1`, hereda la base multilingue del modelo original y anade una cabeza de decision orientada a tareas de clasificacion operativa. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal reside en el modo de uso: el modelo recibe el texto y un diccionario de etiquetas candidatas, y devuelve la etiqueta seleccionada (tarea de etiqueta unica) o todas las etiquetas por encima de un umbral (tarea multi-etiqueta) en un unico forward pass, sin generar tokens. Segun la model card, una sola llamada puede puntuar varias cabeceras a la vez. El benchmark de referencia se evalua sobre el dataset `fastino/fast-decisions`, con 17 dominios y 300 ejemplos reservados por dominio, usando el mismo texto y las mismas etiquetas candidatas para todos los modelos comparados.

## Capacidades

- Clasificacion de texto con etiquetas arbitrarias definidas en tiempo de llamada, sin plantilla de prompt.
- Clasificacion de intenciones (intent classification) para enrutamiento de conversaciones.
- Analisis de sentimiento (sentiment analysis).
- Clasificacion de topicos (topic classification).
- Reconocimiento de entidades nombradas (Named Entity Recognition).
- Tareas de decision operativa: routing de emails y tickets, handoff a humano, finalizacion de agente, moderacion, severidad, urgencia y spam.
- Clasificacion multi-etiqueta: devuelve todas las etiquetas por encima del umbral.
- Clasificacion de etiqueta unica: devuelve una unica cadena.
- Puntuacion de escalas ordinales.
- Uso de etiquetas que llevan una descripcion asociada.
- Capacidad multilingue (idiomas declarados: multilingual y en).
- No soporta generacion de texto libre, razonamiento explicito ni respuesta a preguntas abiertas.

## Casos de uso

- Atencion al cliente automatizada: el modelo enruta un mensaje entrante a la cola o workflow correcto (reembolso, cancelacion, fallo de login, retraso de envio) antes de que lo vea un humano, de modo que el proceso adecuado arranca en el primer turno.
- Enrutamiento de solicitudes bancarias: a partir de un mensaje que mezcla transferencia pendiente, cambio de beneficiario y consulta de comisiones, el modelo mapea la utterance a la operacion que el sistema core debe abrir (por ejemplo, `transfer_cancel`).
- Gestion de solicitudes de viaje: convierte un email o chat de reserva, cambio, cancelacion o peticion de asiento en una accion estructurada de inventario sin necesidad de formulario.
- Triaje en clinicas: distingue entre cita, receta, resultado o derivacion en mensajes donde el paciente describe sintomas y peticion en la misma frase, permitiendo el enrutamiento de recepcion antes de programar.
- Moderacion de contenido y deteccion de spam: clasifica texto entrante en categorias de moderacion, severidad y urgencia en una sola llamada.
- Enrutamiento de emails y tickets: asigna tipo de documento, prioridad y cola de destino en pipelines de soporte o back-office.
- Clasificacion de resenas y sentimiento: puntua sentimiento y topicos en resenas de producto o servicio para analitica agregada.
- Extraccion de entidades en documentos multilingues: uso como componente NER dentro de pipelines de procesamiento documental.

## Benchmarks y rendimiento

Exact-match accuracy sobre `fastino/fast-decisions` (17 dominios, 300 ejemplos reservados por dominio, mismo texto y etiquetas candidatas para todos los modelos):

| Modelo | Avg |
|---|---:|
| GLiNER2.5-Decide (340M) | 60.2% |
| GLiNER2.5-Decide-1B | 59.6% |
| JevK5 | 57.6% |
| GLiNER2.5-multi-Decide (287M) | 56.7% |
| SemIf (Qwen3.5-4B) | 56.4% |
| GLiFormer large-v1 | 49.0% |
| Laya Router | 46.6% |

La model card indica que la suite de evaluacion es en ingles y recomienda `GLiNER2.5-Decide` para texto exclusivamente en ingles, reservando este modelo para entradas multilingues.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 287M parametros y pesos safetensors en un repo de 1.2 GB, la inferencia en fp32 requiere aproximadamente 1.2 GB solo para pesos, mas overhead de activaciones y contexto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 287M parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: la model card indica instalacion mediante `pip install "gliner2[local]"` y carga con `AutoExtractor.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg en fast-decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER2.5-multi-Decide | 287M | no disponible | 56.7% | apache-2.0 | Hugging Face |
| GLiNER2.5-Decide | 340M | no disponible | 60.2% | no disponible | Hugging Face |
| GLiNER2.5-Decide-1B | 1B | no disponible | 59.6% | no disponible | Hugging Face |
| SemIf (Qwen3.5-4B) | 4B | no disponible | 56.4% | no disponible | no disponible |
| GLiFormer large-v1 | no disponible | no disponible | 49.0% | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de proposito general: no razona, no explica ni responde preguntas abiertas; solo realiza clasificacion y decision operativa.
- La suite de benchmark es en ingles; el rendimiento en otros idiomas no esta cuantificado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible de forma explicita; al no generar texto libre, el riesgo se traslada a clasificaciones erroneas cuando las etiquetas candidatas no cubren bien la entrada.
- Limitaciones de contexto: la longitud maxima de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: Apache 2.0, permite uso comercial con las condiciones de dicha licencia.
- Para produccion: el modelo devuelve resultados potenciales segun la model card; conviene validar el umbral de multi-etiqueta y el conjunto de etiquetas por dominio antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amdkn7/GLiNER2.5-multi-Decide
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Modelo GLiNER2.5-Decide: https://huggingface.co/fastino/GLiNER2.5-Decide
- Modelo GLiNER2.5-Decide-1B: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Dataset de evaluacion: https://huggingface.co/datasets/fastino/fast-decisions
- Paper arXiv: https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Plataforma Fastino Agent: https://agent.fastino.ai
- Twitter/X de Fastino: https://x.com/fastinoAI
