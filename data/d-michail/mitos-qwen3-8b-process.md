# d-michail/Mitos-Qwen3-8B-Process

## Resumen

Mitos-Qwen3-8B-Process es un ajuste fino de Qwen/Qwen3-8B orientado a la respuesta de preguntas sobre procedimientos administrativos del Estado griego. Lo desarrolla d-michail y se apoya en el Εθνικό Μητρώο Διοικητικών Διαδικασιών (ΕΜΔΔ / Mitos), el registro nacional de procedimientos administrativos de Grecia. El modelo resuelve un problema muy concreto: convertir el texto estructurado del registro en respuestas conversacionales en griego, manteniendo el registro lingüístico y la estructura de las fichas oficiales.

Técnicamente es un transformer decoder-only denso de 8.190.735.360 parámetros, derivado de Qwen3-8B mediante LoRA (rango 16, alpha 32, aplicado a todas las proyecciones de atención y MLP) y publicado como modelo fusionado en bfloat16. El ajuste se hizo sobre 90.145 registros de pregunta-respuesta generados por plantillas a partir de los 4.407 procedimientos del registro, con una longitud de secuencia máxima de 4.096 tokens y el modo de razonamiento (thinking) de Qwen3 desactivado. Es un modelo monolingüe en griego.

Su relevancia es doble. Por un lado, demuestra que un ajuste fino pequeño sobre datos administrativos estructurados mejora de forma medible la recuperación de hechos frente al modelo base (recall de hechos clave de 0,119 frente a 0,043 en modo closed-book, y de 0,554 frente a 0,442 con RAG). Por otro, es un caso de estudio sobre licencias y atribución: los pesos se liberan bajo CC BY-SA 4.0, la misma licencia del contenido del registro, y el autor advierte explícitamente de que el modelo no constituye asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), ajustado con LoRA y fusionado |
| Parametros totales | 8.190.735.360 |
| Longitud de contexto | 4.096 tokens (longitud maxima usada en el ajuste) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; los pesos se distribuyen en bfloat16 |
| Idiomas soportados | Griego (el) |
| Licencia | CC BY-SA 4.0 (pesos); el modelo base Qwen3 es Apache-2.0 |
| Formato de pesos | safetensors (transformers); tamano del repositorio 16,4 GB |
| Modelo base | Qwen/Qwen3-8B |
| Metodo de ajuste | LoRA, rango 16, alpha 32, todas las proyecciones de atencion y MLP |
| Dataset de entrenamiento | d-michail/mitos-qa (configuracion json-all), 90.145 registros sobre 4.407 procedimientos |
| Plantilla de chat | Plantilla de chat de Qwen3 con enable_thinking=False |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only denso con Grouped Query Attention. Sobre esa base se aplico un ajuste supervisado con LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP, con learning rate 2e-4, scheduler coseno, 2 epocas, batch efectivo 32 y precision bfloat16. La funcion de perdida se calcula unicamente sobre los tokens del asistente, usando la plantilla de chat de Qwen3 con el modo thinking desactivado y entropia cruzada estandar. El resultado se fusiono y se publico como modelo completo en bfloat16. No se menciona ninguna innovacion arquitectonica propia: el valor esta en los datos y en el procedimiento de ajuste.

Los datos proceden integramente del registro Mitos. Se descargo una instantanea el 1 y 2 de octubre de 2026, se dividio el texto de cada procedimiento en temas y se convirtio en dialogos o registros de pregunta-respuesta mediante plantillas, sin usar un LLM para generar las respuestas objetivo. El conjunto final son 90.145 registros que cubren los 4.407 procedimientos. La model card indica que los dialogos de entrenamiento se generaron con Qwen3.8-27B (Apache-2.0). Este repositorio contiene el modelo entrenado con todos los procedimientos, incluidos los 220 que el modelo companero reservo para evaluacion; por eso no se evalua en el benchmark, ya que las preguntas marcadas como `unseen` provienen de procedimientos que ha visto. El modelo companero (d-michail/Mitos-Qwen3-8B-Process-LoRA, carpeta `holdout/`) es el que se usa para las cifras de evaluacion.

## Capacidades

- Generacion de texto conversacional en griego con el registro formal de la administracion publica helena.
- Respuesta a preguntas sobre procedimientos del registro Mitos, reproduciendo la estructura de las fichas oficiales (requisitos, plazos, documentacion, tasas).
- Generacion aumentada por recuperacion (RAG): la model card incluye una plantilla de prompt especifica en griego que instruye al modelo a responder solo con los contextos numerados `[1]`, `[2]`, ... y a declarar explicitamente cuando la informacion es insuficiente.
- Modo closed-book: aprende el registro y el formato del dominio, aunque la model card reconoce que retiene pocos hechos concretos (recall de hechos clave de 0,119).
- Respuestas extensas: una media de 83 a 139 palabras segun el modo de evaluacion, mas largas que las de un modelo generico y alineadas con las entradas del registro.
- Soporte de tool calling / function calling: no documentado en la model card. El modelo se entreno sin system prompt y con thinking desactivado, por lo que no se puede asumir comportamiento de agente.
- Razonamiento multi-paso / modo thinking: explicitamente desactivado en entrenamiento y en el ejemplo de uso (`enable_thinking=False`).
- Capacidades multilingues: limitadas al griego. No hay evidencia de transferencia a otros idiomas.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente ciudadano sobre el portal Mitos: desplegado con RAG sobre los textos del registro, el modelo responde en griego a preguntas del tipo "como renuevo el carnet de conducir", citando los campos recuperados. Es el caso de uso principal y el unico con datos de evaluacion asociados.
- Mesa de ayuda interna para empleados publicos: el personal puede consultar rapidamente requisitos y plazos de procedimientos antes de atender a un ciudadano, con la ventaja de que el modelo reproduce el formato de la ficha oficial y reduce el tiempo de busqueda manual.
- Generacion de FAQ a partir de procedimientos oficiales: dado el texto estructurado de un procedimiento, el modelo puede redactar conjuntos de preguntas frecuentes con el registro linguistico administrativo, reutilizando el estilo aprendido de las plantillas del registro.
- Simplificacion y reescritura de lenguaje administrativo: el modelo conoce las convenciones del registro y puede reescribir fragmentos burocraticos en formulaciones mas directas, manteniendo la terminologia oficial.
- Sistema de referencia para investigacion en PLN juridico-administrativo en griego: sirve como linea base de 8B parametros para comparar estrategias de ajuste, configuraciones de RAG (chunks por campo, ventanas, procedimientos completos) y metricas sin juez.
- Normalizacion de consultas ciudadanas: preprocesar texto libre de un ciudadano y reformularlo como pregunta alineada con el vocabulario del registro antes de pasarlo a un recuperador, mejorando la precision del retrieval.
- Base para asistentes en otros registros administrativos: la receta (plantillas sobre texto estructurado mas LoRA sobre Qwen3) es replicable a otros catalogos de procedimientos con estructura similar; el modelo sirve de plantilla metodologica.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 8B en bfloat16, cabe en una GPU de 24 GB y permite iterar sobre prompts y pipelines de recuperacion sin infraestructura de gran escala.

## Benchmarks y rendimiento

Las siguientes cifras corresponden al modelo companero entrenado sin los 220 procedimientos reservados, no a este repositorio, tal como indica la model card. Son metricas sin juez sobre 1.933 preguntas del benchmark. La columna "key-fact recall (base)" es el resultado del sistema sin el modelo ajustado.

| Sistema | Key-fact recall (base) | Key-fact recall (modelo) | Token F1 (modelo) | Palabras (modelo) |
|---|---|---|---|---|
| Closed-book | 0,043 | 0,119 | 0,157 | 135 |
| RAG (chunks a nivel de campo) | 0,442 | 0,554 | 0,348 | 83 |
| RAG-split (ventanas) | 0,260 | 0,344 | 0,270 | 116 |
| RAG-process (procedimientos completos) | 0,236 | 0,296 | 0,223 | 139 |

La propia model card advierte que el key-fact recall favorece las respuestas largas y el token F1 las cortas, por lo que ambas metricas deben leerse junto a la longitud media de la respuesta. La mejor configuracion es RAG con chunks a nivel de campo, que alcanza 0,554 de recall de hechos clave con la respuesta mas corta (83 palabras). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni metricas con juez; la model card remite a un paper cuyo enlace esta pendiente de anadir.

## Requisitos de hardware

Los valores de VRAM son estimaciones derivadas del numero de parametros, no mediciones publicadas por el autor.

- VRAM para inferencia en bfloat16: aproximadamente 16,4 GB de pesos mas cache KV. Con la ventana de 4.096 tokens el cache KV anade del orden de 0,5-0,6 GB, por lo que el total se situa en torno a 17-18 GB.
- VRAM en 8 bits (bitsandbytes): aproximadamente 9-10 GB, incluido cache KV.
- VRAM en 4 bits (NF4, AWQ o GPTQ, generados por el usuario): aproximadamente 5-6 GB de pesos; con cache KV y overhead de runtime, en torno a 7-8 GB.
- GPU recomendadas para bfloat16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB, RTX 3090 24 GB.
- Cabe en GPU de consumo: si. En bfloat16 entra en RTX 4090 y RTX 3090 (24 GB). En cuantizacion 4 bits entra en tarjetas de 8-12 GB, como RTX 4060 Ti 16 GB o RTX 3070 8 GB con margen ajustado.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), vLLM (`vllm serve d-michail/Mitos-Qwen3-8B-Process`, enviando `"chat_template_kwargs": {"enable_thinking": false}`), y TGI, ya que el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.
- Parametro de generacion recomendado por el autor: `max_new_tokens=512` y `repetition_penalty=1.05`, este ultimo para mitigar los bucles de repeticion.

## Comparativa con modelos similares

No se dispone de datos publicados que comparen este modelo con otras alternativas de respuesta a preguntas sobre administracion publica griega, por lo que la comparacion se limita a las variantes de la misma familia descritas en la informacion disponible.

| Modelo | Parametros | Contexto de ajuste | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Mitos-Qwen3-8B-Process | 8,19 B | 4.096 tokens | CC BY-SA 4.0 | Pesos fusionados en bfloat16 en HuggingFace | Sin evaluacion propia (entrenado con todos los procedimientos) |
| d-michail/Mitos-Qwen3-8B-Process-LoRA (carpeta holdout) | 8,19 B (adaptadores) | 4.096 tokens | CC BY-SA 4.0 | Adaptadores LoRA | Recall de hechos clave 0,554 en la mejor configuracion RAG |
| Qwen/Qwen3-8B | 8,19 B | 32.768 tokens nativos en el modelo base | Apache-2.0 | Pesos completos en HuggingFace | Recall de hechos clave 0,442 en la misma configuracion RAG (sin ajuste) |

No hay informacion disponible sobre modelos comparables especificos de dominio administrativo griego ni sobre alternativas multilingues evaluadas en el mismo benchmark.

## Limitaciones y advertencias

- No es asesoramiento legal: las respuestas no tienen validez juridica. Cualquier sistema en produccion debe mostrar la fuente, la fecha de recuperacion y el enlace al procedimiento oficial.
- Verificacion obligatoria: la model card exige contrastar cada respuesta con el procedimiento vivo en `https://id.mitos.gov.gr/<ID Mitos>`, usando el identificador de 6 digitos del procedimiento.
- Datos obsoletos por diseno: el entrenamiento usa una instantanea del registro descargada el 1 y 2 de octubre de 2026. Los procedimientos cambian, por lo que el modelo queda desactualizado y no puede reflejar modificaciones posteriores.
- Alucinacion de datos concretos: en modo closed-book el modelo aprende el registro y el formato del dominio pero apenas los hechos; puede afirmar importes, plazos o documentos que son incorrectos. La recuperacion es la que aporta la mayor parte de la exactitud.
- Bucles de repeticion: los modelos pequenos pueden degenerar en repeticiones que consumen todos los tokens de salida. Es necesario aplicar penalizacion por repeticion o una regla de parada en produccion.
- Sin system prompt: el modelo se entreno sin system prompt y con thinking desactivado. Hay que usar la plantilla de chat de Qwen3, poner la pregunta en el mensaje de usuario y pasar `enable_thinking=False`.
- Sesgos y errores heredados del generador: los datos son sinteticos o generados por plantillas a partir de una unica instantanea del registro, por lo que el modelo puede reproducir los errores y el fraseo del generador.
- Calidad de la fuente no garantizada: los terminos de uso de mitos.gov.gr (clausula A.6) no garantizan la integridad ni la exactitud del contenido, y el modelo tampoco puede hacerlo.
- Idioma: monolingue en griego. No hay soporte documentado para otros idiomas, ni siquiera para consultas multilingues.
- Licencia share-alike: los pesos se distribuyen bajo CC BY-SA 4.0, la misma licencia del contenido del registro. El uso comercial es posible, pero con obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas; conviene revisar el alcance de estas obligaciones antes de integrarlo en un producto propietario. Los textos de licencia del modelo base (Apache-2.0) estan incluidos en el repositorio.
- Atribucion requerida: los datos proceden del Εθνικό Μητρώο Διοικητικών Διαδικασιών – Μίτος y, segun sus terminos de uso, pertenecen o estan supervisados por el Ministerio del Interior heleno. La model card describe los cambios realizados: division en temas y conversion a dialogos o registros de pregunta-respuesta para el ajuste de Qwen3.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el paper asociado aun no tiene enlace publicado. No hay evidencia de uso en produccion.
- Cobertura de evaluacion limitada: las cifras publicadas corresponden al modelo companero con 220 procedimientos reservados, no a este repositorio, que ha visto todos los procedimientos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Process
- Modelo companero con adaptadores LoRA y particion holdout: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Process-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Registro Nacional de Procedimientos Administrativos (Mitos): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de procedimientos por identificador: https://id.mitos.gov.gr/<Mitos ID>
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Paper asociado: enlace pendiente de publicacion segun la model card (no disponible)
- Repositorio de codigo o demo: no disponible
- Los resultados de busqueda web proporcionados no contienen informacion util sobre este modelo.
