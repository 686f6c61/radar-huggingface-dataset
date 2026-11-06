# jcmd13/SenseVoiceSmall-TiinyOS

## Resumen

SenseVoiceSmall-TiinyOS es una conversión al formato MLX del modelo SenseVoiceSmall de FunAudioLLM, un sistema de reconocimiento automático de voz (ASR) diseñado para transcripción multilingüe con detección de emociones y eventos acústicos. El modelo original está desarrollado por el equipo FunAudioLLM de Alibaba, y esta variante concreta ha sido convertida por el usuario jcmd13 mediante la librería mlx-audio en su versión 0.4.0 para su ejecución nativa en hardware Apple Silicon.

El modelo emplea una arquitectura no autorregresiva basada en el paradigma SenseVoice, que combina un encoder de audio con un decoder no autoregresivo, lo que le permite transcribir audio a texto con una latencia muy inferior a la de los modelos ASR basados en transformers encoder-decoder convencionales. Con 233.999.167 parámetros (aproximadamente 234 millones), se posiciona en el rango de modelos ASR ligeros, adecuados para inferencia en dispositivos de consumo.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de calidad producción directamente en Macs con chip M-series mediante el framework MLX de Apple, sin necesidad de GPUs dedicadas ni de infraestructura cloud. El repo ocupa 0,9 GB y está pensado para integración en aplicaciones de transcripción local, subtitulado y análisis de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice (encoder-decoder no autorregresivo para ASR) |
| Parametros totales | 233.999.167 (~234 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base SenseVoiceSmall soporta multiples idiomas, pero no se detalla en esta ficha) |
| Licencia | model-license (otra, enlazada a FunASR MODEL_LICENSE) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

SenseVoiceSmall emplea una arquitectura no autorregresiva especifica para reconocimiento de voz, distinta de los enfoques encoder-decoder clasicos como Whisper. El modelo procesa el audio de entrada mediante un encoder y genera la secuencia de texto de salida de forma paralela, lo que reduce drasticamente el coste de decodificacion y permite latencias muy bajas en comparacion con modelos autorregresivos. Esta variante concreta ha sido convertida a MLX, el framework de arrays de Apple optimizado para Apple Silicon, manteniendo la estructura del modelo original pero adaptando los tensores al formato nativo de MLX.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens de audio utilizados, ni sobre si se aplicaron tecnicas de RLHF o DPO en esta ficha. El modelo base SenseVoiceSmall de FunAudioLLM esta entrenado para transcripcion multilingue, deteccion de idioma, reconocimiento de emociones y deteccion de eventos acusticos, pero los detalles concretos del entrenamiento no estan disponibles en la informacion proporcionada. La conversion a MLX se realizo con mlx-audio 0.4.0 y no se documentan cambios en los pesos mas alla de la conversion de formato.

## Capacidades

- Reconocimiento automatico de voz (ASR): transcripcion de audio a texto.
- Conversión a formato MLX para ejecucion nativa en Apple Silicon (chips M1/M2/M3/M4).
- Integracion con la libreria mlx-audio para pipelines de audio en Python.
- El modelo base SenseVoiceSmall soporta, segun su model card original, deteccion de idioma, reconocimiento de emociones y deteccion de eventos acusticos; sin embargo, no se confirma en esta ficha que la conversion MLX preserve todas estas capacidades.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte de vision ni audio mas alla del propio ASR.
- Capacidades multilingues: no detalladas en la informacion disponible para esta variante.

## Casos de uso

- Transcripcion local en macOS: ejecutar el modelo directamente en un Mac con chip M-series mediante MLX para transcribir reuniones, entrevistas o notas de voz sin enviar audio a servicios cloud, gracias a la naturaleza local del framework MLX.
- Subtitulado automatico de video: integrar el modelo en pipelines de postproduccion para generar subtitulos en tiempo casi real, aprovechando la arquitectura no autorregresiva que reduce la latencia de decodificacion.
- Asistentes de voz en aplicaciones de escritorio: incorporar ASR local en apps nativas de macOS para dictado por voz o comandos hablados, sin dependencia de APIs externas.
- Prototipado de investigacion en ASR: usar la conversion MLX como base para experimentos de fine-tuning o evaluacion de tecnicas de reconocimiento de voz en hardware Apple, con un modelo de 234 M de parametros manejable en memoria unificada.
- Analisis de audio en entornos con privacidad estricta: procesar grabaciones sensibles (sanitarias, legales) en local, evitando la transmision de datos a terceros.
- Herramientas de accesibilidad: transcripcion en vivo para personas con discapacidad auditiva en entornos macOS, con inferencia en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~234 M de parametros en formato MLX, la huella de memoria es reducida; en fp16 se estima en torno a 0,5 GB de pesos, mas overhead de activaciones y del encoder de audio. No se dispone de cifras oficiales.
- GPU recomendadas: el modelo esta disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No esta pensado para GPUs NVIDIA, aunque el modelo base original podria ejecutarse en CUDA con otras herramientas.
- Cabe en GPU de consumo: si, en cualquier Mac con chip M-series; tambien cabria en GPUs de consumo con suficiente memoria si se convierte a otros formatos, aunque esta variante es especifica de MLX.
- Opciones de despliegue: mlx-audio (libreria principal), potencialmente MLX-LM para integraciones, y el ecosistema MLX de Apple. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SenseVoiceSmall-TiinyOS | ~234 M | No disponible | model-license (other) | safetensors (MLX) | Hugging Face, 27 descargas |
| FunAudioLLM/SenseVoiceSmall (original) | ~234 M | No disponible | model-license (other) | safetensors (PyTorch) | Hugging Face, modelo base |
| Whisper small (OpenAI) | ~244 M | 30 s de audio por ventana | MIT | safetensors, GGUF, etc. | Amplia, multiples frameworks |
| Whisper base (OpenAI) | ~74 M | 30 s de audio por ventana | MIT | safetensors, GGUF, etc. | Amplia, multiples frameworks |

La comparativa con Whisper es la mas directa por tamano y tarea. SenseVoiceSmall destaca por su arquitectura no autorregresiva (menor latencia) y por capacidades adicionales de deteccion de emociones y eventos, mientras que Whisper tiene una licencia mas permisiva (MIT) y un ecosistema de despliegue mucho mas amplio (llama.cpp, whisper.cpp, etc.). Esta variante MLX es especifica para Apple Silicon y no compite en portabilidad con las alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "model-license" enlazada a FunASR MODEL_LICENSE puede imponer condiciones al uso comercial; es imprescindible revisarla antes de desplegar en produccion.
- Conversión no oficial: se trata de una conversion realizada por un usuario (jcmd13) a partir del modelo original, sin garantias de que preserve todas las capacidades del modelo base.
- Idiomas no documentados: no se detalla en esta ficha que idiomas soporta la conversion, aunque el modelo base es multilingue; conviene verificar antes de usarlo en produccion.
- Riesgo de alucinacion: como todo modelo ASR, puede generar transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario tecnico.
- Sesgos: no documentados en la informacion disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Ecosistema limitado: solo funciona con mlx-audio/MLX, lo que restringe su uso a hardware Apple Silicon y a ese ecosistema concreto.
- Sin benchmarks publicados: no hay datos de rendimiento que permitan comparar objetivamente con alternativas.
- Comunidad muy reducida: 27 descargas y 0 likes, lo que implica poca validacion por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcmd13/SenseVoiceSmall-TiinyOS
- Modelo base original: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Repositorio FunASR (ModelScope): https://github.com/modelscope/FunASR
- Libreria mlx-audio: no se proporciona enlace directo en la informacion disponible
