# aoiandroid/whisper-base

## Resumen

`aoiandroid/whisper-base` es un espejo sin modificaciones del modelo `openai/whisper-base` de OpenAI, publicado por el usuario aoiandroid para que la aplicación Cription no dependa de un repositorio de terceros. El modelo original es un sistema de reconocimiento automático del habla (ASR) de arquitectura transformer encoder-decoder con aproximadamente 74 millones de parámetros, capaz de transcribir audio, identificar el idioma hablado, generar marcas de tiempo y traducir audio a inglés.

El espejo fija el commit `e37978b90ca9030d5170a5c07aadb050351a65bb` del repositorio original y conserva la licencia Apache 2.0. Se trata de un subconjunto del repositorio fuente: 10 archivos, 4,4 MB, con las mismas rutas y los mismos tamaños y hashes que el original, sin ningún cambio de contenido.

Su relevancia es de ingeniería, no de modelado: no aporta mejoras sobre el modelo de OpenAI, pero garantiza reproducibilidad y disponibilidad continua de un conjunto concreto de archivos para una aplicación. El repositorio no declara pipeline, idiomas ni descargas, y su tamaño total es muy inferior al que tendrían los pesos de un modelo de 74 millones de parámetros, por lo que conviene verificar su contenido antes de usarlo como sustituto del repositorio oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con front-end de espectrograma log-Mel, según la documentación del modelo original de OpenAI; no descrito en la ficha del espejo |
| Parametros totales | Aproximadamente 74 millones en la variante base de Whisper; no indicado en la ficha del espejo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 posiciones en el encoder y hasta 448 tokens en el decoder, según el modelo original); no indicado en la ficha del espejo |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | Multilingüe (99 idiomas según la documentación de OpenAI); no especificado en la ficha del espejo |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible: el espejo declara 10 archivos y 4,4 MB en total, un tamaño insuficiente para alojar los pesos del modelo; el repositorio original distribuye pesos en formato PyTorch |

## Arquitectura y entrenamiento

La ficha del espejo no documenta ni la arquitectura ni el entrenamiento: se limita a indicar que reproduce fielmente los archivos de `openai/whisper-base`. Según la documentación del modelo original, Whisper es un transformer encoder-decoder que trabaja sobre espectrogramas log-Mel de 80 canales calculados en ventanas de 25 ms con salto de 10 ms, agrupados en segmentos de 30 segundos. El decoder es autorregresivo y se controla mediante tokens de tarea que seleccionan transcripción, traducción al inglés, identificación de idioma y predicción de marcas de tiempo, lo que permite usar un único modelo para varias tareas de voz. El tokenizador es un BPE a nivel de byte con vocabulario multilingüe.

En cuanto a los datos, la información proporcionada no incluye detalles de entrenamiento para la variante base. La documentación de OpenAI indica que la familia Whisper se entrenó con 680 000 horas de audio débilmente supervisado recogido de internet, sin ajuste fino supervisado con RLHF ni DPO; el número exacto de horas y de tokens empleado específicamente en la variante base no está disponible. Tampoco hay constancia de innovaciones adicionales en el espejo, que no introduce cambios sobre el original.

## Capacidades

- Reconocimiento automático del habla en múltiples idiomas, con salida de texto plano.
- Traducción de audio de otros idiomas al inglés como tarea nativa del modelo.
- Identificación del idioma del audio de entrada.
- Predicción de marcas de tiempo a nivel de segmento, útil para subtitulado y alineación.
- Robustez razonable frente a ruido de fondo y variación de acentos, según la evaluación publicada por OpenAI para la familia Whisper.
- Procesamiento por ventanas de 30 segundos; el audio más largo requiere segmentación y encadenamiento externo.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso; es un modelo de voz a texto.
- No realiza diarización de hablantes por sí solo.
- No es un modelo de chat ni sigue instrucciones en lenguaje natural.

## Casos de uso

- Transcripción de notas de voz y reuniones: el modelo convierte grabaciones en texto y, con una capa de segmentación, permite procesar audios de cualquier duración encadenando ventanas de 30 segundos.
- Subtitulado automático: sus marcas de tiempo por segmento permiten generar ficheros de subtítulos (SRT/VTT) que después se pueden alinear a nivel de palabra con herramientas como WhisperX.
- Traducción de contenido audiovisual al inglés: la tarea de traducción integrada evita tener que encadenar un ASR y un traductor independientes cuando el destino es el inglés.
- Indexación y búsqueda sobre archivos de audio: transcripción masiva de pódcasts o grabaciones internas para construir un índice de texto consultable, donde el coste por hora de audio es bajo al tratarse de un modelo pequeño.
- Análisis de llamadas de atención al cliente: conversión de grabaciones a texto para analítica posterior (motivos de contacto, cumplimiento, muestreo de calidad), siempre que se cumplan los requisitos legales de tratamiento de datos.
- Aplicaciones móviles o embebidas con dictado: el reducido tamaño del modelo permite ejecutarlo en CPU o en GPUs integradas sin depender de servicios en la nube.
- Accesibilidad: generación de subtítulos en directo o diferidos para vídeos formativos, con la salvedad de que la variante base comete más errores que las variantes medium o large.
- Preprocesado para pipelines RAG sobre contenido hablado: transcripción previa a la vectorización de documentos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (unos 300 MB de pesos), alrededor de 150 MB en fp16 y cerca de 75 MB en int8, más el coste de las activaciones, que es pequeño por la ventana fija de 30 segundos.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente; una RTX 3060, una RTX 4090 o una T4 van sobradamente. Aceleradores como A100 o H100 no aportan ventaja práctica para este tamaño.
- Cabe en GPU de consumo y también en CPU: es habitual ejecutarlo en portátiles y en dispositivos sin acelerador dedicado.
- Opciones de despliegue: `transformers` de Hugging Face con la clase de Whisper, `faster-whisper` sobre CTranslate2, `whisper.cpp` para CPU, WhisperX para alineación temporal y endpoints gestionados de Hugging Face. El soporte en vLLM o TGI no está confirmado en la información proporcionada.
- Latencia y throughput: no disponibles. Dependen del backend, del uso de cuantización y del hardware; al ser un modelo de 74 millones de parámetros, la latencia es baja en comparación con las variantes medium y large de la misma familia.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoiandroid/whisper-base (espejo) | Aproximadamente 74 M (heredados del original) | 30 s | Multilingüe (99 según la documentación de OpenAI) | apache-2.0 | Espejo de un subconjunto de archivos, sin pipeline ni descargas declaradas |
| openai/whisper-tiny | Aproximadamente 39 M | 30 s | Multilingüe | apache-2.0 | Repositorio oficial de OpenAI en Hugging Face |
| openai/whisper-base | Aproximadamente 74 M | 30 s | Multilingüe | apache-2.0 | Repositorio oficial de OpenAI en Hugging Face |
| openai/whisper-small | Aproximadamente 244 M | 30 s | Multilingüe | apache-2.0 | Repositorio oficial de OpenAI en Hugging Face |

No hay datos de benchmarks en la información proporcionada que permitan comparar la calidad de transcripción entre estas variantes. La diferencia principal entre ellas es el número de parámetros y, en consecuencia, el coste de inferencia y la precisión esperada.

## Limitaciones y advertencias

- El repositorio es un espejo, no un modelo nuevo: no incorpora mejoras, correcciones ni mantenimiento propio.
- El tamaño declarado (10 archivos, 4,4 MB) es muy inferior al de los pesos de un modelo de 74 millones de parámetros, por lo que es probable que el espejo solo contenga archivos de configuración y tokenizador. Conviene comprobar el contenido antes de usarlo para inferencia.
- El repositorio registra 0 descargas y 0 likes y no declara pipeline, lo que implica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación: el modelo puede generar texto plausible en tramos de silencio, música o ruido, un comportamiento documentado en la familia Whisper.
- Deriva de marcas de tiempo en audios largos si no se segmentan correctamente.
- Precisión inferior a las variantes medium y large, especialmente en audio ruidoso, solapamiento de voces y acentos poco representados.
- Cobertura desigual entre idiomas: el rendimiento cae en lenguas con menos datos de entrenamiento, y la variante base es la más limitada del tramo pequeño de la familia.
- Sin diarización, sin tool calling y sin razonamiento multi-paso; no debe plantearse como sustituto de un modelo conversacional.
- Límite estricto de 30 segundos por ventana, que obliga a implementar segmentación y solapamiento en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia. El espejo no añade restricciones adicionales, pero el crédito corresponde a los autores originales.
- Sesgos heredados del corpus débilmente supervisado: posibles diferencias de calidad entre variedades dialectales, y sesgos de género en las tareas de traducción.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/aoiandroid/whisper-base
- Modelo original: https://huggingface.co/openai/whisper-base
- Commit exacto replicado: https://huggingface.co/openai/whisper-base/tree/e37978b90ca9030d5170a5c07aadb050351a65bb
- Repositorio oficial de OpenAI en GitHub: https://github.com/openai/whisper
- Artículo de referencia de la familia Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
