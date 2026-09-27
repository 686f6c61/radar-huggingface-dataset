# raspbfox/parakeet-ultra-litert-dynamic-int8

## Resumen

Parakeet Ultra LiteRT dynamic INT8 es una conversion experimental del modelo de reconocimiento automatico del habla moondream/parakeet-ultra a formato LiteRT/TFLite con cuantizacion dinamica de pesos a INT8. Lo publica el usuario raspbfox y su objetivo es ejecutar un modelo ASR de 0.6B parametros en CPU sin GPU, empleando una ventana de audio fija de 10 segundos. El modelo original, Parakeet Ultra, es una version post-entrenada de parakeet-tdt-0.6b-v3 que conserva la misma arquitectura, el mismo tokenizador y los mismos 0.6B parametros en precision completa.

La relevancia de esta ficha reside en que demuestra una ruta de despliegue en el borde (edge) para ASR multilingue: el repositorio ocupa 0.6 GB y separa el modelo en dos grafos TFLite, un encoder de 598.896.864 bytes y un decoder de 18.549.488 bytes. Los pesos se cuantizan a INT8 mientras que las entradas y salidas publicas permanecen en float32, un esquema etiquetado como `dynamic_wi8_afp32`. Es, por tanto, una pieza de infraestructura de inferencia mas que un modelo nuevo entrenado desde cero.

El modelo cubre 25 idiomas, entre ellos el castellano, y esta pensado para transcripcion en dispositivos con CPU. Conviene subrayar que el autor lo describe como experimental: solo se ha validado con un unico clip de referencia en ingles en una prueba de humo sobre Flutter con LiteRT en Linux, y no se ha comprobado su rendimiento en Android ni su precision multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer) heredada de parakeet-tdt-0.6b-v3; encoder + decoder separados en dos grafos LiteRT |
| Parametros totales | 0.6B (segun el modelo base moondream/parakeet-ultra) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR); ventana de audio fija de 10 segundos |
| Tipos de cuantizacion | Pesos INT8, activaciones float32 (`dynamic_wi8_afp32`) |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | cc-by-4.0 |
| Formato de pesos | TFLite / LiteRT (`encode_quantized.tflite`, `decode_quantized.tflite`) |

Detalles de los grafos:

| Grafo | Tamano | Entradas | Salidas |
|---|---|---|---|
| encode_quantized.tflite | 598.896.864 bytes | `[1,128,1001]` | `[1,1024,126]` |
| decode_quantized.tflite | 18.549.488 bytes | salida del encoder + ID de token float + dos estados `[2,1,640]` | logits `[1,126,1,8198]` + estados |

Vocabulario del decoder: 8198 tokens. Dimension oculta del encoder: 1024.

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo nuevo, sino que convierte y cuantiza el checkpoint moondream/parakeet-ultra. Los pesos proceden del checkpoint NeMo de Olicorne (`Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`, SHA-256 `91b81b3c09a335baa53208c6c70c97aed1c1165df71a51057f26232de33135da`). La conversion se realizo con el script de exportacion de Vibro (`tools/parakeet_litert_smoke/python/export_split_int8.py`) usando LiteRT-Torch en el commit `4502654d6afe38b495d2efe8dcd37e057d0c5e7f` y el esquema `dynamic_wi8_afp32`.

El modelo base, Parakeet Ultra, es una version post-entrenada de parakeet-tdt-0.6b-v3 con la misma arquitectura, el mismo tokenizador y los mismos 0.6B parametros en precision completa. Segun el blog de Moondream, Parakeet Ultra conserva los pesos de precision completa y mejora la precision de transcripcion mediante entrenamiento adicional, con mejoras reportadas en el conjunto FLEURS de 25 idiomas, en audio con ruido de fondo y en audio de formato largo, ademas de ejecutarse mas rapido que el original en NeMo. La conversion aqui descrita no anade entrenamiento: unicamente reorganiza el grafo en dos modulos y aplica cuantizacion INT8 de pesos. Requiere un frontend log-mel compatible con NeMo a 16 kHz y el tokenizador v3 original.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 25 idiomas, incluidos el castellano, el aleman, el frances, el italiano, el portugues, el ruso, el ucraniano y buena parte de las lenguas eslavas, balticas, nordicas y del este de Europa.
- Transcripcion con ventana de audio fija de 10 segundos por pasada.
- Hereda del modelo base un comportamiento robusto ante ruido de fondo y audio de formato largo, aunque esas capacidades no se han validado en esta conversion cuantizada.
- Inferencia en CPU, sin necesidad de GPU, gracias al formato TFLite/LiteRT y a los pesos INT8.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es exclusivamente un modelo de transcripcion.
- No tiene capacidades de vision, audio-audio ni thinking mode.
- No se ha validado su precision multilingue en esta version convertida.

## Casos de uso

- Transcripcion en dispositivos sin GPU: el modelo se ejecuta sobre la CPU de un equipo Linux o Mac mediante LiteRT, con un peso total de aproximadamente 0.6 GB, lo que lo hace adecuado para portatiles modestos o entornos de escritorio.
- Aplicaciones de dictado con ventana corta: al operar con fragmentos fijos de 10 segundos, encaja en escenarios de dictado por turnos o notas de voz donde el audio se segmenta previamente.
- Procesamiento de audio con requisitos de privacidad: al ejecutarse localmente y sin llamadas a servicios externos, permite transcribir reuniones o notas clinicas sin enviar el audio a la nube, con la licencia cc-by-4.0 como unica condicion.
- Integracion en aplicaciones Flutter de escritorio: el autor valida una prueba de humo sobre Flutter con LiteRT en Linux, de modo que sirve como punto de partida para apps de escritorio multiplataforma escritas en Dart.
- Generacion de subtitulos en pipeline por lotes: segmentando el audio en bloques de 10 segundos y encadenando el encoder y el decoder, se pueden producir transcripciones en 25 idiomas para archivos de video.
- Prototipado de ASR embebido: por su tamano y formato, es util para evaluar el consumo de recursos y la latencia en dispositivos de gama baja antes de invertir en una solucion de produccion.
- Investigacion sobre cuantizacion dinamica: al exponer la separacion entre encoder y decoder y el esquema `dynamic_wi8_afp32`, sirve como banco de pruebas para medir la perdida de precision asociada a INT8 en modelos transducer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que un unico clip de referencia en ingles se transcribio correctamente en una prueba de humo sobre Flutter LiteRT en Linux CPU, y que el modelo no esta validado para rendimiento en Android ni para precision multilingue. El modelo base (moondream/parakeet-ultra) si reporta mejoras frente a parakeet-tdt-0.6b-v3 en el conjunto FLEURS de 25 idiomas, en ruido de fondo y en audio largo, pero no se aportan cifras concretas.

## Requisitos de hardware

- Almacenamiento de pesos: aproximadamente 617 MB en total (encoder 598.896.864 bytes, decoder 18.549.488 bytes); el repositorio ocupa 0.6 GB.
- Memoria estimada en inferencia: del orden de 1 a 2 GB de RAM, teniendo en cuenta los pesos INT8, las activaciones float32 y el runtime de LiteRT. Cifra estimada, no confirmada por el autor.
- CPU: el modelo esta disenado para inferencia en CPU, sin requisitos de GPU. Se ha probado en Linux CPU a traves de Flutter.
- GPU: no se recomienda ni se documenta un despliegue en GPU; el formato TFLite/LiteRT apunta a aceleracion por CPU o por delegados especificos de LiteRT.
- Compatibilidad con GPU de consumo: no aplica en su forma actual; el objetivo es ejecucion en CPU.
- Opciones de despliegue: runtime LiteRT / TensorFlow Lite (Android, Linux u otros), integracion via Flutter en escritorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que son runtimes orientados a modelos de lenguaje, no a este grafo TFLite.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad para esta conversion.
- Requisitos adicionales: frontend log-mel compatible con NeMo a 16 kHz y el tokenizador v3 original.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Ventana de audio | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| raspbfox/parakeet-ultra-litert-dynamic-int8 | 0.6B | TFLite, INT8 | 10 s fijos | 25 | cc-by-4.0 | Conversion experimental, poco validada |
| moondream/parakeet-ultra | 0.6B | Precision completa (NeMo) | no disponible | 25 | no disponible | Modelo base post-entrenado |
| Parakeet Redux (moondream) | no disponible | Comprimido de 1.2 GB a 178 MB | no disponible | no disponible | no disponible | Optimizado para CPU y Mac |
| parakeet-tdt-0.6b-v3 | 0.6B | Precision completa (NeMo) | no disponible | 25 | no disponible | Modelo original pre-post-entrenamiento |

La comparacion directa se limita al base model y a los derivados citados en la busqueda. No hay datos de rendimiento cuantitativos para establecer diferencias de precision entre la version INT8 y el modelo en precision completa.

## Limitaciones y advertencias

- Modelo marcado explicitamente como experimental por el autor.
- Ventana de audio fija de 10 segundos: los audios mas largos deben segmentarse manualmente, lo que puede introducir errores en las fronteras entre fragmentos.
- Sin validacion multilingue: solo se ha comprobado un clip de referencia en ingles, pese a que el modelo declara 25 idiomas. La precision en castellano u otros idiomas no esta confirmada.
- Sin validacion de rendimiento en Android: la unica prueba documentada se realizo en Linux CPU.
- Riesgo de degradacion por cuantizacion: los pesos INT8 con activaciones float32 pueden reducir la precision frente al modelo en precision completa, aunque no se han publicado mediciones al respecto.
- Dependencia de componentes externos: requiere el frontend log-mel compatible con NeMo a 16 kHz y el tokenizador v3 original, lo que complica la integracion en aplicaciones que no dispongan de ese pipeline.
- Sin soporte de tool calling, agentes ni capacidades multimodales; no debe emplearse para tareas distintas de la transcripcion.
- Riesgo de alucinacion inherente a los modelos ASR: en audio con ruido, silencios largos o habla no cubierta por los datos de entrenamiento pueden aparecer transcripciones incorrectas o inventadas.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base moondream/parakeet-ultra, cuya licencia no se detalla en la informacion disponible.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raspbfox/parakeet-ultra-litert-dynamic-int8
- Modelo base moondream/parakeet-ultra: https://huggingface.co/moondream/parakeet-ultra
- Checkpoint NeMo de origen (Olicorne): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Script de exportacion de Vibro: https://github.com/skyne98/vibro/blob/main/tools/parakeet_litert_smoke/python/export_split_int8.py
- Blog de Moondream sobre Parakeet Redux y Parakeet Ultra: https://moondream.ai/blog/introducing-parakeet-redux-and-ultra
- Conversion relacionada de raspbfox (parakeet-tdt-0.6b-v3): https://huggingface.co/raspbfox/parakeet-tdt-0.6b-v3-litert-dynamic-int8
- Ficha de referencia de parakeet-tdt-0.6b-v3 en LiteRT INT8: https://free2aitools.com/model/aoiandroid/parakeet-tdt-0.6b-v3-litert-int8
