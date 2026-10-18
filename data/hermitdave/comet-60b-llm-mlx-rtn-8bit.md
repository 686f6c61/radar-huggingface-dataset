# hermitdave/Comet-60B-LLM-MLX-rtn-8bit

## Resumen

Comet-60B-LLM-MLX-rtn-8bit es una cuantización uniforme a 8 bits del backbone LLM Comet 60B (arquitectura Nemotron-H), publicada por el usuario hermitdave. El modelo base, desarrollado por MultiverseComputingCAI, es un transformer híbrido que combina capas Mamba2, capas MoE y un pequeño bloque de capas de atención clásica, con 58.886.599.680 parámetros totales (~58,9 B) repartidos en 88 capas. La nomenclatura del checkpoint original, «A12B», sugiere del orden de 12 B de parámetros activos por token, aunque ese dato no se confirma explícitamente en la información disponible.

El interés de esta publicación no está en el modelo en sí, sino en el proceso: se ha generado en un Apple Silicon M3 Max con 64 GB de memoria unificada mediante cuantización RTN por streaming con lectura de safetensors mapeada en memoria, emitiendo varias recetas de cuantización en una sola pasada sobre el checkpoint BF16. El resultado es un artefacto de ~58 GB (62,6 GB de repositorio) que reduce aproximadamente a la mitad el peso del original y permite ejecutar un modelo MoE de ~59 B en hardware de consumo de Apple, algo imposible con los pesos BF16.

Es relevante para desarrolladores que trabajan en inferencia local sobre macOS: el formato es MLX puro, con pesos lineales a 8 bits (group size 64, modo affine, ~8,5 bits por peso) y conv1d, routers MoE y RMSNorm conservados en BF16. El modelo es solo texto, solo inglés, y no cuenta todavía con validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida: Mamba2 + MoE + atención (88 capas: 40 Mamba2, 40 MoE, 8 de atención) |
| Parametros totales | 58.886.599.680 (~58,9 B) |
| Parametros activos | ~12 B según la nomenclatura «A12B» del modelo base (no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits RTN uniforme, group size 64, modo affine, ~8,5 bits por peso; conv1d, gates de router MoE y RMSNorm en BF16 |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW-1.1 (etiquetada como «other» en los metadatos de HuggingFace) |
| Formato de pesos | safetensors cuantizados para MLX (librería mlx) |
| Expertos enrutados | 256 por capa MoE |
| Tamano del artefacto | ~58 GB de pesos; 62,6 GB de repositorio |
| Modelo base | MultiverseComputingCAI/Comet_60B_A12B_BF16 |
| Metodo de cuantizacion | Streaming multi-quantization sobre lector safetensors mapeado en memoria, en Apple M3 Max de 64 GB |

## Arquitectura y entrenamiento

La arquitectura es nemotron_h, un diseño híbrido que intercala 40 capas Mamba2 (modelo de espacio de estados) con 40 capas de mezcla de expertos y solo 8 capas de atención clásica. Cada capa MoE contiene 256 expertos enrutados, lo que explica la enorme diferencia entre parámetros totales (~58,9 B) y activos (~12 B estimados por la nomenclatura). La combinación busca el coste lineal de Mamba2 en secuencias largas junto con la capacidad de representación de los expertos, reservando la atención cuadrática para unas pocas capas. No se dispone de información sobre la dimensión oculta, el número de cabezas, el tamaño de estado de Mamba2 ni la estrategia de enrutamiento (top-k) en la documentación proporcionada.

Sobre el entrenamiento del modelo base no hay ningún dato en la información disponible: ni número de tokens, ni composición del corpus, ni si hubo RLHF, DPO o alguna fase de razonamiento. La model card del artefacto cuantizado solo documenta el proceso de compresión: una pasada de cuantización RTN (round-to-nearest) con group size 64 en modo affine sobre todos los pesos lineales, manteniendo en BF16 las convoluciones 1D, las puertas del router y las normalizaciones RMSNorm, que son especialmente sensibles a la cuantización. El trabajo se realizó con Hermes Agent sobre un M3 Max de 64 GB mediante lectura en streaming del checkpoint BF16.

## Capacidades

- Generación de texto conversacional en inglés: el pipeline declarado es text-generation con etiqueta conversational.
- Razonamiento y conocimiento general heredados del modelo base Comet 60B, sin datos publicados de evaluación.
- Eficiencia en secuencias largas por el uso mayoritario de capas Mamba2 (coste lineal), aunque la longitud de contexto soportada no está documentada.
- Capacidad de representación alta por el componente MoE de 256 expertos por capa, con ~12 B de parámetros activos estimados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según los metadatos; no se declaran otros idiomas.
- Visión o audio: no disponible; el modelo es exclusivamente de texto.
- Modo «thinking» explícito: no disponible en la información proporcionada.
- Ejecución nativa en Apple Silicon mediante MLX, incluyendo memoria unificada.

## Casos de uso

- Asistente conversacional local en macOS: un estudio o un particular puede servir un modelo de ~59 B con calidad potencialmente alta en un Mac Studio o MacBook con 64 GB o más de memoria unificada, sin depender de la nube ni de GPUs dedicadas.
- Prototipado y evaluación de arquitecturas híbridas Mamba2-MoE: útil para investigadores que quieran medir el comportamiento real de un modelo nemotron_h sin descargar ni ejecutar el checkpoint BF16 completo.
- Generación de documentación técnica en inglés: redacción de READMEs, guías y comentarios de API dentro de un pipeline local, con la ventaja de no enviar código propietario a terceros.
- Procesamiento por lotes de textos largos en local: la proporción de capas Mamba2 (40 de 88) reduce el coste por token en secuencias extensas, lo que favorece tareas de resumen o reescritura de documentos de forma offline.
- Base para comparativas de degradación por cuantización: al existir el original en BF16, sirve para medir empíricamente la pérdida de calidad de un esquema RTN 8 bits frente al checkpoint completo en tareas de razonamiento y generación.
- Experimentación con MLX y mlx-lm: referencia práctica para desarrolladores que escriben tooling de cuantización o de carga de modelos MoE en Apple Silicon con memoria limitada.
- Filtrado y clasificación de textos en inglés autoalojados: despliegue en entornos con requisitos de soberanía de datos donde no se permite la inferencia en servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco hay datos de latencia o throughput medidos más allá de la mención al hardware usado para cuantizar (M3 Max, 64 GB).

## Requisitos de hardware

- VRAM/memoria para inferencia: los pesos ocupan ~58 GB, por lo que se necesitan al menos 64 GB de memoria unificada en Apple Silicon para cargarlos con margen para KV cache y activaciones; 96-128 GB son recomendables para contextos largos.
- GPU dedicadas: en formato MLX el modelo solo se ejecuta en Apple Silicon. Para servirlo en CUDA habría que reconvertir desde el checkpoint BF16 original, lo que exige al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o sharding multi-GPU.
- GPU de consumo: no cabe en ninguna GPU consumer de 24 GB (RTX 4090, 3090) ni en una de 48 GB. Solo es viable en equipos Apple con memoria unificada de 64 GB o superior (M3/M4 Max, M2/M3 Ultra).
- Opciones de despliegue: mlx-lm y el ecosistema MLX son las vías naturales. vLLM, TGI, llama.cpp u Ollama requerirían partir del modelo base BF16 y cuantizar en otro formato (GGUF, AWQ, FP8).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, la generación será limitada por ancho de banda de memoria, típico en inferencia local de modelos MoE grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| hermitdave/Comet-60B-LLM-MLX-rtn-8bit | 58,9 B totales (~12 B activos, estimado) | safetensors MLX, 8 bits RTN | ~58 GB | no disponible | OpenMDW-1.1 | Solo Apple Silicon, solo inglés |
| MultiverseComputingCAI/Comet_60B_A12B_BF16 | 58,9 B totales (~12 B activos, estimado) | safetensors BF16 | no disponible (previsiblemente ~118 GB) | no disponible | no disponible en la información | Checkpoint de referencia sin cuantizar |
| Otros modelos MoE de ~60 B | no disponible | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento de ninguno de los dos modelos, por lo que la comparación se limita a parámetros, formato, tamaño y licencia.

## Limitaciones y advertencias

- Solo inglés: los metadatos declaran únicamente «en»; no hay soporte multilingüe verificado y el rendimiento en castellano sería probablemente deficiente.
- Sin benchmarks: no existe ninguna evaluación publicada de este artefacto ni del modelo base en la información disponible, por lo que no se puede afirmar nada sobre su calidad real.
- Degradación por cuantización: el esquema RTN de 8 bits con group size 64 es más agresivo que una cuantización con calibración; se espera cierta pérdida frente al BF16 original, no medida.
- Riesgo de alucinación: inherente a cualquier LLM de esta familia; sin datos de evaluación no se puede acotar su magnitud.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica previa.
- Licencia OpenMDW-1.1: es una licencia de modelo abierto, pero conviene revisar sus términos exactos (https://openmdw.ai/license/1-1/) antes de un uso comercial; los metadatos de HuggingFace la etiquetan genéricamente como «other».
- Dependencia de plataforma: el formato MLX limita la inferencia a Apple Silicon; no es portable a CUDA sin reconversión.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, publicada el 2026-10-18; no hay reportes independientes de funcionamiento ni de calidad.
- Trazabilidad del proceso: la cuantización la firma una herramienta automatizada (Hermes Agent) sobre una máquina de 64 GB, sin scripts de reproducción ni receta publicada más allá de los parámetros indicados.
- Uso responsable: sin filtros de seguridad documentados ni evaluación de sesgos, no es recomendable desplegarlo de cara al usuario final sin capas adicionales de moderación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Comet-60B-LLM-MLX-rtn-8bit
- Modelo base (Comet 60B BF16): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Hermes Agent (herramienta de cuantización citada por el autor): https://hermes-agent.nousresearch.com
- Paper, blog o repositorio del modelo base: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo, por lo que no se han incluido enlaces externos adicionales.
