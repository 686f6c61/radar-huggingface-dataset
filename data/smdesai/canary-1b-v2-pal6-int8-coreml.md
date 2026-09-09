# smdesai/canary-1b-v2-pal6-int8-coreml

## Resumen

smdesai/canary-1b-v2-pal6-int8-coreml es una conversión CoreML del modelo NVIDIA Canary-1B-v2, optimizada para ejecutarse en el Apple Neural Engine. El modelo original es un EncDecMultiTaskModel de NeMo con 1.000 millones de parámetros, basado en FastConformer, que cubre 25 idiomas europeos y tareas de reconocimiento automático del habla (ASR) y traducción automática de voz (AST). Esta variante cuantizada combina un encoder con paleta k-means de 6 bits y un decoder INT8 por canal con KV-cache, lo que reduce el consumo de RAM en iOS a 910 MB frente a los 1,9 GB del build FP16 de referencia, con una precisión que el autor afirma que coincide con la versión sin cuantizar. Es una opción relevante para aplicaciones de audio on-device en el ecosistema Apple que necesiten minimizar el consumo de memoria sin perder funcionalidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EncDecMultiTaskModel de NVIDIA NeMo (FastConformer encoder + Transformer decoder) |
| Parámetros totales | 1.000 millones (1B) del modelo base |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el preprocesador utiliza ventanas de audio de 15 s |
| Tipos de cuantización | Encoder: 6-bit k-means palette (grupos de 16); Decoder y cross-KV: INT8 per-channel |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 (requiere atribución a NVIDIA) |
| Formato de pesos | CoreML (.mlmodelc); tokenizer SentencePiece (.model) |

## Arquitectura y entrenamiento

El modelo base es un EncDecMultiTaskModel de NVIDIA NeMo, compuesto por un encoder FastConformer de 32 capas con dimensión 1024 y subsampling 8, y un decoder Transformer de 8 capas con cabeza de lenguaje de 16384 salidas. El preprocesador genera espectrogramas mel de 128 bins, 16 kHz mono, en ventanas de 15 s. Las tareas incluyen ASR y traducción de voz entre pares de los 25 idiomas soportados. Los datos de entrenamiento del modelo base no se detallan en la información proporcionada; se puede consultar el paper técnico de NVIDIA (arXiv:2509.14128).

La innovación de esta conversión es la cuantización combinada: el encoder utiliza una paleta k-means de 6 bits agrupada en 16 canales, mientras que el decoder y la proyección de cross-atention usan INT8 por canal. El diseño CoreML incluye un decoder con estado y KV-cache, lo que permite la inferencia incremental en el Apple Neural Engine. Los archivos incluyen un preprocesador mel FP32, el encoder, la proyección cross-KV, el decoder y el tokenizer SentencePiece.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos.
- Traducción automática de voz (AST) entre los idiomas soportados.
- Inferencia on-device en Apple Neural Engine, sin conexión a internet.
- Decodificación incremental con soporte de KV-cache.
- Tokenizer SentencePiece de 16384 piezas para salida de texto.
- Preprocesador mel de 128 bins, 16 kHz mono, con ventana de 15 s.
- No disponible: tool calling, agentes, visión, generación de texto libre.

## Casos de uso

- Transcripción de reuniones y entrevistas offline en iOS/macOS: el modelo se integra en una app nativa para transcribir audio localmente, aprovechando la ventana de 15 s y los 910 MB de RAM sin conexión a la red.
- Traducción de voz en tiempo real en aplicaciones de comunicación: el soporte de traducción automática de voz permite convertir un discurso en un idioma europeo a otro, por ejemplo del español al inglés, manteniendo la conversación en tiempo real.
- Dictado por voz en procesadores de texto móviles: al ser un modelo on-device, se usa para dictar documentos sin latencia de red, con salida de texto en 25 idiomas y un tokenizer de 16384 piezas.
- Subtitulado automático en reproductores de vídeo y contenido multimedia: la ventana de 15 s permite procesar el audio en bloques cortos y generar subtítulos sincronizados para películas o podcasts.
- Asistente de accesibilidad para personas con discapacidad auditiva: una app puede captar el habla del entorno y mostrar transcripciones literales o traducidas en pantalla, todo con procesamiento local y privado.
- Análisis de audio en aplicaciones de seguridad o monitorización: el modelo transcribe grabaciones de dispositivos IoT o cámaras con audio en 25 idiomas europeos, sin enviar datos a la nube.
- Investigación lingüística sobre variedades europeas: la amplia cobertura de idiomas facilita el estudio comparativo de interacciones orales en corpus multilingües, al ser un modelo compacto desplegable en centros de investigación sin hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K) para esta conversión en la información disponible. La model card aporta las siguientes mediciones de rendimiento de la familia de builds CoreML:

| Build | Encoder | Decoder | Descarga | RAM iOS |
|---|---|---|---|---|
| canary-1b-v2-coreml (FP16) | FP16 | FP16 | 1,89 GB | 1,9 GB |
| canary-1b-v2-int8-coreml | INT8 per-channel | FP16 | 1,10 GB | 1,2 GB |
| canary-1b-v2-pal6-coreml | 6-bit palette | FP16 | 0,92 GB | 1,0 GB |
| canary-1b-v2-int8full-coreml | INT8 per-channel | INT8 per-channel | 0,95 GB | 1,0 GB |
| canary-1b-v2-pal6-int8-coreml (este repo) | 6-bit palette | INT8 per-channel | 0,77 GB | 910 MB |

Latencia medida en M3 Max, en caliente: encoder ~43 ms por ventana de 15 s; decoder 2,4–3,3 ms por token.

## Requisitos de hardware

- No requiere VRAM: utiliza memoria unificada en dispositivos Apple.
- Apple Neural Engine (ANE) en Apple Silicon; las mediciones se realizaron en un M3 Max.
- Compatible con iPhone, iPad y Mac con Apple Silicon.
- Cargar con `MLComputeUnits.cpuAndNeuralEngine`; bajo `.all`, el planificador prefiere la GPU para el decoder INT8.
- RAM estimada en iOS durante la transcripción: 910 MB.
- Opciones de despliegue: apps iOS/macOS mediante Core ML (MLModel). No se indican soportes para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: encoder ~43 ms por ventana de 15 s; decoder 2,4–3,3 ms por token.

## Comparativa con modelos similares

Comparativa dentro de la familia de builds CoreML del mismo modelo base: el build FP16 original de referencia y las variantes con cuantización parcial o total.

| Modelo | Encoder | Decoder | Descarga | RAM iOS | Notas |
|---|---|---|---|---|---|
| canary-1b-v2-coreml | FP16 | FP16 | 1,89 GB | 1,9 GB | Referencia de máxima precisión |
| canary-1b-v2-int8-coreml | INT8 per-channel | FP16 | 1,10 GB | 1,2 GB | Menor tamaño de encoder |
| canary-1b-v2-pal6-coreml | 6-bit palette | FP16 | 0,92 GB | 1,0 GB | Encoder más compacto |
| canary-1b-v2-int8full-coreml | INT8 per-channel | INT8 per-channel | 0,95 GB | 1,0 GB | Todo INT8, más ligero que FP16 |
| canary-1b-v2-pal6-int8-coreml (este) | 6-bit palette | INT8 per-channel | 0,77 GB | 910 MB | Build más pequeño y con menos RAM |
| nvidia/canary-1b-v2 | FP16 | FP16 | no disponible | no aplica | Original en NeMo, no convertido a CoreML |

## Limitaciones y advertencias

- La cuantización 6-bit/INT8 puede introducir discrepancias menores frente al modelo FP16; el autor afirma que la precisión coincide con la referencia, pero no se aportan métricas objetivas.
- Modelo específico para audio: no es un LLM de propósito general, no genera texto libre ni mantiene conversaciones.
- Dependencia de CoreML y Apple Silicon: no se puede desplegar en GPU NVIDIA o AMD.
- Ventana de audio fija de 15 s: se requiere lógica de streaming para transcribir audio largo.
- Licencia CC-BY-4.0: exige atribución a NVIDIA por el modelo original.
- No se dispone de evaluaciones de sesgos ni de robustez frente a ruido, acentos o variaciones dialectales en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: <https://huggingface.co/smdesai/canary-1b-v2-pal6-int8-coreml>
- Modelo base NVIDIA: <https://huggingface.co/nvidia/canary-1b-v2>
- Paper técnico: <https://arxiv.org/html/2509.14128v2>
- Build FP16 de referencia: <https://huggingface.co/smdesai/canary-1b-v2-coreml>
- Build INT8 encoder: <https://huggingface.co/smdesai/canary-1b-v2-int8-coreml>
- Build 6-bit encoder: <https://huggingface.co/smdesai/canary-1b-v2-pal6-coreml>
- Build INT8 full: <https://huggingface.co/smdesai/canary-1b-v2-int8full-coreml>
- Build 180M Flash: <https://huggingface.co/smdesai/canary-180m-flash-coreml>
