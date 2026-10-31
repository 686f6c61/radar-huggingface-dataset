# litert-community/LFM3-Audio-2B-LiteRT

## Resumen

LFM3-Audio-2B-LiteRT es la conversión cuantizada, para ejecución en el dispositivo (on-device), del modelo de audio LFM3-Audio-2B de Liquid AI, publicada por el equipo de LiteRT Community de Google. El modelo original es un modelo any-to-any de unos 2.000 millones de parámetros que acepta texto o voz como entrada y genera texto, voz o ambos: permite reconocimiento de voz (ASR), síntesis de voz (TTS), chat por voz, preguntas sobre grabaciones de audio y llamadas a herramientas (tool calling).

Esta versión empaqueta todo el modelo en un único fichero `.litertlm` (1,53 GB) que se ejecuta con LiteRT-LM 0.18.1 en terminales Android y en Mac, sin conexión de red. Es relevante porque demuestra que un modelo de audio multimodal completo (comprensión y generación de voz) puede correr en un teléfono móvil de gama alta con latencias casi en tiempo real: en un Galaxy S26 genera 40,6 tokens por segundo por GPU y sintetiza un segundo de voz en 0,40 segundos.

La variante LiteRT mantiene las capacidades del modelo base (LiquidAI/LFM3-Audio-2B), aunque la validación publicada se ha limitado al inglés, y la salida de voz requiere que la aplicación implemente un bucle adicional con cuatro grafos TFLite complementarios, ya que LiteRT-LM por sí solo solo produce texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de audio any-to-any (LFM3 de Liquid AI); detalles internos no disponibles en la ficha |
| Parametros totales | no disponible (el modelo base es de 2B segun su denominacion) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 2.048 tokens (en el fichero `.litertlm` publicado) |
| Tipos de cuantizacion | int4 (decoder), int8 (embedder), fp16 (pesos lineales del encoder de audio), fp32 (decoder del codec de audio) |
| Idiomas soportados | 18 idiomas para transcripcion, sintesis y traduccion segun la ficha del modelo base; chat por voz solo en ingles; la variante LiteRT solo esta validada en ingles |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | `.litertlm` (LiteRT-LM) y grafos `.tflite`; cuantizado a partir de LiquidAI/LFM3-Audio-2B |

## Arquitectura y entrenamiento

El modelo base es LFM3-Audio-2B de Liquid AI, un modelo any-to-any que procesa texto o voz de entrada y genera texto, voz o ambas modalidades. En la variante LiteRT, el decoder del modelo se cuantiza a int4, el embedder a int8 y el encoder de audio conserva pesos lineales en fp16. El encoder de audio procesa ventanas fijas de 30 segundos (una ventana completa tarda lo mismo que un clip corto).

Para la salida de voz, LiteRT-LM no es suficiente: en modo speech, la siguiente entrada del decoder es un embedding (la suma de 12 embeddings de codebook) que LiteRT-LM no puede inyectar. Por ello, la aplicacion debe ejecutar un bucle propio con cuatro grafos TFLite adicionales: una proyeccion del estado oculto del decoder (una vez por fotograma de 80 ms), un depth decoder cuya pasada se repite tres veces para revelar los 12 codigos de cada fotograma, un frame embedder que convierte esos 12 codigos en la siguiente entrada del decoder, y un decoder de codec de audio que transforma 12 fotogramas (0,96 s) de codigos en audio a 24 kHz.

No se dispone de informacion sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset o uso de RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Reconocimiento de voz (ASR): transcripcion de audio a texto.
- Sintesis de voz (TTS): generacion de audio hablado a partir de texto.
- Chat por voz: conversacion oral con respuestas habladas (solo en ingles segun la ficha del modelo base).
- Preguntas sobre grabaciones: razonamiento sobre contenido de audio (por ejemplo, resumir o responder sobre una grabacion).
- Tool calling: capacidad de invocar herramientas, segun la ficha del modelo base.
- Entrada mixta texto/voz y salida mixta texto/voz (any-to-any).
- 18 idiomas para transcripcion, sintesis y traduccion (modelo base); solo ingles validado en la variante LiteRT.
- Ejecucion totalmente offline en Android y Mac, sin conexion de red.

## Casos de uso

- Transcripcion offline en movil: una app Android puede transcribir notas de voz sin enviar audio a la nube, procesando ventanas de 30 s en 94,4 ms por GPU en un Galaxy S26 (3,1 ms por segundo de audio).
- Asistente de voz en el dispositivo: chat por voz con respuestas habladas y latencia del primer audio de 0,71 s en Galaxy S26, adecuado para asistentes que respeten la privacidad del usuario.
- Accesibilidad: subtitulado en tiempo real o lectura de textos en voz alta para personas con discapacidad auditiva o visual, sin dependencia de red.
- Traduccion de voz: el modelo base soporta traduccion entre 18 idiomas (por ejemplo, transcribir y traducir una conversacion), aunque no validado en la variante LiteRT.
- Analisis de grabaciones: responder preguntas sobre el contenido de una grabacion (reuniones, llamadas) localmente en el telefono o en un Mac.
- Automatizacion con herramientas: un agente de voz en el dispositivo que, ademas de conversar, ejecuta tool calls (por ejemplo, crear recordatorios a partir de una instruccion hablada).
- Prototipado en Mac: desarrollo y pruebas locales en Apple Silicon (M4 Max) con 167,88 tokens/s por GPU via WebGPU antes de desplegar en movil.

## Benchmarks y rendimiento

La ficha publica mediciones propias de la conversion LiteRT (no benchmarks academicos tipo MMLU o HumanEval). No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

**Galaxy S26** (Snapdragon SM8850, Android 16):

| Tarea | Ejecucion | Resultado |
|---|---|---|
| Texto: prompt de 1.024 tokens + 256 generados | GPU | prefill 1.295,4 tokens/s; decode 40,61 tokens/s; primer token en 0,81–0,82 s |
| Entrada de audio: ventana de 30 s | GPU | 94,4 ms por ventana (3,1 ms por segundo de audio) |
| Salida de voz (app Android) | decoder CPU, depth decoder NPU, codec GPU | 0,40 s por segundo de voz (factor tiempo real 0,44); primer audio en 0,71 s |

**Pixel 8a** (Tensor G3, Android 16):

| Tarea | Ejecucion | Resultado |
|---|---|---|
| Texto: respuestas a preguntas cortas | GPU | decode 12,95 tokens/s (mediana de 7 respuestas); primer token en 1,14 s |
| Entrada de audio: ventana de 30 s | GPU | 360,7 ms por ventana (12 ms por segundo de audio) |
| Salida de voz (app Android) | decoder y depth decoder CPU, codec GPU | 1,37 s por segundo de voz (factor tiempo real 1,45); primer audio en 2,06 s |

**Mac** (Apple M4 Max, texto: prompt de 1.024 tokens + 256 generados):

| Ejecucion | Prefill (tokens/s) | Decode (tokens/s) | Primer token |
|---|---:|---:|---:|
| GPU (WebGPU) | 3.898 | 167,88 | 0,27 s |
| CPU | 354 | 64,19 | 2,90 s |

En el Galaxy S26, la ejecucion de texto por GPU alcanzo un pico de 951–975 MiB de memoria de proceso mas 2,08 GB de memoria GPU.

## Requisitos de hardware

- El fichero principal `.litertlm` ocupa 1,53 GB; para salida de voz hay que anadir los cuatro grafos TFLite (100,7 MB + 334,1 MB o 169,6 MB + 198,3 MB + 152,5 MB), es decir, algo menos de 800 MB adicionales.
- Android: validado en Galaxy S26 (Snapdragon SM8850, con NPU para el depth decoder) y Pixel 8a (Tensor G3). En el Galaxy S26 se necesitan unos 2,08 GB de memoria GPU ademas de ~1 GB de proceso.
- Mac: validado en Apple M4 Max, por GPU (WebGPU) y CPU. No hay datos para GPUs NVIDIA de escritorio ni para consumer GPUs Windows/Linux.
- En telefonos de gama media como el Pixel 8a el modelo es utilizable (12,95 tokens/s en texto), pero la sintesis de voz no llega a tiempo real (factor 1,45).
- Despliegue mediante LiteRT-LM 0.18.1 y LiteRT 2.3.0; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI. La salida de voz requiere implementar el bucle de inferencia en la propia aplicacion (por ejemplo, en una app Android).
- Latencias de referencia: primer token en 0,27 s (M4 Max GPU) a 1,14 s (Pixel 8a); primer audio en 0,71 s (Galaxy S26) a 2,06 s (Pixel 8a).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Audio-2B-LiteRT | ~2B | 2.048 tokens | texto/audio de entrada; texto/audio de salida | LFM Open License v1.0 | `.litertlm` + `.tflite`, on-device (Android, Mac) |
| LiquidAI/LFM3-Audio-2B (base) | ~2B | no disponible | texto/audio de entrada; texto/audio de salida | LFM Open License v1.0 | pesos originales en HuggingFace |
| Whisper (OpenAI) | 0,4B–1,5B aprox. segun version | 30 s por ventana | audio de entrada; texto de salida (solo ASR/traduccion) | MIT | multiples formatos, on-device y servidor |

No se dispone de datos de rendimiento comparativos directos publicados para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La variante LiteRT solo esta validada en ingles; los 18 idiomas del modelo base (transcripcion, sintesis, traduccion) no han sido verificados en esta conversion.
- El chat por voz solo esta soportado en ingles segun la ficha del modelo base.
- El encoder de audio siempre procesa ventanas completas de 30 s: un clip corto tarda lo mismo que uno de 30 s.
- LiteRT-LM no genera voz por si solo: la aplicacion debe implementar el bucle de speech con los cuatro grafos adicionales, lo que anade complejidad de integracion.
- El grafo del depth decoder precompilado para NPU solo funciona en el Snapdragon SM8850 (Galaxy S26); en otros dispositivos se ejecuta por CPU, con penalizacion de rendimiento (factor tiempo real 1,45 en Pixel 8a).
- La salida de voz usa el decoder por CPU en los telefonos (salvo el codec por GPU), lo que limita el throughput en gama media.
- Contexto de solo 2.048 tokens, insuficiente para conversaciones muy largas o audios extensos.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la documentacion proporcionada.
- La licencia es LFM Open License v1.0 (no una licencia estandar tipo Apache/MIT): hay que revisar sus terminos antes de uso comercial.
- Algunas mediciones se hicieron con una copia del fichero que difiere solo en la plantilla de chat (anade un system turn "Perform ASR in English." cuando la conversacion empieza con audio), un detalle relevante al reproducir los resultados.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Licencia LFM v1.0: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT/blob/main/LICENSE
