# gagarang/router-intencion-cab-mdeberta

## Resumen

El modelo `gagarang/router-intencion-cab-mdeberta` es un clasificador de intenciones de texto desarrollado por el usuario gagarang como prototipo academico para la Maestria en Inteligencia Artificial de Tecmilenio. Se trata de un ajuste fino (fine-tuning) del modelo `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli`, que a su vez deriva de la arquitectura DeBERTa-v2, y su proposito es enrutar los mensajes de clientes B2B de la empresa ficticia Componentes Automotrices del Bajio (CAB) hacia cinco categorias de intencion: estatus de pedido, fecha de entrega, queja, contactar con ejecutivo y otros. El modelo decide si el chatbot responde de forma automatica o escala la conversacion a un ejecutivo humano.

Con 278.813.189 parametros (aproximadamente 279 millones), se trata de un modelo encoder de tamano base, disenado exclusivamente para clasificacion de secuencias y no para generacion de texto. Su relevancia radica en que ejemplifica el patron de "router de intenciones" en pipelines de atencion al cliente: un modelo pequeno y rapido (latencia mediana de 67,1 ms en CPU) que filtra y deriva conversaciones antes de invocar modelos generativos mas costosos. El modelo soporta espanol e ingles, se distribuye bajo licencia MIT y ocupa apenas 0,6 GB en el repositorio.

Es importante subrayar que se trata de un prototipo academico con datos simulados: los mensajes de CAB son ficticios y la prueba externa fue escrita por el propio autor, por lo que los resultados reportados deben interpretarse como una validacion preliminar y no como evidencia de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer), ajustado desde `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` |
| Parametros totales | 278.813.189 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se guardan en 16 bits y se recomienda cargarlos en 32 bits (`dtype=torch.float32`) para CPU |
| Idiomas soportados | espanol (es), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en DeBERTa-v2, con la cabeza de clasificacion de secuencias adaptada a cinco etiquetas de intencion. Parte del checkpoint `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli`, un modelo multilingue entrenado originalmente para inferencia de lenguaje natural (NLI), lo que le proporciona una base de representacion semantica multilingue sobre la que se realizo el ajuste fino supervisado para la tarea de enrutamiento.

El entrenamiento utilizo el conjunto `data-v3.0.0`, compuesto por una muestra del dataset Bitext (licencia CDLA-Sharing-1.0) mas mensajes simulados de CAB en espanol e ingles. Los hiperparametros reportados son: learning rate 2e-05, tamano de lote 8, 3 epocas, weight decay 0.01, label smoothing 0.1 y semilla 42. El commit de entrenamiento fue `082d216dab11ca738add440bfd7b9d4ee45bab64` con arbol limpio. Tras el ajuste se aplico una calibracion de temperatura de 0.5902 y se fijo un umbral de confianza de 0.9: si la prediccion no alcanza ese umbral, el sistema pregunta al usuario o escala la conversacion, lo que constituye un mecanismo de abstenccion relevante para produccion.

## Capacidades

- Clasificacion de texto en cinco intenciones: `estatus_orden`, `fecha_entrega`, `queja`, `contactar_ejecutivo` y `otro`.
- Enrutamiento de conversaciones: determina si el chatbot responde de forma automatica o escala a un ejecutivo humano.
- Clasificacion multilingue en espanol e ingles, incluyendo mensajes mixtos (code-switching).
- Mecanismo de abstenccion por umbral de confianza calibrado (0.9), que permite derivar casos ambiguos en lugar de forzar una prediccion.
- Inferencia en CPU con latencia mediana de 67,1 ms, adecuada para filtrado en tiempo real.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un clasificador de secuencias.

## Casos de uso

- Enrutamiento de atencion al cliente B2B: el modelo clasifica cada mensaje entrante y decide si el chatbot responde con el estatus de pedido desde SAP (simulado) o si la conversacion debe pasar a un ejecutivo, reduciendo la carga manual en el primer nivel de soporte.
- Escalado automatico de quejas: al detectar la intencion `queja`, el sistema deriva inmediatamente a un ejecutivo humano, evitando que un chatbot responda de forma inadecuada a un cliente insatisfecho.
- Consulta de fechas de entrega: los mensajes clasificados como `fecha_entrega` se canalizan hacia el modelo de ETA, de modo que el chatbot responde de forma automatica con la estimacion correspondiente.
- Triaje multicanal en espanol e ingles: gracias a su naturaleza multilingue, el mismo modelo puede procesar conversaciones de clientes en ambos idiomas sin necesidad de desplegar clasificadores separados por idioma.
- Prefiltro en pipelines con LLM generativo: al ser un modelo pequeno y rapido (67,1 ms en CPU), puede actuar como primera capa que descarta o deriva mensajes antes de invocar un modelo generativo mas costoso, reduciendo el coste por consulta.
- Canalizacion a areas internas: la intencion `otro` permite derivar el mensaje al area correspondiente (logistica, facturacion, etc.) mediante reglas de negocio sobre la etiqueta predicha.
- Prototipado academico y experimentacion: sirve como referencia para estudiantes e investigadores que quieran replicar un pipeline de router de intenciones con calibracion y umbral de confianza.

## Benchmarks y rendimiento

| Conjunto | Accuracy | F1 macro | Respondidas en automatico | Automaticas erroneas |
|---|---|---|---|---|
| Prueba (data-v3.0.0, 400 mensajes) | 0.993 | 0.992 | 0.403 | 3 |
| Prueba externa escrita a mano (160 mensajes) | 0.964 | 0.965 | 0.412 | 6 |

Accuracy de la prueba externa por idioma: ingles 0.975, espanol 0.956, mixto 1.000. Latencia en CPU: mediana de 67,1 ms. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (279 M de parametros) y unos 0,56 GB en fp16; el modelo se guarda en 16 bits pero se recomienda cargarlo en 32 bits para CPU.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o superiores, asi como en GPUs de datacenter (A100, H100) si se comparte con otros servicios.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (uso documentado por el autor), y en general cualquier servidor de inferencia compatible con modelos de clasificacion de HuggingFace (por ejemplo, Text Embeddings Inference o endpoints de inferencia gestionados). No se documenta soporte especifico para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: latencia mediana de 67,1 ms en CPU segun el autor; no se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gagarang/router-intencion-cab-mdeberta` | 278,8 M | no disponible | Clasificacion de intenciones (5 clases) | MIT | HuggingFace |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` (modelo base) | ~279 M | no disponible | NLI zero-shot / clasificacion | MIT | HuggingFace |
| `MoritzLaurer/mDeBERTa-v3-base-mnli` | ~279 M | no disponible | NLI zero-shot | MIT | HuggingFace |

La comparacion con alternativas especificas de clasificacion de intenciones para atencion al cliente no esta disponible en la informacion proporcionada. El modelo base destaca por su uso en clasificacion zero-shot mediante NLI, mientras que este ajuste esta especializado en un dominio concreto (CAB) y no generaliza necesariamente a otras empresas sin reentrenamiento.

## Limitaciones y advertencias

- Los mensajes de CAB son simulados y la prueba externa fue escrita por el propio autor; los resultados (accuracy 0.964 en prueba externa) deben confirmarse con conversaciones reales durante el piloto.
- Riesgo de sobreajuste al dominio: el modelo esta entrenado para cinco intenciones concretas de una empresa ficticia; su uso en otros dominios requerira reentrenamiento o al menos validacion.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si existe riesgo de clasificacion erronea, especialmente en mensajes ambiguos o fuera de distribucion; el umbral de confianza de 0.9 mitiga parcialmente este riesgo mediante abstenccion.
- Cobertura linguistica limitada a espanol e ingles; otros idiomas no estan soportados.
- Los pesos se guardan en 16 bits; para inferencia en CPU deben cargarse en 32 bits (`dtype=torch.float32`), lo que duplica el uso de memoria.
- Licencia MIT: permite uso comercial, pero al derivar de un modelo base conviene verificar las condiciones del checkpoint original y del dataset Bitext (CDLA-Sharing-1.0) si se redistribuye.
- No se documenta la longitud maxima de contexto soportada, lo que limita la planificacion de mensajes largos.
- Modelo con muy baja adopcion (24 descargas, 0 likes) y sin validacion independiente; no se recomienda para produccion sin una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gagarang/router-intencion-cab-mdeberta
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli
- Dataset Bitext (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Paper de DeBERTa-v2: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
