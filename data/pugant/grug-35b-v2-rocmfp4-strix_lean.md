# pugant/grug-35b-v2-ROCmFP4-STRIX_LEAN

## Resumen

`grug-35b-v2-ROCmFP4-STRIX_LEAN` es una cuantización GGUF del modelo multimodal `ProCreations/grug-35b-v2`, preparada específicamente para hardware AMD Strix Halo (gfx1151 / RDNA 3.5). El modelo base pertenece a la familia Qwen3.5-VL-MoE, con 35 000 millones de parámetros totales y 3 000 millones activos por token, lo que lo convierte en un modelo de arquitectura Mixture-of-Experts eficiente para inferencia local. Esta versión cuantizada reduce el peso a aproximadamente 17,3 GiB, permitiendo ejecutar el modelo completo (visión y texto) en sistemas con memoria unificada como el Ryzen AI Max+ 395.

La cuantización utiliza un formato propietario `Q4_0_ROCMFP4_STRIX_LEAN` (tipo 106, ~4,29 bits por peso) que solo es compatible con el fork `charlie12345/ROCmFPX` de llama.cpp. Según las pruebas del autor, ofrece una mejora de velocidad del 16 % frente a la cuantización Q4_K_M estándar, con una reducción del 12 % en tamaño. Es una opción relevante para desarrolladores que trabajan con hardware AMD de última generación y necesitan desplegar modelos multimodales grandes en entornos con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-VL-MoE (Mixture of Experts) |
| Parametros totales | 34 660 610 688 (~35B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible (en el ejemplo de uso se emplea 32768 tokens) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (tipo 106, ~4.29 BPW) |
| Idiomas soportados | en, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `ProCreations/grug-35b-v2` se construye sobre la arquitectura Qwen3.5-VL-MoE, un transformer multimodal con mezcla de expertos. Según la cadena de atribución publicada, deriva de `ornith-ai/Ornith-1.0-35B` (licencia MIT), que a su vez se basa en la arquitectura Qwen3.5-VL-MoE. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, dataset, técnicas de alineación como RLHF o DPO) en la documentación de esta cuantización.

El proceso de cuantización fue realizado por `pugant` utilizando el fork `charlie12345/ROCmFPX` de llama.cpp. Se generó una importance matrix con `llama-imatrix` usando el dataset público `ProCreations/grug-think-v3-10k` (Apache-2.0, 256 chunks, 16 hilos). La cuantización asigna distintos formatos según el tipo de tensor: las atenciones K/V usan `q4_0_rocmfp4` (ruta de alta precisión), los embeddings de token usan `Q5_K`, y las FFN de expertos usan `q4_0_rocmfp4_fast` (ruta de máxima velocidad). El modelo no incluye capas MTP (`mtp_num_hidden_layers` = 0), por lo que la decodificación especulativa MTP no está disponible.

## Capacidades

- Generacion de texto y razonamiento multilingue (ingles y otros idiomas, segun la etiqueta `multilingual`).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con un proyector de vision separado (`mmproj-grug-35b-v2-f16.gguf`).
- Inferencia eficiente gracias a la arquitectura MoE con solo 3B parametros activos por token.
- Compatible con el ecosistema llama.cpp (llama-server, llama-bench, etc.) siempre que se use el fork ROCmFPX.
- Soporte de contexto largo en la practica (se usa `-c 32768` en el ejemplo de despliegue), aunque no se documenta oficialmente.
- No se menciona soporte explicito de tool calling, function calling o capacidades de agente en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en hardware AMD Strix Halo: el modelo puede procesar imagenes y texto simultaneamente, ideal para aplicaciones de escritorio que requieran entender capturas de pantalla, diagramas o fotografias sin depender de servicios en la nube.
- Servicio de inferencia en contenedores ROCm: el ejemplo de uso muestra como desplegar `llama-server` con Docker en un host con Strix Halo, permitiendo integrar el modelo en pipelines existentes via API HTTP.
- Prototipado de aplicaciones de vision por computador con recursos limitados: al ocupar solo ~17,3 GiB, cabe en sistemas con 32 GiB o mas de RAM unificada, lo que facilita el desarrollo de demos y pruebas de concepto.
- Generacion de descripciones de imagenes o analisis de documentos escaneados: su naturaleza multimodal permite extraer informacion de imagenes y combinarla con razonamiento textual.
- Chat conversacional multilingue en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para aplicaciones de salud, legal o finanzas.
- Evaluacion de tecnicas de cuantizacion FP4 en hardware AMD: sirve como referencia para investigar el impacto de formatos de baja precision en rendimiento y calidad para arquitecturas MoE.

## Benchmarks y rendimiento

La model card incluye mediciones de rendimiento de inferencia realizadas en un sistema Strix Halo (AMD Ryzen AI Max+ 395, 128 GB LPDDR5X) con `llama-bench -ngl 999 -fa on -p 512 -n 128 -mmap 0`. Los resultados se obtuvieron con el backend HIP en contenedores ROCm:

| Modelo | Cuantizacion | Tamano | tg128 (tok/s) | pp512 (tok/s) |
|---|---|---:|---:|---:|
| grug-35b-v2 | ROCmFP4-STRIX_LEAN | 17.31 GiB | 70.92 | 1418 |
| grug-35b-v2 | Q4_K_M (baseline) | 19.70 GiB | 61.18 | — |
| Qwen3.6-35B-A3B (referencia produccion) | ROCmFP4-STRIX_LEAN | 17.31 GiB | 63 | — |

El autor reporta una mejora del +16 % en velocidad de generacion frente a Q4_K_M y +12 % frente a la referencia de produccion. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- GPU compatible: exclusivamente AMD Strix Halo (gfx1151 / RDNA 3.5), probado con Ryzen AI Max+ 395. No se ha testeado en otras GPUs.
- VRAM estimada: ~17.3 GiB para el modelo completo (incluyendo el proyector de vision). En sistemas con memoria unificada (LPDDR5X), se puede ejecutar sin tarjeta grafica dedicada.
- El formato de cuantizacion requiere el fork `charlie12345/ROCmFPX` de llama.cpp; el llama.cpp estandar no puede cargar el archivo (tipo 106 invalido).
- Opciones de despliegue: contenedor Docker `kyuz0/amd-strix-halo-toolboxes` con `llama-server`, o compilacion manual del fork.
- Rendimiento medido: 70.92 tok/s de generacion (tg128) y 1418 tok/s de procesamiento de prompt (pp512) en el sistema de referencia.
- No se requieren GPUs discretas, pero el rendimiento depende de la memoria unificada y del ancho de banda del sistema.

## Comparativa con modelos similares

La comparativa se limita a lo reportado en la model card, ya que no se dispone de datos de otros modelos de la misma categoria:

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| grug-35b-v2 (este) | 34.66B | 3B | no disponible | ROCmFP4-STRIX_LEAN | Apache-2.0 |
| Qwen3.6-35B-A3B | ~35B | 3B | no disponible | ROCmFP4-STRIX_LEAN | no disponible |
| grug-35b-v2 (Q4_K_M) | 34.66B | 3B | no disponible | Q4_K_M | Apache-2.0 |

La comparativa de rendimiento muestra que esta cuantizacion supera a la referencia de produccion Qwen3.6-35B-A3B en velocidad de generacion (70.92 vs 63 tok/s) con el mismo tamano de archivo. No se dispone de comparaciones de calidad de salida.

## Limitaciones y advertencias

- El formato de cuantizacion es incompatible con llama.cpp estandar; requiere el fork `charlie12345/ROCmFPX` y no funcionara en otras herramientas (Ollama, LM Studio, etc.) sin modificaciones.
- Solo se ha probado en hardware gfx1151 (Strix Halo). No hay garantias de funcionamiento en otras GPUs AMD o NVIDIA.
- La implementacion de FP4 es software (RDNA 3.5 no tiene unidades FP4 dedicadas); la ventaja es principalmente de ancho de banda y memoria, no de computo bruto.
- No se han publicado evaluaciones de calidad (sesgos, alucinaciones, exactitud en tareas) para esta cuantizacion especifica.
- El modelo base es multimodal, pero el proyector de vision es un archivo separado; sin `--mmproj` solo funciona en modo texto.
- No se soporta MTP (multi-token prediction) porque el modelo base no incluye capas MTP.
- La licencia Apache-2.0 permite uso comercial, pero el codigo del fork ROCmFPX puede tener sus propias condiciones; se recomienda revisarlas antes de desplegar en produccion.
- El contexto maximo no esta documentado oficialmente; el ejemplo usa 32768 tokens, pero no se garantiza que funcione correctamente con ventanas mayores.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/pugant/grug-35b-v2-ROCmFP4-STRIX_LEAN
- Modelo base: https://huggingface.co/ProCreations/grug-35b-v2
- Fork de cuantizacion (GitHub): https://github.com/charlie12345/ROCmFPX
- Dataset de calibracion imatrix: https://huggingface.co/datasets/ProCreations/grug-think-v3-10k
- Modelo de referencia Qwen3.6-35B-A3B (mencionado en benchmarks): https://huggingface.co/pugant/Qwen3.6-35B-A3B-MTP-Q6_0_ROCMFPX
