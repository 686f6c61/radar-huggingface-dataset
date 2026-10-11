# cloud0day3/tts-contamination-detector

## Resumen

El tts-contamination-detector es un clasificador binario de audio publicado por el usuario cloud0day3 que detecta voz sintetica generada por sistemas TTS dentro de corpus de habla extraidos de la web. Se construye sobre el encoder preentrenado facebook/hubert-large-ll60k, que permanece congelado, y anade una unica capa logistica lineal entrenada sobre caracteristicas agrupadas: la media y la desviacion tipica de 8 capas ocultas, lo que da 16.384 valores por clip. La cabeza entrenable ocupa solo 197 kB de pesos, y todo el repositorio en safetensors suma 49.153 parametros almacenados.

El problema que resuelve es concreto y de actualidad: corpus como Emilia o YODAS se construyen raspando YouTube, y una parte de ese audio ya es sintetico (explicadores narrados con TTS, videos de listas, lectura de articulos, promociones de producto). Un modelo TTS entrenado con esos datos aprende la voz y los artefactos de otro sistema. Este modelo actua como filtro: puntua clips y agrega las decisiones por video o por voz, de modo que se puedan descartar videos o voces completas de un conjunto de entrenamiento.

En Emilia-YODAS English marco el 20,05% de las 21.206 horas puntuadas, y en una comprobacion de escucha a ciegas los 25 clips marcados que el oyente pudo juzgar resultaron ser TTS (intervalo del 95%: 86,7-100%). Se distribuye bajo licencia Apache-2.0 y esta pensado exclusivamente para curacion de datos, no para analisis forense ni deteccion de deepfakes clip a clip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder HuBERT-Large congelado (facebook/hubert-large-ll60k, revision ff022d09) mas cabeza logistica lineal |
| Parametros totales | 49.153 parametros almacenados en el repositorio safetensors (16.384 de peso, 1 de sesgo, 16.384 de media y 16.384 de escala); el encoder se descarga aparte |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 10 segundos de audio por clip (recorte central tras el preprocesado); la decision de video agrega multiples clips |
| Tipos de cuantizacion | float32 en el encoder (TF32 en CUDA) y conversion a float16 en el paso por la cabeza. No se publican variantes GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) mas config.json y el script de inferencia detector.py |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. La primera es un front end de audio: se toma el canal mono (media de canales), se recortan los frames iniciales y finales que esten 40 dB por debajo del frame mas fuerte (conservando 0,1 s antes y 0,2 s despues del habla), se retiene el fragmento central de 10 segundos y se remuestrea a 16 kHz mediante scipy.signal.resample_poly con el filtro FIR Kaiser del pipeline original. La segunda etapa es el encoder HuBERT-Large congelado, que procesa el audio normalizado por locucion y en lotes con mascara de atencion. De sus estados ocultos se extraen las capas 1, 3, 6, 9, 12, 15, 18 y 24, y por cada capa se calculan la media y la desviacion tipica de los frames, generando 16.384 numeros por clip. La cabeza calcula logit = clip(w · x + b, -12, 12) sobre esas caracteristicas, con la media y la escala del configuracion en 0 y 1 porque la capa se pliego sobre las caracteristicas en crudo.

El entrenamiento uso 254.685 clips con trazabilidad por clip. La parte sintetica son 16.800 clips de renders de 8 sistemas TTS abiertos: Kokoro, Chatterbox, VibeVoice 1.5B, Qwen3-TTS, Maya1, Zonos v0.1, OpenVoice v2 y MetaVoice, con voces integradas o referencias de clonacion de LibriTTS-R. La parte real procede de conjuntos permisivos: espnet/yodas2, MLCommons/peoples_speech, mythicinfinity/libritts_r y VCTK 0.92 (Edinburgh DataShare). No se uso audio de proveedores comerciales (ElevenLabs, Google, OpenAI ni otras API) ni grabaciones privadas. La decision a nivel de video es la media de las probabilidades de los clips ponderada por duracion (duraciones con suelo de 0,1 s) sobre un minimo de 3 clips puntuados, con umbral de 0,32. El autor publica equivalence.json: sobre 334 clips de Emilia-YODAS (24 videos completos de dos shards), el port reproduce el pipeline bit a bit; frente a los logits guardados, la mayor diferencia es de 0,018 logits (media 0,0011) y todas las decisiones a 0,32 y 0,54 coinciden.

## Capacidades

- Clasificacion de audio binaria (sintetico o real) por clip, con salida de probabilidad entre 0 y 1.
- Decision agregada por video o por voz a partir de varios clips, con media ponderada por duracion y umbral configurable (por defecto 0,32).
- Preprocesado de audio integrado: conversion a mono, recorte de silencios, seleccion del fragmento central de 10 s y remuestreo a 16 kHz.
- Salida reproducible desde Python (clase TTSDetector y funcion video_decision) y desde linea de comandos (detector.py).
- Deteccion de voz sintetica generada por 8 sistemas TTS abiertos concretos (Kokoro, Chatterbox, VibeVoice 1.5B, Qwen3-TTS, Maya1, Zonos v0.1, OpenVoice v2, MetaVoice).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: modo de pensamiento, vision o audio generativo: no disponible; es exclusivamente un clasificador de audio.

## Casos de uso

- Filtrado de corpus de habla raspados de la web: antes de entrenar un modelo TTS o ASR con un dataset tipo Emilia o YODAS, se puntuan los clips de cada video y se descartan los videos marcados. Es el caso para el que se construyo el modelo y el que respalda el hallazgo del 20,05% de horas marcadas en Emilia-YODAS English.
- Curacion de datasets de TTS: al preparar un corpus de voces, se agrupan los clips por hablante y se aplica la decision por voz para eliminar locutores completamente sinteticos, evitando que el modelo final imite los artefactos de otro sistema.
- Auditoria de procedencia de datos: una organizacion que compra o recibe un corpus de audio puede puntuar por video para estimar que fraccion es sintetica antes de aceptarlo, con un umbral que se ajusta segun la tolerancia a falsos positivos.
- Limpieza previa de datos de clonacion de voz: en flujos de clonacion que necesitan referencias reales y limpias, el filtro elimina referencias que ya son salidas de otro TTS, que degradarian la calidad del clon.
- Preprocesado en pipelines de ASR: si el corpus de entrenamiento de un reconocedor contiene narraciones TTS, el modelo permite separar esas horas y tratarlas de forma distinta, ya que su distribucion acustica difiere de la del habla espontanea.
- Analisis de canales de YouTube o plataformas similares: con la decision por video se puede caracterizar que proporcion del catalogo de un canal es narracion automatica, util para estudios de contaminacion de datos o para moderacion de contenido.
- Control de calidad interno de un dataset propio: integrado en un paso de CI de datos, el script detector.py puede ejecutarse sobre lotes de clips y emitir un informe de proporcion de horas marcadas por shard.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Synthetic speech filtering (per video) | Emilia-YODAS English (amphion/Emilia-Dataset) | Share of scored hours flagged at 0.32 (%) | 20,05 |

Datos adicionales aportados por el autor, no incluidos en el model-index:

| Comprobacion | Resultado |
|---|---|
| Horas puntuadas en Emilia-YODAS English | 21.206 horas |
| Escucha a ciegas de clips marcados | 25 de 25 clips juzgables eran TTS (intervalo del 95%: 86,7-100%) |
| Equivalencia con el pipeline (334 clips de Emilia-YODAS, 24 videos) | Reproduccion bit a bit; diferencia maxima de 0,018 logits (media 0,0011) frente a los logits almacenados |
| Desviacion en CPU | Los logits varian aproximadamente 0,01 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de audio) en la informacion disponible; las metricas anteriores son las unicas declaradas por el autor.

## Requisitos de hardware

- VRAM estimada: el repositorio solo contiene la cabeza (197 kB de pesos entrenables), pero la inferencia requiere descargar y ejecutar el encoder HuBERT-Large, que no se cuantiza en el pipeline publicado. Como estimacion de orden de magnitud, el encoder en float32 ocupa alrededor de 1,2-1,3 GB de pesos, por lo que con activaciones y lotes pequenos bastan aproximadamente 2-4 GB de VRAM. El repositorio no publica cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA y mas de 4 GB de memoria, por ejemplo RTX 3060, RTX 4060, RTX 4090, A100 o H100. En A100 y H100 se aprovecha TF32, que es la configuracion con la que se generaron los logits de referencia. El autor indica que sobre CPU los logits se desplazan alrededor de 0,01.
- Cabe en GPU de consumo: si, el encoder HuBERT-Large es un modelo de tamano medio y el clasificador solo anade 197 kB. Tarjetas como GTX 1660, RTX 2060, RTX 3060 o superiores son suficientes.
- Opciones de despliegue: script standalone detector.py con torch, transformers, numpy, scipy, soundfile y safetensors; no depende del codebase de Spero. Es un encoder clasificador, por lo que no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponible. El autor no publica medidas de latencia ni de clips por segundo; el unico dato de rendimiento temporal es que la equivalencia con el pipeline se verifico sobre 334 clips.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de otros detectores de voz sintetica comparables, por lo que la comparacion de rendimiento no esta disponible. Se comparan a continuacion las caracteristicas tecnicas conocidas.

| Modelo | Tipo | Parametros | Duracion de entrada | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|---|
| cloud0day3/tts-contamination-detector | Encoder HuBERT congelado + cabeza logistica | 49.153 en el repositorio; encoder aparte | 10 s por clip; decision por video con varios clips | Apache-2.0 | HuggingFace | Filtrado de corpus de entrenamiento |
| facebook/hubert-large-ll60k | Encoder auto-supervisado | no disponible en la informacion proporcionada | no aplica (representaciones) | no disponible en la informacion proporcionada | HuggingFace | Modelo base para tareas de habla; no clasifica voz sintetica por si mismo |
| Otros detectores de voz sintetica | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica explicitamente que no es un detector de deepfakes, fraude ni herramienta forense. No fue construido ni probado para veredictos por clip aislado, audio adversarial ni para decidir si la grabacion de una persona concreta es genuina.
- La decision esta pensada por video o por voz, agregando varios clips con un minimo de 3; usarlo clip a clip va contra el diseno del modelo.
- El entrenamiento solo cubre 8 sistemas TTS abiertos (Kokoro, Chatterbox, VibeVoice 1.5B, Qwen3-TTS, Maya1, Zonos v0.1, OpenVoice v2, MetaVoice). El autor no uso audio de proveedores comerciales, por lo que la deteccion de voces de APIs comerciales no esta garantizada.
- Solo soporta ingles; se desconoce el comportamiento con otros idiomas.
- El umbral por defecto de 0,32 es una eleccion del pipeline, no un valor optimizado de forma publica. No se publican tasas de falsos positivos ni de falsos negativos a ese umbral.
- Los resultados de la escucha a ciegas (25 de 25) proceden de una muestra pequena y de clips que el oyente pudo juzgar, con un intervalo de confianza amplio (86,7-100%).
- Riesgo de alucinacion: no aplica, es un clasificador y no genera texto. El riesgo equivalente es la clasificacion erronea de audio real como sintetico o viceversa.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgo por acento, genero, edad ni canal de grabacion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el encoder base facebook/hubert-large-ll60k se descarga por separado y hay que comprobar su licencia y condiciones al desplegar.
- En produccion conviene fijar la revision del encoder (el autor usa ff022d09) y el tipo de dispositivo, ya que las diferencias de composicion de lote y de GPU bajo TF32 introducen variaciones pequenas en los logits.
- El remuestreo depende de scipy.signal.resample_poly con el filtro Kaiser del pipeline original; sustituirlo por torchaudio o soxr cambia las caracteristicas y rompe la equivalencia declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloud0day3/tts-contamination-detector
- Modelo base HuBERT-Large: https://huggingface.co/facebook/hubert-large-ll60k
- Paper de HuBERT (Hsu et al., 2021): https://arxiv.org/abs/2106.07447
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset People's Speech: https://huggingface.co/datasets/MLCommons/peoples_speech
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
- Space Hub Stats (resultado de la busqueda web): https://huggingface.co/spaces/cfahlgren1/hub-stats
- Repositorio de modelos y arquitecturas de malcolmrey (resultado de la busqueda web): no disponible la URL exacta en la informacion proporcionada
