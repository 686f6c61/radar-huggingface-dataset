# canersamut/nemotron-3-diarization-coreml-low-w8

## Resumen

Nemotron 3 Diarization Core ML `low` w8 es una conversión a Core ML del modelo de diarización de hablantes `nvidia/Nemotron-3-Diarization`, empaquetada para inferencia en streaming sobre dispositivos Apple (iPhone, iOS 17+). La conversión la firma el usuario `canersamut` (Clovy) y mantiene la licencia OpenMDW 1.1 del modelo original de NVIDIA. El resultado es un artefacto de 99,9 MB con pesos cuantizados a 8 bits, frente a los 198,6 MB de la variante de 16 bits, pensado para ejecutarse en el propio dispositivo sin depender de la nube.

El modelo resuelve el problema de la diarización de hablantes ("quién habla y cuándo") en audio continuo, usando una arquitectura de tipo streaming Sortformer con un preset `low` que introduce 1,04 s de look-ahead. Está diseñado como reemplazo directo (*drop-in*) del artefacto de referencia de FluidInference: mismos nombres, formas y tipos de entrada y salida, de modo que la configuración `Nemotron3Config.low` de FluidAudio lo carga sin cambios.

Su relevancia es práctica: permite diarización en tiempo real en hardware móvil con una degradación mínima respecto a la versión de 16 bits (44,03 % DER frente a 43,84 % en DiPCo) y una reducción de latencia por paso (67 ms frente a 74 ms en un iPhone 13). No obstante, el DER absoluto es alto en escenarios de audio lejano y con solapamiento, por lo que conviene tratarlo como componente de un pipeline de voz, no como solución aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (transformer con atención y RoPE), grafo de un paso de streaming para Core ML |
| Parametros totales | no disponible (el repo ocupa 0,1 GB; el artefacto pesa 99,9 MB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; en audio, 541 frames empaquetados por paso (speaker cache 264, FIFO 264, chunk 9, contexto derecho 4) |
| Tipos de cuantizacion | int8 en pesos de capas lineales y convolucionales (`linear_quantize_weights`, `linear_symmetric`, una escala por canal de salida); cómputo en 16 bits |
| Idiomas soportados | no disponible (modelo de audio; no se declaran idiomas) |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | Core ML compilado (`Nemotron3Diarizer_low.mlmodelc`), más `learnable_sil_emb.bin` (512 float32) |

## Arquitectura y entrenamiento

El modelo subyacente es `nvidia/Nemotron-3-Diarization`, una arquitectura de diarización en streaming de tipo Sortformer. La conversión reproduce un único paso de streaming: el speaker cache, el FIFO y el chunk se empaquetan en 541 frames mediante un *gather* one-hot, el padding se enmascara en la atención y las posiciones RoPE van de 0 a 540. El grafo produce salidas a 80 ms y 10 ms. El preset `low` fija 1,04 s de look-ahead con chunk 9, contexto derecho 4, FIFO 264, speaker cache 264 y periodo de actualización 222.

La conversión se realizó desde el modelo PyTorch original (transformers 5.23) con coremltools 9.0, target iOS 17 y cómputo a 16 bits. La build de 16 bits resultante es bit-idéntica al fichero `low` de FluidInference sobre estados de streaming reales, lo que da una garantía fuerte de fidelidad. Posteriormente se aplicó cuantización lineal simétrica a int8 sobre los pesos de capas lineales y convolucionales, manteniendo el cómputo en 16 bits. No se documenta en la información disponible el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Diarización de hablantes en streaming: identifica y segmenta hablantes a lo largo del audio con actualizaciones periódicas (periodo 222).
- Detección de actividad de voz (VAD), coherente con el pipeline declarado `voice-activity-detection`.
- Manejo de solapamiento y audio de dispositivo lejano, aunque con degradación medible en esos escenarios.
- Embedding de silencio aprendido (`learnable_sil_emb.bin`, 512 float32) gestionado en el lado host.
- Inferencia en dispositivo sobre Apple Silicon (iOS 17+), sin necesidad de servidor.
- Compatibilidad drop-in con FluidAudio `Nemotron3Config.low` y con el artefacto de FluidInference.
- No se documentan capacidades de generación de texto, código, matemáticas, visión ni tool calling: es un modelo puramente de audio.

## Casos de uso

- Transcripción con atribución de hablante en apps de notas de reuniones: el modelo segmenta quién habla en cada tramo y se combina con un ASR en el mismo dispositivo, aprovechando el look-ahead de 1,04 s para mantener baja latencia.
- Subtitulado en directo en iPhone: la inferencia a 67 ms por paso de 0,72 s deja margen para el resto del pipeline (ASR, traducción, renderizado) sin acumular retraso perceptible.
- Análisis de llamadas de atención al cliente: separar agente y cliente en grabaciones o en tiempo real permite métricas de tiempo de habla, interrupciones y solapamiento.
- Grabación de entrevistas y podcasts: diarización local sin subir audio a la nube, relevante por privacidad y por coste de ancho de banda.
- Investigación en lingüística conversacional: procesamiento por lotes en Mac con Apple Silicon para obtener turnos de habla sobre corpus de audio.
- Control de calidad de reuniones remotas: detectar hablantes dominantes, silencios prolongados y solapamientos como señal para herramientas de productividad.
- Prototipado de asistentes de voz con wake-word y atribución: usar la salida de VAD y diarización para decidir cuándo y a quién responder.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre DiPCo (10 cenas, un dispositivo lejano, primeros 5 minutos de cada una), en streaming por piezas de 100 ms con FluidAudio v0.17.7 en Apple Silicon:

| Metrica | 16 bits (FluidInference) | Este modelo (int8) |
|---|---|---|
| DER % | 43,84 | 44,03 |
| Confusión % | 3,03 | 3,09 |
| Mismo hablante top que el fichero de 16 bits | - | 98,1 % |

Rendimiento en iPhone 13 (iOS 26.5): 67 ms por paso de 0,72 s, frente a 74 ms del fichero de 16 bits, con el mismo consumo de memoria (35-37 MB) y el mismo estado térmico.

FluidInference reporta para su propia build int8 `low` en AMI: 26,26 % DER frente a 26,22 % a 16 bits.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM: no aplica; el modelo corre en memoria unificada de Apple Silicon. El autor reporta 35-37 MB de memoria durante la inferencia en iPhone 13.
- GPU recomendadas: cualquier dispositivo Apple con iOS 17 o superior; en Mac, chips de la familia M (Apple Silicon). No hay soporte CUDA documentado.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en iPhone y en Mac con Apple Silicon; no está pensado para GPUs NVIDIA/AMD de escritorio.
- Opciones de despliegue: Core ML (`.mlmodelc`) con FluidAudio; la librería declarada es `coreml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 67 ms por paso de 0,72 s en iPhone 13; 74 ms para la variante de 16 bits en el mismo dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / look-ahead | DER (DiPCo) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Nemotron 3 Diarization Core ML low w8) | no disponible (99,9 MB int8) | 1,04 s look-ahead | 44,03 % | OpenMDW 1.1 | Core ML int8 |
| Nemotron 3 Diarization Core ML low 16 bits (FluidInference) | no disponible (198,6 MB) | 1,04 s look-ahead | 43,84 % | OpenMDW 1.1 | Core ML fp16 |
| `nvidia/Nemotron-3-Diarization` (PyTorch original) | no disponible | no disponible | no disponible | OpenMDW 1.1 | PyTorch / safetensors (no confirmado) |

No se dispone en la información proporcionada de comparativas con otros modelos de diarización (por ejemplo, pyannote o NeMo Sortformer) en términos de DER sobre los mismos conjuntos, por lo que no se incluyen cifras que no estén verificadas.

## Limitaciones y advertencias

- DER absoluto elevado en audio de dispositivo lejano con solapamiento (43,84-44,03 % en DiPCo): no es adecuado como única fuente de verdad en entornos ruidosos.
- La cuantización int8 introduce una degradación pequeña pero real (0,19 puntos de DER en DiPCo) y un 1,9 % de pasos en los que el hablante top difiere del fichero de 16 bits.
- Solo soporta el preset `low`; no se documentan variantes `mid` o `high` en este repositorio.
- Dependencia de plataforma: Core ML e iOS 17+, sin soporte para Linux, Windows ni GPUs NVIDIA.
- El modelo es de audio; no procesa texto, no tiene capacidades multilingües declaradas ni tool calling.
- Riesgo de confusión entre hablantes con voces similares y en segmentos cortos; el embedding de silencio se gestiona en el host y debe integrarse correctamente.
- Licencia OpenMDW 1.1: conviene revisar el texto completo antes de uso comercial; se hereda del modelo base de NVIDIA y no es una licencia permisiva estándar tipo Apache 2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canersamut/nemotron-3-diarization-coreml-low-w8
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Conversión de referencia de FluidInference: https://huggingface.co/FluidInference/nemotron-3-diarization-coreml
- Licencia OpenMDW 1.1: incluida en el repositorio como `LICENSE`
