# Masterx/moonshine-streaming-tiny-vi-ONNX

## Resumen

Moonshine Streaming tiny-vi es un modelo de reconocimiento automatico del habla (ASR) en vietnamita, desarrollado originalmente por Moonshine AI y exportado a ONNX por el usuario Masterx. Se trata de la variante "tiny" de la familia Moonshine v2, cuya innovacion principal es el denominado "Ergodic Streaming Encoder": en lugar de re-codificar la locucion completa cada vez que llega audio nuevo, el encoder procesa el audio de forma incremental mediante ventanas deslizantes de atencion.

Este repositorio concreto no contiene los pesos originales en PyTorch, sino una exportacion a ONNX (opset 17) dividida en los cinco grafos que consume el runtime oficial de streaming de Moonshine: frontend, encoder, adapter, cross_kv y decoder_kv. Esa division permite ejecutar el modelo en CPU con onnxruntime y habilita decodificacion por turnos sin esperar al final de la frase, algo critico en subtitulado o asistentes de voz en tiempo real.

Su relevancia practica esta en que acerca un ASR incremental en vietnamita a despliegues sin GPU: el repo ocupa 0,2 GB, incluye variantes int8 de cuatro de los cinco grafos y reporta un factor de tiempo real de 0,034 en CPU de escritorio con el motor Rust del autor. El modelo se distribuye bajo licencia MIT, heredada del checkpoint base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con "Ergodic Streaming Encoder" (Moonshine v2); atencion de ventana deslizante en el encoder y cache K/V propio y cruzado en el decoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 posiciones absolutas en el adapter = 82 s por segmento; ventana deslizante con `total_left_context` = 96 frames y `total_lookahead` = 16 frames (a 320 muestras por frame, 20 ms por frame a 16 kHz) |
| Tipos de cuantizacion | fp32 y int8 dinamica (`onnxruntime.quantization.quantize_dynamic`, QInt8 per-channel en pesos de MatMul/Gemm con B constante); el frontend solo se distribuye en fp32 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT (heredada de `moonshine-ai/moonshine-streaming-tiny-vi`) |
| Formato de pesos | ONNX (opset 17), con ficheros `*_int8.onnx` para encoder, adapter, cross_kv y decoder_kv; configuracion en `streaming_config.json` |

## Arquitectura y entrenamiento

El modelo sigue el esquema encoder-decoder de Moonshine v2. El encoder aplica atencion de ventana deslizante sobre frames de 320 muestras (20 ms), de modo que puede mantener estado y procesar unicamente el tramo nuevo de audio en lugar de recalcular la locucion entera. El adapter anade embeddings de posicion absolutos hasta 4096 posiciones, lo que fija en 82 segundos la duracion maxima de cada segmento. El decoder es autorregresivo y usa cache K/V propio mas una cache K/V cruzada precalculada por el grafo `cross_kv`, con tensores de forma `[6,1,8,M,40]` (6 capas, 8 cabezas, dimension de cabeza 40).

La exportacion se realizo con el recetario oficial `moonshine/scripts/export.py` mediante torch.onnx en opset 17. Un detalle tecnico relevante: las ventanas deslizantes usan semantica inclusiva, normalizando la notacion `(17,5)/(17,1)` de la configuracion de HuggingFace a `(16,4)/(16,0)`; con esa equivalencia, los grafos fp32 reproducen token a token la salida greedy de `transformers` (`MoonshineStreamingForConditionalGeneration`). El frontend mantiene estado convolucional en precision exacta y se envia solo en fp32 por representar aproximadamente el 3 % del computo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF o DPO. El tokenizer y los ficheros de configuracion se copian sin cambios del repositorio base.

## Capacidades

- Reconocimiento automatico del habla en vietnamita (`vi`), en modo incremental o sobre locucion completa.
- Codificacion en streaming: el encoder procesa bloques de audio de tamano multiple de 640 muestras (40 ms) manteniendo cinco estados portados entre llamadas.
- Decodificacion greedy con cache K/V autoregresiva, con soporte de cache de longitud cero en el primer paso.
- Segmentacion de hasta 82 segundos por segmento gracias a los 4096 embeddings de posicion del adapter.
- Ejecucion en CPU con onnxruntime, con variantes int8 para reducir coste de computo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento explicito. Es un modelo puramente ASR.
- No se documenta deteccion de idioma, diarizacion de hablantes ni marcas de tiempo por palabra.

## Casos de uso

- Subtitulado en tiempo real de discurso en vietnamita: el encoder incremental permite emitir tokens mientras llega el audio, sin re-codificar la frase completa, lo que encaja en interfaces de subtitulado con latencia baja.
- Transcripcion de reuniones y llamadas: con 82 segundos por segmento y cache K/V persistente, se pueden cubrir intervenciones largas encadenando segmentos sin perder el hilo de la decodificacion.
- Asistentes de voz en escritorio o dispositivos sin GPU: el repo de 0,2 GB y la ejecucion en CPU con onnxruntime lo hacen viable en equipos de oficina o portatiles modestos.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la variante de locucion completa funciona como un ASR convencional dentro de un job de Python con onnxruntime.
- Integracion en aplicaciones nativas Rust o C++: el motor WinSTT del propio autor consume los mismos grafos con endpointer por energia, lo que sirve como referencia para incrustar el modelo en un binario de escritorio.
- Moderacion y analitica de notas de voz en vietnamita: transcripcion de audio de atencion al cliente para clasificacion posterior, indexacion de contenido o busqueda en archivos de audio.
- Funciones de accesibilidad en aplicaciones moviles o embebidas: al ser un modelo tiny con ruta CPU, puede desplegarse en dispositivos sin acelerador dedicado para dictado y lectura de subtitulos.
- Investigacion en ASR de bajos recursos: servir de punto de partida reproducible para medir el efecto de la cuantizacion int8 frente a fp32 en un mismo grafo exportado.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son una verificacion de regresion sobre 20 utterances del split `vi_vn` de FLEURS, con decodificacion greedy en CPU. El propio autor advierte que el conjunto es pequeno (20-41 utterances) y que las cifras deben interpretarse como comprobacion de regresion, no como benchmark.

| Runtime | WER fp32 | WER int8 |
|---|---|---|
| onnxruntime (Python, locucion completa) | 13,06 % | 12,54 % |
| WinSTT Rust engine (incremental, endpointer por energia) | 12,89 % | no disponible |

Verificacion adicional declarada: la pipeline fp32 de cinco grafos es identica token a token a `transformers` en todas las utterances del conjunto de prueba. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks ASR estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta pensado para ejecucion en CPU y el repositorio completo ocupa 0,2 GB, por lo que la huella de memoria es reducida, pero no se publican cifras de memoria pico.
- GPU recomendadas: no se documenta ninguna. El autor indica que el grafo del encoder no funciona en DirectML (el EP de DML de ORT 1.24 rechaza su Reshape de cabezas de atencion), por lo que la ruta soportada es el execution provider de CPU.
- GPU de consumo: no aplica segun la informacion disponible; el despliegue documentado es en CPU.
- Opciones de despliegue: onnxruntime (Python) para locucion completa, y el motor Rust WinSTT para modo incremental. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: factor de tiempo real de 0,034 en fp32 con el motor Rust sobre CPU de escritorio bajo carga concurrente, es decir, aproximadamente 29 veces mas rapido que tiempo real en ese escenario. No hay datos equivalentes para int8 ni para GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros en la informacion proporcionada, por lo que la comparacion se limita al propio linaje del modelo.

| Modelo | Parametros | Contexto | Formato | Idiomas | Licencia |
|---|---|---|---|---|---|
| Masterx/moonshine-streaming-tiny-vi-ONNX (este) | no disponible | 82 s por segmento, ventana deslizante 96 frames | ONNX fp32 + int8 | vi | MIT |
| moonshine-ai/moonshine-streaming-tiny-vi (base) | no disponible | no disponible | safetensors u original de PyTorch (no confirmado en la informacion) | vi | MIT |
| Otros modelos ASR comparables (Whisper tiny, Moonshine tiny en otros idiomas) | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia verificable frente al checkpoint base es el formato y la particion en cinco grafos con estado incremental, ademas de la cuantizacion int8 disponible y de la verificacion de equivalencia token a token con `transformers` en fp32.

## Limitaciones y advertencias

- Cobertura de evaluacion muy limitada: 20 utterances de FLEURS `vi_vn` (el autor menciona un rango de 20 a 41). Las cifras de WER no deben extrapolarse a produccion.
- Modelo mono-idioma: solo vietnamita. No se documenta deteccion de idioma ni capacidades multilingues.
- El WER int8 reportado (12,54 %) es inferior al fp32 (13,06 %) sobre un conjunto diminuto; es probable que sea ruido estadistico y no una mejora real de precision.
- Riesgo de alucinacion y de transcripcion erronea en audio con ruido, solapamiento de hablantes o acentos no representados en el conjunto de validacion, comportamiento habitual en modelos ASR de este tamano.
- Sin datos publicados sobre robustez ante ruido, musica, silencios largos o cambios de dominio.
- Limite duro de 82 segundos por segmento impuesto por los embeddings de posicion del adapter; audios mas largos requieren segmentacion externa.
- El frontend se distribuye unicamente en fp32, por lo que la cuantizacion int8 no reduce el coste total del pipeline.
- El grafo del encoder no se ejecuta en DirectML; hay que usar el execution provider de CPU.
- La exportacion es de un tercero (Masterx), no del equipo de Moonshine AI; el repositorio no tiene descargas ni valoraciones ni validacion independiente en el momento de la consulta.
- Licencia MIT heredada del modelo base, que permite uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio base por si hubiese condiciones adicionales sobre los datos de entrenamiento no reflejadas aqui.
- No hay informacion sobre requisitos exactos de version de onnxruntime mas alla de la referencia a ORT 1.24 en la nota sobre DirectML.

## Enlaces

- Repositorio ONNX: https://huggingface.co/Masterx/moonshine-streaming-tiny-vi-ONNX
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-vi
- Recetario de exportacion citado en la model card: `moonshine/scripts/export.py` del proyecto oficial de Moonshine (no se proporciona URL directa en la informacion disponible)
- Motor de inferencia Rust WinSTT (citado como runtime de verificacion; no se proporciona URL en la informacion disponible)
- Dataset de evaluacion: FLEURS, split `vi_vn` (no se proporciona URL en la informacion disponible)
