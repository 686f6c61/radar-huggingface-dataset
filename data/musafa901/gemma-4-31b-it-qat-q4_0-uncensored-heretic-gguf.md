# musafa901/gemma-4-31B-it-qat-q4_0-uncensored-heretic-GGUF

## Resumen

Se trata de un derivado no oficial del modelo multimodal Gemma 4 31B instruction-tuned de Google DeepMind, publicado por el usuario musafa901. Sobre el checkpoint QAT (Quantization-Aware Training) `google/gemma-4-31B-it-qat-q4_0-unquantized` se ha aplicado un proceso de abliteracion con la herramienta Heretic v2.0.0.dev0+custom, cuyo objetivo es eliminar la direccion de rechazo aprendida durante el alineamiento de seguridad. El resultado se distribuye en formato GGUF Q4_0, con 30.697.345.596 parametros totales y un repositorio de 19,3 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio de ablacion de alineamiento sobre un modelo de 31B: el autor reporta 0 rechazos en 100 peticiones frente a 100 rechazos del modelo original, con una divergencia KL de 0,0083 respecto al checkpoint base, lo que indica que la intervencion altera poco la distribucion general de salida. Por otro, sirve como ejemplo de publicacion derivada en el ecosistema abierto: pesos GGUF listos para `llama.cpp` y compatibles con endpoints, licencia declarada Apache 2.0 y uso previsto restringido a investigacion.

El modelo conserva las caracteristicas principales de la familia Gemma 4: entrada de texto e imagen (`image-text-to-text`), ventana de contexto de hasta 256K tokens y soporte multilingue declarado por Google de mas de 140 idiomas. No se documentan en la informacion disponible los datos de entrenamiento, la composicion del dataset ni el pipeline de post-entrenamiento del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (entrada de texto e imagen, salida de texto); la informacion disponible no describe la variante 31B como Mixture-of-Experts |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica / no disponible: la variante 31B no se presenta como MoE; la familia incluye variantes MoE separadas (26B A4B) |
| Longitud de contexto | 256K tokens (valor declarado para la familia Gemma 4; el autor no especifica un valor distinto para este derivado) |
| Tipos de cuantizacion | GGUF Q4_0, derivado del checkpoint QAT q4_0 de Google; no se documentan otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible para esta ficha; Google declara mas de 140 idiomas para la familia Gemma 4 |
| Licencia | apache-2.0 (segun metadatos de HuggingFace y model card), con enlace a la licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (repositorio de 19,3 GB); el modelo base se distribuye en safetensors |

Otros metadatos: pipeline `image-text-to-text`, libreria declarada `transformers`, autor musafa901, fecha de creacion y ultima actualizacion 2026-09-12, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El punto de partida es un checkpoint de Gemma 4 31B instruction-tuned optimizado con Quantization-Aware Training. Segun la documentacion de Google, los checkpoints QAT "unquantized" (Q4_0) son pesos en media precision extraidos del pipeline QAT, pensados para compilacion posterior y experimentacion; a partir de ellos se generan los GGUF Q4_0. La idea del QAT es mantener una calidad cercana a bfloat16 reduciendo de forma notable el requisito de memoria. La variante 31B es multimodal (texto e imagen); el audio solo se soporta en E2B, E4B y 12B, por lo que no esta disponible en este modelo.

Sobre ese checkpoint, el autor aplica abliteracion con Heretic v2.0.0.dev0+custom. La intervencion se concentra en las capas 30 a 41 (`start_layer_index` 30, `end_layer_index` 41) y modifica los modulos `attn.o_proj` y `mlp.down_proj`. Los parametros documentados incluyen un rango de LoRA de 128, transporte gaussiano con `transport_rank` 4, regularizacion ridge de 1,3591968756473712e-06, regularizacion de covarianza de 0,01, regularizacion de entropia de 0,1, `preserve_good_behavior_weight` 1,0, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,0, `neighbor_count` 1, `max_weight_change` 1,0 y normalizacion por filas desactivada (`none`). No se especifica el numero de tokens de entrenamiento de la ablacion ni de la fase QAT, ni si hubo RLHF o DPO adicionales en el derivado.

El autor reporta dos metricas de control: 0/100 rechazos en el modelo abliterado frente a 100/100 en el original, y una divergencia KL de 0,0083 respecto al checkpoint base, lo que sugiere que el cambio en la distribucion de salidas es acotado. La familia Gemma 4 incluye ademas decodificacion especulativa mediante modelos drafter; la documentacion de Google advierte de que el asistente debe ser un checkpoint QAT de la misma precision que el modelo objetivo, requisito que este derivado no garantiza al haber modificado pesos.

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla de chat de la familia Gemma.
- Razonamiento con modo de pensamiento ("thinking") configurable, segun la descripcion de la familia Gemma 4.
- Generacion y asistencia en codigo, una de las tareas objetivo declaradas para Gemma 4 junto con razonamiento y generacion de texto.
- Entrada de imagenes (pipeline `image-text-to-text`): el modelo puede procesar imagenes acompanadas de instrucciones en texto. La informacion disponible no detalla el codificador visual ni la resolucion soportada.
- Capacidades multilingues: Google declara soporte de mas de 140 idiomas en la familia; el autor no publica una evaluacion propia por idioma.
- Uso como endpoint HTTP compatible: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia estandar.
- Reduccion de rechazos: 0/100 en la metrica reportada por el autor, el comportamiento que define a este derivado.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este derivado.
- Capacidades de audio: no disponibles en la variante 31B de la familia.
- Decodificacion especulativa: soportada en la familia con un drafter QAT de la misma precision; no se documenta compatibilidad con este derivado abliterado.

## Casos de uso

- Red-teaming de modelos de lenguaje: usar el modelo como atacante o como objetivo para descubrir rutas de generacion de contenido danino, comparando su tasa de rechazo (0/100 reportada) con la del checkpoint original (100/100) para cuantificar cuanto material sensible aflora tras la ablacion.
- Investigacion en alineamiento y seguridad: estudiar como se distribuye la direccion de rechazo en las capas 30 a 41 de una red de 31B, y correlacionar los parametros de ablacion documentados (LoRA de rango 128, `transport_rank` 4, etc.) con cambios medibles en el comportamiento.
- Analisis de degradacion por ablacion: emplear la divergencia KL de 0,0083 como referencia y medir si tareas fuera del ambito de seguridad (razonamiento matematico, codigo, comprension lectora) se degradan, algo que no cubre la model card.
- Evaluacion de robustez de clasificadores de contenido: generar lotes de texto no filtrado con este modelo para probar y ajustar moderadores automaticos y filtros de salida antes de desplegarlos en produccion.
- Estudio de transferencia multilingue de la ablacion: comprobar si la supresion del rechazo medida en ingles se mantiene en otros idiomas del conjunto de 140+ declarado por la familia, o si el efecto depende del idioma de la peticion.
- Investigacion sobre datos sinteticos de adversarios: producir corpus etiquetados de peticiones y respuestas no rechazadas para entrenar clasificadores de seguridad o tecnicas de defensa.
- Analisis multimodal de sensibilidad: dado que el modelo acepta imagenes, evaluar si la ablacion tambien afecta a respuestas condicionadas por entrada visual, un caso poco explorado en la literatura de abliteracion.
- Estudio de reproducibilidad: replicar los parametros de Heretic documentados y verificar si se reproduce la tasa de rechazo nula y la divergencia KL publicada.

## Benchmarks y rendimiento

El autor solo publica dos metricas, ambas relacionadas con el efecto de la ablacion y no con capacidad general:

| Metrica | Este modelo | Modelo original (`google/gemma-4-31B-it-qat-q4_0-unquantized`) |
|---|---|---|
| Rechazos | 0/100 | 100/100 |
| Divergencia KL | 0,0083 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU ni equivalentes) en la informacion disponible, ni para este derivado ni, en lo aportado, para el checkpoint base. Tampoco se documentan mediciones de perplexity, throughput o latencia. Cualquier cifra de capacidad general tendria que obtenerse por evaluacion propia.

## Requisitos de hardware

Las cifras siguientes son estimaciones propias a partir de los datos disponibles (30,7B parametros y repositorio de 19,3 GB en Q4_0) y no mediciones publicadas por el autor.

- VRAM para los pesos: aproximadamente 19-20 GB en Q4_0 (coincide con el tamano del repositorio). El checkpoint base sin cuantizar en bfloat16 requeriria del orden de 61 GB solo para pesos.
- VRAM total a contexto corto (hasta 8K tokens): estimacion de 22-26 GB contando cache KV en fp16 y activaciones, valor que depende de la configuracion de capas y cabezas no publicada.
- Contexto largo: a 256K tokens la cache KV puede superar ampliamente el tamano de los pesos. Se recomienda cuantizar la cache KV o reducir la ventana; no hay cifras publicadas.
- GPU de 24 GB (RTX 3090, RTX 4090): al limite. Puede funcionar con contexto reducido y offload parcial de capas a CPU en `llama.cpp`, con penalizacion de velocidad.
- GPU de 40-48 GB (A100 40GB, A6000, L40S, RTX 6000 Ada): margen suficiente para contexto moderado.
- GPU de 80 GB (A100 80GB, H100): permite contexto largo sin offload y mayor lote concurrente.
- Multi-GPU: dos RTX 4090 o dos A6000 permiten repartir capas o tensores y ampliar contexto.
- Consumer GPU: si, en tarjetas de 24 GB con contexto limitado, y con mas comodidad en tarjetas de 32-48 GB.
- Opciones de despliegue: `llama.cpp` y `llama-cpp-python` (formato nativo GGUF), Ollama y LM Studio como envoltorios de `llama.cpp`. Para vLLM, Google ofrece checkpoints en formato compressed-tensors w4a16, pero este derivado esta en GGUF; el soporte de GGUF en vLLM es experimental y no se documenta para este modelo. TGI no soporta GGUF.
- Entrada de imagen: en `llama.cpp` el soporte multimodal requiere un archivo proyector (`mmproj`) que no se menciona en la informacion disponible del repositorio; sin el, solo funcionaria la ruta de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia | Estado de alineamiento |
|---|---|---|---|---|---|---|
| Este modelo (musafa901, Q4_0 GGUF, abliterado) | ~30,7B | 256K (familia) | Texto e imagen | GGUF Q4_0 | apache-2.0 declarada | Abliterado: 0/100 rechazos, KL 0,0083 |
| `google/gemma-4-31B-it-qat-q4_0-unquantized` (base) | ~30,7B | 256K | Texto e imagen | Safetensors (QAT, media precision) | Apache 2.0 / licencia Gemma 4 | Alineado: 100/100 rechazos |
| `google/gemma-4-26B-A4B` (variante MoE de la familia) | 26B totales, 4B activos | 256K | Texto e imagen | Safetensors, GGUF Q4_0, compressed-tensors w4a16 | Apache 2.0 / licencia Gemma 4 | Alineado |
| `google/gemma-4-12B` (variante menor) | 12B | 256K | Texto, imagen y audio | Safetensors, GGUF Q4_0, compressed-tensors w4a16 | Apache 2.0 / licencia Gemma 4 | Alineado |

No hay datos de benchmarks comparativos publicados en la informacion disponible para establecer diferencias de capacidad entre estas variantes. La comparacion relevante en este caso es de comportamiento (tasa de rechazo y divergencia KL), no de rendimiento en tareas.

## Limitaciones y advertencias

- Reduccion sustancial del alineamiento de seguridad: el propio autor advierte de que el modelo es mas propenso a generar contenido danino, inexacto, sesgado u ofensivo que un modelo estandar. La metrica de 0/100 rechazos es precisamente la senal de ese efecto.
- Uso previsto restringido: la model card indica investigacion y experimentacion (seguridad, alineamiento, red-teaming) y pide evitar su despliegue en servicios publicos o de cara al usuario final.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de calibracion; el proceso de ablacion puede alterar el comportamiento de abtencion de respuesta y no hay datos que lo cuantifiquen.
- Ausencia de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni MMMU, por lo que no se puede verificar si la ablacion ha degradado tareas ajenas a la seguridad mas alla del dato de KL 0,0083.
- Ambiguedad de licencia: los metadatos y la model card declaran `apache-2.0`, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google. Conviene verificar los terminos aplicables antes de cualquier uso comercial, dado que el modelo base no se distribuye bajo Apache 2.0 en su origen.
- Procedencia y trazabilidad: el autor de HuggingFace es musafa901, mientras que el descargo de responsabilidad del texto se atribuye a "OS-Software"; el repositorio no incluye informacion sobre la entidad que publica.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin discusion ni evaluaciones independientes que confirmen las metricas reportadas.
- Idiomas: aunque la familia declara mas de 140 idiomas, no hay evaluacion del efecto de la ablacion por idioma; no se puede asumir que el comportamiento sea uniforme.
- Contexto: los 256K tokens son un valor de familia, no verificado para este derivado; el coste de cache KV a esa longitud es prohibitivo en hardware de consumo.
- Multimodalidad en GGUF: no se documenta el archivo proyector de vision necesario, por lo que la entrada de imagen puede no estar operativa con el material publicado.
- Decodificacion especulativa: la familia exige que el drafter sea un checkpoint QAT de la misma precision; la compatibilidad con los pesos modificados de este derivado no esta documentada.
- Restricciones de contexto del propio documento: la model card fue truncada en el material proporcionado ("configurable thinking m"), de modo que parte de las capacidades declaradas por Google no se han podido verificar en su totalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/musafa901/gemma-4-31B-it-qat-q4_0-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Coleccion QAT de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Heretic (proyecto de abliteracion): https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w
- Informe tecnico de Gemma 4: https://arxiv.org/abs/2607.02770
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento del QAT de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Organizacion de Google Gemma en GitHub: https://github.com/google-gemma
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Busqueda web: no se recuperaron resultados relevantes. Las unicas coincidencias devueltas fueron foros de hockey sobre hielo (forums.hfboards.com) sin relacion con el modelo, por lo que no se incluyen como fuentes.
