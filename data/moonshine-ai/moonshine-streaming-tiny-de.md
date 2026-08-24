# moonshine-ai/moonshine-streaming-tiny-de

## Resumen

Moonshine Streaming Tiny — German es un modelo de reconocimiento automático del habla (ASR) en streaming para alemán, desarrollado por Useful Sensors y publicado bajo el identificador `moonshine-ai/moonshine-streaming-tiny-de`. Con 27,0 millones de parámetros, está diseñado específicamente para inferencia en dispositivos de gama baja (edge-class hardware), transcribiendo audio de forma incremental en lugar de esperar al final de la emisión. Es una variante lingüística del modelo base `moonshine-streaming-tiny`, con un tokenizador alemán de 12.288 entradas.

El modelo combina un frontend de audio en el dominio del tiempo a 50 Hz con un codificador Transformer de ventana deslizante, lo que permite transcribir segmentos de audio a medida que llegan. Su relevancia actual radica en la creciente demanda de ASR de baja latencia para asistentes de voz, transcripción en directo y comandos por voz en alemán, ejecutándose en hardware con recursos limitados. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con frontend de audio de 50 Hz, codificador de ventana deslizante y decodificador autoregresivo |
| Parametros totales | 27.015.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en streaming con ventanas deslizantes; el frontend requiere tramas de 80 muestras) |
| Tipos de cuantizacion | int8 (paquete `.ort` servido a la librería de despliegue Moonshine) |
| Idiomas soportados | Alemán (de) |
| Licencia | MIT |
| Formato de pesos | Safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura se describe como `slinkier_prime_adapted`. El codificador tiene 6 capas con anchura 320 y 8 cabezas de atención, aplicando ventanas deslizantes de (16, 4) en las dos primeras y dos últimas capas, y (16, 0) en las intermedias. Esto proporciona aproximadamente 80 ms de lookahead en las capas con ventana (16, 4), mientras que las intermedias no tienen lookahead. El decoder también tiene 6 capas, anchura 320 y 8 cabezas, con rotary positional embeddings (RoPE) aplicados sobre 32 de las 40 dimensiones de cada cabeza. El frontend extrae características a 50 Hz con normalización CMVN, compresión asinh y dos convoluciones causales con stride 2. Antes del decoder se insertan embeddings posicionales absolutos aprendidos.

El entrenamiento se realizó sobre un corpus alemán a gran escala con etiquetado automático, compuesto por aproximadamente 103.000 horas de podcasts pseudo-etiquetados (transcripciones generadas por un modelo profesor de la familia Whisper, no por humanos) y unas 3.700 horas de habla leída transcrita por humanos (Common Voice, Multilingual LibriSpeech, FLEURS y VoxPopuli). No se detalla el uso de RLHF o DPO; el entrenamiento es supervisado de forma clásica sobre las transcripciones disponibles.

## Capacidades

- Reconocimiento de voz en streaming en alemán: transcribe audio incrementalmente, sin esperar al final de la frase.
- Inferencia en dispositivos de borde: diseñado para hardware de gama baja con recursos limitados.
- Procesamiento de audio de 16 kHz de tasa de muestreo, con tramas de 80 muestras para el frontend.
- Generación de texto condicionada por audio (secuencia a secuencia).
- Soporte de cuantización int8 para despliegue eficiente en producción.

## Casos de uso

- Transcripción en tiempo real de reuniones: el modelo puede transcribir conversaciones en alemán a medida que se habla, con una latencia de aproximadamente 80 ms de lookahead, adecuado para herramientas de videoconferencia o asistentes de reuniones.
- Asistentes de voz en dispositivos de borde: ejecutable en Raspberry Pi o hardware similar, permite control por voz en alemán sin depender de la nube.
- Subtitulado en directo de eventos: integrado en pipelines de streaming de audio para generar subtítulos en vivo con baja latencia.
- Comandos de voz en electrodomésticos inteligentes: el modelo puede activar acciones basadas en comandos hablados en alemán, gracias a su bajo consumo y tamaño reducido.
- Transcripción de podcasts y archivos de audio: para generar transcripciones de larga duración, aunque su contexto de streaming es más adecuado para segmentos cortos.
- Prototipado de ASR en alemán: como punto de partida para sistemas de voz en investigación o desarrollo, gracias a su licencia MIT y su compatibilidad con Hugging Face Transformers.

## Benchmarks y rendimiento

Se han publicado resultados de WER (word error rate) sobre dos conjuntos de evaluación de voz leída: FLEURS alemán (`fleurs_de`) y Multilingual LibriSpeech alemán (`mls_de`). Los valores corresponden a una muestra fija de 400 utterances con semilla, evaluada en lote con tamaño de lote 1.

| Panel | WER |
|---|---:|
| `fleurs_de` | 11.98 |
| `mls_de` | 10.19 |
| **Macro** | **11.086** |

La versión cuantizada int8 del mismo checkpoint obtiene un WER de 12.004 en la misma muestra, con un coste de +0.918 WER respecto al checkpoint en float32. No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente, pero con 27 millones de parámetros en float32, el peso del modelo es de aproximadamente 108 MB (0.1 GB de repo), por lo que cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, etc.). El modelo está pensado para CPU en dispositivos de borde, por lo que no requiere GPU de alta gama.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama baja y en CPUs de dispositivos de borde como Raspberry Pi 4 o superiores.
- Opciones de despliegue: Hugging Face Transformers (código de ejemplo en la model card), paquete `.ort` cuantizado para la librería Moonshine de despliegue.
- Latencia y throughput: no se proporcionan datos explícitos de latencia, pero el modelo está diseñado para streaming con 80 ms de lookahead en las capas con ventana (16, 4).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR en streaming del mismo tamaño en la información proporcionada. La model card menciona que la familia Moonshine Streaming se compara en el repositorio de GitHub con Whisper Tiny, Base, Small y Large v3, pero no se incluyen resultados numéricos en la información disponible.

## Limitaciones y advertencias

- Datos de entrenamiento con pseudo-etiquetas: el grueso del corpus (103.000 horas de podcasts) fue transcrito automáticamente por un modelo profesor, por lo que el modelo hereda sus errores en nombres propios, numerales y cambio de código.
- Evaluación limitada a voz leída: los conjuntos de evaluación (FLEURS y MLS) son habla leída, por lo que no se mide el rendimiento en alemán conversacional o espontáneo.
- Riesgo de bucles de repetición: como otros modelos seq2seq de ASR, puede caer en bucles de repetición en clips cortos o con ruido. Se recomienda limitar `max_new_tokens` en la generación.
- Obligación de pasar `attention_mask`: sin la máscara, el codificador atiende a toda la emisión, lo que difiere del comportamiento entrenado.
- El repositorio es una conversión de un checkpoint específico (`de12k_tiny_stageC_best.safetensors`); se recomienda fijar la revisión para reproducibilidad.
- La cuantización int8 añade un coste de +0.918 WER respecto al float32.
- Licencia MIT: permite uso comercial, pero el usuario es responsable del cumplimiento de la licencia de los datos de entrenamiento (no se especifica la procedencia de los podcasts).

## Enlaces

- HuggingFace: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-de
- Modelo base en HuggingFace: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Modelo no streaming en HuggingFace: https://huggingface.co/UsefulSensors/moonshine-tiny
- Repositorio de GitHub: https://github.com/moonshine-ai/moonshine
- Implementación C++ del modelo streaming: https://github.com/moonshine-ai/moonshine/blob/main/core/moonshine-streaming-model.cpp
- Registro de benchmarks externos: https://free2aitools.com/model/moonshine-ai/moonshine-streaming-tiny
