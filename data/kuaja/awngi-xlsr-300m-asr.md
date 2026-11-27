# Kuaja/awngi-xlsr-300m-asr

## Resumen

El modelo `Kuaja/awngi-xlsr-300m-asr` es un sistema de reconocimiento automático del habla (ASR) especializado en awngi, una lengua cushítica de Etiopía con escasos recursos digitales. Se trata de un ajuste fino supervisado del modelo preentrenado multilingüe `facebook/wav2vec2-xls-r-300m` de Meta AI, al que se le ha añadido una cabeza de clasificación CTC para la transcripción directa de audio a texto. Lo desarrolla el usuario Kuaja (quaja-abu) en el marco de investigación sobre tecnologías del habla para lenguas infrarepresentadas.

El modelo resuelve un problema concreto: la práctica ausencia de herramientas ASR funcionales para el awngi, una lengua que no figura entre los idiomas cubiertos por los sistemas comerciales ni por la mayoría de modelos multilingües de gran escala. Con 315,7 millones de parámetros y un corpus de entrenamiento de solo 13,54 horas procedentes de 78 hablantes, el modelo demuestra la viabilidad de adaptar representaciones auto-supervisadas multilingües a lenguas de muy bajos recursos mediante ajuste fino por fases.

Es relevante ahora porque ejemplifica una metodología replicable para la documentación y revitalización lingüística: aprovechar modelos preentrenados masivos (XLS-R) y ajustarlos con corpus pequeños pero bien particionados (split independiente por hablante) para obtener transcripciones utilizables en investigación. El modelo es explícitamente una línea base de investigación, no un sistema listo para producción de alto riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 XLS-R 300M con cabeza CTC (transformer convolucional + atención) |
| Parámetros totales | 315.709.320 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente de la entrada; sin límite documentado) |
| Tipos de cuantización | no disponible (compatible con cuantización estándar de PyTorch/transformers, no documentada por el autor) |
| Idiomas soportados | awngi (código `awn`) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors |
| Modelo base | facebook/wav2vec2-xls-r-300m |
| Tarea (pipeline) | automatic-speech-recognition |
| Decodificación | CTC greedy, sin modelo de lenguaje externo |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Wav2Vec2 XLS-R: un extractor de características convolucional que procesa la forma de onda cruda a 16 kHz, seguido de un codificador transformer con atención multi-cabeza que produce representaciones contextuales del habla. Sobre estas representaciones se añade una capa lineal de clasificación CTC que emite directamente caracteres del awngi sin necesidad de alineación forzada previa. El modelo base XLS-R fue preentrenado de forma auto-supervisada sobre audio multilingüe (436.000 horas en 128 idiomas), y este ajuste fino lo especializa al awngi.

El entrenamiento se realizó en dos fases. La fase 1 aplicó 24.500 actualizaciones con tasa de aprendizaje 3e-5, warm-up de 500 pasos, batch size 1 y acumulación de gradiente de 4, con el codificador de características congelado durante los primeros 3.000 pasos; el mejor checkpoint se seleccionó en el paso 23.000 según validación. La fase 2 partió de ese checkpoint, reinicializó optimizador y scheduler (AdamW), y añadió 3.000 actualizaciones con tasa 1e-5 y warm-up de 100 pasos, con el codificador de características ya descongelado. En total, 27.500 actualizaciones del optimizador. El corpus contiene 13,54 horas (7.380 enunciados, 78 hablantes) divididas de forma independiente por hablante: 12,04 horas de entrenamiento (70 hablantes), 0,76 horas de validación (4 hablantes) y 0,73 horas de test (4 hablantes). No se documenta uso de RLHF ni DPO, al tratarse de una tarea de ASR supervisada con CTC.

## Capacidades

- Transcripción de voz a texto en awngi a partir de audio mono a 16 kHz.
- Reconocimiento de caracteres del awngi mediante decodificación CTC greedy.
- Inferencia sin modelo de lenguaje externo (end-to-end).
- Funcionamiento en CPU y GPU vía `transformers` (`AutoModelForCTC` y `AutoProcessor`).
- Procesamiento de audio de duración variable, sin límite documentado de longitud.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No es multimodal: no procesa visión ni texto como entrada; solo audio.
- Capacidad multilingüe limitada al awngi en la práctica (el backbone XLS-R es multilingüe, pero el ajuste fino lo especializa a `awn`).

## Casos de uso

- Documentación lingüística de campo: transcribir grabaciones de hablantes nativos de awngi para construir corpus anotados, aprovechando que el modelo acepta audio a 16 kHz y funciona en CPU para trabajo de campo con hardware modesto.
- Investigación en ASR de bajos recursos: usar el modelo como línea base reproducible para comparar técnicas de adaptación (más datos, modelos de lenguaje, data augmentation) sobre el mismo split independiente por hablante.
- Revitalización y preservación lingüística: generar transcripciones preliminares de archivos orales de awngi que luego revisa un hablante nativo, reduciendo el coste manual de transcripción.
- Evaluación de representaciones auto-supervisadas: medir hasta qué punto XLS-R transfiere a una lengua cushítica con solo 13,54 horas de supervisión, como caso de estudio metodológico.
- Prototipos de interfaces de voz en awngi: experimentar con dictado o búsqueda por voz en aplicaciones de investigación, asumiendo la tasa de error documentada y la necesidad de revisión humana.
- Enseñanza y aprendizaje del awngi: apoyo a materiales didácticos con transcripción asistida de ejercicios orales, siempre con corrección posterior por parte de docentes.
- Generación de subtítulos experimentales para material audiovisual en awngi en contextos de archivo, con revisión humana obligatoria dada la WER del 58,07 %.

## Benchmarks y rendimiento

Evaluación sobre la partición de test independiente por hablante (390 enunciados, 0,73 horas, 4 hablantes), decodificación CTC greedy sin modelo de lenguaje externo:

| Métrica | Resultado |
|---|---:|
| WER a nivel de corpus | 58,07 % |
| CER a nivel de corpus | 19,64 % |
| Precisión de caracteres (1 − CER) | 80,36 % |
| WER medio por enunciado | 57,16 % |
| WER mediano por enunciado | 58,11 % |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor no establece afirmaciones de significación estadística entre las dos fases de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB de pesos más activaciones; en la práctica, entre 2 y 4 GB según la duración del audio.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB de pesos más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es pequeño y no requiere GPU de centro de datos.
- Cabe en GPU consumer sin problema; también funciona en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con PyTorch (soporte nativo documentado), y en principio exportable a ONNX o a `ctranslate2`/`faster-whisper`-style pipelines, aunque el autor solo documenta `transformers`. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a CTC ASR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto / datos | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Kuaja/awngi-xlsr-300m-asr | 315,7 M | awngi (`awn`) | 13,54 h, 78 hablantes | other | Hugging Face |
| facebook/wav2vec2-xls-r-300m | ~317 M | multilingüe (128 idiomas) | 436.000 h auto-supervisadas | Apache 2.0 (según modelo base) | Hugging Face |
| whisper-small | ~244 M | multilingüe (99 idiomas, sin awngi garantizado) | 680.000 h supervisadas | MIT (según OpenAI) | Hugging Face / OpenAI |

El modelo de Kuaja se distingue por estar especializado en un único idioma de muy bajos recursos, mientras que XLS-R y Whisper son modelos generalistas. La comparación de rendimiento directo no está disponible porque no se han publicado evaluaciones de Whisper ni de XLS-R sin ajuste sobre el corpus de awngi.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño (13,54 horas) frente a los datasets de lenguas de altos recursos; el rendimiento puede degradarse con hablantes, dialectos, acentos, estilos o condiciones acústicas no representados.
- WER del 58,07 % en test: no apto para transcripción automática sin revisión humana en contextos de producción.
- El test set tiene solo 4 hablantes, por lo que las métricas tienen alta varianza y no garantizan generalización.
- Sin modelo de lenguaje externo: la decodificación greedy puede producir salidas menos fluidas que sistemas con LM.
- Licencia "other" sin texto detallado en la información disponible; es necesario verificar las condiciones exactas antes de cualquier uso comercial.
- Riesgo de sesgo hacia las características de los 78 hablantes del corpus (probablemente una variedad dialectal concreta del awngi).
- El audio original no es público (acceso controlado); solo las transcripciones anonimizadas están disponibles en GitHub, lo que limita la reproducibilidad exacta.
- Modelo explícitamente etiquetado como línea base de investigación, no destinado a aplicaciones de alto riesgo.
- No soporta otras tareas (traducción, texto, visión) ni tool calling; su uso está acotado a ASR de awngi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuaja/awngi-xlsr-300m-asr
- Modelo base XLS-R 300M: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Repositorio del proyecto (transcripciones anonimizadas): https://github.com/quaja-abu/Awngi-ASR-Wav2Vec2-XLSR
- Transcripciones del corpus: https://github.com/quaja-abu/Awngi-ASR-Wav2Vec2-XLSR/tree/main/data/transcripts
