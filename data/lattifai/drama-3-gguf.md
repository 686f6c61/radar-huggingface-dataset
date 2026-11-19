# LattifAI/Drama-3-GGUF

## Resumen

Drama-3-GGUF es la version cuantizada en formato GGUF del modelo fishaudio/drama-3, un sistema de sintesis de voz (text-to-speech) desarrollado por Fish Audio que genera dialogos multi-hablante a 44,1 kHz a partir de texto. Esta ficha cubre la distribucion preparada por LattifAI para inferencia local mediante llama.cpp y EdgeSpeak, derivada de la revision `78e5ab79` del checkpoint original. El modelo esta pensado para producir conversaciones con multiples personajes, cada uno identificado mediante etiquetas `<|speaker:N|>` (de 0 a 15), con voces muestreadas de forma determinista segun la semilla.

La arquitectura combina un backbone Qwen3.5-MoE de 35B parametros totales con 3B activos, encargado de predecir el token semantico de cada frame de audio, con una torre de codebooks y un decoder/encoder Fish DAC incluidos en el fichero mmproj. El repositorio ofrece tres niveles de cuantizacion del backbone (4, 3 y 2 bits por peso) y un unico mmproj en Q8_0, con un tamano total de repo de 42,8 GB. Los pesos en safetensors del modelo original suman 26.618.557.056 parametros.

Su relevancia actual radica en que permite ejecutar localmente un modelo TTS de dialogos multi-personaje con clonacion de voz, sin depender de servicios alojados, con un rendimiento medido de aproximadamente 4,7 a 4,9 veces tiempo real en una RTX PRO 6000. La licencia Fish Audio Research License restringe el uso comercial, lo que condiciona su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5-MoE (transformer MoE) + torre de codebooks + decoder/encoder Fish DAC |
| Parametros totales | 26.618.557.056 (safetensors del modelo base); backbone descrito como 35B total / 3B activo |
| Parametros activos | 3B (backbone MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone: ~4 bpw (256 expertos), ~3 bpw (192 expertos), ~2 bpw (192 expertos); mmproj: Q8_0 (torre de codebooks), decoder/encoder F32/F16 |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-research-license (Fish Audio Community License, Version 1.0) |
| Formato de pesos | GGUF (llama.cpp) |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Tamano del repo | 42,8 GB |
| Ficheros backbone | `drama3-4bpw-k256.gguf` (17,34 GB), `drama3-3bpw-k192.gguf` (12,98 GB), `drama3-2bpw-k192.gguf` (8,65 GB) |
| Fichero mmproj | `mmproj-drama3-q8_0.gguf` (2,17 GB) |
| Modelo base | fishaudio/drama-3 (revision 78e5ab79) |

## Arquitectura y entrenamiento

El backbone es un transformer con mezcla de expertos (MoE) basado en Qwen3.5-MoE, con 35B parametros totales y 3B activos, que predice el token semantico de cada frame de audio. Las cuantizaciones de 3 y 2 bpw conservan 192 de los 256 expertos enrutados por capa y fijan `qwen35moe.expert_count = 192`, de modo que llama.cpp mainline las carga directamente. El fichero mmproj contiene la torre de codebooks que predice los 9 codebooks restantes, el decoder Fish DAC que convierte codigos en audio y el encoder de codec empleado para clonacion de voz; el sufijo del nombre (`q8_0`, `q5_k`, `q4_k`) indica unicamente el formato de la torre de codebooks, mientras que decoder y encoder son identicos en todos los mmproj.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la documentacion proporcionada. La innovacion tecnica destacable en esta distribucion es la separacion entre backbone y mmproj, que permite combinar cualquier backbone con cualquier mmproj, junto con la reduccion del numero de expertos en las cuantizaciones bajas para mantener la compatibilidad con llama.cpp mainline.

## Capacidades

- Generacion de voz multi-hablante: sintetiza dialogos con hasta 16 personajes distintos mediante etiquetas `<|speaker:N|>` (0 a 15).
- Audio a 44,1 kHz, orientado a calidad de broadcast.
- Clonacion de voz a partir de un clip de referencia de hasta 30 segundos, con transcripcion asociada.
- Voces muestreadas de forma determinista: la misma semilla (`-s`) y el mismo texto producen las mismas voces.
- Prediccion de tokens semanticos por frame de audio mediante backbone MoE.
- Conversion de codigos a audio mediante decoder Fish DAC.
- Integracion con llama.cpp (`llama-tts`) y con la aplicacion EdgeSpeak en modo Broadcast para asignar una voz de referencia distinta a cada personaje.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Produccion de audiolibros con dialogos: el modelo permite asignar voces distintas a cada personaje de un guion mediante las etiquetas `<|speaker:N|>`, generando audio a 44,1 kHz adecuado para publicacion.
- Doblaje y localizacion de contenido conversacional: con clonacion de voz a partir de clips de referencia de hasta 30 segundos, se pueden replicar voces de actores originales para escenas de dialogo.
- Prototipado de videojuegos con NPCs conversacionales: EdgeSpeak en modo Broadcast permite que cada personaje de un script use su propia voz de referencia, agilizando la generacion de lineas de voz antes de contratar interpretes.
- Generacion de contenido para podcasts y dramatizaciones: la ventana de contexto y el formato multi-hablante permiten sintetizar escenas completas con varios interlocutores en una sola pasada.
- Accesibilidad y audiolocalizacion de documentos: conversion de texto con estructura de dialogos en audio inteligible, ejecutandose localmente sin enviar contenido a servicios alojados.
- Investigacion en TTS y clonacion de voz: los tres niveles de cuantizacion (4, 3 y 2 bpw) permiten estudiar el compromiso entre fidelidad (KL divergence de 0,0196 a 0,0899) y requisitos de memoria en hardware consumer.
- Evaluacion de pipelines llama.cpp: al integrarse con `llama-tts` y exponer metricas de `llama-bench`, sirve como banco de pruebas para despliegues TTS locales.

## Benchmarks y rendimiento

Fidelidad del backbone frente al modelo BF16 en prompts reservados (evaluada solo en posiciones de respuesta), con torre de codebooks Q8_0 en el motor EdgeSpeak:

| Backbone | Tamano | KL divergence | Top-1 agreement | Content pass (clips) |
|---|---:|---:|---:|---:|
| 4 bpw, 256 expertos | 17,34 GB | 0,0196 | 0,899 | 145 / 146 |
| 3 bpw, 192 expertos | 12,98 GB | 0,0458 | 0,858 | 142 / 146 |
| 2 bpw, 192 expertos | 8,65 GB | 0,0899 | 0,805 | 145 / 146 |

El criterio "content pass" sintetiza cada uno de 146 textos reservados, transcribe el audio con ASR y lo compara con el texto de entrada; un clip se considera correcto si su tasa de error queda por debajo del umbral de su categoria. Las repeticiones varian en aproximadamente ±2 clips.

Rendimiento medido con `llama-bench` en una RTX PRO 6000 (sm_120), todas las capas en GPU (`-ngl 99`):

| Backbone | pp512 (t/s) | tg128 (t/s) |
|---|---:|---:|
| 4 bpw, 256 expertos | 10.825 | 274,2 |
| 3 bpw, 192 expertos | 11.070 | 235,7 |
| 2 bpw, 192 expertos | 9.513 | 228,6 |

De extremo a extremo, `llama-tts` genera audio a aproximadamente 4,7-4,9 veces tiempo real en esa GPU. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ya que el modelo es de sintesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 4 bpw ocupa 17,34 GB de pesos, el de 3 bpw 12,98 GB y el de 2 bpw 8,65 GB; a ello se suma el mmproj de 2,17 GB. Hay que anadir memoria para el contexto y buffers de calculo.
- GPU recomendadas: RTX PRO 6000 (sm_120) es la plataforma con metricas publicadas; por capacidad de memoria, tambien resultan adecuadas A100, H100 y RTX 4090 para las variantes de 3 y 2 bpw.
- Cabe en GPU consumer: la variante de 2 bpw (8,65 GB + 2,17 GB de mmproj) es la opcion mas ajustada para GPUs consumer de gama alta; la de 4 bpw requiere aproximadamente 19,5 GB solo en pesos.
- Opciones de despliegue: llama.cpp con el binario `llama-tts` y la aplicacion EdgeSpeak; la clonacion de voz exige una compilacion de llama.cpp que incluya el PR ggml-org/llama.cpp#32586 (abierto en el momento de redactar la model card).
- Latencia y throughput: en RTX PRO 6000, 274,2 t/s (tg128) con 4 bpw y 228,6 t/s con 2 bpw; generacion de audio a 4,7-4,9x tiempo real. No hay datos publicados para otras GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados comparativos con otros modelos TTS (parametros, contexto, rendimiento, licencia y disponibilidad de alternativas como XTTS, Fish Speech u otros sistemas de dialogos multi-hablante). Por tanto, la comparativa se limita a las tres variantes internas de esta distribucion:

| Variante | Parametros del backbone | Expertos | Tamano | KL divergence | Licencia |
|---|---|---|---|---|---|
| 4 bpw | 35B total / 3B activo | 256 | 17,34 GB | 0,0196 | fish-audio-research-license |
| 3 bpw | 35B total / 3B activo | 192 | 12,98 GB | 0,0458 | fish-audio-research-license |
| 2 bpw | 35B total / 3B activo | 192 | 8,65 GB | 0,0899 | fish-audio-research-license |

Comparativa con modelos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Licencia Fish Audio Research License (Fish Audio Community License, Version 1.0): uso de investigacion y no comercial, con un uso comercial limitado descrito en la licencia. Los servicios alojados no estan licenciados (seccion III(c)). Los ficheros son derivados del checkpoint original y conservan su licencia.
- En llama.cpp no se pueden elegir voces de forma explicita: cada personaje recibe una voz muestreada, reproducible solo fijando la misma semilla.
- La clonacion de voz admite un unico clip de referencia por peticion; en un dialogo, solo el personaje vinculado a la referencia usa la voz clonada.
- La referencia se asigna al hablante 0 salvo que su transcripcion empiece por otra etiqueta `<|speaker:N|>`.
- Solo se utilizan los primeros 30 segundos del clip de referencia.
- No existen voces predefinidas.
- La clonacion requiere una compilacion de llama.cpp con el PR #32586, abierto en el momento de redactar la model card, lo que introduce riesgo de incompatibilidad.
- La variante de 2 bpw presenta una KL divergence de 0,0899 y una top-1 agreement de 0,805, con perdida de fidelidad frente al BF16.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Longitud de contexto: no disponible, lo que limita la planificacion de guiones largos en una sola pasada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LattifAI/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de clonacion de voz en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32586
- EdgeSpeak: https://edgespeak.com/download
- Fichero de checksums: SHA256SUMS (incluido en el repositorio)
- Licencia: LICENSE (incluido en el repositorio)
- Aviso de modificacion de pesos: NOTICE (incluido en el repositorio)
- README en chino: README.zh-CN.md (incluido en el repositorio)
