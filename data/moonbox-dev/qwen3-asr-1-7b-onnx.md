# moonbox-dev/Qwen3-ASR-1.7B-ONNX

## Resumen

Qwen3-ASR-1.7B-ONNX es una compilación en formato ONNX del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba y convertido a ONNX por moonbox-dev para su uso en dispositivos con ONNX Runtime (CPU, CUDA y DirectML). El objetivo es ofrecer una alternativa de inferencia local optimizada, sin dependencia de PyTorch, manteniendo una calidad de transcripción prácticamente idéntica al modelo original.

El paquete incluye tres precisiones (fp16, int8 e int4), cada una en su propia carpeta con los grafos ONNX del codificador de audio, el decoder y el módulo de embeddings, además de un pequeño pipeline en Python que gestiona la extracción de características, la construcción del prompt y el bucle de decodificación. El repositorio ocupa 8,5 GB en total, aunque cada precisión individual pesa entre aproximadamente 2,5 GB (int8) y 4,7 GB (fp16).

La relevancia de esta versión radica en su enfoque *on-device*: permite ejecutar un modelo ASR multilingüe de 1.700 millones de parámetros en hardware modesto, con tasas de error por palabra (WER) por debajo del 1,5 % en el conjunto de evaluación LibriSpeech test-clean y con soporte para chino (AISHELL-1). La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (arquitectura Qwen3-ASR, detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16, int8, int4 |
| Idiomas soportados | Multilingue; evaluado en ingles (LibriSpeech) y chino (AISHELL-1); lista completa de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos separados: audio_encoder.onnx, decoder.onnx, embed.onnx, con ficheros .onnx.data asociados) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-ASR-1.7B, un sistema de reconocimiento automático del habla de la familia Qwen3. La conversión a ONNX separa el modelo en tres componentes principales: un codificador de audio que procesa las características mel, un módulo de embeddings y un decoder autorregresivo. Cada precisión incluye además un fichero `mel_filters.npy` con los filtros mel y scripts auxiliares (`pipeline.py`, `ortllm.py`) que implementan la lógica de preprocesado y decodificación.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original de Qwen3-ASR-1.7B (referenciada pero no incluida) sería la fuente para esos datos. La innovación técnica destacable de esta versión es la conversión a ONNX Runtime con soporte para ejecución en CPU, CUDA y DirectML, manteniendo una fidelidad muy alta respecto al modelo PyTorch original: en fp16, 398 de 400 transcripciones de LibriSpeech y 200 de 200 de AISHELL-1 son idénticas al original.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y chino, con evaluación cuantificada en ambos idiomas.
- Transcripción de audio con tasas de error muy bajas: WER 1,43 % en LibriSpeech test-clean (fp16) y CER 1,49-1,52 % en AISHELL-1.
- Ejecución en múltiples backends de ONNX Runtime: CPU, CUDA (GPU NVIDIA) y DirectML (GPU en Windows).
- Inferencia en dispositivo (*on-device*) sin dependencia de PyTorch ni de frameworks de deep learning pesados.
- Tres niveles de precisión que permiten ajustar el equilibrio entre calidad y requisitos de recursos.
- Soporte multilingüe declarado en los tags del repositorio, aunque la evaluación pública se limita a inglés y chino.
- No se menciona soporte de tool calling, function calling, agentes ni modos de razonamiento extendido, ya que se trata de un modelo especializado en ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo puede procesar audio grabado en el dispositivo sin enviar datos a la nube, gracias a su ejecución mediante ONNX Runtime en CPU o GPU. Adecuado para aplicaciones de privacidad estricta.
- Subtitulado automático de vídeo en tiempo casi real: con un RTF (factor de tiempo real) de 0,059 en int4 con CUDA, el modelo procesa audio aproximadamente 17 veces más rápido que tiempo real, lo que permite generar subtítulos en directo en un flujo de producción.
- Asistentes de voz integrados en aplicaciones de escritorio Windows: el soporte de DirectML permite desplegar el modelo en equipos con GPU integrada o dedicada sin CUDA, ampliando el parque de hardware compatible.
- Dictado y accesibilidad: integración en herramientas de escritura por voz para usuarios con movilidad reducida, ejecutándose en el propio equipo con latencia baja y sin conexión.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la versión int8 con backend CPU (RTF 19, según la model card) permite transcribir grandes volúmenes de audio en infraestructura convencional, priorizando el coste frente a la latencia.
- Transcripción bilingüe inglés-chino en entornos de atención al cliente: el modelo cubre ambos idiomas con calidad medida, útil para empresas con operaciones en mercados anglófonos y sinófonos que necesiten transcribir llamadas o chats de voz.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de un catálogo de audio para indexación y búsqueda por texto, aprovechando el rendimiento en GPU (RTF 0,059-0,087) para reducir tiempos de proceso.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de evaluación propio de Moonbox (400 utterances de LibriSpeech test-clean de los 40 hablantes, más 200 utterances de AISHELL-1 test para modelos con chino):

| Precision | WER LibriSpeech | CER AISHELL-1 | Transcripciones idénticas (LibriSpeech / AISHELL-1) | RTF |
|---|---|---|---|---|
| Original PyTorch | 1,45 % | 1,52 % | — | — |
| fp16 (CUDA) | 1,43 % | 1,52 % | 398/400 y 200/200 | 0,087 |
| int8 (CUDA) | 1,50 % | 1,49 % | 382/400 y 195/200 | 0,071 |
| int8 (CPU, build GPU) | — | — | — | 19 |
| int4 (CUDA) | 1,50 % | 1,52 % | 295/400 y 186/200 | 0,059 |
| int4 (CPU) | — | — | — | 0,52 |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos del decoder es de 3,46 GB en fp16, 1,84 GB en int8 y aproximadamente 1,7 GB en int4 (el encoder y embed suman entre 0,6 y 0,9 GB adicionales según precisión). En fp16 se recomienda al menos 6-8 GB de VRAM; en int8, 4-5 GB; en int4, 3-4 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para int8 e int4, GPUs con 4 GB o más.
- Cabe en GPU de consumo: sí. La versión int4 (aproximadamente 2,5 GB en total) cabe en GPUs de gama de entrada como la RTX 3050 o incluso en iGPUs compatibles con DirectML.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) mediante los scripts `pipeline.py` y `ortllm.py` incluidos. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es ONNX y el modelo es específico de ASR.
- Latencia y throughput: RTF 0,087 en fp16 con CUDA, 0,071 en int8 con CUDA, 0,059 en int4 con CUDA y 0,52 en int4 con CPU. En la build int8 para GPU ejecutada sobre CPU, el RTF es de 19 (muy lento, no apto para tiempo real).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de ASR (como Whisper large-v3, Whisper medium o modelos de la familia Wav2Vec 2.0) que permitan una comparación rigurosa con cifras. Se indica a continuación una comparación cualitativa basada en características conocidas de la categoría, marcando como "no disponible" los datos que no se han podido verificar en la información suministrada.

| Modelo | Parametros | Contexto | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-ONNX (este) | 1,7 B | No disponible | Apache 2.0 | ONNX | 1,43-1,50 % |
| Whisper large-v3 | 1,55 B | 30 s de audio por ventana | MIT | PyTorch, GGML, ONNX | No disponible en la informacion |
| Whisper medium | 769 M | 30 s de audio por ventana | MIT | PyTorch, GGML, ONNX | No disponible en la informacion |
| Wav2Vec 2.0 large | 317 M | No disponible | MIT / Apache 2.0 (segun variante) | PyTorch | No disponible en la informacion |

## Limitaciones y advertencias

- La evaluación pública se limita a inglés (LibriSpeech) y chino (AISHELL-1); el rendimiento en otros idiomas declarados como soportados no está cuantificado en la información disponible.
- El modelo está especializado exclusivamente en ASR: no soporta generación de texto general, razonamiento, código ni tool calling, por lo que no debe evaluarse con benchmarks de LLM.
- La decodificación es autorregresiva y secuencial; en audio de larga duración puede acumular errores o requerir segmentación previa, aunque no se detalla en la model card el comportamiento con audios extensos.
- La versión int4 muestra una divergencia notable respecto al original (295/400 transcripciones idénticas en LibriSpeech frente a 398/400 en fp16), lo que puede ser relevante en aplicaciones donde la fidelidad exacta respecto al modelo PyTorch sea crítica.
- La build int8 para GPU ejecutada sobre CPU presenta un RTF de 19, lo que la hace inadecuada para escenarios de tiempo real en ese backend; debe seleccionarse la build adecuada al hardware.
- No se documentan en la información proporcionada sesgos específicos del modelo ni riesgos de alucinación medidos; como todo sistema ASR, puede producir transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-ASR-1.7B en su repositorio original, ya que la model card no detalla posibles restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Qwen3-ASR-1.7B-ONNX
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Paper de referencia (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- ONNX Runtime: https://onnxruntime.ai/
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
