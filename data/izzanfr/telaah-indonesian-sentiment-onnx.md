# izzanfr/telaah-indonesian-sentiment-onnx

## Resumen

`izzanfr/telaah-indonesian-sentiment-onnx` es una version cuantizada en formato ONNX del modelo `w11wo/indonesian-roberta-base-sentiment-classifier`, desarrollado originalmente por Wilson Wongso. Se trata de un clasificador de sentimiento en indonesio con tres etiquetas (0 = positivo, 1 = neutro, 2 = negativo), convertido a ONNX y cuantizado dinamicamente a int8 por canal para poder ejecutarse directamente en el navegador mediante Transformers.js. El autor de la conversion es izzanfr, y el modelo se utiliza en la aplicacion Telaah AI, orientada al analisis de comentarios de participantes en formaciones.

La arquitectura subyacente es RoBERTa base, un transformer encoder con tarea de clasificacion de secuencias. El modelo resultante ocupa 126 MB y pesa aproximadamente ocho veces menos que la version original en fp32, lo que lo hace apto para entornos sin GPU, incluido el navegador con aceleracion WASM. Esta orientado a inferencia local y privada: segun el repositorio Telaah-AI, ningun dato sale del cliente.

Su relevancia actual radica en dos factores. Primero, demuestra que un clasificador de sentimiento en un idioma de recursos medios (indonesio) puede desplegarse en el navegador con una perdida de precision nula respecto al modelo original (incluso una ligera mejora en la evaluacion realizada). Segundo, ilustra un flujo de trabajo reproducible: modelo PyTorch en HuggingFace, conversion con Optimum a ONNX, cuantizacion dinamica int8 y publicacion para Transformers.js. La model card advierte de un detalle critico: el modelo no utiliza tokens especiales (`<s>` / `</s>`), por lo que la tokenizacion debe invocarse con `add_special_tokens: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder) para clasificacion de secuencias |
| Parametros totales | No especificado en la informacion disponible; la arquitectura RoBERTa base suele tener ~125 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada de forma explicita; RoBERTa base admite 512 tokens. El ejemplo del autor usa `max_length: 510` con truncacion |
| Tipos de cuantizacion | Int8 dinamica per-channel (AVX2); existe el archivo `onnx/model_quantized.onnx` |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 126 MB); libreria asociada: transformers.js |

## Arquitectura y entrenamiento

El modelo es un encoder tipo RoBERTa adaptado a clasificacion de sentimiento, con tres clases de salida. La version publicada en este repositorio no se ha reentrenado: es una conversion directa del checkpoint original de Wilson Wongso mediante `optimum` a ONNX, seguida de una cuantizacion dinamica int8 per-channel. Segun la model card, los pesos no se han modificado mas alla de la cuantizacion.

El modelo original fue afinado sobre el corpus SmSA (Sentiment Analysis) del conjunto `indonlp/indonlu`, compuesto por resenas y comentarios generales en indonesio. Un detalle tecnico relevante es que el tokenizador asociado no incorpora tokens especiales de inicio y fin de secuencia: su post-procesador es unicamente ByteLevel. Esto implica que, a diferencia de la mayoria de modelos RoBERTa, no deben anadirse `<s>` ni `</s>`, y que el rendimiento cae de forma medible si se anaden (91,0% de precision con tokens especiales frente a 93,4% sin ellos).

La cuantizacion empleada es dinamica y calcula rangos por lote, lo que segun el autor puede afectar a la determinacion si se procesan varios textos a la vez. Por eso la model card recomienda procesar un unico texto por inferencia.

## Capacidades

- Clasificacion de sentimiento en indonesio con tres etiquetas: 0 = positivo, 1 = neutro, 2 = negativo.
- Analisis de resenas y comentarios de texto corto y medio en indonesio.
- Inferencia en navegador mediante Transformers.js con backend WASM.
- Ejecucion en CPU sin necesidad de GPU ni de servicios en la nube.
- Integracion en aplicaciones web con procesamiento local (los datos no se envian a un servidor).
- Uso combinado con un lexico externo: el pipeline de Telaah AI combina el modelo con un lexico adicional para el analisis de comentarios de formacion.
- No genera texto: es exclusivamente un clasificador.
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito.
- Capacidad multilingue limitada al indonesio.

## Casos de uso

- Analisis de sentimiento en aplicaciones web sin backend: el modelo se carga en el navegador con Transformers.js y clasifica cada comentario localmente, de modo que el texto del usuario nunca abandona el dispositivo. Es adecuado para productos con requisitos estrictos de privacidad.
- Analisis de comentarios de formacion: es el caso de uso original del proyecto Telaah AI, que evalua la retroalimentacion de participantes en cursos y clasifica cada comentario en positivo, neutro o negativo. El autor reporta una precision del 87,8% en 90 comentarios reales al combinar el modelo con un lexico.
- Monitorizacion de resenas de producto o aplicacion en indonesio: se puede integrar en un pipeline que reciba resenas y agregue la distribucion de sentimiento por periodo o por version de producto.
- Moderacion y triaje de comentarios en foros o redes: clasificacion automatica de mensajes negativos para priorizar la revision humana, con la ventaja de que el contenido sensible no sale del cliente.
- Enriquecimiento de encuestas de satisfaccion (NPS, CSAT) con respuestas abiertas en indonesio: clasificar cada respuesta abierta y correlacionarla con la puntuacion numerica.
- Analisis de sentimiento en el navegador para herramientas internas: dashboards o extensiones que necesiten clasificar texto sobre la marcha sin depender de una API externa ni de conectividad.
- Prototipado rapido de funcionalidades de NLP en indonesio: al ocupar 126 MB y ejecutarse sobre WASM, sirve para validar una idea de producto antes de invertir en infraestructura de servidor.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test SmSA (500 frases):

| Version | Precision | Macro-F1 |
|---|---|---|
| Original (PyTorch fp32) | 93,2% | 91,0 |
| ONNX int8, sin tokens especiales | 93,4% | 91,2 |
| ONNX int8, con tokens especiales | 91,0% | 86,6 |

Dato adicional: sobre 90 comentarios reales de formacion, el pipeline completo de Telaah AI (modelo mas lexico) alcanza un 87,8% de precision.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y no serian aplicables dado que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- El archivo cuantizado ocupa 126 MB, por lo que el modelo completo cabe comodamente en memoria en practicamente cualquier dispositivo.
- Inferencia en CPU: funciona sin GPU gracias al backend WASM de Transformers.js.
- Inferencia en navegador: cualquier equipo con un navegador moderno compatible con WASM y, preferiblemente, con soporte AVX2 (la cuantizacion se optimizo para AVX2).
- No requiere GPU dedicada. Se puede ejecutar en portatiles, moviles y equipos de gama baja.
- Opciones de despliegue: Transformers.js en navegador (caso de uso documentado), ONNX Runtime Web, ONNX Runtime (Python/C++) en servidor. Frameworks como vLLM, TGI o llama.cpp no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card recomienda procesar un texto por inferencia para obtener puntuaciones deterministas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Precision (SmSA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| izzanfr/telaah-indonesian-sentiment-onnx | RoBERTa base, ONNX int8 | No disponible (~125 M estimados) | 512 tokens (uso recomendado: 510) | 93,4% / Macro-F1 91,2 | MIT | HuggingFace, orientado a Transformers.js |
| w11wo/indonesian-roberta-base-sentiment-classifier | RoBERTa base, PyTorch fp32 | No disponible | 512 tokens | 93,2% / Macro-F1 91,0 | MIT | HuggingFace |
| taufiqdp/indonesian-sentiment | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |

Las tres opciones resuelven la misma tarea (analisis de sentimiento en indonesio). La diferencia principal de la version de izzanfr es el formato: al estar en ONNX int8, se puede ejecutar en el navegador y en entornos sin GPU, con una precision practicamente identica a la del modelo original en PyTorch. Los datos de `taufiqdp/indonesian-sentiment` no estaban disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio de entrenamiento limitado: el modelo se entreno sobre resenas y comentarios generales (SmSA), no especificamente sobre retroalimentacion de formacion. El autor indica que este es un factor de perdida de rendimiento en ese dominio concreto.
- Sarcasmo y frases mixtas: las oraciones que combinan elogios y quejas, o que emplean ironia, son la principal fuente de error segun la propia model card.
- Muy sensible al tokenizado: debe usarse `add_special_tokens: false`. Anadir `<s>` / `</s>` degrada la precision del 93,4% al 91,0% y el macro-F1 de 91,2 a 86,6.
- Determinismo dependiente del lote: al emplear cuantizacion dinamica, los rangos se calculan por lote; se recomienda procesar un texto por inferencia para obtener resultados reproducibles.
- Clasificador, no generador: no produce texto ni razona; solo asigna una de tres etiquetas.
- Cobertura linguistica: unicamente indonesio. No hay soporte documentado de otros idiomas, incluido el castellano.
- Alcance de la clasificacion: tres clases (positivo, neutro, negativo), sin granularidad de emociones ni puntuacion de intensidad.
- Uso comercial: la licencia MIT es permisiva y permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar la licencia del modelo base, que la model card tambien declara como MIT.
- Escasa adopcion: 13 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad amplia que haya validado el modelo en produccion.
- Datos de benchmark limitados: las cifras de precision proceden de evaluaciones realizadas por el propio autor (500 frases de test y 90 comentarios reales), no de una evaluacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/izzanfr/telaah-indonesian-sentiment-onnx
- Modelo base: https://huggingface.co/w11wo/indonesian-roberta-base-sentiment-classifier
- Repositorio de la aplicacion Telaah AI: https://github.com/izzanfr/Telaah-AI
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Conjunto de datos indonlu (IndoNLU): https://huggingface.co/datasets/indonlp/indonlu
- Modelo alternativo taufiqdp/indonesian-sentiment: https://huggingface.co/taufiqdp/indonesian-sentiment
- ONNX (formato y ecosistema): https://onnx.ai/
- ONNX Runtime, catalogo de modelos: https://onnxruntime.ai/models
- ONNX Model Zoo: https://github.com/onnx/models
