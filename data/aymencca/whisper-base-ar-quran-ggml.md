# Aymencca/whisper-base-ar-quran-ggml

## Resumen

`Aymencca/whisper-base-ar-quran-ggml` es una conversion al formato GGML del modelo `tarteel-ai/whisper-base-ar-quran`, un Whisper Base ajustado para reconocimiento de recitacion del Coran en arabe. Lo desarrolla el usuario Aymencca y su unico proposito es permitir la inferencia offline mediante `whisper.cpp`, en particular en telefonos moviles. No introduce cambios en los pesos mas alla de la conversion de formato y la cuantizacion.

El modelo parte de la arquitectura Whisper Base original de OpenAI (transformer encoder-decoder con aproximadamente 74 millones de parametros), reentrenada por Tarteel AI sobre audio de recitacion coranica. Esta version concreta se distribuye cuantizada a q5_0 en un unico fichero de 55.295.433 bytes (unos 55 MB), lo que reduce drasticamente el peso respecto a los pesos originales en safetensors.

Su relevancia es acotada pero clara: cubre un nicho muy especifico (transcripcion de recitacion coranica en arabe con harakat) en un entorno de despliegue ligero y sin conexion. No es un modelo de proposito general ni compite con Whisper Large en tareas de ASR generico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | no disponible (Whisper Base tiene del orden de 74 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Base opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | q5_0 (unica version publicada) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`ggml-quran-base-q5_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper en su variante Base: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio en ventanas de 30 segundos. El modelo original `tarteel-ai/whisper-base-ar-quran` fue ajustado por Tarteel AI sobre recitacion coranica en arabe; la model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion de esta publicacion es puramente de ingenieria de despliegue: conversion de los pesos al formato GGML que consume `whisper.cpp` y cuantizacion a q5_0. El autor indica explicitamente que no se modificaron los pesos mas alla de la conversion y la cuantizacion, por lo que las capacidades del modelo son las del modelo base de Tarteel AI, con la perdida de precision inherente a la cuantizacion de 5 bits.

## Capacidades

- Reconocimiento automatico de voz (ASR) de recitacion coranica en arabe.
- Generacion de texto arabe con vocales (harakat), segun indica la model card.
- Inferencia offline en dispositivos moviles mediante `whisper.cpp`.
- Ejecucion sobre CPU sin necesidad de GPU, gracias al formato GGML cuantizado.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingue: el modelo esta etiquetado unicamente para arabe.
- No se documentan modos de razonamiento, vision ni audio mas alla del propio ASR.

## Casos de uso

- Aplicaciones moviles de recitacion coranica: el fichero de 55 MB y el formato GGML permiten empaquetar el modelo dentro de una app iOS o Android y transcribir recitacion sin conexion ni coste de API.
- Verificacion de recitacion en tiempo de practica: integrado en una app de aprendizaje, el modelo transcribe lo que recita el usuario y permite compararlo con el texto esperado para detectar errores.
- Transcripcion por lotes en servidores modestos: al ejecutarse en CPU con `whisper.cpp`, puede procesar archivos de audio en un servidor sin GPU dedicada.
- Archivado y etiquetado de bibliotecas de audio coranico: transcripcion automatica de grabaciones para generar indices de texto buscables.
- Sistemas de subtitulado para videos de recitacion: generacion de subtitulos en arabe con vocales para contenido religioso.
- Prototipado y evaluacion de pipelines de ASR especializado: util como componente ligero en pruebas de concepto donde no se justifica desplegar un Whisper Large.
- Investigacion sobre ASR de arabe clasico: punto de partida reproducible y de bajo coste computacional para experimentos de dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el fichero cuantizado ocupa unos 55 MB y la inferencia en CPU necesita un consumo de RAM del orden de unos cientos de MB (estimacion no confirmada en la informacion proporcionada).
- GPU recomendadas: no aplica; el objetivo declarado es ejecucion en telefonos moviles.
- Cabe en cualquier GPU consumer y en practicamente cualquier dispositivo movil moderno; tambien en Raspberry Pi y sistemas embebidos con recursos suficientes.
- Opciones de despliegue: `whisper.cpp` (formato nativo); no se distribuyen pesos en otros formatos (safetensors, GGUF para Ollama, etc.) en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Aymencca/whisper-base-ar-quran-ggml | no disponible (Base) | no disponible | arabe | Apache-2.0 | GGML q5_0 |
| tarteel-ai/whisper-base-ar-quran | no disponible (Base) | no disponible | arabe | Apache-2.0 | safetensors (formato original) |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingue | MIT | safetensors, GGML via conversion |
| openai/whisper-large-v3 | ~1550 M | ventanas de 30 s | multilingue | MIT | safetensors, GGML via conversion |

La diferencia principal frente a `whisper-base-ar-quran` es el formato y la cuantizacion: esta version esta lista para `whisper.cpp` y pesa una fraccion de los pesos originales. Frente a los Whisper genericos de OpenAI, el ajuste de Tarteel AI deberia ofrecer mejor precision en recitacion coranica, aunque no se han publicado cifras comparativas en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado para recitacion coranica; el rendimiento en arabe conversacional general o en otros idiomas no esta documentado y probablemente sea deficiente.
- La cuantizacion q5_0 introduce perdida de precision respecto a los pesos originales; no se documenta la magnitud de esa degradacion.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente con audio ruidoso o fuera de dominio; puede generar texto plausible pero incorrecto.
- No se documentan sesgos especificos, pero al estar entrenado sobre un corpus religioso concreto puede presentar sesgos hacia ese registro y estilo.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo original de Tarteel AI; conviene verificar los terminos del modelo base.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- Solo se publica una unica cuantizacion (q5_0); no hay variantes q4, q8 ni pesos sin cuantizar en este repositorio.
- No se especifican requisitos minimos de `whisper.cpp` ni la version compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aymencca/whisper-base-ar-quran-ggml
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
