# RunningHubAI/rh-zhang-yaqian-lora

## Resumen

rh-zhang-yaqian-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face. Segun su model card, se ha afinado a partir de un modelo base identificado como "krea2" y su unico fichero de pesos es `wanghong_krea2.safetensors`, de 218 MiB, lo que lo situa en la categoria de adaptadores ligeros que se cargan sobre un modelo de difusion ya existente. La etiqueta de pipeline declarada es `image-text-to-image`, es decir, generacion o edicion de imagenes condicionada simultaneamente por texto y por una imagen de entrada.

El proposito declarado del adaptador es la personalizacion de un sujeto concreto, identificado en la model card con el nombre Zhang Yaqian (张雅倩), mediante la palabra de activacion `ZYQ`. No se documentan datos de entrenamiento, numero de imagenes, resolucion, rango del adaptador ni hiperparametros, y el repositorio no incluye informacion sobre la licencia aplicable mas alla de una nota que remite al proyecto original.

La relevancia de esta ficha es limitada y debe leerse con cautela: el repositorio presenta cero descargas y cero "likes" en el momento de la consulta, no publica benchmarks ni resultados cualitativos, y su licencia no esta explicitada. Es util, por tanto, como ejemplo del flujo de publicacion de LoRAs de sujeto para ComfyUI y de la integracion con la plataforma RunningHub, pero no como un modelo evaluado y listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de generacion de imagen identificado como "krea2"; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el fichero de pesos ocupa 218 MiB) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen; la ventana de texto depende del codificador del modelo base) |
| Tipos de cuantizacion | no disponible; solo se distribuye el adaptador en safetensors |
| Idiomas soportados | no disponible (la cobertura linguistica depende del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`wanghong_krea2.safetensors`) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base (finetuned from) | krea2 |
| Palabra de activacion | ZYQ |
| Tamano del repositorio | 0,2 GB |
| Ficheros | `wanghong_krea2.safetensors` (218 MiB) |
| Pipeline declarado | image-text-to-image |
| Plataformas compatibles declaradas | ComfyUI, RunningHub, Hugging Face |
| Etiquetas | comfyui, lora, image-text-to-image, region:us |
| Fecha de creacion / actualizacion | 2026-09-27 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del adaptador ni sobre el modelo base. La model card unicamente indica que el modelo es un LoRA de tipo "image edit" afinado a partir de "krea2", sin especificar el rango del adaptador, las capas objetivo, la dimension de las matrices de bajo rango ni el metodo de inicializacion. El unico dato cuantitativo es el tamano del fichero de pesos, 218 MiB, que corresponde al adaptador y no al modelo base.

Tampoco se documenta el proceso de entrenamiento: no hay numero de imagenes, resolucion de entrenamiento, numero de pasos, tasa de aprendizaje, composicion del dataset ni si se aplicaron tecnicas de regularizacion o de captioning. No se menciona el uso de RLHF, DPO ni ningun otro metodo de alineacion, lo cual es coherente con la naturaleza de un adaptador de personalizacion visual. No se describe ninguna innovacion tecnica destacable.

## Capacidades

- Edicion y generacion de imagenes condicionadas por texto y por imagen de entrada, segun el pipeline `image-text-to-image` declarado.
- Personalizacion de un sujeto concreto (Zhang Yaqian) mediante la palabra de activacion `ZYQ`, es decir, reproduccion de rasgos faciales y de identidad visual del sujeto cuando el prompt incluye dicho token.
- Integracion en flujos de trabajo de ComfyUI, segun las etiquetas y la model card.
- Ejecucion en la plataforma cloud RunningHub, incluyendo su API, tal y como se anuncia en el repositorio.
- No se documenta soporte de "tool calling" ni de "function calling": es un modelo de imagen, no un modelo de lenguaje.
- No se documentan capacidades de agente, razonamiento multi-paso ni planificacion.
- No se documenta capacidad multilingue en los prompts; dependeria del codificador de texto del modelo base y no se especifica.
- No se documentan modos especiales (modo "thinking", audio, video, vision comprensiva) mas alla de la propia generacion de imagen.

## Casos de uso

- Generacion de retratos personalizados en ComfyUI: cargando el adaptador sobre el modelo base krea2 y usando `ZYQ` en el prompt, un estudio puede producir variaciones controladas del sujeto en distintos escenarios e iluminaciones sin reentrenar nada.
- Creacion de contenido para redes sociales: el flujo `image-text-to-image` permite partir de una fotografia de referencia y reestilizarla (fondos, vestuario, ambientacion) para producir lotes de imagenes coherentes con una misma identidad visual.
- Pruebas de concepto para agencias de publicidad: generar "moodboards" rapidos en los que el sujeto aparece integrado en escenarios de campana antes de contratar un rodaje real.
- Ilustracion editorial y narrativa seriada: mantener la consistencia de un personaje recurrente a lo largo de varias ilustraciones, aprovechando que un LoRA de sujeto impone una identidad estable entre generaciones.
- Prototipado dentro de la plataforma RunningHub: dado que el modelo se anuncia para su ejecucion en dicha plataforma y en su API, sirve para montar demos o endpoints de generacion de imagen sin infraestructura propia.
- Composicion de varios adaptadores (LoRA stacking): al ser un adaptador ligero de 218 MiB, puede combinarse con otros LoRAs de estilo sobre el mismo modelo base para explorar variaciones esteticas.
- Experimentacion academica sobre personalizacion de difusion: como ejemplo reproducible de adaptador de sujeto publicado en Hugging Face, resulta util para estudiar sesgos de identidad, sobreajuste a la palabra de activacion y calidad de la preservacion facial.
- Previsualizacion en pipelines de generacion por lotes: al tener un coste de inferencia dominado por el modelo base, el adaptador puede anadirse o retirarse de un pipeline sin cambiar la infraestructura subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud facial, SSIM frente a imagenes de referencia), ni comparaciones cuantitativas con otros adaptadores. Tampoco se aportan ejemplos visuales en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al tratarse de un adaptador LoRA, el consumo de memoria lo determina integramente el modelo base (krea2), cuyos requisitos no se documentan en este repositorio.
- GPU recomendadas: no disponible por la misma razon; no se puede afirmar compatibilidad con A100, H100, RTX 4090 ni ninguna otra tarjeta concreta.
- Compatibilidad con GPU de consumo: no confirmada. Depende por completo del modelo base y del nivel de cuantizacion que este admita.
- Espacio en disco: 218 MiB para el adaptador, dentro de un repositorio de 0,2 GB.
- Opciones de despliegue: ComfyUI (mencionado de forma explicita), plataforma y API de RunningHub (mencionadas en el propio repositorio) y cualquier runtime capaz de cargar un LoRA en safetensors sobre el modelo base correspondiente.
- Latencia y rendimiento: no disponibles. El sobrecoste del adaptador sobre el modelo base no se cuantifica en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA de sujeto comparables, ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria (mismo modelo base krea2 o tareas equivalentes de personalizacion de sujeto). Cualquier comparacion requeriria, como minimo, identificar el modelo base exacto, su licencia y adaptadores equivalentes publicados para el, datos que no constan en este repositorio.

## Limitaciones y advertencias

- Licencia no explicitada: la model card se limita a indicar que el copyright permanece en el autor y a remitir a la licencia del proyecto original o upstream. No hay una declaracion clara de uso comercial permitido o prohibido, lo que supone un riesgo juridico para produccion.
- Restricciones del modelo base: al ser un adaptador, hereda necesariamente las condiciones de licencia y uso de krea2, que no se detallan en este repositorio.
- Derechos de imagen y de personalidad: el adaptador reproduce la identidad visual de una persona identificada por su nombre. Su uso comercial o la generacion de contenido que la represente exige autorizacion expresa; no se documenta ninguna.
- Sesgos conocidos: no se documenta composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo demografico, etnico, de edad, de genero o estetico del adaptador. Los LoRA de sujeto entrenados con pocas imagenes tienden a reproducir los sesgos del conjunto reducido utilizado.
- Riesgo de sobreajuste y de artefactos: no se publican ejemplos ni evaluaciones; un adaptador de sujeto puede degradar la composicion, la anatomía o el fondo cuando la palabra de activacion se combina con estilos alejados del dominio de entrenamiento.
- Alucinacion visual: no hay metricas de fidelidad, por lo que no se puede estimar la tasa de generaciones que no se corresponden con el sujeto o con el prompt.
- Limitaciones de idioma: no se declara ninguna lista de idiomas soportados; el comportamiento con prompts en castellano depende del codificador de texto del modelo base y no esta verificado.
- Ausencia de validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni demos publicadas en el repositorio.
- Coherencia de metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-27) son posteriores a la fecha habitual de consulta, un detalle que conviene verificar antes de citar el modelo.
- Dependencia de plataforma: parte de la documentacion y de los enlaces apuntan a servicios gestionados de RunningHub, lo que puede implicar dependencia de dicha plataforma para reproducir el flujo tal y como se anuncia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-zhang-yaqian-lora
- Pagina del proyecto original en RunningHub: https://www.runninghub.ai/model/public/2095687884174327810
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2034081325295869953
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ficha de la API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: README_cn.md (dentro del repositorio de Hugging Face)
