# hepsan/kb-wav2vec2-svenska-q4

## Resumen

El modelo hepsan/kb-wav2vec2-svenska-q4 es una copia cuantizada en formato ONNX del modelo de reconocimiento automatico del habla (ASR) para sueco KBLab/wav2vec2-large-voxrex-swedish, desarrollado originalmente por KBLab (Kungliga biblioteket, la Biblioteca Nacional de Suecia). Se trata de un modelo basado en la arquitectura wav2vec2, con cabeza de clasificacion CTC, especializado en transcripcion de voz en sueco. La variante aqui descrita ha sido exportada a ONNX y cuantizada a 4 bits (q4) para poder ejecutarse directamente en el navegador mediante transformers.js, sin necesidad de backend ni de enviar audio a un servidor.

El problema que resuelve es concreto y acotado: el autor lo utiliza en Matte-Portalen (matteportalen.github.io), dentro del ejercicio "Hogfrekventa ord", para comprobar si una palabra sueca se pronuncia correctamente o no. Esto es, no se emplea como un sistema de dictado general, sino como un verificador de pronunciacion que corre integramente en el cliente. El modelo pesa aproximadamente 0,2 GB en el repositorio, lo que lo hace apto para distribucion web.

Su relevancia radica en el patron de despliegue: un modelo ASR de la familia "large" de wav2vec2, cuantizado y exportado a ONNX, consumido por transformers.js 4.3.1 con `AutoModelForCTC` y `dtype: "q4"`. Esto demuestra que tareas de reconocimiento de voz pueden resolverse en el navegador con privacidad total (el audio no sale del dispositivo) y sin infraestructura de inferencia dedicada. No se dispone de informacion sobre parametros exactos, datos de entrenamiento o resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional + transformer) con cabeza CTC |
| Parametros totales | no disponible (variante "large" del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | q4 (archivo `model_q4.onnx`) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (carpeta `onnx/`), compatible con transformers.js |
| Modelo base | KBLab/wav2vec2-large-voxrex-swedish |
| Tamano del repositorio | 0,2 GB |
| Libreria de inferencia | transformers.js 4.3.1 (`AutoModelForCTC`, `dtype: "q4"`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura wav2vec2 en su variante "large", un sistema de reconocimiento de voz auto-supervisado que combina un extractor de caracteristicas convolucional con un encoder transformer y una cabeza de clasificacion CTC (Connectionist Temporal Classification). En este caso concreto no se ha reentrenado el modelo: la ficha indica explicitamente que la copia se limita a reempaquetar pesos ya existentes. No se dispone de informacion sobre el numero de tokens o horas de audio utilizados en el entrenamiento original, ni sobre la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (poco habituales en tareas CTC puras).

La innovacion tecnica relevante no esta en el entrenamiento, sino en el proceso de compresion y despliegue. El modelo original, publicado por KBLab bajo licencia CC0 1.0, fue exportado a ONNX y cuantizado a 4 bits por FredrikKarlssonSpeech en el repositorio wav2vec2-large-voxrex-swedish-onnx (Apache-2.0). El archivo `model_q4.onnx` incluido en este repositorio es, segun la ficha del autor, identico al de dicha exportacion: no se ha modificado ni re-cuantizado. El resultado es un artefacto que puede cargarse y ejecutarse con ONNX Runtime Web desde el navegador, con `dtype: "q4"` como configuracion de precision.

## Capacidades

- Reconocimiento automatico del habla (ASR) en sueco mediante decodificacion CTC.
- Transcripcion de audio en streaming o por fragmentos directamente en el navegador.
- Verificacion de pronunciacion de palabras concretas, uso para el que fue adoptado en Matte-Portalen.
- Ejecucion totalmente local en el cliente: el audio no se envia a ningun servidor.
- Integracion con la API de transformers.js 4.3.1 mediante `AutoModelForCTC`.
- No se ha documentado soporte de tool calling, function calling, capacidades de agente, vision, audio de salida ni modo de razonamiento explicito; no aplican a un modelo CTC de ASR.
- Capacidad multilingue: no, el modelo esta entrenado y etiquetado unicamente para sueco (sv).

## Casos de uso

- Verificacion de pronunciacion en aplicaciones educativas: el modelo compara la transcripcion del habla del alumno con la palabra esperada, tal y como se hace en el ejercicio "Hogfrekventa ord" de Matte-Portalen. Es adecuado porque la decodificacion CTC devuelve secuencias de caracteres que pueden compararse directamente.
- Reconocimiento de voz en el navegador con privacidad estricta: al ejecutarse con transformers.js sobre ONNX, ningún fotograma de audio abandona el dispositivo, lo que lo hace util para aplicaciones con requisitos de RGPD o para entornos sin conectividad.
- Dictado de notas breves en sueco en aplicaciones web: permite transcribir fragmentos cortos de voz en campos de formulario o editores sin depender de APIs externas de ASR.
- Asistentes de aprendizaje de idiomas: como verificador de si el usuario ha pronunciado correctamente una palabra o frase sueca, con retroalimentacion inmediata en el cliente.
- Prototipado y demos sin backend: al pesar 0,2 GB y correr en el navegador, es adecuado para prototipos de ASR que deben desplegarse como sitio estatico (por ejemplo, en GitHub Pages).
- Accesibilidad en formularios o interfaces web en sueco: conversion de voz a texto en entradas de texto para usuarios con dificultades de tecleo, siempre que el idioma de interaccion sea sueco.
- Preprocesamiento de audio en pipelines ligeros: uso como primera etapa de transcripcion en entornos con recursos limitados, aceptando el coste de precision asociado a la cuantizacion q4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo cuantizado a q4 y distribuido en un repositorio de 0,2 GB, esta pensado para ejecutarse en el navegador del usuario final, no en un servidor de inferencia.
- Inferencia sobre CPU mediante ONNX Runtime Web (backend WASM) o sobre GPU mediante WebGPU si el navegador lo soporta.
- No requiere GPU dedicada: cualquier equipo de consumo capaz de ejecutar un navegador moderno puede cargarlo.
- VRAM estimada para inferencia en servidor: no disponible; el artefacto principal es la version ONNX q4 de aproximadamente 0,2 GB en disco.
- Opciones de despliegue documentadas: transformers.js 4.3.1 con `AutoModelForCTC` y `dtype: "q4"`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo CTC de audio en este formato.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|
| hepsan/kb-wav2vec2-svenska-q4 | wav2vec2 large + CTC | ONNX | q4 | Apache-2.0 | Navegador (transformers.js) |
| KBLab/wav2vec2-large-voxrex-swedish | wav2vec2 large + CTC | safetensors (formato original) | sin cuantizar | CC0 1.0 | Inferencia en servidor |
| FredrikKarlssonSpeech/wav2vec2-large-voxrex-swedish-onnx | wav2vec2 large + CTC | ONNX | q4 (entre otras) | Apache-2.0 | Exportacion ONNX reutilizable |

Las tres entradas comparten arquitectura y origen: la primera es una copia de la tercera, que a su vez exporta a ONNX la segunda. No se dispone de datos de rendimiento comparativo entre ellas ni con otros modelos suecos de ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Cubre unicamente el sueco; no se ha validado para otros idiomas y la etiqueta de idioma del repositorio es exclusivamente "sv".
- La cuantizacion a 4 bits puede degradar la precision de transcripcion respecto al modelo original sin cuantizar; no se han publicado metricas (WER) que cuantifiquen esa perdida.
- Riesgo de alucinacion y de transcripciones erroneas inherente a los modelos CTC, especialmente con audio ruidoso, acentos no representados en el entrenamiento o vocabulario poco frecuente.
- El modelo no esta disenado para transcripcion general de habla larga ni como sistema de dictado de produccion; su uso declarado es la verificacion de palabras concretas.
- Esta pensado para ejecucion en navegador, por lo que el rendimiento depende de las capacidades del dispositivo del usuario (WASM o WebGPU) y no de una infraestructura controlada.
- No se dispone de informacion sobre sesgos especificos del modelo base ni sobre la representatividad de sus datos de entrenamiento.
- Licencia Apache-2.0 en esta copia y en la exportacion ONNX; el modelo base original se publica bajo CC0 1.0. Conviene verificar las condiciones de cada eslabon de la cadena antes de un uso comercial.
- El repositorio registra 0 descargas y 0 "likes" en la informacion disponible, por lo que no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hepsan/kb-wav2vec2-svenska-q4
- Modelo base: https://huggingface.co/KBLab/wav2vec2-large-voxrex-swedish
- Exportacion ONNX y cuantizacion de origen: https://huggingface.co/FredrikKarlssonSpeech/wav2vec2-large-voxrex-swedish-onnx
- Proyecto Matte-Portalen: https://matteportalen.github.io
