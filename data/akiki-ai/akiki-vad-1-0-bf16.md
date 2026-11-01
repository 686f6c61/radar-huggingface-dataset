# Akiki-AI/akiki-vad-1.0-bf16

## Resumen

Akiki VAD 1.0 BF16 es la variante en precisión nativa BF16 del detector de actividad de voz (VAD) Akiki VAD 1.0, desarrollado por Akiki-AI. No es un modelo de lenguaje, sino un clasificador de audio binario por trama que decide si un fragmento de audio contiene voz humana. Se distribuye como un checkpoint con pesos en safetensors y está pensado para inferencia en CPU mediante el motor propio del paquete `akiki`, escrito en Rust.

El modelo deriva del checkpoint seed-1730 del modelo base y solo reduce la precisión de las proyecciones de convolución y GRU a BF16; el frontend (RealFFT, ventana Hann periódica y cálculo de magnitud), los sesgos, la cabeza de salida, las no linealidades y el estado recurrente permanecen en FP32. Esta separación permite acelerar el cómputo sin degradar la precisión del análisis espectral.

Su relevancia práctica está en el rendimiento: procesa una trama de 16 ms en 10,73 µs a través de la API pública `VAD.push()` y en 5,45 µs en la llamada nativa, con una latencia de streaming muy baja y una huella de pesos de solo 384.012 bytes. Está orientado a detección de voz en tiempo real, diarización y pipelines de audio embebidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal con frontend RealFFT (FP32) y capas de convolución más GRU; clasificador de tramas de audio |
| Parámetros totales | 190.081 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa tramas de 16 ms; protocolo de referencia de 32 ms) |
| Tipos de cuantización | BF16 (esta variante), FP32, INT8 (pesos con escalas por fila), INT4 (dos coeficientes por byte) según FORMAT.md |
| Idiomas soportados | no disponible (detección de voz, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 384.012 bytes) más `config.json` (843 bytes) |

## Arquitectura y entrenamiento

El modelo es un detector de voz por tramas con un frontend de análisis espectral basado en RealFFT con ventana Hann periódica y cálculo de magnitud, todo en FP32. Sobre esas características espectrales se aplican proyecciones de convolución y una GRU, cuyas proyecciones son las únicas que se ejecutan en BF16 en esta variante; el resto de componentes (sesgos, cabeza de salida, no linealidades y estado recurrente) se mantienen en FP32. La acumulación se realiza en FP32. El modelo mantiene estado recurrente entre tramas, lo que permite streaming continuo.

No se detallan en la información disponible el número de tokens ni la composición del dataset de entrenamiento. La conversión a BF16 no implicó reentrenamiento, recalibración ni cambios en la FFT: se preservan todos los coeficientes, escalas, sesgos y valores de la cabeza evaluados, y las 2.016.170 probabilidades nativas de 16 ms por precisión, sobre 30 grabaciones de TEN y 48 de VoxConverse, son idénticas bit a bit a la release anterior. El modelo base es Akiki-AI/akiki-vad-1.0, del que esta es una variante cuantizada.

## Capacidades

- Detección de actividad de voz (VAD) binaria por trama de 16 ms sobre audio mono float32 a 16 kHz.
- Procesamiento en streaming con estado recurrente, buffering y timestamps gestionados por la API.
- Inferencia en CPU de baja latencia mediante el motor Rust incluido en el paquete `akiki`.
- Soporte de múltiples precisiones (BF16, FP32, INT8, INT4) con frontend RealFFT siempre en FP32.
- Carga directa de safetensors mediante el motor Rust, la API de Python o la ABI de C.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Detección de voz en tiempo real para asistentes de voz: el modelo procesa tramas de 16 ms en 10,73 µs, lo que permite mantener el bucle de captura sin acumular latencia perceptible.
- Segmentación de audio en pipelines de transcripción: se usa como prefiltro para recortar silencios antes de enviar audio a un ASR, reduciendo cómputo y coste en el servicio de transcripción.
- Diarización y análisis de reuniones: combinado con embeddings de hablante, las detecciones por trama con timestamps permiten delimitar turnos de palabra en grabaciones de VoxConverse y similares.
- Puerta de activación (wake-word gating) en dispositivos embebidos: con solo 384.012 bytes de pesos y ejecución en CPU, cabe en entornos con recursos limitados y evita activar etapas posteriores más costosas.
- Moderación y monitorización de llamadas: detección de presencia de voz para métricas de calidad, silencios anómalos o verificación de que un canal de audio contiene habla.
- Telefonía y VoIP: integración en el motor Rust para decidir cuándo transmitir o codificar audio, reduciendo ancho de banda en tramos de silencio.
- Investigación en procesamiento de audio: referencia ligera para comparar precisión y latencia entre motores de inferencia (ONNX Runtime, PyTorch, Candle, tract, Burn, RTen) y entre VADs como Silero v5 o TEN-VAD.

## Benchmarks y rendimiento

| Benchmark | Precisión | AP | F1 a 0,5 | Precisión con recall ≥95% |
|---|---|---:|---:|---:|
| TEN | FP32 | 98,0187% | 92,6053% | 90,6487% |
| TEN | BF16 | 98,0168% | 92,6053% | 90,7680% |
| VoxConverse | FP32 | 99,3045% | 94,9869% | 96,1582% |
| VoxConverse | BF16 | 99,3044% | 94,9892% | 96,1580% |

Latencia medida con `akiki` 0.0.5 en un AMD Ryzen 9 9900X con un núcleo fijado (tres procesos, 2.000 llamadas de calentamiento y 7.500 medidas por caso, mediana de medianas): 10,73 µs por trama de 16 ms vía la API pública `VAD.push()` y 5,45 µs en la llamada nativa con punteros preparados. Los tiempos de Python incluyen validación de entrada, buffering, frontend, estado recurrente, timestamps y salida de tramas; excluyen carga del modelo, decodificación de audio y adquisición.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU y sus pesos ocupan 384.012 bytes.
- GPU: no se documentan requisitos de GPU; el motor Rust está especializado en kernels de CPU.
- GPU de consumo: no disponible; el despliegue objetivo es CPU, por lo que cabe en cualquier procesador moderno.
- Despliegue: paquete Python `akiki` con motor Rust incluido (`pip install akiki`), carga directa de safetensors con `akiki_vad_engine::Weights::load` o mediante la ABI de C. No requiere PyTorch ni ONNX Runtime en uso normal.
- Latencia: 10,73 µs por trama de 16 ms (API pública) y 5,45 µs (llamada nativa) en Ryzen 9 9900X; el rendimiento real depende de la CPU y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión VAD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akiki VAD 1.0 BF16 | 190.081 | trama de 16 ms | AP 98,02% (TEN), 99,30% (VoxConverse) | Apache 2.0 | HuggingFace, paquete `akiki` |
| Silero v5 | no disponible | no disponible | no disponible en esta información | no disponible | no disponible en esta información |
| TEN-VAD | no disponible | no disponible | no disponible en esta información | no disponible | no disponible en esta información |

La model card menciona comparaciones históricas de latencia con Silero v5 y TEN-VAD, pero corresponde a la versión 0.2.0 del modelo Akiki y no incluye sus métricas de precisión ni parámetros. No se dispone de datos suficientes para una comparativa de rendimiento homogénea.

## Limitaciones y advertencias

- Solo acepta audio mono float32 a 16 kHz y valores finitos; otra frecuencia o formato requiere remuestreo previo.
- Es un clasificador de voz por trama: no transcribe, no identifica hablantes ni entiende contenido semántico.
- No se documentan sesgos por idioma, acento o dominio; el rendimiento en condiciones acústicas distintas a TEN y VoxConverse no está evaluado en la información disponible.
- El frontend RealFFT permanece en FP32; cambiar esa precisión no está soportado por el diseño actual.
- La carga directa de safetensors con tipos enteros requiere una build del motor con el loader `akiki_rowwise` v1; wheels antiguas deben seleccionar la precisión desde los pesos FP32 empaquetados.
- El modelo declara `inference: false` en la model card; el uso previsto es mediante el paquete `akiki` o el motor Rust, no mediante pipelines genéricos de HuggingFace.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo base y de las dependencias del motor.

## Enlaces

- HuggingFace: https://huggingface.co/Akiki-AI/akiki-vad-1.0-bf16
- Modelo base: https://huggingface.co/Akiki-AI/akiki-vad-1.0
- Esquema de formato: FORMAT.md (incluido en el repositorio)
- Validación de conversión: format-conversion-validation.json (incluido en el repositorio)
- Datos de benchmark: assets/benchmark-data.json (incluido en el repositorio)
- Gráfica de latencia del paquete: assets/package-latency.svg
- Gráfica comparativa de motores: assets/engine-comparison.svg
