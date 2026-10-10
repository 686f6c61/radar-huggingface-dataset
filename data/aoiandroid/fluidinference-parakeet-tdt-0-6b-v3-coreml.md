# aoiandroid/FluidInference-parakeet-tdt-0.6b-v3-coreml

## Resumen

Este repositorio no es un modelo entrenado por su autor, sino un espejo sin modificaciones (mirror) del modelo `FluidInference/parakeet-tdt-0.6b-v3-coreml`, publicado por el usuario aoiandroid para que la aplicacion Cription no dependa de un repositorio de terceros. El contenido corresponde integramente al commit `7dd20fe6b1797d35f5e3307e8b1732d9a178edfe` del repositorio original: 86 archivos, 3586,1 MB, con tamanos y hashes SHA-256 identicos a la fuente. La model card del espejo no describe el modelo en si; unicamente documenta la operacion de copia y conserva la model card original como `SOURCE_README.md`.

Por el identificador se deduce que se trata de una conversion a CoreML del modelo Parakeet TDT 0.6B v3, un sistema de reconocimiento automatico del habla (ASR) de la familia Parakeet con decodificador TDT (token-and-duration transducer) y aproximadamente 600 millones de parametros. El formato CoreML indica que esta pensado para ejecucion en el ecosistema Apple (Apple Neural Engine y GPU/Metal), no para servidores con GPU NVIDIA.

Es relevante ahora porque permite desplegar un modelo ASR de tamano medio en dispositivos Apple sin conexion a internet, algo poco habitual en modelos de esta familia, que suelen distribuirse en formato NeMo o safetensors para CUDA. La contrapartida es que la informacion publicada es minima: el espejo no aporta idiomas, contexto, benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; el identificador indica decodificador TDT (token-and-duration transducer) de la familia Parakeet |
| Parametros totales | 0,6 mil millones (0.6B), segun el nombre del modelo; no confirmado en la model card |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio contiene 86 archivos por un total de 3586,1 MB (2,5 GB segun los metadatos de HuggingFace) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | CoreML (conversion para el ecosistema Apple); el repositorio no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card del espejo no contiene informacion sobre arquitectura, datos de entrenamiento ni proceso de ajuste. Lo unico verificable es que se trata de una conversion a CoreML: el sufijo `coreml` del identificador y la estructura de 86 archivos son coherentes con un paquete `.mlmodelc` acompanado de sus pesos y metadatos. El nombre `parakeet-tdt-0.6b-v3` sugiere un modelo de la familia Parakeet con decodificador TDT y unos 600 millones de parametros, pero el repositorio no documenta numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO (en ASR no son habituales).

Al ser un espejo byte a byte, cualquier innovacion tecnica del modelo original (atencion, convoluciones, esquema de decodificacion) queda fuera del alcance de esta ficha, porque la fuente no la describe. Para obtener esos datos habria que consultar el repositorio original y la documentacion del autor del modelo base, no incluida en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto): es la funcion principal deducible del identificador del modelo.
- Ejecucion local en dispositivos Apple mediante CoreML y Apple Neural Engine, sin necesidad de GPU dedicada ni de conexion de red.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; no es un modelo de lenguaje generativo de proposito general.
- Capacidades multilingues: no disponibles; la model card no declara lista de idiomas.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.
- Generacion de texto, codigo o matematicas: no aplicable a un modelo ASR.

## Casos de uso

- Dictado por voz en aplicaciones iOS y macOS: el modelo puede integrarse mediante CoreML en una app nativa para transcribir voz a texto en el propio dispositivo, sin enviar audio a servidores externos, lo que simplifica el cumplimiento de normativa de privacidad.
- Subtitulado automatico de video en local: util para editores que necesitan generar subtitulos sin subir material confidencial a la nube y sin coste por minuto de API.
- Transcripcion de reuniones con requisitos de confidencialidad: al ejecutarse en el dispositivo, el audio no abandona el equipo, adecuado para entornos legales, sanitarios o de defensa.
- Preprocesado de voz para pipelines de LLM: convertir audio en texto antes de pasarlo a un modelo de lenguaje que resuma, clasifique o extraiga acciones, especialmente en flujos donde el ASR debe ser rapido y barato.
- Analitica de llamadas de atencion al cliente: transcripcion por lotes de grabaciones para alimentar analisis de sentimiento o deteccion de motivos de contacto, siempre que la licencia y la normativa aplicable lo permitan.
- Accesibilidad: conversion de voz a texto en tiempo real para personas con dificultades auditivas, integrada en aplicaciones de Apple mediante la API de CoreML.
- Automatizacion de notas de voz: transcripcion de mensajes de audio en aplicaciones de mensajeria o productividad, ejecutada en el dispositivo para reducir latencia y coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye WER, MMLU, HumanEval ni ninguna otra metrica, y tampoco se han encontrado datos en la busqueda web realizada.

## Requisitos de hardware

- El formato de pesos es CoreML, por lo que el destino natural son dispositivos Apple: iPhone, iPad y Mac con Apple Silicon (serie M) o el Neural Engine de los chips A.
- VRAM estimada: no disponible. Como referencia aritmetica, 0,6 mil millones de parametros en precision de 16 bits equivalen a unos 1,2 GB de pesos, pero el repositorio ocupa 3586,1 MB, lo que sugiere varias variantes o precisiones empaquetadas; la cifra real de memoria en ejecucion no esta documentada.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta empaquetado para Apple Neural Engine, no para CUDA. No hay soporte indicado para A100, H100 o RTX 4090.
- Cabe en hardware de consumo Apple (iPhone y Mac recientes) siempre que el dispositivo disponga de Neural Engine y memoria libre suficiente; no hay requisitos oficiales publicados.
- Opciones de despliegue: CoreML y las herramientas de conversion de Apple (coremltools). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato y estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de la columna de este repositorio proceden del identificador y de la model card del espejo. Los del resto de modelos son conocimiento publico general, no verificado en la informacion proporcionada, y deben confirmarse antes de tomar decisiones.

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (este espejo, CoreML) | 0,6 B (segun nombre) | CoreML | cc-by-4.0 | Conversion para Apple; sin datos de idiomas, contexto ni benchmarks en la ficha |
| Whisper large-v3 | 1,55 B | safetensors, GGUF, CoreML (conversiones de terceros) | MIT | Modelo ASR multilingue ampliamente extendido; ventanas de audio de 30 s |
| Whisper small | 244 M | safetensors, GGUF | MIT | Alternativa ligera para transcripcion en dispositivos con menos memoria |
| distil-whisper-large-v3 | 756 M | safetensors | MIT | Destilado de Whisper large-v3, orientado a menor latencia en ingles |

No se dispone de datos de rendimiento comparativo (WER) para el modelo de esta ficha, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: el mantenimiento, las actualizaciones y el soporte dependen del repositorio original; este espejo queda congelado en el commit `7dd20fe6b1797d35f5e3307e8b1732d9a178edfe`.
- El repositorio tiene 0 descargas y 0 likes, y las fechas de creacion y actualizacion (10 de octubre de 2026) son posteriores a la fecha actual, lo que apunta a metadatos anomalos o manipulados; conviene verificarlo antes de usarlo en produccion.
- La model card no documenta idiomas, contexto, cuantizaciones, arquitectura ni datos de entrenamiento. No se puede evaluar su idoneidad para un idioma concreto sin consultar la fuente original.
- Riesgo de alucinacion: en modelos ASR esto se manifiesta como transcripciones inventadas en segmentos con silencio, ruido o audio ininteligible. No hay documentacion sobre este comportamiento en la informacion disponible.
- Restricciones de licencia: cc-by-4.0 permite uso comercial, pero exige atribucion al autor original y la indicacion de cambios. El espejo conserva los derechos y el credito del autor original.
- Solo es utilizable en el ecosistema Apple; no hay indicios de soporte para CUDA, ROCm ni despliegue en servidores Linux con GPU.
- No es un modelo de lenguaje: no genera texto libre, no hace razonamiento ni codigo, asi que no puede sustituir a un LLM en pipelines conversacionales.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; la informacion de terceros disponible es practicamente nula.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/aoiandroid/FluidInference-parakeet-tdt-0.6b-v3-coreml
- Repositorio original: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Commit de origen: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml/tree/7dd20fe6b1797d35f5e3307e8b1732d9a178edfe
- Papers, blogs, repositorios o demos adicionales: no disponibles; la busqueda web no devolvio resultados relevantes para este modelo.
