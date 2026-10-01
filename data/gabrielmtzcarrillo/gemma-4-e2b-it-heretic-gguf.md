# gabrielmtzcarrillo/gemma-4-E2B-it-heretic-gguf

## Resumen

El modelo gabrielmtzcarrillo/gemma-4-E2B-it-heretic-gguf es una version cuantizada en formato GGUF, publicada por el usuario gabrielmtzcarrillo, que parte del modelo base google/gemma-4-E2B-it. Segun las etiquetas del repositorio, se trata de un modelo multimodal (pipeline any-to-any) y conversacional, derivado de la familia Gemma de Google, si bien la ficha publica no detalla la arquitectura interna ni el numero exacto de parametros.

El sufijo heretic, junto con las etiquetas uncensored y abliterated, indica que el modelo ha sido sometido a un proceso de abliteracion: una tecnica de edicion de pesos que elimina la denominada direccion de rechazo en el espacio de activaciones para reducir los comportamientos de negativa del modelo original sin reentrenarlo desde cero. El identificador E2B apunta a un modelo con parametros efectivos del orden de 2.000 millones, siguiendo la nomenclatura usada en la familia Gemma 3n, aunque este dato no se confirma de forma explicita en la informacion disponible.

El modelo esta orientado a su uso con llama.cpp y otros entornos compatibles con GGUF, y su licencia declarada en las etiquetas es apache-2.0. Se publico el 30 de septiembre de 2026 y, en el momento de redactar esta ficha, contaba con 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no especifica la arquitectura; el pipeline any-to-any sugiere un modelo multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (los niveles concretos no se detallan en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun las etiquetas del repositorio; el campo de licencia de la API de HuggingFace figura como no disponible) |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base google/gemma-4-E2B-it mas alla de su condicion multimodal (etiqueta any-to-any) y de su caracter conversacional. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF, DPO u otros ajustes de alineamiento. El identificador E2B, propio de la nomenclatura de parametros efectivos, sugiere que parte de los pesos podrian activarse de forma selectiva por token, pero no hay confirmacion en la ficha.

El elemento tecnico diferencial es el proceso de abliteracion indicado por el autor. Esta tecnica calcula, a partir de pares de peticiones daninas e inofensivas, una direccion en el espacio de activaciones asociada al rechazo, y la resta de los pesos del modelo para eliminar dicha direccion. El resultado es un modelo con menor propension a rechazar peticiones, pero no implica un reentrenamiento ni una mejora de capacidades: es una edicion post-entrenamiento que puede afectar a la coherencia y al alineamiento de seguridad original. No se documenta que herramienta concreta se uso ni el pipeline de cuantizacion aplicado.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational del repositorio.
- Procesamiento multimodal potencial: la etiqueta any-to-any sugiere capacidad de recibir y generar mas de una modalidad (texto, imagen, audio o video), aunque no se especifica cuales.
- Comportamiento desinhibido: por el proceso de abliteracion, tiende a reducir las negativas ante peticiones que el modelo base rechazaria.
- Inferencia local: el formato GGUF permite ejecucion en CPU y GPU mediante llama.cpp y herramientas derivadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Generacion creativa sin filtros restrictivos: el proceso de abliteracion reduce las negativas automaticas, por lo que puede emplearse en escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo base rechazaria. Requiere revision humana del contenido generado.
- Investigacion sobre seguridad y alineamiento: sirve como material de estudio para comparar el comportamiento de un modelo alineado frente a su version abliterada, y para medir el impacto de la edicion de pesos en la coherencia y en la tasa de respuestas daninas.
- Red-teaming de sistemas de moderacion: permite generar prompts y respuestas adversarias para probar clasificadores de contenido y filtros de seguridad en pipelines de produccion.
- Despliegue local en hardware de consumo: al distribuirse en GGUF para llama.cpp, puede ejecutarse en un portatil o en una estacion de trabajo sin GPU dedicada, lo que facilita prototipos sin depender de APIs en la nube.
- Asistente conversacional autoalojado: para entornos donde la privacidad impide enviar datos a servicios externos, el modelo puede ejecutarse en local y atender conversaciones multi-turno, siempre que el contexto y los idiomas soportados sean suficientes para el caso concreto.
- Base para ajuste fino o destilacion: al ser un modelo de parametros efectivos reducidos, puede servir como punto de partida para experimentos de fine-tuning o LoRA en tareas especificas, aunque la ausencia de datos de entrenamiento documentados complica la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Si el identificador E2B corresponde a un modelo de aproximadamente 2.000 millones de parametros efectivos, una cuantizacion Q4_K_M ocuparia en torno a 1,5-2 GB de pesos, cifra que debe considerarse orientativa y no verificada.
- GPU recomendadas: no especificadas por el autor. Por escala, un modelo de este orden de magnitud podria ejecutarse en GPUs de consumo como una RTX 3060, 4060 o superiores, e incluso en iGPU con memoria compartida.
- Compatibilidad con GPU de consumo: probable segun el tamano estimado, pero no confirmada en la informacion disponible.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (por ejemplo, Ollama, llama-cpp-python o servidores basados en llama.cpp). El tag endpoints_compatible sugiere compatibilidad con infraestructura de endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteracion no elimina los sesgos del modelo original y puede reducir su coherencia en tareas complejas; no es una mejora de capacidades, sino una modificacion del comportamiento de rechazo.
- Riesgo elevado de generar contenido danino, ofensivo o inexacto al haberse suprimido los mecanismos de negativa. No es recomendable su uso en aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: al no documentarse el entrenamiento ni evaluaciones, no hay garantias sobre la fiabilidad factual de las respuestas.
- Idiomas soportados y longitud de contexto no disponibles, lo que impide garantizar su idoneidad para escenarios multilingues o con contexto largo.
- Licencia declarada como apache-2.0 en las etiquetas, pero el campo de licencia de la API figura como no disponible; conviene verificar los terminos antes de un uso comercial, especialmente por la condicion de modelo derivado y abliterado.
- Modelo con 0 descargas y 0 likes en el momento de la publicacion, sin validacion por parte de la comunidad ni evaluaciones independientes.
- La referencia arxiv:2607.02770 aparece en las etiquetas, pero no se ha podido verificar su contenido ni su relacion concreta con este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/gabrielmtzcarrillo/gemma-4-E2B-it-heretic-gguf
- Modelo base declarado: https://huggingface.co/google/gemma-4-E2B-it
- Referencia arxiv incluida en las etiquetas: https://arxiv.org/abs/2607.02770
