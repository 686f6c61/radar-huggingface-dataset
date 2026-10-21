# Prestigeeo/dsn-2026-lid-xlsr

## Resumen

`dsn-2026-lid-xlsr` es un modelo de identificación de idioma hablado (*spoken language identification*, LID) publicado por el usuario Prestigeeo como propuesta para el hackathon DSN 2026 AI Bootcamp. Es un ajuste fino de `facebook/wav2vec2-xls-r-300m`, un encoder convolucional más transformer preentrenado por Meta con 436 000 horas de audio multilingüe, adaptado aquí para clasificar fragmentos de audio en 12 lenguas nigerianas más una clase adicional «other» que actúa como rechazo del resto de idiomas.

El modelo cubre un hueco concreto: la mayoría de sistemas LID comerciales o genéricos están sesgados hacia idiomas mayoritarios y rinden mal con lenguas de bajos recursos de África occidental. Esta ficha declara soporte para yoruba, igbo, hausa, eggon, anang, efik, ibibio, idoma, igala, nupe, tiv y urhobo, doce lenguas del espacio Níger-Congo y chádico, con licencia Apache 2.0 y 315,7 millones de parámetros, un tamaño que permite inferencia en CPU y en GPUs de gama baja.

Su relevancia es acotada y hay que leerla con cautela: se trata de un envío de hackathon con 0 descargas y 0 *likes*, sin métricas publicadas en la model card, sin detalle del corpus de entrenamiento y sin artefactos de despliegue (ONNX, int8) más allá de los pesos en safetensors. Es útil como punto de partida reproducible para LID nigeriano, no como sistema validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0: extractor de características convolucional (7 capas) más encoder transformer; ajuste fino de `facebook/wav2vec2-xls-r-300m` |
| Parámetros totales | 315 704 461 (315,7 M), dato real de los safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de ventana de texto: la entrada es forma de onda mono a 16 kHz. La duración máxima de audio no está documentada |
| Tipos de cuantización | No disponible: el repositorio solo contiene safetensors. No se publican versiones GGUF, ONNX ni int8 |
| Idiomas soportados | 12 lenguas nigerianas más clase «other»: yoruba (yo), igbo (ig), hausa (ha), eggon (ego), anang (anw), efik (efi), ibibio (ibb), idoma (idu), igala (igl), nupe (nup), tiv (tiv) y urhobo (urh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,6 GB, coherente con pesos almacenados en fp16 o bf16) |
| Tipo de tarea | `audio-classification` con 13 clases de salida (12 idiomas más «other») |
| Autor y fecha | Prestigeeo, creado el 2026-10-20, actualizado el 2026-10-20 |
| Uso previsto declarado | Envío para el hackathon DSN 2026 AI Bootcamp |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec 2.0, en la variante XLS-R de 300 M: un extractor convolucional que convierte la forma de onda cruda a 16 kHz en una secuencia de representaciones latentes, seguido de un encoder transformer de 24 capas con tamaño oculto 1024 y 16 cabezas de atención, según la configuración publicada del modelo base. Sobre ese encoder se añade una cabeza de clasificación de secuencia para las 13 clases. XLS-R fue preentrenado de forma autosupervisada con 436 000 horas de audio de 128 idiomas, lo que proporciona representaciones acústicas razonablemente transferibles a lenguas africanas con pocos datos etiquetados.

El ajuste fino lo describe el autor de forma muy escueta: se aplicó ponderación de clases (*class weighting*) para compensar el desequilibrio del corpus y aumento de datos con ruido y variación telefónica. No se documentan el número de horas de entrenamiento, la composición y procedencia del corpus, la partición train/dev/test, el optimizador, la tasa de aprendizaje, el número de épocas ni si hubo congelación de capas. Tampoco se especifica cómo se construyó la clase «other» (idiomas no nigerianos, pidgin nigeriano, música, silencio o ruido), un detalle crítico para interpretar los falsos positivos.

## Capacidades

- Clasificación de idioma hablado en fragmentos de audio cortos, devolviendo una distribución de probabilidad sobre 13 clases.
- Cobertura de 12 lenguas nigerianas, incluidas varias de bajos recursos con poca representación en sistemas comerciales (eggon, anang, idoma, igala, nupe, tiv, urhobo).
- Clase de rechazo «other» para descartar audio que no corresponde a ninguna de las doce lenguas cubiertas.
- Robustez parcial declarada frente a ruido y condiciones de canal telefónico gracias al aumento de datos con ruido y variación de canal.
- Inferencia ligera: 315,7 M de parámetros y pesos de aproximadamente 0,6 GB, ejecutables en CPU.
- Integración directa con `transformers` mediante `pipeline("audio-classification")` y `Wav2Vec2ForSequenceClassification`.
- No realiza transcripción (no es un modelo ASR), ni identificación de hablante, ni segmentación de audio, ni generación de texto.
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes, ni visión, ni audio generativo.

## Casos de uso

- **Enrutamiento de llamadas en atención al cliente**: en un centro de contactos nigeriano, el modelo clasifica los primeros segundos de cada llamada y la deriva al agente o al flujo IVR en yoruba, hausa o igbo, reduciendo el tiempo de selección manual de idioma.
- **Etiquetado previo de corpus para ASR**: antes de transcribir con un modelo multilingüe (MMS, Whisper), se pasa el LID para asignar idioma a cada clip; esto evita transcribir audio hausa con un decodificador configurado para yoruba y mejora la calidad del dataset resultante.
- **Auditoría de emisiones de radio y televisión**: procesamiento por lotes de grabaciones para medir qué porcentaje del tiempo de emisión se emite en cada lengua, útil para estudios de política lingüística y cuotas de radiodifusión.
- **Filtrado y limpieza de datasets de habla**: descartar automáticamente clips que caen en la clase «other» o con baja confianza antes de incorporarlos a un corpus de entrenamiento, reduciendo el ruido de etiquetado en proyectos de recogida de datos.
- **Asistentes de voz en dispositivos de baja potencia**: con menos de 1 GB de pesos, el modelo cabe en un dispositivo embebido o en un servidor sin GPU y puede conmutar el idioma del reconocedor local antes de activar el ASR.
- **Documentación lingüística de campo**: investigadores que recogen grabaciones de lenguas minoritarias pueden preclasificar cientos de horas de audio en bruto y detectar grabaciones mal etiquetadas o de informantes que cambiaron de lengua.
- **Investigación sobre confusión entre lenguas cercanas**: sirve como banco de pruebas para estudiar la separabilidad acústica entre pares habitualmente confundidos (efik/ibibio/anang, igala/igbo/idoma).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud, F1 macro, matriz de confusión ni comparación con líneas base, pese a tratarse de un envío de hackathon donde cabría esperar una tabla de evaluación. Tampoco se especifica el conjunto de test utilizado ni su tamaño, por lo que no es posible verificar la generalización del ajuste fino.

## Requisitos de hardware

- **Tamaño en memoria**: 315,7 M de parámetros equivalen a 1,26 GB en fp32, 0,63 GB en fp16 o bf16 (valor coherente con el repositorio de 0,6 GB) y aproximadamente 0,32 GB en int8 si se cuantiza.
- **VRAM estimada para inferencia**: por debajo de 2 GB con lote de tamaño 1 en fp16, incluyendo activaciones; cualquier GPU con 4 GB o más es suficiente.
- **GPU recomendadas**: no requiere GPU. Funciona en CPU para lotes pequeños; para procesamiento masivo son adecuadas una T4, una L4, una RTX 3060 o una RTX 4090. Modelos A100 o H100 no aportan ventaja para este tamaño.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo moderna (GTX 1650 en adelante), y también en CPU con 2 GB de RAM libres.
- **Opciones de despliegue**: `transformers` con `Wav2Vec2ForSequenceClassification` y `pipeline("audio-classification")`; exportación a TorchScript u ONNX Runtime es viable pero no se publica ningún artefacto; servicio HTTP con FastAPI o Triton para lotes. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo.
- **Latencia y throughput**: no disponibles. Al ser un encoder no autorregresivo, la latencia escala de forma aproximadamente lineal con la duración del audio, pero no hay cifras publicadas de *real-time factor* ni de clips por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Prestigeeo/dsn-2026-lid-xlsr` | 315,7 M | 12 lenguas nigerianas más «other» | Audio 16 kHz, duración no documentada | Apache 2.0 | Solo safetensors, 0 descargas |
| `facebook/wav2vec2-xls-r-300m` (base) | 315,7 M | 128 idiomas en preentrenamiento (no es LID directo) | Audio 16 kHz | Apache 2.0 | Pesos base, ampliamente usado |
| `facebook/mms-lid-256` | No confirmado en la información disponible | 256 idiomas | Audio 16 kHz | CC-BY-NC 4.0 (no comercial) | Pesos publicados por Meta |
| `speechbrain/lang-id-voxlingua107-ecapa` | No confirmado en la información disponible | 107 idiomas | Audio 16 kHz, clips cortos | Apache 2.0 | Pesos publicados, integración con SpeechBrain |

La comparación es estructural, no de rendimiento: el modelo evaluado no publica métricas, de modo que no puede afirmarse que supere a MMS-LID ni a VoxLingua107 en lenguas nigerianas. Su ventaja diferencial es la licencia Apache 2.0 combinada con una cobertura explícita de lenguas ausentes o marginales en esos dos sistemas, y su desventaja es la falta total de validación pública.

## Limitaciones y advertencias

- **Ausencia de evaluación publicada**: no hay exactitud, F1 ni matriz de confusión. Cualquier uso en producción exige construir un conjunto de test propio antes de confiar en el modelo.
- **Validación comunitaria nula**: 0 descargas y 0 *likes* en el momento de la ficha; es un envío de hackathon sin revisión externa.
- **Confusión esperable entre lenguas emparentadas**: efik, ibibio y anang; igala, igbo e idoma; y en menor medida yoruba frente a igala. Son pares con solapamiento léxico y fonético y el modelo no documenta su comportamiento en ellos.
- **Desequilibrio de clases**: la ponderación de clases mitiga el problema, pero las lenguas con más datos (hausa, yoruba, igbo) probablemente concentran menos errores que eggon, nupe o tiv. No se publica la distribución del corpus.
- **Clase «other» opaca**: se desconoce qué la compone. Si incluye pidgin nigeriano o audio musical, el umbral de rechazo tendrá un comportamiento difícil de predecir.
- **Code-switching no soportado**: las conversaciones reales en Nigeria alternan lenguas con frecuencia; el modelo asigna una única etiqueta por clip.
- **Dependencia del canal**: el aumento con ruido y variación telefónica sugiere entrenamiento con audio de banda estrecha, pero no se especifica. Audio de 8 kHz remuestreado a 16 kHz puede degradar la precisión.
- **Riesgo de alucinación no aplica**: el modelo no genera texto, pero sí puede producir clasificaciones con alta confianza sobre audio fuera de dominio; conviene aplicar umbrales de confianza y calibración propia.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero la procedencia, el consentimiento y los derechos sobre el audio de entrenamiento no están documentados, lo que traslada el riesgo al usuario.
- **Documentación insuficiente para reproducir**: sin hiperparámetros, sin composición del dataset y sin scripts de entrenamiento publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prestigeeo/dsn-2026-lid-xlsr
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Documentación de wav2vec 2.0 en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Artículo de XLS-R: https://arxiv.org/abs/2111.09296
- Artículo de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- DSN 2026 AI Bootcamp Hackathon: no disponible (no se encontró enlace en la información proporcionada)
