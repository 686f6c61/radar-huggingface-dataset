# mradermacher/Gemma-4-E4B-Abliterated-GGUF

## Resumen

Gemma-4-E4B-Abliterated-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario mradermacher sobre el modelo DuoNeural/Gemma-4-E4B-Abliterated. Se trata, por tanto, de un artefacto de distribucion y no de un modelo entrenado desde cero: el trabajo del autor consiste en convertir los pesos originales a formato GGUF y generar 12 variantes de cuantizacion (desde Q2_K hasta f16) listas para su uso en llama.cpp y derivados. El modelo subyacente cuenta con 7.518.069.290 parametros totales, segun los metadatos de safetensors reportados por HuggingFace.

El calificativo "Abliterated" hace referencia a una tecnica de edicion de pesos que elimina o atenua las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo responde a instrucciones que un modelo alineado rechazaria. Es relevante ahora porque el ecosistema de modelos "sin censura" demanda versiones cuantizadas para ejecucion local en hardware de consumo, y este repositorio cubre ese hueco para un modelo de la familia Gemma segun indica su nombre. No obstante, la model card del repositorio es puramente operativa (tipos de cuantizacion y enlaces de descarga) y no aporta informacion sobre arquitectura, contexto, licencia ni datos de entrenamiento.

La ficha que sigue distingue de forma explicita entre los datos verificados en el repositorio (parametros, tamanos de archivo, quilates de cuantizacion, idioma declarado) y los campos marcados como "no disponible". Cualquier afirmacion sobre el modelo base que no aparezca en los metadatos se senala como inferencia no confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no descrita en la model card; el nombre sugiere la familia Gemma de Google, sin confirmar) |
| Parametros totales | 7.518.069.290 (~7,52 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (4,5 GB), Q3_K_S (4,8 GB), Q3_K_M (5,0 GB), Q3_K_L (5,1 GB), IQ4_XS (5,2 GB), Q4_K_S (5,3 GB), Q4_K_M (5,4 GB), Q5_K_S (5,8 GB), Q5_K_M (5,9 GB), Q6_K (6,3 GB), Q8_0 (8,1 GB), f16 (15,2 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 75,3 GB |
| Modelo base | DuoNeural/Gemma-4-E4B-Abliterated |
| Cuantizaciones ponderadas (imatrix) | disponibles en repositorio separado (sufijo i1-GGUF) |
| Descargas / likes | 397 / 1 |
| Fecha de creacion / actualizacion | 2026-04-24 / 2026-10-14 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye ningun detalle sobre la arquitectura del modelo base (tipo de transformer, atencion, uso de mezcla de expertos, atencion lineal u otras innovaciones). El nombre "Gemma-4-E4B" apunta a la familia Gemma de Google y a una convencion de nomenclatura con parametros efectivos, pero esto no esta confirmado en la model card ni en los metadatos del repositorio, por lo que no debe tomarse como un dato tecnico verificado. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo unico documentado sobre el proceso es la intervencion de mradermacher: conversion de los pesos del modelo base a formato GGUF y generacion de cuantizaciones estaticas (con la marca interna `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`). El autor indica que las variantes con imatrix ponderada se publican en un repositorio aparte. La model card no incluye ningun detalle sobre como se realizo la "abliteracion" en el modelo original (metodo, capas afectadas, evaluacion del dano colateral), lo que impide valorar su impacto real sobre la calidad.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` figura entre los tags del repositorio, y el formato GGUF es compatible con plantillas de chat en llama.cpp y Ollama.
- Ejecucion local sin conexion: los 12 ficheros GGUF permiten inferencia en CPU y GPU sin dependencia de APIs externas.
- Respuesta sin rechazos: al derivar de un modelo "abliterated", se espera que no aplique las negativas tipicas de un modelo alineado; este comportamiento no esta cuantificado en ninguna evaluacion publicada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el modelo puede servirse a traves de infraestructura de inferencia compatible con HuggingFace.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: solo ingles declarado; no hay soporte de otros idiomas confirmado.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible (no declarado).

## Casos de uso

- Ejecucion local en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_S y Q4_K_M (~5,3-5,4 GB) caben en memoria RAM de un portatil convencional y permiten un asistente de texto offline mediante llama.cpp, sin enviar datos a terceros.
- Prototipado de aplicaciones conversacionales en ingles: con la variante Q5_K_M o Q6_K se puede levantar un servidor de chat local (Ollama, LM Studio) para validar prompts, plantillas y flujos de dialogo antes de escalar a un modelo mayor.
- Generacion de texto creativo sin filtros editoriales: el caracter "abliterated" lo hace util en escenarios de escritura de ficcion o guiones donde un modelo alineado bloquearia tematicas adultas o violentas; requiere revision humana del resultado.
- Investigacion sobre seguridad y alineacion: sirve como sujeto de estudio para medir cuanto se degrada la coherencia y la utilidad de un modelo al eliminar las direcciones de rechazo, comparando sus salidas con las del modelo base sin abliterar.
- Extraccion y reformulacion de texto en pipelines de procesado por lotes: al ser un GGUF pequeno (~5-6 GB), se puede ejecutar en un contenedor con CPU para tareas de resumen, reescritura o normalizacion de documentos en ingles a bajo coste.
- Despliegue en entornos aislados (air-gapped): al distribuirse como ficheros unicos descargables, es viable en redes sin acceso a internet, algo habitual en laboratorios y entornos industriales.
- Pruebas comparativas de cuantizacion: con 12 niveles disponibles desde Q2_K hasta f16, el repositorio es util para medir la perdida de perplejidad y de calidad en funcion del numero de bits, dentro de una misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), y los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre el modelo: devuelven exclusivamente sitios de contenido para adultos sin relacion alguna con el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (peso del fichero mas 1-2 GB de margen para el contexto y el runtime de llama.cpp):
  - f16 (15,2 GB): ~17 GB de VRAM o ejecucion mixta GPU/CPU.
  - Q8_0 (8,1 GB): ~10 GB de VRAM.
  - Q6_K (6,3 GB): ~8 GB de VRAM.
  - Q5_K_M (5,9 GB) y Q5_K_S (5,8 GB): ~7,5 GB de VRAM.
  - Q4_K_M (5,4 GB) y Q4_K_S (5,3 GB): ~7 GB de VRAM.
  - IQ4_XS (5,2 GB): ~6,8 GB de VRAM.
  - Q3_K_L / Q3_K_M / Q3_K_S (5,1 / 5,0 / 4,8 GB): ~6,5 GB de VRAM.
  - Q2_K (4,5 GB): ~6 GB de VRAM.
- GPU recomendadas: para f16, una RTX 4090, RTX 3090, A100 o H100 (24 GB o mas); para Q8_0, una RTX 4080, RTX 4070 Ti Super o A6000; para Q4_K_M y Q5_K_M, una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB van sobradas.
- Compatibilidad con GPU de consumo: si. Las variantes Q4 y Q5 caben en tarjetas de 8 GB (RTX 3070, RTX 4060) si se limita la longitud de contexto; las variantes Q2_K y Q3_K permiten incluso GPU de 6 GB con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui para el formato GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos en safetensors del modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de tamano equivalente y ampliamente documentados, ya que no hay datos publicados de rendimiento para este repositorio. Los datos de los modelos alternativos provienen de sus fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-Abliterated-GGUF | 7,52 B | no disponible | no disponible | GGUF | Sin guardarrailes de seguridad; sin benchmarks publicados |
| Llama-3.1-8B-Instruct | 8,03 B | 128 k | Llama 3.1 Community License | safetensors, GGUF | Alineado, 8 idiomas oficiales, amplio ecosistema de cuantizaciones |
| Qwen2.5-7B-Instruct | 7,62 B | 131 k (con YaRN) | Apache 2.0 | safetensors, GGUF | 29 idiomas, soporte declarado de tool calling |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32 k | Apache 2.0 | safetensors, GGUF | Soporte de function calling, licencia permisiva |

A diferencia de las alternativas, este repositorio no declara licencia ni contexto, no publica evaluaciones y su principal diferenciador es la ausencia de alineacion de seguridad, no una mejora de capacidades.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: la abliteracion elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o gravemente sesgado sin ningun tipo de filtro. No es apto para aplicaciones de cara al publico sin una capa adicional de moderacion.
- Degradacion potencial de la coherencia: la edicion de pesos orientada a suprimir el rechazo suele afectar a otras capacidades del modelo; no hay ninguna evaluacion publicada que cuantifique ese dano en este caso concreto.
- Sesgos conocidos: no disponible. No se ha publicado ningun analisis de sesgos del modelo base ni de esta version.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks ni evaluaciones, no hay datos que permitan estimar la fiabilidad factual.
- Limitacion idiomatica: el unico idioma declarado es el ingles. El uso en castellano no esta soportado ni validado y producira resultados de calidad impredecible.
- Longitud de contexto desconocida: al no declararse, no se puede planificar su uso en tareas que requieran ventanas largas (analisis de documentos extensos, conversaciones multi-turno prolongadas).
- Incertidumbre sobre la licencia: el repositorio no declara licencia. Al derivar de un modelo de la familia Gemma segun su nombre, es probable que apliquen los terminos de uso de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; la ausencia de licencia explicita impide confirmar si el uso comercial esta permitido. Verificar antes de cualquier despliegue en produccion.
- Perdida por cuantizacion: las variantes Q2_K y Q3_K degradan notablemente la calidad; el propio autor desaconseja Q3_K_M ("lower quality") y recomienda Q4_K_S, Q4_K_M o Q8_0 para un equilibrio entre tamano y fidelidad.
- Repositorio voluminoso: 75,3 GB en total, lo que exige planificar el almacenamiento si se descargan multiples cuantizaciones a la vez.
- Procedencia poco documentada: no hay informacion sobre el dataset de entrenamiento, el metodo de abliteracion ni evaluaciones del modelo base, lo que dificulta auditar su comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-E4B-Abliterated-GGUF
- Modelo base: https://huggingface.co/DuoNeural/Gemma-4-E4B-Abliterated
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Gemma-4-E4B-Abliterated-i1-GGUF
- Pagina de resumen y listado de descargas del autor: https://hf.tst.eu/model#Gemma-4-E4B-Abliterated-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
