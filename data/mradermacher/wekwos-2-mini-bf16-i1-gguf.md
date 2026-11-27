# mradermacher/wekwos-2-mini-bf16-i1-GGUF

## Resumen

Wekwos 2 Mini es un modelo de lenguaje de aproximadamente 26.070 millones de parametros (26B) desarrollado por disinfozone, especializado en linguistica historica y, concretamente, en protoindoeuropeo (PIE), una lengua reconstruida sin hablantes nativos. El modelo se distribuye en formato bf16 bajo licencia Apache 2.0 y esta etiquetado con la familia de arquitectura "inkling2_loop", ademas de haber sido afinado mediante GRPO (Group Relative Policy Optimization), lo que sugiere un entrenamiento por refuerzo orientado a tareas linguisticas concretas.

La version aqui descrita es una cuantizacion GGUF con imatrix publicada por mradermacher, un conocido cuantizador de la comunidad, a partir del modelo base `disinfozone/wekwos-2-mini-bf16`. Esta disponible en un unico cuantizado i1-Q2_K de aproximadamente 11 GB, ademas del fichero imatrix para generar cuantizaciones propias. El modelo declara soporte para ingles (`en`) y protoindoeuropeo (`ine`), y la model card lo describe como modelo conversacional.

Su relevancia es de nicho: no compite en benchmarks generalistas, sino que cubre una necesidad muy concreta de investigacion en linguistica historica, filologia comparada y reconstruccion de lenguas. Para desarrolladores e investigadores que trabajen con corpus PIE o lenguas indoeuropeas antiguas, ofrece un punto de partida especializado que no existe en los modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (transformer; detalles internos no disponibles) |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (imatrix) y fichero imatrix para generar cuantizaciones propias; el autor lista en la model card un catalogo de tipos habitual (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | ine (protoindoeuropeo), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en bf16 (safetensors) |

## Arquitectura y entrenamiento

La informacion disponible es limitada. El tag `inkling2_loop` apunta a una familia de arquitectura denominada "inkling2_loop", presumiblemente una variante de transformer con algun tipo de mecanismo recurrente o de bucle, pero no se detalla su funcionamiento interno. El modelo base se distribuye en bf16 y esta etiquetado como modelo de vision en la model card del cuantizador, lo que sugiere capacidades multimodales (los ficheros mmproj, si existen, se alojan en el repositorio estatico de cuantizaciones).

En cuanto al entrenamiento, el tag `grpo` indica que se aplico Group Relative Policy Optimization, una tecnica de aprendizaje por refuerzo usada habitualmente para mejorar el razonamiento y la adherencia a instrucciones. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y en protoindoeuropeo reconstruido.
- Trabajo con linguistica historica: analisis morfologico, comparacion de raices y reconstruccion de formas PIE.
- Modelo etiquetado como de vision en la model card del cuantizador, aunque los detalles de las capacidades multimodales no estan disponibles.
- Afinado mediante GRPO, lo que sugiere cierto grado de razonamiento guiado por recompensas en tareas linguisticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a `en` e `ine` segun los metadatos.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion en linguistica historica: el modelo puede generar y analizar formas protoindoeuropeas reconstruidas, sirviendo de asistente para filologos que trabajen con etimologias y correspondencias foneticas entre lenguas indoeuropeas.
- Docencia universitaria de linguistica comparada: util para generar ejercicios de reconstruccion, explicar leyes foneticas (por ejemplo, la ley de Grimm) y proponer paradigmas nominales o verbales en PIE.
- Creacion de contenido divulgativo: redaccion de articulos o materiales sobre lenguas indoeuropeas antiguas, con la ventaja de un vocabulario especializado que los modelos generalistas no cubren con rigor.
- Prototipado de herramientas filologicas: integracion en pipelines de analisis de corpus donde se necesite etiquetar o normalizar formas reconstruidas, aprovechando su especializacion frente a modelos generalistas.
- Experimentacion con modelos de nicho: como caso de estudio de fine-tuning con GRPO sobre dominios muy especializados, util para investigadores que quieran replicar la metodologia.
- Despliegue en local con recursos moderados: gracias a la cuantizacion i1-Q2_K (~11 GB), puede ejecutarse en una unica GPU de consumo alta gama o en configuraciones con RAM suficiente, lo que facilita la experimentacion sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el cuantizado i1-Q2_K ocupa aproximadamente 11 GB, por lo que requiere al menos 12 GB de VRAM para cargar comodamente en GPU, o bien ejecucion en CPU con suficiente RAM.
- GPU recomendadas: para el cuantizado Q2_K, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para cuantizaciones mayores (Q4_K_M, Q5_K_M, Q6_K) se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en el cuantizado Q2_K cabe en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) y con holgura en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en bf16 puede servirse con vLLM o TGI si se dispone de hardware adecuado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada modelos comparables de la misma categoria (especializados en protoindoeuropeo o linguistica historica) ni se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El protoindoeuropeo es una lengua reconstruida: cualquier salida del modelo en `ine` es una hipotesis academica, no un uso linguistico atestiguado, y debe validarse con fuentes filologicas.
- Riesgo de alucinacion elevado en un dominio con corpus limitado y altamente especializado; las formas reconstruidas pueden ser plausibles pero incorrectas.
- Cobertura idiomatica muy restringida: solo `en` e `ine` segun los metadatos; no se garantiza un buen rendimiento en castellano ni en otras lenguas.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- La model card del cuantizador menciona que es un modelo de vision, pero no se detallan las capacidades multimodales ni se confirma la disponibilidad de ficheros mmproj.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original y citar adecuadamente a los autores.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema practicamente inexistente, sin validacion independiente ni reportes de la comunidad.
- La cuantizacion i1-Q2_K es agresiva y puede degradar notablemente la calidad; para produccion se recomienda Q4_K_M o superior, siempre que el hardware lo permita.

## Enlaces

- Repositorio Hugging Face (cuantizacion): https://huggingface.co/mradermacher/wekwos-2-mini-bf16-i1-GGUF
- Modelo base: https://huggingface.co/disinfozone/wekwos-2-mini-bf16
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/wekwos-2-mini-bf16-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#wekwos-2-mini-bf16-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
