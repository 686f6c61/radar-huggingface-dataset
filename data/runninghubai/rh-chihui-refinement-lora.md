# RunningHubAI/rh-chihui-refinement-lora

## Resumen

rh-chihui-refinement-lora es un adaptador LoRA orientado a la edicion y el refinado de imagen ("精修", retoque fino), publicado en Hugging Face por la organizacion RunningHubAI en nombre del autor identificado en la model card como @千绘云商. No se trata de un modelo de lenguaje ni de un modelo completo, sino de un conjunto de pesos de adaptacion que se cargan sobre un modelo base de generacion/edicion de imagen. El repositorio ocupa 0,3 GB y contiene un unico archivo de pesos, `千绘精修.safetensors`, de 328 MiB.

El pipeline declarado en la model card es `image-text-to-image`, con etiquetas `comfyui`, `lora` e `image-text-to-image`, lo que lo situa en el ecosistema de ComfyUI y de la plataforma RunningHub para flujos de edicion de imagen. Segun la propia model card, el adaptador esta afinado a partir de un modelo base denominado "F1基础-Kontext" (F1 base - Kontext), una designacion que apunta a la familia de modelos Kontext de edicion de imagen por instrucciones, aunque el autor no especifica la version exacta ni la arquitectura subyacente.

Su relevancia es acotada y practica: sirve como capa de estilizado/refinado que se aplica sobre un modelo base ya existente para mejorar la calidad de acabado de una imagen editada. Al no declararse parametros, contexto, idiomas ni licencia, la informacion publicada es muy escasa y cualquier evaluacion en profundidad requiere consultar la ficha original en RunningHub. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo base de edicion de imagen; la model card no detalla la arquitectura subyacente) |
| Parametros totales | no disponible (el unico dato es el tamano del archivo: 328 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar declarada) |
| Idiomas soportados | no disponible (la model card esta en chino e ingles, pero no declara idiomas de inferencia) |
| Licencia | no disponible (la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`千绘精修.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA de edicion de imagen, no un transformer de lenguaje. La model card indica que esta "finetuned from: F1基础-Kontext", es decir, que se obtiene por ajuste fino de bajo rango sobre un modelo base de la familia Kontext, orientada a edicion de imagen guiada por instrucciones. El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO; tampoco detalla el rango del adaptador, los modulos objetivo ni la estrategia de entrenamiento.

El unico artefacto tecnico verificable es el archivo de pesos `千绘精修.safetensors` (328 MiB), que debe cargarse junto con el modelo base correspondiente dentro de un flujo de ComfyUI o en la plataforma RunningHub. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras) porque, al tratarse de un LoRA de imagen, esas categorias no son aplicables.

## Capacidades

- Edicion y refinado de imagen: el proposito declarado es el "精修" (retoque fino/acabado) sobre imagenes generadas o editadas, aplicado como capa LoRA.
- Flujo image-text-to-image: el pipeline declarado acepta imagen de entrada junto con indicacion textual.
- Integracion con ComfyUI: el tag `comfyui` indica compatibilidad con nodos de carga de LoRA en ese entorno.
- Compatibilidad con RunningHub: la model card ofrece carga y ejecucion en la plataforma RunningHub y acceso via API.
- Generacion de texto: no aplica.
- Razonamiento, matematicas, codigo: no aplica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Acabado de imagenes generadas por IA: aplicar el LoRA sobre un modelo base Kontext para mejorar el detalle fino y la nitidez de imagenes ya generadas, dentro de un flujo de ComfyUI donde el adaptador se inserta como nodo de LoRA.
- Edicion guiada por instrucciones con refinado posterior: usar el pipeline image-text-to-image para editar una imagen existente y, a continuacion, aplicar este adaptador como paso de pulido final.
- Retoque en produccion de contenido grafico: integrar el LoRA en una cadena de postprocesado de material visual generado, donde el paso adicional de refinado se ejecuta de forma automatizada antes de la entrega.
- Prototipado de estilos de acabado: como capa de bajo rango, permite experimentar con distintos grados de fuerza del LoRA (peso de adaptacion) para calibrar la intensidad del refinado sin reentrenar nada.
- Flujos alojados en RunningHub: emplear la API de la plataforma (`call-api`) para encadenar la edicion y el refinado como servicio, sin gestionar infraestructura propia.
- Experimentacion en investigacion sobre adaptadores: sirve como ejemplo de LoRA de bajo rango (328 MiB) para estudiar como un adaptador pequeno modifica el comportamiento de un modelo base de edicion de imagen.
- Replicacion de flujos de la comunidad: al publicarse con el tag `comfyui`, puede incorporarse a workflows compartidos para reproducir el acabado que ofrece el autor en su pagina de RunningHub.

No se documentan en la informacion disponible otros casos de uso (texto, razonamiento, codigo, agentes), dado que el modelo es exclusivamente de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. La VRAM efectiva la determina el modelo base sobre el que se cargue el LoRA, no el propio adaptador de 328 MiB, que se suma como overhead pequeno sobre los pesos base.
- GPU recomendadas: no disponible. Dependera del modelo base; en la familia Kontext de edicion de imagen el requisito tipico de VRAM se situa en el rango de 12 a 24 GB segun precision y cuantizacion, dato que aqui es una estimacion orientativa y no una cifra confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Al tratarse de un adaptador de bajo rango, su viabilidad en GPU de consumo depende enteramente del modelo base; el adaptador en si no anade requisitos significativos.
- Opciones de despliegue: ComfyUI (por el tag `comfyui`), la plataforma RunningHub y su API. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un LoRA de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del repo / pesos | Pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-chihui-refinement-lora | LoRA de edicion de imagen | 0,3 GB / safetensors de 328 MiB | image-text-to-image | no disponible (derechos del autor) | Hugging Face + RunningHub |
| RunningHubAI/rh-ai-lora | LoRA (text-to-image) | 238 MB | text-to-image | no disponible | Hugging Face + RunningHub |
| RunningHubAI/rh-1-lora | LoRA (image-text-to-image) | 235 MB | image-text-to-image | no disponible | Hugging Face + RunningHub |

Los tres son adaptadores LoRA de bajo rango publicados por la misma organizacion y con tamanos similares (entre 235 y 328 MiB). La diferencia principal entre ellos es la tarea declarada: rh-chihui-refinement-lora y rh-1-lora trabajan en el pipeline image-text-to-image, mientras que rh-ai-lora se declara como text-to-image. No se dispone de datos de rendimiento comparativos entre ellos, ni de la identificacion exacta del modelo base de cada uno, por lo que la comparacion se limita a tipo, tamano, pipeline y licencia.

## Limitaciones y advertencias

- Informacion tecnica minima: no se declaran parametros, arquitectura del modelo base, rango del LoRA, dataset de entrenamiento ni proceso de ajuste, lo que impide reproducir o auditar el adaptador.
- Modelo base no identificado con precision: la referencia "F1基础-Kontext" no especifica version ni repositorio exacto; cargar el adaptador sobre una base distinta puede degradar o invalidar el resultado.
- Licencia ambigua: la model card no incluye un texto de licencia explicito; indica que los derechos pertenecen al autor y remite a la licencia del proyecto original. Esto supone un riesgo legal para uso comercial hasta aclararlo con el autor.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, por lo que no existen evaluaciones independientes ni informes de la comunidad.
- Riesgo de artefactos: al ser un LoRA de refinado de imagen, subir en exceso el peso del adaptador puede introducir sobreprocesado, perdida de identidad respecto a la imagen original o artefactos; no hay valores recomendados publicados.
- Sesgos: no disponible. No se documenta ningun analisis de sesgos del adaptador ni del modelo base.
- Alucinacion: no aplica en el sentido de texto; en imagen se traduce en posibles alteraciones no solicitadas del contenido, no cuantificadas por el autor.
- Limitaciones de contexto e idioma: no aplica contexto de texto; los idiomas de las indicaciones dependen del modelo base y no se declaran.
- Fecha de publicacion inusual: los metadatos indican creacion el 2026-10-05, dato que conviene verificar en la ficha original.
- Dependencia de plataforma: buena parte de la documentacion apunta a la propia plataforma RunningHub, lo que puede dificultar su uso fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-chihui-refinement-lora
- Model card original del autor en RunningHub: https://www.runninghub.cn/model/public/1993273448210382850
- Pagina del autor: https://www.runninghub.cn/user-center/1923308486221017089
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ficha de RunningHub del modelo (version internacional): https://www.runninghub.ai/model/public/1993273448210382850
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-ai-lora
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-1-lora
