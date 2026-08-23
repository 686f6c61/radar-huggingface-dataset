# loliew/umarvc

## Resumen

El modelo loliew/umarvc es un conjunto de modelos de conversion de voz basados en RVC (Retrieval-based Voice Conversion) desarrollado por el usuario loliew. Su funcion es convertir audio de entrada para que suene como la voz de los personajes de la franquicia japonesa Umamusume: Pretty Derby. El repositorio contiene varios modelos, uno por personaje, entrenados con el dataset TLME/Umamusume-voice-transcription, que incluye transcripciones de las voces de los personajes.

Cada modelo se entreno con 100 epocas y un batch size de 12, con un promedio de 40 pasos por epoca. Los datos de entrenamiento por personaje oscilan entre 10 y 20 minutos de audio. Segun el changelog del repositorio, algunos modelos fueron regenerados anadiendo las canciones de los personajes al dataset para mejorar la calidad de la conversion. El repositorio ocupa 21.6 GB en disco, lo que refleja la inclusion de multiples modelos de personajes.

El modelo se integra en el ecosistema de RVC WebUI, la herramienta de referencia para la conversion de voz en tiempo real y por lotes. Se distribuye bajo licencia MIT, lo que permite su uso comercial y modificacion, aunque las voces de los personajes pueden tener restricciones de propiedad intelectual adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | RVC (archivo de pesos del proyecto RVC) |

## Arquitectura y entrenamiento

El modelo se basa en RVC, un proyecto open source de conversion de voz que utiliza un mecanismo de recuperacion de caracteristicas para transferir el timbre de una voz de referencia a la
