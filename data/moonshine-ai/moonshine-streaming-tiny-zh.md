# moonshine-ai/moonshine-streaming-tiny-zh

## Resumen

Moonshine Streaming Tiny para chino mandarín es un modelo de reconocimiento automático de voz (ASR) en streaming, desarrollado por Moonshine AI (anteriormente Useful Sensors). Con solo 27 millones de parámetros, está diseñado para ejecutarse en dispositivos de bajo coste y baja latencia, transcribiendo audio de forma incremental mientras se captura, en lugar de esperar a que termine la frase. Utiliza un frontend de audio de 50 Hz combinado con un encoder Transformer de ventana deslizante y un decoder con RoPE. Este modelo concreto está entrenado exclusivamente para mandarín y es una conversión de un checkpoint específico de entrenamiento, con un tokenizador de 12.288 entradas. Su relevancia radica en ofrecer una alternativa ligera y en tiempo real a modelos ASR más pesados como Whisper, manteniendo una licencia MIT que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con frontend de audio de 50 Hz, encoder con ventanas deslizantes, decoder con RoPE |
| Parametros totales | 27.015.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (es streaming, sin ventana fija) |
| Tipos de cuantizacion | float32 (repo); se menciona una build int8 .ort en el despliegue |
| Idiomas soportados | chino (mandarín) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un frontend de audio de 50 Hz con normalización CMVN, compresión asinh y dos convoluciones causales con stride 2. El encoder tiene 6 capas, ancho 320 y 8 cabezas, con ventanas deslizantes: (16, 4) en las dos primeras y dos últimas capas, y (16, 0) en las intermedias, lo que proporciona unos 80 ms de lookahead. El decoder también tiene 6 capas, ancho 320 y 8 cabezas, con RoPE aplicado sobre 32 de las 40 dimensiones de cada cabeza. Se incluye un adaptador con embeddings posicionales absolutos antes del decoder.

El entrenamiento se realizó con un corpus mandarín de gran escala, compuesto por aproximadamente 91.700 horas de podcasts y 13.200 horas de YouTube, todas con pseudo-etiquetas generadas por un modelo profesor tipo Whisper. No se utilizaron transcripciones verificadas por humanos para la mayor parte del entrenamiento, lo que implica que el modelo hereda los errores del profesor en nombres propios, números y cambio de código. No se mencionan técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de voz en streaming: transcribe incrementalmente mientras el audio se está capturando, sin esperar al final de la frase.
- Baja latencia: diseñado para hardware de borde, con lookahead de 80 ms en las capas con ventana.
- Soporte de entrada de audio de 16 kHz con procesador automático que rellena a tramas de 80 muestras.
- Generación de texto de transcripción en caracteres chinos, con tokenizador propio de 12.288 entradas.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso.
- Monolingüe: solo chino mandarín, sin soporte multilingüe.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede transcribir órdenes y consultas en tiempo real sin depender de la nube, gracias a su tamaño reducido y licencia MIT.
- Subtitulado en vivo para eventos o reuniones: la transcripción incremental permite generar subtítulos casi en tiempo real con latencia de ~80 ms, adecuado para aplicaciones de baja latencia.
- Transcripción de podcasts y vídeos: su entrenamiento con corpus de podcasts y YouTube lo hace adecuado para contenido hablado informal, aunque con cuidado por las pseudo-etiquetas.
- Sistemas de dictado en aplicaciones de productividad: puede integrarse en editores de texto o aplicaciones de notas para convertir voz en texto en el dispositivo.
- Control por voz en dispositivos domésticos inteligentes: al ser ligero, puede ejecutarse en hardware de bajo coste como Raspberry Pi o microcontroladores con suficiente memoria.
- Transcripción de llamadas o reuniones en tiempo real: con la capacidad de streaming, puede procesar audio continuo y generar transcripciones parciales, útil para asistentes de reuniones.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de evaluación sobre una muestra de 400 frases (seeded, batch 1) con la métrica de tasa de error de caracteres sin espacios (CER_nospace). No se comparan con otros modelos en esta ficha.

| Panel | CER |
|---|---|
| `fleurs_zh` (lectura de noticias) | 12.78 |
| `wenetspeech_net` (habla espontánea) | 19.77 |
| **Macro** | **16.276** |

Además, se comparó la conversión de pesos del checkpoint de entrenamiento con el repositorio actual:

| | `fleurs_zh` | `wenetspeech_net` | macro |
|---|---|---|---|
| Training checkpoint | 12.78 | 19.77 | 16.276 |
| Este repositorio | 12.50 | 19.71 | 16.110 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El modelo tiene 27 millones de parámetros, lo que lo hace adecuado para dispositivos con pocos recursos.
- Estimación de VRAM: en float32, el peso ocupa aproximadamente 108 MB (27 M × 4 bytes). Con cuantización int8, la huella se reduce a unos 27 MB.
- Puede ejecutarse en GPUs de gama baja (ej. NVIDIA GTX 1650, RTX 3050) e incluso en CPU de gama media, aunque la latencia será mayor.
- Para uso en borde, se recomienda hardware como Raspberry Pi 4/5, teléfonos con NPU o microcontroladores con suficiente RAM.
- Opciones de despliegue: la librería `transformers` de HuggingFace, así como la biblioteca propia de Moonshine (que sirve un paquete `.ort` int8). No se menciona compatibilidad con vLLM, Ollama ni llama.cpp.
- La latencia de streaming no está especificada numéricamente, pero el diseño con ventanas deslizantes apunta a menos de 100 ms de lookahead.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Se sabe que existe la versión no streaming `moonshine-tiny-zh`, pero no hay cifras comparativas. Tampoco hay datos de Whisper u otros ASR para chino. Por tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- Entrenamiento con pseudo-etiquetas automáticas: el modelo reproduce los errores del profesor Whisper, especialmente en nombres propios, números y cambio de código.
- Riesgo de bucles de repetición en clips cortos o con ruido, como es común en modelos seq2seq. Se recomienda limitar la longitud de salida (como en el ejemplo de uso).
- Evaluación limitada: solo se probó en dos paneles (FLEURS y WenetSpeech TEST_NET). No se ha evaluado en telefonía, habla infantil, dialectos fuertes ni condiciones de campo lejano con ruido.
- Monolingüe: solo chino mandarín, sin soporte para otros idiomas ni dialectos regionales.
- La licencia MIT permite uso comercial, pero se debe tener en cuenta que las pseudo-etiquetas pueden introducir sesgos no documentados.
- Para reproducibilidad, se debe fijar la revisión del repositorio, ya que los pesos pueden actualizarse en el futuro.

## Enlaces

- [HuggingFace - moonshine-ai/moonshine-streaming-tiny-zh](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-zh)
- [HuggingFace - moonshine-ai/moonshine-streaming-tiny (versión base)](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny)
- [HuggingFace - moonshine-ai/moonshine-tiny-zh (versión no streaming)](https://huggingface.co/moonshine-ai/moonshine-tiny-zh)
- [GitHub - moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)
- [GitHub - moonshine-ai (organización)](https://github.com/moonshine-ai)
