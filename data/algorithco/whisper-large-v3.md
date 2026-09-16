# algorithco/whisper-large-v3

## Resumen

algorithco/whisper-large-v3 es un repositorio de pesos del modelo Whisper large-v3, el sistema de reconocimiento automático de voz (ASR) y traducción de voz desarrollado por OpenAI y publicado originalmente en openai/whisper-large-v3. El repositorio que nos ocupa es una reproducción alojada por el usuario algorithco, con 1.543.490.560 parámetros reales (verificados en los safetensors) y un tamano de repositorio de 24,7 GB. La licencia declarada es Apache-2.0 y el pipeline asociado es automatic-speech-recognition.

El modelo resuelve dos tareas principales: transcripción de audio a texto en el mismo idioma de la fuente y traducción de audio a texto en inglés. Está entrenado con aproximadamente 5 millones de horas de audio (1 millón de horas débilmente etiquetadas más 4 millones de horas pseudo-etiquetadas generadas con Whisper large-v2) y cubre 99 idiomas según la lista declarada en la model card, incluidos el castellano, el catalán, el euskera y el gallego. Su relevancia actual radica en que sigue siendo una referencia de ASR multilingüe en modo zero-shot: generaliza a dominios y conjuntos de datos no vistos sin ajuste fino adicional.

La arquitectura es un transformer encoder-decoder de tipo secuencia a secuencia sobre espectrogramas mel, con dos diferencias menores respecto a large-v2: la entrada de espectrograma usa 128 bins de frecuencia mel en lugar de 80, y se añade un token de idioma para cantonés. Frente a large-v2, la model card reporta una reducción del 10 % al 20 % en la tasa de error en una amplia variedad de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder secuencia a secuencia sobre espectrograma mel (familia Whisper) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible como contexto de texto; el modelo consume audio en ventanas de 30 s por segmento y el pipeline de Transformers permite audios de longitud arbitraria mediante segmentacion |
| Tipos de cuantizacion | No especificados en la model card. El repositorio publica pesos en pytorch, jax y safetensors; no incluye GGUF. Las conversiones a fp16/bf16, int8 y GGUF dependen de herramientas de terceros no documentadas en el repo |
| Idiomas soportados | 99 idiomas: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | apache-2.0 |
| Formato de pesos | pytorch, jax, safetensors |
| Tarea declarada | automatic-speech-recognition (transcripcion y traduccion de voz) |
| Tamano del repositorio | 24,7 GB |
| Autor del repositorio | algorithco (reproduccion de openai/whisper-large-v3) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Whisper large-v3 mantiene la misma arquitectura que Whisper large y large-v2, con dos cambios concretos documentados: el espectrograma de entrada pasa de 80 a 128 bins de frecuencia mel, y se incorpora un token nuevo para el idioma cantonés. Es un transformer encoder-decoder que recibe representaciones de audio en formato espectrograma y genera texto autoregresivamente, con tokens especiales para la tarea (transcripción o traducción), el idioma y las marcas de tiempo.

El entrenamiento se realizó sobre una mezcla de 1 millón de horas de audio con etiquetado débil y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, durante 2,0 épocas. La model card no menciona fases de RLHF ni DPO: el ajuste es puramente supervisado sobre datos etiquetados y pseudo-etiquetados. La innovación principal respecto a large-v2 es el aumento de resolución mel y la ampliación de cobertura lingüística, que se traduce en la mejora del 10 % al 20 % en errores declarada por el autor.

En decodificación, el modelo soporta las heurísticas clásicas de Whisper: temperatura con retroceso escalonado (temperature fallback), condicionamiento en tokens previos, umbral de ratio de compresión (compression_ratio_threshold, por defecto 1,35), umbral de log-probabilidad (logprob_threshold, por defecto -1,0), umbral de ausencia de habla (no_speech_threshold, por defecto 0,6), búsqueda por haces y predicción de marcas de tiempo a nivel de frase o de palabra.

## Capacidades

- Transcripción de voz a texto en el mismo idioma del audio (tarea "transcribe").
- Traducción de voz a texto en inglés desde cualquiera de los 99 idiomas soportados (tarea "translate").
- Detección automática del idioma de origen; también permite forzar el idioma con el argumento language.
- Generación de marcas de tiempo a nivel de frase (return_timestamps=True) y a nivel de palabra (return_timestamps="word").
- Procesamiento de audio de longitud arbitraria mediante segmentación en el pipeline de Transformers.
- Procesamiento por lotes de varios archivos de audio con el parámetro batch_size.
- Decodificación configurable mediante generate_kwargs (max_new_tokens de 448, num_beams, umbrales de calidad, retorno de timestamps).
- Cobertura multilingüe amplia, con presencia explícita de es, ca, gl y eu entre los idiomas declarados.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo ni procesamiento de texto general: es exclusivamente un modelo de voz a texto.

## Casos de uso

- Subtitulado automático de vídeo: el modelo genera marcas de tiempo a nivel de palabra, lo que permite crear ficheros de subtítulos con sincronización fina para plataformas de vídeo y material formativo.
- Transcripción de reuniones y actas: con segmentación de audio largo y decodificación por lotes, se pueden transcribir horas de grabación en un solo proceso, manteniendo el idioma original de cada interviniente a nivel de segmento.
- Traducción de contenido audiovisual al inglés: usando la tarea "translate" se obtiene texto en inglés directamente desde el audio original, útil para publicar material en mercados internacionales sin una fase intermedia de traducción de texto.
- Indexación y búsqueda semántica de archivos de audio: transcribir un archivo de podcasts o de grabaciones telefónicas permite almacenar el texto resultante en un motor de búsqueda y localizar fragmentos por palabra clave con marcas temporales.
- Analítica de atención al cliente: transcripción de llamadas y conversaciones de soporte para alimentar sistemas de clasificación de motivos de contacto y control de calidad, con la ventaja de que el modelo funciona en modo zero-shot sin ajuste por dominio.
- Accesibilidad en directo o semidirecto: generación de subtítulos para personas con discapacidad auditiva en eventos, clases o retransmisiones, siempre que se acepte la latencia de una inferencia por segmento y se revise la salida.
- Investigación lingüística y creación de corpus: transcripción de grabaciones de campo en idiomas con pocos recursos dentro de la lista soportada, aprovechando la capacidad zero-shot y las marcas de tiempo para alinear audio y texto.
- Archivado y cumplimiento normativo: conversión de grabaciones de voz almacenadas a texto buscable para auditorías internas y conservación documental, con despliegue en infraestructura propia para no enviar audio a servicios externos.
- Entrada de voz en aplicaciones: dictado de notas o formularios mediante un modelo autoalojado, integrable en el backend con Transformers o con runtimes optimizados para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una mejora relativa del 10 % al 20 % en la tasa de error respecto a Whisper large-v2 en una amplia variedad de idiomas, sin desglosar por conjunto de evaluación ni por idioma. No se dispone de cifras de WER, MMLU, HumanEval ni GSM8K, que por otra parte no aplican a un modelo de ASR.

## Requisitos de hardware

- Peso de los parametros en precision completa (fp32): aproximadamente 6,2 GB para 1.543.490.560 parametros.
- Peso en fp16 o bf16: aproximadamente 3,1 GB, mas memoria para activaciones, buffers de atencion y haces de decodificacion.
- Peso en int8: aproximadamente 1,6 GB en el mejor de los casos, segun el esquema de cuantizacion aplicado.
- VRAM estimada para inferencia: entre 4 y 8 GB en fp16 con lotes pequenos, y 10-16 GB si se usan lotes grandes y num_beams mayor que 1.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 y L40S para despliegues de alto volumen y multiples peticiones concurrentes; RTX 4090, RTX 3090, RTX A5000 y RTX 6000 Ada para servidores de un solo nodo.
- Si cabe en GPU de consumo: si. En fp16 es viable en RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 y tarjetas de 8 GB si se reduce el tamano de lote; en CPU funciona, pero con latencia mucho mayor.
- Tarjetas tipo T4 de 16 GB siguen siendo suficientes para fp16 con lotes moderados, lo que facilita el despliegue en instancias cloud economicas.
- Opciones de despliegue: el pipeline automatic-speech-recognition de Hugging Face Transformers es la via documentada en la model card, con soporte de torch_dtype float16, low_cpu_mem_usage y safetensors. Otros runtimes habituales de la familia Whisper (CTranslate2/faster-whisper, whisper.cpp, servidores de inferencia tipo TGI) no estan documentados en la informacion proporcionada y su compatibilidad con este repositorio concreto no esta verificada.
- Latencia y throughput: no disponible. No se han publicado cifras de factor de tiempo real (RTF), tokens por segundo ni latencia por segmento en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio e idiomas | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| algorithco/whisper-large-v3 | 1.543.490.560 | 30 s por segmento; 99 idiomas declarados | apache-2.0 | Repositorio de terceros con 0 descargas y 0 likes; pesos en pytorch, jax y safetensors; 24,7 GB |
| openai/whisper-large-v3 | Mismos pesos que large-v3 (misma arquitectura) | 30 s por segmento; misma lista de idiomas | apache-2.0 | Repositorio oficial citado en la propia model card; es la referencia recomendada frente a reproducciones de terceros |
| openai/whisper-large-v2 | No indicado en la informacion proporcionada | 30 s por segmento; 80 bins mel y sin token de cantonés | apache-2.0 | Modelo previo usado para generar las 4 millones de horas de pseudo-etiquetas de large-v3; la model card reporta entre un 10 % y un 20 % mas de error que large-v3 |
| openai/whisper-large | No indicado en la informacion proporcionada | 30 s por segmento; 80 bins mel | apache-2.0 | Primera version large, citada como base arquitectonica en la model card |
| Modelos ASR alternativos (Wav2Vec2, Conformer, etc.) | No disponible | No disponible | No disponible | No se ha encontrado informacion sobre ellos en el material proporcionado |

## Limitaciones y advertencias

- Procedencia de los pesos: el repositorio pertenece a un usuario tercero (algorithco) con 0 descargas y 0 likes, y no es el repositorio oficial de OpenAI. Antes de usarlo en produccion conviene verificar la integridad y el origen de los safetensors frente a openai/whisper-large-v3.
- Fechas anomalas: los metadatos indican creacion y actualizacion el 2026-09-16, una fecha posterior a la del entrenamiento del modelo original; conviene tratarla como un dato no fiable del repositorio.
- Alucinacion: Whisper puede generar texto plausible en segmentos con silencio, ruido o musica. Se mitiga con no_speech_threshold, compression_ratio_threshold y logprob_threshold, pero no se elimina por completo.
- Sesgo linguistico: el rendimiento es desigual entre los 99 idiomas declarados. Los idiomas con menos datos de entrenamiento presentan tasas de error mas altas, y la lista de idiomas no garantiza calidad homogenea.
- Traduccion limitada al ingles: la tarea "translate" solo produce texto en ingles; no hay traduccion directa entre pares de idiomas distintos del ingles.
- Ventana fija de 30 segundos: el audio largo requiere segmentacion. Un troceado incorrecto puede cortar palabras, perder contexto entre segmentos o duplicar texto en las fronteras.
- Sin diarizacion de hablantes: el modelo transcribe voz, pero no identifica quien habla, por lo que no sirve por si solo para atribuir intervenciones en reuniones.
- No es un modelo de proposito general: no genera texto libre, no razona, no ejecuta herramientas y no procesa imagenes. No debe evaluarse con benchmarks de lenguaje (MMLU, GSM8K) porque no aplican.
- Restricciones de licencia: la licencia declarada es apache-2.0, que permite uso comercial, pero se recomienda revisar los terminos del repositorio original de OpenAI y las condiciones de los datos de entrenamiento antes de un despliegue comercial.
- Coste de cuantizacion no soportado oficialmente: la model card no documenta cuantizaciones ni pesos GGUF en este repositorio, de modo que cualquier conversion a int8 o GGUF es una operacion externa que puede degradar la precision y que no esta validada por el autor.
- Riesgo de uso indebido: la transcripcion automatica de conversaciones tiene implicaciones de privacidad y proteccion de datos; en la UE su uso en produccion exige una base juridica adecuada y, segun el caso, evaluacion de impacto.

## Enlaces

- Repositorio de HuggingFace del modelo: https://huggingface.co/algorithco/whisper-large-v3
- Repositorio oficial de referencia citado en la model card: https://huggingface.co/openai/whisper-large-v3
- Modelo predecesor citado: https://huggingface.co/openai/whisper-large-v2
- Modelo base arquitectonico citado: https://huggingface.co/openai/whisper-large
- Paper de Whisper: Robust Speech Recognition via Large-Scale Weak Supervision, Alec Radford et al.: https://huggingface.co/papers/2212.04356
- Version del paper en arXiv: https://arxiv.org/abs/2212.04356
- Dataset de ejemplo usado en los ejemplos de la model card: https://huggingface.co/datasets/distil-whisper/librispeech_long
- Muestras de audio de LibriSpeech referenciadas en el widget del repositorio: https://cdn-media.huggingface.co/speech_samples/sample1.flac y https://cdn-media.huggingface.co/speech_samples/sample2.flac
- Nota sobre la busqueda web: los resultados devueltos (devicetests.com y sus paginas de pruebas de raton, monitor y latencia) no guardan relacion con el modelo y no aportan enlaces tecnicos utilizables.
