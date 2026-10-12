# onnx-community/zero-stt-hinglish-ONNX

## Resumen

zero-stt-hinglish (ONNX) es la version convertida a formato ONNX del modelo de reconocimiento automatico de voz shunyalabs/zero-stt-hinglish, desarrollado por Shunya Labs. Se trata de un sistema de speech-to-text especializado en Hinglish, es decir, habla conversacional hindi con inserciones de ingles (code-switching). El modelo parte de OpenAI Whisper Medium como base y ha sido reentrenado (post-training) por Shunya Labs sobre datos especificos de habla code-switched, con el objetivo de transcribir de forma nativa turnos que alternan hindi e ingles en una misma frase.

La motivacion es concreta: los modelos ASR tradicionales tratan hindi e ingles como idiomas separados, lo que provoca errores cuando el hablante cambia de lengua a mitad de oracion, situacion que segun el autor ocurre en aproximadamente 2 de cada 10 palabras en hindi conversacional. Este modelo evita la deteccion de idioma en tiempo de inferencia, lo que reduce latencia y mejora la precision en habla real.

El repositorio onnx-community/zero-stt-hinglish-ONNX es una conversion automatica subida por la comunidad ONNX a traves de su espacio de conversion, pensada para ejecutarse con Transformers.js en entornos JavaScript. La arquitectura subyacente es la de Whisper Medium (transformer encoder-decoder), los idiomas declarados son hi y en, y la licencia es OpenRAIL. El repositorio ocupa 19,9 GB, lo que sugiere varias variantes de precision exportadas en ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basada en OpenAI Whisper Medium) |
| Parametros totales | no disponible en la informacion (Whisper Medium ~769 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (repo ONNX de 19,9 GB, presumiblemente varias precisiones) |
| Idiomas soportados | hi, en (Hinglish, code-switching hindi-ingles) |
| Licencia | openrail |
| Formato de pesos | ONNX (libreria transformers.js) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de OpenAI Whisper Medium: un transformer encoder-decoder disenado para tareas de reconocimiento de voz, con entrada de audio muestreada y procesada en ventanas de 30 segundos y salida de tokens de texto. La version publicada en este repositorio es una conversion a ONNX generada automaticamente mediante el espacio de conversion de la comunidad onnx-community, orientada a su uso con Transformers.js en navegador o entornos Node.js.

En cuanto al entrenamiento, Shunya Labs realizo un post-training sobre Whisper Medium partiendo de datos de Google Vaani y de datasets propios. La model card cita como datasets los repositorios ARTPARK-IISc/Vaani, ai4bharat/Kathbath y ai4bharat/Shrutilipi. La innovacion declarada es el tratamiento nativo del code-switching: en lugar de forzar la transcripcion a un solo idioma, el modelo genera tokens en escritura mixta (devanagari y latino) tal como aparecen en el habla, y elimina el coste de deteccion de idioma en inferencia. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automatico de voz (speech-to-text) para audio en hindi, ingles y Hinglish.
- Transcripcion de code-switching intra-oracional, generando tokens en escritura mixta devanagari-latina (por ejemplo, "Rome में अलग अलग जगों पर कई बढ़े television screens लगाए गये").
- Manejo de cambios de idioma a mitad de frase sin necesidad de deteccion de idioma previa.
- Inferencia mas rapida que modelos que requieren deteccion de idioma, segun el autor.
- Ejecucion en el ecosistema Transformers.js (pipeline automatic-speech-recognition) para despliegues JavaScript.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada mas alla de ASR, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de conversaciones, podcasts y videos en Hinglish: el modelo reconoce de forma nativa las alternancias hindi-ingles, lo que evita forzar una transliteracion incorrecta en contenido donde los hablantes mezclan idiomas de forma natural.
- Atencion al cliente para usuarios indios: permite transcribir llamadas o chats de voz donde el cliente alterna hindi e ingles, alimentando sistemas de analitica o agentes conversacionales con texto fiel.
- Transcripcion de reuniones en entornos laborales indios: util para generar actas o resumenes de reuniones donde los participantes cambian de idioma segun el tema tecnico o informal.
- Creacion de contenido y subtitulado: generacion de subtitulos para plataformas que distribuyen contenido en Hinglish, manteniendo los terminos en ingles tal como se pronuncian.
- Despliegue en navegador o edge con Transformers.js: al distribuirse en formato ONNX, puede ejecutarse en entornos JavaScript sin depender de un backend Python, util para aplicaciones web de dictado o accesibilidad.
- Investigacion en ASR multilingue: sirve como referencia para estudiar tecnicas de post-training sobre Whisper aplicadas a code-switching en lenguas indicas.
- Preprocesado de pipelines de analitica de voz: conversion de audio a texto mixto para posteriores tareas de NLP (clasificacion, busqueda, resumen) en corpus Hinglish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (WER, MMLU, etc.) en la informacion disponible. La model card incluye una comparacion cualitativa de transcripcion frente a Whisper Medium:

| Muestra de audio | Zero STT Codeswitch | Whisper Medium |
|---|---|---|
| FLEURS_sample.wav | "Rome में अलग अलग जगों पर कई बढ़े television screens लगाए गये ग ताकि लोग समारो देख सकें" | "रोम में अलग अलग जगहों पर कई बड़े टेलिवीजन स्क्रीन लगाए गए ताकि लोग स्मारो देख सकें" |
| Vaani_random_sample_06.wav | "और बागल में एक building है लाल कलर का पिंट किया हुआ" | "और बगल में एक बिल्डिंग है लाल कलर का पेंट किया हुआ है" |
| Vaani_random_sample_10.wav | "yoga med पर yoga कर रहे हैं" | "योगा मैट पर योगा कर रहे हैं" |

La diferencia principal es que Zero STT conserva los terminos en ingles y el code-switching tal cual, mientras Whisper Medium tiende a transliterar todo al devanagari. No se dispone de metricas cuantitativas de error (WER/CER) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al derivar de Whisper Medium (~769 M de parametros), las variantes en fp16 suelen requerir del orden de 2-4 GB y las versiones int8 menos de 2 GB, aunque no se confirma en la ficha. El repositorio completo en ONNX ocupa 19,9 GB porque agrupa varias precisiones.
- GPU recomendadas: no disponibles en la informacion. Por tamano, deberia ejecutarse en GPUs consumer (RTX 3060, 4070, 4090) y en GPUs de datacenter (A100, H100) sin problemas, pero esto no se especifica.
- Compatibilidad con GPU consumer: previsiblemente si, dado que Whisper Medium suele caber en GPUs con 4-8 GB de VRAM; no confirmado en la informacion.
- Opciones de despliegue: Transformers.js (documentado oficialmente en el repositorio). Al ser ONNX, es compatible con ONNX Runtime y potencialmente con otros runners ONNX, aunque no se detalla en la ficha. No se mencionan vLLM, llama.cpp, Ollama ni TGI (orientados a LLM, no a ASR).
- Latencia y throughput: no disponibles. La model card afirma que la eliminacion de la deteccion de idioma produce inferencia mas rapida, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Code-switching | Licencia | Formato |
|---|---|---|---|---|---|
| zero-stt-hinglish (ONNX) | no disponible (~769 M, Whisper Medium) | hi, en (Hinglish) | Si, nativo | openrail | ONNX |
| OpenAI Whisper Medium | ~769 M | Multilingue | No especifico para Hinglish | MIT (modelo original) | PyTorch / safetensors |
| Whisper Large v3 | ~1,55 B | Multilingue | No especifico para Hinglish | MIT | PyTorch / safetensors |

No se dispone en la informacion proporcionada de otros modelos ASR especificos de Hinglish con los que comparar de forma directa, ni de metricas cuantitativas que permitan contrastar rendimiento entre ellos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al estar entrenado sobre datos de habla india (Vaani, Kathbath, Shrutilipi) mas datos propietarios, puede heredar sesgos de esos corpus.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio ruidoso, acentos no representados o vocabulario tecnico fuera de dominio.
- Limitacion idiomatica: el modelo esta especializado en Hinglish; su rendimiento en hindi puro, ingles puro u otras lenguas indicas no esta documentado.
- Limite de contexto de audio: la arquitectura Whisper procesa ventanas de 30 segundos, lo que condiciona la transcripcion de audios largos (requiere segmentacion). Este dato no se explicita en la ficha, pero es propio de la arquitectura base.
- Licencia OpenRAIL: aunque permite uso comercial, incluye clausulas de uso responsable que restringen ciertos usos (por ejemplo, aplicaciones daninas o vigilancia masiva segun el texto estandar de OpenRAIL). Conviene revisar los terminos exactos antes de desplegar en produccion.
- Al ser una conversion ONNX automatica, puede no incluir garantias de equivalencia numerica exacta con el modelo original de PyTorch.
- El modelo no incluye capacidades de traduccion, resumen ni generacion de texto; es exclusivamente un modelo ASR.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion que respalde su fiabilidad.

## Enlaces

- Modelo ONNX en HuggingFace: https://huggingface.co/onnx-community/zero-stt-hinglish-ONNX
- Modelo base original: https://huggingface.co/shunyalabs/zero-stt-hinglish
- Espacio de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion del pipeline ASR en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
- Demo del modelo: https://www.shunyalabs.ai/zero-code-switch
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-medium
- Dataset ARTPARK-IISc/Vaani (referenciado en la model card)
- Dataset ai4bharat/Kathbath (referenciado en la model card)
- Dataset ai4bharat/Shrutilipi (referenciado en la model card)
