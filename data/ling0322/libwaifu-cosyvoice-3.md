# ling0322/libwaifu-cosyvoice-3

## Resumen

libwaifu-cosyvoice-3 es un paquete de síntesis de voz (text-to-speech) publicado por el desarrollador ling0322 que consiste en una conversion al formato de paquete libwaifu de los pesos originales de FunAudioLLM/Fun-CosyVoice3-0.5B-2512. No es un modelo entrenado desde cero, sino una redistribucion: los mismos pesos que el modelo upstream, reorganizados en un unico manifiesto (cosyvoice3.yaml) y un conjunto de partes binarias que el runtime en Rust de libwaifu puede leer directamente. Permite clonacion de voz zero-shot: con unos segundos de una grabacion de referencia y una frase de texto, devuelve esa misma frase con esa voz a 24 kHz.

El pipeline completo suma 1 109 millones de parametros almacenados integramente en float32 (4,4 GB en disco) e incluye el modelo de lenguaje de tokens de habla Qwen2-0.5B, un flujo DiT, el vocoder HiFT, el tokenizador S3Tokenizer v3 y el extractor de locutor CAMPPlus. Soporta diez idiomas: chino, ingles, frances, espanol, japones, coreano, italiano, ruso y aleman, ademas del propio chino en la lista. Todo el material necesario para sintetizar voz viaja dentro del paquete, sin descargas adicionales.

Su relevancia es practica: empaqueta un sistema TTS de varios componentes en un formato unico consumible desde Rust (con soporte CUDA), lo que simplifica el despliegue en aplicaciones que no quieren depender del stack Python original. Se distribuye bajo licencia Apache 2.0, con la advertencia explicita de que no es un producto oficial de FunAudioLLM ni esta respaldado por ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por etapas: LM de tokens de habla basado en Qwen2-0.5B, flujo DiT, vocoder HiFT, tokenizador de habla S3Tokenizer v3 y extractor de locutor CAMPPlus |
| Parametros totales | 1 109 M (pipeline completo, float32) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el paquete se distribuye integramente en float32 y fp16 no esta implementado |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato de paquete libwaifu (manifiesto cosyvoice3.yaml + partes binarias); no GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo no sigue la arquitectura de un transformer de lenguaje convencional, sino la de un sistema TTS modular encadenado. El componente central es un modelo de lenguaje de tokens de habla basado en Qwen2-0.5B, que predice tokens de audio; a continuacion un flujo DiT (Diffusion Transformer) transforma esos tokens en representaciones acusticas, y el vocoder HiFT convierte dichas representaciones en onda de audio a 24 kHz. La tokenizacion del habla corre a cargo de S3Tokenizer v3 y la representacion del locutor (necesaria para la clonacion de voz) la aporta CAMPPlus, que se incluye empaquetado desde funasr/campplus. El conjunto son cinco modelos mas el tokenizador de texto, unificados en un unico manifiesto.

En cuanto al entrenamiento, no hay informacion en la documentacion proporcionada sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Este paquete es una conversion de pesos de un modelo ya entrenado por FunAudioLLM, no un reentrenamiento, por lo que los datos de entrenamiento corresponden al modelo upstream. La innovacion tecnica de esta publicacion es el formato: una tabla unica en lugar de cinco ficheros y un diseno pensado para que el runtime Rust ejecute el pipeline completo. Entre las diferencias conocidas respecto al upstream, no se implementan el streaming, el modo instruct (`inference_instruct2`), la conversion de voz ni fp16; los buffers aleatorios del vocoder HiFT se derivan de la semilla de lectura y el ruido inicial del flujo se almacena como `cosyvoice3.flow.rand_noise`.

## Capacidades

- Sintesis de voz multilingue a partir de texto: genera audio a 24 kHz en zh, en, fr, es, ja, ko, it, ru y de.
- Clonacion de voz zero-shot: con unos segundos de una grabacion de referencia obtiene una representacion de locutor y sintetiza nuevas frases con esa voz.
- Metodo `listen`: calcula la huella de voz una sola vez por locutor para reutilizarla en sintesis posteriores.
- Metodo `say_after`: permite condicionar la sintesis proporcionando la transcripcion de lo que se dice en la grabacion de referencia, util cuando se dispone de texto alineado con el audio.
- Inferencia en GPU (CUDA) o dispositivo, con gestion de residencia de pesos en el runtime libwaifu.
- Capacidades no implementadas en este paquete: streaming, modo instruct, conversion de voz y calculo en fp16.

## Casos de uso

- Clonacion de voz para locuciones: a partir de una muestra de pocos segundos de una persona, generar narraciones o avisos completos con su timbre, sin necesidad de sesiones de grabacion adicionales.
- Localizacion de contenido de audio: sintetizar el mismo guion en los diez idiomas soportados manteniendo una voz de referencia comun, util para doblar material divulgativo o formativo.
- Asistentes de voz embebidos: integrar el pipeline en una aplicacion Rust con CUDA para leer respuestas generadas por texto, evitando el stack Python original.
- Accesibilidad: convertir texto en voz natural y personalizada para lectores de pantalla o interfaces de accesibilidad con voces familiares al usuario.
- Prototipado de videojuegos y personajes: generar dialogos con voces distintas a partir de muestras cortas de actores, agilizando la iteracion antes de una grabacion definitiva.
- Audiolibros y contenido bajo demanda: producir narraciones largas con una voz clonada consistente, aprovechando el metodo `listen` para fijar la voz una sola vez.
- Sistemas de avisos automatizados: emitir mensajes de voz en multiples idiomas en entornos como telefonia o notificaciones, con la voz de referencia de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y la busqueda web asociada no incluyen metricas de calidad (MOS, similitud de locutor, WER) ni comparativas numericas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 1 109 M de parametros en float32, los pesos ocupan aproximadamente 4,44 GB. Sumando activaciones, buffers del vocoder y los modelos auxiliares, una estimacion razonable es de 6 a 8 GB de VRAM en float32 (cifra derivada de los datos disponibles, no publicada por el autor).
- GPU recomendadas: no especificadas en la informacion disponible. El runtime expone `Device::Cuda`; dada la huella de memoria, cabria en GPUs de 8 GB o mas.
- Cabe en GPU de consumo: si, en GPUs con al menos 8 GB de VRAM (por ejemplo, gama RTX 3060 12 GB, 4060 Ti 16 GB, 4070, 4080, 4090), segun la estimacion anterior.
- Opciones de despliegue: el formato es especifico de libwaifu, por lo que el despliegue previsto es el runtime en Rust de libwaifu. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| libwaifu-cosyvoice-3 | 1 109 M (pipeline) | no disponible | 10 | Apache 2.0 | Paquete libwaifu | HuggingFace (ling0322) |
| Fun-CosyVoice3-0.5B-2512 (upstream) | 0,5 B (LM) mas componentes | no disponible | no disponible | Apache 2.0 | no disponible | HuggingFace (FunAudioLLM) |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es una copia modificada: la model card indica explicitamente que no es un producto oficial de FunAudioLLM ni cuenta con su respaldo.
- No implementa streaming, modo instruct (`inference_instruct2`), conversion de voz ni fp16, lo que limita escenarios de baja latencia o de memoria reducida.
- Solo se distribuye en float32, con un tamano en disco de 4,4 GB y sin opciones de cuantizacion documentadas.
- El formato de pesos es propietario de libwaifu, por lo que no es directamente utilizable en runtimes habituales de TTS sin conversion.
- No hay informacion publicada sobre sesgos, tasas de alucinacion acustica, fidelidad de la clonacion ni comportamiento por idioma.
- La clonacion de voz plantea riesgos de uso indebido (suplantacion, fraude); aunque la licencia es Apache 2.0 y permite uso comercial, el usuario es responsable de contar con consentimiento para clonar voces de terceros y de cumplir la normativa aplicable.
- La licencia Apache 2.0 obliga a conservar los avisos de licencia y a documentar los cambios, tal como se refleja en los ficheros LICENSE y NOTICE del paquete.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ling0322/libwaifu-cosyvoice-3
- Modelo base upstream: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Extractor de locutor CAMPPlus: https://huggingface.co/funasr/campplus
- Repositorio de libwaifu: https://github.com/ling0322/libwaifu
- Documentacion del pipeline CosyVoice3 en libwaifu: docs/cosyvoice3.md (dentro del repositorio de libwaifu)
- Repositorio CosyVoice (referencia del proyecto original): https://github.com/QwenAudio/CosyVoice
- Fork de referencia CosyVoice-v3: https://github.com/wehos/CosyVoice-v3
- Sitio del proyecto CosyVoice: https://cosyvoice.org/
