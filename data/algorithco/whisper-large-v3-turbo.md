# algorithco/whisper-large-v3-turbo

## Resumen

algorithco/whisper-large-v3-turbo es una redistribucion del modelo Whisper large-v3-turbo de OpenAI, publicado en el Hub de HuggingFace bajo el identificador del usuario algorithco. Se trata de un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz, basado en el checkpoint openai/whisper-large-v3, del que hereda la arquitectura y los pesos del encoder, pero con el decoder podado de 32 a 4 capas. El resultado es un modelo de aproximadamente 809 millones de parametros (808.878.080 segun los pesos safetensors) que mantiene la calidad de transcripcion del large-v3 con una degradacion menor, a cambio de una velocidad de inferencia muy superior.

El modelo resuelve dos tareas principales: transcripcion de audio a texto en el mismo idioma de la fuente y traduccion de audio a texto en ingles. Es un modelo multilingue que cubre 99 idiomas segun la model card, incluyendo castellano, catalan, euskera y gallego, ademas de las principales lenguas europeas, asiaticas y africanas. Soporta marcas de tiempo a nivel de frase y a nivel de palabra, lo que lo hace util para subtitulado y alineacion.

Su relevancia actual radica en que ofrece un equilibrio poco habitual entre cobertura multilingue y coste computacional: al reducir el decoder a 4 capas, la fase de decodificacion autoregresiva se acelera de forma notable, y el modelo cabe en GPUs de consumo con cuantizacion en int8 o int4. La licencia MIT del repositorio facilita su integracion en productos comerciales sin las restricciones habituales de otros modelos ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con atencion, tipo Whisper |
| Parametros totales | 808.878.080 (~809 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento; secuencia de salida de hasta 448 tokens |
| Tipos de cuantizacion | El repositorio solo contiene safetensors en fp32/fp16; cuantizaciones int8/int4 y GGUF no disponibles en este repositorio (habitualmente generables mediante bitsandbytes, CTranslate2 o whisper.cpp) |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder entrenado sobre representaciones log-Mel del audio. El encoder procesa ventanas de 30 segundos de audio muestreado a 16 kHz y las proyecta a una secuencia de estados ocultos; el decoder genera texto de forma autoregresiva condicionado por esos estados. Whisper large-v3-turbo mantiene el encoder completo del large-v3 (32 capas, d_model 1280, 20 cabezas de atencion aproximadamente) y reduce el decoder de 32 a 4 capas, que es la causa directa de la ganancia de velocidad y de la ligera perdida de calidad. El sistema de tokenizacion incluye tokens especiales para idioma, tarea (transcribe/translate), marcas de tiempo y ausencia de habla.

El entrenamiento original de la familia Whisper se realizo sobre mas de 5 millones de horas de audio etiquetado, con una supervision debil y heterogenea que le confiere una capacidad de generalizacion zero-shot notable a dominios y datasets no vistos. Esta redistribucion concreta se describe como un finetune del checkpoint openai/whisper-large-v3 y no aporta informacion adicional sobre datos de ajuste, uso de RLHF/DPO ni hiperparametros; en la informacion disponible no se detalla el procedimiento de ajuste especifico de este repositorio. Entre las innovaciones heredadas destacan el fallback por temperatura, el condicionamiento sobre tokens previos y el umbral de compresion para detectar alucinaciones, todos ellos configurables en la generacion.

## Capacidades

- Transcripcion automatica de voz a texto multilingue en 99 idiomas, incluyendo castellano, catalan, gallego, euskera e ingles.
- Traduccion de voz a texto en ingles (tarea `translate`) desde cualquiera de los idiomas soportados.
- Deteccion automatica del idioma de origen, o especificacion manual mediante el parametro `language`.
- Generacion de marcas de tiempo a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`).
- Procesamiento de audio de longitud arbitraria mediante segmentacion en ventanas de 30 segundos.
- Decodificacion con heuristicas anti-alucinacion: fallback por temperatura, umbral de ratio de compresion, umbral de log-probabilidad y umbral de ausencia de habla.
- Procesamiento por lotes (`batch_size`) para transcribir varios archivos en paralelo.
- Integracion con el pipeline `automatic-speech-recognition` de transformers y compatibilidad con la API de `generate` para control fino.

## Casos de uso

- Subtitulado automatico de video: el modelo permite obtener marcas de tiempo a nivel de palabra y de frase, lo que resulta adecuado para generar archivos SRT o VTT con sincronizacion fina en contenidos multilingues.
- Transcripcion de reuniones y llamadas: con ventanas de 30 segundos y procesamiento por lotes, se puede transcribir audio de larga duracion sin intervencion manual, detectando el idioma de cada participante.
- Atencion al cliente basada en voz: la transcripcion en tiempo real de llamadas permite alimentar sistemas de analitica, busqueda de texto completo y clasificacion de incidencias, con cobertura de idiomas europeos y del castellano.
- Indexacion y busqueda de archivos de audio: convertir podcasts, entrevistas o archivos de radio a texto facilita la busqueda semantica y la generacion de resumentes posteriores con un LLM.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones y subtitulos en directo o en diferido en multiples idiomas con licencia MIT, lo que reduce las barreras legales para su despliegue.
- Traduccion de contenido audiovisual: la tarea `translate` permite generar transcripciones en ingles a partir de audio en otros idiomas, util para doblaje, localizacion o publicacion internacional.
- Analisis de centros de llamadas: transcripcion masiva de grabaciones para cumplimiento normativo, deteccion de palabras clave y control de calidad, con coste computacional reducido gracias al decoder ligero.
- Asistentes de voz embebidos: al caber en GPUs de consumo e incluso en CPU con cuantizacion, el modelo puede desplegarse en el borde para dictado y comandos de voz sin dependencia de la nube.
- Investigacion en linguistica computacional: la cobertura de 99 idiomas y el comportamiento zero-shot permiten usarlo como linea base para estudios comparativos de ASR en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de WER (Word Error Rate) ni comparativas numericas con otros modelos, y los resultados de busqueda web proporcionados no contienen datos tecnicos relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,6-2,0 GB solo para los pesos, mas memoria para activaciones y cache de decodificacion; en la practica 2-3 GB.
- VRAM estimada en fp32: aproximadamente 3,2 GB para los pesos, mas activaciones.
- VRAM estimada en int8: alrededor de 0,9-1,2 GB; en int4, alrededor de 0,5-0,8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema; en A100/H100 el cuello de botella pasa a ser la E/S de audio y el preprocesado, no la GPU.
- Cabe en GPU de consumo: si. Con cuantizacion int8 o int4 puede ejecutarse en GPUs de gama baja e incluso en CPU.
- Opciones de despliegue: transformers con el pipeline `automatic-speech-recognition`, faster-whisper (CTranslate2, requiere conversion de formato), whisper.cpp (requiere conversion a GGUF), OpenVINO para CPU Intel y vLLM para servir el modelo a traves de una API compatible con OpenAI. TGI no es una opcion habitual para este tipo de modelo ASR.
- Latencia y throughput: no disponibles como cifras concretas en la informacion proporcionada. La reduccion del decoder de 32 a 4 capas es la causa de la mejora de velocidad respecto a large-v3 descrita en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Capas de decoder | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| algorithco/whisper-large-v3-turbo (este) | ~809 M | 4 | 99 | MIT | HuggingFace |
| openai/whisper-large-v3 | ~1.540 M (dato publico) | 32 | 99 | MIT | HuggingFace y API de OpenAI |
| openai/whisper-large-v2 | ~1.540 M (dato publico) | 32 | 99 | MIT | HuggingFace |
| distil-whisper/distil-large-v3 | ~756 M (dato publico) | 2 | en (principalmente) | MIT | HuggingFace |

El modelo de este repositorio comparte arquitectura y licencia con la familia Whisper de OpenAI, por lo que la eleccion entre variantes depende del equilibrio entre latencia y calidad de transcripcion. Las cifras de parametros de los modelos comparados provienen de datos publicos ampliamente conocidos y no de la informacion proporcionada en esta busqueda, por lo que conviene verificarlas en sus respectivas model cards.

## Limitaciones y advertencias

- La reduccion del decoder de 32 a 4 capas implica una degradacion de calidad respecto a openai/whisper-large-v3; la propia model card la califica como "menor", pero puede ser relevante en audio con ruido, acentos marcados o jerga tecnica.
- Riesgo de alucinacion en segmentos sin habla o con musica: se recomienda activar `no_speech_threshold`, `compression_ratio_threshold` y `logprob_threshold` para mitigarlo.
- El modelo no genera puntuacion garantizada ni formato consistente en todos los idiomas; la calidad varia notablemente entre lenguas con muchos datos (ingles, castellano, frances) y lenguas de bajos recursos.
- La ventana de procesamiento esta limitada a segmentos de 30 segundos, lo que obliga a segmentar el audio y puede fragmentar frases largas si no se gestiona con solapamiento.
- El modelo es exclusivamente de audio a texto; no procesa texto de entrada ni mantiene conversaciones, ni realiza tool calling ni razonamiento multi-paso.
- Este repositorio concreto tiene 0 descargas y 0 likes en el momento de redactar la ficha y fue creado por un usuario distinto de OpenAI; conviene verificar la integridad de los pesos frente al checkpoint oficial openai/whisper-large-v3-turbo antes de usarlo en produccion.
- No se documenta en la informacion disponible el procedimiento de ajuste ni los datos adicionales usados por el autor de esta redistribucion, lo que dificulta evaluar posibles desviaciones respecto al modelo original.
- Aunque la licencia del repositorio es MIT, el uso comercial de modelos derivados de Whisper debe revisarse tambien respecto a las condiciones del modelo base original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/algorithco/whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper original de Whisper (Radford et al., 2022): https://huggingface.co/papers/2212.04356 (arXiv:2212.04356)
- Discusion en GitHub sobre large-v3-turbo: https://github.com/openai/whisper/discussions/2363
- Repositorio de referencia de OpenAI Whisper: https://github.com/openai/whisper
- Ejemplos de audio del widget: https://cdn-media.huggingface.co/speech_samples/sample1.flac y https://cdn-media.huggingface.co/speech_samples/sample2.flac
