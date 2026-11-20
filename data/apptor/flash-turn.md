# apptor/flash-turn

## Resumen

flash-turn es un clasificador de texto en miniatura desarrollado por apptor, pensado como componente de decisión para asistentes de voz en inglés y alemán. Resuelve dos preguntas que un asistente conversacional debe responder de forma continua: si el usuario ha terminado su turno de palabra o va a continuar, y si una interjección mientras el asistente habla constituye una interrupción, una señal de escucha pasiva o una conversación dirigida a otra persona o dispositivo. El modelo deriva de distilbert-base-multilingual-cased, con un clasificador único de cinco salidas y un vocabulario reducido de 119k a 38k piezas.

El interés practico esta en su relacion calidad-coste: 73 MB en ONNX int8, aproximadamente 11 ms por consulta en un solo hilo de CPU y sin necesidad de GPU. Sustituye en flash-voice a un modelo de decisión de 4B parámetros que consumía unos 5 GB de VRAM y tardaba unos 35 ms en GPU, manteniendo o mejorando los resultados en los conjuntos de prueba publicados. Es, por tanto, un ejemplo de destilación de tareas muy acotadas hacia modelos pequenos desplegables en el borde.

La licencia Apache 2.0 y el formato ONNX facilitan su integración en pipelines de voz existentes, aunque su alcance es deliberadamente estrecho: solo texto, solo inglés y alemán, y sin acceso a prosodia ni a contexto acústico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), clasificador de 5 salidas |
| Parametros totales | no disponible (peso del artefacto: 73 MB en ONNX int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | truncado a 96 tokens en el ejemplo de uso |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (flash-turn.onnx) y tokenizer.json |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-multilingual-cased y anade una cabeza de clasificacion con cinco salidas: dos para la tarea de fin de turno (no terminado, terminado) y tres para la tarea de barge-in (interrumpe, escucha, otra persona). Cada consulta utiliza solo su subconjunto de salidas y las restantes se enmascaran durante el entrenamiento. El vocabulario se recorta de 119k a 38k piezas limitandolo a las que aparece en texto ingles y aleman, lo que reduce el tamano de la matriz de embeddings sin alterar la tokenizacion de esos idiomas.

Los datos de entrenamiento combinan aproximadamente 2,8 millones de frases en aleman (Mozilla Common Voice, CC0, y Tatoeba, CC BY 2.0 FR) y unos 2 millones en ingles (Tatoeba). Para la tarea de turno, una frase completa se etiqueta como terminada y la misma frase cortada tras una palabra interna como no terminada; se elimina la puntuacion, se varia el uso de mayusculas y se tratan las muletillas finales ("right?", "oder?") como terminadas y las de corte ("uh", "äh") como no terminadas. Para la tarea de barge-in se generaron unas 7.600 interjecciones con un LLM local en ambos idiomas sobre 40 topicos, filtradas por un modelo de decision (vllm-d3-mini) para descartar casos ambiguos, mas backchannels escritos a mano y 12.000 frases dirigidas a una persona por su nombre o al asistente ("Hey Flash, ...").

El entrenamiento consistio en una sola epoca sobre 3,3 millones de ejemplos, con una duracion de unos 35 minutos en una RTX 5060 Ti. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificacion de fin de turno: distingue si una transcripcion parcial es una idea completa o si el hablante continuara.
- Deteccion de barge-in: clasifica una interjeccion como interrupcion, escucha pasiva (backchannel) u conversacion dirigida a otra persona o dispositivo.
- Procesamiento de texto de reconocimiento automatico: asume entrada sin puntuacion salvo un signo de interrogacion final, que se conserva como senal informativa.
- Manejo de muletillas y marcadores discursivos en ingles y aleman ("mhm", "right", "oder?", "äh").
- Inferencia en CPU pura mediante ONNX Runtime, sin GPU.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Deteccion de fin de turno en asistentes de voz: el modelo recibe la transcripcion parcial y decide si el asistente debe responder o esperar una pausa mayor, reduciendo respuestas prematuras en frases con subordinadas ("If I drive to Graz tomorrow, then").
- Gestion de interrupciones (barge-in) durante la sintesis de voz: mientras el asistente habla, se consulta al modelo con el final de la locucion y la interjeccion capturada para decidir si se detiene la reproduccion.
- Filtrado de backchannels: evita que el asistente se detenga ante "mhm" o "right", manteniendo la locucion en curso.
- Discriminacion de habla dirigida a terceros: descarta como no dirigidas al asistente frases con vocativos a otras personas ("Honey, ...", "Max, ...") o ruido de television en entornos domesticos.
- Despliegue en dispositivos de borde: al ocupar 73 MB y ejecutarse en un hilo de CPU en unos 11 ms, encaja en Raspberry Pi, telefonos o altavoces inteligentes sin acelerador.
- Sustitucion de modelos de decision grandes en pipelines existentes: reemplaza a vllm-d3-mini en flash-voice, liberando unos 5 GB de VRAM y reduciendo la latencia de decision.
- Preprocesado en sistemas de subtitulado o transcripcion en tiempo real: segmentacion de emisiones en unidades de sentido para mejorar la legibilidad.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos de prueba no vistos en entrenamiento, comparados con el modelo de decision de 4B vllm-d3-mini (Q8_0, llama-server):

| Prueba | flash-turn | vllm-d3-mini |
|---|---|---|
| Fin de turno, casos de decision (EN / DE, 24 cada uno) | 23 / 23 | 24 / 23 |
| Interjecciones, casos de decision (EN / DE, 28 cada uno) | 26 / 25 | 24 / 18 |
| Fin de turno, 300 clips de hablantes austriacos (texto ASR) | 92,3 % | 87,0 % |
| Fin de turno, frases no vistas (EN / DE) | 91,5 % / 91,0 % | 90,7 % / 90,7 % |
| Tiempo por consulta | 11 ms en 1 hilo de CPU | ~35 ms en GPU |
| Tamano | 73 MB | ~5 GB |

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU con ONNX Runtime (CPUExecutionProvider).
- Memoria: el artefacto pesa 73 MB en int8, con huella en RAM del orden de cientos de MB incluyendo el runtime.
- GPU recomendadas: no aplica; el autor no publica requisitos de GPU.
- Compatibilidad con GPU de consumo: irrelevante por diseno, al ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), integracion en servicios propios; no se documentan exportaciones a llama.cpp, Ollama, vLLM ni TGI.
- Latencia: aproximadamente 11 ms por consulta en un solo hilo de CPU; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Despliegue |
|---|---|---|---|---|---|
| flash-turn | no disponible (73 MB int8) | 96 tokens (truncado en uso) | Fin de turno y barge-in EN/DE | Apache 2.0 | ONNX CPU |
| vllm-d3-mini | 4B | no disponible | Decision conversacional general | no disponible | llama-server, GPU |
| distilbert-base-multilingual-cased | 66M (aprox., no confirmado en la informacion) | 512 tokens | Clasificacion generica multilingue | Apache 2.0 | PyTorch, ONNX |

No se dispone de comparaciones con otros detectores de fin de turno especializados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite ingles y aleman; cualquier otro idioma queda fuera de su alcance.
- Opera exclusivamente sobre texto: no percibe tono de voz, prosodia ni pausas reales, por lo que frases ambiguas ("could you pass the water?") pueden clasificarse de forma erronea.
- La distincion entre habla dirigida al asistente y a terceros es intrinsecamente dificil solo con palabras; el modelo solo declara "otra persona" en casos claros.
- Un falso "no terminado" penaliza la latencia (el asistente espera una pausa mas larga), no la correccion de la respuesta.
- El truncado a 96 tokens limita el analisis de emisiones largas; el ejemplo de uso recorta tambien el contexto del asistente a los ultimos ~160 caracteres.
- No se han publicado evaluaciones de sesgo; el entrenamiento con Tatoeba y Common Voice puede heredar sesgos de esos corpus.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si de calibracion erronea en entradas fuera de distribucion.
- Licencia Apache 2.0 permite uso comercial; los datos de Tatoeba estan bajo CC BY 2.0 FR y Common Voice bajo CC0, sin obligaciones adicionales documentadas para el usuario final.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apptor/flash-turn
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Proyecto flash-voice: https://github.com/ViktorsGitUser/flash-voice
- Modelo de comparacion vllm-d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Tatoeba: https://tatoeba.org
