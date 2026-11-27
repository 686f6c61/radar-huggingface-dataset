# Altushkins/GigaAM-v4-onnx

## Resumen

GigaAM-v4-onnx es una conversión a ONNX con cuantización dinámica de los pesos del modelo de reconocimiento automático del habla (ASR) ai-sage/GigaAM-v4, en su variante de cabecera CTC end-to-end. El paquete lo publica el usuario Altushkins y está pensado para inferencia en CPU mediante el runtime sherpa-onnx, sin necesidad de GPU ni de dependencias de PyTorch o NeMo en producción. El repositorio ocupa 0,5 GB e incluye dos carpetas independientes: una versión solo para ruso y otra bilingüe ruso-inglés.

El modelo base GigaAM-v4 lo desarrolla el equipo de ai-sage (Sber) y emplea una arquitectura de encoder tipo Zapformer con factor de submuestreo 4 y una cabecera CTC que emite directamente texto con mayúsculas, puntuación, dígitos y la letra `ё`. Esta exportación mantiene ese comportamiento end-to-end y lo empaqueta en un único fichero `model.int8.onnx` de unos 240 MB por variante, con vocabulario de 146 tokens (145 caracteres más el token de blanco `<blk>`).

Su relevancia práctica es que permite desplegar un ASR de calidad para ruso en entornos sin acelerador, con integración directa en sherpa-onnx (Rust, Python, C++, etc.) y consumo de memoria moderado. Es una opción realista para transcripción local, subtitulado o asistentes de voz en infraestructura CPU estándar, aunque el proyecto tiene escasa tracción (0 descargas y 0 likes en el momento de la consulta) y no publica métricas propias de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Zapformer con cabecera CTC end-to-end (E2E), exportado a ONNX; `subsampling_factor=4` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente del audio de entrada) |
| Tipos de cuantizacion | Cuantizacion dinamica `QUInt8` (INT8) sobre los pesos ONNX |
| Idiomas soportados | Ruso (carpeta `gigaam-v4-ru`); ruso e ingles (carpeta `gigaam-v4-ru-en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`, opset 17) + `tokens.txt` en formato sherpa-onnx |
| Modelo base | ai-sage/GigaAM-v4 (revision `ctc`) |
| Tamano del repositorio | 0,5 GB (240,3 MB por variante) |
| Vocabulario | 146 tokens (145 caracteres + `<blk>` en indice 145) |
| Entrada de audio | 16 kHz, 64 bins mel |
| Runtime objetivo | sherpa-onnx (`OfflineNemoEncDecCtcModelConfig`, `is_giga_am=1`, `model_type="nemo_ctc"`, `decoding_method="greedy_search"`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo ai-sage/GigaAM-v4, un encoder de tipo Zapformer (familia de conformer/transformer con mejoras de eficiencia) que reduce la secuencia de entrada con un factor de submuestreo de 4 y alimenta una cabecera CTC. En esta exportación la cabecera es la variante E2E, que genera directamente texto normalizado: mayúsculas, signos de puntuación, dígitos y `ё`, evitando etapas separadas de normalización o puntuación posterior.

El proceso de esta ficha concreta no incluye reentrenamiento: se parte de los pesos originales (revision `ctc`) y se realiza una exportación local a ONNX con cuantización dinámica `QUInt8` sobre el grafo (opset 17). La variante `gigaam-v4-ru` modifica la cabecera suprimiendo los tokens latinos (según la model card, mediante el sesgo `head.decoder_layers.0.bias`) para evitar que palabras cortas rusas o wake words se transcriban erróneamente como términos ingleses como `and`, `I` o `alt`. La variante `gigaam-v4-ru-en` conserva la cabecera E2E sin modificar y reconoce ruso e inglés mezclados.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de horas de audio, composición del corpus, uso de RLHF/DPO u otras técnicas). Tampoco se documentan innovaciones adicionales de decodificación más allá del `greedy_search` sobre CTC que emplea sherpa-onnx.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso con salida end-to-end que incluye mayúsculas, puntuación, dígitos y `ё`.
- Reconocimiento bilingüe ruso-inglés en la variante `gigaam-v4-ru-en`, útil para términos técnicos o de TI intercalados en habla rusa.
- Supresión de falsos positivos en inglés en la variante `gigaam-v4-ru`, orientada a wake words y palabras cortas rusas.
- Inferencia en CPU mediante sherpa-onnx, con decodificación voraz sobre CTC.
- Integración en aplicaciones Rust, Python y C++ a través de la API de sherpa-onnx (`OfflineNemoEncDecCtcModelConfig`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del propio ASR.
- Capacidades multilingües limitadas a ruso e inglés; no hay soporte declarado de otras lenguas.

## Casos de uso

- Transcripción local de reuniones y notas de voz en ruso: el modelo procesa audio de 16 kHz con 64 bins mel y devuelve texto ya puntuado y con mayúsculas, lo que elimina pasos de postprocesado en aplicaciones de dictado.
- Subtitulado automático de vídeo en ruso: al ser un modelo ONNX INT8 de 240 MB, puede ejecutarse en el mismo servidor o incluso en un portátil que genere los subtítulos sin depender de servicios en la nube.
- Asistentes de voz con wake words en ruso: la variante `gigaam-v4-ru` suprime los tokens latinos, reduciendo que palabras cortas se confundan con `and`, `I` o `alt`, algo crítico en activación por voz.
- Transcripción de soporte técnico bilingüe ruso-inglés: la variante `gigaam-v4-ru-en` reconoce términos de TI en inglés dentro de frases en ruso, adecuada para centros de soporte o documentación de incidencias.
- Procesamiento por lotes en infraestructura CPU: al no requerir GPU y usar sherpa-onnx, se puede escalar horizontalmente con contenedores ligeros para transcribir archivos de audio en cola.
- Aplicaciones de escritorio o embebidas sin conectividad: el tamaño reducido del modelo y su formato ONNX permiten integrarlo en herramientas offline de accesibilidad o toma de notas.
- Preprocesado de datos para pipelines de NLP: transcripción masiva de audio ruso para alimentar índices de búsqueda, resúmenes o clasificación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU. El fichero INT8 ocupa unos 240 MB, por lo que el consumo de RAM es moderado (del orden de varios cientos de MB incluyendo el runtime).
- GPU: no es necesaria. No se documenta soporte GPU específico para esta exportación ONNX.
- GPU de consumo: irrelevante para el caso de uso previsto; puede ejecutarse en cualquier CPU moderna x86-64 o ARM.
- Despliegue: sherpa-onnx (Rust, Python, C++, y bindings asociados) con `model_type="nemo_ctc"`, `decoding_method="greedy_search"`, `sample_rate=16000`, `feature_dim=64` e `is_giga_am=1`.
- Otros runtimes: al ser ONNX estándar (opset 17) podría cargarse con ONNX Runtime, aunque la model card solo documenta y valida sherpa-onnx.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GigaAM-v4-onnx (esta ficha) | no disponible | ru, en | audio 16 kHz, 64 mel | MIT | ONNX INT8 | Optimizado para CPU vía sherpa-onnx |
| ai-sage/GigaAM-v4 (base) | no disponible | ru, en | audio 16 kHz | MIT | pesos originales (no ONNX) | Requiere stack NeMo/PyTorch; sirve de referencia de calidad |
| Whisper (variantes pequenas/medianas) | no disponible en esta ficha | multilingue | audio 16 kHz, 80 mel | MIT | multiples (incl. ONNX/GGUF) | Referencia habitual de ASR multilingue; no se dispone de comparación numérica en la información dada |
| Vosk (modelos rusos) | no disponible | ru y otros | audio 16 kHz | Apache 2.0 (segun modelo) | Kaldi/ONNX | Alternativa clásica de ASR offline en CPU; sin datos comparativos disponibles |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo cubre ruso e inglés; no hay soporte declarado para castellano ni otras lenguas.
- La variante `gigaam-v4-ru` suprime deliberadamente los tokens latinos, por lo que no transcribirá palabras en inglés aunque aparezcan en el audio; para entornos mixtos debe usarse `gigaam-v4-ru-en`.
- No se publican métricas de WER/CER ni evaluaciones independientes de esta exportación; la calidad depende íntegramente del modelo base y de la cuantización INT8, que puede introducir degradación menor no cuantificada.
- Riesgo de alucinación y de errores en audio con ruido, solapamiento de hablantes, acentos marcados o vocabulario muy específico, como en cualquier ASR CTC.
- La decodificación documentada es `greedy_search`; no se mencionan opciones de beam search ni modelos de lenguaje externos que puedan corregir errores.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La licencia MIT del modelo base se mantiene, pero conviene verificar las condiciones de atribución de ai-sage/GigaAM-v4 antes de un despliegue comercial.
- El formato ONNX con cuantización dinámica está validado para sherpa-onnx; otros runtimes pueden requerir ajustes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Altushkins/GigaAM-v4-onnx
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- sherpa-onnx (runtime): no se proporciona enlace en la información disponible
