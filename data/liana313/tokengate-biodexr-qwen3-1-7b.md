# liana313/tokengate-biodexr-qwen3-1.7b

## Resumen

TokenGate BioDEX-Reactions es un adaptador publicado por el usuario `liana313` sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia eficiente compuesto por dos piezas que se cargan de forma conjunta: una capa *gate* aprendida (`gate_step12000.pt`) que poda tokens de la KV-cache de extremo a extremo, y un adaptador LoRA (`lora_step12000.pt`, r16 a32 sobre las proyecciones q/v de todas las capas). El conjunto se ha entrenado sobre la tarea oficial BioDEX-Reactions, orientada a la extraccion de terminos de reacciones adversas MedDRA con metrica de F1 exact-match.

La relevancia del checkpoint es doble. Por un lado, ataca uno de los cuellos de botella reales del despliegue de modelos con ventanas de contexto largas: el coste de memoria y de computo asociado a la KV-cache, que crece linealmente con la longitud de la secuencia. Por otro, lo hace con un mecanismo aprendido en lugar de heuristicas fijas de *token pruning*, lo que en principio permite adaptar la politica de descarte al dominio concreto de la tarea.

El autor indica que se trata del checkpoint exacto (paso 12000 de una receta iso convergida) empleado en los benchmarks del paper asociado, arXiv:2610.26754. Sin embargo, en la informacion disponible no se incluyen los resultados numericos de dichos benchmarks, el detalle de la composicion del dataset de entrenamiento ni las cifras de contexto soportadas por el adaptador. El repo ocupa 0,2 GB y, en el momento de la consulta, acumula 2 descargas y 0 *likes*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con capa *gate* de poda de KV-cache y adaptador LoRA (r16 a32, q/v en todas las capas) |
| Parametros totales | 1,7 B (modelo base Qwen/Qwen3-1.7B); el adaptador LoRA y el gate anaden un numero de parametros no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo se etiqueta como `long-context` y el gate actua sobre la KV-cache |
| Tipos de cuantizacion | No disponible; el repo distribuye pesos en `.pt` sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible (la metadatos de HuggingFace no declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`gate_step12000.pt` + `lora_step12000.pt`); requiere descargar por separado los pesos del modelo base Qwen3-1.7B |

## Arquitectura y entrenamiento

El artefacto se apoya en un transformer decoder-only denso de 1,7 B parametros (Qwen3-1.7B) al que se superpone un mecanismo de *token pruning* sobre la KV-cache: una capa *gate* que decide, token a token, que entradas de la cache se conservan durante la generacion. El gate se entrena de extremo a extremo y se empareja con un adaptador LoRA de rango 16 y alpha 32 aplicado a las proyecciones de query y value de todas las capas. La model card indica que ambos ficheros se corresponden por nombre (`gate_step12000.pt` + `lora_step12000.pt`) y que el modelo base y la capa del gate quedan registrados en los metadatos del propio gate.

El entrenamiento se realiza sobre la tarea oficial BioDEX-Reactions, con F1 de coincidencia exacta sobre terminos de reacciones adversas MedDRA como objetivo. El checkpoint publicado corresponde al paso 12000 de una "receta iso convergida" (*converged iso recipe*), descrita como la empleada en los benchmarks del paper. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO; por la naturaleza del artefacto (adaptador de tarea sobre un modelo ya alineado) lo mas probable es que el ajuste sea supervisado, pero este punto no se confirma en la documentacion.

La innovacion tecnica destacable es la integracion del gate en el bucle de inferencia mediante la libreria TokenGate, con una API de carga en una sola llamada (`load_model("liana313/tokengate-biodexr-qwen3-1.7b")`). Esto implica una dependencia explicita de codigo externo: los pesos por si solos no son utilizables con un runtime estandar de transformers sin la implementacion del gate.

## Capacidades

- Generacion de texto condicionada por el modelo base Qwen3-1.7B, con el adaptador LoRA ajustado a la tarea BioDEX-Reactions.
- Extraccion de entidades biomedicas: identificacion de terminos de reacciones adversas y normalizacion frente al vocabulario MedDRA.
- Inferencia sobre contextos largos con coste de KV-cache reducido gracias a la poda aprendida de tokens.
- Capacidad de *thinking* / razonamiento heredada del modelo base Qwen3, sujeta a verificacion porque no se documenta en la model card.
- Soporte de *tool calling* y function calling: no documentado para este adaptador (el modelo base Qwen3 lo soporta, pero el ajuste de tarea puede haber degradado esta capacidad).
- Capacidades multilingues: no disponibles; no se declaran idiomas en los metadatos ni en la model card.
- Modo de investigacion reproducible: el checkpoint permite replicar los experimentos del paper con la version exacta de gate y LoRA.

## Casos de uso

- Farmacovigilancia sobre literatura cientifica: procesar abstracts y articulos completos para extraer y normalizar terminos de reacciones adversas contra MedDRA, aprovechando la poda de KV-cache para manejar documentos largos con menos memoria.
- Analisis de informes de eventos adversos (ICSR) en pipelines regulados: el adaptador esta ajustado especificamente al esquema de BioDEX-Reactions, lo que reduce el trabajo de formateo de salida frente a un modelo generico.
- Prototipado de bajo coste en GPU consumer: con 1,7 B parametros y un adaptador de 0,2 GB, el conjunto cabe en tarjetas de 8-12 GB y permite iterar sobre extraccion de entidades sin infraestructura dedicada.
- Investigacion sobre eficiencia de inferencia: banco de pruebas para medir el ahorro real de memoria y latencia del *token pruning* aprendido frente a la atencion completa sobre el mismo modelo base.
- Servicio interno de extraccion con contexto largo: despliegue de un endpoint de text-generation que recibe secciones de articulos y devuelve listas estructuradas de terminos, con coste por token inferior al del modelo completo.
- Generacion de datasets etiquetados: uso del adaptador como etiquetador automatico para preanotar corpus biomedicos que luego se revisan manualmente, acelerando la construccion de conjuntos de entrenamiento.
- Comparativa de estrategias de compresion: linea base reproducible para evaluar otras politicas de pruning o de cuantizacion sobre Qwen3-1.7B en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint es el utilizado en los benchmarks del paper (arXiv:2610.26754), pero no reproduce las cifras de F1 exact-match sobre BioDEX-Reactions, ni mediciones de latencia, throughput o ahorro de memoria de la KV-cache. Para obtener numeros verificables es necesario consultar el paper o el repositorio de TokenGate.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base 1,7 B): aproximadamente 3,5 GB en fp16, en torno a 1,8-2 GB en int8 y 1-1,2 GB en int4. Estimaciones calculadas a partir del numero de parametros, no publicadas por el autor.
- El adaptador LoRA y el gate suman 0,2 GB adicionales en el repo, sin cuantizar.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070/4070); A100/H100 no son necesarias por tamano, aunque pueden aportar throughput en despliegues por lotes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas, siempre que se use la implementacion de TokenGate para el gate.
- Opciones de despliegue: la via documentada es la libreria TokenGate (`from tokengate import load_model`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el gate aprendido probablemente requiere integracion especifica en el runtime.
- Latencia y throughput: no disponibles. El beneficio esperado del *token pruning* crece con la longitud de contexto, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokengate-biodexr-qwen3-1.7b | 1,7 B (+ gate y LoRA) | No disponible (etiquetado long-context) | Poda aprendida de KV-cache + LoRA para BioDEX-Reactions | Apache 2.0 | HuggingFace, 2 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7 B | No disponible en la informacion proporcionada | Transformer denso de proposito general | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Alternativas especializadas en pruning de KV-cache | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el propio modelo base: mismo tamano y licencia, pero sin gate ni adaptador de tarea. El interes del artefacto esta en el ahorro de KV-cache y en la especializacion en BioDEX-Reactions, a costa de una dependencia de codigo y de un ajuste estrecho a un unico dominio. No se dispone de datos de rendimiento comparado con otras propuestas de compresion de cache.

## Limitaciones y advertencias

- Ausencia total de cifras de benchmark en la model card: no se puede verificar la calidad del adaptador ni el ahorro real de memoria sin ejecutar la evaluacion por cuenta propia.
- Modelo de nicho y practicamente sin adopcion (2 descargas, 0 likes), lo que implica ausencia de validacion independiente y riesgo de errores no detectados.
- Dependencia de la libreria TokenGate: los pesos no son cargables con un pipeline estandar de transformers sin la implementacion del gate; conviene revisar la licencia y el mantenimiento de ese repositorio antes de integrarlo en produccion.
- Ajuste estrecho a BioDEX-Reactions: es esperable cierto olvido catastrofico en tareas generales de generacion, por lo que no deberia usarse como sustituto del modelo base para propositos no biomedicos.
- Riesgo de alucinacion en la normalizacion de terminos MedDRA: un termino generado con formato correcto pero codigo incorrecto es plausible y requiere validacion contra el vocabulario oficial.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en otras lenguas distintas del ingles biomedico.
- Cuantizacion no documentada: no se han publicado variantes GGUF ni cuantizadas del gate, y cuantizar un gate aprendido puede alterar la politica de poda y degradar la tarea.
- Licencia Apache 2.0 permisiva para uso comercial, pero el aviso de attribucion se aplica tanto al adaptador como al modelo base; conviene conservar las notas de licencia de Qwen3-1.7B.
- La fecha de creacion del repositorio (2026-10-12) y la referencia arXiv deben verificarse antes de citar el trabajo en publicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liana313/tokengate-biodexr-qwen3-1.7b
- Paper: https://arxiv.org/abs/2610.26754
- Repositorio de la libreria TokenGate: https://github.com/tokengate-models/TokenGate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
