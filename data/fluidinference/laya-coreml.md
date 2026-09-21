# FluidInference/laya-coreml

## Resumen

laya-coreml es la conversión a Core ML de laya-multilingual, un modelo de decisión desarrollado por Convai Innovations que FluidInference ha portado al ecosistema de Apple. No es un modelo generativo: se trata de un encoder mmBERT-base de 322 millones de parámetros con una cabeza de decisión tipada que responde preguntas de tipo `choice`, `score` y `noul` sobre un estado textual en un único forward pass, devolviendo probabilidades calibradas y ningún token generado. Los pesos son idénticos a los de `convaiinnovations/laya` (`multilingual/`, revisión `1c5edc17a7acd8701df6fc341c0d179f1c62c982`).

El problema que resuelve es el de la toma de decisiones rápida y local: en lugar de invocar un LLM autorregresivo para clasificar, enrutar o evaluar un texto, laya-coreml ofrece latencias de milisegundos en Apple Silicon (3,6 ms por pregunta en el bucket de 128 tokens y 17,9 ms en el de 1024, medidos en un M5 Pro) con una precisión que iguala o supera a la referencia PyTorch en las suites publicadas.

Su relevancia actual radica en que permite ejecutar clasificación y enrutado de agentes completamente en el dispositivo, sin GPU dedicada y sin coste de API, integrado en aplicaciones macOS 14+ a través de la librería FluidUse. El repositorio ocupa 4,4 GB e incluye buckets de longitud 128, 256, 512 y 1024 tokens, en fp16 y en una variante con tabla de embeddings int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer mmBERT-base con cabeza de decision tipada (no generativa) |
| Parametros totales | 322 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1024 tokens (buckets de 128, 256, 512 y 1024; `max_len` upstream = 1024) |
| Tipos de cuantizacion | fp16 (buckets completos) e int8 solo en la tabla de embeddings (variantes `e8`); int8 en pesos del encoder y paletas de 6/4 bits descartadas por fallar las puertas de paridad |
| Idiomas soportados | No disponible (el nombre `multilingual` y el vocabulario mmBERT/Gemma de 256k tokens apuntan a cobertura multilingue, pero la ficha no detalla la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), fp16 e int8-embeddings |
| Biblioteca | coreml |
| Tamano total del repositorio | 4,4 GB |
| Slots de opciones | 32 |
| Tipo de pregunta | `choice`, `score`, `noul` (vector `question_type` de 3 clases) |
| Entradas | `input_ids` int32 [1, L], `attention_mask` int32 [1, L], `marker_map` float32 [1, 32, L], `question_type` float32 [1, 3] |
| Salidas | `logits` [1, 32], `probabilities` [1, 32], `action_probabilities` [1, 2] |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer mmBERT-base de 322 millones de parámetros al que se le acopla una cabeza de decisión tipada. En lugar de generar texto de forma autorregresiva, el modelo procesa un formato de secuencia fijo —`[CLS] <type> question: <instructions> [SEP] ([MASK] <option>)* [SEP] <state> [SEP]`— y produce, en un solo paso, logits y probabilidades para hasta 32 opciones, además de un vector de probabilidades de acción de 2 clases. La posición de cada `[MASK]` se codifica mediante el tensor `marker_map` (one-hot por opción), lo que permite al modelo puntuar cada alternativa de manera independiente dentro del mismo forward pass.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que la ficha se centra en la conversión y no en el entrenamiento. La innovación técnica de esta versión es de despliegue: buckets de longitud fija que FluidUse selecciona dinámicamente escogiendo el más pequeño que encaje con el prompt y truncando el estado por la derecha en el mayor; una tabla de embeddings cuantizada a int8 por canal que reduce cada bucket a 448–453 MB con una pérdida de precisión inferior a 0,5 puntos frente a fp16; y una asignación de unidades de cómputo por bucket (la Neural Engine es más rápida en 128 tokens, mientras que la GPU gana en 512 y 1024). La conversión mantiene paridad estricta con PyTorch FP32: 16/16 coincidencias de argmax en 16 preguntas de verificación, con un error máximo de probabilidad de 0,0021 en modo `ALL` y 0,0126 en `CPU_AND_NE`.

## Capacidades

- Decisión sobre texto en un único forward pass: responde preguntas de selección (`choice`) entre hasta 32 opciones, de puntuación (`score`) y binarias de probabilidad (`noul`, que devuelve P(true)).
- Salida de logits, probabilidades calibradas por opción y `action_probabilities` de 2 clases, sin generar tokens.
- Clasificación de noticias (`jev.ag_news`), emoción (`jev.emotion`) e intención conversacional (`massive_intent.en`).
- Triage de soporte, filtrado de spam, detección de phishing, moderación de toxicidad, guardrails frente a jailbreak y evaluación de relevancia en pipelines RAG.
- Enrutado de modelos o de dominios (suite `app.model_routing_domain`).
- Capacidad multilingüe declarada por el nombre del modelo base, aunque la lista concreta de idiomas no está disponible en la información proporcionada.
- Integración con aplicaciones Swift mediante FluidUse (`LayaManager`), con ejemplos de uso en CLI y en demos SwiftUI.
- Ejecución en dispositivo sobre CPU, GPU y Neural Engine de Apple Silicon, con selección automática de bucket.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo recibe el mensaje del usuario como estado y una pregunta `choice` con opciones como `refund|order status|technical help` (el ejemplo oficial de la ficha), devolviendo la probabilidad de cada una en menos de 4 ms en el bucket de 128 tokens.
- Triage automático de tickets de soporte: usando la suite `app.support_triage` (0,542 de precisión en Core ML) el modelo puede priorizar y enrutar incidencias hacia el equipo adecuado directamente en la aplicación de escritorio, sin enviar datos a la nube.
- Filtrado de correo no deseado y phishing: con 0,993 de precisión en `app.email_spam` y `app.phishing`, es adecuado para un clasificador previo en clientes de correo que deba funcionar de forma local y con latencia despreciable.
- Guardrails para aplicaciones basadas en LLM: la suite `app.guardrails_jailbreak` alcanza 0,808 en Core ML, de modo que el modelo puede actuar como comprobador de seguridad antes de que un prompt llegue al modelo generativo.
- Moderación de contenido y toxicidad: con 0,535 en `app.moderation_toxicity`, sirve como primera capa de filtrado en foros o chats, combinado con revisión humana dado el margen de error.
- Relevancia en pipelines RAG: la suite `app.rag_relevance` (0,672) permite decidir si un fragmento recuperado es relevante para la consulta antes de pasarlo al generador, reduciendo coste y ruido en el contexto.
- Enrutado de modelos por dominio: con 0,441 en `app.model_routing_domain` y 0,657 en `massive_intent.en`, puede derivar peticiones al modelo especializado correspondiente en una arquitectura multi-modelo.
- Análisis de sentimiento y emoción: con 0,537 en `jev.emotion` y 0,935 en `jev.ag_news`, es utilizable para monitorización de opinión o categorización temática de flujos de noticias.
- Decisión en agentes y videojuegos: el repositorio incluye un ejemplo de Tetris headless (`swift run -c release FluidUseLaya tetris`) donde cada decisión de colocación la resuelve el modelo mediante preguntas `noul` como «¿es esta una colocación limpia?».
- Asistentes de voz o de escritorio en dispositivo: con una latencia mediana de 5,2 ms por pregunta (p95 de 18 ms sobre 3.899 preguntas), encaja en bucles interactivos donde no es viable llamar a un servicio externo.

## Benchmarks y rendimiento

Precisión comparada entre la referencia upstream en PyTorch sobre una T4 y los buckets de Core ML en un M5 Pro, sobre 3.899 preguntas (semilla 13):

| Suite | Upstream (T4, PyTorch) | Core ML (M5 Pro) |
|---|---:|---:|
| jev.ag_news | 0,930 | 0,935 |
| jev.emotion | 0,530 | 0,537 |
| massive_intent.en | 0,657 | 0,657 |
| app.support_triage | 0,522 | 0,542 |
| app.email_spam | 0,993 | 0,993 |
| app.phishing | 0,993 | 0,993 |
| app.guardrails_jailbreak | 0,755 | 0,808 |
| app.moderation_toxicity | 0,525 | 0,535 |
| app.rag_relevance | 0,657 | 0,672 |
| app.model_routing_domain | 0,123 | 0,441 |

Latencia por pregunta en caliente (Apple M5 Pro, macOS 27.0):

| Bucket | CPU + ANE | Todas las unidades |
|---|---:|---:|
| L128 | 3,6 ms | 3,9 ms |
| L256 | 9,9 ms | 5,2 ms |
| L512 | 27,5 ms | 9,0 ms |
| L1024 | 80,1 ms | 17,9 ms |

Paridad frente al runtime PyTorch FP32 sin modificar: 16 de 16 coincidencias de argmax en todos los buckets y configuraciones de unidades de cómputo, con un error máximo de probabilidad de 0,0021 (`ALL`) y 0,0126 (`CPU_AND_NE`). La latencia mediana global es de 5,2 ms por pregunta, con p95 de 18 ms. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, que no aplican a este modelo.

## Requisitos de hardware

- Ejecución exclusiva sobre Core ML en Apple Silicon con macOS 14 o superior; no hay soporte documentado para CUDA, ROCm ni aceleradores no Apple.
- Cada bucket fp16 ocupa 614 MB, de los cuales 393 MB corresponden a la tabla de embeddings; las variantes `e8` con embeddings int8 ocupan entre 448 y 453 MB.
- El repositorio completo suma 4,4 GB, pero FluidUse descarga y carga únicamente los buckets que necesita (por ejemplo, los de 128 y 512 tokens más el `tokenizer.json`).
- No requiere GPU dedicada: aprovecha la Neural Engine, la CPU y la GPU integradas del SoC. En L128 y L256 la combinación CPU + ANE es la más rápida, mientras que en L512 y L1024 la GPU supera a la ANE.
- Rendimiento medido en un Apple M5 Pro: 3,6–80,1 ms por pregunta según bucket y unidad de cómputo (véase la tabla de latencia anterior).
- Opciones de despliegue: la librería FluidUse (`LayaManager`) en Swift, con ejemplos de CLI (`FluidUseLaya answer`, `FluidUseLaya tetris`) y demo de SwiftUI (`LayaTetrisDemo`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al ser un artefacto Core ML.
- Throughput y latencia en hardware distinto del M5 Pro: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento / notas |
|---|---:|---:|---|---|---|
| FluidInference/laya-coreml | 322 M | 1024 tokens (buckets 128/256/512/1024) | Core ML (fp16 e int8-embeddings) | Apache-2.0 | Igual o superior al upstream en todas las suites; latencia mediana de 5,2 ms en M5 Pro |
| convaiinnovations/laya (upstream) | 322 M | 1024 tokens | PyTorch / safetensors (no confirmado en la informacion disponible) | Apache-2.0 | Referencia; medido en T4 en las suites publicadas |
| Otros clasificadores encoder de tamano similar (mmBERT-base, ModernBERT, DeBERTa-v3) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparación directa más fiable es contra los pesos upstream de Convai Innovations, de los que esta conversión no modifica ningún valor: las diferencias de precisión observadas (por ejemplo, 0,441 frente a 0,123 en `app.model_routing_domain`, o 0,808 frente a 0,755 en `app.guardrails_jailbreak`) se deben al entorno de ejecución y a la implementación, no a un reentrenamiento.

## Limitaciones y advertencias

- Dependencia total del ecosistema Apple: solo funciona vía Core ML en macOS 14+ sobre Apple Silicon; no es desplegable en Linux, Windows ni servidores con GPU NVIDIA.
- Modelo no generativo: no produce texto ni razonamiento en lenguaje natural, únicamente logits, probabilidades por opción (máximo 32) y probabilidades de acción.
- Rendimiento bajo en varias suites: 0,441 en `app.model_routing_domain`, 0,535 en `app.moderation_toxicity`, 0,537 en `jev.emotion` y 0,542 en `app.support_triage`. Estas cifras desaconsejan su uso en producción sin una capa de validación adicional.
- Las métricas publicadas provienen de una única ejecución sobre 3.899 preguntas con semilla 13; no se ofrecen intervalos de confianza ni variabilidad entre ejecuciones.
- Truncado por la derecha en el bucket de 1024 tokens: los estados más largos que ese límite pierden información, lo que puede degradar la respuesta.
- No se documentan sesgos conocidos ni evaluaciones de equidad; tampoco una lista explícita de idiomas soportados más allá del nombre `multilingual`.
- Riesgo de alucinación acotado: al no generar texto no puede inventar contenido, pero sus probabilidades pueden no estar bien calibradas fuera de la distribución de entrenamiento.
- Cuantizaciones adicionales no disponibles: el int8 en pesos del encoder y las paletas de 6 y 4 bits no se publican porque no superan las pruebas de paridad, especialmente en la Neural Engine.
- Es una conversión independiente de FluidInference, no un lanzamiento oficial de Convai Innovations.
- Adopción prácticamente nula en el momento de redactar esta ficha: 0 descargas y 2 «likes» en Hugging Face, sin validación por parte de la comunidad.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar los términos del modelo base y de las dependencias (FluidUse, mobius) antes de integrarlo en un producto.
- Los resultados de la búsqueda web no aportaron información técnica relevante sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/laya-coreml
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Librería FluidUse: https://github.com/FluidInference/FluidUse
- Pipeline de conversión, informes de verificación y fixtures de paridad en Swift: https://github.com/FluidInference/mobius
- Repositorio upstream de Convai Innovations: https://github.com/NandhaKishorM/laya
