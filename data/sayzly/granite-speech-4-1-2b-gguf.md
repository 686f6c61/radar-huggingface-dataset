# sayzly/granite-speech-4.1-2b-gguf

## Resumen

Granite Speech 4.1 2B (GGUF) es una cuantización en formato GGUF del modelo multimodal de voz de IBM, `ibm-granite/granite-speech-4.1-2b`, publicada por el usuario `sayzly`. El modelo original es un sistema de reconocimiento automático del habla (ASR) y comprensión de audio que combina un encoder de audio con un modelo de lenguaje de la familia Granite de IBM, lo que le permite transcribir voz y responder preguntas sobre el contenido hablado. Esta versión GGUF facilita su despliegue en entornos con `llama.cpp` u otras herramientas compatibles, sin necesidad de infraestructura de GPU de datacenter.

El modelo cuenta con aproximadamente 2.313 millones de parámetros (2,3 B) y una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está etiquetado como `conversational` y `automatic-speech-recognition`, lo que sugiere que puede emplearse tanto para transcripción pura como para interacción conversacional basada en audio. La relevancia actual radica en la creciente demanda de modelos de voz ligeros y desplegables localmente, que permitan construir asistentes y pipelines de transcripción sin depender de APIs externas.

Sin embargo, la información proporcionada es escasa: la model card del repositorio GGUF es mínima y no incluye detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados. Esta ficha se limita a los datos disponibles y marca explícitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de voz: encoder de audio + LLM, segun la familia Granite Speech de IBM) |
| Parametros totales | 2.313.228.092 (~2,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unico fichero mencionado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. Por la naturaleza del modelo base (`ibm-granite/granite-speech-4.1-2b`) y su pipeline `automatic-speech-recognition`, se trata de un modelo multimodal que combina un encoder de audio con un modelo de lenguaje de la familia Granite de IBM, disenado para transcribir y comprender voz. El repositorio GGUF es una conversion del modelo original, no un reentrenamiento.

Tampoco se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Cualquier afirmacion al respecto seria especulativa y no se incluye en esta ficha.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, segun el pipeline declarado.
- Procesamiento conversacional: la etiqueta `conversational` sugiere capacidad de mantener intercambios multi-turno basados en audio.
- Comprension de audio: al ser un modelo de voz de la familia Granite Speech, se espera que pueda responder preguntas sobre el contenido de una grabacion, aunque no se detalla en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (vision, audio, thinking mode): audio si (entrada de voz); vision y thinking mode no disponibles.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en texto para actas o resumenes, gracias a su pipeline ASR y a su tamano contenido que permite ejecucion local.
- Subtitulado automatico de videos: integrado en un pipeline de `llama.cpp` o similar, puede generar subtitulos a partir de pistas de audio sin depender de servicios en la nube.
- Asistentes de voz para aplicaciones de escritorio: su formato GGUF y sus 2,3 B de parametros permiten desplegarlo en equipos de desarrollo, habilitando interaccion por voz en herramientas locales.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en entornos donde no se permite enviar datos a terceros.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones telefonicas para su posterior analisis de calidad o deteccion de temas, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Investigacion en procesamiento de voz: servir como base ligera para experimentos de ASR y comprension de audio en entornos academicos con recursos limitados, al poder ejecutarse en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q8_0 ocupa aproximadamente 2,6 GB (tamano del repo), por lo que se necesita al menos esa cantidad de memoria, mas overhead del runtime. Con cuantizaciones menores (Q4, Q5) el requisito bajaria, aunque no se listan en la informacion disponible.
- GPU recomendadas: no disponible. Por el tamano, cabria esperar que funcione en GPUs de consumo como RTX 3060 (12 GB) o superiores, pero no se confirma en la informacion.
- Cabe en consumer GPU: probablemente si, dado el tamano del fichero (~2,6 GB), aunque no se especifica oficialmente.
- Opciones de despliegue: `llama.cpp` y herramientas compatibles con GGUF (Ollama, LM Studio, etc.). No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa para este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada. Se indica "no disponible" para una comparativa rigurosa. Como referencia cualitativa, podria compararse con otros modelos ASR ligeros de la familia Whisper (OpenAI) o con el propio modelo base `ibm-granite/granite-speech-4.1-2b` en safetensors, pero no se aportan numeros que permitan una tabla fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Granite Speech 4.1 2B GGUF (este) | ~2,3 B | no disponible | Apache 2.0 | GGUF |
| ibm-granite/granite-speech-4.1-2b (base) | ~2,3 B | no disponible | Apache 2.0 | safetensors |
| Alternativas ASR ligeras | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card del repositorio GGUF es minima y no documenta sesgos, idiomas ni limitaciones, por lo que no se puede evaluar su comportamiento en dominios especificos.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar texto plausible pero incorrecto en la transcripcion o en respuestas sobre el audio, especialmente con ruido de fondo o acentos no representados en el entrenamiento.
- Limitaciones de contexto o idioma: no se especifican; se desconoce la ventana de contexto y la cobertura linguistica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y las condiciones de la conversion.
- Es una conversion no oficial: el autor `sayzly` no es IBM, por lo que la calidad de la cuantizacion GGUF no esta avalada por los autores originales.
- Para produccion, conviene validar el modelo en el dominio concreto y comparar con el modelo base en safetensors antes de adoptar la version GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/granite-speech-4.1-2b-gguf
- Modelo base original: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
