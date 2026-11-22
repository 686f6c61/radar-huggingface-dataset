# mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix, del modelo prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para llama.cpp. El modelo subyacente es un fine-tuning de la familia Qwen3.5 (9.197.093.888 parametros, aproximadamente 9,2 mil millones) orientado a instrucciones, matematicas y razonamiento, y etiquetado como "abliterated", "heretic" y "uncensored", lo que indica que se ha aplicado una tecnica de eliminacion o reduccion de las capas de rechazo del modelo original.

El modelo base incorpora las etiquetas "flash", "deepseek-v4" y "sft", que apuntan a un ajuste supervisado sobre una base Qwen3.5 y a una posible influencia de datos o destilacion de DeepSeek V4. Es relevante para quienes necesitan ejecutar localmente un modelo de 9B con capacidades de razonamiento e instrucciones en hardware de consumo, sin las restricciones de seguridad habituales del modelo original. La cuantizacion incluye una matriz de importancia (imatrix) para mejorar la calidad de los formatos IQ, y el repositorio ofrece 22 variantes de cuantizacion entre 4,0 GB y 7,7 GB.

La licencia declarada es Apache 2.0, el idioma soportado es unicamente el ingles y el modelo se distribuye exclusivamente como pesos GGUF para su uso con llama.cpp y herramientas compatibles. No se han publicado resultados de benchmarks ni especificaciones de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5, transformer; detalles no especificados) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); el modelo base esta en bf16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Las etiquetas indican que se trata de un modelo de la familia Qwen3.5, con ajuste supervisado (sft) y orientado a matematicas y razonamiento (math, reasoning). La etiqueta "flash" sugiere una variante optimizada o ligera dentro de la familia, y "deepseek-v4" apunta a una posible destilacion o mezcla de datos provenientes de DeepSeek V4, aunque no se especifica el mecanismo exacto. El modelo base ha sido sometido a un proceso de "abliteration" (etiquetas abliterated, heretic, uncensored, decensored), una tecnica que modifica los pesos para reducir o eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responde a peticiones que el modelo original rechazaria.

La cuantizacion realizada por mradermacher emplea una matriz de importancia (imatrix) generada a partir de un corpus de calibracion, lo que mejora la fidelidad de los formatos IQ respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno (etiqueta conversational, instruction-following).
- Razonamiento y matematicas (etiquetas math, reasoning).
- Generacion de codigo y tareas de programacion, aunque no se detalla el rendimiento.
- Capacidades de vision: la model card indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico; no se confirma la disponibilidad de dichos ficheros en la informacion proporcionada.
- Respuestas sin filtros de rechazo (uncensored, abliterated), orientado a contenido que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del modelo original, util para analizar como se distribuye la direccion de rechazo en los pesos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o sensibles que los modelos alineados suelen rechazar, ejecutada localmente con llama.cpp.
- Prototipado de asistentes conversacionales en local: con cuantizaciones i1-Q4_K_M (5,9 GB) puede desplegarse en una GPU de consumo para pruebas de instrucciones y dialogo multi-turno en ingles.
- Razonamiento matematico y resolucion de problemas: las etiquetas math y reasoning indican un ajuste orientado a este tipo de tareas, util para generar explicaciones paso a paso en entornos educativos o de analisis.
- Evaluacion de cuantizaciones: el repositorio ofrece 22 variantes y un fichero imatrix, lo que permite comparar la degradacion de calidad entre formatos IQ y K-quant en tareas de razonamiento.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse con llama.cpp y pesos GGUF, el modelo puede correr en estaciones de trabajo aisladas sin enviar datos a servicios externos.
- Analisis de imagenes (si se dispone de los ficheros mmproj del repositorio estatico): la model card lo declara como modelo de vision, aunque la disponibilidad de los proyectores no esta confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K 4,0 GB; i1-IQ3_S 4,6 GB; i1-Q3_K_M 4,8 GB; i1-IQ4_XS 5,4 GB; i1-Q4_K_S 5,6 GB; i1-Q4_K_M 5,9 GB; i1-Q5_K_M 6,7 GB; i1-Q6_K 7,7 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no especificada).
- GPU recomendadas: para las cuantizaciones Q4 y Q5, una RTX 4090 (24 GB) o RTX 3090 (24 GB) ofrecen margen amplio; una RTX 4070 Ti Super (16 GB) o RTX 4080 (16 GB) son suficientes para Q4_K_M con contexto moderado. Para Q6_K se recomienda 12 GB o mas de VRAM.
- Cabe en GPU de consumo: si, desde tarjetas de 8 GB (con cuantizaciones Q3 o IQ3 y contexto corto) hasta 16-24 GB para Q4-Q6 con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El modelo base tambien es compatible con transformers y text-generation-inference, pero esta version concreta es solo GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF (este) | 9,2 B | no disponible | Apache 2.0 | GGUF (imatrix) | Version sin filtros, solo ingles, cuantizaciones de 4,0 a 7,7 GB |
| prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic | 9,2 B | no disponible | Apache 2.0 | bf16 (safetensors) | Modelo base sin cuantizar del que deriva esta version |
| mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF | 9,2 B | no disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base, sin imatrix |
| Modelos Qwen3.5 de 9B alineados (originales) | aproximadamente 9 B | no disponible | no disponible | no disponible | No se dispone de datos concretos en la informacion proporcionada |

## Limitaciones y advertencias

- El proceso de abliteration elimina o reduce los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin advertencia; no es adecuado para aplicaciones dirigidas al publico general sin filtros externos.
- Riesgo elevado de alucinacion: no se han publicado benchmarks que permitan estimar su fiabilidad, y los fine-tunings sin alineamiento estandar suelen degradar la precision factual.
- Idioma limitado al ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no especificada; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de un modelo sin filtros conlleva riesgos legales y reputacionales que el usuario debe evaluar; la licencia no exime de responsabilidad por el contenido generado.
- La calidad de las cuantizaciones de 2 y 3 bits es limitada; el propio autor recomienda IQ3_XXS o IQ3_S frente a Q2_K y Q3_K_S, y Q4_K_M como opcion equilibrada.
- No se confirma la disponibilidad de los ficheros mmproj para las capacidades de vision anunciadas en la model card; verificar en el repositorio estatico antes de asumir soporte multimodal.
- El modelo tiene muy poca traccion (1 like, 3248 descargas) y no cuenta con validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
