# ozonetg/bargein-classifier-ettin-400m

## Resumen

Barge-in classifier · Ettin-400m es un modelo de clasificación de texto desarrollado por el usuario ozonetg (cuenta asociada al proyecto Ozonetg) que resuelve un problema muy concreto en agentes de voz: decidir si el agente debe callarse cuando el interlocutor empieza a hablar encima de él. El modelo recibe tres campos de texto (lo que el bot ya dijo, lo que tenía previsto decir y lo que el llamante ha dicho según el ASR) y devuelve la probabilidad de dos clases: INTERRUPT (el agente debe detenerse) o CONTINUE (debe seguir hablando). La innovación clave es que la decisión depende del contexto de la frase del agente en el momento exacto de la interrupción, algo que las reglas basadas en actividad de voz o en palabras clave no capturan.

Técnicamente es un encoder ModernBERT de la familia Ettin (base `jhu-clsp/ettin-encoder-400m`) afinado como clasificador de secuencia. Cuenta con 395.833.346 parámetros y está pensado para inferencia de bajísima latencia: 8,5 ms por decisión en GPU (batch 1, extremo a extremo) y 113 ms en CPU con 4 hilos. Existe una variante hermana de 150M parámetros (`bargein-classifier-ettin-150m`) que corre en 38 ms en CPU y sacrifica aproximadamente 2 puntos de exactitud en el test de cambio de distribución OOD-10k.

Su relevancia ahora es práctica: la mayoría de agentes de voz comerciales siguen usando detección de actividad de voz o listas de palabras para gestionar el turno, lo que produce agentes que se cortan ante cualquier "mm hmm" o que atropellan una pregunta real. Este modelo ofrece una alternativa entrenada con datos etiquetados de llamadas reales, con licencia MIT, exportación ONNX y compatibilidad con transformers.js, lo que permite desplegarlo tanto en servidor como en navegador o en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (familia Ettin) con cabeza de clasificacion de secuencia (2 clases) |
| Parametros totales | 395.833.346 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se documentan variantes cuantizadas oficiales; se recomienda bfloat16 en GPU y fp32 en CPU. Exportacion ONNX incluida |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |
| Modelo base | jhu-clsp/ettin-encoder-400m |
| Tarea (pipeline) | text-classification |
| Clases de salida | INTERRUPT / CONTINUE (probabilidad, umbral por defecto 0,5) |
| Tamano del repositorio | 3,8 GB |
| Libreria | transformers (tambien transformers.js y text-embeddings-inference) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-400m`, un encoder de la familia Ettin publicada por Johns Hopkins y LightOn, que emplea la arquitectura ModernBERT (attention con soporte de secuencias largas y alternancia de capas globales y locales). Sobre esa base se anade una cabeza de clasificacion de secuencia para producir una decision binaria. El preentrenamiento del encoder base no forma parte de este trabajo: aqui se documenta unicamente el afinado.

El entrenamiento del clasificador se realizo sobre exchanges de llamadas de voz con etiquetas de barge-in, usando R-Drop como regularizacion (referencia arXiv:2106.14448), una tecnica que obliga a que las dos salidas dropout de una misma muestra coincidan en distribucion y que suele mejorar la robustez en tareas de clasificacion con pocos datos. El autor no detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si publica el codigo exacto de formateo de entrada (`format_input.py` y `textnorm.py`) que se uso durante el entrenamiento, lo que reduce el riesgo de desajuste entre entrenamiento e inferencia.

La innovacion de diseno mas relevante es la descomposicion del turno del agente en dos campos: `agent_said` (lo que el llamante ya escucho) y `agent_unsaid` (lo que quedo por decir). Esto permite que el modelo distinga, por ejemplo, un "si" que responde a una pregunta ya formulada (INTERRUPT) de un "ya" que aparece en mitad de una afirmacion (CONTINUE). El modelo no genera texto: solo puntua un momento concreto de la conversacion.

## Capacidades

- Clasificacion binaria de barge-in: devuelve la probabilidad de INTERRUPT frente a CONTINUE para un instante dado de la llamada.
- Razonamiento sobre contexto parcial: usa la linea del agente truncada en el punto exacto en que el llamante empezo a hablar, mas el resto planificado como contexto.
- Distincion entre backchannel y respuesta: reconoce "mm hmm", "okay", toses o conversaciones laterales como CONTINUE, y preguntas o correcciones como INTERRUPT.
- Robustez ante ruido de ASR: los tests de estres incluyen texto pasado por canal telefonico y re-transcrito por ASR.
- Robustez ante cambios de dominio: evaluado con 8 y 20 tipos de negocio no vistos durante el entrenamiento y con un test de 10 tipos de desplazamiento de distribucion.
- Ejecucion en navegador o Node mediante transformers.js, con un port en JavaScript del formateador de entrada.
- Inferencia de baja latencia: 8,5 ms en GPU y 113 ms en CPU (4 hilos) por decision, batch 1.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes. No dispone de modo de pensamiento, vision ni audio.
- Capacidad multilingue: no, unicamente ingles.

## Casos de uso

- Orquestacion de turnos en agentes de voz: el modelo se coloca entre el ASR y el motor de dialogo y decide en milisegundos si hay que pausar la sintesis de voz. Al ser un clasificador de 400M con 8,5 ms de latencia en GPU, encaja en el bucle de tiempo real sin convertirse en el cuello de botella.
- Atencion al cliente telefonica automatizada: en un flujo de reservas o soporte, el agente puede seguir leyendo una confirmacion larga aunque el cliente asienta con "vale" o "ajá", y detenerse solo cuando el cliente introduce una correccion real ("espera, ¿que medico?").
- Filtrado de retroalimentacion verbal (backchannel filtering): evita que el agente se corte ante ruidos de asentimiento, toses o murmullos, un problema clasico de los sistemas basados en deteccion de actividad de voz.
- Deteccion de correcciones y objeciones: cuando el llamante interrumpe con informacion que invalida lo que el agente esta diciendo (direccion equivocada, importe incorrecto), el clasificador lo marca como INTERRUPT y dispara un reinicio del turno.
- Deteccion de conversacion lateral: el modelo esta entrenado explicitamente para reconocer cuando el llamante habla con alguien de la habitacion ("cariño, abre la puerta") y no con el agente, lo que evita cortes innecesarios.
- Evaluacion offline de calidad conversacional: se puede ejecutar el clasificador sobre grabaciones historicas para medir cuantas interrupciones reales gestiono mal el agente y detectar puntos de mejora en el guion.
- Despliegue en el borde o en navegador: gracias a la exportacion ONNX y a transformers.js, puede ejecutarse en el cliente sin enviar audio ni transcripciones a un servidor, util en entornos con requisitos de privacidad o en demos web.
- Enrutado de politicas de barge-in: la probabilidad de salida permite fijar umbrales distintos segun el contexto (por ejemplo, mas agresivo en cobros, mas conservador en soporte tecnico) sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, campo `verified: false` en el model-index). Metrica: accuracy con umbral 0,5.

| Conjunto de evaluacion | Tamano | Accuracy |
|---|---|---|
| Tipos de negocio no vistos A (8 tipos de negocio) | 593 exchanges | 95,11 % |
| Tipos de negocio no vistos B (20 tipos de negocio) | 588 exchanges | 93,71 % |
| Exchanges etiquetados por humanos | 158 | 98,10 % |
| Test de estres por perturbacion | 6.258 | 93,59 % |
| TTS -> canal telefonico -> ASR | 1.328 | 91,11 % |
| Test de cambio de distribucion OOD-10k (10 tipos de shift) | 10.888 | 91,84 % |
| Llamadas reales, momentos inequivocos con palabras | 278 | 98,20 % |

Latencia declarada: 8,5 ms en GPU (batch 1, extremo a extremo) y 113 ms en CPU con 4 hilos. La variante de 150M corre en 38 ms en CPU con 4 hilos. El autor indica que el modelo de 400M esta 2 puntos por delante del de 150M en el test OOD-10k. No se han publicado resultados comparados con otros clasificadores de barge-in en la informacion disponible.

## Requisitos de hardware

- VRAM estimada solo para pesos: aproximadamente 1,6 GB en fp32, 0,8 GB en bfloat16/fp16, 0,4 GB en int8 y 0,2 GB en int4. Son calculos derivados de los 395,8M de parametros, no cifras publicadas por el autor.
- Consumo real: al ser un clasificador de secuencia, el coste de activaciones es minimo con entradas de una o dos frases; 1-2 GB de VRAM en bfloat16 son suficientes para inferencia con batches pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve. El autor menciona ejecucion en GPU con `dtype=torch.bfloat16`; tarjetas como RTX 3060, RTX 4090, A100 o H100 son validas y estaran muy sobredimensionadas para este modelo, salvo que se necesite throughput muy alto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna, e incluso en iGPU con memoria compartida si se usa ONNX en cuantizacion reducida.
- CPU: 113 ms por decision con 4 hilos en fp32. El autor indica que transformers 4.51, 4.57 y 5.17 producen salidas identicas en CPU fp32, con 0 cambios de decision sobre 593 exchanges de test.
- Opciones de despliegue: transformers (Python), ONNX Runtime, transformers.js (navegador o Node) y text-embeddings-inference segun los tags del repositorio. Tambien es compatible con endpoints de Hugging Face.
- Throughput: no disponible. Solo se publica latencia por decision en batch 1.
- Nota de alternativas: si el despliegue es exclusivamente en CPU y la latencia importa, el autor recomienda la variante de 150M (38 ms en 4 hilos) a cambio de perder robustez frente a cambios de distribucion.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| ozonetg/bargein-classifier-ettin-400m | 395,8M | Clasificacion de barge-in (INTERRUPT/CONTINUE) | no disponible | MIT | OOD-10k 91,84 %; negocio no visto 95,11 % / 93,71 % |
| ozonetg/bargein-classifier-ettin-150m | no disponible | Clasificacion de barge-in | no disponible | no disponible en la informacion proporcionada | 2 puntos por debajo del 400M en OOD-10k; 38 ms en CPU (4 hilos) |
| jhu-clsp/ettin-encoder-400m | ~400M | Encoder generalista (representaciones, GLUE, MTEB) | no disponible | no disponible en la informacion proporcionada | No es un clasificador de barge-in; sirve como base de este modelo |
| Reglas de VAD o palabras clave | No aplica | Deteccion de interrupcion | No aplica | No aplica | No se publican cifras comparativas en la informacion disponible |

No se dispone de otros clasificadores de barge-in publicos con los que comparar directamente en la informacion proporcionada. La comparativa mas util es interna (400M frente a 150M) y frente al enfoque clasico de reglas, para el que el autor argumenta fallos en ambas direcciones sin aportar numeros.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado unicamente en ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Dependencia del ASR: la entrada es texto ya transcrito. Los errores del reconocedor de voz se propagan directamente a la decision; el test TTS -> canal telefonico -> ASR baja la exactitud al 91,11 %, unos 4 puntos por debajo del mejor caso.
- Resultados no verificados: todas las cifras del model-index tienen `verified: false`. Proceden del propio autor y no han sido replicadas de forma independiente.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre. El riesgo equivalente es una clasificacion erronea (falso INTERRUPT o falso CONTINUE) sobre un momento ambiguo de la conversacion.
- Sesgos de dominio: el entrenamiento se basa en exchanges de llamadas de negocio y telefonia. El comportamiento fuera de ese registro (conversacion informal, otros acentos, otros canales) no esta caracterizado, aunque el autor incluye tests de tipos de negocio no vistos y de cambio de distribucion.
- Formato de entrada obligatorio: el modelo espera el string exacto con las marcas `[BOT SAID]`, `[BOT NOT YET SAID]` y `[CALLER]` generado por `format_input.py`. Alimentarlo con texto sin ese formato degradara la calidad de la decision.
- Umbral fijo: los benchmarks usan umbral 0,5. En produccion puede ser necesario recalibrarlo segun el coste relativo de cortar de mas frente a cortar de menos.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones practicas, pero el autor no ofrece garantias ni soporte.
- Adopcion muy baja: 17 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa y comunidad reducida para resolver dudas.
- Longitud de contexto: no documentada en la informacion disponible. Al operar sobre fragmentos cortos de una frase mas el texto del llamante, no deberia ser un factor limitante, pero conviene verificarlo antes de usarlo con turnos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozonetg/bargein-classifier-ettin-400m
- Archivos del repositorio: https://huggingface.co/ozonetg/bargein-classifier-ettin-400m/tree/main
- Demo en vivo (Space): https://huggingface.co/spaces/ozonetg/bargein-classifier-demo
- Modelo hermano de 150M: https://huggingface.co/ozonetg/bargein-classifier-ettin-150m
- Coleccion del autor: https://huggingface.co/collections/ozonetg/voice-agent-barge-in-classifier-6ac6e3d41659b866508ea3f0
- Codigo de formateo de entrada: https://huggingface.co/ozonetg/bargein-classifier-ettin-400m/blob/main/format_input.py
- Normalizacion de texto: https://huggingface.co/ozonetg/bargein-classifier-ettin-400m/blob/main/textnorm.py
- Modelo base Ettin encoder 400M: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Referencia arXiv 2507.11412: https://arxiv.org/abs/2507.11412
- Referencia arXiv 2106.14448 (R-Drop): https://arxiv.org/abs/2106.14448
- Ficha en free2aitools: https://free2aitools.com/model/ozonetg/bargein-classifier-ettin-400m
- Articulo sobre la familia Ettin (AlphaSignal): https://alphasignal.ai/news/johns-hopkins-ettin-proves-smaller-encoders-beat-larger-decoders-on
- Sheltron (modelos abiertos de seguridad en IA, mismo autor segun la busqueda): https://sheltron.ai/
