# qvac/TranscribePsy-250M-EU-sub-gguf

## Resumen

TranscribePsy-250M-EU-sub-gguf es la distribucion en formato GGUF del modelo de reconocimiento automatico del habla TranscribePsy-250M-EU-sub, desarrollado por qvac. Se trata de un modelo compacto de unos 283 millones de parametros, derivado de la familia TranscribePsy-250M-EU, que cubre ocho idiomas europeos (neerlandes, ingles, frances, aleman, italiano, polaco, portugues y espanol) y esta pensado para inferencia en dispositivo (on-device) y en el borde (edge).

El modelo base emplea el diseno CAFE (Confining Feature Distillation to Language-Routed Adapters), un esquema de adaptadores enrutados por idioma que permite a un unico modelo compacto cubrir varios idiomas sin multiplicar el coste de inferencia. Esta version concreta es una cuantizacion de 8 bits (Q8_0) de 305 MB, empaquetada para el motor Parakeet de qvac-fabric-speech.cpp, y es exactamente la build utilizada en las mediciones que publica el autor.

Su relevancia actual radica en el rendimiento en movil: sobre seis telefonos, el autor reporta un factor de tiempo real medio de 0,052, una latencia de inferencia de 1.021 ms, un arranque en frio de 252 ms y un pico de memoria de 534 MiB con audio de 10 segundos. Ademas, el modelo base figura en la Open ASR Leaderboard dentro de la frontera de Pareto entre tamano y WER en la pista multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptadores enrutados por idioma (diseno CAFE); detalles completos en la model card del modelo base |
| Parametros totales | 283.492.118 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; el motor procesa audio en ventanas de 60 s con 25 % de solapamiento para grabaciones largas |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | nl, en, fr, de, it, pl, pt, es (8 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento automatico del habla basado en transformer con adaptadores enrutados por idioma, segun el diseno CAFE descrito en el paper arXiv:2610.19134. Este esquema confina la destilacion de caracteristicas a adaptadores especificos de cada idioma, lo que permite que un modelo de unos 283 millones de parametros cubra ocho idiomas manteniendo un coste de computo bajo y adecuado para dispositivos moviles. La model card de esta build remite a la del modelo base para los detalles de arquitectura y entrenamiento, por lo que el numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada.

Esta distribucion concreta es una conversion a GGUF con cuantizacion Q8_0 (305 MB) del modelo base en PyTorch, optimizada para el motor Parakeet de qvac-fabric-speech.cpp. El motor implementa procesamiento por ventanas para audio largo: las grabaciones de mas de un minuto se codifican en ventanas de 60 s con 25 % de solapamiento, lo que mantiene el pico de memoria por debajo de 2 GB en grabaciones de 10 a 30 minutos. Los flags de ventana larga permiten reducir la ventana a 30 s en dispositivos con menos memoria. El motor no remuestrea audio: exige WAV mono a 16 kHz.

## Capacidades

- Transcripcion de voz a texto (ASR) en ocho idiomas europeos: neerlandes, ingles, frances, aleman, italiano, polaco, portugues y espanol.
- Reconocimiento multilingue con un unico modelo, sin necesidad de cargar un modelo distinto por idioma.
- Procesamiento por lotes (batch), no en streaming.
- Manejo de grabaciones largas mediante ventanas solapadas de 60 s con 25 % de solapamiento (configurable a 30 s).
- Inferencia en dispositivo y en el borde con consumo de memoria moderado (pico de 534 MiB con audio de 10 s).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio de salida segun la informacion disponible.

## Casos de uso

- Dictado y transcripcion en aplicaciones moviles: el modelo cabe en un telefono con un pico de 534 MiB y una latencia de 633 ms en un Galaxy S26 Ultra, lo que permite transcribir notas de voz localmente sin enviar audio a la nube.
- Subtitulado offline de reuniones y entrevistas: el motor procesa grabaciones largas en ventanas de 60 s con solapamiento, manteniendo el pico de memoria por debajo de 2 GB en sesiones de 10 a 30 minutos.
- Asistentes de voz con privacidad por diseno: al ejecutarse en el dispositivo, el audio no sale del terminal, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Transcripcion en aplicaciones de campo o sin conectividad: el modelo no depende de red y funciona en telefonos de gama alta reciente con SoC como Tensor G4 o A16.
- Indexado y busqueda de contenido hablado: transcripcion por lotes de archivos de audio para generar transcripciones buscables en ocho idiomas europeos.
- Prototipado rapido con el motor Parakeet: la CLI permite transcribir un WAV con un solo comando, lo que facilita la evaluacion y la integracion en pipelines de investigacion.
- Aplicaciones de accesibilidad: conversion de voz a texto local en tiempo de ejecucion con factor de tiempo real de 0,052, adecuado para interfaces de dictado.

## Benchmarks y rendimiento

El autor no publica en esta model card resultados de benchmarks de precision (WER, MMLU, etc.) para esta build; remite a la model card del modelo base. Si se publican datos de rendimiento en dispositivo:

| Dispositivo | SoC | Latencia de inferencia (ms) | Arranque en frio (ms) | Pico de memoria a 10 s (MiB) |
|---|---|---|---|---|
| Galaxy S26 Ultra | 8 Elite Gen5 | 633 | 213 | 530 |
| Galaxy S25 Ultra | 8 Elite | 771 | 241 | 533 |
| iPhone 17 Pro Max | A19 Pro | 1.059 | 153 | 542 |
| iPhone 15 | A16 | 854 | 221 | 537 |
| Pixel 10 | Tensor G5 | 1.240 | 327 | 530 |
| Pixel 9 | Tensor G4 | 1.570 | 356 | 530 |

Las cifras son la media de las tres mejores de cinco ejecuciones repetidas sobre un conjunto de 160 enunciados extraidos al azar de Multilingual LibriSpeech (20 por idioma, ocho idiomas, 40 minutos de audio en total). El autor reporta ademas un factor de tiempo real medio de 0,052. No se han publicado resultados de benchmarks de precision (WER) en la informacion disponible.

## Requisitos de hardware

- VRAM y memoria: pico de 534 MiB con audio de 10 s en los telefonos medidos; por debajo de 2 GB en grabaciones de 10 a 30 minutos gracias al procesamiento por ventanas.
- Tamano del modelo: 305 MB en Q8_0, lo que permite cargarlo en memoria de dispositivos moviles de gama alta.
- GPU recomendadas: no se especifican GPU de escritorio en la informacion disponible; las mediciones se realizan sobre SoC moviles (Snapdragon 8 Elite Gen5 y 8 Elite, Apple A19 Pro y A16, Google Tensor G5 y G4).
- Cabe en GPU de consumo: no disponible como dato explicito; el modelo esta disenado para ejecucion en CPU/NPU de telefonos.
- Opciones de despliegue: motor Parakeet de qvac-fabric-speech.cpp (CLI y API C++); existe una build Core ML para el Neural Engine de Apple silicon. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real medio de 0,052 y latencia media de 1.021 ms en los seis dispositivos medidos; arranque en frio medio de 252 ms.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Parametros | Licencia | Uso previsto |
|---|---|---|---|---|---|
| TranscribePsy-250M-EU-sub-gguf | 8 | GGUF (Q8_0) | 283 M | Apache 2.0 | On-device con motor Parakeet |
| TranscribePsy-250M-EU-sub | 8 | PyTorch | 283 M | Apache 2.0 | Referencia en PyTorch, menor error |
| TranscribePsy-250M-EU | 25 | PyTorch | 283 M | Apache 2.0 | Cobertura amplia de idiomas europeos |
| TranscribePsy-250M-EU-sub-coreml | 8 | Core ML | 283 M | Apache 2.0 | Neural Engine de Apple |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la informacion proporcionada; el autor situa el modelo base en la frontera de Pareto de tamano y WER de la pista multilingue de la Open ASR Leaderboard.

## Limitaciones y advertencias

- Solo cubre ocho idiomas; no transcribe otros idiomas europeos ni lenguas no europeas.
- Transcripcion por lotes, no en streaming: no es adecuada para reconocimiento en tiempo real continuo.
- El motor no remuestrea audio; es obligatorio convertir a WAV mono de 16 kHz antes de la inferencia.
- El procesamiento de grabaciones largas consume memoria creciente con la duracion; el autor recomienda ventanas de 60 s o de 30 s en dispositivos con poca memoria.
- El autor declara explicitamente que el modelo no esta pensado para decisiones automatizadas criticas para la seguridad ni de alto riesgo.
- No se detallan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del motor qvac-fabric-speech.cpp, que es software independiente del modelo.
- Las cifras de latencia y memoria proceden de mediciones del propio autor sobre seis telefonos; pueden variar en otros dispositivos y condiciones termicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Modelo base: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Version con cobertura de 25 idiomas: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Build Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Motor qvac-fabric-speech.cpp: https://github.com/tetherto/qvac-fabric-speech.cpp
- Motor Parakeet: https://github.com/tetherto/qvac-fabric-speech.cpp/tree/master/engines/parakeet
- Guia de compilacion: https://github.com/tetherto/qvac-fabric-speech.cpp/blob/master/engines/parakeet/docs/build.md
- Flags de ventana larga: https://github.com/tetherto/qvac-fabric-speech.cpp/blob/master/engines/parakeet/docs/cli.md#long-form-window-flags
- Paper CAFE: https://arxiv.org/abs/2610.19134
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
