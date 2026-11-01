# ahdrage/norsk-parakeet

## Resumen

norsk-parakeet es un modelo de reconocimiento automático del habla (ASR) especializado en noruego bokmål, desarrollado por el usuario ahdrage a partir de moondream/parakeet-ultra, que a su vez es un post-entrenamiento del NVIDIA Parakeet TDT 0.6B v3. El modelo resuelve el problema de la transcripción precisa de voz en noruego con salida en texto con mayúsculas y puntuación, algo que los modelos multilingües genéricos no cubren bien en esta lengua. Es relevante porque ofrece un rendimiento cercano a NB-Whisper large (1,55B parámetros) con menos de la mitad de parámetros.

La arquitectura es Parakeet TDT (Token-and-Duration Transducer), un modelo de tipo transducer con 627 millones de parámetros totales, entrenado en dos fases sobre aproximadamente 2.400 horas de voz noruega procedente de las publicaciones abiertas de la Biblioteca Nacional de Noruega (Stortinget, NST y NPSC). La versión actual es la v3, publicada el 31 de octubre de 2026, que corrige el problema de salida desbocada de la v2 y mejora ligeramente los resultados en todos los conjuntos de prueba.

El modelo está pensado para inferencia en producción con audio de hasta unos 30 segundos por fragmento y alcanza velocidades de 500 a 800 veces tiempo real en una RTX PRO 4000 Blackwell. Su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de hasta ~30 s por fragmento |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | noruego bokmål (códigos `no`, `nb`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer) de la familia Parakeet, heredado de NVIDIA Parakeet TDT 0.6B v3 y post-entrenado por Moondream como parakeet-ultra. La arquitectura transducer combina un encoder acústico con un predictor y un joint network que emite tokens y duraciones de forma conjunta, lo que permite decodificación no autoregresiva por tramos y un throughput muy alto. El modelo es de tipo feature-extraction/ASR y no genera texto libre: produce transcripciones alineadas con el audio de entrada.

El entrenamiento se realizó en dos fases sobre unas 2.400 horas de voz noruega. La fase 1 (v1) usó las publicaciones abiertas de la Biblioteca Nacional de Noruega (Stortinget, NST y NPSC bokmål), filtradas con criterios de norsk-asr: enunciados sin dígitos cuyas transcripciones coinciden con una pasada de Whisper (WER ≤ 0,15), clips de hasta 30 s y eliminación de velocidades de habla implausibles. Se entrenaron todos los parámetros con AdamW, LR pico de 5e-5 con decaimiento coseno, 64 s de audio por lote, autocast bf16, estadísticas de BatchNorm congeladas, una época (110.608 pasos) en una única GPU de 24 GB. La fase 2 (v3) partió de v1 y añadió una época sobre voz adicional mezclada con parte de los datos de la fase 1, con LR pico de 3e-5 y 79.323 pasos; los clips se cortaron en las pausas entre frases y se descartaron aquellos con CER superior al 30% frente a la salida de v1 o cuyas primeras o últimas palabras no detectaba v1.

## Capacidades

- Reconocimiento automático del habla en noruego bokmål con salida en texto con mayúsculas y puntuación.
- Transcripción de audio de hasta aproximadamente 30 segundos por fragmento; para audio más largo se recomienda cortar en pausas.
- Manejo de dígitos en la salida (la v3 usa dígitos además de palabras; la v1 solo escribía números como palabras).
- Inferencia por lotes (batch) mediante `ParakeetForTDT.generate` y `batch_decode`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene capacidades de visión, audio generativo ni modo thinking.
- Multilingüe limitado: solo noruego bokmål; no se ha entrenado específicamente para nynorsk ni para habla con fuerte carga dialectal.

## Casos de uso

- Subtitulado y transcripción de reuniones y actas parlamentarias: el modelo está entrenado con voz de Stortinget y rinde especialmente bien en ese dominio (WER 10,9 en el conjunto de validación de Stortinget), por lo que es adecuado para transcribir sesiones, comités y audiencias públicas con salida puntuada.
- Generación de subtítulos para medios audiovisuales en noruego: con 500–800× tiempo real en una RTX PRO 4000 Blackwell, un archivo de una hora se transcribe en segundos, lo que permite procesar catálogos completos en pocas horas.
- Transcripción de entrevistas y notas de voz: para clips de hasta 30 s cortados en pausas, el modelo ofrece WER de 4,2 en NST y 7,1 en NPSC, adecuado para documentación periodística o investigación cualitativa.
- Atención al cliente y centros de contacto: permite transcribir llamadas grabadas en bokmål para análisis de calidad y búsqueda de texto; requiere trocear el audio en segmentos de hasta 30 s y unir el texto resultante.
- Indexación y búsqueda de archivos de audio: al ser un modelo pequeño (627M parámetros) y rápido, se puede desplegar en una GPU de 24 GB para procesar grandes volúmenes de grabaciones y alimentar un índice de búsqueda textual.
- Accesibilidad: generación de transcripciones en vivo o diferidas para contenido en noruego bokmål dirigido a personas con discapacidad auditiva, con la ventaja de que la salida ya incluye mayúsculas y puntuación.
- Preprocesado de datasets de voz: al ser un modelo ASR rápido y ligero, sirve para pseudo-etiquetar o filtrar corpus de audio noruego antes de entrenar otros modelos.

## Benchmarks y rendimiento

WER (%) en enunciados sin dígitos, texto normalizado (minúsculas, sin puntuación), según la model card. Mismos subconjuntos de prueba para todas las filas: 1.000 enunciados de NPSC y NST, todo FLEURS nb (357) y validación de Stortinget (697).

| Modelo | Parámetros | FLEURS | NPSC | NST | Stortinget |
|---|---|---|---|---|---|
| NB-Whisper large | 1,55B | 4,2 | 16,5 | 2,0 | 9,0 |
| norsk-asr + LM 4-gram | – | 10,0 | 9,7 | 5,6 | 12,2 |
| parakeet-ultra, zero-shot | 0,6B | 64,3 | 71,8 | 67,1 | 74,7 |
| norsk-parakeet v1 (greedy, sin LM) | 0,6B | 8,1 | 7,6 | 4,6 | 11,2 |
| norsk-parakeet v2 (greedy, sin LM) | 0,6B | 6,7 | 7,1 | 4,4 | 11,0 |
| norsk-parakeet v3 (greedy, sin LM) | 0,6B | 6,2 | 7,1 | 4,2 | 10,9 |

Salida desbocada en 3.571 clips reservados:

| Métrica | v1 | v2 | v3 |
|---|---|---|---|
| Clips que repiten una frase | 3 | 20 | 2 |
| Salida más rápida (palabras por segundo de audio) | 97 | 128 | 7 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 627M parámetros en safetensors; en bf16 ocupa aproximadamente 1,25 GB de pesos, más overhead de activaciones y del procesador, por lo que cabe holgadamente en GPUs de 8 GB o incluso menos.
- GPU recomendadas: RTX PRO 4000 Blackwell (referencia del autor, 500–800× tiempo real), A100, H100, L4, RTX 4090 y RTX 3090; cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: transformers (versión >= 5.21, con `AutoProcessor` y `ParakeetForTDT`), con soporte de endpoints compatible según los tags del repositorio. No se han publicado pesos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: aproximadamente 500–800× tiempo real en una RTX PRO 4000 Blackwell según el autor; no se dispone de cifras para otras GPU.
- El repo ocupa 7,5 GB, lo que incluye posibles artefactos adicionales además de los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER FLEURS nb | WER NPSC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| norsk-parakeet v3 | 0,6B | noruego bokmål | 6,2 | 7,1 | CC-BY-4.0 | HuggingFace (transformers) |
| NB-Whisper large | 1,55B | noruego | 4,2 | 16,5 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| norsk-asr + LM 4-gram | – | noruego | 10,0 | 9,7 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| parakeet-ultra (zero-shot) | 0,6B | multilingüe | 64,3 | 71,8 | CC-BY-4.0 | HuggingFace |

NB-Whisper large obtiene mejor WER en FLEURS y Stortinget, mientras que norsk-parakeet v3 es claramente mejor en NPSC y competitivo en NST, con un tamaño 2,5 veces menor y sin necesidad de language model externo.

## Limitaciones y advertencias

- Solo bokmål: no se ha entrenado específicamente para nynorsk ni para habla con fuerte carga dialectal.
- Problema conocido de números pegados a la palabra anterior: la v3 escribe a menudo "september2017" en lugar de "september 2017" porque las etiquetas de entrenamiento perdieron el límite de palabra antes de los dígitos; la model card proporciona una expresión regular para corregirlo después de decodificar. Las puntuaciones por palabra no se ven afectadas.
- La v2 tenía salida desbocada (hasta 128 palabras por segundo de audio y 20 clips con repetición); se recomienda usar la v3.
- El audio conversacional y con ruido es más difícil; el autor recomienda probar con audio propio antes de desplegar.
- Los clips de más de 30 s tienden a provocar bucles; es necesario cortar en pausas (el autor documenta WER de 11,0 con cortes en pausas frente a 11,5 con cortes fijos de 30 s y 14,0 con cortes fijos de 15 s en 10 horas de grabaciones completas).
- Riesgo de alucinación en forma de repeticiones o texto inventado cuando el corte cae en medio del habla; mitigable con el troceado en pausas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; hay que citar a ahdrage, NVIDIA (parakeet-tdt-0.6b-v3), Moondream (parakeet-ultra) y la Biblioteca Nacional de Noruega como fuente de los datos.
- Requiere transformers >= 5.21, lo que puede limitar la compatibilidad con stacks más antiguos.
- No se han publicado resultados de sesgos demográficos ni de robustez ante acentos no noruegos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahdrage/norsk-parakeet
- Repositorio de código, receta de entrenamiento y registro de progreso: https://github.com/ahdrage/norsk-parakeet
- Modelo base intermedio: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Referencia de evaluación norsk-asr: https://github.com/ahdrage/norsk-asr
