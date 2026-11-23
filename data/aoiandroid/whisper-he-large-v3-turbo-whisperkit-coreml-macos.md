# aoiandroid/whisper-he-large-v3-turbo-whisperkit-coreml-macos

## Resumen

Whisper large-v3-turbo Hebrew (ivrit.ai) — WhisperKit Core ML, 6-bit palettized es una conversion de formato del modelo de reconocimiento automatico del habla (ASR) `ivrit-ai/whisper-large-v3-turbo`, un ajuste fino en hebreo del `openai/whisper-large-v3-turbo` realizado por ivrit.ai. El autor de este repositorio, aoiandroid, ha empaquetado los pesos en el formato Core ML que espera WhisperKit (el runtime de inferencia on-device de Argmax para macOS e iOS) y ha aplicado una cuantizacion por palettization de 6 bits, reduciendo el paquete a aproximadamente 592 MB sin perdida medible de precision segun la evaluacion del propio autor.

El modelo resuelve la transcripcion de audio en hebreo sobre hardware Apple, sin necesidad de GPU dedicada ni de conexion a red. La relevancia de este artefacto no esta en el modelo de lenguaje subyacente —que es el transformer encoder-decoder estandar de Whisper large-v3-turbo, con unos 809 millones de parametros, de los cuales 4 son capas decoder y el resto encoder— sino en la cadena de conversion: dividir el encoder en dos mitades para que quepa en un Mac de 8 GB, palettizar los pesos y mantener la interfaz de entrada/salida identica a la de un encoder de un solo modelo.

Se trata de un espejo de conveniencia creado para el proyecto TranslateBlue, con cero descargas y cero likes en el momento de redactar esta ficha. No aporta entrenamiento nuevo: es exclusivamente una conversion de formato con cuantizacion post-entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a Core ML en pipeline de dos modelos para el encoder |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo ronda los 809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento en Whisper; KV del decoder con longitud 448 |
| Tipos de cuantizacion | Palettization de 6 bits (k-means por tensor, post-entrenamiento); tensores de menos de 2048 elementos permanecen en fp16 |
| Idiomas soportados | Hebreo (he) |
| Licencia | Apache 2.0 (modelo fuente ivrit-ai); el base OpenAI Whisper large-v3-turbo es MIT |
| Formato de pesos | Core ML (`.mlmodelc`): `MelSpectrogram.mlmodelc`, `AudioEncoder.mlmodelc`, `TextDecoder.mlmodelc`; mas `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con espectrograma mel de 128 bins como entrada, un encoder que procesa la ventana de audio y un decoder autorregresivo que genera tokens de transcripcion. El ajuste fino en hebreo lo realizo ivrit.ai sobre el modelo de OpenAI; este repositorio no anade entrenamiento alguno, solo conversion de formato.

La conversion se hizo con los modulos de `argmaxinc/whisperkittools` (commit 84f77a83). El encoder se convirtio en dos mitades —capas 0-15 y capas 16-31 mas layer norm— para que la conversion cupiera en un Mac de 8 GB, manteniendo los mismos nombres, formas y tipos de entrada/salida que un encoder de un solo modelo, de modo que WhisperKit lo consume sin cambios. Los pesos se palettizaron a 6 bits mediante k-means por tensor con coremltools; los tensores de menos de 2048 elementos se dejaron en fp16. No se incluye el modulo opcional `TextDecoderContextPrefill`. Segun el autor, la palettization no costo precision: el modelo fuente en PyTorch bf16 obtuvo 0.745 en la misma evaluacion, frente a 0.747 de este paquete.

## Capacidades

- Reconocimiento automatico del habla (ASR) en hebreo, con decodificacion greedy y token de idioma hebreo forzado.
- Transcripcion de audio por ventanas de 15 s en la configuracion de evaluacion descrita (el modelo acepta segmentos de hasta 30 s).
- Inferencia completamente offline y on-device en macOS mediante WhisperKit y Core ML, usando todas las unidades de computo disponibles (CPU, GPU y Neural Engine).
- Entrada de audio representada como espectrograma mel de 128 bins, procesado por el modulo `MelSpectrogram.mlmodelc` incluido.
- No soporta traduccion a otros idiomas ni otras tareas multitarea de Whisper mas alla de la transcripcion en hebreo, segun la informacion disponible.
- No se documenta soporte de tool calling, agentes, vision ni audio multimodal.

## Casos de uso

- Transcripcion de reuniones y notas de voz en hebreo en aplicaciones macOS nativas: el paquete Core ML se integra directamente en WhisperKit y permite transcribir sin enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual en hebreo: el modelo procesa ventanas de audio de 15-30 s y genera transcripciones que pueden alinearse con marcas de tiempo para generar subtitulos.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse on-device con un paquete de 592 MB, puede distribuirse dentro de una app macOS sin dependencias de servidor.
- Investigacion en ASR para hebreo: sirve como referencia reproducible en Core ML para comparar el impacto de la palettization frente a los pesos originales en PyTorch bf16.
- Prototipado de pipelines de transcripcion en el ecosistema Apple: util para validar latencia y consumo en Macs de 8 GB antes de invertir en infraestructura mayor.
- Archivado y busqueda de audio en hebreo: transcripcion por lotes de grabaciones para indexacion textual, ejecutable en un Mac de gama media sin GPU dedicada.

## Benchmarks y rendimiento

Evaluacion del autor en Mac, offline, el 2026-11-24. Metrica: cobertura ponderada por frecuencia de palabras de contenido frente a la referencia, sobre cinco clips de unos 60 s de FLEURS he_il `test` (a -26 dBFS, unidos con 0,5 s de silencio), ventanas de 15 s, decodificacion greedy con token de idioma hebreo. La metrica compara palabras completas, por lo que un prefijo (ה / ו / ב / ל / ש) escrito de forma distinta a la referencia cuenta como fallo.

| Clip | Este paquete (Core ML) | openai/whisper-large-v3-turbo (PyTorch bf16) |
|---|---|---|
| fleurs-0 | 0.767 | 0.750 |
| fleurs-1 | 0.835 | 0.652 |
| fleurs-2 | 0.900 | 0.909 |
| fleurs-3 | 0.579 | 0.430 |
| fleurs-4 | 0.652 | 0.554 |
| Media | **0.747** | 0.659 |

El modelo fuente en PyTorch bf16 obtuvo 0.745 en los mismos clips, por lo que la palettization no redujo la precision. No se han publicado resultados de WER estandar (LibriSpeech, Common Voice) ni comparaciones con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: el paquete completo ocupa unos 592 MB; la conversion se realizo en un Mac de 8 GB de memoria unificada, lo que sugiere que la inferencia cabe holgadamente en ese limite.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o posterior) con al menos 8 GB de memoria unificada; el modelo usa todas las unidades de computo de Core ML (CPU, GPU y Neural Engine).
- Cabe en GPU de consumo: si, en el sentido de que esta disenado para hardware Apple integrado; no esta pensado para GPUs NVIDIA.
- Opciones de despliegue: WhisperKit (runtime nativo), Core ML directamente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje en formato GGUF o safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este paquete (ivrit.ai large-v3-turbo, Core ML 6-bit) | no disponible (base ~809 M) | 30 s por segmento | he | Apache 2.0 | Core ML |
| ivrit-ai/whisper-large-v3-turbo (fuente) | no disponible (base ~809 M) | 30 s por segmento | he | Apache 2.0 | safetensors / PyTorch |
| openai/whisper-large-v3-turbo | no disponible (~809 M) | 30 s por segmento | multilingue | MIT | safetensors / PyTorch |
| openai/whisper-large-v3 | no disponible (~1550 M) | 30 s por segmento | multilingue | MIT | safetensors / PyTorch |

La ventaja de este paquete frente a los modelos en PyTorch es la ejecucion nativa en Core ML con un tamano reducido por la palettization; su desventaja es que solo cubre hebreo y depende del ecosistema Apple.

## Limitaciones y advertencias

- Solo transcribe hebreo; no es un modelo multilingue ni traduce a otros idiomas.
- La evaluacion del autor se limita a cinco clips de FLEURS he_il; no hay validacion sobre dominios acusticos diversos (ruido, acentos, habla espontanea).
- La metrica empleada (cobertura de palabras de contenido) no es un WER estandar, lo que dificulta la comparacion con otros trabajos.
- La palettization de 6 bits es una cuantizacion con perdida potencial; aunque el autor reporta que no costo precision en su evaluacion, no hay verificacion independiente.
- El encoder esta dividido en dos modelos Core ML; cualquier herramienta que espere un unico encoder debe adaptarse.
- No incluye `TextDecoderContextPrefill`, opcional en WhisperKit.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-23); se trata de un espejo de conveniencia para el proyecto TranslateBlue, no de un artefacto con adopcion comunitaria.
- No esta respaldado por ivrit.ai ni por OpenAI; el autor pide atribuir a ivrit.ai el uso del modelo.
- Licencia Apache 2.0 para el modelo fuente y MIT para el base de OpenAI; conviene revisar ambos ficheros `LICENSE` y `LICENSE-whisper-MIT` antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aoiandroid/whisper-he-large-v3-turbo-whisperkit-coreml-macos
- Modelo fuente: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- ivrit.ai: https://www.ivrit.ai
- Herramientas de conversion: https://github.com/argmaxinc/whisperkittools (commit 84f77a83)
