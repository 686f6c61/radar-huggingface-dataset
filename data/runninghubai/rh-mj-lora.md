# RunningHubAI/rh-mj-lora

## Resumen

rh-mj-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, con pipeline declarado image-text-to-image y orientado a su uso dentro de ComfyUI. No se trata de un modelo de lenguaje ni de un modelo generativo completo, sino de un peso adicional de 224 MiB (`FDHER_DF.safetensors`) que se carga sobre un modelo base de difusion. La model card indica que el ajuste parte de "krea2", aunque no se detalla la arquitectura, el tamano ni la version concreta de ese modelo base.

La unica descripcion funcional disponible en el repositorio es un prompt de ejemplo que define un estilo muy acotado: retrato fotorrealista en primer plano de una mujer joven de rasgos marcados, con abrigo rojo brillante parcialmente abierto, labios rojos, pelo negro corto, expresion seria mirando a camara, fondo con degradado difuminado de rojo y beige e iluminacion dramatica. Esto sugiere que el LoRA esta entrenado para reproducir una estetica editorial concreta (retrato de moda/estudio con paleta roja) mas que para edicion generica de imagenes.

Es relevante ahora porque forma parte del catalogo creciente de LoRA de estilos y personajes que la plataforma RunningHub publica en Hugging Face bajo su cuenta `RunningHubAI`, con modelos hermanos como `rh-b-mj-lora`. Para un desarrollador o investigador, el interes practico esta en la posibilidad de integrar el adaptador en flujos ComfyUI o en la API de RunningHub para producir imagenes coherentes con ese estilo sin entrenar desde cero. La ausencia de informacion sobre licencia, datos de entrenamiento y metricas limita su evaluacion rigurosa y obliga a tratar los datos no publicados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre un modelo base de difusion; arquitectura concreta del base no disponible |
| Parametros totales | no disponible (peso del adaptador de 224 MiB; numero de parametros no publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la model card solo incluye un prompt de ejemplo en ingles |
| Licencia | no disponible ("Published by RunningHub on behalf of the author", se remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`FDHER_DF.safetensors`, 224 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | "krea2" (segun el campo "Finetuned from" de la model card; sin mas detalle) |
| Plataformas declaradas | ComfyUI / RunningHub / Hugging Face |
| Autor | RunningHub, usuario @洛川MLKBC |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-image |
| Etiquetas | comfyui, lora, image-text-to-image, region:us |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA, un mecanismo de ajuste eficiente que congela el modelo base e introduce matrices de bajo rango entrenables en determinadas capas. El unico fichero de pesos publicado es `FDHER_DF.safetensors`, de 224 MiB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo. El campo "Finetuned from: krea2" es la unica referencia al modelo base; no se especifica si se trata de una variante de difusion latente, de un transformer de difusion ni de que version concreta.

No hay informacion publicada sobre el numero de pasos de entrenamiento, el volumen de imagenes, la composicion del dataset, el rango del LoRA, la tasa de aprendizaje ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en adaptadores de estilo de imagen). Tampoco se documenta ninguna innovacion tecnica mas alla del propio uso de LoRA. En la practica, la unica evidencia del comportamiento entrenado es el prompt de ejemplo de la model card, que describe un retrato de estudio con abrigo rojo, pelo negro corto y fondo degradado rojo-beige.

## Capacidades

- Generacion y edicion de imagen condicionada por texto a partir de una imagen de entrada, segun el pipeline image-text-to-image declarado.
- Reproduccion de un estilo de retrato fotorrealista muy concreto: primer plano, iluminacion dramatica, contraste rojo/beige y expresion frontal a camara.
- Integracion en flujos de trabajo de ComfyUI como nodo LoRA sobre el modelo base correspondiente.
- Ejecucion en la plataforma RunningHub, tanto en modo interactivo como mediante su API.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; no hay documentacion al respecto y el unico ejemplo de prompt esta en ingles.
- Capacidades especiales (modo thinking, vision, audio): no aplica; el unico modo documentado es la generacion/edicion de imagen.

## Casos de uso

- Retrato editorial de moda: el LoRA permite generar imagenes de estudio coherentes con la estetica descrita en la model card (abrigo rojo, fondo degradado, luz dramatica) para maquetas de campana o moodboards, encadenando el adaptador con el modelo base en ComfyUI.
- Pruebas de vestuario virtual: partiendo de una imagen de referencia de una prenda, se puede editar la escena para previsualizar como queda en un retrato a primer plano antes de producir el catalogo definitivo.
- Contenido para redes sociales con identidad visual fija: al fijar una paleta y un encuadre concretos, el adaptador ayuda a mantener consistencia estetica entre publicaciones sin reentrenar cada vez.
- Generacion de variaciones a partir de una imagen existente: el pipeline image-text-to-image permite introducir una imagen base y modificar detalles mediante prompt, util para explorar alternativas de expresion, encuadre o color de una sesion ya realizada.
- Prototipado rapido en pipelines de diseno grafico: integracion en un flujo ComfyUI existente como nodo adicional, de modo que un equipo pueda comparar el resultado de este LoRA frente a otros estilos sin cambiar de herramienta.
- Automatizacion via API de RunningHub: para producir lotes de imagenes con esta estetica desde un servicio propio, delegando el computo en la plataforma y evitando desplegar el modelo base en infraestructura propia.
- Pruebas de concepto en investigacion sobre adaptadores de estilo: al ser un LoRA pequeno (224 MiB) con un objetivo estetico muy definido, sirve como caso de estudio para medir como un adaptador de bajo rango desplaza la distribucion de salida de un modelo base de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de imagen, evaluaciones humanas) ni comparaciones con otros adaptadores. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El requisito dominante no es el adaptador (224 MiB) sino el modelo base "krea2" sobre el que se carga, cuyas especificaciones no se publican en este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base y de la cuantizacion que se aplique a este.
- Opciones de despliegue: ComfyUI (plataforma principal declarada), RunningHub (interfaz web y API) y Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusion de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del adaptador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-mj-lora (este modelo) | LoRA de edicion de imagen | "krea2" | 224 MiB | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-b-mj-lora | LoRA de image-text-to-image | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| MJ MODE (RunningHub) | LoRA de estilo | no disponible | no disponible | no disponible | RunningHub |

No hay datos publicos de rendimiento, contexto ni parametros para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a la modalidad de distribucion y al tipo de artefacto.

## Limitaciones y advertencias

- No se publica licencia concreta: la model card solo indica que RunningHub publica el modelo en nombre del autor, que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible aclarar la licencia del modelo base "krea2" y la del propio adaptador.
- Sesgos conocidos: no documentados. El unico ejemplo publicado describe un unico tipo de sujeto y estetica, por lo que es previsible un sesgo hacia ese encuadre, esa paleta y ese perfil demografico si no se compensa con el prompt.
- Riesgo de sobreajuste al estilo: al tratarse de un LoRA de estilo muy especifico, es probable que el adaptador empuje las salidas hacia su estetica entrenada y reduzca la diversidad cuando se combina con otros prompts.
- Alucinacion y fidelidad: no hay evaluacion publicada sobre la fidelidad del modelo a la imagen de entrada en tareas de edicion, ni sobre la preservacion de identidad o de detalles finos.
- Limitaciones de idioma: no hay informacion sobre el soporte multilingue de los prompts; el unico ejemplo esta en ingles.
- Ausencia de contexto y parametros: al no publicarse la ficha del modelo base, no se puede garantizar la compatibilidad con otras versiones o variantes del mismo, ni estimar requisitos de hardware con precision.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de reportes de errores.
- Fechas del repositorio: la creacion y la ultima actualizacion figuran en 2026-09-25, con apenas un minuto de diferencia entre ambas, sin historial posterior de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-mj-lora
- Model card en chino (referenciada en el README): https://huggingface.co/RunningHubAI/rh-mj-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2100906031961432066
- Pagina del autor (@洛川MLKBC): https://www.runninghub.cn/user-center/2089725521297760258
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Modelo hermano: https://huggingface.co/RunningHubAI/rh-b-mj-lora
- Cuenta de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
- Biblioteca de modelos y LoRA de RunningHub: https://www.runninghub.ai/models
