# o0Hailey-DSynth0o/zonos3-ivy-voice

## Resumen

Zonos3-ivy-voice es un artefacto de voz publicado por el usuario o0Hailey-DSynth0o bajo licencia Apache 2.0. No se trata de un modelo completo entrenado desde cero, sino de un paquete de recursos de clonación de voz que acompaña al modelo base Zyphra/ZONOS3-Mini: incluye un *speaker embedding* de 192 dimensiones (extraído con el codificador MECT-B2) y una muestra de audio renderizada de la voz "ivy", clonada a partir de un clip de referencia de 15 segundos.

El objetivo declarado es permitir la reproducción expresiva de una voz concreta en entornos sin GPU, concretamente en un Samsung S22 Ultra bajo Termux y con el backend ggml. El paquete se apoya en tres ficheros GGUF del modelo base (zonos3-ptq.gguf, zac-keep2.gguf y spk-encoder.gguf, ~1,16 GB en total) servidos mediante una API local compatible con endpoints `/v2/speakers`.

Su relevancia es limitada pero concreta: demuestra que la clonación de voz con Zonos3-Mini puede ejecutarse en CPU de un teléfono móvil con un factor de tiempo real (RTF) de 5 a 10, es decir, en la clase de renderizado offline y no de conversación en vivo. No hay información pública sobre parámetros, contexto ni idiomas del modelo base en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ZONOS3-Mini; el paquete contiene un speaker embedding MECT-B2 de 192 dimensiones) |
| Parametros totales | no disponible (pesos GGUF del modelo base ~1,16 GB en total) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ en formato GGUF (zonos3-ptq.gguf); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base) y NumPy `.npy` float32 [192] (speaker embedding); muestra en WAV |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base ZONOS3-Mini. Lo que sí se describe es el pipeline de clonación: se extrae un *speaker embedding* de 192 dimensiones mediante el codificador MECT-B2 a partir de un clip de referencia de 15 segundos, se serializa en float32 como `dyn_embedding.npy` y se registra en el servidor TTS mediante una petición POST a `/v2/speakers` con el embedding codificado en base64 y la cabecera `X-TTS-Session-ID`. La generación posterior se realiza con `speaker_mode=embedding` y el identificador de hablante correspondiente.

La inferencia se ejecuta sobre el backend ggml con tres ficheros GGUF: `zonos3-ptq.gguf` (modelo cuantizado post-entrenamiento), `zac-keep2.gguf` y `spk-encoder.gguf` (codificador de hablante). No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. La única medición aportada es el rendimiento: RTF aproximado de 5 a 10 en CPU de teléfono móvil, con expectativa de mayor velocidad en CPU de escritorio y tiempo real en GPU/WebGPU según la model card del modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con renderizado expresivo según la descripción del autor.
- Clonación de voz mediante *speaker embedding* de 192 dimensiones extraído de un clip de referencia de 15 segundos.
- Registro y reutilización de hablantes a través de una API HTTP local (`POST /v2/speakers`, cabecera `X-TTS-Session-ID`).
- Inferencia en CPU sin GPU mediante backend ggml, incluyendo dispositivos móviles (probado en Samsung S22 Ultra con Termux).
- Generación de audio en formato WAV (se incluye una muestra de 9,6 segundos).
- Soporte de tool calling, agentes, razonamiento multietapa, visión, audio de entrada o modo *thinking*: no disponible.

## Casos de uso

- Prototipado de clonación de voz en móvil: cargar `dyn_embedding.npy` con `numpy.load`, registrarlo vía `POST /v2/speakers` y generar audio con `speaker_mode=embedding`; adecuado para validar un pipeline TTS completo en Termux sin GPU.
- Generación de audiolibros o contenido narrado offline: el RTF de 5 a 10 permite renderizar por lotes en CPU de escritorio, aceptando que no es apto para conversación en tiempo real.
- Pruebas de integración de una API TTS local: los endpoints `/v2/speakers` y los parámetros `speaker_mode`/`speaker_embedding_id` permiten montar un servicio HTTP de síntesis en una máquina sin acelerador.
- Reproducción de una voz concreta en aplicaciones de accesibilidad: el embedding de 192 dimensiones es ligero y puede almacenarse y reutilizarse entre sesiones sin recargar el clip de referencia.
- Evaluación comparativa de calidad de clonación: la muestra `sample_clone.wav` de 9,6 segundos sirve como referencia objetiva del resultado del pipeline ggml con la voz "ivy".
- Despliegue en entornos con recursos restringidos: el conjunto de pesos (~1,16 GB) cabe en almacenamiento móvil y se ejecuta sin CUDA, lo que facilita demos en hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado es el factor de tiempo real (RTF) medido en CPU de teléfono:

| Metrica | Valor |
|---|---|
| RTF en CPU de Samsung S22 Ultra (Termux) | ~5-10 (renderizado offline, no conversacional) |
| RTF en CPU de escritorio | no disponible (el autor indica que debería ser más rápido) |
| RTF en GPU/WebGPU | tiempo real según la model card del modelo base |
| Tamano conjunto de pesos GGUF | ~1,16 GB |

## Requisitos de hardware

- VRAM: no aplica en el modo documentado; la inferencia se ejecuta en CPU con backend ggml.
- Almacenamiento: ~1,16 GB para los tres ficheros GGUF (`zonos3-ptq.gguf`, `zac-keep2.gguf`, `spk-encoder.gguf`), más el embedding `.npy` (192 float32, menos de 1 KB).
- GPU recomendadas: no disponibles; el autor indica que GPU/WebGPU alcanza tiempo real según la model card del modelo base.
- CPU: validado en un Samsung S22 Ultra con Termux; se espera mejor rendimiento en CPU de escritorio.
- Opciones de despliegue: servidor TTS con backend ggml expuesto vía API HTTP (`/v2/speakers`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: RTF ~5-10 en móvil; para una frase de 9,6 segundos de audio esto implica del orden de 48 a 96 segundos de cómputo en ese dispositivo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni benchmarks del modelo base ZONOS3-Mini que permitan una comparación rigurosa con alternativas de la misma categoría (TTS con clonación de voz).

## Limitaciones y advertencias

- El paquete no es un modelo autónomo: requiere los tres ficheros GGUF del modelo base Zyphra/ZONOS3-Mini y un servidor compatible con los endpoints `/v2/speakers`.
- El RTF de 5 a 10 en CPU móvil lo descarta para síntesis en tiempo real o conversacional en ese hardware; solo es apto para renderizado offline.
- No se documentan idiomas soportados, por lo que no puede garantizarse cobertura multilingüe.
- No hay información sobre sesgos, calidad de clonación en voces distintas de la de referencia ni robustez ante acentos o ruido.
- Riesgo de uso indebido de clonación de voz (suplantación, deepfakes); la licencia Apache 2.0 no impone restricciones éticas explícitas, por lo que la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes, con tamaño de 0,0 GB reportado, lo que sugiere que los ficheros pueden no estar efectivamente alojados o que las métricas no se han actualizado.
- No se han publicado resultados de benchmarks ni evaluaciones subjetivas de naturalidad (MOS) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/o0Hailey-DSynth0o/zonos3-ivy-voice
- Modelo base referenciado en la model card: Zyphra/ZONOS3-Mini (https://huggingface.co/Zyphra/ZONOS3-Mini)
