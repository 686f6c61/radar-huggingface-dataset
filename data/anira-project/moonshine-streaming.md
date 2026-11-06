# anira-project/moonshine-streaming

## Resumen

Moonshine Streaming for anira es un paquete de exportación de los modelos de reconocimiento automático del habla (ASR) en streaming de Moonshine AI, adaptados para inferencia en tiempo real mediante la librería anira. El repositorio, publicado por anira-project, no entrena modelos nuevos: reempaqueta los checkpoints oficiales de Moonshine Streaming (variantes tiny y small, en inglés y alemán) en grafos con tensores de tamaño fijo, listos para ejecutarse en ONNX Runtime, ExecuTorch (CPU con XNNPACK y Core ML) y Core ML nativo. El objetivo es que las palabras aparezcan en pantalla mientras alguien habla, con latencias del orden de milisegundos por paso de 0,5 s de audio.

La innovación principal frente al runtime original de Moonshine es la eliminación de las formas dinámicas: el encoder y el decoder se convierten en dos grafos cuyos tensores nunca cambian de forma, con límites explícitos (segmentos de hasta 15 s más 0,512 s de look-behind del detector de actividad de voz, memoria del decoder para 800 frames de encoder, caché de auto-atención para 128 posiciones y ventanas deslizantes de 16 frames de contexto más 16 de lookahead por capa). Esto permite compilar los grafos para aceleradores móviles y de escritorio sin recompilaciones en tiempo de ejecución.

El paquete cubre cuatro variantes: tiny-en, small-en, tiny-de y small-de, con vocabularios de 32.768 tokens para inglés y 12.288 para alemán. La licencia es MIT y el repo ocupa 5,4 GB, incluyendo pesos en float32 para los cuatro formatos de despliegue. Es relevante para desarrolladores que necesitan ASR de baja latencia en dispositivos Apple o entornos con ONNX Runtime, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR en streaming (Moonshine), exportado con tensores de forma fija |
| Parametros totales | No disponible (dimensión D: 320 en tiny, 620 en small; L: 6 capas decoder en tiny, 10 en small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Segmentos de hasta 15 s + 0,512 s de look-behind del VAD; memoria del decoder de 800 frames de encoder (16 s a 50 Hz); caché de auto-atención de 128 posiciones |
| Tipos de cuantizacion | No disponible en este repo (todos los pesos en float32); el upstream de Moonshine ofrece grafos int8 |
| Idiomas soportados | Inglés (en) y alemán (de) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx), ExecuTorch .pte (CPU/XNNPACK y Core ML), Core ML .mlpackage, tokenizer.bin |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Moonshine Streaming de Moonshine AI: un encoder que procesa audio en ventanas deslizantes y un decoder autorregresivo con atención cruzada sobre la memoria del encoder. El encoder integra en un solo grafo el frontend, el encoder propiamente dicho, el adaptador y las proyecciones de atención cruzada del decoder; recibe 0,5 s de audio (8.000 muestras) junto con buffers de convolución y features, y emite las claves y valores de atención cruzada de los 25 frames que se vuelven definitivos en cada paso. El decoder realiza un paso greedy: recibe el token, su posición, las cachés de auto-atención y la memoria del segmento, y devuelve los logits y las claves/valores del token.

Los grafos se construyen a partir de los checkpoints oficiales mediante scripts en `transformers` (`export/moonshine.py`) y se ajustan a los límites del runtime de Moonshine (`moonshine-ai/moonshine`, carpeta `core/`). Se reescriben operaciones para XNNPACK, que carece de layer norm y de matmul batched en 4-D: las medias de LayerNorm se calculan como productos matriciales, la atención se ejecuta como matmuls batched en 3-D sobre cortes de las cachés, el rotary embedding se convierte en producto matricial y el asinh del frontend se escribe de forma explícita. No se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO; esos detalles pertenecen a las model cards de los checkpoints base de Moonshine AI.

## Capacidades

- Reconocimiento automático del habla en streaming con latencia de paso de 0,5 s, pensado para transcripción en vivo.
- Detección de actividad de voz integrada (look-behind de 0,512 s) para delimitar segmentos.
- Dos tamaños (tiny y small) con equilibrio distinto entre latencia y precisión.
- Soporte multilingüe limitado a inglés y alemán, con vocabularios separados (32.768 tokens en inglés, 12.288 en alemán).
- Ejecución en CPU y aceleradores: ONNX Runtime, ExecuTorch con XNNPACK, ExecuTorch con Core ML y Core ML ML Program (macOS 13, iOS 16).
- Salida de tokens compatible con el tokenizer oficial de Moonshine (`tokenizer.bin`).
- No incluye tool calling, function calling, capacidades de agente, visión, audio generativo ni modo de razonamiento extendido; es un modelo ASR puro.

## Casos de uso

- Transcripción en vivo en aplicaciones de escritorio macOS: los grafos Core ML ML Program ofrecen 3,5-4 ms por paso de encoder y 4,5-5,2 ms por token en un Mac con chip M-series, lo que permite subtítulos casi instantáneos en reuniones o clases.
- Subtitulado en apps iOS: el formato ExecuTorch Core ML (4-5 ms encoder, 2,4-4,0 ms decoder en tiny) encaja en el presupuesto de latencia de una app móvil que muestra palabras mientras se habla.
- Asistentes de voz embebidos: la variante tiny-en con ONNX Runtime (6 ms encoder, 1,9-2,0 ms decoder) permite integrar dictado por voz en herramientas de línea de comandos o plugins sin GPU.
- Atención al cliente con transcripción de llamadas en alemán: la variante small-de, con vocabulario de 12.288 tokens y 10 capas de decoder, transcribe conversaciones telefónicas en segmentos de hasta 15 s con el VAD delimitando turnos.
- Accesibilidad para personas con discapacidad auditiva: el flujo de streaming con pasos de 0,5 s y flush final de 16 frames al cerrar segmento permite generar subtítulos sincronizados en tiempo real sobre vídeo o videollamadas.
- Investigación en ASR de bajo consumo: los cuatro formatos de exportación con desviación máxima de 1,6e-5 (encoder) y 1,9e-6 (decoder) respecto a PyTorch permiten comparar backends (ONNX Runtime, XNNPACK, Core ML) con la misma semántica numérica.
- Pipelines de transcripción por lotes con requisitos de privacidad: al ejecutarse íntegramente en local sobre CPU o Neural Engine, evita enviar audio a servicios externos, útil en entornos sanitarios o legales.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks de precisión (WER, MMLU, etc.) para estas variantes. Sí se publican métricas de latencia y desviación numérica por formato de exportación en un Mac con chip M-series:

| Formato | Encoder por paso de 0,5 s (tiny / small) | Decoder por token (tiny / small) | Desviación máxima vs PyTorch (encoder, decoder) |
|---|---|---|---|
| ONNX Runtime (CPU) | 6 / 35-36 ms | 1,9-2,0 / 4,6-5,0 ms | 1,6e-5, 1,9e-6 |
| ExecuTorch CPU (XNNPACK) | 11-12 / 44-49 ms | 4,1-4,3 / 9,8 ms | 1,3e-5, 1,9e-6 |
| ExecuTorch Core ML | 4-5 / 7-10 ms | 2,4-4,0 / 4,3-5,1 ms | 1,0e-5, 1,3e-6 |
| Core ML ML Program | 3,5-4 / 10-11 ms | 4,5-5,2 / 5,0-5,3 ms | 1,0e-5, 1,3e-6 |

Todos los exports transcriben el audio de prueba exactamente igual que transformers sobre el segmento completo; los grafos int8 propios de Moonshine (carpeta `upstream/`) difieren en una palabra en tiny-en.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 5,4 GB e incluye pesos float32 para cuatro variantes y cuatro formatos, por lo que el modelo tiny individual es sustancialmente menor que small. No se publican cifras de memoria por variante.
- GPU recomendadas: no se especifican; las mediciones publicadas son en CPU y Neural Engine de Apple (chips M-series), no en GPU NVIDIA.
- Cabe en hardware consumer: sí, en equipos Apple con chips M-series (mediciones disponibles) y presumiblemente en CPU x86 con ONNX Runtime, aunque no se aportan cifras para esta última plataforma.
- Opciones de despliegue: ONNX Runtime, ExecuTorch con XNNPACK (incluido el runtime que anira distribuye en anira-project/backends v2.4.0), ExecuTorch con Core ML y Core ML ML Program nativo (macOS 13, iOS 16).
- Latencia y throughput: ver tabla de benchmarks; el paso de encoder es de 0,5 s de audio y el decoder emite como máximo 6,5 tokens por segundo de audio (128 posiciones de caché).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Moonshine Streaming for anira (este repo) | D=320 (tiny) / 620 (small) | Segmentos de 15 s, pasos de 0,5 s, caché de 128 tokens | en, de | MIT | ONNX, ExecuTorch, Core ML |
| Moonshine Streaming upstream (moonshine-ai) | Mismos checkpoints | Tensores de forma dinámica | en, de | No disponible en la información | Runtime propio, grafos int8 |
| Whisper (referencia ASR de OpenAI) | No disponible en la información | Ventana fija de 30 s, no streaming nativo | Multilingüe amplio | No disponible en la información | No disponible en la información |

No se dispone de datos de benchmarks comparativos de precisión (WER) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre inglés y alemán; no hay soporte para castellano ni otros idiomas.
- El contexto de audio está acotado: segmentos de 15 s más 0,512 s de look-behind, memoria de 800 frames y caché de 128 posiciones; audios más largos deben trocearse.
- El decoder emite como máximo 6,5 tokens por segundo de audio, lo que limita la velocidad del habla transcribible por paso.
- No hay datos publicados de WER ni de sesgos; el riesgo de alucinación en ASR (texto inventado en silencios o ruido) no está cuantificado en esta información.
- Los pesos son float32; no se incluyen cuantizaciones en este repo más allá de la referencia a los grafos int8 upstream.
- Aunque la licencia es MIT, conviene verificar las condiciones de los checkpoints base de Moonshine AI antes de uso comercial.
- Las mediciones de latencia son específicas de chips M-series; el rendimiento en otras plataformas no está documentado.
- El repo tiene 72 descargas y 0 likes en el momento de la consulta, lo que indica adopción temprana y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anira-project/moonshine-streaming
- Modelo base tiny-en: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Modelo base small-en: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- Modelo base tiny-de: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-de
- Modelo base small-de: https://huggingface.co/moonshine-ai/moonshine-streaming-small-de
- Runtime de Moonshine: moonshine-ai/moonshine (carpeta `core/`)
- Proyecto anira: https://github.com/anira-project/anira
- Backends de anira: anira-project/backends v2.4.0
