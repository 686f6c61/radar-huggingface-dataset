# AbdelrhmanX2/drone-transcripter-4-mini

## Resumen

Drone Transcripter 4 Mini es un modelo de reconocimiento automático del habla (ASR) especializado en árabe egipcio coloquial, desarrollado por Drone Academy mediante ajuste fino del modelo base `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` de NVIDIA. Con 115 millones de parámetros, emplea una arquitectura FastConformer con cabezas híbridas RNNT y CTC, lo que permite dos modos de decodificación sobre el mismo codificador. El modelo está empaquetado tanto en formato NeMo como en ONNX cuantizado a int8, lo que posibilita su ejecución en CPU a aproximadamente 30 veces el tiempo real mediante sherpa-onnx.

El modelo resuelve un problema concreto: la transcripción de habla egipcia en dominios donde los modelos multilingües genéricos fallan, como clases y conferencias en dialecto egipcio. El ajuste fino se realizó sobre aproximadamente 967 horas de audio que combinan grabaciones de aula, material de plataforma y habla cotidiana, partiendo del tokenizador SentencePiece del modelo base, que fue extendido con caracteres egipcios ausentes.

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva (CC-BY-4.0) y despliegue eficiente en CPU, lo que lo hace adecuado para entornos educativos o de transcripción masiva donde no se dispone de GPU dedicada. La model card reporta mejoras sustanciales frente al modelo base en el dominio objetivo (WER de 13,84 frente a más de 30 en conferencias egipcias).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido con cabezas RNNT y CTC (NeMo) |
| Parametros totales | 115 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio) |
| Tipos de cuantizacion | int8 (ONNX); checkpoint NeMo en precisión original |
| Idiomas soportados | árabe (ar) y árabe egipcio (arz); code-switching árabe-inglés parcial |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo), ONNX int8 (encoder, decoder, joiner, CTC) y `tokens.txt` |

## Arquitectura y entrenamiento

El modelo se basa en FastConformer, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias de audio largas. La arquitectura es híbrida: comparte el codificador entre una cabeza RNNT (transducer) y una cabeza CTC, de modo que el mismo modelo puede decodificarse con cualquiera de las dos estrategias. Según la model card, la cabeza CTC es "unos pocos puntos más débil" que la RNNT con la misma velocidad de inferencia.

El ajuste fino se realizó con NeMo 2.7.3 durante 28.787 pasos, con lotes de 360 segundos de audio (aproximadamente tres pasadas sobre el corpus), en una única A100 con precisión bf16. El corpus de entrenamiento suma unas 967 horas de clases egipcias, grabaciones de plataforma y habla cotidiana. Una decisión técnica destacada fue conservar el tokenizador SentencePiece del modelo base y ampliarlo con los caracteres egipcios que le faltaban, reiniciando únicamente las cabezas decoder, joint y CTC (warm-start). El autor documenta que reiniciar el tokenizador en su lugar costaba 6 puntos de WER en conferencias y 10 en árabe estándar moderno (MSA), por lo que recomienda mantener el vocabulario base en futuros ajustes.

## Capacidades

- Reconocimiento automático del habla en árabe egipcio coloquial, con especial rendimiento en discurso de aula y conferencias.
- Decodificación dual: RNNT (mayor precisión) y CTC (misma velocidad, ligeramente inferior en WER).
- Ejecución en CPU mediante sherpa-onnx con modelos ONNX int8, a aproximadamente 30 veces el tiempo real con 8 hilos.
- Inferencia en GPU mediante NeMo con el checkpoint `.nemo`, incluyendo la posibilidad de nuevo ajuste fino.
- Manejo parcial de code-switching árabe-inglés (WER 34,53 en el conjunto de evaluación correspondiente).
- Entrada de audio mono a 16 kHz en formato float32.
- No incluye puntuación, mayúsculas ni normalización de números (los números suelen aparecer deletreados).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción de clases y conferencias en Egipto: el modelo está ajustado específicamente sobre habla de aula egipcia, con un WER de 13,84 en el conjunto de evaluación de conferencias, lo que lo hace adecuado para generar apuntes o subtítulos de material docente.
- Subtitulado de vídeo educativo a gran escala: al ejecutarse en CPU a 30x tiempo real con ONNX int8, permite procesar archivos de vídeo en servidores sin GPU, abaratando el coste por hora de audio transcrito.
- Archivado y búsqueda de contenido audiovisual en dialecto egipcio: la transcripción permite indexar grabaciones de plataformas locales y hacerlas consultables por texto.
- Herramientas de accesibilidad para hablantes de árabe egipcio: generación de subtítulos en directo o diferidos para personas con discapacidad auditiva en contextos donde el dialecto es la lengua vehicular.
- Preprocesado de datos para otros sistemas NLP: conversión de audio egipcio a texto para alimentar pipelines de análisis de sentimiento, resumen o extracción de información, aceptando la ausencia de puntuación como limitación conocida.
- Investigación en ASR de dialectos árabes: el checkpoint NeMo permite reajuste fino sobre nuevos corpus egipcios, y el autor documenta explícitamente la estrategia de conservar el tokenizador base para no degradar el rendimiento.
- Transcripción de reuniones o grabaciones de habla cotidiana: con la advertencia de que el rendimiento cae fuera del dominio de aula (WER 43,97 en Casablanca egipcio), es viable para contenido informal si se tolera un mayor índice de error.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (WER, menor es mejor; no verificados de forma independiente):

| Conjunto de evaluación | Drone Transcripter 4 Mini (RNNT) | Modelo base | Notas |
|---|---|---|---|
| Conferencias egipcias (held-out, 600 clips) | 13,84 | más de 30 | dominio objetivo |
| MGB-3 egipcio (dev+test completo, 2.467 clips) | 23,39 | 30,25 | GigaSpeech 3 obtiene 24,86 |
| Casablanca (egipcio) | 43,97 | no disponible | habla cotidiana, fuera de dominio |
| Code-switching egipcio (árabe + inglés) | 34,53 | no disponible | dominio mixto |
| GigaSpeechBench EGY | 47,90 | no disponible | scorer oficial, con puntuación |

Rendimiento en CPU (ONNX int8, 8 hilos): WER de 13,63 en conferencias y 23,53 en MGB-3 completo, a aproximadamente 30x tiempo real.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16; el modelo tiene 115 millones de parámetros y el repositorio completo ocupa 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el ajuste fino original se realizó en una A100, pero la inferencia no requiere hardware de gama alta.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable y documentada, con sherpa-onnx y modelos ONNX int8, a unas 30 veces el tiempo real con 8 hilos.
- Opciones de despliegue: sherpa-onnx (`model_type=nemo_transducer` para RNNT o `from_nemo_ctc` para CTC) y NeMo (`ASRModel.restore_from`). No se documentan integraciones con vLLM, TGI ni llama.cpp, que no aplican a un modelo ASR.
- Latencia y throughput: aproximadamente 30x tiempo real en CPU con 8 hilos; no se publican cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER MGB-3 egipcio | Licencia | Formato |
|---|---|---|---|---|---|
| Drone Transcripter 4 Mini | 115 M | ar, arz | 23,39 | CC-BY-4.0 | NeMo, ONNX int8 |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 (base) | no disponible | ar | 30,25 | no disponible en la información | NeMo |
| GigaSpeech 3 (referencia citada por el autor) | no disponible | multilingüe | 24,86 | no disponible | no disponible |

El modelo supera a su base en el dominio objetivo y se sitúa por delante de GigaSpeech 3 en MGB-3 egipcio según los datos del autor. No se dispone de información sobre otros modelos comparables de tamaño similar específicos para árabe egipcio.

## Limitaciones y advertencias

- Ajustado para conferencias y habla de aula: el rendimiento cae notablemente en conversación casual (WER 43,97 en Casablanca egipcio) y en grabaciones telefónicas ruidosas.
- El code-switching intenso árabe-inglés degrada la precisión (WER 34,53).
- La salida no incluye puntuación ni mayúsculas, y los números suelen aparecer deletreados, lo que exige postprocesado para muchos usos en producción.
- El WER de 47,90 en GigaSpeechBench EGY con el scorer oficial (que incluye puntuación) refleja la penalización por la ausencia de formato en la salida.
- Riesgo de alucinación inherente a los modelos transducer en audio ruidoso o silencioso; no se documentan mecanismos específicos de mitigación.
- Sesgos no documentados: no se detalla la composición demográfica del corpus ni posibles sesgos de género, edad o registro.
- Licencia CC-BY-4.0: permite uso comercial con atribución a Drone Academy y enlace a la página del modelo; no se imponen restricciones adicionales conocidas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbdelrhmanX2/drone-transcripter-4-mini
- Demo en vivo: https://asr.drone-academy.online
- Modelo base: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Drone Academy: https://asr.drone-academy.online
