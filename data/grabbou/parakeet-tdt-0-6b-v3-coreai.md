# grabbou/parakeet-tdt-0.6b-v3-CoreAI

## Resumen

`grabbou/parakeet-tdt-0.6b-v3-CoreAI` es una conversión del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3` al formato Core AI de Apple, empaquetado como bundle `CoreAISpeech`. No es un modelo entrenado desde cero: es un artefacto de despliegue publicado por un tercero (el usuario `grabbou`) que aplica la receta de exportación `apple/coreai-models` sobre los pesos originales de NVIDIA, bajo licencia CC BY 4.0.

El interés práctico reside en que permite ejecutar ASR de 0.6B parámetros de forma local en iOS y macOS, con un bundle de 1,2 GB en float16 y una ventana de streaming de 150 frames que se desliza sobre audio de longitud arbitraria, de modo que sirve tanto para ficheros pregrabados como para micrófono en vivo. Reconoce 25 idiomas europeos, aunque no incorpora detección automática de idioma.

Es relevante para desarrolladores de apps móviles que necesitan transcripción on-device sin enviar audio a la nube, especialmente en el ecosistema React Native mediante `@react-native-ai/core-ai` y el AI SDK, o en Swift a través del producto `CoreAISpeech`. El repositorio es muy reciente (creado el 25 de octubre de 2026) y no registra descargas ni valoraciones, por lo que debe tratarse como un artefacto de conversión sin validación comunitaria todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transducer TDT (token-and-duration): bundle con encoder, decoder step y joint network, exportado desde `nvidia/parakeet-tdt-0.6b-v3` |
| Parámetros totales | 0,6B (heredados del modelo base; no se detalla el desglose por módulo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; ventana de streaming de 150 frames deslizante sobre audio de cualquier duración |
| Tipos de cuantización | Float16 exclusivamente en este repositorio (no se incluyen variantes int8, GGUF ni safetensors) |
| Idiomas soportados | 25 idiomas europeos; sin detección automática de idioma |
| Licencia | CC BY 4.0 (pesos originales de NVIDIA) |
| Formato de pesos | Bundle Core AI (`CoreAISpeech`), carpeta `streaming/`, float16, 1,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de la familia Parakeet de NVIDIA. La estructura del bundle exportado confirma el esquema clásico de transducer: un encoder acústico, un predictor (decoder step) y una red conjunta (joint) que combina ambas representaciones. El decodificador TDT predice simultáneamente tokens y duraciones, lo que evita el post-procesado de colapsos típico de los CTC y reduce el número de pasos de decodificación frente a un transducer convencional. La model card de esta conversión no detalla la topología interna del encoder ni el número de capas u dimensión oculta.

No hay información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO (poco habitual en ASR) ni las técnicas de aumento de datos. Lo único documentado es el proceso de exportación: `uv run models/parakeet/export.py --streaming --dtype float16`, ejecutado con la receta Parakeet de `apple/coreai-models`, que particiona el modelo en encoder, decoder step y joint y lo serializa en float16 para el runtime Core AI. La innovación destacable no está en el entrenamiento sino en el empaquetado: la ventana de 150 frames deslizante permite streaming incremental sin truncar la entrada, algo que las conversiones estáticas de ASR no suelen ofrecer.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en modo fichero y en modo streaming en vivo.
- Audio de duración arbitraria gracias a la ventana deslizante de 150 frames.
- Cobertura de 25 idiomas europeos, sin detección automática: el idioma debe seleccionarse o asumirse externamente.
- Salida estructurada con `text` y `segments` a través de la API `experimental_transcribe` del AI SDK, lo que facilita alinear marcas temporales con el texto.
- Ejecución totalmente on-device en iOS y macOS mediante el runtime Core AI (encoder, decoder y joint en float16).
- Integración con React Native vía `@react-native-ai/core-ai` y con Swift vía `SpeechRecognitionModel(resourcesAt:)`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generation, diarización de hablantes ni puntuación/capitalización automática.

## Casos de uso

- Dictado por voz en apps iOS: el bundle de 1,2 GB se descarga en el almacenamiento de la app y transcribe en local, de modo que el audio del usuario nunca sale del dispositivo, lo que simplifica el cumplimiento del RGPD.
- Subtitulado en vivo de vídeo o streaming: la ventana deslizante de 150 frames permite emitir segmentos conforme llega el audio, adecuado para eventos, clases o retransmisiones con latencia baja percibida.
- Transcripción de reuniones en macOS: procesar ficheros de audio largos sin límite de duración explícito, con salida en `segments` para generar actas con marcas temporales.
- Notas de voz en apps React Native: integración directa con `coreAI.transcriptionModel({ source: { type: 'file' } })` y el AI SDK, reutilizando el mismo pipeline para iOS y macOS.
- Asistentes de voz con STT local: alimentar un LLM también embebido sin depender de conectividad, útil en entornos con red intermitente (campo, industria, transporte).
- Accesibilidad: subtitulado automático para personas con discapacidad auditiva en apps de vídeo o videollamada, con el coste de cómputo asumido por el dispositivo del usuario.
- Documentación de entrevistas y periodismo: transcripción por lotes en un Mac con Apple Silicon, en 25 idiomas europeos, fijando el idioma por proyecto al no haber detección automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye WER, RTF ni comparaciones con otras implementaciones, y tampoco se aportan métricas de latencia o throughput más allá de la indicación de que fue probado en un iPhone 17 Pro con iOS 27.

## Requisitos de hardware

- VRAM/RAM: el bundle ocupa 1,2 GB en disco y se carga en float16; el pico de memoria en ejecución no está documentado, pero debe presupuestarse por encima del tamaño de los pesos para buffers de activación y ventana de audio.
- Plataformas soportadas: únicamente iOS y macOS según la tabla del repositorio.
- GPU recomendadas: no aplica el catálogo de GPUs de datacenter; el runtime Core AI está pensado para Apple Neural Engine y GPU integrada de Apple Silicon. Para uso en servidor haría falta hardware Apple, no A100/H100.
- Compatibilidad consumer: sí, en iPhone y Mac con Apple Silicon; validado en iPhone 17 Pro con iOS 27.
- Opciones de despliegue: runtime Core AI, `@react-native-ai/core-ai` con el AI SDK, o Swift con el producto `CoreAISpeech` de `coreai-models`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato no es GGUF ni safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `grabbou/parakeet-tdt-0.6b-v3-CoreAI` | 0,6B | 25 europeos, sin detección | CC BY 4.0 | Bundle Core AI float16 | Solo iOS/macOS; sin benchmarks publicados |
| `nvidia/parakeet-tdt-0.6b-v3` (base) | 0,6B | 25 europeos, sin detección | CC BY 4.0 | Pesos NeMo originales | Referencia de calidad; requiere toolchain NVIDIA para ejecutarse |
| Whisper large-v3 (OpenAI) | ~1,55B | ~99 idiomas con detección | MIT | safetensors, GGUF, etc. | Mayor cobertura idiomática y ecosistema amplio; más pesado para móvil |
| Whisper small (OpenAI) | ~244M | multilingüe con detección | MIT | safetensors, GGUF, Core ML | Alternativa ligera para on-device, con menor precisión esperada |

No hay datos de WER ni de rendimiento comparado en la información disponible para establecer una comparación cuantitativa entre estas opciones.

## Limitaciones y advertencias

- No detecta el idioma: aunque cubre 25 lenguas europeas, hay que indicar o asumir el idioma externamente; en audio multilingüe sin control previo la precisión puede degradarse.
- Repositorio sin validación: 0 descargas y 0 likes en la fecha de consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de revisión por terceros.
- Ausencia total de benchmarks: no se publican WER, RTF ni pruebas comparativas frente al modelo original de NVIDIA, por lo que se desconoce la degradación introducida por la exportación a float16 y por el particionado del transducer.
- Riesgo de alucinación y omisión en ASR: en audio con ruido, solapamiento de hablantes o dominio muy específico (jerga técnica, nombres propios) pueden aparecer sustituciones y huecos; no hay mecanismo de confianza documentado.
- Formato cerrado al ecosistema Apple: no hay GGUF ni safetensors, así que no se puede desplegar en Linux, Android o GPUs NVIDIA sin reconvertir desde el modelo base.
- Dependencia de versión de plataforma: la prueba documentada es con iOS 27, lo que puede implicar requisitos de runtime recientes para el runtime Core AI.
- Sin diarización ni marcas de hablante; la salida `segments` no se documenta como alineación a nivel de palabra.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a NVIDIA (y al conversor si se redistribuye); conviene revisar la model card del modelo base para cualquier condición adicional.
- Mantenimiento a cargo de un único autor no oficial; no hay compromiso de actualizaciones ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/grabbou/parakeet-tdt-0.6b-v3-CoreAI
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Receta de exportación Parakeet de Apple: https://github.com/apple/coreai-models/tree/main/models/parakeet
- Repositorio `apple/coreai-models`: https://github.com/apple/coreai-models
- Paquete React Native `@react-native-ai/core-ai`: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper, blog o demo específicos de esta conversión: no disponibles en la información proporcionada.
