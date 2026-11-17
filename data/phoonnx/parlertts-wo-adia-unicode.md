# Phoonnx/parlertts-wo-adia-unicode

## Resumen

`parlertts-wo-adia-unicode` es una voz de síntesis de voz (TTS) para el idioma wólof (`wo`) empaquetada para el motor [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una conversión a formato ONNX del modelo original [CONCREE/Adia_TTS](https://huggingface.co/CONCREE/Adia_TTS), entrenado por CONCREE y publicado bajo licencia Apache 2.0. La conversión la firma TigreGotico Lda y no modifica los pesos, solo el contenedor y el grafo de inferencia.

El modelo se basa en la arquitectura Parler-TTS, concretamente en el checkpoint `parler-tts/parler-tts-mini-multilingual-v1.1`, ajustado para una única voz en wólof. La entrada de texto son puntos de código Unicode procesados por un tokenizador SentencePiece; no hay fonemizador intermedio, y la puntuación se elimina antes de la síntesis. La salida se genera a 44.100 Hz en formato mono.

Su relevancia es doble: por un lado, cubre una lengua de bajos recursos (wólof) con un modelo TTS abierto y licencia permisiva; por el otro, ofrece un artefacto ONNX listo para integrarse en entornos de producción sin depender del stack de PyTorch. El repositorio pesa 5,2 GB y solo se distribuye la variante fp32, ya que la cuantización int8 no superó el control de calidad del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parler-TTS (transformer encoder-decoder para TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo fp32 (int8 descartado por fallo de QA) |
| Idiomas soportados | wólof (`wo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo de 5.170,7 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parler-TTS, un sistema de texto a voz basado en transformers que parte del checkpoint `parler-tts/parler-tts-mini-multilingual-v1.1`. La entrada textual se tokeniza con SentencePiece (`tokenizer.json`) y se mapea directamente a puntos de código Unicode; no se emplea fonemizador, lo que simplifica el pipeline pero traslada al tokenizador toda la responsabilidad de la normalización. La síntesis se realiza a 44.100 Hz con un único hablante.

Los datos de entrenamiento no están documentados en la model card del repositorio ni, según se indica, en la del modelo original de CONCREE. No se especifica el número de tokens, la composición del corpus ni si hubo etapas de RLHF o ajuste fino con preferencias. La conversión a ONNX no altera los pesos; el autor declara explícitamente que no cambia el modelo, solo el formato de despliegue.

## Capacidades

- Síntesis de voz en wólof a partir de texto en Unicode, con una única voz identificada como `indic_parler/adia/wo`.
- Generación de audio a 44.100 Hz en formato mono, apta para integración en pipelines de audio de calidad media-alta.
- Inferencia en ONNX Runtime, lo que permite ejecución en CPU sin dependencia de CUDA ni de PyTorch.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable desde `mycroft.conf`.
- Eliminación automática de puntuación antes de la síntesis (comportamiento del motor phoonnx, no del modelo).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM; es exclusivamente un modelo TTS.

## Casos de uso

- **Asistentes de voz en wólof para OVOS/Mycroft**: el modelo se integra como plugin TTS nativo y permite dotar a un asistente doméstico de síntesis en wólof sin infraestructura GPU, gracias al grafo ONNX y a la ejecución en CPU.
- **Lectura de contenidos en aplicaciones móviles offline**: al ejecutarse con ONNX Runtime en CPU, puede embeberse en aplicaciones que necesiten leer texto en wólof sin conexión, con un coste de memoria pico de aproximadamente 7 GB según la medición del autor.
- **Accesibilidad para personas con discapacidad visual**: permite convertir documentos y notificaciones en wólof a audio en tiempo de ejecución, con una tasa de 9,2 a 13,2 caracteres por segundo que resulta adecuada para lectura pausada.
- **Locución automatizada de boletines y avisos**: para radios comunitarias o servicios de información en wólof que necesiten generar fragmentos de audio a partir de guiones de texto, sin depender de un locutor humano.
- **Generación de material didáctico para aprendizaje de idiomas**: producción de audios de frases y vocabulario en wólof para plataformas educativas, con la ventaja de que el modelo acepta texto Unicode directamente sin fonemizador.
- **Prototipado de interfaces conversacionales en lenguas de bajos recursos**: sirve como base para experimentar con TTS en wólof en entornos de investigación, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- **Sustitución de servicios TTS propietarios en pipelines existentes**: al ser un artefacto ONNX autocontenido, puede sustituir a APIs de pago en flujos que ya usen ONNX Runtime, reduciendo la dependencia de terceros.

## Benchmarks y rendimiento

El autor publica una tabla de control de calidad (QA) con mediciones reales sobre un AMD Ryzen 5 7600 de 6 núcleos y 4 hilos:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control | pass | no distribuido |
| Caracteres por segundo | 9,2 a 13,2 | - |
| Ratio de longitud int8/fp32 | - | 0,40 a 1,71 |
| Tamano del grafo | 5.170,7 MB | - |
| RSS pico | 7.062,8 MB | - |
| RTF (mediana de 3, 4 hilos) | 4,964 | - |

El método de QA no usa ASR: se comprueba longitud y silencios sobre tres frases del conjunto FLORES-200 devtest. El RTF de 4,964 indica que la síntesis tarda aproximadamente cinco veces la duración del audio generado en las condiciones medidas, un dato relevante para planificar capacidad. La variante int8 se descartó porque el ratio de longitud quedó fuera del rango aceptable (0,8 a 1,25). No se han publicado resultados de benchmarks estándar (MOS, WER, MCD) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica de forma directa, ya que el modelo se ejecuta en CPU con ONNX Runtime; el consumo de memoria RAM pico medido es de 7.062,8 MB.
- **GPU recomendadas**: no se documentan; el autor mide exclusivamente en CPU (AMD Ryzen 5 7600). No hay datos de ejecución en A100, H100 ni RTX 4090.
- **Compatibilidad con GPU de consumo**: no verificada en la información disponible.
- **Opciones de despliegue**: ONNX Runtime a través de phoonnx (`pip install --pre phoonnx`), o el plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- **Latencia y throughput**: RTF de 4,964 en las condiciones medidas (4 hilos, CPU Ryzen 5 7600), lo que implica que generar 10 segundos de audio requiere aproximadamente 50 segundos de cómputo en ese hardware.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto/notas |
|---|---|---|---|---|---|
| `Phoonnx/parlertts-wo-adia-unicode` | wólof | Parler-TTS | ONNX | Apache 2.0 | Voz única, 44,1 kHz, fp32 |
| `CONCREE/Adia_TTS` | wólof | Parler-TTS | PyTorch (no disponible en detalle) | Apache 2.0 | Modelo original del que deriva esta conversión |
| `parler-tts/parler-tts-mini-multilingual-v1.1` | multilingüe | Parler-TTS | PyTorch | Apache 2.0 | Checkpoint base; multilingüe, no específico de wólof |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- **Idioma único**: solo cubre wólof (`wo`); no es un modelo multilingüe pese a derivar de un checkpoint multilingüe.
- **Voz única**: un solo hablante, sin control de estilo, emoción ni prosodia más allá de lo que permita el texto de entrada.
- **Puntuación ignorada**: phoonnx elimina la puntuación antes de la síntesis, por lo que las pausas y la entonación no se controlan mediante signos.
- **Sin fonemizador**: la calidad depende enteramente del tokenizador SentencePiece; errores de tokenización en texto no visto pueden degradar la pronunciación.
- **Rendimiento en CPU modesto**: RTF cercano a 5 en el hardware medido, lo que limita su uso en aplicaciones de baja latencia sin hardware más potente o paralelización.
- **Cuantización int8 no disponible**: la única variante distribuida es fp32, con un grafo de más de 5 GB y un pico de RAM de unos 7 GB.
- **Datos de entrenamiento no documentados**: no se puede evaluar la cobertura lingüística real, los sesgos del corpus ni la representatividad de la voz.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede generar artefactos, silencios o alargamientos ante entradas atípicas; el control de QA del autor se limita a tres frases de FLORES-200.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero exige atribución a CONCREE como autor original de los pesos y a TigreGotico Lda por la conversión.
- **Sin garantías de producción**: el autor no documenta pruebas de estrés, ni evaluación con oyentes nativos, ni métricas de calidad perceptual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/parlertts-wo-adia-unicode
- Modelo original: https://huggingface.co/CONCREE/Adia_TTS
- Checkpoint base: https://huggingface.co/parler-tts/parler-tts-mini-multilingual-v1.1
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
