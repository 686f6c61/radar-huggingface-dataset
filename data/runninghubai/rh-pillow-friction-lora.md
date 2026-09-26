# RunningHubAI/rh-pillow-friction-lora

## Resumen

rh-pillow-friction-lora es un adaptador LoRA publicado por la cuenta RunningHubAI en Hugging Face, distribuido en un unico fichero safetensors de 148 MiB. Segun su model card, el adaptador se ha afinado a partir de un modelo base identificado como "minimax-h3" y esta pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. No es un modelo de lenguaje: es un adaptador de estilos/conceptos para un pipeline de generacion visual, por lo que la mayor parte de las metricas habituales de un LLM (contexto, parametros, benchmarks de texto) no aplican.

El repositorio es un paquete de pesos sin documentacion tecnica: no se especifican hiperparametros de entrenamiento, dataset, numero de pasos ni metodo de optimizacion. La model card se limita a indicar el tipo (LoRA), la plataforma de uso, el modelo base y una lista de palabras de activacion (trigger words) en chino, ademas de enlazar el proyecto original alojado en un espejo de Civitai. El propio autor declara que los derechos de copyright permanecen en el autor original y remite a la licencia del proyecto de origen.

Su relevancia es limitada y muy nicho: se trata de un adaptador orientado a contenido para adultos, con cero descargas y cero valoraciones en el momento de la consulta, sin ficha tecnica verificable y con una licencia sin definir. Para un desarrollador o investigador, el interes practico es casi exclusivamente como ejemplo del flujo de publicacion automatizada de LoRA dentro del ecosistema RunningHub/ComfyUI, no como componente reutilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base "minimax-h3"; arquitectura del base no disponible |
| Parametros totales | no disponible (el unico artefacto publicado es un safetensors de 148 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el contexto lo determina el modelo base) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero safetensors, sin variantes GGUF, fp8 ni cuantizadas |
| Idiomas soportados | no disponible; las palabras de activacion proporcionadas estan en chino |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`MM-H3 - Pillow Humping v2.safetensors`, 148 MiB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del adaptador ni del modelo base. Por el tipo declarado (LoRA) y por el ecosistema en el que se publica, se trata de una matriz de bajo rango que se inyecta en las capas de atencion (y posiblemente en las proyecciones) de un modelo generativo preentrenado, ajustando su comportamiento hacia un concepto concreto sin reentrenar el modelo completo. El fichero unico de 148 MiB es coherente con un adaptador de rango bajo sobre un modelo de difusion o de generacion de video de gran tamano, pero no es posible confirmar ni el rango, ni los modulos objetivo, ni el escalado recomendado.

Tampoco hay datos sobre el entrenamiento: se desconoce el numero de imagenes o clips, la composicion del dataset, el numero de pasos, la tasa de aprendizaje, el optimizador ni si se aplicaron tecnicas de regularizacion como caption dropout o tag pruning. No se menciona ningun uso de RLHF, DPO ni tecnicas de preferencia humana, algo que en cualquier caso no aplica a este tipo de adaptadores. El unico dato sobre el origen es que el modelo base declarado es "minimax-h3" y que el proyecto original se publico en un espejo de Civitai, con la version del adaptador etiquetada como "v2".

## Capacidades

- Generacion de imagenes o video condicionada por texto (text-to-image / text-to-video) a traves de un modelo base externo, no de forma autonoma.
- Especializacion en un concepto o pose concreta mediante palabras de activacion en chino, que deben incluirse en el prompt para activar el efecto del adaptador.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA, combinable con checkpoints, VAEs y otros LoRA del mismo base.
- Ejecucion en la plataforma RunningHub, tanto mediante la interfaz web como a traves de su API.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso, agentes ni planificacion.
- No dispone de capacidades multilingues en el sentido de comprension de texto; la unica evidencia linguistica son las palabras de activacion en chino.
- No se documenta ningun modo especial (thinking, vision, audio) mas alla de la generacion visual que aporta el modelo base.

## Casos de uso

- Pruebas de pipelines de generacion visual en ComfyUI: cargar el LoRA junto con el checkpoint base "minimax-h3" para verificar que el flujo de carga de adaptadores, el escalado de peso y la composicion de prompts funcionan correctamente antes de desplegar otros adaptadores.
- Evaluacion de la infraestructura de RunningHub: usar el modelo como caso de prueba para medir tiempos de aprovisionamiento, cola de ejecucion y coste de la API en un flujo real de generacion.
- Estudio del ecosistema de publicacion de LoRA: analizar como RunningHub reempaqueta y redistribuye adaptadores originalmente alojados en Civitai, incluyendo el tratamiento de licencias y atribucion.
- Generacion de material visual especializado para ilustracion de caracteres: el adaptador incorpora un concepto concreto activable por prompt, util para mantener consistencia de pose o composicion en una serie de imagenes.
- Investigacion sobre prompt engineering visual en chino: las palabras de activacion estan en chino, por lo que sirve para estudiar como responde el modelo base a instrucciones en ese idioma frente a traducciones al ingles.
- Integracion en herramientas de automatizacion de contenido para adultos, siempre que se respeten las politicas de la plataforma de destino y la legislacion aplicable sobre mayoria de edad y verificacion de contenido.
- Comparacion de adaptadores de bajo rango: al ser un fichero de 148 MiB, permite medir el impacto en VRAM y en tiempo de inferencia de un LoRA adicional frente a una generacion sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de prompts, consistencia temporal) ni comparaciones cuantitativas con otros adaptadores. Las unicas cifras publicas son el tamano del fichero (148 MiB) y el tamano del repositorio (0,2 GB).

## Requisitos de hardware

- El adaptador pesa 148 MiB, por lo que su coste de almacenamiento es despreciable; el requisito real de VRAM lo impone el modelo base "minimax-h3", cuyos requisitos no estan documentados en la informacion disponible.
- No se dispone de estimaciones de VRAM para inferencia, ni desglosadas por cuantizacion, porque no se publican variantes cuantizadas ni especificaciones del base.
- No se puede confirmar si cabe en GPU de consumo (RTX 3060, 4070, 4090). Depende exclusivamente del modelo base, que no se detalla.
- No se indican GPU recomendadas (A100, H100, L40S, etc.).
- Opciones de despliegue documentadas: ComfyUI, la plataforma RunningHub (web y API) y descarga directa desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- No hay datos de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables. La model card no ofrece metricas, y la comparacion con otros adaptadores publicados en RunningHub o en Civitai requeriria datos que no se han proporcionado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-pillow-friction-lora | no disponible (LoRA de 148 MiB) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| Modelo base "minimax-h3" | no disponible | no disponible | no disponible | no disponible |
| Otros LoRA de RunningHub | no disponible | no aplica | no disponible | RunningHub, Hugging Face |

## Limitaciones y advertencias

- Contenido para adultos: el proyecto original procede de un espejo de Civitai y el propio nombre del fichero apunta a contenido sexual explicito. Su uso en productos comerciales o en plataformas con politicas de contenido restrictivas puede suponer la retirada del servicio o el bloqueo de la cuenta.
- Licencia indefinida: no hay licencia explicita. La model card solo indica que el copyright permanece en el autor y que se siga la licencia del proyecto original, lo que deja en el aire si se permite uso comercial, redistribucion o modificacion. Sin una licencia clara, el uso en produccion es juridicamente arriesgado.
- Ausencia total de documentacion tecnica: se desconocen el modelo base exacto, el rango del LoRA, el peso recomendado en el prompt, la version del VAE y los hiperparametros de inferencia. Esto obliga a un ajuste por prueba y error.
- Dependencia estricta del base: el adaptador no funciona de forma autonoma; sin el checkpoint "minimax-h3" (o el que corresponda en la practica) los pesos son inutiles. No se indica donde obtenerlo ni su licencia.
- Riesgo elevado de resultados degradados: sin datos de entrenamiento ni evaluacion, pueden aparecer artefactos, sobreajuste al concepto, contaminacion de estilo en prompts no relacionados y degradacion de la coherencia anatomica o temporal.
- Idioma: las palabras de activacion estan en chino, por lo que un uso en otros idiomas requiere traduccion o transliteracion cuya eficacia no esta verificada.
- Senales de calidad nulas: cero descargas y cero valoraciones en el momento de la consulta. No hay evidencia de que el adaptador haya sido validado por terceros.
- Anomalia en las fechas: la ficha indica creacion y actualizacion el 26 de septiembre de 2026, con apenas un minuto de diferencia entre ambas. Conviene tratar las marcas temporales con cautela.
- Contenido promocional cruzado: la model card incluye enlaces promocionales a servicios de terceros (API de RunningHub, Seedance 2.5) sin relacion tecnica con el adaptador.
- Sin garantias de seguridad: no se documentan mecanismos de filtrado, marcas de agua ni verificacion de edad, responsabilidad que recae por completo en quien despliega el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-pillow-friction-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2089897837357293570
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Fuente original en Civitai (espejo): https://civitai.red/models/2870965/pillow-humping?modelVersionId=3243753
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub sitio para China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
