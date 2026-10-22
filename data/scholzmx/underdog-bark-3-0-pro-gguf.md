# scholzmx/underdog-bark-3.0-pro-gguf

## Resumen

Underdog Bark 3.0 Pro GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla ConwayResearch/Underdog-Bark-3.0-Pro, publicada por el usuario scholzmx para el motor de inferencia Starling. Se trata de un fine-tune de nvidia/parakeet-tdt-0.6b-v3, es decir, un encoder FastConformer acoplado a un transductor TDT (token-and-duration transducer), especializado en transcripción de audio en inglés. El modelo base tiene 627.090.606 parámetros en precisión completa (bf16) y esta versión lo recomprime a un único fichero de 364 MB.

El problema que resuelve es el despliegue de un sistema ASR de calidad media-alta en hardware sin GPU dedicada: el fichero cuantizado se ejecuta sobre la引擎 ggml de Starling en CPU y también en la app Android con el motor rápido Vulkan, lo que permite transcripción local sin conexión. Frente al modelo base en bf16, la cuantización Q4_0/Q8_0 introduce una degradación de WER de +0,41 puntos porcentuales en FLEURS en_us, con un intervalo de confianza al 95 % que incluye el cero (−0,17 a +1,05), por lo que la pérdida no es concluyente.

Es relevante ahora por su tamano (menos de 400 MB) y por su encaje en el ecosistema Starling, pero conviene subrayar que no es un GGUF compatible con llama.cpp ni con whisper.cpp: requiere el binario starling-serve o la librería libstarling_ggml. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + transductor TDT (token-and-duration transducer) |
| Parámetros totales | 627.090.606 (modelo base en safetensors bf16) |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (la model card no documenta la ventana máxima de audio) |
| Tipos de cuantización | Q4_0 en todas las capas lineales (incluidas las convoluciones pointwise del conformer); Q8_0 en joint, LSTM y embedding de predicción; receta `parakeet-q4pw-fullimx` con importance matrix |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (contrato de tensores de Starling, no llama.cpp/whisper.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de nvidia/parakeet-tdt-0.6b-v3, que combina un encoder FastConformer con un decodificador transductor TDT. El transductor predice conjuntamente tokens y duraciones, lo que evita el esquema clásico de CTC y permite decodificación no autorregresiva por tramas. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; únicamente indica que Underdog Bark 3.0 Pro es el miembro de la familia en precisión completa (bf16) y el más preciso de la misma.

La innovación de este repositorio es puramente de compresión y empaquetado. El proceso documentado tiene tres pasos: conversión exacta de los pesos publicados en `model.safetensors` (bf16) mediante `scripts/convert_parakeet_gguf.py`; cálculo de una importance matrix con 100 clips de validación de FLEURS en_us ejecutados sobre el fichero exacto; y cuantización con `starling-quantize`, receta `parakeet-q4pw-fullimx.recipe`, importance matrix y opción `--shrink-f16`. El resultado mantiene las convoluciones pointwise del conformer en Q4_0 (de ahí el sufijo `pw`) y sube a Q8_0 las partes más sensibles (joint, LSTM y embedding de predicción). El conversor exacto reproduce palabra por palabra la referencia de transformers en 60 clips, lo que sirve como validación de la conversión.

## Capacidades

- Transcripción de voz a texto en inglés (`automatic-speech-recognition`) con puntuación y normalización de texto propia del motor Starling.
- Reconocimiento de números escritos con letras y su conversión a dígitos cuando se aplica el normalizador de Whisper (relevante para esta familia de modelos).
- Ejecución en CPU mediante el motor ggml de Starling, sin GPU dedicada.
- Ejecución acelerada en Android mediante el motor Vulkan de Starling.
- Inferencia local y offline: no requiere llamadas a servicios externos una vez descargado el fichero.
- No soporta tool calling ni function calling: es un modelo ASR, no un modelo generativo de instrucciones.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidad de visión, audio comprensivo (entendimiento semántico) ni generación de texto libre más allá de la transcripción.
- Multilingüismo: no disponible; solo inglés.

## Casos de uso

- Transcripción offline en dispositivos móviles: la app Android de Starling puede cargar el fichero de 364 MB y usar el motor Vulkan, lo que permite dictado y notas de voz sin conexión y sin enviar audio a la nube.
- Subtitulado y actas de reuniones en inglés: el modelo transcribe audio segmento a segmento; su tamano permite ejecutarlo en paralelo a otras tareas del mismo servidor, aunque el WER de 3,68 %–7,12 % en FLEURS aconseja revisión humana en actas con valor contractual.
- Dictado por voz en aplicaciones de escritorio: `starling-serve --model parakeet` expone un endpoint HTTP en el puerto indicado, lo que simplifica integrarlo en un cliente ligero o en un plugin de editor.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en la CPU con ggml, se puede desplegar en instancias baratas para transcribir grandes volúmenes de audio en inglés (podcasts, clases, entrevistas) con coste de infraestructura bajo.
- Indexación y búsqueda de contenido hablado: generar transcripciones para motores de búsqueda o sistemas RAG sobre archivos de audio en inglés; el tamano reducido permite tener el modelo residente en memoria junto al resto del pipeline.
- Preprocesado de corpus de audio: usar el modelo como etiquetador automático para generar transcripciones preliminares de un dataset que después se revisará o se empleará para entrenar otros sistemas.
- Transcripción de llamadas de atención al cliente en inglés: viable para analítica y categorización, pero con la advertencia de que la evaluación publicada es sobre lectura de Wikipedia y no sobre habla conversacional o telefónica.
- Sistemas embebidos y de bajo consumo: el fichero de 364 MB y los 627 M de parámetros permiten su ejecución en placas tipo Raspberry Pi o mini-PC, siempre que el motor Starling esté compilado para la plataforma.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre FLEURS en_us test, 100 clips, cada fichero decodificado en su propio proceso sobre el motor ggml de CPU:

| Métrica (FLEURS en_us, 100 clips) | exact (bf16 convertido) | q4pw (GGUF) | Δ aparcado (q4pw − exact), IC 95 % |
|---|---:|---:|---:|
| WER, normalización Starling | 6,84 % | 7,12 % | +0,41 pt [−0,17, +1,05] |
| WER, normalización Whisper (Open ASR Leaderboard) | 3,54 % | 3,68 % | no disponible |

| Referencia adicional | WER normalización Starling | WER normalización Whisper |
|---|---:|---:|
| Parakeet TDT 0.6B v3 stock (bf16), mismos clips | 5,56 % | 4,29 % |

Observaciones: el intervalo de confianza del delta incluye el cero, por lo que la pérdida de calidad atribuible a la cuantización no es estadísticamente concluyente con 100 clips. El propio autor advierte que FLEURS es texto leído de Wikipedia y no evalúa habla conversacional (reuniones, llamadas de resultados), que es el dominio cubierto por las cifras del Open ASR Leaderboard del publicador. No se han publicado resultados de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible de forma oficial; el fichero pesa 364 MB, por lo que se puede asumir una huella en RAM del orden de menos de 1 GB, aunque el autor no publica la cifra medida.
- GPU recomendadas: no disponible. El motor documentado es la引擎 ggml de CPU; en Android existe un motor Vulkan acelerado, sin lista de GPUs validadas.
- Cabe en GPU consumer: no hay datos publicados sobre backend CUDA/ROCm para este fichero. La vía soportada es CPU y, en Android, Vulkan.
- Opciones de despliegue: `starling-serve` (binario nativo), `libstarling_ggml` (librería), y la app Android de Starling con motor Vulkan. No es compatible con vLLM, llama.cpp, Ollama, TGI ni whisper.cpp.
- Latencia y throughput: no disponible; la model card no publica tiempos de decodificación ni RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | WER FLEURS en_us | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Underdog Bark 3.0 Pro q4pw (este repo) | 627 M (cuantizado) | no disponible | 7,12 % (Starling) / 3,68 % (Whisper) | CC-BY-4.0 | GGUF Starling, 364 MB |
| Underdog Bark 3.0 Pro bf16 (ConwayResearch) | 627 M | no disponible | 6,84 % (Starling) / 3,54 % (Whisper) | CC-BY-4.0 | safetensors bf16 |
| Parakeet TDT 0.6B v3 (NVIDIA, stock) | 0,6 B | no disponible | 5,56 % (Starling) / 4,29 % (Whisper) | no disponible en la información proporcionada | checkpoint NVIDIA |
| Otras alternativas ASR (p. ej. Whisper large-v3) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks para modelos de otras familias en la información proporcionada, por lo que la comparativa se limita a los tres miembros evaluados por el autor con el mismo conjunto de 100 clips.

## Limitaciones y advertencias

- Solo inglés: no hay soporte de castellano ni de otros idiomas, pese a que el pipeline sea ASR genérico.
- El conjunto de evaluación es FLEURS (texto leído de Wikipedia); no hay medición publicada sobre habla conversacional, acentos no nativos, llamadas telefónicas, ruido de fondo o audio de baja calidad.
- La cuantización Q4_0 puede degradar la precisión en dominios distintos del evaluado; el delta medido (+0,41 pt) tiene un intervalo de confianza que cruza cero, así que la equivalencia con bf16 no está demostrada.
- El WER absoluto del fine-tune es peor que el del Parakeet stock en los mismos clips (7,12 % frente a 5,56 % con normalización Starling), lo que sugiere que la mejora del fine-tune no se manifiesta en este benchmark concreto.
- Formato no estándar: los ficheros siguen el contrato de tensores de Starling y no cargan en llama.cpp, whisper.cpp, Ollama ni en la mayoría de runtimes ASR habituales. El usuario queda atado al proyecto Starling.
- Riesgo de alucinación en ASR: no se documenta el comportamiento ante silencios largos, música o habla solapada, escenarios en los que los transductores TDT pueden emitir texto espurio.
- Sesgos: no se publica ningún análisis de sesgo por acento, género, edad o origen dialectal dentro del inglés.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a Conway Research, NVIDIA y Moondream, y la inclusión del fichero `NOTICE` sin modificaciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y publicado el mismo día de su creación; no hay evidencia de uso en producción ni de mantenimiento posterior.
- Solo se publica un fichero (`q4pw`); no hay variantes Q5, Q8 ni ficheros en precisión completa dentro de este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scholzmx/underdog-bark-3.0-pro-gguf
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo de Moondream citado en la atribución: https://huggingface.co/moondream/parakeet-ultra
- Repositorio del motor Starling: https://github.com/sims1253/starling
- Open ASR Leaderboard (normalizador de Whisper citado): https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
