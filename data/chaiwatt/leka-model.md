# chaiwatt/LeKa-model

## Resumen

LeKa-model es un empaquetado en formato ONNX del modelo de reconocimiento automático del habla (ASR) en tailandés `iapp/OpenThai2.0-ASR-Streaming`, desarrollado originalmente por iApp Technology y publicado aquí por el usuario chaiwatt para su uso en la aplicación de escritorio LeKa. No se trata de un modelo nuevo: los pesos son idénticos al original en FP32 y solo cambia el formato de los ficheros, de NeMo a ONNX Runtime, para permitir inferencia local sin conexión. La aplicación descarga estos ficheros en el primer arranque y ejecuta la transcripción en el propio equipo, de modo que el audio no sale del ordenador.

El modelo subyacente es un fine-tune en tailandés de NVIDIA `nemotron-3.5-asr-streaming-0.6b`, un sistema ASR en streaming de aproximadamente 0,6 mil millones de parámetros construido sobre un encoder FastConformer con mecanismo de caché y un decodificador RNN-T. La exportación mantiene la configuración de latencia de 560 ms (`att_context_size` [56, 6]) y la decodificación greedy con un máximo de dos símbolos por frame.

Su relevancia radica en que ofrece una vía práctica para integrar ASR en tailandés en aplicaciones de escritorio con privacidad por diseño y sin dependencia de servicios en la nube, aunque con un alcance muy acotado: un único idioma, una única tarea y un ecosistema de uso ligado a la aplicación LeKa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer cache-aware + decodificador RNN-T (red de predicción LSTM de 2 capas) + red conjunta |
| Parametros totales | Aproximadamente 0,6 mil millones (modelo base nemotron-3.5-asr-streaming-0.6b) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de atención de streaming `att_context_size` [56, 6] con latencia de 560 ms |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP32) |
| Idiomas soportados | Tailandés (th) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | ONNX (`encoder.onnx` + `encoder.onnx.data`, `decoder.onnx`, `joint.onnx`) con ficheros auxiliares `frontend.json`, `mel_fb.bin`, `window.bin`, `model.json`, `tokens.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo original de iApp: un encoder FastConformer con atención cache-aware que procesa el audio en pasos de streaming, un decodificador RNN-T formado por una red de predicción LSTM de dos capas y una red conjunta que produce logits sobre un vocabulario de 14.988 tokens más el token blank. El front-end es un extractor log-mel con 128 bandas mel, `n_fft` de 512, hop de 160 y pre-énfasis de 0,97, cuyos parámetros exactos se incluyen como constantes en los ficheros `frontend.json`, `mel_fb.bin` y `window.bin`. El encoder incorpora además el prompt de idioma y la proyección conjunta del encoder.

El entrenamiento corresponde íntegramente a iApp Technology sobre la base de NVIDIA Nemotron; este repositorio no aporta datos de entrenamiento nuevos ni modifica los pesos. La model card no detalla el volumen de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO, por lo que esos datos no están disponibles. La innovación técnica del empaquetado es la exportación a ONNX Runtime con decodificación greedy, máximo de dos símbolos por frame y un offset de blank aplicado en tiempo de decodificación (−2,0 en modo conversación, −1,0 en modo estándar). El autor indica que la salida se verificó contra el decodificador NeMo original y que el texto es idéntico en todos los clips de prueba.

## Capacidades

- Reconocimiento automático del habla en tailandés en modo streaming, con latencia configurada de 560 ms.
- Transcripción incremental por pasos de streaming gracias al encoder cache-aware.
- Decodificación greedy con el vocabulario de 14.988 tokens del modelo original.
- Dos perfiles de decodificación mediante el offset de blank: modo conversación y modo estándar.
- Inferencia completamente local con ONNX Runtime, sin envío de audio a servidores externos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de la señal de voz ni modo thinking.
- No se documenta capacidad multilingüe: el modelo está entrenado y etiquetado únicamente para tailandés.

## Casos de uso

- Transcripción de reuniones en tailandés: la aplicación captura el audio del micrófono y lo transcribe en streaming con 560 ms de latencia, suficiente para seguir una conversación sin esperar al final de la frase.
- Subtitulado en directo de vídeo o clases: el modo streaming y la decodificación incremental permiten generar subtítulos en tailandés mientras se reproduce el contenido, ejecutando todo en local.
- Dictado por voz en herramientas de escritorio: el modelo puede actuar como motor de entrada de texto por voz en editores o formularios, con la ventaja de que el audio nunca abandona el equipo.
- Notas de voz y actas: transcripción por lotes de grabaciones de entrevistas o llamadas en tailandés, usando el modo estándar de decodificación para priorizar precisión sobre latencia.
- Aplicaciones con requisitos de privacidad o cumplimiento: al ejecutarse con ONNX Runtime en el propio dispositivo, encaja en entornos donde no se permite enviar audio a servicios en la nube, como sanidad, legal o administración pública.
- Integración en la aplicación LeKa: el caso de uso principal documentado es el consumo directo por parte de la app de escritorio LeKa, que descarga los ficheros en el primer arranque y los ejecuta sin configuración adicional por parte del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una comprobación cualitativa de equivalencia con el decodificador NeMo original (texto idéntico en todos los clips de prueba), sin métricas de WER, CER ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con aproximadamente 0,6 mil millones de parámetros en FP32, el peso de los ficheros ronda los 2,4 GB (el repositorio ocupa 2,6 GB), por lo que se puede estimar un consumo de memoria en el rango de 2 a 3 GB durante la inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores; también puede ejecutarse en CPU mediante ONNX Runtime, que es el escenario habitual de una aplicación de escritorio.
- Cabe en GPU de consumo: sí, por el tamaño del modelo, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: ONNX Runtime es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR de este tipo.
- Latencia y throughput: latencia de streaming configurada en 560 ms; no se publican cifras de throughput ni de tiempo real factor.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LeKa-model (este) | ~0,6 B | Tailandés | ONNX | OpenMDW 1.1 | Exportación ONNX del modelo de iApp; pesos sin cambios |
| iapp/OpenThai2.0-ASR-Streaming | ~0,6 B | Tailandés | NeMo | OpenMDW 1.1 | Modelo original del que deriva este repositorio |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6 B | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Modelo base de NVIDIA sobre el que se entrenó el fine-tune tailandés |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre tailandés; no se ha validado para otros idiomas y su uso fuera de ese ámbito produciría transcripciones poco fiables.
- Es un modelo ASR, no un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación inherente a los sistemas RNN-T: en audio ruidoso, con acentos no vistos o con solapamiento de hablantes puede producir sustituciones o inserciones de texto.
- No se publican métricas de WER ni de robustez por dominio (conversacional, técnico, ruido de fondo), por lo que el rendimiento en producción es difícil de anticipar.
- La licencia OpenMDW 1.1 es la del modelo original; conviene revisar el fichero `LICENSE` antes de un uso comercial, ya que la model card la etiqueta genéricamente como "other" con nombre `openmdw-1.1`.
- Los pesos se distribuyen en FP32 sin cuantizaciones oficiales; reducir el tamaño requeriría un proceso de cuantización propio no documentado.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y su propósito declarado es servir a la aplicación LeKa, no un uso general como librería independiente.
- La integración con el front-end depende de ficheros de constantes (`frontend.json`, `mel_fb.bin`, `window.bin`) que deben usarse exactamente como se distribuyen para reproducir los resultados del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chaiwatt/LeKa-model
- Modelo original de iApp: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
