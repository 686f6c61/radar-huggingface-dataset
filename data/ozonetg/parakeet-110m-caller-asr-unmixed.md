# ozonetg/parakeet-110m-caller-asr-unmixed

## Resumen

Parakeet 110m caller-side phone ASR · unmixed es un modelo de reconocimiento automático del habla (ASR) especializado en el canal del cliente (caller) de llamadas telefónicas salientes en inglés estadounidense, muestreadas a 8 kHz. Lo publica el usuario ozonetg en HuggingFace y es un ajuste fino (fine-tune) del modelo nvidia/parakeet-tdt_ctc-110m de NVIDIA. El objetivo es transcribir audio telefónico de banda estrecha procedente de centros de contacto y llamadas de venta, un dominio donde los modelos ASR generalistas pierden precisión por el codec, el ruido de línea y la conversación espontánea.

Técnicamente es un encoder FastConformer de 114,6 M de parámetros con decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar, la misma arquitectura que su modelo base. Se distribuye en formato .nemo en float32, con licencia CC BY 4.0 y entrenamiento sobre 377 h de audio real de llamadas salientes (587.600 segmentos). Los pesos corresponden a la receta sin mezclar (unmixed), es decir, sin el blending 0,8/0,2 con el modelo base que usa la variante hermana parakeet-110m-caller-asr.

Su relevancia actual está en el nicho: frente a los 14,58 % de WER del base sin tocar en cinco conjuntos públicos de llamadas telefónicas agrupados, este modelo baja a 11,42 %, y en llamadas internas retenidas pasa de 9,19 % a 3,29 %. El coste es un pequeño retroceso en dominio general (7,03 % frente a 6,25 % en LibriSpeech test-other a 8 kHz), lo que lo convierte en una pieza muy concreta para pipelines de analítica de voz, no en un ASR de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer con decodificador TDT (token-and-duration transducer) y cabeza CTC auxiliar |
| Parámetros totales | 114,6 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El entrenamiento usó segmentos de 0,3 a 20 s; la model card no especifica la ventana de inferencia |
| Tipos de cuantización | No disponible (solo se publican pesos en float32 dentro del archivo .nemo) |
| Idiomas soportados | Inglés (en), en particular inglés estadounidense telefónico de banda estrecha |
| Licencia | CC BY 4.0 |
| Formato de pesos | .nemo (float32); no se publican safetensors, GGUF ni ONNX |
| Modelo base | nvidia/parakeet-tdt_ctc-110m (fine-tune) |
| Entrada | Audio mono a 16 kHz en float; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz |
| Salida | Texto en inglés con puntuación y mayúsculas |
| Decodificación | TDT greedy (todos los resultados declarados usan esta configuración) |
| Framework | NeMo 2.5.3 (también restaura y transcribe en NeMo 3.0) |
| Tamaño del repositorio | 0,5 GB |
| Fecha de publicación | 9 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base: un encoder FastConformer (variante de Conformer con convoluciones subsampled) de 114,6 M de parámetros, un decodificador TDT que predice conjuntamente tokens y duraciones, y una cabeza CTC auxiliar que actúa como objetivo secundario durante el entrenamiento. La decodificación empleada en todos los números publicados es TDT greedy. La entrada esperada es audio mono a 16 kHz en coma flotante, por lo que el audio telefónico de 8 kHz debe remuestrearse antes de la inferencia.

Los datos de entrenamiento son el canal del cliente de llamadas de venta salientes de Estados Unidos, grabadas entre 2025 y 2026 a partir de cinco fuentes internas: 587.600 segmentos y 377 h en total, con segmentos de 0,3 a 20 s, de los cuales 504.617 segmentos (345,5 h) forman el split de entrenamiento. Un 5 % de los segmentos son no-habla (ruido de línea, silencio, espera, respiración) con objetivo vacío, y alrededor de un 1 % son saludos de buzón de voz o mensajes de IVR captados en la línea del cliente. Las etiquetas son transcripciones automáticas generadas con Qwen3-ASR-1.7B, sin transcripción humana: los segmentos donde varios sistemas ASR independientes coincidían se etiquetaron como tier 1 (peso de pérdida 1,0), los de coincidencia parcial como tier 2 (peso 0,7) y el resto se descartó.

Respecto a la receta original del base, esta versión sin mezclar introduce tres cambios: SpecAugment desactivado, uso de una media móvil exponencial de los pesos (decay 0,999) para validación y guardado, y unas 30,5 h adicionales de audio del canal del cliente transcritas y filtradas con el mismo criterio que el conjunto principal. La variante hermana parakeet-110m-caller-asr es una mezcla 0,8 × estos pesos + 0,2 × el base sin tocar: según la model card, sin la mezcla el WER agrupado en conjuntos públicos es el mismo, el WER en dominio interno es ligeramente inferior y el coste en LibriSpeech es mayor.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas, sobre audio telefónico de banda estrecha (8 kHz remuestreado a 16 kHz).
- Reconocimiento especializado en el canal del cliente (caller) de llamadas salientes, no en el canal del agente.
- Supresión de no-habla: al haberse entrenado con un 5 % de segmentos sin voz y objetivo vacío, tiende a mantenerse en silencio ante ruido de línea, esperas o respiraciones.
- Manejo de audio de buzón de voz y mensajes de IVR (aproximadamente el 1 % del conjunto de entrenamiento).
- Decodificación TDT greedy, con el coste computacional bajo que implica un modelo de 114,6 M de parámetros.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio multimodal: es un modelo puramente ASR.
- Capacidad multilingüe: no disponible; solo declara inglés.
- No se documentan modos especiales (thinking mode, streaming explícito, diarización) en la información disponible.

## Casos de uso

- Control de calidad en centros de contacto: transcribir el canal del cliente de llamadas salientes para medir tiempos de respuesta, objeciones recurrentes y cumplimiento de guiones, aprovechando que el modelo está ajustado exactamente a ese canal y codec.
- Analítica de ventas salientes: procesar por lotes las 377 h de tipología de audio que maneja el modelo para extraer motivos de rechazo, menciones de competidores o solicitudes de cancelación, y alimentar cuadros de mando comerciales.
- Transcripción por canales separados: al estar entrenado solo con el lado del cliente y no estar mezclado, se puede combinar con un ASR independiente para el canal del agente y reconstruir el diálogo completo sin solapamiento de hablantes.
- Enrutado y clasificación automática: la transcripción resultante puede pasarse a un clasificador o a un LLM para etiquetar el motivo de la llamada, priorizar devoluciones o detectar incidencias.
- Auditoría y cumplimiento normativo: generar transcripciones de grabaciones telefónicas para revisión de cumplimiento, con la ventaja de que la licencia CC BY 4.0 permite uso comercial con atribución.
- Procesamiento a gran escala con coste bajo: con 114,6 M de parámetros, el modelo puede ejecutarse en GPU de consumo o incluso en CPU para volúmenes grandes de audio, algo inviable con modelos ASR de miles de millones de parámetros.
- Investigación en ASR telefónico: servir como punto de comparación reproducible (licencia abierta, pesos publicados, receta documentada) en trabajos sobre banda estrecha y habla conversacional.
- Preprocesado para sistemas de atención automatizada: la transcripción del cliente puede alimentar resúmenes automáticos de llamada o sistemas de recomendación de siguiente acción para el agente.
- Análisis de voz de cliente para detección de fraude o verificación de identidad en segundo plano, siempre que se combine con módulos adicionales, ya que el modelo solo produce texto.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en la model card, es decir, no verificados por terceros). Todos con decodificación TDT greedy.

| Conjunto de evaluación | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 3,10 |
| LibriSpeech test-other (8 kHz) | 7,03 |
| LibriSpeech test-clean | 2,76 |
| LibriSpeech test-other | 5,82 |
| CallHome English (test) | 12,21 |
| CallFriend English (dev) | 17,24 |
| HarperValley Bank (canal del cliente) | 5,08 |
| Let's Go (referencias reescritas) | 23,17 |
| AppTek call-center dialogues, clientes de EE. UU. | 8,74 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,48 |

Comparaciones declaradas por el autor:

| Escenario | Este modelo | Sistema anterior (110m base + adaptador de dominio) | Base sin tocar (110m) |
|---|---|---|---|
| Cinco conjuntos públicos de llamadas telefónicas (agrupados) | 11,42 % | 14,00 % | 14,58 % |
| Llamadas internas retenidas en dominio | 3,29 % | 8,68 % | 9,19 % |
| LibriSpeech test-other a 8 kHz | 7,03 % | No disponible | 6,25 % |

## Requisitos de hardware

- VRAM estimada para inferencia: con 114,6 M de parámetros en float32, los pesos ocupan aproximadamente 458 MB; el repositorio completo pesa 0,5 GB. Una estimación conservadora sitúa el consumo total en torno a 1-2 GB de VRAM incluyendo el runtime de NeMo, aunque la model card no publica cifras de VRAM medidas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. Para lotes grandes o inferencia concurrente son adecuadas RTX 3060, RTX 4090, A100 o H100, pero el modelo es demasiado pequeño para aprovechar el rendimiento de las GPU de datacenter de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida suficiente. También es viable la inferencia en CPU.
- Opciones de despliegue: NeMo 2.5.3 (entorno de referencia) y NeMo 3.0, que según la model card puede restaurar y transcribir con este modelo. No hay información sobre exportación a ONNX, TensorRT, GGUF o formatos compatibles con vLLM, Ollama o llama.cpp; al ser un modelo ASR en formato .nemo, estas rutas no están documentadas.
- Latencia y throughput estimados: no disponibles. La model card no publica medidas de RTF (factor de tiempo real) ni de rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | WER agrupado (5 conjuntos telefónicos) | WER en dominio interno | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ozonetg/parakeet-110m-caller-asr-unmixed | 114,6 M | Fine-tune del canal del cliente, sin mezclar | 11,42 % | 3,29 % | CC BY 4.0 | HuggingFace, formato .nemo |
| ozonetg/parakeet-110m-caller-asr | 114,6 M | Mezcla 0,8 de estos pesos + 0,2 del base | Igual (según la model card) | Ligeramente superior | CC BY 4.0 | HuggingFace, formato .nemo |
| nvidia/parakeet-tdt_ctc-110m | 114,6 M | Modelo base de propósito general | 14,58 % | 9,19 % | No disponible en la información proporcionada | HuggingFace |

No se dispone de datos comparativos con otras familias de ASR telefónico (por ejemplo variantes de Whisper o wav2vec 2.0) en la información proporcionada; sus cifras de WER en estos mismos conjuntos aparecen como no disponibles.

## Limitaciones y advertencias

- Idioma único: solo inglés, y específicamente inglés estadounidense de llamadas salientes. No hay soporte multilingüe ni evaluación en otros acentos o variantes dialectales.
- Dominio muy restringido: entrenado exclusivamente con el canal del cliente (callee/caller según la jerga del autor: el lado del cliente) de llamadas de venta salientes de EE. UU. de 2025-2026. Su comportamiento fuera de ese dominio no está caracterizado.
- Etiquetas automáticas sin supervisión humana: las transcripciones proceden de Qwen3-ASR-1.7B y solo se filtraron por coincidencia entre sistemas ASR. Los errores y sesgos del modelo profesor pueden haberse transferido al alumno.
- Caída en dominio general: en LibriSpeech test-other a 8 kHz obtiene 7,03 % frente al 6,25 % del base (+0,78 pp), lo que indica una pérdida de robustez fuera del dominio telefónico de ventas.
- Rendimiento desigual en habla conversacional espontánea: 17,24 % en CallFriend dev y 23,17 % en Let's Go, muy por encima del 3,29 % en llamadas internas retenidas en dominio. No debe asumirse un rendimiento uniforme en todas las llamadas telefónicas.
- Riesgo de alucinación: como cualquier ASR, puede generar texto plausible en tramos con ruido, música de espera o voz lejana. El entrenamiento con un 5 % de segmentos no-habla con objetivo vacío mitiga parcialmente el problema, pero no lo elimina.
- Posible supresión de habla breve: los segmentos de entrenamiento van de 0,3 a 20 s y hay ejemplos con objetivo vacío, lo que puede provocar que el modelo descarte intervenciones muy cortas.
- Falta de diarización: el modelo no separa hablantes. Solo es fiable si se le entrega el canal aislado del cliente; con audio mezclado de ambos interlocutores el WER se degradará.
- Benchmarks no verificados: todos los resultados de la model card están marcados como `verified: false` y proceden del propio autor. No hay evaluación independiente publicada.
- Licencia CC BY 4.0: permite uso comercial, incluida la modificación y redistribución, siempre que se atribuya la autoría y se indique la licencia. No impone restricciones de uso adicionales, pero es responsabilidad del integrador cumplir la normativa aplicable sobre grabación y tratamiento de llamadas (consentimiento, retención de datos).
- Sin información sobre sesgos demográficos: no se documentan evaluaciones por acento, género, edad ni origen del hablante, pese a tratarse de audio de clientes reales.
- Requisito de preprocesado: hay que remuestrear el audio de 8 kHz a 16 kHz antes de la inferencia; un remuestreo mal configurado degradará los resultados de forma no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-unmixed
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Variante hermana con mezcla de pesos: https://huggingface.co/ozonetg/parakeet-110m-caller-asr
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante (papers, blogs, repositorios o demos) asociado a este modelo; los resultados devueltos no guardan relación con él.
