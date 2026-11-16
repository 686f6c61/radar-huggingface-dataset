# Selbyggen/whisper-large-v3-fi-dialects-coreml

## Resumen

Selbyggen/whisper-large-v3-fi-dialects-coreml es una conversión de formato del modelo GAIK-project/whisper-large-v3-fi-dialects, un fine-tune de OpenAI Whisper large-v3 especializado en finés y, en particular, en dialectos finlandeses. El autor original es Akseli Leskinen (Haaga-Helia University of Applied Sciences) en el marco del proyecto GAIK, cofinanciado por la Unión Europea (FEDER), con cómputo en LUMI (CSC, Finlandia). Esta versión no introduce pesos nuevos: empaqueta los mismos pesos en Core ML para WhisperKit y los cuantiza a 8 bits para ejecutarse en el Neural Engine de Apple Silicon.

El modelo resuelve un problema concreto: la transcripción automática de habla finlandesa dialectal, donde los modelos generalistas degradan mucho. Según la model card, el error de palabra (WER) en el conjunto de dialectos SKN baja del 46,4 % con OpenAI large-v3 turbo al 23,1-23,2 % con este modelo, manteniendo además mejoras en FLEURS fi, Common Voice fi y VoxPopuli fi. Es relevante para desarrolladores de apps macOS, iOS e iPadOS que necesiten ASR local, sin conexión y con privacidad por diseño, como la app Sagt que ya lo utiliza.

El repositorio ocupa 1,5 GB y contiene el encoder de audio (618 MB) y el decoder de texto (868 MB) en Core ML int8. La arquitectura subyacente es la de Whisper large-v3 (transformer encoder-decoder), con el tokenizer original de openai/whisper-large-v3. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a Core ML |
| Parámetros totales | no disponible (heredados de Whisper large-v3) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantización | int8 lineal simétrico por canal (pesos 8 bits, activaciones 16 bits); mel spectrogram en float16; también existe variante float16 Core ML |
| Idiomas soportados | fi (finés, incluidos dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes compilados con coremlcompiler); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un encoder de audio que procesa espectrogramas mel y un decoder autoregresivo de texto, ambos transformers. Esta versión concreta no reentrena nada; aplica whisperkittools para generar paquetes Core ML en float16 y después coremltools.optimize.coreml.linear_quantize_weights con cuantización lineal simétrica int8 por canal, compilando el resultado con coremlcompiler. El mel spectrogram se mantiene en float16 sin cambios. Los ficheros config.json y generation_config.json se copian sin modificar del modelo original, y se reutiliza el tokenizer de openai/whisper-large-v3.

El entrenamiento original (GAIK-project/whisper-large-v3-fi-dialects) parte de Whisper large-v3 y se afina con datos finlandeses: Suomen kielen näytteitä (SKN, Kotus, CC BY 4.0), el corpus dialectal LA-murre (Universidad de Turku y Kotus, CC BY-ND 4.0), el Aalto Finnish Parliament ASR Corpus 2008-2020 (CLARIN), FLEURS (CC BY 4.0) y VoxPopuli (CC0), distribuidos vía Kielipankki. No se detalla en la información disponible el número de tokens, la composición exacta ni si hubo RLHF o DPO. La innovación técnica de esta conversión es la cuantización int8 con verificación: el decoder de 8 bits coincide con el modelo transformers original en el token top-1 en 8 de 8 posiciones sobre audio finlandés real, con PSNR mediano de 38,8 en el Neural Engine; las pruebas de whisperkittools dieron PSNR de 60,2 (decoder), 56,2 (encoder) y 67,6 (mel).

## Capacidades

- Reconocimiento automático de habla (ASR) en finés, con especial robustez en dialectos finlandeses.
- Transcripción de audio con la ventana estándar de Whisper (segmentos de hasta 30 s).
- Ejecución local en el Neural Engine de Apple Silicon (Mac, iPhone, iPad) mediante WhisperKit.
- Detección e indicación de idioma mediante DecodingOptions(language: "fi").
- Integración nativa en Swift a través de la API de WhisperKit (descarga de variante, transcripción de ficheros de audio).
- No se documentan en la información disponible capacidades de traducción, diarización, timestamps por palabra ni tool calling.

## Casos de uso

- Transcripción local en apps macOS/iOS/iPadOS: la app Sagt ya lo usa para transcripción finlandesa offline; el formato Core ML permite cargarlo directamente con WhisperKit sin servidores externos.
- Subtitulado de reuniones y entrevistas en finés: el WER de 10,8 % en VoxPopuli fi y 13,5 % en Common Voice fi lo hace adecuado para generar actas o subtítulos con revisión humana posterior.
- Archivística y patrimonio oral dialectal: la mejora de 46,4 % a 23,2 % de WER en SKN permite transcribir grabaciones dialectales que los modelos generalistas no manejan con calidad utilizable.
- Investigación lingüística y dialectología: permite procesar corpus de habla dialectal a gran escala con un modelo ajustado a las variedades regionales finlandesas.
- Accesibilidad y dictado por voz: al ejecutarse en el dispositivo, sirve para dictado en finés sin enviar audio a la nube, con latencia baja (RTF 0,25 en 8 bits).
- Transcripción de contenido parlamentario y administrativo: el ajuste incluye el Aalto Finnish Parliament ASR Corpus, lo que lo hace apropiado para audio institucional finlandés.
- Prototipado rápido en Swift: la descarga por variante ("GAIK_whisper-large-v3-fi-dialects_8bit") y la API de WhisperKit permiten integrar ASR en pocas líneas de código.

## Benchmarks y rendimiento

WER medido con WhisperKit en el Neural Engine, 75 clips por conjunto, misma normalización y código para todos los modelos (noviembre de 2026):

| Conjunto | OpenAI large-v3 turbo | Este modelo, float16 | Este modelo, 8 bits |
|---|---:|---:|---:|
| FLEURS fi | 8,3 % | 8,6 % | 8,1 % |
| Common Voice fi | 16,4 % | 13,1 % | 13,5 % |
| VoxPopuli fi | 13,8 % | 10,8 % | 10,8 % |
| SKN dialects | 46,4 % | 23,1 % | 23,2 % |

En cuanto a velocidad, el modelo de 8 bits fue aproximadamente 2,5 veces más rápido que el float16 en un Mac (factor de tiempo real 0,25 frente a 0,6). No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (Mac, iPhone, iPad); el formato Core ML no es portable a GPU NVIDIA ni CPU x86 sin reconversión.
- VRAM/memoria: el repositorio ocupa unos 1,49 GB (encoder 618 MB, decoder 868 MB); el consumo en ejecución depende de WhisperKit y del dispositivo, dato no disponible.
- GPU recomendadas: no aplica en el sentido habitual; requiere Neural Engine de Apple. Para GPU NVIDIA habría que usar el modelo original en transformers.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon (Mac con chip M-series, iPhone y iPad compatibles con Neural Engine).
- Despliegue: WhisperKit (librería whisperkit en Swift); también puede usarse el modelo base GAIK-project/whisper-large-v3-fi-dialects con transformers, vLLM o similar.
- Latencia y throughput: RTF 0,25 en 8 bits y 0,6 en float16 en un Mac (no se especifica el modelo exacto de Mac).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER SKN dialects | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (8 bits) | no disponible (Whisper large-v3) | ventana de 30 s | 23,2 % | Apache 2.0 | Core ML / WhisperKit |
| GAIK-project/whisper-large-v3-fi-dialects (float16) | no disponible (Whisper large-v3) | ventana de 30 s | 23,1 % | Apache 2.0 | transformers |
| OpenAI large-v3 turbo | no disponible | ventana de 30 s | 46,4 % | MIT (modelo OpenAI) | múltiples formatos |
| OpenAI Whisper large-v3 | 1.550 M aprox. (dato público de Whisper, no confirmado en la información) | ventana de 30 s | no disponible en esta comparativa | MIT (modelo OpenAI) | múltiples formatos |

## Limitaciones y advertencias

- Solo soporta finés (fi); no está pensado para otros idiomas y no se documenta comportamiento multilingüe.
- Es una conversión de formato, no un modelo nuevo: cualquier sesgo o limitación del modelo GAIK original se hereda íntegramente.
- Riesgo de alucinación propio de Whisper en audio con ruido, silencios largos o habla solapada; requiere revisión en producción.
- El WER en dialectos (23,2 %) sigue siendo alto en términos absolutos: un 23 % de palabras erróneas limita su uso sin corrección humana en dominios críticos.
- Dependencia de la plataforma Apple: el formato Core ML no se ejecuta en GPU NVIDIA, CPU x86 ni Android; para otros entornos hay que usar el modelo base.
- La cuantización int8 introduce una pérdida mínima pero medible (FLEURS fi empeora de 8,6 % a 8,1 % en este caso, es decir, mejora; Common Voice empeora de 13,1 % a 13,5 %).
- Los datos de entrenamiento originales no se publican en este repositorio; algunas fuentes (LA-murre, CC BY-ND 4.0) tienen restricciones de obra derivada que conviene revisar si se redistribuye.
- La licencia Apache 2.0 permite uso comercial, pero debe mantenerse la atribución a los autores originales del proyecto GAIK.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/whisper-large-v3-fi-dialects-coreml
- Modelo base: https://huggingface.co/GAIK-project/whisper-large-v3-fi-dialects
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Proyecto GAIK: https://gaik.ai/
- App Sagt: https://sagtapp.com/
- Tokenizer de referencia: https://huggingface.co/openai/whisper-large-v3
