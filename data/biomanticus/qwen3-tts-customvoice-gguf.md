# Biomanticus/qwen3-tts-customvoice-gguf

## Resumen

Qwen3-TTS 12Hz 1.7B CustomVoice en formato GGUF es una conversión de cuantización del checkpoint oficial Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, publicada por el usuario Biomanticus. El modelo original es un sistema de síntesis de voz (text-to-speech) de la familia Qwen3-TTS desarrollada por Alibaba Qwen, con 1.700 millones de parámetros y una frecuencia de tokenización de audio de 12 Hz. Esta versión GGUF no introduce ningún entrenamiento adicional: se limita a recuantizar y repaquetar los pesos originales en un único archivo autocontenido.

El interés de esta conversión radica en la portabilidad. Frente al layout upstream basado en safetensors más directorios auxiliares (config.json, vocab.json, merges.txt y speech_tokenizer/), aquí cada archivo GGUF embebe el talker, el predictor, el tokenizador de voz, el tokenizador de texto y la especificación del modelo. Esto simplifica el despliegue en runtimes basados en GGUF como audio.cpp, evitando la gestión de múltiples artefactos y dependencias de configuración.

Se distribuyen dos variantes de cuantización: q5_K (~2,21 GB) y q4_k (~2,01 GB), ambas por debajo del tamaño del repositorio completo (4,2 GB), que incluye los dos archivos. La licencia es Apache-2.0, idéntica al modelo upstream, lo que permite uso comercial sin restricciones adicionales más allá de las condiciones de atribución de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de la familia Qwen3-TTS; componentes talker y predictor embebidos, sin detalle arquitectonico en la informacion) |
| Parametros totales | 1.7B (1.700 millones, segun el nombre del checkpoint upstream) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q5_K (~2,21 GB) y q4_k (~2,01 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos autocontenidos: talker, predictor, tokenizador de voz, tokenizador de texto y spec del modelo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original. Se sabe que Qwen3-TTS opera con una tokenizacion de audio a 12 Hz y que el paquete GGUF embebe varios componentes: un talker, un predictor, un tokenizador de voz (speech tokenizer) y un tokenizador de texto, junto con la especificacion del modelo. No se proporcionan datos sobre el tipo de transformer, mecanismos de atencion, composicion del dataset de entrenamiento, numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO en el checkpoint upstream.

Respecto al proceso de esta conversion, la model card es explicita: se utilizo la herramienta audiocpp_gguf (audio.cpp 0.8.2) partiendo de los pesos oficiales model.safetensors y speech_tokenizer/, aplicando --type q4_k o --type q5_k. No hubo fine-tuning, ni entrenamiento adicional, ni clonacion de voz. Se trata, por tanto, de una recuantizacion de pesos upstream sin modificacion de comportamiento. Cualquier innovacion tecnica del modelo (decodificacion, atencion, esquema de generacion) corresponde al checkpoint original y no se documenta en esta ficha.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con pipeline_tag text-to-speech.
- Variante CustomVoice del checkpoint upstream, orientada a voces personalizadas segun la denominacion del modelo base (sin detalle adicional en la informacion).
- Carga desde un unico archivo GGUF, con todos los componentes necesarios embebidos (sin necesidad de config.json, vocab.json ni merges.txt).
- Compatibilidad con runtimes basados en GGUF para TTS, en particular audio.cpp (version 0.8.2 usada para la conversion).
- Dos niveles de cuantizacion para ajustar el equilibrio entre tamano y fidelidad de sintesis.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada, razonamiento multi-paso ni multilingues en la informacion disponible.

## Casos de uso

- Sintesis de voz en local con recursos limitados: los archivos de ~2 GB permiten ejecutar TTS en estaciones de trabajo sin GPU de gran memoria, cargando un unico GGUF en audio.cpp y evitando la gestion de directorios de configuracion.
- Integracion en pipelines de audio.cpp: al ser un formato nativo de dicho runtime, encaja en flujos existentes de generacion de voz sin necesidad de adaptadores adicionales para safetensors.
- Prototipado rapido de aplicaciones TTS: la naturaleza autocontenida del archivo reduce el tiempo de puesta en marcha, util para demos y pruebas de concepto con la variante q4_k (~2,01 GB).
- Generacion de narracion o locucion para contenido multimedia: el modelo sintetiza voz a partir de texto, adecuado para audiolibros, podcasts o videos donde se requiere una voz personalizada (CustomVoice).
- Distribucion y empaquetado de modelos: al reducir el modelo a un solo archivo, se simplifica la publicacion en repositorios, el versionado y la descarga por parte de terceros.
- Evaluacion comparativa de cuantizaciones: disponer de q4_k y q5_K del mismo checkpoint permite medir la perdida de calidad de sintesis entre ambas variantes en un mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de sintesis (MOS, similitud de hablante, WER), latencia ni throughput, ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, los pesos ocupan ~2,01 GB (q4_k) y ~2,21 GB (q5_K), por lo que la memoria necesaria sera al menos del orden de esos tamanos mas el overhead del runtime y buffers de audio.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU consumer: no confirmada en la informacion, aunque el tamano de los pesos (~2 GB) sugiere que podria caber en GPUs consumer con suficiente VRAM; esto no esta verificado en la model card.
- Opciones de despliegue: audio.cpp (runtime usado para la conversion, version 0.8.2). No se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no ofrece comparaciones con otras alternativas TTS ni con otras conversiones GGUF del mismo checkpoint.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Biomanticus/qwen3-tts-customvoice-gguf | 1.7B | no disponible | no disponible | Apache-2.0 | GGUF (q4_k, q5_K) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: se trata de una recuantizacion del checkpoint upstream, por lo que hereda todas sus limitaciones y sesgos, que no se documentan aqui.
- La cuantizacion q4_k y q5_K puede introducir perdida de fidelidad en la sintesis respecto a los pesos originales en safetensors; no se han publicado mediciones de esta degradacion.
- No se documentan los idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas sin evaluacion previa.
- Riesgo de alucinacion o artefactos de audio no cuantificado: no hay metricas de calidad (MOS, WER) en la informacion disponible.
- La model card indica explicitamente que no hay clonacion de voz en esta conversion; la denominacion CustomVoice corresponde al checkpoint upstream y su alcance exacto no se detalla.
- Uso comercial permitido bajo Apache-2.0, con obligacion de conservar avisos de licencia y atribucion; conviene revisar tambien las condiciones del checkpoint upstream.
- Dependencia de audio.cpp como runtime: no se confirma compatibilidad con otras herramientas GGUF (llama.cpp, Ollama), lo que limita las opciones de despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Biomanticus/qwen3-tts-customvoice-gguf
- Checkpoint upstream: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Runtime audio.cpp (referenciado en la model card como audiocpp_gguf, version 0.8.2): no disponible como enlace en la informacion proporcionada
