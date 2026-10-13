# solanaclawd/clef-27b-mps-nf4

## Resumen

Clef es un modelo multimodal de 27.356.728.560 parametros construido por Cloudflare (post-entrenado a partir de Qwen/Qwen3.8-27B con su codificador de vision) que no genera texto libre: recibe un "estado" (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devuelve, en una unica pasada forward, una probabilidad por cada opcion permitida de cada pregunta. El repositorio analizado, `solanaclawd/clef-27b-mps-nf4`, es una version cuantizada a 4 bits en formato NF4 (bitsandbytes) del modelo original, orientada a ejecucion en Apple Silicon (MPS), con un tamano de repositorio de 18,9 GB.

El problema que resuelve es concreto: sustituir los pipelines de "LLM + parseo de salida" por un cabezal de decision estructurado. En lugar de pedir al modelo que redacte una respuesta y despues parsearla (con el riesgo de alucinacion de formato y con un coste de decodificacion autoregresiva token a token), Clef puntua de forma conjunta todas las opciones de todas las preguntas en un solo forward pass, con tipos de pregunta definidos: `noul` (booleano), `choice` (opciones con nombre) y `score` (opciones ordenadas).

Es relevante ahora porque el modelo llega acompanado de una API compatible con Jev y SystemOne (`POST /v1/systemone`), una licencia permisiva Apache-2.0 y una variante menor denominada Clef-Flash, lo que lo posiciona como infraestructura de clasificacion y enrutamiento para agentes y sistemas de triaje, no como un chatbot. La longitud de contexto de entrada por defecto en `encode_record` es de 16.384 tokens, configurable mediante `max_length` y acotable con `max_state_tokens`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer multimodal (Qwen/Qwen3.8-27B con su codificador de vision) mas un cabezal de esquema conjunto (joint schema head) que lee los estados ocultos finales y puntua todas las opciones de todas las preguntas de forma conjunta |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens por defecto en `encode_record` (`max_length` configurable; `max_state_tokens` permite acotar el estado) |
| Tipos de cuantizacion | 4 bits NF4 con bitsandbytes (esta build); el modelo original se distribuye en safetensors estandar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors fragmentados (`model-*.safetensors`, `model.safetensors.index.json`), mas `joint_head.safetensors` para el cabezal; sin GGUF |

## Arquitectura y entrenamiento

Clef no es un modelo generativo. Sobre el backbone Qwen/Qwen3.8-27B (incluyendo su codificador de vision) se anade un cabezal de esquema conjunto: un transformer de tamano reducido que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opcion permitida; aplicando un softmax por pregunta se obtienen las probabilidades. Esto elimina la decodificacion autoregresiva y, con ella, cualquier necesidad de parsear texto libre.

El modelo se ha post-entrenado a partir de Qwen/Qwen3.8-27B (relacion declarada: finetune). La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos se consideran no disponibles. Como innovacion destacable, el formato de entrada soporta preguntas de tres tipos (`noul`, `choice`, `score`) con criterios textuales por opcion, permite mezclar registros de solo texto y multimodales en el mismo lote, y expone una funcion `systemone` que traduce una peticion Jev/SystemOne al formato interno y devuelve el mismo cuerpo de respuesta con `answers` por ID de pregunta y `usage`. El autor probo la implementacion con `torch` 2.11 y `transformers` 5.10.2 sobre una unica H200.

## Capacidades

- Decision estructurada multimodal: a partir de un estado (texto, JSON, imagenes o video) devuelve una distribucion de probabilidad sobre las opciones permitidas de cada pregunta.
- Preguntas booleanas (`noul`) con probabilidad de verdadero.
- Preguntas de eleccion (`choice`) con opciones nombradas y descripcion de criterio por opcion.
- Preguntas de puntuacion (`score`) con opciones ordenadas, devolviendo puntuacion esperada, confianza, leyenda y probabilidades.
- Puntuacion conjunta de multiples preguntas en una sola pasada forward, con enrutado de evidencia por pregunta.
- Entrada multimodal: imagenes (PIL) y video (arrays de fotogramas), mezclables con registros de solo texto en el mismo lote.
- Salida tipada y clasificable sin parseo: no hay generacion de texto libre.
- Interfaz compatible con Jev y SystemOne (`POST /v1/systemone`) mediante la funcion `systemone`.
- Soporte de `media_kwargs` para pasar argumentos opcionales al procesador de imagen/video.
- No se documentan capacidades de tool calling, function calling, ejecucion de agentes multi-paso, generacion de codigo, matematicas ni modo de razonamiento explicito.

## Casos de uso

- Triaje de tickets de soporte: se envia el texto del ticket como estado y un esquema con una pregunta `choice` (departamento: facturacion, tecnico) y una pregunta `score` (urgencia), obteniendo enrutado y prioridad en una sola pasada sin parsear texto.
- Automatizacion de cuentas a pagar: a partir del JSON de una factura (proveedor, total, divisa, estado) se responde si supera un umbral (`noul`) y se clasifica su estado (`choice`), tal como muestra el ejemplo de la model card.
- Procesamiento de documentos escaneados: enviando la imagen del recibo con la pregunta `noul` "es legible el total", se combina OCR humano y validacion automatica en el mismo esquema.
- Moderacion y clasificacion de contenido en video: se pasan los fotogramas del clip y se pregunta por categoria (`choice`) y severidad (`score`), aprovechando que el modelo acepta video como entrada.
- Scoring de leads o solicitudes: puntuacion ordenada (`score`) sobre criterios de cualificacion definidos por el equipo comercial, devolviendo puntuacion esperada y confianza.
- Enrutado dentro de un agente: como primer paso de un pipeline mayor, Clef decide que herramienta o equipo debe manejar una solicitud, evitando que un modelo generativo tenga que producir JSON valido para el router.
- Control de calidad en revision documental: verificaciones booleanas encadenadas (campos presentes, importes coherentes, firmas) sobre lotes mixtos de texto e imagenes.
- Monitorizacion operativa: clasificacion de mensajes de incidencias con una pregunta `noul` de servicio caido y una `choice` de equipo responsable, integrable en alertado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. La model card menciona una seccion "Results" con resultados por benchmark de una ejecucion interna del Decision Index, pero el contenido proporcionado se interrumpe y no incluye cifras. El autor enlaza la tabla de clasificacion publica del Decision Index:

| Referencia | Estado |
|---|---|
| Decision Index (tabla publica del autor) | Enlazada en la model card; valores no disponibles en la informacion proporcionada |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | No disponibles |

## Requisitos de hardware

- Peso del repositorio: 18,9 GB (backbone cuantizado en NF4 mas cabezal de esquema y procesador).
- VRAM estimada para inferencia: aproximadamente 19-24 GB solo para pesos y estructuras asociadas; hay que sumar activaciones, que crecen con la longitud de contexto (hasta 16.384 tokens por defecto).
- GPU con 24 GB (RTX 3090, RTX 4090): al limite; previsiblemente sera necesario reducir `max_length` y `max_state_tokens`, y el lote sera muy pequeno.
- GPU con 32-48 GB (RTX 5090, A6000, L40S): margen razonable para lotes pequenos y contextos largos.
- GPU de datacenter (A100 40/80 GB, H100, H200): configuracion recomendada. El autor probo la implementacion en una unica H200.
- Apple Silicon: el nombre del repositorio (`mps-nf4`) indica orientacion a MPS; se requiere memoria unificada amplia (se recomienda 32 GB o mas; 24 GB queda muy justo y condiciona la longitud de contexto).
- Opciones de despliegue: `transformers` 5.10.2 con el codigo personalizado del repositorio (`joint_schema_model.py`, con `load_release_model`, `encode_record`, `collate_records` y `systemone`), `torch` 2.11 y bitsandbytes para NF4; `pillow` para imagen y video.
- No se documenta soporte nativo para vLLM, llama.cpp, Ollama, TGI ni formato GGUF. Al no haber decodificacion autoregresiva ni API de generacion estandar, la integracion en servidores de inferencia convencionales requeriria trabajo adicional no cubierto por la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que la decision se obtiene en una sola pasada forward en lugar de una decodificacion token a token, lo que en principio reduce el coste por consulta respecto a un modelo generativo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef 27B (esta ficha, `solanaclawd/clef-27b-mps-nf4`) | 27.356.728.560 | 16.384 tokens por defecto | Logits por opcion; decision estructurada | Apache-2.0 | Repositorio HuggingFace con codigo personalizado; build NF4 para MPS |
| Cloudflare Clef-Flash | no disponible | no disponible | Decision estructurada (variante menor y mas rapida) | no disponible | Referenciado en la model card |
| Qwen/Qwen3.8-27B (modelo base) | no disponible (es el backbone de Clef) | no disponible | Generacion de texto libre y multimodal | no disponible | HuggingFace |
| Enfoques genericos "LLM generativo + parseo de JSON" sobre modelos densos de ~27B | segun el modelo elegido | segun el modelo elegido | Texto libre que hay que parsear | segun el modelo elegido | amplia |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto libre: cualquier caso de uso que requiera explicaciones, resumenes o respuestas abiertas queda fuera del alcance del modelo.
- Modelo de decision, no de conocimiento general: no se documentan capacidades de razonamiento multi-paso, codigo, matematicas ni tool calling.
- Riesgo de calibracion: las probabilidades devueltas por el softmax por pregunta no tienen por que estar calibradas; en produccion conviene validar umbrales y confianza con datos propios.
- Riesgo de alucinacion acotado por diseno (la salida solo puede ser una de las opciones del esquema), pero la asignacion de evidencia del estado a cada pregunta puede ser incorrecta, especialmente en esquemas con muchas preguntas o criterios ambiguos.
- El modelo se distribuye como build cuantizada NF4, lo que puede degradar ligeramente la calidad respecto al modelo original en safetensors completos.
- Limite de entrada: 16.384 tokens por defecto; estados mas largos requieren truncado o ajuste de `max_length` y `max_state_tokens`, con perdida potencial de evidencia.
- Idiomas soportados: no disponibles. No hay confirmacion del comportamiento en castellano.
- Requisitos de software estrictos y poco comunes: `transformers` 5.10.2 y `torch` 2.11, con carga de codigo personalizado del repositorio (`joint_schema_model.py`). Esto implica ejecutar codigo del autor y limita la portabilidad a otros stacks.
- Compatibilidad de despliegue: sin soporte documentado en vLLM, llama.cpp, Ollama o TGI, y sin formato GGUF, lo que complica el escalado en servidores convencionales.
- Trazabilidad del repositorio: el identificador analizado es `solanaclawd/clef-27b-mps-nf4`, mientras que la model card describe el modelo como `Cloudflare/clef` y enlaza su propio blog y leaderboard. Conviene verificar la procedencia y comparar con el repositorio oficial antes de usarlo en produccion.
- Licencia Apache-2.0: permite uso comercial, pero no cubre posibles reclamaciones sobre los datos de post-entrenamiento ni sobre la procedencia del backbone base.
- Sin adopcion registrada en el momento de los datos: 0 descargas y 0 "likes" en el repositorio, sin historial de validacion por terceros.
- El contenido devuelto por la busqueda web asociada a esta consulta no guarda relacion con el modelo y no se ha utilizado como fuente.

## Enlaces

- Repositorio analizado: https://huggingface.co/solanaclawd/clef-27b-mps-nf4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante menor citada en la model card (Clef-Flash): https://huggingface.co/Cloudflare/clef-flash
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Repositorio de codigo del modelo (descarga via `snapshot_download("Cloudflare/clef")`): https://huggingface.co/Cloudflare/clef
- No se han encontrado papers, repositorios adicionales ni demos en la informacion proporcionada.
