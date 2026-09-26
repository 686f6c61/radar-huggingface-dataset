# beshkenadze/parakeet-ultra-onnx

## Resumen

Parakeet Ultra - ONNX es la exportación a formato ONNX de moondream/parakeet-ultra, un modelo de reconocimiento automático del habla (ASR) multilingüe. Parakeet-ultra es a su vez un post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3: conserva la misma arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer), el mismo tokenizer y los mismos 25 idiomas, pero mejora la precisión de transcripción. El repositorio lo publica el usuario beshkenadze para poder ejecutar el modelo fuera del ecosistema NeMo, concretamente desde Rust mediante ONNX Runtime con DirectML en Windows, como motor del motor de transcripción de la aplicación Tishina.

El interés práctico de esta ficha está en que elimina la dependencia de PyTorch y de NeMo: el modelo se distribuye como dos grafos ONNX (encoder en fp16 y decoder/joint en fp32) más un vocabulario SentencePiece de 8192 tokens. Los grafos mantienen las mismas entradas y salidas que las exportaciones de parakeet-tdt-0.6b-v3 ampliamente usadas, por lo que cualquier runtime compatible con aquellas (onnx-asr, parakeet-rs) funciona directamente con estos ficheros.

Con 0,6 mil millones de parámetros y un peso total de aproximadamente 1,3 GB, es un modelo que cabe sin problemas en GPU de consumo e incluso puede ejecutarse en CPU. La licencia CC-BY-4.0 permite uso comercial con atribución. El repositorio no registra descargas ni valoraciones en el momento de la consulta y fue creado el 26 de septiembre de 2026 según los metadatos de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer) para prediction network y joint |
| Parametros totales | 0,6 B (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para texto; en ASR procesa audio por fragmentos. La pipeline de evaluación usa fragmentos de 24 s con 2 s de solapamiento y grabaciones de hasta 5 minutos |
| Tipos de cuantizacion | fp16 (encoder) y fp32 (decoder/joint). No se distribuyen variantes INT8, INT4 ni GGUF |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder-model.fp16.onnx, 1.218.263.142 bytes; decoder_joint-model.onnx, 72.522.409 bytes) + vocab.txt (SentencePiece, 8192 tokens) + config.json |

## Arquitectura y entrenamiento

La arquitectura es la de parakeet-tdt-0.6b-v3 de NVIDIA: un encoder FastConformer que consume características log-mel de 128 bins y un decodificador TDT (Token-and-Duration Transducer) que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por transductor y mejores tasas de emisión. El autor no modifica ningún peso: el encoder y el vocabulario son idénticos byte a byte a los de Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx en la revisión `2255ffe645eb3fa5aca3dd7856b81c5bd4a42c93`, y el decoder es el `fp32/decoder_joint-model.onnx` de esa misma revisión con su fichero externo `.onnx.data` fusionado dentro del grafo.

El único cambio introducido en este repositorio es esa fusión del fichero de pesos externo del decoder en un único grafo ONNX, con salidas bit a bit idénticas a las del original de dos ficheros. No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni si el post-entrenamiento de parakeet-ultra (realizado por moondream sobre v3) usó RLHF, DPO u otra técnica. Sí se documenta con precisión el frontend de características: 128 bins log-mel calculados como en NeMo, con `floor(samples / 160)` tramas y una ventana de 400 muestras centrada en una FFT de 512 puntos. Un frontend que emita una trama de más provoca que el modelo pierda palabras al final de cada fragmento.

## Capacidades

- Transcripción de voz a texto (ASR) multilingüe en 25 idiomas europeos, con foco documentado en ruso, ucraniano e inglés.
- Reconocimiento en formato long-form: la pipeline de evaluación encadena VAD (Silero), fragmentado en trozos de 24 s con 2 s de solapamiento y grabaciones de hasta cinco minutos.
- Reconocimiento de habla con puntuación y mayúsculas en la referencia de evaluación (el WER se calcula insensible a mayúsculas y puntuación, con ё plegada a е).
- No se documentan capacidades de traducción, diarización de hablantes, detección de idioma explícita, tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-lingüístico de transcripción.
- No hay soporte de visión, audio comprensivo, ni modo "thinking".
- Capacidad de ejecución fuera de NeMo: los grafos son compatibles con cualquier runtime que acepte las exportaciones de parakeet-tdt-0.6b-v3, en particular onnx-asr y parakeet-rs.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo se ejecuta en una GPU de consumo o incluso en CPU, y permite procesar audio de forma privada sin enviar datos a servicios en la nube. Los fragmentos de 24 s con solapamiento permiten cubrir reuniones largas sin cortes bruscos.
- Aplicaciones de dictado en escritorio Windows: el repo está pensado explícitamente para ejecutarse desde Rust con ONNX Runtime y DirectML, lo que permite integrarlo en una app nativa sin dependencias de Python ni de CUDA.
- Subtitulado de contenido audiovisual en 25 idiomas europeos: con una única instalación de 1,3 GB se cubre un catálogo multilingüe amplio, útil para plataformas de vídeo con contenido en lenguas minoritarias como estonio, letón, lituano, esloveno, croata, maltés o griego.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de un repositorio de grabaciones para generar índices de texto buscables, aprovechando que el coste por hora de audio es bajo al ser un modelo de 0,6 B.
- Atención al cliente y análisis de llamadas: transcripción de conversaciones telefónicas o de soporte para análisis posterior de calidad, con la ventaja de la licencia CC-BY-4.0, que permite uso comercial con atribución.
- Sistemas de accesibilidad: generación de subtítulos en tiempo real para personas con discapacidad auditiva, ejecutables en el propio equipo del usuario gracias al reducido consumo de VRAM.
- Investigación en ASR multilingüe: al ser un derivado directo de parakeet-tdt-0.6b-v3 con la misma arquitectura y tokenizer, sirve como punto de comparación controlado para estudiar el efecto del post-entrenamiento sobre el WER.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre la pipeline long-form de Tishina (VAD Silero, fragmentos de 24 s con 2 s de solapamiento, sidecar parakeet-rs sobre DirectML, frontend mel exacto de NeMo). El WER es insensible a mayúsculas y puntuación, con ё plegada a е; los intervalos de confianza son un bootstrap emparejado sobre grabaciones.

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra | Cambio [IC 95%] |
|---|---|---|---|
| FLEURS ru, test, 2,7 h | 7,18 % | 5,97 % | -1,21 pp [-1,93; -0,62] |
| Russian LibriSpeech, test, 3,0 h | 10,99 % | 10,40 % | -0,60 pp [-0,91; -0,29] |
| LibriSpeech dev-clean, 6,0 h | 7,34 % | 3,17 % | -4,17 pp [-5,33; -3,09] |

La mejora en inglés se atribuye principalmente a que v3 se detenía a mitad de fragmento tras una pausa, comportamiento que Ultra no reproduce. El autor indica que ambos modelos se ejecutan a la misma velocidad, pero no se publican cifras de latencia ni de throughput. No hay resultados de benchmarks para el resto de los 22 idiomas.

## Requisitos de hardware

- Peso de los ficheros: encoder fp16 de 1.218.263.142 bytes (~1,13 GiB) y decoder/joint fp32 de 72.522.409 bytes (~69 MiB); en torno a 1,2-1,3 GB en disco y en memoria.
- VRAM estimada para inferencia: aproximadamente 2-3 GB en GPU, sumando pesos y activaciones del encoder FastConformer. Cifra estimada a partir del tamaño de los ficheros; el autor no publica mediciones.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) debería ser suficiente. En CPU también es viable por el tamaño reducido del modelo.
- Proveedores de ejecución: el autor usa DirectML sobre Windows; ONNX Runtime permite además CPU y CUDA. Los runtimes compatibles citados son onnx-asr (Python, github.com/istupakov/onnx-asr) y parakeet-rs (Rust, github.com/altunenes/parakeet-rs).
- Detalle de integración: los runtimes que buscan el nombre `encoder-model.onnx` requieren renombrar o enlazar `encoder-model.fp16.onnx` a ese nombre.
- Latencia y throughput: no disponibles. El autor solo afirma que parakeet-ultra y parakeet-tdt-0.6b-v3 corren a la misma velocidad con la misma pipeline.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| beshkenadze/parakeet-ultra-onnx (este) | 0,6 B | 25 | CC-BY-4.0 | ONNX (fp16 + fp32) | FLEURS ru 5,97 %; LibriSpeech dev-clean 3,17 % |
| moondream/parakeet-ultra | 0,6 B | 25 | CC-BY-4.0 | no disponible | Mismo modelo base; sin exportación ONNX |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 | CC-BY-4.0 | NeMo (.nemo) | FLEURS ru 7,18 %; LibriSpeech dev-clean 7,34 % |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | 0,6 B | 25 | CC-BY-4.0 | ONNX (fp16 + fp32, decoder en dos ficheros) | Fuente byte a byte del encoder y el vocabulario de este repo |
| Whisper large-v3 (referencia de categoría) | ~1,55 B (dato de conocimiento general, no verificado en la información proporcionada) | ~99 | MIT | PyTorch, varias conversiones | Sin comparación publicada en la información disponible |

La comparativa de rendimiento solo está disponible frente a parakeet-tdt-0.6b-v3, su antecesor directo. No hay datos que permitan comparar con Whisper, Canary, SeamlessM4T ni otros sistemas multilingües.

## Limitaciones y advertencias

- Es un modelo ASR puro: no genera texto libre, no traduce, no hace tool calling ni razonamiento multi-paso. No debe evaluarse como un LLM.
- Solo se han publicado métricas para ruso (FLEURS, Russian LibriSpeech) e inglés (LibriSpeech dev-clean). El rendimiento en los otros 22 idiomas es desconocido.
- El frontend de características es sensible: debe replicar exactamente el cálculo log-mel de NeMo (128 bins, `floor(samples / 160)` tramas, ventana de 400 muestras en FFT de 512 puntos). Un desajuste de una sola trama provoca pérdida de palabras al final de los fragmentos.
- La evaluación depende de la pipeline de Tishina (VAD Silero, fragmentos de 24 s, solapamiento de 2 s, decodificación con parakeet-rs sobre DirectML). Otros parámetros de fragmentado o de VAD pueden arrojar resultados distintos a los publicados.
- El repositorio tiene 0 descargas y 0 valoraciones y fue creado el 26 de septiembre de 2026, por lo que no hay validación independiente de la comunidad. Los metadatos incluyen una fecha de creación posterior a la fecha de la mayoría de las evaluaciones disponibles, lo que conviene tener en cuenta.
- No se documentan sesgos acústicos ni de variedad dialectal, ni el comportamiento ante audio con ruido, solapamiento de hablantes o acentos distintos de los de los conjuntos de evaluación.
- Riesgo de alucinación inherente a los modelos ASR en segmentos con silencio, ruido o habla ininteligible; la pipeline de evaluación mitiga parcialmente con VAD y solapamiento.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a NVIDIA (parakeet-tdt-0.6b-v3), a moondream (parakeet-ultra) y al exportador ONNX (Olicorne), además del propio repositorio.
- Solo se distribuyen cuantizaciones fp16 y fp32; no hay GGUF ni variantes cuantizadas a 8 o 4 bits, lo que limita el despliegue en hardware muy restringido.
- El decoder en fp32 implica que no se aprovecha fp16 en la parte de prediction network y joint; el ahorro de memoria proviene únicamente del encoder.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beshkenadze/parakeet-ultra-onnx
- Modelo base (post-entrenamiento): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX de origen: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Runtime Python onnx-asr: https://github.com/istupakov/onnx-asr
- Runtime Rust parakeet-rs: https://github.com/altunenes/parakeet-rs

Nota: la búsqueda web asociada a esta consulta devolvió exclusivamente resultados de plataformas de webcams para adultos, sin relación alguna con el modelo. No se han incluido por no ser fuentes relevantes ni verificables para una ficha técnica.
