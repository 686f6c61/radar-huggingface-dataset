# pipecat-ai/tone-models

## Resumen

Pipecat Tone es una colección de dos modelos ligeros de CPU desarrollados por el equipo de Pipecat (pipecat-ai), diseñados para dotar de expresividad a agentes de voz conversacionales. No se trata de un LLM generativo, sino de un par de clasificadores especializados en texto: el **Tone reader**, que detecta la emoción y el sarcasmo en los turnos del usuario, y el **Tone tagger**, que anota las respuestas del LLM con etiquetas de expresión (tono de entrega, ritmo lento, palabras acentuadas, sonidos y respiraciones) que el TTS interpreta al sintetizar la voz.

Ambos modelos se integran en el ecosistema de Pipecat a través del Real-time Context Standard (RCS), un estándar que permite que los componentes de un agente de voz (STT, LLM, TTS) compartan contexto más allá de las palabras en el propio flujo de texto. El resultado es un pipeline donde el LLM escribe solo palabras, la percepción del tono del usuario encabeza su mensaje en el contexto del LLM, y las etiquetas de expresión llegan al TTS listas para ejecutarse. Su relevancia radica en que resuelven un problema real de los agentes de voz —la planitud emocional y la incapacidad de reaccionar al tono del interlocutor— con modelos tan pequeños que corren en milisegundos sobre CPU, sin necesidad de GPU.

Los modelos base son MiniLM-L6 (24,2M de parámetros) para el reader y los codificadores Ettin de 17M y 32M para el tagger, distribuidos en formato ONNX con cuantización. El repositorio pesa 5,1 GB e incluye también los datos sintéticos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificadores transformer (MiniLM-L6 para el reader; Ettin encoder para el tagger), pipeline de text-classification |
| Parametros totales | Reader: 24,2M; Tagger: 17M o 32M segun variante |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (operan a nivel de turno/frase) |
| Tipos de cuantizacion | Reader: fp16 (48 MB) o fp32 (96 MB); Tagger: int8 (63 MB o 115 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El sistema se compone de dos modelos independientes. El **reader** se basa en sentence-transformers/all-MiniLM-L6-v2 (24,2M de parametros) y funciona como "perception producer": clasifica cada turno del usuario segun emocion (hasta nueve clases) y sarcasmo, con confianzas calibradas. En su version rc2, el reader utiliza la linea del agente como contexto para leer el sarcasmo, lo que le permite interpretar frases como "Oh great" segun lo que el agente acaba de decir. El **tagger** se basa en los codificadores Ettin de JHU (jhu-clsp/ettin-encoder-17m y jhu-clsp/ettin-encoder-32m) y funciona como "expression producer": anota, frase a frase, las respuestas en texto plano del LLM con etiquetas de entrega, tramos lentos, palabras acentuadas, sonidos y respiraciones, usando los nombres que los TTS (Cartesia, ElevenLabs, Fish Audio, MiniMax) ejecutan nativamente. El tagger tiene seis cabezas de clasificacion.

Los datos de entrenamiento son en su mayoria sinteticos: el tagger se entreno con 4.999 llamadas sinteticas de soporte, generadas a traves de un pipeline real de Pipecat, con cada frase etiquetada por Claude como modelo profesor y division por dominios. El reader se entreno con 30.000 turnos sinteticos de llamadas de soporte y 2.000 pares de contraste, ademas de datos derivados de conjuntos publicos (NatCS, Taskmaster, ABCD, MultiWOZ 2.2, STAR, GoEmotions, iSarcasmEval, DynaSent, entre otros). No se trata de un modelo generativo: no hay RLHF ni DPO, sino entrenamiento supervisado de clasificacion con destilacion desde un LLM profesor en el caso del tagger. La distribucion de respiraciones generadas se calibro con el ICSI Meeting Corpus (59 % ligeras, 36 % profundas, 5 % exhalaciones).

## Capacidades

- **Deteccion de emocion en texto**: clasifica el turno del usuario en hasta nueve emociones con confianzas calibradas (error de calibracion de 0,077 en el caso binario neutral/happy).
- **Deteccion de sarcasmo con contexto**: lee el sarcasmo considerando la linea previa del agente, con F1 de 0,959 en llamadas de soporte.
- **Etiquetado de expresion para TTS**: genera etiquetas de entrega (apologetic, etc.), tramos lentos para datos concretos, palabras acentuadas, sonidos y respiraciones, frase a frase.
- **Insercion de respiraciones realistas**: como maximo una por respuesta, con distribucion calibrada frente a hablantes humanos.
- **Integracion nativa con Pipecat**: procesadores `PipecatToneReader` y `PipecatToneTagger` listos para insertar en el pipeline, compatibles con el Real-time Context Standard.
- **Ejecucion en CPU en tiempo real**: latencias de milisegundos por turno o frase, aptas para conversacion de voz en directo.
- **Compatibilidad con TTS comerciales**: conoce los nombres de etiquetas de Cartesia, ElevenLabs, Fish Audio y MiniMax; otros TTS se emparejan por los nombres que declaren.

## Casos de uso

- **Atencion al cliente por voz**: el reader detecta frustracion o sarcasmo en el turno del usuario ("Oh great, a forty minute wait") y el LLM puede ajustar su respuesta; el tagger hace que el TTS suene disculpado o empatico segun corresponda.
- **Agentes de soporte telefonico expresivos**: el tagger marca tramos lentos para numeros de pedido o fechas ("<<slow: 48213>>") y acentua palabras clave, mejorando la comprension en dictados de datos.
- **Asistentes de voz con respiraciones naturales**: insercion de respiraciones ocasionales calibradas con datos humanos, que reducen el caracter robotico de las respuestas largas.
- **Desambiguacion de intencion en conversaciones multi-turno**: al incluir la percepcion emocional en el contexto del LLM via RCS, el modelo puede distinguir un "perfecto" sincero de uno ironico tras un error del agente.
- **Pipelines de voz en tiempo real con presupuesto de hardware ajustado**: ambos modelos corren en CPU en pocos milisegundos, por lo que pueden desplegarse junto al resto del agente sin GPU adicional.
- **Prototipado rapido de agentes de voz con Pipecat**: integracion en una linea de pipeline a partir de Pipecat 1.15.0, con descarga automatica de pesos al arrancar.
- **Analisis post-llamada de tono**: aunque su proposito principal es en directo, la salida calibrada del reader (emocion y sarcasmo con confianzas) puede registrarse para metricas de calidad de conversacion, siempre respetando la advertencia de no usarlo para perfilar personas.

## Benchmarks y rendimiento

Datos publicados por los autores en la model card:

**Reader (rc2)**, frente al voto por mayoria de tres LLMs, en turnos no vistos en entrenamiento:

| Metrica | Llamadas reales (1.500 turnos) | Llamadas con mas emoción (897 turnos) |
|---|---|---|
| Emocion macro-F1 | 0,936 (neutral, happy) | 0,677 (las nueve clases) |
| Sarcasmo | 1 de 1.496 turnos sinceros marcado como sarcastico | F1 0,903 |
| Error de calibracion (emocion, sarcasmo) | 0,077 / 0,015 | 0,027 / 0,010 |

| Metrica adicional (rc2) | Valor |
|---|---|
| Sarcasmo F1 en 3.752 turnos de llamadas de soporte | 0,959 (rc1: 0,903) |
| Pares de contraste leidos correctamente (365 pares) | 94,0 % (rc1: 49,0 %) |
| Latencia p95 por turno, 4 hilos de CPU (Apple M1 Max) | 5,0 ms |

**Tagger**, frente a las etiquetas de su modelo profesor en 439 llamadas reservadas (puntuacion combinada):

| Variante | Puntuacion | Latencia p50 por frase, 1 hilo |
|---|---|---|
| 17M (por defecto) | 0,753 | 13,8 ms |
| 32M | 0,767 | 37,1 ms |

Los autores advierten que estas metricas miden acuerdo con etiquetas de modelos, no con oyentes humanos.

## Requisitos de hardware

- **VRAM**: no aplica; ambos modelos estan diseñados para ejecutarse en CPU. El reader ocupa 48 MB (fp16) o 96 MB (fp32); el tagger 63 MB (17M, int8) o 115 MB (32M, int8) en disco.
- **GPU recomendadas**: no se requiere GPU. No hay datos de ejecucion en GPU.
- **Consumer hardware**: sobrado cualquier equipo moderno; la referencia publicada es un Apple M1 Max, donde el reader alcanza un p95 de 5,0 ms por turno con 4 hilos. El tagger procesa una frase en 13,8 ms (17M) o 37,1 ms (32M) con un solo hilo.
- **Despliegue**: integracion nativa en Pipecat 1.15.0 o superior mediante `pipecat-ai[tone]` y los procesadores `PipecatToneReader` y `PipecatToneTagger`. Los pesos se descargan automaticamente de Hugging Face al iniciar el pipeline. No se mencionan opciones como llama.cpp, Ollama, vLLM o TGI (no son aplicables a modelos ONNX de clasificacion).
- **Latencia y throughput**: ver tabla de benchmarks; ambas latencias son compatibles con conversacion de voz en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Diferencia clave |
|---|---|---|---|---|---|
| Pipecat Tone (reader + tagger) | 24,2M + 17M/32M | Emocion/sarcasmo y etiquetado expresivo para TTS en agentes de voz | ONNX | BSD-2-Clause | Integrado en pipeline de voz con RCS; etiquetas que los TTS ejecutan |
| GoEmotions (BERT-base clasificador) | ~110M | Clasificacion de 27 emociones en texto | PyTorch | Apache 2.0 (dataset) | Solo percepcion, sin etiquetado de expresion ni integracion TTS; no detecta sarcasmo con contexto |
| SamLowe/roberta-base-go_emotions | ~125M | Clasificacion de emociones multi-etiqueta | PyTorch/ONNX | Apache 2.0 | Modelo generalista mas grande y lento; sin calibracion orientada a agentes de voz ni componente de expresion |

No existen alternativas directas publicas que combinen percepcion de tono y generacion de etiquetas de expresion para TTS en un estandar de contexto en tiempo real, por lo que la comparativa se limita a clasificadores de emocion genericos.

## Limitaciones y advertencias

- **Solo ingles**: ninguno de los dos modelos soporta otros idiomas; el tagger aprendio exclusivamente de llamadas de soporte y el reader de conversaciones de soporte, asistente y reuniones.
- **Lee texto, no audio**: el reader opera sobre transcripciones; una transcripcion plana (sin puntuacion ni marcadores) se leera como neutral, y no puede captar pistas prosodicas del habla real.
- **Uso etico restringido por diseño**: los autores indican explicitamente que los modelos son para dar forma a como suena un agente de voz, no para juzgar ni perfilar a las personas con las que habla.
- **Metricas contra modelos profesor**: las puntuaciones miden acuerdo con etiquetas de otros LLMs, no con percepcion humana; el rendimiento real ante oyentes no esta validado.
- **Compatibilidad TTS limitada por nombre**: el tagger conoce Cartesia, ElevenLabs, Fish Audio y MiniMax; con otros TTS el emparejamiento de etiquetas depende de los nombres que estos declaren, lo que puede degradar la expresividad.
- **Dominio acotado**: el tagger esta especializado en llamadas de soporte; fuera de ese dominio su comportamiento no esta caracterizado.
- **Licencia**: BSD-2-Clause es permisiva y permite uso comercial, pero los datasets publicos referenciados conservan sus propias licencias, y los splits de test de Topical-Chat (CDLA-Sharing-1.0) son solo para evaluacion.
- **Descargas y madurez**: el repositorio registra 0 descargas y las versiones publicadas son candidatas (rc1/rc2), lo que sugiere que la API y los pesos pueden cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/tone-models
- Repositorio de Pipecat en GitHub: https://github.com/pipecat-ai/pipecat
- Real-time Context Standard (documentacion): https://docs.pipecat.ai/api-reference/standards/real-time-context-standard
- Conversacion expresiva en Pipecat: https://docs.pipecat.ai/pipecat/features/expressive-conversation
- Referencia de los procesadores Tone: https://docs.pipecat.ai/api-reference/server/expressive/pipecat-tone
- Modelos base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2, https://huggingface.co/jhu-clsp/ettin-encoder-17m, https://huggingface.co/jhu-clsp/ettin-encoder-32m
