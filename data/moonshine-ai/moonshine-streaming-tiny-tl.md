# moonshine-ai/moonshine-streaming-tiny-tl

## Resumen

Moonshine Streaming Tiny es un modelo de reconocimiento automático de voz (ASR) desarrollado por Useful Sensors y publicado bajo el identificador `moonshine-ai/moonshine-streaming-tiny-tl`. Esta variante está entrenada específicamente para tagalo (tl) y forma parte de la familia Moonshine, diseñada para transcripción incremental en tiempo real sobre hardware de bajo consumo, como teléfonos, microcontroladores y dispositivos edge. Con solo 27 millones de parámetros, el modelo combina un frontend de audio en el dominio temporal a 50 Hz con un encoder Transformer de ventanas deslizantes, lo que permite transcribir mientras se habla sin esperar a que termine la frase.

El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors para su uso con la biblioteca `transformers`. Su principal innovación es el uso de un frontend de baja frecuencia que reduce la carga computacional, junto con una arquitectura de encoder con atención local para minimizar la latencia. Aunque el checkpoint publicado corresponde a una etapa intermedia de entrenamiento (Stage A) y no está completamente convergido, ofrece un WER de 15,05 sobre el conjunto de evaluación FLEURS Tagalog, lo que lo convierte en una opción viable para aplicaciones de ASR en tagalog en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con frontend de audio de 50 Hz y encoder de ventanas deslizantes |
| Parámetros totales | 27.015.360 (27,0 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se usa ventana deslizante en el encoder) |
| Tipos de cuantización | No disponible en el repositorio (se menciona una build .ort int8 en la documentación, pero no se distribuye en este repo) |
| Idiomas soportados | Tagalog (tl) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Moonshine Streaming Tiny se basa en un Transformer estándar con un frontend de audio que opera a 50 Hz, es decir, extrae una característica cada 20 ms. Este frontend aplica CMVN (normalización de media y varianza por canal), compresión asinh y dos convoluciones causales con stride 2, reduciendo la tasa de muestreo de audio de 16 kHz a 50 Hz. El encoder consta de 6 capas con 320 unidades y 8 cabezas de atención, donde las dos primeras y las dos últimas capas usan ventanas de atención (16, 4) y las intermedias (16, 0), lo que proporciona un lookahead de aproximadamente 80 ms. El decoder tiene también 6 capas, 320 unidades y 8 cabezas, con rotación posicional (RoPE) sobre 32 de las 40 dimensiones de cada cabeza. Además, se inserta un adaptador con embeddings posicionales absolutos aprendidos antes del decoder.

El entrenamiento se realizó sobre un corpus de tagalog pseudo-etiquetado: aproximadamente 163.300 horas de audio de YouTube y 3.300 horas de podcasts, transcritas automáticamente por un modelo de la familia Whisper como profesor. No se emplearon transcripciones humanas para la mayor parte del entrenamiento, por lo que el modelo hereda los errores del profesor, especialmente en nombres propios, números y code-switching. El checkpoint publicado corresponde a una etapa intermedia (Stage A) que aún no había convergido; el mejor WER alcanzado fue 16.600 y se observó una meseta alrededor de 17.16 en las últimas 31 lecturas, por lo que el modelo no es el definitivo de la etapa.

## Capacidades

- Reconocimiento de voz automático en tagalog con salida de texto transcrito.
- Transcripción incremental (streaming): el modelo procesa el audio en bloques y emite hipótesis parciales antes de que termine la frase.
- Funciona con audio de 16 kHz (mono), aceptado a través del procesador `AutoProcessor`.
- Capacidad de generar texto con normalización de mayúsculas y puntuación (aunque la evaluación usa normalización estándar).
- Soporte para inferencia en dispositivos de bajo consumo gracias a su pequeño tamaño (27 M parámetros) y al frontend de baja frecuencia.
- No soporta tool calling, ni agentes, ni visión; es exclusivamente ASR.

## Casos de uso

- **Transcripción de voz en tiempo real en tagalog**: El modelo se puede integrar en aplicaciones de subtitulado en directo o en asistentes de voz que requieran respuesta inmediata. Su arquitectura de streaming permite mostrar transcripciones parciales mientras el usuario habla.
- **Comandos de voz en dispositivos edge**: Por su tamaño reducido, es adecuado para ejecutarse en microcontroladores o dispositivos con poca memoria, como altavoces inteligentes o wearables, permitiendo activación por voz y reconocimiento de órdenes en tagalog.
- **Análisis de contenido de vídeo**: En plataformas de vídeo, se puede transcribir automáticamente el audio de vídeos en tagalog para generar subtítulos o búsqueda de contenido, aunque se debe tener en cuenta la calidad de los pseudo-labels.
- **Soporte al cliente automatizado**: Los sistemas de atención telefónica pueden usar el modelo para transcribir las consultas de los usuarios en tagalog y derivar a un agente humano o a un sistema de respuestas automáticas.
- **Investigación lingüística**: Para estudios de sociolingüística o procesamiento de corpus en tagalog, el modelo puede servir como herramienta de transcripción inicial, aunque se debe revisar manualmente los resultados debido a las limitaciones de los datos de entrenamiento.
- **Aplicaciones de accesibilidad**: Para personas con discapacidad auditiva que necesiten transcripción de conversaciones en tagalog en tiempo real, el modelo puede integrarse en aplicaciones de subtitulado en dispositivos móviles.

## Benchmarks y rendimiento

El modelo fue evaluado en el panel `fleurs_tl` de FLEURS (solo lectura de voz, no espontánea). Los resultados reportados en la model card son:

| Panel | WER |
|---|---|
| `fleurs_tl` (muestra de 400 frases, batch 1) | 15.05 |
| `fleurs_tl` (mismo muestreo, repositorio) | 14.91 |

No se han publicado resultados comparativos con otros modelos en la información proporcionada. El WER se mide tras normalización de mayúsculas y puntuación. Se indica que el checkpoint de entrenamiento tenía 15.05 y el repositorio 14.91, con 399 de 400 transcripciones idénticas. No hay datos de otros benchmarks como MMLU o HumanEval.

## Requisitos de hardware

- Tamaño del modelo: 27,0 M de parámetros, lo que en float32 ocupa aproximadamente 108 MB (27.015.360 × 4 bytes). Esto lo hace ejecutable en CPU y en GPUs de baja gama.
- VRAM estimada: para inferencia en FP32, se puede ejecutar con menos de 1 GB de memoria (incluyendo overhead del framework). Para cuantización int8, el modelo sería aún más ligero, aunque no se ofrece en este repo.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA Jetson Nano, GTX 1050, o incluso CPU sola). Para despliegue en edge, se puede usar hardware como Raspberry Pi 4 con suficiente RAM.
- Opciones de despliegue: compatible con `transformers` (Python), y se puede exportar a ONNX para su uso en `ONNX Runtime`. No se menciona compatibilidad con vLLM, llama.cpp o Ollama, ya que es un modelo de ASR, no de lenguaje.
- Latencia: el diseño de streaming con frontend de 50 Hz y ventanas deslizantes está optimizado para baja latencia, pero no se proporcionan cifras concretas de latencia o throughput en la documentación.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de ASR para tagalog en la documentación proporcionada. La familia Moonshine incluye variantes como `moonshine-tiny`, `moonshine-base`, `moonshine-streaming-small` y `moonshine-streaming-medium`, pero no hay tablas comparativas de rendimiento entre ellas en este repo. No se puede realizar una comparación objetiva sin datos adicionales.

## Limitaciones y advertencias

- **Datos de entrenamiento pseudo-etiquetados**: Las transcripciones provienen de un modelo de profesor (Whisper), por lo que el modelo reproduce sus errores en nombres propios, números y code-switching. No se usaron transcripciones humanas para la mayor parte del entrenamiento.
- **Checkpoint no convergido**: El modelo es un snapshot de una etapa de entrenamiento (Stage A) que aún no había finalizado. El WER puede mejorar en futuras versiones.
- **Riesgo de bucles de repetición**: Como otros modelos seq2seq de ASR, puede caer en bucles de repetición en clips cortos o ruidosos. Se recomienda limitar `max_new_tokens` en la generación.
- **Importancia del `attention_mask`**: El encoder aplica ventanas deslizantes solo si se pasa el `attention_mask`; sin él, el modelo se comporta de manera diferente a la entrenada, lo que degrada el rendimiento.
- **Evaluación limitada**: Solo se evalúa en FLEURS Tagalog, un conjunto de lectura. No mide habla espontánea ni code-switching taglish, aunque ambos están presentes en los datos de entrenamiento.
- **Licencia MIT**: Permite uso comercial y modificación, pero se debe mantener el aviso de copyright. No hay restricciones específicas de uso, pero se recomienda evaluar los riesgos de sesgo en producción.

## Enlaces

- Modelo en Hugging Face: [moonshine-ai/moonshine-streaming-tiny-tl](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-tl)
- Modelo base de la familia: [moonshine-ai/moonshine-streaming-tiny](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny)
- Modelo no streaming: [UsefulSensors/moonshine-tiny](https://huggingface.co/UsefulSensors/moonshine-tiny)
- Repositorio oficial: [moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)
- Código de la arquitectura: [moonshine-streaming-model.cpp](https://github.com/moonshine-ai/moonshine/blob/main/core/moonshine-streaming-model.cpp)
