# dangvansam/viet-asr

## Resumen

viet-asr es un modelo de reconocimiento automático del habla (ASR) especializado en vietnamita, desarrollado por dangvansam y publicado en Hugging Face bajo licencia Apache-2.0. Se distribuye en formato ONNX y está diseñado para producir directamente texto "listo para publicar": con mayúsculas, puntuación y números en forma escrita, sin necesidad de modelos auxiliares de puntuación, casing o inverse text normalization (ITN). Esta característica lo diferencia de pipelines ASR tradicionales que requieren una cadena de post-procesado.

El modelo emplea una arquitectura Zipformer2 transducer con encoder no streaming, decoder stateless y contexto 2, con 85,8 millones de parámetros (86M redondeados). La versión cuantizada int8 ocupa 78 MB, lo que lo hace extremadamente ligero para despliegue en producción, incluyendo dispositivos móviles y navegador mediante WASM.

Su relevancia actual radica en que, según los datos del autor, supera en precisión de texto formateado a sistemas comerciales como Google Chirp 3 y Viettel ASR, así como a modelos abiertos hasta 20 veces más grandes, en un benchmark agregado de 24 conjuntos de test vietnamitas. Además, alcanza 28 veces tiempo real en un solo núcleo de CPU, lo que lo posiciona como una opción muy eficiente para aplicaciones de transcripción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder no streaming, decoder stateless, contexto 2) |
| Parametros totales | 85,8M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming; segmentación recomendada con VAD: pausas >= 1,2 s, <= 30 s por segmento) |
| Tipos de cuantizacion | int8 (ONNX Runtime dynamic quantization); pesos completos también disponibles según la model card |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Zipformer2 transducer, desarrollada en el ecosistema k2-fsa/icefall. Consta de un encoder no streaming, un decoder stateless y un joiner, con un vocabulario de 8192 tokens BPE que incluye mayúsculas, dígitos, puntuación y byte fallback. La entrada es audio mono a 16 kHz con features Kaldi fbank de 80 dimensiones (ventana de 25 ms, paso de 10 ms, sin dither, `snip_edges=false`). La decodificación recomendada es modified beam search con 4 caminos activos.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). El autor indica que el modelo se evaluó en 24 conjuntos de test que incluyen datos públicos (VIVOS, VLSP 2018–2023, Bud500, 7 conjuntos de acentos regionales) y conjuntos privados de call-center y reuniones. La cuantización int8 mediante ONNX Runtime dynamic quantization se validó contra el modelo en precisión completa, con una diferencia de 0,15 WER en una verificación cruzada de 900 utterances en seis conjuntos de test.

## Capacidades

- Reconocimiento automático del habla en vietnamita con salida directa en texto formateado: mayúsculas, puntuación y números en forma escrita sin post-procesado.
- Transcripción de audio mono a 16 kHz con features fbank compatibles con Kaldi.
- Manejo de acentos regionales vietnamitas (evaluado en 7 conjuntos de acentos regionales).
- Procesamiento de audio de call-center y reuniones (evaluado en conjuntos privados de estos dominios).
- Despliegue multiplataforma mediante el SDK viet-asr: Linux, Windows, macOS, Android, iOS y navegador (WASM), con bindings en Python, Node.js, Go, Rust, Java/Kotlin, C#, C/C++.
- Compatibilidad directa con sherpa-onnx para inferencia.
- No es streaming: requiere segmentación con VAD para grabaciones largas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo ASR puro).
- No soporta visión ni audio más allá de la transcripción de voz.

## Casos de uso

- Transcripción de reuniones y actas: el modelo produce texto con puntuación y mayúsculas directamente, lo que reduce el trabajo de edición posterior. Para reuniones largas se segmenta con VAD (pausas >= 1,2 s, <= 30 s por segmento) y se transcribe cada segmento, manteniendo ~1 s de contexto alrededor.
- Atención al cliente y call-centers: el modelo fue evaluado específicamente en conjuntos de call-center (WER 20,58 en el benchmark del autor), por lo que es adecuado para transcribir conversaciones telefónicas y generar registros con formato legible para sistemas CRM.
- Subtitulado y generación de transcripciones para contenido audiovisual vietnamita: la salida con puntuación y números escritos simplifica la creación de subtítulos y documentos de transcripción sin necesidad de un modelo PnC adicional.
- Aplicaciones móviles de dictado y notas de voz: con 78 MB en int8 y bindings para Android e iOS, el modelo puede ejecutarse en dispositivo sin conexión, ofreciendo transcripción local con bajo consumo de recursos.
- Despliegue en navegador mediante WASM: permite integrar transcripción de voz en aplicaciones web sin backend, útil para herramientas de accesibilidad o formularios por voz.
- Procesamiento por lotes de archivos de audio a gran escala: con 28× tiempo real en un solo núcleo de CPU, un servidor modesto puede transcribir horas de audio en minutos, adecuado para pipelines de ingesta de contenido.
- Investigación lingüística y análisis de acentos regionales: el modelo cubre acentos regionales vietnamitas y puede usarse para estudios fonéticos o de variación dialectal con transcripciones formateadas.

## Benchmarks y rendimiento

Datos del benchmark del autor: WER (%) agrupado sobre 24 conjuntos de test vietnamitas, evaluando la salida cruda contra referencias con mayúsculas, puntuación y forma escrita. Menor es mejor.

| Sistema | Tamano | Benchmark | Regional | VLSP | Call center | Meeting | All 24 |
|---|---|---|---|---|---|---|---|
| viet-asr | 86M | 18,13 | 16,82 | 25,90 | 20,58 | 32,64 | 24,14 |
| Google Chirp 3 | API | 17,78 | 16,70 | 26,26 | 24,04 | 34,84 | 25,16 |
| Viettel ASR | API | 22,57 | 15,15 | 26,80 | 26,71 | 36,31 | 26,38 |
| Fun-ASR-MLT-Nano-2512 | ~0,8B | 14,56 | 14,09 | 30,09 | 34,39 | 44,23 | 29,57 |
| Parakeet-CTC-0.6B-vi | 0,6B | 17,10 | 16,41 | 30,54 | 37,59 | 43,97 | 30,80 |
| Qwen3-ASR-1.7B | 1,7B | 21,56 | 24,90 | 31,99 | 32,68 | 40,54 | 31,49 |
| gipformer 1.5 RNNT | 65M | 27,09 | 31,18 | 32,13 | 31,16 | 38,82 | 32,19 |
| ZipFormer-30M (hynt) | 30M | 27,11 | 31,20 | 32,90 | 33,38 | 40,95 | 33,25 |
| PhoWhisper-Large | 1,55B | 29,31 | 29,33 | 38,94 | 38,33 | 47,06 | 37,98 |
| Whisper-Large-V3 | 1,55B | 40,22 | 20,02 | 49,15 | 36,53 | 49,73 | 43,28 |

En reconocimiento de palabras sin formato (todo en minúsculas, puntuación eliminada, dígitos deletreados), viet-asr obtiene 17,04. Los modelos que emiten texto en minúsculas sin puntuación lideran esa vista (gipformer 1.5: 12,09; Google Chirp 3: 15,28), pero dejan el ITN y la puntuación al usuario.

Velocidad: 28× tiempo real en un solo núcleo de CPU (int8, AMD EPYC 9334, extremo a extremo a través del SDK).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo int8 ocupa 78 MB en disco y se ejecuta en CPU. En GPU, el consumo de memoria es mínimo (inferior a 1 GB en la mayoría de configuraciones).
- GPU recomendadas: no se especifican en la información disponible; dado el tamaño, cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo está optimizado para CPU.
- ¿Cabe en GPU consumer? Sí, con amplio margen; incluso en CPU de un solo núcleo funciona a 28× tiempo real.
- Opciones de despliegue: sherpa-onnx (recomendado), SDK viet-asr (con bindings para Python, Node.js, Go, Rust, Java/Kotlin, C#, C/C++), ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 28× tiempo real en un solo núcleo de CPU (AMD EPYC 9334, int8, extremo a extremo a través del SDK). No se proporcionan cifras de latencia absoluta ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER All 24 (formateado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| viet-asr | 86M | No streaming (segmentacion VAD) | 24,14 | Apache-2.0 | ONNX, Hugging Face, SDK |
| Google Chirp 3 | API | No disponible | 25,16 | Propietaria (API) | Solo API |
| Viettel ASR | API | No disponible | 26,38 | Propietaria (API) | Solo API |
| PhoWhisper-Large | 1,55B | No disponible | 37,98 | No disponible en la información | No disponible en la información |
| Whisper-Large-V3 | 1,55B | 30 s por ventana (aprox.) | 43,28 | MIT (habitual) | Pesos abiertos |

La comparativa se basa en los datos del benchmark del autor. viet-asr lidera en WER formateado agregado con un tamaño muy inferior al de los modelos abiertos comparados, y supera a las APIs comerciales de Google y Viettel en la métrica de texto formateado. En reconocimiento de palabras sin formato, otros modelos como gipformer 1.5 y Google Chirp 3 obtienen mejores cifras, pero requieren post-procesado adicional.

## Limitaciones y advertencias

- El modelo es específico para vietnamita; no soporta otros idiomas.
- No es streaming: para audio largo es necesario segmentar con VAD (pausas >= 1,2 s, <= 30 s por segmento, ~1 s de contexto), lo que añade complejidad al pipeline.
- Los benchmarks presentados son del propio autor y no han sido verificados de forma independiente; deben interpretarse con cautela.
- En reconocimiento de palabras sin formato, el modelo queda por detrás de alternativas como gipformer 1.5 y Google Chirp 3, por lo que si se necesita WER bajo en texto sin formatear, puede no ser la mejor opción.
- Riesgo de alucinación inherente a los modelos transducer en audio con ruido o fuera de dominio; no se documentan tasas específicas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que limita la evaluación de sesgos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del SDK viet-asr y de sherpa-onnx por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja adopción o novedad; no hay evidencia de uso en producción a gran escala.
- La fecha de creación indicada (2026-05-19) y la de actualización (2026-11-04) son futuras respecto a la fecha habitual de referencia; conviene verificar la vigencia de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/dangvansam/viet-asr
- SDK viet-asr: https://github.com/dangvansam/viet-asr
- k2-fsa/icefall (arquitectura y receta de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (inferencia compatible): https://github.com/k2-fsa/sherpa-onnx
