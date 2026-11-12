# ehzawad/Voxtral-Small-24B-2507-bn-BD-FP8-Block

## Resumen

Voxtral-Small-24B-2507-bn-BD-FP8-Block es una cuantizacion en FP8 por bloques del modelo ehzawad/Voxtral-Small-24B-2507-bn-BD, un ajuste fino de Voxtral Small 24B 2507 de Mistral AI especializado en reconocimiento automatico del habla (ASR) en bengali de Bangladesh. El modelo base original es un modelo de voz de 24 mil millones de parametros orientado a transcripcion de alta precision y comprension de audio, y este derivado adapta sus capacidades al dominio linguistico bengali.

El repositorio lo publica el usuario ehzawad y esta empaquetado con la libreria vLLM y el formato de pesos safetensors comprimidos mediante compressed-tensors, con cuantizacion FP8 por bloques. Esta pensado para servir inferencia ASR en produccion con vLLM, reduciendo el coste de memoria frente a los pesos en BF16 del modelo base.

La relevancia de esta ficha radica en que combina tres elementos poco frecuentes: un modelo de voz de gran tamano, una adaptacion a un idioma de bajos recursos como el bengali de Bangladesh y una cuantizacion FP8 optimizada para despliegue. No obstante, la informacion publica del repositorio es muy escasa y la licencia figura como "other" con etiquetas de research-only y non-commercial, lo que condiciona su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de voz derivado de Voxtral Small 24B 2507 de Mistral AI) |
| Parametros totales | 24 mil millones (segun el nombre del modelo y la ficha de Voxtral Small 24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 por bloques (compressed-tensors); el ecosistema del modelo base incluye GGUF Q3_K_L y otras variantes |
| Idiomas soportados | bengali de Bangladesh (bn-BD) segun el nombre y las etiquetas; el resto no disponible |
| Licencia | "other" con etiquetas research-only y non-commercial; terminos concretos no disponibles |
| Formato de pesos | safetensors con cuantizacion compressed-tensors (FP8 por bloques); el modelo base dispone de formato nativo de Mistral (consolidated-*.safetensors) y GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo deriva de Voxtral Small 24B 2507 de Mistral AI, un modelo de voz de 24 mil millones de parametros para transcripcion y comprension de audio, y ha sido ajustado posteriormente por ehzawad para bengali de Bangladesh (variante bn-BD). La variante aqui descrita aplica cuantizacion FP8 por bloques mediante compressed-tensors sobre esos pesos ajustados.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni innovaciones tecnicas especificas del ajuste fino. El repositorio base ehzawad/Voxtral-Small-24B-2507-bn-BD-vllm conserva los mismos pesos en formato nativo de Mistral, lo que sugiere que el ajuste se realizo sobre la arquitectura original sin cambios estructurales declarados.

## Capacidades

- Reconocimiento automatico del habla (ASR) en bengali de Bangladesh, segun la pipeline declarada automatic-speech-recognition y las etiquetas del repositorio.
- Transcripcion de audio de alta precision, heredada de la base Voxtral Small 24B 2507, orientada a voz.
- Comprension de audio, segun la descripcion del modelo base de Mistral AI.
- Servido optimizado mediante vLLM, con pesos en FP8 por bloques para reducir memoria.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues mas alla del bengali: no disponibles.

## Casos de uso

- Transcripcion de reuniones y actas en bengali: el modelo puede convertir audio de reuniones en texto para su posterior analisis, aprovechando su especializacion en bn-BD y su tamano de 24B para transcripciones de alta precision.
- Subtitulado automatico de contenido audiovisual bengali: integrado en un pipeline de ASR con vLLM, permite generar subtitulos para videos, podcasts y material educativo en bengali de Bangladesh.
- Atencion al cliente por voz en bengali: transcripcion de llamadas o mensajes de voz para su enrutamiento, analisis de sentimiento o registro en sistemas CRM, con despliegue en servidores con GPU.
- Documentacion clinica o legal dictada: conversion de dictados en bengali a texto para revision humana, en entornos donde la precision del reconocimiento es critica.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenido hablado en bengali.
- Investigacion en ASR para idiomas de bajos recursos: el modelo sirve como punto de partida o referencia para experimentos academicos sobre bengali, dado su caracter research-only.
- Analisis de medios y monitorizacion: transcripcion masiva de emisiones de radio o television en bengali para indexacion y busqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 24B parametros en FP8, los pesos ocupan aproximadamente 24 GB; sumando overhead de activaciones y cache KV, se recomienda un minimo de 32-48 GB de VRAM para inferencia comoda. La cifra exacta no esta publicada.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegue en produccion con vLLM.
- GPU de consumo: una RTX 4090 (24 GB) queda muy justa para FP8 de 24B y probablemente requiera offloading o cuantizaciones adicionales; las variantes GGUF del modelo base (por ejemplo Q3_K_L) son mas adecuadas para GPUs de consumo.
- Opciones de despliegue: vLLM es la libreria declarada; el ecosistema del modelo base incluye variantes GGUF compatibles con llama.cpp y Ollama. TGI no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ehzawad/Voxtral-Small-24B-2507-bn-BD-FP8-Block | 24B | no disponible | ASR bengali bn-BD, FP8 | other, research-only, non-commercial | Hugging Face, vLLM |
| ehzawad/Voxtral-Small-24B-2507-bn-BD | 24B | no disponible | ASR bengali bn-BD, pesos completos | no disponible | Hugging Face |
| Mistral AI Voxtral Small 24B 2507 | 24B | no disponible | ASR y comprension de audio multilingue | comercial (segun Mistral AI; consultar terminos) | Amazon Bedrock y otros proveedores |
| ehzawad/Voxtral-Small-24B-2507-bn-BD-GGUF-Q3_K_L | 24B | no disponible | ASR bengali bn-BD, cuantizado GGUF | no disponible | Hugging Face |

## Limitaciones y advertencias

- La licencia figura como "other" con etiquetas research-only y non-commercial: el uso comercial esta restringido segun esas etiquetas, aunque los terminos exactos no estan publicados.
- El modelo esta especializado en bengali de Bangladesh; su rendimiento en otros idiomas o variantes del bengali (por ejemplo, India) no esta documentado.
- Al ser una cuantizacion FP8 por bloques, puede existir una perdida de precision respecto a los pesos BF16 del modelo base, no cuantificada en la informacion disponible.
- No hay datos publicados sobre sesgos, tasas de alucinacion o robustez ante audio ruidoso, acentos o dominios especificos.
- El repositorio tiene cero descargas y cero likes, y no se han publicado benchmarks ni evaluaciones independientes.
- La fecha de creacion indicada (2026-11-12) resulta anomala y conviene verificarla antes de citarla.
- Para produccion, es imprescindible validar la calidad de transcripcion en el dominio concreto y revisar los terminos de licencia del modelo base de Mistral AI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ehzawad/Voxtral-Small-24B-2507-bn-BD-FP8-Block
- Modelo base (pesos completos): https://huggingface.co/ehzawad/Voxtral-Small-24B-2507-bn-BD
- Variante formato nativo Mistral para vLLM: https://huggingface.co/ehzawad/Voxtral-Small-24B-2507-bn-BD-vllm
- Variante GGUF Q3_K_L: https://huggingface.co/ehzawad/Voxtral-Small-24B-2507-bn-BD-GGUF-Q3_K_L
- Ficha de Voxtral Small 24B 2507 en Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-mistral-ai-voxtral-small-24b-2507.html
- Ficha de Voxtral Small 24B 2507 en Septor Labs: https://septorlabs.com/models/voxtral-small-24b-2507
- Ficha agregada en Free2AITools: https://free2aitools.com/model/ehzawad/voxtral-small-24b-2507-bn-bd
