# KonradDallaOrg/dimmy-parakeet-tdt-0.6b-v3-onnx

## Resumen

dimmy-parakeet-tdt-0.6b-v3-onnx es un espejo sin modificaciones de los ficheros ONNX del modelo de reconocimiento automatico del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, publicado por el usuario KonradDallaOrg para que la aplicacion Dimmy no dependa de que los repositorios upstream permanezcan disponibles. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son byte a byte identicos a la conversion ONNX realizada por istupakov en el repositorio istupakov/parakeet-tdt-0.6b-v3-onnx, en la revision 8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce.

El modelo subyacente, nvidia/parakeet-tdt-0.6b-v3, es un sistema ASR de aproximadamente 0,6 mil millones de parametros basado en la arquitectura TDT (Token-and-Duration Transducer), que combina un encoder y un decoder-joint para producir transcripciones con marcas de tiempo a nivel de palabra. Su proposito es la transcripcion de voz a texto local en Windows y Linux, sin dependencia de servicios en la nube.

La relevancia de este repositorio es practica: ofrece un paquete ONNX autocontenido (encoder, decoder-joint, extractor de features nemo128 y vocabulario) de 2,5 GB que puede ejecutarse con ONNX Runtime en entornos de escritorio. La licencia del modelo original es CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), exportada a ONNX (encoder + decoder_joint) |
| Parametros totales | aproximadamente 0,6 mil millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros publicados son ONNX en el formato de la conversion upstream; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.onnx + encoder-model.onnx.data, decoder_joint-model.onnx, nemo128.onnx, vocab.txt) |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA, una variante de RNN-Transducer en la que el predictor conjunto emite simultaneamente tokens y duraciones, lo que permite un alineamiento mas eficiente y marcas de tiempo. La exportacion ONNX separa el grafo en un encoder (encoder-model.onnx con sus pesos externos en encoder-model.onnx.data, 2.435.420.160 bytes) y un decoder-joint (decoder_joint-model.onnx, 72.520.893 bytes), mas un extractor de caracteristicas Mel (nemo128.onnx, 139.764 bytes) y el vocabulario (vocab.txt, 93.939 bytes).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o ajuste supervisado adicional. La model card del espejo no incluye detalles de entrenamiento; toda la informacion tecnica disponible se limita a la conversion de formato, realizada por istupakov, que no altera los pesos.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) local en Windows y Linux.
- Generacion de marcas de tiempo a nivel de palabra (word timestamps), segun la model card.
- Ejecucion en local mediante ONNX Runtime, sin llamadas a servicios externos.
- Inferencia sobre audio preprocesado con el extractor Mel incluido (nemo128.onnx).
- No se documentan capacidades de traduccion, diarizacion, tool calling, agentes ni multimodalidad mas alla del audio de entrada.

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede procesar audio de reuniones y devolver texto con marcas de tiempo por palabra, lo que facilita la generacion de actas y la busqueda dentro de la grabacion sin enviar datos a la nube.
- Subtitulado de video: las marcas de tiempo a nivel de palabra permiten construir ficheros de subtitulos alineados con el audio en herramientas de escritorio.
- Dictado por voz en aplicaciones de escritorio: integracion en editores o IDE mediante ONNX Runtime para convertir voz en texto en tiempo real en Windows y Linux.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un archivo de grabaciones para habilitar busqueda full-text sobre el contenido hablado.
- Asistentes de accesibilidad: conversion de voz a texto para usuarios con dificultades motoras o auditivas en entornos sin conectividad.
- Procesamiento de audio confidencial: al ejecutarse en local, es adecuado para entornos sanitarios, legales o industriales donde el audio no puede salir del dispositivo.
- Empaquetado en aplicaciones de terceros: al ser un espejo estable con hashes SHA-256 publicados, sirve como dependencia fija para aplicaciones que distribuyen el modelo junto con su binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 2,5 GB y el fichero de pesos del encoder es de 2,44 GB, por lo que se requiere al menos ese orden de memoria para cargar el modelo en precision nativa.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de los pesos sugiere que podria caber en GPUs con 4-8 GB de memoria, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dimmy-parakeet-tdt-0.6b-v3-onnx | aproximadamente 0,6 B | no disponible | ONNX | CC-BY-4.0 | Espejo del modelo de NVIDIA; conversion de istupakov |
| nvidia/parakeet-tdt-0.6b-v3 | aproximadamente 0,6 B | no disponible | NeMo (formato original) | CC-BY-4.0 | Modelo upstream de NVIDIA |
| istupakov/parakeet-tdt-0.6b-v3-onnx | aproximadamente 0,6 B | no disponible | ONNX | CC-BY-4.0 | Conversion ONNX original; misma revision que el espejo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por el autor del repositorio; cualquier mejora o correccion debe provenir de NVIDIA o de istupakov.
- No se documentan los idiomas soportados; no debe asumirse cobertura multilingue sin verificacion contra el modelo base.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o errores por acento y ruido ambiental.
- La licencia CC-BY-4.0 exige atribucion a NVIDIA y a istupakov por la conversion; el uso comercial esta permitido con esa condicion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Al ser un espejo de una revision concreta, no recibira actualizaciones automaticas del modelo upstream.
- No se documentan requisitos minimos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Repositorio del espejo: https://huggingface.co/KonradDallaOrg/dimmy-parakeet-tdt-0.6b-v3-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion ONNX upstream: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Revision concreta de la conversion: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx/tree/8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
