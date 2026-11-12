# cutvideogaps/indicwhisper-hindi-ct2

## Resumen

IndicWhisper Hindi CT2 es una conversión a CTranslate2 del checkpoint hindi de IndicWhisper, el modelo de reconocimiento automático del habla desarrollado por AI4Bharat (IIT Madras) dentro del proyecto Vistaar. Se trata de un fine-tuning de `openai/whisper-medium` sobre los datos de entrenamiento hindi de Vistaar, empaquetado en formato int8 para su uso con faster-whisper en CPU. El repositorio lo publica el usuario `cutvideogaps` y no introduce cambios en los pesos más allá del cambio de formato.

El modelo transcribe voz en hindi y devuelve el texto en escritura devanagari. Su relevancia práctica reside en que permite ejecutar un ASR específico para hindi en hardware sin GPU, con un rendimiento aproximado de 1,2 veces la duración del audio en un Apple M1 con 8 hilos. Es, por tanto, una pieza útil para pipelines de subtitulado, transcripción de reuniones o herramientas de edición de vídeo orientadas a creadores en hindi.

La ficha cubre un artefacto de inferencia (no un modelo entrenado desde cero): el valor está en la conversión, la cuantización int8 y las instrucciones de uso que el autor documenta para evitar las alucinaciones típicas de este checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a CTranslate2 |
| Parametros totales | no disponible (whisper-medium: aproximadamente 769 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; uso recomendado de fragmentos de hasta 8 s) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | hindi (hi), salida en devanagari |
| Licencia | MIT (copyright 2023 AI4Bharat) |
| Formato de pesos | CTranslate2 (model.bin, config.json, tokenizer.json, vocabulary) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con atención completa, entrenado originalmente para transcripción y traducción multilingüe sobre audio de 30 segundos. AI4Bharat lo fine-tuneó sobre los datos hindi de Vistaar (checkpoint `whisper-medium-hi_alldata_multigpu`), un corpus agregado de habla india con transcripciones en devanagari. Según la model card, Vistaar reporta un WER de 10,3 % en Kathbath para este checkpoint.

La conversión a CTranslate2 se realizó con `ct2-transformers-converter --quantization int8` usando CTranslate2 4.4.0 y transformers 4.44.2. Los pesos originales se cargaron con `torch.load(weights_only=True)` y se guardaron como safetensors antes de convertir; el `tokenizer.json` se generó a partir de `vocab.json` y `merges.txt`. El checkpoint no incluye cabezas de alineamiento, por lo que el conversor aplicó el valor por defecto (todas las cabezas de la mitad superior del decoder). El repositorio publica sumas SHA-256 de cada fichero en `SHA256SUMS`.

Un detalle técnico relevante: el modelo se fine-tuneó sin tokens de timestamp, lo que condiciona por completo su modo de uso (ver limitaciones).

## Capacidades

- Transcripción de voz en hindi con salida en escritura devanagari.
- Reconocimiento de habla en CPU mediante faster-whisper con cuantización int8.
- Generación de timestamps a nivel de palabra (`word_timestamps=True`), aunque no de timestamps nativos del modelo.
- Procesamiento por fragmentos con `clip_timestamps`, pensado para dividir audio en trozos de hasta 8 segundos cortados en pausas mediante VAD.
- Decodificación greedy (`beam_size=1`) como configuración recomendada.
- No soporta tool calling, agentes, visión, audio generation ni modos de razonamiento extendido.
- La detección de idioma no es fiable en este fine-tuning; debe delegarse en el modelo Whisper estándar.

## Casos de uso

- Subtitulado de vídeo para creadores en hindi: el modelo transcribe el audio en devanagari y, con `word_timestamps=True`, permite generar subtítulos sincronizados; la integración en Cut Video Gaps demuestra este flujo en macOS.
- Edición de vídeo asistida por transcripción: al obtener texto con marcas temporales por palabra, una herramienta puede localizar y cortar silencios o fragmentos concretos sin revisar el audio manualmente.
- Transcripción de reuniones y entrevistas en hindi: el procesamiento en CPU con int8 permite desplegarlo en portátiles sin GPU, fragmentando el audio por pausas con VAD.
- Archivado y búsqueda de contenido audiovisual: convertir horas de audio hindi en texto indexable para motores de búsqueda internos o sistemas de gestión documental.
- Accesibilidad: generación de subtítulos para contenido educativo o institucional dirigido a hablantes de hindi, ejecutándose localmente sin enviar audio a servicios en la nube.
- Pipelines de ASR por lotes en servidores sin GPU: al ser CTranslate2 int8, puede desplegarse en contenedores CPU estándar con faster-whisper, reduciendo coste frente a alternativas con GPU.
- Preprocesamiento para otros sistemas NLP: transcripción de corpus de voz hindi para alimentar clasificadores, resúmenes o traducción posterior.

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| WER en Kathbath (hindi) | 10,3 % | Reportado por Vistaar para el checkpoint original |
| Velocidad en Apple M1 (8 hilos, int8) | aproximadamente 1,2× la duración del audio | Model card del repositorio |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de LLM, que no aplican a un modelo ASR. Tampoco se ofrecen comparaciones numéricas con otros modelos ASR en la model card.

## Requisitos de hardware

- Inferencia en CPU: el artefacto está pensado para CPU con `compute_type="int8"`; no requiere GPU.
- VRAM estimada para GPU: no disponible; el repositorio no documenta despliegue en GPU, aunque CTranslate2 puede ejecutarse en CUDA si se convierte o configura para ello.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? El modelo base whisper-medium ocupa alrededor de 769 M parámetros; en int8 el peso ronda los 0,8 GB, por lo que cabría en cualquier GPU consumer moderna, pero el autor no documenta esta ruta.
- Opciones de despliegue: faster-whisper 1.0.3 sobre CTranslate2 4.4.0. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a Whisper.
- Latencia y throughput: aproximadamente 1,2 veces la duración del audio en Apple M1 con 8 hilos e int8. No hay datos para otras plataformas.
- Tamaño del repositorio: 0,8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cutvideogaps/indicwhisper-hindi-ct2 | whisper-medium (aprox. 769 M) | fragmentos de hasta 8 s recomendados | hindi | MIT | CTranslate2 int8 | Fine-tuning hindi de Vistaar, optimizado para CPU |
| openai/whisper-medium | aprox. 769 M | ventana de 30 s | multilingüe (incluye hindi) | MIT | safetensors, GGUF, CTranslate2 | Modelo base; menor precisión específica en hindi |
| AI4Bharat IndicWhisper (checkpoint original) | whisper-medium | ventana de 30 s | hindi | MIT | safetensors (transformers) | Pesos originales sin convertir; requiere GPU o transformers |
| AI4Bharat IndicWhisper large (si existe en Vistaar) | whisper-large | ventana de 30 s | hindi | MIT | safetensors | No confirmado en la información disponible |

La comparación se limita a lo documentado: no hay datos de benchmarks cruzados entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo se fine-tuneó sin tokens de timestamp; por eso el autor recomienda `without_timestamps=True` y fragmentos de hasta 8 segundos cortados por VAD mediante `clip_timestamps`.
- Alucinaciones documentadas: añade colas cortas como "धन्यवाद" o "सही" tras cada fragmento, de menos de 0,5 s y comenzando exactamente donde acaba el segmento anterior.
- `no_speech_prob` es siempre cercano a 0, por lo que no sirve para detectar esas alucinaciones; hay que filtrarlas por duración y posición.
- También puede alucinar una última palabra estirada más de 1,5 s al final de un segmento, interpretada como un "धन्यवाद" superpuesto al silencio.
- La detección de idioma no es fiable en este fine-tuning; debe usarse el modelo Whisper estándar para identificar el idioma.
- Solo soporta hindi; no es multilingüe pese a derivar de Whisper medium.
- Riesgo de sesgo: no hay información sobre la composición demográfica del corpus Vistaar ni sobre sesgos de acento, género o registro.
- Licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de AI4Bharat y citar el paper de Vistaar (Bhogale et al., Interspeech 2023).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria independiente.
- No hay garantías de mantenimiento ni de actualización por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cutvideogaps/indicwhisper-hindi-ct2
- Proyecto Vistaar (AI4Bharat): https://github.com/AI4Bharat/vistaar
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-medium
- Paper Vistaar (Bhogale et al., Interspeech 2023): no disponible enlace directo en la información proporcionada
- Aplicación que lo usa: https://cutvideogaps.com
