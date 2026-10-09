# ozonetg/bargein-classifier-modernbert-large

## Resumen

bargein-classifier-modernbert-large es un clasificador de texto (no generativo) desarrollado por ozonetg que resuelve una pregunta muy concreta en el contexto de agentes de voz: cuando el interlocutor humano empieza a hablar mientras el bot todavia esta emitiendo su turno, hay que decidir si se trata de una interrupcion real (barge-in) o de un simple asentimiento, una confirmacion o una conversacion paralela que no requiere que el agente se calle. El modelo recibe tres campos de texto (lo que el agente ya dijo, lo que le queda por decir y la transcripcion ASR del usuario) y devuelve P(INTERRUPT), con umbral de decision en 0,5.

Tecnicamente es un fine-tuning de answerdotai/ModernBERT-large, un encoder transformer bidireccional de aproximadamente 395,8 millones de parametros y 0,8 GB de pesos en safetensors. La receta de entrenamiento incorpora R-Drop como regularizacion, y el modelo se publica explicitamente como *baseline de comparacion*: el autor recomienda usar en su lugar bargein-classifier-ettin-400m, que emplea la misma arquitectura, los mismos datos y la misma receta, pero un checkpoint preentrenado distinto (Ettin). El objetivo declarado de este checkpoint es aislar la variable del preentrenamiento y permitir reproducir la comparacion.

La relevancia actual es practica: en telefonia y voice agents el control de turno (turn-taking) es uno de los cuellos de botella de latencia y de experiencia de usuario. Un clasificador de ~400 M de parametros que corre en 8,4 ms en GPU (p50) es viable como componente en linea dentro del bucle de dialogo, algo que un LLM grande no permite con la misma latencia. El modelo esta entrenado solo en ingles y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) fine-tuneado para clasificacion de secuencias |
| Parametros totales | 395.833.346 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el checkpoint base answerdotai/ModernBERT-large documenta 8.192 tokens) |
| Tipos de cuantizacion | no disponible; no se publican pesos cuantizados. El script predict.py incluido usa bf16 en GPU y fp32 en CPU |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea (pipeline) | text-classification |
| Modelo base | answerdotai/ModernBERT-large (fine-tune) |
| Etiquetas de salida | binaria: INTERRUPT / CONTINUE (probabilidad P(INTERRUPT), umbral 0,5) |
| Entradas | agent_said, agent_unsaid, caller_said (texto ASR) |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes (a fecha de la ficha) | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional basado en ModernBERT-large, es decir, la variante moderna de la familia BERT que sustituye el positional encoding absoluto por RoPE, usa atencion alterna local/global y activaciones GeGLU, y esta disenada para secuencias largas. Sobre ese checkpoint se aplica una cabeza de clasificacion binaria. El modelo no genera texto: consume una secuencia formateada y produce una unica probabilidad.

El entrenamiento reutiliza exactamente la receta de bargein-classifier-ettin-400m; la unica variable que cambia es el checkpoint preentrenado de partida. La regularizacion emplea R-Drop (regularized dropout, arxiv:2106.14448), que fuerza la coherencia entre dos pasadas con distintas mascaras de dropout. Los datos de entrenamiento, la definicion de etiquetas y las limitaciones son los mismos que los de la model card de Ettin-400m, a la que el autor remite. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo fases de RLHF/DPO no se detallan en la informacion proporcionada.

Un detalle de integracion importante: las entradas deben construirse con el formateador format_input.py incluido en el repositorio, que reproduce el formato visto en entrenamiento. Ademas, una transcripcion vacia del interlocutor debe tratarse como CONTINUE sin invocar el modelo.

## Capacidades

- Clasificacion binaria de barge-in en dialogos hablados: distingue interrupciones reales (INTERRUPT) de continuaciones (CONTINUE) a partir de texto.
- Diferenciacion de backchannels: asentimientos tipo "mm hmm" o "si" se clasifican como CONTINUE.
- Deteccion de speech dirigido a terceros (side-talk): por ejemplo, el usuario hablando con alguien presente en la habitacion mientras el bot sigue con su guion.
- Distincion entre despedida y retorno: el modelo trata de separar a un interlocutor que se marcha de uno que se despide y vuelve a hablar.
- Sensibilidad al contexto de lo no dicho: usa agent_unsaid para saber que informacion aun no se ha entregado, lo que permite detectar preguntas que interrumpen antes de que el bot termine la frase.
- Robustez declarada frente a perturbaciones textuales y frente al canal telefonico (TTS -> canal telefonico -> ASR).
- No soporta generacion de texto, tool calling, agentes multi-paso, vision ni audio. Es un componente de decision, no un modelo de proposito general.
- Multilingue: no. Solo ingles.
- Modo "thinking": no disponible.

## Casos de uso

- Control de turno en voice agents en produccion: el clasificador se ejecuta en cada parcial de ASR mientras el bot habla; si P(INTERRUPT) >= 0,5 el agente corta la sintesis y cede el turno al LLM. Con 8,4 ms p50 en GPU encaja dentro del presupuesto de latencia de un turno conversacional.
- Filtrado de backchannels en IVR y atencion telefonica automatizada: evita que el bot se detenga cada vez que el usuario dice "ajá" o "mm hmm", reduciendo paradas innecesarias de sintesis y reinicios de turno.
- Deteccion de side-talk en llamadas: si el usuario habla con alguien de la habitacion en lugar de con el agente, el modelo permite mantener el guion en curso en vez de abortarlo.
- Enrutado de escalado a agente humano: una interrupcion con P(INTERRUPT) alta y contenido de reclamacion puede disparar transferencia inmediata, mientras que las continuaciones no generan evento.
- Analitica de calidad de contacto (post-proceso): clasificar en lote grabaciones transcritas para medir cuantas interrupciones reales recibe cada flujo de bot y en que punto del guion se producen.
- Evaluacion de encoders en un stack NLP propio: al ser un baseline aislado y reproducible, sirve para medir el efecto del preentrenamiento sobre una tarea de turn-taking antes de elegir el checkpoint definitivo.
- Despliegue on-premise o en CPU en centralitas telefonicas: con 112 ms p50 en CPU y ~0,8 GB de pesos en bf16, puede ejecutarse sin GPU dedicada en el propio borde del sistema telefonico.
- Servicio de clasificacion en tiempo real via endpoints compatible / text-embeddings-inference: el modelo esta marcado como endpoints_compatible y como soportado por TEI, lo que simplifica su exposicion como microservicio HTTP.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (accuracy con umbral 0,5, no verificados de forma independiente):

| Conjunto de evaluacion | Tamano | Accuracy |
|---|---|---|
| Held-out business types A (8 tipos de negocio no vistos) | 593 intercambios | 96,29 |
| Held-out business types B (20 tipos de negocio no vistos) | 588 intercambios | 94,05 |
| Human-labelled exchanges (no usados por el juez etiquetador) | 158 | 97,47 |
| Perturbation stress test | 6.258 | 94,23 |
| TTS -> canal telefonico -> ASR (stress test) | 1.328 | 91,87 |
| Distribution-shift test OOD-10k | 10.888 | 90,94 |
| Real calls, momentos sin ambiguedad de regla y con palabras | 278 | 97,80 |

Comparacion por semillas emparejadas publicada en la model card frente a Ettin-400m (misma receta, distinto preentrenamiento):

| Metrica | ModernBERT-large (este modelo) | Ettin-400m (recomendado) |
|---|---|---|
| Tipos de negocio no vistos (12.876, 2 semillas, emparejado) | 97,28 (-0,24) | 97,53 |
| Cambio de distribucion OOD-10k (10.888) | 91,28 (-0,47; p < 0,001) | 91,75 |
| Distinguir "se marcha" de "se despide y vuelve" (123 = 41 x 3 semillas) | 87,8 % | 97,6 % |
| Intercambios etiquetados por humanos (158) | 96,73 | 97,47 |
| Held-out business types A (593) | 96,07 | 95,39 |
| Held-out business types B (588) | 94,16 | 93,99 |
| TTS -> canal telefonico -> ASR (1.328) | 92,22 | 91,49 |
| Llamadas reales: acuerdo con el juez LLM (1.425, semilla 13) | 79,4 (-0,8; IC -1,9 a +0,3) | 80,2 |
| Latencia p50, GPU / CPU (misma ejecucion) | 8,4 ms / 112 ms | 8,4 ms / 112 ms |

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un clasificador de tarea especifica.

## Requisitos de hardware

- VRAM estimada: fp32 en torno a 1,6 GB; bf16 en torno a 0,8 GB; en int8 aproximados 0,4 GB y en int4 aproximados 0,2 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cabe con holgura en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090). En centro de datos, A100, H100, L40S o T4 son sobredimensionadas para el modelo, pero permiten servirlo con batching masivo.
- CPU: es plenamente funcional en CPU con fp32 (112 ms p50 medidos por el autor), lo que habilita despliegue en el propio equipo de telefonia.
- Opciones de despliegue: transformers (con predict.py y format_input.py incluidos en el repositorio), text-embeddings-inference (el modelo esta etiquetado como soportado) y servicios compatibles con endpoints. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversion previa. vLLM no esta orientado a este tipo de clasificador de secuencia.
- Latencia: 8,4 ms p50 en GPU y 112 ms p50 en CPU, segun la comparativa del autor. No se publican cifras de throughput ni de memoria pico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bargein-classifier-modernbert-large (este) | 395,8 M | no disponible | 90,94-97,80 % accuracy segun conjunto; 87,8 % en "se marcha vs. despide y vuelve" | Apache 2.0 | HuggingFace, 0 descargas |
| bargein-classifier-ettin-400m | ~400 M (no confirmado en la informacion disponible) | no disponible | Mejor en tipos de negocio no vistos (97,53), OOD-10k (91,75) y en "se marcha vs. despide y vuelve" (97,6 %) | no disponible en la informacion proporcionada | HuggingFace; recomendado por el propio autor |
| answerdotai/ModernBERT-large (modelo base, sin fine-tuning para esta tarea) | 395 M | 8.192 tokens | no aplica: no esta entrenado para clasificar barge-in | Apache 2.0 | HuggingFace |

La comparativa relevante para esta ficha es la primera fila frente a la segunda: ambos modelos comparten arquitectura, receta, datos y latencia, y la unica diferencia es el checkpoint preentrenado. En la mayoria de metricas Ettin-400m queda por delante, con la excepcion de los conjuntos held-out de tipos de negocio A y B y del stress test TTS -> canal telefonico -> ASR. No se dispone de comparativas con otros clasificadores de turn-taking de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Es un baseline de comparacion, no un modelo recomendado para produccion: el propio autor indica que debe usarse bargein-classifier-ettin-400m en su lugar.
- Solo ingles. Cualquier despliegue en castellano u otros idiomas requiere entrenamiento o fine-tuning adicional.
- Entrada basada en texto: depende por completo de la calidad del ASR. Si la transcripcion del interlocutor llega vacia, el resultado debe forzarse a CONTINUE sin llamar al modelo.
- La entrada debe construirse con format_input.py. Un formateo distinto del visto en entrenamiento degrada la clasificacion.
- Punto debil medido: solo 87,8 % de acierto al distinguir a alguien que se marcha de alguien que se despide y vuelve a hablar (frente al 97,6 % de Ettin-400m).
- Caida de accuracy en cambio de distribucion: 90,94 % en OOD-10k y 91,87 % en el stress test que simula TTS -> canal telefonico -> ASR, frente a mas del 97 % en conjuntos etiquetados por humanos.
- El acuerdo con el juez LLM en llamadas reales es del 79,4 %, con un intervalo de confianza que cruza el cero (-1,9 a +0,3) frente a Ettin. Es decir, la comparacion en llamadas reales no es concluyente.
- Todos los resultados son declarados por el autor (verified: false). No hay evaluacion independiente.
- No se documentan sesgos demograficos, acentes o de dominio en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos de interrupcion que provocarian cortes indebidos del agente y reinicios de turno.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. El modelo base hereda la misma licencia.
- Sin descargas ni likes en el momento de redactar esta ficha, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/bargein-classifier-modernbert-large
- Modelo recomendado por el autor (Ettin-400m): https://huggingface.co/ozonetg/bargein-classifier-ettin-400m
- Demo en vivo (Space): https://huggingface.co/spaces/ozonetg/bargein-classifier-demo
- Coleccion de modelos del proyecto: https://huggingface.co/collections/ozonetg/voice-agent-barge-in-classifier-6ac6e3d41659b866508ea3f0
- Formateador de entradas incluido en el repositorio: https://huggingface.co/ozonetg/bargein-classifier-modernbert-large/blob/main/format_input.py
- Script de inferencia incluido en el repositorio: https://huggingface.co/ozonetg/bargein-classifier-modernbert-large/blob/main/predict.py
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Paper de ModernBERT (referenciado en los tags): https://arxiv.org/abs/2412.13663
- Paper de R-Drop (referenciado en los tags): https://arxiv.org/abs/2106.14448
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; las unicas fuentes utiles son las anteriores, procedentes del repositorio de HuggingFace.
