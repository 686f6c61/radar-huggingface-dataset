# JoaoZaokk/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Este repositorio contiene una conversión al formato GGUF del modelo de reconocimiento automático de voz nvidia/nemotron-3.5-asr-streaming-0.6b, publicada por el usuario JoaoZaokk. No se trata de un modelo entrenado desde cero: el autor reempaqueta los pesos originales de NVIDIA (la conversión f16 la publicó previamente mudler) para que puedan cargarse con el motor mudler/parakeet.cpp. El objetivo es disponer de un artefacto único, portable y de tamano reducido que las aplicaciones nativas de Odysseus / Open WebUI puedan descargar mediante enlaces estables.

El modelo base es un FastConformer-RNNT con streaming cache-aware, orientado a transcripcion en tiempo real y con 638.030.384 parametros (aproximadamente 0,64 B). Segun la model card, admite 40+ locales y es sensible al prompt (prompt-conditioned), lo que permite sesgar el reconocimiento con contexto. El repositorio etiqueta explicitamente seis idiomas: ingles, portugues, espanol, aleman, frances e italiano.

Su relevancia practica esta en el nicho on-device: un modelo de ASR de menos de 1.000 millones de parametros, con pesos de 1.484 MB en f16 y variantes cuantizadas mas pequenas, ejecutable en CPU o en hardware modesto mediante GGML. La contrapartida es que, en el momento de la consulta, el repositorio tiene 0 descargas y 0 likes, solo lista el fichero f16 y no publica benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT con streaming cache-aware (prompt-conditioned), segun la model card |
| Parametros totales | 638.030.384 (dato real, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Es un modelo de ASR en streaming; el contexto efectivo depende de la cache de atencion y no se publica una cifra |
| Tipos de cuantizacion | f16 disponible (1.484 MB). La model card menciona ademas q8_0 (en torno al 55 % del tamano de f16), q5_0/q5_k y q4_* |
| Idiomas soportados | en, pt, es, de, fr, it (segun los tags del repo); el modelo base declara 40+ locales |
| Licencia | other. La model card indica NVIDIA OpenMDW-1.1, heredada del modelo fuente |
| Formato de pesos | GGUF / ggml, un unico fichero f16 de 1.484 MB (tamano del repo: 1,5 GB) |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b (relacion: quantized) |
| Libreria / motor | parakeet.cpp (mudler/parakeet.cpp). No compatible con whisper.cpp |
| Fecha de creacion en HuggingFace | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un FastConformer-RNNT, es decir, un encoder Conformer con downsampling tipo FastConformer y un decodificador de tipo transducer (RNNT, recurrent neural network transducer) en lugar de un decoder autoregresivo tipo seq2seq. La variante es cache-aware streaming, lo que significa que el modelo mantiene una cache de estados de atencion y convolucion entre fragmentos de audio, de modo que puede emitir transcripciones incrementales sin reprocesar todo el audio anterior. Ademas es prompt-conditioned: acepta contexto o prompt para condicionar la decodificacion. El checkpoint original procede de NVIDIA; el autor de este repositorio no aporta informacion sobre volumen de horas de audio, composicion del dataset, ni sobre si hubo etapas de ajuste con RLHF o DPO (en ASR estos terminos se sustituyen habitualmente por ajuste fino supervisado o discriminative training, pero no se detalla nada al respecto).

Toda la innovacion tecnica atribuible a este repositorio es de empaquetado, no de modelado. La conversion se hizo con el convertidor propio de parakeet.cpp y las cuantizaciones, cuando existan, con el cuantizador del mismo motor. Segun la model card, la variante f16 publicada por mudler fue validada con WER 0 frente a NeMo, y cada variante se comprobo transcribiendo muestras cortas de portugues e ingles antes de subirla. No se documenta ningun cambio en los pesos, ni poda, ni destilacion.

## Capacidades

- Reconocimiento automatico de voz (ASR) en modo streaming con cache-aware: procesa audio de forma incremental y mantiene estado entre fragmentos.
- Reconocimiento de voz offline (transcripcion de ficheros completos) mediante la CLI `parakeet-cli transcribe --model <fichero> --input audio.wav --lang <codigo>`.
- Modelo prompt-conditioned: permite condicionar la decodificacion con contexto, lo que habilita sesgo de vocabulario o adaptacion a dominios concretos.
- Salida de texto a partir de audio; el modelo no genera texto libre ni mantiene conversaciones.
- Cobertura multilingue declarada de 40+ locales en el modelo base, con seis idiomas etiquetados en este repositorio (en, pt, es, de, fr, it).
- Ejecucion on-device gracias al backend GGML, con variantes cuantizadas pensadas para movil (q5_0/q5_k segun la model card).
- Seleccion de idioma en tiempo de ejecucion mediante el parametro `--lang` (el ejemplo de la model card usa `pt-BR`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio generativo ni capacidades matematicas. Es exclusivamente un transcriber de audio a texto.

## Casos de uso

- Transcripcion en tiempo real en el dispositivo: al ser un modelo cache-aware streaming de 0,64 B, se puede integrar en una aplicacion de escritorio o movil que transcriba microfono en vivo sin enviar audio a la nube y sin esperar a que termine la frase.
- Subtitulado en directo de reuniones y videollamadas: el streaming incremental y el soporte de seis idiomas permiten generar subtitulos conforme se habla, con la variante f16 o q8_0 si hay CPU/GPU suficiente.
- Dictado por voz en aplicaciones ofimaticas: la variante q5_0/q5_k, descrita en la model card como opcion apta para telefono, permite embeber el modelo en apps moviles con requisitos de almacenamiento reducidos.
- Transcripcion de contact center y atencion al cliente: al ser prompt-conditioned, se puede sesgar el reconocimiento con nombres de producto, siglas o terminologia interna, y procesar el audio con la CLI o desde parakeet.cpp sin depender de servicios externos.
- Accesibilidad para personas con discapacidad auditiva: la ejecucion local evita enviar conversaciones privadas a terceros, requisito habitual en entornos sanitarios o educativos.
- Indexacion y busqueda de reuniones (pipelines RAG sobre audio): transcribir grabaciones con `parakeet-cli`, almacenar el texto y alimentar un indice de recuperacion; el modelo se limita a la parte ASR y el resto del pipeline queda a cargo del desarrollador.
- Generacion de subtitulos para bibliotecas de video: procesado por lotes en CPU con GGML, sin necesidad de GPU dedicada, usando el mismo binario en Linux, macOS o Windows.
- Preprocesado de audio para pipelines multilingues: al cubrir el modelo base 40+ locales y este repo etiquetar seis idiomas, sirve como primer escalon de transcripcion antes de un modelo de traduccion o resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que la conversion f16 fue validada con WER 0 frente a NeMo (es decir, transcripciones identicas al checkpoint original) y que cada variante se comprobo con muestras cortas de portugues e ingles. No hay cifras absolutas de WER, ni resultados en LibriSpeech, Common Voice, MLS ni otros conjuntos, ni comparaciones con otros modelos.

| Comprobacion declarada | Resultado | Fuente |
|---|---|---|
| f16 GGUF frente a NeMo (upstream) | WER 0 (sin diferencias de transcripcion) | Model card del repositorio |
| Variantes cuantizadas | Verificadas con muestras cortas de pt y en | Model card del repositorio |
| WER absoluto por idioma | No disponible | No publicado |
| Latencia y throughput | No disponible | No publicado |

## Requisitos de hardware

- Pesos f16: 1.484 MB en disco. Con buffers de runtime del motor GGML, el consumo estimado en RAM/VRAM es de aproximadamente 1,5 a 2 GB (estimacion propia a partir del tamano del fichero; no publicada por el autor).
- Tamano del repositorio completo: 1,5 GB, coherente con un unico fichero f16.
- q8_0: en torno al 55 % del tamano de f16 segun la model card, es decir, aproximadamente 800 MB.
- q5_0 / q5_k: descritas como "opcion apta para telefono"; no se publica el tamano exacto.
- q4_*: descritas como la opcion mas pequena, con un coste pequeno de precision; no se publica el tamano exacto.
- GPU recomendadas: no disponible. No se indica ninguna GPU concreta ni requisito de CUDA/Metal/Vulkan.
- Cabe en GPU de consumo: si, en principio cabe en cualquier GPU con 2 GB o mas de VRAM en f16 (por ejemplo, GTX 1650, RTX 3050, RTX 4060), y en CPU sin GPU dedicada gracias al backend GGML. No hay validacion publicada de esta afirmacion.
- Opciones de despliegue: parakeet.cpp (mudler/parakeet.cpp) con `parakeet-cli`. No es compatible con whisper.cpp, por lo que no es directamente utilizable con ecosistemas construidos sobre whisper.cpp. Compatibilidad con Ollama, llama.cpp, vLLM, TGI o faster-whisper: no disponible / no indicada.
- Latencia y throughput: no disponible. No se publican mediciones de RTF (real-time factor) ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming nativo | Idiomas | Licencia | Formato GGUF | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (esta conversion GGUF) | 638.030.384 | Si (cache-aware, segun la model card) | 6 etiquetados; 40+ en el modelo base | other (NVIDIA OpenMDW-1.1) | Si, f16 en este repo | Repositorio con 0 descargas y 0 likes |
| nvidia/nemotron-3.5-asr-streaming-0.6b (checkpoint original) | 638.030.384 (mismo modelo) | Si (cache-aware, segun la model card) | 40+ locales | other (NVIDIA OpenMDW-1.1, segun la model card) | No (formato NeMo) | Modelo fuente |
| Whisper large-v3 (via whisper.cpp) | No disponible en la informacion proporcionada | No; se procesa por ventanas | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Si, pero requiere whisper.cpp, no parakeet.cpp | Ampliamente desplegado |
| NVIDIA Parakeet TDT 0.6B v2 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente enlaces genericos a YouTube), por lo que no se han podido verificar datos de los modelos alternativos ni ampliar la comparativa con cifras de rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona, no hace tool calling y no tiene capacidades multimodales mas alla de la entrada de audio.
- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica.
- Solo se lista el fichero f16 en la tabla de ficheros del repositorio, aunque la model card menciona q8_0, q5_0/q5_k y q4_*. Conviene verificar la lista de ficheros antes de asumir que las variantes cuantizadas estan disponibles.
- Rendimiento no medido: no hay cifras de WER, RTF ni latencia. La unica validacion declarada es la equivalencia con NeMo en f16 (WER 0) y pruebas cualitativas con muestras cortas de portugues e ingles.
- Riesgo de alucinacion: inherente a los modelos ASR ante silencios, ruido, musica o solapamiento de voces. No se publican datos especificos sobre este comportamiento en este modelo.
- Idiomas: los tags del repositorio limitan la cobertura declarada a seis idiomas, pese a que el modelo base anuncia 40+ locales; conviene validar por idioma antes de produccion. El ejemplo de la model card usa `pt-BR`, y no se especifican variantes regionales del resto de idiomas.
- Licencia: `other`, con NVIDIA OpenMDW-1.1 segun la model card. Al ser un reempaquetado de pesos derivados, la licencia del modelo original se mantiene; es imprescindible revisar los terminos completos para uso comercial. El autor no ofrece garantia alguna.
- Compatibilidad: el modelo no funciona con whisper.cpp ni, presumiblemente, con los runners construidos sobre el. Depende del proyecto mudler/parakeet.cpp, mantenido por un tercero, lo que anade un riesgo de mantenimiento en produccion.
- Trazabilidad: el autor indica que mantiene el repositorio para que los enlaces de descarga de las apps nativas de Odysseus / Open WebUI se mantengan estables; se trata de un repositorio de conveniencia, no de un canal oficial de NVIDIA.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Motor de inferencia parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Busqueda web: no se encontraron enlaces tecnicos relevantes (papers, blogs o demos) en los resultados disponibles.
