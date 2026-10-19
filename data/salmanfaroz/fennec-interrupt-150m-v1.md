# SalmanFaroz/fennec-interrupt-150m-v1

## Resumen

fennec-interrupt-150m-v1 es un clasificador de texto de 149,6 millones de parámetros desarrollado por SalmanFaroz y afinado a partir de `answerdotai/ModernBERT-base`. Su tarea es muy concreta: decidir si el sonido o la frase que emite un interlocutor mientras un agente de voz está hablando es un simple asentimiento (backchannel) que no debe interrumpir el turno del agente, o si por el contrario el usuario está tomando la palabra y el agente debe callarse. Devuelve una de 10 etiquetas (`BACKCHANNEL`, `ACK_AFTER_QUESTION`, `ANSWER`, `QUESTION`, `CORRECTION`, `STOP_REQUEST`, `HOLD_REQUEST`, `CANT_HEAR`, `PICKUP_GREETING`, `TAKES_TURN`) y un booleano `keep_talking` que la lógica de turnos puede consumir directamente.

El problema que resuelve es endémico en telefonía automatizada y asistentes de voz: los sistemas de detección de actividad vocal (VAD) disparan la interrupción ante cualquier sonido, lo que produce cortes constantes en usuarios que solo dicen "mm-hmm". Este modelo añade contexto semántico a esa decisión leyendo tres campos de texto: lo que el agente ya dijo (`said`), lo que le quedaba por decir (`unsaid`) y lo que dijo el interlocutor (`caller`). Distinguir "mm-hmm" de "no, espera" en mitad de una frase es precisamente lo que un VAD no puede hacer y un clasificador de texto sí.

Es relevante por su tamaño y su latencia: 12 ms en fp16 sobre una GPU modesta y unos 60 ms en CPU con 4 hilos, con un peso en memoria de aproximadamente 0,3 GB en fp16. Eso permite ejecutarlo en el bucle caliente de un agente conversacional, reevaluando cada ~0,25 s, sin competir por recursos con el LLM principal ni con el TTS. Es un modelo de hobby (v1), en inglés, con licencia Apache 2.0 y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT), afinado para clasificacion de secuencias |
| Parametros totales | 149.612.554 (149,6 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en el modelo base ModernBERT; el fine-tune limita la entrada a 96 tokens |
| Tipos de cuantizacion | no disponible (el autor solo cita fp32 en CPU y fp16 en GPU) |
| Idiomas soportados | ingles unicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB, libreria `transformers`) |

## Arquitectura y entrenamiento

La base es ModernBERT-base, un encoder transformer con embeddings posicionales rotatorios (RoPE), atencion alternada entre capas locales (ventana de 128 tokens) y globales, y soporte de Flash Attention y unpadding. Sobre esa base se ha añadido una cabeza de clasificacion para 10 clases. El autor no documenta la arquitectura de la cabeza ni si se congelaron capas durante el ajuste fino.

La innovacion del modelo no esta en la arquitectura, sino en la formulacion de la entrada: el texto se compone de los tres campos `said`, `unsaid` y `caller`, se normaliza (minusculas y limpieza) con los ficheros `textnorm.py` y `format_input.py` tomados sin cambios de `ozonetg/bargein-classifier-ettin-150m` (MIT), y se trunca a 96 tokens, recortando el final de `unsaid` si hace falta. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO o ajuste supervisado clasico; esa informacion no esta disponible en la model card.

## Capacidades

- Clasificacion de intencion conversacional en 10 etiquetas cerradas, con probabilidades por clase (`probs`) y probabilidad de parada (`p_stop`).
- Decision binaria de continuar o detener el turno del agente (`keep_talking`), pensada para integrarse en la logica de interrupcion de un agente de voz.
- Deteccion de backchannels ("mm-hmm", "uh-huh", "okay" a mitad de frase) frente a tomas de turno reales.
- Diferenciacion de matices que dependen del contexto del agente: `ACK_AFTER_QUESTION` cuando la frase del agente termina en pregunta de si/no, frente a `BACKCHANNEL` cuando el asentimiento llega a mitad de oracion.
- Reconocimiento de correcciones ("no, perdon, business class"), peticiones de parada ("stop, stop"), peticiones de espera ("wait, hold on") y peticiones de repeticion ("sorry, what?").
- Deteccion de saludo de recogida de llamada (`PICKUP_GREETING`, "hello?"), util para arrancar el flujo cuando el usuario descolga.
- No procesa audio: requiere un modelo de speech-to-text por delante. No soporta tool calling, agentes, vision ni modo thinking.

## Casos de uso

- Interrupcion selectiva en bots telefonicos: el modelo se ejecuta cada ~0,25 s sobre la transcripcion parcial del usuario; si la etiqueta no es `BACKCHANNEL`, la capa de orquestacion corta el TTS del agente de inmediato. Con 12 ms en GPU, la latencia añadida al bucle de turno es despreciable.
- Reduccion de falsos cortes por asentimientos: filtrar los "mm-hmm" y "uh-huh" que hoy disparan el VAD permite que el agente termine frases largas (por ejemplo, leer condiciones de tarifa) sin reinicios constantes.
- Gestion de correcciones en reservas: cuando el usuario dice "no, perdon, business class" mientras el agente confirma un vuelo, la etiqueta `CORRECTION` permite cancelar la confirmacion pendiente antes de que se persista en el backend.
- Deteccion de peticiones de espera en atencion al cliente: `HOLD_REQUEST` ("wait, hold on, let me check") puede activar un modo de silencio con musica o mensaje de espera en lugar de seguir hablando.
- Recuperacion de fallos de reconocimiento: `CANT_HEAR` ("sorry, what?") permite lanzar una repeticion mas lenta o con vocabulario simplificado sin que el usuario tenga que colgar y volver a llamar.
- Apertura de llamada saliente: `PICKUP_GREETING` distingue un "hello?" de descolgado de una respuesta real, evitando que el agente empiece el guion antes de que el usuario este escuchando.
- Evaluacion offline de grabaciones: ejecutar el clasificador sobre transcripciones diarizadas para medir cuantas interrupciones de una campana fueron backchannels reales, como metrica de calidad del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de latencia, no de exactitud, F1 ni matrices de confusion.

| Medicion | Entorno | Valor |
|---|---|---|
| Latencia, batch 1, CPU | Ryzen 7 5800H, 4 hilos, fp32 | ~60 ms |
| Latencia, batch 1, GPU | RTX 3070 8 GB, fp16 | ~12 ms |
| Memoria en GPU | fp16 | ~0,3 GB |

## Requisitos de hardware

- VRAM estimada: ~0,3 GB en fp16; ~0,6 GB en fp32. Cabe holgadamente en cualquier GPU consumer de los ultimos diez años.
- GPU recomendadas: no necesita GPU dedicada. Cualquier RTX 3060/3070/4060/4090, T4, L4, A10 o superior ejecuta el modelo en el rango de 10-15 ms por inferencia.
- Cabe en consumer GPU: si, sin practicamente impacto en el presupuesto de memoria si convive con un LLM en la misma maquina.
- CPU: viable en produccion para un unico flujo de llamada (~60 ms con 4 hilos); para decenas de llamadas concurrentes conviene GPU o varias instancias.
- Opciones de despliegue: `transformers` en proceso, `text-embeddings-inference` (el repo declara `endpoints_compatible`), o exportacion a ONNX Runtime para reducir latencia en CPU. Al ser un encoder de 149 M, tambien es candidato a cuantizacion int8 si se necesita, aunque el autor no publica variantes cuantizadas.
- Throughput: no publicado. Con batch y GPU, 149 M parametros admiten facilmente cientos de inferencias por segundo, pero es una estimacion, no un dato medido por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fennec-interrupt-150m-v1 | 149,6 M | 96 tokens (efectivo) | Clasificacion de interrupcion, 10 clases | Apache 2.0 | HuggingFace |
| fennec-handoff-150m-v1 | no disponible (mismo autor, gama 150 M) | no disponible | Modelo hermano del mismo pipeline de voz; tarea de handoff | no disponible | HuggingFace |
| ozonetg/bargein-classifier-ettin-150m | gama 150 M (familia Ettin) | no disponible | Clasificacion de barge-in; origen del codigo de normalizacion reutilizado | MIT (segun la model card) | HuggingFace |

No se dispone de datos publicados que permitan comparar rendimiento (exactitud, F1) entre estas alternativas; la comparativa se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo ingles: cualquier llamada en castellano u otro idioma queda fuera del alcance declarado por el autor.
- Entrada limitada a 96 tokens; el final de `unsaid` se recorta, de modo que si el agente tiene una cola de frase muy larga el modelo pierde el contexto decisivo.
- Ambiguedad conocida con "okay" y "right": si la frase del agente termina en pregunta de si/no, el modelo puede leerlos como `ACK_AFTER_QUESTION` en lugar de `BACKCHANNEL`. "mm-hmm" se mantiene como asentimiento.
- Si se pasa un campo `unsaid` vacio (agente entre frases), un asentimiento puede interpretarse como respuesta. Es un error de integracion frecuente.
- No procesa audio: necesita un STT previo, y los errores de transcripcion se propagan directamente a la clasificacion.
- No hay benchmarks publicados ni datos sobre el dataset de entrenamiento, por lo que se desconoce el sesgo por acento, genero, ruido telefonico o dominio (reservas de vuelo es el ejemplo de la model card; otros dominios no estan evaluados).
- Etiquetas cerradas: no cubre fenomenos conversacionales fuera de las 10 clases; todo lo demas cae en `TAKES_TURN`, lo que puede provocar cortes innecesarios.
- Version 1 declarada como trabajo de hobby por el autor; recomienda probarla sobre llamadas propias antes de fiarse en produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del codigo de preprocesamiento de terceros (MIT) si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SalmanFaroz/fennec-interrupt-150m-v1
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo hermano fennec-handoff-150m-v1: https://huggingface.co/SalmanFaroz/fennec-handoff-150m-v1
- Repositorio del pipeline de voz completo (VAD, STT, LLM, TTS, UI): https://github.com/stsfaroz/fennec-voice
- Demo en video: https://huggingface.co/SalmanFaroz/fennec-interrupt-150m-v1/resolve/main/assets/demo.mp4
- Origen del codigo de normalizacion y formateo de entrada: https://huggingface.co/ozonetg/bargein-classifier-ettin-150m
