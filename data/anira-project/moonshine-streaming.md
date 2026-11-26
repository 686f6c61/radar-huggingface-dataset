# anira-project/moonshine-streaming

## Resumen

Moonshine Streaming es una familia de modelos de reconocimiento automático del habla (ASR) en tiempo real desarrollada originalmente por Moonshine AI y redistribuida por el proyecto anira. Esta ficha cubre la versión empaquetada por anira-project, que convierte los checkpoints originales de Moonshine (tiny y small, en inglés y alemán) en grafos de tamaño fijo listos para inferencia en streaming sobre ONNX Runtime, ExecuTorch (CPU y Core ML) y Core ML nativo. El objetivo es que las palabras aparezcan en pantalla mientras la persona habla, sin esperar al final del segmento.

La innovación del empaquetado es la eliminación de formas dinámicas: tanto el encoder como el decoder son dos grafos cuyos tensores nunca cambian de forma, con límites fijos derivados del runtime original de Moonshine (segmentos de hasta 15 s más 0,512 s de look-behind del detector de actividad de voz, memoria del decoder de 800 frames de encoder, caché de auto-atención de 128 posiciones y ventanas deslizantes de 16 frames de contexto por capa). Esto permite desplegar el modelo en runtimes móviles y de borde con latencias predecibles.

El modelo cubre cuatro variantes: tiny-en, small-en, tiny-de y small-de. Es relevante para desarrolladores que necesitan transcripción en vivo en dispositivos Apple o en CPU sin GPU, con requisitos de latencia estrictos y sin depender de servicios en la nube. La licencia es MIT y el repositorio ocupa 5,4 GB, incluyendo pesos en float32 para todos los formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con atención por ventana deslizante en el encoder y cross-attention en el decoder; frontend convolucional con detector de actividad de voz |
| Parametros totales | no disponible (el model card no publica el recuento exacto; se infieren de las dimensiones: tiny con D=320, 6 capas de decoder, H=8, K=40; small con D=620, 10 capas, H=8, K=64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Segmentos de hasta 15 s de audio más 0,512 s de look-behind del VAD; memoria del decoder de 800 frames de encoder (16 s a 50 Hz); caché de auto-atención de 128 posiciones (hasta 6,5 tokens por segundo de audio) |
| Tipos de cuantizacion | float32 en todos los formatos empaquetados; Moonshine upstream incluye grafos int8 en `upstream/` |
| Idiomas soportados | Inglés (en) y alemán (de) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), ExecuTorch (`.pte` CPU/XNNPACK y Core ML), Core ML (`.mlpackage`), tokenizer en `tokenizer.bin` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder orientado a streaming. El encoder integra en un solo grafo el frontend (procesamiento de audio y detector de actividad de voz), el encoder propiamente dicho, el adaptador y las proyecciones de cross-attention del decoder. Recibe 0,5 s de audio (8000 muestras) junto con el estado del frontend y del encoder, y devuelve las claves y valores de cross-attention de los 25 frames que pasan a ser definitivos en cada paso. El decoder realiza un paso greedy: recibe el token, su posición, la caché de auto-atención y la memoria del segmento, y devuelve los logits y las claves/valores del token para almacenar en la posición correspondiente.

Las variantes se diferencian en dimensión y profundidad: tiny usa D=320, contexto C=96, 6 capas de decoder, H=8, K=40 y vocabulario de 32768 (inglés) o 12288 (alemán); small usa D=620, C=160, 10 capas, H=8, K=64 y el mismo vocabulario por idioma. Los grafos están escritos específicamente para XNNPACK, que carece de layer norm y de matmul batched en 4-D: la normalización se implementa como productos matriciales, la atención como matmuls batched en 3-D sobre cortes de las cachés, el rotary embedding como producto matricial y el asinh del frontend se escribe de forma explícita porque Core ML no lo incluye. Numéricamente son equivalentes al original.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El model card indica que los checkpoints provienen de Moonshine AI y que el empaquetado se construye con transformers mediante `models/moonshine-streaming/export/moonshine.py`. La desviación máxima respecto a PyTorch es de 1,6e-5 en el encoder y 1,9e-6 en el decoder para ONNX Runtime, y de 1,0e-5 y 1,3e-6 para Core ML.

## Capacidades

- Reconocimiento automático del habla en streaming con salida incremental: las palabras aparecen mientras se habla, en pasos de 0,5 s.
- Transcripción en inglés y alemán, con vocabularios separados por idioma (32768 tokens para inglés, 12288 para alemán).
- Detección de actividad de voz integrada en el frontend, con 0,512 s de look-behind.
- Segmentación automática con límite de 15 s por segmento y volcado final de los últimos 16 frames mediante un paso de silencio.
- Inferencia en CPU sin GPU mediante ONNX Runtime y ExecuTorch con XNNPACK.
- Inferencia acelerada en Apple Silicon y dispositivos Apple mediante Core ML y ExecuTorch Core ML.
- Ejecución determinista con formas fijas: sin recompilación ni reshaping en tiempo de ejecución.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.
- No incluye capacidades de visión, audio generativo ni síntesis de voz.

## Casos de uso

- Subtitulado en vivo en aplicaciones de videollamada: el modelo procesa pasos de 0,5 s y emite tokens de forma incremental, de modo que los subtítulos aparecen con un retardo acotado por la ventana de 16 frames de lookahead del encoder. Adecuado para integrarse en clientes de escritorio o móviles Apple mediante Core ML.
- Transcripción en dispositivos sin GPU: con ONNX Runtime en CPU, el encoder tarda entre 6 y 36 ms por paso de 0,5 s y el decoder entre 1,9 y 5,0 ms por token, lo que permite ejecución en tiempo real en portátiles convencionales.
- Asistentes de voz locales con privacidad: al ejecutarse íntegramente en el dispositivo (ExecuTorch o Core ML), el audio no sale del terminal, lo que encaja en entornos sanitarios, jurídicos o industriales con requisitos de confidencialidad.
- Dictado en aplicaciones móviles iOS: los `.mlpackage` de Core ML (programa ML para macOS 13 e iOS 16) ofrecen latencias de 3,5 a 11 ms en el encoder y de 4,5 a 5,3 ms en el decoder por token, viables para dictado continuo en un iPhone o iPad.
- Transcripción de reuniones en alemán e inglés: las variantes `-de` cubren reuniones bilingües con dos modelos separados o con conmutación por detección de idioma en la capa de aplicación; el límite de 15 s por segmento obliga a encadenar segmentos con el paso de flush.
- Anotación de audio a gran escala en pipelines de datos: al ser grafos ONNX de formas fijas, se pueden batchear y desplegar en servidores CPU con ONNX Runtime sin necesidad de GPU, procesando flujos de 0,5 s de forma uniforme.
- Integración en sistemas de accesibilidad: transcripción en tiempo real de conversaciones presenciales en un dispositivo de bolsillo, con la latencia de Core ML (4 a 10 ms por paso en el encoder) suficientemente baja para lectura cómoda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, MMLU, HumanEval, GSM8K u otros) en la información disponible. El model card únicamente reporta latencias y desviaciones numéricas por formato de exportación:

| Formato | Encoder por paso de 0,5 s (tiny / small) | Decoder por token (tiny / small) | Desviación máxima encoder / decoder |
|---|---|---|---|
| ONNX Runtime (CPU) | 6 / 35-36 ms | 1,9-2,0 / 4,6-5,0 ms | 1,6e-5 / 1,9e-6 |
| ExecuTorch CPU (XNNPACK) | 11-12 / 44-49 ms | 4,1-4,3 / 9,8 ms | 1,3e-5 / 1,9e-6 |
| ExecuTorch Core ML | 4-5 / 7-10 ms | 2,4-4,0 / 4,3-5,1 ms | 1,0e-5 / 1,3e-6 |
| Core ML ML program (macOS 13, iOS 16) | 3,5-4 / 10-11 ms | 4,5-5,2 / 5,0-5,3 ms | 1,0e-5 / 1,3e-6 |

Mediciones realizadas en un Mac de la serie M. Todos los exports transcriben el audio de prueba exactamente igual que transformers sobre el segmento completo. Los grafos int8 de Moonshine upstream transcriben igual salvo una palabra en tiny-en.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues, ya que los formatos empaquetados están pensados para CPU y Core ML. El repositorio completo ocupa 5,4 GB en float32, pero cada variante individual (tiny o small) es sustancialmente menor; el model card no desglosa el tamaño por carpeta.
- GPU recomendadas: no se documentan requisitos de GPU. El diseño prioriza CPU (XNNPACK) y aceleradores Apple (Core ML, Neural Engine/GPU integrados).
- Cabe en GPU de consumo: sí, cualquier GPU con suficiente memoria para el grafo float32 de la variante elegida, aunque no es el escenario objetivo.
- Opciones de despliegue: ONNX Runtime, ExecuTorch (CPU con XNNPACK y Core ML), Core ML nativo, y el runtime propio de anira (backends v2.4.0).
- Latencia y throughput: en un Mac M-series, el encoder procesa un paso de 0,5 s en 3,5-4 ms (tiny, Core ML) y 7-11 ms (small); el decoder genera un token en 2,4-5,3 ms según variante y formato. El límite de 6,5 tokens por segundo de audio acota el throughput máximo de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Enfoque |
|---|---|---|---|---|---|---|
| Moonshine Streaming (anira) | no disponible (tiny/small) | Segmentos de 15 s, caché de 128 posiciones | en, de | MIT | ONNX, ExecuTorch, Core ML | ASR streaming en dispositivo |
| Whisper (OpenAI) | 39M a 1550M según variante | 30 s por ventana | multilingüe | MIT | safetensors, GGUF, ONNX | ASR por lotes, no streaming nativo |
| wav2vec 2.0 (Meta) | 95M a 317M | no aplica (frames) | multilingüe (fine-tuning) | MIT / CC-BY-NC según checkpoint | PyTorch, ONNX | Representaciones auto-supervisadas + CTC |
| Moonshine original (Moonshine AI) | tiny/small | formas dinámicas | en, de | MIT | PyTorch | ASR streaming con tensores de tamaño variable |

La diferencia clave frente a Whisper es el diseño para streaming: Whisper procesa ventanas de 30 s y no está optimizado para salida incremental con latencia baja. Frente al Moonshine original, esta versión fija las formas de los tensores para permitir despliegue en runtimes móviles con latencias predecibles, a costa de imponer límites duros (15 s por segmento, 128 posiciones de caché). No se dispone de datos de WER comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sólo soporta inglés y alemán; no hay cobertura multilingüe más allá de esas dos lenguas.
- Límite duro de 15 s por segmento más 0,512 s de look-behind; segmentos más largos requieren encadenamiento con flush explícito.
- La caché de auto-atención de 128 posiciones impone un máximo de 6,5 tokens por segundo de audio; audio con habla muy rápida o densa puede truncarse.
- El decoder es greedy de un solo paso por token: no hay beam search ni reranking en los grafos empaquetados.
- Los grafos están escritos para XNNPACK y Core ML, con implementaciones manuales de layer norm, rotary embedding y asinh; aunque las desviaciones son pequeñas (1e-5 a 1e-6), cualquier cambio de runtime requiere revalidación numérica.
- No se publican métricas de calidad (WER) ni evaluación de sesgos; el riesgo de alucinación en ASR se manifiesta como sustituciones o palabras inventadas en audio ruidoso, no cuantificado en el model card.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los checkpoints base de Moonshine AI y de los datasets de entrenamiento originales, no detallados aquí.
- El repositorio incluye pesos float32; no se ofrecen cuantizaciones int8 empaquetadas más allá de las de `upstream/`, lo que limita la reducción de huella en dispositivos con poca memoria.
- Para producción en iOS/macOS conviene validar la versión mínima del sistema (macOS 13, iOS 16 para Core ML ML program) y el soporte de ExecuTorch en el runtime de anira (backends v2.4.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anira-project/moonshine-streaming
- Repositorio de anira: https://github.com/anira-project/anira
- Script de exportación: https://github.com/anira-project/models/blob/main/models/moonshine-streaming/export/moonshine.py
- Checkpoint base tiny-en: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Checkpoint base small-en: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- Checkpoint base tiny-de: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-de
- Checkpoint base small-de: https://huggingface.co/moonshine-ai/moonshine-streaming-small-de
- Runtime original de Moonshine: moonshine-ai/moonshine (directorio `core/`)
- Backends de anira: anira-project/backends v2.4.0
