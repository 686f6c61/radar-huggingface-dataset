# mradermacher/Serenity-26B-A4B-GGUF

## Resumen

Serenity-26B-A4B-GGUF es la distribucion en formato GGUF del modelo Serenity-26B-A4B, publicado por el usuario mradermacher a partir de los pesos originales de ReadyArt. Se trata de un modelo afinado para roleplay y conversacion instructiva, orientado a contenido adulto y "unaligned", con un total de 25.233.142.046 parametros (aproximadamente 25,2 mil millones) y una nomenclatura "A4B" que sugiere una arquitectura de mezcla de expertos con unos 4 mil millones de parametros activos por token, aunque el autor no documenta explicitamente la configuracion MoE.

El modelo se etiqueta como basado en "gemma-4", lo que lo situa en la estela de la familia Gemma de Google, si bien no se aporta verificacion tecnica de esa ascendencia ni detalles sobre el proceso de entrenamiento o afinado. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque el contenido para adultos y las etiquetas "unaligned" y "nsfw" condicionan fuertemente su aplicacion practica.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones disponibles de un modelo de roleplay de ~25B con posible arquitectura MoE; por otro, advierte de que la informacion tecnica publicada es muy escasa (sin benchmarks, sin model card detallada del autor original y sin especificaciones de contexto), por lo que cualquier evaluacion debe hacerse empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con posible mezcla de expertos (MoE), segun la nomenclatura "A4B"; no confirmado en la informacion disponible |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (inferido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "gemma-4" y la nomenclatura "A4B", que en la convencion habitual de modelos MoE indica aproximadamente 4 mil millones de parametros activos sobre un total de 25,2 mil millones. No se especifica el numero de expertos, el mecanismo de enrutamiento ni la dimension de las capas. Tampoco se documenta la longitud de contexto nativa, aunque la presencia de ficheros `mmproj` sugiere un componente multimodal (vision) heredado del modelo base.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o afinado supervisado. El modelo original de ReadyArt se presenta como un afinado orientado a roleplay conversacional y contenido adulto, con etiquetas que lo describen como "unaligned" y "mature"; el trabajo de mradermacher consiste unicamente en la conversion a GGUF y la generacion de cuantizaciones estaticas (sin imatrix, que se ofrecen en un repositorio aparte).

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Modo instructivo para seguir instrucciones en ingles.
- Componente multimodal: los ficheros `mmproj-f16` y `mmproj-Q8_0` indican soporte de entrada de imagenes en el modelo base (no verificado en la cuantizacion).
- Contenido para adultos y escenarios explicitos, segun las etiquetas del autor (nsfw, adult-content, explicit, erp).
- Comportamiento "unaligned": menor rechazo a peticiones que otros modelos filtrarian, lo que implica menor seguridad por defecto.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado especificamente para mantener personajes y coherencia narrativa en sesiones multi-turno, con cuantizaciones Q4_K_M o Q5_K_M que caben en GPUs de consumo.
- Escritura creativa para adultos: generacion de ficcion explicita y narrativa madura, aprovechando el afinado "unaligned" que evita rechazos moralizantes.
- Prototipado de chatbots de personaje en local: con llama.cpp u Ollama y una cuantizacion Q4_K_S (15,6 GB) se puede desplegar en una RTX 4090 o en un Mac con memoria unificada de 24 GB o mas.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio de un sistema deliberadamente "unaligned", util para medir tasas de cumplimiento de peticiones daninas en entornos controlados.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 11 variantes de cuantizacion del mismo modelo, lo que permite comparar degradacion de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 sobre una misma base.
- Generacion de dialogos sinteticos para entrenamiento: util para producir corpus conversacionales en ingles con estilo roleplay, siempre que se filtre el contenido generado antes de reutilizarlo.
- Experimentacion multimodal en local: cargando el fichero `mmproj` junto con el GGUF se puede probar entrada de imagenes en un entorno de escritorio sin dependencias de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~11-12 GB; Q3_K_M ~14-15 GB; IQ4_XS ~15-16 GB; Q4_K_M ~18-19 GB; Q5_K_M ~20-21 GB; Q6_K ~24-25 GB; Q8_0 ~28-29 GB.
- Ficheros `mmproj` anaden 0,9 GB (Q8_0) o 1,3 GB (f16) si se usa el componente multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q8_0 con contexto largo; multiples GPUs para Q6_K/Q8_0 con ventanas amplias.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo Q2_K/Q3_K_S) y en equipos Apple Silicon con 24-32 GB de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles; al tratarse de un posible MoE con ~4B activos, el throughput deberia ser superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Serenity-26B-A4B-GGUF | ~25,2B totales / ~4B activos (inferido) | no disponible | Apache 2.0 | GGUF | Roleplay adulto, unaligned, multimodal |
| ReadyArt/Serenity-26B-A4B | ~25,2B totales / ~4B activos (inferido) | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/Serenity-26B-A4B-i1-GGUF | ~25,2B totales / ~4B activos (inferido) | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizacion ponderada, mayor calidad por bit |
| Gemma 2 27B (referencia de familia) | 27B densos | 8K | Gemma license | safetensors, GGUF | Modelo generalista de Google, no especializado en roleplay |

La comparacion con modelos de roleplay de tamano similar (por ejemplo, variantes de Mistral o Llama afinadas) no puede establecerse con rigor porque no hay benchmarks publicados para Serenity-26B-A4B.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta afinado para material explicito y "nsfw"; no es adecuado para aplicaciones dirigidas al publico general ni para entornos sin control de edad.
- Comportamiento "unaligned": menor rechazo a peticiones sensibles, lo que incrementa el riesgo de generar contenido danino, ilegal o eticamente problematico sin las salvaguardas habituales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; en tareas de conocimiento especializado no debe confiarse en sus respuestas sin verificacion.
- Solo ingles declarado: no hay soporte documentado de otros idiomas, incluido el castellano.
- Longitud de contexto desconocida: no se puede garantizar el rendimiento en conversaciones muy largas ni en tareas de recuperacion sobre documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Procedencia tecnica no verificada: la etiqueta "gemma-4" no va acompanada de documentacion que confirme la arquitectura ni los datos de entrenamiento.
- Repositorio con muy poca traccion (245 descargas, 1 like): no hay comunidad que haya validado el modelo ni reportado fallos.
- El componente multimodal requiere cargar ficheros `mmproj` adicionales y no esta verificado que funcione correctamente en todas las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Serenity-26B-A4B-GGUF
- Modelo base original: https://huggingface.co/ReadyArt/Serenity-26B-A4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Serenity-26B-A4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Serenity-26B-A4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
