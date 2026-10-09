# ozonetg/bargein-classifier-ettin-150m

## Resumen

El barge-in classifier de ozonetg es un modelo de clasificación de texto (encoder, 149.606.402 parámetros) que decide si un agente de voz debe callarse cuando el interlocutor empieza a hablar encima de él. No detecta actividad de voz: lee el contenido semántico de un instante concreto de la llamada —lo que el agente ya dijo, lo que estaba a punto de decir y las palabras del interlocutor reconocidas por ASR— y devuelve una probabilidad de INTERRUPT (parar) o CONTINUE (seguir). Está construido mediante fine-tuning sobre `jhu-clsp/ettin-encoder-150m`, un encoder de la familia Ettin (JHU CLSP) basado en arquitectura ModernBERT, con licencia MIT y entrenado únicamente en inglés.

El problema que resuelve es concreto y muy molesto en producción: las reglas basadas en VAD o en palabras clave fallan en las dos direcciones. Si el agente se detiene ante cada "mm hmm", "okay" o "sí" de relleno (backchannel), pierde el hilo y parece nervioso; si sigue hablando por encima de un "espera, ¿qué médico?", resulta descortés e inútil. La clave es el contexto: un "sí" inmediatamente después de una pregunta es una respuesta; ese mismo "sí" en mitad de una afirmación es relleno.

Su relevancia práctica está en la latencia y el coste de despliegue: 38 ms por decisión en 4 hilos de CPU y 7,0 ms en GPU, con un repo de 1,2 GB. Según el autor, empata con la variante de 400 M en tipos de negocio no vistos y en llamadas reales, y cede unos 2 puntos bajo cambio de distribución. Existe exportación a ONNX y soporte de `transformers.js`, lo que permite ejecutarlo en navegador o en Node sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (familia Ettin), fine-tuning sobre `jhu-clsp/ettin-encoder-150m`, con regularización R-Drop |
| Parametros totales | 149.606.402 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (cada decision procesa una unica cadena corta que concatena `agent_said`, `agent_unsaid` y `caller_said`) |
| Tipos de cuantizacion | no se documentan cuantizaciones int8 o de 4 bits; se distribuyen pesos en safetensors y una exportacion ONNX |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La base es `jhu-clsp/ettin-encoder-150m`, un encoder de la familia Ettin publicada por el JHU CLSP, con arquitectura ModernBERT y aproximadamente 150 millones de parametros. Sobre ella, ozonetg ha aplicado un fine-tuning de clasificacion de una sola etiqueta (INTERRUPT / CONTINUE) con umbral de decision 0,5. El tag `r-drop` indica el uso de R-Drop, una tecnica de regularizacion que aplica dropout dos veces sobre la misma entrada y penaliza la divergencia entre ambas salidas (paper arXiv:2106.14448), habitual para estabilizar el ajuste fino de encoders pequenos.

La entrada no es texto libre: es un formato estructurado de tres campos que se concatenan con el codigo exacto usado en entrenamiento (`format_input.py` junto a `textnorm.py`). `[BOT SAID]` contiene el texto TTS que el interlocutor ya escucho, `[BOT NOT YET SAID]` el resto de la frase planificada (puede estar vacio) y `[CALLER]` el texto ASR del habla solapada. Esa particion en el instante exacto del solapamiento es la innovacion central del diseno: sin ella, el modelo no puede distinguir un backchannel de una respuesta.

Los detalles del dataset de entrenamiento (numero de tokens, composicion, proporcion de datos sinteticos frente a llamadas reales, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada; se trata de una tarea de clasificacion supervisada, no de un modelo generativo. Lo que si se documenta son los conjuntos de evaluacion, que incluyen tipos de negocio no vistos, intercambios etiquetados por humanos, pruebas de estres con TTS enviado por canal telefonico y re-transcrito por ASR, y un test de cambio de distribucion con 10 tipos de shift sobre 10.888 intercambios.

## Capacidades

- Clasificacion binaria de barge-in: devuelve la probabilidad de que el agente deba detenerse (INTERRUPT) o continuar (CONTINUE), con umbral recomendado de 0,5.
- Distincion semantica entre backchannel ("mm hmm", "vale", carraspeos, conversacion lateral con alguien presente en la habitacion) y turno real de habla ("espera, que medico", "esa direccion esta mal", "deja de llamarme").
- Uso del contexto del agente: condiciona la decision a lo que el interlocutor ya escucho y a lo que estaba a punto de escuchar.
- Robustez a ruido de canal: entrenado y evaluado con texto TTS que pasa por canal telefonico y se re-transcribe con ASR (91,57% de exactitud en ese test de estres).
- Robustez a perturbaciones de texto: 92,94% de exactitud en un test de estres de 6.258 casos.
- Inferencia en CPU y en navegador: 38 ms en 4 hilos de CPU; soporte de ONNX y `transformers.js`, con un port en JavaScript del formateador de entrada que reproduce la salida del codigo Python.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio directo ni modo de razonamiento explicito. Es exclusivamente un clasificador de texto en ingles.

## Casos de uso

- Agentes de voz en telefonia (IVR y atencion al cliente): integrado en el bucle de turno, el modelo decide en 7,0 ms (GPU) o 38 ms (CPU) si el agente detiene su locucion en curso, evitando tanto la interrupcion descortes como el reinicio innecesario por un "mm hmm".
- Orquestacion de turnos en tiempo real: al ser un clasificador ligero, puede ejecutarse en paralelo al ASR en streaming y emitir la senal de corte antes de que el agente termine la frase, algo inviable con un modelo generativo grande en el camino critico.
- Atencion al cliente automatizada de alta concurrencia: 150 M de parametros y menos de 1 GB de VRAM permiten decenas de instancias por GPU, lo que abarata el coste por llamada frente a soluciones basadas en modelos mayores o en APIs externas.
- Cumplimiento y deteccion de peticiones criticas: casos como "deja de llamarme", "esa direccion esta mal" o "quiero hablar con una persona" requieren parada inmediata; el modelo aporta una senal de parada basada en contenido, no solo en energia de voz.
- Despliegue en el borde o en cliente: la exportacion ONNX y el port a `transformers.js` permiten ejecutar la clasificacion en navegador o en dispositivos sin GPU, util para demos, prototipos y entornos con requisitos de privacidad.
- Evaluacion y QA de politicas de turno: sirve como juez automatico para medir con que frecuencia una politica de dialogo (VAD, palabras clave, umbrales) interrumpe de forma incorrecta o ignora un turno real sobre conjuntos etiquetados.
- Preprocesado de corpus de llamadas: clasificar grandes volumenes de transcripciones para separar solapamientos reales de relleno conversacional y analizar la calidad de la interaccion.
- Investigacion sobre turn-taking en dialogo hablado: el formato de entrada de tres campos es replicable y el modelo sirve como linea base reproducible frente a heuristicas de VAD.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica de exactitud con umbral 0,5, no verificados de forma independiente):

| Conjunto de evaluacion | Tamano | Exactitud |
|---|---|---|
| Held-out business types A (8 tipos de negocio no vistos) | 593 intercambios | 95,28% |
| Held-out business types B (20 tipos de negocio no vistos) | 588 intercambios | 93,37% |
| Intercambios etiquetados por humanos | 158 | 98,10% |
| Test de estres por perturbacion | 6.258 | 92,94% |
| Test de estres TTS -> canal telefonico -> ASR | 1.328 | 91,57% |
| Test de cambio de distribucion OOD-10k (10 tipos de shift) | 10.888 | 89,76% |
| Llamadas reales, momentos no ambiguos por reglas | 278 | 97,50% |

Latencia declarada, batch 1 y de extremo a extremo: 7,0 ms en GPU y 38 ms en CPU con 4 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 149,6 M de parametros; no confirmada en la informacion proporcionada): aproximadamente 0,6 GB en fp32, 0,3 GB en bf16 y 0,15 GB en int8.
- El autor recomienda cargar en GPU con `dtype=torch.bfloat16` y mover modelo y entradas a `cuda`.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso integradas con suficiente memoria compartida. No requiere A100 ni H100.
- Funciona en CPU sin GPU: 38 ms por decision con 4 hilos. Se reporta salida identica en fp32 con transformers 4.51, 4.57 y 5.17, con 0 cambios de decision sobre 593 intercambios de test.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, `transformers.js` en navegador o Node, y el tag `text-embeddings-inference` esta presente en el repositorio. No aplican vLLM ni llama.cpp al tratarse de un clasificador encoder, no de un modelo generativo.
- Latencia y throughput: 7,0 ms por decision en GPU y 38 ms en CPU (4 hilos), batch 1. El throughput agregado en GPU no esta disponible en la informacion proporcionada, pero el tamano del modelo permite batching alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ozonetg/bargein-classifier-ettin-150m | 149,6 M | no disponible | 95,3% / 93,4% en tipos de negocio no vistos; 89,8% en OOD-10k; 38 ms en CPU | MIT | HuggingFace, ONNX, transformers.js |
| ozonetg/bargein-classifier-ettin-400m | no disponible (el nombre sugiere unos 400 M) | no disponible | Mas robusto ante cambio de distribucion; 8,5 ms en GPU; empata con el 150 M en tipos de negocio no vistos y llamadas reales | MIT (no confirmado en la informacion disponible) | HuggingFace |
| bnovikov/bargein-classifier | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Heuristicas de VAD o palabras clave | no aplica | no aplica | Fallan en ambas direcciones segun el propio autor: paran ante relleno o ignoran turnos reales | no aplica | Integrado en la mayoria de plataformas de telefonia |

La informacion proporcionada no incluye benchmarks de otros clasificadores de barge-in de terceros, por lo que no es posible una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta caracterizado y previsiblemente se degradara.
- Los resultados de los benchmarks estan declarados por el autor y marcados como no verificados; no se han reproducido de forma independiente.
- Dependencia del ASR: la entrada `caller_said` proviene de reconocimiento automatico de voz. El test TTS -> canal telefonico -> ASR baja al 91,57%, lo que refleja la perdida de exactitud cuando la transcripcion es imperfecta.
- Caida bajo cambio de distribucion: 89,76% en el conjunto OOD-10k, unos 6 puntos por debajo del mejor escenario. En dominios muy alejados del entrenamiento la fiabilidad disminuye.
- Riesgo de error en momentos ambiguos: la propia model card reconoce que la respuesta correcta depende del contexto; umbrales mal calibrados producen falsos cortes o interrupciones ignoradas. El umbral de 0,5 es un punto de partida, no una recomendacion universal.
- Sesgos: no se documenta ningun analisis de sesgo por acento, genero, edad o variedad dialectal. Al depender de texto ASR, hereda los sesgos del sistema de reconocimiento utilizado.
- Ausencia de herramientas y agentes: no soporta tool calling ni razonamiento multi-paso; no debe usarse como componente generativo.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero conviene verificar las condiciones del modelo base `jhu-clsp/ettin-encoder-150m` antes de redistribuir.
- Trazabilidad limitada: el repositorio tiene 21 descargas y 0 likes en el momento de la consulta, y no se documentan el dataset de entrenamiento ni el numero de tokens empleados, lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/bargein-classifier-ettin-150m
- Modelo hermano de 400 M: https://huggingface.co/ozonetg/bargein-classifier-ettin-400m
- Demo en vivo (Space): https://huggingface.co/spaces/ozonetg/bargein-classifier-demo
- Coleccion voice-agent-barge-in-classifier: https://huggingface.co/collections/ozonetg/voice-agent-barge-in-classifier-6ac6e3d41659b866508ea3f0
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Codigo del formateador de entrada: https://huggingface.co/ozonetg/bargein-classifier-ettin-150m/blob/main/format_input.py
- Normalizacion de texto: https://huggingface.co/ozonetg/bargein-classifier-ettin-150m/blob/main/textnorm.py
- Paper de R-Drop: https://arxiv.org/abs/2106.14448
- Paper de la familia Ettin: https://arxiv.org/abs/2507.11412
- Clasificador de barge-in alternativo: https://huggingface.co/bnovikov/bargein-classifier
- Ficha en free2aitools: https://free2aitools.com/model/ozonetg/bargein-classifier-ettin-150m
