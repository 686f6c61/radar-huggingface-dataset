# masahiroid/kotoba-whisper-v2.0-coreai

## Resumen

kotoba-whisper-v2.0-coreai es una conversión no oficial del modelo de reconocimiento automático de voz kotoba-tech/kotoba-whisper-v2.0 al runtime Core AI de Apple, realizada por el usuario masahiroid. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo conjunto de pesos del modelo base empaquetado en formato `.aimodel` para ejecutarse en dispositivos iOS y macOS con el runtime Core AI (versión 27 o superior), sucesor de Core ML. El modelo base es un derivado de tipo distil-whisper, con un codificador de 32 capas intacto y un decodificador destilado de solo 2 capas, sumando 756 millones de parámetros.

La relevancia de esta ficha es fundamentalmente de despliegue: Apple ya publica una receta de conversión para whisper-large-v3 y whisper-large-v3-turbo en su repositorio coreai-models, escrita de forma genérica sobre `AutoModelForSpeechSeq2Seq`. Según el autor, esa receta se ha aplicado directamente, sin reescribir la arquitectura ni adaptar el layout BC1S para el Neural Engine, y el resultado funciona tanto en GPU como en Neural Engine. El modelo resultante ocupa 1,5 GB en el repositorio y se distribuye con precisión float16.

El interés práctico está en ejecutar ASR en japonés con latencia reducida en hardware Apple sin depender de la nube. El autor cita que el modelo base es 6,3 veces más rápido que whisper-large-v3. La conversión no incluye caché KV, por lo que recalcula la secuencia completa en cada paso de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (32 capas de codificador + 2 capas de decodificador destiladas, estilo distil-whisper) |
| Parametros totales | 756 M (heredados del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio de hasta 30 s por inferencia; sin caché KV, la secuencia de decodificación se recalcula completa en cada paso) |
| Tipos de cuantizacion | float16 (única precisión publicada) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (formato compilado de Core AI; fichero `kotoba-whisper-v2.0_float16.aimodel`). No se publican safetensors ni GGUF |
| Modelo base | kotoba-tech/kotoba-whisper-v2.0 |
| Runtime | Core AI de Apple (iOS/macOS 27 o superior) |
| Unidades de computo | GPU y Neural Engine (ambas validadas) |
| Tamano del repositorio | 1,5 GB |
| Autor de la conversion | masahiroid (version comunitaria, no oficial de kotoba-tech) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un codificador de 32 capas que procesa el espectrograma log-Mel de entrada y un decodificador autorregresivo. La diferencia respecto a whisper-large-v3 es que el decodificador se ha destilado de 32 a 2 capas, lo que reduce el coste de decodificación a cambio de una pérdida de precisión que el autor del modelo base reporta como aceptable para japonés. En esta conversión no hay entrenamiento ni ajuste fino propio: se reutilizan los pesos del modelo base y se compilan para Core AI con precisión float16, aplicando la receta oficial de Apple para Whisper en el repositorio coreai-models.

La innovación técnica destacable no está en el modelo, sino en el proceso de conversión. La receta de Apple está escrita contra `AutoModelForSpeechSeq2Seq` de forma genérica, y el autor confirma que se pudo aplicar directamente a un derivado destilado sin reescribir la arquitectura y sin el reajuste de layout BC1S que sí necesitaron sus conversiones previas de modelos de embeddings y reranking basados en BERT (ruri-v3-130m-coreai y japanese-reranker-xsmall-v2-coreai). El resultado se ejecuta tal cual tanto en GPU como en Neural Engine. La decodificación implementada en el ejemplo de uso no emplea caché KV: en cada paso se recalculan todas las posiciones del decodificador, lo que simplifica la implementación pero encarece la generación de secuencias largas.

## Capacidades

- Reconocimiento automático de voz (ASR) en japones, con soporte declarado tambien para ingles.
- Entrada de audio de 16 kHz monoaur al, con la ventana estandar de Whisper de hasta 30 segundos por inferencia.
- Decodificacion autoregresiva con prefijo forzado (`<|startoftranscript|><|ja|><|transcribe|><|notimestamps|>`), lo que fija idioma y tarea (transcripcion) sin deteccion automatica.
- Ejecucion local en dispositivo mediante el runtime Core AI, en GPU o Neural Engine.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision, traduccion declarada ni generacion de audio.
- El ejemplo publicado permite iterar hasta `max_new_tokens` (128 por defecto) y detiene la generacion al emitir `<|endoftext|>`.

## Casos de uso

- Transcripcion local en aplicaciones iOS y macOS: el modelo se carga con `AIModel.load` desde el runtime Core AI y transcribe audio de 16 kHz monoaur al sin salir del dispositivo, lo que evita enviar audio a servidores externos.
- Subtitulado de video en japon es: procesando el audio por fragmentos de hasta 30 segundos y concatenando las transcripciones, se pueden generar subtitulos en una app de edicion o en un pipeline de posproduccion.
- Notas de voz y actas de reunion: al ejecutarse en Neural Engine, es adecuado para transcribir grabaciones cortas en segundo plano en un iPhone o un Mac sin coste de inferencia en nube.
- Asistentes de voz con requisitos de privacidad: en entornos sanitarios, legales o corporativos donde el audio no puede salir del dispositivo, esta conversion ofrece transcripcion on-device con licencia Apache-2.0.
- Indexacion y busqueda en archivos de audio: transcripcion por lotes de un repositorio de grabaciones para generar texto indexable, ejecutada en un Mac con GPU o Neural Engine.
- Accesibilidad: generacion de subtitulos para contenido en japones o ingles en aplicaciones de accesibilidad, asumiendo el coste de rec omputar la secuencia completa en cada token al no haber cache KV.
- Prototipado e investigacion sobre Core AI: sirve como referencia funcional de como portar un derivado distil-whisper al runtime Core AI reutilizando la receta oficial de Apple, util para equipos que quieran evaluar el flujo antes de convertir sus propios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval u otros) en la informacion disponible. La unica validacion cuantitativa aportada por el autor es una comparacion de la salida de la conversion frente a la referencia PyTorch en fp32, con teacher forcing sobre los tokens de prefijo forzados:

| Objetivo | Similitud coseno (con recorte a ±1e4) | Coincidencia del siguiente token | Solapamiento top-5 |
|---|---|---|---|
| Especializacion GPU | 0,9999860 | Si | 5/5 |
| Especializacion Neural Engine | 0,9999860 | Si | 5/5 |

El autor indica que la similitud coseno se calcula tras recortar los logits a ±1e4, porque Whisper produce valores extremos en los tokens suprimidos. No se publican cifras de WER para japones o ingles, ni medidas de latencia o throughput por dispositivo.

## Requisitos de hardware

- Plataforma: exclusivamente Apple, con iOS o macOS 27 o superior. No hay soporte para CUDA, ROCm ni aceleradores de otros fabricantes.
- Memoria: el fichero de pesos en float16 ocupa aproximadamente 1,5 GB, por lo que se necesita al menos ese espacio en memoria unificada, mas el margen para activaciones y el bucle de decodificacion sin cache KV.
- Dispositivos recomendados: Mac con chip de la familia M (GPU integrada o Neural Engine), iPhone y iPad con Neural Engine. El autor no especifica modelos minimos concretos.
- GPU de escritorio (A100, H100, RTX 4090): no aplicables, ya que el formato `.aimodel` no se ejecuta fuera del runtime Core AI. Para esos entornos habria que usar el modelo base en PyTorch o una conversion a GGUF inexistente en este repositorio.
- Despliegue: runtime `coreai.runtime` con `coreai-core==1.0.0b3`, junto con `transformers`, `torch` y `numpy`. El ejemplo se ejecuta con `uv run`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La ausencia de cache KV implica rec omputar la secuencia completa en cada token, por lo que el coste por token crece con la longitud de la salida.

## Comparativa con modelos similares

| Modelo | Parametros | Decodificador | Runtime / formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kotoba-whisper-v2.0-coreai (este) | 756 M | 2 capas | Core AI (`.aimodel`), iOS/macOS 27+ | ja, en | apache-2.0 | Conversion comunitaria, 0 descargas y 0 likes en el momento de la consulta |
| kotoba-tech/kotoba-whisper-v2.0 | 756 M | 2 capas | PyTorch / Transformers | ja, en | apache-2.0 | Modelo base oficial, ejecutable en GPU NVIDIA o Apple via PyTorch o MPS |
| kotoba-whisper-v2.0-coreml | no disponible en la informacion | no disponible | Core ML | ja, en | no disponible | Conversion previa del mismo autor, citada como referencia de diseno |
| openai/whisper-large-v3 | no disponible en la informacion | 32 capas | PyTorch, multiples conversiones | multilingue | apache-2.0 | Referencia de la familia; el autor del modelo base indica que kotoba-whisper es 6,3 veces mas rapido |
| openai/whisper-large-v3-turbo | no disponible en la informacion | reducido | PyTorch, Core AI (receta oficial de Apple) | multilingue | apache-2.0 | Receta de conversion disponible en coreai-models |

## Limitaciones y advertencias

- Conversion no oficial: no es un lanzamiento de kotoba-tech. Para incidencias sobre los pesos originales, la referencia es el modelo base.
- Sin cache KV: cada token implica recalcular toda la secuencia del decodificador, lo que penaliza la latencia en transcripciones largas y limita el uso en escenarios de streaming en tiempo real.
- Ventana de audio de 30 segundos por inferencia: los audios mas largos requieren troceado y concatenacion externos, con el riesgo de cortes en limites de palabra.
- Dependencia de plataforma: requiere iOS o macOS 27 o superior y el runtime Core AI con `coreai-core==1.0.0b3`, una version beta. No es ejecutable en Linux, Windows ni en GPUs NVIDIA.
- Especializacion en japones: aunque la etiqueta declara ja y en, el modelo base esta optimizado para japones; el rendimiento real en ingles u otros idiomas no se documenta en esta ficha. No se declara soporte de traduccion, solo transcripcion.
- Riesgo de alucinacion: los modelos de la familia Whisper tienden a generar texto plausible en fragmentos con silencio, ruido o musica. No se publican filtros ni umbrales de confianza especificos en esta conversion.
- Sin cifras de calidad: no hay WER publicado para esta conversion, y la validacion aportada se limita a la fidelidad numerica frente a la referencia PyTorch en fp32, no a la calidad de transcripcion en produccion.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no existe evidencia de uso en produccion por terceros.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y se indique que la conversion es una obra derivada no oficial. El autor menciona una auditoria de seguridad con la herramienta model-audit-lite, documentada en `SECURITY.md`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/kotoba-whisper-v2.0-coreai
- Modelo base: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
- Receta oficial de Apple para Whisper: https://github.com/apple/coreai-models
- Documentacion de Core AI: https://developer.apple.com/documentation/coreai
- Conversion previa a Core ML del mismo autor: kotoba-whisper-v2.0-coreml (referenciada en la model card, sin URL directa en la informacion disponible)
- Conversion de embeddings citada como comparacion: https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Conversion de reranker citada como comparacion: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-coreai
- Herramienta de auditoria de seguridad: https://github.com/masahirocom/model-audit-lite (los resultados se detallan en `SECURITY.md` del repositorio del modelo)
