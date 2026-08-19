# kingjones777/Qwen3.5-9B-ROCmFP4-GGUF

## Resumen

Qwen3.5-9B-ROCmFP4-GGUF es una compilacion en formato GGUF del modelo multimodal Qwen/Qwen3.5-9B, realizada por el usuario kingjones777. Esta version esta especificamente optimizada para hardware AMD con arquitectura RDNA 3.5, en particular para la APU Ryzen AI MAX+ 395 (Strix Halo, gfx1151), utilizando tipos de tensor FP4 y FP8 procedentes del fork ROCmFPX de llama.cpp. El modelo base es un transformer multimodal de 8.953.803.264 parametros que procesa tanto texto como imagenes.

La relevancia de esta compilacion radica en que permite ejecutar un modelo de 9B con vision en hardware AMD de consumo sin necesidad de GPU dedicada, aprovechando la memoria unificada de Strix Halo. Incluye el proyector multimodal (`mmproj-BF16.gguf`) para capacidades de vision, y ofrece cuatro variantes de cuantizacion con diferentes equilibrios entre tamaño, velocidad y fidelidad. Es importante destacar que estos formatos FP4/FP8 no son compatibles con llama.cpp estandar, requiriendo un build especifico del fork ROCmFPX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), basado en Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la model card) |
| Tipos de cuantizacion | Q4_0_ROCMFP4, Q6_0_ROCMFPX, Q8_0_ROCMFPX (formatos FP4/FP8 propietarios del fork ROCmFPX) |
| Idiomas soportados | no disponible (no especificado; el modelo base Qwen3.5 soporta multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj-BF16.gguf para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal que integra vision y lenguaje mediante entrenamiento de fusion temprana sobre tokens multimodales, segun la documentacion oficial de Qwen3.5. Esta compilacion GGUF no modifica la arquitectura subyacente, sino que reempaqueta los pesos en formatos FP4/FP8 especificos para ROCm. El archivo `mmproj-BF16.gguf` contiene el proyector de vision en BF16.

Una caracteristica destacable es que `tie_word_embeddings` esta desactivado, lo que significa que la capa de salida (`output.weight`) esta presente y se cuantiza por separado. Tanto el embedding como la cabeza de salida se almacenan en q6_K en la variante de 4 bits, lo que explica que el peso efectivo sea 4,97 BPW en lugar de ~4,7. No se incluye un modelo MTP/draft para decodificacion especulativa.

Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: capacidades completas del modelo Qwen3.5-9B, incluyendo razonamiento multi-paso.
- Vision multimodal: procesamiento de imagenes con el proyector BF16 incluido; verificado en un test de cuatro cuadrantes de color (rojo, azul, amarillo, verde).
- Generacion de codigo: soportada por el modelo base Qwen3.5-9B.
- Capacidades multilingues: heredadas del modelo base, aunque no se detallan idiomas concretos.
- Tool calling y agentes: soportadas por el modelo base, aunque no se verifican en esta compilacion.
- Modo de vision: requiere desactivar flash attention (`-fa off`) en llama.cpp.

## Casos de uso

- Asistente local multimodal en hardware AMD: ejecutar el modelo en una APU Strix Halo (Ryzen AI MAX+ 395) sin GPU dedicada, aprovechando la memoria unificada para tareas de chat con imagenes.
- Prototipado de aplicaciones de vision por lenguaje: usar la variante Q4_0_ROCMFP4 (5,19 GiB) para desarrollo rapido en equipos con 16-32 GB de RAM unificada.
- Despliegue en edge computing: las variantes Q8_0_ROCMFPX (8,67-8,77 GiB) ofrecen mayor fidelidad para aplicaciones de produccion en dispositivos AMD embebidos.
- Analisis de documentos con imagenes: procesar capturas, diagramas o fotografias junto con texto en un unico modelo local.
- Evaluacion de cuantizacion FP4/FP8: investigar el impacto de estos formatos en la calidad de salida frente a cuantizaciones estandar GGUF.
- Automatizacion de tareas con agentes: integrar el modelo en pipelines que requieran razonamiento multi-paso y comprension visual, ejecutandose en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de velocidad de decodificacion en hardware Strix Halo (Ryzen AI MAX+ 395, ROCm 7.2.4, con `-ngl 999 -c 4096 -fa on -fit off -np 1`, generaciones de 300 tokens, 12 muestras con dos warm-ups):

| Variante | Tamano | Velocidad de decodificacion |
|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 5,19 GiB | 39,34 t/s |
| Q6_0_ROCMFPX_AGENT | 7,90 GiB | 26,23 t/s |
| Q8_0_ROCMFPX | 8,67 GiB | 23,92 t/s |
| Q8_0_ROCMFPX_AGENT | 8,77 GiB | 23,78 t/s |

La model card advierte que mediciones con otros procesos compartiendo la GPU dieron lecturas un 20% inferiores con una dispersion superior al 20%, por lo que las cifras anteriores solo son validas en sistema idle.

## Requisitos de hardware

- VRAM estimada: 5,19 GiB (Q4_0), 7,90 GiB (Q6_0), 8,67-8,77 GiB (Q8_0) para los pesos; se requiere memoria adicional para el contexto y el proyector de vision.
- GPU recomendada: AMD RDNA 3.5 (gfx1151), especificamente la APU Ryzen AI MAX+ 395 (Strix Halo). No se garantiza compatibilidad con otras arquitecturas AMD.
- GPU de consumo: cabe en APUs Strix Halo con memoria unificada de 32 GB o superior; no requiere GPU discreta.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX (obligatorio, los formatos FP4/FP8 no existen en mainline). No es compatible con vLLM, Ollama o TGI en sus versiones estandar.
- Latencia y throughput: 23,78-39,34 t/s en decodificacion segun la variante, medido en sistema idle.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-ROCmFP4-GGUF (este) | 8,95B | no disponible | Apache 2.0 | GGUF FP4/FP8 | Optimizado para AMD gfx1151 |
| Qwen/Qwen3.5-9B (original) | 8,95B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| kingjones777/Qwen3.5-27B-ROCmFP4-GGUF | ~27B | no disponible | Apache 2.0 | GGUF FP4/FP8 | Misma familia, mayor tamano |
| kingjones777/Qwen3.5-0.8B-ROCmFP4-GGUF | ~0,8B | no disponible | Apache 2.0 | GGUF FP4/FP8 | Misma familia, menor tamano |

## Limitaciones y advertencias

- Los formatos FP4/FP8 ROCmFPX no son compatibles con llama.cpp estandar; se requiere un build especifico del fork ROCmFPX, lo que limita la portabilidad.
- La cuantizacion FP4 puede introducir perdida de precision frente a cuantizaciones estandar como Q4_K_M o Q5_K_M.
- La vision requiere desactivar flash attention (`-fa off`), lo que puede afectar al rendimiento en tareas multimodales.
- Las mediciones de velocidad son muy sensibles a la carga del sistema; ejecutar otros procesos en la GPU puede degradar el rendimiento hasta un 20%.
- No se incluye modelo MTP/draft, por lo que no es posible usar decodificacion especulativa.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta compilacion concreta.
- El modelo base Qwen3.5-9B puede presentar sesgos y alucinaciones inherentes a los LLM; no se ha realizado ninguna mitigacion adicional en esta compilacion.
- La licencia Apache 2.0 permite uso comercial, pero el fork ROCmFPX de llama.cpp puede tener sus propias condiciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.5-9B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 27B del mismo autor: https://huggingface.co/kingjones777/Qwen3.5-27B-ROCmFP4-GGUF
- Variante 0.8B del mismo autor: https://huggingface.co/kingjones777/Qwen3.5-0.8B-ROCmFP4-GGUF
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Catalogo de modelos Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Guia de rendimiento de Qwen3.5-9B: https://kalinga.ai/qwen3-5-9b-performance-guide/
