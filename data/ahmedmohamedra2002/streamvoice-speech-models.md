# ahmedmohamedra2002/streamvoice-speech-models

## Resumen

StreamVoice speech models es una coleccion de once modelos de reconocimiento automatico del habla (ASR) derivados de los FastConformer de NVIDIA, cada uno especializado en un unico idioma: arabe, frances, neerlandes, polaco, croata, bielorruso, georgiano, espanol, aleman, ruso e italiano. El autor del repositorio, ahmedmohamedra2002, los publica como artefactos de despliegue para la aplicacion Android StreamVoice, bajo la etiqueta de "modelos pequenos y precisos".

El modelo original es el FastConformer hibrido (transducer + CTC) de NVIDIA, con 115 millones de parametros y capacidad de puntuacion y mayusculas. La aportacion de este repositorio no es el entrenamiento, sino la conversion: los pesos se transforman de formato NeMo a ggml, se cuantizan a 5 bits (q5_0) y se adapta la cabeza transducer para que el decodificador TDT de la aplicacion pueda ejecutarlos. No se ha reentrenado ningun modelo.

Su relevancia practica esta en el despliegue en dispositivo: ficheros de menos de 100 MB por idioma que permiten transcripcion local sin conexion, en movil, con licencia CC-BY-4.0. Es un recurso util para quien necesite ASR multilingue ligero en un entorno de inferencia ggml, aunque no es un modelo entrenado desde cero ni un checkpoint NeMo directamente cargable en pipelines convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido (encoder Conformer + decoder transducer RNNT/TDT; cabeza CTC no utilizada en la conversion) |
| Parametros totales | 115 millones (por fichero de idioma) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q5_0 (5 bits); se indica que 4 bits rompia los modelos |
| Idiomas soportados | arabe, frances, neerlandes, polaco, croata, bielorruso, georgiano, espanol, aleman, ruso, italiano (un fichero por idioma) |
| Licencia | CC-BY-4.0 (codigo y pesos derivados de NVIDIA) |
| Formato de pesos | ggml (.bin), cuantizado q5_0 |

## Arquitectura y entrenamiento

Cada fichero procede de un modelo FastConformer hibrido de NVIDIA: un encoder Conformer con atencion por bloques para procesar audio de forma eficiente, acoplado a un decoder transducer (RNNT) y a una cabeza CTC auxiliar. En esta conversion se descarta la cabeza CTC y se usa el decoder transducer. Ademas, se anade una fila de ceros a la salida del joint del transducer (duracion 0) para habilitar el decodificador TDT de la aplicacion, y el escalado de entrada del encoder se pliega en su primera capa.

No hay entrenamiento propio: los pesos son los originales de NVIDIA, adaptados de formato y cuantizados. La model card no documenta el volumen de datos de entrenamiento, la composicion del corpus ni si se aplico RLHF/DPO; esa informacion corresponde a las fichas de los modelos originales de NVIDIA, fuera del alcance de este repositorio. La innovacion tecnica aqui es de ingenieria de despliegue: conversion NeMo a ggml, cuantizacion q5_0 y compatibilidad con decodificacion TDT.

## Capacidades

- Reconocimiento automatico del habla (ASR) en un idioma por fichero, con salida textual.
- Puntuacion y mayusculas incluidas en la transcripcion (heredadas de los modelos "pc" de NVIDIA).
- Decodificacion transducer/TDT optimizada para ejecucion en dispositivo mediante ggml.
- Idiomas cubiertos: arabe, frances, neerlandes, polaco, croata, bielorruso, georgiano, espanol, aleman, ruso e italiano.
- No incluye tool calling, function calling ni capacidades de agente.
- No es un modelo generativo de texto ni multimodal: no hay vision, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripcion local en Android sin conexion: la aplicacion StreamVoice integra estos ficheros ggml para convertir voz a texto en el propio dispositivo, sin enviar audio a servidores, gracias a su tamano reducido y cuantizacion q5_0.
- Subtitulado y dictado multilingue en movil: con once ficheros independientes, una app puede ofrecer dictado en el idioma del usuario descargando solo el modelo correspondiente.
- Procesamiento de audio en entornos con conectividad limitada: al ejecutarse en local con ggml, es adecuado para trabajo de campo, inspeccion o dispositivos sin red.
- Integracion en aplicaciones de accesibilidad: dictado por voz para usuarios con dificultades de teclado, con transcripcion con puntuacion y mayusculas lista para insertar en un campo de texto.
- Prototipado de ASR en espanol y otras lenguas europeas: el fichero `streamvoice-asr-es-q5_0.bin` sirve para experimentar con transcripcion en castellano usando el motor ggml de la app de referencia.
- Evaluacion comparativa de ASR ligero en dispositivos de gama baja: el bajo consumo de memoria de un modelo de 115M en 5 bits permite medir latencia y precision en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: un modelo de 115M de parametros en q5_0 ocupa del orden de 70-90 MB de pesos, mas las estructuras de inferencia; es apto para ejecucion en CPU.
- GPU recomendadas: no disponible en la informacion proporcionada; el formato ggml esta pensado para inferencia en CPU y, opcionalmente, con aceleracion GPU segun soporte del motor de la app.
- Cabe en cualquier GPU de consumo y en moviles de gama media; no requiere A100 ni H100.
- Opciones de despliegue: el motor ggml de la aplicacion StreamVoice (formato .bin propietario de la app); no se documenta compatibilidad directa con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StreamVoice speech models | 115M | no disponible | ggml q5_0 | CC-BY-4.0 | Hugging Face (este repo) |
| NVIDIA FastConformer hyb. large pc (original) | 115M | no disponible | NeMo (.nemo) | CC-BY-4.0 | Hugging Face (NVIDIA) |
| NVIDIA FastConformer CTC/RNNT pequenos | no disponible | no disponible | NeMo (.nemo) | CC-BY-4.0 (varia por idioma) | Hugging Face (NVIDIA) |

La comparacion directa con alternativas es limitada: este repositorio no es un modelo nuevo, sino una conversion de los modelos NVIDIA. Frente al original NeMo, la diferencia esta en el formato (ggml frente a .nemo) y la cuantizacion, no en la precision declarada. No se dispone de datos para comparar rendimiento con otros ASR ligeros como Whisper small o wav2vec2.

## Limitaciones y advertencias

- No se ha reentrenado: la calidad depende integramente de los modelos originales de NVIDIA; no hay mejoras propias.
- Requiere el motor ggml concreto de la app StreamVoice; los ficheros .bin no son directamente cargables en NeMo, llama.cpp ni otras herramientas estandar.
- Un fichero por idioma: no hay deteccion automatica de idioma ni transcripcion multilingue en un solo modelo.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero es obligatorio citar a NVIDIA; el autor excluye expresamente el modelo portugues de NVIDIA por su licencia no comercial.
- Riesgo de alucinacion y errores de transcripcion en audio ruidoso o con acentos no representados en el entrenamiento original; no hay datos publicados de WER en este repositorio.
- Idiomas excluidos por baja precision medida (ucraniano y persa) y portugues por licencia; no se ofrece cobertura de esos idiomas.
- Sin informacion sobre sesgos, contexto maximo de audio ni composicion del dataset original.
- El repositorio tiene 0 descargas y 0 likes y fue creado en 2026: no hay evidencia de uso o validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedmohamedra2002/streamvoice-speech-models
- Model card original de NVIDIA (arabe): https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0
- Model card original de NVIDIA (frances): https://huggingface.co/nvidia/stt_fr_fastconformer_hybrid_large_pc
- Model card original de NVIDIA (espanol): https://huggingface.co/nvidia/stt_es_fastconformer_hybrid_large_pc
- Model card original de NVIDIA (aleman): https://huggingface.co/nvidia/stt_de_fastconformer_hybrid_large_pc
- Model card original de NVIDIA (italiano): https://huggingface.co/nvidia/stt_it_fastconformer_hybrid_large_pc
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
