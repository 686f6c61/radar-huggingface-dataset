# akarta-315h/weft-subbit-fleet

## Resumen

WEFT Sub-Bit Model Fleet (`WEFT-QUANT-STD-2026.1`) es una coleccion de pesos cuantizados en formato sub-bit publicada por el autor `akarta-315h` bajo la etiqueta del Stratum Research Group. No es un modelo entrenado desde cero, sino un conjunto de conversiones de arquitecturas conocidas (Llama 3.3 70B, Mixtral 8x7B, Qwen 2.5 72B, Qwen2.5-Coder, DeepSeek-R1-Distill, Gemma 4, Whisper large-v3, entre otras) a un esquema de cuantizacion extrema que el autor denomina LittleBit-2 Dual-SVID, con un rango declarado de 0,025 a 1,58 bits por peso (BPW) y ratios de compresion de 10,1x a 640x frente a FP16/BF16.

El paquete incluye kernels de inferencia especificos: un GEMV Dual-Path Bitboard fusionado en Triton 3.9 para GPU (orientado a RTX 5060 Ti Blackwell y Ada Lovelace) y un motor C++ nativo con `_mm512_popcnt_epi64` AVX-512 para CPU, con una cache KV paginada de 7,4x. El autor afirma que la correccion del esquema esta verificada formalmente en Lean 4 (`AsymptoticBPW.lean`, `LittleBitTheorems.lean`, `CoQuantizedGEMVInvariants.lean`) sin `sorry` ni axiomas no estandar.

La relevancia practica es doble. Por un lado, si las cifras de BPW y compresion se sostienen, permitiria ejecutar modelos de 70B en menos de 250 MB de pesos, algo que cambiaria los requisitos de hardware para inferencia local. Por otro lado, el repositorio no incluye resultados de benchmarks de calidad, no declara idiomas soportados, no especifica el pipeline y no aporta evaluaciones de degradacion tras la cuantizacion, por lo que debe tratarse como material experimental a validar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio agrupa conversiones de arquitecturas transformer densas y MoE: Llama, Mixtral, Qwen, Gemma, DeepSeek, Whisper) |
| Parametros totales | No disponible como valor unico; el fleet incluye modelos de 2B a 72B/70B y MoE 8x7B |
| Parametros activos | No disponible (aplica a Mixtral 8x7B y Gemma 4 26B-A4B, sin cifras publicadas) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sub-bit LittleBit-2 Dual-SVID, 0,025 a 1,58 BPW efectivos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y `.weft` |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: aplica un esquema de cuantizacion post-entrenamiento sobre pesos existentes. El autor describe el metodo como LittleBit-2 Dual-SVID, con un rango efectivo de 0,025 a 1,58 bits por peso y compresion declarada de 10,1x a 640x frente a FP16/BF16. Las arquitecturas de origen son transformers densos y MoE (Llama 3.3 70B, Mixtral 8x7B, Qwen 2.5 72B, Qwen2.5-Coder 32B/14B/7B, DeepSeek-Coder-V2-Lite, DeepSeek-R1-Distill-Qwen-32B, Qwen2.5-Math-72B, Goedel-Prover-32B, Gemma 4 26B-A4B/E4B/E2B, Qwen2-VL-7B, Whisper large-v3, MusicGen small). No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, porque el proceso es de conversion, no de preentrenamiento.

La innovacion tecnica declarada esta en el runtime de inferencia. En GPU, un GEMV Dual-Path Bitboard fusionado en Triton 3.9 que opera directamente sobre los pesos empaquetados en bitboards. En CPU, un motor C++ con instrucciones AVX-512 `_mm512_popcnt_epi64` para decodificar los bitboards y una cache KV paginada con factor 7,4x. El autor afirma que los invariantes del GEMV co-cuantizado y las cotas asintoticas de BPW estan demostrados en Lean 4, y adjunta certificados de norma de Frobenius e intervalos de error por arquitectura convertida. No se publican mediciones de perplejidad ni de exactitud downstream tras la conversion.

## Capacidades

- Generacion de texto y razonamiento: heredadas de los modelos base convertidos (Llama 3.3 70B, Qwen 2.5 72B, DeepSeek-R1-Distill-Qwen-32B), sujetas a la degradacion introducida por la cuantizacion sub-bit, no evaluada en el repositorio.
- Generacion de codigo: incluye Qwen2.5-Coder en 32B, 14B y 7B, y DeepSeek-Coder-V2-Lite.
- Razonamiento matematico y formal: Qwen2.5-Math-72B y Goedel-Prover-32B.
- Vision y multimodalidad: Qwen2-VL-7B y las variantes Gemma 4 (26B-A4B, E4B, E2B) en formato `.weft` y `.gguf`.
- Audio: Whisper large-v3 para transcripcion y MusicGen small para generacion musical.
- Tool calling y function calling: no disponible de forma explicita; depende del modelo base y del runtime, que no documenta plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo thinking: no documentado (DeepSeek-R1-Distill-Qwen-32B es el unico base con razonamiento explicito, pero el autor no confirma que se preserve el formato de traza).

## Casos de uso

- Inferencia local de modelos grandes en hardware de consumo: el fleet incluye `llama-3.3-70b-subbit.gguf` (220,63 MB) y `qwen-2.5-72b-subbit.gguf` (230,15 MB), lo que en teoria permitiria cargar un 70B en una GPU de 8-12 GB o incluso en RAM de sistema. Requiere validar la calidad antes de usar en cualquier tarea real.
- Despliegue en CPU con AVX-512: el motor C++ nativo con `_mm512_popcnt_epi64` y cache KV paginada 7,4x esta pensado para servidores sin GPU, por ejemplo estaciones de trabajo con Xeon Scalable o EPYC. Util para entornos air-gapped o con restricciones de acelerador.
- Asistencia de codigo en IDE con latencia baja: los modelos Qwen2.5-Coder 7B/14B/32B en 48-148 MB podrian integrarse en un plugin de editor que mantenga el modelo en memoria y responda a autocompletado o explicacion de fragmentos, siempre que la perdida de calidad sea aceptable.
- Prototipado rapido de pipelines de razonamiento: DeepSeek-R1-Distill-Qwen-32B (147,95 MB) y Goedel-Prover-32B (148,56 MB) permiten montar demos de razonamiento paso a paso o de demostracion formal en un portatil, sin aprovisionar GPUs grandes.
- Transcripcion de audio en local: `whisper-large-v3-subbit.gguf` (60,41 MB) se puede embeber en aplicaciones de escritorio o moviles para subtitulado y dictado, con la advertencia de que la calidad de transcripcion tras cuantizacion sub-bit no esta publicada.
- Procesamiento de imagenes y documentos: Qwen2-VL-7B (59,42 MB) y Gemma 4 permiten OCR, descripcion de imagenes o extraccion de campos en entornos con recursos limitados, como un portatil o un dispositivo edge.
- Generacion musical y creativa ligera: MusicGen small (15,38 MB) para prototipos de generacion de audio en aplicaciones interactivas.
- Investigacion en cuantizacion extrema: el paquete incluye certificados de norma de Frobenius e intervalos de error por arquitectura, lo que lo hace util como banco de pruebas para estudiar la relacion entre BPW y degradacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones de exactitud downstream para ninguna de las conversiones. Solo se documentan metricas de compresion (BPW efectivo y ratio frente a FP16/BF16) y certificados formales de cotas de error, no mediciones empiricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan entre 15,38 MB y 317,90 MB por modelo, por lo que la VRAM necesaria viene dominada por la cache KV y las activaciones, no por los pesos. No se publican cifras de VRAM total por modelo ni por longitud de contexto.
- GPU recomendadas: el autor cita NVIDIA RTX 5060 Ti (Blackwell) y Ada Lovelace como objetivos del kernel Triton 3.9 Dual-Path Bitboard. No se mencionan A100, H100 ni otras GPUs de datacenter.
- Cabe en GPU de consumo: si, segun el autor, cualquier modelo del fleet cabria en GPUs de consumo por el tamano de los pesos. No se especifica el modelo minimo (p. ej. RTX 3060 12 GB, RTX 4060 8 GB) ni la VRAM real necesaria con contexto largo.
- Opciones de despliegue: runtime propio del autor (Triton 3.9 para GPU y motor C++ AVX-512 para CPU). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, pese a usar formato GGUF; el esquema sub-bit no es el GGUF estandar de llama.cpp.
- Latencia y throughput: no disponibles. El autor menciona una cache KV paginada de 7,4x en CPU, pero no aporta tokens/s ni latencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / BPW | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WEFT Sub-Bit Fleet (este repo) | 2B a 72B / MoE 8x7B | No disponible | GGUF y `.weft`, 0,025-1,58 BPW | Apache 2.0 | Hugging Face, 0 descargas, runtime propio |
| Llama 3.3 70B (original) | 70B | 128k tokens | safetensors, 16 bits | Llama 3.3 Community License | Meta y Hugging Face, ampliamente desplegado |
| Qwen2.5-Coder-32B (original) | 32B | 128k tokens | safetensors, 16 bits | Apache 2.0 | Hugging Face, ecosistema estandar |
| Mixtral 8x7B (original) | 46,7B totales, 12,9B activos | 32k tokens | safetensors, 16 bits | Apache 2.0 | Hugging Face, soportado por vLLM y llama.cpp |

La comparativa es asimetrica: los originales ofrecen pesos en precision completa, ecosistema de despliegue maduro y evaluaciones publicas; el fleet WEFT ofrece compresion extrema pero sin mediciones de calidad, sin soporte confirmado en runtimes estandar y con un unico autor. No se dispone de datos para comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay perplejidad, MMLU, HumanEval ni evaluaciones downstream. La cuantizacion a 0,025-1,58 BPW es extremadamente agresiva y la degradacion esperada es alta; sin mediciones no se puede afirmar que los modelos sean utilizables.
- Compatibilidad de runtime: aunque los ficheros usan extension `.gguf`, el esquema sub-bit LittleBit-2 Dual-SVID requiere el kernel Triton y el motor AVX-512 del autor. No esta confirmado que funcionen con llama.cpp, Ollama, vLLM o TGI, lo que limita su integracion en pipelines existentes.
- Requisito de CPU AVX-512 para el motor nativo: excluye procesadores sin AVX-512 (la mayoria de consumer Intel recientes y todos los Apple Silicon), y el objetivo GPU declarado es RTX 5060 Ti / Ada Lovelace, no GPUs de datacenter.
- Idiomas no declarados: no se especifica que idiomas conservan los modelos tras la conversion ni si el castellano mantiene calidad.
- Riesgo de alucinacion: no evaluado; a mayor compresion, mayor probabilidad de degradacion en hechos y coherencia.
- Licencia: el repo se declara Apache 2.0, pero los modelos base tienen licencias propias (Llama 3.3 Community License, etc.). La redistribucion de pesos derivados debe respetar la licencia del modelo original, que puede imponer restricciones adicionales al uso comercial.
- Madurez y trazabilidad: 0 descargas y 0 likes en el momento de la consulta, autor unico sin historial verificable, y afirmaciones de verificacion formal en Lean 4 que no se pueden comprobar sin revisar el repositorio enlazado.
- Sin pipeline declarado ni informacion de contexto: no se puede planificar el despliegue en produccion sin determinar la longitud de contexto soportada y el consumo de VRAM con cache KV.

## Enlaces

- Hugging Face: https://huggingface.co/akarta-315h/weft-subbit-fleet
- Repositorio del autor (Stratum Research Group WEFT): https://github.com/Stratum-Research-Group/WEFT
- Pruebas formales citadas: `formal/AsymptoticBPW.lean`, `formal/LittleBitTheorems.lean`, `formal/CoQuantizedGEMVInvariants.lean` (dentro del repositorio anterior)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
