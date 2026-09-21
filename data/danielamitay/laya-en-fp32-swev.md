# danielamitay/laya-en-fp32-swev

## Resumen

`danielamitay/laya-en-fp32-swev` es una exportación a Core ML de [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya) para [Swev](https://github.com/danielamitay/swev), un paquete Swift orientado a "decisiones tipadas" ejecutadas localmente. No es un modelo generativo: recibe un estado textual y una lista de preguntas definidas en tiempo de ejecución, y devuelve opciones seleccionadas, puntuaciones ordinales y probabilidades. El autor de la exportación es danielamitay; el checkpoint original pertenece a convaiinnovations y se apoya en la arquitectura encoder `ModernBERT-large`.

La pieza clave es el formato de salida. Swev define tres tipos de pregunta (`choice`, `score` y `noul`), admite hasta 16 opciones de respuesta por pregunta y hasta 64 preguntas por petición, evaluadas de forma independiente. El contexto textual llega a 4.096 tokens, incluyendo la pregunta, las opciones y el formateo, con un presupuesto de 256 tokens reservado al prefijo de la pregunta. El modelo selecciona automáticamente el bucket más pequeno que encaje entre 128, 256, 512, 1.024, 2.048 y 4.096 tokens.

Su relevancia es de nicho pero concreta: permite incorporar clasificación y decisión estructurada en aplicaciones Apple sin runtime de Python, sin tokenizer externo y sin ficheros de adaptadores, cargando un único `.mlpackage`. Es una exportación independiente, no una publicación oficial de los autores originales, y no debe confundirse con el checkpoint multilingüe ni con el de decisiones tipadas del proyecto Laya.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (encoder-only) basado en `ModernBERT-large`; exportado a Core ML |
| Parametros totales | no disponible (la model card no especifica el recuento; hereda la arquitectura ModernBERT-large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (pregunta + opciones + formateo), con presupuesto de 256 tokens para el prefijo de pregunta; buckets de 128, 256, 512, 1.024, 2.048 y 4.096 |
| Tipos de cuantizacion | el export es FP32 (pesos y computo); los tags del repo referencian `base_model:quantized:convaiinnovations/laya`, pero este paquete concreto no está cuantizado |
| Idiomas soportados | inglés (checkpoint en-inglés de la raíz del repositorio original); no es el checkpoint multilingüe |
| Licencia | Apache License 2.0 |
| Formato de pesos | Core ML (`.mlpackage`, paquete `laya-en-fp32-swev-l4096-k16.mlpackage`); sin safetensors ni GGUF |
| Tamano del repositorio | 1,7 GB |
| Pipeline declarado | text-classification |
| Capacidad de decision | hasta 16 opciones por pregunta; hasta 64 preguntas por peticion, evaluadas independientemente |
| Tipos de pregunta | `choice`, `score`, `noul` |
| Version de export | 0.3.0 |
| Esquema Swev requerido | 2.0 |
| Entorno de ejecucion | Swift 6, macOS 15+ o iOS 18+ |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo `ModernBERT-large` utilizado como clasificador, no como generador. La exportación conserva el tokenizer, el formateo y los ajustes de inferencia dentro del propio paquete Core ML, de modo que no se requieren ficheros auxiliares de tokenizer ni adaptadores. El checkpoint de origen es el inglés situado en la raíz del repositorio `convaiinnovations/laya`, fijado en la revisión `1c5edc17a7ac`, y la implementación de referencia está publicada en [NandhaKishorM/laya](https://github.com/NandhaKishorM/laya).

No se trata de un fine-tune nuevo: la model card indica explícitamente que es una conversión del checkpoint original, manteniendo los ajustes de temperatura del mismo. La modificación introducida por la exportación es la extensión del contexto configurado hasta 4.096 tokens, junto con el presupuesto de 256 tokens para el prefijo de la pregunta. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; tampoco se describen innovaciones de decodificación (el modelo no decodifica texto).

## Capacidades

- Clasificación y decisión tipada local: devuelve opciones elegidas, puntuaciones ordinales y probabilidades para preguntas definidas en tiempo de ejecución.
- Preguntas de elección (`choice`): selección entre un máximo de 16 opciones por pregunta.
- Preguntas de puntuación (`score`): salida ordinal para escalas definidas por la aplicación.
- Preguntas `noul`: decisión booleana o de etiqueta única sobre el estado proporcionado.
- Procesamiento por lotes de decisiones: hasta 64 preguntas independientes en una sola petición.
- Contexto ampliado: hasta 4.096 tokens de entrada, con selección automática de bucket para minimizar coste.
- Ejecución 100 % local en dispositivo mediante Core ML, sin Python, sin llamadas de red tras la primera descarga y sin tokenizer separado.
- Integración nativa en Swift 6 para macOS 15+ e iOS 18+.
- No genera texto libre: la propia model card lo indica de forma explícita.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible en este checkpoint (solo inglés).

## Casos de uso

- Moderación de contenido en aplicaciones iOS y macOS: el modelo puede clasificar texto introducido por el usuario con preguntas del tipo `noul` ("¿es contenido ofensivo?") y hasta 16 categorías simultáneas en una sola llamada, todo en el dispositivo y sin enviar datos a un servidor.
- Enrutado de intenciones en asistentes locales: con 64 preguntas independientes por petición, una app puede evaluar en una sola pasada si el texto del usuario corresponde a cualquiera de sus intenciones registradas, reduciendo el coste frente a invocar el modelo repetidamente.
- Extracción de atributos estructurados: a partir de una ficha o descripción, el modelo responde a preguntas `noul` o `choice` sobre campos concretos (categoría, disponibilidad, ámbito geográfico), devolviendo un registro tipado listo para persistir.
- Triaje y priorización con puntuaciones ordinales: uso de preguntas `score` para asignar severidad o relevancia a tickets, reseñas o incidencias, aprovechando una escala definida por la aplicación en lugar de una etiqueta plana.
- Filtrado previo en pipelines de PLN: colocar este clasificador delante de un modelo generativo para descartar entradas irrelevantes o inseguras y ahorrar cómputo en el modelo grande.
- Análisis de formularios y respuestas abiertas en herramientas internas: clasificación de comentarios de empleados o clientes en categorías predefinidas, con la ventaja de que los datos no salen del Mac del usuario.
- Etiquetado asistido en investigación: dado que el contexto alcanza 4.096 tokens, se pueden clasificar documentos o fragmentos relativamente largos sin trocear manualmente, siempre que se respete el presupuesto de 256 tokens para la pregunta.
- Funciones de decisión dentro de herramientas de desarrollo: por ejemplo, determinar si un fragmento de código o un mensaje de error encaja en una categoría conocida, con salida determinista y sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte además que "la capacidad exportada no es una garantía de precisión en la tarea" y recomienda evaluar el checkpoint con los propios datos del usuario. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificación para este export ni para el checkpoint origen en la documentación facilitada.

## Requisitos de hardware

- Pesos en FP32: el repositorio ocupa 1,7 GB, por lo que se necesita al menos ese volumen de memoria para mantener el paquete cargado (estimación basada en el tamano del repo; el consumo exacto no está documentado por el autor).
- El autor indica que la validación local se realizó en macOS con Core ML en modo CPU-only; el soporte de memoria y de unidades de cómputo depende del dispositivo.
- Ejecución orientada a Apple Silicon mediante Core ML, con posibilidad de repartir cómputo entre CPU, GPU y Neural Engine según la configuración del dispositivo (el reparto concreto no está documentado).
- Entorno mínimo declarado: Swift 6, macOS 15+ o iOS 18+, con una versión de Swev que soporte el esquema 2.0.
- No cabe plantear despliegue en GPU NVIDIA: al ser un paquete Core ML, no aplican vLLM, TGI, llama.cpp ni Ollama. La vía de integración es el paquete Swift Swev.
- Al ser FP32, el modelo es más pesado que una hipotética variante cuantizada a int8 o int4; no se ofrece en la información disponible ninguna versión cuantizada de esta exportación.
- Latencia y throughput: no disponibles. La model card recomienda mantener el modelo residente en memoria para evitar recompilación e inicialización en cada petición, lo que sugiere que la carga inicial tiene un coste apreciable.
- La primera llamada descarga el paquete desde HuggingFace; las posteriores reutilizan la caché local de Swev.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `danielamitay/laya-en-fp32-swev` | no disponible | 4.096 tokens | Core ML (`.mlpackage`) | Apache 2.0 | 4 descargas, 0 likes |
| `convaiinnovations/laya` (checkpoint origen) | no disponible | no disponible (la exportación lo extiende a 4.096) | no disponible en esta informacion | no disponible en esta informacion | modelo base referenciado |
| `answerdotai/ModernBERT-large` (arquitectura base) | no disponible en esta informacion | no disponible en esta informacion | safetensors (formato habitual del ecosistema transformers, no confirmado aqui) | Apache 2.0 (no confirmado en esta informacion) | no disponible en esta informacion |

La comparación directa con alternativas de la misma categoría (clasificadores encoder ejecutables en dispositivo, como variantes de DeBERTa o BERT destilados para Core ML) no puede completarse con los datos disponibles: no se han facilitado cifras de parámetros, contexto ni rendimiento del checkpoint origen. Cualitativamente, la diferencia principal de este export frente a otros clasificadores es la interfaz de decisión tipada de Swev (hasta 16 opciones y 64 preguntas por petición) y su empaquetado sin dependencias de Python.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para resumen, redacción, traducción ni chat.
- Solo inglés. La model card señala que este no es el checkpoint multilingüe del proyecto Laya.
- Los pesos están en FP32, lo que implica 1,7 GB de repositorio y un consumo de memoria superior al de una variante cuantizada.
- Rechaza entradas que superan los límites en lugar de truncarlas silenciosamente; también aplican límites por campo, además del límite global de 4.096 tokens.
- Exportación independiente: no es un release oficial de convaiinnovations ni de los autores de Laya, por lo que el soporte depende de danielamitay.
- Sin resultados de benchmarks publicados: la propia model card advierte que la capacidad exportada no garantiza precisión en la tarea y recomienda evaluar con datos propios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea o de confianza mal calibrada en las probabilidades devueltas; no se documenta calibración.
- Sesgos: no se documenta ninguna evaluación de sesgos del checkpoint origen ni de esta exportación.
- Adopción mínima: 4 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Licencia Apache 2.0, que permite uso comercial, pero al ser un derivado conviene conservar la atribución al modelo origen y revisar las condiciones del proyecto Laya.
- Dependencia de plataforma: requiere macOS 15+ o iOS 18+ con Swift 6 y una versión de Swev compatible con el esquema 2.0; no es portable a otros runtimes sin reconversión.
- Los resultados de busqueda web disponibles no aportan informacion relevante sobre este modelo (unicamente enlaces al traductor DeepL), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielamitay/laya-en-fp32-swev
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Revision fijada del checkpoint origen: https://huggingface.co/convaiinnovations/laya/tree/1c5edc17a7acd8701df6fc341c0d179f1c62c982
- Paquete Swift Swev: https://github.com/danielamitay/swev
- Guia de conversion de Swev: https://github.com/danielamitay/swev/blob/main/docs/conversion.md
- Referencia del esquema Swev: https://github.com/danielamitay/swev/blob/main/docs/schema.md
- Carga y cache desde HuggingFace: https://github.com/danielamitay/swev/blob/main/docs/huggingface.md
- Soporte de modelos en Swev: https://github.com/danielamitay/swev/blob/main/docs/models.md
- Implementacion de referencia de Laya: https://github.com/NandhaKishorM/laya
- Arquitectura base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
