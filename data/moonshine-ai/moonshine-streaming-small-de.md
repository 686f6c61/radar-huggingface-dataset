# moonshine-ai/moonshine-streaming-small-de

## Resumen

Moonshine Streaming Small — German es un modelo de reconocimiento automático del habla (ASR) en streaming para alemán, desarrollado por Useful Sensors y publicado bajo el nombre de Moonshine AI. Se trata de una adaptación del modelo original `moonshine-streaming-small` (entrenado para inglés) a la lengua alemana, con un tokenizador propio de 12.288 entradas. El modelo transcribe de forma incremental, sin esperar a que termine la frase, gracias a un frontend de audio de 50 Hz y un encoder Transformer con ventanas deslizantes, lo que lo hace especialmente adecuado para su ejecución en dispositivos de gama baja (edge).

Con 112,9 millones de parámetros, este modelo ofrece un equilibrio entre precisión y eficiencia, siendo aproximadamente un cuarto del tamaño del modelo Tiny (que tiene unos 28 millones). Está licenciado bajo MIT, lo que permite su uso comercial sin restricciones, y se distribuye en formato `safetensors` compatible con la librería `transformers`. Su relevancia actual radica en la demanda de ASR de baja latencia y bajo coste computacional para aplicaciones de voz en alemán, como asistentes, subtitulado en directo o transcripción en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de ventanas deslizantes y decoder autoregresivo (denominada `spindlier_prime_adapted`) |
| Parametros totales | 112.872.248 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo procesa audio en streaming con un lookahead de ~80 ms) |
| Tipos de cuantizacion | No disponible (se menciona un build int8 en el ecosistema Moonshine, pero no se publica en este repositorio) |
| Idiomas soportados | Alemán (de) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura combina un frontend de audio que opera a 50 Hz, con normalización CMVN y compresión asinh, seguido de dos convoluciones causales con stride 2. El encoder está formado por 10 capas con ancho 620 y 8 cabezas de atención, donde las dos primeras y las dos últimas capas utilizan ventanas deslizantes con lookahead (16, 4), mientras que las capas intermedias usan ventanas (16, 0) sin lookahead. Esto proporciona un lookahead total de unos 80 ms, permitiendo la transcripción en tiempo real sin esperar a la frase completa. El decoder tiene 10 capas con ancho 512 y 6 cabezas, con RoPE aplicado sobre 32 de las 64 dimensiones de cada cabeza. Un adaptador con embeddings posicionales absolutos proyecta las salidas del encoder (620) al espacio del decoder (512).

El entrenamiento se realizó sobre un corpus alemán a gran escala, compuesto por aproximadamente 103 000 horas de podcasts pseudo-etiquetados (transcritos automáticamente con un modelo profesor tipo Whisper) y unas 3 700 horas de habla de lectura humana con transcripciones reales (Common Voice, Multilingual LibriSpeech, FLEURS y VoxPopuli). No se utilizaron técnicas de RLHF ni DPO; el entrenamiento es supervisado convencional. La conversión del checkpoint de entrenamiento al formato de este repositorio se verificó midiendo el rendimiento en la misma muestra de evaluación, no solo inspeccionando los pesos.

## Capacidades

- Reconocimiento de voz alemán en streaming: transcribe audio de forma incremental a medida que se recibe, sin esperar al final de la frase.
- Generación de texto (transcripción) con tokens de 80 ms de lookahead, apta para aplicaciones en tiempo real.
- Soporte de audio de 16 kHz, con normalización interna (CMVN) y compresión no lineal.
- Entrenado con datos de habla de lectura (Common Voice, MLS, FLEURS, VoxPopuli) y habla espontánea de podcasts, aunque la evaluación se realiza sobre habla de lectura.
- No incluye soporte para tool calling, agentes ni razonamiento multi-step; es exclusivamente un modelo de ASR.
- Multilingüismo: solo alemán; no se ha entrenado para otros idiomas.

## Casos de uso

- **Subtitulado en directo para eventos y conferencias en alemán**: el modelo puede transcribir la voz del ponente con una latencia de unos 80 ms, lo que permite generar subtítulos en tiempo real en reuniones, seminarios web o emisiones en directo.
- **Asistentes de voz en alemán**: al ser un modelo compacto y de bajo consumo, puede integrarse en dispositivos de gama baja (smart speakers, móviles) para gestionar comandos de voz y preguntas, sin depender de una conexión a la nube.
- **Dictado y transcripción de entrevistas**: con una ventana de contexto incremental, es posible transcribir conversaciones largas sin pausas, útil para periodistas, investigadores o secretarios.
- **Transcripción de llamadas telefónicas**: su capacidad de streaming permite procesar la señal de audio en tiempo real, facilitando el análisis de conversaciones en centros de atención al cliente o para transcripciones legales.
- **Aplicaciones de accesibilidad**: ayuda a personas con discapacidad auditiva a leer en tiempo real lo que se dice en una conversación o en un evento, gracias a la baja latencia y la precisión en alemán.
- **Sistemas de subtitulado en vídeo en la nube**: al ser un modelo ligero (112,9 M parámetros), puede desplegarse en instancias de CPU o GPU pequeñas, permitiendo el procesamiento por lotes de vídeos en alemán con un coste reducido.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card, basados en una muestra fija de 400 utterances (seeded) con normalización de mayúsculas y puntuación. Se evalúa la WER (word error rate) sobre los conjuntos FLEURS alemán y Multilingual LibriSpeech alemán.

| Panel | WER (muestra de 400 utterances) |
|---|---|
| `fleurs_de` | 7.19 |
| `mls_de` | 7.51 |
| **Macro** | **7.350** |

Además, se comparó el rendimiento de este repositorio con el checkpoint de entrenamiento original bajo la misma condición de parada (heuristic de repetición). La conversión reproduce exactamente el mismo resultado (7.350 macro), lo que confirma la integridad de los pesos. Se menciona también que una versión cuantizada a int8 obtiene 7.530, una diferencia de +0.181 dentro del ruido de la muestra.

No se dispone de comparaciones directas con otros modelos ASR en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 112,9 M parámetros en float32, el modelo ocupa aproximadamente 450 MB de memoria. En int8 (si se usara la build cuantizada) sería ~225 MB. Esto permite ejecutarlo en GPUs con poca memoria, como la NVIDIA T4 (16 GB) o incluso en la RTX 3060 (12 GB) con espacio de sobra.
- **GPU recomendadas**: para ejecución en tiempo real, una GPU de gama media (por ejemplo, RTX 3060, T4) es suficiente. Para pruebas en CPU, el modelo también puede ejecutarse, aunque con mayor latencia.
- **Compatibilidad con GPU consumer**: sí, cabe en cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1060 o RTX 2060.
- **Opciones de despliegue**: se puede usar con la librería `transformers` (PyTorch), o exportarse a ONNX para su ejecución en entornos como ONNX Runtime. El ecosistema Moonshine ofrece también un paquete `.ort` para despliegue optimizado en edge.
- **Latencia y throughput**: no se han publicado mediciones de latencia concretas, pero el diseño de streaming con lookahead de 80 ms indica que la transcripción puede empezar en cuanto se reciben los primeros fragmentos de audio. El modelo está pensado para baja latencia en dispositivos de bajo consumo.

## Comparativa con modelos similares

No se proporcionan en la información datos comparativos con otros modelos de ASR en alemán. Sin embargo, podemos situarlo frente a alternativas conocidas:

| Modelo | Parámetros | Contexto | Licencia | Idioma | Streaming |
|---|---|---|---|---|---|
| **Moonshine Streaming Small (DE)** | 112,9 M | No especificado | MIT | Alemán | Sí |
| **Whisper small** (OpenAI) | 244 M | 30 s de audio | MIT | Multilingüe (incluye alemán) | No (procesa audio completo) |
| **Wav2Vec2-XLSR-53** (para alemán) | 300 M | 9.6 s de audio | Apache 2.0 | Alemán (fine-tune) | No (no streaming) |

Aunque no hay benchmarks comparativos directos, Whisper small tiene un contexto de 30 segundos y no es streaming, mientras que Moonshine Streaming está diseñado específicamente para baja latencia. La licencia MIT es más permisiva que la Apache 2.0 de Wav2Vec2. La comparación real con estos modelos requiere ejecutar las mismas condiciones de evaluación.

## Limitaciones y advertencias

- **Pseudo-etiquetas**: el corpus principal de entrenamiento (podcasts) está transcrito automáticamente con un modelo Whisper, por lo que el modelo hereda los errores del profesor en nombres propios, números, código mezclado (code-switching) y expresiones no estándar.
- **Riesgo de bucles de repetición**: como otros modelos seq2seq ASR, puede caer en repeticiones en clips cortos o con ruido. La documentación recomienda limitar `max_new_tokens` en la generación.
- **Importante: pasar `attention_mask`**: el encoder solo aplica las ventanas deslizantes si se le entrega la máscara de atención; sin ella, el modelo atiende a toda la utterance, lo que produce un comportamiento distinto al entrenado.
- **Evaluación limitada a habla de lectura**: los conjuntos de evaluación (FLEURS, MLS) son habla de lectura, no conversacional ni espontánea. El rendimiento en habla espontánea puede ser inferior.
- **Idioma único**: solo alemán, no soporta otros idiomas.
- **No se incluye en el repositorio**: la versión cuantizada int8 no está disponible en este repositorio; se menciona en la documentación del ecosistema Moonshine.
- **Licencia MIT**: permite uso comercial, pero se debe mantener el aviso de copyright.

## Enlaces

- Repositorio HuggingFace del modelo: [https://huggingface.co/moonshine-ai/moonshine-streaming-small-de](https://huggingface.co/moonshine-ai/moonshine-streaming-small-de)
- Modelo original en inglés: [https://huggingface.co/moonshine-ai/moonshine-streaming-small](https://huggingface.co/moonshine-ai/moonshine-streaming-small)
- Repositorio GitHub de Moonshine: [https://github.com/moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)
- Ejemplo de iOS con modelo streaming en inglés: [https://github.com/moonshine-ai/moonshine/tree/main/examples/ios/Transcriber/models/small-streaming-en](https://github.com/moonshine-ai/moonshine/tree/main/examples/ios/Transcriber/models/small-streaming-en)
