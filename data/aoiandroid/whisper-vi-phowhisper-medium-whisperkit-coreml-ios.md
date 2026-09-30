# aoiandroid/whisper-vi-phowhisper-medium-whisperkit-coreml-ios

## Resumen

Este repositorio es una conversión a Core ML (formato WhisperKit) del modelo de reconocimiento automático de voz `vinai/PhoWhisper-medium`, un ajuste fino de `openai/whisper-medium` sobre 844 horas de audio en vietnamita. Lo publica el usuario `aoiandroid` como espejo para el proyecto TranslateBlue, con el único cambio respecto a los pesos originales de una palettización de 6 bits aplicada tras el entrenamiento. No hay reentrenamiento ni modificación de la arquitectura.

El modelo resuelve transcripción de voz en vietnamita en dispositivos Apple sin conexión, empaquetado en el formato que consume WhisperKit (`.mlmodelc`). El paquete ocupa unos 556 MB en total, con un codificador de audio de 237 MB y un decodificador de texto de 344 MB, lo que permite ejecutarlo en iPhone, iPad y Mac con Apple Silicon sin GPU dedicada.

Es relevante porque cubre un nicho poco servido: ASR vietnamita de calidad media-alta con licencia permisiva (BSD 3-Clause) y ejecución local en hardware de consumo. Además, la model card documenta una limitación práctica importante de la integración WhisperKit con vietnamita (el desbordamiento del `sampleLength` de 224 tokens en habla densa) que conviene conocer antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a Core ML para WhisperKit |
| Parametros totales | 769 M (arquitectura whisper-medium de OpenAI) |
| Longitud de contexto | KV length 448 en el TextDecoder; ventana de audio de 30 s de Whisper, con recomendacion del autor de usar ventanas de ~15 s |
| Tipos de cuantizacion | Palettizacion de 6 bits por tensor (k-means post-entrenamiento, coremltools 9.0); tensores de menos de 2048 elementos se mantienen en fp16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD 3-Clause |
| Formato de pesos | Core ML (`.mlmodelc`): MelSpectrogram, AudioEncoder y TextDecoder; sin `TextDecoderContextPrefill` |

## Arquitectura y entrenamiento

La base es `openai/whisper-medium`, un transformer encoder-decoder con codificador de audio y decodificador de texto autorregresivo. VinAI lo ajusto sobre 844 horas de voz en vietnamita para producir PhoWhisper-medium, publicado en el track Tiny Papers de ICLR 2024. Este repositorio no modifica esa arquitectura: la convierte al layout de WhisperKit usando los modulos de `argmaxinc/whisperkittools` (commit 84f77a83), con las mismas clases `WhisperAudioEncoder` (SplitHeadsQ SDPA) y `WhisperTextDecoder` (Cat SDPA) y los mismos ajustes fp16 / iOS16 que `whisperkit-generate-model`.

La unica transformacion sobre los pesos originales es la compresion: palettizacion de 6 bits por tensor mediante k-means post-entrenamiento con coremltools 9.0. Los tensores de menos de 2048 elementos permanecen en fp16. La conversion se hizo cargando una mitad del modelo cada vez para caber en un Mac de 8 GB. El decodificador incluye salida de alignment heads para timestamps por token y una KV length de 448. El paquete no incluye `TextDecoderContextPrefill`, que es opcional en WhisperKit. No hubo RLHF, DPO ni entrenamiento adicional de ningun tipo.

## Capacidades

- Transcripcion de voz en vietnamita (ASR) con salida de texto y timestamps por token.
- Ejecucion totalmente offline en dispositivos Apple mediante Core ML y WhisperKit.
- Procesamiento por ventanas de audio, con decodificacion greedy y una caida a temperatura 0.2 cuando la relacion de compresion supera 2.4 o el logprob medio baja de -1.
- Generacion de timestamps alineados a nivel de token gracias a la cabeza de alignment del decodificador.
- No soporta traduccion a ingles (a diferencia del Whisper multilingue original), ni tool calling, ni agentes, ni vision, ni audio mas alla de ASR.
- No hay modo de razonamiento explicito ni capacidades multimodales.

## Casos de uso

- Transcripcion offline en apps iOS: el paquete `.mlmodelc` se integra directamente en WhisperKit y permite dictado o notas de voz en vietnamita sin enviar audio a ningun servidor, lo que simplifica el cumplimiento de privacidad.
- Subtitulado de contenido audiovisual vietnamita: los timestamps por token permiten generar subtitulos sincronizados para videos, podcasts y retransmisiones, procesando el audio en ventanas de ~15 s.
- Atencion al cliente y centros de llamadas: transcripcion de conversaciones telefonicas en vietnamita para analitica posterior, control de calidad o busqueda de texto sobre grabaciones.
- Archivado y busqueda de audio: convertir horas de grabaciones en texto indexable con marcas temporales, habilitando busqueda semantica sobre el archivo historico.
- Accesibilidad en tiempo real: generacion de subtitulos en directo en aplicaciones moviles nativas de Apple, apoyandose en el Neural Engine del dispositivo.
- Investigacion en ASR vietnamita: el modelo sirve como punto de comparacion reproducible frente a PhoWhisper-medium en PyTorch, con la ventaja de un consumo de memoria bastante menor.
- Prototipado rapido en Mac: cualquier Mac con Apple Silicon puede ejecutar el paquete sin GPU dedicada, lo que facilita pruebas de concepto y evaluaciones locales.
- Pipelines de transcripcion en lote: procesar colecciones de clips en un Mac o en un servidor con CPU, dado el reducido tamano del paquete (556 MB).

## Benchmarks y rendimiento

Resultados publicados por el autor (Mac, offline, 2026-09-30). La metrica es la cobertura ponderada por frecuencia de palabras de contenido de la transcripcion frente a la referencia, sobre clips de 60 s. Decodificacion greedy con una caida a temperatura 0.2.

| Modelo | Ventanas | FLEURS vi 60 s (media / min) | Clip de noticias de 60 s |
|---|---|---|---|
| Este paquete Core ML (CPU) | 15 s | 0.924 / 0.826 | 0.949 |
| Este paquete Core ML (CPU) | 30 s | 0.929 / 0.844 | 0.899 |
| vinai/PhoWhisper-medium (PyTorch bf16) | 15 s | 0.926 / 0.826 | 0.945 |
| vinai/PhoWhisper-medium (PyTorch bf16) | 30 s | 0.927 / 0.835 | 0.895 |
| vinai/PhoWhisper-small (PyTorch) | 30 s | 0.906 / 0.826 | 0.865 |
| openai/whisper-small (PyTorch) | 30 s | 0.805 / 0.683 | 0.895 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a un modelo de ASR.

## Requisitos de hardware

- Tamano del paquete: ~556 MB en disco (encoder de audio 237 MB, decoder de texto 344 MB).
- No requiere GPU dedicada: esta disenado para Core ML, de modo que aprovecha Neural Engine y GPU integrada de los chips Apple.
- Dispositivos de destino: iPhone y iPad compatibles con iOS 16 o superior, y Macs con Apple Silicon. La conversion se realizo en un Mac de 8 GB de memoria unificada.
- En GPUs de servidor (A100, H100, RTX 4090) no hay una ruta de despliegue directa, ya que el formato es Core ML; habria que usar los pesos PyTorch originales.
- Opciones de despliegue: WhisperKit (integracion nativa en iOS y macOS) y la cadena de herramientas de coremltools / whisperkittools. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Cobertura FLEURS vi 60 s (media) |
|---|---|---|---|---|---|
| Este paquete Core ML (15 s) | 769 M | vietnamita | Core ML 6-bit | BSD 3-Clause | 0.924 |
| vinai/PhoWhisper-medium | 769 M | vietnamita | PyTorch bf16 | BSD 3-Clause | 0.926 |
| vinai/PhoWhisper-small | ~244 M | vietnamita | PyTorch | BSD 3-Clause | no disponible a 15 s; 0.906 a 30 s |
| openai/whisper-small | ~244 M | multilingue | PyTorch | MIT | no disponible a 15 s; 0.805 a 30 s |

La diferencia de cobertura entre este paquete y el PhoWhisper-medium original es de dos milésimas en FLEURS, dentro del ruido de la metrica, mientras que el tamano en disco es muy inferior al de los pesos bf16.

## Limitaciones y advertencias

- Solo vietnamita: no hereda la capacidad multilingue ni la traduccion a ingles del Whisper medium original.
- Riesgo de alucinacion y de saltos de frase: el autor documenta que una ventana de 28 s de habla densa supera el `sampleLength` de 224 tokens de WhisperKit y la ultima frase se pierde silenciosamente. La recomendacion explicita es mantener ventanas de ~15 s o menos.
- El BPE vietnamita consume aproximadamente 1.9 tokens por palabra, lo que agrava el problema anterior en habla rapida o densa.
- La palettizacion de 6 bits introduce una perdida de precision que, segun los datos del autor, es minima en las metricas evaluadas, pero no se han publicado pruebas exhaustivas en dominios acusticos dificiles.
- Alucinaciones tipicas de Whisper en silencios, musica o ruido de fondo, con posible generacion de texto plausible pero incorrecto.
- Licencia BSD 3-Clause: permite uso comercial con atribucion a VinAI, conservacion del aviso de copyright y sin uso del nombre de los contribuyentes para promocionar productos derivados. El modelo base `openai/whisper-medium` se distribuye bajo MIT.
- El espejo no esta respaldado ni validado por VinAI; el autor indica explicitamente que no cuenta con su aprobacion.
- No incluye `TextDecoderContextPrefill`, por lo que algunas optimizaciones opcionales de WhisperKit quedan fuera del paquete.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni historial de uso en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/whisper-vi-phowhisper-medium-whisperkit-coreml-ios
- Modelo base: https://huggingface.co/vinai/PhoWhisper-medium
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-medium
- Repositorio y paper de PhoWhisper: https://github.com/VinAIResearch/PhoWhisper
- Herramientas de conversion de WhisperKit: https://github.com/argmaxinc/whisperkittools
- Coleccion Whisper del autor: https://huggingface.co/collections/aoiandroid/whisper
- Repositorio auxiliar del autor: https://huggingface.co/aoiandroid/whisperkit-coreml
- Documentacion de Whisper en Wikipedia: https://en.wikipedia.org/wiki/Whisper_(speech_recognition_system)
