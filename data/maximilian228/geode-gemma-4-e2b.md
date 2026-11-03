# Maximilian228/Geode-Gemma-4-E2B

## Resumen

Geode-Gemma-4-E2B es un paquete de pesos cuantizados del modelo Gemma 4 E2B de Google, empaquetado por el desarrollador independiente Maximilian228 para Geode, una aplicacion Android que ejecuta modelos de lenguaje integramente en el dispositivo, sin nube ni cuenta de usuario. El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, la variante instruida de Gemma 4 E2B entrenada con quantizacion consciente (QAT) a 4 bits, un modelo pequeno y multimodal de tipo any-to-any que procesa texto, imagenes, video y audio.

El paquete no es un modelo nuevo ni un fine-tuning: es una derivacion cuantizada en formato propietario de Geode (`geode.json`), no compatible con GGUF ni con otros runtimes. Su interes radica en que demuestra un pipeline de despliegue movil completo: pesos Q4_0 con busqueda de escala por bloque de 16 valores, codificadores de vision y audio a 8 bits, y un drafter de prediccion multi-token (MTP) a 8 bits que acelera la decodificacion. El repositorio ocupa 3,2 GB, de los cuales aproximadamente 1,3 GB residen en memoria y los embeddings por capa se leen desde almacenamiento flash.

La relevancia actual es la inferencia multimodal local en telefonos de gama media: el autor reporta 7-7,5 tokens/s en un Snapdragon 720G, hasta 13 tokens/s con el drafter en codigo, y 18 segundos para codificar una foto de 280 tokens. Todo el procesamiento de voz, sonido y video ocurre en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (texto, vision, audio) con drafter MTP; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con busqueda de escala por cada 16 valores (LM); 8 bits (codificadores de vision y audio, drafter MTP) |
| Idiomas soportados | no disponible (la model card solo menciona aceleracion "on English text") |
| Licencia | Apache-2.0 (sujeta a la licencia Gemma 4 de Google) |
| Formato de pesos | Formato propietario de Geode (`geode.json`, `dense.bin`, `ple.bin`, `vision.bin`, `audio.bin`, `drafter.bin`); no es GGUF |
| Tamano del repositorio | 3,2 GB (2,94 GiB); ~1,3 GB en memoria |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized |
| Plataforma | Android 11+, ARM de 64 bits con instrucciones dot-product (ARMv8.2) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E2B en su variante instruida con QAT a 4 bits, desarrollada por Google. La model card del paquete no detalla la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion ni composicion del dataset de entrenamiento), por lo que esos datos no estan disponibles. Lo que si se documenta es el proceso de empaquetado: el autor aplica una busqueda de escala por bloque de 16 valores sobre los pesos QAT de Google, lo que reduce el error de cuantizacion respecto al redondeo Q4_0 original. Las metricas reportadas son KL de 0,213 frente a BF16 con un top-1 del 85,1 %, frente a KL 0,244 del Q4_0 original de Google sobre los mismos pesos QAT y 0,296 al aplicar la misma busqueda sobre pesos no entrenados con QAT.

El paquete incluye cinco componentes: el modelo de lenguaje (`dense.bin`), embeddings por capa leidos desde flash bajo demanda (`ple.bin`), codificador de vision (`vision.bin`, fotogramas de video a 70 tokens cada uno), codificador de audio (`audio.bin`, hasta 30 segundos de sonido a un token por 40 ms) y un drafter de prediccion multi-token (`drafter.bin`, derivado del modelo asistente QAT de Google). El drafter verifica cada borrador antes de aceptarlo, de modo que la respuesta final es la misma que sin el, pero con mayor velocidad. La decodificacion especulativa via MTP es la innovacion tecnica destacable del paquete.

## Capacidades

- Generacion de texto y razonamiento en modo conversacional (variante `-it`).
- Comprension de imagenes: fotos adjuntas en el chat, codificadas a 280 tokens por imagen.
- Comprension de video: procesamiento de fotogramas a 70 tokens cada uno.
- Comprension de audio: hasta 30 segundos de sonido o voz, un token por cada 40 ms.
- Entrada de voz mediante el microfono de la aplicacion (dictado de la peticion).
- Llamada a herramientas del agente (tool calling) integrada en Geode.
- Decodificacion especulativa con drafter MTP: misma respuesta, cada borrador verificado.
- Procesamiento 100 % local en el dispositivo, sin envio de datos a servidores.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional sin conexion: la aplicacion Geode mantiene conversaciones multi-turno en el telefono sin cuenta ni nube, adecuado para entornos con conectividad limitada o requisitos de privacidad estrictos.
- Descripcion y analisis de fotos en local: el usuario adjunta una imagen y el modelo la codifica (unos 18 s para 280 tokens en Snapdragon 720G) para responder preguntas sobre su contenido sin subirla a ningun servicio.
- Accesibilidad por voz: dictado de peticiones mediante el microfono y procesamiento de hasta 30 s de audio por mensaje, util para usuarios con dificultades de tecleo.
- Analisis de video corto en el dispositivo: extraccion de fotogramas a 70 tokens cada uno para resumir o responder preguntas sobre clips, manteniendo el material en el telefono.
- Asistencia a la programacion en movil: con el drafter MTP activo el modelo alcanza hasta ~13 tokens/s en codigo, lo que permite consultas de sintaxis o generacion de fragmentos pequenos desde el telefono.
- Agente con herramientas en el dispositivo: el soporte de tool calling permite construir flujos de varios pasos (por ejemplo, consultar datos locales y redactar una respuesta) sin salir del terminal.
- Transcripcion y resumen de notas de voz: el codificador de audio a un token por 40 ms permite procesar mensajes de voz y devolver un resumen en texto, todo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son metricas de cuantizacion y velocidad reportadas por el autor:

| Metrica | Valor |
|---|---|
| KL vs BF16 (paquete Geode) | 0,213 |
| Top-1 vs BF16 (paquete Geode) | 85,1 % |
| KL vs BF16 (Q4_0 original de Google, mismos pesos QAT) | 0,244 |
| KL vs BF16 (misma busqueda sobre pesos no QAT) | 0,296 |
| Velocidad de respuesta (Snapdragon 720G) | ~7-7,5 tokens/s |
| Velocidad con drafter en codigo | hasta ~13 tokens/s (1,3-1,7x en texto en ingles) |
| Velocidad de prompt | ~17 tokens/s |
| Codificacion de foto (280 tokens) | ~18 s |
| Dispositivo de referencia | Redmi Note 9 Pro (Snapdragon 720G, solo CPU; GPU y NPU no usadas) |

## Requisitos de hardware

- VRAM/RAM: al menos 6 GB de RAM en el telefono; ~1,3 GB del modelo en memoria y el resto (embeddings por capa) leidos desde flash.
- Almacenamiento libre suficiente para el paquete de 3,2 GB (2,94 GiB).
- CPU: ARM de 64 bits con instrucciones dot-product (ARMv8.2); Android 11 o superior.
- GPU y NPU: no se utilizan para Gemma 4 en esta version; la inferencia es por CPU.
- Despliegue: exclusivamente mediante la aplicacion Geode (beta en Google Play); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es propietario.
- Latencia y throughput: ~7-7,5 tokens/s de generacion y ~17 tokens/s de prompt en Snapdragon 720G; hasta ~13 tokens/s con drafter en codigo; ~18 s por foto de 280 tokens.
- No cabe en GPU de consumo en el sentido habitual: no hay ruta de ejecucion fuera del runtime de Geode.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (modelos multimodales pequenos para dispositivo) ni sus especificaciones, por lo que no es posible establecer una comparacion rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Formato propietario: los pesos no cargan en otros runtimes (no son GGUF); el uso queda atado a la aplicacion Geode.
- Plataforma unica: solo Android 11+ sobre ARMv8.2 de 64 bits; sin soporte documentado para escritorio, servidor o iOS.
- Sin GPU ni NPU: el rendimiento depende exclusivamente de la CPU, lo que limita el throughput en telefonos de gama baja.
- Riesgo de alucinacion: la propia model card advierte que las respuestas provienen de un modelo de IA y pueden ser erroneas.
- Idiomas: no se documenta la cobertura linguistica; la unica referencia a idioma es la aceleracion del drafter en texto en ingles.
- Contexto: la longitud de contexto no esta disponible, lo que impide planificar conversaciones largas con garantias.
- Cuantizacion agresiva: Q4_0 con escalas por bloque de 16 valores implica una perdida de calidad medible (KL 0,213 frente a BF16, top-1 85,1 %); no es adecuado para tareas que exijan precision numerica alta.
- Licencia: Apache-2.0 para el paquete, pero sujeta a la licencia Gemma 4 de Google, que puede imponer condiciones adicionales al uso comercial; conviene revisar `LICENSE` y el enlace de licencia antes de un despliegue productivo.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el mismo dia, sin historial de mantenimiento.
- Sin benchmarks estandar publicados: no hay evidencia comparable con otros modelos en tareas de razonamiento, codigo o matematicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Maximilian228/Geode-Gemma-4-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante instruida de referencia: https://huggingface.co/google/gemma-4-E2B-it
- Aplicacion Geode: https://geode.tifu.xyz
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
