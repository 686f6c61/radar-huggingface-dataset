# Elfibolt/gonyai-intent-classifier-onnx

## Resumen

Gonyai intent classifier es un clasificador de intenciones ultra-ligero desarrollado por Elfibolt para el asistente de IA en konkani goano (Gonyai). Su funcion es actuar como enrutador previo a un LLM principal: clasifica la consulta del usuario en una de cuatro categorias (WEATHER, NEWS, CONTEXT o DIRECT) para decidir si es necesario recuperar informacion externa (meteorologia en tiempo real, noticias, o documentos del usuario) e inyectarla en el contexto del modelo generativo antes de responder.

El modelo se distribuye exclusivamente en formato ONNX con un peso de 2,00 MB y esta disenado para inferencia en CPU con latencia inferior a 1 milisegundo. No es un transformer generativo, sino un clasificador de texto ligero que combina un vectorizador de caracteres (HashingVectorizer) con una red neuronal de salida de cuatro clases. Su relevancia radica en que permite construir pipelines RAG con enrutamiento determinista y bajo coste computacional en un idioma de bajos recursos como el konkani en escritura devanagari.

El modelo esta publicado bajo licencia Apache-2.0, no registra descargas ni likes en el momento de la consulta, y su model card documenta una evaluacion sobre 70 prompts adversariales con una puntuacion agregada de 67/70 (95,7 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | clasificador ligero sobre HashingVectorizer (char_wb) + red neuronal ONNX de 4 clases |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificacion por consulta individual; sin ventana documentada) |
| Tipos de cuantizacion | no disponible (pesos ONNX de 2,00 MB, sin variantes cuantizadas publicadas) |
| Idiomas soportados | gom (konkani goano), kok (konkani) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx) + config.json |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura transformer. Segun la model card, la entrada de texto se transforma mediante un `HashingVectorizer` con analisis `char_wb` y un rango de n-gramas configurable (`ngram_min` y `ngram_max` en `config.json`), produciendo un vector de `n_features` dimensiones que alimenta una sesion ONNX Runtime. La salida son logits sobre cuatro clases (`WEATHER`, `NEWS`, `CONTEXT`, `DIRECT`), convertidos a probabilidades mediante softmax en el codigo de ejemplo. El uso de hashing de caracteres evita mantener un vocabulario persistente y permite manejar variaciones morfologicas del konkani en devanagari.

No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado mas alla del entrenamiento del clasificador. La unica evaluacion publicada es un conjunto de 70 prompts adversariales disenados sin palabras clave explicitas, divididos en tres suites (indirectas, trampas entre dominios e idioms ultra-indirectos). No se especifica la innovacion tecnica mas alla de la latencia sub-milisegundo en CPU y la estrategia de fallback a `DIRECT` cuando la confianza cae por debajo de un umbral configurable (0,55 en el ejemplo).

## Capacidades

- Clasificacion de intenciones en konkani (gom, kok) en cuatro categorias: WEATHER, NEWS, CONTEXT y DIRECT.
- Enrutamiento previo a LLM para pipelines RAG: decide si se debe recuperar contexto externo e inyectarlo en una etiqueta `<संदर्भ>`.
- Deteccion de consultas sobre meteorologia en tiempo real, noticias de ultima hora, documentos del usuario y conversacion directa.
- Inferencia en CPU con latencia inferior a 1 milisegundo y huella de 2,00 MB.
- Umbral de confianza configurable para derivar casos dudosos a DIRECT y evitar falsos disparos de API.
- No soporta tool calling nativo, agentes multi-paso, vision, audio ni modo thinking: es exclusivamente un clasificador de texto.
- Capacidad multilingue limitada a konkani en escritura devanagari; no se documenta soporte para otros idiomas.

## Casos de uso

- Enrutamiento RAG en el asistente Gonyai: antes de invocar el LLM principal, el clasificador decide si la consulta requiere recuperacion externa, inyectando el resultado en `<संदर्भ>` solo cuando la intencion es WEATHER, NEWS o CONTEXT.
- Consultas meteorologicas: para preguntas sobre lluvia, temperatura, humedad o estado del mar, el modelo dispara la llamada a una API meteorologica y evita que el LLM alucine datos climaticos.
- Verificacion de noticias locales: cuando el usuario pregunta por cortes de suministro, resultados deportivos o decisiones politicas, el enrutador activa la busqueda de noticias en vivo antes de generar la respuesta.
- Grounding documental: para consultas que referencian facturas, informes de laboratorio, contratos o documentos RTI subidos por el usuario, el modelo deriva a CONTEXT y recupera el fragmento relevante del store RAG.
- Reduccion de costes de API: al clasificar en menos de 1 ms en CPU, evita llamadas innecesarias a servicios externos en conversaciones creativas, recetas, poesia o consejos, que se resuelven como DIRECT.
- Despliegue en dispositivos de bajos recursos: con 2,00 MB y ONNX Runtime en CPU, puede ejecutarse en entornos sin GPU, como servidores modestos o edge devices, manteniendo el pipeline de enrutamiento siempre disponible.
- Filtrado previo en sistemas de atencion al ciudadano en konkani: clasifica consultas entrantes para dirigirlas al flujo adecuado (meteorologia, noticias, documentos) sin exponer el LLM principal a todas las peticiones.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 70 prompts adversariales en konkani, disenados sin palabras clave explicitas:

| Suite | Escenario | Puntuacion |
|---|---|---|
| Suite 1 (Extended) | Preguntas indirectas y negativos dificiles | 20/20 (100,0 %) |
| Suite 2 (Hardcore) | Trampas entre dominios (seguros de inundacion, siembra) | 25/25 (100,0 %) |
| Suite 3 (Nightmare) | Idioms ultra-indirectos (secado de papads, humedad, punto de rocio) | 22/25 (88,0 %) |
| Total adversarial | 70 casos limite | 67/70 (95,7 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con modelos de clasificacion de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU y pesa 2,00 MB en ONNX.
- GPU recomendadas: no requeridas; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con ONNX Runtime compatible sirve, pero no aporta ventaja practica frente a CPU.
- Cabe en cualquier consumer GPU y en practicamente cualquier dispositivo, incluidos entornos edge y contenedores de muy baja memoria.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), integrable en servicios Python con `onnxruntime`, `numpy`, `scikit-learn` y `huggingface_hub` para la descarga de artefactos. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: latencia inferior a 1 milisegundo por consulta en CPU segun la model card; no se publica throughput agregado ni mediciones en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elfibolt/gonyai-intent-classifier-onnx | Clasificador de intenciones ONNX (4 clases, konkani) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Modelos de clasificacion de texto multilingues tipo mBERT/XLM-R fine-tuned | Transformer encoder clasificacion | cientos de millones | 512 tokens tipico | variable | Hugging Face |
| Enrutadores RAG basados en embeddings + similitud coseno | Recuperacion semantica sin entrenamiento supervisado | no aplica | no aplica | variable | Librerias (FAISS, etc.) |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa. La ventaja diferencial del modelo de Elfibolt es su tamano (2,00 MB), latencia sub-milisegundo en CPU y especializacion en konkani; sus alternativas transformer multilingues son mucho mayores y no estan especializadas en este idioma.

## Limitaciones y advertencias

- Idiomas limitados a konkani (gom, kok) en escritura devanagari; no se documenta soporte para ingles, hindi ni otras lenguas.
- Al ser un clasificador de cuatro clases, no genera texto ni razona: cualquier expectativa de uso generativo es inadecuada.
- Riesgo de falsos negativos en consultas muy indirectas o idiomaticas; la Suite 3 obtuvo 22/25 (88,0 %), por debajo de las otras suites.
- La estrategia de fallback a DIRECT con umbral de confianza (0,55 en el ejemplo) puede omitir recuperacion necesaria si el modelo esta poco seguro, priorizando evitar falsos disparos de API.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni evaluacion fuera del conjunto adversarial de 70 prompts.
- No se publican datos sobre robustez ante errores ortograficos, transliteraciones latinizadas del konkani o mezcla de idiomas.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantias de calidad ni mantenimiento del modelo (0 descargas y 0 likes en el momento de la consulta).
- No se dispone de informacion sobre versionado, model card actualizada ni soporte del autor para incidencias en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elfibolt/gonyai-intent-classifier-onnx
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
