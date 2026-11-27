# ilsvls/gigaam-v4-coreai

## Resumen

GigaAM-v4 Core AI FP16 es una conversión del modelo de reconocimiento automático del habla (ASR) ai-sage/GigaAM-v4 al formato Core AI de Apple, optimizada para ejecutarse en el Apple Neural Engine (ANE) de los chips Apple Silicon. El modelo original lo desarrolla el equipo GigaAM de ai-sage, y esta conversión la publica el usuario ilsvls como un artefacto independiente para integrar ASR en aplicaciones nativas de macOS y iOS. El paquete incluye el encoder, las cabezas RNNT (raw y end-to-end), el tokenizador, el extractor de características y un detector de actividad de voz (VAD), todo en un único repositorio de 0,50 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR ruso/inglés de calidad en hardware de consumo Apple sin depender de servicios en la nube, con una latencia baja gracias a la especialización para ANE. La conversión es a FP16 sin reentrenamiento: se parte del checkpoint RNNT original y se adapta el grafo de atención para que el ANE lo pueda ejecutar de forma eficiente.

El modelo está pensado para transcripción de voz con marcas de tiempo, y el autor reporta un WER del 9,45% en 272 clips cortos y del 17,43% en cinco grabaciones largas (~63 minutos) sobre un M3 Pro con macOS 27.2.1. Se trata de una prueba de ingeniería local, no de un benchmark oficial, por lo que los números deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer) con encoder y cabezas raw/e2e; grafo adaptado para Apple Neural Engine |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (perfil de 1024 frames mel) |
| Tipos de cuantizacion | FP16 (conversión del checkpoint original; no se documentan otras) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | Core AI (formato propio de Apple; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base GigaAM-v4 es un sistema ASR de tipo RNNT (transducer), que combina un encoder acústico con un predictor y una red conjunta para alinear secuencias de audio y texto. Esta conversión mantiene la arquitectura RNNT original e incluye tanto la cabeza "raw" como la "end-to-end", además del tokenizador y el módulo de extracción de características mel (perfil de 1024 frames). No hay reentrenamiento: el autor convierte el checkpoint a FP16 y adapta la bajada del grafo de atención para que el Apple Neural Engine pueda especializarlo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original usó RLHF/DPO, ya que la model card de esta conversión no lo detalla. La innovación técnica destacable es la especialización para ANE y la inclusión de VAD y marcas de tiempo en el paquete, lo que facilita su uso en aplicaciones de dictado y transcripción nativas.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso e inglés.
- Generación de marcas de tiempo (timestamps) válidas en las pruebas del autor.
- Detección de actividad de voz (VAD) integrada en el paquete.
- Tokenizador incluido para decodificación de texto.
- Cabezas RNNT raw y end-to-end para distintos modos de decodificación.
- Ejecución en Apple Neural Engine (ANE) de chips Apple Silicon.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado por voz en aplicaciones nativas de macOS/iOS: el modelo se integra mediante un runtime GigaAM nativo y aprovecha el ANE para transcripción en tiempo real sin conexión.
- Transcripción de reuniones y notas de voz: gracias al VAD incluido y a las marcas de tiempo, se pueden segmentar grabaciones largas y generar actas con referencias temporales.
- Subtitulado automático de vídeo en ruso e inglés: las marcas de tiempo permiten alinear subtítulos con el audio en pipelines de postproducción.
- Asistentes de voz locales para privacidad: al ejecutarse en el dispositivo, evita enviar audio a la nube, adecuado para entornos sanitarios o legales.
- Indexación y búsqueda de archivos de audio: transcribir archivos históricos para hacerlos buscables por texto.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en aplicaciones de escritorio.
- Evaluación de modelos ASR en hardware Apple: útil para comparar el rendimiento de RNNT frente a otros enfoques en ANE.

## Benchmarks y rendimiento

| Prueba | Condiciones | WER |
|---|---|---|
| 272 clips cortos de voz | M3 Pro, macOS 27.2.1 | 9,45% |
| 5 grabaciones completas (~63 min) | M3 Pro, macOS 27.2.1 | 17,43% |

Estos datos provienen de una prueba de ingeniería local del autor, no de un benchmark oficial. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0,50 GB en FP16; el modelo se ejecuta en memoria unificada del chip Apple Silicon.
- GPU recomendadas: Apple Silicon con Neural Engine (probado en M3 Pro); no se documentan requisitos para GPU NVIDIA.
- Cabe en hardware de consumo Apple: sí, en chips M-series con ANE.
- Opciones de despliegue: runtime nativo GigaAM compatible (ver FORMAT.md y release.json); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta el WER en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM-v4 Core AI FP16 (este) | no disponible | no disponible | ru, en | MIT | Core AI |
| GigaAM Multilingual-v2 Core AI | no disponible | no disponible | multilingüe | no disponible | Core AI |
| GigaAM-v4 Core ML | no disponible | no disponible | ru, en | no disponible | Core ML |
| Whisper (referencia general) | no disponible en esta ficha | no disponible | multilingüe | no disponible | múltiples |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso e inglés; no se documentan otros idiomas.
- El WER reportado (9,45%–17,43%) proviene de una prueba local no oficial y puede variar según el audio.
- Requiere un runtime nativo GigaAM compatible; no es un formato estándar como safetensors o GGUF.
- Dependencia del ecosistema Apple: no se puede ejecutar en GPU NVIDIA ni en entornos no Apple.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al ser ASR puede producir transcripciones erróneas en audio ruidoso o con acentos no vistos.
- Licencia MIT permite uso comercial, pero se debe respetar la atribución al modelo original y al autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ilsvls/gigaam-v4-coreai
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Conversión Multilingual-v2 Core ML: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreml
- Conversión Multilingual-v2 Core AI: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreai
- Conversión v4 Core ML: https://huggingface.co/ilsvls/gigaam-v4-coreml
- FORMAT.md y release.json: referenciados en la model card del repositorio (no se proporcionan URL directas)
