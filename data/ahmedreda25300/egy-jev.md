# AhmedReda25300/EGY-JEV

## Resumen

EGY-JEV es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-2B orientado a la toma de decisiones en arabe egipcio. Lo desarrolla AhmedReda25300 y se distribuye bajo licencia Apache 2.0. El modelo recibe como entrada un estado (descripcion de una situacion, por ejemplo una conversacion de atencion al cliente) junto con una pregunta tipada y un conjunto de etiquetas candidatas, y devuelve una unica etiqueta como respuesta. Es, por tanto, un clasificador generativo restringido a un vocabulario cerrado de opciones, no un modelo conversacional generalista.

El checkpoint publicado contiene los pesos fusionados (merged) en BF16 tras un entrenamiento con LoRA sobre el modelo base. Con 2.213.241.664 parametros y un repositorio de 4,4 GB, esta pensado para despliegues ligeros donde se necesita inferencia determinista y de baja latencia sobre texto en arabe egipcio coloquial, un registro linguistico poco cubierto por los modelos multilingues convencionales.

Su relevancia actual radica en dos factores: por un lado, aprovecha la arquitectura Qwen3.5, que en el modelo base incluye procesamiento de imagen y video (el checkpoint conserva el procesador multimodal y se carga con `AutoModelForImageTextToText`); por otro, el formato de salida estructurada (choice) que ofrece vLLM permite forzar que la respuesta sea siempre una de las etiquetas validas, lo que simplifica su integracion en pipelines de decision automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo Qwen3.5 (`Qwen3_5ForConditionalGeneration`), fine-tune con LoRA fusionado |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de despliegue usa `--max-model-len 8192` |
| Tipos de cuantizacion | no disponible (el checkpoint distribuido esta en BF16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe egipcio (entrenamiento); el modelo base Qwen3.5-2B es multilingue, pero no se detallan los idiomas cubiertos tras el ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer generativo de 2.2 mil millones de parametros con soporte multimodal en el modelo base (el repositorio incluye metadatos de procesador de imagen y video). El ajuste se realizo con LoRA sobre un conjunto de preguntas de decision en arabe egipcio y posteriormente se fusionaron los adaptadores en los pesos base en BF16. El autor no publica el dataset de entrenamiento ni su tamano, composicion o proceso de filtrado, por lo que no es posible evaluar la cobertura ni la calidad de los datos utilizados.

La innovacion principal no esta en la arquitectura sino en el formato de tarea: la entrada se serializa como JSON con un campo `state`, un `question_name` y un objeto de pregunta con `type`, `instructions` y `criteria` (las etiquetas candidatas). El modelo se entrena para responder unicamente con la etiqueta seleccionada. En vLLM se puede combinar con `structured_outputs: {"choice": [...]}` para restringir la decodificacion al conjunto de etiquetas, garantizando salidas validas. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion generativa de decisiones: dado un estado y una pregunta con opciones cerradas, devuelve una etiqueta del conjunto `criteria`.
- Comprension de arabe egipcio coloquial, incluyendo mezcla de registros y expresiones dialectales.
- Tareas de intencion de cliente: el ejemplo de la model card cubre 12 intenciones (reembolso, incidencia de pago, acceso a cuenta, soporte tecnico, entrega, devolucion, cancelacion, reprogramacion, informacion, queja, disputa de facturacion y cambio de pedido).
- Soporte de multiples preguntas sobre un mismo estado: se ejecuta una generacion por pregunta manteniendo el mismo `state`.
- Salida estructurada forzada mediante decodificacion restringida en vLLM.
- Modo sin thinking (`enable_thinking=False`) en la plantilla de chat, orientado a respuestas cortas y deterministas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de vision operativas tras el ajuste, aunque el modelo base sea multimodal.

## Casos de uso

- Triaje de tickets de atencion al cliente: el modelo clasifica la intencion principal de un mensaje en arabe egipcio entre un conjunto cerrado de categorias, permitiendo enrutar el ticket al equipo adecuado sin intervencion humana.
- Moderacion y etiquetado de conversaciones: dado el historial de un chat, se puede pedir al modelo que determine la categoria de la solicitud y priorizar casos de disputa de facturacion o cancelacion.
- Analisis de encuestas y resenas en dialecto: clasificacion de feedback de usuarios egipcios en categorias predefinidas para alimentar dashboards de producto.
- Automatizacion de decisiones en soporte de e-commerce: con un estado que incluya el pedido y la reclamacion, el modelo selecciona entre reembolso, devolucion, cambio de pedido o reprogramacion.
- Clasificacion de correos y mensajes entrantes en un CRM: integrado via API compatible con OpenAI (vLLM), etiqueta cada mensaje con una intencion y permite reglas de negocio posteriores.
- Extraccion de intencion en asistentes conversacionales: como paso previo a un agente mayor, el modelo decide la accion a tomar con latencia baja gracias a sus 2.2B parametros.
- Evaluacion de calidad de conversaciones: clasificar si una conversacion contiene una queja formal frente a una consulta informativa para medir la tasa de escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. La model card menciona una evaluacion sobre "100 questions selected from the deterministic h..." (texto truncado) pero no se incluyen las metricas ni la comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,2 GB solo para los pesos, mas memoria adicional para el contexto y el runtime de vLLM o Transformers (el autor indica que el checkpoint de 4,2 GB requiere memoria GPU adicional).
- Cuantizacion: no se publican variantes GGUF, AWQ ni GPTQ, por lo que no hay cifras oficiales para INT8 o INT4.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia poder cargar el modelo en BF16 con contexto moderado; una RTX 4090, A100 o H100 ofrece margen amplio para lotes mayores y contextos de 8192 tokens.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: vLLM 0.32.0 o superior (recomendado por el soporte de Qwen3.5 y salida estructurada), Transformers 5.19.0 o superior con Accelerate. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EGY-JEV | 2,2B | no disponible (ejemplo con 8192) | Apache 2.0 | Clasificacion de decisiones en arabe egipcio |
| Qwen/Qwen3.5-2B (base) | 2,2B | no disponible | Apache 2.0 | Generacion multimodal generalista |
| Modelos arabes especializados de 2-3B | no disponible | no disponible | variable | Ajuste linguistico general, sin tarea de decision cerrada |

No se dispone de datos de rendimiento comparativo entre EGY-JEV y alternativas de la misma categoria, por lo que la comparativa se limita a parametros, licencia y enfoque de tarea.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para responder con una etiqueta de un conjunto cerrado; no es adecuado como chatbot general ni para generacion libre de texto.
- El dataset de entrenamiento no se publica, lo que impide auditar sesgos, cobertura dialectal o posibles contaminaciones.
- Riesgo de alucinacion reducido en vLLM gracias a la decodificacion restringida, pero en Transformers la salida no esta constrenida y debe validarse contra `criteria`.
- Cobertura limitada al arabe egipcio; el rendimiento en otros dialectos arabes o en arabe estandar no esta documentado.
- No se documentan capacidades multimodales operativas tras el ajuste, pese a heredar el procesador de imagen y video del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- El texto de evaluacion de la model card esta truncado, por lo que no se pueden verificar las metricas declaradas.
- Requiere versiones recientes de vLLM (0.32.0+) o Transformers (5.19.0+) para cargar la arquitectura Qwen3.5.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmedReda25300/EGY-JEV
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
