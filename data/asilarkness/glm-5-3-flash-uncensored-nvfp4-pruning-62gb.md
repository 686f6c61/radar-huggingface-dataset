# Asilarkness/GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB

## Resumen

GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB es una version podada (expert pruning) del modelo orcarouter/GLM-5.3-Flash-Uncensored-NVFP4, que a su vez es una variante sin filtros del modelo GLM-5.3-Flash desarrollado por zai-org. El autor de esta version es Asilarkness. El problema que resuelve es la reduccion del peso del modelo para que quepa en una sola GPU de 96 GB con margen para KV-cache y contexto largo, manteniendo las capacidades de codigo, razonamiento, logica y dialogo. Es relevante porque permite ejecutar un modelo de 94.006.009.118 parametros en hardware de gama alta sin necesidad de multiples GPUs.

La arquitectura es un mixture of experts (MoE) con atencion MLA y vision tower intactos. La poda reduce los expertos enrutados por capa de 288 a 80 (42 capas sparse, top-8 routing conservado), manteniendo los expertos compartidos, las capas densas (0-2), la atencion y el vision tower. La cuantizacion NVFP4 se preserva sin recuantizacion. El tamano en disco es de aproximadamente 62 GiB (66 GB), frente a los ~177 GiB del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion MLA y vision tower |
| Parametros totales | 94.006.009.118 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (compressed-tensors) |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (NVFP4 compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una version podada de GLM-5.3-Flash-Uncensored-NVFP4. La arquitectura base es un transformer MoE con 42 capas sparse, 288 expertos enrutados por capa y top-8 routing. La poda reduce los expertos a 80 por capa, recortando el router (`mlp.gate.weight` y `e_score_correction_bias`) y remapeando los indices a 0..79. Los expertos compartidos, las capas densas (0-2), la atencion MLA y el vision tower no se modifican. La cuantizacion NVFP4 en formato compressed-tensors se conserva, manteniendo los pesos empaquetados y las escalas remapeadas sin recuantizacion.

El metodo de poda calcula una puntuacion de importancia por experto y capa mediante la formula: `score = z(router_norm) + z(expert_magnitude) + 0.5 * z(calibration_affinity)`. La `router_norm` es la norma L2 de la fila del router; `expert_magnitude` es la media de la escala FP8 multiplicada por la escala global sobre las proyecciones gate/up/down; `calibration_affinity` es el producto punto entre la fila del router normalizada y el centroide de ~200 tokens de calibracion que cubren codigo, matematicas, logica y dialogo en ingles, embebidos con `embed_tokens` del propio modelo. Se mantienen los top-80 expertos por capa, priorizando capacidades de codigo, agentes, logica, matematicas y conversacion, mientras que los expertos de dominios raros se cortaron primero. No se dispone de informacion sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO.

## Capacidades

- Generacion de texto, razonamiento logico, codigo y matematicas, segun el objetivo del pruning.
- Soporte de entrada multimodal: el vision tower se mantiene intacto, por lo que puede procesar imagenes junto con texto (AutoModelForImageTextToText).
- Capacidades agentic priorizadas durante la poda, aunque no se confirma soporte explicito de tool calling o function calling en la informacion disponible.
- Idiomas soportados: ingles y ruso.
- Modelo uncensored/abliterated: las salidas no estan filtradas, lo que puede ser util para aplicaciones que requieren generacion sin restricciones de contenido.
- No se documenta un modo de thinking ni otras capacidades especiales.

## Casos de uso

- Generacion de codigo en produccion: el modelo ha sido podado priorizando coding, con 80 expertos por capa y top-8 routing. Gracias a la cuantizacion NVFP4, puede ejecutarse en una sola GPU de 96 GB con margen para contexto, lo que permite integrarlo en pipelines de CI/CD para autocompletado, revision o generacion de fragmentos de codigo.
- Razonamiento matematico y logico: los tokens de calibracion usados en la poda incluian math y logic, por lo que el modelo es adecuado para resolver problemas matematicos, demostraciones logicas o tareas de razonamiento simbolico en entornos educativos o de investigacion.
- Asistentes de dialogo sin filtros: al ser uncensored/abliterated, puede emplearse en aplicaciones de roleplay, generacion creativa o chatbots donde se requiere texto sin restricciones de contenido. Debe usarse con cautela por el riesgo de generar contenido no deseado.
- Analisis multimodal de imagenes y texto: el vision tower intacto permite tareas como descripcion de imagenes, OCR o razonamiento visual combinado con texto, por ejemplo en sistemas de documentacion tecnica o analisis de capturas.
- Agentes autonomos: el pruning priorizo capacidades agentic, por lo que el modelo puede utilizarse en sistemas multi-paso que requieren planificacion y ejecucion de tareas, aunque no se ha confirmado soporte de tool calling en la informacion disponible.
- Investigacion en eficiencia de modelos: este checkpoint es un ejemplo practico de expert pruning con preservacion de cuantizacion. Puede usarse para estudiar como la reduccion de expertos afecta a las capacidades core de un MoE, comparando con el modelo base sin podar.
- Despliegue en una sola GPU de 96 GB: gracias a la poda, el modelo cabe en una RTX PRO 6000 96GB con ~30+ GiB libres para KV-cache y contexto largo, lo que facilita su uso en estaciones de trabajo de gama alta sin necesidad de multiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo solo ha sido sometido a pruebas de humo tras la poda (generaciones greedy cortas) y recomienda ejecutar evaluaciones propias (HumanEval, GSM8K, MMLU) antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 62 GiB en disco. En una GPU de 96 GB, el modelo cabe con ~30+ GiB libres para KV-cache y contexto.
- GPU recomendadas: RTX PRO 6000 96GB (mencionada en la model card). Otras GPUs con 96 GB o mas serian adecuadas. En GPUs de 80 GB (A100, H100) no se garantiza que quepa con contexto largo.
- No cabe en GPUs de consumo de 24 GB (RTX 4090) ni en 48 GB (RTX 6000 Ada) debido al peso de los parametros.
- Opciones de despliegue: se documenta el uso con `transformers>=5.16` junto con `accelerate` y `compressed-tensors`. Para casos de VRAM limitada se sugiere `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` y `max_memory` con una carpeta de offload. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos por capa | Pesos en disco | VRAM en 96GB |
|---|---|---|---|---|
| Asilarkness/GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB | 94.006.009.118 | 80 | ~62 GiB | Cabe con ~30+ GiB libres |
| orcarouter/GLM-5.3-Flash-Uncensored-NVFP4 (base) | no disponible | 288 | ~177 GiB | No cabe |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible |

No se dispone de especificaciones completas de los modelos comparados, por lo que la comparacion se limita a los datos disponibles en la model card de la version podada.

## Limitaciones y advertencias

- El modelo es uncensored/abliterated, por lo que las salidas no estan filtradas y pueden incluir contenido inapropiado o no deseado.
- El expert pruning sacrifica conocimiento de dominios raros a cambio de tamano. Las capacidades de codigo, razonamiento y dialogo fueron priorizadas, pero el rendimiento en otras areas puede verse afectado.
- Solo se han realizado pruebas de humo tras la poda (generaciones greedy cortas). No hay evaluaciones exhaustivas publicadas, por lo que el rendimiento real en tareas como HumanEval, GSM8K o MMLU no esta verificado.
- La longitud de contexto no esta especificada en la informacion disponible, aunque el autor menciona que hay margen para contexto largo en una GPU de 96 GB.
- Los idiomas soportados son unicamente ingles y ruso segun la ficha. No se documenta soporte para otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los componentes originales.
- El despliegue requiere `transformers>=5.16`, `accelerate` y `compressed-tensors`. Otras plataformas de inferencia no estan documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/Asilarkness/GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB
- Modelo base: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-NVFP4
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo relacionado: https://huggingface.co/AIAgens/GLM-5.3-Flash-UNCENSORED-NVFP4
