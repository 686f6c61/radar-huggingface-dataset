# ooma-ai/turn-detector

## Resumen

turn-detector es un modelo de deteccion de turno (turn-taking) en streaming disenado para agentes de voz full-duplex. Desarrollado por ooma-ai, resuelve una pregunta concreta en cada paso de decision: el hablante actual ha terminado su turno o solo esta haciendo una pausa. El modelo lee una conversacion entre dos interlocutores con un canal de audio por hablante y emite una probabilidad por paso de que la pausa en curso sea un final de turno.

La pieza central es un encoder de 120 M de parametros: `nvidia/parakeet_realtime_eou_120m-v1`, un FastConformer en streaming construido para pipelines de agentes de voz. Sobre ese encoder se aplica un objetivo de preentrenamiento auto-supervisado llamado Voice Activity Projection (VAP), que predice quien estara hablando en las siguientes ventanas en lugar de etiquetar directamente el final de turno. La decision final la produce un MLP pequeno que combina el estado del hablante evaluado con un estado conjunto de los dos canales.

El modelo es causal: cada marca temporal que emite corresponde al instante en que ya se ha escuchado todo el audio del que depende la decision, de modo que cualquier lookahead se paga como latencia y no queda oculto dentro de la marca. Es relevante porque ataca el problema del endpointing en voz conversacional, donde los VAD genericos confunden pausas intra-turno con finales de turno y provocan cortes prematuros. Cabe senalar que el repositorio publica unicamente la descripcion del modelo: los pesos no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer en streaming (encoder preentrenado con Voice Activity Projection) mas cabeza de decision MLP; sistema causal |
| Parametros totales | Aproximadamente 120 M en el encoder; el tamano de la cabeza de decision no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de streaming causal; decisiones sobre una rejilla fija de 160 ms) |
| Tipos de cuantizacion | No disponible (los pesos no estan publicados) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para el modelo; el encoder subyacente esta bajo la NVIDIA Open Model License |
| Formato de pesos | No disponible (el repositorio no publica pesos) |

## Arquitectura y entrenamiento

El sistema se compone de cuatro elementos. El encoder es `nvidia/parakeet_realtime_eou_120m-v1`, un FastConformer en streaming de 120 M de parametros del que solo se reutilizan el front end mel y la pila del encoder como extractor de caracteristicas; el decodificador de reconocimiento y su token `<EOU>` no se emplean. Sobre ese encoder se aplica un objetivo auto-supervisado de Voice Activity Projection, que predice quien hablara durante las siguientes ventanas a partir del estado actual, en lugar de aprender directamente una etiqueta de fin de turno. La referencia es Ekstedt y Skantze, *Voice Activity Projection: Self-supervised Learning of Turn-taking Events* (Interspeech 2022).

La cabeza de decision es un MLP pequeno que lee el estado del encoder correspondiente al hablante evaluado junto con un estado conjunto de los dos canales, y emite una probabilidad por paso de que la pausa actual sea un final de turno. La cabeza solo se consulta cuando el canal esta en silencio, y ese silencio lo determina un ensemble promediado de detectores de actividad de voz publicos: Silero VAD, FSMN-VAD y `earshot`. Solo se incluyen detectores que son ellos mismos causales, de modo que la compuerta no introduce lookahead adicional. Las decisiones se toman sobre una rejilla fija de 160 ms, sujetas a una duracion minima de silencio y con una opcion de re-commit retardado mientras el canal permanece en silencio; esta politica de commit es configurable en tiempo de servicio, con independencia del modelo.

En cuanto al audio, el sistema trabaja a 16 kHz con un canal por hablante. Las frecuencias de muestreo superiores se convierten mediante un resampler FIR causal, por lo que el remuestreo tampoco anade lookahead.

## Capacidades

- Deteccion de final de turno (end-of-utterance) en conversaciones de dos hablantes con un canal de audio por interlocutor.
- Distincion entre pausa intra-turno y final de turno real, que es el objetivo central del modelo.
- Deteccion de interrupciones (barge-in) en el marco de evaluacion TurnBench de Sesame.
- Procesamiento en streaming causal, apto para pipelines en tiempo real.
- Emision de decisiones sobre una rejilla temporal fija de 160 ms.
- Re-commit retardado opcional cuando el canal sigue en silencio, para reducir falsos cortes.
- Integracion con deteccion de actividad de voz preexistente mediante una compuerta de armado basada en ensemble.
- Soporte de audio a 16 kHz con remuestreo causal desde frecuencias superiores.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un componente de senal, no un modelo generativo.

## Casos de uso

- Agentes de voz full-duplex: el modelo decide cuando el usuario ha terminado de hablar antes de que el agente responda, lo que permite solapar la generacion de la respuesta con la escucha y reducir la latencia percibida.
- Endpointing en centros de contacto: sustituye al VAD generico en la deteccion de fin de intervencion del cliente, evitando cortes prematuros cuando el usuario hace una pausa para pensar.
- Deteccion de interrupciones en asistentes: permite distinguir cuando el usuario interrumpe activamente al agente de cuando simplemente emite retroalimentacion breve, util para gestionar el barge-in sin cortar la respuesta en curso.
- Voicebots con presupuesto de latencia estricto: la naturaleza causal y la rejilla de 160 ms hacen que la decision sea predecible en coste temporal, algo critico en pipelines que fijan un retardo maximo de respuesta.
- Transcripcion de reuniones con dos canales: al recibir un canal por hablante, ayuda a segmentar turnos y a alinear la transcripcion con los cambios de interlocutor.
- Analisis de conversaciones: metricas de duracion de turno, solapamiento e interrupciones en grabaciones de dos canales, utiles para supervision de calidad en atencion al cliente.
- Componente de investigacion en turn-taking: sirve como referencia para comparar politicas de endpointing contra TurnBench o el `eot-bench` de LiveKit.
- Preprocesado para ASR en tiempo real: la marca temporal causal que emite puede usarse para disparar la finalizacion de un chunk de reconocimiento sin anadir lookahead.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo se ha desarrollado contra benchmarks publicos de turn-taking en streaming, que puntuan eventos sobre una conversacion en curso en lugar de medir exactitud sobre clips precortados:

- TurnBench (Sesame): deteccion de final de turno e interrupciones sujetas a un limite de latencia y a un presupuesto de falsos positivos.
- `eot-bench` de LiveKit: falsos cortes con un presupuesto fijo de retardo de respuesta.

No se facilitan cifras numericas para ninguno de los dos.

## Requisitos de hardware

- VRAM estimada para el encoder de 120 M de parametros: en torno a 480 MB en FP32, 240 MB en FP16 y 120 MB en INT8, sin contar estados intermedios ni los detectores de VAD del ensemble. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente para el encoder; una RTX 3060, RTX 4060 o superior es mas que adecuada.
- Tambien es viable en CPU para despliegues de baja concurrencia, dado el tamano reducido del modelo en streaming.
- GPU de centro de datos (A100, H100, L40S) solo se justificarian por volumen de concurrencia, no por requisitos de memoria del modelo.
- Opciones de despliegue: no disponible. Al no publicarse pesos, no se puede desplegar con vLLM, llama.cpp, Ollama ni TGI en el estado actual del repositorio.
- Latencia y throughput: no disponibles. El unico parametro temporal documentado es la rejilla de decision de 160 ms y la duracion minima de silencio, que son parte de la politica de servicio y no una medida de rendimiento del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ooma-ai/turn-detector | Deteccion de turno en streaming (FastConformer + VAP) | ~120 M (encoder) | Rejilla de decision de 160 ms | No disponible | Solo descripcion; sin pesos |
| nvidia/parakeet_realtime_eou_120m-v1 | ASR en streaming con token `<EOU>` | 120 M | No disponible | NVIDIA Open Model License | Pesos publicados |
| Silero VAD | Deteccion de actividad de voz | No disponible | No disponible | No disponible en la informacion | Codigo y pesos publicos |
| FSMN-VAD (FunASR) | Deteccion de actividad de voz | No disponible | No disponible | No disponible en la informacion | Codigo y pesos publicos |
| Modelos VAP (Ekstedt y Skantze) | Voice Activity Projection | No disponible | No disponible | No disponible en la informacion | Repositorio de investigacion publico |

La diferencia principal frente a un VAD convencional es que estos solo detectan presencia de voz, mientras que turn-detector responde a una pregunta de turno con un objetivo entrenado especificamente para ello. Frente a `parakeet_realtime_eou_120m-v1`, reutiliza su encoder pero descarta el decodificador y el token de fin de utterance, y anade una cabeza de decision y una compuerta de VAD en ensemble. No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- Los pesos no estan publicados: el repositorio unicamente contiene la descripcion del modelo, por lo que no es utilizable en produccion tal como esta.
- La licencia del modelo no esta indicada, lo que impide determinar si el uso comercial esta permitido. El encoder subyacente si esta sujeto a la NVIDIA Open Model License, con sus propias condiciones.
- El modelo solo soporta ingles; no se documenta comportamiento en otros idiomas.
- Esta disenado para conversaciones de dos hablantes con un canal de audio por interlocutor. No se describe soporte para mas de dos participantes ni para audio mezclado en un solo canal.
- Requiere audio a 16 kHz; otras frecuencias se remuestrean de forma causal, lo que puede introducir artefactos de calidad no cuantificados.
- No es un modelo generativo: no produce texto, codigo ni razonamiento, y no soporta tool calling ni agentes.
- La salida es probabilistica por paso; el comportamiento final depende en gran medida de la politica de commit (duracion minima de silencio, re-commit retardado), que es configurable y puede alterar de forma notable la tasa de falsos cortes.
- La compuerta de armado depende de tres VAD externos (Silero, FSMN-VAD y `earshot`), lo que anade dependencias de terceros y posibles sesgos heredados de esos detectores.
- No se han publicado resultados cuantitativos, por lo que no es posible validar el rendimiento declarado frente a alternativas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de final de turno, con impacto directo en la experiencia conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ooma-ai/turn-detector
- Encoder base: https://huggingface.co/nvidia/parakeet_realtime_eou_120m-v1
- Paper de Voice Activity Projection: https://arxiv.org/abs/2205.09812
- Repositorio VoiceActivityProjection: https://github.com/ErikEkstedt/VoiceActivityProjection
- TurnBench (Sesame): https://github.com/SesameAILabs/turnbench
- Silero VAD: https://github.com/snakers4/silero-vad
- FSMN-VAD (FunASR): https://github.com/modelscope/FunASR
- NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/

Nota: la busqueda web asociada no devolvio resultados relevantes sobre el modelo; los enlaces listados proceden de la model card y de las referencias citadas en ella.
