# minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40-PIE

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40-PIE es una variante podada del modelo multimodal MoE nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4, publicada por el usuario minkyoungs en Hugging Face. La modificacion consiste en la eliminacion del 40 % de los expertos enrutados mediante una tecnica de poda no uniforme denominada IA-REAP (instruction-aware REAP), que combina la puntuacion clasica REAP sobre datos de calibracion en coreano e ingles con un ajuste que favorece a los expertos cuya cuota de enrutamiento aumenta cuando se antepone un system prompt de obediencia linguistica.

El checkpoint original pasa de 70 GiB a 46 GiB sin reentrenamiento posterior, manteniendo los pesos en formato NVFP4 (cuantizacion de 4 bits de NVIDIA). El numero de expertos por capa MoE deja de ser uniforme: oscila entre 272 y 312 en la mayoria de capas, mientras que las capas 1, 3, 85 y 87 conservan los 512 originales. Esta heterogeneidad obliga a aplicar un parche a vLLM 0.31.0 para permitir que distintas capas MoE tengan distinto numero de expertos.

El modelo es relevante para quienes necesitan desplegar el Nemotron multimodal de 120B en hardware mas modesto reduciendo el coste de memoria y de computo de los expertos, a cambio de asumir un pipeline de despliegue no estandar (parche de vLLM) y de carecer, de momento, de resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag `nemotron_h_omni`), pesos NVFP4 |
| Parametros totales | 120B (nominal del modelo base); no disponible el recuento exacto tras la poda |
| Parametros activos | 12B (nominal A12B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); mezcla `modelopt_mixed` |
| Idiomas soportados | no disponible en la model card; calibracion de la poda en coreano e ingles |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) multimodal de la familia Nemotron, con 120B parametros totales y 12B activos por token. Esta variante no reentrena: parte del checkpoint NVFP4 original y aplica una poda estructurada de expertos. El numero de expertos enrutados baja de 20.480 a 12.288, distribuidos de forma no uniforme entre las 40 capas MoE listadas (272, 280, 288, 296, 304, 312 o 512 expertos por capa). Las cuatro capas extremas (1, 3, 85, 87) conservan los 512 expertos originales.

El metodo IA-REAP puntua cada experto con REAP sobre datos de calibracion en coreano e ingles, conservando el mayor de los dos scores normalizados. A esa puntuacion se le aplica un ajuste basado en cuanto sube la cuota de enrutamiento del experto cuando se antepone un system prompt que fuerza al modelo a responder en el idioma del usuario, de modo que se preservan preferentemente los expertos implicados en el seguimiento linguistico. El numero de expertos a eliminar por capa se fija a partir de los scores sin ajustar: las capas MoE se agrupan en 4 clusters segun su score medio, cada cluster elimina la misma proporcion y, dentro de cada cluster, se eliminan expertos de 8 en 8 empezando por la capa cuyos siguientes 8 expertos peor puntuados suman menos. Cada capa conserva al menos la media del cluster menos 16 expertos y al menos el top-k del router. Tambien se eliminan los pesos del router correspondientes a los expertos podados.

No se documenta en la model card informacion sobre datos de entrenamiento del modelo base, composicion del dataset, RLHF/DPO ni innovaciones de inferencia mas alla del propio esquema de poda.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Nemotron 3.5 Super VL.
- Capacidades de vision (VL): el modelo base es multimodal; esta variante conserva la torre visual y los pesos no podados.
- Mezcla de expertos con 12B parametros activos: inferencia mas barata por token que un denso de 120B.
- Soporte de tool calling y function calling: no confirmado explicitamente en la model card de esta variante; disponible en el modelo base segun su documentacion.
- Razonamiento multi-paso y uso como agente: no confirmado en la informacion disponible para esta variante.
- Capacidades multilingues: la calibracion de la poda se hizo en coreano e ingles y se preservaron expertos asociados al seguimiento del idioma del usuario; el conjunto exacto de idiomas soportados no esta disponible.
- Capacidad especial: pesos en NVFP4 listos para servir con vLLM 0.31.0 parcheado.

## Casos de uso

- Despliegue de un MoE multimodal de 120B en 2 GPU: el checkpoint de 46 GiB permite servirlo con `--tensor-parallel-size 2` en GPUs de 80 GB, reduciendo el requisito de memoria frente a los 70 GiB del original.
- Serving de vision-lenguaje en produccion: al conservar la torre visual y los pesos NVFP4, puede usarse para tareas de descripcion de imagenes, VQA o extraccion de informacion de documentos con el mismo stack de vLLM.
- Reduccion de coste de inferencia en entornos con presupuesto de VRAM ajustado: el recorte del 40 % de expertos enrutados disminuye el peso del checkpoint y, previsiblemente, el trafico de expertos, aunque no hay cifras publicadas de throughput.
- Investigacion sobre poda de MoE: el repo incluye `pruning_info.json` con los ids de expertos conservados y el reparto por capa, util para reproducir o comparar estrategias REAP frente a IA-REAP.
- Experimentacion con vLLM no estandar: el parche incluido (`apply_patch.py`) permite estudiar el soporte de capas MoE con distinto numero de expertos, un caso no cubierto por vLLM de serie.
- Evaluacion comparativa de calidad tras poda: sirve como baseline para medir la perdida de rendimiento frente al Nemotron NVFP4 original una vez se publiquen las evaluaciones.
- Fine-tuning o destilacion posteriores: al ser un checkpoint safetensors con `custom_code`, puede cargarse con Transformers para experimentos de recuperacion de capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y que los resultados se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 46 GiB solo para pesos en NVFP4; hay que sumar KV cache, activaciones y overhead de vLLM.
- Configuracion recomendada: 2 GPU con tensor parallelism (`--tensor-parallel-size 2`), por ejemplo 2x H100 80 GB, 2x A100 80 GB o 2x H200.
- No cabe en una unica GPU consumer (RTX 4090 24 GB, RTX 5090 32 GB) por el tamano del checkpoint y la necesidad de tensor parallelism.
- Opciones de despliegue: vLLM 0.31.0 con el parche de `patch/apply_patch.py` y `--trust-remote-code`. No se documenta soporte para llama.cpp, Ollama ni TGI, y el formato NVFP4 limita las alternativas.
- Latencia y throughput: no disponibles; dependen del hardware y de la distribucion irregular de expertos por capa.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (IA-REAP-40) | 120B nominal, podado | 12B nominal | no disponible | NVFP4 | OpenMDW-1.1 | 12.288 expertos enrutados, requiere parche vLLM |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | 120B | 12B | no disponible | NVFP4 | OpenMDW-1.1 | 20.480 expertos, 70 GiB, sin parche |
| Nemotron 3.5 Super VL en otros formatos (BF16/FP8) | 120B | 12B | no disponible | BF16/FP8 | OpenMDW-1.1 | Mayor huella de memoria; no disponible en la informacion proporcionada |

La comparativa con modelos de otros fabricantes del mismo rango (por ejemplo MoE multimodales de 100B-150B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La poda elimina el 40 % de los expertos sin reentrenamiento: es esperable cierta perdida de calidad, pero no se han publicado metricas que la cuantifiquen.
- El despliegue requiere parchear vLLM 0.31.0; versiones distintas o actualizaciones de vLLM pueden romper la compatibilidad.
- La distribucion no uniforme de expertos por capa no esta soportada de serie por vLLM ni por la mayoria de frameworks; limita portabilidad a llama.cpp, TGI u otros.
- El formato NVFP4 esta orientado a GPUs NVIDIA recientes; no es portable a hardware sin soporte de ese tipo de cuantizacion.
- La calibracion de la poda se hizo en coreano e ingles; el rendimiento en otros idiomas, incluido el castellano, no esta documentado y podria degradarse.
- La model card no documenta sesgos, riesgos de alucinacion ni notas de seguridad propias; remite a la del modelo base.
- Licencia OpenMDW-1.1: es necesario revisar sus terminos antes de uso comercial; no es una licencia permisiva tipo Apache 2.0.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- El tag `region:us` y la ausencia de pipeline declarado indican que la model card no esta completa para uso directo con `pipeline()`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40-PIE
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- vLLM: https://github.com/vllm-project/vllm
