# krut42/voice-fastconformer-fr-ctc-int8

## Resumen

`krut42/voice-fastconformer-fr-ctc-int8` es una conversión a ONNX cuantizada a int8 del modelo de reconocimiento automático de voz (ASR) en francés `nvidia/stt_fr_fastconformer_hybrid_large_pc` de NVIDIA. El autor (krut42) parte de la exportación a ONNX realizada por OpenVoiceOS, añade los metadatos que espera sherpa-onnx y cuantiza dinámicamente el grafo para reducir el peso del fichero a 173.888.277 bytes (165,8 MiB). El resultado es un modelo de transcripción offline, mono-idioma (francés) y pensado para ejecutarse en CPU, que la aplicación Android «Слышно» (Slyshno) descarga para transcribir en el propio dispositivo, sin enviar audio a ningún servidor.

La arquitectura subyacente es FastConformer, un encoder transformer con convoluciones depthwise y subsampling 8×, entrenado originalmente por NVIDIA con cabezas híbridas RNNT y CTC. Esta conversión conserva únicamente la cabeza CTC, por lo que el reconocimiento es offline (no incremental): se procesa el audio completo y se devuelve la transcripción. El vocabulario es de 1025 tokens BPE y la salida incluye puntuación y mayúsculas, gracias al ajuste «pc» (punctuated and capitalised) del modelo original.

Su relevancia práctica es la de un ASR francés «de bolsillo»: menos de 200 MB de pesos, sin GPU, integrable vía sherpa-onnx en Android, iOS, escritorio o servidor. Como contrapartida, no es un modelo multilingüe, no admite streaming y su licencia CC BY 4.0 obliga a atribuir correctamente a NVIDIA y a documentar los cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder transformer con convoluciones depthwise), cabeza CTC; exportado a ONNX desde un modelo híbrido EncDecHybridRNNTCTCBPEModel |
| Parametros totales | no disponible (la model card no declara el recuento; el modelo base es la variante "large") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo offline; no se especifica la duración máxima de audio soportada) |
| Tipos de cuantizacion | int8 dinámica (ONNX Runtime, solo nodos MatMul, pesos uint8; las convoluciones permanecen en float). El modelo base está disponible en fp32 y en formato .nemo |
| Idiomas soportados | francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) + vocabulario en texto plano (`tokens.txt`) |
| Vocabulario | 1025 tokens (BPE) |
| Entrada de audio | 16 kHz mono, características de 80 dimensiones, `normalize_type = per_feature`, `subsampling_factor = 8` |
| Tamaño del repositorio | 0,2 GB |
| Libreria de inferencia | sherpa-onnx (`OfflineRecognizer` con configuración `nemo_ctc.model`) |
| Autor / fecha | krut42, 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo original de NVIDIA pertenece a la familia FastConformer, una evolución de Conformer que sustituye parte del coste de autoatención por convoluciones depthwise y aplica un factor de subsampling de 8 sobre las tramas acústicas, lo que reduce la longitud de la secuencia antes de entrar en el encoder. El modelo base es del tipo híbrido, con una cabeza RNNT (transducer) para decodificación incremental y una cabeza CTC; esta conversión conserva solo la ruta CTC, que es la que sherpa-onnx consume en modo offline. El entrenamiento del modelo base es responsabilidad de NVIDIA (no se documenta en esta ficha el número de horas ni la composición exacta del dataset); el ajuste «pc» del nombre indica que la salida está puntuada y capitalizada.

La contribución de este repositorio es puramente de empaquetado y optimización. OpenVoiceOS exportó el encoder con la cabeza CTC a ONNX con el vocabulario original (`vocab.txt`, CC BY 4.0). Sobre ese grafo, krut42 inyectó los metadatos de sherpa-onnx (`vocab_size = 1025`, `normalize_type = per_feature`, `subsampling_factor = 8`, `model_type = EncDecHybridRNNTCTCBPEModel`, `language = fr`) y aplicó cuantización dinámica int8 con ONNX Runtime limitada a los nodos MatMul, con pesos uint8 y convoluciones en coma flotante. Ese reparto es deliberado: las convoluciones son más sensibles a la cuantización y se dejan intactas para no degradar la precisión acústica. `tokens.txt` es el `vocab.txt` original sin modificar. No hay entrenamiento adicional, destilación ni ajuste fino en esta versión.

## Capacidades

- Reconocimiento automático de voz offline en francés: transcribe audio completo en una sola pasada (no streaming).
- Salida con puntuación y mayúsculas, heredada del ajuste «pc» del modelo base de NVIDIA.
- Entrada estandarizada de 16 kHz mono con extracción de características de 80 dimensiones y normalización `per_feature`.
- Ejecución en CPU con ONNX Runtime; no requiere GPU ni aceleradores dedicados.
- Integración directa con sherpa-onnx mediante `OfflineRecognizer` y configuración `nemo_ctc`.
- Huella de disco reducida (165,8 MiB de pesos), apta para distribución en aplicaciones móviles.
- Verificación de integridad por tamaño y SHA-256 de cada fichero, según describe la propia model card para el flujo de descarga de la app.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni uso como modelo de lenguaje.
- No tiene capacidades de visión, audio-vision ni generación de habla (es ASR, no TTS).
- No es multilingüe: únicamente francés.
- No ofrece modo streaming ni decodificación especulativa; la cabeza RNNT del modelo base no está incluida en esta conversión.

## Casos de uso

- Transcripción en el propio dispositivo móvil: la app «Слышно» descarga `model.int8.onnx` y `tokens.txt`, verifica tamaño y SHA-256 y transcribe en local. Es el caso de uso para el que se creó este repositorio y el que explica la cuantización int8 y el formato ONNX.
- Dictado de voz en aplicaciones de escritorio en francés: integrado con sherpa-onnx en una app nativa, permite convertir voz a texto sin conexión, algo crítico en entornos con red restringida o requisitos de confidencialidad.
- Subtitulado de vídeo y post-producción: transcripción de pistas de audio en francés para generar subtítulos, con puntuación y mayúsculas ya incluidas, lo que reduce el trabajo de revisión posterior frente a salidas en minúsculas sin puntuar.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de podcasts, grabaciones de archivo o bibliotecas de audio en francés para construir un índice de texto consultable.
- Análisis de llamadas en centros de atención al cliente: transcripción de conversaciones en francés para control de calidad, detección de motivos de contacto o generación de resúmenes posteriores con otro modelo de lenguaje.
- Actas y notas de reunión: transcripción de reuniones en francés cuyo audio se ha grabado íntegro (escenario offline), adecuado porque el modelo procesa el audio completo y no necesita incrementalidad.
- Accesibilidad: generación de subtítulos en tiempo cuasi-real sobre audio previamente capturado, para personas con discapacidad auditiva en contenido en francés.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse en CPU y no requerir servicios externos, encaja en entornos sanitarios, legales o administrativos franceses donde el audio no puede salir de la infraestructura propia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de evaluación propia del autor sobre FLEURS `fr_fr` (split dev), con sherpa-onnx 1.13.8, 2 hilos y sin puntuación ni mayúsculas antes de calcular la métrica:

| Conjunto evaluado | Muestras | WER | CER | Entorno |
|---|---:|---:|---:|---|
| FLEURS fr_fr dev | primeras 12 clips | 9,1 % | 3,9 % | sherpa-onnx 1.13.8, 2 hilos, sin puntuación ni mayúsculas |
| FLEURS fr_fr dev | primeras 100 clips | 9,0 % | 4,2 % | sherpa-onnx 1.13.8, 2 hilos, sin puntuación ni mayúsculas |

No se han publicado en la información disponible resultados comparativos frente al modelo base en fp32, frente a la exportación fp32 de OpenVoiceOS ni frente a otros sistemas ASR en francés (Whisper, Vosk, etc.), por lo que no es posible cuantificar la pérdida de precisión introducida por la cuantización int8 en este repositorio.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el escenario previsto (ejecución en CPU). No se han publicado requisitos de VRAM para una ruta GPU.
- GPU recomendadas: no especificadas. Al usar ONNX Runtime con cuantización int8 para CPU, no se documenta validación con CUDA, ROCm ni Metal.
- GPU de consumo: irrelevante para el caso de uso; el modelo está diseñado para ejecutarse sin acelerador. Cabe en cualquier GPU de consumo con memoria suficiente (los pesos ocupan 165,8 MiB), pero ese no es el objetivo del artefacto.
- CPU: es el hardware objetivo. La evaluación publicada se hizo con 2 hilos en sherpa-onnx 1.13.8. Al ser un modelo «large» de FastConformer, el coste de cómputo es mayor que el de los modelos zipformer pequeños habituales en sherpa-onnx; conviene medir en el dispositivo final antes de fijar expectativas de latencia.
- Almacenamiento: 173.888.277 bytes para `model.int8.onnx` y 10.943 bytes para `tokens.txt`.
- Memoria RAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB y el fichero de pesos 165,8 MiB.
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer` con `nemo_ctc.model` apuntando al ONNX y `tokens = tokens.txt`), ONNX Runtime directamente, y las integraciones de sherpa-onnx para Android, iOS, C++, Python, Kotlin/Java, Swift y WebAssembly.
- Latencia y throughput: no disponibles. No se publican RTF ni tiempos de transcripción por hora de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / enfoque | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `krut42/voice-fastconformer-fr-ctc-int8` (este) | no disponible (variante large) | Offline, audio completo, cabeza CTC | fr | CC BY 4.0 | ONNX int8 + tokens.txt | 165,8 MiB, CPU, WER 9,0 % en las primeras 100 clips de FLEURS fr_fr dev |
| `nvidia/stt_fr_fastconformer_hybrid_large_pc` | no disponible | Híbrido RNNT + CTC, permite decodificación incremental | fr | CC BY 4.0 | .nemo (NeMo) | Modelo original, precisión de referencia; requiere NeMo para inferencia |
| `OpenVoiceOS/stt_fr_fastconformer_hybrid_large_pc_onnx` | no disponible | Exportación ONNX en fp32, cabeza CTC | fr | CC BY 4.0 | ONNX fp32 + vocab.txt | Intermedio en la cadena; mayor tamaño que la versión int8, sin metadatos sherpa-onnx |
| Whisper (variantes pequeñas o large) | no disponible en la información proporcionada | Encoder-decoder transformer, offline en ventanas de audio | Multilingüe (incluye fr) | MIT (según el proyecto original) | safetensors, GGUF, ONNX según conversión | Alternativa multilingüe; el rendimiento comparativo en francés no está disponible en esta información |

No se dispone de datos de benchmarks comunes (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje, sino un sistema ASR.

## Limitaciones y advertencias

- Modelo mono-idioma: solo reconoce francés. El audio en otros idiomas producirá transcripciones incorrectas o inventadas sin aviso.
- Solo cabeza CTC: no se incluye la ruta RNNT del modelo base, por lo que no hay decodificación incremental ni modo streaming. La transcripción es offline y requiere el audio completo.
- Riesgo de alucinación y de saltos de texto: como cualquier ASR, puede generar palabras plausibles en fragmentos con ruido, música o silencio, y puede omitir tramos de habla solapada.
- Degradación esperada ante audio con ruido de fondo, acentos muy marcados, habla solapada, jerga técnica o nombres propios; no se han publicado evaluaciones en dominios distintos de FLEURS.
- Sesgos no documentados: no se dispone de análisis de sesgo por acento, género, edad o variedad regional del francés (Francia, Quebec, África francófona).
- Sin datos sobre la pérdida de precisión por la cuantización int8: no se compara el WER de esta versión con el del ONNX fp32 ni con el modelo .nemo original, por lo que no puede cuantificarse el impacto de la optimización.
- Longitud máxima de audio no documentada: no se especifica qué ocurre con entradas muy largas; en producción conviene segmentar el audio y validar los límites.
- Licencia CC BY 4.0: permite uso comercial, pero obliga a dar atribución. Es imprescindible mantener la atribución a NVIDIA Corporation y a OpenVoiceOS, y documentar los cambios realizados (inyección de metadatos sherpa-onnx, cuantización int8 a MatMul con pesos uint8, uso de `vocab.txt` como `tokens.txt`), tal y como hace el propio autor en la model card.
- Dependencia de la cadena de conversión: cualquier error introducido en la exportación a ONNX o en la cuantización se hereda; se recomienda verificar los SHA-256 publicados (`11dd49f5...` para el modelo y `1b0a6346...` para `tokens.txt`) antes de desplegar.
- Métricas con base reducida: los WER/CER publicados corresponden a las 12 y 100 primeras clips del split dev de FLEURS, no al conjunto completo, y se calcularon eliminando puntuación y mayúsculas. No deben extrapolarse a producción sin una evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krut42/voice-fastconformer-fr-ctc-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_fr_fastconformer_hybrid_large_pc
- Exportación ONNX en fp32 de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_fr_fastconformer_hybrid_large_pc_onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
