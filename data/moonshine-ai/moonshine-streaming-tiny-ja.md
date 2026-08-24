# moonshine-ai/moonshine-streaming-tiny-ja

## Resumen

Moonshine Streaming Tiny — Japanese es un modelo de reconocimiento automático de voz (ASR) en streaming desarrollado por Moonshine AI (anteriormente Useful Sensors), diseñado específicamente para el idioma japonés. Con 27,0 millones de parámetros, este modelo transcribe audio de forma incremental, sin esperar a que termine la locución, gracias a una arquitectura que combina un frontend de audio de 50 Hz con un encoder Transformer de ventanas deslizantes. Está pensado para ejecutarse en dispositivos de gama baja (edge), donde la latencia y el consumo de memoria son críticos.

El modelo se entrenó sobre un corpus japonés masivo de aproximadamente 159 000 horas, compuesto por podcasts y vídeos de YouTube, con transcripciones generadas automáticamente por un modelo profesor de la familia Whisper. En la etapa final se añadió una mezcla de habla leída, incluyendo Common Voice japonés. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para productos de transcripción en tiempo real.

La relevancia actual de este modelo radica en su capacidad para ofrecer ASR de baja latencia en hardware modesto, un nicho cada vez más demandado en asistentes de voz, subtitulación en directo y aplicaciones de accesibilidad. Al ser un snapshot de un entrenamiento aún en curso, conviene fijar una revisión específica del repositorio si se necesita reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming: frontend de audio de 50 Hz + encoder Transformer con ventanas deslizantes + decoder Transformer con RoPE |
| Parametros totales | 27 015 360 (27,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada; streaming con ventana deslizante y lookahead de ~80 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Moonshine Streaming combina un frontend de audio que opera a 50 Hz, con normalización CMVN, compresión asinh y dos convoluciones causales con stride 2, seguido de un encoder Transformer de 6 capas con ancho 320 y 8 cabezas. Las dos primeras y las dos últimas capas del encoder usan ventanas deslizantes de (16, 4), mientras que las intermedias usan (16, 0), lo que proporciona unos 80 ms de lookahead. El decoder también tiene 6 capas, ancho 320 y 8 cabezas, con RoPE aplicado sobre 32 de las 40 dimensiones de cada cabeza. Un adaptador con embeddings posicionales absolutos aprendidos se inserta antes del decoder.

El entrenamiento se realizó sobre un corpus japonés etiquetado automáticamente: aproximadamente 109 000 horas de podcasts y 50 000 horas de YouTube, cuyas transcripciones fueron generadas por un modelo profesor Whisper (pseudo-etiquetas). En la etapa final (Stage C) se añadió una mezcla de habla leída, incluyendo Common Voice japonés. No se utilizaron transcripciones verificadas por humanos para la mayor parte del entrenamiento, por lo que el modelo hereda los errores del profesor, especialmente en nombres propios, numerales y cambio de código. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado convencional.

## Capacidades

- Transcripción de voz en japonés en tiempo real (streaming), procesando audio incrementalmente a medida que se recibe.
- Reconocimiento de habla leída y espontánea, con una ventana de contexto deslizante que permite manejar locuciones largas sin necesidad de segmentación previa.
- Generación de texto a partir de audio a 16 kHz, con soporte para el tokenizer japonés de 12 288 entradas.
- Adecuado para inferencia en dispositivos de gama baja (edge) gracias a su reducido número de parámetros y su frontend de baja frecuencia.
- No incluye capacidades de tool calling, agentes, visión ni otras modalidades; es exclusivamente un modelo de ASR.

## Casos de uso

- Subtitulación en directo: el modelo transcribe incrementalmente, lo que permite generar subtítulos en tiempo real para eventos, vídeos o retransmisiones, con una latencia de unos 80 ms de lookahead.
- Asistentes de voz en dispositivos locales: al ser ligero y con licencia MIT, puede integrarse en altavoces inteligentes o dispositivos IoT para convertir comandos de voz en texto sin depender de la nube.
- Dictado en aplicaciones móviles: su tamaño reducido (27 M de parámetros) permite ejecutarlo en smartphones de gama media para dictado de notas, mensajes o correos en japonés.
- Transcripción de reuniones y entrevistas: su capacidad de streaming facilita la generación de actas en tiempo real, aunque se recomienda capar la longitud de salida para evitar bucles de repetición en fragmentos cortos.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real puede alimentar sistemas de subtitulado en entornos educativos o laborales, con la ventaja de funcionar sin conexión.
- Análisis de llamadas y atención al cliente: al poder ejecutarse en servidores modestos, permite transcribir conversaciones telefónicas en japonés para su posterior análisis, con la posibilidad de desplegarse en infraestructura propia.

## Benchmarks y rendimiento

La evaluación se realiza con la métrica de tasa de error de caracteres sin espacios (`cer_nospace`), nunca WER, debido a la ausencia de espacios en la escritura japonesa. Los paneles de evaluación son FLEURS japonés (650 utterances) y ReazonSpeech japonés (5 263 utterances).

| Panel | CER (batch 8) | CER (muestra 400, batch 1) |
|---|---:|---:|
| `fleurs_ja` | 11,50 | 11,62 |
| `reazonspeech_ja` | 26,73 | 27,77 |
| **Macro** | **19,115** | **19,70** |

La comparación entre el checkpoint de entrenamiento y este repositorio convertido muestra una diferencia mínima:

| | `fleurs_ja` | `reazonspeech_ja` | Macro |
|---|---:|---:|---:|
| Checkpoint de entrenamiento | 11,62 | 27,77 | 19,699 |
| Este repositorio | 11,35 | 28,08 | 19,712 |

No se han publicado comparaciones con otros modelos ASR en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM. Con 27 M de parámetros, el modelo ocupa aproximadamente 108 MB en FP32 (estimación basada en el tamaño de los pesos), por lo que cabe en GPUs de consumo y en CPU.
- Diseñado para ejecutarse en dispositivos de gama baja (edge), como Raspberry Pi o teléfonos móviles, aunque no se especifican modelos concretos.
- Se puede desplegar con la librería `transformers` de Hugging Face, tal como muestra el ejemplo de uso de la model card.
- El ecosistema Moonshine incluye implementaciones de referencia en C++ y ONNX (según el repositorio de GitHub y DeepWiki), que permiten inferencia optimizada en entornos sin Python.
- No se proporcionan datos de latencia ni throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa con otros modelos ASR japoneses (por ejemplo, Whisper, ReazonSpeech o Kotoba). Los datos de evaluación solo cubren este modelo y su checkpoint de entrenamiento. Se recomienda consultar benchmarks externos para comparar con alternativas.

## Limitaciones y advertencias

- Los datos de entrenamiento son pseudo-etiquetas generadas por un modelo Whisper, por lo que el modelo reproduce los errores del profesor en nombres propios, numerales y convenciones de transcripción.
- Puede caer en bucles de repetición en clips cortos o ruidosos; se recomienda limitar la longitud de salida (`max_new_tokens`) en producción.
- Las utterances muy cortas (menos de ~15 caracteres de referencia) presentan una tasa de error muy superior (CER > 60 % en habla espontánea), lo que puede afectar a comandos de voz breves.
- La evaluación solo cubre habla leída (FLEURS) y espontánea (ReazonSpeech); no se ha probado en telefonía, habla infantil, dialectos fuertes ni condiciones de campo lejano con ruido.
- Este repositorio es un snapshot de un entrenamiento en curso (Stage C); un checkpoint posterior podría ofrecer mejores resultados. Para reproducibilidad, se debe fijar la revisión del repositorio.
- Es necesario pasar el `attention_mask` al encoder; sin él, el modelo atiende a toda la utterance, comportándose de forma diferente a lo entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-ja
- Modelo base en inglés: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Modelo no streaming en japonés: https://huggingface.co/moonshine-ai/moonshine-tiny-ja
- Repositorio de GitHub: https://github.com/moonshine-ai/moonshine
- Documentación sobre modelos streaming (DeepWiki): https://deepwiki.com/moonshine-ai/moonshine/8.1-streaming-models
