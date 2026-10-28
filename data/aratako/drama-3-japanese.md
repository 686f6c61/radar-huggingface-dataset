# Aratako/Drama-3-Japanese

## Resumen

Drama-3-Japanese es un ajuste fino en japones del modelo de sintesis de voz Fish Audio Drama 3, publicado por el usuario Aratako. Se distribuye como un checkpoint completo de 35.899.643.008 parametros (35,9 mil millones) en formato safetensors, con un repositorio de 41,5 GB, y se ejecuta con el mismo codigo de inferencia que el modelo base (fish-speech o SGLang-Omni). La tarea declarada es text-to-speech de un solo hablante, con soporte opcional de audio de referencia para clonacion de voz y de descripciones textuales (captions) para disenar el timbre y el estilo.

El problema que aborda es concreto: la mayoria de los TTS multilingues rinden por debajo de lo deseable en la lectura de kanji japoneses y en el control fino de la expresividad. Este ajuste se entrena sobre unas 70.000 horas de audio japones mediante LoRA (rango 32) mas el reentrenamiento de los embeddings de tokens y del decodificador de audio, e incorpora etiquetas en linea en japones (`[笑いながら]`, `[驚いて]`, `[怒りを込めて]`) para modular emocion y entrega sin cambiar el texto.

Su relevancia ahora es doble: por un lado, mejora marginal pero medible sobre el modelo base en lectura de kanji de uso comun (93,188% frente a 92,021% de precision en el benchmark JKYB-Parakeet); por otro, es un ejemplo de especializacion linguistica de un modelo generativo de audio de gran tamano con coste de entrenamiento contenido. La licencia es la Fish Audio Community License, no una licencia open source aprobada por la OSI, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; derivada de fishaudio/drama-3. Las etiquetas del repositorio incluyen `bsgemm-moe`, lo que apunta a una arquitectura con mezcla de expertos y kernels GEMM agrupados |
| Parametros totales | 35.899.643.008 (35,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en la evaluacion se limito la generacion a 2048 frames acusticos, aproximadamente 95,1 segundos) |
| Tipos de cuantizacion | no disponible; el repositorio declara la relacion `base_model:quantized:fishaudio/drama-3`, lo que implica que el modelo base dispone de variantes cuantizadas |
| Idiomas soportados | japones (ja) |
| Licencia | fish-audio-community-license (campo `license: other`) |
| Formato de pesos | safetensors; repositorio de 41,5 GB |
| Tarea (pipeline) | text-to-speech |
| Entradas | texto japones, caption descriptivo opcional, hasta tres clips de referencia del mismo hablante (opcional), etiquetas en linea en japones |
| Salida | audio WAV mono de un solo hablante |
| Descargas / likes | 176 descargas, 13 likes |
| Fechas | creado el 2026-10-22, actualizado el 2026-10-24 |

## Arquitectura y entrenamiento

La model card no describe la topologia interna del modelo base; solo indica que Drama-3-Japanese es un ajuste fino de Fish Audio Drama 3 y que mantiene compatibilidad total con el codigo de inferencia upstream (basta sustituir la ruta del checkpoint). Las etiquetas del repositorio (`bsgemm-moe`, `fish_omni`) apuntan a un transformer con capas de mezcla de expertos y a un esquema de modelado de audio del tipo omni, con tokenizador acustico y decodificador de audio diferenciados del cuerpo del modelo de lenguaje. El numero de parametros activos por token no se ha publicado, por lo que no es posible estimar el coste real de inferencia a partir del total.

El entrenamiento consistio en un LoRA de rango 32 y alpha 32 durante una epoca sobre aproximadamente 70.000 horas de habla japonesa, con AdamW y tasas de aprendizaje diferenciadas: 2e-4 para el LoRA, 2e-5 para los embeddings de tokens y 5e-5 para el decodificador de audio. Los embeddings y el decodificador se entrenaron de forma completa, no solo con adaptadores de bajo rango, lo que explica que el checkpoint final herede el tamano del modelo base. No se documenta el proceso de alineamiento (RLHF, DPO) ni la composicion detallada del corpus (proporcion de habla espontanea, lectura, doblaje, locutores unicos o multiples).

Como innovaciones destacables del sistema, cabe senalar el control por caption en japones (descripcion del timbre, la emocion y el estilo en lenguaje natural), la clonacion con hasta tres referencias del mismo locutor y el uso de etiquetas en linea para dirigir la interpretacion dentro del propio texto. El repositorio incluye un fichero `TAG_LIST.md` con el catalogo de etiquetas disponibles.

## Capacidades

- Sintesis de voz en japones a partir de texto plano, sin necesidad de referencia ni de caption.
- Diseno de voz por caption: descripcion en japones de timbre, edad aparente, emocion y estilo de habla (por ejemplo, "voz masculina adulta calmada, tono grave y formal").
- Clonacion de voz con una o hasta tres muestras de referencia del mismo hablante, con transcripciones asociadas.
- Control expresivo mediante etiquetas en linea en japones intercaladas en el texto: risa, sorpresa, enfado, susurro, tos, voz debil, entre otras.
- Generacion de un solo hablante por invocacion (no se documenta dialogo multihablante nativo).
- Compatibilidad con la API de speech de SGLang-Omni (`/v1/audio/speech`), lo que permite integrarlo como servicio HTTP con formato de respuesta WAV.
- Interoperabilidad con el ecosistema fish-speech: mismo codigo de inferencia que Drama 3 cambiando la ruta del modelo.
- No se documentan capacidades de vision, audio de entrada como comprension semantica, tool calling ni razonamiento multi-paso; el modelo es exclusivamente generativo de audio.

## Casos de uso

- Audiolibros y ficcion sonora en japones: el modelo permite narrar pasajes largos con un unico hablante y modular la entrega mediante etiquetas en linea, de modo que un mismo texto puede generar una version neutra y otra dramatizada sin reentrenar nada.
- Doblaje y localizacion de videojuegos: para cada personaje se clona la voz del actor con tres referencias y se dirige la interpretacion con captions y etiquetas, lo que agiliza las iteraciones de direccion de voz antes de la grabacion final en estudio.
- Prototipado de personajes para VTubers y asistentes virtuales: el diseno por caption permite generar varias propuestas de timbre a partir de una descripcion textual, sin necesidad de disponer de un locutor de referencia en la fase conceptual.
- Generacion de datos sinteticos para ASR japones: al poder controlar texto, estilo y locutor, se pueden producir corpus etiquetados con cobertura de kanji y lecturas poco frecuentes, utiles para aumentar el conjunto de entrenamiento de sistemas de reconocimiento de voz.
- Sistemas de atencion telefonica automatizada en japones: la API HTTP de SGLang-Omni permite desplegar el modelo como servicio de TTS detrás de un motor de dialogos, con respuestas de baja latencia para frases cortas y control del tono segun el contexto de la conversacion.
- Accesibilidad y lectura de contenido: conversion de articulos, documentacion tecnica o avisos corporativos a audio en japones, con la ventaja de una lectura de kanji de uso comun mas precisa que la del modelo base, lo que reduce los errores de pronunciacion en nombres y terminos compuestos.
- Preservacion de voz con consentimiento: reconstruccion de la voz de un locutor a partir de archivos historicos para nuevos contenidos, siempre que exista autorizacion explicita y se cumplan los terminos de la licencia.

## Benchmarks y rendimiento

La evaluacion se realizo con SGLang-Omni en el commit `b658fa671d6a8a01d9b973754300837dff49d22d`, con temperatura 1.0, top-p 0.9, top-k 30 y un maximo de 2048 frames acusticos (aproximadamente 95,1 segundos). Cada elemento se genero cinco veces con muestreo aleatorio independiente y se descartaron los pares en los que alguno de los dos modelos producia salida vacia o audio fuera del rango de duracion especificado.

Benchmark de lectura de kanji de uso comun (Joyo Kanji Yomi Benchmark, edicion Parakeet), con 13.536 textos por 5 repeticiones, sin audio de referencia ni captions. Se consideraron exitosas las salidas de 1 a 10 segundos y se retuvieron los pares validos en ambos modelos (66.423 de 67.680):

| Modelo | Precision de lectura objetivo (mayor mejor) | Kana-CER (menor mejor) | Kana-CER recortado (menor mejor) | Kana-CER por frase (menor mejor) | CER de texto estandar (menor mejor) |
|---|---:|---:|---:|---:|---:|
| Fish Audio Drama 3 | 92,021% | 7,474% | 6,285% | **1,421%** | 5,699% |
| Drama-3-Japanese | **93,188%** | **6,548%** | **5,511%** | 2,087% | **5,572%** |

Las puntuaciones se agregan sobre las cinco ejecuciones con el evaluador oficial de la edicion Parakeet. El ajuste mejora la precision de lectura y el CER global, pero empeora el CER por frase (1,421% frente a 2,087%), un dato relevante si el caso de uso penaliza frases individuales mal leidas.

En clonacion de voz se realizo una evaluacion sobre el corpus JVS (100 hablantes por 5 textos por 5 repeticiones, con una o tres referencias y sin captions, mismas referencias y transcripciones para ambos modelos), con salidas validas de 1 a 20 segundos y 2.492 de 2.500 pares retenidos con una referencia y 2.429 de 2.500 con tres. **Los valores numericos de esa tabla (similitud CAM++, similitud ERes2Net y el resto de metricas) no estan disponibles en la informacion proporcionada**, ya que el contenido se interrumpe en las cabeceras de la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros y no de una ficha oficial: en bf16/fp16 los pesos ocupan unos 72 GB, a los que hay que sumar cache de frames acusticos y el decodificador de audio; en int8 bajaran a unos 36 GB y en int4 a unos 18-20 GB. El repositorio pesa 41,5 GB para 35,9 mil millones de parametros (aproximadamente 1,15 bytes por parametro), lo que sugiere un checkpoint con mezcla de precisiones o componentes parcialmente cuantizados; conviene verificar la configuracion real antes de dimensionar el hardware.
- GPU recomendadas en precision completa: A100 80 GB o H100 80 GB en una sola unidad. El modelo no cabe en GPUs de 24 GB sin cuantizacion.
- Con cuantizacion int4 es plausible que quepa en una RTX 4090 (24 GB) o en una RTX 5090, dejando margen escaso para el decodificador y la cache; con int8 harian falta dos GPUs de 24 GB o una unica GPU de 40-48 GB.
- El tag `bsgemm-moe` sugiere dependencia de kernels GEMM agrupados, habitualmente implementados para GPUs de datacenter; el soporte en GPUs de consumo debe validarse antes de planificar un despliegue.
- Opciones de despliegue documentadas: SGLang-Omni (`sgl-omni serve --model-path Aratako/Drama-3-Japanese --port 8000`) y el codigo de fish-speech. No hay evidencia en la informacion disponible de soporte para vLLM, TGI, llama.cpp u Ollama, y estos ultimos no son adecuados para un modelo de audio de este tipo.
- Latencia y throughput: no disponible. Como referencia de diseno, el limite de 2048 frames acusticos (unos 95,1 segundos de audio) se uso como tope de generacion en la evaluacion, no como garantia de latencia; el modelo base es autrorregresivo sobre frames acusticos, por lo que el tiempo de sintesis crece con la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama-3-Japanese | 35,9 mil millones | no disponible; 2048 frames (unos 95,1 s) como tope en la evaluacion | japones | fish-audio-community-license | HuggingFace, 176 descargas, demo Space |
| Fish Audio Drama 3 (base) | no disponible en la informacion proporcionada | mismo esquema de frames acusticos | no disponible en la informacion proporcionada | fish-audio-community-license | HuggingFace (fishaudio/drama-3) |

No se dispone de datos verificables en la informacion proporcionada sobre otros modelos de TTS comparables (parametros, contexto, resultados de benchmarks o licencia), por lo que no se incluye una comparativa adicional: los datos serian inventados. La unica comparacion con cifras reales es la que enfrenta a este ajuste con su modelo base en el benchmark JKYB-Parakeet, recogida en la seccion anterior.

## Limitaciones y advertencias

- Licencia restrictiva: la Fish Audio Community License no es una licencia open source aprobada por la OSI. Antes de un uso comercial hay que revisar el fichero LICENSE del repositorio; los terminos pueden imponer restricciones de atribucion, de uso de la marca o de redistribucion.
- Modelo monolingue: solo japones. No se documenta soporte de espanol ni de otras lenguas, y no hay benchmarks en espanol en la informacion disponible.
- Clonacion de voz y suplantacion de identidad: la capacidad de clonar con una sola referencia es un riesgo directo de deepfakes y fraude de voz. Es imprescindible obtener consentimiento explicito del locutor y aplicar marcas de agua o deteccion en produccion.
- Alucinacion en el sentido de errores de lectura: aunque mejora al modelo base en precision de lectura de kanji de uso comun (93,188%), sigue fallando en aproximadamente 7 de cada 100 lecturas objetivo, incluyendo nombres propios y terminos tecnicos. El CER por frase es peor que el del modelo base (2,087% frente a 1,421%), lo que indica que los errores restantes tienden a concentrarse en frases concretas.
- Fallos de generacion: la propia evaluacion descarta pares con salida vacia o duracion fuera de rango, lo que confirma que existen generaciones fallidas. En produccion hay que implementar validacion de duracion y reintentos.
- Limite practico de duracion: la configuracion de referencia limita la generacion a 2048 frames acusticos (unos 95,1 segundos). Textos mas largos requieren troceado y concatenacion, con riesgo de discontinuidad prosodica.
- Sesgos no evaluados: no se publican analisis de sesgo por genero, edad, acento regional o variedad dialectal del japones. La cobertura de 70.000 horas no garantiza equilibrio entre variedades.
- Sin datos de parametros activos ni de la topologia interna, es dificil estimar coste por token y planificar capacidad con precision; las cifras de VRAM de esta ficha son estimaciones derivadas del conteo de parametros.
- Comunidad reducida: 176 descargas y 13 likes en el momento de la consulta implican poca validacion externa y escasos reportes de incidencias en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aratako/Drama-3-Japanese
- Modelo base (Fish Audio Drama 3): https://huggingface.co/fishaudio/drama-3
- Demo Space: https://huggingface.co/spaces/Aratako/Drama-3-Japanese-Demo
- Lista de etiquetas en linea: https://huggingface.co/Aratako/Drama-3-Japanese/blob/main/TAG_LIST.md
- Repositorio fish-speech: https://github.com/fishaudio/fish-speech
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Commit de SGLang-Omni usado en la evaluacion: https://github.com/sgl-project/sglang-omni/tree/b658fa671d6a8a01d9b973754300837dff49d22d
- Benchmark Joyo Kanji Yomi (edicion Parakeet): https://github.com/Parakeet-Inc/Joyo-Kanji-Yomi-Benchmark-Parakeet-Edition
