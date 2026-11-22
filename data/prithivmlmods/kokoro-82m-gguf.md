# prithivMLmods/Kokoro-82M-GGUF

## Resumen

Kokoro-82M-GGUF es la versión cuantizada en formato GGUF del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y empaquetado para llama.cpp por el usuario prithivMLmods. Se trata de un modelo de text-to-speech (TTS) de pesos abiertos con arquitectura decoder-only basada en StyleTTS 2 e ISTFTNet, sin difusión ni encoder publicado, que utiliza la librería Misaki para la conversión de grafemas a fonemas (G2P). La versión original declara soporte para 8 idiomas y 54 voces, aunque esta ficha GGUF está etiquetada únicamente para inglés.

Su relevancia radica en la relación calidad/coste: con un tamaño de pesos de apenas decenas de megabytes en cuantización, ofrece una calidad de audio descrita por el autor como comparable a modelos mucho mayores, con un coste estimado inferior a 1 dólar por millón de caracteres o 0,06 dólares por hora de audio generado vía API. El entrenamiento original se realizó por unos 1.000 dólares sobre GPUs A100 de 80 GB, usando 1.000 horas de audio con apenas unos cientos de horas de material permisivo, de dominio público y sintético, etiquetado con fonemas IPA.

Este repositorio concreto aporta los pesos en múltiples niveles de cuantización (de Q3_K_M a F32) más un proyector multimodal BF16 necesario para las capacidades de voz, y documenta su ejecución mediante el binario `llama-tts` de llama.cpp con offloading a GPU. Es, por tanto, una opción práctica para integrar TTS local en pipelines sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only basada en StyleTTS 2 + ISTFTNet (sin difusión, sin encoder publicado) |
| Parametros totales | 5.815.552 (según safetensors del repo); la model card y el nombre comercial indican 82M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, más proyector mmproj-bf16 |
| Idiomas soportados | Inglés (etiqueta del repo); la versión base declara 8 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder-only construida sobre StyleTTS 2 e ISTFTNet, sin componente de difusión y sin encoder publicado. La conversión texto-a-fonema se delega en la librería Misaki, que produce etiquetas en alfabeto fonético internacional (IPA) que el modelo consume para generar la forma de onda mediante ISTFTNet. Esta combinación evita los cuellos de botella computacionales típicos de los modelos TTS basados en difusión y permite inferencia muy rápida incluso en CPU.

El entrenamiento original, según la model card, costó aproximadamente 1.000 dólares y se ejecutó sobre GPUs A100 de 80 GB durante 1.000 horas, empleando unos cientos de horas de audio exclusivamente permisivo, de dominio público y sintético, anotado con fonemas IPA. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre la composición exacta del dataset. La innovación principal es la eficiencia extrema: un modelo de decenas de millones de parámetros que aspira a calidad de modelos mucho mayores a una fracción del coste computacional.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, con salida en formato WAV.
- Selección de voz mediante el parámetro `--tts-voice` (el ejemplo de la model card usa `am_michael`).
- Control de semilla (`--seed`) para reproducibilidad de la generación.
- Control de longitud de generación mediante `-n` (número de tokens de audio).
- Offloading a GPU mediante `-ngl` en llama.cpp.
- Soporte de la CLI `llama-tts` del proyecto llama.cpp, con backend CUDA.
- Uso del proyector multimodal `mmproj-bf16.gguf` para las capacidades de audio/voz.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Narración de artículos y blogs: el modelo convierte texto en audio con una calidad declarada comparable a modelos mayores, y su reducido tamaño permite generar narraciones por lotes en hardware modesto sin coste por carácter.
- Lectura de documentación técnica en herramientas para desarrolladores: integrado en un pipeline que extrae texto de ficheros Markdown o HTML y lo sintetiza con `llama-tts`, aprovechando que los pesos en Q4_K_M ocupan apenas unos megabytes.
- Asistentes de voz locales en aplicaciones de escritorio: al ejecutarse con llama.cpp y permitir offloading a GPU con `-ngl 99`, puede incrustarse en aplicaciones nativas sin dependencia de APIs externas.
- Generación de audio para prototipos y demos: la disponibilidad de múltiples cuantizaciones (desde Q3_K_M de 3,28 MB hasta F32 de 23,3 MB) permite elegir el equilibrio calidad/tamaño según el entorno de desarrollo.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad, con coste operativo estimado inferior a 1 dólar por millón de caracteres según el autor.
- Pruebas de integración continua de pipelines de audio: el control de semilla y la reproducibilidad de la CLI facilitan tests deterministas de generación de voz en CI.
- Investigación en TTS de bajo coste: el modelo sirve como referencia para estudiar arquitecturas StyleTTS 2/ISTFTNet con presupuesto de entrenamiento reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: mínima; los pesos van de 3,28 MB (Q3_K_M) a 23,3 MB (F32), más el proyector multimodal de 208 MB (mmproj-bf16). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU compatible con CUDA para offloading; el ejemplo oficial usa `-ngl 99` con backend CUDA. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con suficiente memoria libre para el proyector (208 MB) y los pesos elegidos.
- Opciones de despliegue: llama.cpp mediante el binario `llama-tts` (compilado con `--target llama-tts`); el repo está etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el modelo es significativamente más rápido y eficiente en coste que modelos mayores, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro-82M-GGUF (este) | 82M (5,8M según safetensors) | No disponible | Inglés (base: 8 idiomas) | Apache 2.0 | GGUF |
| hexgrad/Kokoro-82M (base) | 82M | No disponible | 8 idiomas, 54 voces | Apache 2.0 | Safetensors |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos TTS alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El repositorio está etiquetado únicamente para inglés; aunque la versión base declara 8 idiomas, no se garantiza su funcionamiento en esta conversión GGUF.
- La model card recomienda usar F32 para obtener la mejor calidad; las cuantizaciones bajas (Q3_K_M, Q3_K_L) degradan la calidad del audio.
- Existe una discrepancia entre el nombre comercial (82M) y el recuento real de parámetros en safetensors (5.815.552); conviene verificar el dato antes de dimensionar recursos.
- Riesgo de alucinación y artefactos en la pronunciación de palabras fuera del vocabulario o de nombres propios, dado el uso de G2P basado en Misaki.
- No se documentan sesgos específicos, pero al entrenarse con audio permisivo, de dominio público y sintético, la diversidad de voces y acentos puede ser limitada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento originales.
- No se documentan limitaciones de longitud de contexto; el control de longitud se realiza mediante el número de tokens de audio (`-n`).
- Para producción, conviene validar la calidad del audio por cuantización y por voz antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero F32: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF/blob/main/Kokoro-82M.F32.gguf
- Fichero BF16: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF/blob/main/Kokoro-82M.BF16.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF/blob/main/Kokoro-82M.mmproj-bf16.gguf
- Muestra de audio: https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/7ZJcmW3AdGVFC29rXdobb.wav
