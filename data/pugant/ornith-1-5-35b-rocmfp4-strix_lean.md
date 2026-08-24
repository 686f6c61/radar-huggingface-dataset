# pugant/Ornith-1.5-35B-ROCmFP4-STRIX_LEAN

## Resumen

Ornith-1.5-35B-ROCmFP4-STRIX_LEAN es una cuantización especializada del modelo multimodal Ornith-1.5-35B-A3B, desarrollada por pugant para ejecutarse en APU AMD Strix Halo (gfx1151, RDNA 3.5). El modelo base pertenece a la familia Qwen3.5-VL-MoE, con 35.505 millones de parámetros totales y 3.000 millones activos por token, lo que lo convierte en un MoE eficiente para inferencia en hardware con memoria unificada. Esta versión cuantizada utiliza el formato GGUF con el tipo personalizado Q4_0_ROCMFP4_STRIX_LEAN (~4,29 bits por peso), que reduce el tamaño a 17,73 GiB y permite ejecutar el modelo completo de visión y texto en la memoria de 128 GB LPDDR5X del Strix Halo.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones FP4 software optimizadas para RDNA 3.5, donde la ventaja principal es el ancho de banda y la reducción de memoria, no el cómputo bruto. El modelo alcanza 82,45 tokens/s en generación (tg128) y 1161 tokens/s en prefill (pp512) en un sistema no tuneado, y requiere un fork específico de llama.cpp (ROCmFPX) que no es compatible con la versión estándar. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-VL-MoE |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3.000 millones (aprox., segun model card) |
| Longitud de contexto | 262.144 tokens (modelo base, segun runinfra.ai) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (GGUF file_type 106, ~4,29 BPW) |
| Idiomas soportados | en, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF (tipo 106 personalizado, invalido en llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE de la familia Qwen3.5-VL-MoE con 35B parametros totales y 3B activos por token. Incluye un head MTP (Multi-Token Prediction) de 1 capa (`nextn_predict_layers=1`) que se conserva en el GGUF pero que, segun las pruebas del autor, no mejora el rendimiento en esta version (la tasa de aceptacion cae drasticamente a partir del segundo token). La cuantizacion aplica estrategias diferenciadas: embeddings en Q5_K, atencion K/V en q4_0_rocmfp4 (alta precision) y FFN de expertos en q4_0_rocmfp4_fast (maxima velocidad). No se dispone de informacion detallada sobre el entrenamiento del modelo base (datos, tokens, metodos de alineacion) en la documentacion proporcionada.

## Capacidades

- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`).
- Generacion de texto en ingles y otros idiomas (multilingue).
- Razonamiento de multiples pasos gracias al soporte de "reasoning budget" en el fork ROCmFPX (activado via flags del runtime, no del modelo en si).
- Ejecucion completa del modelo de vision y texto en ~17,7 GiB de memoria unificada.
- Soporte de decodificacion especulativa (MTP) opcional, aunque las pruebas muestran que no aporta mejora en esta cuantizacion.
- Compatible con endpoints OpenAI (segun runinfra.ai) y con la libreria llama.cpp (solo fork ROCmFPX).

## Casos de uso

- Inferencia local multimodal en dispositivos Strix Halo: el modelo puede procesar imagenes y texto simultaneamente en una APU AMD Ryzen AI Max+ 395, aprovechando los 128 GB de memoria unificada sin necesidad de GPU discreta. Adecuado para prototipos de vision por computador en edge.
- Asistentes de chat con soporte de imagenes: al ser un modelo de vision-lenguaje, puede mantener conversaciones que incluyan fotografias, diagramas o capturas de pantalla, con una ventana de contexto de 262k tokens que permite manejar documentos largos.
- Procesamiento de documentos escaneados: la combinacion de OCR implicito (via vision) y generacion de texto permite extraer y resumir informacion de PDFs o imagenes de documentos en aplicaciones locales.
- Desarrollo de agentes multimodales en entornos con restricciones de hardware: al requerir solo 17,7 GiB y ejecutarse en una APU, es viable para robots o dispositivos embebidos con Strix Halo que necesiten entender su entorno visual.
- Evaluacion de modelos MoE cuantizados en RDNA 3.5: sirve como referencia para investigacion sobre cuantizacion FP4 software y su impacto en rendimiento y calidad, dado que el autor publica benchmarks detallados y metodologia reproducible.
- Servicio de inferencia de bajo coste: con un precio de 0,10 USD por millon de tokens de entrada y 0,40 USD por millon de salida (via runinfra.ai), es una opcion economica para aplicaciones de vision-lenguaje en produccion.

## Benchmarks y rendimiento

Resultados medidos en Strix Halo (AMD Ryzen AI Max+ 395, 128 GB LPDDR5X) con `llama-bench -ngl 999 -fa on -p 512 -n 128`, usando build Vulkan (RADV) del fork ROCmFPX. Sistema con perfil de energia `balanced` (no tuneado).

| Modelo | Quant | Tamano | tg128 (tok/s) | pp512 (tok/s) |
|---|---|---|---:|---:|
| **Ornith-1.5-35B (este)** | ROCmFP4-STRIX_LEAN | 17,73 GiB | 82,45 ± 1,37 | 1161,00 ± 22,76 |
| Ornith-1.0-35B (ROCm) | ROCmFP4-STRIX_LEAN | 17,32 GiB | 66,68 | 1486 |
| grug-35b-v2 (ROCm) | ROCmFP4-STRIX_LEAN | 17,31 GiB | 70,92 | 1418 |
| Qwen3.6-35B-A3B base (Vulkan ref) | ROCmFP4-STRIX_LEAN | 17,73 GiB | 81,57 | 1164,67 |

Decodificacion especulativa (MTP) en el mismo entorno, con contexto 16k:

| Config | prosa (tok/s) | deterministico (tok/s) |
|---|---:|---:|
| Sin especulacion | 78,0 | 77,2 |
| MTP n-max 2 | 59,1 | 75,4 |
| MTP n-max 3 | 44,6 | 63,5 |
| MTP n-max 5 | 36,9 | 47,3 |

Conclusion del autor: la decodificacion especulativa no compensa en esta version; la inferencia plana es siempre superior. El modelo base Qwen3.6-35B-A3B si gana +37% con MTP n-max 3, pero el fine-tune Ornith-1.5 degrada el head MTP.

## Requisitos de hardware

- GPU/APU: exclusivamente AMD Strix Halo (gfx1151, RDNA 3.5). No probado en otras GPUs.
- Memoria: ~17,7 GiB para el modelo en memoria unificada. El sistema de referencia usa 128 GB LPDDR5X.
- Software: requiere un fork de llama.cpp con soporte ROCmFPX (recomendado: `pugant/strix-halo-llamacpp-lab/rocmfpx` o el upstream `charlie12345/ROCmFPX`). El formato GGUF tipo 106 es invalido en llama.cpp estandar.
- Backends: Vulkan (RADV) o ROCm (HIP). Los benchmarks de esta version se tomaron con Vulkan.
- Latencia: 82,45 tok/s de generacion y 1161 tok/s de prefill en el sistema de referencia sin tuneo. Con perfil `performance` podrian ser ligeramente superiores.
- No es compatible con GPUs consumer convencionales (RTX, etc.) por la dependencia de gfx1151.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | tg128 (tok/s) | pp512 (tok/s) | Licencia |
|---|---|---|---:|---:|---:|---|
| **Ornith-1.5-35B (este)** | 35,5B | 3B | 262k | 82,45 | 1161 | MIT |
| Ornith-1.0-35B | 35,5B | 3B | no disponible | 66,68 (ROCm) | 1486 (ROCm) | MIT |
| Qwen3.6-35B-A3B base | 35,5B | 3B | 262k | 81,57 | 1164,67 | no disponible |

Nota: las comparaciones se limitan a la misma cuantizacion y backend. No se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un fork especifico de llama.cpp (ROCmFPX); el GGUF no carga en la version estandar y puede provocar errores.
- Solo probado en gfx1151 (Strix Halo). No hay garantias de funcionamiento en otras arquitecturas AMD o NVIDIA.
- La cuantizacion FP4 es software (RDNA 3.5 no tiene unidades FP4), por lo que la ganancia es de ancho de banda, no de computo. En tareas compute-bound puede no ofrecer ventaja.
- La decodificacion especulativa (MTP) esta incluida pero degrada el rendimiento; se recomienda no usarla o limitarla a `--spec-draft-n-max 2`.
- El contexto de 262k tokens corresponde al modelo base segun runinfra.ai; no se ha verificado en esta cuantizacion especifica.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantizacion; solo datos de rendimiento de inferencia.
- El modelo base Ornith-1.5 tiene capacidades de auto-mejora (self-improvement) que no son relevantes para la inferencia, pero podrian implicar diferencias de comportamiento frente a otros modelos de la familia Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pugant/Ornith-1.5-35B-ROCmFP4-STRIX_LEAN
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- API de inferencia (runinfra): https://runinfra.ai/inference-api/ornith-1-5-35b
- Fork ROCmFPX (upstream): https://github.com/charlie12345/ROCmFPX
- Runtime de laboratorio (recomendado): https://github.com/pugant/strix-halo-llamacpp-lab/tree/main/rocmfpx
