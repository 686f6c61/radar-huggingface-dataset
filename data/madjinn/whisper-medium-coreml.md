# madjinn/whisper-medium-coreml

## Resumen

Whisper Medium (Core ML, int8) es una conversión del modelo de reconocimiento automático de habla Whisper Medium de OpenAI al formato Core ML de WhisperKit (Argmax), con los pesos cuantizados a 8 bits para ejecutarse en el Apple Neural Engine. La ha publicado el desarrollador Madjinn como componente del teclado de dictado WhispAway, y comparte grafo de operaciones con su variante KB-Whisper Medium 8-bit, de la que solo difiere en los pesos.

El problema que resuelve es concreto: ejecutar un ASR de 769 millones de parámetros con ventanas de 30 segundos completamente en local en Mac, iPhone e iPad, sin nube. La cuantización int8 deja los pesos en 775 MB (encoder 308 MB, decoder 459 MB), frente a los ~1,5 GB que ocuparían en fp16.

No se ha reentrenado nada: los pesos son los de `openai/whisper-medium` (revisión `abdf7c39`), convertidos con whisperkittools y cuantizados con coremltools 7.1. Las verificaciones publicadas muestran paridad casi exacta con fp16 (similitud coseno 0,9984–0,9988 en la salida del encoder), aunque la velocidad en dispositivo aún no está medida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tarea | Reconocimiento automático de habla (ASR) |
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 769 millones (heredados de openai/whisper-medium, según la documentación de OpenAI; sin reentrenamiento) |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 30 s de audio por ventana (480.000 muestras a 16 kHz); decodificador hasta 448 tokens con caché KV |
| Tipos de cuantización | int8 lineal simétrica por canal en pesos de 2048 elementos o más (AudioEncoder y TextDecoder); espectrograma Mel en fp16 |
| Idiomas soportados | Multilingüe (~99 idiomas según Whisper); etiquetado en inglés y chino; verificado en inglés, chino y sueco |
| Licencia | MIT (pesos de OpenAI); la copia del modelo base en Hugging Face está etiquetada Apache-2.0 |
| Formato de pesos | Core ML compilado (.mlmodelc), layout de WhisperKit; 18 archivos, 775.151.649 bytes (encoder 308 MB, decoder 459 MB) |
| Modelo base | openai/whisper-medium, revisión abdf7c39ab9d0397620ccaea8974cc764cd0953e |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder: un codificador convierte el espectrograma Mel (80 bandas, 3000 frames por ventana de 30 s) en embeddings de dimensión 1024 y 1500 posiciones, y un decodificador autoregresivo de 24 capas (deducibles de la caché KV de 24×1024×448) genera tokens sobre un vocabulario de 51.865 unidades. El grafo Core ML incluye caché KV explícita para decodificación incremental y una salida de `alignment_heads_weights`, el mecanismo que WhisperKit emplea para las marcas de tiempo a nivel de token. La conversión con whisperkittools usó atención `SplitHeadsQ` en el encoder y `Cat` en el decoder, ajustes orientados al Neural Engine.

Este repositorio no contiene entrenamiento alguno: los pesos son idénticos a los de openai/whisper-medium, el modelo multilingüe que OpenAI entrenó con unas 680.000 horas de audio débilmente supervisado. La transformación se limitó a: conversión a Core ML (whisperkittools `b5c1e50`, argmaxtools 0.1.7, coremltools 7.1, torch 2.2.1, transformers 4.39.1), cuantización int8 por canal (`linear_quantize_weights`, modo `linear_symmetric`, `weight_threshold=2048`) y compilación con `xcrun coremlcompiler` (coremlc 3520.5.1). Los archivos `config.json`, `generation_config.json` y `tokenizer.json` se copian sin cambios de OpenAI.

## Capacidades

- Transcripción de voz en ventanas de 30 s, con decodificación autoregresiva de hasta 448 tokens por ventana gracias a la caché KV integrada en el grafo.
- Cobertura multilingüe heredada de Whisper Medium (~99 idiomas); en esta conversión se han verificado inglés (transcripción exacta) y chino (idéntico a fp16 en 4 clips de FLEURS).
- Marcas de tiempo a nivel de token mediante la salida `alignment_heads_weights`, base del alineamiento palabra-audio en WhisperKit.
- Tarea de traducción a inglés heredada de Whisper, seleccionable mediante tokens de tarea en la decodificación.
- Ejecución on-device en Apple Silicon: pesos int8 para el Apple Neural Engine, espectrograma Mel en fp16 y modelos ya compilados (.mlmodelc).
- Integración con WhisperKit: el directorio sigue su layout (`modelRepo` + subcarpeta `whisper-medium-int8`), aunque el autor no ha probado esta vía.
- No incluye visión, generación de audio ni tool calling: es un modelo ASR puro.

## Casos de uso

- Dictado por voz en iPhone/iPad: es el propósito original del repositorio (teclado WhispAway); con 775 MB de pesos int8, el modelo cabe en memoria en móviles recientes y todo el audio se procesa en el dispositivo, sin enviar grabaciones a servidores.
- Transcripción local en apps Swift con WhisperKit: basta apuntar `modelRepo` a este repositorio y el submodelo a `whisper-medium-int8` (previa verificación, ya que el autor no lo ha probado).
- Subtitulado offline de vídeos en Mac: las ventanas de 30 s y los alignment heads permiten generar subtítulos con marcas de tiempo sin conexión ni coste por minuto de API.
- Transcripción de reuniones y notas de voz en chino e inglés: los dos idiomas verificados rinden igual que fp16 en las pruebas; conviene revisar nombres propios y homófonos en chino.
- Procesamiento por lotes de audio (podcasts, entrevistas) en Apple Silicon: al correr en local, elimina el coste variable de servicios en la nube y los riesgos de privacidad de subir grabaciones de terceros.
- Accesibilidad: dictado como alternativa al teclado y subtítulos en tiempo real para personas sordas o con dificultades motrices, aprovechando la ejecución íntegramente en el dispositivo.
- Plantilla reproducible de conversión: el README documenta herramienta, revisiones exactas y comando de conversión, útil como receta para convertir otros modelos Whisper a Core ML int8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay WER estándar en datasets como Common Voice o FLEURS completos). El autor sí documenta verificaciones de la conversión:

| Verificación | Resultado |
|---|---|
| Paridad PyTorch del encoder (PSNR frente a Hugging Face) | 146 dB |
| Paridad PyTorch del decoder | 131 dB, mismo token superior en todas las posiciones |
| Similitud coseno de la salida del encoder frente a fp16 | 0,9984–0,9988 |
| Inglés (frase de JFK, 11 s, greedy) | Transcripción idéntica a fp16 y exacta |
| Chino (4 clips de FLEURS dev, 7–18 s) | Idéntico a fp16; errores de homófonos y nombres heredados de fp16 |
| Sueco (1 clip, 8 s) | 2 de 16 palabras difieren de fp16 («skiljer» → «skilder») |
| Velocidad en dispositivo | No medida |

## Requisitos de hardware

- Plataforma: exclusivamente Apple (macOS, iOS, iPadOS) con Apple Silicon o Apple Neural Engine; el formato Core ML no es compatible con CUDA, vLLM, TGI, llama.cpp ni Ollama.
- Memoria: 775 MB de pesos int8 (encoder 308 MB, decoder 459 MB); con activaciones fp16 y caché KV la huella en ejecución será algo mayor (cifra exacta no disponible).
- Dispositivos: Macs con chip Apple Silicon (M1 o superior) e iPhone/iPad con Neural Engine; a ~775 MB es viable en móviles recientes, aunque el autor no publica requisitos mínimos de RAM.
- Software: WhisperKit (Swift) apuntando `modelRepo` a este repositorio, o un pipeline Core ML propio como el de WhispAway; los .mlmodelc ya vienen compilados.
- Latencia y throughput: no disponibles; el autor indica expresamente que la velocidad en dispositivo aún no se ha medido.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Tamaño de pesos | Ámbito | Licencia |
|---|---|---|---|---|---|
| madjinn/whisper-medium-coreml (este) | Core ML (WhisperKit) | int8 por canal | 775 MB | Multilingüe; en y zh verificados | MIT |
| openai/whisper-medium | PyTorch / safetensors | Sin cuantizar | ~3,1 GB en fp32 / ~1,5 GB en fp16 (estimado a partir de 769M de parámetros) | ~99 idiomas | MIT (GitHub de OpenAI); etiquetado Apache-2.0 en HF |
| argmaxinc/whisperkit-coreml (openai_whisper-medium) | Core ML (WhisperKit) | fp16 por defecto | No disponible | Multilingüe | No disponible |
| madjinn/kb-whisper-medium-coreml | Core ML (WhisperKit) | int8 por canal | ~775 MB (mismo grafo, solo cambian los pesos) | Sueco (KB-Whisper) | No disponible |

La diferencia clave frente a la conversión oficial de Argmax es la cuantización int8 documentada al detalle y la reducción de tamaño a la mitad; frente al modelo original de OpenAI, la ventaja es el formato ejecutable en Neural Engine.

## Limitaciones y advertencias

- Sueco ligeramente degradado respecto a fp16 (2 de 16 palabras distintas en la prueba); el autor recomienda su variante KB-Whisper Medium 8-bit para ese idioma.
- La cuantización int8 introduce desviaciones pequeñas pero medibles (coseno 0,9984–0,9988); pueden aparecer errores ocasionales que fp16 no comete.
- Sin datos de latencia ni throughput en dispositivo: validar rendimiento en hardware objetivo antes de producción.
- Compatibilidad con WhisperKit no probada por el autor: el layout sigue el de WhisperKit, pero él ejecuta los archivos con su propio pipeline de Core ML.
- Validación de conversión parcial: la conversión se ejecutó en Linux, donde Core ML no puede predecir, por lo que las pruebas de predicción del convertidor se sustituyeron por guardar el .mlpackage; la paridad se verificó en PyTorch y con transcripciones greedy en la CPU de un Mac.
- Limitaciones heredadas de Whisper: alucinaciones y repeticiones ante silencios, música o ruido de fondo; ventanas fijas de 30 s; errores en homófonos y nombres propios en chino (documentados en las pruebas).
- Idiomas sin verificar: aunque Whisper Medium cubre ~99 idiomas, esta conversión solo se ha comprobado en inglés, chino y sueco.
- Licencia con matiz: los pesos de OpenAI se publican bajo MIT, pero la copia del modelo base en Hugging Face está etiquetada Apache-2.0; revisar ambas antes de un despliegue comercial.
- Repositorio muy nuevo (0 descargas y 0 likes en el momento de redactar la ficha): sin historial comunitario que respalde de forma independiente las verificaciones del autor.

## Enlaces

- Ficha del modelo: https://huggingface.co/madjinn/whisper-medium-coreml
- Modelo base: https://huggingface.co/openai/whisper-medium
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools (Argmax): https://github.com/argmaxinc/whisperkittools
- Variante sueca del mismo autor (KB-Whisper Medium 8-bit): https://huggingface.co/madjinn/kb-whisper-medium-coreml
- WhispAway, teclado de dictado de Madjinn: https://madjinn.dev
