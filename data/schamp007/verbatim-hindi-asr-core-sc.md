# schamp007/verbatim-hindi-asr-core-sc

## Resumen

`schamp007/verbatim-hindi-asr-core-sc` es un derivado cuantizado y reexportado del modelo de reconocimiento automatico del habla `bodhan-ai/indic-transcribe-core` (Bodhan AI / AI4Bharat), que a su vez se construye sobre `nvidia/canary-1b-v2` (CC-BY-4.0). El autor, schamp007, lo publica como un paquete ONNX de pesos int8 pensado para inferencia offline en CPU con ONNX Runtime, sin dependencia de GPU. No es un modelo original ni esta afiliado a Bodhan AI, AI4Bharat, IIT Madras ni NVIDIA.

El problema que resuelve es concreto: el port comunitario previo (`adidsh/indic-transcribe-core-int8-onnx`) reejecutaba todo el prefijo de tokens en cada paso de decodificacion. Esta version introduce una cache de clave/valor (KV cache) en el decodificador, de modo que cada token nuevo cuesta una posicion en lugar de todo el prefijo, manteniendo los mismos pesos int8, el mismo encoder y transcripciones equivalentes. El resultado declarado es entre 4 y 5 veces mas rapido de extremo a extremo sin aumentar el tamano de descarga.

El modelo cubre reconocimiento de voz multilingue para 27 idiomas (mayoritariamente indicos, mas ingles), con soporte de cambios de codigo (code-mixing) y control de normalizacion de texto inversa (ITN) para elegir entre escritura nativa o mezcla con palabras en latin. Esta orientado a entornos sin GPU, como portatiles, servidores de CPU o dispositivos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer para ASR (derivado de nvidia/canary-1b-v2); 24 capas de decodificador, 8 cabezas, head_dim 128, vocabulario de 7152 tokens |
| Parametros totales | no disponible (el base `nvidia/canary-1b-v2` se denomina "1b", dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 posiciones maximo para prompt + tokens generados; audio segmentado en piezas de <= 30 s |
| Tipos de cuantizacion | int8 en los pesos ONNX; activaciones en f32 |
| Idiomas soportados | 27: en, as, bn, brx, bho, bgc, bhb, doi, gu, hi, hne, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | indic-open-model-license-v1.0 (campo `license: other`); el modelo base nvidia/canary-1b-v2 es CC-BY-4.0 |
| Formato de pesos | ONNX (int8): `encoder.onnx`, `cross_kv.onnx`, `decoder_kv.onnx`, mas `bodhan_vocab.json`, `LICENSE`, `NOTICE.md` y `SHA256SUMS` |

## Arquitectura y entrenamiento

Se trata de un modelo encoder-decoder: un encoder que consume caracteristicas mel `f32 [1,128,T]` y produce `hidden_states f32 [1,T_enc,1024]` con `T_enc ≈ T/8`, y un decodificador autoregresivo de 24 capas, 8 cabezas, head_dim 128 y vocabulario de 7152 tokens. La innovacion tecnica de este repositorio no esta en el entrenamiento (no se entrena nada nuevo) sino en la reexportacion: `cross_kv.onnx` calcula una sola vez por pieza de audio las 48 proyecciones de clave/valor cruzadas (8 cabezas x 24 capas), y `decoder_kv.onnx` mantiene la cache de auto-atencion (`past_self_key/value`, `present_self_key/value`) entre llamadas. El argumento del autor es que `cross_kv.onnx` + `decoder_kv.onnx` ocupan juntos lo mismo que el `decoder.onnx` del port sin cache, de modo que el coste en disco y memoria no aumenta.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF/DPO: todo el entrenamiento corresponde al modelo base `bodhan-ai/indic-transcribe-core` / `nvidia/canary-1b-v2`. El pipeline de preprocesado si esta detallado: audio mono a 16 kHz, clips menores de 1 s rellenados con ceros y centrados, pre-enfasis 0.97, reflect-pad 256, STFT con n_fft 512 y hop 160, ventana Hann(400) simetrica centrada en 512, espectro de potencia, mel Slaney de 128 bins (librosa, fmin 0, fmax 8000) y normalizacion logaritmica con estandarizacion por bin sobre el clip. El prompt de decodificacion es `[7, 4, 18, L, L, 5, ITN, 11, 13, 15]`, donde L es 89 para hindi y 66 para ingles, e ITN vale 9 (escritura nativa) u 8 (mezcla con palabras inglesas en latin). Las claves se almacenan ya divididas por `head_dim^0.25`, y las posiciones provienen de una tabla fija de 1024 filas; no hay entrada de posicion ni mascara externa.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline en 27 idiomas, con enfasis en lenguas indicas y en ingles.
- Transcripcion con control de ITN: salida en escritura nativa o con palabras inglesas en alfabeto latino, seleccionable mediante el prompt.
- Manejo de cambios de codigo (code-mixing) hindi-ingles y, por extension, de otros pares cubiertos por el vocabulario.
- Audio de formato largo: segmentacion automatica en piezas de <= 30 s cortando por pausas, segun el flujo `long_form.py` del proyecto original.
- Decodificacion codiciosa (greedy) con cache KV, con parada por EOS (id 3) o PAD (id 2) y tope de 512 tokens nuevos.
- Inferencia exclusiva en CPU con ONNX Runtime; no requiere GPU.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, vision ni audio generativo: es un modelo puramente ASR.

## Casos de uso

- Transcripcion offline de reuniones y entrevistas en hindi o ingles en un portatil sin GPU: el modelo corre con ONNX Runtime en CPU y el audio largo se segmenta por pausas en bloques de hasta 30 s.
- Subtitulado de contenido audiovisual indico: se puede fijar la salida en escritura nativa (ITN = 9) para subtitulos en devanagari o similares, o en modo mixto (ITN = 8) para conservar prestamos ingleses en latin.
- Indexacion y busqueda de archivos de audio de atencion al cliente en centros de contacto de India: la transcripcion a texto permite busqueda semantica posterior, con soporte para clientes que alternan hindi e ingles en la misma frase.
- Cumplimiento y auditoria de grabaciones: al ejecutarse en local y sin llamadas a API, encaja en flujos donde el audio no puede salir de la infraestructura propia.
- Sistemas embebidos o edge con CPU: el tamano de repo de 1.6 GB y la ejecucion en CPU permiten desplegarlo en un servidor modesto o en un equipo de campo.
- Generacion de corpus de texto para lenguas de bajos recursos (bodo, santali, konkani, maithili, manipuri, etc.): util para crear datasets etiquetados o para prototipar sistemas de voz en idiomas sin cobertura comercial amplia.
- Preprocesado de pipelines de voz multilingues: transcribir primero con este modelo y luego aplicar traduccion, resumen o analisis con otros modelos.
- Integracion en aplicaciones de escritorio mediante el crate Rust `ort` 2.0.0-rc.12 o mediante ONNX Runtime en Python, con la cache KV gestionada por el llamante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (WER/CER) en la informacion disponible. La model card incluye un apartado "Measured (Apple M4, 4 threads, ONNX Runtime 1.30 CPU, greedy)" que compara WER/CER contra el port sin cache, pero el extracto proporcionado esta truncado y no incluye cifras.

Los unicos datos cuantitativos disponibles son de rendimiento, no de precision:

| Medicion | Valor |
|---|---|
| Aceleracion frente al port int8 sin cache | 4-5x mas rapido de extremo a extremo (declarado por el autor) |
| Tamano de descarga ONNX | 1,57 GB |
| Tamano total del repositorio | 1,6 GB |
| Reduccion de memoria pico al desactivar el area de memoria de CPU en `cross_kv` y `decoder_kv` | ~45 MB |
| Entorno de medida | Apple M4, 4 hilos, ONNX Runtime 1.30 CPU, decodificacion greedy |

## Requisitos de hardware

- No requiere GPU: el diseno esta pensado para el execution provider de CPU de ONNX Runtime. El autor indica que CoreML resulto mas lento y alteraba la salida con el port anterior.
- Memoria RAM: el modelo ocupa 1,57 GB en disco en formato ONNX int8, por lo que se necesita al menos ese espacio en memoria durante la inferencia, mas el espacio de las caches KV que crecen una posicion por token. El autor reporta una reduccion de ~45 MB de pico al desactivar el area de memoria de CPU en las sesiones `cross_kv` y `decoder_kv`.
- Cabe en cualquier equipo de consumo moderno: la medicion de referencia se hizo en un Apple M4. Un portatil con CPU x86 reciente o un mini-PC tambien es suficiente.
- GPUs tipo A100, H100 o RTX 4090 no son necesarias; no se han documentado aceleraciones con execution providers CUDA, TensorRT o DirectML.
- Opciones de despliegue: ONNX Runtime (Python), crate Rust `ort` 2.0.0-rc.12, o cualquier runtime compatible con ONNX. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo ASR encoder-decoder en ONNX).
- Latencia y throughput absolutos: no disponibles. Solo se declara la mejora relativa de 4-5x frente al port sin cache.
- Detalle de implementacion relevante: en la primera llamada a `decoder_kv.onnx` la cache `past_self_*` debe ser un tensor de longitud cero (S = 0); con el crate Rust `ort` hay que crearla con `Tensor::<f32>::new(&Allocator::default(), [1, 8, 0, 128])` porque `Tensor::from_array` rechaza dimensiones cero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| verbatim-hindi-asr-core-sc (este) | no disponible (~1b heredado) | 1024 posiciones; piezas <= 30 s | 27 | indic-open-model-license-v1.0 | ONNX int8 con KV cache | Inferencia solo CPU, 4-5x mas rapido que el port sin cache |
| adidsh/indic-transcribe-core-int8-onnx | mismos pesos | 1024 posiciones | mismos | derivada del base | ONNX int8 sin cache | Referencia de velocidad; decodifica todo el prefijo por token |
| bodhan-ai/indic-transcribe-core | no disponible | no disponible | 27 (heredados) | indic-open-model-license-v1.0 | no disponible | Modelo upstream de Bodhan AI / AI4Bharat |
| nvidia/canary-1b-v2 | 1b (por denominacion) | no disponible | multilingue (incluye indicos) | CC-BY-4.0 | no disponible | Base original de toda la cadena |
| AI4Bharat IndicConformer (IndicConformerASR) | no disponible | no disponible | 22 lenguas oficiales de India | no disponible | no disponible | Suite ASR de AI4Bharat con enfoque comparable |
| OpenAI Whisper large-v3 | ~1,55b | 30 s por ventana | ~99 | MIT | PyTorch / GGUF / ONNX | Cobertura mas amplia, pero menor especializacion en indico |
| Sarvam Saaras V3 | no disponible | no disponible | 22 lenguas indicas | propietaria (API) | servicio gestionado | Entrenado con mas de 1 millon de horas; no es descargable |

## Limitaciones y advertencias

- No es un modelo original: es una reexportacion cuantizada de `bodhan-ai/indic-transcribe-core`. Cualquier limitacion del modelo base se hereda intacta.
- La licencia es `other` (indic-open-model-license-v1.0). No se detallan en la informacion proporcionada las condiciones exactas de uso comercial; hay que revisar el fichero `LICENSE` antes de desplegarlo en produccion. El base `nvidia/canary-1b-v2` es CC-BY-4.0 y exige atribucion.
- El repositorio lleva el aviso explicito de que no esta afiliado ni respaldado por Bodhan AI, AI4Bharat, IIT Madras ni NVIDIA, y que el nombre se eligio de forma neutra para no reclamar sus marcas.
- Limite duro de contexto: prompt mas tokens generados no pueden superar las 1024 posiciones (tabla de posiciones fija). Ademas, la generacion se corta a los 512 tokens nuevos.
- El encoder no acepta entrada de longitud ni mascara: nunca hay que rellenar (padding) la entrada del encoder.
- El audio de mas de 30 s debe segmentarse por pausas; no hay procesamiento de formato largo integrado en los grafos ONNX exportados.
- Se recomienda el execution provider de CPU; con CoreML el autor observo salidas distintas y mas lentas.
- Riesgo de alucinacion tipico de los sistemas ASR (repeticiones, texto plausible en silencios o ruido) no cuantificado en la informacion disponible.
- No hay resultados de WER/CER publicados en el extracto disponible, por lo que no se puede validar la precision frente a alternativas como Whisper o IndicConformer.
- Cobertura linguistica desigual: aunque se listan 27 idiomas, no se documentan los datos de entrenamiento por lengua ni el rendimiento relativo entre ellas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- El caso de uso es exclusivamente ASR: no admite instrucciones, tool calling, agentes, vision ni generacion de texto libre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schamp007/verbatim-hindi-asr-core-sc
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Modelo raiz: https://huggingface.co/nvidia/canary-1b-v2
- Port comunitario int8 sin cache: https://huggingface.co/adidsh/indic-transcribe-core-int8-onnx
- AI4Bharat (laboratorio del IIT Madras): https://ai4bharat.iitm.ac.in/
- AI4Bharat IndicConformerASR (alternativa comparable): https://github.com/AI4Bharat/IndicConformerASR
- Sarvam AI, speech to text (alternativa comercial): https://www.sarvam.ai/speech-to-text
- Sarvam AI, blog de Saaras V3 (alternativa comercial): https://www.sarvam.ai/blogs/asr
- Whisper Hindi ASR (proyecto comunitario de referencia): https://github.com/yashshekh/Whisper-Hindi-ASR-model
- Ficheros del repositorio con hashes: `SHA256SUMS` dentro del propio repositorio (`shasum -a 256 -c SHA256SUMS`)
