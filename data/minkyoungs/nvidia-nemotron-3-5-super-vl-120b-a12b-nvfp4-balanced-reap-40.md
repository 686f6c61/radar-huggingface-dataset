# minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Balanced-REAP-40

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Balanced-REAP-40 es una variante podada del modelo multimodal NVIDIA Nemotron 3.5 Super VL de 120B (12B activos), publicada por el usuario minkyoungs en Hugging Face. El modelo base es una arquitectura MoE (mixture of experts) con capacidades de vision y lenguaje, cuantizada en NVFP4 por NVIDIA. Esta version aplica una poda no uniforme de expertos enrutados (REAP, expert pruning) eliminando el 40% de los mismos, lo que reduce el checkpoint de 70 GiB a 46 GiB sin reentrenamiento.

La relevancia de esta ficha radica en que documenta un caso de optimizacion de inferencia sobre un modelo de gran tamano: la poda selectiva de expertos permite reducir huella de memoria y coste de despliegue manteniendo los expertos criticos para coreano e ingles. El modelo conserva la naturaleza multimodal del original (vision-lenguaje) y esta pensado para servir con vLLM, aunque requiere un parche para soportar capas MoE con distinto numero de expertos.

El checkpoint resultante tiene 43.187.699.210 parametros totales segun safetensors, con 12.288 expertos enrutados frente a los 20.480 del original. La evaluacion de rendimiento esta en curso y el autor no ha publicado aun resultados de benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (vision-lenguaje), tag `nemotron_h_omni`, pesos NVFP4 (modelopt_mixed) |
| Parametros totales | 43.187.699.210 (safetensors) |
| Parametros activos | 12B (A12B, segun nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (8-bit mixto, modelopt_mixed); pesos del checkpoint original sin reentrenar |
| Idiomas soportados | no disponible (datos de calibracion en coreano e ingles) |
| Licencia | OPENMDW-1.1 (openmdw-1.1) |
| Formato de pesos | safetensors, custom_code, requiere `--trust-remote-code` |
| Expertos enrutados | 20.480 → 12.288 (poda del 40%) |
| Tamano del checkpoint | 70 GiB → 46 GiB (repo 49,6 GB) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con capacidades multimodales (vision y lenguaje), etiquetado con el identificador de arquitectura `nemotron_h_omni`. La variante aqui descrita no reentrena el modelo: parte del checkpoint NVFP4 original de NVIDIA y aplica una poda de expertos enrutados mediante REAP (expert pruning). Los expertos se puntuan con REAP sobre datos de calibracion en coreano e ingles, y por cada experto se toma el mayor de los dos scores normalizados, de modo que se conservan los expertos importantes para cualquiera de los dos idiomas.

La poda es no uniforme: las capas MoE se agrupan en 4 clusters segun su score medio de experto, cada cluster elimina la misma proporcion, y dentro de un cluster se eliminan expertos de 8 en 8 desde la capa cuyos siguientes 8 expertos de menor score suman el total mas bajo. Cada capa conserva al menos la media del cluster menos 16 y al menos el top-k del router. Las dos primeras y las dos ultimas capas MoE (capas 1, 3, 85 y 87) mantienen los 512 expertos completos. El numero de expertos por capa varia entre 272 y 512 (por ejemplo, 272 en las capas 10, 21, 41, 48, 52, 56, 59, 61, 63, 65 y 76; 312 en las capas 32 y 34; 512 en las capas 1, 3, 85 y 87). Los pesos del router de los expertos eliminados tambien se eliminan. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Nemotron 3.5 Super VL.
- Capacidades de vision-lenguaje: el modelo base es multimodal (`VL` en el nombre), por lo que se asume soporte de entrada de imagenes junto a texto.
- Capacidades multilingues: la calibracion de la poda se hizo en coreano e ingles, lo que sugiere soporte para ambos idiomas; el resto de idiomas no esta confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada; se heredaria del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Despliegue de un modelo multimodal de gran tamano en infraestructura limitada: la reduccion de 70 GiB a 46 GiB permite servir el modelo con menos memoria agregada que el checkpoint original, manteniendo los expertos criticos para coreano e ingles.
- Inferencia en produccion con vLLM: el modelo esta preparado para `vllm serve` con `--trust-remote-code` y `--tensor-parallel-size 2`, lo que facilita su integracion en pipelines de servicio existentes basados en vLLM.
- Procesamiento de documentos con imagenes y texto en entornos coreano-ingles: la calibracion bilingue de la poda preserva los expertos relevantes para ambos idiomas, adecuado para tareas de extraccion o resumen de documentos mixtos.
- Experimentacion en investigacion sobre poda de MoE: sirve como caso de estudio reproducible de REAP con poda no uniforme y distinto numero de expertos por capa, util para comparar tecnicas de compresion.
- Reduccion de coste de GPU en despliegues con tensor parallelism: al requerir menos memoria por checkpoint, puede desplegarse en configuraciones de 2 GPU de alta capacidad en lugar de configuraciones mayores.
- Evaluacion comparativa de calidad tras poda: util para medir la degradacion (o no) de un modelo multimodal al eliminar el 40% de expertos enrutados, una vez el autor publique los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y que los resultados se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 46 GiB de pesos en NVFP4 (tamano del checkpoint podado); el consumo real de VRAM en inferencia sera superior por estados de activacion, cache KV y overhead de vLLM.
- GPU recomendadas: el autor sugiere `--tensor-parallel-size 2`, lo que implica al menos 2 GPU con capacidad suficiente para alojar el checkpoint distribuido; no se especifican modelos concretos (A100, H100, etc.) en la informacion disponible.
- Cabe en consumer GPU: no confirmado; con 46 GiB de pesos no cabe en una unica GPU consumer de 24 GB (RTX 4090) sin cuantizacion adicional o sharding.
- Opciones de despliegue: vLLM 0.31.0 con un parche especifico para permitir capas MoE con distinto numero de expertos (`patch/apply_patch.py`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos enrutados | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (REAP-40) | 43.187.699.210 | 12.288 | no disponible | OPENMDW-1.1 | Poda del 40%, 46 GiB |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | no disponible (120B nominal) | 20.480 | no disponible | OPENMDW-1.1 | Modelo base sin podar, 70 GiB |
| Alternativas de mismo tamano/tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluacion de calidad tras la poda no esta publicada: se desconoce la degradacion real en benchmarks y en tareas de vision-lenguaje.
- La poda se calibro solo con datos en coreano e ingles; el rendimiento en otros idiomas puede degradarse de forma no medida.
- Requiere un parche no oficial de vLLM (v0.31.0) para soportar capas MoE con distinto numero de expertos; esto anade riesgo de mantenimiento y compatibilidad en produccion.
- El modelo usa `custom_code` y `--trust-remote-code`, lo que implica ejecutar codigo remoto; debe revisarse en entornos de seguridad estrictos.
- Licencia OPENMDW-1.1: es necesario revisar los terminos para uso comercial y las obligaciones de atribucion; el autor remite a la model card del modelo base para uso previsto, sesgos, seguridad y privacidad.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta variante podada; se heredan los del modelo base, no detallados en la informacion disponible.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se dispone de informacion sobre longitud de contexto, por lo que no puede garantizarse el comportamiento en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Balanced-REAP-40
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OPENMDW-1.1: https://openmdw.ai/license/1-1/
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
