# loscrossos/HeartCodec-oss-encoder

## Resumen

HeartCodec OSS Encoder es un checkpoint de solo codificador para la tokenización de audio de HeartCodec. El repositorio consultado es `loscrossos/HeartCodec-oss-encoder`, aunque la model card utiliza `HeartMuLa/HeartCodec-oss-encoder` en los comandos de descarga. No incluye decodificador ni cuantizador RVQ: debe emparejarse con `HeartMuLa/HeartCodec-oss-20260123`, que aporta el cuantizador compartido y el decodificador de audio.

La pareja encoder + decoder convierte audio en ocho flujos de tokens a 12,5 Hz y reconstruye audio estéreo a 48 kHz. El encoder pesa aproximadamente 2,15 GB en `encoder.safetensors` y contiene 1.006 tensores. La licencia declarada es Apache-2.0. Es relevante para investigación en representaciones discretas de audio y música, pero no es un modelo de texto ni un codec autónomo.

No se han publicado resultados de benchmarks objetivos de calidad de audio en la información disponible. La model card solo documenta una validación de ida y vuelta con métricas de memoria y comprobaciones de integridad de tensores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de tokenización de audio HeartCodec; topología interna no detallada en la model card |
| Parámetros totales | No disponible; `encoder.safetensors` ocupa aproximadamente 2,15 GB y contiene 1.006 tensores |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en la validación se procesaron 239,293 s de audio y se obtuvieron tokens con forma `[8, 2992]` a 12,5 Hz |
| Tipos de cuantización | FP32 en la validación; no se documentan cuantizaciones GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible; el modelo trabaja con audio, no con texto |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`encoder.safetensors`), configuración JSON y `SHA256SUMS` |

## Arquitectura y entrenamiento

La model card no detalla la topología interna del encoder (transformer, CNN, arquitectura híbrida u otra). Lo que sí se especifica es su función: extraer representaciones discretas de audio que, junto con el cuantizador RVQ y el decodificador del checkpoint emparejado, producen ocho flujos de tokens a 12,5 Hz. Para un audio de 239,293 s, la validación generó tokens con forma `[8, 2992]`, lo que equivale a 100 tokens por segundo considerando los ocho flujos.

El checkpoint separa explícitamente los pesos del encoder de los del decoder y del cuantizador. El cargador de checkpoints divididos comprueba estrictamente los pesos, y no se admite cargar dos cuantizadores entrenados de forma independiente. No se documentan datos de entrenamiento, número de tokens, composición del dataset, procesos de RLHF/DPO ni innovaciones de atención o decodificación.

## Capacidades

- Tokenización de audio musical en ocho flujos discretos a 12,5 Hz.
- Reconstrucción de audio a 48 kHz estéreo cuando se combina con el checkpoint decodificador emparejado.
- Acepta formas de onda `float32` con formas `[samples]`, `[1, samples]` o `[2, samples]` y una frecuencia de muestreo positiva indicada por el usuario.
- API Python con métodos `tokenize()` y `detokenize()`, con parámetros como `batch_size`, `num_steps` y `guidance_scale`.
- Salida directa a MP3 a 320 kbps desde `float32`, sin WAV PCM intermedio, o salida WAV si se selecciona una ruta `.wav`.
- La salida se recorta a la duración del audio de entrada.
- No soporta generación de texto, tool calling, function calling, agentes, visión ni razonamiento multi-paso.
- No es un modelo multilingüe en el sentido textual; no se documentan capacidades específicas por idioma.

## Casos de uso

- Investigación en modelos generativos de música: el encoder permite convertir un corpus de audio en secuencias discretas de ocho flujos a 12,5 Hz, adecuadas para entrenar modelos autorregresivos o modelos discretos sobre tokens musicales.
- Evaluación de codecs neuronales: la pareja encoder + decoder permite realizar pruebas de ida y vuelta audio → tokens → audio a 48 kHz estéreo y comparar la reconstrucción con la señal original.
- Preprocesado para recuperación de información musical: los tokens discretos pueden utilizarse como representación de entrada para tareas de clasificación, segmentación estructural o análisis de similitud, evitando trabajar directamente con formas de onda continuas.
- Reproducibilidad de experimentos: el repositorio incluye `SHA256SUMS` y la model card indica que los bytes de los tensores del encoder coinciden con el checkpoint fuente, lo que facilita verificar la integridad de los pesos.
- Prototipado de herramientas de producción musical: permite convertir fragmentos autorizados a tokens y reconstruirlos con el decoder emparejado para probar flujos de trabajo de edición, comparación o demostración.
- Docencia y divulgación técnica: la API de `heartlib` permite mostrar de forma práctica cómo funciona una tokenización RVQ de audio y cómo se reconstruye una señal a partir de tokens discretos.
- Integración en pipelines de datos de audio: el soporte de `batch_size` y el procesamiento de audios de varios minutos permiten construir lotes de tokens para experimentos de aprendizaje automático, siempre que se gestione la memoria de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas objetivas de calidad de audio, ya que el modelo no es un modelo de lenguaje y la model card no incluye evaluaciones perceptuales.

La única validación documentada es una prueba de ida y vuelta, no un benchmark de calidad:

| Prueba | Configuración | Resultado |
|---|---|---|
| Ida y vuelta de audio | NVIDIA B300, FP32, batch 1, semilla 42, 10 pasos de decoder, `guidance_scale=1.25`, audio estéreo de 239,293 s | Tokens `[8, 2992]`; salida finita, no silenciosa, 48 kHz estéreo y duración coincidente con la entrada |
| Memoria de GPU | Misma prueba | Pico asignado de PyTorch ≈ 12,65 GiB; pico reservado ≈ 15,41 GiB |
| Integridad de pesos | Comparación con el checkpoint fuente | 1.006 tensores del encoder idénticos; 818 tensores del decoder coinciden numéricamente; 8 flags de inicialización RVQ difieren solo en forma almacenada |

## Requisitos de hardware

- VRAM estimada para inferencia: no hay un mínimo publicado. En la validación con encoder + decoder en FP32, batch 1 y 239,293 s de audio, el pico asignado fue de aproximadamente 12,65 GiB y el reservado de aproximadamente 15,41 GiB.
- GPU validadas: NVIDIA B300. No se documentan pruebas con A100, H100, L40S ni otras GPU de centro de datos.
- GPU de consumo: una RTX 4090 de 24 GB podría acomodar el pico reservado de la validación, pero no está validada oficialmente. Tarjetas de 16 GB quedan por debajo del pico reservado documentado y requerirían pruebas adicionales o configuraciones más ligeras.
- El consumo de memoria depende de la duración del audio, del tamaño de lote y de la configuración del decoder; las cifras anteriores no deben interpretarse como requisitos mínimos.
- Opciones de despliegue: `heartlib` con PyTorch y CUDA, Python 3.10 y `ffmpeg` para salida MP3. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles. La validación no reporta tiempos de ejecución, solo memoria y características de la salida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto o ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeartCodec-oss-encoder | Encoder de tokenización de audio | No disponible; 2,15 GB y 1.006 tensores | No disponible; 12,5 Hz y ocho flujos | Apache-2.0 | Hugging Face |
| HeartCodec-oss-20260123 | Decoder y cuantizador RVQ del sistema HeartCodec | No disponible | No disponible | No disponible en la información proporcionada | Hugging Face |
| EnCodec | Codec neuronal de audio, referencia externa | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No verificado |
| DAC | Codec neuronal de audio, referencia externa | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No verificado |

La comparación cuantitativa con EnCodec o DAC no es posible con los datos disponibles. La diferencia principal documentada es que HeartCodec separa el encoder del decoder y del cuantizador RVQ, mientras que el encoder por sí solo no puede reconstruir audio.

## Limitaciones y advertencias

- El repositorio es solo de encoder: no incluye decoder ni cuantizador RVQ. Sin el checkpoint `HeartCodec-oss-20260123` no se puede reconstruir audio.
- No debe cargarse con `HeartCodec.from_pretrained()`; la API prevista es `HeartCodec.from_encoder_decoder_pretrained()` con ambos checkpoints.
- No se admite cargar dos cuantizadores entrenados de forma independiente; el cuantizador compartido pertenece al checkpoint decodificador.
- No hay benchmarks de calidad de audio, evaluaciones perceptuales ni comparaciones objetivas con otros codecs en la información disponible.
- No se documentan datos de entrenamiento, composición del corpus, sesgos musicales o de género, ni procesos de alineación.
- El riesgo de alucinación no aplica de forma directa a un encoder de audio, pero sí pueden aparecer artefactos de reconstrucción, pérdida de detalle o diferencias tímbricas.
- El consumo de memoria crece con la duración del audio; la validación de 239 s requirió aproximadamente 15,41 GiB reservados en FP32, por lo que audios largos pueden no caber en GPU de consumo.
- No se documenta soporte para tiempo real, latencia baja ni despliegue en producción de alta concurrencia.
- La licencia Apache-2.0 se aplica al checkpoint del encoder según la model card; el uso del decoder emparejado debe verificarse en su propio repositorio.
- Es responsabilidad del usuario disponer de derechos sobre el audio de entrada; la model card indica explícitamente usar audio autorizado.

## Enlaces

- https://huggingface.co/loscrossos/HeartCodec-oss-encoder
- https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- https://github.com/HeartMuLa/heartlib
- https://github.com/HeartMuLa/heartlib/blob/main/examples/run_music_reconstruction.py
