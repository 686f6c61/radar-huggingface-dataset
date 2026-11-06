# Maximilian228/Geode-Gemma-4-E4B

## Resumen

Geode-Gemma-4-E4B es un paquete de pesos cuantizados de Gemma 4 E4B, el modelo multimodal pequeno de Google, empaquetado por Maximilian228 para Geode, una aplicacion Android que ejecuta modelos de lenguaje integramente en el telefono. El modelo base es google/gemma-4-E4B-it-qat-q4_0-unquantized, la variante entrenada con cuantizacion consciente (QAT) en 4 bits, y el paquete anade los codificadores de vision y audio, el borrador de prediccion multi-token y el tokenizador en un formato propio del motor de Geode.

El objetivo es claro: ofrecer inferencia local any-to-any (texto, imagen, video, audio) en telefonos de gama alta sin nube ni cuenta de usuario. Frente a Gemma 4 E2B, el modelo mas pequeno de la familia, E4B produce respuestas notablemente mejores a costa de aproximadamente dos tercios de su velocidad. El paquete ocupa 4,8 GB en disco (4,43 GiB), de los cuales 2,6 GB se cargan en memoria y el resto (embeddings por capa) se lee desde el almacenamiento flash a demanda.

La relevancia actual esta en la combinacion de tres factores: pesos QAT de Google que preservan calidad en 4 bits, un motor propio que reparte capas entre NPU Hexagon y GPU Adreno, y un borrador de decodificacion especulativa que acelera la generacion. Todo ello bajo licencia Apache-2.0, lo que facilita su uso comercial y su inspeccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, vision, audio) con borrador de prediccion multi-token; detalles de capas y atencion no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; se documenta una prueba con prompt de 1300 tokens |
| Tipos de cuantizacion | Q4_0 QAT con escala buscada por cada 16 valores; codificadores de vision y audio en 8 bits; borrador MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | Formato propio de Geode (`geode.json`, `dense.bin`, `ple.bin`, `vision.bin`, `audio.bin`, `drafter.bin`); no es GGUF ni compatible con otros runtimes |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B en su variante instruct y QAT de 4 bits, desarrollada por Google. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible en el material proporcionado. Lo que si se documenta es la estructura del paquete: un modelo de lenguaje denso (`dense.bin`), embeddings por capa leidos desde flash (`ple.bin`), un codificador de vision que procesa fotos y fotogramas de video a 70 tokens por imagen, un codificador de audio que acepta hasta 30 segundos de sonido con un token cada 40 ms, y un borrador de prediccion multi-token (`drafter.bin`) derivado del modelo asistente QAT de Google.

La innovacion tecnica principal es la decodificacion especulativa con verificacion: el borrador propone varios tokens y el modelo principal valida cada propuesta, de modo que la respuesta final es identica a la que produciria el modelo sin borrador. Ademas, el motor de Geode distribuye la carga entre la NPU Hexagon (capas completas, atencion incluida, sobre sus unidades matriciales) y la GPU Adreno (escritura de la respuesta), con un modo alternativo en el que la GPU asume tambien el prompt si no hay NPU disponible.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes: fotos adjuntas en el chat, codificadas por el codificador de vision.
- Comprension de video mediante fotogramas codificados a 70 tokens cada uno.
- Comprension de audio: hasta 30 segundos de voz o sonido por fragmento.
- Entrada de voz mediante el microfono de la aplicacion (mensajes de voz procesados en el dispositivo).
- Llamada a herramientas del agente (tool calling), segun la model card.
- Decodificacion especulativa con borrador MTP para acelerar la generacion.
- Procesamiento integramente local: sin nube, sin cuenta, datos retenidos en el telefono.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente personal offline en Android: el modelo gestiona conversaciones multi-turno con texto, fotos y notas de voz sin enviar datos a ningun servidor, adecuado para usuarios preocupados por la privacidad.
- Descripcion y analisis de imagenes en el dispositivo: adjuntar una foto en el chat y pedir una descripcion, extraccion de texto visible o identificacion de objetos, con codificacion en aproximadamente 0,9 s en la NPU.
- Transcripcion y comprension de audio corto: adjuntar hasta 30 segundos de sonido o dictar una consulta por microfono, procesada en aproximadamente 0,3 s en la NPU.
- Analisis de fotogramas de video: extraer y describir escenas de un clip corto a 70 tokens por fotograma, util para resumir contenido visual sin subir el video.
- Agente local con tool calling: integrado en flujos de la aplicacion Geode para ejecutar acciones del telefono mediante las herramientas del agente, con validacion de cada paso por el modelo principal.
- Demostraciones y evaluacion de IA en el dispositivo: investigador o desarrollador que quiere medir latencia y calidad de un modelo multimodal de 4 bits en hardware movil real (Snapdragon 8 Elite) sin infraestructura de servidor.
- Prototipado de interfaces any-to-any: la aplicacion sirve como banco de pruebas para disenar experiencias que combinan imagen, audio y texto en un mismo hilo conversacional.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros); indica explicitamente que la calidad del paquete Q4 frente a BF16 (KL y top-1) "aun no se ha medido". Los unicos datos de rendimiento disponibles son de velocidad en un RedMagic 10 Pro con Snapdragon 8 Elite:

| Metrica | Valor |
|---|---|
| Lectura de prompt (1300 tokens, NPU Hexagon) | ~940 tokens/s |
| Lectura de prompt (GPU Adreno 7xx o superior, sin NPU) | ~200 tokens/s |
| Generacion de respuesta (GPU Adreno, con borrador) | ~29-40 tokens/s |
| Codificacion de una foto | ~0,9 s |
| Codificacion de 10 s de audio | ~0,3 s |
| Memoria en uso | 2,6 GB (resto leido desde flash) |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 8 GB de RAM en el telefono como minimo; 2,6 GB del paquete residen en memoria y los embeddings por capa se leen desde flash.
- Almacenamiento libre: 4,8 GB (4,43 GiB) para el paquete completo.
- Procesador: ARM de 64 bits con instrucciones de producto escalar (ARMv8.2); Android 11 o superior.
- Aceleracion: NPU Hexagon en Snapdragon 8 Elite (modo por defecto, NPU + GPU); GPU Adreno 7xx o superior como alternativa para el prompt; GPU Mali y Adreno antiguas no se utilizan.
- En telefonos de 6 GB de RAM se recomienda Gemma 4 E2B en lugar de este paquete.
- Opciones de despliegue: exclusivamente la aplicacion Geode (beta en Google Play); el formato no es GGUF y no carga en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los indicados en la tabla anterior para Snapdragon 8 Elite; no hay datos para otros SoC.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Despliegue |
|---|---|---|---|---|---|
| Geode-Gemma-4-E4B | no disponible | no disponible | texto, imagen, video, audio | Apache-2.0 | solo app Geode (Android) |
| Gemma 4 E2B | no disponible (menor que E4B) | no disponible | texto, imagen, video, audio (segun la model card) | licencia Gemma 4 | Geode, telefonos de 6 GB |
| Gemma 4 E4B (base, google/gemma-4-E4B-it) | no disponible | no disponible | texto, imagen, video, audio | licencia Gemma 4 | runtime de Google / QAT |
| Gemma 4 E4B QAT Q4_0 (google/gemma-4-E4B-it-qat-q4_0-unquantized) | no disponible | no disponible | texto, imagen, video, audio | licencia Gemma 4 | segun runtime compatible |

La comparativa se limita a la familia Gemma 4 porque la informacion proporcionada no incluye datos de otros modelos pequenos multimodales on-device. Las diferencias clave entre el paquete Geode y el modelo base son el formato propio, la inclusion de codificadores y borrador, y la optimizacion para NPU/GPU moviles; el modelo base, en cambio, no esta empaquetado para Geode.

## Limitaciones y advertencias

- La calidad del paquete Q4 frente a BF16 no se ha medido; se desconoce la perdida real por cuantizacion.
- El modelo puede producir respuestas incorrectas; la propia model card advierte que las respuestas provienen de un modelo de IA y pueden ser erroneas.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- El formato es propietario de Geode: no es portable a otros runtimes ni sirve para servidores o pipelines de escritorio.
- Requiere hardware especifico (ARMv8.2, 8 GB de RAM, Android 11+); el rendimiento documentado solo aplica a Snapdragon 8 Elite y no hay datos para otros chips.
- La aceleracion por NPU solo esta disponible en determinados SoC; en el resto se recurre a la GPU Adreno 7xx o superior, con menor throughput de prompt (~200 tokens/s).
- El audio se limita a fragmentos de hasta 30 segundos y el video se procesa por fotogramas, no como flujo continuo.
- Aunque la licencia del paquete es Apache-2.0, el modelo base remite a la licencia de Gemma 4 de Google; conviene revisar sus terminos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-Gemma-4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Gemma 4 E4B instruct: https://huggingface.co/google/gemma-4-E4B-it
- Aplicacion Geode: https://geode.tifu.xyz
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
