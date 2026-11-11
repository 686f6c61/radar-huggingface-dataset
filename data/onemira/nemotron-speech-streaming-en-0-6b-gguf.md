# onemira/nemotron-speech-streaming-en-0.6b-gguf

## Resumen

`onemira/nemotron-speech-streaming-en-0.6b-gguf` es un espejo (mirror) en formato GGUF del modelo de reconocimiento automatico del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b`, desarrollado originalmente por NVIDIA. El repositorio lo mantiene el proyecto OneMira como artefacto de inferencia para su grabadora de voz con IA local (OneMira C1) y su sistema de contexto MCP. El modelo resuelve transcripcion de voz en streaming en ingles, con un tamano de 628.356.737 parametros (aproximadamente 0,6 mil millones) y un unico fichero cuantizado Q8_0 de 699.872.960 bytes.

La relevancia de esta publicacion no esta en el modelo en si, sino en su empaquetado: se trata de un artefacto byte a byte identico al GGUF Q8 oficial de NVIDIA, con hash SHA-256 verificado (`d9a01898d2a611c8764e23a1c2f45e70bbd5a425dc4de93692ac951dd603812d`), pensado para ejecutarse en dispositivos locales mediante el runtime NeMo-Speech.cpp. Esto permite desplegar ASR en streaming sin dependencia de la nube y sin coste por minuto de transcripcion.

El repositorio no contiene el checkpoint completo de entrenamiento, sino unicamente el fichero GGUF seleccionado. La autoria del modelo pertenece a NVIDIA y el espejo no implica respaldo de NVIDIA hacia OneMira. La licencia aplicable es la NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de streaming de NVIDIA; detalles no incluidos en la informacion proporcionada) |
| Parametros totales | 628.356.737 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | ingles (sufijo `-en` en el identificador; no se detalla lista adicional) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | GGUF (`nemotron-speech-streaming-en-0.6b.q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El identificador y la etiqueta de pipeline (`automatic-speech-recognition`) indican que se trata de un modelo ASR orientado a streaming, es decir, disenado para transcribir audio de forma incremental a medida que llega la senal, en lugar de requerir el audio completo antes de emitir la transcripcion. El tamano de 0,6 mil millones de parametros lo situa en la categoria de modelos ligeros aptos para ejecucion local.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del corpus, idiomas de origen) ni si hubo etapas de ajuste fino con RLHF o DPO, algo por otra parte poco habitual en modelos ASR. La unica informacion tecnica verificable es el proceso de cuantizacion a Q8_0 y la revision upstream concreta (`ebe59e5a817142986528bbbee5dba8db7b38ed50`) desde la que se genero el artefacto. El runtime de inferencia indicado por el autor es NeMo-Speech.cpp.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles.
- Transcripcion en streaming: procesa audio de forma continua, adecuado para captura en tiempo real.
- Ejecucion on-device: el formato GGUF y el runtime NeMo-Speech.cpp permiten inferencia local sin servicios en la nube.
- Integracion con sistemas de diarizacion: la model card menciona el uso conjunto con modelos de diarizacion local para separar hablantes (la diarizacion no la realiza este modelo por si solo).
- Integracion con asistentes y herramientas via MCP: el ecosistema del autor expone la transcripcion a Claude Desktop, Cursor y ChatGPT mediante un servidor MCP.
- Soporte de tool calling / function calling: no disponible para este modelo (es un modelo ASR, no un LLM generativo).
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingues: limitadas al ingles segun el identificador del modelo; no se documenta soporte adicional.
- Vision, audio generativo, thinking mode: no disponibles.

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede alimentar una pipeline de captura de audio continua y generar transcripciones sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o confidencialidad.
- Grabadoras de voz con IA: es el caso de uso declarado por el autor; el modelo se integra en hardware dedicado (OneMira C1) para transcribir y resumir posteriormente con IA local.
- Subtitulado en tiempo real: su naturaleza de streaming permite generar subtitulos incrementales en aplicaciones de video, clases o retransmisiones en ingles.
- Notas de voz y actas automaticas: transcripcion de llamadas y conversaciones para extraer resumenes, decisiones y elementos de accion mediante un LLM conectado por MCP.
- Asistentes de accesibilidad: conversion de voz a texto en aplicaciones de apoyo a personas con discapacidad auditiva, ejecutandose en el propio dispositivo.
- Preprocesado de datasets de audio: generacion de transcripciones a gran escala en pipelines de investigacion, con la ventaja de no depender de APIs externas ni de cuotas por minuto.
- Integracion en herramientas de desarrollo: conexion a Claude Desktop o Cursor a traves del servidor MCP del autor para consultar transcripciones como contexto durante tareas de programacion o documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 699.872.960 bytes (aproximadamente 0,65 GiB); se requiere memoria suficiente para el fichero mas los buffers del runtime, por lo que cabe en GPUs consumer con 2 GB o mas de VRAM, y tambien en CPU.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es viable en GPUs de gama baja y media (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en GPUs de datacenter (A100, H100) si se busca maximizar throughput.
- Cabe en GPU consumer: si, dado el tamano del artefacto (menos de 1 GB en Q8_0).
- Opciones de despliegue: NeMo-Speech.cpp es el runtime indicado por el autor. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR; no genera texto libre, no razona y no soporta tool calling.
- Idioma limitado al ingles segun el identificador; no se documenta soporte multilingue.
- Es un espejo, no el repositorio oficial: la autoria y el mantenimiento del modelo corresponden a NVIDIA. Para produccion conviene referenciar el repositorio upstream `nvidia/nemotron-speech-streaming-en-0.6b`.
- El repositorio contiene unicamente el fichero GGUF Q8_0, no el checkpoint completo de entrenamiento; no es util para reentrenamiento o ajuste fino.
- Licencia NVIDIA Open Model License: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia open source estandar y puede imponer condiciones adicionales.
- Solo se publica una cuantizacion (Q8_0); no hay variantes Q4, Q5 o F16 en este repositorio, lo que limita el ajuste de memoria frente a calidad.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados, jerga tecnica o solapamiento de hablantes; la diarizacion requiere un modelo adicional.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que el rendimiento real debe validarse en el hardware objetivo.
- El contenido de la model card incluye material promocional del fabricante; debe tratarse como informacion comercial y no como especificacion tecnica verificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/nemotron-speech-streaming-en-0.6b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Revision upstream concreta: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/ebe59e5a817142986528bbbee5dba8db7b38ed50
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Servidor MCP de OneMira: https://github.com/onemira-space/onemira-mcp
- Producto OneMira C1: https://onemira.com/products/c1
- Comparativa de grabadoras: https://onemira.com/compare
- Dataset de benchmark abierto 2026: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Pagina del fabricante sobre grabadoras sin suscripcion: https://onemira.com/ai-voice-recorder-without-subscription
