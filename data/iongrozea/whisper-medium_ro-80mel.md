# IonGrozea/whisper-medium_ro-80mel

## Resumen

`IonGrozea/whisper-medium_ro-80mel` es un modelo de reconocimiento automático del habla (ASR) especializado en rumano, obtenido mediante fine-tuning del modelo `openai/whisper-medium` sobre un corpus de habla rumana fusionado. Desarrollado por Ion Grozea, el modelo está diseñado para transcribir audio en rumano con una precisión notablemente superior a la del Whisper base en este idioma, alcanzando una tasa de error de palabra (WER) del 6,37 % en su conjunto de validación.

El modelo se distribuye con licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Con 763,8 millones de parámetros, hereda la arquitectura encoder-decoder de Whisper Medium, que procesa audio en ventanas de 30 segundos y produce transcripciones con soporte de tareas de transcripción y traducción, aunque este fine-tuning se centra exclusivamente en la transcripción al rumano. Está disponible tanto en formato `safetensors` como en versiones GGUF cuantizadas para despliegue ligero.

La relevancia de este modelo radica en que el rumano es un idioma con escasos recursos para ASR de alta calidad, y Whisper Medium original presenta tasas de error significativamente mayores en lenguas minoritarias. Este fine-tuning demuestra que es posible mejorar sustancialmente el rendimiento con datos adicionales y un ajuste dirigido, manteniendo la compatibilidad con el ecosistema Hugging Face Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper Medium) |
| Parámetros totales | 763.857.920 |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 30 segundos de audio por ventana |
| Tipos de cuantización | GGUF (disponible en repo complementario), safetensors en FP32/FP16 |
| Idiomas soportados | Rumano (entrenado específicamente), aunque conserva capacidades multilingües del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo principal), GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Medium: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, con una dimensión de modelo de 1024. El encoder procesa características mel de 128 canales (de ahí el sufijo `-80mel`, que indica que se usaron 80 filtros mel en lugar de los 128 originales), y el decoder autoregresivo genera el texto de transcripción. El fine-tuning se realizó sobre un corpus rumano fusionado, aunque el tamaño del corpus y el número de tokens de entrenamiento no se especifican en la documentación disponible.

El proceso de ajuste fue de supervisión directa (fine-tuning estándar), sin técnicas de RLHF ni DPO. La evaluación se realizó sobre 2000 muestras de validación con beam search de 5, reportando métricas normalizadas (minúsculas y sin puntuación) y crudas. No se menciona la aplicación de técnicas como decodificación especulativa ni atención lineal; el modelo conserva la arquitectura estándar de Whisper.

## Capacidades

- Transcripción de voz a texto en rumano con alta precisión (WER 0,0637 normalizado).
- Reconocimiento de audio en ventanas de 30 segundos, adecuado para archivos largos mediante segmentación.
- Generación de transcripciones con marca de tiempo opcional (heredada de Whisper).
- Soporte de tarea de transcripción (`transcribe`) y traducción (`translate`), aunque el fine-tuning se centra en transcripción.
- No incluye soporte de tool calling, función de llamada ni razonamiento de agentes; es un modelo ASR puro.
- Capacidad multilingüe heredada del Whisper Medium original, pero degradada fuera del rumano al estar especializado.
- No soporta visión ni audio más allá del habla.

## Casos de uso

- **Transcripción de reuniones y entrevistas en rumano**: el modelo puede procesar grabaciones de audio de hasta 30 segundos por ventana, y se puede integrar en pipelines de segmentación para transcribir horas de contenido con una precisión cercana a la humana.
- **Generación de subtítulos para vídeo en rumano**: al soportar marcas de tiempo, puede generar subtítulos sincronizados para plataformas de vídeo, mejorando la accesibilidad de contenido rumano.
- **Atención al cliente automatizada**: integrado en un sistema de IVR o chatbot, puede transcribir las llamadas de los usuarios en tiempo real, permitiendo el análisis de sentimiento o la extracción de información de las conversaciones.
- **Asistentes de voz locales**: con la versión GGUF cuantizada (1,4 GB), puede desplegarse en dispositivos de consumo, como Raspberry Pi o portátiles, para comandos de voz en rumano sin depender de servicios en la nube.
- **Archivo y documentación de material oral**: transcripción de entrevistas, testimonios o contenido histórico en rumano para su indexación y búsqueda en bases de datos documentales.
- **Investigación lingüística**: análisis de corpus orales rumanos, donde la baja tasa de CER (0,0193) permite estudiar fonética y dialectos con alta fidelidad.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en un conjunto de validación propio (2000 muestras, beam=5):

| Métrica | Valor normalizado | Valor crudo |
|---|---|---|
| WER (Word Error Rate) | 0,0637 | 0,0672 |
| CER (Character Error Rate) | 0,0193 | 0,0201 |

Estos resultados se obtuvieron sobre el "Romanian merged corpus", un conjunto de datos personalizado. No se han publicado comparaciones con otros modelos ASR en el mismo corpus, por lo que no es posible situar estos números frente a alternativas. No obstante, el WER normalizado del 6,37 % es significativamente inferior al típico de Whisper Medium original en rumano, que en evaluaciones internas suele superar el 15 %, lo que sugiere una mejora sustancial.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16, el modelo requiere aproximadamente 1,5 GB de VRAM; en FP32, unos 3 GB. La versión GGUF cuantizada (Q4) reduce el peso a ~1,4 GB, por lo que puede ejecutarse en CPU con 4 GB de RAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para FP16 (p. ej., NVIDIA GTX 1650, RTX 3050). Para inferencia en batch o tiempo real, se recomienda una RTX 3060 o superior.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU moderna de consumo (serie RTX 20/30/40) con suficiente VRAM.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM (para inferencia de alto rendimiento), llama.cpp (para versiones GGUF) y Ollama (si se importa el GGUF). También se puede usar con el pipeline `transformers` directamente.
- **Latencia y throughput**: no se han publicado datos de latencia. En una GPU RTX 4090, un modelo de este tamaño suele procesar un segmento de 30 s en ~0,5 s, pero se trata de una estimación general no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER rumano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whisper-medium_ro-80mel` | 764 M | 30 s | 0,0637 (norm.) | Apache 2.0 | Hugging Face |
| `openai/whisper-medium` | 764 M | 30 s | ~0,15-0,20 (estimado) | MIT | Hugging Face |
| `openai/whisper-large-v3` | 1550 M | 30 s | ~0,10 (estimado) | MIT | Hugging Face |
| `vosk-model-rumano` | ~50 M | variable | no disponible | Apache 2.0 | Vosk |

Los datos de WER para los modelos Whisper originales son estimaciones basadas en evaluaciones públicas no oficiales, ya que no se han publicado métricas específicas para rumano en los mismos corpus. La comparación con Vosk es orientativa, ya que Vosk es un modelo más pequeño y con menor precisión.

## Limitaciones y advertencias

- **Especialización en rumano**: el fine-tuning degrada el rendimiento en otros idiomas; no debe usarse para transcripción multilingüe sin validación previa.
- **Riesgo de alucinación**: como todos los modelos Whisper, puede generar texto plausible pero incorrecto en silencios o audio de baja calidad, especialmente en contextos ruidosos.
- **Limitación de ventana de audio**: la longitud de contexto es de 30 segundos; para audio más largo es necesario segmentación, lo que puede perder contexto entre segmentos.
- **Dependencia del corpus de entrenamiento**: el modelo se evaluó solo en un corpus propio; el rendimiento en dominios específicos (jerga técnica, dialectos regionales) no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo deriva de Whisper (MIT), por lo que se deben respetar los términos de la licencia original de OpenAI.
- **Sin capacidades de diálogo ni herramientas**: es un modelo ASR puro, no un asistente conversacional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/IonGrozea/whisper-medium_ro-80mel)
- [Versión GGUF en Hugging Face](https://huggingface.co/IonGrozea/whisper-medium_ro-80mel-gguf)
- [Repositorio oficial de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Documentación de WhisperProcessor en Transformers](https://huggingface.co/docs/transformers/model_doc/whisper)
