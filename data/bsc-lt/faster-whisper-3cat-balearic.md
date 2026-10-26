# BSC-LT/faster-whisper-3cat-balearic

## Resumen

faster-whisper-3cat-balearic es un modelo de reconocimiento automático del habla (ASR) para catalán, con especial atención al acento balear, publicado por el Language Technologies Laboratory del Barcelona Supercomputing Center (BSC-LT). No es un modelo entrenado desde cero: es la conversión a CTranslate2, mediante la herramienta faster-whisper, del modelo BSC-LT/whisper-3cat-balearic, que a su vez es un fine-tuning de openai/whisper-large-v3 sobre el corpus 3CatParla de televisión en catalán.

El problema que resuelve es doble. Por un lado, adapta un modelo multilingüe de propósito general a una variedad dialectal concreta del catalán que suele quedar infrarrepresentada en los corpus de entrenamiento. Por otro, empaqueta el resultado en el formato de CTranslate2 con cuantización float16, lo que reduce el peso del repositorio a 3,1 GB y permite inferencia entre dos y cuatro veces más rápida que la implementación original de Whisper con la misma precisión aproximada, además de habilitar ejecución en CPU con cuantización INT8.

Es relevante ahora porque la demanda de transcripción en lenguas cooficiales del Estado crece en ámbitos como subtitulado, archivística audiovisual y administración pública, y porque el ecosistema faster-whisper (usado por WhisperX, WhisperLive, distintos servidores compatibles con la API de OpenAI) permite desplegarlo sin reescribir la infraestructura existente. La licencia Apache-2.0 facilita además el uso comercial sin las restricciones del ecosistema original de Whisper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo Whisper, con encoder de audio sobre espectrograma mel y decoder autorregresivo |
| Parametros totales | 1.550 millones (heredados de openai/whisper-large-v3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos por iteración (128 bins mel); contexto de texto del decoder de 448 tokens; no es una ventana de contexto de texto en el sentido de los LLM |
| Tipos de cuantizacion | float16 (la publicada en el repositorio); faster-whisper permite además int8_float16 en GPU e int8 en CPU |
| Idiomas soportados | catalán (etiqueta `ca`), con especialización declarada en acento balear; el modelo base es multilingüe pero el fine-tuning está orientado a catalán |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`) en float16, acompañado de `preprocessor_config.json` y tokenizer; el modelo original del que deriva se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder que consume espectrogramas mel de 128 bandas calculados sobre ventanas de 30 segundos de audio, y un decoder autorregresivo con atención cruzada sobre la salida del encoder. La configuración de large-v3 implica 32 capas de encoder y 32 de decoder, dimensión de modelo 1280 y 20 cabezas de atención, con un vocabulario multilingüe de 51.866 tokens BPE. El modelo es, por tanto, un transformer estándar, no un MoE ni un modelo híbrido SSM.

El entrenamiento relevante lo realizó el equipo de BSC-LT al producir BSC-LT/whisper-3cat-balearic: un fine-tuning de whisper-large-v3 sobre el corpus projecte-aina/3catparla_asr, un conjunto de audio de televisión en catalán (3CatParla, presentado en IberSPEECH 2024). No se documenta en la información disponible el número exacto de horas utilizadas ni la composición detallada del subset balear, ni si se aplicaron técnicas de aumento de datos o ajuste de hiperparámetros específicas. El modelo aquí descrito no entrena nada: es el resultado de ejecutar `ct2-transformers-converter` con `--quantization float16` sobre los pesos fine-tuneados, un proceso realizado en junio de 2025 en el laboratorio del BSC. La innovación técnica, por tanto, no está en el modelado sino en el empaquetado: la conversión a CTranslate2 con fusión de operaciones y eliminación del grafo de PyTorch reduce latencia y huella de memoria manteniendo los pesos en media precisión.

## Capacidades

- Transcripción de audio en catalán a texto plano, con salida sin puntuación según declara el autor.
- Reconocimiento especializado en el acento balear del catalán, variedad sobre la que se ha hecho el ajuste fino.
- Detección automática del idioma con probabilidad asociada (`info.language_probability`), heredada del modelo base.
- Segmentación temporal: devuelve marcas de inicio y fin por segmento, aptas para subtitulado.
- Decodificación con beam search configurable (ejemplo del autor con `beam_size=5`) y modo `transcribe`.
- Ejecución en GPU con float16 o int8_float16, y en CPU con int8, mediante faster-whisper.
- Integración con el ecosistema transformers y con servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible` en el repositorio).
- No soporta tool calling, razonamiento multi-paso, visión ni audio generation: es un modelo puramente ASR.

## Casos de uso

- Subtitulado de televisión y archivo audiovisual en catalán: el modelo devuelve segmentos con timestamps, de modo que un pipeline puede generar ficheros SRT directamente; su origen en el corpus 3CatParla lo hace adecuado para registros de medios de comunicación.
- Transcripción de contenido de radiotelevisión autonómica balear: la especialización dialectal reduce el error en hablantes con rasgos baleares que los modelos multilingües genéricos tienden a normalizar hacia el catalán central.
- Actas y sesiones administrativas: despliegue en servidor con GPU modesta o incluso CPU con int8 para transcribir plenos municipales y comparecencias, con coste de infraestructura bajo y licencia Apache-2.0 compatible con uso institucional y comercial.
- Accesibilidad: generación de subtítulos en directo o diferido para personas con discapacidad auditiva en emisiones en catalán, donde la latencia de faster-whisper con float16 permite cuasi tiempo real en GPU de gama media.
- Búsqueda y recuperación documental sobre archivos sonoros: indexación masiva de una fonoteca transcribiendo por lotes; el formato CTranslate2 permite procesar horas de audio con throughput alto en una sola GPU consumer.
- Investigación lingüística y dialectología: obtención de transcripciones de corpus orales baleares para análisis fonético y léxico posterior, con la ventaja de que el modelo está ajustado sobre la misma variedad que se pretende estudiar.
- Integración en asistentes de voz o agentes conversacionales locales: el modelo actúa como capa ASR en un pipeline en el que un LLM posterior se encarga de la respuesta; el soporte de endpoints compatibles simplifica el encaje con herramientas tipo WhisperX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de WER, CER ni comparaciones cuantitativas con otros modelos, ni para el conjunto de evaluación de 3CatParla ni para subsets baleares. El paper de referencia (IberSPEECH 2024) describe el corpus, pero no se dispone aquí de sus cifras. Cualquier número que se cite para este modelo debería obtenerse mediante una evaluación propia sobre un conjunto de test balear.

## Requisitos de hardware

- VRAM estimada en float16: aproximadamente 3,1 GB de pesos más overhead de runtime y buffers de atención; en la práctica unos 4-5 GB de VRAM en GPU, o alrededor de 2-3 GB si se usa int8_float16.
- En CPU con int8: el modelo ocupa del orden de 1,6-1,8 GB de RAM y funciona, aunque con latencia notablemente superior; adecuado para procesamiento por lotes no interactivo.
- GPU recomendadas: NVIDIA A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090, A10G o L4 para producción a escala media; RTX 4060 Ti, RTX 3060 de 12 GB, RTX 4070 o incluso T4 para instancias individuales.
- Cabe en GPU consumer sin problema: cualquier tarjeta con 6 GB o más de VRAM. Una GTX 1650 de 4 GB puede ejecutarlo con int8_float16, y una RTX 3060 lo hace con float16 holgado.
- Opciones de despliegue: faster-whisper (biblioteca de referencia), WhisperX para diarización y alineamiento, servidores compatibles con la API de OpenAI, y contenedores propios basados en CTranslate2. No se puede cargar con llama.cpp ni con Ollama, porque el formato CTranslate2 no es GGUF.
- Latencia y throughput: no se han publicado mediciones específicas para este modelo en la información disponible. Como referencia cualitativa del ecosistema faster-whisper, la conversión a float16 con CTranslate2 suele multiplicar por dos a cuatro la velocidad de la implementación original de PyTorch, pero esa cifra debe validarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas / especializacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| BSC-LT/faster-whisper-3cat-balearic | 1.550 M | 30 s por ventana | Catalán, acento balear | Apache-2.0 | CTranslate2 float16 | HuggingFace, 58 descargas |
| BSC-LT/whisper-3cat-balearic | 1.550 M | 30 s por ventana | Catalán, acento balear | Apache-2.0 (según el modelo del que deriva) | safetensors / transformers | HuggingFace; requiere PyTorch para inferencia |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | Multilingüe (99 idiomas), sin especialización dialectal | Apache-2.0 | safetensors, también conversiones comunitarias a CTranslate2 | HuggingFace, ampliamente desplegado |
| openai/whisper-small | 244 M | 30 s por ventana | Multilingüe, menor precisión | Apache-2.0 | safetensors, GGUF y CTranslate2 | HuggingFace; opción para CPU muy limitada |

La comparación relevante es contra el modelo del que deriva: faster-whisper-3cat-balearic ofrece la misma calidad esperada que whisper-3cat-balearic con menor latencia y menor consumo de memoria, a cambio de perder la posibilidad de reentrenar o ajustar con PyTorch de forma directa. Frente a whisper-large-v3 original, la ventaja esperada está en el error sobre habla balear, pero no hay cifras publicadas que lo cuantifiquen.

## Limitaciones y advertencias

- Salida sin puntuación: el autor indica explícitamente que el modelo transcribe a texto plano sin signos de puntuación, lo que obliga a un postprocesado si se necesita legibilidad.
- Sesgo de dominio: el ajuste fino se hizo sobre 3CatParla, un corpus de televisión; el rendimiento puede degradarse en audio telefónico, conversacional espontáneo, ruido de fondo intenso o habla solapada.
- Cobertura dialectal limitada: aunque está especializado en balear, no hay datos publicados sobre su comportamiento en otras variedades del catalán (central, valenciano, noroccidental, alguerés) ni sobre code-switching catalán-castellano.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en tramos de silencio, música o ruido, e inventar frases completas si el audio es ininteligible. Es imprescindible filtrar por `no_speech_prob` y `avg_logprob` en producción.
- Sin benchmarks publicados: no se dispone de WER oficial, lo que impide comparar objetivamente con alternativas y hace recomendable una evaluación propia antes de adoptarlo.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del corpus 3CatParla y del modelo base original por si imponen restricciones adicionales sobre los datos de entrenamiento.
- Madurez y soporte: 58 descargas y 1 like en el momento de la consulta indican adopción muy baja; no hay garantía de mantenimiento ni de corrección de errores por parte del autor.
- Formato: al estar en CTranslate2, no es compatible con llama.cpp, Ollama ni con herramientas que esperan GGUF; la integración queda circunscrita al ecosistema faster-whisper y afines.
- Ventana de 30 segundos: los audios más largos requieren segmentación por parte del runtime, con el riesgo de cortes en mitad de palabra si no se ajustan los parámetros de VAD.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BSC-LT/faster-whisper-3cat-balearic
- Modelo original del que deriva: https://huggingface.co/BSC-LT/whisper-3cat-balearic
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio faster-whisper: https://github.com/guillaumekln/faster-whisper/tree/master
- Dataset 3CatParla: https://huggingface.co/datasets/projecte-aina/3catparla_asr
- Laboratorio autor: https://huggingface.co/BSC-LT
- Barcelona Supercomputing Center: https://www.bsc.es/
- Proyecto Aina: https://projecteaina.cat/en/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Notebook de ejemplo citado en la model card: https://colab.research.google.com/drive/1MHiPrffNTwiyWeUyMQvSdSbfkef_8aJC?usp=sharing
- Contacto del equipo: langtech@bsc.es
