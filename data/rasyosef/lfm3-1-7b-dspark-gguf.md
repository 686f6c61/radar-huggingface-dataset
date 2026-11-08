# rasyosef/LFM3-1.7B-DSpark-GGUF

## Resumen

LFM3-1.7B-DSpark-GGUF es la version cuantizada en formato GGUF del modelo borrador (draft) DSpark para LFM3-1.7B, desarrollado por el usuario rasyosef. No se trata de un modelo generativo autonomo, sino de un sidecar de decodificacion especulativa que se acopla a un modelo objetivo LFM3-1.7B de LiquidAI para acelerar la inferencia en llama.cpp sin alterar la salida. El borrador incorpora 4 capas de atencion, una cabeza Markov de rango 256, una cabeza de confianza y un tamano de bloque de 8 tokens sobre un vocabulario de borrador de 32.000 entradas.

La relevancia de esta publicacion radica en que la decodificacion especulativa DSpark ya esta integrada en la rama principal de llama.cpp (PR ggml-org/llama.cpp #25173), lo que permite desplegar aceleracion exacta con un unico flag adicional. El modelo es, por tanto, una pieza de infraestructura para reducir latencia en produccion sobre hardware de consumo, no un modelo de proposito general.

El repositorio ocupa 1,6 GB e incluye tres cuantizaciones (BF16, F16 y Q8_0). Los embeddings de tokens y la cabeza LM se comparten desde el modelo objetivo en tiempo de carga, por lo que el borrador no puede ejecutarse de forma aislada. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa (4 capas de atencion, cabeza Markov de rango 256, cabeza de confianza, bloque de 8 tokens) |
| Parametros totales | 316.267.009 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo LFM3-1.7B) |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un borrador especializado para decodificacion especulativa. Consta de 4 capas de atencion, una cabeza Markov de rango 256 que modela la dependencia entre tokens propuestos, una cabeza de confianza que estima la probabilidad de aceptacion y un tamano de bloque de 8 tokens. El vocabulario de borrador se limita a 32.000 entradas, lo que reduce el coste de la cabeza de salida. Los embeddings de tokens y la cabeza LM no se almacenan en el sidecar: se comparten desde el modelo objetivo LFM3-1.7B en el momento de la carga.

El entrenamiento se realizo con la libreria speculators, segun se indica en la model card del modelo base rasyosef/LFM3-1.7B-DSpark. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la verificacion exacta: el modelo objetivo valida cada token propuesto en un unico forward pass, de modo que la salida greedy es identica a la del objetivo ejecutado en solitario, lo que constituye una aceleracion sin perdida (lossless).

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone hasta 8 tokens por bloque que el modelo objetivo verifica.
- Aceleracion exacta de inferencia: la salida es identica a la del modelo objetivo LFM3-1.7B sin borrador.
- Integracion nativa en llama.cpp mediante el tipo de especulacion `draft-dspark`.
- Metricas de aceptacion por respuesta: los `timings` de llama-server reportan `draft_n` y `draft_n_accepted`.
- No soporta tool calling, agentes, vision ni audio por si mismo; estas capacidades dependen exclusivamente del modelo objetivo LFM3-1.7B.
- Capacidades multilingues: no disponibles de forma independiente; heredadas del objetivo.

## Casos de uso

- Servicio de chat de baja latencia en produccion: desplegar llama-server con LFM3-1.7B como objetivo y este sidecar como borrador permite reducir el tiempo por token en respuestas conversacionales manteniendo la salida identica al objetivo.
- Inferencia en GPU de consumo: con el borrador en Q8_0 (345 MB) y el objetivo en Q8_0, el conjunto cabe en GPUs de 8-12 GB de VRAM, lo que habilita decodificacion especulativa en estaciones de trabajo sin aceleradores de datacenter.
- Generacion de codigo asistida en IDE: la naturaleza exacta de la decodificacion garantiza que el codigo generado no difiere del que produciria el objetivo, algo critico cuando se valida sintaxis o se ejecutan tests automaticos.
- Evaluacion comparativa de tecnicas de aceleracion: el par objetivo/borrador sirve como banco de pruebas para medir tasas de aceptacion (`draft_n_accepted / draft_n`) frente a otras estrategias de especulacion en llama.cpp.
- Pipelines de CI/CD para pruebas de regresion de modelos: al ser la salida determinista e identica al objetivo, se puede usar el borrador para acelerar suites de evaluacion sin invalidar los resultados de referencia.
- Despliegue en entornos con presupuesto de memoria ajustado: la eleccion entre BF16/F16 (641 MB) y Q8_0 (345 MB) permite ajustar el consumo del borrador segun la VRAM libre tras cargar el objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a rasyosef/LFM3-1.7B-DSpark para las metricas de longitud de aceptacion y los detalles de entrenamiento, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM del borrador: 641 MB en BF16 o F16; 345 MB en Q8_0. Debe sumarse a la VRAM del modelo objetivo LFM3-1.7B.
- VRAM total estimada: depende de la cuantizacion del objetivo; con objetivo Q8_0 y borrador Q8_0 el conjunto se situa en el rango de 2-3 GB, adecuado para GPUs de consumo.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y cualquier GPU con al menos 8 GB de VRAM para el par completo en Q8_0. En A100 o H100 el borrador es marginal en memoria, pero el beneficio de latencia depende del cuello de botella del objetivo.
- Cabe en GPU de consumo: si, incluidas GPUs de gama media con 8 GB o mas en configuracion Q8_0.
- Opciones de despliegue: llama.cpp (llama-server) con los flags `--spec-type draft-dspark --spec-draft-n-max 8 --spec-draft-n-min 0 -fa on -ngl 99`. No se documenta soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card indica que el tamano de bloque se lee de los metadatos del sidecar y que `n-max` se limita a ese valor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Objetivo asociado |
|---|---|---|---|---|---|
| LFM3-1.7B-DSpark-GGUF | 316 M | no disponible | GGUF | Apache 2.0 | LiquidAI/LFM3-1.7B |
| Qwen3-1.7B-DSpark-GGUF | no disponible | no disponible | GGUF | no disponible | Qwen/Qwen3-1.7B |
| Llama-3.2-1B-Instruct-DSpark-GGUF | no disponible | no disponible | GGUF | no disponible | Llama-3.2-1B-Instruct |
| Phi-4-mini-instruct-DSpark-GGUF | no disponible | no disponible | GGUF | no disponible | Phi-4-mini-instruct |

Los tres alternativas pertenecen a la misma familia DSpark del mismo autor y comparten la misma funcion: actuar como borradores para sus respectivos objetivos. La comparacion directa de rendimiento entre ellos no es posible con la informacion disponible, ya que depende del modelo objetivo y de la carga de trabajo.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente un GGUF objetivo LFM3-1.7B de LiquidAI; sin el no puede cargarse ni generar texto.
- Los embeddings y la cabeza LM se comparten desde el objetivo, por lo que una incompatibilidad de vocabulario o de arquitectura con el objetivo rompe la inferencia.
- La aceleracion depende de la tasa de aceptacion del borrador; en dominios muy alejados de los datos de entrenamiento del borrador el beneficio puede reducirse.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma especificas del borrador; al ser la salida identica al objetivo, hereda los sesgos y alucinaciones de LFM3-1.7B.
- La licencia Apache 2.0 permite uso comercial, pero el modelo objetivo LFM3-1.7B tiene su propia licencia que debe verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks de aceptacion en la informacion disponible; conviene validar el rendimiento real en el hardware y la carga objetivo antes de usarlo en produccion.
- El soporte de DSpark en llama.cpp depende de la version; se requiere una build que incluya la PR ggml-org/llama.cpp #25173.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/rasyosef/LFM3-1.7B-DSpark-GGUF
- Modelo base (borrador sin cuantizar): https://huggingface.co/rasyosef/LFM3-1.7B-DSpark
- Modelo objetivo LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del objetivo: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- PR de llama.cpp con soporte DSpark: https://github.com/ggml-org/llama.cpp/pull/25173
- Qwen3-1.7B-DSpark-GGUF: https://huggingface.co/rasyosef/Qwen3-1.7B-DSpark-GGUF
- Qwen3-1.7B-DSpark: https://huggingface.co/rasyosef/Qwen3-1.7B-DSpark
- Llama-3.2-1B-Instruct-DSpark-GGUF: https://huggingface.co/rasyosef/Llama-3.2-1B-Instruct-DSpark-GGUF
- Llama-3.2-3B-Instruct-DSpark-GGUF: https://huggingface.co/rasyosef/Llama-3.2-3B-Instruct-DSpark-GGUF
- Qwen3.5-2B-DSpark-GGUF: https://huggingface.co/rasyosef/Qwen3.5-2B-DSpark-GGUF
- gemma-4-E2B-it-dspark-GGUF: https://huggingface.co/rasyosef/gemma-4-E2B-it-dspark-GGUF
- gemma-4-E4B-it-dspark-GGUF: https://huggingface.co/rasyosef/gemma-4-E4B-it-dspark-GGUF
- Phi-4-mini-instruct-DSpark-GGUF: https://huggingface.co/rasyosef/Phi-4-mini-instruct-DSpark-GGUF
