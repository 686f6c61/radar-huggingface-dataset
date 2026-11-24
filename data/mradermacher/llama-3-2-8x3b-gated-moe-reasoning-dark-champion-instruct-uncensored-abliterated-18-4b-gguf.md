# mradermacher/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF

## Resumen

Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B es un modelo de lenguaje de tipo mixture of experts (MoE) derivado de la familia Llama 3.2, construido mediante mergekit a partir de ocho instancias de 3B parametros y con un total de 18.404.944.960 parametros segun los pesos safetensors. El modelo original fue creado por DavidAU y esta version GGUF ha sido cuantizada y publicada por mradermacher, un actor habitual en la distribucion de cuantizaciones estáticas y con imatrix para modelos de gran tamano.

El modelo esta orientado explicitamente a razonamiento con modo "thinking", escritura creativa y roleplay sin censura (etiquetas "uncensored" y "abliterated"), lo que implica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para eliminar comportamientos de negativa. Incorpora una arquitectura MoE con compuertas ("gated") sobre una base Llama 3.2, con una ventana de contexto anunciada de 128k tokens y soporte declarado unicamente para ingles.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: los merges de modelos como via de bajo coste para obtener capacidades emergentes, la cuantizacion GGUF para despliegue en hardware de consumo y la eliminacion de alineamiento para casos de escritura de ficcion y roleplay. No obstante, su naturaleza de merge sin evaluacion publicada y su sesgo monoingue lo hacen inadecuado para produccion generalista sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con compuertas (mergekit sobre Llama 3.2) |
| Parametros totales | 18.404.944.960 |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (segun tags del autor) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes i1 con imatrix en repo separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mixture of experts con enrutamiento con compuertas, resultado de un merge con mergekit que combina ocho submodelos de 3B parametros de la familia Llama 3.2. El nombre "8X3B" indica esa composicion de ocho expertos de 3B, mientras que el total de parametros reales (18,4B) sugiere que el merge no activa los ocho expertos en cada token. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos activados ni la politica de enrutamiento exacta.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF, DPO o cualquier otra fase de alineamiento posterior. Las etiquetas indican que el modelo ha sido sometido a una tecnica de abliteration (ablacion de la direccion de rechazo) y que soporta modo de razonamiento explicito ("thinking"). El proceso de cuantizacion de mradermacher es estatico y sigue la convencion habitual de su pipeline, con variantes i1 con imatrix disponibles en un repositorio separado.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento explicito ("thinking") y razonamiento multi-paso.
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, narracion y "vivid prosing".
- Roleplay y conversacion multi-turno, incluyendo generos como terror, romance y ciencia ficcion.
- Generacion sin censura: el modelo no aplica rechazos por contenido sensible, lo que incluye lenguaje soez y tematicas adultas.
- Soporte de contexto largo de hasta 128k tokens segun las etiquetas del autor (no verificado en benchmarks).
- Capacidad de integracion en endpoints compatibles (tag "endpoints_compatible").
- No se declara soporte de tool calling, function calling, vision ni audio en la informacion disponible.
- Capacidades multilingues: unicamente ingles declarado.

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar tramas, subtramas y continuaciones de escena en generos como ciencia ficcion, romance o terror, aprovechando el modo de razonamiento para mantener coherencia argumental en textos largos.
- Roleplay conversacional: adecuado para personajes con personalidad marcada y conversaciones multi-turno sin restricciones de contenido, gracias a la ablacion de rechazos y al contexto extendido.
- Generacion de guiones y dialogos: util para guionistas que necesitan borradores rapidos de dialogos con tono vivido y sin filtros de estilo.
- Prototipado de narrativa interactiva: integrable en motores de ficcion interactiva o videojuegos narrativos donde se requiere continuacion de escena y coherencia de personajes.
- Investigacion sobre alineamiento y abliteration: el modelo sirve como caso de estudio para analizar el efecto de la ablacion de direcciones de rechazo en modelos MoE fusionados.
- Experimentacion con merges MoE en local: permite a desarrolladores evaluar el comportamiento de un MoE de 18,4B cuantizado en hardware de consumo para tareas creativas.
- Generacion de contenido editorial sin restricciones: borradores de relatos, sinopsis y material promocional de ficcion donde el filtrado estandar resulta limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,1 GB para Q2_K, 10,8-11,4 GB para Q4_K_S/Q4_K_M, 13,3 GB para Q5_K_M, 15,3 GB para Q6_K y 19,7 GB para Q8_0.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con comodidad; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_S.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 12 GB o mas usando cuantizaciones Q4 o inferiores; Q2_K y Q3_K_S permiten incluso 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo TGI o vLLM, aunque no se detalla.
- Latencia y throughput: no disponibles. Al ser un MoE con posible activacion parcial de expertos, el throughput podria ser superior al de un denso de 18,4B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-8X3B-GATED-MOE (este) | 18,4B totales | 128k (declarado) | apache-2.0 | GGUF | Merge MoE sin censura, solo ingles, sin benchmarks |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community | safetensors, GGUF | Denso, alineado, multilingue, benchmarks publicos |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Apache 2.0 | safetensors, GGUF | Denso, alineado, multilingue, ampliamente evaluado |
| Qwen2.5-14B-Instruct | 14,7B | 128k | Apache 2.0 | safetensors, GGUF | Denso, multilingue, buenos resultados en codigo y matematicas |

La comparacion es aproximada: este modelo es un merge no evaluado y orientado a creatividad sin censura, mientras que las alternativas son modelos densos alineados con evaluaciones publicas y soporte multilingue. Para tareas de produccion generalista, las alternativas ofrecen mayor trazabilidad y garantias.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de Llama 3.2 sin datos de evaluacion, hereda los sesgos de sus modelos base y no se ha documentado ninguna mitigacion.
- Riesgo de alucinacion: elevado en tareas factuales; el modelo esta orientado a ficcion y creatividad, no a recuperacion de hechos.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: los 128k tokens son una etiqueta del autor, no verificados; el rendimiento real en contextos muy largos puede degradarse.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base incorpora componentes de Llama 3.2 cuya licencia original (Llama 3.2 Community License) impone restricciones adicionales que deben revisarse antes de un uso comercial.
- Ausencia de alineamiento: la abliteration elimina los rechazos, lo que implica riesgo de generar contenido ofensivo, ilegal o danino; no es apto para aplicaciones orientadas al publico sin moderacion externa.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede comparar objetivamente con alternativas.
- Naturaleza de merge: los merges de modelos pueden producir inestabilidad, degeneracion o comportamientos impredecibles; se recomienda validacion exhaustiva antes de produccion.
- Repositorio de 126,7 GB: el peso del repo incluye todas las cuantizaciones, lo que complica la descarga selectiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF
- Modelo base: https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Variantes i1 con imatrix: https://huggingface.co/mradermacher/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
