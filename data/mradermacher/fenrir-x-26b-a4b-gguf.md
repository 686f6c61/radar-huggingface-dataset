# mradermacher/Fenrir-X-26B-A4B-GGUF

## Resumen

Fenrir-X-26B-A4B-GGUF es la publicacion de cuantizaciones en formato GGUF realizada por mradermacher (autor conocido por su catalogo de cuantizaciones para llama.cpp) a partir del modelo Vortex5/Fenrir-X-26B-A4B. Se trata de un merge generado con mergekit y orientado explicitamente a roleplay y storytelling, segun las etiquetas declaradas por el autor. El repositorio no contiene pesos originales, sino versiones comprimidas listas para ejecucion local.

El modelo base declara 25.233.142.046 parametros (unos 25,2 mil millones) segun los tensores en safetensors, aunque la nomenclatura "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token. Esta interpretacion no esta confirmada en la model card disponible, por lo que debe tratarse como una inferencia a partir del nombre. La licencia declarada es Apache-2.0.

Su relevancia practica es la de facilitar el despliegue local de un modelo conversacional especializado en ficcion y角色... en personajes, mediante cuantizaciones de entre 10,7 GB y 27,0 GB. El repositorio incluye ademas ficheros mmproj, propios de proyectores multimodales en llama.cpp, lo que apunta a un posible soporte de vision en el modelo base, si bien las etiquetas y la model card no lo confirman.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo "A4B" sugiere MoE con ~4B activos; no confirmado en la model card) |
| Parametros totales | 25.233.142.046 (~25,2 B), segun tensores safetensors del modelo base |
| Parametros activos | no confirmado (~4 B segun la nomenclatura del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (10,7 GB), Q4_K_S (15,6 GB), Q8_0 (27,0 GB); ademas mmproj-Q8_0 (0,9 GB) y mmproj-f16 (1,3 GB). La metadata del autor menciona otros tipos (f16, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS) no presentes en la tabla de ficheros publicada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base Vortex5/Fenrir-X-26B-A4B |

| Metadato adicional | Valor |
|---|---|
| Autor de la cuantizacion | mradermacher |
| Modelo base | Vortex5/Fenrir-X-26B-A4B |
| Libreria declarada | transformers |
| Tamano del repositorio | 54,9 GB |
| Etiquetas | mergekit, merge, roleplay, storytelling, conversational |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura interna, el proceso de entrenamiento o el dataset. Lo unico verificable es que el modelo base es un merge construido con mergekit, tecnica que combina los pesos de varios modelos ya entrenados mediante estrategias de interpolacion, concatenacion de capas o enrutado de expertos, sin un ciclo de preentrenamiento adicional. Esto implica que el conocimiento y los sesgos del modelo final son la agregacion de los de sus modelos origen, que no se enumeran en la informacion disponible.

Tampoco se documentan tokens de entrenamiento, composicion del corpus, ni si hubo fases de RLHF, DPO o SFT. La presencia de ficheros mmproj (proyector multimodal para llama.cpp) sugiere que el modelo base podria incluir un encoder de vision, pero no es posible confirmarlo ni determinar su alcance con los datos disponibles. Las cuantizaciones publicadas son de tipo "static": el propio autor indica que no ha generado versiones weighted/imatrix, lo que puede afectar ligeramente a la perplejidad en los tamaños mas bajos (Q2_K).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay e interpretacion de personajes.
- Escritura creativa y narrativa: storytelling, ficcion, continuacion de relatos y descripcion de escenas.
- Dialogo multi-turno con mantenimiento de personaje y estilo, segun la orientacion de las etiquetas del repositorio.
- Posible soporte multimodal (vision) a traves de los ficheros mmproj incluidos; no confirmado por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Motores de roleplay local: el modelo puede sostener conversaciones multi-turno interpretando personajes, y su naturaleza de merge orientado a roleplay lo hace adecuado para aplicaciones tipo SillyTavern o koboldcpp ejecutadas en hardware de consumo sin enviar datos a terceros.
- Asistente de escritura de ficcion: generacion y continuacion de relatos, desarrollo de dialogos y exploracion de variantes argumentales, aprovechando el enfasis del modelo en storytelling.
- Generacion de dialogos para guiones y videojuegos: produccion de lineas de personaje con tono consistente, que despues pueden revisarse o filtrarse manualmente.
- Prototipado de chatbots con personalidad definida: gracias a las cuantizaciones Q4_K_S y Q2_K, permite levantar un prototipo funcional en una unica GPU de 16-24 GB con llama.cpp u Ollama.
- Herramienta de mesa para juegos de rol: generacion de descripciones de escenarios, PNJ y respuestas improvisadas para un master durante una partida, con baja latencia en cuantizaciones pequenas.
- Base para ajuste fino (fine-tuning) en dominios narrativos: al ser un merge con licencia Apache-2.0, puede servir como punto de partida para LoRA o ajustes especificos; conviene verificar antes la licencia de los modelos origen del merge.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local en formato GGUF, es apto para flujos donde el texto no puede salir de la infraestructura propia.
- Experimentacion con cuantizacion multimodal: si el mmproj funciona correctamente, permitiria probar entradas de imagen junto con texto en llama.cpp, aunque esta capacidad no esta documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de rol, y tampoco se proporcionan resultados del modelo base Vortex5/Fenrir-X-26B-A4B.

## Requisitos de hardware

- Q2_K (10,7 GB de fichero): viable en GPUs consumer de 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB, RTX 4080). Es el punto de entrada para hardware modesto, con perdida de calidad esperable.
- Q4_K_S (15,6 GB de fichero): encaja con holgura en RTX 4090, RTX 3090, RTX 4080 Super o A5000 (16-24 GB); en GPUs de 12 GB requeriria offload parcial de capas a CPU/RAM.
- Q8_0 (27,0 GB de fichero): necesita 32 GB o mas de VRAM (A100 40 GB, H100, o configuracion multi-GPU con 2x RTX 3090/4090).
- Vision (si se usa): sumar aproximadamente 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16) al presupuesto de memoria.
- Reservar VRAM adicional para la cache KV, cuyo tamano depende de la longitud de contexto y del numero de capas, dato no disponible.
- Opciones de despliegue compatibles con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, Jan. El soporte de GGUF en vLLM es limitado y no se recomienda para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fenrir-X-26B-A4B (este) | ~25,2 B | no confirmado (~4 B segun nomenclatura) | no disponible | apache-2.0 | GGUF (mradermacher) y safetensors (modelo base) |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 128K | apache-2.0 | safetensors, GGUF, ampliamente validado |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32K | apache-2.0 | safetensors, GGUF |
| Mistral-Nemo-12B | ~12,2 B | denso | 128K | apache-2.0 | safetensors, GGUF |

Nota: los datos de las alternativas provienen de sus model cards publicas y deben verificarse en la fuente original. Para Fenrir-X-26B-A4B no hay ningun benchmark publicado, por lo que no es posible comparar rendimiento con las alternativas listadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que respalde la calidad del modelo en tareas de rol, narrativa o conocimiento general.
- Modelo recien publicado y sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no ha sido validado por la comunidad.
- Idiomas: solo ingles declarado; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Arquitectura y contexto desconocidos: al no confirmarse si es MoE ni cual es la ventana de contexto, el dimensionado de memoria y la planificacion de produccion son inciertos.
- Riesgo de alucinacion: especialmente en modelos de rol y merges sin ajuste por preferencias documentado, con tendencia a inventar hechos y a romper la coherencia en conversaciones largas.
- Sesgos: al ser un merge de modelos no identificados, hereda los sesgos de sus componentes, que no pueden auditarse con la informacion disponible.
- Contenido: los modelos orientados a roleplay suelen no estar alineados con filtros de seguridad. No se documenta ningun proceso de moderacion.
- Licencia: el repositorio declara Apache-2.0, pero al tratarse de un merge conviene comprobar las condiciones de los modelos origen antes de un uso comercial.
- Cuantizaciones estaticas: el autor no ha publicado versiones weighted/imatrix, por lo que los cuantos mas agresivos (Q2_K) pueden degradar mas la calidad de lo habitual.
- Vision no documentada: los ficheros mmproj existen, pero su funcionamiento no esta verificado por el autor ni por terceros.
- Modelo base sin ficha tecnica accesible en la informacion proporcionada: se desconoce el proceso de entrenamiento y la procedencia de los datos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Fenrir-X-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Vortex5/Fenrir-X-26B-A4B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Fenrir-X-26B-A4B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Patrocinador del autor: https://www.nethype.de/
