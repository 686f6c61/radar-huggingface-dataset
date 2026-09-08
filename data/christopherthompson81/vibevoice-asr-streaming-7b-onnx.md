# christopherthompson81/vibevoice-asr-streaming-7b-onnx

## Resumen

El modelo `christopherthompson81/vibevoice-asr-streaming-7b-onnx` es una exportación en formato ONNX de `microsoft/VibeVoice-ASR-Streaming-7B`, un sistema de reconocimiento automático de voz (ASR) en streaming desarrollado por Microsoft. El autor, `christopherthompson81`, ha adaptado el checkpoint original para usarlo como backend de ASR en su proyecto Vernacula. El modelo resuelve el problema de transcribir "quién dijo qué" en tiempo real, sin necesidad de un diarizador separado, emitiendo fragmentos de texto cada 2,93 segundos de audio y marcando los turnos de hablante en línea.

Arquitectónicamente, combina un par de tokenizadores de audio causales (acústico y semántico) con un decoder Qwen2.5-7B. El modelo soporta 10 idiomas y tiene una ventana de contexto de 131.072 posiciones, equivalente a unas 2 horas de audio. La exportación ONNX introduce tres cambios clave respecto al checkpoint original: codificación de audio determinista (usa la media latente en lugar de muestreo gaussiano), pesos del decoder cuantizados a INT8 weight-only y una KV cache compartida preasignada que mantiene la VRAM plana durante toda la grabación. Su relevancia radica en que permite ASR en streaming con atribución de hablante en un formato desplegable con ONNX Runtime, bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Qwen2.5-7B sobre tokenizadores de audio causales (exportacion ONNX) |
| Parametros totales | 7B (modelo base; la exportacion no especifica el recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 posiciones (aproximadamente 2 horas de audio) |
| Tipos de cuantizacion | INT8 weight-only (decoder), float16 (codificador de audio) |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it (10 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (.onnx + .data), con metadatos JSON (export-report.json, config.json, tokenizer.json, preprocessor_config.json) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de `microsoft/VibeVoice-ASR-Streaming-7B`, que a su vez se basa en un decoder Qwen2.5-7B precedido por un par de tokenizadores de audio causales. El codificador de audio procesa ventanas fijas de 83.200 muestras (3,47 segundos) y produce 26 frames por ventana, que alimentan al decoder. La exportación simplifica el codificador utilizando la media de los latentes acústicos en lugar de muestrear con ruido gaussiano, lo que hace la codificación determinista y bit-repetible, dentro de la variación semilla a semilla del checkpoint original.

El decoder utiliza atención `GroupQueryAttention` sobre una KV cache compartida preasignada en float16, lo que evita que la VRAM crezca con la duración de la grabación. Los pesos del decoder están cuantizados a INT8 weight-only, reduciendo el tamaño a la mitad sin pérdida medible en precisión de transcripción. El modelo fue entrenado por Microsoft para transcripción en streaming con atribución de hablante, soporte de hotwords personalizados y 10 idiomas. No se proporcionan detalles específicos sobre los datos de entrenamiento en la información disponible.

## Capacidades

- Transcripción de voz en streaming: emite texto continuamente a medida que llega el audio, con un fragmento cada 2,93 segundos.
- Atribución de hablante integrada: marca los turnos de hablante en línea, sin necesidad de un diarizador separado.
- Soporte de 10 idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.
- Soporte de hotwords personalizados, según la documentación del proyecto VibeVoice original.
- Manejo de grabaciones largas (hasta aproximadamente 2 horas) con VRAM plana, gracias a la KV cache compartida.
- Codificación de audio determinista (media latente), lo que facilita la reproducibilidad en entornos de producción.
- Formato ONNX compatible con ONNX Runtime y el execution provider CUDA, lo que permite su integración en pipelines de ASR existentes.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo transcribe quién dijo qué a medida que hablan los participantes, lo que permite generar actas automáticas de reuniones con múltiples interlocutores sin necesidad de un diarizador externo.
- Subtitulado en vivo para streaming: gracias al streaming continuo y al factor de tiempo real de 0,142 en una RTX 3090, puede generar subtítulos en directo para vídeos o emisiones en 10 idiomas.
- Análisis de llamadas de atención al cliente: la atribución de hablante permite distinguir entre agente y cliente en llamadas telefónicas, facilitando el análisis de sentimiento y la generación de resúmenes automáticos.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real con identificación de hablante mejora la comprensión en entornos con múltiples interlocutores, como aulas o reuniones.
- Documentación de entrevistas y podcasts: al transcribir quién dijo qué, se simplifica la creación de transcripciones estructuradas para entrevistas, mesas redondas o episodios de podcast.
- Sistemas de dictado con contexto de conversación: en aplicaciones de dictado donde hay turnos de hablante (por ejemplo, dictado médico con paciente y doctor), el modelo puede separar las intervenciones y etiquetarlas correctamente.
- Integración como backend de ASR en sistemas propios: el formato ONNX permite usarlo como backend de ASR en proyectos como Vernacula, aprovechando ONNX Runtime con CUDA para un despliegue eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (WER, CER, etc.) en la información disponible. La model card proporciona los siguientes datos de rendimiento:

- Factor de tiempo real (RTF): aproximadamente 0,142 en una RTX 3090, es decir, procesa audio más rápido que en tiempo real.
- VRAM pico: aproximadamente 15,7 GB.
- La cuantización INT8 del decoder es indistinguible de float16 en precisión de transcripción.
- La atribución de hablante separó correctamente dos hablantes en un archivo de 30 minutos.

No se dispone de tablas comparativas con métricas de MMLU, HumanEval o similares, ya que se trata de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,7 GB pico, según la model card.
- GPU recomendadas: RTX 3090 (usada en las mediciones), o cualquier GPU con al menos 16 GB de VRAM y soporte CUDA (RTX 4080, A100, H100, etc.).
- No cabe en GPUs de consumo con menos de 16 GB (por ejemplo, una RTX 4060 de 8 GB no sería suficiente).
- Requiere ONNX Runtime con el execution provider CUDA. El `GroupQueryAttention` y los grafos float16 no están soportados en el provider CPU.
- Opciones de despliegue: ONNX Runtime con CUDA, integrable en pipelines de ASR personalizados. El modelo está pensado para usarse como backend en el proyecto Vernacula.
- Latencia y throughput: RTF de 0,142 en RTX 3090. La velocidad de decodificación disminuye a medida que se llena la KV cache, pero la VRAM permanece plana.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Streaming | Atribucion de hablante |
|---|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-7B ONNX (este modelo) | Qwen2.5-7B decoder + tokenizadores de audio | 131.072 posiciones (~2 h) | 10 | MIT | Si | Integrada |
| microsoft/VibeVoice-ASR-Streaming-7B (checkpoint original) | Qwen2.5-7B decoder + tokenizadores de audio | 131.072 posiciones (~2 h) | 10 | MIT | Si | Integrada |
| microsoft/VibeVoice-ASR (no streaming) | No especificado | 60 minutos | Mas de 50 | MIT | No | Integrada |

El checkpoint original de Microsoft utiliza codificación estocástica (muestreo gaussiano) y pesos float16, mientras que esta exportación ONNX es determinista y cuantiza el decoder a INT8. El modelo VibeVoice-ASR no streaming cubre más idiomas y maneja audio de hasta 60 minutos en una sola pasada, pero no funciona en streaming. No se dispone de información para comparar con otros modelos de ASR de la misma categoría.

## Limitaciones y advertencias

- Requiere ONNX Runtime con el execution provider CUDA; no funciona en CPU.
- La VRAM pico de 15,7 GB excluye GPUs de consumo con menos de 16 GB.
- La longitud de la grabación está limitada por la KV cache (131.072 posiciones, aproximadamente 2 horas). El runtime rechaza grabaciones más largas en lugar de fallar a mitad.
- La velocidad de decodificación disminuye a medida que se llena la KV cache, lo que puede afectar a grabaciones muy largas, aunque la VRAM no crezca.
- El modelo soporta 10 idiomas, a diferencia del modelo VibeVoice-ASR no streaming que cubre más de 50.
- La codificación determinista (media latente) puede diferir ligeramente del checkpoint original, aunque se indica que está dentro de la variación semilla a semilla.
- La atribución de hablante se ha validado con dos hablantes en un archivo de 30 minutos, pero no se han proporcionado datos sobre escenarios con más hablantes, ruido o solapamiento.
- No se han publicado benchmarks formales (WER, CER) en la información disponible.
- Es una exportación ONNX creada por un tercero, no el modelo original de Microsoft; el soporte y mantenimiento dependen del autor del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/christopherthompson81/vibevoice-asr-streaming-7b-onnx
- Modelo base en HuggingFace: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Repositorio de Microsoft VibeVoice en GitHub: https://github.com/microsoft/VibeVoice
- Repositorio de Vernacula en GitHub: https://github.com/christopherthompson81/vernacula
- Scripts de conversion: https://github.com/christopherthompson81/vernacula/tree/main/scripts/vibevoice_streaming_export
- Registro de investigacion: https://github.com/christopherthompson81/vernacula/blob/main/docs/dev/vibevoice_asr_streaming_investigation.md
