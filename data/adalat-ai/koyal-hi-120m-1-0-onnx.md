# adalat-ai/koyal-hi-120m-1.0-onnx

## Resumen

Koyal Hindi ASR 120M (ONNX) es la exportación a formato ONNX del modelo de reconocimiento automático del habla en hindi `adalat-ai/koyal-hi-120m-1.0`, desarrollado por Adalat AI. El modelo original es un sistema ASR de tipo Conformer con decodificador TDT (Token-and-Duration Transducer), un esquema híbrido que combina la arquitectura Conformer con un transductor que predice simultáneamente tokens y duraciones. Esta versión ONNX elimina la dependencia de PyTorch y NeMo, permitiendo su ejecución en Python, en otros lenguajes con bindings de ONNX Runtime o directamente en el navegador.

El modelo transcribe hindi con ortografía enriquecida: incluye puntuación y numerales escritos, imitando el formato de un documento mecanografiado. Con 120 millones de parámetros, está pensado para despliegues ligeros donde el coste computacional y el tamano del binario son críticos, manteniendo una calidad de transcripción competitiva (WER_SCRIBE de 9,03% en FLEURS-RO según la model card original).

La relevancia de esta versión radica en su portabilidad: al ofrecer pesos en float32, fp16 e int8, cubre desde servidores con GPU hasta navegadores con WebAssembly, sin necesidad de infraestructura de deep learning pesada. Está publicada bajo licencia CC-BY-4.0, lo que facilita su adopción tanto en investigación como en productos comerciales con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer + decodificador TDT (Token-and-Duration Transducer), híbrido TDT-CTC (cabeza CTC auxiliar no exportada) |
| Parametros totales | 120 millones (según nombre del modelo; no se detalla desglose por componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio en tramas de 40 ms) |
| Tipos de cuantizacion | float32 (500 MB), fp16 (250 MB), int8 (201 MB) |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx`, `decoder_joint-model.onnx` y variantes `.fp16.onnx`, `.int8.onnx`), más `vocab.txt` y `config.json` |

## Arquitectura y entrenamiento

El modelo es un Conformer con decodificador TDT (Token-and-Duration Transducer). El encoder transforma características de audio (log-mel de 80 bandas con normalización por característica, según el front-end de NeMo) en un vector por cada trama de 40 ms. El decodificador y la red conjunta realizan un paso de decodificación por vez, prediciendo tanto el token como su duración. El modelo original es híbrido TDT-CTC, aunque la cabeza CTC auxiliar no se exporta a ONNX. El encoder se inicializa a partir del Conformer preentrenado MahaDhwani de AI4Bharat, con licencia MIT.

La exportación se realizó con `export_onnx.py` incluido en el repositorio, a partir del checkpoint `.nemo` original. La variante int8 se obtuvo mediante cuantización dinámica de ONNX Runtime sobre los pesos de MatMul y Gemm (las convoluciones permanecen en float32). La variante fp16 se generó con onnxconverter-common, manteniendo entradas y salidas en float32 y ajustando los casts internos del bloque de subsampling. Las versiones de las herramientas están fijadas (Python 3.11, NeMo 2.8.0rc0 en un commit concreto, torch 2.11.0, onnx 1.21.0, onnxruntime 1.32.0, onnxconverter-common 1.16.0) para reproducir los ficheros byte a byte. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en hindi con ortografía enriquecida: puntuación y numerales escritos.
- Entrada de audio a 16 kHz mono; onnx-asr remuestrea otras frecuencias de WAV.
- Decodificación greedy TDT, equivalente a la predeterminada de NeMo.
- Ejecución sin PyTorch ni NeMo: en Python con onnx-asr, en otros lenguajes con bindings de ONNX Runtime y en navegador (WebGPU para fp16, WebAssembly para int8).
- Tres variantes de precisión para adaptarse a CPU, GPU o navegador.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR ni multilingüismo fuera del hindi.

## Casos de uso

- Transcripción de audio en producción sin infraestructura de deep learning: la variante int8 (201 MB) puede ejecutarse en CPU con ONNX Runtime, lo que simplifica el despliegue en contenedores ligeros o funciones serverless.
- Subtitulado y actas de reuniones en hindi: el modelo genera puntuación y numerales escritos, lo que reduce el post-procesado necesario para publicar transcripciones legibles.
- Aplicaciones web de dictado en el navegador: la variante int8 con WebAssembly permite transcribir audio localmente sin enviar datos a un servidor, útil por privacidad.
- Procesamiento por lotes de archivos WAV: onnx-asr remuestrea automáticamente otras frecuencias, lo que facilita integrar el modelo en pipelines existentes de audio.
- Integración en aplicaciones móviles o de escritorio multiplataforma: al usar ONNX Runtime, puede incorporarse en apps nativas en distintos lenguajes sin dependencias de Python.
- Evaluación y prototipado rápido de ASR en hindi: el repositorio incluye el script de exportación y las versiones fijadas, lo que permite reproducir y comparar variantes de cuantización.
- Sistemas de accesibilidad para hablantes de hindi: transcripción en tiempo real o diferido en entornos con recursos limitados, gracias al reducido tamano del modelo.

## Benchmarks y rendimiento

La model card original reporta un WER_SCRIBE de 9,03% en FLEURS-RO. No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas con modelos similares.

| Benchmark | Resultado |
|---|---|
| WER_SCRIBE en FLEURS-RO | 9,03% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano de los pesos, float32 requiere aproximadamente 500 MB, fp16 unos 250 MB e int8 unos 201 MB, más overhead de activaciones y del front-end de audio.
- GPU recomendadas: no se especifican modelos concretos; la variante fp16 se ha probado con WebGPU en Chrome y CoreML en macOS.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1 GB de memoria libre, aunque no se detallan pruebas en modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: ONNX Runtime (Python y otros lenguajes), onnx-asr, navegador con WebGPU o WebAssembly.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de ASR en hindi del mismo tamano, contexto o rendimiento. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koyal Hindi ASR 120M (ONNX) | 120 M | no aplica (ASR) | WER_SCRIBE 9,03% en FLEURS-RO | CC-BY-4.0 | Hugging Face (ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta hindi; no se documentan capacidades multilingües.
- Es un modelo ASR: no realiza generación de texto libre, razonamiento, código ni tool calling.
- El front-end de audio (log-mel de 80 bandas con normalización) no forma parte de los ficheros ONNX; debe aportarlo onnx-asr u otra implementación compatible.
- La cabeza CTC auxiliar del modelo híbrido no se exporta, por lo que solo está disponible la decodificación TDT.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible; como todo sistema ASR, puede producir transcripciones incorrectas en audio ruidoso, con acentos no representados en el entrenamiento o con vocabulario especializado.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar las referencias de la model card original.
- El encoder se inicializa desde MahaDhwani (MIT); conviene revisar las obligaciones de atribución combinadas.
- Las versiones de las herramientas de exportación están fijadas; versiones más recientes de torch u ONNX generan ficheros con diferencias en bytes, lo que puede afectar a la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/adalat-ai/koyal-hi-120m-1.0-onnx
- Modelo original: https://huggingface.co/adalat-ai/koyal-hi-120m-1.0
- onnx-asr: https://github.com/istupakov/onnx-asr
- NeMo (NVIDIA): https://github.com/NVIDIA-NeMo/NeMo
- AI4Bharat MahaDhwani: no disponible en la información proporcionada
