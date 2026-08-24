# georges-1/whisper-small-swahili-finetuned-waxalnlp

## Resumen

El modelo `georges-1/whisper-small-swahili-finetuned-waxalnlp` es un sistema de reconocimiento automático del habla (ASR) para suajili, resultado de un fine-tuning de otro modelo ya afinado para este idioma. Se basa en la arquitectura Whisper-small de OpenAI, un transformer encoder-decoder entrenado sobre 680 000 horas de audio etiquetado. El autor, georges-1, ha realizado un ajuste adicional sobre un modelo previamente afinado, con el objetivo de mejorar la precisión en la transcripción de audio en suajili.

El modelo cuenta con 241 734 912 parámetros y se distribuye en formato safetensors, compatible con la librería transformers. Aunque la ficha técnica es escasa, los resultados de validación durante el entrenamiento muestran una pérdida final de 0,3681 y una tasa de error de palabra (WER) de 0,3475, lo que indica un rendimiento moderado para la tarea. Es relevante para desarrolladores que necesiten transcribir audio en suajili, especialmente en contextos donde se requiere un modelo ligero y de código abierto, aunque su licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241 734 912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper-small usa ventanas de 30 s de audio) |
| Tipos de cuantizacion | No disponible (formato safetensors original) |
| Idiomas soportados | Suajili (idioma de entrenamiento, aunque el modelo base Whisper soporta múltiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `georges-1/whisper-small-swahili-finetuned`, que a su vez es un ajuste de `openai/whisper-small`. Whisper-small sigue la arquitectura transformer estándar con 12 capas de encoder y 12 de decoder, con atención de 12 cabezas y dimensiones ocultas de 768. El entrenamiento se realizó sobre un dataset desconocido, con hiperparámetros específicos: learning rate de 1e-5, batch size de 4 con acumulación de gradientes de 4 (batch efectivo 16), optimizador AdamW, scheduler lineal con warmup de 100 pasos y 3 épocas. Se usó precisión mixta (AMP). La pérdida final fue de 0,3681 y el WER de validación de 0,3475. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especiales.

## Capacidades

- Reconocimiento automático del habla (ASR) para audio en suajili, convirtiendo audio a texto.
- Soporte de entrada de audio en formato de onda (típicamente archivos de audio de 30 s o menos por ventana).
- No dispone de capacidades de tool calling, agentes o razonamiento multi-step.
- No es multimodal; solo procesa audio y genera texto.
- No se ha documentado soporte para otros idiomas, aunque el modelo base Whisper-small los soporta; este fine-tune está especializado en suajili.

## Casos de uso

- **Transcripción de entrevistas y reuniones en suajili**: el modelo puede convertir grabaciones de audio en texto, facilitando la documentación y búsqueda de contenido en este idioma.
- **Subtitulado de vídeos**: integrado en un pipeline de postproducción, puede generar subtítulos automáticos para contenido audiovisual en suajili, reduciendo el trabajo manual.
- **Asistentes de voz para aplicaciones locales**: permite la interacción por voz en aplicaciones móviles o web dirigidas a hablantes de suajili, transcribiendo comandos o preguntas.
- **Archivos de audio históricos**: digitalización de archivos sonoros en suajili, convirtiendo cintas o grabaciones en texto buscable.
- **Sistemas de atención al cliente**: transcripción de llamadas en suajili para análisis de calidad y entrenamiento de agentes.
- **Traducción automática**: como paso previo en un pipeline de traducción, el texto transcrito puede ser enviado a un sistema de traducción para generar versiones en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente los resultados de validación del entrenamiento:

| Métrica | Valor |
|---|---|
| Loss (validación) | 0,3681 |
| WER (validación) | 0,3475 |

Estos valores provienen del proceso de fine-tuning, no de un benchmark estándar como Common Voice o LibriSpeech. No hay comparación con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16, Whisper-small necesita aproximadamente 1-2 GB de VRAM. Con cuantización (por ejemplo, Q4) puede reducirse a menos de 1 GB, aunque no se ha proporcionado versiones cuantizadas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o superiores. En GPU con 4 GB se puede ejecutar cómodamente.
- **Consumer GPU**: sí, puede ejecutarse en GPUs de consumo como la RTX 3060 o incluso en CPU con rendimiento aceptable para inferencia por lotes.
- **Opciones de despliegue**: se puede usar con Hugging Face Transformers (pipeline de ASR), así como con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no hay versiones GGUF oficiales.
- **Latencia y throughput**: no se dispone de mediciones. En una GPU moderna, la transcripción de un audio de 30 s suele tomar menos de 1 segundo, pero depende del hardware y la longitud del audio.

## Comparativa con modelos similares

No hay datos disponibles para comparar directamente con otros modelos de Whisper afinados para suajili. Existen modelos como `diane20000000000000/whisper-small-swahili` y `NMutangana/whisper-small-swahili` que también son fine-tunes de Whisper-small sobre el dataset Common Voice 11.0, pero no se dispone de sus resultados de WER en esta información. Por tanto, no se puede ofrecer una comparativa cuantitativa.

## Limitaciones y advertencias

- **Licencia desconocida**: al no especificarse la licencia, no se garantiza el uso comercial. Se debe contactar con el autor o asumir un riesgo legal.
- **Datos de entrenamiento desconocidos**: el dataset no se indica, lo que dificulta evaluar el sesgo o la generalización.
- **Riesgo de alucinación**: como todo modelo ASR, puede producir texto que no corresponde al audio, especialmente con ruido o acentos no representados en los datos.
- **Idioma limitado**: aunque Whisper base soporta muchos idiomas, este fine-tune puede degradar su rendimiento en otros idiomas distintos del suajili.
- **Sin información de sesgos**: no se documentan sesgos étnicos, de género o de dialecto, lo que es un riesgo para aplicaciones sensibles.
- **Modelo pequeño**: Whisper-small tiene un WER relativamente alto comparado con modelos más grandes (Whisper-medium, large), por lo que no es adecuado para transcripciones de alta precisión.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/georges-1/whisper-small-swahili-finetuned-waxalnlp)
- [Modelo base: georges-1/whisper-small-swahili-finetuned](https://huggingface.co/georges-1/whisper-small-swahili-finetuned)
- [Modelo relacionado: diane20000000000000/whisper-small-swahili](https://huggingface.co/diane20000000000000/whisper-small-swahili)
- [Modelo relacionado: NMutangana/whisper-small-swahili](https://huggingface.co/NMutangana/whisper-small-swahili)
