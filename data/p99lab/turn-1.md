# p99lab/turn-1

## Resumen

turn-1 es un modelo de deteccion de fin de turno (end-of-turn detection) para agentes de voz conversacionales, desarrollado por p99lab. Su funcion es estimar la probabilidad P(fin de turno) a partir del audio escuchado hasta el momento, de modo que un agente de voz pueda decidir cuando el usuario ha dejado de hablar y empezar a responder. No es un modelo generativo: no produce texto, solo una probabilidad calibrable en cada pausa.

Tecnicamente es una composicion de cabezas de clasificacion sobre dos codificadores de voz abiertos de terceros. La prediccion final es la media de dos estimaciones de P(fin de turno) calculadas sobre el mismo audio: una procede de una cabeza lineal (`turn-1-head.safetensors`, 18.9M parametros) sobre un codificador grande, y otra de un adaptador LoRA (`turn-1-lora.safetensors`, 14.8M parametros) mas una cabeza sobre un codificador mas pequeno. Las partes propias de p99lab suman 33.7M parametros, pero la inferencia exige ejecutar los dos codificadores completos.

El modelo consume los ultimos 8 segundos de audio a 16 kHz mono (filtrado paso bajo a 4 kHz dentro del paquete) y, opcionalmente, la ultima frase del agente como texto. Es relevante para el stack de agentes de voz porque ataca el problema del "endpointing": los umbrales de silencio de los detectores de actividad de voz (VAD) tradicionales provocan cortes prematuros o respuestas lentas, y turn-1 sustituye esa heuristica por una prediccion semantica sobre el habla. La licencia es Apache-2.0 y esta pensado para servidor, no para dispositivo (para ese caso el autor remite a `turn-1-mini`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composicion de dos codificadores de voz abiertos de terceros con cabezas propias: una cabeza lineal sobre un codificador (18.9M parametros) y un adaptador LoRA mas cabeza sobre otro (14.8M parametros); salida final como media de ambas probabilidades |
| Parametros totales | Codificadores de terceros: 2.0B y 0.8B parametros. Partes propias de p99lab: 33.7M parametros (18.9M + 14.8M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ultimos 8 segundos de audio a 16 kHz mono (filtrado paso bajo a 4 kHz dentro del paquete) |
| Tipos de cuantizacion | no disponible (ejecucion declarada en float32) |
| Idiomas soportados | en (ingles); solo se ha medido en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`turn-1-head.safetensors`, `turn-1-lora.safetensors`) y rueda Python `p99turn1-1.0.0-py3-none-any.whl`; los codificadores no se redistribuyen, se descargan de sus repositorios originales |

## Arquitectura y entrenamiento

turn-1 no es un transformer entrenado desde cero ni un modelo end-to-end. Es un ensamblado de dos ramas que comparten audio de entrada. La primera rama usa un codificador de voz abierto de 2.0B parametros (propiedad de terceros, Apache-2.0, descargado en una revision fijada y no redistribuido aqui, segun el `NOTICE`) congelado, sobre cuyas caracteristicas se anade `turn-1-head.safetensors`, una cabeza de 18.9M parametros y 76 MB. La segunda rama usa un segundo codificador de voz abierto mas pequeno, de 0.8B parametros, tambien congelado, al que se le anade en tiempo de ejecucion `turn-1-lora.safetensors`, un adaptador de bajo rango de 14.8M parametros y 59 MB, mas una cabeza propia. La salida es la media de las dos estimaciones de P(fin de turno).

El modelo solo consume los ultimos 8 segundos de audio escuchados y, opcionalmente, la ultima frase del agente como texto; nunca usa como texto las palabras del turno actual del usuario, porque las "oye" en el audio. No hay punto de decision fijo: se puede consultar la probabilidad en cualquier momento durante una pausa. Cada uno de los dos modelos se ejecuta una vez por decision y no hay generacion de texto ni procesamiento incremental. No se especifican en la informacion disponible ni el numero de tokens de audio usados en entrenamiento, ni la composicion del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento. Si se indica que el audio y las etiquetas de eot-bench nunca se usaron para entrenar, seleccionar ni fijar el umbral del modelo, y que se puntuaron dos candidatos de turn-1 sobre el test set, conservandose el segundo bajo una regla fijada antes de puntuarlo.

## Capacidades

- Deteccion de fin de turno: estima P(fin de turno) sobre los ultimos 8 segundos de audio a 16 kHz mono, con salida continua y sin punto de decision fijo.
- Decodificacion bajo demanda: permite consultar la probabilidad en cualquier pausa (`stream.score()`) conforme llega el audio con `stream.push(chunk)`.
- Acondicionamiento por texto del agente: acepta opcionalmente la ultima frase del agente como texto (`agent_text`) para contextualizar la prediccion.
- Filtrado paso bajo interno a 4 kHz sobre el audio de entrada.
- Ejecucion determinista en float32 sin generacion de texto.
- No dispone de tool calling ni function calling.
- No dispone de razonamiento multi-paso ni comportamiento de agente: es un unico clasificador.
- No dispone de capacidades de vision, generacion, resumen ni traduccion.
- Multilingue: no disponible; solo se ha medido en ingles.

## Casos de uso

- Atencion al cliente automatizada por voz: el modelo sustituye los umbrales de silencio de un VAD por una prediccion semantica de fin de turno, reduciendo los cortes prematuros cuando el usuario hace una pausa a mitad de frase (por ejemplo, al dictar un numero de cuenta con pausas).
- Agentes de voz con barge-in: al consultar la probabilidad en cada pausa, el agente puede responder en cuanto el usuario termina sin esperar un silencio fijo, lo que baja la latencia percibida en conversaciones multi-turno.
- Endpointing en pipelines de ASR en tiempo real: se integra antes del reconocedor para decidir cuando cerrar el turno y disparar la transcripcion o la respuesta del modelo de lenguaje.
- Grabacion y analitica de contact center: al aportar una probabilidad continua, se puede segmentar audio de llamadas en turnos y medir tiempos de habla y de silencio con criterio semantico.
- Evaluacion y comparacion de stacks de voz: sirve como referencia en benchmarks de turn-taking (eot-bench) para medir cortes falsos y latencia de un agente antes de desplegarlo.
- Asistentes telefonicos/IVR: en entornos SIP o de telefonia, ayuda a decidir cuando el usuario ha acabado de introducir un dato para pasar al siguiente paso de un flujo.
- Moderacion o monitorizacion de voz: la probabilidad por turno permite detectar patrones de interrupcion y solapamiento en conversaciones, util en supervision de calidad.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados) sobre `livekit/eot-bench-data`, config `en`, split `validation`, revision `ca9d98a`: 400 turnos y 705 pausas intermedias puntuadas, en float32 y tamano de lote 64. Valores mas bajos son mejores.

| Modelo | Cortes falsos @ 300 ms | Cortes falsos @ 600 ms | Latencia @ 5% cortes | Latencia @ 10% cortes | AUC (diagnostico) |
|---|---:|---:|---:|---:|---:|
| turn-1 | 10.6% (75 de 705) | 4.5% | 553 ms | 322 ms | 0.976 |
| LiveKit Turn Detector v1 | 9.9% (70 de 705) | 4.5% | 543 ms | 295 ms | 0.969 |
| JoinIn AI Baton | 12.3% (87 de 705) | 4.8% | 577 ms | 350 ms | 0.958 |
| Deepgram Flux | 12.9% | 9.9% | 1.151 ms | 548 ms | no disponible |

Intervalo de confianza al 95% de turn-1 (bootstrap a nivel de turno, 400 remuestreos): cortes falsos @ 300 ms de 7,7% a 13,8%; @ 600 ms de 2,7% a 6,0%; latencia @ 5% de 399 a 691 ms; latencia @ 10% de 250 a 387 ms.

El propio autor precisa que, frente a las 13 filas del board en ese commit, turn-1 quedaria segundo en cortes falsos a 300 ms, en latencia al 5% y en latencia al 10%, y empatado en primera posicion en cortes falsos a 600 ms (32 de 705, mismo recuento que LiveKit Turn Detector v1). Queda por detras de LiveKit Turn Detector v1 a 300 ms, al 5% y al 10%. No se hizo ninguna prueba pareada contra otras entradas y los intervalos de un solo modelo se solapan. La latencia reportada es silencio muerto elegido por el barrido de politica del benchmark (umbral, retardo de accion y timeout se eligen sobre los mismos 400 turnos que se puntuan), no tiempo de computo.

## Requisitos de hardware

- VRAM estimada: el autor indica que lo ejecuto en una GPU CUDA con 20 GB. Los codificadores de terceros suman 4,7 GB + 1,9 GB de descarga y la ejecucion declarada es en float32; no se publica un desglose exacto de VRAM por componente.
- GPU recomendadas: GPU CUDA de clase servidor con al menos 20 GB, como A100 o H100. No se confirma su ejecucion en GPU de consumo.
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) esta por encima del umbral de 20 GB citado, pero el autor no lo ha validado ni ha medido latencia o throughput en esa configuracion.
- Opciones de despliegue: el paquete oficial `p99turn1` (rueda `p99turn1-1.0.0-py3-none-any.whl`) junto con la dependencia `qwen-asr==0.0.6`, que aporta el codigo de los codificadores de voz. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el tiempo por decision no se ha medido en esta configuracion, segun el autor. El modelo tampoco es incremental: cada uno de los dos codificadores se ejecuta completo una vez por decision.
- La descarga inicial requiere los pesos de ambos codificadores (4,7 GB + 1,9 GB) mas las partes propias, y descarga los codificadores desde sus repositorios originales en una revision fijada.

## Comparativa con modelos similares

| Modelo | Tipo | Cortes falsos @ 300 ms | Latencia @ 10% | Licencia | Disponibilidad |
|---|---|---|---|---:|---|
| turn-1 | End-of-turn detection sobre codificadores congelados | 10.6% | 322 ms | Apache-2.0 | HuggingFace (p99lab/turn-1) |
| LiveKit Turn Detector v1 | Detector de turno de LiveKit | 9.9% | 295 ms | no disponible | integrado en LiveKit |
| JoinIn AI Baton | Detector de turno de JoinIn AI | 12.3% | 350 ms | no disponible | producto de JoinIn AI |
| Deepgram Flux | Modelo de voz de Deepgram | 12.9% | 548 ms | no disponible | API de Deepgram |

LiveKit Turn Detector v1 supera a turn-1 en tres de las cuatro metricas principales (300 ms, latencia al 5% y latencia al 10%) y empata en la cuarta (600 ms). turn-1 supera a JoinIn AI Baton en las cuatro estimaciones puntuales. No se realizo ninguna prueba pareada contra otras entradas y, segun el autor, los intervalos de un solo modelo se solapan, por lo que las diferencias no deben interpretarse como concluyentes. No se dispone de datos de parametros ni de contexto de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha medido en ingles. No se ejecuto ningun otro idioma ni se reclama ningun numero multilingue.
- Modelo pesado: para cada decision se ejecutan dos modelos de voz (2,0B y 0,8B parametros); el autor lo describe explicitamente como un modelo de servidor con GPU.
- El tiempo por decision no se ha medido en esta configuracion, por lo que no hay cifras fiables de latencia de computo.
- La latencia reportada en el benchmark es silencio muerto elegido por el barrido de politica, no tiempo de computo: umbral, retardo de accion y timeout se seleccionan sobre los mismos 400 turnos que luego se puntuan.
- Entrada limitada en banda: todo el audio se filtra paso bajo a 4 kHz dentro del paquete, lo que descarta informacion de alta frecuencia.
- Se puntuaron dos candidatos sobre el test set y se conservo el segundo bajo una regla fijada antes de puntuarlo; emparejados en los mismos turnos, la diferencia entre ambos incluye cero en las cuatro medidas.
- No se realizaron pruebas pareadas contra otras entradas del board y los intervalos se solapan: las comparaciones puntuales deben tomarse con cautela.
- Riesgo de alucinacion: no aplica en el sentido generativo porque el modelo no genera texto, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de fin de turno (10,6% de cortes falsos a 300 ms en el benchmark).
- No se especifican sesgos conocidos, ni composicion del dataset de entrenamiento, ni etapas de alineamiento; la informacion sobre entrenamiento es muy limitada.
- Licencia Apache-2.0 para las partes propias. Los codificadores de terceros no se redistribuyen y se descargan de sus repositorios originales bajo sus propias licencias (Apache-2.0 segun la model card); conviene revisar el `NOTICE` antes de uso comercial.
- El umbral de decision debe calibrarse sobre el audio propio; no hay punto de decision fijo y los resultados del benchmark dependen del barrido de politica.
- El modelo descarga dependencias externas en revisiones fijadas, lo que puede afectar a la reproducibilidad si esas revisiones dejan de estar accesibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/p99lab/turn-1
- Modelo para dispositivo (variante mini, 5,3M parametros): https://huggingface.co/p99lab/turn-1-mini
- Dataset de evaluacion: https://huggingface.co/datasets/livekit/eot-bench-data (referenciado como `livekit/eot-bench-data`, revision `ca9d98a`, harness commit `9ee21b5`)
- Dependencia de codigo de los codificadores: `qwen-asr==0.0.6` (PyPI)
- Paquete de inferencia: `p99turn1-1.0.0-py3-none-any.whl` (incluido en el repositorio, ruta `dist/`)
- Web del autor: https://p99lab.com
- Contacto del autor: research@p99lab.com
