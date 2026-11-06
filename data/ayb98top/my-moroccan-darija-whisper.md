# ayb98top/my-moroccan-darija-whisper

## Resumen

my-moroccan-darija-whisper es un ajuste fino (fine-tuning) del modelo openai/whisper-small, publicado por el usuario ayb98top en Hugging Face, especializado en reconocimiento automatico del habla (ASR) para darija marroqui. Whisper-small es un transformer encoder-decoder de 241,7 millones de parametros, y este ajuste lo adapta especificamente al arabe dialectal de Marruecos, un dominio linguistico con escasa representacion en los corpus de entrenamiento del modelo original.

El modelo se entrena sobre el dataset Dvoice darija v2.0 y declara un Word Error Rate (WER) del 14,1994 % en el conjunto de evaluacion, con una perdida de validacion de 0,1732. Partiendo de un WER del 29,89 % en el paso 1000, el ajuste converge rapidamente hasta estabilizarse en torno al 13,9-14,4 % a partir del paso 3000, lo que sugiere que el modelo base ya aporta una representacion acustica util y el fine-tuning solo necesita adaptar el decodificador al dialecto.

Es relevante ahora porque la darija marroqui es una variedad oral con poca presencia en sistemas ASR comerciales y en los corpus multilingues de Whisper, y este tipo de ajustes comunitarios de bajo coste (un modelo small que cabe en GPU de consumo) permiten desplegar transcripcion automatica en aplicaciones locales sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper-small trabaja con ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion a traves de herramientas externas como llama.cpp u ONNX, no documentada por el autor) |
| Idiomas soportados | ar (arabe, segun la model card); orientado especificamente a darija marroqui |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper-small de OpenAI: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio en ventanas de 30 segundos con espectrogramas log-Mel como entrada. El ajuste fino parte de los pesos de openai/whisper-small y se entrena sobre el dataset Dvoice darija v2.0, cuyo contenido, tamano y composicion no se detallan en la model card.

Los hiperparametros declarados son: learning rate de 1e-05 con scheduler lineal y 500 pasos de warmup, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), batch de entrenamiento de 16 y de evaluacion de 8, semilla 42, 5000 pasos de entrenamiento y precision mixta nativa (AMP). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La metrica de seguimiento es WER, calculada en cada evaluacion intermedia.

## Capacidades

- Reconocimiento automatico del habla (ASR) en darija marroqui, con salida de texto transcrito.
- Transcripcion de audio en ventanas de hasta 30 segundos (limitacion heredada de Whisper-small).
- Capacidad multilingue residual heredada del modelo base, aunque el ajuste esta orientado al dialecto marroqui y la model card solo declara el idioma `ar`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio de salida.
- No se documentan capacidades de traduccion, diarizacion de hablantes ni marcas de tiempo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en darija: el modelo convierte audio de habla marroqui en texto para actas o resumenes, aprovechando el bajo WER declarado (14,2 %) en el conjunto de evaluacion.
- Subtitulado de contenido audiovisual marroqui: integrado en un pipeline que segmenta el audio en ventanas de 30 segundos y genera subtitulos en texto, util para creadores y medios locales.
- Atencion al cliente por voz en Marruecos: transcripcion de llamadas en darija para su posterior analisis o enrutamiento, con el modelo desplegado en local para evitar enviar audio sensible a terceros.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de darija para estudios de variacion dialectal, dado el escaso soporte de esta variedad en herramientas comerciales.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contextos donde el contenido se produce en darija.
- Prototipado de asistentes de voz locales: al ser un modelo small de 241,7 M de parametros, permite iterar rapidamente en entornos con GPU de consumo antes de escalar a modelos mayores.
- Documentacion de historiales clinicos o administrativos dictados en darija: transcripcion local para reducir la dependencia de servicios en la nube con requisitos de residencia de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion, dataset Dvoice darija v2.0):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,1732 |
| WER (evaluacion final) | 14,1994 % |

Evolucion durante el entrenamiento:

| Paso | Epoca | Training loss | Validation loss | WER (%) |
|---|---|---|---|---|
| 1000 | 2,3419 | 0,1141 | 0,2908 | 29,8924 |
| 2000 | 4,6838 | 0,0116 | 0,1821 | 15,6051 |
| 3000 | 7,0258 | 0,0009 | 0,1739 | 13,9249 |
| 4000 | 9,3677 | 0,0004 | 0,1721 | 14,3532 |
| 5000 | 11,7096 | 0,0003 | 0,1732 | 14,1994 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El model-index del repositorio esta vacio (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,5 GB solo para pesos (241,7 M de parametros), con overhead adicional de activaciones y buffers de audio; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,25-0,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes, aunque para este tamano las GPU de consumo son la opcion natural.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de NVIDIA, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), pipeline de automatic-speech-recognition; tambien es compatible con endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idioma | Licencia | WER declarado |
|---|---|---|---|---|---|
| my-moroccan-darija-whisper | 241,7 M | ventanas de 30 s | darija marroqui (ar) | apache-2.0 | 14,1994 % (eval. propia) |
| openai/whisper-small | 241,7 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible para darija en la informacion proporcionada |
| openai/whisper-base | 74,4 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en la informacion proporcionada |
| openai/whisper-medium | 769 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en la informacion proporcionada |

La comparacion con whisper-small es la mas directa: mismo tamano y arquitectura, pero el ajuste fino esta especializado en darija. No se dispone de datos de WER de whisper-small sin ajustar sobre el mismo conjunto de evaluacion, por lo que no es posible cuantificar la mejora de forma aislada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed") en descripcion, usos previstos, limitaciones y datos de entrenamiento.
- El WER del 14,1994 % corresponde a un unico conjunto de evaluacion no descrito; no hay validacion cruzada ni evaluacion en dominios externos, por lo que la generalizacion es incierta.
- No se detalla la composicion del dataset Dvoice darija v2.0 (horas, hablantes, dominios, calidad de audio), lo que impide evaluar sesgos de genero, edad, region o registro.
- La darija marroqui tiene una ortografia no estandarizada; el modelo puede producir transcripciones inconsistentes en la representacion escrita (arabic script frente a latinizacion).
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio fuera de dominio.
- Limitacion de contexto: Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o mediante pipeline, con riesgo de cortes en frases.
- La model card solo declara el idioma `ar`; el rendimiento en otras variedades de arabe o en darija escrita no esta documentado.
- Licencia apache-2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Con 17 descargas y 0 likes, el modelo carece de validacion por parte de la comunidad; conviene evaluarlo en el dominio objetivo antes de usarlo en produccion.
- No se documentan sesgos conocidos en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/ayb98top/my-moroccan-darija-whisper
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Dataset Dvoice darija v2.0: no disponible como enlace en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
