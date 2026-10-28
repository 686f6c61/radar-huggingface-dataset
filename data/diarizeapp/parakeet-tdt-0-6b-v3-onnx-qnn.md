# diarizeapp/parakeet-tdt-0.6b-v3-onnx-qnn

## Resumen

`diarizeapp/parakeet-tdt-0.6b-v3-onnx-qnn` es una compilación precompilada en formato ONNX `EPContext` del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3`, empaquetada por el usuario `diarizeapp` para ejecutarse sobre la NPU Hexagon de los SoC Snapdragon X Elite (SM8380). No se trata de un modelo nuevo ni de un reentrenamiento: los pesos y la topología son los del modelo de NVIDIA (aproximadamente 600 millones de parámetros, encoder FastConformer más decodificador TDT), convertidos a fp16 y compilados contra la toolchain QAIRT `2.50.40.260831140417` de Qualcomm. El problema que resuelve es la transcripción multilingüe (25 idiomas europeos) en local y sin GPU dedicada, aprovechando la NPU de portátiles ARM con Windows.

Su relevancia es fundamentalmente de despliegue: los binarios `audio_encoder_ctx.onnx` y `decoder_joint_ctx.onnx` permiten ejecutar un ASR de calidad competitiva en un portátil Snapdragon X Elite con un factor de tiempo real (RTF) declarado de 0,0114, es decir, unas 87 veces más rápido que el tiempo real, con 1704,1 tokens/s de decodificación. El precio es una portabilidad muy limitada: el artefacto está atado al dispositivo SM8380 y a una versión concreta del SDK, y el bucle de decodificación TDT, el preprocesado log-mel y la detokenización deben implementarse en el host, ya que no forman parte de los grafos compilados.

El repositorio ocupa 1,3 GB e incluye, además de los dos grafos, los ficheros auxiliares necesarios para reconstruir el pipeline completo (`mel_filters.npy`, `mel_window.npy`, `pred_embed_fp16.npy`, `vocab.txt`, `model_meta.json` y `metadata.json` con las formas tensoriales exactas). La licencia del modelo subyacente es CC-BY-4.0, con obligación de atribución a NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder convolucional autoatentivo) + TDT (Token-and-Duration Transducer: prediction network, joint network y decodificación greedy con duraciones) |
| Parámetros totales | ~600 millones (heredados de `nvidia/parakeet-tdt-0.6b-v3`) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica en sentido textual; ventana de audio de hasta 19,99 s por fragmento (`enc_frames` = 2000 tramas de mel, salida de 250 tramas, 80 ms por paso de decodificación) |
| Tipos de cuantización | fp16 en los grafos `EPContext`; el autor compara contra grafos fp32 en CPU. No se publican variantes INT8, GGUF ni AWQ |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finlandés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | cc-by-4.0 (atribución a NVIDIA obligatoria) |
| Formato de pesos | ONNX `EPContext`: `audio_encoder_ctx.onnx` + `.bin` y `decoder_joint_ctx.onnx` + `.bin`; auxiliares en `.npy`, `.json` y `vocab.txt` |
| Entrada de audio | 16 kHz, mono, float32; ventana Hann de 400 muestras, hop de 160, FFT de 512, 128 filtros mel, 257 bins de rfft |
| Vocabulario | 8193 identificadores SentencePiece (8192 tokens + blank en la última posición); logits de salida 8198 (8193 tokens + 5 duraciones: 0, 1, 2, 3, 4) |
| Dispositivo objetivo | Qualcomm Snapdragon X Elite, SM8380 (NPU Hexagon) |
| Toolchain | QAIRT `2.50.40.260831140417` |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo original de NVIDIA: un encoder FastConformer que subsamplea la señal de audio por un factor de 8 (2000 tramas de mel de entrada producen 250 tramas de salida de dimensión 640) y un cabezal TDT (*Token-and-Duration Transducer*). A diferencia de un CTC o de un transducer clásico, el joint network de TDT emite simultáneamente, por cada paso, una distribución sobre el vocabulario (8193 clases, incluida blank) y una distribución sobre duraciones discretas (0 a 4 tramas). El decodificador greedy del host elige el argmax de cada distribución, avanza el estado recurrente (`h`, `c`, de 640 dimensiones) solo cuando emite un token distinto de blank y desplaza la posición temporal según la duración predicha, con un límite de 10 símbolos por trama para evitar bucles. Esto reduce el número de pasos frente a un transducer convencional y es la causa del alto throughput declarado.

Este repositorio **no contiene información sobre entrenamiento**: no se documentan tokens de audio vistos, composición del corpus, idiomas por los que se ponderó el dataset, ni si hubo ajuste con RLHF/DPO (poco habitual en ASR). Tampoco se detalla ninguna innovación propia del compilador: la aportación del autor es la conversión a ONNX, la compilación `EPContext` para la NPU y la documentación exacta del bucle de host (troceado en fragmentos de hasta 19,99 s cortando en el bin de 50 ms más silencioso de los últimos 2 s, preprocesado log-mel estilo NeMo con preénfasis 0,97, normalización por media y desviación típica por característica, padding a 2000 tramas y detokenización sustituyendo U+2581 por espacio).

## Capacidades

- Reconocimiento automático del habla en 25 idiomas europeos, con un único modelo multilingüe.
- Transcripción de audio de hasta ~20 s por fragmento, con concatenación posterior de resultados en el host.
- Decodificación greedy TDT con timestamps implícitos: cada trama de salida corresponde a 80 ms y el autor documenta que la trama `t` empieza en `t * 0,08` s dentro de su fragmento.
- Ejecución íntegra en la NPU del Snapdragon X Elite, con el preprocesado mel y la decodificación residiendo en CPU.
- Salida de texto en piezas SentencePiece, detokenizable con `vocab.txt` (índice de línea = id, separación solo por `\n`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio-generación ni modo "thinking": es exclusivamente un modelo ASR.
- No se documenta puntuación, capitalización, marcas de hablante (diarización) ni detección de idioma automática dentro del propio modelo.

## Casos de uso

- **Dictado y transcripción offline en portátiles ARM con Windows**: el modelo se ejecuta sobre la NPU de un Snapdragon X Elite sin GPU dedicada ni conexión a internet, lo que permite transcribir reuniones o notas de voz manteniendo el audio en el dispositivo; encaja por su RTF de 0,0114 y su ventana de 19,99 s por fragmento.
- **Subtitulado y actas de reuniones**: troceando el audio en fragmentos cortados por silencios y concatenando las salidas, se pueden generar transcripciones de vídeo o de llamadas con marcas temporales de 80 ms de granularidad, suficientes para alinear subtítulos.
- **Analítica de contact center en lote**: al ser un modelo de 600 M en fp16 ejecutable en NPU, permite procesar grandes volúmenes de grabaciones en servidores con aceleradores Qualcomm o en estaciones de trabajo ARM, extrayendo texto para sistemas de clasificación y búsqueda posteriores.
- **Procesamiento previo a diarización**: el nombre del autor (`diarizeapp`) y la salida con timestamps permiten usar este modelo como primer eslabón de un pipeline de "quién dijo qué", alimentando un motor de segmentación de hablantes con la transcripción ya alineada temporalmente.
- **Accesibilidad y subtitulado en vivo con latencia baja**: un RTF de 0,0114 deja margen para ventanas deslizantes casi en tiempo real en un portátil, útil para personas con discapacidad auditiva en entornos presenciales sin infraestructura cloud.
- **Procesamiento de audio confidencial en entornos regulados**: sanidad, legal o administración pública donde el audio no puede salir del dispositivo; la licencia CC-BY-4.0 permite uso comercial con atribución y la inferencia es completamente local.
- **Transcripción multilingüe de soporte técnico**: con 25 idiomas cubiertos, se puede enrutar audio de soporte en español, francés, alemán, polaco o rumano a un único modelo en lugar de mantener un despliegue por idioma.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son una comparación de 5 clips contra los grafos fp32 en CPU. No hay resultados de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM.

| Métrica | Valor declarado | Condiciones |
|---|---|---|
| CER macro | 0,0 | 5 clips, frente a grafos fp32 en CPU |
| WER micro | 0,0 | 5 clips, frente a grafos fp32 en CPU |
| Peor clip (CER) | 0,0 | 5 clips |
| RTF medio | 0,0114 | ~87,7 veces más rápido que el tiempo real |
| Throughput de decodificación | 1704,1 tokens/s | Decodificación greedy TDT en NPU |

Advertencia: la muestra de evaluación es de 5 clips, por lo que estos valores miden la fidelidad de la compilación frente a la referencia en CPU, no la calidad absoluta del reconocimiento. No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, FLEURS u otros) en la información disponible.

## Requisitos de hardware

- **Acelerador**: NPU Hexagon de un Snapdragon X Elite (SM8380). Los binarios `EPContext` no son portables a otras NPU, GPU ni CPU sin recompilación.
- **Toolchain**: QAIRT `2.50.40.260831140417`; otras versiones del SDK requieren reconstruir con `parakeet_tdt_pipeline.py`.
- **VRAM**: no disponible; al ejecutarse en NPU no se especifica memoria dedicada. El repositorio completo ocupa 1,3 GB, lo que da una cota superior del espacio de almacenamiento necesario.
- **Memoria del sistema**: el preprocesado log-mel (NumPy/SciPy) y el bucle de decodificación corren en CPU; el tensor de mel se rellena a `[1, 128, 2000]` por fragmento.
- **GPU dedicadas (A100, H100, RTX 4090)**: no aplica a este artefacto; para esas GPU habría que usar el modelo original en PyTorch/NeMo o exportar a otro backend.
- **Opciones de despliegue**: ONNX Runtime con el Execution Provider QNN sobre el `EPContext` compilado. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no son adecuados para un modelo transducer de ASR).
- **Latencia y throughput**: RTF medio 0,0114 y 1704,1 tokens/s según el autor; el coste real por fragmento incluye el preprocesado mel en CPU y la copia de tensores a la NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana | Licencia | Formato | Despliegue | Rendimiento |
|---|---|---|---|---|---|---|
| Este build (`diarizeapp/...-onnx-qnn`) | ~600 M | 19,99 s por fragmento | CC-BY-4.0 | ONNX `EPContext` fp16 | NPU Snapdragon X Elite, QAIRT 2.50.40 | RTF 0,0114; CER/WER 0,0 en 5 clips frente a fp32 CPU |
| `nvidia/parakeet-tdt-0.6b-v3` (upstream) | ~600 M | no disponible en la información proporcionada | CC-BY-4.0 | no disponible en la información proporcionada | NeMo / PyTorch (GPU o CPU) | no disponible en la información proporcionada |
| Alternativas de ASR multilingüe de la misma categoría (p. ej. Whisper large-v3, NVIDIA Canary-1B) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

La comparación relevante es contra el modelo original de NVIDIA: misma arquitectura y mismos pesos, con la diferencia de que este build gana en eficiencia energética y latencia sobre NPU pero pierde portabilidad y obliga a reimplementar el pipeline en el host.

## Limitaciones y advertencias

- **Evaluación muy reducida**: los resultados de CER/WER 0,0 provienen de 5 clips y miden paridad con la referencia fp32, no calidad absoluta; no deben citarse como evidencia de precisión en producción.
- **Portabilidad nula**: los grafos están compilados para SM8380 y QAIRT `2.50.40.260831140417`. Cualquier otro dispositivo o versión del SDK exige reconstrucción con `parakeet_tdt_pipeline.py`.
- **No es un paquete listo para usar**: el repo no incluye el bucle de inferencia; el integrador debe implementar troceado, log-mel estilo NeMo, normalización por media/desviación, decodificación TDT con estado recurrente y detokenización siguiendo la documentación.
- **Cortes en fronteras de fragmento**: los fragmentos se limitan a 19,99 s y se cortan en el bin de 50 ms más silencioso de los últimos 2 s; en audio continuo sin pausas puede truncarse alguna palabra.
- **Sin streaming nativo**: el diseño es por fragmentos completos, no incremental; la latencia mínima práctica viene impuesta por el tamaño del fragmento.
- **Idiomas sin métricas por idioma**: se listan 25 lenguas, pero no se publica WER desagregado; el rendimiento en maltés, estonio o esloveno es desconocido.
- **Riesgo de alucinación típico de ASR**: en silencios, ruido o solapamiento de voces el decodificador greedy puede emitir texto espurio; se recomienda aplicar detección de actividad de voz y umbrales de confianza.
- **Sin puntuación ni capitalización documentadas**: la salida es texto plano detokenizado (U+2581 → espacio, `strip`), sin marcas de hablante.
- **Licencia CC-BY-4.0**: permite uso comercial, pero exige atribución a NVIDIA; el autor recomienda verificar la model card original antes de redistribuir.
- **Soporte del autor**: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento.

## Enlaces

- [HuggingFace: diarizeapp/parakeet-tdt-0.6b-v3-onnx-qnn](https://huggingface.co/diarizeapp/parakeet-tdt-0.6b-v3-onnx-qnn)
- [Modelo base: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
