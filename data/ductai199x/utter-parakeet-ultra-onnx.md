# ductai199x/utter-parakeet-ultra-onnx

## Resumen

utter-parakeet-ultra-onnx es la exportación a ONNX de moondream/parakeet-ultra, un modelo de reconocimiento automático del habla (ASR) en inglés obtenido por ajuste posterior de nvidia/parakeet-tdt-0.6b-v3. El modelo original combina un codificador FastConformer con un decodificador TDT (Token-and-Duration Transducer) y suma 0,6 mil millones de parámetros. Esta versión concreta la publica el autor ductai199x para alimentar Utter, una aplicación de dictado por voz que se ejecuta en local y utiliza onnxruntime desde Rust.

La relevancia de esta ficha no está en un modelo nuevo, sino en el formato: los pesos son idénticos a los del modelo de Moondream, pero las operaciones se han reescrito para que ONNX Runtime y cuDNN puedan ejecutarlas de forma eficiente. Los cambios afectan a convoluciones pointwise (reescritas como multiplicaciones de matrices), convoluciones depthwise (con entrada rellenada de ceros hasta 512 fotogramas fijos para permitir que cuDNN configure la convolución una sola vez), convoluciones de subsampling y plegado de BatchNorm en modo evaluación sobre las depthwise. No se altera el resultado numérico: el autor verifica tokens y texto idénticos frente a Transformers en 70 clips de conjuntos de test públicos.

El modelo está pensado exclusivamente para inglés y para dictado de fragmentos cortos, con un límite duro de 512 fotogramas de codificador por pasada, equivalentes a unos 41 segundos de audio. La licencia es CC-BY-4.0, heredada de NVIDIA y Moondream, y el repositorio ocupa 2,6 GB en total. El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de una publicación sin validación comunitaria más allá de las comprobaciones que reporta el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador FastConformer + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica en el sentido de contexto de texto. Limite de audio: 512 fotogramas de codificador por pasada, aproximadamente 41 s de audio |
| Tipos de cuantizacion | No disponible. La exportacion publicada es ONNX en precision original (float32); el autor no documenta variantes cuantizadas |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.onnx + encoder.onnx.data, decoder.onnx, joint.onnx, step.onnx), mas mel_filters.f32 y vocab.txt |

Otros datos tecnicos relevantes: modelo base moondream/parakeet-ultra, modelo de origen de los pesos nvidia/parakeet-tdt-0.6b-v3, libreria onnx, pipeline automatic-speech-recognition, tamano del repositorio 2,6 GB, ID del repositorio ductai199x/utter-parakeet-ultra-onnx.

## Arquitectura y entrenamiento

La arquitectura es la de Parakeet TDT: un codificador FastConformer que consume características mel y un decodificador TDT que predice simultáneamente el token y la duración del avance sobre los fotogramas del codificador. El vocabulario tiene 8193 tokens más 5 duraciones (0 a 4). La decodificación implementada en la exportación es greedy TDT: se arranca desde el token blank, en cada fotograma del codificador se toma el argmax de token y duración, se emiten y realimentan los tokens no blank, y se avanza según la duración, avanzando 1 en caso de blank con duración 0 o tras 10 tokens en un mismo fotograma. El preprocesado de audio replica el de `ParakeetFeatureExtractor` de Transformers: 16 kHz mono, pre-énfasis 0.97, STFT centrada con n_fft 512, ventana Hann simétrica de 400 centrada en 512, hop 160, espectro de potencia, banco de filtros mel Slaney de 128 bandas, `ln(x + 2^-24)` y normalización por mel sobre los fotogramas del clip con desviación estándar insesgada y epsilon 1e-5. Los fotogramas válidos se calculan como `samples // 160`.

Sobre el entrenamiento no hay información en la model card: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo único documentado es que moondream/parakeet-ultra es una versión post-entrenada ("post-trained") de nvidia/parakeet-tdt-0.6b-v3, y que esta exportación concreta no modifica los pesos, solo la forma de escribir ciertas operaciones. La innovación técnica destacable de esta publicación es de despliegue, no de modelado: el relleno a 512 fotogramas fijos en las convoluciones depthwise, el plegado de BatchNorm y la reescritura de convoluciones pointwise y de subsampling como multiplicaciones de matrices, que permiten a cuDNN configurar la convolución una sola vez en lugar de repetirlo para cada longitud de entrada distinta.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio de 16 kHz mono, con salida de texto plano.
- Dictado de voz en local: es el caso de uso declarado por el autor, integrado en la aplicación Utter.
- Decodificación TDT greedy con predicción conjunta de token y duración, lo que permite emitir varios tokens por fotograma del codificador.
- Exportación fragmentada en grafos ONNX separados (encoder, decoder, joint y step fusionado con argmax), lo que facilita distintas estrategias de ejecución según el runtime.
- Compatibilidad con onnxruntime, incluida la ruta con cuDNN para GPU y el uso desde Rust.
- Verificación de equivalencia numérica frente a Transformers en 70 clips, con tokens y texto idénticos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.
- No se documenta soporte de visión, audio más allá de la transcripción, traducción, diarización de hablantes ni marcas de tiempo por palabra.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente como inglés.

## Casos de uso

- Dictado por voz en escritorio: es el escenario para el que se creó la exportación. Utter ejecuta los grafos ONNX con onnxruntime desde Rust y transcribe la voz del usuario en la propia máquina, sin enviar audio a servicios externos, lo que resulta adecuado para notas personales, correos o documentación en entornos con requisitos de privacidad.
- Transcripción de notas de voz cortas: con el límite de 512 fotogramas por pasada (unos 41 s), el modelo encaja bien en mensajes de voz, memorandos y fragmentos de reunión que se puedan segmentar en trozos de menos de 41 segundos.
- Subtitulado asistido de clips breves: al devolver texto plano en inglés, se puede usar como primer paso de un pipeline de subtitulado, siempre que otra herramienta añada la segmentación temporal, ya que el modelo no genera timestamps por palabra.
- Comandos de voz en aplicaciones de escritorio: la inferencia local y el tamaño reducido permiten mantener el modelo cargado en memoria y transcribir instrucciones cortas con baja dependencia de red.
- Preprocesado de audio para pipelines de NLP en inglés: transcribir entrevistas, encuestas o grabaciones de atención al cliente antes de pasarlas a un modelo de lenguaje para resumen, clasificación o extracción de entidades, aceptando que habrá que trocear el audio en segmentos de menos de 41 segundos.
- Prototipado e investigación en ASR: al ser un export ONNX verificado contra Transformers, sirve como referencia para medir el comportamiento de un runtime ONNX frente a PyTorch sobre los mismos pesos.
- Aplicaciones de accesibilidad: dictado local para personas con dificultades motoras, con la ventaja de que no requiere conexión ni servicios en la nube.
- Despliegue en equipos sin GPU: el formato ONNX permite ejecutar en CPU mediante onnxruntime, útil para escenarios de borde o máquinas de oficina sin acelerador dedicado.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los que reporta el autor de la exportación:

| Metrica | Valor | Condiciones |
|---|---|---|
| WER en ingles | 7,3 % | 2.095 clips de los conjuntos de test del Open ASR Leaderboard, medidos con los pesos exportados a ONNX |
| WER del modelo original en Transformers | 7,3 % | Mismos datos, según el autor: idéntico al export ONNX |
| Equivalencia de salida | 70 de 70 clips con tokens y texto idénticos | Comparación del export ONNX frente a Transformers en clips de conjuntos de test públicos |
| MMLU, HumanEval, GSM8K | No disponible | No aplica: es un modelo ASR, no un modelo de lenguaje |

No se han publicado otros resultados de benchmarks (por ejemplo, comparativas por subconjunto de LibriSpeech, Common Voice, FLEURS u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,6 GB y los pesos se distribuyen en float32, por lo que se puede estimar un consumo de pesos en el rango de 2,6 a 3 GB, más el espacio de activaciones del codificador. Una GPU con 4 GB o más debería ser suficiente; no hay mediciones oficiales publicadas.
- GPU recomendadas: no hay recomendaciones explícitas del autor. Dado el tamaño (0,6B parámetros), cualquier GPU moderna con al menos 4-6 GB de VRAM es candidata razonable, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. La ruta optimizada documentada es la de cuDNN sobre GPU NVIDIA.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con 4 GB o más de VRAM. No hay cifras verificadas en la model card.
- Despliegue: onnxruntime, con soporte de ejecución en CPU y en GPU mediante cuDNN. El consumidor de referencia es la aplicación Utter, escrita en Rust. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo ASR.
- Latencia y throughput: no disponible. No se publican cifras de RTF (real-time factor), latencia por clip ni throughput en lotes.
- Restricción de ejecución importante: cada pasada admite como máximo 512 fotogramas de codificador, aproximadamente 41 segundos de audio. Los audios más largos deben segmentarse en el cliente antes de llamar al modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite de audio | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| ductai199x/utter-parakeet-ultra-onnx | 0,6B | 512 fotogramas de codificador, aprox. 41 s por pasada | WER 7,3 % en 2.095 clips del Open ASR Leaderboard (segun el autor) | CC-BY-4.0 | ONNX |
| moondream/parakeet-ultra | 0,6B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | CC-BY-4.0 | No disponible |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | No disponible en la informacion proporcionada | Mismo WER de 7,3 % segun el autor de la exportacion | CC-BY-4.0 | No disponible |
| Whisper large-v3 u otros ASR comparables | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a la cadena de modelos de la que procede esta exportación. No hay datos suficientes en la información proporcionada para comparar con alternativas de otros proveedores.

## Limitaciones y advertencias

- Idioma: el modelo solo está etiquetado para inglés. No hay evidencia de soporte de castellano ni de otros idiomas, pese a que la arquitectura base pueda haberse entrenado con datos multilingües en otras versiones.
- Límite de longitud: una pasada procesa como máximo 512 fotogramas de codificador, unos 41 segundos de audio. Audios más largos requieren segmentación externa, lo que puede degradar la calidad en las fronteras entre segmentos.
- Decodificación greedy TDT: no se documentan estrategias de búsqueda en haz, lo que limita la precisión potencial frente a decodificaciones más costosas.
- Riesgo de alucinación y de errores por inserción: como todo modelo ASR, puede producir texto plausible en tramos de silencio, ruido o audio musical. No se documentan mecanismos de detección de voz ni de confianza por segmento.
- Sin marcas de tiempo: no se documenta salida de timestamps por palabra ni por segmento, lo que complica el subtitulado y la alineación forzada.
- Sesgos: no hay información en la model card sobre sesgos por acento, dialecto, edad, género o calidad del micrófono. El WER de 7,3 % es una media agregada sobre 2.095 clips y puede ocultar diferencias grandes por subconjunto.
- Validación limitada: el repositorio tiene 0 descargas y 0 likes. Las comprobaciones de equivalencia y el WER los reporta el propio autor; no hay una evaluación independiente en la información disponible.
- Licencia: CC-BY-4.0 permite uso comercial, pero obliga a atribuir a Moondream (pesos), a NVIDIA (modelo base, tokenizer y front-end de audio) y al autor de la exportación. Conviene revisar los términos de los modelos upstream antes de redistribuir.
- Restricciones de despliegue: el export depende de grafos ONNX y de cuDNN para la ruta GPU; no se documentan alternativas para otros runtimes ni versiones cuantizadas que reduzcan requisitos de memoria.
- Fecha de creación del repositorio: la información proporcionada indica 2026-10-09 como fecha de creación y 2026-10-09 como última actualización. Conviene verificar la vigencia y posibles actualizaciones posteriores del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ductai199x/utter-parakeet-ultra-onnx
- Modelo base de los pesos: https://huggingface.co/moondream/parakeet-ultra
- Modelo de origen y tokenizer: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Aplicación Utter (repositorio del autor): https://github.com/ductai199x/utter

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no contienen información relacionada con este modelo ni con reconocimiento automático del habla; se trata de páginas de contenido para adultos sin relación con el tema, por lo que no se incluyen como enlaces y no se ha extraído de ellas ningún dato para esta ficha.
