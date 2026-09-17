# devendradhakad/autodroid-moonshine-ai-moonshine-tiny

## Resumen

El modelo `devendradhakad/autodroid-moonshine-ai-moonshine-tiny` es una reproducción (mirror) en Hugging Face del modelo de reconocimiento automático del habla (ASR) Moonshine Tiny, desarrollado originalmente por Useful Sensors y publicado en octubre de 2024. Se trata de un modelo seq2seq de 27 millones de parámetros diseñado para transcribir audio en inglés a texto, con un objetivo explícito: funcionar en plataformas con memoria y capacidad de cómputo muy limitadas, como hardware de bajo coste para transcripción en tiempo real.

A diferencia de los modelos ASR de gran tamaño, Moonshine Tiny prioriza la eficiencia extrema: 27 M de parámetros es un orden de magnitud inferior al de la mayoría de alternativas orientadas a la nube, lo que permite ejecutarlo en CPU, dispositivos embebidos o GPUs de gama baja. Se distribuye bajo licencia MIT, lo que facilita su integración en productos comerciales sin restricciones adicionales.

El repositorio analizado no es el oficial: pertenece al usuario `devendradhakad`, registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado el 17 de septiembre de 2026. Las referencias técnicas de esta ficha proceden de la model card heredada del repositorio original `UsefulSensors/moonshine-tiny` y del artículo arXiv:2410.15608.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Seq2seq de reconocimiento automático del habla y traducción de voz (clase `MoonshineForConditionalGeneration`); el artículo asociado describe el detalle del codificador y el decodificador |
| Parámetros totales | 27 M (variante *tiny*) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La model card no fija una ventana máxima; el modelo procesa audio de longitud variable y el ejemplo oficial limita la generación a unos 6,5 tokens por segundo para evitar bucles de alucinación |
| Tipos de cuantización | No disponible. El ejemplo oficial usa float16 en GPU y float32 en CPU; no se documentan pesos cuantizados (int8, GGUF) en la información proporcionada |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | MIT |
| Formato de pesos | Formato nativo de Hugging Face Transformers (carga mediante `from_pretrained`). No se especifica en la información disponible si el repositorio contiene safetensors o pesos PyTorch; no se ofrecen GGUF ni ONNX en esta ficha |

## Arquitectura y entrenamiento

Moonshine Tiny es un modelo seq2seq de tipo encoder-decoder para ASR, empaquetado en la clase `MoonshineForConditionalGeneration` de la librería Transformers y registrado con la etiqueta de pipeline `automatic-speech-recognition`. La model card lo describe como un modelo de reconocimiento de voz y traducción de voz; el artículo referenciado (arXiv:2410.15608) contiene la descripción completa de la arquitectura, que no se detalla en la información disponible (número de capas, dimensiones ocultas y cabezas de atención: no disponible). La familia Moonshine se publica en dos tamaños: *tiny* (27 M de parámetros, solo inglés) y *base* (61 M de parámetros, solo inglés). La rama multilingüe aparece sin publicar en la tabla de la model card.

El entrenamiento se realizó sobre 200.000 horas de audio con sus transcripciones correspondientes, recopiladas de internet y de conjuntos de datos de acceso abierto disponibles en Hugging Face; la lista concreta de datasets figura en el artículo. No se documenta en la información proporcionada si hubo fases de ajuste por refuerzo (RLHF/DPO) ni la composición exacta del corpus. El objetivo de diseño declarado por Useful Sensors es habilitar transcripción en tiempo real sobre hardware de bajo coste, lo que justifica el tamaño reducido del modelo y su vocación de despliegue local.

## Capacidades

- Transcripción de voz a texto en inglés (`automatic-speech-recognition`), con salida de texto plano.
- Traducción de voz dentro del alcance descrito en la model card ("speech translation model"), limitada al soporte documentado en inglés.
- Procesamiento de audio de longitud variable, sin la exigencia de rellenar la entrada a ventanas fijas.
- Control de longitud de generación mediante el parámetro `max_length` calculado a partir de la duración del audio (heurística de ~6,5 tokens por segundo) para mitigar bucles de alucinación.
- Ejecución en CPU y GPU mediante Transformers, con `float32` y `float16` respectivamente.
- Posible extensión mediante ajuste fino a tareas como detección de actividad de voz, clasificación de hablante o diarización, aunque la model card indica que no se han evaluado de forma robusta.
- No se documenta soporte de *tool calling*, función de agentes, razonamiento multi-paso, visión, audio generativo ni modo de "pensamiento".

## Casos de uso

- Transcripción en tiempo real en dispositivos embebidos: con 27 M de parámetros, el modelo puede ejecutarse en una Raspberry Pi o en una placa con NPU de gama baja para convertir voz en texto sin conexión a la nube, que es el escenario para el que Useful Sensors lo diseñó.
- Comandos de voz en domótica y electrodomésticos: un asistente local puede reconocer órdenes en inglés y activar rutinas sin enviar audio a servidores externos, lo que reduce latencia y elimina el problema de privacidad del audio doméstico.
- Subtitulado local de vídeo y reuniones en inglés: integrado en un script con Transformers, permite generar subtítulos por lotes de grabaciones sin depender de APIs de pago y con coste marginal de cómputo casi nulo.
- Preprocesado de audio para una cadena de LLM: el modelo actúa como primera etapa (voz a texto) y entrega la transcripción a un modelo de lenguaje local, habilitando asistentes conversacionales completamente offline.
- Dictado y notas de voz en aplicaciones de escritorio o móviles: al requerir menos de 1 GB de memoria en la práctica, cabe en clientes ligeros y permite transcribir notas en el propio dispositivo.
- Kioscos, terminales punto de venta y sistemas de atención presencial: la transcripción en el propio terminal evita el envío de audio a terceros y funciona en hardware industrial de recursos limitados.
- Robótica y vehículos no tripulados: el presupuesto de cómputo y energía es crítico en estas plataformas, por lo que un modelo de decenas de megabytes permite reconocimiento de voz a bordo sin competir por recursos con la planificación o la percepción.
- Base para ajuste fino en tareas de voz específicas de dominio (acentos, vocabulario técnico): al ser MIT y pequeño, es viable reentrenarlo con datos propios, siempre que se validen los resultados antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card se limita a afirmar de forma cualitativa que "los modelos muestran una mayor precisión en conjuntos de datos estándar que los sistemas ASR existentes de tamaños similares", sin aportar cifras de WER, MMLU, HumanEval, GSM8K ni métricas equivalentes en el material proporcionado. Las tablas de evaluación completas se remiten al artículo arXiv:2410.15608, que no ha sido consultado como fuente de datos numéricos para esta ficha.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 108 MB en float32 y 54 MB en float16, calculados a partir de los 27 M de parámetros (estimación aritmética, no dato publicado).
- VRAM estimada para inferencia: por debajo de 1 GB en la práctica, incluyendo activaciones y buffers intermedios; los pesos en float16 ocupan del orden de 54 MB.
- GPU recomendadas: no se requiere una GPU dedicada. Funciona en cualquier GPU de consumo (por ejemplo, GTX 1650, RTX 3050 o superiores) y en plataformas integradas tipo Jetson Nano u Orin; en la mayoría de casos la CPU es suficiente.
- Compatibilidad con GPU de consumo: sí, en todas las gamas, incluidas iGPU y SoC ARM. También cabe en CPU sin aceleración.
- Opciones de despliegue: Transformers (PyTorch) sobre CUDA, CPU o MPS, que es el método mostrado en la model card. No se documenta en la información disponible el soporte de vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime para este modelo concreto.
- Latencia y throughput: no disponibles. No se aportan medidas de RTF (factor de tiempo real) ni de latencia por segundo de audio en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|
| Moonshine Tiny (este modelo) | 27 M | Inglés | MIT | Hugging Face, vía Transformers |
| Moonshine Base | 61 M | Inglés | MIT | Hugging Face, vía Transformers |
| Whisper Tiny (OpenAI) | No disponible en la información proporcionada | Multilingüe (según su propia documentación) | MIT (referencia externa) | Hugging Face y OpenAI |
| Whisper Base (OpenAI) | No disponible en la información proporcionada | Multilingüe (según su propia documentación) | MIT (referencia externa) | Hugging Face y OpenAI |

Los datos de Moonshine Tiny y Moonshine Base proceden de la tabla incluida en la model card. Las filas de Whisper se incluyen como referencia de categoría, pero sus especificaciones no forman parte de la información proporcionada en esta consulta y no se han verificado aquí. La model card de Moonshine indica que su versión multilingüe no está publicada, de modo que la comparación con modelos multilingües no es equivalente en cobertura de idiomas.

## Limitaciones y advertencias

- Alucinación: la propia model card reconoce que las predicciones pueden contener texto que no se ha pronunciado en el audio, atribuido a que el modelo combina el conocimiento general del idioma con la transcripción. El ejemplo oficial mitiga el problema limitando la generación a unos 6,5 tokens por segundo.
- Cobertura de idioma: solo inglés. Cualquier uso en castellano u otras lenguas requiere ajuste fino y evaluación propia, y no está respaldado por la documentación.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, de acento o de variedad dialectal en la información disponible. Al entrenarse con 200.000 horas recopiladas de internet, es esperable un desequilibrio en la representación de acentos y registros, aunque no se cuantifica.
- Usos desaconsejados por el autor: transcripción de grabaciones de personas sin su consentimiento, clasificación subjetiva y uso en dominios de alto riesgo donde un error de precisión tenga consecuencias graves. La model card señala explícitamente que el modelo no es adecuado para inferir atributos humanos.
- Tareas no evaluadas: detección de actividad de voz, clasificación de hablante y diarización se mencionan como posibles extensiones, pero sin evaluación robusta. Se recomienda validar en el contexto y dominio concretos antes de desplegar.
- Licencia: MIT, sin restricciones de uso comercial conocidas, pero conviene verificar la procedencia de los datos de entrenamiento si el uso va a ser comercial a gran escala.
- Riesgo de repositorio: este repositorio no es el oficial. Fue subido por un tercero (`devendradhakad`), acumula 0 descargas y 0 "likes" y no ofrece garantía de sincronización con el modelo original. Para producción se recomienda usar `UsefulSensors/moonshine-tiny` y verificar los pesos antes de integrarlos.

## Enlaces

- Repositorio analizado: https://huggingface.co/devendradhakad/autodroid-moonshine-ai-moonshine-tiny
- Repositorio oficial del modelo: https://huggingface.co/UsefulSensors/moonshine-tiny
- Artículo: https://arxiv.org/abs/2410.15608
- Blog de presentación: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio de código e instalación: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Referencia metodológica sobre model cards: https://arxiv.org/abs/1810.03993
- Podcast citado en la model card: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
- La búsqueda web realizada no devolvió resultados técnicos relevantes: los resultados obtenidos fueron únicamente enlaces genéricos a páginas principales de Google (google.pl, translate.google.pl, videohp, scholar.google.pl y earth.google.com), sin información aprovechable sobre el modelo.
