# RunningHubAI/rh-qwen-edit-2509-lora

## Resumen

`rh-qwen-edit-2509-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (autor identificado como KIWI en la plataforma RunningHub). No es un modelo base autonomo: se trata de un conjunto de pesos de bajo rango que se aplican sobre Qwen-Edit-2509, el modelo de edicion de imagenes de la familia Qwen, para especializarlo en una tarea concreta de transferencia y sustitucion de fondos (background replacement transfer). El repositorio contiene un unico fichero de pesos de 439 MiB en formato safetensors, dentro de un repo de 1,3 GB.

La relevancia de esta ficha es acotada: se trata de un artefacto de la comunidad orientado al ecosistema ComfyUI y a la plataforma comercial RunningHub, no de una release de un laboratorio con documentacion tecnica exhaustiva. La model card es minima y de caracter promocional, con enlaces a la API y al servicio de entrenamiento de RunningHub. No se publican detalles sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni metricas de evaluacion.

El caso de uso declarado es la sustitucion de fondos en imagenes con salida directa a resolucion 2K mediante el workflow correspondiente, con un peso de LoRA recomendado entre 0,8 y 1,0. Toda la informacion disponible sobre arquitectura, contexto y rendimiento del modelo base procede indirectamente de Qwen-Edit-2509 y no se detalla en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Edit-2509; arquitectura del modelo base no disponible en este repositorio |
| Parametros totales | no disponible (adaptador LoRA; el fichero de pesos ocupa 439 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`qwen-edit-2509-huanbeijing-19-14800.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Edit-2509 para modificar su comportamiento sin reentrenar todos los pesos. El nombre del fichero (`qwen-edit-2509-huanbeijing-19-14800`) sugiere un entrenamiento orientado a "huanbeijing" (cambio de fondo en pinyin) con un identificador de paso o configuracion de 14800, aunque el autor no documenta esta nomenclatura.

No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el regimen de entrenamiento (si hubo RLHF, DPO o ajuste supervisado), ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica indicacion operativa es el peso recomendado de LoRA (0,8 a 1,0) y la afirmacion de que el workflow asociado produce imagenes de 2K sin desenfoque.

## Capacidades

- Edicion de imagen condicionada por texto e imagen de entrada (pipeline `image-text-to-image`).
- Transferencia y sustitucion de fondos: el caso de uso declarado por el autor.
- Generacion de salida a resolucion 2K a traves del workflow de ComfyUI asociado, segun la model card.
- Integracion en ComfyUI como nodo de carga de LoRA sobre el modelo base Qwen-Edit-2509.
- Ejecucion en la plataforma RunningHub (local, internacional y China) y via API.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible mas alla de la propia edicion de imagen.

## Casos de uso

- sustitucion de fondos en fotografia de producto: aplicar el LoRA sobre Qwen-Edit-2509 en ComfyUI con una imagen de producto y una indicacion textual del nuevo fondo, generando la composicion a 2K para catalogos de e-commerce.
- Creacion de retratos con fondo controlado: partiendo de una foto de estudio, reemplazar el fondo por escenarios neutros o corporativos manteniendo al sujeto, util para fichas de equipo y materiales de marca.
- Prototipado de escenas para publicidad: generar variantes de una misma imagen con distintos entornos (interior, exterior, estudio) para presentar opciones a clientes antes de una produccion fotografica real.
- Preparacion de assets para redes sociales: adaptar una imagen base a formatos y fondos coherentes con una campana, reduciendo el trabajo manual de recorte y composicion.
- Automatizacion via API de RunningHub: invocar el flujo de edicion desde un pipeline propio para procesar lotes de imagenes con el mismo estilo de sustitucion de fondo.
- Experimentacion e investigacion aplicada en edicion de imagen: servir de punto de partida para estudiar el efecto del rango y el peso de LoRA (0,8-1,0) en la fidelidad de la sustitucion de fondos sobre Qwen-Edit-2509.
- Integracion en herramientas creativas internas: incorporar el adaptador en un editor basado en ComfyUI para que equipos de diseno apliquen cambios de fondo sin depender de un retocador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente del modelo base Qwen-Edit-2509 y de su cuantizacion, no del adaptador LoRA (439 MiB de pesos adicionales).
- GPU recomendadas: no disponibles en la informacion proporcionada. Al tratarse de un modelo de edicion de imagen de la familia Qwen, el requisito practico lo marca el modelo base y el runtime de difusion empleado.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en si es ligero, pero la viabilidad en GPUs de consumo depende del modelo base.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (local, internacional y China) y la API de RunningHub. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-edit-2509-lora | LoRA de edicion de imagen sobre Qwen-Edit-2509 | no disponible (pesos de 439 MiB) | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Qwen-Edit-2509 (modelo base) | Modelo de edicion de imagen | no disponible en este repositorio | no disponible | no disponible | Repositorio oficial de Qwen |
| Otros LoRA de edicion de imagen de la comunidad | Adaptadores LoRA | variable | no disponible | variable | Hugging Face, Civitai, ComfyUI |

No se dispone de datos de rendimiento ni de especificaciones tecnicas suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un adaptador de edicion de imagen, puede heredar los sesgos del modelo base y del dataset de entrenamiento, no publicados.
- Riesgo de alucinacion visual: en tareas de sustitucion de fondos pueden aparecer artefactos, bordes inconsistentes o elementos generados no solicitados, especialmente fuera del rango de peso recomendado (0,8-1,0).
- El autor afirma salida a 2K "sin desenfoque" solo en el contexto de su workflow; no hay verificacion independiente de esta afirmacion.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda condicionado a los terminos de Qwen-Edit-2509 y de la plataforma RunningHub. Es imprescindible verificar ambas antes de un despliegue en produccion.
- El repositorio no incluye informacion sobre idiomas soportados, contexto, cuantizacion ni requisitos de hardware, lo que dificulta la planificacion de un despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Dependencia total del modelo base Qwen-Edit-2509: cualquier cambio, retirada o restriccion de licencia del modelo base afecta directamente al adaptador.
- La model card tiene caracter promocional y enlaza a servicios comerciales de RunningHub; conviene tratar las afirmaciones de rendimiento con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-edit-2509-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2003401863649239041
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1897619470951800834
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card)
