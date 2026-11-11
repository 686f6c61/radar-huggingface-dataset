# cutvideogaps/indicwhisper-punjabi-ct2

## Resumen

IndicWhisper Punjabi CT2 es una conversión a CTranslate2 en cuantización int8 del modelo IndicWhisper Punjabi de AI4Bharat (IIT Madras), concretamente el checkpoint `whisper-medium-pa_alldata_multigpu` publicado en el marco del proyecto Vistaar. El modelo original es un Whisper medium de OpenAI afinado sobre datos de entrenamiento en punyabí del corpus Vistaar, y está especializado en la transcripción de voz en punyabí escrita en grafía Gurmukhi. Esta variante no modifica los pesos ni el comportamiento del modelo: solo cambia el formato para que sea ejecutable con faster-whisper sobre CPU.

La relevancia de esta ficha es doble. Por un lado, cubre un hueco poco atendido en el ecosistema ASR: la transcripción automática de una lengua india con más de 100 millones de hablantes y una escritura propia, para la que los Whisper genéricos rinden de forma irregular. Por otro, ofrece un artefacto listo para producción en entornos sin GPU, ya que la conversión int8 de CTranslate2 permite inferencia en CPU con un consumo de memoria contenido (el repositorio ocupa 0,8 GB).

El autor de la conversión es el usuario `cutvideogaps`, que la distribuye como descarga opcional para creadores de contenido en punyabí dentro de su producto Cut Video Gaps, con transcripción local en Mac. La licencia es MIT, heredada del modelo original de AI4Bharat. El modelo no incluye cabezas de alineación temporales y el autor documenta limitaciones operativas concretas (ventanas de audio cortas, decodificación greedy) que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a CTranslate2 |
| Parametros totales | 769 M (heredados de Whisper medium; no confirmado de forma explícita en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento; el decoder admite 448 tokens, insuficiente para Gurmukhi en ventanas completas segun el autor |
| Tipos de cuantizacion | int8 (CTranslate2); el repositorio solo publica la variante int8 |
| Idiomas soportados | Punyabí (`pa`), escritura Gurmukhi |
| Licencia | MIT (Copyright (c) 2023 AI4Bharat) |
| Formato de pesos | CTranslate2 (model.bin, config.json, tokenizer.json, vocabulary); sin safetensors ni GGUF en el repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper medium de OpenAI, un transformer encoder-decoder con atención completa, especializado en reconocimiento automático del habla y entrenado originalmente con supervisión débil sobre audio y transcripciones a gran escala. AI4Bharat lo afinó sobre los datos de entrenamiento en punyabí del proyecto Vistaar, un conjunto de benchmarks y corpus para ASR en lenguas indias presentado en Interspeech 2023 (Bhogale et al.). El checkpoint resultante, `whisper-medium-pa_alldata_multigpu`, se entrenó con múltiples GPU sobre el conjunto completo de datos en punyabí, según indica el nombre del checkpoint.

La conversión a CTranslate2 se realizó con `ct2-transformers-converter --quantization int8`, usando CTranslate2 4.4.0 y transformers 4.44.2. Los pesos originales se cargaron con `torch.load(weights_only=True)` y se guardaron en safetensors antes de la conversión; el `tokenizer.json` se generó a partir del `vocab.json` y `merges.txt` originales. Un detalle técnico relevante es que el checkpoint no incluye cabezas de alineación, por lo que el conversor aplicó el valor por defecto (todas las cabezas de la mitad superior del decoder). El modelo se afinó sin tokens de timestamp, lo que condiciona la estrategia de decodificación descrita más abajo.

## Capacidades

- Transcripción de voz en punyabí en escritura Gurmukhi (`language="pa"`).
- Reconocimiento automático del habla sobre audio de hasta 30 s por ventana, aunque el autor recomienda fragmentos de 8 s o menos.
- Generación de timestamps a nivel de palabra (`word_timestamps=True`), pese a no haberse entrenado con tokens de timestamp.
- Detección de actividad de voz (VAD) compatible con el pipeline de faster-whisper para segmentar el audio en pausas.
- Ejecución en CPU mediante cuantización int8, sin requisito de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo.
- La detección automática de idioma no es fiable en este fine-tune; el autor recomienda fijar el idioma explícitamente o detectarlo con un Whisper estándar.

## Casos de uso

- Subtitulado de contenido en punyabí para creadores: el modelo transcribe voz en Gurmukhi y, con `word_timestamps=True`, permite generar subtítulos sincronizados por palabra, útil para plataformas de vídeo y redes sociales.
- Transcripción local en Mac sin GPU: al ejecutarse en CPU con int8 y ocupar 0,8 GB, encaja en flujos de escritorio donde no se quiere enviar audio a la nube, como el propio producto Cut Video Gaps.
- Archivado y búsqueda de material audiovisual en punyabí: transcribir entrevistas, sermones o programas de radio para indexar el contenido y habilitar búsqueda textual sobre el audio.
- Generación de actas y notas de reuniones en punyabí: con segmentación por VAD en fragmentos de 8 s y decodificación greedy, se obtiene texto razonablemente rápido en CPU para documentos internos.
- Preprocesado para pipelines de NLP en punyabí: la salida en Gurmukhi sirve como entrada para traducción automática, análisis de sentimiento o resumen, ampliando el alcance de herramientas que solo operan sobre texto.
- Accesibilidad y documentación de contenido educativo: transcripción de clases o tutoriales en punyabí para alumnos con discapacidad auditiva o para materiales de estudio en texto.
- Prototipado e investigación en ASR de lenguas indias: al ser un artefacto CTranslate2 ligero, sirve como línea base reproducible para comparar con otros fine-tunes de Whisper o con modelos específicos para lenguas indias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas WER/CER sobre Vistaar ni comparaciones numéricas con otros modelos; solo aporta una referencia de velocidad: en un Apple M1 con 8 hilos e int8, el modelo procesa entre 1 y 2,5 veces la duración del audio.

## Requisitos de hardware

- VRAM estimada: no aplica en la variante publicada; el repositorio es int8 para CPU y ocupa 0,8 GB en disco. En GPU, una conversión float16 del Whisper medium equivalente requeriría del orden de 2 GB de VRAM, aunque esa variante no se distribuye en este repositorio.
- GPU recomendadas: no disponibles para esta conversión; el autor la orienta a CPU. Cualquier GPU con soporte CUDA podría ejecutar CTranslate2, pero no se han publicado pruebas.
- Cabe en GPU de consumo: sí, en teoría, cualquier GPU con al menos 2-3 GB de memoria para una variante float16, aunque la variante publicada está pensada para CPU.
- Opciones de despliegue: faster-whisper 1.0.3 sobre CTranslate2; también puede usarse a través de la API de CTranslate2 directamente. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversión adicional.
- Latencia y throughput: en Apple M1 con 8 hilos e int8, entre 1 y 2,5 veces la duración del audio. La decodificación greedy (`beam_size=1`) produce el mismo texto que `beam_size=5` con aproximadamente la mitad de tiempo.
- Parámetros operativos recomendados por el autor: fragmentos de audio de 8 s o menos cortados en pausas mediante VAD y `clip_timestamps`, `without_timestamps=True`, descartar segmentos de menos de 0,3 s o con `no_speech_prob ≥ 0,6` para evitar alucinaciones en los extremos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| IndicWhisper Punjabi CT2 (este) | 769 M (Whisper medium) | 30 s por ventana, decoder 448 tokens | Punyabí (Gurmukhi) | MIT | CTranslate2 int8 | Fine-tune específico para punyabí; pensado para CPU |
| openai/whisper-medium | 769 M | 30 s, decoder 448 tokens | Multilingüe (99 idiomas) | MIT | safetensors, GGUF, CTranslate2 | Base del fine-tune; rendimiento inferior en punyabí según el autor, que recomienda usarlo solo para detección de idioma |
| AI4Bharat IndicWhisper Punjabi original (`whisper-medium-pa_alldata_multigpu`) | 769 M | 30 s, decoder 448 tokens | Punyabí (Gurmukhi) | MIT | safetensors (formato original) | Mismo modelo sin convertir; requiere transformers o conversión propia para faster-whisper |
| Otros fine-tunes de Whisper para lenguas indias | Variable (tiny a large) | 30 s | Según fine-tune | Variable | Variable | No disponible comparación numérica en la información proporcionada |

## Limitaciones y advertencias

- El modelo se entrenó sin tokens de timestamp; los timestamps generados son aproximados y dependen de las cabezas de alineación por defecto del conversor, no de un entrenamiento específico.
- El tokenizador de Whisper consume muchos tokens por palabra en Gurmukhi, por lo que una ventana completa de 30 s puede desbordar los 448 tokens del decoder y perder voz. Es obligatorio fragmentar en piezas de 8 s o menos.
- La detección automática de idioma no es fiable en este fine-tune; hay que fijar `language="pa"` o detectar el idioma con un Whisper estándar.
- Riesgo de alucinación en los extremos de los fragmentos: el autor recomienda descartar segmentos de menos de 0,3 s o con `no_speech_prob ≥ 0,6`.
- Solo cubre punyabí en Gurmukhi; no se ha validado para otras lenguas ni para punyabí en escritura Shahmukhi.
- No se han publicado métricas de calidad (WER/CER) en la información disponible, por lo que no hay evidencia numérica de su precisión frente a alternativas.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright de AI4Bharat y citar el paper de Vistaar si se usa en trabajos académicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción más allá del producto del propio autor.
- Al ser una conversión de formato, cualquier limitación del checkpoint original de AI4Bharat se hereda sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cutvideogaps/indicwhisper-punjabi-ct2
- Proyecto Vistaar de AI4Bharat: https://github.com/AI4Bharat/vistaar
- Paper de Vistaar (Bhogale et al., Interspeech 2023): no disponible como enlace directo en la información proporcionada
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-medium
- Producto del autor: https://cutvideogaps.com
