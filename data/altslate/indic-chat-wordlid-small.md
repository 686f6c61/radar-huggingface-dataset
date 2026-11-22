# altslate/indic-chat-wordlid-small

## Resumen

Indic Chat Word-level Language ID (small) es un modelo de identificacion de idioma a nivel de palabra desarrollado por el usuario altslate, afinado a partir de jhu-clsp/mmBERT-small. Su tarea es etiquetar cada palabra de un mensaje de chat con el idioma al que pertenece entre trece idiomas indoarios y dravidicos (hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punjabi, urdu, sindhi, sinhala e ingles) mas una clase residual `other`. Resuelve un problema concreto que los clasificadores de idioma a nivel de frase no pueden abordar: los mensajes reales de chat indio mezclan idiomas dentro de la misma frase, alternan entre escritura nativa y romanizada y contienen prestamos del ingles.

El modelo se distribuye en formato safetensors (transformers) y ONNX, con licencia Apache 2.0, y esta pensado para preprocesar texto code-mixed antes de tareas posteriores como normalizacion, traduccion, analisis de sentimiento o enrutado linguistico. Con 140,6 millones de parametros y una ventana de 512 tokens, es lo bastante pequeno para ejecutarse en CPU y en el navegador mediante transformers.js.

Su relevancia actual radica en que cubre doce idiomas indios con etiquetado por palabra y admite mezclas de dos idiomas indios en un mismo mensaje, un escenario para el que, segun el autor, no existe otro modelo abierto comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), tarea de token-classification |
| Parametros totales | 140.646.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length en la tokenizacion); recomendado mensajes de hasta ~100 palabras |
| Tipos de cuantizacion | fp32 (ONNX, 563 MB); int8 dinamico per-channel (ONNX cuantizado, 142 MB) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, sd, si, en, mas clase `other` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small, un encoder ModernBERT multilingue, y se afina como clasificador de tokens (token-classification) con una etiqueta por palabra. La tokenizacion se realiza con `is_split_into_words=True`, tomando la etiqueta del primer sub-token de cada palabra. El entrenamiento utiliza el dataset LingoIITGN/COMI-LINGUA (hindi-ingles, con etiquetas humanas de tres anotadores) junto con datos adicionales de Dakshina (oraciones nativas y romanizaciones humanas) para cubrir el resto de idiomas indios.

Segun la model card, se eliminaron unas 7.500 oraciones del split de entrenamiento de COMI-LINGUA que tambien aparecian en el split de test, para evitar fuga de datos. El autor senala que sin esos datos (su version v1) el rendimiento en texto Devanagari caia drasticamente (0,395), porque COMI-LINGUA etiqueta como ingles las palabras inglesas escritas junto a Devanagari, un patron que los demas datos no ensenaban. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Etiquetado de idioma a nivel de palabra en mensajes de chat, con una etiqueta por palabra entre trece idiomas mas `other`.
- Manejo de texto en escritura nativa (Devanagari, bengali, tamil, etc.) y en texto romanizado (por ejemplo, hinglish: "kal mere interview tha").
- Deteccion de code-mixing y code-switching dentro de una misma frase, incluyendo mezclas de dos idiomas indios (por ejemplo, telugu e hindi).
- Distincion de prestamos del ingles integrados en frases indias, etiquetandolos como `en` segun el criterio de los anotadores de COMI-LINGUA.
- Clasificacion de numeros, puntuacion y otros idiomas no cubiertos en la clase `other`.
- Ejecucion en navegador mediante transformers.js y ONNX, con soporte de cuantizacion int8.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio: es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- Preprocesado de pipelines de PLN multilingue: etiquetar cada palabra de un corpus de chats indios antes de normalizar, traducir o aplicar analisis de sentimiento, de modo que cada segmento se enrute al modelo o al recurso adecuado por idioma.
- Moderacion de contenido en plataformas de mensajeria india: identificar que partes de un mensaje estan en hindi romanizado, en ingles o en otro idioma indio para aplicar filtros o politicas por idioma con precision a nivel de palabra.
- Analitica de conversaciones de atencion al cliente: separar las contribuciones linguisticas de cada mensaje (por ejemplo, 67% hindi y 33% ingles) para medir el grado de code-mixing de los usuarios y adaptar las respuestas.
- Enrutado linguistico en asistentes conversacionales: decidir si una consulta debe procesarse con un modelo entrenado en hindi, tamil o telugu, incluso cuando la consulta mezcla dos idiomas indios en la misma frase.
- Normalizacion de texto romanizado: detectar palabras romanizadas de hindi o urdu para transliterarlas a escritura nativa antes de tareas posteriores, aprovechando que el modelo distingue romanizacion de ingles.
- Etiquetado de datasets para investigacion en code-switching: generar anotaciones por palabra sobre corpus de chat para entrenar o evaluar otros modelos, dado que el modelo admite doce idiomas indios y mezclas.
- Despliegue en el navegador o en dispositivos sin GPU: la variante ONNX int8 de 142 MB permite ejecutar la identificacion de idioma localmente con transformers.js, util para extensiones o aplicaciones web que procesan texto en el cliente.

## Benchmarks y rendimiento

Resultados publicados en la model card (el autor fija la metrica antes de ver resultados):

**Test 1: COMI-LINGUA (etiquetas humanas, hindi-ingles), split de test de LID (4.995 frases Hinglish).**

| Modelo | Palabras hi/en en escritura latina | Todas las palabras hi/en |
|---|---|---|
| PhysicsWallahAI/muril-hinglish-lid (solo hindi-ingles) | 0,875 | 0,888 |
| **este modelo** | **0,904** | **0,899** |

Advertencia del autor: este modelo se entreno con el split de train de COMI-LINGUA (tras eliminar solapamientos con test), mientras que muril-hinglish-lid no. Sin esos datos (v1) el modelo solo alcanzaba 0,395.

**Test 2: mensajes mixtos en 12 idiomas (etiquetas exactas), 3.000 mensajes construidos solo con datos held-out.**

| Mensajes | Precision por palabra | Conjunto de idiomas del mensaje exacto |
|---|---|---|
| Todos (3.000) | 0,953 | 0,875 |
| Con 2 o mas idiomas (1.793) | 0,947–0,964 segun tipo de mezcla | 0,851 |
| Dos idiomas indios | 0,947 | no disponible |

Precision por palabra e idioma: bn 0,96; en 0,98; gu 0,94; hi 0,88; kn 0,97; ml 0,96; mr 0,93; pa 0,94; sd 0,94; si 0,97; ta 0,97; te 0,94; ur 0,90; other 0,99. El autor indica que no existe otro modelo abierto que etiquete palabras en estos doce idiomas ni mezclas de dos idiomas indios, por lo que el test 2 no tiene linea base.

Rendimiento de las variantes ONNX: el modelo fp32 coincide con PyTorch en todas las palabras comprobadas (10.737 palabras del test mixto, 19.700 palabras de COMI). El int8 cuantizado mantiene la precision en romanizado y mezclas (0,956 frente a 0,957) pero pierde unos 6 puntos en el texto Devanagari de COMI-LINGUA (0,846 frente a 0,900 en las primeras 1.000 frases).

## Requisitos de hardware

- VRAM estimada: el modelo fp32 ocupa aproximadamente 563 MB en ONNX y un tamano similar en safetensors (repo de 1,3 GB con todas las variantes); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en todas las GPU consumer actuales, e incluso en CPU y en el navegador.
- Opciones de despliegue: transformers (PyTorch), onnxruntime, transformers.js (probado con la version 4.3.2 en Node), y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de tokens.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|---|
| **altslate/indic-chat-wordlid-small** | 140,6 M | 512 tokens | 12 indios + en + other | Etiquetado por palabra, code-mixing | Apache 2.0 |
| PhysicsWallahAI/muril-hinglish-lid | no disponible | no disponible | Hindi-ingles | Identificacion hindi-ingles | no disponible |
| altslate/indic-chat-lid-small | no disponible | no disponible | 12 indios + en | Una etiqueta por mensaje | Apache 2.0 |

El autor senala que no existe otro modelo abierto que etiquete palabras en estos doce idiomas ni mezclas de dos idiomas indios, por lo que la comparativa directa con alternativas equivalentes no esta disponible. Frente a muril-hinglish-lid, este modelo obtiene 0,904 frente a 0,875 en palabras hi/en en escritura latina, aunque con la advertencia de que se entreno con el split de train de COMI-LINGUA y el otro modelo no.

## Limitaciones y advertencias

- Confusion entre hindi romanizado y urdu: comparten la mayoria de palabras, por lo que las precisiones de hi (0,88) y ur (0,90) son las mas bajas; el autor recomienda agrupar ambas etiquetas cuando el texto es ASCII.
- La cuantizacion int8 pierde unos 6 puntos de precision en texto Devanagari de estilo noticia (COMI-LINGUA); para ese tipo de texto conviene usar fp32.
- El modelo se entreno con el split de train de COMI-LINGUA, lo que puede inflar los resultados en ese benchmark respecto a modelos que no vieron esos datos; el propio autor lo advierte.
- Limite de contexto de 512 tokens y recomendacion de mensajes de hasta unas 100 palabras; el texto mas largo debe dividirse.
- La tokenizacion se hace por espacios, por lo que palabras unidas o puntuacion adherida pueden afectar al etiquetado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de clasificacion erronea en palabras ambiguas o idiomas no cubiertos, que se etiquetan como `other`.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el rendimiento varia por idioma (de 0,88 en hindi a 0,99 en `other`).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base jhu-clsp/mmBERT-small y del dataset COMI-LINGUA.
- Para produccion, validar el rendimiento en el dominio concreto, ya que las metricas publicadas corresponden a dominios de noticias y redes sociales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-chat-wordlid-small
- Demo en el navegador (Space): https://huggingface.co/spaces/altslate/indic-chat-lid
- Modelo a nivel de mensaje: https://huggingface.co/altslate/indic-chat-lid-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset COMI-LINGUA: https://huggingface.co/datasets/LingoIITGN/COMI-LINGUA
- Modelo comparado muril-hinglish-lid: https://huggingface.co/PhysicsWallahAI/muril-hinglish-lid
