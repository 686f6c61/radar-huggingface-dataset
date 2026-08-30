# Rin247/Qwen3-ASR-1.7B-hf-FP4

## Resumen

Este repositorio contiene una cuantización FP4 (weight-only) del modelo Qwen3-ASR-1.7B-hf, publicada por el usuario Rin247. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un sistema de reconocimiento automático del habla (ASR) que soporta identificación de idioma y transcripción para 52 idiomas y dialectos, construido sobre la arquitectura de audio de Qwen3-Omni. La versión cuantizada reduce el tamaño de los pesos a 1,6 GB (frente a los aproximadamente 3,5 GB del modelo original en FP32), lo que facilita su despliegue en entornos con recursos de memoria limitados, como GPUs de consumo o inferencia en CPU.

La cuantización se realizó mediante RTN (round-to-nearest) en CPU, almacenando las escalas junto a los pesos en formato safetensors. Aunque no se especifica la licencia del modelo cuantizado, el modelo base de Qwen se distribuye bajo la licencia Apache 2.0, por lo que es probable que esta versión herede dicha licencia, aunque no se confirma en la información disponible. Este modelo es relevante para desarrolladores que necesitan ASR multilingüe eficiente sin sacrificar demasiada precisión, y que buscan una alternativa ligera a modelos como Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen3-Omni, sin detalles publicados) |
| Parametros totales | 1.176.909.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only, con escalas) |
| Idiomas soportados | 52 idiomas y dialectos (segun el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors + config.json) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B-hf pertenece a la familia Qwen3-ASR, que incluye tambien una variante de 0,6B. Ambos modelos se entrenaron con una gran cantidad de datos de habla y aprovechan la capacidad de comprension de audio de su modelo fundacional, Qwen3-Omni. La arquitectura exacta no se detalla en la informacion disponible, pero se sabe que es un modelo de tipo transformer con atencion sobre audio, disenado para tareas de ASR y clasificacion de idioma.

La cuantizacion FP4 se aplico sobre los pesos del modelo base mediante el metodo RTN (round-to-nearest) ejecutado en CPU. Los pesos se almacenan en formato FP4 junto con las escalas correspondientes en buffers separados (`*.weight_scale` y `*.weight_shape`). Para utilizar el modelo, es necesario de-cuantizar los pesos con esas escalas antes de pasarlos a un motor de inferencia. No se menciona si se realizo un ajuste fino posterior a la cuantizacion (QAT), por lo que se asume que es una cuantizacion post-entrenamiento (PTQ) sin recalibracion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 52 idiomas y dialectos, incluyendo variedades regionales.
- Identificacion de idioma: el modelo puede detectar que idioma se esta hablando en un audio dado.
- Procesamiento de audio de entrada: acepta senales de audio como entrada y produce transcripciones de texto.
- Al ser una cuantizacion FP4, mantiene las capacidades funcionales del modelo base, aunque con una posible degradacion en la precision de la transcripcion debido a la reduccion de bits.
- No se especifican capacidades adicionales como traduccion, diarizacion de hablantes o soporte de tool calling, ya que el modelo base se centra exclusivamente en ASR.

## Casos de uso

- Transcripcion de reuniones y videollamadas: el modelo puede transcribir audio multilingue en tiempo real o en diferido, con identificacion de idioma para entornos internacionales. Su tamano reducido permite ejecutarlo en servidores modestos o en estaciones de trabajo con GPU de gama media.
- Subtitulado automatico de videos: al soportar 52 idiomas, es adecuado para generar subtitulos en plataformas de video, tanto en directo como en postproduccion. La cuantizacion FP4 reduce el coste de inferencia por hora de video.
- Asistentes de voz para dispositivos edge: gracias a su peso de 1,6 GB, puede desplegarse en dispositivos con 4 GB de RAM o menos, como Raspberry Pi 5 o mini-PCs, para tareas de dictado o control por voz.
- Analisis de llamadas de atencion al cliente: las empresas pueden transcribir grabaciones de llamadas en varios idiomas para extraer metricas de calidad o detectar intenciones, sin necesidad de infraestructura de GPU costosa.
- Investigacion linguistica: el modelo permite transcribir y etiquetar idiomas con pocos recursos, facilitando la creacion de corpus orales para estudios de dialectos y variantes regionales.
- Accesibilidad: integracion en aplicaciones de transcripcion para personas con discapacidad auditiva, donde el bajo consumo de memoria permite ejecutarlo en portatiles convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version cuantizada FP4 en la informacion disponible. El modelo base Qwen3-ASR-1.7B-hf cuenta con evaluaciones en el reporte tecnico de Qwen3-ASR (arXiv:2601.21337), pero no se proporcionan numeros concretos en los materiales consultados. Se recomienda consultar el reporte tecnico para obtener datos de WER (Word Error Rate) y accuracy de identificacion de idioma del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,6 GB en disco, por lo que los pesos en FP4 requieren aproximadamente 1,2 GB de VRAM (1.176.909.440 parametros × 4 bits = ~588 MB, mas overhead de escalas y activaciones). Con un batch pequeno, se estima un uso total de 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o incluso GPUs integradas con memoria compartida (aunque con menor rendimiento). Para produccion, una RTX 4090 o A10 permitiria procesar multiples flujos de audio simultaneamente.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: al ser un modelo safetensors con cuantizacion personalizada, no se puede cargar directamente con Transformers sin de-cuantizacion previa. Se requiere un script personalizado que lea las escalas y reconstruya los pesos en FP16/FP32. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, por lo que el despliegue estandar seria mediante un pipeline propio en PyTorch.
- Latencia y throughput: no disponibles. Dependera del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-hf (base) | 1.176.909.440 | no disponible | 52 | Apache 2.0 (probable) | safetensors (FP32/FP16) |
| Qwen3-ASR-1.7B-hf-FP4 (este) | 1.176.909.440 | no disponible | 52 | no disponible | safetensors (FP4) |
| Whisper small (openai) | 244M | 30 segundos | 99 | MIT | safetensors/GGUF |

La comparativa se limita a los modelos de la misma familia y a Whisper small como alternativa popular. Whisper small tiene menos parametros y soporta mas idiomas, pero su contexto de audio es fijo (30 segundos) y no realiza identificacion de idioma explicita. El modelo base Qwen3-ASR ofrece contexto mas largo (aunque no se especifica) y una arquitectura mas moderna. La version FP4 sacrifica precision por eficiencia, pero mantiene el mismo tamano de parametros.

## Limitaciones y advertencias

- La cuantizacion FP4 puede provocar una degradacion notable en la precision de la transcripcion, especialmente en audios con ruido de fondo o acentos poco comunes. No se ha validado el rendimiento real de esta version cuantizada.
- La licencia del modelo cuantizado no esta especificada. Aunque el modelo base es Apache 2.0, el autor del repositorio no ha indicado la licencia, lo que genera incertidumbre legal para uso comercial.
- No se proporciona informacion sobre sesgos o alucinaciones. Como modelo ASR, puede producir errores de transcripcion en idiomas poco representados en los datos de entrenamiento.
- El proceso de de-cuantizacion requiere codigo personalizado; no hay integracion con frameworks estandar como Transformers, vLLM o llama.cpp, lo que complica el despliegue en produccion.
- La fecha de creacion del repositorio (agosto de 2026) es posterior a la fecha actual, lo que sugiere que podria tratarse de un modelo experimental o de una publicacion con datos incorrectos. Se recomienda verificar la autenticidad antes de usarlo en entornos criticos.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Rin247/Qwen3-ASR-1.7B-hf-FP4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio oficial de Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Reporte tecnico de Qwen3-ASR (arXiv): https://arxiv.org/html/2601.21337
