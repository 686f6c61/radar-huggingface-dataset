# christopherthompson81/vibevoice-asr-streaming-1.5b-onnx

## Resumen

VibeVoice-ASR-Streaming 1.5B ONNX es una exportación del modelo de Microsoft del mismo nombre, realizada por christopherthompson81 para servir como backend de reconocimiento de voz en el proyecto Vernacula. Se trata de un modelo de ASR en streaming que transcribe quién dijo qué a medida que llega el audio, sin necesidad de un diarizador separado: emite un fragmento de texto cada 2,93 segundos y marca los turnos de hablante en línea. La arquitectura combina un decoder Qwen2.5-1.5B con un par de tokenizadores de audio causales (acústico y semántico).

El modelo está optimizado para ONNX Runtime con ejecución CUDA. El audio encoder se exporta en float16 con una ventana fija de 83.200 muestras (3,47 segundos) que produce 26 frames de salida, mientras que el decoder usa pesos INT8 y atención GroupQueryAttention sobre una KV cache compartida y preasignada. La exportación sustituye el muestreo gaussiano de los latentes acústicos por la media latente, lo que hace la codificación determinista y reproducible. El contexto entrenado es de 65.536 posiciones, aproximadamente 68 minutos de audio.

Su relevancia radica en que ofrece ASR en tiempo real con atribución de hablante en un paquete de 3,4 GB, con un uso de VRAM plano en grabaciones largas y un factor de tiempo real de 0,060 en una RTX 3090. La licencia MIT permite uso comercial, y el modelo soporta diez idiomas.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder Qwen2.5-1.5B sobre tokenizadores de audio causales (encoder acústico y semántico) |
| Parámetros totales | no disponible (el decoder es de 1.5B; los encoders de audio no están especificados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 65.536 posiciones (aproximadamente 68 minutos de audio) |
| Tipos de cuantización | Decoder INT8 (solo pesos), audio encoder float16 |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx con pesos externos .data, tokenizer.json, config.json) |

## Arquitectura y entrenamiento

La arquitectura es híbrida: un encoder de audio compuesto por tokenizadores acústico y semántico que convierten la señal en frames, y un decoder Qwen2.5-1.5B que genera el texto con atribución de hablante. En esta exportación ONNX, ambos componentes se separan en dos grafos: `audio_encoder.onnx` y `decoder_gqa.onnx`. El decoder utiliza GroupQueryAttention de ONNX Runtime, una implementación optimizada de atención con consultas agrupadas, y una KV cache compartida preasignada que evita que la VRAM crezca con la duración de la grabación.

No se dispone de información sobre los datos de entrenamiento del checkpoint original ni sobre procesos de RLHF o DPO; la exportación no reentrena el modelo, solo lo convierte. Las innovaciones técnicas de esta versión son tres: codificación de audio determinista (usa la media latente en lugar de muestreo gaussiano), cuantización INT8 de los pesos del decoder sin pérdida medible de precisión, y la preasignación de una KV cache compartida que mantiene el throughput estable en grabaciones largas.

## Capacidades

- Transcripción de voz en streaming con atribución de hablante: identifica quién habla y transcribe el audio a medida que llega.
- Emisión de fragmentos de texto cada 2,93 segundos, con marcado de turnos de hablante en línea.
- No requiere un diarizador separado; la atribución de hablante está integrada en el modelo.
- Soporte multilingüe para diez idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.
- Codificación de audio determinista gracias al uso de la media latente, lo que hace la salida reproducible entre ejecuciones.
- Optimización de pesos INT8 en el decoder, que reduce el tamaño de los pesos a la mitad sin pérdida medible de precisión en transcripción.
- No es un modelo de lenguaje general: no soporta tool calling, generación de texto libre ni razonamiento multi-paso como un LLM.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo procesa el audio en streaming y asigna turnos a cada hablante, lo que permite generar actas automáticas sin un diarizador adicional.
- Subtitulado en vivo para vídeo en streaming: con un factor de tiempo real de 0,060 en una RTX 3090, procesa el audio mucho más rápido que en tiempo real, lo que permite subtítulos en directo con baja latencia.
- Análisis de llamadas de soporte: distingue entre agente y cliente automáticamente, facilitando el análisis de conversaciones y la extracción de métricas de servicio.
- Transcripción de entrevistas y podcasts: al ser multilingüe y en streaming, puede transcribir entrevistas a medida que se graban, con identificación de los participantes.
- Accesibilidad para personas con discapacidad auditiva: genera subtítulos en tiempo real con quién está hablando, mejorando la comprensión en vídeos y reuniones.
- Integración en sistemas de grabación de audio continuos: la KV cache preasignada mantiene la VRAM plana en grabaciones largas, permitiendo el procesamiento continuo sin degradación del rendimiento.
- Backend ASR para aplicaciones de conversación: diseñado para usarse como backend en Vernacula, permite construir asistentes que entienden quién habla en conversaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta un factor de tiempo real de 0,060 en una RTX 3090, pero no se trata de un benchmark estándar.

## Requisitos de hardware

- VRAM pico estimada: aproximadamente 7,4 GB, según la model card.
- GPU recomendada: RTX 3090, utilizada en las pruebas. Requiere ONNX Runtime con CUDA execution provider; no se especifican otras GPUs, pero cualquier NVIDIA con soporte CUDA y suficiente VRAM es candidata.
- ¿Cabe en GPU de consumo? Sí, 7,4 GB es asumible por una RTX 3090, RTX 4080 o una RTX 3060 de 12 GB, siempre que el driver y ONNX Runtime soporten GroupQueryAttention.
- Opciones de despliegue: ONNX Runtime con CUDA execution provider. No es compatible con vLLM, llama.cpp, Ollama o TGI, al ser un modelo ONNX con operadores específicos.
- Latencia y throughput: factor de tiempo real (RTF) de ~0,060 en RTX 3090, es decir, procesa 1 segundo de audio en aproximadamente 60 ms. El throughput es ~16,7 veces más rápido que tiempo real. La latencia aumenta con la duración de la grabación debido al coste de atención sobre el KV cache lleno, pero el uso de VRAM no crece.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| microsoft/VibeVoice-ASR-Streaming-1.5B | 1.5B decoder | 65.536 posiciones | MIT | Checkpoint original con muestreo gaussiano en los latentes acústicos |
| christopherthompson81/vibevoice-asr-streaming-1.5b-onnx | 1.5B decoder | 65.536 posiciones | MIT | Export ONNX con media latente determinista, decoder INT8 y KV cache compartida |

## Limitaciones y advertencias

- La atribución de hablante es menos fiable a este tamaño: en el clip de prueba etiquetó todos los turnos como Speaker 0.
- Requiere ONNX Runtime con CUDA execution provider; no funciona en CPU, ya que GroupQueryAttention y los grafos float16 no están soportados en el provider de CPU.
- El límite de la KV cache (65.536 posiciones, ~68 minutos de audio) hace que el runtime rechace grabaciones más largas en lugar de fallar a medias.
- La latencia de decodificación aumenta con la duración de la grabación porque el coste de atención crece con el KV cache lleno, aunque la VRAM se mantiene plana.
- No es un modelo de lenguaje general: no soporta tool calling, generación de texto libre ni razonamiento multi-paso.
- La exportación usa la media latente en lugar del muestreo gaussiano, lo que la hace determinista pero puede diferir ligeramente del checkpoint original en términos de variabilidad.
- No se han publicado benchmarks formales; el rendimiento reportado es el del autor en una RTX 3090.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base de Microsoft, que también es MIT.

## Enlaces

- https://huggingface.co/christopherthompson81/vibevoice-asr-streaming-1.5b-onnx
- https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- https://github.com/christopherthompson81/vernacula
- https://microsoft.github.io/VibeVoice/
- https://huggingface.co/christopherthompson81/vibevoice-asr-onnx
