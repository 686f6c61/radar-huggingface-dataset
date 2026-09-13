# kugiyt8i/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, publicado originalmente en el artículo *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). La ficha que se analiza aquí corresponde a `kugiyt8i/whisper-large-v3`, una resubida no oficial del checkpoint `openai/whisper-large-v3` en Hugging Face, con 0 descargas y 0 likes en el momento de la consulta.

Se trata de un transformer encoder-decoder de tipo secuencia a secuencia con 1.543.490.560 parámetros según los pesos safetensors del repositorio, entrenado sobre 5 millones de horas de audio (1 millón de horas débilmente etiquetadas más 4 millones de horas pseudoetiquetadas con Whisper large-v2) durante 2,0 épocas. Frente a large-v2 introduce dos cambios menores: el espectrograma de entrada usa 128 bandas Mel en lugar de 80, y se añade un token de idioma para el cantonés. La ventana de audio es fija de 30 segundos por pasada de encoder, y el decodificador genera como máximo 448 tokens por ventana.

Su relevancia práctica radica en que cubre 99 idiomas declarados en los metadatos, funciona en modo zero-shot sobre dominios no vistos y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial. No obstante, al tratarse de un espejo de terceros, conviene verificar la integridad de los pesos frente al repositorio oficial antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para voz; encoder sobre espectrograma log-Mel de 128 bandas |
| Parametros totales | 1.543.490.560 (dato real de los pesos safetensors del repositorio) |
| Longitud de contexto | Ventana de audio fija de 30 s (1500 fotogramas, 128 bandas Mel); hasta 448 tokens por ventana en el decodificador |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos en precisión completa en safetensors) |
| Idiomas soportados | 99 idiomas declarados en los metadatos; la model card indica además un token nuevo para cantonés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch y JAX/Flax) |
| Tarea principal | automatic-speech-recognition (transcripción y traducción de voz a inglés) |
| Tamano del repositorio | 24,7 GB (incluye duplicación de pesos en varios frameworks) |
| Precision de los pesos | float32 (los safetensors publicados no están cuantizados) |

## Arquitectura y entrenamiento

Whisper large-v3 mantiene la arquitectura de las versiones large y large-v2: un transformer encoder-decoder entrenado de forma supervisada sobre pares audio-texto. El encoder consume un espectrograma log-Mel de 128 bandas calculado sobre ventanas de 30 segundos (1500 fotogramas) y el decodificador autoregresivo emite texto condicionado por tokens especiales de tarea, idioma y marcas de tiempo. La decodificación admite mecanismos heurísticos implementados en Transformers: `temperature` fallback, `compression_ratio_threshold`, `logprob_threshold`, `no_speech_threshold` y `condition_on_prev_tokens`, además de búsqueda por haces (`num_beams`).

El entrenamiento, según la model card, se realizó sobre 1 millón de horas de audio débilmente etiquetado más 4 millones de horas pseudoetiquetadas generadas con Whisper large-v2, con 2,0 épocas sobre esa mezcla. No se menciona en la información disponible ninguna fase de RLHF ni de DPO: el paradigma es de supervisión débil a gran escala, orientado a generalización zero-shot. Los dos cambios técnicos respecto a large-v2 son el aumento de 80 a 128 bandas Mel en la entrada y la incorporación de un token de idioma para el cantonés. La model card afirma una reducción de errores de entre el 10 % y el 20 % frente a large-v2 en una amplia variedad de idiomas.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas declarados, con detección automática del idioma de origen o selección explícita mediante el argumento `language`.
- Traducción de voz a texto en inglés (tarea `translate`) desde cualquiera de los idiomas soportados.
- Marcas de tiempo a nivel de frase, de segmento y de palabra mediante `return_timestamps` (heurísticas, no forzado por alineación).
- Transcripción de audio largo mediante troceado en ventanas de 30 segundos y procesamiento por lotes (`batch_size`).
- Robustez zero-shot a acentos, ruido de fondo y dominios no vistos, según lo reportado en el artículo original.
- Gestión de segmentos sin habla mediante el umbral `no_speech_threshold`, que permite descartar silencios y música.
- Salida configurable en formato de texto plano o en fragmentos (`chunks`) con tiempos asociados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de visión, audio generativo ni modo "thinking".
- No es un modelo de lenguaje conversacional: únicamente produce transcripciones o traducciones.

## Casos de uso

- Generación de subtítulos para vídeo bajo demanda: con `return_timestamps="word"` se obtienen alineaciones por palabra que se pueden exportar directamente a SRT o VTT para plataformas de streaming y canales de vídeo.
- Actas y resúmenes de reuniones: transcripción de audio largo por troceado de 30 segundos, con diarización posterior mediante WhisperX o pyannote para atribuir cada intervención a un hablante.
- Control de calidad en atención al cliente: transcripción de llamadas grabadas y análisis posterior de cumplimiento de guiones, detección de palabras prohibidas y extracción de motivos de contacto.
- Accesibilidad en contenido educativo: subtitulado de clases y pódcast, con la opción de traducir a inglés el audio en otros idiomas para publicar versiones internacionales.
- Documentación por dictado en entornos profesionales: transcripción de notas de voz en consultas o despachos, siempre con revisión humana posterior dado el riesgo de alucinación en segmentos ruidosos.
- Indexación y búsqueda semántica de archivos de audio: convertir fondos de pódcast, radio o grabaciones internas en texto para alimentar un motor de búsqueda o un sistema RAG.
- Moderación de contenido en plataformas con audio generado por usuarios: transcripción masiva por lotes para aplicar clasificadores de texto sobre el resultado.
- Investigación lingüística y creación de corpus: transcripción de grabaciones de campo en cualquiera de los 99 idiomas declarados, con la salvedad de que el rendimiento varía mucho entre idiomas de altos y bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de WER por idioma ni comparativas numéricas con otros modelos; el único dato cuantitativo aportado es la afirmación de una reducción de errores de entre el 10 % y el 20 % respecto a Whisper large-v2 en una amplia variedad de idiomas.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del recuento real de parámetros (1.543.490.560), no medidas publicadas en la información disponible.

- Pesos en float32: aproximadamente 6,2 GB solo para los pesos; con activaciones y búsqueda por haces, entre 8 GB y 12 GB de VRAM.
- Pesos en float16/bfloat16: aproximadamente 3,1 GB solo para los pesos; en la práctica, entre 4 GB y 6 GB de VRAM con lotes pequeños.
- Cuantización a int8: aproximadamente 1,6 GB de pesos, lo que permite ejecución en GPUs con 4 GB de VRAM.
- Cabe en GPU de consumo: sí. RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan el modelo en fp16 sin problemas. En GPUs de 6 GB o menos es recomendable cuantizar.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S permiten lotes grandes y mayor throughput, aunque el modelo está muy por debajo de su capacidad de memoria.
- Apple Silicon: ejecutable mediante Metal con whisper.cpp o MLX; también en CPU, con latencia mucho mayor.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, faster-whisper sobre CTranslate2, whisper.cpp (GGML/GGUF), WhisperX para diarización y alineación, y endpoints gestionados de Hugging Face. TGI no está orientado a modelos de ASR; para vLLM conviene verificar la versión concreta, ya que el soporte de modelos encoder-decoder de audio ha ido cambiando entre releases.
- Latencia y throughput: no disponible en la informacion proporcionada. El coste escala de forma aproximadamente lineal con la duración del audio, ya que cada ventana de 30 segundos requiere una pasada completa de encoder más la decodificación autoregresiva asociada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper large-v3 (este repositorio) | 1.543.490.560 | 30 s, 128 bandas Mel | 99 declarados + cantonés | Apache-2.0 | Espejo no oficial `kugiyt8i/whisper-large-v3`, 0 descargas |
| Whisper large-v2 | Misma arquitectura y orden de magnitud (según la model card) | 30 s, 80 bandas Mel | 99 declarados, sin token de cantonés | Apache-2.0 | Repositorio oficial `openai/whisper-large-v2` |
| Whisper large (v1) | Misma arquitectura y orden de magnitud (según la model card) | 30 s, 80 bandas Mel | 99 declarados, sin token de cantonés | Apache-2.0 | Repositorio oficial `openai/whisper-large` |
| Alternativas de la familia destilada o de inferencia optimizada (distil-whisper, faster-whisper) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Repositorios de la comunidad en Hugging Face |

## Limitaciones y advertencias

- Espejo no oficial: el repositorio pertenece a un autor distinto de OpenAI, registra 0 descargas y 0 likes, y fue creado el 2026-09-13. Antes de usarlo en producción conviene verificar los hashes de los safetensors contra `openai/whisper-large-v3` y, preferiblemente, descargar el modelo desde el repositorio oficial.
- Tamaño del repositorio de 24,7 GB, muy superior a los aproximadamente 6 GB de los pesos en float32, debido a la inclusión de pesos duplicados en PyTorch y JAX/Flax.
- Riesgo de alucinación: es una limitación conocida de la familia Whisper la generación de texto plausible en segmentos sin habla, con música o con ruido intenso. En producción se recomienda activar `no_speech_threshold` y validar con `compression_ratio_threshold` y `logprob_threshold`.
- Ventana fija de 30 segundos: el modelo no procesa audio arbitrariamente largo en una sola pasada; requiere troceado y solapamiento, lo que puede introducir errores en las fronteras entre segmentos.
- Marcas de tiempo heurísticas: los tiempos por palabra no proceden de una alineación forzada, por lo que pueden desviarse; para subtitulado profesional es habitual postprocesar con herramientas de alineación.
- Cobertura desigual entre idiomas: aunque se declaran 99 idiomas, la calidad depende de la representación de cada uno en los datos de entrenamiento, y los idiomas de bajos recursos presentan tasas de error notablemente superiores. Los metadatos no ofrecen cifras de WER por idioma.
- Sesgos: el entrenamiento con supervisión débil a escala web puede arrastrar sesgos de género, variedad dialectal y dominio presentes en los datos; la información proporcionada no detalla la composición del dataset más allá del número de horas.
- Traducción limitada al inglés: la tarea `translate` solo produce texto en inglés, no entre pares arbitrarios de idiomas.
- Sin soporte de tool calling ni de agentes: no puede integrarse en flujos agentivos; su papel es exclusivamente ASR y traducción de voz.
- Licencia Apache-2.0, que permite uso comercial y modificación, pero la model card del espejo no añade avisos propios; conviene revisar la licencia y las condiciones del repositorio original.

## Enlaces

- Repositorio analizado: https://huggingface.co/kugiyt8i/whisper-large-v3
- Repositorio oficial del modelo: https://huggingface.co/openai/whisper-large-v3
- Repositorio oficial de la versión anterior: https://huggingface.co/openai/whisper-large-v2
- Artículo *Robust Speech Recognition via Large-Scale Weak Supervision*: https://huggingface.co/papers/2212.04356
- Código oficial de OpenAI: https://github.com/openai/whisper
- Documentación del pipeline de ASR en Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
- Familia destilada de referencia: https://huggingface.co/distil-whisper

Nota: los resultados de búsqueda web disponibles para esta consulta versan sobre la economía argentina y no guardan relación con el modelo, por lo que no se han incluido como fuentes.
