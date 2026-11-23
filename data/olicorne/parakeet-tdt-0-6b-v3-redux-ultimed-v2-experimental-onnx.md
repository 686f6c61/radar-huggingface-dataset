# Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-v2-experimental-onnx

## Resumen
El modelo `parakeet-tdt-0.6b-v3-redux-UltiMed-v2-experimental-onnx` es un modelo de reconocimiento automático del habla (ASR) para francés con especialización en dominio médico, publicado por el usuario Olicorne en Hugging Face. No es un modelo entrenado de forma convencional, sino un híbrido experimental construido mediante aritmética de pesos (*task arithmetic*): combina el encoder ternario ultracomprimido de `moondream/parakeet-redux` con el delta de aprendizaje que el finetune médico `UltiMed v2` aplicó sobre su base `parakeet-ultra`. El objetivo es ofrecer la precisión médica de UltiMed con un tamaño de descarga mucho menor (185 MB de encoder frente a 598 MB en int8).

La arquitectura subyacente es un NeMo Conformer-TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, con 24 capas de encoder. El modelo se distribuye exclusivamente en formato ONNX, con un encoder empaquetado en MatMulNBits de precisión mixta (2 bits para las capas 0-19, 8 bits para las capas 20-23) y decodificadores en int8 o fp32. Está pensado para ejecución en CPU y WASM, no en GPU.

Es relevante ahora porque demuestra una técnica práctica para reducir drásticamente el peso de un modelo ASR especializado sin reentrenar, aprovechando que el finetune médico congeló la mayor parte del encoder. El resultado es un modelo de investigación, no apto para despliegue clínico, que prioriza el tamaño de descarga sobre la precisión y la velocidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT (Token-and-Duration Transducer) |
| Parametros totales | ~0,6 mil millones (0.6b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder MatMulNBits: 2 bits (capas 0-19, ternario, bloque 128) y 8 bits (capas 20-23 y proyección de subsampling, bloque 64); decodificador int8 (embedding y LSTM) o fp32 |
| Idiomas soportados | francés (fr) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (ficheros `.onnx`, con copias precomprimidas `.zst`) |

## Arquitectura y entrenamiento
El modelo es un Conformer-TDT de 24 capas de encoder con decodificador transducer TDT. No se ha entrenado: es el resultado de una combinación lineal de pesos. Concretamente, `encoder = redux encoder + 1.0 * (UltiMed encoder - ultra encoder)` y `decoder = redux decoder + 1.0 * (UltiMed decoder - ultra decoder)`. Como UltiMed se finetuneó desde `parakeet-ultra`, el delta `UltiMed - ultra` representa exactamente lo que el finetune médico cambió, y los tres modelos comparten arquitectura, tokenizer y nombres de inicializadores.

La innovación clave es el empaquetado mixto. El finetune de UltiMed congeló todas las capas del encoder salvo las 4 últimas (capas 20 a 23), por lo que el delta en las capas 0 a 19 es exactamente cero. Esas capas conservan los pesos ternarios de redux (cada peso es -1, 0 o +1 multiplicado por una escala por bloque de 128), empaquetados sin pérdida a 2 bits; solo las capas 20 a 23 y la proyección de subsampling se vuelven densas y se empaquetan a 8 bits. El resultado son 220 MatMuls ternarios a 2 bits y 45 a 8 bits. Esta versión se reconstruyó el 2026-11-22 tomando el delta de UltiMed v2 en lugar de v1. El grafo de atención también se simplificó desde el 2026-10-22, sustituyendo el `rel_shift` por capa de NeMo por un único Gather sobre un índice de posición compartido por las 24 capas (de 2264 a 1891 nodos), con salidas idénticas al encoder original (diferencia absoluta máxima 0.0). El modelo se construyó con Claude Code.

## Capacidades
- Reconocimiento automático del habla en francés, con especial énfasis en vocabulario y terminología médica.
- Transcripción de audio a texto mediante decodificación TDT (transducer con predicción de duración de token).
- Ejecución en CPU y en navegador vía WASM (pensado para Parakeet Web).
- Empaquetado de precisión mixta que permite descargas muy reducidas manteniendo la estructura del modelo original.
- No soporta tool calling, agentes, visión, audio generativo ni modos de razonamiento; es exclusivamente ASR.
- Capacidad multilingüe limitada al francés.

## Casos de uso
- Transcripción de dictados médicos en francés: el modelo incorpora el delta de un finetune sobre corpus médico (UltiMed v2), por lo que reconoce terminología clínica mejor que el redux base, con un WER de diccionario del 4,99 %.
- Prototipado de ASR médico en entornos con recursos limitados: al ocupar 185 MB de encoder comprimido, cabe en dispositivos de bajos recursos y en aplicaciones web.
- Aplicaciones web de transcripción en el navegador: el encoder está diseñado para ejecutarse en WASM con onnx-asr, lo que permite desplegar ASR sin backend GPU.
- Evaluación e investigación sobre compresión de modelos ASR: sirve como caso de estudio de aritmética de pesos y empaquetado mixto 2/8 bits.
- Generación de borradores de transcripción para revisión humana en contextos de investigación clínica, nunca como salida final.
- Pruebas comparativas de WER frente a redux y UltiMed int8 en corpus franceses médicos y generales (FLEURS fr).

## Benchmarks y rendimiento
Los datos disponibles son de WER y de velocidad en CPU (12 núcleos, onnxruntime, batch 1, decodificador int8, 200 clips de prueba de diccionario, dos pasadas en orden alterno, 2026-10-07).

| Metrica | Este modelo (build v2) | UltiMed v1 build | Notas |
|---|---|---|---|
| WER diccionario médico | 4,99 % | 6,92 % | Mejora de 1,3 a 2,4 puntos frente al build v1 |
| WER FLEURS fr | 6,83 % | 6,30 % | Empeora ligeramente frente al build v1 |
| Tiempo por clip (CPU, s) | no remedido (build v1: 1,43 / 1,45) | 1,43 / 1,45 | redux w2a8: 1,26 / 1,11; UltiMed v1 int8: 1,45 / 1,32; parakeet-ultra int8: 1,65 / 1,56 |
| Tamano encoder (zstd) | 185 MB | 172 MB | UltiMed v2 int8: 598 MB; redux: 135 MB |

El modelo es aproximadamente un 25 % más lento que redux y no más rápido que UltiMed int8 en CPU de escritorio; su ventaja es el tamaño de descarga, no la velocidad. La velocidad en WASM no se ha medido.

## Requisitos de hardware
- Inferencia en CPU exclusivamente: el encoder de 2 bits provoca un fallo de acceso ilegal de memoria en el proveedor CUDA de onnxruntime (onnxruntime-gpu 1.30.0, 2026-10-06). En GPU, UltiMed int8 es más rápido y más preciso.
- VRAM estimada: no aplica (no soportado en GPU); en CPU, el encoder ocupa 185 MB comprimido y el decodificador int8 24 MB.
- GPU recomendadas: ninguna; el autor indica explícitamente que en GPU conviene usar UltiMed int8.
- Cabe en cualquier CPU consumer moderna; también está pensado para ejecución en navegador vía WASM.
- Opciones de despliegue: onnxruntime (CPU), onnx-asr, Parakeet Web (WASM). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia medida: ~1,4 s por clip en CPU de 12 núcleos (build v1); el rendimiento del build v2 no se ha vuelto a medir, aunque el grafo y el empaquetado son los mismos.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | WER diccionario medico | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este modelo (redux + UltiMed v2, experimental) | ~0,6b | no disponible | 4,99 % | cc-by-4.0 | ONNX, CPU/WASM, 185 MB encoder |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx | ~0,6b | no disponible | mejor precision segun el autor (valor no disponible) | no disponible | ONNX int8, 598 MB encoder |
| moondream/parakeet-redux | ~0,6b | no disponible | no disponible (peor en dominio medico) | no disponible | ONNX ternario, 135 MB encoder |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | ~0,6b | no disponible | no disponible (base sin finetune medico) | no disponible | ONNX int8 |

## Limitaciones y advertencias
- Modelo experimental: es una mezcla aritmética de pesos, no un modelo entrenado; el autor lo marca como solo para investigación y no apto para despliegue clínico.
- Para la mejor precisión médica en francés, el autor recomienda usar UltiMed v2 int8; este modelo sacrifica precisión por un tamaño de descarga tres veces menor.
- No funciona en GPU con onnxruntime CUDA (fallo de memoria); solo CPU y WASM.
- El decodificador int8 cuantiza las activaciones con una sola escala por lote, por lo que una transcripción puede depender de sus vecinos de lote; para decodificación por lotes debe usarse el decodificador fp32.
- El WER en FLEURS fr empeora respecto al build v1 (6,83 % frente a 6,30 %), lo que sugiere una pérdida de rendimiento en francés general.
- Solo soporta francés; no hay capacidades multilingües.
- Riesgo de alucinación y errores en terminología fuera del dominio médico cubierto por UltiMed v2; no se han publicado análisis de sesgos.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero el autor restringe explícitamente el uso clínico.
- La velocidad en WASM no se ha medido y el rendimiento del build v2 no se ha vuelto a medir.

## Enlaces
- Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-v2-experimental-onnx
- Modelo base redux: https://huggingface.co/moondream/parakeet-redux
- Modelo base UltiMed v2: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Modelo base Ultra: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- UltiMed v1: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- Dataset: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v2
- Web del autor: https://olicorne.org
- Claude Code: https://claude.com/claude-code
