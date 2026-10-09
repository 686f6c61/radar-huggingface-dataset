# RunningHubAI/rh-liz-lora

## Resumen

rh-liz-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, atribuido al usuario Rodrigo Meza dentro de la plataforma RunningHub. No es un modelo de lenguaje: se trata de un peso adicional (adapter) que se carga sobre un modelo base de generacion/edicion de imagen para modificar su comportamiento, en este caso asociado a la palabra de activacion "liz". El pipeline declarado es `image-text-to-image` y los tags incluyen `comfyui` y `lora`, lo que indica que su uso previsto es dentro de flujos de trabajo de ComfyUI o de la propia plataforma RunningHub.

El autor indica que el LoRA ha sido afinado a partir de un modelo base identificado como "krea2". El repositorio contiene un unico fichero de pesos, `liz .safetensors` (con un espacio en el nombre), de 218 MiB, dentro de un repositorio de 0,2 GB. El modelo se publico el 9 de octubre de 2026 y no acumula descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de una publicacion reciente y practicamente sin trazabilidad de uso.

La relevancia de esta ficha es limitada pero concreta: sirve para documentar un adapter de bajo peso (218 MiB) pensado para personalizacion visual rapida en pipelines de difusion, y para dejar constancia de que la informacion publicada por el autor es muy escasa. No hay licencia explicita, no hay idiomas declarados, no hay benchmarks y no hay especificaciones tecnicas del entrenamiento mas alla del modelo base y la palabra de activacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo base de difusion identificado por el autor como "krea2"; el LoRA no define una arquitectura propia) |
| Parametros totales | no disponible (el fichero de pesos ocupa 218 MiB; en fp16 equivaldria a unos 114 M de parametros, estimacion no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de contexto de texto |
| Tipos de cuantizacion | no disponible (el unico peso publicado es `liz .safetensors`, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (los prompts suelen depender del modelo base y del tokenizador de texto asociado) |
| Licencia | no disponible; la model card indica que la publicacion la realiza RunningHub en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (fichero `liz .safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del adaptador ni del modelo base mas alla de la etiqueta "krea2" proporcionada por el autor. Un fichero LoRA de 218 MiB es, por convencion, un conjunto de matrices de bajo rango inyectadas en capas del modelo base; sin embargo, el autor no especifica en que capas se aplica el adapter, cual es el rango (rank) ni el valor de alpha. Tampoco se indica si el adaptador es de tipo LoRA clasico, LyCORIS, LoHa u otra variante, ni si incluye pesos de text encoder ademas de los del UNet o DiT.

Respecto a los datos de entrenamiento, no hay ninguna informacion publicada: se desconoce el numero de imagenes, la composicion del dataset, si hubo regularizacion con imagenes de clase, el numero de pasos, la tasa de aprendizaje o si se emplearon tecnicas de refuerzo o preferencia. Tampoco se documenta si el entrenamiento se realizo en la propia plataforma RunningHub, aunque la model card promociona esa funcionalidad (`https://www.runninghub.ai/page-model`). En consecuencia, cualquier afirmacion sobre el proceso de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Edicion de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, por lo que el flujo esperado es tomar una imagen de entrada mas un prompt y devolver una imagen modificada.
- Personalizacion mediante palabra de activacion: el token "liz" actua como trigger word para invocar el concepto aprendido por el LoRA.
- Integracion en ComfyUI: el tag `comfyui` indica compatibilidad con flujos de nodos de ComfyUI, donde el LoRA se cargaria con un nodo de carga de LoRA sobre el modelo base.
- Uso en la plataforma RunningHub: el autor indica que los pesos se pueden cargar en RunningHub y ofrece un enlace al modelo publico en esa plataforma.
- Generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling, function calling, agentes, modo thinking, audio o traduccion: no aplica; es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingues: no disponibles; el comportamiento frente a prompts en distintos idiomas dependera del text encoder del modelo base, no documentado en esta ficha.

## Casos de uso

- Consistencia de personaje en ilustracion: usar el LoRA con la palabra "liz" para generar variaciones de un mismo personaje en distintas poses y escenarios dentro de ComfyUI, manteniendo rasgos recurrentes entre imagenes de una misma serie.
- Retoque y edicion de retratos: aplicar el adaptador sobre una imagen de entrada para modificar atributos concretos (vestuario, iluminacion, estilo) sin reescribir la escena completa, aprovechando el pipeline image-text-to-image.
- Prototipado rapido de arte conceptual: en un estudio pequeno, generar variantes de un diseno de personaje para presentar al cliente antes de pasar a produccion 3D o ilustracion final.
- Creacion de assets para marketing: producir variaciones de una imagen de marca o de un personaje corporativo a partir de una referencia base, con el LoRA como capa de personalizacion sobre el modelo base.
- Contenido para redes sociales: generar imagenes con un estilo o personaje reconocible de forma consistente para publicaciones seriadas, siempre que la licencia final del modelo base y del adaptador lo permita.
- Experimentacion en investigacion sobre adaptadores: servir como caso de estudio de un LoRA de 218 MiB publicado sin documentacion tecnica, util para analizar como se distribuyen adaptadores de bajo peso en plataformas tipo RunningHub o Hugging Face.
- Automatizacion de flujos en ComfyUI: encadenar el LoRA en un grafo mayor (por ejemplo, generacion, upscaling y postproceso) mediante la API de ComfyUI, siempre que el modelo base "krea2" este disponible y su licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad, SSIM ni evaluaciones humanas) ni comparaciones con otros adaptadores. Tampoco se han encontrado resultados relevantes en la busqueda web: las consultas devolvieron unicamente contenido no relacionado con el modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato del autor. Al ser un adaptador, el consumo lo determina casi por completo el modelo base "krea2": el LoRA anade un coste marginal de memoria (del orden de cientos de MiB en funcion de la precision) sobre el modelo que se cargue.
- GPU recomendadas: no disponible. Dependera del modelo base y de la resolucion de imagen objetivo.
- Compatibilidad con GPU de consumo: no confirmada. Un adaptador de 218 MiB es ligero en si mismo, pero si el modelo base "krea2" requiere mas VRAM de la disponible en una GPU de consumo, el conjunto no cabra sin tecnicas de offload o cuantizacion del base.
- Opciones de despliegue: ComfyUI (indicado por los tags), la plataforma RunningHub y, potencialmente, cualquier runtime que cargue LoRA en safetensors sobre el modelo base. No se documenta soporte para llama.cpp, vLLM, TGI ni Ollama, que son herramientas de modelos de lenguaje y no aplican a este tipo de peso.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia, pasos de muestreo, resoluciones de entrenamiento ni tamanos de lote.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores comparables ni datos de rendimiento que permitan una comparacion rigurosa. La unica referencia disponible es el modelo base "krea2", del que no se detallan parametros, contexto, licencia ni disponibilidad en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-liz-lora | no disponible (peso de 218 MiB) | no aplica | no publicado | no disponible | Hugging Face y RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de licencia explicita: la model card remite al copyright del autor y a la licencia del proyecto original o upstream, sin especificar cual es. Esto impide determinar con seguridad si el uso comercial esta permitido.
- Riesgo legal por el modelo base: al ser un adaptador, su uso esta condicionado por la licencia de "krea2", que no se detalla en la informacion disponible.
- Cero trazabilidad de uso: 0 descargas y 0 likes en el momento de la publicacion, sin evaluaciones de terceros que permitan estimar su calidad real.
- Documentacion tecnica practicamente inexistente: no hay rango del LoRA, capas afectadas, alpha, pasos de entrenamiento ni composicion del dataset.
- Riesgo de sobreajuste al concepto entrenado: sin informacion sobre el dataset, no puede descartarse que el adaptador reproduzca rasgos concretos de las imagenes de entrenamiento, con las implicaciones que ello tiene si esas imagenes no eran libres.
- Sesgos: no documentados por el autor; en modelos de generacion de imagen es habitual que los sesgos del modelo base y del dataset de afinado se trasladen al resultado, especialmente en representacion de personas.
- Alucinacion visual: como cualquier modelo generativo de imagen, puede producir detalles anatomicos o de contexto incoherentes, especialmente en manos, texto dentro de la imagen y estructuras finas.
- Limitaciones de idioma: no se declaran idiomas soportados; el comportamiento ante prompts en castellano dependera del text encoder del modelo base.
- Nombre de fichero con espacio (`liz .safetensors`): puede provocar errores en scripts, rutas o herramientas de automatizacion que no escapen correctamente el espacio.
- Caveat para produccion: al no haber benchmarks ni garantias de licencia, no es recomendable integrar este adaptador en un pipeline comercial sin verificar previamente la licencia del modelo base y obtener autorizacion del autor.
- Los resultados de la busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo; consisten en contenido no relacionado y no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-liz-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2106805975759273986
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1996963389064785922
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Documentacion de pesos en castellano: no disponible
- Paper tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo adicional: no disponible
