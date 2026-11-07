# Olicorne/Nemotron-3-Diarization-web-onnx

## Resumen

Nemotron-3-Diarization-web-onnx es una exportación no oficial a formato ONNX del modelo `nvidia/Nemotron-3-Diarization`, un sistema de diarización de hablantes (speaker diarization) basado en Streaming Sortformer con 100 millones de parámetros, capaz de distinguir hasta 8 hablantes con una resolución temporal de 10 ms. Lo publica el usuario Olicorne bajo licencia OpenMDW-1.1, la misma del modelo original de NVIDIA, y está pensado específicamente para ejecutarse en el navegador mediante `onnxruntime-web`, con variantes en fp32, fp16 e int8.

El modelo resuelve el problema de segmentar y atribuir turnos de palabra a distintos interlocutores en audio mono a 16 kHz, generando una probabilidad por hablante cada 10 ms y numerando a los hablantes por orden de aparición. Su interés práctico radica en que permite diarización completamente en cliente (sin enviar audio a servidores), algo relevante para privacidad y para aplicaciones web de transcripción en tiempo real como Parakeet Web, el proyecto para el que se construyó esta conversión.

La ficha describe una exportación de inferencia, no un modelo entrenado desde cero: los grafos ONNX cubren únicamente la red neuronal (embedding de features y step encoder+head), mientras que el llamante debe calcular las features log-mel y gestionar el estado de streaming (Arrival-Order Speaker Cache y FIFO). No se dispone de información sobre idiomas soportados ni de benchmarks estándar publicados en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (transformer con RoPE, encoder + head de diarización) |
| Parámetros totales | 100 M (modelo base NVIDIA) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; procesa chunks de 340 frames de encoder (27,2 s) con 40 frames de look-ahead |
| Tipos de cuantización | fp32, fp16 (float16 weights/compute, I/O float32), int8 dinámico (per-channel, solo MatMul) |
| Idiomas soportados | no disponible (modelo agnóstico al idioma: opera sobre features acústicas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (`embed.onnx`, `fp32/step.onnx`, `fp16/step.fp16.onnx`, `int8/step.int8.onnx`) + `silence_embeds.bin` y `diarization-config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Streaming Sortformer, un transformer con codificación posicional rotatoria (RoPE) que procesa embeddings de features acústicas de dimensión 512 y produce logits con forma `[1, 8T, 8]`, es decir, 8 probabilidades de hablante por cada frame de salida. El grafo `embed.onnx` (2 MB) realiza el apilado de features y la proyección desde log-mel crudo `[1, N, 128]` hasta embeds `[1, ceil(N/8), 512]`. El grafo `step.onnx` contiene el encoder y la head y se ejecuta por chunks.

El front end de features debe implementarlo el llamante: audio mono a 16 kHz, pre-énfasis 0.97, STFT con n_fft 512, ventana Hann de 400 muestras, hop 160, espectro de potencia, banco de filtros mel Slaney de 128 bins y `log(mel + 2^-24)` sin normalización (el front end de NeMo Parakeet sin su normalización por feature). El estado de streaming replica el `Nemotron3DiarizationSpeakerCache` de la implementación en transformers: en modo offline se alimentan chunks de 340 frames de encoder (27,2 s) con 40 frames de look-ahead tras un FIFO de 40 frames y una caché de hablantes de 264 frames; la entrada de cada paso es `[cache | FIFO | chunk | look-ahead]` y las posiciones RoPE se reinician a 0 en cada paso. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en la documentación proporcionada; esos detalles corresponden al modelo original de NVIDIA.

## Capacidades

- Diarización de hablantes en streaming y en modo offline, con hasta 8 hablantes simultáneos.
- Salida de una probabilidad por hablante cada 10 ms (resolución temporal fina).
- Numeración de hablantes por orden de primera aparición.
- Ejecución en navegador mediante `onnxruntime-web` (WebGPU con y sin `shader-f16`, y CPU/WASM).
- Integración con pipelines de transcripción para atribuir segmentos de texto a interlocutores (caso de uso de Parakeet Web).
- No realiza reconocimiento de voz ni generación de texto: es exclusivamente un modelo de diarización/segmentación de actividad de voz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a su dominio).
- Capacidades multilingües: no aplica directamente, al operar sobre features acústicas independientes del idioma.

## Casos de uso

- Transcripción con atribución de hablante en el navegador: combinar este modelo con un ASR en cliente (por ejemplo Parakeet Web) para etiquetar cada segmento transcrito con el hablante correspondiente, sin enviar audio a servidores y preservando la privacidad.
- Reuniones y entrevistas grabadas: procesar el audio en chunks de 27,2 s con el modo offline para obtener una línea temporal de turnos de palabra de hasta 8 participantes, útil para actas automáticas y análisis de participación.
- Subtitulado en directo con identificación de interlocutor: usar la variante int8 en CPU/WASM para baja latencia en equipos sin GPU y la fp16 en WebGPU para mayor precisión.
- Análisis de centros de llamadas: segmentar conversaciones agente-cliente para calcular tiempos de habla, solapamientos y silencios por interviniente, alimentando métricas de calidad.
- Herramientas de accesibilidad: resaltar visualmente quién habla en tiempo real en aplicaciones de vídeo-llamada o podcasts, ejecutándose íntegramente en el dispositivo del usuario.
- Investigación en diarización: servir como referencia reproducible en ONNX (con script `verify-onnx.py`) para comparar implementaciones o integrar en pipelines de evaluación sin depender de PyTorch.
- Aplicaciones de escritorio y móviles con ONNX Runtime: reutilizar los mismos grafos fuera del navegador en cualquier runtime compatible con ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (DER, MMLU, etc.) en la información disponible. La model card sí incluye una verificación de fidelidad de la conversión frente a la implementación de referencia de transformers:

| Variante | Clip | Máx. \|Δp\| | Acuerdo de decisión (p > 0,5) |
|---|---|---|---|
| fp32 | 114 s, 5 hablantes | 6e-6 | 100,000% |
| fp16 | 114 s, 5 hablantes | 5e-3 | 100,000% |
| int8 | 114 s, 5 hablantes | 0,18 | 99,969% |
| fp32 | 16 s, 2 hablantes | 2e-6 | 100,000% |
| fp16 | 16 s, 2 hablantes | 2e-3 | 99,992% |
| int8 | 16 s, 2 hablantes | 0,09 | 99,984% |

## Requisitos de hardware

- Tamaño del repositorio: 0,7 GB; el grafo más pesado es `fp32/step.onnx` (396 MB), seguido de `fp16/step.fp16.onnx` (198 MB) e `int8/step.int8.onnx` (100 MB). `embed.onnx` ocupa 2 MB.
- VRAM/RAM estimada para inferencia: aproximadamente 400 MB en fp32, 200 MB en fp16 y 100 MB en int8 solo para pesos, más el estado de streaming (caché de hablantes de 264 frames y FIFO de 40 frames) y buffers de activaciones.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU; la variante int8 está pensada como opción por defecto en CPU/WASM.
- Despliegue: `onnxruntime-web` en navegador (WebGPU con `shader-f16` para fp16; WebGPU sin `shader-f16` o CPU para fp32; WASM para int8), y cualquier otro runtime ONNX (ONNX Runtime nativo) fuera del navegador.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend (WebGPU frente a WASM) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Hablantes | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Olicorne/Nemotron-3-Diarization-web-onnx | 100 M | hasta 8 | 10 ms | ONNX (fp32/fp16/int8) | OpenMDW-1.1 | Hugging Face, 0 descargas |
| NealCaren/Nemotron-3-Diarization-ONNX | 100 M | hasta 8 | 10 ms | ONNX (fp32 + int8) | no disponible en la información | Hugging Face |
| nvidia/Nemotron-3-Diarization (original) | 100 M | hasta 8 | 10 ms | PyTorch (transformers) | OpenMDW-1.1 | Hugging Face |

Las tres variantes comparten el mismo modelo base; las diferencias están en el formato de exportación (esta incluye además fp16 y los scripts de verificación) y en el ecosistema de ejecución. No se dispone de datos de rendimiento comparativo (DER) entre ellas ni frente a otros sistemas de diarización.

## Limitaciones y advertencias

- Es una conversión no oficial: la responsabilidad de la fidelidad recae en el autor de la exportación, no en NVIDIA.
- La variante int8 presenta desviaciones de hasta 0,18 en probabilidad y un acuerdo de decisión del 99,969%, por lo que puede alterar fronteras de turno en casos límite.
- Los grafos cubren solo la red neuronal: el llamante debe implementar correctamente el front end log-mel (sin normalización) y el estado de streaming; errores aquí degradan gravemente la salida.
- Limitado a un máximo de 8 hablantes; en escenarios con más interlocutores o solapamientos densos la asignación puede fallar.
- Riesgo de confusión entre hablantes con voces similares o en audio con ruido y reverberación; no se documentan métricas DER en esta ficha.
- No se especifican idiomas soportados; al ser acústico, el rendimiento puede variar según la calidad de grabación más que por el idioma.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar tipo Apache-2.0.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación comunitaria muy limitado.
- No apto para tareas de ASR, generación de texto ni razonamiento; su uso está restringido a diarización y actividad de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/Nemotron-3-Diarization-web-onnx
- Modelo base original: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Exportación ONNX alternativa: https://huggingface.co/NealCaren/Nemotron-3-Diarization-ONNX
- Proyecto Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- Claude Code (herramienta usada en la conversión): https://claude.com/claude-code
