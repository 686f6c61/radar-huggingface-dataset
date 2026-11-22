# loom-ai-org/moss-tts-local-transformer-v1.5-loom

## Resumen

MOSS-TTS Local Transformer v1.5 es un modelo de síntesis de voz multilingüe desarrollado originalmente por OpenMOSS (OpenMOSS-Team) y exportado al formato GGUF de loom.cpp por loom-ai-org. A diferencia de un modelo TTS convencional que devuelve una forma de onda, este modelo es un conversor de texto a *tokens de códec*: recibe texto y emite 12 flujos de tokens del códec MOSS-Audio-Tokenizer a 12,5 fotogramas por segundo, que después se decodifican a audio estéreo de 48 kHz mediante un segundo modelo (`moss-audio-tokenizer-v2-loom`).

La relevancia de esta exportación es de ingeniería: empaqueta los pesos originales sin modificar (4.192.935.582 parámetros) en un único GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script controlador, de modo que se puede ejecutar con el runtime `loom-py-rt` sin necesidad de PyTorch en inferencia. Cubre 31 idiomas, entre ellos el castellano, y hereda la licencia Apache 2.0 del modelo base.

El modelo está pensado para su uso en pareja con el códec de audio, ya que el modelo TTS por sí solo no genera sonido. La separación permite reutilizar el códec en toda la familia MOSS y tratar los códigos como un intermedio útil para streaming, clonación de voz y almacenamiento compacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer local (texto a tokens de códec); detalles internos de capas y atención no disponibles |
| Parámetros totales | 4.192.935.582 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 posiciones compartidas entre prompt y audio (a 12,5 fotogramas/s) |
| Tipos de cuantización | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, de, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exportación loom.cpp) |
| Salida | 12 flujos de tokens de códec, 12,5 fotogramas/s |
| Audio final (con códec) | 48 kHz estéreo |
| Tamaño del repositorio | 50,3 GB |
| Librería | loom-py-rt |
| Modelo base | OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5 |

## Arquitectura y entrenamiento

El modelo es un transformer de 4,19 mil millones de parámetros que mapea texto a tokens neuronales de códec. La exportación a loom.cpp conserva los pesos sin cambios y añade metadatos: un grafo autodescriptivo, el tokenizador y un script controlador embebido en el GGUF que documenta todos los argumentos aceptados. La inferencia se realiza en dos etapas encadenadas: `text2codes` genera los códigos y `codes2speech` del códec los convierte en audio.

El códec MOSS-Audio-Tokenizer v2 dispone de 32 codebooks y decodifica los primeros 12 como prefijo; el modelo TTS emite exactamente esos 12 flujos. La generación es estocástica por defecto con los ajustes recomendados por el autor original, y admite modo greedy (`temperature=0`, `text_temperature=0`) que reproduce exactamente el `generate(do_sample=False)` del modelo base. Se soporta decodificación en streaming: cada fragmento de códigos se decodifica a medida que llega, encadenando ambos modelos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La clonación de voz funciona introduciendo los tokens de códec de clips de referencia en el prompt; en loom estos se precalculan una vez en un fichero de voz con `loom-exporter`, que requiere PyTorch y ambos checkpoints originales.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluidos castellano, catalán no incluido, chino mandarín, cantonés, inglés, árabe, hindi, japonés, coreano y la mayoría de lenguas europeas.
- Generación de tokens de códec a 12,5 fotogramas por segundo con 12 codebooks por fotograma.
- Streaming bidireccional: los códigos se emiten y decodifican en piezas, lo que permite reproducción de baja latencia.
- Clonación de voz a partir de uno o varios clips de referencia, con soporte para diálogos entre varios hablantes mediante marcadores `[S1]`, `[S2]` en el texto.
- Control de semilla y temperatura para reproducibilidad o variación en la generación.
- Modo greedy determinista equivalente al del modelo original.
- No soporta tool calling, agentes ni razonamiento de múltiples pasos: es un modelo especializado de texto a códec.
- No procesa visión ni audio de entrada de forma nativa; la clonación se hace con tokens precalculados, no con audio en bruto.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte capítulos de texto en códigos de códec que, decodificados, producen audio estéreo a 48 kHz; la ventana de 2048 posiciones a 12,5 fotogramas/s limita cada fragmento a unos 160 segundos de audio, por lo que conviene trocear por párrafos.
- Asistentes de voz para atención al cliente: con 31 idiomas y clonación de voz se puede mantener una identidad sonora de marca coherente en conversaciones multilingües, generando la respuesta en streaming mientras el usuario escucha.
- Doblaje y localización de contenidos: al soportar castellano junto con inglés, francés, alemán, portugués, italiano y otras lenguas, permite generar pistas de voz para vídeo o e-learning sin regrabar con actores.
- Accesibilidad: lectura en voz alta de documentos y artículos para usuarios con discapacidad visual, con la ventaja de que el runtime loom no exige PyTorch en producción.
- Diálogos multi-hablante sintéticos: mediante un fichero de voz con varios clips y el marcado `[S1]`/`[S2]`, se pueden generar conversaciones de podcast o material de entrenamiento con voces distintas.
- Integración en pipelines de generación de contenido: al emitir códigos de códec compactos (12 flujos a 12,5 Hz) en lugar de PCM, se pueden almacenar, transmitir y decodificar de forma diferida, lo que reduce el ancho de banda en comparación con el audio sin comprimir.
- Pruebas de voz en desarrollo de aplicaciones: la API de loom-py permite generar muestras reproducibles con `seed` fija para tests de regresión de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,19 mil millones de parámetros, una cuantización de 8 bits requeriría del orden de 4-5 GB solo para pesos, y de 16 bits del orden de 8-9 GB, a lo que hay que sumar el códec de audio y los buffers de activación.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas; una GPU consumer de 8-12 GB podría ser suficiente en cuantizaciones bajas.
- Cabe en GPU consumer: probablemente sí en modelos con 8 GB o más en cuantización reducida, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: runtime `loom-py-rt` (PyPI) con `loom.Model.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. El diseño en streaming permite emitir audio por piezas, pero no se publican cifras de tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-TTS Local Transformer v1.5 (loom) | 4,19 B | 2048 posiciones | 31 | Apache 2.0 | GGUF |
| OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5 | 4,19 B | No disponible | 31 | Apache 2.0 | Pesos originales (PyTorch) |
| Otros TTS multilingües de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el modelo base original, del que esta exportación no modifica pesos y del que hereda idiomas y licencia. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no produce audio por sí mismo: emite tokens de códec y requiere el códec `moss-audio-tokenizer-v2-loom` para obtener una forma de onda.
- La ventana de 2048 posiciones se comparte entre el prompt y el audio generado, a 12,5 fotogramas por segundo, lo que limita cada generación a unos 160 segundos de audio como máximo.
- La clonación de voz exige crear previamente un fichero de voz con `loom-exporter`, que necesita PyTorch, torchaudio, transformers y ambos checkpoints originales en disco.
- El fichero de voz está vinculado a la huella del cuantizador del códec; loom rechaza ficheros creados con un códec distinto.
- La licencia del modelo es Apache 2.0, pero la licencia y el consentimiento de una voz clonada corresponden a la grabación original, no al modelo.
- Riesgo de alucinación y de pronunciación incorrecta en idiomas de bajos recursos o en texto con nombres propios, siglas y números; no se documentan evaluaciones al respecto.
- No se dispone de información sobre sesgos demográficos, acentos o variedades dialectales cubiertas dentro de cada idioma.
- El repositorio tiene 153 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy temprana y poca validación comunitaria.
- El tamaño del repositorio (50,3 GB) implica un coste de almacenamiento y descarga considerable.
- No hay datos publicados de latencia, throughput ni calidad objetiva (MOS) en la información disponible.

## Enlaces

- [Hugging Face: loom-ai-org/moss-tts-local-transformer-v1.5-loom](https://huggingface.co/loom-ai-org/moss-tts-local-transformer-v1.5-loom)
- [Modelo base: OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5)
- [Códec: loom-ai-org/moss-audio-tokenizer-v2-loom](https://huggingface.co/loom-ai-org/moss-audio-tokenizer-v2-loom)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
