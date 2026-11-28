# Ivreet/zpe-hebrew-asr

## Resumen

ZPE es un modelo de reconocimiento automatico del habla (ASR) especializado en hebreo, desarrollado por IvreetMeet (עברית מיט), un servicio israeli de transcripcion de reuniones, llamadas y mensajes de voz. El modelo se presenta como el sistema de transcripcion en hebreo con menor tasa de error de palabra (WER) entre los 21 sistemas evaluados en la tabla publica de ivrit.ai, con un promedio de 9,83 % frente al 9,90 % del siguiente mejor sistema.

El modelo esta disenado para hebreo hablado de forma natural, incluyendo jerga, nombres propios, terminos en ingles y conversaciones con multiples hablantes, un escenario tipico de reuniones y notas de voz. Segun la model card, incorpora un paso de correccion posterior basado en un modelo de lenguaje que relee el transcrito dos veces y solo modifica una palabra cuando ambas lecturas coinciden.

Es importante senalar que los pesos del modelo no se publican: ZPE se ofrece unicamente como servicio a traves de la plataforma de IvreetMeet, con planes gratuitos y de pago, API REST y servidor MCP. La ficha tecnica disponible es por tanto limitada en cuanto a arquitectura, tamano y datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos no se distribuyen) |
| Idiomas soportados | hebreo (he) |
| Licencia | ivreetmeet-terms-of-use (licencia propia, enlace: https://ivreetmeet.co.il/terms/) |
| Formato de pesos | no disponible (pesos no publicados) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura del modelo (transformer, convolucional, hibrida u otra), el numero de parametros, la composicion del dataset ni el volumen de tokens de entrenamiento. La model card indica que fue desarrollado y entrenado por IvreetMeet sobre hebreo hablado en contextos reales: reuniones, llamadas y mensajes de voz, con presencia de jerga, nombres propios, terminos en ingles y multiples hablantes.

La unica innovacion tecnica descrita es un paso de correccion posterior al reconocimiento: un modelo de lenguaje lee el transcrito dos veces y una palabra solo se sustituye cuando ambas lecturas coinciden, lo que actua como mecanismo de verificacion para reducir errores. No se especifica si hubo RLHF, DPO ni otras tecnicas de alineacion, ni datos sobre decodificacion especulativa o mecanismos de atencion particulares.

## Capacidades

- Transcripcion de voz a texto en hebreo (pipeline `automatic-speech-recognition`).
- Reconocimiento de habla espontanea: reuniones, llamadas y mensajes de voz con jerga, nombres y terminos en ingles.
- Diarizacion de hablantes: el servicio entrega el transcrito separado por hablantes y permite nombrar a un hablante una sola vez y reasignar segmentos.
- Resumen automatico con decisiones y tareas a partir de la transcripcion.
- Correccion asistida: el paso de doble lectura con modelo de lenguaje y la edicion manual de palabras dentro del transcrito.
- Navegacion por audio: clic en una palabra reproduce la grabacion desde ese punto.
- Acceso mediante API REST y servidor MCP para integracion en flujos de trabajo.
- Uso desde navegador en ordenador y movil, y aplicacion Android, sin necesidad de hardware local.

## Casos de uso

- Transcripcion de reuniones de equipo: el modelo esta entrenado sobre habla de reunion con varios participantes y el servicio devuelve el transcrito por hablante, lo que permite generar actas y resumenes de decisiones sin trabajo manual.
- Notas de voz de mensajeria: el conjunto de evaluacion de WhatsApp (7,02 % de WER) refleja el rendimiento en mensajes de voz cortos, un caso habitual en equipos que comparten audio en lugar de texto.
- Generacion de actas y seguimiento de tareas: el resumen con decisiones y tareas integrado en el servicio convierte una grabacion en elementos accionables para gestion de proyectos.
- Subtitulado y documentacion de podcasts: el conjunto eval-d1 (5,15 % de WER) mide el rendimiento en un episodio de podcast, por lo que el modelo es adecuado para transcribir contenido hablado de larga duracion.
- Integracion en herramientas internas mediante API REST o MCP: equipos de desarrollo pueden enviar audio y recibir transcripciones estructuradas para incorporarlas a CRMs, sistemas de tickets o bases de conocimiento.
- Atencion al cliente y soporte telefonico: la transcripcion de llamadas permite auditar conversaciones, extraer motivos de contacto y alimentar analitica de calidad.
- Accesibilidad: conversion de audio a texto en hebreo para personas con discapacidad auditiva, con edicion y correccion sobre el propio transcrito.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos el 17 de septiembre de 2026 con el script publico de evaluacion de ivrit.ai y la misma normalizacion de texto que la tabla de liderazgo:

| Conjunto de evaluacion | Contenido | WER |
|---|---|---|
| ivrit.ai eval-d1 | un episodio de podcast, 17 segmentos | 5,15 % |
| ivrit.ai eval-whatsapp | mensajes de voz | 7,02 % |
| FLEURS (hebreo, he_il, test) | habla leida (Google) | 17,32 % |
| Promedio | los tres conjuntos | 9,83 % |

Segun la model card, la tabla publica de ivrit.ai contiene 21 sistemas con promedios entre 9,90 % y 33,20 % en estos tres conjuntos, y en FLEURS-he los valores van del 17,4 % al 46,0 %. No se dispone de resultados en otros benchmarks (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (los pesos no se publican y no se indica el tamano del modelo).
- GPU recomendadas: no disponible; el modelo se ejecuta en las GPU de IvreetMeet, no en hardware del usuario.
- Compatibilidad con GPU de consumo: no disponible; al no distribuirse los pesos, no es posible ejecutarlo localmente.
- Opciones de despliegue: exclusivamente como servicio gestionado, mediante la plataforma web, la aplicacion Android, la API REST y el servidor MCP de IvreetMeet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card compara ZPE con los 21 sistemas de la tabla publica de ivrit.ai, pero no identifica modelos concretos ni ofrece sus especificaciones. Los datos disponibles permiten esta comparacion agregada:

| Sistema | Idiomas | WER promedio (3 conjuntos) | WER FLEURS-he | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZPE (IvreetMeet) | hebreo | 9,83 % | 17,32 % | ivreetmeet-terms-of-use | solo servicio gestionado |
| Mejor alternativa de la tabla ivrit.ai | hebreo | 9,90 % | no disponible | no disponible | no disponible |
| Rango del resto de la tabla ivrit.ai | hebreo | 9,90 % – 33,20 % | 17,4 % – 46,0 % | no disponible | no disponible |

No se dispone de informacion sobre parametros, contexto ni condiciones de licencia de los sistemas comparados, por lo que no es posible una comparativa tecnica detallada.

## Limitaciones y advertencias

- Pesos no publicados: el modelo no puede descargarse, auditarse ni ejecutarse localmente; el uso queda ligado al servicio de IvreetMeet.
- Licencia propia (ivreetmeet-terms-of-use): es necesario revisar los terminos en https://ivreetmeet.co.il/terms/ antes de cualquier uso comercial o integracion en produccion.
- Un solo idioma: el modelo solo soporta hebreo; no se declaran capacidades multilingues.
- Resultados no verificados: los valores de WER son mediciones propias del autor (`verified: false` en el model-index) y no han sido confirmados por un tercero independiente.
- Rendimiento variable segun el dominio: el WER sube del 5,15 % en podcast al 17,32 % en habla leida de FLEURS, lo que indica una degradacion en dominios distintos del habla espontanea.
- Sesgos: no se documentan sesgos conocidos ni la composicion demografica del dataset de entrenamiento.
- Riesgo de alucinacion: no se cuantifica; el paso de correccion con modelo de lenguaje puede introducir sustituciones erroneas aunque exija doble coincidencia.
- Dependencia de servicio externo: la disponibilidad, privacidad y coste dependen de la plataforma del proveedor; no hay opcion de despliegue en infraestructura propia.
- Sin datos de arquitectura ni tamano: imposible estimar coste computacional, latencia o requisitos de hardware a partir de la informacion publica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ivreet/zpe-hebrew-asr
- Servicio IvreetMeet: https://ivreetmeet.co.il/
- Metodologia de medicion (hebreo): https://ivreetmeet.co.il/hebrew-transcription-model/
- Metodologia de medicion (ingles): https://ivreetmeet.co.il/en/most-accurate-hebrew-transcription/
- Terminos de uso: https://ivreetmeet.co.il/terms/
- Seguridad y privacidad: https://ivreetmeet.co.il/security/
- Contacto: support@ivreetmeet.co.il
- Conjunto de evaluacion eval-d1: https://huggingface.co/datasets/ivrit-ai/eval-d1
- Conjunto de evaluacion eval-whatsapp: https://huggingface.co/datasets/ivrit-ai/eval-whatsapp
- FLEURS (he_il): https://huggingface.co/datasets/google/fleurs
