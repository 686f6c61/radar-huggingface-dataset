# nvidia/Qwen3.8-Flash-Next-NVFP4-QAD

## Resumen

Qwen3.8-Flash-Next-NVFP4-QAD es un checkpoint experimental de precisión mixta publicado por NVIDIA sobre el modelo multimodal Qwen3.8-Flash-Next de Qwen. No se trata de un modelo nuevo entrenado desde cero, sino de una exportación cuantizada realizada con NVIDIA Model Optimizer y NeMo AutoModel bajo FSDP2, tras 100 actualizaciones de optimizador mediante Quantization-Aware Distillation (QAD). El checkpoint conserva el modelo multimodal completo: encoder de visión congelado, embedding de n-gramas PLE y módulo MTP.

La relevancia técnica está en la receta de cuantización: es más agresiva que el checkpoint NVFP4 previo del mismo autor. Además de los expertos enrutados, cuantiza los expertos compartidos a NVFP4 y determinadas proyecciones GDN, QSA e indexer a MXFP8. El sufijo `-QAD` identifica el método de entrenamiento, no una receta NVFP4 sin cambios.

El modelo tiene 179.999.981.459 parámetros totales y un repositorio de 174,2 GB, con ficheros de pesos de aproximadamente 129,7 GB (120,8 GiB). Está pensado para servir inferencia con kernels nativos NVFP4 y MXFP8 en hardware NVIDIA, y su licencia es la NVIDIA Open Model License. La propia model card advierte de que las ganancias de precisión atribuibles a QAD no están estadísticamente establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (48 grupos de expertos enrutados), módulo MTP y embedding PLE de n-gramas; encoder de visión |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la longitud máxima de entrenamiento QAD fue de 16.384 tokens, no es necesariamente el contexto de inferencia) |
| Tipos de cuantizacion | NVFP4 (bloque 16) en expertos enrutados y compartidos; MXFP8 (bloque 32) en proyecciones GDN, QSA e indexer; FP8 E4M3 en embedding PLE y expertos enrutados MTP; BF16 en expertos compartidos y atención MTP, encoder de visión, routers, gates, convoluciones y cabeza de salida |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (other) |
| Formato de pesos | safetensors (librería modelopt; metadatos en `hf_quant_config.json`, `config.json`, `quantization_recipe.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos: 48 grupos de expertos enrutados en el LM principal y 144 matrices lineales de expertos compartidos. Incorpora proyecciones GDN (180 matrices lineales), proyecciones q/k/v/o QSA (48 matrices), proyecciones del indexer QSA (12 matrices), un embedding PLE de n-gramas y un módulo MTP (Multi-Token Prediction). El encoder de visión se mantiene en su precisión original y congelado durante todo el proceso.

La cuantización se aplicó con NVIDIA Model Optimizer y NeMo AutoModel sobre el modelo BF16 original. El proceso QAD usó cómputo con cuantización simulada (fake-quant) y pesos maestros en coma flotante, con un profesor BF16 congelado. Se completaron 100 actualizaciones de optimizador con longitud máxima de secuencia de 16.384 tokens, batch global de 512 secuencias (51.200 ejemplos consumidos), microbatch de 1 por rango y FSDP2 con 64 rangos. Optimizador Adam con betas (0,9; 0,95), epsilon 1e-8, weight decay 0, learning rate pico 1e-5 y mínimo 1e-6, warmup de 50 actualizaciones sobre un horizonte de 500. El entrenamiento usó solo entradas de texto; el encoder de visión permaneció congelado. El estado MTP y PLE preservado proviene del checkpoint mixto de NVIDIA ya publicado, y QAD no volvió a cuantizar ni entrenar MTP. La validación de exportación comparó log-probabilidades entre referencia de entrenamiento y modelo exportado en longitudes 256, 4.096, 8.192 y 16.384: error absoluto medio de 1,21e-6, error máximo de 1,00e-5 y acuerdo top-1 del 99,25% sobre 28.924 posiciones evaluadas.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con encoder de visión incluido en el checkpoint.
- Razonamiento matemático y científico de nivel avanzado, según los benchmarks reportados (GPQA-Diamond, SciCode).
- Generación y resolución de tareas de código, con resultados medidos en SciCode y Terminal-Bench.
- Seguimiento de instrucciones complejas (IFBench).
- Razonamiento sobre contexto largo (AA-LCR).
- Decodificación multi-token mediante el módulo MTP incluido (desactivado en todas las mediciones de benchmark reportadas).
- Tool calling y uso de agentes: no documentado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de recetas de cuantización en producción: el checkpoint sirve para comparar una receta NVFP4/MXFP8 agresiva con QAD frente a la variante PTQ equivalente sobre las mismas tareas, usando los benchmarks internos como referencia descriptiva.
- Despliegue multimodal en infraestructura NVIDIA: al conservar el encoder de visión y usar kernels nativos NVFP4 y MXFP8, es adecuado para servir cargas image-text-to-text en GPUs NVIDIA con soporte de estos formatos.
- Análisis de documentos con componente visual: tareas de MMMU-Pro (76,65 en PTQ, 77,34 tras QAD) indican uso en comprensión de diagramas, gráficos e imágenes técnicas combinadas con texto.
- Razonamiento científico asistido: con 91,60 en GPQA-Diamond, encaja en flujos de preguntas de nivel posgrado en física, química y biología que requieran justificación.
- Automatización de tareas de terminal y agentes de código: Terminal-Bench 2.1 con pass@1 de 85,96 (cualificado) lo sitúa como candidato para agentes que ejecutan comandos y resuelven incidencias en entornos de shell.
- Generación de subtareas de programación científica: SciCode con 51,11 de éxito en subtareas lo hace útil en pipelines que descomponen problemas numéricos en pasos verificables.
- Seguimiento estricto de instrucciones en asistentes internos: IFBench de 79,93 permite usar el modelo en sistemas donde el formato y las restricciones de respuesta son críticos.
- Investigación sobre QAD: al ser un checkpoint experimental con paridad de exportación documentada, sirve como base para estudiar la recuperación de precisión tras cuantización agresiva.

## Benchmarks y rendimiento

Mediciones internas experimentales en escala 0-100, no comparables con las del model card original de NVIDIA. La columna PTQ corresponde a la receta agresiva antes de QAD.

| Benchmark / metrica | PTQ agresivo | QAD actualizacion 100 |
|---|---:|---:|
| GPQA-Diamond (accuracy) | 91,35 | 91,60 |
| IFBench (instruction-following) | 79,60 | 79,93 |
| SciCode (subtask success) | 49,48 | 51,11 |
| AA-LCR (accuracy) | 77,63 | 77,13 |
| MMMU-Pro (accuracy) | 76,65 | 77,34 |
| Terminal-Bench 2.1 (pass@1 nativo, cualificado) | 85,39 | 85,96 |

Notas de validez reportadas por el autor: SciCode usa ocho repeticiones operativas para QAD y la segunda cohorte de ocho repeticiones de PTQ (la primera cohorte dio 52,00; agrupando las 16, 50,74). Frente a la segunda cohorte, la diferencia QAD es +1,63 puntos porcentuales con intervalo bootstrap del 95% de [-0,66; +3,97]. Terminal-Bench conserva las 712 salidas por checkpoint, con 13/712 fallos de runtime en PTQ y 4/712 en QAD; el intervalo bootstrap por clúster de tareas para QAD menos PTQ es [-1,97; +3,09] puntos porcentuales. El autor indica que no puede atribuirse limpiamente la diferencia a la cuantización o al entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 129,7 GB (120,8 GiB), por lo que se necesita al menos esa cantidad solo para pesos; la caché KV fue BF16 durante la evaluación y su cuantización no forma parte de la receta.
- GPU recomendadas: no disponible en la información proporcionada; la receta exige soporte de kernels nativos NVFP4 y MXFP8, propio de GPUs NVIDIA de generación reciente.
- Viabilidad en GPU de consumo: no disponible. Con 129,7 GB de pesos no cabe en una única GPU de consumo actual.
- Opciones de despliegue: no se documentan en la información disponible; la librería asociada es `modelopt` y la configuración validada usa cómputo nativo NVFP4 y MXFP8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nvidia/Qwen3.8-Flash-Next-NVFP4-QAD | 179.999.981.459 | no disponible | nvidia-open-model-license | safetensors NVFP4/MXFP8 | Receta agresiva con QAD, 100 actualizaciones |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | nvidia-open-model-license | safetensors NVFP4 | Receta NVFP4 menos agresiva, sin QAD |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | BF16 | Modelo base original |

No se dispone de datos de benchmarks del modelo base BF16 ni del checkpoint NVFP4 previo en la información proporcionada, por lo que no es posible una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Checkpoint experimental: el autor declara explícitamente que las ganancias de precisión atribuibles a QAD no están estadísticamente establecidas.
- Los intervalos de confianza de SciCode y Terminal-Bench incluyen el cero, de modo que no puede afirmarse una mejora fiable frente a PTQ.
- Contabilidad incompleta de reintentos, timeouts y terminación de salida en ejecuciones históricas, especialmente en Terminal-Bench; los números son descriptivos.
- Los benchmarks son mediciones internas con protocolo propio y no son comparables con las puntuaciones del model card original de NVIDIA.
- El entrenamiento QAD usó solo texto y el encoder de visión permaneció congelado: no hay garantía de mejora en tareas visuales por el proceso QAD.
- La caché KV se mantuvo en BF16; no se incluye cuantización de KV en esta receta, lo que limita el ahorro de memoria en despliegues de contexto largo.
- Los ficheros de datos de entrenamiento no se distribuyen en el repositorio.
- Es un checkpoint de inferencia: no incluye estado del optimizador.
- Licencia NVIDIA Open Model License: revisar las condiciones de uso comercial en el enlace oficial antes de desplegar.
- Sesgos conocidos, riesgo de alucinación e idiomas soportados: no documentados en la información disponible.
- El contexto máximo de inferencia no se especifica; la longitud de 16.384 tokens corresponde al techo de entrenamiento QAD, no al contexto del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint NVFP4 previo: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- NVIDIA (sitio corporativo): https://www.nvidia.com/en-us/
- NVIDIA (sitio en español): https://www.nvidia.fr/default.htm
- NVIDIA Wikipedia: https://en.wikipedia.org/wiki/Nvidia
- NVIDIA Wikipedia (francés): https://fr.wikipedia.org/wiki/Nvidia
- Descarga de drivers NVIDIA: https://www.nvidia.com/fr-fr/drivers/
