# moonshine-ai/moonshine-streaming-tiny-ar

## Resumen

Moonshine Streaming Tiny — Arabic es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors y publicado bajo el identificador `moonshine-ai/moonshine-streaming-tiny-ar`. Está diseñado para transcripción de audio en árabe en tiempo real (streaming) sobre hardware de bajo consumo, como dispositivos edge o móviles. El modelo emplea una arquitectura ligera de Transformer con una ventana deslizante en el encoder, lo que le permite procesar el audio incrementalmente sin esperar a que el usuario termine de hablar. Con solo 27 millones de parámetros y una licencia MIT, es una opción atractiva para integraciones comerciales y prototipos.

El modelo se entrena con un corpus masivo de audio árabe pseudo-etiquetado (más de 90.000 horas combinadas de pódcasts y YouTube), generado mediante un modelo maestro de tipo Whisper. Esta elección reduce costes de anotación humana, pero implica que los errores del profesor se heredan. El checkpoint publicado corresponde a una etapa concreta del entrenamiento y se ofrece en formato `safetensors` con un tokenizer árabe de 12.288 entradas. Su principal valor es la baja latencia y el reducido tamaño, lo que lo hace adecuado para inferencia en CPU o GPUs modestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de ventana deslizante (sliding window) y decoder con RoPE |
| Parámetros totales | 27.015.360 (27,0 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio, no de texto) |
| Tipos de cuantización | float32 (repo), int8 (paquete `.ort` para despliegue) |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo), ONNX Runtime (`.ort`) para el paquete de despliegue |

## Arquitectura y entrenamiento

La arquitectura de Moonshine Streaming combina un frontend de audio de 50 Hz con un encoder Transformer de ventana deslizante. El frontend aplica CMVN, compresión asinh y dos capas convolucionales causales con stride 2 para reducir la resolución temporal. El encoder está formado por 6 capas de anchura 320 y 8 cabezas de atención, con ventanas deslizantes de tamaño (16,4) en las dos primeras y las dos últimas capas, y (16,0) en las intermedias, lo que proporciona unos 80 ms de lookahead. El decoder es también de 6 capas, anchura 320 y 8 cabezas, con RoPE aplicada a 32 de las 40 dimensiones de cada cabeza. Un adaptador con embeddings posicionales absolutos aprendidos se coloca antes del decoder.

El entrenamiento se realizó sobre un corpus masivo de audio árabe automáticamente etiquetado (pseudo-labels) generado por un modelo maestro de tipo Whisper. Las fuentes son: un crawl de pódcast (~30.800 horas), un crawl de YouTube (~49.800 horas) y un corpus crawleado (~10.000 horas). No se utilizaron transcripciones humanas verificadas para la mayor parte del entrenamiento, por lo que el modelo hereda los modos de error del maestro, especialmente en nombres propios, numerales y cambios de código. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento supervisado clásico sobre pseudo-etiquetas.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe con transcripción incremental (streaming).
- Procesamiento de audio de 16 kHz con salida de texto tokenizado.
- Baja latencia: el encoder con ventana deslizante permite transcribir mientras se habla, sin esperar a que termine el enunciado.
- Soporte de contexto limitado a audio corto (típicamente clips de hasta unos segundos; la longitud máxima de tokens generados se calcula a partir de la duración del audio).
- No dispone de tool calling, agentes, visión ni otras capacidades multimodales; es exclusivamente un modelo de voz.
- Funciona bien en dispositivos de bajo consumo (edge-class), gracias a su tamaño compacto.

## Casos de uso

- Transcripción en directo de conversaciones o conferencias en árabe: el modelo puede procesar audio de forma incremental, mostrando subtítulos en tiempo real con una latencia de unos 80 ms de lookahead. Su pequeño tamaño permite ejecutarlo en portátiles o en servidores con una sola CPU.
- Asistentes de voz para dispositivos domésticos: gracias a su licencia MIT y a su baja huella de memoria, puede integrarse en altavoces inteligentes o en robots domésticos para comandos de voz en árabe.
- Comandos de voz en aplicaciones móviles: por ejemplo, para dictar mensajes o buscar en el teléfono, el modelo puede ejecutarse en el propio dispositivo sin enviar audio a la nube, reduciendo la latencia y protegiendo la privacidad.
- Servicios de atención al cliente automatizada: en entornos de call center, la transcripción en streaming de las llamadas permite el análisis de sentimiento o la extracción de intenciones en tiempo real, con la ventaja de no requerir una GPU potente.
- Traducción o subtitulación de contenido en directo: en plataformas de streaming o vídeos en árabe, se puede generar subtítulos automáticos mientras se emite el contenido.
- Sistemas de dictado para profesionales médicos o jurídicos: al funcionar en streaming, permite transcribir dictados largos sin pausas, aunque debe limitarse a clips cortos para evitar bucles de repetición.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de WER (Word Error Rate) sobre un conjunto de muestra de 400 utterances (seeded sample). No se han publicado comparaciones con otros modelos en la información disponible.

| Panel | WER (checkpoint de entrenamiento) | WER (este repositorio) |
|---|---|---|
| `cv_ar` (Common Voice árabe) | 17.91 | 17.86 |
| `fleurs_ar` (FLEURS árabe) | 12.56 | 12.56 |
| **Macro** | **15.231** | **15.207** |

Además, el paquete `.ort` cuantizado a int8 (que se sirve para el despliegue) obtiene un WER de 15.533 sobre la misma muestra, lo que supone un incremento de +0.302 puntos respecto al checkpoint flotante. La conversión de pesos se verificó comparando las transcripciones byte a byte: 399/400 y 400/400 transcripciones son idénticas.

## Requisitos de hardware

- VRAM estimada: para inferencia en float32, el modelo ocupa aproximadamente 108 MB (27 M × 4 bytes) más overhead de activaciones. En int8, alrededor de 27 MB. Esto cabe en cualquier GPU moderna y también en memoria de dispositivos de gama baja.
- GPU recomendadas: no requiere una GPU potente; una NVIDIA T4 o RTX 2080 es más que suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Es compatible con consumer GPUs (RTX 3060, 4090, etc.) y con hardware de edge como Raspberry Pi (si se usa el paquete `.ort` cuantizado).
- Opciones de despliegue: el modelo es compatible con la librería `transformers` de HuggingFace. Además, el paquete `.ort` (ONNX Runtime) está diseñado para el despliegue en la librería de Moonshine, que ofrece una implementación en C++ para dispositivos edge. No se menciona soporte para vLLM, llama.cpp u otras herramientas de inferencia de texto, ya que no es un modelo de texto.
- Latencia y throughput: no se proporcionan datos concretos de latencia en la información disponible, pero el diseño de streaming con 80 ms de lookahead sugiere que la latencia de la primera palabra es baja. El modelo puede procesar audio en tiempo real en hardware modesto.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas en la información proporcionada. Los modelos de la misma familia (Moonshine Streaming Tiny) están disponibles para otros idiomas, pero no se aportan datos comparativos de rendimiento. Se podría comparar con Whisper Tiny (39 M parámetros), pero no hay datos de WER específicos para árabe en la documentación disponible. Por tanto, la comparativa no está disponible en esta ficha.

## Limitaciones y advertencias

- **Datos de entrenamiento pseudo-etiquetados**: las transcripciones se generaron automáticamente con un modelo Whisper, por lo que el modelo reproduce los errores del maestro en nombres propios, numerales y cambios de código. No se usaron transcripciones humanas verificadas para el grueso del entrenamiento.
- **Riesgo de bucles de repetición**: como otros modelos seq2seq de ASR, puede caer en repeticiones en clips cortos o con ruido. El autor recomienda limitar el número de tokens generados en función de la duración del audio.
- **Dependencia de la attention_mask**: el modelo debe recibir la máscara de atención para que el encoder aplique las ventanas deslizantes; si no se pasa, el modelo se comporta de forma diferente a la entrenada.
- **Idioma y dialectos**: aunque el modelo es para árabe, la evaluación se basa en Common Voice (dominado por clips cortos) y FLEURS (árabe egipcio). No se mide por separado el árabe estándar moderno ni otros dialectos regionales, por lo que el rendimiento en dialectos no representados puede ser inferior.
- **Cuantización**: la versión int8 (`.ort`) añade una degradación de +0.302 WER respecto al modelo flotante, lo que debe considerarse si se prioriza la precisión.
- **Licencia**: el modelo se distribuye bajo MIT, lo que permite uso comercial sin restricciones, pero no se proporciona garantía de exactitud ni soporte oficial.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-ar](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-ar)
- Modelo base (inglés): [https://huggingface.co/moonshine-ai/moonshine-streaming-tiny](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny)
- Repositorio GitHub de Moonshine: [https://github.com/moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)
- Modelo Moonshine Tiny (de Useful Sensors): [https://huggingface.co/UsefulSensors/moonshine-tiny](https://huggingface.co/UsefulSensors/moonshine-tiny)
