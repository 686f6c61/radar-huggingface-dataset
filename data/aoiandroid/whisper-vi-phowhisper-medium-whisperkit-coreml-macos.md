# aoiandroid/whisper-vi-phowhisper-medium-whisperkit-coreml-macos

## Resumen

Este repositorio es una conversion a Core ML en formato WhisperKit del modelo de reconocimiento automatico del habla (ASR) `vinai/PhoWhisper-medium`, un fine-tune de `openai/whisper-medium` especializado en vietnamita. Lo publica el usuario `aoiandroid` como espejo ("mirror") para el proyecto TranslateBlue, y no incorpora ningun entrenamiento adicional: la unica modificacion respecto a los pesos originales es una palettizacion de pesos a 6 bits (k-means por tensor, post-entrenamiento) realizada con coremltools 9.0.

El modelo resuelve transcripcion de voz a texto en vietnamita de forma totalmente offline sobre hardware Apple (macOS/iOS), empaquetado en la estructura de ficheros que espera WhisperKit (`MelSpectrogram.mlmodelc`, `AudioEncoder.mlmodelc` y `TextDecoder.mlmodelc`). Se apoya en la arquitectura encoder-decoder transformer de Whisper medium, con una ventana de contexto de audio de 30 segundos, aunque el propio autor advierte que en la practica conviene limitar las ventanas a unos 15 segundos para no perder la ultima frase.

Su relevancia actual es doble: por un lado, acerca el ASR vietnamita de calidad (PhoWhisper, presentado en el track Tiny Papers de ICLR 2024) a dispositivos Apple sin conexion; por otro, documenta de forma poco habitual el impacto de la palettizacion a 6 bits, mostrando que la version comprimida iguala o supera ligeramente al modelo original en bf16 en las pruebas realizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper); encoder con SplitHeadsQ SDPA y decoder con Cat SDPA en la conversion Core ML |
| Parametros totales | No disponible en la model card (el modelo base `openai/whisper-medium` es de tamano "medium" de la familia Whisper) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Audio: ventana de 30 s (frames de mel); text decoder con KV length 448 y `sampleLength` de 224 tokens |
| Tipos de cuantizacion | Pesos palettizados a 6 bits (k-means por tensor, post-entrenamiento); tensores de menos de 2048 elementos permanecen en fp16 |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | BSD 3-Clause (misma que el modelo fuente; el base `openai/whisper-medium` es MIT) |
| Formato de pesos | Core ML (`.mlmodelc`), layout WhisperKit; tamano total del repo 0.6 GB (~556 MB de pesos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper medium, un transformer encoder-decoder disenado para ASR multilingue que procesa espectrogramas mel y genera texto de forma autoregresiva. La conversion a Core ML reutiliza los modulos `WhisperAudioEncoder` y `WhisperTextDecoder` de `argmaxinc/whisperkittools` (commit 84f77a83), con las mismas opciones fp16 / iOS16 que `whisperkit-generate-model`, cargando media red cada vez para caber en un Mac de 8 GB. Los ficheros resultantes son `MelSpectrogram.mlmodelc`, `AudioEncoder.mlmodelc` (237 MB) y `TextDecoder.mlmodelc` (344 MB, con KV length 448 y salida de alignment-head para timestamps por token). No se incluye `TextDecoderContextPrefill`, que en WhisperKit es opcional.

En cuanto a entrenamiento, no hay ninguno nuevo en este repositorio: los pesos proceden del fine-tune de `vinai/PhoWhisper-medium`, entrenado sobre 844 horas de voz en vietnamita (paper PhoWhisper, ICLR 2024 Tiny Papers). La unica transformacion aplicada es la compresion: palettizacion de pesos a 6 bits mediante k-means por tensor con coremltools 9.0, dejando en fp16 los tensores de menos de 2048 elementos. No se documenta uso de RLHF ni DPO. El TextDecoder expone una cabeza de alineacion para generar timestamps a nivel de token.

## Capacidades

- Reconocimiento automatico del habla (ASR) en vietnamita, con salida de transcripcion de texto.
- Generacion de timestamps por token mediante la alignment-head del TextDecoder.
- Inferencia totalmente offline sobre hardware Apple (macOS, iOS), sin dependencia de red.
- Procesamiento por ventanas de audio (por defecto sugerido de hasta 15 s para evitar perdidas de la ultima frase).
- Decodificacion greedy con fallback a temperatura 0.2 cuando se detecta compresion excesiva (ratio > 2.4) o baja confianza (logprob medio < -1).
- Integracion con el ecosistema WhisperKit y su pipeline de transcripcion.
- No soporta tool calling, function calling ni comportamiento de agente; es un modelo puramente de speech-to-text.
- No hay capacidades de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion offline en aplicaciones macOS/iOS: el modelo se ejecuta en local sobre Core ML, lo que permite convertir voz a texto en vietnamita sin enviar audio a un servidor, util para apps de notas o dictado con requisitos de privacidad.
- Subtitulado de video en vietnamita: gracias a los timestamps por token, se pueden generar subtitulos sincronizados en flujos de postproduccion o en herramientas de edicion que consuman WhisperKit.
- Busqueda y indexacion de contenido audiovisual: transcribir archivos de audio o video en vietnamita para despues indexar el texto y habilitar busqueda semantica o por palabras clave.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo cuasi-real de conversaciones o medios en vietnamita sobre un Mac o iPhone.
- Investigacion en ASR de bajos recursos: sirve como referencia para medir el impacto de la palettizacion a 6 bits y de la conversion Core ML frente a los pesos PyTorch originales.
- Analisis de emisiones y medios (por ejemplo, noticias de television): procesado de clips de audio largos troceados en ventanas de 15 s para obtener transcripciones sobre las que aplicar analitica de contenido.
- Prototipado rapido en el ecosistema Apple: al estar en formato WhisperKit, se integra directamente en apps Swift sin necesidad de convertir el modelo desde PyTorch.

## Benchmarks y rendimiento

Los datos de evaluacion que aparecen en la model card corresponden a una prueba offline realizada en Mac el 2026-09-30. La metrica "coverage" es la cobertura ponderada por frecuencia de las palabras de contenido de la transcripcion frente a la referencia, sobre clips de 60 s. Decodificacion greedy con un fallback a temperatura 0.2. Los clips de prueba son 5 fragmentos de FLEURS `vi_vn test` (a -26 dBFS, unidos con 0,5 s de silencio) y un clip de 60 s de noticias de television vietnamita con referencia de subtitulos.

| Modelo | Ventanas | FLEURS vi 60 s (media / min) | Clip de noticias 60 s |
|---|---|---|---|
| Este pack Core ML (CPU) | 15 s | 0.924 / 0.826 | 0.949 |
| Este pack Core ML (CPU) | 30 s | 0.929 / 0.844 | 0.899 |
| vinai/PhoWhisper-medium (PyTorch bf16) | 15 s | 0.926 / 0.826 | 0.945 |
| vinai/PhoWhisper-medium (PyTorch bf16) | 30 s | 0.927 / 0.835 | 0.895 |
| vinai/PhoWhisper-small (PyTorch) | 30 s | 0.906 / 0.826 | 0.865 |
| openai/whisper-small (PyTorch) | 30 s | 0.805 / 0.683 | 0.895 |

Nota metodologica del autor: el BPE vietnamita produce aproximadamente 1,9 tokens por palabra, por lo que una ventana de 28 s de habla densa de noticias supera el `sampleLength` de 224 tokens de WhisperKit y la ultima frase de la ventana se pierde de forma silenciosa. Por eso recomienda mantener ventanas de unos 15 s o menos.

## Requisitos de hardware

- VRAM/RAM: los pesos suman unos 556 MB (AudioEncoder 237 MB + TextDecoder 344 MB); el repositorio completo ocupa 0.6 GB. La conversion se realizo cargando media red cada vez para caber en un Mac de 8 GB.
- GPU recomendadas: no se especifican GPU discretas. El destino son chips Apple (Apple Silicon y, presumiblemente, CPUs Intel de Mac) ejecutando Core ML en CPU, segun indica la propia tabla de evaluacion ("this Core ML pack (CPU)").
- Cabe en hardware de consumo: si, esta disenado para Macs (se menciona un Mac de 8 GB durante la conversion) y para el ecosistema Apple en general.
- Opciones de despliegue: WhisperKit (formato nativo de este repositorio) y Core ML. No se proporcionan artefactos GGUF, vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es `.mlmodelc`.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia; solo la metrica de cobertura y la configuracion de decodificacion.
- Nota de despliegue: no incluye `TextDecoderContextPrefill`, que es opcional en WhisperKit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLEURS vi 60 s (30 s) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Este pack (Core ML, PhoWhisper-medium 6-bit) | No disponible en la model card | Audio 30 s; decoder KV 448 / 224 tokens | 0.929 / 0.844 | BSD 3-Clause | Core ML (WhisperKit) |
| vinai/PhoWhisper-medium (PyTorch bf16) | No indicado (familia medium) | Audio 30 s | 0.927 / 0.835 | BSD 3-Clause | PyTorch / safetensors (no confirmado) |
| vinai/PhoWhisper-small (PyTorch) | No indicado (familia small) | Audio 30 s | 0.906 / 0.826 | No disponible | PyTorch |
| openai/whisper-small (PyTorch) | No indicado (familia small) | Audio 30 s | 0.805 / 0.683 | MIT | PyTorch |

La comparativa se limita a los modelos que figuran en la propia evaluacion del autor. No hay datos de comparacion con otros formatos Core ML ni con variantes cuantizadas alternativas.

## Limitaciones y advertencias

- Ventana de audio efectiva: con ventanas de 28 s o mas en habla densa, el decoder supera los 224 tokens de `sampleLength` de WhisperKit y se pierde silenciosamente la ultima frase. Se recomienda usar ventanas de unos 15 s.
- Solo vietnamita: el modelo esta especializado exclusivamente en `vi`; no ofrece ASR multilingue ni cambio de idioma en inferencia.
- Riesgo de alucinacion: al ser un modelo de la familia Whisper, mantiene la tendencia conocida a generar texto plausible en silencios o audio poco claro; la decodificacion aplica un fallback a temperatura 0.2 para mitigar casos de baja confianza, pero no elimina el problema.
- Sesgos: no se documentan analisis de sesgos. El rendimiento puede degradarse en variedades dialectales, ruido ambiental o dominios alejados de los datos de entrenamiento (844 horas de voz vietnamita).
- Licencia: BSD 3-Clause, igual que el modelo fuente, e incluye la clausula de no usar el nombre del copyright holder para promocionar productos derivados. El modelo base `openai/whisper-medium` es MIT. Se debe citar PhoWhisper en trabajos derivados. El mirror no esta respaldado por VinAI.
- Ausencia de entrenamiento adicional: la palettizacion a 6 bits es la unica modificacion; el autor advierte que la compresion no implica reentrenamiento, por lo que no se debe asumir una mejora de calidad, sino a lo sumo equivalencia con el original.
- Formato y portabilidad: al distribuirse como Core ML, no es directamente usable fuera del ecosistema Apple ni en stacks de inferencia habituales (vLLM, llama.cpp, TGI).
- Tamano de muestra de evaluacion reducido: la evaluacion se basa en 5 clips de FLEURS mas un clip de noticias, por lo que las metricas deben tomarse como orientativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aoiandroid/whisper-vi-phowhisper-medium-whisperkit-coreml-macos
- Modelo base en HuggingFace: https://huggingface.co/vinai/PhoWhisper-medium
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-medium
- Paper PhoWhisper (ICLR 2024 Tiny Papers): https://github.com/VinAIResearch/PhoWhisper
- Herramientas de conversion WhisperKit: https://github.com/argmaxinc/whisperkittools
- Coleccion whisper del autor: https://huggingface.co/collections/aoiandroid/whisper
- whisper-large-v3 (referencia de la familia): https://huggingface.co/openai/whisper-large-v3
