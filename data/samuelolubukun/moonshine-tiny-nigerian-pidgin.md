# samuelolubukun/moonshine-tiny-nigerian-pidgin

## Resumen

Moonshine-Tiny Nigerian Pidgin es un modelo de reconocimiento automatico del habla (ASR) obtenido por ajuste fino del checkpoint `UsefulSensors/moonshine-tiny` sobre el corpus `asr-nigerian-pidgin/nigerian-pidgin-1.0`. Lo desarrolla Samuel Olubukun y su objetivo es dotar de transcripcion de voz al pidgin nigeriano (`pcm`), una lengua con escasisimos recursos ASR publicos pese a su amplia base de hablantes en Nigeria. El modelo tiene 27.093.312 parametros y un tamano de repositorio de 0,1 GB, lo que lo situa en la categoria de ASR ultraligero para dispositivos moviles y agentes de voz en tiempo real.

La arquitectura es la de Moonshine: un transformer encoder-decoder disenado especificamente para audio de duracion variable, sin el padding fijo a 30 segundos que impone Whisper. Esa caracteristica, combinada con el reducido numero de parametros, permite un factor de tiempo real (RTF) de 0,082x, es decir, unas 12,2 veces mas rapido que tiempo real, con latencias inferiores a 200 ms para clips de 4 segundos.

La relevancia actual del modelo es doble: por un lado, amplia la cobertura linguistica del ecosistema Moonshine hacia lenguas africanas; por otro, demuestra un flujo de trabajo reproducible de ajuste fino de ASR con muy pocos recursos (una sola NVIDIA A10G y 3.000 pasos de optimizacion). Sus cifras de error son altas (WER normalizado del 54,9 %), por lo que debe entenderse como un punto de partida y no como un sistema listo para produccion sin reservas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine) |
| Parametros totales | 27.093.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de duracion variable; presupuesto de generacion ~7 tokens por segundo de audio, tope de 90 tokens en el ejemplo del autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa float16/bfloat16 en inferencia) |
| Idiomas soportados | pidgin nigeriano (`pcm`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos declarados por el autor: entrada de audio a 16.000 Hz, 16 bits, mono PCM; entrenamiento en precision mixta float16/bfloat16; 3.000 pasos de optimizacion con AdamW y decaimiento coseno; hardware de entrenamiento NVIDIA A10G (24 GB de VRAM).

## Arquitectura y entrenamiento

El modelo parte de `UsefulSensors/moonshine-tiny`, un transformer encoder-decoder de unos 27 millones de parametros. Moonshine procesa directamente la longitud real del audio de entrada en lugar de rellenarlo a ventanas fijas de 30 segundos, lo que reduce el coste computacional en clips cortos y explica en buena parte su RTF tan bajo. El decoder genera la transcripcion de forma autoregresiva, con un presupuesto de tokens que el autor recomienda escalar a razon de aproximadamente 7 tokens por segundo de audio (con minimo de 25 y maximo de 90 en el ejemplo de inferencia).

El ajuste fino se realizo sobre grabaciones reales del corpus `asr-nigerian-pidgin/nigerian-pidgin-1.0`, con 3.000 pasos de optimizacion, AdamW, decaimiento coseno y precision mixta float16/bfloat16 sobre una A10G. La model card no detalla el volumen de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos, RLHF o DPO; esos datos figuran como no disponibles. Tampoco se documenta una extension explicita del vocabulario del tokenizer, aunque el autor menciona "extended dialect vocabulary" en la descripcion del repositorio sin aportar cifras.

## Capacidades

- Transcripcion de voz a texto (ASR) para pidgin nigeriano, con salida en texto plano.
- Procesamiento de audio de duracion variable sin padding fijo a 30 segundos, gracias a la arquitectura Moonshine.
- Inferencia de muy baja latencia: RTF de 0,082x y menos de 200 ms por cada 4 segundos de audio.
- Ejecucion viable en CPU y en GPU de gama baja por el reducido tamano del modelo (27M de parametros).
- Normalizacion de texto compatible con el normalizador basico de Whisper para el calculo de WER y CER.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento extendido.
- Capacidad multilingue limitada al pidgin nigeriano; no se declaran otros idiomas.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones de mensajeria para usuarios de pidgin nigeriano: el modelo cabe en movil y procesa clips cortos en menos de 200 ms, por lo que puede transcribir en el propio dispositivo sin enviar audio a la nube.
- Subtitulado en tiempo real de retransmisiones y videos cortos en redes sociales: con un RTF de 0,082x, un solo flujo de GPU puede procesar varias decenas de flujos de audio simultaneos en modo casi instantaneo.
- Atencion al cliente por voz en call centers nigerianos: el modelo puede transcribir las primeras fases de la llamada para enrutamiento o analitica, siempre que se acepte un WER elevado y se combine con un corrector posterior o con confirmacion del agente.
- Investigacion linguistica y sociolinguistica: permite generar transcripciones preliminares de corpus orales en pidgin que despues se corrigen manualmente, reduciendo el coste de anotacion frente a la transcripcion desde cero.
- Asistentes de voz embebidos y agentes conversacionales de bajo consumo: al ocupar 0,1 GB de repositorio y requerir poca VRAM, se puede desplegar en dispositivos edge, Raspberry Pi o navegadores con ONNX Runtime.
- Generacion de datasets de entrenamiento para modelos mayores: las transcripciones del modelo, tras revision humana, pueden servir para preetiquetar grandes volumenes de audio en pidgin y alimentar modelos ASR de mayor tamano.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva en contextos donde se habla pidgin nigeriano, con la advertencia de que la calidad actual exige revision humana.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test reservado, con normalizacion de texto estandar de Whisper/ASR (minusculas, eliminacion de puntuacion y normalizacion de espacios):

| Metrica | Resultado |
|---|---|
| WER normalizado | 54,9 % |
| CER normalizado | 41,8 % |
| Real-Time Factor (RTF) | 0,082x |
| Latencia por clip de 4 s | < 200 ms |

No se han publicado comparaciones con otros modelos ASR en pidgin nigeriano en la informacion disponible, ni resultados en benchmarks estandar como MLS, FLEURS o Common Voice para este idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (27M de parametros, aproximadamente 54 MB de pesos mas activaciones y cache del decoder); en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: NVIDIA A10G, T4, L4, RTX 3060, RTX 4060 o superiores; el modelo se entreno en una A10G de 24 GB, pero esa capacidad es holgada para la inferencia.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Cabe en CPU: si; el modelo es viable en CPU para transcripcion por lotes o en tiempo casi real, dado su bajo numero de parametros.
- Opciones de despliegue: `transformers` con `AutoModelForSpeechSeq2Seq`, exportacion a ONNX Runtime, y potencialmente `whisper.cpp` o `sherpa-onnx` si se convierte el grafo (no documentado por el autor). vLLM y TGI no estan orientados a este tipo de modelo encoder-decoder de audio.
- Latencia y throughput: menos de 200 ms por 4 segundos de audio y RTF de 0,082x, segun el autor; el throughput agregado en GPU no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-tiny-nigerian-pidgin | 27,1 M | duracion variable, sin padding fijo a 30 s | pcm | Apache 2.0 | HuggingFace, 0 descargas |
| UsefulSensors/moonshine-tiny (base) | ~27 M | duracion variable | ingles | Apache 2.0 | HuggingFace |
| Whisper tiny | 39 M | ventanas de 30 s | multilingue (99 idiomas, sin pcm especifico) | MIT | HuggingFace, OpenAI |
| Whisper small | 244 M | ventanas de 30 s | multilingue | MIT | HuggingFace, OpenAI |

El modelo ajustado hereda la ventaja de eficiencia de Moonshine frente a Whisper en clips cortos (sin padding a 30 s) y anade cobertura de pidgin nigeriano que los checkpoints multilingues de Whisper no ofrecen de forma especifica. A cambio, su WER del 54,9 % esta lejos de lo que cabria esperar de Whisper small o medium en idiomas con datos abundantes, y no hay benchmarks publicados que permitan comparar directamente con alternativas en `pcm`. No se dispone de datos de otros modelos ASR especificos de pidgin nigeriano en la informacion proporcionada.

## Limitaciones y advertencias

- WER normalizado del 54,9 % y CER del 41,8 % en el conjunto de test: la calidad es insuficiente para transcripcion automatica sin revision humana en la mayoria de flujos de produccion.
- Los ejemplos cualitativos de la model card muestran errores notables de sustitucion de palabras ("secretariat" transcrito como "celebrity", "songs" como "sunk"), lo que indica confusiones lexicas frecuentes.
- Arquitectura ultracompacta: el autor advierte que para audio largo, con multiples hablantes o de tipo broadcast conviene usar modelos mayores como Whisper Medium o Large.
- Rendimiento optimo solo con audio limpio y cercano al microfono (telefonia, auricular o notas de voz), muestreado a 16 kHz; no se documenta su comportamiento con ruido de fondo o reverberacion.
- Cobertura limitada a un unico idioma (`pcm`); no es un modelo multilingue.
- No se documentan sesgos especificos ni evaluaciones de robustez por acento, genero o edad de los hablantes.
- Riesgo de alucinacion en pasajes ininteligibles o silencios: el ejemplo del autor incluye una salida "tepu tepu tepu" que sugiere generacion espuria cuando la senal no es clara.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No hay informacion sobre el volumen ni la calidad del corpus de ajuste, lo que dificulta estimar la generalizacion a dominios distintos del de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samuelolubukun/moonshine-tiny-nigerian-pidgin
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/asr-nigerian-pidgin/nigerian-pidgin-1.0
- Web del autor: https://samuelolubukun.com
- GitHub del autor: https://github.com/samolubukun
- Perfil de HuggingFace del autor: https://huggingface.co/samuelolubukun
- Repositorio oficial de Moonshine (UsefulSensors): no disponible en la informacion proporcionada
- Paper de Moonshine: no disponible en la informacion proporcionada
