# btolfa/sherpa-onnx-whisper-large-v3-turbo-russian-codeswitch-int8

## Resumen

`sherpa-onnx-whisper-large-v3-turbo-russian-codeswitch-int8` es una exportación a formato sherpa-onnx con cuantización int8 dinámica del modelo `coriollon/whisper-large-v3-turbo-russian-codeswitch`, un fine-tuning de Whisper large-v3-turbo orientado a reconocimiento automático de voz (ASR) en ruso con cambios de código (code-switching) ruso-inglés. Lo publica el usuario btolfa como artefacto de despliegue, no como modelo nuevo: los pesos solo han sido convertidos de formato y cuantizados, sin reentrenamiento adicional.

El modelo resuelve un problema práctico: ejecutar un ASR bilingüe ru/en de calidad sobre Whisper large-v3-turbo en entornos con recursos limitados o en pipelines que ya usan el runtime sherpa-onnx (k2-fsa). Al estar en int8 y en el formato nativo de sherpa-onnx, se puede integrar en aplicaciones de transcripción en C++, Python, Android o iOS sin depender de PyTorch en producción.

La relevancia actual es doble: por un lado, Whisper large-v3-turbo reduce los decodificadores a 4 capas (frente a 32 en large-v3), lo que baja mucho el coste de inferencia manteniendo buena calidad; por otro, el fine-tuning específico para code-switching cubre un caso que el Whisper original maneja de forma irregular, especialmente en habla informal rusa con términos técnicos en inglés. El repo ocupa 0,6 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX para sherpa-onnx |
| Parametros totales | no disponible (hereda los de Whisper large-v3-turbo; el autor no lo indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; el autor no lo explicita) |
| Tipos de cuantizacion | int8 dinámica |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (exportación sherpa-onnx), repo de 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3-turbo: un encoder Transformer sobre espectrogramas log-Mel y un decoder autorregresivo reducido a 4 capas (frente a las 32 de large-v3), lo que recorta el coste de decodificación de forma notable. El modelo base `coriollon/whisper-large-v3-turbo-russian-codeswitch` es un fine-tuning de ese checkpoint sobre datos de habla rusa con inserción de términos en inglés; el autor original no detalla en la información disponible el volumen de horas, la composición del dataset ni si hubo etapas de RLHF o DPO (en ASR supervisado no es lo habitual).

Esta ficha corresponde únicamente al artefacto de despliegue: conversión a ONNX y cuantización int8 dinámica, realizada con `tools/export_whisper_hf_to_sherpa.py` del repo `trevornk/ramblr` y `scripts/whisper/export-onnx.py` de `k2-fsa/sherpa-onnx` (commit `330609d`). No hay entrenamiento ni ajuste adicional; la pérdida de calidad respecto al modelo en fp32 depende de la sensibilidad del encoder a la cuantización, y el autor no publica métricas de esa degradación. La model card indica decodificar con `language="ru"` y el padding de cola por defecto de 1000 frames.

## Capacidades

- Reconocimiento automático de voz (transcripción) en ruso e inglés, con manejo de code-switching ru-en dentro de una misma emisión.
- Transcripción de audio de hasta 30 s por ventana, con segmentación externa para audios más largos (comportamiento estándar de Whisper).
- Ejecución en el runtime sherpa-onnx, con bindings para C++, Python, C#, Java/Kotlin, Swift y JavaScript, además de soporte en Android e iOS.
- Inferencia en CPU sin GPU, gracias a la cuantización int8 y al backend ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No tiene visión, audio generation ni modo thinking.
- Capacidad multilingüe limitada a los dos idiomas declarados (ru, en); el resto de idiomas de Whisper no están garantizados tras el fine-tuning.

## Casos de uso

- Transcripción de reuniones técnicas en ruso con terminología en inglés: el fine-tuning está pensado exactamente para este patrón (code-switching), y el decoder turbo de 4 capas mantiene la latencia baja en transcripciones de hora o más, segmentando el audio en ventanas de 30 s.
- Subtitulado automático de contenido audiovisual ruso: se puede procesar por lotes en CPU con sherpa-onnx y generar archivos SRT/VTT; el int8 reduce el coste por hora de audio frente a fp32.
- Asistentes de voz embebidos en Android o iOS: sherpa-onnx ofrece bindings nativos y el tamaño del repo (0,6 GB) es manejable para empaquetar en apps móviles con transcripción offline.
- Atención al cliente con grabaciones bilingües: transcripción de llamadas donde el cliente alterna ruso e inglés para alimentar análisis de calidad o búsqueda posterior.
- Pipeline de datos para entrenamiento de LLM: transcripción masiva de corpus de audio ruso en clústeres de CPU sin GPU, usando vLLM no aplica aquí; el despliegue típico es sherpa-onnx con ONNX Runtime.
- Investigación en ASR code-switching: punto de partida reproducible (Apache-2.0) para comparar el efecto de la cuantización int8 frente al checkpoint original en tareas ru-en.
- Indexación y búsqueda de archivos de audio: transcripción previa a un índice de texto para búsqueda semántica en archivos de podcast o clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones con el modelo base en fp32, por lo que no es posible cuantificar la degradación introducida por la cuantización int8 ni la mejora del fine-tuning frente a Whisper large-v3-turbo original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser int8 y ejecutarse con ONNX Runtime, el modelo está pensado para CPU y cabe holgadamente en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponibles; el caso de uso principal es CPU. Cualquier GPU con soporte ONNX Runtime (RTX 3060 en adelante) podría acelerar la inferencia, sin datos de throughput publicados.
- Cabe en GPU de consumo: sí, por el tamaño del repo (0,6 GB) y la cuantización int8, aunque no hay mediciones oficiales.
- Opciones de despliegue: sherpa-onnx (runtime nativo), ONNX Runtime; no se distribuye en GGUF, por lo que llama.cpp y Ollama no son aplicables; TGI y vLLM no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (sherpa-onnx int8) | no disponible (hereda large-v3-turbo) | 30 s por ventana | ru, en | Apache-2.0 | ONNX int8 |
| coriollon/whisper-large-v3-turbo-russian-codeswitch | no disponible (hereda large-v3-turbo) | 30 s por ventana | ru, en | Apache-2.0 | safetensors (Transformers) |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | 30 s por ventana | multilingüe | Apache-2.0 | safetensors |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | 30 s por ventana | multilingüe | Apache-2.0 | safetensors |

La comparación relevante es frente al checkpoint original: mismo rendimiento esperado salvo la degradación por int8 (no medida) y menor huella de memoria. Frente a Whisper large-v3-turbo de OpenAI, este modelo gana en especialización ru-en code-switching pero pierde cobertura multilingüe.

## Limitaciones y advertencias

- La cuantización int8 dinámica puede degradar el WER respecto al modelo en fp32; el autor no publica métricas, así que conviene validar sobre el dominio objetivo antes de producción.
- El fine-tuning está restringido a ruso e inglés; el resto de idiomas de Whisper no están garantizados y pueden producir salidas incorrectas o traducciones no deseadas.
- Sesgos: no documentados por el autor; al heredar datos de Whisper y del fine-tuning, puede reproducir sesgos de género, acento o registro presentes en el corpus de entrenamiento.
- Riesgo de alucinación típico de Whisper en silencios, ruido o audio musical: puede generar texto plausible no presente en el audio; se recomienda aplicar detección de silencio y filtros de confianza.
- Ventana de 30 s: requiere segmentación externa (VAD) para audios largos; sin ella, se pierden o duplican fragmentos en las fronteras.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar el aviso de licencia y verificar las condiciones del modelo base original.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria; tratar como artefacto no auditado.
- El autor indica explícitamente decodificar con `language="ru"`; usar otro idioma o autodetección puede dar resultados peores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/btolfa/sherpa-onnx-whisper-large-v3-turbo-russian-codeswitch-int8
- Modelo base: https://huggingface.co/coriollon/whisper-large-v3-turbo-russian-codeswitch (revisión `bf64d2a976a268e35041f74233f889f951f0f676`)
- Repo de exportación ramblr: https://github.com/trevornk/ramblr
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx (commit `330609dab49be6ee8b30702918ca7abbbad1286a`)
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
