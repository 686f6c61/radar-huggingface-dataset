# secretvoice/secret-v1

## Resumen

Secret v1 (`secretvoice/secret-v1`) es un modelo de síntesis de voz (text-to-speech) orientado a la interpretación expresiva de proximidad: susurros, narración con micrófono cercano y turnos conversacionales en tiempo real. Lo desarrolla SecretVoice, un proveedor que comercializa el acceso mediante API (clave en `secretvoice.dev`), y el modelo se distribuye principalmente como servicio: síntesis HTTP síncrona, streaming HTTP por trozos y entrega por WebSocket para agentes de voz.

El sistema ofrece 29 voces predefinidas (13 femeninas y 16 masculinas) seleccionables por identificador (`velvet`, `whisper`, `professor`, `steele`, etc.) y soporte de 21 idiomas mediante el parámetro `language_code`. La model card destaca tres innovaciones de producto más que técnicas: preservación de textura de susurro sin artefactos metálicos, prosodia sensible al contexto en pasajes largos y transmisión de audio trama a trama a partir de la salida de tokens de un LLM.

Es relevante ahora por dos motivos. Primero, cubre un nicho poco atendido por los TTS abiertos: voz íntima, ASMR y contenido para adultos sin censura, con streaming de baja latencia para acompañantes conversacionales. Segundo, y como advertencia, el repositorio de HuggingFace está vacío (0,0 GB): no se publican pesos, arquitectura, recuento de parámetros ni licencia, por lo que la evaluación técnica independiente queda limitada a la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica familia ni diseño; solo se documenta la capa de servicio HTTP/WebSocket) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (se documenta streaming por turnos y "prosodia sensible al contexto en pasajes largos", sin cifra de tokens ni de segundos) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | 21: en, es, de, fr, it, pt, ru, zh, ja, ko, th, id, vi, ms, nl, pl, et, fi, hi, ta, cs |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB, sin safetensors, GGUF ni checkpoints) |

Otros datos del repositorio: pipeline `text-to-speech`, 0 descargas, 1 like, etiqueta `not-for-all-audiences` (requiere aceptar condiciones de acceso), creado el 2026-10-23 segun metadatos del Hub. Voces: 29 en total (13 femeninas, 16 masculinas).

## Arquitectura y entrenamiento

No disponible. La model card no indica la familia arquitectonica (difusion, LM autorregresivo sobre codecs neuronales, VITS, flow-matching, etc.), ni el numero de parametros, ni el volumen o composicion del corpus de entrenamiento, ni si se aplicaron etapas de ajuste como RLHF, DPO o fine-tuning por locutor. Tampoco se publica informacion sobre el codec de audio, la frecuencia de muestreo de salida o el bitrate del streaming.

La unica capa tecnica documentada es la de servicio: sintesis HTTP sincrona, streaming HTTP por trozos y entrega en tiempo real por WebSocket, con la posibilidad de emitir tramas de audio a medida que un LLM genera tokens. El control de estilo se realiza mediante seleccion de voz predefinida (identificador de voz) y el control de idioma mediante `language_code`; no se documentan parametros de prosodia, velocidad, tono ni clonacion de voz a partir de muestras.

## Capacidades

- Sintesis de voz multilingue en 21 idiomas con 29 voces predefinidas (13 femeninas: `velvet`, `whisper`, `angel`, `jade`, `chloe`, `honey`, `crystal`, `diamond`, `sunny`, `star`, `candy`, `bubbles`, `dominique`; 16 masculinas: `professor`, `titan`, `blaze`, `ace`, `chase`, `phoenix`, `stone`, `duke`, `rico`, `rocco`, `steele`, `sage`, `rex`, `chill`, `maverick`, `tender`).
- Voz susurrada y de proximidad: la model card afirma preservacion del aire y la textura de microfono cercano sin artefactos metalicos, un caso que los TTS convencionales suelen aplanar.
- Estilos vocales expresivos: control de respiracion, ritmo pausado y resonancia de voz de pecho, orientados a interpretacion emocional.
- Narracion de textos largos con prosodia sensible al contexto.
- Streaming de audio de baja latencia: tramas enviadas por WebSocket o HTTP por trozos, pensadas para encadenar con la salida de un LLM.
- Estabilidad de timbre ("persona") a lo largo de sesiones multiturno.
- Modo sin censura declarado: el autor etiqueta el modelo como `uncensored` y `nsfw`, e incluye Spaces publicos de demostracion para roleplay y contenido para adultos.
- No documentado: tool calling, function calling, razonamiento multi-paso, vision, audio de entrada, clonacion de voz, control fino de emociones por etiqueta o SSML.

## Casos de uso

- Audiolibros y ficcion romantica: narracion de pasajes largos con prosodia sensible al contexto y voces diferenciadas por personaje; el modelo permite mantener un timbre estable durante capitulos completos.
- Acompanante conversacional en tiempo real: integracion con un LLM y salida por WebSocket para que el audio empiece a emitirse antes de que el texto termine de generarse, reduciendo la latencia de turno en dialogos de varios minutos.
- Videojuegos y narrativa interactiva: 29 voces con identificadores estables permiten asignar personajes fijos y conservar su "persona" sonora entre sesiones y actualizaciones de contenido.
- Doblaje y localizacion ligera: la misma voz puede solicitarse en los 21 idiomas soportados mediante `language_code`, util para prototipar versiones multilingues de un mismo personaje antes de contratar doblaje humano.
- Contenido ASMR y audio relajante: el enfasis en susurro y microfono cercano encaja con producciones de audio de formato corto para plataformas de suscripcion.
- Accesibilidad y lectura en voz alta: lectura de textos con entonacion suave y ritmo pausado para usuarios que prefieren una locucion no radiofonica.
- Prototipado de personajes para estudios: generacion rapida de demos de voz para pitching, guiones y pruebas de guion sin sesiones de grabacion.
- Plataformas de audio bajo demanda para adultos: el modelo esta explicitamente orientado a este vertical; requiere verificacion de edad, consentimiento de las voces y cumplimiento normativo en la jurisdiccion de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, CMOS, WER, RTF, latencia objective, ni comparaciones cifradas con otros sistemas TTS; tampoco se publican muestras evaluables mas alla de ocho clips MP3 de demostracion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse pesos ni arquitectura no es posible derivar un cálculo de memoria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se consume como API gestionada por el proveedor (`secretvoice.dev`, con claves de API) sobre HTTP sincrono, HTTP por trozos y WebSocket. No hay pesos que cargar en vLLM, llama.cpp, Ollama, TGI ni en frameworks de TTS locales.
- Latencia y throughput: no disponibles. La unica referencia cualitativa es que el streaming esta disenado para "turn-taking instantaneo", sin cifras de tiempo hasta el primer byte de audio ni de factor de tiempo real.
- Autohospedaje: no disponible; el repositorio no contiene artefactos ejecutables.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Pesos descargables | Enfoque |
|---|---|---|---|---|---|
| secret-v1 (SecretVoice) | no disponible | 21 | no disponible | no (repo de 0,0 GB) | Voz intima/ASMR, streaming en tiempo real, sin censura, acceso por API |
| XTTS-v2 (Coqui) | ~0,47 mil millones | 17 | Coqui Public Model License (no comercial) | si | Clonacion de voz zero-shot, TTS multilingue de referencia |
| Kokoro-82M | 82 millones | 8 | Apache 2.0 | si | TTS ligero de alta eficiencia para inferencia en CPU/GPU modesta |
| Piper (VITS) | no disponible por voz | decenas (una voz por idioma) | MIT en el motor; variable por voz | si | TTS embebido de baja latencia para dispositivos y asistentes |

Los datos de los modelos alternativos provienen de conocimiento general sobre el ecosistema TTS y no se han verificado contra sus fichas en esta revision; conviene contrastarlos antes de tomar una decision. La diferencia estructural clave es que secret-v1 no ofrece pesos ni licencia publicada, mientras que las alternativas son autohospedables.

## Limitaciones y advertencias

- Licencia no disponible: sin terminos publicados no puede asumirse derecho de uso comercial, redistribucion ni explotacion del audio generado. Es un bloqueo potencial para produccion.
- Sin pesos ni artefactos: el repositorio mide 0,0 GB, de modo que no hay auditoria posible de arquitectura, datos de entrenamiento ni sesgos; cualquier evaluacion depende del proveedor.
- Dependencia de un servicio de terceros: disponibilidad, precios, limites de uso, retencion de datos y cambios de politica quedan en manos de SecretVoice.
- Ausencia total de benchmarks: no hay MOS, WER ni comparaciones objetivas que respalden las afirmaciones de calidad de la model card.
- Sesgos previsibles: catalogo de 29 voces con genero binario y perfiles muy estereotipados; no se documentan acentos, variedades regionales ni cobertura real por idioma (la lista de 21 codigos no garantiza calidad homogenea).
- Riesgo de alucinacion sonora: en TTS se manifiesta como prosodia incorrecta, respiraciones mal colocadas, pronunciacion defectuosa de nombres propios y numeros, o artefactos en pasajes largos; no hay metricas publicadas de robustez.
- Contenido para adultos: el modelo esta etiquetado `nsfw`, `uncensored` y `not-for-all-audiences`. Su uso exige verificacion de edad, consentimiento explicito de las personas cuyas voces se modelaron y cumplimiento de la normativa aplicable (DSA, legislacion estatal sobre contenido adulto, normas de las plataformas de distribucion).
- Riesgo de suplantacion y deepfakes: una voz intima y expresiva facilita usos de fraude afectivo, acoso o generacion de audio sexual no consentido; es imprescindible marcar el audio sintetico y aplicar moderacion.
- Ambiguedad de la seccion multilingue: la model card se corta en la lista de idiomas (`en (`), por lo que no se detalla el formato completo del parametro `language_code` ni el comportamiento en code-switching.
- Metadatos a verificar: la fecha de creacion registrada (2026-10-23) y el conteo de descargas (0) indican un proyecto sin validacion externa; el unico like registrado no constituye evidencia de calidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces utiles se limitan a los publicados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/secretvoice/secret-v1
- Sitio del proveedor y claves de API: https://secretvoice.dev
- Documentacion: https://secretvoice.dev/docs/
- Space de demostracion (TTS sin censura): https://huggingface.co/spaces/secretvoice/uncensored-sexy-tts
- Space de demostracion (acompanante de voz): https://huggingface.co/spaces/secretvoice/uncensored-voice-companion
- Muestras de audio de referencia: `https://huggingface.co/secretvoice/secret-v1/resolve/main/samples/{velvet,whisper,angel,jade,dominique,blaze,professor,steele}.mp3`
- Paper, blog tecnico y repositorio de codigo: no disponibles en la informacion proporcionada.
