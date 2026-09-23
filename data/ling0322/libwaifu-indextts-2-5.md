# ling0322/libwaifu-indextts-2.5

## Resumen

libwaifu-indextts-2.5 es un paquete de pesos del sistema de síntesis de voz (text-to-speech) IndexTTS-2.5, convertido por el desarrollador ling0322 al formato que consume libwaifu, una biblioteca escrita en Rust para ejecutar modelos de IA de forma local. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos proceden de IndexTeam/IndexTTS-2.5 y lo que cambia es el empaquetado. En lugar de seis directorios independientes, todo el pipeline queda descrito por un unico manifiesto (`indextts25.yaml`) que agrupa el GPT, la ruta de emocion, el frontal de w2v-bert, CAMPPlus, el decodificador del codec semantico, S2Mel, el vocoder BigVGAN y el tokenizer.

El modelo resuelve clonacion de voz zero-shot: a partir de unos 15 segundos de audio de referencia, reproduce cualquier frase con el timbre de esa voz. Entiende texto en chino, ingles, japones y cantonés, con deteccion de idioma basada en el sistema de escritura (kana se interpreta como japones, otro CJK como chino, el resto como ingles). El repositorio ocupa 5,5 GB y los pesos se distribuyen integramente en float32, sin cuantizacion.

Su relevancia actual es doble. Por un lado, permite ejecutar un TTS de clonacion de voz de alta calidad sin depender de servicios en la nube ni de Python, integrándolo en una aplicacion Rust. Por otro, sirve como referencia de las concesiones que implica adaptar un modelo a un formato de empaquetado distinto: el paquete elimina la busqueda por haces y el control independiente de emociones respecto al original. La licencia bilibili Model Use License impone ademas condiciones estrictas de uso comercial y prohibiciones sectoriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente para TTS: GPT autorregresivo, ruta de emocion, frontal w2v-bert, CAMPPlus, decodificador del codec semantico, S2Mel y vocoder BigVGAN, mas tokenizer (siete modelos segun la documentacion de libwaifu) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS; lee unos 15 segundos de audio de referencia por voz) |
| Tipos de cuantizacion | no disponible; el paquete se distribuye en float32 en su totalidad, sin reduccion de precision |
| Idiomas soportados | chino (zh), ingles (en), japones (ja) y cantonés (yue), con deteccion automatica por sistema de escritura |
| Licencia | bilibili-model-use-license (bilibili Model Use License Agreement, `license: other` en HuggingFace) |
| Formato de pesos | formato propio de libwaifu: manifiesto YAML (`indextts25.yaml`) y sus partes; no safetensors ni GGUF |
| Tamano del repositorio | 5,5 GB en total; 5,1 GB corresponden a pesos en float32 |
| Pipeline declarado | text-to-speech |
| Modelo base | IndexTeam/IndexTTS-2.5; componentes auxiliares facebook/w2v-bert-2.0, funasr/campplus y nvidia/bigvgan_v2_22khz_80band_256x |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura no es la de un unico transformer, sino la de un pipeline de sintesis por etapas. El manifiesto empaqueta el GPT autorregresivo que genera la secuencia, la ruta de emocion, el frontal de representacion de audio w2v-bert, el extractor de embeddings de hablante CAMPPlus, el decodificador del codec semantico, el modulo S2Mel y el vocoder BigVGAN de 22 kHz, junto con el tokenizer. En total, siete modelos encadenados que se cargan desde un unico manifiesto con residencia en dispositivo (por ejemplo, `Device::Cuda`). Segun el autor, S2Mel y el vocoder se mantienen en float32 sin autocast porque media precision de error resultaria audible en el vocoder; por eso el paquete conserva aproximadamente el tamano de la publicacion original.

Esta ficha no dispone de informacion sobre el entrenamiento: no se detallan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Conviene subrayar que ling0322 no ha entrenado el modelo, sino que ha convertido los pesos de IndexTTS-2.5 al formato de libwaifu. La model card documenta tres divergencias conscientes respecto al original. Primera: se elimina la busqueda por haces; en lugar de muestrear dentro de una busqueda en tres vias, se extrae una unica secuencia con la misma temperatura, top-k, top-p y penalizacion por repeticion. Segunda: el idioma se deduce del sistema de escritura en vez de solicitarse explicitamente. Tercera: la emocion no puede fijarse de forma independiente, ya que no se incluyen ni las ocho emociones con nombre del original ni el modelo Qwen que las extrae de una instruccion; la voz suena como sonaba la grabacion de referencia.

Como verificacion, el autor compara contra el CAMPPlus original sobre tres hablantes de LibriSpeech: las frases pronunciadas con una voz dada recuperan una similitud coseno de 0,85 a 0,89 respecto a la grabacion de ese mismo hablante, y de 0,32 a 0,63 respecto a un hablante no relacionado. La documentacion de libwaifu incluye ademas una comprobacion de transcripcion manual contra Whisper.

## Capacidades

- Sintesis de voz zero-shot: clona el timbre de un hablante a partir de unos 15 segundos de audio de referencia.
- Generacion multilingue: procesa texto en chino, ingles, japones y cantonés con un mismo modelo.
- Deteccion automatica de idioma por sistema de escritura: kana se interpreta como japones, otro sistema CJK como chino y el resto como ingles.
- Extraccion de embeddings de hablante mediante CAMPPlus, usada para condicionar la voz.
- Vocoder de alta fidelidad a 22 kHz y 80 bandas mediante BigVGAN v2.
- Ejecucion completamente local desde Rust, con API programatica (`IndexTts::from_manifest`, `tts.listen`, `tts.say`) y ejemplo de linea de comandos (`cargo run --release --example speak`).
- Interfaz grafica de escritura: `waifu draw -voice indextts25.yaml` abre la pestana text2speech de la pagina.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de vision, audio de entrada mas alla de la referencia de voz, ni modo de razonamiento explicito.

## Casos de uso

- Narracion de audiolibros con voz personalizada: a partir de 15 segundos de una grabacion del narrador, el modelo reproduce capitulos completos en su timbre, lo que permite mantener consistencia vocal a lo largo de una obra sin sesiones de estudio adicionales.
- Doblaje y localizacion de video: al cubrir chino, ingles, japones y cantonés, se puede generar la misma linea en varios idiomas conservando la identidad vocal del actor original, util en catalogos que necesitan versiones multiples.
- Asistentes de voz integrados en aplicaciones de escritorio: gracias a la API Rust de libwaifu, la sintesis puede embeberse en un binario local sin depender de servicios externos, con la voz del personaje o del asistente fijada mediante una unica grabacion de referencia.
- Personajes virtuales y videojuegos: el modelo permite dar voz a un personaje con un timbre concreto generado en tiempo de ejecucion, evitando bancos de audio pregrabados y reduciendo el peso del build.
- Accesibilidad y lectura asistida: conversion de texto a voz con el timbre de una persona conocida para usuarios que pierden la capacidad de hablar, siempre que el uso encaje en los terminos de la licencia.
- Prototipado rapido de contenido en podcast: generar bocetos de locucion para validar guiones antes de grabar en estudio, con el timbre previsto del locutor final.
- Pruebas A/B de creatividades de audio: producir variantes de un mismo anuncio o mensaje con distintas voces de referencia para medir preferencia, todo en local y sin coste por caracter.
- Confeccion de datasets sinteticos de voz: generar corpus de audio etiquetado en varios idiomas con una voz controlada, sujeto a las restricciones de la licencia y a las consideraciones eticas sobre suplantacion de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion cuantitativa aportada por el autor es una medida de similitud de hablante, no un benchmark estandar de TTS:

| Verificacion | Resultado |
|---|---|
| Similitud coseno con el hablante de referencia (3 hablantes de LibriSpeech) | 0,85–0,89 |
| Similitud coseno con un hablante no relacionado | 0,32–0,63 |
| Comprobacion de transcripcion | manual, contra Whisper (sin cifras publicadas) |

No hay datos de WER, MOS, similitud de hablante con metricas estandar (SECS), ni comparaciones con otros sistemas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los tensores ocupan 5,1 GB en float32; sumando activaciones y buffers de audio, una estimacion razonable se situa en el entorno de 7 a 9 GB de VRAM. Es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU CUDA con al menos 12 GB de memoria, como RTX 3060 de 12 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 3090, A100 o H100. La API expone `Device::Cuda` explicitamente.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 12 GB o mas; en tarjetas de 8 GB el margen es escaso y no esta confirmado.
- Opciones de despliegue: libwaifu, mediante su CLI (`waifu draw`) o su API Rust; el modelo original IndexTTS-2.5 dispone de receta en vLLM-Omni, con una configuracion de despliegue estandar que reserva hasta 0,4 de utilizacion de memoria de GPU por etapa sobre una sola GPU. El paquete de libwaifu no ofrece GGUF ni integracion con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La informacion publica de IndexTTS-2.5 solo indica que su inferencia es mas rapida que la de IndexTTS-2, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Control de emocion | Licencia | Formato |
|---|---|---|---|---|---|
| ling0322/libwaifu-indextts-2.5 | no disponible | zh, en, ja, yue (por deteccion de escritura) | No independiente | bilibili Model Use License | Manifiesto propio de libwaifu, float32 |
| IndexTeam/IndexTTS-2.5 (original) | no disponible | zh, en, ja, es, ar | Si: ocho emociones con nombre o extraidas de una instruccion con un modelo Qwen | bilibili Model Use License | Pesos originales, mas directorios de componentes |
| IndexTTS-2 | no disponible | no disponible | no disponible | bilibili Model Use License (presumiblemente la misma familia) | Pesos originales |

El paquete de libwaifu es funcionalmente mas restrictivo que su modelo base: pierde la busqueda por haces, el control independiente de emociones y la cobertura de espanol y arabe que si anuncia el repositorio oficial de IndexTTS-2.5. A cambio, ofrece un unico manifiesto, ejecucion nativa en Rust y precision float32 sin cuantizar.

## Limitaciones y advertencias

- La emocion no puede fijarse de forma independiente: el resultado hereda el tono de la grabacion de referencia, sin las ocho emociones con nombre ni el control por instruccion del modelo original.
- Sin busqueda por haces: la decodificacion se realiza con una unica secuencia muestreada (temperatura, top-k, top-p y penalizacion por repeticion), lo que puede reducir la estabilidad o la calidad frente al original en frases dificiles.
- La deteccion de idioma por sistema de escritura es fragil: textos con alfabetos mezclados, cantonés escrito en caracteres chinos o transliteraciones pueden clasificarse de forma incorrecta.
- El paquete lista chino, ingles, japones y cantonés, pero no espanol ni arabe, idiomas que el repositorio oficial de IndexTTS-2.5 si declara.
- Verificacion limitada: la medida de similitud de hablante se realizo sobre tres hablantes de LibriSpeech; no hay evaluacion de robustez en dominios ruidosos, voces infantiles, acentos marcados ni habla emocional.
- Riesgo de artefactos acusticos y de pronunciacion incorrecta, especialmente en palabras poco frecuentes, siglas y nombres propios. No es un modelo de lenguaje, por lo que no hay riesgo de alucinacion textual, pero si de audio mal generado.
- Sesgos: la calidad de la clonacion depende del timbre y del acento de la grabacion de referencia; voces poco representadas en los datos de entrenamiento originales pueden reproducirse peor.
- Riesgo de uso indebido: el modelo permite suplantar voces con unos segundos de audio. La licencia prohibe explicitamente el despliegue en vigilancia biometrica, sanidad, conduccion autonoma, ambito militar, infraestructuras criticas y toma de decisiones automatizada (§4.2).
- Restricciones comerciales: la licencia exige una licencia separada de bilibili para uso comercial que supere los 100 millones de usuarios activos mensuales o los 1000 millones de RMB de facturación anual (§2.2).
- Es una obra derivada: la model card indica que no es un producto oficial de bilibili ni de IndexTeam y que no esta respaldada por ninguno de los dos, que declina toda responsabilidad sobre ella.
- El repositorio registra 0 descargas y 0 me gusta en el momento de redactar esta ficha, por lo que no existe validacion independiente de la comunidad.
- Los componentes auxiliares tienen licencias propias: w2v-bert-2.0 y BigVGAN bajo MIT, y CAMPPlus bajo Apache License 2.0. El fichero `NOTICE` detalla los cambios aplicados a cada uno.

## Enlaces

- Pagina de HuggingFace del paquete: https://huggingface.co/ling0322/libwaifu-indextts-2.5
- Repositorio de libwaifu (Rust): https://github.com/ling0322/libwaifu
- Documentacion del pipeline en libwaifu (`docs/indextts.md`): https://github.com/ling0322/libwaifu
- Modelo base original: https://huggingface.co/IndexTeam/IndexTTS-2.5
- Repositorio oficial de IndexTTS: https://github.com/index-tts/index-tts
- Licencia bilibili Model Use License Agreement: https://huggingface.co/IndexTeam/IndexTTS-2.5/blob/main/LICENSE
- Receta de despliegue en vLLM para IndexTTS-2.5: https://recipes.vllm.ai/IndexTeam/IndexTTS-2.5
- w2v-bert-2.0 (MIT): https://huggingface.co/facebook/w2v-bert-2.0
- CAMPPlus (Apache License 2.0): https://huggingface.co/funasr/campplus
- BigVGAN v2 22 kHz 80 bandas (MIT): https://huggingface.co/nvidia/bigvgan_v2_22khz_80band_256x
