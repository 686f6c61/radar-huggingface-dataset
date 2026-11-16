# sorika-labs/vaani-3-turbo

## Resumen

Vaani-3-Turbo es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Sorika Labs, orientado a inferencia de alta velocidad en dispositivos edge y backends de servidor. Se presenta como la version "turbo" de la familia Vaani-3, construida sobre representaciones acusticas de Qwen3-ASR (24 capas) y un decodificador de texto derivado de Gemma-3 (18 capas), con 460 millones de parametros totales. Su propuesta central es reducir la latencia de decodificacion autoregresiva sin degradar la tasa de error de palabra (WER).

El modelo incorpora tres innovaciones tecnicas declaradas por el autor: decodificacion especulativa multi-token (Flash-Draft), compresion adaptativa de tramas acusticas mediante delta gating y un buffer circular KV estatico contiguo para evitar reasignaciones de memoria durante la generacion. Segun la model card, estas tecnicas permiten aceleraciones de entre 2,5x y 4,2x respecto a la linea base, manteniendo un delta de WER del 0,00% en el modo por defecto.

Es relevante para el ecosistema de ASR en lenguas indicas: cubre 12 idiomas (ingles y 11 lenguas de la India) con licencia Apache 2.0, lo que facilita su adopcion comercial en productos de voz para ese mercado. El modelo declara resultados en Google FLEURS Indic y en el Open ASR Leaderboard ingles, aunque dichos resultados no estan verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder acustico basado en Qwen3-ASR (24 capas) + decodificador de texto basado en Gemma-3 (18 capas); decodificacion especulativa Flash-Draft |
| Parametros totales | 460.124.775 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, kn, te, ta, ml, gu, bn, mr, pa, as, or |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder acustico derivado de Qwen3-ASR de 24 capas con un decodificador de texto basado en Gemma-3 de 18 capas. Sobre esta base, el autor anade tres componentes propios. El primero es Flash-Draft, una cabeza de prediccion ligera que propone especulativamente los tokens t+1 y t+2 en paralelo; cada candidato se valida contra la cabeza LM principal antes de emitirse, de modo que si se acepta se generan dos tokens por paso (tasa de aceptacion declarada de aproximadamente el 75% en habla conversacional) y si se rechaza se emite el token correcto sin penalizacion. El segundo es un compresor acustico que detecta representaciones estacionarias adyacentes (similitud coseno superior a 0,96) y aplica pooling 1D adaptativo, reduciendo la longitud de la secuencia de entrada entre un 30% y un 40%. El tercero es un buffer circular KV estatico y contiguo que elimina las reasignaciones dinamicas de memoria en el bucle de generacion.

La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Tampoco especifica el proceso de destilacion o adaptacion desde los modelos base citados. La informacion disponible sobre entrenamiento es, por tanto, limitada a la descripcion arquitectonica y a las innovaciones de inferencia.

## Capacidades

- Transcripcion de voz a texto en 12 idiomas: ingles y 11 lenguas indicas (hindi, kannada, telugu, tamil, malayo, gujarati, bengali, marathi, punyabi, assames y oriya).
- Decodificacion en tres modos: `turbo` (especulativa, sin perdida de WER), `ultra` (especulativa mas compresion acustica, con delta de WER inferior al 0,1%) y `base` (decodificacion secuencial de referencia).
- Inferencia de alta velocidad: factor de tiempo real (RTF) declarado de hasta 145x en Common Voice y 64x en LibriSpeech Clean en modo turbo.
- Ejecucion en CPU y GPU: el modelo incluye optimizaciones especificas para CPU de portatil consumer (hasta 2,8x de aceleracion por el buffer KV estatico).
- API de transcripcion simple mediante `model.transcribe(ruta_audio, language=..., mode=...)`.
- Soporte de audio en formato de fichero (el ejemplo de la model card usa MP3).
- No se declara soporte de tool calling, function calling, agentes, vision ni audio multimodal mas alla del ASR.

## Casos de uso

- Atencion al cliente por voz en lenguas indicas: el modelo transcribe en tiempo real conversaciones en hindi, tamil o bengali con RTF superior a 25x, lo que permite alimentar un pipeline de respuesta en menos de un segundo por turno en hardware de servidor moderado.
- Subtitulado y transcripcion de reuniones: con WER declarado del 7,60% en AMI Meeting Speech, es adecuado para generar actas automaticas de reuniones con habla espontanea y multiples hablantes.
- Procesamiento de llamadas financieras: el resultado de 4,20% de WER en SPGISpeech lo hace util para transcripcion de call centers y analisis de cumplimiento en entidades financieras.
- Asistentes de voz en dispositivos edge: el modo `ultra` con compresion acustica y el buffer KV estatico permiten ejecutar el modelo en CPUs de portatil o dispositivos de baja potencia, habilitando asistentes locales sin conexion.
- Audiolibros y podcasts: con 5,40% de WER en GigaSpeech y 6,40% en LibriSpeech Clean, sirve para generar transcripciones indexables de contenido largo y para busqueda semantica sobre audio.
- Accesibilidad y documentacion clinica: transcripcion de consultas medicas o notas de voz en lenguas regionales de la India, donde la cobertura de modelos ASR comerciales es limitada.
- Transcripcion masiva por lotes: el alto RTF (hasta 145x en Common Voice) permite procesar grandes volumenes de audio en un solo servidor, reduciendo costes de computo frente a modelos autoregresivos convencionales.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente).

Google FLEURS Indic (9 idiomas):

| Idioma | WER base | WER turbo | Delta | RTF base | RTF turbo |
|---|---|---|---|---|---|
| Kannada (kn) | 4,60% | 4,60% | 0,00% | 7,2x | 28,4x |
| Hindi (hi) | 5,20% | 5,20% | 0,00% | 9,0x | 36,5x |
| Telugu (te) | 5,40% | 5,40% | 0,00% | 6,6x | 26,8x |
| Malayalam (ml) | 6,10% | 6,10% | 0,00% | 8,1x | 32,2x |
| Gujarati (gu) | 6,20% | 6,20% | 0,00% | 6,2x | 25,1x |
| Bengali (bn) | 6,80% | 6,80% | 0,00% | 11,5x | 42,0x |
| Marathi (mr) | 7,40% | 7,40% | 0,00% | 9,6x | 38,1x |
| Punjabi (pa) | 7,80% | 7,80% | 0,00% | 4,6x | 20,5x |
| Tamil (ta) | 8,90% | 8,90% | 0,00% | 9,5x | 37,6x |
| Media (9 idiomas) | 6,49% | 6,49% | 0,00% | 8,0x | 32,0x |

El model-index declara ademas un WER global de 6,49%, un CER de 4,10% y un RTF de 38,2 para el conjunto FLEURS Indic.

Open ASR Leaderboard ingles (12 conjuntos de datos):

| Dataset | WER base | WER turbo | RTF base | RTF turbo |
|---|---|---|---|---|
| SPGISpeech | 4,20% | 4,20% | 11,7x | 41,2x |
| GigaSpeech | 5,40% | 5,40% | 13,0x | 48,6x |
| LibriSpeech Clean | 6,40% | 6,40% | 18,2x | 64,0x |
| AMI Meeting Speech | 7,60% | 7,60% | 12,1x | 44,5x |
| VoxPopuli | 8,20% | 8,20% | 18,1x | 62,8x |
| Common Voice | 9,80% | 9,80% | 62,2x | 145,0x |
| Media ingles | 7,14% | 7,14% | 18,5x | 67,6x |

## Requisitos de hardware

- VRAM estimada para inferencia: con 460 millones de parametros en precision FP16, el modelo ocupa aproximadamente 0,92 GB de pesos; en FP32, unos 1,84 GB. El repo completo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre puede alojar el modelo en FP16. Una RTX 3060, RTX 4060 o superior es suficiente; para despliegues de alto throughput se recomienda A100, H100 o L4.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660 en adelante) e incluso en iGPU con suficiente memoria compartida.
- CPU: el modelo declara optimizaciones especificas para CPU (buffer KV estatico con hasta 2,8x de aceleracion en portatiles consumer), por lo que es viable en inferencia solo-CPU.
- Opciones de despliegue: la model card solo documenta el uso via `transformers` con `trust_remote_code=True` y `AutoModel.from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el campo `inference: false` de la model card sugiere que la inferencia gestionada en Hugging Face no esta habilitada.
- Latencia y throughput: el RTF declarado varia entre 20,5x y 145x segun el conjunto de datos y el modo, lo que implica que un minuto de audio se transcribe en un rango aproximado de 0,4 a 3 segundos en el hardware de referencia del autor (no especificado).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La model card no incluye comparaciones con otros sistemas ASR (Whisper, Conformer, etc.), por lo que no es posible establecer una comparativa cuantitativa fiable. Se indica "no disponible".

## Limitaciones y advertencias

- Resultados no verificados: todos los benchmarks y factores de aceleracion proceden del autor y figuran con `verified: false` en el model-index.
- Sesgos desconocidos: la model card no documenta analisis de sesgos por acento, genero, edad ni variedad dialectal. La cobertura de lenguas indicas puede variar significativamente entre idiomas (WER del 4,60% en kannada frente al 8,90% en tamil).
- Riesgo de alucinacion: no se documenta el comportamiento del modelo ante audio ruidoso, silencios largos o habla superpuesta; en ASR, estos casos pueden producir transcripciones inventadas o repeticiones.
- Limitaciones de contexto: la longitud maxima de audio por inferencia no se especifica.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-ASR y Gemma-3 conviene verificar que las licencias de los modelos base sean compatibles con el uso previsto.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 16 de noviembre de 2026; no hay evidencia de uso en produccion ni de validacion por terceros.
- El modo `ultra` introduce un delta de WER inferior al 0,1%, aceptable en muchos casos pero no despreciable en dominios de alta precision (por ejemplo, transcripcion legal o medica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sorika-labs/vaani-3-turbo
- Repositorio de assets del autor (banner): https://raw.githubusercontent.com/sorika-labs/assets/main/vaani_turbo_banner.png
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo o demos adicionales.
