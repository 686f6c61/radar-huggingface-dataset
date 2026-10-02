# enzinol/Fred

## Resumen

Fred es un ajuste fino del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario enzinol en HuggingFace. Se trata de un "decision model" de tipo System-1: responde a preguntas tipadas sobre un estado (`choice`, `score`, `noul`) en un único forward pass, y se sirve a través de un endpoint HTTP propio (`/v1/systemone`) del framework lev. El caso de uso central es la detección de fraude y el filtrado de contenido, no la generación de texto abierta.

El modelo combina dos componentes: un adaptador LoRA r16 (alpha 32) aplicado sobre las proyecciones q/k/v/out, `in_proj` y `w1/w2/w3` del backbone, y una cabeza pointer de 6,5 millones de parametros entrenada especificamente para la tarea. El backbone LFM2.5-350M aporta la arquitectura con convoluciones cortas caracteristica de la familia LFM2.

Es relevante ahora porque demuestra que un modelo de 350M de parametros puede alcanzar metricas competitivas en tareas de clasificacion binaria y multietiqueta (AUROC 0,947 en deteccion de ofertas de empleo fraudulentas) con un coste de entrenamiento minimo: 2 epocas, 80 minutos en GPU Apple M-series y 13.442 filas. No obstante, esta estrictamente limitado a cuatro tareas concretas de clasificacion y no es compatible con llama.cpp ni con el ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM2.5-350M (convoluciones cortas) + adaptador LoRA + cabeza pointer |
| Parametros totales | 350M (backbone) + 6,5M (cabeza pointer); parametros del adaptador LoRA no especificados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 400 tokens (limite impuesto por lev, se truncan silenciosamente) |
| Tipos de cuantizacion | no disponible (no es un GGUF; no soportado por llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); el codigo de lev es Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), head.pt (pickle de PyTorch, cargar con `weights_only=True`) |

## Arquitectura y entrenamiento

Fred se construye sobre el backbone LiquidAI/LFM2.5-350M (revision `9e6c6ccf`, 710 MB), una arquitectura de la familia LFM2 que emplea convoluciones cortas con un enrutado interno mediante "prev pointer". Sobre ese backbone se anade un adaptador LoRA r16 con alpha 32 aplicado a las proyecciones q/k/v/out, `in_proj` y `w1/w2/w3`, mas una cabeza pointer de 6,5M de parametros que genera la respuesta tipada. El modelo procesa el estado de entrada y devuelve una respuesta en un unico forward pass, sin decodificacion autoregresiva de tokens de texto.

El entrenamiento se realizo con `lev.train` durante 2 epocas, con learning rate 2e-4 y el parametro `--perm_kl 0.1`, sobre GPU Apple M-series (MPS), en aproximadamente 80 minutos. Los objetivos eran etiquetas one-hot de los datasets, sin modelo maestro ni destilacion. Los datos proceden de cuatro fuentes publicas que suman 13.442 filas: EMSCAD fake job postings (tarea `noul`, licencia CC0-1.0), PhishNChips `core` (tarea `noul`, licencia de investigacion en seguridad), Twitter financial news topics (tarea `choice`, 20 clases, licencia MIT) y App reviews (tarea `score`, 1 a 5 estrellas, licencia desconocida). Cada estado se recorto al limite de 400 tokens de lev; el 97% de las filas de ofertas falsas fueron truncadas.

## Capacidades

- Clasificacion binaria de fraude: determina si una oferta de empleo es fraudulenta (salida de tipo `noul`).
- Deteccion de phishing: clasifica si un correo electronico es de phishing (salida `noul`).
- Clasificacion multietiqueta de temas: asigna uno de 20 temas a noticias financieras de Twitter (salida `choice`).
- Puntuacion ordinal: predice la valoracion de 1 a 5 estrellas en resenas de aplicaciones (salida `score`).
- Respuesta tipada en un solo forward pass: no genera texto libre, sino etiquetas estructuradas sobre un estado de entrada.
- Servido como API HTTP: expone un endpoint `/v1/systemone` que recibe un JSON con `state` y `questions` y devuelve la respuesta tipada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha medido su comportamiento fuera de las cuatro tareas de entrenamiento.

## Casos de uso

- Filtrado de ofertas de empleo fraudulentas: integrado en un portal de empleo, el modelo clasifica cada publicacion entrante como fraudulenta o legitima. Con AUROC 0,947 y capacidad de capturar el 80,1% del fraude a un 5% de falsos positivos, es adecuado como primera capa de triaje antes de la revision humana.
- Deteccion de correos de phishing: en una pasarela de correo corporativa, el modelo marca mensajes sospechosos para bloquearlos o enviarlos a cuarentena. Su entrenamiento sobre PhishNChips lo orienta a evaluacion defensiva.
- Etiquetado automatico de noticias financieras: clasificacion de flujos de titulares en 20 categorias tematicas (accuracy 0,873) para alimentar sistemas de agregacion o alertas sectoriales.
- Analisis de sentimiento ordinal en resenas: prediccion de la valoracion por estrellas (QWK 0,737) para priorizar resenas negativas en equipos de soporte o moderacion.
- Punto de partida para ajuste fino propio: dado su bajo coste de entrenamiento (80 minutos, LoRA r16), sirve como plantilla para equipos que quieran entrenar un clasificador de decision rapido sobre sus propias etiquetas.
- Investigacion sobre modelos de decision pequenos y rapidos: util como banco de pruebas academico para evaluar arquitecturas de clasificacion de baja latencia (aproximadamente 90 ms por peticion).
- Capa de pre-filtrado en pipelines antifraude mas amplios: al ser un modelo de 350M con latencia baja, puede colocarse delante de modelos mayores que solo se invocan sobre los casos dudosos.

## Benchmarks y rendimiento

Evaluacion sobre el 20% reservado de cada dataset (resultados en distribucion, mismas fuentes que el entrenamiento):

| Dataset | Metrica | Fred | lev-350m sin entrenar |
|---|---|---|---|
| Fake jobs (4,9% fraude, 3.510 filas) | PR-AUC | 0,728 | 0,079 |
| Fake jobs | Fraude detectado a 5% FPR | 0,801 | 0,023 |
| Fake jobs | AUROC | 0,947 | 0,615 |
| News topics (3.749 filas) | Accuracy | 0,873 | 0,338 |
| App reviews (1.947 filas) | QWK | 0,737 | 0,699 |
| App reviews | MAE (menor es mejor) | 0,677 | 1,015 |

El phishing se excluye de la tabla porque sus clases son separables mediante artefactos superficiales, lo que hace que las puntuaciones en esa tarea (AUROC 1,000) no sean informativas. La latencia medida fue de aproximadamente 90 ms por peticion en Apple Silicon (Metal), enviando las peticiones de una en una.

## Requisitos de hardware

- VRAM estimada: el backbone pesa 710 MB en precision original; con el adaptador y la cabeza pointer el conjunto es inferior a 1 GB, por lo que cabe en cualquier GPU consumer con al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon), CUDA o MPS. El entrenamiento original se hizo en Apple M-series (MPS).
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060 o superior, Apple Silicon, etc.).
- Opciones de despliegue: exclusivamente el servidor PyTorch propio de lev (`python -m lev.serve`). No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que ni el enrutado "prev pointer" de las convoluciones cortas de LFM2 ni la cabeza pointer estan implementados en esos runtimes. El modelo `ggml-org/lev-GGUF` es un modelo distinto (InterfazeAI lev-4B) y no debe confundirse con Fred.
- Latencia y throughput: aproximadamente 90 ms por peticion en Apple Silicon (Metal), con peticiones secuenciales. No se ha publicado throughput en lote.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la informacion proporcionada. La unica referencia cuantitativa disponible es el backbone sin entrenar:

| Modelo | Parametros | Contexto | AUROC (fake jobs) | Accuracy (news topics) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fred | 350M + 6,5M (cabeza) | 400 tokens | 0,947 | 0,873 | LFM Open License v1.0 | HuggingFace (adapter + head) |
| lev-350m sin entrenar | 350M | 400 tokens | 0,615 | 0,338 | LFM Open License v1.0 | referencia base |

No se dispone de datos de otras alternativas de clasificacion de fraude de tamano similar para establecer una comparativa adicional.

## Limitaciones y advertencias

- Sesgos conocidos: la senal de fraude proviene de anuncios de empleo de 2012-2014 (EMSCAD) y de un benchmark de phishing; se espera deriva (drift) en otros dominios y frente a estafas mas recientes.
- Riesgo de alucinacion: el modelo no genera texto libre, pero puede producir clasificaciones erroneas con alta confianza; las probabilidades servidas usan `LEV_TEMPERATURE=1` y deben recalibrarse con una temperatura propia sobre datos etiquetados antes de usarlas como umbral.
- Limitacion de contexto: lee unicamente los primeros 400 tokens de cada estado, de forma silenciosa. Los documentos o sesiones mas largos pierden toda la informacion posterior a ese limite (el 97% de las filas de ofertas falsas fueron truncadas en entrenamiento).
- Ambito no probado: no se ha medido el comportamiento con preguntas fuera de las cuatro tareas de entrenamiento.
- Uso no recomendado: no debe usarse para decisiones automatizadas sin supervision sobre personas (contratacion, credito, cierre de cuentas) sin revision humana y validacion propia.
- Restricciones de licencia: el adaptador deriva de LiquidAI/LFM2.5-350M y hereda su LFM Open License v1.0, cuyos terminos incluyen condiciones de uso comercial que deben revisarse. El codigo de lev es Apache-2.0. Ademas, deben comprobarse las licencias de los datasets de entrenamiento (PhishNChips esta restringido a investigacion en seguridad y evaluacion defensiva; la licencia de App reviews es desconocida).
- Restriccion de despliegue: no es compatible con llama.cpp ni con runtimes GGUF estandar; requiere el servidor PyTorch de lev, lo que limita su integracion en infraestructuras habituales de inferencia.
- Formato de la cabeza pointer: `head.pt` es un pickle de PyTorch y debe cargarse con `weights_only=True` por seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enzinol/Fred
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio de lev: https://github.com/franckverrot/lev
- Dataset EMSCAD fake job postings: https://huggingface.co/datasets/victor/real-or-fake-fake-jobposting-prediction
- Dataset PhishNChips: https://huggingface.co/datasets/AreLit/PhishNChips
- Dataset Twitter financial news topics: https://huggingface.co/datasets/zeroshot/twitter-financial-news-topic
- Dataset App reviews: https://huggingface.co/datasets/sealuzh/app_reviews
