# itamiArika/htdemucs-int8-memory

## Resumen

`itamiArika/htdemucs-int8-memory` es una variante experimental de cuantización INT8 del modelo de separación de fuentes musicales HTDemucs, convertido a formato ONNX. Partiendo del repositorio `StemSplitio/htdemucs-onnx` (que a su vez deriva de la implementación de Meta AI), el autor aplica una cuantización estática selectiva sobre las capas del cross-transformer, mantiene los pesos en FP16 y sustituye las convoluciones STFT/iSTFT por la operación `DFT` nativa de ONNX. El resultado son varios ficheros ONNX con distintos perfiles de memoria y latencia, pensados para entornos con recursos limitados como `onnxruntime-node` o `openvino-node`.

El modelo se presenta como un experimento personal: se publican únicamente los pesos y una tabla de selección de variantes, sin scripts de generación, informe técnico ni datos de calibración. La calidad objetiva medida en MUSDB18 muestra una pérdida de solo 0,03 dB de SDR respecto al modelo FP32 original (8,34 dB frente a 8,37 dB), aunque el autor advierte que no se han realizado pruebas auditivas. La licencia es MIT, igual que la del modelo base y la de Demucs original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs) convertido a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (audio, segmento fijo de 7,8 s) |
| Tipos de cuantizacion | INT8 selectiva (activaciones y pesos per-channel), FP16 para pesos, FP32 para rutas sensibles |
| Idiomas soportados | no aplica (procesa audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (ficheros .onnx) |

## Arquitectura y entrenamiento

HTDemucs es la cuarta generación de Demucs de Meta AI, presentada en el artículo *Hybrid Transformers for Music Source Separation* (Rouard et al., ICASSP 2023). Procesa el audio con dos encoders paralelos: uno trabaja sobre la forma de onda en el dominio del tiempo y otro sobre el espectrograma STFT. Ambos se combinan en un bloque transformer híbrido antes de la decodificación. En esta variante ONNX, el autor sustituye las convoluciones de Fourier por la operación `DFT` de ONNX y aplica cuantización estática INT8 (QDQ) solo a las capas `Conv`, `MatMul` y `Gemm` del cross-transformer. Las ramas de frecuencia, STFT/iSTFT y el decoder se mantienen en FP32 para no degradar la calidad.

El entrenamiento original de HTDemucs se realizó con datos musicales y técnicas de aumentación de mezcla, pero esta conversión no reentrena el modelo: solo lo transforma y cuantiza. La calibración para la cuantización se hizo con 24 segmentos de una biblioteca musical privada, con percentil 99,99, y no se publica el conjunto de calibración, por lo que el proceso no es reproducible bit a bit.

## Capacidades

- Separación de fuentes musicales en 4 stems: batería, bajo, otros y voces.
- Procesa audio estéreo a 44,1 kHz con entrada `(1, 2, 343980)` float32 (segmento de 7,8 s) y salida `(1, 4, 2, 343980)`.
- Soporta ejecución secuencial de segmentos para audio largo, con memoria pico constante por segmento.
- Disponible en múltiples variantes ONNX optimizadas para `onnxruntime-node` y `openvino-node`.
- No incluye soporte de tool calling, agentes ni procesamiento de texto; es exclusivamente un modelo de audio.

## Casos de uso

- Separación de pistas para producción musical: permite aislar batería, bajo, voces y otros elementos de una mezcla para remezclas o análisis de instrumentos.
- Extracción de voces para karaoke o aplicaciones de acompañamiento: se puede usar el stem de voces para eliminar o aislar la pista vocal.
- Preparación de datos de entrenamiento para modelos de síntesis de audio: los stems separados sirven como entrada para sistemas de generación de música o voz.
- Análisis forense de audio: separar fuentes en grabaciones de baja calidad para mejorar la inteligibilidad o identificar componentes individuales.
- Integración en pipelines de audio en tiempo real: con la variante `portable` para OpenVINO se consigue una latencia de 1,22 s por segmento en CPU, adecuada para procesamiento por lotes.
- Despliegue en entornos con memoria limitada: la variante `split3/` reduce el pico de memoria bajo ONNX Runtime a 1,10–1,24 GB, viable en dispositivos con poca RAM.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de calidad y rendimiento medidos por el autor.

| Métrica | Valor |
|---|---|
| MUSDB18 SDR (FP32 original) | 8,37 dB |
| MUSDB18 SDR (INT8) | 8,34 dB (−0,03 dB) |
| SDR vs FP32 (INT8, por segmento) | 28–39 dB (5 segmentos: 30,2 / 35,9 / 28,2 / 33,2 / 39,4) |
| SDR vs FP32 (transparente) | 123,6 dB (numéricamente idéntico) |

Rendimiento medido en i7-12800H con 4 threads, `onnxruntime-node` 1.27 / `openvino-node` 2026.3, Linux.

| Variante | ORT pico (arena off) / tiempo | OpenVINO pico / tiempo |
|---|---|---|
| `htdemucs-dft-int8-fp16-final.onnx` | 2,6–3,9 GB / 1,67–1,89 s | no legible |
| `htdemucs-dft-int8-fp16-chunked.onnx` | 2,24 GB / 1,86–1,90 s | no legible |
| `split3/` + `parts.json` | 1,10–1,24 GB / 1,85–2,13 s | no aplicable |
| `htdemucs-dft-int8-fp16-portable.onnx` | 2,6–3,9 GB / 1,84 s | 0,98 GB / 1,22 s |
| `htdemucs-dft-fp16-transparent.onnx` | 2,6 GB / 1,78 s | no legible |
| `htdemucs-dft-fp16-transparent-portable.onnx` | 3,7 GB / 2,02 s | 1,17 GB / 1,54 s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Para ONNX Runtime con CPU: se recomienda desactivar `enableCpuMemArena: false`; sin esta opción el pico de memoria sube a 5 GB.
- La variante `split3/` permite ejecutar en equipos con 1,5 GB de RAM disponible bajo ORT.
- La variante `-portable` es la única que puede cargar OpenVINO, con pico de 0,98 GB y latencia de 1,22 s por segmento de 7,8 s.
- No se han probado GPUs; el autor indica que las mediciones son de CPU x86 (i7-12800H).
- Opciones de despliegue: `onnxruntime-node`, `openvino-node`, y potencialmente cualquier runtime ONNX estándar.
- No se recomienda el uso de `chunked` o `split3` fuera de ONNX Runtime; en OpenVINO son más lentos y consumen más memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Licencia | Formato | SDR MUSDB18 | Notas |
|---|---|---|---|---|---|---|
| `htdemucs-int8-memory` (este) | HTDemucs (ONNX) | no disponible | MIT | ONNX | 8,34 dB | Cuantizado, memoria optimizada |
| `StemSplitio/htdemucs-onnx` | HTDemucs (ONNX) | no disponible | MIT | ONNX | 8,37 dB | Modelo FP32 original |
| Demucs original (Meta) | HTDemucs | ~80M (estimado) | MIT | PyTorch | 8,37 dB | Implementación de referencia |

No se dispone de datos comparativos con otros sistemas de separación como Spleeter o MDX en la información proporcionada.

## Limitaciones y advertencias

- No se han realizado pruebas auditivas; la cuantización INT8 introduce un ruido de fondo que puede ser perceptible aunque el SDR se reduzca solo 0,03 dB.
- La calibración de la cuantización se hizo con una biblioteca privada no publicada, por lo que el proceso no es reproducible.
- La variante `split3` y `chunked` son trucos específicos para ONNX Runtime; no aportan beneficios en otros runtimes y pueden ser más lentos en OpenVINO.
- La variante `-portable` produce salidas no idénticas bit a bit respecto a FP32 bajo OpenVINO (error del mismo orden que ORT), por lo que se recomienda re-evaluar antes de producción.
- El modelo solo acepta segmentos de 7,8 s; audio más largo debe segmentarse y procesarse secuencialmente, lo que aumenta el tiempo total de inferencia.
- La licencia MIT permite uso comercial, pero se debe conservar la atribución original de Demucs y del repositorio base.
- No se incluyen scripts de generación ni informe técnico detallado; la documentación es la propia model card.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/itamiArika/htdemucs-int8-memory
- Repositorio base de ONNX: https://huggingface.co/StemSplitio/htdemucs-onnx
- Repositorio original de Demucs (Meta): https://github.com/facebookresearch/demucs
- Documentación de cuantización de Hugging Face: https://huggingface.co/docs/transformers/quantization/concept_guide
- Página de variantes de Demucs en DeepWiki: https://deepwiki.com/facebookresearch/demucs/5.1-models-and-variants
