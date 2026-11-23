# matrixportalx/ufakzeka-kulak-ggml

## Resumen

ufakzeka-kulak-ggml es la conversión al formato ggml del modelo de reconocimiento automático de voz (ASR) en turco `ufakai/ufakzeka-kulak`, publicada por el usuario matrixportalx. El modelo original es un FastConformer con decodificación TDT (Token-and-Duration Transducer) de 31,6 millones de parámetros, entrenado por ufak AI para transcribir habla en turco. Esta versión está empaquetada específicamente para ejecutarse con el motor parakeet de whisper.cpp, lo que permite inferencia local sin dependencias de NeMo ni de frameworks de deep learning pesados.

La relevancia de esta ficha radica en que se trata de un espejo de preservación: el repositorio existe para que las aplicaciones Rüya y Esin puedan seguir accediendo a los pesos aunque el repositorio fuente desaparezca o se vuelva privado. El proceso de conversión requirió un parche específico del motor (`parakeet-bias.patch`) porque el modelo fue entrenado con `use_bias=true`, y en la conversión se plegaron los parámetros `xscale` y los bias de convolución depthwise, eliminando además la cabeza CTC.

El modelo reporta un WER normalizado de 0,099 sobre 18 muestras del split dev de FLEURS en turco, frente al 0,092 declarado en la model card original. El tamaño del repositorio es de 0,1 GB, con pesos en un único archivo `ggml-ufakzeka-kulak-f16.bin`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificación TDT (Token-and-Duration Transducer) |
| Parametros totales | 31,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (único formato presente en el repo) |
| Idiomas soportados | turco |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (binario `ggml-ufakzeka-kulak-f16.bin`) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, variante eficiente del Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada, acoplado a una cabeza de decodificación TDT (Token-and-Duration Transducer). La TDT predice conjuntamente el token y su duración, lo que permite decodificación no autorregresiva por saltos y reduce la latencia frente a transducers clásicos. El modelo fue entrenado con `use_bias=true` en las capas lineales, un detalle que obliga a usar la versión parcheada del motor parakeet de whisper.cpp para leer correctamente los bias.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino supervisado adicional. La conversión a ggml plegó los parámetros `xscale` y los bias de las convoluciones depthwise directamente en los pesos, y eliminó la cabeza CTC del modelo NeMo original (`ufakzeka-kulak.nemo`). El resultado es un artefacto de inferencia puro, sin capacidad de fine-tuning directo en formato ggml.

## Capacidades

- Reconocimiento automático de voz (ASR) en turco, con salida de transcripción textual.
- Decodificación TDT, que permite emitir tokens con duraciones variables y reducir el número de pasos de decodificación.
- Ejecución local mediante whisper.cpp (motor parakeet), sin necesidad de GPU dedicada ni de NeMo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio de entrada más allá de la propia señal de voz a transcribir.
- Capacidad multilingüe limitada al turco; no se declaran otros idiomas.
- No incluye puntuación ni diarización como capacidades declaradas en la información disponible.

## Casos de uso

- Transcripción de reuniones en turco: el modelo puede procesar audio de reuniones y generar actas textuales ejecutándose localmente con whisper.cpp, lo que evita enviar audio sensible a servicios en la nube.
- Subtitulado de vídeo en turco: integrado en un pipeline de ffmpeg más whisper.cpp, permite generar pistas de subtítulos SRT para contenido en turco con bajo coste de infraestructura gracias a sus 31,6 M de parámetros.
- Asistentes de voz embebidos: al caber en CPU y en GPUs de gama baja, es adecuado para dispositivos con recursos limitados que necesiten reconocimiento de voz en turco sin conexión.
- Indexación de archivos de audio: transcripción masiva de grabaciones para construir índices de búsqueda textual en turco, usando el formato ggml para despliegue en servidores sin GPU.
- Atención al cliente telefónica: transcripción de llamadas en turco para análisis de calidad y extracción de motivos de contacto, con inferencia local que simplifica el cumplimiento normativo.
- Investigación en ASR de lenguas de bajos recursos: sirve como línea base reproducible en turco para comparar técnicas de decodificación TDT frente a CTC o attention encoder-decoder.
- Preservación de artefactos: el propio repositorio actúa como espejo para garantizar la disponibilidad de los pesos en aplicaciones dependientes, como Rüya y Esin.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| FLEURS turco (dev, 18 muestras) | WER normalizado 0,099 | Medición realizada en esta conversión ggml |
| FLEURS turco (model card original) | WER 0,092 | Dato declarado por el autor del modelo base |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en f16, dado el tamaño de 31,6 M parámetros y un archivo de pesos de aproximadamente 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU moderna; también es viable en CPU.
- Opciones de despliegue: whisper.cpp con el motor parakeet y el parche `parakeet-bias.patch`; no es compatible con vLLM, TGI ni Ollama, que no soportan este formato de ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ufakzeka-kulak-ggml | 31,6 M | no disponible | WER 0,099 en FLEURS tr dev (18 muestras) | Apache 2.0 | ggml para whisper.cpp |
| ufakai/ufakzeka-kulak (original) | 31,6 M | no disponible | WER 0,092 en FLEURS tr | Apache 2.0 | NeMo (.nemo) |
| Whisper large-v3 | 1.550 M | 30 s de audio por ventana | no disponible en esta ficha | MIT | múltiples formatos, incluido ggml |
| Parakeet TDT 0.6B v2 | 600 M | no disponible | no disponible en esta ficha | CC-BY-4.0 | NeMo |

La comparación con Whisper y Parakeet se incluye por categoría (ASR multilingüe y ASR transducer), pero no se dispone de resultados de benchmark comparables en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- Solo reconoce turco; no se declaran otros idiomas, por lo que su uso fuera del turco producirá transcripciones incorrectas.
- Alucinaciones: los modelos ASR pueden generar texto plausible en segmentos de silencio o ruido; no se documenta mitigación específica.
- Sesgos: no se documentan sesgos demográficos, de acento o de género en la información disponible; al entrenarse sobre corpus como FLEURS, es probable que rinda peor en variedades dialectales y audio con ruido.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar la atribución indicada en `ATTRIBUTION.md` y `LICENSE`.
- Requiere una versión parcheada del motor parakeet de whisper.cpp; una build estándar no leerá los bias y producirá resultados incorrectos.
- El repositorio es un espejo de preservación; no se garantiza que se actualice con nuevas versiones del modelo fuente.
- El WER medido se basa en solo 18 muestras, por lo que la estimación tiene alta varianza y no debe tomarse como métrica robusta de producción.
- No incluye cabeza CTC, por lo que no es posible usar decodificación CTC con este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/matrixportalx/ufakzeka-kulak-ggml
- Modelo fuente: https://huggingface.co/ufakai/ufakzeka-kulak
- Perfil del autor del espejo: https://huggingface.co/matrixportalx
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- FLEURS: https://huggingface.co/datasets/google/fleurs
