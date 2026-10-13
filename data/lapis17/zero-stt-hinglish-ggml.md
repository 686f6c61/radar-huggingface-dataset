# Lapis17/zero-stt-hinglish-ggml

## Resumen

Zero STT Hinglish — GGML es una conversion del modelo de reconocimiento automatico del habla (ASR) `shunyalabs/zero-stt-hinglish` al formato binario GGML de whisper.cpp. El repositorio lo publica el usuario Lapis17 y no es un modelo entrenado desde cero: se trata de un artefacto de conversion generado con un script legacy de whisper.cpp, pensado para ejecutar el modelo original fuera del ecosistema de PyTorch/safetensors, presumiblemente sobre hardware AMD.

El modelo de origen, desarrollado por Shunya Labs, esta especializado en Hinglish, es decir, en el cambio de codigo (code-switching) entre hindi e ingles dentro de una misma conversacion, un fenomeno muy comun en la India. Segun la documentacion del repositorio original, se trata de la version ligera de Zero STT Codeswitch publicada como codigo abierto, y la propia model card del autor advierte de que existe una version mas rapida disponible a traves de shunyalabs.ai.

La relevancia de esta ficha es limitada pero concreta: el artefacto permite probar el modelo original en inferencia local mediante whisper.cpp, aunque su propio autor advierte de que la compatibilidad con whisper.cpp v1.8.4 y con la build de AMD prevista "debe verificarse antes de su uso". No se dispone de datos sobre el numero de parametros, la ventana de contexto de audio, los idiomas declarados ni los niveles de cuantizacion incluidos en el repositorio de 1,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con autoatencion y conexiones residuales, familia Whisper (encoder-decoder) segun las etiquetas del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | formato GGML legacy generado con el script de conversion de whisper.cpp; niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | no disponibles en el repositorio; el modelo de origen esta orientado a hindi, ingles y Hinglish (code-switching) |
| Licencia | other en este repositorio; el modelo de origen figura como openrail en los metadatos de su model card |
| Formato de pesos | GGML (binario legacy de whisper.cpp) |
| Tamano del repositorio | 1,5 GB |
| Pipeline declarado | no disponible |
| Autor de la conversion | Lapis17 |
| Modelo de origen | shunyalabs/zero-stt-hinglish |
| Fecha de creacion | 12 de octubre de 2026 |
| Ultima actualizacion | 13 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en la documentacion disponible. El repositorio de Lapis17 no describe el dataset, el numero de horas de audio, ni si hubo etapas de ajuste fino o de alineacion. Lo unico que indica su model card es que el binario se genero con un script de conversion GGML legacy de whisper.cpp y que la compatibilidad con whisper.cpp v1.8.4 y con la build de AMD prevista debe verificarse antes de usar el artefacto.

Sobre la arquitectura, las etiquetas del repositorio apuntan a la familia Whisper y el visor de terceros hfviewer describe el modelo de origen como un modelo de reconocimiento automatico del habla con autoatencion, conexiones residuales (skip connections) y bloques transformer, lo que es coherente con un encoder-decoder transformer de tipo Whisper. En la model card del modelo de origen aparecen referencias a los corpus ARTPARK-IISc/Vaani, ai4bharat/Kathbath y ai4bharat/Shrutilipi, habituales en el entrenamiento de sistemas ASR para lenguas indicas, pero no se especifica si se usaron efectivamente ni en que proporcion. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) sobre audio, con salida en texto.
- Manejo de code-switching hindi-ingles (Hinglish) dentro de una misma conversacion, que es el rasgo diferencial del modelo de origen.
- Transcripcion de audio en hindi e ingles como idiomas principales, segun la orientacion del modelo original.
- Capacidad de traduccion de voz: no confirmada en la informacion disponible.
- Tool calling / function calling: no aplica; no es un modelo de lenguaje generativo con soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multimodales adicionales (vision, audio generativo): no disponibles.
- Modo "thinking" o razonamiento explicito: no aplica.

## Casos de uso

- Transcripcion de conversaciones coloquiales indias: el modelo esta pensado para audio donde el hablante alterna hindi e ingles en la misma frase, un escenario donde los ASR genericos suelen degradarse. Adecuado para transcribir entrevistas, podcasts o reuniones informales.
- Subtitulado de contenido audiovisual para plataformas dirigidas al publico indio: permite generar subtitulos que conservan las palabras en ingles dentro de una frase en hindi, en lugar de forzar una traduccion.
- Analitica de centros de contacto: transcripcion de llamadas de atencion al cliente en India para posterior analisis de intenciones, cumplimiento y calidad, aprovechando el cambio de codigo natural de los agentes y clientes.
- Notas clinicas o administrativas dictadas: conversion de dictado oral mezclando terminologia tecnica en ingles con estructura gramatical hindi.
- Indexacion y busqueda de archivos de audio: transcripcion masiva para hacer recuperable por texto un archivo de grabaciones historicas.
- Prototipado e investigacion en ASR local: al ser un binario GGML, permite experimentar con whisper.cpp en maquinas sin GPU NVIDIA y comparar con otros modelos de la familia Whisper.
- Evaluacion comparativa de artefactos de conversion: util como caso de estudio sobre la degradacion o perdida de calidad que puede introducir un script GGML legacy frente a los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto GGML no incluye tasas de error de palabras (WER), tasas de error de caracteres (CER) ni comparaciones con otros sistemas, y tampoco se han recuperado en la busqueda web resultados numericos atribuibles al modelo de origen `shunyalabs/zero-stt-hinglish`.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no declara el numero de parametros ni el nivel de cuantizacion, por lo que no se puede calcular la huella de memoria. El tamano del repo (1,5 GB) es un limite inferior orientativo del peso del binario, no de la memoria necesaria en ejecucion.
- GPU recomendadas: no disponible. La model card menciona una "build de AMD prevista", lo que sugiere que la conversion se hizo con intencion de ejecutarse sobre hardware AMD (ROCm), pero no se detalla el modelo de GPU.
- Compatibilidad con GPU de consumo: no verificable con la informacion disponible. Si el modelo subyacente corresponde a una variante Whisper de tamano medio o grande, las GPU de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB) serian suficientes en cuantizaciones de 8 bits o inferiores; esto es una extrapolacion de la familia, no un dato confirmado.
- Opciones de despliegue: whisper.cpp es la via natural, dado el formato GGML. El autor advierte que la compatibilidad con whisper.cpp v1.8.4 debe verificarse. El formato GGML legacy puede no ser directamente compatible con versiones modernas de whisper.cpp, que trabajan con GGUF; en ese caso seria necesario reconvertir desde los pesos originales en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lapis17/zero-stt-hinglish-ggml | no disponible | no disponible | no disponible | other (origen: openrail) | HuggingFace, formato GGML |
| shunyalabs/zero-stt-hinglish | no disponible | no disponible | hindi, ingles, Hinglish | openrail | HuggingFace, safetensors |
| openai/whisper-large-v3 | 1550 M aprox. | ventana de 30 s por segmento | multilingue (amplia cobertura) | Apache-2.0 | HuggingFace, safetensors, GGUF y GGML de terceros |
| ai4bharat/indicwhisper | no disponible | no disponible | lenguas indicas | no disponible en la informacion recuperada | HuggingFace |

La comparacion cuantitativa de calidad (WER/CER) no puede realizarse porque no se han publicado metricas para el modelo de Lapis17 ni para el modelo de origen en la informacion disponible. La diferencia practica mas relevante frente a `openai/whisper-large-v3` es la especializacion en code-switching hindi-ingles y el formato de publicacion (GGML legacy frente a safetensors con amplio soporte de herramientas).

## Limitaciones y advertencias

- Artefacto de conversion, no modelo original: el repositorio contiene un binario generado con un script legacy de whisper.cpp. El propio autor pide verificar la compatibilidad con whisper.cpp v1.8.4 y con la build de AMD prevista antes de usarlo.
- Riesgo de incompatibilidad de formato: el GGML legacy puede no cargar en versiones actuales de whisper.cpp o de otras herramientas que esperan GGUF. La alternativa segura es reconvertir desde los pesos originales.
- Licencia ambigua: este repositorio declara `license: other`, mientras que los metadatos de la model card del modelo de origen figuran como `openrail`. Antes de cualquier uso comercial es imprescindible consultar la licencia efectiva del modelo de origen, no la del artefacto convertido.
- Idiomas no declarados: el repositorio no lista idiomas soportados. El soporte de hindi, ingles y Hinglish se infiere del modelo de origen, no de este artefacto.
- Sin metricas de calidad: no hay WER ni CER publicados, ni para el modelo de origen ni para la conversion, por lo que no se puede estimar la degradacion introducida por la cuantizacion.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica ausencia de validacion independiente.
- Alucinacion en ASR: los modelos tipo Whisper son propensos a generar texto plausible en tramos de silencio, ruido o audio fuera de dominio, especialmente cuando el audio no esta en los idiomas de entrenamiento.
- Sesgos: no documentados. Al estar orientado a un unico par de lenguas y a un registro conversacional indio, es esperable un rendimiento pobre fuera de ese dominio (acentos no indios, habla con ruido, otras lenguas).
- Sin soporte de herramientas ni agentes: es un modelo ASR; no debe utilizarse como base para tareas de generacion de texto, razonamiento o function calling.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/Lapis17/zero-stt-hinglish-ggml
- Modelo de origen: https://huggingface.co/shunyalabs/zero-stt-hinglish
- Model card del modelo de origen (README): https://huggingface.co/shunyalabs/zero-stt-hinglish/blame/main/README.md
- Visor de terceros con la ficha tecnica del modelo de origen: https://hfviewer.com/shunyalabs/zero-stt-hinglish
- Sitio del desarrollador del modelo de origen: https://shunyalabs.ai
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
- Listado de modelos gratuitos y de codigo abierto (referencia general): https://lmmarketcap.com/free-ai-models
