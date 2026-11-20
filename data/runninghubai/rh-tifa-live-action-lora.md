# RunningHubAI/rh-tifa-live-action-lora

## Resumen

`rh-tifa-live-action-lora` es un adaptador LoRA de edicion de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI y entrenado por el usuario de RunningHub identificado como "氛围感". No es un modelo de lenguaje ni un modelo fundacional: es un peso adicional de 218 MiB que se aplica sobre el modelo base `krea2` para especializarlo en la generacion de la personaje Tifa Lockhart (Final Fantasy VII) con su atuendo y equipamiento originales, o bien en variantes de cosplay.

El adaptador esta disenado para su uso dentro de ComfyUI y de la plataforma RunningHub, y ofrece tres modos de comportamiento segun el prompt: generacion de cosplay (cualquier mujer caracterizada con el atuendo de Tifa), generacion de rostro CG de Tifa en estilo 3D, y combinacion de rostro CG con el atuendo original. La model card esta redactada en ingles y chino, y el repositorio incluye un unico fichero de pesos en formato safetensors.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion en IA: se trata de un LoRA de personaje (character LoRA) orientado a generacion de imagenes, sin benchmarks publicados, sin licencia declarada de forma explicita y con cero descargas en el momento de la consulta. Es util, sin embargo, como ejemplo de la categoria de adaptadores de bajo rango distribuidos via Hugging Face y consumidos en pipelines de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; pipeline `image-text-to-image` |
| Parametros totales | no disponible (peso del fichero: 218 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts descritos en ingles y chino en la model card) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`tifa krea 2.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atencion (y potencialmente en otras capas) de un modelo de difusion base. La model card indica explicitamente que el modelo esta afinado a partir de `krea2`, por lo que hereda la arquitectura del modelo base; no se detalla en la informacion disponible ni el numero de pasos de entrenamiento, ni el dataset utilizado, ni si hubo tecnicas de regularizacion, captioning o ajuste de learning rate.

La unica informacion tecnica concreta es el tamano del fichero (218 MiB) y la lista de trigger words, que incluye tanto tokens descriptivos en ingles (`tif outfit`, `tifa lockhart`, `black thighhighs`, `white panties`, `solo`) como tokens en chino (`蒂法`) y un token especifico de estilo CG (`zit3dtif`). La presencia de este ultimo sugiere que el entrenamiento diferencio al menos dos representaciones de la personaje: una realista/cosplay y otra de render 3D/CG. No se documenta ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de imagenes de Tifa Lockhart con atuendo y equipamiento originales.
- Modo cosplay: aplica el atuendo iconico de la personaje a cualquier sujeto femenino descrito en el prompt.
- Modo CG: genera rostros de Tifa en estilo 3D/CG mediante el trigger `zit3dtif`.
- Modo combinado: rostro CG con atuendo original en una misma imagen.
- Control mediante trigger words especificas (`tif outfit`, `tifa lockhart`, `蒂法`, `zit3dtif`).
- Integracion con ComfyUI como nodo LoRA y con la plataforma RunningHub.
- Edicion de imagen condicionada por texto (`image-text-to-image`), segun el `pipeline_tag` declarado.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o video.

## Casos de uso

- Ilustracion de fan art: aplicar el LoRA sobre `krea2` en ComfyUI para generar ilustraciones consistentes de la personaje con su atuendo canonico, usando `tif outfit` y `tifa lockhart` como triggers.
- Contenido para cosplay y referencia de vestuario: el modo cosplay permite generar imagenes de referencia de como queda el atuendo de Tifa sobre distintos tipos de cuerpo y encuadres, util para cosplayers que preparan un traje.
- Prototipado de personajes para proyectos derivados: estudiar variaciones de diseno (peinado largo, guantes, suspensores, pendientes) manteniendo coherencia de identidad mediante un unico adaptador.
- Renderizado estilo CG para comparativas de estilo: usar `zit3dtif` para producir imagenes con acabado 3D y contrastarlas con las salidas realistas del mismo LoRA.
- Pruebas de pipelines de difusion en ComfyUI: servir como caso de prueba de carga de LoRA, gestion de trigger words y composicion de grafos de nodos en entornos de desarrollo.
- Generacion de material para comunidades de fan: producir imagenes para foros o redes centradas en Final Fantasy VII, siempre que se respete la licencia del modelo base y los derechos sobre la personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende enteramente del modelo base `krea2` y de la resolucion de salida, no del LoRA (218 MiB adicionales).
- GPU recomendadas: no disponible; al ser un adaptador sobre un modelo de difusion, los requisitos vienen determinados por `krea2`.
- Compatibilidad con GPU de consumo: no confirmada para este adaptador; depende del modelo base y de la cuantizacion aplicada a este.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub y su API.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-tifa-live-action-lora | LoRA de personaje | krea2 | 218 MiB (peso) | no aplica | no disponible | Hugging Face, RunningHub |
| LoRA de personaje de Civitai (categoria general) | LoRA de personaje | variable (SDXL, Flux, etc.) | variable | no aplica | variable por autor | Civitai |
| Modelo base krea2 | Modelo de difusion texto-imagen | no aplica | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No se declara licencia explicita: la model card remite a la licencia del proyecto original o upstream, lo que deja el uso comercial en una situacion juridica indeterminada.
- El modelo reproduce la imagen de un personaje con derechos de autor de Square Enix; su uso comercial o la generacion de contenido para terceros puede infringir derechos de propiedad intelectual.
- Las trigger words incluyen terminos de contenido sexual explicito (`underwear`, `panties`, `white panties`), lo que implica riesgo de generar contenido no apto y exige moderacion en cualquier despliegue publico.
- Riesgo de sobreajuste al rostro y atuendo de la personaje: puede degradar la diversidad de salidas y "contaminar" prompts no relacionados cuando se activa el LoRA.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de calidad o fidelidad.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria documentada.
- Dependencia total del modelo base `krea2`: sin el, el adaptador es inutilizable, y cualquier cambio de version del base puede romper la compatibilidad.
- No apto para tareas de texto, razonamiento, codigo o agentes; es exclusivamente un adaptador de generacion de imagenes.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-tifa-live-action-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079014638494257153
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo de referencia en Civitai: https://civitai.red/models/2257524/krea2andanimaandzit-tifa-lockhart-realistic-v3-pro?modelVersionId=3146142
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
