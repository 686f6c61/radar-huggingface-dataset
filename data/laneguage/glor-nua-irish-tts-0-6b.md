# Laneguage/glor-nua-irish-tts-0.6b

## Resumen

Glor Nua Irish TTS 0.6B es un modelo de sintesis de voz (text-to-speech) especializado en irlandes (gaeilge, codigo ISO `ga`), desarrollado por Laneguage mediante fine-tuning del modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base. El modelo parte de la familia Qwen3-TTS de Alibaba y se adapta a un idioma de bajos recursos como el irlandes, un caso donde los sistemas TTS comerciales genericos suelen ofrecer cobertura limitada o voces de baja calidad.

El modelo cuenta con 905.788.672 parametros reales en pesos safetensors (aproximadamente 0,9B, pese a la denominacion "0.6B" del modelo base), un repositorio de 2,5 GB y licencia Apache 2.0. Se distribuye como acceso restringido (gated) en Hugging Face, por lo que es necesario aceptar las condiciones del autor antes de descargarlo. El identificador "12Hz" del modelo base sugiere una tasa de tokens de audio de 12 Hz, caracteristica de los codecs neuronales de baja tasa empleados en TTS modernos.

Su relevancia actual radica en la escasez de recursos TTS de calidad para lenguas celtas y, en general, para idiomas de bajos recursos. Un modelo afinado especificamente para irlandes permite construir aplicaciones de accesibilidad, preservacion linguistica y sintesis de voz en un idioma con pocos hablantes nativos y escasa representacion en corpus de voz publicos. La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face, dado que no se ha proporcionado documentacion tecnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-TTS, familia de sintesis de voz de Qwen; detalles internos no especificados) |
| Parametros totales | 905.788.672 (pesos safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | irlandes (`ga`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | qwen-tts |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base |
| Tamano del repositorio | 2,5 GB |
| Pipeline | text-to-speech |
| Acceso | restringido (gated) |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo mas alla de que hereda la del Qwen/Qwen3-TTS-12Hz-0.6B-Base, un sistema de sintesis de voz de la familia Qwen3-TTS. La etiqueta "12Hz" del modelo base apunta a una representacion de audio mediante tokens a una tasa de 12 Hz, tipica de codecs neuronales de baja frecuencia que comprimen la senal de voz en secuencias discretas y permiten modelarla con un transformer autorregresivo o un modelo de difusion condicionada.

El proceso de entrenamiento del modelo consiste en un fine-tuning del modelo base sobre datos de voz en irlandes, segun indica la etiqueta `base_model:finetune`. No se especifican el volumen de horas de audio, la procedencia del corpus, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) mas alla de las inherentes al modelo base.

## Capacidades

- Sintesis de voz (text-to-speech) en irlandes a partir de texto escrito.
- Generacion de audio de voz con la libreria `qwen-tts` y pesos en safetensors.
- Especializacion en un idioma de bajos recursos: cobertura de irlandes (`ga`), no documentada en el modelo base generico.
- Integracion en pipelines de Hugging Face mediante el pipeline `text-to-speech`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje general).
- No se documenta soporte de vision, audio de entrada ni modo thinking.
- Capacidades multilingues: limitadas al irlandes segun los metadatos; no se indica soporte adicional de otros idiomas.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en irlandes: el modelo puede leer en voz alta contenido web, documentos o interfaces en gaeilge, un idioma con escasa cobertura en lectores de pantalla comerciales.
- Preservacion linguistica y educacion: generacion de material audio para cursos de irlandes, ejercicios de pronunciacion y recursos didacticos donde la disponibilidad de voces nativas grabadas es limitada.
- Asistentes de voz y chatbots en irlandes: integracion en servicios publicos o aplicaciones de atencion ciudadana en zonas de habla irlandesa, aprovechando la licencia Apache 2.0 para despliegue comercial.
- Audiolibros y narracion automatizada: conversion de textos literarios o divulgativos en irlandes a audio, reduciendo el coste de produccion frente a la locucion profesional.
- Localizacion de videojuegos y medios: doblaje de dialogos en irlandes para productos culturales o educativos dirigidos a ese mercado.
- Investigacion en TTS de bajos recursos: el modelo sirve como punto de partida (fine-tuning adicional) o como referencia para estudiar la adaptacion de modelos multilingues a lenguas celtas.
- Sistemas de navegacion y avisos por voz en irlandes: sintesis de indicaciones para aplicaciones de transporte o turismo en regiones Gaeltacht.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas objetivas como MOS (Mean Opinion Score), CMOS, WER de transcripcion inversa ni comparaciones cuantitativas con otros sistemas TTS para irlandes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 905,8 M de parametros, los pesos en precision FP32 ocupan aproximadamente 3,6 GB y en FP16/BF16 unos 1,8 GB; a esto hay que sumar el coste del decodificador de audio y del vocoder asociado al modelo base, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible de forma especifica; por tamano, una GPU consumer con 8 GB de VRAM o mas deberia ser suficiente en FP16, aunque no se confirma en la documentacion.
- Cabe en GPU consumer: previsiblemente si (RTX 3060 12 GB, RTX 4070, RTX 4090), sujeto a verificacion empirica.
- Opciones de despliegue: la libreria indicada es `qwen-tts`; no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Acceso |
|---|---|---|---|---|---|
| Laneguage/glor-nua-irish-tts-0.6b | 905,8 M | no disponible | Irlandes (`ga`) | Apache 2.0 | Gated |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | ~0,6B (nominal) | no disponible | Multilingue (base) | no disponible en esta ficha | no disponible |
| Otros TTS para irlandes | no disponible | no disponible | Irlandes | no disponible | no disponible |

No se dispone de informacion sobre alternativas especificas de TTS en irlandes ni de sus metricas, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face y requiere aceptar las condiciones del autor antes de la descarga, lo que puede retrasar su integracion en pipelines automatizados.
- Cobertura limitada a un unico idioma (irlandes); no es adecuado para sintesis multilingue.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus de voz en irlandes puede reflejar sesgos de genero, edad, acento regional o dialecto (por ejemplo, diferencias entre dialectos de Connacht, Munster y Ulster).
- Riesgo de artefactos de sintesis y pronunciacion incorrecta en palabras extranjeras, nombres propios o terminologia tecnica no representada en el corpus de entrenamiento.
- No se han publicado evaluaciones objetivas de calidad (MOS) ni comparaciones con sistemas comerciales, por lo que la calidad real de la voz no esta verificada en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que las condiciones del acceso gated no impongan restricciones adicionales.
- La ausencia de documentacion sobre el dataset de entrenamiento impide evaluar la procedencia y los derechos de los datos de voz utilizados.
- No se especifican requisitos de hardware ni latencias, lo que dificulta la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laneguage/glor-nua-irish-tts-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
