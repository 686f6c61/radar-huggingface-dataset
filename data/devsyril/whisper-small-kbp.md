# Devsyril/whisper-small-kbp

## Resumen

`whisper-small-kbp` es un modelo de reconocimiento automático del habla (ASR) desarrollado por Devsyril, que adapta el modelo base `openai/whisper-small` a la lengua kabiyè (código ISO 639-3: `kbp`), una lengua gur hablada principalmente en Togo. El modelo resuelve el problema de la falta de sistemas ASR para lenguas de bajos recursos, ofreciendo una solución de transcripción de audio a texto específica para este idioma. La relevancia actual radica en la creciente demanda de herramientas de procesamiento del habla para lenguas minoritarias, donde los modelos multilingües generalistas suelen fallar.

El modelo se ha afinado mediante la técnica PEFT/LoRA sobre el corpus `KBPRCV_whisper_dataset` (proyecto Wilderness ASR), compuesto por lecturas de textos bíblicos en kabiyè. Los pesos del adaptador LoRA se han fusionado con el modelo base, por lo que el repositorio contiene un `WhisperForConditionalGeneration` completo, listo para usar sin dependencias adicionales de `peft`. La arquitectura es la de Whisper-small, un transformer encoder-decoder con 244 millones de parámetros, y la ventana de contexto de audio es de 30 segundos, limitación nativa de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana nativa de Whisper) |
| Tipos de cuantizacion | No disponible (pesos en fp16, cuantizables con herramientas externas) |
| Idiomas soportados | Kabiyè (`kbp`) exclusivamente (el modelo base soporta otros, pero este fine-tune solo transcribe kabiyè) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper-small de OpenAI, un transformer encoder-decoder entrenado con supervisión débil a gran escala sobre 680.000 horas de audio multilingüe. Para este fine-tune, se ha aplicado la técnica PEFT/LoRA con los siguientes hiperparámetros: r=32, lora_alpha=64, target_modules en `q_proj` y `v_proj`, y lora_dropout=0.05. El entrenamiento se realizó durante 10 épocas con un batch size de 16, learning rate de 1e-3, precisión fp16 y carga del modelo base en 8-bit durante el entrenamiento. El adaptador LoRA se fusionó posteriormente con el modelo base mediante `merge_and_unload`, resultando en un modelo completo sin dependencia de la librería `peft`.

Los datos de entrenamiento provienen del corpus `KBPRCV_whisper_dataset`, que contiene 7.923 clips de audio (aproximadamente 21 horas y 39 minutos) de lecturas de textos bíblicos en kabiyè, muestreados a 16 kHz. El split es de ~90% entrenamiento, ~5% validación y ~5% test, estratificado por libro bíblico para preservar la homogeneidad temática. Un aspecto técnico destacable es que, al no ser el kabiyè una lengua nativamente soportada por Whisper, no se ha forzado ningún token de idioma (`forced_decoder_ids=None`); el modelo ha aprendido la asociación audio-texto directamente mediante el fine-tuning supervisado.

## Capacidades

- Transcripción de audio a texto (ASR) en kabiyè, con salida de texto plano sin marcas de tiempo.
- Manejo de audio de hasta 30 segundos por clip (limitación nativa de Whisper).
- Funciona con el pipeline `automatic-speech-recognition` de HuggingFace Transformers.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.
- Capacidad multilingüe limitada: solo kabiyè (aunque el modelo base es multilingüe, este fine-tune no ha sido entrenado para otros idiomas).
- No incluye modo de pensamiento, visión ni audio adicional más allá de la entrada de voz.

## Casos de uso

- Transcripción de archivos de audio en kabiyè para archivos históricos o religiosos: el modelo puede procesar grabaciones de sermones, lecturas o entrevistas y generar texto en kabiyè, útil para digitalizar contenidos orales.
- Creación de subtítulos para vídeos en kabiyè: dado su entrenamiento en lecturas claras, puede generar subtítulos para material audiovisual de tipo narrativo o documental.
- Asistencia en traducción bíblica o lingüística: investigadores que trabajen con el corpus KBPRCV pueden usar el modelo para transcribir nuevas grabaciones y agilizar el trabajo de campo.
- Desarrollo de aplicaciones de accesibilidad: personas con discapacidad auditiva que hablen kabiyè pueden beneficiarse de sistemas de transcripción en tiempo real (si se integra con un pipeline de streaming).
- Investigación en ASR para lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de fine-tuning con LoRA en otras lenguas minoritarias, demostrando una metodología reproducible.
- Generación de datos de entrenamiento para otros modelos: las transcripciones producidas pueden usarse para crear datasets etiquetados en kabiyè, útiles para tareas de NLP posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card declara un valor de WER "XX.X" en el conjunto de test del dataset KBPRCV, pero el autor indica que los valores están "à compléter après entraînement" (por completar tras el entrenamiento), por lo que no hay datos verificados.

| Split | WER (%) |
|---|---|
| Validación | No disponible |
| Test | No disponible |

## Requisitos de hardware

- VRAM estimada: el modelo completo en fp16 ocupa aproximadamente 460 MB de pesos, pero la inferencia requiere memoria adicional para activaciones y el procesador de audio. Se estima un uso de VRAM entre 1 y 2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 2060, RTX 3060, T4, A100 (esta última usada en el entrenamiento).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media (RTX 3060 o superior) y también en CPU con cuantización (aunque más lento).
- Opciones de despliegue: se puede usar con `transformers` (pipeline), `vLLM` (aunque Whisper no es el foco principal de vLLM, soporta ASR), `llama.cpp` no es compatible directamente con Whisper (se requiere `whisper.cpp`), y `Ollama` no soporta modelos de audio. Las opciones recomendadas son `transformers` y `whisper.cpp` (tras conversión a GGUF).
- Latencia y throughput: no hay mediciones publicadas. En una T4, se puede esperar una transcripción de un clip de 10 segundos en menos de 1 segundo (inferencia en lote), pero depende de la implementación.

## Comparativa con modelos similares

No hay una comparativa directa disponible con otros modelos ASR para kabiyè, dado que es un modelo pionero para esta lengua. Como referencia, se puede comparar con el modelo base `openai/whisper-small` (que no reconoce kabiyè de forma fiable) y con otros fine-tunes de Whisper para lenguas de bajos recursos, pero sin datos de rendimiento concretos.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whisper-small-kbp` | 241.7M | 30s audio | kabiyè | Apache-2.0 | HuggingFace |
| `openai/whisper-small` | 244M | 30s audio | 96 idiomas (no kabiyè) | MIT | HuggingFace |
| `openai/whisper-base` | 74M | 30s audio | 96 idiomas (no kabiyè) | MIT | HuggingFace |

## Limitaciones y advertencias

- El corpus de entrenamiento se compone exclusivamente de lecturas de textos bíblicos, por lo que el vocabulario, el registro y la prosodia están fuertemente sesgados hacia ese dominio. El rendimiento en habla espontánea, conversacional o en otros dominios (noticias, discursos técnicos) será previsiblemente inferior.
- El corpus probablemente proviene de un número limitado de locutores, lo que puede afectar a la robustez frente a variaciones de acento, dialecto o ruido ambiental.
- Al no ser el kabiyè una lengua nativa de Whisper, no se ha transferido conocimiento lingüístico previo específico; toda la capacidad de reconocimiento depende del fine-tuning, lo que puede limitar la generalización.
- Los clips de audio de más de 30 segundos fueron excluidos del entrenamiento, por lo que el modelo no maneja entradas más largas sin segmentación previa.
- No se han publicado métricas de rendimiento verificadas (WER), por lo que la calidad real del modelo no está demostrada.
- La licencia Apache-2.0 permite uso comercial, pero el corpus subyacente (KBPRCV) puede tener restricciones adicionales; se recomienda verificar los términos de uso del dataset.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Devsyril/whisper-small-kbp)
- [Paper de Whisper (Radford et al., 2022)](https://arxiv.org/abs/2212.04356)
- [Dataset KBPRCV Whisper Dataset](https://huggingface.co/datasets/wilderness_asr/KBPRCV_whisper_dataset)
