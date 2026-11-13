# moonbox-dev/Qwen3-ASR-1.7B-MLX

## Resumen

Qwen3-ASR-1.7B-MLX es una conversión a formato MLX del modelo Qwen3-ASR-1.7B, un sistema de reconocimiento automático del habla (ASR) desarrollado originalmente por el equipo Qwen de Alibaba. La conversión la firma moonbox-dev y está pensada específicamente para su ejecución en Macs con Apple Silicon mediante el framework MLX y la librería mlx-audio. El modelo original resuelve la transcripción de audio a texto con un tamaño compacto de 1.700 millones de parámetros, lo que lo sitúa en la franja de modelos ASR desplegables en hardware de consumo.

El repositorio distribuye cuatro precisiones distintas (bf16, fp16, 8bit y presumiblemente otras según el tamaño del repo de 14,3 GB), cada una en su propia carpeta autocontenida. Según la model card, las transcripciones generadas por las versiones convertidas son idénticas a las del modelo original en PyTorch, con una tasa de error de palabra (WER) del 0,77 % y una tasa de error de carácter (CER) del 2,48 % sobre el conjunto de evaluación empleado por el autor de la conversión.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de última generación de forma nativa en macOS sobre silicio de Apple, sin depender de CUDA ni de infraestructura en la nube, manteniendo la fidelidad de transcripción del modelo original. La licencia Apache 2.0 facilita su integración tanto en proyectos personales como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; arquitectura interna del Qwen3-ASR original no detallada en la informacion proporcionada) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16, 8bit (versiones MLX); cuantizaciones adicionales no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo original Qwen3-ASR-1.7B (tipo de encoder de audio, decoder de texto, mecanismo de atencion ni composicion del dataset de entrenamiento). Lo que si se conoce es que se trata de un modelo de reconocimiento automático del habla con 1.700 millones de parametros, disenado para transcribir audio a texto. El pipeline declarado en Hugging Face es `automatic-speech-recognition`.

La conversion realizada por moonbox-dev no altera el modelo en si, sino que transforma los pesos del formato PyTorch original al formato MLX para su ejecucion en Apple Silicon. Segun la model card, las cuatro precisiones publicadas (bf16, fp16, 8bit y una cuarta no detallada en el fragmento disponible) producen transcripciones identicas a las del modelo original, con WER del 0,77 % y CER del 2,48 % en la evaluacion realizada por el autor de la conversion. No se dispone de informacion sobre el proceso de entrenamiento, el volumen de tokens de audio utilizados ni si se aplicaron tecnicas de RLHF o ajuste fino.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del modelo.
- Generacion de transcripciones con alta fidelidad: WER del 0,77 % y CER del 2,48 % segun la evaluacion del autor de la conversion.
- Ejecucion nativa en Apple Silicon mediante MLX y la libreria mlx-audio.
- Multiples precisiones disponibles (bf16, fp16, 8bit) para adaptar el uso de memoria y el rendimiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no constan en la informacion proporcionada).
- Capacidades especiales (vision, audio adicional, thinking mode): no disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en macOS: el modelo puede ejecutarse localmente en un Mac con Apple Silicon mediante mlx-audio, procesando el audio de reuniones sin enviar datos a servicios en la nube, lo que resulta adecuado por su tamano de 1,7B y su licencia permisiva.
- Subtitulado automatico de videos: integrado en un pipeline de postproduccion, el modelo genera transcripciones con un WER bajo (0,77 % en la evaluacion del autor), lo que reduce la necesidad de correccion manual en subtitulos.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse de forma nativa en Apple Silicon, puede incorporarse en herramientas de productividad para macOS que requieran transcripcion en tiempo real o casi real.
- Generacion de actas y resumenes a partir de audio: combinado con un modelo de lenguaje posterior, las transcripciones de alta fidelidad sirven como entrada para resumir reuniones o clases.
- Accesibilidad: transcripcion de contenido audiovisual para personas con discapacidad auditiva, aprovechando la licencia Apache 2.0 para su integracion en productos comerciales.
- Procesamiento por lotes de archivos de audio en un Mac: la disponibilidad de varias precisiones permite elegir entre mayor calidad (bf16/fp16) o menor uso de memoria (8bit) segun el volumen de trabajo.
- Investigacion en ASR: servir como linea base reproducible en experiments academicos sobre reconocimiento del habla en hardware de Apple, al ser una conversion fiel del modelo original.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles en la informacion proporcionada son los de fidelidad de la conversion respecto al modelo original, medidos por el autor de la conversion:

| Metrica | Version MLX (bf16/fp16/8bit) | Modelo original (PyTorch) |
|---|---|---|
| WER | 0,77 % | 0,77 % |
| CER | 2,48 % | 2,48 % |
| Transcripciones | Identicas al original | Referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el archivo `model.safetensors` de las versiones bf16 y fp16 ocupa 4,08 GB, por lo que se requiere al menos esa cantidad de memoria unificada para cargar los pesos, mas el overhead de activaciones y del procesador de audio.
- GPU recomendadas: el modelo esta disenado para Apple Silicon (serie M1, M2, M3, M4 y posteriores) mediante MLX; no se mencionan GPU NVIDIA en la informacion proporcionada.
- Compatibilidad con GPU de consumo: si, en Macs con Apple Silicon; la version 8bit reduce el uso de memoria respecto a bf16/fp16.
- Opciones de despliegue: mlx-audio (libreria declarada); no se detallan otras opciones como vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de ASR que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un modelo ASR, es previsible que herede los sesgos acusticos y linguisticos del dataset de entrenamiento original, pero no se detallan.
- Riesgo de alucinacion: no cuantificado; en modelos ASR, el riesgo se manifiesta como transcripciones erroneas o inventadas en audio con ruido, acentos no vistos o idiomas no cubiertos.
- Limitaciones de contexto o idioma: los idiomas soportados no constan en la informacion; la longitud de contexto de audio no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene conservar el aviso de licencia y el reconocimiento al modelo original Qwen3-ASR-1.7B.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que la conversion no ha sido validada de forma amplia por la comunidad; la evaluacion de fidelidad la firma el propio autor de la conversion, no un tercero independiente.
- Dependencia de ecosistema: requiere MLX y mlx-audio, por lo que no es directamente portable a entornos CUDA o CPU sin conversion adicional.
- Integridad de archivos: cada precision es una carpeta autocontenida; deben mantenerse juntos todos los archivos de una misma carpeta para evitar fallos de carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Qwen3-ASR-1.7B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Paper referenciado en los tags (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Libreria mlx-audio: no se proporciona enlace directo en la informacion disponible
- Framework MLX: no se proporciona enlace directo en la informacion disponible
