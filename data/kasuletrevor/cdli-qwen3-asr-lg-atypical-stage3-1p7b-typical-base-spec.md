# KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-spec

## Resumen

Este modelo es un checkpoint de Qwen3-ASR afinado para el reconocimiento de habla atípica (no estándar) en luganda, una lengua bantú hablada en Uganda. Ha sido desarrollado por KasuleTrevor a partir de un modelo base previamente afinado para habla típica de luganda (`KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune`), y entrenado sobre el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, que contiene muestras de habla no estándar. El objetivo es mejorar la transcripción automática de variedades dialectales, acentos o patrones de habla no convencionales en este idioma.

El modelo pertenece a la familia Qwen3-ASR, que integra un encoder de audio con un modelo de lenguaje para generar transcripciones. Tiene aproximadamente 2.040 millones de parámetros y se distribuye en formato safetensors. El entrenamiento incorporó SpecAugment como técnica de aumento de datos para mejorar la robustez frente a variaciones acústicas. Según la model card, el checkpoint seleccionado (`checkpoint-500`) alcanza un WER de 0,620 en validación y 0,536 en test, lo que indica un rendimiento moderado que aún deja margen de mejora.

La relevancia de este modelo radica en su enfoque en habla atípica de un idioma de bajos recursos como el luganda, un área poco cubierta por los sistemas ASR comerciales. Su publicación permite a la comunidad investigadora y a desarrolladores explorar técnicas de adaptación para variedades lingüísticas no estándar, aunque su licencia no está especificada, lo que limita su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3-ASR (arquitectura interna no especificada) |
| Parametros totales | 2.038.052.480 (≈2,04B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | luganda (lg) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero por el nombre y la familia se infiere que sigue el diseño de Qwen3-ASR, que combina un encoder de audio (posiblemente basado en Whisper o similar) con un decodificador de lenguaje. El modelo se obtuvo mediante fine-tuning del checkpoint `cdli-qwen3-asr-lg-typical-1p7b-base-finetune`, que ya había sido adaptado a habla típica de luganda, y posteriormente se afinó con el dataset de habla no estándar.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 5e-5, scheduler `constant_with_warmup`, 3 épocas, batch size de 2 con acumulación de gradientes de 4, y guardado cada 250 pasos. Se empleó SpecAugment como técnica de aumento de datos, que aplica enmascaramiento temporal y de frecuencia en los espectrogramas para mejorar la generalización. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el proceso es exclusivamente de supervisión con transcripciones.

El checkpoint final seleccionado fue `checkpoint-500`, elegido por su menor WER normalizado en el corpus de validación. Los resultados de evaluación se reconstruyeron a partir de salidas de un notebook de entrenamiento, por lo que no se dispone de predicciones completas por utterance.

## Capacidades

- Reconocimiento automático de voz (ASR) para luganda, con especial atención a habla atípica o no estándar.
- Transcripción de audio a texto en un solo idioma (luganda).
- Uso de SpecAugment para robustez frente a variaciones acústicas.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión u otras modalidades; es un modelo puramente de transcripción de voz.

## Casos de uso

- Transcripción de entrevistas y testimonios en luganda con acentos regionales: el modelo está entrenado con habla no estándar, por lo que puede capturar variaciones dialectales que los sistemas genéricos suelen fallar. Se usaría alimentando archivos de audio directamente al pipeline de ASR.
- Subtitulado automático de vídeos en luganda para plataformas de contenido local: su capacidad de manejar habla atípica permite generar subtítulos para vídeos con hablantes de distintas regiones.
- Asistencia a personas con trastornos del habla: al estar afinado con habla no estándar, podría servir como base para sistemas de comunicación aumentativa en luganda, aunque su WER alto indica que requiere post-procesamiento.
- Documentación de lenguas en peligro: el modelo puede transcribir grabaciones de campo de hablantes de luganda con variantes no estándar, facilitando la labor de lingüistas.
- Investigación en ASR para lenguas de bajos recursos: sirve como punto de partida para experimentos con SpecAugment y fine-tuning en otros idiomas africanos.
- Evaluación comparativa de técnicas de adaptación: los desarrolladores pueden usar este checkpoint como referencia para probar métodos de mejora de WER en habla atípica.

## Benchmarks y rendimiento

Los resultados reportados en la model card son los siguientes:

| Checkpoint | Validación WER | Validación CER | Eval loss | Test WER | Test CER | Avg WER capped | Avg CER capped |
|---|---|---|---:|---:|---:|---:|---:|---:|
| `checkpoint-500` | 0,620471 | 0,311040 | 0,460929 | 0,536493 | 0,259594 | 0,457453 | 0,205291 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación.
- Con ~2.040 millones de parámetros, una estimación prudente para inferencia en FP16 es de unos 4-5 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como una RTX 3060 (12 GB) o RTX 4090.
- Para cuantización a 8 bits, el uso de VRAM se reduciría a ~2-3 GB, siendo viable en GPUs con 6-8 GB.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), pero al ser un modelo de audio-lenguaje, probablemente se integre con librerías de ASR como Transformers o Whisper.
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparativas con otras alternativas para luganda o habla atípica.

## Limitaciones y advertencias

- Rendimiento limitado: el WER en test es de 0,536, lo que indica que más de la mitad de las palabras se transcriben incorrectamente; no es apto para uso en producción sin post-procesamiento o corrección humana.
- Sesgo de dominio: el modelo se entrenó exclusivamente con el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, por lo que puede no generalizar bien a otros registros o variedades de luganda no representadas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar transcripciones plausibles pero incorrectas, especialmente en audio de baja calidad o con ruido.
- Licencia no especificada: no se indica ninguna licencia, lo que impide conocer las condiciones de uso comercial o redistribución. Se recomienda contactar al autor antes de cualquier uso.
- Soporte monolingüe: solo transcribe luganda; no hay soporte para otros idiomas ni para código o herramientas.
- Falta de documentación sobre arquitectura: no se detallan detalles internos (tipo de attention, tamaño del encoder, etc.), lo que dificulta la reproducción o adaptación técnica.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-spec)
- [Modelo base](https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune)
- [Dataset de entrenamiento](https://huggingface.co/datasets/cdli/ugandan_luganda_nonstandard_speech_v1.0) (mencionado en la model card)
