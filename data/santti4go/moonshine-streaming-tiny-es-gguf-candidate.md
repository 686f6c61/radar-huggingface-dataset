# Santti4go/moonshine-streaming-tiny-es-gguf-candidate

## Resumen

El modelo `Santti4go/moonshine-streaming-tiny-es-gguf-candidate` es una conversión a formato GGUF cuantizada en Q8_0 del modelo `moonshine-ai/moonshine-streaming-tiny-es`, desarrollado por Useful Sensors. Santti4go lo publica como artefacto de revisión para el proyecto `transcribe.cpp`, que busca ofrecer reconocimiento automático de voz (ASR) de baja latencia en hardware de clase edge. La arquitectura es un encoder-decoder `moonshine_streaming` con un frontend de audio ligero de 50 Hz y un encoder Transformer de ventana deslizante. El modelo original está entrenado para español y contiene aproximadamente 27 millones de parámetros; esta conversión materializa 30.947.521 parámetros al duplicar los embeddings de la cabeza atada para garantizar compatibilidad con el cargador de `transcribe.cpp` 0.2.2. El resultado es un archivo GGUF de 35,5 MB que permite transcripción en streaming con chunks de 500 ms. Es relevante porque democratiza el ASR en español en dispositivos de bajo consumo, sin necesidad de conexión a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming encoder-decoder |
| Parámetros totales | 30.947.521 (según safetensors; el checkpoint fuente declara ~27M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `moonshine_streaming`, un encoder-decoder que combina un frontend de audio de 50 Hz con un encoder Transformer de ventana deslizante para lograr ASR de baja latencia en streaming. El checkpoint original de `moonshine-ai/moonshine-streaming-tiny-es` está en formato safetensors F32 y fue entrenado para español. No se dispone en la información proporcionada de datos sobre el corpus de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

La innovación técnica de este artefacto es la adaptación de compatibilidad para `transcribe.cpp`: el checkpoint español declara `tie_word_embeddings=true` y no incluye `proj_out.weight`, mientras que el cargador de `transcribe.cpp` 0.2.2 espera un `dec.lm_head.weight` separado. Para resolverlo, se materializa `model.decoder.embed_tokens.weight` dos veces, como `dec.token_embd.weight` y `dec.lm_head.weight`, resultando en un GGUF que describe su layout como no atado pero matemáticamente equivalente al modelo original. Esto añade aproximadamente 4 MiB al artefacto Q8_0.

## Capacidades

- Reconocimiento automático de voz (ASR) en español, tanto en streaming como en modo offline.
- Transcripción en tiempo real con chunks de 500 ms, según los metadatos de `transcribe_cpp` (`streaming: true`).
- Ejecución eficiente en hardware de clase edge gracias a su tamaño reducido (~35,5 MB en Q8_0).
- No soporta traducción, detección de idioma ni timestamps, según los metadatos (`translate: false`, `lang_detect: false`, `timestamps: none`).
- No dispone de capacidades de tool calling, agentes, visión ni generación de texto: es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo procesa audio PCM mono de 16 kHz en streaming, permitiendo generar actas de reuniones en español mientras se habla, sin conexión a internet.
- Asistente de voz en dispositivos embebidos: al ocupar solo ~35,5 MB, puede integrarse en placas como Raspberry Pi o microcontroladores para capturar comandos de voz en español y ejecutarlos localmente.
- Subtitulado automático de vídeos: se puede incorporar a un pipeline de procesamiento de vídeo para generar subtítulos en español de forma offline, usando la transcripción por lotes.
- Accesibilidad para personas con discapacidad auditiva: una aplicación puede mostrar el texto transcrito en tiempo real en una interfaz, facilitando la comprensión de conversaciones en español.
- Automatización de centros de llamadas: la transcripción en streaming de llamadas telefónicas en español permite el análisis en vivo y la generación de resúmenes automáticos.
- Control por voz en entornos industriales: gracias a su baja latencia y ejecución local, puede reconocer comandos en español para controlar maquinaria o sistemas de automatización, evitando dependencias de la nube.
- Transcripción de notas de voz en aplicaciones móviles: su tamaño compacto lo hace apto para integrarse en apps móviles, ofreciendo transcripción offline de notas de voz en español.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica que, antes de una publicación canónica, todavía se requiere validación numérica a nivel de tensor, evaluación WER en español sobre un manifiesto de aceptación y validación de descarga por parte de los mantenedores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el archivo GGUF pesa ~35,5 MB, los requisitos de memoria son mínimos; una estimación conservadora es inferior a 1 GB para pesos y activaciones.
- GPU recomendadas: no disponible. Al ser un modelo muy pequeño, cualquier GPU moderna con al menos 1 GB de VRAM es suficiente, e incluso puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, incluidas GPU integradas, debido a su reducido tamaño.
- Opciones de despliegue: `transcribe.cpp` (transcribe-cli), `pi-transcribe`; también puede usarse con otros runtimes compatibles con GGUF ASR.
- Latencia y throughput: no disponible. El modelo está diseñado para streaming con chunks de 500 ms, lo que indica una latencia de respuesta baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| Santti4go/moonshine-streaming-tiny-es-gguf-candidate | GGUF Q8_0 | 30.947.521 | MIT | Español | Candidato no canónico; adaptación de cabeza atada |
| moonshine-ai/moonshine-streaming-tiny-es | Safetensors F32 | ~27M | MIT | Español | Modelo base original; requiere adaptación para transcribe.cpp |
| moonshine-ai/moonshine-streaming-tiny | Safetensors F32 | ~27M | MIT | Inglés | Modelo en inglés; misma arquitectura, sin conversión GGUF |

## Limitaciones y advertencias

- Es un artefacto de revisión, no un release canónico de `transcribe.cpp`; los mantenedores aún no lo han validado.
- No se han realizado evaluaciones WER en español ni validación numérica a nivel de tensor frente a la referencia de Transformers.
- La cuantización Q8_0 puede introducir una ligera pérdida de precisión respecto al modelo F32 original.
- Solo soporta español; no realiza traducción, detección de idioma ni generación de timestamps.
- La adaptación de la cabeza atada duplica los embeddings, lo que añade ~4 MiB al artefacto, pero es matemáticamente equivalente al modelo original.
- No se han documentado sesgos específicos en la información disponible; como en todo modelo ASR, existe riesgo de alucinación en la transcripción.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en producción.
- La licencia MIT permite uso comercial, pero al ser un artefacto no canónico, se recomienda esperar a la publicación oficial para entornos de producción.

## Enlaces

- HuggingFace del candidato: https://huggingface.co/Santti4go/moonshine-streaming-tiny-es-gguf-candidate
- Modelo base en HuggingFace: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-es
- Proyecto transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Modelo de referencia (inglés): https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
