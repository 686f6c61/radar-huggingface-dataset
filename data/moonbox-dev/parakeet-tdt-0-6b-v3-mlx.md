# moonbox-dev/parakeet-tdt-0.6b-v3-MLX

## Resumen

Parakeet TDT v3 MLX es una conversión a formato MLX del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicada por el usuario moonbox-dev. El modelo original, desarrollado por NVIDIA, emplea una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer), orientada a transcripción multilingüe de audio con 0.6 mil millones de parámetros. Esta versión empaqueta los pesos en varios niveles de precisión (bf16, fp16, 8bit, 6bit y 4bit) para su ejecución nativa en Apple Silicon mediante la librería mlx-audio.

La relevancia de esta variante radica en que permite ejecutar un modelo ASR de calidad de producción directamente en hardware de Apple (chips M1/M2/M3/M4), sin necesidad de GPUs NVIDIA ni de infraestructura CUDA. Según la model card, las versiones bf16, fp16, 8bit y 6bit reproducen transcripciones idénticas al modelo original con un WER del 1,15 %, mientras que la versión 4bit degrada ligeramente hasta un WER del 1,54 %, lo que la convierte en una opción viable para despliegues con recursos muy limitados.

El repositorio ocupa 4,3 GB e incluye cinco carpetas de precisión independientes, cada una con su propio `config.json`, pesos `safetensors`, tokenizador y vocabulario. La licencia del modelo base es CC-BY-4.0, lo que permite uso comercial con atribución. No se dispone de datos de descargas ni de validación comunitaria (0 descargas, 0 likes en el momento de la consulta), por lo que debe considerarse una conversión reciente y poco contrastada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16, 8bit, 6bit, 4bit |
| Idiomas soportados | multilingue (segun tags del modelo base; lista concreta no disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), tokenizer.model, vocab.txt |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` utiliza una arquitectura FastConformer, una variante eficiente del Conformer con submuestreo de audio por factor 8 que reduce la longitud de la secuencia antes de entrar en el encoder. Sobre el encoder se sitúa un decodificador TDT (Token-and-Duration Transducer), que predice conjuntamente el token de salida y su duración, lo que permite un alineamiento más flexible que los transductores clásicos y mejora la robustez ante variaciones de velocidad del habla.

No se dispone en la información proporcionada de detalles sobre el número de horas de audio de entrenamiento, la composición del dataset, el uso de técnicas de aumento de datos o si se aplicaron etapas de ajuste fino supervisado. La model card de esta conversión MLX no incluye información sobre el proceso de entrenamiento del modelo original; únicamente documenta el proceso de conversión y cuantización. Tampoco se detalla si el modelo soporta diarización, puntuación automática o normalización de texto más allá de la transcripción bruta.

La innovación técnica de esta publicación concreta es la conversión a MLX con cuantización por capas y la verificación de equivalencia funcional frente al modelo PyTorch original, medida mediante WER y comparación de transcripciones sobre el mismo conjunto de entradas.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, con salida de transcripción en texto.
- Decodificación TDT que combina predicción de tokens y duraciones, adecuada para audio continuo sin segmentación manual previa.
- Procesamiento de audio de entrada mediante FastConformer, con submuestreo que reduce el coste computacional del encoder.
- Ejecución nativa en Apple Silicon a través de mlx-audio.
- Múltiples niveles de precisión para ajustar el equilibrio entre calidad y uso de memoria.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo; es un modelo exclusivamente ASR.
- No se ha documentado modo thinking ni capacidades de instrucción conversacional.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar audio de reuniones en un Mac con chip M-series usando la variante 8bit (744 MB), manteniendo el WER del 1,15 % y evitando enviar datos confidenciales a servicios en la nube.
- Subtitulado automático de vídeo: integrado en un pipeline de postproducción, permite generar pistas de subtítulos en varias lenguas a partir de la pista de audio, con la ventaja de ejecutarse en el mismo equipo de edición sin GPU dedicada.
- Dictado por voz en aplicaciones de escritorio: la variante 4bit (472 MB) cabe en memoria unificada de cualquier Mac moderno y permite transcripción en tiempo real con una degradación mínima (WER 1,54 % frente a 1,15 %).
- Archivado y búsqueda de audio histórico: para digitalizar y hacer buscable un archivo de grabaciones (entrevistas, ponencias, llamadas), el modelo ofrece transcripciones de alta fidelidad que luego se indexan con un motor de búsqueda de texto.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en directo de clases o charlas ejecutadas íntegramente en el portátil del usuario, sin dependencia de conectividad.
- Preprocesado para pipelines de NLP: conversión de audio a texto como primer paso de un sistema de análisis de sentimiento, resumen o extracción de entidades sobre grabaciones de atención al cliente.
- Transcripción de contenido multilingüe para localización: al ser un modelo multilingüe, puede emplearse para generar borradores de traducción a partir de audio en varios idiomas antes de la revisión humana.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de equivalencia frente al modelo original, no benchmarks estándar sobre conjuntos públicos:

| Precision | Tamano pesos | WER | Equivalencia con el original |
|---|---|---|---|
| bf16 | 1,25 GB | 1,15 % | Transcripciones idénticas |
| fp16 | 1,25 GB | 1,15 % | Transcripciones idénticas |
| 8bit | 744 MB | 1,15 % | Transcripciones idénticas |
| 6bit | 608 MB | 1,15 % | Transcripciones idénticas |
| 4bit | 472 MB | 1,54 % | 0,4 % de palabras leídas de forma distinta |

No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, MLS, FLEURS) en la información disponible. Los valores de WER anteriores corresponden a la comparación interna del autor entre la conversión MLX y el modelo PyTorch original sobre el mismo conjunto de entradas, no a un corpus de referencia público.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 0,5 GB (4bit) y 1,3 GB (bf16/fp16) solo para los pesos; hay que añadir el estado del encoder y los buffers de audio, por lo que en la práctica conviene reservar entre 1 y 2 GB adicionales.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni con GPUs NVIDIA/AMD en esta distribución.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada usando las variantes 4bit o 6bit.
- Opciones de despliegue: mlx-audio (librería indicada en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| moonbox-dev/parakeet-tdt-0.6b-v3-MLX | 600 M | no disponible | multilingue | CC-BY-4.0 | safetensors MLX (Apple Silicon) |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | no disponible | multilingue | CC-BY-4.0 | PyTorch (NeMo) |
| Whisper large-v3 (referencia de categoria) | 1.550 M | 30 s por segmento | multilingue | MIT (segun publicacion original) | PyTorch, GGUF, MLX, ONNX |
| Whisper small (referencia de tamano) | 244 M | 30 s por segmento | multilingue | MIT | multiples |

La comparación con Whisper se ofrece como referencia de categoría; no se dispone de resultados de benchmarks comunes en la información proporcionada que permitan afirmar superioridad o inferioridad en WER entre ambos modelos. La ventaja principal de esta conversión frente al modelo original de NVIDIA es la ejecución nativa en Apple Silicon; su desventaja es la ausencia de validación comunitaria y de soporte en otros backends.

## Limitaciones y advertencias

- Modelo de reconocimiento de voz, no de lenguaje: no genera texto libre, no razona, no responde a instrucciones y no soporta tool calling.
- Solo funciona en Apple Silicon mediante mlx-audio; no es portable a CUDA, ROCm ni CPU convencional sin reconversión.
- La variante 4bit introduce una degradación medible (WER 1,54 % frente a 1,15 % y un 0,4 % de palabras distintas), aceptable para muchas aplicaciones pero no para transcripción legal o médica de alta fidelidad.
- Riesgo de alucinación en ASR: en pasajes con ruido, música o silencios largos, los transductores pueden emitir texto espurio; conviene aplicar detección de actividad de voz (VAD) antes de la inferencia.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por acento, género, edad o variante dialectal.
- Idiomas: el modelo se etiqueta como multilingüe, pero no se proporciona la lista concreta de idiomas soportados ni su cobertura por variante.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y respetar los términos de la licencia al redistribuir.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; debe tratarse como una conversión no auditada por terceros.
- No se documentan garantías de mantenimiento, actualizaciones ni soporte por parte del autor de la conversión.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/moonbox-dev/parakeet-tdt-0.6b-v3-MLX
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Referencia arXiv 2509.14128: https://arxiv.org/abs/2509.14128
- Referencia arXiv 2505.13404: https://arxiv.org/abs/2505.13404
- Referencia arXiv 2305.05084: https://arxiv.org/abs/2305.05084
- Referencia arXiv 2304.06795: https://arxiv.org/abs/2304.06795
- Referencia arXiv 2410.01036: https://arxiv.org/abs/2410.01036
- Referencia arXiv 2406.00899: https://arxiv.org/abs/2406.00899
- Referencia arXiv 2205.12446: https://arxiv.org/abs/2205.12446
- Referencia arXiv 2012.03411: https://arxiv.org/abs/2012.03411
- Referencia arXiv 2007.10310: https://arxiv.org/abs/2007.10310
- Referencia arXiv 1510.08484: https://arxiv.org/abs/1510.08484
