# odinjason/it-asr-int8

## Resumen

`odinjason/it-asr-int8` es un paquete de reconocimiento automatico del habla (ASR) offline para italiano, empaquetado para el motor `sherpa-onnx`. No es un modelo entrenado desde cero: se trata de una cuantizacion a int8 del export ONNX de `nvidia/stt_it_fastconformer_hybrid_large_pc`, un FastConformer hibrido de NVIDIA publicado originalmente bajo licencia CC BY 4.0. El autor del repositorio se limita a distribuir los pesos cuantizados con la metadatos necesarios (`vocab_size = 513`, `language = it`) para que `sherpa-onnx` los cargue directamente mediante su configuracion `nemo_ctc`.

El modelo resuelve el problema de la transcripcion de voz en italiano sin conexion y con requisitos de computo moderados: al estar cuantizado a int8 y exportado a ONNX, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para asistentes de voz locales, subtitulado en dispositivos de borde o pipelines de transcripcion por lotes. La arquitectura subyacente es un FastConformer hibrido (CTC + atencion) de NVIDIA NeMo, con unas 114 millones de parametros en su version original.

Su relevancia actual es practica: cubre un hueco de despliegue (italiano, offline, int8, formato ONNX listo para sherpa-onnx) que los modelos de ASR multilingues de gran tamano no cubren con la misma eficiencia en CPU. El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que debe considerarse un artefacto de despliegue mas que un modelo con comunidad consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido (CTC + atencion) de NVIDIA NeMo, exportado a ONNX |
| Parametros totales | no disponible (el modelo base NVIDIA se distribuye como "large"; no se indica cifra exacta en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por utterance; entrada de audio a 16 kHz mono con caracteristicas de 80 dimensiones) |
| Tipos de cuantizacion | int8 (unico formato incluido: `model.int8.onnx`) |
| Idiomas soportados | italiano (`it`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (int8) + `tokens.txt`; disenado para `sherpa-onnx` `OfflineRecognizer` con config `nemo_ctc` |
| Vocabulario | 513 tokens |
| Frecuencia de muestreo | 16 kHz mono |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `nvidia/stt_it_fastconformer_hybrid_large_pc` |

## Arquitectura y entrenamiento

El modelo subyacente es un FastConformer hibrido de NVIDIA NeMo, una variante de Conformer con atencion por bloques que reduce el coste cuadratico del mecanismo de atencion y acelera el entrenamiento y la inferencia sobre secuencias de audio largas. La variante "hybrid" combina una cabeza CTC con una cabeza de atencion (transducer/RNNT), lo que permite elegir entre decodificacion CTC rapida y decodificacion con atencion de mayor calidad. El sufijo `pc` del modelo base indica que fue entrenado con puntuacion y capitalizacion (punctuated and capitalized), de modo que la salida incluye mayusculas y signos de puntuacion.

Este repositorio concreto no aporta entrenamiento nuevo: parte del export ONNX de OpenVoiceOS, pasa por la cuantizacion int8 realizada por `krut42` y anade los metadatos de `sherpa-onnx`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o ajuste fino especifico en la informacion proporcionada. La innovacion tecnica relevante es el propio pipeline de compresion: cuantizacion int8 sobre un export ONNX para habilitar inferencia en CPU con un motor ligero como `sherpa-onnx`.

## Capacidades

- Reconocimiento automatico del habla en italiano, offline, sin dependencia de servicios en la nube.
- Salida con puntuacion y capitalizacion (heredado del modelo base `pc`).
- Decodificacion CTC mediante la configuracion `nemo_ctc` de `sherpa-onnx`, optimizada para latencia baja en CPU.
- Procesamiento de audio a 16 kHz mono con extraccion de caracteristicas de 80 dimensiones.
- Ejecucion en dispositivos sin GPU gracias a la cuantizacion int8.
- Integracion directa con el ecosistema `sherpa-onnx` (`OfflineRecognizer`), lo que facilita su uso en aplicaciones de escritorio, moviles y sistemas embebidos.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de idioma ni tool calling.

## Casos de uso

- **Transcripcion de reuniones y notas de voz en italiano**: el modelo convierte grabaciones monofonicas a 16 kHz en texto con puntuacion, ejecutandose localmente en un portatil sin GPU, lo que evita enviar audio confidencial a terceros.
- **Asistentes de voz para aplicaciones de escritorio**: integrado via `sherpa-onnx` `OfflineRecognizer`, permite comandos de voz en italiano con latencia baja en CPU, adecuado para herramientas de productividad que requieren funcionamiento sin red.
- **Subtitulado offline de contenido audiovisual**: en pipelines de postproduccion, se puede procesar por lotes audio extraido de video y generar subtitulos en italiano, con la ventaja de que la cuantizacion int8 reduce el coste de computo por hora de audio.
- **Sistemas de atencion al cliente con reconocimiento local**: en entornos con requisitos de privacidad (sanidad, banca), el modelo puede transcribir llamadas en el propio servidor perimetral sin salida a internet, usando CPU y contenedores ligeros.
- **Dispositivos de borde y kioscos interactivos**: al ocupar 0,2 GB y requerir solo CPU, cabe en mini-PC, Raspberry Pi de gama alta o cajas Android con `sherpa-onnx`, habilitando interfaces por voz en italiano en comercios o museos.
- **Accesibilidad para personas con discapacidad auditiva**: transcripcion en tiempo casi real de conversaciones presenciales en italiano mediante un movil o tableta que ejecute el modelo localmente, sin coste por minuto de API.
- **Investigacion en ASR de bajo recurso**: sirve como linea base cuantizada para experimentos de evaluacion de precision int8 frente a fp32 en italiano, al estar el modelo original disponible para comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el caso tipico; el modelo esta pensado para inferencia en CPU. En GPU, el peso int8 ocupa aproximadamente 0,1-0,2 GB, por lo que cualquier GPU con 1 GB o mas es suficiente.
- **GPU recomendadas**: no se especifican; al ser un modelo de ~0,2 GB en int8, cualquier GPU consumer (incluso integradas) puede ejecutarlo. Para lotes grandes se puede usar una RTX 4090, A100 o H100, pero no son necesarias.
- **CPU**: es el objetivo principal de despliegue; se recomienda un procesador moderno con soporte AVX2 para aprovechar la cuantizacion int8.
- **Cabe en GPU consumer**: si, en cualquier GPU consumer actual e incluso en iGPU.
- **Opciones de despliegue**: `sherpa-onnx` (motor nativo, configuracion `nemo_ctc` con `model.int8.onnx` + `tokens.txt`). No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. La decodificacion CTC de `sherpa-onnx` suele ofrecer latencias del orden de fracciones de segundo por utterance corta en CPU moderna, pero no hay cifras publicadas para este paquete concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `odinjason/it-asr-int8` | no disponible (base "large" de NVIDIA) | audio 16 kHz mono, 80-dim | italiano | CC BY 4.0 | ONNX int8 + tokens.txt | Cuantizado para sherpa-onnx, offline, CPU |
| `nvidia/stt_it_fastconformer_hybrid_large_pc` | no disponible | audio 16 kHz mono | italiano | CC BY 4.0 | NeMo (.nemo) | Modelo original en fp32/bf16, requiere NeMo |
| `OpenVoiceOS/stt_it_fastconformer_hybrid_large_pc_onnx` | no disponible | audio 16 kHz mono | italiano | CC BY 4.0 | ONNX | Export ONNX sin cuantizar, base de este paquete |
| `krut42/voice-fastconformer-it-ctc-int8` | no disponible | audio 16 kHz mono | italiano | CC BY 4.0 | ONNX int8 | Cuantizacion int8 original, sin metadatos sherpa-onnx |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- **Solo italiano**: el modelo esta entrenado y etiquetado exclusivamente para `it`; el rendimiento en otros idiomas o en habla con code-switching no esta garantizado.
- **Riesgo de alucinacion en ASR**: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en audio con ruido, acentos marcados o solapamiento de hablantes; no debe usarse sin revision en contextos legales o medicos.
- **Sesgos**: no se documentan analisis de sesgo por acento, genero, edad o variedad dialectal del italiano; el modelo base de NVIDIA puede tener un sesgo hacia el italiano estandar.
- **Cuantizacion int8**: la perdida de precision frente al modelo original en fp32 no esta cuantificada en la informacion disponible; conviene validar el WER en el dominio de despliegue.
- **Restricciones de licencia**: CC BY 4.0 permite uso comercial con atribucion; es obligatorio citar a NVIDIA Corporation y a los autores de las transformaciones intermedias (OpenVoiceOS, `krut42`, `odinjason`) segun corresponda.
- **Sin mantenimiento ni comunidad**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay garantia de soporte, actualizaciones ni correccion de errores.
- **Dependencia de `sherpa-onnx`**: el paquete esta atado a la configuracion `nemo_ctc` de ese motor; no es portable directamente a otros runtimes sin conversion.
- **Entrada limitada**: audio a 16 kHz mono con caracteristicas de 80 dimensiones; no se documenta soporte para audio multicanal, diarizacion ni segmentacion automatica de hablantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/odinjason/it-asr-int8
- Modelo base NVIDIA: https://huggingface.co/nvidia/stt_it_fastconformer_hybrid_large_pc
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_it_fastconformer_hybrid_large_pc_onnx
- Cuantizacion int8 original: https://huggingface.co/krut42/voice-fastconformer-it-ctc-int8
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Motor sherpa-onnx: no disponible en la informacion proporcionada (no se incluye URL del proyecto)
