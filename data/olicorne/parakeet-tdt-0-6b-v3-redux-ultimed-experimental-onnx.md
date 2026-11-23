# Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-experimental-onnx

## Resumen

El modelo `parakeet-tdt-0.6b-v3-redux-UltiMed-experimental-onnx` es un sistema de reconocimiento automático del habla (ASR) en francés, especializado en vocabulario médico, publicado por el usuario Olicorne en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de una mezcla aritmética de pesos (*task arithmetic*): combina el encoder ternario ultraligero de `moondream/parakeet-redux` con el delta de ajuste fino que el autor aplicó en su modelo médico `parakeet-tdt-0.6b-v3-ultra-UltiMed-v2`. El objetivo es ofrecer la menor descarga posible (185 MB de encoder + 24 MB de decoder) manteniendo parte de la mejora en transcripción médica.

La arquitectura subyacente es NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) y aproximadamente 0,6 mil millones de parámetros. El modelo se distribuye exclusivamente en formato ONNX, pensado para ejecución en CPU y WASM (navegador), no en GPU. La licencia es CC-BY-4.0 y el único idioma declarado es el francés.

Es relevante por su enfoque de compresión extrema: usa empaquetado mixto MatMulNBits (2 bits para las capas 0-19 del encoder, 8 bits para las capas 20-23 y la proyección de subsampling), lo que reduce el peso a una fracción del modelo int8 completo. El propio autor lo etiqueta como experimental y de uso exclusivamente de investigación, no para despliegue clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer + TDT (Token-and-Duration Transducer) |
| Parámetros totales | ~0,6 mil millones (0.6b) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MatMulNBits mixto: 2 bits (block 128, ternario) en capas 0-19 del encoder; 8 bits (block 64) en capas 20-23 y proyección de subsampling; decoder int8 (embedding y LSTM) con tres MatMuls del joint en fp32; decoder fp32 alternativo |
| Idiomas soportados | francés (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (carpetas `w2a8/`, `int8/`, `fp32/`), ficheros `.zst` precomprimidos |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es una combinación aritmética de pesos. El encoder se construye como `redux encoder + 1.0 * (UltiMed encoder - ultra encoder)` y el decoder como `redux decoder + 1.0 * (UltiMed decoder - ultra decoder)`. Dado que UltiMed se ajustó desde `parakeet-ultra`, el delta `UltiMed - ultra` representa exactamente lo que cambió el ajuste fino médico. Los tres modelos comparten arquitectura, tokenizer y nombres de inicializadores, lo que hace posible la operación.

El ajuste fino de UltiMed congeló todas las capas del encoder salvo las 4 últimas de las 24 totales, de modo que el delta es exactamente cero en las capas 0 a 19. Esas capas conservan los pesos ternarios de redux (valores -1, 0 o +1 multiplicados por una escala por bloque de 128), empaquetados sin pérdida a 2 bits. Solo las capas 20 a 23 se vuelven densas y se empaquetan a 8 bits, dando lugar al esquema de empaquetado mixto (220 MatMuls ternarios a 2 bits y 45 a 8 bits). El modelo se reconstruyó el 2026-11-22 tomando el delta de UltiMed v2 en lugar de v1.

Como innovación adicional, desde el 2026-10-22 el encoder w2a8 sustituye el `rel_shift` por capa de NeMo (Pad -> Reshape -> Slice -> Reshape -> Slice) por un único `Gather` sobre un índice de posición compartido por las 24 capas, reduciendo el grafo de 2264 a 1891 nodos sin alterar los pesos ni las salidas (diferencia máxima absoluta 0.0 en onnxruntime CPU). El modelo se construyó con Claude Code.

## Capacidades

- Reconocimiento automático del habla (transcripción) en francés, con especial atención a terminología médica.
- Decodificación TDT (Token-and-Duration Transducer), que predice tanto tokens como duraciones.
- Ejecución en CPU mediante onnxruntime y en navegador vía WASM (usado por Parakeet Web).
- Preprocesamiento integrado mediante `nemo128.onnx` (extracción de features de audio).
- Decodificación por lotes disponible usando el decoder `fp32/` (el decoder int8 cuantiza activaciones con una sola escala por lote y puede hacer que una transcripción dependa de sus vecinos de lote).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de dictados clínicos en francés: el modelo incorpora el delta de ajuste fino sobre vocabulario médico, lo que mejora la transcripción de términos especializados frente al modelo base redux (WER de diccionario 6,92 % -> 4,99 % en la versión v2).
- ASR en el navegador sin backend: al ejecutarse en WASM con un encoder de 185 MB comprimido, permite transcripción local en aplicaciones web sin enviar audio a un servidor.
- Despliegue en entornos con recursos muy limitados: la descarga total (185 MB encoder + 24 MB decoder) es apta para dispositivos con poco almacenamiento o ancho de banda restringido, frente a los 598 MB del encoder int8 de UltiMed v2.
- Prototipado e investigación en compresión de modelos ASR: sirve como caso de estudio de empaquetado mixto MatMulNBits y de task arithmetic aplicada a modelos Conformer.
- Procesamiento por lotes en CPU con el decoder fp32: para pipelines de transcripción masiva donde la reproducibilidad por lote es importante, evitando la dependencia entre muestras del decoder int8.
- Evaluación comparativa de estrategias de cuantización: útil para medir el compromiso entre tamaño de descarga, velocidad y precisión (WER) frente a variantes int8 y fp32.

## Benchmarks y rendimiento

Datos de WER y velocidad reportados por el autor (conjunto de 200 clips de diccionario y FLEURS fr):

| Métrica | Este modelo (build v2) | UltiMed v1 build | UltiMed v2 int8 | redux |
|---|---|---|---|---|
| WER diccionario médico | 4,99 % | 6,92 % (v1) | no disponible en la información | no disponible |
| WER FLEURS fr | 6,83 % | 6,30 % (v1) | no disponible | no disponible |
| Tamaño encoder (zstd) | 185 MB | 172 MB | 598 MB | 135 MB |
| Tamaño decoder (zstd) | 24 MB | no disponible | 13 MB | 13 MB |
| Velocidad CPU (s/clip, 12 núcleos) | no remedido (grafo y empaquetado iguales al build v1: 1,43 / 1,45) | 1,43 / 1,45 | 1,45 / 1,32 | 1,26 / 1,11 |

El autor indica que el modelo es aproximadamente un 25 % más lento que redux y no más rápido que UltiMed int8 en CPU de escritorio; su ventaja es el tamaño de descarga, no la velocidad. La velocidad en navegador (WASM) no se ha medido.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el encoder de 2 bits provoca un fallo de acceso ilegal de memoria en el proveedor CUDA de onnxruntime (onnxruntime-gpu 1.30.0, 2026-10-06).
- En GPU, el autor recomienda usar UltiMed int8, que es más rápido y más preciso.
- Huella de almacenamiento: 185 MB (encoder w2a8) + 24 MB (decoder int8) comprimidos con zstd; 256 MB + 37 MB sin comprimir.
- Despliegue mediante onnxruntime (CPU) y WASM en navegador (Parakeet Web).
- Velocidad de referencia en CPU de 12 núcleos, batch 1, decoder int8: 1,43-1,45 s por clip en el build v1 (mismo grafo y empaquetado).
- No se documentan requisitos de VRAM ni GPU recomendadas para este modelo, dado que no está pensado para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño encoder | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo | ~0,6b | ONNX (2/8 bits mixto) | 185 MB zstd | CC-BY-4.0 | Mezcla aritmética, CPU/WASM |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx | ~0,6b | ONNX int8 | 598 MB zstd | CC-BY-4.0 | Ajuste fino médico completo, más preciso |
| moondream/parakeet-redux | ~0,6b | ONNX ternario | 135 MB zstd | no disponible en la información | Encoder ternario ultraligero, base |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | ~0,6b | ONNX | no disponible | no disponible en la información | Modelo base del ajuste fino |

## Limitaciones y advertencias

- Modelo experimental: es una mezcla aritmética de pesos, no un modelo entrenado; el autor lo marca como uso exclusivamente de investigación y no apto para despliegue clínico.
- Precisión inferior a UltiMed v2 int8: para máxima precisión en francés médico debe usarse el modelo UltiMed v2 completo.
- Solo francés: no se declara soporte multilingüe.
- Solo CPU: falla en el proveedor CUDA de onnxruntime; en GPU conviene usar la variante int8.
- El decoder int8 puede hacer que una transcripción dependa de sus vecinos de lote; para decodificación por lotes debe usarse el decoder fp32.
- Más lento que redux (~25 %) y sin ventaja de velocidad frente a UltiMed int8 en CPU.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el autor restringe explícitamente el uso clínico.
- Riesgo de alucinación y errores en terminología no cubierta por el dataset de ajuste fino (UltiMed-ASR-FR-v2); no se documentan sesgos específicos.
- Proyecto autofinanciado en una única GPU de consumo, con posibles limitaciones de mantenimiento y actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-experimental-onnx
- Modelo base redux: https://huggingface.co/moondream/parakeet-redux
- UltiMed v2 (modelo de referencia): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- UltiMed v1: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- parakeet-ultra: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Dataset UltiMed-ASR-FR-v2: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v2
- Sitio del autor: https://olicorne.org
- Claude Code: https://claude.com/claude-code
