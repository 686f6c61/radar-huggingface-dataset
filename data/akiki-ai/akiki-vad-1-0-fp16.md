# Akiki-AI/akiki-vad-1.0-fp16

## Resumen

Akiki VAD 1.0 FP16 es la variante en precisión nativa (FP16) del detector de actividad de voz (VAD) Akiki VAD 1.0, desarrollado por Akiki-AI. Se trata de un modelo de clasificación de audio orientado a la detección de voz en flujos de audio de 16 kHz, diseñado específicamente para inferencia en CPU con baja latencia y pensado para entornos de streaming. No es un modelo de lenguaje ni un transformer generativo: es un clasificador acústico compacto con frontend espectral (RealFFT con ventana Hann periódica) y componentes recurrentes (GRU) que operan sobre tramas de 16 ms.

La relevancia de esta release radica en su empaquetado: el modelo se distribuye en `safetensors` autocontenido (384.004 bytes de pesos y 842 bytes de configuración) y se integra con el motor de inferencia Akiki escrito en Rust, distribuido a través del paquete Python `akiki`. La variante FP16 mantiene las activaciones, la acumulación, el frontend FFT, los sesgos, la cabeza de salida y el estado recurrente en FP32, aplicando precisión reducida únicamente a las proyecciones de convolución y GRU, lo que preserva la fidelidad numérica del modelo base.

El modelo declara licencia Apache 2.0, no dispone de metadatos de idiomas y cuenta con un volumen de descargas muy bajo (15 descargas, 0 likes en el momento de la consulta). Su interés técnico está en la optimización de latencia en CPU (12,80 µs por trama de 16 ms a través de la API pública `VAD.push()`), más que en capacidades cognitivas o generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador acústico con frontend RealFFT (ventana Hann periódica), convoluciones y capas GRU recurrentes |
| Parametros totales | 190.081 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa tramas de 16 ms en streaming; protocolo de referencia de 32 ms) |
| Tipos de cuantizacion | FP16 (pesos de proyección), FP32 (activaciones, acumulación, FFT, sesgos, cabeza de salida, estado recurrente); el formato soporta INT8 e INT4 según FORMAT.md |
| Idiomas soportados | no disponible (detección de voz independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

La arquitectura combina un frontend de análisis espectral en FP32 (RealFFT con ventana Hann periódica y cálculo de magnitud) con un cuerpo neuronal compuesto por convoluciones y capas GRU recurrentes. El modelo consume audio mono float32 a 16 kHz y emite probabilidades de voz por trama de 16 ms. La variante FP16 aplica precisión reducida exclusivamente a las proyecciones de convolución y GRU; el resto del pipeline numérico permanece en FP32, incluyendo el estado recurrente y la cabeza de salida. Según la model card, la conversión preserva cada coeficiente, escala, sesgo FP32 y valor de cabeza evaluado: las 2.016.170 probabilidades nativas por precisión (30 grabaciones TEN y 48 VoxConverse) son bit-idénticas a la release evaluada anterior.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre el uso de RLHF/DPO (no aplicable a un VAD). El checkpoint seleccionado corresponde a la semilla 1730 del modelo base `Akiki-AI/akiki-vad-1.0`. La innovación técnica destacable es el motor de inferencia Akiki en Rust, con kernels de CPU especializados para este VAD, que evita depender de PyTorch u ONNX Runtime en producción y reconstruye en memoria el padding SIMD nativo a partir de los tensores nombrados de safetensors.

## Capacidades

- Detección de actividad de voz (VAD) sobre audio mono float32 a 16 kHz, con salida de probabilidad por trama de 16 ms.
- Procesamiento en streaming con gestión de estado recurrente, buffering y timestamps a través de la API `VAD.push()`.
- Inferencia en CPU de baja latencia mediante el motor Rust incluido en el paquete `akiki`.
- Soporte de múltiples precisiones seleccionables desde la API pública (`model_precision="fp16"`, `fft_precision="fp32"`).
- Carga directa de safetensors mediante el motor Rust (`akiki_vad_engine::Weights::load`) y a través de la ABI de C.
- Soporte de formatos cuantizados INT8 (pesos con signo y escalas por fila FP32) e INT4 (dos coeficientes por byte con escalas), según FORMAT.md.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües en el sentido de generación de texto.

## Casos de uso

- **Detección de voz en asistentes de voz en tiempo real**: el modelo procesa tramas de 16 ms con una latencia de 12,80 µs por trama vía API Python, lo que permite integrarlo en pipelines de captura de micrófono con presupuesto de CPU mínimo y sin GPU.
- **Segmentación y diarización previa en transcripción automática**: al emitir probabilidades por trama con timestamps, se puede usar como etapa de filtrado antes de un ASR, descartando silencio y reduciendo el coste computacional del reconocedor.
- **Sistemas de telefonía y VoIP**: la licencia Apache 2.0 y la ausencia de dependencias de PyTorch/ONNX permiten desplegar el motor Rust en servidores de telefonía para suprimir silencio y detectar turnos de habla en llamadas.
- **Grabación activada por voz (voice-triggered recording)**: el VAD puede gobernar la apertura y cierre de buffers de grabación en dispositivos embebidos o aplicaciones de escritorio, evitando almacenar silencio y reduciendo el consumo de disco.
- **Filtrado de datasets de audio**: en la preparación de corpus para entrenamiento de modelos de voz, el modelo sirve para descartar segmentos sin habla con precisión alta (AP 99,3045% en VoxConverse), reduciendo el ruido del dataset.
- **Detección de turnos en sistemas de conversación por voz**: combinado con un motor de diálogo, el VAD permite detectar el final del turno del usuario con timestamps por trama, habilitando respuestas con menor latencia percibida.
- **Procesamiento por lotes en CPU sin GPU**: al no requerir acelerador, se puede ejecutar en flotas de CPU para preprocesar grandes volúmenes de audio (por ejemplo, archivos de centros de contacto) con el motor Rust y la API de streaming.

## Benchmarks y rendimiento

| Benchmark | Precisión | AP | F1 a 0,5 | Precision con recall ≥95% |
|---|---|---:|---:|---:|
| TEN | FP32 | 98,0187% | 92,6053% | 90,6487% |
| TEN | FP16 | 98,0187% | 92,6141% | 90,6487% |
| VoxConverse | FP32 | 99,3045% | 94,9869% | 96,1582% |
| VoxConverse | FP16 | 99,3045% | 94,9872% | 96,1582% |

Latencia registrada por el autor con `akiki` 0.0.5 en un AMD Ryzen 9 9900X con un núcleo fijado: 12,80 µs por trama de 16 ms a través de la API pública `VAD.push()` en FP16, y 7,40 µs en la llamada nativa con punteros preparados. La medición usa tres procesos frescos por caso, 2.000 llamadas de calentamiento y 7.500 llamadas cronometradas; los valores son medianas de medianas por proceso. La comparación histórica con ONNX Runtime, PyTorch eager, Candle, tract, Burn Flex, RTen, TEN-VAD y Silero v5 corresponde al modelo Akiki 0.2.0 (FP32), no a la versión 1.0, y no debe interpretarse como medición de speedup de esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU.
- GPU recomendadas: no aplica; no se documenta soporte de GPU.
- Cabe en cualquier CPU moderna: el paquete de pesos ocupa 384.004 bytes y la configuración 842 bytes, por lo que el modelo es trivial en memoria.
- Opciones de despliegue: paquete Python `akiki` (`pip install akiki`), motor Rust `akiki_vad_engine`, ABI de C, y carga directa de `model.safetensors` con `config.json`. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAD).
- Latencia y throughput: 12,80 µs por trama de 16 ms vía API Python y 7,40 µs en llamada nativa, medidos en AMD Ryzen 9 9900X con un núcleo fijado. El throughput real depende de la CPU y de la carga; la carga del modelo, la decodificación de audio y la adquisición quedan excluidas de la medición.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / trama | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akiki VAD 1.0 FP16 | VAD con frontend FFT + GRU | 190.081 | trama de 16 ms, protocolo de 32 ms | Apache 2.0 | HuggingFace + paquete `akiki` |
| Silero VAD v5 | VAD neuronal | no disponible | no disponible | no disponible en la información proporcionada | citado en la comparación histórica del autor |
| TEN-VAD | VAD neuronal | no disponible | no disponible | no disponible en la información proporcionada | citado en la comparación histórica del autor |

La comparación de rendimiento entre Akiki, TEN-VAD y Silero que aparece en la model card corresponde al modelo Akiki 0.2.0 en FP32 y a campañas de medición con fixtures y protocolos distintos; no constituye una comparación válida de precisión ni de velocidad para la versión 1.0 FP16. No se dispone de datos de benchmarks de Silero v5 ni de TEN-VAD en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo solo acepta audio mono float32 a 16 kHz; entradas con otra frecuencia de muestreo, canales múltiples o valores no finitos no son válidas.
- No es un modelo generativo ni un modelo de lenguaje: no soporta tool calling, agentes, razonamiento, visión ni generación de texto.
- No se dispone de información sobre sesgos acústicos (idioma, acento, género, ruido de fondo) ni sobre el dominio de entrenamiento, por lo que el rendimiento fuera de TEN y VoxConverse no está caracterizado.
- Riesgo de falsos positivos y negativos en entornos con ruido, música o habla superpuesta; la model card no documenta evaluaciones en estas condiciones.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica con `inference: false` en la model card, lo que implica que la inferencia debe realizarse con el motor Akiki y no con la pipeline estándar de HuggingFace.
- La carga directa de safetensors requiere una build del motor Akiki con el loader `akiki_rowwise` v1; las wheels antiguas solo pueden seleccionar esta precisión desde los pesos FP32 empaquetados.
- El volumen de descargas y la ausencia de likes indican una adopción muy baja; no hay evidencia de uso en producción a gran escala.
- La comparación de latencia publicada se realizó en un único modelo de CPU (AMD Ryzen 9 9900X) con un núcleo fijado; los valores no son extrapolables a otras plataformas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akiki-AI/akiki-vad-1.0-fp16
- Modelo base: https://huggingface.co/Akiki-AI/akiki-vad-1.0
- Documentación del formato: FORMAT.md (referenciado en la model card, dentro del repositorio)
- Datos de benchmark: assets/benchmark-data.json (referenciado en la model card)
- Gráfica de latencia del paquete: assets/package-latency.svg
- Gráfica comparativa de motores: assets/engine-comparison.svg
- Validación de conversión de formato: format-conversion-validation.json (referenciado en la model card)
- Paquete Python: `pip install akiki` (no se proporciona URL de PyPI en la información disponible)
