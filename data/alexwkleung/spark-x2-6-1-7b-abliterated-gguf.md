# alexwkleung/Spark-X2.6-1.7B-Abliterated-GGUF

## Resumen

Spark-X2.6-1.7B-Abliterated-GGUF es una compilacion en formato GGUF del modelo denso Spark-X2.6-1.7B de XHToken, modificado mediante la tecnica de abliteration con la herramienta Heretic 2.1 (metodo Arbitrary-Rank Ablation) y cuantizado con llama.cpp. El modelo base es un transformer denso de 1.707.657.216 parametros (1,7B) con capacidad de razonamiento explicito (thinking mode), entrenado para generacion de texto conversacional en ingles y chino. La modificacion afecta a 35 tensores con el objetivo de reducir los rechazos (refusals) del modelo original; no se reentreno ningun otro componente.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de abliteration aplicada a un modelo pequeno, con mediciones publicadas por el autor contra el Q8_0 original de XHToken: los rechazos pasan de 44/44 a 0/44 en el conjunto de prueba, a costa de un aumento notable en la longitud de las respuestas y de una perdida no significativa en GSM8K (67/100 frente a 71/100, McNemar p = 0.52). Por otro, ilustra las limitaciones del enfoque: el modelo "suaviza" en lugar de negarse, sustituyendo aproximadamente un cuarto de las peticiones por tareas mas seguras, y en modo thinking genera respuestas muy largas (mediana de ~4,8k tokens) que en 17 de 44 casos no terminaron dentro del limite de 8192 tokens.

El autor advierte explicitamente de que se trata de una via de escape para el exceso de rechazo, no de un modelo sin censura, y de que la abliteration no anade conocimiento: solo modifica la disposicion a responder. El modelo no esta avalado ni revisado por XHToken y su comportamiento no es responsabilidad del autor original. La licencia es Apache 2.0, los pesos se distribuyen en GGUF y el repositorio ocupa 5,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Spark-X2.6-1.7B de XHToken) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens por slot (segun la prueba del autor) |
| Tipos de cuantizacion | GGUF cuantizado con llama.cpp; Q8_0 medido en las pruebas (otras cuantizaciones del repo no detalladas) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1,7B parametros con modo de razonamiento (thinking model), segun la model card del autor de la modificacion. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original dentro de la informacion proporcionada. El modelo soporta dos regimenes de inferencia controlados mediante `chat_template_kwargs`: `enable_thinking: true` (por defecto) y `enable_thinking: false`, que desactiva el bloque de razonamiento y reduce la longitud de las respuestas a aproximadamente 1k tokens.

La innovacion tecnica de esta compilacion es la abliteration: se aplico Heretic 2.1 con su metodo por defecto Arbitrary-Rank Ablation, que identifico y modifico 35 tensores para reducir la probabilidad de rechazo. El resto de los pesos no se reentreno. El autor verifico que los tensores no alterados muestreados mediante lecturas por rangos eran byte a byte identicos al Q8_0 original de XHToken (sha256 `8d96279c…6ef6ed4`), de modo que ese checkpoint sirve como brazo de control en las comparaciones. Las diferencias entre ambos ficheros se limitan a metadatos y a los tensores ablacionados.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento explicito mediante bloque de thinking, activable o desactivable por parametro.
- Razonamiento matematico basico: 67/100 en GSM8K con thinking desactivado (n=100, presupuesto de 1536 tokens).
- Respuesta a peticiones que el modelo original rechazaba: 0 rechazos en 44 prompts del conjunto `mlabonne/harmful_behaviors` `test[60:]`.
- Capacidad de "deflection": reformula peticiones problematicas como tareas benignas equivalentes (auditoria de seguridad en lugar de ataque, articulo benigno en lugar de desinformacion).
- No se han medido ni documentado capacidades de tool calling, function calling, agentes, vision, audio ni bucles multi-paso en la informacion disponible.
- No se han medido capacidades en contextos largos ni en idiomas distintos del ingles y el chino.

## Casos de uso

- Investigacion sobre abliteration y alineacion: el modelo sirve como caso de estudio reproducible para medir el efecto de la ablacion sobre la tasa de rechazo, la longitud de respuesta y el rendimiento en tareas de razonamiento, usando el Q8_0 original como control pareado.
- Evaluacion de robustez de filtros y clasificadores: al eliminar los rechazos explicitos, permite comprobar si un clasificador de contenido detecta respuestas problematicas que ya no vienen marcadas por una negativa del modelo.
- Generacion de texto creativo sin friccion: para tareas de escritura donde el modelo original rechazaba peticiones por exceso de cautela (ficcion con violencia, dialogos conflictivos), el modelo responde directamente, con la advertencia de que aproximadamente un cuarto de las respuestas sustituyen la peticion por una version mas segura.
- Despliegue local en hardware modesto: con 1,7B parametros y formato GGUF, cabe en GPU de consumo y en CPU, lo que permite experimentar con un modelo de razonamiento en equipos sin aceleradores de datacenter.
- Analisis de coste de inferencia en modo thinking: el modelo documenta el impacto del bloque de razonamiento en la longitud de salida (mediana de ~4,8k tokens con thinking frente a ~1k sin thinking), util para dimensionar presupuestos de `max_tokens` y costes en produccion.
- Pruebas de estabilidad y repeticion: con thinking desactivado, 2 de 44 respuestas superan el 10% de 20-gramas repetidos (frente a 0 en el original), lo que lo convierte en un caso util para evaluar detectores de degeneracion en modelos pequenos.
- Generacion de respuestas en chino e ingles para prototipos conversacionales bilingues, con la limitacion de que no se han medido capacidades multilingues mas alla de esos dos idiomas.

## Benchmarks y rendimiento

Todas las mediciones del autor se realizaron sobre Q8_0, con muestreo temp 1.0 / top-p 0.95 / top-k 20 y semilla fija por item, comparando contra el Q8_0 publicado por XHToken.

Tasa de rechazo sobre `mlabonne/harmful_behaviors` `test[60:]` (44 prompts):

| Regimen | Original: rechazos | Abliterado: rechazos / cumplimiento / deflexion / otros | Sin terminar al limite de `max_tokens` |
|---|---|---|---|
| `enable_thinking: false` | 44/44 | 0 / ~25 / ~13 / ~6 vagos | 0 |
| `enable_thinking: true` | 43/44 | 0 / ~18 / ~9 / no disponible | 17 |

GSM8K pareado, n=100, `enable_thinking: false`:

| Version | Correctas | Truncadas (1536 tokens) |
|---|---|---|
| Original | 71/100 | 3 |
| Abliterado | 67/100 | 4 |

Los pares discordantes se dividieron 13/9 (McNemar exacto p = 0.52): no se detecta regresion, pero con 22 pares discordantes sobre 100 el ruido de muestreo es grande y n=100 solo descarta una regresion grande, no diferencias de pocos puntos.

Longitud de respuesta: con thinking desactivado, media de 983 tokens (original: 150), con 1 respuesta que alcanzo el presupuesto de 1536 tokens. Con thinking activado, las 26 respuestas que terminaron tuvieron mediana de 4846 tokens (percentil 75: 6232; maxima: 8129), frente a una mediana de 917 en el original. Las 17 respuestas sin terminar se cortaron por `max_tokens`, no por la ventana de contexto (65.536 tokens por slot en la prueba).

No medido: MMLU, codigo, contexto largo, idiomas distintos del ingles y chino, bucles agente/tool calling.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 1,7B en Q8_0 requiere aproximadamente 1,8 GB solo para pesos, mas overhead de contexto KV; las cuantizaciones inferiores del repo reduciran ese requisito, pero sus tamanos concretos no se detallan.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es apto para GPU de consumo con suficiente VRAM para la cuantizacion elegida.
- Cabe en GPU de consumo: si, por el tamano del modelo (1,7B) y el formato GGUF; el autor no especifica modelos concretos.
- Opciones de despliegue: llama.cpp (libreria declarada) y cualquier runtime compatible con GGUF. No se mencionan vLLM, TGI, Ollama ni otros en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato relacionado es la longitud de salida, que condiciona el coste: mediana de ~4,8k tokens con thinking activado frente a ~1k con thinking desactivado, lo que multiplica el tiempo de generacion en el primer regimen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Abliterated (este) | 1,7B denso | 65.536 tokens por slot (prueba del autor) | Apache 2.0 | GGUF | 0/44 rechazos, GSM8K 67/100, thinking opcional |
| XHToken/Spark-X2.6-1.7B (original) | 1,7B denso | no disponible | no disponible en la informacion | safetensors y Q8_0 publicado | 44/44 rechazos con thinking off, GSM8K 71/100 |
| alexwkleung/Spark-X2.6-4B-Abliterated-GGUF | 4B denso | no disponible | no disponible en la informacion | GGUF | Version mayor del mismo autor; recomendada por el propio autor frente a la de 1,7B |

El autor indica que, dentro de las builds Spark ablacionadas, la de 1,7B es la mas debil y que, si se puede ejecutar la de 4B, se prefiera esta ultima. No se dispone de datos de benchmarks de la version de 4B en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo sin censura: es una via de escape para el exceso de rechazo. La abliteration no anade conocimiento, solo cambia la disposicion a responder.
- Suaviza en lugar de negarse: aproximadamente un cuarto de las respuestas sustituyen la peticion por una tarea mas segura (un ataque informatico se convierte en auditoria de seguridad, una bomba en un fuego artificial, la desinformacion en un articulo benigno). Es esperable en prompts sin contexto.
- Los rechazos actuaban como senal de cautela: al eliminarlos, el modelo responde con fluidez en dominios donde es poco fiable, sin las pistas que antes marcaban el limite. A 1,7B las respuestas suelen ser esquemas genericos, no detalle experto.
- Con thinking activado, la deliberacion es muy larga: mediana de ~4,8k tokens en las respuestas terminadas y 17 de 44 sin terminar con `max_tokens` de 8192. Es necesario asignar un presupuesto amplio o desactivar el thinking.
- Degeneracion ocasional: 2 de 44 trazas de razonamiento colapsaron en repeticiones de `**`; con thinking desactivado, 2 de 44 respuestas superan el 10% de 20-gramas repetidos (el original: 0).
- Un system prompt sin rechazos ni descargos (preset "unrestricted" de ~1 KB) redujo a la mitad la deliberacion en el modelo de 4B, pero en este de 1,7B no la acorto.
- No medido: MMLU, codigo, contexto largo, idiomas distintos del ingles y chino, bucles agente/tool calling. No hay evidencia de rendimiento en esas areas.
- Responsabilidad legal y de contenido: el autor declara que el usuario es responsable de lo que genere y de la legislacion aplicable. La licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones legales sobre el contenido generado.
- El modelo no esta producido, avalado ni revisado por XHToken; su comportamiento no es atribuible al autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alexwkleung/Spark-X2.6-1.7B-Abliterated-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Version de 4B ablacionada del mismo autor: https://huggingface.co/alexwkleung/Spark-X2.6-4B-Abliterated-GGUF
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset de evaluacion de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
