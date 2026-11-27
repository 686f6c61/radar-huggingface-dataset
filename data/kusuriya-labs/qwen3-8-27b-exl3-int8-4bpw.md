# kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw

## Resumen

Qwen3.8-27B-EXL3-INT8-4bpw es una cuantizacion del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario kusuriya-labs. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado en el formato propietario EXL3-INT8 de ExLlamaV3, que modifica el codebook del formato EXL3 trellis para que cada peso decodificado caiga sobre una rejilla INT8 fija. El resultado es un modelo de aproximadamente 16 GB que puede ejecutarse con instrucciones de producto escalar INT8 (iu8) y WMMA, orientado a GPUs AMD RDNA4 (R9700, gfx1201) mediante el runtime shelf del mismo autor.

El modelo base declarado es Qwen3.8-27B, del que se heredan las capacidades multimodales (pipeline image-text-to-text). Sin embargo, el dato real de parametros en safetensors es de 8.254.592.384 parametros, muy inferior a los 27B que sugiere el nombre; esta discrepancia no se explica en la model card y debe tenerse en cuenta al planificar el despliegue. El checkpoint incluye componentes de vision y MTP (multi-token prediction), lo que confirma su naturaleza multimodal.

La relevancia de esta publicacion es fundamentalmente tecnica: demuestra un pipeline de cuantizacion INT8 sobre el formato EXL3 con perdida de calidad medida (KL divergence de 0.02167 frente a BF16) y aceleracion en prefill (7-15% frente al camino W16A16 estandar). No obstante, es un artefacto de nicho: no es cargable por Transformers, vLLM ni ExLlamaV3 upstream, y requiere el runtime shelf con soporte ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B, tag qwen3_5); incluye vision y MTP |
| Parametros totales | 8.254.592.384 (segun safetensors; el nombre indica 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 4.0 bpw (lineales del LM); LM head 6 bit; vision 6 bit; MTP 4 bit; embeddings, norms y controles recurrentes sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato EXL3-INT8, no compatible con ExLlamaV3 upstream) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen (tag de arquitectura qwen3_5) con torre de vision y cabezas de multi-token prediction. Esta publicacion no entrena el modelo: aplica cuantizacion post-entrenamiento con el cuantizador EXL3, usando la misma calibracion (250 x 2048 tokens) y la misma asignacion de bits que el formato EXL3 estandar. La innovacion concreta es el cambio de codebook: el estado del trellis se multiplica por la constante de 24 bits 0xDCD12D mediante `v_mul_u32_u24`, se suman los cuatro bytes del producto y se aplica `q = (B - 509) >> 2` para obtener el peso INT8, con valor real `q * 4 * 887 * 2^-17`. El multiplicador se almacena en el tensor `.mul1` de cada capa lineal (valor 0x00DCD12D en lugar de 0x83DCD12D), y `quantization_config.json` declara `"codebook": "exl3-int8"`. Los pesos decodificados alimentan directamente instrucciones iu8 con activaciones INT8 (escala de grupo de 128, epilogo fp32 con el `svh` original).

La consecuencia practica es que el checkpoint no es convertible desde un EXL3 estandar ni ejecutable por ExLlamaV3 upstream, que decodificaria los pesos con el multiplicador estandar y produciria basura. La evaluacion de calidad se hizo con la build ROCm de ExLlamaV3 y con el runtime shelf del autor, comparando contra una referencia BF16 de llama.cpp.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision cuantizada a 6 bit.
- Generacion de codigo, segun los benchmarks de edicion de codigo en ingles y japones reportados por el autor (seis tareas de code-editing).
- Decodificacion especulativa mediante drafter DFlash2 (EXL3-INT8 4 bpw), que eleva el decode de 31.78 a 93.98 tok/s en las pruebas del autor.
- Multi-token prediction (MTP) integrado en el checkpoint (cuantizado a 4 bit).
- Soporte multilingue: el autor reporta tareas en ingles y japones; la lista completa de idiomas no esta disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs AMD RDNA4 para inferencia multimodal: el checkpoint esta optimizado para R9700 (gfx1201) mediante el runtime shelf con hipBLASLt int8 GEMM, alcanzando 2.324,6 tok/s en prefill a 2.048 tokens y 31,78 tok/s en decode.
- Servicio de chat con imagenes en produccion sobre hardware AMD: al ocupar unos 16 GB, cabe en una unica R9700 y permite atender peticiones image-text-to-text sin recurrir a GPUs NVIDIA.
- Edicion de codigo asistida con contexto largo: el autor reporta 93,98 tok/s de decode con el drafter DFlash2 en tareas de code-editing a 2k, 8k y 16k tokens de entrada, adecuado para asistentes de IDE.
- Investigacion en cuantizacion INT8: sirve como referencia reproducible para estudiar la perdida de calidad (KL 0.02167, top-1 94,03%) frente a BF16 y frente a EXL3 estandar (KL 0.01927, top-1 94,57%).
- Serving de alta concurrencia con prefix caching: las mediciones del PR #53 muestran 173,12 tok/s agregados con 4 peticiones concurrentes y 205,91 tok/s con 32, usando decodificacion especulativa adaptativa.
- Evaluacion comparativa de runtimes: permite contrastar el rendimiento de shelf frente a la build ROCm de ExLlamaV3 en el mismo hardware y formato.
- Prototipado de pipelines multimodales en entornos con ROCm: util para equipos que ya trabajan con el stack AMD y necesitan un modelo conversacional con vision sin salir del ecosistema.

## Benchmarks y rendimiento

Calidad medida como divergencia KL frente a BF16 (referencia llama.cpp), 8 casos y 2.632 posiciones, con la build ROCm de ExLlamaV3:

| Variante | KL media | Acuerdo top-1 |
|---|---|---|
| EXL3 4 bpw estandar (mismo cuantizador) | 0.01927 | 0.9457 |
| EXL3-INT8 4 bpw, activaciones FP16 | 0.01973 | 0.9472 |
| EXL3-INT8 4 bpw, activaciones INT8 (rejilla fija) | 0.02167 | 0.9403 |

Mediciones posteriores del runtime shelf en una R9700 (casos-v1, 8 casos, 2.632 posiciones teacher-forced):

| Camino de prefill | KL media (BF16 ref vs shelf) | Acuerdo top-1 |
|---|---|---|
| Camino A (por defecto) | 0.021176 | 94,7568% |
| Camino B | 0.020745 | 94,8708% |

Rendimiento en R9700 con ROCm 10.2, KV en BF16 y una peticion:

| Metrica | Valor |
|---|---|
| Prefill a 2.048 tokens | 2.324,6 tok/s |
| Decode a contexto 2.048 | 31,78 tok/s |
| Decode con drafter DFlash2 (6 tareas EN/JA, 2k/8k/16k) | 93,98 tok/s de media |
| Prefill con hipBLASLt int8 GEMM vs W16A16 (2048 tokens) | 1.112 ms, ~1.840 tok/s, 7-15% mas rapido |
| Decode en V620 (build ROCm de ExLlamaV3) | ~22 tok/s |

Throughput agregado con decodificacion especulativa adaptativa (PR #53, 48 tokens por peticion, K maximo 5):

| Escenario | Sin especulacion | Con especulacion |
|---|---|---|
| 4 peticiones concurrentes, prefix caching | 160,19 tok/s | 173,12 tok/s |
| 32 peticiones concurrentes, prefix caching | 190,60 tok/s | 205,91 tok/s |
| 32 peticiones concurrentes, sin caching | 215,07 tok/s | 235,98 tok/s |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 16 GB de pesos; con KV en BF16 y contexto de 2.048 tokens, el consumo adicional es moderado, pero no se detalla en la informacion disponible.
- GPU soportadas: AMD Radeon R9700 (RDNA4, gfx1201) con el runtime shelf; AMD V620 con la build ROCm parcheada de ExLlamaV3.
- Cabe en GPU de consumo: no hay datos de GPUs de consumo; el soporte documentado es para GPUs profesionales AMD RDNA4 y V620.
- Despliegue: exclusivamente mediante shelf (codigo y build publicos) o la build ROCm de ExLlamaV3 con la extension parcheada al multiplicador 0xDCD12D. No es compatible con vLLM, Transformers, llama.cpp ni Ollama.
- Latencia y throughput: prefill de 2.324,6 tok/s a 2.048 tokens y decode de 31,78 tok/s en R9700; 93,98 tok/s con drafter DFlash2; ~22 tok/s en V620.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw | 8,25B (safetensors) | no disponible | EXL3-INT8 4 bpw | Apache-2.0 | shelf, ExLlamaV3 ROCm parcheado |
| Qwen/Qwen3.8-27B (base) | 27B (segun nombre) | no disponible | BF16 | Apache-2.0 | Transformers, vLLM, etc. |
| EXL3 4 bpw estandar del mismo base | no disponible | no disponible | EXL3 4 bpw | Apache-2.0 | ExLlamaV3 upstream |

La comparativa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. Frente al EXL3 estandar, este checkpoint pierde ligeramente en calidad (KL 0.02167 frente a 0.01927) pero gana en velocidad de prefill (7-15%) y habilita instrucciones INT8 nativas.

## Limitaciones y advertencias

- No es cargable por Transformers, vLLM, llama.cpp, Ollama ni ExLlamaV3 upstream; usarlo con el multiplicador estandar produce salida corrupta.
- El nombre indica 27B pero safetensors reporta 8.254.592.384 parametros; la discrepancia no se explica y afecta a las estimaciones de memoria y rendimiento.
- La calidad medida es inferior a la del EXL3 estandar del mismo base (KL 0.02167 frente a 0.01927; top-1 94,03% frente a 94,57%).
- La evaluacion de calidad usa solo 8 casos y 2.632 posiciones, una muestra pequena que no cubre todos los dominios.
- La referencia BF16 usa KV en FP16 y shelf usa KV en BF16, por lo que la comparacion mezcla efectos de runtime y de precision.
- El soporte esta limitado a hardware AMD (R9700, V620); no hay resultados en GPUs NVIDIA.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni idiomas soportados mas alla de las tareas en ingles y japones reportadas.
- La licencia Apache-2.0 permite uso comercial, pero la viabilidad practica depende de un runtime de nicho mantenido por el mismo autor.
- El checkpoint requiere mantener juntos `config.json`, `quantization_config.json`, `model.safetensors.index.json` y los ficheros de tokenizer/preprocessor; la model card original esta en `SOURCE_MODEL_CARD.md` y sus afirmaciones describen el modelo base, no esta cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio shelf: https://github.com/kusuriya-labs/shelf
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Calidad de prefill EXL3-INT8: https://github.com/kusuriya-labs/shelf/blob/1fb31fd963cc4c71210aa0c9c461679af150be71/docs/perf/exl3-int8-prefill-quality.md
- Benchmark en R9700: https://github.com/kusuriya-labs/shelf/blob/1fb31fd963cc4c71210aa0c9c461679af150be71/docs/perf/engine-compare-qwen38-27b-r9700.en.md
- PR #53 (DFlash2 adaptativo): https://github.com/kusuriya-labs/shelf/pull/53
- Registro de mediciones del PR #53: https://github.com/kusuriya-labs/shelf/blob/2e5e9d68b1a985598defb43c95455d059ee8fe09/docs/research/20261125/qwen4exp_hy4_port_audit.md
