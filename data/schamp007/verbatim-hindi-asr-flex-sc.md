# schamp007/verbatim-hindi-asr-flex-sc

## Resumen

verbatim-hindi-asr-flex-sc es un derivado cuantizado y reexportado de bodhan-ai/indic-transcribe-flex (Bodhan AI / AI4Bharat, IIT Madras), que a su vez se construye sobre nvidia/canary-1b-v2. No es un modelo original: es un export a ONNX en int8 pensado para inferencia offline en CPU con ONNX Runtime, con un decoder autorregresivo que incorpora caché de claves/valores (KV cache). El autor publica el repositorio con un nombre deliberadamente neutro y sin afiliación con Bodhan AI, AI4Bharat, IIT Madras ni NVIDIA.

El problema que resuelve es concreto: el port comunitario int8 previo (adidsh/indic-transcribe-flex-int8-onnx) volvía a procesar todo el prefijo de tokens en cada paso de decodificación. Esta versión añade caché KV propia, de modo que cada token nuevo cuesta una posición en lugar de todo el prefijo, manteniendo el mismo tamaño en disco (1,57 GB de ONNX) y el mismo consumo de memoria. Según las mediciones del autor en un Apple M4 con 4 hilos y ONNX Runtime 1.30 (CPU), el resultado es entre 4 y 5 veces más rápido de extremo a extremo, con transcripciones equivalentes dentro del ruido.

El modelo cubre 27 idiomas, con foco en hindi e inglés y cobertura de lenguas indicas (asamés, bengalí, tamil, telugu, malayalam, maratí, urdu, etc.). La arquitectura es un transformer encoder-decoder de aproximadamente 1.000 millones de parámetros según la nomenclatura del modelo base, con decoder de 24 capas, 8 cabezas, head_dim 128 y vocabulario de 7.152 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (linaje Canary), reexportado a tres grafos ONNX; decoder autorregresivo con cache KV propia |
| Parametros totales | Aproximadamente 1.000 millones (deducido de la denominacion del modelo base nvidia/canary-1b-v2); desglose exacto no disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Tabla de posiciones fija de 1024 filas: prompt (10 tokens) + tokens generados debe ser ≤ 1024; maximo de 512 tokens nuevos por pieza. Audio por segmentos de ≤ 30 s |
| Tipos de cuantizacion | Pesos int8 en los tres grafos ONNX; activaciones, caches self-attention y cross-attention en f32 |
| Idiomas soportados | 27: en, hi, as, bn, brx, bho, hne, bgc, bhb, doi, gu, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Indic Open Model License v1.0 (campo `license: other`; licencia incluida como `LICENSE` en el repo) |
| Formato de pesos | ONNX: `encoder.onnx`, `cross_kv.onnx`, `decoder_kv.onnx`; vocabulario en `bodhan_vocab.json` |
| Tamano del repositorio | 1,6 GB (1,57 GB de ONNX) |
| Libreria | onnx |
| Pipeline | automatic-speech-recognition |
| Modelo base | bodhan-ai/indic-transcribe-flex (relacion: quantized) |
| Fecha de creacion | 2026-09-25 |

Desglose de ficheros publicado por el autor:

| Fichero | Bytes | SHA-256 |
|---|---:|---|
| `encoder.onnx` | 1.121.847.999 | `3cdc9d8f1308a9d37023989fe712b8bdf87b7ada29135c71ca2d5c4bce360a65` |
| `cross_kv.onnx` | 50.926.641 | `42a23b58281d68a9408ed1cbefc5af4cf0a8c878e7840b8845670cfb89982c39` |
| `decoder_kv.onnx` | 396.918.392 | `4d08d0b94f96fb6ed8487e31721c9e320315dceb37ea0329cd60a6c4539b1d9f` |
| `bodhan_vocab.json` | 86.885 | `571fa2fac0efa0cb7c4196cb17e899560cf0c91510f7f2d739243d3766d5fb44` |
| `LICENSE` | 25.546 | `b39f2a9cb2d5ace3a03f4425cbc6db38ebd9a53ab7a7648d67dc1e0998ad75c2` |
| `NOTICE.md` | 2.895 | `b34e40da3159170b1f327121fc3bfc0f1dfa3bd35592629b7a62ebb6764a682a` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de tipo Canary. El encoder consume `feats` en f32 con forma `[1, 128, T]` y produce `hidden_states` en f32 con forma `[1, T_enc, 1024]`, donde T_enc ≈ T/8. El encoder no acepta entrada de longitud ni máscara, por lo que el audio no debe rellenarse con padding. El decoder tiene L = 24 capas, 8 cabezas, head_dim 128 y vocabulario de 7.152 tokens, con batch fijo igual a 1. Las claves se almacenan ya divididas por head_dim^0.25, como hace el modelo original, y la máscara causal se construye dentro del grafo. Las posiciones proceden de una tabla fija de 1024 filas.

La exportación se reparte en tres grafos. `cross_kv.onnx` recibe `encoder_hidden_states` `[1, T_enc, 1024]` y devuelve 48 salidas (`cross_key.{l}`, `cross_value.{l}` con forma `[1, 8, T_enc, 128]`, l = 0..23); se ejecuta una sola vez por pieza de audio y se comparte entre todos los prompts decodificados sobre esa pieza. `decoder_kv.onnx` se invoca primero con el prompt de 10 tokens y cache `past_self_*` vacío (S = 0) y después una vez por token generado, con `input_ids` `[1, 1]`, el `present_self_*` previo como `past_self_*` y el mismo `cross_*`; devuelve `logits` `[1, 7152]` de la última posición y los `present_self_key/value` `[1, 8, S+N, 128]`. Las posiciones de los N tokens nuevos son S..S+N−1, derivadas de la longitud de la cache dentro del grafo; no hay entrada de posición.

Respecto a los datos de entrenamiento, esta ficha no aporta información: el repositorio es una reexportación cuantizada y no documenta número de tokens, composición del dataset ni fases de RLHF/DPO. Esa información corresponde al modelo original (bodhan-ai/indic-transcribe-flex y, en última instancia, nvidia/canary-1b-v2) y no está disponible en la documentación proporcionada. La innovación técnica destacable es exclusivamente de inferencia: la introducción de caché KV en el decoder, que reduce el coste por token de "todo el prefijo" a "una posición" sin aumentar el tamaño en disco respecto al port sin caché.

## Capacidades

- Reconocimiento automático del habla (ASR) con decodificación greedy autorregresiva, sobre audio de 16 kHz mono.
- Transcripción en 27 idiomas, con especial cobertura del hindi y el inglés, y de lenguas indicas como asamés, bengalí, brx, doi, gujarati, kannada, cachemir, konkani, maithili, malayalam, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, sánscrito sat, sindhi, tamil, telugu, urdu, bho, hne, bgc y bhb.
- Control de idioma mediante prompt de 10 tokens: `[7, 4, 18, L, L, 5, ITN, 11, 13, 15]`, donde L = 89 para hindi y 66 para inglés (en otros casos, el índice de `<|xx|>` en `bodhan_vocab.json`).
- Normalización de texto (ITN, inverse text normalization) seleccionable: ITN = 9 para script nativo e ITN = 8 para modo mixto, que mantiene las palabras inglesas en alfabeto latino.
- Procesamiento de audio largo mediante segmentación: el audio de más de 30 s se corta en pausas en piezas de ≤ 30 s, replicando el comportamiento de `long_form.py` del proyecto upstream.
- Preprocesado de audio integrado en el flujo de decodificación: pre-énfasis 0.97, reflect-pad 256, STFT con n_fft 512 y hop 160, ventana Hann(400) simétrica centrada en 512, espectro de potencia, mel Slaney de 128 bins (fmin 0, fmax 8000), logaritmo ln(x + 2^−24) y normalización por bin (x − media)/(desviación típica insesgada + 1e-5), sin dither. Los clips de menos de 1 s se rellenan con ceros hasta 1 s, centrados.
- Decodificación acotada: parada al alcanzar el token 3 (EOS) o 2 (PAD); límite de 512 tokens nuevos y de prompt + salida ≤ 1024.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio de salida: es un modelo puramente ASR.

## Casos de uso

- Transcripción offline en CPU sin GPU: el modelo está exportado a ONNX int8 con EP de CPU y ocupa 1,57 GB en disco, por lo que puede ejecutarse en portátiles, mini-PC o servidores sin acelerador para transcribir audio en hindi, inglés u otras 25 lenguas indicas sin enviar datos a la nube.
- Digitalización de archivos sonoros multilingües: emisoras, archivos públicos y bibliotecas con material en varias lenguas indicas pueden procesar lotes con el mismo grafo, segmentando cada grabación en piezas de ≤ 30 s cortadas en pausas.
- Subtitulado y transcripción de reuniones: con segmentación por pausas, el modelo cubre conversaciones que alternan hindi e inglés, y el modo ITN mixto (ITN = 8) conserva los términos ingleses en alfabeto latino, lo que reduce la corrección manual posterior.
- Atención al cliente y analítica de contact center en India: transcripción de llamadas grabadas para generar informes de calidad y búsqueda de palabras clave, ejecutando la inferencia en la propia infraestructura por motivos de cumplimiento de datos.
- Preprocesado de voz para pipelines RAG: convertir notas de voz y grabaciones internas en texto indexable antes de pasarlas a un motor de búsqueda semántica, aprovechando que la decodificación es determinista (greedy) y reproducible.
- Aplicaciones de accesibilidad: subtitulado en tiempo casi real de contenido en hindi u otras lenguas indicas en dispositivos sin GPU, gracias a la caché KV que evita reprocesar el prefijo en cada token.
- Investigación en ASR de bajos recursos: el modelo sirve como referencia cuantizada para comparar estrategias de decodificación (caché KV frente a recálculo del prefijo) en el mismo encoder y con los mismos pesos int8.
- Despliegue embebido con Rust: el autor documenta el uso del crate `ort` 2.0.0-rc.12, lo que permite integrar la transcripción en binarios nativos ligeros, por ejemplo en dispositivos de captura o kioscos.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la informacion disponible. La model card se corta justo en el apartado que compara WER/CER frente al port comunitario sin caché ("WER / CER, compared with the community port's no-cache"), por lo que los valores concretos no son accesibles.

Los únicos datos de rendimiento verificables son relativos y se midieron en un Apple M4 con 4 hilos, ONNX Runtime 1.30 en CPU y decodificación greedy:

| Metrica | Valor |
|---|---|
| Aceleracion extremo a extremo frente al port int8 sin cache | 4-5x |
| Transcripciones frente al port sin cache | Equivalentes dentro del ruido |
| Tamano de descarga (ONNX) | 1,57 GB (igual que el port sin cache) |
| Memoria pico | Se reduce en aproximadamente 45 MB desactivando el memory arena de la CPU en las sesiones `cross_kv` y `decoder_kv`, sin coste en velocidad |
| Latencia absoluta y throughput (tokens/s, RTF) | No disponibles |
| WER / CER | No disponibles (seccion truncada en la informacion proporcionada) |

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos int8 suman 1,57 GB en disco y esa es la cota principal de memoria de los pesos; el proceso necesita además espacio para los tensores de cache KV en f32 y para las activaciones.
- Cabe en GPU de consumo, pero la configuración recomendada por el autor es la CPU: el execution provider de CoreML resultó más lento y alteraba la salida con el port anterior.
- Hardware validado: Apple M4 con 4 hilos y ONNX Runtime 1.30 (CPU). No se documentan mediciones en A100, H100 ni RTX 4090.
- Memoria pico: el autor recomienda desactivar el memory arena de la CPU en las sesiones `cross_kv` y `decoder_kv`, porque los tensores de cache crecen una posición en cada llamada; con ello el pico baja unos 45 MB sin pérdida de velocidad.
- Despliegue: ONNX Runtime con el CPU execution provider; integración en Rust mediante el crate `ort` 2.0.0-rc.12. No aplican vLLM ni TGI, al no ser un modelo de lenguaje generativo. No se menciona soporte de llama.cpp u Ollama.
- Advertencia de integración: en la primera llamada al decoder el cache `past_self_*` debe ser un tensor de longitud cero `[1, 8, 0, 128]`; con `ort` 2.0.0-rc.12 hay que crearlo con `Tensor::<f32>::new(&Allocator::default(), [1, 8, 0, 128])`, ya que `Tensor::from_array` rechaza dimensiones cero. El encoder no acepta máscara ni longitud: nunca hay que aplicar padding al audio.
- Latencia y throughput absolutos: no disponibles. El único dato publicado es la mejora relativa de 4-5x frente al port sin caché en el hardware citado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limites | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| schamp007/verbatim-hindi-asr-flex-sc | ~1.000 M (segun modelo base) | Prompt + salida ≤ 1024 tokens; 512 tokens nuevos; piezas de audio ≤ 30 s | ONNX int8 con cache KV | Indic Open Model License v1.0 | Deriva cuantizada; 4-5x mas rapida que el port sin cache segun el autor |
| adidsh/indic-transcribe-flex-int8-onnx | Mismo modelo base | No detallado en la informacion disponible | ONNX int8, decoder sin cache | No disponible | Port comunitario previo; recalcula el prefijo completo en cada token |
| bodhan-ai/indic-transcribe-flex | No disponible | No disponible | No disponible | No disponible | Modelo base del que deriva esta version; autor Bodhan AI / AI4Bharat |
| nvidia/canary-1b-v2 | ~1.000 M (denominacion "1b") | No disponible | No disponible | CC-BY-4.0 | Modelo de NVIDIA sobre el que se construye la cadena; sin capacidades identicas garantizadas |

La comparación cuantitativa de rendimiento (WER, CER) no está disponible: la sección correspondiente de la model card está truncada.

## Limitaciones y advertencias

- No es un modelo original: es una reexportación cuantizada de bodhan-ai/indic-transcribe-flex y no está afiliada ni respaldada por Bodhan AI, AI4Bharat, IIT Madras ni NVIDIA. La propia model card exige mantener la atribución en `NOTICE.md`.
- Licencia: Indic Open Model License v1.0 (`license: other`), incluida en el fichero `LICENSE` de 25.546 bytes. No se detallan en la información proporcionada las condiciones exactas para uso comercial; hay que revisar el texto de la licencia antes de desplegar en producción. El modelo base upstream, nvidia/canary-1b-v2, es CC-BY-4.0.
- Cuantización int8: el autor afirma que las transcripciones son equivalentes al port sin caché "dentro del ruido", lo que implica una degradación no nula respecto a los pesos originales en punto flotante.
- Límites duros de decodificación: prompt + tokens generados ≤ 1024 posiciones y máximo de 512 tokens nuevos por pieza. El prompt consume 10 de esas posiciones.
- Límite de audio: las piezas deben ser de ≤ 30 s; el audio más largo requiere segmentación externa cortando en pausas, con el riesgo de cortar palabras si la detección de pausas falla.
- El encoder no admite entrada de longitud ni máscara, por lo que aplicar padding produce resultados incorrectos.
- Idiomas: no cubre el castellano ni otras lenguas europeas. Fuera de la lista de 27 idiomas, la salida no es fiable.
- Riesgo de alucinación y de bucles de repetición, inherente a la decodificación autorregresiva greedy; la información disponible no documenta mitigaciones.
- Sesgos: no documentados. Al derivar de canary-1b-v2 y de los datos de Indic-Transcribe-Flex, cabe esperar sesgos de dominio, acento y género presentes en esos corpus, pero no hay datos para cuantificarlos.
- Advertencias de ejecución: el execution provider de CoreML resultó más lento y alteraba la salida en el port anterior; el autor recomienda CPU. El cache KV de longitud cero requiere un tratamiento especial en `ort` 2.0.0-rc.12.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los ficheros publicados se actualizaron el mismo día de su creación (2026-09-25). Existe poca validación externa independiente.
- Ausencia de datos de WER/CER publicados, lo que impide estimar la calidad real frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schamp007/verbatim-hindi-asr-flex-sc
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Modelo de origen de la cadena: https://huggingface.co/nvidia/canary-1b-v2
- Port comunitario int8 sin caché con el que se compara: https://huggingface.co/adidsh/indic-transcribe-flex-int8-onnx
- Fichero de licencia: https://huggingface.co/schamp007/verbatim-hindi-asr-flex-sc/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/schamp007/verbatim-hindi-asr-flex-sc/blob/main/NOTICE.md
- Sumas de verificación: https://huggingface.co/schamp007/verbatim-hindi-asr-flex-sc/blob/main/SHA256SUMS
- Vocabulario: https://huggingface.co/schamp007/verbatim-hindi-asr-flex-sc/blob/main/bodhan_vocab.json
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes: son resultados de foros y preguntas no relacionados con el modelo, por lo que no se incluye ningun paper, blog ni demo adicional.
