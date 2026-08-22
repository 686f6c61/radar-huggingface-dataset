# IonGrozea/whisper-large-v3-turbo-ro

## Resumen

El modelo `whisper-large-v3-turbo-ro` es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo`, desarrollado por IonGrozea. Está entrenado específicamente para el idioma rumano sobre un corpus combinado de 7 conjuntos de datos, sumando un total de 296,535 muestras de audio (626,80 horas). El objetivo es mejorar la precisión de transcripción del rumano, un idioma con recursos limitados en los modelos genéricos de Whisper.

La relevancia de este modelo radica en que ofrece una alternativa especializada y de código abierto (licencia Apache 2.0) para transcripción automática de rumano, con una arquitectura optimizada (Whisper Large v3 Turbo) que mantiene un equilibrio entre velocidad y calidad. Al estar basado en el modelo turbo, es más rápido que la versión large original, y su fine-tune específico lo hace más preciso en dominios como conversaciones cotidianas, voces sintetizadas y acentos regionales.

El modelo se distribuye en formato HuggingFace (compatible con Transformers) y también existe una versión cuantizada GGUF del mismo autor, lo que facilita su despliegue en entornos con recursos limitados. No se han publicado métricas de rendimiento (WER/CER) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parámetros totales | No disponible (el modelo base Whisper Large v3 Turbo tiene ~809 M, pero no se confirma) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (Whisper usa ventanas de 30 s de audio) |
| Tipos de cuantización | No disponible (existe un repositorio GGUF del autor) |
| Idiomas soportados | Rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | No especificado (carga con `transformers`; el repo tiene 3.2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Large v3 Turbo: un transformer encoder-decoder con atención de escala completa, procesa espectrogramas de 128 canales mel (features de 128-mel). El entrenamiento se realizó sobre una GPU NVIDIA H100 80GB, con precisión BF16, un batch efectivo de 64 (16 por dispositivo con acumulación de gradientes de 4), optimizador AdamW con learning rate 7e-6, scheduler coseno con 500 pasos de calentamiento, y un máximo de 10 épocas con early stopping. Se usó SpecAugment con 2 máscaras de frecuencia (F=27) y 2 máscaras de tiempo (T=100). No se aplicó label smoothing ni gradient checkpointing.

El corpus de entrenamiento combina 7 conjuntos de datos: Echo (374.33 h), VoxPopuli (85.20 h), RODigits (37.55 h), RO-Smart (17.28 h), CommonVoice-25 (22.15 h), FLEURS (13.73 h) y USPDATRO (4.31 h). La partición de entrenamiento tiene 185,175 muestras (444.88 h) y la de validación 25,348 muestras (52.75 h). El conjunto de test CRoWL (72.25 h) se reservó para evaluación externa, aunque no se publicaron resultados.

## Capacidades

- Transcripción de audio en rumano (reconocimiento automático del habla).
- Manejo de audios de hasta 30 segundos por ventana (típico de Whisper).
- Soporte para generación con beam search (configurado con 5 beams en evaluación).
- Capacidad de transcribir tanto habla natural como voz sintética (el corpus incluye TTS).
- Funciona con muestras de audio a 16 kHz (recomendado).
- No se documentan capacidades de traducción, tool calling ni agentes.

## Casos de uso

- **Subtitulado automático de vídeos en rumano**: el modelo puede transcribir pistas de audio de vídeos, generando subtítulos con alta precisión en el idioma. Su entrenamiento en corpus diverso (incluye CommonVoice y VoxPopuli) lo hace adecuado para contenido variado.
- **Transcripción de llamadas de atención al cliente**: en centros de soporte, el modelo puede convertir llamadas en rumano a texto para análisis posterior, detección de intenciones o generación de resúmenes. La capacidad de manejar audio de 16 kHz y su fine-tune en conversación lo hacen útil.
- **Generación de subtítulos para plataformas de streaming**: al ser un modelo especializado en rumano, puede producir subtítulos con menos errores que un modelo genérico, especialmente para contenido local.
- **Asistentes de voz en rumano**: integrado en pipelines de ASR para aplicaciones de voz a texto, como dictado o comandos por voz. El bajo tamaño del modelo (3.2 GB) permite ejecutarlo en servidores con GPU moderadas.
- **Investigación lingüística**: análisis de corpus de habla rumana, transcripción de entrevistas o grabaciones para estudios de dialectos y variantes.
- **Despliegue en edge con GGUF**: el repositorio GGUF permite ejecutar el modelo en CPU o GPU de bajo consumo, facilitando su uso en entornos con recursos limitados, como raspberry pi o dispositivos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los valores de WER y CER son "N/A", y se menciona una evaluación sobre 25,348 muestras (52.75 h) pero sin resultados concretos.

## Requisitos de hardware

- **Tamaño del modelo**: 3.2 GB en pesos (formato HuggingFace). Con cuantización GGUF (por ejemplo q8_0) puede reducirse a ~1.5 GB.
- **VRAM estimada para inferencia**: no especificada, pero para un modelo de ~809M parámetros (Whisper Large v3 Turbo), se recomienda al menos 4 GB de VRAM en cuantización ligera y 8 GB para fp16.
- **GPU recomendadas**: NVIDIA RTX 3060 o superior para fp16; GPU con 4 GB para GGUF cuantizado. Para uso en producción con alta concurrencia, se recomienda A10 o A100.
- **Opciones de despliegue**: compatible con `transformers` (Python), `whisper.cpp` (via GGUF), `vLLM` (si se adapta) y `Ollama` (si se exporta a GGUF).
- **Latencia y throughput**: no se conocen datos específicos; el modelo Turbo de Whisper es optimizado para velocidad, con una degradación mínima en precisión frente a Large v3.

## Comparativa con modelos similares

| Modelo | Tamaño (params) | Contexto | Idioma | Licencia | Disponibilidad |
|--------|-----------------|----------|--------|----------|----------------|
| `openai/whisper-large-v3-turbo` | ~809M | 30 s audio | 99 idiomas | MIT | Original, genérico |
| `openai/whisper-large-v3` | ~809M | 30 s audio | 99 idiomas | MIT | Original, genérico |
| `IonGrozea/whisper-large-v3-turbo-ro` | No disponible | 30 s audio | Rumano | Apache-2.0 | Fine-tune, rumano |

El modelo se diferencia de los Whisper originales por su especialización en rumano, lo que debería mejorar el WER en ese idioma, aunque no hay datos que lo confirmen. La licencia Apache-2.0 es permisiva para uso comercial.

## Limitaciones y advertencias

- **Idioma único**: solo rumano; no soporta otros idiomas.
- **Sesgos de corpus**: el entrenamiento incluye una mezcla de datasets, pero algunos (como Echo) pueden contener voces sintéticas o acentos específicos que no representan todas las variantes del rumano.
- **Alucinación**: como todo modelo de ASR, puede generar texto inventado en audio ambiguo o ruidoso.
- **Sin resultados verificados**: los valores de WER/CER son "N/A", por lo que no se puede cuantificar su calidad.
- **Contexto limitado**: la ventana de audio está fijada a 30 s por inferencia; para audios más largos se necesita segmentación.
- **Licencia**: Apache-2.0 permite uso comercial, pero hay que citar al autor si se redistribuye.

## Enlaces

- [HuggingFace - IonGrozea/whisper-large-v3-turbo-ro](https://huggingface.co/IonGrozea/whisper-large-v3-turbo-ro)
- [HuggingFace - Repositorio GGUF](https://huggingface.co/IonGrozea/whisper-large-v3-ro-turbo-gguf)
- [Whisper Large v3 Turbo - GroqDocs](https://console.groq.com/docs/model/whisper-large-v3-turbo)
- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [OpenASR - Whisper Large v3 Turbo](https://openasr.org/models/whisper-large-v3-turbo/)
