# Akiki-AI/akiki-vad-1.0-int8-fp32-input

## Resumen

Akiki VAD 1.0 INT8-FP32-INPUT es una variante de precisión nativa del detector de actividad de voz (VAD) Akiki VAD 1.0, desarrollado por Akiki-AI. El modelo resuelve la clasificación binaria de voz frente a no-voz en flujo de audio continuo, con un enfoque explícito en inferencia de baja latencia sobre CPU mediante un motor propio escrito en Rust. Se distribuye como pesos safetensors autocontenidos y se integra a través del paquete Python `akiki`, que incluye el motor de inferencia y los pesos en plataformas soportadas.

La arquitectura combina un frontend espectral (RealFFT con ventana Hann periódica y cálculo de magnitud) con capas convolucionales y recurrentes GRU. La variante INT8-FP32-INPUT cuantiza a INT8 las proyecciones convolucionales y de las GRU, mantiene la primera proyección de entrada y la cabeza de salida en FP32, y deja el frontend FFT íntegramente en FP32. El resultado son 190.849 parámetros totales, un modelo extremadamente compacto (200.300 bytes de pesos) pensado para streaming en tiempo real.

Su relevancia actual radica en la latencia reportada: 10,73 µs por trama de 16 ms a través de la API pública `VAD.push()` en un núcleo de AMD Ryzen 9 9900X, con conversión de formato validada bit a bit frente a la versión FP32. Esto lo posiciona como alternativa a Silero VAD y TEN-VAD en pipelines de transcripción, asistentes de voz y agentes conversacionales donde el coste por trama importa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Frontend espectral RealFFT (Hann periódica, magnitud FP32) + capas convolucionales + GRU recurrente; clasificador binario voz/no-voz |
| Parámetros totales | 190.849 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por tramas de 16 ms en streaming, con estado recurrente) |
| Tipos de cuantización | INT8 con escalas FP32 por fila (`akiki_rowwise`); primera proyección de entrada y cabeza de salida en FP32; sesgos, no linealidades y estado recurrente en FP32; FP16/BF16 e INT4 documentados en el formato del motor |
| Idiomas soportados | no disponible (detección acústica de voz, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 200.300 bytes) + `config.json` (1.037 bytes) |
| Frecuencia de muestreo | 16 kHz, mono, float32 finito |
| Trama de audio | 16 ms por paso de inferencia |
| Librería | `akiki` (motor Rust, binding Python y ABI C) |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

El modelo es un detector de actividad de voz de tipo red neuronal pequeña con frontend de análisis espectral. La señal de audio se procesa mediante RealFFT con ventana Hann periódica y cálculo de magnitud, todo ello en FP32 independientemente de la precisión de los pesos. Sobre las características espectrales se aplican capas convolucionales y proyecciones GRU con estado recurrente, que permiten mantener contexto entre tramas consecutivas de 16 ms en un flujo de streaming. La salida es una probabilidad por trama de 16 ms.

La variante INT8-FP32-INPUT se generó a partir del mismo checkpoint semilla (seed-1730) que el modelo base, aplicando cuantización rowwise a las proyecciones convolucionales y de las GRU. La primera proyección de entrada se mantiene en FP32 y se cuantiza dinámicamente a INT8 en las proyecciones posteriores. Los sesgos, la cabeza de salida, las no linealidades y el estado recurrente permanecen en FP32. Según la model card, no se realizó entrenamiento, recuantización, calibración ni cambio en la FFT durante la conversión; la validación reporta que las 2.016.170 probabilidades nativas por precisión (30 grabaciones TEN y 48 VoxConverse) son bit-idénticas a la release evaluada anteriormente. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Detección de actividad de voz binaria (voz / no-voz) sobre audio mono float32 a 16 kHz.
- Procesamiento en streaming con estado recurrente, buffering y timestamps gestionados por la API.
- Inferencia de baja latencia en CPU con kernels SIMD especializados en el motor Rust.
- Selección de precisión numérica en tiempo de ejecución (`int8-fp32-input`, entre otras) desde los pesos FP32 empaquetados.
- Carga directa de safetensors mediante el motor Rust, la ABI C o el paquete Python.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni capacidades multilingües de texto: es exclusivamente un clasificador acústico.

## Casos de uso

- Transcripción con segmentación de hablante: el VAD marca los límites de voz en el flujo de audio antes de enviar segmentos a un modelo ASR, reduciendo el coste de transcripción al no procesar silencios. La latencia de 10,73 µs por trama permite hacerlo en tiempo real en CPU.
- Asistentes de voz con activación por habla: el modelo decide cuándo hay voz para activar la captura y el reconocimiento, con estado recurrente que evita cortes en pausas breves y timestamps para alinear eventos.
- Atención al cliente automatizada: integrado en un pipeline de telefonía o VoIP, filtra el audio entrante antes del ASR y del LLM, gestionando conversaciones multi-turno con detección fiable de inicio y fin de turno.
- Telemetría y analítica de llamadas: cómputo de métricas de habla, silencio y solapamiento sobre grandes volúmenes de grabaciones, aprovechando el bajo coste por trama y el despliegue en CPU sin GPU.
- Sistemas embebidos y edge: los 200.300 bytes de pesos y el motor Rust sin dependencia de PyTorch ni ONNX permiten desplegarlo en dispositivos con recursos limitados y en arquitecturas x86 con SIMD.
- Preprocesado en pipelines de datos de audio: filtrado masivo de corpus para eliminar segmentos sin voz antes de entrenar o evaluar modelos de reconocimiento de voz.
- Moderación y diarización: como primer estadio para detectar regiones con voz antes de aplicar modelos de diarización o de análisis de contenido.

## Benchmarks y rendimiento

Resultados de evaluación del autor sobre TEN y VoxConverse:

| Benchmark | Precisión | AP | F1 a 0,5 | Precisión con recall ≥ 95% |
|---|---|---:|---:|---:|
| TEN | FP32 | 98,0187% | 92,6053% | 90,6487% |
| TEN | INT8-FP32-INPUT | 98,0087% | 92,5750% | 90,6487% |
| VoxConverse | FP32 | 99,3045% | 94,9869% | 96,1582% |
| VoxConverse | INT8-FP32-INPUT | 99,30 (valor truncado en la información disponible) | no disponible | no disponible |

Latencia medida con `akiki` 0.0.5 en AMD Ryzen 9 9900X, un núcleo fijado, tres procesos frescos por caso, 2.000 llamadas de calentamiento y 7.500 llamadas cronometradas:

| Ruta de inferencia | Latencia por trama de 16 ms |
|---|---:|
| API pública Python `VAD.push()` | 10,73 µs |
| Llamada nativa con punteros preparados | 5,52 µs |

La comparación histórica con ONNX Runtime, PyTorch eager, Candle, tract, Burn Flex y RTen, junto con TEN-VAD y Silero v5, corresponde al modelo Akiki 0.2.0 (FP32, antes de la migración a RealFFT) y no mide la versión 1.0; el autor advierte explícitamente que no debe interpretarse como speedup de la versión actual.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. Los pesos ocupan 200.300 bytes.
- GPU: no requerida. La model card no documenta soporte GPU para esta variante.
- CPU: cualquier x86 con soporte SIMD; la latencia reportada se midió en un AMD Ryzen 9 9900X con un solo núcleo.
- Despliegue: paquete Python `akiki` (`pip install akiki`), motor Rust con carga de safetensors, ABI C. No requiere PyTorch ni ONNX Runtime en el uso normal.
- Requisito de carga directa de safetensors enteros: build del motor con el loader `akiki_rowwise` v1; las wheels antiguas pueden seleccionar esta precisión desde los pesos FP32 empaquetados.
- Throughput y latencia: 10,73 µs por trama de 16 ms vía API Python y 5,52 µs vía llamada nativa, con las condiciones de medición indicadas arriba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / trama | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Akiki VAD 1.0 INT8-FP32-INPUT | 190.849 | 16 ms por paso, estado recurrente | Apache 2.0 | Hugging Face + paquete `akiki` | Motor Rust propio, latencia de µs en CPU |
| Silero VAD v5 | no disponible en la información | no disponible | no disponible en la información | Ampliamente distribuido | Incluido en la comparación histórica del autor (modelo Akiki 0.2.0) |
| TEN-VAD | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Incluido en la comparación histórica del autor (modelo Akiki 0.2.0) |

No se dispone de datos de parámetros, contexto ni licencia de Silero VAD v5 ni de TEN-VAD en la información proporcionada; la comparación cuantitativa de precisión y latencia entre ellos y la versión 1.0 de Akiki no está publicada en esta ficha.

## Limitaciones y advertencias

- Solo acepta audio mono float32 finito a 16 kHz; otras frecuencias o formatos requieren remuestreo y conversión previos.
- Es un clasificador binario de voz; no transcribe, no identifica hablantes y no distingue idiomas.
- La model card no documenta sesgos por acento, idioma, género, edad ni condiciones acústicas adversas; el rendimiento fuera de TEN y VoxConverse no está evaluado en la información disponible.
- Riesgo de falsos positivos y negativos en entornos con ruido, música o habla solapada; los umbrales de decisión deben calibrarse por caso de uso.
- La comparación de latencia con otros motores corresponde a la versión 0.2.0 y no es extrapolable a la 1.0.
- La carga directa de safetensors enteros requiere un build del motor con el loader `akiki_rowwise` v1; wheels antiguas deben usar la ruta de selección de precisión desde FP32.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de las dependencias del motor y del paquete `akiki` en la versión desplegada.
- El modelo tiene 14 descargas y 0 likes en el momento de la ficha; la validación independiente por terceros es inexistente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akiki-AI/akiki-vad-1.0-int8-fp32-input
- Modelo base: https://huggingface.co/Akiki-AI/akiki-vad-1.0
- Documentación del formato: FORMAT.md (incluido en el repositorio del modelo)
- Datos de benchmark: assets/benchmark-data.json (incluido en el repositorio del modelo)
- Validación de conversión: format-conversion-validation.json (incluido en el repositorio del modelo)
- Gráficas de latencia: assets/package-latency.svg y assets/engine-comparison.svg (incluidas en el repositorio del modelo)
