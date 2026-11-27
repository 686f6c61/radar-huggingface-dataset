# mradermacher/gemma-4-12b-full-cpt-itvec-GGUF

## Resumen

`mradermacher/gemma-4-12b-full-cpt-itvec-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base `ToastyPigeon/gemma-4-12b-full-cpt-itvec`, un derivado de la familia Gemma 4 de Google con 11.907.350.576 parametros (aproximadamente 12B). El autor de las cuantizaciones es mradermacher, conocido en el ecosistema por publicar versiones GGUF de modelos open source para su uso en llama.cpp y herramientas compatibles. El modelo base incorpora las etiquetas `cpt` (continued pre-training) y `task-vector`, lo que sugiere un ajuste mediante preentrenamiento continuado y posiblemente una combinacion de pesos por task vectors, aunque la model card no detalla la metodologia exacta.

El interes practico de esta publicacion es la disponibilidad de cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB), lo que permite ejecutar un modelo de ~12B en hardware de consumo con perdida controlada de calidad. El modelo esta orientado a generacion de texto (`text-completion`) y declara unicamente el idioma ingles. No se dispone de informacion sobre licencia, contexto maximo ni datos de entrenamiento en la informacion proporcionada, lo que limita la evaluacion de su idoneidad para produccion sin una validacion empirica adicional.

La relevancia actual radica en que las cuantizaciones GGUF son el vehiculo principal para desplegar modelos de esta escala en GPUs consumer y CPUs, y esta publicacion ofrece un espectro completo de tamanos con la recomendacion explicita del autor de usar Q4_K_S o Q4_K_M como opciones rapidas y recomendadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer, segun tags) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors via transformers |
| Tamano del repo | 83,4 GB |
| Modelo base | ToastyPigeon/gemma-4-12b-full-cpt-itvec |
| Cuantizaciones con imatrix | disponibles en mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF |
| Fecha de creacion | 2026-09-08 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags indican que pertenece a la familia `gemma4` y que se ha sometido a `cpt` (continued pre-training), es decir, un preentrenamiento continuado sobre el checkpoint original de Gemma 4 12B. La etiqueta `task-vector` sugiere que el modelo base puede haberse construido mediante la combinacion de vectores de tarea, una tecnica de merging de pesos que suma diferencias de ajuste sobre un checkpoint de referencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

El pipeline declarado es `text-completion`, lo que indica que el modelo esta pensado para completar texto sin un formato de chat obligatorio, aunque al derivar de Gemma 4 podria conservar capacidades instruccionales del checkpoint original. Las cuantizaciones de mradermacher se generan con el conversor `hf` a GGUF y se publican en dos variantes: estaticas (este repositorio) y ponderadas con imatrix (`i1`), siendo estas ultimas generalmente preferibles en calidad por tamano similar. No hay informacion sobre innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto y completado de texto en ingles, segun el pipeline declarado (`text-completion`).
- Razonamiento y conocimiento general heredados del checkpoint Gemma 4 subyacente, aunque no cuantificados en la informacion disponible.
- Posible capacidad de seguir instrucciones si el checkpoint base conserva el ajuste instruccional de Gemma 4; no confirmado en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse en infraestructura de inferencia compatible con la API de Hugging Face.

## Casos de uso

- Prototipado local de generacion de texto: usar Q4_K_M (7,5 GB) en una GPU consumer para validar prompts y flujos de completado antes de escalar a un modelo mayor o a la version sin cuantizar.
- Despliegue en CPU o equipos sin GPU dedicada: la variante Q2_K (4,9 GB) permite ejecutar el modelo en memoria RAM de un portatil moderno mediante llama.cpp, con calidad reducida pero suficiente para tareas de completado simples.
- Generacion de texto en ingles para documentacion tecnica: el pipeline `text-completion` encaja en herramientas de autocompletado de parrafos y borradores, siempre que el contenido sea en ingles.
- Experimentacion con task vectors y CPT: investigadores pueden comparar el comportamiento de este derivado frente al Gemma 4 original usando las mismas cuantizaciones para aislar el efecto del preentrenamiento continuado.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes del mismo modelo, lo que permite medir perplejidad y calidad por tamano en un mismo hardware y decidir el punto de equilibrio para un caso concreto.
- Servicio de inferencia ligero con API compatible: gracias al tag `endpoints_compatible`, puede desplegarse en entornos de serving que acepten GGUF para tareas de completado de bajo volumen.
- Fine-tuning o destilacion sobre el modelo base: las cuantizaciones no son adecuadas para reentrenar, pero sirven para generar datos sinteticos de referencia y comparar con el checkpoint en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion: Q2_K ~5-6 GB; Q4_K_M ~8-9 GB; Q6_K ~10-11 GB; Q8_0 ~13-14 GB (incluyendo overhead de contexto y cache KV, que depende de la longitud de contexto no especificada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti 12 GB o RTX 4090 24 GB para las variantes Q4 a Q8; A100 40 GB y H100 80 GB para despliegues concurrentes con contexto largo.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas para Q4_K_S/Q4_K_M; Q8_0 requiere al menos 16 GB de VRAM o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de la configuracion adecuada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12b-full-cpt-itvec-GGUF | ~12B | no disponible | no disponible | GGUF | Derivado CPT/task-vector de Gemma 4 12B, solo ingles |
| ToastyPigeon/gemma-4-12b-full-cpt-itvec | ~12B | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva esta publicacion |
| mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF | ~12B | no disponible | no disponible | GGUF (imatrix) | Misma familia con cuantizaciones ponderadas, generalmente mejor calidad por tamano |
| Gemma 4 12B original (Google) | ~12B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Checkpoint de referencia de la familia; comparacion directa para medir el efecto del CPT |

La comparacion con modelos de otras familias (por ejemplo, Llama 3.1 8B o Mistral 12B) no puede establecerse con rigor porque no se dispone de datos de benchmarks ni de contexto del modelo evaluado.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- No se especifica la licencia del modelo base ni de las cuantizaciones, lo que impide confirmar si el uso comercial esta permitido. Verificar la licencia de Gemma 4 original antes de cualquier despliegue en produccion.
- Al ser un derivado con `cpt` y `task-vector`, puede haber degradado capacidades del checkpoint original (instrucciones, seguridad, multilingue) sin documentacion al respecto.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones Q2_K y Q3_K_S introducen perdida de calidad notable; el autor solo recomienda explicitamente Q4_K_S y Q4_K_M como opciones rapidas.
- El pipeline `text-completion` implica que el modelo puede no respetar formatos de chat si se usa sin plantilla adecuada.
- El repositorio ocupa 83,4 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene descargar solo la variante necesaria.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; no apto para produccion sin auditoria previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-12b-full-cpt-itvec-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt-itvec
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-12b-full-cpt-itvec-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
