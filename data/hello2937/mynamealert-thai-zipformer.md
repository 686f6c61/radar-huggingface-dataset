# hello2937/mynamealert-thai-zipformer

## Resumen
El modelo `hello2937/mynamealert-thai-zipformer` es un espejo (mirror) del modelo de reconocimiento automatico del habla (ASR) en tailandes en formato int8 utilizado por la aplicacion Android MyNameAlert, publicado para que el enlace de descarga de la aplicacion permanezca estable. No se trata de un desarrollo propio del autor: los ficheros son copias sin modificar del modelo `yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20` (commit `e33c75c3e75fd0830acec75bc41f4e5d711bbec9`), entrenado con la herramienta icefall sobre el corpus GigaSpeech2.

La arquitectura es Zipformer, una variante de transformer para ASR con atencion lineal y estructura de codificador multi-escala orientada a inferencia en dispositivos de recursos limitados. El repositorio contiene unicamente los pesos cuantizados a int8 en formato ONNX (encoder, decoder y joiner) junto con el vocabulario BPE de 2000 unidades, con un tamano total de 0,2 GB. El modelo esta pensado para ejecutarse mediante sherpa-onnx en movil, lo que lo hace relevante para integraciones de dictado o activacion por voz en Android.

El alcance es deliberadamente limitado: uso monohablante (tailandes), sin pipeline declarado en Hugging Face, sin model card tecnica detallada y sin resultados de benchmarks publicados en la informacion disponible. Es util como artefacto de despliegue reproducible, no como modelo de referencia para investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (transformer para ASR con atencion lineal y codificador multi-escala) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming ASR; ventana de audio no especificada) |
| Tipos de cuantizacion | int8 (los tres componentes ONNX: encoder, decoder, joiner) |
| Idiomas soportados | tailandes (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx); vocabulario tokens.txt y bpe.vocab (unigram 2000) |

## Arquitectura y entrenamiento
Zipformer es una arquitectura de ASR basada en transformer que sustituye las capas lineales convencionales por atencion lineal y emplea un codificador con resoluciones temporales multiples (downsampling progresivo), lo que reduce el coste computacional y de memoria frente a un transformer estandar. El modelo original se entreno con icefall (framework de k2-fsa basado en k2/icefall recipes) sobre el corpus GigaSpeech2 en tailandes, con vocabulario BPE de 2000 unidades. El checkpoint publicado corresponde a la epoca 12 con promedio de las ultimas 5 epocas (`epoch-12-avg-5`).

No se dispone de informacion sobre el numero de horas de audio, la composicion exacta del dataset, el uso de tecnicas de aumento de datos ni si hubo etapas de ajuste fino especificas. Los pesos distribuidos en este repositorio estan cuantizados a int8 respecto del modelo original, lo que reduce el tamano y acelera la inferencia en CPU/edge a costa de una posible perdida marginal de precision. El formato ONNX y la integracion con sherpa-onnx indican que el modelo esta optimizado para inferencia en dispositivos moviles y sistemas embebidos, no para despliegue en servidores con GPU.

## Capacidades
- Reconocimiento automatico del habla (transcripcion) en tailandes, con salida de texto a partir de audio.
- Inferencia en streaming: la arquitectura Zipformer y el empaquetado en sherpa-onnx permiten transcripcion incremental por fragmentos de audio.
- Ejecucion en dispositivo (on-device) gracias a la cuantizacion int8 y al formato ONNX.
- Vocabulario BPE de 2000 unidades, adecuado para tailandes, idioma sin separacion explicita de palabras por espacios en el sentido habitual.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (vision, audio distinto de ASR).
- No se ha documentado capacidad multilingue: el modelo esta etiquetado exclusivamente para tailandes.

## Casos de uso
- Activacion por nombre y comandos de voz en Android: integracion en la aplicacion MyNameAlert para detectar palabras clave o nombres pronunciados por el usuario, ejecutando el modelo int8 en el propio dispositivo sin enviar audio a la nube.
- Dictado de notas en tailandes: transcripcion en tiempo real de voz a texto en aplicaciones de productividad moviles, aprovechando el bajo consumo de memoria del empaquetado ONNX (0,2 GB en repositorio).
- Subtitulado en directo de conversaciones en tailandes: uso del modo streaming para generar subtitulos incrementales en pantalla durante reuniones o llamadas.
- Asistentes de voz sin conexion: despliegue en dispositivos con conectividad intermitente o requisitos de privacidad, ya que toda la inferencia ocurre localmente.
- Accesibilidad: conversion de voz a texto para personas con dificultades auditivas en contextos de habla tailandesa, con latencia baja al no requerir round-trip a servidor.
- Preprocesado de audio para pipelines de datos: transcripcion por lotes de grabaciones en tailandes antes de analisis posterior (busqueda, indexacion, resumen), usando sherpa-onnx en CPU.
- Prototipado rapido de interfaces de voz: validacion de flujos de activacion por palabra clave en hardware de bajos recursos antes de invertir en modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER), comparaciones con otros sistemas ni metricas de latencia o throughput.

## Requisitos de hardware
- VRAM estimada: no aplica de forma directa; el modelo esta orientado a CPU y ejecucion on-device. El repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es del orden de cientos de MB durante la inferencia.
- GPU recomendadas: no disponibles; el modelo no esta pensado para despliegue en GPU de servidor.
- Cabe en GPU consumer: si, por tamano, pero el flujo previsto es CPU/edge mediante sherpa-onnx, no inferencia GPU con frameworks de alto rendimiento.
- Opciones de despliegue: sherpa-onnx (runtime principal, incluidas las builds para Android), ONNX Runtime para ejecucion directa de los tres grafos (encoder, decoder, joiner).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| hello2937/mynamealert-thai-zipformer | no disponible | no disponible (streaming) | th | Apache-2.0 | ONNX int8 |
| yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20 (original) | no disponible | no disponible (streaming) | th | Apache-2.0 | ONNX / checkpoint icefall |
| Zipformer (Qualcomm AI Hub) | no disponible | no disponible (streaming) | en, zh | no disponible en la informacion | optimizado para edge |

La comparativa se limita a los modelos de los que se dispone de informacion en la busqueda realizada; no se han identificado alternativas tailandesas equivalentes con datos publicos de rendimiento en la informacion disponible.

## Limitaciones y advertencias
- Es un espejo, no un modelo entrenado por el autor del repositorio: cualquier correccion o mejora debe remitirse al modelo original de yfyeung.
- Sin model card tecnica detallada: no se documentan datos de entrenamiento, WER ni condiciones de evaluacion, lo que dificulta estimar su calidad real.
- Uso exclusivamente en tailandes; no se ha validado para otros idiomas ni para code-switching.
- La cuantizacion int8 puede degradar ligeramente la precision respecto del modelo en punto flotante original.
- Riesgo de alucinacion y errores de transcripcion en audio ruidoso, acentos no representados en GigaSpeech2 o vocabulario especializado (nombres propios, terminologia tecnica).
- Sesgos potenciales derivados de la distribucion del corpus GigaSpeech2 (dominios, hablantes y variedades regionales sobrerrepresentados o ausentes); no se han documentado analisis de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar el aviso de licencia y la atribucion a los autores originales.
- Al ser un artefacto de despliegue para una aplicacion concreta, no hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor del espejo.
- No dispone de pipeline declarado en Hugging Face, por lo que las herramientas automaticas de la plataforma no lo reconoceran como modelo ASR de forma nativa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/hello2937/mynamealert-thai-zipformer
- Modelo original: https://huggingface.co/yfyeung/icefall-asr-gigaspeech2-th-zipformer-2024-06-20
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- Zipformer en Qualcomm AI Hub: https://aihub.qualcomm.com/models/zipformer
