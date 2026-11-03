# mrysh/qwen3.5-4b-prune_width_ffn30

## Resumen

qwen3.5-4b-prune_width_ffn30 es una version podada por anchura del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado cuyo objetivo es servir como pieza de un benchmark de poda: el autor compara cuatro modelos base con ocho variantes de poda entre si y frente a cuantizacion, evaluando en BFCL, un conjunto de sesgo en contratacion y MedQA con vLLM.

La intervencion consiste en reducir el tamano de la FFN de cada capa de 9216 a 6464 neuronas (una reduccion solicitada del 30 %, efectiva del 16,1 % de los parametros del modelo de lenguaje y del 17,1 % del checkpoint completo), manteniendo intacto el numero de capas. La importancia de las neuronas se midio sobre un conjunto de calibracion de 512 muestras mixtas. El checkpoint resultante tiene 3.862.934.016 parametros y ocupa 7,7 GB en safetensors.

Es relevante ahora porque documenta de forma transparente el coste en calidad de una poda de anchura sin destilacion ni fine-tuning posterior, un escenario habitual cuando se quiere reducir el coste de inferencia de un modelo multimodal pequeno. El autor advierte explicitamente de que debe esperarse una caida de calidad frente al modelo base, y el benchmark existe precisamente para medirla. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (poda de anchura en FFN); detalles completos de la arquitectura base no disponibles |
| Parametros totales | 3.862.934.016 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara variantes de poda frente a cuantizacion, pero no se listan formatos soportados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica poda de anchura con NVIDIA ModelOpt Minitron (version 0.46.0rc1). Concretamente, la dimension de la FFN de cada capa se reduce de 9216 a 6464, lo que corresponde a un 30 % solicitado y a una reduccion efectiva del 16,1 % de los parametros del modelo de lenguaje. El numero de capas no se modifica. La seleccion de neuronas a eliminar se basa en una medida de importancia calculada sobre un conjunto de calibracion de 512 muestras mixtas.

No se realizo destilacion ni fine-tuning despues de la poda, de modo que el checkpoint conserva los pesos del modelo base en las partes no podadas y pierde capacidad alli donde se han eliminado neuronas. Los bloques de vision y audio del modelo base, si los tiene, se mantienen sin cambios y solo se poda la parte de lenguaje. La herramienta de poda elimina ademas la cabeza de prediccion multi-token de Qwen3.5. En el benchmark se evalua como modelo de texto con vLLM y el modo thinking desactivado.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base, con la degradacion esperable tras una poda sin recuperacion.
- Procesamiento de codigo y matematicas en la medida en que lo soporte el modelo base; no se documentan resultados especificos.
- Capacidades multimodales potenciales si el modelo base las tiene: los bloques de vision y audio se conservan intactos, aunque el benchmark solo evalua texto.
- Tool calling y function calling: el modelo se evalua en BFCL, lo que indica que el autor considera relevante esta capacidad, pero no se publican los resultados en la informacion disponible.
- Razonamiento multi-paso y uso como agente: no documentado de forma especifica para esta variante.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Modo thinking: existe en el modelo base, pero esta variante se evalua con thinking desactivado y la cabeza de prediccion multi-token fue eliminada por la herramienta de poda.

## Casos de uso

- Benchmark de poda y cuantizacion: el uso principal declarado es servir como una de las ocho variantes de poda del benchmark del autor, comparando su rendimiento en BFCL, sesgo en contratacion y MedQA frente a otras variantes y frente a modelos cuantizados con vLLM.
- Investigacion sobre compresion de modelos: util para estudiar como afecta una reduccion del 16,1 % de parametros en la FFN a tareas de tool calling y razonamiento clinico, sin confundir el efecto con el de un fine-tuning posterior.
- Evaluacion de sesgo en contratacion: el checkpoint forma parte de un conjunto de pruebas disenado para medir sesgo en decisiones de seleccion de personal, lo que permite analizar si la poda amplifica o atenua ese sesgo.
- Punto de partida para destilacion o recuperacion: al no haberse recuperado tras la poda, es un candidato natural para experimentos de fine-tuning o destilacion que midan cuanto de la perdida es recuperable.
- Despliegue de bajo coste en entornos de prueba: con 3.862.934.016 parametros y pesos en safetensors, puede servir para validar pipelines de inferencia con vLLM antes de pasar al modelo base completo.
- Analisis de robustez en QA medico: su evaluacion en MedQA permite usarlo como referencia de cuanto degrada la poda de anchura en dominios de alto riesgo, siempre como objeto de estudio y no como sistema de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo se evalua en BFCL, un conjunto de sesgo en contratacion y MedQA con vLLM, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7,7 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, del orden de 10-12 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2 GB. No se confirman formatos de cuantizacion soportados para esta variante.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cabe en GPUs de consumo con 12 GB o mas en BF16 (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de datacenter como A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en BF16 en tarjetas con 12 GB o mas, y con mas holgura si se cuantiza.
- Opciones de despliegue: el autor evalua con vLLM. Otros runners como llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-4b-prune_width_ffn30 | 3.862.934.016 | no disponible | Apache 2.0 | Variante podada en anchura de FFN, sin recuperacion posterior |
| Qwen/Qwen3.5-4B | no disponible en la informacion proporcionada | no disponible | Apache 2.0 | Modelo base; referencia de calidad frente a la que se mide la poda |
| Otras variantes del benchmark del autor | no disponible | no disponible | no disponible | El autor menciona 4 modelos x 8 variantes de poda, sin detallar cuales |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de calidad esperada: el autor advierte explicitamente de que no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento es inferior al del modelo base.
- Perdida de la cabeza de prediccion multi-token: la herramienta de poda la elimina, lo que puede afectar a funcionalidades del modelo base que dependan de ella.
- Evaluacion limitada a texto: el benchmark se ejecuta como modelo de texto con vLLM y thinking desactivado; el comportamiento multimodal no esta validado.
- Idiomas no declarados: la model card no especifica idiomas soportados, por lo que no hay garantia de cobertura multilingue mas alla de la del modelo base.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es previsible que aumente respecto al modelo base al reducirse la capacidad de la FFN.
- Sesgos: el propio benchmark incluye una prueba de sesgo en contratacion, lo que sugiere que el autor considera relevante medir este aspecto; no se publican resultados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero se recomienda revisar la model card del modelo base para condiciones adicionales.
- Madurez: checkpoint con cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia; no debe tratarse como un artefacto estable de produccion.
- No apto para dominios de alto riesgo sin validacion: su inclusion en un benchmark de MedQA no implica calidad clinica; es una variante degradada destinada a experimentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/qwen3.5-4b-prune_width_ffn30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda citada): no se proporciona enlace en la informacion disponible
- Paper o blog del benchmark: no disponible
- Repositorio o demo: no disponible
