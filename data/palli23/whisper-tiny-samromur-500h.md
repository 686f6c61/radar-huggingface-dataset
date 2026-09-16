# palli23/whisper-tiny-samromur-500h

## Resumen

whisper-tiny-samromur-500h es un ajuste fino del modelo Whisper-Tiny (≈39 M de parámetros) sobre un subconjunto anidado de 500 horas del corpus islandés Miljón/samromur-500h. Lo publica el usuario palli23 en HuggingFace y forma parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), cuyo objetivo es medir hasta qué punto un modelo ASR pequeño, entrenado con datos suficientes en un único idioma, puede competir con modelos multilingües mucho mayores.

El problema que aborda es el reconocimiento automático de habla (ASR) en islandés, un idioma de bajos recursos con pocos hablantes y, por tanto, con menos datos y menos modelos específicos disponibles. La apuesta técnica es la contraria a la tendencia dominante: en lugar de usar un modelo multilingüe de gran tamaño, se parte de un Whisper-Tiny preentrenado y se especializa con 500 horas de audio islandés, lo que reduce drásticamente los requisitos de cómputo en inferencia.

Es relevante ahora porque el estudio de escalado del que forma parte cuestiona la asunción de que hacen falta modelos gigantes para obtener un WER competitivo en idiomas concretos. Con solo 37,76 M de parámetros y un repositorio de 0,3 GB, es desplegable en CPU y en hardware de gama baja, algo crítico para transcripción a gran escala, subtitulado en directo o anotación de corpus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de la familia Whisper; la model card no detalla el número de capas ni dimensiones |
| Parámetros totales | 37.760.640 (≈37,8 M según safetensors; la model card indica 39 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; la familia Whisper procesa ventanas de audio de 30 segundos |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors, por lo que cualquier cuantización requiere conversión externa |
| Idiomas soportados | Islandés (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-Tiny: un transformer encoder-decoder que convierte espectrogramas mel en secuencias de tokens de texto, con tarea ASR y tokens de idioma heredados del preentrenamiento multilingüe de OpenAI. Se trata de un modelo denso, sin mezcla de expertos ni componentes de estado recurrente. La model card no especifica el número de capas, la dimensión del modelo ni la configuración de atención, más allá de indicar el tamaño de 39 M de parámetros.

El entrenamiento consiste en un ajuste fino sobre un subconjunto anidado de 500 horas del pool de escalado Miljón/samromur-500h, un corpus de habla islandesa. La model card no detalla la composición exacta del subconjunto, el número de tokens de audio, el régimen de entrenamiento (épocas, LR, precisión) ni si hubo etapas de RLHF o DPO; en ASR estos métodos no son habituales y no se mencionan. La innovación destacable no está en la arquitectura, sino en el diseño experimental: el checkpoint pertenece a una serie de puntos de escalado que permiten comparar curvas de WER/CER frente a modelos multilingües mucho mayores, manteniendo fijo el idioma y variando el volumen de datos.

## Capacidades

- Reconocimiento de voz en islandés: transcripción de audio a texto con ortografía islandesa.
- Procesamiento de audio en ventanas cortas (el estándar de la familia Whisper son 30 s por ventana), lo que exige troceado y concatenación para audios largos.
- Transcripción de habla espontánea y de corpus de lectura, dado el origen del entrenamiento en un corpus de habla islandesa.
- Idiomas: únicamente islandés declarado; el preentrenamiento de Whisper cubre más idiomas, pero el ajuste fino es monolingüe y no hay evidencia publicada de retención multilingüe.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado; es un modelo puramente seq2seq de ASR.
- Modo de razonamiento explícito (thinking), visión o audio más allá del habla: no soportado.
- Marcas de tiempo, diarización de hablantes y detección de idioma: no declaradas en la model card.

## Casos de uso

- Subtitulado de contenido audiovisual islandés: el modelo transcribe la pista de audio por fragmentos y se pueden generar subtítulos SRT con el texto reconocido; su tamaño reducido permite procesar horas de vídeo en CPU sin coste de GPU.
- Anotación y preetiquetado de corpus de habla: se usa como generador de transcripciones iniciales sobre nuevas grabaciones islandesas, que después se revisan manualmente, reduciendo el coste de anotación frente a transcribir desde cero.
- Transcripción de archivos orales y patrimonio sonoro: entrevistas, programas de radio o registros históricos en islandés se pueden transcribir por lotes gracias a los 37,8 M de parámetros y al repositorio de 0,3 GB, que cabe en cualquier disco y se carga en memoria sin problemas.
- Analítica de llamadas y atención al cliente: transcripción de conversaciones telefónicas en islandés para extraer texto indexable y alimentar búsqueda o clasificación posterior; requiere troceado previo porque el modelo trabaja con ventanas cortas.
- Accesibilidad y dictado en aplicaciones locales: integración en herramientas de escritorio o móviles que transcriben voz a texto sin enviar audio a la nube, viable en hardware de gama baja por el reducido coste de inferencia.
- Evaluación comparativa de metodologías de escalado: como checkpoint de referencia en experimentos académicos sobre cuántas horas de audio necesita un modelo pequeño para igualar a un modelo multilingüe grande en un idioma concreto.
- Asistencia a la enseñanza del islandés: transcripción de grabaciones de estudiantes para que puedan comparar su pronunciación transcrita con el texto objetivo, siempre con supervisión, dado el margen de error propio de un modelo tiny.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026) para la metodología y los resultados de WER y CER, pero no incluye cifras concretas ni comparativas numéricas en el repositorio.

## Requisitos de hardware

- VRAM estimada en fp32: ≈151 MB solo para pesos (37.760.640 parámetros × 4 bytes), más activaciones y buffers de audio, en la práctica por debajo de 1 GB.
- VRAM estimada en fp16/bf16: ≈76 MB de pesos.
- VRAM estimada en int8: ≈38 MB; en int4, ≈19 MB (requiere conversión, no incluida en el repositorio).
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM sirve; no necesita A100, H100 ni RTX 4090. Una GTX 1050, una iGPU moderna o incluso CPU sola son suficientes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1650, Jetson Orin Nano y similares.
- Opciones de despliegue: al publicarse solo safetensors, se puede usar con transformers (pipeline de ASR); para otros runtimes (llama.cpp/whisper.cpp, Ollama, faster-whisper/CTranslate2, ONNX Runtime, TensorRT) es necesario convertir los pesos, ya que el repositorio no incluye GGUF ni ONNX.
- Latencia y throughput estimados: no disponibles; no se han publicado medidas en la información proporcionada. Por el tamaño del modelo, es esperable que sea inferior al tiempo real en CPU, pero es una estimación sin verificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Rendimiento (WER/CER) |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur-500h | 37,8 M | Ventanas de 30 s (familia Whisper) | Islandés (is) | cc-by-sa-4.0 | No disponible |
| openai/whisper-tiny | 37,8 M (≈39 M) | Ventanas de 30 s | Multilingüe (~99 idiomas) | Apache-2.0 | No disponible |
| openai/whisper-base | ≈74 M | Ventanas de 30 s | Multilingüe (~99 idiomas) | Apache-2.0 | No disponible |
| openai/whisper-large-v3 | ≈1550 M | Ventanas de 30 s | Multilingüe (~99 idiomas) | Apache-2.0 | No disponible |

La comparación relevante es la del artículo del que procede el checkpoint: modelos pequeños especializados en un idioma frente a modelos multilingües grandes. Los datos concretos de esa comparación no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Monolingüe: solo islandés declarado. Su uso con otros idiomas no está respaldado por la model card y cabe esperar degradación severa.
- Tamaño tiny: la capacidad de un modelo de 37,8 M de parámetros limita la precisión, especialmente con ruido de fondo, solapamiento de hablantes, acentos no representados en el corpus o audio de baja calidad.
- Alucinación y bucles de repetición: los modelos de la familia Whisper tienden a generar texto inventado o repetitivo en segmentos de silencio, música o ruido; conviene aplicar detección de silencio y umbrales de confianza en producción.
- Ventana corta: no procesa audio largo de una sola pasada; requiere troceado, lo que puede cortar palabras y afectar a la puntuación y las mayúsculas en las uniones.
- Sesgos de dominio: el rendimiento está condicionado por la composición del subconjunto de 500 h de Miljón/samromur-500h, no detallada en la model card; los dominios poco representados (por ejemplo, habla técnica, dialectos o grabaciones telefónicas) pueden tener una tasa de error mayor.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike). Esto puede condicionar productos propietarios que integren el modelo o sus salidas de forma sustancial; conviene revisarlo con asesoría legal antes de un despliegue comercial.
- Procedencia de los datos: el corpus de entrenamiento tiene su propia licencia y condiciones de uso, que hay que respetar además de la del modelo.
- Adopción muy baja: 5 descargas y 0 likes en el momento de la consulta, sin validación independiente publicada; no hay evidencia de terceros sobre su comportamiento en producción.
- Fechas del repositorio: los metadatos indican creación en 2026-06-03 y actualización en 2026-09-15, coherentes con un artículo de ICASSP 2026, pero conviene verificar la vigencia del checkpoint antes de fijarlo como dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur-500h
- Corpus citado en la model card: Miljón/samromur-500h (URL no disponible en la información proporcionada)
- Artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026): URL no disponible en la información proporcionada
- Repositorio de Whisper de OpenAI (modelo base del ajuste fino): URL no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
