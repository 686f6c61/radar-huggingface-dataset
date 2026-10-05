# Masterx/moonshine-streaming-tiny-ja-ONNX

## Resumen

Moonshine Streaming tiny-ja es un modelo de reconocimiento automatico del habla (ASR) en streaming para japones, desarrollado originalmente por Moonshine AI. Esta ficha concreta corresponde a `Masterx/moonshine-streaming-tiny-ja-ONNX`, una exportacion a ONNX del checkpoint `moonshine-ai/moonshine-streaming-tiny-ja` (Moonshine v2, "Ergodic Streaming Encoder"), dividida en los cinco grafos que el runtime oficial de Moonshine en streaming necesita para codificar el audio de forma incremental segun llega, en lugar de re-codificar la locucion completa.

El modelo resuelve el problema del ASR de baja latencia en japones sobre CPU: en vez de esperar a disponer del audio completo, mantiene un estado de atencion con ventana deslizante (`total_left_context`=96 frames pasados, `total_lookahead`=16 frames estables) y un adaptador con 4096 posiciones absolutas, lo que permite segmentos de hasta 82 segundos. La arquitectura es un encoder-decoder transformer de dimension 320, con 6 capas y 8 cabezas de atencion de 40 dimensiones en el decoder (segun las formas de los tensores `k_cross`/`v_cross`), y el conjunto de grafos ocupa 0,2 GB en el repositorio.

Su relevancia es practica: ofrece una ruta de despliegue sin PyTorch, con variantes fp32 e int8 cuantizadas dinamicamente, verificada token a token contra `transformers` en decodificacion greedy, pensada para integrarse en motores de dictado y subtitulado en tiempo real. La licencia MIT, heredada del modelo base, facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con atencion de ventana deslizante ("Ergodic Streaming Encoder", Moonshine v2), exportado en 5 grafos ONNX: `frontend`, `encoder`, `adapter`, `cross_kv`, `decoder_kv` |
| Parametros totales | no disponible (la model card no lo indica; las dimensiones de los grafos apuntan a un modelo "tiny") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica como contexto de tokens; ventana de audio de 4096 posiciones = 82 s por segmento en el grafo `adapter`; ventana de atencion deslizante con 96 frames de contexto izquierdo y 16 de lookahead |
| Tipos de cuantizacion | fp32 y QInt8 dinamico per-channel en pesos de MatMul/Gemm (grafos `encoder_int8`, `adapter_int8`, `cross_kv_int8`, `decoder_kv_int8`); el `frontend` solo se distribuye en fp32 |
| Idiomas soportados | japones (ja) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | ONNX (opset 17), exportado con `torch.onnx` mediante la receta oficial `moonshine/scripts/export.py`; incluye `streaming_config.json` con dimensiones, ids BOS/EOS, formas de estado del frontend y ventanas de atencion por capa |

Dimensiones derivadas de los grafos: `d_model` = 320, 6 capas en el decoder, 8 cabezas de atencion de 40 dimensiones, audios de entrada en chunks cuyo tamano N debe ser multiplo de 640 muestras y salida de features de forma `[1, N/320, 320]`.

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX del checkpoint japones de Moonshine v2 en variante streaming. La arquitectura se descompone en cinco grafos que replican el runtime oficial: `frontend.onnx` convierte `audio_chunk[1,N]` (N multiplo de 640 muestras) mas 5 estados arrastrados en `features[1,N/320,320]`; `encoder.onnx` (o `encoder_int8.onnx`) aplica atencion de ventana deslizante y produce `encoded[1,T,320]`, ejecutandose sobre una ventana que suma 96 frames de contexto izquierdo y 16 frames de lookahead, con los frames anteriores al lookahead tratados como estables; `adapter.onnx` anade embeddings de posicion absoluta sobre 4096 posiciones; `cross_kv.onnx` precalcula las claves y valores cruzados con forma `[6,1,8,M,40]`; y `decoder_kv.onnx` consume tokens con cache K/V propio (que puede tener longitud 0) mas el K/V cruzado para producir logits.

Un detalle tecnico relevante del export es la semantica de ventanas: los checkpoints multilingues normalizan la notacion `(17,5)/(17,1)` del config de HuggingFace a la forma inclusiva `(16,4)/(16,0)` con la que se entreno el modelo y que usa el runtime oficial. Los grafos fp32 reproducen exactamente, token a token, la salida greedy de `MoonshineStreamingForConditionalGeneration` de `transformers` cuando su mascara emplea las mismas ventanas inclusivas. La cuantizacion int8 se aplico con `onnxruntime.quantization.quantize_dynamic` (QInt8 per-channel sobre MatMul/Gemm con B constante), dejando el frontend en fp32 porque representa aproximadamente el 3 por ciento del computo y su arrastre de estado convolucional debe mantenerse exacto. No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla en japones con decodificacion incremental en streaming, procesando el audio por chunks en lugar de la locucion completa.
- Codificacion de audio con ventana deslizante de atencion (96 frames de contexto izquierdo, 16 de lookahead), con estabilizacion progresiva de los frames ya decodificados.
- Cobertura de hasta 82 segundos por segmento gracias a las 4096 posiciones absolutas del grafo `adapter`.
- Cache K/V propio del decoder y cache cruzado precalculado, lo que permite reutilizar contexto acustico entre pasos de decodificacion.
- Ejecucion en CPU con ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Dos modos de precision intercambiables: fp32 y QInt8 dinamico, con metricas de error equivalentes en la verificacion publicada.
- Integracion con el motor WinSTT en Rust, que aporta endpointer por energia para segmentar el habla.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio generativo ni modos de razonamiento explicito.

## Casos de uso

- Subtitulado en tiempo real de contenido audiovisual japones: el modelo produce hipotesis parciales a medida que llega el audio, con un factor de tiempo real de 0,034 en CPU de escritorio, lo que permite mantener el retraso por debajo del segundo sin GPU.
- Dictado y transcripcion de reuniones en japones sobre hardware sin acelerador: los grafos int8 reducen el coste de memoria y computo manteniendo el mismo CER del 11,96 por ciento medido en FLEURS, adecuado para aplicaciones de escritorio.
- Asistentes de voz embebidos en dispositivos con CPU limitada: el repositorio completo ocupa 0,2 GB y el frontend mantiene estado convolucional exacto, lo que facilita empaquetar el runtime en instalaciones ligeras.
- Transcripcion de llamadas de atencion al cliente en japones: el endpointer por energia del motor WinSTT permite segmentar turnos de conversacion y emitir transcripciones parciales mientras el usuario habla.
- Indexado y busqueda de archivos de audio en japones: la decodificacion por segmentos de hasta 82 segundos permite procesar lotes de grabaciones largas dividiendolas en unidades manejables.
- Pipelines de accesibilidad para personas con discapacidad auditiva: la salida incremental se puede volcar a un canal de texto continuo sin esperar al cierre de la locucion.
- Prototipado e investigacion en ASR de bajo consumo: al ser una exportacion ONNX verificada token a token contra `transformers`, sirve como referencia para comparar implementaciones de runtime en CPU.

## Benchmarks y rendimiento

Los unicos datos publicados son una verificacion de regresion sobre el conjunto de test FLEURS ja_jp (entre 20 y 41 locuciones), con decodificacion greedy y ejecucion en CPU. El propio autor advierte que la muestra es pequena y que los numeros deben interpretarse como comprobacion de regresion, no como benchmark.

| Runtime | CER fp32 | CER int8 |
|---|---|---|
| onnxruntime (Python, locucion completa) | 11,96 % | 11,96 % |
| WinSTT Rust engine (incremental, endpointer por energia) | 12,36 % | no disponible |

Factor de tiempo real (RTF) fp32 en Rust sobre CPU de escritorio bajo carga concurrente: 0,034. La pipeline fp32 de cinco grafos es identica token a token a `transformers` en todas las locuciones del conjunto de verificacion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 0,2 GB, por lo que la inferencia cabe holgadamente en memoria de sistema convencional.
- No requiere GPU: el proveedor de ejecucion recomendado es CPU (ONNX Runtime CPU Execution Provider).
- El grafo `encoder` no funciona en DirectML: el EP DML de ORT 1.24 rechaza el `Reshape` de sus cabezas de atencion, segun indica la model card.
- VRAM estimada para GPU: no disponible; no se documenta una ruta de ejecucion en GPU validada.
- GPU recomendadas: no disponible (no se aportan datos de rendimiento en GPU).
- Cabe en cualquier equipo de consumo, incluidos portatiles sin GPU dedicada, dado el tamano del modelo y su licencia.
- Opciones de despliegue: ONNX Runtime para Python (los cinco grafos) y el motor WinSTT en Rust con endpointer por energia. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato ni a esta tarea.
- Rendimiento medido: RTF de 0,034 en fp32 sobre CPU de escritorio con carga concurrente; latencia y throughput absolutos en otras configuraciones no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Masterx/moonshine-streaming-tiny-ja-ONNX | no disponible | 82 s por segmento, streaming incremental | ja | MIT | ONNX (fp32 + int8) | Exportacion sin PyTorch, verificada token a token; CER 11,96 % en FLEURS ja_jp (n=20) |
| moonshine-ai/moonshine-streaming-tiny-ja (modelo base) | no disponible | no disponible en la informacion proporcionada | ja | MIT | safetensors / PyTorch | Modelo de origen; requiere PyTorch y la implementacion de `transformers` |
| Alternativas ASR japonesas de la misma categoria (por ejemplo variantes tiny de Whisper) | no disponible | no disponible | multilingue con japones | variable segun variante | PyTorch, ONNX, GGUF | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de cifras comparativas de parametros, contexto o rendimiento frente a modelos alternativos en la informacion proporcionada; la comparacion directa solo puede establecerse, con los datos disponibles, frente al checkpoint base del que deriva esta exportacion.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma, el japones; no se declara soporte multilingue en esta variante.
- La verificacion publicada se apoya en un conjunto muy pequeno (20-41 locuciones de FLEURS ja_jp); el propio autor la califica de comprobacion de regresion y no de benchmark, por lo que el CER del 11,96 por ciento no debe extrapolarse a dominios, acentos o condiciones acusticas distintas.
- El grafo `encoder` no se ejecuta en el EP DirectML de ONNX Runtime 1.24; intentar usarlo fallara. Hay que emplear el proveedor CPU.
- El `frontend` solo se distribuye en fp32 y no debe cuantizarse, ya que su estado convolucional arrastrado requiere precision exacta.
- La semantica de ventanas deslizantes es inclusiva y debe coincidir con la usada por el runtime oficial; una implementacion propia con ventanas exclusivas producira salidas distintas de las verificadas.
- No se documentan sesgos especificos, tasas de alucinacion ni comportamiento ante audio no japones; al tratarse de un modelo ASR, la salida puede contener texto plausible no presente en el audio en condiciones de ruido o dominio fuera de distribucion.
- El limite de 82 segundos por segmento implica que las locuciones mas largas deben trocearse, con el riesgo de cortes en fronteras de segmento.
- Licencia MIT heredada del modelo base: permite uso comercial, pero conviene conservar el archivo `LICENSE` y la atribucion correspondiente; el tokenizer y los ficheros de configuracion se copian sin cambios del repositorio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Masterx/moonshine-streaming-tiny-ja-ONNX
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-ja
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes al modelo, a la arquitectura Moonshine ni a su entrenamiento; solo devuelven contenido no relacionado. No se dispone, por tanto, de enlaces adicionales a papers, blogs, repositorios o demos a partir de esa busqueda.
