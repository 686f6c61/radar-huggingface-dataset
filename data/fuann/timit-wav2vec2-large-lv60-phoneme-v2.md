# fuann/timit-wav2vec2-large-lv60-phoneme-v2

## Resumen

El modelo `fuann/timit-wav2vec2-large-lv60-phoneme-v2` es un reconocedor de fonemas en inglés entrenado mediante ajuste fino (*fine-tuning*) del encoder preentrenado `facebook/wav2vec2-large-lv60`. Lo desarrolla el usuario `fuann` y su propósito es la transcripción fonémica a nivel de teléfono sobre habla leída en inglés, usando una cabeza de predicción CTC personalizada. Se publica como un checkpoint de investigación, no como un modelo listo para producción mediante la API estándar de Transformers.

La arquitectura subyacente es wav2vec 2.0 en su variante *large*, con un encoder convolucional más un transformer de 24 capas y aproximadamente 317 millones de parámetros, seguido de una cabeza densa → tanh → lineal con salida CTC de 42 identificadores. El entrenamiento se realiza sobre el corpus TIMIT (habla leída en inglés, 16 kHz, mono), con un máximo de 2.000 pasos y selección del mejor checkpoint por tasa de error de fonemas en validación.

Es relevante ahora porque ofrece un punto de partida reproducible y con métricas detalladas (PER del 8,21 % en core test con `sil`, 8,86 % sin `sil`) para tareas de reconocimiento fonémico y detección de pronunciación, aunque requiere usar la receta original del autor (`AutoMDDModel`) en lugar de `Wav2Vec2ForCTC`. Su utilidad principal está en investigación fonética, evaluación de pronunciación y sistemas de *mispronunciation detection*, no en ASR de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 large (encoder convolucional + transformer) con cabeza CTC densa → tanh → lineal personalizada |
| Parametros totales | no disponible (el modelo base wav2vec2-large-lv60 tiene ~317 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec 2.0 procesa audio; la limitación práctica depende de la longitud de la señal de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch); tokenizador y `vocab.json` en el repositorio |
| Frecuencia de muestreo | 16 kHz, mono |
| Vocabulario CTC | 42 IDs: 39 fonemas sin silencio, `sil`, `[PAD]` (blank) y `err` |
| Checkpoint | step 1.900, seleccionado por WER/PER de validación |
| SHA-256 de pesos | `667a72a87413d839948df99ad42566e5249047e3c3cbaa9cb18f34659f08a190` |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-large-lv60` (revisión `0cde644b64dac88d8416bec1c92a4099b850ba0b`) y sustituye la cabeza estándar de clasificación CTC por una cabeza densa → tanh → lineal con 42 clases de salida. El encoder wav2vec 2.0 procesa audio mono a 16 kHz y produce representaciones latentes que la cabeza CTC decodifica en secuencias de fonemas. El vocabulario incluye 39 fonemas sin silencio, el símbolo `sil` (que también agrupa etiquetas de cierre y pausa), `[PAD]` como blank CTC y `err` como token desconocido. El tokenizador registra además `<s>` y `</s>` en los IDs 42 y 43, que no son clases de salida de la cabeza CTC.

El entrenamiento se realiza sobre TIMIT con 462 hablantes y 3.696 enunciados SI/SX en *train*, 50 hablantes y 400 enunciados en *dev*, y 24 hablantes y 192 enunciados en *core test*; los enunciados SA quedan excluidos. Se fija semilla 66, un máximo de 2.000 pasos y se selecciona el mejor checkpoint según WER de tokens telefónicos en validación (registro de step 1.900 con WER 0,072458). El mapeo de fonemas `60-39` está documentado en `phone_mapping.txt` (por ejemplo, `ao → aa`, `ax → ah`, `zh → zh`, `dx` se mantiene, `q` sin salida mapeada). La model card no detalla el esquema de aumentación de datos ni hiperparámetros completos más allá de remitir a `train_conf.json`.

## Capacidades

- Reconocimiento fonémico a nivel de teléfono sobre habla leída en inglés a 16 kHz.
- Decodificación CTC con vocabulario de 39 fonemas más `sil`, blank y token de error.
- Evaluación de pronunciación y comparación con secuencias de referencia (útil para *mispronunciation detection*).
- Integración con la receta `wav2vec2-mdd-dev` mediante `AutoMDDModel` y su procesador.
- Soporte opcional de eliminación de silencios en la decodificación (`--remove-sil`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de salida ni modo de razonamiento.
- Multilingüismo limitado al inglés; no se reportan capacidades en otras lenguas.

## Casos de uso

- **Investigación fonética y análisis de corpus**: el modelo transcribe enunciados de TIMIT a secuencias de fonemas con PER de 8,21 % en core test, lo que permite estudiar variación alofónica y patrones de pronunciación con una línea base reproducible.
- **Detección de errores de pronunciación (MDD)**: comparando la secuencia decodificada con la referencia fonémica se pueden identificar sustituciones, omisiones e inserciones, lo que encaja con el propósito del repositorio original `wav2vec2-mdd-dev`.
- **Evaluación de sistemas de ASR**: las transcripciones telefónicas sirven como capa intermedia para medir la calidad acústica de un pipeline de reconocimiento antes de la etapa léxica.
- **Prototipos de aplicaciones de aprendizaje de idiomas**: el modelo puede alimentar un módulo que señale fonemas mal pronunciados en frases de práctica, siempre que se limite a inglés y habla leída.
- **Análisis de alineamiento forzado**: las salidas CTC permiten alinear fonemas con tramas de audio para estudios de duración y coarticulación.
- **Reproducción de experimentos académicos**: el checkpoint incluye `train_conf.json`, `evaluation_metrics.json` y el SHA-256 de los pesos, lo que facilita replicar los resultados del autor en TIMIT con la receta original.
- **Evaluación comparativa de encoders acústicos**: sirve como referencia para comparar variantes de wav2vec 2.0 u otros encoders en la tarea de reconocimiento fonémico sobre TIMIT.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el mejor checkpoint, calculados a partir de las referencias e hipótesis guardadas por enunciado:

| Split TIMIT | Enunciados | PER con `sil` | PER sin `sil` | S / D / I sin `sil` |
|---|---:|---:|---:|---:|
| Dev | 400 | 7,08 % | 7,30 % | 540 / 144 / 196 |
| Core test | 192 | 8,21 % | 8,86 % | 307 / 66 / 137 |

El autor advierte que estos resultados dependen del mapeo de fonemas incluido y del split de TIMIT, y no son directamente comparables con los de otros trabajos que usen otro mapeo o conjunto de test. No se proporcionan resultados de benchmarks estándar de ASR (WER léxico, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1,3 GB solo de pesos, más activaciones; una GPU con 4-6 GB suele ser suficiente para audios cortos. No se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para audios de pocos segundos; A100, H100, RTX 4090 o RTX 3090 son holgadas para esta carga.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que se procesen segmentos cortos.
- Opciones de despliegue: la model card indica que se use la receta original `wav2vec2-mdd-dev` con `AutoMDDModel` y su procesador; no se garantiza compatibilidad directa con `Wav2Vec2ForCTC`, vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fuann/timit-wav2vec2-large-lv60-phoneme-v2` | ~317 M (base, no confirmado) | audio 16 kHz mono | PER 8,21 % core test con `sil` | no disponible | Hugging Face, 0 descargas |
| `facebook/wav2vec2-large-lv60` | ~317 M | audio 16 kHz mono | modelo base preentrenado, sin fine-tuning fonémico | no disponible en la información | Hugging Face |
| `facebook/wav2vec2-base-960h` | ~95 M | audio 16 kHz mono | ASR léxico en inglés (no fonémico) | no disponible en la información | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con otros reconocedores fonémicos sobre TIMIT en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TIMIT (habla leída en inglés); no se ha validado en habla espontánea, acentos no nativos (L2) ni otras lenguas.
- El autor advierte explícitamente que los resultados en inglés leído no establecen rendimiento en habla L2 ni en detección de errores de pronunciación.
- No es un checkpoint compatible directamente con `Wav2Vec2ForCTC`; requiere `AutoMDDModel` y el procesador del repositorio.
- Los resultados dependen del mapeo de fonemas `60-39` y del split de TIMIT; no son comparables con otros mapeos o conjuntos de test.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- TIMIT es un corpus con licencia independiente; su uso está restringido y no se incluye audio ni transcripciones en el repositorio.
- Riesgo de alucinación y errores de sustitución, omisión e inserción documentados en la tabla de métricas; el PER no es cero.
- Sin descargas ni validación por la comunidad (0 descargas, 0 likes en el momento de la consulta).
- No se documentan sesgos demográficos ni de género; el corpus TIMIT tiene una composición de hablantes específica que puede no representar a la población general.
- No apto para producción sin una evaluación propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fuann/timit-wav2vec2-large-lv60-phoneme-v2
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Repositorio de la receta: https://github.com/Fuann/wav2vec2-mdd-dev
- Paper de wav2vec 2.0 (referencia del modelo base): no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
