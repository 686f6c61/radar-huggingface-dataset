# minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Balanced-REAP-20

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Balanced-REAP-20 es una variante podada del modelo multimodal Nemotron 3.5 Super VL de NVIDIA, publicada por el usuario minkyoungs. Se trata de un transformer de tipo Mixture-of-Experts (MoE) al que se le han eliminado el 20 % de los expertos enrutados mediante una tecnica de poda no uniforme denominada Balanced REAP. El resultado es un checkpoint mas pequeno (de 70 GiB a 58 GiB) sin reentrenamiento posterior.

El modelo parte del checkpoint oficial nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4, que ya venia cuantizado en NVFP4 (formato de 4 bits de NVIDIA). La poda reduce los expertos enrutados de 20.480 a 16.384, distribuidos de forma desigual por capa: entre 384 y 416 expertos en la mayoria de capas MoE, mientras que las cuatro capas MoE de los extremos (1, 3, 85 y 87) conservan los 512 originales. El checkpoint resultante tiene 54.478.769.674 parametros reales en safetensors.

Su relevancia es doble: por un lado, demuestra una estrategia de compresion de modelos MoE basada en la importancia de los expertos por idioma; por otro, permite desplegar un modelo de gran tamano en menos VRAM. La contrapartida es que requiere un parche especifico sobre vLLM 0.31.0 para soportar capas MoE con distinto numero de expertos, y que el autor aun no ha publicado resultados de evaluacion comparativos con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, clase `nemotron_h_omni` |
| Parametros totales | 54.478.769.674 (checkpoint podado) |
| Parametros activos | no disponible (el checkpoint base se denomina A12B, pero no se detalla el conteo activo tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); tag `8-bit` y `modelopt_mixed` en el repo |
| Idiomas soportados | no disponible (calibracion de poda en coreano e ingles) |
| Licencia | openmdw-1.1 (OPENMDW-1.1) |
| Formato de pesos | safetensors (con codigo personalizado, `custom_code`) |

## Arquitectura y entrenamiento

El modelo es una variante podada del Nemotron 3.5 Super VL de NVIDIA, un transformer MoE multimodal. La innovacion principal de esta publicacion no es el entrenamiento, sino la poda: se puntuan los expertos con REAP sobre datos de calibracion en coreano e ingles, y para cada experto se toma la mayor de las dos puntuaciones normalizadas, de modo que se conservan los expertos importantes para cualquiera de los dos idiomas. La eliminacion es no uniforme: las capas MoE se agrupan en 4 clusters segun su puntuacion media de experto, cada cluster elimina la misma proporcion y, dentro de un cluster, se eliminan expertos de 8 en 8 desde la capa cuyos siguientes 8 expertos con menor puntuacion suman menos. Cada capa conserva al menos la media del cluster menos 16 y al menos el top-k del router. Tambien se eliminan los pesos del router de los expertos suprimidos.

No hay reentrenamiento ni ajuste fino posterior a la poda: se conservan los pesos NVFP4 del checkpoint original. El modelo requiere un parche sobre vLLM 0.31.0 para permitir que distintas capas MoE tengan distinto numero de expertos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Nemotron 3.5 Super VL subyacente.
- Capacidades multimodales (VL): el nombre del modelo base indica soporte de vision-lenguaje.
- Procesamiento multilingue: la calibracion de la poda cubre coreano e ingles, lo que sugiere competencia en ambos idiomas, aunque no se detalla la lista completa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo MoE de gran tamano con VRAM reducida: la poda del 20 % de expertos reduce el checkpoint de 70 GiB a 58 GiB, lo que facilita el servicio en configuraciones de GPU mas ajustadas manteniendo la mayor parte de la capacidad del modelo original.
- Investigacion sobre poda de expertos: sirve como referencia reproducible para estudiar el impacto de REAP no uniforme en modelos MoE multimodales, comparando el rendimiento frente al checkpoint original.
- Servicio multimodal en produccion con vLLM: una vez aplicado el parche a vLLM 0.31.0, se puede servir con `vllm serve` y paralelismo tensorial (por ejemplo, `--tensor-parallel-size 2`), integrandose en pipelines de inferencia existentes.
- Procesamiento de documentos e imagenes en coreano e ingles: la calibracion bilingue de la poda preserva los expertos relevantes para ambos idiomas, lo que resulta adecuado para tareas de comprension de documentos en esas lenguas.
- Evaluacion comparativa de tecnicas de compresion: util para equipos que comparan poda de expertos frente a cuantizacion o destilacion en terminos de calidad, latencia y huella de memoria.
- Experimentacion academica con modelos MoE de codigo abierto: la licencia OPENMDW-1.1 y la disponibilidad de `pruning_info.json` permiten auditar que expertos se conservaron y por que.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y que los resultados se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 58 GiB en NVFP4, por lo que se necesita al menos esa cantidad de memoria, mas overhead de activaciones y KV cache.
- GPU recomendadas: no se especifican en la informacion proporcionada; el ejemplo de despliegue usa `--tensor-parallel-size 2`, lo que implica al menos dos GPU de capacidad suficiente (por ejemplo, H100 o A100 de 80 GB).
- ¿Cabe en GPU consumer? No hay datos que lo confirmen; 58 GiB de pesos superan la VRAM de las GPU consumer habituales (24 GB en RTX 4090), por lo que no cabria en una sola unidad consumer.
- Opciones de despliegue: vLLM 0.31.0 con el parche incluido en el repositorio (`patch/apply_patch.py`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (REAP-20) | 54.478.769.674 | no disponible | NVFP4 | openmdw-1.1 | 16.384 expertos enrutados, requiere parche vLLM |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | no disponible (checkpoint de 70 GiB) | no disponible | NVFP4 | openmdw-1.1 | Modelo base sin podar, 20.480 expertos enrutados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La poda elimina el 20 % de los expertos sin reentrenamiento, por lo que puede degradar capacidades respecto al modelo original; el autor aun no ha publicado la evaluacion comparativa.
- Requiere un parche no oficial sobre vLLM 0.31.0 para soportar capas MoE con distinto numero de expertos; esto anade riesgo operativo y de mantenimiento en produccion.
- La calibracion de la poda se realizo solo en coreano e ingles, por lo que el rendimiento en otros idiomas puede verse mas afectado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original (NVIDIA); se trata de una modificacion de terceros.
- Riesgo de alucinacion y sesgos: no se detallan en la informacion proporcionada; se remite a la model card del modelo base para las notas de uso previsto, limitaciones, sesgo, seguridad y privacidad.
- Licencia OPENMDW-1.1: debe revisarse el texto completo para confirmar las condiciones de uso comercial y las obligaciones de atribucion.
- El pipeline no esta definido en Hugging Face y los idiomas soportados no estan declarados formalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Balanced-REAP-20
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OPENMDW-1.1: https://openmdw.ai/license/1-1/
- vLLM: https://github.com/vllm-project/vllm
