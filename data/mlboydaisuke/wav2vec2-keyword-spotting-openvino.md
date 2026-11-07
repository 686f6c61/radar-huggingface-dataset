# mlboydaisuke/wav2vec2-keyword-spotting-OpenVINO

## Resumen

wav2vec2-keyword-spotting-OpenVINO es una conversión y empaquetado para inferencia del modelo de detección de palabras clave (keyword spotting) `litert-community/wav2vec2-keyword-spotting`, publicado por el usuario mlboydaisuke. El repositorio no contiene pesos entrenados nuevos, sino los mismos grafos del modelo base exportados a ONNX (opset 17, generados con tf2onnx 1.17.0), a formato OpenVINO IR con pesos fp32 y a blobs precompilados para la NPU integrada de Intel (Intel AI Boost). El objetivo es ejecutar la clasificación de audio en CPUs, iGPUs y NPUs de Intel sin depender de LiteRT ni de TensorFlow.

El modelo se compone de dos grafos separados: un frontend (`w2v2_frontend_fp16`, 18,4 MB en ONNX) que extrae representaciones del audio, y una cabeza clasificadora (`w2v2_head_fp16`, 360,6 MB en ONNX) que produce las puntuaciones por clase. Ambos derivan de la arquitectura wav2vec2 de Meta, adaptada a la tarea de keyword spotting y cuantizada en origen por LiteRT; el repositorio redistribuye esa versión bajo licencia Apache 2.0.

La relevancia de esta ficha es práctica: documenta latencias medidas en hardware Intel y Qualcomm y advierte de una discrepancia numérica relevante en el frontend cuando se ejecuta en la NPU (coseno de 0,8997 frente a la salida de referencia en CPU), lo que condiciona su uso en producción. El pipeline declarado es `audio-classification` y la librería, `openvino`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder) dividido en frontend y cabeza clasificadora |
| Parametros totales | no disponible (el repositorio solo publica tamanos de fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no documentada en la informacion disponible) |
| Tipos de cuantizacion | fp16 en los grafos de origen; pesos fp32 en el IR de OpenVINO; blobs NPU precompilados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml/.bin) y blobs de NPU (.blob) |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2, un modelo de representación auto-supervisada de audio basado en un extractor convolucional de características seguido de un encoder transformer. En este repositorio el modelo aparece dividido en dos subgrafos: el frontend, que procesa la señal de audio, y la cabeza, que contiene las capas fully connected de clasificación. El modelo base (`litert-community/wav2vec2-keyword-spotting`) es una versión ya ajustada y cuantizada para la tarea de detección de palabras clave, y esta publicación se declara explícitamente como una relación de cuantización (`base_model_relation: quantized`) respecto a él.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el vocabulario de palabras clave ni si hubo RLHF o DPO; la model card se limita a la conversión y a las mediciones. La innovación técnica destacable es el proceso de conversión: tf2onnx 1.17.0 descarta el sesgo de 24 capas FULLY_CONNECTED de la cabeza, por lo que el autor aplicó un parche de una línea (`convert/patch_tf2onnx.py` en el repositorio de GitHub) para preservarlo; con el parche, las salidas coinciden con el `.tflite` original (coseno ≥ 0,9999). Los blobs de NPU se compilaron con OpenVINO 2026.4.1 y el driver de NPU de Intel 32.0.100.4841.

## Capacidades

- Clasificación de audio orientada a detección de palabras clave (keyword spotting): produce puntuaciones por clase a partir de una entrada de audio.
- Inferencia en CPU, iGPU y NPU de Intel mediante OpenVINO, y en GPU NVIDIA mediante ONNX Runtime con el execution provider CUDA.
- Ejecución en NPU de Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante ONNX Runtime con el execution provider QNN, según las mediciones de Qualcomm AI Hub.
- Exportación a ONNX estándar (opset 17), lo que permite integrarlo en pipelines que ya usen ONNX Runtime.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking; es un clasificador de audio, no un modelo generativo.
- Capacidades multilingües: no disponibles; no se documenta el conjunto de palabras clave ni los idiomas cubiertos.

## Casos de uso

- Detección de palabras de activación en dispositivos de borde: el blob de NPU del frontend se ejecuta en 7,53 ms y el de la cabeza en 6,87 ms en una Core Ultra 9 386H, lo que permite integrar la detección en asistentes locales sin enviar audio a la nube.
- Procesamiento de audio en portátiles con Intel Core Ultra: al usar la NPU integrada, la inferencia libera CPU y GPU para otras tareas del sistema, con una latencia combinada de aproximadamente 14,4 ms por par de ejecuciones.
- Aplicaciones de accesibilidad con activación por voz: la baja latencia y el tamaño reducido del frontend (18,4 MB) permiten mantener el detector siempre activo en segundo plano con un consumo energético bajo.
- Clasificación por lotes en servidores sin GPU: la ejecución en CPU con ONNX Runtime (12,05 ms para el frontend y 17,71 ms para la cabeza) ofrece una alternativa determinista para procesar archivos de audio en pipelines de datos.
- Integración en aplicaciones Windows nativas: el formato OpenVINO IR se carga directamente desde C++ o Python con la API de OpenVINO, sin necesidad de LiteRT ni TensorFlow, lo que simplifica el empaquetado de aplicaciones de escritorio.
- Prototipado en móviles Android con Snapdragon: los mismos ficheros ONNX se perfilan en Qualcomm AI Hub (11,32 ms en la NPU del Snapdragon X2 Elite), lo que permite validar la latencia antes de portar la aplicación.
- Investigación en eficiencia de inferencia: el repositorio incluye scripts, registros en bruto y una tabla comparativa de 52 grafos de LiteRT-Models, útil para estudios comparativos de runtimes y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (accuracy, F1) en la información disponible. Los únicos datos publicados son latencias por componente y verificaciones de equivalencia numérica frente a la salida de referencia en CPU (coseno ≥ 0,99, sin NaN ni Inf).

| Componente | Procesador | Runtime | ms | Carga (s) | Verificacion |
|---|---|---|---|---|---|
| Frontend | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 7,53 | 0,01 | FAIL: cos 0,8997 |
| Frontend | Intel AI Boost NPU | ONNX Runtime + OpenVINO EP | 9,61 | 1,82 | FAIL: cos 0,8999 |
| Frontend | Intel Graphics (iGPU) | ONNX Runtime + OpenVINO EP | 4,26 | 0,35 | PASS (cos ≥ 0,9999) |
| Frontend | RTX 5080 Laptop (95 W) | ONNX Runtime CUDA EP (fp16) | 1,51 | 1,13 | PASS (cos ≥ 0,9999) |
| Frontend | Core Ultra 9 386H CPU | ONNX Runtime CPU EP | 12,05 | 0,05 | referencia |
| Frontend | Snapdragon X2 Elite NPU | Qualcomm AI Hub (QNN) | 11,32 | 0,37 | no comparado |
| Cabeza | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 6,87 | 0,11 | PASS (cos ≥ 0,9999) |
| Cabeza | Intel AI Boost NPU | ONNX Runtime + OpenVINO EP | 7,27 | 19,44 | PASS (cos ≥ 0,9999) |
| Cabeza | Intel Graphics (iGPU) | ONNX Runtime + OpenVINO EP | 6,72 | 2,89 | PASS (cos ≥ 0,9999) |
| Cabeza | RTX 5080 Laptop (95 W) | ONNX Runtime CUDA EP (fp16) | 7,52 | 1,24 | PASS (cos ≥ 0,9992) |
| Cabeza | Core Ultra 9 386H CPU | ONNX Runtime CPU EP | 17,71 | 0,47 | referencia |

Medición realizada en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con alimentación de red), con mediana de 30 ejecuciones tras 5 de calentamiento, entrada y salida en numpy y un proceso a la vez.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,0 GB en total, con un ONNX de cabeza de 360,6 MB y un frontend de 18,5 MB. En GPU la carga es mínima y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 5080 Laptop (medida), así como cualquier GPU NVIDIA compatible con CUDA EP de ONNX Runtime; en Intel, la iGPU integrada obtiene las mejores latencias del conjunto (4,26 ms y 6,72 ms).
- Cabe en GPU consumer: sí; el modelo completo en fp16 ocupa menos de 400 MB en los grafos ONNX, por lo que cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo.
- Despliegue: OpenVINO (IR y blobs de NPU), ONNX Runtime con execution providers CPU, OpenVINO, CUDA y QNN, y Qualcomm AI Hub para perfilar en Snapdragon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia: 1,51–12,05 ms para el frontend y 6,72–17,71 ms para la cabeza según procesador; en NPU Intel, 7,53 ms y 6,87 ms respectivamente.
- Throughput: no disponible; las mediciones son de una sola ejecución por proceso, no de procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlboydaisuke/wav2vec2-keyword-spotting-OpenVINO | no disponible | no disponible | Latencias medidas en CPU, iGPU, NPU Intel y NPU Qualcomm; sin métricas de precisión | Apache 2.0 | Hugging Face, ONNX + OpenVINO IR + blobs NPU |
| litert-community/wav2vec2-keyword-spotting (modelo base) | no disponible | no disponible | Sin métricas de precisión publicadas en la información disponible | no disponible | Hugging Face, formato LiteRT (.tflite) |
| sampras343/wav2vec2-keyword-spotting-int8 | no disponible | no disponible | Cuantizado con Optimum OpenVINO a partir de anton-l/wav2vec2-base-ft-keyword-spotting | no disponible | Hugging Face, OpenVINO |
| Amirhossein75/Keyword-Spotting | no disponible | no disponible | Sin datos en la información disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El frontend ejecutado en la NPU de Intel no supera la verificación de equivalencia numérica: coseno de 0,8997–0,8999 frente al umbral de 0,99 exigido por el propio autor. Esto implica que las salidas en NPU pueden diferir de forma apreciable de las de CPU y condiciona su uso en producción sin una validación de precisión específica.
- Los blobs de NPU están compilados para OpenVINO 2026.4.1 y el driver de NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlos y es necesario recompilar el IR.
- No se publican métricas de precisión (accuracy, F1, tasa de falsos positivos) ni el conjunto de palabras clave detectadas, por lo que no es posible evaluar la calidad del clasificador a partir de esta ficha.
- Riesgo de alucinación no aplicable (no es un modelo generativo); el riesgo equivalente es la clasificación errónea de audio fuera de distribución o con ruido de fondo, no cuantificado en la información disponible.
- No se documentan sesgos, cobertura lingüística ni comportamiento con acentos o idiomas distintos de los del dataset de entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base de LiteRT conviene verificar las condiciones de ese repositorio original antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- La ejecución con ONNX Runtime y OpenVINO EP en la NPU de la cabeza tiene un tiempo de carga de 19,44 s, lo que puede ser problemático en flujos con arranques frecuentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/wav2vec2-keyword-spotting-OpenVINO
- Modelo base: https://huggingface.co/litert-community/wav2vec2-keyword-spotting
- Repositorio GitHub con scripts y tabla comparativa: https://github.com/john-rocky/windows-zoo
- Modelo comparable sampras343/wav2vec2-keyword-spotting-int8: https://huggingface.co/sampras343/wav2vec2-keyword-spotting-int8
- Modelo comparable Amirhossein75/Keyword-Spotting: https://huggingface.co/Amirhossein75/Keyword-Spotting
