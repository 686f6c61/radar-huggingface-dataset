# keyvan-ai/Saturn-Duplex-5B-DE

## Resumen

Saturn-Duplex-5B-DE es un modelo de voz a voz (audio-to-audio) en tiempo completo o full-duplex, desarrollado por keyvan-ai, especializado en diálogo hablado en alemán e inglés. Está construido sobre el modelo base higurashi-ai/Haru-4B y cuenta con 5.270 millones de parámetros, lo que lo sitúa en la gama media de modelos conversacionales de audio. Su propuesta principal es la conversación simultánea: el modelo puede escuchar y hablar al mismo tiempo, una capacidad poco habitual en modelos de voz convencionales que operan en modo por turnos estricto.

El modelo está orientado a agentes de voz, NPC de videojuegos y asistentes conversacionales que requieren interacción natural con interrupciones, solapamiento de habla y baja latencia percibida. Los tags del repositorio incluyen referencias explícitas a "voice-agent", "npc" y "spoken-dialogue", lo que confirma este enfoque. Soporta alemán (de) e inglés (en) y se distribuye en formatos safetensors y GGUF.

La relevancia de este modelo radica en su enfoque full-duplex aplicado a un modelo de 5B parámetros, un tamaño manejable para despliegue en producción con recursos moderados. Sin embargo, su licencia CC-BY-NC-ND-4.0 restringe severamente el uso comercial y prohíbe obras derivadas, lo que limita su adopción en entornos productivos empresariales. El acceso es restringido (gated), requiriendo aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio-to-audio basado en higurashi-ai/Haru-4B) |
| Parametros totales | 5.270.000.897 (5,27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); otras no disponibles |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | CC-BY-NC-ND-4.0 |
| Formato de pesos | safetensors, GGUF |
| Pipeline | audio-to-audio |
| Modelo base | higurashi-ai/Haru-4B |
| Tamano del repo | 22,4 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El modelo se presenta como un sistema audio-to-audio full-duplex construido sobre higurashi-ai/Haru-4B, lo que sugiere que hereda la arquitectura del modelo base y anade capacidades de procesamiento de audio bidireccional. La naturaleza full-duplex implica que el modelo procesa flujos de audio de entrada y salida de forma simultanea, en lugar de alternar entre escucha y habla.

En cuanto a los datos de entrenamiento, los tags del repositorio referencian los siguientes datasets: deepset/germanquad, OpenAssistant/oasst2, wikimedia/wikipedia y BrunoHays/callhome-telephony. Esta combinacion sugiere un entrenamiento que combina comprension lectora en aleman (germanquad), dialogos instructivos multilingues (oasst2), conocimiento enciclopedico (wikipedia) y audio telefonico real (callhome-telephony), este ultimo especialmente relevante para un modelo de dialogo hablado. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable es la operacion full-duplex, que permite al modelo gestionar solapamiento de habla e interrupciones, algo critico para conversaciones naturales. No se dispone de informacion sobre mecanismos especificos de atencion, decodificacion especulativa u otras optimizaciones.

## Capacidades

- Generacion de audio de voz a voz (speech-to-speech) en modo full-duplex, con capacidad de escuchar y hablar simultaneamente.
- Dialogo hablado conversacional con gestion de interrupciones y solapamiento de habla.
- Comprension y generacion en aleman e ingles.
- Orientado a agentes de voz y NPC de videojuegos (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio adicional o thinking mode: no disponibles en la informacion proporcionada.
- Capacidades multilingues limitadas a aleman e ingles.

## Casos de uso

- Agentes de voz para atencion al cliente: el modelo puede gestionar conversaciones telefonicas o por voz en tiempo real, permitiendo interrupciones naturales del usuario gracias a su operacion full-duplex. Adecuado para sectores como telecomunicaciones o banca en mercados germanoparlantes.

- NPC de videojuegos con dialogo natural: los tags "npc" y "voice-agent" indican que el modelo esta pensado para personajes no jugables que mantienen conversaciones habladas con el jugador, con respuesta inmediata y capacidad de reaccionar a interrupciones.

- Asistentes de voz embebidos en dispositivos: con 5,27B parametros y version GGUF disponible, puede desplegarse en hardware con recursos moderados para asistentes domesticos o interfaces de voz en automocion, siempre que el uso no sea comercial por la licencia.

- Simulacion de entrevistas o formacion: el modo full-duplex permite practicar conversaciones donde el modelo responde de forma natural y simultanea, util para entrenamiento de habilidades comunicativas en aleman o ingles.

- Prototipado de interfaces conversacionales: investigadores pueden usar el modelo para estudiar dinamicas de dialogo full-duplex, solapamiento de turnos y latencia percibida en conversaciones humano-maquina.

- Transcripcion y respuesta en call centers: el dataset callhome-telephony sugiere entrenamiento con audio telefonico, lo que lo hace adecuado para entornos de telefonia donde se requiere respuesta hablada inmediata.

- Educacion de idiomas: conversacion hablada en aleman e ingles con feedback en tiempo real, aprovechando la capacidad de mantener dialogo natural con interrupciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,27B parametros, en precision completa (fp16) requeriria aproximadamente 10,5 GB de VRAM solo para pesos. En cuantizacion GGUF de 8 bits, alrededor de 5,5-6 GB; en 4 bits, aproximadamente 3-3,5 GB. Estas cifras son estimaciones basadas en el tamano del modelo, no datos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) o A100 (40/80 GB) permitirian inferencia en fp16 con margen. Una RTX 3090 o 4080 (16 GB) tambien seria suficiente en fp16.
- Cabe en GPU consumer: si, en tarjetas con al menos 12-16 GB de VRAM en fp16, o en tarjetas de 8 GB con cuantizacion GGUF de 4-8 bits.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. Otras opciones como vLLM o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La naturaleza full-duplex sugiere requisitos de baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. Se indica "no disponible" para benchmarks y alternativas directas. Como referencia estructural, el modelo se basa en higurashi-ai/Haru-4B (4B parametros), pero no se dispone de datos de rendimiento comparativo ni de otros modelos full-duplex de caracteristicas similares en la informacion facilitada.

| Modelo | Parametros | Contexto | Full-duplex | Licencia | Idiomas |
|---|---|---|---|---|---|
| Saturn-Duplex-5B-DE | 5,27B | no disponible | Si | CC-BY-NC-ND-4.0 | de, en |
| higurashi-ai/Haru-4B (base) | ~4B | no disponible | no disponible | no disponible | no disponible |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia CC-BY-NC-ND-4.0: prohibe el uso comercial y la creacion de obras derivadas. Esto impide su uso en productos o servicios de pago, y restringe la modificacion y redistribucion. Es una limitacion critica para produccion empresarial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar el modelo, lo que anade friccion al despliegue.
- Idiomas limitados a aleman e ingles: no soporta castellano ni otros idiomas, lo que limita su aplicacion en mercados hispanohablantes.
- Riesgo de alucinacion: no se dispone de informacion sobre tasas de alucinacion ni sobre mecanismos de mitigacion. Como modelo generativo de dialogo, es susceptible a respuestas inexactas o inventadas.
- Sesgos conocidos: no se dispone de informacion sobre evaluaciones de sesgo. Los datasets de entrenamiento (wikipedia, oasst2, germanquad, callhome-telephony) pueden introducir sesgos propios de sus fuentes.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, lo que impide evaluar su idoneidad para conversaciones de larga duracion.
- Documentacion tecnica escasa: no se detallan arquitectura interna, proceso de entrenamiento, numero de tokens ni tecnicas de alineacion, lo que dificulta la evaluacion rigurosa y la reproducibilidad.
- Madurez: el modelo fue creado el 20 de noviembre de 2026 y cuenta con 286 descargas y 1 like, lo que sugiere una adopcion muy limitada y poca validacion por parte de la comunidad.
- Uso en produccion: la combinacion de licencia no comercial, acceso restringido y documentacion limitada desaconseja su uso en entornos productivos sin una evaluacion exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/keyvan-ai/Saturn-Duplex-5B-DE
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Dataset deepset/germanquad: https://huggingface.co/datasets/deepset/germanquad
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset BrunoHays/callhome-telephony: https://huggingface.co/datasets/BrunoHays/callhome-telephony
