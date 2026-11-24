# espnet/ami_esp2_s2t_whisper_small_sot

## Resumen

El modelo `espnet/ami_esp2_s2t_whisper_small_sot` es un checkpoint de reconocimiento automático del habla (ASR) multi-hablante desarrollado por el equipo de ESPnet, empaquetado con la versión ESPnet3. Se trata de un ajuste fino (fine-tuning) del modelo Whisper small de OpenAI sobre el corpus AMI (Augmented Multi-party Interaction), orientado a la transcripción de reuniones con múltiples participantes y a la atribución de hablante. El sistema emplea Serialized Output Training (SOT), una técnica que serializa las intervenciones de distintos hablantes en una única secuencia de salida, lo que permite al modelo transcribir y separar hablantes de forma conjunta sin necesidad de un módulo externo de diarización.

El checkpoint original era `espnet/multi-talker-whisper-small-ami`, y esta versión se presenta como el artefacto empaquetado dentro del ecosistema ESPnet3 con la receta `egs3/ami/esp2_s2t`. El modelo está pensado para investigación y evaluación en entornos de reuniones grabadas con micrófono de mesa (SDM, Single Distant Microphone), un escenario particularmente difícil por la superposición de voces y la reverberación.

La relevancia de este modelo radica en su enfoque integrado de ASR multi-hablante: en lugar de encadenar diarización y transcripción, el modelo resuelve ambas tareas en una sola pasada autorregresiva, lo que simplifica el pipeline y reduce la propagación de errores. No obstante, se trata de un checkpoint de investigación con tracción muy limitada (0 descargas, 0 likes) y sin licencia declarada, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder basado en Whisper small, con Serialized Output Training (SOT) |
| Parametros totales | no disponible (Whisper small tiene aproximadamente 244 millones, aunque el dato no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (speech_length: 30, fs: 16000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (tokenizador whisper_multilingual, pero sin lista explícita) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB empaquetado con ESPnet3, presumiblemente checkpoint PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura encoder-decoder de Whisper small, con un encoder convolucional más transformer y un decoder transformer autorregresivo. La innovación principal es el uso de Serialized Output Training (SOT): las intervenciones de los distintos hablantes se concatenan en una única secuencia de tokens, separadas por un símbolo de cambio de hablante (`????` según la configuración del preprocesador). El decoder genera esta secuencia serializada, de modo que la transcripción y la atribución de hablante se producen simultáneamente. El tokenizador es el multilingüe de Whisper (`whisper_multilingual`), con tokens especiales para marcas temporales (`<|0.00|>`, `<|30.00|>`), ausencia de habla (`<|nospeech|>`) y ausencia de timestamps (`<|notimestamps|>`).

El entrenamiento se realizó mediante fine-tuning sobre el corpus AMI con AdamW (lr 5e-6, weight decay 0.01), scheduler de annealing coseno con warmup y reinicios (warmup de 2000 pasos, ciclo de 50000 pasos), precisión bf16-mixed y un máximo de 50000 pasos o 100 épocas. La model card advierte explícitamente de que el checkpoint se entrenó antes de que existiera la receta de ESPnet3 y que la configuración mostrada corresponde a la receta, no necesariamente al entrenamiento real del checkpoint. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá del corpus AMI.

## Capacidades

- Reconocimiento automático del habla multi-hablante sobre audio de reuniones (corpus AMI, micrófono de mesa SDM).
- Serialized Output Training: transcribe y separa hablantes en una sola secuencia de salida, sin módulo de diarización externo.
- Predicción de cambios de hablante mediante símbolo dedicado (`????`).
- Estimación del número de hablantes presentes en la ventana de audio (métrica `spk_count_acc` reportada).
- Manejo de marcas temporales a resolución de 0.02 segundos sobre ventanas de 30 segundos.
- Tokenizador multilingüe de Whisper, aunque no se declaran idiomas soportados explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá del ASR.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales adicionales.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo procesa ventanas de 30 segundos de audio de micrófono de mesa y genera transcripciones con atribución de hablante, adecuado para actas automáticas en salas de reuniones equipadas con micrófonos únicos.
- Generación de actas con separación de intervinientes: gracias a la serialización SOT, se obtiene directamente un diálogo etiquetado por hablante sin necesidad de ejecutar un diarizador independiente, lo que simplifica el pipeline.
- Investigación en ASR multi-hablante: sirve como línea base reproducible para comparar técnicas de serialización de salida frente a pipelines en cascada (diarización + ASR) sobre el corpus AMI.
- Evaluación de robustez frente a solapamiento de voces: el corpus AMI incluye habla superpuesta y reverberación, por lo que el modelo es útil para estudiar el comportamiento de Whisper en condiciones distantes y multihablante.
- Análisis de reuniones para extracción de información: las transcripciones etiquetadas por hablante alimentan sistemas posteriores de resumen, extracción de action items o análisis de participación.
- Docencia e investigación académica: al estar empaquetado con ESPnet3 y una receta reproducible (`egs3/ami/esp2_s2t`), facilita la reproducción de experimentos y la extensión a otros corpus de reuniones.
- Prototipado de sistemas de subtitulado para entornos multihablante con un solo micrófono, siempre que se acepten las limitaciones de licencia y la naturaleza de investigación del checkpoint.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test del corpus AMI:

| Metrica | Valor |
|---|---|
| ug_DER | 8.54 |
| ug_WER | 27.06 |
| ug_cpWER | 27.61 |
| ug_spk_count_acc | 84.09 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de Whisper small (aproximadamente 244 millones de parámetros) se estima en torno a 1-2 GB en fp16, aunque el dato no se confirma en la model card.
- GPU recomendadas: no disponibles; cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar un modelo de este tamaño, pero no se documenta.
- Cabe en GPU de consumo: previsiblemente sí (gama RTX 30xx/40xx con suficiente VRAM), aunque no se confirma.
- Opciones de despliegue: el modelo está empaquetado con ESPnet3 y requiere usar la configuración de inferencia de la receta original (`egs3/ami/esp2_s2t`) para construir el backend y ejecutar la etapa `infer`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espnet/ami_esp2_s2t_whisper_small_sot | no disponible (base Whisper small) | 30 s de audio | ASR multi-hablante con SOT sobre AMI | no disponible | Hugging Face, 0 descargas |
| whisper-small (OpenAI) | ~244 M | 30 s de audio | ASR mono-hablante multilingüe | MIT (según el modelo original) | Amplia |
| Modelos de diarización + ASR en cascada | variable | variable | Pipeline separado | variable | variable |

No se dispone de comparativas cuantitativas publicadas en la información proporcionada; la comparación con Whisper small es estructural (mismo backbone) pero no se aportan métricas cruzadas.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con los autores o revisar el repositorio ESPnet antes de cualquier despliegue comercial.
- Idiomas soportados no declarados: aunque el tokenizador es multilingüe, el fine-tuning se realizó sobre AMI (inglés), por lo que el rendimiento en otros idiomas es incierto.
- La model card advierte de que el checkpoint se entrenó antes de existir la receta de ESPnet3 y que la configuración mostrada no se usó para entrenar este checkpoint, lo que introduce incertidumbre sobre la reproducibilidad exacta.
- El WER reportado (27.06) es elevado en términos absolutos, típico de escenarios de reuniones con micrófono distante y habla solapada; no es adecuado para transcripción de alta precisión sin post-procesado.
- La precisión en la estimación del número de hablantes (84.09) implica un margen de error notable en la atribución.
- Riesgo de alucinación inherente a los modelos basados en Whisper, especialmente en segmentos con ruido o silencio.
- Sesgos no documentados: no se especifica composición demográfica del corpus AMI ni análisis de sesgos.
- Requiere el stack ESPnet3 y la receta original para la inferencia; no es un checkpoint plug-and-play con librerías estándar de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/espnet/ami_esp2_s2t_whisper_small_sot
- Repositorio ESPnet: https://github.com/espnet/espnet
- Paper de ESPnet (Interspeech 2018): https://doi.org/10.21437/Interspeech.2018-1456
- Checkpoint original referenciado: espnet/multi-talker-whisper-small-ami (en Hugging Face)
