# Ohjaaja/LFM3-Omni-2B-Q8_0_XL-GGUF

## Resumen

LFM3-Omni-2B-Q8_0_XL-GGUF es una cuantización de 8 bits (Q8_0) publicada por el usuario Ohjaaja en Hugging Face, basada en el modelo LFM3-Omni-2B de LiquidAI. Se trata de una variante "near-lossless" (casi sin pérdida) preparada para ejecutarse con llama.cpp, orientada a escenarios on-device y edge AI. El modelo base es un modelo omni (any-to-any) de aproximadamente 1,73 mil millones de parámetros que combina capacidades de texto, visión y audio, incluyendo entrada de voz y salida de habla (TTS).

La relevancia de esta cuantización reside en que preserva íntegramente los componentes multimodales críticos: el depthformer MaskGIT que predice los 12 codebooks de audio y el decodificador liquid-codec se mantienen en precisión F16/F32 dentro del archivo mmproj, mientras que el backbone de texto se cuantiza a Q8_0 con los embeddings de tokens en F16. Esto permite ejecutar el pipeline completo (texto, visión, audio y TTS) en hardware modesto sin degradar apreciablemente la calidad del habla generado.

El repositorio requiere una versión reciente de llama.cpp (build b11963 o posterior, o master actual), ya que el soporte de la arquitectura LFM3 se incorporó el 27 de octubre de 2026 mediante el PR #31252. Es un modelo conversacional, no de razonamiento, con soporte para 23 idiomas, entre ellos el castellano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, generación 3), omni/any-to-any; no disponible detalle interno completo |
| Parámetros totales | 1.728.801.600 (dato real del checkpoint safetensors) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantización | Q8_0 (backbone y mmproj), con `token_embd` en F16, componentes de audio (depthformer embeddings, codec) en F16/F32, convoluciones y normas en F32 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (licencia "other", enlace a LICENSE de LiquidAI/LFM3-Omni-2B) |
| Formato de pesos | GGUF (2 archivos: backbone de 1,95 GiB con 287 tensores y mmproj de 582,31 MiB con 458 tensores) |

## Arquitectura y entrenamiento

LFM3-Omni-2B es un modelo omni de la familia LFM (Liquid Foundation Models) de LiquidAI, con un pipeline any-to-any que abarca texto, visión y audio. La arquitectura incorpora elementos técnicos distintivos: un backbone de texto con normalizaciones y convoluciones cortas (`shortconv`), una torre de visión con proyector, un codificador de audio con proyector, y un sistema de generación de habla compuesto por un depthformer estilo MaskGIT que predice 12 codebooks de audio (multi-codebook/MTP head) y un decodificador liquid-codec que reconstruye la forma de onda. A diferencia de otros modelos, no dispone de una cabeza especulativa NextN; su cabeza multi-token es precisamente el depthformer de audio.

En cuanto al entrenamiento del modelo base, la información disponible en la model card de esta cuantización no incluye detalles sobre el número de tokens, la composición del dataset ni el uso de RLHF/DPO: no disponible. La cuantización Q8_0_XL se realizó convirtiendo el checkpoint BF16 a GGUF y cuantizando después con `llama-quantize`, aplicando anulaciones selectivas: `token_embd` y `output.weight` (atado a los embeddings) en F16 en el backbone, y en el mmproj se protegieron en F16/F32 los embeddings de los codebooks (`a.gen.code.embd`, 12×2017×1024), la cabeza de salida (`a.gen.code.out_embd`, 24204×2048), el decodificador codec (`a.gen.wav.*`), los kernels convolucionales y `v.patch_embd`. El resultado son 9,64 BPW en el backbone y 10,29 BPW en el mmproj.

## Capacidades

- Generación de texto conversacional en 23 idiomas, incluido el castellano; muestreo greedy por defecto en texto.
- Comprensión de imágenes (visión) mediante la torre de visión y el proyector incluidos en el mmproj.
- Comprensión de audio: acepta entrada de audio (voz) gracias al codificador de audio.
- Salida de habla (TTS): genera voz mediante el depthformer MaskGIT que predice 12 codebooks de audio y el decodificador liquid-codec; parámetros por defecto `audio_temperature=0.4` y `audio_repetition_penalty=1.2`.
- Pipeline any-to-any: combina modalidades de entrada (texto, imagen, audio) y salida (texto, audio).
- Diseñado para ejecución on-device y edge AI gracias a su tamaño reducido (~2,7 GB el repo completo).
- No es un modelo de razonamiento: en llama.cpp debe pasarse `--reasoning off` para evitar bloques de pensamiento vacíos al inicio de cada turno.
- No hay información disponible sobre soporte de tool calling/function calling ni sobre capacidades agénticas multi-paso.

## Casos de uso

- Asistentes de voz on-device: gracias al pipeline de entrada de voz y salida TTS integrado, permite construir asistentes conversacionales por voz que funcionan completamente en local, sin enviar audio a la nube, algo adecuado para privacidad y dispositivos sin conectividad constante.
- Transcripción y comprensión de comandos de voz en edge: el codificador de audio permite interpretar hablas del usuario en dispositivos de recursos limitados, con un footprint de ~2,5 GB en disco.
- Descripción y consulta de imágenes en local: la torre de visión permite responder preguntas sobre imágenes en aplicaciones móviles o embebidas, por ejemplo lectura de documentos o etiquetado automático de fotos.
- Generación de voz para interfaces y IVR locales: el endpoint `/tts` de llama-server permite sintetizar habla (voz femenina disponible en los ejemplos) para aplicaciones de atención al cliente o sistemas embebidos que necesiten respuestas habladas.
- Chatbots multilingües ligeros: con soporte de 23 idiomas y un modelo de ~1,7B de parámetros, es adecuado para despliegues de atención al cliente en varios idiomas en servidores pequeños o incluso portátiles con GPU modesta.
- Prototipado de agentes multimodales en local: servir el modelo con `llama-server` expone una API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integrarlo en aplicaciones que combinen texto, imágenes y audio sin coste de API externa.
- Aplicaciones de accesibilidad: descripción de imágenes y lectura en voz alta de textos combinando visión y TTS en un único modelo local, útil para herramientas de asistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone ocupa 1,95 GiB y el mmproj 582,31 MiB, por lo que el conjunto requiere aproximadamente 2,6 GiB de memoria, más la KV cache (el ejemplo usa un contexto de 4096 tokens). En Q8_0 es realista ejecutarlo en GPUs con 4 GB de VRAM o incluso en CPU con RAM suficiente; no se publican cifras exactas de VRAM.
- GPU recomendadas: cualquier GPU moderna de gama media basta dada la huella reducida; opciones típicas serían RTX 3060 de 12 GB, RTX 4060 Ti o superiores. Para CPU pura, cualquier equipo con ~8 GB de RAM libres debería ser suficiente. No se publican recomendaciones oficiales.
- Cabe cómodamente en GPUs de consumo: sí, incluso en tarjetas de 4-6 GB de VRAM, y es viable en portátiles y SBCs orientados a edge AI.
- Despliegue: llama.cpp es el runtime soportado (imprescindible build b11963 o posterior, o master actual, con soporte LFM3 incorporado en el PR #31252, commit `19cce69199`). Se sirve con `llama-server` pasando el mmproj con `-mm`/`--mmproj`. No hay mención a soporte en vLLM, TGI, Ollama o LM Studio en la información disponible.
- Latencia y throughput: no disponible.
- Notas de uso: pasar `--reasoning off` (no es un modelo de razonamiento); ambos archivos GGUF son necesarios para visión, entrada de audio y salida de habla; el archivo principal por sí solo funciona solo con texto. La conversión desde el checkpoint HF requiere `transformers` 5.x (probado con 5.19.0) por el backend `TokensizersBackend`.

## Comparativa con modelos similares

| Característica | LFM3-Omni-2B (Q8_0_XL) | Qwen2.5-Omni-3B | Gemma 3 4B (QAT) |
|---|---|---|---|
| Parámetros | 1,73B | ~3B (no disponible detalle) | ~4B |
| Modalidades | texto, visión, audio entrada, TTS salida (any-to-any) | texto, visión, audio, vídeo, TTS | texto, visión |
| Formato | GGUF (llama.cpp) | GGUF/HF | GGUF/HF |
| Cuantización | Q8_0 con mmproj protegido | variadas (Q4-Q8) | Q4_0 QAT oficial |
| Licencia | lfm1.0 (other, restringida) | Apache 2.0 / licencia Qwen | Gemma license |
| Contexto | no disponible | ~32K | 128K |

Nota: la comparativa es orientativa; los datos de los modelos alternativos corresponden a conocimiento general y algunos detalles pueden no estar verificados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de razonamiento: genera bloques de pensamiento vacíos si no se desactiva el modo con `--reasoning off` en llama.cpp; no esperar capacidades tipo chain-of-thought extendido.
- Requiere una versión muy reciente de llama.cpp (build b11963 o master posterior al 27-10-2026); las versiones anteriores fallan con el error `unknown model architecture: 'lfm3'`.
- El archivo principal GGUF por sí solo es solo texto: para visión, entrada de audio y TTS es obligatorio cargar también el mmproj con `-mm`.
- Sesgos conocidos: no disponible; como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a modelos de lenguaje de este tamaño; no se han publicado evaluaciones específicas.
- Licencia lfm1.0 ("other"): es una licencia personalizada de LiquidAI; conviene revisar las condiciones de uso comercial en el archivo LICENSE del modelo base antes de desplegar en producción.
- Longitud de contexto: no documentada en la model card; el ejemplo de ejecución usa 4096 tokens, lo que sugiere ventanas moderadas.
- Calidad de TTS: los parámetros por defecto de audio (`audio_temperature=0.4`, `audio_repetition_penalty=1.2`) pueden requerir ajuste por idioma; la calidad del habla en castellano no está evaluada en la información disponible.
- El repositorio es una cuantización de terceros (Ohjaaja), no oficial de LiquidAI, con 229 descargas y 2 likes en el momento de la ficha; verificar los hashes SHA-256 proporcionados antes de usar en producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Ohjaaja/LFM3-Omni-2B-Q8_0_XL-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- PR de soporte LFM3 en llama.cpp: PR #31252 (commit `19cce69199`), referenciado en la model card; enlace directo no disponible
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial o demos: no disponibles en la información proporcionada
