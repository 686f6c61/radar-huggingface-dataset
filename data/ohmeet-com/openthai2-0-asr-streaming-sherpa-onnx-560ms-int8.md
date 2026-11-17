# ohmeet-com/openthai2.0-asr-streaming-sherpa-onnx-560ms-int8

## Resumen

OpenThai 2.0 ASR Streaming es un modelo de reconocimiento automático del habla (ASR) en tailandés, desarrollado originalmente por iApp Technology y construido sobre la base de NVIDIA Nemotron. Esta ficha concreta corresponde a una conversión comunitaria realizada por el usuario ohmeet-com para la aplicación de macOS Oh Meet: los pesos originales en formato NeMo se exportaron a ONNX para su uso con el runtime sherpa-onnx, con un tamaño de chunk de 560 ms y cuantización dinámica a int8. El resultado es un modelo de transcripción en streaming, pensado para alimentar interfaces de voz en tiempo real sin necesidad de GPU dedicada.

El modelo emplea una arquitectura de transductor (encoder, decoder y joiner) propia de los sistemas ASR end-to-end, lo que permite decodificación incremental conforme llega el audio. El repositorio ocupa 0,7 GB y contiene los tres grafos ONNX cuantizados más el vocabulario de tokens. El encoder concentra prácticamente todo el peso (unos 657 MB), mientras que decoder y joiner son muy ligeros (16 MB y 10 MB respectivamente).

Su relevancia actual radica en que cubre un hueco poco atendido: ASR en streaming para tailandés con despliegue ligero en CPU. Al estar empaquetado para sherpa-onnx, puede integrarse en aplicaciones de escritorio y móviles sin depender de frameworks pesados. La licencia OpenMDW-1.1 y las advertencias sobre marcas de NVIDIA condicionan su uso comercial, que conviene revisar antes de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor ASR end-to-end (encoder, decoder, joiner) basado en NVIDIA Nemotron |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks de 560 ms) |
| Tipos de cuantización | int8 (cuantización dinámica) |
| Idiomas soportados | tailandés (th); configuración recomendada `th-TH` o `th-mix` |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transductor online (streaming) con tres componentes: un encoder que procesa las características acústicas (feature_dim 128), un decoder que modela la secuencia de tokens y un joiner que combina ambos para producir la predicción. Esta topología permite emitir transcripciones parciales de forma incremental, sin esperar a disponer de la frase completa, algo esencial para subtitulado en vivo y asistentes de voz.

Los detalles de entrenamiento no están disponibles en la información proporcionada: se desconoce el volumen de horas de audio, la composición del corpus, si hubo aumento de datos o técnicas de alineación forzada. Lo que sí se documenta es que los pesos provienen del checkpoint `openthai2.0-asr-streaming_bias-1.0.nemo` de iApp, exportado a ONNX con un chunk de 560 ms y posteriormente cuantizado a int8 mediante cuantización dinámica. El sesgo de blank (`bias-1.0`) ya está incorporado en los pesos del joiner, por lo que no debe aplicarse un `blank_penalty` adicional en tiempo de inferencia.

## Capacidades

- Reconocimiento automático del habla en tailandés con decodificación en streaming por chunks de 560 ms.
- Emisión de hipótesis parciales incrementales, apta para subtitulado en tiempo real.
- Funcionamiento en CPU: el autor indica que basta con 1 hilo y que el RTF es aproximadamente 0,2 en Apple Silicon.
- Soporte de configuración de idioma explícita (`th-TH` o `th-mix`); el modo `th-mix` parece orientado a habla con mezcla de inglés u otras lenguas, aunque no se detalla su comportamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni modo de razonamiento; es un modelo puramente de transcripción.

## Casos de uso

- Subtitulado en directo de reuniones y clases en tailandés: el modo streaming con chunks de 560 ms permite mostrar texto con una latencia de fracciones de segundo, adecuada para seguir una conversación sin esperar al cierre de la frase.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse en CPU con RTF bajo en Apple Silicon, puede integrarse en apps macOS como la del propio autor para transcribir notas sin consumir GPU.
- Transcripción de llamadas de atención al cliente: el modelo procesa audio en tiempo real y puede alimentar un panel de agente con la transcripción parcial, útil para búsqueda y resumen posterior.
- Asistentes de voz locales para tailandés: al no requerir conexión a un servicio en la nube, encaja en escenarios de privacidad donde el audio no debe salir del dispositivo.
- Indexación y búsqueda de archivos de audio: la transcripción generada puede alimentar motores de búsqueda o sistemas de gestión documental para contenido en tailandés.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en eventos presenciales o retransmisiones, con despliegue en un portátil convencional.
- Prototipado rápido de pipelines ASR: al estar empaquetado para sherpa-onnx, permite validar una integración de voz en tailandés en pocas horas sin entrenar ni convertir modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es un RTF aproximado de 0,2 en Apple Silicon con 1 hilo, lo que implica que procesa audio unas cinco veces más rápido que tiempo real en ese hardware. No hay cifras de WER, CER ni comparaciones con otros sistemas ASR tailandeses.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso habitual, ya que el modelo está pensado para CPU. En GPU, el encoder int8 de unos 657 MB requeriría del orden de 1 GB de memoria, aunque no se documenta soporte GPU en sherpa-onnx para esta conversión.
- GPU recomendadas: no disponibles; el autor no menciona despliegue en GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe holgadamente en cualquier sistema con unos 2 GB de RAM libre para el runtime y los pesos.
- Opciones de despliegue: sherpa-onnx (runtime principal y único documentado), con los tres grafos ONNX y el archivo `tokens.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF aproximado de 0,2 en Apple Silicon con 1 hilo; con chunks de 560 ms, la latencia de emisión de hipótesis parciales es del orden de medio segundo más el coste de decodificación.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Streaming |
|---|---|---|---|---|---|
| OpenThai 2.0 ASR Streaming (esta conversión) | tailandés | Transductor (Nemotron) | ONNX int8 | OpenMDW-1.1 | Sí, 560 ms |
| iapp/OpenThai2.0-ASR-Streaming (original) | tailandés | Transductor (Nemotron) | NeMo | OpenMDW-1.1 | Sí |
| Whisper (variantes de OpenAI) | multilingüe, incluye tailandés | Transformer encoder-decoder | safetensors, GGUF, ONNX | MIT (variantes) | No nativo, por ventanas |
| Modelos ASR de NVIDIA NeMo para otras lenguas | según modelo | Transductor / CTC | NeMo, ONNX | según modelo | Variable |

La comparación cuantitativa de precisión (WER) no está disponible en la información proporcionada. La diferencia principal frente a Whisper es el enfoque nativo de streaming y el empaquetado ligero para CPU; frente al modelo original de iApp, esta conversión añade el formato ONNX para sherpa-onnx y la cuantización int8, a costa de una posible pérdida menor de precisión no cuantificada.

## Limitaciones y advertencias

- Solo cubre tailandés; no es un modelo multilingüe y su uso con otros idiomas no está soportado.
- Es imprescindible fijar el idioma a `th-TH` o `th-mix`; si se deja vacío, la autodetección puede producir texto CJK incorrecto, según advierte el autor.
- No debe aplicarse `blank_penalty`, ya que el sesgo de blank ya está incorporado en los pesos del joiner; hacerlo degradaría la decodificación.
- La cuantización int8 altera ligeramente los resultados respecto al modelo original en NeMo; no se ha publicado la magnitud de esa degradación.
- Riesgo de alucinación y errores en audio con ruido, acentos no estándar o solapamiento de hablantes; no hay datos de WER que permitan acotar el riesgo.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de uso comercial, especialmente las cláusulas sobre atribución y las notas de NVIDIA para la base Nemotron incluidas en `nvidia/NOTICES.txt`.
- "Nemotron" es marca registrada de NVIDIA; la conversión no está avalada por iApp Technology ni por NVIDIA, lo que puede afectar a la confianza en el soporte y a la trazabilidad de incidencias.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de robustez en producción.
- No se documentan mecanismos de puntuación, normalización de texto ni detección de idioma más allá de la configuración manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohmeet-com/openthai2.0-asr-streaming-sherpa-onnx-560ms-int8
- Modelo base original: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportación (referenciado en la model card): `export/export_onnx.py` dentro del repositorio del modelo
- Avisos de NVIDIA para la base Nemotron: `nvidia/NOTICES.txt` (referenciado en la model card)
