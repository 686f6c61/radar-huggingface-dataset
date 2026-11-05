# qualcomm/Parakeet-TDT-0.6B-v3

## Resumen

Parakeet-TDT-0.6B-v3 es un modelo de reconocimiento automático del habla (ASR) de 600 millones de parámetros desarrollado originalmente por NVIDIA y distribuido en este repositorio por Qualcomm en una versión optimizada para ejecución en dispositivos con hardware Qualcomm (Snapdragon y Dragonwing). Emplea la arquitectura TDT (Token-and-Duration Transducer) con un encoder FastConformer y un predictor LSTM de dos capas, dividido en tres componentes exportables de forma independiente: encoder, decoder y joint. El modelo transcribe audio mono a 16 kHz con 128 bins mel y soporta inglés más 25 lenguas europeas.

La relevancia de esta ficha radica en que no se trata del checkpoint original de PyTorch, sino de un paquete de artefactos pre-exportados (ONNX y QNN_DLC) compilados con Qualcomm AI Hub Workbench para acelerar la inferencia en la NPU de chipsets móviles. Esto lo convierte en una pieza clave para integrar ASR en tiempo real en teléfonos Android, wearables y plataformas embebidas con SoC Qualcomm, donde el consumo energético y la latencia son críticos.

El modelo mantiene una calidad de transcripción notable para su tamaño: 1,93 % de WER en LibriSpeech test-clean y 3,59 % en test-other, con un tiempo de inferencia del encoder de aproximadamente 38 ms en Snapdragon 8 Elite for Galaxy y Dragonwing Q-8750, ejecutándose íntegramente en la NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder FastConformer y predictor LSTM de 2 capas; dividido en encoder, decoder y joint |
| Parametros totales | 627,0 M (encoder 609,5 M + decoder 12,2 M + joint 5,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada de duración variable; ventana de inferencia no especificada) |
| Tipos de cuantizacion | float y mixed_with_float (artefactos ONNX y QNN_DLC); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés + 25 lenguas europeas |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (checkpoint base), ONNX (float, mixed_with_float), QNN_DLC (float, mixed_with_float) |
| Entrada | 128 bins mel × tiempo variable, audio mono a 16 kHz |
| Duraciones TDT | 5 (0, 1, 2, 3, 4 frames) |
| Vocabulario | 8193 tokens (8192 BPE + 1 blank) |
| Tamano de artefactos (float) | Encoder 2270 MB; decoder 47 MB; joint 20 MB |
| Checkpoint base | nvidia/parakeet-tdt-0.6b-v3 |

## Arquitectura y entrenamiento

Parakeet-TDT-0.6B-v3 sigue la familia de transductores TDT introducida por NVIDIA, que sustituye la predicción clásica de tokens de un RNN-T por una predicción conjunta de token y duración. El encoder es un FastConformer, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias de audio largas. El predictor es una LSTM de dos capas y el joint combina las representaciones del encoder y del predictor para emitir, en cada paso, un token y una duración entre 0 y 4 frames. Esta factorización permite avanzar varios frames por paso de decodificación, lo que reduce el número de invocaciones al decoder y al joint y mejora el rendimiento en inferencia autoregresiva.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma estándar en ASR). Tampoco se documentan innovaciones adicionales como decodificación especulativa. Lo que sí se especifica es la división del modelo en tres subgrafos exportables por separado, decisión de ingeniería que facilita el despliegue en NPU: el encoder concentra el coste (2,27 GB en float) y se ejecuta una vez por ventana de audio, mientras que decoder y joint son minúsculos (47 MB y 20 MB) y se invocan repetidamente durante la decodificación.

## Capacidades

- Transcripción de voz a texto en tiempo real para audio mono a 16 kHz con 128 bins mel.
- Reconocimiento multilingüe: inglés más 25 lenguas europeas en un único modelo.
- Salida a nivel de token BPE con vocabulario de 8193 entradas, apta para detokenización estándar.
- Predicción de duraciones TDT (0 a 4 frames), lo que habilita decodificación no autoregresiva por saltos y reduce la latencia.
- Ejecución íntegra en NPU de Qualcomm mediante artefactos QNN_DLC y ONNX Runtime.
- Exportación personalizada con pesos afinados, formas de entrada propias y configuraciones de dispositivo mediante la librería Qualcomm AI Hub Models.
- No soporta tool calling, function calling, agentes ni multi-step reasoning: es un modelo puramente acústico.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado en directo en aplicaciones Android: el encoder tarda unos 38 ms en Snapdragon 8 Elite for Galaxy, lo que permite generar subtítulos con latencia inferior a la percepción humana en conversaciones y vídeos.
- Asistentes de voz en wearables y auriculares: el decoder (0,157 ms en QNN_DLC mixed_with_float) y el joint (0,122 ms) son tan ligeros que caben en el presupuesto energético de un dispositivo de batería pequeña.
- Dictado multilingüe en apps de productividad: al cubrir inglés y 25 lenguas europeas con un solo checkpoint, se evita empaquetar un modelo por idioma y se simplifica la distribución.
- Transcripción de reuniones en el dispositivo: el procesamiento local evita enviar audio a la nube y cumple requisitos de privacidad y RGPD en entornos corporativos.
- Atención al cliente telefónica: la transcripción en tiempo real sobre el propio terminal permite construir IVR y análisis de llamadas sin coste de inferencia en servidor.
- Accesibilidad para personas con discapacidad auditiva: conversión de voz a texto en el móvil con consumo reducido, adecuada para uso continuado durante horas.
- Anotación y post-procesado de corpus: la exportación con pesos personalizados permite afinar el modelo sobre dominios específicos (médico, legal) y reexportarlo a QNN_DLC para despliegue en campo.

## Benchmarks y rendimiento

Calidad de transcripción (WER):

| Benchmark | WER |
|---|---|
| LibriSpeech test-clean | 1,93 % |
| LibriSpeech test-other | 3,59 % |

Rendimiento en dispositivo (Snapdragon 8 Elite for Galaxy y Dragonwing Q-8750, resultados idénticos en ambos):

| Componente | Runtime | Precision | Tiempo de inferencia | Memoria pico | Unidad de cómputo |
|---|---|---|---|---|---|
| Encoder | QNN_DLC | float | 38,004 ms | 1-948 MB | NPU |
| Encoder | QNN_DLC | mixed_with_float | 38,305 ms | 1-948 MB | NPU |
| Encoder | ONNX | float | 41,336 ms | 2-1149 MB | NPU |
| Encoder | ONNX | mixed_with_float | 40,611 ms | 2-1148 MB | NPU |
| Decoder | QNN_DLC | float | 0,237 ms | 0-28 MB | NPU |
| Decoder | QNN_DLC | mixed_with_float | 0,157 ms | 0-32 MB | NPU |
| Decoder | ONNX | float | 0,254 ms | 0-28 MB | NPU |
| Decoder | ONNX | mixed_with_float | 0,172 ms | 0-36 MB | NPU |
| Joint | ONNX | float | 0,196 ms | 0-43 MB | NPU |
| Joint | ONNX | mixed_with_float | 0,122 ms | 0-32 MB | NPU |

No se han publicado en la información disponible resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K no aplican a un modelo ASR) ni cifras de WER para las 25 lenguas europeas distintas del inglés.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para NPU. En float, el encoder ocupa 2270 MB de pesos, el decoder 47 MB y el joint 20 MB. La memoria pico medida en NPU es de 948 MB (QNN_DLC float) o 1148-1149 MB (ONNX).
- GPU recomendadas: no se documentan; el objetivo declarado son chipsets Qualcomm (Snapdragon 8 Elite for Galaxy, Dragonwing Q-8750).
- Cabe en GPU consumer: no se proporcionan datos de despliegue en GPU NVIDIA o AMD; el repositorio está orientado a NPU Qualcomm.
- Opciones de despliegue: ONNX Runtime 1.30.0 con QAIRT 2.50, QNN_DLC con QAIRT 2.50, y exportación personalizada mediante Qualcomm AI Hub Models (v0.66.0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: encoder ~38 ms por ventana en NPU; decoder y joint por debajo de 0,3 ms por paso. El throughput agregado depende de la longitud de la ventana de audio y del número de pasos de decodificación, y no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-v3 (Qualcomm) | 627 M | Audio 16 kHz, 128 mel, duración variable | 1,93 % | CC-BY-4.0 | HuggingFace (qualcomm) + AI Hub |
| Whisper large-v3 | no disponible en esta ficha | Audio 16 kHz, ventana de 30 s | no disponible en esta ficha | MIT (según modelo original) | HuggingFace (openai) |
| Whisper small | no disponible en esta ficha | Audio 16 kHz, ventana de 30 s | no disponible en esta ficha | MIT (según modelo original) | HuggingFace (openai) |
| Parakeet-TDT-0.6B-v3 (NVIDIA, checkpoint base) | 627 M | Audio 16 kHz, 128 mel | 1,93 % | CC-BY-4.0 | HuggingFace (nvidia) |

No se dispone en la información proporcionada de cifras comparativas de WER ni de latencia para los modelos alternativos, por lo que la comparación cuantitativa queda limitada al dato del propio Parakeet.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus multilingües es esperable un sesgo hacia acentos y variedades sobrerrepresentadas, pero no se aportan datos.
- Riesgo de alucinación: los modelos ASR pueden generar texto plausible en segmentos de silencio o ruido; no se documenta mitigación específica.
- Limitaciones de idioma: aunque cubre inglés más 25 lenguas europeas, no se publican WER por idioma, por lo que el rendimiento en lenguas distintas del inglés es desconocido.
- Limitaciones de contexto: la ventana de audio no está especificada; el modelo está pensado para streaming por ventanas, no para transcripciones de horas en una sola pasada sin segmentación.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar a Qualcomm/NVIDIA y conservar el aviso de licencia.
- Caveat de producción: los artefactos están compilados para QAIRT 2.50 y ONNX Runtime 1.30.0; versiones distintas pueden requerir reexportación. El rendimiento medido corresponde a Snapdragon 8 Elite for Galaxy y Dragonwing Q-8750, y puede degradarse en chipsets de gama inferior.
- El repositorio no incluye pesos PyTorch entrenables listos para fine-tuning; para personalización hay que partir del checkpoint nvidia/parakeet-tdt-0.6b-v3 y reexportar.
- No es un modelo de lenguaje: no admite instrucciones, tool calling ni razonamiento; usarlo fuera del pipeline ASR producirá resultados incorrectos.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Parakeet-TDT-0.6B-v3
- Checkpoint base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/parakeet_tdt
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/parakeet_tdt
- Workbench de Qualcomm AI Hub: https://workbench.aihub.qualcomm.com
- Implementación de referencia NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Paper citado en los tags (arXiv:2509.14128): https://arxiv.org/abs/2509.14128
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/parakeet_tdt/releases/v0.66.0/parakeet_tdt-onnx-float.zip
- Descarga ONNX mixed_with_float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/parakeet_tdt/releases/v0.66.0/parakeet_tdt-onnx-mixed_with_float.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/parakeet_tdt/releases/v0.66.0/parakeet_tdt-qnn_dlc-float.zip
- Descarga QNN_DLC mixed_with_float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/parakeet_tdt/releases/v0.66.0/parakeet_tdt-qnn_dlc-mixed_with_float.zip
