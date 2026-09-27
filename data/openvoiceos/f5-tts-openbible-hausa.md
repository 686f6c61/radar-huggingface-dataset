# OpenVoiceOS/F5-TTS-OpenBible-Hausa

## Resumen

F5-TTS-OpenBible-Hausa es un modelo de sintesis de voz (text-to-speech) para el idioma hausa, entrenado a partir de grabaciones de audio de la Biblia abierta (Open Bible). El modelo original fue desarrollado por el colectivo `multilingual-tts`, y el repositorio aqui descrito (`OpenVoiceOS/F5-TTS-OpenBible-Hausa`) es un espejo (mirror) sin modificaciones publicado por OpenVoiceOS: los ficheros son identicos byte a byte a los del repositorio de origen, con los hashes sha256 documentados en la model card para verificacion.

Tecnicamente se apoya en la familia F5-TTS, un sistema de sintesis de voz no autorregresivo basado en flow matching con un backbone de tipo Diffusion Transformer (DiT) y decodificacion vocoder. Esto lo situa en la categoria de TTS zero-shot: puede clonar una voz a partir de un audio de referencia corto sin reentrenamiento. El modelo esta especializado en hausa (`ha`), con licencia CC BY-SA 4.0, que es share-alike y obliga a mantener la misma licencia en obras derivadas.

Su relevancia practica es doble. Por un lado, cubre una lengua con recursos limitados (hausa, con decenas de millones de hablantes) dentro de un ecosistema TTS dominado por el ingles y un punado de idiomas mayoritarios. Por otro, al proceder de un mirror con hashes publicados, ofrece trazabilidad de integridad, algo poco habitual en checkpoints de voz redistribuidos. El repositorio ocupa 5,4 GB, aunque la model card solo documenta explicitamente los ficheros de configuracion, vocabulario y peso `model_last.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching con backbone DiT); detalles del checkpoint no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; longitud de audio de referencia y de generacion no disponibles) |
| Tipos de cuantizacion | no disponible (se distribuye en `.pt`, sin variantes GGUF ni ONNX documentadas) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`model_last.pt`) + configuracion YAML + `vocab.txt` |
| Pipeline | text-to-speech |
| Libreria | `f5_tts` |
| Tamano del repositorio | 5,4 GB |
| Autor del mirror | OpenVoiceOS |
| Repositorio de origen | multilingual-tts/F5-TTS-OpenBible-Hausa |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia F5-TTS emplea un esquema de flow matching entrenado con un Diffusion Transformer (DiT) y un codificador de texto de tipo ConvNeXt, con generacion no autorregresiva y decodificacion a traves de un vocoder neuronal. Este diseno permite sintetizar voz a partir de texto y de un prompt de audio de referencia corto, lo que habilita clonacion de voz zero-shot. Esta descripcion corresponde a la arquitectura general de F5-TTS; no se dispone de confirmacion documental de que este checkpoint concreto reproduzca exactamente esa configuracion ni de sus hiperparametros.

En cuanto a los datos de entrenamiento, la model card indica unicamente que la voz fue entrenada con grabaciones de Open Bible en hausa. No se especifica el numero de horas de audio, la composicion exacta del corpus, el numero de tokens de texto, ni si se aplicaron fases de ajuste tipo RLHF, DPO o fine-tuning supervisado adicional. El codigo de entrenamiento y evaluacion asociado se publica en el repositorio `open-bible-models` de David Guzman R., pero los detalles de la receta no estan incluidos en la informacion disponible. Este repositorio no ha entrenado ni modificado el modelo; se limita a replicar los ficheros del origen y a publicar sus hashes sha256.

## Capacidades

- Sintesis de voz en hausa a partir de texto, con salida de audio.
- Clonacion de voz zero-shot mediante audio de referencia (capacidad propia de la familia F5-TTS; no verificada de forma independiente en este checkpoint).
- Generacion de audio de duracion variable, sujeta a los limites practicos de la implementacion `f5_tts`.
- Reproduccion fiel del estilo y las caracteristicas de las voces presentes en las grabaciones de Open Bible en hausa.
- Integridad verificable: cada fichero del repositorio incluye su sha256 en la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni comportamiento agentico, dado que es un modelo de voz y no un modelo de lenguaje.
- No se documentan capacidades de vision, audio de entrada mas alla del prompt de referencia, ni traduccion.

## Casos de uso

- Audiolibros y contenido religioso en hausa: el modelo esta entrenado sobre lecturas de Open Bible, por lo que es directamente aplicable a la narracion de textos devocionales y literatura similar, con una prosodia ajustada al registro de lectura.
- Accesibilidad para personas con discapacidad visual: conversion de textos escritos en hausa a voz para lectores de pantalla y sistemas de asistencia, aprovechando el soporte nativo del idioma.
- Locuciones para medios y radio comunitaria en hausa: generacion de cuñas, boletines y avisos donde no se dispone de una persona locutora disponible en todo momento.
- Material educativo en lengua hausa: narracion de contenidos escolares o de alfabetizacion, con la posibilidad de clonar una voz concreta de referencia para mantener coherencia entre lecciones.
- Interfaces de voz para servicios telefonicos o IVR en regiones hausaparlantes: sintesis de respuestas para menus automaticos y atencion basica, siempre que se valide previamente la inteligibilidad en dominio telefonico.
- Prototipado de doblaje y localizacion: generar pistas de voz temporales en hausa para evaluar la longitud y el encaje de guiones antes de contratar grabacion humana.
- Investigacion en TTS multilingue y lenguas de bajos recursos: el checkpoint sirve como punto de comparacion o base para fine-tuning en variedades cercanas del hausa, respetando la clausula share-alike de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye metricas objetivas (MOS, WER, CER, similitud de hablante) ni comparaciones cuantitativas con otros sistemas TTS, y el repositorio de origen no aporta cifras en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un checkpoint de la familia F5-TTS de tamano base, la inferencia en precision completa suele requerir del orden de 2 a 4 GB de VRAM, pero este dato no esta confirmado para este modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM deberia ser suficiente en la mayoria de configuraciones de la familia F5-TTS; no hay recomendaciones publicadas especificas para este checkpoint.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, dado el tamano tipico de los checkpoints F5-TTS. No confirmado.
- Opciones de despliegue: la libreria declarada es `f5_tts`, que expone scripts de inferencia y una interfaz Gradio. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ya que estos estan orientados a modelos de lenguaje y no a este tipo de vocoder/DiT de audio.
- Almacenamiento: el repositorio ocupa 5,4 GB, aunque el conjunto de ficheros necesario para inferencia puede ser notablemente menor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| F5-TTS-OpenBible-Hausa (este) | no disponible | audio de referencia (longitud no documentada) | hausa | CC BY-SA 4.0 | HuggingFace (mirror), PyTorch |
| Otras voces F5-TTS OpenBible de `multilingual-tts` | no disponible | audio de referencia | segun la voz (otros idiomas) | CC BY-SA 4.0 (segun repositorio) | HuggingFace |
| Coqui XTTS-v2 | aprox. 467 M | audio de referencia de ~6 s | multilingue (varios idiomas, hausa no confirmado) | Coqui CPML (uso comercial restringido) | HuggingFace, mantenimiento discontinuado |
| Meta MMS-TTS | aprox. 36 M por idioma | texto a voz sin clonacion | mas de 1000 idiomas (hausa incluido) | CC-BY-NC 4.0 (no comercial) | HuggingFace, transformers |

Nota: las cifras de parametros de XTTS-v2 y MMS-TTS son valores de referencia ampliamente citados, no datos aportados por la informacion de este repositorio. Para este checkpoint concreto no se dispone de numero de parametros ni de resultados comparativos de calidad.

## Limitaciones y advertencias

- Licencia share-alike: CC BY-SA 4.0 obliga a que cualquier obra derivada (fine-tuning, mezcla de voces, modelos destilados) se publique bajo la misma licencia, con atribucion al modelo original y declaracion de los cambios realizados. Esto puede ser incompatible con despliegues de producto que exijan licencias permisivas o propietarias.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, inteligibilidad ni naturalidad, por lo que cualquier evaluacion en produccion debe hacerse de forma previa y propia.
- Sesgo de dominio: el entrenamiento se basa en grabaciones de lectura religiosa, lo que puede sesgar el estilo prosodico y reducir el rendimiento en registros conversacionales, dialectales o con jerga tecnica.
- Cobertura idiomatica estrecha: solo hausa; no hay soporte documentado de mezcla de codigos con ingles, arabe o frances, frecuente en hablantes reales de hausa.
- Riesgo de alucinacion acustica: en TTS, los fallos tipicos incluyen pronunciacion incorrecta, omision o repeticion de fragmentos, ruido y artefactos, especialmente con texto fuera de dominio, numeros, siglas o nombres propios.
- Dudas sobre la fecha de publicacion: los metadatos indican creacion el 2026-09-26, posterior a la fecha habitual de consulta, lo que conviene verificar antes de citarla.
- Ausencia de validacion en produccion: el repositorio es un mirror sin mantenimiento propio declarado por OpenVoiceOS y con cero descargas, por lo que no hay senales de uso en produccion ni soporte de la comunidad.
- Falta de datos de entrenamiento: no se documentan horas de audio, composicion del corpus ni proceso de ajuste, lo que dificulta evaluar procedencia y posibles problemas de derechos sobre las grabaciones originales.
- Formato de pesos: al distribuirse como `.pt` de PyTorch, no es directamente consumible por runtimes de inferencia ligeros sin conversion previa.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/OpenVoiceOS/F5-TTS-OpenBible-Hausa
- Modelo original: https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Hausa
- Codigo de entrenamiento y evaluacion: https://github.com/davidguzmanr/open-bible-models
- Texto completo de la licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
