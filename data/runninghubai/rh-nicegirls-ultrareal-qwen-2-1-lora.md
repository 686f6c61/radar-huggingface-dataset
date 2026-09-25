# RunningHubAI/rh-nicegirls-ultrareal-qwen-2.1-lora

## Resumen

rh-nicegirls-ultrareal-qwen-2.1-lora es un adaptador LoRA de generacion de imagenes publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje: no genera texto ni razona, sino que modifica el comportamiento de un modelo de difusion texto-a-imagen. El repositorio contiene un unico fichero de pesos de 76 MiB (`nicegirls_qwen12.safetensors`) y la model card indica que esta ajustado a partir del modelo base `qwen-image-2.1`. Su uso previsto son ComfyUI, la plataforma RunningHub y el propio Hub.

El repositorio ocupa 0,1 GB y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que se trata de una publicacion practicamente sin adopcion publica. La model card no documenta licencia, idiomas, rango del LoRA, valor de alpha, palabra de activacion ni datos de entrenamiento, y no incluye resultados de benchmarks. Existe una version con el mismo nombre en Civitai (`nicegirls_v2_qwen21.safetensors`, 76,05 MB en media precision), un espejo en Hugging Face bajo el usuario UnifiedHorusRA y variantes de la misma familia para otros modelos base, como Z-Image Turbo.

Su relevancia es acotada al ecosistema de imagen generativa: sirve como ejemplo de adaptador de bajo coste (menos de 100 MB) para especializar un modelo de difusion grande en un estilo concreto, en este caso retratos femeninos de aspecto ultrarrealista. La ausencia de documentacion tecnica y de licencia impide recomendarlo para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen. Modelo base declarado: `qwen-image-2.1` |
| Parametros totales | No disponible en la model card. El fichero de 76 MiB en fp16 equivale a un orden de magnitud de 38-40 millones de parametros (estimacion derivada del tamano del fichero, no confirmada por el autor) |
| Parametros activos | No aplica: no es un modelo MoE ni un adaptador disperso |
| Longitud de contexto | No disponible. Depende del codificador de texto y del proceso de difusion del modelo base `qwen-image-2.1`, no documentado en esta ficha |
| Tipos de cuantizacion | No disponible. El unico peso publicado esta en safetensors a media precision (fp16). No se han publicado variantes GGUF, int8 ni int4 |
| Idiomas soportados | No disponible. Las etiquetas del repositorio no declaran idiomas; el idioma de los prompts depende del modelo base |
| Licencia | No disponible. La model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del modelo base, sin especificar cual |
| Formato de pesos | safetensors (adaptador LoRA, media precision) |
| Modelo base | `qwen-image-2.1` |
| Fichero publicado | `nicegirls_qwen12.safetensors`, 76 MiB |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-to-image |
| Rango y alpha del LoRA | No disponible |
| Modulos objetivo (target modules) | No disponible |
| Palabra de activacion (trigger word) | No disponible en la model card |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para desplazar su distribucion de salida sin reentrenar los pesos originales. El modelo base declarado es `qwen-image-2.1`, un generador de imagenes a partir de texto; el adaptador no se puede usar de forma autonoma y requiere cargar dicho modelo base por separado. El fichero ocupa 76 MiB en media precision, lo que situa el adaptador en el rango de decenas de millones de parametros, un coste marginal frente a los miles de millones del modelo sobre el que se aplica.

La model card no especifica el rango, el alpha, los modulos objetivo, el optimizador, el numero de pasos, el tamano del dataset ni su composicion. Tampoco documenta tecnicas de alineacion del tipo RLHF o DPO, que en el caso de modelos de difusion se sustituirian por ajuste con preferencias humanas o filtrado de datos; no hay evidencia de que se hayan empleado. El autor remite a la plataforma RunningHub como entorno de entrenamiento y publicacion. En Civitai, la version equivalente se distribuye como `nicegirls_v2_qwen21.safetensors` en media precision con un tamano de 76,05 MB, coherente con el fichero del Hub.

## Capacidades

- Generacion de imagenes texto-a-imagen especializada en retratos femeninos de aspecto ultrarrealista, segun la descripcion del propio autor y el nombre de la familia (NiceGirls UltraReal).
- Modificacion del estilo y del realismo fotografico del modelo base `qwen-image-2.1` mediante la inyeccion del adaptador LoRA.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub y exposicion a traves de su API, segun los enlaces de la model card.
- Compatibilidad potencial con otras variantes de la familia y con el apilado de varios LoRA, aunque esto no esta documentado ni verificado por el autor.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling, function calling ni capacidades de agente. No es un modelo de lenguaje.
- No se documenta soporte multilingue de prompts, modo de razonamiento, salida de audio ni ninguna otra capacidad especial.

## Casos de uso

- Ilustracion de retratos para medios editoriales: generacion de imagenes de rostros con acabado fotografico para articulos, portadas o piezas de blog, usando el LoRA sobre `qwen-image-2.1` en ComfyUI y con control de semilla y prompt negativo para mantener coherencia entre ilustraciones.
- Creacion de personajes para videojuegos y narrativa visual: produccion de hojas de personaje (turnaround, expresiones, planos cortos) a partir de un mismo prompt base, aprovechando el adaptador para fijar un estilo de rostro consistente antes de pasarlo a un pipeline de modelado o de previsualizacion.
- Pruebas de concepto para fotografia y moda: generacion rapida de referencias de iluminacion, encuadre y estilismo antes de una sesion real, con el LoRA aportando el acabado ultrarrealista y el modelo base controlando la composicion.
- Aumento de datasets de vision por computador: sintesis de imagenes de rostros con variaciones de edad, iluminacion y encuadre para completar clases minoritarias en tareas de deteccion o segmentacion facial, siempre que la licencia lo permita (actualmente no esta clara).
- Prototipado de aplicaciones de generacion de imagenes: uso del adaptador como componente de estilo en una demo o MVP construido sobre ComfyUI y la API de RunningHub, con un coste de almacenamiento inferior a 100 MB por estilo.
- Creacion de contenido para redes sociales y marketing: generacion de imagenes de perfil o piezas promocionales con estetica de retrato, integradas en un flujo de ComfyUI que aplique plantillas de prompt y procesado posterior por lotes.
- Investigacion sobre adaptadores de bajo rango: analisis comparativo del efecto de un LoRA de ~76 MiB sobre un modelo de difusion, midiendo deriva de estilo, adherencia al prompt y perdida de diversidad frente al modelo base sin adaptador.
- Composicion con otros adaptadores: experimentacion con el apilado de este LoRA junto a otros de estilo o de composicion, ajustando pesos por nodo para equilibrar el acabado ultrarrealista con otras caracteristicas, con la advertencia de que el autor no documenta compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward, HPSv2 ni comparaciones humanas), y los resultados de busqueda consultados tampoco aportan evaluaciones cuantitativas. Tampoco se dispone de mediciones de latencia o throughput del adaptador ni del modelo base asociado.

## Requisitos de hardware

- VRAM del adaptador: despreciable. El fichero pesa 76 MiB, de modo que el incremento de memoria al cargar el LoRA es inferior a 0,1 GB en fp16.
- VRAM total de inferencia: no disponible. La determina integramente el modelo base `qwen-image-2.1`, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. El autor no publica recomendaciones de hardware ni en la model card ni en los resultados de busqueda consultados.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar si el modelo base cabe en tarjetas como la RTX 4090, la RTX 3090 o la RTX 4060 Ti sin consultar la documentacion del modelo base.
- Opciones de despliegue documentadas: ComfyUI, la plataforma RunningHub (interfaz web y API) y el propio Hugging Face. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas orientadas a difusion texto-a-imagen.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tiempo por imagen, imagenes por segundo ni comportamiento por lotes.

## Comparativa con modelos similares

| Modelo | Modelo base | Tamano del fichero | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-nicegirls-ultrareal-qwen-2.1-lora (este) | `qwen-image-2.1` | 76 MiB | safetensors | No disponible | Hugging Face, 0 descargas |
| NiceGirls UltraReal v2 Qwen2.1 (Civitai) | `qwen-image-2.1` | 76,05 MB (media precision) | safetensors | No disponible en la informacion consultada | Civitai |
| NiceGirls UltraReal (espejo UnifiedHorusRA) | No disponible por version | No disponible por subcarpeta | safetensors | No disponible en la informacion consultada | Hugging Face |
| NiceGirls UltraReal (Z-Image Turbo) | Z-Image Turbo | No disponible | No disponible | No disponible en la informacion consultada | RunningHub |
| Nice Girls Ultrareal QWEN (RunningHub) | Qwen (variante no especificada) | No disponible | No disponible | No disponible en la informacion consultada | RunningHub |

No se dispone de datos de rendimiento que permitan comparar la calidad de estas variantes entre si ni frente a adaptadores de terceros. La comparacion se limita, por tanto, a modelo base, tamano, formato y canal de distribucion.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a "la licencia del proyecto original o del modelo base" sin identificarla. Esto impide determinar si el uso comercial esta permitido y constituye un riesgo legal en cualquier despliegue en produccion.
- Contenido potencialmente sensible: el nombre de la familia (NiceGirls) y los terminos asociados apuntan a retratos femeninos que pueden derivar en contenido sugestivo o para adultos. Es responsabilidad del usuario verificar la adecuacion del contenido generado a la normativa aplicable y a las politicas de la plataforma de destino.
- Riesgo de uso indebido: la generacion de rostros realistas puede emplearse para crear imagenes de personas inexistentes o suplantaciones. Se deben aplicar medidas de etiquetado de contenido sintetico y respetar la normativa sobre deepfakes.
- Sesgos: no hay informacion disponible sobre la composicion del dataset de entrenamiento ni sobre sesgos de representacion en cuanto a etnia, edad, complexion corporal o diversidad de rasgos.
- Comportamiento no verificado: no se documentan la palabra de activacion, el rango, el alpha ni los modulos objetivo. Sin estos parametros, es probable que el adaptador no reproduzca el efecto esperado y haya que tantear los pesos manualmente.
- Adherencia al prompt y alucinacion visual: no se han publicado evaluaciones. En modelos de difusion el riesgo equivalente a la alucinacion es la generacion de artefactos anatomicos, manos deformes o incoherencias entre prompt e imagen, y no se puede descartar.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma. Requiere obtener `qwen-image-2.1` bajo su propia licencia, cuyos terminos pueden anadir restricciones adicionales.
- Idioma: no se declaran idiomas soportados. El comportamiento con prompts en castellano depende del codificador de texto del modelo base y no esta verificado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion, ni issues resueltos, ni comunidad que respalde el artefacto.
- Anomalia en los metadatos: la fecha de creacion registrada (2026-09-25) es posterior a la de la mayoria de lanzamientos conocidos, lo que sugiere un error de metadatos del repositorio.
- Ambiguedad de nomenclatura: el nombre del repositorio cita "qwen-2.1", mientras que la model card indica que el ajuste parte de `qwen-image-2.1`. Conviene confirmar el modelo base exacto antes de integrarlo, ya que un LoRA aplicado sobre un checkpoint incorrecto no produce resultados utiles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-nicegirls-ultrareal-qwen-2.1-lora
- Version en Civitai (NiceGirls UltraReal v2 Qwen2.1): https://civitai.com/models/1862761/nicegirls-ultrareal
- Espejo en Hugging Face (UnifiedHorusRA/NiceGirls_UltraReal): https://huggingface.co/UnifiedHorusRA/NiceGirls_UltraReal
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2102770201313271809
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1930617453192323074
- Variante Nice Girls Ultrareal QWEN en RunningHub: https://www.runninghub.ai/model/public/2035749169930964993
- Variante NiceGirls UltraReal (Z-image Turbo) en RunningHub: https://www.runninghub.ai/model/public/1996247248273022977
- Plataforma RunningHub: https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- README en chino (ruta relativa del repositorio): README_cn.md
