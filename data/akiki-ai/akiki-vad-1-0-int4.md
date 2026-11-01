# Akiki-AI/akiki-vad-1.0-int4

## Resumen

Akiki VAD 1.0 INT4 es la variante cuantizada a 4 bits del detector de actividad de voz (VAD) Akiki VAD 1.0, desarrollado por Akiki-AI. El modelo resuelve el problema clásico de segmentación de voz en flujo de audio: determinar, fotograma a fotograma, si hay habla o silencio en una señal mono float32 muestreada a 16 kHz. Su relevancia radica en que combina una precisión casi idéntica a la versión FP32 con una latencia muy baja en CPU, lo que lo hace apto para despliegues en tiempo real sin GPU.

La arquitectura combina un frontend espectral en FP32 (RealFFT con ventana Hann periódica y cálculo de magnitud) con proyecciones convolucionales y recurrentes GRU cuantizadas. El checkpoint INT4 se genera a partir del mismo seed (1730) que el modelo base y conserva en FP32 las biases, la cabeza de salida, las no linealidades y el estado recurrente. El resultado son apenas 190.981 parámetros totales y un fichero de pesos de 106.572 bytes.

El modelo se distribuye con licencia Apache 2.0 y está pensado para integrarse mediante el paquete Python `akiki` o el motor Rust del mismo nombre. Su orientación es claramente de producción en CPU: procesa un fotograma de 16 ms en 11,74 µs a través de la API pública `VAD.push()`, con 6,61 µs en la llamada nativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Frontend espectral RealFFT (FP32) + convoluciones y GRU cuantizadas |
| Parámetros totales | 190.981 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por fotogramas de 16 ms, protocolo de referencia de 32 ms) |
| Tipos de cuantización | INT4 empaquetado con signo en proyecciones; activaciones INT8 dinámicas; biases, cabeza, no linealidades y estado recurrente en FP32; FFT en FP32 |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 106.572 bytes) + `config.json` (1.034 bytes) |

## Arquitectura y entrenamiento

El modelo es un VAD híbrido que separa el procesamiento de señal del cómputo neuronal. El frontend aplica RealFFT con ventana Hann periódica y cálculo de magnitud en FP32, y esa parte permanece sin cambios en todas las precisiones. El cuerpo del modelo usa convoluciones y proyecciones GRU cuantizadas; en la variante INT4 los pesos de proyección se empaquetan con signo (dos coeficientes por byte) y las activaciones se cuantizan dinámicamente a INT8, mientras que las biases, la cabeza de salida, las no linealidades y el estado recurrente se mantienen en FP32.

La conversión a INT4 se realizó sin reentrenamiento, recalibración ni recuantización: preserva cada coeficiente, escala, bias FP32 y valor de cabeza evaluado. La validación reportada confirma que las 2.016.170 probabilidades nativas de 16 ms por precisión, sobre 30 grabaciones TEN y 48 de VoxConverse, son bit a bit idénticas a la release evaluada anteriormente. El modelo base procede del checkpoint seed-1730. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Detección de actividad de voz (VAD) binaria por fotograma sobre audio mono float32 a 16 kHz.
- Procesamiento en streaming con gestión de estado recurrente, buffering y timestamps a través de la API `VAD.push()`.
- Inferencia en CPU con kernels SIMD especializados para este VAD en el motor Rust de Akiki.
- Selección de precisión en tiempo de ejecución: `model_precision="int4"` y `fft_precision="fp32"` desde el paquete Python.
- Carga directa de safetensors mediante el motor Rust (`akiki_vad_engine::Weights::load`) o la ABI de C.
- Capacidades multilingües: no disponible (no se documenta dependencia de idioma).
- Tool calling, agentes y razonamiento multi-paso: no disponible (el modelo es un clasificador de audio, no un LLM).
- Visión, audio generativo o modo thinking: no disponible.

## Casos de uso

- **Detección de voz en asistentes por voz en tiempo real**: el modelo procesa fotogramas de 16 ms en 11,74 µs vía `VAD.push()`, lo que permite activar la captura solo cuando hay habla y reducir consumo en dispositivos de borde sin GPU.
- **Segmentación y diarización previa en pipelines de transcripción**: al emitir timestamps por fotograma, se puede recortar el audio antes de enviarlo a un ASR, reduciendo coste de cómputo y latencia en el reconocedor.
- **Filtrado de silencio en llamadas VoIP y teleconferencia**: integrado en el motor Rust, se puede usar para suprimir tramos sin voz y ahorrar ancho de banda, con la ventaja de que el estado recurrente mantiene coherencia entre fotogramas.
- **Preprocesado en grabaciones de archivo (offline)**: con el CLI `akiki vad recording.wav --engine rust --model-precision int4 --fft-precision fp32`, se pueden anotar corpus de TEN o VoxConverse con una precisión AP del 97,84 % y 99,29 % respectivamente.
- **Detección de actividad en dispositivos embebidos**: el fichero de pesos de 106.572 bytes y la ausencia de dependencia de PyTorch u ONNX en el motor Rust facilitan el despliegue en entornos con memoria limitada.
- **Sistemas de turn-taking en agentes conversacionales**: la latencia de microsegundos por fotograma permite detectar el final del turno del usuario con el protocolo de referencia de 32 ms, sin introducir retardo perceptible.
- **Monitorización de calidad de audio y detección de silencios anómalos**: útil en pipelines de validación de grabaciones donde se requiere una probabilidad de voz fiable con precisión alta a recall ≥95 % (90,26 % en TEN y 96,08 % en VoxConverse para INT4).

## Benchmarks y rendimiento

Resultados de evaluación reportados en la model card (protocolo de referencia de 32 ms, 30 grabaciones TEN y 48 de VoxConverse):

| Benchmark | Precisión | AP | F1 a 0,5 | Precision a recall ≥95 % |
|---|---|---:|---:|---:|
| TEN | FP32 | 98,0187 % | 92,6053 % | 90,6487 % |
| TEN | INT4 | 97,8406 % | 92,0614 % | 90,2589 % |
| VoxConverse | FP32 | 99,3045 % | 94,9869 % | 96,1582 % |
| VoxConverse | INT4 | 99,2874 % | 94,9354 % | 96,0833 % |

Latencia medida con `akiki` 0.0.5 en un AMD Ryzen 9 9900X con un núcleo fijado, tres procesos frescos por caso, 2.000 llamadas de calentamiento y 7.500 llamadas cronometradas:

| Métrica | Valor |
|---|---|
| Fotograma de 16 ms vía API pública Python `VAD.push()` (INT4) | 11,74 µs |
| Llamada nativa con punteros preparados (INT4) | 6,61 µs |

La comparación histórica con ONNX Runtime, PyTorch eager, Candle, tract, Burn Flex y RTen, junto a TEN-VAD y Silero v5, corresponde al modelo Akiki 0.2.0 previo a la migración a RealFFT y no debe interpretarse como speedup de la versión 1.0.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU y no requiere GPU.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- ¿Cabe en consumer GPU? No aplica; el motor Rust de Akiki ejecuta en CPU.
- Tamaño en disco: 106.572 bytes de pesos más 1.034 bytes de configuración.
- Opciones de despliegue: paquete Python `akiki` (`pip install akiki`), motor Rust `akiki_vad_engine`, ABI de C, y carga directa de safetensors con el loader `akiki_rowwise` v1.
- Latencia y throughput: 11,74 µs por fotograma de 16 ms en la API pública Python y 6,61 µs en la llamada nativa, medidos en un AMD Ryzen 9 9900X con un núcleo fijado.
- Requisitos de entrada: audio mono float32 finito a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Precisión destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akiki VAD 1.0 INT4 | 190.981 | Fotogramas de 16 ms (protocolo de 32 ms) | AP 97,84 % TEN / 99,29 % VoxConverse | Apache 2.0 | HuggingFace + paquete `akiki` |
| TEN-VAD | no disponible | no disponible | Comparado en benchmark histórico de latencia | no disponible | no disponible |
| Silero v5 | no disponible | no disponible | Comparado en benchmark histórico de latencia | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de TEN-VAD y Silero v5 en la información proporcionada; solo aparecen como referencias en la comparación histórica de latencia del motor.

## Limitaciones y advertencias

- El modelo solo acepta audio mono float32 finito a 16 kHz; otras frecuencias o formatos requieren remuestreo y conversión previos.
- La variante INT4 solo es válida en la práctica con el motor Akiki: la carga directa de safetensors enteros requiere una build con el loader `akiki_rowwise` v1.
- La comparación de latencia con otros motores y modelos corresponde a la versión 0.2.0 y no mide la versión 1.0; no debe usarse para extrapolar speedups.
- No se documentan sesgos acústicos, cobertura de idiomas ni robustez frente a ruido, música o habla solapada; la evaluación se limita a TEN y VoxConverse.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de falsos positivos y falsos negativos en la clasificación de voz; la precisión a recall ≥95 % cae al 90,26 % en TEN con INT4.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican garantías ni condiciones adicionales sobre los datos de entrenamiento.
- El repositorio tiene 14 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación externa.
- El modelo no soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador de audio.

## Enlaces

- HuggingFace: https://huggingface.co/Akiki-AI/akiki-vad-1.0-int4
- Modelo base: https://huggingface.co/Akiki-AI/akiki-vad-1.0
- Documentación del formato de pesos: [FORMAT.md](FORMAT.md) (referenciado en la model card)
- Datos de benchmark: [assets/benchmark-data.json](assets/benchmark-data.json)
- Gráfica de latencia del paquete: [assets/package-latency.svg](assets/package-latency.svg)
- Gráfica comparativa de motores: [assets/engine-comparison.svg](assets/engine-comparison.svg)
- Validación de conversión de formato: `format-conversion-validation.json` (referenciado en la model card)
- Paquete Python: `pip install akiki`
- Motor Rust: `akiki_vad_engine` (referenciado en la model card)
