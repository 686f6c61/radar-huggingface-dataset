# FluidVoice-Labs/fluid-speech-pro-mlx

## Resumen

Fluid Speech Pro (MLX) es la conversión para Apple Silicon de Fluid Speech Pro, un modelo de reconocimiento automático del habla (ASR) de 0,63 mil millones de parámetros desarrollado por FluidVoice-Labs, el equipo detrás de la aplicación FluidVoice. El modelo parte de NVIDIA Parakeet TDT 0.6B v3 y conserva su cobertura de 25 lenguas europeas, con detección automática de idioma sin necesidad de indicar el idioma de entrada. Su función es transcribir audio a texto con puntuación, mayúsculas y marcas temporales, y está pensado para ejecutarse de forma local en equipos Mac con chip de Apple.

La relevancia de esta versión concreta está en el formato: los pesos están en safetensors y se ejecutan mediante la librería MLX a través de parakeet-mlx, lo que permite inferencia nativa en Apple Silicon sin depender de CUDA ni de servidores externos. El autor lo sitúa como el segundo mejor modelo abierto de la Open ASR Leaderboard con un WER medio de 6,06, y como el más preciso entre los modelos abiertos de menos de 1B de parámetros. La licencia CC BY 4.0 permite uso comercial.

La ficha se centra en la variante MLX, pero conviene tener presente que el modelo de referencia es la versión NeMo + Transformers y que existen conversiones adicionales a ONNX, GGUF y Core ML. Esta versión MLX incorpora además un modo "clean" opcional que elimina muletillas y palabras repetidas del texto transcrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 629.169.798 (0,63B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; parakeet-mlx admite procesamiento por chunks con `chunk_duration` para archivos largos) |
| Tipos de cuantizacion | pesos de 8 bits (`model.8bit.safetensors`) y fp32 (`model.safetensors`); cómputo en bfloat16 por defecto, con opción `dtype=mx.float32` |
| Idiomas soportados | 25 lenguas europeas: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX); el modelo base también se distribuye en NeMo/Transformers, ONNX, GGUF y Core ML |

## Arquitectura y entrenamiento

El modelo es un FastConformer con decodificador TDT (Token-and-Duration Transducer), la misma arquitectura de NVIDIA Parakeet TDT 0.6B v3 sobre la que se construye. Fluid Speech Pro añade un bloque pequeño entre el subsampling del encoder y la primera capa Conformer, que es precisamente lo que impide cargarlo con `parakeet_mlx.from_pretrained` sin más: el loader `fluid_speech_mlx.py` incorpora ese bloque y reproduce el cálculo de características de audio exactamente como lo hace NeMo. Según el autor, usar las características propias de parakeet-mlx en lugar de las de NeMo producía transcripciones distintas en 1 de cada 4 casos en su comprobación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El modelo base es Parakeet TDT 0.6B v3, por lo que hereda su entrenamiento multilingüe en 25 lenguas europeas, pero la model card no detalla el proceso de ajuste posterior realizado por FluidVoice-Labs. El modo "clean" se implementa como un añadido de 55 MB que el loader aplica sobre cualquiera de los dos conjuntos de pesos.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas con detección automática de idioma, sin prompt.
- Puntuación y mayúsculas incluidas en la salida.
- Marcas temporales a nivel de palabra y de segmento (la model card las atribuye a la versión NeMo; en MLX, `transcribe` devuelve marcas temporales de frase y de token).
- Modo "clean" opcional: elimina muletillas ("um", "uh") y palabras repetidas ("I I think") en las versiones NeMo, ONNX y MLX.
- Procesamiento de archivos largos mediante `chunk_duration` en parakeet-mlx.
- Cuantización a 8 bits para reducir el peso en memoria, con opción de ejecutar en fp32.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción local en Mac: un desarrollador puede transcribir reuniones o notas de voz directamente en un Mac con Apple Silicon usando parakeet-mlx, sin enviar audio a servicios en la nube y con pesos de 8 bits de 751 MB.
- Subtitulado y actas de reuniones multilingües: la detección automática de idioma y la cobertura de 25 lenguas europeas permiten procesar reuniones con participantes de distintos países sin configurar el idioma manualmente.
- Generación de subtítulos con marcas temporales: las marcas a nivel de frase y de token que devuelve `transcribe` sirven para alinear subtítulos en herramientas de edición de vídeo.
- Limpieza de transcripciones para publicación: el modo "clean" elimina muletillas y repeticiones, útil para convertir entrevistas grabadas en texto legible para blogs, documentación o artículos.
- Procesamiento por lotes de archivos largos: con `chunk_duration` se pueden transcribir horas de audio divididas en fragmentos, adecuado para archivos de podcast o grabaciones de clase.
- Aplicaciones de accesibilidad en macOS: integración en apps Swift o Python que conviertan dictado en texto en tiempo real sobre el Neural Engine o la GPU integrada, dado el tamaño reducido del modelo.
- Preprocesado de datos para entrenamiento: transcripción masiva de corpus de audio en lenguas europeas para generar datasets de texto anotados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Open ASR Leaderboard (WER medio) | 6,06 | Segundo mejor modelo abierto del ranking según el autor |
| URGENT 2024 (habla con ruido) | 9,83 WER | Segundo mejor modelo abierto en el conjunto de habla ruidosa |
| Comparación bajo 1B | 10% menos errores que el siguiente modelo abierto de menos de 1B | Dato del autor |
| Velocidad | ~3.700× tiempo real en una GPU | Una hora de audio en aproximadamente un segundo |
| Comprobación propia en esta versión | 400 clips de 8 conjuntos públicos (AMI, Earnings-22, GigaSpeech, LibriSpeech clean y other, Monsoon, SPGISpeech, VoxPopuli) | La model card no publica el valor numérico del WER en esta comprobación |

No se han publicado en la información disponible resultados desglosados por conjunto de test ni cifras de MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos de 8 bits ocupan 751 MB y los fp32 2,52 GB; el modo "clean" añade 55 MB. El cómputo en bfloat16 por defecto implica un consumo adicional de memoria para activaciones.
- Hardware objetivo: equipos Apple Silicon (Mac con chip M1, M2, M3 o M4 y sucesivos), ya que la librería es MLX. No está pensado para GPU NVIDIA; para esas plataformas existe la versión NeMo + Transformers.
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente; con 8 GB de memoria unificada debería ser viable en 8 bits.
- Despliegue: parakeet-mlx (librería Python) más el loader `fluid_speech_mlx.py`; requiere ffmpeg instalado para la lectura de audio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: el autor cita aproximadamente 3.700× tiempo real en una GPU para el modelo de referencia; no se publican cifras específicas para Apple Silicon en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Fluid Speech Pro (MLX) | 0,63B | 25 europeas | CC BY 4.0 | Versión Apple Silicon; WER medio 6,06 según el autor |
| Fluid Speech Pro (NeMo + Transformers) | 0,63B | 25 europeas | CC BY 4.0 | Modelo de referencia, para GPU NVIDIA y servidores |
| Fluid Speech Pro (ONNX) | 0,63B | 25 europeas | CC BY 4.0 | Para CPU con onnx-asr o sherpa-onnx |
| Fluid Speech Pro (GGUF) | 0,63B | 25 europeas | CC BY 4.0 | Para C++ con parakeet.cpp, sin Python |
| Fluid Speech Pro (Core ML) | 0,63B | 25 europeas | CC BY 4.0 | Para apps Swift en el Neural Engine con FluidAudio |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B | 25 europeas | no disponible en la información | Modelo base de NVIDIA sobre el que se construye |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables (Whisper, Canary, etc.) para establecer una comparación numérica de WER.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo por acento, edad, género o variedad dialectal; la cobertura se limita a 25 lenguas europeas y no incluye otras familias lingüísticas.
- Alucinación: como todo modelo ASR, puede producir texto plausible en segmentos con ruido extremo, silencios largos o audio musical; no se publican tasas de alucinación.
- Cobertura de idioma: fuera de las 25 lenguas europeas listadas, el rendimiento no está garantizado ni documentado.
- Dependencia de plataforma: esta variante solo funciona en Apple Silicon mediante MLX; para otros entornos hay que usar las versiones NeMo, ONNX, GGUF o Core ML.
- Loader no estándar: requiere `fluid_speech_mlx.py`; usar parakeet-mlx directamente con `from_pretrained` rechaza los pesos. El autor advierte que las características de audio propias de parakeet-mlx producen transcripciones distintas en 1 de cada 4 casos.
- Licencia: CC BY 4.0 permite uso comercial, pero exige atribución; conviene revisar los términos de la licencia del modelo base de NVIDIA para el uso derivado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el 13 de noviembre de 2026; es un lanzamiento reciente y poco validado por la comunidad.
- Marcas temporales: la model card atribuye las marcas a nivel de palabra y segmento a la versión NeMo; en MLX se devuelven marcas de frase y de token, lo que puede requerir adaptación en pipelines que esperen el formato NeMo.

## Enlaces

- Modelo en Hugging Face (MLX): https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-mlx
- Modelo base (NeMo + Transformers): https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Versión ONNX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-onnx
- Versión GGUF: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-gguf
- Versión Core ML: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Librería parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FluidVoice: https://fluidvoice.com
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
