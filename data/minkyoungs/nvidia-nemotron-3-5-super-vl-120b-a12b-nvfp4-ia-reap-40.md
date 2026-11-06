# minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40 es una variante podada del modelo multimodal Nemotron 3.5 Super VL de NVIDIA, publicada por el usuario minkyoungs. Se trata de un transformer de tipo Mixture-of-Experts (MoE) al que se le han eliminado el 40 % de los expertos enrutados mediante una tecnica de poda no uniforme denominada IA-REAP (instruction-aware REAP), sin reentrenamiento posterior. El checkpoint resultante conserva los pesos originales en formato NVFP4 y reduce el tamano de 70 GiB a 46 GiB.

El modelo mantiene la arquitectura original de 120B parametros nominales con aproximadamente 12B activos por token, pero rebaja el numero de expertos enrutados de 20.480 a 12.288. Los expertos se distribuyen de forma no uniforme entre las 40 capas MoE: las capas 1, 3, 85 y 87 conservan los 512 expertos originales, mientras que el resto queda entre 272 y 312 segun la capa.

La relevancia de esta ficha radica en que ejemplifica una estrategia de compresion de modelos MoE de gran escala orientada a reducir requisitos de memoria y coste de despliegue, manteniendo presumiblemente gran parte de la capacidad del modelo base. No obstante, la evaluacion de rendimiento esta pendiente de publicacion por parte del autor, por lo que cualquier afirmacion sobre la perdida de calidad debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, clase `nemotron_h_omni` |
| Parametros totales | 43.187.699.210 (dato real de safetensors) |
| Parametros activos | Aproximadamente 12B (heredado del modelo base A12B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (8-bit, `modelopt_mixed`); no se documentan otras variantes |
| Idiomas soportados | No disponibles oficialmente; el proceso de poda uso datos de calibracion en coreano e ingles |
| Licencia | OPENMDW-1.1 (`license: other`) |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal de la familia Nemotron 3.5 Super VL. La arquitectura original cuenta con 40 capas MoE y 512 expertos enrutados por capa, lo que da un total de 20.480 expertos enrutados. Tras la poda IA-REAP quedan 12.288 expertos (40 % menos). Las capas 1, 3, 85 y 87 mantienen los 512 expertos; el resto oscila entre 272 y 312 expertos por capa. Los pesos del router correspondientes a los expertos eliminados tambien se han suprimido.

El metodo de poda combina dos senales. Primero, cada experto se puntua con REAP sobre datos de calibracion en coreano e ingles, conservando el mayor de los dos scores normalizados. Despues, el score se ajusta por el incremento de la cuota de enrutamiento del experto cuando se anade un system prompt que fuerza la respuesta en el idioma del usuario, de modo que se preservan preferentemente los expertos implicados en el seguimiento del idioma. El numero de expertos a eliminar por capa se decide a partir de los scores sin ajustar: las capas MoE se agrupan en 4 clusters segun su score medio, cada cluster elimina la misma proporcion, y dentro de cada cluster se van quitando bloques de 8 expertos de la capa cuyo siguiente bloque de 8 expertos de menor score sume menos puntuacion total. Cada capa conserva al menos la media del cluster menos 16 y al menos el top-k del router.

No hay reentrenamiento ni ajuste fino posterior a la poda: los pesos conservados son los del checkpoint NVFP4 original. El autor indica que la evaluacion del rendimiento esta en curso y que los resultados se anadiran a la model card.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Nemotron 3.5 Super VL, aunque no se documentan evaluaciones especificas tras la poda.
- Procesamiento multimodal: la nomenclatura "VL" y la clase `nemotron_h_omni` indican soporte de entrada visual ademas de texto, si bien no se detallan modalidades exactas en la informacion disponible.
- Capacidades multilingues: el proceso de poda se calibro en coreano e ingles y se priorizaron expertos sensibles al idioma del usuario, lo que sugiere cierto soporte para seguir instrucciones de idioma; no se publica una lista oficial de idiomas.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en infraestructura con memoria limitada: la reduccion de 70 GiB a 46 GiB permite servir el modelo con menos GPUs o con GPUs de menor VRAM que las necesarias para el checkpoint original, manteniendo la cuantizacion NVFP4.
- Inferencia multimodal en produccion: al conservar la naturaleza vision-lenguaje del modelo base, puede emplearse en tareas de descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de documentos, siempre que se valide la calidad tras la poda.
- Asistentes conversacionales multilingues: la poda priorizo expertos implicados en seguir el idioma del usuario, lo que lo hace candidato para chatbots que deban respetar el idioma de la consulta en entornos coreano-ingles.
- Servicio con vLLM y tensor parallelism: el autor documenta el despliegue con `vllm serve ... --tensor-parallel-size 2`, lo que encaja en pipelines de inferencia de alto throughput sobre 2 GPUs.
- Investigacion sobre compresion de MoE: sirve como caso de estudio reproducible de poda no uniforme de expertos con criterios instruction-aware, util para grupos que investiguen eficiencia en modelos dispersos.
- Prototipado y evaluacion interna: al tener licencia OPENMDW-1.1 y pesos abiertos, permite experimentar en entornos controlados antes de decidir si migrar al modelo original sin podar.
- Fine-tuning ligero posterior: aunque no se documenta, el checkpoint podado puede servir de base para ajustes especificos, con la ventaja de requerir menos memoria que el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y que los resultados se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 49,6 GB y el checkpoint pesa 46 GiB en NVFP4; se necesita al menos esa cantidad de memoria agregada, mas overhead de activaciones y KV cache.
- GPUs recomendadas: el autor documenta `--tensor-parallel-size 2`, lo que sugiere un minimo de 2 GPUs con suficiente VRAM cada una (por ejemplo, 2x H100 80 GB o 2x A100 80 GB); no se especifican modelos exactos.
- Cabe en GPU de consumo: no disponible; con 46 GiB de pesos en NVFP4 no es viable en GPUs consumer de 24 GB sin tecnicas adicionales no documentadas.
- Opciones de despliegue: vLLM 0.31.0 con un parche especifico que permite capas MoE con distinto numero de expertos (`patch/apply_patch.py`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40 | 43,19B (safetensors) | 12.288 | No disponible | OPENMDW-1.1 | Hugging Face (minkyoungs) |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (base) | ~120B nominales, ~12B activos | 20.480 | No disponible | OPENMDW-1.1 | Hugging Face (nvidia) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La evaluacion de rendimiento esta pendiente: no hay datos que cuantifiquen la perdida de calidad tras eliminar el 40 % de los expertos.
- Requiere un parche no oficial de vLLM (version 0.31.0) para soportar capas MoE con distinto numero de expertos; esto anade complejidad operativa y riesgo de incompatibilidad con futuras versiones.
- El modelo usa `custom_code` y exige `--trust-remote-code`, lo que implica ejecutar codigo del repositorio y debe revisarse antes de usarlo en produccion.
- La poda se calibro solo con datos en coreano e ingles; el comportamiento en otros idiomas no esta documentado y podria degradarse.
- Riesgo de sesgos y alucinaciones: no documentado especificamente para esta variante; se remite a las notas del modelo base.
- Licencia OPENMDW-1.1: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar tipo Apache 2.0.
- El autor del repositorio no es NVIDIA; se trata de una modificacion de terceros, sin garantias oficiales de soporte ni mantenimiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-40
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OPENMDW-1.1: https://openmdw.ai/license/1-1/
