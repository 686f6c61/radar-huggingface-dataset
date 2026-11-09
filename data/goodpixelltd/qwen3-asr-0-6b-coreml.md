# goodpixelltd/qwen3-asr-0.6b-coreml

## Resumen

Qwen3-ASR 0.6B Core ML es una conversión a Core ML del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, publicada por el usuario goodpixelltd. El objetivo no es distribuir un modelo nuevo, sino ofrecer una versión empaquetada que pueda ejecutarse en el Neural Engine de dispositivos Apple con iOS 18 o superior, lo que la hace relevante para desarrolladores que quieran integrar ASR en aplicaciones móviles nativas sin depender de servicios en la nube.

El paquete se compone de un codificador de audio (`AudioEncoder8s.mlmodelc`) que procesa ventanas de 8 segundos con entradas mel de forma `[1,128,800]` y produce representaciones `[104,1024]`, y un decodificador de texto dividido en cuatro partes de 7 capas cada una (`Qwen3DecoderPart{0..3}of4.mlmodelc`), con funciones separadas de `decode` (1 token) y `prefill` (64 tokens) que comparten pesos y una caché clave/valor de 320 posiciones gestionada como estado de Core ML.

La relevancia actual radica en que demuestra un patrón de despliegue de un modelo de 0,6 mil millones de parámetros en hardware de consumo Apple mediante cuantización a 8 bits y particionado del decodificador. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la documentación publicada es muy escasa y no incluye detalles sobre idiomas, benchmarks ni el proceso completo de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (codificador de audio + decodificador de texto), convertido a Core ML |
| Parametros totales | 0,6 mil millones (heredados de Qwen/Qwen3-ASR-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 8 s por codificación; caché de 320 posiciones en el decodificador |
| Tipos de cuantizacion | pesos de 8 bits (8-bit per-channel en decodificador, 8-bit en codificador y embeddings) |
| Idiomas soportados | no disponible (el vocabulario de salida conserva 70.986 token ids con CJK, piezas latinas comunes, bytes y tokens especiales) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), más ficheros binarios auxiliares `qwen3-subset.bin` y `qwen3-embed.bin` |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento automático del habla de tipo encoder-decoder. La conversión a Core ML mantiene esa estructura: un codificador de audio que transforma características mel de una ventana de 8 segundos en una secuencia de 104 posiciones con dimensión 1024, y un decodificador autorregresivo de 28 capas (4 partes × 7 capas) que genera tokens de texto. El decodificador expone dos funciones, `prefill` para procesar 64 tokens de una vez y `decode` para generar un token, compartiendo pesos y una caché clave/valor de 320 posiciones gestionada como estado nativo de Core ML.

La información publicada no detalla el corpus de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos pertenecen al modelo original Qwen/Qwen3-ASR-0.6B y no se reproducen en esta conversión. La innovación técnica destacable es el propio proceso de conversión: cuantización a 8 bits por canal, particionado del decodificador para ajustarse a los límites de memoria del Neural Engine, y una capa de salida reducida a 70.986 token ids (`qwen3-subset.bin`) que conserva texto CJK, piezas latinas comunes, bytes y tokens especiales. La conversión se realizó con coremltools 8 y está pensada para iOS 18+.

## Capacidades

- Reconocimiento automático del habla en ventanas de audio de 8 segundos, con salida de texto token a token.
- Decodificación autorregresiva con prefill de 64 tokens y caché clave/valor de 320 posiciones, adecuada para transcripciones de duración moderada.
- Salida restringida a un subconjunto de 70.986 token ids, orientado a texto CJK, piezas latinas comunes y bytes.
- Ejecución en el Neural Engine de Apple mediante Core ML, sin dependencia de servicios externos.
- Integración prevista en aplicaciones iOS nativas (el autor indica que lo usa el teclado Typo00).
- No se documentan capacidades de tool calling, agentes, visión, audio bidireccional ni modo de razonamiento explícito.

## Casos de uso

- Dictado por voz en teclados iOS: el paquete está diseñado para integrarse en un teclado (Typo00) y transcribir ventanas de 8 segundos en el Neural Engine, lo que permite dictado local sin enviar audio a la nube.
- Transcripción de notas de voz en aplicaciones móviles: el codificador de 8 segundos y el decodificador con caché de 320 posiciones permiten procesar fragmentos cortos de audio de forma secuencial dentro de una app iOS 18+.
- Subtitulado local de clips breves: al trabajar por ventanas de 8 segundos, encaja en la generación de subtítulos para vídeos cortos o mensajes de voz en redes sociales.
- Asistentes de voz offline: al ejecutarse en el Neural Engine, puede alimentar asistentes que deban funcionar sin conectividad, con la latencia y el consumo propios del hardware Apple.
- Accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva en dispositivos iPhone o iPad, siempre que se gestione la fragmentación del audio en ventanas.
- Procesamiento por lotes de audio corto en macOS con Neural Engine: útil para pipelines internos de transcripción de grabaciones de pocos segundos, aunque la documentación no detalla el soporte fuera de iOS.
- Prototipado de ASR en el borde: sirve como referencia para equipos que quieran convertir otros modelos encoder-decoder a Core ML con cuantización de 8 bits y particionado del decodificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en el Neural Engine de Apple. El repositorio ocupa 0,8 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no aplica; el destino es el Neural Engine de chips Apple (iOS 18+). No se especifican modelos de iPhone o iPad compatibles.
- Cabe en hardware de consumo Apple: sí, siempre que el dispositivo soporte iOS 18 y el Neural Engine; no se documentan requisitos mínimos de memoria unificada.
- Opciones de despliegue: Core ML en iOS 18+; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodpixelltd/qwen3-asr-0.6b-coreml | 0,6 B | ventana de 8 s; caché de 320 posiciones | Core ML | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | no disponible en la información proporcionada | safetensors (presumiblemente, no confirmado) | Apache 2.0 | Hugging Face |
| Whisper small (referencia de la categoría) | ~0,24 B | ventanas de 30 s | múltiples (incluye Core ML en la comunidad) | MIT | Hugging Face |

La comparación con Whisper small se incluye como referencia de categoría, pero no se dispone de datos de rendimiento comparativo en la información proporcionada. No se han publicado benchmarks que permitan contrastar calidad de transcripción, latencia ni consumo entre estas opciones.

## Limitaciones y advertencias

- La documentación publicada es mínima: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de evaluación.
- La salida está restringida a 70.986 token ids; el vocabulario original del modelo base puede ser mayor, por lo que podrían perderse tokens no incluidos en `qwen3-subset.bin`.
- El procesamiento por ventanas de 8 segundos obliga a fragmentar el audio, lo que puede introducir errores en los límites entre ventanas y complica la transcripción de audio largo.
- La caché de 320 posiciones limita la longitud de las transcripciones generadas en una sola pasada.
- No se documentan sesgos conocidos, pero al ser una conversión de un modelo entrenado con datos no especificados, hereda los sesgos del modelo base.
- Riesgo de alucinación en pasajes de audio con ruido o silencio, habitual en modelos ASR; no se han publicado métricas de tasa de error.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la conversión es de un tercero, no del equipo de Qwen.
- Requiere iOS 18+ y un dispositivo con Neural Engine; no es desplegable en servidores x86 ni en GPUs NVIDIA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodpixelltd/qwen3-asr-0.6b-coreml
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
