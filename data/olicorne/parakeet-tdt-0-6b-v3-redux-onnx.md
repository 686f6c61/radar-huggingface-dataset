# Olicorne/parakeet-tdt-0.6b-v3-redux-onnx

## Resumen

Parakeet Redux ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-redux`, que a su vez es una versión cuantizada a 1,58 bits del `nvidia/parakeet-tdt-0.6b-v3`. Lo desarrolla el usuario independiente Olicorne con el objetivo de ejecutar transcripción de voz completamente en el navegador, sin servidor ni GPU, mediante WebAssembly y WebGPU. La arquitectura es NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) y aproximadamente 600 millones de parámetros, con un encoder cuyos pesos son ternarios (-1, 0, +1) multiplicados por una escala por bloque de 128 elementos.

La relevancia del modelo reside en su estrategia de compresión extrema: al ser los pesos ya ternarios, las representaciones de 8, 4 y 2 bits contienen exactamente la misma información, de modo que el encoder pesa solo 190 MB (135 MB comprimido con zstd) sin pérdida de precisión respecto al checkpoint original. Esto lo convierte en una opción viable para aplicaciones de dictado, subtitulado o transcripción offline en entornos con recursos limitados, incluyendo dispositivos de consumo y navegadores.

El modelo cubre 25 idiomas europeos y se distribuye bajo licencia CC-BY-4.0. Está pensado específicamente para CPU y WASM: el encoder de 2 bits provoca fallos en el proveedor CUDA de onnxruntime, por lo que en GPU el autor recomienda su variante int8 (`parakeet-ultra`). El repositorio incluye el checkpoint NeMo original, el vocabulario, el preprocesador `nemo128.onnx` y los decodificadores en int8 y fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer + TDT (Token-and-Duration Transducer) |
| Parametros totales | ~0,6 mil millones (modelo base parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio por fragmentos; preprocesador nemo128) |
| Tipos de cuantizacion | Encoder MatMulNBits 2-bit (w2a8, bloque 128); decodificador int8 y fp32; pesos ternarios |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder w2a8, decoder int8/fp32), checkpoint `.nemo`, `vocab.txt`, `config.json` |

## Arquitectura y entrenamiento

El modelo es un Conformer de NeMo con cabecera TDT, la misma arquitectura y tokenizador que `nvidia/parakeet-tdt-0.6b-v3`. La decodificación TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso y reduce la latencia frente a un transducer clásico. El encoder consta de 24 capas con atención relativa; la exportación sustituye el `rel_shift` por capa (Pad → Reshape → Slice → Reshape → Slice) por un único `Gather` sobre un índice de posición compartido, reduciendo el grafo de 2264 a 1891 nodos sin alterar los pesos ni las salidas (diferencia absoluta máxima de 0,0 en onnxruntime CPU con lotes de 1 y 2).

El proceso de construcción parte del checkpoint de Hugging Face, lo remapea al `.nemo` base mediante renombrado de claves (todos los pesos aprendidos provienen de los safetensors de moondream y se elimina la cabecera VAD), y aplica `export_onnx.py --web-optimized` de NeMo seguido del script `build-from-nemo-export.sh --ternary`: plegado de grafo con verificación bit-exacta, redondeo a mantisa de 12 bits, fragmentación fp32, cirugía del decodificador (int8 con LSE/top-K), fp16, conversión de convoluciones puntuales a MatMul y empaquetado MatMulNBits. La proyección de subsampling no es ternaria y permanece en fp32. El autor no documenta en la información disponible el volumen de tokens de entrenamiento ni el uso de RLHF/DPO; esos detalles corresponden al modelo base de NVIDIA.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Procesamiento por lotes de clips de distinta longitud: el encoder enmascara los frames de relleno con un sesgo de atención solo-clave, por lo que `model.recognize([a, b, c])` de onnx-asr funciona sin padding manual.
- Ejecución en navegador mediante WebAssembly y WebGPU (proyecto Parakeet Web), sin servidor.
- Integración con `onnx-asr` y con el pipeline de `Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en el navegador: Parakeet Web ejecuta el encoder w2a8 en WASM y permite dictado o subtitulado completamente del lado del cliente, sin enviar audio a ningún servidor, gracias a los 135 MB comprimidos del encoder.
- Aplicaciones de escritorio offline: herramientas de notas de voz o grabación de reuniones que necesitan transcribir sin conexión en CPU, con un rendimiento de 1,46 s por clip en lote de 1.
- Procesamiento por lotes de archivos de audio: con el decodificador fp32 y lotes de 8, 16 o 32 se alcanzan 0,06, 0,05 y 0,04 s por clip en CUDA, útil para pipelines de transcripción masiva de archivos cortos.
- Subtitulado multilingüe: la cobertura de 25 idiomas europeos permite generar subtítulos para contenido en inglés, alemán, francés, español, italiano, portugués, lenguas eslavas, bálticas y escandinavas con un único modelo.
- Transcripción de audio médico en francés: el autor publica una variante específica (`parakeet-tdt-0.6b-v3-redux-UltiMed-experimental-onnx`) con WER de diccionario del 8,78 % frente al 12,12 % de la variante ultra, manteniendo el mismo encoder de 135 MB.
- Prototipado e investigación en ASR de bajo consumo: sirve como referencia para estudiar cuantización ternaria y despliegue ONNX en entornos sin GPU, dado que el repositorio incluye el `.nemo` original y los scripts de reconstrucción.
- Integración en aplicaciones web de accesibilidad: transcripción en vivo de audio para personas con dificultades auditivas, ejecutada localmente en el dispositivo del usuario.

## Benchmarks y rendimiento

La información disponible incluye mediciones de latencia y velocidad, pero no resultados de benchmarks estándar (WER por conjunto de datos, MMLU, etc.) para este modelo concreto. Los datos publicados son:

| Metrica | Valor |
|---|---|
| Latencia encoder w2a8, CPU, lote 1 | 1,46 s por clip |
| Latencia encoder int8, CPU, lote 1 | 1,54 a 1,81 s por clip |
| Latencia encoder w4a8, CPU, lote 1 | 1,53 a 1,63 s por clip |
| Throughput con lotes (UltiMed w4a8, fp32 decoder, CUDA) | 0,06 s/clip (lote 8), 0,05 s/clip (lote 16), 0,04 s/clip (lote 32) frente a 0,16 s/clip sin lotes |
| WER en 1000 clips de diccionario UltiMed | 3,26 % (con y sin lotes) |
| WER de diccionario, variante UltiMed experimental | 8,78 % (frente a 12,12 % de la variante ultra) |

No se han publicado resultados de benchmarks estándar (p. ej. LibriSpeech, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM: el modelo está diseñado para CPU; no requiere VRAM en su configuración objetivo. El encoder w2a8 ocupa 190 MB en disco (135 MB con zstd) y el decodificador int8, 18 MB.
- GPU recomendadas: el encoder de 2 bits provoca un fallo de acceso ilegal a memoria en el proveedor CUDA de onnxruntime (onnxruntime-gpu 1.30.0, 2026-10-06). En GPU el autor recomienda la variante int8 `parakeet-ultra`, más rápida y precisa en ese entorno.
- GPU de consumo: no aplicable para esta exportación concreta por el problema de CUDA; en CPU funciona en cualquier equipo capaz de ejecutar onnxruntime.
- Opciones de despliegue: onnxruntime (CPU/WASM), onnx-asr, Parakeet Web (WebGPU/WASM en navegador).
- Latencia y throughput: 1,46 s por clip en CPU con lote 1; con lotes en CUDA sobre la variante UltiMed, hasta 0,04 s por clip con lote de 32. El decodificador int8 usa una escala de activación por lote, por lo que para lotes conviene el decodificador fp32 (73 MB) para evitar dependencias entre clips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idiomas | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Olicorne/parakeet-tdt-0.6b-v3-redux-onnx | ~0,6 B | 25 idiomas europeos | Ternaria, encoder w2a8 190 MB | CC-BY-4.0 | Objetivo CPU/WASM; falla en CUDA |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | ~0,6 B | no disponible en la informacion | int8 | no disponible en la informacion | Recomendado por el autor para GPU; más rápido y preciso en CUDA |
| Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx | ~0,6 B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Mismo layout y pipeline que este modelo |
| nvidia/parakeet-tdt-0.6b-v3 (base) | ~0,6 B | 25 idiomas europeos | Pesos completos | no disponible en la informacion | Modelo original de NVIDIA; referencia de precisión |

## Limitaciones y advertencias

- El encoder de 2 bits no funciona con el proveedor CUDA de onnxruntime (acceso ilegal a memoria); en GPU hay que usar la variante int8.
- El decodificador int8 cuantiza activaciones con una escala por lote, de modo que la transcripción de un clip puede depender de los clips vecinos; para lotes debe usarse el decodificador fp32.
- Solo se distribuye el encoder w2a8 desde 2026-10-06; las versiones fp32, fp16, int8 y w4a8 se eliminaron del árbol principal (permanecen en el historial git).
- Cobertura limitada a 25 idiomas europeos; no se documentan otros idiomas.
- No se documentan en la información disponible sesgos específicos, tasas de alucinación ni evaluación en dominios distintos del diccionario UltiMed.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de NVIDIA y del checkpoint de moondream antes de desplegar en producción.
- Los datos de benchmarks estándar de ASR no están publicados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-onnx
- Modelo base (moondream): https://huggingface.co/moondream/parakeet-redux
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante optimizada: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx
- Variante ultra (int8, GPU): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Variante médica experimental: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-experimental-onnx
- Variante médica ultra: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- Parakeet Web (transcripción en navegador): https://github.com/thiswillbeyourgithub/parakeet_web
- onnx-asr: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
- Claude Code: https://claude.com/claude-code
