# adalat-ai/koyal-kn-120m-1.0-onnx

## Resumen

Koyal Kannada ASR 120M (ONNX) es la exportación a formato ONNX del modelo de reconocimiento automático del habla `adalat-ai/koyal-kn-120m-1.0`, desarrollado por Adalat AI para transcribir audio en kannada (kn). El modelo emplea una arquitectura NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) y un total de 120 millones de parámetros, lo que lo sitúa en la gama ligera de modelos ASR, apto para despliegue en CPU y en entornos con recursos limitados.

La relevancia de esta versión ONNX radica en que elimina la dependencia de PyTorch y NeMo para la inferencia: los grafos exportados pueden ejecutarse con ONNX Runtime en Python, en otros lenguajes con bindings de ONNX Runtime o directamente en el navegador mediante WebAssembly o WebGPU. El repositorio incluye tres variantes de precisión (float32, fp16 e int8) que cubren desde servidores con GPU hasta navegadores, con un tamaño mínimo de 201 MB para la variante int8.

El modelo transcribe en ortografía rica, es decir, con puntuación y numerales escritos tal como aparecerían en un documento mecanografiado, y reporta un WER_SCRIBE del 11,30% sobre FLEURS-RO según la model card original. Está publicado bajo licencia CC-BY-4.0 y su encoder se inicializa a partir del Conformer preentrenado MahaDhwani de AI4Bharat, de licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer); modelo híbrido TDT-CTC (la cabeza CTC auxiliar no se exporta) |
| Parametros totales | 120 millones (según nombre del modelo; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por frames de 40 ms; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | float32, fp16, int8 (cuantización dinámica de pesos MatMul y Gemm; convoluciones en float32) |
| Idiomas soportados | kannada (kn) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx` / `decoder_joint-model.onnx` en variantes float32, fp16 e int8), más `vocab.txt` y `config.json` |

## Arquitectura y entrenamiento

El modelo es un Conformer (transformer convolucional) con decodificador TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por bloques y reduce la latencia frente a un transducer clásico. El checkpoint original es híbrido TDT-CTC, aunque la exportación ONNX solo incluye la cabeza TDT. El encoder transforma las características acústicas en un vector por cada frame de 40 ms, y el decoder + joint network ejecuta un paso de decodificación por invocación. La decodificación es greedy TDT, equivalente a la configuración por defecto de NeMo.

El front end acústico (80 bandas log-mel con normalización por característica, según NeMo) no forma parte de los ficheros ONNX; lo aporta la librería `onnx-asr`. El encoder se inicializa desde el Conformer preentrenado MahaDhwani de AI4Bharat. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card remite a la ficha del modelo original para esos datos. La exportación se realizó con versiones fijadas (Python 3.11, NeMo 2.8.0rc0 en el commit indicado, torch 2.11.0, onnx 1.21.0, onnxruntime 1.32.0, onnxconverter-common 1.16.0), que reproducen los ficheros byte a byte.

## Capacidades

- Reconocimiento automático del habla en kannada a partir de audio de 16 kHz mono.
- Transcripción en ortografía rica: incluye puntuación y numerales escritos, como en un documento mecanografiado.
- Decodificación greedy TDT, con el mismo comportamiento que la configuración por defecto de NeMo.
- Ejecución sin PyTorch ni NeMo: en Python vía `onnx-asr`, en otros lenguajes mediante bindings de ONNX Runtime y en navegador con WebAssembly (int8) o WebGPU (fp16).
- Re-muestreo automático de WAV con frecuencias distintas de 16 kHz por parte de `onnx-asr`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de voz ni modo thinking.

## Casos de uso

- Transcripción de reuniones y entrevistas en kannada: el modelo convierte audio de 16 kHz en texto con puntuación y numerales, adecuado para actas y notas que requieran formato legible sin postprocesado intensivo.
- Subtitulado de vídeo y audio bajo demanda: la variante int8 (201 MB) permite generar subtítulos en kannada en servidores CPU sin GPU dedicada, integrable en pipelines de procesamiento por lotes.
- Aplicaciones web de dictado en el navegador: con la variante int8 y WebAssembly, o fp16 y WebGPU en Chrome, la transcripción puede ejecutarse en el cliente sin enviar audio a un servidor, lo que reduce latencia y protege la privacidad.
- Digitalización de archivos orales en kannada: la salida en ortografía rica con numerales escritos facilita la indexación y búsqueda en corpus documentales transcritos.
- Asistentes de voz para atención al ciudadano en kannada: al ejecutarse en CPU con int8, puede desplegarse en infraestructura modesta para transcripción de consultas en servicios públicos o líneas de atención.
- Investigación lingüística y creación de corpus: el modelo sirve para generar transcripciones anotadas de grabaciones en kannada que alimenten estudios fonéticos o entrenamiento de otros sistemas.
- Integración en aplicaciones de escritorio o móviles multiplataforma: al ser ONNX, puede embeberse mediante bindings de ONNX Runtime en C++, Java, C# o Rust sin arrastrar el stack de PyTorch.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| FLEURS-RO (kannada) | WER_SCRIBE 11,30% | Dato de la model card original, citado en esta ficha |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de ficheros, la variante float32 ocupa 500 MB, la fp16 250 MB y la int8 201 MB en disco y en memoria durante la carga.
- GPU recomendadas: la variante fp16 está probada con WebGPU en Chrome y CoreML en macOS; la float32 es apta para CPU o GPU; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por el reducido tamaño de los grafos (máximo 500 MB en float32), aunque la model card no enumera tarjetas concretas.
- Opciones de despliegue: `onnx-asr` en Python (con extra `[cpu,hub]`), ONNX Runtime en otros lenguajes, WebAssembly en navegador (int8) y WebGPU (fp16).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koyal Kannada ASR 120M (ONNX) | 120 M | no aplica (ASR por frames de 40 ms) | WER_SCRIBE 11,30% en FLEURS-RO | CC-BY-4.0 | Hugging Face, ONNX |
| adalat-ai/koyal-kn-120m-1.0 (original) | 120 M | no aplica | WER_SCRIBE 11,30% en FLEURS-RO (según model card original) | CC-BY-4.0 | Hugging Face, formato NeMo `.nemo` |
| Conformer MahaDhwani (AI4Bharat) | no disponible | no disponible | no disponible | MIT | Hugging Face (referenciado como inicialización del encoder) |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables para establecer una comparación numérica más amplia.

## Limitaciones y advertencias

- El modelo solo soporta kannada (kn); no se documentan otros idiomas.
- Es un modelo ASR: no procesa texto ni imágenes, y no ofrece tool calling ni razonamiento multi-paso.
- Riesgo de alucinación en la transcripción: como todo sistema ASR, puede generar texto plausible pero incorrecto en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; la información disponible no cuantifica este riesgo.
- Sesgos conocidos: no se detallan en la información proporcionada; la model card remite a la ficha del modelo original para limitaciones y usos previstos.
- El front end acústico (log-mel de 80 bandas) no está incluido en los ficheros ONNX y debe aportarlo `onnx-asr`; un uso con otro front end puede degradar la precisión.
- La cabeza CTC auxiliar del modelo híbrido no se exporta; solo está disponible la decodificación TDT greedy.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar las referencias de la model card original al usar los ficheros.
- El encoder deriva del Conformer MahaDhwani de AI4Bharat (MIT); conviene verificar el cumplimiento de ambas licencias en producción.
- La exportación reproducible requiere versiones fijadas de torch, onnx y onnxruntime; versiones más recientes producen ficheros distintos en bytes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/adalat-ai/koyal-kn-120m-1.0-onnx
- Modelo original: https://huggingface.co/adalat-ai/koyal-kn-120m-1.0
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- NeMo Toolkit (NVIDIA): https://github.com/NVIDIA-NeMo/NeMo
- Script de exportación: `export_onnx.py`, incluido en el repositorio de Hugging Face
