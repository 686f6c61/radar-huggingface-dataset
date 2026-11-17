# jimbo5168/weiwowensi-asr-r3-8bit

## Resumen

weiwowensi-asr-r3-8bit es un modelo de reconocimiento automatico del habla (ASR) en chino, obtenido mediante fine-tuning del modelo base Qwen/Qwen3-ASR-1.7B sobre conferencias y charlas budistas en mandarin. Lo publica el desarrollador jimbo5168 como componente del motor de transcripcion de su aplicacion gratuita para macOS "为我闻思", orientada a la conversion de audio de dharma talks en documentos de texto. El modelo se distribuye cuantizado a 8 bits en formato MLX safetensors, lo que lo restringe a equipos Apple Silicon (M1 y posteriores).

El modelo resuelve un problema de dominio muy concreto: la transcripcion fiable de discursos religiosos en chino, con vocabulario especializado (terminologia budista, nombres propios sanscritos transliterados, citas clasicas) que los modelos ASR genericos suelen transcribir con errores. Al derivar de Qwen3-ASR-1.7B, hereda una arquitectura de reconocimiento de voz de aproximadamente 2.038 millones de parametros totales (segun los safetensors publicados) y una licencia Apache 2.0.

Su relevancia es limitada fuera de ese nicho: no es un modelo generalista, no incluye documentacion tecnica detallada sobre el proceso de fine-tuning, no publica benchmarks y su unico idioma declarado es el chino. Resulta util, en cambio, como ejemplo de adaptacion de un ASR moderno a un dominio vertical con despliegue local en hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (reconocimiento automatico del habla); detalles internos no disponibles |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); no se documentan otras variantes |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (solo Apple Silicon) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3-ASR-1.7B, un sistema ASR de la familia Qwen3. La model card no detalla la arquitectura interna del encoder acustico ni del decoder, ni la composicion exacta del dataset de entrenamiento; unicamente indica que el ajuste se realizo sobre "conferencias budistas chinas" (Chinese Buddhist lectures). No se especifican horas de audio, metodo de anotacion, ni si se aplicaron tecnicas de aumento de datos o correccion de transcripciones.

Tras el fine-tuning, los pesos se convirtieron a 8 bits para su ejecucion con MLX, el framework de Apple para inferencia en chips de la serie M. El repositorio ocupa 2,5 GB e incluye un fichero `model_manifest.json` con sumas de comprobacion de los ficheros. No hay informacion publicada sobre el proceso de cuantizacion (calibracion, capas afectadas) ni sobre posibles perdidas de precision respecto al modelo base en fp16/bf16.

## Capacidades

- Transcripcion de voz a texto en chino mandarin, con especializacion en discursos y conferencias budistas.
- Reconocimiento de vocabulario de dominio: terminologia budista, nombres propios y citas clasicas frecuentes en dharma talks.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de conexion a servicios en la nube.
- Integracion con la aplicacion macOS "为我闻思" y con el proyecto speech2docx para generar documentos a partir de audio.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla de la transcripcion ni modo "thinking".
- Capacidad multilingue: no disponible; solo se declara chino.

## Casos de uso

- Transcripcion de dharma talks para publicacion: el modelo convierte grabaciones de conferencias budistas en texto editable, con mejor manejo del lexico especializado que un ASR generico; es el caso de uso principal para el que fue entrenado.
- Generacion de subtitulos para videos de ensenanzas: integrado en el flujo de speech2docx, permite producir subtitulos en chino para archivos de audio o video de charlas.
- Archivo y busqueda de contenido doctrinal: al transcribir grandes colecciones de audio, se habilita la indexacion y busqueda textual de ensenanzas que antes solo existian en formato sonoro.
- Accesibilidad para practicantes con dificultades auditivas: transcripcion en tiempo casi real de charlas en directo o grabadas, ejecutada localmente en un Mac.
- Investigacion en linguistica y estudios religiosos: permite construir corpus anotados de discurso budista oral para analisis terminologico o estilistico.
- Prototipado de ASR de dominio en local: sirve como referencia para desarrolladores que quieran adaptar Qwen3-ASR a otros vocabularios especializados y desplegarlo con MLX en equipos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio pesa 2,5 GB en 8 bits; se recomienda al menos 4-6 GB de memoria unificada libre para la inferencia y los buffers intermedios.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No es ejecutable en GPU NVIDIA, AMD ni en CPU x86 con este formato.
- Cabe en equipos de consumo Apple: cualquier Mac con chip de la serie M y 8 GB o mas de memoria unificada deberia poder cargarlo, aunque no se publican mediciones.
- Opciones de despliegue: MLX (libreria `mlx`), la aplicacion macOS "为我闻思" y el repositorio speech2docx. No se ofrece GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| weiwowensi-asr-r3-8bit | 2.038.052.480 | no disponible | zh | Apache 2.0 | MLX safetensors 8-bit | Fine-tuning de dominio budista, solo Apple Silicon |
| Qwen/Qwen3-ASR-1.7B (base) | ~1.700 millones (nominal) | no disponible | multilingue segun modelo base | Apache 2.0 | safetensors | Modelo generalista del que deriva; sin especializacion |
| Whisper large-v3 | ~1.550 millones | 30 s por ventana | multilingue | MIT | safetensors, GGUF, etc. | Referencia ASR generalista, ampliamente desplegable en GPU y CPU |
| Whisper small | ~244 millones | 30 s por ventana | multilingue | MIT | safetensors, GGUF | Alternativa ligera para transcripcion en hardware modesto |

La comparacion con Whisper es orientativa: no se dispone de resultados de benchmarks del modelo evaluado frente a estas alternativas.

## Limitaciones y advertencias

- Solo reconoce chino (zh); no se declara soporte de otros idiomas ni de code-switching.
- Especifico de un dominio: el fine-tuning sobre discurso budista puede degradar el rendimiento en chino coloquial, tecnico o de otros registros respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (CER/WER) ni comparacion con el modelo base.
- Riesgo de alucinacion y de transcripciones plausibles pero incorrectas, especialmente con audio ruidoso, acentos marcados o terminologia fuera del dominio.
- Restriccion de plataforma: el formato MLX limita el uso a Apple Silicon; no hay pesos GGUF ni safetensors estandar para otros entornos.
- La model card indica "gratis para uso personal", mientras que la licencia declarada es Apache 2.0; conviene verificar las condiciones reales antes de un uso comercial.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni informes independientes de calidad.
- No se documentan sesgos concretos, pero al entrenarse sobre un corpus religioso puede reproducir sesgos propios de ese material.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jimbo5168/weiwowensi-asr-r3-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio speech2docx: https://github.com/jimbo5168/speech2docx
