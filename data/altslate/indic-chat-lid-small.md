# altslate/indic-chat-lid-small

## Resumen

Indic Chat LID (small) es un modelo de identificacion de idioma (LID) de 140 millones de parametros desarrollado por el usuario altslate, disenado especificamente para mensajes cortos de chat en 12 lenguas del sur de Asia, tanto en escritura nativa como en su forma romanizada (transliterada al alfabeto latino tal y como se escribe en el movil). Se construye sobre el modelo base jhu-clsp/mmBERT-small, una arquitectura ModernBERT de tipo encoder, y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es concreto y esta bien documentado: los modelos genericos de LID rinden bien en escritura nativa pero fallan estrepitosamente con texto romanizado. Segun la model card, fastText LID-218 no tiene etiquetas romanizadas de lenguas indias, y en el conjunto de prueba romanizado del autor GlotLID alcanza un 42% y AI4Bharat IndicLID un 39%, mientras que este modelo llega al 77% (93% con las primeras cinco palabras en romanizaciones humanas de Dakshina).

El modelo clasifica en 26 etiquetas: los codigos `hi bn ta te mr gu kn ml pa ur sd si` en escritura nativa, los mismos con sufijo `-Latn` para romanizado, mas `en` y `other`. Esta pensado para mensajes y pasajes cortos (truncado a 64 tokens), no para documentos largos. Es relevante ahora porque el code-mixing y la escritura romanizada dominan la comunicacion real en aplicaciones de mensajeria en la India, y las herramientas estandar no cubren ese caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base jhu-clsp/mmBERT-small |
| Parametros totales | 140.651.546 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (truncado de entrada) |
| Tipos de cuantizacion | fp32 (ONNX), int8 dinamico por canal (ONNX cuantizado) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, sd, si, en (nativo y romanizado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 y int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 140 millones de parametros, afinado a partir de jhu-clsp/mmBERT-small para una tarea de clasificacion de texto con 26 etiquetas. La entrada se trunca a 64 tokens, lo que refleja su orientacion a mensajes cortos. Se distribuye en safetensors para PyTorch/Transformers y en dos exportaciones ONNX: fp32 (563 MB) y cuantizada int8 dinamica por canal (142 MB); la exportacion fp32 presenta una diferencia maxima de logits de 5e-5 respecto a PyTorch.

La model card describe los conjuntos de evaluacion con detalle, pero no especifica el volumen total de tokens de entrenamiento ni la composicion exacta del dataset. Si se indica que los datos de entrenamiento incluyen las romanizaciones humanas del split *dev* de Dakshina (mismos anotadores que el split de test), lo que introduce una fuga parcial en la evaluacion del Test A. Los conjuntos de prueba B y C fueron generados por Qwen3.8-27B con topics disjuntos de los de entrenamiento. No se menciona uso de RLHF ni DPO, lo cual es coherente con una tarea de clasificacion supervisada.

## Capacidades

- Identificacion de idioma en 12 lenguas del sur de Asia mas ingles, con etiqueta `other` para el resto.
- Distincion entre escritura nativa y romanizada (sufijo `-Latn`) para cada lengua cubierta.
- Manejo de texto code-mixed y Hinglish en mensajes cortos de chat.
- Clasificacion de mensajes de atencion al cliente con identificadores y numeros de telefono (Test C).
- Inferencia en navegador via transformers.js con el modelo ONNX cuantizado.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face.
- No realiza generacion de texto, tool calling ni razonamiento multi-paso: es exclusivamente un clasificador.
- No ofrece etiquetado por palabra ni por token; cada mensaje recibe una unica etiqueta.

## Casos de uso

- Enrutamiento de soporte al cliente: clasificar cada mensaje entrante como `hi-Latn`, `ta` o `en` permite dirigirlo al agente o cola adecuada. El modelo rinde bien en mensajes con IDs y telefonos (Test C: 0.809 en Hinglish frente a 0.309 de GlotLID).
- Moderacion de contenido en apps de mensajeria: detectar el idioma real de un mensaje romanizado para aplicar las politicas y filtros correspondientes por comunidad linguistica.
- Analitica de producto: agregar metricas de uso por lengua en chats donde los usuarios escriben en transliteracion, algo que los modelos LID genericos no capturan.
- Preprocesado de pipelines NLP: asignar el idioma antes de aplicar tokenizadores, modelos de traduccion o correctores especificos de cada lengua.
- Deteccion de PII en soporte tecnico: combinado con un clasificador de entidades, el LID ayuda a separar mensajes en Hinglish de mensajes en ingles antes de aplicar reglas de redaccion.
- Filtrado previo en motores de busqueda internos: indexar mensajes por idioma detectado para mejorar la recuperacion en bases de conocimiento multilingues.
- Despliegue en el navegador: con el ONNX int8 (142 MB) puede ejecutarse localmente via transformers.js sin enviar texto a un servidor, util para aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

Todos los valores son exactitud (accuracy) media macro sobre lenguas. Ninguno de los conjuntos de prueba se uso para entrenamiento ni para seleccionar hiperparametros, salvo la salvedad indicada sobre el Test A.

Test B: mensajes de chat romanizados (720, 60 por lengua), generados por Qwen3.8-27B:

| Modelo | Romanizado | Nativo |
|---|---|---|
| GlotLID | 0.423 | 1.000 |
| IndicLID | 0.393 | 0.849 |
| **Este modelo** | **0.772** | **0.997** |

Por lengua en romanizado: bn 0.84, gu 0.81, hi 0.84, kn 0.82, ml 0.82, mr 0.77, pa 0.72, sd 0.81, si 0.87, ta 0.71, te 0.85, ur 0.42. Fusionando hindi y urdu: 0.825.

Test A: split de test de Dakshina (romanizaciones humanas, 500 frases por lengua):

| Palabras | GlotLID | IndicLID | Este modelo |
|---|---|---|---|
| Primeras 3 | 0.623 | 0.473 | **0.846** |
| Primeras 5 | 0.768 | 0.540 | **0.931** |
| Primeras 8 | 0.841 | 0.604 | **0.965** |
| Completo | 0.880 | 0.676 | **0.975** |

Escritura nativa, primeras 5 palabras: GlotLID 0.984, IndicLID 0.878, este modelo 0.993. Advertencia del autor: el entrenamiento incluye el split *dev* de Dakshina de los mismos anotadores, por lo que el Test A favorece al modelo; el Test B es la medida mas justa.

Test C: mensajes estilo soporte con IDs y telefonos (800):

| Modelo | Hinglish (hi-Latn) | Ingles | Nativo (7 lenguas) |
|---|---|---|---|
| GlotLID | 0.309 | **0.994** | 0.987-1.000 |
| Este modelo | **0.809** | 0.974 | 0.987-1.000 |

## Requisitos de hardware

- VRAM para inferencia: menos de 1 GB en fp32 (140M parametros); unos 200-300 MB con el ONNX int8.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en CPU para lotes pequenos.
- Despliegue soportado: Transformers (pipeline de text-classification), ONNX Runtime, transformers.js en navegador, Text Embeddings Inference y endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un encoder de 140M con contexto de 64 tokens, se espera un coste por inferencia muy bajo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Cobertura | Romanizado (Test B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Indic Chat LID small** | 140M | 12 lenguas + en + other | 0.772 | Apache 2.0 | Hugging Face, ONNX, navegador |
| GlotLID | no disponible | Muy amplia (muchas lenguas) | 0.423 | no disponible en la informacion | Hugging Face |
| IndicLID (AI4Bharat) | no disponible (pipeline FTN/FTR con BERT) | Lenguas indias, amplia | 0.393 | no disponible en la informacion | GitHub/Hugging Face |
| fastText LID-218 | no disponible | 218 lenguas | Sin etiquetas romanizadas de lenguas indias | no disponible en la informacion | fastText |

GlotLID supera a este modelo en ingles (0.994 frente a 0.974 en Test C) y cubre muchas mas lenguas; IndicLID tambien cubre un repertorio mayor. La ventaja de este modelo se concentra en texto romanizado y code-mixed, donde la diferencia es de 35-38 puntos sobre ambos.

## Limitaciones y advertencias

- Hindi frente a urdu romanizados es a menudo indecidible; el urdu romanizado se predice mayoritariamente como `hi-Latn` (0.42 en Test B). Se recomienda fusionar ambas etiquetas si el caso de uso lo permite.
- Punjabi, tamil y marathi romanizados son los siguientes mas debiles (0.71-0.77); las entradas de 1-3 palabras son mucho menos fiables.
- El ingles se confunde a veces con `other`, o un mensaje en ingles con algunas palabras en hindi se etiqueta como `hi-Latn` (0.974 frente a 0.994 de GlotLID en Test C).
- Solo cubre 12 lenguas indias; el resto cae en `other`. En lenguas no cubiertas (manipuri, bodo, nepali, sanscrito, odia, cachemir, maithili, assames, konkani) asigna etiquetas erroneas con frecuencia, especialmente en vecinos cercanos (assames a `bn-Latn`, konkani a `mr-Latn`).
- Los mensajes code-mixed reciben una sola etiqueta; no hay etiquetado por palabra.
- Entrada truncada a 64 tokens: para documentos largos hay que clasificar por frases y tomar la mayoria.
- La evaluacion del Test A esta inflada por fuga de datos del split *dev* de Dakshina; usar el Test B como referencia realista.
- La version ONNX int8 coincide con PyTorch en la etiqueta superior en el 97.9% de 4.392 mensajes, por lo que la exactitud real sera ligeramente inferior a las tablas.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos especificos mas alla de los derivados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-chat-lid-small
- Demo en el navegador (Space): https://huggingface.co/spaces/altslate/indic-chat-lid
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio IndicLID (AI4Bharat): https://github.com/AI4Bharat/IndicLID
- Conjunto de datos Dakshina (referenciado en la model card): no disponible enlace directo en la informacion proporcionada
